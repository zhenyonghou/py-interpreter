import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {AssignContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {evalBegin, evalEnd, Assert} from '../utils'
import { NameRet, SubscriptRet} from '../types'

const Assign = {
    type: "Assign",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Assign
        const ctx = state.ctx as AssignContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            return new State(node.value, state.scope)
        }

        // 解析完成value之后
        if (ctx.targetIndex_ == 0) {
            ctx.assignValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        }

        // 处理上一次解析完的target(变量名)
        if (ctx.targetIndex_ > 0) {
            if (ctx.value_ instanceof NameRet) {
                state.scope.set(ctx.value_.name, ctx.assignValue_)
            } else if (ctx.value_ instanceof SubscriptRet) {
                const {obj, slice} = ctx.value_
                if (obj.hasOwnProperty('__setitem__')) {
                    obj.__setitem__(slice, ctx.assignValue_)
                } else {
                    obj[slice] = ctx.assignValue_
                }
            } else {
                console.error(`Assign有不支持的类型:`, ctx.value_)
                Assert(false, `Assign有不支持的类型`)
            }
        }

        if (ctx.targetIndex_ < node.targets.length) {
            return new State(node.targets[ctx.targetIndex_++], state.scope)
        }

        ss.pop()
        evalEnd(state)
    }
}

export default Assign