import { codePointAt, codePointSize, fromCodePoint } from "../state/index.js";
const basicNormalize = typeof String.prototype.normalize == "function"
    ? x => x.normalize("NFKD") : x => x;
export class SearchCursor {
    constructor(text, query, from = 0, to = text.length, normalize) {
        this.value = { from: 0, to: 0 };
        this.done = false;
        this.matches = [];
        this.buffer = "";
        this.bufferPos = 0;
        this.iter = text.iterRange(from, to);
        this.bufferStart = from;
        this.normalize = normalize ? x => normalize(basicNormalize(x)) : basicNormalize;
        this.query = this.normalize(query);
    }
    peek() {
        if (this.bufferPos == this.buffer.length) {
            this.bufferStart += this.buffer.length;
            this.iter.next();
            if (this.iter.done)
                return -1;
            this.bufferPos = 0;
            this.buffer = this.iter.value;
        }
        return codePointAt(this.buffer, this.bufferPos);
    }
    next() {
        while (this.matches.length)
            this.matches.pop();
        return this.nextOverlapping();
    }
    nextOverlapping() {
        for (;;) {
            let next = this.peek();
            if (next < 0) {
                this.done = true;
                return this;
            }
            let str = fromCodePoint(next), start = this.bufferStart + this.bufferPos;
            this.bufferPos += codePointSize(next);
            let norm = this.normalize(str);
            for (let i = 0, pos = start;; i++) {
                let code = norm.charCodeAt(i);
                let match = this.match(code, pos);
                if (match) {
                    this.value = match;
                    return this;
                }
                if (i == norm.length - 1)
                    break;
                if (pos == start && i < str.length && str.charCodeAt(i) == code)
                    pos++;
            }
        }
    }
    match(code, pos) {
        let match = null;
        for (let i = 0; i < this.matches.length; i += 2) {
            let index = this.matches[i], keep = false;
            if (this.query.charCodeAt(index) == code) {
                if (index == this.query.length - 1) {
                    match = { from: this.matches[i + 1], to: pos + 1 };
                }
                else {
                    this.matches[i]++;
                    keep = true;
                }
            }
            if (!keep) {
                this.matches.splice(i, 2);
                i -= 2;
            }
        }
        if (this.query.charCodeAt(0) == code) {
            if (this.query.length == 1)
                match = { from: pos, to: pos + 1 };
            else
                this.matches.push(1, pos);
        }
        return match;
    }
}
Symbol.iterator;
if (typeof Symbol != "undefined")
    SearchCursor.prototype[Symbol.iterator] = function () { return this; };
