import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {CallContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { AttributeRet, ConstantRet, NameRet, StarredRet, MMInstance} from './node-eval-utils/types'
import { _dict, _list, _tuple, iterate, iter} from '../../python/builtins'
import {createInstance} from './node-eval-utils/create-instance'
import {quickInterpret} from './node-eval-utils/utils'
import {buildFunctionRunner, buildMethodRunner} from './node-eval-utils/function-run-helper'
import { BaseInterpreter } from './__base'
import { _assert } from '../../common/functions'
/**
 * 函数调用
 * 在执行func.apply时，如果是内置函数，直接返回结果；如果是自己写的函数，返回一个State，函数体在返回的State里执行
 * 
 * 调用自定义函数时候，参数处理过于麻烦，比如需要处理defaults, keywords, *args, **kwargs
 * 当处理keywords时发现在createFunctionRun里处理受限制，所以逻辑调整为在call里处理：
 * call里通过函数名称在scope里找到函数对象，从而获得形参和body，同时call里又有实参，是处理参数的理想场所。
 */

class Call extends BaseInterpreter {
    type = AstTree.NodeType.Call
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Call
        const ctx = state.ctx as CallContext

        if (!this.askWhenBegin(state)) {
            return
        }

        if (ctx.funcStep_ == 0) {   // 解析func
            ctx.funcStep_ ++
            if (quickInterpret(node.func, state.scope, ss, ctx)) {
                return
            }
        }

        if (ctx.funcStep_ == 1) {   // 解析完func
            ctx.funcStep_ ++
            ctx.func_ = ctx.value_

            ctx.args_ = []
            ctx.argN_ = 0
        }

        while (node.args && node.args.length > 0 && ctx.argN_ <= node.args.length) {
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
                if (quickInterpret(node.args[ctx.argN_++], state.scope, ss, ctx)) {
                    return
                }
            } else {
                ctx.argN_++
            }
        }

        // 解释keywords
        if (node.keywords && node.keywords.length > 0) {
            while (ctx.keywordsN_ <= node.keywords.length) {
                if (ctx.keywordsN_ > 0) {
                    ctx.keywords_.push(ctx.value_)  // item是keywordRet
                }
                if (ctx.keywordsN_ < node.keywords.length) {
                    if (quickInterpret(node.keywords[ctx.keywordsN_++], state.scope, ss, ctx)) {
                        return
                    }
                } else {
                    ctx.keywordsN_++
                }
            }
        }

        if (!ctx.doneExec_) {
            ctx.doneExec_ = true

            if (ctx.func_ instanceof AttributeRet) {
                const {obj, attr} = ctx.func_
                let objRef = obj
                let func = null

                if (objRef instanceof MMInstance) {
                    let _obj = obj
                    while(_obj) {
                        if (_obj.hasOwnProperty(attr)) {
                            func = _obj[attr]
                            objRef = _obj
                            break
                        }
    
                        if (_obj.bases.length > 0) {
                            _obj = _obj.bases[0]
                        } else {
                            _obj = null
                        }
                    }

                    if (obj == null) {
                        throw new Error(`找不到对象的方法:${attr}`)
                    }
                } else {
                    func = objRef[attr]
                }
                if (func == undefined) {
                    throw new Error(`${objRef.constructor.name}类型不包含${attr}属性或方法`)
                }

                // 这里的func可能是FunctionDefData类型，参见code_400:x.f()
                if (func instanceof AstTree.MetaFunction) {
                    ss.push(buildMethodRunner(ctx.args_, ctx.keywords_, objRef, attr))
                    return
                } else {
                    const ret = func.apply(objRef, ctx.args_)
                    ctx.returnData_ = new ConstantRet(ret)
                }
            } else if (ctx.func_ instanceof NameRet) {
                if (ctx.func_.name == 'super') {
                    const obj = ScopeHelper.lookupX(state.scope, 'self') as MMInstance
                    _assert(obj && obj.bases.length > 0)
                    ctx.returnData_ = new ConstantRet(obj.bases[0])
                } else {
                    const func = ScopeHelper.lookupX(state.scope, ctx.func_)
                    if (func instanceof AstTree.MetaFunction) {
                        ss.push(buildFunctionRunner(ctx.args_, ctx.keywords_, func))
                        return
                    } else if (func instanceof AstTree.MetaClass) { // x = MyClass()
                        // 初始化类的对象，包装成state返回
                        ss.push(createInstance(ctx.args_, func, false))
                        return
                    } else {
                        const ret = func.apply(null, ctx.args_)
                        ctx.returnData_ = new ConstantRet(ret)
                    }
                }
            }
        }

        ss.pop()
        ss.setTopCtxValue(ctx.returnData_)
        this.exit(state.node)
    }
}

export default Call