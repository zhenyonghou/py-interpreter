import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {BoolOpContext} from '../eval-context'
import {evalBegin, evalEnd} from '../utils'
import {ConstantRet} from '../types'
import ScopeHelper from '../scope-helper'

const BoolOp = {
    type: "BoolOp",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.BoolOp
        const ctx = state.ctx as BoolOpContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        while (ctx.n_ <= node.values.length) {
            if (ctx.n_ == 0) {
                const [nextState, nodeValue] = newState(node.values[ctx.n_++], state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            }
            if (ctx.n_ == 1) {
                ctx.leftValue_ = ScopeHelper.lookupX(state.scope, ctx.value_) ? true : false
                const [nextState, nodeValue] = newState(node.values[ctx.n_++], state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
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
                const [nextState, nodeValue] = newState(node.values[ctx.n_++], state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            } else {
                ctx.n_++
            }
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new ConstantRet(!!ctx.leftValue_)
        evalEnd(state)
    }
}

export default BoolOp