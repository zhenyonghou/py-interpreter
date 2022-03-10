import Module from './Module'
import Assign from './Assign'
import AugAssign from './AugAssign'
import Assert from './Assert'
import Name from './Name'
import Expr from './Expr'
import Call from './Call'
import Constant from './Constant'
import BinOp from './BinOp'
import Compare from './Compare'
import BoolOp from './BoolOp'
import UnaryOp from './UnaryOp'
import List from './List'
import Dict from './Dict'
import Tuple from './Tuple'
import While from './While'
import For from './For'
import If from './If'
import IfExp from './IfExp'
import Pass from './Pass'
import Continue from './Continue'
import Break from './Break'
import Return from './Return'
import {FunctionDef} from './FunctionDef'
import FunctionRun from './FunctionRun'
import Starred from './Starred'
import keyword from './keyword'
import Global from './Global'
import ModFormat from './ModFormat'
import Subscript from './Subscript'
import Attribute from './Attribute'
import Delete from './Delete'
import Slice from './Slice'
import Import from './Import'
import ClassDef from './ClassDef'
import CreateInstance from './CreateInstance'

import {State, StateStack} from '../state'

interface IEval {
    type: string
    eval: (ss: StateStack, state: State) => any
}

class NodeEval extends Map {
    init() {
        // 装载所有handler
        this.addEval(Module)
        this.addEval(Assign)
        this.addEval(AugAssign)
        this.addEval(Assert)
        this.addEval(Constant)
        this.addEval(Name)
        this.addEval(Expr)
        this.addEval(Call)
        this.addEval(BinOp)
        this.addEval(Compare)
        this.addEval(BoolOp)
        this.addEval(UnaryOp)
        this.addEval(List)
        this.addEval(Dict)
        this.addEval(Tuple)
        this.addEval(While)
        this.addEval(For)
        this.addEval(If)
        this.addEval(IfExp)
        this.addEval(Pass)
        this.addEval(Continue)
        this.addEval(Break)
        this.addEval(Return)
        this.addEval(FunctionDef)
        this.addEval(FunctionRun)
        this.addEval(Starred)
        this.addEval(keyword)
        this.addEval(Global)
        this.addEval(ModFormat)
        this.addEval(Subscript)
        this.addEval(Attribute)
        this.addEval(Delete)
        this.addEval(Slice)
        this.addEval(Import)
        this.addEval(ClassDef)
        this.addEval(CreateInstance)
    }

    addEval(e: IEval) {
        this.set(e.type, e)
    }

    getEval(nodeName: string) : IEval {
        return this.get(nodeName)
    }

    eval(nodeName: string, ss: StateStack, state: State) {
        const nodeEval = this.getEval(nodeName)
        if (!nodeEval) {
            throw new Error(`缺少实现:${nodeName}`)
        }
        return nodeEval.eval(ss, state)
    }
}

export default NodeEval