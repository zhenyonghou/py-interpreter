import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {_assert} from '../../common/functions'

interface INodeInterpreter {
    type: AstTree.NodeType

    enter: (node: AstTree.Node) => boolean
    keyStep: (ty: AstTree.NodeType, node: AstTree.Node) => void
    exit: (node: AstTree.Node) => void

    // 返回下一个State
    interpret(ss: StateStack, state: State): void
}

/**
 * 单步停止的地方有Node开始，和Node中间过程中，如For循环里当过完一次循环时还需停留到For语句上
 */
 abstract class BaseInterpreter implements INodeInterpreter {
    type: AstTree.NodeType

    // 开始时回调，返回true则继续执行; 返回false停止执行, 可在debug时使用
    enter: (node: AstTree.Node) => boolean

    // 解析过程中触发，比如For循环里当过完一次循环时还需停留到For语句上
    // 如果以后debugger里通过上下文判断停留的话，这个可以去掉
    keyStep: (ty: AstTree.NodeType, node: AstTree.Node) => void

    // 解析结束时回调
    exit: (node: AstTree.Node) => void

    // 当本节点开始解释时，先询问解释器(解释器会询问debugger)是否停留，返回false停留，否则继续执行
    protected askWhenBegin(state: State) : boolean {
        _assert(state.node.type == this.type)
        if (!state.ctx.begin) {
            state.ctx.begin = true
            return this.enter(state.node)
        }
        return true
    }

    // 由子类去实现
    abstract interpret(ss: StateStack, state: State): void
}

export {BaseInterpreter, INodeInterpreter}