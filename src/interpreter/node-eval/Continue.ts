import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import { ControlKey } from '../types'

const Continue = {
    type: "Continue",
    eval: (ss: StateStack, state: State) => {
        // const node = state.node as AstTree.Continue
        // if (!ctx.begin) {
        //     ctx.begin = true
        //     evalBegin(state)
        // }

        ss.pop()
        ss[ss.length - 1].ctx.control_ = ControlKey.Continue
        // evalEnd(state)
    }
}

export default Continue