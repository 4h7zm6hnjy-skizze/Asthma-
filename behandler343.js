'use strict';
/* Asthma 3.4.3: Arzt- und Klinikakten. Nur bestehender verschluesselter lokaler Tresor.
 * Eintraege ohne nachweisbaren Behandler bleiben ohne automatische Zuordnung. */
(()=>{
 const SEC=window.ASTHMA_SECURITY,NAV=window.ASTHMA_NAV,$=id=>document.getElementById(id);
 if(!SEC?.state?.().unlocked||!NAV||!$('start')||$('behandler'))return;
 const page=document.createElement('section');page.id='behandler';page.dataset.navPage='behandler';page.className='panel new-page bh343';page.hidden=true;
 page.innerHTML=`<div class="section-heading"><div><p class="section-kicker">Mein Behandlungsverlauf · lokale Gesundheitsakte</p><h2>ÄRZTE & KRANKENHÄUSER</h2><p>Eine Klinik oder Praxis auswählen und alle zugeordneten Termine, Untersuchungen und Originaldokumente an einer Stelle ansehen.</p></div><span class="shield">Privat verschlüsselt</span></div>
 <div class="bh343-shell">
 <section class="bh343-card"><h3>MEINE BEHANDLUNGSSTELLEN</h3><label class="bh343-search-label">Klinik oder Arzt suchen<input id="bh343-search" type="search" placeholder="z. B. Grafschaft, Lungenarzt, Hausarzt" autocomplete="off"></label><div id="bh343-providers" class="bh343-providers"></div><details class="bh343-more"><summary>NEUES KRANKENHAUS ODER ARZT HINZUFÜGEN</summary><form id="bh343-provider-form"><input name="id" type="hidden"><div class="bh343-grid"><label>Art der Einrichtung <select name="kind"><option value="hospital">Krankenhaus / Klinik</option><option value="pulmonologist">Lungenarzt / Pneumologie</option><option value="gp">Hausarzt / Hausärztin</option><option value="other">Andere Praxis / Therapeut</option></select></label><label>Name *<input name="name" type="text" maxlength="160" required placeholder="Klinik oder Praxis"></label><label>Ort (optional)<input name="location" maxlength="120" placeholder="z. B. Schmallenberg"></label><label>Telefon (optional)<input name="phone" type="tel" maxlength="60"></label><label>Weitere Schreibweisen (optional)<input name="aliases" maxlength="350" placeholder="Namen mit Semikolon trennen"></label><label>Notizen (optional)<textarea name="notes" maxlength="1500" rows="2"></textarea></label></div><div class="bh343-actions"><button type="submit" class="btn btn-primary">EINRICHTUNG SPEICHERN</button><button type="button" id="bh343-reset" class="btn btn-outline" hidden>Bearbeiten abbrechen</button></div></form></details><details class="bh343-more"><summary>ERKANNTE KLINIKEN UND PRAXEN AUS VORHANDENEN BEFUNDEN</summary><p class="bh343-muted">Nur konkrete Namen aus den gespeicherten Behandler-/Klinikfeldern. Du entscheidest, welche davon als eigene Einrichtung gespeichert werden.</p><div id="bh343-suggestions"></div></details></section>
 <section class="bh343-card" id="bh343-file" hidden><div class="bh343-file-head"><div><p class="section-kicker" id="bh343-type">Einrichtung</p><h3 id="bh343-name">–</h3><p id="bh343-meta" class="bh343-muted"></p></div><button class="btn btn-outline" id="bh343-edit" type="button">Bearbeiten</button></div><div id="bh343-counts" class="bh343-counts"></div><div class="bh343-actions"><button type="button" class="btn btn-outline" id="bh343-print">Akte drucken / PDF</button></div>
 <details class="bh343-more" id="bh343-upload-details"><summary>DOKUMENT ZU DIESER EINRICHTUNG HOCHLADEN</summary><form id="bh343-upload"><label>PDF oder Foto (max. 12 MB)<input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*"></label><label>Dokumentart <select name="kind"><option>Arztbrief</option><option>Entlassungsbericht</option><option>Lungenfunktionstest</option><option>Bluttest</option><option>Bildgebung</option><option>Schlaflaborbericht</option><option>Sonstiges</option></select></label><label>Dokumentdatum <input name="date" type="date"></label><button class="btn btn-primary" type="submit">VERSCHLÜSSELT ZUORDNEN</button></form></details>
 <details class="bh343-more"><summary>NEUEN ARZTTERMIN EINTRAGEN</summary><form id="bh343-appointment" class="bh343-grid"><label>Datum *<input name="date" type="date" required></label><label>Uhrzeit <input name="time" type="time"></label><label>Anlass *<input name="title" required maxlength="150" placeholder="Kontrolle, Gespräch, Befundbesprechung"></label><label>Notiz <textarea name="notes" rows="2" maxlength="1500"></textarea></label><button class="btn btn-primary" type="submit">TERMIN SPEICHERN</button></form></details>
 <h4 class="bh343-results-title">ZUORDNUNGEN & BEFUNDE</h4><label class="bh343-search-label">In dieser Akte suchen<input id="bh343-filter" type="search" placeholder="z. B. CT, FEV1, Oktober" autocomplete="off"></label><div id="bh343-records"></div><button type="button" class="btn btn-outline" id="bh343-more-records" hidden>Weitere Einträge anzeigen</button></section>
 <section class="bh343-card"><h3>NOCH NICHT ZUGEORDNETE UNTERSUCHUNGEN & DATEIEN</h3><p class="bh343-muted">Wähle oben zuerst eine Einrichtung. Ordne hier Befunde ohne eindeutige Klinik-/Praxisangabe zu. Deine Originaldaten werden nicht verändert.</p><label>Einträge suchen<input id="bh343-unassigned-search" type="search" placeholder="z. B. Datum, Labor, Röntgen"></label><div id="bh343-unassigned"></div><button type="button" class="btn btn-outline" id="bh343-more-unassigned" hidden>Weitere Einträge anzeigen</button></section>
 <p class="bh343-muted">Die Übersicht zeigt ausschließlich Einträge aus deiner lokalen Asthma-App. Sie ruft keine Krankenhaus- oder Arztserver ab. Gleichnamige Einrichtungen werden nicht ohne Bestätigung zusammengeführt.</p><p id="bh343-status" role="status" aria-live="polite"></p>
 </div>`;
 $('start').insertAdjacentElement('afterend',page);
 const labels={hospital:'KRANKENHAUS / KLINIK',pulmonologist:'LUNGENARZT / PNEUMOLOGIE',gp:'HAUSARZT / HAUSÄRZTIN',other:'ANDERE BEHANDLUNGSSTELLE'};
 const category={measurements:'Lungenfunktion',sleep340:'Schlaflabor',walk342:'Gehtest',imaging343:'Röntgen / CT',meds:'Therapie',calendar:'Termin',labs:'Labor',documents:'Originaldokument',cases:'Antrag',diary:'Tagebuch',epef:'Peak-Flow',au:'Arbeitsunfähigkeit'};
 const valid=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')&&!Number.isNaN(Date.parse(d))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;
 const dateText=d=>valid(d)?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):'Ohne Datum';
 const elem=(t,c,text)=>{const x=document.createElement(t);if(c)x.className=c;if(text!==undefined)x.textContent=String(text);return x};
 const uid=()=>crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
 const only=s=>String(s??'').replace(/\s+/g,' ').trim();
 const norm=s=>only(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de-DE').replace(/\b(?:fachkrankenhaus|krankenhaus|klinikum|fachklinik|praxis|dr\.|doktor|prof\.|mvz|gmbh|abteilung|klinik)\b/g,' ').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
 const score=(a,b)=>{const x=norm(a),y=norm(b);return x.length>=5&&y.length>=5&&(x===y||x.includes(y)&&y.length>=7||y.includes(x)&&x.length>=7)};
 const status=(s,err=false)=>{const x=$('bh343-status');x.textContent=s;x.classList.toggle('bh343-error',err)};
 let providers=[],links=[],entries=[],selected='',filteredLimit=80,unassignedLimit=40,epoch=0;
 const form=$('bh343-provider-form');
 const rawDetails=r=>[r.doctor,r.clinic,r.hospital,r.hospitalName,r.facility,r.practice,r.provider,r.institution,r.place,r.placeName,r.locationName].filter(x=>typeof x==='string'&&x.trim());
 function catalog(suite,documents,calendar,labs,diary,epef,au,cases){
  const list=[];
  const add=(group,row,id,data)=>{if(!id)return;const type=group==='suite'?String(row.type||'Eintrag'):group;
   const date=data.date||data.documentDate||(data.createdAt||'').slice(0,10)||data.from||data.submittedOn||'';
   const title=group==='documents'?data.name||'Datei':type==='imaging343'?((data.modality==='ct'?'CT':'Röntgen')+' · '+(data.region||'')):type==='walk342'?'Gehtest · '+(data.distance??'–')+' m':type==='sleep340'?'Schlaflabor · '+(data.studyType||''):type==='measurements'?'Lungenfunktion':group==='labs'?'Labor · '+(data.marker||data.label||'Messwert'):group==='calendar'?data.title||'Termin':group==='cases'?data.title||'Antrag':group==='diary'?'Asthma-Tagebuch':group==='epef'?'Peak-Flow':group==='au'?'AU':'Messung / '+type;
   const names=rawDetails(data);
   if(group==='documents'&&typeof data.providerName==='string')names.push(data.providerName);
   list.push({key:group+'|'+id,group,id:String(id),type,label:category[type]||category[group]||type,date:valid(date)?date:'',title:String(title).slice(0,180),data,record:row,names,studyId:data.studyId||null});
  };
  for(const x of suite){if(['provider343','providerlink343'].includes(x.type))continue;const v=x.value||{};add('suite',x,x.key||v.id,v);}
  for(const x of documents)add('documents',x,x.id,x);
  for(const x of calendar)add('calendar',x,x.id,x);
  for(const x of labs)add('labs',x,x.id,x);
  for(const x of diary)add('diary',x,x.id,x);
  for(const x of epef)if(x.kind==='measurement')add('epef',x,x.id,x);
  for(const x of au)add('au',x,x.id,x);
  for(const x of cases)add('cases',x,x.id,x);
  return list.sort((a,b)=>b.date.localeCompare(a.date)||a.title.localeCompare(b.title));
 }
 function matchesProvider(row,p){
  if(row.data.providerId===p.id)return true;
  const known=[p.name,...String(p.aliases||'').split(';').map(x=>x.trim())].filter(Boolean);
  return row.names.some(n=>known.some(k=>score(n,k)));
 }
 const findLink=row=>links.find(l=>l.entityKey===row.key);
 function assigned(row){const manual=findLink(row);if(manual)return manual.providerId;
  const explicit=row.data.providerId;
  if(explicit&&providers.some(p=>p.id===explicit))return explicit;
  // Attached files inherit a study's explicitly attributed hospital/doctor, without editing the document.
  if(row.studyId){const parent=entries.find(e=>e.group==='suite'&&e.data.id===row.studyId);if(parent){const link=findLink(parent);if(link)return link.providerId;const matches=providers.filter(p=>matchesProvider(parent,p));if(matches.length===1)return matches[0].id;}}
  const found=providers.filter(p=>matchesProvider(row,p));return found.length===1?found[0].id:'';
 }
 const go=row=>{const map={imaging343:'bildgebung',sleep340:'schlaflabor',walk342:'gehttest',measurements:'lungenwerte',meds:'therapie',calendar:'kalender',labs:'labor',diary:'akte',epef:'peakflow',au:'akte',cases:'antraege',documents:'akte'};NAV.go(map[row.type]||map[row.group]||'akte');if(row.group==='documents')document.querySelector('.my-tab[data-my-tab="documents"]')?.click();};
 function documentOpen(d){if(!(d.blob instanceof Blob)){status('Die Originaldatei ist nicht lesbar.',true);return}const u=URL.createObjectURL(d.blob),a=document.createElement('a');a.href=u;a.download=d.name||'Befund';a.click();setTimeout(()=>URL.revokeObjectURL(u),60000)}
 function card(row,allowAssign){
  const el=elem('article','bh343-entry');el.dataset.record=row.key;
  const head=elem('div','bh343-entryhead');head.append(elem('strong','',row.title),elem('small','',dateText(row.date)+' · '+row.label));el.append(head);
  const linked=findLink(row);const tag=assigned(row);
  if(tag){const p=providers.find(x=>x.id===tag);if(p)el.append(elem('p','bh343-muted','Zugeordnet: '+p.name+(linked?' (manuell)':' (aus Befund/Klinikname)')));}
  const details=elem('details','bh343-details');details.append(elem('summary','','DETAILS & ALLE WERTE'));
  const grid=elem('dl','bh343-values');let shown=0;
  const fieldNames={clinic:'Klinik / Praxis',doctor:'Arzt',date:'Datum',time:'Uhrzeit',type:'Art',place:'Ort / Einrichtung',region:'Körperbereich',modality:'Bildgebungsverfahren',findings:'Radiologischer Befund',assessment:'Ärztliche Beurteilung',recommendation:'Empfehlung',diagnosis:'Diagnose laut Befund',indication:'Fragestellung',comparison:'Vergleich mit Voraufnahmen',spo2mean:'Mittlere Sauerstoffsättigung',spo2min:'Niedrigste Sauerstoffsättigung',ahi:'AHI',rdi:'RDI',odi:'Sauerstoffabfallindex (ODI)',fev1:'FEV₁',fvc:'FVC',distance:'Gehstrecke',duration:'Belastungsdauer',weight:'Gewicht',value:'Messwert',notes:'Notizen',note:'Notiz',testType:'Testart',studyType:'Untersuchungsart',documentDate:'Befunddatum',kind:'Dokumentart',name:'Dateiname',size:'Dateigröße (Bytes)'};
  for(const [key,val] of Object.entries(row.data)){
   if(shown>=80)break;
   if(['blob','base64','id','key','type','createdAt','updatedAt','created','updated','source','providerId','studyId'].includes(key)||val===null||val===undefined||val==='')continue;
   if(typeof val==='object'||typeof val==='function')continue;
   if(String(val).length>4500)continue;
   const dt=elem('dt','',fieldNames[key]||key),dd=elem('dd','',String(val));grid.append(dt,dd);shown++;
  }
  if(!shown)grid.append(elem('dd','','Keine zusätzlichen Felder dokumentiert.'));
  details.append(grid);el.append(details);
  const actions=elem('div','bh343-actions');const open=elem('button','btn btn-outline','Zum Fachbereich');open.type='button';open.addEventListener('click',()=>go(row));actions.append(open);
  if(row.group==='documents'&&row.data.blob instanceof Blob){if(row.data.kind==='Bildgebung'&&window.ASTHMA_IMAGING343_OPEN){const viewer=elem('button','btn btn-primary','BILD ANSEHEN');viewer.type='button';viewer.addEventListener('click',()=>window.ASTHMA_IMAGING343_OPEN(row.data));actions.append(viewer)}const download=elem('button','btn btn-outline','Original öffnen / speichern');download.type='button';download.addEventListener('click',()=>documentOpen(row.data));actions.append(download);
   if(row.data.blob.type.startsWith('image/')||/\.(png|jpe?g|webp|heic|heif)$/i.test(row.data.name||'')){const imgBox=elem('details','bh343-picture');imgBox.append(elem('summary','','Bildvorschau'));let url=null;imgBox.addEventListener('toggle',()=>{if(imgBox.open&&!url){url=URL.createObjectURL(row.data.blob);const img=document.createElement('img');img.alt='Medizinisches Originalfoto';img.loading='lazy';img.src=url;imgBox.append(img)}else if(!imgBox.open&&url){URL.revokeObjectURL(url);url=null;imgBox.querySelector('img')?.remove()}});el.append(imgBox);}
  }
  if(allowAssign&&selected){const linkBtn=elem('button','btn btn-primary',tag===selected?'Zuordnung ändern':'DIESER EINRICHTUNG ZUORDNEN');linkBtn.type='button';linkBtn.disabled=tag===selected;linkBtn.addEventListener('click',()=>assignRecord(row,selected));actions.append(linkBtn)}
  if(linked&&selected&&linked.providerId===selected){const rem=elem('button','btn btn-text','Zuordnung aufheben');rem.type='button';rem.addEventListener('click',()=>unlinkRecord(linked));actions.append(rem)}
  el.append(actions);return el;
 }
 async function assignRecord(row,providerId){if(!SEC.state().unlocked)return;const id='providerlink343/'+encodeURIComponent(row.key);const obj={id,entityKey:row.key,providerId,updatedAt:new Date().toISOString()};try{await SEC.put('suite',{key:id,type:'providerlink343',value:obj},id);await refresh();status('Eintrag zugeordnet; Originaldaten unverändert.')}catch(e){status('Zuordnung fehlgeschlagen: '+e.message,true)}}
 async function unlinkRecord(link){try{await SEC.del('suite',link.id);await refresh();status('Manuelle Zuordnung aufgehoben.')}catch(e){status(e.message,true)}}
 function renderProviders(){const list=$('bh343-providers');list.replaceChildren();const s=$('bh343-search').value.toLocaleLowerCase('de-DE');const shown=providers.filter(p=>(p.name+' '+p.location+' '+labels[p.kind]).toLocaleLowerCase('de-DE').includes(s));if(!shown.length){list.append(elem('p','bh343-muted',providers.length?'Keine passende Einrichtung.':'Noch keine Behandlungseinrichtung angelegt. Mit „Neues Krankenhaus oder Arzt hinzufügen“ beginnen.'));return;}
  for(const p of shown){const count=entries.filter(e=>assigned(e)===p.id).length;const b=elem('button','bh343-provider'+(selected===p.id?' active':''));b.type='button';b.setAttribute('aria-pressed',String(selected===p.id));b.append(elem('small','',labels[p.kind]||labels.other),elem('strong','',p.name),elem('span','',(p.location||'')+(p.location?' · ':'')+count+' Einträge'));b.addEventListener('click',()=>{selected=p.id;filteredLimit=80;unassignedLimit=40;renderAll();$('bh343-file').scrollIntoView({block:'start',behavior:'smooth'})});list.append(b)}
 }
 function renderSuggestions(){const list=$('bh343-suggestions');list.replaceChildren();const used=new Set();const candidates=[];
  for(const e of entries)for(const n of e.names){const name=only(n);if(name.length<6||name.length>150||/^(krankenhaus|facharzt|arzt|labor|praxis|r[aä]ume|station|station\s*\d+)$/i.test(name))continue;const k=norm(name);if(k.length<5||used.has(k)||providers.some(p=>matchesProvider({names:[name],data:{}},p)))continue;used.add(k);candidates.push(name)}
  if(!candidates.length){list.append(elem('p','bh343-muted','Keine neuen eindeutigen Namen gefunden. Du kannst eine Einrichtung selbst hinzufügen.'));return;}
  if(!providers.length)list.closest('details').open=true;
  for(const name of candidates.slice(0,30)){const b=elem('button','btn btn-outline','Übernehmen: '+name);b.type='button';b.addEventListener('click',()=>{form.elements.name.value=name;form.elements.kind.value=/krankenhaus|klinikum|klinik/i.test(name)?'hospital':'other';form.elements.name.focus();form.closest('details').open=true;status('Bitte Art und Namen prüfen und Einrichtung speichern.')});list.append(b)}
 }
 function renderFile(){const p=providers.find(p=>p.id===selected),box=$('bh343-file');box.hidden=!p;if(!p)return;
  $('bh343-type').textContent=labels[p.kind]||labels.other;$('bh343-name').textContent=p.name;$('bh343-meta').textContent=[p.location,p.phone,p.notes].filter(Boolean).join(' · ');
  const found=entries.filter(e=>assigned(e)===selected),docs=found.filter(e=>e.group==='documents').length,appoint=found.filter(e=>e.group==='calendar').length;
  const count=$('bh343-counts');count.replaceChildren();for(const [title,value] of [['Einträge gesamt',found.length],['Originaldokumente',docs],['Termine',appoint]]){const c=elem('div','bh343-counter');c.append(elem('strong','',value),elem('small','',title));count.append(c)}
  const term=$('bh343-filter').value.toLocaleLowerCase('de-DE'),shown=found.filter(e=>(e.title+' '+e.label+' '+e.date+' '+e.names.join(' ')).toLocaleLowerCase('de-DE').includes(term));const host=$('bh343-records');host.replaceChildren();
  if(!shown.length)host.append(elem('p','bh343-muted',found.length?'Kein passender Eintrag.':'Noch keine dieser Einrichtung zugeordneten Befunde oder Termine.'));
  for(const r of shown.slice(0,filteredLimit))host.append(card(r,true));$('bh343-more-records').hidden=shown.length<=filteredLimit;
 }
 function renderUnassigned(){const host=$('bh343-unassigned');host.replaceChildren();if(!selected){host.append(elem('p','bh343-muted','Bitte zuerst oben eine Klinik oder Praxis auswählen.'));$('bh343-more-unassigned').hidden=true;return;}
  const txt=$('bh343-unassigned-search').value.toLocaleLowerCase('de-DE');const rows=entries.filter(e=>!assigned(e)&&(e.title+' '+e.label+' '+e.date+' '+e.names.join(' ')).toLocaleLowerCase('de-DE').includes(txt));for(const r of rows.slice(0,unassignedLimit))host.append(card(r,true));if(!rows.length)host.append(elem('p','bh343-muted','Keine nicht zugeordneten Einträge gefunden.'));$('bh343-more-unassigned').hidden=rows.length<=unassignedLimit;
 }
 function renderAll(){renderProviders();renderFile();renderUnassigned();renderSuggestions()}
 async function refresh(){const n=++epoch;const groups=['suite','documents','calendar','labs','diary','epef','au','cases'];const arrays=await Promise.all(groups.map(g=>SEC.list(g)));if(n!==epoch)return;
  const suite=arrays[0];providers=suite.filter(r=>r.type==='provider343').map(r=>r.value).filter(x=>x?.id&&x?.name).sort((a,b)=>a.name.localeCompare(b.name,'de'));
  links=suite.filter(r=>r.type==='providerlink343').map(r=>r.value).filter(x=>x?.id&&x?.entityKey);
  entries=catalog(...arrays);if(selected&&!providers.some(p=>p.id===selected))selected='';if(!selected&&providers.length)selected=providers[0].id;renderAll();
 }
 function resetForm(){form.reset();form.elements.id.value='';form.querySelector('[type="submit"]').textContent='EINRICHTUNG SPEICHERN';$('bh343-reset').hidden=true}
 form.addEventListener('submit',async e=>{e.preventDefault();const f=form.elements,id=f.id.value||uid(),name=only(f.name.value);if(name.length<3){status('Bitte einen eindeutigen Namen angeben.',true);return}
  const item={id,kind:f.kind.value,name,location:only(f.location.value),phone:only(f.phone.value),aliases:only(f.aliases.value),notes:only(f.notes.value),updatedAt:new Date().toISOString()};try{await SEC.put('suite',{key:'provider343/'+id,type:'provider343',value:item},'provider343/'+id);selected=id;resetForm();await refresh();form.closest('details').open=false;status('Einrichtung verschlüsselt gespeichert.')}catch(err){status('Speichern fehlgeschlagen: '+err.message,true)}
 });
 $('bh343-reset').addEventListener('click',resetForm);
 $('bh343-edit').addEventListener('click',()=>{const p=providers.find(p=>p.id===selected);if(!p)return;for(const k of ['id','kind','name','location','phone','aliases','notes'])form.elements[k].value=p[k]||'';form.querySelector('[type="submit"]').textContent='ÄNDERUNGEN SPEICHERN';$('bh343-reset').hidden=false;form.closest('details').open=true;form.scrollIntoView({behavior:'smooth'})});
 $('bh343-upload').addEventListener('submit',async e=>{e.preventDefault();const p=providers.find(x=>x.id===selected);if(!p)return;const f=e.target.elements,file=f.file.files[0];if(!file||!file.size||file.size>12*1048576||!/\.(pdf|jpe?g|png|webp|heic|heif)$/i.test(file.name)){status('Bitte PDF oder Foto bis 12 MB wählen.',true);return}
  const id=uid(),row={id,name:file.name.slice(0,180),size:file.size,mime:file.type||'application/octet-stream',blob:file,kind:f.kind.value,documentDate:f.date.value||'',providerId:p.id,providerName:p.name,createdAt:new Date().toISOString(),caseId:''};
  try{await SEC.put('documents',row,id);const check=await SEC.get('documents',id);if(!(check?.blob instanceof Blob)||check.blob.size!==file.size)throw Error('Datei konnte nicht bestätigt werden.');e.target.reset();await refresh();status('Dokument verschlüsselt bei '+p.name+' gespeichert.')}catch(err){status('Datei nicht gespeichert: '+err.message,true)}
 });
 $('bh343-appointment').addEventListener('submit',async e=>{e.preventDefault();const p=providers.find(x=>x.id===selected);if(!p)return;const f=e.target.elements;if(!valid(f.date.value)){status('Ungültiges Termindatum.',true);return}const id=uid(),row={id,date:f.date.value,endDate:f.date.value,time:f.time.value,type:p.kind==='pulmonologist'?'lungenarzt':'termin',place:p.name,title:only(f.title.value).slice(0,150),notes:only(f.notes.value),providerId:p.id};
  try{await SEC.put('calendar',row,id);e.target.reset();await refresh();status('Termin gespeichert. Er erscheint auch im Kalender.')}catch(err){status(err.message,true)}
 });
 $('bh343-search').addEventListener('input',renderProviders);$('bh343-filter').addEventListener('input',()=>{filteredLimit=80;renderFile()});$('bh343-unassigned-search').addEventListener('input',()=>{unassignedLimit=40;renderUnassigned()});$('bh343-more-records').addEventListener('click',()=>{filteredLimit+=80;renderFile()});$('bh343-more-unassigned').addEventListener('click',()=>{unassignedLimit+=40;renderUnassigned()});
 $('bh343-print').addEventListener('click',()=>{const p=providers.find(x=>x.id===selected);if(!p)return;if(!confirm('Diese Druckansicht enthält persönliche Gesundheitsdaten und ist nach dem Drucken/Export nicht verschlüsselt. Fortfahren?'))return;
  const sheet=elem('section','bh343-print-sheet');sheet.append(elem('h1','','Ärzte & Krankenhäuser – '+p.name),elem('p','',labels[p.kind]+' · '+p.location));for(const r of entries.filter(e=>assigned(e)===p.id)){sheet.append(elem('h3','',dateText(r.date)+' · '+r.title),elem('p','',r.label));for(const [k,v] of Object.entries(r.data)){if(['blob','base64','id','key','createdAt'].includes(k)||v===null||typeof v==='object'||v==='')continue;sheet.append(elem('p','',k+': '+String(v).slice(0,1500)))}}document.body.append(sheet);document.documentElement.classList.add('bh343-printing');const done=()=>{document.documentElement.classList.remove('bh343-printing');sheet.remove();window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);try{window.print()}finally{setTimeout(done,30000)}});
 let changeTimer;window.addEventListener('asthma:secure-change',e=>{if(['suite','documents','calendar','labs','diary','epef','au','cases'].includes(e.detail?.group)){clearTimeout(changeTimer);changeTimer=setTimeout(()=>refresh().catch(err=>status('Aktualisierung fehlgeschlagen: '+err.message,true)),220)}});
 refresh().catch(e=>status('Ärzteübersicht nicht verfügbar: '+e.message,true));window.__ASTHMA_BEHANDLER343_TEST=Object.freeze({version:'3.4.3',kinds:Object.keys(labels),norm,score});
})();
