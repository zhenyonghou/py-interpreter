import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import { BaseInterpreter } from './__base'

class Global extends BaseInterpreter {
    type = AstTree.NodeType.Global
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Global
        if (!this.askWhenBegin(state)) {
            return
        }

        node.names.forEach(name => {
            state.scope.addGlobal(name)
        })

        ss.pop()
        return
    }
}

export default Global