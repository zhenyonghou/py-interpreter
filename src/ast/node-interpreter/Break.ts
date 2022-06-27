import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import { ControlKey } from './node-eval-utils/types'
import { BaseInterpreter } from './__base'

class Break extends BaseInterpreter {
    type = AstTree.NodeType.Break
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        ss.pop()
        ss.setTopCtxControl(ControlKey.Break)
    }
}

export default Break