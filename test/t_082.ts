// function 缺省参数
const pycode = `\
def func_add(a, b, c=3, d=4):
    return a + b + c + d

ret = func_add(0, 1, d=10)
print(ret)
`
export default pycode