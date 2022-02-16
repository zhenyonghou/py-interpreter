import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import { ControlKey } from '../types'

const Break = {
    type: "Break",
    eval: (ss: StateStack, state: State) => {
        // const node = state.node as AstTree.Pass
        // if (!ctx.begin) {
        //     ctx.begin = true
        //     evalBegin(state)
        // }

        ss.pop()
        ss[ss.length - 1].ctx.control_ = ControlKey.Break
        // evalEnd(state)
    }
}

export default Break