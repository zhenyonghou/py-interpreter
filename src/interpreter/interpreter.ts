import * as AstTree from './ast-tree'
import {State, StateStack} from './state'
import {Scope, ScopeType} from './scope'
import {ModuleContext} from './eval-context'
import NodeEval from './node-eval'
import {Declaration, globalDeclaration} from './declaration'
import * as pyBuiltins from './python/builtins'
import { StepAttr } from './types'

class Interpreter {
    ast: AstTree.Node = null
    stateStack: StateStack = []

    nodeEval: NodeEval = null

    stepSleep: number = 0 // ms
    // 设置成静态变量吧
    static GlobalDeclaration: Declaration = globalDeclaration

    onDone: () => void
    onStayLine: (lineno: number) => void

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

    stepOver(cb: (hasNext: boolean) => void) {
        const self = this
        function nextStep() {
            const [state, nextState] = self._step()
            if ((state && self.checkDone(state)) || state == null) {
                self.onDone && self.onDone()
                return cb(false)
            }

            if (nextState && nextState.step == StepAttr.Stay) {
                if ("lineno" in nextState.node) {
                    // console.log("nextState.node:", nextState.node)
                    self.onStayLine && self.onStayLine(nextState.node.lineno)
                }
                return cb(true)
            }

            window.setTimeout(nextStep, 0)
        }
        nextStep()
    }

    stepInto() {

    }

    stepOut() {

    }

    run() {
        const self = this
        function nextStep() {
            const [state, nextState] = self._step()
            if ((state && self.checkDone(state)) || state == null) {
                self.onDone && self.onDone()
                return false
            }

            window.setTimeout(nextStep, self.stepSleep)
        }
        nextStep()
    }

    runWithStepOver() {
        const self = this
        function nextStep() {
            self.stepOver((hasNext: boolean) => {
                if (hasNext) {
                    window.setTimeout(nextStep, self.stepSleep)
                }
            })
        }
        nextStep()
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

export default Interpreter