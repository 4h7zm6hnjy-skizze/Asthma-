'use strict';
/* 3.2.5 – private Zusatzversicherung. Personal records/photos are never hosted as static assets.
   No network requests. After explicit local import all insurance data is encrypted by ASTHMA_SECURITY. */
(()=>{
 const S=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);
 const root=$('versicherung');if(!root||!S?.state?.().unlocked)return;
 const group='suite',prefix='ins325/',sections={gesundheit:'Gesundheitsbudget',sehhilfe:'Sehhilfe',zahn:'Zahnversicherung',krankenhaus:'Krankenhaus',paket:'Paketübersicht',datenschutz:'Datenschutz',vertrag:'Vertragsdaten',sonstige:'Sonstige'};
 const order=['gesundheit','sehhilfe','zahn','krankenhaus','paket','vertrag','datenschutz','sonstige'];
 let pending=null,records=[],currentYear=new Date().getFullYear(),busy=false,objectUrls=[];
 const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n);
 const node=(tag,txt,cl)=>{const e=document.createElement(tag);if(txt!==undefined&&txt!==null)e.textContent=String(txt);if(cl)e.className=cl;return e};
 const msg=(t,err=false)=>{const e=$('ins325-status');e.textContent=t;e.style.color=err?'#9a2832':'#18566e'};
 const key=id=>prefix+id;
 const row=(id,type,value)=>({key:key(id),type:'insurance325-'+type,value});
 const get=id=>records.find(r=>r.key===key(id))?.value||null;
 const save=async(id,type,value)=>S.put(group,row(id,type,value),key(id));
 const remove=async(id)=>S.del(group,key(id));
 const allDocs=()=>records.filter(r=>r.type==='insurance325-doc').map(r=>({...r.value,key:r.key}));
 const allClaims=()=>records.filter(r=>r.type==='insurance325-claim').map(r=>({...r.value,key:r.key}));
 const dmy=date=>/^\d{4}-\d{2}-\d{2}$/.test(date||'')?date.split('-').reverse().join('.'):'–';
 const fmtValue=v=>typeof v==='string'&&v.trim()?v.trim():'Noch nicht eingetragen';
 const policyDefaults={insurer:'Allianz Private Krankenversicherungs-AG',plan:'Betriebliche Krankenversicherung – Gesundheitspaket 2',premium:'Arbeitgeber übernimmt die Beiträge'};
 function policyRender(){const policy={...policyDefaults,...(get('policy')||{})},list=$('ins325-policy-view');list.replaceChildren();
  for(const [k,label] of [['insuredName','Versicherte Person'],['policyNumber','Versicherungsnummer'],['insurer','Versicherer'],['plan','Paket'],['premium','Beitrag'],['startDate','Beginn'],['agencyName','Ansprechpartner'],['agencyAddress','Anschrift'],['agencyWebsite','Website'],['agencyPhone','Telefon'],['agencyEmail','E-Mail'],['remarks','Hinweis']]){
   const r=node('div',null,'ins325-policy-row');r.append(node('span',label),node('strong',k==='startDate'&&policy[k]?dmy(policy[k]):fmtValue(policy[k])));list.append(r);
  }
  const form=$('ins325-policy-form');for(const i of form.querySelectorAll('[name]')){i.value=policy[i.name]||'';}
 }
 async function refresh(){records=(await S.list(group)).filter(r=>typeof r.key==='string'&&r.key.startsWith(prefix));policyRender();renderBudgets();renderGallery();}
 const yearSettings=()=>get('year-'+currentYear)||{};
 function renderBudgets(){const year=$('ins325-year');year.value=String(currentYear);$('ins325-double').checked=yearSettings().doubleConfirmed===true;
  const out=$('ins325-budgets');out.replaceChildren();const claims=allClaims().filter(x=>x.date.startsWith(String(currentYear)+'-'));
  for(const kind of ['gesundheit','sehhilfe']){
   const limit=yearSettings().doubleConfirmed?1200:600;
   const used=claims.filter(x=>x.kind===kind).reduce((s,x)=>s+Number(x.amount||0),0);
   const remaining=Math.max(0,limit-used);const wrapper=node('div',null,'ins325-budget');const head=node('div',null,'ins325-budget-head');head.append(node('strong',sections[kind]),node('span',money(remaining)+' offen von '+money(limit)));
   const bar=node('div',null,'ins325-meter'),filled=node('span');filled.style.width=Math.max(0,Math.min(100,100*used/limit))+'%';bar.append(filled);
   wrapper.append(head,bar,node('small','Erfasst erstattet: '+money(used)));out.append(wrapper);
  }
  const claimsOut=$('ins325-claim-list');claimsOut.replaceChildren();for(const claim of claims.sort((a,b)=>b.date.localeCompare(a.date))){
   const r=node('div',null,'ins325-item');r.append(node('span',dmy(claim.date)+' · '+sections[claim.kind]+' · '+money(Number(claim.amount))+(claim.note?' · '+claim.note:'')));
   const b=node('button','Entfernen','btn btn-text');b.type='button';b.onclick=async()=>{if(busy||!confirm('Diese Erstattung dauerhaft entfernen?'))return;busy=true;try{await remove('claim-'+claim.id);await refresh();msg('Erstattung entfernt.')}catch(e){msg(e.message,true)}finally{busy=false}};r.append(b);claimsOut.append(r);
  }
  if(!claims.length)claimsOut.append(node('p','Für dieses Jahr noch keine Erstattungen eingetragen.','ins325-muted'));
 }
 function docImage(doc){if(!(doc.blob instanceof Blob))return null;const url=URL.createObjectURL(doc.blob);objectUrls.push(url);return url;}
 function renderGallery(){objectUrls.forEach(u=>URL.revokeObjectURL(u));objectUrls=[];const gallery=$('ins325-doc-gallery');gallery.replaceChildren();const filtered=allDocs().filter(d=>$('ins325-doc-filter').value==='alle'||$('ins325-doc-filter').value===d.section)
  .sort((a,b)=>order.indexOf(a.section)-order.indexOf(b.section)||Number(a.order||0)-Number(b.order||0)||a.label.localeCompare(b.label,'de'));
  if(!filtered.length){gallery.append(node('p','In diesem Bereich sind noch keine Originale importiert. Lade deine private Versicherungsdatei einmalig hoch.','ins325-muted'));return;}
  for(const d of filtered){const card=node('article',null,'ins325-doc');card.append(node('h4',d.label),node('p',sections[d.section]+' · '+(d.documentDate||'Datum nicht dokumentiert')));if(d.repairNote)card.append(node('p','Hinweis: '+d.repairNote));
   const url=docImage(d);
   if(url){if(d.blob.type==='application/pdf'){
      const a=node('a','PDF öffnen (lokale Datei)');a.href=url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);
     }else{
      const thumb=node('img');thumb.src=url;thumb.alt='Vorschaubild: '+d.label;thumb.loading='lazy';card.append(thumb);
      const details=node('details');details.append(node('summary','Originalfoto groß anzeigen'));
      const im=node('img');im.src=url;im.alt=d.label;im.loading='lazy';details.append(im);card.append(details);
     }}
   const category=node('select');category.setAttribute('aria-label','Zuordnung von '+d.label+' ändern');for(const [val,label] of Object.entries(sections)){const o=node('option',label);o.value=val;category.append(o);}category.value=d.section;
   category.onchange=async()=>{if(busy)return;busy=true;try{await save('doc-'+d.id,'doc',{...d,section:category.value,key:undefined});await refresh();msg('Dokument neu zugeordnet.')}catch(e){msg(e.message,true)}finally{busy=false}};card.append(category);
   const actions=node('div',null,'ins325-controls');const rename=node('button','Umbenennen','btn btn-outline');rename.type='button';rename.onclick=async()=>{const label=prompt('Neue Dokumentbezeichnung:',d.label);if(label===null||!label.trim()||label.length>150)return;busy=true;try{await save('doc-'+d.id,'doc',{...d,label:label.trim(),key:undefined});await refresh();msg('Dokumentbezeichnung geändert.')}catch(e){msg(e.message,true)}finally{busy=false}};
   const del=node('button','Löschen','btn btn-text');del.type='button';del.onclick=async()=>{if(busy||!confirm('Originalfoto/PDF „'+d.label+'“ endgültig aus dem verschlüsselten Tresor löschen?'))return;busy=true;try{await remove('doc-'+d.id);await refresh();msg('Dokument gelöscht.')}catch(e){msg(e.message,true)}finally{busy=false}};
   if(d.originalBlob instanceof Blob){const originalLink=node('a','Unveränderte Originaldatei');const rawUrl=URL.createObjectURL(d.originalBlob);objectUrls.push(rawUrl);originalLink.href=rawUrl;originalLink.download=d.filename||'Allianz_Original.jpg';actions.append(originalLink);}actions.append(rename,del);card.append(actions);gallery.append(card);
  }
 }
 function decodeDataUrl(data){const m=/^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,([A-Za-z0-9+/=]+)$/.exec(data||'');if(!m)throw Error('Bilddatei ist nicht im erwarteten Format.');if(m[2].length>20*1024*1024)throw Error('Ein Bild ist zu groß.');const bytes=Uint8Array.from(atob(m[2]),c=>c.charCodeAt(0));if(bytes.byteLength>12*1024*1024)throw Error('Bild ist größer als 12 MB.');return new Blob([bytes],{type:m[1]})}
 function validate(p){if(!p||p.kind!=='Asthma-Privatversicherung-325'||p.schema!==1||!Array.isArray(p.documents)||p.documents.length<1||p.documents.length>50)throw Error('Ungültige private Versicherungsdatei.');
  if(!p.policy||typeof p.policy!=='object'||Array.isArray(p.policy))throw Error('Vertragsdaten fehlen.');
  const ids=new Set();for(const d of p.documents){if(typeof d.id!=='string'||!/^[a-z0-9-]{3,50}$/.test(d.id)||ids.has(d.id))throw Error('Ungültige oder doppelte Dokumentkennung.');ids.add(d.id);if(!sections[d.section]||typeof d.label!=='string'||d.label.length>150||!d.label||typeof d.data!=='string')throw Error('Ungültige Dokumentangaben: '+d.id);const m=/^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,/.exec(d.data);if(!m||d.data.length>18*1024*1024)throw Error('Das Originalfoto ist unlesbar oder zu groß: '+d.id);}
  return p;
 }
 $('ins325-import-file').addEventListener('change',async ev=>{
  pending=null;$('ins325-import-submit').disabled=true;const preview=$('ins325-import-preview');preview.textContent='';const file=ev.target.files?.[0];if(!file)return;
  try{if(file.size>30*1024*1024)throw Error('Importdatei größer als 30 MB.');pending=validate(JSON.parse(await file.text()));
   preview.textContent=pending.documents.length+' Originalfotos gefunden: '+order.filter(s=>pending.documents.some(d=>d.section===s)).map(s=>sections[s]+' ('+pending.documents.filter(d=>d.section===s).length+')').join(', ')+'. Vertragsdaten ebenfalls enthalten. Erst mit „Übernehmen“ werden Daten lokal verschlüsselt gespeichert.';
   $('ins325-import-submit').disabled=false;msg('Import geprüft. Kontrolliere die Zuordnung, dann übernehmen.');
  }catch(e){msg(e.message,true)}
 });
 $('ins325-import-submit').onclick=async()=>{
  if(!pending||busy)return;busy=true;const btn=$('ins325-import-submit');btn.disabled=true;let count=0,skipped=0;
  try{
   const existing=get('policy');if(existing){if(!confirm('Es existieren bereits persönliche Vertragsdaten. Sollen diese unverändert bleiben und fehlende Felder aus der Importdatei ergänzt werden?'))return;}
   const {documents,policy}=pending;
   const merged={...policyDefaults,...policy,...(existing||{})};
   for(const [k,v] of Object.entries(merged))if(typeof v!=='string')delete merged[k];
   if(JSON.stringify(existing||{})!==JSON.stringify(merged))await save('policy','policy',merged);
   for(const doc of documents){const old=await S.get('suite',key('doc-'+doc.id));if(old){skipped++;continue;}
    const blob=decodeDataUrl(doc.data);const originalBlob=doc.originalData?decodeDataUrl(doc.originalData):null;const value={id:doc.id,section:doc.section,label:doc.label,order:Math.max(1,Math.min(100,Number(doc.order)||1)),documentDate:doc.documentDate||'Datum unbekannt',filename:doc.filename||'',blob,originalBlob,repairNote:doc.repairNote||''};
    await save('doc-'+doc.id,'doc',value);count++;msg('Foto '+count+' / '+documents.length+' lokal verschlüsselt …');
   }
   pending=null;$('ins325-import-file').value='';$('ins325-import-preview').textContent='Import abgeschlossen. Persönliche Daten sind jetzt im Tresor. Bitte vollständiges Backup unter Einstellungen erstellen.';
   await refresh();msg(count+' Originaldokumente übernommen; '+skipped+' vorhandene unverändert.');
  }catch(e){await refresh();msg('Bisher '+count+' Bilder importiert. '+e.message+' Du kannst den Import wiederholen; bereits gespeicherte Kennungen werden übersprungen.',true)}
  finally{busy=false;btn.disabled=!pending;}
 };
 $('ins325-policy-form').onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;try{const f=e.currentTarget,old=get('policy')||{};const updates=Object.fromEntries([...f.querySelectorAll('[name]')].map(i=>[i.name,String(i.value||'').trim()]));await save('policy','policy',{...old,...updates});await refresh();msg('Vertragsdaten gespeichert.')}catch(err){msg(err.message,true)}finally{busy=false}};
 $('ins325-year').value=String(currentYear);
 $('ins325-year').addEventListener('change',()=>{const y=Number($('ins325-year').value);if(!Number.isInteger(y)||y<2020||y>2100){msg('Ungültiges Versicherungsjahr.',true);return}currentYear=y;renderBudgets()});
 $('ins325-double').onchange=async e=>{if(busy)return;const value=e.target.checked;if(value&&!confirm('Hat dir die Allianz die Verdopplung der beiden Budgets auf je 1.200 € für dieses Jahr bestätigt?')){e.target.checked=false;return;}
  busy=true;try{await save('year-'+currentYear,'year',{year:currentYear,doubleConfirmed:value});await refresh();msg('Budgeteinstellung gespeichert.')}catch(err){msg(err.message,true)}finally{busy=false}};
 $('ins325-claim-date').value=new Date().toLocaleDateString('en-CA');
 $('ins325-claim-form').onsubmit=async e=>{e.preventDefault();if(busy)return;const k=$('ins325-claim-kind').value,date=$('ins325-claim-date').value,amount=Number($('ins325-claim-amount').value),note=$('ins325-claim-note').value.trim();if(!['gesundheit','sehhilfe'].includes(k)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!(amount>0&&amount<=1200))return msg('Datum oder Erstattungsbetrag ungültig.',true);
  busy=true;try{const id=crypto.randomUUID();await save('claim-'+id,'claim',{id,kind:k,date,amount,note});currentYear=Number(date.slice(0,4));e.target.reset();$('ins325-claim-date').value=new Date().toLocaleDateString('en-CA');await refresh();msg('Erstattung lokal gespeichert.')}catch(err){msg(err.message,true)}finally{busy=false}};
 $('ins325-doc-filter').onchange=renderGallery;
 $('ins325-attach-form').onsubmit=async e=>{e.preventDefault();if(busy)return;const f=$('ins325-new-file').files?.[0],section=$('ins325-new-section').value,label=$('ins325-new-label').value.trim();if(!f||f.size>12*1024*1024||f.size===0||!['image/jpeg','image/png','image/webp','application/pdf'].includes(f.type)||!sections[section]||!label)return msg('Ungültiges Foto/PDF (max. 12 MB) oder fehlende Bezeichnung.',true);
  busy=true;try{const id=crypto.randomUUID();await save('doc-'+id,'doc',{id,section,label,order:allDocs().filter(d=>d.section===section).length+1,documentDate:'selbst hinzugefügt am '+dmy(new Date().toISOString().slice(0,10)),filename:f.name.slice(0,200),blob:f});e.target.reset();await refresh();msg('Datei lokal verschlüsselt gespeichert.')}catch(err){msg(err.message,true)}finally{busy=false}};
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite'&&!busy){clearTimeout(window.__ins325Refresh);window.__ins325Refresh=setTimeout(()=>refresh().catch(err=>msg(err.message,true)),250)}});
 refresh().catch(err=>msg('Versicherungsdaten nicht ladbar: '+err.message,true));
})();
