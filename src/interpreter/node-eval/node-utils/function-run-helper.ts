import * as AstTree from '../../ast-tree'
import { MetaFunction } from '../../ast-tree/virtual-node'
import { State } from '../../state'
import { Assert } from '../../utils'
import { keywordRet } from '../../types'
import { _dict, _list, _tuple } from '../../python/builtins'

/**
 * 1. 处理参数
 * 2. 构建FunctionRun并返回state
 * 3. scope在FunctionRun内部生成吧
 */
const functionRunHelper = (actualArgs: Array<any>, actualKeywordArgs: Array<keywordRet>, metaFunc: MetaFunction) => {
    const formalArgsNode = metaFunc.node.args // 形参
    // const funcScope = new Scope(ScopeType.Function, metaFunc.parentScope)    // 新建作用域
    const argsMap = new Map()

    // 处理参数
    if (formalArgsNode) {
        let inputArgsIndex = 0
        // 处理args
        if (formalArgsNode.args.length > 0) {
            for (let i = 0; i < formalArgsNode.args.length; i++) {
                const arg = formalArgsNode.args[i]
                Assert(arg.type == "arg", `不支持的类型:${arg.type}`)
                if (i < actualArgs.length) {
                    argsMap.set(arg.arg, actualArgs[inputArgsIndex++])
                } else {
                    argsMap.set(arg.arg, undefined)   // 没传参的设置为默认值undefined
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
                    argsMap.set(arg.arg, defaultItem.value)
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
            argsMap.set(varArgName, new _tuple(restArgs))
        }

        // 处理keywords(检查形参里是否确实有该参数，有的话就处理)
        if (actualKeywordArgs && actualKeywordArgs.length > 0) {
            for (let i = 0; i < actualKeywordArgs.length; i++) {
                let kw = actualKeywordArgs[i]

                let find = formalArgsNode.args.findIndex(item => item.arg == kw.arg)
                if (find >= 0) {
                    argsMap.set(kw.arg, kw.value)
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
                            argsMap.set(k, d.__getitem__(k))
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
            argsMap.set(kwargName, dict)
        }
    }

    // 创建一个自定义Node, FunctionRun， 包装成一个State, 在State里执行
    const virtualNode = new AstTree.FunctionRun()
    virtualNode.funcDef = metaFunc.node
    virtualNode.args = argsMap
    return new State(virtualNode, metaFunc.parentScope) // 传入的scope是函数定义时的scope，
}

export default functionRunHelper