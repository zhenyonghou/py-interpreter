import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Assert, evalBegin, evalEnd} from '../utils'
import {DeleteContext} from '../eval-context'
import { newState } from './node-utils/utils'
import { NameRet, SubscriptRet } from '../types'
import { _dict, _list, _tuple } from '../python/builtins'

const Delete = {
    type: "Delete",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Delete
        const ctx = state.ctx as DeleteContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        while (ctx.n_ <= node.targets.length) {
            if (ctx.n_ > 0) {
                if (ctx.value_ instanceof NameRet) {
                    state.scope.del(ctx.value_.name)
                } else if (ctx.value_ instanceof SubscriptRet) {
                    const {obj, slice} = ctx.value_
                    if (obj instanceof _dict || obj instanceof _list || obj instanceof _tuple) {
                        obj.__delitem__(slice)
                    } else {
                        Assert(false, `未处理到的情况`)
                    }
                } else {
                    Assert(false, `未处理到的情况`)
                }
            }
            if (ctx.n_ < node.targets.length) {
                const [nextState, nodeValue] = newState(node.targets[ctx.n_++], state.scope)
                if (nextState) {return nextState} else {ctx.value_ = nodeValue}
            } else {
                ctx.n_++
            }
        }
        ss.pop()
        evalEnd(ss.length, state)
    }
}

export default Delete