import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {Assert} from '../../utils'
import {ImportContext} from '../interpret-context'
import libModules from '../../python/libs/index'
import { Scope } from '../../scope/scope'
import { BaseInterpreter } from './__base'

const importModule = (scope: Scope, moduleName: string, path: string = '') => {
    if (path.length == 0) {
        if (libModules.hasOwnProperty(moduleName)) {
            scope.set(moduleName, libModules[moduleName])
        } else {
            Assert(false, `找不到模块${moduleName}`)
        }
    } else {
        Assert(false, `找不到模块${moduleName}`)
    }
}

class Import extends BaseInterpreter {
    type = AstTree.NodeType.Import
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Import
        if (!this.askWhenBegin(state)) {
            return
        }

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