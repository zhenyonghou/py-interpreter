import * as AstTree from '../ast-tree'
import {State, StateStack} from '../state'
import {AugAssignContext} from '../eval-context'
import ScopeHelper from '../scope-helper'
import {evalBegin, evalEnd, Assert} from '../utils'
import { NameRet, SubscriptRet} from '../types'

const AugAssign = {
    type: "AugAssign",
    eval: (ss: StateStack, state: State) => {
        const node = state.node as AstTree.AugAssign
        const ctx = state.ctx as AugAssignContext

        if (!ctx.begin) {
            ctx.begin = true
            evalBegin(state)
        }

        if (!ctx.valueDone_) {
            ctx.valueDone_ = true
            return new State(node.value, state.scope)
        }

        if (!ctx.targetDone_) {
            ctx.rightValue_ = ScopeHelper.lookupX(state.scope, ctx.value_)

            ctx.targetDone_ = true
            return new State(node.target, state.scope)
        }

        Assert(ctx.value_ instanceof NameRet)

        let value = ScopeHelper.lookupX(state.scope, ctx.value_)
        const operator = node.op.type
        if (ctx.value_ instanceof NameRet) {
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
            const {obj, slice} = ctx.value_
            switch(operator) {
                case "Add":
                    if (obj.hasOwnProperty('__setitem__')) {
                        obj.__setitem__(slice, value + ctx.rightValue_)
                    } else {
                        obj[slice] = value + ctx.rightValue_
                    }
                    break
                case "Sub":
                    if (obj.hasOwnProperty('__setitem__')) {
                        obj.__setitem__(slice, value - ctx.rightValue_)
                    } else {
                        obj[slice] = value - ctx.rightValue_
                    }
                    break
                case "Mult":
                    if (obj.hasOwnProperty('__setitem__')) {
                        obj.__setitem__(slice, value * ctx.rightValue_)
                    } else {
                        obj[slice] = value * ctx.rightValue_
                    }
                    break
                case "Div":
                    if (obj.hasOwnProperty('__setitem__')) {
                        obj.__setitem__(slice, value / ctx.rightValue_)
                    } else {
                        obj[slice] = value / ctx.rightValue_
                    }
                    break
                case "Mod":
                    if (obj.hasOwnProperty('__setitem__')) {
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
        evalEnd(state)
    }
}

export default AugAssign