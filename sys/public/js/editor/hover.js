import { hoverTooltip, EditorView } from "./dist/view/index.js"
import { glslKeywords, glslTypes, glslParams } from "./dist/glsl.js";

const glslRef = {
    abs: {
        type: "buildin",
        desc: "return the absolute value of the parameter"
    },
    acos: {
        type: "buildin",
        desc: "return the arccosine of the parameter"
    },
    all: {
        type: "buildin",
        desc: "check whether all elements of a boolean vector are true"
    },
    sin: {
        type: "buildin",
        desc: "return the sine of the parameter"
    },
    gl_FragCoord: {
        type: "keyword",
        desc: "contains the window-relative coordinates of the current fragment"
    },
    gl_FragColor: {
        type: "keyword",
        desc: "contains the window-relative coordinates of the current fragment"
    }
}

const glslColor = {
    keyword: "#6478ac",
    buildin: "#2790d2"
}

const hoverTooltipTheme = EditorView.baseTheme({
    ".cm-tooltip.cm-tooltip-hover": {
        borderRadius: "2px",
        borderBottom: "1px solid var(--graph_icon)",
        backgroundColor: "var(--graph_bg_thin)",
        "& .cm-tooltip-section div": {
            fontSize: "14px",
        }
    }
})

export const glslHoverRef = [ hoverTooltip((view, pos, side) => {
    let { from, to, text } = view.state.doc.lineAt(pos); // single line
    let start = pos, end = pos;
    while (start > from && /\w/.test(text[start - from - 1])) start--;
    while (end < to && /\w/.test(text[end - from])) end++;
    if (start === pos && side < 0 || end === pos && side > 0) return null;
    const target = text.slice(start - from, end - from);
    if (glslKeywords[target] || glslTypes[target] || glslParams[target]) return null;
    return {
        pos: start,
        end,
        above: true,
        create(view) {
            let ref, dom = document.createElement("div");
            if ((ref = glslRef[target])) {
                dom.innerHTML += `<div style='margin: 7px 10px 7px 10px; display: flex;'>
                                     <div style='color: ${glslColor[ref.type]};'>${ref.type} macro</div>
                                     <div style="margin-left: 5px; color: #6643bf">${target}</div>
                                  </div>`
                dom.innerHTML += `<div style="height: 1px; border-top: 1px solid var(--graph_icon); text-align: center;"></div>`;
                dom.innerHTML += `<div style="margin: 7px 10px 7px 10px; color: var(--text_mid_dark)">${ref.desc}</div>`;
            } else {
                dom.innerHTML += `<div style="margin: 5px 10px 5px 10px; color: #538035">ღ variable ${target}</div>`
            }
            return { dom };
        }
    }
}), hoverTooltipTheme ];
