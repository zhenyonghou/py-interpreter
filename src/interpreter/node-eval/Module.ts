import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {ModuleContext} from '../eval-context'

const Module = {
    type: "Module",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Module
        const ctx = state.ctx as ModuleContext

        if (ctx.n_ < node.body.length) {
            return new State(node.body[ctx.n_++], state.scope)
        }

        ctx.done_ = true
    }
}

export default Module