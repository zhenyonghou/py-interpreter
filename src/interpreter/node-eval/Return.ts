import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {evalBegin, evalEnd} from '../utils'
import {ReturnContext} from '../eval-context'
import { ControlKey, ConstantRet} from '../types'

const Return = {
    type: "Return",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Return
        const ctx = state.ctx as ReturnContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        if (!ctx.retValueDone_) {
            ctx.retValueDone_ = true
            if (node.value == null) {
                ss.pop()
                const parentCtx = ss[ss.length - 1].ctx
                parentCtx.control_ = ControlKey.Return
                parentCtx.returnData_ = ctx.value_
                evalEnd(ss.length, state)
                return
            }
            const [nextState, nodeValue] = newState(node.value, state.scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        ss.pop()
        const parentCtx = ss[ss.length - 1].ctx
        parentCtx.control_ = ControlKey.Return
        parentCtx.returnData_ = ctx.value_
        evalEnd(ss.length, state)
    }
}

export default Return