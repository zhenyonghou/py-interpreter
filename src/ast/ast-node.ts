import { KV } from "../common/typescript"
import { _str } from "../python/builtins"
import {Scope} from '../scope/scope'

export enum NodeType {
    Name = "Name",
    Constant = "Constant",
    Module = "Module",
    Expr = "Expr",
    Assign = "Assign",
    AugAssign = "AugAssign",
    Assert = "Assert",
    arguments = "arguments",
    Call = "Call",
    BinOp = "BinOp",
    BinOpOperator = "BinOpOperator",
    Compare = "Compare",
    CompareOperator = "CompareOperator",
    BoolOp = "BoolOp",
    BoolOpOperator = "BoolOpOperator",
    UnaryOp = "UnaryOp",
    UnaryOpOperator = "UnaryOpOperator",
    List = "List",
    Dict = "Dict",
    Tuple = "Tuple",
    While = "While",
    For = "For",
    Pass = "Pass",
    If = "If",
    IfExp = "IfExp",
    Continue = "Continue",
    Break = "Break",
    Return = "Return",
    FunctionDef = "FunctionDef",
    Starred = "Starred",
    keyword = "keyword",
    Global = "Global",
    Subscript = "Subscript",
    Attribute = "Attribute",
    Delete = "Delete",
    Slice = "Slice",
    Import = "Import",
    alias = "alias",
    ClassDef = "ClassDef",
    ListComp = "ListComp",
    comprehension = "comprehension",
    ModFormat = "ModFormat",
    FunctionRun = "FunctionRun",
    CreateInstance = "CreateInstance",
}

export interface BaseNode {
    type: NodeType | string
    lineno ?: number
    end_lineno ?: number
    col_offset ?: number
    end_col_offset ?: number
}

// Name里的结构
export interface ctx {
    type: "Load" | "Store"
}

export interface Name extends BaseNode {
    type: NodeType.Name // 枚举成员成为了类型, 我们可以说某些成员 只能是枚举成员的值
    id: string
    ctx: ctx
}

export interface Constant extends BaseNode {
    type: NodeType.Constant
    value: any
}

export interface Module extends BaseNode {
    type: NodeType.Module
    body: Array<any>
}

export interface Expr extends BaseNode {
    type: NodeType.Expr
    value: Call | UnaryOp | BoolOp
}

export interface Assign extends BaseNode {
    type: NodeType.Assign
    targets: Array<Name>
    value: Constant
}

export interface AugAssign extends BaseNode {
    type: NodeType.AugAssign
    target: Name
    op: AugAssignOperator
    value: Constant
}

export interface AugAssignOperator extends BaseNode {
    type: "Add" | "Sub" | "Mult" | "Div" | "Mod"
}

export interface Assert extends BaseNode {
    type: NodeType.Assert
    test: Constant | Name | Compare
    msg: string
}

export interface keyword extends BaseNode {
    type: NodeType.keyword
    arg: string
    value: any
}

export interface Call extends BaseNode {
    type: NodeType.Call
    func: Name | Attribute,
    args: Array<any>
    keywords: Array<keyword>
}

export interface BinOp extends BaseNode {
    type: NodeType.BinOp
    left: Name | Constant
    right: Name | Constant | Tuple
    op: BinOpOperator
}

export interface BinOpOperator extends BaseNode {
    type: "Add" | "Sub" | "Mult" | "Div" | "FloorDiv" | "Mod" | "Pow" | "BitAnd" | "BitOr" | "BitXor" | "LShift" | "RShift"
}

export interface Compare extends BaseNode {
    type: NodeType.Compare
    left: Name | Constant
    comparators: Array<Name | Constant>
    ops: Array<CompareOperator>
}

export interface CompareOperator extends BaseNode {
    type: "Eq" | "NotEq" | "Gt" | "GtE" | "Lt" | "LtE" | "In" | "NotIn" | "Is" | "IsNot"
}

export interface BoolOp extends BaseNode {
    type: NodeType.BoolOp
    op: BoolOpOperator
    values: Array<any>
}

export interface BoolOpOperator extends BaseNode {
    type: "And" | "Or"
}

export interface UnaryOp extends BaseNode {
    type: NodeType.UnaryOp
    op: UnaryOpOperator
    operand: Name
}

export interface UnaryOpOperator extends BaseNode {
    type: "Not" | "Invert" | "UAdd" | "USub"
}

export interface List extends BaseNode {
    type: NodeType.List
    elts: Array<any>
}

export interface Dict extends BaseNode {
    keys: Array<Constant>
    values: Array<Constant>
}

export interface Tuple extends BaseNode {
    type: NodeType.Tuple
    elts: Array<any>
    ctx: ctx
}

export interface While extends BaseNode {
    type: NodeType.While
    test: any
    body: Array<any>
    orelse: Array<any>
}

export interface If extends BaseNode {
    type: NodeType.If
    test: any
    body: Array<any>
    orelse: Array<any>
}

export interface IfExp extends BaseNode {
    type: NodeType.IfExp
    test: any
    body: any
    orelse: any
}

export interface Pass extends BaseNode {
    type: NodeType.Pass
}

export interface Continue extends BaseNode {
    type: NodeType.Continue
}

export interface Break extends BaseNode {
    type: NodeType.Break
}

export interface Return extends BaseNode {
    type: NodeType.Return
    value: any
}

export interface For extends BaseNode {
    type: NodeType.For
    target: Name
    iter: Name | Constant
    body: Array<any>
    orelse: Array<any>
}

export interface arg extends BaseNode {
    // type: "arg"
    arg: string
    annotation: any
}

export interface Starred extends BaseNode {
    type: NodeType.Starred
    value: Name
}

export interface arguments extends BaseNode {
    type: NodeType.arguments
    posonlyargs: Array<any>
    args: Array<arg>
    vararg: arg
    kwonlyargs: Array<any>
    kw_defaults: Array<any>
    kwarg: arg
    defaults: Array<Constant>
}

export interface FunctionDef extends BaseNode {
    type: NodeType.FunctionDef
    name: string
    args: arguments
    body: Array<any>
    decorator_list: Array<any>
    returns: any
}

export interface Global extends BaseNode {
    type: NodeType.Global
    names: Array<string>
}

export interface Subscript extends BaseNode {
    type: NodeType.Subscript
    value: any
    slice: Name | Constant
    ctx: ctx
}

export interface Attribute extends BaseNode {
    type: NodeType.Attribute
    value: any
    attr: string
}

export interface Delete extends BaseNode {
    type: NodeType.Delete
    targets: Array<Name|Subscript>
}

export interface Slice extends BaseNode {
    type: NodeType.Slice
    lower: any
    upper: any
    step: any
}

export interface Import extends BaseNode {
    type: NodeType.Import
    names: Array<alias>
}

export interface alias extends BaseNode {
    type: NodeType.alias
    name: string    // "time",
    asname: any     // null
}

export interface ClassDef extends BaseNode {
    type: NodeType.ClassDef
    name: string
    bases: Array<any>
    keywords: Array<any>
    body: Array<any>
}

export interface comprehension extends BaseNode {
    type: NodeType.comprehension
    target: any
    iter: any
    ifs: Array<any>
}

export interface ListComp extends BaseNode {
    type: NodeType.ListComp
    elt: Name
    generators: Array<comprehension>
}

//////////////////// 自定义节点 ////////////////////////

export class MetaFunction {
    node: FunctionDef = null
    parentScope: Scope = null

    constructor(node: FunctionDef, scope: Scope) {
        this.node = node
        this.parentScope = scope
    }
}

export class MetaClass {
    classname: string = ""
    attributes: KV<any> = {}
    methods: KV<any> = {}
}

// 自定义的节点，字符串格式化时使用
export class ModFormat implements BaseNode {
    type = NodeType.ModFormat
    left: _str
    right: any
}

// 自定义的节点，在函数执行时使用
export class FunctionRun implements BaseNode {
    type = NodeType.FunctionRun
    // meta: MetaFunction = null
    funcDef: FunctionDef = null
    args: Map<string, any> = null
}

// 自定义的节点，在函数执行时使用
export class CreateInstance implements BaseNode {
    type = NodeType.CreateInstance
    metaClass: MetaClass = null
}

export type Node = Name | Constant | Module | Expr | Assign | AugAssign | Assert | arguments | Call | BinOp | BinOpOperator | Compare | CompareOperator 
| BoolOp | BoolOpOperator | UnaryOp | UnaryOpOperator | List | Dict | Tuple | While | For | Pass | If | IfExp | Continue | Break 
| Return | FunctionDef | Starred | keyword | Global | Subscript | Attribute | Delete | Slice | Import | alias | ClassDef | ListComp
| comprehension
| ModFormat | FunctionRun | CreateInstance