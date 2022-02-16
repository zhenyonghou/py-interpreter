
enum NodeType {
    Module = "Module"
}

interface BaseNode {
    type: string
}

/**
{
    "type": "Name",
    "id": "a",
    "ctx": {
        "type": "Store"
    }
}
*/
interface Name extends BaseNode {
    type: "Name"
    id: string
    ctx: object
}

/**
{
    "type": "Constant",
    "value": 101,
    "kind": null
}
*/
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

interface Call extends BaseNode {
    type: "Call"
    func: Name,
    args: Array<any>
}

interface BinOp extends BaseNode {
    type: "BinOp"
    left: Name | Constant
    right: Name | Constant
    op: BinOpOperator
}

interface BinOpOperator extends BaseNode {
    type: "Add" | "Sub" | "Mult" | "Div" | "Mod" | "Pow" | "BitAnd" | "BitOr" | "BitXor" | "LShift" | "RShift"
}

interface Compare extends BaseNode {
    type: "Compare"
    left: Name | Constant
    comparators: Array<Name | Constant>
    ops: Array<CompareOperator>
}

interface CompareOperator extends BaseNode {
    type: "Eq" | "NotEq" | "Gt" | "GtE" | "Lt" | "LtE" | "In" | "NotIn"
}

interface BoolOp extends BaseNode {
    op: BoolOpOperator
    values: Array<any>
}

interface BoolOpOperator extends BaseNode {
    type: "And" | "Or"
}

interface UnaryOp extends BaseNode {
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

type Node = Name | Constant | Module| Expr | Assign | AugAssign | Call | BinOp | BinOpOperator | Compare | CompareOperator 
    | BoolOp | BoolOpOperator | UnaryOp | UnaryOpOperator | List | While | For | Pass | If | Continue | Break | Return

export {Node, NodeType,
    Name, Constant, Module, Expr, Assign, AugAssign, Call, BinOp, BinOpOperator, Compare, CompareOperator, BoolOp, BoolOpOperator, 
    UnaryOp, UnaryOpOperator, List, While, For, Pass, If, Continue, Break, Return}