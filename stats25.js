'use strict';
/* Monats-/Jahresübersicht – im Speicher berechnet, kein Remote-PDF-Dienst. */
(()=>{
 const SEC=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);if(!$('stats25-report'))return;
 const fmt=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')?`${s.slice(8)}.${s.slice(5,7)}.${s.slice(0,4)}`:s||'–';
 // Nur Nucala/Mepolizumab: die zeitlich gleichbedeutende Angabe vereinheitlichen.
 // Andere Arzneimittel, Wirkstärken und Dosierungen werden nicht verändert.
 const nucala28Text=(med,value)=>typeof value==='string'&&/\b(?:nucala|mepolizumab)\b/i.test(String(med?.name||''))
    ?value.replace(/\balle\s+(?:4|vier)\s+Wochen\b/gi,'alle 28 Tage'):value;
 const num=v=>v!==''&&v!==null&&v!==undefined&&Number.isFinite(Number(v))?Number(v):null;
 const avg=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
 const val=(v,unit='',digits=1)=>v===null?'Keine Messung':v.toLocaleString('de-DE',{maximumFractionDigits:digits,minimumFractionDigits:0})+(unit?' '+unit:'');
 const node=(tag,cl,txt)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(txt!==undefined)n.textContent=String(txt);return n};
 const patientOption=node('label','a281-patient-option');
 const patientCheck=document.createElement('input');patientCheck.type='checkbox';patientCheck.id='a281-patient-details';
 patientOption.append(patientCheck,node('span','', 'Auch Anschrift und Gewicht im Bericht anzeigen (PDF/Ausdruck ist unverschlüsselt).'));
 const buildButton=$('stats25-build');buildButton.parentNode.insertBefore(patientOption,buildButton);
 const now=new Date();$('stats25-month').value=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;$('stats25-year').value=String(now.getFullYear());
 function range(){const mode=$('stats25-mode').value;const month=$('stats25-month').value,year=$('stats25-year').value;const p=mode==='month'?month:year;if(mode==='month'&&(!/^\d{4}-\d{2}$/.test(p)||Number(p.slice(5))<1||Number(p.slice(5))>12))throw Error('Bitte einen gültigen Monat wählen.');if(mode==='year'&&!/^\d{4}$/.test(p))throw Error('Bitte ein gültiges Jahr wählen.');const end=mode==='month'?String(new Date(Number(p.slice(0,4)),Number(p.slice(5,7)),0).getDate()).padStart(2,'0'):'';return{mode,key:p,from:mode==='month'?`${p}-01`:`${p}-01-01`,to:mode==='month'?`${p}-${end}`:`${p}-12-31`}};
 const dateOf=r=>(r?.date||r?.submittedOn||r?.createdAt||'').slice(0,10);
 const within=(d,r)=>d>=r.from&&d<=r.to;
 function kpi(parent,title,value,detail){const x=node('div','stats25-kpi');x.append(node('span','stats25-label',title),node('strong','stats25-figure',value));if(detail)x.append(node('small','',detail));parent.append(x)}
 const reportSections={
  'Überblick':'overview','Ärztliche Lungenfunktion (Spirometrie)':'spirometrySummary',
  'Peak-Flow / ePEF':'pefSummary','Asthma-Arbeitsunfähigkeit':'auSummary',
  'Labor und Blutwerte':'laborSummary','Medikamente und Behandlung':'medications',
  'Blutsauerstoff, Blutdruck und Puls':'vitalsSummary','Anträge, Termine und Unterlagen':'administration',
  'Krankenhausaufenthalte':'hospital', 'Lungenarzttermine':'pulmonologist'
 };
 function section(report,title){const box=node('section','stats25-section');box.dataset.s292Base=reportSections[title]||'unclassified';box.append(node('h3','',title));report.append(box);return box}
 function line(p,title,value){const item=node('div','stats25-line');item.append(node('span','',title),node('strong','',value));p.append(item)}
 async function build(){const status=$('stats25-status');status.textContent='Lokale Daten werden ausgewertet …';try{const r=range();const names=['suite','epef','labs','cases','documents','diary','calendar','au'];const [suite,epef,labs,cases,docs,diary,calendar,au]=await Promise.all(names.map(n=>SEC.list(n)));
 const lung=suite.filter(x=>x.type==='measurements'&&within(x.value?.date||'',r)).map(x=>x.value);const meds=suite.filter(x=>x.type==='meds').map(x=>x.value);const work=suite.filter(x=>x.type==='work'&&within(x.value?.date||'',r));const checks=suite.filter(x=>x.type==='checks'&&within(x.value?.date||'',r));const er=epef.filter(x=>x.kind==='measurement'&&within(x.date||'',r));const lab=labs.filter(x=>within(x.date||'',r));const doc=docs.filter(x=>within(dateOf(x),r));const casesFiled=cases.filter(x=>within(x.submittedOn||'',r));const casesReceived=cases.filter(x=>within(x.receivedOn||'',r));const di=diary.filter(x=>within(x.date||'',r));const cal=calendar.filter(x=>within(x.date||'',r));
 // Eigene Kalendereintraege sind die einzige Quelle. Ein Besuch im Krankenhaus ist
 // nicht automatisch ein stationaerer Aufenthalt. Alte Lungenarzt-Termine koennen
 // aus dem Titel als solche erkannt werden; allgemeine Arzttermine bleiben allgemein.
 const isDay=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&!Number.isNaN(Date.parse(d+'T12:00:00Z'))&&new Date(d+'T12:00:00Z').toISOString().slice(0,10)===d;
 const pulmonaryName=e=>/\b(lungenarzt|lungenfacharzt|pneumolog(?:e|in|ie|isch)?|pulmolog(?:e|in|ie)?)\b/i.test([e.title,e.place].join(' '));
 const hospital=calendar.filter(e=>e.type==='krankenhaus'&&isDay(e.date)&&isDay(e.endDate||e.date)&&(e.endDate||e.date)>=r.from&&e.date<=r.to&&(e.endDate||e.date)>=e.date&&(Date.parse((e.endDate||e.date)+'T12:00:00Z')-Date.parse(e.date+'T12:00:00Z'))/86400000<=1826);
 const lungAppointments=calendar.filter(e=>isDay(e.date)&&within(e.date,r)&&(e.type==='lungenarzt'||(e.type==='termin'&&pulmonaryName(e))));
 const coveredDays=new Set();for(const e of hospital){let from=e.date>r.from?e.date:r.from,to=(e.endDate||e.date)<r.to?(e.endDate||e.date):r.to;let d=Date.parse(from+'T12:00:00Z'),end=Date.parse(to+'T12:00:00Z');for(;d<=end;d+=86400000)coveredDays.add(new Date(d).toISOString().slice(0,10));}
 const days=window.ASTHMA_AU25?.unionDays(au,r.from,r.to)||{calendar:0,workdays:0};const eventsAU=au.filter(x=>x.to>=r.from&&x.from<=r.to);const report=$('stats25-report');report.replaceChildren();
 const heading=node('header','stats25-heading');heading.append(node('p','stats25-meta','ASTHMA · GESUNDHEITSBERICHT · PRIVAT'),node('h2','',r.mode==='month'?`Monatsbericht ${r.key.slice(5)}.${r.key.slice(0,4)}`:`Jahresbericht ${r.key}`),node('p','',`Erstellt am ${fmt(new Date().toISOString().slice(0,10))} · ausschließlich bestätigte lokale Daten`));report.append(heading);
 const personal=SEC.profileGet()?.personal||{};
 if(personal.fullName||personal.birthDate){
  const patient=node('p','stats25-meta');
  const birth=/^\d{4}-\d{2}-\d{2}$/.test(personal.birthDate||'')?fmt(personal.birthDate):'';
  patient.textContent=['Patient: '+String(personal.fullName||'Nicht angegeben'),birth?'Geburtsdatum: '+birth:''].filter(Boolean).join(' · ');
  heading.append(patient);
 }
 if(patientCheck.checked&&personal&&typeof personal==='object'){
  const details=[];
  const fullStreet=String(personal.street||'').trim();
  const town=[personal.postalCode,personal.city].map(v=>String(v||'').trim()).filter(Boolean).join(' ');
  if(fullStreet||town)details.push('Anschrift: '+[fullStreet,town].filter(Boolean).join(', '));
  const kg=personal.weightKg===null||personal.weightKg===undefined||personal.weightKg===''?null:Number(personal.weightKg);
  if(kg!==null&&Number.isFinite(kg)&&kg>=1&&kg<=500)details.push('Gewicht: '+kg.toLocaleString('de-DE',{maximumFractionDigits:1})+' kg');
  if(details.length)heading.append(node('p','stats25-meta',details.join(' · ')));
 }
 const printLogo=node('img','a281-report-logo');printLogo.src='./brand-wordmark-v281.png';printLogo.alt='Asthma';
 heading.prepend(printLogo);
 const key=section(report,'Überblick'),tiles=node('div','stats25-tiles');key.append(tiles);kpi(tiles,'Asthma-AU-Kalendertage',String(days.calendar),'Überlappungen nur einmal');kpi(tiles,'Ausgefallene Mo–Fr-Tage',String(days.workdays),'Gemäß hinterlegter Feiertagsoption');kpi(tiles,'Ärztliche Lungenfunktionstests',String(lung.length),'Spirometrie, ohne ePEF');kpi(tiles,'ePEF-Messungen',String(er.length),'PEF / FEV₁ Handmessungen');kpi(tiles,'Laborwerte',String(lab.length),'Einzelwerte');kpi(tiles,'Anträge gestellt',String(casesFiled.length),'Nach Antragsdatum');kpi(tiles,'Krankenhausaufenthalte',String(hospital.length),'Im Zeitraum, Überschneidung zählt');kpi(tiles,'Krankenhaustage',String(coveredDays.size),'Nur Tage im Berichtszeitraum');kpi(tiles,'Lungenarzttermine',String(lungAppointments.length),'Kalender: Pneumologie');
 const lungSec=section(report,'Ärztliche Lungenfunktion (Spirometrie)');line(lungSec,'Untersuchungen',String(lung.length));for(const [key,name,unit] of [['fev1','FEV₁ (% Soll)','%'],['fvc','FVC (% Soll)','%'],['fev1Liters','FEV₁ (Liter)','l'],['fvcLiters','FVC (Liter)','l']]){const xs=lung.map(x=>num(x[key])).filter(v=>v!==null);line(lungSec,name+' – Mittelwert',val(avg(xs),unit,2))}if(lung.length){const list=node('ul','stats25-small-list');for(const x of [...lung].sort((a,b)=>(b.date||'').localeCompare(a.date||''))){list.append(node('li','',`${fmt(x.date)}: FEV₁ ${x.fev1??'–'} % / ${x.fev1Liters??'–'} l, FVC ${x.fvc??'–'} % / ${x.fvcLiters??'–'} l · ${x.phase||'Phase nicht dokumentiert'}`))}lungSec.append(list)}lungSec.append(node('p','stats25-muted','Hinweis: Mittelwerte verschiedener Spirometriephasen und Untersuchungsbedingungen sind keine klinische Trenddiagnose.'));
 const pefSec=section(report,'Peak-Flow / ePEF');line(pefSec,'Messungen',String(er.length));const colorBuckets=[['Morgen vor 13 Uhr',0],['13 bis 16:59 Uhr',0],['ab 17 Uhr',0]];for(const x of er){const parts=String(x.time||'').split(':');const h=Number(parts[0]);if(Number.isInteger(h)&&h>=0&&h<=23)colorBuckets[h<13?0:h<17?1:2][1]++}for(const [label,count] of colorBuckets)line(pefSec,label+' (Messzeit)',String(count));for(const [key,name,unit] of [['pef','PEF','l/min'],['fev1','FEV₁ Handmessung','l']]){const xs=er.map(x=>num(x[key])).filter(v=>v!==null);line(pefSec,`${name} · Mittel / Min / Max`,xs.length?`${val(avg(xs),unit,2)} · ${val(Math.min(...xs),unit,2)} · ${val(Math.max(...xs),unit,2)}`:'Keine Messung')}pefSec.append(node('p','stats25-muted','ePEF-Werte stammen aus Heim-/Handmessungen und werden nicht mit ärztlicher Spirometrie vermischt.'));
 const aux=section(report,'Asthma-Arbeitsunfähigkeit');line(aux,'Im Zeitraum berührende AU-Bescheinigungen',String(eventsAU.length));line(aux,'Kalendertage (einmalig)',String(days.calendar));line(aux,'Mo–Fr-Tage mit hinterlegter Feiertagsberechnung',String(days.workdays));aux.append(node('p','stats25-muted','AU-Tage schließen arbeitsfreie Tage ein. Ausgefallene Arbeitstage sind eine vereinfachte Mo–Fr-Berechnung und berücksichtigen keine individuellen Schichtpläne, Urlaubstage oder Lohnfortzahlungsregeln.'));
 const labsSec=section(report,'Labor und Blutwerte');line(labsSec,'Dokumentierte Labor-Einzelwerte',String(lab.length));const labsShort=[...lab].sort((a,b)=>(b.date||'').localeCompare(a.date||''));for(const x of labsShort)line(labsSec,`${fmt(x.date)} · ${x.marker||'Labor'}`,`${x.value??'–'} ${x.unit||''}`);
 const treat=section(report,'Medikamente und Behandlung');line(treat,'Im Tresor hinterlegte Medikamente',String(meds.length));if(meds.length)for(const m of meds){line(treat,m.name||'Medikament',[nucala28Text(m,m.dose),m.route,m.next?'Nächster Termin: '+fmt(m.next):''].filter(Boolean).join(' · '))}treat.append(node('p','stats25-muted','Die Medikamentenliste ist eine Momentaufnahme der gespeicherten Einträge, kein Nachweis der tatsächlichen Einnahme im Berichtszeitraum.'));
 const vit=suite.filter(x=>x.type==='vital29'&&within(x.value?.date||'',r)).map(x=>x.value);
  const vSection=section(report,'Blutsauerstoff, Blutdruck und Puls');
  for(const [kind,name,key,unit] of [['spo2','SpO₂','value','%'],['bp','Blutdruck systolisch','value','mmHg'],['bp','Blutdruck diastolisch','diastolic','mmHg'],['pulse','Puls','value','/min']]){const values=vit.filter(x=>x.kind===kind).map(x=>num(x[key])).filter(x=>x!==null);line(vSection,name+' – '+values.length+' Messungen; Durchschnitt',val(avg(values),unit,1));}
  vSection.append(node('p','stats25-muted','Nur vorhandene Messwerte, keine klinische Interpretation. Apple-Watch-Werte und medizinische Pulsoximeter sind nicht gleichwertig.'));
  const admin=section(report,'Anträge, Termine und Unterlagen');line(admin,'Anträge gestellt',String(casesFiled.length));line(admin,'Bescheide/Antworten dokumentiert',String(casesReceived.length));line(admin,'Eigene Kalendereinträge',String(cal.length));line(admin,'Dokumente gespeichert',String(doc.length));line(admin,'Asthma-Tagebucheinträge',String(di.length));const rescue=di.map(x=>num(x.rescue)).filter(v=>v!==null);line(admin,'Dokumentierte Bedarfsanwendungen (Tagebuch)',rescue.length?String(rescue.reduce((a,b)=>a+b,0)):'Keine Angabe');line(admin,'Nächtliche Beschwerden im Tagebuch',String(di.filter(x=>x.night===true).length));const peakDiary=di.map(x=>num(x.peak)).filter(v=>v!==null);line(admin,'PEF im Tagebuch – Mittelwert',val(avg(peakDiary),'l/min',0));line(admin,'Symptomkontrollen',String(checks.length));line(admin,'Arbeitsplatzbeobachtungen',String(work.length));
 const hospitalSec=section(report,'Krankenhausaufenthalte');line(hospitalSec,'Stationaere Aufenthalte im Zeitraum',String(hospital.length));line(hospitalSec,'Kalendertage im Berichtszeitraum (einmalig)',String(coveredDays.size));
 if(hospital.length){const list=node('ul','stats25-small-list');for(const e of [...hospital].sort((a,b)=>a.date.localeCompare(b.date))){const end=e.endDate||e.date;const place=String(e.place||'').trim();const info=[fmt(e.date)+(end!==e.date?' bis '+fmt(end):''),place,e.title||'Krankenhausaufenthalt',e.notes||''].filter(Boolean).join(' · ');list.append(node('li','',info));}hospitalSec.append(list)}else hospitalSec.append(node('p','stats25-muted','Kein Krankenhausaufenthalt in diesem Zeitraum hinterlegt.'));
 hospitalSec.append(node('p','stats25-muted','Gezählt werden nur als Krankenhausaufenthalt gespeicherte Kalendereinträge. Aufenthalte über Monats- oder Jahresgrenzen werden anteilig nach Tagen erfasst.'));
 const pulmoSec=section(report,'Lungenarzttermine');line(pulmoSec,'Dokumentierte Termine im Zeitraum',String(lungAppointments.length));
 if(lungAppointments.length){const list=node('ul','stats25-small-list');for(const e of [...lungAppointments].sort((a,b)=>a.date.localeCompare(b.date))){list.append(node('li','',[fmt(e.date),(e.time||'')+(e.time?' Uhr':''),e.place||'',e.title||'Lungenarzttermin',e.notes||''].filter(Boolean).join(' · ')));}pulmoSec.append(list)}else pulmoSec.append(node('p','stats25-muted','Keine Lungenarzttermine in diesem Zeitraum gespeichert.'));
 pulmoSec.append(node('p','stats25-muted','Neben der eigenen Kategorie werden ältere allgemeine Arzttermine mit eindeutigem Lungenarzt-/Pneumologie-Bezug im Titel berücksichtigt.'));
 const foot=node('footer','stats25-footer','Erstellt mit Asthma '+(window.ASTHMA_APP_VERSION||document.getElementById('footer-version')?.textContent?.trim()||'2.9.3')+' · Lokaler, selbst dokumentierter Gesundheitsbericht. Unvollständige Einträge und Messbedingungen berücksichtigen. Keine ärztliche Diagnose oder sozialrechtliche Entscheidung.');report.append(foot);if(window.ASTHMA_STATSP292?.append){try{await window.ASTHMA_STATSP292.append(report,r)}catch(appendError){console.warn("Diagramm-Anhang fehlgeschlagen:",appendError);status.textContent="Statistik erstellt, aber zusätzliche Diagramme konnten nicht aufgebaut werden: "+appendError.message;return;}}window.ASTHMA_STATSP292?.applySelection?.();status.textContent=`Bericht fertig: ${r.key}. Daten wurden nicht übertragen.`;
 }catch(e){status.textContent='Bericht konnte nicht erstellt werden: '+e.message}}
 function printReport(){if(!$('stats25-report').querySelector('.stats25-heading')){alert('Bitte zuerst eine Statistik berechnen.');return}if(!confirm('Der Ausdruck beziehungsweise die PDF-Datei ist unverschlüsselt und enthält Gesundheitsdaten. Fortfahren?'))return;document.body.classList.add('stats25-print');try{window.print()}finally{setTimeout(()=>document.body.classList.remove('stats25-print'),60000)}}
 window.addEventListener('afterprint',()=>document.body.classList.remove('stats25-print'));$('stats25-mode').addEventListener('change',()=>{$('stats25-month-wrap').hidden=$('stats25-mode').value!=='month';$('stats25-year-wrap').hidden=$('stats25-mode').value!=='year'});$('stats25-build').addEventListener('click',build);$('stats25-print').addEventListener('click',printReport);$('stats25-pdf').addEventListener('click',printReport);
 window.ASTHMA_STATS25=Object.freeze({build,range});
})();
