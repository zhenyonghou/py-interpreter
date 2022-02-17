import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Scope, ScopeType} from '../scope'
import {evalBegin, evalEnd, Assert} from '../utils'
import {CallContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { ConstantRet, keywordRet, StarredRet} from '../types'
import {FunctionDefData} from './FunctionDef'
import Tuple from '../python-builtins/py-tuple'

/**
 * 函数调用
 * 在执行func.apply时，如果是内置函数，直接返回结果；如果是自己写的函数，返回一个State，函数体在返回的State里执行
 * 
 * 调用自定义函数时候，参数处理过于麻烦，比如需要处理defaults, keywords, *args, **kwargs
 * 当处理keywords时发现在createFunctionRun里处理受限制，所以逻辑调整为在call里处理：
 * call里通过函数名称在scope里找到函数对象，从而获得形参和body，同时call里又有实参，是处理参数的理想场所。
 */

/**
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
                if (arg.type == "arg") {
                    if (actualArgs.length > 0 && i < actualArgs.length) {
                        funcScope.set(arg.arg, actualArgs[inputArgsIndex++])
                    } else {
                        break
                    }
                } else {
                    Assert(false, `不支持的类型:${arg.type}`)
                }
            }
        }

        // 处理defaults
        if (formalArgsNode.defaults && inputArgsIndex < formalArgsNode.args.length) {
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
            funcScope.set(varArgName, new Tuple(...restArgs))
        }

        // 处理keywords
        if (actualKeywordArgs && actualKeywordArgs.length > 0) {
            for (let i = 0; i < actualKeywordArgs.length; i++) {
                let kw = actualKeywordArgs[i]
                funcScope.set(kw.arg, kw.value)
            }
        }
    }

    // 创建一个自定义Node, FunctionRun， 包装成一个State, 在State里执行
    const fakeNode = new AstTree.FunctionRun()
    fakeNode.body = funcDefData.node.body
    return new State(fakeNode, funcScope)
}

const Call = {
    type: "Call",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Call
        const ctx = state.ctx as CallContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (ctx.funcStep_ == 0) {   // 解析func
            ctx.funcStep_ ++
            return new State(node.func, state.scope)
        }

        if (ctx.funcStep_ == 1) {   // 解析完func
            ctx.funcStep_ ++
            ctx.func_ = ctx.value_

            ctx.args_ = []
            ctx.argN_ = 0
        }

        if (node.args && ctx.argN_ <= node.args.length) { // args not done
            if (ctx.argN_ > 0) {
                if (ctx.value_ instanceof StarredRet) {
                    const list = ScopeHelper.lookupX(state.scope, ctx.value_.name) as Array<any>
                    ctx.args_.push(...list)
                } else {
                    const arg = ScopeHelper.lookupX(state.scope, ctx.value_)
                    ctx.args_.push(arg)
                }
            }

            if (ctx.argN_ < node.args.length) {
                return new State(node.args[ctx.argN_++], state.scope)
            } else {
                ctx.argN_++
            }
        }

        // 解释keywords
        if (node.keywords && ctx.keywordsN_ <= node.keywords.length) {
            if (ctx.keywordsN_ > 0) {
                ctx.keywords_.push(ctx.value_)  // item是keywordRet
            }
            if (ctx.keywordsN_ < node.keywords.length) {
                return new State(node.keywords[ctx.keywordsN_++], state.scope)
            } else {
                ctx.keywordsN_++
            }
        }

        if (!ctx.doneExec_) {
            ctx.doneExec_ = true

            const func = ScopeHelper.lookupX(state.scope, ctx.func_)
            if (func instanceof FunctionDefData) {
                // 解释自定义函数: 绑定参数, 将body包装成state返回
                return runFunction(ctx.args_, ctx.keywords_, func)
            } else {
                const ret = func.apply(null, ctx.args_)
                ss.pop()
                ss[ss.length - 1].ctx.value_ = new ConstantRet(ret)
                evalEnd(state)
                return
            }
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = ctx.returnData_
        evalEnd(state)
    }
}

export default Call