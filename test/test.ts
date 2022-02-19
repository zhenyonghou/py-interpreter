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
// 函数&参数
import code_080 from './t_080'
import code_081 from './t_081'
import code_082 from './t_082'
import code_083 from './t_083'
import code_084 from './t_084'
import code_085 from './t_085'
// 作用域
import code_100 from './t_100'

// 
import code_150 from './t_150'
import code_151 from './t_151'

import { genAst } from '../src/lib/api'
import Interpreter from '../src/interpreter/interpreter'
import * as AstTree from '../src/interpreter/ast-tree'

// const codeList = [code_001, code_002, code_003, code_004, code_005, code_050, code_051, code_052, code_053, 
//     code_080, code_081, code_082, code_083, code_084, code_085, code_100]
const codeList = [code_150, code_151]

const start = () => {
    // Interpreter.GlobalDeclaration.setWithSets(py_builtins)
    const interpreter = new Interpreter()

    console.log("====================== test start ======================")
    codeList.forEach(async (pyCode, index) => {
        console.log("code index:", index)
        console.log(pyCode)

        const ast = await genAst(pyCode)
        // console.log(ast)
        interpreter.init(ast.ast as AstTree.Node)

        interpreter.run()
    })
    console.log("====================== test end ======================")
}

export {start}