(()=>{var e,t,r={},n={};function o(e){var t=n[e];if(void 0!==t)return t.exports;var a=n[e]={exports:{}};return r[e](a,a.exports,o),a.exports}o.m=r,o.d=(e,t)=>{for(var r in t)o.o(t,r)&&!o.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},o.f={},o.e=e=>Promise.all(Object.keys(o.f).reduce(((t,r)=>(o.f[r](e,t),t)),[])),o.u=e=>e+".js",o.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),o.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),e={},t="shaderlab:",o.l=(r,n,a,i)=>{if(e[r])e[r].push(n);else{var d,l;if(void 0!==a)for(var u=document.getElementsByTagName("script"),c=0;c<u.length;c++){var s=u[c];if(s.getAttribute("src")==r||s.getAttribute("data-webpack")==t+a){d=s;break}}d||(l=!0,(d=document.createElement("script")).charset="utf-8",d.timeout=120,o.nc&&d.setAttribute("nonce",o.nc),d.setAttribute("data-webpack",t+a),d.src=r),e[r]=[n];var p=(t,n)=>{d.onerror=d.onload=null,clearTimeout(b);var o=e[r];if(delete e[r],d.parentNode&&d.parentNode.removeChild(d),o&&o.forEach((e=>e(n))),t)return t(n)},b=setTimeout(p.bind(null,void 0,{type:"timeout",target:d}),12e4);d.onerror=p.bind(null,d.onerror),d.onload=p.bind(null,d.onload),l&&document.head.appendChild(d)}},o.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;o.g.importScripts&&(e=o.g.location+"");var t=o.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var r=t.getElementsByTagName("script");r.length&&(e=r[r.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),o.p=e+"../../../"})(),(()=>{var e={779:0};o.f.j=(t,r)=>{var n=o.o(e,t)?e[t]:void 0;if(0!==n)if(n)r.push(n[2]);else{var a=new Promise(((r,o)=>n=e[t]=[r,o]));r.push(n[2]=a);var i=o.p+o.u(t),d=new Error;o.l(i,(r=>{if(o.o(e,t)&&(0!==(n=e[t])&&(e[t]=void 0),n)){var a=r&&("load"===r.type?"missing":r.type),i=r&&r.target&&r.target.src;d.message="Loading chunk "+t+" failed.\n("+a+": "+i+")",d.name="ChunkLoadError",d.type=a,d.request=i,n[1](d)}}),"chunk-"+t,t)}};var t=(t,r)=>{var n,a,[i,d,l]=r,u=0;if(i.some((t=>0!==e[t]))){for(n in d)o.o(d,n)&&(o.m[n]=d[n]);l&&l(o)}for(t&&t(r);u<i.length;u++)a=i[u],o.o(e,a)&&e[a]&&e[a][0](),e[a]=0},r=self.webpackChunkshaderlab=self.webpackChunkshaderlab||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))})();let a=localStorage.getItem("token");a&&(window.location.href="home.html"),window.onload=()=>{o.e(996).then(o.bind(o,996)).then((({background:e,navigate:t,panel:r})=>{document.body.insertAdjacentHTML("beforeend",e),o.e(649).then(o.bind(o,649)).then((({lazyLoadFeature:e})=>e())),document.body.insertAdjacentHTML("beforeend",r),o.e(843).then(o.bind(o,843)).then((({userFeature:e})=>e(a))),document.body.insertAdjacentHTML("beforeend",t)}))}})();