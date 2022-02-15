
// bound methods of str
String.prototype.count = function(sub, start, end) {
    // count the number of non-overlapping instances of 'sub'
    // between the optional 'start' and 'end' (0 based indices)
    start = start || 0;
    end = end || this.length;
    var count = 0, idx = start, inc = 0;
    // go until we don't find any more occurences in the slice
    while ((inc = this.slice(idx, end).indexOf(sub)) !== -1) {
        count++;
        idx += (inc + sub.length);
    }
    return count;
}

String.prototype.find = function(sub, start, end) {
    // finds the index of the first occurence of a substring
    // within the slice from start to end
    start = start || 0;
    end = end || this.length;
    var res = this.slice(start, end).indexOf(sub);
    if (res !== -1) {
        // tack on the start, but only if we found something
        res += start;
    }
    return res;
}

String.prototype.join = function(iterable) {
    return list(iterable).join(this);
}

String.prototype.isalnum = function() {
    return (/^[A-Za-z0-9]+$/).test(this);
}

String.prototype.isalpha = function() {
    return (/^[A-Za-z]+$/).test(this);
}

String.prototype.isdigit = function() {
    return (/^\d+$/).test(this);
}

String.prototype.isspace = function() {
    return (/^\s+$/).test(this);
}

String.prototype.lower = function() {
    return this.toLowerCase();
}

String.prototype.upper = function() {
    return this.toUpperCase();
}

String.prototype.splitlines = function(keepends) {
    // Returns a list of the lines, including line breaks if keepends is true
    var retArray = [], newLineRegex = null;
    // without keepnds, we can do the quick and easy split on newline chars
    if (!keepends) {
        newLineRegex = (/[\f\n\r]/);
        retArray = this.split(newLineRegex);
    }
    else {
        // use the capturing functionality of split to keep the newlines
        // we just have to create a new array with every two items concatenated
        newLineRegex = (/([\f\n\r])/);
        var keptArray = this.split(newLineRegex);

        for (var i=0; i<keptArray.length; i+=2) {
            if ((i + 1) < keptArray.length) {
                retArray.push(keptArray[i] + keptArray[i+1]);
            }
            else {
                retArray.push(keptArray[i]);
            }
        }
    }
    // to act like python's version, we need to take off trailing empty strings
    if (retArray.slice(-1)[0] === "") {
        retArray.pop();
    }
    return retArray;
}
// String.prototype.format is https://raw.githubusercontent.com/xfix/python-format/master/lib/python-format.js

String.prototype.strip = function() {
    return this.trim();
}

String.prototype.wrap = function(x, a, b) {
    if (type(a) === type.number) {
        [a, b] = [b, a];
    }
    var attr = '';
    if (a != null) {
        attr = map(x=>` ${x[0]}="${str.replace(x[1], '"', '\\"')}"`, dict.items(a)).join('');
    }
    if (x == null) {
        x = '';
    }
    if (b != null && type(x) === type.number) {
        x = x.toFixed(b) ;
    }
    return this ? `<${this}${attr}>${x}</${this}>` : str(x);
}

String.prototype.wrapin = function(x, a) {
    var attr = '';
    if (!x) {
        return this;
    }
    if (a != null) {
        attr = map(x=>` ${x[0]}="${str.replace(x[1], '"', '\\"')}"`, dict.items(a)).join('');
    }
    return `<${x}${attr}>${this}</${x}>`;
}