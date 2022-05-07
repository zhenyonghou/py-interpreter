import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {ModuleContext} from '../interpret-context'
import { BaseInterpreter } from './__base'

class Module extends BaseInterpreter {
    type = AstTree.NodeType.Module
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Module
        const ctx = state.ctx as ModuleContext
        if (!this.askWhenBegin(state)) {
            return
        }

        if (ctx.n_ < node.body.length) {
            ss.push(new State(node.body[ctx.n_++], state.scope))
            return
        }

        ctx.done_ = true
        this.end(this.type, state.node)
    }
}

export default Module