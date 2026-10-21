'use strict';
/* Asthma 2.8.1: iPhone quality-of-life UI; reads/writes existing encrypted groups only. */
(()=>{
 const SEC=window.ASTHMA_SECURITY;
 const releaseVersion=()=>window.ASTHMA_APP_VERSION||document.getElementById('footer-version')?.textContent?.trim()||'2.9.4';
 const $=id=>document.getElementById(id);
 const root=$('uebersicht'),nav=window.ASTHMA_NAV;
 if(!SEC||!SEC.state?.().unlocked||!root||!nav||$('a28-daily'))return;
 const date=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const dayStart=d=>{const n=new Date();n.setHours(12,0,0,0);n.setDate(n.getDate()-d+1);return date(n)};
 const toNumber=v=>v!==null&&v!==''&&v!==undefined&&Number.isFinite(Number(v))?Number(v):null;
 const getDate=x=>String(x?.date||x?.value?.date||'').slice(0,10);
 const strong=(id,value)=>{const el=$(id);if(el)el.textContent=value};
 const summary=document.createElement('section');summary.className='a28-card';summary.id='a28-daily';
 summary.setAttribute('aria-labelledby','a28-title');
 summary.innerHTML=`
 <div class="a28-header"><div><p class="section-kicker">Tagesübersicht · Lokal gespeichert</p><h2 id="a28-title">Heute im Blick</h2><p>Einfach dokumentieren, ohne medizinische Beurteilung.</p></div><span class="a28-version">v${releaseVersion()}</span></div>
 <div class="a28-kpis" aria-label="Deine dokumentierten Werte">
  <div><span>Letzter PEF</span><strong id="a28-last-pef">–</strong><small id="a28-pef-date">Noch keine Messung</small></div>
  <button type="button" class="a28-kpi-action" id="a28-open-rescue" aria-controls="a28-entry-details" aria-expanded="false"><span>Bedarfsanwendungen · 7 Tage</span><strong id="a28-rescue">–</strong><small>Antippen und Anwendungen eintragen ↗</small></button>
  <button type="button" class="a28-kpi-action" id="a28-open-nights" aria-controls="a28-entry-details" aria-expanded="false"><span>Nächte mit Beschwerden · 30 Tage</span><strong id="a28-nights">–</strong><small>Antippen und Beschwerden eintragen ↗</small></button>
 </div>
 <details class="a28-form-details" id="a28-entry-details"><summary>Beschwerden heute schnell eintragen</summary>
 <form id="a28-form">
 <div class="a28-grid">
  <label>Beschwerden<select name="symptoms"><option value="0">Keine</option><option value="1">Leicht</option><option value="2">Mittel</option><option value="3">Stark</option></select></label>
  <label>Bedarfsanwendungen (optional)<input name="rescue" type="number" inputmode="numeric" step="1" min="0" max="99" placeholder="Anzahl"></label>
  <label class="a28-check"><input name="night" type="checkbox"> Nachts durch Beschwerden aufgewacht</label>
  <label class="a28-wide">Auslöser / Notiz (optional)<textarea name="notes" maxlength="500" rows="2" placeholder="z. B. Wärme, Staub, Bewegung"></textarea></label>
 </div><button type="submit" class="btn btn-primary" id="a28-save">In meinem Tagebuch speichern</button><p class="a28-feedback" role="status" id="a28-status" aria-live="polite"></p>
 </form><p class="input-note">Einträge werden mit dem heutigen Datum und der aktuellen Uhrzeit im bestehenden verschlüsselten Tagebuch gespeichert. Jeder Klick erzeugt einen neuen Eintrag.</p>
 </details>
 <div class="a28-actions"><button class="btn btn-outline" data-goto="peakflow" type="button">Peak-Flow erfassen</button><button class="btn btn-outline" data-goto="therapie" type="button">Medikamente</button><button class="btn btn-outline" data-goto="akte" type="button">Tagebuch & Akte</button></div>
 </section>`;
 const inside=root.querySelector('.d26-dashboard')||root;
 const personal=$('a27-personal-summary');
 if(personal&&personal.parentNode===inside)personal.after(summary);else inside.prepend(summary);
 const form=$('a28-form'),save=$('a28-save'),msg=$('a28-status');
 const field=k=>form.elements.namedItem(k);
 // 2.9.5: the two summary tiles used to be passive DIVs.
 // Both now open the existing encrypted quick-entry form. No second data store.
 const details=$('a28-entry-details');
 const actionButtons=[$('a28-open-rescue'),$('a28-open-nights')];
 const syncExpanded=()=>actionButtons.forEach(b=>b?.setAttribute('aria-expanded',String(details.open)));
 details.addEventListener('toggle',syncExpanded);
 function openDailyField(name){
   details.open=true;syncExpanded();
   const input=field(name);
   requestAnimationFrame(()=>{
     if(!input)return;
     try{input.focus({preventScroll:true})}catch{input.focus()}
     input.scrollIntoView({block:'center',behavior:'smooth'});
   });
 }
 $('a28-open-rescue').addEventListener('click',()=>openDailyField('rescue'));
 $('a28-open-nights').addEventListener('click',()=>openDailyField('night'));
 form.addEventListener('submit',async event=>{
   event.preventDefault();if(save.disabled)return;
   const symptoms=Number(field('symptoms').value);
   const value=String(field('rescue').value||'').trim(),rescue=value===''?null:Number(value);
   if(!Number.isInteger(symptoms)||symptoms<0||symptoms>3|| (rescue!==null&&(!Number.isInteger(rescue)||rescue<0||rescue>99))){msg.textContent='Bitte Beschwerden und Bedarfsanwendungen prüfen.';return}
   const now=new Date(),id=crypto.randomUUID?crypto.randomUUID():String(now.getTime())+'-'+Math.random().toString(36).slice(2);
   const row={id,createdAt:now.toISOString(),date:date(now),time:`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`,peak:null,symptoms,rescue,night:field('night').checked,notes:field('notes').value.trim()};
   save.disabled=true;msg.textContent='Speichere verschlüsselt …';
   try{await SEC.put('diary',row);form.reset();msg.textContent='Tagebucheintrag verschlüsselt gespeichert.';refresh();}
   catch(err){msg.textContent='Speichern fehlgeschlagen: '+(err?.message||'Unbekannter Fehler')}
   finally{save.disabled=false}
 });
 // Longer-term factual trends, kept separate by instrument/source.
 const trends=document.createElement('section');trends.className='a28-card';trends.id='a28-trends';
 trends.innerHTML='<div class="a28-header"><div><p class="section-kicker">Dokumentierte Entwicklung</p><h2>Verlauf vergleichen</h2><p>Heim-PEF und ärztliche Lungenfunktion bleiben getrennt.</p></div></div><label class="a28-period">Zeitraum <select id="a28-period"><option value="7">7 Tage</option><option value="30" selected>30 Tage</option><option value="90">90 Tage</option><option value="365">365 Tage</option></select></label><div class="a28-kpis"><div><span>PEF-Mittelwert im Tagebuch</span><strong id="a28-average">–</strong><small>L/min · nur eingetragene Werte</small></div><div><span>Dokumentierte Tage</span><strong id="a28-days">–</strong><small>Tagebucheinträge im Zeitraum</small></div><div><span>Ärztliche Untersuchungen</span><strong id="a28-tests">–</strong><small>Gespeicherte Spirometrie-Befunde</small></div></div><p class="input-note">Diese Übersicht beschreibt gespeicherte Messungen, nicht die Asthmakontrolle oder eine ärztliche Diagnose. Messbedingungen können sich unterscheiden.</p>';
 inside.append(trends);
 $('a28-period').addEventListener('change',refresh);
 let run=0;
 async function refresh(){
   const seq=++run;
   const r=await Promise.allSettled(['diary','epef','suite'].map(g=>SEC.list(g)));
   if(seq!==run)return;
   const rows=r.map(x=>x.status==='fulfilled'&&Array.isArray(x.value)?x.value:null);
   const [diary,epef,suite]=rows;
   const cut=dayStart(Number($('a28-period')?.value)||30),today=date();
   const diaryMonth=diary?.filter(x=>getDate(x)>=cut&&getDate(x)<=today)||[];
   const pefRecords=[...(diary||[]).filter(x=>toNumber(x.peak)!==null).map(x=>({date:getDate(x),value:toNumber(x.peak)})),...(epef||[]).filter(x=>x.kind==='measurement'&&toNumber(x.pef)!==null).map(x=>({date:getDate(x),value:toNumber(x.pef)}))];
   const last=pefRecords.filter(x=>x.date<=today&&x.date.match(/^\d{4}-\d{2}-\d{2}$/)).sort((a,b)=>b.date.localeCompare(a.date))[0];
   strong('a28-last-pef',last?String(Math.round(last.value))+' l/min':'–');
   strong('a28-pef-date',last?last.date.split('-').reverse().join('.'):'Noch keine Messung');
   const seven=(diary||[]).filter(x=>getDate(x)>=dayStart(7)&&getDate(x)<=today);
   const entered=seven.map(x=>toNumber(x.rescue)).filter(x=>x!==null);
   strong('a28-rescue',diary&&entered.length?String(entered.reduce((sum,v)=>sum+v,0)):'–');
   const nights=(diary||[]).filter(x=>getDate(x)>=dayStart(30)&&getDate(x)<=today&&x.night===true);
   strong('a28-nights',diary?String(new Set(nights.map(x=>x.date)).size):'–');
   const peaks=diaryMonth.map(x=>toNumber(x.peak)).filter(x=>x!==null);
   strong('a28-average',diary&&peaks.length?String(Math.round(peaks.reduce((sum,v)=>sum+v,0)/peaks.length)):'–');
   strong('a28-days',diary?String(new Set(diaryMonth.map(x=>x.date)).size):'–');
   strong('a28-tests',suite?String(suite.filter(x=>x.type==='measurements'&&getDate(x)>=cut&&getDate(x)<=today).length):'–');
 }
 window.addEventListener('asthma:secure-change',e=>{if(['diary','epef','suite'].includes(e.detail?.group))refresh()});
 window.addEventListener('asthma:lung-imported',refresh);
 refresh();

 // Read-only backup validation never replaces records and never records passwords.
 const exportForm=$('secure-export-form');
 if(exportForm){
  const backup=document.createElement('section');backup.id='a28-backup';backup.className='a28-backup';
  backup.innerHTML='<h3>Vollständiges Backup prüfen – ohne Wiederherstellung</h3><p>Kontrolliere eine gespeicherte <code>.asthma17</code>-Datei mit ihrem Passwort. Dabei werden keine vorhandenen Daten überschrieben.</p><form id="a28-backup-form"><label>Gespeicherte .asthma17-Sicherung<input type="file" id="a28-backup-file" accept=".asthma17,.json" required></label><label>Passwort der Sicherungsdatei<input type="password" id="a28-backup-pass" autocomplete="off" required></label><button class="btn btn-outline" id="a28-backup-run" type="submit">Sicherung auf Lesbarkeit prüfen</button><p class="a28-feedback" role="status" aria-live="polite" id="a28-backup-status"></p></form><p class="input-note">Eine erfolgreiche Prüfung beweist, dass die Sicherung hier entschlüsselt werden kann. Sie ersetzt keinen vollständigen Wiederherstellungstest und bestätigt nicht, dass Safari die Datei dauerhaft gespeichert hat.</p>';
  exportForm.insertAdjacentElement('afterend',backup);
  backup.querySelector('form').addEventListener('submit',async e=>{
   e.preventDefault();const input=$('a28-backup-file'),pass=$('a28-backup-pass'),button=$('a28-backup-run'),state=$('a28-backup-status');
   if(!input.files?.length)return;
   if(input.files[0].size>80*1024*1024){state.textContent='Datei zu groß (maximal 80 MB).';return;}
   button.disabled=true;state.textContent='Prüfe verschlüsselte Sicherung …';
   try{const contents=JSON.parse(await input.files[0].text());const result=await SEC.verifyVaultBackup(contents,pass.value);state.textContent=`Sicherung lesbar: ${result.count} verschlüsselte Datensätze; ${result.groups} Gruppen. Datei zusätzlich sicher in „Dateien“ aufbewahren.`;}
   catch(err){state.textContent='Prüfung fehlgeschlagen: '+(err?.message||'Datei nicht lesbar');}
   finally{pass.value='';button.disabled=false;}
  });
 }
 // In-memory document search; private names never leave the current browser.
 const docs=$('document-list');
 if(docs){const search=document.createElement('label');search.className='a28-doc-search';search.textContent='Dokumente durchsuchen';
 const box=document.createElement('input');box.type='search';box.id='a28-doc-search';box.placeholder='Dateiname, Art oder Datum';box.autocomplete='off';
 search.append(box);docs.parentNode.insertBefore(search,docs);}
 // Non-destructive local environment diagnostics; do not upload telemetry.
 const settings=$('app-settings');
 if(settings){const diagnostics=document.createElement('section');diagnostics.className='a28-card';diagnostics.id='a28-diagnostics';
 diagnostics.innerHTML='<div class="a28-header"><div><h3>iPhone- und Offline-Prüfung</h3><p>Prüfung dieser Browser-Installation; keine Datenübertragung.</p></div></div><button type="button" class="btn btn-outline" id="a28-diagnose">Jetzt prüfen</button><p role="status" aria-live="polite" id="a28-diagnostics-status">Noch nicht geprüft.</p>';
 settings.append(diagnostics);
 $('a28-diagnose').addEventListener('click',async()=>{
  const result=['App-Code: '+releaseVersion(),'Tresor: '+(SEC.state().unlocked?'entsperrt':'gesperrt'),'Internet: '+(navigator.onLine?'verbunden':'offline')];
  if('serviceWorker' in navigator){try{const reg=await navigator.serviceWorker.getRegistration();result.push('Offline-Service-Worker: '+(reg?.active?'aktiv':'nicht aktiv'));}catch{result.push('Offline-Service-Worker: unbekannt')}}else result.push('Offline-Service-Worker: nicht unterstützt');
  if(navigator.storage?.estimate){try{const est=await navigator.storage.estimate();if(Number.isFinite(est.usage)&&Number.isFinite(est.quota))result.push('Geschätzter Browser-Speicher: '+(est.usage/1048576).toFixed(1)+' / '+(est.quota/1048576).toFixed(1)+' MB');}catch{}}
  $('a28-diagnostics-status').textContent=result.join(' · ');
 });}
 // Uniform return to home: no hidden double-layer navigation.
 document.querySelectorAll('[data-nav-page]').forEach(section=>{
   if(!section.id||['uebersicht','start'].includes(section.id)||section.querySelector(':scope > .a28-back-home'))return;
   const button=document.createElement('button');button.type='button';button.className='a28-back-home btn btn-outline';button.dataset.goto='start';button.textContent='← Zur Übersicht';
   section.prepend(button);
 });
})();
