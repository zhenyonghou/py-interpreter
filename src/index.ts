import * as AstTree from './ast-tree'
import {State, StateStack} from './state'
import {Scope, ScopeType} from './scope'
import {ModuleContext} from './eval-context'
import NodeEval from './node-eval'
import {Declaration, globalDeclaration} from './declaration'
import * as pyBuiltins from './python/builtins'
import { KV, StepAttr } from './types'
import {ITimer, Timer, TimerStatus} from './timer'
import { MetaClass, MetaFunction } from './ast-tree/virtual-node'

class StepInterpreter {
    protected ast: AstTree.Node = null
    protected stateStack: StateStack = []
    protected nodeEval: NodeEval = null

    private stepIdle: boolean = true

    public onStep: (hasNext: boolean, lineno: number) => void
    public onError: (msg: string, lineno: number) => void

    // 设置成静态变量吧
    public static GlobalDeclaration: Declaration = globalDeclaration

    constructor() {
        // console.log('PI VERSION:', process.env.VERSION)
        this.nodeEval = new NodeEval()
        this.nodeEval.init()

        // load builtins
        Interpreter.GlobalDeclaration.setWithSets(pyBuiltins)
    }

    public resetWithAst(ast: AstTree.Node) {
        this.ast = ast
        this.reset()
    }

    public reset() {
        const scope = new Scope(ScopeType.Function, null)
        this.stateStack = [new State(this.ast, scope)]
    }

    protected _step() {
        const ss = this.stateStack
        const state = ss[ss.length - 1]
        if (!state) {
            return [null, null]
        }
        
        const nodeEval = this.nodeEval.getEval(state.node.type)
        if (!nodeEval) {
            throw new Error(`缺少实现:${state.node.type}`)
        }

        const nextState = nodeEval.eval(ss, state)
        if (nextState) {
            ss.push(nextState)
        }

        return [state, nextState]
    }

    /**
     * 为了避免堵塞，stepOver里使用了setTimeout，但又会和外面的Timer冲突，导致代码执行顺序不可控。所以加了状态stepIdle, 防重入.
     * 外面执行Timer.do里在调用stepOver前需要判断解释器是否执行完。
     */
    public stepOver() {
        if (!this.stepIdle) {
            return
        }

        this.stepIdle = false
        const self = this
        function nextStep() {
            let state, nextState
            try {
                [state, nextState] = self._step()
            } catch(err) {
                let lineno = -1
                if (nextState) {
                    if ("lineno" in nextState.node) {
                        lineno = nextState.node.lineno
                    }
                }
                self.onError(err.toString(), lineno)
                self.stepIdle = true
                return
            }

            if ((state && self.checkDone(state)) || state == null) {
                self.onStep(false, -1)
                self.stepIdle = true
                return
            }

            if (nextState && nextState.step == StepAttr.Stay) {
                let lineno = -1
                if ("lineno" in nextState.node) {
                    lineno = nextState.node.lineno
                }

                self.onStep(true, lineno)
                self.stepIdle = true
                return
            }

            window.setTimeout(nextStep, 0)
            // nextStep()
        }
        nextStep()
    }

    // 截获Python程序print函数，print时会调用到这里
    public setOutput(fn: (...arg: any[]) => void) {
        pyBuiltins.__output.print = fn
    }

    // 判断结束
    protected checkDone(state: State) {
        const node = state.node
        if (node.type == "Module" && (state.ctx as ModuleContext).done_) {
            // pyBuiltins.print("程序执行结束")
            console.log("程序执行结束")
            return true
        }
        return false
    }

    /**
     * 
     * TODO: 设置收集层级
     */
    protected collectVariablesWithMap() {
        const ret = new Map()
        if (this.stateStack.length == 0) {
            return ret
        }

        const state = this.stateStack[this.stateStack.length - 1]
        let scope = state.scope

        while(true) {
            scope.declaration.forEach((key: string, v: any) => {
                ret.set(key, v)
            })

            if (scope.type == ScopeType.Function) {
                break
            }
            scope = scope.parent
        }
        return ret
    }

    public collectVariables() {
        const variablesMap = this.collectVariablesWithMap()
        let arr = []
        for (let [key, value] of variablesMap) {
            if (key == "self") {
                continue
            }

            const kv: KV = {
                key: key,
            }

            if (value instanceof pyBuiltins._list 
                || value instanceof pyBuiltins._dict 
                || value instanceof pyBuiltins._tuple
                || value instanceof pyBuiltins._str) {
                kv.value = value.toString()
            } else if (value instanceof MetaClass || value instanceof MetaFunction) {
                continue
            } else if (value instanceof Object) {
                continue
            } else {
                kv.value = value
            }

            arr.push(kv)
        }
        return arr
    }
}

class Interpreter extends StepInterpreter {
    /**
     * 在调用run或runWithOver时候才会使用
     */
    public timer: ITimer = null

    /**
     * 在Interpreter里请使用以下几个callback，而不要使用StepInterpreter里的callback
     */
    onDone: () => void
    onStay: (lineno: number) => void
    onFail: (errMsg: string) => void

    constructor() {
        super()

        this.onStep = (hasNext: boolean, lineno: number) => {
            if (hasNext) {
                this.onStay && this.onStay(lineno)
            } else {
                this.onDone && this.onDone()
                this.timer.stop()
            }
        }

        this.onError = (errMsg: string, lineno: number) => {
            this.onFail && this.onFail(errMsg)
            this.timer.stop()
        }
    }

    setTimer(timer: ITimer) {
        this.timer = timer
    }

    run() {
        // 如果没有设置_timer, 就用默认的timer
        if (this.timer == null) {
            this.timer = new Timer(0)
        }
        
        this.timer.do = () => {
            let state, nextState
            try {
                [state, nextState] = this._step()
            } catch(err) {
                // let lineno = -1
                // if ("lineno" in nextState.node) {
                //     lineno = nextState.node.lineno
                // }
                console.error(err.toString())
                this.onFail && this.onFail(err.toString())
                this.timer.stop()
            }
            if ((state && this.checkDone(state)) || state == null) {
                this.onDone && this.onDone()

                this.timer.stop()
            }
        }

        this.timer.start()
    }

    runWithOver() {
        // 如果没有设置_timer, 就用默认的timer
        if (this.timer == null) {
            this.timer = new Timer(0)
        }
        
        this.timer.do = () => {
            this.stepOver()
        }
        this.timer.start()
    }
}

export {StepInterpreter, Interpreter, Timer, TimerStatus}