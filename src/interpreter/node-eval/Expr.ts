import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {ExprContext} from '../eval-context'

const Expr = {
    type: "Expr",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Expr
        const ctx = state.ctx as ExprContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            return new State(node.value, state.scope)
        }

        ss.pop()
        evalEnd(ss.length, state)
    }
}

export default Expr