const historyElement = document.querySelector(".sl-nav .search-panel .search-history");
const cleanElement = document.querySelector(".sl-nav .search-panel .history-clear");
const searchElement = document.querySelector("#nav-search .nav-search-btn");

let history = JSON.parse(localStorage.getItem("history")) || {};

const historyPrefab = (content) => historyElement.innerHTML +=
    `<a class="history-item" href="#">
        <div>${content}</div>
        <div style="font-size: 16px top: 14px">&#10548</div>
    </a>`

export const historyFeature = (inputData) => {
    Object.keys(history).sort((a, b) => history[b] - history[a]).forEach((item, index) => {
        if (index < 6)
            historyPrefab(item);
    });
    cleanElement.addEventListener("click", () => {
        console.log("click")
        document.querySelectorAll(".sl-nav .search-panel .history-item").forEach(node => node.remove());
        localStorage.removeItem("history");
    });
    searchElement.addEventListener("click", () => {
        if (inputData.value.length > 0) {
            history[inputData.value] = Date.now();
            localStorage.setItem("history", JSON.stringify(history));
        } else {
            console.log("[History] ", "search input none");
        }
    });
}
