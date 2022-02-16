// 测试用例: 运算符
import code_001 from './t_001'
import code_002 from './t_002'
import code_003 from './t_003'
import code_004 from './t_004'
import code_005 from './t_005'
// 测试用例: 循环控制
import code_050 from './t_050'
import code_051 from './t_051'
import code_052 from './t_052'
import code_053 from './t_053'

import { genAst } from '../src/lib/api'
import Interpreter from '../src/interpreter/interpreter'
import * as AstTree from '../src/interpreter/ast-tree'

const codeList = [code_053]

const start = () => {
    // Interpreter.GlobalDeclaration.setWithSets(py_builtins)
    const interpreter = new Interpreter()

    console.log("====================== test start ======================")
    codeList.forEach(async (pyCode, index) => {
        console.log("code index:", index)
        console.log(pyCode)

        const ast = await genAst(pyCode)
        console.log(ast)
        interpreter.init(ast.ast as AstTree.Node)

        interpreter.run()
    })
    console.log("====================== test end ======================")
}

export {start}