'use strict';
/* PneumoPro 3.5.8 – JSON sofort sichtbar, Import mit Prüfung und manueller Bestätigung.
 * Kein Netzwerkzugriff und kein ungeprüfter Messwertimport. */
(()=>{
 const S=window.ASTHMA_SECURITY,NAV=window.ASTHMA_NAV,$=id=>document.getElementById(id);
 const top=document.querySelector('.top-actions'),host=$('secure-application');
 if(!S?.state?.().unlocked||!NAV||!top||!host||$('j358-open'))return;
 const CATEGORIES=[
  ['lufu','Lungenfunktion','Lungenfunktionstest','lungenwerte'],
  ['diff','Diffusionsmessung','Diffusionsmessung','lungenwerte'],
  ['walk','Gehtest / Blutgase','Gehtestbericht','gehttest'],
  ['sleep','Schlaflabor','Schlaflaborbericht','schlaflabor'],
  ['lab','Labor / Blutwerte','Bluttest','labor'],
  ['allergy','Allergien & Allergietests','Allergiebefund','allergien'],
  ['sputum','Schleimtest / Sputum','Laborproben','labor'],
  ['ct','Röntgen / CT / MRT','Bildgebung','bildgebung'],
  ['bronch','Bronchoskopie','Bronchoskopiebericht','befunde'],
  ['hist','Pathologie / Zytologie','Pathologiebefund','labor'],
  ['gp','Hausarzt','Arztbrief','behandler'],
  ['pulmo','Lungenarzt','Arztbrief','behandler'],
  ['clinic','Krankenhaus','Entlassungsbericht','behandler'],
  ['specialclinic','Fachkrankenhaus','Entlassungsbericht','behandler'],
  ['meds','Medikamentenplan','Medikamentenplan','therapie'],
  ['reha','Reha / Anträge','Rehaunterlagen','antraege'],
  ['aids','Hilfsmittel','Hilfsmittelunterlagen','hilfen'],
  ['insurance','Zusatzversicherung','Versicherungsunterlagen','versicherung'],
  ['gdb','GdB / Gutachten','Gutachten','antraege'],
  ['work','Arbeit / AU','Arbeitsunterlagen','arbeit'],
  ['misc','Sonstige Befunde','Sonstiges','akte']
 ];
 const create=(tag,cl,text)=>{const el=document.createElement(tag);if(cl)el.className=cl;if(text!==undefined)el.textContent=String(text);return el};
 const style=create('style');style.textContent=`
 #j358-open{min-height:43px;border:2px solid #a8d5d9;border-radius:10px;background:#075d72;color:white;font-weight:850;font-size:13px;padding:8px 10px;cursor:pointer;white-space:nowrap}
 #j358-dialog{border:none;border-radius:17px;padding:0;color:#123c50;background:#fff;width:min(760px,calc(100vw - 18px));max-height:92dvh;overflow:auto;margin:auto;box-shadow:0 16px 60px #062b4477}
 #j358-dialog::backdrop{background:#062c43b9}
 #j358-dialog *{box-sizing:border-box}
 #j358-dialog .j358-head{position:sticky;top:0;background:#0b536a;color:white;padding:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;z-index:3}
 #j358-dialog .j358-head strong{font-size:21px}
 #j358-dialog .j358-body{padding:16px;display:grid;gap:13px}
 #j358-dialog .j358-action{min-height:46px;background:#086e86;border:1px solid #086e86;border-radius:10px;color:white;font:inherit;font-weight:800;padding:11px 13px;cursor:pointer}
 #j358-dialog .j358-action.secondary{background:#f3f9fa;border-color:#a9cbd5;color:#123f55}
 #j358-dialog .j358-action:disabled{opacity:.45;cursor:not-allowed}
 #j358-dialog .j358-field{display:grid;gap:7px;font-weight:750}
 #j358-dialog select,#j358-dialog input[type=file]{width:100%;min-height:44px;padding:9px;border:1px solid #a7c7d1;border-radius:10px;font:inherit;color:#164b5d;background:#fff}
 #j358-dialog .j358-info{border-left:5px solid #13778a;background:#eaf4f7;border-radius:7px;padding:11px;overflow-wrap:anywhere;white-space:pre-wrap}
 #j358-dialog .j358-actions{display:flex;gap:9px;flex-wrap:wrap}
 #j358-dialog .j358-actions>*{flex:1 1 220px}
 #j358-scan-cta{margin:0 0 15px;background:#e8f7fa;border:2px solid #137991;border-radius:13px;padding:12px;display:grid;gap:8px}
 #j358-scan-cta button,#j358-home button{background:#0c6982;color:white;border:0;border-radius:9px;padding:12px;font:inherit;font-weight:850;min-height:45px;cursor:pointer}
 #j358-home{background:#e5f5f9;border:2px solid #86bfca;border-radius:12px;padding:13px;margin:12px 0;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
 #j358-home>*{flex:1 1 170px}
 @media(max-width:620px){#secure-application header.topbar .top-actions{flex-wrap:wrap!important;row-gap:5px!important}#j358-open{flex:1 1 72px;min-width:72px}#j358-dialog .j358-body{padding:13px}}
 @media print{#j358-open,#j358-dialog,#j358-scan-cta,#j358-home{display:none!important}}`;
 document.head.append(style);
 const button=create('button','', 'JSON-Import');button.id='j358-open';button.type='button';button.setAttribute('aria-label','JSON-Datei sofort importieren');
 const scanner=$('ps352-open'),search=$('nav317-holder'),menu=$('n332-open-top');top.insertBefore(button,scanner?.nextSibling||search||menu||top.firstChild);
 const dialog=create('dialog');dialog.id='j358-dialog';dialog.setAttribute('aria-label','JSON-Datei schnell importieren');
 dialog.innerHTML=`<div class="j358-head"><strong>JSON-Datei importieren</strong><button class="j358-action secondary" id="j358-close" type="button" aria-label="Fenster schließen">Schließen</button></div>
 <div class="j358-body"><p>Direkt eine JSON-Datei auswählen. Erkannte Fachimporte übernehmen nach Bestätigung die validierten Werte auch in die verfügbaren Diagramme und Berichte. Ohne passenden Import bleibt die Datei ein Originaldokument.</p>
 <label class="j358-field">1. JSON-Datei auswählen<input type="file" id="j358-file" accept=".json,application/json"></label>
 <label class="j358-field">2. Bereich für Originalablage (bei Bedarf)<select id="j358-category"></select></label>
 <p id="j358-message" class="j358-info" role="status" aria-live="polite">Keine Datei ausgewählt. Maximal 4 MB.</p>
 <div class="j358-actions"><button id="j358-check" class="j358-action" type="button" disabled>Datei prüfen</button><button id="j358-import" class="j358-action" type="button" disabled>Werte im Fachbereich prüfen</button><button id="j358-archive" class="j358-action secondary" type="button" disabled>Als Original verschlüsselt ablegen</button></div>
 <small>Nur passende PneumoPro-Formate werden an den Messwertimport übergeben. Andere gültige JSON-Dateien kannst du als Originaldokument speichern. Kein Versand an GitHub oder einen Server.</small></div>`;
 host.append(dialog);
 const input=$('j358-file'),select=$('j358-category'),msg=$('j358-message'),check=$('j358-check'),importBtn=$('j358-import'),archive=$('j358-archive');
 CATEGORIES.forEach(([id,name])=>select.append(new Option(name,id)));
 const say=(t,bad=false)=>{msg.textContent=t;msg.style.borderLeftColor=bad?'#b12935':'#13778a';};
 let checked=null;
 function reset(){checked=null;check.disabled=!input.files?.length;importBtn.disabled=true;archive.disabled=true;}
 function detected(o){
  if(o?.format==='PneumoPro-Allergien-JSON'&&o.schemaVersion===1&&Array.isArray(o.records))return 'allergy';
  if(o?.kind==='Asthma-Lung-Study-v1'&&Array.isArray(o.records))return 'lufu';
  if(o?.kind==='Asthma-Walk-Test-v1'&&Array.isArray(o.records))return 'walk';
  if((o?.format==='asthma-labor-import-v1'||o?.schema==='asthma-labor-import-v1')&&Array.isArray(o.values||o.records))return 'lab';
  return '';
 }
 input.addEventListener('change',()=>{reset();say(input.files?.[0]?'Datei ausgewählt. Auf „Datei prüfen“ tippen.':'Keine Datei ausgewählt.');});
 select.addEventListener('change',()=>{if(checked){importBtn.disabled=!(checked.route||select.value==='lab');say('Datei geprüft: '+checked.info+'\nBereich für eine mögliche Originalablage: '+(CATEGORIES.find(x=>x[0]===select.value)?.[1]||'–'));}});
 function show(){if(!S.state().unlocked){alert('Bitte PneumoPro entsperren.');return}if(!dialog.open)dialog.showModal();}
 function hide(){if(dialog.open)dialog.close();}
 button.addEventListener('click',show);$('j358-close').addEventListener('click',hide);
 dialog.addEventListener('click',e=>{if(e.target===dialog)hide()});
 check.addEventListener('click',async()=>{
  reset();const f=input.files?.[0];
  if(!f)return say('Bitte eine JSON-Datei auswählen.',true);
  if(!/\.json$/i.test(f.name)||!f.size||f.size>4*1048576)return say('Nur JSON-Dateien bis 4 MB sind erlaubt.',true);
  try{
   const o=JSON.parse(await f.text());if(!o||typeof o!=='object')throw Error('JSON muss ein Objekt oder eine Liste enthalten.');
   const route=detected(o);const topKeys=Object.keys(o).slice(0,12).join(', ');
   const cnt=Array.isArray(o.records)?o.records.length:0;
   const info=f.name+' ('+(f.size/1024).toFixed(0)+' KB), erkannt: '+({allergy:'Allergien',lufu:'Lungenfunktion / Diffusion',walk:'Gehtest / Blutgase',lab:'Labor / Blutwerte'}[route]||'anderes gültiges JSON')+(cnt?' · '+cnt+' Datensätze':'')+'.';
   checked={file:f,route,info};
   if(route)select.value=route;
   importBtn.disabled=!(route||select.value==='lab');archive.disabled=false;
   say('Geprüft: '+info+'\nFelder: '+topKeys+'\nEine Prüfung der medizinischen Inhalte erfolgt erst im Fachbereich.');
  }catch(err){say('Prüfung fehlgeschlagen: '+(err?.message||err),true)}
 });
 const forward=(targetId,file)=>{const target=$(targetId);if(!target)throw Error('Der Import dieses Fachbereichs ist noch nicht geladen.');const dt=new DataTransfer();dt.items.add(file);target.files=dt.files;target.dispatchEvent(new Event('change',{bubbles:true}));};
 importBtn.addEventListener('click',async()=>{
  if(!checked||input.files?.[0]!==checked.file)return say('Datei erneut prüfen.',true);
  let route=checked.route;
  if(!route&&select.value==='lab')route='lab';
  if(!route)return say('Für diesen Dateityp gibt es keinen geprüften Messwertimport. Bitte als Original ablegen, keine Werte automatisch zuordnen.',true);
  try{
   const file=checked.file;const parsed=JSON.parse(await file.text());
   if(route==='allergy'){
    if(detected(parsed)!=='allergy')throw Error('Keine passende Allergie-JSON.');
    forward('a356-file',file);hide();NAV.go('allergien');$('a356-preview')?.click();$('a356-exchange')?.scrollIntoView({block:'start'});return;
   }
   if(route==='lufu'){
    if(detected(parsed)!=='lufu')throw Error('Keine passende Lungenfunktions-JSON.');
    // Vorhandenen Fachimport verwenden; die Fachfunktion bleibt für Prüfung, Dubletten und Speichern zuständig.
    const dest=$('dl324-jsontext');if(!dest)throw Error('Lungenfunktionsimport ist nicht geladen.');
    dest.value=JSON.stringify(parsed);hide();NAV.go('lungenwerte');
    const details=$('dl324-paste');if(details)details.open=true;
    dest.scrollIntoView({block:'center'});
    alert('Die Lungenfunktions- und Diffusionswerte sind bereit. Tippe nach der Prüfung auf „Eingefügten Befund speichern“. Der vorhandene Import übernimmt gültige Werte in die Verlaufstabellen, Diagramme und Berichte; Duplikate werden übersprungen.');return;
   }
   if(route==='walk'){
    if(detected(parsed)!=='walk')throw Error('Keine passende Gehtest-JSON.');
    hide();NAV.go('gehttest');forward('w342-import',file);$('w342-import-status')?.scrollIntoView({block:'center'});return;
   }
   if(route==='lab'){
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw Error('Keine gültige Labor-JSON.');
    hide();NAV.go('labor');forward('labp-import',file);$('labp-preview')?.scrollIntoView({block:'center'});return;
   }
  }catch(error){say('Import-Vorbereitung fehlgeschlagen: '+(error?.message||error),true)}
 });
 archive.addEventListener('click',async()=>{
  if(!checked||input.files?.[0]!==checked.file)return say('Datei erneut prüfen.',true);
  if(!S.state().unlocked)return say('Gesundheitsakte gesperrt.',true);
  const cat=CATEGORIES.find(x=>x[0]===select.value);if(!cat)return say('Bereich fehlt.',true);
  const file=checked.file;
  if(!confirm('JSON-Datei als Originaldokument für „'+cat[1]+'“ verschlüsselt speichern? Es werden keine Messwerte aus der Datei übernommen.'))return;
  archive.disabled=true;
  try{
   const docs=await S.list('documents');if(docs.some(x=>x.name===file.name&&x.size===file.size&&x.kind===cat[2])){say('Dieses Original (gleicher Name, gleiche Größe und Kategorie) ist bereits gespeichert.');return;}
   const id=crypto.randomUUID?.()||'json358-'+Date.now()+'-'+Math.random().toString(36).slice(2);
   const record={id,kind:cat[2],scanArea:cat[0],name:file.name.slice(0,180),size:file.size,mime:'application/json',blob:file,documentDate:'',note:'JSON-Original, Messwerte nicht automatisch importiert',source:'jsoncenter358',createdAt:new Date().toISOString(),caseId:''};
   await S.put('documents',record,id);const stored=await S.get('documents',id);
   if(!(stored?.blob instanceof Blob)||stored.blob.size!==file.size)throw Error('Speicherung konnte nicht verifiziert werden.');
   say('Gespeichert: '+file.name+' unter '+cat[1]+'. Messwerte wurden NICHT übernommen.');
  }catch(e){say('Speichern fehlgeschlagen: '+(e?.message||e),true)}
  finally{archive.disabled=false;}
 });
 // Eine sichtbare Direktwahl auf der Startseite, ohne zuerst den Scanner zu öffnen.
 const home=$('uebersicht');if(home){const panel=create('div');panel.id='j358-home';panel.append(create('strong','', 'JSON-Datei direkt einlesen – ohne Suchen'));const hButton=create('button','', 'JSON importieren');hButton.type='button';hButton.addEventListener('click',show);panel.append(hButton);home.insertAdjacentElement('afterbegin',panel);}
 // Die Direktwahl zusätzlich ganz oben im bisherigen Scanner anzeigen.
 let tries=0;const attach=()=>{
  const scanBody=$('ps352-dialog')?.querySelector('.ps352-body');
  if(!scanBody){if(++tries<70)setTimeout(attach,180);return;}
  if($('j358-scan-cta'))return;
  const panel=create('div');panel.id='j358-scan-cta';panel.append(create('strong','', 'JSON-Werte importieren – direkt hier'));panel.append(create('span','', 'Eine Datei auswählen; die App prüft den passenden Fachbereich.'));
  const action=create('button','', 'JSON-Datei auswählen');action.type='button';action.addEventListener('click',()=>{$('ps352-close')?.click();show();input.click();});panel.append(action);scanBody.insertAdjacentElement('afterbegin',panel);
  // Den JSON-Button im Kopf direkt neben den Scans-Button einsortieren.
  const scanButton=$('ps352-open');if(scanButton?.parentNode===top)top.insertBefore(button,scanButton.nextSibling);
 };
 attach();
 window.PNEUMOPRO_JSON358=Object.freeze({version:'3.5.8',detect:detected});
})();
