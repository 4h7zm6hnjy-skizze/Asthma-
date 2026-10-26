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

  // Version 3.2.0: move the existing Ampel immediately below the patients'
  // dashboard profile. That profile is created later by professional27.js.
  // Moving the DOM node does not recreate data or its existing event listeners.
  const placeBelowPatientProfile = () => {
    const patientProfile = document.getElementById('a27-personal-summary');
    if (!patientProfile || !patientProfile.isConnected) return false;
    if (pane.parentNode !== patientProfile.parentNode || pane.previousElementSibling !== patientProfile) {
      patientProfile.insertAdjacentElement('afterend', pane);
    }
    return true;
  };
  if (!placeBelowPatientProfile()) {
    const profileObserver = new MutationObserver(() => {
      if (placeBelowPatientProfile()) profileObserver.disconnect();
    });
    profileObserver.observe(home, {childList: true, subtree: true});
  }

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
  $('as-print').addEventListener('click',()=>{
    const sheet=elt('section','as-print-sheet');sheet.id='as-print-sheet';
    sheet.append(elt('h1','','Asthma-Ampel – Persönlicher Bericht'),elt('h2','',$('as-period-title').textContent));
    ['as-kpis','as-trend','as-dist','as-calendar','as-entries'].forEach(id=>{
      const copy=$(id).cloneNode(true);copy.querySelectorAll('button').forEach(b=>b.remove());sheet.append(copy);
    });
    sheet.append(elt('p','','Persönliche Selbsteinschätzung. Keine ärztliche Diagnostik. Dieser Ausdruck ist nicht verschlüsselt.'));
    document.body.append(sheet);document.body.classList.add('as-printing');
    const cleanup=()=>{document.body.classList.remove('as-printing');sheet.remove()};
    window.addEventListener('afterprint',cleanup,{once:true});
    try{window.print()}catch(err){cleanup();inform('Drucken fehlgeschlagen: '+err.message,true)}
  });
  window.addEventListener('asthma:secure-change',e=>{
    if(e.detail?.group==='ampel'&&!busy)refresh().catch(err=>inform(err.message,true));
  });
  refresh().catch(err=>inform('Asthma-Ampel konnte nicht geladen werden: '+err.message,true));
  window.ASTHMA_AMPEL={levels:LEVELS,presets:PRESETS,range};
})();
