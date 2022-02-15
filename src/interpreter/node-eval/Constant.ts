import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {ConstantContext} from '../eval-context'
import {evalBegin, evalEnd} from '../utils'
import {ConstantRet} from '../types'

const Constant = {
    type: "Constant",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Constant
        const ctx = state.ctx as ConstantContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new ConstantRet(node.value)
        evalEnd(state)
    }
}

export default Constant