
class urllib {
    quote(text) {
        return encodeURIComponent(text);
    }

    unquote(text) {
        return decodeURIComponent(text);
    }

    param(search) {
        search = search || location.search;
        if (search[0] === '?') {
            search = search.substr(1);
        }
        if (!search) {
            return {};
        }
        var segs = map(x=>str.split(x, '=', 1), str.split(search, '&'));
        return dict(map(x=>[urllib.unquote(x[0]), urllib.unquote(x[1])], segs));
    }
}

export default urllib