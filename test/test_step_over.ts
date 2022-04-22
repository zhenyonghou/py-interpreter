// 测试用例: 运算符
import code_001 from './t_001'
import code_002 from './t_002'
import code_003 from './t_003'
import code_004 from './t_004'
import code_005 from './t_005'
import code_007 from './t_007'

// 测试用例: 循环&控制
import code_050 from './t_050'
import code_051 from './t_051'
import code_052 from './t_052'
import code_053 from './t_053'
import code_054 from './t_054'

// 函数&参数
import code_080 from './t_080'
import code_081 from './t_081'
import code_082 from './t_082'
import code_083 from './t_083'
import code_084 from './t_084'
import code_085 from './t_085'
import code_086 from './t_086'

// 作用域
import code_100 from './t_100'

// 格式化输出
import code_150 from './t_150'
import code_151 from './t_151'
import code_152 from './t_152'

// dict
import code_180 from './t_180'

// list
import code_181 from './t_181'

// tuple
import code_182 from './t_182'

// str
import code_183 from './t_183'

// del, assert关键字, len, min, max等函数
import code_190 from './t_190'
import code_191 from './t_191'
import code_192 from './t_192'

// 完善运算符，如：创建一个新的元组 tup3 = tup1 + tup2
import code_230 from './t_230'

// import
import code_280 from './t_280'

// class
import code_400 from './t_400'
import code_401 from './t_401'
import code_402 from './t_402'
import code_403 from './t_403'

// 随机抽取的算法，用于验证解释器
import code_1000 from './t_1000'

import { codeParse } from '../lib/api'
import {Interpreter} from '../src/index'


// // for 003
// Interpreter.GlobalDeclaration.set("traffic_light_color", () => "red")
// Interpreter.GlobalDeclaration.set("car_reach_light", () => false)

const codeList = [code_001, code_002, code_003, code_004, code_005, code_007, code_050, code_051, code_052, code_053, code_054,
    code_080, code_081, code_082, code_083, code_084, code_085, code_086, code_100, code_150, code_151, code_152, code_180, 
    code_181, code_182, code_183, code_190, code_191, code_192, code_230, code_280, code_400, code_401]
// const codeList = [code_086]

const start = () => {
    const interpreter = new Interpreter()
    interpreter.registerDeclare("traffic_light_color", () => "red")
    interpreter.registerDeclare("car_reach_light", () => false)
    const startTime = (new Date()).getTime()
    console.log("====================== test start ======================")
    codeList.forEach(async (pyCode, index) => {
        console.log("code index:", index)
        console.log(pyCode)

        const ast = await codeParse(pyCode)
        // console.log(JSON.stringify(ast.ast, null, 4))
        interpreter.resetWithAst(ast.ast)

        interpreter.runWithOver()

        const endTime = (new Date()).getTime()
        if (index == 31) {
            console.log("耗时ms:", endTime - startTime)
        }
    })
    console.log("====================== test end ======================")
}

export {start}