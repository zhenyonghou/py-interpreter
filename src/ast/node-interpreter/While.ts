import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {WhileContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { BaseInterpreter } from './__base'
import { ControlKey } from './node-eval-utils/types'

/**
 * 遇到break时候结束程序，不需要通知上层；遇到return时需要告知上层
 */
class While extends BaseInterpreter {
    type = AstTree.NodeType.While
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.While
        const ctx = state.ctx as WhileContext
        if (!this.askWhenBegin(state)) {
            return
        }

        if (ctx.control_ == ControlKey.Continue) {
            ctx.reset()
            // return
        } else if (ctx.control_ == ControlKey.Break) {
            ss.pop()
            this.end(this.type, state.node)
            return
        } else if (ctx.control_ == ControlKey.Return) {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_
            parentCtx.returnData_ = ctx.returnData_
            this.end(this.type, state.node)
            return
        }

        // 执行test
        if (ctx.n_ === 0) {
            ctx.n_++

            if (node.test) {
                ss.push(new State(node.test, state.scope)) // 单步运行时需要在这里停留
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
                return
            } else {
                // 下次再去执行test
                ctx.reset()
                return
            }
        }
        // 结束
        ss.pop()
        this.end(this.type, state.node)
    }
}

export default While