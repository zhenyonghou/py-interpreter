import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Assert, evalBegin, evalEnd} from '../utils'
import {DeleteContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { NameRet, SubscriptRet } from '../types'
import { _dict } from '../python/builtins'

const Delete = {
    type: "Delete",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Delete
        const ctx = state.ctx as DeleteContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (ctx.n_ > 0) {
            if (ctx.value_ instanceof NameRet) {
                state.scope.del(ctx.value_.name)
            } else if (ctx.value_ instanceof SubscriptRet) {
                const {obj, slice} = ctx.value_
                if (obj instanceof _dict) {
                    obj.__delitem__(slice)
                } else {
                    Assert(false, `未处理到的情况`)
                }
            } else {
                Assert(false, `未处理到的情况`)
            }
        }

        if (ctx.n_ < node.targets.length) {
            return new State(node.targets[ctx.n_++], state.scope)
        }

        ss.pop()
        evalEnd(state)
    }
}

export default Delete