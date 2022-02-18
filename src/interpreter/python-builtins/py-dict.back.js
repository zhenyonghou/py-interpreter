
class dict {
    constructor(lst) {
        let ret = {};
        for (let [k, v] of lst) {
            ret[k] = v;
        }
        return ret;
    }

    __eq__(a, b) {

    }
}

Object.assign(dict, {
    __eq__: function(a, b) {
        if (type(a) !== type.dict || type(b) !== type.dict) {
            return false;
        }
        var keysA = Object.entries(a).sort();
        var keysB = Object.entries(b).sort();
        return keysA.__eq__(keysB);
    },
    __len__: function(obj) {
        if (type(obj) === type.dict) {
            return Object.keys(obj).length;
        }
    },
    keys: function(obj) {
        if (type(obj) === type.dict) {
            return Object.keys(obj);
        }
    },
    values: function(obj) {
        if (type(obj) === type.dict) {
            return Object.values(obj);
        }
    },
    items: function(obj) {
        if (type(obj) === type.dict) {
            return Object.entries(obj);
        }
    },
    has_key: function(obj, key) {
        return obj[key] === undefined;
    },
    get: function(obj, key, defaultValue) {
        return obj[key] === undefined ? defaultValue : obj[key];
    },
    pop: function(obj, key) {
        var ret = obj[key];
        delete obj[key];
        return ret;
    },
    update: function() {
        return Object.assign.apply(null, arguments);
    },
    clear: function(obj) {
        var keys = Object.keys(obj);
        for (var k of keys) {
            delete obj[k];
        }
        return obj;
    },
    copy: function(obj) {
        return Object.assign({}, obj);
    },
    setdefault: function(obj, key, defaultValue) {
        if (obj[key] === undefined) {
            obj[key] = defaultValue;
        }
        return obj[key];
    },
    select: function(obj, keys) {
        var ret = {};
        for (key of keys) {
            ret[key] = obj[key];
        }
        return ret;
    }
})