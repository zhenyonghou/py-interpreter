
import { Scope } from "./scope"
import {ConstantValue} from './value'

class ScopeHelper {
    static lookup(scope: Scope, varName: string): any {
        return scope.get(varName)
    }

    // static assign(scope: Scope, varName: string, val: any) {
    //     scope.set(varName, val)
    // }

    // prop类型: string | number | bigint | boolean | RegExp | null | bigint
    // static lookupMember(scope: Scope, objName: string, prop: any): any {
    //     const obj = ScopeHelper.lookup(scope, objName)
    //     return obj[prop]
    // }

    // static assignMember(scope: Scope, objName: string, prop: any, val: any): any {
    //     const obj = ScopeHelper.lookup(scope, objName)
    //     obj[prop] = val
    // }

    static lookupX(scope: Scope, x: string | ConstantValue): any {
        if (typeof x === "string") {
            return ScopeHelper.lookup(scope, x)
        } else if (x instanceof ConstantValue) {
            return x.value
        } else {
            throw new Error(`lookupX不支持该类型:${x}`)
        }
    }

    // static lookupX(scope: Scope, x: string|IdentifierRet|MemberRet|LiteralRet|ArrayRet): any {
    //     if (typeof x === "string") {
    //         return ScopeHelper.lookup(scope, x)
    //     } else if (x instanceof IdentifierRet) {
    //         return ScopeHelper.lookup(scope, x.name)
    //     } else if (x instanceof MemberRet) {
    //         return ScopeHelper.lookupMember(scope, x.objName, x.prop)
    //     } else if (x instanceof LiteralRet) {   // 严格来说这里没有职责查字面量，为了避免外部忘记处理，这里还是处理下
    //         return x.value
    //     } else if (x instanceof FunctionRet) {
    //         return x.value
    //     } else if (Array.isArray(x)) {   // 严格来说该类型不需要从scope查，为了避免外部忘记处理，这里还是处理下
    //         let ret = []
    //         for (let i = 0; i < x.length; i++) {
    //             if (x[i] instanceof Object) {
    //                 ret.push(ScopeHelper.lookupX(scope, x[i]))
    //             }
    //         }
    //         return ret
    //     } else {
    //         // console.warn('lookupX好像不支持该类型:', x)
    //         throw new Error(`lookupX不支持该类型:${x}`)
    //         return x
    //     }
    // }

    // // 实际上不处理ArrayRet类型，逻辑也走不到这里，为了不报错才加上的
    // static assignX(scope: Scope, x: string|IdentifierRet|MemberRet|ArrayRet, val: any): any {
    //     if (typeof x === 'string') {
    //         ScopeHelper.assign(scope, x, val)
    //     } else if (x instanceof IdentifierRet) {
    //         ScopeHelper.assign(scope, x.name, val)
    //     } else if (x instanceof MemberRet) {
    //         ScopeHelper.assignMember(scope, x.objName, x.prop, val)
    //     } else {
    //         throw new Error(`不支持的类型:${x}`)
    //     }
    // }
}

export default ScopeHelper