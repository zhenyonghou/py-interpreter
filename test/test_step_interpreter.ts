import { codeParse } from '../lib/api'
import Interpreter from '../src/index'

const code = `
class MyClass:
    """一个简单的类实例"""
    i = 12345
    def f(self):
        return 'hello world'
 
# 实例化类
x = MyClass()

print(x.f())
 
# 访问类的属性和方法
assert x.i == 12345
assert(x.f() == 'hello world')
`

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