import * as AstTree from './ast-tree'
import {KV} from './types'

class BaseEvalContext {
    value_: any

    return_: boolean
    return_value_: any

    control_: string    // break, continue, return

    begin: boolean

    constructor() {
        this.begin = false  // 标记已经开始解析

        this.value_ = null

        this.return_ = false
        this.return_value_ = null

        this.control_ = ""
    }
}

class ModuleContext extends BaseEvalContext {
    done_: boolean
    constructor() {
        super()
        this.done_ = false
    }
}

class AssignContext extends BaseEvalContext {
    valueDone_: boolean
    targetIndex_: number

    assignValue_: any

    constructor() {
        super()
        this.valueDone_ = false
        this.targetIndex_ = 0
    }
}

class ConstantContext extends BaseEvalContext {

}

class NameContext extends BaseEvalContext {

}

class ExprContext extends BaseEvalContext {
    valueDone_: boolean
    constructor() {
        super()
        this.valueDone_ = false
    }
}

class CallContext extends BaseEvalContext {
    funcStep_: number

    // doneArgs_: boolean
    argN_: number
    args_: Array<any>

    func_: any

    doneExec_: boolean
    
    constructor() {
        super()
        this.funcStep_ = 0
    }
}

class BinOpContext extends BaseEvalContext {
    leftDone_: boolean
    rightDone_: boolean

    // left_: any
    right_: any
}

class CompareContext extends BaseEvalContext {
    leftDone_: boolean
    left_: any
    n_: number

    constructor() {
        super()
        this.leftDone_ = false
        this.n_ = 0
    }
}

class BoolOpContext extends BaseEvalContext {
    n_: number
    left_: any

    constructor() {
        super()
        this.n_ = 0
    }
}

class UnaryOpContext extends BaseEvalContext {
    operandDone_: boolean

    constructor() {
        super()
        this.operandDone_ = false
    }
}

const ContextSets: KV = {
    Module: ModuleContext,
    Assign: AssignContext,
    Constant: ConstantContext,
    Name: NameContext,
    Expr: ExprContext,
    Call: CallContext,
    BinOp: BinOpContext,

    Add: BaseEvalContext, 
    Sub: BaseEvalContext,
    Mult: BaseEvalContext,
    Div: BaseEvalContext,
    Mod: BaseEvalContext,
    Pow: BaseEvalContext,
    LShift: BaseEvalContext,
    RShift: BaseEvalContext,
    BitOr: BaseEvalContext,
    BitXor: BaseEvalContext,
    BitAnd: BaseEvalContext,
    Compare: CompareContext,
    BoolOp: BoolOpContext,
    UnaryOp: UnaryOpContext
}

const createContext = (node: AstTree.Node) => {
    console.log('node.type:', node.type)
    return new ContextSets[node.type]
}

export {BaseEvalContext, ModuleContext, AssignContext, ConstantContext, NameContext, ExprContext, CallContext, BinOpContext,
    CompareContext, BoolOpContext, UnaryOpContext, createContext}