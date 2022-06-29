// 子类实例化，子类没有构造函数，调用父类的构造函数

const pycode = `\
# 类定义
class people:
    name = '沐沐'

    def __init__(self):
        self.name = "大沐沐"

    def speak(self):
        print("我的名字叫%s" % self.name)

# 单继承示例
class student(people):
    grade = 5

    #覆写父类的方法
    def speak(self):
        print("我的名字叫%s，我在读%d年级" % (self.name, self.grade))


s = student()
s.speak()
`
export default pycode