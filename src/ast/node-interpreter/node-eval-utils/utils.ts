import * as AstTree from '../../ast-node'
import {NameRet, ConstantRet} from './types'
import { _str } from '../../../python/builtins'

const getSubscripe = (obj: any, slice: any) => {
    if ('__getitem__' in obj) {
        return obj.__getitem__(slice)
    } else {
        return obj[slice]
    }
}

const setSubscripe = (obj: any, slice: any, value: any) => {
    if ('__setitem__' in obj) {
        obj.__setitem__(slice.toString(), value)
    } else {
        obj[slice.toString()] = value
    }
}

const transName = (node: AstTree.Name) => {
    return new NameRet(node.id, node.ctx.type)
}

const transConstant = (node: AstTree.Constant) => {
    let _ret = null
    if (typeof node.value == 'string') {
        _ret = new _str(node.value)
    } else {
        _ret = node.value
    }
    return new ConstantRet(_ret)
}

export {getSubscripe, setSubscripe, transName, transConstant}