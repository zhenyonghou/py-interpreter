import {Name, Constant, Module, Expr, Assign, AugAssign, Assert, arguments, Call, BinOp, BinOpOperator, Compare, CompareOperator, BoolOp, BoolOpOperator, 
    UnaryOp, UnaryOpOperator, List, Dict, Tuple, While, For, Pass, If, IfExp, Continue, Break, Return, FunctionDef, Starred, keyword, Global, Subscript, 
    Attribute, Delete, Slice, Import, alias, ClassDef, ListComp, comprehension} from './ast-node'
import {ModFormat, FunctionRun, CreateInstance} from './virtual-node'

type Node = Name | Constant | Module | Expr | Assign | AugAssign | Assert | arguments | Call | BinOp | BinOpOperator | Compare | CompareOperator 
| BoolOp | BoolOpOperator | UnaryOp | UnaryOpOperator | List | Dict | Tuple | While | For | Pass | If | IfExp | Continue | Break 
| Return | FunctionDef | Starred | keyword | Global | Subscript | Attribute | Delete | Slice | Import | alias | ClassDef | ListComp
| comprehension
| ModFormat | FunctionRun | CreateInstance

export {Node, Name, Constant, Module, Expr, Assign, AugAssign, Assert, arguments, Call, BinOp, BinOpOperator, Compare, CompareOperator, BoolOp, BoolOpOperator, 
    UnaryOp, UnaryOpOperator, List, Dict, Tuple, While, For, Pass, If, IfExp, Continue, Break, Return, FunctionDef, Starred, keyword, Global, Subscript, 
    Attribute, Delete, Slice, Import, alias, ClassDef, ListComp, comprehension,
    ModFormat, FunctionRun, CreateInstance}