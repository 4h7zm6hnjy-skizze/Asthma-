'use strict';
/* Asthma 3.4.0 – Schlaflaborakte, lokale AES-GCM-Speicherung in bestehender suite.
   Nur dokumentierte Werte, keine automatischen medizinischen Diagnosen. */
(()=>{
 const S=window.ASTHMA_SECURITY,NAV=window.ASTHMA_NAV,$=id=>document.getElementById(id);
 if(!S||!NAV||!$('start')||$('schlaflabor'))return;
 const fields=[
  ['ahi','AHI – Apnoe-Hypopnoe-Index','Ereignisse/h',0,200,'Atemaussetzer und verminderte Atemzüge pro Stunde Schlaf'],
  ['rdi','RDI – Atemstörungsindex','Ereignisse/h',0,200,'AHI plus weitere atembezogene Weckreaktionen (Definition im Befund prüfen)'],
  ['rei','REI – Heimtest-Index','Ereignisse/h',0,200,'Ereignisse pro Stunde Aufzeichnungszeit; nicht mit AHI gleichsetzen'],
  ['odi','ODI – Sauerstoffabfallindex','Abfälle/h',0,200,'Häufigkeit von Sauerstoffabfällen; 3- oder 4-%-Definition notieren'],
  ['spo2mean','SpO₂ – Durchschnitt','%',0,100,'Durchschnittliche Sauerstoffsättigung während der Messung'],
  ['spo2min','SpO₂ – niedrigster Wert','%',0,100,'Niedrigste dokumentierte Sauerstoffsättigung'],
  ['t90','T90 – Zeit unter 90 % SpO₂','%',0,100,'Anteil der gemessenen Zeit mit Sauerstoffsättigung unter 90 %'],
  ['obstructive','Obstruktive Apnoen','Anzahl',0,10000,'Atemaussetzer mit weiterhin vorhandener Atemanstrengung'],
  ['central','Zentrale Apnoen','Anzahl',0,10000,'Atemaussetzer ohne entsprechende Atemanstrengung'],
  ['mixed','Gemischte Apnoen','Anzahl',0,10000,'Gemischte Atemaussetzer'],
  ['hypopnea','Hypopnoen','Anzahl',0,10000,'Verminderte Atemzüge'],
  ['cai','CAI – zentraler Apnoeindex','Ereignisse/h',0,200,'Zentrale Apnoen pro Stunde'],
  ['oai','OAI – obstruktiver Apnoeindex','Ereignisse/h',0,200,'Obstruktive Apnoen pro Stunde'],
  ['tst','Gesamtschlafzeit (TST)','Minuten',0,1500,'Tatsächlich geschlafene Zeit'],
  ['tib','Zeit im Bett (TIB)','Minuten',0,1500,'Zeit zwischen Zubettgehen und Aufstehen'],
  ['efficiency','Schlafeffizienz','%',0,100,'Anteil der Bettzeit mit Schlaf laut Messung'],
  ['sleepLatency','Einschlaflatenz','Minuten',0,1000,'Zeit bis zum Einschlafen'],
  ['remLatency','REM-Latenz','Minuten',0,1000,'Zeit bis zur ersten REM-Phase'],
  ['waso','Wachzeit nach Einschlafen (WASO)','Minuten',0,1200,'Nach dem Einschlafen wach verbrachte Zeit'],
  ['n1','Schlafphase N1','%',0,100,'Anteil des leichten Schlafs N1'],
  ['n2','Schlafphase N2','%',0,100,'Anteil des Schlafs N2'],
  ['n3','Tiefschlaf N3','%',0,100,'Anteil des Tiefschlafs'],
  ['rem','REM-Schlaf','%',0,100,'Anteil des REM-Schlafs'],
  ['arousal','Arousal-Index','Weckreaktionen/h',0,200,'Kurze Weckreaktionen pro Stunde'],
  ['plmi','PLMI – periodische Beinbewegungen','Bewegungen/h',0,200,'Periodische Beinbewegungen pro Stunde Schlaf'],
  ['snoring','Schnarchanteil','%',0,100,'Nur wenn Prozentangabe ausdrücklich im Befund steht'],
  ['pressure','PAP-Druck','cmH₂O',0,30,'Eingestellter oder gemessener Druck; Art des Werts notieren'],
  ['pressureMin','APAP Mindestdruck','cmH₂O',0,30,'Untergrenze des automatischen Therapiedrucks'],
  ['pressureMax','APAP Höchstdruck','cmH₂O',0,30,'Obergrenze des automatischen Therapiedrucks'],
  ['residualAhi','Rest-AHI unter Therapie','Ereignisse/h',0,200,'Geräteseitig gemessener Rest-AHI; nicht mit PSG-AHI verwechseln'],
  ['usage','PAP-Nutzung pro Nacht','Stunden',0,24,'Durchschnittliche tägliche Gerätenutzung'],
  ['leak','Maskenleckage','l/min',0,300,'Geräteabhängig gemessene Leckage'],
  ['usePercent','Nächte mit Therapienutzung','%',0,100,'Dokumentierter Anteil der Nutzungstage'],
  ['ess','Epworth-Schläfrigkeitsskala (ESS)','Punkte',0,24,'Fragebogenwert zur subjektiven Tagesschläfrigkeit'],
  ['t90min','Zeit unter 90 % SpO₂','Minuten',0,1500,'Dokumentierte Zeit mit SpO₂ unter 90 %'],
  ['t88min','Zeit unter 88 % SpO₂','Minuten',0,1500,'Dokumentierte Zeit mit SpO₂ unter 88 %'],
  ['hrMean','Mittlerer Puls während der Messung','/min',0,250,'Gemessene mittlere Herzfrequenz'],
  ['hrMin','Niedrigster Puls während der Messung','/min',0,250,'Niedrigste dokumentierte Herzfrequenz'],
  ['hrMax','Höchster Puls während der Messung','/min',0,250,'Höchste dokumentierte Herzfrequenz'],
  ['co2max','CO₂-Höchstwert (falls gemessen)','mmHg',0,180,'Nur mit dokumentierter Messmethode eintragen'],
  ['ahiSupine','AHI in Rückenlage','Ereignisse/h',0,200,'Lageabhängige Atemstörungen'],
  ['ahiOther','AHI außerhalb der Rückenlage','Ereignisse/h',0,200,'Lageabhängige Atemstörungen'],
  ['pressureI','BiPAP Einatemdruck (IPAP)','cmH₂O',0,40,'Einatemdruck bei bilevel-Therapie'],
  ['pressureE','BiPAP Ausatemdruck (EPAP)','cmH₂O',0,40,'Ausatemdruck bei bilevel-Therapie']
 ];
 const groups=[
  {title:'ATEMSTÖRUNGEN & SAUERSTOFF',codes:['ahi','rdi','rei','odi','spo2mean','spo2min','t90','t90min','t88min','hrMean','hrMin','hrMax','co2max','ahiSupine','ahiOther','obstructive','central','mixed','hypopnea','cai','oai']},
  {title:'SCHLAFZEIT & SCHLAFPHASEN',codes:['tst','tib','efficiency','sleepLatency','remLatency','waso','n1','n2','n3','rem','arousal','plmi','snoring','ess']},
  {title:'CPAP / APAP / BIPAP-THERAPIE',codes:['pressure','pressureMin','pressureMax','pressureI','pressureE','residualAhi','usage','leak','usePercent']}
 ];
 const byCode=Object.fromEntries(fields.map(row=>[row[0],row]));
 const page=document.createElement('section');page.id='schlaflabor';page.className='panel new-page sl340';page.dataset.navPage='schlaflabor';page.hidden=true;
 // Numeric field tuple: [code, title, unit, min, max, explanation]
 // Build groups using explicit indexes so no unit or range is inferred.
 const accurateGroups=groups.map((g,index)=>'<details class="sl340-expand" '+(index===0?'open':'')+'><summary>'+g.title+' <span>– Werte bei Bedarf eintragen</span></summary><div class="sl340-grid">'+g.codes.map(code=>{
  const f=byCode[code];return '<label><strong>'+f[1]+'</strong><small>'+f[5]+'</small><div class="sl340-number"><input type="number" inputmode="decimal" step="any" name="'+code+'" min="'+f[3]+'" max="'+f[4]+'" placeholder="–" aria-label="'+f[1]+'"><span>'+f[2]+'</span></div></label>';
 }).join('')+'</div></details>').join('');
 page.innerHTML='<div class="section-heading"><div><p class="section-kicker">Gesundheit · Schlafmedizin</p><h2>SCHLAFLABOR & SCHLAFWERTE</h2><p>Schlafuntersuchungen, Atmung, Sauerstoff, Schlafphasen und PAP-Therapie an einem Ort.</p></div><span class="shield">Privat & verschlüsselt</span></div>'+
 '<div class="sl340-shell"><section class="sl340-card"><h3>MESSUNGEN IM VERLAUF</h3><p class="sl340-muted">Nur selbst eingetragene oder ärztlich dokumentierte Werte. Ein Messpunkt ist noch kein Trend.</p><div id="sl340-highlights" class="sl340-highlights"></div><div class="sl340-chartctrl"><label>Zeitraum<select id="sl340-period"><option value="1">Tag</option><option value="7">Woche</option><option value="30">Monat</option><option value="365">Jahr</option><option value="3652" selected>10 Jahre</option><option value="all">Alle</option></select></label><label>Messgröße<select id="sl340-metric"></select></label></div><div id="sl340-plot"></div><p id="sl340-plotnote" class="sl340-muted"></p></section>'+
 '<section class="sl340-card"><h3>NEUEN SCHLAFLABORBEFUND EINTRAGEN</h3><p>Datum und vorhandene Befundwerte eingeben. Nicht untersuchte Felder bleiben leer.</p><form id="sl340-form"><input type="hidden" name="id"><div class="sl340-grid sl340-intro"><label>Untersuchungsdatum *<input type="date" name="date" required></label><label>Art der Untersuchung<select name="studyType"><option value="psg">Polysomnographie (Schlaflabor)</option><option value="polygraphy">Polygraphie (ambulant)</option><option value="pap">PAP-Kontrolle / Geräteauswertung</option><option value="other">Andere Untersuchung</option></select></label><label>Klinik / Arzt (optional)<input name="doctor" type="text" maxlength="150"></label><label>Uhrzeit (optional)<input type="time" name="time"></label><label>PAP-Modus (optional)<select name="papMode"><option value="">Nicht angegeben</option><option value="cpap">CPAP</option><option value="apap">APAP</option><option value="bipap">BiPAP / bilevel</option><option value="other">Anderer Modus</option></select></label><label>ODI-Definition<select name="odiRule"><option value="">Nicht angegeben</option><option value="3">Abfall ≥3 %</option><option value="4">Abfall ≥4 %</option><option value="other">Andere Definition (siehe Notiz)</option></select></label></div>'+accurateGroups+
 '<details class="sl340-expand"><summary>BEFUND, BESCHWERDEN & ORIGINALDATEI <span>– zusätzliche Angaben</span></summary><div class="sl340-grid"><label>Ärztliche Diagnose / Bewertung<textarea name="diagnosis" rows="3" maxlength="1400"></textarea></label><label>Ärztliche Empfehlung / Therapie<textarea name="recommendation" rows="3" maxlength="1400"></textarea></label><label>Beschwerden und Beobachtungen<textarea name="symptoms" rows="3" maxlength="1200" placeholder="z. B. Tagesmüdigkeit, Schnarchen …"></textarea></label><label>Maske / Gerät (optional)<input name="device" maxlength="150"></label><label>Sonstige Notizen<textarea name="note" rows="3" maxlength="1800"></textarea></label><label>Originalbefund hinzufügen (PDF / Foto, maximal 12 MB)<input type="file" name="report" accept="application/pdf,.pdf,image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.heic,.heif"></label></div></details>'+
 '<div class="sl340-actions"><button type="submit" class="btn btn-primary">BEFUND VERSCHLÜSSELT SPEICHERN</button><button type="button" class="btn btn-outline" id="sl340-cancel" hidden>Bearbeiten abbrechen</button></div></form><p id="sl340-status" class="sl340-status" role="status" aria-live="polite"></p></section>'+
 '<section class="sl340-card"><h3>GESPEICHERTE SCHLAFLABORBEFUNDE</h3><div id="sl340-records"></div></section>'+
 '<section class="sl340-card"><h3>ORIGINALBERICHTE</h3><p class="sl340-muted">Hier erscheinen die in diesem Bereich gespeicherten PDF- und Bilddateien. Du kannst sie wieder herunterladen. Die Dateien bleiben auch in der privaten Akte erhalten.</p><div id="sl340-documents"></div></section>'+
 '<details class="sl340-explain"><summary>WAS BEDEUTEN DIE WICHTIGSTEN SCHLAFWERTE?</summary><p><strong>AHI</strong> gibt Atemereignisse pro Stunde Schlaf an. <strong>ODI</strong> zählt Sauerstoffabfälle nach dem verwendeten Schwellenwert (z. B. 3 oder 4 %). <strong>REI</strong> bei ambulanten Tests verwendet häufig die Aufzeichnungszeit statt der tatsächlichen Schlafdauer.</p><p><strong>Schlafphasen:</strong> N1 leichter Schlaf, N2 stabiler Schlaf, N3 Tiefschlaf, REM Traumschlaf. Die Prozentanteile hängen von der Auswertung ab.</p><p><strong>CPAP/APAP/BiPAP</strong> sind Beatmungs-/Drucktherapien. Rest-AHI und Leckage von Geräten sind nicht mit Polysomnographie-Werten gleichzusetzen.</p><p>Die App stellt keine Diagnose und berechnet keine Schlafapnoe-Schweregrade. Messverfahren, Schlafdauer, Beschwerden und fachärztliche Beurteilung bleiben entscheidend.</p><p>Fachquellen: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11467053/" target="_blank" rel="noopener noreferrer">Australasian Sleep Association 2024</a> · <a href="https://www.thoracic.org/professionals/clinical-resources/sleep/sleep-modules/interpreting-sleep-studies-primer.php" target="_blank" rel="noopener noreferrer">American Thoracic Society</a></p></details></div>';
 $('start').insertAdjacentElement('afterend',page);
 const form=$('sl340-form'),status=$('sl340-status'),plot=$('sl340-plot'),metric=$('sl340-metric'),period=$('sl340-period');
 const periods={ahi:'AHI – Ereignisse/h',odi:'ODI – Abfälle/h',spo2min:'Niedrigster SpO₂-Wert (%)',spo2mean:'Durchschnittlicher SpO₂-Wert (%)',t90:'T90 – Zeit unter 90 % (%)',efficiency:'Schlafeffizienz (%)',tst:'Gesamtschlafzeit (Minuten)',n3:'Tiefschlaf N3 (%)',rem:'REM-Schlaf (%)',arousal:'Arousal-Index (1/h)',plmi:'PLMI (1/h)',residualAhi:'Rest-AHI unter PAP (1/h)',usage:'PAP-Nutzung (Stunden)'};
 Object.entries(periods).forEach(([code,text])=>metric.add(new Option(text,code)));
 const fmt=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:2});
 const dmy=s=>/\d{4}-\d\d-\d\d/.test(s||'')?s.slice(8,10)+'.'+s.slice(5,7)+'.'+s.slice(0,4):'–';
 const uid=()=>crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
 const dateOk=d=>{if(!/^\d{4}-\d\d-\d\d$/.test(d||''))return false;const value=new Date(d+'T12:00:00');return Number.isFinite(value.getTime())&&value.toISOString().slice(0,10)===d;};
 const num=n=>typeof n==='number'&&Number.isFinite(n)?n:null;
 const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const say=(s,bad=false)=>{status.textContent=s;status.classList.toggle('error',bad)};
 let records=[],documents=[],running=0,editing='';
 function reset(){form.reset();form.elements.date.value=today();form.elements.id.value='';editing='';$('sl340-cancel').hidden=true;form.querySelector('[type="submit"]').textContent='BEFUND VERSCHLÜSSELT SPEICHERN'}
 function sanitize(){const date=form.elements.date.value;if(!dateOk(date))throw Error('Untersuchungsdatum fehlt oder ist ungültig.');
  const values={};for(const [code,,unit,min,max] of fields){const raw=form.elements[code].value.trim().replace(',','.');if(raw===''){values[code]=null;continue;}const x=Number(raw);if(!Number.isFinite(x)||x<min||x>max)throw Error('Ungültiger Wert bei '+byCode[code][1]+' ('+unit+').');values[code]=x;}
  for(const key of ['n1','n2','n3','rem'])if(values[key]!==null&&values[key]>100)throw Error('Schlafphasenprozente dürfen nicht über 100 liegen.');
  const stage=['n1','n2','n3','rem'].map(k=>values[k]);if(stage.every(x=>x!==null)&&stage.reduce((a,b)=>a+b,0)>103)throw Error('Summe der Schlafphasen über 103 %. Bitte die Werte kontrollieren.');
  const text=k=>String(form.elements[k].value||'').trim();
  const notes=['doctor','diagnosis','recommendation','symptoms','device','note'].some(k=>text(k));
  if(!Object.values(values).some(x=>x!==null)&&!notes&&!form.elements.report.files.length)throw Error('Bitte mindestens einen Befundwert, einen Text oder die Originaldatei hinzufügen.');
  return {id:editing||uid(),date,time:form.elements.time.value||'',studyType:form.elements.studyType.value,papMode:form.elements.papMode.value,odiRule:form.elements.odiRule.value,doctor:text('doctor'),diagnosis:text('diagnosis'),recommendation:text('recommendation'),symptoms:text('symptoms'),device:text('device'),note:text('note'),...values,createdAt:editing?records.find(x=>x.id===editing)?.createdAt||new Date().toISOString():new Date().toISOString(),updatedAt:new Date().toISOString()};
 }
 async function save(ev){ev.preventDefault();let item;try{item=sanitize();}catch(e){say(e.message,true);return;}
  const submit=form.querySelector('[type="submit"]');submit.disabled=true;
  let savedStudy=false;
  try{
   if(!S.state().unlocked)throw Error('Gesundheitsakte ist gesperrt.');
   await S.put('suite',{key:'sleep340/'+item.id,type:'sleep340',value:item},'sleep340/'+item.id);
   const verify=await S.get('suite','sleep340/'+item.id);if(!verify||verify.value?.date!==item.date)throw Error('Messwerte konnten nicht bestätigt werden.');
   savedStudy=true;
   const file=form.elements.report.files?.[0];
   if(file){if(!/\.(pdf|jpe?g|png|webp|heic|heif)$/i.test(file.name||'')||file.size<=0||file.size>12*1024*1024)throw Error('Originaldatei nur als PDF/Foto bis 12 MB.');
    const id=uid(),doc={id,name:file.name.slice(0,180),size:file.size,mime:file.type||'application/octet-stream',blob:file,kind:'Schlaflaborbericht',studyId:item.id,documentDate:item.date,caseId:'',createdAt:new Date().toISOString()};
    await S.put('documents',doc,id);const check=await S.get('documents',id);if(!(check?.blob instanceof Blob)||check.blob.size!==file.size)throw Error('Originaldatei konnte nicht bestätigt werden.');
   }
   reset();await refresh();say('Schlaflaborbefund und gegebenenfalls Originaldatei verschlüsselt gespeichert.');
  }catch(e){say((savedStudy?'Messwerte gespeichert, aber Originaldatei nicht vollständig übernommen: ':'Speichern fehlgeschlagen: ')+e.message,true);if(savedStudy)await refresh();}finally{submit.disabled=false;}
 }
 function edit(item){editing=item.id;reset();editing=item.id;form.elements.id.value=item.id;
  for(const k of ['date','time','studyType','papMode','odiRule','doctor','diagnosis','recommendation','symptoms','device','note',...fields.map(x=>x[0])]){
   if(form.elements[k])form.elements[k].value=item[k]??'';
  }form.querySelector('[type="submit"]').textContent='ÄNDERUNGEN VERSCHLÜSSELT SPEICHERN';$('sl340-cancel').hidden=false;form.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function make(tag,text,cl){const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(cl)e.className=cl;return e}
 function download(doc){if(!(doc.blob instanceof Blob)){say('Originaldatei nicht lesbar.',true);return;}const url=URL.createObjectURL(doc.blob),a=document.createElement('a');a.download=doc.name||'Schlaflaborbericht';a.href=url;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
 function renderRecords(){const host=$('sl340-records');host.replaceChildren();if(!records.length){host.append(make('p','Noch keine Schlaflaborbefunde gespeichert.','sl340-muted'));return;}
  for(const r of records.slice().reverse()){
   const card=make('article',undefined,'sl340-record');
   const head=make('div',undefined,'sl340-recordhead');head.append(make('strong',dmy(r.date)+' · '+({psg:'Schlaflabor',polygraphy:'Polygraphie',pap:'PAP-Kontrolle',other:'Untersuchung'}[r.studyType]||'Schlaflabor')));if(r.doctor)head.append(make('small',r.doctor));card.append(head);
   const values=make('div',undefined,'sl340-recordgrid');for(const k of ['ahi','rdi','odi','spo2min','t90','efficiency','tst','residualAhi']){if(num(r[k])===null)continue;const field=byCode[k];const box=make('div',undefined,'sl340-readout');box.append(make('small',field[1]),make('strong',fmt(r[k])+' '+field[2]));values.append(box);}card.append(values);
   for(const label of ['diagnosis','recommendation','note'])if(r[label])card.append(make('p',(label==='diagnosis'?'Ärztlicher Befund: ':label==='recommendation'?'Empfehlung: ':'Notiz: ')+r[label],'sl340-note'));
   const linked=documents.filter(d=>d.studyId===r.id);if(linked.length)card.append(make('p',linked.length+' Originaldatei(en) verknüpft','sl340-muted'));
   const buttons=make('div',undefined,'sl340-actions');const change=make('button','Bearbeiten','btn btn-outline');change.type='button';change.addEventListener('click',()=>edit(r));const remove=make('button','Löschen','btn btn-text');remove.type='button';remove.addEventListener('click',async()=>{
    if(!confirm('Schlaflabor-Messwerte vom '+dmy(r.date)+' löschen? Zugehörige Originaldateien bleiben in der Akte.'))return;
    try{await S.del('suite','sleep340/'+r.id);if(editing===r.id)reset();await refresh();say('Messwerte gelöscht. Originaldateien bleiben erhalten.')}catch(e){say(e.message,true)}
   });buttons.append(change,remove);card.append(buttons);host.append(card);
  }
 }
 function renderDocuments(){const host=$('sl340-documents');host.replaceChildren();const docs=documents.filter(d=>d.kind==='Schlaflaborbericht').sort((a,b)=>(b.documentDate||b.createdAt||'').localeCompare(a.documentDate||a.createdAt||''));
  if(!docs.length){host.append(make('p','Noch keine Originaldateien gespeichert.','sl340-muted'));return;}
  for(const d of docs){const row=make('div',undefined,'sl340-document');const label=make('div');label.append(make('strong',d.name||'Schlaflaborbericht'),make('small',dmy(d.documentDate||d.createdAt?.slice(0,10))+' · '+(d.size/1048576).toFixed(1)+' MB'));const open=make('button','Öffnen / speichern','btn btn-outline');open.type='button';open.addEventListener('click',()=>download(d));row.append(label,open);host.append(row)}
 }
 function afterPeriod(d,p){if(p==='all')return true;const x=new Date();x.setHours(12,0,0,0);const n=Number(p);if(n===3652)x.setFullYear(x.getFullYear()-10);else if(n===365)x.setFullYear(x.getFullYear()-1);else x.setDate(x.getDate()-n+1);return d>=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')}
 function plotChart(){plot.replaceChildren();const key=metric.value,unit=byCode[key][2],data=records.filter(r=>afterPeriod(r.date,period.value)&&num(r[key])!==null);
  const h=$('sl340-highlights');h.replaceChildren();const last=records.at(-1);if(last){for(const k of ['ahi','odi','spo2min','efficiency']){if(num(last[k])===null)continue;const box=make('div',undefined,'sl340-readout');box.append(make('small',byCode[k][1]),make('strong',fmt(last[k])+' '+byCode[k][2]));h.append(box)}}
  if(!data.length){plot.append(make('p','Für die gewählte Messgröße und den Zeitraum sind keine Werte vorhanden.','sl340-muted'));$('sl340-plotnote').textContent='';return}
  const W=650,H=275,L=68,R=23,T=28,B=48,ns='http://www.w3.org/2000/svg';let min=Math.min(...data.map(r=>r[key])),max=Math.max(...data.map(r=>r[key]));const margin=Math.max(1,(max-min)*.15,Math.abs(max)*.06);min=Math.max(0,min-margin);max+=margin;const scale=max-min||1;
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 650 275');svg.setAttribute('role','img');svg.setAttribute('aria-label',periods[key]+' Zeitverlauf mit '+data.length+' Messpunkten');plot.append(svg);
  const add=(tag,attrs,text,parent=svg)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(text!==undefined)e.textContent=text;parent.append(e);return e};
  const xy=(v,i)=>[L+(data.length===1?(W-L-R)/2:i*(W-L-R)/(data.length-1)),T+(max-v)/scale*(H-T-B)];
  for(let i=0;i<=4;i++){const y=T+(H-T-B)*i/4;add('line',{x1:L,x2:W-R,y1:y,y2:y,stroke:'#dce8ee'});add('text',{x:L-10,y:y+5,'text-anchor':'end','font-size':14,fill:'#466477'},fmt(max-i*scale/4));}
  let prev=null;data.forEach((r,i)=>{const [x,y]=xy(r[key],i);if(prev)add('line',{x1:prev[0],y1:prev[1],x2:x,y2:y,stroke:'#186c89','stroke-width':3,'stroke-linecap':'round'});const c=add('circle',{cx:x,cy:y,r:6,fill:'#186c89',stroke:'white','stroke-width':2});add('title',{},dmy(r.date)+': '+fmt(r[key])+' '+unit,c);if(data.length<=8)add('text',{x,y:Math.max(12,y-12),'text-anchor':'middle','font-size':12,'font-weight':700,fill:'#18475b'},fmt(r[key]));prev=[x,y]});
  const ind=[0,Math.floor((data.length-1)/2),data.length-1].filter((n,i,a)=>a.indexOf(n)===i);for(const i of ind){const [x]=xy(data[i][key],i);add('text',{x,y:H-11,'text-anchor':i===0?'start':i===data.length-1?'end':'middle','font-size':13,fill:'#466477'},dmy(data[i].date));}
  add('text',{x:L,y:17,'font-size':14,fill:'#18475b'},unit);
  $('sl340-plotnote').textContent=data.length===1?'1 Messpunkt am '+dmy(data[0].date)+' – ein Verlauf benötigt weitere Untersuchungen.':data.length+' dokumentierte Messpunkte; Werte und Definitionen nur bei vergleichbaren Untersuchungsbedingungen gegenüberstellen.';
 }
 let debounce=null;
 async function refresh(){const token=++running;const [suite,docs]=await Promise.all([S.list('suite'),S.list('documents')]);if(token!==running)return;records=suite.filter(r=>r.type==='sleep340').map(r=>r.value).filter(r=>r&&dateOk(r.date)).sort((a,b)=>(a.date+' '+(a.time||'')).localeCompare(b.date+' '+(b.time||'')));documents=docs;renderRecords();renderDocuments();plotChart()}
 form.addEventListener('submit',save);$('sl340-cancel').addEventListener('click',reset);metric.addEventListener('change',plotChart);period.addEventListener('change',plotChart);
 window.addEventListener('asthma:secure-change',ev=>{if(ev.detail?.group==='suite'||ev.detail?.group==='documents'){clearTimeout(debounce);debounce=setTimeout(()=>refresh().catch(e=>say(e.message,true)),130)}});
 reset();refresh().catch(e=>say('Schlaflaborakte konnte nicht geladen werden: '+e.message,true));
 window.__ASTHMA_SCHLAF340_TEST=Object.freeze({fields:fields.map(x=>x[0]),version:'3.4.0',afterPeriod});
})();
