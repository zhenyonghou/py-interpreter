// 作用域
const pycode = `\
g1 = 0
g2 = 0
def func():
    global g1
    g1 = 100
    g2 = 200

func()
print(g1)
print(g2)
`
export default pycode