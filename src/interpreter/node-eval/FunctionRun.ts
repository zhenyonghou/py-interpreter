import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Assert, evalBegin, evalEnd} from '../utils'
import {FunctionRunContext} from '../eval-context'
import ScopeHelper from '../scope-helper'

/**
 * 遇到break时候结束程序，不需要通知上层；遇到return时需要告知上层
 */
const FunctionRun = {
    type: "FunctionRun",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.FunctionRun
        const ctx = state.ctx as FunctionRunContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (ctx.control_ == "return") {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_
            parentCtx.returnData_ = ctx.returnData_

            evalEnd(state)
            return
        }

        // 处理body
        if (ctx.bodyN_ < node.body.length) {
            return new State(node.body[ctx.bodyN_++], state.scope)
        }
        // 结束
        ss.pop()
        evalEnd(state)
    }
}

export default FunctionRun