import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import { NameRet } from './node-eval-utils/types'
import { BaseInterpreter } from './__base'

class Name extends BaseInterpreter {
    type = AstTree.NodeType.Name
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Name

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new NameRet(node.id, node.ctx.type)
    }
}

export default Name