
import { Scope } from "./scope"
import {AttributeRet, ConstantRet, MMInstance, NameRet, StarredRet, SubscriptRet} from '../ast/node-interpreter/node-eval-utils/types'
import { _assert } from "../common/functions"

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

    static lookupX(scope: Scope, x: string | ConstantRet | NameRet | SubscriptRet | AttributeRet): any {
        if (typeof x === "string") {
            return ScopeHelper.lookup(scope, x)
        } else if (x instanceof ConstantRet) {
            return x.value
        } else if (x instanceof NameRet) {
            if (x.ctxType == "Store") {
                return x
            } else {
                return ScopeHelper.lookup(scope, x.name)
            }
        } else if (x instanceof SubscriptRet) {
            if ('__getitem__' in x.obj) {
                return x.obj.__getitem__(x.slice)
            } else {
                const obj = x.obj
                return obj[x.slice]
            }
        }  else if (x instanceof AttributeRet) {
            if (x.obj instanceof MMInstance) {
                let _obj = x.obj as MMInstance
                while(_obj) {
                    if (_obj.hasOwnProperty(x.attr)) {
                        return _obj[x.attr]
                    }

                    if (_obj.bases.length > 0) {
                        _obj = _obj.bases[0]
                    } else {
                        _obj = null
                    }
                }
                if (_obj == null) {
                    throw new Error(`找不到对象的属性:${x.attr}`)
                }
                return null
            }

            if ('__getitem__' in x.obj) {
                return x.obj.__getitem__(x.attr)
            } else {
                const obj = x.obj
                return obj[x.attr]
            }
        } else {
            throw new Error(`lookupX不支持该类型:${x}`)
        }
    }
}

export default ScopeHelper