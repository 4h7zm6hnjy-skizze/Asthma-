'use strict';
/* PneumoPro 3.4.8 – local, read-only, transparent assessment of recent records.
   This module never writes patient information or transmits it. */
(()=>{
  const SEC=window.ASTHMA_SECURITY, $=id=>document.getElementById(id), panel=$('bewertung');
  if(!SEC?.state?.().unlocked||!panel||!$('bew348-summary'))return;
  const N=10,NS='http://www.w3.org/2000/svg';
  const levels={urgent:{name:'Rot · sehr auffällig',color:'#9b2145',rank:6},veryhigh:{name:'Rot · deutlich auffällig',color:'#b22c3b',rank:5},high:{name:'Orange · auffällig',color:'#bc5b13',rank:4},mild:{name:'Gelb · beachten',color:'#946700',rank:3},low:{name:'Blau · niedriger Wert',color:'#2563a4',rank:3},good:{name:'Grün · Orientierungsbereich',color:'#19764d',rank:1},unknown:{name:'Grau · ohne Einstufung',color:'#596b76',rank:0}};
  const isnum=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(String(v).replace(',','.')));
  const num=v=>isnum(v)?Number(String(v).replace(',','.')):null;
  const validDate=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'')&&!Number.isNaN(Date.parse(d+'T12:00:00Z'));
  const asTime=r=>validDate(r?.date)?r.date+'T'+(/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(r.time||'')?r.time:'00:00'):'';
  const dateDe=d=>validDate(d)?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):'Datum unbekannt';
  const f=(v,dec=1)=>v===null?'–':Number(v).toLocaleString('de-DE',{maximumFractionDigits:dec,minimumFractionDigits:dec===2?2:0});
  const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
  const elem=(name,cls,t)=>{const e=document.createElement(name);if(cls)e.className=cls;if(t!==undefined)e.textContent=t;return e;};
  const dateSort=(a,b)=>b.ts.localeCompare(a.ts)||String(b.id||'').localeCompare(String(a.id||''));
  const refFor=(r)=>{const s=String(r.reference??'').replace(/\s/g,'').replace(/,/g,'.');const m=s.match(/^(-?\d+(?:\.\d+)?)[–-](-?\d+(?:\.\d+)?)(?:\/.+)?$/);return m&&Number(m[1])<=Number(m[2])?[+m[1],+m[2]]:null;};
  function fromColor(obj){const k=obj?.key||'unknown';return {key:levels[k]?k:'unknown',label:obj?.label||levels[k]?.name||levels.unknown.name};}
  const status=(key,label)=>({key:levels[key]?key:'unknown',label:label||levels[key]?.name});
  const notClassified=()=>status('unknown','Nur Zahlenvergleich – medizinische Einordnung offen');
  function score(metric,v,rec){
    if(metric==='sys')return fromColor(window.ASTHMA_BPA344?.classifyPart(v,'systolic'));
    if(metric==='dia')return fromColor(window.ASTHMA_BPA344?.classifyPart(v,'diastolic'));
    if(['spo2','pulse','fev1','fvc','bmi'].includes(metric))return fromColor(window.PNEUMOPRO_AMPEL347?.classify(metric,v));
    if(metric==='lab'){
      const range=refFor(rec);
      if(!range)return status('unknown','Keine verlässliche Referenz im Befund');
      return v<range[0]?status('low','Unter dem Laborreferenzbereich'):v>range[1]?status('high','Über dem Laborreferenzbereich'):status('good','Innerhalb des angegebenen Laborreferenzbereichs');
    }
    return notClassified();
  }
  function normalized(list,field,{min=-Infinity,max=Infinity}={}){
    return list.filter(r=>validDate(r?.date)).map(r=>({date:r.date,time:r.time||'',ts:asTime(r),source:String(r.source||''),phase:r.phase||'',reference:r.reference||'',id:r.id||'',value:num(r[field]),original:r}))
      .filter(r=>r.value!==null&&r.value>=min&&r.value<=max).sort(dateSort);
  }
  function makeGroup(label,metric,unit,rows,note,opts={}){
    if(!rows.length)return null;
    return {label,metric,unit,rows,dec:opts.dec??1,note,group:opts.group||'Andere Messwerte',source:opts.source||'',method:opts.method||''};
  }
  function collections(suite,epef,labs,profile){
    const result=[];const put=g=>{if(g)result.push(g)};
    const vit=suite.filter(x=>x?.type==='vital29'&&x.value).map(x=>x.value);
    // Each recorded source is a separate series; finger oximeters and watches are never pooled.
    for(const kind of ['spo2','bp','pulse']){
      const rows=vit.filter(x=>x.kind===kind&&validDate(x.date));
      const sources=[...new Set(rows.map(x=>String(x.source||'Messmethode unbekannt').trim()||'Messmethode unbekannt'))];
      for(const source of sources){const items=rows.filter(x=>(String(x.source||'Messmethode unbekannt').trim()||'Messmethode unbekannt')===source);
        const base=kind==='bp'?'Blutdruck':kind==='spo2'?'Sauerstoffsättigung':'Puls';
        if(kind==='bp'){
          put(makeGroup('Blutdruck – systolisch · '+source,'sys','mmHg',normalized(items,'value',{min:40,max:300}),'Häusliche und Praxiswerte können unterschiedliche Vergleichsgrenzen haben. Hier werden nur die bisherigen App-Orientierungsfarben dargestellt.',{group:base,source,dec:0}));
          put(makeGroup('Blutdruck – diastolisch · '+source,'dia','mmHg',normalized(items,'diastolic',{min:20,max:200}),'Ein erhöhter oberer oder unterer Wert verdient Beachtung; ein Durchschnitt ersetzt keine kontrollierte Blutdruckmessreihe.',{group:base,source,dec:0}));
        }else if(kind==='spo2')put(makeGroup('SpO₂ · '+source,'spo2','%',normalized(items,'value',{min:40,max:100}),'Einzelwerte und Messgerät vergleichen. Uhrenwerte sind nicht mit klinischer Pulsoximetrie gleichzusetzen; eine normale SpO₂ schließt eine Lungenerkrankung nicht aus.',{group:base,source}));
        else put(makeGroup('Puls · '+source,'pulse','/min',normalized(items,'value',{min:20,max:250}),'Die Farbskala ist nur bei Messungen in Ruhe orientierend. Bei Bewegung, Fieber, Medikamenten oder Herzrhythmusstörungen ist diese Einordnung eingeschränkt.',{group:base,source,dec:0}));
      }
    }
    const lung=suite.filter(x=>x?.type==='measurements'&&x.value).map(x=>x.value);
    const phNames={vor:'vor Bronchodilatation',nach:'nach Bronchodilatation',unbekannt:'Messphase unbekannt'};
    for(const phase of ['vor','nach','unbekannt']){
      const part=lung.filter(x=>['vor','nach'].includes(x.phase)?x.phase===phase:phase==='unbekannt');if(!part.length)continue;
      for(const [field,label,unit,min,max,dec] of [['fev1','FEV₁ (% Soll)','%',0,200,1],['fvc','FVC (% Soll)','%',0,200,1],['fev1Liters','FEV₁ (Liter)','l',0,12,2],['fvcLiters','FVC (Liter)','l',0,15,2],['ratio','FEV₁/FVC','%',0,120,1]]){
        const adjusted=part.map(x=>({...x,ratio:x.ratio??(isnum(x.fev1Liters)&&isnum(x.fvcLiters)&&Number(x.fvcLiters)>0?100*Number(x.fev1Liters)/Number(x.fvcLiters):null)}));
        put(makeGroup(label+' · '+phNames[phase],field==='fev1'||field==='fvc'?field:'lungOther',unit,normalized(adjusted,field,{min,max}),'Nur Untersuchungen derselben Messphase vergleichen. Literwerte und FEV₁/FVC werden ohne altersabhängige Referenzuntergrenze (LLN/Z-Score) nicht farbig als gesund/krank eingestuft.',{group:'Lungenfunktion',method:phNames[phase],dec}));
      }
    }
    const atHome=epef.filter(x=>x?.kind==='measurement'&&validDate(x.date));
    put(makeGroup('Peak-Flow (ePEF-Gerät)','pef','l/min',normalized(atHome,'pef',{min:20,max:1500}),'Für eine individuelle Peak-Flow-Ampel fehlt ohne ärztlich festgelegten persönlichen Bestwert eine verlässliche Grundlage. Tageszeit und Technik beachten.',{group:'Peak-Flow & Handmessung',dec:0}));
    put(makeGroup('FEV₁ (ePEF-Handgerät)','handFEV','l',normalized(atHome,'fev1',{min:0.1,max:12}),'Handmessung nicht mit der ärztlichen Spirometrie vermischen.',{group:'Peak-Flow & Handmessung',dec:2}));
    const weights=suite.filter(x=>x?.type==='weight292'&&x.value).map(x=>x.value);
    const profileHeight=profile?.personal?.heightCm;
    const bmiAPI=window.PNEUMOPRO_AMPEL347;
    put(makeGroup('Körpergewicht','weight','kg',normalized(weights,'kg',{min:15,max:500}),'Gewichtsänderungen sind keine direkte Aussage über die Lungenfunktion. Bei raschen Veränderungen auch Medikamente und Wassereinlagerungen berücksichtigen.',{group:'Gewicht und Körperbau'}));
    if(bmiAPI?.heightCm(profileHeight)){
      const derived=weights.map(x=>({...x,bmi:bmiAPI.body(profileHeight,x.kg)?.bmi??null}));
      put(makeGroup('BMI (aus Gewicht und aktueller Größe)','bmi','kg/m²',normalized(derived,'bmi',{min:5,max:85}),'BMI ist eine grobe Erwachseneneinordnung, kein persönlicher Therapieplan. Frühere BMI-Werte sind mit der aktuell hinterlegten Körpergröße berechnet.',{group:'Gewicht und Körperbau'}));
    }
    // Laboratories are grouped by test, sub-test and unit; no mixing across different units.
    const byLab=new Map();
    for(const x of labs){if(!validDate(x?.date)||!isnum(x.value))continue;
      const label=String(x.label||x.marker||'Laborwert').slice(0,90),unit=String(x.unit||'').slice(0,30);
      const name=label+(x.allergen?' · '+String(x.allergen).slice(0,50):'');
      const key=[String(x.marker||''),String(x.allergen||''),unit,label].join('|');
      if(!byLab.has(key))byLab.set(key,{name,unit,rows:[]});
      byLab.get(key).rows.push({...x,source:x.source||'',time:x.time||''});
    }
    for(const {name,unit,rows} of byLab.values()){
      const actual=normalized(rows,'value');
      put(makeGroup(name,'lab',unit,actual,'Laborreferenzen gelten nur für den jeweiligen Befund. Bei unterschiedlichen Referenzbereichen, Labormethoden oder Einheiten sind Trends eingeschränkt; die Farbe bewertet nur den jeweiligen Einzelwert.',{group:'Laborwerte'}));
    }
    return result;
  }
  const lowConfidence=g=>g.metric==='pulse'||g.metric==='spo2'||g.metric==='fev1'||g.metric==='fvc';
  function compare(g){
    const latest=g.rows.slice(0,N),older=g.rows.slice(N,N*2);
    const newerAvg=avg(latest.map(r=>r.value)),olderAvg=avg(older.map(r=>r.value));
    const delta=olderAvg===null?null:newerAvg-olderAvg;
    const recent=latest[0];const s=score(g.metric,recent.value,recent.original);
    return {latest,older,newerAvg,olderAvg,delta,s,rec:recent};
  }
  function paintLine(rows,g,host){
    const vals=rows.slice().reverse(),max=Math.max(...vals.map(r=>r.value)),min=Math.min(...vals.map(r=>r.value));
    const span=Math.max(max-min,Math.abs(max)*0.03,0.5),low=min-span*.12,high=max+span*.12;
    const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 340 90');svg.setAttribute('role','img');svg.setAttribute('aria-label',g.label+': Verlauf der letzten '+vals.length+' Werte von '+f(vals[0].value,g.dec)+' bis '+f(vals.at(-1).value,g.dec)+' '+g.unit);
    const path=document.createElementNS(NS,'polyline');
    const xy=(r,i)=>[28+(vals.length===1?140:i*280/Math.max(vals.length-1,1)),75-(r.value-low)/(high-low)*61];
    path.setAttribute('points',vals.map((r,i)=>xy(r,i).map(v=>v.toFixed(1)).join(',')).join(' '));path.setAttribute('fill','none');path.setAttribute('stroke','#216b82');path.setAttribute('stroke-width','2.5');svg.append(path);
    vals.forEach((r,i)=>{const [x,y]=xy(r,i),dot=document.createElementNS(NS,'circle');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r','3.8');dot.setAttribute('fill',levels[score(g.metric,r.value,r.original).key]?.color||'#596b76');const title=document.createElementNS(NS,'title');title.textContent=dateDe(r.date)+': '+f(r.value,g.dec)+' '+g.unit;dot.append(title);svg.append(dot);});
    host.append(svg);
    host.append(elem('small','b348-chart-label','Ältester bis neuester Wert der aktuellen 10 Messungen · Min '+f(min,g.dec)+' / Max '+f(max,g.dec)+' '+g.unit));
  }
  function renderGroup(g){
    const c=compare(g),card=elem('article','b348-card'),stat=levels[c.s.key]||levels.unknown;
    card.style.setProperty('--b348-tone',stat.color);
    const h=elem('div','b348-card-head');h.append(elem('h3','',g.label));const badge=elem('span','b348-badge',c.s.label);badge.style.setProperty('--b348-tone',stat.color);h.append(badge);card.append(h);
    card.append(elem('p','b348-numbers',`Letzter Wert: ${f(c.rec.value,g.dec)} ${g.unit} · ${dateDe(c.rec.date)}${c.rec.time?' '+c.rec.time+' Uhr':''}`));
    const metrics=elem('div','b348-metrics');
    metrics.append(elem('span','',`Neueste ${c.latest.length}/10: Ø ${f(c.newerAvg,g.dec)} ${g.unit}`));
    metrics.append(elem('span','',c.older.length?`Zehn davor (${c.older.length}/10): Ø ${f(c.olderAvg,g.dec)} ${g.unit}`:'Vorherige zehn: nicht vorhanden'));
    metrics.append(elem('span','',c.delta===null?'Veränderung: nicht berechenbar':`Mittelwert-Differenz: ${c.delta>0?'+':''}${f(c.delta,g.dec)} ${g.unit}`));card.append(metrics);
    const message=c.older.length<3?'Für einen belastbareren Zweigruppenvergleich fehlen mindestens drei ältere Messungen.':c.latest.length<3?'Weniger als drei aktuelle Messungen: Trend nur eingeschränkt aussagekräftig.':'Die Differenz beschreibt nur die Messwerte. Sie belegt keine klinische Besserung oder Verschlechterung.';
    card.append(elem('p','b348-context',message));
    const redOrange=c.latest.filter(r=>(levels[score(g.metric,r.value,r.original).key]?.rank||0)>=4).length;
    const otherUnrated=c.latest.filter(r=>score(g.metric,r.value,r.original).key==='unknown').length;
    const finding=redOrange>0?`In ${redOrange} von ${c.latest.length} aktuellen Messungen lag die App-Ampel im orangefarbenen oder roten Bereich. Die einzelnen Werte sind unten einsehbar.`:
      otherUnrated===c.latest.length?'Keine vergleichbaren individuellen Referenzen hinterlegt; es erfolgt nur ein Zahlenvergleich.':
      `In den letzten ${c.latest.length} Messungen ist kein orangefarbener oder roter App-Status dokumentiert. Das schließt ein Gesundheitsproblem nicht aus.`;
    card.append(elem('p','b348-finding',finding));
    if(c.delta!==null){const trend=Math.abs(c.delta)<1e-10?'rechnerisch unverändert':c.delta>0?'höher':'niedriger';card.append(elem('p','b348-context',`Der jüngste Messdurchschnitt ist gegenüber den vorherigen ${c.older.length} Messungen ${trend} (${c.delta>0?'+':''}${f(c.delta,g.dec)} ${g.unit}). Das sagt ohne Messumstände und klinische Referenzen nicht, ob sich der Gesundheitszustand verbessert oder verschlechtert hat.`));}
    if(lowConfidence(g))card.append(elem('p','b348-context','Achtung: Referenzen, Messmethode, Zeitpunkt, Symptome und Therapie beeinflussen die medizinische Bewertung.'));
    const graph=elem('div','b348-graph');paintLine(c.latest,g,graph);card.append(graph);
    const more=elem('details','b348-details');more.append(elem('summary','','Einzelwerte und ausführliche Erklärung öffnen'));
    more.append(elem('p','b348-context',g.note));
    const table=elem('table','b348-table');const tr=elem('tr');['Datum','Messwert','Ampel'].forEach(x=>tr.append(elem('th','',x)));table.append(tr);
    c.latest.forEach(r=>{const statusValue=score(g.metric,r.value,r.original),t=elem('tr');t.append(elem('td','',dateDe(r.date)+(r.time?' '+r.time:'')),elem('td','',f(r.value,g.dec)+' '+g.unit));const tag=elem('span','b348-badge',statusValue.label);tag.style.setProperty('--b348-tone',(levels[statusValue.key]||levels.unknown).color);const td=elem('td');td.append(tag);t.append(td);table.append(t)});
    const wrap=elem('div','b348-table-wrap');wrap.append(table);more.append(wrap);
    if(c.older.length)more.append(elem('p','b348-context','Vergleichszeitraum: '+dateDe(c.older.at(-1).date)+' bis '+dateDe(c.older[0].date)+'. Neue Messreihe: '+dateDe(c.latest.at(-1).date)+' bis '+dateDe(c.latest[0].date)+'.'));
    card.append(more);return {card,c};
  }
  const summary=$('bew348-summary'),content=$('bew348-results'),messages=$('bew348-message'),button=$('bew348-refresh'),stamp=$('bew348-stamp');
  let busy=false,queued=false,lastAutomatic=null,requestId=0;
  async function evaluate({manual=false}={}){
    if(busy){queued=true;return;} if(!SEC.state().unlocked)return;
    busy=true;const seq=++requestId;button.disabled=true;messages.textContent='Verschlüsselte lokale Messwerte werden neu ausgewertet …';
    try{
      const [suite,epef,labs]=await Promise.all(['suite','epef','labs'].map(name=>SEC.list(name)));
      const groups=collections(suite,epef,labs,SEC.profileGet());
      summary.replaceChildren();content.replaceChildren();
      const severe=[];let total=0,none=0;
      if(!groups.length){summary.append(elem('p','','Noch keine auswertbaren Messungen. Bitte erst Werte mit Datum speichern.'));}
      else{
        const byCategory=new Map();
        for(const group of groups){const info=renderGroup(group);total++;if(info.c.s.key==='unknown')none++;if((levels[info.c.s.key]?.rank||0)>=4)severe.push({label:group.label,key:info.c.s.key,value:info.c.rec.value,unit:group.unit});
          if(!byCategory.has(group.group))byCategory.set(group.group,[]);byCategory.get(group.group).push(info.card);
        }
        summary.append(elem('p','b348-sumline',`${total} getrennte Messreihen · ${total-none} mit Ampel-Orientierung · ${none} ohne sichere Einstufung`));
        if(severe.length){const priority=elem('div','b348-focus');priority.append(elem('strong','','Auffällige aktuelle Einzelwerte – unabhängig vom Mittelwert'));const ul=elem('ul');severe.sort((a,b)=>levels[b.key].rank-levels[a.key].rank).slice(0,8).forEach(x=>ul.append(elem('li','',`${x.label}: ${f(x.value)} ${x.unit} (${levels[x.key].name})`)));priority.append(ul);summary.append(priority)}
        else summary.append(elem('p','b348-context','In den vorhandenen neuesten Einzelwerten wurde kein auffälliger App-Ampelstatus gefunden. Das ist keine gesundheitliche Entwarnung.'));
        for(const [name,cards] of byCategory){const section=elem('section','b348-category'),head=elem('h2','',name);section.append(head);cards.forEach(card=>section.append(card));content.append(section)}
      }
      const now=new Date();stamp.textContent='Letzte Neuberechnung: '+now.toLocaleString('de-DE')+' · kein gespeichertes Gutachten';
      messages.textContent=(manual?'Manuelle Neubewertung abgeschlossen. ':'')+'Aktuelle Einträge wurden erneut aus dem verschlüsselten Speicher geladen.';
      lastAutomatic=now.getTime();
    }catch(e){messages.textContent='Bewertung nicht möglich: '+(e?.message||String(e));}
    finally{busy=false;button.disabled=false;if(queued){queued=false;evaluate().catch(()=>{})}}
  }
  button.addEventListener('click',()=>evaluate({manual:true}));
  // Always recalculate when entering the separate page, and after changes from other modules.
  const observer=new MutationObserver(()=>{if(!panel.hidden&&Date.now()-(lastAutomatic||0)>1000)evaluate().catch(()=>{})});
  observer.observe(panel,{attributes:true,attributeFilter:['hidden']});
  let delay=null;
  for(const eventName of ['asthma:secure-change','asthma:profile-reset','asthma:vital29-ready','asthma:lung-imported','asthma:lung-study-imported']){
    window.addEventListener(eventName,event=>{if(eventName==='asthma:secure-change'&&!['suite','epef','labs','profile'].includes(event.detail?.group))return;clearTimeout(delay);delay=setTimeout(()=>{if(!panel.hidden)evaluate().catch(()=>{});else {stamp.textContent='Neue Einträge vorhanden – beim nächsten Öffnen neu bewerten';lastAutomatic=null;}},300);});
  }
  evaluate().catch(()=>{});
  // Test only: no patient values or background state exposed.
  window.PNEUMOPRO_ASSESS348_TEST=Object.freeze({normalized,compare,refFor,collections,score});
})();
