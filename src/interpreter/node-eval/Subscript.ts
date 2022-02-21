import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {SubscriptContext} from '../eval-context'
import {SubscriptRet} from '../types'
import ScopeHelper from '../scope-helper'
import { _slice, _list } from '../python/builtins'

const Subscript = {
    type: "Subscript",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Subscript
        const ctx = state.ctx as SubscriptContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            return new State(node.value, state.scope)
        }

        if (!ctx.sliceDone_) {
            ctx.sliceDone_ = true
            ctx.subscriptValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
            return new State(node.slice, state.scope)
        }

        let sliceValue: any = null
        // slice类型的话，直接取值
        if (ctx.value_ instanceof _slice) {
            sliceValue = ctx.value_
        } else {
            sliceValue = ScopeHelper.lookupX(state.scope, ctx.value_)
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new SubscriptRet(ctx.subscriptValue_, sliceValue)
        evalEnd(state)
    }
}

export default Subscript