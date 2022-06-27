import * as AstTree from '../ast/ast-node'

const NT = AstTree.NodeType

enum DebuggerCommand {
    StepOver = "step_over",
    StepInto = "step_into",
    StepOut = "step_out",
    StepResume = "step_resume"
}

/**
 * step方案:
 * 1. 根据node的type确定在哪里断掉
 * 2. 根据node的type以及其父节点type确定，这需要node类型增加parent来支持
 */

class Debugger {
    // 当前运行的level，以scope function作为分层依据
    stackLevel: number = 0

    // stepover所在的level, 大于该level的忽略
    stepOverLevel: number = 0

    // 当前执行到的行号
    lineNo: number = -1

    cmd: DebuggerCommand = DebuggerCommand.StepOver

    // 丢弃的type: NT.Module, NT.ListComp, NT.Name, NT.Constant, NT.comprehension, NT.Subscript, NT.Slice, NT.Compare, 
    // NT.CompareOperator, NT.BinOp, NT.BinOpOperator, NT.Starred, NT.keyword, NT.alias, NT.ModFormat, NT.CreateInstance
    // NT.List, NT.Call, NT.Attribute, NT.BoolOp, NT.BoolOpOperator, NT.UnaryOp, NT.UnaryOpOperator, NT.Dict, NT.Tuple, 
    // NT.arguments
    private stayTypes = [NT.Expr, NT.Assign, NT.AugAssign, NT.Assert, NT.While, NT.For, NT.Pass, NT.If, NT.IfExp, 
        NT.Continue, NT.Break, NT.Return, NT.Global, NT.Delete, NT.Import, NT.FunctionDef, NT.ClassDef, NT.FunctionRun]

    constructor() {
        this.reset()
    }

    reset() {
        this.stackLevel = 0
        this.stepOverLevel = 0
        this.lineNo = -1
        this.cmd = DebuggerCommand.StepOver
    }

    // 如果debuger认为应当在此处停留，则返回true，否则返回false
    public checkNodeBegin(ty: AstTree.NodeType, node: AstTree.Node): boolean {
        if (this.stayTypes.includes(ty)) {
            if ('lineno' in node) {
                this.lineNo = node.lineno
            } else if (ty == AstTree.NodeType.FunctionRun) {
                node = node as AstTree.FunctionRun
                if ('lineno' in node.funcDef) {
                    this.lineNo = node.funcDef.lineno
                }
            }
            return true
        }

        return false
    }

    public checkNodeInternalStep(ty: string, node: AstTree.Node): boolean {
        if ('lineno' in node) {
            this.lineNo = node.lineno
        }
        return true
    }
}

export { Debugger, DebuggerCommand }