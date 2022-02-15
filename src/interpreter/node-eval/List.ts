import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {ListContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {ConstantRet} from '../types'

const List = {
    type: "List",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.List
        const ctx = state.ctx as ListContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (ctx.n_ <= node.elts.length) {
            if (ctx.n_ > 0) {
                const v = ScopeHelper.lookupX(state.scope, ctx.value_)
                ctx.list_.push(v)
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

export default List