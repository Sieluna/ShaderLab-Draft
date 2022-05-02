import { keymap, highlightSpecialChars, drawSelection, highlightActiveLine, dropCursor, rectangularSelection,
         crosshairCursor, lineNumbers, highlightActiveLineGutter } from "./dist/view/index.js";
import { EditorState } from "./dist/state/index.js";
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching, foldGutter, foldKeymap } from "./dist/language/index.js";
import { defaultKeymap, history, historyKeymap } from "./dist/commands/index.js";
import { searchKeymap, highlightSelectionMatches } from "./dist/search/index.js";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "./dist/autocomplete/index.js";
import { lintKeymap } from "./dist/lint/index.js";

export const defaultConfig = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap
    ])
];

export { EditorView } from "./dist/view/index.js";
export { EditorState } from "./dist/state/index.js";
