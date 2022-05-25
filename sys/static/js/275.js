"use strict";
(self["webpackChunkshaderlab"] = self["webpackChunkshaderlab"] || []).push([[275],{

/***/ 275:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "W": () => (/* binding */ compileDelegate),
/* harmony export */   "Y": () => (/* binding */ wordCounter)
/* harmony export */ });
/* harmony import */ var _dist_view_panel_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(443);


let compile = function () {};
let compileDelegate = function (callback) { compile = callback; };

function countWords(doc) {
    let count = 0, iter = doc.iter();
    while (!iter.next().done) {
        for (let i = 0; i < iter.value.length; i++) {
            let word = /\w/.test(iter.value[i]);
            if (word) count++;
        }
    }
    return `Char count: ${count}`;
}

function wordCountPanel(view) {
    let dom = document.createElement("div"),
        left = document.createElement("div"),
        right = document.createElement("div");
    dom.append(left, right);
    left.classList.add("cm-count");
    left.textContent = countWords(view.state.doc);
    right.classList.add("cm-compile");
    right.textContent = "Compiler";
    right.addEventListener("click", () => compile());
    return {
        dom,
        update(update) {
            if (update.docChanged)
                left.textContent = countWords(update.state.doc);
        }
    }
}

const wordCounter = _dist_view_panel_js__WEBPACK_IMPORTED_MODULE_0__/* .showPanel.of */ .mH.of(wordCountPanel);


/***/ }),

/***/ 535:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "q6": () => (/* reexport */ Annotation),
  "n0": () => (/* reexport */ ChangeDesc),
  "as": () => (/* reexport */ ChangeSet),
  "D0": () => (/* reexport */ CharCategory),
  "jT": () => (/* reexport */ EditorSelection),
  "yy": () => (/* reexport */ EditorState),
  "r$": () => (/* reexport */ Facet),
  "gc": () => (/* reexport */ MapMode),
  "Wl": () => (/* reexport */ Prec),
  "Xs": () => (/* reexport */ RangeSet),
  "f_": () => (/* reexport */ RangeSetBuilder),
  "uU": () => (/* reexport */ RangeValue),
  "Py": () => (/* reexport */ StateEffect),
  "QQ": () => (/* reexport */ StateField),
  "xv": () => (/* reexport */ Text),
  "YW": () => (/* reexport */ Transaction),
  "gm": () => (/* reexport */ codePointAt),
  "nZ": () => (/* reexport */ codePointSize),
  "BO": () => (/* reexport */ combineConfig),
  "IS": () => (/* reexport */ countColumn),
  "cp": () => (/* reexport */ findClusterBreak),
  "Gz": () => (/* reexport */ findColumn),
  "bg": () => (/* reexport */ fromCodePoint)
});

// UNUSED EXPORTS: AnnotationType, Compartment, Line, Range, SelectionRange, StateEffectType

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/text.js
/** The data structure for documents. */
class Text {
    // @internal
    constructor() { }
    /** Get the line description around the given position. */
    lineAt(pos) {
        if (pos < 0 || pos > this.length)
            throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
        return this.lineInner(pos, false, 1, 0);
    }
    /** Get the description for the given (1-based) line number. */
    line(n) {
        if (n < 1 || n > this.lines)
            throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
        return this.lineInner(n, true, 1, 0);
    }
    /** Replace a range of the text with the given content. */
    replace(from, to, text) {
        let parts = [];
        this.decompose(0, from, parts, 2 /* To */);
        if (text.length)
            text.decompose(0, text.length, parts, 1 /* From */ | 2 /* To */);
        this.decompose(to, this.length, parts, 1 /* From */);
        return TextNode.from(parts, this.length - (to - from) + text.length);
    }
    /** Append another document to this one. */
    append(other) {
        return this.replace(this.length, this.length, other);
    }
    /** Retrieve the text between the given points. */
    slice(from, to = this.length) {
        let parts = [];
        this.decompose(from, to, parts, 0);
        return TextNode.from(parts, to - from);
    }
    /** Test whether this text is equal to another instance. */
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
    /** Iterate over the text. -1 from end to start */
    iter(dir = 1) { return new RawTextCursor(this, dir); }
    /** Iterate over a range of the text. When `from` > `to`, the iterator will run in reverse. */
    iterRange(from, to = this.length) { return new PartialTextCursor(this, from, to); }
    /**
     * Return a cursor that iterates over the given range of lines, _without_ returning the
     * line breaks between, and yielding empty strings for empty lines.
     * @param [from] line start
     * @param [to] line end
     */
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
    // @internal
    toString() { return this.sliceString(0); }
    /** Convert the document to an array of lines (which can be deserialized again via {@link Text.of}). */
    toJSON() {
        let lines = [];
        this.flatten(lines);
        return lines;
    }
    /** Create a `Text` instance for the given array of lines. */
    static of(text) {
        if (text.length == 0)
            throw new RangeError("A document must have at least one line");
        if (text.length == 1 && !text[0])
            return Text.empty;
        return text.length <= 32 /* Branch */ ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
    }
}
Symbol.iterator;
// Leaves store an array of line strings. There are always line breaks
// between these strings. Leaves are limited in size and have to be
// contained in TextNode instances for bigger documents.
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
        if (open & 1 /* From */) {
            let prev = target.pop();
            let joined = appendText(text.text, prev.text.slice(), 0, text.length);
            if (joined.length <= 32 /* Branch */) {
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
        if (lines.length <= 32 /* Branch */)
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
            if (part.length == 32 /* Branch */) {
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
// Nodes provide the tree structure of the `Text` type. They store a
// number of other nodes or leaves, taking care to balance themselves
// on changes. There are implied line breaks _between_ the children of
// a node (but not before the first or after the last child).
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
                let childOpen = open & ((pos <= from ? 1 /* From */ : 0) | (end >= to ? 2 /* To */ : 0));
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
                // Fast path: if the change only affects one child and the
                // child's size remains in the acceptable range, only update
                // that child
                if (from >= pos && to <= end) {
                    let updated = child.replace(from - pos, to - pos, text);
                    let totalLines = this.lines - child.lines + updated.lines;
                    if (updated.lines < (totalLines >> (5 /* BranchShift */ - 1)) &&
                        updated.lines > (totalLines >> (5 /* BranchShift */ + 1))) {
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
        if (lines < 32 /* Branch */) {
            let flat = [];
            for (let ch of children)
                ch.flatten(flat);
            return new TextLeaf(flat, length);
        }
        let chunk = Math.max(32 /* Branch */, lines >> 5 /* BranchShift */), maxChunk = chunk << 1, minChunk = chunk >> 1;
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
                child.lines + last.lines <= 32 /* Branch */) {
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
                // Move to the next string
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
/** This type describes a line in the document. It is created on-demand when lines are [queried]{@link Text.lineAt}. */
class Line {
    // @internal
    constructor(
    /** The position of the start of the line. */
    from, 
    /** The position at the end of the line (_before_ the line break, or at the end of document for the last line). */
    to, 
    /** This line's line number (1-based). */
    number, 
    /** The line's content. */
    text) {
        this.from = from;
        this.to = to;
        this.number = number;
        this.text = text;
    }
    /** The length of the line (not including any line break after it). */
    get length() { return this.to - this.from; }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/char.js
// http://www.unicode.org/Public/13.0.0/ucd/auxiliary/GraphemeBreakProperty.txt.
// Each pair of elements represents a range, as an offet from the previous range and a length. Numbers are in base-36, with the empty string being a shorthand for 1.
let extend = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map(s => s ? parseInt(s, 36) : 1);
// Convert offsets into absolute values
for (let i = 1; i < extend.length; i++)
    extend[i] += extend[i - 1];
function isExtendingChar(code) {
    for (let i = 1; i < extend.length; i += 2)
        if (extend[i] > code)
            return extend[i - 1] <= code;
    return false;
}
function isRegionalIndicator(code) {
    return code >= 0x1F1E6 && code <= 0x1F1FF;
}
const ZWJ = 0x200d;
/** Returns a next grapheme cluster break _after_ (not equal to) `pos` */
function findClusterBreak(str, pos, forward = true, includeExtending = true) {
    return (forward ? nextClusterBreak : prevClusterBreak)(str, pos, includeExtending);
}
function nextClusterBreak(str, pos, includeExtending) {
    if (pos == str.length)
        return pos;
    // If pos is in the middle of a surrogate pair, move to its start
    if (pos && surrogateLow(str.charCodeAt(pos)) && surrogateHigh(str.charCodeAt(pos - 1)))
        pos--;
    let prev = codePointAt(str, pos);
    pos += codePointSize(prev);
    while (pos < str.length) {
        let next = codePointAt(str, pos);
        if (prev == ZWJ || next == ZWJ || includeExtending && isExtendingChar(next)) {
            pos += codePointSize(next);
            prev = next;
        }
        else if (isRegionalIndicator(next)) {
            let countBefore = 0, i = pos - 2;
            while (i >= 0 && isRegionalIndicator(codePointAt(str, i))) {
                countBefore++;
                i -= 2;
            }
            if (countBefore % 2 == 0)
                break;
            else
                pos += 2;
        }
        else {
            break;
        }
    }
    return pos;
}
function prevClusterBreak(str, pos, includeExtending) {
    while (pos > 0) {
        let found = nextClusterBreak(str, pos - 2, includeExtending);
        if (found < pos)
            return found;
        pos--;
    }
    return 0;
}
function surrogateLow(ch) { return ch >= 0xDC00 && ch < 0xE000; }
function surrogateHigh(ch) { return ch >= 0xD800 && ch < 0xDC00; }
/** Find the code point at the given position in a string (like the [`codePointAt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt) string method). */
function codePointAt(str, pos) {
    let code0 = str.charCodeAt(pos);
    if (!surrogateHigh(code0) || pos + 1 == str.length)
        return code0;
    let code1 = str.charCodeAt(pos + 1);
    if (!surrogateLow(code1))
        return code0;
    return ((code0 - 0xd800) << 10) + (code1 - 0xdc00) + 0x10000;
}
/** Given a Unicode codepoint, return the JavaScript string that respresents it (like [`String.fromCodePoint`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint)). */
function fromCodePoint(code) {
    if (code <= 0xffff)
        return String.fromCharCode(code);
    code -= 0x10000;
    return String.fromCharCode((code >> 10) + 0xd800, (code & 1023) + 0xdc00);
}
/** figure out whether your character takes up 1 or 2 index positions. */
function codePointSize(code) { return code < 0x10000 ? 1 : 2; }

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/change.js

const DefaultSplit = /\r\n?|\n/;
/** Distinguishes different ways in which positions can be mapped. */
var MapMode;
(function (MapMode) {
    // Map a position to a valid new position, even when its context was deleted.
    MapMode[MapMode["Simple"] = 0] = "Simple";
    // Return null if deletion happens across the position.
    MapMode[MapMode["TrackDel"] = 1] = "TrackDel";
    // Return null if the character _before_ the position is deleted.
    MapMode[MapMode["TrackBefore"] = 2] = "TrackBefore";
    // Return null if the character _after_ the position is deleted.
    MapMode[MapMode["TrackAfter"] = 3] = "TrackAfter";
})(MapMode || (MapMode = {}));
/** A change description is a variant of [change set]{@link ChangeSet} that doesn't store the inserted text. As such, it can't be applied, but is cheaper to store and manipulate. */
class ChangeDesc {
    // @internal
    constructor(
    // @internal
    sections) {
        this.sections = sections;
    }
    /** The length of the document before the change. */
    get length() {
        let result = 0;
        for (let i = 0; i < this.sections.length; i += 2)
            result += this.sections[i];
        return result;
    }
    /** The length of the document after the change. */
    get newLength() {
        let result = 0;
        for (let i = 0; i < this.sections.length; i += 2) {
            let ins = this.sections[i + 1];
            result += ins < 0 ? this.sections[i] : ins;
        }
        return result;
    }
    /** False when there are actual changes in this set. */
    get empty() { return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0; }
    /**
     * Iterate over the unchanged parts left by these changes.
     * @param func.posA the position of the range in the old document.
     * @param func.posB the new position in the changed document.
     */
    iterGaps(func) {
        for (let i = 0, posA = 0, posB = 0; i < this.sections.length;) {
            let len = this.sections[i++], ins = this.sections[i++];
            if (ins < 0) {
                func(posA, posB, len);
                posB += len;
            }
            else {
                posB += ins;
            }
            posA += len;
        }
    }
    /** Iterate over the ranges changed by these changes. Addition of {@link iterChanges} */
    iterChangedRanges(f, individual = false) {
        iterChanges(this, f, individual);
    }
    /** Get a description of the inverted form of these changes. */
    get invertedDesc() {
        let sections = [];
        for (let i = 0; i < this.sections.length;) {
            let len = this.sections[i++], ins = this.sections[i++];
            if (ins < 0)
                sections.push(len, ins);
            else
                sections.push(ins, len);
        }
        return new ChangeDesc(sections);
    }
    /** Compute the combined effect of applying another set of changes after this one. The length of the document after this set should match the length before `other`. */
    composeDesc(other) { return this.empty ? other : other.empty ? this : composeSets(this, other); }
    /**
     * Map this description, which should start with the same document
     * as `other`, over another set of changes, so that it can be
     * applied after it.
     * @param other
     * @param before When `before` is true, map as if the changes in `other` happened before the ones in `this`.
     */
    mapDesc(other, before = false) { return other.empty ? this : mapSet(this, other, before); }
    mapPos(pos, assoc = -1, mode = MapMode.Simple) {
        let posA = 0, posB = 0;
        for (let i = 0; i < this.sections.length;) {
            let len = this.sections[i++], ins = this.sections[i++], endA = posA + len;
            if (ins < 0) {
                if (endA > pos)
                    return posB + (pos - posA);
                posB += len;
            }
            else {
                if (mode != MapMode.Simple && endA >= pos &&
                    (mode == MapMode.TrackDel && posA < pos && endA > pos ||
                        mode == MapMode.TrackBefore && posA < pos ||
                        mode == MapMode.TrackAfter && endA > pos))
                    return null;
                if (endA > pos || endA == pos && assoc < 0 && !len)
                    return pos == posA || assoc < 0 ? posB : posB + ins;
                posB += ins;
            }
            posA = endA;
        }
        if (pos > posA)
            throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
        return posB;
    }
    /** Check whether these changes touch a given range. When one of the changes entirely covers the range, the string `"cover"` is returned. */
    touchesRange(from, to = from) {
        for (let i = 0, pos = 0; i < this.sections.length && pos <= to;) {
            let len = this.sections[i++], ins = this.sections[i++], end = pos + len;
            if (ins >= 0 && pos <= to && end >= from)
                return pos < from && end > to ? "cover" : true;
            pos = end;
        }
        return false;
    }
    // @internal
    toString() {
        let result = "";
        for (let i = 0; i < this.sections.length;) {
            let len = this.sections[i++], ins = this.sections[i++];
            result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
        }
        return result;
    }
    /** Serialize this change desc to a JSON-representable value. */
    toJSON() { return this.sections; }
    /** Create a change desc from its JSON representation (as produced by {@link toJSON}. */
    static fromJSON(json) {
        if (!Array.isArray(json) || json.length % 2 || json.some(a => typeof a != "number"))
            throw new RangeError("Invalid JSON representation of ChangeDesc");
        return new ChangeDesc(json);
    }
    // @internal
    static create(sections) { return new ChangeDesc(sections); }
}
/** A change set represents a group of modifications to a document. It stores the document length, and can only be applied to documents with exactly that length. */
class ChangeSet extends ChangeDesc {
    constructor(sections, 
    // @internal
    inserted) {
        super(sections);
        this.inserted = inserted;
    }
    /** Apply the changes to a document, returning the modified document. */
    apply(doc) {
        if (this.length != doc.length)
            throw new RangeError("Applying change set to a document with the wrong length");
        iterChanges(this, (fromA, toA, fromB, _toB, text) => doc = doc.replace(fromB, fromB + (toA - fromA), text), false);
        return doc;
    }
    mapDesc(other, before = false) { return mapSet(this, other, before, true); }
    /**
     * Given the document as it existed _before_ the changes, return a change set that represents the inverse
     * of this set, which could be used to go from the document created by the changes back to the document as
     * it existed before the changes.
     */
    invert(doc) {
        let sections = this.sections.slice(), inserted = [];
        for (let i = 0, pos = 0; i < sections.length; i += 2) {
            let len = sections[i], ins = sections[i + 1];
            if (ins >= 0) {
                sections[i] = ins;
                sections[i + 1] = len;
                let index = i >> 1;
                while (inserted.length < index)
                    inserted.push(Text.empty);
                inserted.push(len ? doc.slice(pos, pos + len) : Text.empty);
            }
            pos += len;
        }
        return new ChangeSet(sections, inserted);
    }
    /**
     * Combine two subsequent change sets into a single set. `other` must start in the document produced by `this`.
     * If `this` goes `docA` → `docB` and `other` represents `docB` → `docC`, the returned value will represent
     * the change `docA` → `docC`.
     */
    compose(other) { return this.empty ? other : other.empty ? this : composeSets(this, other, true); }
    /**
     * Given another change set starting in the same document, maps this change set over the other, producing a
     * new change set that can be applied to the document produced by applying `other`. When `before` is `true`,
     * order changes as if `this` comes before `other`, otherwise (the default) treat `other` as coming first.
     *
     * Given two changes `A` and `B`, `A.compose(B.map(A))` and `B.compose(A.map(B, true))` will produce the same
     * document. This provides a basic form of [operational transformation]
     * (https://en.wikipedia.org/wiki/Operational_transformation),
     * and can be used for collaborative editing.
     */
    map(other, before = false) { return other.empty ? this : mapSet(this, other, before, true); }
    /** Iterate over the changed ranges in the document, calling `func` for each */
    iterChanges(f, individual = false) {
        iterChanges(this, f, individual);
    }
    /** Get a [change description](#state.ChangeDesc) for this change set. */
    get desc() { return ChangeDesc.create(this.sections); }
    // @internal
    filter(ranges) {
        let resultSections = [], resultInserted = [], filteredSections = [];
        let iter = new SectionIter(this);
        done: for (let i = 0, pos = 0;;) {
            let next = i == ranges.length ? 1e9 : ranges[i++];
            while (pos < next || pos == next && iter.len == 0) {
                if (iter.done)
                    break done;
                let len = Math.min(iter.len, next - pos);
                addSection(filteredSections, len, -1);
                let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
                addSection(resultSections, len, ins);
                if (ins > 0)
                    addInsert(resultInserted, resultSections, iter.text);
                iter.forward(len);
                pos += len;
            }
            let end = ranges[i++];
            while (pos < end) {
                if (iter.done)
                    break done;
                let len = Math.min(iter.len, end - pos);
                addSection(resultSections, len, -1);
                addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
                iter.forward(len);
                pos += len;
            }
        }
        return { changes: new ChangeSet(resultSections, resultInserted),
            filtered: ChangeDesc.create(filteredSections) };
    }
    /** Serialize this change set to a JSON-representable value. */
    toJSON() {
        let parts = [];
        for (let i = 0; i < this.sections.length; i += 2) {
            let len = this.sections[i], ins = this.sections[i + 1];
            if (ins < 0)
                parts.push(len);
            else if (ins == 0)
                parts.push([len]);
            else
                parts.push([len].concat(this.inserted[i >> 1].toJSON()));
        }
        return parts;
    }
    /** Create a change set for the given changes, for a document of the given length, using `lineSep` as line separator. */
    static of(changes, length, lineSep) {
        let sections = [], inserted = [], pos = 0;
        let total = null;
        function flush(force = false) {
            if (!force && !sections.length)
                return;
            if (pos < length)
                addSection(sections, length - pos, -1);
            let set = new ChangeSet(sections, inserted);
            total = total ? total.compose(set.map(total)) : set;
            sections = [];
            inserted = [];
            pos = 0;
        }
        function process(spec) {
            if (Array.isArray(spec)) {
                for (let sub of spec)
                    process(sub);
            }
            else if (spec instanceof ChangeSet) {
                if (spec.length != length)
                    throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
                flush();
                total = total ? total.compose(spec.map(total)) : spec;
            }
            else {
                let { from, to = from, insert } = spec;
                if (from > to || from < 0 || to > length)
                    throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);
                let insText = !insert ? Text.empty : typeof insert == "string" ? Text.of(insert.split(lineSep || DefaultSplit)) : insert;
                let insLen = insText.length;
                if (from == to && insLen == 0)
                    return;
                if (from < pos)
                    flush();
                if (from > pos)
                    addSection(sections, from - pos, -1);
                addSection(sections, to - from, insLen);
                addInsert(inserted, sections, insText);
                pos = to;
            }
        }
        process(changes);
        flush(!total);
        return total;
    }
    /** Create an empty changeset of the given length. */
    static empty(length) {
        return new ChangeSet(length ? [length, -1] : [], []);
    }
    /** Create a changeset from its JSON representation (as produced by [`toJSON`]{@link ChangeSet.toJSON}. */
    static fromJSON(json) {
        if (!Array.isArray(json))
            throw new RangeError("Invalid JSON representation of ChangeSet");
        let sections = [], inserted = [];
        for (let i = 0; i < json.length; i++) {
            let part = json[i];
            if (typeof part == "number") {
                sections.push(part, -1);
            }
            else if (!Array.isArray(part) || typeof part[0] != "number" || part.some((e, i) => i && typeof e != "string")) {
                throw new RangeError("Invalid JSON representation of ChangeSet");
            }
            else if (part.length == 1) {
                sections.push(part[0], 0);
            }
            else {
                while (inserted.length < i)
                    inserted.push(Text.empty);
                inserted[i] = Text.of(part.slice(1));
                sections.push(part[0], inserted[i].length);
            }
        }
        return new ChangeSet(sections, inserted);
    }
    // @internal
    static createSet(sections, inserted) {
        return new ChangeSet(sections, inserted);
    }
}
function addSection(sections, len, ins, forceJoin = false) {
    if (len == 0 && ins <= 0)
        return;
    let last = sections.length - 2;
    if (last >= 0 && ins <= 0 && ins == sections[last + 1])
        sections[last] += len;
    else if (len == 0 && sections[last] == 0)
        sections[last + 1] += ins;
    else if (forceJoin) {
        sections[last] += len;
        sections[last + 1] += ins;
    }
    else
        sections.push(len, ins);
}
function addInsert(values, sections, value) {
    if (value.length == 0)
        return;
    let index = (sections.length - 2) >> 1;
    if (index < values.length) {
        values[values.length - 1] = values[values.length - 1].append(value);
    }
    else {
        while (values.length < index)
            values.push(Text.empty);
        values.push(value);
    }
}
function iterChanges(desc, f, individual) {
    let inserted = desc.inserted;
    for (let posA = 0, posB = 0, i = 0; i < desc.sections.length;) {
        let len = desc.sections[i++], ins = desc.sections[i++];
        if (ins < 0) {
            posA += len;
            posB += len;
        }
        else {
            let endA = posA, endB = posB, text = Text.empty;
            for (;;) {
                endA += len;
                endB += ins;
                if (ins && inserted)
                    text = text.append(inserted[(i - 2) >> 1]);
                if (individual || i == desc.sections.length || desc.sections[i + 1] < 0)
                    break;
                len = desc.sections[i++];
                ins = desc.sections[i++];
            }
            f(posA, endA, posB, endB, text);
            posA = endA;
            posB = endB;
        }
    }
}
function mapSet(setA, setB, before, mkSet = false) {
    let sections = [], insert = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let posA = 0, posB = 0;;) {
        if (a.ins == -1) {
            posA += a.len;
            a.next();
        }
        else if (b.ins == -1 && posB < posA) {
            let skip = Math.min(b.len, posA - posB);
            b.forward(skip);
            addSection(sections, skip, -1);
            posB += skip;
        }
        else if (b.ins >= 0 && (a.done || posB < posA || posB == posA && (b.len < a.len || b.len == a.len && !before))) {
            addSection(sections, b.ins, -1);
            while (posA > posB && !a.done && posA + a.len < posB + b.len) {
                posA += a.len;
                a.next();
            }
            posB += b.len;
            b.next();
        }
        else if (a.ins >= 0) {
            let len = 0, end = posA + a.len;
            for (;;) {
                if (b.ins >= 0 && posB > posA && posB + b.len < end) {
                    len += b.ins;
                    posB += b.len;
                    b.next();
                }
                else if (b.ins == -1 && posB < end) {
                    let skip = Math.min(b.len, end - posB);
                    len += skip;
                    b.forward(skip);
                    posB += skip;
                }
                else {
                    break;
                }
            }
            addSection(sections, len, a.ins);
            if (insert)
                addInsert(insert, sections, a.text);
            posA = end;
            a.next();
        }
        else if (a.done && b.done) {
            return insert ? ChangeSet.createSet(sections, insert) : ChangeDesc.create(sections);
        }
        else {
            throw new Error("Mismatched change set lengths");
        }
    }
}
function composeSets(setA, setB, mkSet = false) {
    let sections = [];
    let insert = mkSet ? [] : null;
    let a = new SectionIter(setA), b = new SectionIter(setB);
    for (let open = false;;) {
        if (a.done && b.done) {
            return insert ? ChangeSet.createSet(sections, insert) : ChangeDesc.create(sections);
        }
        else if (a.ins == 0) { // Deletion in A
            addSection(sections, a.len, 0, open);
            a.next();
        }
        else if (b.len == 0 && !b.done) { // Insertion in B
            addSection(sections, 0, b.ins, open);
            if (insert)
                addInsert(insert, sections, b.text);
            b.next();
        }
        else if (a.done || b.done) {
            throw new Error("Mismatched change set lengths");
        }
        else {
            let len = Math.min(a.len2, b.len), sectionLen = sections.length;
            if (a.ins == -1) {
                let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins;
                addSection(sections, len, insB, open);
                if (insert && insB)
                    addInsert(insert, sections, b.text);
            }
            else if (b.ins == -1) {
                addSection(sections, a.off ? 0 : a.len, len, open);
                if (insert)
                    addInsert(insert, sections, a.textBit(len));
            }
            else {
                addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open);
                if (insert && !b.off)
                    addInsert(insert, sections, b.text);
            }
            open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen);
            a.forward2(len);
            b.forward(len);
        }
    }
}
class SectionIter {
    constructor(set) {
        this.set = set;
        this.i = 0;
        this.next();
    }
    next() {
        let { sections } = this.set;
        if (this.i < sections.length) {
            this.len = sections[this.i++];
            this.ins = sections[this.i++];
        }
        else {
            this.len = 0;
            this.ins = -2;
        }
        this.off = 0;
    }
    get done() { return this.ins == -2; }
    get len2() { return this.ins < 0 ? this.len : this.ins; }
    get text() {
        let { inserted } = this.set, index = (this.i - 2) >> 1;
        return index >= inserted.length ? Text.empty : inserted[index];
    }
    textBit(len) {
        let { inserted } = this.set, index = (this.i - 2) >> 1;
        return index >= inserted.length && !len ? Text.empty
            : inserted[index].slice(this.off, len == null ? undefined : this.off + len);
    }
    forward(len) {
        if (len == this.len)
            this.next();
        else {
            this.len -= len;
            this.off += len;
        }
    }
    forward2(len) {
        if (this.ins == -1)
            this.forward(len);
        else if (len == this.ins)
            this.next();
        else {
            this.ins -= len;
            this.off += len;
        }
    }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/selection.js
/**
 * A single selection range. When {@link allowMultipleSelections} is enabled, a [selection]{@link EditorSelection}
 * may hold multiple ranges. By default, selections hold exactly one range.
 */
class SelectionRange {
    constructor(
    /** The lower boundary of the range. */
    from, 
    /** The upper boundary of the range. */
    to, flags) {
        this.from = from;
        this.to = to;
        this.flags = flags;
    }
    /** The anchor of the range—the side that doesn't move when you extend it. */
    get anchor() { return this.flags & 16 /* Inverted */ ? this.to : this.from; }
    /** The head of the range, which is moved when the range is [extended]{@link SelectionRange.extend}. */
    get head() { return this.flags & 16 /* Inverted */ ? this.from : this.to; }
    /** True when `anchor` and `head` are at the same position. */
    get empty() { return this.from == this.to; }
    /**
     * If this is a cursor that is explicitly associated with the character on one of its sides, this
     * returns the side. -1 means the character before its position, 1 the character after, and 0 means
     * no association.
     */
    get assoc() { return this.flags & 4 /* AssocBefore */ ? -1 : this.flags & 8 /* AssocAfter */ ? 1 : 0; }
    /** The bidirectional text level associated with this cursor, if any. */
    get bidiLevel() {
        let level = this.flags & 3 /* BidiLevelMask */;
        return level == 3 ? null : level;
    }
    /**
     * The goal column (stored vertical offset) associated with a cursor. This is used to preserve the
     * vertical position when [moving]{@link EditorView.moveVertically} across lines of different length.
     */
    get goalColumn() {
        let value = this.flags >> 5 /* GoalColumnOffset */;
        return value == 33554431 /* NoGoalColumn */ ? undefined : value;
    }
    /** Map this range through a change, producing a valid range in the updated document. */
    map(change, assoc = -1) {
        let from, to;
        if (this.empty) {
            from = to = change.mapPos(this.from, assoc);
        }
        else {
            from = change.mapPos(this.from, 1);
            to = change.mapPos(this.to, -1);
        }
        return from == this.from && to == this.to ? this : new SelectionRange(from, to, this.flags);
    }
    /** Extend this range to cover at least `from` to `to`. */
    extend(from, to = from) {
        if (from <= this.anchor && to >= this.anchor)
            return EditorSelection.range(from, to);
        let head = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
        return EditorSelection.range(this.anchor, head);
    }
    /** Compare this range to another range. */
    eq(other) {
        return this.anchor == other.anchor && this.head == other.head;
    }
    /** Return a JSON-serializable object representing the range. */
    toJSON() { return { anchor: this.anchor, head: this.head }; }
    /** Convert a JSON representation of a range to a `SelectionRange` instance. */
    static fromJSON(json) {
        if (!json || typeof json.anchor != "number" || typeof json.head != "number")
            throw new RangeError("Invalid JSON representation for SelectionRange");
        return EditorSelection.range(json.anchor, json.head);
    }
    // @internal
    static create(from, to, flags) {
        return new SelectionRange(from, to, flags);
    }
}
/** An editor selection holds one or more selection ranges. */
class EditorSelection {
    constructor(
    /** The ranges in the selection, sorted by position. Ranges cannot overlap (but they may touch, if they aren't empty). */
    ranges, 
    /** The index of the _main_ range in the selection (which is usually the range that was added last). */
    mainIndex) {
        this.ranges = ranges;
        this.mainIndex = mainIndex;
    }
    /** Map a selection through a change. Used to adjust the selection position for changes. */
    map(change, assoc = -1) {
        if (change.empty)
            return this;
        return EditorSelection.create(this.ranges.map(r => r.map(change, assoc)), this.mainIndex);
    }
    /** Compare this selection to another selection. */
    eq(other) {
        if (this.ranges.length != other.ranges.length ||
            this.mainIndex != other.mainIndex)
            return false;
        for (let i = 0; i < this.ranges.length; i++)
            if (!this.ranges[i].eq(other.ranges[i]))
                return false;
        return true;
    }
    /**
     * Get the primary selection range. Usually, you should make sure your code applies to _all_ ranges,
     * by using methods like [`changeByRange`]{@link EditorState.changeByRange}.
     */
    get main() { return this.ranges[this.mainIndex]; }
    /** Make sure the selection only has one range. Returns a selection holding only the main range from this selection. */
    asSingle() {
        return this.ranges.length == 1 ? this : new EditorSelection([this.main], 0);
    }
    /** Extend this selection with an extra range. */
    addRange(range, main = true) {
        return EditorSelection.create([range].concat(this.ranges), main ? 0 : this.mainIndex + 1);
    }
    /** Replace a given range with another range, and then normalize the selection to merge and sort ranges if necessary. */
    replaceRange(range, which = this.mainIndex) {
        let ranges = this.ranges.slice();
        ranges[which] = range;
        return EditorSelection.create(ranges, this.mainIndex);
    }
    /** Convert this selection to an object that can be serialized to JSON. */
    toJSON() {
        return { ranges: this.ranges.map(r => r.toJSON()), main: this.mainIndex };
    }
    /** Create a selection from a JSON representation. */
    static fromJSON(json) {
        if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
            throw new RangeError("Invalid JSON representation for EditorSelection");
        return new EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
    }
    /** Create a selection holding a single range. */
    static single(anchor, head = anchor) {
        return new EditorSelection([EditorSelection.range(anchor, head)], 0);
    }
    /** Sort and merge the given set of ranges, creating a valid selection. */
    static create(ranges, mainIndex = 0) {
        if (ranges.length == 0)
            throw new RangeError("A selection needs at least one range");
        for (let pos = 0, i = 0; i < ranges.length; i++) {
            let range = ranges[i];
            if (range.empty ? range.from <= pos : range.from < pos)
                return EditorSelection.normalized(ranges.slice(), mainIndex);
            pos = range.to;
        }
        return new EditorSelection(ranges, mainIndex);
    }
    /** Create a cursor selection range at the given position. You can safely ignore the optional arguments in most situations. */
    static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
        return SelectionRange.create(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 4 /* AssocBefore */ : 8 /* AssocAfter */) |
            (bidiLevel == null ? 3 : Math.min(2, bidiLevel)) |
            ((goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431 /* NoGoalColumn */) << 5 /* GoalColumnOffset */));
    }
    /** Create a selection range. */
    static range(anchor, head, goalColumn) {
        let goal = (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431 /* NoGoalColumn */) << 5 /* GoalColumnOffset */;
        return head < anchor ? SelectionRange.create(head, anchor, 16 /* Inverted */ | goal | 8 /* AssocAfter */)
            : SelectionRange.create(anchor, head, goal | (head > anchor ? 4 /* AssocBefore */ : 0));
    }
    // @internal
    static normalized(ranges, mainIndex = 0) {
        let main = ranges[mainIndex];
        ranges.sort((a, b) => a.from - b.from);
        mainIndex = ranges.indexOf(main);
        for (let i = 1; i < ranges.length; i++) {
            let range = ranges[i], prev = ranges[i - 1];
            if (range.empty ? range.from <= prev.to : range.from < prev.to) {
                let from = prev.from, to = Math.max(range.to, prev.to);
                if (i <= mainIndex)
                    mainIndex--;
                ranges.splice(--i, 2, range.anchor > range.head ? EditorSelection.range(to, from) : EditorSelection.range(from, to));
            }
        }
        return new EditorSelection(ranges, mainIndex);
    }
}
function checkSelection(selection, docLength) {
    for (let range of selection.ranges)
        if (range.to > docLength)
            throw new RangeError("Selection points outside of document");
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/facet.js
let nextID = 0;
class Facet {
    constructor(
    // @internal
    combine, 
    // @internal
    compareInput, 
    // @internal
    compare, isStatic, 
    // @internal
    extensions) {
        this.combine = combine;
        this.compareInput = compareInput;
        this.compare = compare;
        this.isStatic = isStatic;
        this.extensions = extensions;
        // @internal
        this.id = nextID++;
        this.default = combine([]);
    }
    /** Define a new facet. */
    static define(config = {}) {
        return new Facet(config.combine || ((a) => a), config.compareInput || ((a, b) => a === b), config.compare || (!config.combine ? sameArray : (a, b) => a === b), !!config.static, config.enables);
    }
    /** Returns an extension that adds the given value to this facet. */
    of(value) {
        return new FacetProvider([], this, 0 /* Static */, value);
    }
    /**
     * Create an extension that computes a value for the facet from a state. You must take care to
     * declare the parts of the state that this value depends on, since your function is only called
     * again for a new state when one of those parts changed.
     *
     * In cases where your value depends only on a single field, you'll want to use the
     * [`from`]{@link Facet.from} method instead.
     */
    compute(deps, get) {
        if (this.isStatic)
            throw new Error("Can't compute a static facet");
        return new FacetProvider(deps, this, 1 /* Single */, get);
    }
    /** Create an extension that computes zero or more values for this facet from a state. */
    computeN(deps, get) {
        if (this.isStatic)
            throw new Error("Can't compute a static facet");
        return new FacetProvider(deps, this, 2 /* Multi */, get);
    }
    from(field, get) {
        if (!get)
            get = x => x;
        return this.compute([field], state => get(state.field(field)));
    }
}
function sameArray(a, b) {
    return a == b || a.length == b.length && a.every((e, i) => e === b[i]);
}
class FacetProvider {
    constructor(dependencies, facet, type, value) {
        this.dependencies = dependencies;
        this.facet = facet;
        this.type = type;
        this.value = value;
        this.id = nextID++;
    }
    dynamicSlot(addresses) {
        var _a;
        let getter = this.value;
        let compare = this.facet.compareInput;
        let id = this.id, idx = addresses[id] >> 1, multi = this.type == 2 /* Multi */;
        let depDoc = false, depSel = false, depAddrs = [];
        for (let dep of this.dependencies) {
            if (dep == "doc")
                depDoc = true;
            else if (dep == "selection")
                depSel = true;
            else if ((((_a = addresses[dep.id]) !== null && _a !== void 0 ? _a : 1) & 1) == 0)
                depAddrs.push(addresses[dep.id]);
        }
        return {
            create(state) {
                state.values[idx] = getter(state);
                return 1 /* Changed */;
            },
            update(state, tr) {
                if ((depDoc && tr.docChanged) || (depSel && (tr.docChanged || tr.selection)) || ensureAll(state, depAddrs)) {
                    let newVal = getter(state);
                    if (multi ? !compareArray(newVal, state.values[idx], compare) : !compare(newVal, state.values[idx])) {
                        state.values[idx] = newVal;
                        return 1 /* Changed */;
                    }
                }
                return 0;
            },
            reconfigure: (state, oldState) => {
                let newVal = getter(state);
                let oldAddr = oldState.config.address[id];
                if (oldAddr != null) {
                    let oldVal = getAddr(oldState, oldAddr);
                    if (this.dependencies.every(dep => {
                        return dep instanceof Facet ? oldState.facet(dep) === state.facet(dep) :
                            dep instanceof StateField ? oldState.field(dep, false) == state.field(dep, false) : true;
                    }) || (multi ? compareArray(newVal, oldVal, compare) : compare(newVal, oldVal))) {
                        state.values[idx] = oldVal;
                        return 0;
                    }
                }
                state.values[idx] = newVal;
                return 1 /* Changed */;
            }
        };
    }
}
function compareArray(a, b, compare) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (!compare(a[i], b[i]))
            return false;
    return true;
}
function ensureAll(state, addrs) {
    let changed = false;
    for (let addr of addrs)
        if (ensureAddr(state, addr) & 1 /* Changed */)
            changed = true;
    return changed;
}
function dynamicFacetSlot(addresses, facet, providers) {
    let providerAddrs = providers.map(p => addresses[p.id]);
    let providerTypes = providers.map(p => p.type);
    let dynamic = providerAddrs.filter(p => !(p & 1));
    let idx = addresses[facet.id] >> 1;
    function get(state) {
        let values = [];
        for (let i = 0; i < providerAddrs.length; i++) {
            let value = getAddr(state, providerAddrs[i]);
            if (providerTypes[i] == 2 /* Multi */)
                for (let val of value)
                    values.push(val);
            else
                values.push(value);
        }
        return facet.combine(values);
    }
    return {
        create(state) {
            for (let addr of providerAddrs)
                ensureAddr(state, addr);
            state.values[idx] = get(state);
            return 1 /* Changed */;
        },
        update(state, tr) {
            if (!ensureAll(state, dynamic))
                return 0;
            let value = get(state);
            if (facet.compare(value, state.values[idx]))
                return 0;
            state.values[idx] = value;
            return 1 /* Changed */;
        },
        reconfigure(state, oldState) {
            let depChanged = ensureAll(state, providerAddrs);
            let oldProviders = oldState.config.facets[facet.id], oldValue = oldState.facet(facet);
            if (oldProviders && !depChanged && sameArray(providers, oldProviders)) {
                state.values[idx] = oldValue;
                return 0;
            }
            let value = get(state);
            if (facet.compare(value, oldValue)) {
                state.values[idx] = oldValue;
                return 0;
            }
            state.values[idx] = value;
            return 1 /* Changed */;
        }
    };
}
const initField = Facet.define({ static: true });
/** Fields can store additional information in an editor state, and keep it in sync with the rest of the state. */
class StateField {
    constructor(
    // @internal
    id, createF, updateF, compareF, 
    // @internal
    spec) {
        this.id = id;
        this.createF = createF;
        this.updateF = updateF;
        this.compareF = compareF;
        this.spec = spec;
        // @internal
        this.provides = undefined;
    }
    /** Define a state field. */
    static define(config) {
        let field = new StateField(nextID++, config.create, config.update, config.compare || ((a, b) => a === b), config);
        if (config.provide)
            field.provides = config.provide(field);
        return field;
    }
    create(state) {
        let init = state.facet(initField).find(i => i.field == this);
        return ((init === null || init === void 0 ? void 0 : init.create) || this.createF)(state);
    }
    // @internal
    slot(addresses) {
        let idx = addresses[this.id] >> 1;
        return {
            create: (state) => {
                state.values[idx] = this.create(state);
                return 1 /* Changed */;
            },
            update: (state, tr) => {
                let oldVal = state.values[idx];
                let value = this.updateF(oldVal, tr);
                if (this.compareF(oldVal, value))
                    return 0;
                state.values[idx] = value;
                return 1 /* Changed */;
            },
            reconfigure: (state, oldState) => {
                if (oldState.config.address[this.id] != null) {
                    state.values[idx] = oldState.field(this);
                    return 0;
                }
                state.values[idx] = this.create(state);
                return 1 /* Changed */;
            }
        };
    }
    /**
     * Returns an extension that enables this field and overrides the way it is initialized.
     * Can be useful when you need to provide a non-default starting value for the field.
     */
    init(create) {
        return [this, initField.of({ field: this, create })];
    }
    /** State field instances can be used as {@link Extension} values to enable the field in a given state. */
    get extension() { return this; }
}
const Prec_ = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function prec(value) {
    return (ext) => new PrecExtension(ext, value);
}
/**
 * By default extensions are registered in the order they are found in the flattened form of
 * nested array that was provided. Individual extension values can be assigned a precedence to
 * override this. Extensions that do not have a precedence set get the precedence of the nearest
 * parent with a precedence, or [`default`]{@link Prec.default} if there is no such parent. The
 * final ordering of extensions is determined by first sorting by precedence and then by order
 * within each precedence.
 */
const Prec = {
    /** The highest precedence level, for extensions that should end up near the start of the precedence ordering. */
    highest: prec(Prec_.highest),
    /** A higher-than-default precedence, for extensions that should come before those with default precedence. */
    high: prec(Prec_.high),
    /** The default precedence, which is also used for extensions without an explicit precedence. */
    default: prec(Prec_.default),
    /** A lower-than-default precedence. */
    low: prec(Prec_.low),
    /** The lowest precedence level. Meant for things that should end up near the end of the extension order. */
    lowest: prec(Prec_.lowest)
};
class PrecExtension {
    constructor(inner, prec) {
        this.inner = inner;
        this.prec = prec;
    }
}
/**
 * Extension compartments can be used to make a configuration dynamic. By [wrapping]{@link Compartment.of}
 * part of your configuration in a compartment, you can later [replace]{@link Compartment.reconfigure} that
 * part through a transaction.
 */
class Compartment {
    /** Create an instance of this compartment to add to your [state configuration]{@link EditorStateConfig.extensions}. */
    of(ext) { return new CompartmentInstance(this, ext); }
    /** Create an [effect](#state.TransactionSpec.effects) that reconfigures this compartment. */
    reconfigure(content) {
        return Compartment.reconfigure.of({ compartment: this, extension: content });
    }
    /** Get the current content of the compartment in the state, or `undefined` if it isn't present. */
    get(state) {
        return state.config.compartments.get(this);
    }
}
class CompartmentInstance {
    constructor(compartment, inner) {
        this.compartment = compartment;
        this.inner = inner;
    }
}
class Configuration {
    constructor(base, compartments, dynamicSlots, address, staticValues, facets) {
        this.base = base;
        this.compartments = compartments;
        this.dynamicSlots = dynamicSlots;
        this.address = address;
        this.staticValues = staticValues;
        this.facets = facets;
        this.statusTemplate = [];
        while (this.statusTemplate.length < dynamicSlots.length)
            this.statusTemplate.push(0 /* Unresolved */);
    }
    staticFacet(facet) {
        let addr = this.address[facet.id];
        return addr == null ? facet.default : this.staticValues[addr >> 1];
    }
    static resolve(base, compartments, oldState) {
        let fields = [];
        let facets = Object.create(null);
        let newCompartments = new Map();
        for (let ext of flatten(base, compartments, newCompartments)) {
            if (ext instanceof StateField)
                fields.push(ext);
            else
                (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
        }
        let address = Object.create(null);
        let staticValues = [];
        let dynamicSlots = [];
        for (let field of fields) {
            address[field.id] = dynamicSlots.length << 1;
            dynamicSlots.push(a => field.slot(a));
        }
        let oldFacets = oldState === null || oldState === void 0 ? void 0 : oldState.config.facets;
        for (let id in facets) {
            let providers = facets[id], facet = providers[0].facet;
            let oldProviders = oldFacets && oldFacets[id] || [];
            if (providers.every(p => p.type == 0 /* Static */)) {
                address[facet.id] = (staticValues.length << 1) | 1;
                if (sameArray(oldProviders, providers)) {
                    staticValues.push(oldState.facet(facet));
                }
                else {
                    let value = facet.combine(providers.map(p => p.value));
                    staticValues.push(oldState && facet.compare(value, oldState.facet(facet)) ? oldState.facet(facet) : value);
                }
            }
            else {
                for (let p of providers) {
                    if (p.type == 0 /* Static */) {
                        address[p.id] = (staticValues.length << 1) | 1;
                        staticValues.push(p.value);
                    }
                    else {
                        address[p.id] = dynamicSlots.length << 1;
                        dynamicSlots.push(a => p.dynamicSlot(a));
                    }
                }
                address[facet.id] = dynamicSlots.length << 1;
                dynamicSlots.push(a => dynamicFacetSlot(a, facet, providers));
            }
        }
        let dynamic = dynamicSlots.map(f => f(address));
        return new Configuration(base, newCompartments, dynamic, address, staticValues, facets);
    }
}
function flatten(extension, compartments, newCompartments) {
    let result = [[], [], [], [], []];
    let seen = new Map();
    function inner(ext, prec) {
        let known = seen.get(ext);
        if (known != null) {
            if (known <= prec)
                return;
            let found = result[known].indexOf(ext);
            if (found > -1)
                result[known].splice(found, 1);
            if (ext instanceof CompartmentInstance)
                newCompartments.delete(ext.compartment);
        }
        seen.set(ext, prec);
        if (Array.isArray(ext)) {
            for (let e of ext)
                inner(e, prec);
        }
        else if (ext instanceof CompartmentInstance) {
            if (newCompartments.has(ext.compartment))
                throw new RangeError(`Duplicate use of compartment in extensions`);
            let content = compartments.get(ext.compartment) || ext.inner;
            newCompartments.set(ext.compartment, content);
            inner(content, prec);
        }
        else if (ext instanceof PrecExtension) {
            inner(ext.inner, ext.prec);
        }
        else if (ext instanceof StateField) {
            result[prec].push(ext);
            if (ext.provides)
                inner(ext.provides, prec);
        }
        else if (ext instanceof FacetProvider) {
            result[prec].push(ext);
            if (ext.facet.extensions)
                inner(ext.facet.extensions, prec);
        }
        else {
            let content = ext.extension;
            if (!content)
                throw new Error(`Unrecognized extension value in extension set (${ext}). This sometimes happens because multiple instances of state module are loaded, breaking instanceof checks.`);
            inner(content, prec);
        }
    }
    inner(extension, Prec_.default);
    return result.reduce((a, b) => a.concat(b));
}
function ensureAddr(state, addr) {
    if (addr & 1)
        return 2 /* Computed */;
    let idx = addr >> 1;
    let status = state.status[idx];
    if (status == 4 /* Computing */)
        throw new Error("Cyclic dependency between fields and/or facets");
    if (status & 2 /* Computed */)
        return status;
    state.status[idx] = 4 /* Computing */;
    let changed = state.computeSlot(state, state.config.dynamicSlots[idx]);
    return state.status[idx] = 2 /* Computed */ | changed;
}
function getAddr(state, addr) {
    return addr & 1 ? state.config.staticValues[addr >> 1] : state.values[addr >> 1];
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/extension.js

const languageData = Facet.define();
const allowMultipleSelections = Facet.define({
    combine: values => values.some(v => v),
    static: true
});
const lineSeparator = Facet.define({
    combine: values => values.length ? values[0] : undefined,
    static: true
});
const changeFilter = Facet.define();
const transactionFilter = Facet.define();
const transactionExtender = Facet.define();
const readOnly = Facet.define({
    combine: values => values.length ? values[0] : false
});

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/transaction.js



/**
 * Annotations are tagged values that are used to add metadata to transactions in an
 * extensible way. They should be used to model things that effect the entire transaction
 * (such as its [time stamp]{@link Transaction.time} or information about its
 * [origin]{@link Transaction.userEvent}). For effects that happen _alongside_ the other
 * changes made by the transaction, [state effects]{@link StateEffect} are more appropriate.
 */
class Annotation {
    // @internal
    constructor(
    /** The annotation type. */
    type, 
    /** The value of this annotation. */
    value) {
        this.type = type;
        this.value = value;
    }
    /** Define a new type of annotation. */
    static define() { return new AnnotationType(); }
}
/** Marker that identifies a type of [annotation]{@link Annotation}. */
class AnnotationType {
    /** Create an instance of this annotation. */
    of(value) { return new Annotation(this, value); }
}
/** Representation of a type of state effect. Defined with {@link StateEffect.define}. */
class StateEffectType {
    // @internal
    constructor(
    // The `any` types in these function types are there to work
    // around TypeScript issue #37631, where the type guard on
    // `StateEffect.is` mysteriously stops working when these properly
    // have type `Value`.
    // @internal
    map) {
        this.map = map;
    }
    /** Create a [state effect](#state.StateEffect) instance of this type. */
    of(value) { return new StateEffect(this, value); }
}
/**
 * State effects can be used to represent additional effects associated with a
 * [transaction]{@link Transaction.effects}. They are often useful to model changes
 * to custom [state fields]{@link StateField}, when those changes aren't implicit
 * in document or selection changes.
 */
class StateEffect {
    // @internal
    constructor(
    // @internal
    type, 
    /** The value of this effect. */
    value) {
        this.type = type;
        this.value = value;
    }
    /** Map this effect through a position mapping. Will return `undefined` when that ends up deleting the effect. */
    map(mapping) {
        let mapped = this.type.map(this.value, mapping);
        return mapped === undefined ? undefined : mapped == this.value ? this : new StateEffect(this.type, mapped);
    }
    /** Tells you whether this effect object is of a given [type]{@link StateEffectType}. */
    is(type) { return this.type == type; }
    /** Define a new effect type. The type parameter indicates the type of values that his effect holds. */
    static define(spec = {}) {
        return new StateEffectType(spec.map || (v => v));
    }
    /** Map an array of effects through a change set. */
    static mapEffects(effects, mapping) {
        if (!effects.length)
            return effects;
        let result = [];
        for (let effect of effects) {
            let mapped = effect.map(mapping);
            if (mapped)
                result.push(mapped);
        }
        return result;
    }
}
/**
 * This effect can be used to reconfigure the root extensions of the editor. Doing
 * this will discard any extensions [appended]{@link StateEffect.appendConfig}, but
 * does not reset the content of [reconfigured]{@link Compartment.reconfigure}
 * compartments.
 */
StateEffect.reconfigure = StateEffect.define();
/** Append extensions to the top-level configuration of the editor. */
StateEffect.appendConfig = StateEffect.define();
/**
 * Changes to the editor state are grouped into transactions.
 * Typically, a user action creates a single transaction, which may
 * contain any number of document changes, may change the selection,
 * or have other effects. Create a transaction by calling
 * {@link EditorState.update}, or immediately dispatch one by calling
 * {@link EditorView.dispatch}.
 */
class Transaction {
    /**
     * @param startState The state from which the transaction starts.
     * @param changes The document changes made by this transaction.
     * @param selection The selection set by this transaction, or undefined if it doesn't explicitly set a selection.
     * @param effects The effects added to the transaction.
     * @param annotations
     * @param scrollIntoView Whether the selection should be scrolled into view after this transaction is dispatched.
     */
    constructor(startState, changes, selection, effects, 
    // @internal
    annotations, scrollIntoView) {
        this.startState = startState;
        this.changes = changes;
        this.selection = selection;
        this.effects = effects;
        this.annotations = annotations;
        this.scrollIntoView = scrollIntoView;
        // @internal
        this._doc = null;
        // @internal
        this._state = null;
        if (selection)
            checkSelection(selection, changes.newLength);
        if (!annotations.some((a) => a.type == Transaction.time))
            this.annotations = annotations.concat(Transaction.time.of(Date.now()));
    }
    // @internal
    static create(startState, changes, selection, effects, annotations, scrollIntoView) {
        return new Transaction(startState, changes, selection, effects, annotations, scrollIntoView);
    }
    /**
     * The new document produced by the transaction. Contrary to [`.state`]{@link Transaction.state}`.doc`,
     * accessing this won't force the entire new state to be computed right away, so it is recommended that
     * [transaction filters]{@link EditorState.transactionFilter} use this getter when they need to look at
     * the new document.
     */
    get newDoc() {
        return this._doc || (this._doc = this.changes.apply(this.startState.doc));
    }
    /**
     * The new selection produced by the transaction. If [`this.selection`]{@link Transaction.selection}
     * is undefined, this will [map]{@link EditorSelection.map} the start state's current selection
     * through the changes made by the transaction.
     */
    get newSelection() {
        return this.selection || this.startState.selection.map(this.changes);
    }
    /**
     * The new state created by the transaction. Computed on demand (but retained for subsequent
     * access), so it is recommended not to access it in [transaction filters]{@link transactionFilter}
     * when possible.
     */
    get state() {
        if (!this._state)
            this.startState.applyTransaction(this);
        return this._state;
    }
    /** Get the value of the given annotation type, if any. */
    annotation(type) {
        for (let ann of this.annotations)
            if (ann.type == type)
                return ann.value;
        return undefined;
    }
    /** Indicates whether the transaction changed the document. */
    get docChanged() { return !this.changes.empty; }
    /**
     * Indicates whether this transaction reconfigures the state (through a
     * [configuration compartment]{@link Compartment} or with a top-level configuration
     * [effect]{@link StateEffect.reconfigure}.
     */
    get reconfigured() { return this.startState.config != this.state.config; }
    /**
     * Returns true if the transaction has a [user event]{@link Transaction.userEvent} annotation
     * that is equal to or more specific than `event`. For example, if the transaction has
     * `"select.pointer"` as user event, `"select"` and `"select.pointer"` will match it.
     */
    isUserEvent(event) {
        let e = this.annotation(Transaction.userEvent);
        return !!(e && (e == event || e.length > event.length && e.slice(0, event.length) == event && e[event.length] == "."));
    }
}
/** Annotation used to store transaction timestamps. Automatically added to every transaction, holding `Date.now()`. */
Transaction.time = Annotation.define();
/**
 * Annotation used to associate a transaction with a user interface event. Holds a string
 * identifying the event, using a dot-separated format to support attaching more specific
 * information. The events used by the core libraries are:
 *  - `"input"` when content is entered
 *    - `"input.type"` for typed input
 *      - `"input.type.compose"` for composition
 *    - `"input.paste"` for pasted input
 *    - `"input.drop"` when adding content with drag-and-drop
 *    - `"input.complete"` when autocompleting
 *  - `"delete"` when the user deletes content
 *    - `"delete.selection"` when deleting the selection
 *    - `"delete.forward"` when deleting forward from the selection
 *    - `"delete.backward"` when deleting backward from the selection
 *    - `"delete.cut"` when cutting to the clipboard
 *  - `"move"` when content is moved
 *    - `"move.drop"` when content is moved within the editor through drag-and-drop
 *  - `"select"` when explicitly changing the selection
 *    - `"select.pointer"` when selecting with a mouse or other pointing device
 *  - `"undo"` and `"redo"` for history actions
 * Use [`isUserEvent`](#state.Transaction.isUserEvent) to check whether the annotation
 * matches a given event.
 */
Transaction.userEvent = Annotation.define();
/** Annotation indicating whether a transaction should be added to the undo history or not. */
Transaction.addToHistory = Annotation.define();
/**
 * Annotation indicating (when present and true) that a transaction represents a change made
 * by some other actor, not the user. This is used, for example, to tag other people's changes
 * in collaborative editing.
 */
Transaction.remote = Annotation.define();
function joinRanges(a, b) {
    let result = [];
    for (let iA = 0, iB = 0;;) {
        let from, to;
        if (iA < a.length && (iB == b.length || b[iB] >= a[iA])) {
            from = a[iA++];
            to = a[iA++];
        }
        else if (iB < b.length) {
            from = b[iB++];
            to = b[iB++];
        }
        else
            return result;
        if (!result.length || result[result.length - 1] < from)
            result.push(from, to);
        else if (result[result.length - 1] < to)
            result[result.length - 1] = to;
    }
}
function mergeTransaction(a, b, sequential) {
    var _a;
    let mapForA, mapForB, changes;
    if (sequential) {
        mapForA = b.changes;
        mapForB = ChangeSet.empty(b.changes.length);
        changes = a.changes.compose(b.changes);
    }
    else {
        mapForA = b.changes.map(a.changes);
        mapForB = a.changes.mapDesc(b.changes, true);
        changes = a.changes.compose(mapForA);
    }
    return {
        changes,
        selection: b.selection ? b.selection.map(mapForB) : (_a = a.selection) === null || _a === void 0 ? void 0 : _a.map(mapForA),
        effects: StateEffect.mapEffects(a.effects, mapForA).concat(StateEffect.mapEffects(b.effects, mapForB)),
        annotations: a.annotations.length ? a.annotations.concat(b.annotations) : b.annotations,
        scrollIntoView: a.scrollIntoView || b.scrollIntoView
    };
}
function resolveTransactionInner(state, spec, docSize) {
    let sel = spec.selection, annotations = asArray(spec.annotations);
    if (spec.userEvent)
        annotations = annotations.concat(Transaction.userEvent.of(spec.userEvent));
    return {
        changes: spec.changes instanceof ChangeSet ? spec.changes
            : ChangeSet.of(spec.changes || [], docSize, state.facet(lineSeparator)),
        selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
        effects: asArray(spec.effects),
        annotations,
        scrollIntoView: !!spec.scrollIntoView
    };
}
function resolveTransaction(state, specs, filter) {
    let s = resolveTransactionInner(state, specs.length ? specs[0] : {}, state.doc.length);
    if (specs.length && specs[0].filter === false)
        filter = false;
    for (let i = 1; i < specs.length; i++) {
        if (specs[i].filter === false)
            filter = false;
        let seq = !!specs[i].sequential;
        s = mergeTransaction(s, resolveTransactionInner(state, specs[i], seq ? s.changes.newLength : state.doc.length), seq);
    }
    let tr = Transaction.create(state, s.changes, s.selection, s.effects, s.annotations, s.scrollIntoView);
    return extendTransaction(filter ? filterTransaction(tr) : tr);
}
// Finish a transaction by applying filters if necessary.
function filterTransaction(tr) {
    let state = tr.startState;
    // Change filters
    let result = true;
    for (let filter of state.facet(changeFilter)) {
        let value = filter(tr);
        if (value === false) {
            result = false;
            break;
        }
        if (Array.isArray(value))
            result = result === true ? value : joinRanges(result, value);
    }
    if (result !== true) {
        let changes, back;
        if (result === false) {
            back = tr.changes.invertedDesc;
            changes = ChangeSet.empty(state.doc.length);
        }
        else {
            let filtered = tr.changes.filter(result);
            changes = filtered.changes;
            back = filtered.filtered.invertedDesc;
        }
        tr = Transaction.create(state, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.scrollIntoView);
    }
    // Transaction filters
    let filters = state.facet(transactionFilter);
    for (let i = filters.length - 1; i >= 0; i--) {
        let filtered = filters[i](tr);
        if (filtered instanceof Transaction)
            tr = filtered;
        else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
            tr = filtered[0];
        else
            tr = resolveTransaction(state, asArray(filtered), false);
    }
    return tr;
}
function extendTransaction(tr) {
    let state = tr.startState, extenders = state.facet(transactionExtender), spec = tr;
    for (let i = extenders.length - 1; i >= 0; i--) {
        let extension = extenders[i](tr);
        if (extension && Object.keys(extension).length)
            spec = mergeTransaction(tr, resolveTransactionInner(state, extension, tr.changes.newLength), true);
    }
    return spec == tr ? tr : Transaction.create(state, tr.changes, tr.selection, spec.effects, spec.annotations, spec.scrollIntoView);
}
const none = [];
function asArray(value) {
    return value == null ? none : Array.isArray(value) ? value : [value];
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/charcategory.js
var CharCategory;
(function (CharCategory) {
    // Word characters.
    CharCategory[CharCategory["Word"] = 0] = "Word";
    // Whitespace.
    CharCategory[CharCategory["Space"] = 1] = "Space";
    // Anything else.
    CharCategory[CharCategory["Other"] = 2] = "Other";
})(CharCategory || (CharCategory = {}));
const nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let wordChar;
try {
    wordChar = new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
}
catch (_) { }
function hasWordChar(str) {
    if (wordChar)
        return wordChar.test(str);
    for (let i = 0; i < str.length; i++) {
        let ch = str[i];
        if (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
            return true;
    }
    return false;
}
function makeCategorizer(wordChars) {
    return (char) => {
        if (!/\S/.test(char))
            return CharCategory.Space;
        if (hasWordChar(char))
            return CharCategory.Word;
        for (let i = 0; i < wordChars.length; i++)
            if (char.indexOf(wordChars[i]) > -1)
                return CharCategory.Word;
        return CharCategory.Other;
    };
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/state.js








/**
 * The editor state class is a persistent (immutable) data structure. To update a state,
 * you [create]{@link EditorState.update} a [transaction]{@link Transaction}, which
 * produces a _new_ state instance, without modifying the original object.
 *
 * As such, _never_ mutate properties of a state directly. That'll just break things.
 */
class EditorState {
    constructor(
    // @internal
    config, 
    /** The current document. */
    doc, 
    /** The current selection. */
    selection, 
    // @internal
    values, computeSlot, tr) {
        this.config = config;
        this.doc = doc;
        this.selection = selection;
        this.values = values;
        this.status = config.statusTemplate.slice();
        this.computeSlot = computeSlot;
        // Fill in the computed state immediately, so that further queries
        // for it made during the update return this state
        if (tr)
            tr._state = this;
        for (let i = 0; i < this.config.dynamicSlots.length; i++)
            ensureAddr(this, i << 1);
        this.computeSlot = null;
    }
    field(field, require = true) {
        let addr = this.config.address[field.id];
        if (addr == null) {
            if (require)
                throw new RangeError("Field is not present in this state");
            return undefined;
        }
        ensureAddr(this, addr);
        return getAddr(this, addr);
    }
    /**
     * Create a [transaction]{@link Transaction} that updates this state. Any number of
     * [transaction specs]{@link TransactionSpec} can be passed
     */
    update(...specs) {
        return resolveTransaction(this, specs, true);
    }
    // @internal
    applyTransaction(tr) {
        let conf = this.config, { base, compartments } = conf;
        for (let effect of tr.effects) {
            if (effect.is(Compartment.reconfigure)) {
                if (conf) {
                    compartments = new Map;
                    conf.compartments.forEach((val, key) => compartments.set(key, val));
                    conf = null;
                }
                compartments.set(effect.value.compartment, effect.value.extension);
                this;
            }
            else if (effect.is(StateEffect.reconfigure)) {
                conf = null;
                base = effect.value;
            }
            else if (effect.is(StateEffect.appendConfig)) {
                conf = null;
                base = asArray(base).concat(effect.value);
            }
        }
        let startValues;
        if (!conf) {
            conf = Configuration.resolve(base, compartments, this);
            let intermediateState = new EditorState(conf, this.doc, this.selection, conf.dynamicSlots.map(() => null), (state, slot) => slot.reconfigure(state, this), null);
            startValues = intermediateState.values;
        }
        else {
            startValues = tr.startState.values.slice();
        }
        new EditorState(conf, tr.newDoc, tr.newSelection, startValues, (state, slot) => slot.update(state, tr), tr);
    }
    /** Create a [transaction spec](#state.TransactionSpec) that replaces every selection range with the given content. */
    replaceSelection(text) {
        if (typeof text == "string")
            text = this.toText(text);
        return this.changeByRange(range => ({ changes: { from: range.from, to: range.to, insert: text },
            range: EditorSelection.cursor(range.from + text.length) }));
    }
    /**
     * Create a set of changes and a new selection by running the given function for each range
     * in the active selection. The function can return an optional set of changes (in the
     * coordinate space of the start document), plus an updated range (in the coordinate space of
     * the document produced by the call's own changes). This method will merge all the changes
     * and ranges into a single changeset and selection, and return it as a
     * [transaction spec]{@link TransactionSpec}, which can be passed to {@link update}.
     */
    changeByRange(f) {
        let sel = this.selection;
        let result1 = f(sel.ranges[0]);
        let changes = this.changes(result1.changes), ranges = [result1.range];
        let effects = asArray(result1.effects);
        for (let i = 1; i < sel.ranges.length; i++) {
            let result = f(sel.ranges[i]);
            let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
            for (let j = 0; j < i; j++)
                ranges[j] = ranges[j].map(newMapped);
            let mapBy = changes.mapDesc(newChanges, true);
            ranges.push(result.range.map(mapBy));
            changes = changes.compose(newMapped);
            effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray(result.effects), mapBy));
        }
        return {
            changes,
            selection: EditorSelection.create(ranges, sel.mainIndex),
            effects
        };
    }
    /**
     * Create a [change set]{@link ChangeSet} from the given change description, taking the state's
     * document length and line separator into account.
     */
    changes(spec = []) {
        if (spec instanceof ChangeSet)
            return spec;
        return ChangeSet.of(spec, this.doc.length, this.facet(EditorState.lineSeparator));
    }
    /** Using the state's [line separator]{@link EditorState.lineSeparator}, create a {@link Text} instance from the given string. */
    toText(string) {
        return Text.of(string.split(this.facet(EditorState.lineSeparator) || DefaultSplit));
    }
    /** Return the given range of the document as a string. */
    sliceDoc(from = 0, to = this.doc.length) {
        return this.doc.sliceString(from, to, this.lineBreak);
    }
    /** Get the value of a state [facet]{@link Facet}. */
    facet(facet) {
        let addr = this.config.address[facet.id];
        if (addr == null)
            return facet.default;
        ensureAddr(this, addr);
        return getAddr(this, addr);
    }
    /**
     * Convert this state to a JSON-serializable object. When custom fields should be serialized,
     * you can pass them in as an object mapping property names (in the resulting object, which should
     * not use `doc` or `selection`) to fields.
     */
    toJSON(fields) {
        let result = {
            doc: this.sliceDoc(),
            selection: this.selection.toJSON()
        };
        if (fields)
            for (let prop in fields) {
                let value = fields[prop];
                if (value instanceof StateField)
                    result[prop] = value.spec.toJSON(this.field(fields[prop]), this);
            }
        return result;
    }
    /**
     * Deserialize a state from its JSON representation. When custom fields should be
     * deserialized, pass the same object you passed to {@link toJSON} when serializing as
     * third argument.
     */
    static fromJSON(json, config = {}, fields) {
        if (!json || typeof json.doc != "string")
            throw new RangeError("Invalid JSON representation for EditorState");
        let fieldInit = [];
        if (fields)
            for (let prop in fields) {
                let field = fields[prop], value = json[prop];
                fieldInit.push(field.init(state => field.spec.fromJSON(value, state)));
            }
        return EditorState.create({
            doc: json.doc,
            selection: EditorSelection.fromJSON(json.selection),
            extensions: config.extensions ? fieldInit.concat([config.extensions]) : fieldInit
        });
    }
    /**
     * Create a new state. You'll usually only need this when initializing an editor—updated states
     * are created by applying transactions.
     */
    static create(config = {}) {
        let configuration = Configuration.resolve(config.extensions || [], new Map);
        let doc = config.doc instanceof Text ? config.doc :
            Text.of((config.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit));
        let selection = !config.selection ? EditorSelection.single(0) :
            config.selection instanceof EditorSelection ? config.selection :
                EditorSelection.single(config.selection.anchor, config.selection.head);
        checkSelection(selection, doc.length);
        if (!configuration.staticFacet(allowMultipleSelections))
            selection = selection.asSingle();
        return new EditorState(configuration, doc, selection, configuration.dynamicSlots.map(() => null), (state, slot) => slot.create(state), null);
    }
    /** The size (in columns) of a tab in the document, determined by the {@link tabSize} facet. */
    get tabSize() { return this.facet(EditorState.tabSize); }
    /** Get the proper [line-break]{@link lineSeparator} string for this state. */
    get lineBreak() { return this.facet(EditorState.lineSeparator) || "\n"; }
    /** Returns true when the editor is [configured]{@link EditorState.readOnly} to be read-only. */
    get readOnly() { return this.facet(readOnly); }
    /**
     * Look up a translation for the given phrase (via the {@link phrases} facet), or return the
     * original string if no translation is found.
     */
    phrase(phrase) {
        for (let map of this.facet(EditorState.phrases))
            if (Object.prototype.hasOwnProperty.call(map, phrase))
                return map[phrase];
        return phrase;
    }
    /** Find the values for a given language data field, provided by the the [`languageData`](#state.EditorState^languageData) facet. */
    languageDataAt(name, pos, side = -1) {
        let values = [];
        for (let provider of this.facet(languageData)) {
            for (let result of provider(this, pos, side)) {
                if (Object.prototype.hasOwnProperty.call(result, name))
                    values.push(result[name]);
            }
        }
        return values;
    }
    /**
     * Return a function that can categorize strings (expected to represent a single
     * [grapheme cluster]{@link findClusterBreak}) into one of:
     *  - Word (contains an alphanumeric character or a character explicitly listed
     *    in the local language's `"wordChars"` language data, which should be a string)
     *  - Space (contains only whitespace)
     *  - Other (anything else)
     */
    charCategorizer(at) {
        return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
    }
    /**
     * Find the word at the given position, meaning the range containing all [word]{@link CharCategory.Word}
     * characters around it. If no word characters are adjacent to the position, this returns null.
     */
    wordAt(pos) {
        let { text, from, length } = this.doc.lineAt(pos);
        let cat = this.charCategorizer(pos);
        let start = pos - from, end = pos - from;
        while (start > 0) {
            let prev = findClusterBreak(text, start, false);
            if (cat(text.slice(prev, start)) != CharCategory.Word)
                break;
            start = prev;
        }
        while (end < length) {
            let next = findClusterBreak(text, end);
            if (cat(text.slice(end, next)) != CharCategory.Word)
                break;
            end = next;
        }
        return start == end ? null : EditorSelection.range(start + from, end + from);
    }
}
/**
 * A facet that, when enabled, causes the editor to allow multiple ranges to be selected.
 * Be careful though, because by default the editor relies on the native DOM selection,
 * which cannot handle multiple selections. An extension like {@link drawSelection} can
 * be used to make secondary selections visible to the user.
 */
EditorState.allowMultipleSelections = allowMultipleSelections;
/**
 * Configures the tab size to use in this state. The first (highest-precedence) value of
 * the facet is used. If no value is given, this defaults to 4.
 */
EditorState.tabSize = Facet.define({
    combine: values => values.length ? values[0] : 4
});
/**
 * The line separator to use. By default, any of `"\n"`, `"\r\n"` and `"\r"` is treated
 * as a separator when splitting lines, and lines are joined with `"\n"`. When you
 * configure a value here, only that precise separator will be used, allowing you to
 * round-trip documents through the editor without normalizing line separators.
 */
EditorState.lineSeparator = lineSeparator;
/**
 * This facet controls the value of the {@link readOnly} getter, which is consulted by
 * commands and extensions that implement editing functionality to determine whether
 * they should apply. It defaults to false, but when its highest-precedence value is
 * `true`, such functionality disables itself.
 *
 * Not to be confused with {@link EditorView.editable}, which controls whether the editor's
 * DOM is set to be editable (and thus focusable).
 */
EditorState.readOnly = readOnly;
/**
 * Registers translation phrases. The {@link phrase} method will look through all objects
 * registered with this facet to find translations for its argument.
 */
EditorState.phrases = Facet.define({
    compare(a, b) {
        let kA = Object.keys(a), kB = Object.keys(b);
        return kA.length == kB.length && kA.every(k => a[k] == b[k]);
    }
});
/** A facet used to register [language data]{@link languageDataAt} providers. */
EditorState.languageData = languageData;
/**
 * Facet used to register change filters, which are called for each transaction (unless explicitly
 * [disabled]{@link TransactionSpec.filter}), and can suppress part of the transaction's changes.
 *
 * Such a function can return `true` to indicate that it doesn't want to do anything, `false` to
 * completely stop the changes in the transaction, or a set of ranges in which changes should be
 * suppressed. Such ranges are represented as an array of numbers, with each pair of two numbers
 * indicating the start and end of a range. So for example `[10, 20, 100, 110]` suppresses changes
 * between 10 and 20, and between 100 and 110.
 */
EditorState.changeFilter = changeFilter;
/**
 * Facet used to register a hook that gets a chance to update or replace transaction specs
 * before they are applied. This will only be applied for transactions that don't have
 * [`filter`]{@link TransactionSpec.filter} set to `false`. You can either return a single
 * transaction spec (possibly the input transaction), or an array of specs (which will be
 * combined in the same way as the arguments to {@link EditorState.update}).
 *
 * When possible, it is recommended to avoid accessing {@link Transaction.state} in a filter,
 * since it will force creation of a state that will then be discarded again, if the
 * transaction is actually filtered.
 */
EditorState.transactionFilter = transactionFilter;
/**
 * This is a more limited form of {@link transactionFilter}, which can only add
 * [annotations]{@link TransactionSpec.annotations} and [effects]{@link TransactionSpec.effects}.
 * _But_, this type of filter runs even if the transaction has disabled regular
 * [filtering]{@link TransactionSpec.filter}, making it suitable for effects that don't need to
 * touch the changes or selection, but do want to process every transaction.
 *
 * Extenders run _after_ filters, when both are present.
 */
EditorState.transactionExtender = transactionExtender;
Compartment.reconfigure = StateEffect.define();

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/config.js
/**
 * Utility function for combining behaviors to fill in a config object from an array of
 * provided configs. `defaults` should hold default values for all optional fields in `Config`.
 *
 * The function will, by default, error when a field gets two values that aren't `===`-equal,
 * but you can provide combine functions per field to do something else.
 */
function combineConfig(configs, defaults, // Should hold only the optional properties of Config, but I haven't managed to express that
combine = {}) {
    let result = {};
    for (let config of configs)
        for (let key of Object.keys(config)) {
            let value = config[key], current = result[key];
            if (current === undefined)
                result[key] = value;
            else if (current === value || value === undefined) { } // No conflict
            else if (Object.hasOwnProperty.call(combine, key))
                result[key] = combine[key](current, value);
            else
                throw new Error("Config merge conflict for field " + key);
        }
    for (let key in defaults)
        if (result[key] === undefined)
            result[key] = defaults[key];
    return result;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/rangeset.js

/** Each range is associated with a value, which must inherit from this class. */
class RangeValue {
    /**
     * Compare this value with another value. Used when comparing rangesets. The default
     * implementation compares by identity. Unless you are only creating a fixed number of
     * unique instances of your value type, it is a good idea to implement this properly.
     */
    eq(other) { return this == other; }
    /** Create a [range](#state.Range) with this value. */
    range(from, to = from) { return Range.create(from, to, this); }
}
RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
RangeValue.prototype.point = false;
RangeValue.prototype.mapMode = MapMode.TrackDel;
/** A range associates a value with a range of positions. */
class Range {
    constructor(
    /** The range's start position. */
    from, 
    /** Its end position. */
    to, 
    /** The value associated with this range. */
    value) {
        this.from = from;
        this.to = to;
        this.value = value;
    }
    // @internal
    static create(from, to, value) {
        return new Range(from, to, value);
    }
}
function cmpRange(a, b) {
    return a.from - b.from || a.value.startSide - b.value.startSide;
}
class Chunk {
    constructor(from, to, value, 
    // Chunks are marked with the largest point that occurs
    // in them (or -1 for no points), so that scans that are
    // only interested in points (such as the
    // heightmap-related logic) can skip range-only chunks.
    maxPoint) {
        this.from = from;
        this.to = to;
        this.value = value;
        this.maxPoint = maxPoint;
    }
    get length() { return this.to[this.to.length - 1]; }
    // Find the index of the given position and side. Use the ranges'
    // `from` pos when `end == false`, `to` when `end == true`.
    findIndex(pos, side, end, startAt = 0) {
        let arr = end ? this.to : this.from;
        for (let lo = startAt, hi = arr.length;;) {
            if (lo == hi)
                return lo;
            let mid = (lo + hi) >> 1;
            let diff = arr[mid] - pos || (end ? this.value[mid].endSide : this.value[mid].startSide) - side;
            if (mid == lo)
                return diff >= 0 ? lo : hi;
            if (diff >= 0)
                hi = mid;
            else
                lo = mid + 1;
        }
    }
    between(offset, from, to, f) {
        for (let i = this.findIndex(from, -1000000000 /* Far */, true), e = this.findIndex(to, 1000000000 /* Far */, false, i); i < e; i++)
            if (f(this.from[i] + offset, this.to[i] + offset, this.value[i]) === false)
                return false;
    }
    map(offset, changes) {
        let value = [], from = [], to = [], newPos = -1, maxPoint = -1;
        for (let i = 0; i < this.value.length; i++) {
            let val = this.value[i], curFrom = this.from[i] + offset, curTo = this.to[i] + offset, newFrom, newTo;
            if (curFrom == curTo) {
                let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
                if (mapped == null)
                    continue;
                newFrom = newTo = mapped;
                if (val.startSide != val.endSide) {
                    newTo = changes.mapPos(curFrom, val.endSide);
                    if (newTo < newFrom)
                        continue;
                }
            }
            else {
                newFrom = changes.mapPos(curFrom, val.startSide);
                newTo = changes.mapPos(curTo, val.endSide);
                if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
                    continue;
            }
            if ((newTo - newFrom || val.endSide - val.startSide) < 0)
                continue;
            if (newPos < 0)
                newPos = newFrom;
            if (val.point)
                maxPoint = Math.max(maxPoint, newTo - newFrom);
            value.push(val);
            from.push(newFrom - newPos);
            to.push(newTo - newPos);
        }
        return { mapped: value.length ? new Chunk(from, to, value, maxPoint) : null, pos: newPos };
    }
}
/**
 * A range set stores a collection of [ranges]{@link Range} in a way that makes them efficient to
 * [map]{@link map} and [update]{@link update}. This is an immutable data structure.
 */
class RangeSet {
    constructor(
    // @internal
    chunkPos, 
    // @internal
    chunk, 
    // @internal
    nextLayer, 
    // @internal
    maxPoint) {
        this.chunkPos = chunkPos;
        this.chunk = chunk;
        this.nextLayer = nextLayer;
        this.maxPoint = maxPoint;
    }
    // @internal
    static create(chunkPos, chunk, nextLayer, maxPoint) {
        return new RangeSet(chunkPos, chunk, nextLayer, maxPoint);
    }
    // @internal
    get length() {
        let last = this.chunk.length - 1;
        return last < 0 ? 0 : Math.max(this.chunkEnd(last), this.nextLayer.length);
    }
    /** The number of ranges in the set. */
    get size() {
        if (this.isEmpty)
            return 0;
        let size = this.nextLayer.size;
        for (let chunk of this.chunk)
            size += chunk.value.length;
        return size;
    }
    // @internal
    chunkEnd(index) {
        return this.chunkPos[index] + this.chunk[index].length;
    }
    /** Update the range set, optionally adding new ranges or filtering out existing ones. */
    update(updateSpec) {
        let { add = [], sort = false, filterFrom = 0, filterTo = this.length } = updateSpec;
        let filter = updateSpec.filter;
        if (add.length == 0 && !filter)
            return this;
        if (sort)
            add = add.slice().sort(cmpRange);
        if (this.isEmpty)
            return add.length ? RangeSet.of(add) : this;
        let cur = new LayerCursor(this, null, -1).goto(0), i = 0, spill = [];
        let builder = new RangeSetBuilder();
        while (cur.value || i < add.length) {
            if (i < add.length && (cur.from - add[i].from || cur.startSide - add[i].value.startSide) >= 0) {
                let range = add[i++];
                if (!builder.addInner(range.from, range.to, range.value))
                    spill.push(range);
            }
            else if (cur.rangeIndex == 1 && cur.chunkIndex < this.chunk.length &&
                (i == add.length || this.chunkEnd(cur.chunkIndex) < add[i].from) &&
                (!filter || filterFrom > this.chunkEnd(cur.chunkIndex) || filterTo < this.chunkPos[cur.chunkIndex]) &&
                builder.addChunk(this.chunkPos[cur.chunkIndex], this.chunk[cur.chunkIndex])) {
                cur.nextChunk();
            }
            else {
                if (!filter || filterFrom > cur.to || filterTo < cur.from || filter(cur.from, cur.to, cur.value)) {
                    if (!builder.addInner(cur.from, cur.to, cur.value))
                        spill.push(Range.create(cur.from, cur.to, cur.value));
                }
                cur.next();
            }
        }
        return builder.finishInner(this.nextLayer.isEmpty && !spill.length ? RangeSet.empty
            : this.nextLayer.update({ add: spill, filter, filterFrom, filterTo }));
    }
    /** Map this range set through a set of changes, return the new set. */
    map(changes) {
        if (changes.empty || this.isEmpty)
            return this;
        let chunks = [], chunkPos = [], maxPoint = -1;
        for (let i = 0; i < this.chunk.length; i++) {
            let start = this.chunkPos[i], chunk = this.chunk[i];
            let touch = changes.touchesRange(start, start + chunk.length);
            if (touch === false) {
                maxPoint = Math.max(maxPoint, chunk.maxPoint);
                chunks.push(chunk);
                chunkPos.push(changes.mapPos(start));
            }
            else if (touch === true) {
                let { mapped, pos } = chunk.map(start, changes);
                if (mapped) {
                    maxPoint = Math.max(maxPoint, mapped.maxPoint);
                    chunks.push(mapped);
                    chunkPos.push(pos);
                }
            }
        }
        let next = this.nextLayer.map(changes);
        return chunks.length == 0 ? next : new RangeSet(chunkPos, chunks, next || RangeSet.empty, maxPoint);
    }
    /**
     * Iterate over the ranges that touch the region `from` to `to`, calling `f` for each. There
     * is no guarantee that the ranges will be reported in any specific order. When the callback
     * returns `false`, iteration stops.
     */
    between(from, to, f) {
        if (this.isEmpty)
            return;
        for (let i = 0; i < this.chunk.length; i++) {
            let start = this.chunkPos[i], chunk = this.chunk[i];
            if (to >= start && from <= start + chunk.length &&
                chunk.between(start, from - start, to - start, f) === false)
                return;
        }
        this.nextLayer.between(from, to, f);
    }
    /** Iterate over the ranges in this set, in order, including all ranges that end at or after `from`. */
    iter(from = 0) {
        return HeapCursor.from([this]).goto(from);
    }
    // @internal
    get isEmpty() { return this.nextLayer == this; }
    /** Iterate over the ranges in a collection of sets, in order, starting from `from`. */
    static iter(sets, from = 0) {
        return HeapCursor.from(sets).goto(from);
    }
    /** Iterate over two groups of sets, calling methods on `comparator` to notify it of possible differences. */
    static compare(oldSets, newSets, 
    // This indicates how the underlying data changed between these
    // ranges, and is needed to synchronize the iteration. `from` and
    // `to` are coordinates in the _new_ space, after these changes.
    textDiff, comparator, 
    // Can be used to ignore all non-point ranges, and points below the given size. When -1, all ranges are compared.
    minPointSize = -1) {
        let a = oldSets.filter(set => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
        let b = newSets.filter(set => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
        let sharedChunks = findSharedChunks(a, b, textDiff);
        let sideA = new SpanCursor(a, sharedChunks, minPointSize);
        let sideB = new SpanCursor(b, sharedChunks, minPointSize);
        textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
        if (textDiff.empty && textDiff.length == 0)
            compare(sideA, 0, sideB, 0, 0, comparator);
    }
    /** Compare the contents of two groups of range sets, returning true if they are equivalent in the given range. */
    static eq(oldSets, newSets, from = 0, to) {
        if (to == null)
            to = 1000000000 /* Far */;
        let a = oldSets.filter(set => !set.isEmpty && newSets.indexOf(set) < 0);
        let b = newSets.filter(set => !set.isEmpty && oldSets.indexOf(set) < 0);
        if (a.length != b.length)
            return false;
        if (!a.length)
            return true;
        let sharedChunks = findSharedChunks(a, b);
        let sideA = new SpanCursor(a, sharedChunks, 0).goto(from), sideB = new SpanCursor(b, sharedChunks, 0).goto(from);
        for (;;) {
            if (sideA.to != sideB.to ||
                !sameValues(sideA.active, sideB.active) ||
                sideA.point && (!sideB.point || !sideA.point.eq(sideB.point)))
                return false;
            if (sideA.to > to)
                return true;
            sideA.next();
            sideB.next();
        }
    }
    /**
     * Iterate over a group of range sets at the same time, notifying the iterator about the ranges
     * covering every given piece of content. Returns the open count (see {@link SpanIterator.span})
     * at the end of the iteration.
     */
    static spans(sets, from, to, iterator, 
    /** When given and greater than -1, only points of at least this size are taken into account. */
    minPointSize = -1) {
        let cursor = new SpanCursor(sets, null, minPointSize).goto(from), pos = from;
        let open = cursor.openStart;
        for (;;) {
            let curTo = Math.min(cursor.to, to);
            if (cursor.point) {
                iterator.point(pos, curTo, cursor.point, cursor.activeForPoint(cursor.to), open, cursor.pointRank);
                open = cursor.openEnd(curTo) + (cursor.to > curTo ? 1 : 0);
            }
            else if (curTo > pos) {
                iterator.span(pos, curTo, cursor.active, open);
                open = cursor.openEnd(curTo);
            }
            if (cursor.to > to)
                break;
            pos = cursor.to;
            cursor.next();
        }
        return open;
    }
    /**
     * Create a range set for the given range or array of ranges. By default, this expects the
     * ranges to be _sorted_ (by start position and, if two start at the same position,
     * `value.startSide`). You can pass `true` as second argument to cause the method to sort them.
     */
    static of(ranges, sort = false) {
        let build = new RangeSetBuilder();
        for (let range of ranges instanceof Range ? [ranges] : sort ? lazySort(ranges) : ranges)
            build.add(range.from, range.to, range.value);
        return build.finish();
    }
}
/** The empty set of ranges. */
RangeSet.empty = new RangeSet([], [], null, -1);
function lazySort(ranges) {
    if (ranges.length > 1)
        for (let prev = ranges[0], i = 1; i < ranges.length; i++) {
            let cur = ranges[i];
            if (cmpRange(prev, cur) > 0)
                return ranges.slice().sort(cmpRange);
            prev = cur;
        }
    return ranges;
}
// Awkward patch-up to create a cyclic structure.
;
RangeSet.empty.nextLayer = RangeSet.empty;
/**
 * A range set builder is a data structure that helps build up a [range set]{@link RangeSet}
 * directly, without first allocating an array of [`Range`]{@link Range} objects.
 */
class RangeSetBuilder {
    /** Create an empty builder. */
    constructor() {
        this.chunks = [];
        this.chunkPos = [];
        this.chunkStart = -1;
        this.last = null;
        this.lastFrom = -1000000000 /* Far */;
        this.lastTo = -1000000000 /* Far */;
        this.from = [];
        this.to = [];
        this.value = [];
        this.maxPoint = -1;
        this.setMaxPoint = -1;
        this.nextLayer = null;
    }
    finishChunk(newArrays) {
        this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
        this.chunkPos.push(this.chunkStart);
        this.chunkStart = -1;
        this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
        this.maxPoint = -1;
        if (newArrays) {
            this.from = [];
            this.to = [];
            this.value = [];
        }
    }
    /** Add a range. Ranges should be added in sorted (by `from` and `value.startSide`) order. */
    add(from, to, value) {
        if (!this.addInner(from, to, value))
            (this.nextLayer || (this.nextLayer = new RangeSetBuilder)).add(from, to, value);
    }
    // @internal
    addInner(from, to, value) {
        let diff = from - this.lastTo || value.startSide - this.last.endSide;
        if (diff <= 0 && (from - this.lastFrom || value.startSide - this.last.startSide) < 0)
            throw new Error("Ranges must be added sorted by `from` position and `startSide`");
        if (diff < 0)
            return false;
        if (this.from.length == 250 /* ChunkSize */)
            this.finishChunk(true);
        if (this.chunkStart < 0)
            this.chunkStart = from;
        this.from.push(from - this.chunkStart);
        this.to.push(to - this.chunkStart);
        this.last = value;
        this.lastFrom = from;
        this.lastTo = to;
        this.value.push(value);
        if (value.point)
            this.maxPoint = Math.max(this.maxPoint, to - from);
        return true;
    }
    // @internal
    addChunk(from, chunk) {
        if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
            return false;
        if (this.from.length)
            this.finishChunk(true);
        this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
        this.chunks.push(chunk);
        this.chunkPos.push(from);
        let last = chunk.value.length - 1;
        this.last = chunk.value[last];
        this.lastFrom = chunk.from[last] + from;
        this.lastTo = chunk.to[last] + from;
        return true;
    }
    /** Finish the range set. Returns the new set. The builder can't be used anymore after this has been called. */
    finish() { return this.finishInner(RangeSet.empty); }
    // @internal
    finishInner(next) {
        if (this.from.length)
            this.finishChunk(false);
        if (this.chunks.length == 0)
            return next;
        let result = RangeSet.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
        this.from = null; // Make sure further `add` calls produce errors
        return result;
    }
}
function findSharedChunks(a, b, textDiff) {
    let inA = new Map();
    for (let set of a)
        for (let i = 0; i < set.chunk.length; i++)
            if (set.chunk[i].maxPoint <= 0)
                inA.set(set.chunk[i], set.chunkPos[i]);
    let shared = new Set();
    for (let set of b)
        for (let i = 0; i < set.chunk.length; i++) {
            let known = inA.get(set.chunk[i]);
            if (known != null && (textDiff ? textDiff.mapPos(known) : known) == set.chunkPos[i] &&
                !(textDiff === null || textDiff === void 0 ? void 0 : textDiff.touchesRange(known, known + set.chunk[i].length)))
                shared.add(set.chunk[i]);
        }
    return shared;
}
class LayerCursor {
    constructor(layer, skip, minPoint, rank = 0) {
        this.layer = layer;
        this.skip = skip;
        this.minPoint = minPoint;
        this.rank = rank;
    }
    get startSide() { return this.value ? this.value.startSide : 0; }
    get endSide() { return this.value ? this.value.endSide : 0; }
    goto(pos, side = -1000000000 /* Far */) {
        this.chunkIndex = this.rangeIndex = 0;
        this.gotoInner(pos, side, false);
        return this;
    }
    gotoInner(pos, side, forward) {
        while (this.chunkIndex < this.layer.chunk.length) {
            let next = this.layer.chunk[this.chunkIndex];
            if (!(this.skip && this.skip.has(next) ||
                this.layer.chunkEnd(this.chunkIndex) < pos ||
                next.maxPoint < this.minPoint))
                break;
            this.chunkIndex++;
            forward = false;
        }
        if (this.chunkIndex < this.layer.chunk.length) {
            let rangeIndex = this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], side, true);
            if (!forward || this.rangeIndex < rangeIndex)
                this.setRangeIndex(rangeIndex);
        }
        this.next();
    }
    forward(pos, side) {
        if ((this.to - pos || this.endSide - side) < 0)
            this.gotoInner(pos, side, true);
    }
    next() {
        for (;;) {
            if (this.chunkIndex == this.layer.chunk.length) {
                this.from = this.to = 1000000000 /* Far */;
                this.value = null;
                break;
            }
            else {
                let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
                let from = chunkPos + chunk.from[this.rangeIndex];
                this.from = from;
                this.to = chunkPos + chunk.to[this.rangeIndex];
                this.value = chunk.value[this.rangeIndex];
                this.setRangeIndex(this.rangeIndex + 1);
                if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
                    break;
            }
        }
    }
    setRangeIndex(index) {
        if (index == this.layer.chunk[this.chunkIndex].value.length) {
            this.chunkIndex++;
            if (this.skip) {
                while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
                    this.chunkIndex++;
            }
            this.rangeIndex = 0;
        }
        else {
            this.rangeIndex = index;
        }
    }
    nextChunk() {
        this.chunkIndex++;
        this.rangeIndex = 0;
        this.next();
    }
    compare(other) {
        return this.from - other.from || this.startSide - other.startSide || this.rank - other.rank ||
            this.to - other.to || this.endSide - other.endSide;
    }
}
class HeapCursor {
    constructor(heap) {
        this.heap = heap;
    }
    static from(sets, skip = null, minPoint = -1) {
        let heap = [];
        for (let i = 0; i < sets.length; i++) {
            for (let cur = sets[i]; !cur.isEmpty; cur = cur.nextLayer) {
                if (cur.maxPoint >= minPoint)
                    heap.push(new LayerCursor(cur, skip, minPoint, i));
            }
        }
        return heap.length == 1 ? heap[0] : new HeapCursor(heap);
    }
    get startSide() { return this.value ? this.value.startSide : 0; }
    goto(pos, side = -1000000000 /* Far */) {
        for (let cur of this.heap)
            cur.goto(pos, side);
        for (let i = this.heap.length >> 1; i >= 0; i--)
            heapBubble(this.heap, i);
        this.next();
        return this;
    }
    forward(pos, side) {
        for (let cur of this.heap)
            cur.forward(pos, side);
        for (let i = this.heap.length >> 1; i >= 0; i--)
            heapBubble(this.heap, i);
        if ((this.to - pos || this.value.endSide - side) < 0)
            this.next();
    }
    next() {
        if (this.heap.length == 0) {
            this.from = this.to = 1000000000 /* Far */;
            this.value = null;
            this.rank = -1;
        }
        else {
            let top = this.heap[0];
            this.from = top.from;
            this.to = top.to;
            this.value = top.value;
            this.rank = top.rank;
            if (top.value)
                top.next();
            heapBubble(this.heap, 0);
        }
    }
}
function heapBubble(heap, index) {
    for (let cur = heap[index];;) {
        let childIndex = (index << 1) + 1;
        if (childIndex >= heap.length)
            break;
        let child = heap[childIndex];
        if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
            child = heap[childIndex + 1];
            childIndex++;
        }
        if (cur.compare(child) < 0)
            break;
        heap[childIndex] = cur;
        heap[index] = child;
        index = childIndex;
    }
}
class SpanCursor {
    constructor(sets, skip, minPoint) {
        this.minPoint = minPoint;
        this.active = [];
        this.activeTo = [];
        this.activeRank = [];
        this.minActive = -1;
        // A currently active point range, if any
        this.point = null;
        this.pointFrom = 0;
        this.pointRank = 0;
        this.to = -1000000000 /* Far */;
        this.endSide = 0;
        this.openStart = -1;
        this.cursor = HeapCursor.from(sets, skip, minPoint);
    }
    goto(pos, side = -1000000000 /* Far */) {
        this.cursor.goto(pos, side);
        this.active.length = this.activeTo.length = this.activeRank.length = 0;
        this.minActive = -1;
        this.to = pos;
        this.endSide = side;
        this.openStart = -1;
        this.next();
        return this;
    }
    forward(pos, side) {
        while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
            this.removeActive(this.minActive);
        this.cursor.forward(pos, side);
    }
    removeActive(index) {
        remove(this.active, index);
        remove(this.activeTo, index);
        remove(this.activeRank, index);
        this.minActive = findMinIndex(this.active, this.activeTo);
    }
    addActive(trackOpen) {
        let i = 0, { value, to, rank } = this.cursor;
        while (i < this.activeRank.length && this.activeRank[i] <= rank)
            i++;
        insert(this.active, i, value);
        insert(this.activeTo, i, to);
        insert(this.activeRank, i, rank);
        if (trackOpen)
            insert(trackOpen, i, this.cursor.from);
        this.minActive = findMinIndex(this.active, this.activeTo);
    }
    // After calling this, if `this.point` != null, the next range is a
    // point. Otherwise, it's a regular range, covered by `this.active`.
    next() {
        let from = this.to, wasPoint = this.point;
        this.point = null;
        let trackOpen = this.openStart < 0 ? [] : null, trackExtra = 0;
        for (;;) {
            let a = this.minActive;
            if (a > -1 && (this.activeTo[a] - this.cursor.from || this.active[a].endSide - this.cursor.startSide) < 0) {
                if (this.activeTo[a] > from) {
                    this.to = this.activeTo[a];
                    this.endSide = this.active[a].endSide;
                    break;
                }
                this.removeActive(a);
                if (trackOpen)
                    remove(trackOpen, a);
            }
            else if (!this.cursor.value) {
                this.to = this.endSide = 1000000000 /* Far */;
                break;
            }
            else if (this.cursor.from > from) {
                this.to = this.cursor.from;
                this.endSide = this.cursor.startSide;
                break;
            }
            else {
                let nextVal = this.cursor.value;
                if (!nextVal.point) { // Opening a range
                    this.addActive(trackOpen);
                    this.cursor.next();
                }
                else if (wasPoint && this.cursor.to == this.to && this.cursor.from < this.cursor.to) {
                    // Ignore any non-empty points that end precisely at the end of the prev point
                    this.cursor.next();
                }
                else { // New point
                    this.point = nextVal;
                    this.pointFrom = this.cursor.from;
                    this.pointRank = this.cursor.rank;
                    this.to = this.cursor.to;
                    this.endSide = nextVal.endSide;
                    if (this.cursor.from < from)
                        trackExtra = 1;
                    this.cursor.next();
                    this.forward(this.to, this.endSide);
                    break;
                }
            }
        }
        if (trackOpen) {
            let openStart = 0;
            while (openStart < trackOpen.length && trackOpen[openStart] < from)
                openStart++;
            this.openStart = openStart + trackExtra;
        }
    }
    activeForPoint(to) {
        if (!this.active.length)
            return this.active;
        let active = [];
        for (let i = this.active.length - 1; i >= 0; i--) {
            if (this.activeRank[i] < this.pointRank)
                break;
            if (this.activeTo[i] > to || this.activeTo[i] == to && this.active[i].endSide >= this.point.endSide)
                active.push(this.active[i]);
        }
        return active.reverse();
    }
    openEnd(to) {
        let open = 0;
        for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > to; i--)
            open++;
        return open;
    }
}
function compare(a, startA, b, startB, length, comparator) {
    a.goto(startA);
    b.goto(startB);
    let endB = startB + length;
    let pos = startB, dPos = startB - startA;
    for (;;) {
        let diff = (a.to + dPos) - b.to || a.endSide - b.endSide;
        let end = diff < 0 ? a.to + dPos : b.to, clipEnd = Math.min(end, endB);
        if (a.point || b.point) {
            if (!(a.point && b.point && (a.point == b.point || a.point.eq(b.point)) &&
                sameValues(a.activeForPoint(a.to + dPos), b.activeForPoint(b.to))))
                comparator.comparePoint(pos, clipEnd, a.point, b.point);
        }
        else {
            if (clipEnd > pos && !sameValues(a.active, b.active))
                comparator.compareRange(pos, clipEnd, a.active, b.active);
        }
        if (end > endB)
            break;
        pos = end;
        if (diff <= 0)
            a.next();
        if (diff >= 0)
            b.next();
    }
}
function sameValues(a, b) {
    if (a.length != b.length)
        return false;
    for (let i = 0; i < a.length; i++)
        if (a[i] != b[i] && !a[i].eq(b[i]))
            return false;
    return true;
}
function remove(array, index) {
    for (let i = index, e = array.length - 1; i < e; i++)
        array[i] = array[i + 1];
    array.pop();
}
function insert(array, index, value) {
    for (let i = array.length - 1; i >= index; i--)
        array[i + 1] = array[i];
    array[index] = value;
}
function findMinIndex(value, array) {
    let found = -1, foundPos = 1000000000 /* Far */;
    for (let i = 0; i < array.length; i++)
        if ((array[i] - foundPos || value[i].endSide - value[found].endSide) < 0) {
            found = i;
            foundPos = array[i];
        }
    return found;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/column.js

/** Count the column position at the given offset into the string, taking extending characters and tab size into account. */
function countColumn(string, tabSize, to = string.length) {
    let n = 0;
    for (let i = 0; i < to;) {
        if (string.charCodeAt(i) == 9) {
            n += tabSize - (n % tabSize);
            i++;
        }
        else {
            n++;
            i = findClusterBreak(string, i);
        }
    }
    return n;
}
/**
 * Find the offset that corresponds to the given column position in a
 * string, taking extending characters and tab size into account. By
 * default, the string length is returned when it is too short to
 * reach the column. Pass `strict` true to make it return -1 in that
 * situation.
 */
function findColumn(string, col, tabSize, strict) {
    for (let i = 0, n = 0;;) {
        if (n >= col)
            return i;
        if (i == string.length)
            break;
        n += string.charCodeAt(i) == 9 ? tabSize - (n % tabSize) : 1;
        i = findClusterBreak(string, i);
    }
    return strict === true ? -1 : string.length;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/state/index.js













/***/ }),

/***/ 245:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "V": () => (/* binding */ StyleModule)
/* harmony export */ });
const C = "\u037c";
const COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
const SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
const top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
class StyleModule {
    constructor(spec, options) {
        this.rules = [];
        let { finish } = options || {};
        function splitSelector(selector) {
            return /^@/.test(selector) ? [selector] : selector.split(/,\s*/);
        }
        function render(selectors, spec, target, isKeyframes) {
            let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]), keyframes = isAt && isAt[1] == "keyframes";
            if (isAt && spec == null)
                return target.push(selectors[0] + ";");
            for (let prop in spec) {
                let value = spec[prop];
                if (/&/.test(prop)) {
                    render(prop.split(/,\s*/).map(part => selectors.map(sel => part.replace(/&/, sel))).reduce((a, b) => a.concat(b)), value, target);
                }
                else if (value && typeof value == "object") {
                    if (!isAt)
                        throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
                    render(splitSelector(prop), value, local, keyframes);
                }
                else if (value != null) {
                    local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, l => "-" + l.toLowerCase()) + ": " + value + ";");
                }
            }
            if (local.length || keyframes) {
                target.push((finish && !isAt && !isKeyframes ? selectors.map(finish) : selectors).join(", ") + " {" + local.join(" ") + "}");
            }
        }
        for (let prop in spec)
            render(splitSelector(prop), spec[prop], this.rules);
    }
    getRules() {
        return this.rules.join("\n");
    }
    static mount(root, modules) {
        (root[SET] || new StyleSet(root)).mount(Array.isArray(modules) ? modules : [modules]);
    }
    static newName() {
        let id = top[COUNT] || 1;
        top[COUNT] = id + 1;
        return C + id.toString(36);
    }
}
let adoptedSet = null;
class StyleSet {
    constructor(root) {
        if (!root.head && root.adoptedStyleSheets && typeof CSSStyleSheet != "undefined") {
            if (adoptedSet) {
                root.adoptedStyleSheets = [adoptedSet.sheet].concat(root.adoptedStyleSheets);
                return root[SET] = adoptedSet;
            }
            this.sheet = new CSSStyleSheet;
            root.adoptedStyleSheets = [this.sheet].concat(root.adoptedStyleSheets);
            adoptedSet = this;
        }
        else {
            this.styleTag = (root.ownerDocument || root).createElement("style");
            let target = root.head || root;
            target.insertBefore(this.styleTag, target.firstChild);
        }
        this.modules = [];
        root[SET] = this;
    }
    mount(modules) {
        let sheet = this.sheet;
        let pos = 0 /* Current rule offset */, j = 0 /* Index into this.modules */;
        for (let i = 0; i < modules.length; i++) {
            let mod = modules[i], index = this.modules.indexOf(mod);
            if (index < j && index > -1) { // Ordering conflict
                this.modules.splice(index, 1);
                j--;
                index = -1;
            }
            if (index == -1) {
                this.modules.splice(j++, 0, mod);
                if (sheet)
                    for (let k = 0; k < mod.rules.length; k++)
                        sheet.insertRule(mod.rules[k], pos++);
            }
            else {
                while (j < index)
                    pos += this.modules[j++].rules.length;
                pos += mod.rules.length;
                j++;
            }
        }
        if (!sheet) {
            let text = "";
            for (let i = 0; i < this.modules.length; i++)
                text += this.modules[i].getRules() + "\n";
            this.styleTag.textContent = text;
        }
    }
}


/***/ }),

/***/ 96:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CR": () => (/* binding */ combineAttrs),
/* harmony export */   "Gl": () => (/* binding */ updateAttrs),
/* harmony export */   "o4": () => (/* binding */ attrsEq)
/* harmony export */ });
function combineAttrs(source, target) {
    for (let name in source) {
        if (name == "class" && target.class)
            target.class += " " + source.class;
        else if (name == "style" && target.style)
            target.style += ";" + source.style;
        else
            target[name] = source[name];
    }
    return target;
}
function attrsEq(a, b) {
    if (a == b)
        return true;
    if (!a || !b)
        return false;
    let keysA = Object.keys(a), keysB = Object.keys(b);
    if (keysA.length != keysB.length)
        return false;
    for (let key of keysA) {
        if (keysB.indexOf(key) == -1 || a[key] !== b[key])
            return false;
    }
    return true;
}
function updateAttrs(dom, prev, attrs) {
    if (prev)
        for (let name in prev)
            if (!(attrs && name in attrs))
                dom.removeAttribute(name);
    if (attrs)
        for (let name in attrs)
            if (!(prev && prev[name] == attrs[name]))
                dom.setAttribute(name, attrs[name]);
}


/***/ }),

/***/ 456:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CZ": () => (/* binding */ BidiSpan),
/* harmony export */   "Nm": () => (/* binding */ Direction),
/* harmony export */   "ZO": () => (/* binding */ trivialOrder),
/* harmony export */   "nG": () => (/* binding */ computeOrder),
/* harmony export */   "xo": () => (/* binding */ movedOver),
/* harmony export */   "z_": () => (/* binding */ moveVisually)
/* harmony export */ });
/* harmony import */ var _state_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(535);

/** Used to indicate [text direction]{@link EditorView.textDirection}. */
var Direction;
(function (Direction) {
    /** Left-to-right. */
    Direction[Direction["LTR"] = 0] = "LTR";
    /** Right-to-left. */
    Direction[Direction["RTL"] = 1] = "RTL";
})(Direction || (Direction = {}));
const LTR = Direction.LTR, RTL = Direction.RTL;
/** Decode a string with each type encoded as log2(type) */
function dec(str) {
    let result = [];
    for (let i = 0; i < str.length; i++)
        result.push(1 << +str[i]);
    return result;
}
// Character types for codepoints 0 to 0xf8
const LowTypes = dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
// Character types for codepoints 0x600 to 0x6f9
const ArabicTypes = dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
const Brackets = Object.create(null), BracketStack = [];
// There's a lot more in https://www.unicode.org/Public/UCD/latest/ucd/BidiBrackets.txt
for (let p of ["()", "[]", "{}"]) {
    let l = p.charCodeAt(0), r = p.charCodeAt(1);
    Brackets[l] = r;
    Brackets[r] = -l;
}
function charType(ch) {
    return ch <= 0xf7 ? LowTypes[ch] :
        0x590 <= ch && ch <= 0x5f4 ? 2 /* R */ :
            0x600 <= ch && ch <= 0x6f9 ? ArabicTypes[ch - 0x600] :
                0x6ee <= ch && ch <= 0x8ac ? 4 /* AL */ :
                    0x2000 <= ch && ch <= 0x200b ? 256 /* NI */ :
                        ch == 0x200c ? 256 /* NI */ : 1 /* L */;
}
const BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
/** Represents a contiguous range of text that has a single direction (as in left-to-right or right-to-left). */
class BidiSpan {
    // @internal
    constructor(
    /** The start of the span (relative to the start of the line). */
    from, 
    /** The end of the span. */
    to, 
    /**
     * The ["bidi level"](https://unicode.org/reports/tr9/#Basic_Display_Algorithm) of the span
     * (in this context, 0 means left-to-right, 1 means right-to-left, 2 means left-to-right
     * number inside right-to-left text).
     */
    level) {
        this.from = from;
        this.to = to;
        this.level = level;
    }
    /** The direction of this span. */
    get dir() { return this.level % 2 ? RTL : LTR; }
    // @internal
    side(end, dir) { return (this.dir == dir) == end ? this.to : this.from; }
    // @internal
    static find(order, index, level, assoc) {
        let maybe = -1;
        for (let i = 0; i < order.length; i++) {
            let span = order[i];
            if (span.from <= index && span.to >= index) {
                if (span.level == level)
                    return i;
                // When multiple spans match, if assoc != 0, take the one that covers that side, otherwise take the one with the minimum level.
                if (maybe < 0 || (assoc != 0 ? (assoc < 0 ? span.from < index : span.to > index) : order[maybe].level > span.level))
                    maybe = i;
            }
        }
        if (maybe < 0)
            throw new RangeError("Index out of range");
        return maybe;
    }
}
// Reused array of character types
const types = [];
function computeOrder(line, direction) {
    let len = line.length, outerType = direction == LTR ? 1 /* L */ : 2 /* R */, oppositeType = direction == LTR ? 2 /* R */ : 1 /* L */;
    if (!line || outerType == 1 /* L */ && !BidiRE.test(line))
        return trivialOrder(len);
    // W1. Examine each non-spacing mark (NSM) in the level run, and
    // change the type of the NSM to the type of the previous
    // character. If the NSM is at the start of the level run, it will
    // get the type of sor.
    // W2. Search backwards from each instance of a European number
    // until the first strong type (R, L, AL, or sor) is found. If an
    // AL is found, change the type of the European number to Arabic
    // number.
    // W3. Change all ALs to R.
    // (Left after this: L, R, EN, AN, ET, CS, NI)
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
        let type = charType(line.charCodeAt(i));
        if (type == 512 /* NSM */)
            type = prev;
        else if (type == 8 /* EN */ && prevStrong == 4 /* AL */)
            type = 16 /* AN */;
        types[i] = type == 4 /* AL */ ? 2 /* R */ : type;
        if (type & 7 /* Strong */)
            prevStrong = type;
        prev = type;
    }
    // W5. A sequence of European terminators adjacent to European
    // numbers changes to all European numbers.
    // W6. Otherwise, separators and terminators change to Other
    // Neutral.
    // W7. Search backwards from each instance of a European number
    // until the first strong type (R, L, or sor) is found. If an L is
    // found, then change the type of the European number to L.
    // (Left after this: L, R, EN+AN, NI)
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
        let type = types[i];
        if (type == 128 /* CS */) {
            if (i < len - 1 && prev == types[i + 1] && (prev & 24 /* Num */))
                type = types[i] = prev;
            else
                types[i] = 256 /* NI */;
        }
        else if (type == 64 /* ET */) {
            let end = i + 1;
            while (end < len && types[end] == 64 /* ET */)
                end++;
            let replace = (i && prev == 8 /* EN */) || (end < len && types[end] == 8 /* EN */) ? (prevStrong == 1 /* L */ ? 1 /* L */ : 8 /* EN */) : 256 /* NI */;
            for (let j = i; j < end; j++)
                types[j] = replace;
            i = end - 1;
        }
        else if (type == 8 /* EN */ && prevStrong == 1 /* L */) {
            types[i] = 1 /* L */;
        }
        prev = type;
        if (type & 7 /* Strong */)
            prevStrong = type;
    }
    // N0. Process bracket pairs in an isolating run sequence
    // sequentially in the logical order of the text positions of the
    // opening paired brackets using the logic given below. Within this
    // scope, bidirectional types EN and AN are treated as R.
    for (let i = 0, sI = 0, context = 0, ch, br, type; i < len; i++) {
        // Keeps [startIndex, type, strongSeen] triples for each open bracket on BracketStack.
        if (br = Brackets[ch = line.charCodeAt(i)]) {
            if (br < 0) { // Closing bracket
                for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
                    if (BracketStack[sJ + 1] == -br) {
                        let flags = BracketStack[sJ + 2];
                        let type = (flags & 2 /* EmbedInside */) ? outerType :
                            !(flags & 4 /* OppositeInside */) ? 0 :
                                (flags & 1 /* OppositeBefore */) ? oppositeType : outerType;
                        if (type)
                            types[i] = types[BracketStack[sJ]] = type;
                        sI = sJ;
                        break;
                    }
                }
            }
            else if (BracketStack.length == 189 /* MaxDepth */) {
                break;
            }
            else {
                BracketStack[sI++] = i;
                BracketStack[sI++] = ch;
                BracketStack[sI++] = context;
            }
        }
        else if ((type = types[i]) == 2 /* R */ || type == 1 /* L */) {
            let embed = type == outerType;
            context = embed ? 0 : 1 /* OppositeBefore */;
            for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
                let cur = BracketStack[sJ + 2];
                if (cur & 2 /* EmbedInside */)
                    break;
                if (embed) {
                    BracketStack[sJ + 2] |= 2 /* EmbedInside */;
                }
                else {
                    if (cur & 4 /* OppositeInside */)
                        break;
                    BracketStack[sJ + 2] |= 4 /* OppositeInside */;
                }
            }
        }
    }
    // N1. A sequence of neutrals takes the direction of the
    // surrounding strong text if the text on both sides has the same
    // direction. European and Arabic numbers act as if they were R in
    // terms of their influence on neutrals. Start-of-level-run (sor)
    // and end-of-level-run (eor) are used at level run boundaries.
    // N2. Any remaining neutrals take the embedding direction.
    // (Left after this: L, R, EN+AN)
    for (let i = 0; i < len; i++) {
        if (types[i] == 256 /* NI */) {
            let end = i + 1;
            while (end < len && types[end] == 256 /* NI */)
                end++;
            let beforeL = (i ? types[i - 1] : outerType) == 1 /* L */;
            let afterL = (end < len ? types[end] : outerType) == 1 /* L */;
            let replace = beforeL == afterL ? (beforeL ? 1 /* L */ : 2 /* R */) : outerType;
            for (let j = i; j < end; j++)
                types[j] = replace;
            i = end - 1;
        }
    }
    // Here we depart from the documented algorithm, in order to avoid
    // building up an actual levels array. Since there are only three
    // levels (0, 1, 2) in an implementation that doesn't take
    // explicit embedding into account, we can build up the order on
    // the fly, without following the level-based algorithm.
    let order = [];
    if (outerType == 1 /* L */) {
        for (let i = 0; i < len;) {
            let start = i, rtl = types[i++] != 1 /* L */;
            while (i < len && rtl == (types[i] != 1 /* L */))
                i++;
            if (rtl) {
                for (let j = i; j > start;) {
                    let end = j, l = types[--j] != 2 /* R */;
                    while (j > start && l == (types[j - 1] != 2 /* R */))
                        j--;
                    order.push(new BidiSpan(j, end, l ? 2 : 1));
                }
            }
            else {
                order.push(new BidiSpan(start, i, 0));
            }
        }
    }
    else {
        for (let i = 0; i < len;) {
            let start = i, rtl = types[i++] == 2 /* R */;
            while (i < len && rtl == (types[i] == 2 /* R */))
                i++;
            order.push(new BidiSpan(start, i, rtl ? 1 : 2));
        }
    }
    return order;
}
function trivialOrder(length) {
    return [new BidiSpan(0, length, 0)];
}
let movedOver = "";
function moveVisually(line, order, dir, start, forward) {
    var _a;
    let startIndex = start.head - line.from, spanI = -1;
    if (startIndex == 0) {
        if (!forward || !line.length)
            return null;
        if (order[0].level != dir) {
            startIndex = order[0].side(false, dir);
            spanI = 0;
        }
    }
    else if (startIndex == line.length) {
        if (forward)
            return null;
        let last = order[order.length - 1];
        if (last.level != dir) {
            startIndex = last.side(true, dir);
            spanI = order.length - 1;
        }
    }
    if (spanI < 0)
        spanI = BidiSpan.find(order, startIndex, (_a = start.bidiLevel) !== null && _a !== void 0 ? _a : -1, start.assoc);
    let span = order[spanI];
    // End of span. (But not end of line--that was checked for above.)
    if (startIndex == span.side(forward, dir)) {
        span = order[spanI += forward ? 1 : -1];
        startIndex = span.side(!forward, dir);
    }
    let indexForward = forward == (span.dir == dir);
    let nextIndex = (0,_state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .findClusterBreak */ .cp)(line.text, startIndex, indexForward);
    movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
    if (nextIndex != span.side(forward, dir))
        return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(nextIndex + line.from, indexForward ? -1 : 1, span.level);
    let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
    if (!nextSpan && span.level != dir)
        return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(forward ? line.to : line.from, forward ? -1 : 1, dir);
    if (nextSpan && nextSpan.level < span.level)
        return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(nextSpan.side(!forward, dir) + line.from, forward ? 1 : -1, nextSpan.level);
    return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(nextIndex + line.from, forward ? -1 : 1, span.level);
}


/***/ }),

/***/ 396:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "d": () => (/* binding */ BlockWidgetView),
/* harmony export */   "y": () => (/* binding */ LineView)
/* harmony export */ });
/* harmony import */ var _contentview_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(72);
/* harmony import */ var _inlineview_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(603);
/* harmony import */ var _dom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(604);
/* harmony import */ var _decoration_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(22);
/* harmony import */ var _attributes_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(96);
/* harmony import */ var _browser_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(362);
/* harmony import */ var _state_index_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(535);







class LineView extends _contentview_js__WEBPACK_IMPORTED_MODULE_0__/* .ContentView */ .Cl {
    constructor() {
        super(...arguments);
        this.children = [];
        this.length = 0;
        this.prevAttrs = undefined;
        this.attrs = null;
        this.breakAfter = 0;
    }
    // Consumes source
    merge(from, to, source, hasStart, openStart, openEnd) {
        if (source) {
            if (!(source instanceof LineView))
                return false;
            if (!this.dom)
                source.transferDOM(this); // Reuse source.dom when appropriate
        }
        if (hasStart)
            this.setDeco(source ? source.attrs : null);
        (0,_contentview_js__WEBPACK_IMPORTED_MODULE_0__/* .mergeChildrenInto */ .Sy)(this, from, to, source ? source.children : [], openStart, openEnd);
        return true;
    }
    split(at) {
        let end = new LineView;
        end.breakAfter = this.breakAfter;
        if (this.length == 0)
            return end;
        let { i, off } = this.childPos(at);
        if (off) {
            end.append(this.children[i].split(off), 0);
            this.children[i].merge(off, this.children[i].length, null, false, 0, 0);
            i++;
        }
        for (let j = i; j < this.children.length; j++)
            end.append(this.children[j], 0);
        while (i > 0 && this.children[i - 1].length == 0)
            this.children[--i].destroy();
        this.children.length = i;
        this.markDirty();
        this.length = at;
        return end;
    }
    transferDOM(other) {
        if (!this.dom)
            return;
        other.setDOM(this.dom);
        other.prevAttrs = this.prevAttrs === undefined ? this.attrs : this.prevAttrs;
        this.prevAttrs = undefined;
        this.dom = null;
    }
    setDeco(attrs) {
        if (!(0,_attributes_js__WEBPACK_IMPORTED_MODULE_6__/* .attrsEq */ .o4)(this.attrs, attrs)) {
            if (this.dom) {
                this.prevAttrs = this.attrs;
                this.markDirty();
            }
            this.attrs = attrs;
        }
    }
    append(child, openStart) {
        (0,_inlineview_js__WEBPACK_IMPORTED_MODULE_1__/* .joinInlineInto */ .Wn)(this, child, openStart);
    }
    // Only called when building a line view in ContentBuilder
    addLineDeco(deco) {
        let attrs = deco.spec.attributes, cls = deco.spec.class;
        if (attrs)
            this.attrs = (0,_attributes_js__WEBPACK_IMPORTED_MODULE_6__/* .combineAttrs */ .CR)(attrs, this.attrs || {});
        if (cls)
            this.attrs = (0,_attributes_js__WEBPACK_IMPORTED_MODULE_6__/* .combineAttrs */ .CR)({ class: cls }, this.attrs || {});
    }
    domAtPos(pos) {
        return (0,_inlineview_js__WEBPACK_IMPORTED_MODULE_1__/* .inlineDOMAtPos */ .WT)(this.dom, this.children, pos);
    }
    reuseDOM(node) {
        if (node.nodeName == "DIV") {
            this.setDOM(node);
            this.dirty |= 4 /* Attrs */ | 2 /* Node */;
        }
    }
    sync(track) {
        var _a;
        if (!this.dom) {
            this.setDOM(document.createElement("div"));
            this.dom.className = "cm-line";
            this.prevAttrs = this.attrs ? null : undefined;
        }
        else if (this.dirty & 4 /* Attrs */) {
            (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .clearAttributes */ .iO)(this.dom);
            this.dom.className = "cm-line";
            this.prevAttrs = this.attrs ? null : undefined;
        }
        if (this.prevAttrs !== undefined) {
            (0,_attributes_js__WEBPACK_IMPORTED_MODULE_6__/* .updateAttrs */ .Gl)(this.dom, this.prevAttrs, this.attrs);
            this.dom.classList.add("cm-line");
            this.prevAttrs = undefined;
        }
        super.sync(track);
        let last = this.dom.lastChild;
        while (last && _contentview_js__WEBPACK_IMPORTED_MODULE_0__/* .ContentView.get */ .Cl.get(last) instanceof _inlineview_js__WEBPACK_IMPORTED_MODULE_1__/* .MarkView */ .WR)
            last = last.lastChild;
        if (!last || !this.length ||
            last.nodeName != "BR" && ((_a = _contentview_js__WEBPACK_IMPORTED_MODULE_0__/* .ContentView.get */ .Cl.get(last)) === null || _a === void 0 ? void 0 : _a.isEditable) == false &&
                (!_browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].ios */ .Z.ios || !this.children.some(ch => ch instanceof _inlineview_js__WEBPACK_IMPORTED_MODULE_1__/* .TextView */ .yS))) {
            let hack = document.createElement("BR");
            hack.cmIgnore = true;
            this.dom.appendChild(hack);
        }
    }
    measureTextSize() {
        if (this.children.length == 0 || this.length > 20)
            return null;
        let totalWidth = 0;
        for (let child of this.children) {
            if (!(child instanceof _inlineview_js__WEBPACK_IMPORTED_MODULE_1__/* .TextView */ .yS))
                return null;
            let rects = (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .clientRectsFor */ .kC)(child.dom);
            if (rects.length != 1)
                return null;
            totalWidth += rects[0].width;
        }
        return { lineHeight: this.dom.getBoundingClientRect().height,
            charWidth: totalWidth / this.length };
    }
    coordsAt(pos, side) {
        return (0,_inlineview_js__WEBPACK_IMPORTED_MODULE_1__/* .coordsInChildren */ .gz)(this, pos, side);
    }
    become(_other) { return false; }
    get type() { return _decoration_js__WEBPACK_IMPORTED_MODULE_3__/* .BlockType.Text */ .kH.Text; }
    static find(docView, pos) {
        for (let i = 0, off = 0; i < docView.children.length; i++) {
            let block = docView.children[i], end = off + block.length;
            if (end >= pos) {
                if (block instanceof LineView)
                    return block;
                if (end > pos)
                    break;
            }
            off = end + block.breakAfter;
        }
        return null;
    }
}
class BlockWidgetView extends _contentview_js__WEBPACK_IMPORTED_MODULE_0__/* .ContentView */ .Cl {
    constructor(widget, length, type) {
        super();
        this.widget = widget;
        this.length = length;
        this.type = type;
        this.breakAfter = 0;
        this.prevWidget = null;
    }
    merge(from, to, source, _takeDeco, openStart, openEnd) {
        if (source && (!(source instanceof BlockWidgetView) || !this.widget.compare(source.widget) ||
            from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
            return false;
        this.length = from + (source ? source.length : 0) + (this.length - to);
        return true;
    }
    domAtPos(pos) {
        return pos == 0 ? _contentview_js__WEBPACK_IMPORTED_MODULE_0__/* .DOMPos.before */ .Y4.before(this.dom) : _contentview_js__WEBPACK_IMPORTED_MODULE_0__/* .DOMPos.after */ .Y4.after(this.dom, pos == this.length);
    }
    split(at) {
        let len = this.length - at;
        this.length = at;
        let end = new BlockWidgetView(this.widget, len, this.type);
        end.breakAfter = this.breakAfter;
        return end;
    }
    get children() { return _contentview_js__WEBPACK_IMPORTED_MODULE_0__/* .noChildren */ .JR; }
    sync() {
        if (!this.dom || !this.widget.updateDOM(this.dom)) {
            if (this.dom && this.prevWidget)
                this.prevWidget.destroy(this.dom);
            this.prevWidget = null;
            this.setDOM(this.widget.toDOM(this.editorView));
            this.dom.contentEditable = "false";
        }
    }
    get overrideDOMText() {
        return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : _state_index_js__WEBPACK_IMPORTED_MODULE_5__/* .Text.empty */ .xv.empty;
    }
    domBoundsAround() { return null; }
    become(other) {
        if (other instanceof BlockWidgetView && other.type == this.type &&
            other.widget.constructor == this.widget.constructor) {
            if (!other.widget.eq(this.widget))
                this.markDirty(true);
            if (this.dom && !this.prevWidget)
                this.prevWidget = this.widget;
            this.widget = other.widget;
            this.length = other.length;
            this.breakAfter = other.breakAfter;
            return true;
        }
        return false;
    }
    ignoreMutation() { return true; }
    ignoreEvent(event) { return this.widget.ignoreEvent(event); }
    destroy() {
        super.destroy();
        if (this.dom)
            this.widget.destroy(this.dom);
    }
}


/***/ }),

/***/ 362:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
let nav = typeof navigator != "undefined" ? navigator : { userAgent: "", vendor: "", platform: "" };
let doc = typeof document != "undefined" ? document : { documentElement: { style: {} } };
const ie_edge = /Edge\/(\d+)/.exec(nav.userAgent);
const ie_upto10 = /MSIE \d/.test(nav.userAgent);
const ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
const ie = !!(ie_upto10 || ie_11up || ie_edge);
const gecko = !ie && /gecko\/(\d+)/i.test(nav.userAgent);
const chrome = !ie && /Chrome\/(\d+)/.exec(nav.userAgent);
const webkit = "webkitFontSmoothing" in doc.documentElement.style;
const safari = !ie && /Apple Computer/.test(nav.vendor);
const ios = safari && (/Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
    mac: ios || /Mac/.test(nav.platform),
    windows: /Win/.test(nav.platform),
    linux: /Linux|X11/.test(nav.platform),
    ie,
    ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
    gecko,
    gecko_version: gecko ? +(/Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
    chrome: !!chrome,
    chrome_version: chrome ? +chrome[1] : 0,
    ios,
    android: /Android\b/.test(nav.userAgent),
    webkit,
    safari,
    webkit_version: webkit ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
    tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
});


/***/ }),

/***/ 72:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Cl": () => (/* binding */ ContentView),
/* harmony export */   "JR": () => (/* binding */ noChildren),
/* harmony export */   "Sy": () => (/* binding */ mergeChildrenInto),
/* harmony export */   "T7": () => (/* binding */ ChildCursor),
/* harmony export */   "VO": () => (/* binding */ replaceRange),
/* harmony export */   "Y4": () => (/* binding */ DOMPos)
/* harmony export */ });
/* harmony import */ var _dom_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(604);

class DOMPos {
    constructor(node, offset, precise = true) {
        this.node = node;
        this.offset = offset;
        this.precise = precise;
    }
    static before(dom, precise) { return new DOMPos(dom.parentNode, (0,_dom_js__WEBPACK_IMPORTED_MODULE_0__/* .domIndex */ .u0)(dom), precise); }
    static after(dom, precise) { return new DOMPos(dom.parentNode, (0,_dom_js__WEBPACK_IMPORTED_MODULE_0__/* .domIndex */ .u0)(dom) + 1, precise); }
}
const noChildren = [];
class ContentView {
    constructor() {
        this.parent = null;
        this.dom = null;
        this.dirty = 2 /* Node */;
    }
    get editorView() {
        if (!this.parent)
            throw new Error("Accessing view in orphan content view");
        return this.parent.editorView;
    }
    get overrideDOMText() { return null; }
    get posAtStart() {
        return this.parent ? this.parent.posBefore(this) : 0;
    }
    get posAtEnd() {
        return this.posAtStart + this.length;
    }
    posBefore(view) {
        let pos = this.posAtStart;
        for (let child of this.children) {
            if (child == view)
                return pos;
            pos += child.length + child.breakAfter;
        }
        throw new RangeError("Invalid child in posBefore");
    }
    posAfter(view) {
        return this.posBefore(view) + view.length;
    }
    // Will return a rectangle directly before (when side < 0), after (side > 0) or directly on (when
    // the browser supports it) the given position.
    coordsAt(_pos, _side) { return null; }
    sync(track) {
        if (this.dirty & 2 /* Node */) {
            let parent = this.dom;
            let prev = null, next;
            for (let child of this.children) {
                if (child.dirty) {
                    if (!child.dom && (next = prev ? prev.nextSibling : parent.firstChild)) {
                        let contentView = ContentView.get(next);
                        if (!contentView || !contentView.parent && contentView.constructor == child.constructor)
                            child.reuseDOM(next);
                    }
                    child.sync(track);
                    child.dirty = 0 /* Not */;
                }
                next = prev ? prev.nextSibling : parent.firstChild;
                if (track && !track.written && track.node == parent && next != child.dom)
                    track.written = true;
                if (child.dom.parentNode == parent) {
                    while (next && next != child.dom)
                        next = rm(next);
                }
                else {
                    parent.insertBefore(child.dom, next);
                }
                prev = child.dom;
            }
            next = prev ? prev.nextSibling : parent.firstChild;
            if (next && track && track.node == parent)
                track.written = true;
            while (next)
                next = rm(next);
        }
        else if (this.dirty & 1 /* Child */) {
            for (let child of this.children)
                if (child.dirty) {
                    child.sync(track);
                    child.dirty = 0 /* Not */;
                }
        }
    }
    reuseDOM(_dom) { }
    localPosFromDOM(node, offset) {
        let after;
        if (node == this.dom) {
            after = this.dom.childNodes[offset];
        }
        else {
            let bias = (0,_dom_js__WEBPACK_IMPORTED_MODULE_0__/* .maxOffset */ .bD)(node) == 0 ? 0 : offset == 0 ? -1 : 1;
            for (;;) {
                let parent = node.parentNode;
                if (parent == this.dom)
                    break;
                if (bias == 0 && parent.firstChild != parent.lastChild) {
                    if (node == parent.firstChild)
                        bias = -1;
                    else
                        bias = 1;
                }
                node = parent;
            }
            if (bias < 0)
                after = node;
            else
                after = node.nextSibling;
        }
        if (after == this.dom.firstChild)
            return 0;
        while (after && !ContentView.get(after))
            after = after.nextSibling;
        if (!after)
            return this.length;
        for (let i = 0, pos = 0;; i++) {
            let child = this.children[i];
            if (child.dom == after)
                return pos;
            pos += child.length + child.breakAfter;
        }
    }
    domBoundsAround(from, to, offset = 0) {
        let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
        for (let i = 0, pos = offset, prevEnd = offset; i < this.children.length; i++) {
            let child = this.children[i], end = pos + child.length;
            if (pos < from && end > to)
                return child.domBoundsAround(from, to, pos);
            if (end >= from && fromI == -1) {
                fromI = i;
                fromStart = pos;
            }
            if (pos > to && child.dom.parentNode == this.dom) {
                toI = i;
                toEnd = prevEnd;
                break;
            }
            prevEnd = end;
            pos = end + child.breakAfter;
        }
        return { from: fromStart, to: toEnd < 0 ? offset + this.length : toEnd,
            startDOM: (fromI ? this.children[fromI - 1].dom.nextSibling : null) || this.dom.firstChild,
            endDOM: toI < this.children.length && toI >= 0 ? this.children[toI].dom : null };
    }
    markDirty(andParent = false) {
        this.dirty |= 2 /* Node */;
        this.markParentsDirty(andParent);
    }
    markParentsDirty(childList) {
        for (let parent = this.parent; parent; parent = parent.parent) {
            if (childList)
                parent.dirty |= 2 /* Node */;
            if (parent.dirty & 1 /* Child */)
                return;
            parent.dirty |= 1 /* Child */;
            childList = false;
        }
    }
    setParent(parent) {
        if (this.parent != parent) {
            this.parent = parent;
            if (this.dirty)
                this.markParentsDirty(true);
        }
    }
    setDOM(dom) {
        if (this.dom)
            this.dom.cmView = null;
        this.dom = dom;
        dom.cmView = this;
    }
    get rootView() {
        for (let v = this;;) {
            let parent = v.parent;
            if (!parent)
                return v;
            v = parent;
        }
    }
    replaceChildren(from, to, children = noChildren) {
        this.markDirty();
        for (let i = from; i < to; i++) {
            let child = this.children[i];
            if (child.parent == this)
                child.destroy();
        }
        this.children.splice(from, to - from, ...children);
        for (let i = 0; i < children.length; i++)
            children[i].setParent(this);
    }
    ignoreMutation(_rec) { return false; }
    ignoreEvent(_event) { return false; }
    childCursor(pos = this.length) {
        return new ChildCursor(this.children, pos, this.children.length);
    }
    childPos(pos, bias = 1) {
        return this.childCursor().findPos(pos, bias);
    }
    toString() {
        let name = this.constructor.name.replace("View", "");
        return name + (this.children.length ? "(" + this.children.join() + ")" :
            this.length ? "[" + (name == "Text" ? this.text : this.length) + "]" : "") +
            (this.breakAfter ? "#" : "");
    }
    static get(node) { return node.cmView; }
    get isEditable() { return true; }
    merge(from, to, source, hasStart, openStart, openEnd) {
        return false;
    }
    become(other) { return false; }
    // When this is a zero-length view with a side, this should return a
    // number <= 0 to indicate it is before its position, or a
    // number > 0 when after its position.
    getSide() { return 0; }
    destroy() {
        this.parent = null;
    }
}
ContentView.prototype.breakAfter = 0;
// Remove a DOM node and return its next sibling.
function rm(dom) {
    let next = dom.nextSibling;
    dom.parentNode.removeChild(dom);
    return next;
}
class ChildCursor {
    constructor(children, pos, i) {
        this.children = children;
        this.pos = pos;
        this.i = i;
        this.off = 0;
    }
    findPos(pos, bias = 1) {
        for (;;) {
            if (pos > this.pos || pos == this.pos &&
                (bias > 0 || this.i == 0 || this.children[this.i - 1].breakAfter)) {
                this.off = pos - this.pos;
                return this;
            }
            let next = this.children[--this.i];
            this.pos -= next.length + next.breakAfter;
        }
    }
}
function replaceRange(parent, fromI, fromOff, toI, toOff, insert, breakAtStart, openStart, openEnd) {
    let { children } = parent;
    let before = children.length ? children[fromI] : null;
    let last = insert.length ? insert[insert.length - 1] : null;
    let breakAtEnd = last ? last.breakAfter : breakAtStart;
    // Change within a single child
    if (fromI == toI && before && !breakAtStart && !breakAtEnd && insert.length < 2 &&
        before.merge(fromOff, toOff, insert.length ? last : null, fromOff == 0, openStart, openEnd))
        return;
    if (toI < children.length) {
        let after = children[toI];
        // Make sure the end of the child after the update is preserved in `after`
        if (after && toOff < after.length) {
            // If we're splitting a child, separate part of it to avoid that being mangled when updating the child before the update.
            if (fromI == toI) {
                after = after.split(toOff);
                toOff = 0;
            }
            // If the element after the replacement should be merged with the last replacing element, update `content`
            if (!breakAtEnd && last && after.merge(0, toOff, last, true, 0, openEnd)) {
                insert[insert.length - 1] = after;
            }
            else {
                // Remove the start of the after element, if necessary, and add it to `content`.
                if (toOff)
                    after.merge(0, toOff, null, false, 0, openEnd);
                insert.push(after);
            }
        }
        else if (after === null || after === void 0 ? void 0 : after.breakAfter) {
            // The element at `toI` is entirely covered by this range. Preserve its line break, if any.
            if (last)
                last.breakAfter = 1;
            else
                breakAtStart = 1;
        }
        // Since we've handled the next element from the current elements now, make sure `toI` points after that.
        toI++;
    }
    if (before) {
        before.breakAfter = breakAtStart;
        if (fromOff > 0) {
            if (!breakAtStart && insert.length && before.merge(fromOff, before.length, insert[0], false, openStart, 0)) {
                before.breakAfter = insert.shift().breakAfter;
            }
            else if (fromOff < before.length || before.children.length && before.children[before.children.length - 1].length == 0) {
                before.merge(fromOff, before.length, null, false, openStart, 0);
            }
            fromI++;
        }
    }
    // Try to merge widgets on the boundaries of the replacement
    while (fromI < toI && insert.length) {
        if (children[toI - 1].become(insert[insert.length - 1])) {
            toI--;
            insert.pop();
            openEnd = insert.length ? 0 : openStart;
        }
        else if (children[fromI].become(insert[0])) {
            fromI++;
            insert.shift();
            openStart = insert.length ? 0 : openEnd;
        }
        else {
            break;
        }
    }
    if (!insert.length && fromI && toI < children.length && !children[fromI - 1].breakAfter &&
        children[toI].merge(0, 0, children[fromI - 1], false, openStart, openEnd))
        fromI--;
    if (fromI < toI || insert.length)
        parent.replaceChildren(fromI, toI, insert);
}
function mergeChildrenInto(parent, from, to, insert, openStart, openEnd) {
    let cur = parent.childCursor();
    let { i: toI, off: toOff } = cur.findPos(to, 1);
    let { i: fromI, off: fromOff } = cur.findPos(from, -1);
    let dLen = from - to;
    for (let view of insert)
        dLen += view.length;
    parent.length += dLen;
    replaceRange(parent, fromI, fromOff, toI, toOff, insert, 0, openStart, openEnd);
}


/***/ }),

/***/ 849:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Cl": () => (/* binding */ byGroup),
/* harmony export */   "Ih": () => (/* binding */ groupAt),
/* harmony export */   "Nn": () => (/* binding */ posAtCoords),
/* harmony export */   "Vk": () => (/* binding */ skipAtoms),
/* harmony export */   "kW": () => (/* binding */ moveByChar),
/* harmony export */   "pw": () => (/* binding */ moveVertically),
/* harmony export */   "rr": () => (/* binding */ moveToLineBoundary)
/* harmony export */ });
/* harmony import */ var _state_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(535);
/* harmony import */ var _decoration_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(22);
/* harmony import */ var _blockview_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(396);
/* harmony import */ var _extension_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(179);
/* harmony import */ var _dom_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(604);
/* harmony import */ var _bidi_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(456);
/* harmony import */ var _browser_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(362);







function groupAt(state, pos, bias = 1) {
    let categorize = state.charCategorizer(pos);
    let line = state.doc.lineAt(pos), linePos = pos - line.from;
    if (line.length == 0)
        return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(pos);
    if (linePos == 0)
        bias = 1;
    else if (linePos == line.length)
        bias = -1;
    let from = linePos, to = linePos;
    if (bias < 0)
        from = (0,_state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .findClusterBreak */ .cp)(line.text, linePos, false);
    else
        to = (0,_state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .findClusterBreak */ .cp)(line.text, linePos);
    let cat = categorize(line.text.slice(from, to));
    while (from > 0) {
        let prev = (0,_state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .findClusterBreak */ .cp)(line.text, from, false);
        if (categorize(line.text.slice(prev, from)) != cat)
            break;
        from = prev;
    }
    while (to < line.length) {
        let next = (0,_state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .findClusterBreak */ .cp)(line.text, to);
        if (categorize(line.text.slice(to, next)) != cat)
            break;
        to = next;
    }
    return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.range */ .jT.range(from + line.from, to + line.from);
}
// Search the DOM for the {node, offset} position closest to the given
// coordinates. Very inefficient and crude, but can usually be avoided
// by calling caret(Position|Range)FromPoint instead.
function getdx(x, rect) {
    return rect.left > x ? rect.left - x : Math.max(0, x - rect.right);
}
function getdy(y, rect) {
    return rect.top > y ? rect.top - y : Math.max(0, y - rect.bottom);
}
function yOverlap(a, b) {
    return a.top < b.bottom - 1 && a.bottom > b.top + 1;
}
function upTop(rect, top) {
    return top < rect.top ? { top, left: rect.left, right: rect.right, bottom: rect.bottom } : rect;
}
function upBot(rect, bottom) {
    return bottom > rect.bottom ? { top: rect.top, left: rect.left, right: rect.right, bottom } : rect;
}
function domPosAtCoords(parent, x, y) {
    let closest, closestRect, closestX, closestY;
    let above, below, aboveRect, belowRect;
    for (let child = parent.firstChild; child; child = child.nextSibling) {
        let rects = (0,_dom_js__WEBPACK_IMPORTED_MODULE_4__/* .clientRectsFor */ .kC)(child);
        for (let i = 0; i < rects.length; i++) {
            let rect = rects[i];
            if (closestRect && yOverlap(closestRect, rect))
                rect = upTop(upBot(rect, closestRect.bottom), closestRect.top);
            let dx = getdx(x, rect), dy = getdy(y, rect);
            if (dx == 0 && dy == 0)
                return child.nodeType == 3 ? domPosInText(child, x, y) : domPosAtCoords(child, x, y);
            if (!closest || closestY > dy || closestY == dy && closestX > dx) {
                closest = child;
                closestRect = rect;
                closestX = dx;
                closestY = dy;
            }
            if (dx == 0) {
                if (y > rect.bottom && (!aboveRect || aboveRect.bottom < rect.bottom)) {
                    above = child;
                    aboveRect = rect;
                }
                else if (y < rect.top && (!belowRect || belowRect.top > rect.top)) {
                    below = child;
                    belowRect = rect;
                }
            }
            else if (aboveRect && yOverlap(aboveRect, rect)) {
                aboveRect = upBot(aboveRect, rect.bottom);
            }
            else if (belowRect && yOverlap(belowRect, rect)) {
                belowRect = upTop(belowRect, rect.top);
            }
        }
    }
    if (aboveRect && aboveRect.bottom >= y) {
        closest = above;
        closestRect = aboveRect;
    }
    else if (belowRect && belowRect.top <= y) {
        closest = below;
        closestRect = belowRect;
    }
    if (!closest)
        return { node: parent, offset: 0 };
    let clipX = Math.max(closestRect.left, Math.min(closestRect.right, x));
    if (closest.nodeType == 3)
        return domPosInText(closest, clipX, y);
    if (!closestX && closest.contentEditable == "true")
        return domPosAtCoords(closest, clipX, y);
    let offset = Array.prototype.indexOf.call(parent.childNodes, closest) +
        (x >= (closestRect.left + closestRect.right) / 2 ? 1 : 0);
    return { node: parent, offset };
}
function domPosInText(node, x, y) {
    let len = node.nodeValue.length;
    let closestOffset = -1, closestDY = 1e9, generalSide = 0;
    for (let i = 0; i < len; i++) {
        let rects = (0,_dom_js__WEBPACK_IMPORTED_MODULE_4__/* .textRange */ .IA)(node, i, i + 1).getClientRects();
        for (let j = 0; j < rects.length; j++) {
            let rect = rects[j];
            if (rect.top == rect.bottom)
                continue;
            if (!generalSide)
                generalSide = x - rect.left;
            let dy = (rect.top > y ? rect.top - y : y - rect.bottom) - 1;
            if (rect.left - 1 <= x && rect.right + 1 >= x && dy < closestDY) {
                let right = x >= (rect.left + rect.right) / 2, after = right;
                if (_browser_js__WEBPACK_IMPORTED_MODULE_6__/* ["default"].chrome */ .Z.chrome || _browser_js__WEBPACK_IMPORTED_MODULE_6__/* ["default"].gecko */ .Z.gecko) {
                    // Check for RTL on browsers that support getting client
                    // rects for empty ranges.
                    let rectBefore = (0,_dom_js__WEBPACK_IMPORTED_MODULE_4__/* .textRange */ .IA)(node, i).getBoundingClientRect();
                    if (rectBefore.left == rect.right)
                        after = !right;
                }
                if (dy <= 0)
                    return { node, offset: i + (after ? 1 : 0) };
                closestOffset = i + (after ? 1 : 0);
                closestDY = dy;
            }
        }
    }
    return { node, offset: closestOffset > -1 ? closestOffset : generalSide > 0 ? node.nodeValue.length : 0 };
}
function posAtCoords(view, { x, y }, precise, bias = -1) {
    var _a;
    let content = view.contentDOM.getBoundingClientRect(), docTop = content.top + view.viewState.paddingTop;
    let block, { docHeight } = view.viewState;
    let yOffset = y - docTop;
    if (yOffset < 0)
        return 0;
    if (yOffset > docHeight)
        return view.state.doc.length;
    // Scan for a text block near the queried y position
    for (let halfLine = view.defaultLineHeight / 2, bounced = false;;) {
        block = view.elementAtHeight(yOffset);
        if (block.type == _decoration_js__WEBPACK_IMPORTED_MODULE_1__/* .BlockType.Text */ .kH.Text)
            break;
        for (;;) {
            // Move the y position out of this block
            yOffset = bias > 0 ? block.bottom + halfLine : block.top - halfLine;
            if (yOffset >= 0 && yOffset <= docHeight)
                break;
            // If the document consists entirely of replaced widgets, we
            // won't find a text block, so return 0
            if (bounced)
                return precise ? null : 0;
            bounced = true;
            bias = -bias;
        }
    }
    y = docTop + yOffset;
    let lineStart = block.from;
    // If this is outside of the rendered viewport, we can't determine a position
    if (lineStart < view.viewport.from)
        return view.viewport.from == 0 ? 0 : precise ? null : posAtCoordsImprecise(view, content, block, x, y);
    if (lineStart > view.viewport.to)
        return view.viewport.to == view.state.doc.length ? view.state.doc.length :
            precise ? null : posAtCoordsImprecise(view, content, block, x, y);
    // Prefer ShadowRootOrDocument.elementFromPoint if present, fall back to document if not
    let doc = view.dom.ownerDocument;
    let root = view.root.elementFromPoint ? view.root : doc;
    let element = root.elementFromPoint(x, y);
    if (element && !view.contentDOM.contains(element))
        element = null;
    // If the element is unexpected, clip x at the sides of the content area and try again
    if (!element) {
        x = Math.max(content.left + 1, Math.min(content.right - 1, x));
        element = root.elementFromPoint(x, y);
        if (element && !view.contentDOM.contains(element))
            element = null;
    }
    // There's visible editor content under the point, so we can try
    // using caret(Position|Range)FromPoint as a shortcut
    let node, offset = -1;
    if (element && ((_a = view.docView.nearest(element)) === null || _a === void 0 ? void 0 : _a.isEditable) != false) {
        if (doc.caretPositionFromPoint) {
            let pos = doc.caretPositionFromPoint(x, y);
            if (pos)
                ({ offsetNode: node, offset } = pos);
        }
        else if (doc.caretRangeFromPoint) {
            let range = doc.caretRangeFromPoint(x, y);
            if (range) {
                ;
                ({ startContainer: node, startOffset: offset } = range);
                if (_browser_js__WEBPACK_IMPORTED_MODULE_6__/* ["default"].safari */ .Z.safari && isSuspiciousCaretResult(node, offset, x))
                    node = undefined;
            }
        }
    }
    // No luck, do our own (potentially expensive) search
    if (!node || !view.docView.dom.contains(node)) {
        let line = _blockview_js__WEBPACK_IMPORTED_MODULE_2__/* .LineView.find */ .y.find(view.docView, lineStart);
        if (!line)
            return yOffset > block.top + block.height / 2 ? block.to : block.from;
        ({ node, offset } = domPosAtCoords(line.dom, x, y));
    }
    return view.docView.posFromDOM(node, offset);
}
function posAtCoordsImprecise(view, contentRect, block, x, y) {
    let into = Math.round((x - contentRect.left) * view.defaultCharacterWidth);
    if (view.lineWrapping && block.height > view.defaultLineHeight * 1.5) {
        let line = Math.floor((y - block.top) / view.defaultLineHeight);
        into += line * view.viewState.heightOracle.lineLength;
    }
    let content = view.state.sliceDoc(block.from, block.to);
    return block.from + (0,_state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .findColumn */ .Gz)(content, into, view.state.tabSize);
}
// In case of a high line height, Safari's caretRangeFromPoint treats
// the space between lines as belonging to the last character of the
// line before. This is used to detect such a result so that it can be
// ignored (issue #401).
function isSuspiciousCaretResult(node, offset, x) {
    let len;
    if (node.nodeType != 3 || offset != (len = node.nodeValue.length))
        return false;
    for (let next = node.nextSibling; next; next = next.nextSibling)
        if (next.nodeType != 1 || next.nodeName != "BR")
            return false;
    return (0,_dom_js__WEBPACK_IMPORTED_MODULE_4__/* .textRange */ .IA)(node, len - 1, len).getBoundingClientRect().left > x;
}
function moveToLineBoundary(view, start, forward, includeWrap) {
    let line = view.state.doc.lineAt(start.head);
    let coords = !includeWrap || !view.lineWrapping ? null
        : view.coordsAtPos(start.assoc < 0 && start.head > line.from ? start.head - 1 : start.head);
    if (coords) {
        let editorRect = view.dom.getBoundingClientRect();
        let direction = view.textDirectionAt(line.from);
        let pos = view.posAtCoords({ x: forward == (direction == _bidi_js__WEBPACK_IMPORTED_MODULE_5__/* .Direction.LTR */ .Nm.LTR) ? editorRect.right - 1 : editorRect.left + 1,
            y: (coords.top + coords.bottom) / 2 });
        if (pos != null)
            return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(pos, forward ? -1 : 1);
    }
    let lineView = _blockview_js__WEBPACK_IMPORTED_MODULE_2__/* .LineView.find */ .y.find(view.docView, start.head);
    let end = lineView ? (forward ? lineView.posAtEnd : lineView.posAtStart) : (forward ? line.to : line.from);
    return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(end, forward ? -1 : 1);
}
function moveByChar(view, start, forward, by) {
    let line = view.state.doc.lineAt(start.head), spans = view.bidiSpans(line);
    let direction = view.textDirectionAt(line.from);
    for (let cur = start, check = null;;) {
        let next = (0,_bidi_js__WEBPACK_IMPORTED_MODULE_5__/* .moveVisually */ .z_)(line, spans, direction, cur, forward), char = _bidi_js__WEBPACK_IMPORTED_MODULE_5__/* .movedOver */ .xo;
        if (!next) {
            if (line.number == (forward ? view.state.doc.lines : 1))
                return cur;
            char = "\n";
            line = view.state.doc.line(line.number + (forward ? 1 : -1));
            spans = view.bidiSpans(line);
            next = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(forward ? line.from : line.to);
        }
        if (!check) {
            if (!by)
                return next;
            check = by(char);
        }
        else if (!check(char)) {
            return cur;
        }
        cur = next;
    }
}
function byGroup(view, pos, start) {
    let categorize = view.state.charCategorizer(pos);
    let cat = categorize(start);
    return (next) => {
        let nextCat = categorize(next);
        if (cat == _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .CharCategory.Space */ .D0.Space)
            cat = nextCat;
        return cat == nextCat;
    };
}
function moveVertically(view, start, forward, distance) {
    let startPos = start.head, dir = forward ? 1 : -1;
    if (startPos == (forward ? view.state.doc.length : 0))
        return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(startPos, start.assoc);
    let goal = start.goalColumn, startY;
    let rect = view.contentDOM.getBoundingClientRect();
    let startCoords = view.coordsAtPos(startPos), docTop = view.documentTop;
    if (startCoords) {
        if (goal == null)
            goal = startCoords.left - rect.left;
        startY = dir < 0 ? startCoords.top : startCoords.bottom;
    }
    else {
        let line = view.viewState.lineBlockAt(startPos);
        if (goal == null)
            goal = Math.min(rect.right - rect.left, view.defaultCharacterWidth * (startPos - line.from));
        startY = (dir < 0 ? line.top : line.bottom) + docTop;
    }
    let resolvedGoal = rect.left + goal;
    let dist = distance !== null && distance !== void 0 ? distance : (view.defaultLineHeight >> 1);
    for (let extra = 0;; extra += 10) {
        let curY = startY + (dist + extra) * dir;
        let pos = posAtCoords(view, { x: resolvedGoal, y: curY }, false, dir);
        if (curY < rect.top || curY > rect.bottom || (dir < 0 ? pos < startPos : pos > startPos))
            return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(pos, start.assoc, undefined, goal);
    }
}
function skipAtoms(view, oldPos, pos) {
    let atoms = view.state.facet(_extension_js__WEBPACK_IMPORTED_MODULE_3__/* .atomicRanges */ .JD).map(f => f(view));
    for (;;) {
        let moved = false;
        for (let set of atoms) {
            set.between(pos.from - 1, pos.from + 1, (from, to, value) => {
                if (pos.from > from && pos.from < to) {
                    pos = oldPos.from > pos.from ? _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(from, 1) : _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(to, -1);
                    moved = true;
                }
            });
        }
        if (!moved)
            return pos;
    }
}


/***/ }),

/***/ 22:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HX": () => (/* binding */ addRange),
/* harmony export */   "kH": () => (/* binding */ BlockType),
/* harmony export */   "l9": () => (/* binding */ WidgetType),
/* harmony export */   "p": () => (/* binding */ Decoration),
/* harmony export */   "pB": () => (/* binding */ PointDecoration)
/* harmony export */ });
/* unused harmony exports MarkDecoration, LineDecoration */
/* harmony import */ var _state_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(535);
/* harmony import */ var _attributes_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(96);


/**
 * Widgets added to the content are described by subclasses of this class. Using a description
 * object like that makes it possible to delay creating of the DOM structure for a widget until
 * it is needed, and to avoid redrawing widgets even if the decorations that define them are
 * recreated.
 */
class WidgetType {
    // Compare this instance to another instance of the same type.
    // (TypeScript can't express this, but only instances of the same
    // specific class will be passed to this method.) This is used to
    // avoid redrawing widgets when they are replaced by a new
    // decoration of the same type. The default implementation just
    // returns `false`, which will cause new instances of the widget to
    // always be redrawn.
    eq(widget) { return false; }
    // Update a DOM element created by a widget of the same type (but
    // different, non-`eq` content) to reflect this widget. May return
    // true to indicate that it could update, false to indicate it
    // couldn't (in which case the widget will be redrawn). The default
    // implementation just returns false.
    updateDOM(dom) { return false; }
    // @internal
    compare(other) {
        return this == other || this.constructor == other.constructor && this.eq(other);
    }
    // The estimated height this widget will have, to be used when
    // estimating the height of content that hasn't been drawn. May
    // return -1 to indicate you don't know. The default implementation
    // returns -1.
    get estimatedHeight() { return -1; }
    // Can be used to configure which kinds of events inside the widget
    // should be ignored by the editor. The default is to ignore all
    // events.
    ignoreEvent(event) { return true; }
    // @internal
    get customView() { return null; }
    // This is called when the an instance of the widget is removed
    // from the editor view.
    destroy(dom) { }
}
// The different types of blocks that can occur in an editor view.
var BlockType;
(function (BlockType) {
    // A line of text.
    BlockType[BlockType["Text"] = 0] = "Text";
    // A block widget associated with the position after it.
    BlockType[BlockType["WidgetBefore"] = 1] = "WidgetBefore";
    // A block widget associated with the position before it.
    BlockType[BlockType["WidgetAfter"] = 2] = "WidgetAfter";
    // A block widget [replacing](#view.Decoration^replace) a range of content.
    BlockType[BlockType["WidgetRange"] = 3] = "WidgetRange";
})(BlockType || (BlockType = {}));
// A decoration provides information on how to draw or style a piece
// of content. You'll usually use it wrapped in a
// [`Range`](#state.Range), which adds a start and end position.
// @nonabstract
class Decoration extends _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .RangeValue */ .uU {
    constructor(
    // @internal
    startSide, 
    // @internal
    endSide, 
    // @internal
    widget, 
    // The config object used to create this decoration. You can
    // include additional properties in there to store metadata about
    // your decoration.
    spec) {
        super();
        this.startSide = startSide;
        this.endSide = endSide;
        this.widget = widget;
        this.spec = spec;
    }
    // @internal
    get heightRelevant() { return false; }
    // Create a mark decoration, which influences the styling of the
    // content in its range. Nested mark decorations will cause nested
    // DOM elements to be created. Nesting order is determined by
    // precedence of the [facet](#view.EditorView^decorations), with
    // the higher-precedence decorations creating the inner DOM nodes.
    // Such elements are split on line boundaries and on the boundaries
    // of lower-precedence decorations.
    static mark(spec) {
        return new MarkDecoration(spec);
    }
    // Create a widget decoration, which displays a DOM element at the
    // given position.
    static widget(spec) {
        let side = spec.side || 0, block = !!spec.block;
        side += block ? (side > 0 ? 300000000 /* BlockAfter */ : -400000000 /* BlockBefore */) : (side > 0 ? 100000000 /* InlineAfter */ : -100000000 /* InlineBefore */);
        return new PointDecoration(spec, side, side, block, spec.widget || null, false);
    }
    // Create a replace decoration which replaces the given range with
    // a widget, or simply hides it.
    static replace(spec) {
        let block = !!spec.block, startSide, endSide;
        if (spec.isBlockGap) {
            startSide = -500000000 /* GapStart */;
            endSide = 400000000 /* GapEnd */;
        }
        else {
            let { start, end } = getInclusive(spec, block);
            startSide = (start ? (block ? -300000000 /* BlockIncStart */ : -1 /* InlineIncStart */) : 500000000 /* NonIncStart */) - 1;
            endSide = (end ? (block ? 200000000 /* BlockIncEnd */ : 1 /* InlineIncEnd */) : -600000000 /* NonIncEnd */) + 1;
        }
        return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
    }
    // Create a line decoration, which can add DOM attributes to the
    // line starting at the given position.
    static line(spec) {
        return new LineDecoration(spec);
    }
    // Build a [`DecorationSet`](#view.DecorationSet) from the given
    // decorated range or ranges. If the ranges aren't already sorted,
    // pass `true` for `sort` to make the library sort them for you.
    static set(of, sort = false) {
        return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .RangeSet.of */ .Xs.of(of, sort);
    }
    // @internal
    hasHeight() { return this.widget ? this.widget.estimatedHeight > -1 : false; }
}
// The empty set of decorations.
Decoration.none = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .RangeSet.empty */ .Xs.empty;
class MarkDecoration extends Decoration {
    constructor(spec) {
        let { start, end } = getInclusive(spec);
        super(start ? -1 /* InlineIncStart */ : 500000000 /* NonIncStart */, end ? 1 /* InlineIncEnd */ : -600000000 /* NonIncEnd */, null, spec);
        this.tagName = spec.tagName || "span";
        this.class = spec.class || "";
        this.attrs = spec.attributes || null;
    }
    eq(other) {
        return this == other ||
            other instanceof MarkDecoration &&
                this.tagName == other.tagName &&
                this.class == other.class &&
                (0,_attributes_js__WEBPACK_IMPORTED_MODULE_1__/* .attrsEq */ .o4)(this.attrs, other.attrs);
    }
    range(from, to = from) {
        if (from >= to)
            throw new RangeError("Mark decorations may not be empty");
        return super.range(from, to);
    }
}
MarkDecoration.prototype.point = false;
class LineDecoration extends Decoration {
    constructor(spec) {
        super(-200000000 /* Line */, -200000000 /* Line */, null, spec);
    }
    eq(other) {
        return other instanceof LineDecoration && (0,_attributes_js__WEBPACK_IMPORTED_MODULE_1__/* .attrsEq */ .o4)(this.spec.attributes, other.spec.attributes);
    }
    range(from, to = from) {
        if (to != from)
            throw new RangeError("Line decoration ranges must be zero-length");
        return super.range(from, to);
    }
}
LineDecoration.prototype.mapMode = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .MapMode.TrackBefore */ .gc.TrackBefore;
LineDecoration.prototype.point = true;
class PointDecoration extends Decoration {
    constructor(spec, startSide, endSide, block, widget, isReplace) {
        super(startSide, endSide, widget, spec);
        this.block = block;
        this.isReplace = isReplace;
        this.mapMode = !block ? _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .MapMode.TrackDel */ .gc.TrackDel : startSide <= 0 ? _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .MapMode.TrackBefore */ .gc.TrackBefore : _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .MapMode.TrackAfter */ .gc.TrackAfter;
    }
    // Only relevant when this.block == true
    get type() {
        return this.startSide < this.endSide ? BlockType.WidgetRange
            : this.startSide <= 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
    }
    get heightRelevant() { return this.block || !!this.widget && this.widget.estimatedHeight >= 5; }
    eq(other) {
        return other instanceof PointDecoration &&
            widgetsEq(this.widget, other.widget) &&
            this.block == other.block &&
            this.startSide == other.startSide && this.endSide == other.endSide;
    }
    range(from, to = from) {
        if (this.isReplace && (from > to || (from == to && this.startSide > 0 && this.endSide <= 0)))
            throw new RangeError("Invalid range for replacement decoration");
        if (!this.isReplace && to != from)
            throw new RangeError("Widget decorations can only have zero-length ranges");
        return super.range(from, to);
    }
}
PointDecoration.prototype.point = true;
function getInclusive(spec, block = false) {
    let { inclusiveStart: start, inclusiveEnd: end } = spec;
    if (start == null)
        start = spec.inclusive;
    if (end == null)
        end = spec.inclusive;
    return { start: start !== null && start !== void 0 ? start : block, end: end !== null && end !== void 0 ? end : block };
}
function widgetsEq(a, b) {
    return a == b || !!(a && b && a.compare(b));
}
function addRange(from, to, ranges, margin = 0) {
    let last = ranges.length - 1;
    if (last >= 0 && ranges[last] + margin >= from)
        ranges[last] = Math.max(ranges[last], to);
    else
        ranges.push(from, to);
}


/***/ }),

/***/ 604:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ED": () => (/* binding */ focusPreventScroll),
/* harmony export */   "IA": () => (/* binding */ textRange),
/* harmony export */   "Mf": () => (/* binding */ getSelection),
/* harmony export */   "VQ": () => (/* binding */ scrollRectIntoView),
/* harmony export */   "_s": () => (/* binding */ flattenRect),
/* harmony export */   "ah": () => (/* binding */ isEquivalentPosition),
/* harmony export */   "bD": () => (/* binding */ maxOffset),
/* harmony export */   "iO": () => (/* binding */ clearAttributes),
/* harmony export */   "jB": () => (/* binding */ deepActiveElement),
/* harmony export */   "kC": () => (/* binding */ clientRectsFor),
/* harmony export */   "ku": () => (/* binding */ Rect0),
/* harmony export */   "mL": () => (/* binding */ dispatchKey),
/* harmony export */   "r3": () => (/* binding */ contains),
/* harmony export */   "u0": () => (/* binding */ domIndex),
/* harmony export */   "we": () => (/* binding */ DOMSelectionState),
/* harmony export */   "yF": () => (/* binding */ hasSelection),
/* harmony export */   "yj": () => (/* binding */ getRoot)
/* harmony export */ });
function getSelection(root) {
    let target;
    // Browsers differ on whether shadow roots have a getSelection method.
    // If it exists, use that, otherwise, call it on the document.
    if (root.nodeType == 11) { // Shadow root
        target = root.getSelection ? root : root.ownerDocument;
    }
    else {
        target = root;
    }
    return target.getSelection();
}
function contains(dom, node) {
    return node ? dom == node || dom.contains(node.nodeType != 1 ? node.parentNode : node) : false;
}
function deepActiveElement() {
    let elt = document.activeElement;
    while (elt && elt.shadowRoot)
        elt = elt.shadowRoot.activeElement;
    return elt;
}
function hasSelection(dom, selection) {
    if (!selection.anchorNode)
        return false;
    try {
        // Firefox will raise 'permission denied' errors when accessing
        // properties of `sel.anchorNode` when it's in a generated CSS
        // element.
        return contains(dom, selection.anchorNode);
    }
    catch (_) {
        return false;
    }
}
function clientRectsFor(dom) {
    if (dom.nodeType == 3)
        return textRange(dom, 0, dom.nodeValue.length).getClientRects();
    else if (dom.nodeType == 1)
        return dom.getClientRects();
    else
        return [];
}
// Scans forward and backward through DOM positions equivalent to the
// given one to see if the two are in the same place (i.e. after a
// text node vs at the end of that text node)
function isEquivalentPosition(node, off, targetNode, targetOff) {
    return targetNode ? (scanFor(node, off, targetNode, targetOff, -1) ||
        scanFor(node, off, targetNode, targetOff, 1)) : false;
}
function domIndex(node) {
    for (var index = 0;; index++) {
        node = node.previousSibling;
        if (!node)
            return index;
    }
}
function scanFor(node, off, targetNode, targetOff, dir) {
    for (;;) {
        if (node == targetNode && off == targetOff)
            return true;
        if (off == (dir < 0 ? 0 : maxOffset(node))) {
            if (node.nodeName == "DIV")
                return false;
            let parent = node.parentNode;
            if (!parent || parent.nodeType != 1)
                return false;
            off = domIndex(node) + (dir < 0 ? 0 : 1);
            node = parent;
        }
        else if (node.nodeType == 1) {
            node = node.childNodes[off + (dir < 0 ? -1 : 0)];
            if (node.nodeType == 1 && node.contentEditable == "false")
                return false;
            off = dir < 0 ? maxOffset(node) : 0;
        }
        else {
            return false;
        }
    }
}
function maxOffset(node) {
    return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
}
const Rect0 = { left: 0, right: 0, top: 0, bottom: 0 };
function flattenRect(rect, left) {
    let x = left ? rect.left : rect.right;
    return { left: x, right: x, top: rect.top, bottom: rect.bottom };
}
function windowRect(win) {
    return { left: 0, right: win.innerWidth,
        top: 0, bottom: win.innerHeight };
}
function scrollRectIntoView(dom, rect, side, x, y, xMargin, yMargin, ltr) {
    let doc = dom.ownerDocument, win = doc.defaultView;
    for (let cur = dom; cur;) {
        if (cur.nodeType == 1) { // Element
            let bounding, top = cur == doc.body;
            if (top) {
                bounding = windowRect(win);
            }
            else {
                if (cur.scrollHeight <= cur.clientHeight && cur.scrollWidth <= cur.clientWidth) {
                    cur = cur.parentNode;
                    continue;
                }
                let rect = cur.getBoundingClientRect();
                // Make sure scrollbar width isn't included in the rectangle
                bounding = { left: rect.left, right: rect.left + cur.clientWidth,
                    top: rect.top, bottom: rect.top + cur.clientHeight };
            }
            let moveX = 0, moveY = 0;
            if (y == "nearest") {
                if (rect.top < bounding.top) {
                    moveY = -(bounding.top - rect.top + yMargin);
                    if (side > 0 && rect.bottom > bounding.bottom + moveY)
                        moveY = rect.bottom - bounding.bottom + moveY + yMargin;
                }
                else if (rect.bottom > bounding.bottom) {
                    moveY = rect.bottom - bounding.bottom + yMargin;
                    if (side < 0 && (rect.top - moveY) < bounding.top)
                        moveY = -(bounding.top + moveY - rect.top + yMargin);
                }
            }
            else {
                let rectHeight = rect.bottom - rect.top, boundingHeight = bounding.bottom - bounding.top;
                let targetTop = y == "center" && rectHeight <= boundingHeight ? rect.top + rectHeight / 2 - boundingHeight / 2 :
                    y == "start" || y == "center" && side < 0 ? rect.top - yMargin :
                        rect.bottom - boundingHeight + yMargin;
                moveY = targetTop - bounding.top;
            }
            if (x == "nearest") {
                if (rect.left < bounding.left) {
                    moveX = -(bounding.left - rect.left + xMargin);
                    if (side > 0 && rect.right > bounding.right + moveX)
                        moveX = rect.right - bounding.right + moveX + xMargin;
                }
                else if (rect.right > bounding.right) {
                    moveX = rect.right - bounding.right + xMargin;
                    if (side < 0 && rect.left < bounding.left + moveX)
                        moveX = -(bounding.left + moveX - rect.left + xMargin);
                }
            }
            else {
                let targetLeft = x == "center" ? rect.left + (rect.right - rect.left) / 2 - (bounding.right - bounding.left) / 2 :
                    (x == "start") == ltr ? rect.left - xMargin :
                        rect.right - (bounding.right - bounding.left) + xMargin;
                moveX = targetLeft - bounding.left;
            }
            if (moveX || moveY) {
                if (top) {
                    win.scrollBy(moveX, moveY);
                }
                else {
                    if (moveY) {
                        let start = cur.scrollTop;
                        cur.scrollTop += moveY;
                        moveY = cur.scrollTop - start;
                    }
                    if (moveX) {
                        let start = cur.scrollLeft;
                        cur.scrollLeft += moveX;
                        moveX = cur.scrollLeft - start;
                    }
                    rect = { left: rect.left - moveX, top: rect.top - moveY,
                        right: rect.right - moveX, bottom: rect.bottom - moveY };
                }
            }
            if (top)
                break;
            cur = cur.assignedSlot || cur.parentNode;
            x = y = "nearest";
        }
        else if (cur.nodeType == 11) { // A shadow root
            cur = cur.host;
        }
        else {
            break;
        }
    }
}
class DOMSelectionState {
    constructor() {
        this.anchorNode = null;
        this.anchorOffset = 0;
        this.focusNode = null;
        this.focusOffset = 0;
    }
    eq(domSel) {
        return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset && this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
    }
    setRange(range) {
        this.set(range.anchorNode, range.anchorOffset, range.focusNode, range.focusOffset);
    }
    set(anchorNode, anchorOffset, focusNode, focusOffset) {
        this.anchorNode = anchorNode;
        this.anchorOffset = anchorOffset;
        this.focusNode = focusNode;
        this.focusOffset = focusOffset;
    }
}
let preventScrollSupported = null;
// Feature-detects support for .focus({preventScroll: true}), and uses a fallback kludge when not supported.
function focusPreventScroll(dom) {
    if (dom.setActive)
        return dom.setActive(); // in IE
    if (preventScrollSupported)
        return dom.focus(preventScrollSupported);
    let stack = [];
    for (let cur = dom; cur; cur = cur.parentNode) {
        stack.push(cur, cur.scrollTop, cur.scrollLeft);
        if (cur == cur.ownerDocument)
            break;
    }
    dom.focus(preventScrollSupported == null ? {
        get preventScroll() {
            preventScrollSupported = { preventScroll: true };
            return true;
        }
    } : undefined);
    if (!preventScrollSupported) {
        preventScrollSupported = false;
        for (let i = 0; i < stack.length;) {
            let elt = stack[i++], top = stack[i++], left = stack[i++];
            if (elt.scrollTop != top)
                elt.scrollTop = top;
            if (elt.scrollLeft != left)
                elt.scrollLeft = left;
        }
    }
}
let scratchRange;
function textRange(node, from, to = from) {
    let range = scratchRange || (scratchRange = document.createRange());
    range.setEnd(node, to);
    range.setStart(node, from);
    return range;
}
function dispatchKey(elt, name, code) {
    let options = { key: name, code: name, keyCode: code, which: code, cancelable: true };
    let down = new KeyboardEvent("keydown", options);
    down.synthetic = true;
    elt.dispatchEvent(down);
    let up = new KeyboardEvent("keyup", options);
    up.synthetic = true;
    elt.dispatchEvent(up);
    return down.defaultPrevented || up.defaultPrevented;
}
function getRoot(node) {
    while (node) {
        if (node && (node.nodeType == 9 || node.nodeType == 11 && node.host))
            return node;
        node = node.assignedSlot || node.parentNode;
    }
    return null;
}
function clearAttributes(node) {
    while (node.attributes.length)
        node.removeAttributeNode(node.attributes[0]);
}


/***/ }),

/***/ 33:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "t": () => (/* binding */ EditorView)
});

// EXTERNAL MODULE: ./sys/public/js/editor/dist/state/index.js + 12 modules
var dist_state = __webpack_require__(535);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/utils/style-mod.js
var style_mod = __webpack_require__(245);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/contentview.js
var contentview = __webpack_require__(72);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/blockview.js
var blockview = __webpack_require__(396);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/inlineview.js
var inlineview = __webpack_require__(603);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/decoration.js
var decoration = __webpack_require__(22);
;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/buildview.js




class ContentBuilder {
    constructor(doc, pos, end, disallowBlockEffectsFor) {
        this.doc = doc;
        this.pos = pos;
        this.end = end;
        this.disallowBlockEffectsFor = disallowBlockEffectsFor;
        this.content = [];
        this.curLine = null;
        this.breakAtStart = 0;
        this.pendingBuffer = 0 /* No */;
        // Set to false directly after a widget that covers the position after it
        this.atCursorPos = true;
        this.openStart = -1;
        this.openEnd = -1;
        this.text = "";
        this.textOff = 0;
        this.cursor = doc.iter();
        this.skip = pos;
    }
    posCovered() {
        if (this.content.length == 0)
            return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
        let last = this.content[this.content.length - 1];
        return !last.breakAfter && !(last instanceof blockview/* BlockWidgetView */.d && last.type == decoration/* BlockType.WidgetBefore */.kH.WidgetBefore);
    }
    getLine() {
        if (!this.curLine) {
            this.content.push(this.curLine = new blockview/* LineView */.y);
            this.atCursorPos = true;
        }
        return this.curLine;
    }
    flushBuffer(active) {
        if (this.pendingBuffer) {
            this.curLine.append(wrapMarks(new inlineview/* WidgetBufferView */.kV(-1), active), active.length);
            this.pendingBuffer = 0 /* No */;
        }
    }
    addBlockWidget(view) {
        this.flushBuffer([]);
        this.curLine = null;
        this.content.push(view);
    }
    finish(openEnd) {
        if (!openEnd)
            this.flushBuffer([]);
        else
            this.pendingBuffer = 0 /* No */;
        if (!this.posCovered())
            this.getLine();
    }
    buildText(length, active, openStart) {
        while (length > 0) {
            if (this.textOff == this.text.length) {
                let { value, lineBreak, done } = this.cursor.next(this.skip);
                this.skip = 0;
                if (done)
                    throw new Error("Ran out of text content when drawing inline views");
                if (lineBreak) {
                    if (!this.posCovered())
                        this.getLine();
                    if (this.content.length)
                        this.content[this.content.length - 1].breakAfter = 1;
                    else
                        this.breakAtStart = 1;
                    this.flushBuffer([]);
                    this.curLine = null;
                    length--;
                    continue;
                }
                else {
                    this.text = value;
                    this.textOff = 0;
                }
            }
            let take = Math.min(this.text.length - this.textOff, length, 512 /* Chunk */);
            this.flushBuffer(active.slice(0, openStart));
            this.getLine().append(wrapMarks(new inlineview/* TextView */.yS(this.text.slice(this.textOff, this.textOff + take)), active), openStart);
            this.atCursorPos = true;
            this.textOff += take;
            length -= take;
            openStart = 0;
        }
    }
    span(from, to, active, openStart) {
        this.buildText(to - from, active, openStart);
        this.pos = to;
        if (this.openStart < 0)
            this.openStart = openStart;
    }
    point(from, to, deco, active, openStart, index) {
        if (this.disallowBlockEffectsFor[index] && deco instanceof decoration/* PointDecoration */.pB) {
            if (deco.block)
                throw new RangeError("Block decorations may not be specified via plugins");
            if (to > this.doc.lineAt(this.pos).to)
                throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
        }
        let len = to - from;
        if (deco instanceof decoration/* PointDecoration */.pB) {
            if (deco.block) {
                let { type } = deco;
                if (type == decoration/* BlockType.WidgetAfter */.kH.WidgetAfter && !this.posCovered())
                    this.getLine();
                this.addBlockWidget(new blockview/* BlockWidgetView */.d(deco.widget || new NullWidget("div"), len, type));
            }
            else {
                let view = inlineview/* WidgetView.create */.Lf.create(deco.widget || new NullWidget("span"), len, deco.startSide);
                let cursorBefore = this.atCursorPos && !view.isEditable && openStart <= active.length && (from < to || deco.startSide > 0);
                let cursorAfter = !view.isEditable && (from < to || deco.startSide <= 0);
                let line = this.getLine();
                if (this.pendingBuffer == 2 /* IfCursor */ && !cursorBefore)
                    this.pendingBuffer = 0 /* No */;
                this.flushBuffer(active);
                if (cursorBefore) {
                    line.append(wrapMarks(new inlineview/* WidgetBufferView */.kV(1), active), openStart);
                    openStart = active.length + Math.max(0, openStart - active.length);
                }
                line.append(wrapMarks(view, active), openStart);
                this.atCursorPos = cursorAfter;
                this.pendingBuffer = !cursorAfter ? 0 /* No */ : from < to ? 1 /* Yes */ : 2 /* IfCursor */;
            }
        }
        else if (this.doc.lineAt(this.pos).from == this.pos) { // Line decoration
            this.getLine().addLineDeco(deco);
        }
        if (len) {
            // Advance the iterator past the replaced content
            if (this.textOff + len <= this.text.length) {
                this.textOff += len;
            }
            else {
                this.skip += len - (this.text.length - this.textOff);
                this.text = "";
                this.textOff = 0;
            }
            this.pos = to;
        }
        if (this.openStart < 0)
            this.openStart = openStart;
    }
    static build(text, from, to, decorations, dynamicDecorationMap) {
        let builder = new ContentBuilder(text, from, to, dynamicDecorationMap);
        builder.openEnd = dist_state/* RangeSet.spans */.Xs.spans(decorations, from, to, builder);
        if (builder.openStart < 0)
            builder.openStart = builder.openEnd;
        builder.finish(builder.openEnd);
        return builder;
    }
}
function wrapMarks(view, active) {
    for (let mark of active)
        view = new inlineview/* MarkView */.WR(mark, [view], view.length);
    return view;
}
class NullWidget extends decoration/* WidgetType */.l9 {
    constructor(tag) {
        super();
        this.tag = tag;
    }
    eq(other) { return other.tag == this.tag; }
    toDOM() { return document.createElement(this.tag); }
    updateDOM(elt) { return elt.nodeName.toLowerCase() == this.tag; }
}

// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/browser.js
var browser = __webpack_require__(362);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/dom.js
var view_dom = __webpack_require__(604);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/extension.js
var extension = __webpack_require__(179);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/bidi.js
var bidi = __webpack_require__(456);
;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/domreader.js


const LineBreakPlaceholder = "\uffff";
class DOMReader {
    constructor(points, state) {
        this.points = points;
        this.text = "";
        this.lineSeparator = state.facet(dist_state/* EditorState.lineSeparator */.yy.lineSeparator);
    }
    append(text) {
        this.text += text;
    }
    lineBreak() {
        this.text += LineBreakPlaceholder;
    }
    readRange(start, end) {
        if (!start)
            return this;
        let parent = start.parentNode;
        for (let cur = start;;) {
            this.findPointBefore(parent, cur);
            this.readNode(cur);
            let next = cur.nextSibling;
            if (next == end)
                break;
            let view = contentview/* ContentView.get */.Cl.get(cur), nextView = contentview/* ContentView.get */.Cl.get(next);
            if (view && nextView ? view.breakAfter :
                (view ? view.breakAfter : isBlockElement(cur)) ||
                    (isBlockElement(next) && (cur.nodeName != "BR" || cur.cmIgnore)))
                this.lineBreak();
            cur = next;
        }
        this.findPointBefore(parent, end);
        return this;
    }
    readTextNode(node) {
        let text = node.nodeValue;
        for (let point of this.points)
            if (point.node == node)
                point.pos = this.text.length + Math.min(point.offset, text.length);
        for (let off = 0, re = this.lineSeparator ? null : /\r\n?|\n/g;;) {
            let nextBreak = -1, breakSize = 1, m;
            if (this.lineSeparator) {
                nextBreak = text.indexOf(this.lineSeparator, off);
                breakSize = this.lineSeparator.length;
            }
            else if (m = re.exec(text)) {
                nextBreak = m.index;
                breakSize = m[0].length;
            }
            this.append(text.slice(off, nextBreak < 0 ? text.length : nextBreak));
            if (nextBreak < 0)
                break;
            this.lineBreak();
            if (breakSize > 1)
                for (let point of this.points)
                    if (point.node == node && point.pos > this.text.length)
                        point.pos -= breakSize - 1;
            off = nextBreak + breakSize;
        }
    }
    readNode(node) {
        if (node.cmIgnore)
            return;
        let view = contentview/* ContentView.get */.Cl.get(node);
        let fromView = view && view.overrideDOMText;
        if (fromView != null) {
            this.findPointInside(node, fromView.length);
            for (let i = fromView.iter(); !i.next().done;) {
                if (i.lineBreak)
                    this.lineBreak();
                else
                    this.append(i.value);
            }
        }
        else if (node.nodeType == 3) {
            this.readTextNode(node);
        }
        else if (node.nodeName == "BR") {
            if (node.nextSibling)
                this.lineBreak();
        }
        else if (node.nodeType == 1) {
            this.readRange(node.firstChild, null);
        }
    }
    findPointBefore(node, next) {
        for (let point of this.points)
            if (point.node == node && node.childNodes[point.offset] == next)
                point.pos = this.text.length;
    }
    findPointInside(node, maxLen) {
        for (let point of this.points)
            if (node.nodeType == 3 ? point.node == node : node.contains(point.node))
                point.pos = this.text.length + Math.min(maxLen, point.offset);
    }
}
function isBlockElement(node) {
    return node.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
}
class DOMPoint {
    constructor(node, offset) {
        this.node = node;
        this.offset = offset;
        this.pos = -1;
    }
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/docview.js











class DocView extends contentview/* ContentView */.Cl {
    constructor(view) {
        super();
        this.view = view;
        this.compositionDeco = decoration/* Decoration.none */.p.none;
        this.decorations = [];
        this.dynamicDecorationMap = [];
        // Track a minimum width for the editor. When measuring sizes in
        // measureVisibleLineHeights, this is updated to point at the width
        // of a given element and its extent in the document. When a change
        // happens in that range, these are reset. That way, once we've seen
        // a line/element of a given length, we keep the editor wide enough
        // to fit at least that element, until it is changed, at which point
        // we forget it again.
        this.minWidth = 0;
        this.minWidthFrom = 0;
        this.minWidthTo = 0;
        // Track whether the DOM selection was set in a lossy way, so that
        // we don't mess it up when reading it back it
        this.impreciseAnchor = null;
        this.impreciseHead = null;
        this.forceSelection = false;
        // Used by the resize observer to ignore resizes that we caused
        // ourselves
        this.lastUpdate = Date.now();
        this.setDOM(view.contentDOM);
        this.children = [new blockview/* LineView */.y];
        this.children[0].setParent(this);
        this.updateDeco();
        this.updateInner([new extension/* ChangedRange */.Uh(0, 0, 0, view.state.doc.length)], 0);
    }
    get root() { return this.view.root; }
    get editorView() { return this.view; }
    get length() { return this.view.state.doc.length; }
    // Update the document view to a given state. scrollIntoView can be
    // used as a hint to compute a new viewport that includes that
    // position, if we know the editor is going to scroll that position
    // into view.
    update(update) {
        let changedRanges = update.changedRanges;
        if (this.minWidth > 0 && changedRanges.length) {
            if (!changedRanges.every(({ fromA, toA }) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
                this.minWidth = this.minWidthFrom = this.minWidthTo = 0;
            }
            else {
                this.minWidthFrom = update.changes.mapPos(this.minWidthFrom, 1);
                this.minWidthTo = update.changes.mapPos(this.minWidthTo, 1);
            }
        }
        if (this.view.inputState.composing < 0)
            this.compositionDeco = decoration/* Decoration.none */.p.none;
        else if (update.transactions.length || this.dirty)
            this.compositionDeco = computeCompositionDeco(this.view, update.changes);
        // When the DOM nodes around the selection are moved to another
        // parent, Chrome sometimes reports a different selection through
        // getSelection than the one that it actually shows to the user.
        // This forces a selection update when lines are joined to work
        // around that. Issue #54
        if ((browser/* default.ie */.Z.ie || browser/* default.chrome */.Z.chrome) && !this.compositionDeco.size && update &&
            update.state.doc.lines != update.startState.doc.lines)
            this.forceSelection = true;
        let prevDeco = this.decorations, deco = this.updateDeco();
        let decoDiff = findChangedDeco(prevDeco, deco, update.changes);
        changedRanges = extension/* ChangedRange.extendWithRanges */.Uh.extendWithRanges(changedRanges, decoDiff);
        if (this.dirty == 0 /* Not */ && changedRanges.length == 0) {
            return false;
        }
        else {
            this.updateInner(changedRanges, update.startState.doc.length);
            if (update.transactions.length)
                this.lastUpdate = Date.now();
            return true;
        }
    }
    // Used by update and the constructor do perform the actual DOM
    // update
    updateInner(changes, oldLength) {
        this.view.viewState.mustMeasureContent = true;
        this.updateChildren(changes, oldLength);
        let { observer } = this.view;
        observer.ignore(() => {
            // Lock the height during redrawing, since Chrome sometimes
            // messes with the scroll position during DOM mutation (though
            // no relayout is triggered and I cannot imagine how it can
            // recompute the scroll position without a layout)
            this.dom.style.height = this.view.viewState.contentHeight + "px";
            this.dom.style.minWidth = this.minWidth ? this.minWidth + "px" : "";
            // Chrome will sometimes, when DOM mutations occur directly
            // around the selection, get confused and report a different
            // selection from the one it displays (issue #218). This tries
            // to detect that situation.
            let track = browser/* default.chrome */.Z.chrome || browser/* default.ios */.Z.ios ? { node: observer.selectionRange.focusNode, written: false } : undefined;
            this.sync(track);
            this.dirty = 0 /* Not */;
            if (track && (track.written || observer.selectionRange.focusNode != track.node))
                this.forceSelection = true;
            this.dom.style.height = "";
        });
        let gaps = [];
        if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
            for (let child of this.children)
                if (child instanceof blockview/* BlockWidgetView */.d && child.widget instanceof BlockGapWidget)
                    gaps.push(child.dom);
        observer.updateGaps(gaps);
    }
    updateChildren(changes, oldLength) {
        let cursor = this.childCursor(oldLength);
        for (let i = changes.length - 1;; i--) {
            let next = i >= 0 ? changes[i] : null;
            if (!next)
                break;
            let { fromA, toA, fromB, toB } = next;
            let { content, breakAtStart, openStart, openEnd } = ContentBuilder.build(this.view.state.doc, fromB, toB, this.decorations, this.dynamicDecorationMap);
            let { i: toI, off: toOff } = cursor.findPos(toA, 1);
            let { i: fromI, off: fromOff } = cursor.findPos(fromA, -1);
            (0,contentview/* replaceRange */.VO)(this, fromI, fromOff, toI, toOff, content, breakAtStart, openStart, openEnd);
        }
    }
    // Sync the DOM selection to this.state.selection
    updateSelection(mustRead = false, fromPointer = false) {
        if (mustRead)
            this.view.observer.readSelectionRange();
        if (!(fromPointer || this.mayControlSelection()) ||
            browser/* default.ios */.Z.ios && this.view.inputState.rapidCompositionStart)
            return;
        let force = this.forceSelection;
        this.forceSelection = false;
        let main = this.view.state.selection.main;
        // FIXME need to handle the case where the selection falls inside a block range
        let anchor = this.domAtPos(main.anchor);
        let head = main.empty ? anchor : this.domAtPos(main.head);
        // Always reset on Firefox when next to an uneditable node to
        // avoid invisible cursor bugs (#111)
        if (browser/* default.gecko */.Z.gecko && main.empty && betweenUneditable(anchor)) {
            let dummy = document.createTextNode("");
            this.view.observer.ignore(() => anchor.node.insertBefore(dummy, anchor.node.childNodes[anchor.offset] || null));
            anchor = head = new contentview/* DOMPos */.Y4(dummy, 0);
            force = true;
        }
        let domSel = this.view.observer.selectionRange;
        // If the selection is already here, or in an equivalent position, don't touch it
        if (force || !domSel.focusNode ||
            !(0,view_dom/* isEquivalentPosition */.ah)(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) ||
            !(0,view_dom/* isEquivalentPosition */.ah)(head.node, head.offset, domSel.focusNode, domSel.focusOffset)) {
            this.view.observer.ignore(() => {
                // Chrome Android will hide the virtual keyboard when tapping
                // inside an uneditable node, and not bring it back when we
                // move the cursor to its proper position. This tries to
                // restore the keyboard by cycling focus.
                if (browser/* default.android */.Z.android && browser/* default.chrome */.Z.chrome && this.dom.contains(domSel.focusNode) &&
                    inUneditable(domSel.focusNode, this.dom)) {
                    this.dom.blur();
                    this.dom.focus({ preventScroll: true });
                }
                let rawSel = (0,view_dom/* getSelection */.Mf)(this.root);
                if (main.empty) {
                    // Work around https://bugzilla.mozilla.org/show_bug.cgi?id=1612076
                    if (browser/* default.gecko */.Z.gecko) {
                        let nextTo = nextToUneditable(anchor.node, anchor.offset);
                        if (nextTo && nextTo != (1 /* Before */ | 2 /* After */)) {
                            let text = nearbyTextNode(anchor.node, anchor.offset, nextTo == 1 /* Before */ ? 1 : -1);
                            if (text)
                                anchor = new contentview/* DOMPos */.Y4(text, nextTo == 1 /* Before */ ? 0 : text.nodeValue.length);
                        }
                    }
                    rawSel.collapse(anchor.node, anchor.offset);
                    if (main.bidiLevel != null && domSel.cursorBidiLevel != null)
                        domSel.cursorBidiLevel = main.bidiLevel;
                }
                else if (rawSel.extend) {
                    // Selection.extend can be used to create an 'inverted' selection
                    // (one where the focus is before the anchor), but not all
                    // browsers support it yet.
                    rawSel.collapse(anchor.node, anchor.offset);
                    rawSel.extend(head.node, head.offset);
                }
                else {
                    // Primitive (IE) way
                    let range = document.createRange();
                    if (main.anchor > main.head)
                        [anchor, head] = [head, anchor];
                    range.setEnd(head.node, head.offset);
                    range.setStart(anchor.node, anchor.offset);
                    rawSel.removeAllRanges();
                    rawSel.addRange(range);
                }
            });
            this.view.observer.setSelectionRange(anchor, head);
        }
        this.impreciseAnchor = anchor.precise ? null : new contentview/* DOMPos */.Y4(domSel.anchorNode, domSel.anchorOffset);
        this.impreciseHead = head.precise ? null : new contentview/* DOMPos */.Y4(domSel.focusNode, domSel.focusOffset);
    }
    enforceCursorAssoc() {
        if (this.compositionDeco.size)
            return;
        let cursor = this.view.state.selection.main;
        let sel = (0,view_dom/* getSelection */.Mf)(this.root);
        if (!cursor.empty || !cursor.assoc || !sel.modify)
            return;
        let line = blockview/* LineView.find */.y.find(this, cursor.head);
        if (!line)
            return;
        let lineStart = line.posAtStart;
        if (cursor.head == lineStart || cursor.head == lineStart + line.length)
            return;
        let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
        if (!before || !after || before.bottom > after.top)
            return;
        let dom = this.domAtPos(cursor.head + cursor.assoc);
        sel.collapse(dom.node, dom.offset);
        sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
    }
    mayControlSelection() {
        return this.view.state.facet(extension/* editable */.Ah) ? this.root.activeElement == this.dom
            : (0,view_dom/* hasSelection */.yF)(this.dom, this.view.observer.selectionRange);
    }
    nearest(dom) {
        for (let cur = dom; cur;) {
            let domView = contentview/* ContentView.get */.Cl.get(cur);
            if (domView && domView.rootView == this)
                return domView;
            cur = cur.parentNode;
        }
        return null;
    }
    posFromDOM(node, offset) {
        let view = this.nearest(node);
        if (!view)
            throw new RangeError("Trying to find position for a DOM position outside of the document");
        return view.localPosFromDOM(node, offset) + view.posAtStart;
    }
    domAtPos(pos) {
        let { i, off } = this.childCursor().findPos(pos, -1);
        for (; i < this.children.length - 1;) {
            let child = this.children[i];
            if (off < child.length || child instanceof blockview/* LineView */.y)
                break;
            i++;
            off = 0;
        }
        return this.children[i].domAtPos(off);
    }
    coordsAt(pos, side) {
        for (let off = this.length, i = this.children.length - 1;; i--) {
            let child = this.children[i], start = off - child.breakAfter - child.length;
            if (pos > start ||
                (pos == start && child.type != decoration/* BlockType.WidgetBefore */.kH.WidgetBefore && child.type != decoration/* BlockType.WidgetAfter */.kH.WidgetAfter &&
                    (!i || side == 2 || this.children[i - 1].breakAfter ||
                        (this.children[i - 1].type == decoration/* BlockType.WidgetBefore */.kH.WidgetBefore && side > -2))))
                return child.coordsAt(pos - start, side);
            off = start;
        }
    }
    measureVisibleLineHeights(viewport) {
        let result = [], { from, to } = viewport;
        let contentWidth = this.view.contentDOM.clientWidth;
        let isWider = contentWidth > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
        let widest = -1, ltr = this.view.textDirection == bidi/* Direction.LTR */.Nm.LTR;
        for (let pos = 0, i = 0; i < this.children.length; i++) {
            let child = this.children[i], end = pos + child.length;
            if (end > to)
                break;
            if (pos >= from) {
                let childRect = child.dom.getBoundingClientRect();
                result.push(childRect.height);
                if (isWider) {
                    let last = child.dom.lastChild;
                    let rects = last ? (0,view_dom/* clientRectsFor */.kC)(last) : [];
                    if (rects.length) {
                        let rect = rects[rects.length - 1];
                        let width = ltr ? rect.right - childRect.left : childRect.right - rect.left;
                        if (width > widest) {
                            widest = width;
                            this.minWidth = contentWidth;
                            this.minWidthFrom = pos;
                            this.minWidthTo = end;
                        }
                    }
                }
            }
            pos = end + child.breakAfter;
        }
        return result;
    }
    textDirectionAt(pos) {
        let { i } = this.childPos(pos, 1);
        return getComputedStyle(this.children[i].dom).direction == "rtl" ? bidi/* Direction.RTL */.Nm.RTL : bidi/* Direction.LTR */.Nm.LTR;
    }
    measureTextSize() {
        for (let child of this.children) {
            if (child instanceof blockview/* LineView */.y) {
                let measure = child.measureTextSize();
                if (measure)
                    return measure;
            }
        }
        // If no workable line exists, force a layout of a measurable element
        let dummy = document.createElement("div"), lineHeight, charWidth;
        dummy.className = "cm-line";
        dummy.textContent = "abc def ghi jkl mno pqr stu";
        this.view.observer.ignore(() => {
            this.dom.appendChild(dummy);
            let rect = (0,view_dom/* clientRectsFor */.kC)(dummy.firstChild)[0];
            lineHeight = dummy.getBoundingClientRect().height;
            charWidth = rect ? rect.width / 27 : 7;
            dummy.remove();
        });
        return { lineHeight, charWidth };
    }
    childCursor(pos = this.length) {
        // Move back to start of last element when possible, so that
        // `ChildCursor.findPos` doesn't have to deal with the edge case
        // of being after the last element.
        let i = this.children.length;
        if (i)
            pos -= this.children[--i].length;
        return new contentview/* ChildCursor */.T7(this.children, pos, i);
    }
    computeBlockGapDeco() {
        let deco = [], vs = this.view.viewState;
        for (let pos = 0, i = 0;; i++) {
            let next = i == vs.viewports.length ? null : vs.viewports[i];
            let end = next ? next.from - 1 : this.length;
            if (end > pos) {
                let height = vs.lineBlockAt(end).bottom - vs.lineBlockAt(pos).top;
                deco.push(decoration/* Decoration.replace */.p.replace({
                    widget: new BlockGapWidget(height),
                    block: true,
                    inclusive: true,
                    isBlockGap: true,
                }).range(pos, end));
            }
            if (!next)
                break;
            pos = next.to + 1;
        }
        return decoration/* Decoration.set */.p.set(deco);
    }
    updateDeco() {
        let allDeco = this.view.state.facet(extension/* decorations */.ah).map((d, i) => {
            let dynamic = this.dynamicDecorationMap[i] = typeof d == "function";
            return dynamic ? d(this.view) : d;
        });
        for (let i = allDeco.length; i < allDeco.length + 3; i++)
            this.dynamicDecorationMap[i] = false;
        return this.decorations = [
            ...allDeco,
            this.compositionDeco,
            this.computeBlockGapDeco(),
            this.view.viewState.lineGapDeco
        ];
    }
    scrollIntoView(target) {
        let { range } = target;
        let rect = this.coordsAt(range.head, range.empty ? range.assoc : range.head > range.anchor ? -1 : 1), other;
        if (!rect)
            return;
        if (!range.empty && (other = this.coordsAt(range.anchor, range.anchor > range.head ? -1 : 1)))
            rect = { left: Math.min(rect.left, other.left), top: Math.min(rect.top, other.top),
                right: Math.max(rect.right, other.right), bottom: Math.max(rect.bottom, other.bottom) };
        let mLeft = 0, mRight = 0, mTop = 0, mBottom = 0;
        for (let margins of this.view.state.facet(extension/* scrollMargins */.s_).map(f => f(this.view)))
            if (margins) {
                let { left, right, top, bottom } = margins;
                if (left != null)
                    mLeft = Math.max(mLeft, left);
                if (right != null)
                    mRight = Math.max(mRight, right);
                if (top != null)
                    mTop = Math.max(mTop, top);
                if (bottom != null)
                    mBottom = Math.max(mBottom, bottom);
            }
        let targetRect = {
            left: rect.left - mLeft, top: rect.top - mTop,
            right: rect.right + mRight, bottom: rect.bottom + mBottom
        };
        (0,view_dom/* scrollRectIntoView */.VQ)(this.view.scrollDOM, targetRect, range.head < range.anchor ? -1 : 1, target.x, target.y, target.xMargin, target.yMargin, this.view.textDirection == bidi/* Direction.LTR */.Nm.LTR);
    }
}
function betweenUneditable(pos) {
    return pos.node.nodeType == 1 && pos.node.firstChild &&
        (pos.offset == 0 || pos.node.childNodes[pos.offset - 1].contentEditable == "false") &&
        (pos.offset == pos.node.childNodes.length || pos.node.childNodes[pos.offset].contentEditable == "false");
}
class BlockGapWidget extends decoration/* WidgetType */.l9 {
    constructor(height) {
        super();
        this.height = height;
    }
    toDOM() {
        let elt = document.createElement("div");
        this.updateDOM(elt);
        return elt;
    }
    eq(other) { return other.height == this.height; }
    updateDOM(elt) {
        elt.style.height = this.height + "px";
        return true;
    }
    get estimatedHeight() { return this.height; }
}
function compositionSurroundingNode(view) {
    let sel = view.observer.selectionRange;
    let textNode = sel.focusNode && nearbyTextNode(sel.focusNode, sel.focusOffset, 0);
    if (!textNode)
        return null;
    let cView = view.docView.nearest(textNode);
    if (!cView)
        return null;
    if (cView instanceof blockview/* LineView */.y) {
        let topNode = textNode;
        while (topNode.parentNode != cView.dom)
            topNode = topNode.parentNode;
        let prev = topNode.previousSibling;
        while (prev && !contentview/* ContentView.get */.Cl.get(prev))
            prev = prev.previousSibling;
        let pos = prev ? contentview/* ContentView.get */.Cl.get(prev).posAtEnd : cView.posAtStart;
        return { from: pos, to: pos, node: topNode, text: textNode };
    }
    else {
        for (;;) {
            let { parent } = cView;
            if (!parent)
                return null;
            if (parent instanceof blockview/* LineView */.y)
                break;
            cView = parent;
        }
        let from = cView.posAtStart;
        return { from, to: from + cView.length, node: cView.dom, text: textNode };
    }
}
function computeCompositionDeco(view, changes) {
    let surrounding = compositionSurroundingNode(view);
    if (!surrounding)
        return decoration/* Decoration.none */.p.none;
    let { from, to, node, text: textNode } = surrounding;
    let newFrom = changes.mapPos(from, 1), newTo = Math.max(newFrom, changes.mapPos(to, -1));
    let { state } = view, text = node.nodeType == 3 ? node.nodeValue :
        new DOMReader([], state).readRange(node.firstChild, null).text;
    if (newTo - newFrom < text.length) {
        if (state.doc.sliceString(newFrom, Math.min(state.doc.length, newFrom + text.length), LineBreakPlaceholder) == text)
            newTo = newFrom + text.length;
        else if (state.doc.sliceString(Math.max(0, newTo - text.length), newTo, LineBreakPlaceholder) == text)
            newFrom = newTo - text.length;
        else
            return decoration/* Decoration.none */.p.none;
    }
    else if (state.doc.sliceString(newFrom, newTo, LineBreakPlaceholder) != text) {
        return decoration/* Decoration.none */.p.none;
    }
    let topView = contentview/* ContentView.get */.Cl.get(node);
    if (topView instanceof inlineview/* CompositionView */.ve)
        topView = topView.widget.topView;
    else if (topView)
        topView.parent = null;
    return decoration/* Decoration.set */.p.set(decoration/* Decoration.replace */.p.replace({ widget: new CompositionWidget(node, textNode, topView), inclusive: true })
        .range(newFrom, newTo));
}
class CompositionWidget extends decoration/* WidgetType */.l9 {
    constructor(top, text, topView) {
        super();
        this.top = top;
        this.text = text;
        this.topView = topView;
    }
    eq(other) { return this.top == other.top && this.text == other.text; }
    toDOM() { return this.top; }
    ignoreEvent() { return false; }
    get customView() { return inlineview/* CompositionView */.ve; }
}
function nearbyTextNode(node, offset, side) {
    for (;;) {
        if (node.nodeType == 3)
            return node;
        if (node.nodeType == 1 && offset > 0 && side <= 0) {
            node = node.childNodes[offset - 1];
            offset = (0,view_dom/* maxOffset */.bD)(node);
        }
        else if (node.nodeType == 1 && offset < node.childNodes.length && side >= 0) {
            node = node.childNodes[offset];
            offset = 0;
        }
        else {
            return null;
        }
    }
}
function nextToUneditable(node, offset) {
    if (node.nodeType != 1)
        return 0;
    return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 /* Before */ : 0) |
        (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 /* After */ : 0);
}
class DecorationComparator {
    constructor() {
        this.changes = [];
    }
    compareRange(from, to) { (0,decoration/* addRange */.HX)(from, to, this.changes); }
    comparePoint(from, to) { (0,decoration/* addRange */.HX)(from, to, this.changes); }
}
function findChangedDeco(a, b, diff) {
    let comp = new DecorationComparator;
    dist_state/* RangeSet.compare */.Xs.compare(a, b, diff, comp);
    return comp.changes;
}
function inUneditable(node, inside) {
    for (let cur = node; cur && cur != inside; cur = cur.assignedSlot || cur.parentNode) {
        if (cur.nodeType == 1 && cur.contentEditable == 'false') {
            return true;
        }
    }
    return false;
}

// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/input.js
var input = __webpack_require__(516);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/cursor.js
var cursor = __webpack_require__(849);
// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/heightmap.js
var heightmap = __webpack_require__(625);
;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/viewstate.js





function visiblePixelRange(dom, paddingTop) {
    let rect = dom.getBoundingClientRect();
    let left = Math.max(0, rect.left), right = Math.min(innerWidth, rect.right);
    let top = Math.max(0, rect.top), bottom = Math.min(innerHeight, rect.bottom);
    let body = dom.ownerDocument.body;
    for (let parent = dom.parentNode; parent && parent != body;) {
        if (parent.nodeType == 1) {
            let elt = parent;
            let style = window.getComputedStyle(elt);
            if ((elt.scrollHeight > elt.clientHeight || elt.scrollWidth > elt.clientWidth) &&
                style.overflow != "visible") {
                let parentRect = elt.getBoundingClientRect();
                left = Math.max(left, parentRect.left);
                right = Math.min(right, parentRect.right);
                top = Math.max(top, parentRect.top);
                bottom = Math.min(bottom, parentRect.bottom);
            }
            parent = style.position == "absolute" || style.position == "fixed" ? elt.offsetParent : elt.parentNode;
        }
        else if (parent.nodeType == 11) { // Shadow root
            parent = parent.host;
        }
        else {
            break;
        }
    }
    return { left: left - rect.left, right: Math.max(left, right) - rect.left,
        top: top - (rect.top + paddingTop), bottom: Math.max(top, bottom) - (rect.top + paddingTop) };
}
function fullPixelRange(dom, paddingTop) {
    let rect = dom.getBoundingClientRect();
    return { left: 0, right: rect.right - rect.left,
        top: paddingTop, bottom: rect.bottom - (rect.top + paddingTop) };
}
// Line gaps are placeholder widgets used to hide pieces of overlong
// lines within the viewport, as a kludge to keep the editor
// responsive when a ridiculously long line is loaded into it.
class LineGap {
    constructor(from, to, size) {
        this.from = from;
        this.to = to;
        this.size = size;
    }
    static same(a, b) {
        if (a.length != b.length)
            return false;
        for (let i = 0; i < a.length; i++) {
            let gA = a[i], gB = b[i];
            if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
                return false;
        }
        return true;
    }
    draw(wrapping) {
        return decoration/* Decoration.replace */.p.replace({ widget: new LineGapWidget(this.size, wrapping) }).range(this.from, this.to);
    }
}
class LineGapWidget extends decoration/* WidgetType */.l9 {
    constructor(size, vertical) {
        super();
        this.size = size;
        this.vertical = vertical;
    }
    eq(other) { return other.size == this.size && other.vertical == this.vertical; }
    toDOM() {
        let elt = document.createElement("div");
        if (this.vertical) {
            elt.style.height = this.size + "px";
        }
        else {
            elt.style.width = this.size + "px";
            elt.style.height = "2px";
            elt.style.display = "inline-block";
        }
        return elt;
    }
    get estimatedHeight() { return this.vertical ? this.size : -1; }
}
class ViewState {
    constructor(state) {
        this.state = state;
        // These are contentDOM-local coordinates
        this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 };
        this.inView = true;
        this.paddingTop = 0;
        this.paddingBottom = 0;
        this.contentDOMWidth = 0;
        this.contentDOMHeight = 0;
        this.editorHeight = 0;
        this.editorWidth = 0;
        this.heightOracle = new heightmap/* HeightOracle */.eU;
        // See VP.MaxDOMHeight
        this.scaler = IdScaler;
        this.scrollTarget = null;
        // Briefly set to true when printing, to disable viewport limiting
        this.printing = false;
        // Flag set when editor content was redrawn, so that the next measure stage knows it must read DOM layout
        this.mustMeasureContent = true;
        this.defaultTextDirection = bidi/* Direction.RTL */.Nm.RTL;
        this.visibleRanges = [];
        // Cursor 'assoc' is only significant when the cursor is on a line
        // wrap point, where it must stick to the character that it is
        // associated with. Since browsers don't provide a reasonable
        // interface to set or query this, when a selection is set that
        // might cause this to be significant, this flag is set. The next
        // measure phase will check whether the cursor is on a line-wrapping
        // boundary and, if so, reset it to make sure it is positioned in
        // the right place.
        this.mustEnforceCursorAssoc = false;
        this.stateDeco = state.facet(extension/* decorations */.ah).filter(d => typeof d != "function");
        this.heightMap = heightmap/* HeightMap.empty */.uG.empty().applyChanges(this.stateDeco, dist_state/* Text.empty */.xv.empty, this.heightOracle.setDoc(state.doc), [new extension/* ChangedRange */.Uh(0, 0, 0, state.doc.length)]);
        this.viewport = this.getViewport(0, null);
        this.updateViewportLines();
        this.updateForViewport();
        this.lineGaps = this.ensureLineGaps([]);
        this.lineGapDeco = decoration/* Decoration.set */.p.set(this.lineGaps.map(gap => gap.draw(false)));
        this.computeVisibleRanges();
    }
    updateForViewport() {
        let viewports = [this.viewport], { main } = this.state.selection;
        for (let i = 0; i <= 1; i++) {
            let pos = i ? main.head : main.anchor;
            if (!viewports.some(({ from, to }) => pos >= from && pos <= to)) {
                let { from, to } = this.lineBlockAt(pos);
                viewports.push(new Viewport(from, to));
            }
        }
        this.viewports = viewports.sort((a, b) => a.from - b.from);
        this.scaler = this.heightMap.height <= 7000000 /* MaxDOMHeight */ ? IdScaler :
            new BigScaler(this.heightOracle.doc, this.heightMap, this.viewports);
    }
    updateViewportLines() {
        this.viewportLines = [];
        this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.state.doc, 0, 0, block => {
            this.viewportLines.push(this.scaler.scale == 1 ? block : scaleBlock(block, this.scaler));
        });
    }
    update(update, scrollTarget = null) {
        this.state = update.state;
        let prevDeco = this.stateDeco;
        this.stateDeco = this.state.facet(extension/* decorations */.ah).filter(d => typeof d != "function");
        let contentChanges = update.changedRanges;
        let heightChanges = extension/* ChangedRange.extendWithRanges */.Uh.extendWithRanges(contentChanges, (0,heightmap/* heightRelevantDecoChanges */.bs)(prevDeco, this.stateDeco, update ? update.changes : dist_state/* ChangeSet.empty */.as.empty(this.state.doc.length)));
        let prevHeight = this.heightMap.height;
        this.heightMap = this.heightMap.applyChanges(this.stateDeco, update.startState.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
        if (this.heightMap.height != prevHeight)
            update.flags |= 2 /* Height */;
        let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
        if (scrollTarget && (scrollTarget.range.head < viewport.from || scrollTarget.range.head > viewport.to) ||
            !this.viewportIsAppropriate(viewport))
            viewport = this.getViewport(0, scrollTarget);
        let updateLines = !update.changes.empty || (update.flags & 2 /* Height */) ||
            viewport.from != this.viewport.from || viewport.to != this.viewport.to;
        this.viewport = viewport;
        this.updateForViewport();
        if (updateLines)
            this.updateViewportLines();
        if (this.lineGaps.length || this.viewport.to - this.viewport.from > 4000 /* DoubleMargin */)
            this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update.changes)));
        update.flags |= this.computeVisibleRanges();
        if (scrollTarget)
            this.scrollTarget = scrollTarget;
        if (!this.mustEnforceCursorAssoc && update.selectionSet && update.view.lineWrapping &&
            update.state.selection.main.empty && update.state.selection.main.assoc)
            this.mustEnforceCursorAssoc = true;
    }
    measure(view) {
        let dom = view.contentDOM, style = window.getComputedStyle(dom);
        let oracle = this.heightOracle;
        let whiteSpace = style.whiteSpace;
        this.defaultTextDirection = style.direction == "rtl" ? bidi/* Direction.RTL */.Nm.RTL : bidi/* Direction.LTR */.Nm.LTR;
        let refresh = this.heightOracle.mustRefreshForWrapping(whiteSpace);
        let measureContent = refresh || this.mustMeasureContent || this.contentDOMHeight != dom.clientHeight;
        let result = 0, bias = 0;
        if (this.editorWidth != view.scrollDOM.clientWidth) {
            if (oracle.lineWrapping)
                measureContent = true;
            this.editorWidth = view.scrollDOM.clientWidth;
            result |= 8 /* Geometry */;
        }
        if (measureContent) {
            this.mustMeasureContent = false;
            this.contentDOMHeight = dom.clientHeight;
            // Vertical padding
            let paddingTop = parseInt(style.paddingTop) || 0, paddingBottom = parseInt(style.paddingBottom) || 0;
            if (this.paddingTop != paddingTop || this.paddingBottom != paddingBottom) {
                result |= 8 /* Geometry */;
                this.paddingTop = paddingTop;
                this.paddingBottom = paddingBottom;
            }
        }
        // Pixel viewport
        let pixelViewport = (this.printing ? fullPixelRange : visiblePixelRange)(dom, this.paddingTop);
        let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
        this.pixelViewport = pixelViewport;
        let inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
        if (inView != this.inView) {
            this.inView = inView;
            if (inView)
                measureContent = true;
        }
        if (!this.inView)
            return 0;
        let contentWidth = dom.clientWidth;
        if (this.contentDOMWidth != contentWidth || this.editorHeight != view.scrollDOM.clientHeight) {
            this.contentDOMWidth = contentWidth;
            this.editorHeight = view.scrollDOM.clientHeight;
            result |= 8 /* Geometry */;
        }
        if (measureContent) {
            let lineHeights = view.docView.measureVisibleLineHeights(this.viewport);
            if (oracle.mustRefreshForHeights(lineHeights))
                refresh = true;
            if (refresh || oracle.lineWrapping && Math.abs(contentWidth - this.contentDOMWidth) > oracle.charWidth) {
                let { lineHeight, charWidth } = view.docView.measureTextSize();
                refresh = oracle.refresh(whiteSpace, lineHeight, charWidth, contentWidth / charWidth, lineHeights);
                if (refresh) {
                    view.docView.minWidth = 0;
                    result |= 8 /* Geometry */;
                }
            }
            if (dTop > 0 && dBottom > 0)
                bias = Math.max(dTop, dBottom);
            else if (dTop < 0 && dBottom < 0)
                bias = Math.min(dTop, dBottom);
            oracle.heightChanged = false;
            for (let vp of this.viewports) {
                let heights = vp.from == this.viewport.from ? lineHeights : view.docView.measureVisibleLineHeights(vp);
                this.heightMap = this.heightMap.updateHeight(oracle, 0, refresh, new heightmap/* MeasuredHeights */.y_(vp.from, heights));
            }
            if (oracle.heightChanged)
                result |= 2 /* Height */;
        }
        let viewportChange = !this.viewportIsAppropriate(this.viewport, bias) ||
            this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
        if (viewportChange)
            this.viewport = this.getViewport(bias, this.scrollTarget);
        this.updateForViewport();
        if ((result & 2 /* Height */) || viewportChange)
            this.updateViewportLines();
        if (this.lineGaps.length || this.viewport.to - this.viewport.from > 4000 /* DoubleMargin */)
            this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps));
        result |= this.computeVisibleRanges();
        if (this.mustEnforceCursorAssoc) {
            this.mustEnforceCursorAssoc = false;
            // This is done in the read stage, because moving the selection
            // to a line end is going to trigger a layout anyway, so it
            // can't be a pure write. It should be rare that it does any
            // writing.
            view.docView.enforceCursorAssoc();
        }
        return result;
    }
    get visibleTop() { return this.scaler.fromDOM(this.pixelViewport.top); }
    get visibleBottom() { return this.scaler.fromDOM(this.pixelViewport.bottom); }
    getViewport(bias, scrollTarget) {
        // This will divide VP.Margin between the top and the
        // bottom, depending on the bias (the change in viewport position
        // since the last update). It'll hold a number between 0 and 1
        let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1000 /* Margin */ / 2));
        let map = this.heightMap, doc = this.state.doc, { visibleTop, visibleBottom } = this;
        let viewport = new Viewport(map.lineAt(visibleTop - marginTop * 1000 /* Margin */, heightmap/* QueryType.ByHeight */.xL.ByHeight, doc, 0, 0).from, map.lineAt(visibleBottom + (1 - marginTop) * 1000 /* Margin */, heightmap/* QueryType.ByHeight */.xL.ByHeight, doc, 0, 0).to);
        // If scrollTarget is given, make sure the viewport includes that position
        if (scrollTarget) {
            let { head } = scrollTarget.range;
            if (head < viewport.from || head > viewport.to) {
                let viewHeight = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top);
                let block = map.lineAt(head, heightmap/* QueryType.ByPos */.xL.ByPos, doc, 0, 0), topPos;
                if (scrollTarget.y == "center")
                    topPos = (block.top + block.bottom) / 2 - viewHeight / 2;
                else if (scrollTarget.y == "start" || scrollTarget.y == "nearest" && head < viewport.from)
                    topPos = block.top;
                else
                    topPos = block.bottom - viewHeight;
                viewport = new Viewport(map.lineAt(topPos - 1000 /* Margin */ / 2, heightmap/* QueryType.ByHeight */.xL.ByHeight, doc, 0, 0).from, map.lineAt(topPos + viewHeight + 1000 /* Margin */ / 2, heightmap/* QueryType.ByHeight */.xL.ByHeight, doc, 0, 0).to);
            }
        }
        return viewport;
    }
    mapViewport(viewport, changes) {
        let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
        return new Viewport(this.heightMap.lineAt(from, heightmap/* QueryType.ByPos */.xL.ByPos, this.state.doc, 0, 0).from, this.heightMap.lineAt(to, heightmap/* QueryType.ByPos */.xL.ByPos, this.state.doc, 0, 0).to);
    }
    // Checks if a given viewport covers the visible part of the
    // document and not too much beyond that.
    viewportIsAppropriate({ from, to }, bias = 0) {
        if (!this.inView)
            return true;
        let { top } = this.heightMap.lineAt(from, heightmap/* QueryType.ByPos */.xL.ByPos, this.state.doc, 0, 0);
        let { bottom } = this.heightMap.lineAt(to, heightmap/* QueryType.ByPos */.xL.ByPos, this.state.doc, 0, 0);
        let { visibleTop, visibleBottom } = this;
        return (from == 0 || top <= visibleTop - Math.max(10 /* MinCoverMargin */, Math.min(-bias, 250 /* MaxCoverMargin */))) &&
            (to == this.state.doc.length ||
                bottom >= visibleBottom + Math.max(10 /* MinCoverMargin */, Math.min(bias, 250 /* MaxCoverMargin */))) &&
            (top > visibleTop - 2 * 1000 /* Margin */ && bottom < visibleBottom + 2 * 1000 /* Margin */);
    }
    mapLineGaps(gaps, changes) {
        if (!gaps.length || changes.empty)
            return gaps;
        let mapped = [];
        for (let gap of gaps)
            if (!changes.touchesRange(gap.from, gap.to))
                mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size));
        return mapped;
    }
    // Computes positions in the viewport where the start or end of a
    // line should be hidden, trying to reuse existing line gaps when
    // appropriate to avoid unneccesary redraws.
    // Uses crude character-counting for the positioning and sizing,
    // since actual DOM coordinates aren't always available and
    // predictable. Relies on generous margins (see LG.Margin) to hide
    // the artifacts this might produce from the user.
    ensureLineGaps(current) {
        let gaps = [];
        // This won't work at all in predominantly right-to-left text.
        if (this.defaultTextDirection != bidi/* Direction.LTR */.Nm.LTR)
            return gaps;
        for (let line of this.viewportLines) {
            if (line.length < 4000 /* DoubleMargin */)
                continue;
            let structure = lineStructure(line.from, line.to, this.stateDeco);
            if (structure.total < 4000 /* DoubleMargin */)
                continue;
            let viewFrom, viewTo;
            if (this.heightOracle.lineWrapping) {
                let marginHeight = (2000 /* Margin */ / this.heightOracle.lineLength) * this.heightOracle.lineHeight;
                viewFrom = findPosition(structure, (this.visibleTop - line.top - marginHeight) / line.height);
                viewTo = findPosition(structure, (this.visibleBottom - line.top + marginHeight) / line.height);
            }
            else {
                let totalWidth = structure.total * this.heightOracle.charWidth;
                let marginWidth = 2000 /* Margin */ * this.heightOracle.charWidth;
                viewFrom = findPosition(structure, (this.pixelViewport.left - marginWidth) / totalWidth);
                viewTo = findPosition(structure, (this.pixelViewport.right + marginWidth) / totalWidth);
            }
            let outside = [];
            if (viewFrom > line.from)
                outside.push({ from: line.from, to: viewFrom });
            if (viewTo < line.to)
                outside.push({ from: viewTo, to: line.to });
            let sel = this.state.selection.main;
            // Make sure the gaps don't cover a selection end
            if (sel.from >= line.from && sel.from <= line.to)
                cutRange(outside, sel.from - 10 /* SelectionMargin */, sel.from + 10 /* SelectionMargin */);
            if (!sel.empty && sel.to >= line.from && sel.to <= line.to)
                cutRange(outside, sel.to - 10 /* SelectionMargin */, sel.to + 10 /* SelectionMargin */);
            for (let { from, to } of outside)
                if (to - from > 1000 /* HalfMargin */) {
                    gaps.push(find(current, gap => gap.from >= line.from && gap.to <= line.to &&
                        Math.abs(gap.from - from) < 1000 /* HalfMargin */ && Math.abs(gap.to - to) < 1000 /* HalfMargin */) ||
                        new LineGap(from, to, this.gapSize(line, from, to, structure)));
                }
        }
        return gaps;
    }
    gapSize(line, from, to, structure) {
        let fraction = findFraction(structure, to) - findFraction(structure, from);
        if (this.heightOracle.lineWrapping) {
            return line.height * fraction;
        }
        else {
            return structure.total * this.heightOracle.charWidth * fraction;
        }
    }
    updateLineGaps(gaps) {
        if (!LineGap.same(gaps, this.lineGaps)) {
            this.lineGaps = gaps;
            this.lineGapDeco = decoration/* Decoration.set */.p.set(gaps.map(gap => gap.draw(this.heightOracle.lineWrapping)));
        }
    }
    computeVisibleRanges() {
        let deco = this.stateDeco;
        if (this.lineGaps.length)
            deco = deco.concat(this.lineGapDeco);
        let ranges = [];
        dist_state/* RangeSet.spans */.Xs.spans(deco, this.viewport.from, this.viewport.to, {
            span(from, to) { ranges.push({ from, to }); },
            point() { }
        }, 20);
        let changed = ranges.length != this.visibleRanges.length ||
            this.visibleRanges.some((r, i) => r.from != ranges[i].from || r.to != ranges[i].to);
        this.visibleRanges = ranges;
        return changed ? 4 /* Viewport */ : 0;
    }
    lineBlockAt(pos) {
        return (pos >= this.viewport.from && pos <= this.viewport.to && this.viewportLines.find(b => b.from <= pos && b.to >= pos)) ||
            scaleBlock(this.heightMap.lineAt(pos, heightmap/* QueryType.ByPos */.xL.ByPos, this.state.doc, 0, 0), this.scaler);
    }
    lineBlockAtHeight(height) {
        return scaleBlock(this.heightMap.lineAt(this.scaler.fromDOM(height), heightmap/* QueryType.ByHeight */.xL.ByHeight, this.state.doc, 0, 0), this.scaler);
    }
    elementAtHeight(height) {
        return scaleBlock(this.heightMap.blockAt(this.scaler.fromDOM(height), this.state.doc, 0, 0), this.scaler);
    }
    get docHeight() {
        return this.scaler.toDOM(this.heightMap.height);
    }
    get contentHeight() {
        return this.docHeight + this.paddingTop + this.paddingBottom;
    }
}
class Viewport {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}
function lineStructure(from, to, stateDeco) {
    let ranges = [], pos = from, total = 0;
    dist_state/* RangeSet.spans */.Xs.spans(stateDeco, from, to, {
        span() { },
        point(from, to) {
            if (from > pos) {
                ranges.push({ from: pos, to: from });
                total += from - pos;
            }
            pos = to;
        }
    }, 20); // We're only interested in collapsed ranges of a significant size
    if (pos < to) {
        ranges.push({ from: pos, to });
        total += to - pos;
    }
    return { total, ranges };
}
function findPosition({ total, ranges }, ratio) {
    if (ratio <= 0)
        return ranges[0].from;
    if (ratio >= 1)
        return ranges[ranges.length - 1].to;
    let dist = Math.floor(total * ratio);
    for (let i = 0;; i++) {
        let { from, to } = ranges[i], size = to - from;
        if (dist <= size)
            return from + dist;
        dist -= size;
    }
}
function findFraction(structure, pos) {
    let counted = 0;
    for (let { from, to } of structure.ranges) {
        if (pos <= to) {
            counted += pos - from;
            break;
        }
        counted += to - from;
    }
    return counted / structure.total;
}
function cutRange(ranges, from, to) {
    for (let i = 0; i < ranges.length; i++) {
        let r = ranges[i];
        if (r.from < to && r.to > from) {
            let pieces = [];
            if (r.from < from)
                pieces.push({ from: r.from, to: from });
            if (r.to > to)
                pieces.push({ from: to, to: r.to });
            ranges.splice(i, 1, ...pieces);
            i += pieces.length - 1;
        }
    }
}
function find(array, f) {
    for (let val of array)
        if (f(val))
            return val;
    return undefined;
}
// Don't scale when the document height is within the range of what
// the DOM can handle.
const IdScaler = {
    toDOM(n) { return n; },
    fromDOM(n) { return n; },
    scale: 1
};
// When the height is too big (> VP.MaxDOMHeight), scale down the
// regions outside the viewports so that the total height is
// VP.MaxDOMHeight.
class BigScaler {
    constructor(doc, heightMap, viewports) {
        let vpHeight = 0, base = 0, domBase = 0;
        this.viewports = viewports.map(({ from, to }) => {
            let top = heightMap.lineAt(from, heightmap/* QueryType.ByPos */.xL.ByPos, doc, 0, 0).top;
            let bottom = heightMap.lineAt(to, heightmap/* QueryType.ByPos */.xL.ByPos, doc, 0, 0).bottom;
            vpHeight += bottom - top;
            return { from, to, top, bottom, domTop: 0, domBottom: 0 };
        });
        this.scale = (7000000 /* MaxDOMHeight */ - vpHeight) / (heightMap.height - vpHeight);
        for (let obj of this.viewports) {
            obj.domTop = domBase + (obj.top - base) * this.scale;
            domBase = obj.domBottom = obj.domTop + (obj.bottom - obj.top);
            base = obj.bottom;
        }
    }
    toDOM(n) {
        for (let i = 0, base = 0, domBase = 0;; i++) {
            let vp = i < this.viewports.length ? this.viewports[i] : null;
            if (!vp || n < vp.top)
                return domBase + (n - base) * this.scale;
            if (n <= vp.bottom)
                return vp.domTop + (n - vp.top);
            base = vp.bottom;
            domBase = vp.domBottom;
        }
    }
    fromDOM(n) {
        for (let i = 0, base = 0, domBase = 0;; i++) {
            let vp = i < this.viewports.length ? this.viewports[i] : null;
            if (!vp || n < vp.domTop)
                return base + (n - domBase) / this.scale;
            if (n <= vp.domBottom)
                return vp.top + (n - vp.domTop);
            base = vp.bottom;
            domBase = vp.domBottom;
        }
    }
}
function scaleBlock(block, scaler) {
    if (scaler.scale == 1)
        return block;
    let bTop = scaler.toDOM(block.top), bBottom = scaler.toDOM(block.bottom);
    return new heightmap/* BlockInfo */.td(block.from, block.length, bTop, bBottom - bTop, Array.isArray(block.type) ? block.type.map(b => scaleBlock(b, scaler)) : block.type);
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/theme.js


const theme = dist_state/* Facet.define */.r$.define({ combine: strs => strs.join(" ") });
const darkTheme = dist_state/* Facet.define */.r$.define({ combine: values => values.indexOf(true) > -1 });
const baseThemeID = style_mod/* StyleModule.newName */.V.newName(), baseLightID = style_mod/* StyleModule.newName */.V.newName(), baseDarkID = style_mod/* StyleModule.newName */.V.newName();
const lightDarkIDs = { "&light": "." + baseLightID, "&dark": "." + baseDarkID };
function buildTheme(main, spec, scopes) {
    return new style_mod/* StyleModule */.V(spec, {
        finish(sel) {
            return /&/.test(sel) ? sel.replace(/&\w*/, m => {
                if (m == "&")
                    return main;
                if (!scopes || !scopes[m])
                    throw new RangeError(`Unsupported selector: ${m}`);
                return scopes[m];
            }) : main + " " + sel;
        }
    });
}
const baseTheme = buildTheme("." + baseThemeID, {
    "&.cm-editor": {
        position: "relative !important",
        boxSizing: "border-box",
        display: "flex !important",
        flexDirection: "column"
    },
    ".cm-scroller": {
        display: "flex !important",
        alignItems: "flex-start !important",
        fontFamily: "monospace",
        lineHeight: 1.4,
        height: "100%",
        overflowX: "auto",
        position: "relative",
        zIndex: 0
    },
    ".cm-content": {
        margin: 0,
        flexGrow: 2,
        minHeight: "100%",
        display: "block",
        whiteSpace: "pre",
        wordWrap: "normal",
        boxSizing: "border-box",
        padding: "4px 0",
        outline: "none",
        "&[contenteditable=true]": {
            WebkitUserModify: "read-write-plaintext-only",
        }
    },
    ".cm-lineWrapping": {
        whiteSpace_fallback: "pre-wrap",
        whiteSpace: "break-spaces",
        wordBreak: "break-word",
        overflowWrap: "anywhere"
    },
    "&light .cm-content": { caretColor: "black" },
    "&dark .cm-content": { caretColor: "white" },
    ".cm-line": {
        display: "block",
        padding: "0 2px 0 4px"
    },
    ".cm-selectionLayer": {
        zIndex: -1,
        contain: "size style"
    },
    ".cm-selectionBackground": {
        position: "absolute",
    },
    "&light .cm-selectionBackground": {
        background: "#d9d9d9"
    },
    "&dark .cm-selectionBackground": {
        background: "#222"
    },
    "&light.cm-focused .cm-selectionBackground": {
        background: "#d7d4f0"
    },
    "&dark.cm-focused .cm-selectionBackground": {
        background: "#233"
    },
    ".cm-cursorLayer": {
        zIndex: 100,
        contain: "size style",
        pointerEvents: "none"
    },
    "&.cm-focused .cm-cursorLayer": {
        animation: "steps(1) cm-blink 1.2s infinite"
    },
    // Two animations defined so that we can switch between them to restart the animation without forcing another style recomputation.
    "@keyframes cm-blink": { "0%": {}, "50%": { visibility: "hidden" }, "100%": {} },
    "@keyframes cm-blink2": { "0%": {}, "50%": { visibility: "hidden" }, "100%": {} },
    ".cm-cursor, .cm-dropCursor": {
        position: "absolute",
        borderLeft: "1.2px solid black",
        marginLeft: "-0.6px",
        pointerEvents: "none",
    },
    ".cm-cursor": {
        display: "none"
    },
    "&dark .cm-cursor": {
        borderLeftColor: "#444"
    },
    "&.cm-focused .cm-cursor": {
        display: "block"
    },
    "&light .cm-activeLine": { backgroundColor: "#f3f9ff" },
    "&dark .cm-activeLine": { backgroundColor: "#223039" },
    "&light .cm-specialChar": { color: "red" },
    "&dark .cm-specialChar": { color: "#f78" },
    ".cm-gutters": {
        display: "flex",
        height: "100%",
        boxSizing: "border-box",
        left: 0,
        zIndex: 200
    },
    "&light .cm-gutters": {
        backgroundColor: "#fcfcfc",
        color: "#6c6c6c",
        borderRight: "1px solid #ddd"
    },
    "&dark .cm-gutters": {
        backgroundColor: "#333338",
        color: "#ccc"
    },
    ".cm-gutter": {
        display: "flex !important",
        flexDirection: "column",
        flexShrink: 0,
        boxSizing: "border-box",
        minHeight: "100%",
        overflow: "hidden"
    },
    ".cm-gutterElement": {
        boxSizing: "border-box"
    },
    ".cm-lineNumbers .cm-gutterElement": {
        padding: "0 3px 0 5px",
        minWidth: "20px",
        textAlign: "right",
        whiteSpace: "nowrap"
    },
    "&light .cm-activeLineGutter": {
        backgroundColor: "#e2f2ff"
    },
    "&dark .cm-activeLineGutter": {
        backgroundColor: "#222227"
    },
    ".cm-panels": {
        boxSizing: "border-box",
        position: "sticky",
        left: 0,
        right: 0
    },
    "&light .cm-panels": {
        backgroundColor: "#f5f5f5",
        color: "black"
    },
    "&light .cm-panels-top": {
        borderBottom: "1px solid #ddd"
    },
    "&light .cm-panels-bottom": {
        borderTop: "1px solid #ddd"
    },
    "&dark .cm-panels": {
        backgroundColor: "#333338",
        color: "white"
    },
    ".cm-tab": {
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "bottom"
    },
    ".cm-widgetBuffer": {
        verticalAlign: "text-top",
        height: "1em",
        display: "inline"
    },
    ".cm-placeholder": {
        color: "#888",
        display: "inline-block",
        verticalAlign: "top",
    },
    ".cm-button": {
        verticalAlign: "middle",
        color: "inherit",
        fontSize: "70%",
        padding: ".2em 1em",
        borderRadius: "1px"
    },
    "&light .cm-button": {
        backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
        border: "1px solid #888",
        "&:active": {
            backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
        }
    },
    "&dark .cm-button": {
        backgroundImage: "linear-gradient(#393939, #111)",
        border: "1px solid #888",
        "&:active": {
            backgroundImage: "linear-gradient(#111, #333)"
        }
    },
    ".cm-textfield": {
        verticalAlign: "middle",
        color: "inherit",
        fontSize: "70%",
        border: "1px solid silver",
        padding: ".2em .5em"
    },
    "&light .cm-textfield": {
        backgroundColor: "white"
    },
    "&dark .cm-textfield": {
        border: "1px solid #555",
        backgroundColor: "inherit"
    }
}, lightDarkIDs);

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/domobserver.js




const observeOptions = {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    characterDataOldValue: true
};
// IE11 has very broken mutation observers, so we also listen to
// DOMCharacterDataModified there
const useCharData = browser/* default.ie */.Z.ie && browser/* default.ie_version */.Z.ie_version <= 11;
class DOMObserver {
    constructor(view, onChange, onScrollChanged) {
        this.view = view;
        this.onChange = onChange;
        this.onScrollChanged = onScrollChanged;
        this.active = false;
        // The known selection. Kept in our own object, as opposed to just
        // directly accessing the selection because:
        //  - Safari doesn't report the right selection in shadow DOM
        //  - Reading from the selection forces a DOM layout
        //  - This way, we can ignore selectionchange events if we have
        //    already seen the 'new' selection
        this.selectionRange = new view_dom/* DOMSelectionState */.we;
        // Set when a selection change is detected, cleared on flush
        this.selectionChanged = false;
        this.delayedFlush = -1;
        this.resizeTimeout = -1;
        this.queue = [];
        this.delayedAndroidKey = null;
        this.scrollTargets = [];
        this.intersection = null;
        this.resize = null;
        this.intersecting = false;
        this.gapIntersection = null;
        this.gaps = [];
        // Timeout for scheduling check of the parents that need scroll handlers
        this.parentCheck = -1;
        this.dom = view.contentDOM;
        this.observer = new MutationObserver(mutations => {
            for (let mut of mutations)
                this.queue.push(mut);
            // IE11 will sometimes (on typing over a selection or
            // backspacing out a single character text node) call the
            // observer callback before actually updating the DOM.
            //
            // Unrelatedly, iOS Safari will, when ending a composition,
            // sometimes first clear it, deliver the mutations, and then
            // reinsert the finished text. CodeMirror's handling of the
            // deletion will prevent the reinsertion from happening,
            // breaking composition.
            if ((browser/* default.ie */.Z.ie && browser/* default.ie_version */.Z.ie_version <= 11 || browser/* default.ios */.Z.ios && view.composing) &&
                mutations.some(m => m.type == "childList" && m.removedNodes.length ||
                    m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
                this.flushSoon();
            else
                this.flush();
        });
        if (useCharData)
            this.onCharData = (event) => {
                this.queue.push({ target: event.target,
                    type: "characterData",
                    oldValue: event.prevValue });
                this.flushSoon();
            };
        this.onSelectionChange = this.onSelectionChange.bind(this);
        window.addEventListener("resize", this.onResize = this.onResize.bind(this));
        if (typeof ResizeObserver == "function") {
            this.resize = new ResizeObserver(() => {
                if (this.view.docView.lastUpdate < Date.now() - 75)
                    this.onResize();
            });
            this.resize.observe(view.scrollDOM);
        }
        window.addEventListener("beforeprint", this.onPrint = this.onPrint.bind(this));
        this.start();
        window.addEventListener("scroll", this.onScroll = this.onScroll.bind(this));
        if (typeof IntersectionObserver == "function") {
            this.intersection = new IntersectionObserver(entries => {
                if (this.parentCheck < 0)
                    this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1000);
                if (entries.length > 0 && (entries[entries.length - 1].intersectionRatio > 0) != this.intersecting) {
                    this.intersecting = !this.intersecting;
                    if (this.intersecting != this.view.inView)
                        this.onScrollChanged(document.createEvent("Event"));
                }
            }, {});
            this.intersection.observe(this.dom);
            this.gapIntersection = new IntersectionObserver(entries => {
                if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0)
                    this.onScrollChanged(document.createEvent("Event"));
            }, {});
        }
        this.listenForScroll();
        this.readSelectionRange();
        this.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
    }
    onScroll(e) {
        if (this.intersecting)
            this.flush(false);
        this.onScrollChanged(e);
    }
    onResize() {
        if (this.resizeTimeout < 0)
            this.resizeTimeout = setTimeout(() => {
                this.resizeTimeout = -1;
                this.view.requestMeasure();
            }, 50);
    }
    onPrint() {
        this.view.viewState.printing = true;
        this.view.measure();
        setTimeout(() => {
            this.view.viewState.printing = false;
            this.view.requestMeasure();
        }, 500);
    }
    updateGaps(gaps) {
        if (this.gapIntersection && (gaps.length != this.gaps.length || this.gaps.some((g, i) => g != gaps[i]))) {
            this.gapIntersection.disconnect();
            for (let gap of gaps)
                this.gapIntersection.observe(gap);
            this.gaps = gaps;
        }
    }
    onSelectionChange(event) {
        if (!this.readSelectionRange() || this.delayedAndroidKey)
            return;
        let { view } = this, sel = this.selectionRange;
        if (view.state.facet(extension/* editable */.Ah) ? view.root.activeElement != this.dom : !(0,view_dom/* hasSelection */.yF)(view.dom, sel))
            return;
        let context = sel.anchorNode && view.docView.nearest(sel.anchorNode);
        if (context && context.ignoreEvent(event))
            return;
        // Deletions on IE11 fire their events in the wrong order, giving
        // us a selection change event before the DOM changes are
        // reported.
        // Chrome Android has a similar issue when backspacing out a
        // selection (#645).
        if ((browser/* default.ie */.Z.ie && browser/* default.ie_version */.Z.ie_version <= 11 || browser/* default.android */.Z.android && browser/* default.chrome */.Z.chrome) && !view.state.selection.main.empty &&
            // (Selection.isCollapsed isn't reliable on IE)
            sel.focusNode && (0,view_dom/* isEquivalentPosition */.ah)(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
            this.flushSoon();
        else
            this.flush(false);
    }
    readSelectionRange() {
        let { root } = this.view, domSel = (0,view_dom/* getSelection */.Mf)(root);
        // The Selection object is broken in shadow roots in Safari. See
        // https://github.com/codemirror/codemirror.next/issues/414
        let range = browser/* default.safari */.Z.safari && root.nodeType == 11 && (0,view_dom/* deepActiveElement */.jB)() == this.view.contentDOM &&
            safariSelectionRangeHack(this.view) || domSel;
        if (this.selectionRange.eq(range))
            return false;
        this.selectionRange.setRange(range);
        return this.selectionChanged = true;
    }
    setSelectionRange(anchor, head) {
        this.selectionRange.set(anchor.node, anchor.offset, head.node, head.offset);
        this.selectionChanged = false;
    }
    listenForScroll() {
        this.parentCheck = -1;
        let i = 0, changed = null;
        for (let dom = this.dom; dom;) {
            if (dom.nodeType == 1) {
                if (!changed && i < this.scrollTargets.length && this.scrollTargets[i] == dom)
                    i++;
                else if (!changed)
                    changed = this.scrollTargets.slice(0, i);
                if (changed)
                    changed.push(dom);
                dom = dom.assignedSlot || dom.parentNode;
            }
            else if (dom.nodeType == 11) { // Shadow root
                dom = dom.host;
            }
            else {
                break;
            }
        }
        if (i < this.scrollTargets.length && !changed)
            changed = this.scrollTargets.slice(0, i);
        if (changed) {
            for (let dom of this.scrollTargets)
                dom.removeEventListener("scroll", this.onScroll);
            for (let dom of this.scrollTargets = changed)
                dom.addEventListener("scroll", this.onScroll);
        }
    }
    ignore(f) {
        if (!this.active)
            return f();
        try {
            this.stop();
            return f();
        }
        finally {
            this.start();
            this.clear();
        }
    }
    start() {
        if (this.active)
            return;
        this.observer.observe(this.dom, observeOptions);
        if (useCharData)
            this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
        this.active = true;
    }
    stop() {
        if (!this.active)
            return;
        this.active = false;
        this.observer.disconnect();
        if (useCharData)
            this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
    }
    // Throw away any pending changes
    clear() {
        this.processRecords();
        this.queue.length = 0;
        this.selectionChanged = false;
    }
    // Chrome Android, especially in combination with GBoard, not only
    // doesn't reliably fire regular key events, but also often
    // surrounds the effect of enter or backspace with a bunch of
    // composition events that, when interrupted, cause text duplication
    // or other kinds of corruption. This hack makes the editor back off
    // from handling DOM changes for a moment when such a key is
    // detected (via beforeinput or keydown), and then dispatches the
    // key event, throwing away the DOM changes if it gets handled.
    delayAndroidKey(key, keyCode) {
        if (!this.delayedAndroidKey)
            requestAnimationFrame(() => {
                let key = this.delayedAndroidKey;
                this.delayedAndroidKey = null;
                let startState = this.view.state;
                this.readSelectionRange();
                if ((0,view_dom/* dispatchKey */.mL)(this.view.contentDOM, key.key, key.keyCode))
                    this.processRecords();
                else
                    this.flush();
                if (this.view.state == startState)
                    this.view.update([]);
            });
        // Since backspace beforeinput is sometimes signalled spuriously,
        // Enter always takes precedence.
        if (!this.delayedAndroidKey || key == "Enter")
            this.delayedAndroidKey = { key, keyCode };
    }
    flushSoon() {
        if (this.delayedFlush < 0)
            this.delayedFlush = window.setTimeout(() => { this.delayedFlush = -1; this.flush(); }, 20);
    }
    forceFlush() {
        if (this.delayedFlush >= 0) {
            window.clearTimeout(this.delayedFlush);
            this.delayedFlush = -1;
            this.flush();
        }
    }
    processRecords() {
        let records = this.queue;
        for (let mut of this.observer.takeRecords())
            records.push(mut);
        if (records.length)
            this.queue = [];
        let from = -1, to = -1, typeOver = false;
        for (let record of records) {
            let range = this.readMutation(record);
            if (!range)
                continue;
            if (range.typeOver)
                typeOver = true;
            if (from == -1) {
                ;
                ({ from, to } = range);
            }
            else {
                from = Math.min(range.from, from);
                to = Math.max(range.to, to);
            }
        }
        return { from, to, typeOver };
    }
    // Apply pending changes, if any
    flush(readSelection = true) {
        // Completely hold off flushing when pending keys are set—the code
        // managing those will make sure processRecords is called and the
        // view is resynchronized after
        if (this.delayedFlush >= 0 || this.delayedAndroidKey)
            return;
        if (readSelection)
            this.readSelectionRange();
        let { from, to, typeOver } = this.processRecords();
        let newSel = this.selectionChanged && (0,view_dom/* hasSelection */.yF)(this.dom, this.selectionRange);
        if (from < 0 && !newSel)
            return;
        this.selectionChanged = false;
        let startState = this.view.state;
        this.onChange(from, to, typeOver);
        // The view wasn't updated
        if (this.view.state == startState)
            this.view.update([]);
    }
    readMutation(rec) {
        let cView = this.view.docView.nearest(rec.target);
        if (!cView || cView.ignoreMutation(rec))
            return null;
        cView.markDirty(rec.type == "attributes");
        if (rec.type == "attributes")
            cView.dirty |= 4 /* Attrs */;
        if (rec.type == "childList") {
            let childBefore = findChild(cView, rec.previousSibling || rec.target.previousSibling, -1);
            let childAfter = findChild(cView, rec.nextSibling || rec.target.nextSibling, 1);
            return { from: childBefore ? cView.posAfter(childBefore) : cView.posAtStart,
                to: childAfter ? cView.posBefore(childAfter) : cView.posAtEnd, typeOver: false };
        }
        else if (rec.type == "characterData") {
            return { from: cView.posAtStart, to: cView.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue };
        }
        else {
            return null;
        }
    }
    destroy() {
        var _a, _b, _c;
        this.stop();
        (_a = this.intersection) === null || _a === void 0 ? void 0 : _a.disconnect();
        (_b = this.gapIntersection) === null || _b === void 0 ? void 0 : _b.disconnect();
        (_c = this.resize) === null || _c === void 0 ? void 0 : _c.disconnect();
        for (let dom of this.scrollTargets)
            dom.removeEventListener("scroll", this.onScroll);
        window.removeEventListener("scroll", this.onScroll);
        window.removeEventListener("resize", this.onResize);
        window.removeEventListener("beforeprint", this.onPrint);
        this.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
        clearTimeout(this.parentCheck);
        clearTimeout(this.resizeTimeout);
    }
}
function findChild(cView, dom, dir) {
    while (dom) {
        let curView = contentview/* ContentView.get */.Cl.get(dom);
        if (curView && curView.parent == cView)
            return curView;
        let parent = dom.parentNode;
        dom = parent != cView.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
    }
    return null;
}
// Used to work around a Safari Selection/shadow DOM bug (#414)
function safariSelectionRangeHack(view) {
    let found = null;
    // Because Safari (at least in 2018-2021) doesn't provide regular
    // access to the selection inside a shadowroot, we have to perform a
    // ridiculous hack to get at it—using `execCommand` to trigger a
    // `beforeInput` event so that we can read the target range from the
    // event.
    function read(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        found = event.getTargetRanges()[0];
    }
    view.contentDOM.addEventListener("beforeinput", read, true);
    document.execCommand("indent");
    view.contentDOM.removeEventListener("beforeinput", read, true);
    if (!found)
        return null;
    let anchorNode = found.startContainer, anchorOffset = found.startOffset;
    let focusNode = found.endContainer, focusOffset = found.endOffset;
    let curAnchor = view.docView.domAtPos(view.state.selection.main.anchor);
    // Since such a range doesn't distinguish between anchor and head,
    // use a heuristic that flips it around if its end matches the
    // current anchor.
    if ((0,view_dom/* isEquivalentPosition */.ah)(curAnchor.node, curAnchor.offset, focusNode, focusOffset))
        [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
    return { anchorNode, anchorOffset, focusNode, focusOffset };
}

// EXTERNAL MODULE: ./sys/public/js/editor/dist/view/attributes.js
var attributes = __webpack_require__(96);
;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/domchange.js






function applyDOMChange(view, start, end, typeOver) {
    let change, newSel;
    let sel = view.state.selection.main;
    if (start > -1) {
        let bounds = view.docView.domBoundsAround(start, end, 0);
        if (!bounds || view.state.readOnly)
            return;
        let { from, to } = bounds;
        let selPoints = view.docView.impreciseHead || view.docView.impreciseAnchor ? [] : selectionPoints(view);
        let reader = new DOMReader(selPoints, view.state);
        reader.readRange(bounds.startDOM, bounds.endDOM);
        let preferredPos = sel.from, preferredSide = null;
        // Prefer anchoring to end when Backspace is pressed (or, on Android, when something was deleted)
        if (view.inputState.lastKeyCode === 8 && view.inputState.lastKeyTime > Date.now() - 100 || browser/* default.android */.Z.android && reader.text.length < to - from) {
            preferredPos = sel.to;
            preferredSide = "end";
        }
        let diff = findDiff(view.state.doc.sliceString(from, to, LineBreakPlaceholder), reader.text, preferredPos - from, preferredSide);
        if (diff) {
            // Chrome inserts two newlines when pressing shift-enter at the end of a line. This drops one of those.
            if (browser/* default.chrome */.Z.chrome && view.inputState.lastKeyCode == 13 && diff.toB == diff.from + 2 && reader.text.slice(diff.from, diff.toB) == LineBreakPlaceholder + LineBreakPlaceholder)
                diff.toB--;
            change = { from: from + diff.from, to: from + diff.toA,
                insert: dist_state/* Text.of */.xv.of(reader.text.slice(diff.from, diff.toB).split(LineBreakPlaceholder)) };
        }
        newSel = selectionFromPoints(selPoints, from);
    }
    else if (view.hasFocus || !view.state.facet(extension/* editable */.Ah)) {
        let domSel = view.observer.selectionRange;
        let { impreciseHead: iHead, impreciseAnchor: iAnchor } = view.docView;
        let head = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset || !(0,view_dom/* contains */.r3)(view.contentDOM, domSel.focusNode) ?
            view.state.selection.main.head :
            view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
        let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset || !(0,view_dom/* contains */.r3)(view.contentDOM, domSel.anchorNode) ?
            view.state.selection.main.anchor :
            view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
        if (head != sel.head || anchor != sel.anchor)
            newSel = dist_state/* EditorSelection.single */.jT.single(anchor, head);
    }
    if (!change && !newSel)
        return;
    // Heuristic to notice typing over a selected character
    if (!change && typeOver && !sel.empty && newSel && newSel.main.empty)
        change = { from: sel.from, to: sel.to, insert: view.state.doc.slice(sel.from, sel.to) };
    // If the change is inside the selection and covers most of it, assume it is a selection replace (with identical characters at the start/end not included in the diff)
    else if (change && change.from >= sel.from && change.to <= sel.to &&
        (change.from != sel.from || change.to != sel.to) &&
        (sel.to - sel.from) - (change.to - change.from) <= 4)
        change = {
            from: sel.from, to: sel.to,
            insert: view.state.doc.slice(sel.from, change.from).append(change.insert).append(view.state.doc.slice(change.to, sel.to))
        };
    if (change) {
        let startState = view.state;
        if (browser/* default.ios */.Z.ios && view.inputState.flushIOSKey(view))
            return;
        // Android browsers don't fire reasonable key events for enter,
        // backspace, or delete. So this detects changes that look like
        // they're caused by those keys, and reinterprets them as key
        // events. (Some of these keys are also handled by beforeinput
        // events and the pendingAndroidKey mechanism, but that's not
        // reliable in all situations.)
        if (browser/* default.android */.Z.android &&
            ((change.from == sel.from && change.to == sel.to && change.insert.length == 1 && change.insert.lines == 2 &&
                (0,view_dom/* dispatchKey */.mL)(view.contentDOM, "Enter", 13)) ||
                (change.from == sel.from - 1 && change.to == sel.to && change.insert.length == 0 &&
                    (0,view_dom/* dispatchKey */.mL)(view.contentDOM, "Backspace", 8)) ||
                (change.from == sel.from && change.to == sel.to + 1 && change.insert.length == 0 &&
                    (0,view_dom/* dispatchKey */.mL)(view.contentDOM, "Delete", 46))))
            return;
        let text = change.insert.toString();
        if (view.state.facet(extension/* inputHandler */.wv).some(h => h(view, change.from, change.to, text)))
            return;
        if (view.inputState.composing >= 0)
            view.inputState.composing++;
        let tr;
        if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3 &&
            (!newSel || newSel.main.empty && newSel.main.from == change.from + change.insert.length) &&
            view.inputState.composing < 0) {
            let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
            let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
            tr = startState.replaceSelection(view.state.toText(before + change.insert.sliceString(0, undefined, view.state.lineBreak) + after));
        }
        else {
            let changes = startState.changes(change);
            let mainSel = newSel && !startState.selection.main.eq(newSel.main) && newSel.main.to <= changes.newLength ? newSel.main : undefined;
            // Try to apply a composition change to all cursors
            if (startState.selection.ranges.length > 1 && view.inputState.composing >= 0 &&
                change.to <= sel.to && change.to >= sel.to - 10) {
                let replaced = view.state.sliceDoc(change.from, change.to);
                let compositionRange = compositionSurroundingNode(view) || view.state.doc.lineAt(sel.head);
                let offset = sel.to - change.to, size = sel.to - sel.from;
                tr = startState.changeByRange(range => {
                    if (range.from == sel.from && range.to == sel.to)
                        return { changes, range: mainSel || range.map(changes) };
                    let to = range.to - offset, from = to - replaced.length;
                    if (range.to - range.from != size || view.state.sliceDoc(from, to) != replaced ||
                        // Unfortunately, there's no way to make multiple
                        // changes in the same node work without aborting
                        // composition, so cursors in the composition range are
                        // ignored.
                        compositionRange && range.to >= compositionRange.from && range.from <= compositionRange.to)
                        return { range };
                    let rangeChanges = startState.changes({ from, to, insert: change.insert }), selOff = range.to - sel.to;
                    return {
                        changes: rangeChanges,
                        range: !mainSel ? range.map(rangeChanges) :
                            dist_state/* EditorSelection.range */.jT.range(Math.max(0, mainSel.anchor + selOff), Math.max(0, mainSel.head + selOff))
                    };
                });
            }
            else {
                tr = {
                    changes,
                    selection: mainSel && startState.selection.replaceRange(mainSel)
                };
            }
        }
        let userEvent = "input.type";
        if (view.composing) {
            userEvent += ".compose";
            if (view.inputState.compositionFirstChange) {
                userEvent += ".start";
                view.inputState.compositionFirstChange = false;
            }
        }
        view.dispatch(tr, { scrollIntoView: true, userEvent });
    }
    else if (newSel && !newSel.main.eq(sel)) {
        let scrollIntoView = false, userEvent = "select";
        if (view.inputState.lastSelectionTime > Date.now() - 50) {
            if (view.inputState.lastSelectionOrigin == "select")
                scrollIntoView = true;
            userEvent = view.inputState.lastSelectionOrigin;
        }
        view.dispatch({ selection: newSel, scrollIntoView, userEvent });
    }
}
function findDiff(a, b, preferredPos, preferredSide) {
    let minLen = Math.min(a.length, b.length);
    let from = 0;
    while (from < minLen && a.charCodeAt(from) == b.charCodeAt(from))
        from++;
    if (from == minLen && a.length == b.length)
        return null;
    let toA = a.length, toB = b.length;
    while (toA > 0 && toB > 0 && a.charCodeAt(toA - 1) == b.charCodeAt(toB - 1)) {
        toA--;
        toB--;
    }
    if (preferredSide == "end") {
        let adjust = Math.max(0, from - Math.min(toA, toB));
        preferredPos -= toA + adjust - from;
    }
    if (toA < from && a.length < b.length) {
        let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
        from -= move;
        toB = from + (toB - toA);
        toA = from;
    }
    else if (toB < from) {
        let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
        from -= move;
        toA = from + (toA - toB);
        toB = from;
    }
    return { from, toA, toB };
}
function selectionPoints(view) {
    let result = [];
    if (view.root.activeElement != view.contentDOM)
        return result;
    let { anchorNode, anchorOffset, focusNode, focusOffset } = view.observer.selectionRange;
    if (anchorNode) {
        result.push(new DOMPoint(anchorNode, anchorOffset));
        if (focusNode != anchorNode || focusOffset != anchorOffset)
            result.push(new DOMPoint(focusNode, focusOffset));
    }
    return result;
}
function selectionFromPoints(points, base) {
    if (points.length == 0)
        return null;
    let anchor = points[0].pos, head = points.length == 2 ? points[1].pos : anchor;
    return anchor > -1 && head > -1 ? dist_state/* EditorSelection.single */.jT.single(anchor + base, head + base) : null;
}

;// CONCATENATED MODULE: ./sys/public/js/editor/dist/view/editorview.js














// The editor's update state machine looks something like this:
//
//     Idle → Updating ⇆ Idle (unchecked) → Measuring → Idle
//                                         ↑      ↓
//                                         Updating (measure)
//
// The difference between 'Idle' and 'Idle (unchecked)' lies in
// whether a layout check has been scheduled. A regular update through
// the `update` method updates the DOM in a write-only fashion, and
// relies on a check (scheduled with `requestAnimationFrame`) to make
// sure everything is where it should be and the viewport covers the
// visible code. That check continues to measure and then optionally
// update until it reaches a coherent state.
/**
 * An editor view represents the editor's user interface. It holds the editable DOM surface,
 * and possibly other elements such as the line number gutter. It handles events and dispatches
 * state transactions for editing actions.
 */
class EditorView {
    /**
     * Construct a new view. You'll want to either provide a `parent` option, or put `view.dom`
     * into your document after creating a view, so that the user can see the editor.
     * @param config Initialization options.
     */
    constructor(config = {}) {
        this.plugins = [];
        this.pluginMap = new Map;
        this.editorAttrs = {};
        this.contentAttrs = {};
        this.bidiCache = [];
        this.destroyed = false;
        // @internal
        this.updateState = 2 /* Updating */;
        // @internal
        this.measureScheduled = -1;
        // @internal
        this.measureRequests = [];
        this.contentDOM = document.createElement("div");
        this.scrollDOM = document.createElement("div");
        this.scrollDOM.tabIndex = -1;
        this.scrollDOM.className = "cm-scroller";
        this.scrollDOM.appendChild(this.contentDOM);
        this.announceDOM = document.createElement("div");
        this.announceDOM.style.cssText = "position: absolute; top: -10000px";
        this.announceDOM.setAttribute("aria-live", "polite");
        this.dom = document.createElement("div");
        this.dom.appendChild(this.announceDOM);
        this.dom.appendChild(this.scrollDOM);
        this._dispatch = config.dispatch || ((tr) => this.update([tr]));
        this.dispatch = this.dispatch.bind(this);
        this.root = (config.root || (0,view_dom/* getRoot */.yj)(config.parent) || document);
        this.viewState = new ViewState(config.state || dist_state/* EditorState.create */.yy.create());
        this.plugins = this.state.facet(extension/* viewPlugin */.$m).map(spec => new extension/* PluginInstance */.dl(spec));
        for (let plugin of this.plugins)
            plugin.update(this);
        this.observer = new DOMObserver(this, (from, to, typeOver) => {
            applyDOMChange(this, from, to, typeOver);
        }, event => {
            this.inputState.runScrollHandlers(this, event);
            if (this.observer.intersecting)
                this.measure();
        });
        this.inputState = new input/* InputState */.I(this);
        this.inputState.ensureHandlers(this, this.plugins);
        this.docView = new DocView(this);
        this.mountStyles();
        this.updateAttrs();
        this.updateState = 0 /* Idle */;
        this.requestMeasure();
        if (config.parent)
            config.parent.appendChild(this.dom);
    }
    /** The current editor state. */
    get state() { return this.viewState.state; }
    /**
     * To be able to display large documents without consuming too much memory or overloading the
     * browser, CodeMirror only draws the code that is visible (plus a margin around it) to the
     * DOM. This property tells you the extent of the current drawn viewport, in document positions.
     */
    get viewport() { return this.viewState.viewport; }
    /**
     * When there are, for example, large collapsed ranges in the viewport, its size can be a lot
     * bigger than the actual visible content. Thus, if you are doing something like styling the
     * content in the viewport, it is preferable to only do so for these ranges, which are the subset
     * of the viewport that is actually drawn.
     */
    get visibleRanges() { return this.viewState.visibleRanges; }
    /** Returns false when the editor is entirely scrolled out of view or otherwise hidden. */
    get inView() { return this.viewState.inView; }
    /**
     * Indicates whether the user is currently composing text via [IME](https://en.wikipedia.org/wiki/Input_method),
     * and at least one change has been made in the current composition.
     */
    get composing() { return this.inputState.composing > 0; }
    /**
     * Indicates whether the user is currently in composing state. Note that on some platforms,
     * like Android, this will be the case a lot, since just putting the cursor on a word starts a
     * composition there.
     */
    get compositionStarted() { return this.inputState.composing >= 0; }
    dispatch(...input) {
        this._dispatch(input.length == 1 && input[0] instanceof dist_state/* Transaction */.YW ? input[0] :
            this.state.update(...input));
    }
    /**
     * Update the view for the given array of transactions. This will update the visible document
     * and selection to match the state produced by the transactions, and notify view plugins of the
     * change. You should usually call [`dispatch`]{@link EditorView.dispatch} instead, which uses
     * this as a primitive.
     */
    update(transactions) {
        if (this.updateState != 0 /* Idle */)
            throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
        let redrawn = false, update;
        let state = this.state;
        for (let tr of transactions) {
            if (tr.startState != state)
                throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
            state = tr.state;
        }
        if (this.destroyed) {
            this.viewState.state = state;
            return;
        }
        // When the phrases change, redraw the editor
        if (state.facet(dist_state/* EditorState.phrases */.yy.phrases) != this.state.facet(dist_state/* EditorState.phrases */.yy.phrases))
            return this.setState(state);
        update = extension/* ViewUpdate.create */.TB.create(this, state, transactions);
        let scrollTarget = this.viewState.scrollTarget;
        try {
            this.updateState = 2 /* Updating */;
            for (let tr of transactions) {
                if (scrollTarget)
                    scrollTarget = scrollTarget.map(tr.changes);
                if (tr.scrollIntoView) {
                    let { main } = tr.state.selection;
                    scrollTarget = new extension/* ScrollTarget */._V(main.empty ? main : dist_state/* EditorSelection.cursor */.jT.cursor(main.head, main.head > main.anchor ? -1 : 1));
                }
                for (let e of tr.effects)
                    if (e.is(extension/* scrollIntoView */.zT))
                        scrollTarget = e.value;
            }
            this.viewState.update(update, scrollTarget);
            this.bidiCache = CachedOrder.update(this.bidiCache, update.changes);
            if (!update.empty) {
                this.updatePlugins(update);
                this.inputState.update(update);
            }
            redrawn = this.docView.update(update);
            if (this.state.facet(extension/* styleModule */.qh) != this.styleModules)
                this.mountStyles();
            this.updateAttrs();
            this.showAnnouncements(transactions);
            this.docView.updateSelection(redrawn, transactions.some(tr => tr.isUserEvent("select.pointer")));
        }
        finally {
            this.updateState = 0 /* Idle */;
        }
        if (update.startState.facet(theme) != update.state.facet(theme))
            this.viewState.mustMeasureContent = true;
        if (redrawn || scrollTarget || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent)
            this.requestMeasure();
        if (!update.empty)
            for (let listener of this.state.facet(extension/* updateListener */.U6))
                listener(update);
    }
    /**
     * Reset the view to the given state. (This will cause the entire document to be redrawn and all
     * view plugins to be reinitialized, so you should probably only use it when the new state isn't
     * derived from the old state. Otherwise, use [`dispatch`]{@link EditorView.dispatch} instead.)
     */
    setState(newState) {
        if (this.updateState != 0 /* Idle */)
            throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
        if (this.destroyed) {
            this.viewState.state = newState;
            return;
        }
        this.updateState = 2 /* Updating */;
        let hadFocus = this.hasFocus;
        try {
            for (let plugin of this.plugins)
                plugin.destroy(this);
            this.viewState = new ViewState(newState);
            this.plugins = newState.facet(extension/* viewPlugin */.$m).map(spec => new extension/* PluginInstance */.dl(spec));
            this.pluginMap.clear();
            for (let plugin of this.plugins)
                plugin.update(this);
            this.docView = new DocView(this);
            this.inputState.ensureHandlers(this, this.plugins);
            this.mountStyles();
            this.updateAttrs();
            this.bidiCache = [];
        }
        finally {
            this.updateState = 0 /* Idle */;
        }
        if (hadFocus)
            this.focus();
        this.requestMeasure();
    }
    updatePlugins(update) {
        let prevSpecs = update.startState.facet(extension/* viewPlugin */.$m), specs = update.state.facet(extension/* viewPlugin */.$m);
        if (prevSpecs != specs) {
            let newPlugins = [];
            for (let spec of specs) {
                let found = prevSpecs.indexOf(spec);
                if (found < 0) {
                    newPlugins.push(new extension/* PluginInstance */.dl(spec));
                }
                else {
                    let plugin = this.plugins[found];
                    plugin.mustUpdate = update;
                    newPlugins.push(plugin);
                }
            }
            for (let plugin of this.plugins)
                if (plugin.mustUpdate != update)
                    plugin.destroy(this);
            this.plugins = newPlugins;
            this.pluginMap.clear();
            this.inputState.ensureHandlers(this, this.plugins);
        }
        else {
            for (let p of this.plugins)
                p.mustUpdate = update;
        }
        for (let i = 0; i < this.plugins.length; i++)
            this.plugins[i].update(this);
    }
    // @internal
    measure(flush = true) {
        if (this.destroyed)
            return;
        if (this.measureScheduled > -1)
            cancelAnimationFrame(this.measureScheduled);
        this.measureScheduled = 0; // Prevent requestMeasure calls from scheduling another animation frame
        if (flush)
            this.observer.flush();
        let updated = null;
        try {
            for (let i = 0;; i++) {
                this.updateState = 1 /* Measuring */;
                let oldViewport = this.viewport;
                let changed = this.viewState.measure(this);
                if (!changed && !this.measureRequests.length && this.viewState.scrollTarget == null)
                    break;
                if (i > 5) {
                    console.warn(this.measureRequests.length ?
                        "Measure loop restarted more than 5 times" :
                        "Viewport failed to stabilize");
                    break;
                }
                let measuring = [];
                // Only run measure requests in this cycle when the viewport didn't change
                if (!(changed & 4 /* Viewport */))
                    [this.measureRequests, measuring] = [measuring, this.measureRequests];
                let measured = measuring.map(m => {
                    try {
                        return m.read(this);
                    }
                    catch (e) {
                        (0,extension/* logException */.OO)(this.state, e);
                        return BadMeasure;
                    }
                });
                let update = extension/* ViewUpdate.create */.TB.create(this, this.state, []), redrawn = false, scrolled = false;
                update.flags |= changed;
                if (!updated)
                    updated = update;
                else
                    updated.flags |= changed;
                this.updateState = 2 /* Updating */;
                if (!update.empty) {
                    this.updatePlugins(update);
                    this.inputState.update(update);
                    this.updateAttrs();
                    redrawn = this.docView.update(update);
                }
                for (let i = 0; i < measuring.length; i++)
                    if (measured[i] != BadMeasure) {
                        try {
                            let m = measuring[i];
                            if (m.write)
                                m.write(measured[i], this);
                        }
                        catch (e) {
                            (0,extension/* logException */.OO)(this.state, e);
                        }
                    }
                if (this.viewState.scrollTarget) {
                    this.docView.scrollIntoView(this.viewState.scrollTarget);
                    this.viewState.scrollTarget = null;
                    scrolled = true;
                }
                if (redrawn)
                    this.docView.updateSelection(true);
                if (this.viewport.from == oldViewport.from && this.viewport.to == oldViewport.to &&
                    !scrolled && this.measureRequests.length == 0)
                    break;
            }
        }
        finally {
            this.updateState = 0 /* Idle */;
            this.measureScheduled = -1;
        }
        if (updated && !updated.empty)
            for (let listener of this.state.facet(extension/* updateListener */.U6))
                listener(updated);
    }
    /** Get the CSS classes for the currently active editor themes. */
    get themeClasses() {
        return baseThemeID + " " +
            (this.state.facet(darkTheme) ? baseDarkID : baseLightID) + " " +
            this.state.facet(theme);
    }
    updateAttrs() {
        let editorAttrs = attrsFromFacet(this, extension/* editorAttributes */._l, {
            class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
        });
        let contentAttrs = {
            spellcheck: "false",
            autocorrect: "off",
            autocapitalize: "off",
            translate: "no",
            contenteditable: !this.state.facet(extension/* editable */.Ah) ? "false" : "true",
            class: "cm-content",
            style: `${browser/* default.tabSize */.Z.tabSize}: ${this.state.tabSize}`,
            role: "textbox",
            "aria-multiline": "true"
        };
        if (this.state.readOnly)
            contentAttrs["aria-readonly"] = "true";
        attrsFromFacet(this, extension/* contentAttributes */.tk, contentAttrs);
        this.observer.ignore(() => {
            (0,attributes/* updateAttrs */.Gl)(this.contentDOM, this.contentAttrs, contentAttrs);
            (0,attributes/* updateAttrs */.Gl)(this.dom, this.editorAttrs, editorAttrs);
        });
        this.editorAttrs = editorAttrs;
        this.contentAttrs = contentAttrs;
    }
    showAnnouncements(trs) {
        let first = true;
        for (let tr of trs)
            for (let effect of tr.effects)
                if (effect.is(EditorView.announce)) {
                    if (first)
                        this.announceDOM.textContent = "";
                    first = false;
                    let div = this.announceDOM.appendChild(document.createElement("div"));
                    div.textContent = effect.value;
                }
    }
    mountStyles() {
        this.styleModules = this.state.facet(extension/* styleModule */.qh);
        style_mod/* StyleModule.mount */.V.mount(this.root, this.styleModules.concat(baseTheme).reverse());
    }
    readMeasured() {
        if (this.updateState == 2 /* Updating */)
            throw new Error("Reading the editor layout isn't allowed during an update");
        if (this.updateState == 0 /* Idle */ && this.measureScheduled > -1)
            this.measure(false);
    }
    /**
     * Schedule a layout measurement, optionally providing callbacks to do custom DOM measuring
     * followed by a DOM write phase. Using this is preferable reading DOM layout directly from,
     * for example, an event handler, because it'll make sure measuring and drawing done by other
     * components is synchronized, avoiding unnecessary DOM layout computations.
     */
    requestMeasure(request) {
        if (this.measureScheduled < 0)
            this.measureScheduled = requestAnimationFrame(() => this.measure());
        if (request) {
            if (request.key != null)
                for (let i = 0; i < this.measureRequests.length; i++) {
                    if (this.measureRequests[i].key === request.key) {
                        this.measureRequests[i] = request;
                        return;
                    }
                }
            this.measureRequests.push(request);
        }
    }
    /**
     * Get the value of a specific plugin, if present. Note that plugins that crash can be dropped
     * from a view, so even when you know you registered a given plugin, it is recommended to check
     * the return value of this method.
     */
    plugin(plugin) {
        let known = this.pluginMap.get(plugin);
        if (known === undefined || known && known.spec != plugin)
            this.pluginMap.set(plugin, known = this.plugins.find(p => p.spec == plugin) || null);
        return known && known.update(this).value;
    }
    /**
     * The top position of the document, in screen coordinates. This may be negative when the
     * editor is scrolled down. Points directly to the top of the first line, not above the padding.
     */
    get documentTop() {
        return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
    }
    /** Reports the padding above and below the document. */
    get documentPadding() {
        return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
    }
    /**
     * Find the text line or block widget at the given vertical position (which is interpreted as
     * relative to the [top of the document]{@link documentTop}
     */
    elementAtHeight(height) {
        this.readMeasured();
        return this.viewState.elementAtHeight(height);
    }
    /** Find the line block (see [`lineBlockAt`]{@link lineBlockAt} at the given height. */
    lineBlockAtHeight(height) {
        this.readMeasured();
        return this.viewState.lineBlockAtHeight(height);
    }
    /**
     * Get the extent and vertical position of all [line blocks]{@link lineBlockAt} in the viewport. Positions
     * are relative to the [top of the document]{@link documentTop};
     */
    get viewportLineBlocks() {
        return this.viewState.viewportLines;
    }
    /**
     * Find the line block around the given document position. A line block is a range delimited on
     * both sides by either a non-[hidden]{@link Decoration.replace} line breaks, or the start/end
     * of the document. It will usually just hold a line of text, but may be broken into multiple
     * textblocks by block widgets.
     */
    lineBlockAt(pos) {
        return this.viewState.lineBlockAt(pos);
    }
    /** The editor's total content height. */
    get contentHeight() {
        return this.viewState.contentHeight;
    }
    /**
     * Move a cursor position by [grapheme cluster]{@link findClusterBreak}. `forward` determines whether
     * the motion is away from the line start, or towards it. In bidirectional text, the line is traversed
     * in visual order, using the editor's [text direction](#view.EditorView.textDirection). When the
     * start position was the last one on the line, the returned position will be across the line break.
     * If there is no further line, the original position is returned.
     *
     * By default, this method moves over a single cluster. The optional `by` argument can be used to move
     * across more. It will be called with the first cluster as argument, and should return a predicate
     * that determines, for each subsequent cluster, whether it should also be moved over.
     */
    moveByChar(start, forward, by) {
        return (0,cursor/* skipAtoms */.Vk)(this, start, (0,cursor/* moveByChar */.kW)(this, start, forward, by));
    }
    /**
     * Move a cursor position across the next group of either [letters]{@link charCategorizer} or non-letter
     * non-whitespace characters.
     */
    moveByGroup(start, forward) {
        return (0,cursor/* skipAtoms */.Vk)(this, start, (0,cursor/* moveByChar */.kW)(this, start, forward, initial => (0,cursor/* byGroup */.Cl)(this, start.head, initial)));
    }
    /**
     * Move to the next line boundary in the given direction. If `includeWrap` is true, line
     * wrapping is on, and there is a further wrap point on the current line, the wrap point
     * will be returned. Otherwise this function will return the start or end of the line.
     */
    moveToLineBoundary(start, forward, includeWrap = true) {
        return (0,cursor/* moveToLineBoundary */.rr)(this, start, forward, includeWrap);
    }
    /**
     * Move a cursor position vertically. When `distance` isn't given, it defaults to moving to
     * the next line (including wrapped lines). Otherwise, `distance` should provide a positive
     * distance in pixels.
     * When `start` has a [`goalColumn`]{@link SelectionRange.goalColumn}, the vertical motion
     * will use that as a target horizontal position. Otherwise, the cursor's own horizontal
     * position is used. The returned cursor will have its goal column set to whichever column was
     * used.
     */
    moveVertically(start, forward, distance) {
        return (0,cursor/* skipAtoms */.Vk)(this, start, (0,cursor/* moveVertically */.pw)(this, start, forward, distance));
    }
    /**
     * Find the DOM parent node and offset (child offset if `node` is an element, character offset
     * when it is a text node) at the given document position. Note that for positions that aren't
     * currently in `visibleRanges`, the resulting DOM position isn't necessarily meaningful (it may
     * just point before or after a placeholder element).
     */
    domAtPos(pos) {
        return this.docView.domAtPos(pos);
    }
    /**
     * Find the document position at the given DOM node. Can be useful for associating positions with
     * DOM events. Will raise an error when `node` isn't part of the editor content.
     */
    posAtDOM(node, offset = 0) {
        return this.docView.posFromDOM(node, offset);
    }
    posAtCoords(coords, precise = true) {
        this.readMeasured();
        return (0,cursor/* posAtCoords */.Nn)(this, coords, precise);
    }
    /**
     * Get the screen coordinates at the given document position. `side` determines whether the coordinates
     * are based on the element before (-1) or after (1) the position (if no element is available on the given
     * side, the method will transparently use another strategy to get reasonable coordinates).
     */
    coordsAtPos(pos, side = 1) {
        this.readMeasured();
        let rect = this.docView.coordsAt(pos, side);
        if (!rect || rect.left == rect.right)
            return rect;
        let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
        let span = order[bidi/* BidiSpan.find */.CZ.find(order, pos - line.from, -1, side)];
        return (0,view_dom/* flattenRect */._s)(rect, (span.dir == bidi/* Direction.LTR */.Nm.LTR) == (side > 0));
    }
    /**
     * The default width of a character in the editor. May not accurately reflect the width of all
     * characters (given variable width fonts or styling of invididual ranges).
     */
    get defaultCharacterWidth() { return this.viewState.heightOracle.charWidth; }
    /** The default height of a line in the editor. May not be accurate for all lines. */
    get defaultLineHeight() { return this.viewState.heightOracle.lineHeight; }
    /**
     * The text direction ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
     * CSS property) of the editor's content element.
     */
    get textDirection() { return this.viewState.defaultTextDirection; }
    /** Find the text direction of the block at the given position, as assigned by CSS. */
    textDirectionAt(pos) {
        let perLine = this.state.facet(extension/* perLineTextDirection */.F0);
        if (!perLine || pos < this.viewport.from || pos > this.viewport.to)
            return this.textDirection;
        this.readMeasured();
        return this.docView.textDirectionAt(pos);
    }
    /**
     * Whether this editor [wraps lines](#view.EditorView.lineWrapping)
     * (as determined by the [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
     * CSS property of its content element).
     */
    get lineWrapping() { return this.viewState.heightOracle.lineWrapping; }
    /**
     * Returns the bidirectional text structure of the given line (which should be in the
     * current document) as an array of span objects. The order of these spans matches the
     * [text direction]{@link textDirection}—if that is left-to-right, the leftmost spans
     * come first, otherwise the rightmost spans come first.
     */
    bidiSpans(line) {
        if (line.length > MaxBidiLine)
            return (0,bidi/* trivialOrder */.ZO)(line.length);
        let dir = this.textDirectionAt(line.from);
        for (let entry of this.bidiCache)
            if (entry.from == line.from && entry.dir == dir)
                return entry.order;
        let order = (0,bidi/* computeOrder */.nG)(line.text, dir);
        this.bidiCache.push(new CachedOrder(line.from, line.to, dir, order));
        return order;
    }
    /** Check whether the editor has focus. */
    get hasFocus() {
        var _a;
        // Safari return false for hasFocus when the context menu is open
        // or closing, which leads us to ignore selection changes from the
        // context menu because it looks like the editor isn't focused.
        // This kludges around that.
        return (document.hasFocus() || browser/* default.safari */.Z.safari && ((_a = this.inputState) === null || _a === void 0 ? void 0 : _a.lastContextMenu) > Date.now() - 3e4) &&
            this.root.activeElement == this.contentDOM;
    }
    /** Put focus on the editor. */
    focus() {
        this.observer.ignore(() => {
            (0,view_dom/* focusPreventScroll */.ED)(this.contentDOM);
            this.docView.updateSelection();
        });
    }
    /**
     * Clean up this editor view, removing its element from the document, unregistering event
     * handlers, and notifying plugins. The view instance can no longer be used after calling this.
     */
    destroy() {
        for (let plugin of this.plugins)
            plugin.destroy(this);
        this.plugins = [];
        this.inputState.destroy();
        this.dom.remove();
        this.observer.destroy();
        if (this.measureScheduled > -1)
            cancelAnimationFrame(this.measureScheduled);
        this.destroyed = true;
    }
    /**
     * Returns an effect that can be [added]{@link TransactionSpec.effects} to a transaction to
     * cause it to scroll the given position or range into view.
     * @param options.y By default (`"nearest"`) the position will be vertically scrolled only the minimal amount
     *          required to move the given position into view. You can set this to `"start"` to move it to the top
     *          of the view, `"end"` to move it to the bottom, or `"center"` to move it to the center.
     * @param options.x Effect similar to [`y`]{@link scrollIntoView.options.y}, but for the horizontal scroll position.
     * @param options.yMargin Extra vertical distance to add when moving something into view. Not used with the `"center"` strategy. Defaults to 5.
     * @param options.xMargin Extra horizontal distance to add. Not used with the `"center"` strategy. Defaults to 5.
     */
    static scrollIntoView(pos, options = {}) {
        return extension/* scrollIntoView.of */.zT.of(new extension/* ScrollTarget */._V(typeof pos == "number" ? dist_state/* EditorSelection.cursor */.jT.cursor(pos) : pos, options.y, options.x, options.yMargin, options.xMargin));
    }
    /**
     * Returns an extension that can be used to add DOM event handlers. The value should be an
     * object mapping event names to handler functions. For any given event, such functions are
     * ordered by extension precedence, and the first handler to return true will be assumed
     * to have handled that event, and no other handlers or built-in behavior will be activated
     * for it. These are registered on the [content element]{@link contentDOM}, except for `scroll`
     * handlers, which will be called any time the editor's [scroll element]{@link scrollDOM}
     * or one of its parent nodes is scrolled.
     */
    static domEventHandlers(handlers) {
        return extension/* ViewPlugin.define */.lg.define(() => ({}), { eventHandlers: handlers });
    }
    /**
     * Create a theme extension. The first argument can be a [`style-mod`](https://github.com/marijnh/style-mod#documentation)
     * style spec providing the styles for the theme. These will be prefixed with a generated class for
     * the style. Because the selectors will be prefixed with a scope class, rule that directly match
     * the editor's [wrapper element]{@link EditorView.dom}—to which the scope class will be added—need
     * to be explicitly differentiated by adding an `&` to the selector for that element—for example
     * `&.cm-focused`. When `dark` is set to true, the theme will be marked as dark, which will cause
     * the `&dark` rules from [base themes]{@link baseTheme} to be used (as opposed to `&light` when a
     * light theme is active).
     */
    static theme(spec, options) {
        let prefix = style_mod/* StyleModule.newName */.V.newName();
        let result = [theme.of(prefix), extension/* styleModule.of */.qh.of(buildTheme(`.${prefix}`, spec))];
        if (options && options.dark)
            result.push(darkTheme.of(true));
        return result;
    }
    /**
     * Create an extension that adds styles to the base theme. Like with [`theme`]{@link theme},
     * use `&` to indicate the place of the editor wrapper element when directly targeting that. You can
     * also use `&dark` or `&light` instead to only target editors with a dark or light theme.
     */
    static baseTheme(spec) {
        return dist_state/* Prec.lowest */.Wl.lowest(extension/* styleModule.of */.qh.of(buildTheme("." + baseThemeID, spec, lightDarkIDs)));
    }
}
/**
 * Facet to add a [style module](https://github.com/marijnh/style-mod#documentation) to
 * an editor view. The view will ensure that the module is mounted in its
 * [document root]{@link root}.
 */
EditorView.styleModule = extension/* styleModule */.qh;
/**
 * An input handler can override the way changes to the editable DOM content are handled.
 * Handlers are passed the document positions between which the change was found, and the
 * new content. When one returns true, no further input handlers are called and the default
 * behavior is prevented.
 */
EditorView.inputHandler = extension/* inputHandler */.wv;
/**
 * By default, the editor assumes all its content has the same [text direction]{@link Direction}.
 * Configure this with a `true` value to make it read the text direction of every (rendered)
 * line separately.
 */
EditorView.perLineTextDirection = extension/* perLineTextDirection */.F0;
/**
 * Allows you to provide a function that should be called when the library catches an exception
 * from an extension (mostly from view plugins, but may be used by other extensions to route
 * exceptions from user-code-provided callbacks). This is mostly useful for debugging and logging.
 * See {@link logException}.
 */
EditorView.exceptionSink = extension/* exceptionSink */.Tg;
/** A facet that can be used to register a function to be called every time the view updates. */
EditorView.updateListener = extension/* updateListener */.U6;
/**
 * Facet that controls whether the editor content DOM is editable. When its highest-precedence
 * value is `false`, the element will not have its `contenteditable` attribute set. (Note that
 * this doesn't affect API calls that change the editor content, even when those are bound to keys
 * or buttons. See the {@link readOnly} facet for that.)
 */
EditorView.editable = extension/* editable */.Ah;
/**
 * Allows you to influence the way mouse selection happens. The functions in this facet will
 * be called for a `mousedown` event on the editor, and can return an object that overrides
 * the way a selection is computed from that mouse click or drag.
 */
EditorView.mouseSelectionStyle = extension/* mouseSelectionStyle */.j5;
/**
 * Facet used to configure whether a given selection drag event should move or copy the
 * selection. The given predicate will be called with the `mousedown` event, and can return
 * `true` when the drag should move the content.
 */
EditorView.dragMovesSelection = extension/* dragMovesSelection */.Gl;
/**
 * Facet used to configure whether a given selecting click adds a new range to the existing
 * selection or replaces it entirely. The default behavior is to check `event.metaKey` on macOS,
 * and `event.ctrlKey` elsewhere.
 */
EditorView.clickAddsSelectionRange = extension/* clickAddsSelectionRange */.FT;
/**
 * A facet that determines which [decorations](#view.Decoration) are shown in the view.
 * Decorations can be provided in two ways—directly, or via a function that takes an editor view.
 *
 * Only decoration sets provided directly are allowed to influence the editor's vertical
 * layout structure. The ones provided as functions are called _after_ the new viewport
 * has been computed, and thus **must not** introduce block widgets or replacing decorations
 * that cover line breaks.
 */
EditorView.decorations = extension/* decorations */.ah;
/**
 * Used to provide ranges that should be treated as atoms as far as cursor motion is concerned.
 * This causes methods like [`moveByChar`]{@link moveByChar} and [`moveVertically`]{@link moveVertically}
 * (and the commands built on top of them) to skip across such regions when a selection endpoint
 * would enter them. This does _not_ prevent direct programmatic
 * [selection updates]{@link TransactionSpec.selection} from moving into such regions.
 */
EditorView.atomicRanges = extension/* atomicRanges */.JD;
/**
 * Facet that allows extensions to provide additional scroll margins (space around the sides of
 * the scrolling element that should be considered invisible). This can be useful when the plugin
 * introduces elements that cover part of that element (for example a horizontally fixed gutter).
 */
EditorView.scrollMargins = extension/* scrollMargins */.s_;
/**
 * This facet records whether a dark theme is active. The extension returned by [`theme`]{@link theme}
 * automatically includes an instance of this when the `dark` option is set to true.
 */
EditorView.darkTheme = darkTheme;
/** Facet that provides additional DOM attributes for the editor's editable DOM element. */
EditorView.contentAttributes = extension/* contentAttributes */.tk;
/** Facet that provides DOM attributes for the editor's outer element. */
EditorView.editorAttributes = extension/* editorAttributes */._l;
/** An extension that enables line wrapping in the editor (by setting CSS `white-space` to `pre-wrap` in the content). */
EditorView.lineWrapping = EditorView.contentAttributes.of({ "class": "cm-lineWrapping" });
/**
 * State effect used to include screen reader announcements in a transaction. These will be added
 * to the DOM in a visually hidden element with `aria-live="polite"` set, and should be used to
 * describe effects that are visually obvious but may not be noticed by screen reader users (such
 * as moving to the next search match).
 */
EditorView.announce = dist_state/* StateEffect.define */.Py.define();
// Maximum line length for which we compute accurate bidi info
const MaxBidiLine = 4096;
const BadMeasure = {};
class CachedOrder {
    constructor(from, to, dir, order) {
        this.from = from;
        this.to = to;
        this.dir = dir;
        this.order = order;
    }
    static update(cache, changes) {
        if (changes.empty)
            return cache;
        let result = [], lastDir = cache.length ? cache[cache.length - 1].dir : bidi/* Direction.LTR */.Nm.LTR;
        for (let i = Math.max(0, cache.length - 10); i < cache.length; i++) {
            let entry = cache[i];
            if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
                result.push(new CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.order));
        }
        return result;
    }
}
function attrsFromFacet(view, facet, base) {
    for (let sources = view.state.facet(facet), i = sources.length - 1; i >= 0; i--) {
        let source = sources[i], value = typeof source == "function" ? source(view) : source;
        if (value)
            (0,attributes/* combineAttrs */.CR)(value, base);
    }
    return base;
}


/***/ }),

/***/ 179:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "$m": () => (/* binding */ viewPlugin),
/* harmony export */   "Ah": () => (/* binding */ editable),
/* harmony export */   "F0": () => (/* binding */ perLineTextDirection),
/* harmony export */   "FT": () => (/* binding */ clickAddsSelectionRange),
/* harmony export */   "Gl": () => (/* binding */ dragMovesSelection),
/* harmony export */   "JD": () => (/* binding */ atomicRanges),
/* harmony export */   "OO": () => (/* binding */ logException),
/* harmony export */   "TB": () => (/* binding */ ViewUpdate),
/* harmony export */   "Tg": () => (/* binding */ exceptionSink),
/* harmony export */   "U6": () => (/* binding */ updateListener),
/* harmony export */   "Uh": () => (/* binding */ ChangedRange),
/* harmony export */   "_V": () => (/* binding */ ScrollTarget),
/* harmony export */   "_l": () => (/* binding */ editorAttributes),
/* harmony export */   "ah": () => (/* binding */ decorations),
/* harmony export */   "dl": () => (/* binding */ PluginInstance),
/* harmony export */   "j5": () => (/* binding */ mouseSelectionStyle),
/* harmony export */   "lg": () => (/* binding */ ViewPlugin),
/* harmony export */   "qh": () => (/* binding */ styleModule),
/* harmony export */   "s_": () => (/* binding */ scrollMargins),
/* harmony export */   "tk": () => (/* binding */ contentAttributes),
/* harmony export */   "wv": () => (/* binding */ inputHandler),
/* harmony export */   "zT": () => (/* binding */ scrollIntoView)
/* harmony export */ });
/* harmony import */ var _state_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(535);
/* harmony import */ var _decoration_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(22);


const clickAddsSelectionRange = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
const dragMovesSelection = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
const mouseSelectionStyle = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
const exceptionSink = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
const updateListener = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
const inputHandler = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
const perLineTextDirection = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define({
    combine: values => values.some(x => x)
});
class ScrollTarget {
    constructor(range, y = "nearest", x = "nearest", yMargin = 5, xMargin = 5) {
        this.range = range;
        this.y = y;
        this.x = x;
        this.yMargin = yMargin;
        this.xMargin = xMargin;
    }
    map(changes) {
        return changes.empty ? this : new ScrollTarget(this.range.map(changes), this.y, this.x, this.yMargin, this.xMargin);
    }
}
const scrollIntoView = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .StateEffect.define */ .Py.define({ map: (t, ch) => t.map(ch) });
/**
 * Log or report an unhandled exception in client code. Should probably only be used by
 * extension code that allows client code to provide functions, and calls those functions
 * in a context where an exception can't be propagated to calling code in a reasonable way
 * (for example when in an event handler).
 *
 * Either calls a handler registered with {@link EditorView.exceptionSink}, `window.onerror`,
 * if defined, or `console.error` (in which case it'll pass `context`, when given, as first argument).
 */
function logException(state, exception, context) {
    let handler = state.facet(exceptionSink);
    if (handler.length)
        handler[0](exception);
    else if (window.onerror)
        window.onerror(String(exception), context, undefined, undefined, exception);
    else if (context)
        console.error(context + ":", exception);
    else
        console.error(exception);
}
const editable = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define({ combine: values => values.length ? values[0] : true });
let nextPluginID = 0;
const viewPlugin = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
/**
 * View plugins associate stateful values with a view. They can influence the way the content is drawn,
 * and are notified of things that happen in the view.
 */
class ViewPlugin {
    constructor(
    // @internal
    id, 
    // @internal
    create, 
    // @internal
    domEventHandlers, buildExtensions) {
        this.id = id;
        this.create = create;
        this.domEventHandlers = domEventHandlers;
        this.extension = buildExtensions(this);
    }
    /** Define a plugin from a constructor function that creates the plugin's value, given an editor view. */
    static define(create, spec) {
        const { eventHandlers, provide, decorations: deco } = spec || {};
        return new ViewPlugin(nextPluginID++, create, eventHandlers, plugin => {
            let ext = [viewPlugin.of(plugin)];
            if (deco)
                ext.push(decorations.of(view => {
                    let pluginInst = view.plugin(plugin);
                    return pluginInst ? deco(pluginInst) : _decoration_js__WEBPACK_IMPORTED_MODULE_1__/* .Decoration.none */ .p.none;
                }));
            if (provide)
                ext.push(provide(plugin));
            return ext;
        });
    }
    /** Create a plugin for a class whose constructor takes a single editor view as argument. */
    static fromClass(cls, spec) {
        return ViewPlugin.define(view => new cls(view), spec);
    }
}
class PluginInstance {
    constructor(spec) {
        this.spec = spec;
        this.mustUpdate = null;
        // This is null when the plugin is initially created, but initialized on the first update.
        this.value = null;
    }
    update(view) {
        if (!this.value) {
            if (this.spec) {
                try {
                    this.value = this.spec.create(view);
                }
                catch (e) {
                    logException(view.state, e, "CodeMirror plugin crashed");
                    this.deactivate();
                }
            }
        }
        else if (this.mustUpdate) {
            let update = this.mustUpdate;
            this.mustUpdate = null;
            if (this.value.update) {
                try {
                    this.value.update(update);
                }
                catch (e) {
                    logException(update.state, e, "CodeMirror plugin crashed");
                    if (this.value.destroy)
                        try {
                            this.value.destroy();
                        }
                        catch (_) { }
                    this.deactivate();
                }
            }
        }
        return this;
    }
    destroy(view) {
        var _a;
        if ((_a = this.value) === null || _a === void 0 ? void 0 : _a.destroy) {
            try {
                this.value.destroy();
            }
            catch (e) {
                logException(view.state, e, "CodeMirror plugin crashed");
            }
        }
    }
    deactivate() {
        this.spec = this.value = null;
    }
}
const editorAttributes = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
const contentAttributes = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
// Provide decorations
const decorations = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
const atomicRanges = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
const scrollMargins = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
const styleModule = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define();
class ChangedRange {
    constructor(fromA, toA, fromB, toB) {
        this.fromA = fromA;
        this.toA = toA;
        this.fromB = fromB;
        this.toB = toB;
    }
    join(other) {
        return new ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
    }
    addToSet(set) {
        let i = set.length, me = this;
        for (; i > 0; i--) {
            let range = set[i - 1];
            if (range.fromA > me.toA)
                continue;
            if (range.toA < me.fromA)
                break;
            me = me.join(range);
            set.splice(i - 1, 1);
        }
        set.splice(i, 0, me);
        return set;
    }
    static extendWithRanges(diff, ranges) {
        if (ranges.length == 0)
            return diff;
        let result = [];
        for (let dI = 0, rI = 0, posA = 0, posB = 0;; dI++) {
            let next = dI == diff.length ? null : diff[dI], off = posA - posB;
            let end = next ? next.fromB : 1e9;
            while (rI < ranges.length && ranges[rI] < end) {
                let from = ranges[rI], to = ranges[rI + 1];
                let fromB = Math.max(posB, from), toB = Math.min(end, to);
                if (fromB <= toB)
                    new ChangedRange(fromB + off, toB + off, fromB, toB).addToSet(result);
                if (to > end)
                    break;
                else
                    rI += 2;
            }
            if (!next)
                return result;
            new ChangedRange(next.fromA, next.toA, next.fromB, next.toB).addToSet(result);
            posA = next.toA;
            posB = next.toB;
        }
    }
}
/** View [plugins](#view.ViewPlugin) are given instances of this class, which describe what happened, whenever the view is updated. */
class ViewUpdate {
    constructor(
    /** The editor view that the update is associated with. */
    view, 
    /** The new editor state. */
    state, 
    /** The transactions involved in the update. May be empty. */
    transactions) {
        this.view = view;
        this.state = state;
        this.transactions = transactions;
        // @internal
        this.flags = 0;
        this.startState = view.state;
        this.changes = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .ChangeSet.empty */ .as.empty(this.startState.doc.length);
        for (let tr of transactions)
            this.changes = this.changes.compose(tr.changes);
        let changedRanges = [];
        this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
        this.changedRanges = changedRanges;
        let focus = view.hasFocus;
        if (focus != view.inputState.notifiedFocused) {
            view.inputState.notifiedFocused = focus;
            this.flags |= 1 /* Focus */;
        }
    }
    // @internal
    static create(view, state, transactions) {
        return new ViewUpdate(view, state, transactions);
    }
    /** Tells you whether the [viewport]{@link EditorView.viewport} or [visible ranges]{@link EditorView.visibleRanges} changed in this update. */
    get viewportChanged() {
        return (this.flags & 4 /* Viewport */) > 0;
    }
    /** Indicates whether the height of a block element in the editor changed in this update. */
    get heightChanged() {
        return (this.flags & 2 /* Height */) > 0;
    }
    /** Returns true when the document was modified or the size of the editor, or elements within the editor, changed. */
    get geometryChanged() {
        return this.docChanged || (this.flags & (8 /* Geometry */ | 2 /* Height */)) > 0;
    }
    /** True when this update indicates a focus change. */
    get focusChanged() {
        return (this.flags & 1 /* Focus */) > 0;
    }
    /** Whether the document changed in this update. */
    get docChanged() {
        return !this.changes.empty;
    }
    /** Whether the selection was explicitly set in this update. */
    get selectionSet() {
        return this.transactions.some(tr => tr.selection);
    }
    // @internal
    get empty() { return this.flags == 0 && this.transactions.length == 0; }
}


/***/ }),

/***/ 625:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "bs": () => (/* binding */ heightRelevantDecoChanges),
/* harmony export */   "eU": () => (/* binding */ HeightOracle),
/* harmony export */   "td": () => (/* binding */ BlockInfo),
/* harmony export */   "uG": () => (/* binding */ HeightMap),
/* harmony export */   "xL": () => (/* binding */ QueryType),
/* harmony export */   "y_": () => (/* binding */ MeasuredHeights)
/* harmony export */ });
/* harmony import */ var _state_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(535);
/* harmony import */ var _decoration_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(22);


const wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line", "break-spaces"];
class HeightOracle {
    constructor() {
        this.doc = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Text.empty */ .xv.empty;
        this.lineWrapping = false;
        this.heightSamples = {};
        this.lineHeight = 14;
        this.charWidth = 7;
        this.lineLength = 30;
        // Used to track, during updateHeight, if any actual heights changed
        this.heightChanged = false;
    }
    heightForGap(from, to) {
        let lines = this.doc.lineAt(to).number - this.doc.lineAt(from).number + 1;
        if (this.lineWrapping)
            lines += Math.ceil(((to - from) - (lines * this.lineLength * 0.5)) / this.lineLength);
        return this.lineHeight * lines;
    }
    heightForLine(length) {
        if (!this.lineWrapping)
            return this.lineHeight;
        let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / (this.lineLength - 5)));
        return lines * this.lineHeight;
    }
    setDoc(doc) { this.doc = doc; return this; }
    mustRefreshForWrapping(whiteSpace) {
        return (wrappingWhiteSpace.indexOf(whiteSpace) > -1) != this.lineWrapping;
    }
    mustRefreshForHeights(lineHeights) {
        let newHeight = false;
        for (let i = 0; i < lineHeights.length; i++) {
            let h = lineHeights[i];
            if (h < 0) {
                i++;
            }
            else if (!this.heightSamples[Math.floor(h * 10)]) { // Round to .1 pixels
                newHeight = true;
                this.heightSamples[Math.floor(h * 10)] = true;
            }
        }
        return newHeight;
    }
    refresh(whiteSpace, lineHeight, charWidth, lineLength, knownHeights) {
        let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
        let changed = Math.round(lineHeight) != Math.round(this.lineHeight) || this.lineWrapping != lineWrapping;
        this.lineWrapping = lineWrapping;
        this.lineHeight = lineHeight;
        this.charWidth = charWidth;
        this.lineLength = lineLength;
        if (changed) {
            this.heightSamples = {};
            for (let i = 0; i < knownHeights.length; i++) {
                let h = knownHeights[i];
                if (h < 0)
                    i++;
                else
                    this.heightSamples[Math.floor(h * 10)] = true;
            }
        }
        return changed;
    }
}
/**
 * This object is used by `updateHeight` to make DOM measurements arrive at the right nides.
 * The `heights` array is a sequence of block heights, starting from position `from`.
 */
class MeasuredHeights {
    constructor(from, heights) {
        this.from = from;
        this.heights = heights;
        this.index = 0;
    }
    get more() { return this.index < this.heights.length; }
}
/** Record used to represent information about a block-level element in the editor view. */
class BlockInfo {
    /**
     * @param from The start of the element in the document.
     * @param length The length of the element.
     * @param top The top position of the element (relative to the top of the document).
     * @param height Its height.
     * @param type The type of element this is. When querying lines, this may be an array of all the
     *              blocks that make up the line.
     */
    // @internal
    constructor(from, length, top, height, type) {
        this.from = from;
        this.length = length;
        this.top = top;
        this.height = height;
        this.type = type;
    }
    /** The end of the element as a document position. */
    get to() { return this.from + this.length; }
    /** The bottom position of the element. */
    get bottom() { return this.top + this.height; }
    // @internal
    join(other) {
        let detail = (Array.isArray(this.type) ? this.type : [this]).concat(Array.isArray(other.type) ? other.type : [other]);
        return new BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, detail);
    }
}
var QueryType;
(function (QueryType) {
    QueryType[QueryType["ByPos"] = 0] = "ByPos";
    QueryType[QueryType["ByHeight"] = 1] = "ByHeight";
    QueryType[QueryType["ByPosNoHeight"] = 2] = "ByPosNoHeight";
})(QueryType || (QueryType = {}));
const Epsilon = 1e-3;
class HeightMap {
    constructor(length, // The number of characters covered
    height, // Height of this part of the document
    flags = 2 /* Outdated */) {
        this.length = length;
        this.height = height;
        this.flags = flags;
    }
    get outdated() { return (this.flags & 2 /* Outdated */) > 0; }
    set outdated(value) { this.flags = (value ? 2 /* Outdated */ : 0) | (this.flags & ~2 /* Outdated */); }
    setHeight(oracle, height) {
        if (this.height != height) {
            if (Math.abs(this.height - height) > Epsilon)
                oracle.heightChanged = true;
            this.height = height;
        }
    }
    /**
     * Base case is to replace a leaf node, which simply builds a tree from the new nodes and
     * returns that (HeightMapBranch and HeightMapGap override this to actually use from/to)
     */
    replace(_from, _to, nodes) {
        return HeightMap.of(nodes);
    }
    /** Again, these are base cases, and are overridden for branch and gap nodes. */
    decomposeLeft(_to, result) { result.push(this); }
    decomposeRight(_from, result) { result.push(this); }
    applyChanges(decorations, oldDoc, oracle, changes) {
        let me = this;
        for (let i = changes.length - 1; i >= 0; i--) {
            let { fromA, toA, fromB, toB } = changes[i];
            let start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
            let end = start.to >= toA ? start : me.lineAt(toA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
            toB += end.to - toA;
            toA = end.to;
            while (i > 0 && start.from <= changes[i - 1].toA) {
                fromA = changes[i - 1].fromA;
                fromB = changes[i - 1].fromB;
                i--;
                if (fromA < start.from)
                    start = me.lineAt(fromA, QueryType.ByPosNoHeight, oldDoc, 0, 0);
            }
            fromB += start.from - fromA;
            fromA = start.from;
            let nodes = NodeBuilder.build(oracle, decorations, fromB, toB);
            me = me.replace(fromA, toA, nodes);
        }
        return me.updateHeight(oracle, 0);
    }
    static empty() { return new HeightMapText(0, 0); }
    /**
     * nodes uses null values to indicate the position of line breaks. There are never line breaks
     * at the start or end of the array, or two line breaks next to each other, and the array isn't
     * allowed to be empty (same restrictions as return value from the builder).
     */
    static of(nodes) {
        if (nodes.length == 1)
            return nodes[0];
        let i = 0, j = nodes.length, before = 0, after = 0;
        for (;;) {
            if (i == j) {
                if (before > after * 2) {
                    let split = nodes[i - 1];
                    if (split.break)
                        nodes.splice(--i, 1, split.left, null, split.right);
                    else
                        nodes.splice(--i, 1, split.left, split.right);
                    j += 1 + split.break;
                    before -= split.size;
                }
                else if (after > before * 2) {
                    let split = nodes[j];
                    if (split.break)
                        nodes.splice(j, 1, split.left, null, split.right);
                    else
                        nodes.splice(j, 1, split.left, split.right);
                    j += 2 + split.break;
                    after -= split.size;
                }
                else {
                    break;
                }
            }
            else if (before < after) {
                let next = nodes[i++];
                if (next)
                    before += next.size;
            }
            else {
                let next = nodes[--j];
                if (next)
                    after += next.size;
            }
        }
        let brk = 0;
        if (nodes[i - 1] == null) {
            brk = 1;
            i--;
        }
        else if (nodes[i] == null) {
            brk = 1;
            j++;
        }
        return new HeightMapBranch(HeightMap.of(nodes.slice(0, i)), brk, HeightMap.of(nodes.slice(j)));
    }
}
HeightMap.prototype.size = 1;
class HeightMapBlock extends HeightMap {
    constructor(length, height, type) {
        super(length, height);
        this.type = type;
    }
    blockAt(_height, _doc, top, offset) {
        return new BlockInfo(offset, this.length, top, this.height, this.type);
    }
    lineAt(_value, _type, doc, top, offset) {
        return this.blockAt(0, doc, top, offset);
    }
    forEachLine(from, to, doc, top, offset, f) {
        if (from <= offset + this.length && to >= offset)
            f(this.blockAt(0, doc, top, offset));
    }
    updateHeight(oracle, offset = 0, _force = false, measured) {
        if (measured && measured.from <= offset && measured.more)
            this.setHeight(oracle, measured.heights[measured.index++]);
        this.outdated = false;
        return this;
    }
    toString() { return `block(${this.length})`; }
}
class HeightMapText extends HeightMapBlock {
    constructor(length, height) {
        super(length, height, _decoration_js__WEBPACK_IMPORTED_MODULE_1__/* .BlockType.Text */ .kH.Text);
        this.collapsed = 0; // Amount of collapsed content in the line
        this.widgetHeight = 0; // Maximum inline widget height
    }
    replace(_from, _to, nodes) {
        let node = nodes[0];
        if (nodes.length == 1 && (node instanceof HeightMapText || node instanceof HeightMapGap && (node.flags & 4 /* SingleLine */)) &&
            Math.abs(this.length - node.length) < 10) {
            if (node instanceof HeightMapGap)
                node = new HeightMapText(node.length, this.height);
            else
                node.height = this.height;
            if (!this.outdated)
                node.outdated = false;
            return node;
        }
        else {
            return HeightMap.of(nodes);
        }
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
        if (measured && measured.from <= offset && measured.more)
            this.setHeight(oracle, measured.heights[measured.index++]);
        else if (force || this.outdated)
            this.setHeight(oracle, Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)));
        this.outdated = false;
        return this;
    }
    toString() {
        return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
    }
}
class HeightMapGap extends HeightMap {
    constructor(length) { super(length, 0); }
    lines(doc, offset) {
        let firstLine = doc.lineAt(offset).number, lastLine = doc.lineAt(offset + this.length).number;
        return { firstLine, lastLine, lineHeight: this.height / (lastLine - firstLine + 1) };
    }
    blockAt(height, doc, top, offset) {
        let { firstLine, lastLine, lineHeight } = this.lines(doc, offset);
        let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top) / lineHeight)));
        let { from, length } = doc.line(firstLine + line);
        return new BlockInfo(from, length, top + lineHeight * line, lineHeight, _decoration_js__WEBPACK_IMPORTED_MODULE_1__/* .BlockType.Text */ .kH.Text);
    }
    lineAt(value, type, doc, top, offset) {
        if (type == QueryType.ByHeight)
            return this.blockAt(value, doc, top, offset);
        if (type == QueryType.ByPosNoHeight) {
            let { from, to } = doc.lineAt(value);
            return new BlockInfo(from, to - from, 0, 0, _decoration_js__WEBPACK_IMPORTED_MODULE_1__/* .BlockType.Text */ .kH.Text);
        }
        let { firstLine, lineHeight } = this.lines(doc, offset);
        let { from, length, number } = doc.lineAt(value);
        return new BlockInfo(from, length, top + lineHeight * (number - firstLine), lineHeight, _decoration_js__WEBPACK_IMPORTED_MODULE_1__/* .BlockType.Text */ .kH.Text);
    }
    forEachLine(from, to, doc, top, offset, f) {
        let { firstLine, lineHeight } = this.lines(doc, offset);
        for (let pos = Math.max(from, offset), end = Math.min(offset + this.length, to); pos <= end;) {
            let line = doc.lineAt(pos);
            if (pos == from)
                top += lineHeight * (line.number - firstLine);
            f(new BlockInfo(line.from, line.length, top, lineHeight, _decoration_js__WEBPACK_IMPORTED_MODULE_1__/* .BlockType.Text */ .kH.Text));
            top += lineHeight;
            pos = line.to + 1;
        }
    }
    replace(from, to, nodes) {
        let after = this.length - to;
        if (after > 0) {
            let last = nodes[nodes.length - 1];
            if (last instanceof HeightMapGap)
                nodes[nodes.length - 1] = new HeightMapGap(last.length + after);
            else
                nodes.push(null, new HeightMapGap(after - 1));
        }
        if (from > 0) {
            let first = nodes[0];
            if (first instanceof HeightMapGap)
                nodes[0] = new HeightMapGap(from + first.length);
            else
                nodes.unshift(new HeightMapGap(from - 1), null);
        }
        return HeightMap.of(nodes);
    }
    decomposeLeft(to, result) {
        result.push(new HeightMapGap(to - 1), null);
    }
    decomposeRight(from, result) {
        result.push(null, new HeightMapGap(this.length - from - 1));
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
        let end = offset + this.length;
        if (measured && measured.from <= offset + this.length && measured.more) {
            let nodes = [], pos = Math.max(offset, measured.from), singleHeight = -1;
            let wasChanged = oracle.heightChanged;
            if (measured.from > offset)
                nodes.push(new HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
            while (pos <= end && measured.more) {
                let len = oracle.doc.lineAt(pos).length;
                if (nodes.length)
                    nodes.push(null);
                let height = measured.heights[measured.index++];
                if (singleHeight == -1)
                    singleHeight = height;
                else if (Math.abs(height - singleHeight) >= Epsilon)
                    singleHeight = -2;
                let line = new HeightMapText(len, height);
                line.outdated = false;
                nodes.push(line);
                pos += len + 1;
            }
            if (pos <= end)
                nodes.push(null, new HeightMapGap(end - pos).updateHeight(oracle, pos));
            let result = HeightMap.of(nodes);
            oracle.heightChanged = wasChanged || singleHeight < 0 || Math.abs(result.height - this.height) >= Epsilon ||
                Math.abs(singleHeight - this.lines(oracle.doc, offset).lineHeight) >= Epsilon;
            return result;
        }
        else if (force || this.outdated) {
            this.setHeight(oracle, oracle.heightForGap(offset, offset + this.length));
            this.outdated = false;
        }
        return this;
    }
    toString() { return `gap(${this.length})`; }
}
class HeightMapBranch extends HeightMap {
    constructor(left, brk, right) {
        super(left.length + brk + right.length, left.height + right.height, brk | (left.outdated || right.outdated ? 2 /* Outdated */ : 0));
        this.left = left;
        this.right = right;
        this.size = left.size + right.size;
    }
    get break() { return this.flags & 1 /* Break */; }
    blockAt(height, doc, top, offset) {
        let mid = top + this.left.height;
        return height < mid ? this.left.blockAt(height, doc, top, offset) :
            this.right.blockAt(height, doc, mid, offset + this.left.length + this.break);
    }
    lineAt(value, type, doc, top, offset) {
        let rightTop = top + this.left.height, rightOffset = offset + this.left.length + this.break;
        let left = type == QueryType.ByHeight ? value < rightTop : value < rightOffset;
        let base = left ? this.left.lineAt(value, type, doc, top, offset) :
            this.right.lineAt(value, type, doc, rightTop, rightOffset);
        if (this.break || (left ? base.to < rightOffset : base.from > rightOffset))
            return base;
        let subQuery = type == QueryType.ByPosNoHeight ? QueryType.ByPosNoHeight : QueryType.ByPos;
        if (left)
            return base.join(this.right.lineAt(rightOffset, subQuery, doc, rightTop, rightOffset));
        else
            return this.left.lineAt(rightOffset, subQuery, doc, top, offset).join(base);
    }
    forEachLine(from, to, doc, top, offset, f) {
        let rightTop = top + this.left.height, rightOffset = offset + this.left.length + this.break;
        if (this.break) {
            if (from < rightOffset)
                this.left.forEachLine(from, to, doc, top, offset, f);
            if (to >= rightOffset)
                this.right.forEachLine(from, to, doc, rightTop, rightOffset, f);
        }
        else {
            let mid = this.lineAt(rightOffset, QueryType.ByPos, doc, top, offset);
            if (from < mid.from)
                this.left.forEachLine(from, mid.from - 1, doc, top, offset, f);
            if (mid.to >= from && mid.from <= to)
                f(mid);
            if (to > mid.to)
                this.right.forEachLine(mid.to + 1, to, doc, rightTop, rightOffset, f);
        }
    }
    replace(from, to, nodes) {
        let rightStart = this.left.length + this.break;
        if (to < rightStart)
            return this.balanced(this.left.replace(from, to, nodes), this.right);
        if (from > this.left.length)
            return this.balanced(this.left, this.right.replace(from - rightStart, to - rightStart, nodes));
        let result = [];
        if (from > 0)
            this.decomposeLeft(from, result);
        let left = result.length;
        for (let node of nodes)
            result.push(node);
        if (from > 0)
            mergeGaps(result, left - 1);
        if (to < this.length) {
            let right = result.length;
            this.decomposeRight(to, result);
            mergeGaps(result, right);
        }
        return HeightMap.of(result);
    }
    decomposeLeft(to, result) {
        let left = this.left.length;
        if (to <= left)
            return this.left.decomposeLeft(to, result);
        result.push(this.left);
        if (this.break) {
            left++;
            if (to >= left)
                result.push(null);
        }
        if (to > left)
            this.right.decomposeLeft(to - left, result);
    }
    decomposeRight(from, result) {
        let left = this.left.length, right = left + this.break;
        if (from >= right)
            return this.right.decomposeRight(from - right, result);
        if (from < left)
            this.left.decomposeRight(from, result);
        if (this.break && from < right)
            result.push(null);
        result.push(this.right);
    }
    balanced(left, right) {
        if (left.size > 2 * right.size || right.size > 2 * left.size)
            return HeightMap.of(this.break ? [left, null, right] : [left, right]);
        this.left = left;
        this.right = right;
        this.height = left.height + right.height;
        this.outdated = left.outdated || right.outdated;
        this.size = left.size + right.size;
        this.length = left.length + this.break + right.length;
        return this;
    }
    updateHeight(oracle, offset = 0, force = false, measured) {
        let { left, right } = this, rightStart = offset + left.length + this.break, rebalance = null;
        if (measured && measured.from <= offset + left.length && measured.more)
            rebalance = left = left.updateHeight(oracle, offset, force, measured);
        else
            left.updateHeight(oracle, offset, force);
        if (measured && measured.from <= rightStart + right.length && measured.more)
            rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
        else
            right.updateHeight(oracle, rightStart, force);
        if (rebalance)
            return this.balanced(left, right);
        this.height = this.left.height + this.right.height;
        this.outdated = false;
        return this;
    }
    toString() { return this.left + (this.break ? " " : "-") + this.right; }
}
function mergeGaps(nodes, around) {
    let before, after;
    if (nodes[around] == null &&
        (before = nodes[around - 1]) instanceof HeightMapGap &&
        (after = nodes[around + 1]) instanceof HeightMapGap)
        nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
}
const relevantWidgetHeight = 5;
class NodeBuilder {
    constructor(pos, oracle) {
        this.pos = pos;
        this.oracle = oracle;
        this.nodes = [];
        this.lineStart = -1;
        this.lineEnd = -1;
        this.covering = null;
        this.writtenTo = pos;
    }
    get isCovered() {
        return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
    }
    span(_from, to) {
        if (this.lineStart > -1) {
            let end = Math.min(to, this.lineEnd), last = this.nodes[this.nodes.length - 1];
            if (last instanceof HeightMapText)
                last.length += end - this.pos;
            else if (end > this.pos || !this.isCovered)
                this.nodes.push(new HeightMapText(end - this.pos, -1));
            this.writtenTo = end;
            if (to > end) {
                this.nodes.push(null);
                this.writtenTo++;
                this.lineStart = -1;
            }
        }
        this.pos = to;
    }
    point(from, to, deco) {
        if (from < to || deco.heightRelevant) {
            let height = deco.widget ? deco.widget.estimatedHeight : 0;
            if (height < 0)
                height = this.oracle.lineHeight;
            let len = to - from;
            if (deco.block) {
                this.addBlock(new HeightMapBlock(len, height, deco.type));
            }
            else if (len || height >= relevantWidgetHeight) {
                this.addLineDeco(height, len);
            }
        }
        else if (to > from) {
            this.span(from, to);
        }
        if (this.lineEnd > -1 && this.lineEnd < this.pos)
            this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
    }
    enterLine() {
        if (this.lineStart > -1)
            return;
        let { from, to } = this.oracle.doc.lineAt(this.pos);
        this.lineStart = from;
        this.lineEnd = to;
        if (this.writtenTo < from) {
            if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
                this.nodes.push(this.blankContent(this.writtenTo, from - 1));
            this.nodes.push(null);
        }
        if (this.pos > from)
            this.nodes.push(new HeightMapText(this.pos - from, -1));
        this.writtenTo = this.pos;
    }
    blankContent(from, to) {
        let gap = new HeightMapGap(to - from);
        if (this.oracle.doc.lineAt(from).to == to)
            gap.flags |= 4 /* SingleLine */;
        return gap;
    }
    ensureLine() {
        this.enterLine();
        let last = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
        if (last instanceof HeightMapText)
            return last;
        let line = new HeightMapText(0, -1);
        this.nodes.push(line);
        return line;
    }
    addBlock(block) {
        this.enterLine();
        if (block.type == _decoration_js__WEBPACK_IMPORTED_MODULE_1__/* .BlockType.WidgetAfter */ .kH.WidgetAfter && !this.isCovered)
            this.ensureLine();
        this.nodes.push(block);
        this.writtenTo = this.pos = this.pos + block.length;
        if (block.type != _decoration_js__WEBPACK_IMPORTED_MODULE_1__/* .BlockType.WidgetBefore */ .kH.WidgetBefore)
            this.covering = block;
    }
    addLineDeco(height, length) {
        let line = this.ensureLine();
        line.length += length;
        line.collapsed += length;
        line.widgetHeight = Math.max(line.widgetHeight, height);
        this.writtenTo = this.pos = this.pos + length;
    }
    finish(from) {
        let last = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
        if (this.lineStart > -1 && !(last instanceof HeightMapText) && !this.isCovered)
            this.nodes.push(new HeightMapText(0, -1));
        else if (this.writtenTo < this.pos || last == null)
            this.nodes.push(this.blankContent(this.writtenTo, this.pos));
        let pos = from;
        for (let node of this.nodes) {
            if (node instanceof HeightMapText)
                node.updateHeight(this.oracle, pos);
            pos += node ? node.length : 1;
        }
        return this.nodes;
    }
    /**
     * Always called with a region that on both sides either stretches to a line break or
     * the end of the document. The returned array uses null to indicate line breaks, but
     * never starts or ends in a line break, or has multiple line breaks next to each other.
     */
    static build(oracle, decorations, from, to) {
        let builder = new NodeBuilder(from, oracle);
        _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .RangeSet.spans */ .Xs.spans(decorations, from, to, builder, 0);
        return builder.finish(from);
    }
}
function heightRelevantDecoChanges(a, b, diff) {
    let comp = new DecorationComparator;
    _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .RangeSet.compare */ .Xs.compare(a, b, diff, comp, 0);
    return comp.changes;
}
class DecorationComparator {
    constructor() {
        this.changes = [];
    }
    compareRange() { }
    comparePoint(from, to, a, b) {
        if (from < to || a && a.heightRelevant || b && b.heightRelevant)
            (0,_decoration_js__WEBPACK_IMPORTED_MODULE_1__/* .addRange */ .HX)(from, to, this.changes, 5);
    }
}


/***/ }),

/***/ 603:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Lf": () => (/* binding */ WidgetView),
/* harmony export */   "WR": () => (/* binding */ MarkView),
/* harmony export */   "WT": () => (/* binding */ inlineDOMAtPos),
/* harmony export */   "Wn": () => (/* binding */ joinInlineInto),
/* harmony export */   "gz": () => (/* binding */ coordsInChildren),
/* harmony export */   "kV": () => (/* binding */ WidgetBufferView),
/* harmony export */   "ve": () => (/* binding */ CompositionView),
/* harmony export */   "yS": () => (/* binding */ TextView)
/* harmony export */ });
/* harmony import */ var _state_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(535);
/* harmony import */ var _contentview_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(72);
/* harmony import */ var _dom_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(604);
/* harmony import */ var _browser_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(362);




const MaxJoinLen = 256;
class TextView extends _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .ContentView */ .Cl {
    constructor(text) {
        super();
        this.text = text;
    }
    get length() { return this.text.length; }
    createDOM(textDOM) {
        this.setDOM(textDOM || document.createTextNode(this.text));
    }
    sync(track) {
        if (!this.dom)
            this.createDOM();
        if (this.dom.nodeValue != this.text) {
            if (track && track.node == this.dom)
                track.written = true;
            this.dom.nodeValue = this.text;
        }
    }
    reuseDOM(dom) {
        if (dom.nodeType == 3)
            this.createDOM(dom);
    }
    merge(from, to, source) {
        if (source && (!(source instanceof TextView) || this.length - (to - from) + source.length > MaxJoinLen))
            return false;
        this.text = this.text.slice(0, from) + (source ? source.text : "") + this.text.slice(to);
        this.markDirty();
        return true;
    }
    split(from) {
        let result = new TextView(this.text.slice(from));
        this.text = this.text.slice(0, from);
        this.markDirty();
        return result;
    }
    localPosFromDOM(node, offset) {
        return node == this.dom ? offset : offset ? this.text.length : 0;
    }
    domAtPos(pos) { return new _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .DOMPos */ .Y4(this.dom, pos); }
    domBoundsAround(_from, _to, offset) {
        return { from: offset, to: offset + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
    }
    coordsAt(pos, side) {
        return textCoords(this.dom, pos, side);
    }
}
class MarkView extends _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .ContentView */ .Cl {
    constructor(mark, children = [], length = 0) {
        super();
        this.mark = mark;
        this.children = children;
        this.length = length;
        for (let ch of children)
            ch.setParent(this);
    }
    setAttrs(dom) {
        (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .clearAttributes */ .iO)(dom);
        if (this.mark.class)
            dom.className = this.mark.class;
        if (this.mark.attrs)
            for (let name in this.mark.attrs)
                dom.setAttribute(name, this.mark.attrs[name]);
        return dom;
    }
    reuseDOM(node) {
        if (node.nodeName == this.mark.tagName.toUpperCase()) {
            this.setDOM(node);
            this.dirty |= 4 /* Attrs */ | 2 /* Node */;
        }
    }
    sync(track) {
        if (!this.dom)
            this.setDOM(this.setAttrs(document.createElement(this.mark.tagName)));
        else if (this.dirty & 4 /* Attrs */)
            this.setAttrs(this.dom);
        super.sync(track);
    }
    merge(from, to, source, _hasStart, openStart, openEnd) {
        if (source && (!(source instanceof MarkView && source.mark.eq(this.mark)) ||
            (from && openStart <= 0) || (to < this.length && openEnd <= 0)))
            return false;
        (0,_contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .mergeChildrenInto */ .Sy)(this, from, to, source ? source.children : [], openStart - 1, openEnd - 1);
        this.markDirty();
        return true;
    }
    split(from) {
        let result = [], off = 0, detachFrom = -1, i = 0;
        for (let elt of this.children) {
            let end = off + elt.length;
            if (end > from)
                result.push(off < from ? elt.split(from - off) : elt);
            if (detachFrom < 0 && off >= from)
                detachFrom = i;
            off = end;
            i++;
        }
        let length = this.length - from;
        this.length = from;
        if (detachFrom > -1) {
            this.children.length = detachFrom;
            this.markDirty();
        }
        return new MarkView(this.mark, result, length);
    }
    domAtPos(pos) {
        return inlineDOMAtPos(this.dom, this.children, pos);
    }
    coordsAt(pos, side) {
        return coordsInChildren(this, pos, side);
    }
}
function textCoords(text, pos, side) {
    let length = text.nodeValue.length;
    if (pos > length)
        pos = length;
    let from = pos, to = pos, flatten = 0;
    if (pos == 0 && side < 0 || pos == length && side >= 0) {
        if (!(_browser_js__WEBPACK_IMPORTED_MODULE_3__/* ["default"].chrome */ .Z.chrome || _browser_js__WEBPACK_IMPORTED_MODULE_3__/* ["default"].gecko */ .Z.gecko)) { // These browsers reliably return valid rectangles for empty ranges
            if (pos) {
                from--;
                flatten = 1;
            } // FIXME this is wrong in RTL text
            else {
                to++;
                flatten = -1;
            }
        }
    }
    else {
        if (side < 0)
            from--;
        else
            to++;
    }
    let rects = (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .textRange */ .IA)(text, from, to).getClientRects();
    if (!rects.length)
        return _dom_js__WEBPACK_IMPORTED_MODULE_2__/* .Rect0 */ .ku;
    let rect = rects[(flatten ? flatten < 0 : side >= 0) ? 0 : rects.length - 1];
    if (_browser_js__WEBPACK_IMPORTED_MODULE_3__/* ["default"].safari */ .Z.safari && !flatten && rect.width == 0)
        rect = Array.prototype.find.call(rects, r => r.width) || rect;
    return flatten ? (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .flattenRect */ ._s)(rect, flatten < 0) : rect || null;
}
// Also used for collapsed ranges that don't have a placeholder widget!
class WidgetView extends _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .ContentView */ .Cl {
    constructor(widget, length, side) {
        super();
        this.widget = widget;
        this.length = length;
        this.side = side;
        this.prevWidget = null;
    }
    static create(widget, length, side) {
        return new (widget.customView || WidgetView)(widget, length, side);
    }
    split(from) {
        let result = WidgetView.create(this.widget, this.length - from, this.side);
        this.length -= from;
        return result;
    }
    sync() {
        if (!this.dom || !this.widget.updateDOM(this.dom)) {
            if (this.dom && this.prevWidget)
                this.prevWidget.destroy(this.dom);
            this.prevWidget = null;
            this.setDOM(this.widget.toDOM(this.editorView));
            this.dom.contentEditable = "false";
        }
    }
    getSide() { return this.side; }
    merge(from, to, source, hasStart, openStart, openEnd) {
        if (source && (!(source instanceof WidgetView) || !this.widget.compare(source.widget) ||
            from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
            return false;
        this.length = from + (source ? source.length : 0) + (this.length - to);
        return true;
    }
    become(other) {
        if (other.length == this.length && other instanceof WidgetView && other.side == this.side) {
            if (this.widget.constructor == other.widget.constructor) {
                if (!this.widget.eq(other.widget))
                    this.markDirty(true);
                if (this.dom && !this.prevWidget)
                    this.prevWidget = this.widget;
                this.widget = other.widget;
                return true;
            }
        }
        return false;
    }
    ignoreMutation() { return true; }
    ignoreEvent(event) { return this.widget.ignoreEvent(event); }
    get overrideDOMText() {
        if (this.length == 0)
            return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Text.empty */ .xv.empty;
        let top = this;
        while (top.parent)
            top = top.parent;
        let view = top.editorView, text = view && view.state.doc, start = this.posAtStart;
        return text ? text.slice(start, start + this.length) : _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Text.empty */ .xv.empty;
    }
    domAtPos(pos) {
        return pos == 0 ? _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .DOMPos.before */ .Y4.before(this.dom) : _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .DOMPos.after */ .Y4.after(this.dom, pos == this.length);
    }
    domBoundsAround() { return null; }
    coordsAt(pos, side) {
        let rects = this.dom.getClientRects(), rect = null;
        if (!rects.length)
            return _dom_js__WEBPACK_IMPORTED_MODULE_2__/* .Rect0 */ .ku;
        for (let i = pos > 0 ? rects.length - 1 : 0;; i += (pos > 0 ? -1 : 1)) {
            rect = rects[i];
            if (pos > 0 ? i == 0 : i == rects.length - 1 || rect.top < rect.bottom)
                break;
        }
        return (pos == 0 && side > 0 || pos == this.length && side <= 0) ? rect : (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .flattenRect */ ._s)(rect, pos == 0);
    }
    get isEditable() { return false; }
    destroy() {
        super.destroy();
        if (this.dom)
            this.widget.destroy(this.dom);
    }
}
class CompositionView extends WidgetView {
    domAtPos(pos) {
        let { topView, text } = this.widget;
        if (!topView)
            return new _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .DOMPos */ .Y4(text, Math.min(pos, text.nodeValue.length));
        return scanCompositionTree(pos, 0, topView, text, (v, p) => v.domAtPos(p), p => new _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .DOMPos */ .Y4(text, Math.min(p, text.nodeValue.length)));
    }
    sync() { this.setDOM(this.widget.toDOM()); }
    localPosFromDOM(node, offset) {
        let { topView, text } = this.widget;
        if (!topView)
            return Math.min(offset, this.length);
        return posFromDOMInCompositionTree(node, offset, topView, text);
    }
    ignoreMutation() { return false; }
    get overrideDOMText() { return null; }
    coordsAt(pos, side) {
        let { topView, text } = this.widget;
        if (!topView)
            return textCoords(text, pos, side);
        return scanCompositionTree(pos, side, topView, text, (v, pos, side) => v.coordsAt(pos, side), (pos, side) => textCoords(text, pos, side));
    }
    destroy() {
        var _a;
        super.destroy();
        (_a = this.widget.topView) === null || _a === void 0 ? void 0 : _a.destroy();
    }
    get isEditable() { return true; }
}
/**
 * Uses the old structure of a chunk of content view frozen for composition to try and find a
 * reasonable DOM location for the given offset.
 */
function scanCompositionTree(pos, side, view, text, enterView, fromText) {
    if (view instanceof MarkView) {
        for (let child of view.children) {
            let hasComp = (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .contains */ .r3)(child.dom, text);
            let len = hasComp ? text.nodeValue.length : child.length;
            if (pos < len || pos == len && child.getSide() <= 0)
                return hasComp ? scanCompositionTree(pos, side, child, text, enterView, fromText) : enterView(child, pos, side);
            pos -= len;
        }
        return enterView(view, view.length, -1);
    }
    else if (view.dom == text) {
        return fromText(pos, side);
    }
    else {
        return enterView(view, pos, side);
    }
}
function posFromDOMInCompositionTree(node, offset, view, text) {
    if (view instanceof MarkView) {
        for (let child of view.children) {
            let pos = 0, hasComp = (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .contains */ .r3)(child.dom, text);
            if ((0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .contains */ .r3)(child.dom, node))
                return pos + (hasComp ? posFromDOMInCompositionTree(node, offset, child, text) : child.localPosFromDOM(node, offset));
            pos += hasComp ? text.nodeValue.length : child.length;
        }
    }
    else if (view.dom == text) {
        return Math.min(offset, text.nodeValue.length);
    }
    return view.localPosFromDOM(node, offset);
}
/**
 * These are drawn around uneditable widgets to avoid a number of browser bugs that show up when
 * the cursor is directly next to uneditable inline content.
 */
class WidgetBufferView extends _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .ContentView */ .Cl {
    constructor(side) {
        super();
        this.side = side;
    }
    get length() { return 0; }
    merge() { return false; }
    become(other) {
        return other instanceof WidgetBufferView && other.side == this.side;
    }
    split() { return new WidgetBufferView(this.side); }
    sync() {
        if (!this.dom) {
            let dom = document.createElement("img");
            dom.className = "cm-widgetBuffer";
            dom.setAttribute("aria-hidden", "true");
            this.setDOM(dom);
        }
    }
    getSide() { return this.side; }
    domAtPos(pos) { return _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .DOMPos.before */ .Y4.before(this.dom); }
    localPosFromDOM() { return 0; }
    domBoundsAround() { return null; }
    coordsAt(pos) {
        let imgRect = this.dom.getBoundingClientRect();
        // Since the <img> height doesn't correspond to text height, try
        // to borrow the height from some sibling node.
        let siblingRect = inlineSiblingRect(this, this.side > 0 ? -1 : 1);
        return siblingRect && siblingRect.top < imgRect.bottom && siblingRect.bottom > imgRect.top ?
            { left: imgRect.left, right: imgRect.right, top: siblingRect.top, bottom: siblingRect.bottom } : imgRect;
    }
    get overrideDOMText() {
        return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Text.empty */ .xv.empty;
    }
}
TextView.prototype.children = WidgetView.prototype.children = WidgetBufferView.prototype.children = _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .noChildren */ .JR;
function inlineSiblingRect(view, side) {
    let parent = view.parent, index = parent ? parent.children.indexOf(view) : -1;
    while (parent && index >= 0) {
        if (side < 0 ? index > 0 : index < parent.children.length) {
            let next = parent.children[index + side];
            if (next instanceof TextView) {
                let nextRect = next.coordsAt(side < 0 ? next.length : 0, side);
                if (nextRect)
                    return nextRect;
            }
            index += side;
        }
        else if (parent instanceof MarkView && parent.parent) {
            index = parent.parent.children.indexOf(parent) + (side < 0 ? 0 : 1);
            parent = parent.parent;
        }
        else {
            let last = parent.dom.lastChild;
            if (last && last.nodeName == "BR")
                return last.getClientRects()[0];
            break;
        }
    }
    return undefined;
}
function inlineDOMAtPos(dom, children, pos) {
    let i = 0;
    for (let off = 0; i < children.length; i++) {
        let child = children[i], end = off + child.length;
        if (end == off && child.getSide() <= 0)
            continue;
        if (pos > off && pos < end && child.dom.parentNode == dom)
            return child.domAtPos(pos - off);
        if (pos <= off)
            break;
        off = end;
    }
    for (; i > 0; i--) {
        let before = children[i - 1].dom;
        if (before.parentNode == dom)
            return _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .DOMPos.after */ .Y4.after(before);
    }
    return new _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .DOMPos */ .Y4(dom, 0);
}
// Assumes `view`, if a mark view, has precisely 1 child.
function joinInlineInto(parent, view, open) {
    let last, { children } = parent;
    if (open > 0 && view instanceof MarkView && children.length &&
        (last = children[children.length - 1]) instanceof MarkView && last.mark.eq(view.mark)) {
        joinInlineInto(last, view.children[0], open - 1);
    }
    else {
        children.push(view);
        view.setParent(parent);
    }
    parent.length += view.length;
}
function coordsInChildren(view, pos, side) {
    for (let off = 0, i = 0; i < view.children.length; i++) {
        let child = view.children[i], end = off + child.length, next;
        if ((side <= 0 || end == view.length || child.getSide() > 0 ? end >= pos : end > pos) &&
            (pos < end || i + 1 == view.children.length || (next = view.children[i + 1]).length || next.getSide() > 0)) {
            let flatten = 0;
            if (end == off) {
                if (child.getSide() <= 0)
                    continue;
                flatten = side = -child.getSide();
            }
            let rect = child.coordsAt(Math.max(0, pos - off), side);
            return flatten && rect ? (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .flattenRect */ ._s)(rect, side < 0) : rect;
        }
        off = end;
    }
    let last = view.dom.lastChild;
    if (!last)
        return view.dom.getBoundingClientRect();
    let rects = (0,_dom_js__WEBPACK_IMPORTED_MODULE_2__/* .clientRectsFor */ .kC)(last);
    return rects[rects.length - 1] || null;
}


/***/ }),

/***/ 516:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "I": () => (/* binding */ InputState),
/* harmony export */   "d": () => (/* binding */ modifierCodes)
/* harmony export */ });
/* harmony import */ var _state_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(535);
/* harmony import */ var _contentview_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(72);
/* harmony import */ var _blockview_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(396);
/* harmony import */ var _extension_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(179);
/* harmony import */ var _browser_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(362);
/* harmony import */ var _cursor_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(849);
/* harmony import */ var _dom_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(604);







/** This will also be where dragging info and such goes */
class InputState {
    constructor(view) {
        this.lastKeyCode = 0;
        this.lastKeyTime = 0;
        // On iOS, some keys need to have their default behavior happen (after which we retroactively
        // handle them and reset the DOM) to avoid messing up the virtual keyboard state.
        this.pendingIOSKey = undefined;
        this.lastSelectionOrigin = null;
        this.lastSelectionTime = 0;
        this.lastEscPress = 0;
        this.lastContextMenu = 0;
        this.scrollHandlers = [];
        this.registeredEvents = [];
        this.customHandlers = [];
        /**
         * -1 means not in a composition. Otherwise, this counts the number of changes made during the
         * composition. The count is used to avoid treating the start state of the composition, before
         * any changes have been made, as part of the composition.
         */
        this.composing = -1;
        /**
         * Tracks whether the next change should be marked as starting the composition (null means no
         * composition, true means next is the first, false means first has already been marked for this
         * composition)
         */
        this.compositionFirstChange = null;
        this.compositionEndedAt = 0;
        this.rapidCompositionStart = false;
        this.mouseSelection = null;
        for (let type in handlers) {
            let handler = handlers[type];
            view.contentDOM.addEventListener(type, (event) => {
                if (!eventBelongsToEditor(view, event) || this.ignoreDuringComposition(event))
                    return;
                if (type == "keydown" && this.keydown(view, event))
                    return;
                if (this.mustFlushObserver(event))
                    view.observer.forceFlush();
                if (this.runCustomHandlers(type, view, event))
                    event.preventDefault();
                else
                    handler(view, event);
            });
            this.registeredEvents.push(type);
        }
        this.notifiedFocused = view.hasFocus;
        if (_browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].safari */ .Z.safari)
            view.contentDOM.addEventListener("input", () => null);
    }
    setSelectionOrigin(origin) {
        this.lastSelectionOrigin = origin;
        this.lastSelectionTime = Date.now();
    }
    ensureHandlers(view, plugins) {
        var _a;
        let handlers;
        for (let plugin of plugins)
            if (handlers = (_a = plugin.update(view).spec) === null || _a === void 0 ? void 0 : _a.domEventHandlers) {
                this.customHandlers.push({ plugin: plugin.value, handlers });
                for (let type in handlers)
                    if (this.registeredEvents.indexOf(type) < 0 && type != "scroll") {
                        this.registeredEvents.push(type);
                        view.contentDOM.addEventListener(type, (event) => {
                            if (!eventBelongsToEditor(view, event))
                                return;
                            if (this.runCustomHandlers(type, view, event))
                                event.preventDefault();
                        });
                    }
            }
    }
    runCustomHandlers(type, view, event) {
        for (let set of this.customHandlers) {
            let handler = set.handlers[type];
            if (handler) {
                try {
                    if (handler.call(set.plugin, event, view) || event.defaultPrevented)
                        return true;
                }
                catch (e) {
                    (0,_extension_js__WEBPACK_IMPORTED_MODULE_3__/* .logException */ .OO)(view.state, e);
                }
            }
        }
        return false;
    }
    runScrollHandlers(view, event) {
        for (let set of this.customHandlers) {
            let handler = set.handlers.scroll;
            if (handler) {
                try {
                    handler.call(set.plugin, event, view);
                }
                catch (e) {
                    (0,_extension_js__WEBPACK_IMPORTED_MODULE_3__/* .logException */ .OO)(view.state, e);
                }
            }
        }
    }
    keydown(view, event) {
        // Must always run, even if a custom handler handled the event
        this.lastKeyCode = event.keyCode;
        this.lastKeyTime = Date.now();
        if (event.keyCode == 9 && Date.now() < this.lastEscPress + 2000)
            return true;
        if (_browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].android */ .Z.android && _browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].chrome */ .Z.chrome && !event.synthetic &&
            (event.keyCode == 13 || event.keyCode == 8)) {
            view.observer.delayAndroidKey(event.key, event.keyCode);
            return true;
        }
        let pending;
        if (_browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].ios */ .Z.ios && (pending = PendingKeys.find(key => key.keyCode == event.keyCode)) &&
            !(event.ctrlKey || event.altKey || event.metaKey) && !event.synthetic) {
            this.pendingIOSKey = pending;
            setTimeout(() => this.flushIOSKey(view), 250);
            return true;
        }
        return false;
    }
    flushIOSKey(view) {
        let key = this.pendingIOSKey;
        if (!key)
            return false;
        this.pendingIOSKey = undefined;
        return (0,_dom_js__WEBPACK_IMPORTED_MODULE_6__/* .dispatchKey */ .mL)(view.contentDOM, key.key, key.keyCode);
    }
    ignoreDuringComposition(event) {
        if (!/^key/.test(event.type))
            return false;
        if (this.composing > 0)
            return true;
        if (_browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].safari */ .Z.safari && Date.now() - this.compositionEndedAt < 100) {
            this.compositionEndedAt = 0;
            return true;
        }
        return false;
    }
    mustFlushObserver(event) {
        return (event.type == "keydown" && event.keyCode != 229) ||
            event.type == "compositionend" && !_browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].ios */ .Z.ios;
    }
    startMouseSelection(mouseSelection) {
        if (this.mouseSelection)
            this.mouseSelection.destroy();
        this.mouseSelection = mouseSelection;
    }
    update(update) {
        if (this.mouseSelection)
            this.mouseSelection.update(update);
        if (update.transactions.length)
            this.lastKeyCode = this.lastSelectionTime = 0;
    }
    destroy() {
        if (this.mouseSelection)
            this.mouseSelection.destroy();
    }
}
const PendingKeys = [
    { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
    { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
    { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
];
/** Key codes for modifier keys */
const modifierCodes = [16, 17, 18, 20, 91, 92, 224, 225];
class MouseSelection {
    constructor(view, startEvent, style, mustSelect) {
        this.view = view;
        this.style = style;
        this.mustSelect = mustSelect;
        this.lastEvent = startEvent;
        let doc = view.contentDOM.ownerDocument;
        doc.addEventListener("mousemove", this.move = this.move.bind(this));
        doc.addEventListener("mouseup", this.up = this.up.bind(this));
        this.extend = startEvent.shiftKey;
        this.multiple = view.state.facet(_state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorState.allowMultipleSelections */ .yy.allowMultipleSelections) && addsSelectionRange(view, startEvent);
        this.dragMove = dragMovesSelection(view, startEvent);
        this.dragging = isInPrimarySelection(view, startEvent) && getClickType(startEvent) == 1 ? null : false;
        // When clicking outside of the selection, immediately apply the effect of starting the selection
        if (this.dragging === false) {
            startEvent.preventDefault();
            this.select(startEvent);
        }
    }
    move(event) {
        if (event.buttons == 0)
            return this.destroy();
        if (this.dragging !== false)
            return;
        this.select(this.lastEvent = event);
    }
    up(event) {
        if (this.dragging == null)
            this.select(this.lastEvent);
        if (!this.dragging)
            event.preventDefault();
        this.destroy();
    }
    destroy() {
        let doc = this.view.contentDOM.ownerDocument;
        doc.removeEventListener("mousemove", this.move);
        doc.removeEventListener("mouseup", this.up);
        this.view.inputState.mouseSelection = null;
    }
    select(event) {
        let selection = this.style.get(event, this.extend, this.multiple);
        if (this.mustSelect || !selection.eq(this.view.state.selection) ||
            selection.main.assoc != this.view.state.selection.main.assoc)
            this.view.dispatch({
                selection,
                userEvent: "select.pointer",
                scrollIntoView: true
            });
        this.mustSelect = false;
    }
    update(update) {
        if (update.docChanged && this.dragging)
            this.dragging = this.dragging.map(update.changes);
        if (this.style.update(update))
            setTimeout(() => this.select(this.lastEvent), 20);
    }
}
function addsSelectionRange(view, event) {
    let facet = view.state.facet(_extension_js__WEBPACK_IMPORTED_MODULE_3__/* .clickAddsSelectionRange */ .FT);
    return facet.length ? facet[0](event) : _browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].mac */ .Z.mac ? event.metaKey : event.ctrlKey;
}
function dragMovesSelection(view, event) {
    let facet = view.state.facet(_extension_js__WEBPACK_IMPORTED_MODULE_3__/* .dragMovesSelection */ .Gl);
    return facet.length ? facet[0](event) : _browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].mac */ .Z.mac ? !event.altKey : !event.ctrlKey;
}
function isInPrimarySelection(view, event) {
    let { main } = view.state.selection;
    if (main.empty)
        return false;
    // On boundary clicks, check whether the coordinates are inside the selection's client rectangles
    let sel = (0,_dom_js__WEBPACK_IMPORTED_MODULE_6__/* .getSelection */ .Mf)(view.root);
    if (sel.rangeCount == 0)
        return true;
    let rects = sel.getRangeAt(0).getClientRects();
    for (let i = 0; i < rects.length; i++) {
        let rect = rects[i];
        if (rect.left <= event.clientX && rect.right >= event.clientX &&
            rect.top <= event.clientY && rect.bottom >= event.clientY)
            return true;
    }
    return false;
}
function eventBelongsToEditor(view, event) {
    if (!event.bubbles)
        return true;
    if (event.defaultPrevented)
        return false;
    for (let node = event.target, cView; node != view.contentDOM; node = node.parentNode)
        if (!node || node.nodeType == 11 || ((cView = _contentview_js__WEBPACK_IMPORTED_MODULE_1__/* .ContentView.get */ .Cl.get(node)) && cView.ignoreEvent(event)))
            return false;
    return true;
}
const handlers = Object.create(null);
const brokenClipboardAPI = (_browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].ie */ .Z.ie && _browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].ie_version */ .Z.ie_version < 15) || (_browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].ios */ .Z.ios && _browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].webkit_version */ .Z.webkit_version < 604);
function capturePaste(view) {
    let parent = view.dom.parentNode;
    if (!parent)
        return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.focus();
    setTimeout(() => {
        view.focus();
        target.remove();
        doPaste(view, target.value);
    }, 50);
}
function doPaste(view, input) {
    let { state } = view, changes, i = 1, text = state.toText(input);
    let byLine = text.lines == state.selection.ranges.length;
    let linewise = lastLinewiseCopy != null && state.selection.ranges.every(r => r.empty) && lastLinewiseCopy == text.toString();
    if (linewise) {
        let lastLine = -1;
        changes = state.changeByRange(range => {
            let line = state.doc.lineAt(range.from);
            if (line.from == lastLine)
                return { range };
            lastLine = line.from;
            let insert = state.toText((byLine ? text.line(i++).text : input) + state.lineBreak);
            return { changes: { from: line.from, insert },
                range: _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(range.from + insert.length) };
        });
    }
    else if (byLine) {
        changes = state.changeByRange(range => {
            let line = text.line(i++);
            return { changes: { from: range.from, to: range.to, insert: line.text },
                range: _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(range.from + line.length) };
        });
    }
    else {
        changes = state.replaceSelection(text);
    }
    view.dispatch(changes, {
        userEvent: "input.paste",
        scrollIntoView: true
    });
}
handlers.keydown = (view, event) => {
    view.inputState.setSelectionOrigin("select");
    if (event.keyCode == 27)
        view.inputState.lastEscPress = Date.now();
    else if (modifierCodes.indexOf(event.keyCode) < 0)
        view.inputState.lastEscPress = 0;
};
let lastTouch = 0;
handlers.touchstart = (view, e) => {
    lastTouch = Date.now();
    view.inputState.setSelectionOrigin("select.pointer");
};
handlers.touchmove = view => {
    view.inputState.setSelectionOrigin("select.pointer");
};
handlers.mousedown = (view, event) => {
    view.observer.flush();
    if (lastTouch > Date.now() - 2000 && getClickType(event) == 1)
        return; // Ignore touch interaction
    let style = null;
    for (let makeStyle of view.state.facet(_extension_js__WEBPACK_IMPORTED_MODULE_3__/* .mouseSelectionStyle */ .j5)) {
        style = makeStyle(view, event);
        if (style)
            break;
    }
    if (!style && event.button == 0)
        style = basicMouseSelection(view, event);
    if (style) {
        let mustFocus = view.root.activeElement != view.contentDOM;
        if (mustFocus)
            view.observer.ignore(() => (0,_dom_js__WEBPACK_IMPORTED_MODULE_6__/* .focusPreventScroll */ .ED)(view.contentDOM));
        view.inputState.startMouseSelection(new MouseSelection(view, event, style, mustFocus));
    }
};
function rangeForClick(view, pos, bias, type) {
    if (type == 1) { // Single click
        return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.cursor */ .jT.cursor(pos, bias);
    }
    else if (type == 2) { // Double click
        return (0,_cursor_js__WEBPACK_IMPORTED_MODULE_5__/* .groupAt */ .Ih)(view.state, pos, bias);
    }
    else { // Triple click
        let visual = _blockview_js__WEBPACK_IMPORTED_MODULE_2__/* .LineView.find */ .y.find(view.docView, pos), line = view.state.doc.lineAt(visual ? visual.posAtEnd : pos);
        let from = visual ? visual.posAtStart : line.from, to = visual ? visual.posAtEnd : line.to;
        if (to < view.state.doc.length && to == line.to)
            to++;
        return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.range */ .jT.range(from, to);
    }
}
let insideY = (y, rect) => y >= rect.top && y <= rect.bottom;
let inside = (x, y, rect) => insideY(y, rect) && x >= rect.left && x <= rect.right;
/**
 * Try to determine, for the given coordinates, associated with the given position, whether they are
 * related to the element before or the element after the position.
 */
function findPositionSide(view, pos, x, y) {
    let line = _blockview_js__WEBPACK_IMPORTED_MODULE_2__/* .LineView.find */ .y.find(view.docView, pos);
    if (!line)
        return 1;
    let off = pos - line.posAtStart;
    // Line boundaries point into the line
    if (off == 0)
        return 1;
    if (off == line.length)
        return -1;
    // Positions on top of an element point at that element
    let before = line.coordsAt(off, -1);
    if (before && inside(x, y, before))
        return -1;
    let after = line.coordsAt(off, 1);
    if (after && inside(x, y, after))
        return 1;
    // This is probably a line wrap point. Pick before if the point is beside it.
    return before && insideY(y, before) ? -1 : 1;
}
function queryPos(view, event) {
    let pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
    return { pos, bias: findPositionSide(view, pos, event.clientX, event.clientY) };
}
const BadMouseDetail = _browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].ie */ .Z.ie && _browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].ie_version */ .Z.ie_version <= 11;
let lastMouseDown = null, lastMouseDownCount = 0, lastMouseDownTime = 0;
function getClickType(event) {
    if (!BadMouseDetail)
        return event.detail;
    let last = lastMouseDown, lastTime = lastMouseDownTime;
    lastMouseDown = event;
    lastMouseDownTime = Date.now();
    return lastMouseDownCount = !last || (lastTime > Date.now() - 400 && Math.abs(last.clientX - event.clientX) < 2 &&
        Math.abs(last.clientY - event.clientY) < 2) ? (lastMouseDownCount + 1) % 3 : 1;
}
function basicMouseSelection(view, event) {
    let start = queryPos(view, event), type = getClickType(event);
    let startSel = view.state.selection;
    let last = start, lastEvent = event;
    return {
        update(update) {
            if (update.docChanged) {
                if (start)
                    start.pos = update.changes.mapPos(start.pos);
                startSel = startSel.map(update.changes);
                lastEvent = null;
            }
        },
        get(event, extend, multiple) {
            let cur;
            if (lastEvent && event.clientX == lastEvent.clientX && event.clientY == lastEvent.clientY)
                cur = last;
            else {
                cur = last = queryPos(view, event);
                lastEvent = event;
            }
            if (!cur || !start)
                return startSel;
            let range = rangeForClick(view, cur.pos, cur.bias, type);
            if (start.pos != cur.pos && !extend) {
                let startRange = rangeForClick(view, start.pos, start.bias, type);
                let from = Math.min(startRange.from, range.from), to = Math.max(startRange.to, range.to);
                range = from < range.from ? _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.range */ .jT.range(from, to) : _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.range */ .jT.range(to, from);
            }
            if (extend)
                return startSel.replaceRange(startSel.main.extend(range.from, range.to));
            else if (multiple)
                return startSel.addRange(range);
            else
                return _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .EditorSelection.create */ .jT.create([range]);
        }
    };
}
handlers.dragstart = (view, event) => {
    let { selection: { main } } = view.state;
    let { mouseSelection } = view.inputState;
    if (mouseSelection)
        mouseSelection.dragging = main;
    if (event.dataTransfer) {
        event.dataTransfer.setData("Text", view.state.sliceDoc(main.from, main.to));
        event.dataTransfer.effectAllowed = "copyMove";
    }
};
function dropText(view, event, text, direct) {
    if (!text)
        return;
    let dropPos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
    event.preventDefault();
    let { mouseSelection } = view.inputState;
    let del = direct && mouseSelection && mouseSelection.dragging && mouseSelection.dragMove ?
        { from: mouseSelection.dragging.from, to: mouseSelection.dragging.to } : null;
    let ins = { from: dropPos, insert: text };
    let changes = view.state.changes(del ? [del, ins] : ins);
    view.focus();
    view.dispatch({
        changes,
        selection: { anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1) },
        userEvent: del ? "move.drop" : "input.drop"
    });
}
handlers.drop = (view, event) => {
    if (!event.dataTransfer)
        return;
    if (view.state.readOnly)
        return event.preventDefault();
    let files = event.dataTransfer.files;
    if (files && files.length) { // For a file drop, read the file's text.
        event.preventDefault();
        let text = Array(files.length), read = 0;
        let finishFile = () => {
            if (++read == files.length)
                dropText(view, event, text.filter(s => s != null).join(view.state.lineBreak), false);
        };
        for (let i = 0; i < files.length; i++) {
            let reader = new FileReader;
            reader.onerror = finishFile;
            reader.onload = () => {
                if (!/[\x00-\x08\x0e-\x1f]{2}/.test(reader.result))
                    text[i] = reader.result;
                finishFile();
            };
            reader.readAsText(files[i]);
        }
    }
    else {
        dropText(view, event, event.dataTransfer.getData("Text"), true);
    }
};
handlers.paste = (view, event) => {
    if (view.state.readOnly)
        return event.preventDefault();
    view.observer.flush();
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
        doPaste(view, data.getData("text/plain"));
        event.preventDefault();
    }
    else {
        capturePaste(view);
    }
};
function captureCopy(view, text) {
    // The extra wrapper is somehow necessary on IE/Edge to prevent the content from being mangled when it is put onto the clipboard
    let parent = view.dom.parentNode;
    if (!parent)
        return;
    let target = parent.appendChild(document.createElement("textarea"));
    target.style.cssText = "position: fixed; left: -10000px; top: 10px";
    target.value = text;
    target.focus();
    target.selectionEnd = text.length;
    target.selectionStart = 0;
    setTimeout(() => {
        target.remove();
        view.focus();
    }, 50);
}
function copiedRange(state) {
    let content = [], ranges = [], linewise = false;
    for (let range of state.selection.ranges)
        if (!range.empty) {
            content.push(state.sliceDoc(range.from, range.to));
            ranges.push(range);
        }
    if (!content.length) {
        // Nothing selected, do a line-wise copy
        let upto = -1;
        for (let { from } of state.selection.ranges) {
            let line = state.doc.lineAt(from);
            if (line.number > upto) {
                content.push(line.text);
                ranges.push({ from: line.from, to: Math.min(state.doc.length, line.to + 1) });
            }
            upto = line.number;
        }
        linewise = true;
    }
    return { text: content.join(state.lineBreak), ranges, linewise };
}
let lastLinewiseCopy = null;
handlers.copy = handlers.cut = (view, event) => {
    let { text, ranges, linewise } = copiedRange(view.state);
    if (!text && !linewise)
        return;
    lastLinewiseCopy = linewise ? text : null;
    let data = brokenClipboardAPI ? null : event.clipboardData;
    if (data) {
        event.preventDefault();
        data.clearData();
        data.setData("text/plain", text);
    }
    else {
        captureCopy(view, text);
    }
    if (event.type == "cut" && !view.state.readOnly)
        view.dispatch({
            changes: ranges,
            scrollIntoView: true,
            userEvent: "delete.cut"
        });
};
handlers.focus = handlers.blur = view => {
    setTimeout(() => {
        if (view.hasFocus != view.inputState.notifiedFocused)
            view.update([]);
    }, 10);
};
function forceClearComposition(view, rapid) {
    if (view.docView.compositionDeco.size) {
        view.inputState.rapidCompositionStart = rapid;
        try {
            view.update([]);
        }
        finally {
            view.inputState.rapidCompositionStart = false;
        }
    }
}
handlers.compositionstart = handlers.compositionupdate = view => {
    if (view.inputState.compositionFirstChange == null)
        view.inputState.compositionFirstChange = true;
    if (view.inputState.composing < 0) {
        // FIXME possibly set a timeout to clear it again on Android
        view.inputState.composing = 0;
        if (view.docView.compositionDeco.size) {
            view.observer.flush();
            forceClearComposition(view, true);
        }
    }
};
handlers.compositionend = view => {
    view.inputState.composing = -1;
    view.inputState.compositionEndedAt = Date.now();
    view.inputState.compositionFirstChange = null;
    setTimeout(() => {
        if (view.inputState.composing < 0)
            forceClearComposition(view, false);
    }, 50);
};
handlers.contextmenu = view => {
    view.inputState.lastContextMenu = Date.now();
};
handlers.beforeinput = (view, event) => {
    var _a;
    let pending;
    if (_browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].chrome */ .Z.chrome && _browser_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"].android */ .Z.android && (pending = PendingKeys.find(key => key.inputType == event.inputType))) {
        view.observer.delayAndroidKey(pending.key, pending.keyCode);
        if (pending.key == "Backspace" || pending.key == "Delete") {
            let startViewHeight = ((_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.height) || 0;
            setTimeout(() => {
                var _a;
                if ((((_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.height) || 0) > startViewHeight + 10 && view.hasFocus) {
                    view.contentDOM.blur();
                    view.focus();
                }
            }, 100);
        }
    }
};


/***/ }),

/***/ 443:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Sd": () => (/* binding */ getPanel),
/* harmony export */   "mH": () => (/* binding */ showPanel)
/* harmony export */ });
/* unused harmony export panels */
/* harmony import */ var _state_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(535);
/* harmony import */ var _editorview_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(33);
/* harmony import */ var _extension_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(179);



const panelConfig = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define({
    combine(configs) {
        let topContainer, bottomContainer;
        for (let c of configs) {
            topContainer = topContainer || c.topContainer;
            bottomContainer = bottomContainer || c.bottomContainer;
        }
        return { topContainer, bottomContainer };
    }
});
/** Configures the panel-managing extension. */
function panels(config) {
    return config ? [panelConfig.of(config)] : [];
}
/**
 * Get the active panel created by the given constructor, if any. This can be useful when
 * you need access to your panels' DOM structure.
 */
function getPanel(view, panel) {
    let plugin = view.plugin(panelPlugin);
    let index = plugin ? plugin.specs.indexOf(panel) : -1;
    return index > -1 ? plugin.panels[index] : null;
}
const panelPlugin = _extension_js__WEBPACK_IMPORTED_MODULE_2__/* .ViewPlugin.fromClass */ .lg.fromClass(class {
    constructor(view) {
        this.input = view.state.facet(showPanel);
        this.specs = this.input.filter(s => s);
        this.panels = this.specs.map(spec => spec(view));
        let conf = view.state.facet(panelConfig);
        this.top = new PanelGroup(view, true, conf.topContainer);
        this.bottom = new PanelGroup(view, false, conf.bottomContainer);
        this.top.sync(this.panels.filter(p => p.top));
        this.bottom.sync(this.panels.filter(p => !p.top));
        for (let p of this.panels) {
            p.dom.classList.add("cm-panel");
            if (p.mount)
                p.mount();
        }
    }
    update(update) {
        let conf = update.state.facet(panelConfig);
        if (this.top.container != conf.topContainer) {
            this.top.sync([]);
            this.top = new PanelGroup(update.view, true, conf.topContainer);
        }
        if (this.bottom.container != conf.bottomContainer) {
            this.bottom.sync([]);
            this.bottom = new PanelGroup(update.view, false, conf.bottomContainer);
        }
        this.top.syncClasses();
        this.bottom.syncClasses();
        let input = update.state.facet(showPanel);
        if (input != this.input) {
            let specs = input.filter(x => x);
            let panels = [], top = [], bottom = [], mount = [];
            for (let spec of specs) {
                let known = this.specs.indexOf(spec), panel;
                if (known < 0) {
                    panel = spec(update.view);
                    mount.push(panel);
                }
                else {
                    panel = this.panels[known];
                    if (panel.update)
                        panel.update(update);
                }
                panels.push(panel);
                (panel.top ? top : bottom).push(panel);
            }
            this.specs = specs;
            this.panels = panels;
            this.top.sync(top);
            this.bottom.sync(bottom);
            for (let p of mount) {
                p.dom.classList.add("cm-panel");
                if (p.mount)
                    p.mount();
            }
        }
        else {
            for (let p of this.panels)
                if (p.update)
                    p.update(update);
        }
    }
    destroy() {
        this.top.sync([]);
        this.bottom.sync([]);
    }
}, {
    provide: plugin => _editorview_js__WEBPACK_IMPORTED_MODULE_1__/* .EditorView.scrollMargins.of */ .t.scrollMargins.of(view => {
        let value = view.plugin(plugin);
        return value && { top: value.top.scrollMargin(), bottom: value.bottom.scrollMargin() };
    })
});
class PanelGroup {
    constructor(view, top, container) {
        this.view = view;
        this.top = top;
        this.container = container;
        this.dom = undefined;
        this.classes = "";
        this.panels = [];
        this.syncClasses();
    }
    sync(panels) {
        for (let p of this.panels)
            if (p.destroy && panels.indexOf(p) < 0)
                p.destroy();
        this.panels = panels;
        this.syncDOM();
    }
    syncDOM() {
        if (this.panels.length == 0) {
            if (this.dom) {
                this.dom.remove();
                this.dom = undefined;
            }
            return;
        }
        if (!this.dom) {
            this.dom = document.createElement("div");
            this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom";
            this.dom.style[this.top ? "top" : "bottom"] = "0";
            let parent = this.container || this.view.dom;
            parent.insertBefore(this.dom, this.top ? parent.firstChild : null);
        }
        let curDOM = this.dom.firstChild;
        for (let panel of this.panels) {
            if (panel.dom.parentNode == this.dom) {
                while (curDOM != panel.dom)
                    curDOM = rm(curDOM);
                curDOM = curDOM.nextSibling;
            }
            else {
                this.dom.insertBefore(panel.dom, curDOM);
            }
        }
        while (curDOM)
            curDOM = rm(curDOM);
    }
    scrollMargin() {
        return !this.dom || this.container ? 0 : Math.max(0, this.top ?
            this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) :
            Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
    }
    syncClasses() {
        if (!this.container || this.classes == this.view.themeClasses)
            return;
        for (let cls of this.classes.split(" "))
            if (cls)
                this.container.classList.remove(cls);
        for (let cls of (this.classes = this.view.themeClasses).split(" "))
            if (cls)
                this.container.classList.add(cls);
    }
}
function rm(node) {
    let next = node.nextSibling;
    node.remove();
    return next;
}
/**
 * Opening a panel is done by providing a constructor function for the panel through this facet.
 * (The panel is closed again when its constructor is no longer provided.) Values of `null` are ignored.
 */
const showPanel = _state_index_js__WEBPACK_IMPORTED_MODULE_0__/* .Facet.define */ .r$.define({
    enables: panelPlugin
});


/***/ })

}]);