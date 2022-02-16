// 控制 - while + if
const pycode = `\
a = 0
while a < 100:
    a += 1
    if a == 2:
        continue
    elif a == 3:
        break
    elif a == 4:
        return
print(a)
`
export default pycode