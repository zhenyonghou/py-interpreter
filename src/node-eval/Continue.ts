import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import { ControlKey } from '../types'

const Continue = {
    type: "Continue",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.control_ = ControlKey.Continue
    }
}

export default Continue