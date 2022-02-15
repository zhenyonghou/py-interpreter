
// some code is copy from https://github.com/spockNinja/js-py-proto/tree/master/src/modules
// bound methods of list
Array.prototype.__len__ = function() {
    return this.length;
}

Array.prototype.__eq__ = function(arr) {
    // only for list which depth=1
    if (!(arr instanceof Array)) {
        return false;
    }
    if (this.length !== arr.length) {
        return false;
    }
    for (let i=0;i<arr.length;i++) {
        if (!__eq__(this[i], arr[i])) {
            return false;
        }
    }
    return true;
}

Array.prototype.__lt__ = function(arr) {
    // only for list which depth=1
    if (!(arr instanceof Array)) {
        return this < arr;
    }
    var L1 = this.length;
    var L2 = arr.length;
    var Lmin = L1 < L2 ? L1 : L2;
    for (var i = 0; i < Lmin; i++) {
        if (!__eq__(this[i], arr[i])) {
            return __lt__(this[i], arr[i]);
        }
    }
    return L1 < L2;
}

Array.prototype.__gt__ = function(arr) {
    // only for list which depth=1
    if (!(arr instanceof Array)) {
        return this > arr;
    }
    var L1 = this.length;
    var L2 = arr.length;
    var Lmin = L1 < L2 ? L1 : L2;
    for (var i = 0; i < Lmin; i++) {
        if (!__eq__(this[i], arr[i])) {
            return __gt__(this[i], arr[i]);
        }
    }
    return L1 > L2;
}

Array.prototype.append = function(x) {
    return this.push(x);
}

Array.prototype.count = function(x) {
    var n = 0;
    this.forEach(item => {
        if (__eq__(item, x)) {
            n += 1;
        }
    });
    return n;
}

Array.prototype.extend = function(lst) {
    for (let x of lst) {
        this.push(x);
    }
    return this;
}

Array.prototype.index = function(value, start, stop) {
    var begin = (start === undefined) ? 0 : start;
    var end = (stop === undefined) ? this.length : stop;
    for (let i = begin; i < end; i++) {
        if (__eq__(this[i], value)) {
            return i;
        }
    }
    return -1;
}

Array.prototype.insert = function(idx, item) {
    this.splice(idx, 0, item);
    return this;
}

Array.prototype.__pop__ = Array.prototype.__pop__ || Array.prototype.pop;
Array.prototype.pop = function(idx) {
    if (idx === undefined) {
        return this.__pop__();
    }
    if (0 <= idx && idx < this.length) {
        return this.splice(idx, 1)[0];
    }

}

// Array.prototype.reverse is [native code]

// Array.prototype.sort is [native code]
Array.prototype.__sort__ = Array.prototype.__sort__ || Array.prototype.sort;
Array.prototype.sort = function(argobj) {
    if (type(argobj) === type.dict) {
        var v = argobj.reverse ? -1 : 1;
        var cmpfunc = (a, b)=>(__lt__(a, b) ? -v : (__eq__(a, b) ? 0 : v));
        if (argobj.cmp != null) {
            let cmp = argobj.cmp;
            cmpfunc = (a, b) => (cmp(a, b) * v);
        } else if (argobj.key != null) {
            let key = argobj.key;
            cmpfunc = (a, b) => ((
                (ka, kb) => (__lt__(ka, kb) ? -v : (__eq__(ka, kb) ? 0 : v))
            )(key(a), key(b)));
        }
        return this.__sort__(cmpfunc);
    }
    return this.__sort__(argobj);
}

// override list[] (get & set)
Array.prototype.val = function(idx, value) {
    if (idx < 0) {
        idx = this.length + idx;
    }
    if (value === undefined) {
        return this[idx];
    }
    this[idx] = value;
    return value;
}
