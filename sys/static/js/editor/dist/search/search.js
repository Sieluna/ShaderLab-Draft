import { EditorView, ViewPlugin, Decoration, runScopeHandlers, showPanel, getPanel } from "../view/index.js";
import { StateField, StateEffect, EditorSelection, Prec, Facet, RangeSetBuilder } from "../state/index.js";
import elt from "../utils/crelt.js";
import { SearchCursor } from "./cursor.js";
import { RegExpCursor, validRegExp } from "./regexp.js";
import { gotoLine } from "./goto-line.js";
import { selectNextOccurrence } from "./selection-match.js";
const searchConfigFacet = Facet.define({
    combine(configs) {
        var _a;
        return {
            top: configs.reduce((val, conf) => val !== null && val !== void 0 ? val : conf.top, undefined) || false,
            caseSensitive: configs.reduce((val, conf) => val !== null && val !== void 0 ? val : conf.caseSensitive, undefined) || false,
            createPanel: ((_a = configs.find(c => c.createPanel)) === null || _a === void 0 ? void 0 : _a.createPanel) || (view => new SearchPanel(view))
        };
    }
});
export function search(config) {
    return config ? [searchConfigFacet.of(config), searchExtensions] : searchExtensions;
}
export class SearchQuery {
    constructor(config) {
        this.search = config.search;
        this.caseSensitive = !!config.caseSensitive;
        this.regexp = !!config.regexp;
        this.replace = config.replace || "";
        this.valid = !!this.search && (!this.regexp || validRegExp(this.search));
        this.unquoted = config.literal ? this.search : this.search.replace(/\\([nrt\\])/g, (_, ch) => ch == "n" ? "\n" : ch == "r" ? "\r" : ch == "t" ? "\t" : "\\");
    }
    eq(other) {
        return this.search == other.search && this.replace == other.replace &&
            this.caseSensitive == other.caseSensitive && this.regexp == other.regexp;
    }
    create() {
        return this.regexp ? new RegExpQuery(this) : new StringQuery(this);
    }
    getCursor(doc, from = 0, to = doc.length) {
        return this.regexp ? regexpCursor(this, doc, from, to) : stringCursor(this, doc, from, to);
    }
}
class QueryType {
    constructor(spec) {
        this.spec = spec;
    }
}
var FindPrev;
(function (FindPrev) {
    FindPrev[FindPrev["ChunkSize"] = 10000] = "ChunkSize";
})(FindPrev || (FindPrev = {}));
function stringCursor(spec, doc, from, to) {
    return new SearchCursor(doc, spec.unquoted, from, to, spec.caseSensitive ? undefined : x => x.toLowerCase());
}
class StringQuery extends QueryType {
    constructor(spec) {
        super(spec);
    }
    nextMatch(doc, curFrom, curTo) {
        let cursor = stringCursor(this.spec, doc, curTo, doc.length).nextOverlapping();
        if (cursor.done)
            cursor = stringCursor(this.spec, doc, 0, curFrom).nextOverlapping();
        return cursor.done ? null : cursor.value;
    }
    prevMatchInRange(doc, from, to) {
        for (let pos = to;;) {
            let start = Math.max(from, pos - 10000 - this.spec.unquoted.length);
            let cursor = stringCursor(this.spec, doc, start, pos), range = null;
            while (!cursor.nextOverlapping().done)
                range = cursor.value;
            if (range)
                return range;
            if (start == from)
                return null;
            pos -= 10000;
        }
    }
    prevMatch(doc, curFrom, curTo) {
        return this.prevMatchInRange(doc, 0, curFrom) ||
            this.prevMatchInRange(doc, curTo, doc.length);
    }
    getReplacement(_result) { return this.spec.replace; }
    matchAll(doc, limit) {
        let cursor = stringCursor(this.spec, doc, 0, doc.length), ranges = [];
        while (!cursor.next().done) {
            if (ranges.length >= limit)
                return null;
            ranges.push(cursor.value);
        }
        return ranges;
    }
    highlight(doc, from, to, add) {
        let cursor = stringCursor(this.spec, doc, Math.max(0, from - this.spec.unquoted.length), Math.min(to + this.spec.unquoted.length, doc.length));
        while (!cursor.next().done)
            add(cursor.value.from, cursor.value.to);
    }
}
var RegExp;
(function (RegExp) {
    RegExp[RegExp["HighlightMargin"] = 250] = "HighlightMargin";
})(RegExp || (RegExp = {}));
function regexpCursor(spec, doc, from, to) {
    return new RegExpCursor(doc, spec.search, spec.caseSensitive ? undefined : { ignoreCase: true }, from, to);
}
class RegExpQuery extends QueryType {
    nextMatch(doc, curFrom, curTo) {
        let cursor = regexpCursor(this.spec, doc, curTo, doc.length).next();
        if (cursor.done)
            cursor = regexpCursor(this.spec, doc, 0, curFrom).next();
        return cursor.done ? null : cursor.value;
    }
    prevMatchInRange(doc, from, to) {
        for (let size = 1;; size++) {
            let start = Math.max(from, to - size * 10000);
            let cursor = regexpCursor(this.spec, doc, start, to), range = null;
            while (!cursor.next().done)
                range = cursor.value;
            if (range && (start == from || range.from > start + 10))
                return range;
            if (start == from)
                return null;
        }
    }
    prevMatch(doc, curFrom, curTo) {
        return this.prevMatchInRange(doc, 0, curFrom) ||
            this.prevMatchInRange(doc, curTo, doc.length);
    }
    getReplacement(result) {
        return this.spec.replace.replace(/\$([$&\d+])/g, (m, i) => i == "$" ? "$"
            : i == "&" ? result.match[0]
                : i != "0" && +i < result.match.length ? result.match[i]
                    : m);
    }
    matchAll(doc, limit) {
        let cursor = regexpCursor(this.spec, doc, 0, doc.length), ranges = [];
        while (!cursor.next().done) {
            if (ranges.length >= limit)
                return null;
            ranges.push(cursor.value);
        }
        return ranges;
    }
    highlight(doc, from, to, add) {
        let cursor = regexpCursor(this.spec, doc, Math.max(0, from - 250), Math.min(to + 250, doc.length));
        while (!cursor.next().done)
            add(cursor.value.from, cursor.value.to);
    }
}
export const setSearchQuery = StateEffect.define();
const togglePanel = StateEffect.define();
const searchState = StateField.define({
    create(state) {
        return new SearchState(defaultQuery(state).create(), null);
    },
    update(value, tr) {
        for (let effect of tr.effects) {
            if (effect.is(setSearchQuery))
                value = new SearchState(effect.value.create(), value.panel);
            else if (effect.is(togglePanel))
                value = new SearchState(value.query, effect.value ? createSearchPanel : null);
        }
        return value;
    },
    provide: f => showPanel.from(f, val => val.panel)
});
export function getSearchQuery(state) {
    let curState = state.field(searchState, false);
    return curState ? curState.query.spec : defaultQuery(state);
}
class SearchState {
    constructor(query, panel) {
        this.query = query;
        this.panel = panel;
    }
}
const matchMark = Decoration.mark({ class: "cm-searchMatch" }), selectedMatchMark = Decoration.mark({ class: "cm-searchMatch cm-searchMatch-selected" });
const searchHighlighter = ViewPlugin.fromClass(class {
    constructor(view) {
        this.view = view;
        this.decorations = this.highlight(view.state.field(searchState));
    }
    update(update) {
        let state = update.state.field(searchState);
        if (state != update.startState.field(searchState) || update.docChanged || update.selectionSet || update.viewportChanged)
            this.decorations = this.highlight(state);
    }
    highlight({ query, panel }) {
        if (!panel || !query.spec.valid)
            return Decoration.none;
        let { view } = this;
        let builder = new RangeSetBuilder();
        for (let i = 0, ranges = view.visibleRanges, l = ranges.length; i < l; i++) {
            let { from, to } = ranges[i];
            while (i < l - 1 && to > ranges[i + 1].from - 2 * 250)
                to = ranges[++i].to;
            query.highlight(view.state.doc, from, to, (from, to) => {
                let selected = view.state.selection.ranges.some(r => r.from == from && r.to == to);
                builder.add(from, to, selected ? selectedMatchMark : matchMark);
            });
        }
        return builder.finish();
    }
}, {
    decorations: v => v.decorations
});
function searchCommand(f) {
    return view => {
        let state = view.state.field(searchState, false);
        return state && state.query.spec.valid ? f(view, state) : openSearchPanel(view);
    };
}
export const findNext = searchCommand((view, { query }) => {
    let { from, to } = view.state.selection.main;
    let next = query.nextMatch(view.state.doc, from, to);
    if (!next || next.from == from && next.to == to)
        return false;
    view.dispatch({
        selection: { anchor: next.from, head: next.to },
        scrollIntoView: true,
        effects: announceMatch(view, next),
        userEvent: "select.search"
    });
    return true;
});
export const findPrevious = searchCommand((view, { query }) => {
    let { state } = view, { from, to } = state.selection.main;
    let range = query.prevMatch(state.doc, from, to);
    if (!range)
        return false;
    view.dispatch({
        selection: { anchor: range.from, head: range.to },
        scrollIntoView: true,
        effects: announceMatch(view, range),
        userEvent: "select.search"
    });
    return true;
});
export const selectMatches = searchCommand((view, { query }) => {
    let ranges = query.matchAll(view.state.doc, 1000);
    if (!ranges || !ranges.length)
        return false;
    view.dispatch({
        selection: EditorSelection.create(ranges.map(r => EditorSelection.range(r.from, r.to))),
        userEvent: "select.search.matches"
    });
    return true;
});
export const selectSelectionMatches = ({ state, dispatch }) => {
    let sel = state.selection;
    if (sel.ranges.length > 1 || sel.main.empty)
        return false;
    let { from, to } = sel.main;
    let ranges = [], main = 0;
    for (let cur = new SearchCursor(state.doc, state.sliceDoc(from, to)); !cur.next().done;) {
        if (ranges.length > 1000)
            return false;
        if (cur.value.from == from)
            main = ranges.length;
        ranges.push(EditorSelection.range(cur.value.from, cur.value.to));
    }
    dispatch(state.update({
        selection: EditorSelection.create(ranges, main),
        userEvent: "select.search.matches"
    }));
    return true;
};
export const replaceNext = searchCommand((view, { query }) => {
    let { state } = view, { from, to } = state.selection.main;
    if (state.readOnly)
        return false;
    let next = query.nextMatch(state.doc, from, from);
    if (!next)
        return false;
    let changes = [], selection, replacement;
    if (next.from == from && next.to == to) {
        replacement = state.toText(query.getReplacement(next));
        changes.push({ from: next.from, to: next.to, insert: replacement });
        next = query.nextMatch(state.doc, next.from, next.to);
    }
    if (next) {
        let off = changes.length == 0 || changes[0].from >= next.to ? 0 : next.to - next.from - replacement.length;
        selection = { anchor: next.from - off, head: next.to - off };
    }
    view.dispatch({
        changes, selection,
        scrollIntoView: !!selection,
        effects: next ? announceMatch(view, next) : undefined,
        userEvent: "input.replace"
    });
    return true;
});
export const replaceAll = searchCommand((view, { query }) => {
    if (view.state.readOnly)
        return false;
    let changes = query.matchAll(view.state.doc, 1e9).map(match => {
        let { from, to } = match;
        return { from, to, insert: query.getReplacement(match) };
    });
    if (!changes.length)
        return false;
    view.dispatch({
        changes,
        userEvent: "input.replace.all"
    });
    return true;
});
function createSearchPanel(view) {
    return view.state.facet(searchConfigFacet).createPanel(view);
}
function defaultQuery(state, fallback) {
    var _a;
    let sel = state.selection.main;
    let selText = sel.empty || sel.to > sel.from + 100 ? "" : state.sliceDoc(sel.from, sel.to);
    let caseSensitive = (_a = fallback === null || fallback === void 0 ? void 0 : fallback.caseSensitive) !== null && _a !== void 0 ? _a : state.facet(searchConfigFacet).caseSensitive;
    return fallback && !selText ? fallback : new SearchQuery({ search: selText.replace(/\n/g, "\\n"), caseSensitive });
}
export const openSearchPanel = view => {
    let state = view.state.field(searchState, false);
    if (state && state.panel) {
        let panel = getPanel(view, createSearchPanel);
        if (!panel)
            return false;
        let searchInput = panel.dom.querySelector("[name=search]");
        if (searchInput != view.root.activeElement) {
            let query = defaultQuery(view.state, state.query.spec);
            if (query.valid)
                view.dispatch({ effects: setSearchQuery.of(query) });
            searchInput.focus();
            searchInput.select();
        }
    }
    else {
        view.dispatch({ effects: [
                togglePanel.of(true),
                state ? setSearchQuery.of(defaultQuery(view.state, state.query.spec)) : StateEffect.appendConfig.of(searchExtensions)
            ] });
    }
    return true;
};
export const closeSearchPanel = view => {
    let state = view.state.field(searchState, false);
    if (!state || !state.panel)
        return false;
    let panel = getPanel(view, createSearchPanel);
    if (panel && panel.dom.contains(view.root.activeElement))
        view.focus();
    view.dispatch({ effects: togglePanel.of(false) });
    return true;
};
export const searchKeymap = [
    { key: "Mod-f", run: openSearchPanel, scope: "editor search-panel" },
    { key: "F3", run: findNext, shift: findPrevious, scope: "editor search-panel", preventDefault: true },
    { key: "Mod-g", run: findNext, shift: findPrevious, scope: "editor search-panel", preventDefault: true },
    { key: "Escape", run: closeSearchPanel, scope: "editor search-panel" },
    { key: "Mod-Shift-l", run: selectSelectionMatches },
    { key: "Alt-g", run: gotoLine },
    { key: "Mod-d", run: selectNextOccurrence, preventDefault: true },
];
class SearchPanel {
    constructor(view) {
        this.view = view;
        let query = this.query = view.state.field(searchState).query.spec;
        this.commit = this.commit.bind(this);
        this.searchField = elt("input", {
            value: query.search,
            placeholder: phrase(view, "Find"),
            "aria-label": phrase(view, "Find"),
            class: "cm-textfield",
            name: "search",
            onchange: this.commit,
            onkeyup: this.commit
        });
        this.replaceField = elt("input", {
            value: query.replace,
            placeholder: phrase(view, "Replace"),
            "aria-label": phrase(view, "Replace"),
            class: "cm-textfield",
            name: "replace",
            onchange: this.commit,
            onkeyup: this.commit
        });
        this.caseField = elt("input", {
            type: "checkbox",
            name: "case",
            checked: query.caseSensitive,
            onchange: this.commit
        });
        this.reField = elt("input", {
            type: "checkbox",
            name: "re",
            checked: query.regexp,
            onchange: this.commit
        });
        function button(name, onclick, content) {
            return elt("button", { class: "cm-button", name, onclick, type: "button" }, content);
        }
        this.dom = elt("div", { onkeydown: (e) => this.keydown(e), class: "cm-search" }, [
            this.searchField,
            button("next", () => findNext(view), [phrase(view, "next")]),
            button("prev", () => findPrevious(view), [phrase(view, "previous")]),
            button("select", () => selectMatches(view), [phrase(view, "all")]),
            elt("label", null, [this.caseField, phrase(view, "match case")]),
            elt("label", null, [this.reField, phrase(view, "regexp")]),
            ...view.state.readOnly ? [] : [
                elt("br"),
                this.replaceField,
                button("replace", () => replaceNext(view), [phrase(view, "replace")]),
                button("replaceAll", () => replaceAll(view), [phrase(view, "replace all")]),
                elt("button", {
                    name: "close",
                    onclick: () => closeSearchPanel(view),
                    "aria-label": phrase(view, "close"),
                    type: "button"
                }, ["×"])
            ]
        ]);
    }
    commit() {
        let query = new SearchQuery({
            search: this.searchField.value,
            caseSensitive: this.caseField.checked,
            regexp: this.reField.checked,
            replace: this.replaceField.value
        });
        if (!query.eq(this.query)) {
            this.query = query;
            this.view.dispatch({ effects: setSearchQuery.of(query) });
        }
    }
    keydown(e) {
        if (runScopeHandlers(this.view, e, "search-panel")) {
            e.preventDefault();
        }
        else if (e.keyCode == 13 && e.target == this.searchField) {
            e.preventDefault();
            (e.shiftKey ? findPrevious : findNext)(this.view);
        }
        else if (e.keyCode == 13 && e.target == this.replaceField) {
            e.preventDefault();
            replaceNext(this.view);
        }
    }
    update(update) {
        for (let tr of update.transactions)
            for (let effect of tr.effects) {
                if (effect.is(setSearchQuery) && !effect.value.eq(this.query))
                    this.setQuery(effect.value);
            }
    }
    setQuery(query) {
        this.query = query;
        this.searchField.value = query.search;
        this.replaceField.value = query.replace;
        this.caseField.checked = query.caseSensitive;
        this.reField.checked = query.regexp;
    }
    mount() {
        this.searchField.select();
    }
    get pos() { return 80; }
    get top() { return this.view.state.facet(searchConfigFacet).top; }
}
function phrase(view, phrase) { return view.state.phrase(phrase); }
const AnnounceMargin = 30;
const Break = /[\s\.,:;?!]/;
function announceMatch(view, { from, to }) {
    let lineStart = view.state.doc.lineAt(from).from, lineEnd = view.state.doc.lineAt(to).to;
    let start = Math.max(lineStart, from - AnnounceMargin), end = Math.min(lineEnd, to + AnnounceMargin);
    let text = view.state.sliceDoc(start, end);
    if (start != lineStart) {
        for (let i = 0; i < AnnounceMargin; i++)
            if (!Break.test(text[i + 1]) && Break.test(text[i])) {
                text = text.slice(i);
                break;
            }
    }
    if (end != lineEnd) {
        for (let i = text.length - 1; i > text.length - AnnounceMargin; i--)
            if (!Break.test(text[i - 1]) && Break.test(text[i])) {
                text = text.slice(0, i);
                break;
            }
    }
    return EditorView.announce.of(`${view.state.phrase("current match")}. ${text} ${view.state.phrase("on line")} ${view.state.doc.lineAt(from).number}`);
}
const baseTheme = EditorView.baseTheme({
    ".cm-panel.cm-search": {
        padding: "2px 6px 4px",
        position: "relative",
        "& [name=close]": {
            position: "absolute",
            top: "0",
            right: "4px",
            backgroundColor: "inherit",
            border: "none",
            font: "inherit",
            padding: 0,
            margin: 0
        },
        "& input, & button, & label": {
            margin: ".2em .6em .2em 0"
        },
        "& input[type=checkbox]": {
            marginRight: ".2em"
        },
        "& label": {
            fontSize: "80%",
            whiteSpace: "pre"
        }
    },
    "&light .cm-searchMatch": { backgroundColor: "#ffff0054" },
    "&dark .cm-searchMatch": { backgroundColor: "#00ffff8a" },
    "&light .cm-searchMatch-selected": { backgroundColor: "#ff6a0054" },
    "&dark .cm-searchMatch-selected": { backgroundColor: "#ff00ff8a" }
});
const searchExtensions = [
    searchState,
    Prec.lowest(searchHighlighter),
    baseTheme
];
