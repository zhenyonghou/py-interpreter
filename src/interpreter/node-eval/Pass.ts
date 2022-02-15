import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {PassContext} from '../eval-context'

const Pass = {
    type: "Pass",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Pass
        const ctx = state.ctx as PassContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        ss.pop()
        evalEnd(state)
    }
}

export default Pass