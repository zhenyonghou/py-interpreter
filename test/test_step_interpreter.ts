import { codeParse } from '../lib/api'
import {StepInterpreter, Timer} from '../src/index'

const code = `
class QuickSort(object):
    def __init__(self):
        pass

    # 降序
    def sort_desc(self, arr=None):
        if len(arr) <= 1:
            return arr
        key = arr[0]

        # python的魅力所在
        min_list = [i for i in arr[1:] if i < key]
        max_list = [i for i in arr[1:] if i >= key]
        return self.sort_desc(max_list) + [key] + self.sort_desc(min_list)


if __name__ == '__main__':
    arr_list = [1, 3, 8, 2, 7, 6, 5, 4]
    num_list = QuickSort()
    print(num_list.sort_desc(arr_list))
`

const timer = new Timer(0)
const interpreter = new StepInterpreter()

interpreter.onStep = (hasNext: boolean, lineno: number) => {
    if (hasNext) {
        // console.log('onStep lineno:', lineno)
    } else {
        timer.stop()
        console.log('执行结束')
    }
}

interpreter.onError = (msg: string, lineno: number) => {
    console.error(msg)
}

timer.do = () => {
    interpreter.stepOver()
}

const start = () => {
    const buildCode = async (pyCode: string) => {
        const ast = await codeParse(pyCode, { "lineno": 1 })
        interpreter.resetWithAst(ast.ast)

        timer.start()
    }

    buildCode(code).then(() => {
        console.log('build done.')
    })
}

export {start}