import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {AssignContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {evalBegin, evalEnd, Assert} from '../utils'
import { newState } from './node-utils/utils'
import { NameRet, ConstantRet, SubscriptRet, AttributeRet} from '../types'
import {_tuple, iterate, iter} from '../python/builtins'

/**
 * targets有多个，value只有一个，先解析value
 */

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
            const [nextState, nodeValue] = newState(node.value, state.scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        if (ctx.targetIndex_ == 0) {
            // 解析出value，给targets赋值用
            ctx.assignValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        }

        while (ctx.targetIndex_ <= node.targets.length) {
            if (ctx.targetIndex_ > 0) { // 处理上一次解析完的target(变量名)
                if (ctx.value_ instanceof NameRet) {
                    state.scope.set(ctx.value_.name, ctx.assignValue_)
                } else if (ctx.value_ instanceof SubscriptRet) {
                    const {obj, slice} = ctx.value_ // slice很可能是_str类型
                    if ('__setitem__' in obj) {
                        obj.__setitem__(slice.toString(), ctx.assignValue_)
                    } else {
                        obj[slice.toString()] = ctx.assignValue_
                    }
                } else if (ctx.value_ instanceof ConstantRet) { // 这种形式: a, b = (1, 2)
                    if (ctx.value_.value instanceof _tuple) {
                        Assert(ctx.assignValue_ instanceof _tuple)
                        let i = 0
                        iterate(iter(ctx.value_.value), (item: any) => {
                            if (item instanceof NameRet) {
                                state.scope.set(item.name, ctx.assignValue_.__getitem__(i++))
                            } else {
                                Assert(false, `Assign有不支持的类型3`)
                            }
                        })
                    } else {
                        Assert(false, `Assign有不支持的类型2`)
                    }
                } else if (ctx.value_ instanceof AttributeRet) {
                    ctx.value_.obj[ctx.value_.attr] = ctx.assignValue_
                } else {
                    Assert(false, `Assign有不支持的类型`)
                }
            }

            if (ctx.targetIndex_ < node.targets.length) {
                const [nextState, nodeValue] = newState(node.targets[ctx.targetIndex_++], state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            } else {
                ctx.targetIndex_++
            }
        }

        ss.pop()
        evalEnd(state)
    }
}

export default Assign