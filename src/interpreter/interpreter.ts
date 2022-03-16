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

    stepDelay: number = 0 // ms
    // 设置成静态变量吧
    static GlobalDeclaration: Declaration = globalDeclaration

    onDone: () => void
    onStep: (lineno: number) => void

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

    step() {
        const ss = this.stateStack
        const state = ss[ss.length - 1];
        if (!state) {
            return false;
        }

        // console.log('state:', state)
        const nodeEval = this.nodeEval.getEval(state.node.type)
        if (!nodeEval) {
            throw new Error(`缺少实现:${state.node.type}`)
        }
        const nextState = nodeEval.eval(ss, state)
        if (nextState) {
            ss.push(nextState)
        }

        if (this.checkDone(state)) {
            this.onDone && this.onDone()
            return false
        }

        return true
    }

    _step() {
        const ss = this.stateStack
        const state = ss[ss.length - 1];
        if (!state) {
            return [true, null];
        }

        const nodeEval = this.nodeEval.getEval(state.node.type)
        if (!nodeEval) {
            throw new Error(`缺少实现:${state.node.type}`)
        }
        const nextState = nodeEval.eval(ss, state)
        if (nextState) {
            ss.push(nextState)
        }

        const done = this.checkDone(state)
        return [done, nextState]
    }

    stepOver() {
        while(true) {
            const [done, nextState] = this._step()
            if (done) {
                this.onDone && this.onDone()
                return false
            }

            if (nextState && nextState.step == StepAttr.Stay) {
                if ("lineno" in nextState.node) {
                    // console.log("nextState.node:", nextState.node)
                    this.onStep && this.onStep(nextState.node.lineno)
                }
                return true
            }
        }
    }

    stepInto() {

    }

    stepOut() {

    }

    run() {
        const self = this
        function nextStep() {
            if (self.step()) {
                // window.setTimeout(nextStep, 0)   // 线上使用
                nextStep()   // 为调试方便
            }
        }
        nextStep()
    }

    runWithStepOver() {
        const self = this
        function nextStep() {
            if (self.stepOver()) {
                window.setTimeout(nextStep, self.stepDelay)   // 线上使用
                // nextStep()   // 为调试方便
            }
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
        if (node.type == AstTree.NodeType.Module && (state.ctx as ModuleContext).done_) {
            // pyBuiltins.print("程序执行结束")
            console.log("程序执行结束")
            return true
        }
        return false
    }
}

export default Interpreter