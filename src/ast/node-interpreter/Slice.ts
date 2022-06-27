import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {SliceContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { _slice } from '../../python/builtins'
import {quickInterpret} from './node-eval-utils/utils'
import { BaseInterpreter } from './__base'

class Slice extends BaseInterpreter {
    type = AstTree.NodeType.Slice
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.Slice
        const ctx = state.ctx as SliceContext

        if (!ctx.lowerDone_) {
            ctx.lowerDone_ = true

            if (node.lower != null) {
                if (quickInterpret(node.lower, state.scope, ss, ctx)) {
                    return
                }
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
                if (quickInterpret(node.upper, state.scope, ss, ctx)) {
                    return
                }
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
                if (quickInterpret(node.step, state.scope, ss, ctx)) {
                    return
                }
            }
        }

        if (node.step != null) {
            ctx.stepValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        } else {
            ctx.stepValue_ = 1
        }

        ss.pop()
        ss.setTopCtxValue(new _slice(ctx.lowerValue_, ctx.upperValue_, ctx.stepValue_))
    }
}

export default Slice