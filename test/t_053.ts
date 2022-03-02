// 控制 - while + if
const pycode = `\
a = 0
while a < 100:
    a += 1
    if a == 2:
        continue
    elif a == 3:
        pass
    elif a == 4:
        return
    elif a == 5:
        break
        
assert a == 4
`
export default pycode