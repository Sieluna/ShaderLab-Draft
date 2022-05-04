import { showPanel } from "./dist/view/panel.js";

let compile;
export let compileDelegate = function (callback) { compile = callback; };

function countWords(doc) {
    let count = 0, iter = doc.iter();
    while (!iter.next().done) {
        for (let i = 0; i < iter.value.length; i++) {
            let word = /\w/.test(iter.value[i]);
            if (word) count++;
        }
    }
    return `Char count: ${count}`;
}

function wordCountPanel(view) {
    let dom = document.createElement("div"),
        left = document.createElement("div"),
        right = document.createElement("div");
    dom.append(left, right);
    dom.style.background = "#fff"
    dom.style.display = "flex";
    dom.style.justifyContent = "space-between";
    dom.style.lineHeight = "28px";
    dom.style.fontSize = "14px";
    left.style.margin = "3px 0 0 18px";
    left.textContent = countWords(view.state.doc);
    right.style.margin = "3px 18px 0 0";
    right.style.border = "1px solid #ccc";
    right.style.borderRadius = "10px";
    right.style.width = "75px";
    right.style.cursor = "pointer";
    right.style.textAlign = "center";
    right.textContent = "Compiler";
    right.addEventListener("click", compile)
    return {
        dom,
        update(update) {
            if (update.docChanged)
                left.textContent = countWords(update.state.doc);
        }
    }
}

export const wordCounter = showPanel.of(wordCountPanel);
