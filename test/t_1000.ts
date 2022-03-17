const pycode = `\
class BubbleSort(object):
    # 初始化
    def __init__(self, arr=None):
        self.arr = arr

    # 升序
    def sort_asc(self):
        if self.arr is None:
            return False
        # 统计长度
        cnt = len(self.arr)
        for i in range(cnt - 1):
            flag = True
            for j in range(cnt - 1 - i):
                if self.arr[j] > self.arr[j+1]:
                    flag = False
                    self.arr[j], self.arr[j+1] = self.arr[j+1], self.arr[j]
            if flag:
                break
        print(self.arr)


if __name__ == '__main__':
    arr_list = [7, 8, 6, 5, 4, 3, 1, 2]
    num_list = BubbleSort(arr_list)
    num_list.sort_asc()
`
export default pycode