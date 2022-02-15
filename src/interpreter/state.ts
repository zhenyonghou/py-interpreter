import * as AstTree from './ast-tree'
import {Scope} from './scope'
import {createContext} from './eval-context'
import {BaseEvalContext} from './eval-context'

class State {
    node: AstTree.Node
    scope: Scope
    ctx: BaseEvalContext    // 记录当前node运行时数据

    constructor(node: AstTree.Node, scope: Scope, context: BaseEvalContext = null) {
        this.node = node,
        this.scope = scope
        this.ctx = context || createContext(node)
    }
}

type StateStack = Array<State>

export {State, StateStack}