// 类定义 https://www.runoob.com/python3/python3-class.html
const pycode = `\
class MyClass:
    """一个简单的类实例"""
    i = 12345
    def f(self):
        return 'hello world'
 
# 实例化类
x = MyClass()

print(x.f())
 
# 访问类的属性和方法
assert x.i == 12345
assert(x.f() == 'hello world')
`
export default pycode