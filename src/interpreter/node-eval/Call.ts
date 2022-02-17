import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {CallContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { ConstantRet, StarredRet } from '../types'

/**
 * 函数调用
 * 在执行func.apply时，如果是内置函数，直接返回结果；如果是自己写的函数，返回一个State，函数体在返回的State里执行
 */

const Call = {
    type: "Call",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Call
        const ctx = state.ctx as CallContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (ctx.funcStep_ == 0) {   // 解析func
            ctx.funcStep_ ++
            return new State(node.func, state.scope)
        }

        if (ctx.funcStep_ == 1) {   // 解析完func
            ctx.funcStep_ ++
            ctx.func_ = ctx.value_

            ctx.args_ = []
            ctx.argN_ = 0
        }

        if (ctx.argN_ <= node.args.length) { // args not done
            if (ctx.argN_ > 0) {
                if (ctx.value_ instanceof StarredRet) {
                    const list = ScopeHelper.lookupX(state.scope, ctx.value_.name) as Array<any>
                    ctx.args_.push(...list)
                } else {
                    const arg = ScopeHelper.lookupX(state.scope, ctx.value_)
                    ctx.args_.push(arg)
                }
            }

            if (ctx.argN_ < node.args.length) {
                return new State(node.args[ctx.argN_++], state.scope)
            } else {
                ctx.argN_++
            }
        }

        if (!ctx.doneExec_) {
            ctx.doneExec_ = true

            const func = ScopeHelper.lookupX(state.scope, ctx.func_)
            const ret = func.apply(null, ctx.args_)   // 内置函数返回的是值，自定义函数返回的是nextState
            if (ret instanceof State) {
                return ret
            } else {
                ss.pop()
                ss[ss.length - 1].ctx.value_ = new ConstantRet(ret)
                evalEnd(state)
                return
            }
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = ctx.returnData_
        evalEnd(state)
    }
}

export default Call