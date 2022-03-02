// 作用域: global
const pycode = `\
g1 = 0
g2 = 0
def func():
    global g1
    g1 = 100
    g2 = 200

func()
assert g1 == 100
assert g2 == 0
`
export default pycode