import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {keywordContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import {keywordRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import { BaseInterpreter } from './__base'

class keyword extends BaseInterpreter {
    type = AstTree.NodeType.keyword
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.keyword
        const ctx = state.ctx as keywordContext
        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            if (quickInterpret(node.value, state.scope, ss, ctx)) {
                return
            }
        }

        let value = ScopeHelper.lookupX(state.scope, ctx.value_)

        // 结束
        ss.pop()
        ss[ss.length - 1].ctx.value_ = new keywordRet(node.arg, value)
    }
}

export default keyword