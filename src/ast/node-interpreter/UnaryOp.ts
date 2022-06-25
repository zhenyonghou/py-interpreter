import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {UnaryOpContext} from '../interpret-context'
import {ConstantRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import ScopeHelper from '../../scope/scope-helper'
import { BaseInterpreter } from './__base'

class UnaryOp extends BaseInterpreter {
    type = AstTree.NodeType.UnaryOp
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.UnaryOp
        const ctx = state.ctx as UnaryOpContext

        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.operandDone_) {
            ctx.operandDone_ = true
            if (quickInterpret(node.operand, state.scope, ss, ctx)) {
                return
            }
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
    }
}

export default UnaryOp