// function 缺省参数
const pycode = `\
def register(name, email, **kwargs):
    print(name, email, kwargs)

register("demon", "1@1.com", addr="shanghai", age=22)
`
export default pycode
