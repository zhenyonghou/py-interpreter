// function 缺省参数
const pycode = `\
def print_numbers(*args):            
    for n in args:
      print(n)

print_numbers("hello", "w", "orld")

l = [1, 2, 3, 4]
print_numbers(*l)
`
export default pycode
