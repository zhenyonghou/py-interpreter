import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {createInstance} from './node-eval-utils/create-instance'
import { CreateInstanceContext } from '../interpret-context'
import { ConstantRet} from './node-eval-utils/types'
import {buildMethodRunner} from './node-eval-utils/function-run-helper'
import { BaseInterpreter } from './__base'

class CreateInstance extends BaseInterpreter {
    type = AstTree.NodeType.CreateInstance
    interpret (ss: StateStack, state: State) {
        if (!this.askWhenBegin(state)) {
            return
        }

        const node = state.node as AstTree.CreateInstance
        const ctx = state.ctx as CreateInstanceContext

        if (!ctx.copyProperties_) {
            ctx.copyProperties_ = true
            // 拷贝属性和方法
            Object.assign(ctx.obj, node.metaClass.attributes)
            Object.assign(ctx.obj, node.metaClass.methods)
        }

        // 实例化父类对象
        while (node.metaClass.bases.length > 0 && ctx.baseN_ <= node.metaClass.bases.length) {
            if (ctx.baseN_ > 0) {
                ctx.obj.bases.push((ctx.returnData_ as ConstantRet).value)
            }

            if (ctx.baseN_ < node.metaClass.bases.length) {
                ss.push(createInstance([], node.metaClass.bases[ctx.baseN_++], true))
                return
            } else {
                ctx.baseN_++
            }
        }

        // 调用构造函数
        if (ctx.callInit_ && !ctx.initDone_) {
            ctx.initDone_ = true
            if ("__init__" in ctx.obj) {
                const args = state.scope.get("args")
                ss.push(buildMethodRunner(args, null, ctx.obj, "__init__"))
                return
            } else if (ctx.obj.bases.length > 0) {  // 目前比较尴尬：只检查一个父类，且只检查一层，并不检查父类的父类
                const _super = ctx.obj.bases[0]
                if ("__init__" in _super) {
                    ss.push(buildMethodRunner([], null, _super, "__init__"))
                    return
                }
            }
        }

        ss.pop()
        ss.setTopCtxReturn(new ConstantRet(ctx.obj))    // 在call上执行的，而call是从returnData_里取值的
        this.exit(state.node)
    }
}

export default CreateInstance