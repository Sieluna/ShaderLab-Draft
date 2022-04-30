var Tree;
(function (Tree) {
    Tree[Tree["BranchShift"] = 5] = "BranchShift";
    Tree[Tree["Branch"] = 32] = "Branch";
})(Tree || (Tree = {}));
var Open;
(function (Open) {
    Open[Open["From"] = 1] = "From";
    Open[Open["To"] = 2] = "To";
})(Open || (Open = {}));
export class Text {
    constructor() { }
    lineAt(pos) {
        if (pos < 0 || pos > this.length)
            throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
        return this.lineInner(pos, false, 1, 0);
    }
    line(n) {
        if (n < 1 || n > this.lines)
            throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
        return this.lineInner(n, true, 1, 0);
    }
    replace(from, to, text) {
        let parts = [];
        this.decompose(0, from, parts, 2);
        if (text.length)
            text.decompose(0, text.length, parts, 1 | 2);
        this.decompose(to, this.length, parts, 1);
        return TextNode.from(parts, this.length - (to - from) + text.length);
    }
    append(other) {
        return this.replace(this.length, this.length, other);
    }
    slice(from, to = this.length) {
        let parts = [];
        this.decompose(from, to, parts, 0);
        return TextNode.from(parts, to - from);
    }
    eq(other) {
        if (other == this)
            return true;
        if (other.length != this.length || other.lines != this.lines)
            return false;
        let start = this.scanIdentical(other, 1), end = this.length - this.scanIdentical(other, -1);
        let a = new RawTextCursor(this), b = new RawTextCursor(other);
        for (let skip = start, pos = start;;) {
            a.next(skip);
            b.next(skip);
            skip = 0;
            if (a.lineBreak != b.lineBreak || a.done != b.done || a.value != b.value)
                return false;
            pos += a.value.length;
            if (a.done || pos >= end)
                return true;
        }
    }
    iter(dir = 1) { return new RawTextCursor(this, dir); }
    iterRange(from, to = this.length) { return new PartialTextCursor(this, from, to); }
    iterLines(from, to) {
        let inner;
        if (from == null) {
            inner = this.iter();
        }
        else {
            if (to == null)
                to = this.lines + 1;
            let start = this.line(from).from;
            inner = this.iterRange(start, Math.max(start, to == this.lines + 1 ? this.length : to <= 1 ? 0 : this.line(to - 1).to));
        }
        return new LineCursor(inner);
    }
    toString() { return this.sliceString(0); }
    toJSON() {
        let lines = [];
        this.flatten(lines);
        return lines;
    }
    static of(text) {
        if (text.length == 0)
            throw new RangeError("A document must have at least one line");
        if (text.length == 1 && !text[0])
            return Text.empty;
        return text.length <= 32 ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
    }
}
Symbol.iterator;
class TextLeaf extends Text {
    constructor(text, length = textLength(text)) {
        super();
        this.text = text;
        this.length = length;
    }
    get lines() { return this.text.length; }
    get children() { return null; }
    lineInner(target, isLine, line, offset) {
        for (let i = 0;; i++) {
            let string = this.text[i], end = offset + string.length;
            if ((isLine ? line : end) >= target)
                return new Line(offset, end, line, string);
            offset = end + 1;
            line++;
        }
    }
    decompose(from, to, target, open) {
        let text = from <= 0 && to >= this.length ? this
            : new TextLeaf(sliceText(this.text, from, to), Math.min(to, this.length) - Math.max(0, from));
        if (open & 1) {
            let prev = target.pop();
            let joined = appendText(text.text, prev.text.slice(), 0, text.length);
            if (joined.length <= 32) {
                target.push(new TextLeaf(joined, prev.length + text.length));
            }
            else {
                let mid = joined.length >> 1;
                target.push(new TextLeaf(joined.slice(0, mid)), new TextLeaf(joined.slice(mid)));
            }
        }
        else {
            target.push(text);
        }
    }
    replace(from, to, text) {
        if (!(text instanceof TextLeaf))
            return super.replace(from, to, text);
        let lines = appendText(this.text, appendText(text.text, sliceText(this.text, 0, from)), to);
        let newLen = this.length + text.length - (to - from);
        if (lines.length <= 32)
            return new TextLeaf(lines, newLen);
        return TextNode.from(TextLeaf.split(lines, []), newLen);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
        let result = "";
        for (let pos = 0, i = 0; pos <= to && i < this.text.length; i++) {
            let line = this.text[i], end = pos + line.length;
            if (pos > from && i)
                result += lineSep;
            if (from < end && to > pos)
                result += line.slice(Math.max(0, from - pos), to - pos);
            pos = end + 1;
        }
        return result;
    }
    flatten(target) {
        for (let line of this.text)
            target.push(line);
    }
    scanIdentical() { return 0; }
    static split(text, target) {
        let part = [], len = -1;
        for (let line of text) {
            part.push(line);
            len += line.length + 1;
            if (part.length == 32) {
                target.push(new TextLeaf(part, len));
                part = [];
                len = -1;
            }
        }
        if (len > -1)
            target.push(new TextLeaf(part, len));
        return target;
    }
}
class TextNode extends Text {
    constructor(children, length) {
        super();
        this.children = children;
        this.length = length;
        this.lines = 0;
        for (let child of children)
            this.lines += child.lines;
    }
    lineInner(target, isLine, line, offset) {
        for (let i = 0;; i++) {
            let child = this.children[i], end = offset + child.length, endLine = line + child.lines - 1;
            if ((isLine ? endLine : end) >= target)
                return child.lineInner(target, isLine, line, offset);
            offset = end + 1;
            line = endLine + 1;
        }
    }
    decompose(from, to, target, open) {
        for (let i = 0, pos = 0; pos <= to && i < this.children.length; i++) {
            let child = this.children[i], end = pos + child.length;
            if (from <= end && to >= pos) {
                let childOpen = open & ((pos <= from ? 1 : 0) | (end >= to ? 2 : 0));
                if (pos >= from && end <= to && !childOpen)
                    target.push(child);
                else
                    child.decompose(from - pos, to - pos, target, childOpen);
            }
            pos = end + 1;
        }
    }
    replace(from, to, text) {
        if (text.lines < this.lines)
            for (let i = 0, pos = 0; i < this.children.length; i++) {
                let child = this.children[i], end = pos + child.length;
                if (from >= pos && to <= end) {
                    let updated = child.replace(from - pos, to - pos, text);
                    let totalLines = this.lines - child.lines + updated.lines;
                    if (updated.lines < (totalLines >> (5 - 1)) &&
                        updated.lines > (totalLines >> (5 + 1))) {
                        let copy = this.children.slice();
                        copy[i] = updated;
                        return new TextNode(copy, this.length - (to - from) + text.length);
                    }
                    return super.replace(pos, end, updated);
                }
                pos = end + 1;
            }
        return super.replace(from, to, text);
    }
    sliceString(from, to = this.length, lineSep = "\n") {
        let result = "";
        for (let i = 0, pos = 0; i < this.children.length && pos <= to; i++) {
            let child = this.children[i], end = pos + child.length;
            if (pos > from && i)
                result += lineSep;
            if (from < end && to > pos)
                result += child.sliceString(from - pos, to - pos, lineSep);
            pos = end + 1;
        }
        return result;
    }
    flatten(target) {
        for (let child of this.children)
            child.flatten(target);
    }
    scanIdentical(other, dir) {
        if (!(other instanceof TextNode))
            return 0;
        let length = 0;
        let [iA, iB, eA, eB] = dir > 0 ? [0, 0, this.children.length, other.children.length]
            : [this.children.length - 1, other.children.length - 1, -1, -1];
        for (;; iA += dir, iB += dir) {
            if (iA == eA || iB == eB)
                return length;
            let chA = this.children[iA], chB = other.children[iB];
            if (chA != chB)
                return length + chA.scanIdentical(chB, dir);
            length += chA.length + 1;
        }
    }
    static from(children, length = children.reduce((l, ch) => l + ch.length + 1, -1)) {
        let lines = 0;
        for (let ch of children)
            lines += ch.lines;
        if (lines < 32) {
            let flat = [];
            for (let ch of children)
                ch.flatten(flat);
            return new TextLeaf(flat, length);
        }
        let chunk = Math.max(32, lines >> 5), maxChunk = chunk << 1, minChunk = chunk >> 1;
        let chunked = [], currentLines = 0, currentLen = -1, currentChunk = [];
        function add(child) {
            let last;
            if (child.lines > maxChunk && child instanceof TextNode) {
                for (let node of child.children)
                    add(node);
            }
            else if (child.lines > minChunk && (currentLines > minChunk || !currentLines)) {
                flush();
                chunked.push(child);
            }
            else if (child instanceof TextLeaf && currentLines &&
                (last = currentChunk[currentChunk.length - 1]) instanceof TextLeaf &&
                child.lines + last.lines <= 32) {
                currentLines += child.lines;
                currentLen += child.length + 1;
                currentChunk[currentChunk.length - 1] = new TextLeaf(last.text.concat(child.text), last.length + 1 + child.length);
            }
            else {
                if (currentLines + child.lines > chunk)
                    flush();
                currentLines += child.lines;
                currentLen += child.length + 1;
                currentChunk.push(child);
            }
        }
        function flush() {
            if (currentLines == 0)
                return;
            chunked.push(currentChunk.length == 1 ? currentChunk[0] : TextNode.from(currentChunk, currentLen));
            currentLen = -1;
            currentLines = currentChunk.length = 0;
        }
        for (let child of children)
            add(child);
        flush();
        return chunked.length == 1 ? chunked[0] : new TextNode(chunked, length);
    }
}
Text.empty = new TextLeaf([""], 0);
function textLength(text) {
    let length = -1;
    for (let line of text)
        length += line.length + 1;
    return length;
}
function appendText(text, target, from = 0, to = 1e9) {
    for (let pos = 0, i = 0, first = true; i < text.length && pos <= to; i++) {
        let line = text[i], end = pos + line.length;
        if (end >= from) {
            if (end > to)
                line = line.slice(0, to - pos);
            if (pos < from)
                line = line.slice(from - pos);
            if (first) {
                target[target.length - 1] += line;
                first = false;
            }
            else
                target.push(line);
        }
        pos = end + 1;
    }
    return target;
}
function sliceText(text, from, to) {
    return appendText(text, [""], from, to);
}
class RawTextCursor {
    constructor(text, dir = 1) {
        this.dir = dir;
        this.done = false;
        this.lineBreak = false;
        this.value = "";
        this.nodes = [text];
        this.offsets = [dir > 0 ? 1 : (text instanceof TextLeaf ? text.text.length : text.children.length) << 1];
    }
    nextInner(skip, dir) {
        this.done = this.lineBreak = false;
        for (;;) {
            let last = this.nodes.length - 1;
            let top = this.nodes[last], offsetValue = this.offsets[last], offset = offsetValue >> 1;
            let size = top instanceof TextLeaf ? top.text.length : top.children.length;
            if (offset == (dir > 0 ? size : 0)) {
                if (last == 0) {
                    this.done = true;
                    this.value = "";
                    return this;
                }
                if (dir > 0)
                    this.offsets[last - 1]++;
                this.nodes.pop();
                this.offsets.pop();
            }
            else if ((offsetValue & 1) == (dir > 0 ? 0 : 1)) {
                this.offsets[last] += dir;
                if (skip == 0) {
                    this.lineBreak = true;
                    this.value = "\n";
                    return this;
                }
                skip--;
            }
            else if (top instanceof TextLeaf) {
                let next = top.text[offset + (dir < 0 ? -1 : 0)];
                this.offsets[last] += dir;
                if (next.length > Math.max(0, skip)) {
                    this.value = skip == 0 ? next : dir > 0 ? next.slice(skip) : next.slice(0, next.length - skip);
                    return this;
                }
                skip -= next.length;
            }
            else {
                let next = top.children[offset + (dir < 0 ? -1 : 0)];
                if (skip > next.length) {
                    skip -= next.length;
                    this.offsets[last] += dir;
                }
                else {
                    if (dir < 0)
                        this.offsets[last]--;
                    this.nodes.push(next);
                    this.offsets.push(dir > 0 ? 1 : (next instanceof TextLeaf ? next.text.length : next.children.length) << 1);
                }
            }
        }
    }
    next(skip = 0) {
        if (skip < 0) {
            this.nextInner(-skip, (-this.dir));
            skip = this.value.length;
        }
        return this.nextInner(skip, this.dir);
    }
}
Symbol.iterator;
class PartialTextCursor {
    constructor(text, start, end) {
        this.value = "";
        this.done = false;
        this.cursor = new RawTextCursor(text, start > end ? -1 : 1);
        this.pos = start > end ? text.length : 0;
        this.from = Math.min(start, end);
        this.to = Math.max(start, end);
    }
    nextInner(skip, dir) {
        if (dir < 0 ? this.pos <= this.from : this.pos >= this.to) {
            this.value = "";
            this.done = true;
            return this;
        }
        skip += Math.max(0, dir < 0 ? this.pos - this.to : this.from - this.pos);
        let limit = dir < 0 ? this.pos - this.from : this.to - this.pos;
        if (skip > limit)
            skip = limit;
        limit -= skip;
        let { value } = this.cursor.next(skip);
        this.pos += (value.length + skip) * dir;
        this.value = value.length <= limit ? value : dir < 0 ? value.slice(value.length - limit) : value.slice(0, limit);
        this.done = !this.value;
        return this;
    }
    next(skip = 0) {
        if (skip < 0)
            skip = Math.max(skip, this.from - this.pos);
        else if (skip > 0)
            skip = Math.min(skip, this.to - this.pos);
        return this.nextInner(skip, this.cursor.dir);
    }
    get lineBreak() { return this.cursor.lineBreak && this.value != ""; }
}
Symbol.iterator;
class LineCursor {
    constructor(inner) {
        this.inner = inner;
        this.afterBreak = true;
        this.value = "";
        this.done = false;
    }
    next(skip = 0) {
        let { done, lineBreak, value } = this.inner.next(skip);
        if (done) {
            this.done = true;
            this.value = "";
        }
        else if (lineBreak) {
            if (this.afterBreak) {
                this.value = "";
            }
            else {
                this.afterBreak = true;
                this.next();
            }
        }
        else {
            this.value = value;
            this.afterBreak = false;
        }
        return this;
    }
    get lineBreak() { return false; }
}
Symbol.iterator;
if (typeof Symbol != "undefined") {
    Text.prototype[Symbol.iterator] = function () { return this.iter(); };
    RawTextCursor.prototype[Symbol.iterator] = PartialTextCursor.prototype[Symbol.iterator] =
        LineCursor.prototype[Symbol.iterator] = function () { return this; };
}
export class Line {
    constructor(from, to, number, text) {
        this.from = from;
        this.to = to;
        this.number = number;
        this.text = text;
    }
    get length() { return this.to - this.from; }
}
