// 继承 https://www.runoob.com/python3/python3-class.html
const pycode = `\
# 类定义
class people:
    name = '沐沐'

    def __init__(self, n):
        self.name = n

    def speak(self):
        print("我的名字叫%s" % self.name)
 
# 单继承示例
class student(people):
    grade = ''
    def __init__(self, n, g):
        #调用父类的构函
        super().__init__(n)
        self.grade = g
    #覆写父类的方法
    #def speak(self):
    #    print("我的名字叫%s，我在读%d年级" % (self.name, self.grade))


s = student('ken', 4)
s.speak()
`
export default pycode