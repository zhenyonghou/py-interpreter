// 作用域
const pycode = `\
tup1 = ('physics', 'chemistry', 1997, 2000)
tup2 = (1, 2, 3, 4, 5, 6, 7 )

assert tup1[0] == 'physics'

t3 = tup2[1:5]
print(t3)
assert t3[0] == 2
assert t3[3] == 5
`
export default pycode