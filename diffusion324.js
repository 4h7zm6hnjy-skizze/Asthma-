/* Lungenfunktion: allgemeine Erklärung, private Befunde nur nach lokalem Import. */
(()=>{'use strict';
 const defs={
 sR_eff:['sR eff','kPa·s','Spezifischer effektiver Atemwegswiderstand.'],R_eff:['R eff','kPa·s/l','Effektiver Atemwegswiderstand.'],TLC:['TLC','l','Gesamtes Lungenvolumen nach maximaler Einatmung (Bodyplethysmographie).'],FRCpleth:['FRCpleth','l','Luftmenge nach normalem Ausatmen, in der Kabine gemessen.'],RV:['RV','l','Restluft nach maximalem Ausatmen.'],RV_TLC:['RV/TLC','%','Restluft als Anteil am gesamten Lungenvolumen.'],VC_IN:['VC IN','l','Langsam eingeatmete Vitalkapazität.'],FVC:['FVC','l','Forciert ausgeatmete Vitalkapazität.'],FEV1:['FEV₁','l','Volumen, das in der ersten Sekunde forciert ausgeatmet wird.'],FEV1_FVC:['FEV₁/FVC','%','Anteil der FVC in der ersten Sekunde; nicht mit FEV₁-%-Soll verwechseln.'],MMEF75_25:['MFEF 75–25','l/s','Mittlerer Ausatemfluss im mittleren Abschnitt der forcierten Ausatmung.'],FEF75:['FEF 75','l/s','Ausatemfluss bei 75 % ausgeatmeter FVC; ergänzender Flusswert.'],PEF:['PEF','l/s','Höchster Ausatemfluss. l/s × 60 ergibt l/min.'],PIF:['PIF','l/s','Höchster Einatemfluss.'],
 DLCO_SB:['DLCO SB','mmol/(min·kPa)','Zentraler Messwert für den Gasübertritt aus den Lungenbläschen ins Blut.'],KCO_SB:['KCO SB','mmol/(min·kPa·l)','Transferkoeffizient, bezogen auf das bei der Messung erfasste Alveolarvolumen.'],VA_SB:['VA SB','l','Mit dem Testgas erreichbares Alveolarvolumen.'],Hb:['Hb','g/dl','Hämoglobin bindet das Testgas. Prüfen, ob dieser Wert gemessen oder vorgegeben wurde.'],DLCOcSB:['DLCOcSB','mmol/(min·kPa)','Als korrigiert ausgewiesene DLCO. Welche Korrekturen angewendet wurden, beim Labor erfragen.'],KCOc_SB:['KCOc SB','mmol/(min·kPa·l)','Als korrigiert ausgewiesener Transferkoeffizient.'],TA:['TA','s','Atemanhaltezeit des Testmanövers.'],VIN_SB:['VIN SB','l','Beim Test eingeatmetes Volumen; wichtig für die Messqualität.'],TLC_SB:['TLC SB','l','Gesamtvolumen aus der Single-Breath-Methode; nicht identisch mit einer Kabinenmessung.'],FRC_SB:['FRC SB','l','Funktionelle Residualkapazität aus dem SB-Verfahren.'],ERV_SB:['ERV SB','l','Zusätzlich nach normalem Ausatmen ausatembares Volumen.'],RV_SB:['RV SB','l','Restvolumen aus dem SB-Verfahren.'],RV_TLC_SB:['RV/TLC SB','%','Restvolumen-Anteil aus dem SB-Verfahren.']};
 const types={measurements:['sR_eff','R_eff','TLC','FRCpleth','RV','RV_TLC','VC_IN','FVC','FEV1','FEV1_FVC','MMEF75_25','FEF75','PEF','PIF'],diffusion:['DLCO_SB','KCO_SB','VA_SB','Hb','DLCOcSB','KCOc_SB','TA','VIN_SB','TLC_SB','FRC_SB','ERV_SB','RV_SB','RV_TLC_SB']};
 const day=s=>/^\d{4}-\d\d-\d\d$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00'))&&new Date(s+'T12:00:00').toISOString().slice(0,10)===s;
 function validateRecord(r){
  if(!r||!types[r.type]||!r.value||typeof r.value!=='object')throw Error('Unbekannte Untersuchungsart.');
  const v=r.value;if(!/^[a-zA-Z0-9_-]{1,100}$/.test(v.id||'')||!day(v.date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time||''))throw Error('Datum, Uhrzeit oder Kennung ungültig.');
  if(!Array.isArray(v.testRows)||v.testRows.length!==types[r.type].length)throw Error('Wertetabelle ist unvollständig.');
  if(!v.testRows.some(r=>r&&typeof r.actual==='number'&&Number.isFinite(r.actual)))throw Error('Mindestens einen gemessenen Istwert eingeben.');
  const seen=new Set();for(const row of v.testRows){if(!types[r.type].includes(row.code)||seen.has(row.code))throw Error('Unbekannter oder doppelter Messwert.');seen.add(row.code);for(const k of ['actual','predicted','percent','z'])if(row[k]!==null&&(typeof row[k]!=='number'||!Number.isFinite(row[k])||Math.abs(row[k])>100000||(k!=='z'&&row[k]<0)))throw Error('Ungültiger Zahlenwert. Leere Felder müssen null sein.');}
  for(const k of ['doctor','note'])if(typeof v[k]!=='string'||v[k].length>(k==='note'?2000:200))throw Error('Befundtext ungültig.');
  if(v.attachment&&(typeof v.attachment.name!=='string'||typeof v.attachment.data!=='string'||!/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(v.attachment.data)||v.attachment.data.length>16000000))throw Error('Ungültiger Bildanhang.');
  const value={id:v.id,date:v.date,time:v.time,doctor:v.doctor,note:v.note,phase:['vor','nach','unbekannt'].includes(v.phase)?v.phase:'unbekannt',reportPhase:typeof v.reportPhase==='string'?v.reportPhase.slice(0,30):'',source:'foto-import',createdAt:typeof v.createdAt==='string'?v.createdAt:new Date().toISOString(),testRows:v.testRows.map(row=>({code:row.code,actual:row.actual,predicted:row.predicted,percent:row.percent,z:row.z}))};
  if(v.attachment)value.attachment={name:v.attachment.name.slice(0,150),data:v.attachment.data};
  if(r.type==='measurements'){const at=c=>value.testRows.find(x=>x.code===c);Object.assign(value,{fev1:at('FEV1').percent,fvc:at('FVC').percent,fev1Liters:at('FEV1').actual,fvcLiters:at('FVC').actual,ratio:at('FEV1_FVC').actual});}
  return {type:r.type,value};
 }
 function parse(data){if(!data||data.kind!=='Asthma-Lung-Study-v1'||!Array.isArray(data.records)||!data.records.length||data.records.length>20)throw Error('Keine passende Lungenfunktions-Importdatei.');const r=data.records.map(validateRecord),seen=new Set();for(const x of r){const k=x.type+'/'+x.value.id;if(seen.has(k))throw Error('Doppelte Untersuchung in der Datei.');seen.add(k);}return r;}
 if(typeof module==='object'&&module.exports){module.exports={parse,validateRecord,defs};return;}
 const S=window.ASTHMA_SECURITY,$=id=>document.getElementById(id),root=$('lungenwerte');if(!S||!root)return;
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);return n;};
 const btn=(text,fn)=>{const n=el('button',text);n.type='button';n.className='btn btn-outline';n.onclick=fn;return n;};
 const fmt=n=>n===null?'—':n.toLocaleString('de-DE',{maximumFractionDigits:2});
 const panel=el('section');panel.id='dl324';panel.className='suite-subpanel';
 panel.innerHTML='<h3>Befunde: Lungenfunktion und Diffusionsmessung</h3><p>Private Befunddatei auf diesem Gerät prüfen und verschlüsselt übernehmen. Fehlende Werte bleiben leer.</p><label><strong>1. Befunddatei auswählen – Werte werden automatisch verschlüsselt gespeichert</strong><input id="dl324-file" type="file" accept=".json,application/json"></label><p class="dl324-tip">Nur private Befund-JSON auswählen, keine .asthma17-Gesamtsicherung. Du brauchst nach der Auswahl nicht noch einmal auf Speichern zu tippen.</p><details id="dl324-paste"><summary>Wenn die Dateiauswahl nicht funktioniert: Importtext hier einfügen</summary><label>Privaten JSON-Text einfügen<textarea id="dl324-jsontext" rows="6" spellcheck="false" placeholder="{ ... Befunddaten ... }"></textarea></label><button class="btn btn-outline" type="button" id="dl324-importtext">Eingefügten Befund speichern</button></details><div id="dl324-preview"></div><p id="dl324-status" role="status" aria-live="polite"></p><button id="dl324-check" class="btn btn-outline" type="button">Speicherfunktion prüfen</button><details id="dl324-body"><summary>Spirometrie / Bodyplethysmographie – vollständige Werte</summary><div id="dl324-body-list"></div></details><details id="dl324-diff"><summary>Diffusionsmessung (DLCO) – Werte und Erklärung</summary><div id="dl324-explain"></div><div id="dl324-diff-list"></div><button id="dl324-new" class="btn btn-outline" type="button">Neue Diffusionsmessung erfassen</button></details><div id="dl324-editor"></div><section aria-labelledby="dl324-original-title"><h3 id="dl324-original-title">Originalbefunde – chronologisch</h3><p>Älteste Untersuchung zuerst. Bei gleichem Zeitpunkt: Lungenfunktion, danach Diffusion.</p><div id="dl324-originals"></div></section>';
 const heading=root.querySelector('.lung-quick-actions');if(heading)heading.after(panel);else root.prepend(panel);
 const quick=btn('Diffusionsmessung (DLCO)',()=>{$('dl324-diff').open=true;$('dl324-diff').scrollIntoView({block:'start',behavior:'smooth'});});heading?.append(quick);
 $('dl324-explain').innerHTML='<p><strong>Was ist das?</strong> Die Single-Breath-Diffusionsmessung prüft den Gasübertritt aus den Lungenbläschen ins Blut. Du atmest ein Testgas mit einer sehr kleinen Kohlenmonoxidmenge ein, hältst kurz die Luft an und atmest wieder aus. „SB“ bedeutet Single Breath.</p><p><strong>Wichtigste Werte:</strong> DLCO beschreibt die gesamte Transferleistung. VA ist das mit Testgas erfasste Alveolarvolumen. KCO beschreibt den Transfer bezogen auf dieses Volumen. Hb und die Qualität des Atemmanövers beeinflussen das Ergebnis.</p><p><strong>So liest du den Befund:</strong> Soll/Pred ist der Referenzwert, Ist/Best der Messwert, % Soll der Vergleich damit. 77 % DLCO wären keine Sauerstoffsättigung und keine Aussage, dass die gesamte Lunge nur zu 77 % funktioniert. Die SpO₂ wird getrennt gemessen.</p><p><strong>Einordnung:</strong> Für die untere Normgrenze sind LLN bzw. Z-Score maßgeblich, meist das 5. Perzentil (Z etwa −1,645). Eine starre 80-%-Grenze reicht nicht. Ein hoher KCO gleicht ein niedriges VA nicht automatisch aus. Einzelwerte liefern keine sichere Ursache oder Diagnose; Qualität, Hb, weitere Lungenwerte und Beschwerden gehören zur ärztlichen Beurteilung.</p><p><strong>Weitere Werte:</strong> TA ist die Atemanhaltezeit, VIN das eingeatmete Volumen. Die aus SB ermittelten Lungenvolumina dürfen nicht mit der Bodyplethysmographie gleichgesetzt werden. Bei unbekanntem Hb-Messstatus lässt sich eine Korrektur nicht sicher beurteilen. Fehlende numerische Z-Scores werden nicht aus einer Grafik geschätzt.</p><p>Quellen: <a href="https://site.thoracic.org/advocacy-patients/patient-resources/pulmonary-function-tests" target="_blank" rel="noopener noreferrer">ATS – Lungenfunktionstests</a> · <a href="https://publications.ersnet.org/content/erj/60/1/2101499" target="_blank" rel="noopener noreferrer">ERS/ATS – Interpretation</a> · <a href="https://www.thoracic.org/statements/resources/pft/DLCO.pdf" target="_blank" rel="noopener noreferrer">ERS/ATS – DLCO-Messstandard</a></p>';
 let pending=null,busy=false,editing=null;
 const say=t=>$('dl324-status').textContent=t;
 function table(rows){const wrap=el('div');wrap.className='dl324-table-wrap';const t=el('table');t.innerHTML='<thead><tr><th>Wert / Einheit</th><th>Soll</th><th>Ist</th><th>% Soll</th><th>Z-Score</th></tr></thead>';const b=el('tbody');rows.forEach(r=>{const tr=el('tr');const label=el('th',defs[r.code][0]+' ('+defs[r.code][1]+')');label.scope='row';tr.append(label);for(const k of ['predicted','actual','percent','z'])tr.append(el('td',fmt(r[k])));b.append(tr)});t.append(b);wrap.append(t);return wrap;}
 function card(r,actions=true){const v=r.value,n=el('article');n.className='dl324-card';n.append(el('h4',v.date.split('-').reverse().join('.')+' · '+v.time+' · '+(r.type==='diffusion'?'Diffusion SB':'Lungenfunktion')),el('p',v.doctor),table(v.testRows),el('p',v.note));
 const glossary=el('details');glossary.append(el('summary','Was bedeuten die einzelnen Werte?'));for(const row of v.testRows)glossary.append(el('p',defs[row.code][0]+': '+defs[row.code][2]));n.append(glossary);
 if(v.attachment){const photo=el('details');photo.append(el('summary','Originalbefund anzeigen'));photo.addEventListener('toggle',()=>{if(photo.open&&!photo.querySelector('img')){const img=el('img');img.src=v.attachment.data;img.alt='Originalbefund '+v.date;photo.append(img);}});n.append(photo);}
 if(actions){n.append(btn('Bearbeiten',()=>editor(r)),btn('Löschen',async()=>{if(busy||!confirm('Diesen Befund mit seinem gespeicherten Bild löschen?'))return;busy=true;try{await S.del('suite',r.type+'/'+v.id);await refresh();say('Befund gelöscht.');}catch(e){say('Nicht gelöscht: '+e.message)}finally{busy=false}}));
 if(r.type==='measurements')n.append(btn('Als aktuellen Lungenfunktionstest übernehmen',async()=>{if(busy||!confirm('Aktuelle Profilwerte durch diesen Befund ersetzen? Der Verlauf bleibt erhalten.'))return;busy=true;try{await S.updateProfile({fev1:v.fev1,fvc:v.fvc,fev1Liters:v.fev1Liters,fvcLiters:v.fvcLiters,lungDate:v.date});say('Aktuelle Profilwerte gespeichert. App neu öffnen, damit alle Profilanzeigen aktualisiert sind.');}catch(e){say(e.message)}finally{busy=false}}));}return n;}
 async function refresh(){const records=await S.list('suite');const originals=$('dl324-originals');originals.replaceChildren();
 const images=records.filter(r=>types[r.type]&&r.value?.attachment?.data&&Array.isArray(r.value.testRows)).sort((a,b)=>(a.value.date+'T'+a.value.time).localeCompare(b.value.date+'T'+b.value.time)||(a.type==='measurements'?-1:1));
 for(const r of images){const figure=el('figure');const caption=r.value.date.split('-').reverse().join('.')+' · '+r.value.time+' Uhr · '+(r.type==='measurements'?'Lungenfunktion / Bodyplethysmographie':'Diffusion SB');figure.append(el('figcaption',caption));const img=el('img');img.src=r.value.attachment.data;img.alt='Originalbefund: '+caption;img.loading='lazy';figure.append(img);originals.append(figure);}if(!images.length)originals.append(el('p','Originalbilder erscheinen nach dem privaten Befundimport.'));
 for(const [type,id] of [['measurements','dl324-body-list'],['diffusion','dl324-diff-list']]){const list=$(id);list.replaceChildren();const data=records.filter(r=>r.type===type&&Array.isArray(r.value?.testRows)).sort((a,b)=>b.value.date.localeCompare(a.value.date));for(const r of data)list.append(card(r));if(!data.length)list.append(el('p','Noch kein vollständiger Befund in diesem Bereich gespeichert.'));}}
 async function importPending(){
  if(busy||!pending)return;
  busy=true;const fileInput=$('dl324-file'),textButton=$('dl324-importtext');fileInput.disabled=true;textButton.disabled=true;
  let saved=0,skipped=0;
  try{
   if(!S.state().unlocked)throw Error('Zuerst die Asthma-Gesundheitsakte entsperren.');
   const all=await S.list('suite');
   for(const r of pending){
    const key=r.type+'/'+r.value.id;
    const previous=await S.get('suite',key);
    if(previous){
     if(r.value.attachment&&!previous.value?.attachment){
      await S.put('suite',{key,type:r.type,value:{...previous.value,attachment:r.value.attachment}},key);
      const check=await S.get('suite',key);
      if(!check?.value?.attachment)throw Error('Bildnachtrag konnte nicht bestätigt werden.');
      saved++;
     }else skipped++;
     continue;
    }
    const duplicate=all.some(x=>x.type===r.type&&x.value?.date===r.value.date&&x.value?.time===r.value.time&&Array.isArray(x.value?.testRows)&&JSON.stringify(x.value.testRows)===JSON.stringify(r.value.testRows));
    if(duplicate){skipped++;continue;}
    await S.put('suite',{key,type:r.type,value:r.value},key);
    const check=await S.get('suite',key);
    if(!check||JSON.stringify(check.value?.testRows)!==JSON.stringify(r.value.testRows))throw Error('Speichern konnte nicht bestätigt werden. Bitte bei gleichbleibendem Browserprofil erneut versuchen.');
    all.push(check);saved++;
   }
   pending=null;$('dl324-preview').replaceChildren();fileInput.value='';
   $('dl324-body').open=true;$('dl324-diff').open=true;
   try{await refresh()}catch(e){say('Daten gespeichert, aber Anzeige fehlgeschlagen: '+e.message)}
   window.dispatchEvent(new CustomEvent('asthma:lung-study-imported',{detail:{saved,skipped}}));
   say(saved?'Erfolgreich und verschlüsselt gespeichert: '+saved+' Befund(e). '+(skipped?skipped+' bereits vorhanden. ':'')+'Diagramme aktualisiert.':skipped+' Befund(e) bereits vorhanden. Es wurde nichts doppelt gespeichert.');
  }catch(err){say('Speicherfehler: '+(err?.message||String(err))+' | '+saved+' zuvor gespeichert. Es wurden keine vorhandenen Befunde gelöscht.');}
  finally{busy=false;fileInput.disabled=false;textButton.disabled=false;}
 }
 async function receive(text){
  if(busy)return;
  try{
   pending=parse(JSON.parse(text));
   $('dl324-preview').replaceChildren();
   say(pending.length+' Befund(e) geprüft. Speichere verschlüsselt …');
   await importPending();
  }catch(err){pending=null;say('Import nicht möglich: '+(err?.message||String(err))+' Die Daten wurden nicht verändert.');}
 }
 $('dl324-file').onchange=async e=>{
  if(busy)return;
  try{
   const file=e.target.files?.[0];if(!file)return;
   if(file.size>30000000)throw Error('Datei zu groß (maximal 30 MB).');
   say('Datei „'+file.name+'“ wird gelesen …');
   await receive(await file.text());
  }catch(err){say('Dateiauswahl fehlgeschlagen: '+(err?.message||String(err))+' Bitte Importtext verwenden.');}
 };
 $('dl324-importtext').onclick=()=>{
  const data=$('dl324-jsontext').value.trim();
  if(!data){say('Bitte erst den JSON-Text einfügen.');return;}
  receive(data).then(()=>{if(!pending&&/Erfolgreich|bereits vorhanden/.test($('dl324-status').textContent))$('dl324-jsontext').value='';});
 };
 $('dl324-check').onclick=async()=>{
  if(busy)return;busy=true;
  const button=$('dl324-check');button.disabled=true;
  const id='asthma-save-test-'+Date.now();
  try{
   if(!S.state().unlocked)throw Error('Gesundheitsakte noch gesperrt.');
   await S.put('suite',{key:id,type:'storage-test',value:{test:true}},id);
   const check=await S.get('suite',id);
   if(check?.value?.test!==true)throw Error('Der Testdatensatz konnte nicht wieder gelesen werden.');
   say('Speicherprüfung bestanden. Dieser Browser kann verschlüsselte Daten schreiben und wieder lesen.');
  }catch(err){say('Speicherprüfung fehlgeschlagen: '+(err?.message||String(err))+' Bitte denselben Browser bzw. dasselbe Home-Bildschirm-Symbol verwenden und freien Gerätespeicher prüfen.');}
  finally{try{await S.del('suite',id)}catch(_){/* keep error visible */}busy=false;button.disabled=false;}
 };
 function editor(record){if(busy)return;editing=record;const v=record.value,box=$('dl324-editor');box.replaceChildren(el('h4','Befund bearbeiten'));const form=el('form');form.id='dl324-form';
 for(const [k,label,type] of [['date','Datum','date'],['time','Uhrzeit','time'],['doctor','Ort / Praxis','text']]){const l=el('label',label),input=el('input');input.name=k;input.type=type;input.value=v[k];input.required=k!=='doctor';l.append(input);form.append(l);}
 const grid=el('div');grid.className='dl324-edit-grid';for(const row of v.testRows){const set=el('fieldset');set.append(el('legend',defs[row.code][0]+' · '+defs[row.code][1]));for(const [k,name] of [['predicted','Soll'],['actual','Ist'],['percent','% Soll'],['z','Z-Score']]){const l=el('label',name),i=el('input');i.name=row.code+'_'+k;i.type='number';i.step='any';i.value=row[k]??'';if(k!=='z')i.min='0';l.append(i);set.append(l);}grid.append(set);}form.append(grid);const note=el('textarea');note.name='note';note.maxLength=2000;note.value=v.note;const label=el('label','Notiz');label.append(note);form.append(label,el('p','Prozentwerte und Z-Scores werden wie im Befund eingetragen, nicht automatisch neu berechnet. Das Originalfoto bleibt unverändert.'));const save=el('button','Änderungen speichern');save.type='submit';form.append(save,btn('Abbrechen',()=>{editing=null;box.replaceChildren()}));form.onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;save.disabled=true;try{const values={...v,date:form.elements.date.value,time:form.elements.time.value,doctor:form.elements.doctor.value,note:form.elements.note.value,testRows:v.testRows.map(row=>{const copy={code:row.code};for(const k of ['predicted','actual','percent','z']){const raw=form.elements[row.code+'_'+k].value;copy[k]=raw===''?null:Number(raw);}return copy;})};const r=validateRecord({type:record.type,value:values}),key=r.type+'/'+r.value.id;await S.put('suite',{key,type:r.type,value:r.value},key);box.replaceChildren();editing=null;await refresh();say('Änderungen gespeichert.');}catch(err){say(err.message)}finally{busy=false;save.disabled=false}};box.append(form);box.scrollIntoView({block:'start'});}
 $('dl324-new').onclick=()=>{const d=new Date(),date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');editor({type:'diffusion',value:{id:crypto.randomUUID(),date,time:d.toTimeString().slice(0,5),doctor:'',note:'',phase:'unbekannt',createdAt:d.toISOString(),testRows:types.diffusion.map(code=>({code,actual:null,predicted:null,percent:null,z:null}))}})};
 let timer;window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite'){clearTimeout(timer);timer=setTimeout(()=>refresh().catch(err=>say(err.message)),100);}});refresh().catch(e=>say(e.message));
})();
