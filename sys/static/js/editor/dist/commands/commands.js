import { EditorSelection, CharCategory, findClusterBreak, Text, countColumn } from "../state/index.js";
import { EditorView, Direction } from "../view/index.js";
import { syntaxTree, IndentContext, getIndentUnit, indentUnit, indentString, getIndentation, matchBrackets } from "../language/index.js";
import { NodeProp } from "../lezer/common/index.js";
import { toggleComment, toggleBlockComment } from "./comment.js";
function updateSel(sel, by) {
    return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
}
function setSel(state, selection) {
    return state.update({ selection, scrollIntoView: true, userEvent: "select" });
}
function moveSel({ state, dispatch }, how) {
    let selection = updateSel(state.selection, how);
    if (selection.eq(state.selection))
        return false;
    dispatch(setSel(state, selection));
    return true;
}
function rangeEnd(range, forward) {
    return EditorSelection.cursor(forward ? range.to : range.from);
}
function cursorByChar(view, forward) {
    return moveSel(view, range => range.empty ? view.moveByChar(range, forward) : rangeEnd(range, forward));
}
function ltrAtCursor(view) {
    return view.textDirectionAt(view.state.selection.main.head) == Direction.LTR;
}
export const cursorCharLeft = view => cursorByChar(view, !ltrAtCursor(view));
export const cursorCharRight = view => cursorByChar(view, ltrAtCursor(view));
export const cursorCharForward = view => cursorByChar(view, true);
export const cursorCharBackward = view => cursorByChar(view, false);
function cursorByGroup(view, forward) {
    return moveSel(view, range => range.empty ? view.moveByGroup(range, forward) : rangeEnd(range, forward));
}
export const cursorGroupLeft = view => cursorByGroup(view, !ltrAtCursor(view));
export const cursorGroupRight = view => cursorByGroup(view, ltrAtCursor(view));
export const cursorGroupForward = view => cursorByGroup(view, true);
export const cursorGroupBackward = view => cursorByGroup(view, false);
function moveBySubword(view, range, forward) {
    let categorize = view.state.charCategorizer(range.from);
    return view.moveByChar(range, forward, start => {
        let cat = CharCategory.Space, pos = range.from;
        let done = false, sawUpper = false, sawLower = false;
        let step = (next) => {
            if (done)
                return false;
            pos += forward ? next.length : -next.length;
            let nextCat = categorize(next), ahead;
            if (cat == CharCategory.Space)
                cat = nextCat;
            if (cat != nextCat)
                return false;
            if (cat == CharCategory.Word) {
                if (next.toLowerCase() == next) {
                    if (!forward && sawUpper)
                        return false;
                    sawLower = true;
                }
                else if (sawLower) {
                    if (forward)
                        return false;
                    done = true;
                }
                else {
                    if (sawUpper && forward && categorize(ahead = view.state.sliceDoc(pos, pos + 1)) == CharCategory.Word &&
                        ahead.toLowerCase() == ahead)
                        return false;
                    sawUpper = true;
                }
            }
            return true;
        };
        step(start);
        return step;
    });
}
function cursorBySubword(view, forward) {
    return moveSel(view, range => range.empty ? moveBySubword(view, range, forward) : rangeEnd(range, forward));
}
export const cursorSubwordForward = view => cursorBySubword(view, true);
export const cursorSubwordBackward = view => cursorBySubword(view, false);
function interestingNode(state, node, bracketProp) {
    if (node.type.prop(bracketProp))
        return true;
    let len = node.to - node.from;
    return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
}
function moveBySyntax(state, start, forward) {
    let pos = syntaxTree(state).resolveInner(start.head);
    let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
    for (let at = start.head;;) {
        let next = forward ? pos.childAfter(at) : pos.childBefore(at);
        if (!next)
            break;
        if (interestingNode(state, next, bracketProp))
            pos = next;
        else
            at = forward ? next.to : next.from;
    }
    let bracket = pos.type.prop(bracketProp), match, newPos;
    if (bracket && (match = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match.matched)
        newPos = forward ? match.end.to : match.end.from;
    else
        newPos = forward ? pos.to : pos.from;
    return EditorSelection.cursor(newPos, forward ? -1 : 1);
}
export const cursorSyntaxLeft = view => moveSel(view, range => moveBySyntax(view.state, range, !ltrAtCursor(view)));
export const cursorSyntaxRight = view => moveSel(view, range => moveBySyntax(view.state, range, ltrAtCursor(view)));
function cursorByLine(view, forward) {
    return moveSel(view, range => {
        if (!range.empty)
            return rangeEnd(range, forward);
        let moved = view.moveVertically(range, forward);
        return moved.head != range.head ? moved : view.moveToLineBoundary(range, forward);
    });
}
export const cursorLineUp = view => cursorByLine(view, false);
export const cursorLineDown = view => cursorByLine(view, true);
function cursorByPage(view, forward) {
    let { state } = view, selection = updateSel(state.selection, range => {
        return range.empty ? view.moveVertically(range, forward, Math.min(view.dom.clientHeight, innerHeight))
            : rangeEnd(range, forward);
    });
    if (selection.eq(state.selection))
        return false;
    let startPos = view.coordsAtPos(state.selection.main.head);
    let scrollRect = view.scrollDOM.getBoundingClientRect();
    let effect;
    if (startPos && startPos.top > scrollRect.top && startPos.bottom < scrollRect.bottom &&
        startPos.top - scrollRect.top <= view.scrollDOM.scrollHeight - view.scrollDOM.scrollTop - view.scrollDOM.clientHeight)
        effect = EditorView.scrollIntoView(selection.main.head, { y: "start", yMargin: startPos.top - scrollRect.top });
    view.dispatch(setSel(state, selection), { effects: effect });
    return true;
}
export const cursorPageUp = view => cursorByPage(view, false);
export const cursorPageDown = view => cursorByPage(view, true);
function moveByLineBoundary(view, start, forward) {
    let line = view.lineBlockAt(start.head), moved = view.moveToLineBoundary(start, forward);
    if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
        moved = view.moveToLineBoundary(start, forward, false);
    if (!forward && moved.head == line.from && line.length) {
        let space = /^\s*/.exec(view.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
        if (space && start.head != line.from + space)
            moved = EditorSelection.cursor(line.from + space);
    }
    return moved;
}
export const cursorLineBoundaryForward = view => moveSel(view, range => moveByLineBoundary(view, range, true));
export const cursorLineBoundaryBackward = view => moveSel(view, range => moveByLineBoundary(view, range, false));
export const cursorLineStart = view => moveSel(view, range => EditorSelection.cursor(view.lineBlockAt(range.head).from, 1));
export const cursorLineEnd = view => moveSel(view, range => EditorSelection.cursor(view.lineBlockAt(range.head).to, -1));
function toMatchingBracket(state, dispatch, extend) {
    let found = false, selection = updateSel(state.selection, range => {
        let matching = matchBrackets(state, range.head, -1)
            || matchBrackets(state, range.head, 1)
            || (range.head > 0 && matchBrackets(state, range.head - 1, 1))
            || (range.head < state.doc.length && matchBrackets(state, range.head + 1, -1));
        if (!matching || !matching.end)
            return range;
        found = true;
        let head = matching.start.from == range.head ? matching.end.to : matching.end.from;
        return extend ? EditorSelection.range(range.anchor, head) : EditorSelection.cursor(head);
    });
    if (!found)
        return false;
    dispatch(setSel(state, selection));
    return true;
}
export const cursorMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, false);
export const selectMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, true);
function extendSel(view, how) {
    let selection = updateSel(view.state.selection, range => {
        let head = how(range);
        return EditorSelection.range(range.anchor, head.head, head.goalColumn);
    });
    if (selection.eq(view.state.selection))
        return false;
    view.dispatch(setSel(view.state, selection));
    return true;
}
function selectByChar(view, forward) {
    return extendSel(view, range => view.moveByChar(range, forward));
}
export const selectCharLeft = view => selectByChar(view, !ltrAtCursor(view));
export const selectCharRight = view => selectByChar(view, ltrAtCursor(view));
export const selectCharForward = view => selectByChar(view, true);
export const selectCharBackward = view => selectByChar(view, false);
function selectByGroup(view, forward) {
    return extendSel(view, range => view.moveByGroup(range, forward));
}
export const selectGroupLeft = view => selectByGroup(view, !ltrAtCursor(view));
export const selectGroupRight = view => selectByGroup(view, ltrAtCursor(view));
export const selectGroupForward = view => selectByGroup(view, true);
export const selectGroupBackward = view => selectByGroup(view, false);
function selectBySubword(view, forward) {
    return extendSel(view, range => moveBySubword(view, range, forward));
}
export const selectSubwordForward = view => selectBySubword(view, true);
export const selectSubwordBackward = view => selectBySubword(view, false);
export const selectSyntaxLeft = view => extendSel(view, range => moveBySyntax(view.state, range, !ltrAtCursor(view)));
export const selectSyntaxRight = view => extendSel(view, range => moveBySyntax(view.state, range, ltrAtCursor(view)));
function selectByLine(view, forward) {
    return extendSel(view, range => view.moveVertically(range, forward));
}
export const selectLineUp = view => selectByLine(view, false);
export const selectLineDown = view => selectByLine(view, true);
function selectByPage(view, forward) {
    return extendSel(view, range => view.moveVertically(range, forward, Math.min(view.dom.clientHeight, innerHeight)));
}
export const selectPageUp = view => selectByPage(view, false);
export const selectPageDown = view => selectByPage(view, true);
export const selectLineBoundaryForward = view => extendSel(view, range => moveByLineBoundary(view, range, true));
export const selectLineBoundaryBackward = view => extendSel(view, range => moveByLineBoundary(view, range, false));
export const selectLineStart = view => extendSel(view, range => EditorSelection.cursor(view.lineBlockAt(range.head).from));
export const selectLineEnd = view => extendSel(view, range => EditorSelection.cursor(view.lineBlockAt(range.head).to));
export const cursorDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: 0 }));
    return true;
};
export const cursorDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.doc.length }));
    return true;
};
export const selectDocStart = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: 0 }));
    return true;
};
export const selectDocEnd = ({ state, dispatch }) => {
    dispatch(setSel(state, { anchor: state.selection.main.anchor, head: state.doc.length }));
    return true;
};
export const selectAll = ({ state, dispatch }) => {
    dispatch(state.update({ selection: { anchor: 0, head: state.doc.length }, userEvent: "select" }));
    return true;
};
export const selectLine = ({ state, dispatch }) => {
    let ranges = selectedLineBlocks(state).map(({ from, to }) => EditorSelection.range(from, Math.min(to + 1, state.doc.length)));
    dispatch(state.update({ selection: EditorSelection.create(ranges), userEvent: "select" }));
    return true;
};
export const selectParentSyntax = ({ state, dispatch }) => {
    let selection = updateSel(state.selection, range => {
        var _a;
        let context = syntaxTree(state).resolveInner(range.head, 1);
        while (!((context.from < range.from && context.to >= range.to) ||
            (context.to > range.to && context.from <= range.from) ||
            !((_a = context.parent) === null || _a === void 0 ? void 0 : _a.parent)))
            context = context.parent;
        return EditorSelection.range(context.to, context.from);
    });
    dispatch(setSel(state, selection));
    return true;
};
export const simplifySelection = ({ state, dispatch }) => {
    let cur = state.selection, selection = null;
    if (cur.ranges.length > 1)
        selection = EditorSelection.create([cur.main]);
    else if (!cur.main.empty)
        selection = EditorSelection.create([EditorSelection.cursor(cur.main.head)]);
    if (!selection)
        return false;
    dispatch(setSel(state, selection));
    return true;
};
function deleteBy({ state, dispatch }, by) {
    if (state.readOnly)
        return false;
    let event = "delete.selection";
    let changes = state.changeByRange(range => {
        let { from, to } = range;
        if (from == to) {
            let towards = by(from);
            if (towards < from)
                event = "delete.backward";
            else if (towards > from)
                event = "delete.forward";
            from = Math.min(from, towards);
            to = Math.max(to, towards);
        }
        return from == to ? { range } : { changes: { from, to }, range: EditorSelection.cursor(from) };
    });
    if (changes.changes.empty)
        return false;
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: event }));
    return true;
}
function skipAtomic(target, pos, forward) {
    if (target instanceof EditorView)
        for (let ranges of target.state.facet(EditorView.atomicRanges).map(f => f(target)))
            ranges.between(pos, pos, (from, to) => {
                if (from < pos && to > pos)
                    pos = forward ? to : from;
            });
    return pos;
}
const deleteByChar = (target, forward) => deleteBy(target, pos => {
    let { state } = target, line = state.doc.lineAt(pos), before, targetPos;
    if (!forward && pos > line.from && pos < line.from + 200 &&
        !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
        if (before[before.length - 1] == "\t")
            return pos - 1;
        let col = countColumn(before, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
        for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
            pos--;
        targetPos = pos;
    }
    else {
        targetPos = findClusterBreak(line.text, pos - line.from, forward, forward) + line.from;
        if (targetPos == pos && line.number != (forward ? state.doc.lines : 1))
            targetPos += forward ? 1 : -1;
    }
    return skipAtomic(target, targetPos, forward);
});
export const deleteCharBackward = view => deleteByChar(view, false);
export const deleteCharForward = view => deleteByChar(view, true);
const deleteByGroup = (target, forward) => deleteBy(target, start => {
    let pos = start, { state } = target, line = state.doc.lineAt(pos);
    let categorize = state.charCategorizer(pos);
    for (let cat = null;;) {
        if (pos == (forward ? line.to : line.from)) {
            if (pos == start && line.number != (forward ? state.doc.lines : 1))
                pos += forward ? 1 : -1;
            break;
        }
        let next = findClusterBreak(line.text, pos - line.from, forward) + line.from;
        let nextChar = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
        let nextCat = categorize(nextChar);
        if (cat != null && nextCat != cat)
            break;
        if (nextChar != " " || pos != start)
            cat = nextCat;
        pos = next;
    }
    return skipAtomic(target, pos, forward);
});
export const deleteGroupBackward = target => deleteByGroup(target, false);
export const deleteGroupForward = target => deleteByGroup(target, true);
export const deleteToLineEnd = view => deleteBy(view, pos => {
    let lineEnd = view.lineBlockAt(pos).to;
    return skipAtomic(view, pos < lineEnd ? lineEnd : Math.min(view.state.doc.length, pos + 1), true);
});
export const deleteToLineStart = view => deleteBy(view, pos => {
    let lineStart = view.lineBlockAt(pos).from;
    return skipAtomic(view, pos > lineStart ? lineStart : Math.max(0, pos - 1), false);
});
export const deleteTrailingWhitespace = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let changes = [];
    for (let pos = 0, prev = "", iter = state.doc.iter();;) {
        iter.next();
        if (iter.lineBreak || iter.done) {
            let trailing = prev.search(/\s+$/);
            if (trailing > -1)
                changes.push({ from: pos - (prev.length - trailing), to: pos });
            if (iter.done)
                break;
            prev = "";
        }
        else {
            prev = iter.value;
        }
        pos += iter.value.length;
    }
    if (!changes.length)
        return false;
    dispatch(state.update({ changes, userEvent: "delete" }));
    return true;
};
export const splitLine = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let changes = state.changeByRange(range => {
        return { changes: { from: range.from, to: range.to, insert: Text.of(["", ""]) },
            range: EditorSelection.cursor(range.from) };
    });
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
    return true;
};
export const transposeChars = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let changes = state.changeByRange(range => {
        if (!range.empty || range.from == 0 || range.from == state.doc.length)
            return { range };
        let pos = range.from, line = state.doc.lineAt(pos);
        let from = pos == line.from ? pos - 1 : findClusterBreak(line.text, pos - line.from, false) + line.from;
        let to = pos == line.to ? pos + 1 : findClusterBreak(line.text, pos - line.from, true) + line.from;
        return { changes: { from, to, insert: state.doc.slice(pos, to).append(state.doc.slice(from, pos)) },
            range: EditorSelection.cursor(to) };
    });
    if (changes.changes.empty)
        return false;
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "move.character" }));
    return true;
};
function selectedLineBlocks(state) {
    let blocks = [], upto = -1;
    for (let range of state.selection.ranges) {
        let startLine = state.doc.lineAt(range.from), endLine = state.doc.lineAt(range.to);
        if (!range.empty && range.to == endLine.from)
            endLine = state.doc.lineAt(range.to - 1);
        if (upto >= startLine.number) {
            let prev = blocks[blocks.length - 1];
            prev.to = endLine.to;
            prev.ranges.push(range);
        }
        else {
            blocks.push({ from: startLine.from, to: endLine.to, ranges: [range] });
        }
        upto = endLine.number + 1;
    }
    return blocks;
}
function moveLine(state, dispatch, forward) {
    if (state.readOnly)
        return false;
    let changes = [], ranges = [];
    for (let block of selectedLineBlocks(state)) {
        if (forward ? block.to == state.doc.length : block.from == 0)
            continue;
        let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
        let size = nextLine.length + 1;
        if (forward) {
            changes.push({ from: block.to, to: nextLine.to }, { from: block.from, insert: nextLine.text + state.lineBreak });
            for (let r of block.ranges)
                ranges.push(EditorSelection.range(Math.min(state.doc.length, r.anchor + size), Math.min(state.doc.length, r.head + size)));
        }
        else {
            changes.push({ from: nextLine.from, to: block.from }, { from: block.to, insert: state.lineBreak + nextLine.text });
            for (let r of block.ranges)
                ranges.push(EditorSelection.range(r.anchor - size, r.head - size));
        }
    }
    if (!changes.length)
        return false;
    dispatch(state.update({
        changes,
        scrollIntoView: true,
        selection: EditorSelection.create(ranges, state.selection.mainIndex),
        userEvent: "move.line"
    }));
    return true;
}
export const moveLineUp = ({ state, dispatch }) => moveLine(state, dispatch, false);
export const moveLineDown = ({ state, dispatch }) => moveLine(state, dispatch, true);
function copyLine(state, dispatch, forward) {
    if (state.readOnly)
        return false;
    let changes = [];
    for (let block of selectedLineBlocks(state)) {
        if (forward)
            changes.push({ from: block.from, insert: state.doc.slice(block.from, block.to) + state.lineBreak });
        else
            changes.push({ from: block.to, insert: state.lineBreak + state.doc.slice(block.from, block.to) });
    }
    dispatch(state.update({ changes, scrollIntoView: true, userEvent: "input.copyline" }));
    return true;
}
export const copyLineUp = ({ state, dispatch }) => copyLine(state, dispatch, false);
export const copyLineDown = ({ state, dispatch }) => copyLine(state, dispatch, true);
export const deleteLine = view => {
    if (view.state.readOnly)
        return false;
    let { state } = view, changes = state.changes(selectedLineBlocks(state).map(({ from, to }) => {
        if (from > 0)
            from--;
        else if (to < state.doc.length)
            to++;
        return { from, to };
    }));
    let selection = updateSel(state.selection, range => view.moveVertically(range, true)).map(changes);
    view.dispatch({ changes, selection, scrollIntoView: true, userEvent: "delete.line" });
    return true;
};
export const insertNewline = ({ state, dispatch }) => {
    dispatch(state.update(state.replaceSelection(state.lineBreak), { scrollIntoView: true, userEvent: "input" }));
    return true;
};
function isBetweenBrackets(state, pos) {
    if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1)))
        return { from: pos, to: pos };
    let context = syntaxTree(state).resolveInner(pos);
    let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
    if (before && after && before.to <= pos && after.from >= pos &&
        (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 &&
        state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from)
        return { from: before.to, to: after.from };
    return null;
}
export const insertNewlineAndIndent = newlineAndIndent(false);
export const insertBlankLine = newlineAndIndent(true);
function newlineAndIndent(atEof) {
    return ({ state, dispatch }) => {
        if (state.readOnly)
            return false;
        let changes = state.changeByRange(range => {
            let { from, to } = range, line = state.doc.lineAt(from);
            let explode = !atEof && from == to && isBetweenBrackets(state, from);
            if (atEof)
                from = to = (to <= line.to ? line : state.doc.lineAt(to)).to;
            let cx = new IndentContext(state, { simulateBreak: from, simulateDoubleBreak: !!explode });
            let indent = getIndentation(cx, from);
            if (indent == null)
                indent = /^\s*/.exec(state.doc.lineAt(from).text)[0].length;
            while (to < line.to && /\s/.test(line.text[to - line.from]))
                to++;
            if (explode)
                ({ from, to } = explode);
            else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
                from = line.from;
            let insert = ["", indentString(state, indent)];
            if (explode)
                insert.push(indentString(state, cx.lineIndent(line.from, -1)));
            return { changes: { from, to, insert: Text.of(insert) },
                range: EditorSelection.cursor(from + 1 + insert[1].length) };
        });
        dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
        return true;
    };
}
function changeBySelectedLine(state, f) {
    let atLine = -1;
    return state.changeByRange(range => {
        let changes = [];
        for (let pos = range.from; pos <= range.to;) {
            let line = state.doc.lineAt(pos);
            if (line.number > atLine && (range.empty || range.to > line.from)) {
                f(line, changes, range);
                atLine = line.number;
            }
            pos = line.to + 1;
        }
        let changeSet = state.changes(changes);
        return { changes,
            range: EditorSelection.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1)) };
    });
}
export const indentSelection = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    let updated = Object.create(null);
    let context = new IndentContext(state, { overrideIndentation: start => {
            let found = updated[start];
            return found == null ? -1 : found;
        } });
    let changes = changeBySelectedLine(state, (line, changes, range) => {
        let indent = getIndentation(context, line.from);
        if (indent == null)
            return;
        if (!/\S/.test(line.text))
            indent = 0;
        let cur = /^\s*/.exec(line.text)[0];
        let norm = indentString(state, indent);
        if (cur != norm || range.from < line.from + cur.length) {
            updated[line.from] = indent;
            changes.push({ from: line.from, to: line.from + cur.length, insert: norm });
        }
    });
    if (!changes.changes.empty)
        dispatch(state.update(changes, { userEvent: "indent" }));
    return true;
};
export const indentMore = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
        changes.push({ from: line.from, insert: state.facet(indentUnit) });
    }), { userEvent: "input.indent" }));
    return true;
};
export const indentLess = ({ state, dispatch }) => {
    if (state.readOnly)
        return false;
    dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
        let space = /^\s*/.exec(line.text)[0];
        if (!space)
            return;
        let col = countColumn(space, state.tabSize), keep = 0;
        let insert = indentString(state, Math.max(0, col - getIndentUnit(state)));
        while (keep < space.length && keep < insert.length && space.charCodeAt(keep) == insert.charCodeAt(keep))
            keep++;
        changes.push({ from: line.from + keep, to: line.from + space.length, insert: insert.slice(keep) });
    }), { userEvent: "delete.dedent" }));
    return true;
};
export const insertTab = ({ state, dispatch }) => {
    if (state.selection.ranges.some(r => !r.empty))
        return indentMore({ state, dispatch });
    dispatch(state.update(state.replaceSelection("\t"), { scrollIntoView: true, userEvent: "input" }));
    return true;
};
export const emacsStyleKeymap = [
    { key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
    { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
    { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
    { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
    { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
    { key: "Ctrl-d", run: deleteCharForward },
    { key: "Ctrl-h", run: deleteCharBackward },
    { key: "Ctrl-k", run: deleteToLineEnd },
    { key: "Ctrl-Alt-h", run: deleteGroupBackward },
    { key: "Ctrl-o", run: splitLine },
    { key: "Ctrl-t", run: transposeChars },
    { key: "Ctrl-v", run: cursorPageDown },
];
export const standardKeymap = [
    { key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
    { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft },
    { mac: "Cmd-ArrowLeft", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward },
    { key: "ArrowRight", run: cursorCharRight, shift: selectCharRight, preventDefault: true },
    { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight },
    { mac: "Cmd-ArrowRight", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward },
    { key: "ArrowUp", run: cursorLineUp, shift: selectLineUp, preventDefault: true },
    { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
    { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
    { key: "ArrowDown", run: cursorLineDown, shift: selectLineDown, preventDefault: true },
    { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
    { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
    { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
    { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
    { key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward, preventDefault: true },
    { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
    { key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward, preventDefault: true },
    { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
    { key: "Enter", run: insertNewlineAndIndent },
    { key: "Mod-a", run: selectAll },
    { key: "Backspace", run: deleteCharBackward, shift: deleteCharBackward },
    { key: "Delete", run: deleteCharForward },
    { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward },
    { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward },
    { mac: "Mod-Backspace", run: deleteToLineStart },
    { mac: "Mod-Delete", run: deleteToLineEnd }
].concat(emacsStyleKeymap.map(b => ({ mac: b.key, run: b.run, shift: b.shift })));
export const defaultKeymap = [
    { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
    { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },
    { key: "Alt-ArrowUp", run: moveLineUp },
    { key: "Shift-Alt-ArrowUp", run: copyLineUp },
    { key: "Alt-ArrowDown", run: moveLineDown },
    { key: "Shift-Alt-ArrowDown", run: copyLineDown },
    { key: "Escape", run: simplifySelection },
    { key: "Mod-Enter", run: insertBlankLine },
    { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
    { key: "Mod-i", run: selectParentSyntax, preventDefault: true },
    { key: "Mod-[", run: indentLess },
    { key: "Mod-]", run: indentMore },
    { key: "Mod-Alt-\\", run: indentSelection },
    { key: "Shift-Mod-k", run: deleteLine },
    { key: "Shift-Mod-\\", run: cursorMatchingBracket },
    { key: "Mod-/", run: toggleComment },
    { key: "Alt-A", run: toggleBlockComment }
].concat(standardKeymap);
export const indentWithTab = { key: "Tab", run: indentMore, shift: indentLess };
