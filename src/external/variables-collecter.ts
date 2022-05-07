import {StateStack} from '../state'
import {ScopeType} from '../scope/scope'
import * as pyBuiltins from '../python/builtins'
import { MetaClass, MetaFunction } from '../ast/ast-node'

interface VariablesKV {
    key: string,
    value: any
}

interface FormattedVariable {
    key: string,
    value: string
}

/**
 * 变量收集器
 */

class VariablesCollecter {
    private ss: StateStack = null

    private levels: number = 1  // 从ss里收集变量的层级，层级按Function来，从ss里遍历，遇到一个Function算作一级

    constructor(ss: StateStack, levels: number = 1) {
        this.ss = ss
        this.levels = levels
    }

    public collect() {
        const m = this.collectVariables(this.ss)
        return this.formatVariables(m)
    }

    // 把变量收集到map里
    private collectVariables(ss: StateStack) : Array<VariablesKV> {
        const ret :Array<VariablesKV> = []

        if (ss.length == 0) {
            return ret
        }

        const state = ss[ss.length - 1]
        let scope = state.scope

        for (let level = 0; level < this.levels; level++) {
            while(true) {
                scope.declaration.forEach((key: string, v: any) => {
                    ret.push({key: key, value: v})
                })
    
                if (scope.type == ScopeType.Function) {
                    break
                }
                scope = scope.parent
            }
        }
        
        return ret
    }

    private formatVariables(variables: Array<VariablesKV>) : Array<FormattedVariable> {
        let ret: Array<FormattedVariable> = []

        for (let i = 0; i < variables.length; i++) {
            const {key, value} = variables[i]
            if (key == "self") {
                continue
            }

            let item: FormattedVariable = {
                key: key,
                value: ''
            }

            if (value instanceof pyBuiltins._list
                || value instanceof pyBuiltins._dict
                || value instanceof pyBuiltins._tuple
                || value instanceof pyBuiltins._str) {
                    item.value = value.toString()
            } else if (value instanceof MetaClass || value instanceof MetaFunction) {
                continue
            } else if (value instanceof Object) {
                continue
            } else {
                item.value = value
            }

            ret.push(item)
        }

        return ret
    }
}

export default VariablesCollecter