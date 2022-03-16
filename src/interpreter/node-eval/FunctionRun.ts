import * as AstTree from '../ast-tree'
import { Scope, ScopeType } from '../scope'
import {State, StateStack} from '../state'
import {Assert, evalBegin, evalEnd} from '../utils'
import {FunctionRunContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { ConstantRet, StepAttr } from '../types'

/**
 * state.scope是函数定义时的作用域, 需要新建作用域.
 * 遇到break时候结束程序，不需要通知上层；遇到return时需要告知上层.
 */
const FunctionRun = {
    type: "FunctionRun",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.FunctionRun
        const ctx = state.ctx as FunctionRunContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)

            const funcScope = new Scope(ScopeType.Function, state.scope)
            // 将args注册到scope
            node.args.forEach((value, key) => {
                funcScope.set(key, value)
            })
            ctx.scope = funcScope
        }

        if (ctx.control_ == "return") {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_
            const retValue = ScopeHelper.lookupX(ctx.scope, ctx.returnData_)
            parentCtx.returnData_ = new ConstantRet(retValue) // 因为要出作用域，所以这里必须取值

            evalEnd(ss.length, state)
            return
        }

        // 处理body
        if (ctx.bodyN_ < node.funcDef.body.length) {
            return new State(node.funcDef.body[ctx.bodyN_++], ctx.scope, StepAttr.Stay)
        }
        // 结束
        ss.pop()
        evalEnd(ss.length, state)
    }
}

export default FunctionRun