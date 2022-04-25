import {EditorView} from "../view/index"
import {EditorState, Annotation, EditorSelection} from "../state/index"
import {syntaxTree} from "../language/index"
import {SyntaxNode} from "../lezer/common/index"
import {ActiveResult} from "./state"

export interface Completion {
    label: string,
    /** Detail information of the completion under label */
    detail?: string,
    /** show when the completion is selected */
    info?: string | ((completion: Completion) => (Node | null | Promise<Node | null>)),
    /** The detail procedure of completion, such as for loop, function */
    apply?: string | ((view: EditorView, completion: Completion, from: number, to: number) => void),
    /** The type of completion, select icon such as 🔑 'keyword'*/
    type?: string,
    /** From -99 to 99 that adjusts how this completion is ranked, positive high, negative down */
    boost?: number
}

export class CompletionContext {
    // @internal
    abortListeners: (() => void)[] | null = []

    constructor(readonly state: EditorState,
                readonly pos: number,
                readonly explicit: boolean
    ) {}

    tokenBefore(types: readonly string[]) {
        let token: SyntaxNode | null = syntaxTree(this.state).resolveInner(this.pos, -1)
        while (token && types.indexOf(token.name) < 0) token = token.parent
        return token ? {from: token.from, to: this.pos,
            text: this.state.sliceDoc(token.from, this.pos),
            type: token.type} : null
    }

    /** @return Get the match of ythe given expression directly before the cursor */
    matchBefore(expr: RegExp) {
        let line = this.state.doc.lineAt(this.pos)
        let start = Math.max(line.from, this.pos - 250)
        let str = line.text.slice(start - line.from, this.pos - line.from)
        let found = str.search(ensureAnchor(expr, false))
        return found < 0 ? null : {from: start + found, to: this.pos, text: str.slice(found)}
    }

    get aborted() {
        return this.abortListeners == null
    }

    addEventListener(type: "abort", listener: () => void) {
        if (type == "abort" && this.abortListeners) this.abortListeners.push(listener)
    }
}

function toSet(chars: {[ch: string]: true}) {
    let flat = Object.keys(chars).join("")
    let words = /\w/.test(flat)
    if (words) flat = flat.replace(/\w/g, "")
    return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`
}

function prefixMatch(options: readonly Completion[]) {
    let first = Object.create(null), rest = Object.create(null)
    for (let {label} of options) {
        first[label[0]] = true
        for (let i = 1; i < label.length; i++) rest[label[i]] = true
    }
    let source = toSet(first) + toSet(rest) + "*$"
    return [new RegExp("^" + source), new RegExp(source)]
}

export function completeFromList(list: readonly (string | Completion)[]): CompletionSource {
    let options = list.map(o => typeof o == "string" ? {label: o} : o) as Completion[]
    let [validFor, match] = options.every(o => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options)
    return (context: CompletionContext) => {
        let token = context.matchBefore(match)
        return token || context.explicit ? {from: token ? token.from : context.pos, options, validFor} : null
    }
}

/** Wrap the given completion source so that it will only fire when the cursor is in a syntax node with on of the given names */
export function ifIn(nodes: readonly string[], source: CompletionSource): CompletionSource {
    return (context: CompletionContext) => {
        for (let pos: SyntaxNode | null = syntaxTree(context.state).resolveInner(context.pos, -1); pos; pos = pos.parent)
            if (nodes.indexOf(pos.name) > -1) return source(context)
        return null
    }
}

/**  Wrap the given completion source so that it will not fire when the cursor is in a syntax node with one of the given names. */
export function ifNotIn(nodes: readonly string[], source: CompletionSource): CompletionSource {
    return (context: CompletionContext) => {
        for (let pos: SyntaxNode | null = syntaxTree(context.state).resolveInner(context.pos, -1); pos; pos = pos.parent)
            if (nodes.indexOf(pos.name) > -1) return null
        return source(context)
    }
}

export type CompletionSource = (context: CompletionContext) => CompletionResult | null | Promise<CompletionResult | null>

export interface CompletionResult {
    from: number,
    to?: number,
    options: readonly Completion[],
    validFor?: RegExp | ((text: string, from: number, to: number, state: EditorState) => boolean),
    filter?: boolean,
    update?: (current: CompletionResult, from: number, to: number, context: CompletionContext) => CompletionResult | null
}

export class Option {
    constructor(readonly completion: Completion,
                readonly source: ActiveResult,
                readonly match: readonly number[]
    ) {}
}

export function cur(state: EditorState) { return state.selection.main.head }

export function ensureAnchor(expr: RegExp, start: boolean) {
    let {source} = expr
    let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$"
    if (!addStart && !addEnd) return expr
    return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`,
        expr.flags ?? (expr.ignoreCase ? "i" : ""))
}

export const pickedCompletion = Annotation.define<Completion>()

export function applyCompletion(view: EditorView, option: Option) {
    const apply = option.completion.apply || option.completion.label
    let result = option.source
    if (typeof apply == "string") {
        view.dispatch(view.state.changeByRange(range => {
            if (range == view.state.selection.main) return {
                changes: {from: result.from, to: result.to, insert: apply },
                range: EditorSelection.cursor(result.from + apply.length)
            }
            let len = result.to - result.from
            if (!range.empty ||
                len && view.state.sliceDoc(range.from - len, range.from) != view.state.sliceDoc(result.from, result.to))
                return {range}
            return {
                changes: {from: range.from - len, to: range.from, insert: apply},
                range: EditorSelection.cursor(range.from - len + apply.length)
            }
        }), {
            userEvent: "input.complete",
            annotations: pickedCompletion.of(option.completion)
        })
    } else {
        apply(view, option.completion, result.from, result.to)
    }
}

const SourceCache = new WeakMap<readonly (string | Completion)[], CompletionSource>()

export function asSource(source: CompletionSource | readonly (string | Completion)[]): CompletionSource {
    if (!Array.isArray(source)) return source as CompletionSource
    let known = SourceCache.get(source)
    if (!known) SourceCache.set(source, known = completeFromList(source))
    return known
}
