import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import { CreateInstanceContext } from '../eval-context'
import { ConstantRet } from '../types'
import { runFunction } from './node-utils/run-function'
import { FunctionDefData } from './FunctionDef'

const CreateInstance = {
    type: "CreateInstance",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.CreateInstance
        const ctx = state.ctx as CreateInstanceContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)

            // 拷贝属性
            Object.assign(ctx.obj, node.metaClass.attributes)
            // 拷贝方法
            Object.assign(ctx.obj, node.metaClass.methods)
        }

        // 调用构造函数
        if (!ctx.initDone_ && "__init__" in ctx.obj) {
            ctx.initDone_ = true
            const args = [ctx.obj].concat(state.scope.get("args"))
            const initMethod = ctx.obj["__init__"] as FunctionDefData
            // initMethod.parentScope.set("self", ctx.obj)
            return runFunction(args, null, initMethod)
        }

        ss.pop()
        ss[ss.length - 1].ctx.returnData_ = new ConstantRet(ctx.obj)    // 在call上执行的，而call是从returnData_里取值的
        evalEnd(state)
    }
}

export default CreateInstance