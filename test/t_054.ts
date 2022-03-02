// 控制 - for

const pycode = `\
l = []
for x in range(5, 9):
    l.append(x)

print(l)
assert len(l) == 4
assert l[0] == 5

l2 = []
languages = ["english", "chinese"]
for x in languages:
    l2.append(x)

assert l2[0] == "english"
`

export default pycode