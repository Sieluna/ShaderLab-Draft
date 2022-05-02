import { hoverTooltip } from "./dist/view/index.js"

const glslRef = {
    abs: "return the absolute value of the parameter",
    acos: "return the arccosine of the parameter",
    all: "check whether all elements of a boolean vector are true",

}

export const HoverRef = hoverTooltip((view, pos, side) => {
    let {from, to, text} = view.state.doc.lineAt(pos)
    let start = pos, end = pos
    while (start > from && /\w/.test(text[start - from - 1])) start--
    while (end < to && /\w/.test(text[end - from])) end++
    if (start === pos && side < 0 || end === pos && side > 0) return null;
    return {
        pos: start,
        end,
        above: true,
        create(view) {
            let dom = document.createElement("div");
            const target = text.slice(start - from, end - from);
            let ref;
            if ((ref = glslRef[target])) {
                dom.textContent = ref;
                return { dom };
            } else {
                return { dom };
            }
        }
    }
})
