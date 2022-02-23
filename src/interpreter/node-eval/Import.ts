import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Assert, evalBegin, evalEnd} from '../utils'
import {ImportContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {globalDeclaration} from '../declaration'
import libModules from '../python/libs/index'

const importModule = (moduleName: string, path: string = '') => {
    if (path.length == 0) {
        if (libModules.hasOwnProperty(moduleName)) {
            globalDeclaration.set(moduleName, libModules[moduleName])
        } else {
            Assert(false, `找不到模块${moduleName}`)
        }
    } else {
        Assert(false, `找不到模块${moduleName}`)
    }
}

const Import = {
    type: "Import",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Import
        const ctx = state.ctx as ImportContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        for (let i = 0; i < node.names.length; i++) {
            let item = node.names[i]
            if (item.type == "alias") {
                importModule(item.name)   // time
            }
        }

        // 结束
        ss.pop()
        evalEnd(state)
    }
}

export default Import