import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {IfExpContext} from '../eval-context'
import ScopeHelper from '../scope-helper'

const IfExp = {
    type: "IfExp",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.IfExp
        const ctx = state.ctx as IfExpContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        // 执行test
        if (ctx.n_ === 0) {
            ctx.n_++

            if (node.test) {
                return new State(node.test, state.scope)
            }
        }

        // 判断test, 执行body or orelse
        if (ctx.n_ === 1) {
            ctx.n_++
            ctx.testValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
            if (ctx.testValue_) {
                return new State(node.body, state.scope)
            } else {
                return new State(node.orelse, state.scope)
            }
        }
        
        // 结束
        ss.pop()
        ss[ss.length - 1].ctx.value_ = ctx.value_
        evalEnd(state)
    }
}

export default IfExp