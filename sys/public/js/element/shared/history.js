const historyElement = document.querySelector(".sl-nav .search-panel .search-history");
const cleanElement = document.querySelector(".sl-nav .search-panel .history-clear");
const searchElement = document.querySelector("#nav-search .nav-search-btn");

let history = JSON.parse(localStorage.getItem("history")) || {};

let historyCache = [];

const loadHistoryPrefab = (history) => {
    Object.keys(history).sort((a, b) => history[b] - history[a]).forEach((item, index) => {
        if (index < 6) {
            if (historyCache[index]) {
                historyCache[index].innerHTML = `<div>${item}</div>
                                                 <div style="font-size: 16px top: 14px">&#10548</div>`
            } else {
                const element = document.createElement("a");
                element.classList.add("history-item");
                element.innerHTML = `<div>${item}</div>
                                     <div style="font-size: 16px top: 14px">&#10548</div>`
                historyCache[index] = element;
                historyElement.append(historyCache[index]);
            }
        }
    });
}

export const historyFeature = (inputData) => {
    loadHistoryPrefab(history);
    cleanElement.addEventListener("click", () => {
        document.querySelectorAll(".sl-nav .search-panel .history-item").forEach(node => node.remove());
        localStorage.removeItem("history");
        history = {};
    });
    searchElement.addEventListener("click", () => {
        if (inputData.value.length > 0) {
            history[inputData.value] = Date.now();
            localStorage.setItem("history", JSON.stringify(history));
            loadHistoryPrefab(history)
        }
    });
}
