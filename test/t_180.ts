// 作用域
const pycode = `\
tinydict = {'Name': 'Zara', 'Age': 7, 'Class': 'First'}
print("tinydict['Name']: ", tinydict['Name'])

tinydict['Age'] = 8 # 更新
print("tinydict['Age']: ", tinydict['Age'])

del tinydict['Name']  # 删除键是'Name'的条目
tinydict.clear()      # 清空字典所有条目

d2 = tinydict.copy()

print("tinydict.get('Name'): ", tinydict.get('Name', 'xxx'))
print("tinydict.get('School'): ", tinydict.get('School', '仙林小学'))

`
export default pycode