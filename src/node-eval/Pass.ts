import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import { ControlKey } from '../types'

const Pass = {
    type: "Pass",
    eval: (ss: StateStack, state: State) => {
        ss.pop()
        ss[ss.length - 1].ctx.control_ = ControlKey.Pass
    }
}

export default Pass