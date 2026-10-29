'use strict';
/* Asthma 3.4.1: Klar beschriftete, aktuelle Werte und Gewichtsdiagramm.
   Nur lesender Zugriff auf die vorhandenen Datensätze, keine Migration. */
(()=>{
 const S=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);
 if(!S?.state?.().unlocked||!$('vitalwerte')||!$('lungenwerte')||!$('s292-weight'))return;
 const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
 const fmt=(v,p=1)=>v===null?'–':v.toLocaleString('de-DE',{maximumFractionDigits:p});
 const nice=s=>/^\d{4}-\d\d-\d\d$/.test(s||'')?s.slice(8)+'.'+s.slice(5,7)+'.'+s.slice(0,4):'unbekannt';
 const day=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 const el=(tag,cl,t)=>{const e=document.createElement(tag);if(cl)e.className=cl;if(t!==undefined)e.textContent=String(t);return e};
 const vital=el('section','m340-section');vital.id='m340-vital';vital.innerHTML='<h3>MEINE MESSWERTE · AUF EINEN BLICK</h3><p class="m340-explain">Die letzten gespeicherten Werte mit Datum. Für den gesamten Verlauf die Diagramme darunter öffnen.</p><div class="m340-cards" id="m340-vital-cards"></div>';
 const lung=el('section','m340-section');lung.id='m340-lung';lung.innerHTML='<h3>LUNGENFUNKTION · LETZTER BEFUND</h3><p class="m340-explain">FEV₁ und FVC: Liter und Prozent des Sollwerts sind unterschiedliche Angaben.</p><div class="m340-cards" id="m340-lung-cards"></div>';
 const weight=el('section','m340-weight');weight.id='m340-weight';weight.innerHTML='<h3>GEWICHT · VERLAUFSDIAGRAMM</h3><div class="m340-weight-head" id="m340-weight-head"></div><label class="m340-range">Zeitraum<select id="m340-weight-range"><option value="1">Tag</option><option value="7">Woche</option><option value="30">Monat</option><option value="365">Jahr</option><option value="3652" selected>10 Jahre</option><option value="all">Alle</option></select></label><div class="m340-weight-graph" id="m340-weight-graph"></div><p class="m340-explain" id="m340-weight-trend"></p>';
 const vroot=$('vitalwerte'), lroot=$('lungenwerte');
 const vanchor=vroot.querySelector('.section-heading');if(vanchor)vanchor.after(vital);else vroot.prepend(vital);
 const lanchor=lroot.querySelector('.section-heading');if(lanchor)lanchor.after(lung);else lroot.prepend(lung);
 const wform=$('s292-weight-form');if(wform)wform.before(weight);else $('s292-weight').prepend(weight);
 const addCard=(container,label,value,unit,date,help,decimals=1,kind=null)=>{const card=el('article','m340-card');card.append(el('small','m340-card-name',label),el('strong','m340-card-number',value===null?'–':fmt(value,decimals)+' '+unit),el('span','m340-card-date',date?'Messung: '+nice(date):'Noch kein Messwert'));if(help)card.append(el('small','m340-card-help',help));
  if(kind){const api=window.PNEUMOPRO_AMPEL347,st=kind==='weight'?api?.classify('bmi',api?.body(S.profileGet()?.personal?.heightCm,value)?.bmi):api?.classify(kind,value);if(st){card.classList.add('pp347-card');card.style.setProperty('--pp347-tone',st.color);const badge=el('span','pp347-status',st.label);badge.style.setProperty('--pp347-tone',st.color);card.append(badge);}}
  container.append(card)};
 const svgNS='http://www.w3.org/2000/svg';
 const shape=(parent,tag,attrs,t)=>{const x=document.createElementNS(svgNS,tag);for(const [k,v] of Object.entries(attrs||{}))x.setAttribute(k,String(v));if(t!==undefined)x.textContent=String(t);parent.append(x);return x};
 let weights=[],epoch=0;
 const cutoff=(period)=>{if(period==='all')return '0000-00-00';const d=new Date();d.setHours(12,0,0,0);if(period==='3652')d.setFullYear(d.getFullYear()-10);else if(period==='365')d.setFullYear(d.getFullYear()-1);else d.setDate(d.getDate()-Number(period)+1);return day(d)};
 function drawWeight(){const graph=$('m340-weight-graph'),header=$('m340-weight-head'),desc=$('m340-weight-trend');graph.replaceChildren();header.replaceChildren();
  const profile=S.profileGet()?.personal||{},bmiAPI=window.PNEUMOPRO_AMPEL347,ref=bmiAPI?.body(profile.heightCm,weights.at(-1)?.kg??profile.weightKg);
  if(!weights.length){header.textContent='Noch keine Gewichtseinträge gespeichert.';desc.textContent=ref?'BMI-Orientierungsbereich: '+fmt(ref.weightMin)+'–'+fmt(ref.weightMax)+' kg. Unterhalb ein Gewicht mit Datum eintragen.':'Körpergröße im Profil eintragen; anschließend Gewicht mit Datum speichern.';return;}
  const last=weights.at(-1);header.append(el('strong','m340-current',fmt(last.kg)+' kg'),el('span','', 'Letzte Messung: '+nice(last.date)));
  if(ref){header.append(el('span','pp347-weight-band','BMI-Zielbereich (Erwachsene): '+fmt(ref.weightMin)+'–'+fmt(ref.weightMax)+' kg · BMI aktuell '+fmt(ref.bmi)));}
  const selected=weights.filter(x=>x.date>=cutoff($('m340-weight-range').value));if(!selected.length){graph.textContent='Keine Werte im gewählten Zeitraum.';desc.textContent='Wähle einen längeren Zeitraum.';return;}
  const W=660,H=300,L=64,R=28,T=34,B=62,values=selected.map(x=>x.kg);
  if(ref){values.push(ref.weightMin,ref.weightMax);}
  let min=Math.min(...values),max=Math.max(...values),pad=Math.max(1.5,(max-min)*.18);min=Math.max(0,min-pad);max+=pad;const span=max-min||1;
  const svg=shape(graph,'svg',{viewBox:'0 0 660 300',role:'img','aria-label':'Gewicht in kg, '+selected.length+' Messungen'});
  const pos=(v,i)=>[L+(selected.length===1?(W-L-R)/2:i*(W-L-R)/(selected.length-1)),T+(max-v)/span*(H-T-B)];
  if(ref){const top=T+(max-ref.weightMax)/span*(H-T-B),bottom=T+(max-ref.weightMin)/span*(H-T-B);
    shape(svg,'rect',{x:L,y:top,width:W-L-R,height:Math.max(1,bottom-top),fill:'#d9f3e5',opacity:.9});
    shape(svg,'line',{x1:L,x2:W-R,y1:top,y2:top,stroke:'#237949','stroke-dasharray':'6 5'});
    shape(svg,'line',{x1:L,x2:W-R,y1:bottom,y2:bottom,stroke:'#237949','stroke-dasharray':'6 5'});
    const t=shape(svg,'text',{x:W-R-3,y:Math.max(15,top-6),'text-anchor':'end','font-size':13,fill:'#166a42'},'BMI 18,5–<25');
    shape(t,'title',{},'BMI-Orientierungsbereich für Erwachsene. Kein persönliches ärztliches Zielgewicht.');
  }
  for(let j=0;j<5;j++){const yy=T+j*(H-T-B)/4;shape(svg,'line',{x1:L,y1:yy,x2:W-R,y2:yy,stroke:'#dce7ed'});shape(svg,'text',{x:L-9,y:yy+4,'text-anchor':'end',fill:'#506b77','font-size':15},fmt(max-j*span/4))}
  let prev=null;selected.forEach((v,i)=>{const [x,y]=pos(v.kg,i);if(prev)shape(svg,'line',{x1:prev[0],y1:prev[1],x2:x,y2:y,stroke:'#187b95','stroke-width':3.5});const dot=shape(svg,'circle',{cx:x,cy:y,r:6.2,fill:'#126d85',stroke:'#fff','stroke-width':2});shape(dot,'title',{},nice(v.date)+': '+fmt(v.kg)+' kg');if(selected.length<=5||i===0||i===selected.length-1||i===Math.floor(selected.length/2))shape(svg,'text',{x,y:H-19,'text-anchor':'middle',fill:'#4f6978','font-size':13},v.date.slice(8)+'.'+v.date.slice(5,7)+'.'+v.date.slice(2,4));prev=[x,y]});
  shape(svg,'text',{x:L,y:18,'font-size':15,fill:'#365e6e'},'kg');
  if(selected.length===1){desc.textContent='Ein Messwert am '+nice(selected[0].date)+'. Für den Verlauf sind weitere Messungen erforderlich.'+(ref?' Grüner Bereich: BMI 18,5 bis unter 25; allgemeine Erwachsenen-Orientierung.':'');return;}
  const first=selected[0],end=selected.at(-1),delta=end.kg-first.kg;
  desc.textContent=selected.length+' Messungen · '+nice(first.date)+' '+fmt(first.kg)+' kg → '+nice(end.date)+' '+fmt(end.kg)+' kg · Veränderung '+(delta>0?'+':'')+fmt(delta)+' kg.'+(ref?' Grün markiert BMI 18,5 bis unter 25 (Erwachsene). Dies ist kein individuelles Zielgewicht.':' Bitte Größe im Profil eintragen, um den BMI-Zielbereich einzublenden.');
 }
 $('m340-weight-range').addEventListener('change',drawWeight);
 async function refresh(){const call=++epoch,items=await S.list('suite');if(call!==epoch)return;
  weights=items.filter(x=>x.type==='weight292'&&/^\d{4}-\d\d-\d\d$/.test(x.value?.date||'')&&n(x.value.kg)!==null).map(x=>({date:x.value.date,kg:n(x.value.kg)})).sort((a,b)=>a.date.localeCompare(b.date));
  const vitals=items.filter(x=>x.type==='vital29'&&x.value?.date).map(x=>x.value).sort((a,b)=>(b.date+' '+(b.time||'')).localeCompare(a.date+' '+(a.time||'')));
  const find=kind=>vitals.find(x=>x.kind===kind),spo=find('spo2'),bp=find('bp'),pulse=find('pulse'),wg=weights.at(-1);
  const v=$('m340-vital-cards');v.replaceChildren();addCard(v,'BLUTSAUERSTOFF · SpO₂',n(spo?.value),'%',spo?.date,'Messmethode beachten',1,'spo2');addCard(v,'BLUTDRUCK · SYSTOLISCH',n(bp?.value),'mmHg',bp?.date,'Oberer Blutdruckwert',0);addCard(v,'BLUTDRUCK · DIASTOLISCH',n(bp?.diastolic),'mmHg',bp?.date,'Unterer Blutdruckwert',0);addCard(v,'PULS',n(pulse?.value),'/min',pulse?.date,'Schläge pro Minute (in Ruhe bewertbar)',0,'pulse');addCard(v,'GEWICHT',n(wg?.kg),'kg',wg?.date,'Diagramm und Eingabe weiter unten',1,'weight');
  if(bp&&window.ASTHMA_BPA344){for(const card of [...v.querySelectorAll('.m340-card')].filter(x=>/BLUTDRUCK/i.test(x.textContent))){const isSystolic=/SYSTOLISCH/.test(card.querySelector('.m340-card-name')?.textContent||'')&&!/DIASTOLISCH/.test(card.querySelector('.m340-card-name')?.textContent||'');const st=window.ASTHMA_BPA344.classifyPart(isSystolic?bp.value:bp.diastolic,isSystolic?'systolic':'diastolic');card.classList.add('bp344-card');card.style.setProperty('--bp-tone',st.color);const badge=el('span','bp344-status',st.label);badge.style.setProperty('--bp-tone',st.color);card.append(badge)}const note=el('p','bp344-note','Blutdruck-Ampel: Blau niedrig · Grün Orientierungsbereich · Gelb leicht erhöht · Orange erhöht · Rot deutlich/ sehr hoch. Messort, Beschwerden und persönliche ärztliche Zielwerte beachten.');v.after(note);const old=v.parentElement.querySelectorAll('.bp344-note');if(old.length>1)old[0].remove();}
  const lungs=items.filter(x=>x.type==='measurements'&&x.value?.date).map(x=>x.value).sort((a,b)=>(b.date+' '+(b.time||'')).localeCompare(a.date+' '+(a.time||'')));const latest=lungs[0],l=$('m340-lung-cards');l.replaceChildren();
  addCard(l,'FEV₁ · VOM SOLL',n(latest?.fev1),'%',latest?.date,'Einsekundenkapazität',1,'fev1');addCard(l,'FEV₁ · GEMESSEN',n(latest?.fev1Liters),'l',latest?.date,'Literwert',2,'liters');addCard(l,'FVC · VOM SOLL',n(latest?.fvc),'%',latest?.date,'Forcierte Vitalkapazität',1,'fvc');addCard(l,'FVC · GEMESSEN',n(latest?.fvcLiters),'l',latest?.date,'Literwert',2,'liters');addCard(l,'FEV₁/FVC · VERHÄLTNIS',n(latest?.ratio),'%',latest?.date,'Nicht % vom Soll',1,'ratio');
  let note=$('pp347-lung-note');if(!note){note=el('p','pp347-note');note.id='pp347-lung-note';l.after(note);}
  note.textContent='Lungenfunktions-Ampel: FEV₁/FVC und reine Literwerte ohne altersbezogene Referenz (LLN/Z-Score) nicht als normal oder krank einstufbar. FEV₁/FVC erfordert ärztliche Beurteilung. FEV₁/FVC ist kein Prozent-vom-Soll-Wert. FEV₁/FVC und FEV₁-%-Soll alleine bestimmen keine Diagnose.';
  let vitalNote=$('pp347-vital-note');if(!vitalNote){vitalNote=el('p','pp347-note');vitalNote.id='pp347-vital-note';v.after(vitalNote);}vitalNote.textContent='SpO₂-Farben: allgemeine Orientierung für Erwachsene, individueller Sollbereich kann bei Lungenerkrankungen abweichen. Ruhepuls nur bei Ruhebedingungen einordnen. Bei starker Atemnot, Brustschmerz oder Bewusstseinsstörung 112.';
  drawWeight();
 }
 let timer;window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite'){clearTimeout(timer);timer=setTimeout(()=>refresh().catch(()=>{}),120)}});window.addEventListener('asthma:lung-study-imported',()=>refresh().catch(()=>{}));
 window.addEventListener('asthma:personal-profile-updated',()=>refresh().catch(()=>{}));
 refresh().catch(e=>{const out=$('m340-vital-cards');if(out)out.textContent='Daten konnten nicht geladen werden: '+e.message});
 window.__ASTHMA_METRICS340_TEST=Object.freeze({version:'3.4.7',cutoff});
})();
