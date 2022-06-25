import * as AstTree from '../ast-node'
import {State, StateStack} from '../../state'
import {AugAssignContext} from '../interpret-context'
import ScopeHelper from '../../scope/scope-helper'
import { NameRet, SubscriptRet} from './node-eval-utils/types'
import {quickInterpret} from './node-eval-utils/utils'
import { BaseInterpreter } from './__base'

class AugAssign extends BaseInterpreter {
    type = AstTree.NodeType.AugAssign
    interpret(ss: StateStack, state: State) {
        const node = state.node as AstTree.AugAssign
        const ctx = state.ctx as AugAssignContext

        if (!this.askWhenBegin(state)) {
            return
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            if (quickInterpret(node.value, state.scope, ss, ctx)) {
                return
            }
        }

        if (!ctx.targetDone_) {
            ctx.rightValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)
            if (quickInterpret(node.target, state.scope, ss, ctx)) {
                return
            }
        }

        const operator = node.op.type
        if (ctx.value_ instanceof NameRet) {
            let value = ScopeHelper.lookupX(state.scope, ctx.value_.name)
            switch(operator) {
                case "Add":
                    value += ctx.rightValue_
                    break
                case "Sub":
                    value -= ctx.rightValue_
                    break
                case "Mult":
                    value *= ctx.rightValue_
                    break
                case "Div":
                    value /= ctx.rightValue_
                    break
                case "Mod":
                    value %= ctx.rightValue_
                    break
                default:
                    throw new Error(`不支持的操作符${operator}`)
            }
            state.scope.set(ctx.value_.name, value)
        } else if (ctx.value_ instanceof SubscriptRet) {
            let value = ScopeHelper.lookupX(state.scope, ctx.value_)
            const {obj, slice} = ctx.value_
            switch(operator) {
                case "Add":
                    if ('__setitem__' in obj) {
                        obj.__setitem__(slice, value + ctx.rightValue_)
                    } else {
                        obj[slice] = value + ctx.rightValue_
                    }
                    break
                case "Sub":
                    if ('__setitem__' in obj) {
                        obj.__setitem__(slice, value - ctx.rightValue_)
                    } else {
                        obj[slice] = value - ctx.rightValue_
                    }
                    break
                case "Mult":
                    if ('__setitem__' in obj) {
                        obj.__setitem__(slice, value * ctx.rightValue_)
                    } else {
                        obj[slice] = value * ctx.rightValue_
                    }
                    break
                case "Div":
                    if ('__setitem__' in obj) {
                        obj.__setitem__(slice, value / ctx.rightValue_)
                    } else {
                        obj[slice] = value / ctx.rightValue_
                    }
                    break
                case "Mod":
                    if ('__setitem__' in obj) {
                        obj.__setitem__(slice, value % ctx.rightValue_)
                    } else {
                        obj[slice] = value % ctx.rightValue_
                    }
                    break
                default:
                    throw new Error(`不支持的操作符${operator}`)
            }
        }
        
        ss.pop()
    }
}

export default AugAssign