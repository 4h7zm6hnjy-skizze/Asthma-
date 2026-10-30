'use strict';
/* PneumoPro 3.5.5 – Allergieakte. Nur ärztliche Befunde erfassen, keine automatische Diagnose. */
(()=>{
  const SEC=window.ASTHMA_SECURITY;
  const $=id=>document.getElementById(id);
  if(!SEC||$('allergien'))return;
  const TYPES={
    pollen:['Gräserpollen','Roggen','Lieschgras','Wiesenrispengras','Beifuß','Ambrosia','Birke','Erle','Hasel','Esche','Eiche','Buche','Pappel','Weide','Ulme','Platane','Olive','Zypresse'],
    hausstaub:['Hausstaubmilbe D. pteronyssinus','Hausstaubmilbe D. farinae','Vorratsmilben','Hausstaub'],
    schimmel:['Alternaria','Cladosporium','Aspergillus fumigatus','Penicillium','Schimmelpilz (sonstiger)'],
    tiere:['Katze','Hund','Pferd','Kaninchen','Meerschweinchen','Hamster','Vögel/Federn','Tierfutter'],
    essen:['Erdnuss','Haselnuss','Walnuss','Cashew','Pistazie','Mandel','Sesam','Milch','Ei','Weizen','Roggen','Soja','Sellerie','Senf','Fisch','Krebstiere','Weichtiere','Lupine','Kiwi','Apfel','Pfirsich','Banane','Tomate','Karotte','Erdbeere','Andere Früchte/Gemüse','Lebensmittelzusatzstoff'],
    medikamente:['Penicillin/Amoxicillin','Cephalosporine','Andere Antibiotika','NSAR (Ibuprofen, ASS, Diclofenac)','Paracetamol','Kontrastmittel','Lokalanästhetikum','Narkosemittel','Biologikum','Impfstoff','Anderes Medikament'],
    kontakt:['Nickel','Chrom','Kobalt','Latex/Naturkautschuk','Duftstoffe','Konservierungsmittel','Kosmetika','Wasch-/Reinigungsmittel','Klebstoffe','Farbstoffe','Pflaster','Gummi'],
    insekten:['Biene','Wespe','Hornisse','Hummel','Andere Insekten'],
    beruf:['Mehlstaub','Holzstaub','Isocyanate','Epoxidharze','Acrylate','Kunststoffadditive','Metallstäube','Reinigungschemikalien','Desinfektionsmittel','Arbeitsplatzstoff (sonstig)'],
    andere:['Kälte','Wärme','Sonne/UV','Wasser','Belastung','Andere Substanz / Auslöser']
  };
  const LABELS={pollen:'Pollen, Bäume & Gräser',hausstaub:'Hausstaub & Milben',schimmel:'Schimmelpilze',tiere:'Tiere',essen:'Lebensmittel',medikamente:'Medikamente',kontakt:'Kontaktstoffe',insekten:'Insektengift',beruf:'Arbeitsplatzstoffe',andere:'Andere / nichtallergische Auslöser'};
  const METHODS=[
   ['prick','Pricktest (Haut)'],['prick-prick','Prick-to-Prick mit Originalsubstanz'],['intradermal','Intradermaltest'],['epikutan','Epikutantest / Patchtest (Spättyp)'],['ige','Bluttest: spezifisches IgE (sIgE)'],['komponente','Molekulare Komponentendiagnostik'],['gesamt-ige','Gesamt-IgE (keine Einzelallergie-Diagnose)'],['bat','Basophilen-Aktivierungstest (BAT)'],['tryptase','Tryptase (Mastzellmarker)'],['bronchial-allergen','Bronchiale Provokation mit Allergen'],['bronchial-unspez','Unspezifische bronchiale Provokation (z. B. Methacholin)'],['bronchial-kalt','Kaltluft-/Belastungsprovokation der Atemwege'],['nasal','Nasaler Provokationstest'],['konjunktival','Konjunktivaler Provokationstest'],['oral','Orale Nahrungsmittelprovokation'],['med-provokation','Ärztliche Medikamentenprovokation'],['auslass','Ärztlich begleitetes Auslass-/Wiedereinführungsschema'],['anamnese','Ärztliche Anamnese / dokumentierte Reaktion'],['sonstige','Anderes ärztliches Testverfahren']
  ];
  const nameMethod=x=>METHODS.find(y=>y[0]===x)?.[1]||x;
  const dateDE=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')?s.slice(8)+'.'+s.slice(5,7)+'.'+s.slice(0,4):'–';
  const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
  const uuid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2);
  const el=(tag,cl,txt)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(txt!==undefined)n.textContent=String(txt);return n;};
  const score=r=>{
    if(r.severity==='anaphylaxie'||r.confirmation==='bestaetigt')return {key:'rot',label:'ROT · ärztlich bestätigt oder schwere Reaktion berichtet',hint:r.confirmation==='bestaetigt'?'Die Allergie wurde laut Eintrag ärztlich bestätigt. Auslöser meiden wie ärztlich vereinbart.':'Eine Anaphylaxie wurde berichtet. Ärztlich abklären und Notfallplan überprüfen; dies ist keine automatische Allergiediagnose.'};
    if(r.confirmation==='ausgeschlossen')return {key:'grau',label:'GRAU · ärztlich ausgeschlossen',hint:'Die dokumentierte ärztliche Einschätzung hat Vorrang vor der vereinfachten Testampel.'};
    if(r.result==='positiv'||r.result==='grenzwertig'||r.result==='reaktion'||r.severity==='stark'||r.severity==='mittel'||r.confirmation==='verdacht')return {key:'gelb',label:'GELB · auffällig / ärztlich klären',hint:'Positive Haut- oder IgE-Tests zeigen zunächst eine Sensibilisierung. Nur zusammen mit Beschwerden und ärztlicher Bewertung kann eine Allergie beurteilt werden.'};
    if(r.result==='negativ'&&(!r.severity||r.severity==='keine')&&r.confirmation!=='verdacht')return {key:'gruen',label:'GRÜN · Test unauffällig',hint:'Ein negativer Einzeltest schließt eine Allergie nicht sicher aus. Symptome und Untersuchungsart beachten.'};
    return {key:'grau',label:'GRAU · keine sichere Einstufung',hint:'Nicht getestet, unklar oder Angaben unvollständig. Keine Aussage zur Allergie möglich.'};
  };
  window.PNEUMOPRO_ALLERGIEN355=Object.freeze({score,types:LABELS,methods:METHODS});
  const style=document.createElement('style');style.textContent=`
  #allergien .a355-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:12px}
  #allergien .a355-grid label{display:flex;flex-direction:column;gap:6px;font-weight:700}
  #allergien .a355-grid input,#allergien .a355-grid select,#allergien .a355-grid textarea{width:100%;min-width:0;padding:11px;border-radius:9px;border:1px solid #a8c2cd;background:#fff;color:#123b52;font:inherit}
  #allergien .a355-grid label.a355-wide{grid-column:1/-1}
  #allergien .a355-list{display:grid;gap:12px;margin-top:15px}
  #allergien .a355-item{padding:14px;border:1px solid #ccdce2;border-left:7px solid #8e9ca5;border-radius:11px;background:#fff;overflow-wrap:anywhere}
  #allergien .a355-item[data-band=rot]{border-left-color:#c62b38}
  #allergien .a355-item[data-band=gelb]{border-left-color:#c18a18}
  #allergien .a355-item[data-band=gruen]{border-left-color:#238153}
  #allergien .a355-band{display:inline-block;padding:6px 9px;border-radius:8px;font-weight:800;background:#edf1f5;color:#2d414c}
  #allergien .a355-band[data-band=rot]{background:#ffe7e9;color:#971726}
  #allergien .a355-band[data-band=gelb]{background:#fff1c9;color:#765113}
  #allergien .a355-band[data-band=gruen]{background:#e2f4e8;color:#175e38}
  #allergien .a355-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  #allergien .a355-note{font-size:.93rem;line-height:1.5;color:#355363}
  #allergien .a355-filter{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
  #allergien .a355-filter input,#allergien .a355-filter select{padding:9px;border-radius:8px;min-width:140px;max-width:100%;border:1px solid #acc6d1}
  #allergien .a355-header{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:10px}
  `;document.head.append(style);
  const section=el('section','panel suite-page');section.id='allergien';section.dataset.navPage='allergien';section.hidden=true;
  section.innerHTML=`<div class="section-heading"><div><p class="section-kicker">Allergologie · Befundakte</p><h2>Allergien & Allergietests</h2><p>Auslöser und Befunde mit Testart, Ergebnis und ärztlicher Einschätzung erfassen. Alle Angaben verbleiben im verschlüsselten lokalen PneumoPro-Tresor.</p></div></div>
  <div class="suite-subpanel"><h3>Allergie-Ampel</h3><p class="a355-note"><strong>Rot:</strong> laut Eintrag ärztlich bestätigte Allergie oder berichtete Anaphylaxie. <strong>Gelb:</strong> auffälliger Test, Verdacht oder Beschwerden. <strong>Grün:</strong> dieser Test ist unauffällig. <strong>Grau:</strong> unklar, nicht getestet oder ärztlich ausgeschlossen. Keine Farbe ist eine medizinische Diagnose oder Entwarnung.</p><p class="a355-note">Ein positiver Pricktest oder spezifisches IgE allein beweist keine klinische Allergie. Gesamt-IgE und Methacholin testen nicht direkt einen bestimmten Allergieauslöser. Provokationstests niemals selbst durchführen oder Medikamente dafür eigenständig absetzen. Bei schwerer Atemnot oder Anaphylaxie sofort 112.</p></div>
  <div class="suite-subpanel"><h3 id="a355-form-title">Allergietest oder Reaktion eintragen</h3><form id="a355-form"><input type="hidden" name="id"/><div class="a355-grid">
  <label>Datum der Untersuchung<input type="date" name="date" required/></label>
  <label>Allergiegruppe<select name="type" id="a355-type" required></select></label>
  <label class="a355-wide">Auslöser / Allergen (auch frei eingeben)<input type="text" name="allergen" list="a355-suggestions" maxlength="130" required placeholder="z. B. Gräserpollen, Amoxicillin, Erdnuss"/><datalist id="a355-suggestions"></datalist></label>
  <label>Testart<select name="method" id="a355-method" required></select></label>
  <label>Ergebnis<select name="result"><option value="unbekannt">Nicht getestet / unbekannt</option><option value="ausstehend">Ergebnis ausstehend</option><option value="negativ">Negativ / unauffällig</option><option value="grenzwertig">Grenzwertig</option><option value="positiv">Positiv / auffällig</option><option value="reaktion">Reaktion beobachtet</option><option value="unklar">Nicht eindeutig</option></select></label>
  <label>Ärztliche Beurteilung<select name="confirmation"><option value="offen">Noch keine Beurteilung</option><option value="verdacht">Allergieverdacht</option><option value="bestaetigt">Allergie ärztlich bestätigt</option><option value="ausgeschlossen">Allergie ärztlich ausgeschlossen</option><option value="ungewiss">Unklar / weitere Tests nötig</option></select></label>
  <label>Beschwerden / Reaktion<select name="severity"><option value="keine">Keine Beschwerden angegeben</option><option value="leicht">Leichte Beschwerden</option><option value="mittel">Mittelstarke Beschwerden</option><option value="stark">Starke Beschwerden</option><option value="anaphylaxie">Anaphylaxie berichtet</option></select></label>
  <label>Laborwert / Messwert (optional)<input name="value" type="number" inputmode="decimal" min="0" step="any" placeholder="Zahl laut Originalbefund"/></label>
  <label>Einheit / Testklasse<input name="unit" maxlength="36" placeholder="kU/L, mm, Klasse 0–6 …"/></label>
  <label>FEV₁ vor Provokation (L; optional)<input name="fevBefore" type="number" inputmode="decimal" min="0" max="10" step="0.01"/></label>
  <label>FEV₁ nach Provokation (L; optional)<input name="fevAfter" type="number" inputmode="decimal" min="0" max="10" step="0.01"/></label>
  <label class="a355-wide">Arzt / Klinik / Labor<input name="provider" maxlength="160" placeholder="Behandelnde Praxis oder Klinik"/></label>
  <label class="a355-wide">Beobachtete Symptome / Zeitpunkt<textarea name="symptoms" maxlength="800" rows="2" placeholder="Wann und wie wurde reagiert?"></textarea></label>
  <label class="a355-wide">Ärztliche Empfehlungen / Notfallplan<textarea name="advice" maxlength="800" rows="2" placeholder="Nur bereits ärztlich festgelegte Maßnahmen dokumentieren"></textarea></label>
  <label class="a355-wide">Weitere Bemerkungen<textarea name="notes" maxlength="800" rows="2"></textarea></label>
  <label class="a355-wide">Originalbefund hinzufügen (Bild oder PDF, max. 8 MB)<input type="file" name="attachment" accept="image/*,application/pdf"/></label>
  <label class="a355-wide"><span><input type="checkbox" name="removeAttachment"/> Vorhandenen Anhang bei Bearbeitung entfernen</span></label>
  </div><div class="a355-actions"><button class="btn btn-primary" type="submit" id="a355-save">Befund verschlüsselt speichern</button><button class="btn btn-outline" type="button" id="a355-reset">Eingabe zurücksetzen</button></div><p role="status" aria-live="polite" id="a355-message"></p></form></div>
  <div class="suite-subpanel"><div class="a355-header"><h3>Gespeicherte Allergien & Tests</h3><button class="btn btn-outline" type="button" id="a355-reload">Neu bewerten</button></div><p class="a355-note" id="a355-summary">Noch keine Ergebnisse geladen.</p><div class="a355-filter"><input id="a355-search" type="search" placeholder="Allergen / Befund suchen" aria-label="Allergiebefunde suchen"/><select id="a355-filter" aria-label="Allergiegruppe filtern"><option value="">Alle Allergiegruppen</option></select></div><div id="a355-list" class="a355-list"></div></div>
  <div class="suite-subpanel a355-note"><h3>Testverfahren – kurz erklärt</h3><p><strong>Pricktest, Prick-to-Prick, spezifisches IgE und Komponententest:</strong> weisen eine Sensibilisierung nach, nicht zwingend eine klinische Allergie. <strong>Epikutantest:</strong> dient vor allem der verzögerten Kontaktallergie. <strong>Orale, nasale, konjunktivale, bronchiale und Medikamentenprovokation:</strong> werden ärztlich überwacht durchgeführt. <strong>Methacholin/Kaltluft:</strong> prüfen die Atemwegsreaktivität und stellen keinen spezifischen Allergienachweis dar. <strong>Tryptase/Gesamt-IgE:</strong> sind ergänzende Laborparameter und keine Einzelallergen-Tests.</p><p>Für Monats- und Jahresberichte: Bereich „Allergien – Untersuchungsergebnisse“ in der Statistik auswählen. Angaben sind nur die dokumentierten Befunde und die manuell gewählte ärztliche Beurteilung.</p></div>`;
  const anchor=$('labor');if(anchor)anchor.insertAdjacentElement('beforebegin',section);else document.querySelector('main')?.append(section);
  const form=$('a355-form'),msg=$('a355-message');
  const typeSelect=$('a355-type'),filter=$('a355-filter'),method=$('a355-method');
  for(const [key,label] of Object.entries(LABELS)){const option=new Option(label,key);typeSelect.add(option);filter.add(new Option(label,key));}
  for(const [key,label] of METHODS)method.add(new Option(label,key));
  function suggestions(){const dl=$('a355-suggestions');dl.replaceChildren();(TYPES[typeSelect.value]||[]).forEach(x=>dl.append(el('option','',undefined)));(TYPES[typeSelect.value]||[]).forEach((x,i)=>dl.children[i].value=x);}
  typeSelect.addEventListener('change',suggestions);
  function clear(){form.reset();form.elements.namedItem('id').value='';form.elements.namedItem('date').value=today();form.elements.namedItem('removeAttachment').checked=false;$('a355-form-title').textContent='Allergietest oder Reaktion eintragen';$('a355-save').textContent='Befund verschlüsselt speichern';msg.textContent='';suggestions();}
  const all=async()=>((await SEC.list('suite')).filter(x=>x.type==='allergies355').map(x=>x.value).filter(x=>x&&x.id));
  const field=n=>form.elements.namedItem(n);
  const nval=n=>field(n).value===''?null:Number(field(n).value);
  function makeButton(label,cb,cl){const b=el('button',cl||'btn btn-outline',label);b.type='button';b.addEventListener('click',cb);return b;}
  async function render(){
    const list=$('a355-list');list.replaceChildren();
    if(!SEC.state().unlocked){$('a355-summary').textContent='Zum Anzeigen den Tresor entsperren.';return;}
    let data=await all();const counts={rot:0,gelb:0,gruen:0,grau:0};data.forEach(r=>counts[score(r).key]++);
    $('a355-summary').textContent=data.length+' dokumentierte Tests/Reaktionen · Rot '+counts.rot+' · Gelb '+counts.gelb+' · Grün '+counts.gruen+' · Grau '+counts.grau+'. Jede Einstufung ist eine Orientierung.';
    const q=$('a355-search').value.trim().toLocaleLowerCase('de');const cat=filter.value;
    data=data.filter(r=>(!cat||r.type===cat)&&(!q||[r.allergen,r.provider,r.symptoms,r.notes,r.advice,nameMethod(r.method)].join(' ').toLocaleLowerCase('de').includes(q)))
     .sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.createdAt).localeCompare(String(a.createdAt)));
    if(!data.length){list.append(el('p','a355-note','Keine passenden Allergieeinträge vorhanden.'));return;}
    for(const r of data){
      const band=score(r),row=el('article','a355-item');row.dataset.band=band.key;
      row.append(el('h4','',r.allergen+' · '+dateDE(r.date)),el('p','a355-note',(LABELS[r.type]||r.type)+' · '+nameMethod(r.method)));
      const badge=el('span','a355-band',band.label);badge.dataset.band=band.key;row.append(badge,el('p','a355-note',band.hint));
      row.append(el('p','', 'Testergebnis: '+({negativ:'negativ',positiv:'positiv',grenzwertig:'grenzwertig',reaktion:'Reaktion beobachtet',ausstehend:'ausstehend',unklar:'unklar',unbekannt:'unbekannt'}[r.result]||r.result)+' · Ärztliche Einschätzung: '+({bestaetigt:'bestätigt',ausgeschlossen:'ausgeschlossen',verdacht:'Verdacht',ungewiss:'unklar',offen:'offen'}[r.confirmation]||r.confirmation)));
      if(r.value!==null)row.append(el('p','', 'Original-Messwert: '+r.value+' '+(r.unit||'(Einheit nicht angegeben)')));
      if(r.fevBefore>0&&r.fevAfter!==null){const delta=(r.fevAfter-r.fevBefore)/r.fevBefore*100;row.append(el('p','', 'FEV₁: '+r.fevBefore+' L → '+r.fevAfter+' L ('+(delta>0?'+':'')+delta.toFixed(1)+' % Veränderung); ausschließlich Dokumentation.'));}
      if(r.provider)row.append(el('p','', 'Praxis / Klinik: '+r.provider));
      if(r.symptoms)row.append(el('p','', 'Beschwerden: '+r.symptoms));
      if(r.advice)row.append(el('p','', 'Ärztlicher Plan: '+r.advice));
      if(r.notes)row.append(el('p','', 'Notizen: '+r.notes));
      const acts=el('div','a355-actions');
      if(r.scanDocumentId){const linked=await SEC.get('documents',r.scanDocumentId);if(linked?.kind==='Allergiebefund'&&linked.blob instanceof Blob)acts.append(makeButton('Verknuepften Scan oeffnen',()=>{const url=URL.createObjectURL(linked.blob);const a=document.createElement('a');a.href=url;a.download=linked.name||'Allergiebefund';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}));}
      if(r.attachment instanceof Blob){acts.append(makeButton('Originalbefund öffnen',()=>{const url=URL.createObjectURL(r.attachment);const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.download=r.attachmentName||'Allergiebefund';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}));}
      acts.append(makeButton('Bearbeiten',()=>{
        for(const name of ['id','date','scanDocumentId','type','allergen','method','result','confirmation','severity','value','unit','fevBefore','fevAfter','provider','symptoms','advice','notes']){if(field(name))field(name).value=r[name]??'';}
        suggestions();$('a355-form-title').textContent='Befund bearbeiten';$('a355-save').textContent='Änderung verschlüsselt speichern';form.scrollIntoView({block:'start',behavior:'smooth'});
      }));
      acts.append(makeButton('Löschen',async()=>{if(!confirm('Diesen Allergiebefund endgültig aus der lokalen Akte entfernen?'))return;try{await SEC.del('suite','allergies355/'+r.id);await render();}catch(e){msg.textContent='Löschen fehlgeschlagen: '+e.message;}}));
      row.append(acts);list.append(row);
    }
  }
  form.addEventListener('submit',async e=>{e.preventDefault();
    const button=$('a355-save');button.disabled=true;
    try{
      if(!SEC.state().unlocked)throw Error('Die Gesundheitsakte ist gesperrt.');
      const date=field('date').value,allergen=field('allergen').value.trim(),attachmentFile=field('attachment').files?.[0];
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!allergen)throw Error('Datum und Auslöser sind erforderlich.');
      if(attachmentFile&&(attachmentFile.size>8*1024*1024||!(['application/pdf'].includes(attachmentFile.type)||attachmentFile.type.startsWith('image/'))))throw Error('Nur Bilder oder PDF bis 8 MB sind zulässig.');
      if((nval('fevBefore')!==null||nval('fevAfter')!==null)&&!(nval('fevBefore')>0&&nval('fevAfter')>=0))throw Error('Für den FEV₁-Vergleich beide Literwerte eingeben; Vorwert muss über 0 liegen.');
      const oldId=field('id').value,previous=oldId?(await all()).find(x=>x.id===oldId):null,id=oldId||uuid();
      const record={id,date,scanDocumentId:field('scanDocumentId')?.value||'',createdAt:previous?.createdAt||new Date().toISOString(),type:field('type').value,allergen:allergen.slice(0,130),method:field('method').value,result:field('result').value,confirmation:field('confirmation').value,severity:field('severity').value,value:nval('value'),unit:field('unit').value.trim().slice(0,36),fevBefore:nval('fevBefore'),fevAfter:nval('fevAfter'),provider:field('provider').value.trim().slice(0,160),symptoms:field('symptoms').value.trim().slice(0,800),advice:field('advice').value.trim().slice(0,800),notes:field('notes').value.trim().slice(0,800),attachment:field('removeAttachment').checked?null:previous?.attachment||null,attachmentName:field('removeAttachment').checked?'':previous?.attachmentName||''};
      if(attachmentFile){record.attachment=attachmentFile;record.attachmentName=attachmentFile.name.slice(0,140);}
      if(record.scanDocumentId){const linked=await SEC.get('documents',record.scanDocumentId);if(linked?.kind!=='Allergiebefund')throw Error('Ausgewaehlter Scan ist nicht mehr vorhanden. Bitte anderen Scan waehlen.')}
      await SEC.put('suite',{key:'allergies355/'+id,type:'allergies355',value:record},'allergies355/'+id);
      clear();msg.textContent='Allergiebefund verschlüsselt gespeichert.';await render();
    }catch(error){msg.textContent='Speichern fehlgeschlagen: '+(error.message||error);}
    finally{button.disabled=false;}
  });
  $('a355-reset').addEventListener('click',clear);$('a355-reload').addEventListener('click',()=>render().catch(e=>msg.textContent=e.message));
  $('a355-search').addEventListener('input',()=>render().catch(()=>{}));filter.addEventListener('change',()=>render().catch(()=>{}));
  window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite'&&SEC.state().unlocked)render().catch(()=>{});});
  clear();render().catch(e=>msg.textContent='Laden fehlgeschlagen: '+e.message);
})();
