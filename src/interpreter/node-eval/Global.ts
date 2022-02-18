import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'

const Global = {
    type: "Global",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Global
        
        node.names.forEach(name => {
            state.scope.addGlobal(name)
        })

        ss.pop()
    }
}

export default Global