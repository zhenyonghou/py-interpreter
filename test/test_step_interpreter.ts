import { codeParse } from '../lib/api'
import Interpreter from '../src/index'
import code from './t_407'

const timer = new Interpreter.External.Timer(0)
const interpreter = new Interpreter.Interpreter()

interpreter.whenStep = (lineno: number, ty: string) => {
    console.log('onStep lineno:', lineno, ty)
}

interpreter.whenDone = () => {
    timer.stop()
    console.log('执行结束')
}

interpreter.whenError = (msg: string, lineno: number) => {
    console.error(msg)
    timer.stop()
}

timer.do = () => {
    interpreter.stepOver()
}

const start = () => {
    const buildCode = async (pyCode: string) => {
        const ast = await codeParse(pyCode, { "lineno": 1 })
        interpreter.resetWithAst(ast.ast)
    }

    buildCode(code).then(() => {
        console.log('build done.')
        timer.start()
    })
}

export {start}