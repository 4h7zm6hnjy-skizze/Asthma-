'use strict';

/* Asthma Navigation 3.1.6: Reparatur VOR allen Statistik-Erweiterungen.
   Dadurch funktioniert die Navigation auch bei Fehlern in spaeteren Zusatzmodulen.
   Keine Aenderungen an Messwerten, IndexedDB, Verschluesselung oder Datenformat. */
(()=>{
 'use strict';
 try {
   const $=id=>document.getElementById(id),hero=$('start'),home=$('uebersicht'),more=$('mehr');
   const dock=document.querySelector('.bottom-dock');
   if(!hero||!home||!dock)return;
   // Earlier successful patch or reinitialization: avoid duplicate controls.
   if($('nav316-active'))return;
   // If 3.1.5 worked, it already removed Mehr and has the six tabs.
   if(!more){window.ASTHMA_NAV316={ready:true,alreadyUpdated:true};return;}
   const search=more.querySelector('.hub20-search'),tiles=more.querySelector('.hub20-grid');
   if(!search||!tiles)return;
   const css=document.createElement('style');css.id='nav316-active';
   css.textContent=`
    .nav316-search{width:min(1140px,100%);margin-inline:auto;box-sizing:border-box;padding:12px 16px 0;position:relative;z-index:2}
    .nav316-search-head{display:flex;align-items:center;gap:9px;color:#fff;font-size:1rem;font-weight:750;padding:2px 2px 7px}
    .nav316-search-head svg{width:21px;height:21px;stroke:currentColor;stroke-width:2;fill:none;stroke-linecap:round;flex:none}
    .nav316-search .hub20-search{margin:0 0 13px;padding:13px 15px;border-radius:15px;background:#f3fafc;border:1px solid #b9dce6;color:#193f52}
    .nav316-search .hub20-search label{font-size:.9rem;color:#254c5d}
    .nav316-search .hub20-search input{font-size:16px;min-height:47px;max-width:100%;box-sizing:border-box}
    .nav316-search .hub20-search .input-note{font-size:.8rem;line-height:1.45;margin:7px 0 3px}
    .nav316-search .hub20-results:not(:empty){margin-top:10px}
    .nav316-expand{background:#f4fafc;border:1px solid #cce1e9;border-radius:15px;padding:12px 14px;margin:15px 0 23px}
    .nav316-expand>summary{font-size:1rem;font-weight:740;color:#163f52;cursor:pointer;line-height:1.4}
    .nav316-expand>.hub20-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:12px 0 2px;visibility:visible;opacity:1}
    .nav316-expand .hub20-grid button{min-width:0;white-space:normal}
    .nav316-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 17px}
    .nav316-tabs button{min-width:0;border:1px solid #b8d7e1;background:#f4fafc;color:#15465b;font-weight:700;padding:12px 10px;border-radius:12px;cursor:pointer;white-space:normal;line-height:1.35}
    body[data-page="antraege"] #nav316-antraege [data-goto="antraege"],
    body[data-page="akte"] #nav316-akte [data-goto="akte"]{background:#d8eef5;border-color:#3297b1}
    body[data-page="akte"] #nav316-combined{background:#e3f4f4;color:#146074}
    .bottom-dock button{min-height:53px;white-space:normal;line-height:1.1}
    .bottom-dock button span{white-space:normal;text-align:center}
    @media(max-width:390px){.bottom-dock{gap:0;padding-left:2px;padding-right:2px}.bottom-dock button{font-size:.6rem;padding-inline:1px}.bottom-dock button svg{width:20px;height:20px}.nav316-search{padding-inline:10px}.nav316-search .hub20-search{padding:10px}}
   `;
   document.head.append(css);
   const wrap=document.createElement('div');wrap.id='nav316-search';wrap.className='nav316-search';
   wrap.innerHTML='<div class="nav316-search-head"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/></svg><span>Suche</span></div>';
   wrap.append(search);
   hero.insertBefore(wrap,hero.firstChild);
   const label=search.querySelector('label');if(label)label.textContent='In deiner verschlüsselten Akte suchen';
   const searchInput=$('private-search20');if(searchInput)searchInput.placeholder='FEV1, Labor, Blutdruck, Medikamente …';
   const group=document.createElement('details');group.id='nav316-functions';group.className='nav316-expand';
   const summary=document.createElement('summary');summary.textContent='Weitere Funktionen und Einstellungen';
   const note=document.createElement('p');note.className='input-note';note.textContent='Profil, Hilfsmittel, Therapie, Arbeit, Berichte und Einstellungen.';
   group.append(summary,note,tiles);
   const quick=home.querySelector('.home20-quick');if(quick)quick.insertAdjacentElement('afterend',group);else home.prepend(group);
   const oldNote=home.querySelector('.home20-heading p:last-child');
   if(oldNote && oldNote.textContent.includes('Mehr'))oldNote.textContent='Deine häufigsten Funktionen direkt öffnen. Weitere Werkzeuge findest du hier auf der Startseite.';
   const grouped=group.querySelector('[data-goto="antraege"] strong');if(grouped)grouped.textContent='Anträge & Akte';
   const launcher=home.querySelector('.suite-launcher');
   if(launcher){const a=launcher.querySelector('[data-goto="antraege"]');const b=launcher.querySelector('[data-goto="akte"]');
     if(a){const h=a.querySelector('strong');if(h)h.textContent='Anträge & Akte';const desc=a.querySelector('small');if(desc)desc.textContent='Unterlagen und Formulare';}
     if(b)b.remove();}
   const tabbar=(page,id)=>{const el=$(id);if(!el||$('nav316-'+page))return;
     const nav=document.createElement('nav');nav.id='nav316-'+page;nav.className='nav316-tabs';nav.setAttribute('aria-label','Anträge und persönliche Akte');
     nav.innerHTML='<button data-goto="antraege" type="button">Anträge und Reha</button><button data-goto="akte" type="button">Akte und Dokumente</button>';
     el.prepend(nav);};
   tabbar('antraege','antraege');tabbar('akte','mein-bereich');
   document.querySelectorAll('.app-nav [data-goto="mehr"],.app-nav [data-goto="akte"]').forEach(el=>el.remove());
   const a=document.querySelector('.app-nav [data-goto="antraege"]');if(a)a.textContent='Anträge & Akte';
   // All nodes needed for search and additional functions were moved first.
   more.remove();
   dock.innerHTML=`
    <button data-goto="start" aria-label="Start" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9H3z M9 20v-6h6v6"/></svg><span>Start</span></button>
    <button data-goto="lungenwerte" aria-label="Lunge" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h4l3-7 4 12 3-6h4"/></svg><span>Lunge</span></button>
    <button data-goto="kalender" aria-label="Kalender" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/></svg><span>Kalender</span></button>
    <button id="nav316-combined" data-goto="antraege" aria-label="Anträge und Akte" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5z M14 3v5h5 M8 12h8 M8 16h8"/></svg><span>Anträge<br>Akte</span></button>
    <button data-goto="labor" aria-label="Labor und Blutwerte" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6m-5 0v6l-5 8a3 3 0 0 0 2.5 4h9a3 3 0 0 0 2.5-4l-5-8V3M8 16h8"/></svg><span>Labor</span></button>
    <button id="nav316-bp" data-goto="vitalwerte" aria-label="Blutdruck" type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8c0 5-8.8 11-8.8 11S3.2 13 3.2 8a4.7 4.7 0 0 1 8.8-2.2A4.7 4.7 0 0 1 20.8 8Z"/><path d="M6 11h3l1.5-3 2 6 1.5-3H18"/></svg><span>Blutdruck</span></button>`;
   const bp=dock.querySelector('#nav316-bp');
   bp.addEventListener('click',()=>{
     const select=()=>document.querySelector('#v29-tabs button[data-kind="bp"]')?.click();
     setTimeout(select,50);setTimeout(select,350);
   });
   // `Mehr` remains recognized by the original router. Direct links to it go to Start.
   const redirect=()=>{if(location.hash!=='#mehr')return;
      if(window.ASTHMA_NAV?.go)window.ASTHMA_NAV.go('start');
      else history.replaceState(null,'','#start');};
   redirect();window.addEventListener('hashchange',redirect);
   window.ASTHMA_NAV316={ready:true,version:'3.1.6',searchOnStart:!!$('private-search20'),combined:!!$('nav316-combined')};
 }catch(error){console.error('Asthma-Navigation 3.1.6 konnte nicht vollständig geladen werden:',error);}
})();
/* Asthma Header-Suche 3.1.7: vorhandene verschluesselte Akten-Suche oben in die Kopfzeile verschieben.
   Ein einziges Suchfeld mit unveraenderter ID, keine neuen Datenablaegen/Netzwerkzugriffe. */
(()=>{
 'use strict';
 try {
  const $=id=>document.getElementById(id);
  if($('nav317-search-action'))return;
  const header=document.querySelector('header.topbar .topbar-inner');
  const brand=header?.querySelector('.brand');
  const updateArea=header?.querySelector('.top-actions');
  const existing=$('private-search20');
  const search=existing?.closest('.hub20-search');
  if(!header||!brand||!updateArea||!search)return;
  const previousParent=search.parentElement;

  const css=document.createElement('style');css.id='nav317-style';
  css.textContent=`
   header.topbar{position:relative;z-index:401;overflow:visible}
   header.topbar .topbar-inner{position:relative;overflow:visible;gap:10px;min-width:0}
   #nav317-search-action{display:flex;align-items:center;justify-content:center;gap:7px;min-width:90px;height:41px;border:1px solid #c5e1e7;border-radius:13px;background:#e9f6f8;color:#155469;font-size:.9rem;font-weight:750;padding:0 13px;white-space:nowrap;flex:none;cursor:pointer;box-shadow:none}
   #nav317-search-action svg{width:19px;height:19px;stroke:currentColor;stroke-width:2;stroke-linecap:round;fill:none;flex:none}
   #nav317-search-action[aria-expanded="true"]{background:#cceef2;border-color:#56a9bd}
   #nav317-holder{display:flex;align-items:center;margin-left:auto;position:relative;min-width:0;flex:none}
   #nav317-search-panel{position:absolute;right:-50px;top:calc(100% + 14px);width:min(420px,calc(100vw - 24px));max-height:min(65dvh,550px);overflow:auto;overscroll-behavior:contain;padding:14px;background:#fff;box-shadow:0 18px 46px rgba(14,52,69,.23);border:1px solid #b9dbe6;border-radius:16px;z-index:601;box-sizing:border-box;color:#163c4c}
   #nav317-search-panel[hidden]{display:none!important}
   #nav317-search-panel .nav317-panel-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px}
   #nav317-search-panel .nav317-panel-header strong{font-size:1rem;color:#164557}
   #nav317-search-close{border:0;border-radius:9px;width:36px;height:36px;display:grid;place-items:center;background:#ebf5f8;color:#234d5d;font-size:1.35rem;line-height:1;cursor:pointer}
   #nav317-search-panel .hub20-search{border:0!important;box-shadow:none!important;margin:0!important;padding:0!important;background:transparent!important;min-width:0;width:100%}
   #nav317-search-panel .hub20-search label{color:#345b6b;font-size:.83rem;margin:0 0 6px}
   #nav317-search-panel .hub20-search input{display:block;width:100%;max-width:100%;min-width:0;min-height:46px;font-size:16px;color:#143e51;background:#fff;border:1px solid #afcad6;border-radius:11px;padding:11px 12px}
   #nav317-search-panel .hub20-search .input-note{font-size:.8rem;margin:8px 0;color:#566f7a;line-height:1.35}
   #nav317-search-panel .hub20-results{max-height:38dvh;overflow:auto;display:grid;gap:7px;margin-top:8px}
   #nav317-search-panel .hub20-result{width:100%;text-align:left;cursor:pointer}
   @media(max-width:530px){
    header.topbar .topbar-inner{gap:7px;padding-left:12px;padding-right:12px}
    header.topbar .top-actions{flex:none;gap:4px}
    #nav317-holder{margin-left:auto}
    #nav317-search-action{height:39px;min-width:0;padding:0 10px;border-radius:11px;font-size:.8rem;gap:5px}
    #nav317-search-action svg{width:18px;height:18px}
    #nav317-search-panel{right:-53px;top:calc(100% + 13px)}
   }
   @media(max-width:360px){
    #nav317-search-action{padding:0 8px;font-size:.75rem}
    #nav317-search-panel{right:-47px}
   }
  `;
  document.head.append(css);

  const holder=document.createElement('div');holder.id='nav317-holder';
  const toggle=document.createElement('button');toggle.id='nav317-search-action';toggle.type='button';
  toggle.setAttribute('aria-controls','nav317-search-panel');toggle.setAttribute('aria-expanded','false');
  toggle.setAttribute('aria-label','Akte durchsuchen');
  toggle.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.7" cy="10.7" r="7"/><path d="m16 16 5 5"/></svg><span>Suchen</span>';
  const panel=document.createElement('section');panel.id='nav317-search-panel';panel.hidden=true;
  panel.setAttribute('aria-label','Suche in der verschluesselten Akte');
  const top=document.createElement('div');top.className='nav317-panel-header';
  const heading=document.createElement('strong');heading.textContent='Suche in deiner Akte';
  const close=document.createElement('button');close.type='button';close.id='nav317-search-close';
  close.setAttribute('aria-label','Suche schließen');close.textContent='×';
  top.append(heading,close);panel.append(top,search);
  holder.append(toggle,panel);updateArea.before(holder);

  // The old start-page box is no longer needed; search stays in header on every screen.
  if(previousParent?.id==='nav316-search'||previousParent?.id==='nav315-search')previousParent.remove();
  const show=(open,focus=false)=>{
   panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));
   if(open&&focus)existing.focus({preventScroll:true});
  };
  toggle.addEventListener('click',()=>show(panel.hidden,true));
  close.addEventListener('click',()=>{show(false);toggle.focus({preventScroll:true})});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){show(false);toggle.focus({preventScroll:true})}});
  document.addEventListener('pointerdown',e=>{if(!panel.hidden&&!holder.contains(e.target))show(false)});
  // Clicking a result still follows the already installed local search navigation.
  panel.querySelector('#private-search-results20')?.addEventListener('click',e=>{
   if(e.target.closest('button'))show(false);
  });
  window.ASTHMA_HEADER_SEARCH317=Object.freeze({version:'3.1.7',ready:true,originalSearchReused:!!$('private-search20'),inHeader:header.contains($('private-search20'))});
 }catch(error){console.error('Header-Suche 3.1.7 konnte nicht eingerichtet werden:',error)}
})();

/* Asthma 3.0.3 – additive, offline-only lab comparison panel. No personal data in source. */
(()=>{
 const SEC=window.ASTHMA_SECURITY;
 const $=id=>document.getElementById(id);
 const page=$('labor'),existing=$('laborplus301');
 if(!page||!existing||!SEC||$('laborvergleich303'))return;
 const panel=document.createElement('section');
 panel.id='laborvergleich303';panel.className='suite-subpanel';
 panel.innerHTML=`<h3>Laborvergleich – auf einen Blick</h3>
 <p>Jeder Test mit letztem Wert, Vorwert, Datum, Veränderung und Laborreferenz. Grüne oder rote Markierungen beziehen sich nur auf die Lage innerhalb/außerhalb desselben angegebenen Laborreferenzbereichs, nicht auf eine gesicherte gesundheitliche Verbesserung.</p>
 <label>Werte filtern <select id="lv303-filter">
  <option value="all">Alle Werte</option>
  <option value="flags">Außerhalb des Laborreferenzbereichs</option>
  <option value="asthma">Asthma und Allergie</option>
  <option value="gas">Blutgas / Säure-Basen</option>
  <option value="changed">Mit Veränderung zum Vorwert</option></select></label>
 <label>Wert suchen <input id="lv303-search" type="search" placeholder="z. B. Eosinophile, pCO₂"></label>
 <p id="lv303-count" aria-live="polite"></p><div id="lv303-list"></div>
 <button type="button" class="btn btn-outline" id="lv303-more" hidden>Weitere Werte anzeigen</button>
 <p class="input-note">Wenn Referenzen, Einheiten oder Messmethoden abweichen, wird kein medizinisch gefärbter Verlauf behauptet. Keine automatische Therapieentscheidung.</p>`;
 const css=document.createElement('style');css.textContent=`
 #laborvergleich303{border:1px solid #b8d5e3;background:#f7fbff;border-radius:14px;margin:16px 0;padding:15px}
 #laborvergleich303 h3{margin:0 0 8px;color:#163f53}
 #laborvergleich303 label{display:block;margin:9px 0;font-weight:650}
 #laborvergleich303 input,#laborvergleich303 select{width:100%;font-size:16px;padding:10px;border:1px solid #a9c6d4;border-radius:8px;margin-top:6px}
 #lv303-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(225px,1fr));gap:10px}
 .lv303-card{background:#fff;border:1px solid #d5e4eb;border-radius:12px;padding:12px;min-width:0}
 .lv303-card h4{margin:0 0 6px;font-size:.96rem;overflow-wrap:anywhere;color:#153d53}
 .lv303-main{font-size:1.16rem;font-weight:750}
 .lv303-meta{font-size:.84rem;color:#546e7b;margin:5px 0}
 .lv303-status{display:inline-block;font-size:.8rem;border-radius:999px;padding:3px 9px;background:#ecf2f6;color:#476273}
 .lv303-status.high,.lv303-status.low{color:#922d25;background:#fde6e2}
 .lv303-status.ok{color:#226544;background:#e4f5e9}
 .lv303-status.context{color:#77510a;background:#fff1d9}
 .lv303-change{font-weight:750;margin:6px 0;color:#405e70}
 .lv303-change.good{color:#16794a}.lv303-change.bad{color:#b2362b}
 .lv303-note{font-size:.79rem;color:#5b707d}
 @media(max-width:620px){#lv303-list{grid-template-columns:1fr}#laborvergleich303{padding:11px}}`;
 document.head.append(css);existing.insertAdjacentElement('afterend',panel);
 const num=x=>{if(typeof x==='number')return Number.isFinite(x)?x:null;
  const t=String(x??'').trim().replace(',','.');return /^[-+]?\d+(?:\.\d+)?$/.test(t)?Number(t):null};
 const format=x=>typeof x==='number'?x.toLocaleString('de-DE',{maximumFractionDigits:2}):String(x??'');
 const dmy=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):String(d||'');
 const range=x=>{const m=String(x||'').replace(/\s/g,'').replace(',','.').match(/^(-?\d+(?:\.\d+)?)[–-](-?\d+(?:\.\d+)?)$/);return m&&Number(m[1])<=Number(m[2])?[Number(m[1]),Number(m[2])]:null};
 const lineKey=r=>[r.marker,r.allergen||'',String(r.unit||'').toLowerCase().replace(/\s/g,'')].join('|');
 function status(r){if(r.evaluation?.label)return {label:r.evaluation.label,kind:r.evaluation.status||'context'};
  const n=num(r.value),rg=range(r.reference);
  if(n===null||!rg)return {label:'Ärztlich einordnen',kind:'context'};
  if(n<rg[0])return {label:'Unter Referenz',kind:'low'};
  if(n>rg[1])return {label:'Über Referenz',kind:'high'};
  return {label:'In Referenz',kind:'ok'};
 }
 function change(current,previous){
  if(!previous)return {text:'Noch kein Vorwert',kind:'',detail:''};
  const a=num(previous.value),b=num(current.value),unit=String(current.unit||'');
  if(a===null||b===null)return {text:'Nicht numerisch vergleichbar',kind:'',detail:''};
  if(unit!==String(previous.unit||''))return {text:'Einheiten verschieden',kind:'',detail:'Ohne gesicherte Umrechnung kein Vergleich.'};
  const delta=b-a,rel=a===0?null:100*delta/Math.abs(a),lead=delta>0?'+':'',pct=rel===null?'':' ('+(rel>0?'+':'')+format(rel)+' % relativ)';
  const result={text:lead+format(delta)+' '+unit+pct,kind:'',detail:'Zunahme oder Abnahme allein ist keine medizinische Besserung oder Verschlechterung.'};
  const r1=range(current.reference),r0=range(previous.reference);
  if(r1&&r0&&r1[0]===r0[0]&&r1[1]===r0[1]){
   const out0=a<r0[0]||a>r0[1],out1=b<r1[0]||b>r1[1];
   if(out0&&!out1){result.kind='good';result.detail='Im angegebenen Referenzbereich; keine gesicherte klinische Besserung.';}
   if(!out0&&out1){result.kind='bad';result.detail='Neu außerhalb des Referenzbereichs; mit der Arztpraxis besprechen.';}
  }else result.detail='Referenzbedingungen für einen medizinischen Vergleich nicht eindeutig.';
  return result;
 }
 let records=[],visible=[],limit=24,busy=false;
 const node=(tag,cls,t)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(t!==undefined)el.textContent=String(t);return el};
 async function refresh(){if(busy)return;busy=true;
  try{records=await SEC.list('labs');render()}catch(e){$('lv303-count').textContent='Laborwerte konnten nicht geladen werden: '+e.message}
  finally{busy=false}
 }
 function render(){const group=new Map();
  for(const r of records){const k=lineKey(r);if(!group.has(k))group.set(k,[]);group.get(k).push(r)}
  visible=[...group.values()].map(a=>{a.sort((u,v)=>String(v.date||'').localeCompare(String(u.date||'')));
   const current=a[0],previous=a.find(t=>t.date!==current.date),assessment=status(current);
   return {current,previous,assessment,delta:change(current,previous)};
  });
  const f=$('lv303-filter').value,s=$('lv303-search').value.trim().toLocaleLowerCase('de');
  visible=visible.filter(x=>{
   const r=x.current,category=String(r.category||'');
   if(f==='flags'&&!['high','low'].includes(x.assessment.kind))return false;
   if(f==='asthma'&&!/Asthma|Allergie/i.test(category)&&!['eosAbs','eosPct','ecp','igeTotal','igeSpecific'].includes(r.marker))return false;
   if(f==='gas'&&!/Blutgas|Säure-Basen/i.test(category)&&!['po2','pco2','ph','hco3','lactate'].includes(r.marker))return false;
   if(f==='changed'&&(!x.previous||num(r.value)===num(x.previous.value)))return false;
   return !s||[r.label,r.marker,r.allergen,r.category].some(v=>String(v||'').toLocaleLowerCase('de').includes(s));
  }).sort((x,y)=>{
   if(f==='all'){
    const important=new Set(['eosAbs','eosPct','ph','pco2','po2','hco3','crp','ecp','igeTotal']);
    const ix=important.has(x.current.marker)?0:1,iy=important.has(y.current.marker)?0:1;if(ix!==iy)return ix-iy;
   }
   return String(y.current.date||'').localeCompare(String(x.current.date||''));
  });
  $('lv303-count').textContent=visible.length+' verschiedene Tests gefunden';
  const list=$('lv303-list');list.replaceChildren();
  for(const {current:r,previous,assessment,delta} of visible.slice(0,limit)){
   const card=node('article','lv303-card');
   card.append(node('h4','',String(r.label||r.marker)+(r.allergen?' · '+r.allergen:'')));
   card.append(node('div','lv303-main',format(r.value)+' '+(r.unit||'')));
   card.append(node('p','lv303-meta',dmy(r.date)+(r.reference?' · Referenz '+r.reference:'')));
   card.append(node('span','lv303-status '+assessment.kind,assessment.label));
   if(previous){card.append(node('p','lv303-meta','Vorher: '+format(previous.value)+' '+(previous.unit||'')+' · '+dmy(previous.date)));card.append(node('p','lv303-change '+delta.kind,'Änderung: '+delta.text));if(delta.detail)card.append(node('p','lv303-note',delta.detail));}
   else card.append(node('p','lv303-meta','Kein älterer Wert vorhanden'));
   const detail=node('details');detail.append(node('summary','','Befunddetails'));
   if(r.evaluation?.detail)detail.append(node('p','lv303-note',r.evaluation.detail));
   if(r.notes)detail.append(node('p','lv303-note',r.notes));
   card.append(detail);list.append(card);
  }
  $('lv303-more').hidden=visible.length<=limit;
 }
 $('lv303-filter').addEventListener('change',()=>{limit=24;render()});
 $('lv303-search').addEventListener('input',()=>{limit=24;render()});
 $('lv303-more').addEventListener('click',()=>{limit+=24;render()});
 let refreshRequest=false;
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group!=='labs'||refreshRequest)return;refreshRequest=true;queueMicrotask(()=>{refreshRequest=false;refresh()})});
 refresh();
 window.ASTHMA_LAB303={status,change};
})();

/* Langzeit-Bluttestvergleich 2026 – additive Offline-Erweiterung. Keine Patientendaten im Quellcode. */
(()=>{
 'use strict';
 const S=window.ASTHMA_SECURITY,oldPanel=document.getElementById('laborvergleich303'),$=id=>document.getElementById(id);
 if(!S||!oldPanel||$('lab-compare-years'))return;
 const h=document.createElement('section');h.id='lab-compare-years';h.className='suite-subpanel';
 h.innerHTML=`<h3>Bluttests über alle Jahre vergleichen</h3>
 <p>Wähle zwei Untersuchungstage. Neue Bluttests erscheinen hier automatisch, alle älteren Untersuchungen bleiben erhalten.</p>
 <div class="lcy-dates"><label>Früherer Bluttest<select id="lcy-before"></select></label><label>Späterer Bluttest<select id="lcy-after"></select></label></div>
 <div class="lcy-actions"><button type="button" class="btn btn-outline" id="lcy-last">Die letzten zwei Bluttests</button><button type="button" class="btn btn-outline" id="lcy-all">Ersten und letzten vergleichen</button><button type="button" class="btn btn-outline" id="lcy-swap">Tage tauschen</button></div>
 <p id="lcy-info" role="status"></p>
 <div class="lcy-filters"><label>Laborwert suchen<input id="lcy-search" type="search" placeholder="z. B. CRP, Eosinophile, pCO₂" autocomplete="off"></label>
 <label>Anzeige<select id="lcy-filter"><option value="all">Alle Werte aus beiden Bluttests</option><option value="both">An beiden Tagen gemessen</option><option value="changed">Nur veränderte Zahlenwerte</option><option value="missing">Nur an einem Tag gemessen</option></select></label></div>
 <p id="lcy-count"></p><div class="lcy-results" id="lcy-results"></div>
 <button type="button" class="btn btn-outline" id="lcy-more" hidden>Weitere Blutwerte anzeigen</button>
 <p class="input-note">Veränderungen sind rein rechnerisch: Steigende oder sinkende Werte bedeuten nicht automatisch Besserung oder Verschlechterung. Verschiedene Messmethoden und Referenzbereiche müssen ärztlich eingeordnet werden. Fehlende Tests werden nicht als 0 gewertet.</p>`;
 oldPanel.insertAdjacentElement('beforebegin',h);
 const legacy=document.createElement('details');legacy.id='lcy-old-comparison';
 const lsum=document.createElement('summary');lsum.textContent='Bisherige Ansicht: Letzter Wert und Vorwert';
 legacy.append(lsum);oldPanel.insertAdjacentElement('beforebegin',legacy);legacy.append(oldPanel);
 const css=document.createElement('style');css.textContent=`
 #lab-compare-years{padding:15px;background:#f6fbff;border:1px solid #b8d8e7;border-radius:15px;margin:14px 0}
 #lab-compare-years h3{color:#183e54;margin:0 0 8px}
 .lcy-dates,.lcy-filters{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:13px 0}
 #lab-compare-years label{display:block;font-weight:600;font-size:.91rem}
 #lab-compare-years input,#lab-compare-years select{width:100%;font-size:16px;min-width:0;padding:11px 9px;border:1px solid #abc8d6;border-radius:8px;margin-top:6px;background:white}
 .lcy-actions{display:flex;gap:9px;flex-wrap:wrap;margin:12px 0}.lcy-actions button{white-space:normal}
 #lcy-info,#lcy-count{color:#526f7d;font-size:.9rem}
 .lcy-results{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}
 .lcy-card{background:white;border:1px solid #d1e0e9;border-radius:12px;padding:12px;overflow-wrap:anywhere}
 .lcy-card h4{font-size:1rem;margin:0 0 10px;color:#1a4156}
 .lcy-cells{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 .lcy-cell{background:#f0f6fa;border-radius:9px;padding:9px;min-width:0}
 .lcy-cell .caption{display:block;font-size:.8rem;color:#5b707b}
 .lcy-cell strong{display:block;font-size:1.05rem;margin:5px 0;color:#1b465c;overflow-wrap:anywhere}
 .lcy-delta{font-weight:700;margin:11px 0 4px;color:#23546e;font-size:.94rem}
 .lcy-explain{color:#526d7a;font-size:.82rem;margin:6px 0}
 .lcy-card details summary{cursor:pointer;font-size:.86rem;font-weight:650;margin-top:10px}
 #lcy-old-comparison{padding:10px 0}#lcy-old-comparison>summary{cursor:pointer;font-weight:650}
 @media(max-width:620px){.lcy-dates,.lcy-filters{grid-template-columns:1fr}.lcy-results{grid-template-columns:1fr}#lab-compare-years{padding:11px}}
 `;document.head.append(css);
 const mk=(tag,text,cls)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
 const format=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:4});
 const dateText=x=>/^\d{4}-\d\d-\d\d$/.test(x||'')?x.slice(8)+'.'+x.slice(5,7)+'.'+x.slice(0,4):String(x||'');
 const number=x=>{const t=String(x??'').trim().replace(',','.');return /^[-+]?\d+(?:\.\d+)?$/.test(t)&&Number.isFinite(Number(t))?Number(t):null};
 const key=r=>[r.marker||'',String(r.allergen||'').trim().toLowerCase(),r.marker==='customTest'?String(r.label||'').trim().toLowerCase():''].join('|');
 const label=r=>String(r.label||r.marker||'Untersuchung')+(r.allergen?' · '+r.allergen:'');
 const unit=u=>String(u||'').trim().replace(/\s+/g,'').toLowerCase().replaceAll('μ','µ');
 function diff(a,b){
   if(!a||!b)return {valid:false,message:'Nur an einem der beiden Tage untersucht'};
   let va=number(a.value),vb=number(b.value);if(va===null||vb===null)return {valid:false,message:'Ein Messwert ist kein vergleichbarer Zahlenwert'};
   const ua=unit(a.unit),ub=unit(b.unit);let factor=null;
   if(ua===ub)factor=1;
   else if(a.marker==='crp'){
     const m={'mg/l':1,'mg/dl':10};if(m[ua]&&m[ub])factor=m[ua]/m[ub];
   }else if(['eosAbs','neutAbs','lymphAbs','monoAbs','basoAbs','immatureAbs','wbc','platelets'].includes(a.marker)){
     const m={'/µl':1,'zellen/µl':1,'g/l':1000,'10³/µl':1000};if(m[ua]&&m[ub])factor=m[ua]/m[ub];
   }
   if(factor===null)return {valid:false,message:'Unterschiedliche Einheiten – keine sichere Umrechnung'};
   const old=va*factor,change=vb-old;
   return {valid:true,change,percent:old?100*change/Math.abs(old):null,converted:factor!==1,unit:b.unit||''};
 }
 let rows=[],dates=[],limit=30,previousLatest='';
 const from=$('lcy-before'),to=$('lcy-after');
 function addOptions(target,wanted,fallback){
   const n=new Map();rows.forEach(r=>n.set(r.date,(n.get(r.date)||0)+1));
   target.replaceChildren();let group=null,year=null;
   for(const d of dates){if(year!==d.slice(0,4)){year=d.slice(0,4);group=mk('optgroup');group.label=year;target.append(group)}
     const option=mk('option',dateText(d)+' · '+n.get(d)+' Messwerte');option.value=d;group.append(option)}
   target.value=dates.includes(wanted)?wanted:fallback;
 }
 function buildPair(e,A,B){
   const r=e.b||e.a,card=mk('article',undefined,'lcy-card');card.append(mk('h4',label(r)));
   const grid=mk('div',undefined,'lcy-cells');
   for(const [record,date] of [[e.a,A],[e.b,B]]){
     const cell=mk('div',undefined,'lcy-cell');cell.append(mk('span',dateText(date),'caption'));
     cell.append(mk('strong',record?String(record.value).replace('.',',')+' '+String(record.unit||''):'Nicht untersucht'));
     if(record?.reference)cell.append(mk('span','Referenz: '+record.reference,'caption'));
     grid.append(cell);
   }
   card.append(grid);
   const d=diff(e.a,e.b);
   if(d.valid){
     const sign=d.change>0?'↑ +':d.change<0?'↓ ':'= ';
     const pct=d.percent===null?'':' · '+(d.percent>0?'+':'')+format(d.percent)+' %';
     card.append(mk('p','Differenz: '+sign+format(d.change)+' '+d.unit+pct,'lcy-delta'));
     if(d.converted)card.append(mk('p','Vorwert wurde für die Differenz in die Einheit des neuen Befunds umgerechnet.','lcy-explain'));
   }else card.append(mk('p',d.message,'lcy-explain'));
   const detail=mk('details');detail.append(mk('summary','Beurteilungen und Notizen'));
   for(const [rec,day] of [[e.a,'Früher'],[e.b,'Später']]){
     if(!rec)continue;
     detail.append(mk('p',day+': '+(rec.evaluation?.label||'Keine zusätzliche Bewertung'),'lcy-explain'));
     if(rec.evaluation?.detail)detail.append(mk('p',rec.evaluation.detail,'lcy-explain'));
     if(rec.notes)detail.append(mk('p','Notiz: '+rec.notes,'lcy-explain'));
   }
   card.append(detail);return card;
 }
 function render(){
   const A=from.value,B=to.value,out=$('lcy-results');out.replaceChildren();
   if(dates.length<2){$('lcy-info').textContent='Für den Vergleich werden Untersuchungen an zwei verschiedenen Tagen benötigt.';$('lcy-count').textContent='';$('lcy-more').hidden=true;return}
   if(A===B){$('lcy-info').textContent='Bitte zwei unterschiedliche Tage auswählen.';$('lcy-count').textContent='';$('lcy-more').hidden=true;return}
   const map=new Map();for(const rec of rows){if(rec.date!==A&&rec.date!==B)continue;
     const k=key(rec);if(!map.has(k))map.set(k,{a:null,b:null});
     const r=map.get(k),slot=rec.date===A?'a':'b';
     if(!r[slot]||String(rec.updatedAt||rec.createdAt||'')>String(r[slot].updatedAt||r[slot].createdAt||''))r[slot]=rec;
   }
   const total=map.size,search=$('lcy-search').value.trim().toLowerCase(),filter=$('lcy-filter').value;
   const displayed=[...map.values()].filter(e=>{
     if(filter==='both'&&(!e.a||!e.b))return false;
     if(filter==='missing'&&e.a&&e.b)return false;
     if(filter==='changed'&&(!diff(e.a,e.b).valid||Math.abs(diff(e.a,e.b).change)<1e-12))return false;
     if(!search)return true;
     return [e.a,e.b].filter(Boolean).some(r=>[r.label,r.marker,r.allergen,r.category].some(v=>String(v||'').toLowerCase().includes(search)));
   }).sort((x,y)=>label(x.b||x.a).localeCompare(label(y.b||y.a),'de'));
   $('lcy-info').textContent='Vergleich '+dateText(A)+' und '+dateText(B)+' · '+dates.length+' Untersuchungstage insgesamt ('+dateText(dates[0])+' bis '+dateText(dates[dates.length-1])+')';
   $('lcy-count').textContent=displayed.length+' von '+total+' unterschiedlichen Untersuchungen';
   displayed.slice(0,limit).forEach(e=>out.append(buildPair(e,A,B)));
   if(!displayed.length)out.append(mk('p','Keine passenden Werte gefunden.'));
   $('lcy-more').hidden=limit>=displayed.length;
 }
 async function reload(){try{
   const a=from.value,b=to.value;
   rows=(await S.list('labs')).filter(r=>/^\d{4}-\d\d-\d\d$/.test(r.date||''));
   dates=[...new Set(rows.map(r=>r.date))].sort();
   const newest=dates.at(-1)||'',auto=previousLatest&&b===previousLatest&&newest!==previousLatest&&dates.length>1;
   addOptions(from,a,dates.at(-2)||newest);addOptions(to,b,newest);
   if(auto){from.value=previousLatest;to.value=newest}
   if(dates.length>1&&from.value===to.value)from.value=dates.at(-2);
   previousLatest=newest;render();
 }catch(err){$('lcy-info').textContent='Laborwerte konnten nicht geladen werden: '+err.message}}
 $('lcy-last').addEventListener('click',()=>{if(dates.length>1){from.value=dates.at(-2);to.value=dates.at(-1);render()}});
 $('lcy-all').addEventListener('click',()=>{if(dates.length>1){from.value=dates[0];to.value=dates.at(-1);render()}});
 $('lcy-swap').addEventListener('click',()=>{const a=from.value;from.value=to.value;to.value=a;render()});
 ['lcy-before','lcy-after','lcy-filter','lcy-search'].forEach(id=>$(id).addEventListener(id==='lcy-search'?'input':'change',()=>{limit=30;render()}));
 $('lcy-more').addEventListener('click',()=>{limit+=30;render()});
 let updating=false;window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group!=='labs'||updating)return;updating=true;setTimeout(()=>{updating=false;reload()},120)});
 window.ASTHMA_LAB_LONGTERM={diff};reload();
})();

/* Asthma Webapp: Treppenzaehler fuer Arbeitsplatz und Belastungen.
   Kompatible Ein-Datei-Erweiterung. Daten bleiben im AES-GCM-Tresor als suite/stairs/*.
   Keine Netzwerkaufrufe. Bestehende Labor- und Arbeitsplatzdaten bleiben unveraendert. */
(()=>{
 'use strict';
 const S=window.ASTHMA_SECURITY;
 const work=document.getElementById('arbeit');
 const $=id=>document.getElementById(id);
 if(!work||!S?.state?.().unlocked||$('sc-work-panel'))return;
 const mk=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n;};
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
 const timeNow=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
 const printDate=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):String(d||'');
 const format=n=>Number(n||0).toLocaleString('de-DE',{maximumFractionDigits:1});
 const validDay=d=>{if(!/^\d{4}-\d\d-\d\d$/.test(d||''))return false;const test=new Date(d+'T12:00:00');return !Number.isNaN(+test)&&todayFor(test)===d;};
 const todayFor=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 const uuid=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
 const escapeCsv=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
 const currentYear=()=>new Date().getFullYear();
 const section=mk('section','suite-subpanel');section.id='sc-work-panel';
 section.innerHTML=`
  <div class="sc-head"><div><h3>Treppenzähler</h3><p>Treppensteigen bei der Arbeit dokumentieren – wie in WorksManager. Stufen werden manuell eingetragen, nicht automatisch vom iPhone gezählt.</p></div><span class="sc-chip">Privat &amp; verschlüsselt</span></div>
  <div class="sc-stats" aria-live="polite"><div><strong id="sc-today">0</strong><small>Stufen heute</small></div><div><strong id="sc-month">0</strong><small>Stufen im Monat</small></div><div><strong id="sc-year">0</strong><small>Stufen im Jahr</small></div></div>
  <form id="sc-form" autocomplete="off">
   <div class="sc-form-grid">
    <label>Datum<input id="sc-date" type="date" required></label>
    <label>Uhrzeit<input id="sc-time" type="time" required></label>
    <label>Anzahl Stufen<input id="sc-steps" type="number" min="1" max="20000" step="1" inputmode="numeric" placeholder="z. B. 60" required></label>
    <label>Schicht<select id="sc-shift"><option value="">Nicht angegeben</option><option>Frühschicht</option><option>Spätschicht</option><option>Nachtschicht</option><option>Andere / frei</option></select></label>
    <label>Grund<select id="sc-reason"><option>Kühlanlage</option><option>Materialscheine</option><option>WC</option><option>Fertigteile runtergefahren</option><option>Verpackung geholt</option><option>Pappe geschnitten</option><option>Spangen</option><option value="__custom__">Anderer Grund – selbst eintragen</option></select></label>
    <label id="sc-reason-custom-wrap" hidden>Anderer Grund (frei eingeben)<input id="sc-reason-custom" type="text" maxlength="120" placeholder="z. B. Maschinenkontrolle"></label>
    <label>Beschwerden danach<select id="sc-symptoms"><option value="">Nicht angegeben</option><option value="0">0 – keine</option><option value="1">1 – leicht</option><option value="2">2 – mittel</option><option value="3">3 – stark</option></select></label>
    <label class="sc-wide">Notiz (optional)<textarea id="sc-note" rows="2" maxlength="500" placeholder="z. B. drei Mal zum Materiallager, Atemnot"></textarea></label>
   </div>
   <div class="sc-quick" role="group" aria-label="Stufenzahl rasch erhöhen"><span>Schnell hinzufügen:</span><button type="button" data-sc-add="30">+30</button><button type="button" data-sc-add="24">+24</button></div>
   <div class="sc-actions"><button id="sc-save" type="submit" class="btn btn-primary">Stufen speichern</button><button id="sc-cancel" type="button" class="btn btn-outline" hidden>Bearbeiten abbrechen</button></div>
  </form>
  <p id="sc-status" role="status" class="input-note"></p>
  <details id="sc-import-panel"><summary>Alte WorksManager-Treppeneinträge übernehmen</summary>
   <p>Die Daten aus deinem WorksManager-Screenshot liegen in einer separaten privaten JSON-Datei. Bitte diese Datei nur hier auf deinem iPhone auswählen, nicht bei GitHub hochladen.</p>
   <label>Private Importdatei wählen<input id="sc-import-file" type="file" accept=".json,application/json"></label>
   <div id="sc-import-preview" hidden><p id="sc-import-info" role="status"></p><button type="button" id="sc-import-confirm" class="btn btn-primary">Erkannte Einträge verschlüsselt übernehmen</button><button type="button" id="sc-import-cancel" class="btn btn-outline">Abbrechen</button></div>
   <p id="sc-import-status" role="status" class="input-note">Doppelte Einträge werden erkannt und übersprungen. Bestehende Daten werden nicht überschrieben.</p>
  </details>
  <div class="sc-lower"><h4>Einträge und Auswertung</h4><label>Ansicht<select id="sc-view"><option value="month">Aktueller Monat</option><option value="year">Ganzes Jahr</option><option value="all">Alle Jahre</option></select></label></div>
  <div class="sc-substats" id="sc-summary"></div><div id="sc-list" class="sc-list"></div><button id="sc-more" type="button" class="btn btn-outline" hidden>Weitere Einträge anzeigen</button>
  <details id="sc-annual"><summary>Jahresübersicht und Monatsstatistik</summary><div class="sc-annual-head"><label>Jahr auswählen<select id="sc-report-year"></select></label><button type="button" class="btn btn-outline" id="sc-print">Jahresbericht drucken / PDF</button></div><div id="sc-monthtable"></div></details>
  <button type="button" id="sc-export" class="btn btn-outline">Alle Treppeneinträge als CSV exportieren</button>
  <p class="input-note">Die Zahlen beruhen auf deinen Eingaben und sind kein medizinischer Belastungstest. Bei akuter deutlicher Atemnot die Belastung unterbrechen und den ärztlichen Notfallplan befolgen.</p>`;
 const form=$('work-form');
 if(form?.parentElement)form.parentElement.insertAdjacentElement('beforebegin',section);
 else work.append(section);
 const css=mk('style');css.textContent=`
 #sc-work-panel{border:1px solid #c8dde8;border-radius:18px;padding:18px;background:#f5fbff;margin:14px 0 24px}
 #sc-work-panel .sc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
 #sc-work-panel .sc-head h3{margin:0 0 6px;font-size:1.2rem;color:#183e53}
 #sc-work-panel .sc-head p{margin:0 0 12px;color:#557383;font-size:.91rem;line-height:1.5}
 #sc-work-panel .sc-chip{font-size:.72rem;color:#17566a;background:#dff4f8;padding:6px 9px;border-radius:30px;white-space:nowrap}
 #sc-work-panel .sc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:8px 0 19px}
 #sc-work-panel .sc-stats>div{border-radius:12px;padding:13px 8px;text-align:center;background:#fff;border:1px solid #d9e8ef;min-width:0}
 #sc-work-panel .sc-stats strong{display:block;color:#0e607b;font-size:1.5rem;line-height:1.15;overflow-wrap:anywhere}
 #sc-work-panel .sc-stats small{display:block;font-size:.78rem;color:#506a79;margin-top:7px}
 #sc-work-panel .sc-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
 #sc-reason-custom-wrap[hidden]{display:none!important}
 #sc-work-panel .sc-reasons-tip{font-size:.8rem;color:#507184}
 #sc-work-panel label{display:block;font-size:.89rem;color:#375766;font-weight:700}
 #sc-work-panel input,#sc-work-panel select,#sc-work-panel textarea{display:block;width:100%;min-width:0;box-sizing:border-box;font-size:16px;border:1px solid #bad0dc;border-radius:10px;padding:11px 10px;background:white;color:#183f52;margin-top:5px}
 #sc-work-panel .sc-wide{grid-column:1/-1}
 #sc-work-panel .sc-quick{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin:14px 0}
 #sc-work-panel .sc-quick span{font-size:.84rem;color:#587383;margin-right:4px}
 #sc-work-panel .sc-quick button{border:1px solid #a5cbd9;border-radius:9px;background:#e9f7fb;color:#115a73;font-weight:750;min-width:51px;min-height:41px;padding:6px 10px;font-size:1rem}
 #sc-work-panel .sc-actions{display:flex;gap:8px;flex-wrap:wrap;margin:9px 0}
 #sc-import-panel{margin:16px 0;padding:11px 13px;border:1px solid #bfdbe7;border-radius:11px;background:#fff}
 #sc-import-panel>summary{cursor:pointer;color:#184e68;font-weight:750}
 #sc-import-panel p{font-size:.89rem;color:#506f80;line-height:1.48}
 #sc-import-panel .btn{margin:5px 6px 5px 0;white-space:normal}
 #sc-import-panel #sc-import-file{font-size:16px}
 #sc-work-panel .sc-lower{display:flex;justify-content:space-between;align-items:end;flex-wrap:wrap;gap:10px;border-top:1px solid #d2e3eb;padding-top:15px;margin-top:16px}
 #sc-work-panel .sc-lower h4{margin:0;color:#234658}#sc-work-panel .sc-lower select{min-width:170px}
 #sc-work-panel .sc-substats{display:flex;flex-wrap:wrap;gap:8px;color:#506a78;font-size:.88rem;margin:14px 0}
 #sc-work-panel .sc-substats span{padding:8px 10px;border-radius:8px;background:#e8f3f8}
 #sc-work-panel .sc-entry{border:1px solid #d2e4ec;background:#fff;border-radius:11px;padding:11px 12px;margin:8px 0}
 #sc-work-panel .sc-entry-top{display:flex;justify-content:space-between;gap:7px;align-items:center}
 #sc-work-panel .sc-entry strong{color:#184b62}#sc-work-panel .sc-entry small{display:block;color:#607885;margin:5px 0}
 #sc-work-panel .sc-entry p{margin:5px 0;color:#435f6d;overflow-wrap:anywhere}
 #sc-work-panel .sc-entry-actions{display:flex;gap:7px;flex-wrap:wrap}
 #sc-work-panel .sc-entry-actions button{border:1px solid #d0e2eb;border-radius:8px;background:white;color:#245d75;padding:6px 10px;min-height:38px;font-size:.86rem}
 #sc-work-panel #sc-annual{margin:17px 0;padding:12px;border:1px solid #d0e3ea;border-radius:11px;background:white}
 #sc-work-panel #sc-annual>summary{font-weight:750;color:#284f64;cursor:pointer}
 #sc-work-panel .sc-annual-head{display:flex;justify-content:space-between;align-items:end;gap:10px;flex-wrap:wrap;margin:13px 0}
 #sc-work-panel .sc-table{width:100%;border-collapse:collapse;font-size:.87rem}
 #sc-work-panel .sc-table td,#sc-work-panel .sc-table th{border-bottom:1px solid #e1ecf0;padding:8px 5px;text-align:left}
 #sc-work-panel .sc-table th{color:#3d6375}
 #sc-home-tile{margin:12px auto;padding:12px 16px;max-width:1040px;border-radius:13px;border:1px solid #b4d8e5;background:#f0faff;display:flex;justify-content:space-between;align-items:center;gap:12px}
 #sc-home-tile strong{display:block;color:#155c76;font-size:1.3rem}#sc-home-tile span{display:block;color:#587080;font-size:.82rem}
 #sc-home-tile button{min-height:43px;border-radius:8px;border:1px solid #a2cad8;background:white;padding:9px 14px;color:#18546a;font-weight:750}
 #sc-report{display:none}
 @media(max-width:580px){#sc-work-panel{padding:12px}#sc-work-panel .sc-chip{white-space:normal;text-align:center}#sc-work-panel .sc-stats strong{font-size:1.2rem}#sc-work-panel .sc-stats small{font-size:.7rem}#sc-work-panel .sc-form-grid{grid-template-columns:1fr}#sc-home-tile{margin:10px 8px}}
 @media print{body.sc-print-active>*:not(#sc-report){display:none!important}body.sc-print-active #sc-report{display:block!important;background:white!important;color:black!important;padding:9mm;font-size:10pt}#sc-report table{border-collapse:collapse;width:100%;margin:10px 0}#sc-report td,#sc-report th{border:1px solid #aaa;padding:4px;text-align:left}#sc-report h1{font-size:18pt}#sc-report h2{font-size:13pt;margin:16px 0 7px}#sc-report tr{break-inside:avoid}}
 `;
 document.head.append(css);
 const home=$('start');let tile=null;
 if(home){tile=mk('div');tile.id='sc-home-tile';tile.innerHTML='<div><strong id="sc-home-total">0 Stufen heute</strong><span>Treppenzähler · Arbeitsplatz</span></div><button type="button" id="sc-home-open">Stufen erfassen</button>';
  const slot=home.querySelector('.hero-content');if(slot)slot.insertAdjacentElement('afterend',tile);else home.append(tile);
  $('sc-home-open').addEventListener('click',()=>{if(window.ASTHMA_NAV?.go)window.ASTHMA_NAV.go('arbeit');else document.querySelector('[data-goto="arbeit"]')?.click();setTimeout(()=>$('sc-steps')?.focus({preventScroll:false}),150);});
 }
 const ystats=(arr)=>{const unique=new Set(arr.map(r=>r.date));return {sum:arr.reduce((n,r)=>n+r.steps,0),count:arr.length,days:unique.size,average:unique.size?arr.reduce((n,r)=>n+r.steps,0)/unique.size:0};};
 let rows=[],editingId=null,shown=30,loading=false;
 const select=$('sc-view'),yearPicker=$('sc-report-year'),status=$('sc-status');
 const setStatus=(message,error=false)=>{status.textContent=message;status.style.color=error?'#a53f35':'#23704c';};
 const reasonPicker=$('sc-reason'),customReason=$('sc-reason-custom'),customReasonWrap=$('sc-reason-custom-wrap');
 const reasonOptions=[...reasonPicker.options].map(o=>o.value);
 function syncReason(){const custom=reasonPicker.value==='__custom__';customReasonWrap.hidden=!custom;customReason.required=custom;if(!custom)customReason.value='';}
 reasonPicker.addEventListener('change',syncReason);
 const clearForm=()=>{editingId=null;$('sc-form').reset();$('sc-date').value=today();$('sc-time').value=timeNow();syncReason();$('sc-save').textContent='Stufen speichern';$('sc-cancel').hidden=true;};
 clearForm();
 // Optional shift choice matches the existing workplace form by default.
 const shift=$('work-shift');if(shift&&[...$('sc-shift').options].some(x=>x.value===shift.value))$('sc-shift').value=shift.value;
 for(const b of section.querySelectorAll('[data-sc-add]'))b.addEventListener('click',()=>{const n=$('sc-steps'),add=Number(b.dataset.scAdd),v=Number(n.value)||0;n.value=String(Math.min(20000,Math.max(0,v)+add));n.focus();});
 $('sc-cancel').addEventListener('click',()=>{clearForm();setStatus('Bearbeitung abgebrochen.')});
 function validate(){const date=$('sc-date').value,time=$('sc-time').value,steps=Number($('sc-steps').value);
  if(!validDay(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!Number.isInteger(steps)||steps<1||steps>20000)throw Error('Datum, Uhrzeit oder Stufenanzahl ungültig. Bitte 1–20.000 Stufen eingeben.');
  const reason=reasonPicker.value==='__custom__'?customReason.value.trim().slice(0,120):reasonPicker.value;
  if(!reason)throw Error('Bitte einen Grund auswählen oder den anderen Grund eintragen.');
  return {date,time,steps,shift:$('sc-shift').value,reason,symptoms:$('sc-symptoms').value,note:$('sc-note').value.trim().slice(0,500)};}
 $('sc-form').addEventListener('submit',async e=>{e.preventDefault();const b=$('sc-save');if(b.disabled)return;
  let data;try{data=validate()}catch(err){setStatus(err.message,true);return}
  b.disabled=true;
  try{const older=editingId?rows.find(x=>x.id===editingId):null;
   const item={id:older?.id||uuid(),...data,createdAt:older?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
   await S.put('suite',{key:'stairs/'+item.id,type:'stairs',value:item},'stairs/'+item.id);
   clearForm();setStatus(older?'Treppeneintrag geändert und verschlüsselt gespeichert.':'Treppeneintrag verschlüsselt gespeichert.');await reload();
  }catch(err){setStatus('Speichern fehlgeschlagen: '+err.message,true)}finally{b.disabled=false}
 });
 const del=async id=>{if(!confirm('Diesen Treppeneintrag dauerhaft löschen?'))return;
  try{await S.del('suite','stairs/'+id);if(editingId===id)clearForm();setStatus('Treppeneintrag gelöscht.');await reload()}
  catch(err){setStatus('Löschen fehlgeschlagen: '+err.message,true)};
 };
 const edit=item=>{$('sc-date').value=item.date;$('sc-time').value=item.time;$('sc-steps').value=item.steps;$('sc-shift').value=item.shift;
  reasonPicker.value=reasonOptions.includes(item.reason)?item.reason:'__custom__';syncReason();
  if(reasonPicker.value==='__custom__')customReason.value=item.reason||'';
  $('sc-symptoms').value=item.symptoms??'';$('sc-note').value=item.note??'';
  editingId=item.id;$('sc-save').textContent='Änderung speichern';$('sc-cancel').hidden=false;setStatus('Du bearbeitest den Eintrag vom '+printDate(item.date)+'.');section.scrollIntoView({behavior:'smooth',block:'start'});
 };
 function render(){
  const now=today(),month=now.slice(0,7),year=now.slice(0,4);
  const t=ystats(rows.filter(r=>r.date===now)).sum,m=ystats(rows.filter(r=>r.date.startsWith(month))).sum,y=ystats(rows.filter(r=>r.date.startsWith(year))).sum;
  $('sc-today').textContent=format(t);$('sc-month').textContent=format(m);$('sc-year').textContent=format(y);
  if(tile)$('sc-home-total').textContent=format(t)+' Stufen heute';
  const period=select.value,subset=rows.filter(r=>period==='all'||(period==='month'?r.date.startsWith(month):r.date.startsWith(year)));
  const stats=ystats(subset),sum=$('sc-summary');sum.replaceChildren();
  for(const [a,v] of [['Stufen',stats.sum],['Einträge',stats.count],['Aktive Tage',stats.days],['Ø je aktivem Tag',stats.average]])sum.append(mk('span',null,a+': '+format(v)));
  const list=$('sc-list');list.replaceChildren();
  if(!subset.length)list.append(mk('p','input-note','Noch keine Treppeneinträge für diesen Zeitraum.'));
  subset.slice(0,shown).forEach(r=>{const card=mk('article','sc-entry'),top=mk('div','sc-entry-top');
   top.append(mk('strong',null,format(r.steps)+' Stufen'));top.append(mk('span',null,printDate(r.date)+' · '+r.time+' Uhr'));
   card.append(top,mk('small',null,[r.shift,r.reason,r.symptoms===''?'':'Beschwerden '+r.symptoms+'/3'].filter(Boolean).join(' · ')));
   if(r.note)card.append(mk('p',null,r.note));
   const actions=mk('div','sc-entry-actions');const e=mk('button',null,'Bearbeiten'),d=mk('button',null,'Löschen');e.type='button';d.type='button';e.addEventListener('click',()=>edit(r));d.addEventListener('click',()=>del(r.id));actions.append(e,d);card.append(actions);list.append(card);
  });
  $('sc-more').hidden=subset.length<=shown;
  const possible=[...new Set([currentYear(),...rows.map(r=>Number(r.date.slice(0,4))).filter(n=>Number.isInteger(n))])].sort((a,b)=>b-a);
  const selected=Number(yearPicker.value)||currentYear();yearPicker.replaceChildren();possible.forEach(y=>{const opt=mk('option',null,String(y));opt.value=String(y);yearPicker.append(opt)});yearPicker.value=possible.includes(selected)?String(selected):String(currentYear());
  renderYear();
 }
 function monthsOf(year){const months=[];for(let i=1;i<=12;i++){const mm=String(i).padStart(2,'0');const items=rows.filter(r=>r.date.startsWith(year+'-'+mm));months.push({month:i,items,...ystats(items)})}return months;}
 function renderYear(){const year=yearPicker.value,months=monthsOf(year),target=$('sc-monthtable');target.replaceChildren();const table=mk('table','sc-table');
  const header=mk('tr');for(const x of ['Monat','Stufen','Einträge','Aktive Tage'])header.append(mk('th',null,x));table.append(header);
  months.forEach(m=>{const tr=mk('tr');tr.append(mk('td',null,new Date(Number(year),m.month-1,1).toLocaleString('de-DE',{month:'long'})),mk('td',null,format(m.sum)),mk('td',null,m.count),mk('td',null,m.days));table.append(tr)});
  const all=months.flatMap(m=>m.items),st=ystats(all);const tr=mk('tr');for(const x of ['Gesamt',format(st.sum),String(st.count),String(st.days)])tr.append(mk('th',null,x));table.append(tr);target.append(table);
  target.append(mk('p','input-note','Durchschnitt pro aktivem Tag: '+format(st.average)+' Stufen.'));
 }
 $('sc-view').addEventListener('change',()=>{shown=30;render()});$('sc-more').addEventListener('click',()=>{shown+=30;render()});yearPicker.addEventListener('change',renderYear);
 $('sc-export').addEventListener('click',()=>{if(!rows.length){setStatus('Noch keine Treppeneinträge vorhanden.',true);return}
  if(!confirm('CSV-Datei mit persönlichen Gesundheits- und Arbeitsplatzdaten unverschlüsselt exportieren?'))return;
  const header=['Datum','Uhrzeit','Stufen','Schicht','Grund','Beschwerden 0-3','Notiz'];
  const lines=[header,...rows.map(r=>[r.date,r.time,r.steps,r.shift,r.reason,r.symptoms,r.note])];
  const csv='\ufeff'+lines.map(x=>x.map(escapeCsv).join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=mk('a');a.href=url;a.download='Asthma_Treppen_Alle_Jahre.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),20000);setStatus('CSV-Datei erstellt. Sie ist nicht verschlüsselt.');
 });
 $('sc-print').addEventListener('click',()=>{if(!confirm('Der Jahresbericht enthält möglicherweise persönliche Gesundheitsdaten. Als unverschlüsselten Ausdruck/PDF erstellen?'))return;
  const year=yearPicker.value,mths=monthsOf(year),period=rows.filter(r=>r.date.startsWith(year)).slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const report=$('sc-report')||mk('section');report.id='sc-report';report.replaceChildren();
  report.append(mk('h1',null,'Asthma – Treppenzähler '+year),mk('p',null,'Erstellt am '+new Date().toLocaleString('de-DE')+' · Privat / Gesundheitsakte'));
  const st=ystats(period);report.append(mk('p',null,'Gesamt: '+format(st.sum)+' Stufen · '+st.count+' Einträge · '+st.days+' aktive Tage · Ø '+format(st.average)+' Stufen je aktivem Tag'));
  const table=(heads,lines)=>{const t=mk('table'),tr=mk('tr');heads.forEach(h=>tr.append(mk('th',null,h)));t.append(tr);lines.forEach(line=>{const row=mk('tr');line.forEach(x=>row.append(mk('td',null,String(x??''))));t.append(row)});return t;};
  report.append(mk('h2',null,'Monatsübersicht'),table(['Monat','Stufen','Einträge','Aktive Tage'],mths.map(m=>[new Date(Number(year),m.month-1,1).toLocaleString('de-DE',{month:'long'}),format(m.sum),m.count,m.days])));
  const byReason=new Map(),byShift=new Map();for(const row of period){const reason=row.reason||'Ohne Angabe',shift=row.shift||'Ohne Angabe';byReason.set(reason,(byReason.get(reason)||0)+row.steps);byShift.set(shift,(byShift.get(shift)||0)+row.steps);}
  report.append(mk('h2',null,'Stufen nach Grund'),table(['Grund','Stufen'],[...byReason].sort((a,b)=>b[1]-a[1]).map(([name,total])=>[name,format(total)])));
  report.append(mk('h2',null,'Stufen nach Schicht'),table(['Schicht','Stufen'],[...byShift].sort((a,b)=>b[1]-a[1]).map(([name,total])=>[name,format(total)])));
  report.append(mk('h2',null,'Einzelne Einträge'),table(['Datum','Zeit','Stufen','Schicht','Grund','Beschwerden','Notiz'],period.map(r=>[printDate(r.date),r.time,r.steps,r.shift,r.reason,r.symptoms,r.note])));
  document.body.append(report);document.body.classList.add('sc-print-active');
  const clean=()=>{document.body.classList.remove('sc-print-active');report.remove()};window.addEventListener('afterprint',clean,{once:true});
  try{window.print()}finally{setTimeout(clean,16000)};
 });
 let refreshing=false;
 async function reload(){if(loading)return;loading=true;
  try{const items=await S.list('suite');rows=items.filter(x=>x.type==='stairs'&&x.value&&/^\d{4}-\d\d-\d\d$/.test(x.value.date||'')&&Number.isInteger(Number(x.value.steps))&&Number(x.value.steps)>0).map(x=>({...x.value,steps:Number(x.value.steps)}))
   .sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));render();}
  catch(err){setStatus('Treppeneinträge konnten nicht geladen werden: '+err.message,true)}finally{loading=false}
 }
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group!=='suite'||refreshing)return;refreshing=true;setTimeout(()=>{refreshing=false;reload()},130)});
 // Update Tageswerte beim Wiederöffnen der App nach Datumswechsel.
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(!editingId){$('sc-date').value=today();$('sc-time').value=timeNow()}reload()}});
 reload();
 window.ASTHMA_STAIRS={refresh:reload};
})();


/* Asthma 3.0.6: Erweiterte Monats-/Jahresstatistik. Ergänzung, kein Überschreiben.
   Vollständig lokal: verschlüsselte Messwerte nur im Browser nach Tresor-Entsperrung.
   Stufen, vollständige Laborwerte, Laborverläufe und Datenvollständigkeit. */
(()=>{
 'use strict';
 const S=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);
 if(!S?.state?.().unlocked||!$('stats25-report')||$('stats306-settings'))return;
 const make=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=String(content);return x;};
 const clean=x=>String(x??'').trim();
 const format=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:2});
 const numeric=x=>{const v=clean(x).replace(',','.');return /^[-+]?\d+(?:\.\d+)?$/.test(v)&&Number.isFinite(Number(v))?Number(v):null;};
 const dayText=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):clean(d);
 const allowedDay=d=>/^\d{4}-\d\d-\d\d$/.test(d||'');
 const sameGroup=r=>[r.marker||r.label||'Ohne Name',clean(r.allergen).toLowerCase(),clean(r.unit).toLowerCase().replace(/\s+/g,'')].join('|');
 const name=r=>clean(r.label||r.marker||'Unbekannter Laborwert')+(r.allergen?' · '+r.allergen:'');
 const warn=msg=>{const p=make('p','stats25-muted',msg);p.style.color='#875b24';return p};
 const ctrl=make('fieldset','suite-subpanel');ctrl.id='stats306-settings';
 ctrl.style.cssText='margin-top:12px;padding:12px;border:1px solid #abcbd9;border-radius:12px';
 ctrl.append(make('legend',null,'Neue Berichtsteile – Monats- und Jahresstatistik'));
 const choices=[['stair','Treppen mit Gründen, Schichten, Tagen und Monatstabelle'],['lab','Alle Blutwerte mit Datum, Referenz, Beurteilung und Verlauf'],['coverage','Übersicht aller wichtigen gespeicherten Gesundheitsbereiche']];
 const checks={};for(const [id,label] of choices){const item=make('label');item.style.cssText='display:flex;align-items:flex-start;gap:9px;margin:8px 0';
  const input=make('input');input.type='checkbox';input.checked=true;input.id='stats306-check-'+id;input.style.flex='0 0 auto';checks[id]=input;
  item.append(input,make('span',null,label));ctrl.append(item);
 }
 ctrl.append(make('p','input-note','Vor dem Erstellen auswählen. Die bisherigen Statistikseiten und Diagramme bleiben unverändert. PDF/Druck sind unverschlüsselt.'));
 // 3.1.2: Fieldset darf kein Flex-Element der Monatsauswahl sein.
 // Sonst erzwingt .stats25-controls input {width:100%;min-height:44px}
 // auf iPhone übergroße Checkboxen und seitlich überlaufende Texte.
 const buildBtn=$('stats25-build');
 const statsToolbar=buildBtn?.closest('.stats25-controls');
 if(statsToolbar?.parentElement)statsToolbar.insertAdjacentElement('afterend',ctrl);
 else if(buildBtn?.parentElement)buildBtn.parentElement.insertAdjacentElement('afterend',ctrl);
 const responsive=document.createElement('style');
 responsive.id='stats306-iphone-fix-312';
 responsive.textContent=`
 #stats306-settings {
   display:block; width:100%; min-width:0; max-width:100%;
   box-sizing:border-box; margin:12px 0; padding:12px;
   border:1px solid #c7dbe4; border-radius:14px;
   background:#f6fbfd; overflow-wrap:anywhere;
 }
 #stats306-settings legend {
   max-width:100%; padding:0 5px;
   color:#17455a; font-weight:700; font-size:.95rem;
   white-space:normal; overflow-wrap:anywhere;
 }
 #stats306-settings > label {
   display:grid !important;
   grid-template-columns:22px minmax(0,1fr);
   align-items:start !important; column-gap:11px !important;
   min-width:0 !important; max-width:100%; width:100%;
   box-sizing:border-box; margin:8px 0 !important;
   padding:11px 12px; border:1px solid #d9e6eb; border-radius:10px;
   background:#fff; font-size:.92rem; font-weight:500;
   line-height:1.4; cursor:pointer; overflow-wrap:anywhere;
 }
 #stats306-settings > label input[type="checkbox"] {
   display:block; appearance:auto; -webkit-appearance:checkbox;
   width:20px !important; min-width:20px !important;
   max-width:20px !important; height:20px !important;
   min-height:20px !important; max-height:20px !important;
   margin:0 !important; padding:0 !important;
   flex:0 0 20px !important; accent-color:#187c97;
   box-sizing:border-box; align-self:start;
 }
 #stats306-settings > label span {
   min-width:0; max-width:100%; display:block;
   white-space:normal; overflow-wrap:anywhere;
 }
 #stats306-settings > p {
   max-width:100%; font-size:.83rem; line-height:1.5;
   overflow-wrap:anywhere;
 }
 @media(max-width:460px) {
   #stats306-settings {padding:10px;margin:10px 0}
   #stats306-settings > label {padding:10px; font-size:.89rem}
 }
 @media print {
   #stats306-settings {display:none !important}
 }
 `;
 document.head.append(responsive);
 if(!document.getElementById('stats306-print-fix-313')){const style313=document.createElement('style');style313.id='stats306-print-fix-313';style313.textContent=`
 .stats306-tablewrap{width:100%;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;margin:10px 0 14px}
 .stats306-table{width:max-content;min-width:100%;border-collapse:collapse;font-size:.86rem;table-layout:auto;background:#fff}
 .stats306-table th,.stats306-table td{padding:7px 8px;border-bottom:1px solid #dde8ed;vertical-align:top;text-align:left;white-space:normal;word-break:normal;overflow-wrap:break-word}
 .stats306-table th{border-bottom:2px solid #b9d8e3;background:#f5fafc;color:#123b52;font-weight:700}
 .stats306-tablewrap[data-wide='true'] .stats306-table th:nth-child(1),
 .stats306-tablewrap[data-wide='true'] .stats306-table td:nth-child(1){min-width:84px}
 .stats306-tablewrap[data-wide='true'] .stats306-table th:nth-child(2),
 .stats306-tablewrap[data-wide='true'] .stats306-table td:nth-child(2){min-width:165px}
 .stats306-tablewrap[data-wide='true'] .stats306-table th:nth-child(3),
 .stats306-tablewrap[data-wide='true'] .stats306-table td:nth-child(3){min-width:120px}
 .stats306-tablewrap[data-wide='true'] .stats306-table th:nth-child(4),
 .stats306-tablewrap[data-wide='true'] .stats306-table td:nth-child(4){min-width:110px}
 .stats306-tablewrap[data-wide='true'] .stats306-table th:nth-child(5),
 .stats306-tablewrap[data-wide='true'] .stats306-table td:nth-child(5){min-width:220px}
 .stats306-labcards{display:grid;gap:12px;margin:10px 0 18px}
 .stats306-labcard{border:1px solid #d7e5eb;border-radius:14px;background:#fff;padding:12px;box-shadow:0 1px 0 rgba(18,59,82,.03);break-inside:avoid-page;page-break-inside:avoid}
 .stats306-labhead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e4edf1}
 .stats306-labhead strong{display:block;color:#123b52;font-size:.98rem;line-height:1.35}
 .stats306-labdate{color:#5f7581;font-size:.83rem;white-space:nowrap}
 .stats306-labgrid{display:grid;grid-template-columns:120px minmax(0,1fr);gap:7px 10px;align-items:start}
 .stats306-lablabel{font-weight:700;color:#1f4658}
 .stats306-labvalue{min-width:0;color:#243943;overflow-wrap:anywhere}
 @media(max-width:560px){.stats306-labhead{flex-direction:column}.stats306-labdate{white-space:normal}.stats306-labgrid{grid-template-columns:1fr}.stats306-lablabel{margin-top:4px}}
 @media print{.stats306-tablewrap{overflow:visible}.stats306-table{width:100%;font-size:10px}.stats306-table th,.stats306-table td{padding:5px 6px}.stats306-labcards{gap:10px}.stats306-labcard{padding:10px;border-color:#cadbe3}}
 `;document.head.append(style313)}
 function section(report,title){const x=make('section','stats25-section');x.dataset.stats306='true';x.append(make('h3',null,title));report.append(x);return x;}
 function metric(parent,label,value){const p=make('div','stats25-line');p.append(make('span',null,label),make('strong',null,value));parent.append(p)}
 function table(parent,columns,rows){const wrap=make('div','stats306-tablewrap');if(columns.length>=4)wrap.dataset.wide='true';const t=make('table','stats306-table');
  const head=make('tr');for(const label of columns){head.append(make('th',null,label))}t.append(head);
  for(const values of rows){const tr=make('tr');for(const cell of values){tr.append(make('td',null,cell))}t.append(tr)}wrap.append(t);parent.append(wrap);
 }
 function labCards(parent,records){const list=make('div','stats306-labcards');
  for(const x of records){const card=make('article','stats306-labcard');const head=make('div','stats306-labhead');
   head.append(make('strong',null,name(x)),make('span','stats306-labdate',dayText(x.date)));card.append(head);
   const grid=make('div','stats306-labgrid');
   const row=(label,value)=>{grid.append(make('div','stats306-lablabel',label),make('div','stats306-labvalue',value||'–'))};
   row('Ergebnis',clean(x.value)+(clean(x.unit)?' '+clean(x.unit):''));
   row('Referenz',clean(x.reference)||'–');
   row('Beurteilung',clean(x.evaluation?.label||x.assessment||'Ohne gesonderte Bewertung'));
   row('Hinweise',clean(x.evaluation?.detail||'')+(x.notes?(clean(x.evaluation?.detail||'')?' · ':'')+clean(x.notes):'')||'–');
   card.append(grid);list.append(card)}
  parent.append(list);
 }
 const byType=(suite,type,r)=>suite.filter(x=>x.type===type&&x.value&&allowedDay(x.value.date)&&x.value.date>=r.from&&x.value.date<=r.to).map(x=>x.value);
 const sum=arr=>arr.reduce((n,x)=>n+Number(x.steps||0),0);
 const byReason=rows=>{const map=new Map();for(const r of rows){const k=clean(r.reason)||'Ohne Angabe';const v=map.get(k)||{reason:k,steps:0,records:0};v.steps+=Number(r.steps||0);v.records++;map.set(k,v)}return [...map.values()].sort((a,b)=>b.steps-a.steps||a.reason.localeCompare(b.reason,'de'))};
 function stairs(report,records,r){const box=section(report,'Treppenzähler – Arbeitsbelastung');
  const rows=records.filter(x=>allowedDay(x.date)&&x.date>=r.from&&x.date<=r.to&&Number.isInteger(Number(x.steps))&&Number(x.steps)>0);
  const days=new Set(rows.map(x=>x.date)),count=sum(rows),d=days.size;
  metric(box,'Stufen im Zeitraum',format(count));metric(box,'Einträge',String(rows.length));metric(box,'Tage mit erfassten Stufen',String(d));
  metric(box,'Ø Stufen an Tagen mit Einträgen',d?format(count/d):'Keine Messung');
  if(!rows.length){box.append(make('p','stats25-muted','Noch keine Treppen für diesen Zeitraum erfasst. Nicht erfasste Tage gelten nicht als 0-Stufen-Tage.'));return}
  box.append(make('h4',null,'Stufen nach Grund'));
  table(box,['Grund','Stufen','Einträge'],byReason(rows).map(a=>[a.reason,format(a.steps),String(a.records)]));
  const shifts=new Map();for(const x of rows){const k=x.shift||'Ohne Schichtangabe';shifts.set(k,(shifts.get(k)||0)+Number(x.steps))}
  box.append(make('h4',null,'Stufen nach Schicht'));
  table(box,['Schicht','Stufen'],[...shifts].sort((a,b)=>b[1]-a[1]).map(([a,b])=>[a,format(b)]));
  const symptomCounts=[0,0,0,0];let unknown=0;for(const x of rows){const n=Number(x.symptoms);if(x.symptoms===''||x.symptoms==null||!Number.isInteger(n)||n<0||n>3)unknown++;else symptomCounts[n]++}
  metric(box,'Beschwerden 0/1/2/3 – Anzahl Einträge',symptomCounts.join(' / '));metric(box,'Beschwerden nicht angegeben',String(unknown));
  if(r.mode==='year'){
   box.append(make('h4',null,'Monatsvergleich der Stufen'));
   const months=Array.from({length:12},(_,i)=>{const mm=String(i+1).padStart(2,'0'),arr=rows.filter(x=>x.date.slice(5,7)===mm),active=new Set(arr.map(x=>x.date)).size;
    return [new Date(Number(r.key),i,1).toLocaleDateString('de-DE',{month:'long'}),format(sum(arr)),String(arr.length),String(active)]});
   table(box,['Monat','Stufen','Einträge','Tage'],months);
  }else{
   box.append(make('h4',null,'Tagesübersicht'));
   const daysList=[...new Set(rows.map(x=>x.date))].sort();
   table(box,['Datum','Stufen','Einträge'],daysList.map(date=>[dayText(date),format(sum(rows.filter(x=>x.date===date))),String(rows.filter(x=>x.date===date).length)]));
  }
  box.append(make('p','stats25-muted','Manuelle Eintragungen. Aus den Stufen allein lässt sich keine Gehstrecke, Belastungsintensität oder medizinische Diagnose ableiten.'));
 }
 const markerName=x=>/^[A-Za-z0-9_-]{1,64}$/.test(x||'')?x:'Messwert';
 function miniChart(parent,records,key,measureName){
  const points=records.filter(x=>sameGroup(x)===key&&numeric(x.value)!==null).sort((a,b)=>a.date.localeCompare(b.date));
  if(points.length<2||new Set(points.map(x=>x.date)).size<2)return;
  const data=points.length>120?points.filter((r,i)=>i===0||i===points.length-1||i%Math.ceil(points.length/120)===0):points;
  const vals=data.map(x=>numeric(x.value)),rawLo=Math.min(...vals),rawHi=Math.max(...vals),padding=Math.max((rawHi-rawLo)*.14,Math.abs(rawHi)*.025,0.01);
  const lo=rawLo-padding,hi=rawHi+padding,W=660,H=202,L=67,R=20,T=32,B=40;
  const d0=Date.parse(data[0].date+'T12:00:00'),d1=Date.parse(data[data.length-1].date+'T12:00:00'),width=W-L-R;
  const x=r=>L+width*(d1===d0?0.5:(Date.parse(r.date+'T12:00:00')-d0)/(d1-d0));
  const y=n=>T+(H-T-B)*(hi-n)/(hi-lo);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 '+W+' '+H);
  svg.setAttribute('role','img');svg.setAttribute('aria-label','Verlauf '+measureName);
  const add=(type,props,txt)=>{const z=document.createElementNS('http://www.w3.org/2000/svg',type);for(const [k,v] of Object.entries(props))z.setAttribute(k,String(v));if(txt!==undefined)z.textContent=String(txt);svg.append(z);return z};
  add('text',{x:L,y:18,'font-size':12,'font-weight':700,fill:'#255364'},measureName+' ('+(data[0].unit||'ohne Einheit')+')');
  for(let i=0;i<4;i++){const v=lo+(hi-lo)*i/3,yy=y(v);
   add('line',{x1:L,y1:yy,x2:W-R,y2:yy,stroke:'#dce8ee','stroke-width':1});add('text',{x:L-5,y:yy+3,'text-anchor':'end','font-size':10,fill:'#54707f'},format(v));}
  add('polyline',{points:data.map(r=>x(r)+','+y(numeric(r.value))).join(' '),fill:'none',stroke:'#2782a0','stroke-width':2.4});
  for(const rec of data){add('circle',{cx:x(rec),cy:y(numeric(rec.value)),r:3,fill:'#217c98'});}
  add('text',{x:L,y:H-12,'font-size':10,fill:'#5c7481'},dayText(data[0].date));
  add('text',{x:W-R,y:H-12,'text-anchor':'end','font-size':10,fill:'#5c7481'},dayText(data.at(-1).date));
  parent.append(svg);
  const a=points[0],b=points.at(-1),va=numeric(a.value),vb=numeric(b.value),difference=vb-va;
  parent.append(make('p','stats25-muted','Erster Wert '+format(va)+' · Letzter Wert '+format(vb)+' · Veränderung '+(difference>0?'+':'')+format(difference)+' '+(b.unit||'')+(va?' ('+(difference>0?'+':'')+format(difference/Math.abs(va)*100)+' %)':'')));
 }
 function labs(report,labs,r){const box=section(report,'Labor – vollständige Werte und Befunde');
  const records=labs.filter(x=>allowedDay(x.date)&&x.date>=r.from&&x.date<=r.to).slice().sort((a,b)=>a.date.localeCompare(b.date)||name(a).localeCompare(name(b),'de'));
  metric(box,'Dokumentierte Laborwerte im Zeitraum',String(records.length));
  metric(box,'Labor-Untersuchungstage',String(new Set(records.map(x=>x.date)).size));
  metric(box,'Verschiedene Labortests',String(new Set(records.map(sameGroup)).size));
  if(!records.length){box.append(make('p','stats25-muted','Für den ausgewählten Zeitraum sind keine Laborwerte gespeichert.'));return}
  // Every row is preserved without silent truncation; the user controls which period is printed.
  box.append(make('h4',null,'Alle Einzelwerte – vollständig und mobil lesbar'));
  box.append(make('p','stats25-muted','Jeder gespeicherte Laborwert wird als eigene Karte ausgegeben, damit PDF- und Handyansicht besser lesbar bleiben.'));
  labCards(box,records);
  box.append(make('h4',null,'Verlaufsdiagramme zu mehrfach gemessenen Blutwerten'));
  const groups=new Map();for(const p of records){const k=sameGroup(p);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p)}
  const plotted=[...groups.entries()].filter(([k,rs])=>rs.filter(p=>numeric(p.value)!==null).length>1&&new Set(rs.filter(p=>numeric(p.value)!==null).map(p=>p.date)).size>1);
  plotted.sort((a,b)=>{const priority=['eosAbs','ecp','igeTotal','crp','ph','pco2','po2','hco3','hb','wbc','creatinine'];const ra=priority.indexOf(a[1][0].marker),rb=priority.indexOf(b[1][0].marker);return (ra<0?99:ra)-(rb<0?99:rb)||name(a[1][0]).localeCompare(name(b[1][0]),'de')});
  for(const [key,items] of plotted)miniChart(box,records,key,name(items[0]));
  if(!plotted.length)box.append(make('p','stats25-muted','Keine Laborwerte mit mindestens zwei Messdaten und gleichen Einheiten im gewählten Zeitraum.'));
  box.append(make('p','stats25-muted','Laborreferenzen und Einordnung stammen aus den gespeicherten Befunden. Unterschiedliche Probenarten, Messmethoden, Medikamente und fehlende Messungen können die Vergleichbarkeit beeinflussen. Keine automatisierte Diagnose.'));
 }
 function coverage(report,all,r){const box=section(report,'Datenvollständigkeit – wichtige Gesundheitsbereiche');
  const {suite,epef,labs,diary,calendar,au,documents,cases}=all;
  const inside=d=>allowedDay(d)&&d>=r.from&&d<=r.to;
  const kind=(t)=>suite.filter(x=>x.type===t&&inside(x.value?.date)).length;
  const currentMeds=suite.filter(x=>x.type==='meds').length;
  const aulist=au.filter(x=>(x.from||'')<=r.to&&(x.to||'')>=r.from);
  const lines=[
   ['Treppen / Arbeitswege',kind('stairs'),'Einzelne dokumentierte Treppenwege'],
   ['Blutwerte',labs.filter(x=>inside(x.date)).length,'Alle bekannten einzelnen Laborwerte'],
   ['Lungenfunktion (ärztlich)',kind('measurements'),'Spirometrie / gespeicherte Befunde'],
   ['Peak-Flow / Hand-FEV₁',epef.filter(x=>x.kind==='measurement'&&inside(x.date)).length,'Messungen aus ePEF'],
   ['SpO₂',suite.filter(x=>x.type==='vital29'&&x.value?.kind==='spo2'&&inside(x.value.date)).length,'Dokumentierte Sauerstoffsättigung'],
   ['Blutdruck',suite.filter(x=>x.type==='vital29'&&x.value?.kind==='bp'&&inside(x.value.date)).length,'Dokumentierte Blutdruckmessungen'],
   ['Puls',suite.filter(x=>x.type==='vital29'&&x.value?.kind==='pulse'&&inside(x.value.date)).length,'Dokumentierte Pulsmessungen'],
   ['Gewicht',kind('weight292'),'Datierte Gewichtseinträge'],
   ['Asthma-Tagebuch',diary.filter(x=>inside(x.date)).length,'Symptome und dokumentierte Bedarfsanwendungen'],
   ['Arbeitsbelastungen',kind('work'),'Hitze / Staub / sonstige Arbeitsplatzbelastungen'],
   ['Arbeitsunfähigkeit (Asthma)',aulist.length,'Bescheinigungen mit Zeitraumüberschneidung'],
   ['Kalender / PhysioSport',calendar.filter(x=>inside(x.date)).length,'Alle gespeicherten Kalendertermine'],
   ['Dokumente',documents.filter(x=>inside(clean(x.date||x.createdAt).slice(0,10))).length,'Im Berichtszeitraum datierte Dokumente'],
   ['Anträge',cases.filter(x=>inside(x.submittedOn)).length,'Eingereichte Anträge'],
   ['Medikamentenplan',currentMeds,'Aktueller Medikamentenbestand, kein Einnahmenachweis']
  ];
  table(box,['Bereich','Einträge','Hinweis'],lines.map(([a,b,c])=>[a,String(b),c]));
  box.append(make('p','stats25-muted','0 bedeutet: Im ausgewählten Zeitraum ist in diesem Datenbereich kein entsprechender Eintrag gespeichert. Daraus folgt nicht, dass keine Beschwerden, Untersuchungen oder Behandlungen stattgefunden haben.'));}
 async function add(report,r){
  if(!report||!r||!S.state().unlocked)return;
  report.querySelectorAll('[data-stats306]').forEach(x=>x.remove());
  if(!Object.values(checks).some(x=>x.checked))return;
  const names=['suite','labs','epef','diary','calendar','au','documents','cases'];
  const values=await Promise.all(names.map(n=>S.list(n)));
  const all=Object.fromEntries(names.map((n,i)=>[n,values[i]]));
  if(checks.stair.checked)stairs(report,all.suite.filter(x=>x.type==='stairs').map(x=>x.value).filter(Boolean),r);
  if(checks.lab.checked)labs(report,all.labs,r);
  if(checks.coverage.checked)coverage(report,all,r);
 }
 // The existing histogram/statistics module loads later. Intercept its assignment
 // so the existing report builder awaits the extra content before offering PDF.
 let current=window.ASTHMA_STATSP292;
 const wrap=api=>{
  if(!api?.append||typeof api.append!=='function')return api;
  return Object.freeze({...api,append:async(report,r)=>{
   await api.append(report,r);
   try{await add(report,r)}catch(err){console.error('Erweiterte Monats-/Jahresstatistik:',err);report.append(warn('Zusätzliche Labor-/Treppenstatistik konnte nicht erstellt werden: '+err.message));}
  }});
 };
 let wrapped=wrap(current);
 Object.defineProperty(window,'ASTHMA_STATSP292',{configurable:true,enumerable:true,get:()=>wrapped,set(value){current=value;wrapped=wrap(value)}});
 window.ASTHMA_STATS306={add,byReason,numeric,ready:()=>Boolean(wrapped?.append)};
})();


/* Asthma: privater WorksManager-Datenimport aus iPhone-Dateien.
   Ausschließlich nach ausdrücklicher Auswahl und Bestätigung.
   Kein eingebetteter Personen-/Arbeitsdatensatz und keine Netzwerkanfrage. */
(()=>{
 'use strict';
 const S=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);
 if(!S?.state?.().unlocked||!$('sc-import-file')||!$('sc-import-confirm'))return;
 const file=$('sc-import-file'),panel=$('sc-import-panel'),preview=$('sc-import-preview'),message=$('sc-import-status'),info=$('sc-import-info');
 const confirmBtn=$('sc-import-confirm');
 let pending=[],busy=false;
 const dOk=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const t=new Date(s+'T12:00:00');return !isNaN(+t)&&[t.getFullYear(),String(t.getMonth()+1).padStart(2,'0'),String(t.getDate()).padStart(2,'0')].join('-')===s};
 const tOk=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s||'');
 const fp=r=>[r.date,r.time,Number(r.steps)].join('|');
 const makeId=r=>'wm-'+r.date.replace(/-/g,'')+'-'+r.time.replace(':','')+'-'+r.steps;
 const reset=()=>{pending=[];file.value='';preview.hidden=true;info.textContent=''};
 const validate=data=>{
  if(data?.kind!=='Asthma-Stairs-Import-v1'||!Array.isArray(data.entries)||data.entries.length<1||data.entries.length>5000)throw Error('Keine gültige Treppen-Importdatei.');
  const unique=new Set(),out=[];
  for(const x of data.entries){
   if(!x||!dOk(x.date)||!tOk(x.time)||!Number.isInteger(Number(x.steps))||Number(x.steps)<1||Number(x.steps)>20000)throw Error('Fehlerhafter Eintrag: Datum, Uhrzeit oder Stufenanzahl.');
   const reason=String(x.reason||'').trim().slice(0,120);
   if(!reason)throw Error('Bei einem Eintrag fehlt der Grund.');
   const item={date:x.date,time:x.time,steps:Number(x.steps),shift:'',reason,symptoms:'',note:String(x.note||'').slice(0,500),source:'WorksManager (Screenshot)',id:makeId(x)};
   if(unique.has(fp(item)))continue;
   unique.add(fp(item));out.push(item);
  }
  return out;
 };
 async function inspect(){
  const f=file.files?.[0];reset();
  // Keep selected File reference after clearing the input for safe file re-selection.
  if(!f)return;
  try{
   if(f.size>1024*1024||f.size===0)throw Error('Bitte eine JSON-Datei bis 1 MB auswählen.');
   pending=validate(JSON.parse(await f.text()));
   const existing=(await S.list('suite')).filter(r=>r.type==='stairs').map(r=>r.value).filter(Boolean);
   const known=new Set(existing.map(fp)),fresh=pending.filter(r=>!known.has(fp(r)));
   const total=fresh.reduce((n,r)=>n+r.steps,0);
   info.textContent=pending.length+' eindeutige Einträge erkannt: '+fresh.length+' neu ('+total.toLocaleString('de-DE')+' Stufen), '+(pending.length-fresh.length)+' bereits vorhanden.';
   preview.hidden=false;confirmBtn.disabled=fresh.length===0;
   message.textContent='Datei privat geprüft. Noch nichts importiert. „Verschlüsselt übernehmen“ bestätigen.';
  }catch(e){reset();message.textContent='Datei konnte nicht geprüft werden: '+(e.message||e)}
 }
 // Do not keep file names or contents in a remote store.
 file.addEventListener('change',inspect);
 $('sc-import-cancel').addEventListener('click',()=>{reset();message.textContent='Import abgebrochen; keine Daten gespeichert.'});
 confirmBtn.addEventListener('click',async()=>{
  if(busy||!pending.length)return;
  busy=true;confirmBtn.disabled=true;
  try{
   const known=new Set((await S.list('suite')).filter(r=>r.type==='stairs').map(r=>r.value).filter(Boolean).map(fp));
   let saved=0,skipped=0;
   for(const x of pending){
    if(known.has(fp(x))){skipped++;continue}
    const now=new Date().toISOString();
    await S.put('suite',{key:'stairs/'+x.id,type:'stairs',value:{...x,createdAt:now,updatedAt:now}},'stairs/'+x.id);
    known.add(fp(x));saved++;
    message.textContent=saved+' von '+pending.length+' Einträgen verschlüsselt gespeichert …';
   }
   reset();message.textContent='Import abgeschlossen: '+saved+' Einträge übernommen, '+skipped+' doppelte übersprungen. Treppenstatistik wird aktualisiert.';
   if(window.ASTHMA_STAIRS?.refresh)await window.ASTHMA_STAIRS.refresh();
  }catch(e){message.textContent='Import teilweise fehlgeschlagen: '+(e.message||e)+'. Dieselbe Datei kann erneut gewählt werden, doppelte werden übersprungen.'}
  finally{busy=false;confirmBtn.disabled=false}
 });
 window.ASTHMA_WM_IMPORT={validate,fp,makeId};
})();


/* Asthma · Tagesampel für Treppen/Arbeitsbelastung (3.0.7).
   Read-only for existing observations; optional daily context lives in the encrypted suite vault.
   This tool is not a clinical fitness certificate or a legal finding, and has no step-count limit. */
(()=>{
 'use strict';
 const S=window.ASTHMA_SECURITY;
 const $=id=>document.getElementById(id);
 const main=$('sc-work-panel');
 if(!S?.state?.().unlocked||!main||$('st307-panel'))return;
 const SOURCES=Object.freeze([
  {id:'arbschg3',title:'§ 3 ArbSchG – Arbeitgeberpflichten, Wirksamkeit',url:'https://www.gesetze-im-internet.de/arbschg/__3.html'},
  {id:'arbschg4',title:'§ 4 ArbSchG – besonders schutzbedürftige Beschäftigte',url:'https://www.gesetze-im-internet.de/arbschg/__4.html'},
  {id:'arbschg5',title:'§ 5 ArbSchG – Gefährdungsbeurteilung',url:'https://www.gesetze-im-internet.de/arbschg/__5.html'},
  {id:'arbschg6',title:'§ 6 ArbSchG – Dokumentation',url:'https://www.gesetze-im-internet.de/arbschg/__6.html'},
  {id:'sgb151',title:'§ 151 SGB IX – Rechte bei Gleichstellung',url:'https://www.gesetze-im-internet.de/sgb_9_2018/__151.html'},
  {id:'sgb164',title:'§ 164 Abs. 4 SGB IX – behinderungsgerechte Arbeit',url:'https://www.gesetze-im-internet.de/sgb_9_2018/__164.html'},
  {id:'sgb167',title:'§ 167 SGB IX – Prävention und BEM',url:'https://www.gesetze-im-internet.de/sgb_9_2018/__167.html'},
  {id:'sgb178',title:'§ 178 SGB IX – Schwerbehindertenvertretung',url:'https://www.gesetze-im-internet.de/sgb_9_2018/__178.html'},
  {id:'med11',title:'§ 11 ArbSchG – arbeitsmedizinische Vorsorge',url:'https://www.gesetze-im-internet.de/arbschg/__11.html'},
  {id:'med5a',title:'§ 5a ArbMedVV – Wunschvorsorge',url:'https://www.gesetze-im-internet.de/arbmedvv/__5a.html'},
  {id:'asr18',title:'BAuA · ASR A1.8 – Verkehrswege und Treppen',url:'https://www.baua.de/DE/Angebote/Regelwerk/ASR/ASR-A1-8'},
  {id:'asra35',title:'BAuA · ASR A3.5 – Raumtemperatur',url:'https://www.baua.de/DE/Angebote/Regelwerk/ASR/ASR-A3-5'},
  {id:'notice16',title:'§ 16 ArbSchG – erkannte Gefahren melden',url:'https://www.gesetze-im-internet.de/arbschg/__16.html'}
 ]);
 const node=(tag,cls,txt)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=String(txt);return x;};
 const fmt=x=>Number(x).toLocaleString('de-DE',{maximumFractionDigits:1});
 const day=s=>/^\d{4}-\d\d-\d\d$/.test(s||'')?s.slice(8)+'.'+s.slice(5,7)+'.'+s.slice(0,4):String(s||'');
 const nval=x=>x===''||x==null||!Number.isFinite(Number(x))?null:Number(x);
 const toAnswer=(answer)=>answer==='yes'?'yes':answer==='no'?'no':answer==='partial'?'partial':'unknown';
 const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'');
 const unique=xs=>[...new Set(xs)];
 function statusSnapshot(profile){
  const gdb=nval(profile?.gdb),answers=profile?.arbeitgeberCheck31?.answers||{};
  const eqYes=profile?.equal===true||answers.eq==='yes';
  const eqNo=profile?.equal===false||answers.eq==='no';
  const equal=eqYes?'yes':eqNo?'no':'unknown';
  const conflict=eqYes&&eqNo;
  const covered=(gdb!==null&&gdb>=50)||((gdb===30||gdb===40)&&equal==='yes');
  const equalText=(gdb!==null?'GdB '+gdb+' · ':'')+(gdb!==null&&gdb>=50?'Schwerbehinderung laut Profil':equal==='yes'?'Gleichstellung laut Angaben bewilligt':equal==='no'?'Gleichstellung laut Profil nicht hinterlegt':'Gleichstellung nicht bestätigt')+(conflict?' (widersprüchliche Angaben – Bescheid/Profil abgleichen)':'');
  return {gdb,equal,covered,equalText,answers,conflict};
 }
 function evaluate(items,check={},work=[],profile={}){
  const steps=items.reduce((acc,x)=>acc+(Number.isFinite(Number(x.steps))?Math.max(0,Number(x.steps)):0),0);
  const symptoms=items.map(x=>nval(x.symptoms)).filter(v=>v!==null&&v>=0&&v<=3);
  for(const x of work){const v=nval(x.symptoms);if(v!==null&&v>=0&&v<=3)symptoms.push(v)}
  const extra=nval(check.symptoms);if(extra!==null&&extra>=0&&extra<=3)symptoms.push(extra);
  const maxSym=symptoms.length?Math.max(...symptoms):null;
  // Missing symptom details must not be treated as a negative symptom report.
  // An explicit day-wide self assessment may close gaps in single stair entries.
  const incomplete=check.symptoms==null||check.symptoms==='unknown'
   ?items.some(x=>nval(x.symptoms)===null)||work.some(x=>nval(x.symptoms)===null)
   :false;
  const heat=work.map(x=>nval(x.temperature)).filter(v=>v!==null&&v>=-20&&v<=70);
  const heatMax=heat.length?Math.max(...heat):null;
  const load=check.load||'unknown',breaks=check.breaks||'unknown';
  const context=statusSnapshot(profile),a=context.answers;
  const medReasons=[],legalReasons=[],medSources=['med11','med5a'],legalSources=['arbschg3','arbschg5'];
  const med={level:'yellow',label:'Nicht ausreichend beurteilbar',reasons:medReasons,refs:medSources};
  const legal={level:'yellow',label:'Arbeitsschutz prüfen',reasons:legalReasons,refs:legalSources};
  if(maxSym===3){med.level='red';med.label='Kritisch – medizinisch abklären';medReasons.push('Starke Beschwerden (Stufe 3) dokumentiert. Bei akuter schwerer Atemnot oder bedrohlichen Symptomen Notruf 112.');}
  else if(maxSym===2){med.label='Bedenklich – zeitnah prüfen';medReasons.push('Mittlere Beschwerden während/nach der Arbeit dokumentiert.');}
  else if(maxSym===1){med.label='Bedenklich – beobachten';medReasons.push('Leichte Beschwerden dokumentiert; Belastung und Erholung beobachten.');}
  else if(maxSym===0&&!incomplete){med.label='Keine akuten Beschwerden gemeldet';med.level='green';medReasons.push('Die angegebenen Einträge enthalten keine Beschwerden; das ist kein medizinischer Unbedenklichkeitsnachweis.');}
  else if(maxSym===0&&incomplete){med.label='Beschwerdeangaben unvollständig';medReasons.push('Mindestens ein Eintrag hat keine Beschwerdeangabe. Es ist keine gesicherte Beschwerdefreiheit für den ganzen Tag dokumentiert.');}
  else medReasons.push('Bei den Treppeneinträgen fehlt eine verlässliche Beschwerdeangabe; eine grüne Bewertung wäre unbegründet.');
  if(heatMax!==null&&heatMax>=30){medReasons.push('Zusätzlich '+fmt(heatMax)+' °C am Arbeitsplatz dokumentiert: Hitzebelastung gesondert prüfen.');medSources.push('asra35');if(med.level==='green'){med.level='yellow';med.label='Bedenklich – Hitze prüfen';}}
  if(load==='yes'){medReasons.push('Das Tragen einer Last auf Treppen wurde angegeben: Gewicht, Häufigkeit und Atembelastung individuell bewerten.');if(med.level==='green'){med.level='yellow';med.label='Lastentragen – prüfen';}}
  if(breaks==='no'){medReasons.push('Unzureichende Erholungsmöglichkeit laut eigener Angabe.');if(med.level==='green'){med.level='yellow';med.label='Entlastung prüfen';}}
  if(context.covered){medReasons.push('Behinderungsbedingte Einschränkungen und ärztliche Empfehlungen gehören in die individuelle Arbeitsplatzbewertung.');medSources.push('sgb164');}
  if(items.length>0&&maxSym!==3){medReasons.push('Für Treppenstufen pro Tag gibt es keinen allgemeinen gesetzlichen oder medizinischen Höchstwert. Die Stufenzahl ist allein kein Grenzwert für deine Belastbarkeit.');}
  if(context.covered){legalReasons.push(context.equalText+': Ansprüche auf behinderungsgerechte Arbeitsbedingungen sind besonders zu prüfen (§§ 151, 164 SGB IX).');legalSources.push('sgb151','sgb164','sgb178');}
  else legalReasons.push('Allgemeiner Arbeitsschutz gilt unabhängig vom GdB oder einer Gleichstellung.');
  if(context.conflict)legalReasons.push('Gleichstellung ist widersprüchlich eingetragen; bitte Bescheid und Arbeitgeber-Check miteinander abgleichen.');
  const knownRisk=toAnswer(a.risk),knownProtection=toAnswer(a.protect),knownAid=toAnswer(a.aid),knownEmployer=toAnswer(a.known);
  const deficits=[];
  if(knownRisk==='no')deficits.push('Nach dem Arbeitgeber-Check wurde die individuelle Gefährdungsbeurteilung nach deiner Kenntnis nicht durchgeführt.');
  if(knownProtection==='no')deficits.push('Nach dem Arbeitgeber-Check wurden keine wirksamen Schutzmaßnahmen umgesetzt.');
  if(knownAid==='no')deficits.push('Nach dem Arbeitgeber-Check wurden keine konkreten Entlastungen oder Hilfsmittel angeboten.');
  if(deficits.length){legalReasons.push(...deficits);legalSources.push('arbschg4','arbschg6','sgb164');}
  if(knownEmployer==='yes')legalReasons.push('Der Arbeitgeber kennt laut Arbeitgeber-Check deine arbeitsbezogenen Einschränkungen.');
  if(breaks==='no'){legalReasons.push('Fehlende Erholungsmöglichkeiten wurden für diesen Tag angegeben; tatsächliche Schutzmaßnahmen prüfen.');legalSources.push('arbschg3','arbschg4');}
  if(heatMax!==null&&heatMax>=30){legalReasons.push('Hohe gemessene Raumtemperatur: ASR A3.5 und die konkreten Maßnahmen prüfen.');legalSources.push('asra35');}
  if(load==='yes'){legalReasons.push('Lastentragen auf der Treppe dokumentiert: Arbeitsorganisation und mögliche Transporthilfen prüfen.');legalSources.push('asr18','sgb164');}
  const symptomatic=maxSym!==null&&maxSym>=2;
  const corroborated=context.covered&&knownEmployer==='yes'&&knownRisk==='no'&&(knownProtection==='no'||knownAid==='no')&&symptomatic;
  if(corroborated){legal.level='red';legal.label='Möglicher Pflichtverstoß – prüfen';legalReasons.push('Mehrere konkrete Anhaltspunkte kommen zusammen: dokumentierte Beschwerden, bekanntes Handicap und laut Selbstauskunft fehlende Risiko-/Schutzprüfung. Kein automatischer Beweis für einen Rechtsverstoß.');}
  else if(deficits.length||breaks==='no'||symptomatic||heatMax!==null&&heatMax>=30){legal.level='yellow';legal.label='Bedenklich – Arbeitgeberpflichten prüfen';}
  else if(knownRisk==='yes'&&knownProtection==='yes'&&maxSym===0&&!incomplete&&load!=='yes'&&breaks!=='no'){
   legal.level='green';legal.label='Kein konkreter Verstoß erkennbar';legalReasons.push('Nach den vorhandenen Antworten sind Gefährdungsprüfung und Schutzmaßnahmen dokumentiert; das ersetzt keine rechtliche Einzelprüfung.');
  }else{legalReasons.push('Für eine abschließende Prüfung fehlen individuelle Nachweise zur Gefährdungsbeurteilung und Wirksamkeit der Maßnahmen.');}
  legalReasons.push('Die Stufenzahl allein beweist keinen Rechtsverstoß. Dokumentation und tatsächliche Arbeitsorganisation sind entscheidend.');
  legalSources.push('arbschg5','sgb164');
  if(context.covered){legalSources.push('sgb167');}
  return {steps,maxSym,heatMax,context,med,legal,sourceIds:{medical:unique(medSources),legal:unique(legalSources)}};
 }
 const panel=node('section','suite-subpanel');panel.id='st307-panel';
 panel.innerHTML=`<h3>Tägliche Treppenbewertung mit Ampel</h3>
 <p>Die Tagesbewertung wird beim Erfassen, Ändern oder Importieren von Treppen automatisch aktualisiert. Getrennt nach <strong>Gesundheitsbelastung</strong> und <strong>Arbeitsschutz / Gleichstellung</strong>. Die Werte zählen dokumentierte Stufen, nicht automatisch nur Aufstiege.</p>
 <p class="st307-identity" id="st307-status"></p><p class="st307-identity">Die rechtliche Bewertung verwendet den <strong>aktuell gespeicherten</strong> Arbeitgeber-Check auch für ältere Messtage. Frühere Verhältnisse lassen sich daraus nicht beweisen. Rechtsquellen: amtliche Links unten (Stand der Prüfung 24.10.2026).</p>
 <div class="st307-tools"><label>Zeitraum<select id="st307-range"><option value="30">Letzte 30 Tage mit Einträgen</option><option value="year">Dieses Jahr</option><option value="all">Alle Jahre</option></select></label>
 <button class="btn btn-outline" type="button" id="st307-refresh">Bewertungen aktualisieren</button></div>
 <div class="st307-overall" id="st307-overall" aria-live="polite"></div>
 <div id="st307-days" aria-live="polite"></div>
 <button id="st307-more" type="button" class="btn btn-outline" hidden>Weitere Tage zeigen</button>
 <details class="st307-legal"><summary>Rechtsgrundlagen und Erläuterungen</summary><p>Keine pauschale tägliche Stufenobergrenze im deutschen Arbeitsrecht. Die Ampeln sind dokumentationsbasierte Hinweise, keine Messung der individuellen Belastbarkeit, keine ärztliche Eignungsbescheinigung und keine verbindliche juristische Feststellung.</p><div id="st307-all-sources"></div></details>`;
 const before=main.querySelector('.sc-lower');(before||main).insertAdjacentElement(before?'beforebegin':'afterend',panel);
 const css=node('style');css.textContent=`
 #st307-panel{border:1px solid #b9d9e7;border-radius:15px;background:#f7fbff;padding:14px;margin:15px 0}
 #st307-panel h3{margin:0 0 7px;font-size:1.15rem;color:#154255}
 #st307-panel>p{font-size:.89rem;line-height:1.5;color:#456474}
 #st307-panel .st307-tools{display:flex;align-items:end;gap:10px;flex-wrap:wrap;margin:12px 0}
 #st307-panel label{display:block;color:#33596b;font-size:.9rem;font-weight:650}
 #st307-panel input,#st307-panel select,#st307-panel textarea{width:100%;background:white;color:#183f52;font-size:16px;border:1px solid #aecedb;border-radius:9px;padding:9px;box-sizing:border-box;margin-top:5px}
 #st307-panel .st307-identity{background:#e9f4fa;padding:9px;border-radius:8px}
 #st307-panel .st307-day{margin:11px 0;background:white;border:1px solid #d4e4ec;border-radius:13px;padding:12px}
 #st307-panel .st307-day h4{margin:0 0 8px;font-size:1rem}
 #st307-panel .st307-metrics{display:flex;gap:10px;flex-wrap:wrap;color:#567483;font-size:.83rem;margin:6px 0 11px}
 #st307-panel .st307-lights{display:grid;grid-template-columns:1fr 1fr;gap:10px}
 #st307-panel .st307-light{border:1px solid #ddd;border-left-width:6px;border-radius:9px;padding:10px;min-width:0}
 #st307-panel .st307-light strong{display:block;font-size:.89rem;color:#21394b;margin:3px 0 5px}
 #st307-panel .st307-light span{display:block;font-size:.82rem;line-height:1.35}
 #st307-panel .st307-light.green{background:#eaf7ee;border-color:#9dcfae;border-left-color:#28804a}
 #st307-panel .st307-light.yellow{background:#fff6df;border-color:#edda9b;border-left-color:#b27b13}
 #st307-panel .st307-light.red{background:#fcece9;border-color:#e7b8b0;border-left-color:#b63c33}
 #st307-panel .st307-reason{font-size:.86rem;color:#435e6e;margin:7px 0}
 #st307-panel .st307-day details{margin-top:9px}
 #st307-panel summary{cursor:pointer;color:#244e64;font-size:.9rem;font-weight:700}
 #st307-panel .st307-facts{font-size:.87rem;padding:0 0 0 20px;line-height:1.5}
 #st307-panel .st307-refs{margin:8px 0;display:flex;flex-wrap:wrap;gap:6px}
 #st307-panel .st307-refs a{font-size:.82rem;padding:6px;border:1px solid #bed4df;border-radius:8px;color:#0b5875;background:#fff;overflow-wrap:anywhere}
 #st307-panel .st307-context{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
 #st307-panel .st307-context label:last-of-type{grid-column:1/-1}
 #st307-panel .st307-context button{grid-column:1/-1}
 #st307-panel .st307-overall{font-weight:600;color:#24475d;margin:8px 0}
 #st307-panel .st307-alert{padding:10px;border-radius:9px;background:#fff4df;color:#755109;font-size:.85rem}
 #st307-panel .st307-legal{margin-top:13px}
 #st307-panel .st307-legal p{font-size:.86rem;color:#506877}
 @media(max-width:640px){#st307-panel{padding:10px}#st307-panel .st307-lights,#st307-panel .st307-context{grid-template-columns:1fr}#st307-panel .st307-tools{display:block}#st307-panel .st307-tools button{margin-top:8px}}
 `;document.head.append(css);
 function refs(container,ids){const div=node('div','st307-refs');for(const id of unique(ids)){const r=SOURCES.find(x=>x.id===id);if(!r)continue;const a=node('a',null,r.title);a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';div.append(a)}container.append(div);}
 refs($('st307-all-sources'),SOURCES.map(x=>x.id));
 const stepReport=[];
 let cache=[],assessments=new Map(),workdays=new Map(),limit=14,busy=false,requested=false,lastRecords=[];
 const status=$('st307-status');
 function listFor(d){return cache.filter(r=>r.date===d)}
 function workFor(d){return workdays.get(d)||[]}
 function currentProfile(){return S.profileGet()||{}}
 function fullEval(d){return evaluate(listFor(d),assessments.get(d)||{},workFor(d),currentProfile())}
 function lastDayMetrics(days,d){const index=days.indexOf(d),prior=index+1<days.length?days[index+1]:null;
  if(!prior)return 'Kein früherer dokumentierter Tag als Vergleich.';
  const before=listFor(prior).reduce((n,r)=>n+Number(r.steps||0),0),after=listFor(d).reduce((n,r)=>n+Number(r.steps||0),0),difference=after-before;
  return 'Voriger Eintragstag '+day(prior)+': '+fmt(before)+' Stufen · Differenz '+(difference>0?'+':'')+fmt(difference)+' Stufen'+(before?' ('+(difference>0?'+':'')+fmt(difference/Math.abs(before)*100)+' %)':'');
 }
 function choice(label,id,choices,value){const hold=node('label',null,label),select=node('select');select.id=id;for(const [v,t] of choices){const opt=node('option',null,t);opt.value=v;select.append(opt)}select.value=value||'unknown';hold.append(select);return hold}
 const yn=[['unknown','Nicht angegeben'],['no','Nein'],['yes','Ja']];
 const symptoms=[['unknown','Nicht angegeben'],['0','0 – keine'],['1','1 – leicht'],['2','2 – mittel'],['3','3 – stark']];
 function card(d,days){
  const rows=listFor(d),report=fullEval(d),card=node('article','st307-day'),stats=report.context;
  const header=node('h4',null,day(d)+' · '+fmt(report.steps)+' Stufen');card.append(header);
  const metrics=node('div','st307-metrics');metrics.append(node('span',null,rows.length+' Eintrag'+(rows.length===1?'':'e')));
  metrics.append(node('span',null,lastDayMetrics(days,d)));
  card.append(metrics);
  const reasons=new Map();for(const item of rows){const k=String(item.reason||'Nicht zugeordnet').trim()||'Nicht zugeordnet';reasons.set(k,(reasons.get(k)||0)+Number(item.steps||0))}
  if(reasons.size){const list=node('p','st307-reason');list.append(node('strong',null,'Tätigkeiten: '));list.append(document.createTextNode([...reasons].sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+': '+fmt(v)+' Stufen').join(' · ')));card.append(list)}
  const lights=node('div','st307-lights');
  for(const [title,key] of [['Arbeitsmedizinisch','med'],['Arbeitsrecht / Gleichstellung','legal']]){
   const info=report[key],block=node('div','st307-light '+info.level);
   block.append(node('strong',null,title),node('span',null,(info.level==='green'?'GRÜN':info.level==='red'?'ROT':'GELB')+' · '+info.label));
   lights.append(block);
  }
  card.append(lights);
  const details=node('details');details.append(node('summary',null,'Begründung, Gesetze und Tagesangaben'));
  for(const [key,title] of [['med','Arbeitsmedizinische Beurteilung'],['legal','Arbeitsrechtliche Orientierung']]){
   details.append(node('h5',null,title));const ul=node('ul','st307-facts');for(const t of report[key].reasons)ul.append(node('li',null,t));details.append(ul);refs(details,report.sourceIds[key]);
  }
  details.append(node('p','st307-alert','Eine rote Rechtsampel bedeutet „möglichen Pflichtverstoß fachlich prüfen“, nicht „Gesetzesverstoß bewiesen“. Eine grüne Ampel bedeutet nicht, dass die Belastung medizinisch sicher ist.'));
  const saved=assessments.get(d)||{};
  const f=node('form','st307-context');f.id='st307-context-'+d;
  f.append(choice('Zusätzliche Beschwerden an diesem Tag','st307-symptom-'+d,symptoms,saved.symptoms||'unknown'));
  f.append(choice('Last auf der Treppe getragen?','st307-load-'+d,yn,saved.load||'unknown'));
  f.append(choice('Ausreichende Erholung/Entlastung möglich?','st307-breaks-'+d,yn,saved.breaks||'unknown'));
  const note=node('label',null,'Ergänzende sachliche Notiz (optional)'),input=node('textarea');input.rows=2;input.maxLength=500;input.value=saved.note||'';input.id='st307-note-'+d;note.append(input);f.append(note);
  const b=node('button','btn btn-primary','Tagesangaben verschlüsselt speichern');b.type='submit';f.append(b);
  const msg=node('p','st307-reason');msg.setAttribute('role','status');f.append(msg);
  f.addEventListener('submit',async ev=>{
   ev.preventDefault();if(b.disabled)return;b.disabled=true;
   const context={id:'daily-'+d,date:d,kind:'stairsDailyContext',symptoms:$('st307-symptom-'+d).value,load:$('st307-load-'+d).value,breaks:$('st307-breaks-'+d).value,note:input.value.trim().slice(0,500),updatedAt:new Date().toISOString()};
   try{await S.put('suite',{key:'stairsDailyContext/'+d,type:'stairsDailyContext',value:context},'stairsDailyContext/'+d);assessments.set(d,context);msg.textContent='Gespeichert, Ampel wird neu berechnet.';updateOne(d,days)}
   catch(e){msg.textContent='Speichern fehlgeschlagen: '+e.message}
   finally{b.disabled=false}
  });
  details.append(f);card.append(details);
  return card;
 }
 function updateOne(d,days){const previous=document.getElementById('st307-day-'+d);if(!previous)return;const wasOpen=previous.querySelector('details')?.open;const newer=card(d,days);newer.id=previous.id;newer.querySelector('details').open=Boolean(wasOpen);previous.replaceWith(newer);}
 function render(){
  const allDays=[...new Set(cache.map(x=>x.date))].sort().reverse(),mode=$('st307-range').value,year=String(new Date().getFullYear());
  const days=(mode==='year'?allDays.filter(x=>x.startsWith(year)):mode==='all'?allDays:allDays.slice(0,30));
  const root=$('st307-days');root.replaceChildren();
  const profile=statusSnapshot(currentProfile());
  status.textContent=profile.equalText+' · Die Ampel berücksichtigt nur die vorhandenen Angaben.';
  if(!days.length){root.append(node('p','st307-alert','Noch keine Treppen-Einträge im gewählten Zeitraum gespeichert. Sobald du Stufen einträgst oder importierst, entsteht hier eine tägliche Bewertung.'));$('st307-overall').textContent='';$('st307-more').hidden=true;return;}
  let medRed=0,medYellow=0,legRed=0,legYellow=0;for(const d of days){const e=fullEval(d);if(e.med.level==='red')medRed++;if(e.med.level==='yellow')medYellow++;if(e.legal.level==='red')legRed++;if(e.legal.level==='yellow')legYellow++}
  $('st307-overall').textContent=days.length+' erfasste Kalendertage · Gesundheit: '+medRed+' kritisch, '+medYellow+' prüfbedürftig · Arbeitsschutz: '+legRed+' mögliche Pflichtverstöße zu prüfen, '+legYellow+' prüfbedürftig.';
  const frag=document.createDocumentFragment();for(const d of days.slice(0,limit)){const c=card(d,days);c.id='st307-day-'+d;frag.append(c)}root.append(frag);
  $('st307-more').hidden=days.length<=limit;
 }
 async function reload(){if(busy){requested=true;return}busy=true;
  try{const all=await S.list('suite');cache=all.filter(x=>x.type==='stairs').map(x=>x.value).filter(x=>x&&validDate(x.date)&&Number.isInteger(Number(x.steps))&&Number(x.steps)>0);
   assessments=new Map(all.filter(x=>x.type==='stairsDailyContext'&&validDate(x.value?.date)).map(x=>[x.value.date,x.value]));
   workdays=new Map();for(const record of all){if(record.type!=='work'||!validDate(record.value?.date))continue;const d=record.value.date;if(!workdays.has(d))workdays.set(d,[]);workdays.get(d).push(record.value)}
   render();}
  catch(err){status.textContent='Bewertung nicht möglich: '+err.message}
  finally{busy=false;if(requested){requested=false;reload()}}
 }
 $('st307-range').addEventListener('change',()=>{limit=14;render()});$('st307-more').addEventListener('click',()=>{limit+=14;render()});$('st307-refresh').addEventListener('click',reload);
 let debounce=false;window.addEventListener('asthma:secure-change',e=>{
  if(e.detail?.group!=='suite'||debounce)return;
  debounce=true;setTimeout(()=>{debounce=false;reload()},120)
 });
 window.addEventListener('asthma:profile-change',reload);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)reload()});
 reload();
 // Enrich existing month/year report without replacing its previous data or charts.
 function appendDaily(report,range){
  const r=range;report.querySelectorAll('[data-st307-report]').forEach(el=>el.remove());
  const allDays=[...new Set(cache.map(x=>x.date).filter(x=>x>=r.from&&x<=r.to))].sort();
  const area=node('section','stats25-section');area.dataset.st307Report='true';area.append(node('h3',null,'Tägliche Treppenampel – Arbeitsmedizin und Arbeitsschutz'));
  area.append(node('p','stats25-muted','Datengestützte Orientierung mit Angaben zu Beschwerden, Gleichstellung und Gefährdungsbeurteilung. Die Ampel ist keine individuelle ärztliche Freigabe oder rechtsverbindliche Prüfung. Keine allgemeine gesetzliche Stufengrenze.'));
  area.append(node('p','stats25-muted',statusSnapshot(currentProfile()).equalText));
  if(!allDays.length)area.append(node('p','stats25-muted','Für den Zeitraum wurden keine Treppeneinträge gespeichert.'));
  for(const d of allDays){const q=fullEval(d),e=node('div','stats25-line');
   e.append(node('span',null,day(d)+' · '+fmt(q.steps)+' Stufen'));
   const ms=q.med.level==='red'?'ROT':q.med.level==='green'?'GRÜN':'GELB',ls=q.legal.level==='red'?'ROT':q.legal.level==='green'?'GRÜN':'GELB';
   e.append(node('strong',null,'Medizin '+ms+' – '+q.med.label+' | Recht '+ls+' – '+q.legal.label));
   area.append(e);
   const why=node('p','stats25-muted',q.med.reasons[0]+' '+q.legal.reasons.filter(x=>/Gefährdungsbeurteilung|Schutzmaßnahmen|Pflichtverstoß|Arbeitgeber-Check/.test(x)).join(' ').slice(0,550));area.append(why);
  }
  area.append(node('p','stats25-muted','Die Auswertung basiert auf dem aktuell gespeicherten Arbeitgeber-Check, auch bei älteren Tagen. Fehlende Angaben sind nicht als Unbedenklichkeit zu verstehen.'));
  for(const id of ['arbschg5','arbschg4','sgb151','sgb164','med5a','asr18','asra35']){const source=SOURCES.find(x=>x.id===id);if(source)area.append(node('p','stats25-muted','Quelle: '+source.title+' · '+source.url));}
  report.append(area);
 }
 const prior=Object.getOwnPropertyDescriptor(window,'ASTHMA_STATSP292');let original=prior?.get?prior.get():window.ASTHMA_STATSP292;
 const raw=()=>prior?.get?prior.get():original;
 const set=value=>{if(prior?.set)prior.set(value);else original=value;cachedIn=null};
 let cachedIn=null,cachedOut=null;
 function decorated(){const a=raw();if(a===cachedIn)return cachedOut;cachedIn=a;
  cachedOut=a?.append?Object.freeze({...a,append:async(report,r)=>{await a.append(report,r);try{await reload();appendDaily(report,r)}catch(e){console.warn('Treppen-Tagesauswertung:',e);}}}):a;
  return cachedOut;
 }
 Object.defineProperty(window,'ASTHMA_STATSP292',{configurable:true,enumerable:true,get:decorated,set});
 window.ASTHMA_DAILY307={evaluate,statusSnapshot,SOURCES,refresh:reload,summary:()=>cache.length};
})();

/* Asthma 3.0.8 – Schnellwahl auf der Startseite.
   Keine neuen Datenspeicher und keine automatische Übertragung von Dateien.
   Öffnet ausschließlich bestehende Aufnahme-, Import- und Eingabeformulare. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const security=window.ASTHMA_SECURITY;
 const home=$('uebersicht');
 if(!home||!security?.state?.().unlocked||$('st308-quickstart'))return;
 const actions=[
  {id:'lung-photo',title:'Lungenfunktion',sub:'Befundfoto auswählen',icon:'lungs',target:'befunde',file:'scan-gallery',primary:true},
  {id:'lung-pdf',title:'Lungenfunktion als PDF',sub:'PDF-Befund öffnen',icon:'file',target:'befunde',file:'pdf20-file',primary:true},
  {id:'lab-photo',title:'Bluttest hochladen',sub:'Laborfoto auswählen',icon:'drop',target:'labor',file:'lab-file',primary:true},
  {id:'bp',title:'Blutdruck',sub:'Oberen und unteren Wert erfassen',icon:'heart',target:'vitalwerte',form:'v29-form-bp',tab:'bp',primary:true},
  {id:'pulse',title:'Puls',sub:'Puls und Uhrzeit erfassen',icon:'pulse',target:'vitalwerte',form:'v29-form-pulse',tab:'pulse',primary:true},
  {id:'stairs',title:'Treppenzähler',sub:'+30 / +24 Stufen · Grund · Ampel',icon:'stairs',target:'arbeit',focus:'sc-steps',primary:true,featured:true},
  {id:'oxygen',title:'Sauerstoffsättigung',sub:'SpO₂ eintragen',icon:'oxygen',target:'vitalwerte',form:'v29-form-spo2',tab:'spo2',primary:true},
  {id:'lung-manual',title:'Lungenfunktion manuell',sub:'FEV₁ und FVC',icon:'lungs',target:'lungenwerte',focus:'lung-fev1-number'},
  {id:'lab-manual',title:'Blutwerte manuell',sub:'Einzelwert und Referenz',icon:'drop',target:'labor',focus:'lab-value'},
  {id:'pef',title:'Peak-Flow / ePEF',sub:'Einzelmessung eintragen',icon:'pulse',target:'peakflow',focus:'epef-manual-pef'},
  {id:'pef-file',title:'PEF-Datei importieren',sub:'CSV / Excel einlesen',icon:'file',target:'peakflow',file:'epef-file'},
  {id:'weight',title:'Gewicht',sub:'Neues Gewicht eintragen',icon:'scale',target:'vitalwerte',focus:'s292-weight-form'},
  {id:'symptoms',title:'Asthma-Tagebuch',sub:'Beschwerden und Bedarfsmedikation',icon:'note',target:'start',focus:'a28-entry-details'},
  {id:'medications',title:'Medikamente',sub:'Medikamentenplan ergänzen',icon:'med',target:'therapie',focus:'med-name'},
  {id:'sick',title:'Asthma-Krankschreibung',sub:'AU mit Datum dokumentieren',icon:'file',target:'akte',focus:'au25-form'},
  {id:'work',title:'Arbeitsbelastung',sub:'Hitze, Atemnot, Schicht',icon:'stairs',target:'arbeit',focus:'work-date'},
  {id:'calendar',title:'Termin eintragen',sub:'Kalender öffnen',icon:'calendar',target:'kalender',focus:'cal-title'},
  {id:'stats',title:'Monats- / Jahresstatistik',sub:'Werte und Diagramme auswerten',icon:'chart',target:'statistik',focus:'stats25-build'}
 ];
 const icons={
  lungs:'<path d="M12 3v8m0-5 2-2m-2 2-2-2"/><path d="M10 10c-2-4-3-4-4-2L3 15c-1 5 2 6 5 5 3-1 3-3 3-6v-4M14 10c2-4 3-4 4-2l3 7c1 5-2 6-5 5-3-1-3-3-3-6v-4"/>',
  file:'<path d="M6 3h8l5 5v13H6zM14 3v5h5M9 13h7M9 17h7"/>',
  drop:'<path d="M12 2s-7 9-7 14a7 7 0 0 0 14 0c0-5-7-14-7-14z"/><path d="M8 17a4 4 0 0 0 4 4"/>',
  heart:'<path d="M20.8 5.6a5.4 5.4 0 0 0-7.6 0L12 6.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.8a5.4 5.4 0 0 0 0-7.6z"/><path d="M5 13h4l2-3 2 6 2-3h4"/>',
  pulse:'<path d="M2 12h4l3-6 4 12 3-7 2 1h4"/>',
  stairs:'<path d="M2 20h5v-5h5v-5h5V5h5"/><path d="M16 5h6v6"/>',
  oxygen:'<circle cx="12" cy="12" r="9"/><path d="M5 13h3l2-4 3 7 2-4h4"/>',
  scale:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9a4 4 0 0 1 6 0M12 10v4"/>',
  note:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/>',
  med:'<path d="m8 20 12-12a4 4 0 0 0-6-6L2 14a4 4 0 0 0 6 6zM7 9l8 8"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6M17 2v6M3 11h18"/>',
  chart:'<path d="M3 3v18h18M7 15l4-5 4 3 5-7"/>'
 };
 const escapeText=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 const button=a=>'<button type="button" class="st308-action'+(a.featured?' st308-featured':'')+'" data-st308-action="'+a.id+'" aria-label="'+escapeText(a.title+': '+a.sub)+'"><span class="st308-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(icons[a.icon]||icons.note)+'</svg></span><span class="st308-word"><strong>'+escapeText(a.title)+'</strong><small>'+escapeText(a.sub)+'</small></span><span class="st308-chevron" aria-hidden="true">›</span></button>';
 let installed=false,watcher=null;
 function setup(){
  if(installed||$('st308-quickstart'))return Boolean(installed);
  const dashboard=home.querySelector('.d26-dashboard');
  if(!dashboard)return false;
  const panel=document.createElement('section');panel.id='st308-quickstart';panel.className='st308-panel';
  panel.setAttribute('aria-labelledby','st308-title');
  panel.innerHTML='<div class="st308-heading"><div><p class="st308-kicker">SCHNELLERFASSUNG</p><h2 id="st308-title">Neuen Wert eintragen oder Befund auswählen</h2><p>Direkt zum passenden Formular – ohne Umwege durch die Menüs.</p></div><span class="st308-private">Lokal &amp; privat</span></div>'+
   '<div class="st308-grid" aria-label="Wichtige Schnelleingaben">'+actions.filter(x=>x.primary).map(button).join('')+'</div>'+
   '<details class="st308-extra"><summary>Weitere Werte, Dokumentation und Statistiken</summary><div class="st308-grid" aria-label="Weitere Schnelleingaben">'+actions.filter(x=>!x.primary).map(button).join('')+'</div></details>'+
   '<p class="st308-hint">Befundfotos, PDFs und Excel-Dateien werden zunächst nur auf deinem Gerät ausgewählt. Medizinische Werte werden erst nach deiner Prüfung und ausdrücklichem Speichern in den bestehenden verschlüsselten Tresor übernommen. Bei Blutdruck und Puls erfolgt die Eingabe derzeit manuell.</p>'+
   '<p class="st308-feedback" id="st308-feedback" role="status" aria-live="polite"></p>';
  const greeting=dashboard.querySelector('.d26-greeting');
  if(greeting)greeting.insertAdjacentElement('afterend',panel);else dashboard.prepend(panel);
  const style=document.createElement('style');style.id='st308-styles';style.textContent=`
   #st308-quickstart{margin:18px 0 22px;padding:18px;background:#eff7fb;border:1px solid #b7d5e4;border-radius:17px;color:#173d51;box-sizing:border-box}
   #st308-quickstart *{box-sizing:border-box}
   #st308-quickstart .st308-heading{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:14px}
   #st308-quickstart .st308-kicker{font-size:.75rem;letter-spacing:.08em;font-weight:800;color:#267794;margin:0 0 5px}
   #st308-quickstart h2{font-size:1.28rem;line-height:1.25;color:#163c51;margin:0 0 7px}
   #st308-quickstart .st308-heading p:not(.st308-kicker){font-size:.88rem;color:#506d7e;margin:0}
   #st308-quickstart .st308-private{font-size:.78rem;border:1px solid #a7cfc0;border-radius:20px;padding:5px 9px;color:#176b58;background:#f5fffa;font-weight:650}
   #st308-quickstart .st308-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
   #st308-quickstart .st308-action{display:flex;align-items:center;text-align:left;gap:9px;min-height:76px;width:100%;padding:11px 10px;border:1px solid #bcd7e3;border-radius:12px;background:white;color:#1a455c;cursor:pointer;font-family:inherit;box-shadow:0 1px 2px #15384b13;touch-action:manipulation}
   #st308-quickstart .st308-action:active{transform:scale(.99)}
   #st308-quickstart .st308-action:focus-visible{outline:3px solid #377cc6;outline-offset:2px}
   #st308-quickstart .st308-icon{display:flex;flex-shrink:0;align-items:center;justify-content:center;width:35px;height:35px;border-radius:10px;background:#eaf4f9;color:#206f93}
   #st308-quickstart .st308-icon svg{height:23px;width:23px;display:block}
   #st308-quickstart .st308-word{flex:1;min-width:0}
   #st308-quickstart .st308-word strong{display:block;font-size:.9rem;line-height:1.25;overflow-wrap:anywhere;color:inherit}
   #st308-quickstart .st308-word small{display:block;font-size:.74rem;line-height:1.3;color:#627c8d;margin-top:4px;overflow-wrap:anywhere}
   #st308-quickstart .st308-chevron{font-size:1.3rem;color:#7b9dad;font-weight:700}
   #st308-quickstart .st308-featured{grid-column:1/-1;min-height:82px;background:linear-gradient(120deg,#d9f2e9,#ebfbf6);border:2px solid #5cab91;color:#125a45}
   #st308-quickstart .st308-featured .st308-icon{background:#147959;color:white}
   #st308-quickstart .st308-featured .st308-word strong{font-size:1rem}
   #st308-quickstart .st308-featured .st308-word small{color:#386e5a}
   #st308-quickstart .st308-extra{margin-top:12px;background:#f9fcfe;border-radius:10px;border:1px solid #d2e4eb;padding:10px}
   #st308-quickstart .st308-extra summary{font-size:.9rem;font-weight:700;color:#205472;cursor:pointer;padding:5px 0}
   #st308-quickstart .st308-extra[open] .st308-grid{margin-top:10px}
   #st308-quickstart .st308-hint{font-size:.78rem;line-height:1.45;color:#577181;margin:14px 1px 0}
   #st308-quickstart .st308-feedback{font-size:.82rem;color:#246880;font-weight:650;margin:8px 0 0}
   @media(max-width:380px){#st308-quickstart{padding:11px}#st308-quickstart .st308-action{padding:8px 6px;gap:6px}#st308-quickstart .st308-icon{width:30px;height:30px}#st308-quickstart .st308-word strong{font-size:.84rem}#st308-quickstart .st308-word small{font-size:.69rem}}
   @media(min-width:770px){#st308-quickstart .st308-grid{grid-template-columns:repeat(3,minmax(0,1fr))}#st308-quickstart .st308-featured{grid-column:span 2}}
  `;document.head.append(style);
  const feedback=$('st308-feedback');
  const nav=window.ASTHMA_NAV;
  function reveal(element){if(!element)return;let n=element;while(n&&n!==document.body){if(n.tagName==='DETAILS')n.open=true;n=n.parentElement}}
  function pointTo(element,focus=true){if(!element)return false;reveal(element);
   requestAnimationFrame(()=>{
    // Always scroll the *actual* edit field into view, after navigating.
    const target=element.matches('form')?element.querySelector('input:not([type="hidden"]),select,textarea')||element:element;
    try{target.scrollIntoView({block:'center',behavior:'smooth'})}catch{target.scrollIntoView()}
    if(focus&&target.matches?.('input:not([type="file"]),textarea')){
     try{target.focus({preventScroll:true})}catch{target.focus()}
    }
   });return true;
  }
  function perform(a){
   if(!security.state().unlocked){feedback.textContent='Bitte zuerst den privaten Tresor entsperren.';return false}
   if(!nav?.go){feedback.textContent='Navigation konnte nicht gestartet werden. App erneut öffnen.';return false}
   // Important: Keep file input.click() *in the original user gesture* for iPhone Safari.
   nav.go(a.target);
   if(a.tab){const tab=$('v29-tabs')?.querySelector('[data-kind="'+a.tab+'"]');if(tab)tab.click();}
   if(a.file){const f=$(a.file);if(!f){feedback.textContent='Dateiauswahl nicht verfügbar. Bitte die betreffende Seite öffnen.';return false}
    reveal(f); // May be inside a closed <details>.
    try{f.click()}catch(err){feedback.textContent='Bitte auf der geöffneten Seite die Dateiauswahl antippen.';pointTo(f,false);return false}
    feedback.textContent='Datei auswählen und die erkannten Werte vor dem Speichern prüfen.';
    return true;
   }
   if(a.id==='symptoms'){const d=$('a28-entry-details');if(d){d.open=true;feedback.textContent='Tagebuch-Schnelleingabe geöffnet.';return pointTo($('a28-form')||d,false)}}
   if(a.id==='sick'){
     // The AU form lives inside the medical record section. The existing tab may be collapsed.
     const f=$('au25-form');if(f){reveal(f);feedback.textContent='Asthma-AU erfassen.';return pointTo(f,false)}
   }
   const form=a.form?$(a.form):null,element=form?.querySelector('input[name="value"]')||(a.focus?$(a.focus):null);
   if(!element){feedback.textContent='Eingabefeld aktuell nicht verfügbar. Bitte die geöffnete Seite verwenden.';return false}
   feedback.textContent=a.id==='stairs'?'Treppenzähler geöffnet – +30 oder +24 Stufen hinzufügen und Grund wählen.':'Eingabefeld geöffnet. Wert prüfen und anschließend speichern.';
   return pointTo(element,!['stats25-build','au25-form'].includes(a.focus));
  }
  panel.addEventListener('click',event=>{
   const b=event.target.closest('button[data-st308-action]');if(!b||!panel.contains(b))return;
   const a=actions.find(x=>x.id===b.dataset.st308Action);if(!a)return;
   event.preventDefault();perform(a);
  });
  window.ASTHMA_QUICKSTART308=Object.freeze({actions:actions.map(a=>({id:a.id,title:a.title,target:a.target})),open:id=>{
   const a=actions.find(x=>x.id===id);return a?perform(a):false;
  }});
  installed=true;if(watcher)watcher.disconnect();return true;
 }
 if(setup())return;
 watcher=new MutationObserver(()=>{setup()});watcher.observe(home,{childList:true,subtree:true});
 // Wait for the existing modern dashboard; do not create a duplicate when loading is slow.
})();



/* Asthma 3.0.9 – Reha-Zustaendigkeitslotse nach lokalem Profil.
   Aktuelle Versicherungszuordnung ist nicht aus einer Wohnadresse ableitbar.
   Keine Gesundheits-/Adressdaten in GitHub, keine Netzwerkanfragen. */
(()=>{
 'use strict';
 const SEC=window.ASTHMA_SECURITY, root=document.getElementById('antraege');
 if(!SEC?.state?.().unlocked||!root||document.getElementById('reha309'))return;
 const $=id=>document.getElementById(id), el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n};
 const URLS=Object.freeze({
  reha:'https://www.deutsche-rentenversicherung.de/DRV/DE/Reha/FAQ_Rehabilitation/Reha/00_faq_liste_reha',
  eantrag:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/_pdf/G0100.pdf',
  med:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/Formularpakete/01_versicherte/reha/_DRV_Paket_Rehabilitation_Med_Rehabilitation.html',
  work:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/Formularpakete/01_versicherte/reha/_DRV_Paket_Rehabilitation_Leistungen_zur_Teilhabe.html',
  g0100:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/_pdf/G0100.pdf',
  g0110:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/_pdf/G0110.html',
  g0130:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/_pdf/G0130?nn=6a097dd8ca84ce5471c19ad2',
  westfalen:'https://www.deutsche-rentenversicherung.de/Westfalen/DE/Ueber-uns/Unternehmensprofil/unternehmensprofil_neu.html',
  agents:'https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Struktur-und-Organisation/Traeger',
  drvProcedure:'https://www.deutsche-rentenversicherung.de/DRV/DE/Reha/Medizinische-Reha/Allgemeine-med-Reha/allgemeine-med-reha.html',
  kv:'https://www.kbv.de/praxis/verordnungen/rehabilitation',
  gkv:'https://www.kbv.de/praxis/verordnungen/rehabilitation',
  westfalen6:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/Formularpakete/01_versicherte/reha/_DRV_Paket_Rehabilitation_Med_Rehabilitation.html',
  sgbi9:'https://www.gesetze-im-internet.de/sgb_9_2018/__14.html'
 });
 const empty={status:'',type:'medical',carrier:'',insurer:'unknown',insurerName:''};
 const allowed={status:['','employed','seeking','oldage','partialpension','partialoldage','other'],type:['medical','psychosomatic','work','aftercare','oncology'],carrier:['','westfalen','bund','rheinland','kbs','other'],insurer:['statutory','private','unknown']};
 const getPersonal=()=>{const p=SEC.profileGet()?.personal;return p&&typeof p==='object'&&!Array.isArray(p)?p:{}};
 const getPrefs=()=>{const p=SEC.profileGet()?.rehaNavigator309;if(!p||p.version!==1)return {...empty};return Object.fromEntries(Object.entries(empty).map(([k,defaultValue])=>[k,allowed[k]?allowed[k].includes(p[k])?p[k]:defaultValue:k==='insurerName'?String(p.insurerName||'').slice(0,100):defaultValue]));};
 const norm=x=>String(x||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').trim().toLowerCase();
 const localHint=p=>{
  const city=norm(p.city),plz=String(p.postalCode||'').replace(/\s/g,'');
  // Only tightly scoped, vetted Westphalian localities. For all other addresses
  // display a noncommittal notice rather than guessing an insurer from postal area.
  const west=['meinerzhagen','kierspe','ludenscheid','iserlohn','hemer','menden','altena','balve','plettenberg','werdohl','neuenrade','halver','schalksmuhle','nachrodt-wiblingwerde','sundern','hagen','schwerte','dortmund','arnsberg','meschede','olpe','siegen','soest','unna','hamm','bochum'];
  if(west.some(x=>city===x)||['58540','58566'].includes(plz))return {region:'Deutsche Rentenversicherung Westfalen',slug:'westfalen',proven:'Regionale Orientierung: DRV Westfalen (Regierungsbezirk Arnsberg), keine bestätigte Trägerzuordnung'};
  return {region:'',slug:'',proven:plz||city?'Aus der vorhandenen Anschrift ist hier keine verlässliche regionale Zuordnung möglich.':'Wohnort fehlt im persönlichen Profil.'};
 };
 const panel=el('section','suite-subpanel');panel.id='reha309';panel.setAttribute('aria-labelledby','reha309-title');
 panel.innerHTML=`<p class="section-kicker">REHA · PERSÖNLICHER ANTRAGSWEG</p><h3 id="reha309-title">Reha-Antrag: Wer ist zuständig?</h3>
 <p>Der Assistent verwendet deinen <strong>lokal gespeicherten Wohnort</strong> aus „Persönliche Daten“ und deine hier gewählte Lebenssituation. Den endgültig zuständigen DRV-Träger kann nur der aktuelle Rentenversicherungsbescheid beziehungsweise die DRV bestätigen.</p>
 <p class="r309-where" id="r309-address" role="status"></p>
 <form id="r309-form" autocomplete="off"><div class="r309-grid">
 <label>Meine Situation<select name="status" required><option value="">Bitte auswählen</option><option value="employed">Arbeitnehmer/in – erwerbstätig</option><option value="seeking">Arbeitsuchend / noch erwerbsfähig</option><option value="oldage">Altersrentner/in</option><option value="partialpension">Erwerbsminderungsrente</option><option value="partialoldage">Teil-Altersrente / Rentenantrag geplant</option><option value="other">Sonstige / unklar</option></select></label>
 <label>Welche Reha?<select name="type"><option value="medical">Medizinische Reha (z. B. Lunge/Asthma)</option><option value="psychosomatic">Psychosomatische Reha</option><option value="work">Berufliche Reha / Teilhabe am Arbeitsleben</option><option value="aftercare">Anschlussrehabilitation nach Krankenhaus</option><option value="oncology">Onkologische Reha (Sonderfall)</option></select></label>
 <label>Rentenversicherungsträger laut <strong>aktuellem DRV-Schreiben</strong><select name="carrier"><option value="">Noch nicht bekannt</option><option value="westfalen">DRV Westfalen</option><option value="bund">DRV Bund</option><option value="rheinland">DRV Rheinland</option><option value="kbs">DRV Knappschaft-Bahn-See</option><option value="other">Anderer DRV-Träger</option></select></label>
 <label>Krankenversicherung<select name="insurer"><option value="unknown">Bitte auswählen / nicht sicher</option><option value="statutory">Gesetzlich versichert</option><option value="private">Privat versichert</option></select></label>
 <label class="r309-span">Meine Krankenkasse (optional)<input type="text" name="insurerName" maxlength="100" placeholder="Nur eintragen, wenn bekannt"></label>
 </div><div class="r309-actions"><button type="button" id="r309-save" class="btn btn-primary">Auswahl verschlüsselt speichern</button><button type="button" id="r309-profile" class="btn btn-outline">Anschrift im Profil prüfen</button><button type="button" id="r309-recheck" class="btn btn-outline">Zuständigkeit neu prüfen</button></div>
 <p role="status" id="r309-status" class="input-note"></p></form>
 <div id="r309-result" class="r309-result" aria-live="polite"></div>
 <details class="r309-sources"><summary>Amtliche Quellen &amp; Sonderfälle</summary><div id="r309-links"></div><p>DRV und Krankenkassen prüfen die versicherungsrechtlichen und medizinischen Voraussetzungen. Bei einem Arbeitsunfall oder einer Berufskrankheit kann die Unfallversicherung zuständig sein. Bei einer Anschlussrehabilitation hilft der Sozialdienst des Krankenhauses. Rehabilitationssport (Muster 56) ist kein medizinischer Reha-Antrag.</p></details>`;
 const anchor=root.querySelector('.application-note')||root.querySelector('.application-tools');if(anchor)anchor.insertAdjacentElement('afterend',panel);else root.prepend(panel);
 const css=el('style');css.id='r309-styles';css.textContent=`
 #reha309{padding:16px;border:1px solid #b6d6e4;border-radius:15px;background:#f7fbfe;margin:16px 0;color:#183e50}
 #reha309 *{box-sizing:border-box}
 #reha309 h3{font-size:1.25rem;color:#153f54;margin:5px 0 8px}
 #reha309 p{line-height:1.5;font-size:.9rem}
 #reha309 .r309-where{border:1px solid #cadee6;background:#eaf4f9;padding:10px 12px;border-radius:11px;font-size:.88rem}
 #reha309 .r309-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:14px 0}
 #reha309 label{font-weight:650;display:block;font-size:.88rem;color:#33566b;line-height:1.4}
 #reha309 select,#reha309 input{font-size:16px;display:block;width:100%;min-width:0;padding:12px 9px;border:1px solid #b5ccd8;border-radius:10px;margin-top:6px;color:#163d50;background:white}
 #reha309 .r309-span{grid-column:1/-1}
 #reha309 .r309-actions{display:flex;flex-wrap:wrap;gap:8px}
 #reha309 .r309-actions button{font-size:.87rem;white-space:normal}
 #reha309 .r309-result{padding:12px;border:1px solid #cbdfe8;border-radius:12px;background:#fff;margin:12px 0}
 #reha309 .r309-result h4{margin:3px 0 8px;color:#174359}
 #reha309 .r309-result ul{line-height:1.55;padding-left:21px;font-size:.87rem}
 #reha309 .r309-alert{border-left:4px solid #be8430;background:#fff7e7;padding:10px;border-radius:8px;margin:10px 0;color:#765216}
 #reha309 .r309-actions-links{display:flex;flex-wrap:wrap;gap:8px;margin:11px 0}
 #reha309 .r309-actions-links a{padding:9px 11px;border:1px solid #a8cddc;background:#eef8fc;border-radius:9px;color:#0f5372;font-size:.86rem;text-decoration:none;font-weight:700}
 #reha309 .r309-sources{margin-top:14px;padding:10px;border:1px solid #d3e4eb;border-radius:10px}
 #reha309 .r309-sources summary{cursor:pointer;font-weight:700}
 #reha309 .r309-sources a{color:#0b587a;display:block;padding:5px 0;font-size:.85rem;overflow-wrap:anywhere}
 @media(max-width:680px){#reha309{padding:12px}#reha309 .r309-grid{grid-template-columns:1fr}#reha309 .r309-span{grid-column:auto}}
 `;document.head.append(css);
 const form=$('r309-form');for(const [key,val] of Object.entries(getPrefs())){const f=form.elements.namedItem(key);if(f)f.value=val;}
 function link(container,name,href){const a=el('a',null,name+' ↗');a.href=href;a.target='_blank';a.rel='noopener noreferrer';container.append(a);return a}
 for(const [name,u] of [['DRV: Reha-Antrag & Verfahren',URLS.reha],['DRV: G0100 – Online- oder PDF-Antrag',URLS.eantrag],['DRV: G0110 – medizinische Reha-Anlage',URLS.g0110],['DRV: G0130 – berufliche Reha-Anlage',URLS.g0130],['DRV: medizinische Reha (Westfalen-Besonderheit)',URLS.drvProcedure],['DRV Westfalen: Gebiet Arnsberg/Detmold/Münster',URLS.westfalen],['DRV Westfalen: Zusatzformular 6-100 im medizinischen Reha-Paket',URLS.westfalen6],['DRV: zuständigen Träger aus Schreiben bestimmen',URLS.agents],['KBV: ärztliches Muster 61',URLS.kv],['GKV: medizinische Reha',URLS.gkv],['§ 14 SGB IX: Klärung der Zuständigkeit',URLS.sgbi9]])link($('r309-links'),name,u);
 const getChoice=()=>({status:form.elements.namedItem('status').value,type:form.elements.namedItem('type').value,carrier:form.elements.namedItem('carrier').value,insurer:form.elements.namedItem('insurer').value,insurerName:form.elements.namedItem('insurerName').value.trim().slice(0,100)});
 const listNames={westfalen:'DRV Westfalen',bund:'DRV Bund',rheinland:'DRV Rheinland',kbs:'DRV Knappschaft-Bahn-See',other:'der im aktuellen Schreiben genannten DRV'};
 function determine(p,choice){
  const region=localHint(p),medical=choice.type!=='work',normal=choice.type==='medical'||choice.type==='psychosomatic';
  const retirement=choice.status==='oldage',working=choice.status==='employed'||choice.status==='seeking';
  const note=[],forms=[],main=[],references=[];
  if(!choice.status){main.push('Bitte zuerst deine berufliche bzw. Rentensituation auswählen. Die Anschrift allein bestimmt den Kostenträger nicht.');}
  else if(choice.type==='work'){
   main.push('Berufliche Rehabilitation / Teilhabe am Arbeitsleben: Für versicherte Beschäftigte kann die DRV zuständig sein; die Agentur für Arbeit ist ebenfalls ein möglicher Träger. Zuständigkeit und Anspruch müssen individuell geprüft werden.');
   forms.push(['DRV-Formular G0100 (Grund-Antrag)',URLS.g0100],['DRV-Formular G0130 (berufliche Anlage)',URLS.g0130],['Formularpaket berufliche Reha',URLS.work]);
   if(retirement)note.push('Bei Altersrente ist berufliche Wiedereingliederung nicht der übliche Weg. Individuelle Beratung einholen.');
  }else if(working){
   main.push('Bei einer medizinischen oder psychosomatischen Reha zur Erhaltung/Wiederherstellung der Erwerbsfähigkeit kommt grundsätzlich die Deutsche Rentenversicherung als Kostenträger in Betracht. Versicherungszeiten und medizinische Voraussetzungen werden geprüft.');
   forms.push(['G0100 online ausfüllen',URLS.eantrag],['G0100 – Grundantrag',URLS.g0100],['G0110 – medizinische Anlage',URLS.g0110],['Offizielles medizinisches Formularpaket',URLS.med]);
  }else if(retirement){
   if(choice.type==='oncology'){
    main.push('Bei onkologischer Rehabilitation ist auch für Altersrentner eine Leistung der Rentenversicherung möglich. DRV und Krankenkasse können abhängig vom Einzelfall infrage kommen; Zuständigkeit zunächst klären.');
    forms.push(['DRV G0100 – Antrag und Online-Einstieg',URLS.g0100],['DRV medizinisches Formularpaket mit trägerspezifischen Anlagen',URLS.med],['KBV: Muster 61 / Zuständigkeitsklärung',URLS.kv]);
   }else if(choice.insurer==='statutory'){
    main.push('Bei regulärer medizinischer Rehabilitation im Altersruhestand ist in der Regel die gesetzliche Krankenkasse zuständig. Die behandelnde Arztpraxis verordnet die Reha über Muster 61. Bei einer Altersrente unter zwei Dritteln der Vollrente können andere Regeln gelten.');
    forms.push(['KBV: Muster 61 – über die Arztpraxis',URLS.kv]);
   }else if(choice.insurer==='private'){
    main.push('Bei privater Krankenversicherung ist die Krankenkasse kein gesetzlicher Reha-Träger. Ob und in welchem Umfang eine Rehabilitation bezahlt wird, richtet sich insbesondere nach den Vertragsbedingungen; bitte bei der privaten Krankenversicherung und gegebenenfalls Beihilfestelle erkundigen.');
    forms.push(['DRV: mögliche Sonderfälle / allgemeine Reha-Beratung',URLS.reha]);
   }else{
    main.push('Bei Altersrente ist für eine nicht-onkologische medizinische Reha oft die gesetzliche Krankenkasse zuständig. Zuerst den Krankenversicherungsstatus klären; bei Privatversicherung unterscheiden sich die Ansprüche.');
    forms.push(['KBV: Muster 61 bei GKV',URLS.kv],['DRV: Reha und Rentenstatus klären',URLS.reha]);
   }
  }else if(choice.status==='partialpension'){
   main.push('Bei Bezug einer Erwerbsminderungsrente kann die DRV für medizinische Reha zuständig sein, wenn die Erwerbsfähigkeit durch die Reha verbessert oder erhalten werden kann. Die genaue individuelle Anspruchslage wird geprüft.');
   forms.push(['G0100 – Rehabilitationsantrag',URLS.g0100],['G0110 – medizinische Anlage',URLS.g0110],['DRV: medizinisches Formularpaket',URLS.med]);
  }else{
   main.push('Bei Teil-Altersrente, geplanter Altersrente oder ungeklärtem Status lässt sich der Kostenträger nicht allein aus Rentenstatus und Wohnort festlegen. Krankenkasse und DRV beraten; die Praxis kann Muster 61 Teil A zur Zuständigkeitsprüfung nutzen.');
   forms.push(['DRV: Reha-Antragstellung / Rentenstatus klären',URLS.reha],['KBV: Muster 61 Teil A zur Zuständigkeitsklärung',URLS.kv]);
  }
  if(choice.type==='aftercare')note.push('Anschlussrehabilitation nach einer Krankenhausbehandlung: bitte den Sozialdienst der Klinik einbeziehen; es gelten besondere Wege und Fristen.');
  if(choice.type==='oncology')note.push('Onkologische Rehabilitation hat Sonderregelungen; vor der Wahl des Formularpakets bei der DRV beraten lassen.');
  if(choice.type==='psychosomatic'&&(working||choice.status==='partialpension'))note.push('Auch psychosomatische Rehabilitation fällt regelmäßig unter den Antrag G0100 + G0110, wenn die DRV zuständig ist.');
  if(choice.insurer==='private'&&working)note.push('Private Krankenversicherung ändert nicht automatisch die mögliche DRV-Zuständigkeit bei Beschäftigten.');
  let carrierInfo='';
  if(choice.carrier){carrierInfo='Du hast '+listNames[choice.carrier]+' als Träger laut aktuellem Schreiben ausgewählt. Das ist aussagekräftiger als die Wohnadresse.';
   if(choice.carrier==='westfalen'&&medical){note.push('Bei DRV Westfalen wird bei einer allgemeinen medizinischen Reha grundsätzlich ein Gutachten veranlasst; es gibt Ausnahmen. Das trägerspezifische Blatt 6-100 im offiziellen medizinischen Formularpaket beachten.');forms.push(['DRV Westfalen – Zusatzblatt 6-100 (Formularpaket)',URLS.westfalen6]);}
   if(choice.carrier==='bund'&&medical)note.push('Bei DRV Bund besteht bei einer allgemeinen medizinischen Reha grundsätzlich die Wahl zwischen ärztlichem Befundbericht und Gutachten.');
   if(region.slug==='westfalen'&&choice.carrier!=='westfalen')note.push('Dein regionaler Wohnorthinweis lautet Westfalen. Der im aktuellen DRV-Schreiben genannte Träger hat jedoch Vorrang vor dieser regionalen Näherung.');
  }else if(region.slug==='westfalen'){
   carrierInfo='Anhand des Wohnorts kommt regional DRV Westfalen in Betracht (Regierungsbezirk Arnsberg). Das ist KEINE bestätigte persönliche DRV-Zuordnung. Prüfe den Briefkopf deiner neuesten Renteninformation.';
   if(medical)note.push('Falls DRV Westfalen dein zuständiger Träger ist, wird bei allgemeiner medizinischer Reha grundsätzlich ein Gutachten erstellt (Ausnahmen möglich). Im DRV-Formularpaket Westfalen das Zusatzblatt 6-100 beachten.');
  }else carrierInfo='Der zuständige DRV-Träger ist nicht bekannt. Er lässt sich nicht sicher aus der Anschrift allein bestimmen. Bitte die aktuelle Renteninformation / das letzte DRV-Schreiben prüfen.';
  if(normal&&choice.status==='oldage'&&choice.insurerName)note.push('Als Krankenkasse hast du „'+choice.insurerName+'“ eingetragen. Die App versendet an diese Kasse keine Daten.');
  references.push(['Aktuellen DRV-Träger herausfinden',URLS.agents]);
  return {main,note,forms,carrierInfo,region,references};
 }
 function render(){const p=getPersonal(),pick=getChoice(),hint=localHint(p),r=determine(p,pick),where=$('r309-address'),dest=$('r309-result');
  const postcode=String(p.postalCode||'').trim(),city=String(p.city||'').trim(),street=String(p.street||'').trim();
  where.replaceChildren();where.append(el('strong',null,'Profil-Wohnort: '));
  where.append(document.createTextNode([postcode,city].filter(Boolean).join(' ')||'Nicht gespeichert'));
  const personalDOB=/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate||'')?new Date(p.birthDate+'T12:00:00'):null;
  const age=personalDOB&&!Number.isNaN(+personalDOB)?(()=>{const d=new Date();return d.getFullYear()-personalDOB.getFullYear()-(d.getMonth()<personalDOB.getMonth()||(d.getMonth()===personalDOB.getMonth()&&d.getDate()<personalDOB.getDate())?1:0)})():null;
  const pr=SEC.profileGet(),gdb=Number(pr.gdb),equal=pr.equal===true||pr.arbeitgeberCheck31?.answers?.eq==='yes';
  const small=el('span',null,' · '+(street?'Straße ist im Profil vorhanden.':'Straße nicht hinterlegt.')+' '+hint.proven+(age!==null?' · Alter laut Geburtsdatum: '+age+' Jahre (keine automatische Renteneinstufung)':'')+(Number.isFinite(gdb)&&gdb>=20&&gdb<=100?' · GdB '+gdb:'')+(equal?' · Gleichstellung im Profil angegeben':'')+'.');where.append(small);
  dest.replaceChildren();dest.append(el('h4',null,pick.status?'Persönliche Reha-Orientierung':'Erst Situation auswählen'));
  r.main.forEach(s=>dest.append(el('p',null,s)));
  const carrier=el('p',null,r.carrierInfo);carrier.style.fontWeight='650';dest.append(carrier);
  if(r.note.length){const alert=el('div','r309-alert');alert.append(el('strong',null,'Bitte beachten'));const ul=el('ul');r.note.forEach(s=>ul.append(el('li',null,s)));alert.append(ul);dest.append(alert)}
  if(r.forms.length){dest.append(el('h4',null,'Passende offizielle Antragswege / Formulare'));const actions=el('div','r309-actions-links');r.forms.forEach(([s,u])=>link(actions,s,u));dest.append(actions)}
  dest.append(el('p',null,'Diese Vorprüfung ist unverbindlich und verwendet keine Versicherungsnummer. Ein festgestellter GdB oder eine Gleichstellung allein entscheiden nicht über den Reha-Kostenträger. Bei einem unzuständigen angegangenen Reha-Träger erfolgt die Zuständigkeitsprüfung und gegebenenfalls Weiterleitung nach § 14 SGB IX.')); 
 }
 form.addEventListener('change',render);form.addEventListener('input',e=>{if(e.target.name==='insurerName')render()});
 $('r309-save').addEventListener('click',async()=>{const v=getChoice(),msg=$('r309-status');msg.textContent='Auswahl wird im privaten Tresor gespeichert …';try{await SEC.updateProfile({rehaNavigator309:{version:1,...v,updatedAt:new Date().toISOString()}});msg.textContent='Auswahl lokal verschlüsselt gespeichert. Die Anschrift wird immer aus deinem aktuellen persönlichen Profil gelesen.';}catch(e){msg.textContent='Speichern fehlgeschlagen: '+(e.message||e)}});
 $('r309-profile').addEventListener('click',()=>{window.ASTHMA_NAV?.go('profil');requestAnimationFrame(()=>document.getElementById('a27-profile')?.scrollIntoView({block:'start',behavior:'smooth'}))});
 $('r309-recheck').addEventListener('click',()=>{render();$('r309-status').textContent='Neu anhand der aktuellen persönlichen Profiladresse bewertet.';});
 window.addEventListener('asthma:personal-profile-updated',render);
 window.addEventListener('asthma:secure-change',event=>{if(event.detail?.group==='profile')render()});
 render();
 window.ASTHMA_REHA309={determine,localHint,recheck:render,getProfileLocation:()=>{const p=getPersonal();return {postalCode:p.postalCode||'',city:p.city||''}}};
})();



/* Asthma 3.1.0 – private, locally guided help for applications.
 * No patient or user data embedded; no API keys, network transfers or automatic submission.
 * An assisted text is NOT a completed official application form or medical certificate. */
(()=>{
 'use strict';
 const SEC=window.ASTHMA_SECURITY, $=id=>document.getElementById(id), root=$('antraege');
 if(!root||!SEC?.state?.().unlocked||$('a310-guide'))return;
 const catalog=(Array.isArray(window.ASTHMA_APPLICATIONS)?window.ASTHMA_APPLICATIONS:[]).filter(x=>x?.id&&x?.title);
 const extra=[
  {id:'reha-med',title:'Medizinische Reha (Lunge / Asthma)',cat:'Reha',who:'DRV oder Krankenkasse – individuell klären',kind:'portal',need:'Ärztliche Befunde; bei DRV in der Regel G0100, G0110 und ggf. weitere Anlagen',url:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/Formularpakete/01_versicherte/reha/_DRV_Paket_Rehabilitation_Med_Rehabilitation.html',context:'Der Versicherungsträger ist nicht automatisch anhand der Postleitzahl bestimmbar.'},
  {id:'reha-psy',title:'Psychosomatische Reha',cat:'Reha',who:'DRV oder Krankenkasse – individuell klären',kind:'portal',need:'Ärztliche/psychotherapeutische Befunde; bei DRV in der Regel G0100 und G0110',url:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/Formularpakete/01_versicherte/reha/_DRV_Paket_Rehabilitation_Med_Rehabilitation.html'},
  {id:'reha-work',title:'Berufliche Rehabilitation / Teilhabe am Arbeitsleben',cat:'Reha',who:'DRV, Agentur für Arbeit oder anderer Träger',kind:'portal',need:'Berufliche Belastungen, ärztliche Befunde; bei DRV in der Regel G0100 und G0130',url:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/Formularpakete/01_versicherte/reha/_DRV_Paket_Rehabilitation_Leistungen_zur_Teilhabe.html'},
  {id:'reha-after',title:'Anschlussrehabilitation nach Krankenhaus',cat:'Reha',who:'Kliniksozialdienst und zuständiger Kostenträger',kind:'portal',need:'Krankenhausbefunde und Empfehlung des Kliniksozialdienstes',url:'https://www.deutsche-rentenversicherung.de/DRV/DE/Reha/Medizinische-Reha/Allgemeine-med-Reha/allgemeine-med-reha.html'}
 ];
 const all=[...extra,...catalog],map=new Map(all.map(x=>[x.id,x]));
 const node=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e};
 const url=u=>{try{const z=new URL(u);return z.protocol==='https:'?z.href:null}catch{return null}};
 const today=()=>new Date().toLocaleDateString('de-DE');
 const defaultDraft=()=>({topic:'reha-med',status:'',issue:'',limitations:'',goal:'',clinic:'',doctor:'',notes:'',hasDocs:false,includeGdb:false,includeAddress:true});
 const clean=x=>String(x??'').trim();
 const readProfile=()=>SEC.profileGet?.()||{};
 const stored=readProfile().appGuide310;
 const initial=(stored&&stored.version===1&&stored.current&&map.has(stored.current.topic))?{...defaultDraft(),...stored.current}:defaultDraft();
 // Never use a stored profile address in bundled static code or in prompts for external services.
 let answers=initial,step=0;
 const panel=node('section','suite-subpanel');panel.id='a310-guide';
 panel.innerHTML=`<div class="a310-heading"><div><p class="section-kicker">AUSFÜLLHILFE · AUF DEINEM GERÄT</p><h3>Schritt für Schritt zum Antrag</h3><p>Persönliche Erklärungen, hilfreiche Fragen und vorbereitete Begleitschreiben für Reha und weitere Leistungen.</p></div><span class="a310-private">Lokal &amp; verschlüsselt</span></div>
 <div class="a310-toolbar"><button class="btn btn-outline" type="button" id="a310-reset">Neuen Entwurf beginnen</button><button class="btn btn-outline" type="button" id="a310-save">Entwurf sicher speichern</button></div>
 <p class="a310-status" id="a310-status" role="status" aria-live="polite"></p>
 <p class="a310-progress" id="a310-progress"></p><div id="a310-questions" class="a310-questions"></div>
 <div class="a310-navigation"><button class="btn btn-outline" type="button" id="a310-back">Zurück</button><button class="btn btn-primary" type="button" id="a310-next">Weiter</button></div>
 <details class="a310-ai"><summary>Persönliche Rückfragen mit ChatGPT besprechen (optional)</summary>
 <p>Der Assistent oben funktioniert ohne KI-Anbindung. Für eine echte Unterhaltung öffnest du ChatGPT separat. <strong>Nichts wird aus dieser App automatisch an ChatGPT gesendet.</strong> Der Vorschlag enthält standardmäßig keine Namen, Anschriften, Gesundheitswerte oder Versicherungsnummern.</p>
 <div class="a310-toolbar"><button type="button" class="btn btn-outline" id="a310-copy-ai">Datensparsame Frage kopieren</button><a class="btn btn-outline" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT öffnen ↗</a></div>
 <p id="a310-ai-status" class="input-note" role="status"></p></details>
 <p class="a310-note">Die Ausfüllhilfe ersetzt keine verbindliche Beratung, keine ärztliche Stellungnahme und keine amtlichen DRV-/Krankenkassenformulare. Anträge werden nicht automatisch verschickt. Vor dem Versenden Angaben und Fristen prüfen.</p>`;
 const anchor=$('reha309')||root.querySelector('.application-tools');
 if(anchor)anchor.insertAdjacentElement('afterend',panel);else root.prepend(panel);
 const style=node('style');style.id='a310-style';style.textContent=`
 #a310-guide{margin:17px 0;padding:16px;border:1px solid #b6d6e3;background:#f6fbfd;color:#163f53;border-radius:15px}
 #a310-guide *{box-sizing:border-box}#a310-guide .a310-heading{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between}
 #a310-guide h3{font-size:1.24rem;margin:5px 0 7px;color:#103f55}#a310-guide h4{font-size:1rem;margin:4px 0 12px}
 #a310-guide p,#a310-guide label{font-size:.9rem;line-height:1.5}#a310-guide .a310-heading p{max-width:590px}
 #a310-guide .a310-private{font-size:.78rem;border-radius:20px;padding:6px 11px;border:1px solid #b5d5cc;color:#165a49;background:#e5f5ef;align-self:flex-start}
 #a310-guide .a310-toolbar,#a310-guide .a310-navigation{display:flex;flex-wrap:wrap;gap:9px;margin:13px 0;align-items:center}
 #a310-guide .a310-status{min-height:1em;color:#225875;font-weight:650}
 #a310-guide .a310-progress{font-size:.83rem;color:#4d7587;font-weight:700;margin:8px 0}
 #a310-guide .a310-questions{background:white;padding:13px;border:1px solid #cfdee5;border-radius:12px}
 #a310-guide .a310-field{display:block;font-weight:650;color:#35566a;margin:10px 0}
 #a310-guide textarea,#a310-guide input[type=text],#a310-guide select{display:block;width:100%;min-width:0;font-size:16px;padding:10px;border-radius:9px;border:1px solid #bfd3df;background:white;color:#193d51;margin:6px 0 2px}
 #a310-guide textarea{resize:vertical;min-height:76px}
 #a310-guide .a310-hint{font-size:.84rem;color:#536e7d;margin:5px 0 12px}
 #a310-guide .a310-check{display:flex;gap:9px;align-items:flex-start;margin:11px 0;color:#2b5266}
 #a310-guide .a310-check input{margin-top:5px;flex-shrink:0}
 #a310-guide .a310-preview{white-space:pre-wrap;overflow-wrap:anywhere;max-height:450px;overflow:auto;border:1px solid #ccdce5;border-radius:10px;padding:12px;background:#fafdff;font:normal .86rem/1.54 system-ui}
 #a310-guide .a310-links{display:flex;gap:7px;flex-wrap:wrap;margin:14px 0}#a310-guide .a310-links a{overflow-wrap:anywhere;white-space:normal;font-size:.81rem}
 #a310-guide .a310-note{font-size:.78rem;color:#5b7481;margin:13px 0 0}
 #a310-guide .a310-ai{border-top:1px solid #c8dde7;margin:17px 0 0;padding:12px 0 0}#a310-guide summary{font-weight:750;color:#17566f;cursor:pointer}
 #a310-guide .a310-footnote{font-size:.82rem;color:#5a7280}
 @media(max-width:420px){#a310-guide{padding:11px}#a310-guide .a310-toolbar button,#a310-guide .a310-navigation button{font-size:.87rem}}
 `;document.head.append(style);
 const body=$('a310-questions'),progress=$('a310-progress'),next=$('a310-next'),back=$('a310-back'),msg=$('a310-status');
 function line(txt){body.append(node('p','a310-hint',txt))}
 function h(txt){body.append(node('h4',null,txt))}
 function field(label,key,placeholder,rows=3){const l=node('label','a310-field',label),t=node('textarea');t.rows=rows;t.maxLength=rows===2?320:1300;t.placeholder=placeholder||'';t.value=answers[key]||'';t.dataset.answer=key;l.append(t);body.append(l);return t}
 function choose(label,key,options){const l=node('label','a310-field',label),t=node('select');t.dataset.answer=key;for(const [v,txt] of options)t.add(new Option(txt,v));t.value=answers[key]||'';l.append(t);body.append(l);return t}
 function checkbox(label,key){const l=node('label','a310-check'),t=node('input');t.type='checkbox';t.dataset.answer=key;t.checked=!!answers[key];l.append(t,node('span',null,label));body.append(l);return t}
 function addLink(box,name,link){const u=url(link);if(!u)return;const a=node('a','btn btn-outline',name+' ↗');a.href=u;a.target='_blank';a.rel='noopener noreferrer';box.append(a)}
 function topic(){return map.get(answers.topic)||extra[0]}
 function isReha(){return topic().cat==='Reha'}
 function address(){const d=readProfile().personal||{};return [clean(d.street),[clean(d.postalCode),clean(d.city)].filter(Boolean).join(' ')].filter(Boolean).join('\n')}
 function formStatus(){const s=answers.status||readProfile().rehaNavigator309?.status||'';return ({employed:'Arbeitnehmer/in',seeking:'Arbeitsuchend',oldage:'Altersrente',partialpension:'Erwerbsminderungsrente',partialoldage:'Teil-Altersrente',other:'Sonstige / unklar'})[s]||'Nicht angegeben'}
 function officialLinks(){const t=topic();const links=[];if(isReha()){
  if(t.id==='reha-work')links.push(['DRV – Berufliche Rehabilitation (G0100/G0130)',extra[2].url]);
  else links.push(['DRV – Medizinische Rehabilitation (G0100/G0110)',extra[0].url]);
  links.push(['Krankenkasse / Muster 61 – ärztlicher Antragsweg','https://www.kbv.de/praxis/verordnungen/rehabilitation']);
  if(readProfile().rehaNavigator309?.carrier==='westfalen')links.push(['DRV Westfalen – Anlagen im Formularpaket',extra[0].url]);
 }else links.push(['Offizieller Leistungsweg',t.url]);return links}
 function draft(){const p=readProfile(),d=p.personal||{},t=topic(),is=isReha(),where=answers.includeAddress?address():'';
  const name=answers.includeAddress?(clean(d.fullName)||'[Vor- und Nachname]'):'[Name selbst ergänzen]';
  const rec=is?'[zuständigen Reha-Träger anhand des aktuellen Versicherungsverhältnisses eintragen]':clean(t.who)||'[zuständige Stelle prüfen]';
  const parts=[name,where,'',rec,'','Datum: '+today(),'','Betreff: '+(is?'Begleitschreiben – Prüfung und Antragstellung: ':'Anfrage / Antrag: ')+t.title,'','Sehr geehrte Damen und Herren,',''];
  if(is){parts.push('Ich möchte eine '+t.title+' beantragen und bitte um Prüfung der Zuständigkeit und der Anspruchsvoraussetzungen. Mir ist bekannt, dass hierfür je nach Kostenträger amtliche Formulare und ärztliche Unterlagen notwendig sein können.');parts.push('Aktuelle Situation: '+formStatus()+'.');}
  else if(t.id==='widerspruch'){parts.push('Ich möchte gegen einen ablehnenden Bescheid vorgehen. Bitte berücksichtigen Sie die Frist und Rechtsbehelfsbelehrung des konkreten Bescheids. Ein fristwahrender Widerspruch sollte gesondert rechtzeitig eingereicht werden.');}
  else parts.push('Hiermit bitte ich um Prüfung meines Bedarfs und der Möglichkeit einer Leistung: '+t.title+'.');
  if(clean(answers.issue))parts.push('','Mein Anliegen / Anlass:',clean(answers.issue));
  if(clean(answers.limitations))parts.push('','Tatsächliche Einschränkungen im Alltag oder Beruf:',clean(answers.limitations));
  if(clean(answers.goal))parts.push('','Ziel / erbetene Unterstützung:',clean(answers.goal));
  if(clean(answers.clinic)&&is)parts.push('','Wunschklinik bzw. Wunschort (Prüfung der Eignung und Verfügbarkeit vorbehalten):',clean(answers.clinic));
  if(clean(answers.doctor))parts.push('','Behandelnde Stelle (freiwillige Angabe):',clean(answers.doctor));
  if(answers.includeGdb){const n=Number(p.gdb),equal=p.equal===true||p.arbeitgeberCheck31?.answers?.eq==='yes';if(Number.isFinite(n)&&n>=20&&n<=100)parts.push('','Behinderungsstatus laut eigenem Profil: GdB '+n+(equal?'; Gleichstellung als bewilligt hinterlegt.':'.'));}
  if(answers.hasDocs)parts.push('','Vorhandene ärztliche Unterlagen / Nachweise werde ich entsprechend den Vorgaben des Kostenträgers beifügen.');
  if(clean(answers.notes))parts.push('','Zusätzliche Angaben:',clean(answers.notes));
  parts.push('','Bitte teilen Sie mir den zuständigen Leistungsträger sowie die notwendigen amtlichen Formulare und Unterlagen mit. Ich bitte um eine schriftliche Bestätigung zum weiteren Verfahren.','','Mit freundlichen Grüßen',name,'','---','Entwurf aus meiner lokalen Ausfüllhilfe. Kein amtliches Antragsformular, keine ärztliche Bescheinigung, keine automatische Einreichung.');
  return parts.filter((v,i,a)=>!(v===''&&i>0&&a[i-1]==='')).join('\n');
 }
 function aiPrompt(){const t=topic(),needs=t.need||'ggf. ärztliche Befunde';return 'Hilf mir bitte, einen Antrag zum Thema „'+t.title+'“ Schritt für Schritt vorzubereiten. Erkläre mir in einfacher Sprache jede Frage, frage nach fehlenden Angaben einzeln und gib die offiziellen, aktuellen Antragswege und notwendigen Unterlagen mit Quellen an. Ich will keine personenbezogenen Daten oder Versicherungsnummern ungefragt übermitteln. Bereits bekannt: Zuständige Stelle laut Leistungskatalog: '+(t.who||'noch zu prüfen')+'. Erforderliche Unterlagen laut Katalog: '+needs+'. Bitte erfinde keine Diagnosen oder Angaben und kennzeichne Musterschreiben klar als solche.';}
 function rerender(){body.replaceChildren();progress.textContent='Schritt '+(step+1)+' von 4';back.disabled=step===0;next.textContent=step===3?'Zur Themenwahl':'Weiter';
  if(step===0){h('1. Wobei brauchst du Hilfe?');const categories=[...new Set(all.map(x=>x.cat))];const select=choose('Antrag oder Leistung', 'topic',all.map(x=>[x.id,x.title+' ('+x.cat+')']));
   line('Auswahl für alle '+catalog.length+' vorhandenen Leistungsthemen plus besondere Reha-Arten. Du kannst auch in der Leistungsliste „Ausfüllhilfe“ wählen.');
   line('Offizieller Weg: '+(topic().way||topic().who||'individuell klären'));line('Benötigte Unterlagen: '+(topic().need||'beim Träger nachfragen'));
   select.addEventListener('change',()=>{updateFields();rerender()});}
  else if(step===1){h('2. Persönliche Situation und Bedarf');const p=readProfile().personal||{};
   line('Name im verschlüsselten Profil: '+(clean(p.fullName)?'vorhanden':'noch nicht hinterlegt')+' · Anschrift: '+(address()?'vorhanden':'nicht gespeichert')+'. Daten werden erst in deinem lokal erzeugten Entwurf verwendet.');
   if(isReha())choose('Aktuelle Lebenssituation','status',[['','Bitte auswählen'],['employed','Arbeitnehmer/in'],['seeking','Arbeitsuchend'],['oldage','Altersrentner/in'],['partialpension','Erwerbsminderungsrente'],['partialoldage','Teil-Altersrente'],['other','Sonstige / unklar']]);
   field('Was möchtest du beantragen, und warum?','issue','Beschreibe in eigenen Worten den Anlass (nur bestätigte Angaben).');
   field('Welche konkreten Einschränkungen gibt es?','limitations','z. B. bei der Arbeit oder im Alltag; nur selbst beobachtete Beschwerden');
   checkbox('Vor- und Nachname sowie Anschrift aus „Persönliche Daten“ im Entwurf verwenden','includeAddress');
   checkbox('Meinen bestätigten GdB und eine ggf. hinterlegte Gleichstellung im Entwurf erwähnen','includeGdb');}
  else if(step===2){h('3. Ziele, Unterlagen und weitere Angaben');field('Was soll durch die beantragte Hilfe erreicht werden?','goal','z. B. Beschwerden reduzieren, Teilhabe erhalten, Arbeitsplatz anpassen');
   if(isReha())field('Wunschklinik oder Wunschregion (optional)','clinic','Nur wenn du selbst eine passende Einrichtung vorschlagen möchtest',2);
   field('Behandelnde Praxis / Arzt (optional)','doctor','Nur eintragen, wenn du das angeben möchtest',2);
   field('Sonstige Hinweise (optional)','notes','Nur belegbare, relevante Informationen',2);
   checkbox('Ich habe ärztliche Befunde oder andere Nachweise zur Einreichung','hasDocs');
   line('Unterlagen laut Leistungskatalog: '+(topic().need||'Bei der zuständigen Stelle erfragen.')+' Die ärztliche Bewertung muss durch die Praxis erfolgen.');
   if(isReha()){
    const guide=node('details');guide.open=true;guide.append(node('summary',null,'Was gehört in die DRV-Unterlagen?'));
    guide.append(node('p','a310-hint','G0100: Persönliche Angaben und Rentenversicherungsnummer aus deinem eigenen DRV-Schreiben, beantragte Leistung, Kontaktdaten, Versicherungs- und Beschäftigungsangaben entsprechend der aktuellen Formularfassung. Versicherungsnummer bitte nur im amtlichen Formular eintragen.'));
    guide.append(node('p','a310-hint',topic().id==='reha-work'?'G0130: Berufliche Einschränkungen, Tätigkeit und gewünschte Unterstützung wahrheitsgemäß angeben.':'G0110: Gesundheitliche Einschränkungen, relevante Behandlungen, Arbeits-/Alltagsbelastung und frühere Rehabilitation nur nach tatsächlicher persönlicher Situation angeben.'));
    guide.append(node('p','a310-hint','Ärztliche Angaben und Befundberichte stammen aus der Praxis. Ob besondere Anlagen erforderlich sind, hängt unter anderem von Reha-Art und zugeordnetem DRV-Träger ab. Die Formularpakete enthalten den aktuellen Stand.'));
    body.append(guide);
   }
  }
  else {h('4. Entwurf und nächste Schritte');line('Dieser Text ist ein Begleitschreiben. Offizielle Formulare (z. B. DRV G0100/G0110) musst du separat bei der zuständigen Stelle ausfüllen und einreichen.');
   const pre=node('div','a310-preview',draft());pre.id='a310-preview';body.append(pre);
   const tools=node('div','a310-toolbar');const copy=node('button','btn btn-primary','Entwurf kopieren');copy.type='button';copy.id='a310-copy-draft';const download=node('button','btn btn-outline','Als Textdatei sichern');download.type='button';download.id='a310-download';tools.append(copy,download);body.append(tools);
   copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(draft());msg.textContent='Entwurf kopiert. Vor dem Einreichen bitte alle Angaben prüfen.';}catch(e){msg.textContent='Kopieren nicht möglich. Bitte Text oben markieren und manuell kopieren.'}});
   download.addEventListener('click',()=>{const blob=new Blob([draft()],{type:'text/plain;charset=utf-8'}),ref=URL.createObjectURL(blob),a=node('a');a.href=ref;a.download='Asthma_Antragsentwurf_'+new Date().toISOString().slice(0,10)+'.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(ref),30000);msg.textContent='Textdatei erstellt – bitte in Dateien sichern.';});
   const links=node('div','a310-links');for(const [name,u] of officialLinks())addLink(links,name,u);body.append(links);
   line('Hinweis: Bei DRV ist die auf deinem letzten Versicherungs-/Rentenbrief genannte Trägerstelle maßgeblich. Ein Wohnort allein beweist keine Zuständigkeit.');
  }
 }
 function updateFields(){for(const e of body.querySelectorAll('[data-answer]')){const k=e.dataset.answer;answers[k]=e.type==='checkbox'?e.checked:e.value}}
 body.addEventListener('input',updateFields);body.addEventListener('change',updateFields);
 next.addEventListener('click',()=>{updateFields();if(step===3)step=0;else step++;msg.textContent='';rerender();});
 back.addEventListener('click',()=>{updateFields();if(step>0)step--;rerender()});
 $('a310-reset').addEventListener('click',()=>{answers=defaultDraft();step=0;msg.textContent='Neuer Entwurf begonnen. Dein zuvor gespeicherter Entwurf bleibt im verschlüsselten Profil, bis du erneut speicherst.';rerender()});
 $('a310-save').addEventListener('click',async()=>{updateFields();const b=$('a310-save');b.disabled=true;try{await SEC.updateProfile({appGuide310:{version:1,current:{...answers},updatedAt:new Date().toISOString()}});msg.textContent='Entwurf im verschlüsselten persönlichen Profil gespeichert.';}catch(e){msg.textContent='Speichern fehlgeschlagen: '+e.message}finally{b.disabled=false}});
 $('a310-copy-ai').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(aiPrompt());$('a310-ai-status').textContent='Neutrale Frage kopiert. ChatGPT öffnen und dort einfügen. Keine persönlichen Gesundheits- oder Adressdaten kopiert.'}catch{$('a310-ai-status').textContent='Bitte Frage selbst kopieren oder ChatGPT ohne Vorlage öffnen.'}});
 // Each original existing benefit item gets a contextual entry point even when its list is re-rendered by filtering.
 const list=$('apply-list');function hookCards(){if(!list)return;for(const card of list.querySelectorAll('.application-item[data-application]')){
  const id=card.dataset.application;if(!map.has(id)||card.querySelector('.a310-card-open'))continue;
  const toolbar=card.querySelector('.app-buttons');if(!toolbar)continue;
  const b=node('button','btn btn-outline a310-card-open','Ausfüllhilfe starten');b.type='button';b.addEventListener('click',()=>{answers={...answers,topic:id};step=0;rerender();panel.scrollIntoView({block:'start',behavior:'smooth'});});toolbar.append(b);
 }}
 if(list){hookCards();const obs=new MutationObserver(hookCards);obs.observe(list,{childList:true,subtree:true})}
 window.addEventListener('asthma:personal-profile-updated',()=>{if(step===1||step===3)rerender()});
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='profile'&&(step===1||step===3))rerender()});
 window.ASTHMA_GUIDE310={count:all.length,open(id){if(map.has(id)){answers.topic=id;step=0;rerender();panel.scrollIntoView({block:'start'})}},getDraft:draft,chatPrompt:aiPrompt};
 rerender();
})();


'use strict';
/* Asthma 3.0.6: purely presentational patient-facing lab explanations.
   Uses existing encrypted ASTHMA_SECURITY.list('labs'); never writes any medical record. */
(()=>{
  const S=window.ASTHMA_SECURITY;
  const host=document.getElementById('labp-list');
  if(!S||!host||window.ASTHMA_LAB_GUIDE_306)return;
  window.ASTHMA_LAB_GUIDE_306=true;
  const text=`
 eosAbs|Eosinophile Granulozyten sind weiße Abwehrzellen. Bei Typ-2- und allergischer Entzündung können sie beteiligt sein. Kortison und Biologika können die Zahl verändern.
 eosPct|Prozentualer Anteil der Eosinophilen unter den weißen Blutkörperchen. Er ersetzt nicht die absolute Zellzahl.
 igeTotal|Gesamt-IgE ist eine Klasse von Abwehr-Antikörpern. Ein erhöhter Wert beweist für sich allein keine bestimmte Allergie.
 igeSpecific|Antikörper gegen ein bestimmtes Allergen. Ein positiver Test zeigt eine Sensibilisierung, nicht zwangsläufig Beschwerden.
 ecp|Eiweiß, das von aktivierten Eosinophilen freigesetzt werden kann. Die Messung ist stark methodenabhängig.
 tryptase|Enzym aus Mastzellen. Wird unter anderem bei bestimmten schweren allergischen Reaktionen oder Mastzellerkrankungen untersucht.
 a1at|Alpha-1-Antitrypsin schützt unter anderem die Lunge vor bestimmten Enzymen. Ein Mangel kann Lungengewebe schädigen.
 a1atType|Genetisch beeinflusste Form von Alpha-1-Antitrypsin. Dies ist typischerweise ein Typbefund und kein reiner Zahlenwert.
 aspergillusIgE|IgE-Antikörper gegen den Schimmelpilz Aspergillus. Werden bei passenden allergologischen Lungenfragen untersucht.
 aspergillusIgG|IgG-Antikörper gegen Aspergillus. Nur zusammen mit Krankengeschichte und weiteren Untersuchungen einordnen.
 il5|Entzündungsbotenstoff, der eosinophile Zellen beeinflusst. Kein Standardwert zur Kontrolle von Asthma.
 il13|Botenstoff des Immunsystems, der an bestimmten Typ-2-Entzündungen beteiligt sein kann.
 feno|Stickstoffmonoxid in der Ausatemluft. Kann Hinweise auf eine bestimmte Atemwegsentzündung liefern; kein Bluttest.
 wbc|Gesamtzahl der weißen Blutkörperchen. Sie dienen der Infektabwehr und sind an Entzündungsreaktionen beteiligt.
 rbc|Anzahl der roten Blutkörperchen, die mithilfe von Hämoglobin Sauerstoff transportieren.
 hb|Hämoglobin ist der rote Blutfarbstoff. Er bindet und transportiert Sauerstoff.
 hbCalc|Hämoglobinwert, der im Rahmen der Blutgasanalyse bestimmt oder berechnet wird. Gerätemethode beachten.
 hct|Anteil der roten Blutkörperchen am gesamten Blutvolumen, meist in Prozent.
 hctRatio|Hämatokrit als Anteil in L/L: 0,47 L/L entspricht 47 Prozent roten Blutkörperchen.
 hctCalc|Aus der Blutgasanalyse abgeleiteter Hämatokritwert. Messmethode beachten.
 mcv|Durchschnittliche Größe der roten Blutkörperchen. Hilft bei der Einordnung von Blutarmut.
 mch|Durchschnittliche Hämoglobinmenge in einem roten Blutkörperchen.
 mchc|Durchschnittliche Hämoglobinkonzentration in den roten Blutkörperchen.
 rdwCV|Prozentuales Maß für Unterschiede in der Größe der roten Blutkörperchen.
 rdwSD|Absolute Streuung der Größe der roten Blutkörperchen in Femtolitern.
 platelets|Blutplättchen, die wichtig für Blutstillung und Blutgerinnung sind.
 mpv|Durchschnittliche Größe der Blutplättchen. Zusammen mit der Plättchenzahl interpretieren.
 retic|Junge rote Blutkörperchen; geben Hinweise auf die aktuelle Blutbildung.
 esr|Blutsenkung: unspezifischer Test, der bei manchen Entzündungen verändert sein kann.
 neutPct|Prozentanteil neutrophiler Granulozyten; sie dienen besonders der Abwehr von Bakterien.
 neutAbs|Absolute Anzahl neutrophiler Granulozyten im Blut.
 lymphPct|Prozentanteil der Lymphozyten unter den weißen Blutkörperchen.
 lymphAbs|Absolute Anzahl der Lymphozyten, die zur gezielten Immunabwehr gehören.
 monoPct|Prozentanteil der Monozyten; sie gehören zu den weißen Blutkörperchen.
 monoAbs|Absolute Zahl der Monozyten, die unter anderem Erreger aufnehmen und Gewebe reinigen.
 basoPct|Anteil basophiler Granulozyten, die an bestimmten Immunreaktionen beteiligt sind.
 basoAbs|Absolute Anzahl basophiler Granulozyten im Blut.
 immaturePct|Anteil noch unreifer Granulozyten; nur mit Blutbild und Situation bewerten.
 immatureAbs|Absolute Anzahl noch unreifer Granulozyten im Blut.
 ph|Maß dafür, wie sauer oder basisch die Blutprobe ist. Probenart beachten.
 pco2|Kohlendioxidpartialdruck. Hilft, die Abatmung von Kohlendioxid einzuschätzen. Arterielle und venöse Werte unterscheiden sich.
 po2|Sauerstoffpartialdruck. Die Beurteilung hängt von der arteriellen oder venösen Probenart und einer möglichen Sauerstoffgabe ab.
 sao2|Berechnete Sauerstoffsättigung aus der Blutgasanalyse; nicht dasselbe wie Finger-SpO₂.
 hco3|Bicarbonat ist ein Pufferstoff, der den Säure-Basen-Haushalt stabilisiert.
 tco2|Gesamtkohlendioxid im Blut, insbesondere für die Säure-Basen-Beurteilung.
 baseExcess|Basenüberschuss: berechneter Wert für den Stoffwechselanteil des Säure-Basen-Haushalts.
 baseExcessEcf|Berechneter Basenüberschuss der Flüssigkeit außerhalb der Zellen.
 anionGapK|Berechnete Differenz bestimmter geladener Blutbestandteile, mit Kalium.
 anionGap|Berechnete Differenz bestimmter Elektrolyte, ohne Kalium. Albumin und Laborverfahren beeinflussen den Wert.
 lactate|Laktat entsteht im Stoffwechsel und kann unter anderem bei starker Anstrengung zunehmen.
 metHb|Verändertes Hämoglobin, das Sauerstoff nicht wie üblich transportieren kann.
 coHb|An Kohlenmonoxid gebundener Anteil des Hämoglobins.
 oxygenContent|Gesamter Sauerstoffgehalt im Blut, abhängig unter anderem von Hämoglobin und Sättigung.
 crp|C-reaktives Protein ist ein unspezifischer Entzündungsmarker. mg/dl und mg/l haben einen Faktor zehn Unterschied.
 hsCrp|Besonders empfindliche CRP-Messung für niedrige Konzentrationen.
 pct|Procalcitonin kann bei bestimmten bakteriellen Infektionen ansteigen; allein keine gesicherte Infektionsdiagnose.
 ferritin|Ferritin speichert Eisen. Es kann auch bei Entzündungen erhöht sein.
 fibrinogen|Eiweiß, das bei der Blutgerinnung und bei Entzündungsreaktionen eine Rolle spielt.
 ldh|Enzym, das in vielen Körperzellen vorkommt; Veränderungen sind nicht organspezifisch.
 il6|Entzündungsbotenstoff des Immunsystems. Nur im Zusammenhang mit der klinischen Situation bewerten.
 bloodCulture|Mikrobiologische Untersuchung auf Erreger im Blut; oft ein Text- oder Ja/Nein-Befund.
 sputumCulture|Untersuchung von abgehustetem Schleim auf Krankheitserreger; kein Blutwert.
 creatinine|Abbauprodukt des Muskelstoffwechsels; wird zur Einschätzung der Nierenfunktion verwendet.
 egfr|Berechnete Schätzung der Filterleistung der Nieren, keine direkte Messung.
 bun|Stickstoffanteil von Harnstoff; abhängig unter anderem von Nierenfunktion und Ernährung.
 urea|Harnstoff aus dem Eiweißstoffwechsel, beeinflusst auch durch Flüssigkeitshaushalt.
 uricAcid|Abbauprodukt des Purinstoffwechsels, zum Beispiel bei Gicht relevant.
 cystatinC|Eiweiß, das ergänzend zur Einschätzung der Nierenfilterfunktion eingesetzt wird.
 albuminUrine|Eiweiß Albumin im Urin. Kann bei Nierenerkrankungen verändert sein; kein Blutwert.
 uACR|Albumin-Kreatinin-Verhältnis im Urin zur Beurteilung von Eiweißausscheidung; kein Blutwert.
 sodium|Natrium ist ein Elektrolyt, wichtig für Flüssigkeitsverteilung, Nerven und Muskeln.
 potassium|Kalium ist ein Elektrolyt, besonders wichtig für Muskel- und Herzfunktion.
 chloride|Chlorid ist ein Elektrolyt für Flüssigkeits- und Säure-Basen-Haushalt.
 calciumIon|Frei verfügbares Calcium, wichtig unter anderem für Nerven- und Muskelfunktion.
 calcium|Gesamtcalcium, frei und an Eiweiß gebunden.
 magnesium|Mineralstoff, wichtig für Muskeln, Nerven und zahlreiche Enzyme.
 phosphate|Mineralstoff für Knochen und den Energiehaushalt.
 zinc|Spurenelement, das viele Enzyme und Abwehrfunktionen unterstützt.
 selenium|Spurenelement für bestimmte Enzyme, unter anderem zum Zellschutz.
 alt|ALT oder GPT ist ein Leberenzym, das bei Schädigung von Leberzellen steigen kann.
 ast|AST oder GOT ist ein Enzym aus Leber, Muskeln und anderen Geweben.
 ggt|Gamma-GT ist ein Enzym, das unter anderem bei Leber- und Gallenwegsproblemen auffallen kann.
 alp|Alkalische Phosphatase kommt unter anderem in Leber und Knochen vor.
 bilirubin|Abbauprodukt des roten Blutfarbstoffs, wird durch Leber und Galle verarbeitet.
 bilirubinDirect|In der Leber verarbeiteter Anteil des Bilirubins.
 albumin|Wichtiges Bluteiweiß, das Stoffe transportiert und Wasser in den Gefäßen hält.
 totalProtein|Gesamtkonzentration verschiedener Blutproteine.
 cholinesterase|Enzym aus der Leber; wird bei speziellen Fragen zur Leberfunktion untersucht.
 glucose|Glukose ist Traubenzucker und dient als Energiequelle. Die Einordnung hängt davon ab, ob die Messung nüchtern erfolgte.
 glucoseRandom|Blutzucker aus einer nicht zwingend nüchternen Blutentnahme.
 hba1c|Verzuckerter Anteil des Hämoglobins; spiegelt die Blutzuckerlage mehrerer Wochen wider.
 hba1cMmol|Langzeitblutzucker HbA1c in der Einheit mmol/mol.
 insulin|Hormon aus der Bauchspeicheldrüse, das die Aufnahme von Zucker in Zellen steuert.
 cpeptide|Eiweiß, das bei der körpereigenen Insulinproduktion mit freigesetzt wird.
 cholTotal|Gesamtkonzentration von Cholesterin im Blut.
 hdl|HDL-Cholesterin ist Teil des Fetttransports; allein kein vollständiges Risikomaß.
 ldl|LDL-Cholesterin transportiert Cholesterin; individuelle Zielwerte hängen vom Herz-Kreislauf-Risiko ab.
 triglycerides|Blutfette für den Energiestoffwechsel, durch Mahlzeiten beeinflussbar.
 lpa|Lipoprotein(a) ist ein überwiegend erblich bestimmter Faktor des Herz-Kreislauf-Risikos.
 apoB|Eiweißbaustein bestimmter cholesterintransportierender Fettpartikel.
 tsh|Steuerhormon der Hirnanhangsdrüse für die Schilddrüse.
 ft4|Frei verfügbares Schilddrüsenhormon Thyroxin.
 ft3|Frei verfügbares Schilddrüsenhormon Trijodthyronin.
 tpoAb|Antikörper gegen ein Schilddrüsenenzym, bei bestimmten Autoimmunerkrankungen relevant.
 trab|Antikörper gegen den TSH-Rezeptor, bei bestimmten Schilddrüsenerkrankungen relevant.
 cortisol|Stress- und Stoffwechselhormon; Uhrzeit und Kortisonmedikamente sind wichtig.
 acth|Hormon, das die Cortisolbildung in der Nebenniere anregt.
 testosterone|Geschlechtshormon mit verschiedenen Funktionen; Messzeitpunkt ist wichtig.
 shbg|Eiweiß, das bestimmte Geschlechtshormone im Blut bindet.
 dheaS|Vorstufe bestimmter Geschlechtshormone aus der Nebenniere.
 prolactin|Hormon der Hirnanhangsdrüse, unter anderem für die Milchbildung relevant.
 vitd|25-OH-Vitamin D ist ein Marker für die Vitamin-D-Versorgung.
 b12|Vitamin, das insbesondere für Blutbildung und Nervenfunktion benötigt wird.
 holoTc|An Transportprotein gebundenes Vitamin B12, das für Zellen verfügbar sein kann.
 folate|Vitamin B9; wichtig für Zellteilung und Blutbildung.
 iron|Im Blut transportiertes Eisen, zusammen mit Ferritin und Transferrin zu beurteilen.
 transferrin|Transporteiweiß, das Eisen im Blut bindet.
 transferrinSat|Prozentanteil der mit Eisen belegten Bindungsstellen von Transferrin.
 vitB1|Vitamin B1 ist am Energiestoffwechsel und an der Nervenfunktion beteiligt.
 vitB6|Vitamin B6 unterstützt Eiweißstoffwechsel und Nervenfunktion.
 ntprobnp|Marker der Herzbelastung, unter anderem bei Verdacht auf Herzschwäche verwendet.
 troponin|Eiweiß aus Herzmuskelzellen; Messverfahren und Verlauf sind entscheidend.
 ck|Enzym aus Muskeln, kann auch nach Anstrengung ansteigen.
 inr|Standardisierter Messwert eines Teils der Blutgerinnung, insbesondere bei bestimmten Blutverdünnern.
 ptt|Gerinnungszeit zur Prüfung bestimmter Gerinnungsfaktoren.
 ddimer|Abbauprodukt von Blutgerinnseln; ein erhöhter Wert allein beweist keine Thrombose.
 pt|Quick-Wert zur Beurteilung bestimmter Gerinnungsfaktoren.
 igg|Antikörperklasse für die längerfristige Immunabwehr.
 iga|Antikörperklasse, besonders zum Schutz von Schleimhäuten wichtig.
 igm|Antikörperklasse, häufig früh bei Abwehrreaktionen beteiligt.
 igg1|Untergruppe von Immunglobulin G.
 igg2|Untergruppe von Immunglobulin G.
 igg3|Untergruppe von Immunglobulin G.
 igg4|Untergruppe von Immunglobulin G.
 ana|Autoantikörper gegen Zellkernbestandteile; positive Ergebnisse allein sind keine Diagnose.
 anca|Autoantikörper gegen Teile weißer Blutkörperchen, bei bestimmten Gefäßentzündungen relevant.
 pr3|Autoantikörper gegen Proteinase 3, bei bestimmten Gefäßentzündungen untersucht.
 mpo|Autoantikörper gegen Myeloperoxidase, bei bestimmten Gefäßentzündungen untersucht.
 rf|Rheumafaktor, ein unspezifischer Antikörper, der bei einigen rheumatischen Erkrankungen auftreten kann.
 antiCcp|Antikörper gegen citrullinierte Proteine, häufig bei Verdacht auf rheumatoide Arthritis relevant.
 c3|Eiweiß des Komplementsystems als Teil der Immunabwehr.
 c4|Eiweiß des Komplementsystems als Teil der Immunabwehr.
 cd4|Bestimmte T-Helferzellen des Immunsystems.
 spo2|Geschätzte Sauerstoffsättigung aus einem Pulsoxymeter, kein Labor-Blutwert.
 spirometry|Lungenfunktionswert FEV1: Ausatmungsvolumen in der ersten Sekunde, kein Blutwert.
 urinalysis|Urinuntersuchung auf Inhaltsstoffe und Auffälligkeiten, kein Blutwert.
 other|Individueller Test. Eine gesicherte Beschreibung ist erst mit genauer Testbezeichnung möglich.`;
  const catalog306=[{"id":"eosAbs","label":"Eosinophile absolut","category":"Asthma & Allergie","unit":"/µl"},{"id":"eosPct","label":"Eosinophile relativ","category":"Asthma & Allergie","unit":"%"},{"id":"igeTotal","label":"Gesamt-IgE","category":"Asthma & Allergie","unit":"IU/ml"},{"id":"igeSpecific","label":"Spezifisches IgE","category":"Asthma & Allergie","unit":"kU/l"},{"id":"ecp","label":"Eosinophiles kationisches Protein","category":"Asthma & Allergie","unit":"ng/ml"},{"id":"tryptase","label":"Tryptase","category":"Asthma & Allergie","unit":"µg/l"},{"id":"a1at","label":"Alpha-1-Antitrypsin","category":"Asthma & Allergie","unit":"mg/dl"},{"id":"a1atType","label":"Alpha-1-Antitrypsin-Phänotyp","category":"Asthma & Allergie","unit":""},{"id":"aspergillusIgE","label":"Aspergillus-spezifisches IgE","category":"Asthma & Allergie","unit":"kU/l"},{"id":"aspergillusIgG","label":"Aspergillus-spezifisches IgG","category":"Asthma & Allergie","unit":"mg/l"},{"id":"il5","label":"Interleukin-5","category":"Asthma & Allergie","unit":"pg/ml"},{"id":"il13","label":"Interleukin-13","category":"Asthma & Allergie","unit":"pg/ml"},{"id":"feno","label":"FeNO (Atemluft, kein Blutwert)","category":"Asthma & Allergie","unit":"ppb"},{"id":"wbc","label":"Leukozyten","category":"Großes Blutbild","unit":"10³/µl"},{"id":"rbc","label":"Erythrozyten","category":"Großes Blutbild","unit":"10⁶/µl"},{"id":"hb","label":"Hämoglobin","category":"Großes Blutbild","unit":"g/dl"},{"id":"hbCalc","label":"Hämoglobin (Blutgas, berechnet)","category":"Großes Blutbild","unit":"g/dl"},{"id":"hct","label":"Hämatokrit","category":"Großes Blutbild","unit":"%"},{"id":"hctRatio","label":"Hämatokrit L/L","category":"Großes Blutbild","unit":"L/L"},{"id":"hctCalc","label":"Hämatokrit (Blutgas, berechnet)","category":"Großes Blutbild","unit":"%"},{"id":"mcv","label":"MCV","category":"Großes Blutbild","unit":"fl"},{"id":"mch","label":"MCH","category":"Großes Blutbild","unit":"pg"},{"id":"mchc","label":"MCHC","category":"Großes Blutbild","unit":"g/dl"},{"id":"rdwCV","label":"RDW-CV","category":"Großes Blutbild","unit":"%"},{"id":"rdwSD","label":"RDW-SD","category":"Großes Blutbild","unit":"fl"},{"id":"platelets","label":"Thrombozyten","category":"Großes Blutbild","unit":"10³/µl"},{"id":"mpv","label":"MPV","category":"Großes Blutbild","unit":"fl"},{"id":"retic","label":"Retikulozyten","category":"Großes Blutbild","unit":"%"},{"id":"esr","label":"Blutsenkung","category":"Großes Blutbild","unit":"mm/h"},{"id":"neutPct","label":"Neutrophile relativ","category":"Differenzialblutbild","unit":"%"},{"id":"neutAbs","label":"Neutrophile absolut","category":"Differenzialblutbild","unit":"10³/µl"},{"id":"lymphPct","label":"Lymphozyten relativ","category":"Differenzialblutbild","unit":"%"},{"id":"lymphAbs","label":"Lymphozyten absolut","category":"Differenzialblutbild","unit":"10³/µl"},{"id":"monoPct","label":"Monozyten relativ","category":"Differenzialblutbild","unit":"%"},{"id":"monoAbs","label":"Monozyten absolut","category":"Differenzialblutbild","unit":"10³/µl"},{"id":"basoPct","label":"Basophile relativ","category":"Differenzialblutbild","unit":"%"},{"id":"basoAbs","label":"Basophile absolut","category":"Differenzialblutbild","unit":"10³/µl"},{"id":"immaturePct","label":"Unreife Granulozyten relativ","category":"Differenzialblutbild","unit":"%"},{"id":"immatureAbs","label":"Unreife Granulozyten absolut","category":"Differenzialblutbild","unit":"10³/µl"},{"id":"ph","label":"Blutgas: pH","category":"Blutgase & Säure-Basen","unit":""},{"id":"pco2","label":"Blutgas: pCO₂","category":"Blutgase & Säure-Basen","unit":"mmHg"},{"id":"po2","label":"Blutgas: pO₂","category":"Blutgase & Säure-Basen","unit":"mmHg"},{"id":"sao2","label":"Berechnete Sauerstoffsättigung","category":"Blutgase & Säure-Basen","unit":"%"},{"id":"hco3","label":"Bicarbonat","category":"Blutgase & Säure-Basen","unit":"mmol/l"},{"id":"tco2","label":"Gesamtkohlendioxid","category":"Blutgase & Säure-Basen","unit":"mmol/l"},{"id":"baseExcess","label":"Basenüberschuss Blut","category":"Blutgase & Säure-Basen","unit":"mmol/l"},{"id":"baseExcessEcf","label":"Basenüberschuss ECF","category":"Blutgase & Säure-Basen","unit":"mmol/l"},{"id":"anionGapK","label":"Anionenlücke mit Kalium","category":"Blutgase & Säure-Basen","unit":"mmol/l"},{"id":"anionGap","label":"Anionenlücke ohne Kalium","category":"Blutgase & Säure-Basen","unit":"mmol/l"},{"id":"lactate","label":"Laktat","category":"Blutgase & Säure-Basen","unit":"mmol/l"},{"id":"metHb","label":"Methämoglobin","category":"Blutgase & Säure-Basen","unit":"%"},{"id":"coHb","label":"Carboxyhämoglobin","category":"Blutgase & Säure-Basen","unit":"%"},{"id":"oxygenContent","label":"Sauerstoffgehalt","category":"Blutgase & Säure-Basen","unit":"ml/dl"},{"id":"crp","label":"CRP","category":"Entzündung & Infektionen","unit":"mg/dl"},{"id":"hsCrp","label":"hs-CRP","category":"Entzündung & Infektionen","unit":"mg/l"},{"id":"pct","label":"Procalcitonin","category":"Entzündung & Infektionen","unit":"ng/ml"},{"id":"ferritin","label":"Ferritin","category":"Entzündung & Infektionen","unit":"ng/ml"},{"id":"fibrinogen","label":"Fibrinogen","category":"Entzündung & Infektionen","unit":"g/l"},{"id":"ldh","label":"LDH","category":"Entzündung & Infektionen","unit":"U/l"},{"id":"il6","label":"Interleukin-6","category":"Entzündung & Infektionen","unit":"pg/ml"},{"id":"bloodCulture","label":"Blutkultur","category":"Entzündung & Infektionen","unit":""},{"id":"sputumCulture","label":"Sputumkultur (kein Blutwert)","category":"Entzündung & Infektionen","unit":""},{"id":"creatinine","label":"Kreatinin","category":"Niere & Stoffwechsel","unit":"mg/dl"},{"id":"egfr","label":"eGFR","category":"Niere & Stoffwechsel","unit":"ml/min/1,73 m²"},{"id":"bun","label":"Harnstoff-Stickstoff","category":"Niere & Stoffwechsel","unit":"mg/dl"},{"id":"urea","label":"Harnstoff","category":"Niere & Stoffwechsel","unit":"mg/dl"},{"id":"uricAcid","label":"Harnsäure","category":"Niere & Stoffwechsel","unit":"mg/dl"},{"id":"cystatinC","label":"Cystatin C","category":"Niere & Stoffwechsel","unit":"mg/l"},{"id":"albuminUrine","label":"Albumin im Urin","category":"Niere & Stoffwechsel","unit":"mg/l"},{"id":"uACR","label":"Albumin/Kreatinin im Urin","category":"Niere & Stoffwechsel","unit":"mg/g"},{"id":"sodium","label":"Natrium","category":"Elektrolyte & Mineralstoffe","unit":"mmol/l"},{"id":"potassium","label":"Kalium","category":"Elektrolyte & Mineralstoffe","unit":"mmol/l"},{"id":"chloride","label":"Chlorid","category":"Elektrolyte & Mineralstoffe","unit":"mmol/l"},{"id":"calciumIon","label":"Ionisiertes Calcium","category":"Elektrolyte & Mineralstoffe","unit":"mmol/l"},{"id":"calcium","label":"Calcium gesamt","category":"Elektrolyte & Mineralstoffe","unit":"mmol/l"},{"id":"magnesium","label":"Magnesium","category":"Elektrolyte & Mineralstoffe","unit":"mmol/l"},{"id":"phosphate","label":"Phosphat","category":"Elektrolyte & Mineralstoffe","unit":"mmol/l"},{"id":"zinc","label":"Zink","category":"Elektrolyte & Mineralstoffe","unit":"µg/dl"},{"id":"selenium","label":"Selen","category":"Elektrolyte & Mineralstoffe","unit":"µg/l"},{"id":"alt","label":"ALT/GPT","category":"Leber & Galle","unit":"U/l"},{"id":"ast","label":"AST/GOT","category":"Leber & Galle","unit":"U/l"},{"id":"ggt","label":"Gamma-GT","category":"Leber & Galle","unit":"U/l"},{"id":"alp","label":"Alkalische Phosphatase","category":"Leber & Galle","unit":"U/l"},{"id":"bilirubin","label":"Bilirubin gesamt","category":"Leber & Galle","unit":"mg/dl"},{"id":"bilirubinDirect","label":"Bilirubin direkt","category":"Leber & Galle","unit":"mg/dl"},{"id":"albumin","label":"Albumin","category":"Leber & Galle","unit":"g/dl"},{"id":"totalProtein","label":"Gesamteiweiß","category":"Leber & Galle","unit":"g/dl"},{"id":"cholinesterase","label":"Cholinesterase","category":"Leber & Galle","unit":"U/l"},{"id":"glucose","label":"Blutzucker","category":"Zucker & Blutfette","unit":"mg/dl"},{"id":"glucoseRandom","label":"Glukose spontan","category":"Zucker & Blutfette","unit":"mg/dl"},{"id":"hba1c","label":"HbA1c","category":"Zucker & Blutfette","unit":"%"},{"id":"hba1cMmol","label":"HbA1c IFCC","category":"Zucker & Blutfette","unit":"mmol/mol"},{"id":"insulin","label":"Insulin","category":"Zucker & Blutfette","unit":"µU/ml"},{"id":"cpeptide","label":"C-Peptid","category":"Zucker & Blutfette","unit":"ng/ml"},{"id":"cholTotal","label":"Gesamtcholesterin","category":"Zucker & Blutfette","unit":"mg/dl"},{"id":"hdl","label":"HDL-Cholesterin","category":"Zucker & Blutfette","unit":"mg/dl"},{"id":"ldl","label":"LDL-Cholesterin","category":"Zucker & Blutfette","unit":"mg/dl"},{"id":"triglycerides","label":"Triglyzeride","category":"Zucker & Blutfette","unit":"mg/dl"},{"id":"lpa","label":"Lipoprotein(a)","category":"Zucker & Blutfette","unit":"nmol/l"},{"id":"apoB","label":"Apolipoprotein B","category":"Zucker & Blutfette","unit":"mg/dl"},{"id":"tsh","label":"TSH","category":"Schilddrüse & Hormone","unit":"mIU/l"},{"id":"ft4","label":"Freies T4","category":"Schilddrüse & Hormone","unit":"ng/dl"},{"id":"ft3","label":"Freies T3","category":"Schilddrüse & Hormone","unit":"pg/ml"},{"id":"tpoAb","label":"TPO-Antikörper","category":"Schilddrüse & Hormone","unit":"IU/ml"},{"id":"trab","label":"TSH-Rezeptor-Antikörper","category":"Schilddrüse & Hormone","unit":"IU/l"},{"id":"cortisol","label":"Cortisol","category":"Schilddrüse & Hormone","unit":"µg/dl"},{"id":"acth","label":"ACTH","category":"Schilddrüse & Hormone","unit":"pg/ml"},{"id":"testosterone","label":"Testosteron","category":"Schilddrüse & Hormone","unit":"ng/ml"},{"id":"shbg","label":"SHBG","category":"Schilddrüse & Hormone","unit":"nmol/l"},{"id":"dheaS","label":"DHEA-S","category":"Schilddrüse & Hormone","unit":"µg/dl"},{"id":"prolactin","label":"Prolaktin","category":"Schilddrüse & Hormone","unit":"ng/ml"},{"id":"vitd","label":"Vitamin D (25-OH)","category":"Vitamine & Eisen","unit":"ng/ml"},{"id":"b12","label":"Vitamin B12","category":"Vitamine & Eisen","unit":"pg/ml"},{"id":"holoTc","label":"Holotranscobalamin","category":"Vitamine & Eisen","unit":"pmol/l"},{"id":"folate","label":"Folat","category":"Vitamine & Eisen","unit":"ng/ml"},{"id":"iron","label":"Eisen","category":"Vitamine & Eisen","unit":"µg/dl"},{"id":"transferrin","label":"Transferrin","category":"Vitamine & Eisen","unit":"g/l"},{"id":"transferrinSat","label":"Transferrinsättigung","category":"Vitamine & Eisen","unit":"%"},{"id":"vitB1","label":"Vitamin B1","category":"Vitamine & Eisen","unit":"µg/l"},{"id":"vitB6","label":"Vitamin B6","category":"Vitamine & Eisen","unit":"µg/l"},{"id":"ntprobnp","label":"NT-proBNP","category":"Herz & Gerinnung","unit":"pg/ml"},{"id":"troponin","label":"Troponin","category":"Herz & Gerinnung","unit":"ng/l"},{"id":"ck","label":"Kreatinkinase","category":"Herz & Gerinnung","unit":"U/l"},{"id":"inr","label":"INR","category":"Herz & Gerinnung","unit":""},{"id":"ptt","label":"aPTT","category":"Herz & Gerinnung","unit":"s"},{"id":"ddimer","label":"D-Dimere","category":"Herz & Gerinnung","unit":"mg/l"},{"id":"pt","label":"Quick","category":"Herz & Gerinnung","unit":"%"},{"id":"igg","label":"IgG","category":"Immunsystem & Autoimmunität","unit":"g/l"},{"id":"iga","label":"IgA","category":"Immunsystem & Autoimmunität","unit":"g/l"},{"id":"igm","label":"IgM","category":"Immunsystem & Autoimmunität","unit":"g/l"},{"id":"igg1","label":"IgG1","category":"Immunsystem & Autoimmunität","unit":"g/l"},{"id":"igg2","label":"IgG2","category":"Immunsystem & Autoimmunität","unit":"g/l"},{"id":"igg3","label":"IgG3","category":"Immunsystem & Autoimmunität","unit":"g/l"},{"id":"igg4","label":"IgG4","category":"Immunsystem & Autoimmunität","unit":"g/l"},{"id":"ana","label":"ANA","category":"Immunsystem & Autoimmunität","unit":""},{"id":"anca","label":"ANCA","category":"Immunsystem & Autoimmunität","unit":""},{"id":"pr3","label":"PR3-Antikörper","category":"Immunsystem & Autoimmunität","unit":"U/ml"},{"id":"mpo","label":"MPO-Antikörper","category":"Immunsystem & Autoimmunität","unit":"U/ml"},{"id":"rf","label":"Rheumafaktor","category":"Immunsystem & Autoimmunität","unit":"IU/ml"},{"id":"antiCcp","label":"Anti-CCP","category":"Immunsystem & Autoimmunität","unit":"U/ml"},{"id":"c3","label":"Komplement C3","category":"Immunsystem & Autoimmunität","unit":"g/l"},{"id":"c4","label":"Komplement C4","category":"Immunsystem & Autoimmunität","unit":"g/l"},{"id":"cd4","label":"CD4-Zellen","category":"Immunsystem & Autoimmunität","unit":"/µl"},{"id":"spo2","label":"SpO₂ (kein Blutwert)","category":"Sonstige Untersuchungen","unit":"%"},{"id":"spirometry","label":"FEV1 (kein Blutwert)","category":"Sonstige Untersuchungen","unit":"l"},{"id":"urinalysis","label":"Urinstatus (kein Blutwert)","category":"Sonstige Untersuchungen","unit":""},{"id":"other","label":"Eigener Test","category":"Sonstige Untersuchungen","unit":""}];
  const descriptions=Object.fromEntries(text.trim().split('\n').map(x=>{const a=x.trim().split('|');return [a.shift(),a.join('|')]}));
  window.ASTHMA_LAB_INFO_306={catalog:catalog306,descriptions};
  const mk=(tag,txt,cls)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=String(txt);return el};
  const norm=v=>String(v??'').trim();
  const num=v=>{const s=norm(v).replace(',','.');return /^[-+]?\d+(?:\.\d+)?$/.test(s)?Number(s):null};
  const fmt=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:4});
  // Strictly parse a two-sided laboratory reference range; do not fabricate missing bounds.
  const range=v=>{const s=norm(v).replaceAll('−','-').replaceAll('–','-').replace(/\s/g,'').replace(/,/g,'.');const m=s.match(/^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)(?:(?:\/?[a-zA-Zµμ%°0-9.²³^/-]+))?$/);return m&&Number(m[1])<=Number(m[2])?[Number(m[1]),Number(m[2])]:null};
  const categoryById=Object.fromEntries(catalog306.map(t=>[t.id,t.category]));
  const oneSided=ref=>{const s=norm(ref).replace(/,/g,'.').replace(/\s/g,'').replaceAll('≤','<=').replaceAll('≥','>=');const m=s.match(/^(<=|>=|<|>)(-?\d+(?:\.\d+)?)(?:[a-zA-Zµμ%°0-9.²³^/-]*)?$/);return m?{op:m[1],limit:Number(m[2])}:null};
  const classification=r=>{const n=num(r.value);if(n===null)return null;const rr=range(r.reference);if(rr)return n<rr[0]||n>rr[1]?'out':'in';const side=oneSided(r.reference);if(!side)return null;const {op,limit}=side;const inside=op==='<'?n<limit:op==='<='?n<=limit:op==='>'?n>limit:n>=limit;return inside?'in':'out'};
  let token=0,busy=false;
  function guide(r){
    const d=mk('details',undefined,'lab306-guide');d.append(mk('summary','Was bedeutet der Wert? Grenzwerte und Erklärung'));
    const body=mk('div',undefined,'lab306-content');
    body.append(mk('strong','Was wird gemessen?'));
    body.append(mk('p',descriptions[r.marker]||'Für diese Untersuchung liegt keine verlässlich zugeordnete Standardbeschreibung vor. Bitte die konkrete Testbezeichnung auf dem Originalbefund beachten.'));
    body.append(mk('strong','Referenz- und Grenzwerte'));
    const arr=range(r.reference),unit=norm(r.unit),value=num(r.value);
    if(arr){
      const [lo,hi]=arr;body.append(mk('p','Untere Laborreferenz: '+fmt(lo)+' '+unit+' · obere Laborreferenz: '+fmt(hi)+' '+unit+'.'));
      body.append(mk('p','Unter '+fmt(lo)+' '+unit+': unter der Referenz; von '+fmt(lo)+' bis '+fmt(hi)+' '+unit+': innerhalb; über '+fmt(hi)+' '+unit+': über der Referenz.'));
      if(value!==null)body.append(mk('p',value<lo?'Dein Messwert liegt rechnerisch unter der Laborreferenz.':value>hi?'Dein Messwert liegt rechnerisch über der Laborreferenz.':'Dein Messwert liegt rechnerisch innerhalb der Laborreferenz.','lab306-context'));
    }else if(oneSided(r.reference)){
      const {op,limit}=oneSided(r.reference),operation=op.replace('<=','≤').replace('>=','≥');
      body.append(mk('p','Laborseitig angegebener Grenzwert: '+operation+' '+fmt(limit)+' '+unit+'. Die zweite Grenze wurde vom Labor nicht angegeben.'));
      if(value!==null)body.append(mk('p',classification(r)==='in'?'Dein Wert erfüllt die eingetragene Laborgrenze.':'Dein Wert überschreitet die eingetragene Laborgrenze bzw. unterschreitet die Untergrenze.','lab306-context'));
    }else if(norm(r.reference))body.append(mk('p','Original-Laborangabe: '+norm(r.reference)+'. Daraus lässt sich hier keine verlässlich auswertbare Grenze ableiten.'));
    else body.append(mk('p','Kein Referenzbereich eingetragen. Für diesen Test wird kein allgemeiner Grenzwert erfunden. Bitte die Angabe aus dem Originalbefund ergänzen.'));
    if(['po2','pco2','ph','sao2'].includes(r.marker))body.append(mk('p','Bei Blutgaswerten ist wesentlich, ob die Probe arteriell, kapillär oder venös entnommen wurde.','lab306-context'));
    if(['glucose','glucoseRandom'].includes(r.marker))body.append(mk('p','Den Nüchternstatus für die korrekte Beurteilung beachten.','lab306-context'));
    if(['eosAbs','eosPct'].includes(r.marker))body.append(mk('p','Bei Asthmatherapie mit Kortison oder Anti-IL-5-Biologika können die Eosinophilen abfallen.','lab306-context'));
    body.append(mk('small','Die Laborreferenz ist keine medizinische Gefahrenschwelle. Sie kann nach Labor, Methode, Alter oder Probenart unterschiedlich sein. Ein normaler Wert schließt eine Krankheit nicht aus.'));
    d.append(body);return d;
  }
  async function refresh(){if(busy)return;busy=true;const id=++token;try{
    const all=(await S.list('labs')).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    if(id!==token)return;
    const sel=document.getElementById('labp-category'),query=document.getElementById('labp-search');
    const category=sel?.value||'',search=(query?.value||'').toLocaleLowerCase('de');
    const visible=all.filter(r=>(!category||(r.category||categoryById[r.marker]||'')===category)&&(!search||[r.label,r.marker,r.allergen,r.notes].some(v=>norm(v).toLocaleLowerCase('de').includes(search))));
    const cards=[...host.querySelectorAll(':scope > .labp-record')];
    cards.forEach((card,i)=>{
      const r=visible[i];if(!r)return;
      const shown=card.querySelector('h4')?.textContent?.trim();
      const expected=(String(r.label||r.marker||'')+(r.allergen?' · '+r.allergen:'')).trim();
      if(shown && shown!==expected)return; // never attach another test's explanation
      const old=card.querySelector('.lab306-guide');if(old)return;
      const g=guide(r),details=card.querySelector(':scope > details');
      if(details)details.insertAdjacentElement('beforebegin',g);else card.append(g);
    });
    const target=document.getElementById('lab306-summary');if(target){
      let within=0,outside=0,unrated=0;
      all.forEach(r=>{const verdict=classification(r);if(verdict==='in')within++;else if(verdict==='out')outside++;else unrated++});
      target.replaceChildren();const stats=[['Gespeicherte Werte',all.length],['Innerhalb der Laborreferenz',within],['Außerhalb der Laborreferenz',outside],['Ohne eindeutig prüfbaren Bereich',unrated]];
      for(const [key,val] of stats){const box=mk('div',undefined,'lab306-stat'),n=mk('strong',val),label=mk('span',key);box.append(n,label);target.append(box)}
    }
  }catch(err){const p=document.getElementById('lab306-status');if(p)p.textContent='Laborübersicht derzeit nicht verfügbar: '+(err?.message||'unbekannter Fehler')}
  finally{busy=false}}
  let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;refresh()},0)};
  new MutationObserver(schedule).observe(host,{childList:true});
  for(const id of ['labp-search','labp-category','labp-more','labp-confirm','labp-add'])document.getElementById(id)?.addEventListener('input',schedule);
  for(const id of ['labp-category','labp-more','labp-confirm'])document.getElementById(id)?.addEventListener('click',()=>setTimeout(schedule,120));
  window.addEventListener('asthma:secure-change',schedule);schedule();
})();


'use strict';
/* Asthma 3.0.6: additive navigation and visual hierarchy; does not modify medical records. */
(()=>{
  if(document.getElementById('cockpit306'))return;
  const $=id=>document.getElementById(id);
  const page=$('uebersicht');if(!page)return;
  const css=document.createElement('style');css.id='redesign306-css';css.textContent=`
  :root{--n306:#16485d;--b306:#d0e4eb;--l306:#f3f9fb;--a306:#177d9e}
  .cockpit306{margin:15px 0 19px;padding:16px;border-radius:18px;border:1px solid var(--b306);background:linear-gradient(160deg,#f4fbff 0%,#fff 90%);box-shadow:0 6px 22px #173e5610}
  .cockpit306 h3{color:var(--n306);font-size:1.15rem;margin:0 0 5px}
  .cockpit306>p{margin:0 0 14px;font-size:.9rem;color:#4c6774}
  .cockpit306-group{margin:12px 0 17px}
  .cockpit306-group h4{margin:0 0 10px;font-size:.88rem;letter-spacing:.015em;color:#385e6f}
  .cockpit306-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .cockpit306-tile{display:flex;flex-direction:column;gap:5px;min-width:0;text-align:left;padding:13px;border:1px solid #cde2ea;border-radius:13px;background:white;box-shadow:0 2px 5px #173e5610;cursor:pointer;color:#163d4f;font:inherit;overflow-wrap:anywhere}
  .cockpit306-tile strong{font-size:.95rem;line-height:1.3}
  .cockpit306-tile small{color:#5a7180;line-height:1.35;font-size:.77rem}
  .cockpit306-tile:focus-visible,.lab306-links button:focus-visible{outline:3px solid #1b829e;outline-offset:2px}
  .cockpit306-tile.primary{background:#dbf1f6;border-color:#87c3d4}
  .cockpit306-tile.primary strong{color:#0f536c}
  .cockpit306-extra{border-top:1px solid #deedf2;margin-top:12px;padding-top:12px}
  .cockpit306-extra summary{font-weight:700;color:#16495e;cursor:pointer;padding:5px 0}
  #uebersicht .home20-quick,#uebersicht .suite-launcher,#uebersicht h3:has(+ .suite-launcher){display:none!important}
  #uebersicht .suite-stats{margin-top:15px}
  #labor .lab306-top{margin:14px 0;padding:15px;border:1px solid var(--b306);border-radius:16px;background:#eff7fb}
  #labor .lab306-top h3{margin:0 0 6px;font-size:1.08rem;color:#15485c}
  #labor .lab306-top p{font-size:.89rem;margin:4px 0 12px;color:#516b79}
  #labor .lab306-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}
  #labor .lab306-stat{padding:10px;background:#fff;border:1px solid #cfe0e9;border-radius:11px;min-width:0}
  #labor .lab306-stat strong{font-size:1.22rem;color:#124c64;display:block}
  #labor .lab306-stat span{font-size:.73rem;color:#526b78;line-height:1.25;display:block}
  #labor .lab306-links{display:flex;gap:9px;flex-wrap:wrap;margin:10px 0 0}
  #labor .lab306-links button{font:inherit;font-size:.86rem;font-weight:650;padding:9px 12px;border:1px solid #abcbd7;border-radius:9px;background:#fff;color:#1d536b;cursor:pointer}
  #labor .lab306-guide{margin:12px 0;border:1px solid #c6dfe8;border-radius:11px;background:#f2f9fc;overflow:hidden}
  #labor .lab306-guide summary{padding:11px;font-weight:700;cursor:pointer;color:#195068;font-size:.91rem}
  #labor .lab306-content{padding:0 12px 13px;font-size:.9rem;line-height:1.52}
  #labor .lab306-content strong{display:block;margin:9px 0 3px;color:#1a4557}
  #labor .lab306-content p{margin:5px 0;color:#294859;overflow-wrap:anywhere}
  #labor .lab306-content small{display:block;margin-top:10px;color:#597080;font-size:.81rem}
  #labor .lab306-content .lab306-context{font-weight:600;color:#23536a}
  #mehr .m306-group{border:1px solid #cfe2e9;border-radius:14px;background:#f5fafc;margin:12px 0;padding:13px}
  #mehr .m306-group h3{margin:0 0 9px;color:#17495c;font-size:1.02rem}
  #mehr .m306-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  #mehr .m306-grid button{min-width:0;border:1px solid #d0e0e8;background:white;border-radius:10px;text-align:left;padding:12px;font:inherit;color:#17475b;cursor:pointer}
  #mehr .m306-grid button strong{display:block;font-size:.91rem}
  #mehr .m306-grid button small{display:block;font-size:.76rem;color:#56707d;margin-top:4px}
  #mehr>.hub20-grid{display:none!important}
  @media(max-width:700px){.cockpit306-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#labor .lab306-summary{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:430px){.cockpit306{padding:12px}.cockpit306-tile{padding:11px 10px}.cockpit306-tile strong{font-size:.86rem}}
  @media(max-width:700px){#start .hero-illustration{display:none!important}#start .hero-content{padding-top:13px!important;padding-bottom:13px!important}#start h1{font-size:1.34rem!important}#start .hero-meta{display:none!important}}
  #labor .lab306-lexicon{background:#fff;border:1px solid #ccdde4;border-radius:12px;padding:12px;margin-top:14px}
  #labor .lab306-lexicon summary{cursor:pointer;font-weight:700;color:#174b60}
  #labor .lab306-lexicon label{display:block;margin:10px 0;font-size:.88rem}
  #labor .lab306-lexicon select{display:block;width:100%;max-width:100%;font-size:16px;margin:6px 0;padding:9px;border:1px solid #bed5de;border-radius:9px;background:#fff}
  #labor .lab306-lexicon-detail{background:#f5fafe;border-radius:10px;padding:12px;margin-top:10px;color:#264b60;font-size:.9rem;line-height:1.55}
  #labor .lab306-lexicon-detail h4{margin:0 0 6px;color:#18485f}
  #labor .lab306-lexicon-detail p{margin:7px 0}
  #labor .lab306-lexicon-detail small{color:#536b77}
  .cockpit306-version{display:block;font-size:.75rem;color:#69818e;margin-top:8px}
  @media print{.cockpit306,.lab306-links,.m306-group{display:none!important}}
  `;document.head.append(css);
  const el=(tag,txt,cls)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x};
  const groups=[
    {title:'Schnell erfassen',items:[
      ['Treppenzähler','Stufen & Belastung','arbeit',true],['Lungenfunktion','FEV₁ & Untersuchungen','lungenwerte'],
      ['Blutwerte','Labor und Befunde','labor'],['Blutdruck & Puls','Vitalwerte eintragen','vitalwerte'],
      ['Befund hochladen','Bild / PDF erfassen','befunde'],['Kalender','Termine & Erinnerungen','kalender']
    ]},
    {title:'Therapie & Alltag',items:[
      ['Peak-Flow','Tagebuch und Verlauf','peakflow'],['Medikamente','Therapieplan','therapie'],
      ['Krankheitstage','Asthma-AU und Tagebuch','akte']
    ]},
    {title:'Arbeit, Anträge & Auswertung',items:[
      ['Arbeitsschutz','Belastungen & Rechte','arbeit'],['Reha und Anträge','Anträge verwalten','antraege'],
      ['Statistik & PDF','Monats- / Jahresbericht','statistik']
    ]}
  ];
  const cockpit=el('section',undefined,'cockpit306');cockpit.id='cockpit306';cockpit.setAttribute('aria-label','Schnellzugriff auf wichtige Funktionen');
  cockpit.append(el('h3','Dein Gesundheits-Cockpit'),el('p','Die häufigsten Aufgaben direkt öffnen. Bestehende Aufzeichnungen und Diagramme bleiben darunter erhalten.'));
  function buildTile(item){const [name,caption,route,featured]=item,b=el('button',undefined,'cockpit306-tile'+(featured?' primary':''));b.type='button';b.dataset.goto=route;
    b.append(el('strong',name),el('small',caption));if(name==='Treppenzähler')b.addEventListener('click',()=>setTimeout(()=>document.getElementById('sc-steps')?.focus({preventScroll:false}),150));return b;}
  groups.forEach((g,index)=>{const container=index===0?el('section',undefined,'cockpit306-group'):el('details',undefined,'cockpit306-extra');
    if(index===0)container.append(el('h4',g.title));else container.append(el('summary',g.title));
    const grid=el('div',undefined,'cockpit306-grid');g.items.forEach(item=>grid.append(buildTile(item)));container.append(grid);cockpit.append(container)});
  (page.querySelector('.home20-heading')||page.firstElementChild)?.insertAdjacentElement('afterend',cockpit);
  const lab=$('labor');if(lab&&!$('lab306-summary')){
    const box=el('section',undefined,'lab306-top');box.append(el('h3','Deine Laborwerte übersichtlich erklärt'),el('p','Alle eingetragenen Werte mit den jeweiligen Referenzbereichen. Bei jedem Wert kannst du die Erklärung und Grenzwerte aufklappen.'));
    box.append(el('div',undefined,'lab306-summary')).lastElementChild.id='lab306-summary';
    const links=el('div',undefined,'lab306-links');
    [['Gespeicherte Werte','labp-list'],['Verlauf','labp-graph'],['Zwei Bluttests vergleichen','lab-compare-years'],['Neuen Wert erfassen','labp-add']].forEach(([txt,id])=>{
      const b=el('button',txt);b.type='button';b.addEventListener('click',()=>{if(id==='labp-add'){$('labp-add')?.click();return}const t=$(id);if(t){t.scrollIntoView({behavior:'smooth',block:'start'});if(t.closest('details'))t.closest('details').open=true}});links.append(b);
    });box.append(links,el('p',undefined));box.lastElementChild.id='lab306-status';
    lab.querySelector('.section-heading')?.insertAdjacentElement('afterend',box);
  }
  // All 147 descriptions are also available when no reading is saved yet.
  const catalogue=window.ASTHMA_LAB_INFO_306;
  const labTop=$('lab306-summary')?.parentElement;
  if(labTop&&catalogue){
    const fold=el('details',undefined,'lab306-lexicon');
    fold.append(el('summary','Laborwert-Lexikon: alle 147 Untersuchungen erklären'));
    const label=el('label','Untersuchung auswählen');
    const select=el('select');select.id='lab306-lexicon-select';
    let optgroup=null,previous='';
    for(const t of catalogue.catalog){if(t.category!==previous){previous=t.category;optgroup=el('optgroup');optgroup.label=previous;select.append(optgroup)}const opt=el('option',t.label+' ('+t.unit+')');opt.value=t.id;optgroup.append(opt)}
    label.append(select);fold.append(label);
    const detail=el('section',undefined,'lab306-lexicon-detail');fold.append(detail);
    const update=async()=>{const marker=select.value,def=catalogue.catalog.find(t=>t.id===marker);detail.replaceChildren();
      if(!def)return;detail.append(el('h4',def.label),el('p',catalogue.descriptions[marker]||'Keine gesicherte Erklärung zugeordnet.'));
      try{const S=window.ASTHMA_SECURITY;const rows=(await S.list('labs')).filter(r=>r.marker===marker).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
       const recent=rows.find(r=>String(r.reference||'').trim());if(recent)detail.append(el('p','Letzter dokumentierter Labor-Referenzwert: '+String(recent.reference)+' '+String(recent.unit||'')+' (Untersuchung vom '+String(recent.date||'')+').'));
       else detail.append(el('p','In deinen bisherigen Einträgen ist kein Laborreferenzwert für diese Untersuchung vorhanden.'));
      }catch{detail.append(el('p','Individuelle Laborreferenz derzeit nicht verfügbar.'))}
      detail.append(el('small','Grenzwerte immer anhand des Originalbefunds und seiner Einheit prüfen. Kein allgemeiner medizinischer Grenzwert wird hinzugedichtet.'));
    };
    select.value='eosAbs';select.addEventListener('change',update);fold.addEventListener('toggle',()=>{if(fold.open)update()});
    labTop.append(fold);
  }
  const more=$('mehr');if(more&&!$('m306-grouped')){
    const grouped=el('div');grouped.id='m306-grouped';const sections=[
      ['Gesundheit und Messwerte',[['Lungenfunktion','lungenwerte'],['Peak-Flow','peakflow'],['Blutwerte','labor'],['Vitalwerte','vitalwerte'],['Befundscanner','befunde'],['Therapie','therapie']]],
      ['Planung, Alltag und Arbeit',[['Kalender','kalender'],['Meine Akte','akte'],['Arbeit und Treppenzähler','arbeit'],['Mein Profil','profil'],['Arztbericht','bericht'],['Statistik & PDF','statistik']]],
      ['Anträge, Hilfe und Wissen',[['Anträge','antraege'],['Hilfsmittel','hilfen'],['Region und Suche','region'],['Wissen und Rechte','wissen'],['Einstellungen','einstellungen']]]
    ];
    for(const [name,links] of sections){const section=el('section',undefined,'m306-group');section.append(el('h3',name));const grid=el('div',undefined,'m306-grid');for(const [label,route] of links){const b=el('button');b.type='button';b.dataset.goto=route;b.append(el('strong',label),el('small','Bereich öffnen'));grid.append(b)}section.append(grid);grouped.append(section)}
    more.querySelector('.hub20-grid')?.insertAdjacentElement('beforebegin',grouped);
  }
  const v=document.createElement('small');v.className='cockpit306-version';v.textContent='Oberfläche & Laborwissen – Erweiterung 3.1.4';cockpit.append(v);
})();


/* Asthma 3.1.4: repariert alte Labor-Tabellen in der Statistik auch dann,
   wenn noch eine enge Legacy-Tabelle erzeugt wird oder ein Bericht bereits offen ist. */
(()=>{
 'use strict';
 const report=document.getElementById('stats25-report');
 if(!report||window.ASTHMA_STATS314)return;
 window.ASTHMA_STATS314=true;
 const make=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=String(content);return x;};
 const clean=x=>String(x??'').replace(/\s+/g,' ').trim();
 if(!document.getElementById('stats314-fix-css')){
  const css=document.createElement('style');css.id='stats314-fix-css';css.textContent=`
  #stats25-report table{max-width:100%}
  #stats25-report th,#stats25-report td{word-break:normal;overflow-wrap:anywhere;white-space:normal}
  .stats314-labcards{display:grid;gap:12px;margin:10px 0 18px}
  .stats314-labcard{border:1px solid #d7e5eb;border-radius:14px;background:#fff;padding:12px;box-shadow:0 1px 0 rgba(18,59,82,.03);break-inside:avoid-page;page-break-inside:avoid}
  .stats314-labhead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e4edf1}
  .stats314-labhead strong{display:block;color:#123b52;font-size:.98rem;line-height:1.35}
  .stats314-labdate{color:#5f7581;font-size:.83rem;white-space:nowrap}
  .stats314-labgrid{display:grid;grid-template-columns:120px minmax(0,1fr);gap:7px 10px;align-items:start}
  .stats314-lablabel{font-weight:700;color:#1f4658}
  .stats314-labvalue{min-width:0;color:#243943;overflow-wrap:anywhere}
  @media(max-width:560px){.stats314-labhead{flex-direction:column}.stats314-labdate{white-space:normal}.stats314-labgrid{grid-template-columns:1fr}.stats314-lablabel{margin-top:4px}}
  @media print{.stats314-labcard{padding:10px;border-color:#cadbe3}}
  `;document.head.append(css)
 }
 function isLegacyLabTable(table){
  const header=[...table.querySelectorAll('tr:first-child th, tr:first-child td')].map(x=>clean(x.textContent).toLowerCase());
  const joined=header.join('|');
  return header.length>=5&&joined.includes('datum')&&joined.includes('laborwert')&&joined.includes('ergebnis')&&joined.includes('referenz')&&joined.includes('beurteilung');
 }
 function convert(table){
  if(table.dataset.stats314done==='1')return;
  const rows=[...table.querySelectorAll('tr')].slice(1).filter(tr=>tr.children.length>=5);
  if(!rows.length)return;
  const list=make('div','stats314-labcards');
  rows.forEach(tr=>{
   const cells=[...tr.children].map(td=>clean(td.textContent));
   const card=make('article','stats314-labcard');
   const head=make('div','stats314-labhead');
   head.append(make('strong',null,cells[1]||'Laborwert'),make('span','stats314-labdate',cells[0]||'–'));card.append(head);
   const grid=make('div','stats314-labgrid');
   const row=(label,value)=>{grid.append(make('div','stats314-lablabel',label),make('div','stats314-labvalue',value||'–'))};
   row('Ergebnis',cells[2]||'–');
   row('Referenz',cells[3]||'–');
   row('Beurteilung / Notiz',cells.slice(4).filter(Boolean).join(' ')||'–');
   card.append(grid);list.append(card);
  });
  table.dataset.stats314done='1';
  table.style.display='none';
  table.insertAdjacentElement('afterend',list);
 }
 function upgrade(){report.querySelectorAll('table').forEach(table=>{if(isLegacyLabTable(table))convert(table);});}
 let timer=0;const queue=()=>{clearTimeout(timer);timer=setTimeout(upgrade,60)};
 new MutationObserver(queue).observe(report,{childList:true,subtree:true});
 queue();setTimeout(queue,300);setTimeout(queue,1200);
})();


/* Asthma Navigation 3.1.5 – additive UI restructuring without vault/schema changes.
   Operates after authentication, moves the existing private search without replacing its ID,
   makes Antraege/Akte a single dock destination, and links blood pressure to existing vital29.
   Leaves all measured records, documents, input fields, import tools and reports untouched. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 if($('nav315-styles')||!$('start')||!$('uebersicht')||!$('mehr'))return;
 const hero=$('start'),home=$('uebersicht'),more=$('mehr');
 const search=more.querySelector('.hub20-search');
 const tiles=more.querySelector('.hub20-grid');
 const dock=document.querySelector('.bottom-dock');
 if(!search||!tiles||!dock)return;
 const css=document.createElement('style');css.id='nav315-styles';
 css.textContent=`
 .nav315-search{width:min(1120px,100%);max-width:100%;box-sizing:border-box;margin:0 auto;padding:13px 16px 2px;position:relative;z-index:2}
 .nav315-search-title{display:flex;align-items:center;gap:9px;color:#f7feff;font-weight:750;font-size:1.05rem;margin:0 0 7px;line-height:1.35}
 .nav315-search-title svg{width:22px;height:22px;flex:0 0 22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}
 .nav315-search .hub20-search{margin:0 0 13px;background:#f2fafd;border:1px solid #abd2df;border-radius:16px;padding:12px 14px;box-shadow:0 7px 22px #082d4426;color:#1d4559}
 .nav315-search .hub20-search label{font-size:.84rem;color:#365969;margin:0 0 7px}
 .nav315-search .hub20-search input{width:100%;box-sizing:border-box;font-size:16px;min-height:47px;background:white;color:#183c4d}
 .nav315-search .hub20-search .input-note{font-size:.77rem;line-height:1.4;margin:8px 0 2px;color:#587585}
 .nav315-search .hub20-results:not(:empty){margin-top:10px}
 .nav315-expand{border:1px solid #cde3ec;background:#f2f9fc;border-radius:15px;padding:12px 14px;margin:14px 0 24px}
 .nav315-expand>summary{color:#164459;font-weight:730;font-size:1rem;cursor:pointer;padding:4px;line-height:1.4}
 .nav315-expand>p{margin:12px 4px 0;color:#5f7583;font-size:.85rem}
 .nav315-expand .hub20-grid{margin:13px 0 0}
 .nav315-tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 17px}
 .nav315-tabs>button{padding:12px 9px;border-radius:12px;border:1px solid #bad8e3;background:#f4fafc;color:#214f63;font-size:.87rem;line-height:1.35;font-weight:700;cursor:pointer;white-space:normal;min-width:0}
 body[data-page="antraege"] #nav315-tabs-antraege button[data-goto="antraege"],
 body[data-page="akte"] #nav315-tabs-akte button[data-goto="akte"]{border-color:#378ea5;background:#d8eff6;color:#10546a}
 body[data-page="akte"] #nav315-dock-combined{background:#e3f4f4;color:#146074}
 .bottom-dock button{min-height:54px;white-space:normal;line-height:1.1}
 .bottom-dock button span{white-space:normal;text-align:center}
 .bottom-dock button svg{flex:none}
 @media(max-width:390px){.bottom-dock{gap:0;padding-left:2px;padding-right:2px}.bottom-dock button{font-size:.60rem;padding-left:1px;padding-right:1px}.bottom-dock button svg{width:20px;height:20px}.nav315-search{padding:10px 10px 2px}.nav315-search .hub20-search{padding:10px}}
 @media(min-width:760px){.nav315-search{padding-top:20px}.nav315-expand .hub20-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
 `;
 document.head.append(css);
 // Move existing, password-protected search. hub20.js initializes after this file.
 const searchHost=document.createElement('div');searchHost.className='nav315-search';searchHost.id='nav315-search';
 searchHost.innerHTML='<div class="nav315-search-title"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7"></circle><path d="m16 16 5 5"></path></svg><span>Suche</span></div>';
 searchHost.append(search);
 const label=search.querySelector('label');if(label)label.textContent='Deine verschlüsselte Akte durchsuchen';
 const searchInput=$('private-search20');if(searchInput)searchInput.placeholder='FEV1, Blutdruck, Medikamente, Termine …';
 hero.insertBefore(searchHost,hero.firstChild);
 // All formerly hidden functions remain one tap away via a collapsed group at home.
 const group=document.createElement('details');group.className='nav315-expand';group.id='nav315-functions';
 const title=document.createElement('summary');title.textContent='Weitere Funktionen und Einstellungen';group.append(title);
 const hint=document.createElement('p');hint.textContent='Profil, Hilfsmittel, Arbeit, Arztberichte und alle anderen bisherigen Bereiche.';group.append(hint,tiles);
 const quick=home.querySelector('.home20-quick');if(quick)quick.insertAdjacentElement('afterend',group);else home.prepend(group);
 const oldHelp=home.querySelector('.home20-heading p:last-child');
 if(oldHelp&&oldHelp.textContent.includes('Mehr'))oldHelp.textContent='Schnellzugriffe für die täglichen Aufgaben. Weitere Funktionen findest du gesammelt darunter.';
 // Simplify old launcher: grouped destination replaces adjacent overlapping tiles.
 const homeLaunch=home.querySelector('.suite-launcher');
 if(homeLaunch){const req=homeLaunch.querySelector('[data-goto="antraege"]'),files=homeLaunch.querySelector('[data-goto="akte"]');
   if(req){const strong=req.querySelector('strong');if(strong)strong.textContent='Anträge & Akte';const small=req.querySelector('small');if(small)small.textContent='Anträge, Unterlagen, Dokumente';}
   if(files)files.remove();}
 // Retain the underlying antraege/akte pages, each with links to the other.
 function tabs(page,id){const target=$(id);if(!target)return;
  const section=document.createElement('nav');section.className='nav315-tabs';section.id='nav315-tabs-'+page;section.setAttribute('aria-label','Anträge und Akte');
  section.innerHTML='<button data-goto="antraege" type="button">Anträge und Reha</button><button data-goto="akte" type="button">Meine Akte und Dokumente</button>';
  target.prepend(section);
 }
 tabs('antraege','antraege');tabs('akte','mein-bereich');
 document.querySelectorAll('.app-nav [data-goto="mehr"]').forEach(e=>e.remove());
 document.querySelectorAll('.app-nav [data-goto="akte"]').forEach(e=>e.remove());
 const reqNav=document.querySelector('.app-nav [data-goto="antraege"]');if(reqNav)reqNav.textContent='Anträge & Akte';
 // Keep former destinations available, but remove the visible 'Mehr' page itself.
 const grouped=tiles.querySelector('[data-goto="antraege"] strong');if(grouped)grouped.textContent='Anträge & Akte';
 more.remove();
 // Six fixed, predictable bottom destinations.
 dock.innerHTML=`
 <button data-goto="start" type="button" aria-label="Startseite öffnen"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v9H3z M9 20v-6h6v6"/></svg><span>Start</span></button>
 <button data-goto="lungenwerte" type="button" aria-label="Lungenfunktion öffnen"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 13h4l3-7 4 12 3-6h4"/></svg><span>Lunge</span></button>
 <button data-goto="kalender" type="button" aria-label="Kalender öffnen"><svg aria-hidden="true" viewBox="0 0 24 24"><rect height="16" rx="2" width="18" x="3" y="5"/><path d="M7 3v4m10-4v4M3 10h18"/></svg><span>Kalender</span></button>
 <button id="nav315-dock-combined" data-goto="antraege" type="button" aria-label="Anträge und Akte öffnen"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 3h10l4 4v14H5z M14 3v5h5 M8 12h8 M8 16h8"/></svg><span>Anträge<br>Akte</span></button>
 <button data-goto="labor" type="button" aria-label="Labor und Blutwerte öffnen"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 3h6 M10 3v6l-5 8a3 3 0 0 0 2.5 4h9a3 3 0 0 0 2.5-4l-5-8V3 M8 16h8"/></svg><span>Labor</span></button>
 <button data-goto="vitalwerte" data-nav315-bp="1" type="button" aria-label="Blutdruckmessungen öffnen"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.8 8c0 5-8.8 11-8.8 11S3.2 13 3.2 8a4.7 4.7 0 0 1 8.8-2.2A4.7 4.7 0 0 1 20.8 8Z"/><path d="M6 11h3l1.5-3 2 6 1.5-3H18"/></svg><span>Blutdruck</span></button>`;
 // Reuse the EXISTING blood-pressure form; do not duplicate medical entries.
 function selectBP(){const tab=document.querySelector('#v29-tabs button[data-kind="bp"]');if(tab)tab.click();}
 dock.querySelector('[data-nav315-bp]').addEventListener('click',()=>{setTimeout(selectBP,55);setTimeout(selectBP,250);});
 // Old links/bookmarks to 'Mehr' must not leave users on an empty page.
 function redirectLegacy(){if(location.hash==='#mehr')window.ASTHMA_NAV?.go('start');}
 redirectLegacy();window.addEventListener('hashchange',()=>setTimeout(redirectLegacy,0));
 window.ASTHMA_NAV315=Object.freeze({version:'3.1.5',searchOnStart:!!$('private-search20'),combinedRecords:!!$('nav315-dock-combined'),bpTabAvailable:()=>!!document.querySelector('#v29-tabs button[data-kind="bp"]')});
})();
