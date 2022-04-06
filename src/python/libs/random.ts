// 参考自：https://github.com/deestan/randy

import { _list, len} from "../builtins";

function baseRandInt(max?: number) {
    if (typeof(max) == 'undefined') {
        return Math.floor(Math.random())
    } else {
        return Math.floor(Math.random() * max)
    }
}

function randInt(min?: number, max?: number, step?: number) {
    if (typeof(min) == 'undefined')
        return baseRandInt()
    if (typeof(max) == 'undefined') {
        max = min
        min = 0
    }
    if (typeof step === 'undefined') {
        return min + baseRandInt(max - min)
    }
    var span = Math.ceil((max - min) / step)
    return min + baseRandInt(span) * step
}

function choice(arr: _list) {
    if (!len(arr))
        throw "arr not an array of length > 0";
    return arr.__getitem__(baseRandInt(len(arr)))
}

function shuffle(arr: _list) {
    var arrCopy = new _list(arr._items.slice())
    shuffleInplace(arrCopy);
    return arrCopy;
}

function shuffleInplace(arr: _list) {
    var j, tmp;
    for (var i = len(arr) - 1; i > 0; i--) {
        j = baseRandInt(i + 1)
        tmp = arr.__getitem__(i)
        arr.__setitem__(i, arr.__getitem__(j))
        arr.__setitem__(j, tmp)
    }
}

function random() {
    var MIN_FLOAT = 1 / Math.pow(2, 31) // 31指的是精度
    return MIN_FLOAT * baseRandInt();
}

function uniform(min ?: number, max ?: number) {
    if (typeof min == 'undefined') {
        min = 0
    }
    if (typeof max == 'undefined') {
        max = min
        min = 0
    }
    return min + (random() * (max - min))
}

function sample(population: _list, count: number) {
    var arr = population._items.slice()
    var j, tmp, ln = arr.length
    for (var i = ln - 1; i > (ln - count - 1); i--) {
        j = baseRandInt(i + 1)
        tmp = arr[i]
        arr[i] = arr[j]
        arr[j] = tmp
    }
    return new _list(arr.slice(ln - count))
}

export {random, randInt, choice, shuffle, uniform, sample}