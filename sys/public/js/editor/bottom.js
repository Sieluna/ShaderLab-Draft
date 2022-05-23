import { showPanel } from "./dist/view/panel.js";

let compile = function () {};
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
    left.classList.add("cm-count");
    left.textContent = countWords(view.state.doc);
    right.classList.add("cm-compile");
    right.textContent = "Compiler";
    right.addEventListener("click", () => compile());
    return {
        dom,
        update(update) {
            if (update.docChanged)
                left.textContent = countWords(update.state.doc);
        }
    }
}

export const wordCounter = showPanel.of(wordCountPanel);
