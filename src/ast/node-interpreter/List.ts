import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {ListContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import {ConstantRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import { BaseInterpreter } from './__base'

class List extends BaseInterpreter {
    type = AstTree.NodeType.List
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.List
        const ctx = state.ctx as ListContext

        while (ctx.n_ <= node.elts.length) {
            if (ctx.n_ > 0) {
                const v = ScopeHelper.lookupX(state.scope, ctx.value_)
                ctx.list_.append(v)
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

export default List