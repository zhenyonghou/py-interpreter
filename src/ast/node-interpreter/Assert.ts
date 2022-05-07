import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {Assert as __assert} from '../../utils'
import {AssertContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { BaseInterpreter } from './__base'

class Assert extends BaseInterpreter {
    type = AstTree.NodeType.Assert

    interpret(ss: StateStack, state: State) {
        const node = state.node as AstTree.Assert
        const ctx = state.ctx as AssertContext

        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.testDone_) {
            ctx.testDone_ = true
            if (this.prepareInterpret(node.test, state.scope, ss, ctx)) {
                return
            }
        }

        const value = ScopeHelper.lookupX(state.scope, ctx.value_)
        __assert(value, node.msg == null ? "Assert警告" : node.msg)

        ss.pop()
    }
}

export default Assert