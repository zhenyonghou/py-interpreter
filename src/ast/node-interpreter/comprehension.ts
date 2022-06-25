import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {comprehensionContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { _str } from '../../python/builtins'
import {quickInterpret} from './node-eval-utils/utils'
import { BaseInterpreter } from './__base'

class comprehension extends BaseInterpreter {
    type = AstTree.NodeType.comprehension
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.comprehension
        const ctx = state.ctx as comprehensionContext
        const scope = state.scope

        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.targetDone_) {    // Store
            ctx.targetDone_ = true
            if (quickInterpret(node.target, scope, ss, ctx)) {
                return
            }
        }

        if (!ctx.iterDone_) {
            ctx.iterDone_ = true

            ctx.target_ = ctx.value_

            if (quickInterpret(node.iter, scope, ss, ctx)) {
                return
            }
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
                    if (quickInterpret(node.ifs[ctx.ifsN_++], scope, ss, ctx)) {
                        return
                    }
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
    }
}

export default comprehension