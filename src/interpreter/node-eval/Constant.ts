import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {ConstantContext} from '../eval-context'
import {evalBegin, evalEnd} from '../utils'
import {ConstantRet} from '../types'
import { _str } from '../python/builtins'

const Constant = {
    type: "Constant",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Constant
        const ctx = state.ctx as ConstantContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        let _ret = null
        if (typeof node.value == 'string') {
            _ret = new _str(node.value)
        } else {
            _ret = node.value
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new ConstantRet(_ret)
        evalEnd(state)
    }
}

export default Constant