'use strict';
/* Asthma 1.5.0 – modularer Gesundheitsbereich. Daten lokal, keine Diagnosen. */
(()=>{
  const $=id=>document.getElementById(id), q=(s,p=document)=>p.querySelector(s), qa=(s,p=document)=>[...p.querySelectorAll(s)];
  const make=(tag,cl,txt)=>{const el=document.createElement(tag);if(cl)el.className=cl;if(txt!==undefined)el.textContent=String(txt);return el};
  const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
  const uid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const fmt=s=>/^\d{4}-\d\d-\d\d$/.test(s||'')?`${s.slice(8)}.${s.slice(5,7)}.${s.slice(0,4)}`:'–';
  // Nur Nucala/Mepolizumab: die zeitlich gleichbedeutende Angabe vereinheitlichen.
  // Andere Arzneimittel, Wirkstärken und Dosierungen werden nicht verändert.
  const nucala28Text=(med,value)=>typeof value==='string'&&/\b(?:nucala|mepolizumab)\b/i.test(String(med?.name||''))
    ?value.replace(/\balle\s+(?:4|vier)\s+Wochen\b/gi,'alle 28 Tage'):value;
  const escCSV=v=>'"'+(/^[\s]*[=+@\-\t\r]/.test(String(v??''))?"'":'')+String(v??'').replace(/"/g,'""')+'"';
  const safeNum=(v,min,max)=>{if(v===''||v===null||v===undefined)return null;const n=Number(v);return Number.isFinite(n)&&n>=min&&n<=max?n:null};
  const safeDate=x=>!x||/^\d{4}-\d\d-\d\d$/.test(x);
  const flash=(id,text,bad=false)=>{const x=$(id);if(x){x.textContent=text;x.classList.toggle('suite-error',bad)}};
  const button=(name,cb,cl='btn btn-outline')=>{const b=make('button',cl,name);b.type='button';b.addEventListener('click',cb);return b};
  const download=(blob,name)=>{const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),15000)};
  const csv=(rows,filename)=>{if(!confirm('Diese CSV-Datei ist unverschlüsselt und kann private Gesundheitsangaben enthalten. Fortfahren?'))return;download(new Blob(['\uFEFF'+rows.map(row=>row.map(escCSV).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),filename)};
  const uuid=()=>uid();
  // A. Navigation: jede Ansicht ist einzeln aufrufbar und direkt verlinkbar.
  const allowed=new Set(['start','profil','region','kalender','lungenwerte','peakflow','befunde','labor','therapie','hilfen','antraege','akte','arbeit','bericht','statistik','wissen','einstellungen','mehr']);
  function go(page,{scroll=true}={}){
    if(!allowed.has(page))page='start';
    qa('[data-nav-page]').forEach(el=>{el.hidden=el.dataset.navPage!==page});
    qa('[data-goto].nav-item').forEach(el=>{const active=el.dataset.goto===page;el.classList.toggle('nav-active',active);el.setAttribute('aria-current',active?'page':'false')});
    document.body.dataset.page=page;
    document.querySelectorAll('.bottom-dock button').forEach(b=>{const on=b.dataset.goto===page;b.classList.toggle('dock-active',on);b.setAttribute('aria-current',on?'page':'false')});
    if(location.hash!=='#'+page)history.replaceState(null,'','#'+page);
    if(scroll)window.scrollTo({top:0,behavior:'instant'});
    if(page==='bericht'&&database&&!locked())renderDoctor().catch(()=>{});
    if(page==='start')updateDashboard();
    const active=q(`[data-goto="${page}"].nav-item`);active?.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  window.ASTHMA_NAV=Object.freeze({go});
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-goto]');if(nav){e.preventDefault();go(nav.dataset.goto);return}
    const anchor=e.target.closest('a[href^="#"]');if(!anchor)return;
    const id=decodeURIComponent(anchor.getAttribute('href').slice(1));
    const el=$(id);if(!el)return;
    const own=el.closest('[data-nav-page]');if(own){e.preventDefault();go(own.dataset.navPage);requestAnimationFrame(()=>el.scrollIntoView({block:'start',behavior:'smooth'}));}
  });
  window.addEventListener('hashchange',()=>{
    let id=location.hash.slice(1),node=$(id);go(allowed.has(id)?id:node?.closest('[data-nav-page]')?.dataset.navPage||'start',{scroll:false});
    if(node && !allowed.has(id))node.scrollIntoView();
  });
  // B. Gemeinsamer AES-GCM-Tresor. Alle Module nutzen denselben verschlüsselten Speicher.
  const SEC=window.ASTHMA_SECURITY;
  let database=true,meta={secure:true},secretKey=true;
  const locked=()=>!SEC.state().unlocked;
  const assertUnlocked=()=>{if(locked())throw Error('App gesperrt')};
  const listRaw=()=>SEC.list('suite');
  const getMeta=async()=>null;
  async function entries(type){return (await listRaw()).filter(x=>x.type===type).map(x=>x.value)}
  async function save(type,item){return SEC.put('suite',{key:type+'/'+item.id,type,value:item},type+'/'+item.id)}
  async function remove(type,id){return SEC.del('suite',type+'/'+id)}
  async function enableVault(pass){return SEC.changePassword(pass)}
  const b64=b=>{let s='';for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode(...b.subarray(i,i+8192));return btoa(s)};
  const ub64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  async function derive(password,salt){const imported=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',iterations:310000,salt},imported,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
  async function encryptObj(item,key){const iv=crypto.getRandomValues(new Uint8Array(12));const bytes=new TextEncoder().encode(JSON.stringify(item));const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes);return{iv:b64(iv),cipher:b64(new Uint8Array(data))}}
  async function decryptObj(row,key){const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:ub64(row.iv)},key,ub64(row.cipher));return JSON.parse(new TextDecoder().decode(data))}
  function setVaultMessage(){flash('vault-state','Gesamte Gesundheitsakte ist mit Passwort verschlüsselt. Der Tresor schützt auch Lungenwerte, Dokumente und Anträge.')}
  async function refreshAll(){if(locked()){setVaultMessage();return;}await Promise.all([renderMeasurements(),renderMeds(),renderControls(),renderWork(),renderAction(),renderReports()]);updateDashboard();setVaultMessage();}
  // C. Measurements with phase and manual validation. No artificial clinical thresholds.
  async function saveCurrentMeasurement(source='manuell'){
    const p=window.ASTHMA_PROFILE_BRIDGE?.get();if(!p)throw Error('Lungenprofil ist nicht verfügbar');
    const values=['fev1','fvc','fev1Liters','fvcLiters'].map(k=>p[k]);if(values.every(v=>v==null))throw Error('Es ist noch kein Messwert vorhanden.');
    if(p.fev1Liters!=null&&p.fvcLiters!=null&&p.fev1Liters>p.fvcLiters)throw Error('FEV₁ darf nicht größer als FVC in Litern sein.');
    const measurement={id:uuid(),date:p.lungDate||today(),phase:$('measurement-phase').value,source,fev1:p.fev1,fvc:p.fvc,fev1Liters:p.fev1Liters,fvcLiters:p.fvcLiters,createdAt:new Date().toISOString(),doctor:($('lufu23-doctor')?.value||'').trim().slice(0,120),note:($('lufu23-note')?.value||'').trim().slice(0,700)};
    if(measurement.fev1Liters!=null&&measurement.fvcLiters>0)measurement.ratio=100*measurement.fev1Liters/measurement.fvcLiters;
    if(source!=='scanner'&&!confirm('Die aktuell kontrollierten Lungenwerte mit Datum '+fmt(measurement.date)+' dauerhaft in den Verlauf übernehmen?'))return;
    const previous=await entries('measurements');if(previous.some(x=>x.date===measurement.date&&x.phase===measurement.phase&&['fev1','fvc','fev1Liters','fvcLiters'].every(k=>x[k]===measurement[k]))){flash('measurement-msg','Identische Messung ist bereits vorhanden – nicht doppelt gespeichert.');return;} const last=previous.filter(x=>x.fev1!=null).sort((a,b)=>b.date.localeCompare(a.date))[0];if(last&&measurement.fev1!=null&&Math.abs(last.fev1-measurement.fev1)>=30){if(!confirm('Die FEV₁-Werte weichen um mindestens 30 Prozentpunkte voneinander ab. Sind Messphase, Einheiten und Originalbefund geprüft?'))return;}await save('measurements',measurement);await renderMeasurements();await renderReports();await updateDashboard();flash('measurement-msg','Messung gespeichert. Frühere Befunde bleiben erhalten.');
  }
  const metricLabel={fev1:'FEV₁ (% vom Soll)',fvc:'FVC (% vom Soll)',fev1Liters:'FEV₁ (Liter)',fvcLiters:'FVC (Liter)',ratio:'FEV₁/FVC (%)'};
  function chartSVG(records,field){const series=records.filter(r=>Number.isFinite(r[field])).sort((a,b)=>a.date.localeCompare(b.date));if(series.length<2)return null;const vals=series.map(r=>r[field]),min=Math.max(0,Math.min(...vals)-Math.max(2,(Math.max(...vals)-Math.min(...vals))*.2)),max=Math.max(...vals)+Math.max(2,(Math.max(...vals)-Math.min(...vals))*.2),rng=max-min||1;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 780 260');svg.setAttribute('role','img');svg.setAttribute('aria-label',metricLabel[field]+' im Verlauf von '+series.length+' Untersuchungen');svg.style.width='100%';
    const node=(tag,props)=>{const e=document.createElementNS(svg.namespaceURI,tag);Object.entries(props).forEach(([k,v])=>e.setAttribute(k,v));svg.append(e);return e};
    for(let i=0;i<4;i++){let y=22+i*65;node('line',{x1:52,y1:y,x2:750,y2:y,stroke:'#dce8ed','stroke-width':1});const t=node('text',{x:3,y:y+5,fill:'#546c7a','font-size':13});t.textContent=(max-(max-min)*i/3).toFixed(1)}
    const xy=(v,i)=>[52+(i*690/Math.max(1,series.length-1)),214-(v-min)/rng*192];node('polyline',{fill:'none',stroke:'#176f83','stroke-width':4,'stroke-linejoin':'round',points:series.map((r,i)=>xy(r[field],i).join(',')).join(' ')});
    series.forEach((r,i)=>{const [x,y]=xy(r[field],i);const c=node('circle',{cx:x,cy:y,r:5,fill:'#176f83'});const title=document.createElementNS(svg.namespaceURI,'title');title.textContent=`${fmt(r.date)}: ${r[field].toFixed(1)} (${r.phase||'unbekannt'})`;c.append(title)});return svg;
  }
  async function renderMeasurements(){const data=(await entries('measurements')).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));const list=$('measurement-list');list.replaceChildren();$('measurement-chart').replaceChildren();const field=$('measurement-metric').value;const chart=chartSVG(data,field);$('measurement-chart').append(chart||make('p','suite-msg','Für den Verlauf werden mindestens zwei Messungen mit demselben Wertefeld benötigt.'));
    for(const r of data.slice(0,100)){const item=make('article','suite-record');const head=make('strong','',fmt(r.date)+' · '+(r.phase==='vor'?'Vor Bronchodilatation':r.phase==='nach'?'Nach Bronchodilatation':'Phase nicht angegeben'));item.append(head,make('p','',Object.entries(metricLabel).map(([k,label])=>r[k]!=null?label+': '+Number(r[k]).toFixed(k.includes('Liters')?2:1):null).filter(Boolean).join(' · ')));item.append(button('Löschen',async()=>{if(!confirm('Messung löschen?'))return;await remove('measurements',r.id);await refreshAll();},'btn btn-text'));list.append(item)}
  }
  // D. Drug plan, no dosage recommendations.
  async function renderMeds(){
    const meds=(await entries('meds')).sort((a,b)=>(a.next||'9999').localeCompare(b.next||'9999'));
    const list=$('med-list');list.replaceChildren();
    for(const m of meds){const row=make('article','suite-record');
      row.append(make('strong','',m.name+' · '+m.kind),make('p','',`${nucala28Text(m,m.dose)||'Dosis nicht eingetragen'} · ${m.route||'Art unbekannt'} · ${m.slots?.join(', ')||m.time||'keine Uhrzeit'} · Termin: ${fmt(m.next)}${m.interval?' · alle '+m.interval+' Tage':''} · Rezept: ${fmt(m.refill)}`));
      if(m.notes)row.append(make('p','suite-muted',m.notes));
      row.append(button('Bearbeiten',()=>{for(const [id,value] of [['med-name',m.name],['med-dose',nucala28Text(m,m.dose)],['med-kind',m.kind],['med-time',m.time],['med-interval',m.interval],['med-next',m.next],['med-refill',m.refill],['med-notes',nucala28Text(m,m.notes)],['med-route',m.route||'Inhalation'],['med-start',m.start]])if($(id))$(id).value=value??'';qa('input[name="med24-slot"]').forEach(x=>x.checked=Boolean(m.slots?.includes(x.value)));$('med24-edit-id').value=m.id;$('med24-submit').textContent='Änderung speichern';$('med-form').scrollIntoView({block:'center',behavior:'smooth'})},'btn btn-outline'));
      row.append(button('Entfernen',async()=>{if(!confirm('Medikament aus deiner Liste löschen?'))return;await remove('meds',m.id);await refreshAll()},'btn btn-text'));list.append(row)
    }
    if(!meds.length)list.append(make('p','suite-msg','Noch keine Medikamente erfasst.'));
    window.dispatchEvent(new CustomEvent('asthma:meds-change',{detail:{meds}}));
  }
  async function medIcs(){const meds=await entries('meds');const events=[];for(const m of meds){for(const [date,label] of [[m.next,'Behandlung'],[m.refill,'Rezeptbedarf']])if(/^\d{4}-\d\d-\d\d$/.test(date||'')){const start=m.time&&/^\d\d:\d\d$/.test(m.time)?`DTSTART:${date.replace(/-/g,'')}T${m.time.replace(':','')}00`:`DTSTART;VALUE=DATE:${date.replace(/-/g,'')}`;events.push(['BEGIN:VEVENT',`UID:${m.id}-${label}@asthma-local`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,start,`SUMMARY:${icsEscape(label+' – '+m.name)}`,...(label==='Behandlung'&&m.interval?[`RRULE:FREQ=DAILY;INTERVAL=${m.interval};COUNT=12`]:[]),'END:VEVENT'].join('\r\n'))}}
    if(!events.length){alert('Bitte zuerst einen gültigen Termin eintragen.');return}download(new Blob(['BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Asthma//DE\r\n'+events.join('\r\n')+'\r\nEND:VCALENDAR'],{type:'text/calendar'}),'Asthma_Termine.ics')}
  // E. symptom questions, informational only.
  async function renderControls(){const list=$('control-history');list.replaceChildren();const items=(await entries('checks')).sort((a,b)=>b.date.localeCompare(a.date));for(const x of items.slice(0,8))list.append(make('p','suite-record',`${fmt(x.date)} · ${x.yes} von 4 Antworten „Ja“ · ${x.yes>0?'Anlass zur ärztlichen Besprechung':'Symptome trotzdem regelmäßig ärztlich prüfen'}`));}
  // F. action plan. Stored verbatim. No dosage adjustment.
  async function renderAction(){const a=(await entries('actions'))[0];const box=$('action-summary');box.replaceChildren();if(!a){box.append(make('p','suite-msg','Noch kein ärztlich bestätigter Plan eingetragen.'));return}box.append(make('h4','','Gespeicherter Aktionsplan'),make('p','',`Praxis: ${a.contact||'–'} · Persönlicher Bestwert: ${a.best||'–'} L/min`));for(const [key,label] of [['green','Grüner Bereich'],['yellow','Gelber Bereich'],['red','Roter Bereich']])box.append(make('p','suite-record',label+': '+(a[key]||'Keine Anweisung hinterlegt')))}
  // G. work diary
  async function renderWork(){const list=$('work-list');list.replaceChildren();const vals=(await entries('work')).sort((a,b)=>b.date.localeCompare(a.date));for(const x of vals.slice(0,80)){const row=make('article','suite-record');row.append(make('strong','',fmt(x.date)+' · '+x.shift+' · '+x.exposure),make('p','',`${x.temperature===null?'Temperatur nicht erfasst':x.temperature+' °C'} · Beschwerden ${x.symptoms}/3${x.notes?' · '+x.notes:''}`));row.append(button('Löschen',async()=>{if(!confirm('Eintrag löschen?'))return;await remove('work',x.id);await refreshAll();},'btn btn-text'));list.append(row)}if(!vals.length)list.append(make('p','suite-msg','Noch keine Arbeitsplatzbelastungen erfasst.'))}
  async function renderReports(){const list=$('report-list');list.replaceChildren();const r=(await entries('measurements')).filter(x=>x.source==='scanner').sort((a,b)=>b.date.localeCompare(a.date));for(const x of r.slice(0,30))list.append(make('p','suite-record',`${fmt(x.date)} · FEV₁ ${x.fev1??'–'} % · FVC ${x.fvc??'–'} % · bestätigte Werte`));if(!r.length)list.append(make('p','suite-msg','Noch keine aus dem Scanner in den Verlauf übernommenen Messungen.'))}
  // H. Doctor report, printable browser PDF
  async function legacyDiary(){return SEC.list('diary')}

  async function renderDoctor(){if(locked())return;const box=$('medical-report');if(!box)return;box.replaceChildren();box.append(make('h2','','Asthma – Gesprächsvorbereitung'),make('p','',`Erstellt am ${fmt(today())}. Angaben aus lokalen Einträgen, keine ärztliche Diagnose.`));const groups=[];
    if($('report-measurements').checked){const ms=(await entries('measurements')).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);groups.push(['Untersuchungen',ms.map(x=>`${fmt(x.date)} (${x.phase||'nicht angegeben'}): FEV₁ ${x.fev1??'–'} %, FVC ${x.fvc??'–'} %, FEV₁ ${x.fev1Liters??'–'} L, FVC ${x.fvcLiters??'–'} L`)])}
    if($('report-meds').checked){const m=await entries('meds');groups.push(['Medikamente und Termine',m.map(x=>`${x.name} (${x.kind}) · eingetragene Dosis: ${x.dose||'–'} · Termin: ${fmt(x.next)}`)])}
    if($('report-diary').checked){const diary=(await legacyDiary()).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20);groups.push(['Tagebuch (letzte 20)',diary.map(x=>`${fmt(x.date)}: Peak-Flow ${x.peak??'–'} L/min · Bedarfsanwendungen ${x.rescue??'–'} · Beschwerden ${x.symptoms}/3`)])}
    if($('report-diary').checked){const peaks=(await SEC.list('epef')).filter(x=>x.kind==='measurement').sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)).slice(0,20);groups.push(['ePEF – PEF und FEV₁ (letzte 20)',peaks.map(x=>`${fmt(x.date)} ${x.time} Uhr: PEF ${x.pef??'–'} l/min · FEV₁ ${x.fev1??'–'} l · Zeitgruppe ${(x.time<'13:00'?'vor 13 Uhr':x.time<'17:00'?'13–17 Uhr':'ab 17 Uhr')}`)])}
    if($('report-labor')?.checked){const l=(await SEC.list('labs')).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30);groups.push(['Laborwerte (vom Patienten bestätigt)',l.map(x=>`${fmt(x.date)}: ${x.marker}${x.allergen?' ('+x.allergen+')':''} ${x.value} ${x.unit||''} · Laborreferenz: ${x.reference||'nicht angegeben'}`)])}
    if($('report-work').checked){const work=(await entries('work')).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,15);groups.push(['Arbeitsplatz',work.map(x=>`${fmt(x.date)}: ${x.exposure}, Beschwerden ${x.symptoms}/3 · ${x.notes||''}`)])}
    if($('report-control').checked){const checks=(await entries('checks')).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);groups.push(['Selbstbeobachtung',checks.map(x=>`${fmt(x.date)}: ${x.yes}/4 Kontrollfragen mit „Ja“`)])}
    for(const [name,rows] of groups){const section=make('section','suite-report-section');section.append(make('h3','',name));if(!rows.length)section.append(make('p','', 'Keine Einträge vorhanden.'));else for(const line of rows)section.append(make('p','',line));box.append(section)}box.append(make('p','suite-muted','Wichtiger Hinweis: Werte sind nicht auf Richtigkeit oder klinische Bedeutung geprüft. Originalbefunde und ärztlichen Aktionsplan mitbringen.'));
  }
  // I. help wizard and requests
  const mapping={atem:['atemphysio','lungensport','pneureha'],schleim:['sekret','pep'],arbeit:['luftarbeit','arbgerät','bem','teilhabe'],reha:['pneureha','lungensport','schulung']};
  function gotoHelp(id){go('antraege');const found=(window.ASTHMA_APPLICATIONS||[]).find(x=>x.id===id);if(!found)return;const search=$('apply-search');$('apply-category').value='all';$('apply-category').dispatchEvent(new Event('change',{bubbles:true}));search.value=found.title;search.dispatchEvent(new Event('input',{bubbles:true}));$('antraege').scrollIntoView({block:'start'});}
  function helpWizard(){const keys=qa('.suite-help-filter:checked').map(x=>x.value);const ids=[...new Set(keys.flatMap(k=>mapping[k]||[]))];const list=$('help-matches');list.replaceChildren();if(!ids.length){list.append(make('p','suite-msg','Wähle eine oder mehrere Situationen aus.'));return}const catalogue=window.ASTHMA_APPLICATIONS||[];for(const id of ids){const a=catalogue.find(x=>x.id===id);if(!a)continue;const row=make('article','suite-record');row.append(make('strong','',a.title),make('p','',a.sub||'Individuellen Bedarf ärztlich prüfen.'),button('Antragsweg anzeigen',()=>gotoHelp(id)));list.append(row)}list.append(make('p','suite-muted','Keine Zusage der Kostenübernahme. Medizinischer und rechtlicher Einzelfall.'))}
  // J. native scanner enhancements: transformed images go into original file input, so existing OCR/confirmation remains authoritative.
  let current=null,rotation=0,cropStart=null,cropEnd=null,cropImage=null;
  const picked=f=>{if(f&&f.type.startsWith('image/'))current=f};
  function updateScanFile(file){const transfer=new DataTransfer();transfer.items.add(file);$('scan-gallery').files=transfer.files;$('scan-gallery').dispatchEvent(new Event('change',{bubbles:true}));current=file}
  async function transformed(file,angle=0){const bmp=await createImageBitmap(file);let w=bmp.width,h=bmp.height;const canvas=document.createElement('canvas');if(angle%180){canvas.width=h;canvas.height=w}else{canvas.width=w;canvas.height=h};const ctx=canvas.getContext('2d');ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(angle*Math.PI/180);ctx.drawImage(bmp,-w/2,-h/2);bmp.close();return canvas}
  const asFile=canvas=>new Promise(resolve=>canvas.toBlob(b=>resolve(b?new File([b],'Asthma_Befund_bearbeitet.png',{type:'image/png'}):null),'image/png'));
  async function pdfPick(file){if(!file)return;flash('scan-enhance-status','Zum Schutz deiner Daten ist der externe PDF-Reader deaktiviert. Bitte eine PDF-Seite auf deinem Gerät als Screenshot speichern und als Bild öffnen. Es werden keine PDF-Dateien an Fremdserver gesendet.',true)}

  async function archiveOriginal(){const f=$('scan-gallery')?.files?.[0]||$('scan-camera')?.files?.[0];if(!f){flash('scan-enhance-status','Bitte erst ein Bild auswählen.',true);return}try{await SEC.put('documents',{id:uuid(),name:f.name,size:f.size,mime:f.type||'image/png',blob:f,caseId:'',kind:'Lungenfunktion',createdAt:new Date().toISOString()});flash('scan-enhance-status','Befundbild verschlüsselt gespeichert. Zur Ansicht „Meine Akte“ öffnen.')}catch(e){flash('scan-enhance-status','Speichern fehlgeschlagen: '+e.message,true)}}

  async function rotateImage(){if(!current){flash('scan-enhance-status','Zuerst ein Bild wählen.',true);return}try{const canvas=await transformed(current,90);const file=await asFile(canvas);if(file){updateScanFile(file);flash('scan-enhance-status','Bild wurde gedreht. Erkennung bei Bedarf erneut starten.')}}catch(e){flash('scan-enhance-status',e.message,true)}}
  async function startCrop(){if(!current){flash('scan-enhance-status','Zuerst ein Bild auswählen.',true);return}try{const bmp=await createImageBitmap(current);cropImage=bmp;const max=1000;const ratio=Math.min(1,max/Math.max(bmp.width,bmp.height));const canvas=$('crop-canvas');canvas.width=Math.round(bmp.width*ratio);canvas.height=Math.round(bmp.height*ratio);canvas.getContext('2d').drawImage(bmp,0,0,canvas.width,canvas.height);cropStart=null;cropEnd=null;$('crop-workspace').hidden=false;}catch(e){flash('scan-enhance-status',e.message,true)}}
  function cropOverlay(){const canvas=$('crop-canvas'),ctx=canvas.getContext('2d');if(!cropImage)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(cropImage,0,0,canvas.width,canvas.height);if(!cropStart||!cropEnd)return;const x=Math.min(cropStart.x,cropEnd.x),y=Math.min(cropStart.y,cropEnd.y),w=Math.abs(cropStart.x-cropEnd.x),h=Math.abs(cropStart.y-cropEnd.y);ctx.strokeStyle='#145a72';ctx.lineWidth=4;ctx.strokeRect(x,y,w,h);}
  function cropPos(e){const c=$('crop-canvas'),r=c.getBoundingClientRect();return{x:Math.min(c.width,Math.max(0,(e.clientX-r.left)*c.width/r.width)),y:Math.min(c.height,Math.max(0,(e.clientY-r.top)*c.height/r.height))}}
  function cancelCrop(){if(cropImage){cropImage.close();cropImage=null}$('crop-workspace').hidden=true}
  async function applyCrop(){if(!cropImage||!cropStart||!cropEnd){flash('scan-enhance-status','Bitte zuerst mit dem Finger einen Bildausschnitt markieren.',true);return}const c=$('crop-canvas'),sx=cropImage.width/c.width,sy=cropImage.height/c.height;let x=Math.min(cropStart.x,cropEnd.x)*sx,y=Math.min(cropStart.y,cropEnd.y)*sy,w=Math.abs(cropStart.x-cropEnd.x)*sx,h=Math.abs(cropStart.y-cropEnd.y)*sy;if(w<50||h<50){flash('scan-enhance-status','Ausschnitt zu klein.',true);return}const o=document.createElement('canvas');o.width=Math.round(w);o.height=Math.round(h);o.getContext('2d').drawImage(cropImage,x,y,w,h,0,0,o.width,o.height);const f=await asFile(o);if(f)updateScanFile(f);cancelCrop();flash('scan-enhance-status','Ausschnitt übernommen. Texterkennung erneut starten.')}
  // K. vault and backup restricted to additional suite data, untouched legacy records.
  async function deriveBackup(pass,salt){return derive(pass,salt)}
  async function backupPackage(pass){const rows=await listRaw(),mt=await getMeta();return {schema:1,app:'Asthma Suite',exported:new Date().toISOString(),rows,meta:mt||null};}
  async function secureExport(pass){const info=await backupPackage();const salt=crypto.getRandomValues(new Uint8Array(16));const key=await deriveBackup(pass,salt);const packed=await encryptObj(info,key);return{type:'Asthma15-Backup',version:1,salt:b64(salt),...packed}}
  async function secureImport(bytes,pass){const pack=JSON.parse(bytes);if(pack.type!=='Asthma15-Backup'||pack.version!==1||!pack.salt)throw Error('Unbekanntes altes Backupformat');const decoded=await decryptObj(pack,await derive(pass,ub64(pack.salt)));if(decoded.schema!==1||!Array.isArray(decoded.rows)||decoded.meta)throw Error('Verschlüsselte alte Zusatzbackups vor dem Import gesondert prüfen. Aktuelle v1.7-Gesamtsicherung verwenden.');if(!confirm('Zusatzdaten aus älterem Backup ersetzen?'))return false;await SEC.replace('suite',decoded.rows);return true}

  function updateDashboard(){const p=window.ASTHMA_PROFILE_BRIDGE?.get();if(p)$('dash-fev').textContent=p.fev1===null?'–':p.fev1+' %';if(!database||locked()){if(locked())$('dash-due').textContent='Gesperrt';return}Promise.all([entries('measurements'),entries('meds')]).then(([m,meds])=>{$('dash-measurements').textContent=m.length;$('dash-medications').textContent=meds.length;const next=meds.flatMap(x=>[x.next,x.refill]).filter(x=>x&&x>=today()).sort()[0];$('dash-due').textContent=next?fmt(next):'–'}).catch(()=>{});}
  // L. tests/diagnostics
  async function diagnostics(){const out=[];out.push('Version der Oberfläche: '+(window.ASTHMA_APP_VERSION||document.getElementById('footer-version')?.textContent?.trim()||'unbekannt'));out.push('Verbindung: '+(navigator.onLine?'online':'offline'));out.push('Datenbank: '+(database?'erreichbar':'nicht verfügbar'));out.push('Gesamttresor: AES-GCM verschlüsselt');
    if('serviceWorker' in navigator){try{const r=await navigator.serviceWorker.getRegistration();out.push('Offline-Service-Worker: '+(r?.active?'aktiv':'nicht aktiv'))}catch{out.push('Offline-Service-Worker: Prüfung nicht möglich')}}
    try{const r=await fetch('./version.json?test='+Date.now(),{cache:'no-store'});const v=await r.json();out.push('Serverversion: '+v.version)}catch{out.push('Serverversion: offline/unbekannt')}
    flash('suite-diagnostic-status',out.join(' · '));}
  function bind(){qa('.suite-subnav button').forEach(b=>b.addEventListener('click',()=>{qa('.suite-subnav button').forEach(x=>x.classList.toggle('suite-subnav-active',x===b));qa('[data-therapy-tab]').forEach(x=>x.hidden=x.dataset.therapyTab!==b.dataset.subtab)}));
    $('measurement-save-profile').addEventListener('click',()=>saveCurrentMeasurement().catch(e=>flash('measurement-msg',e.message,true)));
    $('measurement-metric').addEventListener('change',()=>renderMeasurements().catch(()=>{}));
    $('med-form').addEventListener('submit',async e=>{e.preventDefault();try{const name=$('med-name').value.trim();if(!name)throw Error('Name fehlt');const interval=safeNum($('med-interval').value,1,365);if($('med-interval').value!==''&&interval===null)throw Error('Ungültiger Intervallwert');await save('meds',{id:$('med24-edit-id').value||uuid(),name,kind:$('med-kind').value,dose:nucala28Text({name},$('med-dose').value.trim()),route:$('med-route').value,slots:qa('input[name="med24-slot"]:checked').map(x=>x.value),start:$('med-start').value,time:$('med-time').value,interval,next:$('med-next').value,refill:$('med-refill').value,notes:nucala28Text({name},$('med-notes').value.trim())});$('med-form').reset();$('med24-edit-id').value='';$('med24-submit').textContent='Medikament speichern';await refreshAll()}catch(err){alert('Medikament konnte nicht gespeichert werden: '+err.message)}});
    $('med-ics').addEventListener('click',()=>medIcs().catch(e=>alert(e.message)));
    $('control-form').addEventListener('submit',async e=>{e.preventDefault();try{const vals=['day','night','activity','relief'].map(k=>$('control-'+k).value);if(vals.some(v=>!['yes','no'].includes(v)))throw Error('Alle vier Fragen beantworten');const yes=vals.filter(v=>v==='yes').length;await save('checks',{id:uuid(),date:today(),yes,answers:vals});flash('control-result',yes+' von 4 Antworten mit Ja. '+(yes>0?'Bitte Asthmakontrolle und Behandlung mit deiner Arztpraxis besprechen.':'Keine Auffälligkeit in diesen vier Fragen. Andere Risiken können trotzdem bestehen.'));await renderControls()}catch(e){flash('control-result',e.message,true)}});
    $('action-form').addEventListener('submit',async e=>{e.preventDefault();try{if(!$('action-confirm').checked)throw Error('Bitte zunächst den ärztlichen Originalplan abgleichen');const a={id:'current',contact:$('action-contact').value.trim(),best:safeNum($('action-best').value,50,1000),green:$('action-green').value.trim(),yellow:$('action-yellow').value.trim(),red:$('action-red').value.trim()};await save('actions',a);await renderAction()}catch(e){alert(e.message)}});
    for(const b of [$('apply-autofill'),$('apply-autofill-copy')])b?.addEventListener('click',()=>{const p=window.ASTHMA_PROFILE_BRIDGE?.get();if(!p)return;const paragraphs=[`Anfrage zur Prüfung einer geeigneten Maßnahme bei Asthma.`, `Der festgestellte GdB beträgt nach meiner Angabe ${p.gdb}.`,...(p.fev1!==null?[`FEV₁ laut meinem letzten eingetragenen Befund: ${p.fev1} % vom Soll.`]:[]),...(p.lungSymptoms.length?[`Im Alltag bestehen nach eigener Angabe folgende Belastungen: ${p.lungSymptoms.map(x=>({dyspnea:'Atemnot bei Belastung',night:'nächtliche Beschwerden',mucus:'erschwertes Abhusten',work:'Arbeitsplatzbelastung'})[x]||x).join(', ')}.`]:[]),`Bitte teilen Sie mir mit, welche ärztlichen Unterlagen, Formulare und Nachweise Sie benötigen.`];if(!confirm('Eigene medizinische Angaben in den noch nicht versendeten Antragsentwurf übernehmen?'))return;$('apply-reason').value=paragraphs.join('\n');$('apply-reason').dispatchEvent(new Event('input',{bubbles:true}));});
    $('work-date').value=today();$('work-form').addEventListener('submit',async e=>{e.preventDefault();try{const temp=safeNum($('work-temperature').value,-20,70);if($('work-temperature').value!==''&&temp===null)throw Error('Temperatur außerhalb des zulässigen Bereichs');await save('work',{id:uuid(),date:$('work-date').value,shift:$('work-shift').value,temperature:temp,exposure:$('work-exposure').value,symptoms:Number($('work-symptoms').value),notes:$('work-notes').value.trim()});$('work-form').reset();$('work-date').value=today();await refreshAll()}catch(e){alert('Arbeitsplatzprotokoll: '+e.message)}});
    $('work-csv').addEventListener('click',async()=>{try{const w=await entries('work');csv([['Datum','Schicht','Grad Celsius','Belastung','Beschwerden','Notiz'],...w.map(x=>[x.date,x.shift,x.temperature??'',x.exposure,x.symptoms,x.notes])],`Asthma_Arbeitsprotokoll_${today()}.csv`)}catch(e){alert(e.message)}});
    qa('.suite-help-filter').forEach(x=>x.addEventListener('change',helpWizard));qa('[data-help]').forEach(x=>x.addEventListener('click',()=>gotoHelp(x.dataset.help)));
    $('report-build').addEventListener('click',()=>renderDoctor().catch(e=>alert(e.message)));
    $('report-print').addEventListener('click',async()=>{try{await renderDoctor();document.body.classList.add('suite-print');window.print();setTimeout(()=>document.body.classList.remove('suite-print'),500)}catch(e){alert(e.message)}});
    ['scan-gallery','scan-camera'].forEach(id=>$(id).addEventListener('change',e=>picked(e.target.files?.[0])));
    $('scan-save-original').addEventListener('click',archiveOriginal);$('scan-rotate').addEventListener('click',rotateImage);$('scan-crop').addEventListener('click',startCrop);$('scan-pdf').addEventListener('change',e=>pdfPick(e.target.files?.[0]));
    const crop=$('crop-canvas');crop.addEventListener('pointerdown',e=>{crop.setPointerCapture(e.pointerId);cropStart=cropPos(e);cropEnd=cropStart;cropOverlay()});crop.addEventListener('pointermove',e=>{if(!cropStart||!crop.hasPointerCapture(e.pointerId))return;cropEnd=cropPos(e);cropOverlay()});
    $('crop-cancel').addEventListener('click',cancelCrop);$('crop-apply').addEventListener('click',()=>applyCrop().catch(e=>flash('scan-enhance-status',e.message,true)));
    // A scanner scan can be added to the longitudinal history after manual checking.
    window.addEventListener('asthma:lung-imported',event=>{if(event.detail?.saved){updateDashboard();renderMeasurements().catch(()=>{});renderReports().catch(()=>{});return;}const p=window.ASTHMA_PROFILE_BRIDGE?.get();if(!p)return;updateDashboard();if(confirm('Erkannte und bestätigte Werte zusätzlich dauerhaft im Untersuchungsverlauf speichern?')){if($('scan-phase'))$('measurement-phase').value=['vor','nach'].includes($('scan-phase').value)?$('scan-phase').value:'unbekannt';saveCurrentMeasurement('scanner').catch(e=>flash('scan-enhance-status',e.message,true))}});
    $('vault-form').addEventListener('submit',async e=>{e.preventDefault();try{if(!confirm('Gesamtes Tresor-Passwort ändern? Das bisherige Passwort funktioniert anschließend nicht mehr.'))return;await SEC.changePassword($('vault-pass').value);$('vault-pass').value='';setVaultMessage();flash('vault-state','Passwort erfolgreich geändert. Alte Backups behalten ihr jeweiliges Backup-Passwort.')}catch(e){flash('vault-state','Passwortwechsel fehlgeschlagen: '+e.message,true)}});
    $('vault-lock').addEventListener('click',()=>SEC.lock());
    $('suite-export').addEventListener('submit',async e=>{e.preventDefault();try{const pass=$('suite-backup-pass').value;if(pass.length<12)throw Error('Passwort zu kurz');const obj=await secureExport(pass);download(new Blob([JSON.stringify(obj)],{type:'application/json'}),`Asthma_Zusatzdaten_${today()}.asthma15`);$('suite-backup-pass').value='';flash('suite-backup-message','Verschlüsseltes Zusatzdaten-Backup erstellt. Die ältere Antragsakte wird weiterhin separat über „Meine Akte“ gesichert.')}catch(e){flash('suite-backup-message','Backup fehlgeschlagen: '+e.message,true)}});
    $('suite-import').addEventListener('submit',async e=>{e.preventDefault();try{const f=$('suite-backup-file').files[0];if(!f||f.size>12*1024*1024)throw Error('Datei fehlt oder ist zu groß (max. 12 MB)');const success=await secureImport(await f.text(),$('suite-import-pass').value);if(!success)return;$('suite-import').reset();await refreshAll();flash('suite-backup-message','Zusatzdaten wiederhergestellt. Bei verschlüsseltem Tresor Passwort erneut eingeben.')}catch(e){flash('suite-backup-message','Import abgelehnt. Vorhandene Daten blieben erhalten: '+e.message,true)}});
    $('suite-diagnostics').addEventListener('click',diagnostics);
    $('update-top').addEventListener('click',()=>go('einstellungen'));
    window.addEventListener('asthma:profile-reset',updateDashboard);window.addEventListener('storage',updateDashboard);
  }
  async function init(){bind();helpWizard();go(allowed.has(location.hash.slice(1))?location.hash.slice(1):($(location.hash.slice(1))?.closest('[data-nav-page]')?.dataset.navPage||'start'),{scroll:false});try{database=true;meta={secure:true};await refreshAll()}catch(e){flash('vault-state','Lokale Zusatzdatenbank nicht verfügbar: '+e.message,true)}}
  window.__asthmaSuiteTest=Object.freeze({go,chartSVG,safeNum,fmt});
  init();
})();
