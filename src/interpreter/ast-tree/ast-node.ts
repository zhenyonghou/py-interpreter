import { _str } from "../python/builtins"

interface BaseNode {
    type: string
    lineno ?: number
    end_lineno ?: number
    col_offset ?: number
    end_col_offset ?: number
}

// Name里的结构
interface ctx {
    type: "Load" | "Store"
}

interface Name extends BaseNode {
    type: "Name"
    id: string
    ctx: ctx
}

interface Constant extends BaseNode {
    type: "Constant"
    value: any
}

interface Module extends BaseNode {
    type: "Module"
    body: Array<any>
}

interface Expr extends BaseNode {
    type: "Expr"
    value: Call | UnaryOp | BoolOp
}

interface Assign extends BaseNode {
    type: "Assign"
    targets: Array<Name>
    value: Constant
}

interface AugAssign extends BaseNode {
    type: "Assign"
    target: Name
    op: AugAssignOperator
    value: Constant
}

interface AugAssignOperator extends BaseNode {
    type: "Add" | "Sub" | "Mult" | "Div" | "Mod"
}

interface Assert extends BaseNode {
    type: "Assert"
    test: Constant | Name | Compare
    msg: string
}

interface keyword extends BaseNode {
    type: "keyword"
    arg: string
    value: any
}

interface Call extends BaseNode {
    type: "Call"
    func: Name | Attribute,
    args: Array<any>
    keywords: Array<keyword>
}

interface BinOp extends BaseNode {
    type: "BinOp"
    left: Name | Constant
    right: Name | Constant | Tuple
    op: BinOpOperator
}

interface BinOpOperator extends BaseNode {
    type: "Add" | "Sub" | "Mult" | "Div" | "FloorDiv" | "Mod" | "Pow" | "BitAnd" | "BitOr" | "BitXor" | "LShift" | "RShift"
}

interface Compare extends BaseNode {
    type: "Compare"
    left: Name | Constant
    comparators: Array<Name | Constant>
    ops: Array<CompareOperator>
}

interface CompareOperator extends BaseNode {
    type: "Eq" | "NotEq" | "Gt" | "GtE" | "Lt" | "LtE" | "In" | "NotIn" | "Is" | "IsNot"
}

interface BoolOp extends BaseNode {
    type: "BoolOp"
    op: BoolOpOperator
    values: Array<any>
}

interface BoolOpOperator extends BaseNode {
    type: "And" | "Or"
}

interface UnaryOp extends BaseNode {
    type: "UnaryOp"
    op: UnaryOpOperator
    operand: Name
}

interface UnaryOpOperator extends BaseNode {
    type: "Not" | "Invert" | "UAdd" | "USub"
}

interface List extends BaseNode {
    type: "List"
    elts: Array<any>
}

interface Dict extends BaseNode {
    keys: Array<Constant>
    values: Array<Constant>
}

interface Tuple extends BaseNode {
    type: "Tuple"
    elts: Array<any>
    ctx: ctx
}

interface While extends BaseNode {
    type: "While"
    test: any
    body: Array<any>
    orelse: Array<any>
}

interface If extends BaseNode {
    type: "If"
    test: any
    body: Array<any>
    orelse: Array<any>
}

interface IfExp extends BaseNode {
    type: "IfExp"
    test: any
    body: any
    orelse: any
}

interface Pass extends BaseNode {
    type: "Pass"
}

interface Continue extends BaseNode {
    type: "Continue"
}

interface Break extends BaseNode {
    type: "Break"
}

interface Return extends BaseNode {
    type: "Return"
    value: any
}

interface For extends BaseNode {
    type: "For"
    target: Name
    iter: Name | Constant
    body: Array<any>
    orelse: Array<any>
}

interface arg extends BaseNode {
    type: "arg"
    arg: string
    annotation: any
}

interface Starred extends BaseNode {
    type: "Starred"
    value: Name
}

interface arguments extends BaseNode {
    type: "arguments"
    posonlyargs: Array<any>
    args: Array<arg>
    vararg: arg
    kwonlyargs: Array<any>
    kw_defaults: Array<any>
    kwarg: arg
    defaults: Array<Constant>
}

interface FunctionDef extends BaseNode {
    type: "FunctionDef"
    name: string
    args: arguments
    body: Array<any>
    decorator_list: Array<any>
    returns: any
}

interface Global extends BaseNode {
    type: "Global"
    names: Array<string>
}

interface Subscript extends BaseNode {
    type: "Subscript"
    value: any
    slice: Name | Constant
    ctx: ctx
}

interface Attribute extends BaseNode {
    type: "Attribute"
    value: any
    attr: string
}

interface Delete extends BaseNode {
    type: "Delete"
    targets: Array<Name|Subscript>
}

interface Slice extends BaseNode {
    type: "Slice"
    lower: any
    upper: any
    step: any
}

interface Import extends BaseNode {
    type: "Import"
    names: Array<alias>
}

interface alias extends BaseNode {
    type: "alias",
    name: string    // "time",
    asname: any     // null
}

interface ClassDef extends BaseNode {
    type: "ClassDef",
    name: string,
    bases: Array<any>,
    keywords: Array<any>,
    body: Array<any>,
}

export {BaseNode, Name, Constant, Module, Expr, Assign, AugAssign, Assert, arguments, Call, BinOp, BinOpOperator, Compare, CompareOperator, BoolOp, BoolOpOperator, 
    UnaryOp, UnaryOpOperator, List, Dict, Tuple, While, For, Pass, If, IfExp, Continue, Break, Return, FunctionDef, Starred, keyword, Global, Subscript, 
    Attribute, Delete, Slice, Import, alias, ClassDef} 