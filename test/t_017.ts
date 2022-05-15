// 赋值
const pycode = `\
def my_callbcak(n0, n1):
    return n0 + n1

def caller(a, b, func):
    return func(a, b)

ret = caller(1, 2, my_callbcak)
print(ret)
assert ret == 3
`
export default pycode