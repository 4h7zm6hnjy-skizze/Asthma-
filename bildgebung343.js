'use strict';
/* Asthma 3.4.3 — Bildgebung, Befundprotokoll, verschlüsselte Originale, lokale Bildvorschau.
   Keine automatische diagnostische Interpretation; DICOM-Renderer dient nur der Orientierung. */
(()=>{
 const SEC=window.ASTHMA_SECURITY,NAV=window.ASTHMA_NAV,$=id=>document.getElementById(id);
 if(!SEC?.state?.().unlocked||!NAV||!$('start')||$('bildgebung'))return;
 const page=document.createElement('section');page.className='panel new-page bi343';page.id='bildgebung';page.dataset.navPage='bildgebung';page.hidden=true;
 page.innerHTML=`<div class="section-heading"><div><p class="section-kicker">Bildgebende Untersuchungen · private Akte</p><h2>RÖNTGEN & CT</h2><p>Bilddaten ansehen, Befunde geordnet speichern und ein ärztliches Diagnoseprotokoll führen.</p></div><span class="shield">Verschlüsselt lokal</span></div>
 <div class="bi343-shell"><div class="bi343-head"><button type="button" data-bi-tab="xray" aria-pressed="true">RÖNTGEN</button><button type="button" data-bi-tab="ct" aria-pressed="false">COMPUTERTOMOGRAFIE (CT)</button></div>
 <section class="bi343-card"><h3>NEUE UNTERSUCHUNG & DIAGNOSEPROTOKOLL</h3><p>Ärztlichen Originalbefund dokumentieren. Bitte keine Diagnosen aus Bildern selbst ableiten.</p>
 <form id="bi343-form"><input name="id" type="hidden"><div class="bi343-grid">
 <label>Untersuchungsdatum *<input name="date" type="date" required></label><label>Art der Untersuchung <select name="modality"><option value="xray">Röntgen</option><option value="ct">Computertomografie (CT)</option></select></label>
 <label>Untersuchter Bereich *<select name="region" required><option value="">Bitte auswählen</option><option value="Thorax / Lunge">Thorax / Lunge</option><option value="Abdomen / Bauch">Abdomen / Bauch</option><option value="Kopf / Gehirn">Kopf / Gehirn</option><option value="Hals / Wirbelsäule">Hals / Wirbelsäule</option><option value="Arme / Beine / Gelenke">Arme / Beine / Gelenke</option><option value="Anderer Bereich">Anderer Bereich</option></select></label>
 <label>Klinik / Praxis<input name="clinic" maxlength="180" type="text"></label><label>Arzt / Radiologie<input name="doctor" maxlength="180" type="text"></label>
 <label>Kontrastmittel <select name="contrast"><option value="unknown">Nicht angegeben</option><option value="no">Ohne Kontrastmittel</option><option value="yes">Mit Kontrastmittel</option><option value="both">Ohne und mit Kontrastmittel</option></select></label>
 <label>CTDIvol (mGy, nur wenn dokumentiert)<input type="number" inputmode="decimal" min="0" max="1000" step="any" name="ctdi"></label>
 <label>DLP (mGy·cm, nur wenn dokumentiert)<input type="number" inputmode="decimal" min="0" max="100000" step="any" name="dlp"></label>
 </div><div class="bi343-grid bi343-text">
 <label>Fragestellung / Indikation<textarea name="indication" rows="3" maxlength="2000" placeholder="Warum wurde die Untersuchung angeordnet?"></textarea></label>
 <label>Originaler radiologischer Befund<textarea name="findings" rows="5" maxlength="8500" placeholder="Wortlaut aus dem Arzt- / Radiologiebericht"></textarea></label>
 <label>Ärztliche Beurteilung / Diagnose<textarea name="assessment" rows="4" maxlength="4500" placeholder="Nur dokumentierte ärztliche Einschätzung"></textarea></label>
 <label>Empfohlene Schritte / Therapie<textarea name="recommendation" rows="3" maxlength="3000"></textarea></label>
 <label>Vergleich mit Voraufnahmen<textarea name="comparison" rows="3" maxlength="3000" placeholder="Nur wenn vom Arzt beschrieben"></textarea></label>
 <label>Eigene Notiz (keine Diagnose)<textarea name="notes" rows="3" maxlength="3000"></textarea></label></div>
 <label class="bi343-file-label">Originalbilder und Befunddateien wählen (PDF, Bild, DICOM, ZIP)<input id="bi343-files" name="uploads" multiple type="file"></label>
 <p class="bi343-muted">Einzeldatei bis 32 MB; ZIP bis 50 MB, maximal 40 Bilder und 80 MB entpackt. DICOM-Serien in ZIP-Dateien werden lokal ausgepackt. Die Originale bleiben verschlüsselt und werden nicht auf GitHub hochgeladen.</p>
 <div class="bi343-actions"><button type="submit" class="btn btn-primary">UNTERSUCHUNG VERSCHLÜSSELT SPEICHERN</button><button type="button" id="bi343-cancel" class="btn btn-outline" hidden>Bearbeitung abbrechen</button></div></form><p id="bi343-status" role="status" aria-live="polite">Noch kein Befund gespeichert.</p>
 </section>
 <section class="bi343-card"><h3>MEINE RÖNTGEN- UND CT-BEFUNDE</h3><label>Untersuchung anzeigen <select id="bi343-filter"><option value="all">Alle Untersuchungen</option><option value="xray">Nur Röntgen</option><option value="ct">Nur CT</option></select></label><div id="bi343-records"></div></section>
 <section class="bi343-card"><h3>BILDARCHIV & BILDANZEIGE</h3><p>Foto und PDF ansehen; unkomprimierte DICOM-Bilder mit Bildnummer und Helligkeit/Kontrast anzeigen. Große Bildserien können den iPhone-Speicher stark beanspruchen.</p><div id="bi343-viewer"><p>Wähle bei einem gespeicherten Original auf „Bild ansehen“.</p></div></section>
 <details class="bi343-card bi343-info"><summary>WELCHE BILDDATEIEN KÖNNEN ANGEZEIGT WERDEN?</summary><p><strong>Direkt:</strong> JPEG, PNG, WebP; HEIC/HEIF nur, falls Safari das Format unterstützt. PDFs öffnen im Browser/Dateibetrachter.</p><p><strong>DICOM:</strong> DCM/IMA/Dateien im DICOM-Format mit unkomprimierten 8-/16-Bit-Pixeln, auch mehrere Bilder pro Datei (Multi-Frame). Für CT gibt es Fenster-/Kontrastregler. Eine ZIP-Datei mit DICOM-Serie wird vor dem verschlüsselten Speichern lokal entpackt.</p><p><strong>Einschränkungen:</strong> JPEG2000, JPEG-LS, RLE, bestimmte proprietäre DICOM-Dateien, NIfTI, DICOMDIR-Indexdateien und manche TIFF-/HEIC-Dateien lassen sich hier nicht zuverlässig anzeigen. Die Originaldatei bleibt herunterladbar. Bitte solche Bilder in einer Radiologie-Software als JPEG/PNG oder unkomprimiertes DICOM exportieren.</p><p><strong>Sicherheit:</strong> Die Ansicht ist kein kalibrierter, medizinisch zertifizierter DICOM-Betrachter und erstellt keine automatische radiologische Diagnose.</p></details>
 </div>`;
 $('start').insertAdjacentElement('afterend',page);
 const f=$('bi343-form'),status=$('bi343-status'),viewer=$('bi343-viewer');let active='xray',records=[],documents=[],editing='',currentUrl=null,refreshCount=0;
 const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const fmt=s=>/^\d{4}-\d\d-\d\d$/.test(s||'')?s.slice(8)+'.'+s.slice(5,7)+'.'+s.slice(0,4):'–';
 const uid=()=>crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
 const el=(tag,t,cl)=>{const a=document.createElement(tag);if(t!==undefined)a.textContent=String(t);if(cl)a.className=cl;return a};
 const say=(text,error=false)=>{status.textContent=text;status.classList.toggle('error',error)};
 const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+'T12:00:00Z').toISOString().startsWith(s);
 function mode(m){active=m;f.elements.modality.value=m;page.querySelectorAll('[data-bi-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.biTab===m)));$('bi343-filter').value=m;renderRecords()}
 page.querySelectorAll('[data-bi-tab]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.biTab)));
 $('bi343-filter').addEventListener('change',renderRecords);
 function reset(){f.reset();editing='';f.elements.date.value=today();f.elements.modality.value=active;f.elements.id.value='';$('bi343-cancel').hidden=true;f.querySelector('button[type="submit"]').textContent='UNTERSUCHUNG VERSCHLÜSSELT SPEICHERN'}
 $('bi343-cancel').addEventListener('click',reset);
 const textFields=['clinic','doctor','indication','findings','assessment','recommendation','comparison','notes'];
 function values(){const data={id:editing||uid(),date:f.elements.date.value,modality:f.elements.modality.value,region:f.elements.region.value,contrast:f.elements.contrast.value};
  if(!validDate(data.date)||!['xray','ct'].includes(data.modality)||!data.region)throw Error('Datum, Verfahren oder Körperbereich fehlt.');
  for(const k of textFields)data[k]=f.elements[k].value.trim();
  for(const k of ['ctdi','dlp']){const raw=f.elements[k].value.trim().replace(',','.');data[k]=raw===''?null:Number(raw);if(data[k]!==null&&(!Number.isFinite(data[k])||data[k]<0||data[k]>100000))throw Error('Ungültige Strahlendosisangabe: '+k);}
  data.createdAt=editing?records.find(x=>x.id===editing)?.createdAt||new Date().toISOString():new Date().toISOString();data.updatedAt=new Date().toISOString();
  return data;
 }
 function isDcm(file){return /\.(dcm|dicom|ima)$/i.test(file.name)||file.type==='application/dicom'}
 async function hasDicomHeader(file){if(file.size<132)return false;const s=new Uint8Array(await file.slice(128,132).arrayBuffer());return s[0]===68&&s[1]===73&&s[2]===67&&s[3]===77}
 function isSupported(file){return /\.(jpe?g|png|webp|heic|heif|tif|tiff|pdf|dcm|dicom|ima)$/i.test(file.name)||file.type==='application/dicom'}
 async function unpack(files){const result=[],errors=[];let total=0;
  for(const file of files){
   if(/\.zip$/i.test(file.name)){
    if(file.size>50*1048576)throw Error('ZIP-Datei größer als 50 MB. Bitte kleinere Serie wählen.');
    if(!window.JSZip)throw Error('ZIP-Unterstützung fehlt, bitte einzelne Bilder wählen.');
    const zip=await JSZip.loadAsync(file,{checkCRC32:true});
    for(const item of Object.values(zip.files)){if(item.dir)continue;
      const name=item.name.split('/').pop();if(!name||name.toUpperCase()==='DICOMDIR'||name.startsWith('.')||name.startsWith('__MACOSX'))continue;
      if(result.length>=40)throw Error('Maximal 40 Originaldateien pro Upload. Bitte Serie aufteilen.');
      if(item._data?.uncompressedSize>32*1048576)throw Error('ZIP enthält zu großes Einzelbild '+name+'.');
      if(item._data?.uncompressedSize+total>80*1048576)throw Error('Entpackte Bilder würden 80 MB überschreiten.');
      const bytes=await item.async('uint8array');if(bytes.byteLength>32*1048576)throw Error('Einzelbild '+name+' ist größer als 32 MB.');
      total+=bytes.length;if(total>80*1048576)throw Error('Entpackte Bilder über 80 MB. Bitte kleinere Serie wählen.');
      // DICOM CDs often contain extensionless image files; detect DICM at offset 128.
      const dcm=bytes.length>132&&String.fromCharCode(...bytes.subarray(128,132))==='DICM';
      if(!isSupported({name,type:''})&&!dcm){errors.push(name);continue;}
      const nm=dcm&&!/\.(dcm|ima|dicom)$/i.test(name)?name+'.dcm':name;
      result.push(new File([bytes],nm,{type:dcm?'application/dicom':/\.pdf$/i.test(nm)?'application/pdf':(/\.(jpg|jpeg)$/i.test(nm)?'image/jpeg':/\.png$/i.test(nm)?'image/png':'application/octet-stream')}));
    }
   }else{
    if(file.name.toUpperCase()==='DICOMDIR')throw Error('DICOMDIR ist ein Index, kein Bild. Bitte die DCM-Dateien oder eine ZIP mit der DICOM-Serie wählen.');
    const dcm=await hasDicomHeader(file);if(!isSupported(file)&&!dcm)throw Error('Dateiformat nicht unterstützt: '+file.name);
    if(file.size>32*1048576)throw Error('Einzeldatei '+file.name+' über 32 MB.');
    total+=file.size;if(total>80*1048576)throw Error('Mehr als 80 MB. Bitte weniger Dateien wählen.');result.push(dcm&&!isDcm(file)?new File([file],file.name+'.dcm',{type:'application/dicom'}):file);
   }
  }
  if(!result.length&&errors.length)throw Error('ZIP enthält keine unterstützten Bilder. DICOMDIR selbst ist kein Bild.');
  return {files:result,skipped:errors};
 }
 async function saveDocument(file,study){
  const duplicate=(await SEC.list('documents')).some(x=>x.kind==='Bildgebung'&&x.studyId===study.id&&x.name===file.name&&x.size===file.size);
  if(duplicate)return false;
  const id=uid();const doc={id,name:file.name.slice(0,180),mime:file.type||'application/octet-stream',size:file.size,blob:file,kind:'Bildgebung',modality:study.modality,studyId:study.id,documentDate:study.date,createdAt:new Date().toISOString(),source:'bildgebung343'};
  await SEC.put('documents',doc,id);const v=await SEC.get('documents',id);if(!(v?.blob instanceof Blob)||v.blob.size!==file.size)throw Error('Originaldatei konnte nicht bestätigt werden: '+file.name);
  return true;
 }
 async function save(ev){ev.preventDefault();const button=f.querySelector('button[type="submit"]');button.disabled=true;let row,saved=false;
  try{row=values();const picked=[...$('bi343-files').files];if(!picked.length&&!textFields.some(k=>row[k]))throw Error('Bitte Originaldatei oder ärztlichen Befundtext hinzufügen.');if(picked.length>40)throw Error('Bitte maximal 40 Dateien pro Upload auswählen.');const packet=await unpack(picked);
   const key='imaging343/'+row.id;await SEC.put('suite',{key,type:'imaging343',value:row},key);const check=await SEC.get('suite',key);if(check?.value?.date!==row.date)throw Error('Untersuchung konnte nicht bestätigt werden.');saved=true;
   let attached=0;for(const file of packet.files)if(await saveDocument(file,row))attached++;
   await refresh();say('Untersuchung gespeichert. '+attached+' Originaldatei(en) neu verschlüsselt angehängt, '+(packet.files.length-attached)+' bereits vorhanden.'+(packet.skipped.length?' Einige nicht unterstützte Dateien ausgelassen: '+packet.skipped.join(', '):''));reset();
  }catch(e){say((saved?'Untersuchung gespeichert, aber nicht alle Originale angehängt. ':'Speichern fehlgeschlagen: ')+e.message,true);if(saved)await refresh().catch(()=>{});}finally{button.disabled=false;}
 }
 f.addEventListener('submit',save);
 function edit(row){reset();editing=row.id;for(const field of f.elements){if(field.name&&field.name!=='uploads'&&row[field.name]!==undefined&&row[field.name]!==null)field.value=row[field.name];}active=row.modality;page.querySelectorAll('[data-bi-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.biTab===active)));$('bi343-cancel').hidden=false;f.querySelector('button[type="submit"]').textContent='ÄNDERUNGEN SPEICHERN';f.scrollIntoView({block:'start',behavior:'smooth'});}
 function protocol(row){const proto=el('section',undefined,'bi343-protocol');const heading=el('h4','DIAGNOSEPROTOKOLL · '+(row.modality==='ct'?'CT':'RÖNTGEN')+' · '+fmt(row.date));proto.append(heading);
  const pairs=[['Untersuchung',row.modality==='ct'?'Computertomografie (CT)':'Röntgen'],['Datum',fmt(row.date)],['Körperregion',row.region],['Klinik',row.clinic],['Arzt / Radiologie',row.doctor],['Kontrastmittel',({yes:'Mit',no:'Ohne',both:'Mit und ohne',unknown:'Nicht angegeben'})[row.contrast]||'Nicht angegeben'],['CTDIvol',row.ctdi!==null&&row.ctdi!==undefined?row.ctdi+' mGy':''],['DLP',row.dlp!==null&&row.dlp!==undefined?row.dlp+' mGy·cm':''],['Fragestellung / Indikation',row.indication],['Radiologischer Originalbefund',row.findings],['Ärztliche Beurteilung / Diagnose',row.assessment],['Vergleich mit Voraufnahmen',row.comparison],['Therapie / weiteres Vorgehen',row.recommendation],['Eigene Notizen',row.notes]];
  for(const [a,b] of pairs){if(!b)continue;const p=el('p');p.append(el('strong',a+': '),document.createTextNode(b));proto.append(p);}
  proto.append(el('p','Dokumentationsprotokoll – keine automatisch erstellte Diagnose. Nur die ärztlich vorliegenden Aussagen sind maßgeblich.','bi343-muted'));return proto;
 }
 function renderRecords(){const host=$('bi343-records');host.replaceChildren();const value=$('bi343-filter').value;const filtered=records.filter(x=>value==='all'||x.modality===value).sort((a,b)=>b.date.localeCompare(a.date));if(!filtered.length){host.append(el('p','Noch keine Untersuchungen in dieser Kategorie.'));return;}
  for(const row of filtered){const card=el('article',undefined,'bi343-record');const head=el('h4',fmt(row.date)+' · '+(row.modality==='ct'?'CT':'Röntgen')+' · '+row.region);card.append(head);
   const summary=el('p',(row.assessment||row.findings||'Noch kein Befundtext eingetragen.').slice(0,240)+(String(row.assessment||row.findings||'').length>240?' …':''));card.append(summary);
   const docs=documents.filter(d=>d.kind==='Bildgebung'&&d.studyId===row.id);card.append(el('p',docs.length+' Bild-/Befunddatei(en) vorhanden.','bi343-muted'));
   const details=el('details');details.append(el('summary','Diagnoseprotokoll anzeigen'));details.append(protocol(row));card.append(details);
   const media=el('div',undefined,'bi343-filelist');for(const d of docs){const line=el('div',undefined,'bi343-fileitem');line.append(el('span',d.name+' · '+(d.size/1048576).toFixed(1)+' MB'));const view=el('button','Bild ansehen','btn btn-outline');view.type='button';view.addEventListener('click',()=>showImage(d));const save=el('button','Original sichern','btn btn-outline');save.type='button';save.addEventListener('click',()=>download(d));const remove=el('button','Datei löschen','btn btn-text');remove.type='button';remove.addEventListener('click',async()=>{if(!confirm('Diese Originaldatei löschen?'))return;try{await SEC.del('documents',d.id);await refresh();say('Originaldatei gelöscht.')}catch(e){say(e.message,true)}});line.append(view,save,remove);media.append(line);}card.append(media);
   const actions=el('div',undefined,'bi343-actions');const print=el('button','Diagnoseprotokoll drucken / PDF','btn btn-primary');print.type='button';print.addEventListener('click',()=>printProtocol(row));actions.append(print);const modify=el('button','Befund bearbeiten','btn btn-outline');modify.type='button';modify.addEventListener('click',()=>edit(row));const remove=el('button','Untersuchung löschen','btn btn-text');remove.type='button';remove.addEventListener('click',async()=>{if(!confirm('Untersuchung endgültig löschen? Bilder bleiben als Originale gespeichert.'))return;try{await SEC.del('suite','imaging343/'+row.id);await refresh();say('Untersuchung gelöscht. Originale verbleiben im Tresor.')}catch(e){say(e.message,true)}});actions.append(modify,remove);card.append(actions);host.append(card);}
 }
 function printProtocol(row){
  document.getElementById('bi343-print-preview')?.remove();
  const printable=protocol(row);printable.id='bi343-print-preview';printable.classList.add('bi343-printed-protocol');
  document.body.append(printable);document.documentElement.classList.add('bi343-print');
  const cleanup=()=>{document.documentElement.classList.remove('bi343-print');printable.remove();window.removeEventListener('afterprint',cleanup);};
  window.addEventListener('afterprint',cleanup);
  try{window.print();}catch(e){say('Druckvorschau nicht verfügbar: '+e.message,true);cleanup();}
  // Safari may not fire afterprint on cancellation.
  setTimeout(cleanup,30000);
 }
 function download(d){if(!(d.blob instanceof Blob)){say('Originaldatei nicht verfügbar.',true);return;}const u=URL.createObjectURL(d.blob),a=document.createElement('a');a.href=u;a.download=d.name||'Bildgebung-Original';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);}
 function dispose(){if(currentUrl)URL.revokeObjectURL(currentUrl);currentUrl=null;viewer.replaceChildren();}
 async function showImage(d){dispose();const title=el('h4',d.name),downloadBtn=el('button','Originaldatei herunterladen','btn btn-outline');downloadBtn.type='button';downloadBtn.addEventListener('click',()=>download(d));viewer.append(title,downloadBtn);
  try{
   if(!(d.blob instanceof Blob))throw Error('Originaldaten nicht lesbar.');
   if(/\.(pdf)$/i.test(d.name)||d.mime==='application/pdf'){
    const msg=el('p','PDF im Safari-Dateibetrachter öffnen oder herunterladen.');const pdfBtn=el('button','PDF ansehen','btn btn-primary');pdfBtn.type='button';pdfBtn.addEventListener('click',()=>{const url=URL.createObjectURL(d.blob);const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)});viewer.append(msg,pdfBtn);
   }else if(isDcm(d)){
    const dicom=await window.ASTHMA_DICOM343?.parse(d.blob);if(!dicom)throw Error('DICOM-Betrachter noch nicht geladen.');
    const canvas=document.createElement('canvas');canvas.className='bi343-canvas';canvas.setAttribute('aria-label','DICOM-Bildvorschau');
    const ctrl=el('div',undefined,'bi343-controls');const level=el('label','Helligkeit / Fensterzentrum');const lvl=document.createElement('input');lvl.type='number';lvl.step='1';lvl.value=String(dicom.center??40);level.append(lvl);
    const width=el('label','Kontrast / Fensterbreite');const wid=document.createElement('input');wid.type='number';wid.min='1';wid.step='1';wid.value=String(dicom.width??400);width.append(wid);
    const frame=el('label','Bildnummer');const f=document.createElement('input');f.type='range';f.min='1';f.max=String(dicom.frames);f.value='1';f.disabled=dicom.frames===1;const counter=el('span','1 / '+dicom.frames);frame.append(f,counter);ctrl.append(frame,level,width);
    const presets=el('div',undefined,'bi343-presets');
    for(const [title,center,width] of [['Lunge',-600,1500],['Weichteile',40,400],['Knochen',300,1500]]){const btn=el('button',title,'btn btn-outline');btn.type='button';btn.addEventListener('click',()=>{lvl.value=String(center);wid.value=String(width);drawn()});presets.append(btn)}
    const zoom=el('label','Bildgröße');const size=document.createElement('input');size.type='range';size.min='100';size.max='300';size.value='100';size.step='25';const sizeText=el('span','100 %');zoom.append(size,sizeText);ctrl.append(zoom);
    size.addEventListener('input',()=>{canvas.style.width=size.value+'%';canvas.style.maxWidth='none';sizeText.textContent=size.value+' %'});
    const wrap=el('div',undefined,'bi343-image-scroll');wrap.append(canvas);
    const drawn=()=>{try{window.ASTHMA_DICOM343.render(dicom,canvas,Number(f.value)-1,Number(lvl.value),Number(wid.value));counter.textContent=f.value+' / '+dicom.frames;}catch(err){say('Vorschau: '+err.message,true)}};
    for(const inp of [f,lvl,wid])inp.addEventListener('input',drawn);viewer.append(ctrl,presets,wrap,el('p','DICOM-Vorschau (nicht für medizinische Diagnosen). Fensterwerte dienen nur der Anzeige. Bilddaten bleiben lokal.','bi343-muted'));drawn();
   }else{
    currentUrl=URL.createObjectURL(d.blob);const img=document.createElement('img');img.className='bi343-img';img.alt='Originalbild der radiologischen Untersuchung (nicht diagnostisch ausgewertet)';img.src=currentUrl;
    img.onerror=()=>{img.remove();viewer.append(el('p','Dieses Bildformat kann Safari hier nicht anzeigen. Originaldatei herunterladen und mit einer geeigneten App öffnen.','bi343-muted'));};viewer.append(img);
    const zoom=el('label','Bild vergrößern: 100 %');const range=document.createElement('input');range.type='range';range.min='100';range.max='300';range.step='25';range.value='100';zoom.append(range);viewer.insertBefore(zoom,img);
    const wrap=el('div',undefined,'bi343-image-scroll');viewer.replaceChild(wrap,img);wrap.append(img);
    range.addEventListener('input',()=>{img.style.maxWidth='none';img.style.width=range.value+'%';zoom.firstChild.textContent='Bild vergrößern: '+range.value+' %';});
   }
  }catch(err){viewer.append(el('p',err.message,'bi343-muted'));}
  viewer.scrollIntoView({behavior:'smooth',block:'start'});
 }
 async function refresh(){const id=++refreshCount;const [suite,docs]=await Promise.all([SEC.list('suite'),SEC.list('documents')]);if(id!==refreshCount)return;records=suite.filter(x=>x.type==='imaging343').map(x=>x.value).filter(x=>x&&validDate(x.date));documents=docs;renderRecords();}
 let timer;window.addEventListener('asthma:secure-change',ev=>{if(['suite','documents'].includes(ev.detail?.group)){clearTimeout(timer);timer=setTimeout(()=>refresh().catch(e=>say(e.message,true)),130)}});
 reset();refresh().catch(e=>say('Befunde konnten nicht geladen werden: '+e.message,true));
 window.__ASTHMA_IMAGING343_TEST=Object.freeze({version:'3.4.3',types:['xray','ct'],protocol:true,local:true});
})();
