
const pycode = `\
l = ["a", "b", "c"]
print(len(l))

t = (0, 1, 2, 3, 4)
print(len(t))

d = {"year": 1982, "name": "mumuhou"}
print(len(d))

print('min:', min(101, 102, 99))
print('max:', max(1001, 1002, 89))
`
export default pycode