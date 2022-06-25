import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import { comprehensionContext, ListCompContext } from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import {ConstantRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import {_list, _str, _tuple } from '../../python/builtins'
import { BaseInterpreter } from './__base'

/**
 * 注意：
 * ListComp里生成comprehensionContext，设置回调函数，目的是将变量设到ListComp级作用域，供ListComp访问.
 */

class ListComp extends BaseInterpreter {
    type = AstTree.NodeType.ListComp
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.ListComp
        const ctx = state.ctx as ListCompContext
        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.eltDone_) {
            ctx.eltDone_ = true
            if (quickInterpret(node.elt, state.scope, ss, ctx)) {
                return
            }
        }

        if (ctx.eltValue_ == null) {
            ctx.eltValue_ = ctx.value_
        }

        while (ctx.generatorsN_ < node.generators.length) {
            const subContext = new comprehensionContext()
            subContext.onTargetValueUpdate = (k: any, v: any) => {
                ScopeHelper.setX(state.scope, k, v)
                const v_ = ScopeHelper.lookupX(state.scope, ctx.eltValue_)
                ctx.items_.append(v_)
            }
            ss.push(new State(node.generators[ctx.generatorsN_++], state.scope, subContext))
            return
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new ConstantRet(ctx.items_)
    }
}

export default ListComp