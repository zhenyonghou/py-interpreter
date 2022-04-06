import * as AstTree from '../ast-tree'
import { State, StateStack } from '../state'
import { Scope } from '../scope'
import { AssignContext } from '../eval-context'
import ScopeHelper from '../scope-helper'
import { setSubscripe } from './node-utils/utils'
import { evalBegin, evalEnd, Assert } from '../utils'
import { newState } from './node-utils/utils'
import { NameRet, ConstantRet, SubscriptRet, AttributeRet, StepAttr } from '../types'
import { _tuple, iterate, iter } from '../python/builtins'

/**
 * targets有多个，value只有一个，先解析value
 */

const doAssign = (left: any, right: any, scope: Scope) => {
    if (left instanceof NameRet) {
        scope.set(left.name, right)
    } 
    else if (left instanceof SubscriptRet) {
        const { obj, slice } = left // slice很可能是_str类型
        setSubscripe(obj, slice, right)
    } 
    else if (left instanceof ConstantRet) { // 这种形式: a, b = (1, 2)
        if (left.value instanceof _tuple) {
            let i = 0
            iterate(iter(left.value), (item: any) => {
                doAssign(item, right.__getitem__(i++), scope)
            })
        } else {
            Assert(false, `Assign有不支持的类型2`)
        }
    } 
    else if (left instanceof AttributeRet) {
        left.obj[left.attr] = right
    } 
    else {
        Assert(false, `Assign有不支持的类型`)
    }
}

const Assign = {
    type: "Assign",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Assign
        const ctx = state.ctx as AssignContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            const [nextState, nodeValue] = newState(node.value, state.scope, StepAttr.Go)
            if (nextState) { return nextState } else { ctx.value_ = nodeValue }
        }

        if (ctx.targetIndex_ == 0) {
            // 解析出value，给targets赋值用
            ctx.assignValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        }

        while (ctx.targetIndex_ <= node.targets.length) {
            if (ctx.targetIndex_ > 0) {
                doAssign(ctx.value_, ctx.assignValue_, state.scope)
            }

            if (ctx.targetIndex_ < node.targets.length) {
                const [nextState, nodeValue] = newState(node.targets[ctx.targetIndex_++], state.scope, StepAttr.Go)
                if (nextState) { return nextState } else { ctx.value_ = nodeValue }
            } else {
                ctx.targetIndex_++
            }
        }

        ss.pop()
        evalEnd(ss.length, state)
    }
}

export default Assign