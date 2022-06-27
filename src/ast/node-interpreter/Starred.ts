import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {StarredContext} from '../interpret-context'
import {StarredRet} from './node-eval-utils/types'
import { BaseInterpreter } from './__base'

class Starred extends BaseInterpreter {
    type = AstTree.NodeType.Starred
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.Starred

        ss.pop()
        ss.setTopCtxValue(new StarredRet(node.value.id))
    }
}

export default Starred