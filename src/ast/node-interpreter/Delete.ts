import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {_assert} from '../../common/functions'
import {DeleteContext} from '../interpret-context'
import { NameRet, SubscriptRet } from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import { _dict, _list, _tuple } from '../../python/builtins'
import { BaseInterpreter } from './__base'

class Delete extends BaseInterpreter {
    type = AstTree.NodeType.Delete
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.Delete
        const ctx = state.ctx as DeleteContext

        while (ctx.n_ <= node.targets.length) {
            if (ctx.n_ > 0) {
                if (ctx.value_ instanceof NameRet) {
                    state.scope.del(ctx.value_.name)
                } else if (ctx.value_ instanceof SubscriptRet) {
                    const {obj, slice} = ctx.value_
                    if (obj instanceof _dict || obj instanceof _list || obj instanceof _tuple) {
                        obj.__delitem__(slice)
                    } else {
                        _assert(false, `未处理到的情况`)
                    }
                } else {
                    _assert(false, `未处理到的情况`)
                }
            }
            if (ctx.n_ < node.targets.length) {
                if (quickInterpret(node.targets[ctx.n_++], state.scope, ss, ctx)) {
                    return
                }
            } else {
                ctx.n_++
            }
        }
        ss.pop()
    }
}

export default Delete