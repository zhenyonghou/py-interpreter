import { _dict, _str } from "../builtins"

class json {
    static dumps(obj: _dict, indent: number = 4) {
        const s = JSON.stringify(obj._items, null, indent)
        return new _str(s)
    }

    static loads(s: _str) {
        const d = JSON.parse(s._obj)
        return new _dict(d)
    }
}

export default json