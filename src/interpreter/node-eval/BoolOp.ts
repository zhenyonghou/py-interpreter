import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
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

        if (ctx.n_ <= node.values.length) {
            if (ctx.n_ == 0) {
                ctx.left_ = ctx.value_
            } else {
                const leftValue = ScopeHelper.lookupX(state.scope, ctx.left_)
                const rightValue = ScopeHelper.lookupX(state.scope, ctx.value_)
                const operator = node.op.type
                switch(operator) {
                    case "And":
                        if (!(leftValue && rightValue)) {   // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            evalEnd(state)
                        }
                        break
                    case "Or":
                        if (!(leftValue || rightValue)) {   // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            evalEnd(state)
                        }
                        break
                }
            }

            if (ctx.n_ == node.values.length) {
                ss.pop()
                ss[ss.length - 1].ctx.value_ = new ConstantRet(true)
                evalEnd(state)
                return
            }

            ctx.left_ = new ConstantRet(true)
            return new State(node.values[ctx.n_++], state.scope)
        }
    }
}

export default BoolOp