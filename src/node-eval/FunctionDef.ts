import * as AstTree from '../ast-tree'
import { MetaFunction } from '../ast-tree/virtual-node'
import {State, StateStack} from '../state'

const FunctionDef = {
    type: "FunctionDef",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.FunctionDef

        const metaFunc = new MetaFunction(node, state.scope)
        state.scope.set(node.name, metaFunc)

        ss.pop()
    }
}

export default FunctionDef