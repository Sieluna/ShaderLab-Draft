"use strict";(self.webpackChunkshaderlab=self.webpackChunkshaderlab||[]).push([[805],{8805:(t,e,a)=>{a.r(e),a.d(e,{userFeature:()=>h});const r=document.querySelector("sl-nav").shadowRoot,l=r.querySelector(".sl-nav__bar .right-entry-item:first-child"),o=r.querySelectorAll(".sl-nav__bar .avatar-container"),s=r.querySelectorAll(".sl-nav__bar .login-entry"),n=r.querySelector(".sl-nav__bar .avatar-bottom"),i=r.querySelector(".sl-nav__bar .left-entry-item .avatar-container"),u=r.querySelector(".sl-nav__bar .right-entry-item .avatar-container"),c=r.querySelectorAll(".sl-nav__bar .avatar-container img"),A=r.querySelector(".sl-nav__bar .avatar-bottom .userinfo-name"),b=r.querySelector(".sl-nav__bar .avatar-bottom .userinfo-logout");let d=!0,y=-1,v=!0;const m=(t,e)=>{if(null==e)return!1;let a=e.parentNode;do{if(t===a)return!0;a=a.parentNode}while(a);return!1},p=t=>{v&&(u.querySelector(".user-entry-large").setAttribute("style","visibility: visible"),v=!1),!m(u,t.relatedTarget)&&t.target===u&&d&&(d=!1,u.setAttribute("class","avatar-container large-avatar"),n.setAttribute("class","avatar-bottom"),n.setAttribute("style","padding-top: 8px;"),setTimeout((()=>d=!0),300))},g=t=>{!m(l,t.relatedTarget)&&y<0&&(d?(d=!1,u.setAttribute("class","avatar-container small-avatar"),n.setAttribute("class","avatar-bottom avatar-bottom-transition"),setTimeout((()=>{n.setAttribute("style","padding-top: 8px; display: none"),d=!0}),300)):y=setTimeout((()=>{y=-1,g(t)}),300))},h=(t,e)=>{t&&e&&(A.textContent=e.name,c.forEach((t=>{t.src=e.avatar??"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN89B8AAskB44g04okAAAAASUVORK5CYII="})),b.addEventListener("click",(()=>{localStorage.removeItem("user"),localStorage.removeItem("token"),location.reload()}))),window.innerWidth<800?(i.setAttribute("style","display: block"),u.setAttribute("style","display: none")):(i.setAttribute("style","display: none"),u.setAttribute("style","display: block")),null!=t?(s.forEach((t=>t.setAttribute("style","display: none"))),o.forEach(((t,e)=>{t.setAttribute("style","display: block"),e>0&&u.addEventListener("mouseover",p)})),l.addEventListener("mouseout",g)):(s.forEach((t=>{t.setAttribute("style","display: block"),t.addEventListener("click",(()=>{window.location.href="login.html"}))})),o.forEach((t=>t.setAttribute("style","display: none"))))}}}]);