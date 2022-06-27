import * as AstTree from '../ast/ast-node'
import { State, StateStack } from '../state'
import { Scope, ScopeType } from '../scope/scope'
import { NodeInterpreterSets } from '../ast/node-interpreter-sets'
import { ModuleContext } from '../ast/interpret-context'
import { Declaration } from '../scope/declaration'
import * as pyBuiltins from '../python/builtins'
import VariablesCollecter from '../external/variables-collecter'
import { Debugger, DebuggerCommand } from '../external/debugger'
import { buildFunctionRunner } from '../ast/node-interpreter/node-eval-utils/function-run-helper'
import { _assert } from '../common/functions'

class Interpreter {
    protected ast: AstTree.Node = null
    protected rootScope: Scope = null
    protected stateStack: StateStack = new StateStack()
    protected nodeInterpreterSets: NodeInterpreterSets = null

    public debugger: Debugger = new Debugger()

    // stepOne调用结束之后要判断idle是否为ture，为true时停止再次调用stepOne
    private idle: boolean = false

    // 正在执行的标记，用于防止执行重入
    private stepping: boolean = false

    public done: boolean = false

    private scanConter: number = 0

    // private interpretKeyStack: Array<AstTree.NodeType> = []

    // Module begin时触发
    public whenBegin: () => void

    // step时回调, 何时应当step是在debugger里判断的
    public whenStep: (lineno: number, ty: AstTree.NodeType) => void

    // 程序执行结束时回调
    public whenDone: () => void

    // 出错时回调
    public whenError: (msg: string, lineno: number) => void

    /**
     * builtins定义
     * 想设置成静态变量，但是在异步加载该库时，静态变量不如成员变量方便操作
     */
    protected builtinsDeclare: Declaration = new Declaration()

    /**
     * 外部函数预定义
     * 想设置成静态变量，但是在异步加载该库时，静态变量不如成员变量方便操作
     */
    protected externalDeclare: Declaration = new Declaration()

    // 变量收集器
    public variablesCollecter: VariablesCollecter = null

    constructor() {
        this.nodeInterpreterSets = new NodeInterpreterSets()
        this.nodeInterpreterSets.init()

        // load builtins
        this.builtinsDeclare.setWithSets(pyBuiltins)
    }

    public resetWithAst(ast: AstTree.Node) {
        this.ast = ast
        this.reset()
    }

    public reset() {
        // 安全防护，检查当前域名
        const currentHost = window.location.host
        if (!currentHost.includes('wat') && !currentHost.includes('cal')) {  // imwatt or localhost
            return
        }

        const scope = new Scope(ScopeType.Function, null)
        scope.addExternal(this.builtinsDeclare, this.externalDeclare)

        this.stateStack.reset(new State(this.ast, scope))
        this.rootScope = scope

        this.variablesCollecter = new VariablesCollecter(this.stateStack, 1)

        this.debugger.reset()
        this.done = false
        this.scanConter = 0

        this.preInterpret()
    }

    public registerDeclare(name: string, fn: any) {
        this.externalDeclare.set(name, fn)
    }

    public clearRegistered() {
        this.externalDeclare.clear()
    }

    /**
     * 解释之前预先加载上function和class
     */
    public preInterpret() {
        this.scanConter++
        const self = this
        function fn() {
            const state = self.stateStack.top()
            const ty = state.node.type

            if (ty == AstTree.NodeType.Module
                || ty == AstTree.NodeType.FunctionDef) {    // 预处理期间仅处理函数，不处理类了，因为类比较复杂，似乎也没必要
                    self.nodeInterpreterSets.interpret(
                        self.stateStack,
                        self.onEnterNode.bind(self),
                        self.onNodeInternalStep.bind(self),
                        self.onExitNode.bind(self))
            } else {
                self.stateStack.pop()
            }

            if (ty == AstTree.NodeType.Module && (state.ctx as ModuleContext).done_) {
                return
            }

            fn()
        }
        fn()

        // 在结尾处清理
        this.stateStack.reset(new State(this.ast, this.rootScope))
        this.scanConter ++
    }

    /**
     * 
     * 调用场景:
     * js调用python回调函数时
     */
    public executeCallbackFunction(func: AstTree.MetaFunction, ...args: any[]) {
        const state = buildFunctionRunner(args, null, func)
        this.stateStack.push(state)
        this.done = false
    }

    protected stepOne() {
        this.nodeInterpreterSets.interpret(
            this.stateStack,
            this.onEnterNode.bind(this),
            this.onNodeInternalStep.bind(this),
            this.onExitNode.bind(this))
    }

    /**
     * 为了避免堵塞，stepOver里使用了setTimeout，但又会和外面的Timer冲突，导致代码执行顺序不可控。所以加了状态stepIdle, 防重入.
     * 外面执行Timer.do里在调用stepOver前需要判断解释器是否执行完。
     */
    public stepOver() {
        if (this.scanConter == 0) {
            this.preInterpret()
        }

        if (this.done) {
            return
        }

        if (this.stepping) {
            return
        }

        this.stepping = true
        this.idle = false

        const self = this
        function nextStep() {
            try {
                self.stepOne()
            } catch (err) {
                self.whenError(err.toString(), self.debugger.lineNo)
                self.stepping = false
                return
            }

            if (self.done) {
                self.stepping = false
                return
            }

            if (self.idle) {
                self.stepping = false
                return
            }

            window.setTimeout(nextStep, 0)
        }
        nextStep()
    }

    // 截获Python程序print函数，print时会调用到这里
    public setOutput(fn: (...arg: any[]) => void) {
        pyBuiltins.__output.print = fn
    }

    private onEnterNode(node: AstTree.Node): boolean {
        const ty = node.type
        if (this.scanConter == 1) {
            return true
        }

        if (ty == AstTree.NodeType.Module) {
            this.whenBegin && this.whenBegin()
        }

        if (ty == AstTree.NodeType.FunctionDef || ty == AstTree.NodeType.Assign) {
            if (this.stateStack.in(AstTree.NodeType.ClassDef)) {
                return false
            }
        }

        const shouldStay = this.debugger.checkNodeBegin(ty as AstTree.NodeType, node)
        if (shouldStay) {
            this.idle = true
            this.whenStep(this.debugger.lineNo, ty as AstTree.NodeType)
            return false
        }
        return true
    }

    private onNodeInternalStep(ty: AstTree.NodeType, node: AstTree.Node) {
        _assert(ty === node.type)
        if (this.scanConter == 1) {
            return
        }

        this.debugger.checkNodeInternalStep(ty, node)
        this.idle = true
        this.whenStep(this.debugger.lineNo, ty)
    }

    private onExitNode(node: AstTree.Node) {
        if (this.scanConter == 1) {
            return
        }
        if (node.type == AstTree.NodeType.Module) {
            this.debugger.lineNo = -1
            this.done = true
            this.whenDone && this.whenDone()
        }
    }
}

export default Interpreter