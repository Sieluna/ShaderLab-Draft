import { navigateBar } from "../shared/page.js";

export const navigate = `
    <div class="sl-nav">
        ${navigateBar("Create")}
        <div class="sl-nav__banner"></div>
        <div class="sl-nav__filter">
            <div class="topic-filter"></div>
            <div class="tag-filter"></div>
        </div>
    </div>
`;

export const layout = `
    <main class="sl-layout">
        <div class="sl-layout__recommend"></div>
        <div class="sl-layout__holder"></div>
    </main>
`;
