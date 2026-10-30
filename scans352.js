'use strict';
/* PneumoPro 3.5.3 – leicht erreichbarer Scanner-/Datei-Upload.
 * Originale verbleiben im lokalen verschluesselten Tresor, kein HTTP-Upload.
 * Werte werden NICHT unkontrolliert aus Bildern/PDFs als Messreihen uebernommen.
 */
(()=>{
 const S=window.ASTHMA_SECURITY, NAV=window.ASTHMA_NAV;
 const top=document.querySelector('.top-actions'),holder=document.getElementById('secure-application');
 if(!S?.state?.().unlocked||!NAV||!top||!holder||document.getElementById('ps352-open'))return;
 const $=id=>document.getElementById(id);
 const TYPES=[
  ['lufu','Lungenfunktion','Lungenfunktionstest','lungenwerte','FEV₁, FVC und weitere Messungen'],
  ['diff','Diffusionsmessung','Diffusionsmessung','lungenwerte','DLCO, KCO, VA'],
  ['walk','Gehtest / Blutgase','Gehtestbericht','gehttest','6-Minuten-Gehtest und BGA'],
  ['sleep','Schlaflabor','Schlaflaborbericht','schlaflabor','Schlafbefunde und Sauerstoff'],
  ['lab','Labor / Blutwerte','Bluttest','labor','Blutuntersuchungen und Spezialwerte'],
  ['sputum','Schleimtest / Sputum','Laborproben','labor','Kultur, PCR und Antibiogramm'],
  ['ct','Röntgen / CT / MRT','Bildgebung','bildgebung','Aufnahmen, Befunde und DICOM'],
  ['bronch','Bronchoskopie','Bronchoskopiebericht','befunde','Bronchoskopie, Gewebeproben'],
  ['hist','Pathologie / Zytologie','Pathologiebefund','labor','Histologie und Zelluntersuchungen'],
  ['gp','Hausarzt','Arztbrief','behandler','Arztbriefe und Befunde'],
  ['pulmo','Lungenarzt','Arztbrief','behandler','Pneumologische Untersuchung'],
  ['clinic','Krankenhaus','Entlassungsbericht','behandler','Stationäre Befunde und Berichte'],
  ['specialclinic','Fachkrankenhaus','Entlassungsbericht','behandler','Fachklinik und Rehabilitation'],
  ['meds','Medikamentenplan','Medikamentenplan','therapie','Verordnungen und Therapie'],
  ['reha','Reha / Anträge','Rehaunterlagen','antraege','Reha-Antrag, Bescheid, Abschlussbericht'],
  ['aids','Hilfsmittel','Hilfsmittelunterlagen','hilfen','Verordnung oder Versorgung'],
  ['insurance','Zusatzversicherung','Versicherungsunterlagen','versicherung','Police, Leistungsbescheid'],
  ['gdb','GdB / Gutachten','Gutachten','antraege','Bescheid, Befund und Gutachten'],
  ['work','Arbeit / AU','Arbeitsunterlagen','arbeit','AU, Arbeitgeber, BEM'],
  ['misc','Sonstige Befunde','Sonstiges','akte','Weitere medizinische Originale']
 ];
 const typeMap=new Map(TYPES.map(a=>[a[0],a]));
 const node=(tag,cl,text)=>{const e=document.createElement(tag);if(cl)e.className=cl;if(text!==undefined)e.textContent=text;return e;};
 const css=node('style');css.id='ps352-styles';css.textContent=`
 #ps352-open{border:2px solid #0f6e89;background:#106c87;color:#fff;border-radius:12px;font-weight:800;font-size:14px;line-height:1.2;font-family:inherit;min-height:43px;padding:7px 11px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:6px;flex:none;cursor:pointer}
 #ps352-open .ps352-icon{font-size:20px;font-weight:600}
 #ps352-open:hover,#ps352-open:focus-visible{background:#064a63}
 #ps352-dialog{border:0;border-radius:18px;box-shadow:0 20px 65px #08293b66;width:min(930px,calc(100vw - 20px));max-width:930px;max-height:min(94dvh,930px);height:auto;overflow:auto;overscroll-behavior:contain;background:#fff;color:#143b4d;padding:0;margin:auto}
 #ps352-dialog:not([open]){display:none}
 #ps352-dialog::backdrop{background:#082e44b8;backdrop-filter:blur(2px)}
 #ps352-dialog *{box-sizing:border-box}
 #ps352-dialog .ps352-head{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px;background:#0e5069;color:white;border-bottom:4px solid #3cb6c1}
 #ps352-dialog .ps352-head h2{font-size:22px;line-height:1.25;margin:0;color:white}
 #ps352-dialog .ps352-close{border:1px solid #9bccd8;border-radius:9px;background:#1d667c;color:white;font-size:24px;font-weight:800;min-height:44px;min-width:44px;cursor:pointer}
 #ps352-dialog .ps352-body{padding:15px 17px 25px}
 #ps352-dialog .ps352-intro{font-size:14px;color:#355d6d;line-height:1.48;margin:0 0 16px}
 #ps352-dialog h3{font-size:17px;margin:15px 0 10px;color:#17495d}
 #ps352-dialog .ps352-areas{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
 #ps352-dialog .ps352-area{background:#f2f8fa;color:#163f55;border:2px solid #d3e5ec;border-radius:12px;min-height:76px;padding:11px 12px;text-align:left;cursor:pointer;white-space:normal;line-height:1.3}
 #ps352-dialog .ps352-area strong{display:block;font-size:14px;font-weight:850}
 #ps352-dialog .ps352-area small{display:block;color:#537281;font-size:11px;line-height:1.5;margin-top:4px}
 #ps352-dialog .ps352-area[aria-pressed=true]{background:#dff4f7;border-color:#096f8b;box-shadow:inset 5px 0 #096f8b}
 #ps352-dialog .ps352-form{background:#f7fbfc;border:1px solid #c5dce4;border-radius:14px;padding:15px;margin-top:17px}
 #ps352-dialog .ps352-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
 #ps352-dialog label:not(.ps352-picker){display:flex;flex-direction:column;gap:6px;font-size:13px;color:#19495d;font-weight:800}
 #ps352-dialog input,#ps352-dialog textarea{font:inherit;width:100%;min-width:0;border:1px solid #adcbd6;color:#143b4c;border-radius:9px;background:white;padding:10px 11px;font-size:16px}
 #ps352-dialog .ps352-actions{display:flex;flex-wrap:wrap;gap:9px;margin:12px 0}
 #ps352-dialog .ps352-actions button,#ps352-dialog .ps352-picker{font-weight:800;font-size:14px;line-height:1.4;font-family:inherit;min-height:45px;border-radius:10px;border:1px solid #98c3d0;background:#e5f3f7;color:#124d62;display:inline-flex;align-items:center;justify-content:center;padding:11px 14px;cursor:pointer;white-space:normal;text-align:center}
 #ps352-dialog .ps352-actions .ps352-primary{background:#08637c;color:white;border-color:#08637c}
 #ps352-dialog .ps352-picker input{position:absolute;opacity:0;width:1px;height:1px;pointer-events:none;overflow:hidden}
 #ps352-dialog .ps352-note{font-size:12px;color:#587483;line-height:1.48;margin:8px 0}
 #ps352-dialog .ps352-files{margin:10px 0;padding:0;list-style:none;display:grid;gap:7px}
 #ps352-dialog .ps352-file{display:flex;gap:9px;align-items:center;justify-content:space-between;background:white;border:1px solid #d4e4eb;border-radius:9px;padding:9px 11px}
 #ps352-dialog .ps352-file span{overflow-wrap:anywhere;min-width:0;font-size:13px}
 #ps352-dialog .ps352-file button{flex:none;background:#f9ece9;color:#9b352b;border:0;border-radius:8px;padding:8px;min-height:40px}
 #ps352-dialog #ps352-status{background:#eaf5f8;border-left:4px solid #0e7087;padding:10px 12px;margin-top:12px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:13px;color:#173f53}
 #ps352-dialog #ps352-status.ps352-error{border-color:#b32834;background:#fff0f0;color:#8e2532}
 #ps352-dialog .ps352-saved{display:grid;gap:9px;margin-top:12px}
 #ps352-dialog .ps352-saved article{background:white;border:1px solid #d2e3e9;border-radius:10px;padding:11px;display:grid;gap:7px}
 #ps352-dialog .ps352-saved strong{font-size:13px;overflow-wrap:anywhere}
 #ps352-dialog .ps352-saved small{font-size:11px;color:#527180}
 #ps352-dialog .ps352-saved button{padding:9px 11px;border-radius:9px;border:1px solid #9cbfcf;color:#135267;background:#e9f5f8;font-weight:750}
 #ps352-dialog .ps352-saved img{display:block;width:100%;max-height:210px;object-fit:contain;border-radius:8px;background:#edf6f9}
 #ps352-dialog .ps352-viewer{margin-top:12px;padding:12px;border:2px solid #acd4e0;border-radius:12px;background:#fff}
 #ps352-dialog .ps352-viewer img{max-width:100%;width:auto;max-height:56dvh;object-fit:contain;display:block;margin:8px auto}
 #ps352-dialog .ps352-viewer iframe{display:block;width:100%;height:52dvh;border:1px solid #b3ccd4;border-radius:8px}
 #ps352-dialog .ps352-viewer button{min-height:40px;padding:8px 14px;border:1px solid #8ab7c5;border-radius:8px;background:#e7f4f7;color:#15465a;font-weight:800}
 #ps352-dialog .ps352-hidden{display:none!important}
 @media(max-width:640px){#ps352-dialog .ps352-areas{grid-template-columns:repeat(2,minmax(0,1fr))}#ps352-dialog .ps352-head{padding:12px 14px}#ps352-dialog .ps352-head h2{font-size:20px}}
   /* iPhone: Knopf nicht in der schmalen Kopfzeile abschneiden. */
  @media(max-width:560px){
    #secure-application header.topbar{height:auto!important;min-height:112px!important}
    #secure-application header.topbar .topbar-inner{height:auto!important;min-height:112px!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:center!important;gap:5px!important;padding-top:7px!important;padding-bottom:8px!important}
    #secure-application header.topbar .brand.a281-brand{align-self:flex-start!important;max-width:100%!important}
    #secure-application header.topbar .top-actions{width:100%!important;min-width:0!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:4px!important}
    #secure-application #ps352-open{display:inline-flex!important;visibility:visible!important;opacity:1!important;flex:1 1 auto!important;min-width:66px!important;min-height:43px!important;font-size:13px!important;padding:7px 9px!important}
    #secure-application #nav317-holder{min-width:0!important}
    #secure-application #n332-open-top{flex-shrink:0!important}
    #secure-application header.topbar #update-top{flex-shrink:0!important}
  }
@media(max-width:430px){#ps352-open{font-size:12px;padding:6px 8px;min-height:40px;gap:3px}#ps352-open .ps352-icon{font-size:17px}header.topbar .a281-brand-wordmark{width:112px}header.topbar .topbar-inner{gap:3px;padding-left:9px;padding-right:9px}header.topbar .top-actions{gap:2px}#nav317-search-action{padding:0 6px!important;font-size:12px!important}#nav317-search-action svg{width:15px!important}#n332-open-top{min-width:58px!important;padding:5px 5px!important;gap:3px!important;font-size:12px!important}#n332-open-top .n332-bars{font-size:16px}header.topbar #update-top{padding:5px 5px!important;min-width:25px!important}#ps352-dialog .ps352-body{padding:12px}#ps352-dialog .ps352-areas{gap:8px}#ps352-dialog .ps352-area{padding:10px;min-height:73px}#ps352-dialog .ps352-area strong{font-size:13px}#ps352-dialog .ps352-grid{grid-template-columns:1fr}}
 @media(max-width:375px){header.topbar .a281-brand-wordmark{width:101px}header.topbar .topbar-inner{gap:2px;padding-left:6px;padding-right:6px}#nav317-search-action span{display:none!important}#nav317-search-action{min-width:39px!important;padding:5px!important}}
 @media(max-width:355px){#ps352-open{font-size:11px;padding:5px}#ps352-dialog .ps352-areas{grid-template-columns:1fr}}
 @media print{#ps352-open,#ps352-dialog{display:none!important}}
 `;document.head.append(css);
 const trigger=node('button','', '');trigger.id='ps352-open';trigger.type='button';trigger.setAttribute('aria-label','Scans und Uploads für alle Bereiche öffnen');trigger.setAttribute('aria-haspopup','dialog');trigger.innerHTML='<span class="ps352-icon" aria-hidden="true">▣</span><span>Scans</span>';
 const search=$('nav317-holder'),menu=$('n332-open-top');
 top.insertBefore(trigger,search||menu||top.firstChild);
 // If the sidebar finishes initialising after this module, preserve the intended
 // order: Scans, Suchen, Menü, Update. No existing button is removed.
 let arrangeAttempts=0;const arrangeTimer=setInterval(()=>{
  const srch=$('nav317-holder'),nav=$('n332-open-top');
  if(srch?.parentNode===top&&nav?.parentNode===top){top.insertBefore(srch,nav);top.insertBefore(trigger,srch);clearInterval(arrangeTimer)}
  else if(++arrangeAttempts>=30)clearInterval(arrangeTimer);
 },120);
 const dialog=document.createElement('dialog');dialog.id='ps352-dialog';dialog.setAttribute('aria-labelledby','ps352-title');
 dialog.innerHTML=`<div class="ps352-head"><h2 id="ps352-title">Scans & Dokumente hochladen</h2><button type="button" id="ps352-close" class="ps352-close" aria-label="Fenster schließen">×</button></div>
 <div class="ps352-body"><p class="ps352-intro">Wähle zuerst den medizinischen Bereich. Danach kannst du Fotos, PDFs und andere Originaldateien direkt auf deinem iPhone auswählen oder fotografieren. Die Originale werden <strong>nur verschlüsselt in PneumoPro gespeichert</strong>.</p>
 <h3>1. Wohin gehört der Befund?</h3><div class="ps352-areas" id="ps352-areas" role="group" aria-label="Bereich für Dokumente auswählen"></div>
 <form id="ps352-form" class="ps352-form"><h3>2. Dateien auswählen</h3><p class="ps352-note" id="ps352-selected">Noch kein Bereich gewählt.</p>
 <div class="ps352-actions"><label class="ps352-picker" for="ps352-file">▤ Dateien / PDFs wählen<input id="ps352-file" name="files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.tif,.tiff,.dcm,.dicom,.ima,.zip,.doc,.docx,.txt,application/pdf,image/*"></label><label class="ps352-picker" for="ps352-camera">▣ Foto mit Kamera<input id="ps352-camera" type="file" accept="image/*" capture="environment"></label></div>
 <ul class="ps352-files" id="ps352-files" aria-label="Ausgewählte Dateien"></ul>
 <h3>3. Dokument zuordnen</h3><div class="ps352-grid"><label>Datum des Befunds<input id="ps352-date" type="date"></label><label>Krankenhaus / Praxis (optional)<input id="ps352-clinic" type="text" maxlength="180" placeholder="z. B. Kloster Grafschaft"></label><label>Arzt (optional)<input id="ps352-doctor" type="text" maxlength="150" placeholder="Name laut Befund"></label><label>Kurze Beschreibung (optional)<input id="ps352-note" type="text" maxlength="230" placeholder="z. B. Lungenfunktion Kontrolle"></label></div>
 <p class="ps352-note">Maximal 8 Dateien und insgesamt 64 MB je Vorgang. Fotos und PDFs bis 12 MB, DICOM/ZIP bis 32 MB. ZIP- und DICOM-Dateien werden als Original archiviert; zur Bildreihenanzeige den Röntgen-/CT-Bereich öffnen. Medizinische Werte aus Scans bitte gesondert prüfen.</p>
 <div class="ps352-actions"><button class="ps352-primary" id="ps352-save" type="submit">Originale verschlüsselt speichern</button><button id="ps352-go" type="button">Zum ausgewählten Bereich</button><button type="button" id="ps352-archive">Meine Akte öffnen</button></div>
 </form><p id="ps352-status" role="status" aria-live="polite">Wähle einen Bereich und mindestens eine Datei.</p>
 <div id="ps352-saved" class="ps352-saved" aria-label="Zuletzt hochgeladene Dateien"></div>
 <section id="ps352-viewer" class="ps352-viewer" hidden aria-label="Originaldatei ansehen"><strong id="ps352-viewer-name"></strong><div id="ps352-viewer-body"></div><button id="ps352-viewer-close" type="button">Vorschau schließen</button></section></div>`;
 holder.append(dialog);
 const areas=$('ps352-areas'),form=$('ps352-form'),fileInput=$('ps352-file'),cam=$('ps352-camera'),list=$('ps352-files'),status=$('ps352-status'),saved=$('ps352-saved');
 let current='',queue=[],busy=false,previewUrl='';
 const prettySize=size=>size<1048576?(size/1024).toFixed(0)+' KB':(size/1048576).toFixed(1)+' MB';
 for(const [id,label,kind,page,description] of TYPES){const b=node('button','ps352-area');b.type='button';b.dataset.ps352Area=id;b.setAttribute('aria-pressed','false');b.append(node('strong','',label),node('small','',description));b.addEventListener('click',()=>select(id));areas.append(b)}
 function say(s,isError=false){status.textContent=s;status.classList.toggle('ps352-error',isError)}
 function select(id){if(busy)return;const t=typeMap.get(id);if(!t)return;current=id;areas.querySelectorAll('[data-ps352-area]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ps352Area===id)));$('ps352-selected').textContent='Ausgewählt: '+t[1]+' – '+t[4];say('Bereit für '+t[1]+'. Fotos und PDFs werden als Originale archiviert.');}

 const allowed=/\.(?:pdf|jpe?g|png|webp|heic|heif|tiff?|dcm|dicom|ima|zip|docx?|txt)$/i;
 function maxSize(f){return /\.(dcm|dicom|ima|zip)$/i.test(f.name)?32*1048576:12*1048576}
 function preview(){list.replaceChildren();for(const [i,f] of queue.entries()){const item=node('li','ps352-file'),label=node('span','',f.name+' · '+prettySize(f.size)),b=node('button','','Entfernen');b.type='button';b.addEventListener('click',()=>{if(busy)return;queue.splice(i,1);preview()});item.append(label,b);list.append(item)};if(!queue.length)list.append(node('li','ps352-note','Noch keine Datei ausgewählt.'))}
 function enqueue(files){if(busy)return;const newFiles=Array.from(files||[]),errors=[];let total=queue.reduce((n,f)=>n+f.size,0);for(const f of newFiles){if(!allowed.test(f.name)){errors.push(f.name+': nicht unterstütztes Format');continue}if(!f.size||f.size>maxSize(f)){errors.push(f.name+': Datei zu groß oder leer');continue}if(queue.length>=8){errors.push('Maximal 8 Dateien je Upload');break}if(total+f.size>64*1048576){errors.push('Maximal 64 MB insgesamt je Upload. Bitte weniger Dateien wählen.');continue}if(queue.some(q=>q.name===f.name&&q.size===f.size&&q.lastModified===f.lastModified))continue;queue.push(f);total+=f.size}preview();if(errors.length)say(errors.join('\n'),true);else say(queue.length+' Datei(en) bereit. Tippe auf „Originale verschlüsselt speichern“.')}
 for(const input of [fileInput,cam])input.addEventListener('change',()=>{enqueue(input.files);input.value=''});
 const date=()=>{const t=new Date();return [t.getFullYear(),String(t.getMonth()+1).padStart(2,'0'),String(t.getDate()).padStart(2,'0')].join('-')};$('ps352-date').value=date();
 const uid=()=>crypto.randomUUID?.()||('s352-'+Date.now()+'-'+Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>n.toString(16).padStart(2,'0')).join(''));
 function openOriginal(row){if(!(row.blob instanceof Blob)){say('Original ist nicht lesbar.',true);return;}if(row.kind==='Bildgebung'&&/\.(dcm|dicom|ima)$/i.test(row.name)&&window.ASTHMA_IMAGING343_OPEN){window.ASTHMA_IMAGING343_OPEN(row);return}const u=URL.createObjectURL(row.blob);const a=document.createElement('a');a.href=u;a.download=row.name||'Medizinischer_Befund';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000)}
 let viewUrls=[];
 function closePreview(){const target=$('ps352-viewer');target.hidden=true;$('ps352-viewer-body').replaceChildren();if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl='';}}
 function showPreview(row){if(!(row.blob instanceof Blob)){say('Originaldatei kann nicht geladen werden.',true);return;}
  const mime=row.mime||'',name=row.name||'Originaldatei';closePreview();const target=$('ps352-viewer'),body=$('ps352-viewer-body');$('ps352-viewer-name').textContent=name;
  if(/^image\/(jpeg|png|webp|gif|heic|heif)$/.test(mime)||/\.(jpe?g|png|webp|gif|heic|heif)$/i.test(name)){const image=node('img');previewUrl=URL.createObjectURL(row.blob);image.src=previewUrl;image.alt='Originalbild: '+name;body.append(image)}
  else if(mime==='application/pdf'||/\.pdf$/i.test(name)){const frame=node('iframe');previewUrl=URL.createObjectURL(row.blob);frame.src=previewUrl;frame.title='PDF-Vorschau: '+name;body.append(frame)}
  else if(row.kind==='Bildgebung'&&window.ASTHMA_IMAGING343_OPEN){window.ASTHMA_IMAGING343_OPEN(row);return}
  else {say('Für dieses Dateiformat gibt es keine direkte Vorschau. Du kannst das Original speichern und mit einer geeigneten App öffnen.');return}
  target.hidden=false;target.scrollIntoView({behavior:'smooth',block:'nearest'});
 }
 function showSaved(rows){saved.replaceChildren();closePreview();if(!rows.length)return;saved.append(node('h3','','Zuletzt gespeichert'));for(const row of rows){const card=node('article'),header=node('strong','',row.name),detail=node('small','',(typeMap.get(row.scanArea)?.[1]||row.kind)+' · '+(row.documentDate||'ohne Datum')+' · '+prettySize(row.size)),actions=node('div','ps352-actions'),view=node('button','','Ansehen'),download=node('button','','Original speichern');view.type=download.type='button';view.addEventListener('click',()=>showPreview(row));download.addEventListener('click',()=>openOriginal(row));actions.append(view,download);card.append(header,detail,actions);saved.append(card)}}

 async function save(e){e.preventDefault();if(busy)return;if(!S.state().unlocked){say('Bitte zuerst den privaten Tresor entsperren.',true);return}if(!current){say('Bitte zuerst oben einen medizinischen Bereich wählen.',true);return}if(!queue.length){say('Bitte zuerst mindestens ein Foto oder eine Datei wählen.',true);return}busy=true;const btn=$('ps352-save');btn.disabled=true;let ok=[],errors=[];try{const t=typeMap.get(current),clinic=$('ps352-clinic').value.trim().slice(0,180),doctor=$('ps352-doctor').value.trim().slice(0,150),note=$('ps352-note').value.trim().slice(0,230),day=$('ps352-date').value;const iso= /^\d{4}-\d\d-\d\d$/.test(day)?day:'';const existing=await S.list('documents');for(const f of queue){try{if(existing.some(x=>x.kind===t[2]&&x.name===f.name&&x.size===f.size&&x.documentDate===iso&&String(x.clinic||'')===clinic)){errors.push(f.name+': bereits vorhanden (Duplikat ausgelassen)');continue}const id=uid();const record={id,kind:t[2],scanArea:t[0],name:f.name.slice(0,180),size:f.size,mime:f.type||'application/octet-stream',blob:f,clinic,providerName:clinic,doctor,documentDate:iso,note,source:'scans352',createdAt:new Date().toISOString(),caseId:''};await S.put('documents',record,id);const verified=await S.get('documents',id);if(!(verified?.blob instanceof Blob)||verified.blob.size!==f.size)throw Error('Datei konnte nach dem Speichern nicht überprüft werden');ok.push(verified);existing.push(verified)}catch(err){errors.push(f.name+': '+(err?.message||err))}}queue=[];preview();showSaved(ok);say(ok.length+' Originaldatei(en) verschlüsselt gespeichert.'+(errors.length?'\n'+errors.join('\n'):'') ,!ok.length);if(ok.length)window.dispatchEvent(new CustomEvent('pneumopro:scan-saved',{detail:{count:ok.length,area:current}}));}catch(err){say('Speichern fehlgeschlagen: '+(err?.message||err),true)}finally{busy=false;btn.disabled=false}}
 form.addEventListener('submit',save);
 function close(){if(busy){say('Dateien werden gespeichert. Bitte den Vorgang zuerst abschließen.');return;}closePreview();if(dialog.open)dialog.close();trigger.focus({preventScroll:true})}
 function open(){if(!S.state().unlocked){alert('Bitte zuerst die Gesundheitsakte entsperren.');return;}if(!dialog.open)dialog.showModal();$('ps352-file')?.focus({preventScroll:true})}
 trigger.addEventListener('click',open);$('ps352-close').addEventListener('click',close);
 dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
 $('ps352-viewer-close').addEventListener('click',closePreview);
 $('ps352-go').addEventListener('click',()=>{const dest=typeMap.get(current)?.[3]||'dateien';close();NAV.go(dest)});
 $('ps352-archive').addEventListener('click',()=>{close();NAV.go('akte');document.querySelector('.my-tab[data-my-tab="documents"]')?.click()});
 preview();window.__PNEUMOPRO_SCANS352=Object.freeze({version:'3.5.3',areas:TYPES.map(t=>t[0]),maxFiles:8});
})();
