import * as AstTree from '../../ast-node'
import { NameRet, ConstantRet } from './types'
import { _str } from '../../../python/builtins'
import { Scope, ScopeType } from '../../../scope/scope'
import { State, StateStack } from '../../../state'
import { BaseEvalContext } from '../../interpret-context'

export const getSubscripe = (obj: any, slice: any) => {
    if ('__getitem__' in obj) {
        return obj.__getitem__(slice)
    } else {
        return obj[slice]
    }
}

export const setSubscripe = (obj: any, slice: any, value: any) => {
    if ('__setitem__' in obj) {
        obj.__setitem__(slice.toString(), value)
    } else {
        obj[slice.toString()] = value
    }
}

export const transName = (node: AstTree.Name) => {
    return new NameRet(node.id, node.ctx.type)
}

export const transConstant = (node: AstTree.Constant) => {
    let _ret = null
    if (typeof node.value == 'string') {
        _ret = new _str(node.value)
    } else {
        _ret = node.value
    }
    return new ConstantRet(_ret)
}

/**
 * 
 * 准备解释node
 * @returns 如果需要解释，返回true, 否则返回false
 */
export const quickInterpret = (node: AstTree.Node, scope: Scope, ss: StateStack, ctx: BaseEvalContext): boolean => {
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