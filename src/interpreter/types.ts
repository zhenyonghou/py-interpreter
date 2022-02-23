import { _dict, _list, _str, _tuple } from './python/builtins'

interface KV {  // 这么做是为了解决ts(7053)问题
    [index: string]: any
}

enum ControlKey {
    Null     = "",
    Pass     = "pass",
    Continue = "continue",
    Break    = "break",
    Return   = "return"
}

class ConstantRet {
    value: string | number | bigint | boolean | RegExp | null | bigint | Array<any> | _tuple | _dict | _list | _str
    constructor(v: any) {
        this.value = v
    }
}

class NameRet {
    name: string
    constructor(v: string) {
        this.name = v
    }
}

class StarredRet {
    name: string
    constructor(v: string) {
        this.name = v
    }
}

class keywordRet {
    arg: string
    value: any
    constructor(arg: string, value: any) {
        this.arg = arg
        this.value = value
    }
}

class SubscriptRet {
    obj: any  // object
    slice: string | number

    constructor(obj: any, slice: string | number) {
        this.obj = obj
        this.slice = slice
    }
}

class AttributeRet {
    obj: any  // object
    attr: string

    constructor(obj: any, attr: string) {
        this.obj = obj
        this.attr = attr
    }
}

// class SimpleValue {
//     value: any
//     constructor(v: any) {
//         this.value = v
//     }
// }

export {KV, ConstantRet, NameRet, StarredRet, keywordRet, ControlKey, SubscriptRet, AttributeRet}