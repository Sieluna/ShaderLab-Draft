import browser from "./browser.js";
import { ContentView } from "./contentview.js";
import { editable } from "./extension.js";
import { hasSelection, getSelection, DOMSelectionState, isEquivalentPosition, deepActiveElement, dispatchKey } from "./dom.js";
const observeOptions = {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    characterDataOldValue: true
};
const useCharData = browser.ie && browser.ie_version <= 11;
export class DOMObserver {
    constructor(view, onChange, onScrollChanged) {
        this.view = view;
        this.onChange = onChange;
        this.onScrollChanged = onScrollChanged;
        this.active = false;
        this.selectionRange = new DOMSelectionState;
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
        this.parentCheck = -1;
        this.dom = view.contentDOM;
        this.observer = new MutationObserver(mutations => {
            for (let mut of mutations)
                this.queue.push(mut);
            if ((browser.ie && browser.ie_version <= 11 || browser.ios && view.composing) &&
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
        if (view.state.facet(editable) ? view.root.activeElement != this.dom : !hasSelection(view.dom, sel))
            return;
        let context = sel.anchorNode && view.docView.nearest(sel.anchorNode);
        if (context && context.ignoreEvent(event))
            return;
        if ((browser.ie && browser.ie_version <= 11 || browser.android && browser.chrome) && !view.state.selection.main.empty &&
            sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
            this.flushSoon();
        else
            this.flush(false);
    }
    readSelectionRange() {
        let { root } = this.view, domSel = getSelection(root);
        let range = browser.safari && root.nodeType == 11 && deepActiveElement() == this.view.contentDOM &&
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
            else if (dom.nodeType == 11) {
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
    clear() {
        this.processRecords();
        this.queue.length = 0;
        this.selectionChanged = false;
    }
    delayAndroidKey(key, keyCode) {
        if (!this.delayedAndroidKey)
            requestAnimationFrame(() => {
                let key = this.delayedAndroidKey;
                this.delayedAndroidKey = null;
                let startState = this.view.state;
                if (dispatchKey(this.view.contentDOM, key.key, key.keyCode))
                    this.processRecords();
                else
                    this.flush();
                if (this.view.state == startState)
                    this.view.update([]);
            });
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
    flush(readSelection = true) {
        if (this.delayedFlush >= 0 || this.delayedAndroidKey)
            return;
        if (readSelection)
            this.readSelectionRange();
        let { from, to, typeOver } = this.processRecords();
        let newSel = this.selectionChanged && hasSelection(this.dom, this.selectionRange);
        if (from < 0 && !newSel)
            return;
        this.selectionChanged = false;
        let startState = this.view.state;
        this.onChange(from, to, typeOver);
        if (this.view.state == startState)
            this.view.update([]);
    }
    readMutation(rec) {
        let cView = this.view.docView.nearest(rec.target);
        if (!cView || cView.ignoreMutation(rec))
            return null;
        cView.markDirty(rec.type == "attributes");
        if (rec.type == "attributes")
            cView.dirty |= 4;
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
        let curView = ContentView.get(dom);
        if (curView && curView.parent == cView)
            return curView;
        let parent = dom.parentNode;
        dom = parent != cView.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
    }
    return null;
}
function safariSelectionRangeHack(view) {
    let found = null;
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
    if (isEquivalentPosition(curAnchor.node, curAnchor.offset, focusNode, focusOffset))
        [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
    return { anchorNode, anchorOffset, focusNode, focusOffset };
}
