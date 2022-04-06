import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {evalBegin, evalEnd} from '../utils'
import {IfContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { StepAttr } from '../types'

const If = {
    type: "If",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.If
        const ctx = state.ctx as IfContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        if (ctx.control_ == "continue") {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_

            evalEnd(ss.length, state)
            return
        } else if (ctx.control_ == "break") {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_

            evalEnd(ss.length, state)
            return
        } else if (ctx.control_ == "return") {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_
            parentCtx.returnData_ = ctx.returnData_

            evalEnd(ss.length, state)
            return
        }

        // 执行test
        if (ctx.n_ === 0) {
            ctx.n_++

            if (node.test) {
                const [nextState, nodeValue] = newState(node.test, state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            }
        }

        // 判断test
        if (ctx.n_ === 1) {
            ctx.n_++
            ctx.testValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        }
        
        if (ctx.testValue_) {
            if (ctx.bodyN_ < node.body.length) {
                return new State(node.body[ctx.bodyN_++], state.scope, StepAttr.Stay)
            }
        } else {
            if (ctx.bodyN_ < node.orelse.length) {
                return new State(node.orelse[ctx.bodyN_++], state.scope, StepAttr.Stay)
            }
        }
        // 结束
        ss.pop()
        evalEnd(ss.length, state)
    }
}

export default If