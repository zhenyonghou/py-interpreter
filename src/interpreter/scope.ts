/**
 * 管理作用域
 * 虽然Python变量作用域可分为:Local, Global, Built-in, Enclosed，但是对于解释器来说这个区分方法毫无意义，
 * 所以开发解释器时仍然按照Function、Block区分。
 * 
 * Scope携带该作用域的“变量区域”（declaration），另外还有parent指向父作用域
 * 
 * python的变量不区分声明与赋值，声明与赋值逻辑在assign函数中处理
 */

import { globalDeclaration, Declaration } from './declaration'

/**
 * 不需要定义Enclosed，因为Scope具有层级结构，会向上查找变量.
 */
enum ScopeType {
    Function = "function",
    Block = "block",
}

class Scope {
    type: ScopeType

    parent: Scope

    //  static GlobalDeclaration: Declaration = globalDeclaration

    declaration: Declaration

    constructor(type: ScopeType, parentScope: Scope) {
        this.type = type
        this.parent = parentScope
        this.declaration = new Declaration() // 每次都新建一个全新的作用域
    }

    // 变量的赋值(注意：前提是变量已经声明)
    //  assign(name: string, value: any) {
    //      if (this.declaration.has(name)) {
    //          this.declaration.set(name, value)
    //          return
    //      }

    //      if (this.parent) {
    //          this.parent.assign(name, value)
    //          return
    //      }

    //      if (Scope.GlobalDeclaration.has(name)) {
    //          Scope.GlobalDeclaration.set(name, value)
    //          return
    //      }

    //      throw new ReferenceError(`${name}尚未定义`)
    //  }

    /**
     * 变量的声明&赋值
     * 将变量作用域提升至Function
     */
    set(name: string, value: any) {
        let scope: Scope = this
        // 提升变量作用域至函数级作用域
        while (scope.parent && scope.type !== ScopeType.Function) {
            scope = scope.parent
        }
        scope.declaration.set(name, value)
        // return scope.declaration.get(name)
    }

    get(name: string): any {
        if (this.declaration.has(name)) {
            return this.declaration.get(name)
        }

        if (this.parent) {
            return this.parent.get(name)
        }

        if (globalDeclaration.get(name)) {
            return globalDeclaration.get(name)
        }

        throw new ReferenceError(`${name}尚未定义`)
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
}

export { Scope, ScopeType }
