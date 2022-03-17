// 执行__init__
const pycode = `\
class MyClass:
    """一个简单的类实例"""
    def __init__(self, i):
        self.i = i

    def get_i(self):
        return self.i
    
    def set_i(self, i):
        self.i = i
 
# 实例化类
x = MyClass(100)
assert x.get_i() == 100
x.set_i(200)
assert x.get_i() == 200
`
export default pycode