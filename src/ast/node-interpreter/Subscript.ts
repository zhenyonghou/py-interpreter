import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {getSubscripe} from './node-eval-utils/utils'
import {SubscriptContext} from '../interpret-context'
import {ConstantRet, SubscriptRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import ScopeHelper from '../../scope/scope-helper'
import { _slice, _list } from '../../python/builtins'
import { BaseInterpreter } from './__base'

class Subscript extends BaseInterpreter {
    type = AstTree.NodeType.Subscript
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.Subscript
        const ctx = state.ctx as SubscriptContext

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            if (quickInterpret(node.value, state.scope, ss, ctx)) {
                return
            }
        }

        if (!ctx.sliceDone_) {
            ctx.sliceDone_ = true
            ctx.subscriptValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
            if (quickInterpret(node.slice, state.scope, ss, ctx)) {
                return
            }
        }

        let sliceValue: any = null
        // slice类型的话，直接取值
        if (ctx.value_ instanceof _slice) {
            sliceValue = ctx.value_
        } else {
            sliceValue = ScopeHelper.lookupX(state.scope, ctx.value_)
        }

        ss.pop()
        if (node.ctx.type == "Load") {
            ss.setTopCtxValue(new ConstantRet(getSubscripe(ctx.subscriptValue_, sliceValue)))
        } else {
            ss.setTopCtxValue(new SubscriptRet(ctx.subscriptValue_, sliceValue))
        }
    }
}

export default Subscript