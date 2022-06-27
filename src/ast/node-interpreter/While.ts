import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {WhileContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { BaseInterpreter } from './__base'
import { ControlKey } from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'

/**
 * 遇到break时候结束程序，不需要通知上层；遇到return时需要告知上层
 */
class While extends BaseInterpreter {
    type = AstTree.NodeType.While
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }
        const node = state.node as AstTree.While
        const ctx = state.ctx as WhileContext

        if (ctx.control_ == ControlKey.Continue) {
            ctx.again()
        } else if (ctx.control_ == ControlKey.Break) {
            ss.pop()
            this.exit(state.node)
            return
        } else if (ctx.control_ == ControlKey.Return) {
            ss.pop()
            const top = ss.top()
            top.ctx.control_ = ctx.control_
            top.ctx.returnData_ = ctx.returnData_
            this.exit(state.node)
            return
        }

        // 执行test
        if (ctx.n_ === 0) {
            ctx.n_++

            if (node.test) {
                if (ctx.counter_ > 0) {
                    this.keyStep(this.type, state.node) // 强制stay
                }
                quickInterpret(node.test, state.scope, ss, ctx)
                return
            }
        }

        // 判断test
        if (ctx.n_ === 1) {
            ctx.n_++
            ctx.testValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
        }
        
        if (ctx.testValue_) {
            if (ctx.bodyN_ < node.body.length) {
                ss.push(new State(node.body[ctx.bodyN_++], state.scope))
            } else {
                ctx.again() // 下次再去执行test
            }
            return
        }
        // 结束
        ss.pop()
        this.exit(state.node)
    }
}

export default While