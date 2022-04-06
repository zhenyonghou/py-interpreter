import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
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
            evalBegin(ss.length, state)
        }

        if (!ctx.testDone_) {
            ctx.testDone_ = true
            const [nextState, nodeValue] = newState(node.test, state.scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        const value = ScopeHelper.lookupX(state.scope, ctx.value_)
        __assert(value, node.msg == null ? "Assert警告" : node.msg)

        ss.pop()
        evalEnd(ss.length, state)
    }
}

export default Assert