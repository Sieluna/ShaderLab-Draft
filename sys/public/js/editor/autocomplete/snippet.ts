import {Decoration, DecorationSet, WidgetType, EditorView, keymap, KeyBinding} from "../view/index"
import {StateField, StateEffect, ChangeDesc, EditorState, EditorSelection, Transaction, TransactionSpec,
        Text, StateCommand, Prec, Facet, MapMode} from "../state/index"
import {indentUnit} from "../language/index"
import {baseTheme} from "./theme"
import {Completion} from "./completion"

class FieldPos {
    constructor(public field: number,
                readonly line: number,
                readonly from: number,
                readonly to: number) {}
}

class FieldRange {
    constructor(readonly field: number, readonly from: number, readonly to: number) {}

    map(changes: ChangeDesc) {
        let from = changes.mapPos(this.from, -1, MapMode.TrackDel)
        let to = changes.mapPos(this.to, 1, MapMode.TrackDel)
        return from == null || to == null ? null : new FieldRange(this.field, from, to)
    }
}

class Snippet {
    constructor(readonly lines: readonly string[],
                readonly fieldPositions: readonly FieldPos[]) {}

    instantiate(state: EditorState, pos: number) {
        let text = [], lineStart = [pos]
        let lineObj = state.doc.lineAt(pos), baseIndent = /^\s*/.exec(lineObj.text)![0]
        for (let line of this.lines) {
            if (text.length) {
                let indent = baseIndent, tabs = /^\t*/.exec(line)![0].length
                for (let i = 0; i < tabs; i++) indent += state.facet(indentUnit)
                lineStart.push(pos + indent.length - tabs)
                line = indent + line.slice(tabs)
            }
            text.push(line)
            pos += line.length + 1
        }
        let ranges = this.fieldPositions.map(
            pos => new FieldRange(pos.field, lineStart[pos.line] + pos.from, lineStart[pos.line] + pos.to))
        return {text, ranges}
    }

    static parse(template: string) {
        let fields: {seq: number | null, name: string}[] = []
        let lines = [], positions = [], m
        for (let line of template.split(/\r\n?|\n/)) {
            while (m = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(line)) {
                let seq = m[1] ? +m[1] : null, name = m[2] || m[3] || "", found = -1
                for (let i = 0; i < fields.length; i++) {
                    if (seq != null ? fields[i].seq == seq : name ? fields[i].name == name : false) found = i
                }
                if (found < 0) {
                    let i = 0
                    while (i < fields.length && (seq == null || (fields[i].seq != null && fields[i].seq! < seq))) i++
                    fields.splice(i, 0, {seq, name})
                    found = i
                    for (let pos of positions) if (pos.field >= found) pos.field++
                }
                positions.push(new FieldPos(found, lines.length, m.index, m.index + name.length))
                line = line.slice(0, m.index) + name + line.slice(m.index + m[0].length)
            }
            lines.push(line)
        }
        return new Snippet(lines, positions)
    }
}

let fieldMarker = Decoration.widget({widget: new class extends WidgetType {
        toDOM() {
            let span = document.createElement("span")
            span.className = "cm-snippetFieldPosition"
            return span
        }
        ignoreEvent() { return false }
    }})
let fieldRange = Decoration.mark({class: "cm-snippetField"})

class ActiveSnippet {
    deco: DecorationSet

    constructor(readonly ranges: readonly FieldRange[], readonly active: number) {
        this.deco = Decoration.set(ranges.map(r => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to)))
    }

    map(changes: ChangeDesc) {
        let ranges = []
        for (let r of this.ranges) {
            let mapped = r.map(changes)
            if (!mapped) return null
            ranges.push(mapped)
        }
        return new ActiveSnippet(ranges, this.active)
    }

    selectionInsideField(sel: EditorSelection) {
        return sel.ranges.every(
            range => this.ranges.some(r => r.field == this.active && r.from <= range.from && r.to >= range.to))
    }
}

const setActive = StateEffect.define<ActiveSnippet | null>({
    map(value, changes) { return value && value.map(changes) }
})

const moveToField = StateEffect.define<number>()

const snippetState = StateField.define<ActiveSnippet | null>({
    create() { return null },

    update(value, tr) {
        for (let effect of tr.effects) {
            if (effect.is(setActive)) return effect.value
            if (effect.is(moveToField) && value) return new ActiveSnippet(value.ranges, effect.value)
        }
        if (value && tr.docChanged) value = value.map(tr.changes)
        if (value && tr.selection && !value.selectionInsideField(tr.selection)) value = null
        return value
    },

    provide: f => EditorView.decorations.from(f, val => val ? val.deco : Decoration.none)
})

function fieldSelection(ranges: readonly FieldRange[], field: number) {
    return EditorSelection.create(ranges.filter(r => r.field == field).map(r => EditorSelection.range(r.from, r.to)))
}

/**
 *  Convert a snippet template to a function that can [apply]{@link Completion.apply} it.
 *  Snippets are written using syntax like this:
 *  @example
 *    "for (let ${index} = 0; ${index} < ${end}; ${index}++) {\n\t${}\n}"
 */
export function snippet(template: string) {
    let snippet = Snippet.parse(template)
    return (editor: {state: EditorState, dispatch: (tr: Transaction) => void}, _completion: Completion, from: number, to: number) => {
        let {text, ranges} = snippet.instantiate(editor.state, from)
        let spec: TransactionSpec = {changes: {from, to, insert: Text.of(text)}}
        if (ranges.length) spec.selection = fieldSelection(ranges, 0)
        if (ranges.length > 1) {
            let active = new ActiveSnippet(ranges, 0)
            let effects: StateEffect<unknown>[] = spec.effects = [setActive.of(active)]
            if (editor.state.field(snippetState, false) === undefined)
                effects.push(StateEffect.appendConfig.of([snippetState, addSnippetKeymap, snippetPointerHandler, baseTheme]))
        }
        editor.dispatch(editor.state.update(spec))
    }
}

function moveField(dir: 1 | -1): StateCommand {
    return ({state, dispatch}) => {
        let active = state.field(snippetState, false)
        if (!active || dir < 0 && active.active == 0) return false
        let next = active.active + dir, last = dir > 0 && !active.ranges.some(r => r.field == next + dir)
        dispatch(state.update({
            selection: fieldSelection(active.ranges, next),
            effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next))
        }))
        return true
    }
}

/** A command that clears the active snippet, if any. */
export const clearSnippet: StateCommand = ({state, dispatch}) => {
    let active = state.field(snippetState, false)
    if (!active) return false
    dispatch(state.update({effects: setActive.of(null)}))
    return true
}

/** Move to the next snippet field, if available. */
export const nextSnippetField = moveField(1)

/** Move to the previous snippet field, if available. */
export const prevSnippetField = moveField(-1)

const defaultSnippetKeymap = [
    { key: "Tab", run: nextSnippetField, shift: prevSnippetField },
    { key: "Escape", run: clearSnippet }
]

/** A facet that can be used to configure the key bindings used by snippets. */
export const snippetKeymap = Facet.define<readonly KeyBinding[], readonly KeyBinding[]>({
    combine(maps) { return maps.length ? maps[0] : defaultSnippetKeymap }
})

const addSnippetKeymap = Prec.highest(keymap.compute([snippetKeymap], state => state.facet(snippetKeymap)))

/** Create a completion from a snippet. */
export function snippetCompletion(template: string, completion: Completion): Completion {
    return {...completion, apply: snippet(template)}
}

const snippetPointerHandler = EditorView.domEventHandlers({
    mousedown(event, view) {
        let active = view.state.field(snippetState, false), pos: number | null
        if (!active || (pos = view.posAtCoords({x: event.clientX, y: event.clientY})) == null) return false
        let match = active.ranges.find(r => r.from <= pos! && r.to >= pos!)
        if (!match || match.field == active.active) return false
        view.dispatch({
            selection: fieldSelection(active.ranges, match.field),
            effects: setActive.of(active.ranges.some(r => r.field > match!.field) ? new ActiveSnippet(active.ranges, match.field) : null)
        })
        return true
    }
})
