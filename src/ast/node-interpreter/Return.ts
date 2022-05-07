import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {ReturnContext} from '../interpret-context'
import { ControlKey, ConstantRet} from './node-eval-utils/types'
import { BaseInterpreter } from './__base'

class Return extends BaseInterpreter {
    type = AstTree.NodeType.Return
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Return
        const ctx = state.ctx as ReturnContext
        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.retValueDone_) {
            ctx.retValueDone_ = true
            if (node.value == null) {
                ss.pop()
                const parentCtx = ss[ss.length - 1].ctx
                parentCtx.control_ = ControlKey.Return
                parentCtx.returnData_ = ctx.value_
                return
            }
            if (this.prepareInterpret(node.value, state.scope, ss, ctx)) {
                return
            }
        }

        ss.pop()
        const parentCtx = ss[ss.length - 1].ctx
        parentCtx.control_ = ControlKey.Return
        parentCtx.returnData_ = ctx.value_
    }
}

export default Return