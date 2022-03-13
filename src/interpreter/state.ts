import * as AstTree from './ast-tree'
import {Scope} from './scope'
import {createContext} from './eval-context'
import {BaseEvalContext} from './eval-context'
import {StepAttr} from './types'

class State {
    node: AstTree.Node = null
    scope: Scope = null
    step: StepAttr = StepAttr.Go
    ctx: BaseEvalContext = null    // 记录当前node运行时数据

    constructor(node: AstTree.Node, scope: Scope, step: StepAttr = StepAttr.Go) {
        this.node = node
        this.scope = scope
        this.step = step
        this.ctx = createContext(node)
    }
}

type StateStack = Array<State>

export {State, StateStack}