import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import { CreateInstanceContext } from '../interpret-context'
import { ConstantRet} from './node-eval-utils/types'
import {buildMethodRunner} from './node-eval-utils/function-run-helper'
import { BaseInterpreter } from './__base'

class CreateInstance extends BaseInterpreter {
    type = AstTree.NodeType.CreateInstance
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.CreateInstance
        const ctx = state.ctx as CreateInstanceContext
        if (!ctx.begin) {
            ctx.begin = true

            // 拷贝属性
            Object.assign(ctx.obj, node.metaClass.attributes)
            // 拷贝方法
            Object.assign(ctx.obj, node.metaClass.methods)

            if (!this.enter(state.node)) {
                return
            }
        }

        // 调用构造函数
        if (!ctx.initDone_ && "__init__" in ctx.obj) {
            ctx.initDone_ = true
            const args = state.scope.get("args")
            // initMethod.parentScope.set("self", ctx.obj)
            ss.push(buildMethodRunner(args, null, ctx.obj, "__init__"))
            return
        }

        ss.pop()
        ss.setTopCtxReturn(new ConstantRet(ctx.obj))    // 在call上执行的，而call是从returnData_里取值的
        this.exit(state.node)
    }
}

export default CreateInstance