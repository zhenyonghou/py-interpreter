import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {evalBegin, evalEnd} from '../utils'
import { newState } from './node-utils/utils'
import {BinOpContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {ConstantRet} from '../types'
import {ModFormat} from '../ast-tree'
import {_list, _str, _tuple } from '../python/builtins'

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
            const [nextState, nodeValue] = newState(node.right, state.scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
        }

        if (!ctx.leftDone_) {
            // 先保存right数据
            ctx.right_ = ctx.value_

            ctx.leftDone_ = true
            const [nextState, nodeValue] = newState(node.left, state.scope)
            if (nextState) {return nextState} else {ctx.value_ = nodeValue}
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
                if (leftValue instanceof Object) {
                    if ('__concat__' in leftValue) {
                        value = leftValue.__concat__(rightValue)
                    } else if (leftValue instanceof _str && rightValue instanceof _str) {
                        let s = leftValue._obj.concat(rightValue._obj)
                        value = new _str(s)
                    }
                } else {
                    value = leftValue + rightValue
                }
                break
            case 'Sub':
                value = leftValue - rightValue
                break
            case 'Mult':
                if ((leftValue instanceof _list || leftValue instanceof _tuple) && typeof rightValue == 'number') {
                    value = leftValue
                    for (let i = 0; i < rightValue; i++) {
                        value = value.__concat__(leftValue)
                    }
                } else {
                    value = leftValue * rightValue
                }
                break
            case 'Div':
                value = leftValue / rightValue
                break
            case 'FloorDiv':
                value = Math.floor(leftValue / rightValue)
                break
            case 'Mod':
                if (typeof leftValue == 'number' && typeof rightValue == 'number') {
                    value = leftValue % rightValue
                } else if (leftValue instanceof _str) {
                    ctx.modeFormatting = true
                    let fakeNode = new ModFormat()
                    fakeNode.left = leftValue
                    fakeNode.right = node.right
                    return new State(fakeNode, state.scope)
                }
                break;
            case 'Pow':
                value = leftValue ** rightValue
                break
            case 'BitAnd':
                value = leftValue & rightValue
                break
            case 'BitOr':
                value = leftValue | rightValue
                break
            case 'BitXor':
                value = leftValue ^ rightValue
                break
            case 'LShift':
                value = leftValue << rightValue
                break
            case 'RShift':
                value = leftValue >> rightValue
                break
            default:
                throw SyntaxError('未处理的op: ' + operator);
        }

        ss.pop()
        ss[ss.length - 1].ctx.value_ = new ConstantRet(value)
        evalEnd(state)
    }
}

export default BinOp