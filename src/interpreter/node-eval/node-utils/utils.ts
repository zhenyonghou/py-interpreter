import * as AstTree from '../../ast-tree'
import {Scope, ScopeType} from '../../scope'
import { State } from '../../state'
import {Name, transName} from '../Name'
import {Constant, transConstant} from '../Constant'

/**
 * 返回[state, value], 当state位置为null时取value, 否则取state
 */
const newState = (node: AstTree.Node, scope: Scope) => {
    if (node.type == Name.type) {
        return [null, transName(node as AstTree.Name)]
    } else if (node.type == Constant.type) {
        return [null, transConstant(node as AstTree.Constant)]
    }
    return [new State(node, scope), null]
}

export {newState}