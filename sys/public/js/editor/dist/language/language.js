var _a;
import { Tree, TreeFragment, NodeProp, NodeType, Parser, IterMode } from "../lezer/common/index.js";
import { EditorState, StateField, StateEffect, Facet } from "../state/index.js";
import { ViewPlugin, logException } from "../view/index.js";
/** Node prop stored in a parser's top syntax node to provide the facet that stores language-specific data for that language. */
export const languageDataProp = new NodeProp();
/**
 * Helper function to define a facet (to be added to the top syntax node(s) for a language via
 * {@link languageDataProp}), that will be used to associate language data with the language.
 * You probably only need this when subclassing {@link Language}.
 */
export function defineLanguageFacet(baseData) {
    return Facet.define({
        combine: baseData ? values => values.concat(baseData) : undefined
    });
}
/**
 * A language object manages parsing and per-language [metadata]{@link languageDataAt}.
 * Parse data is managed as a [Lezer](https://lezer.codemirror.net) tree. The class
 * can be used directly, via the {@link LRLanguage} subclass for
 * [Lezer](https://lezer.codemirror.net/) LR parsers, or via the {@link StreamLanguage}
 * subclass for stream parsers.
 */
export class Language {
    /**
     * Construct a language object. If you need to invoke this directly, first define a data
     * facet with {@link defineLanguageFacet}, and then configure your parser to
     * [attach]{@link languageDataProp} it to the language's outer syntax node.
     * @param data The [language data]{@link languageDataAt} facet used for this language.
     * @param parser
     * @param extraExtensions
     */
    constructor(data, parser, extraExtensions = []) {
        this.data = data;
        // Kludge to define EditorState.tree as a debugging helper,
        // without the EditorState package actually knowing about
        // languages and lezer trees.
        if (!EditorState.prototype.hasOwnProperty("tree"))
            Object.defineProperty(EditorState.prototype, "tree", { get() { return syntaxTree(this); } });
        this.parser = parser;
        this.extension = [
            language.of(this),
            EditorState.languageData.of((state, pos, side) => state.facet(languageDataFacetAt(state, pos, side)))
        ].concat(extraExtensions);
    }
    /** Query whether this language is active at the given position. */
    isActiveAt(state, pos, side = -1) {
        return languageDataFacetAt(state, pos, side) == this.data;
    }
    /**
     * Find the document regions that were parsed using this language.
     * The returned regions will _include_ any nested languages rooted
     * in this language, when those exist.
     */
    findRegions(state) {
        let lang = state.facet(language);
        if ((lang === null || lang === void 0 ? void 0 : lang.data) == this.data)
            return [{ from: 0, to: state.doc.length }];
        if (!lang || !lang.allowsNesting)
            return [];
        let result = [];
        let explore = (tree, from) => {
            if (tree.prop(languageDataProp) == this.data) {
                result.push({ from, to: from + tree.length });
                return;
            }
            let mount = tree.prop(NodeProp.mounted);
            if (mount) {
                if (mount.tree.prop(languageDataProp) == this.data) {
                    if (mount.overlay)
                        for (let r of mount.overlay)
                            result.push({ from: r.from + from, to: r.to + from });
                    else
                        result.push({ from: from, to: from + tree.length });
                    return;
                }
                else if (mount.overlay) {
                    let size = result.length;
                    explore(mount.tree, mount.overlay[0].from + from);
                    if (result.length > size)
                        return;
                }
            }
            for (let i = 0; i < tree.children.length; i++) {
                let ch = tree.children[i];
                if (ch instanceof Tree)
                    explore(ch, tree.positions[i] + from);
            }
        };
        explore(syntaxTree(state), 0);
        return result;
    }
    /** Indicates whether this language allows nested languages. The default implementation returns true. */
    get allowsNesting() { return true; }
}
// @internal
Language.setState = StateEffect.define();
function languageDataFacetAt(state, pos, side) {
    let topLang = state.facet(language);
    if (!topLang)
        return null;
    let facet = topLang.data;
    if (topLang.allowsNesting) {
        for (let node = syntaxTree(state).topNode; node; node = node.enter(pos, side, IterMode.ExcludeBuffers))
            facet = node.type.prop(languageDataProp) || facet;
    }
    return facet;
}
/** A subclass of {@link Language} for use with Lezer [LR parsers](https://lezer.codemirror.net/docs/ref#lr.LRParser) parsers. */
export class LRLanguage extends Language {
    constructor(data, parser) {
        super(data, parser);
        this.parser = parser;
    }
    /** Define a language from a parser. */
    static define(spec) {
        let data = defineLanguageFacet(spec.languageData);
        return new LRLanguage(data, spec.parser.configure({
            props: [languageDataProp.add(type => type.isTop ? data : undefined)]
        }));
    }
    /** Create a new instance of this language with a reconfigured version of its parser. */
    configure(options) {
        return new LRLanguage(this.data, this.parser.configure(options));
    }
    get allowsNesting() { return this.parser.hasWrappers(); }
}
/**
 * Get the syntax tree for a state, which is the current (possibly incomplete) parse tree of the
 * active [language]{@link Language}, or the empty tree if there is no language available.
 */
export function syntaxTree(state) {
    let field = state.field(Language.state, false);
    return field ? field.tree : Tree.empty;
}
/**
 * Try to get a parse tree that spans at least up to `upto`. The method will do at most `timeout`
 * milliseconds of work to parse up to that point if the tree isn't already available.
 */
export function ensureSyntaxTree(state, upto, timeout = 50) {
    var _a;
    let parse = (_a = state.field(Language.state, false)) === null || _a === void 0 ? void 0 : _a.context;
    return !parse ? null : parse.isDone(upto) || parse.work(timeout, upto) ? parse.tree : null;
}
/**
 * Queries whether there is a full syntax tree available up to the given document position.
 * If there isn't, the background parse process _might_ still be working and update the tree
 * further, but there is no guarantee of that—the parser will [stop working]{@link syntaxParserRunning}
 * when it has spent a certain amount of time or has moved beyond the visible viewport.
 * Always returns false if no language has been enabled.
 */
export function syntaxTreeAvailable(state, upto = state.doc.length) {
    var _a;
    return ((_a = state.field(Language.state, false)) === null || _a === void 0 ? void 0 : _a.context.isDone(upto)) || false;
}
/**
 * Move parsing forward, and update the editor state afterwards to reflect the new tree.
 * Will work for at most `timeout` milliseconds. Returns true if the parser managed get
 * to the given position in that time.
 */
export function forceParsing(view, upto = view.viewport.to, timeout = 100) {
    let success = ensureSyntaxTree(view.state, upto, timeout);
    if (success != syntaxTree(view.state))
        view.dispatch({});
    return !!success;
}
/**
 * Tells you whether the language parser is planning to do more parsing work (in a
 * `requestIdleCallback` pseudo-thread) or has stopped running, either because it
 * parsed the entire document, because it spent too much time and was cut off, or
 * because there is no language parser enabled.
 */
export function syntaxParserRunning(view) {
    var _a;
    return ((_a = view.plugin(parseWorker)) === null || _a === void 0 ? void 0 : _a.isWorking()) || false;
}
// Lezer-style Input object for a Text document.
class DocInput {
    constructor(doc, length = doc.length) {
        this.doc = doc;
        this.length = length;
        this.cursorPos = 0;
        this.string = "";
        this.cursor = doc.iter();
    }
    syncTo(pos) {
        this.string = this.cursor.next(pos - this.cursorPos).value;
        this.cursorPos = pos + this.string.length;
        return this.cursorPos - this.string.length;
    }
    chunk(pos) {
        this.syncTo(pos);
        return this.string;
    }
    get lineChunks() { return true; }
    read(from, to) {
        let stringStart = this.cursorPos - this.string.length;
        if (from < stringStart || to >= this.cursorPos)
            return this.doc.sliceString(from, to);
        else
            return this.string.slice(from - stringStart, to - stringStart);
    }
}
let currentContext = null;
/** A parse context provided to parsers working on the editor content. */
export class ParseContext {
    constructor(parser, 
    /** The current editor state. */
    state, 
    /** Tree fragments that can be reused by incremental re-parses. */
    fragments = [], 
    // @internal
    tree, 
    // @internal
    treeLen, 
    /**
     * The current editor viewport (or some overapproximation thereof). Intended to be used
     * for opportunistically avoiding work (in which case {@link skipUntilInView} should be
     * called to make sure the parser is restarted when the skipped region becomes visible).
     */
    viewport, 
    // @internal
    skipped, 
    /**
     * This is where skipping parsers can register a promise that, when resolved, will
     * schedule a new parse. It is cleared when the parse worker picks up the promise.
     */
    scheduleOn) {
        this.parser = parser;
        this.state = state;
        this.fragments = fragments;
        this.tree = tree;
        this.treeLen = treeLen;
        this.viewport = viewport;
        this.skipped = skipped;
        this.scheduleOn = scheduleOn;
        this.parse = null;
        // @internal
        this.tempSkipped = [];
    }
    // @internal
    static create(parser, state, viewport) {
        return new ParseContext(parser, state, [], Tree.empty, 0, viewport, [], null);
    }
    startParse() {
        return this.parser.startParse(new DocInput(this.state.doc), this.fragments);
    }
    // @internal
    work(until, upto) {
        if (upto != null && upto >= this.state.doc.length)
            upto = undefined;
        if (this.tree != Tree.empty && this.isDone(upto !== null && upto !== void 0 ? upto : this.state.doc.length)) {
            this.takeTree();
            return true;
        }
        return this.withContext(() => {
            var _a;
            if (typeof until == "number") {
                let endTime = Date.now() + until;
                until = () => Date.now() > endTime;
            }
            if (!this.parse)
                this.parse = this.startParse();
            if (upto != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > upto) &&
                upto < this.state.doc.length)
                this.parse.stopAt(upto);
            for (;;) {
                let done = this.parse.advance();
                if (done) {
                    this.fragments = this.withoutTempSkipped(TreeFragment.addTree(done, this.fragments, this.parse.stoppedAt != null));
                    this.treeLen = (_a = this.parse.stoppedAt) !== null && _a !== void 0 ? _a : this.state.doc.length;
                    this.tree = done;
                    this.parse = null;
                    if (this.treeLen < (upto !== null && upto !== void 0 ? upto : this.state.doc.length))
                        this.parse = this.startParse();
                    else
                        return true;
                }
                if (until())
                    return false;
            }
        });
    }
    // @internal
    takeTree() {
        let pos, tree;
        if (this.parse && (pos = this.parse.parsedPos) >= this.treeLen) {
            if (this.parse.stoppedAt == null || this.parse.stoppedAt > pos)
                this.parse.stopAt(pos);
            this.withContext(() => { while (!(tree = this.parse.advance())) { } });
            this.treeLen = pos;
            this.tree = tree;
            this.fragments = this.withoutTempSkipped(TreeFragment.addTree(this.tree, this.fragments, true));
            this.parse = null;
        }
    }
    withContext(f) {
        let prev = currentContext;
        currentContext = this;
        try {
            return f();
        }
        finally {
            currentContext = prev;
        }
    }
    withoutTempSkipped(fragments) {
        for (let r; r = this.tempSkipped.pop();)
            fragments = cutFragments(fragments, r.from, r.to);
        return fragments;
    }
    // @internal
    changes(changes, newState) {
        let { fragments, tree, treeLen, viewport, skipped } = this;
        this.takeTree();
        if (!changes.empty) {
            let ranges = [];
            changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
            fragments = TreeFragment.applyChanges(fragments, ranges);
            tree = Tree.empty;
            treeLen = 0;
            viewport = { from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1) };
            if (this.skipped.length) {
                skipped = [];
                for (let r of this.skipped) {
                    let from = changes.mapPos(r.from, 1), to = changes.mapPos(r.to, -1);
                    if (from < to)
                        skipped.push({ from, to });
                }
            }
        }
        return new ParseContext(this.parser, newState, fragments, tree, treeLen, viewport, skipped, this.scheduleOn);
    }
    // @internal
    updateViewport(viewport) {
        if (this.viewport.from == viewport.from && this.viewport.to == viewport.to)
            return false;
        this.viewport = viewport;
        let startLen = this.skipped.length;
        for (let i = 0; i < this.skipped.length; i++) {
            let { from, to } = this.skipped[i];
            if (from < viewport.to && to > viewport.from) {
                this.fragments = cutFragments(this.fragments, from, to);
                this.skipped.splice(i--, 1);
            }
        }
        if (this.skipped.length >= startLen)
            return false;
        this.reset();
        return true;
    }
    // @internal
    reset() {
        if (this.parse) {
            this.takeTree();
            this.parse = null;
        }
    }
    /**
     * Notify the parse scheduler that the given region was skipped because it wasn't in view,
     * and the parse should be restarted when it comes into view.
     */
    skipUntilInView(from, to) {
        this.skipped.push({ from, to });
    }
    /**
     * Returns a parser intended to be used as placeholder when asynchronously loading a nested
     * parser. It'll skip its input and mark it as not-really-parsed, so that the next update
     * will parse it again.
     * @param until a reparse will be scheduled when the promise resolves.
     */
    static getSkippingParser(until) {
        return new class extends Parser {
            createParse(input, fragments, ranges) {
                let from = ranges[0].from, to = ranges[ranges.length - 1].to;
                let parser = {
                    parsedPos: from,
                    advance() {
                        let cx = currentContext;
                        if (cx) {
                            for (let r of ranges)
                                cx.tempSkipped.push(r);
                            if (until)
                                cx.scheduleOn = cx.scheduleOn ? Promise.all([cx.scheduleOn, until]) : until;
                        }
                        this.parsedPos = to;
                        return new Tree(NodeType.none, [], [], to - from);
                    },
                    stoppedAt: null,
                    stopAt() { }
                };
                return parser;
            }
        };
    }
    // @internal
    isDone(upto) {
        upto = Math.min(upto, this.state.doc.length);
        let frags = this.fragments;
        return this.treeLen >= upto && frags.length && frags[0].from == 0 && frags[0].to >= upto;
    }
    /** Get the context for the current parse, or `null` if no editor parse is in progress. */
    static get() { return currentContext; }
}
function cutFragments(fragments, from, to) {
    return TreeFragment.applyChanges(fragments, [{ fromA: from, toA: to, fromB: from, toB: to }]);
}
class LanguageState {
    constructor(
    // A mutable parse state that is used to preserve work done during
    // the lifetime of a state when moving to the next state.
    context) {
        this.context = context;
        this.tree = context.tree;
    }
    apply(tr) {
        if (!tr.docChanged && this.tree == this.context.tree)
            return this;
        let newCx = this.context.changes(tr.changes, tr.state);
        // If the previous parse wasn't done, go forward only up to its
        // end position or the end of the viewport, to avoid slowing down
        // state updates with parse work beyond the viewport.
        let upto = this.context.treeLen == tr.startState.doc.length ? undefined
            : Math.max(tr.changes.mapPos(this.context.treeLen), newCx.viewport.to);
        if (!newCx.work(20 /* Apply */, upto))
            newCx.takeTree();
        return new LanguageState(newCx);
    }
    static init(state) {
        let vpTo = Math.min(3000 /* InitViewport */, state.doc.length);
        let parseState = ParseContext.create(state.facet(language).parser, state, { from: 0, to: vpTo });
        if (!parseState.work(20 /* Apply */, vpTo))
            parseState.takeTree();
        return new LanguageState(parseState);
    }
}
Language.state = StateField.define({
    create: LanguageState.init,
    update(value, tr) {
        for (let e of tr.effects)
            if (e.is(Language.setState))
                return e.value;
        if (tr.startState.facet(language) != tr.state.facet(language))
            return LanguageState.init(tr.state);
        return value.apply(tr);
    }
});
let requestIdle = (callback) => {
    let timeout = setTimeout(() => callback(), 500 /* MaxPause */);
    return () => clearTimeout(timeout);
};
if (typeof requestIdleCallback != "undefined")
    requestIdle = (callback) => {
        let idle = -1, timeout = setTimeout(() => {
            idle = requestIdleCallback(callback, { timeout: 500 /* MaxPause */ - 100 /* MinPause */ });
        }, 100 /* MinPause */);
        return () => idle < 0 ? clearTimeout(timeout) : cancelIdleCallback(idle);
    };
const isInputPending = typeof navigator != "undefined" && ((_a = navigator.scheduling) === null || _a === void 0 ? void 0 : _a.isInputPending)
    ? () => navigator.scheduling.isInputPending() : null;
const parseWorker = ViewPlugin.fromClass(class ParseWorker {
    constructor(view) {
        this.view = view;
        this.working = null;
        this.workScheduled = 0;
        // End of the current time chunk
        this.chunkEnd = -1;
        // Milliseconds of budget left for this chunk
        this.chunkBudget = -1;
        this.work = this.work.bind(this);
        this.scheduleWork();
    }
    update(update) {
        let cx = this.view.state.field(Language.state).context;
        if (cx.updateViewport(update.view.viewport) || this.view.viewport.to > cx.treeLen)
            this.scheduleWork();
        if (update.docChanged) {
            if (this.view.hasFocus)
                this.chunkBudget += 50 /* ChangeBonus */;
            this.scheduleWork();
        }
        this.checkAsyncSchedule(cx);
    }
    scheduleWork() {
        if (this.working)
            return;
        let { state } = this.view, field = state.field(Language.state);
        if (field.tree != field.context.tree || !field.context.isDone(state.doc.length))
            this.working = requestIdle(this.work);
    }
    work(deadline) {
        this.working = null;
        let now = Date.now();
        if (this.chunkEnd < now && (this.chunkEnd < 0 || this.view.hasFocus)) { // Start a new chunk
            this.chunkEnd = now + 30000 /* ChunkTime */;
            this.chunkBudget = 3000 /* ChunkBudget */;
        }
        if (this.chunkBudget <= 0)
            return; // No more budget
        let { state, viewport: { to: vpTo } } = this.view, field = state.field(Language.state);
        if (field.tree == field.context.tree && field.context.isDone(vpTo + 100000 /* MaxParseAhead */))
            return;
        let endTime = Date.now() + Math.min(this.chunkBudget, 100 /* Slice */, deadline && !isInputPending ? Math.max(25 /* MinSlice */, deadline.timeRemaining() - 5) : 1e9);
        let viewportFirst = field.context.treeLen < vpTo && state.doc.length > vpTo + 1000;
        let done = field.context.work(() => {
            return isInputPending && isInputPending() || Date.now() > endTime;
        }, vpTo + (viewportFirst ? 0 : 100000 /* MaxParseAhead */));
        this.chunkBudget -= Date.now() - now;
        if (done || this.chunkBudget <= 0) {
            field.context.takeTree();
            this.view.dispatch({ effects: Language.setState.of(new LanguageState(field.context)) });
        }
        if (this.chunkBudget > 0 && !(done && !viewportFirst))
            this.scheduleWork();
        this.checkAsyncSchedule(field.context);
    }
    checkAsyncSchedule(cx) {
        if (cx.scheduleOn) {
            this.workScheduled++;
            cx.scheduleOn
                .then(() => this.scheduleWork())
                .catch(err => logException(this.view.state, err))
                .then(() => this.workScheduled--);
            cx.scheduleOn = null;
        }
    }
    destroy() {
        if (this.working)
            this.working();
    }
    isWorking() {
        return !!(this.working || this.workScheduled > 0);
    }
}, {
    eventHandlers: { focus() { this.scheduleWork(); } }
});
/** The facet used to associate a language with an editor state. */
export const language = Facet.define({
    combine(languages) { return languages.length ? languages[0] : null; },
    enables: [Language.state, parseWorker]
});
/**
 * This class bundles a {@link language} with an optional set of supporting extensions.
 * Language packages are encouraged to export a function that optionally takes a
 * configuration object and returns a `LanguageSupport` instance, as the main way for
 * client code to use the package.
 */
export class LanguageSupport {
    /** Create a language support object. */
    constructor(
    /** The language object. */
    language, 
    /**
     * An optional set of supporting extensions. When nesting a language in another
     * language, the outer language is encouraged to include the supporting extensions
     * for its inner languages in its own set of support extensions.
     */
    support = []) {
        this.language = language;
        this.support = support;
        this.extension = [language, support];
    }
}
/**
 * Language descriptions are used to store metadata about languages and to dynamically load them.
 * Their main role is finding the appropriate language for a filename or dynamically loading
 * nested parsers.
 */
export class LanguageDescription {
    constructor(
    /** The name of this language. */
    name, 
    /** Alternative names for the mode (lowercased, includes `this.name`). */
    alias, 
    /** File extensions associated with this language. */
    extensions, 
    /** Optional filename pattern that should be associated with this language. */
    filename, loadFunc, 
    /** If the language has been loaded, this will hold its value. */
    support = undefined) {
        this.name = name;
        this.alias = alias;
        this.extensions = extensions;
        this.filename = filename;
        this.loadFunc = loadFunc;
        this.support = support;
        this.loading = null;
    }
    /**
     * Start loading the the language. Will return a promise that resolves to a
     * {@link LanguageSupport} object when the language successfully loads.
     */
    load() {
        return this.loading || (this.loading = this.loadFunc().then(support => this.support = support, err => { this.loading = null; throw err; }));
    }
    /**
     * Create a language description.
     * @param spec.name The language's name.
     * @param [spec.alias] An optional array of alternative names.
     * @param [spec.extensions] An optional array of filename extensions associated with this language.
     * @param [spec.filename] An optional filename pattern associated with this language.
     * @param [spec.load] A function that will asynchronously load the language.
     * @param [spec.support] Alternatively to `load`, you can provide an already loaded support object. Either this or `load` should be provided.
     */
    static of(spec) {
        let { load, support } = spec;
        if (!load) {
            if (!support)
                throw new RangeError("Must pass either 'load' or 'support' to LanguageDescription.of");
            load = () => Promise.resolve(support);
        }
        return new LanguageDescription(spec.name, (spec.alias || []).concat(spec.name).map(s => s.toLowerCase()), spec.extensions || [], spec.filename, load, support);
    }
    /**
     * Look for a language in the given array of descriptions that matches the filename.
     * Will first match {@link filename} patterns, and then {@link extensions}, and return
     * the first language that matches.
     */
    static matchFilename(descs, filename) {
        for (let d of descs)
            if (d.filename && d.filename.test(filename))
                return d;
        let ext = /\.([^.]+)$/.exec(filename);
        if (ext)
            for (let d of descs)
                if (d.extensions.indexOf(ext[1]) > -1)
                    return d;
        return null;
    }
    /**
     * Look for a language whose name or alias matches the the given name (case-insensitively).
     * If `fuzzy` is true, and no direct matchs is found, this'll also search for a language
     * whose name or alias occurs in the string (for names shorter than three characters, only
     * when surrounded by non-word characters).
     */
    static matchLanguageName(descs, name, fuzzy = true) {
        name = name.toLowerCase();
        for (let d of descs)
            if (d.alias.some(a => a == name))
                return d;
        if (fuzzy)
            for (let d of descs)
                for (let a of d.alias) {
                    let found = name.indexOf(a);
                    if (found > -1 && (a.length > 2 || !/\w/.test(name[found - 1]) && !/\w/.test(name[found + a.length])))
                        return d;
                }
        return null;
    }
}
