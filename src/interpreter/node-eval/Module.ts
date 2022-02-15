import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {ModuleContext} from '../eval-context'

const Module = {
    type: "Module",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Module
        const ctx = state.ctx as ModuleContext

        let expression = node.body.shift()
        if (expression) {
            ctx.done_ = false
            return new State(expression, state.scope)
        }
        ctx.done_ = true
    }
}

export default Module