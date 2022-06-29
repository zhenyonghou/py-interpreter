import * as AstTree from '../ast-node'
import { State, StateStack } from '../../state'
import { Scope } from '../../scope/scope'
import { AssignContext } from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { setSubscripe, quickInterpret } from './node-eval-utils/utils'
import { _assert } from '../../common/functions'
import { NameRet, ConstantRet, SubscriptRet, AttributeRet, MMInstance } from './node-eval-utils/types'
import { _tuple, iterate, iter } from '../../python/builtins'
import { BaseInterpreter } from './__base'

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
            _assert(false, `Assign有不支持的类型2`)
        }
    }
    else if (left instanceof AttributeRet) {
        if (left.obj instanceof MMInstance) {
            let _obj = left.obj
            while(_obj) {
                if (_obj.hasOwnProperty(left.attr)) {
                    _obj[left.attr] = right
                    break
                } else if (_obj.bases.length > 0) {
                    _obj = _obj.bases[0]
                } else {
                    _obj = null
                }
            }
            
            if (_obj == null) {
                left.obj[left.attr] = right
            }
        } else {
            left.obj[left.attr] = right
        }
    }
    else {
        _assert(false, `Assign有不支持的类型`)
    }
}

class Assign extends BaseInterpreter {
    type = AstTree.NodeType.Assign
    interpret(ss: StateStack, state: State) {
        const node = state.node as AstTree.Assign
        const ctx = state.ctx as AssignContext

        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            if (quickInterpret(node.value, state.scope, ss, ctx)) {
                return
            }
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
                if (quickInterpret(node.targets[ctx.targetIndex_++], state.scope, ss, ctx)) {
                    return
                }
            } else {
                ctx.targetIndex_++
            }
        }

        ss.pop()
    }
}

export default Assign