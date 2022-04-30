import { MapMode, RangeValue, RangeSet } from "../state/index.js";
import { attrsEq } from "./attributes.js";
export class WidgetType {
    eq(widget) { return false; }
    updateDOM(dom) { return false; }
    compare(other) {
        return this == other || this.constructor == other.constructor && this.eq(other);
    }
    get estimatedHeight() { return -1; }
    ignoreEvent(event) { return true; }
    get customView() { return null; }
    destroy(dom) { }
}
var Side;
(function (Side) {
    Side[Side["NonIncEnd"] = -600000000] = "NonIncEnd";
    Side[Side["GapStart"] = -500000000] = "GapStart";
    Side[Side["BlockBefore"] = -400000000] = "BlockBefore";
    Side[Side["BlockIncStart"] = -300000000] = "BlockIncStart";
    Side[Side["Line"] = -200000000] = "Line";
    Side[Side["InlineBefore"] = -100000000] = "InlineBefore";
    Side[Side["InlineIncStart"] = -1] = "InlineIncStart";
    Side[Side["InlineIncEnd"] = 1] = "InlineIncEnd";
    Side[Side["InlineAfter"] = 100000000] = "InlineAfter";
    Side[Side["BlockIncEnd"] = 200000000] = "BlockIncEnd";
    Side[Side["BlockAfter"] = 300000000] = "BlockAfter";
    Side[Side["GapEnd"] = 400000000] = "GapEnd";
    Side[Side["NonIncStart"] = 500000000] = "NonIncStart";
})(Side || (Side = {}));
export var BlockType;
(function (BlockType) {
    BlockType[BlockType["Text"] = 0] = "Text";
    BlockType[BlockType["WidgetBefore"] = 1] = "WidgetBefore";
    BlockType[BlockType["WidgetAfter"] = 2] = "WidgetAfter";
    BlockType[BlockType["WidgetRange"] = 3] = "WidgetRange";
})(BlockType || (BlockType = {}));
export class Decoration extends RangeValue {
    constructor(startSide, endSide, widget, spec) {
        super();
        this.startSide = startSide;
        this.endSide = endSide;
        this.widget = widget;
        this.spec = spec;
    }
    get heightRelevant() { return false; }
    static mark(spec) {
        return new MarkDecoration(spec);
    }
    static widget(spec) {
        let side = spec.side || 0, block = !!spec.block;
        side += block ? (side > 0 ? 300000000 : -400000000) : (side > 0 ? 100000000 : -100000000);
        return new PointDecoration(spec, side, side, block, spec.widget || null, false);
    }
    static replace(spec) {
        let block = !!spec.block, startSide, endSide;
        if (spec.isBlockGap) {
            startSide = -500000000;
            endSide = 400000000;
        }
        else {
            let { start, end } = getInclusive(spec, block);
            startSide = (start ? (block ? -300000000 : -1) : 500000000) - 1;
            endSide = (end ? (block ? 200000000 : 1) : -600000000) + 1;
        }
        return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
    }
    static line(spec) {
        return new LineDecoration(spec);
    }
    static set(of, sort = false) {
        return RangeSet.of(of, sort);
    }
    hasHeight() { return this.widget ? this.widget.estimatedHeight > -1 : false; }
}
Decoration.none = RangeSet.empty;
export class MarkDecoration extends Decoration {
    constructor(spec) {
        let { start, end } = getInclusive(spec);
        super(start ? -1 : 500000000, end ? 1 : -600000000, null, spec);
        this.tagName = spec.tagName || "span";
        this.class = spec.class || "";
        this.attrs = spec.attributes || null;
    }
    eq(other) {
        return this == other ||
            other instanceof MarkDecoration &&
                this.tagName == other.tagName &&
                this.class == other.class &&
                attrsEq(this.attrs, other.attrs);
    }
    range(from, to = from) {
        if (from >= to)
            throw new RangeError("Mark decorations may not be empty");
        return super.range(from, to);
    }
}
MarkDecoration.prototype.point = false;
export class LineDecoration extends Decoration {
    constructor(spec) {
        super(-200000000, -200000000, null, spec);
    }
    eq(other) {
        return other instanceof LineDecoration && attrsEq(this.spec.attributes, other.spec.attributes);
    }
    range(from, to = from) {
        if (to != from)
            throw new RangeError("Line decoration ranges must be zero-length");
        return super.range(from, to);
    }
}
LineDecoration.prototype.mapMode = MapMode.TrackBefore;
LineDecoration.prototype.point = true;
export class PointDecoration extends Decoration {
    constructor(spec, startSide, endSide, block, widget, isReplace) {
        super(startSide, endSide, widget, spec);
        this.block = block;
        this.isReplace = isReplace;
        this.mapMode = !block ? MapMode.TrackDel : startSide <= 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
    }
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
export function addRange(from, to, ranges, margin = 0) {
    let last = ranges.length - 1;
    if (last >= 0 && ranges[last] + margin >= from)
        ranges[last] = Math.max(ranges[last], to);
    else
        ranges.push(from, to);
}
