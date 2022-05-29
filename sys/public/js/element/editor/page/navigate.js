import baseSheet from "../../../../css/editor/nav.css" assert { type: "css" };
import editorLeftSheet from "../../../../css/editor/nav/left.css" assert { type: "css" };
import editorCenterSheet from "../../../../css/editor/nav/center.css" assert { type: "css" };
import editorRightSheet from "../../../../css/editor/nav/right.css" assert { type: "css" };

import { navigateBar, NavigateBaseElement } from "../../shared/page.js";

class NavigateElement extends NavigateBaseElement {
    constructor() {
        super([baseSheet, editorLeftSheet, editorCenterSheet, editorRightSheet]);
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `${navigateBar("Upload")}`;
    }
}

customElements.define("sl-nav", NavigateElement);

export { NavigateElement }
