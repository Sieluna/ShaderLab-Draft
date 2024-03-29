import { Text } from "./text.js";
import { findClusterBreak } from "./char.js";
import { ChangeSet, DefaultSplit } from "./change.js";
import { EditorSelection, checkSelection } from "./selection.js";
import { resolveTransaction, asArray, StateEffect } from "./transaction.js";
import { allowMultipleSelections, changeFilter, transactionFilter, transactionExtender, lineSeparator, languageData, readOnly } from "./extension.js";
import { Configuration, Facet, StateField, ensureAddr, getAddr, Compartment } from "./facet.js";
import { CharCategory, makeCategorizer } from "./charcategory.js";
/**
 * The editor state class is a persistent (immutable) data structure. To update a state,
 * you [create]{@link EditorState.update} a [transaction]{@link Transaction}, which
 * produces a _new_ state instance, without modifying the original object.
 *
 * As such, _never_ mutate properties of a state directly. That'll just break things.
 */
export class EditorState {
    constructor(
    // @internal
    config, 
    /** The current document. */
    doc, 
    /** The current selection. */
    selection, 
    // @internal
    values, computeSlot, tr) {
        this.config = config;
        this.doc = doc;
        this.selection = selection;
        this.values = values;
        this.status = config.statusTemplate.slice();
        this.computeSlot = computeSlot;
        // Fill in the computed state immediately, so that further queries
        // for it made during the update return this state
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
    /**
     * Create a [transaction]{@link Transaction} that updates this state. Any number of
     * [transaction specs]{@link TransactionSpec} can be passed
     */
    update(...specs) {
        return resolveTransaction(this, specs, true);
    }
    // @internal
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
    /** Create a [transaction spec](#state.TransactionSpec) that replaces every selection range with the given content. */
    replaceSelection(text) {
        if (typeof text == "string")
            text = this.toText(text);
        return this.changeByRange(range => ({ changes: { from: range.from, to: range.to, insert: text },
            range: EditorSelection.cursor(range.from + text.length) }));
    }
    /**
     * Create a set of changes and a new selection by running the given function for each range
     * in the active selection. The function can return an optional set of changes (in the
     * coordinate space of the start document), plus an updated range (in the coordinate space of
     * the document produced by the call's own changes). This method will merge all the changes
     * and ranges into a single changeset and selection, and return it as a
     * [transaction spec]{@link TransactionSpec}, which can be passed to {@link update}.
     */
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
    /**
     * Create a [change set]{@link ChangeSet} from the given change description, taking the state's
     * document length and line separator into account.
     */
    changes(spec = []) {
        if (spec instanceof ChangeSet)
            return spec;
        return ChangeSet.of(spec, this.doc.length, this.facet(EditorState.lineSeparator));
    }
    /** Using the state's [line separator]{@link EditorState.lineSeparator}, create a {@link Text} instance from the given string. */
    toText(string) {
        return Text.of(string.split(this.facet(EditorState.lineSeparator) || DefaultSplit));
    }
    /** Return the given range of the document as a string. */
    sliceDoc(from = 0, to = this.doc.length) {
        return this.doc.sliceString(from, to, this.lineBreak);
    }
    /** Get the value of a state [facet]{@link Facet}. */
    facet(facet) {
        let addr = this.config.address[facet.id];
        if (addr == null)
            return facet.default;
        ensureAddr(this, addr);
        return getAddr(this, addr);
    }
    /**
     * Convert this state to a JSON-serializable object. When custom fields should be serialized,
     * you can pass them in as an object mapping property names (in the resulting object, which should
     * not use `doc` or `selection`) to fields.
     */
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
    /**
     * Deserialize a state from its JSON representation. When custom fields should be
     * deserialized, pass the same object you passed to {@link toJSON} when serializing as
     * third argument.
     */
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
    /**
     * Create a new state. You'll usually only need this when initializing an editor—updated states
     * are created by applying transactions.
     */
    static create(config = {}) {
        let configuration = Configuration.resolve(config.extensions || [], new Map);
        let doc = config.doc instanceof Text ? config.doc :
            Text.of((config.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit));
        let selection = !config.selection ? EditorSelection.single(0) :
            config.selection instanceof EditorSelection ? config.selection :
                EditorSelection.single(config.selection.anchor, config.selection.head);
        checkSelection(selection, doc.length);
        if (!configuration.staticFacet(allowMultipleSelections))
            selection = selection.asSingle();
        return new EditorState(configuration, doc, selection, configuration.dynamicSlots.map(() => null), (state, slot) => slot.create(state), null);
    }
    /** The size (in columns) of a tab in the document, determined by the {@link tabSize} facet. */
    get tabSize() { return this.facet(EditorState.tabSize); }
    /** Get the proper [line-break]{@link lineSeparator} string for this state. */
    get lineBreak() { return this.facet(EditorState.lineSeparator) || "\n"; }
    /** Returns true when the editor is [configured]{@link EditorState.readOnly} to be read-only. */
    get readOnly() { return this.facet(readOnly); }
    /**
     * Look up a translation for the given phrase (via the {@link phrases} facet), or return the
     * original string if no translation is found.
     */
    phrase(phrase) {
        for (let map of this.facet(EditorState.phrases))
            if (Object.prototype.hasOwnProperty.call(map, phrase))
                return map[phrase];
        return phrase;
    }
    /** Find the values for a given language data field, provided by the the [`languageData`](#state.EditorState^languageData) facet. */
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
    /**
     * Return a function that can categorize strings (expected to represent a single
     * [grapheme cluster]{@link findClusterBreak}) into one of:
     *  - Word (contains an alphanumeric character or a character explicitly listed
     *    in the local language's `"wordChars"` language data, which should be a string)
     *  - Space (contains only whitespace)
     *  - Other (anything else)
     */
    charCategorizer(at) {
        return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
    }
    /**
     * Find the word at the given position, meaning the range containing all [word]{@link CharCategory.Word}
     * characters around it. If no word characters are adjacent to the position, this returns null.
     */
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
/**
 * A facet that, when enabled, causes the editor to allow multiple ranges to be selected.
 * Be careful though, because by default the editor relies on the native DOM selection,
 * which cannot handle multiple selections. An extension like {@link drawSelection} can
 * be used to make secondary selections visible to the user.
 */
EditorState.allowMultipleSelections = allowMultipleSelections;
/**
 * Configures the tab size to use in this state. The first (highest-precedence) value of
 * the facet is used. If no value is given, this defaults to 4.
 */
EditorState.tabSize = Facet.define({
    combine: values => values.length ? values[0] : 4
});
/**
 * The line separator to use. By default, any of `"\n"`, `"\r\n"` and `"\r"` is treated
 * as a separator when splitting lines, and lines are joined with `"\n"`. When you
 * configure a value here, only that precise separator will be used, allowing you to
 * round-trip documents through the editor without normalizing line separators.
 */
EditorState.lineSeparator = lineSeparator;
/**
 * This facet controls the value of the {@link readOnly} getter, which is consulted by
 * commands and extensions that implement editing functionality to determine whether
 * they should apply. It defaults to false, but when its highest-precedence value is
 * `true`, such functionality disables itself.
 *
 * Not to be confused with {@link EditorView.editable}, which controls whether the editor's
 * DOM is set to be editable (and thus focusable).
 */
EditorState.readOnly = readOnly;
/**
 * Registers translation phrases. The {@link phrase} method will look through all objects
 * registered with this facet to find translations for its argument.
 */
EditorState.phrases = Facet.define({
    compare(a, b) {
        let kA = Object.keys(a), kB = Object.keys(b);
        return kA.length == kB.length && kA.every(k => a[k] == b[k]);
    }
});
/** A facet used to register [language data]{@link languageDataAt} providers. */
EditorState.languageData = languageData;
/**
 * Facet used to register change filters, which are called for each transaction (unless explicitly
 * [disabled]{@link TransactionSpec.filter}), and can suppress part of the transaction's changes.
 *
 * Such a function can return `true` to indicate that it doesn't want to do anything, `false` to
 * completely stop the changes in the transaction, or a set of ranges in which changes should be
 * suppressed. Such ranges are represented as an array of numbers, with each pair of two numbers
 * indicating the start and end of a range. So for example `[10, 20, 100, 110]` suppresses changes
 * between 10 and 20, and between 100 and 110.
 */
EditorState.changeFilter = changeFilter;
/**
 * Facet used to register a hook that gets a chance to update or replace transaction specs
 * before they are applied. This will only be applied for transactions that don't have
 * [`filter`]{@link TransactionSpec.filter} set to `false`. You can either return a single
 * transaction spec (possibly the input transaction), or an array of specs (which will be
 * combined in the same way as the arguments to {@link EditorState.update}).
 *
 * When possible, it is recommended to avoid accessing {@link Transaction.state} in a filter,
 * since it will force creation of a state that will then be discarded again, if the
 * transaction is actually filtered.
 */
EditorState.transactionFilter = transactionFilter;
/**
 * This is a more limited form of {@link transactionFilter}, which can only add
 * [annotations]{@link TransactionSpec.annotations} and [effects]{@link TransactionSpec.effects}.
 * _But_, this type of filter runs even if the transaction has disabled regular
 * [filtering]{@link TransactionSpec.filter}, making it suitable for effects that don't need to
 * touch the changes or selection, but do want to process every transaction.
 *
 * Extenders run _after_ filters, when both are present.
 */
EditorState.transactionExtender = transactionExtender;
Compartment.reconfigure = StateEffect.define();
