import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {evalBegin, evalEnd} from '../utils'
import {TupleContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {ConstantRet} from '../types'

const Tuple = {
    type: "Tuple",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Tuple
        const ctx = state.ctx as TupleContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        while(ctx.n_ <= node.elts.length) {
            if (ctx.n_ > 0) {
                const v = ScopeHelper.lookupX(state.scope, ctx.value_)
                ctx.list_.__push__(v)
            }

            if (ctx.n_ < node.elts.length) {
                const [nextState, nodeValue] = newState(node.elts[ctx.n_++], state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            } else {
                ctx.n_++
            }
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new ConstantRet(ctx.list_)
        evalEnd(ss.length, state)
    }
}

export default Tuple