// 控制 - if
const pycode = `\
a = 100
if a < 2:
    assert False
elif a < 50:
    assert False
else:
    assert True
`
export default pycode