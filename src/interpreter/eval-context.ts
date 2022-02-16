import * as AstTree from './ast-tree'
import {KV, ControlKey} from './types'

class BaseEvalContext {
    value_: any
    control_: ControlKey
    returnData_: any

    begin: boolean

    constructor() {
        this.begin = false  // 标记已经开始解析
        this.value_ = null

        this.control_ = ControlKey.Null
        this.returnData_ = null
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

class AugAssignContext extends BaseEvalContext {
    valueDone_: boolean
    targetDone_: boolean

    rightValue_: any

    constructor() {
        super()
        this.valueDone_ = false
        this.targetDone_ = false
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

class ListContext extends BaseEvalContext {
    n_: number
    list_: Array<any>

    constructor() {
        super()
        this.n_ = 0
        this.list_ = []
    }
}

class WhileContext extends BaseEvalContext {
    n_: number

    testValue_: any
    bodyN_: number

    constructor() {
        super()
        this.n_ = 0
        this.bodyN_ = 0
    }

    reset() {
        this.n_ = 0
        this.testValue_ = null
        this.bodyN_ = 0

        this.control_ = ControlKey.Null
        this.returnData_ = null
        this.value_ = null
    }
}

class ForContext extends BaseEvalContext {
    targetName_: string

    init_: boolean
    iterValue_: Array<any>
    iterIndex_: number
    bodyN_: number

    constructor() {
        super()
        this.iterValue_ = []
        this.iterIndex_ = 0
        this.bodyN_ = 0
    }

    continue() {
        this.bodyN_ = 0
        this.iterIndex_++

        this.control_ = ControlKey.Null
        this.returnData_ = null
        this.value_ = null
    }
}

class IfContext extends BaseEvalContext {
    n_: number

    testValue_: any
    bodyN_: number

    constructor() {
        super()
        this.n_ = 0
        this.bodyN_ = 0
    }
}

class ReturnContext extends BaseEvalContext {
    retValueDone_: boolean
}

class FunctionDefContext extends BaseEvalContext {
    
}

class FunctionRunContext extends BaseEvalContext {
    bodyN_: number
    constructor() {
        super()
        this.bodyN_ = 0
    }
}

const ContextSets: KV = {
    Module: ModuleContext,
    Assign: AssignContext,
    AugAssign: AugAssignContext,
    Constant: ConstantContext,
    Name: NameContext,
    Expr: ExprContext,
    Call: CallContext,
    BinOp: BinOpContext,
    Compare: CompareContext,
    BoolOp: BoolOpContext,
    UnaryOp: UnaryOpContext,
    List: ListContext,
    While: WhileContext,
    For: ForContext,
    If: IfContext,
    Pass: BaseEvalContext,
    Continue: BaseEvalContext,
    Break: BaseEvalContext,
    Return: ReturnContext,
    FunctionDef: FunctionDefContext,
    FunctionRun: FunctionRunContext,
}

const createContext = (node: AstTree.Node) => {
    console.log('node.type:', node.type)
    return new ContextSets[node.type]
}

export {BaseEvalContext, ModuleContext, AssignContext, AugAssignContext, ConstantContext, NameContext, ExprContext, 
    CallContext, BinOpContext, CompareContext, BoolOpContext, UnaryOpContext, ListContext, 
    WhileContext, ForContext, IfContext, ReturnContext, FunctionDefContext, FunctionRunContext, createContext}