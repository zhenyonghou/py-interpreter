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

/**
 * runFunction
 * 
 * 返回state
 */
 const runFunction = (actualArgs: Array<any>, actualKeywordArgs: Array<keywordRet>, funcDefData: FunctionDefData) => {
    const formalArgsNode = funcDefData.node.args // 形参
    const funcScope = new Scope(ScopeType.Function, funcDefData.parentScope)    // 新建作用域

    if (formalArgsNode) {
        let inputArgsIndex = 0
        // 处理args
        if (formalArgsNode.args.length > 0) {
            for (let i = 0; i < formalArgsNode.args.length; i++) {
                const arg = formalArgsNode.args[i]
                Assert(arg.type == "arg", `不支持的类型:${arg.type}`)
                if (i < actualArgs.length) {
                    // if (arg.arg === "self") {   // 处理类成员函数的第一个参数: self，外层已经设了self
                    //     inputArgsIndex++
                    // } else {
                    //     funcScope.set(arg.arg, actualArgs[inputArgsIndex++])
                    // }
                    funcScope.set(arg.arg, actualArgs[inputArgsIndex++])
                } else {
                    funcScope.set(arg.arg, undefined)   // 没传参的设置为默认值undefined
                }
            }
        }

        // 处理defaults
        if (formalArgsNode.defaults.length > 0 && inputArgsIndex < formalArgsNode.args.length) {
            let defaultIndex = formalArgsNode.defaults.length - 1
            for (let i = formalArgsNode.args.length - 1; i >= inputArgsIndex; i--) {
                const arg = formalArgsNode.args[i]
                if (arg.type == "arg") {
                    const defaultItem = formalArgsNode.defaults[defaultIndex--]
                    funcScope.set(arg.arg, defaultItem.value)
                } else {
                    throw new Error(`在缺省参数里, arg.type必须为"arg"`)
                }
            }
        }

        // 处理vararg
        if (formalArgsNode.vararg && inputArgsIndex < actualArgs.length) {
            const varArgName = formalArgsNode.vararg.arg

            let restArgs = []
            for (let i = inputArgsIndex; i < actualArgs.length; i++) {
                restArgs.push(actualArgs[i])
            }
            // 在python里vararg是tuple类型，而不是数组，所以做成了Tuple类型
            funcScope.set(varArgName, new _tuple(restArgs))
        }

        // 处理keywords(检查形参里是否确实有该参数，有的话就处理)
        if (actualKeywordArgs && actualKeywordArgs.length > 0) {
            for (let i = 0; i < actualKeywordArgs.length; i++) {
                let kw = actualKeywordArgs[i]

                let find = formalArgsNode.args.findIndex(item => item.arg == kw.arg)
                if (find >= 0) {
                    funcScope.set(kw.arg, kw.value)
                }
            }
        }

        // 处理kwarg(检查形参里是否确实有该参数，没有的话就加入kwarg)
        if (formalArgsNode.kwarg) {
            const kwargName = formalArgsNode.kwarg.arg
            const dict = new _dict()
            for (let i = 0; i < actualKeywordArgs.length; i++) {
                let kw = actualKeywordArgs[i]
                if (kw.arg == null) {   // **d形式的type属keyword，但arg是null, 其value是Dict, 需要解包处理
                    const d = kw.value as _dict
                    d.keys().forEach(k => {
                        // **d里的字段如果存在于形参列表，就设置给形参，否则留在kwarg里
                        let find = formalArgsNode.args.findIndex(item => item.arg == k)
                        if (find == -1) {
                            // dict[k] = d[k]
                            dict.__setitem__(k, d.__getitem__(k))
                        } else {
                            funcScope.set(k, d.__getitem__(k))
                        }
                    })
                } else {
                    let find = formalArgsNode.args.findIndex(item => item.arg == kw.arg)
                    if (find == -1) {
                        // dict[kw.arg] = kw.value
                        dict.__setitem__(kw.arg, kw.value)
                    }
                }
            }
            funcScope.set(kwargName, dict)
        }
    }

    // 创建一个自定义Node, FunctionRun， 包装成一个State, 在State里执行
    const fakeNode = new AstTree.FunctionRun()
    fakeNode.body = funcDefData.node.body
    return new State(fakeNode, funcScope)
}

export {runFunction}