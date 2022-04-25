import { Text } from "./text.js";
import { findClusterBreak } from "./char.js";
import { ChangeSet, DefaultSplit } from "./change.js";
import { EditorSelection, checkSelection } from "./selection.js";
import { resolveTransaction, asArray, StateEffect } from "./transaction.js";
import { allowMultipleSelections, changeFilter, transactionFilter, transactionExtender, lineSeparator, languageData, readOnly } from "./extension.js";
import { Configuration, Facet, StateField, ensureAddr, getAddr, Compartment } from "./facet.js";
import { CharCategory, makeCategorizer } from "./charcategory.js";
export class EditorState {
    constructor(config, doc, selection, values, computeSlot, tr) {
        this.config = config;
        this.doc = doc;
        this.selection = selection;
        this.values = values;
        this.status = config.statusTemplate.slice();
        this.computeSlot = computeSlot;
        if (tr)
            tr._state = this;
        for (let i = 0; i < this.config.dynamicSlots.length; i++)
            ensureAddr(this, i << 1);
        this.computeSlot = null;
    }
    field(field, require = true) {
        let addr = this.config.address[field.id];
        if (addr == null) {
            if (require)
                throw new RangeError("Field is not present in this state");
            return undefined;
        }
        ensureAddr(this, addr);
        return getAddr(this, addr);
    }
    update(...specs) {
        return resolveTransaction(this, specs, true);
    }
    applyTransaction(tr) {
        let conf = this.config, { base, compartments } = conf;
        for (let effect of tr.effects) {
            if (effect.is(Compartment.reconfigure)) {
                if (conf) {
                    compartments = new Map;
                    conf.compartments.forEach((val, key) => compartments.set(key, val));
                    conf = null;
                }
                compartments.set(effect.value.compartment, effect.value.extension);
                this;
            }
            else if (effect.is(StateEffect.reconfigure)) {
                conf = null;
                base = effect.value;
            }
            else if (effect.is(StateEffect.appendConfig)) {
                conf = null;
                base = asArray(base).concat(effect.value);
            }
        }
        let startValues;
        if (!conf) {
            conf = Configuration.resolve(base, compartments, this);
            let intermediateState = new EditorState(conf, this.doc, this.selection, conf.dynamicSlots.map(() => null), (state, slot) => slot.reconfigure(state, this), null);
            startValues = intermediateState.values;
        }
        else {
            startValues = tr.startState.values.slice();
        }
        new EditorState(conf, tr.newDoc, tr.newSelection, startValues, (state, slot) => slot.update(state, tr), tr);
    }
    replaceSelection(text) {
        if (typeof text == "string")
            text = this.toText(text);
        return this.changeByRange(range => ({ changes: { from: range.from, to: range.to, insert: text },
            range: EditorSelection.cursor(range.from + text.length) }));
    }
    changeByRange(f) {
        let sel = this.selection;
        let result1 = f(sel.ranges[0]);
        let changes = this.changes(result1.changes), ranges = [result1.range];
        let effects = asArray(result1.effects);
        for (let i = 1; i < sel.ranges.length; i++) {
            let result = f(sel.ranges[i]);
            let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
            for (let j = 0; j < i; j++)
                ranges[j] = ranges[j].map(newMapped);
            let mapBy = changes.mapDesc(newChanges, true);
            ranges.push(result.range.map(mapBy));
            changes = changes.compose(newMapped);
            effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray(result.effects), mapBy));
        }
        return {
            changes,
            selection: EditorSelection.create(ranges, sel.mainIndex),
            effects
        };
    }
    changes(spec = []) {
        if (spec instanceof ChangeSet)
            return spec;
        return ChangeSet.of(spec, this.doc.length, this.facet(EditorState.lineSeparator));
    }
    toText(string) {
        return Text.of(string.split(this.facet(EditorState.lineSeparator) || DefaultSplit));
    }
    sliceDoc(from = 0, to = this.doc.length) {
        return this.doc.sliceString(from, to, this.lineBreak);
    }
    facet(facet) {
        let addr = this.config.address[facet.id];
        if (addr == null)
            return facet.default;
        ensureAddr(this, addr);
        return getAddr(this, addr);
    }
    toJSON(fields) {
        let result = {
            doc: this.sliceDoc(),
            selection: this.selection.toJSON()
        };
        if (fields)
            for (let prop in fields) {
                let value = fields[prop];
                if (value instanceof StateField)
                    result[prop] = value.spec.toJSON(this.field(fields[prop]), this);
            }
        return result;
    }
    static fromJSON(json, config = {}, fields) {
        if (!json || typeof json.doc != "string")
            throw new RangeError("Invalid JSON representation for EditorState");
        let fieldInit = [];
        if (fields)
            for (let prop in fields) {
                let field = fields[prop], value = json[prop];
                fieldInit.push(field.init(state => field.spec.fromJSON(value, state)));
            }
        return EditorState.create({
            doc: json.doc,
            selection: EditorSelection.fromJSON(json.selection),
            extensions: config.extensions ? fieldInit.concat([config.extensions]) : fieldInit
        });
    }
    static create(config = {}) {
        let configuration = Configuration.resolve(config.extensions || [], new Map);
        let doc = config.doc instanceof Text ? config.doc
            : Text.of((config.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit));
        let selection = !config.selection ? EditorSelection.single(0)
            : config.selection instanceof EditorSelection ? config.selection
                : EditorSelection.single(config.selection.anchor, config.selection.head);
        checkSelection(selection, doc.length);
        if (!configuration.staticFacet(allowMultipleSelections))
            selection = selection.asSingle();
        return new EditorState(configuration, doc, selection, configuration.dynamicSlots.map(() => null), (state, slot) => slot.create(state), null);
    }
    get tabSize() { return this.facet(EditorState.tabSize); }
    get lineBreak() { return this.facet(EditorState.lineSeparator) || "\n"; }
    get readOnly() { return this.facet(readOnly); }
    phrase(phrase) {
        for (let map of this.facet(EditorState.phrases))
            if (Object.prototype.hasOwnProperty.call(map, phrase))
                return map[phrase];
        return phrase;
    }
    languageDataAt(name, pos, side = -1) {
        let values = [];
        for (let provider of this.facet(languageData)) {
            for (let result of provider(this, pos, side)) {
                if (Object.prototype.hasOwnProperty.call(result, name))
                    values.push(result[name]);
            }
        }
        return values;
    }
    charCategorizer(at) {
        return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
    }
    wordAt(pos) {
        let { text, from, length } = this.doc.lineAt(pos);
        let cat = this.charCategorizer(pos);
        let start = pos - from, end = pos - from;
        while (start > 0) {
            let prev = findClusterBreak(text, start, false);
            if (cat(text.slice(prev, start)) != CharCategory.Word)
                break;
            start = prev;
        }
        while (end < length) {
            let next = findClusterBreak(text, end);
            if (cat(text.slice(end, next)) != CharCategory.Word)
                break;
            end = next;
        }
        return start == end ? null : EditorSelection.range(start + from, end + from);
    }
}
EditorState.allowMultipleSelections = allowMultipleSelections;
EditorState.tabSize = Facet.define({
    combine: values => values.length ? values[0] : 4
});
EditorState.lineSeparator = lineSeparator;
EditorState.readOnly = readOnly;
EditorState.phrases = Facet.define({
    compare(a, b) {
        let kA = Object.keys(a), kB = Object.keys(b);
        return kA.length == kB.length && kA.every(k => a[k] == b[k]);
    }
});
EditorState.languageData = languageData;
EditorState.changeFilter = changeFilter;
EditorState.transactionFilter = transactionFilter;
EditorState.transactionExtender = transactionExtender;
Compartment.reconfigure = StateEffect.define();
