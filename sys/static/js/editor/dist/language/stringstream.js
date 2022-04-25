function countCol(string, end, tabSize, startIndex = 0, startValue = 0) {
    if (end == null) {
        end = string.search(/[^\s\u00a0]/);
        if (end == -1)
            end = string.length;
    }
    let n = startValue;
    for (let i = startIndex; i < end; i++) {
        if (string.charCodeAt(i) == 9)
            n += tabSize - (n % tabSize);
        else
            n++;
    }
    return n;
}
export class StringStream {
    constructor(string, tabSize, indentUnit) {
        this.string = string;
        this.tabSize = tabSize;
        this.indentUnit = indentUnit;
        this.pos = 0;
        this.start = 0;
        this.lastColumnPos = 0;
        this.lastColumnValue = 0;
    }
    eol() { return this.pos >= this.string.length; }
    sol() { return this.pos == 0; }
    peek() { return this.string.charAt(this.pos) || undefined; }
    next() {
        if (this.pos < this.string.length)
            return this.string.charAt(this.pos++);
    }
    eat(match) {
        let ch = this.string.charAt(this.pos);
        let ok;
        if (typeof match == "string")
            ok = ch == match;
        else
            ok = ch && (match instanceof RegExp ? match.test(ch) : match(ch));
        if (ok) {
            ++this.pos;
            return ch;
        }
    }
    eatWhile(match) {
        let start = this.pos;
        while (this.eat(match)) { }
        return this.pos > start;
    }
    eatSpace() {
        let start = this.pos;
        while (/[\s\u00a0]/.test(this.string.charAt(this.pos)))
            ++this.pos;
        return this.pos > start;
    }
    skipToEnd() { this.pos = this.string.length; }
    skipTo(ch) {
        let found = this.string.indexOf(ch, this.pos);
        if (found > -1) {
            this.pos = found;
            return true;
        }
    }
    backUp(n) { this.pos -= n; }
    column() {
        if (this.lastColumnPos < this.start) {
            this.lastColumnValue = countCol(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue);
            this.lastColumnPos = this.start;
        }
        return this.lastColumnValue;
    }
    indentation() {
        return countCol(this.string, null, this.tabSize);
    }
    match(pattern, consume, caseInsensitive) {
        if (typeof pattern == "string") {
            let cased = (str) => caseInsensitive ? str.toLowerCase() : str;
            let substr = this.string.substr(this.pos, pattern.length);
            if (cased(substr) == cased(pattern)) {
                if (consume !== false)
                    this.pos += pattern.length;
                return true;
            }
            else
                return null;
        }
        else {
            let match = this.string.slice(this.pos).match(pattern);
            if (match && match.index > 0)
                return null;
            if (match && consume !== false)
                this.pos += match[0].length;
            return match;
        }
    }
    current() { return this.string.slice(this.start, this.pos); }
}
