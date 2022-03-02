// 控制 - for

const pycode = `\

n = 0
for x in range(5, 9):
    if n == 3:
        assert x == 7
    n += 1

n = 0
languages = ["english", "chinese"]
for x in languages:
    if n == 1:
        assert x == 'chinese'
    n += 1

`

export default pycode