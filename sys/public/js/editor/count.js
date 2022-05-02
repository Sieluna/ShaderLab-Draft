import { showPanel } from "./dist/view/panel.js";

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
    let dom = document.createElement("div");
    dom.textContent = countWords(view.state.doc);
    return {
        dom,
        update(update) {
            if (update.docChanged)
                dom.textContent = countWords(update.state.doc);
        }
    }
}

export const wordCounter = showPanel.of(wordCountPanel);
