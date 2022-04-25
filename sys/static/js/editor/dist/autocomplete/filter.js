import { codePointAt, codePointSize, fromCodePoint } from "../state/index.js";
var Penalty;
(function (Penalty) {
    Penalty[Penalty["Gap"] = -1100] = "Gap";
    Penalty[Penalty["NotStart"] = -700] = "NotStart";
    Penalty[Penalty["CaseFold"] = -200] = "CaseFold";
    Penalty[Penalty["ByWord"] = -100] = "ByWord";
})(Penalty || (Penalty = {}));
var Tp;
(function (Tp) {
    Tp[Tp["NonWord"] = 0] = "NonWord";
    Tp[Tp["Upper"] = 1] = "Upper";
    Tp[Tp["Lower"] = 2] = "Lower";
})(Tp || (Tp = {}));
export class FuzzyMatcher {
    constructor(pattern) {
        this.pattern = pattern;
        this.chars = [];
        this.folded = [];
        this.any = [];
        this.precise = [];
        this.byWord = [];
        for (let p = 0; p < pattern.length;) {
            let char = codePointAt(pattern, p), size = codePointSize(char);
            this.chars.push(char);
            let part = pattern.slice(p, p + size), upper = part.toUpperCase();
            this.folded.push(codePointAt(upper == part ? part.toLowerCase() : upper, 0));
            p += size;
        }
        this.astral = pattern.length != this.chars.length;
    }
    match(word) {
        if (this.pattern.length == 0)
            return [0];
        if (word.length < this.pattern.length)
            return null;
        let { chars, folded, any, precise, byWord } = this;
        if (chars.length == 1) {
            let first = codePointAt(word, 0);
            return first == chars[0] ? [0, 0, codePointSize(first)] :
                first == folded[0] ? [-200, 0, codePointSize(first)] : null;
        }
        let direct = word.indexOf(this.pattern);
        if (direct == 0)
            return [0, 0, this.pattern.length];
        let len = chars.length, anyTo = 0;
        if (direct < 0) {
            for (let i = 0, e = Math.min(word.length, 200); i < e && anyTo < len;) {
                let next = codePointAt(word, i);
                if (next == chars[anyTo] || next == folded[anyTo])
                    any[anyTo++] = i;
                i += codePointSize(next);
            }
            if (anyTo < len)
                return null;
        }
        let preciseTo = 0;
        let byWordTo = 0, byWordFolded = false;
        let adjacentTo = 0, adjacentStart = -1, adjacentEnd = -1;
        let hasLower = /[a-z]/.test(word), wordAdjacent = true;
        for (let i = 0, e = Math.min(word.length, 200), prevType = 0; i < e && byWordTo < len;) {
            let next = codePointAt(word, i);
            if (direct < 0) {
                if (preciseTo < len && next == chars[preciseTo])
                    precise[preciseTo++] = i;
                if (adjacentTo < len) {
                    if (next == chars[adjacentTo] || next == folded[adjacentTo]) {
                        if (adjacentTo == 0)
                            adjacentStart = i;
                        adjacentEnd = i + 1;
                        adjacentTo++;
                    }
                    else {
                        adjacentTo = 0;
                    }
                }
            }
            let ch, type = next < 0xff ?
                (next >= 48 && next <= 57 || next >= 97 && next <= 122 ? 2 : next >= 65 && next <= 90 ? 1 : 0) :
                ((ch = fromCodePoint(next)) != ch.toLowerCase() ? 1 : ch != ch.toUpperCase() ? 2 : 0);
            if (!i || type == 1 && hasLower || prevType == 0 && type != 0) {
                if (chars[byWordTo] == next || (folded[byWordTo] == next && (byWordFolded = true)))
                    byWord[byWordTo++] = i;
                else if (byWord.length)
                    wordAdjacent = false;
            }
            prevType = type;
            i += codePointSize(next);
        }
        if (byWordTo == len && byWord[0] == 0 && wordAdjacent)
            return this.result(-100 + (byWordFolded ? -200 : 0), byWord, word);
        if (adjacentTo == len && adjacentStart == 0)
            return [-200 - word.length, 0, adjacentEnd];
        if (direct > -1)
            return [-700 - word.length, direct, direct + this.pattern.length];
        if (adjacentTo == len)
            return [-200 + -700 - word.length, adjacentStart, adjacentEnd];
        if (byWordTo == len)
            return this.result(-100 + (byWordFolded ? -200 : 0) + -700 +
                (wordAdjacent ? 0 : -1100), byWord, word);
        return chars.length == 2 ? null : this.result((any[0] ? -700 : 0) + -200 + -1100, any, word);
    }
    result(score, positions, word) {
        let result = [score - word.length], i = 1;
        for (let pos of positions) {
            let to = pos + (this.astral ? codePointSize(codePointAt(word, pos)) : 1);
            if (i > 1 && result[i - 1] == pos)
                result[i - 1] = to;
            else {
                result[i++] = pos;
                result[i++] = to;
            }
        }
        return result;
    }
}
