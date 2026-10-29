'use strict';
/* Asthma 3.4.2 – 6-Minuten-Gehtest / Belastungstest mit BGA.
 * Persönliche Messungen und Bilder ausschließlich im verschlüsselten lokalen Tresor.
 * Keine Bilder oder Gesundheitswerte in Quellcode, Telemetrie oder Netzwerkanfragen.
 */
(()=>{
 const S=window.ASTHMA_SECURITY,NAV=window.ASTHMA_NAV,$=id=>document.getElementById(id);
 if(!S?.state?.().unlocked||!NAV||!$('start')||$('gehttest'))return;
 const metrics=[
  ['spo2','Pulsoxymetrie (SpO₂)','%','Sauerstoffsättigung am Finger. Zeigt nicht allein die gesamte Atmungsfunktion.',0,100],
  ['sao2','Blut-Sauerstoffsättigung (SaO₂)','%','Sauerstoffsättigung in der Blutgasanalyse. Messmethode und Probenart prüfen.',0,100],
  ['po2','Sauerstoffpartialdruck (pO₂)','Einheit im Befund prüfen','Zeigt den Sauerstoffdruck in der Blutprobe, nicht die ausgeatmete Luft.',0,300],
  ['pco2','Kohlendioxidpartialdruck (pCO₂)','Einheit im Befund prüfen','Hängt unter anderem von der Atmung ab. Ein Abfall ist nicht automatisch eine Verbesserung.',0,150],
  ['ph','pH-Wert','pH','Beschreibt das Säure-Basen-Gleichgewicht. Änderungen nur zusammen mit BGA beurteilen.',6.7,7.8],
  ['be','Basenabweichung (BE)','mmol/l (üblich)','Hilft bei der Einordnung des Säure-Basen-Haushalts. Negative Werte können auf ein Basendefizit hinweisen.',-40,40],
  ['hco3','Bicarbonat (HCO₃)','mmol/l (üblich)','Ein Puffersystem des Blutes. Gemeinsam mit pH und pCO₂ interpretieren.',0,70],
  ['lactate','Laktat','mmol/l (üblich)','Kann unter körperlicher Belastung steigen; nur eintragen, wenn gemessen.',0,40],
  ['heart','Puls','/min','Herzfrequenz vor bzw. nach dem Gehen.',0,250]
 ];
 const types={six:'6-Minuten-Gehtest',walk:'Gehtest',stairs:'Treppentest',other:'Anderer Belastungstest'};
 const page=document.createElement('section');page.id='gehttest';page.dataset.navPage='gehttest';page.className='panel new-page walk342';page.hidden=true;
 const cells=metrics.map(([key,label,unit,desc,min,max])=>
  '<div class="w342-measure"><div><strong>'+label+'</strong><small>'+desc+'</small></div><div class="w342-pair"><label>Vorher <input inputmode="decimal" type="number" step="any" min="'+min+'" max="'+max+'" name="'+key+'Pre" placeholder="–"></label><label>Nachher <input inputmode="decimal" type="number" step="any" min="'+min+'" max="'+max+'" name="'+key+'Post" placeholder="–"></label></div><small>Einheit: '+unit+'</small></div>').join('');
 page.innerHTML='<div class="section-heading"><div><p class="section-kicker">Belastbarkeit · Blutgaswerte</p><h2>GEHTEST / BELASTUNGSTEST</h2><p>6-Minuten-Gehtest, Gehstrecke, Sauerstoff und Blutgase getrennt von Spirometrie und Schlaflabor.</p></div><span class="shield">Lokal verschlüsselt</span></div>'+
 '<div class="w342-shell"><section class="w342-card"><h3>GESPEICHERTE MESSUNGEN</h3><div id="w342-summary" class="w342-summary"></div><div class="w342-chart-controls"><label>Zeitraum <select id="w342-period"><option value="30">Monat</option><option value="365">Jahr</option><option value="3652" selected>10 Jahre</option><option value="all">Alle</option></select></label><label>Diagrammwert <select id="w342-metric"><option value="distance">Gehstrecke (m)</option><option value="spo2Post">SpO₂ nach Belastung (%)</option><option value="sao2Post">SaO₂ nach Belastung (%)</option><option value="po2Post">pO₂ nach Belastung</option><option value="pco2Post">pCO₂ nach Belastung</option><option value="phPost">pH nach Belastung</option><option value="hco3Post">HCO₃ nach Belastung</option></select></label></div><div id="w342-graph"></div><p id="w342-graphnote" class="w342-muted"></p></section>'+
 '<section class="w342-card"><h3>NEUEN GEHTEST ERFASSEN</h3><p>Nur Werte eintragen, die auf dem Befund stehen. Leere Felder bleiben leer.</p><form id="w342-form"><input type="hidden" name="id"><div class="w342-grid">'+
 '<label>Datum *<input name="date" type="date" required></label><label>Testart <select name="testType"><option value="six">6-Minuten-Gehtest</option><option value="walk">Anderer Gehtest</option><option value="stairs">Treppentest</option><option value="other">Belastungstest</option></select></label>'+
 '<label>Krankenhaus / Arzt <input name="doctor" maxlength="160" placeholder="z. B. Fachklinik"></label><label>Testort <input name="setting" maxlength="100" placeholder="z. B. Flur"></label>'+
 '<label>Gehstrecke (m) <input type="number" min="0" max="3000" step="any" name="distance"></label><label>Belastungszeit (Minuten) <input name="duration" type="number" min="0" max="180" step="any"></label>'+
 '<label>Uhrzeit vorher <input name="timePre" type="time"></label><label>Uhrzeit nachher <input name="timePost" type="time"></label>'+
 '<label>Sauerstoffgabe <select name="oxygen"><option value="unknown">Nicht angegeben</option><option value="no">Ohne zusätzlichen Sauerstoff</option><option value="yes">Mit Sauerstoff</option></select></label><label>O₂-Menge (l/min, falls bekannt) <input name="oxygenFlow" type="number" min="0" max="30" step="any"></label></div>'+
 '<details open class="w342-expand"><summary>BLUTGASE & SAUERSTOFF · VORHER / NACHHER</summary><p>Die Messwerte werden getrennt gespeichert und mit einer verständlichen Erklärung angezeigt. Probenart und Einheiten des Originalbefunds beachten.</p><div class="w342-measures">'+cells+'</div></details>'+
 '<details class="w342-expand"><summary>BEFUND, NOTIZEN & ORIGINALDATEI</summary><div class="w342-grid"><label>Blutgas-Probenart <select name="sampleType"><option value="unknown">Nicht dokumentiert</option><option value="arterial">Arteriell laut Befund</option><option value="capillary">Kapillär laut Befund</option><option value="venous">Venös laut Befund</option></select></label><label>Einheit pO₂ / pCO₂ <select name="gasUnit"><option value="unknown">Im Befund nicht angegeben</option><option value="mmHg">mmHg ausdrücklich angegeben</option><option value="kPa">kPa ausdrücklich angegeben</option></select></label><label class="w342-wide">Arztkommentar / Beschwerden <textarea name="comment" rows="3" maxlength="1800"></textarea></label><label class="w342-wide">Notizen <textarea name="note" rows="3" maxlength="1800"></textarea></label><label class="w342-wide">Originalbild oder PDF (optional, max. 12 MB) <input name="report" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,application/pdf"></label></div></details>'+
 '<div class="w342-buttons"><button class="btn btn-primary" type="submit">MESSWERTE VERSCHLÜSSELT SPEICHERN</button><button class="btn btn-outline" id="w342-cancel" hidden type="button">Bearbeitung abbrechen</button></div></form><p id="w342-status" role="status" aria-live="polite"></p></section>'+
 '<section class="w342-card"><h3>PRIVATEN GEHTEST-BEFUND IMPORTIEREN</h3><p>Die fertige JSON-Datei auf deinem iPhone auswählen. Sie wird lokal geprüft und erst nach Bestätigung gespeichert. Die Originalaufnahme bleibt privat.</p><label class="btn btn-primary w342-import-label">GEHTEST-IMPORTDATEI AUSWÄHLEN <input type="file" id="w342-import" accept=".json,application/json"></label><p id="w342-import-status" role="status" aria-live="polite">Noch keine Importdatei ausgewählt.</p></section>'+
 '<section class="w342-card"><h3>MEINE GEHTEST-BEFUNDE & ERKLÄRUNGEN</h3><div id="w342-records"></div></section>'+
 '<section class="w342-card"><h3>ORIGINALDOKUMENTE</h3><div id="w342-documents"></div></section>'+
 '<details class="w342-expand"><summary>WAS SAGEN DIE MESSWERTE AUS?</summary><p><strong>Gehstrecke:</strong> Beschreibt die an diesem Tag erreichte Belastbarkeit. Alter, Körpergröße, Erkrankungen und Untersuchungsablauf beeinflussen das Ergebnis.</p><p><strong>SpO₂ und SaO₂:</strong> Zwei verschiedene Messungen der Sauerstoffsättigung – Fingerclip und Blutprobe; nicht vermischen.</p><p><strong>pO₂ und pCO₂:</strong> Sauerstoff- und Kohlendioxidpartialdruck in einer Blutprobe. Werte sind von der Probenart und Einheit abhängig.</p><p><strong>pH, BE und HCO₃:</strong> Gehören zur gemeinsamen Beurteilung des Säure-Basen-Haushalts.</p><p><strong>Veränderungen:</strong> Höhere oder niedrigere Zahlen sind nicht pauschal gut oder schlecht. Die App erläutert nur dokumentierte Messänderungen und stellt keine Diagnose.</p></details></div>';
 $('start').insertAdjacentElement('afterend',page);
 const f=$('w342-form'),status=$('w342-status');let records=[],docs=[],editing='',refreshSeq=0;
 const n=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
 const fmt=v=>Number(v).toLocaleString('de-DE',{maximumFractionDigits:2});
 const dmy=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v.slice(8)+'.'+v.slice(5,7)+'.'+v.slice(0,4):'–';
 const today=()=>{let d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const validDate=x=>{if(!/^\d{4}-\d\d-\d\d$/.test(x||''))return false;let d=new Date(x+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===x};
 const uid=()=>crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
 const el=(tag,cl,text)=>{let a=document.createElement(tag);if(cl)a.className=cl;if(text!==undefined)a.textContent=String(text);return a};
 const say=(target,text,error=false)=>{target.textContent=text;target.classList.toggle('error',error)};
 const textOf=(r,k)=>String(r[k]??'').trim();
 function normalize(data){
  if(!data||typeof data!=='object'||Array.isArray(data)||!validDate(data.date))throw Error('Ungültiges Untersuchungsdatum.');
  const row={id:String(data.id||uid()),date:data.date,testType:data.testType||'six',doctor:String(data.doctor||'').slice(0,160),setting:String(data.setting||'').slice(0,100),timePre:String(data.timePre||''),timePost:String(data.timePost||''),oxygen:data.oxygen||'unknown',sampleType:data.sampleType||'unknown',gasUnit:data.gasUnit||'unknown',comment:String(data.comment||'').slice(0,1800),note:String(data.note||'').slice(0,1800)};
  if(!/^[a-zA-Z0-9_-]{8,100}$/.test(row.id))throw Error('Ungültige Befundkennung.');
  if(!Object.hasOwn(types,row.testType)||!['unknown','no','yes'].includes(row.oxygen)||!['unknown','arterial','capillary','venous'].includes(row.sampleType)||!['unknown','mmHg','kPa'].includes(row.gasUnit))throw Error('Unbekannter Befundtyp oder Messbedingungen.');
  for(const k of ['timePre','timePost'])if(row[k]&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(row[k]))throw Error('Uhrzeit ungültig.');
  function numeric(k,min,max){const v=data[k];if(v===null||v===undefined||v===''){row[k]=null;return;}const x=Number(v);if(!Number.isFinite(x)||x<min||x>max)throw Error('Ungültiger Wert: '+k);row[k]=x;}
  numeric('distance',0,3000);numeric('duration',0,180);numeric('oxygenFlow',0,30);
  for(const [k,,,,low,high] of metrics)for(const phase of ['Pre','Post'])numeric(k+phase,low,high);
  if(row.oxygen==='no'&&row.oxygenFlow!==null&&row.oxygenFlow>0)throw Error('Ohne O₂ kann keine zusätzliche Sauerstoffgabe eingetragen sein.');
  if(row.duration===null&&row.distance===null&&!metrics.some(([k])=>row[k+'Pre']!==null||row[k+'Post']!==null)&&!row.note&&!row.comment)throw Error('Bitte mindestens einen Messwert oder eine Notiz eintragen.');
  row.createdAt=typeof data.createdAt==='string'?data.createdAt:new Date().toISOString();row.updatedAt=new Date().toISOString();
  return row;
 }
 function readForm(){const obj={id:editing||uid()};for(const field of f.elements){if(!field.name||field.name==='report')continue;obj[field.name]=field.value;}return normalize(obj)}
 function reset(){f.reset();f.elements.date.value=today();editing='';f.elements.id.value='';$('w342-cancel').hidden=true;f.querySelector('[type="submit"]').textContent='MESSWERTE VERSCHLÜSSELT SPEICHERN';}
 function edit(row){reset();editing=row.id;for(const field of f.elements){if(field.name&&field.name!=='report')field.value=row[field.name]??'';}f.querySelector('[type="submit"]').textContent='ÄNDERUNGEN VERSCHLÜSSELT SPEICHERN';$('w342-cancel').hidden=false;f.scrollIntoView({block:'start',behavior:'smooth'})}
 async function saveDocument(blob,name,studyId,date,caption,source){
  const ext=/\.(pdf|jpe?g|png|webp|heic|heif)$/i;
  if(!ext.test(name)||!blob.size||blob.size>12*1024*1024)throw Error('Originaldatei muss ein Foto/PDF bis 12 MB sein.');
  const existing=(await S.list('documents')).find(x=>x.kind==='Gehtestbericht'&&x.studyId===studyId&&x.name===name&&x.size===blob.size);
  if(existing)return false;
  const id=uid();const doc={id,name:name.slice(0,180),size:blob.size,mime:blob.type||'application/octet-stream',blob,kind:'Gehtestbericht',studyId,documentDate:date,caseId:'',caption:caption.slice(0,180),source,createdAt:new Date().toISOString()};
  await S.put('documents',doc,id);const check=await S.get('documents',id);if(!(check?.blob instanceof Blob)||check.blob.size!==blob.size)throw Error('Originaldatei wurde nicht korrekt gespeichert.');return true;
 }
 async function persist(row,file=null){
  const key='walk342/'+row.id;const previous=await S.get('suite',key);
  await S.put('suite',{key,type:'walk342',value:{...row,createdAt:previous?.value?.createdAt||row.createdAt}},key);
  const check=await S.get('suite',key);if(!check||check.value?.date!==row.date)throw Error('Befundwerte konnten nicht bestätigt werden.');
  if(file)await saveDocument(file,file.name,row.id,row.date,'Originalbefund Gehtest','walk342-form');
 }
 async function onSubmit(e){e.preventDefault();let record;try{record=readForm()}catch(e){say(status,e.message,true);return}const btn=f.querySelector('[type="submit"]');btn.disabled=true;try{await persist(record,f.elements.report.files?.[0]);reset();await refresh();say(status,'Gehtest mit Messwerten verschlüsselt gespeichert.')}catch(e){say(status,e.message,true);await refresh().catch(()=>{})}finally{btn.disabled=false}}
 function fromBase64(b64){if(typeof b64!=='string'||b64.length>17_000_000||!/^[-a-zA-Z0-9+/]+={0,2}$/.test(b64))throw Error('Bilddaten ungültig.');let raw=atob(b64),arr=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);if(arr[0]!==255||arr[1]!==216||arr[arr.length-2]!==255||arr[arr.length-1]!==217)throw Error('Originalbild ist keine gültige JPEG-Datei.');return new Blob([arr],{type:'image/jpeg'})}
 async function importFile(file){const target=$('w342-import-status');try{
  if(!file||file.size<50||file.size>20*1024*1024)throw Error('Bitte eine JSON-Datei bis 20 MB auswählen.');
  const packet=JSON.parse(await file.text());if(packet.kind!=='Asthma-Walk-Test-v1'||packet.version!==1||!Array.isArray(packet.records)||packet.records.length<1||packet.records.length>20||!Array.isArray(packet.images)||packet.images.length>20)throw Error('Die Datei hat kein unterstütztes Gehtest-Importformat.');
  const rows=packet.records.map(normalize),ids=new Set();for(const r of rows){if(ids.has(r.id))throw Error('Untersuchung doppelt im Import.');ids.add(r.id)}
  const images=packet.images.map(img=>{if(!ids.has(img.studyId)||typeof img.filename!=='string'||!/^[\w.-]{1,150}\.jpe?g$/i.test(img.filename)||img.mime!=='image/jpeg')throw Error('Ungültiges Bild im Import.');return {...img,blob:fromBase64(img.base64)}});
  if(!confirm(rows.length+' Gehtestbefund(e) mit '+images.length+' Originalbild(ern) privat übernehmen? Vorhandene Einträge mit gleicher Kennung bleiben erhalten.')){say(target,'Import abgebrochen.');return;}
  let saved=0,pictures=0;
  for(const row of rows){const key='walk342/'+row.id;if(await S.get('suite',key))continue;await persist(row);saved++}
  for(const img of images)if(await saveDocument(img.blob,img.filename,img.studyId,rows.find(r=>r.id===img.studyId).date,String(img.caption||'Gehtest-Befund'),'walk342-import'))pictures++;
  await refresh();say(target,saved+' neue Gehtest-Messung(en), '+pictures+' Originalbild(er) verschlüsselt gespeichert. Vorhandene Einträge nicht überschrieben.');
 }catch(e){say(target,'Import fehlgeschlagen: '+e.message,true)}finally{$('w342-import').value=''}}
 function descriptor(key,before,after){let info=metrics.find(x=>x[0]===key);let n1=n(before),n2=n(after),d=n1!==null&&n2!==null?n2-n1:null;
  let line=(info?.[3]||'')+' ';if(d!==null)line+='Veränderung: '+(d>0?'+':'')+fmt(d)+' '+(info?.[2]==='%'?'Prozentpunkte':info?.[2]||'')+'. ';else line+='Vorher/Nachher nicht vollständig dokumentiert. ';
  line+='Ein Zahlenanstieg oder -abfall allein beweist keine klinische Verbesserung oder Verschlechterung.';return line}
 function renderList(){const host=$('w342-records');host.replaceChildren();if(!records.length){host.append(el('p','w342-muted','Noch keine Gehtests gespeichert.'));return}
  for(const r of [...records].reverse()){
   const card=el('article','w342-record'),header=el('div','w342-recordhead');header.append(el('strong','',dmy(r.date)+' · '+(types[r.testType]||'Belastungstest')),el('small','',r.doctor||'Klinik nicht angegeben'));card.append(header);
   const stats=el('div','w342-kpis');for(const [key,label,unit] of [['distance','Gehstrecke','m'],['duration','Belastungsdauer','min'],['spo2Post','SpO₂ nachher','%'],['sao2Post','SaO₂ nachher','%']]){if(n(r[key])===null)continue;const b=el('div','w342-kpi');b.append(el('small','',label),el('strong','',fmt(r[key])+' '+unit));stats.append(b)}card.append(stats);
   const cond=el('p','w342-muted','Messbedingungen: '+(r.setting||'nicht genannt')+' · '+(r.oxygen==='no'?'ohne zusätzlichen O₂':r.oxygen==='yes'?'mit O₂':'O₂ nicht angegeben')+' · '+(r.timePre||'–')+' bis '+(r.timePost||'–'));card.append(cond);
   const details=el('details','w342-explanations');const summary=el('summary','','MESSWERTE UND ERKLÄRUNGEN ANZEIGEN');details.append(summary);
   const table=el('table','w342-table'),head=el('thead'),tr=el('tr');for(const h of ['Messwert','Vorher','Nachher'])tr.append(el('th','',h));head.append(tr);table.append(head);
   const tbody=el('tbody');for(const [key,label,unit] of metrics){if(n(r[key+'Pre'])===null&&n(r[key+'Post'])===null)continue;const row=el('tr');for(const v of [label,n(r[key+'Pre'])===null?'–':fmt(r[key+'Pre'])+' '+(unit.includes('(')?'':unit),n(r[key+'Post'])===null?'–':fmt(r[key+'Post'])+' '+(unit.includes('(')?'':unit)])row.append(el('td','',v));tbody.append(row);
    const desc=el('tr','w342-desc'),td=el('td','',descriptor(key,r[key+'Pre'],r[key+'Post']));td.colSpan=3;desc.append(td);tbody.append(desc);
   }table.append(tbody);details.append(table);if(r.comment)details.append(el('p','',r.comment));if(r.note)details.append(el('p','',r.note));card.append(details);
   const actions=el('div','w342-buttons'),change=el('button','btn btn-outline','Bearbeiten'),remove=el('button','btn btn-text','Löschen');change.type=remove.type='button';change.addEventListener('click',()=>edit(r));remove.addEventListener('click',async()=>{if(!confirm('Diesen Gehtest löschen? Originalbilder bleiben in der Akte.'))return;await S.del('suite','walk342/'+r.id);if(editing===r.id)reset();await refresh()});actions.append(change,remove);card.append(actions);host.append(card);
  }
 }
 function renderDocs(){const host=$('w342-documents');host.replaceChildren();const linked=docs.filter(d=>d.kind==='Gehtestbericht');if(!linked.length){host.textContent='Noch kein Originalbild oder PDF hinterlegt.';return;}
  for(const d of linked){const card=el('div','w342-doc'),label=el('div');label.append(el('strong','',d.name),el('small','',dmy(d.documentDate||'')+' · '+(d.size/1048576).toFixed(1)+' MB'));const btn=el('button','btn btn-outline','Öffnen / speichern');btn.type='button';btn.addEventListener('click',()=>{if(!(d.blob instanceof Blob)){say(status,'Originalbild nicht lesbar.',true);return}const url=URL.createObjectURL(d.blob),a=document.createElement('a');a.href=url;a.download=d.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)});card.append(label,btn);host.append(card)}
 }
 function drawChart(){const host=$('w342-graph'),info=$('w342-graphnote'),choice=$('w342-metric').value,days=$('w342-period').value;host.replaceChildren();let cutoff='0000-01-01';if(days!=='all'){const date=new Date();date.setHours(12,0,0,0);if(days==='3652')date.setFullYear(date.getFullYear()-10);else if(days==='365')date.setFullYear(date.getFullYear()-1);else date.setDate(date.getDate()-Number(days)+1);cutoff=date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
  const pts=records.filter(r=>r.date>=cutoff&&n(r[choice])!==null);if(!pts.length){host.textContent='Noch keine Messwerte für dieses Diagramm im ausgewählten Zeitraum.';info.textContent='';return}
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 680 275');svg.setAttribute('role','img');svg.setAttribute('aria-label','Gehtest-Verlauf '+choice+', '+pts.length+' Messungen');host.append(svg);
  const shape=(tag,atts,text,parent=svg)=>{const t=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(atts))t.setAttribute(k,String(v));if(text!==undefined)t.textContent=text;parent.append(t);return t};
  const vals=pts.map(r=>r[choice]),mi=Math.min(...vals),ma=Math.max(...vals),pad=Math.max(1,(ma-mi)*.13,Math.abs(ma)*.06),lo=choice==='ph'?mi-pad:Math.max(0,mi-pad),hi=ma+pad;
  const xy=(v,i)=>[76+(pts.length===1?260:i*(570/(pts.length-1))),25+(hi-v)/(hi-lo)*195];for(let i=0;i<5;i++){const y=25+i*195/4;shape('line',{x1:76,x2:646,y1:y,y2:y,stroke:'#dce8ec'});shape('text',{x:69,y:y+4,'text-anchor':'end','font-size':13,fill:'#506875'},fmt(hi-i*(hi-lo)/4))}
  let prev;pts.forEach((r,i)=>{const [x,y]=xy(r[choice],i);if(prev)shape('line',{x1:prev[0],y1:prev[1],x2:x,y2:y,stroke:'#206b89','stroke-width':3});const c=shape('circle',{cx:x,cy:y,r:6,fill:'#206b89'});shape('title',{},dmy(r.date)+': '+fmt(r[choice]),c);if(pts.length<9)shape('text',{x,y:Math.max(15,y-12),'text-anchor':'middle','font-size':12,'font-weight':700,fill:'#244f62'},fmt(r[choice]));prev=[x,y]});
  for(const i of [...new Set([0,Math.floor((pts.length-1)/2),pts.length-1])]){const [x]=xy(pts[i][choice],i);shape('text',{x,y:250,'text-anchor':i===0?'start':i===pts.length-1?'end':'middle','font-size':12,fill:'#456374'},dmy(pts[i].date))}
  info.textContent=pts.length===1?'Ein Messpunkt ist kein Trend. Neue Gehtests ergänzen diese Kurve.':pts.length+' dokumentierte Gehtests. Nur Tests mit vergleichbaren Methoden und Einheiten gegenüberstellen.';
 }
 async function refresh(){let token=++refreshSeq;const [suite,documents]=await Promise.all([S.list('suite'),S.list('documents')]);if(token!==refreshSeq)return;records=suite.filter(x=>x.type==='walk342'&&x.value?.date).map(x=>x.value).sort((a,b)=>a.date.localeCompare(b.date));docs=documents;const box=$('w342-summary');box.replaceChildren();const last=records.at(-1);if(!last){box.append(el('p','w342-muted','Noch keine Untersuchungen hinterlegt.'))}else{box.append(el('div','w342-kpi',''),el('div','w342-kpi',''));box.children[0].append(el('small','','Letzter Gehtest'),el('strong','',dmy(last.date)));box.children[1].append(el('small','','Gehstrecke'),el('strong','',n(last.distance)===null?'Nicht dokumentiert':fmt(last.distance)+' m'))}renderList();renderDocs();drawChart()}
 f.addEventListener('submit',onSubmit);$('w342-cancel').addEventListener('click',reset);$('w342-import').addEventListener('change',e=>{const file=e.target.files?.[0];if(file)importFile(file)});for(const id of ['w342-period','w342-metric'])$(id).addEventListener('change',drawChart);
 let timer;window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite'||e.detail?.group==='documents'){clearTimeout(timer);timer=setTimeout(()=>refresh().catch(err=>say(status,err.message,true)),120)}});
 reset();refresh().catch(e=>say(status,'Gehtestdaten nicht verfügbar: '+e.message,true));
 window.__ASTHMA_WALK342_TEST=Object.freeze({version:'3.4.2',fields:metrics.map(x=>x[0]),importKind:'Asthma-Walk-Test-v1',validDate,normalize});
})();
