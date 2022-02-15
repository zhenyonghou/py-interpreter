
interface KV {  // 这么做是为了解决ts(7053)问题
    [index: string]: any;
}

class ConstantRet {
    value: string | number | bigint | boolean | RegExp | null | bigint | Array<any>
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

class SimpleValue {
    value: any
    constructor(v: any) {
        this.value = v
    }
}


export {KV, ConstantRet, NameRet, SimpleValue}