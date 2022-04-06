import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {evalBegin, evalEnd} from '../utils'
import {IfExpContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { StepAttr } from '../types'

const IfExp = {
    type: "IfExp",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.IfExp
        const ctx = state.ctx as IfExpContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        // 执行test
        if (ctx.n_ === 0) {
            ctx.n_++

            if (node.test) {
                const [nextState, nodeValue] = newState(node.test, state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            }
        }

        // 判断test, 执行body or orelse
        if (ctx.n_ === 1) {
            ctx.n_++
            ctx.testValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
            if (ctx.testValue_) {
                return new State(node.body, state.scope, StepAttr.Stay)
            } else {
                return new State(node.orelse, state.scope, StepAttr.Stay)
            }
        }
        
        // 结束
        ss.pop()
        ss[ss.length - 1].ctx.value_ = ctx.value_
        evalEnd(ss.length, state)
    }
}

export default IfExp