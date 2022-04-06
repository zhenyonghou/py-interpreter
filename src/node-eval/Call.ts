import * as AstTree from '../ast-tree'
import { MetaClass, MetaFunction } from '../ast-tree/virtual-node'
import {State, StateStack} from '../state'
import { newState } from './node-utils/utils'
import {evalBegin, evalEnd} from '../utils'
import {CallContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import { AttributeRet, ConstantRet, NameRet, StarredRet} from '../types'
import { _dict, _list, _tuple, iterate, iter} from '../python/builtins'
import {createInstance} from './node-utils/create-instance'
import {buildFunctionRunner, buildMethodRunner} from './node-utils/function-run-helper'
/**
 * 函数调用
 * 在执行func.apply时，如果是内置函数，直接返回结果；如果是自己写的函数，返回一个State，函数体在返回的State里执行
 * 
 * 调用自定义函数时候，参数处理过于麻烦，比如需要处理defaults, keywords, *args, **kwargs
 * 当处理keywords时发现在createFunctionRun里处理受限制，所以逻辑调整为在call里处理：
 * call里通过函数名称在scope里找到函数对象，从而获得形参和body，同时call里又有实参，是处理参数的理想场所。
 */

const Call = {
    type: "Call",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Call
        const ctx = state.ctx as CallContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(ss.length, state)
        }

        if (ctx.funcStep_ == 0) {   // 解析func
            ctx.funcStep_ ++
            const [nextState, nodeValue] = newState(node.func, state.scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        if (ctx.funcStep_ == 1) {   // 解析完func
            ctx.funcStep_ ++
            ctx.func_ = ctx.value_

            ctx.args_ = []
            ctx.argN_ = 0
        }

        if (node.args) {
            while (ctx.argN_ <= node.args.length) {
                if (ctx.argN_ > 0) {
                    if (ctx.value_ instanceof StarredRet) {
                        const list = ScopeHelper.lookupX(state.scope, ctx.value_.name) as _list
                        iterate(iter(list), (item: any) => {
                            ctx.args_.push(item)
                        })
                    } else {
                        const arg = ScopeHelper.lookupX(state.scope, ctx.value_)
                        ctx.args_.push(arg)
                    }
                }

                if (ctx.argN_ < node.args.length) {
                    const [nextState, nodeValue] = newState(node.args[ctx.argN_++], state.scope)
                    if (nextState) {return nextState} else {ctx.value_ = nodeValue}
                } else {
                    ctx.argN_++
                }
            }
        }

        // 解释keywords
        if (node.keywords && node.keywords.length > 0) {
            while (ctx.keywordsN_ <= node.keywords.length) {
                if (ctx.keywordsN_ > 0) {
                    ctx.keywords_.push(ctx.value_)  // item是keywordRet
                }
                if (ctx.keywordsN_ < node.keywords.length) {
                    const [nextState, nodeValue] = newState(node.keywords[ctx.keywordsN_++], state.scope)
                    if (nextState) {return nextState} else {ctx.value_ = nodeValue}
                } else {
                    ctx.keywordsN_++
                }
            }
        }

        if (!ctx.doneExec_) {
            ctx.doneExec_ = true

            if (ctx.func_ instanceof AttributeRet) {
                const {obj, attr} = ctx.func_
                const func = obj[attr]
                // 这里的func可能是FunctionDefData类型，参见code_400:x.f()
                if (func instanceof MetaFunction) {
                    return buildMethodRunner(ctx.args_, ctx.keywords_, obj, attr)
                } else {
                    const ret = func.apply(obj, ctx.args_)
                    ctx.returnData_ = new ConstantRet(ret)
                }
            } else if (ctx.func_ instanceof NameRet) {
                const func = ScopeHelper.lookupX(state.scope, ctx.func_)
                if (func instanceof MetaFunction) {
                    return buildFunctionRunner(ctx.args_, ctx.keywords_, func)
                } else if (func instanceof MetaClass) { // x = MyClass()
                    // 初始化类的对象，包装成state返回
                    return createInstance(ctx.args_, func)
                } else {
                    const ret = func.apply(null, ctx.args_)
                    ctx.returnData_ = new ConstantRet(ret)
                }
            }
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = ctx.returnData_
        evalEnd(ss.length, state)
    }
}

export default Call