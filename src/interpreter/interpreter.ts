import * as AstTree from '../ast/ast-node'
import { State, StateStack } from '../state'
import { Scope, ScopeType } from '../scope/scope'
import { NodeInterpreterSets } from '../ast/node-interpreter-sets'
import { Declaration } from '../scope/declaration'
import * as pyBuiltins from '../python/builtins'
import VariablesCollecter from '../external/variables-collecter'
import { Debugger, DebuggerCommand } from '../external/debugger'

class Interpreter {
    protected ast: AstTree.Node = null
    protected rootScope: Scope = null
    protected stateStack: StateStack = []
    protected nodeInterpreterSets: NodeInterpreterSets = null

    public debugger: Debugger = new Debugger()

    // stepOne调用结束之后要判断idle是否为ture，为true时停止再次调用stepOne
    private idle: boolean = false

    // 正在执行的标记，用于防止执行重入
    private stepping: boolean = false

    public done: boolean = false

    // Module begin时触发
    public whenBegin: () => void

    // step时回调, debugger里判断何时应当stay
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

        this.stateStack = [new State(this.ast, scope)]
        this.rootScope = scope

        this.variablesCollecter = new VariablesCollecter(this.stateStack, 1)

        this.debugger.reset()
        this.done = false
    }

    public registerDeclare(name: string, fn: any) {
        this.externalDeclare.set(name, fn)
    }

    public clearRegistered() {
        this.externalDeclare.clear()
    }

    protected stepOne() {
        this.nodeInterpreterSets.interpret(
            this.stateStack,
            this.onNodeBegin.bind(this),
            this.onNodeInterrupt.bind(this),
            this.onNodeEnd.bind(this))
    }

    /**
     * 为了避免堵塞，stepOver里使用了setTimeout，但又会和外面的Timer冲突，导致代码执行顺序不可控。所以加了状态stepIdle, 防重入.
     * 外面执行Timer.do里在调用stepOver前需要判断解释器是否执行完。
     */
    public stepOver() {
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

    private onNodeBegin(ty: AstTree.NodeType, node: AstTree.Node): boolean {
        if (ty == AstTree.NodeType.Module) {
            this.whenBegin && this.whenBegin()
        }

        const shouldStay = this.debugger.checkNodeBegin(ty, node)
        if (shouldStay) {
            this.idle = true
            this.whenStep(this.debugger.lineNo, ty)
            return false
        }
        return true
    }

    private onNodeInterrupt(ty: AstTree.NodeType, node: AstTree.Node) {
        this.debugger.checkNodeInterrupt(ty, node)
        this.idle = true
        this.whenStep(this.debugger.lineNo, ty)
    }

    private onNodeEnd(ty: AstTree.NodeType) {
        if (ty == AstTree.NodeType.Module) {
            this.debugger.lineNo = -1
            this.done = true
            this.whenDone && this.whenDone()
        }
    }
}

export default Interpreter