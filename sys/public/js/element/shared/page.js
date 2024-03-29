import shared from "../../../css/shared.css" assert { type: "css" };
import theme from "../../../css/theme.css" assert { type: "css" };

import sharedLeftSheet from "../../../css/shared/left.css" assert { type: "css" };
import sharedCenterSheet from "../../../css/shared/center.css" assert { type: "css" };
import sharedRightSheet from "../../../css/shared/right.css" assert { type: "css" };
import sharedSearchSheet from "../../../css/shared/search.css" assert { type: "css" };
import sharedAvatarSheet from "../../../css/shared/avatar.css" assert { type: "css" };
import sharedUserSheet from "../../../css/shared/user.css" assert { type: "css" };

document.adoptedStyleSheets = [shared, theme];

export class NavigateBaseElement extends HTMLElement {
    constructor(styles) {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.adoptedStyleSheets = [
            sharedLeftSheet, sharedCenterSheet, sharedSearchSheet,
            sharedRightSheet, sharedAvatarSheet, sharedUserSheet,
            ...styles
        ];
    }
}

export const navigateBar = (option) => `
    <div class="sl-nav__bar">
        <ul class="left-entry">
            <li class="left-entry-item">
                <div class="home-entry">ShaderLab</div>
            </li>
            <li class="left-entry-item">
                <div class="login-entry">
                    <span>Login</span>
                </div>
                <div class="avatar-container">
                    <div class="user-entry-mini">
                        <picture>
                            <img src="" alt="Avatar">
                        </picture>
                    </div>
                </div>
            </li>
        </ul>
        <div class="center-container">
            <div class="bar-outer" style="display: none"></div>
            <div class="container-extend">
                <form id="nav-search" style="border-radius: 8px">
                    <div class="nav-search-content">
                        <input class="nav-search-input" type="text" autocomplete="off" accesskey="s" maxlength="100" placeholder="Shader Today?">
                        <div class="nav-search-clean">
                            <img src="/img/home/clean.svg" alt="Clean">
                        </div>
                    </div>
                    <div class="nav-search-btn" >
                        <img src="/img/home/search.svg" alt="Search">
                    </div>
                </form>
                <div class="search-panel" style="display: none">
                    <div class="search-history">
                        <div class="history-header">
                            <div class="history-title">History</div>
                            <div class="history-clear">Clear</div>
                        </div>
                    </div>
                    <div class="top">
                        <div></div>
                    </div>
                    <div class="suggestion" style="display: none"></div>
                </div>
            </div>
        </div>
        <ul class="right-entry">
            <li class="right-entry-item">
                <div class="login-entry">
                    <span>Login</span>
                </div>
                <div class="avatar-container">
                    <div class="user-entry-mini">
                        <picture>
                            <img src="" alt="Avatar">
                        </picture>
                    </div>
                    <div class="user-entry-large" style="visibility: hidden">
                        <div class="avatar" style="width: 82px; height: 82px; transform: translate(0px, 0px);">
                            <img src="" alt="Avatar">
                        </div>
                    </div>
                </div>
                <div class="avatar-bottom" style="padding-top: 8px; margin-left: -12px; display: none">
                    <div class="userinfo-container">
                        <div class="userinfo-header"></div>
                        <div class="userinfo-name"></div>
                        <div class="userinfo-data"></div>
                        <div class="userinfo-line"></div>
                        <div class="userinfo-logout">
                            <img class="logon-icon" src="/img/home/logout.svg" alt="Logon">
                            <span>Logout</span>
                        </div>
                    </div>
                </div>
            </li>
            <li class="right-entry-item">
                <a href="#" class="right-entry-holder">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="right-entry-icon">
                        <path d="M15.435 17.7717H4.567C2.60143 17.7717 1 16.1723 1 14.2047V5.76702C1 3.80144 2.59942 2.20001 4.567 2.20001H15.433C17.3986 2.20001 19 3.79943 19 5.76702V14.2047C19.002 16.1703 17.4006 17.7717 15.435 17.7717ZM4.567 4.00062C3.59327 4.00062 2.8006 4.79328 2.8006 5.76702V14.2047C2.8006 15.1784 3.59327 15.9711 4.567 15.9711H15.433C16.4067 15.9711 17.1994 15.1784 17.1994 14.2047V5.76702C17.1994 4.79328 16.4067 4.00062 15.433 4.00062H4.567Z" fill="currentColor"></path><path d="M9.99943 11.2C9.51188 11.2 9.02238 11.0667 8.59748 10.8019L8.5407 10.7635L4.3329 7.65675C3.95304 7.37731 3.88842 6.86226 4.18996 6.50976C4.48954 6.15544 5.0417 6.09699 5.4196 6.37643L9.59412 9.45943C9.84279 9.60189 10.1561 9.60189 10.4067 9.45943L14.5812 6.37643C14.9591 6.09699 15.5113 6.15544 15.8109 6.50976C16.1104 6.86409 16.0478 7.37731 15.6679 7.65675L11.4014 10.8019C10.9765 11.0667 10.487 11.2 9.99943 11.2Z" fill="currentColor"></path>
                    </svg>
                    <span class="right-entry-text">Message</span>
                </a>
            </li>
            <li class="right-entry-item">
                <a href="#" class="right-entry-holder">
                    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" class="right-entry-icon">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10 1.74286C5.02955 1.74286 1 5.7724 1 10.7429C1 15.7133 5.02955 19.7429 10 19.7429C14.9705 19.7429 19 15.7133 19 10.7429C19 5.7724 14.9705 1.74286 10 1.74286ZM10.0006 3.379C14.0612 3.379 17.3642 6.68282 17.3642 10.7426C17.3642 14.8033 14.0612 18.1063 10.0006 18.1063C5.93996 18.1063 2.63696 14.8033 2.63696 10.7426C2.63696 6.68282 5.93996 3.379 10.0006 3.379Z" fill="currentColor"></path><path d="M9.99985 6.6521V10.743" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path><path d="M12.4545 10.7427H10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path>
                    </svg>
                    <span class="right-entry-text">History</span>
                </a>
            </li>
            <li class="right-entry-item">
                <a class="upload-entry" href="/editor.html">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="upload-entry-icon">
                        <path d="M12.0824 10H14.1412C15.0508 10 15.7882 10.7374 15.7882 11.6471V12.8824C15.7882 13.792 15.0508 14.5294 14.1412 14.5294H3.84707C2.93743 14.5294 2.20001 13.792 2.20001 12.8824V11.6471C2.20001 10.7374 2.93743 10 3.84707 10H5.90589" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.99413 11.2353L8.99413 3.82353" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12.0823 6.29413L8.9941 3.20589L5.90587 6.29413" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                    <span class="upload-entry-text">${option}</span>
                </a>
            </li>
        </ul>
    </div>
`;
