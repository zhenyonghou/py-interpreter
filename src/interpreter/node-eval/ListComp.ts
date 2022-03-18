import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import { newState } from './node-utils/utils'
import { comprehensionContext, ListCompContext } from '../eval-context'
import ScopeHelper from '../scope-helper'
import { StepAttr } from '../types'
import {ConstantRet} from '../types'
import {_list, _str, _tuple } from '../python/builtins'

/**
 * 注意：
 * ListComp里生成comprehensionContext，设置回调函数，目的是将变量设到ListComp级作用域，供ListComp访问.
 */

const ListComp = {
    type: "ListComp",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.ListComp
        const ctx = state.ctx as ListCompContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        if (!ctx.eltDone_) {
            ctx.eltDone_ = true
            const [nextState, nodeValue] = newState(node.elt, state.scope, StepAttr.Go)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
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
            return new State(node.generators[ctx.generatorsN_++], state.scope, StepAttr.Go, subContext)
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new ConstantRet(ctx.items_)
        evalEnd(ss.length, state)
    }
}

export default ListComp