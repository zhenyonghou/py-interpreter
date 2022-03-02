import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
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
            evalBegin(state)
        }

        if (!ctx.retValueDone_) {
            ctx.retValueDone_ = true
            if (node.value == null) {
                ss.pop()
                ss[ss.length - 1].ctx.control_ = ControlKey.Return
                ss[ss.length - 1].ctx.returnData_ = ctx.value_
                evalEnd(state)
                return
            }
            return new State(node.value, state.scope)
        }

        ss.pop()
        ss[ss.length - 1].ctx.control_ = ControlKey.Return
        ss[ss.length - 1].ctx.returnData_ = ctx.value_
        evalEnd(state)
    }
}

export default Return