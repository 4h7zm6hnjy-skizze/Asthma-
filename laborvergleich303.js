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
