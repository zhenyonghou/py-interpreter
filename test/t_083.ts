// function 缺省参数
const pycode = `\
def print_numbers(*args):
    i = 0
    for n in args:
        if i == 1:
            print(n)
            assert n == "w"
        i += 1

print_numbers("hello", "w", "orld")
`
export default pycode
