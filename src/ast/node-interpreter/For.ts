import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {_assert} from '../../common/functions'
import {ForContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { ControlKey } from './node-eval-utils/types'
import { _list, _tuple, _iter, _str} from '../../python/builtins'
import { BaseInterpreter } from './__base'

/**
 * 遇到break时候结束程序，不需要通知上层；遇到return时需要告知上层
 */
class For extends BaseInterpreter {
    type = AstTree.NodeType.For
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.For
        const ctx = state.ctx as ForContext
        if (!this.askWhenBegin(state)) {
            return
        }

        if (ctx.control_ == ControlKey.Continue) {
            ctx.continue()
            return
        } else if (ctx.control_ == ControlKey.Break) {
            ss.pop()
            return
        } else if (ctx.control_ == ControlKey.Return) {
            ss.pop()
            const top = ss.top()
            top.ctx.control_ = ctx.control_
            top.ctx.returnData_ = ctx.returnData_
            return
        }

        if (!ctx.init_) {
            ctx.init_ = true

            _assert(node.target.id.length > 0)
            ctx.targetName_ = node.target.id

            // 解释iter
            ss.push(new State(node.iter, state.scope))
            return
        }

        if (ctx.iterIndex_ == 0) {
            const tempValue = ScopeHelper.lookupX(state.scope, ctx.value_)
            if (tempValue instanceof _tuple) {
                ctx.iterValue_ = tempValue._items
            } else if (tempValue instanceof _list) {
                ctx.iterValue_ = tempValue._items
            } else if (tempValue instanceof _iter) {
                ctx.iterValue_ = tempValue._seq
            } else if (tempValue instanceof _str) {
                ctx.iterValue_ = tempValue._obj
            } else {
                ctx.iterValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
            }
        }

        if (ctx.iterIndex_ < ctx.iterValue_.length) {
            const currentItem = ctx.iterValue_[ctx.iterIndex_]
            // 为target赋值
            ScopeHelper.setX(state.scope, ctx.targetName_, currentItem)

            // 处理body
            if (ctx.bodyN_ < node.body.length) {
                ss.push(new State(node.body[ctx.bodyN_++], state.scope))
            } else {
                // 处理完body, 继续循环
                ctx.continue()
                this.keyStep(this.type, state.node) // 强制stay
            }
            return
        }

        // 结束
        ss.pop()
        this.exit(state.node)
    }
}

export default For