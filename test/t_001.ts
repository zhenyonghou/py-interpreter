
// 算术运算符
const pycode = `\
a = 21
b = 10
c = 0
a = -6 # 兼测负号

assert a == 21
assert b == 10
assert c == 0
assert d == -6

assert a + b == 31
assert a - b == 11
assert a * b == 210
assert a / b == 2.1
assert a // b == 2

a & b
a | b
a ^ b
~a
a << b
a >> b
`
export default pycode