import code_001 from "./t_001"
import { genAst } from "../src/lib/api"

const codeList = [code_001]

const start = () => {
    // Interpreter.GlobalDeclaration.setWithSets(py_builtins)
    // const interpreter = new Interpreter()

    console.log("====================== test start ======================")
    codeList.forEach(async (pyCode, index) => {
        console.log("code index:", index)
        console.log(pyCode)

        const ast = await genAst(pyCode)
        console.log('gen ast:\n')
        console.log(ast)
        // interpreter.parse(code)
    
        // interpreter.run()
    })
    console.log("====================== test end ======================")
}

export {start}