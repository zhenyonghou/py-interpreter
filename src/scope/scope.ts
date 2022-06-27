/**
 * 管理作用域
 * 虽然Python变量作用域可分为:Local, Global, Built-in, Enclosed，但是对于解释器来说这个区分方法毫无意义，
 * 所以开发解释器时仍然按照Function、Block区分。
 * 
 * Scope携带该作用域的“变量区域”（declaration），另外还有parent指向父作用域
 * 
 * python的变量不区分声明与赋值，声明与赋值逻辑在assign函数中处理
 */

import { Declaration } from './declaration'
import { _assert } from '../common/functions'

/**
 * 不需要定义Enclosed，因为Scope具有层级结构，会向上查找变量.
 */
enum ScopeType {
    Function = "function",
    Block = "block",
}

class Scope {
    type: ScopeType

    public parent: Scope
    public declaration: Declaration
    public globals = new Set()

    // 从外部设置进来的Declaration，比如python内置，scene定义的
    private externalList: Array<Declaration> = []

    constructor(type: ScopeType, parentScope: Scope) {
        this.type = type
        this.parent = parentScope
        this.declaration = new Declaration() // 每次都新建一个全新的作用域
    }

    addExternal(...args: Declaration[]) {
        args.forEach(d => {
            this.externalList.push(d)
        })
    }

    clearExternal() {
        this.externalList = []
    }

    /**
     * 变量的声明&赋值
     * 1. 将变量作用域提升至Function
     * 2. 若设置变量值时，如果存在于global中，则仅赋值
     */
    set(name: string, value: any) {
        if (this.globals.has(name)) {
            this.parent.assign(name, value)
        } else {
            let scope: Scope = this
            // 提升变量作用域至函数级作用域
            while (scope.parent && scope.type !== ScopeType.Function) {
                scope = scope.parent
            }
            scope.declaration.set(name, value)
        }
    }

    get(name: string): any {
        if (this.declaration.has(name)) {
            return this.declaration.get(name)
        }

        if (this.parent) {
            return this.parent.get(name)
        }

        for (let i = 0; i < this.externalList.length; i++) {
            const d = this.externalList[i]
            if (d.get(name)) {
                return d.get(name)
            }
        }

        throw new ReferenceError(`${name}尚未定义`)
    }

    // 变量的赋值(注意：前提是变量已经声明) 处理global标识的变量时使用
    assign(name: string, value: any) {
        if (this.declaration.has(name)) {
            this.declaration.set(name, value)
            return
        }

        if (this.parent) {
            this.parent.assign(name, value)
            return
        }

        for (let i = 0; i < this.externalList.length; i++) {
            const d = this.externalList[i]
            if (d.has(name)) {
                d.set(name, value)
                return
            }
        }

        throw new ReferenceError(`${name}尚未定义`)
    }

    del(name: string) {
        if (this.declaration.has(name)) {
            this.declaration.del(name)
            return
        }

        if (this.parent) {
            this.parent.del(name)
            return
        }
        _assert(false, `del时找不到"${name}"`)
    }

    lookup(name: string): any {
        return this.get(name)
    }

    lookupObjWithProperty(objName: string, propertyName: string): any {
        const obj = this.lookup(objName)
        return obj[propertyName]
    }

    // 可以用来查找数组元素值
    lookupObjWithIndex(objName: string, index: number): any {
        const obj = this.lookup(objName)
        return obj[index]
    }

    addGlobal(name: string) {
        let scope: Scope = this
        // 提升变量作用域至函数级作用域
        while (scope.parent && scope.type !== ScopeType.Function) {
            scope = scope.parent
        }
        scope.globals.add(name)
    }
}

export { Scope, ScopeType }
