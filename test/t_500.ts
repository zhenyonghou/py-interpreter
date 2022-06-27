const pycode = `\
ret = l_max(300, 5)
print(ret)

def l_max(a, b):
    if a >= b:
        return a
    return b
`
export default pycode