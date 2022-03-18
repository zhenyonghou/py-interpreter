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
 * ListComp与comprehension共同使用同一个scope，comprehension里Store的i,在ListComp里Load, 所以考虑之后将它俩写在了一起.
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