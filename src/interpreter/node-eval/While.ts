import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {WhileContext} from '../eval-context'
import { NameRet } from '../types'
import ScopeHelper from '../scope-helper'

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
        } else if (ctx.control_ == "break") {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_

            evalEnd(state)
            return
        } else if (ctx.control_ == "return") {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_
            parentCtx.return_ = ctx.return_
            parentCtx.return_value_ = ctx.return_value_

            evalEnd(state)
            return
        }

        // 执行test
        if (ctx.n_ === 0) {
            ctx.n_++

            if (node.test) {
                return new State(node.test, state.scope)
            }
        }

        // 判断test
        if (ctx.n_ === 1) {
            ctx.n_++
            ctx.testValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        }
        
        if (ctx.testValue_) {
            if (ctx.bodyN_ < node.body.length) {
                return new State(node.body[ctx.bodyN_++], state.scope)
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