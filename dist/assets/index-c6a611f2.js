import{J as G,K as Y,k as b,l as E,m as $,x as f,L as q,N as V,o as U,n as K}from"./core-373882a2.js";import{_ as a}from"./index-4a61b4de.js";const w={getSpacingStyles(e,t){if(Array.isArray(e))return e[t]?`var(--wui-spacing-${e[t]})`:void 0;if(typeof e=="string")return`var(--wui-spacing-${e})`},getFormattedDate(e){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(e)},getHostName(e){try{return new URL(e).hostname}catch{return""}},getTruncateString({string:e,charsStart:t,charsEnd:i,truncate:o}){return e.length<=t+i?e:o==="end"?`${e.substring(0,t)}...`:o==="start"?`...${e.substring(e.length-i)}`:`${e.substring(0,Math.floor(t))}...${e.substring(e.length-Math.floor(i))}`},generateAvatarColors(e){const i=e.toLowerCase().replace(/^0x/iu,"").replace(/[^a-f0-9]/gu,"").substring(0,6).padEnd(6,"0"),o=this.hexToRgb(i),n=getComputedStyle(document.documentElement).getPropertyValue("--w3m-border-radius-master"),s=100-3*Number(n?.replace("px","")),c=`${s}% ${s}% at 65% 40%`,u=[];for(let p=0;p<5;p+=1){const g=this.tintColor(o,.15*p);u.push(`rgb(${g[0]}, ${g[1]}, ${g[2]})`)}return`
    --local-color-1: ${u[0]};
    --local-color-2: ${u[1]};
    --local-color-3: ${u[2]};
    --local-color-4: ${u[3]};
    --local-color-5: ${u[4]};
    --local-radial-circle: ${c}
   `},hexToRgb(e){const t=parseInt(e,16),i=t>>16&255,o=t>>8&255,n=t&255;return[i,o,n]},tintColor(e,t){const[i,o,n]=e,r=Math.round(i+(255-i)*t),s=Math.round(o+(255-o)*t),c=Math.round(n+(255-n)*t);return[r,s,c]},isNumber(e){return{number:/^[0-9]+$/u}.number.test(e)},getColorTheme(e){return e||(typeof window<"u"&&window.matchMedia?window.matchMedia("(prefers-color-scheme: dark)")?.matches?"dark":"light":"dark")},splitBalance(e){const t=e.split(".");return t.length===2?[t[0],t[1]]:["0","00"]},roundNumber(e,t,i){return e.toString().length>=t?Number(e).toFixed(i):e},formatNumberToLocalString(e,t=2){return e===void 0?"0.00":typeof e=="number"?e.toLocaleString("en-US",{maximumFractionDigits:t,minimumFractionDigits:t}):parseFloat(e).toLocaleString("en-US",{maximumFractionDigits:t,minimumFractionDigits:t})}};function X(e,t){const{kind:i,elements:o}=t;return{kind:i,elements:o,finisher(n){customElements.get(e)||customElements.define(e,n)}}}function Z(e,t){return customElements.get(e)||customElements.define(e,t),t}function T(e){return function(i){return typeof i=="function"?Z(e,i):X(e,i)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const J={attribute:!0,type:String,converter:G,reflect:!1,hasChanged:Y},Q=(e=J,t,i)=>{const{kind:o,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(r===void 0&&globalThis.litPropertyMetadata.set(n,r=new Map),o==="setter"&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),o==="accessor"){const{name:s}=i;return{set(c){const u=t.get.call(this);t.set.call(this,c),this.requestUpdate(s,u,e)},init(c){return c!==void 0&&this.C(s,void 0,e,c),c}}}if(o==="setter"){const{name:s}=i;return function(c){const u=this[s];t.call(this,c),this.requestUpdate(s,u,e)}}throw Error("Unsupported decorator location: "+o)};function l(e){return(t,i)=>typeof i=="object"?Q(e,t,i):((o,n,r)=>{const s=n.hasOwnProperty(r);return n.constructor.createProperty(r,o),s?Object.getOwnPropertyDescriptor(n,r):void 0})(e,t,i)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function Et(e){return l({...e,state:!0,attribute:!1})}const tt=b`
  :host {
    display: flex;
    width: inherit;
    height: inherit;
  }
`;var _=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let d=class extends ${render(){return this.style.cssText=`
      flex-direction: ${this.flexDirection};
      flex-wrap: ${this.flexWrap};
      flex-basis: ${this.flexBasis};
      flex-grow: ${this.flexGrow};
      flex-shrink: ${this.flexShrink};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};
      padding-top: ${this.padding&&w.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&w.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&w.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&w.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&w.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&w.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&w.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&w.getSpacingStyles(this.margin,3)};
    `,f`<slot></slot>`}};d.styles=[E,tt];_([l()],d.prototype,"flexDirection",void 0);_([l()],d.prototype,"flexWrap",void 0);_([l()],d.prototype,"flexBasis",void 0);_([l()],d.prototype,"flexGrow",void 0);_([l()],d.prototype,"flexShrink",void 0);_([l()],d.prototype,"alignItems",void 0);_([l()],d.prototype,"justifyContent",void 0);_([l()],d.prototype,"columnGap",void 0);_([l()],d.prototype,"rowGap",void 0);_([l()],d.prototype,"gap",void 0);_([l()],d.prototype,"padding",void 0);_([l()],d.prototype,"margin",void 0);d=_([T("wui-flex")],d);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Tt=e=>e??q;/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const et=e=>e===null||typeof e!="object"&&typeof e!="function",it=e=>e.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const W={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},N=e=>(...t)=>({_$litDirective$:e,values:t});let H=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,i,o){this._$Ct=t,this._$AM=i,this._$Ci=o}_$AS(t,i){return this.update(t,i)}update(t,i){return this.render(...i)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const x=(e,t)=>{const i=e._$AN;if(i===void 0)return!1;for(const o of i)o._$AO?.(t,!1),x(o,t);return!0},I=e=>{let t,i;do{if((t=e._$AM)===void 0)break;i=t._$AN,i.delete(e),e=t}while(i?.size===0)},F=e=>{for(let t;t=e._$AM;e=t){let i=t._$AN;if(i===void 0)t._$AN=i=new Set;else if(i.has(e))break;i.add(e),at(t)}};function ot(e){this._$AN!==void 0?(I(this),this._$AM=e,F(this)):this._$AM=e}function rt(e,t=!1,i=0){const o=this._$AH,n=this._$AN;if(n!==void 0&&n.size!==0)if(t)if(Array.isArray(o))for(let r=i;r<o.length;r++)x(o[r],!1),I(o[r]);else o!=null&&(x(o,!1),I(o));else x(this,e)}const at=e=>{e.type==W.CHILD&&(e._$AP??=rt,e._$AQ??=ot)};class nt extends H{constructor(){super(...arguments),this._$AN=void 0}_$AT(t,i,o){super._$AT(t,i,o),F(this),this.isConnected=t._$AU}_$AO(t,i=!0){t!==this.isConnected&&(this.isConnected=t,t?this.reconnected?.():this.disconnected?.()),i&&(x(this,t),I(this))}setValue(t){if(it(this._$Ct))this._$Ct._$AI(t,this);else{const i=[...this._$Ct._$AH];i[this._$Ci]=t,this._$Ct._$AI(i,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class st{constructor(t){this.G=t}disconnect(){this.G=void 0}reconnect(t){this.G=t}deref(){return this.G}}class ct{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??=new Promise(t=>this.Z=t)}resume(){this.Z?.(),this.Y=this.Z=void 0}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const j=e=>!et(e)&&typeof e.then=="function",B=1073741823;class lt extends nt{constructor(){super(...arguments),this._$Cwt=B,this._$Cbt=[],this._$CK=new st(this),this._$CX=new ct}render(...t){return t.find(i=>!j(i))??V}update(t,i){const o=this._$Cbt;let n=o.length;this._$Cbt=i;const r=this._$CK,s=this._$CX;this.isConnected||this.disconnected();for(let c=0;c<i.length&&!(c>this._$Cwt);c++){const u=i[c];if(!j(u))return this._$Cwt=c,u;c<n&&u===o[c]||(this._$Cwt=B,n=0,Promise.resolve(u).then(async p=>{for(;s.get();)await s.get();const g=r.deref();if(g!==void 0){const D=g._$Cbt.indexOf(u);D>-1&&D<g._$Cwt&&(g._$Cwt=D,g.setValue(p))}}))}return V}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}}const ut=N(lt);class dt{constructor(){this.cache=new Map}set(t,i){this.cache.set(t,i)}get(t){return this.cache.get(t)}has(t){return this.cache.has(t)}delete(t){this.cache.delete(t)}clear(){this.cache.clear()}}const C=new dt,_t=b`
  :host {
    display: flex;
    aspect-ratio: var(--local-aspect-ratio);
    color: var(--local-color);
    width: var(--local-width);
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }

  .fallback {
    width: var(--local-width);
    height: var(--local-height);
  }
`;var P=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};const M={add:async()=>(await a(()=>import("./add-e93c2d21.js"),["assets/add-e93c2d21.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).addSvg,allWallets:async()=>(await a(()=>import("./all-wallets-5c1ef13b.js"),["assets/all-wallets-5c1ef13b.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).allWalletsSvg,arrowBottomCircle:async()=>(await a(()=>import("./arrow-bottom-circle-94021125.js"),["assets/arrow-bottom-circle-94021125.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).arrowBottomCircleSvg,appStore:async()=>(await a(()=>import("./app-store-5ad71f9d.js"),["assets/app-store-5ad71f9d.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).appStoreSvg,apple:async()=>(await a(()=>import("./apple-b7583efd.js"),["assets/apple-b7583efd.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).appleSvg,arrowBottom:async()=>(await a(()=>import("./arrow-bottom-12076e63.js"),["assets/arrow-bottom-12076e63.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).arrowBottomSvg,arrowLeft:async()=>(await a(()=>import("./arrow-left-f7f24180.js"),["assets/arrow-left-f7f24180.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).arrowLeftSvg,arrowRight:async()=>(await a(()=>import("./arrow-right-2864c98e.js"),["assets/arrow-right-2864c98e.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).arrowRightSvg,arrowTop:async()=>(await a(()=>import("./arrow-top-368cb536.js"),["assets/arrow-top-368cb536.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).arrowTopSvg,bank:async()=>(await a(()=>import("./bank-9d9c5dfd.js"),["assets/bank-9d9c5dfd.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).bankSvg,browser:async()=>(await a(()=>import("./browser-bde77ce8.js"),["assets/browser-bde77ce8.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).browserSvg,card:async()=>(await a(()=>import("./card-53ce4e48.js"),["assets/card-53ce4e48.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).cardSvg,checkmark:async()=>(await a(()=>import("./checkmark-4257e14a.js"),["assets/checkmark-4257e14a.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).checkmarkSvg,checkmarkBold:async()=>(await a(()=>import("./checkmark-bold-5fdc268a.js"),["assets/checkmark-bold-5fdc268a.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).checkmarkBoldSvg,chevronBottom:async()=>(await a(()=>import("./chevron-bottom-a30a69b8.js"),["assets/chevron-bottom-a30a69b8.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).chevronBottomSvg,chevronLeft:async()=>(await a(()=>import("./chevron-left-0e8eb82f.js"),["assets/chevron-left-0e8eb82f.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).chevronLeftSvg,chevronRight:async()=>(await a(()=>import("./chevron-right-e1a5a2e0.js"),["assets/chevron-right-e1a5a2e0.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).chevronRightSvg,chevronTop:async()=>(await a(()=>import("./chevron-top-f9ab061a.js"),["assets/chevron-top-f9ab061a.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).chevronTopSvg,chromeStore:async()=>(await a(()=>import("./chrome-store-11f4f6df.js"),["assets/chrome-store-11f4f6df.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).chromeStoreSvg,clock:async()=>(await a(()=>import("./clock-f3e72976.js"),["assets/clock-f3e72976.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).clockSvg,close:async()=>(await a(()=>import("./close-3abd55f4.js"),["assets/close-3abd55f4.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).closeSvg,compass:async()=>(await a(()=>import("./compass-91691780.js"),["assets/compass-91691780.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).compassSvg,coinPlaceholder:async()=>(await a(()=>import("./coinPlaceholder-695a158b.js"),["assets/coinPlaceholder-695a158b.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).coinPlaceholderSvg,copy:async()=>(await a(()=>import("./copy-54dd18aa.js"),["assets/copy-54dd18aa.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).copySvg,cursor:async()=>(await a(()=>import("./cursor-e40f69db.js"),["assets/cursor-e40f69db.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).cursorSvg,cursorTransparent:async()=>(await a(()=>import("./cursor-transparent-7fd5f067.js"),["assets/cursor-transparent-7fd5f067.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).cursorTransparentSvg,desktop:async()=>(await a(()=>import("./desktop-9ae408d7.js"),["assets/desktop-9ae408d7.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).desktopSvg,disconnect:async()=>(await a(()=>import("./disconnect-16dd681a.js"),["assets/disconnect-16dd681a.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).disconnectSvg,discord:async()=>(await a(()=>import("./discord-148b9801.js"),["assets/discord-148b9801.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).discordSvg,etherscan:async()=>(await a(()=>import("./etherscan-ea75397c.js"),["assets/etherscan-ea75397c.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).etherscanSvg,extension:async()=>(await a(()=>import("./extension-6bb16c1e.js"),["assets/extension-6bb16c1e.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).extensionSvg,externalLink:async()=>(await a(()=>import("./external-link-8cde2426.js"),["assets/external-link-8cde2426.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).externalLinkSvg,facebook:async()=>(await a(()=>import("./facebook-58c0371d.js"),["assets/facebook-58c0371d.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).facebookSvg,farcaster:async()=>(await a(()=>import("./farcaster-71cd4c6a.js"),["assets/farcaster-71cd4c6a.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).farcasterSvg,filters:async()=>(await a(()=>import("./filters-2e261b0a.js"),["assets/filters-2e261b0a.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).filtersSvg,github:async()=>(await a(()=>import("./github-c707aecb.js"),["assets/github-c707aecb.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).githubSvg,google:async()=>(await a(()=>import("./google-a343ba97.js"),["assets/google-a343ba97.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).googleSvg,helpCircle:async()=>(await a(()=>import("./help-circle-27e26e52.js"),["assets/help-circle-27e26e52.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).helpCircleSvg,image:async()=>(await a(()=>import("./image-60b70f6c.js"),["assets/image-60b70f6c.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).imageSvg,id:async()=>(await a(()=>import("./id-9b753601.js"),["assets/id-9b753601.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).idSvg,infoCircle:async()=>(await a(()=>import("./info-circle-e8990ed6.js"),["assets/info-circle-e8990ed6.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).infoCircleSvg,lightbulb:async()=>(await a(()=>import("./lightbulb-ca3e8dd6.js"),["assets/lightbulb-ca3e8dd6.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).lightbulbSvg,mail:async()=>(await a(()=>import("./mail-49d250e0.js"),["assets/mail-49d250e0.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).mailSvg,mobile:async()=>(await a(()=>import("./mobile-5d000faa.js"),["assets/mobile-5d000faa.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).mobileSvg,more:async()=>(await a(()=>import("./more-40efd519.js"),["assets/more-40efd519.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).moreSvg,networkPlaceholder:async()=>(await a(()=>import("./network-placeholder-868361d4.js"),["assets/network-placeholder-868361d4.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).networkPlaceholderSvg,nftPlaceholder:async()=>(await a(()=>import("./nftPlaceholder-e9433999.js"),["assets/nftPlaceholder-e9433999.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).nftPlaceholderSvg,off:async()=>(await a(()=>import("./off-6c71ce87.js"),["assets/off-6c71ce87.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).offSvg,playStore:async()=>(await a(()=>import("./play-store-abf5020d.js"),["assets/play-store-abf5020d.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).playStoreSvg,plus:async()=>(await a(()=>import("./plus-3308d789.js"),["assets/plus-3308d789.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).plusSvg,qrCode:async()=>(await a(()=>import("./qr-code-27625f02.js"),["assets/qr-code-27625f02.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).qrCodeIcon,recycleHorizontal:async()=>(await a(()=>import("./recycle-horizontal-c591b760.js"),["assets/recycle-horizontal-c591b760.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).recycleHorizontalSvg,refresh:async()=>(await a(()=>import("./refresh-2657bde0.js"),["assets/refresh-2657bde0.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).refreshSvg,search:async()=>(await a(()=>import("./search-3479807a.js"),["assets/search-3479807a.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).searchSvg,send:async()=>(await a(()=>import("./send-5dd705ff.js"),["assets/send-5dd705ff.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).sendSvg,swapHorizontal:async()=>(await a(()=>import("./swapHorizontal-ddc3a449.js"),["assets/swapHorizontal-ddc3a449.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).swapHorizontalSvg,swapHorizontalMedium:async()=>(await a(()=>import("./swapHorizontalMedium-25a76c04.js"),["assets/swapHorizontalMedium-25a76c04.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).swapHorizontalMediumSvg,swapHorizontalBold:async()=>(await a(()=>import("./swapHorizontalBold-aac0d3eb.js"),["assets/swapHorizontalBold-aac0d3eb.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).swapHorizontalBoldSvg,swapHorizontalRoundedBold:async()=>(await a(()=>import("./swapHorizontalRoundedBold-7459ab8f.js"),["assets/swapHorizontalRoundedBold-7459ab8f.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).swapHorizontalRoundedBoldSvg,swapVertical:async()=>(await a(()=>import("./swapVertical-83360128.js"),["assets/swapVertical-83360128.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).swapVerticalSvg,telegram:async()=>(await a(()=>import("./telegram-a7f2481f.js"),["assets/telegram-a7f2481f.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).telegramSvg,threeDots:async()=>(await a(()=>import("./three-dots-26d7f589.js"),["assets/three-dots-26d7f589.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).threeDotsSvg,twitch:async()=>(await a(()=>import("./twitch-ecc5ea8f.js"),["assets/twitch-ecc5ea8f.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).twitchSvg,twitter:async()=>(await a(()=>import("./x-043cfd42.js"),["assets/x-043cfd42.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).xSvg,twitterIcon:async()=>(await a(()=>import("./twitterIcon-0a0959ac.js"),["assets/twitterIcon-0a0959ac.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).twitterIconSvg,verify:async()=>(await a(()=>import("./verify-698e624a.js"),["assets/verify-698e624a.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).verifySvg,verifyFilled:async()=>(await a(()=>import("./verify-filled-db20a649.js"),["assets/verify-filled-db20a649.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).verifyFilledSvg,wallet:async()=>(await a(()=>import("./wallet-8e4386cf.js"),["assets/wallet-8e4386cf.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).walletSvg,walletConnect:async()=>(await a(()=>import("./walletconnect-ca7491e9.js"),["assets/walletconnect-ca7491e9.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).walletConnectSvg,walletConnectLightBrown:async()=>(await a(()=>import("./walletconnect-ca7491e9.js"),["assets/walletconnect-ca7491e9.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).walletConnectLightBrownSvg,walletConnectBrown:async()=>(await a(()=>import("./walletconnect-ca7491e9.js"),["assets/walletconnect-ca7491e9.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).walletConnectBrownSvg,walletPlaceholder:async()=>(await a(()=>import("./wallet-placeholder-88970144.js"),["assets/wallet-placeholder-88970144.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).walletPlaceholderSvg,warningCircle:async()=>(await a(()=>import("./warning-circle-2b6d83aa.js"),["assets/warning-circle-2b6d83aa.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).warningCircleSvg,x:async()=>(await a(()=>import("./x-043cfd42.js"),["assets/x-043cfd42.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).xSvg,info:async()=>(await a(()=>import("./info-3e45cf94.js"),["assets/info-3e45cf94.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).infoSvg,exclamationTriangle:async()=>(await a(()=>import("./exclamation-triangle-f0ce67a9.js"),["assets/exclamation-triangle-f0ce67a9.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).exclamationTriangleSvg,reown:async()=>(await a(()=>import("./reown-logo-8b51c561.js"),["assets/reown-logo-8b51c561.js","assets/core-373882a2.js","assets/index-4a61b4de.js","assets/index-ce6bbdae.css","assets/index.es-3ce3f490.js"])).reownSvg};async function ht(e){if(C.has(e))return C.get(e);const i=(M[e]??M.copy)();return C.set(e,i),i}let m=class extends ${constructor(){super(...arguments),this.size="md",this.name="copy",this.color="fg-300",this.aspectRatio="1 / 1"}render(){return this.style.cssText=`
      --local-color: ${`var(--wui-color-${this.color});`}
      --local-width: ${`var(--wui-icon-size-${this.size});`}
      --local-aspect-ratio: ${this.aspectRatio}
    `,f`${ut(ht(this.name),f`<div class="fallback"></div>`)}`}};m.styles=[E,U,_t];P([l()],m.prototype,"size",void 0);P([l()],m.prototype,"name",void 0);P([l()],m.prototype,"color",void 0);P([l()],m.prototype,"aspectRatio",void 0);m=P([T("wui-icon")],m);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const pt=N(class extends H{constructor(e){if(super(e),e.type!==W.ATTRIBUTE||e.name!=="class"||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(this.st===void 0){this.st=new Set,e.strings!==void 0&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(o=>o!=="")));for(const o in t)t[o]&&!this.nt?.has(o)&&this.st.add(o);return this.render(t)}const i=e.element.classList;for(const o of this.st)o in t||(i.remove(o),this.st.delete(o));for(const o in t){const n=!!t[o];n===this.st.has(o)||this.nt?.has(o)||(n?(i.add(o),this.st.add(o)):(i.remove(o),this.st.delete(o)))}return V}}),gt=b`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .wui-font-medium-400 {
    font-size: var(--wui-font-size-medium);
    font-weight: var(--wui-font-weight-light);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-medium-600 {
    font-size: var(--wui-font-size-medium);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-title-600 {
    font-size: var(--wui-font-size-title);
    letter-spacing: var(--wui-letter-spacing-title);
  }

  .wui-font-title-6-600 {
    font-size: var(--wui-font-size-title-6);
    letter-spacing: var(--wui-letter-spacing-title-6);
  }

  .wui-font-mini-700 {
    font-size: var(--wui-font-size-mini);
    letter-spacing: var(--wui-letter-spacing-mini);
    text-transform: uppercase;
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
    letter-spacing: var(--wui-letter-spacing-large);
  }

  .wui-font-2xl-500,
  .wui-font-2xl-600,
  .wui-font-2xl-700 {
    font-size: var(--wui-font-size-2xl);
    letter-spacing: var(--wui-letter-spacing-2xl);
  }

  .wui-font-paragraph-400,
  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
  }

  .wui-font-small-400,
  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
    letter-spacing: var(--wui-letter-spacing-small);
  }

  .wui-font-tiny-400,
  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
    letter-spacing: var(--wui-letter-spacing-tiny);
  }

  .wui-font-micro-700,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-micro);
    text-transform: uppercase;
  }

  .wui-font-tiny-400,
  .wui-font-small-400,
  .wui-font-medium-400,
  .wui-font-paragraph-400 {
    font-weight: var(--wui-font-weight-light);
  }

  .wui-font-large-700,
  .wui-font-paragraph-700,
  .wui-font-micro-700,
  .wui-font-mini-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-medium-600,
  .wui-font-medium-title-600,
  .wui-font-title-6-600,
  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }

  :host([disabled]) {
    opacity: 0.4;
  }
`;var O=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let y=class extends ${constructor(){super(...arguments),this.variant="paragraph-500",this.color="fg-300",this.align="left",this.lineClamp=void 0}render(){const t={[`wui-font-${this.variant}`]:!0,[`wui-color-${this.color}`]:!0,[`wui-line-clamp-${this.lineClamp}`]:!!this.lineClamp};return this.style.cssText=`
      --local-align: ${this.align};
      --local-color: var(--wui-color-${this.color});
    `,f`<slot class=${pt(t)}></slot>`}};y.styles=[E,gt];O([l()],y.prototype,"variant",void 0);O([l()],y.prototype,"color",void 0);O([l()],y.prototype,"align",void 0);O([l()],y.prototype,"lineClamp",void 0);y=O([T("wui-text")],y);const vt=b`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    background-color: var(--wui-color-gray-glass-020);
    border-radius: var(--local-border-radius);
    border: var(--local-border);
    box-sizing: content-box;
    width: var(--local-size);
    height: var(--local-size);
    min-height: var(--local-size);
    min-width: var(--local-size);
  }

  @supports (background: color-mix(in srgb, white 50%, black)) {
    :host {
      background-color: color-mix(in srgb, var(--local-bg-value) var(--local-bg-mix), transparent);
    }
  }
`;var v=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let h=class extends ${constructor(){super(...arguments),this.size="md",this.backgroundColor="accent-100",this.iconColor="accent-100",this.background="transparent",this.border=!1,this.borderColor="wui-color-bg-125",this.icon="copy"}render(){const t=this.iconSize||this.size,i=this.size==="lg",o=this.size==="xl",n=i?"12%":"16%",r=i?"xxs":o?"s":"3xl",s=this.background==="gray",c=this.background==="opaque",u=this.backgroundColor==="accent-100"&&c||this.backgroundColor==="success-100"&&c||this.backgroundColor==="error-100"&&c||this.backgroundColor==="inverse-100"&&c;let p=`var(--wui-color-${this.backgroundColor})`;return u?p=`var(--wui-icon-box-bg-${this.backgroundColor})`:s&&(p=`var(--wui-color-gray-${this.backgroundColor})`),this.style.cssText=`
       --local-bg-value: ${p};
       --local-bg-mix: ${u||s?"100%":n};
       --local-border-radius: var(--wui-border-radius-${r});
       --local-size: var(--wui-icon-box-size-${this.size});
       --local-border: ${this.borderColor==="wui-color-bg-125"?"2px":"1px"} solid ${this.border?`var(--${this.borderColor})`:"transparent"}
   `,f` <wui-icon color=${this.iconColor} size=${t} name=${this.icon}></wui-icon> `}};h.styles=[E,K,vt];v([l()],h.prototype,"size",void 0);v([l()],h.prototype,"backgroundColor",void 0);v([l()],h.prototype,"iconColor",void 0);v([l()],h.prototype,"iconSize",void 0);v([l()],h.prototype,"background",void 0);v([l({type:Boolean})],h.prototype,"border",void 0);v([l()],h.prototype,"borderColor",void 0);v([l()],h.prototype,"icon",void 0);h=v([T("wui-icon-box")],h);const wt=b`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center center;
    border-radius: inherit;
  }
`;var L=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let S=class extends ${constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0}render(){return this.style.cssText=`
      --local-width: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      --local-height: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      `,f`<img src=${this.src} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};S.styles=[E,U,wt];L([l()],S.prototype,"src",void 0);L([l()],S.prototype,"alt",void 0);L([l()],S.prototype,"size",void 0);S=L([T("wui-image")],S);const ft=b`
  :host {
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--wui-spacing-m);
    padding: 0 var(--wui-spacing-3xs) !important;
    border-radius: var(--wui-border-radius-5xs);
    transition:
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: border-radius, background-color;
  }

  :host > wui-text {
    transform: translateY(5%);
  }

  :host([data-variant='main']) {
    background-color: var(--wui-color-accent-glass-015);
    color: var(--wui-color-accent-100);
  }

  :host([data-variant='shade']) {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-200);
  }

  :host([data-variant='success']) {
    background-color: var(--wui-icon-box-bg-success-100);
    color: var(--wui-color-success-100);
  }

  :host([data-variant='error']) {
    background-color: var(--wui-icon-box-bg-error-100);
    color: var(--wui-color-error-100);
  }

  :host([data-size='lg']) {
    padding: 11px 5px !important;
  }

  :host([data-size='lg']) > wui-text {
    transform: translateY(2%);
  }
`;var z=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let R=class extends ${constructor(){super(...arguments),this.variant="main",this.size="lg"}render(){this.dataset.variant=this.variant,this.dataset.size=this.size;const t=this.size==="md"?"mini-700":"micro-700";return f`
      <wui-text data-variant=${this.variant} variant=${t} color="inherit">
        <slot></slot>
      </wui-text>
    `}};R.styles=[E,ft];z([l()],R.prototype,"variant",void 0);z([l()],R.prototype,"size",void 0);R=z([T("wui-tag")],R);const mt=b`
  :host {
    display: flex;
  }

  :host([data-size='sm']) > svg {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) > svg {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) > svg {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) > svg {
    width: 32px;
    height: 32px;
  }

  svg {
    animation: rotate 2s linear infinite;
  }

  circle {
    fill: none;
    stroke: var(--local-color);
    stroke-width: 4px;
    stroke-dasharray: 1, 124;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  :host([data-size='md']) > svg > circle {
    stroke-width: 6px;
  }

  :host([data-size='sm']) > svg > circle {
    stroke-width: 8px;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 124;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 90, 124;
      stroke-dashoffset: -35;
    }

    100% {
      stroke-dashoffset: -125;
    }
  }
`;var k=globalThis&&globalThis.__decorate||function(e,t,i,o){var n=arguments.length,r=n<3?t:o===null?o=Object.getOwnPropertyDescriptor(t,i):o,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")r=Reflect.decorate(e,t,i,o);else for(var c=e.length-1;c>=0;c--)(s=e[c])&&(r=(n<3?s(r):n>3?s(t,i,r):s(t,i))||r);return n>3&&r&&Object.defineProperty(t,i,r),r};let A=class extends ${constructor(){super(...arguments),this.color="accent-100",this.size="lg"}render(){return this.style.cssText=`--local-color: ${this.color==="inherit"?"inherit":`var(--wui-color-${this.color})`}`,this.dataset.size=this.size,f`<svg viewBox="25 25 50 50">
      <circle r="20" cy="50" cx="50"></circle>
    </svg>`}};A.styles=[E,mt];k([l()],A.prototype,"color",void 0);k([l()],A.prototype,"size",void 0);A=k([T("wui-loading-spinner")],A);export{w as U,pt as a,T as c,N as e,nt as f,l as n,Tt as o,Et as r};
//# sourceMappingURL=index-c6a611f2.js.map
