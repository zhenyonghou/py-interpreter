import * as AstTree from './ast-node'
import {KV, ControlKey, keywordRet, NameRet, ConstantRet, AttributeRet} from './node-interpreter/node-eval-utils/types'
import {_list, _dict, _tuple} from '../python/builtins'
import {Scope, ScopeType} from '../scope/scope'

export class BaseEvalContext {
    begin: boolean = false
    value_: any = null
    control_: ControlKey = ControlKey.Null
    returnData_: any = null
}

export class ModuleContext extends BaseEvalContext {
    n_: number = 0
    done_: boolean = false
}

export class AssignContext extends BaseEvalContext {
    valueDone_: boolean = false
    targetIndex_: number = 0
    assignValue_: any = null
}

export class AugAssignContext extends BaseEvalContext {
    valueDone_: boolean = false
    targetDone_: boolean = false
    rightValue_: any = null
}

export class AssertContext extends BaseEvalContext {
    testDone_: boolean = false
}

export class ConstantContext extends BaseEvalContext {

}

export class NameContext extends BaseEvalContext {

}

export class ExprContext extends BaseEvalContext {
    valueDone_: boolean = false
}

export class CallContext extends BaseEvalContext {
    funcStep_: number = 0
    argN_: number = 0
    // args_: _list = new _list()
    args_: Array<any> = []
    keywordsN_: number = 0
    keywords_: Array<keywordRet> = []
    func_: NameRet | AttributeRet = null
    doneExec_: boolean = false
}

export class BinOpContext extends BaseEvalContext {
    leftDone_: boolean = false
    rightDone_: boolean = false
    right_: any = null

    modeFormatting: boolean = false
}

export class CompareContext extends BaseEvalContext {
    leftDone_: boolean = false
    left_: any = null
    n_: number = 0
}

export class BoolOpContext extends BaseEvalContext {
    n_: number = 0
    leftValue_: boolean = false
}

export class UnaryOpContext extends BaseEvalContext {
    operandDone_: boolean = false
}

export class ListContext extends BaseEvalContext {
    n_: number = 0
    list_: _list = new _list()
}

export class DictContext extends BaseEvalContext {
    valueIndex_: number = 0
    dict_: _dict = new _dict()
}

export class TupleContext extends BaseEvalContext {
    n_: number = 0
    list_: _tuple = new _tuple()
}

export class WhileContext extends BaseEvalContext {
    n_: number = 0
    testValue_: any = null
    bodyN_: number = 0

    reset() {
        this.n_ = 0
        this.testValue_ = null
        this.bodyN_ = 0

        this.control_ = ControlKey.Null
        this.returnData_ = null
        this.value_ = null
    }
}

export class ForContext extends BaseEvalContext {
    targetName_: string = ""
    init_: boolean = false
    iterValue_: Array<any> = []
    iterIndex_: number = 0
    bodyN_: number = 0

    continue() {
        this.bodyN_ = 0
        this.iterIndex_++

        this.control_ = ControlKey.Null
        this.returnData_ = null
        this.value_ = null
    }
}

export class IfContext extends BaseEvalContext {
    n_: number = 0

    testValue_: any = null
    bodyN_: number = 0
}

export class IfExpContext extends BaseEvalContext {
    n_: number = 0
    testValue_: any = null
    done_: boolean = false
}

export class ReturnContext extends BaseEvalContext {
    retValueDone_: boolean = false
}

export class FunctionDefContext extends BaseEvalContext {
    
}

export class FunctionRunContext extends BaseEvalContext {
    scope: Scope = null
    bodyN_: number = 0
}

export class StarredContext extends BaseEvalContext {

}

export class keywordContext extends BaseEvalContext {
    valueDone_: boolean = false
}

export class ModFormatContext extends BaseEvalContext {
    rightDone_: boolean = false
}

export class SubscriptContext extends BaseEvalContext {
    valueDone_: boolean = false
    subscriptValue_: any = null
    sliceDone_: boolean = false
}

export class AttributeContext extends BaseEvalContext {
    valueDone_: boolean = false
    attributeValue_: any = null
}

export class DeleteContext extends BaseEvalContext {
    n_: number = 0
}

export class SliceContext extends BaseEvalContext {
    lowerDone_: boolean = false
    upperDone_: boolean = false
    stepDone_: boolean = false

    lowerValue_: any = null
    upperValue_: any = null
    stepValue_: any = null
}

export class ImportContext extends BaseEvalContext {
    n_: number = 0
}

export class ClassDefContext extends BaseEvalContext {
    bodyN_: number = 0
    cls: AstTree.MetaClass = new AstTree.MetaClass()
    scope: Scope = null
}

export class CreateInstanceContext extends BaseEvalContext {
    initDone_: boolean = false

    obj: KV = {}
}

export class comprehensionContext extends BaseEvalContext {
    targetDone_: boolean = false
    target_: NameRet = null

    iterDone_: boolean = false

    slice_: _list = null
    iterIndex_: number = 0

    ifsN_: number = 0
    ifsResult_: number = -1 // -1 没结果, 1: 结果为true, 0: 结果为false

    onTargetValueUpdate: (key: any, v: any) => void

    items_: Array<any> = []
}

export class ListCompContext extends BaseEvalContext {
    eltDone_: boolean = false
    eltValue_: any = null

    generatorsN_: number = 0

    items_: _list = new _list()
}

export const ContextSets: KV = {
    Module: ModuleContext,
    Assign: AssignContext,
    AugAssign: AugAssignContext,
    Assert: AssertContext,
    Constant: ConstantContext,
    Name: NameContext,
    Expr: ExprContext,
    Call: CallContext,
    BinOp: BinOpContext,
    Compare: CompareContext,
    BoolOp: BoolOpContext,
    UnaryOp: UnaryOpContext,
    List: ListContext,
    Dict: DictContext,
    Tuple: TupleContext,
    While: WhileContext,
    For: ForContext,
    If: IfContext,
    IfExp: IfExpContext,
    Pass: BaseEvalContext,
    Continue: BaseEvalContext,
    Break: BaseEvalContext,
    Return: ReturnContext,
    FunctionDef: FunctionDefContext,
    FunctionRun: FunctionRunContext,
    Starred: StarredContext,
    keyword: keywordContext,
    Global: BaseEvalContext,
    ModFormat: ModFormatContext,
    Subscript: SubscriptContext,
    Attribute: AttributeContext,
    Delete: DeleteContext,
    Slice: SliceContext,
    Import: ImportContext,
    ClassDef: ClassDefContext,
    CreateInstance: CreateInstanceContext,
    ListComp: ListCompContext,
    comprehension: comprehensionContext,
}

export const createContext = (node: AstTree.Node) => {
    try {
        return new ContextSets[node.type]
    } catch(err) {
        throw new Error(`Context里不支持的type:${node.type}`)
    }
}