'use strict';
/* PneumoPro Labor & Proben 3.4.9: ausschließlich lokal, bestehender AES-GCM-Tresor.
   Befunddokumentation, keine automatische Diagnose, kein Antibiotika-Ratschlag. */
(()=>{
 const S=window.ASTHMA_SECURITY,$=id=>document.getElementById(id),lab=$('labor');
 if(!lab||!S?.state?.().unlocked||$('lp349'))return;
 const TESTS={
  'Mikrobiologie / Sputum':[
   'Grampräparat','Leukozyten im Sputum','Plattenepithelzellen / Probenqualität','Bakterienkultur','Erregeridentifizierung','Koloniezahl / Keimmenge','Pseudomonas aeruginosa','Haemophilus influenzae','Moraxella catarrhalis','Streptococcus pneumoniae','Staphylococcus aureus','MRSA','Enterobacterales / ESBL','Resistenzmechanismen','Antibiogramm','Legionellen-PCR','Pertussis-PCR','Nocardia-Kultur'],
  'Pilze / Mykobakterien':[
   'Pilzkultur','Aspergillus fumigatus','Candida spp.','Aspergillus-PCR','Pilzmikroskopie','Galactomannan (BAL)','Beta-D-Glucan','Säurefeste Stäbchen / AFB','Mykobakterienkultur','Tuberkulose-PCR / MTB-Komplex','Rifampicin-Resistenzmarker','Nichttuberkulöse Mykobakterien (NTM)','NTM-Spezies','Antimykobakterielles Antibiogramm'],
  'Atemwegs-PCR / Viren':[
   'SARS-CoV-2 PCR','Influenza A','Influenza B','RSV','Humanes Metapneumovirus','Rhinovirus / Enterovirus','Parainfluenza','Adenovirus','Bordetella pertussis','Mycoplasma pneumoniae','Chlamydia pneumoniae','Legionella pneumophila','Multiplex-Respirationspanel'],
  'Zytologie / Pathologie':[
   'Sputumzytologie','BAL-Zellbild','Neutrophile in BAL','Eosinophile in BAL','Lymphozyten in BAL','Makrophagen in BAL','Tumorzellen / Zytologie','Histologie / Gewebe','Immunhistochemie','PD-L1 TPS','EGFR / ALK / ROS1 / KRAS / weitere Molekularpathologie'],
  'Entzündung / Blutbild':[
   'CRP','BSG','Prokalzitonin','Leukozyten','Neutrophile absolut','Eosinophile absolut','Eosinophile relativ','Lymphozyten','Monozyten','Hämoglobin','Hämatokrit','Thrombozyten','Ferritin','Transferrinsättigung'],
  'Allergie / Immunsystem':[
   'Gesamt-IgE','Spezifisches IgE','Aspergillus-spezifisches IgE','Aspergillus-spezifisches IgG','IgG','IgA','IgM','IgG-Subklassen','Komplement C3','Komplement C4','ANA','ANCA','Rheumafaktor','Anti-CCP','Alpha-1-Antitrypsin','SERPINA1-Genotyp'],
  'Blutgase / Säure-Basen':[
   'pH','pO2','pCO2','Sauerstoffsättigung (SaO2)','Bicarbonat (HCO3)','Base Excess (BE)','Laktat','CO-Hämoglobin','Methämoglobin','Elektrolyte in BGA'],
  'Organwerte / Stoffwechsel':[
   'Kreatinin','eGFR','Harnstoff','Natrium','Kalium','Chlorid','Calcium','Magnesium','Glukose','HbA1c','AST / GOT','ALT / GPT','GGT','AP','Bilirubin','Albumin','Gesamteiweiß','TSH','fT3','fT4','Troponin','NT-proBNP','D-Dimer','INR','aPTT'],
  'Urin / Stuhl / Erguss':[
   'Urinstatus','Protein im Urin','Albumin / Kreatinin-Quotient','Urin-Kultur','Urin-PCR','Stuhl-Kultur','Stuhl-PCR-Panel','Calprotectin','Okkultes Blut im Stuhl','Pleuraflüssigkeit: pH','Pleuraflüssigkeit: Eiweiß','Pleuraflüssigkeit: LDH','Pleuraflüssigkeit: Zellzahl','Pleuraflüssigkeit: Zytologie','Pleuraflüssigkeit: Kultur'],
  'Weitere Labor-/Spezialtests':['FeNO (Atemtest, kein Bluttest)','Schweißchlorid','Sputumelastase','Pricktest / Allergietest','Tumormarker (nur ärztliche Fragestellung)','Genetik / Panel','Sonstige Untersuchung']
 };
 const specimenKinds=[['sputum','Sputum / abgehusteter Schleim'],['induced','Induziertes Sputum'],['bal','Bronchoalveoläre Lavage (BAL)'],['bronch','Bronchialsekret / Trachealsekret'],['swab','Nasen-/Rachenabstrich'],['biopsy','Biopsie / Gewebe'],['blood','Blut / Serum / Plasma'],['bga','Blutgase (BGA)'],['urine','Urin'],['stool','Stuhl'],['pleura','Pleuraflüssigkeit'],['other','Sonstige Probe']];
 const methods=['Nicht angegeben','Kultur','Grampräparat / Mikroskopie','PCR / NAAT','Antigentest','Zytologie','Histologie','Immunologie / Serologie','Klinische Chemie','Mehrere Verfahren'];
 const statuses=['Ausstehend','Nachweis positiv','Nicht nachgewiesen','Grenzwertig','Nicht eindeutig / unklar','Nicht untersucht'];
 const verdicts=['Nicht bewertet','Ärztlich unauffällig','Ärztlich auffällig','Kontrolle empfohlen','Probenqualität unzureichend'];
 const txt=(tag,t,cls)=>{const n=document.createElement(tag);if(t!==undefined)n.textContent=String(t);if(cls)n.className=cls;return n};
 const opt=(values,chosen)=>values.map(([id,label])=>'<option value="'+id+'"'+(id===chosen?' selected':'')+'>'+label+'</option>').join('');
 const iso=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&!Number.isNaN(new Date(d+'T12:00:00').getTime())&&new Date(d+'T12:00:00').toISOString().slice(0,10)===d;
 const dateToday=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
 const pretty=d=>iso(d)?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):'–';
 const uid=()=>crypto.randomUUID?.()||('p'+Date.now()+Math.random().toString(36).slice(2));
 const clean=(v,n=400)=>String(v??'').trim().slice(0,n);
 const style=document.createElement('style');style.id='lp349-style';style.textContent=`
 #lp349{background:#f5fafc;border:2px solid #bcd5df;border-radius:16px;padding:14px;margin:18px 0}
 #lp349 h3{font-weight:900;font-size:1.25rem;color:#163e54;margin:0 0 12px}#lp349 h4{font-size:1.03rem;margin:14px 0 8px}
 #lp349 .lp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
 #lp349 label{display:flex;flex-direction:column;font-weight:750;gap:5px;min-width:0;color:#23495b}
 #lp349 input,#lp349 select,#lp349 textarea{width:100%;min-width:0;max-width:100%;padding:10px;border:1px solid #b6ccd6;border-radius:8px;background:#fff;color:#123c50;box-sizing:border-box;font:inherit}
 #lp349 .lp-wide{grid-column:1/-1}#lp349 details{background:white;border:1px solid #c7d9e0;border-radius:11px;padding:12px;margin-top:12px}
 #lp349 summary{font-weight:850;color:#143c52;cursor:pointer}#lp349 .lp-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}
 #lp349 .lp-actions button{min-height:43px}#lp349 .lp-row{border:1px solid #ccdce3;padding:12px;border-radius:10px;margin:10px 0;background:#f7fbfd}
 #lp349 .lp-results{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
 #lp349 .lp-card{background:white;border:1px solid #cbdde5;border-radius:12px;padding:12px;margin:10px 0}
 #lp349 .lp-muted{color:#516d7c;font-size:0.9rem;line-height:1.5}#lp349 .lp-warn{color:#a52737;font-weight:750}
 #lp349 .lp-filters{display:flex;flex-wrap:wrap;gap:9px}#lp349 .lp-filters label{flex:1;min-width:140px}
 #lp349 .lp-explain{background:#eaf4f8;padding:11px;border-radius:9px}#lp349 .lp-stat{display:flex;flex-wrap:wrap;gap:12px}
 #lp349 .lp-stat strong{display:block;font-size:1.25rem}#lp349 .lp-stat>div{flex:1;min-width:110px;padding:10px;background:white;border-radius:10px}
 #lp349 table{width:100%;border-collapse:collapse;font-size:0.9rem}#lp349 th,#lp349 td{padding:7px;border-bottom:1px solid #d9e5eb;text-align:left;overflow-wrap:anywhere}
 #lp349 .lp-chart{max-width:100%;overflow:hidden}#lp349 .lp-chart svg{width:100%;height:auto}
 @media(max-width:580px){#lp349 .lp-grid,#lp349 .lp-results{grid-template-columns:1fr}#lp349{padding:12px}#lp349 button{max-width:100%}}
 @media print{#lp349{display:none!important}#lp349-print{break-inside:auto}}`;
 document.head.append(style);
 const box=document.createElement('section');box.id='lp349';
 const sampleOptions=opt(specimenKinds);
 box.innerHTML=`<h3>LABOR & PROBEN – SCHLEIMTEST / SPUTUM / WEITERE UNTERSUCHUNGEN</h3>
 <p class="lp-muted">Für ärztliche Untersuchungsberichte: Material, Entnahmedatum, Erreger, Kultur, PCR, Zytologie, Antibiogramm und Originalbilder. Zusätzlich Blut-, Urin-, Stuhl- und Spezialtests. <strong>Alle Angaben bleiben lokal verschlüsselt.</strong></p>
 <details open><summary>NEUE UNTERSUCHUNG EINTRAGEN / BEARBEITEN</summary>
 <form id="lp349-form"><div class="lp-grid">
 <label>Entnahmedatum *<input type="date" name="date" required></label><label>Material / Probentyp<select name="specimen">${sampleOptions}</select></label>
 <label>Klinik / Labor / Praxis<input name="clinic" maxlength="180"></label><label>Arzt / Einsender<input name="doctor" maxlength="150"></label>
 <label>Entnahmezeit (optional)<input name="time" type="time"></label><label>Nachweisverfahren<select name="method">${opt(methods.map(x=>[x,x]))}</select></label>
 <label>Laborergebnis gesamt<select name="status">${opt(statuses.map(x=>[x,x]))}</select></label>
 <label>Ärztliche Beurteilung<select name="verdict">${opt(verdicts.map(x=>[x,x]))}</select></label>
 <label>Probenqualität<select name="quality">${opt([['','Nicht angegeben'],['adequate','Geeignet laut Labor'],['poor','Unzureichend / kontaminiert'],['unknown','Unklar']])}</select></label>
 <label>Farbe / Beschaffenheit (Sputum)<input name="appearance" maxlength="160" placeholder="z. B. gelblich, zäh"></label>
 <label>Probenmenge (nur dokumentiert)<input name="amount" maxlength="80" placeholder="z. B. 3 ml"></label>
 <label>Antibiotika vor Entnahme<input name="antibiotics" maxlength="200" placeholder="falls bekannt"></label>
 <label class="lp-wide">Laborbefund im Originalwortlaut<textarea name="finding" rows="3" maxlength="4500" placeholder="z. B. Erreger / keine pathogenen Keime, Originaltext"></textarea></label>
 <label class="lp-wide">Ärztliche Bewertung / Therapieanordnung<textarea name="assessment" rows="2" maxlength="2500"></textarea></label>
 <label class="lp-wide">Nachkontrolle / Verlauf / Notizen<textarea name="note" rows="2" maxlength="2500"></textarea></label>
 <label class="lp-wide">Originalbefunde anhängen (PDF / Fotos je max. 12 MB, bis 8 Dateien)<input name="file" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/jpeg,image/png,image/webp,image/heic"></label>
 </div><h4>EINZELWERTE / ERREGER / TESTS</h4>
 <p class="lp-muted">Ein frei gewählter Test pro Zeile, einschließlich qualitativer Befunde („positiv“, „negativ“) oder Zahlenwerten mit Einheiten und Laborreferenz. Keine automatische Diagnose.</p>
 <div id="lp349-tests"></div><button type="button" id="lp349-addtest" class="btn btn-outline">+ Untersuchung / Messwert hinzufügen</button>
 <details><summary>ANTIBIOGRAMM · ANTIBIOTIKAEMPFINDLICHKEIT</summary><p class="lp-muted">S = sensibel; I = sensibel bei erhöhter Exposition (EUCAST); R = resistent. Die Bedeutung richtet sich nach dem verwendeten Laborstandard und der ärztlichen Behandlung. Keine automatische Antibiotikaauswahl.</p><div id="lp349-antibiogram"></div><button type="button" class="btn btn-outline" id="lp349-addabx">+ Antibiotikum hinzufügen</button></details>
 <div class="lp-actions"><button type="submit" class="btn btn-primary">UNTERSUCHUNG VERSCHLÜSSELT SPEICHERN</button><button type="button" id="lp349-cancel" class="btn btn-outline" hidden>Bearbeitung abbrechen</button></div>
 </form><p id="lp349-status" class="lp-muted" role="status" aria-live="polite"></p></details>
 <details><summary>MEINE LABORPROBEN, SUCHEN & VERLAUF</summary>
 <div class="lp-filters"><label>Suchen<input type="search" id="lp349-search" placeholder="Erreger, Klinik, Untersuchung"></label><label>Probentyp<select id="lp349-filter"><option value="">Alle Proben</option>${sampleOptions}</select></label></div>
 <div id="lp349-summary" class="lp-stat"></div><div id="lp349-records"></div>
 <h4>Werte im Verlauf</h4><p class="lp-muted">Nur vergleichbare numerische Einzelwerte mit gleicher Einheit. Unterschiedliche Methoden und Labore vor dem Vergleichen prüfen.</p>
 <label>Messgröße<select id="lp349-metric"></select></label><div id="lp349-chart" class="lp-chart"></div>
 </details>
 <details><summary>WAS BEDEUTEN DIE UNTERSUCHUNGEN?</summary><div class="lp-explain">
 <p><strong>Sputum/Schleim:</strong> Aus den tieferen Atemwegen abgehustetes Material; Speichel ist nicht gleichwertig. Qualität und Zeitpunkt der Entnahme beeinflussen das Ergebnis.</p>
 <p><strong>Kultur:</strong> Im Labor angezüchtete Bakterien oder Pilze. Ein positiver Befund kann auch eine Besiedlung bedeuten – nicht immer eine Infektion.</p>
 <p><strong>PCR / NAAT:</strong> Nachweis von Erbgut eines bestimmten Erregers, nicht zwangsläufig lebender Erreger.</p>
 <p><strong>Grampräparat:</strong> Mikroskopischer Hinweis auf Bakterien und Probenqualität; allein keine abschließende Erregerdiagnose.</p>
 <p><strong>AFB / Mykobakterien:</strong> Spezifische Tests etwa für Tuberkulose und nichttuberkulöse Mykobakterien; die normale Bakterienkultur erfasst sie nicht zuverlässig.</p>
 <p><strong>Zytologie:</strong> Untersuchung einzelner Zellen; unauffällige Zytologie schließt Lungenkrebs nicht sicher aus.</p>
 <p><strong>Antibiogramm:</strong> Labormessung zur Empfindlichkeit gegenüber Antibiotika, deren Interpretation unter anderem von der Erkrankung, Dosierung und dem verwendeten Standard abhängt.</p>
 <p>Referenzbereiche sind <strong>labor- und methodenabhängig</strong>. Nicht jede Untersuchung wird bei jeder Erkrankung benötigt. Krankheitsdiagnosen, Therapien und weiterführende Tests werden ärztlich entschieden.</p>
 </div></details>`;
 lab.querySelector('.section-heading')?.insertAdjacentElement('afterend',box);
 const form=$('lp349-form'),status=$('lp349-status'),tests=$('lp349-tests'),abx=$('lp349-antibiogram');
 const allTestNames=Object.values(TESTS).flat();
 const explanations={
  'Bakterienkultur':'Bakterien werden angezüchtet und identifiziert. Ein Nachweis ist ohne Beschwerden/Qualität noch keine behandlungsbedürftige Infektion.',
  'Grampräparat':'Mikroskopischer Ersteindruck von Bakterien und Entzündungszellen. Kein endgültiger Kultur- oder Resistenzbefund.',
  'Plattenepithelzellen / Probenqualität':'Viele Plattenepithelzellen können auf Speichelbeimengung hinweisen. Die Bewertung erfolgt durch das Labor.',
  'Leukozyten im Sputum':'Entzündungszellen in der Probe. Aus dem Wert allein lässt sich der Erreger nicht ableiten.',
  'Erregeridentifizierung':'Organismus laut Kultur, PCR oder anderer Methode, die auf dem Laborzettel stehen muss.',
  'Antibiogramm':'S/I/R ist eine Laborklassifikation, keine automatische Antibiotikatherapieempfehlung.',
  'Mykobakterienkultur':'Spezialkultur auf Tuberkulose- und nichttuberkulöse Mykobakterien, deutlich anders als die Routinebakterienkultur.',
  'Säurefeste Stäbchen / AFB':'Mikroskopie zum Nachweis säurefester Bakterien. Alleine weder TB-Bestätigung noch TB-Ausschluss.',
  'Tuberkulose-PCR / MTB-Komplex':'Spezifischer molekularer Nachweis. Untersuchung und Interpretation gehören in ärztliche Hände.',
  'Pilzkultur':'Pilzidentifizierung; Besiedlung, Kontamination und Infektion unterscheiden.',
  'Aspergillus fumigatus':'Pilz, der je nach Kontext Besiedlung, Allergie oder Infektion bedeuten kann.',
  'Sputumzytologie':'Untersuchung von Zellen, ersetzt keine ärztliche Gewebeabklärung bei auffälliger Bildgebung.',
  'SARS-CoV-2 PCR':'Nachweis viraler Erbsubstanz, nicht gleichbedeutend mit der Menge vermehrungsfähiger Viren.',
  'CRP':'Unspezifischer Entzündungsmarker; Ursache und Grenzwerte hängen vom klinischen Kontext ab.',
  'Prokalzitonin':'Entzündungs-/Infektionsmarker, weder als alleinige Bestätigung noch als alleiniger Ausschluss geeignet.',
  'Eosinophile absolut':'Weiße Blutkörperchen, relevant u.a. für eosinophile Entzündungsformen; Kortison kann den Wert verändern.',
  'Gesamt-IgE':'Immunglobulin E; unspezifisch und nicht alleine ein Beweis für eine bestimmte Allergie.',
  'pO2':'Sauerstoffpartialdruck im Blutgas; Probenart und Einheit sind entscheidend.',
  'pCO2':'Kohlendioxidpartialdruck; abhängig von Ventilation, Probenart und Messbedingungen.',
  'FeNO (Atemtest, kein Bluttest)':'Messung von Stickstoffmonoxid in der Ausatemluft als Hinweis auf bestimmte Entzündungsaktivität, keine Diagnose alleine.'
 };
 
 let studies=[],docs=[],editId='',loading=0,previewUrls=[];const clearPreviews=()=>{previewUrls.forEach(u=>URL.revokeObjectURL(u));previewUrls=[]};
 function say(s,bad=false){status.textContent=s;status.classList.toggle('lp-warn',bad)}
 function makeTest(row={}){if(tests.children.length>=50)return;
  const item=document.createElement('div');item.className='lp-row';
  item.innerHTML='<div class="lp-results"><label>Untersuchung<select data-test="name"></select></label><label>Eigener Testname (optional)<input data-test="custom" maxlength="140"></label><label>Messwert / Ergebnis<input data-test="value" maxlength="140" placeholder="z. B. 3,7 oder nachgewiesen"></label><label>Einheit<input data-test="unit" maxlength="50" placeholder="wie im Befund"></label><label>Referenzbereich des Labors<input data-test="reference" maxlength="120"></label><label>Testmethode / Laborhinweis<input data-test="method" maxlength="180"></label></div><button type="button" class="btn btn-text" data-remove>Zeile entfernen</button>';
  const info=txt('p','Nach Auswahl des Tests wird eine kurze Erklärung angezeigt.','lp-muted');item.querySelector('.lp-results').after(info);const select=item.querySelector('[data-test=name]');select.add(new Option('Bitte Test auswählen',''));for(const [group,names] of Object.entries(TESTS)){const optgroup=document.createElement('optgroup');optgroup.label=group;for(const name of names)optgroup.append(new Option(name,name));select.append(optgroup)}
  if(row.name&&!allTestNames.includes(row.name))item.querySelector('[data-test=custom]').value=row.name;else select.value=row.name||'';
  for(const k of ['value','unit','reference','method'])item.querySelector('[data-test='+k+']').value=row[k]||'';
  const explain=()=>{const k=item.querySelector('[data-test=custom]').value.trim()||select.value;info.textContent=explanations[k]||'Den genauen Untersuchungsnamen, die Methode und den Laborreferenzbereich aus dem Originalbefund übernehmen. Kein allgemeiner Grenzwert wird erfunden.'};select.addEventListener('change',explain);item.querySelector('[data-test=custom]').addEventListener('input',explain);explain();item.querySelector('[data-remove]').addEventListener('click',()=>item.remove());tests.append(item);
 }
 function makeAbx(row={}){if(abx.children.length>=35)return;const item=document.createElement('div');item.className='lp-row';item.innerHTML='<div class="lp-results"><label>Antibiotikum<input data-abx="name" maxlength="100" placeholder="Name laut Antibiogramm"></label><label>Empfindlichkeit<select data-abx="category"><option value="">Nicht angegeben</option><option>S</option><option>I</option><option>R</option><option>Ohne Kategorie</option></select></label><label>MIC / MHK (optional)<input data-abx="mic" maxlength="80" placeholder="Wert mit Einheit"></label><label>Laborstandard<input data-abx="standard" maxlength="80" placeholder="z. B. EUCAST 2026"></label></div><button type="button" class="btn btn-text" data-remove>Zeile entfernen</button>';for(const k of ['name','category','mic','standard'])item.querySelector('[data-abx='+k+']').value=row[k]||'';item.querySelector('[data-remove]').addEventListener('click',()=>item.remove());abx.append(item)}
 const rowValues=(host,prefix,allowed)=>[...host.children].map(el=>Object.fromEntries(allowed.map(k=>[k,clean(el.querySelector('[data-'+prefix+'='+k+']')?.value,190)]))).filter(row=>Object.values(row).some(Boolean));
 function normalizeRows(){const out=[];for(const el of tests.children){const obj={};for(const k of ['name','value','unit','reference','method'])obj[k]=clean(el.querySelector('[data-test='+k+']')?.value,190);obj.name=clean(el.querySelector('[data-test=custom]')?.value,140)||obj.name;if(!obj.name&&!obj.value&&!obj.unit)continue;if(!obj.name)throw Error('Bitte Untersuchung auswählen oder eigenen Testnamen eingeben.');if(obj.value&&!obj.name)throw Error('Messwert ohne Untersuchungsname.');out.push(obj);}return out}
 function readForm(){const fields=new FormData(form),date=clean(fields.get('date'));if(!iso(date))throw Error('Gültiges Entnahmedatum fehlt.');const record={id:editId||uid(),date};for(const k of ['specimen','clinic','doctor','time','method','status','verdict','quality','appearance','amount','antibiotics','finding','assessment','note'])record[k]=clean(fields.get(k),k==='finding'?4500:k==='note'||k==='assessment'?2500:200);
  record.results=normalizeRows();record.antibiogram=rowValues(abx,'abx',['name','category','mic','standard']).filter(x=>x.name);if(record.results.length>50||record.antibiogram.length>35)throw Error('Zu viele Einzelwerte.');if(!record.finding&&!record.results.length&&!record.antibiogram.length&&!record.assessment&&!form.elements.file.files.length)throw Error('Bitte mindestens einen Befund, Wert oder eine Datei eingeben.');return record;}
 function reset(){form.reset();form.elements.date.value=dateToday();tests.replaceChildren();abx.replaceChildren();makeTest();editId='';$('lp349-cancel').hidden=true;form.querySelector('[type=submit]').textContent='UNTERSUCHUNG VERSCHLÜSSELT SPEICHERN'}
 function edit(row){reset();editId=row.id;for(const [k,v] of Object.entries(row))if(form.elements[k]&&typeof v!=='object')form.elements[k].value=v??'';tests.replaceChildren();abx.replaceChildren();(row.results||[]).forEach(makeTest);if(!tests.children.length)makeTest();(row.antibiogram||[]).forEach(makeAbx);form.querySelector('[type=submit]').textContent='ÄNDERUNGEN VERSCHLÜSSELT SPEICHERN';$('lp349-cancel').hidden=false;box.querySelector('details').open=true;box.scrollIntoView({block:'start',behavior:'smooth'})}
 function download(doc){if(!(doc.blob instanceof Blob)){say('Datei nicht lesbar.',true);return;}const u=URL.createObjectURL(doc.blob),a=document.createElement('a');a.href=u;a.download=doc.name||'Laborbericht';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000)}
 async function storeFile(file,study){if(!file)return;if(file.size>12*1048576||file.size===0||!/\.(pdf|jpe?g|png|webp|heic|heif)$/i.test(file.name))throw Error('Originaldatei muss PDF oder Foto bis 12 MB sein.');const exists=(await S.list('documents')).some(d=>d.studyId===study.id&&d.kind==='Laborproben'&&d.name===file.name&&d.size===file.size);if(exists)return;
  const id=uid(),item={id,name:clean(file.name,180),mime:file.type||'application/octet-stream',size:file.size,blob:file,kind:'Laborproben',studyId:study.id,documentDate:study.date,createdAt:new Date().toISOString()};await S.put('documents',item,id);const verify=await S.get('documents',id);if(!verify?.blob||verify.blob.size!==file.size)throw Error('Originaldatei konnte nicht bestätigt werden.');}
 async function save(e){e.preventDefault();let rec;try{rec=readForm();}catch(err){say(err.message,true);return;}if(form.elements.file.files.length>8){say('Bitte maximal acht Originaldateien je Untersuchung auswählen.',true);return}const btn=form.querySelector('[type=submit]');btn.disabled=true;try{const key='labpro349/'+rec.id,old=await S.get('suite',key);rec.createdAt=old?.value?.createdAt||new Date().toISOString();rec.updatedAt=new Date().toISOString();await S.put('suite',{key,type:'labpro349',value:rec},key);for(const f of [...form.elements.file.files].slice(0,8))await storeFile(f,rec);reset();await refresh();say('Laborprobe verschlüsselt gespeichert, alle vorhandenen Proben bleiben erhalten.')}catch(err){say('Speichern fehlgeschlagen oder nur teilweise abgeschlossen: '+err.message+' Bitte Liste prüfen.',true)}finally{btn.disabled=false}}
 function renderRecords(){clearPreviews();const host=$('lp349-records'),query=$('lp349-search').value.toLocaleLowerCase('de-DE'),kind=$('lp349-filter').value;host.replaceChildren();const filtered=studies.filter(r=>(!kind||r.specimen===kind)&&(!query||[r.clinic,r.doctor,r.finding,r.assessment,r.note,...(r.results||[]).flatMap(x=>[x.name,x.value])].join(' ').toLocaleLowerCase('de-DE').includes(query)));
  for(const r of filtered.slice().reverse()){const card=txt('article',undefined,'lp-card');const headline=txt('strong',pretty(r.date)+' · '+(specimenKinds.find(x=>x[0]===r.specimen)?.[1]||'Laborprobe'));card.append(headline);card.append(txt('p',(r.clinic||'Einrichtung unbekannt')+' · '+(r.status||'Befund ohne Status'),'lp-muted'));
   for(const [label,k] of [['Originalbefund','finding'],['Ärztliche Bewertung','assessment'],['Nachkontrolle / Notiz','note']])if(r[k])card.append(txt('p',label+': '+r[k]));
   if(r.results?.length){const detail=document.createElement('details');detail.append(txt('summary','Einzelwerte ('+r.results.length+')'));const table=txt('table'),head=txt('thead'),h=txt('tr');for(const k of ['Untersuchung','Ergebnis','Einheit','Referenz'])h.append(txt('th',k));head.append(h);table.append(head);const body=txt('tbody');for(const x of r.results){const tr=txt('tr');for(const k of ['name','value','unit','reference'])tr.append(txt('td',x[k]||'–'));body.append(tr)}table.append(body);detail.append(table);card.append(detail)}
   if(r.antibiogram?.length){const detail=document.createElement('details');detail.append(txt('summary','Antibiogramm ('+r.antibiogram.length+')'));const table=txt('table');for(const a of r.antibiogram){const tr=txt('tr');tr.append(txt('td',a.name),txt('td',a.category||'–'),txt('td',a.mic||'–'));table.append(tr)}detail.append(table);card.append(detail)}
   const related=docs.filter(d=>d.kind==='Laborproben'&&d.studyId===r.id);for(const doc of related){const b=txt('button','Originaldatei öffnen / speichern: '+doc.name,'btn btn-outline');b.type='button';b.addEventListener('click',()=>download(doc));card.append(b);if(doc.blob instanceof Blob&&/^image\/(jpeg|png|webp)$/.test(doc.mime||'')){const image=document.createElement('img'),u=URL.createObjectURL(doc.blob);previewUrls.push(u);image.src=u;image.alt=doc.name||'Original-Laborbefund';image.style.cssText='display:block;width:100%;max-height:370px;object-fit:contain;margin:9px auto;';card.append(image)}}
   const buttons=txt('div',undefined,'lp-actions'),modify=txt('button','Bearbeiten','btn btn-outline'),del=txt('button','Löschen','btn btn-text');modify.type=del.type='button';modify.onclick=()=>edit(r);del.onclick=async()=>{if(!confirm('Laborprobenwerte vom '+pretty(r.date)+' löschen? Zugehörige Originaldateien bleiben gespeichert.'))return;try{await S.del('suite','labpro349/'+r.id);await refresh();say('Laborprobenwerte gelöscht. Originaldateien bleiben in der Akte.')}catch(err){say(err.message,true)}};buttons.append(modify,del);card.append(buttons);host.append(card)}
  if(!filtered.length)host.append(txt('p','Keine passenden Laborproben vorhanden.','lp-muted'));
  const summary=$('lp349-summary');summary.replaceChildren();for(const [label,n] of [['Untersuchungen',studies.length],['Mit Einzelwerten',studies.filter(r=>r.results?.length).length],['Originaldateien',docs.filter(d=>d.kind==='Laborproben').length]]){const b=txt('div');b.append(txt('strong',n),txt('span',label));summary.append(b)}
 }
 const parseNum=v=>{if(typeof v==='number')return Number.isFinite(v)?v:null;if(typeof v!=='string'||!/^\s*[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)\s*$/.test(v))return null;const n=Number(v.trim().replace(',','.'));return Number.isFinite(n)?n:null};
 function renderChart(){const sel=$('lp349-metric'),prev=sel.value,all=new Map();for(const r of studies)for(const a of r.results||[]){const n=parseNum(a.value);if(n===null||!a.name)continue;const key=a.name+' · '+(a.unit||'ohne Einheit'),t=all.get(key)||[];t.push({date:r.date,value:n});all.set(key,t)}sel.replaceChildren();for(const name of [...all.keys()].sort())sel.add(new Option(name,name));if(all.has(prev))sel.value=prev;const host=$('lp349-chart');host.replaceChildren();const points=(all.get(sel.value)||[]).sort((a,b)=>a.date.localeCompare(b.date));if(!points.length){host.append(txt('p','Noch keine vergleichbaren numerischen Laborwerte für ein Diagramm.','lp-muted'));return}const vals=points.map(p=>p.value),lo=Math.min(...vals),hi=Math.max(...vals),padding=Math.max(1,(hi-lo)*.1),min=lo-padding,max=hi+padding||min+1,W=620,H=238,L=65,T=28,R=20,B=44;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('role','img');svg.setAttribute('aria-label','Verlauf '+sel.value);const add=(tag,atts,label)=>{const e=document.createElementNS(svg.namespaceURI,tag);for(const [k,v] of Object.entries(atts))e.setAttribute(k,v);if(label!==undefined)e.textContent=label;svg.append(e);return e};for(let i=0;i<=4;i++){const y=T+(H-T-B)*i/4;add('line',{x1:L,x2:W-R,y1:y,y2:y,stroke:'#dbe6eb'});add('text',{x:L-7,y:y+5,'text-anchor':'end','font-size':13,fill:'#385b70'},(max-(max-min)*i/4).toLocaleString('de-DE',{maximumFractionDigits:1}))}const xy=(r,i)=>[L+(points.length===1?(W-L-R)/2:i*(W-L-R)/(points.length-1)),T+(max-r.value)/(max-min)*(H-T-B)];let last;points.forEach((r,i)=>{const [x,y]=xy(r,i);if(last)add('line',{x1:last[0],y1:last[1],x2:x,y2:y,stroke:'#177c91','stroke-width':3});const circle=add('circle',{cx:x,cy:y,r:5,fill:'#177c91'});const title=document.createElementNS(svg.namespaceURI,'title');title.textContent=pretty(r.date)+' '+r.value;circle.append(title);if(points.length<10)add('text',{x,y:Math.max(11,y-12),'text-anchor':'middle','font-size':12,fill:'#19455b'},String(r.value));last=[x,y]});if(points.length){add('text',{x:L,y:H-9,'font-size':12,fill:'#385b70'},pretty(points[0].date));add('text',{x:W-R,y:H-9,'text-anchor':'end','font-size':12,fill:'#385b70'},pretty(points.at(-1).date))}host.append(svg);host.append(txt('p','Ø '+(vals.reduce((a,b)=>a+b,0)/vals.length).toLocaleString('de-DE',{maximumFractionDigits:2})+' · Minimum '+lo+' · Maximum '+hi+' · '+points.length+' Messpunkte (gleiche Bezeichnung und Einheit).','lp-muted'))}
 async function refresh(){const n=++loading;const [all,documents]=await Promise.all([S.list('suite'),S.list('documents')]);if(n!==loading)return;studies=all.filter(x=>x.type==='labpro349'&&x.value&&iso(x.value.date)).map(x=>x.value).sort((a,b)=>a.date.localeCompare(b.date));docs=documents;renderRecords();renderChart()}
 form.addEventListener('submit',save);$('lp349-addtest').addEventListener('click',()=>makeTest());$('lp349-addabx').addEventListener('click',()=>makeAbx());$('lp349-cancel').addEventListener('click',reset);$('lp349-search').addEventListener('input',renderRecords);$('lp349-filter').addEventListener('change',renderRecords);$('lp349-metric').addEventListener('change',renderChart);
 // Statistik-Integration ohne Änderung an bestehenden Berichtsskripten.
 const opts=$('statsplus292-options'),container=opts?.querySelector('.s292-choices');let reportEnabled=true;
 let reportFileUrls=[];const clearPrintUrls=()=>{for(const u of reportFileUrls)URL.revokeObjectURL(u);reportFileUrls=[];};
 if(container&&!container.querySelector('[data-lp349-option]')){const label=txt('label',undefined,'s292-option');const cb=document.createElement('input');cb.type='checkbox';cb.checked=true;cb.value='labpro349';cb.dataset.lp349Option='true';cb.setAttribute('aria-label','Laborproben, Kulturen und Antibiogramme');label.append(cb,txt('span','Laborproben – Sputum, Kultur, PCR und Antibiogramm'));container.append(label);cb.addEventListener('change',()=>{reportEnabled=cb.checked;updateReport()});opts.addEventListener('change',()=>{queueMicrotask(()=>{reportEnabled=cb.checked;updateReport()})});}
 const htmlReport=()=>{const r=$('stats25-report');return r?.querySelector('#statsplus292-appendix')};
 let reportBusy=false;
 function updateReport(){const parent=htmlReport();if(!parent)return;clearPrintUrls();if(reportEnabled)parent.dataset.printEnabled='true';let sub=parent.querySelector('#lp349-report');if(!sub){sub=document.createElement('section');sub.id='lp349-report';sub.className='s292-category';sub.dataset.s292Kind='labpro349';parent.append(sub)}sub.replaceChildren();sub.dataset.printEnabled=reportEnabled?'true':'false';sub.append(txt('h3','Laborproben – Sputum, Kultur, PCR und Antibiogramm'));const toc=$('s292-contents-list');toc?.querySelector('[data-lp349-toc]')?.remove();if(toc&&reportEnabled){const li=txt('li');li.dataset.lp349Toc='true';const a=txt('a','Laborproben – Sputum, Kulturen, Antibiogramm');a.href='#lp349-report';a.addEventListener('click',e=>{e.preventDefault();sub.scrollIntoView({behavior:'smooth',block:'start'})});li.append(a);toc.append(li)}
  const mode=$('stats25-mode')?.value,month=$('stats25-month')?.value,year=$('stats25-year')?.value;let start='0000-01-01',end='9999-12-31';if(mode==='month'&&/^\d{4}-\d{2}$/.test(month||'')){start=month+'-01';const [y,m]=month.split('-').map(Number);end=month+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0')}else if(mode==='year'&&/^\d{4}$/.test(year||'')){start=year+'-01-01';end=year+'-12-31'}const period=studies.filter(x=>x.date>=start&&x.date<=end);
  if(!period.length){sub.append(txt('p','Für diesen Zeitraum sind keine dokumentierten Laborproben vorhanden.','s292-note'));return}
  for(const r of period){const article=txt('article',undefined,'lp-card');article.append(txt('h4',pretty(r.date)+' · '+(specimenKinds.find(x=>x[0]===r.specimen)?.[1]||r.specimen)));article.append(txt('p',(r.clinic||'Einrichtung nicht angegeben')+' · '+(r.method||'')+' · '+(r.status||'')));
   for(const [label,k] of [['Befund','finding'],['Ärztliche Bewertung','assessment']])if(r[k])article.append(txt('p',label+': '+r[k]));if(r.results?.length){const tab=txt('table');for(const t of r.results){const tr=txt('tr');tr.append(txt('td',t.name),txt('td',t.value||'–'),txt('td',t.unit||''),txt('td',t.reference||''));tab.append(tr)}article.append(tab)}if(r.antibiogram?.length){article.append(txt('p','Antibiogramm (nur Laborbefund):'));for(const a of r.antibiogram)article.append(txt('p',a.name+': '+a.category+(a.mic?' · MIC '+a.mic:'')))}const linked=docs.filter(x=>x.studyId===r.id&&x.kind==='Laborproben');if(linked.length){article.append(txt('p',linked.length+' Originaldatei(en) in der privaten Akte.'));for(const d of linked){if(!(d.blob instanceof Blob)||!/^image\/(jpeg|png|webp)$/.test(d.mime||''))continue;const figure=txt('figure'),img=document.createElement('img'),u=URL.createObjectURL(d.blob);reportFileUrls.push(u);img.src=u;img.alt=d.name||'Originalbefund';img.style.cssText='max-width:100%;max-height:190mm;object-fit:contain;display:block;';figure.append(txt('figcaption',d.name||'Originalbefund'),img);figure.style.breakInside='avoid';article.append(figure);}}sub.append(article)} }
 // Schutz vor rekursivem MutationObserver: nur neu eingefügtes Berichts-Appendix beobachten.
 const reportHost=$('stats25-report');if(reportHost){const observer=new MutationObserver(records=>{if(reportBusy)return;if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.id==='statsplus292-appendix'||n.querySelector?.('#statsplus292-appendix'))))){reportBusy=true;updateReport();reportBusy=false}});observer.observe(reportHost,{childList:true,subtree:true})}
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite'||e.detail?.group==='documents')refresh().then(updateReport).catch(err=>say(err.message,true))});
 reset();refresh().then(updateReport).catch(e=>say('Labor-Probenübersicht konnte nicht geladen werden: '+e.message,true));
 window.__PNEUMOPRO_LAB349=Object.freeze({version:'3.5.0',specimens:specimenKinds.length,catalogCount:allTestNames.length,numeric:parseNum});
})();
