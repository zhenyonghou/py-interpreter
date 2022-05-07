import * as AstTree from './ast/ast-node'
import {Scope} from './scope/scope'
import {createContext} from './ast/interpret-context'
import {BaseEvalContext} from './ast/interpret-context'

class State {
    node: AstTree.Node = null
    scope: Scope = null
    ctx: BaseEvalContext = null    // 记录当前node运行时数据

    constructor(node: AstTree.Node, scope: Scope, ctx: BaseEvalContext = null) {
        this.node = node
        this.scope = scope
        this.ctx = ctx ? ctx : createContext(node)
    }
}

type StateStack = Array<State>

export {State, StateStack}