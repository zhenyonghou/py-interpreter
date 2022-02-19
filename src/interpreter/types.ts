import PyTuple from './python-builtins/py-tuple'
// import PyList from './python-builtins/py-list'

interface KV {  // 这么做是为了解决ts(7053)问题
    [index: string]: any
}

class ConstantRet {
    value: string | number | bigint | boolean | RegExp | null | bigint | Array<any> | PyTuple
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

class SimpleValue {
    value: any
    constructor(v: any) {
        this.value = v
    }
}

enum ControlKey {
    Null     = "",
    Pass     = "pass",
    Continue = "continue",
    Break    = "break",
    Return   = "return"
}

export {KV, ConstantRet, NameRet, StarredRet, keywordRet, SimpleValue, ControlKey}