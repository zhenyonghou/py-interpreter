
import Tuple from "./python-builtins/py-tuple"
import { Scope } from "./scope"
import {ConstantRet, NameRet, StarredRet} from './types'

class ScopeHelper {
    static lookup(scope: Scope, varName: string): any {
        return scope.get(varName)
    }

    static set(scope: Scope, varName: string, val: any) {
        scope.set(varName, val)
    }

    // prop类型: string | number | bigint | boolean | RegExp | null | bigint
    // static lookupMember(scope: Scope, objName: string, prop: any): any {
    //     const obj = ScopeHelper.lookup(scope, objName)
    //     return obj[prop]
    // }

    // static assignMember(scope: Scope, objName: string, prop: any, val: any): any {
    //     const obj = ScopeHelper.lookup(scope, objName)
    //     obj[prop] = val
    // }

    /**
     * 使用场景：为变量赋值的时候，比如参数赋值，for循环的target
     * @param scope 
     * @param x 
     * @param val 
     */
    static setX(scope: Scope, x: string|NameRet, val: any): any {
        if (typeof x === 'string') {
            ScopeHelper.set(scope, x, val)
        } else if (x instanceof NameRet) {
            ScopeHelper.set(scope, x.name, val)
        } 
        // else if (x instanceof MemberRet) {
        //     ScopeHelper.assignMember(scope, x.objName, x.prop, val)
        // } 
        else {
            throw new Error(`不支持的类型:${x}`)
        }
    }

    static lookupX(scope: Scope, x: string | ConstantRet | NameRet): any {
        if (typeof x === "string") {
            return ScopeHelper.lookup(scope, x)
        } else if (x instanceof ConstantRet) {
            return x.value
        } else if (x instanceof NameRet) {
            return ScopeHelper.lookup(scope, x.name)
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
}

export default ScopeHelper