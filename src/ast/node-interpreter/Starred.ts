import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {StarredContext} from '../interpret-context'
import {StarredRet} from './node-eval-utils/types'
import { BaseInterpreter } from './__base'

class Starred extends BaseInterpreter {
    type = AstTree.NodeType.Starred
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Starred
        const ctx = state.ctx as StarredContext

        if (!this.askWhenBegin(state)) {
            return
        }

        // const v = ScopeHelper.lookupX(state.scope, node.value.id)

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new StarredRet(node.value.id)
    }
}

export default Starred