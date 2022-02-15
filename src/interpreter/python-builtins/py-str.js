function str(x) {
    return '' + x;
}

Object.assign(str, {
    split: function(text, sep, maxsplit) {
        if (sep == null) {
            text = text.trim();
            sep = /\s+/;
        }
        var segs = text.split(sep);
        var L = segs.length;
        if (maxsplit == null || maxsplit < 0 || maxsplit >= L - 1) {
            return segs;
        }
        var left = __slice__(segs, 0, maxsplit);
        var right = __slice__(segs, maxsplit);
        // **there is a bug when sep is null and maxsplit is not null
        left.push(right.join(sep));
        return left;
    },
    rsplit: function(text, sep, maxsplit) {
        if (maxsplit === 0) {
            return [text];
        }
        if (sep == null) {
            sep = /\s+/;
        }
        var segs = text.split(sep);
        if (maxsplit == null || maxsplit < 0 || maxsplit >= segs.length - 1) {
            return segs;
        }
        var right = __slice__(segs, -maxsplit);
        var left = __slice__(segs, 0, -maxsplit);
        right.insert(0, left.join(sep));
        return right;
    },
    replace: function(text, older, newer, count) {
        var p = 0;
        var cc = 0;
        while (count == null || count < 0 || cc < count) {
            let i = text.find(older, p);
            if (i === -1) {
                break;
            }
            text = text.substr(0, i) + text.substr(i).replace(older, newer);
            p = i + newer.length;
            cc += 1;
        }
        return text;
    },
})

export default str