// 修改父类的属性值

const pycode = `\
# 类定义
class people:
    name = '沐沐'

    def __init__(self):
        self.name = "大沐沐"
        self.age = 9

    def speak(self):
        print("我的名字叫%s" % self.name)

# 单继承示例
class student(people):
    grade = 5

    #覆写父类的方法
    def speak(self):
        print("我的名字叫%s, %d岁，我在读%d年级" % (self.name, self.age, self.grade))


s = student()
s.name = "mumuhou"
s.age += 1
s.speak()
`
export default pycode