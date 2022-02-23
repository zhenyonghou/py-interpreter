const pycode = `\
import time
import random
import json

# print("Start : %s" % time.time())
# time.sleep(3)
# print("End : %s" % time.time())

# print('random.randInt:%s' % (random.randInt(0, 200)))
# print('random.choice:%s' % random.choice(["a", "b", "c", "d"]))

data = {
    'no' : 1,
    'name' : 'Runoob',
    'url' : 'http://www.runoob.com'
}

json_str = json.dumps(data)
print("JSON 对象:", json_str)

ret_data = json.loads(json_str)
print("JSON 对象:", ret_data)
`
export default pycode