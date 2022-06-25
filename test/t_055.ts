// 控制 - for

const pycode = `\
l = []
for x in "我喜欢apple":
    l.append(x)

print(l)
assert len(l) == 8
assert l[3] == 'a'

`

export default pycode