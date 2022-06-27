import * as AstTree from './ast/ast-node'
import {Scope} from './scope/scope'
import {createContext} from './ast/interpret-context'
import {BaseEvalContext} from './ast/interpret-context'

export class State {
    node: AstTree.Node = null
    scope: Scope = null
    ctx: BaseEvalContext = null    // 记录当前node运行时数据

    constructor(node: AstTree.Node, scope: Scope, ctx: BaseEvalContext = null) {
        this.node = node
        this.scope = scope
        this.ctx = ctx ? ctx : createContext(node)
    }
}

export class StateStack {
    arr: Array<State> = []

    public reset(...items: State[]) {
        this.arr = items
    }

    // 从栈顶取一个元素
    public top() : State {
        return this.arr[this.arr.length - 1]
    }

    public push(...items: State[]) {
        this.arr.push(...items)
    }

    public pop() :State {
        return this.arr.pop()
    }

    public setTopCtxValue(v: any) {
        this.arr[this.arr.length - 1].ctx.value_ = v
    }

    public setTopCtxControl(v: any) {
        this.arr[this.arr.length - 1].ctx.control_ = v
    }

    public setTopCtxReturn(v: any) {
        this.arr[this.arr.length - 1].ctx.returnData_ = v
    }

    public isEmpty() : boolean{
        return this.arr.length == 0
    }

    public in(ty: AstTree.NodeType, fromTop: number = 0): boolean {
        for (let i = this.arr.length - 1 - fromTop; i >= 0; i--) {
            const _ty = this.arr[i].node.type
            if (_ty == ty) {
                return true
            }
        }
        return false
    }
}
