"use strict";(self.webpackChunkshaderlab=self.webpackChunkshaderlab||[]).push([[224],{2224:(e,t,s)=>{s.r(t),s.d(t,{shaderFeature:()=>m});var a=s(1602);const n=document.querySelector("sl-layout").shadowRoot,r=n.querySelector(".sl-layout__holder"),i=n.querySelector(".sl-layout__recommend");let o=JSON.parse(localStorage.getItem("cache"))||{},c={};class d{constructor(e){this.id=e.id,this.name=e.name,this.avatar=e.user.avatar,this.user=e.user.name,this.image=e.preview,this.content=e.content,this.update=e.post_update}prefab(e,t=!0){const s=document.createElement("div");var a;return s.className=e,s.innerHTML=`\n            <a>\n                <div class="shader-preview">\n                    <img src="${this.image}" alt="Preview">\n                    \x3c!--canvas ></canvas--\x3e\n                </div>\n                <div class="shader-bottom">\n                    <img class="shader-avatar" src="${this.avatar}" alt="Avatar">\n                    <div class="shader-text">\n                        <h2 class="shader-name">${this.name}</h2>\n                        ${a=this.user,t?`<div class="shader-user">${a}</div>`:""}\n                    </div>\n                    ${(e=>t?"":`<div class="shader-user">-- ${e}</div>`)(this.user)}\n                </div>\n            </a>`,s}}class l extends d{constructor(e){super(e)}static init(){(0,a.z)("/api/post",{method:"GET"},(e=>{for(let t of e)o[t.id]=new l(t),c[t.id]=o[t.id].prefab("shader-info"),r.append(c[t.id])}))}}class h extends d{constructor(e){super(e)}static init(){(0,a.z)("/api/post/recommend",{method:"GET"},(e=>{if(Symbol.iterator in Object(e))for(let[t,s]of e.entries())o[`Recommend_${s.id}`]=new h(s),c[`Recommend_${s.id}`]=0===t?o[`Recommend_${s.id}`].prefab("shader-info top",!1):o[`Recommend_${s.id}`].prefab("shader-info"),i.append(c[`Recommend_${s.id}`])}))}}const m=()=>{l.init(),h.init()}},1602:(e,t,s)=>{s.d(t,{z:()=>o});var a=s(8492);const n=e=>{let t=e.headers.get("content-type");return t.includes("application/json")?r(e):t.includes("text/html")?i(e):void(0,a.swal)({icon:"error",title:"Oops...",text:`Check ${t}`})},r=e=>e.json().then((t=>{if(e.ok)return t})),i=e=>e.text().then((t=>e.ok?t:((0,a.swal)({icon:"error",title:"Oops...",text:t}),null))),o=(e,t,s)=>fetch(e,t).then(n).then(s).catch((e=>console.log(e)))}}]);