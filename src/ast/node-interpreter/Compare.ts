import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {CompareContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import {ConstantRet} from './node-eval-utils/types'
import { _str } from '../../python/builtins'
import { BaseInterpreter } from './__base'

class Compare extends BaseInterpreter {
    type = AstTree.NodeType.Compare

    // 先解析left, 再解析第0个comparator, left与当前comparator比较完之后，把上一个comparator存入left
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.Compare
        const ctx = state.ctx as CompareContext
        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.leftDone_) {
            ctx.leftDone_ = true
            if (this.prepareInterpret(node.left, state.scope, ss, ctx)) {
                return
            }
        }

        while (ctx.n_ <= node.comparators.length) {
            if (ctx.n_ == 0) {  // 解析left之后, 解析第0个comparator
                ctx.left_ = ctx.value_
                if (this.prepareInterpret(node.comparators[ctx.n_++], state.scope, ss, ctx)) {
                    return
                }
            }

            // 比较
            const leftValue = ScopeHelper.lookupX(state.scope, ctx.left_)
            const rightValue = ScopeHelper.lookupX(state.scope, ctx.value_)
            const operator = node.ops[ctx.n_-1].type // 直译前一个comparator operator
            switch(operator) {
                case "Eq":
                case "Is":
                    if (leftValue instanceof _str) {    // 通过hasOwnProperty("__eq__")判断不行，__eq__是Object的属性
                        if (!leftValue.__eq__(rightValue)) {
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            return
                        }
                    } else {
                        if (leftValue != rightValue) {  // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            return
                        }
                    }
                    break
                case "NotEq":
                case "IsNot":
                    if (leftValue instanceof _str) {
                        if (leftValue.__eq__(rightValue)) {
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            return
                        }
                    } else {
                        if (leftValue == rightValue) {  // 结束
                            ss.pop()
                            ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                            return
                        }
                    }
                    break
                case "Gt":
                    if (leftValue <= rightValue) {  // 结束
                        ss.pop()
                        ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                        return
                    }
                    break
                case "GtE":
                    if (leftValue < rightValue) {  // 结束
                        ss.pop()
                        ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                        return
                    }
                    break
                case "Lt":
                    if (leftValue >= rightValue) {  // 结束
                        ss.pop()
                        ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                        return
                    }
                    break
                case "LtE":
                    if (leftValue > rightValue) {  // 结束
                        ss.pop()
                        ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                        return
                    }
                    break
                case "In":
                    if (!(rightValue.__contains__(leftValue))) {  // 结束
                        ss.pop()
                        ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                        return
                    }
                    break
                case "NotIn":
                    if (rightValue.__contains__(leftValue)) {  // 结束
                        ss.pop()
                        ss[ss.length - 1].ctx.value_ = new ConstantRet(false)
                        return
                    }
                    break
                default:
                    throw new Error(`未实现的操作符${operator}`)
            }
            if (ctx.n_ < node.comparators.length) {
                ctx.left_ = ctx.value_
                if (this.prepareInterpret(node.comparators[ctx.n_++], state.scope, ss, ctx)) {
                    return
                }
            } else { // 结束
                ss.pop()
                ss[ss.length - 1].ctx.value_ = new ConstantRet(true)
                return
            }
        }
        ss.pop()
    }
}

export default Compare