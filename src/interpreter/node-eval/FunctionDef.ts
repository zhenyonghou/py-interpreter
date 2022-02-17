import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Scope, ScopeType} from '../scope'
import {Assert, evalBegin, evalEnd} from '../utils'
// import {FunctionDefContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import Tuple from '../python-builtins/py-tuple'

const createFunction = (node: AstTree.FunctionDef, scope: Scope) => {
    const createFunctionRunState = function () {
        console.log("Call里执行函数:", node.name)

        let newScope = new Scope(ScopeType.Function, scope)
        newScope.set('this', this)
        newScope.set('arguments', arguments)

        // 处理参数
        const argsNode = node.args
        if (argsNode) {
            let inputArgsIndex = 0
            // 处理args
            if (argsNode.args.length > 0) {
                for (let i = 0; i < argsNode.args.length; i++) {
                    const arg = argsNode.args[i]
                    if (arg.type == "arg") {
                        if (i < arguments.length) {
                            newScope.set(arg.arg, arguments[inputArgsIndex++])
                        } else {
                            break
                        }
                    } else {
                        Assert(false, `不支持的类型:${arg.type}`)
                    }
                }
            }

            // 处理defaults
            if (argsNode.defaults && inputArgsIndex < argsNode.args.length) {
                let defaultIndex = argsNode.defaults.length - 1
                for (let i = argsNode.args.length - 1; i >= inputArgsIndex; i--) {
                    const arg = argsNode.args[i]
                    if (arg.type == "arg") {
                        const defaultItem = argsNode.defaults[defaultIndex--]
                        newScope.set(arg.arg, defaultItem.value)
                    } else {
                        throw new Error(`在缺省参数里, arg.type必须为"arg"`)
                    }
                }
            }

            // 处理vararg
            if (argsNode.vararg && inputArgsIndex < arguments.length) {
                const varArgName = argsNode.vararg.arg

                let restArgs = []
                for (let i = inputArgsIndex; i < arguments.length; i++) {
                    restArgs.push(arguments[i])
                }
                // 在python里vararg是tuple类型，而不是数组，所以做成了Tuple类型
                newScope.set(varArgName, new Tuple(...restArgs))
            }
        }

        // 创建一个自定义Node, FunctionRun， 包装成一个State, 在State里执行
        const fakeNode = new AstTree.FunctionRun()
        fakeNode.body = node.body
        return new State(fakeNode, newScope)
    }

    return createFunctionRunState
}

class FunctionDefData {
    node: AstTree.FunctionDef = null
    parentScope: Scope = null

    constructor(node: AstTree.FunctionDef, scope: Scope) {
        this.node = node
        this.parentScope = scope
    }
}

const FunctionDef = {
    type: "FunctionDef",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.FunctionDef
        // const ctx = state.ctx as FunctionDefContext
        // if (!ctx.begin) {
        //     ctx.begin = true
        //     evalBegin(state)
        // }

        const funcDefData = new FunctionDefData(node, state.scope)
        state.scope.set(node.name, funcDefData)

        // 定义函数
        // state.scope.set(node.name, createFunction(node, state.scope))

        // 结束
        ss.pop()
        // evalEnd(state)
    }
}

export {FunctionDef, FunctionDefData}