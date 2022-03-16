import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {evalBegin, evalEnd} from '../utils'
import {WhileContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { StepAttr } from '../types'

/**
 * 遇到break时候结束程序，不需要通知上层；遇到return时需要告知上层
 */
const While = {
    type: "While",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.While
        const ctx = state.ctx as WhileContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (ctx.control_ == "continue") {
            ctx.reset()
            // return
        } else if (ctx.control_ == "break") {
            ss.pop()
            evalEnd(state)
            return
        } else if (ctx.control_ == "return") {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_
            parentCtx.returnData_ = ctx.returnData_

            evalEnd(state)
            return
        }

        // 执行test
        if (ctx.n_ === 0) {
            ctx.n_++

            if (node.test) {
                return new State(node.test, state.scope, StepAttr.Stay) // 单步运行时需要在这里停留
            }
        }

        // 判断test
        if (ctx.n_ === 1) {
            ctx.n_++
            ctx.testValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        }
        
        if (ctx.testValue_) {
            if (ctx.bodyN_ < node.body.length) {
                return new State(node.body[ctx.bodyN_++], state.scope, StepAttr.Stay)
            } else {
                // 下次再去执行test
                ctx.reset()
                return
            }
        }
        // 结束
        ss.pop()
        evalEnd(state)
    }
}

export default While