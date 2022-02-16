import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {Scope, ScopeType} from '../scope'
import {evalBegin, evalEnd} from '../utils'
import {FunctionDefContext} from '../eval-context'

const createFunction = (node: AstTree.FunctionDef, scope: Scope) => {
    const createFunctionRunState = function () {
        console.log("Call里执行函数:", node.name)

        let newScope = new Scope(ScopeType.Function, scope)
        newScope.set('this', this)
        newScope.set('arguments', arguments)

        // 处理参数
        if (node.args) {
            for (let i = 0; i < node.args.args.length; i++) {
                const arg = node.args.args[i]
                if (i < arguments.length) {
                    newScope.set(arg.arg, arguments[i])
                } else {
                    newScope.set(arg.arg, null) // 设置缺省参数
                }
            }
        }

        // 创建一个自定义Node, FunctionRun， 包装成一个State, 在State里执行
        const fakeNode = new AstTree.FunctionRun()
        fakeNode.body = node.body
        return new State(fakeNode, newScope)
    }

    return createFunctionRunState
}

const FunctionDef = {
    type: "FunctionDef",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.FunctionDef
        const ctx = state.ctx as FunctionDefContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        // 定义函数
        state.scope.set(node.name, createFunction(node, state.scope))

        // 结束
        ss.pop()
        evalEnd(state)
    }
}

export default FunctionDef