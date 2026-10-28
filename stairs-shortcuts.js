/* Asthma 3.2.1 — lokale Kurzbefehl-Übergabe, keine Netzwerkübertragung. */
(function () {
 'use strict';
 const COUNTS=[15,17,30,90];
 function parse(input) {
  let raw=String(input||'').trim();
  if(raw.includes('#treppen='))raw=decodeURIComponent(raw.split('#treppen=')[1]);
  if(raw.length>500)throw Error('Der Übergabetext ist zu lang.');
  const parts=raw.split('|');
  if(parts.length!==5||parts[0]!=='AT1')throw Error('Bitte einen vollständigen Treppen-Übergabetext einfügen.');
  const [,stamp,nonce,n,reason]=parts;
  if(!/^20\d{12}$/.test(stamp)||!/^\d{6}$/.test(nonce)||!COUNTS.includes(Number(n))||String(Number(n))!==n)throw Error('Ungültige Treppenanzahl oder Eintragskennung.');
  const date=stamp.slice(0,4)+'-'+stamp.slice(4,6)+'-'+stamp.slice(6,8),time=stamp.slice(8,10)+':'+stamp.slice(10,12);
  const check=new Date(date+'T'+time+':'+stamp.slice(12,14));
  if(!Number.isFinite(+check)||check.getFullYear()!==Number(stamp.slice(0,4))||check.getMonth()+1!==Number(stamp.slice(4,6))||check.getDate()!==Number(stamp.slice(6,8))||check.getHours()!==Number(stamp.slice(8,10))||check.getMinutes()!==Number(stamp.slice(10,12))||check.getSeconds()!==Number(stamp.slice(12,14)))throw Error('Ungültiges Erfassungsdatum.');
  if(!reason.trim()||reason!==reason.trim()||reason.length>120||/[\x00-\x1f<>]/.test(reason))throw Error('Bitte einen gültigen Grund angeben.');
  return {id:'shortcut-'+stamp+'-'+nonce,date,time,steps:Number(n),reason,shift:'',symptoms:'',note:''};
 }
 if(typeof module==='object'&&module.exports){module.exports={parse,COUNTS};return;}
 const $=id=>document.getElementById(id);
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
 let pending='',requested=false,ready=false,dialog,stage,total,status,item=null,busy=false,gateBox;
 function capture(){
  if(location.hash==='#treppen-schnell'){requested=true;if(ready)open();}
  else if(location.hash.startsWith('#treppen=')){
   requested=true;try{pending=decodeURIComponent(location.hash.slice(9));}catch{pending='UNGÜLTIG';}
   if(ready)open();else showGate();
  }
 }
 function showGate(){
  if(!pending||gateBox)return;
  gateBox=el('aside');gateBox.className='tq-gate';
  gateBox.append(el('strong','Treppeneintrag wartet auf Bestätigung'),el('p','Entsperre deinen vorhandenen Tresor. Falls deine Daten nur in der Home-Bildschirm-App liegen: keinen neuen Tresor anlegen. Kopiere den Text und füge ihn dort unter „Treppen-Schnellauswahl“ ein.'));
  const text=el('textarea');text.value=pending;text.readOnly=true;text.setAttribute('aria-label','Treppen-Übergabetext');gateBox.append(text);
  const copy=el('button','Übergabetext kopieren');copy.type='button';copy.onclick=async()=>{try{await navigator.clipboard.writeText(text.value);copy.textContent='Kopiert – bestehende App öffnen';}catch{text.focus();text.select();copy.textContent='Text markieren und kopieren';}};gateBox.append(copy);
  $('secure-gate')?.prepend(gateBox);
 }
 function setStatus(s){status.textContent=s;}
 async function updateTotal(){
  try{const rows=await window.ASTHMA_SECURITY.list('suite');total.textContent=rows.filter(r=>r.type==='stairs'&&r.value?.date===today()).reduce((s,r)=>s+(Number(r.value.steps)||0),0).toLocaleString('de-DE')+' Stufen heute';}
  catch{total.textContent='Tagesgesamtzahl konnte nicht geladen werden.';}
 }
 function button(label,fn){const b=el('button',label);b.type='button';b.onclick=fn;return b;}
 function reset(){item=null;stage.replaceChildren();setStatus('');}
 function chooseCount(){reset();stage.append(el('h3','1 · Treppenanzahl wählen'));
  const row=el('div');row.className='tq-counts';COUNTS.forEach(n=>row.append(button(n+' Stufen',()=>chooseReason(n))));stage.append(row);
  const details=el('details'),summary=el('summary','Eintrag aus Kurzbefehl einfügen');details.append(summary);
  const field=el('textarea');field.id='tq-transfer';field.placeholder='AT1|…';field.setAttribute('aria-label','Übergabetext aus Kurzbefehle');details.append(field,button('Eintrag prüfen',()=>preview(field.value)));stage.append(details);
 }
 function chooseReason(n){reset();stage.append(el('h3','2 · Grund für '+n+' Stufen wählen'));
  const reasons=[...$('sc-reason').options].filter(o=>o.value!=='__custom__').map(o=>o.value);
  const list=el('div');list.className='tq-reasons';
  const select=reason=>{const d=new Date(),stamp=[d.getFullYear(),d.getMonth()+1,d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds()].map((v,i)=>i?String(v).padStart(2,'0'):String(v)).join('');const nums=crypto.getRandomValues(new Uint32Array(1));preview('AT1|'+stamp+'|'+(100000+nums[0]%900000)+'|'+n+'|'+reason);};
  reasons.forEach(r=>list.append(button(r,()=>select(r))));stage.append(list);
  const label=el('label','Anderer Grund');const custom=el('input');custom.maxLength=120;label.append(custom);stage.append(label,button('Eigenen Grund übernehmen',()=>select(custom.value.trim())),button('Zurück zur Anzahl',chooseCount));
 }
 function preview(raw){
  try{item=parse(raw);}catch(e){setStatus(e.message);return;}
  stage.replaceChildren();setStatus('');stage.append(el('h3','Eintrag bestätigen'),el('p',item.steps+' Stufen · '+item.reason),el('p','Erfasst am '+item.date.split('-').reverse().join('.')+' um '+item.time+' Uhr'));
  stage.append(el('p','Datum und Uhrzeit dienen nur der Zuordnung. Es wird keine Dauer gemessen. Beschwerden und Schicht bleiben ohne Angabe.'));
  const save=button('In diesem Tresor speichern',()=>saveItem(save));save.id='tq-save';stage.append(save,button('Andere Auswahl',chooseCount));
 }
 async function saveItem(b){
  if(busy||!item)return;busy=true;b.disabled=true;
  const record={...item};
  try{
   const S=window.ASTHMA_SECURITY;if(!S.state().unlocked)throw Error('Bitte den Tresor erneut entsperren.');
   const key='stairs/'+record.id,existing=await S.get('suite',key);
   if(existing){
    if(existing.value.steps!==record.steps||existing.value.reason!==record.reason)throw Error('Diese Kennung gehört bereits zu einem anderen Eintrag. Bitte den Kurzbefehl neu starten.');
    setStatus('Dieser Eintrag ist bereits gespeichert. Er wurde nicht doppelt gezählt.');
   }else{
    const now=new Date().toISOString();await S.put('suite',{key,type:'stairs',value:{...record,createdAt:now,updatedAt:now}},key);
    setStatus(record.steps+' Stufen · '+record.reason+' gespeichert.');
   }
   pending='';gateBox?.remove();gateBox=null;
   if(location.hash.startsWith('#treppen'))history.replaceState(null,'',location.pathname+location.search);
   stage.replaceChildren(button('Weiteren Eintrag erfassen',chooseCount));item=null;await updateTotal();await window.ASTHMA_STAIRS?.refresh();
  }catch(e){setStatus('Nicht gespeichert: '+e.message);b.disabled=false;}finally{busy=false;}
 }
 function open(){
  if(!ready)return;updateTotal();chooseCount();if(pending)preview(pending);
  if(!dialog.open)dialog.showModal();
 }
 function mount(){
  if(ready||!$('sc-work-panel')||!document.documentElement.classList.contains('app-unlocked'))return;
  ready=true;dialog=el('dialog');dialog.id='tq-dialog';dialog.setAttribute('aria-labelledby','tq-title');
  const title=el('h2','Treppen-Schnellauswahl');title.id='tq-title';total=el('p');total.className='tq-total';stage=el('div');status=el('p');status.id='tq-status';status.setAttribute('role','status');
  dialog.append(title,total,stage,status,button('Schließen',()=>{if(!busy)dialog.close();}));dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});$('secure-application').append(dialog);
  const panel=el('section');panel.className='tq-panel';panel.append(el('h4','Treppen-Schnellauswahl'),button('Anzahl und Grund wählen / Eintrag einfügen',open));
  const help=el('a','Kurzbefehl am iPhone einrichten');help.href='./KURZBEFEHLE_ANLEITUNG.html';help.target='_blank';help.rel='noopener';panel.append(help);
  const linkLabel=el('label','Dein Link für den einfachen Kurzbefehl');const linkField=el('input');linkField.type='url';linkField.readOnly=true;linkField.value=new URL('./',location.href).href+'#treppen-schnell';linkLabel.append(linkField);panel.append(linkLabel,button('Kurzbefehl-Link kopieren',async()=>{try{await navigator.clipboard.writeText(linkField.value);}catch{linkField.focus();linkField.select();}}));
  $('sc-work-panel').prepend(panel);
  const home=$('sc-home-tile');if(home)home.append(button('Schnellauswahl',open));
  if(requested)open();
 }
 function init(){capture();new MutationObserver(mount).observe(document.documentElement,{attributes:true,attributeFilter:['class']});mount();}
 window.addEventListener('hashchange',capture);
 document.addEventListener('visibilitychange',()=>{if(ready&&dialog.open&&!document.hidden)updateTotal();});
 window.addEventListener('asthma:secure-change',e=>{if(ready&&dialog.open&&e.detail?.group==='suite')updateTotal();});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
