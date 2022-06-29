import * as AstTree from '../../ast-node'
import {State} from '../../../state'
import {Scope, ScopeType} from '../../../scope/scope'
import {createContext, CreateInstanceContext} from '../../interpret-context'

// 创建一个对象，由于比较复杂，涉及到init调用，所以包装成一个State, 在State里执行
const createInstance = (args: Array<any>, metaCls: AstTree.MetaClass, isSuper: boolean):State => {
    const funcScope = new Scope(ScopeType.Function, null)    // 新建作用域
    funcScope.set("args", args)

    const virtualNode = new AstTree.CreateInstance()
    virtualNode.metaClass = metaCls

    const ctx = createContext(virtualNode) as CreateInstanceContext
    if (!isSuper) { // 父类的__init__函数不自动调用
        ctx.callInit_ = true
    }

    return new State(virtualNode, funcScope, ctx)
}

export {createInstance}