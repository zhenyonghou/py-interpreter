import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {CallContext} from '../eval-context'
import ScopeHelper from '../scope-helper'

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
                const arg = ScopeHelper.lookupX(state.scope, ctx.value_)
                ctx.args_.push(arg)
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
            const ret = func.apply(null, ctx.args_)   // 返回nextState
            return ret
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = ctx.return_value_
        evalEnd(state)
    }
}

export default Call