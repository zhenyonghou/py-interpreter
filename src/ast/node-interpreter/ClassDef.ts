import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {Scope, ScopeType} from '../../scope/scope'
import {quickInterpret} from './node-eval-utils/utils'
import {ClassDefContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { BaseInterpreter } from './__base'

/**
 * class应该有它的function级作用域
 */

class ClassDef extends BaseInterpreter {
    type = AstTree.NodeType.ClassDef
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.ClassDef
        const ctx = state.ctx as ClassDefContext

        if (!ctx.begin) {
            ctx.begin = true
            ctx.cls.classname = node.name
            ctx.scope = new Scope(ScopeType.Function, state.scope)    // 新建作用域, 用于存储类的成员

            if (!this.enter(state.node)) {
                return
            }
        }

        while (ctx.baseN_ < node.bases.length) {
            if (ctx.baseN_ > 0) {
                const cls = ScopeHelper.lookupX(state.scope, ctx.value_)
                ctx.cls.bases.push(cls)
            }
            if (quickInterpret(node.bases[ctx.baseN_++], state.scope, ss, ctx)) {
                return
            }
        }

        if (ctx.baseN_ > 0 && ctx.baseN_ == node.bases.length) {
            ctx.baseN_++    // 当ctx.baseN_大于node.bases.length来标识解析base结束，从而省去一个标识结束的变量
            const cls = ScopeHelper.lookupX(state.scope, ctx.value_)    // MateClass类型
            ctx.cls.bases.push(cls)
        }

        if (ctx.bodyN_ < node.body.length) {
            ss.push(new State(node.body[ctx.bodyN_++], ctx.scope))  // 如果将这个改成直接解释，去掉new State && push，这样就优化了class的解释。
            return
        }

        // 将scope里的属性、方法定义拷贝到cls
        ctx.scope.declaration.forEach((key: string, value: any) => {
            if (value instanceof AstTree.MetaFunction) {
                ctx.cls.methods[key] = value
            } else {
                ctx.cls.attributes[key] = value
            }
        })

        state.scope.set(node.name, ctx.cls)
        ss.pop()
    }
}

export default ClassDef