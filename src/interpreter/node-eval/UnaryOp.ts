import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {UnaryOpContext} from '../eval-context'
import {evalBegin, evalEnd} from '../utils'
import {ConstantRet} from '../types'
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
            const [nextState, nodeValue] = newState(node.operand, state.scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        const v = ScopeHelper.lookupX(state.scope, ctx.value_)
        const operator = node.op.type

        let retValue = null
        switch (operator) {
            case "Not":
                if (!v) {
                    retValue = new ConstantRet(true)
                } else {
                    retValue = new ConstantRet(false)
                }
                break
            case "Invert":
                retValue = new ConstantRet(~v)
                break
            case "UAdd":
                retValue = new ConstantRet(+v)
                break
            case "USub":
                retValue = new ConstantRet(-v)
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