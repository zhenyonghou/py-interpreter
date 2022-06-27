import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {ModuleContext} from '../interpret-context'
import { BaseInterpreter } from './__base'

class Module extends BaseInterpreter {
    type = AstTree.NodeType.Module
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.Module
        const ctx = state.ctx as ModuleContext

        if (ctx.n_ < node.body.length) {
            ss.push(new State(node.body[ctx.n_++], state.scope))
            return
        }

        ctx.done_ = true
        this.exit(state.node)
    }
}

export default Module