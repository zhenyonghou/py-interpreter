import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {BinOpContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import {ConstantRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import {_list, _str, _tuple } from '../../python/builtins'
import { BaseInterpreter } from './__base'

class BinOp extends BaseInterpreter {
    type = AstTree.NodeType.BinOp
    interpret (ss: StateStack, state: State) {
        const node = state.node as AstTree.BinOp
        const ctx = state.ctx as BinOpContext
        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.rightDone_) {
            ctx.rightDone_ = true
            if (quickInterpret(node.right, state.scope, ss, ctx)) {
                return
            }
        }

        if (!ctx.leftDone_) {
            // 先保存right数据
            ctx.right_ = ctx.value_

            ctx.leftDone_ = true
            if (quickInterpret(node.left, state.scope, ss, ctx)) {
                return
            }
        }

        if (ctx.modeFormatting) {
            ss.pop()
            ss.setTopCtxValue(ctx.value_)
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
                    let virtualNode = new AstTree.ModFormat()
                    virtualNode.left = leftValue
                    virtualNode.right = node.right
                    ss.push(new State(virtualNode, state.scope))
                    return
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
        ss.setTopCtxValue(new ConstantRet(value))
    }
}

export default BinOp