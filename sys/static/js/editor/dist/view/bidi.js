import { EditorSelection, findClusterBreak } from "../state/index.js";
export var Direction;
(function (Direction) {
    Direction[Direction["LTR"] = 0] = "LTR";
    Direction[Direction["RTL"] = 1] = "RTL";
})(Direction || (Direction = {}));
const LTR = Direction.LTR, RTL = Direction.RTL;
var T;
(function (T) {
    T[T["L"] = 1] = "L";
    T[T["R"] = 2] = "R";
    T[T["AL"] = 4] = "AL";
    T[T["EN"] = 8] = "EN";
    T[T["AN"] = 16] = "AN";
    T[T["ET"] = 64] = "ET";
    T[T["CS"] = 128] = "CS";
    T[T["NI"] = 256] = "NI";
    T[T["NSM"] = 512] = "NSM";
    T[T["Strong"] = 7] = "Strong";
    T[T["Num"] = 24] = "Num";
})(T || (T = {}));
function dec(str) {
    let result = [];
    for (let i = 0; i < str.length; i++)
        result.push(1 << +str[i]);
    return result;
}
const LowTypes = dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
const ArabicTypes = dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
const Brackets = Object.create(null), BracketStack = [];
for (let p of ["()", "[]", "{}"]) {
    let l = p.charCodeAt(0), r = p.charCodeAt(1);
    Brackets[l] = r;
    Brackets[r] = -l;
}
var Bracketed;
(function (Bracketed) {
    Bracketed[Bracketed["OppositeBefore"] = 1] = "OppositeBefore";
    Bracketed[Bracketed["EmbedInside"] = 2] = "EmbedInside";
    Bracketed[Bracketed["OppositeInside"] = 4] = "OppositeInside";
    Bracketed[Bracketed["MaxDepth"] = 189] = "MaxDepth";
})(Bracketed || (Bracketed = {}));
function charType(ch) {
    return ch <= 0xf7 ? LowTypes[ch] :
        0x590 <= ch && ch <= 0x5f4 ? 2 :
            0x600 <= ch && ch <= 0x6f9 ? ArabicTypes[ch - 0x600] :
                0x6ee <= ch && ch <= 0x8ac ? 4 :
                    0x2000 <= ch && ch <= 0x200b ? 256 :
                        ch == 0x200c ? 256 : 1;
}
const BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
export class BidiSpan {
    constructor(from, to, level) {
        this.from = from;
        this.to = to;
        this.level = level;
    }
    get dir() { return this.level % 2 ? RTL : LTR; }
    side(end, dir) { return (this.dir == dir) == end ? this.to : this.from; }
    static find(order, index, level, assoc) {
        let maybe = -1;
        for (let i = 0; i < order.length; i++) {
            let span = order[i];
            if (span.from <= index && span.to >= index) {
                if (span.level == level)
                    return i;
                if (maybe < 0 || (assoc != 0 ? (assoc < 0 ? span.from < index : span.to > index) : order[maybe].level > span.level))
                    maybe = i;
            }
        }
        if (maybe < 0)
            throw new RangeError("Index out of range");
        return maybe;
    }
}
const types = [];
export function computeOrder(line, direction) {
    let len = line.length, outerType = direction == LTR ? 1 : 2, oppositeType = direction == LTR ? 2 : 1;
    if (!line || outerType == 1 && !BidiRE.test(line))
        return trivialOrder(len);
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
        let type = charType(line.charCodeAt(i));
        if (type == 512)
            type = prev;
        else if (type == 8 && prevStrong == 4)
            type = 16;
        types[i] = type == 4 ? 2 : type;
        if (type & 7)
            prevStrong = type;
        prev = type;
    }
    for (let i = 0, prev = outerType, prevStrong = outerType; i < len; i++) {
        let type = types[i];
        if (type == 128) {
            if (i < len - 1 && prev == types[i + 1] && (prev & 24))
                type = types[i] = prev;
            else
                types[i] = 256;
        }
        else if (type == 64) {
            let end = i + 1;
            while (end < len && types[end] == 64)
                end++;
            let replace = (i && prev == 8) || (end < len && types[end] == 8) ? (prevStrong == 1 ? 1 : 8) : 256;
            for (let j = i; j < end; j++)
                types[j] = replace;
            i = end - 1;
        }
        else if (type == 8 && prevStrong == 1) {
            types[i] = 1;
        }
        prev = type;
        if (type & 7)
            prevStrong = type;
    }
    for (let i = 0, sI = 0, context = 0, ch, br, type; i < len; i++) {
        if (br = Brackets[ch = line.charCodeAt(i)]) {
            if (br < 0) {
                for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
                    if (BracketStack[sJ + 1] == -br) {
                        let flags = BracketStack[sJ + 2];
                        let type = (flags & 2) ? outerType :
                            !(flags & 4) ? 0 :
                                (flags & 1) ? oppositeType : outerType;
                        if (type)
                            types[i] = types[BracketStack[sJ]] = type;
                        sI = sJ;
                        break;
                    }
                }
            }
            else if (BracketStack.length == 189) {
                break;
            }
            else {
                BracketStack[sI++] = i;
                BracketStack[sI++] = ch;
                BracketStack[sI++] = context;
            }
        }
        else if ((type = types[i]) == 2 || type == 1) {
            let embed = type == outerType;
            context = embed ? 0 : 1;
            for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
                let cur = BracketStack[sJ + 2];
                if (cur & 2)
                    break;
                if (embed) {
                    BracketStack[sJ + 2] |= 2;
                }
                else {
                    if (cur & 4)
                        break;
                    BracketStack[sJ + 2] |= 4;
                }
            }
        }
    }
    for (let i = 0; i < len; i++) {
        if (types[i] == 256) {
            let end = i + 1;
            while (end < len && types[end] == 256)
                end++;
            let beforeL = (i ? types[i - 1] : outerType) == 1;
            let afterL = (end < len ? types[end] : outerType) == 1;
            let replace = beforeL == afterL ? (beforeL ? 1 : 2) : outerType;
            for (let j = i; j < end; j++)
                types[j] = replace;
            i = end - 1;
        }
    }
    let order = [];
    if (outerType == 1) {
        for (let i = 0; i < len;) {
            let start = i, rtl = types[i++] != 1;
            while (i < len && rtl == (types[i] != 1))
                i++;
            if (rtl) {
                for (let j = i; j > start;) {
                    let end = j, l = types[--j] != 2;
                    while (j > start && l == (types[j - 1] != 2))
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
            let start = i, rtl = types[i++] == 2;
            while (i < len && rtl == (types[i] == 2))
                i++;
            order.push(new BidiSpan(start, i, rtl ? 1 : 2));
        }
    }
    return order;
}
export function trivialOrder(length) {
    return [new BidiSpan(0, length, 0)];
}
export let movedOver = "";
export function moveVisually(line, order, dir, start, forward) {
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
    if (startIndex == span.side(forward, dir)) {
        span = order[spanI += forward ? 1 : -1];
        startIndex = span.side(!forward, dir);
    }
    let indexForward = forward == (span.dir == dir);
    let nextIndex = findClusterBreak(line.text, startIndex, indexForward);
    movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
    if (nextIndex != span.side(forward, dir))
        return EditorSelection.cursor(nextIndex + line.from, indexForward ? -1 : 1, span.level);
    let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
    if (!nextSpan && span.level != dir)
        return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1, dir);
    if (nextSpan && nextSpan.level < span.level)
        return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, forward ? 1 : -1, nextSpan.level);
    return EditorSelection.cursor(nextIndex + line.from, forward ? -1 : 1, span.level);
}
