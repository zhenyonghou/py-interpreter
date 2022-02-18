import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Scope, ScopeType} from '../scope'

class FunctionDefData {
    node: AstTree.FunctionDef = null
    parentScope: Scope = null

    constructor(node: AstTree.FunctionDef, scope: Scope) {
        this.node = node
        this.parentScope = scope
    }
}

const FunctionDef = {
    type: "FunctionDef",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.FunctionDef

        const funcDefData = new FunctionDefData(node, state.scope)
        state.scope.set(node.name, funcDefData)

        ss.pop()
    }
}

export {FunctionDef, FunctionDefData}