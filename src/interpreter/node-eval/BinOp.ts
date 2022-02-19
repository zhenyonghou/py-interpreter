import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import {BinOpContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {ConstantRet} from '../types'
import {ModFormat} from '../ast-tree'

const BinOp = {
    type: "BinOp",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.BinOp
        const ctx = state.ctx as BinOpContext
        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.rightDone_) {
            ctx.rightDone_ = true
            return new State(node.right, state.scope)
        }

        if (!ctx.leftDone_) {
            // 先保存right数据
            ctx.right_ = ctx.value_

            ctx.leftDone_ = true
            return new State(node.left, state.scope)
        }

        if (ctx.modeFormatting) {
            ss.pop()
            ss[ss.length - 1].ctx.value_ = ctx.value_
            evalEnd(state)
            return
        }

        const leftValue = ScopeHelper.lookupX(state.scope, ctx.value_)
        const rightValue = ScopeHelper.lookupX(state.scope, ctx.right_)
        const operator = node.op.type

        let value
        switch(operator) {
            case 'Add':
                value = leftValue + rightValue; break;
            case 'Sub':
                value = leftValue - rightValue; break;
            case 'Mult':
                value = leftValue * rightValue; break;
            case 'Div':
                value = leftValue / rightValue; break;
            case 'Mod':
                if (typeof leftValue == 'number') {
                    value = leftValue % rightValue
                } else if (typeof leftValue == 'string') {
                    ctx.modeFormatting = true
                    // 格式化字符串
                    let fakeNode = new ModFormat()
                    fakeNode.left = (node.left as AstTree.Constant).value
                    fakeNode.right = node.right
                    return new State(fakeNode, state.scope)
                }
                break;
            case 'Pow':
                value = leftValue ** rightValue; break;
            case 'BitAnd':
                value = leftValue & rightValue; break;
            case 'BitOr':
                value = leftValue | rightValue; break;
            case 'BitXor':
                value = leftValue ^ rightValue; break;
            case 'LShift':
                value = leftValue << rightValue; break;
            case 'RShift':
                value = leftValue >> rightValue; break;
            default:
                throw SyntaxError('未处理的op: ' + operator);
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new ConstantRet(value)
        evalEnd(state)
    }
}

export default BinOp