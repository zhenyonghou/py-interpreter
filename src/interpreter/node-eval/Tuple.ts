import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {TupleContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {ConstantRet} from '../types'

const Tuple = {
    type: "Tuple",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Tuple
        const ctx = state.ctx as TupleContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (ctx.n_ <= node.elts.length) {
            if (ctx.n_ > 0) {
                const v = ScopeHelper.lookupX(state.scope, ctx.value_)
                ctx.list_.__push__(v)
            }

            if (ctx.n_ < node.elts.length) {
                return new State(node.elts[ctx.n_++], state.scope)
            } else {
                ss.pop()
                ss[ss.length - 1].ctx.value_ = new ConstantRet(ctx.list_)
                evalEnd(state)
                return
            }
        }
    }
}

export default Tuple