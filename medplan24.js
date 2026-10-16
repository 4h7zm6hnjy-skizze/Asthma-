'use strict';
/* 2.4: uses existing encrypted suite/meds records. Never suggests or changes doses. */
(()=>{
 const $=id=>document.getElementById(id);
 const SEC=window.ASTHMA_SECURITY;
 const fmt=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')?x.split('-').reverse().join('.'):'–';
 // Nur Nucala/Mepolizumab: die zeitlich gleichbedeutende Angabe vereinheitlichen.
 // Andere Arzneimittel, Wirkstärken und Dosierungen werden nicht verändert.
 const nucala28Text=(med,value)=>typeof value==='string'&&/\b(?:nucala|mepolizumab)\b/i.test(String(med?.name||''))
    ?value.replace(/\balle\s+(?:4|vier)\s+Wochen\b/gi,'alle 28 Tage'):value;
 const esc=s=>String(s??'');
 let meds=[];
 function render(){const box=$('med24-overview');if(!box)return;box.replaceChildren();
   if(!meds.length){const p=document.createElement('p');p.textContent='Noch keine Medikamente gespeichert. Erfasse ausschließlich deinen ärztlich bestätigten Plan.';box.append(p);return;}
   const sorted=[...meds].sort((a,b)=>a.name.localeCompare(b.name,'de'));
   const table=document.createElement('table');table.className='med24-table';
   const header=document.createElement('thead'),hr=document.createElement('tr');for(const x of ['Medikament','Ärztliche Dosis','Einnahme / Behandlung','Nächster Termin']){const th=document.createElement('th');th.textContent=x;hr.append(th)}header.append(hr);table.append(header);
   const body=document.createElement('tbody');for(const m of sorted){const tr=document.createElement('tr');const values=[m.name,nucala28Text(m,m.dose)||'Nicht angegeben',[m.route||m.kind||'',(m.slots||[]).join(' / ')||m.time||'nach ärztlichem Plan',m.interval?'alle '+m.interval+' Tage':''].filter(Boolean).join(' · '),fmt(m.next)];for(const x of values){const td=document.createElement('td');td.textContent=esc(x);tr.append(td)}body.append(tr)}table.append(body);box.append(table);
 }
 async function sync(){try{const records=await SEC.list('suite');meds=records.filter(x=>x.type==='meds').map(x=>x.value);render()}catch(e){const box=$('med24-overview');if(box)box.textContent='Medikamentenplan kann nicht geladen werden: '+e.message;}}
 window.addEventListener('asthma:meds-change',e=>{meds=e.detail?.meds||[];render()});
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite')sync()});
 sync();
 $('med24-print')?.addEventListener('click',()=>{if(!meds.length){alert('Bitte zuerst deine ärztlich verordneten Medikamente speichern.');return;}if(!confirm('Der Ausdruck bzw. das PDF enthält unverschlüsselte Gesundheitsdaten. Fortfahren?'))return;document.body.classList.add('med24-print');try{window.print()}finally{setTimeout(()=>document.body.classList.remove('med24-print'),700)}});
 SEC.list('suite').then(rows=>{meds=rows.filter(x=>x.type==='meds').map(x=>x.value);render()}).catch(()=>{});
 $('med-form')?.addEventListener('reset',()=>{setTimeout(()=>{$('med24-edit-id').value='';$('med24-submit').textContent='Medikament speichern'},0)});
 // Gewuenschte Korrektur im BESTEHENDEN verschluesselten Medikationsplan.
 // Ausschliesslich Nucala-Text "alle 4 Wochen" -> "alle 28 Tage".
 // Keine neuen Datensaetze, kein Passwortwechsel, keine Aenderung der Wirkstaerke
 // oder der separat erfassten Behandlungsintervalle. Idempotent bei jedem Start.
 async function correctNucalaWording(){
   try{
     const records=await SEC.list('suite');
     for(const record of records){
       if(record?.type!=='meds'||!record.value||typeof record.value!=='object')continue;
       const med=record.value;
       const nextDose=nucala28Text(med,med.dose);
       const nextNotes=nucala28Text(med,med.notes);
       if(nextDose===med.dose&&nextNotes===med.notes)continue;
       const key=typeof record.key==='string'&&record.key.startsWith('meds/')?record.key
         :typeof med.id==='string'&&med.id?`meds/${med.id}`:null;
       if(!key)continue;
       await SEC.put('suite',{...record,value:{...med,dose:nextDose,notes:nextNotes}},key);
     }
   }catch(err){console.warn('Nucala-Textkorrektur konnte nicht gespeichert werden:',err?.message||err);}
 }
 correctNucalaWording();
})();

'use strict';
/* Asthma-Medikamentenwissen: statische, quellenbasierte Patienteninformation.
   Kein Diagnose- oder Dosierungsalgorithmus; kein Netzwerkabruf persönlicher Daten. */
(()=>{
  const S=window.ASTHMA_SECURITY;
  const target=document.getElementById('med24-overview');
  if(!S||!target||document.getElementById('med-guide-282'))return;
  const reference={
    trimbow:{title:'Trimbow',class:'Dreifach-Inhalation (Beclometason, Formoterol, Glycopyrronium)',what:'Ein inhalatives Dauertherapie-Medikament, das drei Wirkprinzipien kombiniert.',for:'Dauerbehandlung bei Asthma, wenn eine einfachere inhalative Therapie nicht ausreicht.',how:'Beclometason hemmt Entzündungen in der Lunge. Formoterol entspannt über Beta-2-Rezeptoren die Bronchien länger anhaltend. Glycopyrronium hemmt muskarinische Rezeptoren und erweitert dadurch zusätzlich die Atemwege.',benefit:'Weniger Atemnot und Asthma-Verschlechterungen sowie bessere Kontrolle der Beschwerden sind möglich; ein akuter schwerer Anfall wird damit nicht ersetzt.',effects:'Mundsoor, Heiserkeit, Rachenreizung, Husten, Mundtrockenheit und Kopfschmerzen; außerdem möglich: Zittern, Herzklopfen, erhöhter Blutzucker und Muskelkrämpfe.',serious:'Selten/ernst: Herzrhythmusstörungen, Abfall des Kaliums, Glaukom-/Augenbeschwerden, Harnverhalt oder eine unerwartete Verschlimmerung direkt nach dem Inhalieren.',red:'Bei bekannter Überempfindlichkeit gegen die Bestandteile nicht anwenden.',caution:'Nicht eigenständig mit weiteren langwirksamen Beta-2-Sprays oder anticholinergen Dauerinhalatoren kombinieren. Nicht-selektive Betablocker (auch einige Augentropfen) können die Bronchien verengen beziehungsweise die Wirkung mindern. Kortikosteroide, Theophyllin und bestimmte Entwässerungsmittel können einen Kaliumabfall verstärken. Nach steroidhaltiger Inhalation den Mund ausspülen.',link:'https://www.patienteninfo-service.de/a-z-liste/t/trimbow-87-mikrogramm5-mikrogramm9-mikrogramm-druckgasinhalation'},
    nucala:{title:'Nucala',class:'Biologikum (Mepolizumab, Anti-IL-5-Antikörper)',what:'Ein gezielt wirkender Antikörper zur Behandlung von schwerem eosinophilem Asthma.',for:'Zusatztherapie bei schwerem, eosinophilem Asthma trotz geeigneter inhalativer Behandlung.',how:'Bindet den Entzündungsbotenstoff Interleukin-5 (IL-5), wodurch die Zahl eosinophiler Entzündungszellen sinkt.',benefit:'Weniger schwere Asthmaanfälle und bei geeigneten Patienten weniger Bedarf an systemischem Kortison; kein Akutmedikament.',effects:'Sehr häufig Kopfschmerzen; häufig zum Beispiel Schmerzen/Rötung an der Einstichstelle, Rücken- oder Gelenkschmerzen, Oberbauchbeschwerden, Fieber und Rachenbeschwerden.',serious:'Schwere allergische Reaktionen bis zur Anaphylaxie sind selten, können aber auch verzögert auftreten. Bei Schwellungen, Kreislaufproblemen oder neuer Atemnot sofort Hilfe holen.',red:'Bei bekannter Allergie gegen Mepolizumab oder einen Bestandteil nicht anwenden.',caution:'Direkte Arzneimittel-Wechselwirkungen gelten als eher unwahrscheinlich; spezielle Wechselwirkungsstudien fehlen. Wurminfektionen vor beziehungsweise unter der Therapie ärztlich beachten. Nucala ersetzt weder Notfallspray noch andere Medikamente ohne ärztliche Entscheidung.',link:'https://www.patienteninfo-service.de/a-z-liste/n/nucala-100-mg-injektionsloesung-im-fertigpen'},
    citalopram:{title:'Citalopram',class:'Antidepressivum (SSRI)',what:'Ein Arzneimittel aus der Gruppe der selektiven Serotonin-Wiederaufnahmehemmer.',for:'Behandlung von Depressionen und – je nach zugelassenem Präparat – Panikstörungen.',how:'Hemmt die Wiederaufnahme des Botenstoffes Serotonin in Nervenzellen und beeinflusst so stimmungs- und angstbezogene Signalübertragung.',benefit:'Stimmung, Ängste, Anspannung und Alltagsbelastbarkeit können sich innerhalb mehrerer Wochen bessern.',effects:'Übelkeit, Mundtrockenheit, Schwitzen, Zittern, Kopfschmerzen, Schlaflosigkeit oder Müdigkeit sowie sexuelle Funktionsstörungen.',serious:'Selten/ernst: gefährliche QT-Verlängerung/Herzrhythmusstörungen, Serotonin-Syndrom, Krampfanfälle, niedriger Natriumwert oder Blutungen. Nicht abrupt ohne ärztlichen Plan absetzen.',red:'Nicht mit MAO-Hemmern oder mit bekannten QT-verlängernden Arzneimitteln kombinieren. Beispiele: Pimozid, bestimmte Antiarrhythmika sowie bestimmte Antibiotika wie Moxifloxacin oder Erythromycin intravenös. Linezolid ist ohne streng überwachte Ausnahmesituation kontraindiziert.',caution:'Azithromycin kann ebenfalls das QT-Risiko erhöhen und muss vor Beginn medizinisch geprüft werden. Johanniskraut, Tramadol und andere serotonerg wirkende Mittel können das Serotonin-Syndrom begünstigen. Ibuprofen, Naproxen, ASS und andere NSAR erhöhen zusammen mit SSRI das Blutungsrisiko.',link:'https://www.patienteninfo-service.de/a-z-liste/c/citalopram-1a-pharma-10mg-filmtabletten'},
    ramipril:{title:'Ramipril',class:'Blutdruckmittel (ACE-Hemmer)',what:'Ein ACE-Hemmer zur Behandlung von Bluthochdruck und weiteren Herz-Kreislauf-Erkrankungen.',for:'Je nach ärztlicher Indikation Bluthochdruck, Schutz des Herz-Kreislauf-Systems, Herzschwäche oder Nierenschutz.',how:'Hemmt das Angiotensin-konvertierende Enzym. Dadurch sinkt die Gefäßspannung, Blutgefäße werden weiter und das Herz entlastet.',benefit:'Der Blutdruck kann sinken; langfristig können Herz, Gefäße und bei geeigneter Indikation auch die Nieren geschützt werden.',effects:'Trockener Reizhusten, Schwindel, Kopfschmerzen, Müdigkeit, niedriger Blutdruck, Übelkeit und erhöhte Kaliumwerte.',serious:'Selten/ernst: Schwellung von Lippen/Zunge/Rachen (Angioödem), schwere Nierenfunktionsverschlechterung, sehr hoher Kaliumwert oder ausgeprägter Blutdruckabfall.',red:'Ramipril NICHT zusammen mit Sacubitril/Valsartan einnehmen. Zwischen den beiden Medikamenten müssen in beiden Richtungen mindestens 36 Stunden liegen. Bei früherem ACE-Hemmer-bedingtem Angioödem kontraindiziert.',caution:'Kaliumpräparate, kaliumhaltige Salzersatzmittel, Spironolacton und Cotrimoxazol können Kalium erhöhen. Ibuprofen, Diclofenac und Naproxen können die Nieren belasten und die Blutdruckwirkung mindern. Andere Blutdruckmittel und Flüssigkeitsmangel können starke Blutdruckabfälle begünstigen.',link:'https://www.patienteninfo-service.de/a-z-liste/r/ramipril-puren-5-mg-tabletten'},
    berodual:{title:'Berodual',class:'Bronchienerweiterer (Fenoterol + Ipratropium)',what:'Ein bronchienerweiterndes Arzneimittel mit einem Beta-2-Wirkstoff und einem Anticholinergikum.',for:'Zur Behandlung beziehungsweise Verhütung einer durch Bronchialverengung verursachten Atemnot – entsprechend dem ärztlichen Plan.',how:'Fenoterol entspannt die Atemwegsmuskulatur rasch; Ipratropium mindert eine nervlich vermittelte Verengung der Bronchien.',benefit:'Verkrampfte Bronchien können sich öffnen und das Atmen kann kurzfristig leichter werden.',effects:'Husten; gelegentlich Nervosität, Zittern, Herzklopfen, erhöhter Puls, Kopfschmerzen, Übelkeit, Schwindel und Mundtrockenheit.',serious:'Selten/ernst: Herzrhythmusstörungen, Kaliumabfall, Glaukom-Attacke bei Augenkontakt des Sprühnebels, Harnverhalt oder paradoxer Bronchospasmus.',red:'Bei Tachyarrhythmie oder hypertropher obstruktiver Kardiomyopathie sowie bei Allergie gegen die Wirkstoffe laut Fachinformation nicht anwenden.',caution:'Andere Beta-2-Wirkstoffe (z. B. Formoterol in Trimbow) können Herzrasen, Zittern und Kaliumabfall verstärken. Langfristige Kombination mit weiteren anticholinergen Mitteln ist ohne gezielte ärztliche Entscheidung nicht empfohlen. Ein ungewöhnlich häufiger Bedarf erfordert eine Kontrolle der Asthmatherapie.',link:'https://www.patienteninfo-service.de/a-z-liste/b/berodualR-n-dosier-aerosol-20-ug50-ug-druckgasinhalation-loesung'},
    azithromycin:{title:'Azithromycin',class:'Antibiotikum (Makrolid)',what:'Ein Antibiotikum zur Behandlung bestimmter bakterieller Infektionen.',for:'Nur bei dafür geeigneten bakteriellen Infektionen; nicht gegen Asthma selbst oder virale Erkältungen.',how:'Hemmung bakterieller Eiweißbildung am Ribosom.',benefit:'Bei empfindlichen Bakterien kann die Infektion abklingen.',effects:'Häufig Durchfall, Bauchschmerzen, Übelkeit oder Erbrechen; manchmal Kopfschmerzen.',serious:'Selten/ernst: Herzrhythmusstörungen durch QT-Verlängerung, schwere Hautreaktionen, Leberschäden und schwere antibiotikaassoziierte Durchfälle.',red:'Bei bekannten schweren Allergien gegen Makrolide nicht anwenden; bei bekannter schwerer QT-Problematik nur nach zwingender ärztlicher Abklärung.',caution:'Zusammen mit Citalopram ist wegen einer möglichen QT-Verlängerung besondere Vorsicht geboten. Nur wenn medizinisch abgeklärt: EKG, Kalium-/Magnesiumwerte und weitere Risikofaktoren beachten. Eine frühere Kur wird in dieser App NICHT als aktuelle Einnahme angenommen.',link:'https://ec.europa.eu/health/documents/community-register/2025/20250908166972/anx_166972_en.pdf'},
    doxycyclin:{title:'Doxycyclin',class:'Antibiotikum (Tetracyclin)',what:'Ein Antibiotikum zur Behandlung bestimmter bakterieller Infektionen.',for:'Nur bei ärztlich diagnostizierter beziehungsweise vermuteter geeigneter bakterieller Infektion.',how:'Hemmt die bakterielle Eiweißsynthese, sodass sich Bakterien schlechter vermehren.',benefit:'Eine empfindliche bakterielle Infektion kann abklingen.',effects:'Übelkeit, Durchfall, Bauchschmerzen, Sodbrennen/Entzündungen der Speiseröhre und erhöhte Sonnenempfindlichkeit.',serious:'Selten/ernst: allergische Reaktionen, schwere Hautreaktionen, schwerer Durchfall und erhöhtes Hirndruckrisiko.',red:'Bei bekannter Überempfindlichkeit gegen Tetracycline nicht anwenden. Kombination mit Isotretinoin soll wegen erhöhten Hirndruckrisikos vermieden werden.',caution:'Calcium-, Magnesium-, Eisenpräparate und Antazida können die Aufnahme vermindern: Einnahmeabstand nach Packungsbeilage beachten. Mit reichlich Wasser in aufrechter Haltung einnehmen und danach nicht sofort hinlegen. Frühere Kur ist nicht als derzeit aktiv markiert.',link:'https://www.patienteninfo-service.de/a-z-liste/d/doxycyclin-100-1a-pharma-tabletten'}
  };
  const order=['trimbow','nucala','citalopram','ramipril','berodual'];
  const historical=['azithromycin','doxycyclin'];
  const token=name=>{
    const t=String(name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(t.includes('trimbow'))return 'trimbow';
    if(t.includes('nucala')||t.includes('mepolizumab'))return 'nucala';
    if(t.includes('citalopram'))return 'citalopram';
    if(t.includes('ramipril'))return 'ramipril';
    if(t.includes('berodual'))return 'berodual';
    if(t.includes('azithromycin'))return 'azithromycin';
    if(t.includes('doxycyclin'))return 'doxycyclin';
    return null;
  };
  const style=document.createElement('style');
  style.textContent=`
#med-guide-282{margin:16px 0 24px;padding:18px;border:1px solid #d6e8ec;border-radius:18px;background:#f8fcfd;color:#173e53}
#med-guide-282 *{box-sizing:border-box}
#med-guide-282 h3{margin:0 0 8px;color:#103653;font-size:21px}
#med-guide-282 .mg282-sub{font-size:13px;color:#587484;line-height:1.55;margin:0 0 14px}
#med-guide-282 .mg282-warning{background:#fff3f2;border:1px solid #fecaca;border-left:5px solid #b91c1c;border-radius:10px;padding:11px 12px;margin:12px 0;color:#b91c1c!important;line-height:1.55;font-size:13px}
#med-guide-282 .mg282-red{color:#b91c1c!important;font-weight:750}
#med-guide-282 .mg282-caution{background:#fff8e9;border:1px solid #f6d8a0;border-radius:9px;padding:10px 12px;color:#754506;font-size:13px;line-height:1.55;margin:9px 0}
#med-guide-282 .mg282-card{border:1px solid #dce9ed;border-radius:12px;background:white;margin:8px 0;overflow:hidden}
#med-guide-282 .mg282-card>summary{cursor:pointer;padding:13px 14px;font-weight:800;line-height:1.5;list-style-position:inside;color:#173f52}
#med-guide-282 .mg282-card>summary small{display:block;font-weight:500;font-size:12px;color:#617986;padding-left:21px;margin-top:2px}
#med-guide-282 .mg282-detail{padding:4px 15px 16px;border-top:1px solid #edf3f5}
#med-guide-282 .mg282-detail p{font-size:13px;line-height:1.6;margin:10px 0;color:#304e5f}
#med-guide-282 .mg282-detail p strong{color:#113951}
#med-guide-282 .mg282-link{font-size:12px;color:#036e89;text-decoration:underline;overflow-wrap:anywhere}
#med-guide-282 .mg282-section{margin:21px 0 7px;font-size:15px;color:#153e55}
#med-guide-282 .mg282-note{font-size:12px;color:#597586;line-height:1.6}
#med-guide-282 .mg282-status{display:inline-block;padding:1px 7px;border-radius:20px;background:#e4f2f5;font-size:11px;font-weight:650;color:#255c6d;margin-left:6px}
#med-guide-282 .mg282-muted{color:#516e80;font-size:13px}
#med-guide-282 .mg282-unlisted{padding:10px 12px;background:#f0f5f7;border-radius:9px;font-size:13px}
@media(max-width:560px){#med-guide-282{padding:12px;margin:12px 0 18px}#med-guide-282 h3{font-size:19px}#med-guide-282 .mg282-card>summary{padding:11px}}
@media print{#med-guide-282{display:none!important}}
`;
  document.head.append(style);
  const root=document.createElement('section');root.id='med-guide-282';root.setAttribute('aria-labelledby','mg282-title');
  root.innerHTML='<h3 id="mg282-title">Medikamente verständlich erklärt</h3><p class="mg282-sub">Wofür, wie es wirkt, was sich verbessern kann, mögliche Nebenwirkungen und besonders wichtige Wechselwirkungen. <strong>Rot = Gegenanzeige oder dringende Sicherheitswarnung.</strong> Gelb = ärztlich zu überprüfende Kombination. Die Liste ersetzt keine individuelle Prüfung.</p><div id="mg282-current" aria-live="polite"></div><h4 class="mg282-section">Mögliche Nebenwirkungen durch Kombinationen</h4><div id="mg282-combined"></div><details id="mg282-previous"><summary>Frühere Antibiotikakuren: Azithromycin und Doxycyclin (nicht als aktuell angenommen)</summary><div id="mg282-historical"></div></details><p class="mg282-warning"><strong>Notfall:</strong> Bei starker Atemnot, Brustschmerzen, Ohnmacht oder Schwellung von Zunge und Rachen 112 rufen. Ein neues Mittel nur nach Prüfung des vollständigen Medikamentenplans durch Arzt oder Apotheke einnehmen.</p><p class="mg282-note">Informationsstand: Oktober 2026. Angaben und Arzneistärken im eigenen Plan mit der Packung abgleichen. Einzelne Beipackzettel können je nach Hersteller und Stärke abweichen. Es gibt keinen automatischen Vollständigkeits-Check sämtlicher möglicher Arzneimittel.</p>';
  target.insertAdjacentElement('afterend',root);
  const box=id=>document.getElementById(id);
  const make=(tag,txt,cls)=>{const e=document.createElement(tag);e.textContent=txt;if(cls)e.className=cls;return e};
  const detail=(parent,label,value,cls)=>{const p=document.createElement('p');p.append(make('strong',label+' '),document.createTextNode(value));if(cls)p.className=cls;parent.append(p)};
  function card(key,status){
    const d=reference[key],el=document.createElement('details');el.className='mg282-card';
    const summary=document.createElement('summary');summary.textContent=d.title;
    const small=make('small',d.class+(status?' · '+status:''));summary.append(small);el.append(summary);
    const body=document.createElement('div');body.className='mg282-detail';
    detail(body,'Was ist das?',d.what);
    detail(body,'Wofür?',d.for);
    detail(body,'Wie wirkt es?',d.how);
    detail(body,'Was kann sich verbessern?',d.benefit);
    detail(body,'Mögliche Nebenwirkungen:',d.effects);
    detail(body,'Seltene oder schwere Nebenwirkungen:',d.serious);
    const no=make('p','NICHT ANWENDEN / GEGENANZEIGE: '+d.red,'mg282-red');body.append(no);
    const caution=make('p','WECHSELWIRKUNGEN / VORSICHT: '+d.caution,'mg282-caution');body.append(caution);
    const link=document.createElement('a');link.href=d.link;link.target='_blank';link.rel='noopener noreferrer';link.className='mg282-link';link.textContent='Quelle / Packungs- oder Fachinformation öffnen ↗';body.append(link);
    el.append(body);return el;
  }
  const combinedEl=box('mg282-combined');
  let meds=[];
  function refresh(){
    const keys=new Set(meds.map(m=>token(m.name)).filter(Boolean));
    const current=box('mg282-current');current.replaceChildren();
    if(!meds.length){current.append(make('p','In deinem lokal gespeicherten Medikamentenplan sind noch keine Arzneimittel eingetragen. Die fünf früher genannten Präparate werden unten nur als Informationen angezeigt – nicht als aktuelle Einnahme.','mg282-muted'));}
    const added=new Set();
    for(const m of meds){const k=token(m.name);if(k&&!added.has(k)){current.append(card(k,'im Plan gespeichert'));added.add(k)}}
    const unknown=meds.filter(m=>!token(m.name));
    for(const m of unknown){current.append(make('p','Zu „'+String(m.name||'Unbenannt')+'“ ist hier keine geprüfte Arzneiinformation hinterlegt. Bitte den genauen Wirkstoff in Apotheke oder Praxis abgleichen.','mg282-unlisted'))}
    const missing=order.filter(k=>!keys.has(k));
    if(missing.length){const ex=document.createElement('details');ex.className='mg282-card';ex.innerHTML='<summary>Früher genannte Dauermedikamente (aktuellen Plan bitte bestätigen)<small>Nicht automatisch als Einnahme übernommen</small></summary>';
      const inner=document.createElement('div');inner.className='mg282-detail';for(const k of missing)inner.append(card(k,'früher angegeben'));ex.append(inner);current.append(ex);}
    combinedEl.replaceChildren();
    const add=(text,red=false)=>combinedEl.append(make('p',text,red?'mg282-warning':'mg282-caution'));
    if(keys.has('trimbow')&&keys.has('berodual'))add('Trimbow + Berodual: doppelte bronchienerweiternde Wirkprinzipien. Zittern, Herzrasen, Blutdruckschwankungen und Kaliumabfall sind möglich. Die ärztlich verordnete Bedarfstherapie nicht eigenmächtig verändern.');
    if(keys.has('citalopram')&&(keys.has('trimbow')||keys.has('berodual')))add('Citalopram zusammen mit Beta-2-Bronchienerweiterern: Herzrhythmus-Risiko insbesondere bei niedrigem Kalium oder weiteren QT-verlängernden Mitteln. Ärztlich EKG und Elektrolyte prüfen lassen, wenn Risikofaktoren oder Beschwerden vorliegen.');
    if(keys.has('citalopram')&&keys.has('azithromycin'))add('Citalopram + Azithromycin: erhöhtes Risiko für QT-Verlängerung und gefährliche Herzrhythmusstörungen. Vor gemeinsamer Einnahme ärztlich prüfen lassen.',true);
    if(keys.has('ramipril')&&(keys.has('trimbow')||keys.has('berodual')))add('Ramipril kann Kalium erhöhen; Beta-2-Sprays können Kalium senken. Die Effekte heben sich nicht zuverlässig auf: Kalium und Nierenwerte bei Bedarf kontrollieren lassen.');
    if(keys.has('citalopram')&&keys.has('ramipril'))add('Citalopram und Ramipril: Schwindel oder Kreislaufbeschwerden können sich bemerkbar machen; je nach Situation Blutdruck und Natrium prüfen lassen. Dies ist keine pauschal verbotene Kombination.');
    add('Schmerzmittel ohne Rezept: Ibuprofen, Naproxen oder Diclofenac können bei Ramipril die Nieren belasten und zusammen mit Citalopram das Blutungsrisiko erhöhen. Vor Einnahme in Apotheke oder Arztpraxis prüfen lassen.');
    add('Überlappende Beschwerden: Kopfschmerzen, Schwindel, Übelkeit und Müdigkeit können unter mehreren der genannten Medikamente auftreten. Aus Symptomen allein lässt sich die Ursache nicht bestimmen.');
    if(keys.has('nucala'))add('Nucala: spezifische Arzneimittelwechselwirkungen sind nach bisherigen Daten wenig wahrscheinlich; schwere allergische Reaktionen sind dennoch möglich.');
  }
  for(const k of historical)box('mg282-historical').append(card(k,'frühere Kur – nicht als aktuell bestätigt'));
  async function sync(){try{meds=(await S.list('suite')).filter(x=>x.type==='meds').map(x=>x.value||{});refresh();}catch(e){box('mg282-current').textContent='Medikamenteninformationen derzeit nicht zuordenbar: '+String(e?.message||e)}}
  window.addEventListener('asthma:meds-change',e=>{if(Array.isArray(e.detail?.meds)){meds=e.detail.meds;refresh()}else sync()});
  window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite')sync()});
  sync();
})();
