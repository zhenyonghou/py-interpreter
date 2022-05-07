import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {Scope, ScopeType} from '../../scope/scope'
import {ClassDefContext} from '../interpret-context'
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
            if (!this.beginStep(this.type, state.node)) {
                return
            }
        }

        if (ctx.bodyN_ < node.body.length) {
            ss.push(new State(node.body[ctx.bodyN_++], ctx.scope))
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