// function
const pycode = `\
def l_max(a, b):
    if a >= b:
        return a
    return b

for i in range(10):
    if l_max(i, 5) == i:
        assert i >= 5
`
export default pycode