import * as AstTree from '../ast-tree'
import {MetaFunction} from '../ast-tree/virtual-node'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import { CreateInstanceContext } from '../eval-context'
import { ConstantRet} from '../types'
import {buildMethodRunner} from './node-utils/function-run-helper'

const CreateInstance = {
    type: "CreateInstance",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.CreateInstance
        const ctx = state.ctx as CreateInstanceContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)

            // 拷贝属性
            Object.assign(ctx.obj, node.metaClass.attributes)
            // 拷贝方法
            Object.assign(ctx.obj, node.metaClass.methods)
        }

        // 调用构造函数
        if (!ctx.initDone_ && "__init__" in ctx.obj) {
            ctx.initDone_ = true
            const args = state.scope.get("args")
            // initMethod.parentScope.set("self", ctx.obj)
            return buildMethodRunner(args, null, ctx.obj, "__init__")
        }

        ss.pop()
        ss[ss.length - 1].ctx.returnData_ = new ConstantRet(ctx.obj)    // 在call上执行的，而call是从returnData_里取值的
        evalEnd(ss.length, state)
    }
}

export default CreateInstance