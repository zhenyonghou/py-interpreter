import * as AstTree from '../ast-node'
import {Scope, ScopeType} from '../../scope/scope'
import {State, StateStack} from '../../state'
import {BaseEvalContext} from '../interpret-context'
import {transName, transConstant } from './node-eval-utils/utils'

interface INodeInterpreter {
    type: AstTree.NodeType

    beginStep: (ty: AstTree.NodeType, node: AstTree.Node) => boolean
    keyStep: (ty: AstTree.NodeType, node: AstTree.Node) => void
    end: (ty: AstTree.NodeType, node: AstTree.Node) => void

    // 返回下一个State
    interpret(ss: StateStack, state: State): void
}

class BaseInterpreter implements INodeInterpreter {
    type: AstTree.NodeType

    // 开始时回调，返回true则继续执行; 返回false停止执行, 可在debug时使用
    beginStep: (ty: AstTree.NodeType, node: AstTree.Node) => boolean

    // 解析过程中触发，比如For循环里当过完一次循环时还需停留到For语句上
    // 如果以后debugger里通过上下文判断停留的话，这个可以去掉
    keyStep: (ty: AstTree.NodeType, node: AstTree.Node) => void

    // 解析结束时回调
    end: (ty: AstTree.NodeType, node: AstTree.Node) => void

    // 当本节点开始解释时，先询问解释器(解释器会询问debugger)是否停留，返回false停留，否则继续执行
    protected askWhenBegin(state: State) : boolean {
        if (!state.ctx.begin) {
            state.ctx.begin = true
            return this.beginStep(this.type, state.node)
        }
        return true
    }

    /**
     * 
     * 准备解释node
     * @returns 如果需要解释，返回true, 否则返回false
     */
    protected prepareInterpret(node: AstTree.Node, scope: Scope, ss: StateStack, ctx: BaseEvalContext) : boolean {
        if (node.type == "Name") {
            ctx.value_ = transName(node as AstTree.Name)
        } else if (node.type == "Constant") {
            ctx.value_ = transConstant(node as AstTree.Constant)
        } else {
            ss.push(new State(node, scope))
            return true
        }
        return false
    }

    // 由子类去实现
    interpret(ss: StateStack, state: State) {

    }
}

export {BaseInterpreter, INodeInterpreter}