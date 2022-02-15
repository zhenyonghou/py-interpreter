import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {NameContext} from '../eval-context'
import { NameRet } from '../types'

const Name = {
    type: "Name",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Name
        const ctx = state.ctx as NameContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new NameRet(node.id)
        evalEnd(state)
    }
}

export default Name