'use strict';
/* Asthma 3.0.3 – additive, offline-only lab comparison panel. No personal data in source. */
(()=>{
 const SEC=window.ASTHMA_SECURITY;
 const $=id=>document.getElementById(id);
 const page=$('labor'),existing=$('laborplus301');
 if(!page||!existing||!SEC||$('laborvergleich303'))return;
 const panel=document.createElement('section');
 panel.id='laborvergleich303';panel.className='suite-subpanel';
 panel.innerHTML=`<h3>Laborvergleich – auf einen Blick</h3>
 <p>Jeder Test mit letztem Wert, Vorwert, Datum, Veränderung und Laborreferenz. Grüne oder rote Markierungen beziehen sich nur auf die Lage innerhalb/außerhalb desselben angegebenen Laborreferenzbereichs, nicht auf eine gesicherte gesundheitliche Verbesserung.</p>
 <label>Werte filtern <select id="lv303-filter">
  <option value="all">Alle Werte</option>
  <option value="flags">Außerhalb des Laborreferenzbereichs</option>
  <option value="asthma">Asthma und Allergie</option>
  <option value="gas">Blutgas / Säure-Basen</option>
  <option value="changed">Mit Veränderung zum Vorwert</option></select></label>
 <label>Wert suchen <input id="lv303-search" type="search" placeholder="z. B. Eosinophile, pCO₂"></label>
 <p id="lv303-count" aria-live="polite"></p><div id="lv303-list"></div>
 <button type="button" class="btn btn-outline" id="lv303-more" hidden>Weitere Werte anzeigen</button>
 <p class="input-note">Wenn Referenzen, Einheiten oder Messmethoden abweichen, wird kein medizinisch gefärbter Verlauf behauptet. Keine automatische Therapieentscheidung.</p>`;
 const css=document.createElement('style');css.textContent=`
 #laborvergleich303{border:1px solid #b8d5e3;background:#f7fbff;border-radius:14px;margin:16px 0;padding:15px}
 #laborvergleich303 h3{margin:0 0 8px;color:#163f53}
 #laborvergleich303 label{display:block;margin:9px 0;font-weight:650}
 #laborvergleich303 input,#laborvergleich303 select{width:100%;font-size:16px;padding:10px;border:1px solid #a9c6d4;border-radius:8px;margin-top:6px}
 #lv303-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(225px,1fr));gap:10px}
 .lv303-card{background:#fff;border:1px solid #d5e4eb;border-radius:12px;padding:12px;min-width:0}
 .lv303-card h4{margin:0 0 6px;font-size:.96rem;overflow-wrap:anywhere;color:#153d53}
 .lv303-main{font-size:1.16rem;font-weight:750}
 .lv303-meta{font-size:.84rem;color:#546e7b;margin:5px 0}
 .lv303-status{display:inline-block;font-size:.8rem;border-radius:999px;padding:3px 9px;background:#ecf2f6;color:#476273}
 .lv303-status.high,.lv303-status.low{color:#922d25;background:#fde6e2}
 .lv303-status.ok{color:#226544;background:#e4f5e9}
 .lv303-status.context{color:#77510a;background:#fff1d9}
 .lv303-change{font-weight:750;margin:6px 0;color:#405e70}
 .lv303-change.good{color:#16794a}.lv303-change.bad{color:#b2362b}
 .lv303-note{font-size:.79rem;color:#5b707d}
 @media(max-width:620px){#lv303-list{grid-template-columns:1fr}#laborvergleich303{padding:11px}}`;
 document.head.append(css);existing.insertAdjacentElement('afterend',panel);
 const num=x=>{if(typeof x==='number')return Number.isFinite(x)?x:null;
  const t=String(x??'').trim().replace(',','.');return /^[-+]?\d+(?:\.\d+)?$/.test(t)?Number(t):null};
 const format=x=>typeof x==='number'?x.toLocaleString('de-DE',{maximumFractionDigits:2}):String(x??'');
 const dmy=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):String(d||'');
 const range=x=>{const m=String(x||'').replace(/\s/g,'').replace(',','.').match(/^(-?\d+(?:\.\d+)?)[–-](-?\d+(?:\.\d+)?)$/);return m&&Number(m[1])<=Number(m[2])?[Number(m[1]),Number(m[2])]:null};
 const lineKey=r=>[r.marker,r.allergen||'',String(r.unit||'').toLowerCase().replace(/\s/g,'')].join('|');
 function status(r){if(r.evaluation?.label)return {label:r.evaluation.label,kind:r.evaluation.status||'context'};
  const n=num(r.value),rg=range(r.reference);
  if(n===null||!rg)return {label:'Ärztlich einordnen',kind:'context'};
  if(n<rg[0])return {label:'Unter Referenz',kind:'low'};
  if(n>rg[1])return {label:'Über Referenz',kind:'high'};
  return {label:'In Referenz',kind:'ok'};
 }
 function change(current,previous){
  if(!previous)return {text:'Noch kein Vorwert',kind:'',detail:''};
  const a=num(previous.value),b=num(current.value),unit=String(current.unit||'');
  if(a===null||b===null)return {text:'Nicht numerisch vergleichbar',kind:'',detail:''};
  if(unit!==String(previous.unit||''))return {text:'Einheiten verschieden',kind:'',detail:'Ohne gesicherte Umrechnung kein Vergleich.'};
  const delta=b-a,rel=a===0?null:100*delta/Math.abs(a),lead=delta>0?'+':'',pct=rel===null?'':' ('+(rel>0?'+':'')+format(rel)+' % relativ)';
  const result={text:lead+format(delta)+' '+unit+pct,kind:'',detail:'Zunahme oder Abnahme allein ist keine medizinische Besserung oder Verschlechterung.'};
  const r1=range(current.reference),r0=range(previous.reference);
  if(r1&&r0&&r1[0]===r0[0]&&r1[1]===r0[1]){
   const out0=a<r0[0]||a>r0[1],out1=b<r1[0]||b>r1[1];
   if(out0&&!out1){result.kind='good';result.detail='Im angegebenen Referenzbereich; keine gesicherte klinische Besserung.';}
   if(!out0&&out1){result.kind='bad';result.detail='Neu außerhalb des Referenzbereichs; mit der Arztpraxis besprechen.';}
  }else result.detail='Referenzbedingungen für einen medizinischen Vergleich nicht eindeutig.';
  return result;
 }
 let records=[],visible=[],limit=24,busy=false;
 const node=(tag,cls,t)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(t!==undefined)el.textContent=String(t);return el};
 async function refresh(){if(busy)return;busy=true;
  try{records=await SEC.list('labs');render()}catch(e){$('lv303-count').textContent='Laborwerte konnten nicht geladen werden: '+e.message}
  finally{busy=false}
 }
 function render(){const group=new Map();
  for(const r of records){const k=lineKey(r);if(!group.has(k))group.set(k,[]);group.get(k).push(r)}
  visible=[...group.values()].map(a=>{a.sort((u,v)=>String(v.date||'').localeCompare(String(u.date||'')));
   const current=a[0],previous=a.find(t=>t.date!==current.date),assessment=status(current);
   return {current,previous,assessment,delta:change(current,previous)};
  });
  const f=$('lv303-filter').value,s=$('lv303-search').value.trim().toLocaleLowerCase('de');
  visible=visible.filter(x=>{
   const r=x.current,category=String(r.category||'');
   if(f==='flags'&&!['high','low'].includes(x.assessment.kind))return false;
   if(f==='asthma'&&!/Asthma|Allergie/i.test(category)&&!['eosAbs','eosPct','ecp','igeTotal','igeSpecific'].includes(r.marker))return false;
   if(f==='gas'&&!/Blutgas|Säure-Basen/i.test(category)&&!['po2','pco2','ph','hco3','lactate'].includes(r.marker))return false;
   if(f==='changed'&&(!x.previous||num(r.value)===num(x.previous.value)))return false;
   return !s||[r.label,r.marker,r.allergen,r.category].some(v=>String(v||'').toLocaleLowerCase('de').includes(s));
  }).sort((x,y)=>{
   if(f==='all'){
    const important=new Set(['eosAbs','eosPct','ph','pco2','po2','hco3','crp','ecp','igeTotal']);
    const ix=important.has(x.current.marker)?0:1,iy=important.has(y.current.marker)?0:1;if(ix!==iy)return ix-iy;
   }
   return String(y.current.date||'').localeCompare(String(x.current.date||''));
  });
  $('lv303-count').textContent=visible.length+' verschiedene Tests gefunden';
  const list=$('lv303-list');list.replaceChildren();
  for(const {current:r,previous,assessment,delta} of visible.slice(0,limit)){
   const card=node('article','lv303-card');
   card.append(node('h4','',String(r.label||r.marker)+(r.allergen?' · '+r.allergen:'')));
   card.append(node('div','lv303-main',format(r.value)+' '+(r.unit||'')));
   card.append(node('p','lv303-meta',dmy(r.date)+(r.reference?' · Referenz '+r.reference:'')));
   card.append(node('span','lv303-status '+assessment.kind,assessment.label));
   if(previous){card.append(node('p','lv303-meta','Vorher: '+format(previous.value)+' '+(previous.unit||'')+' · '+dmy(previous.date)));card.append(node('p','lv303-change '+delta.kind,'Änderung: '+delta.text));if(delta.detail)card.append(node('p','lv303-note',delta.detail));}
   else card.append(node('p','lv303-meta','Kein älterer Wert vorhanden'));
   const detail=node('details');detail.append(node('summary','','Befunddetails'));
   if(r.evaluation?.detail)detail.append(node('p','lv303-note',r.evaluation.detail));
   if(r.notes)detail.append(node('p','lv303-note',r.notes));
   card.append(detail);list.append(card);
  }
  $('lv303-more').hidden=visible.length<=limit;
 }
 $('lv303-filter').addEventListener('change',()=>{limit=24;render()});
 $('lv303-search').addEventListener('input',()=>{limit=24;render()});
 $('lv303-more').addEventListener('click',()=>{limit+=24;render()});
 let refreshRequest=false;
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group!=='labs'||refreshRequest)return;refreshRequest=true;queueMicrotask(()=>{refreshRequest=false;refresh()})});
 refresh();
 window.ASTHMA_LAB303={status,change};
})();

/* Langzeit-Bluttestvergleich 2026 – additive Offline-Erweiterung. Keine Patientendaten im Quellcode. */
(()=>{
 'use strict';
 const S=window.ASTHMA_SECURITY,oldPanel=document.getElementById('laborvergleich303'),$=id=>document.getElementById(id);
 if(!S||!oldPanel||$('lab-compare-years'))return;
 const h=document.createElement('section');h.id='lab-compare-years';h.className='suite-subpanel';
 h.innerHTML=`<h3>Bluttests über alle Jahre vergleichen</h3>
 <p>Wähle zwei Untersuchungstage. Neue Bluttests erscheinen hier automatisch, alle älteren Untersuchungen bleiben erhalten.</p>
 <div class="lcy-dates"><label>Früherer Bluttest<select id="lcy-before"></select></label><label>Späterer Bluttest<select id="lcy-after"></select></label></div>
 <div class="lcy-actions"><button type="button" class="btn btn-outline" id="lcy-last">Die letzten zwei Bluttests</button><button type="button" class="btn btn-outline" id="lcy-all">Ersten und letzten vergleichen</button><button type="button" class="btn btn-outline" id="lcy-swap">Tage tauschen</button></div>
 <p id="lcy-info" role="status"></p>
 <div class="lcy-filters"><label>Laborwert suchen<input id="lcy-search" type="search" placeholder="z. B. CRP, Eosinophile, pCO₂" autocomplete="off"></label>
 <label>Anzeige<select id="lcy-filter"><option value="all">Alle Werte aus beiden Bluttests</option><option value="both">An beiden Tagen gemessen</option><option value="changed">Nur veränderte Zahlenwerte</option><option value="missing">Nur an einem Tag gemessen</option></select></label></div>
 <p id="lcy-count"></p><div class="lcy-results" id="lcy-results"></div>
 <button type="button" class="btn btn-outline" id="lcy-more" hidden>Weitere Blutwerte anzeigen</button>
 <p class="input-note">Veränderungen sind rein rechnerisch: Steigende oder sinkende Werte bedeuten nicht automatisch Besserung oder Verschlechterung. Verschiedene Messmethoden und Referenzbereiche müssen ärztlich eingeordnet werden. Fehlende Tests werden nicht als 0 gewertet.</p>`;
 oldPanel.insertAdjacentElement('beforebegin',h);
 const legacy=document.createElement('details');legacy.id='lcy-old-comparison';
 const lsum=document.createElement('summary');lsum.textContent='Bisherige Ansicht: Letzter Wert und Vorwert';
 legacy.append(lsum);oldPanel.insertAdjacentElement('beforebegin',legacy);legacy.append(oldPanel);
 const css=document.createElement('style');css.textContent=`
 #lab-compare-years{padding:15px;background:#f6fbff;border:1px solid #b8d8e7;border-radius:15px;margin:14px 0}
 #lab-compare-years h3{color:#183e54;margin:0 0 8px}
 .lcy-dates,.lcy-filters{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:13px 0}
 #lab-compare-years label{display:block;font-weight:600;font-size:.91rem}
 #lab-compare-years input,#lab-compare-years select{width:100%;font-size:16px;min-width:0;padding:11px 9px;border:1px solid #abc8d6;border-radius:8px;margin-top:6px;background:white}
 .lcy-actions{display:flex;gap:9px;flex-wrap:wrap;margin:12px 0}.lcy-actions button{white-space:normal}
 #lcy-info,#lcy-count{color:#526f7d;font-size:.9rem}
 .lcy-results{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:10px}
 .lcy-card{background:white;border:1px solid #d1e0e9;border-radius:12px;padding:12px;overflow-wrap:anywhere}
 .lcy-card h4{font-size:1rem;margin:0 0 10px;color:#1a4156}
 .lcy-cells{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 .lcy-cell{background:#f0f6fa;border-radius:9px;padding:9px;min-width:0}
 .lcy-cell .caption{display:block;font-size:.8rem;color:#5b707b}
 .lcy-cell strong{display:block;font-size:1.05rem;margin:5px 0;color:#1b465c;overflow-wrap:anywhere}
 .lcy-delta{font-weight:700;margin:11px 0 4px;color:#23546e;font-size:.94rem}
 .lcy-explain{color:#526d7a;font-size:.82rem;margin:6px 0}
 .lcy-card details summary{cursor:pointer;font-size:.86rem;font-weight:650;margin-top:10px}
 #lcy-old-comparison{padding:10px 0}#lcy-old-comparison>summary{cursor:pointer;font-weight:650}
 @media(max-width:620px){.lcy-dates,.lcy-filters{grid-template-columns:1fr}.lcy-results{grid-template-columns:1fr}#lab-compare-years{padding:11px}}
 `;document.head.append(css);
 const mk=(tag,text,cls)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
 const format=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:4});
 const dateText=x=>/^\d{4}-\d\d-\d\d$/.test(x||'')?x.slice(8)+'.'+x.slice(5,7)+'.'+x.slice(0,4):String(x||'');
 const number=x=>{const t=String(x??'').trim().replace(',','.');return /^[-+]?\d+(?:\.\d+)?$/.test(t)&&Number.isFinite(Number(t))?Number(t):null};
 const key=r=>[r.marker||'',String(r.allergen||'').trim().toLowerCase(),r.marker==='customTest'?String(r.label||'').trim().toLowerCase():''].join('|');
 const label=r=>String(r.label||r.marker||'Untersuchung')+(r.allergen?' · '+r.allergen:'');
 const unit=u=>String(u||'').trim().replace(/\s+/g,'').toLowerCase().replaceAll('μ','µ');
 function diff(a,b){
   if(!a||!b)return {valid:false,message:'Nur an einem der beiden Tage untersucht'};
   let va=number(a.value),vb=number(b.value);if(va===null||vb===null)return {valid:false,message:'Ein Messwert ist kein vergleichbarer Zahlenwert'};
   const ua=unit(a.unit),ub=unit(b.unit);let factor=null;
   if(ua===ub)factor=1;
   else if(a.marker==='crp'){
     const m={'mg/l':1,'mg/dl':10};if(m[ua]&&m[ub])factor=m[ua]/m[ub];
   }else if(['eosAbs','neutAbs','lymphAbs','monoAbs','basoAbs','immatureAbs','wbc','platelets'].includes(a.marker)){
     const m={'/µl':1,'zellen/µl':1,'g/l':1000,'10³/µl':1000};if(m[ua]&&m[ub])factor=m[ua]/m[ub];
   }
   if(factor===null)return {valid:false,message:'Unterschiedliche Einheiten – keine sichere Umrechnung'};
   const old=va*factor,change=vb-old;
   return {valid:true,change,percent:old?100*change/Math.abs(old):null,converted:factor!==1,unit:b.unit||''};
 }
 let rows=[],dates=[],limit=30,previousLatest='';
 const from=$('lcy-before'),to=$('lcy-after');
 function addOptions(target,wanted,fallback){
   const n=new Map();rows.forEach(r=>n.set(r.date,(n.get(r.date)||0)+1));
   target.replaceChildren();let group=null,year=null;
   for(const d of dates){if(year!==d.slice(0,4)){year=d.slice(0,4);group=mk('optgroup');group.label=year;target.append(group)}
     const option=mk('option',dateText(d)+' · '+n.get(d)+' Messwerte');option.value=d;group.append(option)}
   target.value=dates.includes(wanted)?wanted:fallback;
 }
 function buildPair(e,A,B){
   const r=e.b||e.a,card=mk('article',undefined,'lcy-card');card.append(mk('h4',label(r)));
   const grid=mk('div',undefined,'lcy-cells');
   for(const [record,date] of [[e.a,A],[e.b,B]]){
     const cell=mk('div',undefined,'lcy-cell');cell.append(mk('span',dateText(date),'caption'));
     cell.append(mk('strong',record?String(record.value).replace('.',',')+' '+String(record.unit||''):'Nicht untersucht'));
     if(record?.reference)cell.append(mk('span','Referenz: '+record.reference,'caption'));
     grid.append(cell);
   }
   card.append(grid);
   const d=diff(e.a,e.b);
   if(d.valid){
     const sign=d.change>0?'↑ +':d.change<0?'↓ ':'= ';
     const pct=d.percent===null?'':' · '+(d.percent>0?'+':'')+format(d.percent)+' %';
     card.append(mk('p','Differenz: '+sign+format(d.change)+' '+d.unit+pct,'lcy-delta'));
     if(d.converted)card.append(mk('p','Vorwert wurde für die Differenz in die Einheit des neuen Befunds umgerechnet.','lcy-explain'));
   }else card.append(mk('p',d.message,'lcy-explain'));
   const detail=mk('details');detail.append(mk('summary','Beurteilungen und Notizen'));
   for(const [rec,day] of [[e.a,'Früher'],[e.b,'Später']]){
     if(!rec)continue;
     detail.append(mk('p',day+': '+(rec.evaluation?.label||'Keine zusätzliche Bewertung'),'lcy-explain'));
     if(rec.evaluation?.detail)detail.append(mk('p',rec.evaluation.detail,'lcy-explain'));
     if(rec.notes)detail.append(mk('p','Notiz: '+rec.notes,'lcy-explain'));
   }
   card.append(detail);return card;
 }
 function render(){
   const A=from.value,B=to.value,out=$('lcy-results');out.replaceChildren();
   if(dates.length<2){$('lcy-info').textContent='Für den Vergleich werden Untersuchungen an zwei verschiedenen Tagen benötigt.';$('lcy-count').textContent='';$('lcy-more').hidden=true;return}
   if(A===B){$('lcy-info').textContent='Bitte zwei unterschiedliche Tage auswählen.';$('lcy-count').textContent='';$('lcy-more').hidden=true;return}
   const map=new Map();for(const rec of rows){if(rec.date!==A&&rec.date!==B)continue;
     const k=key(rec);if(!map.has(k))map.set(k,{a:null,b:null});
     const r=map.get(k),slot=rec.date===A?'a':'b';
     if(!r[slot]||String(rec.updatedAt||rec.createdAt||'')>String(r[slot].updatedAt||r[slot].createdAt||''))r[slot]=rec;
   }
   const total=map.size,search=$('lcy-search').value.trim().toLowerCase(),filter=$('lcy-filter').value;
   const displayed=[...map.values()].filter(e=>{
     if(filter==='both'&&(!e.a||!e.b))return false;
     if(filter==='missing'&&e.a&&e.b)return false;
     if(filter==='changed'&&(!diff(e.a,e.b).valid||Math.abs(diff(e.a,e.b).change)<1e-12))return false;
     if(!search)return true;
     return [e.a,e.b].filter(Boolean).some(r=>[r.label,r.marker,r.allergen,r.category].some(v=>String(v||'').toLowerCase().includes(search)));
   }).sort((x,y)=>label(x.b||x.a).localeCompare(label(y.b||y.a),'de'));
   $('lcy-info').textContent='Vergleich '+dateText(A)+' und '+dateText(B)+' · '+dates.length+' Untersuchungstage insgesamt ('+dateText(dates[0])+' bis '+dateText(dates[dates.length-1])+')';
   $('lcy-count').textContent=displayed.length+' von '+total+' unterschiedlichen Untersuchungen';
   displayed.slice(0,limit).forEach(e=>out.append(buildPair(e,A,B)));
   if(!displayed.length)out.append(mk('p','Keine passenden Werte gefunden.'));
   $('lcy-more').hidden=limit>=displayed.length;
 }
 async function reload(){try{
   const a=from.value,b=to.value;
   rows=(await S.list('labs')).filter(r=>/^\d{4}-\d\d-\d\d$/.test(r.date||''));
   dates=[...new Set(rows.map(r=>r.date))].sort();
   const newest=dates.at(-1)||'',auto=previousLatest&&b===previousLatest&&newest!==previousLatest&&dates.length>1;
   addOptions(from,a,dates.at(-2)||newest);addOptions(to,b,newest);
   if(auto){from.value=previousLatest;to.value=newest}
   if(dates.length>1&&from.value===to.value)from.value=dates.at(-2);
   previousLatest=newest;render();
 }catch(err){$('lcy-info').textContent='Laborwerte konnten nicht geladen werden: '+err.message}}
 $('lcy-last').addEventListener('click',()=>{if(dates.length>1){from.value=dates.at(-2);to.value=dates.at(-1);render()}});
 $('lcy-all').addEventListener('click',()=>{if(dates.length>1){from.value=dates[0];to.value=dates.at(-1);render()}});
 $('lcy-swap').addEventListener('click',()=>{const a=from.value;from.value=to.value;to.value=a;render()});
 ['lcy-before','lcy-after','lcy-filter','lcy-search'].forEach(id=>$(id).addEventListener(id==='lcy-search'?'input':'change',()=>{limit=30;render()}));
 $('lcy-more').addEventListener('click',()=>{limit+=30;render()});
 let updating=false;window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group!=='labs'||updating)return;updating=true;setTimeout(()=>{updating=false;reload()},120)});
 window.ASTHMA_LAB_LONGTERM={diff};reload();
})();

/* Asthma Webapp: Treppenzaehler fuer Arbeitsplatz und Belastungen.
   Kompatible Ein-Datei-Erweiterung. Daten bleiben im AES-GCM-Tresor als suite/stairs/*.
   Keine Netzwerkaufrufe. Bestehende Labor- und Arbeitsplatzdaten bleiben unveraendert. */
(()=>{
 'use strict';
 const S=window.ASTHMA_SECURITY;
 const work=document.getElementById('arbeit');
 const $=id=>document.getElementById(id);
 if(!work||!S?.state?.().unlocked||$('sc-work-panel'))return;
 const mk=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n;};
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
 const timeNow=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
 const printDate=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):String(d||'');
 const format=n=>Number(n||0).toLocaleString('de-DE',{maximumFractionDigits:1});
 const validDay=d=>{if(!/^\d{4}-\d\d-\d\d$/.test(d||''))return false;const test=new Date(d+'T12:00:00');return !Number.isNaN(+test)&&todayFor(test)===d;};
 const todayFor=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
 const uuid=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
 const escapeCsv=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
 const currentYear=()=>new Date().getFullYear();
 const section=mk('section','suite-subpanel');section.id='sc-work-panel';
 section.innerHTML=`
  <div class="sc-head"><div><h3>Treppenzähler</h3><p>Treppensteigen bei der Arbeit dokumentieren – wie in WorksManager. Stufen werden manuell eingetragen, nicht automatisch vom iPhone gezählt.</p></div><span class="sc-chip">Privat &amp; verschlüsselt</span></div>
  <div class="sc-stats" aria-live="polite"><div><strong id="sc-today">0</strong><small>Stufen heute</small></div><div><strong id="sc-month">0</strong><small>Stufen im Monat</small></div><div><strong id="sc-year">0</strong><small>Stufen im Jahr</small></div></div>
  <form id="sc-form" autocomplete="off">
   <div class="sc-form-grid">
    <label>Datum<input id="sc-date" type="date" required></label>
    <label>Uhrzeit<input id="sc-time" type="time" required></label>
    <label>Anzahl Stufen<input id="sc-steps" type="number" min="1" max="20000" step="1" inputmode="numeric" placeholder="z. B. 60" required></label>
    <label>Schicht<select id="sc-shift"><option value="">Nicht angegeben</option><option>Frühschicht</option><option>Spätschicht</option><option>Nachtschicht</option><option>Andere / frei</option></select></label>
    <label>Grund<select id="sc-reason"><option>Kühlanlage</option><option>Materialscheine</option><option>WC</option><option>Fertigteile runtergefahren</option><option>Verpackung geholt</option><option>Pappe geschnitten</option><option>Spangen</option><option value="__custom__">Anderer Grund – selbst eintragen</option></select></label>
    <label id="sc-reason-custom-wrap" hidden>Anderer Grund (frei eingeben)<input id="sc-reason-custom" type="text" maxlength="120" placeholder="z. B. Maschinenkontrolle"></label>
    <label>Beschwerden danach<select id="sc-symptoms"><option value="">Nicht angegeben</option><option value="0">0 – keine</option><option value="1">1 – leicht</option><option value="2">2 – mittel</option><option value="3">3 – stark</option></select></label>
    <label class="sc-wide">Notiz (optional)<textarea id="sc-note" rows="2" maxlength="500" placeholder="z. B. drei Mal zum Materiallager, Atemnot"></textarea></label>
   </div>
   <div class="sc-quick" role="group" aria-label="Stufenzahl rasch erhöhen"><span>Schnell hinzufügen:</span><button type="button" data-sc-add="30">+30</button><button type="button" data-sc-add="24">+24</button></div>
   <div class="sc-actions"><button id="sc-save" type="submit" class="btn btn-primary">Stufen speichern</button><button id="sc-cancel" type="button" class="btn btn-outline" hidden>Bearbeiten abbrechen</button></div>
  </form>
  <p id="sc-status" role="status" class="input-note"></p>
  <details id="sc-import-panel"><summary>Alte WorksManager-Treppeneinträge übernehmen</summary>
   <p>Die Daten aus deinem WorksManager-Screenshot liegen in einer separaten privaten JSON-Datei. Bitte diese Datei nur hier auf deinem iPhone auswählen, nicht bei GitHub hochladen.</p>
   <label>Private Importdatei wählen<input id="sc-import-file" type="file" accept=".json,application/json"></label>
   <div id="sc-import-preview" hidden><p id="sc-import-info" role="status"></p><button type="button" id="sc-import-confirm" class="btn btn-primary">Erkannte Einträge verschlüsselt übernehmen</button><button type="button" id="sc-import-cancel" class="btn btn-outline">Abbrechen</button></div>
   <p id="sc-import-status" role="status" class="input-note">Doppelte Einträge werden erkannt und übersprungen. Bestehende Daten werden nicht überschrieben.</p>
  </details>
  <div class="sc-lower"><h4>Einträge und Auswertung</h4><label>Ansicht<select id="sc-view"><option value="month">Aktueller Monat</option><option value="year">Ganzes Jahr</option><option value="all">Alle Jahre</option></select></label></div>
  <div class="sc-substats" id="sc-summary"></div><div id="sc-list" class="sc-list"></div><button id="sc-more" type="button" class="btn btn-outline" hidden>Weitere Einträge anzeigen</button>
  <details id="sc-annual"><summary>Jahresübersicht und Monatsstatistik</summary><div class="sc-annual-head"><label>Jahr auswählen<select id="sc-report-year"></select></label><button type="button" class="btn btn-outline" id="sc-print">Jahresbericht drucken / PDF</button></div><div id="sc-monthtable"></div></details>
  <button type="button" id="sc-export" class="btn btn-outline">Alle Treppeneinträge als CSV exportieren</button>
  <p class="input-note">Die Zahlen beruhen auf deinen Eingaben und sind kein medizinischer Belastungstest. Bei akuter deutlicher Atemnot die Belastung unterbrechen und den ärztlichen Notfallplan befolgen.</p>`;
 const form=$('work-form');
 if(form?.parentElement)form.parentElement.insertAdjacentElement('beforebegin',section);
 else work.append(section);
 const css=mk('style');css.textContent=`
 #sc-work-panel{border:1px solid #c8dde8;border-radius:18px;padding:18px;background:#f5fbff;margin:14px 0 24px}
 #sc-work-panel .sc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
 #sc-work-panel .sc-head h3{margin:0 0 6px;font-size:1.2rem;color:#183e53}
 #sc-work-panel .sc-head p{margin:0 0 12px;color:#557383;font-size:.91rem;line-height:1.5}
 #sc-work-panel .sc-chip{font-size:.72rem;color:#17566a;background:#dff4f8;padding:6px 9px;border-radius:30px;white-space:nowrap}
 #sc-work-panel .sc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:8px 0 19px}
 #sc-work-panel .sc-stats>div{border-radius:12px;padding:13px 8px;text-align:center;background:#fff;border:1px solid #d9e8ef;min-width:0}
 #sc-work-panel .sc-stats strong{display:block;color:#0e607b;font-size:1.5rem;line-height:1.15;overflow-wrap:anywhere}
 #sc-work-panel .sc-stats small{display:block;font-size:.78rem;color:#506a79;margin-top:7px}
 #sc-work-panel .sc-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
 #sc-reason-custom-wrap[hidden]{display:none!important}
 #sc-work-panel .sc-reasons-tip{font-size:.8rem;color:#507184}
 #sc-work-panel label{display:block;font-size:.89rem;color:#375766;font-weight:700}
 #sc-work-panel input,#sc-work-panel select,#sc-work-panel textarea{display:block;width:100%;min-width:0;box-sizing:border-box;font-size:16px;border:1px solid #bad0dc;border-radius:10px;padding:11px 10px;background:white;color:#183f52;margin-top:5px}
 #sc-work-panel .sc-wide{grid-column:1/-1}
 #sc-work-panel .sc-quick{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin:14px 0}
 #sc-work-panel .sc-quick span{font-size:.84rem;color:#587383;margin-right:4px}
 #sc-work-panel .sc-quick button{border:1px solid #a5cbd9;border-radius:9px;background:#e9f7fb;color:#115a73;font-weight:750;min-width:51px;min-height:41px;padding:6px 10px;font-size:1rem}
 #sc-work-panel .sc-actions{display:flex;gap:8px;flex-wrap:wrap;margin:9px 0}
 #sc-import-panel{margin:16px 0;padding:11px 13px;border:1px solid #bfdbe7;border-radius:11px;background:#fff}
 #sc-import-panel>summary{cursor:pointer;color:#184e68;font-weight:750}
 #sc-import-panel p{font-size:.89rem;color:#506f80;line-height:1.48}
 #sc-import-panel .btn{margin:5px 6px 5px 0;white-space:normal}
 #sc-import-panel #sc-import-file{font-size:16px}
 #sc-work-panel .sc-lower{display:flex;justify-content:space-between;align-items:end;flex-wrap:wrap;gap:10px;border-top:1px solid #d2e3eb;padding-top:15px;margin-top:16px}
 #sc-work-panel .sc-lower h4{margin:0;color:#234658}#sc-work-panel .sc-lower select{min-width:170px}
 #sc-work-panel .sc-substats{display:flex;flex-wrap:wrap;gap:8px;color:#506a78;font-size:.88rem;margin:14px 0}
 #sc-work-panel .sc-substats span{padding:8px 10px;border-radius:8px;background:#e8f3f8}
 #sc-work-panel .sc-entry{border:1px solid #d2e4ec;background:#fff;border-radius:11px;padding:11px 12px;margin:8px 0}
 #sc-work-panel .sc-entry-top{display:flex;justify-content:space-between;gap:7px;align-items:center}
 #sc-work-panel .sc-entry strong{color:#184b62}#sc-work-panel .sc-entry small{display:block;color:#607885;margin:5px 0}
 #sc-work-panel .sc-entry p{margin:5px 0;color:#435f6d;overflow-wrap:anywhere}
 #sc-work-panel .sc-entry-actions{display:flex;gap:7px;flex-wrap:wrap}
 #sc-work-panel .sc-entry-actions button{border:1px solid #d0e2eb;border-radius:8px;background:white;color:#245d75;padding:6px 10px;min-height:38px;font-size:.86rem}
 #sc-work-panel #sc-annual{margin:17px 0;padding:12px;border:1px solid #d0e3ea;border-radius:11px;background:white}
 #sc-work-panel #sc-annual>summary{font-weight:750;color:#284f64;cursor:pointer}
 #sc-work-panel .sc-annual-head{display:flex;justify-content:space-between;align-items:end;gap:10px;flex-wrap:wrap;margin:13px 0}
 #sc-work-panel .sc-table{width:100%;border-collapse:collapse;font-size:.87rem}
 #sc-work-panel .sc-table td,#sc-work-panel .sc-table th{border-bottom:1px solid #e1ecf0;padding:8px 5px;text-align:left}
 #sc-work-panel .sc-table th{color:#3d6375}
 #sc-home-tile{margin:12px auto;padding:12px 16px;max-width:1040px;border-radius:13px;border:1px solid #b4d8e5;background:#f0faff;display:flex;justify-content:space-between;align-items:center;gap:12px}
 #sc-home-tile strong{display:block;color:#155c76;font-size:1.3rem}#sc-home-tile span{display:block;color:#587080;font-size:.82rem}
 #sc-home-tile button{min-height:43px;border-radius:8px;border:1px solid #a2cad8;background:white;padding:9px 14px;color:#18546a;font-weight:750}
 #sc-report{display:none}
 @media(max-width:580px){#sc-work-panel{padding:12px}#sc-work-panel .sc-chip{white-space:normal;text-align:center}#sc-work-panel .sc-stats strong{font-size:1.2rem}#sc-work-panel .sc-stats small{font-size:.7rem}#sc-work-panel .sc-form-grid{grid-template-columns:1fr}#sc-home-tile{margin:10px 8px}}
 @media print{body.sc-print-active>*:not(#sc-report){display:none!important}body.sc-print-active #sc-report{display:block!important;background:white!important;color:black!important;padding:9mm;font-size:10pt}#sc-report table{border-collapse:collapse;width:100%;margin:10px 0}#sc-report td,#sc-report th{border:1px solid #aaa;padding:4px;text-align:left}#sc-report h1{font-size:18pt}#sc-report h2{font-size:13pt;margin:16px 0 7px}#sc-report tr{break-inside:avoid}}
 `;
 document.head.append(css);
 const home=$('start');let tile=null;
 if(home){tile=mk('div');tile.id='sc-home-tile';tile.innerHTML='<div><strong id="sc-home-total">0 Stufen heute</strong><span>Treppenzähler · Arbeitsplatz</span></div><button type="button" id="sc-home-open">Stufen erfassen</button>';
  const slot=home.querySelector('.hero-content');if(slot)slot.insertAdjacentElement('afterend',tile);else home.append(tile);
  $('sc-home-open').addEventListener('click',()=>{if(window.ASTHMA_NAV?.go)window.ASTHMA_NAV.go('arbeit');else document.querySelector('[data-goto="arbeit"]')?.click();setTimeout(()=>$('sc-steps')?.focus({preventScroll:false}),150);});
 }
 const ystats=(arr)=>{const unique=new Set(arr.map(r=>r.date));return {sum:arr.reduce((n,r)=>n+r.steps,0),count:arr.length,days:unique.size,average:unique.size?arr.reduce((n,r)=>n+r.steps,0)/unique.size:0};};
 let rows=[],editingId=null,shown=30,loading=false;
 const select=$('sc-view'),yearPicker=$('sc-report-year'),status=$('sc-status');
 const setStatus=(message,error=false)=>{status.textContent=message;status.style.color=error?'#a53f35':'#23704c';};
 const reasonPicker=$('sc-reason'),customReason=$('sc-reason-custom'),customReasonWrap=$('sc-reason-custom-wrap');
 const reasonOptions=[...reasonPicker.options].map(o=>o.value);
 function syncReason(){const custom=reasonPicker.value==='__custom__';customReasonWrap.hidden=!custom;customReason.required=custom;if(!custom)customReason.value='';}
 reasonPicker.addEventListener('change',syncReason);
 const clearForm=()=>{editingId=null;$('sc-form').reset();$('sc-date').value=today();$('sc-time').value=timeNow();syncReason();$('sc-save').textContent='Stufen speichern';$('sc-cancel').hidden=true;};
 clearForm();
 // Optional shift choice matches the existing workplace form by default.
 const shift=$('work-shift');if(shift&&[...$('sc-shift').options].some(x=>x.value===shift.value))$('sc-shift').value=shift.value;
 for(const b of section.querySelectorAll('[data-sc-add]'))b.addEventListener('click',()=>{const n=$('sc-steps'),add=Number(b.dataset.scAdd),v=Number(n.value)||0;n.value=String(Math.min(20000,Math.max(0,v)+add));n.focus();});
 $('sc-cancel').addEventListener('click',()=>{clearForm();setStatus('Bearbeitung abgebrochen.')});
 function validate(){const date=$('sc-date').value,time=$('sc-time').value,steps=Number($('sc-steps').value);
  if(!validDay(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!Number.isInteger(steps)||steps<1||steps>20000)throw Error('Datum, Uhrzeit oder Stufenanzahl ungültig. Bitte 1–20.000 Stufen eingeben.');
  const reason=reasonPicker.value==='__custom__'?customReason.value.trim().slice(0,120):reasonPicker.value;
  if(!reason)throw Error('Bitte einen Grund auswählen oder den anderen Grund eintragen.');
  return {date,time,steps,shift:$('sc-shift').value,reason,symptoms:$('sc-symptoms').value,note:$('sc-note').value.trim().slice(0,500)};}
 $('sc-form').addEventListener('submit',async e=>{e.preventDefault();const b=$('sc-save');if(b.disabled)return;
  let data;try{data=validate()}catch(err){setStatus(err.message,true);return}
  b.disabled=true;
  try{const older=editingId?rows.find(x=>x.id===editingId):null;
   const item={id:older?.id||uuid(),...data,createdAt:older?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
   await S.put('suite',{key:'stairs/'+item.id,type:'stairs',value:item},'stairs/'+item.id);
   clearForm();setStatus(older?'Treppeneintrag geändert und verschlüsselt gespeichert.':'Treppeneintrag verschlüsselt gespeichert.');await reload();
  }catch(err){setStatus('Speichern fehlgeschlagen: '+err.message,true)}finally{b.disabled=false}
 });
 const del=async id=>{if(!confirm('Diesen Treppeneintrag dauerhaft löschen?'))return;
  try{await S.del('suite','stairs/'+id);if(editingId===id)clearForm();setStatus('Treppeneintrag gelöscht.');await reload()}
  catch(err){setStatus('Löschen fehlgeschlagen: '+err.message,true)};
 };
 const edit=item=>{$('sc-date').value=item.date;$('sc-time').value=item.time;$('sc-steps').value=item.steps;$('sc-shift').value=item.shift;
  reasonPicker.value=reasonOptions.includes(item.reason)?item.reason:'__custom__';syncReason();
  if(reasonPicker.value==='__custom__')customReason.value=item.reason||'';
  $('sc-symptoms').value=item.symptoms??'';$('sc-note').value=item.note??'';
  editingId=item.id;$('sc-save').textContent='Änderung speichern';$('sc-cancel').hidden=false;setStatus('Du bearbeitest den Eintrag vom '+printDate(item.date)+'.');section.scrollIntoView({behavior:'smooth',block:'start'});
 };
 function render(){
  const now=today(),month=now.slice(0,7),year=now.slice(0,4);
  const t=ystats(rows.filter(r=>r.date===now)).sum,m=ystats(rows.filter(r=>r.date.startsWith(month))).sum,y=ystats(rows.filter(r=>r.date.startsWith(year))).sum;
  $('sc-today').textContent=format(t);$('sc-month').textContent=format(m);$('sc-year').textContent=format(y);
  if(tile)$('sc-home-total').textContent=format(t)+' Stufen heute';
  const period=select.value,subset=rows.filter(r=>period==='all'||(period==='month'?r.date.startsWith(month):r.date.startsWith(year)));
  const stats=ystats(subset),sum=$('sc-summary');sum.replaceChildren();
  for(const [a,v] of [['Stufen',stats.sum],['Einträge',stats.count],['Aktive Tage',stats.days],['Ø je aktivem Tag',stats.average]])sum.append(mk('span',null,a+': '+format(v)));
  const list=$('sc-list');list.replaceChildren();
  if(!subset.length)list.append(mk('p','input-note','Noch keine Treppeneinträge für diesen Zeitraum.'));
  subset.slice(0,shown).forEach(r=>{const card=mk('article','sc-entry'),top=mk('div','sc-entry-top');
   top.append(mk('strong',null,format(r.steps)+' Stufen'));top.append(mk('span',null,printDate(r.date)+' · '+r.time+' Uhr'));
   card.append(top,mk('small',null,[r.shift,r.reason,r.symptoms===''?'':'Beschwerden '+r.symptoms+'/3'].filter(Boolean).join(' · ')));
   if(r.note)card.append(mk('p',null,r.note));
   const actions=mk('div','sc-entry-actions');const e=mk('button',null,'Bearbeiten'),d=mk('button',null,'Löschen');e.type='button';d.type='button';e.addEventListener('click',()=>edit(r));d.addEventListener('click',()=>del(r.id));actions.append(e,d);card.append(actions);list.append(card);
  });
  $('sc-more').hidden=subset.length<=shown;
  const possible=[...new Set([currentYear(),...rows.map(r=>Number(r.date.slice(0,4))).filter(n=>Number.isInteger(n))])].sort((a,b)=>b-a);
  const selected=Number(yearPicker.value)||currentYear();yearPicker.replaceChildren();possible.forEach(y=>{const opt=mk('option',null,String(y));opt.value=String(y);yearPicker.append(opt)});yearPicker.value=possible.includes(selected)?String(selected):String(currentYear());
  renderYear();
 }
 function monthsOf(year){const months=[];for(let i=1;i<=12;i++){const mm=String(i).padStart(2,'0');const items=rows.filter(r=>r.date.startsWith(year+'-'+mm));months.push({month:i,items,...ystats(items)})}return months;}
 function renderYear(){const year=yearPicker.value,months=monthsOf(year),target=$('sc-monthtable');target.replaceChildren();const table=mk('table','sc-table');
  const header=mk('tr');for(const x of ['Monat','Stufen','Einträge','Aktive Tage'])header.append(mk('th',null,x));table.append(header);
  months.forEach(m=>{const tr=mk('tr');tr.append(mk('td',null,new Date(Number(year),m.month-1,1).toLocaleString('de-DE',{month:'long'})),mk('td',null,format(m.sum)),mk('td',null,m.count),mk('td',null,m.days));table.append(tr)});
  const all=months.flatMap(m=>m.items),st=ystats(all);const tr=mk('tr');for(const x of ['Gesamt',format(st.sum),String(st.count),String(st.days)])tr.append(mk('th',null,x));table.append(tr);target.append(table);
  target.append(mk('p','input-note','Durchschnitt pro aktivem Tag: '+format(st.average)+' Stufen.'));
 }
 $('sc-view').addEventListener('change',()=>{shown=30;render()});$('sc-more').addEventListener('click',()=>{shown+=30;render()});yearPicker.addEventListener('change',renderYear);
 $('sc-export').addEventListener('click',()=>{if(!rows.length){setStatus('Noch keine Treppeneinträge vorhanden.',true);return}
  if(!confirm('CSV-Datei mit persönlichen Gesundheits- und Arbeitsplatzdaten unverschlüsselt exportieren?'))return;
  const header=['Datum','Uhrzeit','Stufen','Schicht','Grund','Beschwerden 0-3','Notiz'];
  const lines=[header,...rows.map(r=>[r.date,r.time,r.steps,r.shift,r.reason,r.symptoms,r.note])];
  const csv='\ufeff'+lines.map(x=>x.map(escapeCsv).join(';')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=mk('a');a.href=url;a.download='Asthma_Treppen_Alle_Jahre.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),20000);setStatus('CSV-Datei erstellt. Sie ist nicht verschlüsselt.');
 });
 $('sc-print').addEventListener('click',()=>{if(!confirm('Der Jahresbericht enthält möglicherweise persönliche Gesundheitsdaten. Als unverschlüsselten Ausdruck/PDF erstellen?'))return;
  const year=yearPicker.value,mths=monthsOf(year),period=rows.filter(r=>r.date.startsWith(year)).slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const report=$('sc-report')||mk('section');report.id='sc-report';report.replaceChildren();
  report.append(mk('h1',null,'Asthma – Treppenzähler '+year),mk('p',null,'Erstellt am '+new Date().toLocaleString('de-DE')+' · Privat / Gesundheitsakte'));
  const st=ystats(period);report.append(mk('p',null,'Gesamt: '+format(st.sum)+' Stufen · '+st.count+' Einträge · '+st.days+' aktive Tage · Ø '+format(st.average)+' Stufen je aktivem Tag'));
  const table=(heads,lines)=>{const t=mk('table'),tr=mk('tr');heads.forEach(h=>tr.append(mk('th',null,h)));t.append(tr);lines.forEach(line=>{const row=mk('tr');line.forEach(x=>row.append(mk('td',null,String(x??''))));t.append(row)});return t;};
  report.append(mk('h2',null,'Monatsübersicht'),table(['Monat','Stufen','Einträge','Aktive Tage'],mths.map(m=>[new Date(Number(year),m.month-1,1).toLocaleString('de-DE',{month:'long'}),format(m.sum),m.count,m.days])));
  const byReason=new Map(),byShift=new Map();for(const row of period){const reason=row.reason||'Ohne Angabe',shift=row.shift||'Ohne Angabe';byReason.set(reason,(byReason.get(reason)||0)+row.steps);byShift.set(shift,(byShift.get(shift)||0)+row.steps);}
  report.append(mk('h2',null,'Stufen nach Grund'),table(['Grund','Stufen'],[...byReason].sort((a,b)=>b[1]-a[1]).map(([name,total])=>[name,format(total)])));
  report.append(mk('h2',null,'Stufen nach Schicht'),table(['Schicht','Stufen'],[...byShift].sort((a,b)=>b[1]-a[1]).map(([name,total])=>[name,format(total)])));
  report.append(mk('h2',null,'Einzelne Einträge'),table(['Datum','Zeit','Stufen','Schicht','Grund','Beschwerden','Notiz'],period.map(r=>[printDate(r.date),r.time,r.steps,r.shift,r.reason,r.symptoms,r.note])));
  document.body.append(report);document.body.classList.add('sc-print-active');
  const clean=()=>{document.body.classList.remove('sc-print-active');report.remove()};window.addEventListener('afterprint',clean,{once:true});
  try{window.print()}finally{setTimeout(clean,16000)};
 });
 let refreshing=false;
 async function reload(){if(loading)return;loading=true;
  try{const items=await S.list('suite');rows=items.filter(x=>x.type==='stairs'&&x.value&&/^\d{4}-\d\d-\d\d$/.test(x.value.date||'')&&Number.isInteger(Number(x.value.steps))&&Number(x.value.steps)>0).map(x=>({...x.value,steps:Number(x.value.steps)}))
   .sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));render();}
  catch(err){setStatus('Treppeneinträge konnten nicht geladen werden: '+err.message,true)}finally{loading=false}
 }
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group!=='suite'||refreshing)return;refreshing=true;setTimeout(()=>{refreshing=false;reload()},130)});
 // Update Tageswerte beim Wiederöffnen der App nach Datumswechsel.
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(!editingId){$('sc-date').value=today();$('sc-time').value=timeNow()}reload()}});
 reload();
 window.ASTHMA_STAIRS={refresh:reload};
})();


/* Asthma 3.0.6: Erweiterte Monats-/Jahresstatistik. Ergänzung, kein Überschreiben.
   Vollständig lokal: verschlüsselte Messwerte nur im Browser nach Tresor-Entsperrung.
   Stufen, vollständige Laborwerte, Laborverläufe und Datenvollständigkeit. */
(()=>{
 'use strict';
 const S=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);
 if(!S?.state?.().unlocked||!$('stats25-report')||$('stats306-settings'))return;
 const make=(tag,cls,content)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(content!==undefined)x.textContent=String(content);return x;};
 const clean=x=>String(x??'').trim();
 const format=n=>Number(n).toLocaleString('de-DE',{maximumFractionDigits:2});
 const numeric=x=>{const v=clean(x).replace(',','.');return /^[-+]?\d+(?:\.\d+)?$/.test(v)&&Number.isFinite(Number(v))?Number(v):null;};
 const dayText=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):clean(d);
 const allowedDay=d=>/^\d{4}-\d\d-\d\d$/.test(d||'');
 const sameGroup=r=>[r.marker||r.label||'Ohne Name',clean(r.allergen).toLowerCase(),clean(r.unit).toLowerCase().replace(/\s+/g,'')].join('|');
 const name=r=>clean(r.label||r.marker||'Unbekannter Laborwert')+(r.allergen?' · '+r.allergen:'');
 const warn=msg=>{const p=make('p','stats25-muted',msg);p.style.color='#875b24';return p};
 const ctrl=make('fieldset','suite-subpanel');ctrl.id='stats306-settings';
 ctrl.style.cssText='margin-top:12px;padding:12px;border:1px solid #abcbd9;border-radius:12px';
 ctrl.append(make('legend',null,'Neue Berichtsteile – Monats- und Jahresstatistik'));
 const choices=[['stair','Treppen mit Gründen, Schichten, Tagen und Monatstabelle'],['lab','Alle Blutwerte mit Datum, Referenz, Beurteilung und Verlauf'],['coverage','Übersicht aller wichtigen gespeicherten Gesundheitsbereiche']];
 const checks={};for(const [id,label] of choices){const item=make('label');item.style.cssText='display:flex;align-items:flex-start;gap:9px;margin:8px 0';
  const input=make('input');input.type='checkbox';input.checked=true;input.id='stats306-check-'+id;input.style.flex='0 0 auto';checks[id]=input;
  item.append(input,make('span',null,label));ctrl.append(item);
 }
 ctrl.append(make('p','input-note','Vor dem Erstellen auswählen. Die bisherigen Statistikseiten und Diagramme bleiben unverändert. PDF/Druck sind unverschlüsselt.'));
 const buildBtn=$('stats25-build');buildBtn.parentNode.insertBefore(ctrl,buildBtn);
 function section(report,title){const x=make('section','stats25-section');x.dataset.stats306='true';x.append(make('h3',null,title));report.append(x);return x;}
 function metric(parent,label,value){const p=make('div','stats25-line');p.append(make('span',null,label),make('strong',null,value));parent.append(p)}
 function table(parent,columns,rows){const t=make('table');t.style.cssText='width:100%;border-collapse:collapse;font-size:.83rem;table-layout:auto';
  const head=make('tr');for(const label of columns){const th=make('th',null,label);th.style.cssText='text-align:left;border-bottom:2px solid #b9d8e3;padding:5px 4px;overflow-wrap:anywhere';head.append(th)}t.append(head);
  for(const values of rows){const tr=make('tr');for(const cell of values){const td=make('td',null,cell);td.style.cssText='vertical-align:top;border-bottom:1px solid #e0ebef;padding:5px 4px;overflow-wrap:anywhere';tr.append(td)}t.append(tr)}parent.append(t);
 }
 const byType=(suite,type,r)=>suite.filter(x=>x.type===type&&x.value&&allowedDay(x.value.date)&&x.value.date>=r.from&&x.value.date<=r.to).map(x=>x.value);
 const sum=arr=>arr.reduce((n,x)=>n+Number(x.steps||0),0);
 const byReason=rows=>{const map=new Map();for(const r of rows){const k=clean(r.reason)||'Ohne Angabe';const v=map.get(k)||{reason:k,steps:0,records:0};v.steps+=Number(r.steps||0);v.records++;map.set(k,v)}return [...map.values()].sort((a,b)=>b.steps-a.steps||a.reason.localeCompare(b.reason,'de'))};
 function stairs(report,records,r){const box=section(report,'Treppenzähler – Arbeitsbelastung');
  const rows=records.filter(x=>allowedDay(x.date)&&x.date>=r.from&&x.date<=r.to&&Number.isInteger(Number(x.steps))&&Number(x.steps)>0);
  const days=new Set(rows.map(x=>x.date)),count=sum(rows),d=days.size;
  metric(box,'Stufen im Zeitraum',format(count));metric(box,'Einträge',String(rows.length));metric(box,'Tage mit erfassten Stufen',String(d));
  metric(box,'Ø Stufen an Tagen mit Einträgen',d?format(count/d):'Keine Messung');
  if(!rows.length){box.append(make('p','stats25-muted','Noch keine Treppen für diesen Zeitraum erfasst. Nicht erfasste Tage gelten nicht als 0-Stufen-Tage.'));return}
  box.append(make('h4',null,'Stufen nach Grund'));
  table(box,['Grund','Stufen','Einträge'],byReason(rows).map(a=>[a.reason,format(a.steps),String(a.records)]));
  const shifts=new Map();for(const x of rows){const k=x.shift||'Ohne Schichtangabe';shifts.set(k,(shifts.get(k)||0)+Number(x.steps))}
  box.append(make('h4',null,'Stufen nach Schicht'));
  table(box,['Schicht','Stufen'],[...shifts].sort((a,b)=>b[1]-a[1]).map(([a,b])=>[a,format(b)]));
  const symptomCounts=[0,0,0,0];let unknown=0;for(const x of rows){const n=Number(x.symptoms);if(x.symptoms===''||x.symptoms==null||!Number.isInteger(n)||n<0||n>3)unknown++;else symptomCounts[n]++}
  metric(box,'Beschwerden 0/1/2/3 – Anzahl Einträge',symptomCounts.join(' / '));metric(box,'Beschwerden nicht angegeben',String(unknown));
  if(r.mode==='year'){
   box.append(make('h4',null,'Monatsvergleich der Stufen'));
   const months=Array.from({length:12},(_,i)=>{const mm=String(i+1).padStart(2,'0'),arr=rows.filter(x=>x.date.slice(5,7)===mm),active=new Set(arr.map(x=>x.date)).size;
    return [new Date(Number(r.key),i,1).toLocaleDateString('de-DE',{month:'long'}),format(sum(arr)),String(arr.length),String(active)]});
   table(box,['Monat','Stufen','Einträge','Tage'],months);
  }else{
   box.append(make('h4',null,'Tagesübersicht'));
   const daysList=[...new Set(rows.map(x=>x.date))].sort();
   table(box,['Datum','Stufen','Einträge'],daysList.map(date=>[dayText(date),format(sum(rows.filter(x=>x.date===date))),String(rows.filter(x=>x.date===date).length)]));
  }
  box.append(make('p','stats25-muted','Manuelle Eintragungen. Aus den Stufen allein lässt sich keine Gehstrecke, Belastungsintensität oder medizinische Diagnose ableiten.'));
 }
 const markerName=x=>/^[A-Za-z0-9_-]{1,64}$/.test(x||'')?x:'Messwert';
 function miniChart(parent,records,key,measureName){
  const points=records.filter(x=>sameGroup(x)===key&&numeric(x.value)!==null).sort((a,b)=>a.date.localeCompare(b.date));
  if(points.length<2||new Set(points.map(x=>x.date)).size<2)return;
  const data=points.length>120?points.filter((r,i)=>i===0||i===points.length-1||i%Math.ceil(points.length/120)===0):points;
  const vals=data.map(x=>numeric(x.value)),rawLo=Math.min(...vals),rawHi=Math.max(...vals),padding=Math.max((rawHi-rawLo)*.14,Math.abs(rawHi)*.025,0.01);
  const lo=rawLo-padding,hi=rawHi+padding,W=660,H=202,L=67,R=20,T=32,B=40;
  const d0=Date.parse(data[0].date+'T12:00:00'),d1=Date.parse(data[data.length-1].date+'T12:00:00'),width=W-L-R;
  const x=r=>L+width*(d1===d0?0.5:(Date.parse(r.date+'T12:00:00')-d0)/(d1-d0));
  const y=n=>T+(H-T-B)*(hi-n)/(hi-lo);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 '+W+' '+H);
  svg.setAttribute('role','img');svg.setAttribute('aria-label','Verlauf '+measureName);
  const add=(type,props,txt)=>{const z=document.createElementNS('http://www.w3.org/2000/svg',type);for(const [k,v] of Object.entries(props))z.setAttribute(k,String(v));if(txt!==undefined)z.textContent=String(txt);svg.append(z);return z};
  add('text',{x:L,y:18,'font-size':12,'font-weight':700,fill:'#255364'},measureName+' ('+(data[0].unit||'ohne Einheit')+')');
  for(let i=0;i<4;i++){const v=lo+(hi-lo)*i/3,yy=y(v);
   add('line',{x1:L,y1:yy,x2:W-R,y2:yy,stroke:'#dce8ee','stroke-width':1});add('text',{x:L-5,y:yy+3,'text-anchor':'end','font-size':10,fill:'#54707f'},format(v));}
  add('polyline',{points:data.map(r=>x(r)+','+y(numeric(r.value))).join(' '),fill:'none',stroke:'#2782a0','stroke-width':2.4});
  for(const rec of data){add('circle',{cx:x(rec),cy:y(numeric(rec.value)),r:3,fill:'#217c98'});}
  add('text',{x:L,y:H-12,'font-size':10,fill:'#5c7481'},dayText(data[0].date));
  add('text',{x:W-R,y:H-12,'text-anchor':'end','font-size':10,fill:'#5c7481'},dayText(data.at(-1).date));
  parent.append(svg);
  const a=points[0],b=points.at(-1),va=numeric(a.value),vb=numeric(b.value),difference=vb-va;
  parent.append(make('p','stats25-muted','Erster Wert '+format(va)+' · Letzter Wert '+format(vb)+' · Veränderung '+(difference>0?'+':'')+format(difference)+' '+(b.unit||'')+(va?' ('+(difference>0?'+':'')+format(difference/Math.abs(va)*100)+' %)':'')));
 }
 function labs(report,labs,r){const box=section(report,'Labor – vollständige Werte und Befunde');
  const records=labs.filter(x=>allowedDay(x.date)&&x.date>=r.from&&x.date<=r.to).slice().sort((a,b)=>a.date.localeCompare(b.date)||name(a).localeCompare(name(b),'de'));
  metric(box,'Dokumentierte Laborwerte im Zeitraum',String(records.length));
  metric(box,'Labor-Untersuchungstage',String(new Set(records.map(x=>x.date)).size));
  metric(box,'Verschiedene Labortests',String(new Set(records.map(sameGroup)).size));
  if(!records.length){box.append(make('p','stats25-muted','Für den ausgewählten Zeitraum sind keine Laborwerte gespeichert.'));return}
  // Every row is preserved without silent truncation; the user controls which period is printed.
  box.append(make('h4',null,'Alle Einzelwerte – vollständig, mit Einheiten und ärztlicher Beurteilung'));
  const rows=records.map(x=>[dayText(x.date),name(x),clean(x.value)+' '+clean(x.unit),clean(x.reference)||'–',
   clean(x.evaluation?.label||x.assessment||'Ohne gesonderte Bewertung')+(x.evaluation?.detail?' · '+clean(x.evaluation.detail):'')+(x.notes?' · '+clean(x.notes):'')]);
  table(box,['Datum','Laborwert','Ergebnis','Referenz','Beurteilung / Notiz'],rows);
  box.append(make('h4',null,'Verlaufsdiagramme zu mehrfach gemessenen Blutwerten'));
  const groups=new Map();for(const p of records){const k=sameGroup(p);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(p)}
  const plotted=[...groups.entries()].filter(([k,rs])=>rs.filter(p=>numeric(p.value)!==null).length>1&&new Set(rs.filter(p=>numeric(p.value)!==null).map(p=>p.date)).size>1);
  plotted.sort((a,b)=>{const priority=['eosAbs','ecp','igeTotal','crp','ph','pco2','po2','hco3','hb','wbc','creatinine'];const ra=priority.indexOf(a[1][0].marker),rb=priority.indexOf(b[1][0].marker);return (ra<0?99:ra)-(rb<0?99:rb)||name(a[1][0]).localeCompare(name(b[1][0]),'de')});
  for(const [key,items] of plotted)miniChart(box,records,key,name(items[0]));
  if(!plotted.length)box.append(make('p','stats25-muted','Keine Laborwerte mit mindestens zwei Messdaten und gleichen Einheiten im gewählten Zeitraum.'));
  box.append(make('p','stats25-muted','Laborreferenzen und Einordnung stammen aus den gespeicherten Befunden. Unterschiedliche Probenarten, Messmethoden, Medikamente und fehlende Messungen können die Vergleichbarkeit beeinflussen. Keine automatisierte Diagnose.'));
 }
 function coverage(report,all,r){const box=section(report,'Datenvollständigkeit – wichtige Gesundheitsbereiche');
  const {suite,epef,labs,diary,calendar,au,documents,cases}=all;
  const inside=d=>allowedDay(d)&&d>=r.from&&d<=r.to;
  const kind=(t)=>suite.filter(x=>x.type===t&&inside(x.value?.date)).length;
  const currentMeds=suite.filter(x=>x.type==='meds').length;
  const aulist=au.filter(x=>(x.from||'')<=r.to&&(x.to||'')>=r.from);
  const lines=[
   ['Treppen / Arbeitswege',kind('stairs'),'Einzelne dokumentierte Treppenwege'],
   ['Blutwerte',labs.filter(x=>inside(x.date)).length,'Alle bekannten einzelnen Laborwerte'],
   ['Lungenfunktion (ärztlich)',kind('measurements'),'Spirometrie / gespeicherte Befunde'],
   ['Peak-Flow / Hand-FEV₁',epef.filter(x=>x.kind==='measurement'&&inside(x.date)).length,'Messungen aus ePEF'],
   ['SpO₂',suite.filter(x=>x.type==='vital29'&&x.value?.kind==='spo2'&&inside(x.value.date)).length,'Dokumentierte Sauerstoffsättigung'],
   ['Blutdruck',suite.filter(x=>x.type==='vital29'&&x.value?.kind==='bp'&&inside(x.value.date)).length,'Dokumentierte Blutdruckmessungen'],
   ['Puls',suite.filter(x=>x.type==='vital29'&&x.value?.kind==='pulse'&&inside(x.value.date)).length,'Dokumentierte Pulsmessungen'],
   ['Gewicht',kind('weight292'),'Datierte Gewichtseinträge'],
   ['Asthma-Tagebuch',diary.filter(x=>inside(x.date)).length,'Symptome und dokumentierte Bedarfsanwendungen'],
   ['Arbeitsbelastungen',kind('work'),'Hitze / Staub / sonstige Arbeitsplatzbelastungen'],
   ['Arbeitsunfähigkeit (Asthma)',aulist.length,'Bescheinigungen mit Zeitraumüberschneidung'],
   ['Kalender / PhysioSport',calendar.filter(x=>inside(x.date)).length,'Alle gespeicherten Kalendertermine'],
   ['Dokumente',documents.filter(x=>inside(clean(x.date||x.createdAt).slice(0,10))).length,'Im Berichtszeitraum datierte Dokumente'],
   ['Anträge',cases.filter(x=>inside(x.submittedOn)).length,'Eingereichte Anträge'],
   ['Medikamentenplan',currentMeds,'Aktueller Medikamentenbestand, kein Einnahmenachweis']
  ];
  table(box,['Bereich','Einträge','Hinweis'],lines.map(([a,b,c])=>[a,String(b),c]));
  box.append(make('p','stats25-muted','0 bedeutet: Im ausgewählten Zeitraum ist in diesem Datenbereich kein entsprechender Eintrag gespeichert. Daraus folgt nicht, dass keine Beschwerden, Untersuchungen oder Behandlungen stattgefunden haben.'));}
 async function add(report,r){
  if(!report||!r||!S.state().unlocked)return;
  report.querySelectorAll('[data-stats306]').forEach(x=>x.remove());
  if(!Object.values(checks).some(x=>x.checked))return;
  const names=['suite','labs','epef','diary','calendar','au','documents','cases'];
  const values=await Promise.all(names.map(n=>S.list(n)));
  const all=Object.fromEntries(names.map((n,i)=>[n,values[i]]));
  if(checks.stair.checked)stairs(report,all.suite.filter(x=>x.type==='stairs').map(x=>x.value).filter(Boolean),r);
  if(checks.lab.checked)labs(report,all.labs,r);
  if(checks.coverage.checked)coverage(report,all,r);
 }
 // The existing histogram/statistics module loads later. Intercept its assignment
 // so the existing report builder awaits the extra content before offering PDF.
 let current=window.ASTHMA_STATSP292;
 const wrap=api=>{
  if(!api?.append||typeof api.append!=='function')return api;
  return Object.freeze({...api,append:async(report,r)=>{
   await api.append(report,r);
   try{await add(report,r)}catch(err){console.error('Erweiterte Monats-/Jahresstatistik:',err);report.append(warn('Zusätzliche Labor-/Treppenstatistik konnte nicht erstellt werden: '+err.message));}
  }});
 };
 let wrapped=wrap(current);
 Object.defineProperty(window,'ASTHMA_STATSP292',{configurable:true,enumerable:true,get:()=>wrapped,set(value){current=value;wrapped=wrap(value)}});
 window.ASTHMA_STATS306={add,byReason,numeric,ready:()=>Boolean(wrapped?.append)};
})();


/* Asthma: privater WorksManager-Datenimport aus iPhone-Dateien.
   Ausschließlich nach ausdrücklicher Auswahl und Bestätigung.
   Kein eingebetteter Personen-/Arbeitsdatensatz und keine Netzwerkanfrage. */
(()=>{
 'use strict';
 const S=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);
 if(!S?.state?.().unlocked||!$('sc-import-file')||!$('sc-import-confirm'))return;
 const file=$('sc-import-file'),panel=$('sc-import-panel'),preview=$('sc-import-preview'),message=$('sc-import-status'),info=$('sc-import-info');
 const confirmBtn=$('sc-import-confirm');
 let pending=[],busy=false;
 const dOk=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return false;const t=new Date(s+'T12:00:00');return !isNaN(+t)&&[t.getFullYear(),String(t.getMonth()+1).padStart(2,'0'),String(t.getDate()).padStart(2,'0')].join('-')===s};
 const tOk=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s||'');
 const fp=r=>[r.date,r.time,Number(r.steps)].join('|');
 const makeId=r=>'wm-'+r.date.replace(/-/g,'')+'-'+r.time.replace(':','')+'-'+r.steps;
 const reset=()=>{pending=[];file.value='';preview.hidden=true;info.textContent=''};
 const validate=data=>{
  if(data?.kind!=='Asthma-Stairs-Import-v1'||!Array.isArray(data.entries)||data.entries.length<1||data.entries.length>5000)throw Error('Keine gültige Treppen-Importdatei.');
  const unique=new Set(),out=[];
  for(const x of data.entries){
   if(!x||!dOk(x.date)||!tOk(x.time)||!Number.isInteger(Number(x.steps))||Number(x.steps)<1||Number(x.steps)>20000)throw Error('Fehlerhafter Eintrag: Datum, Uhrzeit oder Stufenanzahl.');
   const reason=String(x.reason||'').trim().slice(0,120);
   if(!reason)throw Error('Bei einem Eintrag fehlt der Grund.');
   const item={date:x.date,time:x.time,steps:Number(x.steps),shift:'',reason,symptoms:'',note:String(x.note||'').slice(0,500),source:'WorksManager (Screenshot)',id:makeId(x)};
   if(unique.has(fp(item)))continue;
   unique.add(fp(item));out.push(item);
  }
  return out;
 };
 async function inspect(){
  const f=file.files?.[0];reset();
  // Keep selected File reference after clearing the input for safe file re-selection.
  if(!f)return;
  try{
   if(f.size>1024*1024||f.size===0)throw Error('Bitte eine JSON-Datei bis 1 MB auswählen.');
   pending=validate(JSON.parse(await f.text()));
   const existing=(await S.list('suite')).filter(r=>r.type==='stairs').map(r=>r.value).filter(Boolean);
   const known=new Set(existing.map(fp)),fresh=pending.filter(r=>!known.has(fp(r)));
   const total=fresh.reduce((n,r)=>n+r.steps,0);
   info.textContent=pending.length+' eindeutige Einträge erkannt: '+fresh.length+' neu ('+total.toLocaleString('de-DE')+' Stufen), '+(pending.length-fresh.length)+' bereits vorhanden.';
   preview.hidden=false;confirmBtn.disabled=fresh.length===0;
   message.textContent='Datei privat geprüft. Noch nichts importiert. „Verschlüsselt übernehmen“ bestätigen.';
  }catch(e){reset();message.textContent='Datei konnte nicht geprüft werden: '+(e.message||e)}
 }
 // Do not keep file names or contents in a remote store.
 file.addEventListener('change',inspect);
 $('sc-import-cancel').addEventListener('click',()=>{reset();message.textContent='Import abgebrochen; keine Daten gespeichert.'});
 confirmBtn.addEventListener('click',async()=>{
  if(busy||!pending.length)return;
  busy=true;confirmBtn.disabled=true;
  try{
   const known=new Set((await S.list('suite')).filter(r=>r.type==='stairs').map(r=>r.value).filter(Boolean).map(fp));
   let saved=0,skipped=0;
   for(const x of pending){
    if(known.has(fp(x))){skipped++;continue}
    const now=new Date().toISOString();
    await S.put('suite',{key:'stairs/'+x.id,type:'stairs',value:{...x,createdAt:now,updatedAt:now}},'stairs/'+x.id);
    known.add(fp(x));saved++;
    message.textContent=saved+' von '+pending.length+' Einträgen verschlüsselt gespeichert …';
   }
   reset();message.textContent='Import abgeschlossen: '+saved+' Einträge übernommen, '+skipped+' doppelte übersprungen. Treppenstatistik wird aktualisiert.';
   if(window.ASTHMA_STAIRS?.refresh)await window.ASTHMA_STAIRS.refresh();
  }catch(e){message.textContent='Import teilweise fehlgeschlagen: '+(e.message||e)+'. Dieselbe Datei kann erneut gewählt werden, doppelte werden übersprungen.'}
  finally{busy=false;confirmBtn.disabled=false}
 });
 window.ASTHMA_WM_IMPORT={validate,fp,makeId};
})();
