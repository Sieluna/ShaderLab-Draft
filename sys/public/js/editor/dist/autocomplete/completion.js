import { Annotation, EditorSelection } from "../state/index.js";
import { syntaxTree } from "../language/index.js";
export class CompletionContext {
    constructor(state, pos, explicit) {
        this.state = state;
        this.pos = pos;
        this.explicit = explicit;
        // @internal
        this.abortListeners = [];
    }
    tokenBefore(types) {
        let token = syntaxTree(this.state).resolveInner(this.pos, -1);
        while (token && types.indexOf(token.name) < 0)
            token = token.parent;
        return token ? { from: token.from, to: this.pos,
            text: this.state.sliceDoc(token.from, this.pos),
            type: token.type } : null;
    }
    /** @return Get the match of ythe given expression directly before the cursor */
    matchBefore(expr) {
        let line = this.state.doc.lineAt(this.pos);
        let start = Math.max(line.from, this.pos - 250);
        let str = line.text.slice(start - line.from, this.pos - line.from);
        let found = str.search(ensureAnchor(expr, false));
        return found < 0 ? null : { from: start + found, to: this.pos, text: str.slice(found) };
    }
    get aborted() {
        return this.abortListeners == null;
    }
    addEventListener(type, listener) {
        if (type == "abort" && this.abortListeners)
            this.abortListeners.push(listener);
    }
}
function toSet(chars) {
    let flat = Object.keys(chars).join("");
    let words = /\w/.test(flat);
    if (words)
        flat = flat.replace(/\w/g, "");
    return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
}
function prefixMatch(options) {
    let first = Object.create(null), rest = Object.create(null);
    for (let { label } of options) {
        first[label[0]] = true;
        for (let i = 1; i < label.length; i++)
            rest[label[i]] = true;
    }
    let source = toSet(first) + toSet(rest) + "*$";
    return [new RegExp("^" + source), new RegExp(source)];
}
export function completeFromList(list) {
    let options = list.map(o => typeof o == "string" ? { label: o } : o);
    let [validFor, match] = options.every(o => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
    return (context) => {
        let token = context.matchBefore(match);
        return token || context.explicit ? { from: token ? token.from : context.pos, options, validFor } : null;
    };
}
/** Wrap the given completion source so that it will only fire when the cursor is in a syntax node with on of the given names */
export function ifIn(nodes, source) {
    return (context) => {
        for (let pos = syntaxTree(context.state).resolveInner(context.pos, -1); pos; pos = pos.parent)
            if (nodes.indexOf(pos.name) > -1)
                return source(context);
        return null;
    };
}
/**  Wrap the given completion source so that it will not fire when the cursor is in a syntax node with one of the given names. */
export function ifNotIn(nodes, source) {
    return (context) => {
        for (let pos = syntaxTree(context.state).resolveInner(context.pos, -1); pos; pos = pos.parent)
            if (nodes.indexOf(pos.name) > -1)
                return null;
        return source(context);
    };
}
export class Option {
    constructor(completion, source, match) {
        this.completion = completion;
        this.source = source;
        this.match = match;
    }
}
export function cur(state) { return state.selection.main.head; }
export function ensureAnchor(expr, start) {
    var _a;
    let { source } = expr;
    let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
    if (!addStart && !addEnd)
        return expr;
    return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a = expr.flags) !== null && _a !== void 0 ? _a : (expr.ignoreCase ? "i" : ""));
}
/** This annotation is added to transactions that are produced by picking a completion. */
export const pickedCompletion = Annotation.define();
/**
 * Helper function that returns a transaction spec which inserts a completion's text in the main selection
 * range, and any other selection range that has the same text in front of it.
 * @param state
 * @param text
 * @param from
 * @param to
 */
export function insertCompletionText(state, text, from, to) {
    return Object.assign(Object.assign({}, state.changeByRange(range => {
        if (range == state.selection.main)
            return {
                changes: { from: from, to: to, insert: text },
                range: EditorSelection.cursor(from + text.length)
            };
        let len = to - from;
        if (!range.empty ||
            len && state.sliceDoc(range.from - len, range.from) != state.sliceDoc(from, to))
            return { range };
        return {
            changes: { from: range.from - len, to: range.from, insert: text },
            range: EditorSelection.cursor(range.from - len + text.length)
        };
    })), { userEvent: "input.complete" });
}
export function applyCompletion(view, option) {
    const apply = option.completion.apply || option.completion.label;
    let result = option.source;
    if (typeof apply == "string")
        view.dispatch(insertCompletionText(view.state, apply, result.from, result.to));
    else
        apply(view, option.completion, result.from, result.to);
}
const SourceCache = new WeakMap();
export function asSource(source) {
    if (!Array.isArray(source))
        return source;
    let known = SourceCache.get(source);
    if (!known)
        SourceCache.set(source, known = completeFromList(source));
    return known;
}
