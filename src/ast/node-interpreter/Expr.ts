import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {ExprContext} from '../interpret-context'
import { BaseInterpreter } from './__base'

class Expr extends BaseInterpreter {
    type = AstTree.NodeType.Expr
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Expr
        const ctx = state.ctx as ExprContext
        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            ss.push(new State(node.value, state.scope))
            return
        }

        ss.pop()
    }
}

export default Expr