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
            evalBegin(ss.length, state)
        }

        if (!ctx.lowerDone_) {
            ctx.lowerDone_ = true

            if (node.lower != null) {
                const [nextState, nodeValue] = newState(node.lower, state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            }
        }

        if (node.lower != null) {
            ctx.lowerValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        } else {
            ctx.lowerValue_ = 0
        }

        if (!ctx.upperDone_) {
            ctx.upperDone_ = true
            if (node.upper != null) {
                const [nextState, nodeValue] = newState(node.upper, state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            }
        }

        if (node.upper != null) {
            ctx.upperValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        } else {
            ctx.upperValue_ = null
        }

        if (!ctx.stepDone_) {
            ctx.stepDone_ = true
            if (node.step != null) {
                const [nextState, nodeValue] = newState(node.step, state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            }
        }

        if (node.step != null) {
            ctx.stepValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        } else {
            ctx.stepValue_ = 1
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new _slice(ctx.lowerValue_, ctx.upperValue_, ctx.stepValue_)
        evalEnd(ss.length, state)
    }
}

export default Slice