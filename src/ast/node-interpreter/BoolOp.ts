import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {BoolOpContext} from '../interpret-context'
import {ConstantRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import ScopeHelper from '../../scope/scope-helper'
import { BaseInterpreter } from './__base'

class BoolOp extends BaseInterpreter {
    type = AstTree.NodeType.BoolOp
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.BoolOp
        const ctx = state.ctx as BoolOpContext

        if (!this.askWhenBegin(state)) {
            return
        }

        while (ctx.n_ <= node.values.length) {
            if (ctx.n_ == 0) {
                if (quickInterpret(node.values[ctx.n_++], state.scope, ss, ctx)) {
                    return
                }
            }
            if (ctx.n_ == 1) {
                ctx.leftValue_ = ScopeHelper.lookupX(state.scope, ctx.value_) ? true : false
                if (quickInterpret(node.values[ctx.n_++], state.scope, ss, ctx)) {
                    return
                }
            }

            const rightValue = ScopeHelper.lookupX(state.scope, ctx.value_)

            const operator = node.op.type
            switch(operator) {
                case "And":
                    ctx.leftValue_ = ctx.leftValue_ && rightValue
                    break
                case "Or":
                    ctx.leftValue_ = ctx.leftValue_ || rightValue
                    break
            }
            
            if (ctx.n_ < node.values.length) {
                if (quickInterpret(node.values[ctx.n_++], state.scope, ss, ctx)) {
                    return
                }
            } else {
                ctx.n_++
            }
        }

        ss.pop()
        ss.setTopCtxValue(new ConstantRet(!!ctx.leftValue_))
    }
}

export default BoolOp