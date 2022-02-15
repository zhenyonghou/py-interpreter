import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {UnaryOpContext} from '../eval-context'
import {evalBegin, evalEnd} from '../utils'
import {ConstantValue} from '../value'
import ScopeHelper from '../scope-helper'

const UnaryOp = {
    type: "UnaryOp",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.UnaryOp
        const ctx = state.ctx as UnaryOpContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.operandDone_) {
            ctx.operandDone_ = true
            return new State(node.operand, state.scope)
        }

        const v = ScopeHelper.lookupX(state.scope, ctx.value_)
        const operator = node.op.type

        let retValue = null
        switch (operator) {
            case "Not":
                if (!v) {
                    retValue = new ConstantValue(true)
                } else {
                    retValue = new ConstantValue(false)
                }
                break
            case "Invert":
                retValue = new ConstantValue(~v)
                break
            case "UAdd":
                retValue = new ConstantValue(+v)
                break
            case "USub":
                retValue = new ConstantValue(-v)
                break
            default:
                throw new Error(`不支持操作符${operator}`)
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = retValue
        evalEnd(state)
        return
    }
}

export default UnaryOp