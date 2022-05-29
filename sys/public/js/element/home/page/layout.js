import layoutSheet from "../../../../css/home/layout.css" assert { type: "css" };
import layoutCommonSheet from "../../../../css/home/layout/common.css" assert { type: "css" };
import layoutContainerSheet from "../../../../css/home/layout/container.css" assert { type: "css" };
import layoutSuggestSheet from "../../../../css/home/layout/suggest.css" assert { type: "css" };

class LayoutElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [
            layoutSheet, layoutCommonSheet, layoutContainerSheet, layoutSuggestSheet
        ];
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <div class="sl-layout__recommend"></div>
            <div class="sl-layout__holder"></div>
        `;
    }
}

customElements.define("sl-layout", LayoutElement);

export { LayoutElement }
