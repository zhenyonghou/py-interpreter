import * as AstTree from './ast-tree'
import {State, StateStack} from './state'
import {Scope, ScopeType} from './scope'
import {ModuleContext} from './eval-context'
import NodeEval from './node-eval'
import {Declaration, globalDeclaration} from './declaration'
import * as pyBuiltins from './python/builtins'
import { StepAttr } from './types'
import {Timer, TimerStatus} from './timer'

class Interpreter {
    ast: AstTree.Node = null
    stateStack: StateStack = []

    nodeEval: NodeEval = null

    _timer: Timer = null

    interval: number = 0 // ms
    // 设置成静态变量吧
    static GlobalDeclaration: Declaration = globalDeclaration

    onDone: () => void
    onStay: (lineno: number) => void
    onError: (errMsg: string) => void

    constructor() {
        console.log('PI VERSION:', process.env.VERSION)
        this.nodeEval = new NodeEval()
        this.nodeEval.init()

        // load builtins
        Interpreter.GlobalDeclaration.setWithSets(pyBuiltins)
    }

    init(ast: AstTree.Node) {
        this.reset(ast)
    }

    reset(ast: AstTree.Node) {
        this.ast = ast
        const scope = new Scope(ScopeType.Function, null)
        this.stateStack = [new State(this.ast, scope)]
    }

    _step() {
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

    stepOver(cb: (hasNext: boolean, lineno: number) => void, error: (msg: string, lineno: number) => void) {
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
                console.error(err.toString())
                return error(err.toString(), lineno)
            }

            if ((state && self.checkDone(state)) || state == null) {
                return cb(false, -1)
            }

            if (nextState && nextState.step == StepAttr.Stay) {
                let lineno = -1
                if ("lineno" in nextState.node) {
                    lineno = nextState.node.lineno
                }

                return cb(true, lineno)
            }

            window.setTimeout(nextStep, 0)
        }
        nextStep()
    }

    stepInto() {
        // todo
    }

    stepOut() {
        // todo
    }

    run() {
        this._timer = new Timer(this.interval)
        this._timer.do = () => {
            let state, nextState
            try {
                [state, nextState] = this._step()
            } catch(err) {
                // let lineno = -1
                // if ("lineno" in nextState.node) {
                //     lineno = nextState.node.lineno
                // }
                console.error(err.toString())
                this.onError && this.onError(err.toString())
            }
            if ((state && this.checkDone(state)) || state == null) {
                this.onDone && this.onDone()

                this._timer.stop()
            }
        }

        this._timer.start()
    }

    runWithOver() {
        this._timer = new Timer(this.interval)
        this._timer.do = () => {
            this.stepOver((hasNext: boolean, lineno: number) => {
                if (hasNext) {
                    this.onStay && this.onStay(lineno)
                } else {
                    this.onDone && this.onDone()
                    this._timer.stop()
                }
            }, (errMsg: string, lineno: number) => {
                this.onError && this.onError(errMsg)
                this._timer.stop()
            })
        }
        this._timer.start()
    }

    // 截获Python程序print函数，print时会调用到这里
    setOutput(fn: (...arg: any[]) => void) {
        pyBuiltins.__output.print = fn
    }

    // 判断结束
    checkDone(state: State) {
        const node = state.node
        if (node.type == "Module" && (state.ctx as ModuleContext).done_) {
            // pyBuiltins.print("程序执行结束")
            console.log("程序执行结束")
            return true
        }
        return false
    }
}

export {Interpreter, Timer, TimerStatus}