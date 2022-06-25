import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {IfContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { ControlKey } from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import { BaseInterpreter } from './__base'

class If extends BaseInterpreter {
    type = AstTree.NodeType.If
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.If
        const ctx = state.ctx as IfContext
        if (!this.askWhenBegin(state)) {
            return
        }

        if (ctx.control_ == ControlKey.Continue) {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_
            return
        } else if (ctx.control_ == ControlKey.Break) {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_
            return
        } else if (ctx.control_ == ControlKey.Return) {
            ss.pop()
            const parentCtx = ss[ss.length - 1].ctx
            parentCtx.control_ = ctx.control_
            parentCtx.returnData_ = ctx.returnData_
            return
        }

        // 执行test
        if (ctx.n_ === 0) {
            ctx.n_++

            if (node.test) {
                if (quickInterpret(node.test, state.scope, ss, ctx)) {
                    return
                }
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
            }
        } else {
            if (ctx.bodyN_ < node.orelse.length) {
                ss.push(new State(node.orelse[ctx.bodyN_++], state.scope))
                return
            }
        }
        // 结束
        ss.pop()
    }
}

export default If