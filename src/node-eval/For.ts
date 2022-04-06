import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Assert, evalBegin, evalEnd} from '../utils'
import {ForContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { _list, _tuple, _iter} from '../python/builtins'
import { StepAttr } from '../types'

/**
 * 遇到break时候结束程序，不需要通知上层；遇到return时需要告知上层
 */
const For = {
    type: "For",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.For
        const ctx = state.ctx as ForContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        if (ctx.control_ == "continue") {
            ctx.continue()
            return
        } else if (ctx.control_ == "break") {
            ss.pop()
            evalEnd(ss.length, state)
            return
        } else if (ctx.control_ == "return") {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_
            parentCtx.returnData_ = ctx.returnData_
            evalEnd(ss.length, state)
            return
        }

        if (!ctx.init_) {
            ctx.init_ = true

            Assert(node.target.id.length > 0)
            ctx.targetName_ = node.target.id

            // 解释iter
            return new State(node.iter, state.scope)
        }

        if (ctx.iterIndex_ == 0) {
            const tempValue = ScopeHelper.lookupX(state.scope, ctx.value_)
            if (tempValue instanceof _tuple) {
                ctx.iterValue_ = tempValue._items
            } else if (tempValue instanceof _list) {
                ctx.iterValue_ = tempValue._items
            } else if (tempValue instanceof _iter) {
                ctx.iterValue_ = tempValue._seq
            } else {
                ctx.iterValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
            }
        }

        if (ctx.iterIndex_ < ctx.iterValue_.length) {
            const currentItem = ctx.iterValue_[ctx.iterIndex_]
            // 为target赋值
            ScopeHelper.setX(state.scope, ctx.targetName_, currentItem)

            // 处理body
            if (ctx.bodyN_ < node.body.length) {
                return new State(node.body[ctx.bodyN_++], state.scope, StepAttr.Stay)
            } else {
                // 处理完body, 继续循环
                ctx.continue()
                return
            }
        }

        // 结束
        ss.pop()
        evalEnd(ss.length, state)
    }
}

export default For