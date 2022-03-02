
// 比较运算符
const pycode = `\
a = 2
b = 3
c = 4
assert 1 == 1
assert a != b
assert a < b
assert a <= b
assert c > a
assert c >= b

assert (a < b < c)
`
export default pycode