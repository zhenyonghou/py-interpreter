// function 缺省参数
const pycode = `\
def register(name, email, **kwargs):
    print(name)
    print(email)
    print(kwargs)

d = {"email":"yrr", "name":"1@1.com", "addr":"shanghai"}
register(**d)
`
export default pycode
