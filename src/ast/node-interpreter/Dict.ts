import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {DictContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import {ConstantRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import { BaseInterpreter } from './__base'

class Dict extends BaseInterpreter {
    type = AstTree.NodeType.Dict
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Dict
        const ctx = state.ctx as DictContext
        if (!this.askWhenBegin(state)) {
            return
        }

        while (ctx.valueIndex_ <= node.values.length) {
            if (ctx.valueIndex_ > 0) {
                let key = node.keys[ctx.valueIndex_ - 1].value
                const v = ScopeHelper.lookupX(state.scope, ctx.value_)
                ctx.dict_.__setitem__(key, v)
            }

            if (ctx.valueIndex_ < node.values.length) {
                if (quickInterpret(node.values[ctx.valueIndex_++], state.scope, ss, ctx)) {
                    return
                }
            } else {
                ctx.valueIndex_++
            }
        }

        ss.pop()
        ss.setTopCtxValue(new ConstantRet(ctx.dict_))
    }
}

export default Dict