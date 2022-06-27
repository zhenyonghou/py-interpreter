import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {TupleContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import {ConstantRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import { BaseInterpreter } from './__base'

class Tuple extends BaseInterpreter {
    type = AstTree.NodeType.Tuple
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.Tuple
        const ctx = state.ctx as TupleContext

        while(ctx.n_ <= node.elts.length) {
            if (ctx.n_ > 0) {
                if (node.ctx.type == "Load") {
                    const v = ScopeHelper.lookupX(state.scope, ctx.value_)
                    ctx.list_.__push__(v)
                } else if (node.ctx.type == "Store") {  // 如果是Store类型，不能查找结果
                    ctx.list_.__push__(ctx.value_)
                }
            }

            if (ctx.n_ < node.elts.length) {
                if (quickInterpret(node.elts[ctx.n_++], state.scope, ss, ctx)) {
                    return
                }
            } else {
                ctx.n_++
            }
        }

        ss.pop()
        ss.setTopCtxValue(new ConstantRet(ctx.list_))
    }
}

export default Tuple