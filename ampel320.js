'use strict';
/* Asthma Tages-Ampel v3.2.0 – encrypted local journal, not a medical triage system. */
(() => {
  const SEC = window.ASTHMA_SECURITY;
  const $ = id => document.getElementById(id);
  const home = $('uebersicht'), stats = $('statistik');
  if (!SEC || !home || !stats || $('as-ampel')) return;

  const LEVELS = [
    {n:5, title:'Mir geht es super', short:'Super', color:'#188556', bg:'#e4f6e9'},
    {n:4, title:'Es geht gut', short:'Gut', color:'#7f9c36', bg:'#f1f6dd'},
    {n:3, title:'Es geht so', short:'Geht so', color:'#d09223', bg:'#fff1c9'},
    {n:2, title:'Nicht gut bis schlecht', short:'Nicht gut', color:'#d56c2c', bg:'#fce8d9'},
    {n:1, title:'Schlecht bis kritisch', short:'Kritisch', color:'#c2373d', bg:'#fde6e7'}
  ];
  const PRESETS = [
    ['rested','Gut geschlafen'], ['easy','Atmung heute ruhig'],
    ['mildBreath','Leichte Atemnot'], ['severeBreath','Starke Atemnot'],
    ['cough','Husten'], ['tight','Engegefühl in der Brust'],
    ['wheeze','Pfeifende Atmung'], ['mucus','Verschleimung'],
    ['night','Nachts wegen Asthma wach geworden'], ['rescue','Bedarfsspray benutzt'],
    ['rescueHelp','Nach dem Spray besser'], ['stairs','Treppen waren anstrengend'],
    ['work','Bei der Arbeit eingeschränkt'], ['activity','Belastung schwierig'],
    ['outdoors','Draußen schlechtere Luft'], ['improved','Im Tagesverlauf besser geworden']
  ];
  const SYMPTOMS = [
    ['dyspnea','Atemnot'], ['cough','Husten'], ['chest','Brustenge'],
    ['wheeze','Pfeifende Atmung'], ['sleep','Schlechter Schlaf'],
    ['work','Arbeit eingeschränkt'], ['stairs','Treppen anstrengend']
  ];
  const BY_LEVEL = Object.fromEntries(LEVELS.map(x => [x.n,x]));
  const elt = (tag, cls, text) => {
    const v=document.createElement(tag);if(cls)v.className=cls;
    if(text!==undefined)v.textContent=String(text);return v;
  };
  const iso = (d=new Date()) => [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  const hhmm = (d=new Date()) => String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  const validDate = s => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s||'')) return false;
    const d=new Date(s+'T12:00:00Z');return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10)===s;
  };
  const germanDate = s => validDate(s) ? s.slice(8)+'.'+s.slice(5,7)+'.'+s.slice(0,4) : '–';
  const addDays = (s,k) => {const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+k);return d.toISOString().slice(0,10)};
  const makeId = () => crypto.randomUUID?.() || Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
  const mainID = () => 'main-'+iso();
  const lung = color => '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path fill="'+color+'" d="M30 6h4v23c1 3 4 5 6 5l4-15c2-7 7-8 11-2 8 12 10 25 6 37-4 10-15 9-22 4-5-4-7-11-7-19V29h-1v10c0 8-2 15-7 19-7 5-18 6-22-4-4-12-2-25 6-37 4-6 9-5 11 2l4 15c2 0 5-2 6-5V6z"/><path d="M30 36 18 45m12 0-8 9m12-18 12 9m-12 0 8 9" fill="none" stroke="#fff" opacity=".6" stroke-width="2"/></svg>';

  // Mount at the very beginning of the authenticated dashboard.
  const pane=elt('section','as-ampel');pane.id='as-ampel';
  pane.innerHTML = [
    '<div class="as-head"><div><p class="section-kicker">Dein täglicher Asthma-Verlauf</p><h2>Asthma-Ampel heute</h2><p>Wie geht es dir gerade? Eine Lunge antippen speichert sofort.</p></div><span class="as-private">Lokal verschlüsselt</span></div>',
    '<div id="as-buttons" class="as-levels" role="group" aria-label="Heutiges Befinden"></div>',
    '<p id="as-today" class="as-today" role="status" aria-live="polite">Heute noch kein Status eingetragen.</p>',
    '<h3>Notizen auswählen</h3><p class="as-hint">Du kannst mehrere Antworten anklicken.</p>',
    '<div id="as-noteopts" class="as-options"></div>',
    '<label class="as-own-label"><input type="checkbox" id="as-own-check"> Eigene Notiz hinzufügen</label>',
    '<div id="as-ownbox" hidden><label for="as-own">Selbst eintragen</label><textarea id="as-own" maxlength="1000" rows="3" placeholder="Meine Notiz ..."></textarea></div>',
    '<details class="as-more"><summary>Weitere Angaben (freiwillig)</summary><p>Welche Symptome hattest du?</p><div id="as-symptoms" class="as-options"></div><label class="as-spray">Bedarfsspray heute wie oft? <input type="number" inputmode="numeric" min="0" max="99" id="as-spray" placeholder="Anzahl"></label></details>',
    '<div class="as-actions"><button type="button" id="as-notes-save" class="btn btn-primary">Notizen speichern</button><button type="button" id="as-extra" class="btn btn-outline">Weitere Messung heute</button><button type="button" id="as-to-stat" class="btn btn-outline">Statistik ansehen</button></div>',
    '<div id="as-edit" class="as-edit" hidden><span id="as-editlabel"></span><button type="button" class="btn btn-outline" id="as-exit">Bearbeitung beenden</button></div>',
    '<p id="as-message" role="status" aria-live="polite"></p>',
    '<p class="as-disclaimer">Deine persönliche Einschätzung, keine medizinische Notfall-Ampel. Bei schwerer Luftnot oder Sprechproblemen sofort Hilfe holen, im Notfall 112.</p>'
  ].join('');
  home.insertBefore(pane, home.querySelector('.home20-quick') || home.firstChild);

  // Keep the Ampel directly below the profile, even when the later-loading
  // daily overview and assessment cards insert themselves after that profile.
  // Observe structural changes only; moving the same node preserves its state
  // and listeners. The position check prevents a MutationObserver feedback loop.
  const placeBelowPatientProfile = () => {
    const patientProfile = document.getElementById('a27-personal-summary');
    if (!patientProfile || !patientProfile.isConnected || !home.contains(patientProfile)) return false;
    if (pane.parentNode !== patientProfile.parentNode || pane.previousElementSibling !== patientProfile) {
      patientProfile.insertAdjacentElement('afterend', pane);
    }
    return true;
  };
  // A one-shot observer was insufficient: quality28.js loads AFTER this module
  // and places "Heute im Blick" immediately after the same profile element.
  // Keep watching until the page is unloaded so a later layout rebuild cannot
  // displace the Ampel again.
  const profileOrderObserver = new MutationObserver(() => { placeBelowPatientProfile(); });
  profileOrderObserver.observe(home, {childList: true, subtree: true});
  placeBelowPatientProfile();

  const st=elt('section','suite-subpanel as-stat');st.id='as-stat';
  st.innerHTML = [
    '<h3>Asthma-Ampel – dein Verlauf</h3><p>Bei mehreren Einträgen zählt für den Tagesdurchschnitt der letzte Status. Einzelne Messungen bleiben erhalten.</p>',
    '<div class="as-filters"><label>Zeitraum<select id="as-period"><option value="day">Tag</option><option value="week">Woche</option><option value="month" selected>Monat</option><option value="year">Jahr</option><option value="decade">10 Jahre</option></select></label><label>Bezugsdatum<input id="as-date" type="date"></label><button id="as-prev" type="button" class="btn btn-outline">Zurück</button><button id="as-next" type="button" class="btn btn-outline">Weiter</button></div>',
    '<h4 id="as-period-title"></h4><div class="as-kpis" id="as-kpis"></div>',
    '<div class="as-visuals"><section class="as-panel"><h4>Verlauf – 1 bis 5</h4><div id="as-trend"></div></section><section class="as-panel"><h4>Verteilung nach Tagen</h4><div id="as-dist"></div></section></div>',
    '<div id="as-calendar"></div><h4>Einträge im Zeitraum</h4><div id="as-entries"></div>',
    '<button id="as-print" type="button" class="btn btn-outline">Ampel-Statistik drucken / PDF</button>',
    '<p class="input-note">Fehlende Tage werden nicht geschätzt. Die Bewertung ist subjektiv und ersetzt keine Lungenfunktionsuntersuchung. Ein gedruckter Bericht ist unverschlüsselt.</p>'
  ].join('');
  stats.querySelector('.section-heading')?.insertAdjacentElement('afterend',st);
  $('as-date').value=iso();

  const noteBoxes=new Map(),symptomBoxes=new Map(),lungButtons=new Map();
  function checkboxes(place,options,map){for(const [key,label] of options){
    const chip=elt('label','as-chip'),input=elt('input'),name=elt('span','',label);
    input.type='checkbox';input.value=key;input.setAttribute('aria-label',label);
    chip.append(input,name);place.append(chip);map.set(key,input);
  }}
  checkboxes($('as-noteopts'),PRESETS,noteBoxes);checkboxes($('as-symptoms'),SYMPTOMS,symptomBoxes);
  for(const level of LEVELS){const b=elt('button','as-choice');b.type='button';
    b.setAttribute('aria-label',level.title+' – sofort speichern');b.setAttribute('aria-pressed','false');
    b.style.setProperty('--choice-color',level.color);b.style.setProperty('--choice-bg',level.bg);
    b.innerHTML=lung(level.color);b.append(elt('strong','',level.short));
    b.addEventListener('click',()=>saveLevel(level.n));$('as-buttons').append(b);lungButtons.set(level.n,b);
  }
  $('as-own-check').addEventListener('change',()=>{$('as-ownbox').hidden=!$('as-own-check').checked});
  let records=[],editing=null,extra=false,busy=false;
  const inform=(text,error=false)=>{$('as-message').textContent=text;$('as-message').classList.toggle('error',error)};
  const checked=map=>[...map].filter(([,b])=>b.checked).map(([id])=>id);
  const current=()=>records.find(r=>r.id===mainID());
  function fill(r){
    noteBoxes.forEach(b=>b.checked=false);symptomBoxes.forEach(b=>b.checked=false);
    (r?.notes||[]).forEach(id=>{if(noteBoxes.has(id))noteBoxes.get(id).checked=true});
    (r?.symptoms||[]).forEach(id=>{if(symptomBoxes.has(id))symptomBoxes.get(id).checked=true});
    $('as-own-check').checked=Boolean(r?.custom);$('as-ownbox').hidden=!Boolean(r?.custom);
    $('as-own').value=r?.custom||'';$('as-spray').value=r?.sprayCount??'';
    lungButtons.forEach((b,n)=>{b.classList.toggle('active',n===r?.level);b.setAttribute('aria-pressed',String(n===r?.level))});
  }
  function details(){const text=$('as-spray').value.trim();
    if(text!==''&&(!/^\d{1,2}$/.test(text)||Number(text)>99))throw Error('Bedarfsspray: 0 bis 99 eingeben.');
    return {notes:checked(noteBoxes),symptoms:checked(symptomBoxes),
      custom:$('as-own-check').checked?$('as-own').value.trim().slice(0,1000):'',
      sprayCount:text===''?null:Number(text)};
  }
  async function refresh(){
    const items=await SEC.list('ampel');
    records=items.filter(r=>r&&r.type==='self-rating'&&validDate(r.date)&&Number.isInteger(r.level)&&r.level>=1&&r.level<=5);
    records.sort((a,b)=>(b.date+'T'+(b.time||'')).localeCompare(a.date+'T'+(a.time||'')));
    const main=current();
    const latest=records.filter(r=>r.date===iso()).sort((a,b)=>(String(b.time||'')+String(b.updatedAt||'')).localeCompare(String(a.time||'')+String(a.updatedAt||'')))[0];
    $('as-today').textContent=latest?'Heute: '+BY_LEVEL[latest.level].title+' · '+(latest.time||'–')+' Uhr':'Heute noch kein Status gespeichert.';
    if(!editing&&!extra)fill(main||null);
    statsRefresh();
  }
  async function saveLevel(level){
    if(busy)return;busy=true;
    try{const now=new Date(),old=editing||(extra?null:current());
      const value={id:old?.id||(extra?'extra-'+makeId():mainID()),type:'self-rating',
        mode:old?.mode||(extra?'extra':'main'),date:old?.date||iso(now),
        time:editing?(old.time||hhmm(now)):hhmm(now),level,...details(),
        createdAt:old?.createdAt||now.toISOString(),updatedAt:now.toISOString()};
      await SEC.put('ampel',value);inform('Gespeichert: '+BY_LEVEL[level].title+'.');
      if(extra){extra=false;$('as-extra').textContent='Weitere Messung heute'}
      if(editing)editing=value;
      await refresh();if(editing)fill(editing);
    }catch(err){inform('Speichern fehlgeschlagen: '+err.message,true)}finally{busy=false}
  }
  async function saveNotes(){
    if(busy)return;busy=true;
    try{if(extra)throw Error('Für die Zusatzmessung zuerst eine Lunge antippen.');
    const old=editing||current();if(!old)throw Error('Zuerst eine Lunge antippen.');
      const value={...old,...details(),updatedAt:new Date().toISOString()};
      await SEC.put('ampel',value);if(editing)editing=value;
      inform('Notizen gespeichert.');await refresh();if(editing)fill(editing);
    }catch(err){inform(err.message,true)}finally{busy=false}
  }
  $('as-notes-save').addEventListener('click',saveNotes);
  $('as-extra').addEventListener('click',()=>{
    editing=null;extra=!extra;fill(extra?null:current());$('as-edit').hidden=true;
    $('as-extra').textContent=extra?'Zusatzmessung abbrechen':'Weitere Messung heute';
    inform(extra?'Jetzt eine Lunge antippen, um die Zusatzmessung zu speichern.':'Zusatzmessung abgebrochen.');
  });
  $('as-exit').addEventListener('click',()=>{editing=null;extra=false;$('as-edit').hidden=true;fill(current());inform('Bearbeitung beendet.')});
  $('as-to-stat').addEventListener('click',()=>{if(window.ASTHMA_NAV?.go)window.ASTHMA_NAV.go('statistik');else location.hash='#statistik'});
  function editRecord(r){editing=r;extra=false;fill(r);$('as-edit').hidden=false;
    $('as-editlabel').textContent='Du bearbeitest '+germanDate(r.date)+' um '+(r.time||'–')+' Uhr';
    inform('Status mit einer Lunge, Notizen mit „Notizen speichern“ ändern.');
    pane.scrollIntoView({behavior:'smooth',block:'start'});
  }
  async function deleteRecord(r){
    if(!confirm('Diesen Asthma-Ampel-Eintrag vom '+germanDate(r.date)+' löschen?'))return;
    try{await SEC.del('ampel',r.id);if(editing?.id===r.id){editing=null;$('as-edit').hidden=true}
      inform('Eintrag gelöscht.');await refresh();}catch(err){inform(err.message,true)}
  }

  function range(){const date=validDate($('as-date').value)?$('as-date').value:iso(),year=Number(date.slice(0,4)),mode=$('as-period').value;
    if(mode==='day')return {from:date,to:date,title:'Tag: '+germanDate(date),mode};
    if(mode==='week'){const n=(new Date(date+'T12:00:00Z').getUTCDay()+6)%7,from=addDays(date,-n);
      return {from,to:addDays(from,6),title:'Woche: '+germanDate(from)+' bis '+germanDate(addDays(from,6)),mode}};
    if(mode==='month'){const first=date.slice(0,7)+'-01',lastDay=new Date(Date.UTC(year,Number(date.slice(5,7)),0)).getUTCDate();
      return {from:first,to:addDays(first,lastDay-1),title:'Monat: '+date.slice(5,7)+'.'+year,mode}};
    if(mode==='year')return {from:year+'-01-01',to:year+'-12-31',title:'Jahr: '+year,mode};
    return {from:(year-9)+'-01-01',to:year+'-12-31',title:'10 Jahre: '+(year-9)+' bis '+year,mode:'decade'};
  }
  const average=items=>items.length?items.reduce((a,x)=>a+x.level,0)/items.length:null;
  function daily(items){const map=new Map();
    [...items].sort((a,b)=>(a.date+'T'+(a.time||'')+' '+(a.updatedAt||'')).localeCompare(b.date+'T'+(b.time||'')+' '+(b.updatedAt||'')))
      .forEach(r=>map.set(r.date,r));
    return [...map.values()].sort((a,b)=>a.date.localeCompare(b.date));
  }
  function trendBuckets(period,raw,days){
    if(period.mode==='day')return [...raw].sort((a,b)=>(a.time||'').localeCompare(b.time||'')).map(r=>({label:r.time||'–',value:r.level}));
    if(period.mode==='week'||period.mode==='month'){
      const byDate=new Map(days.map(x=>[x.date,x.level]));const arr=[];
      for(let d=period.from;d<=period.to;d=addDays(d,1))arr.push({label:germanDate(d),value:byDate.get(d)??null});
      return arr;
    }
    if(period.mode==='year')return Array.from({length:12},(_,i)=>{
      const mo=period.from.slice(0,4)+'-'+String(i+1).padStart(2,'0');
      return {label:String(i+1)+'.',value:average(days.filter(x=>x.date.startsWith(mo)))};
    });
    const first=Number(period.from.slice(0,4));
    return Array.from({length:10},(_,i)=>({label:String(first+i),value:average(days.filter(x=>x.date.startsWith(String(first+i))))}));
  }
  const ns='http://www.w3.org/2000/svg';
  function drawTrend(buckets){
    const target=$('as-trend');target.replaceChildren();
    if(!buckets.some(x=>x.value!==null)){target.append(elt('p','as-empty','In diesem Zeitraum gibt es noch keine Einträge.'));return}
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 670 238');
    svg.setAttribute('role','img');svg.setAttribute('aria-label','Zeitlicher Verlauf des Tagesbefindens von 1 bis 5');
    const item=(tag,attr,parent=svg)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attr))e.setAttribute(k,String(v));parent.append(e);return e};
    const x=i=>buckets.length===1?345:55+i*590/(buckets.length-1),y=v=>197-(v-1)*39;
    for(let v=1;v<=5;v++){
      item('line',{x1:50,x2:645,y1:y(v),y2:y(v),stroke:'#d6e4ed','stroke-dasharray':'3 5'});
      item('text',{x:38,y:y(v)+4,'text-anchor':'end','font-size':14,fill:'#526778'}).textContent=String(v);
    }
    let last=null;
    buckets.forEach((p,i)=>{
      if(p.value===null){last=null;return}
      if(last)item('line',{x1:x(last.i),y1:y(last.v),x2:x(i),y2:y(p.value),stroke:'#367d93','stroke-width':3});
      const col=BY_LEVEL[Math.max(1,Math.min(5,Math.round(p.value)))].color;
      const circle=item('circle',{cx:x(i),cy:y(p.value),r:buckets.length>32?4:5.5,fill:col,stroke:'white','stroke-width':1});
      item('title',{},circle).textContent=p.label+' – '+p.value.toFixed(1)+'/5';last={i,v:p.value};
    });
    for(const i of new Set([0,Math.floor((buckets.length-1)/2),buckets.length-1])){
      item('text',{x:x(i),y:229,'text-anchor':'middle','font-size':13,fill:'#526778'}).textContent=buckets[i].label;
    }
    target.append(svg);
  }
  function distribution(days){const target=$('as-dist');target.replaceChildren();
    if(!days.length){target.append(elt('p','as-empty','Keine dokumentierten Tage.'));return}
    for(const l of LEVELS){const count=days.filter(r=>r.level===l.n).length;
      const group=elt('div','as-bar'),hd=elt('div','as-barhead'),track=elt('div','as-track'),bar=elt('div','as-fill');
      hd.append(elt('span','',l.short),elt('strong','',count+' Tage'));bar.style.background=l.color;
      bar.style.width=(count/days.length*100)+'%';track.append(bar);group.append(hd,track);target.append(group);
    }
  }
  function monthCalendar(p,days){const target=$('as-calendar');target.replaceChildren();if(p.mode!=='month')return;
    target.append(elt('h4','','Monatskalender – Tag antippen für Details'));
    const grid=elt('div','as-calendar-grid'),mapped=new Map(days.map(x=>[x.date,x]));
    ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(s=>grid.append(elt('span','as-weekday',s)));
    const offset=(new Date(p.from+'T12:00:00Z').getUTCDay()+6)%7;
    for(let i=0;i<offset;i++)grid.append(elt('span','as-calendar-empty',''));
    for(let d=p.from;d<=p.to;d=addDays(d,1)){
      const r=mapped.get(d),b=elt('button','as-calendar-day',d.slice(8));b.type='button';
      if(r){b.style.background=BY_LEVEL[r.level].bg;b.style.setProperty('--day-color',BY_LEVEL[r.level].color)}
      if(d===iso())b.classList.add('today');
      b.setAttribute('aria-label',germanDate(d)+(r?' – '+BY_LEVEL[r.level].title:' – ohne Eintrag'));
      b.addEventListener('click',()=>{$('as-period').value='day';$('as-date').value=d;statsRefresh()});grid.append(b);
    }
    target.append(grid);
  }
  function history(items){const target=$('as-entries');target.replaceChildren();
    if(!items.length){target.append(elt('p','as-empty','Noch keine Einträge in diesem Zeitraum.'));return}
    const ordered=[...items].sort((a,b)=>(b.date+'T'+(b.time||'')).localeCompare(a.date+'T'+(a.time||'')));
    for(const r of ordered){const l=BY_LEVEL[r.level],card=elt('article','as-entry');card.style.setProperty('--entry-color',l.color);
      const hd=elt('div','as-entry-header'),badge=elt('span','as-pill',l.title);badge.style.background=l.bg;badge.style.color=l.color;
      hd.append(elt('strong','',germanDate(r.date)+' · '+(r.time||'–')+' Uhr'),badge);card.append(hd);
      const selected=PRESETS.filter(([k])=>(r.notes||[]).includes(k)).map(x=>x[1]);
      if(selected.length)card.append(elt('p','',selected.join(' · ')));
      if(r.custom)card.append(elt('p','',r.custom));
      const checkedSymptoms=SYMPTOMS.filter(([k])=>(r.symptoms||[]).includes(k)).map(x=>x[1]);
      if(checkedSymptoms.length)card.append(elt('p','','Symptome: '+checkedSymptoms.join(', ')));
      if(r.sprayCount!==null&&r.sprayCount!==undefined)card.append(elt('p','','Bedarfsspray: '+r.sprayCount+' ×'));
      if(r.mode==='extra')card.append(elt('small','as-secondary','Zusätzliche Messung'));
      const controls=elt('div','as-entry-actions'),editBtn=elt('button','btn btn-outline','Bearbeiten'),deleteBtn=elt('button','btn btn-text','Löschen');
      editBtn.type='button';deleteBtn.type='button';editBtn.addEventListener('click',()=>editRecord(r));deleteBtn.addEventListener('click',()=>deleteRecord(r));
      controls.append(editBtn,deleteBtn);card.append(controls);target.append(card);
    }
  }
  function statsRefresh(){const p=range(),selected=records.filter(r=>r.date>=p.from&&r.date<=p.to),days=daily(selected);
    $('as-period-title').textContent=p.title;
    const kpi=$('as-kpis');kpi.replaceChildren();const mean=average(days);
    const values=[['Dokumentierte Tage',days.length],['Einträge',selected.length],
      ['Ø Tagesstatus',mean===null?'–':mean.toFixed(1).replace('.',',')+' / 5'],
      ['Schlechte oder kritische Tage',days.filter(r=>r.level<=2).length]];
    for(const [title,value] of values){const box=elt('div','as-kpi');box.append(elt('span','',title),elt('strong','',value));kpi.append(box)}
    drawTrend(trendBuckets(p,selected,days));distribution(days);monthCalendar(p,days);history(selected);
  }
  function periodMove(direction){
    const v=$('as-period').value,d=new Date(($('as-date').value||iso())+'T12:00:00Z');
    if(v==='day')d.setUTCDate(d.getUTCDate()+direction);
    else if(v==='week')d.setUTCDate(d.getUTCDate()+direction*7);
    else if(v==='month')d.setUTCMonth(d.getUTCMonth()+direction,1);
    else if(v==='year')d.setUTCFullYear(d.getUTCFullYear()+direction);
    else d.setUTCFullYear(d.getUTCFullYear()+direction*10);
    $('as-date').value=d.toISOString().slice(0,10);statsRefresh();
  }
  $('as-prev').addEventListener('click',()=>periodMove(-1));$('as-next').addEventListener('click',()=>periodMove(1));
  $('as-period').addEventListener('change',statsRefresh);$('as-date').addEventListener('change',statsRefresh);
  // Native iPhone-PWAs may ignore window.print(). Build a real, fully offline PDF
  // and offer iOS file sharing / saving / printing. Never send patient data away.
  const PDF=(()=>{
 const PAGE_W=595.28,PAGE_H=841.89,MARGIN=43,LEFT=MARGIN,RIGHT=PAGE_W-MARGIN,TOP=PAGE_H-55,BOTTOM=53,WIDTH=RIGHT-LEFT;
 function sanitize(s){return String(s||'').replace(/\s+/g,' ').trim().replace(/₁/g,'1').replace(/₂/g,'2').replace(/₃/g,'3').replace(/₄/g,'4').replace(/⁻/g,'-').replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/→/g,'->').replace(/↗/g,'->').replace(/↔/g,'<->').replace(/∅/g,'Durchschnitt').replace(/⌀/g,'Durchschnitt');}
 const cp1252={'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159};
 function pdfLiteral(text){let r='';for(const ch of sanitize(text)){const v=cp1252[ch]||ch.codePointAt(0);if(v===40||v===41||v===92)r+='\\'+String.fromCharCode(v);else if(v<32&&v!==9)r+=' ';else if(v>126&&v<256)r+='\\'+v.toString(8).padStart(3,'0');else if(v>=32&&v<127)r+=ch;else r+='?';}return '('+r+')';}
 const measure=document.createElement('canvas').getContext('2d');
 function wrap(text,size,maxWidth,bold=false){const words=sanitize(text).split(/\s+/).filter(Boolean);const out=[];let line='';measure.font=`${bold?'700 ':'400 '}${size}px Arial`;
   for(let word of words){const split=[];if(measure.measureText(word).width>maxWidth){let sub='';for(const ch of word){if(sub&&measure.measureText(sub+ch).width>maxWidth){split.push(sub);sub=ch;}else sub+=ch;}if(sub)split.push(sub);}else split.push(word);
     for(const part of split){const next=line?line+' '+part:part;if(line&&measure.measureText(next).width>maxWidth){out.push(line);line=part;}else line=next;}
   }if(line)out.push(line);return out.length?out:[''];}
 const pdfNumber=x=>Number(x.toFixed(2)).toString();
 function canvasJpeg(svg){const vb=(svg.getAttribute('viewBox')||'0 0 690 235').split(/\s+/).map(Number);const w=vb[2]||690,h=vb[3]||235;const canvas=document.createElement('canvas');canvas.width=Math.min(1400,Math.round(w*1.6));canvas.height=Math.round(canvas.width*h/w);const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas-Grafik ist auf diesem Gerät nicht verfügbar.');
   ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.scale(canvas.width/w,canvas.height/h);
   for(const el of svg.children){const tag=el.tagName.toLowerCase(),get=(name,defaultValue=0)=>Number(el.getAttribute(name)||defaultValue),paint=el.getAttribute('stroke')||'#367a91';
     if(tag==='line'){ctx.beginPath();ctx.moveTo(get('x1'),get('y1'));ctx.lineTo(get('x2'),get('y2'));ctx.strokeStyle=paint;ctx.lineWidth=get('stroke-width',1);ctx.setLineDash((el.getAttribute('stroke-dasharray')||'').split(/[ ,]+/).filter(Boolean).map(Number));ctx.stroke();ctx.setLineDash([]);}
     else if(tag==='polyline'){const points=(el.getAttribute('points')||'').trim().split(/\s+/).map(p=>p.split(',').map(Number)).filter(a=>a.length===2&&a.every(Number.isFinite));if(points.length){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=paint;ctx.lineWidth=get('stroke-width',2);ctx.stroke();}}
     else if(tag==='circle'){ctx.beginPath();ctx.arc(get('cx'),get('cy'),get('r',2),0,Math.PI*2);ctx.fillStyle=el.getAttribute('fill')||'#247e76';ctx.fill();}
     else if(tag==='text'){ctx.fillStyle=el.getAttribute('fill')||'#526779';ctx.font=`${get('font-size',11)}px Arial`;ctx.textAlign=({end:'right',middle:'center'}[el.getAttribute('text-anchor')]||'left');ctx.fillText(Array.from(el.childNodes).filter(n=>n.nodeType===3).map(n=>n.nodeValue).join(''),get('x'),get('y'));}
   }
   const data=canvas.toDataURL('image/jpeg',0.89).split(',')[1];const raw=atob(data),buf=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)buf[i]=raw.charCodeAt(i);return {data:buf,width:canvas.width,height:canvas.height};
 }
 class Layout{
   constructor(){this.pages=[];this.page();}
   page(){this.current={ops:[],images:[]};this.pages.push(this.current);this.y=TOP;this.line([LEFT,BOTTOM-18,WIDTH,0],0.5,'#d6e3e7');this.textRaw('Asthma · privater Gesundheitsbericht',LEFT,BOTTOM-29,8,'#5f7d88');}
   reserve(n){if(this.y-n<BOTTOM+14)this.page();}
   textRaw(text,x,y,size=11,color='#203949',bold=false){const hex=color.replace('#','');const rgb=[0,2,4].map(n=>parseInt(hex.slice(n,n+2),16)/255).map(pdfNumber).join(' ');this.current.ops.push(`BT ${rgb} rg /${bold?'F2':'F1'} ${pdfNumber(size)} Tf 1 0 0 1 ${pdfNumber(x)} ${pdfNumber(y)} Tm ${pdfLiteral(text)} Tj ET`);}
   para(text,size=10,gap=5,color='#203949',bold=false,indent=0){const lines=wrap(text,size,WIDTH-indent-3,bold),step=size*1.4;for(const l of lines){this.reserve(step);this.textRaw(l,LEFT+indent,this.y,size,color,bold);this.y-=step;}this.y-=gap;}
   heading(text,level=2){const size=level===1?18:level===2?14:12;this.reserve(size*2.8);this.para(text,size,7,level===1?'#14536b':'#164b61',true);this.y-=3;}
   line(arr,width=1,color='#d9e6e8'){const rgb=[0,2,4].map(n=>parseInt(color.slice(n+1,n+3),16)/255).map(pdfNumber).join(' ');this.current.ops.push(`${rgb} RG ${pdfNumber(width)} w ${arr.map(pdfNumber).join(' ')} re S`);}
   rule(){this.reserve(10);this.line([LEFT,this.y-1,WIDTH,0],.7,'#b9d6da');this.y-=12;}
   row(name,value){const first=wrap(name,10,WIDTH*.57),second=wrap(value,10,WIDTH*.38,true),count=Math.max(first.length,second.length);this.reserve(count*14+8);first.forEach((line,i)=>this.textRaw(line,LEFT,this.y-i*14,10,'#385f71'));second.forEach((line,i)=>this.textRaw(line,LEFT+WIDTH*.61,this.y-i*14,10,'#183e52',true));this.y-=count*14+7;this.rule();}
   kpiGrid(cells){const width=(WIDTH-20)/3,height=71;for(let i=0;i<cells.length;i++){if(i%3===0){this.reserve(height+8);}const x=LEFT+(i%3)*(width+10);const y=this.y;this.current.ops.push('0.88 0.93 0.94 RG 0.65 w '+[x,y-height+12,width,height-8].map(pdfNumber).join(' ')+' re S');const title=wrap(cells[i].title,9,width-14).slice(0,2),value=wrap(cells[i].value,17,width-12,true);title.forEach((t,j)=>this.textRaw(t,x+8,y-8-j*11,9,'#4c6c7d'));this.textRaw(value[0]||'-',x+8,y-42,17,'#123e52',true);if(i%3===2||i===cells.length-1)this.y-=height+8;}this.y-=6;}
   image(svg){const img=canvasJpeg(svg);const targetW=WIDTH-8,targetH=targetW*img.height/img.width;this.reserve(targetH+12);const idx=this.current.images.length+1;this.current.images.push({name:'Im'+idx,...img});this.current.ops.push(`q ${pdfNumber(targetW)} 0 0 ${pdfNumber(targetH)} ${pdfNumber(LEFT+4)} ${pdfNumber(this.y-targetH+4)} cm /Im${idx} Do Q`);this.y-=targetH+13;}
   table(table){const heads=[...table.querySelectorAll('thead th')].map(x=>sanitize(x.textContent)),rows=[...table.querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>sanitize(td.textContent)));if(!heads.length)return;
     const colWidth=WIDTH/heads.length;const render=(cells,heading=false)=>{const font=heading?9:8,lines=cells.map(t=>wrap(t,font,colWidth-8,heading)),count=Math.max(1,...lines.map(x=>x.length)),height=count*11+6;this.reserve(height+8);if(heading){this.current.ops.push('0.91 0.96 0.97 rg '+[LEFT,this.y-height+7,WIDTH,height].map(pdfNumber).join(' ')+' re f');}for(let i=0;i<cells.length;i++){lines[i].forEach((s,j)=>this.textRaw(s,LEFT+5+i*colWidth,this.y-j*11,font,heading?'#174c61':'#233f50',heading));}this.y-=height;this.line([LEFT,this.y+3,WIDTH,0],0.4,'#e0e9eb');};
     render(heads,true);for(const cells of rows){if(this.y< BOTTOM+55){this.page();render(heads,true);}render(cells,false);}this.y-=12;
   }
   old(node){if(node.classList?.contains('stats25-tiles')){const cells=[...node.querySelectorAll('.stats25-kpi')].map(c=>({title:c.querySelector('.stats25-label')?.textContent||'',value:c.querySelector('.stats25-figure')?.textContent||''}));this.kpiGrid(cells);return;}
     if(node.classList?.contains('stats25-line')){this.row(node.querySelector('span')?.textContent||'',node.querySelector('strong')?.textContent||'');return;}
     if(node.classList?.contains('stats25-kpi'))return;
     const tag=node.tagName?.toLowerCase();if(tag==='h1'||tag==='h2'||tag==='h3'||tag==='h4'){this.heading(node.textContent,tag==='h2'?1:tag==='h3'?2:3);return;}
     if(tag==='img'){return;}
     if(tag==='table'){this.table(node);return;}
     if(tag==='p'||tag==='small'||tag==='footer'){this.para(node.textContent,tag==='footer'?8:10,8,tag==='footer'?'#536a73':'#293f4a');return;}
     if(tag==='li'){this.para('• '+node.textContent,9,5);return;}
     const kids=[...node.children];if(kids.length){for(const child of kids)this.old(child);}else if(node.textContent?.trim())this.para(node.textContent,10,8);
   }
   category(node){this.page();const h=node.querySelector(':scope > h3');this.heading(h?.textContent||'Messwerte',1);for(const child of node.children){if(child===h)continue;if(child.classList.contains('s292-summary')){for(const item of child.children)this.para(item.textContent,9,5,'#2a5a6b',true);this.y-=4;}
       else if(child.classList.contains('s292-chart-box')){const svg=child.querySelector('svg');if(svg)this.image(svg);const legends=[...child.querySelectorAll('.s292-legend span>span')].map(e=>e.textContent);if(legends.length)this.para(legends.join(' · '),8,8,'#526b75');for(const x of child.querySelectorAll('.s292-summary>span'))this.para(x.textContent,8.2,4,'#285568',true);const explanation=child.querySelector('p.s292-note');if(explanation)this.para(explanation.textContent,8,9,'#526b75');}
       else if(child.classList.contains('s292-table-wrap')){const tab=child.querySelector('table');if(tab)this.table(tab);}
       else if(child.tagName==='H4'){this.heading(child.textContent,3);}else if(child.matches('p'))this.para(child.textContent,9,8,'#556d76');
     }}
 }
 function createPDF(layout){const objects=[null],add=v=>{objects.push(v);return objects.length-1;},font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'),pages=add(''),kids=[];
   for(const [index,page] of layout.pages.entries()){const xrefs=[];for(const img of page.images){const no=add({dictionary:`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.data.length} >>`,stream:img.data});xrefs.push(`/${img.name} ${no} 0 R`);}
     const ops=page.ops.concat([`BT 0.35 0.47 0.52 rg /F1 8 Tf 1 0 0 1 ${pdfNumber(RIGHT-58)} ${pdfNumber(BOTTOM-29)} Tm ${pdfLiteral(`${index+1} / ${layout.pages.length}`)} Tj ET`]).join('\n');const stream=new TextEncoder().encode(ops+'\n');const content=add({dictionary:`<< /Length ${stream.length} >>`,stream});const pageObj=add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${font} 0 R /F2 ${bold} 0 R >> /XObject << ${xrefs.join(' ')} >> >> /Contents ${content} 0 R >>`);kids.push(pageObj);}
   objects[pages]=`<< /Type /Pages /Count ${kids.length} /Kids [${kids.map(x=>`${x} 0 R`).join(' ')}] >>`;const catalog=add(`<< /Type /Catalog /Pages ${pages} 0 R >>`);
   const parts=[],offsets=[0];let total=0;const write=chunk=>{const a=typeof chunk==='string'?new TextEncoder().encode(chunk):chunk;parts.push(a);total+=a.length;};write('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
   for(let i=1;i<objects.length;i++){offsets.push(total);write(i+' 0 obj\n');const obj=objects[i];if(typeof obj==='string')write(obj+'\n');else{write(obj.dictionary+'\nstream\n');write(obj.stream);write('\nendstream\n');}write('endobj\n');}
   const xref=total;write(`xref\n0 ${objects.length}\n0000000000 65535 f \n`);for(let i=1;i<objects.length;i++)write(String(offsets[i]).padStart(10,'0')+' 00000 n \n');write(`trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
   return new Blob(parts,{type:'application/pdf'});
 }

    const pdfButton=$('as-print');
    pdfButton.textContent='Ampel-PDF erstellen';
    const tools=elt('div','as-pdf-tools');tools.id='as-pdf-tools';
    tools.style.cssText='margin:12px 0;padding:13px;border:1px solid #a3cedb;background:#edf8fb;border-radius:12px;display:flex;flex-direction:column;gap:9px';
    const message=elt('p','', 'Das PDF wird lokal auf deinem iPhone erstellt. Danach kannst du es in „Dateien“ speichern oder über das Teilen-Menü drucken.');
    message.id='as-pdf-message';message.setAttribute('role','status');message.style.cssText='margin:0;font-size:14px;line-height:1.45;color:#1a576e';
    const share=elt('button','btn btn-primary','PDF teilen / Drucken');share.type='button';share.id='as-pdf-share';share.hidden=true;
    const download=elt('a','btn btn-outline','PDF herunterladen');download.id='as-pdf-download';download.hidden=true;download.download='Asthma_Ampel.pdf';
    download.style.cssText='text-align:center';
    const open=elt('a','btn btn-outline','PDF ansehen');open.id='as-pdf-open';open.hidden=true;open.target='_blank';open.rel='noopener noreferrer';open.style.cssText='text-align:center';
    tools.append(message,share,download,open);pdfButton.insertAdjacentElement('afterend',tools);
    let blob=null,fileName='',objectUrl=null,working=false,stamp='';
    const setMessage=(s,bad=false)=>{message.textContent=s;message.style.color=bad?'#a52d25':'#1a576e'};
    const selection=()=>[$('as-period').value,$('as-date').value,records.length,records.reduce((v,r)=>v+String(r.updatedAt||'').length,0)].join('|');
    const clear=()=>{if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;blob=null;share.hidden=true;download.hidden=true;open.hidden=true;};
    const svgElement=(tag,props,parent)=>{const node=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(props).forEach(([k,v])=>node.setAttribute(k,String(v)));parent.append(node);return node;};
    function makeDistribution(days){
      const svg=svgElement('svg',{viewBox:'0 0 670 250'},document.createDocumentFragment());
      LEVELS.forEach((l,i)=>{
        const count=days.filter(d=>d.level===l.n).length,y=32+i*45;
        svgElement('line',{x1:169,y1:y,x2:565,y2:y,stroke:'#e4ebef','stroke-width':18},svg);
        if(count)svgElement('line',{x1:169,y1:y,x2:169+(count/days.length)*396,y2:y,stroke:l.color,'stroke-width':18},svg);
        svgElement('text',{x:6,y:y+5,'font-size':15,fill:'#264a5b'},svg).textContent=l.short;
        svgElement('text',{x:582,y:y+5,'font-size':15,fill:'#264a5b'},svg).textContent=count+' Tage';
      });
      return svg;
    }
    function calendarTable(period,days){
      const table=document.createElement('table'),thead=document.createElement('thead'),hdr=document.createElement('tr');
      for(const name of ['Mo','Di','Mi','Do','Fr','Sa','So']){const th=document.createElement('th');th.textContent=name;hdr.append(th)}
      thead.append(hdr);table.append(thead);
      const body=document.createElement('tbody'),mapped=new Map(days.map(r=>[r.date,r]));
      const offset=(new Date(period.from+'T12:00:00Z').getUTCDay()+6)%7;
      const cells=Array.from({length:offset},()=>''),last=Number(period.to.slice(8));
      for(let k=1;k<=last;k++){
        const day=period.from.slice(0,8)+String(k).padStart(2,'0'),r=mapped.get(day);
        cells.push(k+(r?' ('+r.level+'/5)':''));
      }
      while(cells.length%7)cells.push('');
      for(let i=0;i<cells.length;i+=7){const tr=document.createElement('tr');
        for(const val of cells.slice(i,i+7)){const td=document.createElement('td');td.textContent=val;tr.append(td)}
        body.append(tr);
      }
      table.append(body);return table;
    }
    function build(){
      const period=range(),items=records.filter(r=>r.date>=period.from&&r.date<=period.to),days=daily(items),mean=average(days);
      const doc=new Layout();
      doc.heading('Asthma-Ampel - persönliche Statistik',1);
      doc.para(period.title+'  |  Erstellt: '+new Date().toLocaleString('de-DE'),10,6,'#29546a');
      doc.para('Subjektive Tagesbewertung auf einer Skala von 1 (kritisch) bis 5 (super). Keine medizinische Diagnosestellung.',9,10,'#516875');
      doc.kpiGrid([ {title:'Dokumentierte Tage',value:String(days.length)}, {title:'Einträge',value:String(items.length)},
        {title:'Durchschnitt Tagesstatus',value:mean===null?'-':mean.toFixed(1).replace('.',',')+'/5'},
        {title:'Schlechte / kritische Tage',value:String(days.filter(d=>d.level<=2).length)}]);
      doc.heading('Zeitlicher Verlauf',2);
      const svg=$('as-trend').querySelector('svg');if(svg)doc.image(svg);else doc.para('In diesem Zeitraum liegen noch keine Einträge vor.',10,8);
      doc.heading('Verteilung der Ampelstufen',2);
      if(days.length)doc.image(makeDistribution(days));else doc.para('Keine dokumentierten Tage.',10,8);
      if(period.mode==='month'){
        doc.heading('Monatskalender',2);
        doc.para('Zahlen in Klammern sind der letzte Tagesstatus, z. B. 4/5.',8,6,'#5c7080');
        doc.table(calendarTable(period,days));
      }
      doc.heading('Einträge und Notizen',2);
      const sorted=[...items].sort((a,b)=>(b.date+'T'+(b.time||'')).localeCompare(a.date+'T'+(a.time||'')));
      if(!sorted.length)doc.para('Keine Einträge in diesem Zeitraum.',10,7);
      for(const entry of sorted){
        const level=BY_LEVEL[entry.level];
        doc.para(germanDate(entry.date)+' | '+String(entry.time||'')+' Uhr | '+level.title+(entry.mode==='extra'?' (weitere Messung)':''),10,3,'#164f68',true);
        const chosen=PRESETS.filter(([key])=>(entry.notes||[]).includes(key)).map(x=>x[1]);
        if(chosen.length)doc.para('Vorgegebene Notizen: '+chosen.join('; '),9,4);
        if(entry.custom)doc.para('Eigene Notiz: '+entry.custom,9,4);
        const ss=SYMPTOMS.filter(([key])=>(entry.symptoms||[]).includes(key)).map(x=>x[1]);
        if(ss.length)doc.para('Symptome: '+ss.join('; '),9,4);
        if(entry.sprayCount!==null&&entry.sprayCount!==undefined)doc.para('Bedarfsspray: '+entry.sprayCount+' Anwendungen',9,4);
        doc.rule();
      }
      doc.para('Hinweis: Diese PDF-Datei ist außerhalb des verschluesselten Asthma-Tresors nicht geschützt. Nicht automatisch an Dritte uebermitteln.',8,8,'#536e7c');
      return {blob:createPDF(doc),pages:doc.pages.length,period};
    }
    function outputFile(){return new File([blob],fileName,{type:'application/pdf'});}
    function make(){
      if(working)return;
      if(!confirm('Die PDF enthält persönliche Gesundheitsdaten und wird außerhalb der App nicht verschluesselt gespeichert. Lokal erstellen?'))return;
      working=true;pdfButton.disabled=true;clear();setMessage('Die PDF-Datei wird lokal erstellt …');
      try{statsRefresh();const result=build();blob=result.blob;
        if(blob.size<450||blob.size>50*1024*1024)throw Error('Ungültige PDF-Dateigroesse.');
        fileName='Asthma_Ampel_'+result.period.mode+'_'+result.period.from+'_'+result.period.to+'.pdf';
        objectUrl=URL.createObjectURL(blob);download.href=objectUrl;download.download=fileName;open.href=objectUrl;
        stamp=selection();share.hidden=false;download.hidden=false;open.hidden=false;
        setMessage('PDF erstellt: '+Math.round(blob.size/1024)+' KB, '+result.pages+' Seiten. Jetzt „PDF teilen / Drucken“ wählen und auf dem iPhone „In Dateien sichern“ oder „Drucken“ antippen.');
      }catch(e){clear();setMessage('PDF konnte nicht erstellt werden: '+(e?.message||e),true)}
      finally{working=false;pdfButton.disabled=false}
    }
    async function shareFile(){
      if(!blob){setMessage('Bitte zuerst „Ampel-PDF erstellen“ antippen.',true);return}
      if(selection()!==stamp){clear();setMessage('Die Werte oder der Zeitraum wurden geändert. Bitte PDF neu erstellen.',true);return}
      const file=outputFile();
      if(typeof navigator.share==='function'&&(!navigator.canShare||navigator.canShare({files:[file]}))){
        try{await navigator.share({files:[file],title:'Asthma-Ampel Statistik'});
          setMessage('PDF an das Teilen-Menü übergeben. „In Dateien sichern“ speichert sie, „Drucken“ startet den iPhone-Druckdialog.');
        }catch(e){if(e.name!=='AbortError')setMessage('Teilen nicht möglich. Alternativ „PDF herunterladen“ oder „PDF ansehen“ nutzen.',true)}
      }else{setMessage('Teilen wird von diesem Browser nicht unterstuetzt. Bitte „PDF herunterladen“ oder „PDF ansehen“ nutzen.');}
    }
    pdfButton.addEventListener('click',make);
    share.addEventListener('click',shareFile);
    for(const id of ['as-period','as-date'])$(id).addEventListener('change',()=>{if(blob){clear();setMessage('Zeitraum geändert. Bitte PDF neu erstellen.')}});
    window.addEventListener('asthma:secure-change',ev=>{if(ev.detail?.group==='ampel'&&blob){clear();setMessage('Messwerte geändert. Bitte PDF neu erstellen.')}});
    window.addEventListener('pagehide',()=>{if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}});
    return Object.freeze({makePDF:make,getPDF:()=>blob,getMessage:()=>message.textContent,getFileName:()=>fileName});
  })();
  window.ASTHMA_AMPEL_PDF_TEST=PDF;
  window.addEventListener('asthma:secure-change',e=>{
    if(e.detail?.group==='ampel'&&!busy)refresh().catch(err=>inform(err.message,true));
  });
  refresh().catch(err=>inform('Asthma-Ampel konnte nicht geladen werden: '+err.message,true));
  window.ASTHMA_AMPEL={levels:LEVELS,presets:PRESETS,range};
})();
