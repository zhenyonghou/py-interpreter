// del
const pycode = `\
# 删除变量
x = "hello"

del x

# print(x)

# 删除列表中的项目
l = ["hello", "xianlin", "i", "love"]
del l[0]
print(l)

# 删除具有指定键名的项目
thisdict =	{
    "brand": "Porsche",
    "model": "911",
    "year": 1963
}
del thisdict["model"]
print(thisdict)
`
export default pycode

// # 删除对象
// class MyClass:
//   name = "John"

// del myClass

// print(myClass)