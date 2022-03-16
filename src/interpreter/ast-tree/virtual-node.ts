import { _str } from "../python/builtins"
import {BaseNode, FunctionDef} from './ast-node'
import {Scope} from '../scope'

interface KV {  // 这么做是为了解决ts(7053)问题
    [index: string]: any
}

class MetaFunction {
    node: FunctionDef = null
    parentScope: Scope = null

    constructor(node: FunctionDef, scope: Scope) {
        this.node = node
        this.parentScope = scope
    }
}

class MetaClass {
    classname: string = ""
    attributes: KV = {}
    methods: KV = {}
}

// 自定义的节点，字符串格式化时使用
class ModFormat implements BaseNode {
    type:string = "ModFormat"
    left: _str
    right: any
}

// 自定义的节点，在函数执行时使用
class FunctionRun implements BaseNode {
    type: string = "FunctionRun"
    // meta: MetaFunction = null
    funcDef: FunctionDef = null
    args: Map<string, any> = null
}

// 自定义的节点，在函数执行时使用
class CreateInstance implements BaseNode {
    type: string = "CreateInstance"
    metaClass: MetaClass = null
}

export {MetaFunction, MetaClass, 
    ModFormat, FunctionRun, CreateInstance}