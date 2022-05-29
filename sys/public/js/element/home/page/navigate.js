import baseSheet from "../../../../css/home/nav.css" assert { type: "css" };
import homeBannerSheet from "../../../../css/home/nav/banner.css" assert { type: "css" };
import homeFilterSheet from "../../../../css/home/nav/filter.css" assert { type: "css" };

import { navigateBar, NavigateBaseElement } from "../../shared/page.js";

class NavigateElement extends NavigateBaseElement {
    constructor() {
        super([baseSheet, homeBannerSheet, homeFilterSheet]);
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            ${navigateBar("Create")}
            <div class="sl-nav__banner"></div>
            <div class="sl-nav__filter">
                <div class="topic-filter"></div>
                <div class="tag-filter"></div>
            </div>
        `;
    }
}

customElements.define("sl-nav", NavigateElement);

export { NavigateElement }
