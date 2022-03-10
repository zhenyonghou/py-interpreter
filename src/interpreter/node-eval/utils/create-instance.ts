import * as AstTree from '../../ast-tree'
import {State, StateStack} from '../../state'
import {Scope, ScopeType} from '../../scope'
import {evalBegin, evalEnd, Assert} from '../../utils'
import {CallContext} from '../../eval-context'
import ScopeHelper from '../../scope-helper'
import { AttributeRet, ConstantRet, keywordRet, KV, NameRet, StarredRet} from '../../types'
import {FunctionDefData} from '../FunctionDef'
import { MetaClass } from '../../types'
import { _dict, _list, _tuple, iterate, iter} from '../../python/builtins'

// 创建一个对象，由于比较复杂，涉及到init调用，所以包装成一个State, 在State里执行
const createInstance = (args: Array<any>, metaCls: MetaClass) => {
    const funcScope = new Scope(ScopeType.Function, null)    // 新建作用域
    funcScope.set("args", args)

    const fakeNode = new AstTree.CreateInstance()
    fakeNode.metaClass = metaCls
    return new State(fakeNode, funcScope)
}

export {createInstance}