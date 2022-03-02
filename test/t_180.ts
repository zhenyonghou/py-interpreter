// 作用域
const pycode = `\
tinydict = {'Name': 'Zara', 'Age': 7, 'Class': 'First'}
assert tinydict['Name'] == "Zara"

tinydict['Age'] = 8 # 更新
print('Age:', tinydict['Age'])
assert tinydict['Age'] == 8

del tinydict['Name']  # 删除键是'Name'的条目
assert tinydict.get('Name', '仙林') == '仙林'

tinydict.clear()      # 清空字典所有条目
assert tinydict.get('Class', 'Ssss') == 'Ssss'


tinydict["Age"] = 9
d2 = tinydict.copy()

assert d2.get('Age') == 9
`
export default pycode