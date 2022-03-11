import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {Assert, evalBegin, evalEnd} from '../utils'
import {keywordContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {keywordRet} from '../types'

const keyword = {
    type: "keyword",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.keyword
        const ctx = state.ctx as keywordContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            const [nextState, nodeValue] = newState(node.value, state.scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        let value = ScopeHelper.lookupX(state.scope, ctx.value_)

        // 结束
        ss.pop()
        ss[ss.length - 1].ctx.value_ = new keywordRet(node.arg, value)
        evalEnd(state)
    }
}

export default keyword