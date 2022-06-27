import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import { BaseInterpreter } from './__base'

class FunctionDef extends BaseInterpreter {
    type = AstTree.NodeType.FunctionDef
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.FunctionDef
        if (!this.askWhenBegin(state)) {
            return
        }

        const metaFunc = new AstTree.MetaFunction(node, state.scope)
        state.scope.set(node.name, metaFunc)

        ss.pop()
    }
}

export default FunctionDef