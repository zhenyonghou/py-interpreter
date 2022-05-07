import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {AttributeContext} from '../interpret-context'
import {AttributeRet} from './node-eval-utils/types'
import ScopeHelper from '../../scope/scope-helper'
import { BaseInterpreter } from './__base'

class Attribute extends BaseInterpreter {
    type = AstTree.NodeType.Attribute

    interpret(ss: StateStack, state: State) {
        const node = state.node as AstTree.Attribute
        const ctx = state.ctx as AttributeContext

        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            if (this.prepareInterpret(node.value, state.scope, ss, ctx)) {
                return
            }
        }

        ctx.attributeValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new AttributeRet(ctx.attributeValue_, node.attr)
    }
}

export default Attribute