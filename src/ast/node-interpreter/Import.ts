import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {_assert} from '../../common/functions'
import libModules from '../../python/libs/index'
import { Scope } from '../../scope/scope'
import { BaseInterpreter } from './__base'

const importModule = (scope: Scope, moduleName: string, path: string = '') => {
    if (path.length == 0) {
        if (libModules.hasOwnProperty(moduleName)) {
            scope.set(moduleName, libModules[moduleName])
        } else {
            _assert(false, `找不到模块${moduleName}`)
        }
    } else {
        _assert(false, `找不到模块${moduleName}`)
    }
}

class Import extends BaseInterpreter {
    type = AstTree.NodeType.Import
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.Import

        for (let i = 0; i < node.names.length; i++) {
            let item = node.names[i]
            if (item.type == "alias") {
                importModule(state.scope, item.name)   // time
            }
        }

        // 结束
        ss.pop()
    }
}

export default Import