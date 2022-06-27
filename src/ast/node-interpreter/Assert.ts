import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import { _assert } from '../../common/functions'
import {quickInterpret} from './node-eval-utils/utils'
import {AssertContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { BaseInterpreter } from './__base'

class Assert extends BaseInterpreter {
    type = AstTree.NodeType.Assert

    interpret(ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.Assert
        const ctx = state.ctx as AssertContext

        if (!ctx.testDone_) {
            ctx.testDone_ = true
            if (quickInterpret(node.test, state.scope, ss, ctx)) {
                return
            }
        }

        const value = ScopeHelper.lookupX(state.scope, ctx.value_)
        _assert(value, node.msg == null ? "Assert警告" : node.msg)

        ss.pop()
    }
}

export default Assert