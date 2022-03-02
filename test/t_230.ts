const pycode = `\
l = [1, 2, 3] + [4, 5, 6]
assert len(l) == 6

ls = ['Hi!'] * 4
assert len(ls) == 5
assert ls[0] == ls[4] == "Hi!"
`
export default pycode