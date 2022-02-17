import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {StarredContext} from '../eval-context'
import {StarredRet} from '../types'
import ScopeHelper from '../scope-helper'

const Starred = {
    type: "Starred",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Starred
        const ctx = state.ctx as StarredContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        // const v = ScopeHelper.lookupX(state.scope, node.value.id)

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new StarredRet(node.value.id)
        evalEnd(state)
    }
}

export default Starred