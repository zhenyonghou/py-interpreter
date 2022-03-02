// 参考自:https://github.com/qsnake/py2js

var py_builtins = {}

py_builtins.__exceptions__ = [
    'NotImplementedError',
    'ZeroDivisionError',
    'AssertionError',
    'AttributeError',
    'RuntimeError',
    'ImportError',
    'TypeError',
    'ValueError',
    'NameError',
    'IndexError',
    'KeyError',
    'StopIteration'
]

for (var i in py_builtins.__exceptions__) {
    var errorName = py_builtins.__exceptions__[i];

    py_builtins[errorName] = function () {
        return function (message) {
            this.message = defined(message) ? message : "";
        };
    }();

    py_builtins[errorName].__name__ = errorName;
    py_builtins[errorName].prototype.__class__ = py_builtins[errorName];

    py_builtins[errorName].prototype.__str__ = function () {
        return str(js(this.__class__.__name__) + ": " + js(this.message));
    };

    py_builtins[errorName].prototype.toString = function () {
        return js(this.__str__());
    };
}

// 函数

function defined(obj) {
    return typeof (obj) != 'undefined';
}

function assert(cond, msg) {
    if (!cond) {
        throw new Error(msg);
    }
}

function iterate(seq, func) {
    while (true) {
        try {
            func(seq.next());
        } catch (exc) {
            if (isinstance(exc, py_builtins.StopIteration)) {
                break;
            } else {
                throw exc;
            }
        }
    }
}

function _new(cls, arg) {
    return new cls(arg);
}

function js(obj) {
    if ((obj != null) && defined(obj._js_))
        return obj._js_();
    else
        return obj;
}

// export {py_builtins, defined, assert, iterate, js}

/* Python built-in functions */

function hasattr(obj, name) {
    return defined(obj[name]);
}

function getattr(obj, name, value) {
    var _value = obj[name];

    if (defined(_value)) {
        return _value;
    } else {
        if (defined(value)) {
            return value;
        } else {
            throw new py_builtins.AttributeError(obj, name);
        }
    }
}

function setattr(obj, name, value) {
    obj[name] = value;
}

function hash(obj) {
    if (hasattr(obj, '__hash__')) {
        return obj.__hash__();
    } else if (typeof (obj) == 'number') {
        return obj == -1 ? -2 : obj;
    } else {
        throw new py_builtins.AttributeError(obj, '__hash__');
    }
}

function len(obj) {
    if (hasattr(obj, '__len__')) {
        return obj.__len__();
    } else {
        throw new py_builtins.AttributeError(obj, '__name__');
    }
}

function range(start, end, step) {
    if (!defined(end)) {
        end = start;
        start = 0;
    }

    if (!defined(step)) {
        step = 1;
    }

    var seq = [];

    for (var i = start; i < end; i += step) {
        seq.push(i);
    }

    return iter(seq)
}

function xrange(start, end, step) {
    return iter(range(start, end, step));
}

function map() {
    if (arguments.length < 2) {
        throw new py_builtins.TypeError("map() requires at least two args");
    }

    if (arguments.length > 2) {
        throw new py_builtins.NotImplementedError("only one sequence allowed in map()");
    }

    var func = arguments[0];
    var seq = iter(arguments[1]);

    var items = list();

    iterate(seq, function (item) {
        items.append(func(item));
    });

    if (py_builtins.__python3__)
        return iter(items);
    else
        return items;
}

function zip() {
    if (!arguments.length) {
        return list();
    }

    var iters = list();
    var i;

    for (i = 0; i < arguments.length; i++) {
        iters.append(iter(arguments[i]));
    }

    var items = list();

    while (true) {
        var item = list();

        for (i = 0; i < arguments.length; i++) {
            try {
                var value = iters.__getitem__(i).next();
            } catch (exc) {
                if (isinstance(exc, py_builtins.StopIteration)) {
                    return items;
                } else {
                    throw exc;
                }
            }

            item.append(value);
        }

        items.append(tuple(item));
    }
}

function isinstance(obj, cls) {
    if (cls instanceof _tuple) {
        var length = cls.__len__();

        if (length == 0) {
            return false;
        }

        for (var i = 0; i < length; i++) {
            var _cls = cls.__getitem__(i);

            if (isinstance(obj, _cls)) {
                return true;
            }
        }

        return false;
    } else {
        if (defined(obj.__class__) && defined(cls.__name__)) {
            return obj.__class__ == cls;
        } else {
            return obj instanceof cls;
        }
    }
}
/// 方法

function bool(a) {
    if ((a != null) && defined(a.__bool__))
        return a.__bool__();
    else {
        if (a)
            return true;
        else
            return false;
    }
}

function abs(x) {
    return Math.abs(x);
}

function eq(a, b) {
    if ((a != null) && defined(a.__eq__))
        return a.__eq__(b);
    else if ((b != null) && defined(b.__eq__))
        return b.__eq__(a);
    else
        return a == b;
}

function _int(value) {
    return value;
}

function _float(value) {
    return value;
}

function max(...theArgs) {
    if (theArgs.length == 0)
        throw new py_builtins.ValueError("max() arg is an empty sequence");
    else {
        var result = null
        theArgs.forEach(item => {
            if ((result == null) || (item > result)) {
                result = item
            }
        })
        return result;
    }
}

function min(...theArgs) {
    if (theArgs.length == 0)
        throw new py_builtins.ValueError("min() arg is an empty sequence");
    else {
        var result = null
        theArgs.forEach(item => {
            if ((result == null) || (item < result)) {
                result = item
            }
        })
        return result;
    }
}

function sum(...theArgs) {
    var result = 0

    theArgs.forEach(item => {
        result += item
    })

    return result
}

function print(...theArgs) {
    const arr = []
    theArgs.forEach(item => {
        if (item instanceof Object && 'toString' in item) {
            arr.push(item.toString())
        } else {
            arr.push(item)
        }
    })
    console.log(...arr)
}

// ============ iter ============

function iter(obj) {
    if (obj instanceof Array) {
        return new _iter(obj);
    } else if (typeof (obj) === "string") {
        return iter(obj.split(""));
    } else if (obj.__class__ == _iter) {
        return obj;
    } else if (defined(obj.__iter__)) {
        return obj.__iter__();
    } else {
        throw new py_builtins.TypeError("object is not iterable");
    }
}

class _iter {
    constructor(seq) {
        this.__init__(seq);
    }
    __init__(seq) {
        this._seq = seq;
        this._index = 0;
    }
    __str__() {
        return str("<iter of " + this._seq + " at " + this._index + ">");
    }
    toString() {
        return js(this.__str__());
    }
    next() {
        var value = this._seq[this._index++];

        if (defined(value)) {
            return value;
        } else {
            throw new py_builtins.StopIteration('no more items');
        }
    }
}

_iter.__name__ = 'iter';
_iter.prototype.__class__ = _iter;


// ============ slice ============


function slice(start, stop, step) {
    return new _slice(start, stop, step);
}

class _slice {
    constructor(start, stop, step) {
        this.__init__(start, stop, step);
    }
    __init__(start, stop, step) {
        if (!defined(stop) && !defined(step)) {
            stop = start;
            start = null;
        }
        if (!start && start != 0)
            start = null;
        if (!defined(stop))
            stop = null;
        if (!defined(step))
            step = null;
        this.start = start;
        this.stop = stop;
        this.step = step;
    }
    __str__() {
        return str("slice(" + this.start + ", " + this.stop + ", " + this.step + ")");
    }
    indices(n) {
        var start = this.start;
        if (start == null)
            start = 0;
        if (start > n)
            start = n;
        if (start < 0)
            start = n + start;
        var stop = this.stop;
        if (stop > n)
            stop = n;
        if (stop == null)
            stop = n;
        if (stop < 0)
            stop = n + stop;
        var step = this.step;
        if (step == null)
            step = 1;
        return tuple([start, stop, step]);
    }
}

_slice.__name__ = 'slice';
_slice.prototype.__class__ = _slice;

// ============ tuple ============

function tuple(seq) {
    if (arguments.length <= 1) {
        return new _tuple(seq);
    } else {
        throw new py_builtins.TypeError("tuple() takes at most 1 argument (" + arguments.length + " given)");
    }
}

class _tuple {
    constructor(seq) {
        this.__init__(seq);
    }
    __init__(seq) {
        if (!defined(seq)) {
            this._items = [];
            this._len = 0;
        } else {
            var items = [];
            iterate(iter(seq), function (item) {
                items.push(item);
            })
            this._items = items
            this._len = -1
        }
    }
    __str__() {
        if (this.__len__() == 1) {
            return str("(" + this._items[0] + ",)");
        } else {
            return str("(" + this._items.join(", ") + ")");
        }
    }
    __eq__(other) {
        if (other.__class__ == this.__class__) {
            if (len(this) != len(other))
                return false;
            for (var i = 0; i < len(this); i++) {
                // TODO: use __eq__ here as well:
                if (this._items[i] != other._items[i])
                    return false;
            }
            return true;
            // This doesn't take into account hash collisions:
            //return hash(this) == hash(other)
        }
        else
            return false;
    }
    toString() {
        return js(this.__str__());
    }
    _js_() {
        var items = [];

        iterate(iter(this), function (item) {
            items.push(js(item));
        });

        return items;
    }
    __hash__() {
        var value = 0x345678;
        var length = this.__len__();

        for (var index in this._items) {
            value = ((1000003 * value) & 0xFFFFFFFF) ^ hash(this._items[index]);
            value = value ^ length;
        }

        if (value == -1) {
            value = -2;
        }

        return value;
    }
    __len__() {
        if (this._len == -1) {
            var count = 0;

            for (var index in this._items) {
                count += 1;
            }

            this._len = count;
            return count;
        }
        else
            return this._len;
    }
    __iter__() {
        return new _iter(this._items);
    }
    __contains__(item) {
        for (var index in this._items) {
            if (eq(item, this._items[index])) {
                return true;
            }
        }

        return false;
    }
    __getitem__(index) {
        var seq;
        if (isinstance(index, _slice)) {
            var s = index;
            var inds = s.indices(len(this));
            var start = inds.__getitem__(0);
            var stop = inds.__getitem__(1);
            var step = inds.__getitem__(2);
            seq = [];
            for (var i = start; i < stop; i += step) {
                seq.push(this.__getitem__(i));
            }
            return new this.__class__(seq);
        } else if ((index >= 0) && (index < len(this))) {
            return this._items[index]
        }
        else if ((index < 0) && (index >= -len(this))) {
            return this._items[index + len(this)]
        } else {
            throw new py_builtins.IndexError("list assignment index out of range")
        }
    }
    __setitem__(index, value) {
        throw new py_builtins.TypeError("'tuple' object doesn't support item assignment");
    }
    __delitem__(index) {
        throw new py_builtins.TypeError("'tuple' object doesn't support item deletion");
    }
    __push__(...item) {
        this._items.push(...item)
        this._len += item.length
    }

    __concat__(t) {
        var items = []

        iterate(iter(this), function (item) {
            items.push(js(item));
        })

        iterate(iter(t), function (item) {
            items.push(js(item));
        })

        return new this.__class__(items)
    }

    count(value) {
        var count = 0;

        for (var index in this._items) {
            if (value == this._items[index]) {
                count += 1;
            }
        }

        return count;
    }
    index(value, start, end) {
        if (!defined(start)) {
            start = 0;
        }

        for (var i = start; !defined(end) || (start < end); i++) {
            var _value = this._items[i];

            if (!defined(_value)) {
                break;
            }

            if (_value == value) {
                return i;
            }
        }

        throw new py_builtins.ValueError("tuple.index(x): x not in list");
    }
}

_tuple.__name__ = 'tuple';
_tuple.prototype.__class__ = _tuple;

// ============ list ============


function list(seq) {
    if (arguments.length <= 1) {
        return new _list(seq);
    } else {
        throw new py_builtins.TypeError("list() takes at most 1 argument (" + arguments.length + " given)");
    }
}

class _list {
    constructor(seq) {
        this.__init__(seq);
    }
    __str__() {
        return str("[" + this._items.join(", ") + "]");
    }
    __setitem__(index, value) {
        if ((index >= 0) && (index < len(this)))
            this._items[index] = value;
        else if ((index < 0) && (index >= -len(this)))
            this._items[index + len(this)] = value;

        else
            throw new py_builtins.IndexError("list assignment index out of range");
    }
    __setslice__(lower, upper, value) {
        var it = list(value)._items;
        if (lower < len(this) && upper < len(this)) {
            this._items = this._items.slice(0, lower).concat(it).concat(this._items.slice(upper, len(this)));
            this._len = -1;
        }
    }
    __delitem__(index) {
        if ((index >= 0) && (index < len(this))) {
            var a = this._items.slice(0, index);
            var b = this._items.slice(index + 1, len(this));
            this._items = a.concat(b);
            this._len = -1;
        }
        else {
            throw new py_builtins.IndexError("list assignment index out of range")
        }
    }

    __clear__() {
        this._items = []
        this._len = 0
    }

    index(value, start, end) {
        if (!defined(start)) {
            start = 0;
        }

        for (var i = start; !defined(end) || (start < end); i++) {
            var _value = this._items[i];

            if (!defined(_value)) {
                break;
            }

            if (_value == value) {
                return i;
            }

            if (defined(_value.__eq__)) {
                if (_value.__eq__(value))
                    return i;
            }
        }

        throw new py_builtins.ValueError("list.index(x): x not in list");
    }
    remove(value) {
        this.__delitem__(this.index(value));
    }
    append(value) {
        this._items.push(value);
        this._len = -1;
    }
    extend(l) {
        var items;
        items = this._items;
        iterate(iter(l), function (item) {
            items.push(item);
        });
        this._len = -1;
    }
    pop() {
        if (len(this) > 0) {
            this._len = -1;
            return this._items.pop();
        }
        else
            throw new py_builtins.IndexError("pop from empty list");
    }
    sort() {
        this._items.sort();
    }
    insert(index, x) {
        var a = this._items.slice(0, index);
        var b = this._items.slice(index, len(this));
        this._items = a.concat([x], b);
        this._len = -1;
    }
    reverse() {
        var new_list = list([]);
        iterate(iter(this), function (item) {
            new_list.insert(0, item);
        });
        this._items = new_list._items;
    }
}

_list.__name__ = 'list';
_list.prototype.__class__ = _list;

_list.prototype.__init__ = _tuple.prototype.__init__;


_list.prototype.__eq__ = _tuple.prototype.__eq__;

_list.prototype.toString = _tuple.prototype.toString;

_list.prototype._js_ = _tuple.prototype._js_;

_list.prototype.__len__ = _tuple.prototype.__len__;

_list.prototype.__iter__ = _tuple.prototype.__iter__;

_list.prototype.__contains__ = _tuple.prototype.__contains__;

_list.prototype.__getitem__ = _tuple.prototype.__getitem__

_list.prototype.count = _tuple.prototype.count

_list.prototype.__concat__ = _tuple.prototype.__concat__

// ============ dict ============

function dict(args) {
    return new _dict(args);
}

class _dict {
    constructor(args) {
        this.__init__(args);
    }
    __init__(args) {
        var items;
        var key;
        var value;

        if (defined(args)) {
            if (defined(args.__iter__)) {
                items = {};
                iterate(iter(args), function (item) {
                    key = js(item.__getitem__(0));
                    value = item.__getitem__(1);
                    items[key] = value;
                });
                this._items = items;
            }
            else
                this._items = args;
        } else {
            this._items = {};
        }
    }
    __str__() {
        var strings = [];

        for (var key in this._items) {
            strings.push(js(str(key)) + ": " + js(str(this._items[key])));
        }

        return str("{" + strings.join(", ") + "}");
    }
    toString() {
        return js(this.__str__());
    }
    _js_() {
        var items = {};

        var _this_dict = this; // so that we can access it from within the closure:
        iterate(iter(this), function (key) {
            items[key] = js(_this_dict.__getitem__(key));
        });

        return items;
    }
    __hash__() {
        throw new py_builtins.TypeError("unhashable type: 'dict'");
    }
    __len__() {
        var count = 0;

        for (var key in this._items) {
            count += 1;
        }

        return count;
    }
    __iter__() {
        return new _iter(this.keys());
    }
    __contains__(key) {
        return defined(this._items[key]);
    }
    __getitem__(key) {
        var value = this._items[key];

        if (defined(value)) {
            return value;
        } else {
            throw new py_builtins.KeyError(str(key));
        }
    }
    __setitem__(key, value) {
        this._items[key] = value;
    }
    __delitem__(key) {
        if (this.__contains__(key)) {
            delete this._items[key];
        } else {
            throw new py_builtins.KeyError(str(key));
        }
    }
    get(key, value) {
        var _value = this._items[key];

        if (defined(_value)) {
            return _value;
        } else {
            if (defined(value)) {
                return value;
            } else {
                return null;
            }
        }
    }
    items() {
        var items = [];

        for (var key in this._items) {
            items.push([key, this._items[key]]);
        }

        return items;
    }
    keys() {
        var keys = [];

        for (var key in this._items) {
            keys.push(key);
        }

        return keys;
    }
    values() {
        var values = [];

        for (var key in this._items) {
            values.push(this._items[key]);
        }

        return values;
    }
    update(other) {
        for (var key in other) {
            this._items[key] = other[key];
        }
    }
    clear() {
        for (var key in this._items) {
            delete this._items[key];
        }
    }
    pop(key, value) {
        var _value = this._items[key];

        if (defined(_value)) {
            delete this._items[key];
        } else {
            if (defined(value)) {
                _value = value;
            } else {
                throw new py_builtins.KeyError(str(key));
            }
        }

        return _value;
    }
    popitem() {
        var _key

        for (var key in this._items) {
            _key = key
            break
        }

        if (defined(key)) {
            return [_key, this._items[_key]]
        } else {
            throw new py_builtins.KeyError("popitem(): dictionary is empty")
        }
    }

    copy() {
        let target = new _dict()
        return Object.assign(target, this)
    }
}

_dict.__name__ = 'dict'
_dict.prototype.__class__ = _dict

// ============ str ============


function str(s) {
    return new _str(s);
}

class _str {
    constructor(s) {
        this.__init__(s);
    }
    __init__(s) {
        if (!defined(s)) {
            this._obj = '';
        } else {
            if (typeof (s) === "string") {
                this._obj = s;
            } else if (defined(s.toString)) {
                this._obj = s.toString();
            } else if (defined(s.__str__)) {
                this._obj = js(s.__str__());
            }
            else
                this._obj = js(s);
        }
    }
    __str__() {
        return this._obj;
    }
    __eq__(other) {
        if (other.__class__ == this.__class__) {
            if (len(this) != len(other))
                return false;
            for (var i = 0; i < len(this); i++) {
                if (this._obj[i] != other._obj[i])
                    return false;
            }
            return true;
        }
        else
            return false;
    }
    toString() {
        return js(this.__str__());
    }
    _js_() {
        return this._obj;
    }
    __hash__() {
        var value = 0x345678;
        var length = this.__len__();

        for (var index in this._obj) {
            value = ((1000003 * value) & 0xFFFFFFFF) ^ hash(this._obj[index]);
            value = value ^ length;
        }

        if (value == -1) {
            value = -2;
        }

        return value;
    }
    __len__() {
        return this._obj.length;
    }
    __iter__() {
        return iter(this._obj);
    }
    __bool__() {
        return bool(this._obj);
    }
    __contains__(item) {
        for (var index in this._obj) {
            if (item == this._obj[index]) {
                return true;
            }
        }

        return false;
    }
    __getitem__(index) {

        var seq;
        if (isinstance(index, _slice)) {
            var s = index;
            var inds = s.indices(len(this));
            var start = inds.__getitem__(0);
            var stop = inds.__getitem__(1);
            var step = inds.__getitem__(2);
            seq = "";
            for (var i = start; i < stop; i += step) {
                seq = seq + js(this.__getitem__(i));
            }
            return new this.__class__(seq);
        } else if ((index >= 0) && (index < len(this)))
            return this._obj[index];
        else if ((index < 0) && (index >= -len(this)))
            return this._obj[index + len(this)];

        else
            throw new py_builtins.IndexError("string index out of range");
    }
    __setitem__(index, value) {
        throw new py_builtins.TypeError("'str' object doesn't support item assignment");
    }
    __delitem__(index) {
        throw new py_builtins.TypeError("'str' object doesn't support item deletion");
    }
    count(str, start, end) {
        if (!defined(start))
            start = 0;
        if (!defined(end))
            end = null;
        var count = 0;
        s = this.__getitem__(slice(start, end));
        idx = s.find(str);
        while (idx != -1) {
            count += 1;
            s = s.__getitem__(slice(idx + 1, null));
            idx = s.find(str);
        }
        return count;
    }
    index(value, start, end) {
        if (!defined(start)) {
            start = 0;
        }

        for (var i = start; !defined(end) || (start < end); i++) {
            var _value = this._obj[i];

            if (!defined(_value)) {
                break;
            }

            if (_value == value) {
                return i;
            }
        }

        throw new py_builtins.ValueError("substring not found");
    }
    find(s) {
        return this._obj.search(s);
    }
    rfind(s) {
        rev = function (s) {
            var a = list(str(s));
            a.reverse();
            a = str("").join(a);
            return a;
        };
        var a = rev(this);
        var b = rev(s);
        var r = a.find(b);
        if (r == -1)
            return r;
        return len(this) - len(b) - r;
    }
    join(s) {
        return str(js(s).join(js(this)));
    }
    replace(old, _new, count) {
        old = js(old);
        _new = js(_new);
        var old_s;
        var new_s;

        if (defined(count))
            count = js(count);

        else
            count = -1;
        old_s = "";
        new_s = this._obj;
        while ((count != 0) && (new_s != old_s)) {
            old_s = new_s;
            new_s = new_s.replace(old, _new);
            count -= 1;
        }
        return str(new_s);
    }
    lstrip(chars) {
        if (len(this) == 0)
            return this;
        if (defined(chars))
            chars = tuple(chars);

        else
            chars = tuple(["\n", "\t", " "]);
        var i = 0;
        while ((i < len(this)) && (chars.__contains__(this.__getitem__(i)))) {
            i += 1;
        }
        return this.__getitem__(slice(i, null));
    }
    rstrip(chars) {
        if (len(this) == 0)
            return this;
        if (defined(chars))
            chars = tuple(chars);

        else
            chars = tuple(["\n", "\t", " "]);
        var i = len(this) - 1;
        while ((i >= 0) && (chars.__contains__(this.__getitem__(i)))) {
            i -= 1;
        }
        return this.__getitem__(slice(i + 1));
    }
    strip(chars) {
        return this.lstrip(chars).rstrip(chars);
    }
    split(sep) {
        if (defined(sep)) {
            var r = list(this._obj.split(sep));
            var r_new = list([]);
            iterate(iter(r), function (item) {
                r_new.append(str(item));
            });
            return r_new;
        }
        else {
            var r_new = list([]);
            iterate(iter(this.split(" ")), function (item) {
                if (len(item) > 0)
                    r_new.append(item);
            });
            return r_new;
        }
    }
    splitlines() {
        return this.split("\n");
    }
    lower() {
        return str(this._obj.toLowerCase());
    }
    upper() {
        return str(this._obj.toUpperCase());
    }
}

_str.__name__ = 'str'
_str.prototype.__class__ = _str // 为啥要加到原型里啊

export {
    assert, hasattr, getattr, setattr, hash, len, range, xrange, map, zip, isinstance, bool, abs, max, min, sum, print, iter,
    iterate, _slice, _list, _tuple, _dict, _str, _iter
}