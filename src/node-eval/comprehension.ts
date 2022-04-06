import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {evalBegin, evalEnd} from '../utils'
import {comprehensionContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { _str } from '../python/builtins'

const comprehension = {
    type: "comprehension",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.comprehension
        const ctx = state.ctx as comprehensionContext
        const scope = state.scope

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        if (!ctx.targetDone_) {    // Store
            ctx.targetDone_ = true
            const [nextState, nodeValue] = newState(node.target, scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        if (!ctx.iterDone_) {
            ctx.iterDone_ = true

            ctx.target_ = ctx.value_

            const [nextState, nodeValue] = newState(node.iter, scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        if (ctx.slice_ == null) {
            ctx.slice_ = ScopeHelper.lookupX(scope, ctx.value_)
        }

        ctx.ifsResult_ = -1
        while (ctx.iterIndex_ < ctx.slice_.__len__()) {
            // 注册target到scope, ifs里会去获取
            const currentItem = ctx.slice_.__getitem__(ctx.iterIndex_)
            ScopeHelper.setX(scope, ctx.target_, currentItem)
            
            // 判断ifs结果
            while (ctx.ifsN_ <= node.ifs.length) {
                if (ctx.ifsN_ > 0) {
                    const checkResult = ScopeHelper.lookupX(scope, ctx.value_)
                    if (!checkResult) {
                        ctx.ifsResult_ = 0
                        break
                    }
                }

                if (ctx.ifsN_ < node.ifs.length) {
                    const [nextState, nodeValue] = newState(node.ifs[ctx.ifsN_++], scope)
                    if (nextState) {return nextState} else {ctx.value_ = nodeValue}
                } else {
                    ctx.ifsResult_ = 1
                    ctx.ifsN_++
                }
            }

            // 符合条件的项通知给父级
            if (ctx.ifsResult_ == 1) {
                ctx.onTargetValueUpdate(ctx.target_, currentItem)  // 通知父级
            }
            // 重置
            ctx.ifsResult_ = -1
            ctx.ifsN_ = 0

            ctx.iterIndex_++
        }

        ss.pop()
        evalEnd(ss.length, state)
    }
}

export default comprehension