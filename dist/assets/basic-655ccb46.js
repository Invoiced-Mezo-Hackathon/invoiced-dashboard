import{i as B,e as M,r as A,c as T,x as c,j as L,m as S,o as I,E as J,R as O,O as Y,z as kt,f as D,B as _,D as ge,q as qi,W as fe,C as je,g as si,T as ke,l as Qt,M as vi,F as yi,b as At,v as li,d as Hi}from"./core-4b1a5b39.js";import{n as u,c as x,o as y,r as v,U as st,e as Ki,f as Gi,a as Yi}from"./index-d05637e0.js";import{p as Ji}from"./index-8325a550.js";import"./index.es-a3a497b4.js";const Qi=B`
  :host {
    position: relative;
    background-color: var(--wui-color-gray-glass-002);
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--local-size);
    height: var(--local-size);
    border-radius: inherit;
    border-radius: var(--local-border-radius);
  }

  :host > wui-flex {
    overflow: hidden;
    border-radius: inherit;
    border-radius: var(--local-border-radius);
  }

  :host::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-color-gray-glass-010);
    pointer-events: none;
  }

  :host([name='Extension'])::after {
    border: 1px solid var(--wui-color-accent-glass-010);
  }

  :host([data-wallet-icon='allWallets']) {
    background-color: var(--wui-all-wallets-bg-100);
  }

  :host([data-wallet-icon='allWallets'])::after {
    border: 1px solid var(--wui-color-accent-glass-010);
  }

  wui-icon[data-parent-size='inherit'] {
    width: 75%;
    height: 75%;
    align-items: center;
  }

  wui-icon[data-parent-size='sm'] {
    width: 18px;
    height: 18px;
  }

  wui-icon[data-parent-size='md'] {
    width: 24px;
    height: 24px;
  }

  wui-icon[data-parent-size='lg'] {
    width: 42px;
    height: 42px;
  }

  wui-icon[data-parent-size='full'] {
    width: 100%;
    height: 100%;
  }

  :host > wui-icon-box {
    position: absolute;
    overflow: hidden;
    right: -1px;
    bottom: -2px;
    z-index: 1;
    border: 2px solid var(--wui-color-bg-150, #1e1f1f);
    padding: 1px;
  }
`;var xt=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let lt=class extends T{constructor(){super(...arguments),this.size="md",this.name="",this.installed=!1,this.badgeSize="xs"}render(){let t="xxs";return this.size==="lg"?t="m":this.size==="md"?t="xs":t="xxs",this.style.cssText=`
       --local-border-radius: var(--wui-border-radius-${t});
       --local-size: var(--wui-wallet-image-size-${this.size});
   `,this.walletIcon&&(this.dataset.walletIcon=this.walletIcon),c`
      <wui-flex justifyContent="center" alignItems="center"> ${this.templateVisual()} </wui-flex>
    `}templateVisual(){return this.imageSrc?c`<wui-image src=${this.imageSrc} alt=${this.name}></wui-image>`:this.walletIcon?c`<wui-icon
        data-parent-size="md"
        size="md"
        color="inherit"
        name=${this.walletIcon}
      ></wui-icon>`:c`<wui-icon
      data-parent-size=${this.size}
      size="inherit"
      color="inherit"
      name="walletPlaceholder"
    ></wui-icon>`}};lt.styles=[M,A,Qi];xt([u()],lt.prototype,"size",void 0);xt([u()],lt.prototype,"name",void 0);xt([u()],lt.prototype,"imageSrc",void 0);xt([u()],lt.prototype,"walletIcon",void 0);xt([u({type:Boolean})],lt.prototype,"installed",void 0);xt([u()],lt.prototype,"badgeSize",void 0);lt=xt([x("wui-wallet-image")],lt);const Xi=B`
  :host {
    position: relative;
    border-radius: var(--wui-border-radius-xxs);
    width: 40px;
    height: 40px;
    overflow: hidden;
    background: var(--wui-color-gray-glass-002);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--wui-spacing-4xs);
    padding: 3.75px !important;
  }

  :host::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-color-gray-glass-010);
    pointer-events: none;
  }

  :host > wui-wallet-image {
    width: 14px;
    height: 14px;
    border-radius: var(--wui-border-radius-5xs);
  }

  :host > wui-flex {
    padding: 2px;
    position: fixed;
    overflow: hidden;
    left: 34px;
    bottom: 8px;
    background: var(--dark-background-150, #1e1f1f);
    border-radius: 50%;
    z-index: 2;
    display: flex;
  }
`;var xi=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};const We=4;let Xt=class extends T{constructor(){super(...arguments),this.walletImages=[]}render(){const t=this.walletImages.length<We;return c`${this.walletImages.slice(0,We).map(({src:i,walletName:n})=>c`
            <wui-wallet-image
              size="inherit"
              imageSrc=${i}
              name=${y(n)}
            ></wui-wallet-image>
          `)}
      ${t?[...Array(We-this.walletImages.length)].map(()=>c` <wui-wallet-image size="inherit" name=""></wui-wallet-image>`):null}
      <wui-flex>
        <wui-icon-box
          size="xxs"
          iconSize="xxs"
          iconcolor="success-100"
          backgroundcolor="success-100"
          icon="checkmark"
          background="opaque"
        ></wui-icon-box>
      </wui-flex>`}};Xt.styles=[A,Xi];xi([u({type:Array})],Xt.prototype,"walletImages",void 0);Xt=xi([x("wui-all-wallets-image")],Xt);const Zi=B`
  button {
    column-gap: var(--wui-spacing-s);
    padding: 7px var(--wui-spacing-l) 7px var(--wui-spacing-xs);
    width: 100%;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    color: var(--wui-color-fg-100);
  }

  button > wui-text:nth-child(2) {
    display: flex;
    flex: 1;
  }

  button:disabled {
    background-color: var(--wui-color-gray-glass-015);
    color: var(--wui-color-gray-glass-015);
  }

  button:disabled > wui-tag {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-300);
  }

  wui-icon {
    color: var(--wui-color-fg-200) !important;
  }
`;var U=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let k=class extends T{constructor(){super(...arguments),this.walletImages=[],this.imageSrc="",this.name="",this.tabIdx=void 0,this.installed=!1,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor="accent-100"}render(){return c`
      <button ?disabled=${this.disabled} tabindex=${y(this.tabIdx)}>
        ${this.templateAllWallets()} ${this.templateWalletImage()}
        <wui-text variant="paragraph-500" color="inherit">${this.name}</wui-text>
        ${this.templateStatus()}
      </button>
    `}templateAllWallets(){return this.showAllWallets&&this.imageSrc?c` <wui-all-wallets-image .imageeSrc=${this.imageSrc}> </wui-all-wallets-image> `:this.showAllWallets&&this.walletIcon?c` <wui-wallet-image .walletIcon=${this.walletIcon} size="sm"> </wui-wallet-image> `:null}templateWalletImage(){return!this.showAllWallets&&this.imageSrc?c`<wui-wallet-image
        size="sm"
        imageSrc=${this.imageSrc}
        name=${this.name}
        .installed=${this.installed}
      ></wui-wallet-image>`:!this.showAllWallets&&!this.imageSrc?c`<wui-wallet-image size="sm" name=${this.name}></wui-wallet-image>`:null}templateStatus(){return this.loading?c`<wui-loading-spinner
        size="lg"
        color=${this.loadingSpinnerColor}
      ></wui-loading-spinner>`:this.tagLabel&&this.tagVariant?c`<wui-tag variant=${this.tagVariant}>${this.tagLabel}</wui-tag>`:this.icon?c`<wui-icon color="inherit" size="sm" name=${this.icon}></wui-icon>`:null}};k.styles=[A,M,Zi];U([u({type:Array})],k.prototype,"walletImages",void 0);U([u()],k.prototype,"imageSrc",void 0);U([u()],k.prototype,"name",void 0);U([u()],k.prototype,"tagLabel",void 0);U([u()],k.prototype,"tagVariant",void 0);U([u()],k.prototype,"icon",void 0);U([u()],k.prototype,"walletIcon",void 0);U([u()],k.prototype,"tabIdx",void 0);U([u({type:Boolean})],k.prototype,"installed",void 0);U([u({type:Boolean})],k.prototype,"disabled",void 0);U([u({type:Boolean})],k.prototype,"showAllWallets",void 0);U([u({type:Boolean})],k.prototype,"loading",void 0);U([u({type:String})],k.prototype,"loadingSpinnerColor",void 0);k=U([x("wui-list-wallet")],k);var Bt=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let wt=class extends T{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=L.state.connectors,this.count=S.state.count,this.filteredCount=S.state.filteredWallets.length,this.isFetchingRecommendedWallets=S.state.isFetchingRecommendedWallets,this.unsubscribe.push(L.subscribeKey("connectors",t=>this.connectors=t),S.subscribeKey("count",t=>this.count=t),S.subscribeKey("filteredWallets",t=>this.filteredCount=t.length),S.subscribeKey("isFetchingRecommendedWallets",t=>this.isFetchingRecommendedWallets=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){const t=this.connectors.find(l=>l.id==="walletConnect"),{allWallets:i}=Y.state;if(!t||i==="HIDE"||i==="ONLY_MOBILE"&&!I.isMobile())return null;const n=S.state.featured.length,r=this.count+n,e=r<10?r:Math.floor(r/10)*10,a=this.filteredCount>0?this.filteredCount:e;let s=`${a}`;return this.filteredCount>0?s=`${this.filteredCount}`:a<r&&(s=`${a}+`),c`
      <wui-list-wallet
        name="All Wallets"
        walletIcon="allWallets"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${s}
        tagVariant="shade"
        data-testid="all-wallets"
        tabIdx=${y(this.tabIdx)}
        .loading=${this.isFetchingRecommendedWallets}
        loadingSpinnerColor=${this.isFetchingRecommendedWallets?"fg-300":"accent-100"}
      ></wui-list-wallet>
    `}onAllWallets(){J.sendEvent({type:"track",event:"CLICK_ALL_WALLETS"}),O.push("AllWallets")}};Bt([u()],wt.prototype,"tabIdx",void 0);Bt([v()],wt.prototype,"connectors",void 0);Bt([v()],wt.prototype,"count",void 0);Bt([v()],wt.prototype,"filteredCount",void 0);Bt([v()],wt.prototype,"isFetchingRecommendedWallets",void 0);wt=Bt([x("w3m-all-wallets-widget")],wt);var Ke=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let Zt=class extends T{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=L.state.connectors,this.unsubscribe.push(L.subscribeKey("connectors",t=>this.connectors=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){const t=this.connectors.filter(i=>i.type==="ANNOUNCED");return t?.length?c`
      <wui-flex flexDirection="column" gap="xs">
        ${t.filter(kt.showConnector).map(i=>c`
              <wui-list-wallet
                imageSrc=${y(D.getConnectorImage(i))}
                name=${i.name??"Unknown"}
                @click=${()=>this.onConnector(i)}
                tagVariant="success"
                tagLabel="installed"
                data-testid=${`wallet-selector-${i.id}`}
                .installed=${!0}
                tabIdx=${y(this.tabIdx)}
              >
              </wui-list-wallet>
            `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(t){t.id==="walletConnect"?I.isMobile()?O.push("AllWallets"):O.push("ConnectingWalletConnect"):O.push("ConnectingExternal",{connector:t})}};Ke([u()],Zt.prototype,"tabIdx",void 0);Ke([v()],Zt.prototype,"connectors",void 0);Zt=Ke([x("w3m-connect-announced-widget")],Zt);var we=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let zt=class extends T{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=L.state.connectors,this.loading=!1,this.unsubscribe.push(L.subscribeKey("connectors",t=>this.connectors=t)),I.isTelegram()&&I.isIos()&&(this.loading=!_.state.wcUri,this.unsubscribe.push(_.subscribeKey("wcUri",t=>this.loading=!t)))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){const{customWallets:t}=Y.state;if(!t?.length)return this.style.cssText="display: none",null;const i=this.filterOutDuplicateWallets(t);return c`<wui-flex flexDirection="column" gap="xs">
      ${i.map(n=>c`
          <wui-list-wallet
            imageSrc=${y(D.getWalletImage(n))}
            name=${n.name??"Unknown"}
            @click=${()=>this.onConnectWallet(n)}
            data-testid=${`wallet-selector-${n.id}`}
            tabIdx=${y(this.tabIdx)}
            ?loading=${this.loading}
          >
          </wui-list-wallet>
        `)}
    </wui-flex>`}filterOutDuplicateWallets(t){const i=ge.getRecentWallets(),n=this.connectors.map(s=>s.info?.rdns).filter(Boolean),r=i.map(s=>s.rdns).filter(Boolean),e=n.concat(r);if(e.includes("io.metamask.mobile")&&I.isMobile()){const s=e.indexOf("io.metamask.mobile");e[s]="io.metamask"}return t.filter(s=>!e.includes(String(s?.rdns)))}onConnectWallet(t){this.loading||O.push("ConnectingWalletConnect",{wallet:t})}};we([u()],zt.prototype,"tabIdx",void 0);we([v()],zt.prototype,"connectors",void 0);we([v()],zt.prototype,"loading",void 0);zt=we([x("w3m-connect-custom-widget")],zt);var Ge=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let te=class extends T{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=L.state.connectors,this.unsubscribe.push(L.subscribeKey("connectors",t=>this.connectors=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){const n=this.connectors.filter(r=>r.type==="EXTERNAL").filter(kt.showConnector).filter(r=>r.id!==qi.CONNECTOR_ID.COINBASE_SDK);return n?.length?c`
      <wui-flex flexDirection="column" gap="xs">
        ${n.map(r=>c`
            <wui-list-wallet
              imageSrc=${y(D.getConnectorImage(r))}
              .installed=${!0}
              name=${r.name??"Unknown"}
              data-testid=${`wallet-selector-external-${r.id}`}
              @click=${()=>this.onConnector(r)}
              tabIdx=${y(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(t){O.push("ConnectingExternal",{connector:t})}};Ge([u()],te.prototype,"tabIdx",void 0);Ge([v()],te.prototype,"connectors",void 0);te=Ge([x("w3m-connect-external-widget")],te);var Ye=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let ee=class extends T{constructor(){super(...arguments),this.tabIdx=void 0,this.wallets=[]}render(){return this.wallets.length?c`
      <wui-flex flexDirection="column" gap="xs">
        ${this.wallets.map(t=>c`
            <wui-list-wallet
              data-testid=${`wallet-selector-featured-${t.id}`}
              imageSrc=${y(D.getWalletImage(t))}
              name=${t.name??"Unknown"}
              @click=${()=>this.onConnectWallet(t)}
              tabIdx=${y(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnectWallet(t){L.selectWalletConnector(t)}};Ye([u()],ee.prototype,"tabIdx",void 0);Ye([u()],ee.prototype,"wallets",void 0);ee=Ye([x("w3m-connect-featured-widget")],ee);var Je=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let ie=class extends T{constructor(){super(...arguments),this.tabIdx=void 0,this.connectors=[]}render(){const t=this.connectors.filter(kt.showConnector);return t.length===0?(this.style.cssText="display: none",null):c`
      <wui-flex flexDirection="column" gap="xs">
        ${t.map(i=>c`
            <wui-list-wallet
              imageSrc=${y(D.getConnectorImage(i))}
              .installed=${!0}
              name=${i.name??"Unknown"}
              tagVariant="success"
              tagLabel="installed"
              data-testid=${`wallet-selector-${i.id}`}
              @click=${()=>this.onConnector(i)}
              tabIdx=${y(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `}onConnector(t){L.setActiveConnector(t),O.push("ConnectingExternal",{connector:t})}};Je([u()],ie.prototype,"tabIdx",void 0);Je([u()],ie.prototype,"connectors",void 0);ie=Je([x("w3m-connect-injected-widget")],ie);var Qe=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let ne=class extends T{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=L.state.connectors,this.unsubscribe.push(L.subscribeKey("connectors",t=>this.connectors=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){const t=this.connectors.filter(i=>i.type==="MULTI_CHAIN"&&i.name!=="WalletConnect");return t?.length?c`
      <wui-flex flexDirection="column" gap="xs">
        ${t.map(i=>c`
            <wui-list-wallet
              imageSrc=${y(D.getConnectorImage(i))}
              .installed=${!0}
              name=${i.name??"Unknown"}
              tagVariant="shade"
              tagLabel="multichain"
              data-testid=${`wallet-selector-${i.id}`}
              @click=${()=>this.onConnector(i)}
              tabIdx=${y(this.tabIdx)}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnector(t){L.setActiveConnector(t),O.push("ConnectingMultiChain")}};Qe([u()],ne.prototype,"tabIdx",void 0);Qe([v()],ne.prototype,"connectors",void 0);ne=Qe([x("w3m-connect-multi-chain-widget")],ne);var be=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let Dt=class extends T{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=L.state.connectors,this.loading=!1,this.unsubscribe.push(L.subscribeKey("connectors",t=>this.connectors=t)),I.isTelegram()&&I.isIos()&&(this.loading=!_.state.wcUri,this.unsubscribe.push(_.subscribeKey("wcUri",t=>this.loading=!t)))}render(){const i=ge.getRecentWallets().filter(n=>!fe.isExcluded(n)).filter(n=>!this.hasWalletConnector(n)).filter(n=>this.isWalletCompatibleWithCurrentChain(n));return i.length?c`
      <wui-flex flexDirection="column" gap="xs">
        ${i.map(n=>c`
            <wui-list-wallet
              imageSrc=${y(D.getWalletImage(n))}
              name=${n.name??"Unknown"}
              @click=${()=>this.onConnectWallet(n)}
              tagLabel="recent"
              tagVariant="shade"
              tabIdx=${y(this.tabIdx)}
              ?loading=${this.loading}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnectWallet(t){this.loading||L.selectWalletConnector(t)}hasWalletConnector(t){return this.connectors.some(i=>i.id===t.id||i.name===t.name)}isWalletCompatibleWithCurrentChain(t){const i=je.state.activeChain;return i&&t.chains?t.chains.some(n=>{const r=n.split(":")[0];return i===r}):!0}};be([u()],Dt.prototype,"tabIdx",void 0);be([v()],Dt.prototype,"connectors",void 0);be([v()],Dt.prototype,"loading",void 0);Dt=be([x("w3m-connect-recent-widget")],Dt);var me=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let Nt=class extends T{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.wallets=[],this.loading=!1,I.isTelegram()&&I.isIos()&&(this.loading=!_.state.wcUri,this.unsubscribe.push(_.subscribeKey("wcUri",t=>this.loading=!t)))}render(){const{connectors:t}=L.state,{customWallets:i,featuredWalletIds:n}=Y.state,r=ge.getRecentWallets(),e=t.find(E=>E.id==="walletConnect"),s=t.filter(E=>E.type==="INJECTED"||E.type==="ANNOUNCED"||E.type==="MULTI_CHAIN").filter(E=>E.name!=="Browser Wallet");if(!e)return null;if(n||i||!this.wallets.length)return this.style.cssText="display: none",null;const l=s.length+r.length,h=Math.max(0,2-l),p=fe.filterOutDuplicateWallets(this.wallets).slice(0,h);return p.length?c`
      <wui-flex flexDirection="column" gap="xs">
        ${p.map(E=>c`
            <wui-list-wallet
              imageSrc=${y(D.getWalletImage(E))}
              name=${E?.name??"Unknown"}
              @click=${()=>this.onConnectWallet(E)}
              tabIdx=${y(this.tabIdx)}
              ?loading=${this.loading}
            >
            </wui-list-wallet>
          `)}
      </wui-flex>
    `:(this.style.cssText="display: none",null)}onConnectWallet(t){if(this.loading)return;const i=L.getConnector(t.id,t.rdns);i?O.push("ConnectingExternal",{connector:i}):O.push("ConnectingWalletConnect",{wallet:t})}};me([u()],Nt.prototype,"tabIdx",void 0);me([u()],Nt.prototype,"wallets",void 0);me([v()],Nt.prototype,"loading",void 0);Nt=me([x("w3m-connect-recommended-widget")],Nt);var ve=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let Mt=class extends T{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=L.state.connectors,this.connectorImages=si.state.connectorImages,this.unsubscribe.push(L.subscribeKey("connectors",t=>this.connectors=t),si.subscribeKey("connectorImages",t=>this.connectorImages=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){if(I.isMobile())return this.style.cssText="display: none",null;const t=this.connectors.find(n=>n.id==="walletConnect");if(!t)return this.style.cssText="display: none",null;const i=t.imageUrl||this.connectorImages[t?.imageId??""];return c`
      <wui-list-wallet
        imageSrc=${y(i)}
        name=${t.name??"Unknown"}
        @click=${()=>this.onConnector(t)}
        tagLabel="qr code"
        tagVariant="main"
        tabIdx=${y(this.tabIdx)}
        data-testid="wallet-selector-walletconnect"
      >
      </wui-list-wallet>
    `}onConnector(t){L.setActiveConnector(t),O.push("ConnectingWalletConnect")}};ve([u()],Mt.prototype,"tabIdx",void 0);ve([v()],Mt.prototype,"connectors",void 0);ve([v()],Mt.prototype,"connectorImages",void 0);Mt=ve([x("w3m-connect-walletconnect-widget")],Mt);const tn=B`
  :host {
    margin-top: var(--wui-spacing-3xs);
  }
  wui-separator {
    margin: var(--wui-spacing-m) calc(var(--wui-spacing-m) * -1) var(--wui-spacing-xs)
      calc(var(--wui-spacing-m) * -1);
    width: calc(100% + var(--wui-spacing-s) * 2);
  }
`;var Ft=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let bt=class extends T{constructor(){super(),this.unsubscribe=[],this.tabIdx=void 0,this.connectors=L.state.connectors,this.recommended=S.state.recommended,this.featured=S.state.featured,this.unsubscribe.push(L.subscribeKey("connectors",t=>this.connectors=t),S.subscribeKey("recommended",t=>this.recommended=t),S.subscribeKey("featured",t=>this.featured=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return c`
      <wui-flex flexDirection="column" gap="xs"> ${this.connectorListTemplate()} </wui-flex>
    `}connectorListTemplate(){const{custom:t,recent:i,announced:n,injected:r,multiChain:e,recommended:a,featured:s,external:l}=kt.getConnectorsByType(this.connectors,this.recommended,this.featured);return kt.getConnectorTypeOrder({custom:t,recent:i,announced:n,injected:r,multiChain:e,recommended:a,featured:s,external:l}).map(p=>{switch(p){case"injected":return c`
            ${e.length?c`<w3m-connect-multi-chain-widget
                  tabIdx=${y(this.tabIdx)}
                ></w3m-connect-multi-chain-widget>`:null}
            ${n.length?c`<w3m-connect-announced-widget
                  tabIdx=${y(this.tabIdx)}
                ></w3m-connect-announced-widget>`:null}
            ${r.length?c`<w3m-connect-injected-widget
                  .connectors=${r}
                  tabIdx=${y(this.tabIdx)}
                ></w3m-connect-injected-widget>`:null}
          `;case"walletConnect":return c`<w3m-connect-walletconnect-widget
            tabIdx=${y(this.tabIdx)}
          ></w3m-connect-walletconnect-widget>`;case"recent":return c`<w3m-connect-recent-widget
            tabIdx=${y(this.tabIdx)}
          ></w3m-connect-recent-widget>`;case"featured":return c`<w3m-connect-featured-widget
            .wallets=${s}
            tabIdx=${y(this.tabIdx)}
          ></w3m-connect-featured-widget>`;case"custom":return c`<w3m-connect-custom-widget
            tabIdx=${y(this.tabIdx)}
          ></w3m-connect-custom-widget>`;case"external":return c`<w3m-connect-external-widget
            tabIdx=${y(this.tabIdx)}
          ></w3m-connect-external-widget>`;case"recommended":return c`<w3m-connect-recommended-widget
            .wallets=${a}
            tabIdx=${y(this.tabIdx)}
          ></w3m-connect-recommended-widget>`;default:return console.warn(`Unknown connector type: ${p}`),null}})}};bt.styles=tn;Ft([u()],bt.prototype,"tabIdx",void 0);Ft([v()],bt.prototype,"connectors",void 0);Ft([v()],bt.prototype,"recommended",void 0);Ft([v()],bt.prototype,"featured",void 0);bt=Ft([x("w3m-connector-list")],bt);const en=B`
  :host {
    display: inline-flex;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-3xl);
    padding: var(--wui-spacing-3xs);
    position: relative;
    height: 36px;
    min-height: 36px;
    overflow: hidden;
  }

  :host::before {
    content: '';
    position: absolute;
    pointer-events: none;
    top: 4px;
    left: 4px;
    display: block;
    width: var(--local-tab-width);
    height: 28px;
    border-radius: var(--wui-border-radius-3xl);
    background-color: var(--wui-color-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    transform: translateX(calc(var(--local-tab) * var(--local-tab-width)));
    transition: transform var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: background-color, opacity;
  }

  :host([data-type='flex'])::before {
    left: 3px;
    transform: translateX(calc((var(--local-tab) * 34px) + (var(--local-tab) * 4px)));
  }

  :host([data-type='flex']) {
    display: flex;
    padding: 0px 0px 0px 12px;
    gap: 4px;
  }

  :host([data-type='flex']) > button > wui-text {
    position: absolute;
    left: 18px;
    opacity: 0;
  }

  button[data-active='true'] > wui-icon,
  button[data-active='true'] > wui-text {
    color: var(--wui-color-fg-100);
  }

  button[data-active='false'] > wui-icon,
  button[data-active='false'] > wui-text {
    color: var(--wui-color-fg-200);
  }

  button[data-active='true']:disabled,
  button[data-active='false']:disabled {
    background-color: transparent;
    opacity: 0.5;
    cursor: not-allowed;
  }

  button[data-active='true']:disabled > wui-text {
    color: var(--wui-color-fg-200);
  }

  button[data-active='false']:disabled > wui-text {
    color: var(--wui-color-fg-300);
  }

  button > wui-icon,
  button > wui-text {
    pointer-events: none;
    transition: color var(--wui-e ase-out-power-1) var(--wui-duration-md);
    will-change: color;
  }

  button {
    width: var(--local-tab-width);
    transition: background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: background-color;
  }

  :host([data-type='flex']) > button {
    width: 34px;
    position: relative;
    display: flex;
    justify-content: flex-start;
  }

  button:hover:enabled,
  button:active:enabled {
    background-color: transparent !important;
  }

  button:hover:enabled > wui-icon,
  button:active:enabled > wui-icon {
    transition: all var(--wui-ease-out-power-1) var(--wui-duration-lg);
    color: var(--wui-color-fg-125);
  }

  button:hover:enabled > wui-text,
  button:active:enabled > wui-text {
    transition: all var(--wui-ease-out-power-1) var(--wui-duration-lg);
    color: var(--wui-color-fg-125);
  }

  button {
    border-radius: var(--wui-border-radius-3xl);
  }
`;var gt=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let tt=class extends T{constructor(){super(...arguments),this.tabs=[],this.onTabChange=()=>null,this.buttons=[],this.disabled=!1,this.localTabWidth="100px",this.activeTab=0,this.isDense=!1}render(){return this.isDense=this.tabs.length>3,this.style.cssText=`
      --local-tab: ${this.activeTab};
      --local-tab-width: ${this.localTabWidth};
    `,this.dataset.type=this.isDense?"flex":"block",this.tabs.map((t,i)=>{const n=i===this.activeTab;return c`
        <button
          ?disabled=${this.disabled}
          @click=${()=>this.onTabClick(i)}
          data-active=${n}
          data-testid="tab-${t.label?.toLowerCase()}"
        >
          ${this.iconTemplate(t)}
          <wui-text variant="small-600" color="inherit"> ${t.label} </wui-text>
        </button>
      `})}firstUpdated(){this.shadowRoot&&this.isDense&&(this.buttons=[...this.shadowRoot.querySelectorAll("button")],setTimeout(()=>{this.animateTabs(0,!0)},0))}iconTemplate(t){return t.icon?c`<wui-icon size="xs" color="inherit" name=${t.icon}></wui-icon>`:null}onTabClick(t){this.buttons&&this.animateTabs(t,!1),this.activeTab=t,this.onTabChange(t)}animateTabs(t,i){const n=this.buttons[this.activeTab],r=this.buttons[t],e=n?.querySelector("wui-text"),a=r?.querySelector("wui-text"),s=r?.getBoundingClientRect(),l=a?.getBoundingClientRect();n&&e&&!i&&t!==this.activeTab&&(e.animate([{opacity:0}],{duration:50,easing:"ease",fill:"forwards"}),n.animate([{width:"34px"}],{duration:500,easing:"ease",fill:"forwards"})),r&&s&&l&&a&&(t!==this.activeTab||i)&&(this.localTabWidth=`${Math.round(s.width+l.width)+6}px`,r.animate([{width:`${s.width+l.width}px`}],{duration:i?0:500,fill:"forwards",easing:"ease"}),a.animate([{opacity:1}],{duration:i?0:125,delay:i?0:200,fill:"forwards",easing:"ease"}))}};tt.styles=[A,M,en];gt([u({type:Array})],tt.prototype,"tabs",void 0);gt([u()],tt.prototype,"onTabChange",void 0);gt([u({type:Array})],tt.prototype,"buttons",void 0);gt([u({type:Boolean})],tt.prototype,"disabled",void 0);gt([u()],tt.prototype,"localTabWidth",void 0);gt([v()],tt.prototype,"activeTab",void 0);gt([v()],tt.prototype,"isDense",void 0);tt=gt([x("wui-tabs")],tt);var Xe=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let oe=class extends T{constructor(){super(...arguments),this.platformTabs=[],this.unsubscribe=[],this.platforms=[],this.onSelectPlatfrom=void 0}disconnectCallback(){this.unsubscribe.forEach(t=>t())}render(){const t=this.generateTabs();return c`
      <wui-flex justifyContent="center" .padding=${["0","0","l","0"]}>
        <wui-tabs .tabs=${t} .onTabChange=${this.onTabChange.bind(this)}></wui-tabs>
      </wui-flex>
    `}generateTabs(){const t=this.platforms.map(i=>i==="browser"?{label:"Browser",icon:"extension",platform:"browser"}:i==="mobile"?{label:"Mobile",icon:"mobile",platform:"mobile"}:i==="qrcode"?{label:"Mobile",icon:"mobile",platform:"qrcode"}:i==="web"?{label:"Webapp",icon:"browser",platform:"web"}:i==="desktop"?{label:"Desktop",icon:"desktop",platform:"desktop"}:{label:"Browser",icon:"extension",platform:"unsupported"});return this.platformTabs=t.map(({platform:i})=>i),t}onTabChange(t){const i=this.platformTabs[t];i&&this.onSelectPlatfrom?.(i)}};Xe([u({type:Array})],oe.prototype,"platforms",void 0);Xe([u()],oe.prototype,"onSelectPlatfrom",void 0);oe=Xe([x("w3m-connecting-header")],oe);const nn=B`
  :host {
    width: var(--local-width);
    position: relative;
  }

  button {
    border: none;
    border-radius: var(--local-border-radius);
    width: var(--local-width);
    white-space: nowrap;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='md'] {
    padding: 8.2px var(--wui-spacing-l) 9px var(--wui-spacing-l);
    height: 36px;
  }

  button[data-size='md'][data-icon-left='true'][data-icon-right='false'] {
    padding: 8.2px var(--wui-spacing-l) 9px var(--wui-spacing-s);
  }

  button[data-size='md'][data-icon-right='true'][data-icon-left='false'] {
    padding: 8.2px var(--wui-spacing-s) 9px var(--wui-spacing-l);
  }

  button[data-size='lg'] {
    padding: var(--wui-spacing-m) var(--wui-spacing-2l);
    height: 48px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='main'] {
    background-color: var(--wui-color-accent-100);
    color: var(--wui-color-inverse-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='inverse'] {
    background-color: var(--wui-color-inverse-100);
    color: var(--wui-color-inverse-000);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='accent'] {
    background-color: var(--wui-color-accent-glass-010);
    color: var(--wui-color-accent-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  button[data-variant='accent-error'] {
    background: var(--wui-color-error-glass-015);
    color: var(--wui-color-error-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-error-glass-010);
  }

  button[data-variant='accent-success'] {
    background: var(--wui-color-success-glass-015);
    color: var(--wui-color-success-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-success-glass-010);
  }

  button[data-variant='neutral'] {
    background: transparent;
    color: var(--wui-color-fg-100);
    border: none;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  /* -- Focus states --------------------------------------------------- */
  button[data-variant='main']:focus-visible:enabled {
    background-color: var(--wui-color-accent-090);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
  button[data-variant='inverse']:focus-visible:enabled {
    background-color: var(--wui-color-inverse-100);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
  button[data-variant='accent']:focus-visible:enabled {
    background-color: var(--wui-color-accent-glass-010);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0 0 0 4px var(--wui-color-accent-glass-020);
  }
  button[data-variant='accent-error']:focus-visible:enabled {
    background: var(--wui-color-error-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-error-100),
      0 0 0 4px var(--wui-color-error-glass-020);
  }
  button[data-variant='accent-success']:focus-visible:enabled {
    background: var(--wui-color-success-glass-015);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-success-100),
      0 0 0 4px var(--wui-color-success-glass-020);
  }
  button[data-variant='neutral']:focus-visible:enabled {
    background: var(--wui-color-gray-glass-005);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-gray-glass-010),
      0 0 0 4px var(--wui-color-gray-glass-002);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button[data-variant='main']:hover:enabled {
      background-color: var(--wui-color-accent-090);
    }

    button[data-variant='main']:active:enabled {
      background-color: var(--wui-color-accent-080);
    }

    button[data-variant='accent']:hover:enabled {
      background-color: var(--wui-color-accent-glass-015);
    }

    button[data-variant='accent']:active:enabled {
      background-color: var(--wui-color-accent-glass-020);
    }

    button[data-variant='accent-error']:hover:enabled {
      background: var(--wui-color-error-glass-020);
      color: var(--wui-color-error-100);
    }

    button[data-variant='accent-error']:active:enabled {
      background: var(--wui-color-error-glass-030);
      color: var(--wui-color-error-100);
    }

    button[data-variant='accent-success']:hover:enabled {
      background: var(--wui-color-success-glass-020);
      color: var(--wui-color-success-100);
    }

    button[data-variant='accent-success']:active:enabled {
      background: var(--wui-color-success-glass-030);
      color: var(--wui-color-success-100);
    }

    button[data-variant='neutral']:hover:enabled {
      background: var(--wui-color-gray-glass-002);
    }

    button[data-variant='neutral']:active:enabled {
      background: var(--wui-color-gray-glass-005);
    }

    button[data-size='lg'][data-icon-left='true'][data-icon-right='false'] {
      padding-left: var(--wui-spacing-m);
    }

    button[data-size='lg'][data-icon-right='true'][data-icon-left='false'] {
      padding-right: var(--wui-spacing-m);
    }
  }

  /* -- Disabled state --------------------------------------------------- */
  button:disabled {
    background-color: var(--wui-color-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    color: var(--wui-color-gray-glass-020);
    cursor: not-allowed;
  }

  button > wui-text {
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
    opacity: var(--local-opacity-100);
  }

  ::slotted(*) {
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
    opacity: var(--local-opacity-100);
  }

  wui-loading-spinner {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    opacity: var(--local-opacity-000);
  }
`;var et=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};const ci={main:"inverse-100",inverse:"inverse-000",accent:"accent-100","accent-error":"error-100","accent-success":"success-100",neutral:"fg-100",disabled:"gray-glass-020"},on={lg:"paragraph-600",md:"small-600"},rn={lg:"md",md:"md"};let q=class extends T{constructor(){super(...arguments),this.size="lg",this.disabled=!1,this.fullWidth=!1,this.loading=!1,this.variant="main",this.hasIconLeft=!1,this.hasIconRight=!1,this.borderRadius="m"}render(){this.style.cssText=`
    --local-width: ${this.fullWidth?"100%":"auto"};
    --local-opacity-100: ${this.loading?0:1};
    --local-opacity-000: ${this.loading?1:0};
    --local-border-radius: var(--wui-border-radius-${this.borderRadius});
    `;const t=this.textVariant??on[this.size];return c`
      <button
        data-variant=${this.variant}
        data-icon-left=${this.hasIconLeft}
        data-icon-right=${this.hasIconRight}
        data-size=${this.size}
        ?disabled=${this.disabled}
      >
        ${this.loadingTemplate()}
        <slot name="iconLeft" @slotchange=${()=>this.handleSlotLeftChange()}></slot>
        <wui-text variant=${t} color="inherit">
          <slot></slot>
        </wui-text>
        <slot name="iconRight" @slotchange=${()=>this.handleSlotRightChange()}></slot>
      </button>
    `}handleSlotLeftChange(){this.hasIconLeft=!0}handleSlotRightChange(){this.hasIconRight=!0}loadingTemplate(){if(this.loading){const t=rn[this.size],i=this.disabled?ci.disabled:ci[this.variant];return c`<wui-loading-spinner color=${i} size=${t}></wui-loading-spinner>`}return c``}};q.styles=[A,M,nn];et([u()],q.prototype,"size",void 0);et([u({type:Boolean})],q.prototype,"disabled",void 0);et([u({type:Boolean})],q.prototype,"fullWidth",void 0);et([u({type:Boolean})],q.prototype,"loading",void 0);et([u()],q.prototype,"variant",void 0);et([u({type:Boolean})],q.prototype,"hasIconLeft",void 0);et([u({type:Boolean})],q.prototype,"hasIconRight",void 0);et([u()],q.prototype,"borderRadius",void 0);et([u()],q.prototype,"textVariant",void 0);q=et([x("wui-button")],q);const an=B`
  button {
    padding: var(--wui-spacing-4xs) var(--wui-spacing-xxs);
    border-radius: var(--wui-border-radius-3xs);
    background-color: transparent;
    color: var(--wui-color-accent-100);
  }

  button:disabled {
    background-color: transparent;
    color: var(--wui-color-gray-glass-015);
  }

  button:hover {
    background-color: var(--wui-color-gray-glass-005);
  }
`;var ye=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let $t=class extends T{constructor(){super(...arguments),this.tabIdx=void 0,this.disabled=!1,this.color="inherit"}render(){return c`
      <button ?disabled=${this.disabled} tabindex=${y(this.tabIdx)}>
        <slot name="iconLeft"></slot>
        <wui-text variant="small-600" color=${this.color}>
          <slot></slot>
        </wui-text>
        <slot name="iconRight"></slot>
      </button>
    `}};$t.styles=[A,M,an];ye([u()],$t.prototype,"tabIdx",void 0);ye([u({type:Boolean})],$t.prototype,"disabled",void 0);ye([u()],$t.prototype,"color",void 0);$t=ye([x("wui-link")],$t);const sn=B`
  :host {
    display: block;
    width: var(--wui-box-size-md);
    height: var(--wui-box-size-md);
  }

  svg {
    width: var(--wui-box-size-md);
    height: var(--wui-box-size-md);
  }

  rect {
    fill: none;
    stroke: var(--wui-color-accent-100);
    stroke-width: 4px;
    stroke-linecap: round;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`;var Ci=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let re=class extends T{constructor(){super(...arguments),this.radius=36}render(){return this.svgLoaderTemplate()}svgLoaderTemplate(){const t=this.radius>50?50:this.radius,n=36-t,r=116+n,e=245+n,a=360+n*1.75;return c`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${t}
          stroke-dasharray="${r} ${e}"
          stroke-dashoffset=${a}
        />
      </svg>
    `}};re.styles=[A,sn];Ci([u({type:Number})],re.prototype,"radius",void 0);re=Ci([x("wui-loading-thumbnail")],re);const ln=B`
  button {
    border: none;
    border-radius: var(--wui-border-radius-3xl);
  }

  button[data-variant='main'] {
    background-color: var(--wui-color-accent-100);
    color: var(--wui-color-inverse-100);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='accent'] {
    background-color: var(--wui-color-accent-glass-010);
    color: var(--wui-color-accent-100);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  button[data-variant='gray'] {
    background-color: transparent;
    color: var(--wui-color-fg-200);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-variant='shade'] {
    background-color: transparent;
    color: var(--wui-color-accent-100);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  button[data-size='sm'] {
    height: 32px;
    padding: 0 var(--wui-spacing-s);
  }

  button[data-size='md'] {
    height: 40px;
    padding: 0 var(--wui-spacing-l);
  }

  button[data-size='sm'] > wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='md'] > wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='sm'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] > wui-icon {
    width: 14px;
    height: 14px;
  }

  wui-image {
    border-radius: var(--wui-border-radius-3xl);
    overflow: hidden;
  }

  button.disabled > wui-icon,
  button.disabled > wui-image {
    filter: grayscale(1);
  }

  button[data-variant='main'] > wui-image {
    box-shadow: inset 0 0 0 1px var(--wui-color-accent-090);
  }

  button[data-variant='shade'] > wui-image,
  button[data-variant='gray'] > wui-image {
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }

  @media (hover: hover) and (pointer: fine) {
    button[data-variant='main']:focus-visible {
      background-color: var(--wui-color-accent-090);
    }

    button[data-variant='main']:hover:enabled {
      background-color: var(--wui-color-accent-090);
    }

    button[data-variant='main']:active:enabled {
      background-color: var(--wui-color-accent-080);
    }

    button[data-variant='accent']:hover:enabled {
      background-color: var(--wui-color-accent-glass-015);
    }

    button[data-variant='accent']:active:enabled {
      background-color: var(--wui-color-accent-glass-020);
    }

    button[data-variant='shade']:focus-visible,
    button[data-variant='gray']:focus-visible,
    button[data-variant='shade']:hover,
    button[data-variant='gray']:hover {
      background-color: var(--wui-color-gray-glass-002);
    }

    button[data-variant='gray']:active,
    button[data-variant='shade']:active {
      background-color: var(--wui-color-gray-glass-005);
    }
  }

  button.disabled {
    color: var(--wui-color-gray-glass-020);
    background-color: var(--wui-color-gray-glass-002);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    pointer-events: none;
  }
`;var Ct=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let ct=class extends T{constructor(){super(...arguments),this.variant="accent",this.imageSrc="",this.disabled=!1,this.icon="externalLink",this.size="md",this.text=""}render(){const t=this.size==="sm"?"small-600":"paragraph-600";return c`
      <button
        class=${this.disabled?"disabled":""}
        data-variant=${this.variant}
        data-size=${this.size}
      >
        ${this.imageSrc?c`<wui-image src=${this.imageSrc}></wui-image>`:null}
        <wui-text variant=${t} color="inherit"> ${this.text} </wui-text>
        <wui-icon name=${this.icon} color="inherit" size="inherit"></wui-icon>
      </button>
    `}};ct.styles=[A,M,ln];Ct([u()],ct.prototype,"variant",void 0);Ct([u()],ct.prototype,"imageSrc",void 0);Ct([u({type:Boolean})],ct.prototype,"disabled",void 0);Ct([u()],ct.prototype,"icon",void 0);Ct([u()],ct.prototype,"size",void 0);Ct([u()],ct.prototype,"text",void 0);ct=Ct([x("wui-chip-button")],ct);const cn=B`
  wui-flex {
    width: 100%;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
  }
`;var xe=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let Tt=class extends T{constructor(){super(...arguments),this.disabled=!1,this.label="",this.buttonLabel=""}render(){return c`
      <wui-flex
        justifyContent="space-between"
        alignItems="center"
        .padding=${["1xs","2l","1xs","2l"]}
      >
        <wui-text variant="paragraph-500" color="fg-200">${this.label}</wui-text>
        <wui-chip-button size="sm" variant="shade" text=${this.buttonLabel} icon="chevronRight">
        </wui-chip-button>
      </wui-flex>
    `}};Tt.styles=[A,M,cn];xe([u({type:Boolean})],Tt.prototype,"disabled",void 0);xe([u()],Tt.prototype,"label",void 0);xe([u()],Tt.prototype,"buttonLabel",void 0);Tt=xe([x("wui-cta-button")],Tt);const un=B`
  :host {
    display: block;
    padding: 0 var(--wui-spacing-xl) var(--wui-spacing-xl);
  }
`;var $i=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let ae=class extends T{constructor(){super(...arguments),this.wallet=void 0}render(){if(!this.wallet)return this.style.display="none",null;const{name:t,app_store:i,play_store:n,chrome_store:r,homepage:e}=this.wallet,a=I.isMobile(),s=I.isIos(),l=I.isAndroid(),h=[i,n,e,r].filter(Boolean).length>1,p=st.getTruncateString({string:t,charsStart:12,charsEnd:0,truncate:"end"});return h&&!a?c`
        <wui-cta-button
          label=${`Don't have ${p}?`}
          buttonLabel="Get"
          @click=${()=>O.push("Downloads",{wallet:this.wallet})}
        ></wui-cta-button>
      `:!h&&e?c`
        <wui-cta-button
          label=${`Don't have ${p}?`}
          buttonLabel="Get"
          @click=${this.onHomePage.bind(this)}
        ></wui-cta-button>
      `:i&&s?c`
        <wui-cta-button
          label=${`Don't have ${p}?`}
          buttonLabel="Get"
          @click=${this.onAppStore.bind(this)}
        ></wui-cta-button>
      `:n&&l?c`
        <wui-cta-button
          label=${`Don't have ${p}?`}
          buttonLabel="Get"
          @click=${this.onPlayStore.bind(this)}
        ></wui-cta-button>
      `:(this.style.display="none",null)}onAppStore(){this.wallet?.app_store&&I.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&I.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&I.openHref(this.wallet.homepage,"_blank")}};ae.styles=[un];$i([u({type:Object})],ae.prototype,"wallet",void 0);ae=$i([x("w3m-mobile-download-links")],ae);const dn=B`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-icon-box {
    position: absolute;
    right: calc(var(--wui-spacing-3xs) * -1);
    bottom: calc(var(--wui-spacing-3xs) * -1);
    opacity: 0;
    transform: scale(0.5);
    transition-property: opacity, transform;
    transition-duration: var(--wui-duration-lg);
    transition-timing-function: var(--wui-ease-out-power-2);
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px var(--wui-spacing-l);
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }
`;var it=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};class z extends T{constructor(){super(),this.wallet=O.state.data?.wallet,this.connector=O.state.data?.connector,this.timeout=void 0,this.secondaryBtnIcon="refresh",this.onConnect=void 0,this.onRender=void 0,this.onAutoConnect=void 0,this.isWalletConnect=!0,this.unsubscribe=[],this.imageSrc=D.getWalletImage(this.wallet)??D.getConnectorImage(this.connector),this.name=this.wallet?.name??this.connector?.name??"Wallet",this.isRetrying=!1,this.uri=_.state.wcUri,this.error=_.state.wcError,this.ready=!1,this.showRetry=!1,this.secondaryBtnLabel="Try again",this.secondaryLabel="Accept connection request in the wallet",this.isLoading=!1,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(_.subscribeKey("wcUri",t=>{this.uri=t,this.isRetrying&&this.onRetry&&(this.isRetrying=!1,this.onConnect?.())}),_.subscribeKey("wcError",t=>this.error=t)),(I.isTelegram()||I.isSafari())&&I.isIos()&&_.state.wcUri&&this.onConnect?.()}firstUpdated(){this.onAutoConnect?.(),this.showRetry=!this.onAutoConnect}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),_.setWcError(!1),clearTimeout(this.timeout)}render(){this.onRender?.(),this.onShowRetry();const t=this.error?"Connection can be declined if a previous request is still active":this.secondaryLabel;let i=`Continue in ${this.name}`;return this.error&&(i="Connection declined"),c`
      <wui-flex
        data-error=${y(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["3xl","xl","xl","xl"]}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${y(this.imageSrc)}></wui-wallet-image>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text variant="paragraph-500" color=${this.error?"error-100":"fg-100"}>
            ${i}
          </wui-text>
          <wui-text align="center" variant="small-500" color="fg-200">${t}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel?c`
              <wui-button
                variant="accent"
                size="md"
                ?disabled=${this.isRetrying||this.isLoading}
                @click=${this.onTryAgain.bind(this)}
                data-testid="w3m-connecting-widget-secondary-button"
              >
                <wui-icon color="inherit" slot="iconLeft" name=${this.secondaryBtnIcon}></wui-icon>
                ${this.secondaryBtnLabel}
              </wui-button>
            `:null}
      </wui-flex>

      ${this.isWalletConnect?c`
            <wui-flex .padding=${["0","xl","xl","xl"]} justifyContent="center">
              <wui-link @click=${this.onCopyUri} color="fg-200" data-testid="wui-link-copy">
                <wui-icon size="xs" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
                Copy link
              </wui-link>
            </wui-flex>
          `:null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onShowRetry(){this.error&&!this.showRetry&&(this.showRetry=!0,this.shadowRoot?.querySelector("wui-button")?.animate([{opacity:0},{opacity:1}],{fill:"forwards",easing:"ease"}))}onTryAgain(){_.setWcError(!1),this.onRetry?(this.isRetrying=!0,this.onRetry?.()):this.onConnect?.()}loaderTemplate(){const t=ke.state.themeVariables["--w3m-border-radius-master"],i=t?parseInt(t.replace("px",""),10):4;return c`<wui-loading-thumbnail radius=${i*9}></wui-loading-thumbnail>`}onCopyUri(){try{this.uri&&(I.copyToClopboard(this.uri),Qt.showSuccess("Link copied"))}catch{Qt.showError("Failed to copy")}}}z.styles=dn;it([v()],z.prototype,"isRetrying",void 0);it([v()],z.prototype,"uri",void 0);it([v()],z.prototype,"error",void 0);it([v()],z.prototype,"ready",void 0);it([v()],z.prototype,"showRetry",void 0);it([v()],z.prototype,"secondaryBtnLabel",void 0);it([v()],z.prototype,"secondaryLabel",void 0);it([v()],z.prototype,"isLoading",void 0);it([u({type:Boolean})],z.prototype,"isMobile",void 0);it([u()],z.prototype,"onRetry",void 0);var hn=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let ui=class extends z{constructor(){if(super(),!this.wallet)throw new Error("w3m-connecting-wc-browser: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onAutoConnect=this.onConnectProxy.bind(this),J.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser"}})}async onConnectProxy(){try{this.error=!1;const{connectors:t}=L.state,i=t.find(n=>n.type==="ANNOUNCED"&&n.info?.rdns===this.wallet?.rdns||n.type==="INJECTED"||n.name===this.wallet?.name);if(i)await _.connectExternal(i,i.chain);else throw new Error("w3m-connecting-wc-browser: No connector found");vi.close(),J.sendEvent({type:"track",event:"CONNECT_SUCCESS",properties:{method:"browser",name:this.wallet?.name||"Unknown"}})}catch(t){J.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:t?.message??"Unknown"}}),this.error=!0}}};ui=hn([x("w3m-connecting-wc-browser")],ui);var pn=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let di=class extends z{constructor(){if(super(),!this.wallet)throw new Error("w3m-connecting-wc-desktop: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.onRender=this.onRenderProxy.bind(this),J.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"desktop"}})}onRenderProxy(){!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onConnectProxy(){if(this.wallet?.desktop_link&&this.uri)try{this.error=!1;const{desktop_link:t,name:i}=this.wallet,{redirect:n,href:r}=I.formatNativeUrl(t,this.uri);_.setWcLinking({name:i,href:r}),_.setRecentWallet(this.wallet),I.openHref(n,"_blank")}catch{this.error=!0}}};di=pn([x("w3m-connecting-wc-desktop")],di);var Lt=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let mt=class extends z{constructor(){if(super(),this.btnLabelTimeout=void 0,this.redirectDeeplink=void 0,this.redirectUniversalLink=void 0,this.target=void 0,this.preferUniversalLinks=Y.state.experimental_preferUniversalLinks,this.isLoading=!0,this.onConnect=()=>{if(this.wallet?.mobile_link&&this.uri)try{this.error=!1;const{mobile_link:t,link_mode:i,name:n}=this.wallet,{redirect:r,redirectUniversalLink:e,href:a}=I.formatNativeUrl(t,this.uri,i);this.redirectDeeplink=r,this.redirectUniversalLink=e,this.target=I.isIframe()?"_top":"_self",_.setWcLinking({name:n,href:a}),_.setRecentWallet(this.wallet),this.preferUniversalLinks&&this.redirectUniversalLink?I.openHref(this.redirectUniversalLink,this.target):I.openHref(this.redirectDeeplink,this.target)}catch(t){J.sendEvent({type:"track",event:"CONNECT_PROXY_ERROR",properties:{message:t instanceof Error?t.message:"Error parsing the deeplink",uri:this.uri,mobile_link:this.wallet.mobile_link,name:this.wallet.name}}),this.error=!0}},!this.wallet)throw new Error("w3m-connecting-wc-mobile: No wallet provided");this.secondaryBtnLabel="Open",this.secondaryLabel=yi.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.onHandleURI(),this.unsubscribe.push(_.subscribeKey("wcUri",()=>{this.onHandleURI()})),J.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"mobile"}})}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.btnLabelTimeout)}onHandleURI(){this.isLoading=!this.uri,!this.ready&&this.uri&&(this.ready=!0,this.onConnect?.())}onTryAgain(){_.setWcError(!1),this.onConnect?.()}};Lt([v()],mt.prototype,"redirectDeeplink",void 0);Lt([v()],mt.prototype,"redirectUniversalLink",void 0);Lt([v()],mt.prototype,"target",void 0);Lt([v()],mt.prototype,"preferUniversalLinks",void 0);Lt([v()],mt.prototype,"isLoading",void 0);mt=Lt([x("w3m-connecting-wc-mobile")],mt);var Vt={},gn=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then},Ti={},V={};let Ze;const fn=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];V.getSymbolSize=function(t){if(!t)throw new Error('"version" cannot be null or undefined');if(t<1||t>40)throw new Error('"version" should be in range from 1 to 40');return t*4+17};V.getSymbolTotalCodewords=function(t){return fn[t]};V.getBCHDigit=function(o){let t=0;for(;o!==0;)t++,o>>>=1;return t};V.setToSJISFunction=function(t){if(typeof t!="function")throw new Error('"toSJISFunc" is not a valid function.');Ze=t};V.isKanjiModeEnabled=function(){return typeof Ze<"u"};V.toSJIS=function(t){return Ze(t)};var Ce={};(function(o){o.L={bit:1},o.M={bit:0},o.Q={bit:3},o.H={bit:2};function t(i){if(typeof i!="string")throw new Error("Param is not a string");switch(i.toLowerCase()){case"l":case"low":return o.L;case"m":case"medium":return o.M;case"q":case"quartile":return o.Q;case"h":case"high":return o.H;default:throw new Error("Unknown EC Level: "+i)}}o.isValid=function(n){return n&&typeof n.bit<"u"&&n.bit>=0&&n.bit<4},o.from=function(n,r){if(o.isValid(n))return n;try{return t(n)}catch{return r}}})(Ce);function Ri(){this.buffer=[],this.length=0}Ri.prototype={get:function(o){const t=Math.floor(o/8);return(this.buffer[t]>>>7-o%8&1)===1},put:function(o,t){for(let i=0;i<t;i++)this.putBit((o>>>t-i-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(o){const t=Math.floor(this.length/8);this.buffer.length<=t&&this.buffer.push(0),o&&(this.buffer[t]|=128>>>this.length%8),this.length++}};var wn=Ri;function qt(o){if(!o||o<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=o,this.data=new Uint8Array(o*o),this.reservedBit=new Uint8Array(o*o)}qt.prototype.set=function(o,t,i,n){const r=o*this.size+t;this.data[r]=i,n&&(this.reservedBit[r]=!0)};qt.prototype.get=function(o,t){return this.data[o*this.size+t]};qt.prototype.xor=function(o,t,i){this.data[o*this.size+t]^=i};qt.prototype.isReserved=function(o,t){return this.reservedBit[o*this.size+t]};var bn=qt,Ii={};(function(o){const t=V.getSymbolSize;o.getRowColCoords=function(n){if(n===1)return[];const r=Math.floor(n/7)+2,e=t(n),a=e===145?26:Math.ceil((e-13)/(2*r-2))*2,s=[e-7];for(let l=1;l<r-1;l++)s[l]=s[l-1]-a;return s.push(6),s.reverse()},o.getPositions=function(n){const r=[],e=o.getRowColCoords(n),a=e.length;for(let s=0;s<a;s++)for(let l=0;l<a;l++)s===0&&l===0||s===0&&l===a-1||s===a-1&&l===0||r.push([e[s],e[l]]);return r}})(Ii);var Ei={};const mn=V.getSymbolSize,hi=7;Ei.getPositions=function(t){const i=mn(t);return[[0,0],[i-hi,0],[0,i-hi]]};var Wi={};(function(o){o.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const t={N1:3,N2:3,N3:40,N4:10};o.isValid=function(r){return r!=null&&r!==""&&!isNaN(r)&&r>=0&&r<=7},o.from=function(r){return o.isValid(r)?parseInt(r,10):void 0},o.getPenaltyN1=function(r){const e=r.size;let a=0,s=0,l=0,h=null,p=null;for(let E=0;E<e;E++){s=l=0,h=p=null;for(let C=0;C<e;C++){let m=r.get(E,C);m===h?s++:(s>=5&&(a+=t.N1+(s-5)),h=m,s=1),m=r.get(C,E),m===p?l++:(l>=5&&(a+=t.N1+(l-5)),p=m,l=1)}s>=5&&(a+=t.N1+(s-5)),l>=5&&(a+=t.N1+(l-5))}return a},o.getPenaltyN2=function(r){const e=r.size;let a=0;for(let s=0;s<e-1;s++)for(let l=0;l<e-1;l++){const h=r.get(s,l)+r.get(s,l+1)+r.get(s+1,l)+r.get(s+1,l+1);(h===4||h===0)&&a++}return a*t.N2},o.getPenaltyN3=function(r){const e=r.size;let a=0,s=0,l=0;for(let h=0;h<e;h++){s=l=0;for(let p=0;p<e;p++)s=s<<1&2047|r.get(h,p),p>=10&&(s===1488||s===93)&&a++,l=l<<1&2047|r.get(p,h),p>=10&&(l===1488||l===93)&&a++}return a*t.N3},o.getPenaltyN4=function(r){let e=0;const a=r.data.length;for(let l=0;l<a;l++)e+=r.data[l];return Math.abs(Math.ceil(e*100/a/5)-10)*t.N4};function i(n,r,e){switch(n){case o.Patterns.PATTERN000:return(r+e)%2===0;case o.Patterns.PATTERN001:return r%2===0;case o.Patterns.PATTERN010:return e%3===0;case o.Patterns.PATTERN011:return(r+e)%3===0;case o.Patterns.PATTERN100:return(Math.floor(r/2)+Math.floor(e/3))%2===0;case o.Patterns.PATTERN101:return r*e%2+r*e%3===0;case o.Patterns.PATTERN110:return(r*e%2+r*e%3)%2===0;case o.Patterns.PATTERN111:return(r*e%3+(r+e)%2)%2===0;default:throw new Error("bad maskPattern:"+n)}}o.applyMask=function(r,e){const a=e.size;for(let s=0;s<a;s++)for(let l=0;l<a;l++)e.isReserved(l,s)||e.xor(l,s,i(r,l,s))},o.getBestMask=function(r,e){const a=Object.keys(o.Patterns).length;let s=0,l=1/0;for(let h=0;h<a;h++){e(h),o.applyMask(h,r);const p=o.getPenaltyN1(r)+o.getPenaltyN2(r)+o.getPenaltyN3(r)+o.getPenaltyN4(r);o.applyMask(h,r),p<l&&(l=p,s=h)}return s}})(Wi);var $e={};const ht=Ce,Yt=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],Jt=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];$e.getBlocksCount=function(t,i){switch(i){case ht.L:return Yt[(t-1)*4+0];case ht.M:return Yt[(t-1)*4+1];case ht.Q:return Yt[(t-1)*4+2];case ht.H:return Yt[(t-1)*4+3];default:return}};$e.getTotalCodewordsCount=function(t,i){switch(i){case ht.L:return Jt[(t-1)*4+0];case ht.M:return Jt[(t-1)*4+1];case ht.Q:return Jt[(t-1)*4+2];case ht.H:return Jt[(t-1)*4+3];default:return}};var _i={},Te={};const jt=new Uint8Array(512),se=new Uint8Array(256);(function(){let t=1;for(let i=0;i<255;i++)jt[i]=t,se[t]=i,t<<=1,t&256&&(t^=285);for(let i=255;i<512;i++)jt[i]=jt[i-255]})();Te.log=function(t){if(t<1)throw new Error("log("+t+")");return se[t]};Te.exp=function(t){return jt[t]};Te.mul=function(t,i){return t===0||i===0?0:jt[se[t]+se[i]]};(function(o){const t=Te;o.mul=function(n,r){const e=new Uint8Array(n.length+r.length-1);for(let a=0;a<n.length;a++)for(let s=0;s<r.length;s++)e[a+s]^=t.mul(n[a],r[s]);return e},o.mod=function(n,r){let e=new Uint8Array(n);for(;e.length-r.length>=0;){const a=e[0];for(let l=0;l<r.length;l++)e[l]^=t.mul(r[l],a);let s=0;for(;s<e.length&&e[s]===0;)s++;e=e.slice(s)}return e},o.generateECPolynomial=function(n){let r=new Uint8Array([1]);for(let e=0;e<n;e++)r=o.mul(r,new Uint8Array([1,t.exp(e)]));return r}})(_i);const Si=_i;function ti(o){this.genPoly=void 0,this.degree=o,this.degree&&this.initialize(this.degree)}ti.prototype.initialize=function(t){this.degree=t,this.genPoly=Si.generateECPolynomial(this.degree)};ti.prototype.encode=function(t){if(!this.genPoly)throw new Error("Encoder not initialized");const i=new Uint8Array(t.length+this.degree);i.set(t);const n=Si.mod(i,this.genPoly),r=this.degree-n.length;if(r>0){const e=new Uint8Array(this.degree);return e.set(n,r),e}return n};var vn=ti,Bi={},ft={},ei={};ei.isValid=function(t){return!isNaN(t)&&t>=1&&t<=40};var nt={};const Li="[0-9]+",yn="[A-Z $%*+\\-./:]+";let Ut="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";Ut=Ut.replace(/u/g,"\\u");const xn="(?:(?![A-Z0-9 $%*+\\-./:]|"+Ut+`)(?:.|[\r
]))+`;nt.KANJI=new RegExp(Ut,"g");nt.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g");nt.BYTE=new RegExp(xn,"g");nt.NUMERIC=new RegExp(Li,"g");nt.ALPHANUMERIC=new RegExp(yn,"g");const Cn=new RegExp("^"+Ut+"$"),$n=new RegExp("^"+Li+"$"),Tn=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");nt.testKanji=function(t){return Cn.test(t)};nt.testNumeric=function(t){return $n.test(t)};nt.testAlphanumeric=function(t){return Tn.test(t)};(function(o){const t=ei,i=nt;o.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},o.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},o.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},o.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},o.MIXED={bit:-1},o.getCharCountIndicator=function(e,a){if(!e.ccBits)throw new Error("Invalid mode: "+e);if(!t.isValid(a))throw new Error("Invalid version: "+a);return a>=1&&a<10?e.ccBits[0]:a<27?e.ccBits[1]:e.ccBits[2]},o.getBestModeForData=function(e){return i.testNumeric(e)?o.NUMERIC:i.testAlphanumeric(e)?o.ALPHANUMERIC:i.testKanji(e)?o.KANJI:o.BYTE},o.toString=function(e){if(e&&e.id)return e.id;throw new Error("Invalid mode")},o.isValid=function(e){return e&&e.bit&&e.ccBits};function n(r){if(typeof r!="string")throw new Error("Param is not a string");switch(r.toLowerCase()){case"numeric":return o.NUMERIC;case"alphanumeric":return o.ALPHANUMERIC;case"kanji":return o.KANJI;case"byte":return o.BYTE;default:throw new Error("Unknown mode: "+r)}}o.from=function(e,a){if(o.isValid(e))return e;try{return n(e)}catch{return a}}})(ft);(function(o){const t=V,i=$e,n=Ce,r=ft,e=ei,a=7973,s=t.getBCHDigit(a);function l(C,m,R){for(let b=1;b<=40;b++)if(m<=o.getCapacity(b,R,C))return b}function h(C,m){return r.getCharCountIndicator(C,m)+4}function p(C,m){let R=0;return C.forEach(function(b){const $=h(b.mode,m);R+=$+b.getBitsLength()}),R}function E(C,m){for(let R=1;R<=40;R++)if(p(C,R)<=o.getCapacity(R,m,r.MIXED))return R}o.from=function(m,R){return e.isValid(m)?parseInt(m,10):R},o.getCapacity=function(m,R,b){if(!e.isValid(m))throw new Error("Invalid QR Code version");typeof b>"u"&&(b=r.BYTE);const $=t.getSymbolTotalCodewords(m),w=i.getTotalCodewordsCount(m,R),g=($-w)*8;if(b===r.MIXED)return g;const f=g-h(b,m);switch(b){case r.NUMERIC:return Math.floor(f/10*3);case r.ALPHANUMERIC:return Math.floor(f/11*2);case r.KANJI:return Math.floor(f/13);case r.BYTE:default:return Math.floor(f/8)}},o.getBestVersionForData=function(m,R){let b;const $=n.from(R,n.M);if(Array.isArray(m)){if(m.length>1)return E(m,$);if(m.length===0)return 1;b=m[0]}else b=m;return l(b.mode,b.getLength(),$)},o.getEncodedBits=function(m){if(!e.isValid(m)||m<7)throw new Error("Invalid QR Code version");let R=m<<12;for(;t.getBCHDigit(R)-s>=0;)R^=a<<t.getBCHDigit(R)-s;return m<<12|R}})(Bi);var Pi={};const ze=V,Oi=1335,Rn=21522,pi=ze.getBCHDigit(Oi);Pi.getEncodedBits=function(t,i){const n=t.bit<<3|i;let r=n<<10;for(;ze.getBCHDigit(r)-pi>=0;)r^=Oi<<ze.getBCHDigit(r)-pi;return(n<<10|r)^Rn};var Ai={};const In=ft;function Rt(o){this.mode=In.NUMERIC,this.data=o.toString()}Rt.getBitsLength=function(t){return 10*Math.floor(t/3)+(t%3?t%3*3+1:0)};Rt.prototype.getLength=function(){return this.data.length};Rt.prototype.getBitsLength=function(){return Rt.getBitsLength(this.data.length)};Rt.prototype.write=function(t){let i,n,r;for(i=0;i+3<=this.data.length;i+=3)n=this.data.substr(i,3),r=parseInt(n,10),t.put(r,10);const e=this.data.length-i;e>0&&(n=this.data.substr(i),r=parseInt(n,10),t.put(r,e*3+1))};var En=Rt;const Wn=ft,_e=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function It(o){this.mode=Wn.ALPHANUMERIC,this.data=o}It.getBitsLength=function(t){return 11*Math.floor(t/2)+6*(t%2)};It.prototype.getLength=function(){return this.data.length};It.prototype.getBitsLength=function(){return It.getBitsLength(this.data.length)};It.prototype.write=function(t){let i;for(i=0;i+2<=this.data.length;i+=2){let n=_e.indexOf(this.data[i])*45;n+=_e.indexOf(this.data[i+1]),t.put(n,11)}this.data.length%2&&t.put(_e.indexOf(this.data[i]),6)};var _n=It,Sn=function(t){for(var i=[],n=t.length,r=0;r<n;r++){var e=t.charCodeAt(r);if(e>=55296&&e<=56319&&n>r+1){var a=t.charCodeAt(r+1);a>=56320&&a<=57343&&(e=(e-55296)*1024+a-56320+65536,r+=1)}if(e<128){i.push(e);continue}if(e<2048){i.push(e>>6|192),i.push(e&63|128);continue}if(e<55296||e>=57344&&e<65536){i.push(e>>12|224),i.push(e>>6&63|128),i.push(e&63|128);continue}if(e>=65536&&e<=1114111){i.push(e>>18|240),i.push(e>>12&63|128),i.push(e>>6&63|128),i.push(e&63|128);continue}i.push(239,191,189)}return new Uint8Array(i).buffer};const Bn=Sn,Ln=ft;function Et(o){this.mode=Ln.BYTE,typeof o=="string"&&(o=Bn(o)),this.data=new Uint8Array(o)}Et.getBitsLength=function(t){return t*8};Et.prototype.getLength=function(){return this.data.length};Et.prototype.getBitsLength=function(){return Et.getBitsLength(this.data.length)};Et.prototype.write=function(o){for(let t=0,i=this.data.length;t<i;t++)o.put(this.data[t],8)};var Pn=Et;const On=ft,An=V;function Wt(o){this.mode=On.KANJI,this.data=o}Wt.getBitsLength=function(t){return t*13};Wt.prototype.getLength=function(){return this.data.length};Wt.prototype.getBitsLength=function(){return Wt.getBitsLength(this.data.length)};Wt.prototype.write=function(o){let t;for(t=0;t<this.data.length;t++){let i=An.toSJIS(this.data[t]);if(i>=33088&&i<=40956)i-=33088;else if(i>=57408&&i<=60351)i-=49472;else throw new Error("Invalid SJIS character: "+this.data[t]+`
Make sure your charset is UTF-8`);i=(i>>>8&255)*192+(i&255),o.put(i,13)}};var jn=Wt;(function(o){const t=ft,i=En,n=_n,r=Pn,e=jn,a=nt,s=V,l=Ji;function h(w){return unescape(encodeURIComponent(w)).length}function p(w,g,f){const d=[];let W;for(;(W=w.exec(f))!==null;)d.push({data:W[0],index:W.index,mode:g,length:W[0].length});return d}function E(w){const g=p(a.NUMERIC,t.NUMERIC,w),f=p(a.ALPHANUMERIC,t.ALPHANUMERIC,w);let d,W;return s.isKanjiModeEnabled()?(d=p(a.BYTE,t.BYTE,w),W=p(a.KANJI,t.KANJI,w)):(d=p(a.BYTE_KANJI,t.BYTE,w),W=[]),g.concat(f,d,W).sort(function(j,G){return j.index-G.index}).map(function(j){return{data:j.data,mode:j.mode,length:j.length}})}function C(w,g){switch(g){case t.NUMERIC:return i.getBitsLength(w);case t.ALPHANUMERIC:return n.getBitsLength(w);case t.KANJI:return e.getBitsLength(w);case t.BYTE:return r.getBitsLength(w)}}function m(w){return w.reduce(function(g,f){const d=g.length-1>=0?g[g.length-1]:null;return d&&d.mode===f.mode?(g[g.length-1].data+=f.data,g):(g.push(f),g)},[])}function R(w){const g=[];for(let f=0;f<w.length;f++){const d=w[f];switch(d.mode){case t.NUMERIC:g.push([d,{data:d.data,mode:t.ALPHANUMERIC,length:d.length},{data:d.data,mode:t.BYTE,length:d.length}]);break;case t.ALPHANUMERIC:g.push([d,{data:d.data,mode:t.BYTE,length:d.length}]);break;case t.KANJI:g.push([d,{data:d.data,mode:t.BYTE,length:h(d.data)}]);break;case t.BYTE:g.push([{data:d.data,mode:t.BYTE,length:h(d.data)}])}}return g}function b(w,g){const f={},d={start:{}};let W=["start"];for(let P=0;P<w.length;P++){const j=w[P],G=[];for(let dt=0;dt<j.length;dt++){const Z=j[dt],Ot=""+P+dt;G.push(Ot),f[Ot]={node:Z,lastCount:0},d[Ot]={};for(let Ee=0;Ee<W.length;Ee++){const rt=W[Ee];f[rt]&&f[rt].node.mode===Z.mode?(d[rt][Ot]=C(f[rt].lastCount+Z.length,Z.mode)-C(f[rt].lastCount,Z.mode),f[rt].lastCount+=Z.length):(f[rt]&&(f[rt].lastCount=Z.length),d[rt][Ot]=C(Z.length,Z.mode)+4+t.getCharCountIndicator(Z.mode,g))}}W=G}for(let P=0;P<W.length;P++)d[W[P]].end=0;return{map:d,table:f}}function $(w,g){let f;const d=t.getBestModeForData(w);if(f=t.from(g,d),f!==t.BYTE&&f.bit<d.bit)throw new Error('"'+w+'" cannot be encoded with mode '+t.toString(f)+`.
 Suggested mode is: `+t.toString(d));switch(f===t.KANJI&&!s.isKanjiModeEnabled()&&(f=t.BYTE),f){case t.NUMERIC:return new i(w);case t.ALPHANUMERIC:return new n(w);case t.KANJI:return new e(w);case t.BYTE:return new r(w)}}o.fromArray=function(g){return g.reduce(function(f,d){return typeof d=="string"?f.push($(d,null)):d.data&&f.push($(d.data,d.mode)),f},[])},o.fromString=function(g,f){const d=E(g,s.isKanjiModeEnabled()),W=R(d),P=b(W,f),j=l.find_path(P.map,"start","end"),G=[];for(let dt=1;dt<j.length-1;dt++)G.push(P.table[j[dt]].node);return o.fromArray(m(G))},o.rawSplit=function(g){return o.fromArray(E(g,s.isKanjiModeEnabled()))}})(Ai);const Re=V,Se=Ce,kn=wn,zn=bn,Dn=Ii,Nn=Ei,De=Wi,Ne=$e,Mn=vn,le=Bi,Un=Pi,Fn=ft,Be=Ai;function Vn(o,t){const i=o.size,n=Nn.getPositions(t);for(let r=0;r<n.length;r++){const e=n[r][0],a=n[r][1];for(let s=-1;s<=7;s++)if(!(e+s<=-1||i<=e+s))for(let l=-1;l<=7;l++)a+l<=-1||i<=a+l||(s>=0&&s<=6&&(l===0||l===6)||l>=0&&l<=6&&(s===0||s===6)||s>=2&&s<=4&&l>=2&&l<=4?o.set(e+s,a+l,!0,!0):o.set(e+s,a+l,!1,!0))}}function qn(o){const t=o.size;for(let i=8;i<t-8;i++){const n=i%2===0;o.set(i,6,n,!0),o.set(6,i,n,!0)}}function Hn(o,t){const i=Dn.getPositions(t);for(let n=0;n<i.length;n++){const r=i[n][0],e=i[n][1];for(let a=-2;a<=2;a++)for(let s=-2;s<=2;s++)a===-2||a===2||s===-2||s===2||a===0&&s===0?o.set(r+a,e+s,!0,!0):o.set(r+a,e+s,!1,!0)}}function Kn(o,t){const i=o.size,n=le.getEncodedBits(t);let r,e,a;for(let s=0;s<18;s++)r=Math.floor(s/3),e=s%3+i-8-3,a=(n>>s&1)===1,o.set(r,e,a,!0),o.set(e,r,a,!0)}function Le(o,t,i){const n=o.size,r=Un.getEncodedBits(t,i);let e,a;for(e=0;e<15;e++)a=(r>>e&1)===1,e<6?o.set(e,8,a,!0):e<8?o.set(e+1,8,a,!0):o.set(n-15+e,8,a,!0),e<8?o.set(8,n-e-1,a,!0):e<9?o.set(8,15-e-1+1,a,!0):o.set(8,15-e-1,a,!0);o.set(n-8,8,1,!0)}function Gn(o,t){const i=o.size;let n=-1,r=i-1,e=7,a=0;for(let s=i-1;s>0;s-=2)for(s===6&&s--;;){for(let l=0;l<2;l++)if(!o.isReserved(r,s-l)){let h=!1;a<t.length&&(h=(t[a]>>>e&1)===1),o.set(r,s-l,h),e--,e===-1&&(a++,e=7)}if(r+=n,r<0||i<=r){r-=n,n=-n;break}}}function Yn(o,t,i){const n=new kn;i.forEach(function(l){n.put(l.mode.bit,4),n.put(l.getLength(),Fn.getCharCountIndicator(l.mode,o)),l.write(n)});const r=Re.getSymbolTotalCodewords(o),e=Ne.getTotalCodewordsCount(o,t),a=(r-e)*8;for(n.getLengthInBits()+4<=a&&n.put(0,4);n.getLengthInBits()%8!==0;)n.putBit(0);const s=(a-n.getLengthInBits())/8;for(let l=0;l<s;l++)n.put(l%2?17:236,8);return Jn(n,o,t)}function Jn(o,t,i){const n=Re.getSymbolTotalCodewords(t),r=Ne.getTotalCodewordsCount(t,i),e=n-r,a=Ne.getBlocksCount(t,i),s=n%a,l=a-s,h=Math.floor(n/a),p=Math.floor(e/a),E=p+1,C=h-p,m=new Mn(C);let R=0;const b=new Array(a),$=new Array(a);let w=0;const g=new Uint8Array(o.buffer);for(let j=0;j<a;j++){const G=j<l?p:E;b[j]=g.slice(R,R+G),$[j]=m.encode(b[j]),R+=G,w=Math.max(w,G)}const f=new Uint8Array(n);let d=0,W,P;for(W=0;W<w;W++)for(P=0;P<a;P++)W<b[P].length&&(f[d++]=b[P][W]);for(W=0;W<C;W++)for(P=0;P<a;P++)f[d++]=$[P][W];return f}function Qn(o,t,i,n){let r;if(Array.isArray(o))r=Be.fromArray(o);else if(typeof o=="string"){let h=t;if(!h){const p=Be.rawSplit(o);h=le.getBestVersionForData(p,i)}r=Be.fromString(o,h||40)}else throw new Error("Invalid data");const e=le.getBestVersionForData(r,i);if(!e)throw new Error("The amount of data is too big to be stored in a QR Code");if(!t)t=e;else if(t<e)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+e+`.
`);const a=Yn(t,i,r),s=Re.getSymbolSize(t),l=new zn(s);return Vn(l,t),qn(l),Hn(l,t),Le(l,i,0),t>=7&&Kn(l,t),Gn(l,a),isNaN(n)&&(n=De.getBestMask(l,Le.bind(null,l,i))),De.applyMask(n,l),Le(l,i,n),{modules:l,version:t,errorCorrectionLevel:i,maskPattern:n,segments:r}}Ti.create=function(t,i){if(typeof t>"u"||t==="")throw new Error("No input text");let n=Se.M,r,e;return typeof i<"u"&&(n=Se.from(i.errorCorrectionLevel,Se.M),r=le.from(i.version),e=De.from(i.maskPattern),i.toSJISFunc&&Re.setToSJISFunction(i.toSJISFunc)),Qn(t,r,n,e)};var ji={},ii={};(function(o){function t(i){if(typeof i=="number"&&(i=i.toString()),typeof i!="string")throw new Error("Color should be defined as hex string");let n=i.slice().replace("#","").split("");if(n.length<3||n.length===5||n.length>8)throw new Error("Invalid hex color: "+i);(n.length===3||n.length===4)&&(n=Array.prototype.concat.apply([],n.map(function(e){return[e,e]}))),n.length===6&&n.push("F","F");const r=parseInt(n.join(""),16);return{r:r>>24&255,g:r>>16&255,b:r>>8&255,a:r&255,hex:"#"+n.slice(0,6).join("")}}o.getOptions=function(n){n||(n={}),n.color||(n.color={});const r=typeof n.margin>"u"||n.margin===null||n.margin<0?4:n.margin,e=n.width&&n.width>=21?n.width:void 0,a=n.scale||4;return{width:e,scale:e?4:a,margin:r,color:{dark:t(n.color.dark||"#000000ff"),light:t(n.color.light||"#ffffffff")},type:n.type,rendererOpts:n.rendererOpts||{}}},o.getScale=function(n,r){return r.width&&r.width>=n+r.margin*2?r.width/(n+r.margin*2):r.scale},o.getImageWidth=function(n,r){const e=o.getScale(n,r);return Math.floor((n+r.margin*2)*e)},o.qrToImageData=function(n,r,e){const a=r.modules.size,s=r.modules.data,l=o.getScale(a,e),h=Math.floor((a+e.margin*2)*l),p=e.margin*l,E=[e.color.light,e.color.dark];for(let C=0;C<h;C++)for(let m=0;m<h;m++){let R=(C*h+m)*4,b=e.color.light;if(C>=p&&m>=p&&C<h-p&&m<h-p){const $=Math.floor((C-p)/l),w=Math.floor((m-p)/l);b=E[s[$*a+w]?1:0]}n[R++]=b.r,n[R++]=b.g,n[R++]=b.b,n[R]=b.a}}})(ii);(function(o){const t=ii;function i(r,e,a){r.clearRect(0,0,e.width,e.height),e.style||(e.style={}),e.height=a,e.width=a,e.style.height=a+"px",e.style.width=a+"px"}function n(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}o.render=function(e,a,s){let l=s,h=a;typeof l>"u"&&(!a||!a.getContext)&&(l=a,a=void 0),a||(h=n()),l=t.getOptions(l);const p=t.getImageWidth(e.modules.size,l),E=h.getContext("2d"),C=E.createImageData(p,p);return t.qrToImageData(C.data,e,l),i(E,h,p),E.putImageData(C,0,0),h},o.renderToDataURL=function(e,a,s){let l=s;typeof l>"u"&&(!a||!a.getContext)&&(l=a,a=void 0),l||(l={});const h=o.render(e,a,l),p=l.type||"image/png",E=l.rendererOpts||{};return h.toDataURL(p,E.quality)}})(ji);var ki={};const Xn=ii;function gi(o,t){const i=o.a/255,n=t+'="'+o.hex+'"';return i<1?n+" "+t+'-opacity="'+i.toFixed(2).slice(1)+'"':n}function Pe(o,t,i){let n=o+t;return typeof i<"u"&&(n+=" "+i),n}function Zn(o,t,i){let n="",r=0,e=!1,a=0;for(let s=0;s<o.length;s++){const l=Math.floor(s%t),h=Math.floor(s/t);!l&&!e&&(e=!0),o[s]?(a++,s>0&&l>0&&o[s-1]||(n+=e?Pe("M",l+i,.5+h+i):Pe("m",r,0),r=0,e=!1),l+1<t&&o[s+1]||(n+=Pe("h",a),a=0)):r++}return n}ki.render=function(t,i,n){const r=Xn.getOptions(i),e=t.modules.size,a=t.modules.data,s=e+r.margin*2,l=r.color.light.a?"<path "+gi(r.color.light,"fill")+' d="M0 0h'+s+"v"+s+'H0z"/>':"",h="<path "+gi(r.color.dark,"stroke")+' d="'+Zn(a,e,r.margin)+'"/>',p='viewBox="0 0 '+s+" "+s+'"',C='<svg xmlns="http://www.w3.org/2000/svg" '+(r.width?'width="'+r.width+'" height="'+r.width+'" ':"")+p+' shape-rendering="crispEdges">'+l+h+`</svg>
`;return typeof n=="function"&&n(null,C),C};const to=gn,Me=Ti,zi=ji,eo=ki;function ni(o,t,i,n,r){const e=[].slice.call(arguments,1),a=e.length,s=typeof e[a-1]=="function";if(!s&&!to())throw new Error("Callback required as last argument");if(s){if(a<2)throw new Error("Too few arguments provided");a===2?(r=i,i=t,t=n=void 0):a===3&&(t.getContext&&typeof r>"u"?(r=n,n=void 0):(r=n,n=i,i=t,t=void 0))}else{if(a<1)throw new Error("Too few arguments provided");return a===1?(i=t,t=n=void 0):a===2&&!t.getContext&&(n=i,i=t,t=void 0),new Promise(function(l,h){try{const p=Me.create(i,n);l(o(p,t,n))}catch(p){h(p)}})}try{const l=Me.create(i,n);r(null,o(l,t,n))}catch(l){r(l)}}Vt.create=Me.create;Vt.toCanvas=ni.bind(null,zi.render);Vt.toDataURL=ni.bind(null,zi.renderToDataURL);Vt.toString=ni.bind(null,function(o,t,i){return eo.render(o,i)});const io=.1,fi=2.5,at=7;function Oe(o,t,i){return o===t?!1:(o-t<0?t-o:o-t)<=i+io}function no(o,t){const i=Array.prototype.slice.call(Vt.create(o,{errorCorrectionLevel:t}).modules.data,0),n=Math.sqrt(i.length);return i.reduce((r,e,a)=>(a%n===0?r.push([e]):r[r.length-1].push(e))&&r,[])}const oo={generate({uri:o,size:t,logoSize:i,dotColor:n="#141414"}){const r="transparent",a=[],s=no(o,"Q"),l=t/s.length,h=[{x:0,y:0},{x:1,y:0},{x:0,y:1}];h.forEach(({x:b,y:$})=>{const w=(s.length-at)*l*b,g=(s.length-at)*l*$,f=.45;for(let d=0;d<h.length;d+=1){const W=l*(at-d*2);a.push(At`
            <rect
              fill=${d===2?n:r}
              width=${d===0?W-5:W}
              rx= ${d===0?(W-5)*f:W*f}
              ry= ${d===0?(W-5)*f:W*f}
              stroke=${n}
              stroke-width=${d===0?5:0}
              height=${d===0?W-5:W}
              x= ${d===0?g+l*d+5/2:g+l*d}
              y= ${d===0?w+l*d+5/2:w+l*d}
            />
          `)}});const p=Math.floor((i+25)/l),E=s.length/2-p/2,C=s.length/2+p/2-1,m=[];s.forEach((b,$)=>{b.forEach((w,g)=>{if(s[$][g]&&!($<at&&g<at||$>s.length-(at+1)&&g<at||$<at&&g>s.length-(at+1))&&!($>E&&$<C&&g>E&&g<C)){const f=$*l+l/2,d=g*l+l/2;m.push([f,d])}})});const R={};return m.forEach(([b,$])=>{R[b]?R[b]?.push($):R[b]=[$]}),Object.entries(R).map(([b,$])=>{const w=$.filter(g=>$.every(f=>!Oe(g,f,l)));return[Number(b),w]}).forEach(([b,$])=>{$.forEach(w=>{a.push(At`<circle cx=${b} cy=${w} fill=${n} r=${l/fi} />`)})}),Object.entries(R).filter(([b,$])=>$.length>1).map(([b,$])=>{const w=$.filter(g=>$.some(f=>Oe(g,f,l)));return[Number(b),w]}).map(([b,$])=>{$.sort((g,f)=>g<f?-1:1);const w=[];for(const g of $){const f=w.find(d=>d.some(W=>Oe(g,W,l)));f?f.push(g):w.push([g])}return[b,w.map(g=>[g[0],g[g.length-1]])]}).forEach(([b,$])=>{$.forEach(([w,g])=>{a.push(At`
              <line
                x1=${b}
                x2=${b}
                y1=${w}
                y2=${g}
                stroke=${n}
                stroke-width=${l/(fi/2)}
                stroke-linecap="round"
              />
            `)})}),a}},ro=B`
  :host {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    width: var(--local-size);
  }

  :host([data-theme='dark']) {
    border-radius: clamp(0px, var(--wui-border-radius-l), 40px);
    background-color: var(--wui-color-inverse-100);
    padding: var(--wui-spacing-l);
  }

  :host([data-theme='light']) {
    box-shadow: 0 0 0 1px var(--wui-color-bg-125);
    background-color: var(--wui-color-bg-125);
  }

  :host([data-clear='true']) > wui-icon {
    display: none;
  }

  svg:first-child,
  wui-image,
  wui-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
  }

  wui-image {
    width: 25%;
    height: 25%;
    border-radius: var(--wui-border-radius-xs);
  }

  wui-icon {
    width: 100%;
    height: 100%;
    color: var(--local-icon-color) !important;
    transform: translateY(-50%) translateX(-50%) scale(0.25);
  }
`;var ut=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};const ao="#3396ff";let Q=class extends T{constructor(){super(...arguments),this.uri="",this.size=0,this.theme="dark",this.imageSrc=void 0,this.alt=void 0,this.arenaClear=void 0,this.farcaster=void 0}render(){return this.dataset.theme=this.theme,this.dataset.clear=String(this.arenaClear),this.style.cssText=`
     --local-size: ${this.size}px;
     --local-icon-color: ${this.color??ao}
    `,c`${this.templateVisual()} ${this.templateSvg()}`}templateSvg(){const t=this.theme==="light"?this.size:this.size-32;return At`
      <svg height=${t} width=${t}>
        ${oo.generate({uri:this.uri,size:t,logoSize:this.arenaClear?0:t/4,dotColor:this.color})}
      </svg>
    `}templateVisual(){return this.imageSrc?c`<wui-image src=${this.imageSrc} alt=${this.alt??"logo"}></wui-image>`:this.farcaster?c`<wui-icon
        class="farcaster"
        size="inherit"
        color="inherit"
        name="farcaster"
      ></wui-icon>`:c`<wui-icon size="inherit" color="inherit" name="walletConnect"></wui-icon>`}};Q.styles=[A,ro];ut([u()],Q.prototype,"uri",void 0);ut([u({type:Number})],Q.prototype,"size",void 0);ut([u()],Q.prototype,"theme",void 0);ut([u()],Q.prototype,"imageSrc",void 0);ut([u()],Q.prototype,"alt",void 0);ut([u()],Q.prototype,"color",void 0);ut([u({type:Boolean})],Q.prototype,"arenaClear",void 0);ut([u({type:Boolean})],Q.prototype,"farcaster",void 0);Q=ut([x("wui-qr-code")],Q);const so=B`
  :host {
    display: block;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
    background: linear-gradient(
      120deg,
      var(--wui-color-bg-200) 5%,
      var(--wui-color-bg-200) 48%,
      var(--wui-color-bg-300) 55%,
      var(--wui-color-bg-300) 60%,
      var(--wui-color-bg-300) calc(60% + 10px),
      var(--wui-color-bg-200) calc(60% + 12px),
      var(--wui-color-bg-200) 100%
    );
    background-size: 250%;
    animation: shimmer 3s linear infinite reverse;
  }

  :host([variant='light']) {
    background: linear-gradient(
      120deg,
      var(--wui-color-bg-150) 5%,
      var(--wui-color-bg-150) 48%,
      var(--wui-color-bg-200) 55%,
      var(--wui-color-bg-200) 60%,
      var(--wui-color-bg-200) calc(60% + 10px),
      var(--wui-color-bg-150) calc(60% + 12px),
      var(--wui-color-bg-150) 100%
    );
    background-size: 250%;
  }

  @keyframes shimmer {
    from {
      background-position: -250% 0;
    }
    to {
      background-position: 250% 0;
    }
  }
`;var Ht=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let vt=class extends T{constructor(){super(...arguments),this.width="",this.height="",this.borderRadius="m",this.variant="default"}render(){return this.style.cssText=`
      width: ${this.width};
      height: ${this.height};
      border-radius: ${`clamp(0px,var(--wui-border-radius-${this.borderRadius}), 40px)`};
    `,c`<slot></slot>`}};vt.styles=[so];Ht([u()],vt.prototype,"width",void 0);Ht([u()],vt.prototype,"height",void 0);Ht([u()],vt.prototype,"borderRadius",void 0);Ht([u()],vt.prototype,"variant",void 0);vt=Ht([x("wui-shimmer")],vt);const lo="https://reown.com",co=B`
  .reown-logo {
    height: var(--wui-spacing-xxl);
  }

  a {
    text-decoration: none;
    cursor: pointer;
  }

  a:hover {
    opacity: 0.9;
  }
`;var uo=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let Ue=class extends T{render(){return c`
      <a
        data-testid="ux-branding-reown"
        href=${lo}
        rel="noreferrer"
        target="_blank"
        style="text-decoration: none;"
      >
        <wui-flex
          justifyContent="center"
          alignItems="center"
          gap="xs"
          .padding=${["0","0","l","0"]}
        >
          <wui-text variant="small-500" color="fg-100"> UX by </wui-text>
          <wui-icon name="reown" size="xxxl" class="reown-logo"></wui-icon>
        </wui-flex>
      </a>
    `}};Ue.styles=[A,M,co];Ue=uo([x("wui-ux-by-reown")],Ue);const ho=B`
  @keyframes fadein {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  wui-shimmer {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: clamp(0px, var(--wui-border-radius-l), 40px) !important;
  }

  wui-qr-code {
    opacity: 0;
    animation-duration: 200ms;
    animation-timing-function: ease;
    animation-name: fadein;
    animation-fill-mode: forwards;
  }
`;var po=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let Fe=class extends z{constructor(){super(),this.forceUpdate=()=>{this.requestUpdate()},window.addEventListener("resize",this.forceUpdate),J.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet?.name??"WalletConnect",platform:"qrcode"}})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe?.forEach(t=>t()),window.removeEventListener("resize",this.forceUpdate)}render(){return this.onRenderProxy(),c`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["0","xl","xl","xl"]}
        gap="xl"
      >
        <wui-shimmer borderRadius="l" width="100%"> ${this.qrCodeTemplate()} </wui-shimmer>

        <wui-text variant="paragraph-500" color="fg-100">
          Scan this QR Code with your phone
        </wui-text>
        ${this.copyTemplate()}
      </wui-flex>
      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}onRenderProxy(){!this.ready&&this.uri&&(this.timeout=setTimeout(()=>{this.ready=!0},200))}qrCodeTemplate(){if(!this.uri||!this.ready)return null;const t=this.getBoundingClientRect().width-40,i=this.wallet?this.wallet.name:void 0;return _.setWcLinking(void 0),_.setRecentWallet(this.wallet),c` <wui-qr-code
      size=${t}
      theme=${ke.state.themeMode}
      uri=${this.uri}
      imageSrc=${y(D.getWalletImage(this.wallet))}
      color=${y(ke.state.themeVariables["--w3m-qr-color"])}
      alt=${y(i)}
      data-testid="wui-qr-code"
    ></wui-qr-code>`}copyTemplate(){const t=!this.uri||!this.ready;return c`<wui-link
      .disabled=${t}
      @click=${this.onCopyUri}
      color="fg-200"
      data-testid="copy-wc2-uri"
    >
      <wui-icon size="xs" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
      Copy link
    </wui-link>`}};Fe.styles=ho;Fe=po([x("w3m-connecting-wc-qrcode")],Fe);var go=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let wi=class extends T{constructor(){if(super(),this.wallet=O.state.data?.wallet,!this.wallet)throw new Error("w3m-connecting-wc-unsupported: No wallet provided");J.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"browser"}})}render(){return c`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${["3xl","xl","xl","xl"]}
        gap="xl"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${y(D.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="paragraph-500" color="fg-100">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `}};wi=go([x("w3m-connecting-wc-unsupported")],wi);var Di=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let Ve=class extends z{constructor(){if(super(),this.isLoading=!0,!this.wallet)throw new Error("w3m-connecting-wc-web: No wallet provided");this.onConnect=this.onConnectProxy.bind(this),this.secondaryBtnLabel="Open",this.secondaryLabel=yi.CONNECT_LABELS.MOBILE,this.secondaryBtnIcon="externalLink",this.updateLoadingState(),this.unsubscribe.push(_.subscribeKey("wcUri",()=>{this.updateLoadingState()})),J.sendEvent({type:"track",event:"SELECT_WALLET",properties:{name:this.wallet.name,platform:"web"}})}updateLoadingState(){this.isLoading=!this.uri}onConnectProxy(){if(this.wallet?.webapp_link&&this.uri)try{this.error=!1;const{webapp_link:t,name:i}=this.wallet,{redirect:n,href:r}=I.formatUniversalUrl(t,this.uri);_.setWcLinking({name:i,href:r}),_.setRecentWallet(this.wallet),I.openHref(n,"_blank")}catch{this.error=!0}}};Di([v()],Ve.prototype,"isLoading",void 0);Ve=Di([x("w3m-connecting-wc-web")],Ve);var Kt=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let _t=class extends T{constructor(){super(),this.wallet=O.state.data?.wallet,this.unsubscribe=[],this.platform=void 0,this.platforms=[],this.isSiwxEnabled=!!Y.state.siwx,this.remoteFeatures=Y.state.remoteFeatures,this.determinePlatforms(),this.initializeConnection(),this.unsubscribe.push(Y.subscribeKey("remoteFeatures",t=>this.remoteFeatures=t))}disconnectedCallback(){this.unsubscribe.forEach(t=>t())}render(){return c`
      ${this.headerTemplate()}
      <div>${this.platformTemplate()}</div>
      ${this.reownBrandingTemplate()}
    `}reownBrandingTemplate(){return this.remoteFeatures?.reownBranding?c`<wui-ux-by-reown></wui-ux-by-reown>`:null}async initializeConnection(t=!1){if(!(this.platform==="browser"||Y.state.manualWCControl&&!t))try{const{wcPairingExpiry:i,status:n}=_.state;(t||Y.state.enableEmbedded||I.isPairingExpired(i)||n==="connecting")&&(await _.connectWalletConnect(),this.isSiwxEnabled||vi.close())}catch(i){J.sendEvent({type:"track",event:"CONNECT_ERROR",properties:{message:i?.message??"Unknown"}}),_.setWcError(!0),Qt.showError(i.message??"Connection error"),_.resetWcConnection(),O.goBack()}}determinePlatforms(){if(!this.wallet){this.platforms.push("qrcode"),this.platform="qrcode";return}if(this.platform)return;const{mobile_link:t,desktop_link:i,webapp_link:n,injected:r,rdns:e}=this.wallet,a=r?.map(({injected_id:R})=>R).filter(Boolean),s=[...e?[e]:a??[]],l=Y.state.isUniversalProvider?!1:s.length,h=t,p=n,E=_.checkInstalled(s),C=l&&E,m=i&&!I.isMobile();C&&!je.state.noAdapters&&this.platforms.push("browser"),h&&this.platforms.push(I.isMobile()?"mobile":"qrcode"),p&&this.platforms.push("web"),m&&this.platforms.push("desktop"),!C&&l&&!je.state.noAdapters&&this.platforms.push("unsupported"),this.platform=this.platforms[0]}platformTemplate(){switch(this.platform){case"browser":return c`<w3m-connecting-wc-browser></w3m-connecting-wc-browser>`;case"web":return c`<w3m-connecting-wc-web></w3m-connecting-wc-web>`;case"desktop":return c`
          <w3m-connecting-wc-desktop .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-desktop>
        `;case"mobile":return c`
          <w3m-connecting-wc-mobile isMobile .onRetry=${()=>this.initializeConnection(!0)}>
          </w3m-connecting-wc-mobile>
        `;case"qrcode":return c`<w3m-connecting-wc-qrcode></w3m-connecting-wc-qrcode>`;default:return c`<w3m-connecting-wc-unsupported></w3m-connecting-wc-unsupported>`}}headerTemplate(){return this.platforms.length>1?c`
      <w3m-connecting-header
        .platforms=${this.platforms}
        .onSelectPlatfrom=${this.onSelectPlatform.bind(this)}
      >
      </w3m-connecting-header>
    `:null}async onSelectPlatform(t){const i=this.shadowRoot?.querySelector("div");i&&(await i.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.platform=t,i.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}};Kt([v()],_t.prototype,"platform",void 0);Kt([v()],_t.prototype,"platforms",void 0);Kt([v()],_t.prototype,"isSiwxEnabled",void 0);Kt([v()],_t.prototype,"remoteFeatures",void 0);_t=Kt([x("w3m-connecting-wc-view")],_t);var Ni=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let qe=class extends T{constructor(){super(...arguments),this.isMobile=I.isMobile()}render(){if(this.isMobile){const{featured:t,recommended:i}=S.state,{customWallets:n}=Y.state,r=ge.getRecentWallets(),e=t.length||i.length||n?.length||r.length;return c`<wui-flex
        flexDirection="column"
        gap="xs"
        .margin=${["3xs","s","s","s"]}
      >
        ${e?c`<w3m-connector-list></w3m-connector-list>`:null}
        <w3m-all-wallets-widget></w3m-all-wallets-widget>
      </wui-flex>`}return c`<wui-flex flexDirection="column" .padding=${["0","0","l","0"]}>
      <w3m-connecting-wc-view></w3m-connecting-wc-view>
      <wui-flex flexDirection="column" .padding=${["0","m","0","m"]}>
        <w3m-all-wallets-widget></w3m-all-wallets-widget> </wui-flex
    ></wui-flex>`}};Ni([v()],qe.prototype,"isMobile",void 0);qe=Ni([x("w3m-connecting-wc-basic-view")],qe);/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const oi=()=>new fo;class fo{}const Ae=new WeakMap,ri=Ki(class extends Gi{render(o){return li}update(o,[t]){const i=t!==this.G;return i&&this.G!==void 0&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=t,this.ht=o.options?.host,this.rt(this.ct=o.element)),li}rt(o){if(this.isConnected||(o=void 0),typeof this.G=="function"){const t=this.ht??globalThis;let i=Ae.get(t);i===void 0&&(i=new WeakMap,Ae.set(t,i)),i.get(this.G)!==void 0&&this.G.call(this.ht,void 0),i.set(this.G,o),o!==void 0&&this.G.call(this.ht,o)}else this.G.value=o}get lt(){return typeof this.G=="function"?Ae.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}}),wo=B`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  label {
    position: relative;
    display: inline-block;
    width: 32px;
    height: 22px;
  }

  input {
    width: 0;
    height: 0;
    opacity: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--wui-color-blue-100);
    border-width: 1px;
    border-style: solid;
    border-color: var(--wui-color-gray-glass-002);
    border-radius: 999px;
    transition:
      background-color var(--wui-ease-inout-power-1) var(--wui-duration-md),
      border-color var(--wui-ease-inout-power-1) var(--wui-duration-md);
    will-change: background-color, border-color;
  }

  span:before {
    position: absolute;
    content: '';
    height: 16px;
    width: 16px;
    left: 3px;
    top: 2px;
    background-color: var(--wui-color-inverse-100);
    transition: transform var(--wui-ease-inout-power-1) var(--wui-duration-lg);
    will-change: transform;
    border-radius: 50%;
  }

  input:checked + span {
    border-color: var(--wui-color-gray-glass-005);
    background-color: var(--wui-color-blue-100);
  }

  input:not(:checked) + span {
    background-color: var(--wui-color-gray-glass-010);
  }

  input:checked + span:before {
    transform: translateX(calc(100% - 7px));
  }
`;var Mi=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let ce=class extends T{constructor(){super(...arguments),this.inputElementRef=oi(),this.checked=void 0}render(){return c`
      <label>
        <input
          ${ri(this.inputElementRef)}
          type="checkbox"
          ?checked=${y(this.checked)}
          @change=${this.dispatchChangeEvent.bind(this)}
        />
        <span></span>
      </label>
    `}dispatchChangeEvent(){this.dispatchEvent(new CustomEvent("switchChange",{detail:this.inputElementRef.value?.checked,bubbles:!0,composed:!0}))}};ce.styles=[A,M,Hi,wo];Mi([u({type:Boolean})],ce.prototype,"checked",void 0);ce=Mi([x("wui-switch")],ce);const bo=B`
  :host {
    height: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: var(--wui-spacing-1xs);
    padding: var(--wui-spacing-xs) var(--wui-spacing-s);
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    transition: background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`;var Ui=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let ue=class extends T{constructor(){super(...arguments),this.checked=void 0}render(){return c`
      <button>
        <wui-icon size="xl" name="walletConnectBrown"></wui-icon>
        <wui-switch ?checked=${y(this.checked)}></wui-switch>
      </button>
    `}};ue.styles=[A,M,bo];Ui([u({type:Boolean})],ue.prototype,"checked",void 0);ue=Ui([x("wui-certified-switch")],ue);const mo=B`
  button {
    background-color: var(--wui-color-fg-300);
    border-radius: var(--wui-border-radius-4xs);
    width: 16px;
    height: 16px;
  }

  button:disabled {
    background-color: var(--wui-color-bg-300);
  }

  wui-icon {
    color: var(--wui-color-bg-200) !important;
  }

  button:focus-visible {
    background-color: var(--wui-color-fg-250);
    border: 1px solid var(--wui-color-accent-100);
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: var(--wui-color-fg-250);
    }

    button:active:enabled {
      background-color: var(--wui-color-fg-225);
    }
  }
`;var Fi=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let de=class extends T{constructor(){super(...arguments),this.icon="copy"}render(){return c`
      <button>
        <wui-icon color="inherit" size="xxs" name=${this.icon}></wui-icon>
      </button>
    `}};de.styles=[A,M,mo];Fi([u()],de.prototype,"icon",void 0);de=Fi([x("wui-input-element")],de);const vo=B`
  :host {
    position: relative;
    width: 100%;
    display: inline-block;
    color: var(--wui-color-fg-275);
  }

  input {
    width: 100%;
    border-radius: var(--wui-border-radius-xs);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-002);
    background: var(--wui-color-gray-glass-002);
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
    color: var(--wui-color-fg-100);
    transition:
      background-color var(--wui-ease-inout-power-1) var(--wui-duration-md),
      border-color var(--wui-ease-inout-power-1) var(--wui-duration-md),
      box-shadow var(--wui-ease-inout-power-1) var(--wui-duration-md);
    will-change: background-color, border-color, box-shadow;
    caret-color: var(--wui-color-accent-100);
  }

  input:disabled {
    cursor: not-allowed;
    border: 1px solid var(--wui-color-gray-glass-010);
  }

  input:disabled::placeholder,
  input:disabled + wui-icon {
    color: var(--wui-color-fg-300);
  }

  input::placeholder {
    color: var(--wui-color-fg-275);
  }

  input:focus:enabled {
    background-color: var(--wui-color-gray-glass-005);
    -webkit-box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0px 0px 0px 4px var(--wui-box-shadow-blue);
    -moz-box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0px 0px 0px 4px var(--wui-box-shadow-blue);
    box-shadow:
      inset 0 0 0 1px var(--wui-color-accent-100),
      0px 0px 0px 4px var(--wui-box-shadow-blue);
  }

  input:hover:enabled {
    background-color: var(--wui-color-gray-glass-005);
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .wui-size-sm {
    padding: 9px var(--wui-spacing-m) 10px var(--wui-spacing-s);
  }

  wui-icon + .wui-size-sm {
    padding: 9px var(--wui-spacing-m) 10px 36px;
  }

  wui-icon[data-input='sm'] {
    left: var(--wui-spacing-s);
  }

  .wui-size-md {
    padding: 15px var(--wui-spacing-m) var(--wui-spacing-l) var(--wui-spacing-m);
  }

  wui-icon + .wui-size-md,
  wui-loading-spinner + .wui-size-md {
    padding: 10.5px var(--wui-spacing-3xl) 10.5px var(--wui-spacing-3xl);
  }

  wui-icon[data-input='md'] {
    left: var(--wui-spacing-l);
  }

  .wui-size-lg {
    padding: var(--wui-spacing-s) var(--wui-spacing-s) var(--wui-spacing-s) var(--wui-spacing-l);
    letter-spacing: var(--wui-letter-spacing-medium-title);
    font-size: var(--wui-font-size-medium-title);
    font-weight: var(--wui-font-weight-light);
    line-height: 130%;
    color: var(--wui-color-fg-100);
    height: 64px;
  }

  .wui-padding-right-xs {
    padding-right: var(--wui-spacing-xs);
  }

  .wui-padding-right-s {
    padding-right: var(--wui-spacing-s);
  }

  .wui-padding-right-m {
    padding-right: var(--wui-spacing-m);
  }

  .wui-padding-right-l {
    padding-right: var(--wui-spacing-l);
  }

  .wui-padding-right-xl {
    padding-right: var(--wui-spacing-xl);
  }

  .wui-padding-right-2xl {
    padding-right: var(--wui-spacing-2xl);
  }

  .wui-padding-right-3xl {
    padding-right: var(--wui-spacing-3xl);
  }

  .wui-padding-right-4xl {
    padding-right: var(--wui-spacing-4xl);
  }

  .wui-padding-right-5xl {
    padding-right: var(--wui-spacing-5xl);
  }

  wui-icon + .wui-size-lg,
  wui-loading-spinner + .wui-size-lg {
    padding-left: 50px;
  }

  wui-icon[data-input='lg'] {
    left: var(--wui-spacing-l);
  }

  .wui-size-mdl {
    padding: 17.25px var(--wui-spacing-m) 17.25px var(--wui-spacing-m);
  }
  wui-icon + .wui-size-mdl,
  wui-loading-spinner + .wui-size-mdl {
    padding: 17.25px var(--wui-spacing-3xl) 17.25px 40px;
  }
  wui-icon[data-input='mdl'] {
    left: var(--wui-spacing-m);
  }

  input:placeholder-shown ~ ::slotted(wui-input-element),
  input:placeholder-shown ~ ::slotted(wui-icon) {
    opacity: 0;
    pointer-events: none;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type='number'] {
    -moz-appearance: textfield;
  }

  ::slotted(wui-input-element),
  ::slotted(wui-icon) {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  ::slotted(wui-input-element) {
    right: var(--wui-spacing-m);
  }

  ::slotted(wui-icon) {
    right: 0px;
  }
`;var ot=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let H=class extends T{constructor(){super(...arguments),this.inputElementRef=oi(),this.size="md",this.disabled=!1,this.placeholder="",this.type="text",this.value=""}render(){const t=`wui-padding-right-${this.inputRightPadding}`,n={[`wui-size-${this.size}`]:!0,[t]:!!this.inputRightPadding};return c`${this.templateIcon()}
      <input
        data-testid="wui-input-text"
        ${ri(this.inputElementRef)}
        class=${Yi(n)}
        type=${this.type}
        enterkeyhint=${y(this.enterKeyHint)}
        ?disabled=${this.disabled}
        placeholder=${this.placeholder}
        @input=${this.dispatchInputChangeEvent.bind(this)}
        .value=${this.value||""}
        tabindex=${y(this.tabIdx)}
      />
      <slot></slot>`}templateIcon(){return this.icon?c`<wui-icon
        data-input=${this.size}
        size=${this.size}
        color="inherit"
        name=${this.icon}
      ></wui-icon>`:null}dispatchInputChangeEvent(){this.dispatchEvent(new CustomEvent("inputChange",{detail:this.inputElementRef.value?.value,bubbles:!0,composed:!0}))}};H.styles=[A,M,vo];ot([u()],H.prototype,"size",void 0);ot([u()],H.prototype,"icon",void 0);ot([u({type:Boolean})],H.prototype,"disabled",void 0);ot([u()],H.prototype,"placeholder",void 0);ot([u()],H.prototype,"type",void 0);ot([u()],H.prototype,"keyHint",void 0);ot([u()],H.prototype,"value",void 0);ot([u()],H.prototype,"inputRightPadding",void 0);ot([u()],H.prototype,"tabIdx",void 0);H=ot([x("wui-input-text")],H);const yo=B`
  :host {
    position: relative;
    display: inline-block;
    width: 100%;
  }
`;var xo=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let He=class extends T{constructor(){super(...arguments),this.inputComponentRef=oi()}render(){return c`
      <wui-input-text
        ${ri(this.inputComponentRef)}
        placeholder="Search wallet"
        icon="search"
        type="search"
        enterKeyHint="search"
        size="sm"
      >
        <wui-input-element @click=${this.clearValue} icon="close"></wui-input-element>
      </wui-input-text>
    `}clearValue(){const i=this.inputComponentRef.value?.inputElementRef.value;i&&(i.value="",i.focus(),i.dispatchEvent(new Event("input")))}};He.styles=[A,yo];He=xo([x("wui-search-bar")],He);const Co=At`<svg  viewBox="0 0 48 54" fill="none">
  <path
    d="M43.4605 10.7248L28.0485 1.61089C25.5438 0.129705 22.4562 0.129705 19.9515 1.61088L4.53951 10.7248C2.03626 12.2051 0.5 14.9365 0.5 17.886V36.1139C0.5 39.0635 2.03626 41.7949 4.53951 43.2752L19.9515 52.3891C22.4562 53.8703 25.5438 53.8703 28.0485 52.3891L43.4605 43.2752C45.9637 41.7949 47.5 39.0635 47.5 36.114V17.8861C47.5 14.9365 45.9637 12.2051 43.4605 10.7248Z"
  />
</svg>`,$o=B`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 104px;
    row-gap: var(--wui-spacing-xs);
    padding: var(--wui-spacing-xs) 10px;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: clamp(0px, var(--wui-border-radius-xs), 20px);
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    -webkit-clip-path: var(--wui-path-network);
    clip-path: var(--wui-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: var(--wui-color-gray-glass-010);
    stroke-width: 1px;
  }

  @media (max-width: 350px) {
    :host {
      width: 100%;
    }
  }
`;var Vi=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let he=class extends T{constructor(){super(...arguments),this.type="wallet"}render(){return c`
      ${this.shimmerTemplate()}
      <wui-shimmer width="56px" height="20px" borderRadius="xs"></wui-shimmer>
    `}shimmerTemplate(){return this.type==="network"?c` <wui-shimmer
          data-type=${this.type}
          width="48px"
          height="54px"
          borderRadius="xs"
        ></wui-shimmer>
        ${Co}`:c`<wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>`}};he.styles=[A,M,$o];Vi([u()],he.prototype,"type",void 0);he=Vi([x("wui-card-select-loader")],he);const To=B`
  :host {
    display: grid;
    width: inherit;
    height: inherit;
  }
`;var K=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let N=class extends T{render(){return this.style.cssText=`
      grid-template-rows: ${this.gridTemplateRows};
      grid-template-columns: ${this.gridTemplateColumns};
      justify-items: ${this.justifyItems};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      align-content: ${this.alignContent};
      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};
      padding-top: ${this.padding&&st.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&st.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&st.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&st.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&st.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&st.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&st.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&st.getSpacingStyles(this.margin,3)};
    `,c`<slot></slot>`}};N.styles=[A,To];K([u()],N.prototype,"gridTemplateRows",void 0);K([u()],N.prototype,"gridTemplateColumns",void 0);K([u()],N.prototype,"justifyItems",void 0);K([u()],N.prototype,"alignItems",void 0);K([u()],N.prototype,"justifyContent",void 0);K([u()],N.prototype,"alignContent",void 0);K([u()],N.prototype,"columnGap",void 0);K([u()],N.prototype,"rowGap",void 0);K([u()],N.prototype,"gap",void 0);K([u()],N.prototype,"padding",void 0);K([u()],N.prototype,"margin",void 0);N=K([x("wui-grid")],N);const Ro=B`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: var(--wui-spacing-xs);
    padding: var(--wui-spacing-s) var(--wui-spacing-0);
    background-color: var(--wui-color-gray-glass-002);
    border-radius: clamp(0px, var(--wui-border-radius-xs), 20px);
    transition:
      color var(--wui-duration-lg) var(--wui-ease-out-power-1),
      background-color var(--wui-duration-lg) var(--wui-ease-out-power-1),
      border-radius var(--wui-duration-lg) var(--wui-ease-out-power-1);
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: var(--wui-color-fg-100);
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  button:hover:enabled {
    background-color: var(--wui-color-gray-glass-005);
  }

  button:disabled > wui-flex > wui-text {
    color: var(--wui-color-gray-glass-015);
  }

  [data-selected='true'] {
    background-color: var(--wui-color-accent-glass-020);
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: var(--wui-color-accent-glass-015);
    }
  }

  [data-selected='true']:active:enabled {
    background-color: var(--wui-color-accent-glass-010);
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`;var Gt=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let yt=class extends T{constructor(){super(),this.observer=new IntersectionObserver(()=>{}),this.visible=!1,this.imageSrc=void 0,this.imageLoading=!1,this.wallet=void 0,this.observer=new IntersectionObserver(t=>{t.forEach(i=>{i.isIntersecting?(this.visible=!0,this.fetchImageSrc()):this.visible=!1})},{threshold:.01})}firstUpdated(){this.observer.observe(this)}disconnectedCallback(){this.observer.disconnect()}render(){const t=this.wallet?.badge_type==="certified";return c`
      <button>
        ${this.imageTemplate()}
        <wui-flex flexDirection="row" alignItems="center" justifyContent="center" gap="3xs">
          <wui-text
            variant="tiny-500"
            color="inherit"
            class=${y(t?"certified":void 0)}
            >${this.wallet?.name}</wui-text
          >
          ${t?c`<wui-icon size="sm" name="walletConnectBrown"></wui-icon>`:null}
        </wui-flex>
      </button>
    `}imageTemplate(){return!this.visible&&!this.imageSrc||this.imageLoading?this.shimmerTemplate():c`
      <wui-wallet-image
        size="md"
        imageSrc=${y(this.imageSrc)}
        name=${this.wallet?.name}
        .installed=${this.wallet?.installed}
        badgeSize="sm"
      >
      </wui-wallet-image>
    `}shimmerTemplate(){return c`<wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>`}async fetchImageSrc(){this.wallet&&(this.imageSrc=D.getWalletImage(this.wallet),!this.imageSrc&&(this.imageLoading=!0,this.imageSrc=await D.fetchWalletImage(this.wallet.image_id),this.imageLoading=!1))}};yt.styles=Ro;Gt([v()],yt.prototype,"visible",void 0);Gt([v()],yt.prototype,"imageSrc",void 0);Gt([v()],yt.prototype,"imageLoading",void 0);Gt([u()],yt.prototype,"wallet",void 0);yt=Gt([x("w3m-all-wallets-list-item")],yt);const Io=B`
  wui-grid {
    max-height: clamp(360px, 400px, 80vh);
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    padding-top: var(--wui-spacing-l);
    padding-bottom: var(--wui-spacing-l);
    justify-content: center;
    grid-column: 1 / span 4;
  }
`;var Pt=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};const bi="local-paginator";let pt=class extends T{constructor(){super(),this.unsubscribe=[],this.paginationObserver=void 0,this.loading=!S.state.wallets.length,this.wallets=S.state.wallets,this.recommended=S.state.recommended,this.featured=S.state.featured,this.filteredWallets=S.state.filteredWallets,this.unsubscribe.push(S.subscribeKey("wallets",t=>this.wallets=t),S.subscribeKey("recommended",t=>this.recommended=t),S.subscribeKey("featured",t=>this.featured=t),S.subscribeKey("filteredWallets",t=>this.filteredWallets=t))}firstUpdated(){this.initialFetch(),this.createPaginationObserver()}disconnectedCallback(){this.unsubscribe.forEach(t=>t()),this.paginationObserver?.disconnect()}render(){return c`
      <wui-grid
        data-scroll=${!this.loading}
        .padding=${["0","s","s","s"]}
        columnGap="xxs"
        rowGap="l"
        justifyContent="space-between"
      >
        ${this.loading?this.shimmerTemplate(16):this.walletsTemplate()}
        ${this.paginationLoaderTemplate()}
      </wui-grid>
    `}async initialFetch(){this.loading=!0;const t=this.shadowRoot?.querySelector("wui-grid");t&&(await S.fetchWalletsByPage({page:1}),await t.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.loading=!1,t.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}shimmerTemplate(t,i){return[...Array(t)].map(()=>c`
        <wui-card-select-loader type="wallet" id=${y(i)}></wui-card-select-loader>
      `)}walletsTemplate(){const t=this.filteredWallets?.length>0?I.uniqueBy([...this.featured,...this.recommended,...this.filteredWallets],"id"):I.uniqueBy([...this.featured,...this.recommended,...this.wallets],"id");return fe.markWalletsAsInstalled(t).map(n=>c`
        <w3m-all-wallets-list-item
          @click=${()=>this.onConnectWallet(n)}
          .wallet=${n}
        ></w3m-all-wallets-list-item>
      `)}paginationLoaderTemplate(){const{wallets:t,recommended:i,featured:n,count:r}=S.state,e=window.innerWidth<352?3:4,a=t.length+i.length;let l=Math.ceil(a/e)*e-a+e;return l-=t.length?n.length%e:0,r===0&&n.length>0?null:r===0||[...n,...t,...i].length<r?this.shimmerTemplate(l,bi):null}createPaginationObserver(){const t=this.shadowRoot?.querySelector(`#${bi}`);t&&(this.paginationObserver=new IntersectionObserver(([i])=>{if(i?.isIntersecting&&!this.loading){const{page:n,count:r,wallets:e}=S.state;e.length<r&&S.fetchWalletsByPage({page:n+1})}}),this.paginationObserver.observe(t))}onConnectWallet(t){L.selectWalletConnector(t)}};pt.styles=Io;Pt([v()],pt.prototype,"loading",void 0);Pt([v()],pt.prototype,"wallets",void 0);Pt([v()],pt.prototype,"recommended",void 0);Pt([v()],pt.prototype,"featured",void 0);Pt([v()],pt.prototype,"filteredWallets",void 0);pt=Pt([x("w3m-all-wallets-list")],pt);const Eo=B`
  wui-grid,
  wui-loading-spinner,
  wui-flex {
    height: 360px;
  }

  wui-grid {
    overflow: scroll;
    scrollbar-width: none;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(auto-fill, 104px);
  }

  wui-grid[data-scroll='false'] {
    overflow: hidden;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-loading-spinner {
    justify-content: center;
    align-items: center;
  }

  @media (max-width: 350px) {
    wui-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;var Ie=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let St=class extends T{constructor(){super(...arguments),this.prevQuery="",this.prevBadge=void 0,this.loading=!0,this.query=""}render(){return this.onSearch(),this.loading?c`<wui-loading-spinner color="accent-100"></wui-loading-spinner>`:this.walletsTemplate()}async onSearch(){(this.query.trim()!==this.prevQuery.trim()||this.badge!==this.prevBadge)&&(this.prevQuery=this.query,this.prevBadge=this.badge,this.loading=!0,await S.searchWallet({search:this.query,badge:this.badge}),this.loading=!1)}walletsTemplate(){const{search:t}=S.state,i=fe.markWalletsAsInstalled(t);return t.length?c`
      <wui-grid
        data-testid="wallet-list"
        .padding=${["0","s","s","s"]}
        rowGap="l"
        columnGap="xs"
        justifyContent="space-between"
      >
        ${i.map(n=>c`
            <w3m-all-wallets-list-item
              @click=${()=>this.onConnectWallet(n)}
              .wallet=${n}
              data-testid="wallet-search-item-${n.id}"
            ></w3m-all-wallets-list-item>
          `)}
      </wui-grid>
    `:c`
        <wui-flex
          data-testid="no-wallet-found"
          justifyContent="center"
          alignItems="center"
          gap="s"
          flexDirection="column"
        >
          <wui-icon-box
            size="lg"
            iconColor="fg-200"
            backgroundColor="fg-300"
            icon="wallet"
            background="transparent"
          ></wui-icon-box>
          <wui-text data-testid="no-wallet-found-text" color="fg-200" variant="paragraph-500">
            No Wallet found
          </wui-text>
        </wui-flex>
      `}onConnectWallet(t){L.selectWalletConnector(t)}};St.styles=Eo;Ie([v()],St.prototype,"loading",void 0);Ie([u()],St.prototype,"query",void 0);Ie([u()],St.prototype,"badge",void 0);St=Ie([x("w3m-all-wallets-search")],St);var ai=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let pe=class extends T{constructor(){super(...arguments),this.search="",this.onDebouncedSearch=I.debounce(t=>{this.search=t})}render(){const t=this.search.length>=2;return c`
      <wui-flex .padding=${["0","s","s","s"]} gap="xs">
        <wui-search-bar @inputChange=${this.onInputChange.bind(this)}></wui-search-bar>
        <wui-certified-switch
          ?checked=${this.badge}
          @click=${this.onClick.bind(this)}
          data-testid="wui-certified-switch"
        ></wui-certified-switch>
        ${this.qrButtonTemplate()}
      </wui-flex>
      ${t||this.badge?c`<w3m-all-wallets-search
            query=${this.search}
            badge=${y(this.badge)}
          ></w3m-all-wallets-search>`:c`<w3m-all-wallets-list badge=${y(this.badge)}></w3m-all-wallets-list>`}
    `}onInputChange(t){this.onDebouncedSearch(t.detail)}onClick(){if(this.badge==="certified"){this.badge=void 0;return}this.badge="certified",Qt.showSvg("Only WalletConnect certified",{icon:"walletConnectBrown",iconColor:"accent-100"})}qrButtonTemplate(){return I.isMobile()?c`
        <wui-icon-box
          size="lg"
          iconSize="xl"
          iconColor="accent-100"
          backgroundColor="accent-100"
          icon="qrCode"
          background="transparent"
          border
          borderColor="wui-accent-glass-010"
          @click=${this.onWalletConnectQr.bind(this)}
        ></wui-icon-box>
      `:null}onWalletConnectQr(){O.push("ConnectingWalletConnect")}};ai([v()],pe.prototype,"search",void 0);ai([v()],pe.prototype,"badge",void 0);pe=ai([x("w3m-all-wallets-view")],pe);const Wo=B`
  button {
    column-gap: var(--wui-spacing-s);
    padding: 11px 18px 11px var(--wui-spacing-s);
    width: 100%;
    background-color: var(--wui-color-gray-glass-002);
    border-radius: var(--wui-border-radius-xs);
    color: var(--wui-color-fg-250);
    transition:
      color var(--wui-ease-out-power-1) var(--wui-duration-md),
      background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: color, background-color;
  }

  button[data-iconvariant='square'],
  button[data-iconvariant='square-blue'] {
    padding: 6px 18px 6px 9px;
  }

  button > wui-flex {
    flex: 1;
  }

  button > wui-image {
    width: 32px;
    height: 32px;
    box-shadow: 0 0 0 2px var(--wui-color-gray-glass-005);
    border-radius: var(--wui-border-radius-3xl);
  }

  button > wui-icon {
    width: 36px;
    height: 36px;
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
  }

  button > wui-icon-box[data-variant='blue'] {
    box-shadow: 0 0 0 2px var(--wui-color-accent-glass-005);
  }

  button > wui-icon-box[data-variant='overlay'] {
    box-shadow: 0 0 0 2px var(--wui-color-gray-glass-005);
  }

  button > wui-icon-box[data-variant='square-blue'] {
    border-radius: var(--wui-border-radius-3xs);
    position: relative;
    border: none;
    width: 36px;
    height: 36px;
  }

  button > wui-icon-box[data-variant='square-blue']::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-color-accent-glass-010);
    pointer-events: none;
  }

  button > wui-icon:last-child {
    width: 14px;
    height: 14px;
  }

  button:disabled {
    color: var(--wui-color-gray-glass-020);
  }

  button[data-loading='true'] > wui-icon {
    opacity: 0;
  }

  wui-loading-spinner {
    position: absolute;
    right: 18px;
    top: 50%;
    transform: translateY(-50%);
  }
`;var X=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let F=class extends T{constructor(){super(...arguments),this.tabIdx=void 0,this.variant="icon",this.disabled=!1,this.imageSrc=void 0,this.alt=void 0,this.chevron=!1,this.loading=!1}render(){return c`
      <button
        ?disabled=${this.loading?!0:!!this.disabled}
        data-loading=${this.loading}
        data-iconvariant=${y(this.iconVariant)}
        tabindex=${y(this.tabIdx)}
      >
        ${this.loadingTemplate()} ${this.visualTemplate()}
        <wui-flex gap="3xs">
          <slot></slot>
        </wui-flex>
        ${this.chevronTemplate()}
      </button>
    `}visualTemplate(){if(this.variant==="image"&&this.imageSrc)return c`<wui-image src=${this.imageSrc} alt=${this.alt??"list item"}></wui-image>`;if(this.iconVariant==="square"&&this.icon&&this.variant==="icon")return c`<wui-icon name=${this.icon}></wui-icon>`;if(this.variant==="icon"&&this.icon&&this.iconVariant){const t=["blue","square-blue"].includes(this.iconVariant)?"accent-100":"fg-200",i=this.iconVariant==="square-blue"?"mdl":"md",n=this.iconSize?this.iconSize:i;return c`
        <wui-icon-box
          data-variant=${this.iconVariant}
          icon=${this.icon}
          iconSize=${n}
          background="transparent"
          iconColor=${t}
          backgroundColor=${t}
          size=${i}
        ></wui-icon-box>
      `}return null}loadingTemplate(){return this.loading?c`<wui-loading-spinner
        data-testid="wui-list-item-loading-spinner"
        color="fg-300"
      ></wui-loading-spinner>`:c``}chevronTemplate(){return this.chevron?c`<wui-icon size="inherit" color="fg-200" name="chevronRight"></wui-icon>`:null}};F.styles=[A,M,Wo];X([u()],F.prototype,"icon",void 0);X([u()],F.prototype,"iconSize",void 0);X([u()],F.prototype,"tabIdx",void 0);X([u()],F.prototype,"variant",void 0);X([u()],F.prototype,"iconVariant",void 0);X([u({type:Boolean})],F.prototype,"disabled",void 0);X([u()],F.prototype,"imageSrc",void 0);X([u()],F.prototype,"alt",void 0);X([u({type:Boolean})],F.prototype,"chevron",void 0);X([u({type:Boolean})],F.prototype,"loading",void 0);F=X([x("wui-list-item")],F);var _o=globalThis&&globalThis.__decorate||function(o,t,i,n){var r=arguments.length,e=r<3?t:n===null?n=Object.getOwnPropertyDescriptor(t,i):n,a;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")e=Reflect.decorate(o,t,i,n);else for(var s=o.length-1;s>=0;s--)(a=o[s])&&(e=(r<3?a(e):r>3?a(t,i,e):a(t,i))||e);return r>3&&e&&Object.defineProperty(t,i,e),e};let mi=class extends T{constructor(){super(...arguments),this.wallet=O.state.data?.wallet}render(){if(!this.wallet)throw new Error("w3m-downloads-view");return c`
      <wui-flex gap="xs" flexDirection="column" .padding=${["s","s","l","s"]}>
        ${this.chromeTemplate()} ${this.iosTemplate()} ${this.androidTemplate()}
        ${this.homepageTemplate()}
      </wui-flex>
    `}chromeTemplate(){return this.wallet?.chrome_store?c`<wui-list-item
      variant="icon"
      icon="chromeStore"
      iconVariant="square"
      @click=${this.onChromeStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">Chrome Extension</wui-text>
    </wui-list-item>`:null}iosTemplate(){return this.wallet?.app_store?c`<wui-list-item
      variant="icon"
      icon="appStore"
      iconVariant="square"
      @click=${this.onAppStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">iOS App</wui-text>
    </wui-list-item>`:null}androidTemplate(){return this.wallet?.play_store?c`<wui-list-item
      variant="icon"
      icon="playStore"
      iconVariant="square"
      @click=${this.onPlayStore.bind(this)}
      chevron
    >
      <wui-text variant="paragraph-500" color="fg-100">Android App</wui-text>
    </wui-list-item>`:null}homepageTemplate(){return this.wallet?.homepage?c`
      <wui-list-item
        variant="icon"
        icon="browser"
        iconVariant="square-blue"
        @click=${this.onHomePage.bind(this)}
        chevron
      >
        <wui-text variant="paragraph-500" color="fg-100">Website</wui-text>
      </wui-list-item>
    `:null}onChromeStore(){this.wallet?.chrome_store&&I.openHref(this.wallet.chrome_store,"_blank")}onAppStore(){this.wallet?.app_store&&I.openHref(this.wallet.app_store,"_blank")}onPlayStore(){this.wallet?.play_store&&I.openHref(this.wallet.play_store,"_blank")}onHomePage(){this.wallet?.homepage&&I.openHref(this.wallet.homepage,"_blank")}};mi=_o([x("w3m-downloads-view")],mi);export{pe as W3mAllWalletsView,qe as W3mConnectingWcBasicView,mi as W3mDownloadsView};
//# sourceMappingURL=basic-655ccb46.js.map
