import * as AstTree from '../ast-node'
import { Scope, ScopeType } from '../../scope/scope'
import {State, StateStack} from '../../state'
import {FunctionRunContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { ConstantRet, ControlKey } from './node-eval-utils/types'
import { BaseInterpreter } from './__base'

/**
 * state.scope是函数定义时的作用域, 需要新建作用域.
 * 遇到break时候结束程序，不需要通知上层；遇到return时需要告知上层.
 */
class FunctionRun extends BaseInterpreter {
    type = AstTree.NodeType.FunctionRun
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.FunctionRun
        const ctx = state.ctx as FunctionRunContext

        if (!ctx.begin) {
            ctx.begin = true
            
            const funcScope = new Scope(ScopeType.Function, state.scope)
            // 将args注册到scope
            node.args.forEach((value, key) => {
                funcScope.set(key, value)
            })
            ctx.scope = funcScope

            if (!this.enter(state.node)) {
                return
            }
        }

        if (ctx.control_ == ControlKey.Return) {
            ss.pop()
            const top = ss.top()
            top.ctx.control_ = ctx.control_
            top.ctx.returnData_ = new ConstantRet(ScopeHelper.lookupX(ctx.scope, ctx.returnData_)) // 因为要出作用域，所以这里必须取值

            this.exit(state.node)
            return
        }

        // 处理body
        if (ctx.bodyN_ < node.funcDef.body.length) {
            ss.push(new State(node.funcDef.body[ctx.bodyN_++], ctx.scope))
            return
        }
        // 结束
        ss.pop()
        this.exit(state.node)
    }
}

export default FunctionRun