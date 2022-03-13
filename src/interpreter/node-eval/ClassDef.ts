import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Scope, ScopeType} from '../scope'
import {evalBegin, evalEnd, Assert as __assert} from '../utils'
import {ClassDefContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { FunctionDefData } from './FunctionDef'
import { StepAttr } from '../types'

/**
 * class应该有它的function级作用域
 */

const ClassDef = {
    type: "ClassDef",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.ClassDef
        const ctx = state.ctx as ClassDefContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)

            ctx.cls.classname = node.name
            ctx.scope = new Scope(ScopeType.Function, state.scope)    // 新建作用域, 用于存储类的成员
        }

        if (ctx.bodyN_ < node.body.length) {
            return new State(node.body[ctx.bodyN_++], ctx.scope, StepAttr.Stay)
        }

        // 将scope里的属性、方法定义拷贝到cls
        ctx.scope.declaration.forEach((key: string, value: any) => {
            if (value instanceof FunctionDefData) {
                ctx.cls.methods[key] = value
            } else {
                ctx.cls.attributes[key] = value
            }
        })

        state.scope.set(node.name, ctx.cls)

        ss.pop()
        evalEnd(state)
    }
}

export default ClassDef