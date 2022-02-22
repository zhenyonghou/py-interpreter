import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {CompareContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {ConstantRet} from '../types'

const Compare = {
    type: "Compare",

    // 先解析left, 再解析第0个comparator, left与当前comparator比较完之后，把上一个comparator存入left
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.Compare
        const ctx = state.ctx as CompareContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.leftDone_) {
            ctx.leftDone_ = true
            return new State(node.left, state.scope)
        }

        if (ctx.n_ <= node.comparators.length) {
            if (ctx.n_ == 0) {  // 解析left之后, 解析第0个comparator
                ctx.left_ = ctx.value_
                return new State(node.comparators[ctx.n_++], state.scope)
            } else {
                // 比较
                const leftValue = ScopeHelper.lookupX(state.scope, ctx.left_)
                const rightValue = ScopeHelper.lookupX(state.scope, ctx.value_)
                const operator = node.ops[ctx.n_-1].type // 直译前一个comparator operator
                switch(operator) {
                    case "Eq":
                        if (leftValue != rightValue) {  // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            evalEnd(state)
                            return
                        }
                        break
                    case "NotEq":
                        if (leftValue == rightValue) {  // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            evalEnd(state)
                            return
                        }
                        break
                    case "Gt":
                        if (leftValue <= rightValue) {  // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            evalEnd(state)
                            return
                        }
                        break
                    case "GtE":
                        if (leftValue < rightValue) {  // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            evalEnd(state)
                            return
                        }
                        break
                    case "Lt":
                        if (leftValue >= rightValue) {  // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            evalEnd(state)
                            return
                        }
                        break
                    case "LtE":
                        if (leftValue > rightValue) {  // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            evalEnd(state)
                            return
                        }
                        break
                    case "In":
                        if (!(rightValue.__contains__(leftValue))) {  // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            evalEnd(state)
                            return
                        }
                        break
                    case "NotIn":
                        if (rightValue.__contains__(leftValue)) {  // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            evalEnd(state)
                            return
                        }
                        break
                    default:
                        throw new Error(`未实现的操作符${operator}`)
                }

                if (ctx.n_ < node.comparators.length) {
                    ctx.left_ = ctx.value_
                    return new State(node.comparators[ctx.n_++], state.scope)
                } else { // 结束
                    ss.pop()
                    ss[ss.length - 1].ctx.value_ = new ConstantRet(true)
                    evalEnd(state)
                    return
                }
            }
        }

        ss.pop()
        evalEnd(state)
    }
}

export default Compare