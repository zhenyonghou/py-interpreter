import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd, Assert as __assert} from '../utils'
import {AssertContext} from '../eval-context'
import ScopeHelper from '../scope-helper'

const Assert = {
    type: "Assert",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Assert
        const ctx = state.ctx as AssertContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.testDone_) {
            ctx.testDone_ = true
            return new State(node.test, state.scope)
        }

        const value = ScopeHelper.lookupX(state.scope, ctx.value_)
        __assert(value, node.msg == null ? "Assert警告" : node.msg)

        ss.pop()
        evalEnd(state)
    }
}

export default Assert