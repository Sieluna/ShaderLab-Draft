var RangeFlag;
(function (RangeFlag) {
    RangeFlag[RangeFlag["BidiLevelMask"] = 3] = "BidiLevelMask";
    RangeFlag[RangeFlag["AssocBefore"] = 4] = "AssocBefore";
    RangeFlag[RangeFlag["AssocAfter"] = 8] = "AssocAfter";
    RangeFlag[RangeFlag["Inverted"] = 16] = "Inverted";
    RangeFlag[RangeFlag["GoalColumnOffset"] = 5] = "GoalColumnOffset";
    RangeFlag[RangeFlag["NoGoalColumn"] = 33554431] = "NoGoalColumn";
})(RangeFlag || (RangeFlag = {}));
export class SelectionRange {
    constructor(from, to, flags) {
        this.from = from;
        this.to = to;
        this.flags = flags;
    }
    get anchor() { return this.flags & 16 ? this.to : this.from; }
    get head() { return this.flags & 16 ? this.from : this.to; }
    get empty() { return this.from == this.to; }
    get assoc() { return this.flags & 4 ? -1 : this.flags & 8 ? 1 : 0; }
    get bidiLevel() {
        let level = this.flags & 3;
        return level == 3 ? null : level;
    }
    get goalColumn() {
        let value = this.flags >> 5;
        return value == 33554431 ? undefined : value;
    }
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
    extend(from, to = from) {
        if (from <= this.anchor && to >= this.anchor)
            return EditorSelection.range(from, to);
        let head = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
        return EditorSelection.range(this.anchor, head);
    }
    eq(other) {
        return this.anchor == other.anchor && this.head == other.head;
    }
    toJSON() { return { anchor: this.anchor, head: this.head }; }
    static fromJSON(json) {
        if (!json || typeof json.anchor != "number" || typeof json.head != "number")
            throw new RangeError("Invalid JSON representation for SelectionRange");
        return EditorSelection.range(json.anchor, json.head);
    }
}
export class EditorSelection {
    constructor(ranges, mainIndex = 0) {
        this.ranges = ranges;
        this.mainIndex = mainIndex;
    }
    map(change, assoc = -1) {
        if (change.empty)
            return this;
        return EditorSelection.create(this.ranges.map(r => r.map(change, assoc)), this.mainIndex);
    }
    eq(other) {
        if (this.ranges.length != other.ranges.length ||
            this.mainIndex != other.mainIndex)
            return false;
        for (let i = 0; i < this.ranges.length; i++)
            if (!this.ranges[i].eq(other.ranges[i]))
                return false;
        return true;
    }
    get main() { return this.ranges[this.mainIndex]; }
    asSingle() {
        return this.ranges.length == 1 ? this : new EditorSelection([this.main]);
    }
    addRange(range, main = true) {
        return EditorSelection.create([range].concat(this.ranges), main ? 0 : this.mainIndex + 1);
    }
    replaceRange(range, which = this.mainIndex) {
        let ranges = this.ranges.slice();
        ranges[which] = range;
        return EditorSelection.create(ranges, this.mainIndex);
    }
    toJSON() {
        return { ranges: this.ranges.map(r => r.toJSON()), main: this.mainIndex };
    }
    static fromJSON(json) {
        if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
            throw new RangeError("Invalid JSON representation for EditorSelection");
        return new EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
    }
    static single(anchor, head = anchor) {
        return new EditorSelection([EditorSelection.range(anchor, head)], 0);
    }
    static create(ranges, mainIndex = 0) {
        if (ranges.length == 0)
            throw new RangeError("A selection needs at least one range");
        for (let pos = 0, i = 0; i < ranges.length; i++) {
            let range = ranges[i];
            if (range.empty ? range.from <= pos : range.from < pos)
                return normalized(ranges.slice(), mainIndex);
            pos = range.to;
        }
        return new EditorSelection(ranges, mainIndex);
    }
    static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
        return new SelectionRange(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 4 : 8) |
            (bidiLevel == null ? 3 : Math.min(2, bidiLevel)) |
            ((goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5));
    }
    static range(anchor, head, goalColumn) {
        let goal = (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 33554431) << 5;
        return head < anchor ? new SelectionRange(head, anchor, 16 | goal | 8)
            : new SelectionRange(anchor, head, goal | (head > anchor ? 4 : 0));
    }
}
function normalized(ranges, mainIndex = 0) {
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
export function checkSelection(selection, docLength) {
    for (let range of selection.ranges)
        if (range.to > docLength)
            throw new RangeError("Selection points outside of document");
}
