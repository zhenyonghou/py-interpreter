// 作用域
const pycode = `\
list1 = ['physics', 'chemistry', 1997, 2000]
list2 = [1, 2, 3, 4, 5, 6, 7 ]

assert list1[0] == "physics"

l3 = list2[1:5]
assert l3[0] == 2

list1.append('Google')
assert list1[4] == 'Google'

list1.pop()
assert len(list1) == 4
`
export default pycode