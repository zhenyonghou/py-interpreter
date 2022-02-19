import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {DictContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {ConstantRet} from '../types'

const Dict = {
    type: "Dict",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Dict
        const ctx = state.ctx as DictContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (ctx.valueIndex_ <= node.values.length) {
            if (ctx.valueIndex_ > 0) {
                let lastKey = node.keys[ctx.valueIndex_ - 1].value
                const v = ScopeHelper.lookupX(state.scope, ctx.value_)
                ctx.dict_[lastKey] = v
            }

            if (ctx.valueIndex_ < node.values.length) {
                return new State(node.values[ctx.valueIndex_++], state.scope)
            } else {
                ctx.valueIndex_++
            }
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new ConstantRet(ctx.dict_)
        evalEnd(state)
    }
}

export default Dict