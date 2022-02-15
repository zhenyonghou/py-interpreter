class ConstantValue {
    value: string | number | bigint | boolean | RegExp | null | bigint
    constructor(v: any) {
        this.value = v
    }
}

class NameValue {
    name: string
}

export {ConstantValue, NameValue}