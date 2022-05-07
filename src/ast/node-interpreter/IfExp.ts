import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {IfExpContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { BaseInterpreter } from './__base'

class IfExp extends BaseInterpreter {
    type = AstTree.NodeType.IfExp
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.IfExp
        const ctx = state.ctx as IfExpContext
        if (!this.askWhenBegin(state)) {
            return
        }

        // 执行test
        if (ctx.n_ === 0) {
            ctx.n_++

            if (node.test) {
                if (this.prepareInterpret(node.test, state.scope, ss, ctx)) {
                    return
                }
            }
        }

        // 判断test, 执行body or orelse
        if (ctx.n_ === 1) {
            ctx.n_++
            ctx.testValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
            if (ctx.testValue_) {
                ss.push(new State(node.body, state.scope))
                return
            } else {
                ss.push(new State(node.orelse, state.scope))
                return
            }
        }
        
        // 结束
        ss.pop()
        ss[ss.length - 1].ctx.value_ = ctx.value_
    }
}

export default IfExp