// function 缺省参数
const pycode = `\
def register(name, email, **kwargs):
    assert name == "demon"
    assert email == "1@1.com"
    assert kwargs["addr"] == "shanghai"

d = {"email":"1@1.com", "name":"demon", "addr":"shanghai"}
register(**d)
`
export default pycode
