"use strict";

function type(x) {
    //return x.constructor;
    return Object.prototype.toString.call(x);
}

Object.assign(type, {
    list: "[object Array]",
    dict: "[object Object]",
    number: "[object Number]",
    str: "[object String]",
    isnan: function(x) {
        return type(x) === type.number && x !== x;
    },
    isint: function(x) {
        return type(x) === type.number && int(x) === x;
    }
})

// bound methods of Date
Date.prototype.local = function(timezone) {
    timezone = parseInt(timezone);
    var tzoffset = this.getTimezoneOffset();
    var timestamp = this.getTime() + tzoffset * 60000 + timezone * 3600000;
    var dobj = new Date(timestamp);
    var m = dobj.getMonth() + 1;
    m = m < 10 ? '0' + m : '' + m;
    var [d, y] = __slice__(dobj.toDateString().split(' '), -2);
    return `${y}-${m}-${d} ${dobj.toTimeString().split(' ')[0]}`;
}

// __builtins__ functions
function __eq__(x, y) {
    if (type(x) === type.dict) {
        return dict.__eq__(x, y);
    }
    return (x != null && x.__eq__) ? x.__eq__(y) : x === y;
}

function __in__(x, seg) {
    if (type(seg) === type.str) {
        return seg.indexOf(x) !== -1;
    }
    if (type(seg) === type.dict) {
        return seg[x] !== undefined;
    }
    for (let item of seg) {
        if (__eq__(x, item)) {
            return true;
        }
    }
    return false;
}

function __lt__(x, y) {
    return (x != null && x.__lt__) ? x.__lt__(y) : x < y;
}

function __gt__(x, y) {
    return (x != null && x.__gt__) ? x.__gt__(y) : x > y;
}

function __slice__(seg, start, end, step) {
    var L = len(seg);
    if (start == null) {
        start = 0;
    } else if (start < 0) {
        start = L + start;
    }
    if (end == null) {
        end = L;
    } else if (end < 0) {
        end = L + end;
    }
    if (step == null) {
        step = 1;
    } else if (step == 0) {
        return;
    }
    var lst = [];
    if (step > 0) {
        for (let i = start; i < end; i += step) {
            lst.push(seg[i]);
        }
    } else if (step < 0) {
        for (let i = end - 1; i >= start; i += step) {
            lst.push(seg[i]);
        }
    }
    if (type(seg) === type.str) {
        return lst.join('');
    }
    return lst;
}

function len(x) {
    if (type(x) === type.dict) {
        return dict.__len__(x);
    }
    if (x != null && x.__len__) {
        return x.__len__();
    }
    if (x != null && x.length != null) {
        return x.length;
    }
}

function abs(x) {
    return Math.abs(x);
}

function bool(x) {
    var L = len(x);
    return L === undefined ? Boolean(x) : (L != 0);
}

function int(x) {
    return parseInt(x);
}

function float(x) {
    return parseFloat(x);
}

function chr(x) {
    return String.fromCharCode(x);
}

function ord(x) {
    return x.charCodeAt(0);
}

function print(x) {
    console.log(x);
}

function *enumerate(iterable, start) {
    if (start == null) {
        start = 0;
    }
    if (type(iterable) === type.dict) {
        iterable = dict.keys(iterable);
    }
    var cc = 0;
    for (let x of iterable) {
        if (cc >= start) {
            yield [cc, x];
        }
        cc += 1;
    }
}

function list(iterable) {
    if (iterable == null) {
        return [];
    }
    var ret = [];
    for (let [i, x] of enumerate(iterable)) {
        ret.push(x);
    }
    return ret;
}

function map(func, iterable) {
    if (func == null) {
        func = (x=>x);
    }
    var ret = [];
    for (let x of iterable) {
        ret.push(func(x));
    }
    return ret;
}

function filter(func, iterable) {
    if (func == null) {
        func = (x=>true);
    }
    var ret = [];
    for (let x of iterable) {
        if (bool(func(x))) {
            ret.push(func(x));
        }
    }
    return ret;
}

function reduce(func, iterable, initial) {
    for (let x of iterable) {
        initial = (initial === undefined ? x : func(initial, x));
    }
    return initial;
}

function min() {
    var args = list(arguments);
    if (args.length === 1) {
        return reduce((x, y)=>(__lt__(x, y) ? x : y), args[0]);
    }
    return min(args);
}

function max() {
    var args = list(arguments);
    if (args.length === 1) {
        return reduce((x, y)=>(__lt__(x, y) ? y : x), args[0]);
    }
    return min(args);
}

function sum() {
    var args = list(arguments);
    if (args.length === 1) {
        return reduce((x, y)=>(x + y), args[0]);
    }
    return min(args);
}

function range(start, end, step) {
    if (start == null) {
        start = 0;
    }
    if (end == null) {
        [start, end] = [0, start];
    }
    if (step == null) {
        step = 1;
    }
    var ret = [];
    for (let i = start; i < end; i += step) {
        ret.push(i);
    }
    return ret;
}

function zip() {
    var args = map(x=>list(x), list(arguments));
    var L = min(map(x=>len(x), args));
    var ret = [];
    for (let i = 0; i < L; i++) {
        let tmp = [];
        for (let j = 0; j < args.length; j++) {
            tmp.push(args[j][i]);
        }
        ret.push(tmp);
    }
    return ret;
}

export {
    print,
    max,
    min,
}

// function $Y(fetchFunc, showFunc, ctx) {
//     return function() {
//         fetchFunc(ctx)(
//             function(data) {
//                 showFunc(data, ctx);
//             }
//         )
//     }
// }
