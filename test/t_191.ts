// min, max
const pycode = `\
l = ["a", "b", "c"]
assert len(l) == 3

t = (0, 1, 2, 3, 4)
assert len(t) == 5

d = {"year": 1982, "name": "mumuhou"}
assert len(d) == 2

assert min(101, 102, 99) == 99
assert max(1001, 1002, 89) == 1002
`
export default pycode