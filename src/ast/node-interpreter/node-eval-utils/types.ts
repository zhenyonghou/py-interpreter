import { _dict, _list, _str, _tuple } from '../../../python/builtins'
import {KV} from '../../../common/typescript'

export enum ControlKey {
    Null     = "",
    Pass     = "pass",
    Continue = "continue",
    Break    = "break",
    Return   = "return"
}

export class ConstantRet {
    value: any
    // value: string | number | bigint | boolean | RegExp | null | bigint | Array<any> | _tuple | _dict | _list | _str
    constructor(v: any) {
        this.value = v
    }
}

export class NameRet {
    name: string
    ctxType: "Load" | "Store"
    constructor(v: string, ctxType: "Load" | "Store") {
        this.name = v
        this.ctxType = ctxType
    }
}

export class StarredRet {
    name: string
    constructor(v: string) {
        this.name = v
    }
}

export class keywordRet {
    arg: string
    value: any
    constructor(arg: string, value: any) {
        this.arg = arg
        this.value = value
    }
}

export class SubscriptRet {
    obj: any  // object
    slice: string | number

    constructor(obj: any, slice: string | number) {
        this.obj = obj
        this.slice = slice
    }
}

export class AttributeRet {
    obj: any  // object
    attr: string

    constructor(obj: any, attr: string) {
        this.obj = obj
        this.attr = attr
    }
}

export class MMInstance {
    [index: string]: any
    bases: Array<MMInstance> = []
}