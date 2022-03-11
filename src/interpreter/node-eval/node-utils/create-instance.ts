import * as AstTree from '../../ast-tree'
import {State} from '../../state'
import {Scope, ScopeType} from '../../scope'
import { MetaClass } from '../../types'

// 创建一个对象，由于比较复杂，涉及到init调用，所以包装成一个State, 在State里执行
const createInstance = (args: Array<any>, metaCls: MetaClass) => {
    const funcScope = new Scope(ScopeType.Function, null)    // 新建作用域
    funcScope.set("args", args)

    const fakeNode = new AstTree.CreateInstance()
    fakeNode.metaClass = metaCls
    return new State(fakeNode, funcScope)
}

export {createInstance}