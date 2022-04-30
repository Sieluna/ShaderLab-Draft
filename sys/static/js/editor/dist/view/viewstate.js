import { Text, ChangeSet, RangeSet } from "../state/index.js";
import { HeightMap, HeightOracle, BlockInfo, MeasuredHeights, QueryType, heightRelevantDecoChanges } from "./heightmap.js";
import { decorations, ChangedRange } from "./extension.js";
import { WidgetType, Decoration } from "./decoration.js";
import { Direction } from "./bidi.js";
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
        else if (parent.nodeType == 11) {
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
var VP;
(function (VP) {
    VP[VP["Margin"] = 1000] = "Margin";
    VP[VP["MinCoverMargin"] = 10] = "MinCoverMargin";
    VP[VP["MaxCoverMargin"] = 250] = "MaxCoverMargin";
    VP[VP["MaxDOMHeight"] = 7000000] = "MaxDOMHeight";
})(VP || (VP = {}));
export class LineGap {
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
        return Decoration.replace({ widget: new LineGapWidget(this.size, wrapping) }).range(this.from, this.to);
    }
}
class LineGapWidget extends WidgetType {
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
var LG;
(function (LG) {
    LG[LG["Margin"] = 2000] = "Margin";
    LG[LG["HalfMargin"] = 1000] = "HalfMargin";
    LG[LG["DoubleMargin"] = 4000] = "DoubleMargin";
    LG[LG["SelectionMargin"] = 10] = "SelectionMargin";
})(LG || (LG = {}));
export class ViewState {
    constructor(state) {
        this.state = state;
        this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 };
        this.inView = true;
        this.paddingTop = 0;
        this.paddingBottom = 0;
        this.contentDOMWidth = 0;
        this.contentDOMHeight = 0;
        this.editorHeight = 0;
        this.editorWidth = 0;
        this.heightOracle = new HeightOracle;
        this.scaler = IdScaler;
        this.scrollTarget = null;
        this.printing = false;
        this.mustMeasureContent = true;
        this.defaultTextDirection = Direction.RTL;
        this.visibleRanges = [];
        this.mustEnforceCursorAssoc = false;
        this.stateDeco = state.facet(decorations).filter(d => typeof d != "function");
        this.heightMap = HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle.setDoc(state.doc), [new ChangedRange(0, 0, 0, state.doc.length)]);
        this.viewport = this.getViewport(0, null);
        this.updateViewportLines();
        this.updateForViewport();
        this.lineGaps = this.ensureLineGaps([]);
        this.lineGapDeco = Decoration.set(this.lineGaps.map(gap => gap.draw(false)));
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
        this.scaler = this.heightMap.height <= 7000000 ? IdScaler :
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
        this.stateDeco = this.state.facet(decorations).filter(d => typeof d != "function");
        let contentChanges = update.changedRanges;
        let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(prevDeco, this.stateDeco, update ? update.changes : ChangeSet.empty(this.state.doc.length)));
        let prevHeight = this.heightMap.height;
        this.heightMap = this.heightMap.applyChanges(this.stateDeco, update.startState.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
        if (this.heightMap.height != prevHeight)
            update.flags |= 2;
        let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
        if (scrollTarget && (scrollTarget.range.head < viewport.from || scrollTarget.range.head > viewport.to) ||
            !this.viewportIsAppropriate(viewport))
            viewport = this.getViewport(0, scrollTarget);
        let updateLines = !update.changes.empty || (update.flags & 2) ||
            viewport.from != this.viewport.from || viewport.to != this.viewport.to;
        this.viewport = viewport;
        this.updateForViewport();
        if (updateLines)
            this.updateViewportLines();
        if (this.lineGaps.length || this.viewport.to - this.viewport.from > 4000)
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
        this.defaultTextDirection = style.direction == "rtl" ? Direction.RTL : Direction.LTR;
        let refresh = this.heightOracle.mustRefreshForWrapping(whiteSpace);
        let measureContent = refresh || this.mustMeasureContent || this.contentDOMHeight != dom.clientHeight;
        let result = 0, bias = 0;
        if (this.editorWidth != view.scrollDOM.clientWidth) {
            if (oracle.lineWrapping)
                measureContent = true;
            this.editorWidth = view.scrollDOM.clientWidth;
            result |= 8;
        }
        if (measureContent) {
            this.mustMeasureContent = false;
            this.contentDOMHeight = dom.clientHeight;
            let paddingTop = parseInt(style.paddingTop) || 0, paddingBottom = parseInt(style.paddingBottom) || 0;
            if (this.paddingTop != paddingTop || this.paddingBottom != paddingBottom) {
                result |= 8;
                this.paddingTop = paddingTop;
                this.paddingBottom = paddingBottom;
            }
        }
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
            result |= 8;
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
                    result |= 8;
                }
            }
            if (dTop > 0 && dBottom > 0)
                bias = Math.max(dTop, dBottom);
            else if (dTop < 0 && dBottom < 0)
                bias = Math.min(dTop, dBottom);
            oracle.heightChanged = false;
            for (let vp of this.viewports) {
                let heights = vp.from == this.viewport.from ? lineHeights : view.docView.measureVisibleLineHeights(vp);
                this.heightMap = this.heightMap.updateHeight(oracle, 0, refresh, new MeasuredHeights(vp.from, heights));
            }
            if (oracle.heightChanged)
                result |= 2;
        }
        let viewportChange = !this.viewportIsAppropriate(this.viewport, bias) ||
            this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
        if (viewportChange)
            this.viewport = this.getViewport(bias, this.scrollTarget);
        this.updateForViewport();
        if ((result & 2) || viewportChange)
            this.updateViewportLines();
        if (this.lineGaps.length || this.viewport.to - this.viewport.from > 4000)
            this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps));
        result |= this.computeVisibleRanges();
        if (this.mustEnforceCursorAssoc) {
            this.mustEnforceCursorAssoc = false;
            view.docView.enforceCursorAssoc();
        }
        return result;
    }
    get visibleTop() { return this.scaler.fromDOM(this.pixelViewport.top); }
    get visibleBottom() { return this.scaler.fromDOM(this.pixelViewport.bottom); }
    getViewport(bias, scrollTarget) {
        let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1000 / 2));
        let map = this.heightMap, doc = this.state.doc, { visibleTop, visibleBottom } = this;
        let viewport = new Viewport(map.lineAt(visibleTop - marginTop * 1000, QueryType.ByHeight, doc, 0, 0).from, map.lineAt(visibleBottom + (1 - marginTop) * 1000, QueryType.ByHeight, doc, 0, 0).to);
        if (scrollTarget) {
            let { head } = scrollTarget.range;
            if (head < viewport.from || head > viewport.to) {
                let viewHeight = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top);
                let block = map.lineAt(head, QueryType.ByPos, doc, 0, 0), topPos;
                if (scrollTarget.y == "center")
                    topPos = (block.top + block.bottom) / 2 - viewHeight / 2;
                else if (scrollTarget.y == "start" || scrollTarget.y == "nearest" && head < viewport.from)
                    topPos = block.top;
                else
                    topPos = block.bottom - viewHeight;
                viewport = new Viewport(map.lineAt(topPos - 1000 / 2, QueryType.ByHeight, doc, 0, 0).from, map.lineAt(topPos + viewHeight + 1000 / 2, QueryType.ByHeight, doc, 0, 0).to);
            }
        }
        return viewport;
    }
    mapViewport(viewport, changes) {
        let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
        return new Viewport(this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0).from, this.heightMap.lineAt(to, QueryType.ByPos, this.state.doc, 0, 0).to);
    }
    viewportIsAppropriate({ from, to }, bias = 0) {
        if (!this.inView)
            return true;
        let { top } = this.heightMap.lineAt(from, QueryType.ByPos, this.state.doc, 0, 0);
        let { bottom } = this.heightMap.lineAt(to, QueryType.ByPos, this.state.doc, 0, 0);
        let { visibleTop, visibleBottom } = this;
        return (from == 0 || top <= visibleTop - Math.max(10, Math.min(-bias, 250))) &&
            (to == this.state.doc.length ||
                bottom >= visibleBottom + Math.max(10, Math.min(bias, 250))) &&
            (top > visibleTop - 2 * 1000 && bottom < visibleBottom + 2 * 1000);
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
    ensureLineGaps(current) {
        let gaps = [];
        if (this.defaultTextDirection != Direction.LTR)
            return gaps;
        for (let line of this.viewportLines) {
            if (line.length < 4000)
                continue;
            let structure = lineStructure(line.from, line.to, this.stateDeco);
            if (structure.total < 4000)
                continue;
            let viewFrom, viewTo;
            if (this.heightOracle.lineWrapping) {
                let marginHeight = (2000 / this.heightOracle.lineLength) * this.heightOracle.lineHeight;
                viewFrom = findPosition(structure, (this.visibleTop - line.top - marginHeight) / line.height);
                viewTo = findPosition(structure, (this.visibleBottom - line.top + marginHeight) / line.height);
            }
            else {
                let totalWidth = structure.total * this.heightOracle.charWidth;
                let marginWidth = 2000 * this.heightOracle.charWidth;
                viewFrom = findPosition(structure, (this.pixelViewport.left - marginWidth) / totalWidth);
                viewTo = findPosition(structure, (this.pixelViewport.right + marginWidth) / totalWidth);
            }
            let outside = [];
            if (viewFrom > line.from)
                outside.push({ from: line.from, to: viewFrom });
            if (viewTo < line.to)
                outside.push({ from: viewTo, to: line.to });
            let sel = this.state.selection.main;
            if (sel.from >= line.from && sel.from <= line.to)
                cutRange(outside, sel.from - 10, sel.from + 10);
            if (!sel.empty && sel.to >= line.from && sel.to <= line.to)
                cutRange(outside, sel.to - 10, sel.to + 10);
            for (let { from, to } of outside)
                if (to - from > 1000) {
                    gaps.push(find(current, gap => gap.from >= line.from && gap.to <= line.to &&
                        Math.abs(gap.from - from) < 1000 && Math.abs(gap.to - to) < 1000) ||
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
            this.lineGapDeco = Decoration.set(gaps.map(gap => gap.draw(this.heightOracle.lineWrapping)));
        }
    }
    computeVisibleRanges() {
        let deco = this.stateDeco;
        if (this.lineGaps.length)
            deco = deco.concat(this.lineGapDeco);
        let ranges = [];
        RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
            span(from, to) { ranges.push({ from, to }); },
            point() { }
        }, 20);
        let changed = ranges.length != this.visibleRanges.length ||
            this.visibleRanges.some((r, i) => r.from != ranges[i].from || r.to != ranges[i].to);
        this.visibleRanges = ranges;
        return changed ? 4 : 0;
    }
    lineBlockAt(pos) {
        return (pos >= this.viewport.from && pos <= this.viewport.to && this.viewportLines.find(b => b.from <= pos && b.to >= pos)) ||
            scaleBlock(this.heightMap.lineAt(pos, QueryType.ByPos, this.state.doc, 0, 0), this.scaler);
    }
    lineBlockAtHeight(height) {
        return scaleBlock(this.heightMap.lineAt(this.scaler.fromDOM(height), QueryType.ByHeight, this.state.doc, 0, 0), this.scaler);
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
export class Viewport {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}
function lineStructure(from, to, stateDeco) {
    let ranges = [], pos = from, total = 0;
    RangeSet.spans(stateDeco, from, to, {
        span() { },
        point(from, to) {
            if (from > pos) {
                ranges.push({ from: pos, to: from });
                total += from - pos;
            }
            pos = to;
        }
    }, 20);
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
const IdScaler = {
    toDOM(n) { return n; },
    fromDOM(n) { return n; },
    scale: 1
};
class BigScaler {
    constructor(doc, heightMap, viewports) {
        let vpHeight = 0, base = 0, domBase = 0;
        this.viewports = viewports.map(({ from, to }) => {
            let top = heightMap.lineAt(from, QueryType.ByPos, doc, 0, 0).top;
            let bottom = heightMap.lineAt(to, QueryType.ByPos, doc, 0, 0).bottom;
            vpHeight += bottom - top;
            return { from, to, top, bottom, domTop: 0, domBottom: 0 };
        });
        this.scale = (7000000 - vpHeight) / (heightMap.height - vpHeight);
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
    return new BlockInfo(block.from, block.length, bTop, bBottom - bTop, Array.isArray(block.type) ? block.type.map(b => scaleBlock(b, scaler)) : block.type);
}
