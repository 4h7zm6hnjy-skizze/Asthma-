'use strict';
/* PneumoPro 3.7.4: Separate Ansicht fuer Spirometrie, Bodyplethysmographie und Diffusion.
   Ein Original-Upload, keine serverseitige Verarbeitung, keine Uebertragung personenbezogener Daten.
   Bestehende Speicherung in suite/measurements beziehungsweise suite/diffusion bleibt erhalten. */
(()=>{
  const $=id=>document.getElementById(id);
  const review=$('li365-review'),table=$('li365-table'),select=$('li365-type');
  if(!review||!table||!select||$('ls374'))return;
  const byGroup={
    spiro:new Set(['VC','VC_IN','FVCin','FVCEx','FVC','FEV1','FEV1_VC','FEV1_FVC','PEF','PIF','MEF25','MEF50','MEF75','MMEF75_25','FEF75']),
    body:new Set(['Rawtot','sRawtot','Rawin','Rawex','R_eff','sR_eff','FRCpleth','TGV','TLC','RV','RV_TLC']),
    diffusion:null
  };
  const names={spiro:'Spirometrie',body:'Bodyplethysmographie',diffusion:'Diffusionsmessung'};
  const kindOf=group=>group==='diffusion'?'diffusion':'measurements';
  const drafts=new Map();
  let group='spiro',opened=false,renderedKind=select.value;
  const host=document.createElement('section');host.id='ls374';
  const title=document.createElement('h4');title.textContent='Messwerte nach Untersuchungsart getrennt';host.append(title);
  const intro=document.createElement('p');intro.textContent='Einmal hochladen, die Werte je Verfahren kontrollieren. Spirometrie und Bodyplethysmographie gehoeren zum selben Lungenfunktionstest; Diffusionswerte werden separat gespeichert.';host.append(intro);
  const bar=document.createElement('div');bar.setAttribute('role','group');bar.setAttribute('aria-label','Untersuchungsart waehlen');bar.className='ls374-tabs';
  const buttons={};
  for(const id of ['spiro','body','diffusion']){
    const b=document.createElement('button');b.type='button';b.textContent=names[id];b.dataset.group=id;bar.append(b);buttons[id]=b;
  }
  host.append(bar);
  const explanation=document.createElement('p');explanation.id='ls374-hint';explanation.setAttribute('role','status');host.append(explanation);
  table.before(host);
  const css=document.createElement('style');css.textContent=`#ls374{padding:12px;margin:12px 0;border:1px solid #aacbd5;border-radius:12px;background:#f2f9fb;color:#123b52}#ls374 .ls374-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}#ls374 .ls374-tabs button{flex:1 1 135px;min-height:46px;background:white;color:#123b52;border:1px solid #7c9da9;border-radius:9px;font-weight:600}#ls374 .ls374-tabs button[aria-pressed="true"]{background:#123b52;color:white;border-color:#123b52}#ls374-hint{margin:7px 0;line-height:1.5;font-size:.9rem}`;document.head.append(css);
  function saveDraft(){
    const k=renderedKind;if(!['measurements','diffusion'].includes(k))return;
    const holder=drafts.get(k)||{};
    for(const tr of table.querySelectorAll('tr[data-code]')){
      const cells={};for(const input of tr.querySelectorAll('input[data-field]'))cells[input.dataset.field]=input.value;
      holder[tr.dataset.code]={cells,status:tr.dataset.status};
    }
    drafts.set(k,holder);
  }
  function restoreDraft(){
    const holder=drafts.get(select.value);if(!holder)return;
    for(const tr of table.querySelectorAll('tr[data-code]')){
      const d=holder[tr.dataset.code];if(!d)continue;
      for(const input of tr.querySelectorAll('input[data-field]'))if(Object.hasOwn(d.cells,input.dataset.field))input.value=d.cells[input.dataset.field];
      if(d.status==='manual')tr.dataset.status='manual';
    }
  }
  function show(){
    const k=kindOf(group),visible=k===select.value;
    let count=0;
    for(const tr of table.querySelectorAll('tr[data-code]')){
      const showRow=visible&&(group==='diffusion'||byGroup[group].has(tr.dataset.code));
      tr.hidden=!showRow;tr.style.display=showRow?'':'none';if(showRow)count++;
    }
    for(const id of Object.keys(buttons))buttons[id].setAttribute('aria-pressed',String(id===group));
    const note=k==='diffusion'?'Diffusionswerte werden als eigener Befund gespeichert. Wenn dieses Original mehrere Untersuchungen enthaelt, nach dem Speichern zur anderen Testart wechseln.':
      group==='spiro'?'Spirometrie: FEV1, VC/FVC, Flusswerte. Zum Speichern gehoeren auch die eingegebenen Body-Werte derselben Untersuchung.':
      'Bodyplethysmographie: TLC, RV, TGV und Widerstaende. Zum Speichern gehoeren auch die eingegebenen Spirometrie-Werte derselben Untersuchung.';
    explanation.textContent=note+(count?'':' Keine Zeilen sichtbar: Testart in den Messwertfeldern kontrollieren.');
    const h=table.querySelector('table');if(h)h.setAttribute('aria-label',names[group]+' – Messwerttabelle');
  }
  function choose(next){
    if(next===group&&select.value===kindOf(next)){show();return;}
    saveDraft();group=next;
    const kind=kindOf(group);
    if(select.value!==kind){select.value=kind;select.dispatchEvent(new Event('change',{bubbles:true}));}
    restoreDraft();show();
    const verified=$('li365-verified');if(verified)verified.checked=false;
  }
  for(const [id,b] of Object.entries(buttons))b.addEventListener('click',()=>choose(id));
  select.addEventListener('change',saveDraft,true); // Capture vor dem Redraw des bestehenden Importers.
  select.addEventListener('change',()=>{
    group=select.value==='diffusion'?'diffusion':group==='body'?'body':'spiro';
    restoreDraft();show();
  });
  new MutationObserver(()=>{renderedKind=select.value;restoreDraft();show();}).observe(table,{childList:true});
  new MutationObserver(()=>{
    if(!review.hidden&&!opened){opened=true;drafts.clear();group=select.value==='diffusion'?'diffusion':'spiro';show();}
    if(review.hidden)opened=false;
  }).observe(review,{attributes:true,attributeFilter:['hidden']});
  for(const id of ['li365-file','li365-doc'])$(id)?.addEventListener('change',()=>{drafts.clear();opened=false;},true);
  show();
  window.PNEUMOPRO_SPLIT374=Object.freeze({version:'3.7.4',modes:Object.keys(byGroup)});
})();
