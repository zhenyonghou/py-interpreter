// 执行__init__
const pycode = `\
class MyClass:
    """一个简单的类实例"""
    i = 12345
    def __init__(self, i):
        self.i = i

    def f(self):
        return 'hello world'
 
# 实例化类
x = MyClass(100)
 
# 访问类的属性和方法
print(x.i)
assert x.i == 100
print(x.f())
assert(x.f() == 'hello world')
`
export default pycode