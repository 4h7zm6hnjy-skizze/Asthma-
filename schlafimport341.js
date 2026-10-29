'use strict';
/* Asthma 3.4.1 – Private Schlaf-Polygraphie mit Originalkurven, ohne HTTP oder GitHub-Uploads. */
(()=>{
 const S=window.ASTHMA_SECURITY,$=id=>document.getElementById(id),page=$('schlaflabor');
 if(!page||!S||$('sl341-import'))return;
 const original=$('sl340-records'),archive=$('sl340-documents');if(!original||!archive)return;
 const box=document.createElement('section');box.id='sl341-import';box.className='sl340-card sl341-import';
 box.innerHTML='<h3>BEFUND MIT ORIGINALDIAGRAMMEN IMPORTIEREN</h3>'+
 '<p>Einmalig die private Schlaflabor-Importdatei auf deinem iPhone auswählen. Messwerte und Originalgrafiken werden erst nach deiner Bestätigung <strong>verschlüsselt im lokalen Tresor</strong> gespeichert. Nicht auf GitHub hochladen.</p>'+
 '<label class="sl341-file-label btn btn-primary">Private Schlaflabor-Datei auswählen<input id="sl341-file" type="file" accept=".json,application/json"></label>'+
 '<p id="sl341-status" class="sl340-status" role="status" aria-live="polite">Noch keine Importdatei ausgewählt.</p>';
 const shell=page.querySelector('.sl340-shell');shell?.insertBefore(box,original.closest('.sl340-card'));
 const gallery=document.createElement('section');gallery.id='sl341-gallery';gallery.className='sl340-card sl341-gallery';
 gallery.innerHTML='<h3>ORIGINALDIAGRAMME & BEFUNDSEITEN</h3><p>Originale aus deinen Schlafmessungen, nach Untersuchungsdatum geordnet. Tippe auf eine Abbildung zum Vergrößern. Keine mathematisch nachgebildeten Rohkurven.</p><div id="sl341-items"></div>';
 archive.closest('.sl340-card')?.insertAdjacentElement('afterend',gallery);
 const message=$('sl341-status'),input=$('sl341-file'),items=$('sl341-items');let processing=false,urls=[];
 const say=(v,error=false)=>{message.textContent=v;message.classList.toggle('error',error)};
 const validDate=s=>/^\d{4}-\d\d-\d\d$/.test(s||'')&&!Number.isNaN(Date.parse(s+'T12:00:00Z'));
 function decodeImage(record){
   if(!record||record.mime!=='image/jpeg'||typeof record.base64!=='string'||record.base64.length>17_000_000||!/^[A-Za-z0-9+/]+={0,2}$/.test(record.base64))throw Error('Ungültiges Befundfoto in der Importdatei.');
   const raw=atob(record.base64);if(raw.length>12*1024*1024||raw.length<1000)throw Error('Befundfoto überschreitet 12 MB oder ist leer.');
   const buf=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)buf[i]=raw.charCodeAt(i);
   if(buf[0]!==255||buf[1]!==216||buf[buf.length-2]!==255||buf[buf.length-1]!==217)throw Error('Importfoto ist keine vollständige JPEG-Datei.');
   return new Blob([buf],{type:'image/jpeg'});
 }
 function validate(data){
   if(!data||data.kind!=='Asthma-Sleep-Study-v1'||data.version!==1||!data.study||!Array.isArray(data.images))throw Error('Kein unterstützter Schlaflaborimport.');
   const s=data.study;if(!validDate(s.date)||s.studyType!=='polygraphy'||!/^sleep-[a-z0-9-]+$/.test(s.id||''))throw Error('Studien-ID, Untersuchungsart oder Datum ungültig.');
   if(!data.images.length||data.images.length>8)throw Error('Erwartet werden höchstens acht Originalbilder.');
   const allowed=['ahi','rdi','rei','odi','spo2mean','spo2min','t90','obstructive','central','mixed','hypopnea','cai','oai','tst','tib','efficiency','sleepLatency','remLatency','waso','n1','n2','n3','rem','arousal','plmi','snoring','pressure','pressureMin','pressureMax','residualAhi','usage','leak','usePercent','ess','t90min','t88min','hrMean','hrMin','hrMax','co2max','ahiSupine','ahiOther','pressureI','pressureE'];
   const clean={id:s.id,date:s.date,time:/^\d\d:\d\d$/.test(s.time||'')?s.time:'',studyType:'polygraphy',papMode:'',odiRule:'',doctor:String(s.doctor||'').slice(0,150),diagnosis:'',recommendation:'',symptoms:'',device:'',note:String(s.note||'').slice(0,1800),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
   for(const k of allowed){let v=s[k];if(v===undefined||v===null||v===''){clean[k]=null;continue;}if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>10000)throw Error('Ungültige Angabe: '+k);clean[k]=v;}
   const seen=new Set();for(let i=0;i<data.images.length;i++){const a=data.images[i];if(!a||typeof a.filename!=='string'||!/^schlaf-2022-09-20-\d\.jpg$/.test(a.filename)||seen.has(a.filename))throw Error('Befundbild-Name ungültig oder doppelt.');seen.add(a.filename);}
   return clean;
 }
 async function importPrivate(file){
   if(processing)return;processing=true;input.disabled=true;
   try{
     if(!S.state().unlocked)throw Error('Bitte zuerst die Gesundheitsakte entsperren.');
     if(!file||file.size>20*1024*1024||file.size<500)throw Error('Importdatei fehlt oder ist zu groß.');
     say('Datei wird lokal geprüft …');const data=JSON.parse(await file.text()),study=validate(data);
     const images=data.images.map((a,i)=>({blob:decodeImage(a),name:a.filename,caption:String(a.caption||'Originalbefund').slice(0,160),reportGroup:a.reportGroup==='graph'?'graph':'report',sortIndex:i+1}));
     if(!confirm('Schlafmessung vom 20.09.2022 mit '+images.length+' Originalseiten und Diagrammen verschlüsselt in der Asthma-App speichern? Es erfolgt keine Übertragung an GitHub.')){say('Import abgebrochen.');return;}
     const id='sleep340/'+study.id;let created=0;
     if(!await S.get('suite',id)){
       await S.put('suite',{key:id,type:'sleep340',value:study},id);
       const verify=await S.get('suite',id);if(verify?.value?.id!==study.id)throw Error('Messwerte konnten nach dem Speichern nicht verifiziert werden.');created++;
     }
     let added=0;
     for(const a of images){const docId='sleep341-'+a.name.replace(/[^A-Za-z0-9_-]/g,'-');
       if(await S.get('documents',docId))continue;
       const doc={id:docId,name:a.name,size:a.blob.size,mime:'image/jpeg',blob:a.blob,kind:'Schlaflaborbericht',studyId:study.id,documentDate:study.date,caseId:'',createdAt:new Date().toISOString(),caption:a.caption,reportGroup:a.reportGroup,sortIndex:a.sortIndex,source:'schlafimport341'};
       await S.put('documents',doc,docId);
       const found=await S.get('documents',docId);if(!(found?.blob instanceof Blob)||found.blob.size!==a.blob.size)throw Error('Speicherprüfung beim Bild '+a.name+' fehlgeschlagen.');
       added++;
     }
     await refreshGallery();say((created?'Messwerte übernommen. ':'Messwerte waren bereits vorhanden. ')+added+' Originalgrafik(en) neu verschlüsselt gespeichert; '+(images.length-added)+' bereits vorhanden. Diagramme erscheinen weiter unten im Schlaflabor.');
     window.dispatchEvent(new CustomEvent('asthma:sleep-study-imported',{detail:{id:study.id}}));
   }catch(e){say('Import nicht vollständig: '+(e?.message||String(e))+' Ein erneuter Import ergänzt fehlende Originale, ohne vorhandene zu überschreiben.',true)}
   finally{processing=false;input.disabled=false;input.value='';}
 }
 input.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)importPrivate(file)});
 const dateFmt=s=>/^\d{4}-\d\d-\d\d$/.test(s||'')?s.slice(8)+'.'+s.slice(5,7)+'.'+s.slice(0,4):'–';
 let queue=0;
 async function refreshGallery(){
   const token=++queue;const docs=(await S.list('documents')).filter(d=>d.kind==='Schlaflaborbericht'&&d.blob instanceof Blob).sort((a,b)=>(b.documentDate||'').localeCompare(a.documentDate||'')||(a.sortIndex||99)-(b.sortIndex||99));if(token!==queue)return;
   for(const u of urls)URL.revokeObjectURL(u);urls=[];items.replaceChildren();
   if(!docs.length){const p=document.createElement('p');p.textContent='Noch keine Originaldiagramme hinterlegt. Importiere zuerst die private Befunddatei.';items.append(p);return;}
   const figs=docs.filter(d=>d.mime?.startsWith('image/')||d.blob.type.startsWith('image/'));
   const imgPanel=document.createElement('div');imgPanel.className='sl341-grid';items.append(imgPanel);
   for(const d of figs){const fig=document.createElement('figure');fig.className='sl341-figure';const url=URL.createObjectURL(d.blob);urls.push(url);
     const img=document.createElement('img');img.src=url;img.alt=d.caption||d.name;img.loading='lazy';
     const cap=document.createElement('figcaption');cap.textContent=(dateFmt(d.documentDate||'')+' · ')+(d.caption||d.name);
     const button=document.createElement('button');button.type='button';button.className='btn btn-outline';button.textContent='Groß ansehen';button.addEventListener('click',()=>{window.open(url,'_blank','noopener,noreferrer')});
     fig.append(img,cap,button);imgPanel.append(fig);
   }
   const pdfs=docs.filter(d=>d.mime==='application/pdf'||d.blob.type==='application/pdf');if(pdfs.length){const p=document.createElement('p');p.textContent=pdfs.length+' weitere PDF-Bericht(e) unter „Originalberichte“ verfügbar.';items.append(p);}
 }
 let refreshTimer;window.addEventListener('asthma:secure-change',ev=>{if(ev.detail?.group==='documents'){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>refreshGallery().catch(e=>say(e.message,true)),160)}});
 refreshGallery().catch(e=>say('Originalgrafiken konnten nicht gelesen werden: '+e.message,true));
 window.__ASTHMA_SLEEP341_TEST=Object.freeze({version:'3.4.1',format:'Asthma-Sleep-Study-v1',maxImages:8});
})();
