import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {evalBegin, evalEnd} from '../utils'
import {SliceContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { _slice } from '../python/builtins'

const Slice = {
    type: "Slice",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Slice
        const ctx = state.ctx as SliceContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.lowerDone_) {
            ctx.lowerDone_ = true
            const [nextState, nodeValue] = newState(node.lower, state.scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        if (!ctx.upperDone_) {
            ctx.upperDone_ = true
            ctx.lowerValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
            const [nextState, nodeValue] = newState(node.upper, state.scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        if (!ctx.stepDone_) {
            ctx.stepDone_ = true
            ctx.upperValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
            if (node.step != null) {
                const [nextState, nodeValue] = newState(node.step, state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            }
        }

        if (node.step != null) {
            ctx.stepValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new _slice(ctx.lowerValue_, ctx.upperValue_, ctx.stepValue_)
        evalEnd(state)
    }
}

export default Slice