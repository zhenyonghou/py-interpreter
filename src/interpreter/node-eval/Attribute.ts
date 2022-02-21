import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {AttributeContext} from '../eval-context'
import {AttributeRet} from '../types'
import ScopeHelper from '../scope-helper'

const Attribute = {
    type: "Attribute",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Attribute
        const ctx = state.ctx as AttributeContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            return new State(node.value, state.scope)
        }

        ctx.attributeValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new AttributeRet(ctx.attributeValue_, node.attr)
        evalEnd(state)
    }
}

export default Attribute