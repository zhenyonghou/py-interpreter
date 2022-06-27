import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {ConstantContext} from '../interpret-context'
import {ConstantRet} from './node-eval-utils/types'
import { _str } from '../../python/builtins'
import { BaseInterpreter } from './__base'

class Constant extends BaseInterpreter {
    type = AstTree.NodeType.Constant
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Constant

        let _ret = null
        if (typeof node.value == 'string') {
            _ret = new _str(node.value)
        } else {
            _ret = node.value
        }

        ss.pop()
        ss.setTopCtxValue(new ConstantRet(_ret))
    }
}

export default Constant