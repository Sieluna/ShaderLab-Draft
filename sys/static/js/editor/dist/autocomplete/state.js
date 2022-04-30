import { EditorView, showTooltip } from "../view/index.js";
import { StateField, StateEffect } from "../state/index.js";
import { Option, cur, asSource, ensureAnchor, CompletionContext } from "./completion.js";
import { FuzzyMatcher } from "./filter.js";
import { completionTooltip } from "./tooltip.js";
import { completionConfig } from "./config.js";
function score(option) {
    return (option.boost || 0) * 100 + (option.apply ? 10 : 0) + (option.info ? 5 : 0) +
        (option.type ? 1 : 0);
}
function sortOptions(active, state) {
    let options = [], i = 0;
    for (let a of active)
        if (a.hasResult()) {
            if (a.result.filter === false) {
                for (let option of a.result.options)
                    options.push(new Option(option, a, [1e9 - i++]));
            }
            else {
                let matcher = new FuzzyMatcher(state.sliceDoc(a.from, a.to)), match;
                for (let option of a.result.options)
                    if (match = matcher.match(option.label)) {
                        if (option.boost != null)
                            match[0] += option.boost;
                        options.push(new Option(option, a, match));
                    }
            }
        }
    let result = [], prev = null;
    for (let opt of options.sort(cmpOption)) {
        if (!prev || prev.label != opt.completion.label || prev.detail != opt.completion.detail ||
            (prev.type != null && opt.completion.type != null && prev.type != opt.completion.type) ||
            prev.apply != opt.completion.apply)
            result.push(opt);
        else if (score(opt.completion) > score(prev))
            result[result.length - 1] = opt;
        prev = opt.completion;
    }
    return result;
}
class CompletionDialog {
    constructor(options, attrs, tooltip, timestamp, selected) {
        this.options = options;
        this.attrs = attrs;
        this.tooltip = tooltip;
        this.timestamp = timestamp;
        this.selected = selected;
    }
    setSelected(selected, id) {
        return selected == this.selected || selected >= this.options.length ? this :
            new CompletionDialog(this.options, makeAttrs(id, selected), this.tooltip, this.timestamp, selected);
    }
    static build(active, state, id, prev, conf) {
        let options = sortOptions(active, state);
        if (!options.length)
            return null;
        let selected = 0;
        if (prev && prev.selected) {
            let selectedValue = prev.options[prev.selected].completion;
            for (let i = 0; i < options.length; i++)
                if (options[i].completion == selectedValue) {
                    selected = i;
                    break;
                }
        }
        return new CompletionDialog(options, makeAttrs(id, selected), {
            pos: active.reduce((a, b) => b.hasResult() ? Math.min(a, b.from) : a, 1e8),
            create: completionTooltip(completionState),
            above: conf.aboveCursor,
        }, prev ? prev.timestamp : Date.now(), selected);
    }
    map(changes) {
        return new CompletionDialog(this.options, this.attrs, Object.assign(Object.assign({}, this.tooltip), { pos: changes.mapPos(this.tooltip.pos) }), this.timestamp, this.selected);
    }
}
export class CompletionState {
    constructor(active, id, open) {
        this.active = active;
        this.id = id;
        this.open = open;
    }
    static start() {
        return new CompletionState(none, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
    }
    update(tr) {
        let { state } = tr, conf = state.facet(completionConfig);
        let sources = conf.override ||
            state.languageDataAt("autocomplete", cur(state)).map(asSource);
        let active = sources.map(source => {
            let value = this.active.find(s => s.source == source) ||
                new ActiveSource(source, this.active.some(a => a.state != 0) ? 1 : 0);
            return value.update(tr, conf);
        });
        if (active.length == this.active.length && active.every((a, i) => a == this.active[i]))
            active = this.active;
        let open = tr.selection || active.some(a => a.hasResult() && tr.changes.touchesRange(a.from, a.to)) ||
            !sameResults(active, this.active) ? CompletionDialog.build(active, state, this.id, this.open, conf)
            : this.open && tr.docChanged ? this.open.map(tr.changes) : this.open;
        if (!open && active.every(a => a.state != 1) && active.some(a => a.hasResult()))
            active = active.map(a => a.hasResult() ? new ActiveSource(a.source, 0) : a);
        for (let effect of tr.effects)
            if (effect.is(setSelectedEffect))
                open = open && open.setSelected(effect.value, this.id);
        return active == this.active && open == this.open ? this : new CompletionState(active, this.id, open);
    }
    get tooltip() { return this.open ? this.open.tooltip : null; }
    get attrs() { return this.open ? this.open.attrs : baseAttrs; }
}
function sameResults(a, b) {
    if (a == b)
        return true;
    for (let iA = 0, iB = 0;;) {
        while (iA < a.length && !a[iA].hasResult)
            iA++;
        while (iB < b.length && !b[iB].hasResult)
            iB++;
        let endA = iA == a.length, endB = iB == b.length;
        if (endA || endB)
            return endA == endB;
        if (a[iA++].result != b[iB++].result)
            return false;
    }
}
const baseAttrs = {
    "aria-autocomplete": "list"
};
function makeAttrs(id, selected) {
    return {
        "aria-autocomplete": "list",
        "aria-haspopup": "listbox",
        "aria-activedescendant": id + "-" + selected,
        "aria-controls": id
    };
}
const none = [];
function cmpOption(a, b) {
    let dScore = b.match[0] - a.match[0];
    if (dScore)
        return dScore;
    return a.completion.label.localeCompare(b.completion.label);
}
export var State;
(function (State) {
    State[State["Inactive"] = 0] = "Inactive";
    State[State["Pending"] = 1] = "Pending";
    State[State["Result"] = 2] = "Result";
})(State || (State = {}));
export function getUserEvent(tr) {
    return tr.isUserEvent("input.type") ? "input" : tr.isUserEvent("delete.backward") ? "delete" : null;
}
export class ActiveSource {
    constructor(source, state, explicitPos = -1) {
        this.source = source;
        this.state = state;
        this.explicitPos = explicitPos;
    }
    hasResult() { return false; }
    update(tr, conf) {
        let event = getUserEvent(tr), value = this;
        if (event)
            value = value.handleUserEvent(tr, event, conf);
        else if (tr.docChanged)
            value = value.handleChange(tr);
        else if (tr.selection && value.state != 0)
            value = new ActiveSource(value.source, 0);
        for (let effect of tr.effects) {
            if (effect.is(startCompletionEffect))
                value = new ActiveSource(value.source, 1, effect.value ? cur(tr.state) : -1);
            else if (effect.is(closeCompletionEffect))
                value = new ActiveSource(value.source, 0);
            else if (effect.is(setActiveEffect))
                for (let active of effect.value)
                    if (active.source == value.source)
                        value = active;
        }
        return value;
    }
    handleUserEvent(tr, type, conf) {
        return type == "delete" || !conf.activateOnTyping ? this.map(tr.changes) : new ActiveSource(this.source, 1);
    }
    handleChange(tr) {
        return tr.changes.touchesRange(cur(tr.startState)) ? new ActiveSource(this.source, 0) : this.map(tr.changes);
    }
    map(changes) {
        return changes.empty || this.explicitPos < 0 ? this : new ActiveSource(this.source, this.state, changes.mapPos(this.explicitPos));
    }
}
export class ActiveResult extends ActiveSource {
    constructor(source, explicitPos, result, from, to) {
        super(source, 2, explicitPos);
        this.result = result;
        this.from = from;
        this.to = to;
    }
    hasResult() { return true; }
    handleUserEvent(tr, type, conf) {
        var _a;
        let from = tr.changes.mapPos(this.from), to = tr.changes.mapPos(this.to, 1);
        let pos = cur(tr.state);
        if ((this.explicitPos < 0 ? pos <= from : pos < this.from) ||
            pos > to ||
            type == "delete" && cur(tr.startState) == this.from)
            return new ActiveSource(this.source, type == "input" && conf.activateOnTyping ? 1 : 0);
        let explicitPos = this.explicitPos < 0 ? -1 : tr.changes.mapPos(this.explicitPos), updated;
        if (checkValid(this.result.validFor, tr.state, from, to))
            return new ActiveResult(this.source, explicitPos, this.result, from, to);
        if (this.result.update &&
            (updated = this.result.update(this.result, from, to, new CompletionContext(tr.state, pos, explicitPos >= 0))))
            return new ActiveResult(this.source, explicitPos, updated, updated.from, (_a = updated.to) !== null && _a !== void 0 ? _a : cur(tr.state));
        return new ActiveSource(this.source, 1, explicitPos);
    }
    handleChange(tr) {
        return tr.changes.touchesRange(this.from, this.to) ? new ActiveSource(this.source, 0) : this.map(tr.changes);
    }
    map(mapping) {
        return mapping.empty ? this :
            new ActiveResult(this.source, this.explicitPos < 0 ? -1 : mapping.mapPos(this.explicitPos), this.result, mapping.mapPos(this.from), mapping.mapPos(this.to, 1));
    }
}
function checkValid(validFor, state, from, to) {
    if (!validFor)
        return false;
    let text = state.sliceDoc(from, to);
    return typeof validFor == "function" ? validFor(text, from, to, state) : ensureAnchor(validFor, true).test(text);
}
export const startCompletionEffect = StateEffect.define();
export const closeCompletionEffect = StateEffect.define();
export const setActiveEffect = StateEffect.define({
    map(sources, mapping) { return sources.map(s => s.map(mapping)); }
});
export const setSelectedEffect = StateEffect.define();
export const completionState = StateField.define({
    create() { return CompletionState.start(); },
    update(value, tr) { return value.update(tr); },
    provide: f => [
        showTooltip.from(f, val => val.tooltip),
        EditorView.contentAttributes.from(f, state => state.attrs)
    ]
});
