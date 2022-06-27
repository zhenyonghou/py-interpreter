const pycode = `\
class Person(object):
    # 定义基本属性
    name = ''
    # 定义私有属性,私有属性在类外部无法直接进行访问
    __weight = 0

    def __init__(self, name):
        self.name = name

    def say(self, s):
        print('%s say:%s' % (self.name, s))

p = Person("mumu")
p.say("imwatt")
`
export default pycode