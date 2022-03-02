// function 缺省参数
const pycode = `\
def register(name, email, **kwargs):
    assert name == "demon"
    assert email == "1@1.com"
    assert kwargs["age"] == 22

register("demon", email="1@1.com", addr="shanghai", age=22)
`
export default pycode
