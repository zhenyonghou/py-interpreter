import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {AssignContext} from '../eval-context'
import {evalBegin, evalEnd} from '../utils'

const Assign = {
    type: "Assign",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Assign
        const ctx = state.ctx as AssignContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            return new State(node.value, state.scope)
        }

        // 解析完成value之后
        if (ctx.targetIndex_ == 0) {
            ctx.assignValue_ = ctx.value_
        }

        // 处理上一次解析完的target(变量名)
        if (ctx.targetIndex_ > 0) {
            state.scope.assign(ctx.value_, ctx.assignValue_)
        }

        if (ctx.targetIndex_ < node.targets.length) {
            return new State(node.targets[ctx.targetIndex_++], state.scope)
        }

        ss.pop()
        evalEnd(state)
    }
}

export default Assign