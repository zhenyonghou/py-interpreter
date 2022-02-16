// 作用域
const pycode = `\
g = 0
g2 = 2
def func():
    global g, g2
    g = 100

func()
`
export default pycode