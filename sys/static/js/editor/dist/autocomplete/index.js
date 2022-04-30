import { Prec } from "../state/index.js";
import { keymap } from "../view/index.js";
import { completionState, setSelectedEffect } from "./state.js";
import { completionConfig } from "./config.js";
import { completionPlugin, moveCompletionSelection, acceptCompletion, startCompletion, closeCompletion } from "./view.js";
import { baseTheme } from "./theme.js";
export { snippet, snippetCompletion, nextSnippetField, prevSnippetField, clearSnippet, snippetKeymap } from "./snippet.js";
export { CompletionContext, pickedCompletion, completeFromList, ifIn, ifNotIn } from "./completion.js";
export { startCompletion, closeCompletion, acceptCompletion, moveCompletionSelection } from "./view.js";
export { completeAnyWord } from "./word.js";
export { closeBrackets, closeBracketsKeymap, deleteBracketPair, insertBracket } from "./closebrackets.js";
export function autocompletion(config = {}) {
    return [
        completionState,
        completionConfig.of(config),
        completionPlugin,
        completionKeymapExt,
        baseTheme
    ];
}
export const completionKeymap = [
    { key: "Ctrl-Space", run: startCompletion },
    { key: "Escape", run: closeCompletion },
    { key: "ArrowDown", run: moveCompletionSelection(true) },
    { key: "ArrowUp", run: moveCompletionSelection(false) },
    { key: "PageDown", run: moveCompletionSelection(true, "page") },
    { key: "PageUp", run: moveCompletionSelection(false, "page") },
    { key: "Enter", run: acceptCompletion }
];
const completionKeymapExt = Prec.highest(keymap.computeN([completionConfig], state => state.facet(completionConfig).defaultKeymap ? [completionKeymap] : []));
export function completionStatus(state) {
    let cState = state.field(completionState, false);
    return cState && cState.active.some(a => a.state == 1) ? "pending" :
        cState && cState.active.some(a => a.state != 0) ? "active" : null;
}
const completionArrayCache = new WeakMap;
export function currentCompletions(state) {
    var _a;
    let open = (_a = state.field(completionState, false)) === null || _a === void 0 ? void 0 : _a.open;
    if (!open)
        return [];
    let completions = completionArrayCache.get(open.options);
    if (!completions)
        completionArrayCache.set(open.options, completions = open.options.map(o => o.completion));
    return completions;
}
export function selectedCompletion(state) {
    var _a;
    let open = (_a = state.field(completionState, false)) === null || _a === void 0 ? void 0 : _a.open;
    return open ? open.options[open.selected].completion : null;
}
export function selectedCompletionIndex(state) {
    var _a;
    let open = (_a = state.field(completionState, false)) === null || _a === void 0 ? void 0 : _a.open;
    return open ? open.selected : null;
}
export function setSelectedCompletion(index) {
    return setSelectedEffect.of(index);
}
