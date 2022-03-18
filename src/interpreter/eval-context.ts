import * as AstTree from './ast-tree'
import {MetaClass} from './ast-tree/virtual-node'
import {KV, ControlKey, keywordRet, NameRet, ConstantRet, AttributeRet} from './types'
import {_list, _dict, _tuple} from './python/builtins'
import {Scope, ScopeType} from './scope'

class BaseEvalContext {
    begin: boolean = false
    value_: any = null
    control_: ControlKey = ControlKey.Null
    returnData_: any = null
}

class ModuleContext extends BaseEvalContext {
    n_: number = 0
    done_: boolean = false
}

class AssignContext extends BaseEvalContext {
    valueDone_: boolean = false
    targetIndex_: number = 0
    assignValue_: any = null
}

class AugAssignContext extends BaseEvalContext {
    valueDone_: boolean = false
    targetDone_: boolean = false
    rightValue_: any = null
}

class AssertContext extends BaseEvalContext {
    testDone_: boolean = false
}

class ConstantContext extends BaseEvalContext {

}

class NameContext extends BaseEvalContext {

}

class ExprContext extends BaseEvalContext {
    valueDone_: boolean = false
}

class CallContext extends BaseEvalContext {
    funcStep_: number = 0
    argN_: number = 0
    // args_: _list = new _list()
    args_: Array<any> = []
    keywordsN_: number = 0
    keywords_: Array<keywordRet> = []
    func_: NameRet | AttributeRet = null
    doneExec_: boolean = false
}

class BinOpContext extends BaseEvalContext {
    leftDone_: boolean = false
    rightDone_: boolean = false
    right_: any = null

    modeFormatting: boolean = false
}

class CompareContext extends BaseEvalContext {
    leftDone_: boolean = false
    left_: any = null
    n_: number = 0
}

class BoolOpContext extends BaseEvalContext {
    n_: number = 0
    leftValue_: boolean = false
}

class UnaryOpContext extends BaseEvalContext {
    operandDone_: boolean = false
}

class ListContext extends BaseEvalContext {
    n_: number = 0
    list_: _list = new _list()
}

class DictContext extends BaseEvalContext {
    valueIndex_: number = 0
    dict_: _dict = new _dict()
}

class TupleContext extends BaseEvalContext {
    n_: number = 0
    list_: _tuple = new _tuple()
}

class WhileContext extends BaseEvalContext {
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

class ForContext extends BaseEvalContext {
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

class IfContext extends BaseEvalContext {
    n_: number = 0

    testValue_: any = null
    bodyN_: number = 0
}

class IfExpContext extends BaseEvalContext {
    n_: number = 0
    testValue_: any = null
    done_: boolean = false
}

class ReturnContext extends BaseEvalContext {
    retValueDone_: boolean = false
}

class FunctionDefContext extends BaseEvalContext {
    
}

class FunctionRunContext extends BaseEvalContext {
    scope: Scope = null
    bodyN_: number = 0
}

class StarredContext extends BaseEvalContext {

}

class keywordContext extends BaseEvalContext {
    valueDone_: boolean = false
}

class ModFormatContext extends BaseEvalContext {
    rightDone_: boolean = false
}

class SubscriptContext extends BaseEvalContext {
    valueDone_: boolean = false
    subscriptValue_: any = null
    sliceDone_: boolean = false
}

class AttributeContext extends BaseEvalContext {
    valueDone_: boolean = false
    attributeValue_: any = null
}

class DeleteContext extends BaseEvalContext {
    n_: number = 0
}

class SliceContext extends BaseEvalContext {
    lowerDone_: boolean = false
    upperDone_: boolean = false
    stepDone_: boolean = false

    lowerValue_: any = null
    upperValue_: any = null
    stepValue_: any = null
}

class ImportContext extends BaseEvalContext {
    n_: number = 0
}

class ClassDefContext extends BaseEvalContext {
    bodyN_: number = 0
    cls: MetaClass = new MetaClass()
    scope: Scope = null
}

class CreateInstanceContext extends BaseEvalContext {
    initDone_: boolean = false

    obj: KV = {}
}

class comprehensionContext extends BaseEvalContext {
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

class ListCompContext extends BaseEvalContext {
    eltDone_: boolean = false
    eltValue_: any = null

    generatorsN_: number = 0

    items_: _list = new _list()
}

const ContextSets: KV = {
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

const createContext = (node: AstTree.Node) => {
    try {
        return new ContextSets[node.type]
    } catch(err) {
        throw new Error(`Context里不支持的type:${node.type}`)
    }
}

export {BaseEvalContext, ModuleContext, AssignContext, AugAssignContext, AssertContext, ConstantContext, NameContext, 
    ExprContext, CallContext, BinOpContext, CompareContext, BoolOpContext, UnaryOpContext, ListContext, DictContext, TupleContext,
    WhileContext, ForContext, IfContext, IfExpContext, ReturnContext, FunctionDefContext, FunctionRunContext, StarredContext, 
    keywordContext, ModFormatContext, SubscriptContext, AttributeContext, DeleteContext, SliceContext, ImportContext, 
    ClassDefContext, CreateInstanceContext, ListCompContext, comprehensionContext,
    createContext}