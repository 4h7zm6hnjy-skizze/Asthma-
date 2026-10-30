'use strict';
/* PneumoPro 3.6.0 – breite iPhone-Kopfzeile und umfassende lokale Akten-Suche.
 * Keine Netzwerkanfragen, erkannter und freigegebener OCR-Text wird mitgesucht.
 * Suchindex nur im Arbeitsspeicher der entsperrten Sitzung.
 */
(()=>{
 const S=window.ASTHMA_SECURITY,NAV=window.ASTHMA_NAV;
 const $=id=>document.getElementById(id);
 const panel=$('nav317-search-panel'),oldInput=$('private-search20'),oldResults=$('private-search-results20'),oldStatus=$('private-search-status20');
 if(!S||!NAV||!panel||!oldInput||!oldResults||!oldStatus||$('s360-style'))return;
 const css=document.createElement('style');css.id='s360-style';css.textContent=`
 /* Die Suchfläche bleibt vollständig im sichtbaren Bereich – auch bei Tastatur/Zoom. */
 #nav317-search-panel{position:fixed!important;left:12px!important;right:12px!important;top:var(--s360-panel-top,110px)!important;width:auto!important;max-width:none!important;max-height:var(--s360-panel-height,calc(100dvh - 130px))!important;overflow-y:auto!important;overflow-x:hidden!important;box-sizing:border-box!important;z-index:960!important;overscroll-behavior:contain!important}
 #nav317-search-panel .hub20-search,#nav317-search-panel .hub20-results,#nav317-search-panel #private-search20{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
 #nav317-search-panel #private-search20{font-size:16px!important}
 #nav317-search-panel .hub20-result{display:flex;flex-direction:column;align-items:stretch;gap:4px;padding:11px 12px;min-height:54px;overflow-wrap:anywhere}
 #nav317-search-panel .hub20-result small{font-size:12px;line-height:1.4}
 #nav317-search-panel .hub20-result .s360-preview{font-size:12px;color:#506b78;line-height:1.4;overflow-wrap:anywhere}
 #nav317-search-panel #private-search-status20{font-size:13px;line-height:1.5;overflow-wrap:anywhere}
 @media (max-width:740px){
  #secure-application header.topbar{height:auto!important;min-height:0!important;overflow:visible!important}
  #secure-application header.topbar .topbar-inner{display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:7px!important;min-height:0!important;height:auto!important;padding:9px 12px 10px!important;max-width:100%!important;box-sizing:border-box!important;overflow:visible!important}
  #secure-application header.topbar .topbar-inner>.brand{display:inline-flex!important;align-self:flex-start!important;align-items:center!important;flex:0 0 auto!important;min-width:0!important;max-width:100%!important;gap:8px!important;white-space:normal!important;overflow:visible!important}
  #secure-application header.topbar .topbar-inner>.brand .pneumo-brand-icon{display:block!important;flex:0 0 42px!important;width:42px!important;height:42px!important;max-width:42px!important;object-fit:contain!important;visibility:visible!important;opacity:1!important}
  #secure-application header.topbar .topbar-inner>.brand .pneumo-header-wordmark{display:block!important;max-width:calc(100vw - 95px)!important;min-width:0!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;font-size:clamp(19px,5vw,25px)!important;line-height:1.15!important}
  #secure-application header.topbar .topbar-inner>.top-actions{display:flex!important;flex-flow:row wrap!important;align-items:stretch!important;justify-content:flex-start!important;align-self:stretch!important;width:100%!important;max-width:100%!important;min-width:0!important;height:auto!important;gap:5px!important;overflow:visible!important}
  #secure-application #nav317-holder{order:1!important;margin:0!important;flex:0 1 auto!important;min-width:0!important}
  #secure-application #n332-open-top{order:2!important;flex:0 1 auto!important;min-width:0!important}
  #secure-application #ps352-open{order:3!important;flex:0 1 auto!important;min-width:67px!important;max-width:none!important}
  #secure-application #j358-open,#secure-application #j359-entry{order:4!important;flex:0 1 auto!important;min-width:91px!important;max-width:none!important}
  #secure-application #update-top{order:5!important;flex:0 0 auto!important;min-width:36px!important}
  #nav317-search-panel{left:max(9px,env(safe-area-inset-left))!important;right:max(9px,env(safe-area-inset-right))!important;padding:12px!important}
 }
 @media(max-width:375px){
  #secure-application header.topbar .topbar-inner{padding-left:8px!important;padding-right:8px!important}
  #secure-application header.topbar .topbar-inner>.top-actions{gap:4px!important}
  #secure-application #j358-open,#secure-application #j359-entry{font-size:12px!important;min-width:85px!important;padding:6px!important}
  #secure-application #ps352-open{font-size:12px!important;padding:6px!important}
 }
 @media print{#s360-style,#nav317-search-panel{display:none!important}}
 `;document.head.append(css);
 const clone=el=>{const newEl=el.cloneNode(true);el.replaceWith(newEl);return newEl};
 // Entfernt alte, eingeschränkte Eingabe-/Ergebnis-Listener ohne die Suche im Header auszutauschen.
 const input=clone(oldInput),results=clone(oldResults),status=clone(oldStatus);
 oldInput.value=''; // Alter Volltext-Handler darf keine weiteren Suchaktionen auslösen.
 input.setAttribute('aria-label','Alle lokal gespeicherten Daten und Dokumente durchsuchen');
 input.placeholder='Allergien, FEV1, Labor, Medikament, Dokument …';input.autocomplete='off';
 const expl=panel.querySelector('.hub20-search .input-note');
 if(expl)expl.textContent='Durchsucht alle lokal gespeicherten Akten- und Messwertdaten. Bilder und PDFs werden nach Freigabe ihres OCR-Textes durchsucht. Ohne Texterkennung sind nur Dateiname und Angaben durchsuchbar. Alle Suchvorgänge bleiben lokal.';
 const fold=s=>String(s??'').normalize('NFKC').toLocaleLowerCase('de-DE').replace(/ß/g,'ss').replace(/\s+/g,' ').trim();
 const groups=[
  ['profile','Patientenprofil','profil'],['cases','Anträge & Akte','akte'],['documents','Dokumente & Scans','akte'],
  ['diary','Tagebuch','akte'],['suite','Gesundheitswerte & Befunde','vitalwerte'],
  ['calendar','Kalender & Termine','kalender'],['labs','Labor & Blutwerte','labor'],
  ['epef','Peak-Flow','peakflow'],['au','Arbeitsunfähigkeit','arbeit'],['ampel','Auswertungen','bewertung']
 ];
 const kindPages={allergies355:'allergien',measurements:'lungenwerte',diffusion:'lungenwerte',weight292:'vitalwerte',vital29:'vitalwerte',walk342:'gehttest',meds:'therapie',sleep340:'schlaflabor',imaging343:'bildgebung',insurance325:'versicherung',stairs:'start',hospital:'kalender',nucala:'therapie'};
 const areaPages={allergy:'allergien',lufu:'lungenwerte',diff:'lungenwerte',lab:'labor',sputum:'labor',walk:'gehttest',sleep:'schlaflabor',ct:'bildgebung',clinic:'behandler',pulmo:'behandler',gp:'behandler',meds:'therapie',insurance:'versicherung',gdb:'antraege',work:'arbeit'};
 const ignored=new Set(['blob','data','base64','image','images','bytes','cipher','iv','salt','password','secret','token','signature','encryption','thumbnail']);
 const gather=(obj,depth=0)=>{
  if(obj==null||depth>7)return '';
  if(typeof obj==='string')return obj.slice(0,2200);
  if(typeof obj==='number'||typeof obj==='boolean')return String(obj);
  if(obj instanceof Blob||obj instanceof ArrayBuffer)return '';
  if(Array.isArray(obj))return obj.slice(0,250).map(x=>gather(x,depth+1)).join(' ').slice(0,36000);
  if(typeof obj!=='object')return '';
  const pairs=Object.entries(obj).filter(([k])=>!ignored.has(k.toLowerCase())).slice(0,100);
  return pairs.map(([k,v])=>k+' '+gather(v,depth+1)).join(' ').slice(0,48000);
 };
 const labelFor=(obj,group)=>{
  const item=obj?.value&&typeof obj.value==='object'?obj.value:obj;
  const main=[item?.allergen,item?.title,item?.name,item?.label,item?.marker,item?.testName,item?.finding,item?.type,obj?.type,obj?.kind,item?.kind].find(v=>typeof v==='string'&&v.length&&v.length<180);
  const day=[item?.date,item?.documentDate,obj?.date].find(v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v));
  return ((main||group)+(day?' · '+day.slice(8)+'.'+day.slice(5,7)+'.'+day.slice(0,4):'')).slice(0,175);
 };
 const targetFor=(group,row,fallback)=>{
  if(group==='suite')return kindPages[row?.type]||kindPages[row?.value?.type]||fallback;
  if(group==='documents')return areaPages[row.scanArea]||(/allerg/i.test(row.kind||'')?'allergien':/labor|blut/i.test(row.kind||'')?'labor':fallback);
  return fallback;
 };
 let index=null,busy=null,generation=0,serial=0,debounce=null;
 const message=s=>{status.textContent=s;};
 async function build(){
  if(!S.state().unlocked)throw Error('Zuerst die Gesundheitsakte entsperren.');
  if(index)return index;
  if(busy)return busy;
  const current=generation;
  busy=(async()=>{
   const found=[];
   const add=(title,category,page,body,source)=>{
    if(current!==generation||!S.state().unlocked)return;
    const text=String(body||'').slice(0,60000);
    found.push({title:String(title||category).slice(0,180),category,page,source,body:text,hay:fold(category+' '+title+' '+text)});
   };
   for(const [group,category,page] of groups){
    if(current!==generation||!S.state().unlocked)throw Error('Sitzung geändert; Suche erneut öffnen.');
    const rows=await S.list(group);
    for(const row of rows){
     const title=labelFor(row,category);
     const body=gather(row);
     // In JSON- und Text-Originaldateien dürfen die vorhandenen Textdaten ebenfalls gesucht werden.
     // PDFs/Fotos bleiben Bilder; nicht so tun, als sei deren Inhalt ausgelesen worden.
     let extra='';const blob=row.blob;
     if(group==='documents'&&blob instanceof Blob&&blob.size<=2*1024*1024&&/\.(?:json|txt)$/i.test(row.name||'')){
      try{extra=(await blob.text()).slice(0,30000)}catch{extra=''}
     }
     add(title,category,targetFor(group,row,page),body+' '+extra,group);
    }
   }
   const personal=S.profileGet?.();if(personal&&typeof personal==='object'&&Object.keys(personal).length){
    add('Patientenprofil','Patientenprofil','profil',gather(personal),'profile');
   }
   // Öffentliche, in die App eingebaute Wissensartikel und die verfügbaren Seiten ebenfalls berücksichtigen.
   for(const [name,array,page] of [['Wissen & Rechte',window.ASTHMA_ARTICLES,'wissen'],['Anträge & Leistungen',window.ASTHMA_APPLICATIONS,'antraege']]){
    if(Array.isArray(array))for(const item of array.slice(0,2000))add(item.title||item.name||name,name,page,gather(item),'articles');
   }
   const pages=new Set();
   document.querySelectorAll('[data-nav-page]').forEach(section=>{
    const page=section.dataset.navPage||'';if(!page||pages.has(page))return;pages.add(page);
    const h=section.querySelector('h1,h2,h3');if(h)add(h.textContent.trim(),'App-Bereich',page,section.getAttribute('aria-label')||h.textContent,'pages');
   });
   if(current!==generation||!S.state().unlocked)throw Error('Sitzung geändert; bitte erneut suchen.');
   index=found;return found;
  })();
  try{return await busy}finally{busy=null}
 }
 function snippet(row,query){
  const simple=row.body.replace(/\s+/g,' ').trim();
  const at=fold(simple).indexOf(query);
  if(at<0)return simple.slice(0,135)+(simple.length>135?' …':'');
  const from=Math.max(0,at-52);return (from?'… ':'')+simple.slice(from,from+175)+(simple.length>from+175?' …':'');
 }
 async function run(){
  const token=++serial,words=fold(input.value).split(' ').filter(Boolean),query=words.join(' ');
  results.replaceChildren();
  if(!S.state().unlocked){message('Gesundheitsakte gesperrt. Bitte anmelden.');return}
  if(query.length<2){message('Mindestens zwei Zeichen eingeben.');return}
  message('Suche alle lokalen Datengruppen …');
  try{
   const data=await build();if(token!==serial)return;
   let matched=0;
   for(const row of data){
    if(!words.every(w=>row.hay.includes(w)))continue;
    matched++;if(matched>90)continue;
    const b=document.createElement('button');b.type='button';b.className='hub20-result';
    const title=document.createElement('strong');title.textContent=row.title;
    const kind=document.createElement('small');kind.textContent=row.category+' · Bereich öffnen';
    b.append(title,kind);
    const preview=snippet(row,query);if(preview){const p=document.createElement('span');p.className='s360-preview';p.textContent=preview;b.append(p)}
    b.addEventListener('click',()=>{NAV.go(row.page);const close=$('nav317-search-close');close?.click()});results.append(b);
   }
   message(matched?matched+' Treffer in '+data.length+' durchsuchbaren Datensätzen und Themen'+(matched>90?' · erste 90 angezeigt':''):'Keine Treffer in den gespeicherten Text- und Messwertdaten. Fotos/PDFs sind über Name, Angaben und bestätigten OCR-Text durchsuchbar.');
  }catch(err){if(token===serial)message('Suche nicht verfügbar: '+(err?.message||'Fehler beim Lesen der Daten'))}
 }
 input.addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(run,200)});
 input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(debounce);run()}});
 window.addEventListener('asthma:secure-change',()=>{generation++;index=null;busy=null;if(!S.state().unlocked){results.replaceChildren();message('Gesundheitsakte gesperrt.');return}if(input.value.trim().length>=2){clearTimeout(debounce);debounce=setTimeout(run,320)}});
 const resizePanel=()=>{
  if(panel.hidden)return;
  const header=document.querySelector('#secure-application header.topbar');
  const bottom=header?.getBoundingClientRect().bottom||100;
  const viewport=window.visualViewport;const viewHeight=viewport?.height||window.innerHeight;
  const top=Math.max(8,Math.min(bottom+7,Math.max(8,viewHeight-130)));
  panel.style.setProperty('--s360-panel-top',top+'px');
  panel.style.setProperty('--s360-panel-height',Math.max(100,viewHeight-top-12)+'px');
 };
 $('nav317-search-action')?.addEventListener('click',()=>requestAnimationFrame(()=>{resizePanel();if(!panel.hidden)input.focus({preventScroll:true})}));
 input.addEventListener('focus',()=>requestAnimationFrame(resizePanel));
 window.addEventListener('resize',resizePanel);window.addEventListener('orientationchange',resizePanel);
 window.visualViewport?.addEventListener('resize',resizePanel);
 if(!panel.hidden)resizePanel();
 window.PNEUMOPRO_SEARCH360=Object.freeze({version:'3.6.0',groups:groups.map(x=>x[0]),searchGroups:groups.length});
})();
