"use strict";(self.webpackChunkshaderlab=self.webpackChunkshaderlab||[]).push([[347],{6231:(r,n,e)=>{e.d(n,{Z:()=>l});var o=e(8081),i=e.n(o),t=e(3645),d=e.n(t)()(i());d.push([r.id,':host {\r\n    display: grid;\r\n    overflow: hidden;\r\n}\r\n\r\n.sl-editor__renderer {\r\n    grid-area: view;\r\n}\r\n\r\n#sl-editor__workflow {\r\n    grid-area: work;\r\n}\r\n\r\n.sl-editor__module {\r\n    grid-area: mode;\r\n}\r\n\r\n.sl-editor__pipeline {\r\n    grid-area: pipe;\r\n}\r\n\r\n.sl-editor__code {\r\n    grid-area: editor;\r\n}\r\n\r\n@media (max-width: 479.98px) {\r\n    :host {\r\n        grid-template-areas:\r\n            "pipe work"\r\n            "view view"\r\n            "editor editor";\r\n        grid-template-columns: 1fr 3fr;\r\n        grid-template-rows: clamp(150px, 25vh, 250px) clamp(150px, 25vh, 250px) 100vh;\r\n    }\r\n}\r\n\r\n@media (min-width: 480px) and (max-width: 799.98px) {\r\n    :host {\r\n        grid-template-areas:\r\n            "view pipe work"\r\n            "editor editor editor";\r\n        grid-template-columns: 2fr 0.4fr 1.7fr;\r\n    }\r\n}\r\n\r\n@media (min-width: 800px) and (max-width: 1099.98px) {\r\n    :host {\r\n        grid-template-areas:\r\n            "view view editor"\r\n            "mode mode editor"\r\n            "pipe work editor";\r\n        grid-template-columns: 0.5fr 1.7fr 2.1fr;\r\n        grid-template-rows: minmax(28vw, 1fr) 120px 1fr;\r\n        margin: 10px 4px;\r\n        max-width: 1300px;\r\n        max-height: 750px;\r\n        height: calc(100vh - 75px);\r\n        border-radius: 10px;\r\n        border: 1px solid var(--graph_bg_thick);\r\n        box-shadow: 1px 1px 2px var(--graph_weak);\r\n    }\r\n}\r\n\r\n@media (min-width: 1100px) and (max-height: 749.98px) {\r\n    :host {\r\n        grid-template-areas:\r\n            "mode view editor"\r\n            "pipe work editor";\r\n        grid-template-columns: 0.5fr 1.8fr 2fr;\r\n        grid-template-rows: clamp(270px, 22vw, 310px) 1fr;\r\n        margin: 10px auto;\r\n        max-width: 1300px;\r\n        max-height: 850px;\r\n        height: calc(100vh - 75px);\r\n        border-radius: 10px;\r\n        border: 1px solid var(--graph_bg_thick);\r\n        box-shadow: 1px 1px 4px var(--graph_weak);\r\n    }\r\n}\r\n\r\n@media (min-width: 1100px) and (min-height: 750px) {\r\n    :host {\r\n        grid-template-areas:\r\n            "view view editor"\r\n            "mode mode editor"\r\n            "pipe work editor";\r\n        grid-template-columns: 0.5fr 1.7fr 2.1fr;\r\n        grid-template-rows: clamp(300px, 25vw, 350px) 120px 1fr;\r\n        margin: 10px auto;\r\n        max-width: 1300px;\r\n        max-height: 850px;\r\n        height: calc(100vh - 75px);\r\n        border-radius: 10px;\r\n        border: 1px solid var(--graph_bg_thick);\r\n        box-shadow: 1px 1px 2px var(--graph_weak);\r\n    }\r\n}\r\n',""]);var a=new CSSStyleSheet;a.replaceSync(d.toString());const l=a},5804:(r,n,e)=>{e.d(n,{Z:()=>l});var o=e(8081),i=e.n(o),t=e(3645),d=e.n(t)()(i());d.push([r.id,".sl-editor__code {\r\n    display: flex;\r\n    flex-direction: column;\r\n    border-radius: 0 10px 10px 0;\r\n    height: calc(100vh - 120px + 43px);\r\n}\r\n\r\n.sl-editor__code .title {\r\n    line-height: 40px;\r\n    padding: 0 20px 0 20px;\r\n}\r\n\r\n.sl-editor__code .post-input {\r\n    overflow: hidden;\r\n    border: none;\r\n    outline: none;\r\n    width: 100%;\r\n    box-shadow: none;\r\n}\r\n\r\n.sl-editor__code #panel {\r\n    flex: 1;\r\n    margin: 0 3px 3px 3px;\r\n    height: calc(100% - 120px);\r\n    border-radius: 10px;\r\n}\r\n\r\n.sl-editor__code #panel > div {\r\n    height: 100%;\r\n}\r\n\r\n@media (min-width: 800px) and (max-width: 1099.98px) {\r\n    .sl-editor__code {\r\n        max-height: 750px;\r\n    }\r\n}\r\n\r\n@media (min-width: 1100px) {\r\n    .sl-editor__code {\r\n        max-height: 850px;\r\n    }\r\n}\r\n\r\n/* CM internal */\r\n.cm-editor {\r\n    height: 100%;\r\n    border-radius: 5px 5px 12px 12px;\r\n}\r\n\r\n.cm-scroller {\r\n    overflow-y: scroll;\r\n}\r\n\r\n.cm-scroller::-webkit-scrollbar {\r\n    width: 6px;\r\n    background-color: var(--graph_bg_regular)\r\n}\r\n\r\n.cm-scroller::-webkit-scrollbar-thumb {\r\n    border-radius: 5px;\r\n    background: var(--graph_weak);\r\n}\r\n\r\n.cm-panels.cm-panels-bottom {\r\n    border-radius: 0 0 12px 12px;\r\n}\r\n\r\n.cm-editor.cm-focused {\r\n    outline: 1px solid #e6e8e5;\r\n}\r\n\r\n.cm-panels-bottom .cm-panel {\r\n    background: rgb(255, 255, 255);\r\n    display: flex;\r\n    justify-content: space-between;\r\n    line-height: 28px;\r\n    font-size: 14px;\r\n}\r\n\r\n.cm-panels-bottom .cm-panel .cm-count {\r\n    margin: 3px 0 0 18px;\r\n}\r\n\r\n.cm-panels-bottom .cm-panel .cm-compile {\r\n    margin: 3px 18px 0 0;\r\n    border: 1px solid rgb(204, 204, 204);\r\n    border-radius: 10px;\r\n    width: 75px;\r\n    cursor: pointer;\r\n    text-align: center;\r\n}\r\n",""]);var a=new CSSStyleSheet;a.replaceSync(d.toString());const l=a},596:(r,n,e)=>{e.d(n,{Z:()=>l});var o=e(8081),i=e.n(o),t=e(3645),d=e.n(t)()(i());d.push([r.id,".workflow-btn {\r\n    float: right;\r\n    position: absolute;\r\n    display: flex;\r\n    font-size: 16px;\r\n    color: var(--text_white);\r\n    background: var(--graph_weak);\r\n    border-radius: 4px;\r\n    border-right: 1px solid var(--line_bold);\r\n    z-index: 5;\r\n}\r\n\r\n.workflow-btn:hover {\r\n    background: var(--graph_medium);\r\n}\r\n\r\n.workflow-lock {\r\n    bottom: 10px;\r\n    right: 100px;\r\n    padding: 4px 8px;\r\n    cursor: pointer;\r\n}\r\n\r\n.workflow-zoom {\r\n    bottom: 10px;\r\n    right: 10px;\r\n    padding: 4px 10px;\r\n}\r\n\r\n.workflow-btn svg {\r\n    font-size: inherit;\r\n    height: 1em;\r\n    vertical-align: -0.125em;\r\n    color: var(--graph_white);\r\n}\r\n\r\n.workflow-btn .lock {\r\n    width: 0.875em;\r\n}\r\n\r\n.workflow-btn .unlock {\r\n    width: 1.125em;\r\n}\r\n\r\n.workflow-btn .minus {\r\n    width: 1em;\r\n    cursor: pointer;\r\n}\r\n\r\n.workflow-btn .fit {\r\n    width: 1em;\r\n    padding-left: 8px;\r\n    cursor: pointer;\r\n}\r\n\r\n.workflow-btn .plus {\r\n    width: 1em;\r\n    padding-left: 8px;\r\n    cursor: pointer;\r\n}\r\n\r\n#sl-editor__workflow {\r\n    position: relative;\r\n    width: 100%;\r\n    height: 100%;\r\n    background-size: 25px 25px;\r\n    background-image: linear-gradient(to right, #f1f1f1 1px, transparent 1px),\r\n                      linear-gradient(to bottom, #f1f1f1 1px, transparent 1px);\r\n}\r\n\r\n.parent-drawflow {\r\n    display: flex;\r\n    overflow: hidden;\r\n    touch-action: none;\r\n    outline:none;\r\n}\r\n\r\n.drawflow {\r\n    width: 100%;\r\n    height: 100%;\r\n    position: relative;\r\n    user-select: none;\r\n    perspective: 0;\r\n}\r\n\r\n.drawflow .parent-node {\r\n    position: relative;\r\n}\r\n\r\n.drawflow .drawflow-node {\r\n    display: flex;\r\n    align-items: center;\r\n    position: absolute;\r\n    width: 160px;\r\n    min-height: 40px;\r\n    border-radius:4px;\r\n    color: black;\r\n    z-index: 2;\r\n    background: var(--graph_white);\r\n    border: 1px solid var(--graph_bg_thin);\r\n    box-shadow: 1px 1px 3px lightgray;\r\n}\r\n\r\n.drawflow .drawflow-node.selected {\r\n    background: white;\r\n    border: 1px solid var(--graph_weak);\r\n}\r\n.drawflow .drawflow-node:hover {\r\n    cursor: move;\r\n}\r\n\r\n.drawflow .drawflow-node .inputs,\r\n.drawflow .drawflow-node .outputs {\r\n    width: 0;\r\n}\r\n\r\n.drawflow .drawflow-node .drawflow_content_node {\r\n    width: 100%;\r\n    display: block;\r\n}\r\n\r\n.drawflow .drawflow-node .input,\r\n.drawflow .drawflow-node .output {\r\n    position: relative;\r\n    width: 10px;\r\n    height: 10px;\r\n    background: white;\r\n    border-radius: 50%;\r\n    border: 2px solid #CACACAFF;\r\n    cursor: crosshair;\r\n    z-index: 1;\r\n    margin-bottom: 5px;\r\n}\r\n\r\n.drawflow .drawflow-node .input:hover,\r\n.drawflow .drawflow-node .output:hover {\r\n    background: #4ea9ff;\r\n}\r\n\r\n.drawflow .drawflow-node .input {\r\n    left: -7px;\r\n    top: 2px;\r\n    background: white;\r\n}\r\n\r\n.drawflow .drawflow-node .output {\r\n    right: 7px;\r\n    top: 2px;\r\n}\r\n\r\n.drawflow svg {\r\n    z-index: 0;\r\n    position: absolute;\r\n    overflow: visible !important;\r\n}\r\n\r\n.drawflow .connection {\r\n    position: absolute;\r\n    pointer-events: none;\r\n    aspect-ratio: 1 / 1;\r\n}\r\n\r\n.drawflow .connection .main-path {\r\n    fill: none;\r\n    stroke-width: 2px;\r\n    stroke: #4badea;\r\n    pointer-events: all;\r\n}\r\n\r\n.drawflow .connection .main-path:hover {\r\n    stroke: #077bff;\r\n    cursor: pointer;\r\n}\r\n\r\n.drawflow .connection .main-path.selected {\r\n    stroke: #5bd0b3;\r\n}\r\n\r\n.drawflow .connection .point {\r\n    cursor: move;\r\n    pointer-events: all;\r\n    stroke: var(--graph_medium);\r\n    stroke-width: 2;\r\n    fill: white;\r\n}\r\n\r\n.drawflow .connection .point.selected,\r\n.drawflow .connection .point:hover {\r\n    fill: #4ea9ff;\r\n}\r\n\r\n.drawflow .main-path {\r\n    fill: none;\r\n    stroke-width: 5px;\r\n    stroke: steelblue;\r\n}\r\n\r\n.drawflow-delete {\r\n    position: absolute;\r\n    display: block;\r\n    z-index: 4;\r\n    font-weight: bold;\r\n    text-align: center;\r\n    border-radius: 50%;\r\n    font-family: monospace;\r\n    cursor: pointer;\r\n    width: 18px;\r\n    height: 18px;\r\n    border: 2px solid #6d93aa;\r\n    background: white;\r\n    color: #6d93aa;\r\n    line-height: 18px;\r\n    box-shadow: 1px 1px 3px #6d93aa;\r\n}\r\n\r\n.drawflow > .drawflow-delete {\r\n    width: 18px;\r\n    height: 18px;\r\n    border: 2px solid #75bfa9;\r\n    background: white;\r\n    color: #75bfa9;\r\n    line-height: 18px;\r\n    box-shadow: 1px 1px 3px #75bfa9;\r\n    margin-left: -15px;\r\n    margin-top: 15px;\r\n}\r\n\r\n.parent-node .drawflow-delete {\r\n    right: -15px;\r\n    top: -15px;\r\n}\r\n\r\n.drawflow-node .title-box {\r\n    height: 45px;\r\n    line-height: 45px;\r\n    background: var(--graph_bg_thin);\r\n    border-bottom: 1px solid #e9e9e9;\r\n    border-radius: 4px 4px 0 0;\r\n    padding-left: 10px;\r\n}\r\n\r\n.drawflow .title-box img {\r\n    display: inline-block;\r\n    position: initial;\r\n    font-size: inherit;\r\n    width: 1.25em;\r\n    height: 1em;\r\n    overflow: visible;\r\n    vertical-align: -0.125em;\r\n}\r\n\r\n.drawflow .drawflow-node.selected .title-box {\r\n    color: #22598c;\r\n}\r\n\r\n.drawflow-node .title-box .custom {\r\n    font-family: inherit;\r\n    width: calc(100% - 20px - 1em);\r\n    border: none;\r\n    outline: none;\r\n    background: var(--graph_bg_thin);\r\n    line-height: 28px;\r\n    font-size: 16px;\r\n}\r\n\r\n.drawflow-node .box {\r\n    padding: 12px 14px 16px;\r\n    font-size: 14px;\r\n    color: #555555;\r\n}\r\n\r\n.drawflow-node .box p {\r\n    margin: 5px 0;\r\n}\r\n\r\n.drawflow-node .box .buffer-container {\r\n    width: calc(100% - 4px);\r\n    border-radius: 5px;\r\n    border: 1px solid var(--line_bold);\r\n}\r\n\r\n.drawflow-node .box .buffer {\r\n    width: calc(100% - 10px);\r\n    outline: none;\r\n    border: none;\r\n    line-height: 28px;\r\n    font-size: 16px;\r\n    padding: 0 5px;\r\n}\r\n\r\n.drawflow-node .box .image {\r\n    width: 100%;\r\n    aspect-ratio: 1 / 1;\r\n}\r\n",""]);var a=new CSSStyleSheet;a.replaceSync(d.toString());const l=a},4034:(r,n,e)=>{e.d(n,{Z:()=>l});var o=e(8081),i=e.n(o),t=e(3645),d=e.n(t)()(i());d.push([r.id,".sl-editor__module {\r\n}\r\n\r\n.sl-editor__module::-webkit-scrollbar {\r\n    width: 6px;\r\n    height: 6px;\r\n    background-color: var(--graph_bg_regular)\r\n}\r\n\r\n.sl-editor__module::-webkit-scrollbar-thumb {\r\n    border-radius: 5px;\r\n    background: var(--graph_weak);\r\n}\r\n\r\n@media (max-width: 1099.98px) {\r\n    .sl-editor__module {\r\n        overflow-x: scroll;\r\n    }\r\n}\r\n\r\n@media (min-width: 1100px) and (max-height: 749.98px) {\r\n    .sl-editor__module {\r\n        overflow-y: scroll;\r\n    }\r\n}\r\n\r\n@media (min-width: 1100px) and (min-height: 750px) {\r\n    .sl-editor__module {\r\n        overflow-x: scroll;\r\n    }\r\n}\r\n",""]);var a=new CSSStyleSheet;a.replaceSync(d.toString());const l=a},9887:(r,n,e)=>{e.d(n,{Z:()=>l});var o=e(8081),i=e.n(o),t=e(3645),d=e.n(t)()(i());d.push([r.id,".sl-editor__pipeline {\r\n    overflow: hidden;\r\n}\r\n\r\n.sl-editor__pipeline .flow-create {\r\n    border-bottom: 1px solid var(--graph_medium);\r\n    line-height: 38px;\r\n    text-align: center;\r\n    font-weight: bolder;\r\n    cursor: pointer;\r\n    user-select: none;\r\n}\r\n\r\n.sl-editor__pipeline .flow-drag {\r\n    line-height: 40px;\r\n    border-bottom: 1px solid var(--line_bold);\r\n    padding-left: 12px;\r\n    cursor: move;\r\n    user-select: none;\r\n}\r\n\r\n.sl-editor__pipeline .flow-drag img {\r\n    display: inline-block;\r\n    font-size: inherit;\r\n    width: 0.7em;\r\n    height: 0.8em;\r\n    vertical-align: -0.1em;\r\n}\r\n\r\n.sl-editor__pipeline .flow-drag span {\r\n    font-size: inherit;\r\n    padding-left: 5px;\r\n}\r\n\r\n.sl-editor__pipeline .flow-holder {\r\n    height: calc(100% - 39px);\r\n    overflow-y: scroll;\r\n}\r\n\r\n.sl-editor__pipeline .flow-holder::-webkit-scrollbar {\r\n    width: 6px;\r\n    background-color: var(--graph_bg_regular)\r\n}\r\n\r\n.sl-editor__pipeline .flow-holder::-webkit-scrollbar-thumb {\r\n    border-radius: 5px;\r\n    background: var(--graph_weak);\r\n}\r\n",""]);var a=new CSSStyleSheet;a.replaceSync(d.toString());const l=a},6:(r,n,e)=>{e.d(n,{Z:()=>l});var o=e(8081),i=e.n(o),t=e(3645),d=e.n(t)()(i());d.push([r.id,".sl-editor__renderer {\r\n    display: flex;\r\n    flex-direction: column;\r\n}\r\n\r\n.sl-editor__renderer #render-canvas {\r\n    min-width: 200px;\r\n    width: 100%;\r\n    height: calc(100% - 29px);\r\n}\r\n\r\n.sl-editor__renderer .render-info {\r\n    display: flex;\r\n    justify-content: space-between;\r\n    background-color: var(--graph_bg_thin);\r\n}\r\n\r\n.sl-editor__renderer .renderer-state {\r\n    width: 25px;\r\n    height: 25px;\r\n    padding: 2px 15px 2px 15px;\r\n    fill: var(--graph_icon);\r\n}\r\n\r\n.sl-editor__renderer .renderer-time {\r\n    padding: 5px 20px 5px 20px;\r\n}\r\n\r\n.sl-editor__renderer .renderer-fps {\r\n    padding: 5px 20px 5px 20px;\r\n}\r\n\r\n.sl-editor__renderer .renderer-full {\r\n    padding: 5px 20px 5px 20px;\r\n}\r\n\r\n@media (max-width: 1099.98px) {\r\n    .sl-editor__renderer {\r\n        border-radius: 10px 0 0 0;\r\n    }\r\n\r\n    .sl-editor__renderer #render-canvas {\r\n        border-radius: 10px 0 0 0;\r\n    }\r\n}\r\n\r\n@media (min-width: 1100px) {\r\n\r\n}\r\n",""]);var a=new CSSStyleSheet;a.replaceSync(d.toString());const l=a},3645:r=>{r.exports=function(r){var n=[];return n.toString=function(){return this.map((function(n){var e="",o=void 0!==n[5];return n[4]&&(e+="@supports (".concat(n[4],") {")),n[2]&&(e+="@media ".concat(n[2]," {")),o&&(e+="@layer".concat(n[5].length>0?" ".concat(n[5]):""," {")),e+=r(n),o&&(e+="}"),n[2]&&(e+="}"),n[4]&&(e+="}"),e})).join("")},n.i=function(r,e,o,i,t){"string"==typeof r&&(r=[[null,r,void 0]]);var d={};if(o)for(var a=0;a<this.length;a++){var l=this[a][0];null!=l&&(d[l]=!0)}for(var p=0;p<r.length;p++){var s=[].concat(r[p]);o&&d[s[0]]||(void 0!==t&&(void 0===s[5]||(s[1]="@layer".concat(s[5].length>0?" ".concat(s[5]):""," {").concat(s[1],"}")),s[5]=t),e&&(s[2]?(s[1]="@media ".concat(s[2]," {").concat(s[1],"}"),s[2]=e):s[2]=e),i&&(s[4]?(s[1]="@supports (".concat(s[4],") {").concat(s[1],"}"),s[4]=i):s[4]="".concat(i)),n.push(s))}},n}},8081:r=>{r.exports=function(r){return r[1]}},4347:(r,n,e)=>{e.r(n),e.d(n,{EditorElement:()=>p});var o=e(6231),i=e(6),t=e(4034),d=e(9887),a=e(596),l=e(5804);class p extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[o.Z,i.Z,t.Z,d.Z,a.Z,l.Z]}connectedCallback(){this.shadowRoot.innerHTML='\n            <div class="sl-editor__renderer">\n                <canvas id="render-canvas"></canvas>\n                <div class="render-info">\n                    <div class="renderer-state">\n                        <svg width="100%" height="100%" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">\n                            <defs><path id="state-image" d="M 11 10 L 17 10 L 17 26 L 11 26 M 20 10 L 26 10 L 26 26 L 20 26"><animate id="state-animation" begin="indefinite" attributeType="XML" attributeName="d" fill="freeze" from="M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26" to="M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28" dur="0.1s" keySplines=".4 0 1 1" repeatCount="1"/></path></defs>\n                            <use xlink:href="#state-image"></use>\n                            <use xlink:href="#state-image"></use>\n                        </svg>\n                    </div>\n                    <div class="renderer-time">--</div>\n                    <div class="renderer-fps">--fps</div>\n                    <div class="renderer-full">*</div>\n                </div>\n            </div>\n            <div class="sl-editor__module">\n    \n            </div>\n            <div class="sl-editor__pipeline">\n                <div class="flow-create">Create + </div>\n                <diV class="flow-holder"></div>\n            </div>\n            <div id="sl-editor__workflow">\n                <div class="workflow-lock workflow-btn">\n                    <svg class="lock" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">\n                        <path fill="currentColor" d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z"/>\n                    </svg>\n                    <svg class="unlock" style="display: none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">\n                        <path fill="currentColor" d="M423.5 0C339.5.3 272 69.5 272 153.5V224H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48h-48v-71.1c0-39.6 31.7-72.5 71.3-72.9 40-.4 72.7 32.1 72.7 72v80c0 13.3 10.7 24 24 24h32c13.3 0 24-10.7 24-24v-80C576 68 507.5-.3 423.5 0z"/>\n                    </svg>\n                </div>\n                <div class="workflow-zoom workflow-btn">\n                    <svg class="minus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n                        <path fill="currentColor" d="M304 192v32c0 6.6-5.4 12-12 12H124c-6.6 0-12-5.4-12-12v-32c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm201 284.7L476.7 505c-9.4 9.4-24.6 9.4-33.9 0L343 405.3c-4.5-4.5-7-10.6-7-17V372c-35.3 27.6-79.7 44-128 44C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208c0 48.3-16.4 92.7-44 128h16.3c6.4 0 12.5 2.5 17 7l99.7 99.7c9.3 9.4 9.3 24.6 0 34zM344 208c0-75.2-60.8-136-136-136S72 132.8 72 208s60.8 136 136 136 136-60.8 136-136z"/>\n                    </svg>\n                    <svg class="fit" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n                        <path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/>\n                    </svg>\n                    <svg class="plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n                        <path fill="currentColor" d="M304 192v32c0 6.6-5.4 12-12 12h-56v56c0 6.6-5.4 12-12 12h-32c-6.6 0-12-5.4-12-12v-56h-56c-6.6 0-12-5.4-12-12v-32c0-6.6 5.4-12 12-12h56v-56c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v56h56c6.6 0 12 5.4 12 12zm201 284.7L476.7 505c-9.4 9.4-24.6 9.4-33.9 0L343 405.3c-4.5-4.5-7-10.6-7-17V372c-35.3 27.6-79.7 44-128 44C93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208c0 48.3-16.4 92.7-44 128h16.3c6.4 0 12.5 2.5 17 7l99.7 99.7c9.3 9.4 9.3 24.6 0 34zM344 208c0-75.2-60.8-136-136-136S72 132.8 72 208s60.8 136 136 136 136-60.8 136-136z"/>\n                    </svg>\n                </div>\n            </div>\n            <div class="sl-editor__code">\n                <div class="title">\n                    <input class="post-input" type="text" accesskey="t" maxlength="32" placeholder="Enter shader name: My Shader">\n                </div>\n                <div id="panel"></div>\n            </div>\n        '}}customElements.define("sl-editor",p)}}]);