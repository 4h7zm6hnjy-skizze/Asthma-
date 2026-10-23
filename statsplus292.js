'use strict';
/* Asthma 2.9.2 – purely additive, locally generated printable chart appendix.
 * Never rewrites the original statistics and never makes external requests.
 */
(()=>{
 const SEC=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);
 if(!SEC||!$('stats25-report')||!$('stats25-build'))return;
 const kinds=[['spo2','Blutsauerstoff (SpO₂)'],['bp','Blutdruck'],['pulse','Puls'],['weight','Gewicht'],['pef','Peak-Flow (PEF und Hand-FEV₁)'],['lung','Ärztliche Lungenfunktion']];
 const num=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
 const iso=s=>/^\d{4}-\d\d-\d\d$/.test(s||'')?s:'';
 const fmt=s=>iso(s)?s.slice(8)+'.'+s.slice(5,7)+'.'+s.slice(0,4):'–';
 const format=(n,d=1)=>n===null?'–':n.toLocaleString('de-DE',{minimumFractionDigits:0,maximumFractionDigits:d});
 const node=(tag,cls,t)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(t!==undefined)el.textContent=String(t);return el;};
 const nsum=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
 const makeDate=row=>String(row.date||'')+'T'+String(row.time||'12:00');
 const selected=Object.fromEntries([['old',true],...kinds.map(x=>[x[0],true])]);
 const controls=node('fieldset','s292-controls');controls.id='statsplus292-options';
 controls.append(node('legend','','Zusätzliche Druckbereiche wählen'));
 controls.append(node('p','s292-note','Der bisherige Bericht bleibt unverändert. Ausgewählte Messwerte und Diagramme werden auf zusätzlichen Seiten angehängt. Für Einzeldruck Bereiche abwählen.'));
 const options=node('div','s292-choices');
 for(const [id,label] of [['old','Bisherige Statistik'],...kinds]){
   const holder=node('label','s292-option'),check=document.createElement('input');check.type='checkbox';check.value=id;check.checked=true;check.setAttribute('aria-label',label);
   check.addEventListener('change',()=>{selected[id]=check.checked;applySelection()});holder.append(check,node('span','',label));options.append(holder);
 }
 controls.append(options);const notice=node('p','s292-note');notice.id='s292-selection-status';controls.append(notice);
 const toolbar=$('stats25-build').closest('.stats25-controls');toolbar?.insertAdjacentElement('afterend',controls);
 function applySelection(){
   const report=$('stats25-report');const addon=$('statsplus292-appendix');
   document.body.dataset.s292Old=selected.old?'on':'off';
   for(const [id] of kinds){const card=addon?.querySelector('[data-s292-kind="'+id+'"]');if(card)card.dataset.printEnabled=selected[id]?'true':'false';}
   if(addon){addon.dataset.printEnabled=kinds.some(([id])=>selected[id])?'true':'false';let first=true;for(const [id] of kinds){const card=addon.querySelector('[data-s292-kind="'+id+'"]');if(card){card.dataset.printFirst=selected[id]&&first?'true':'false';if(selected[id])first=false;}}}
   notice.textContent='Für Ausdruck/PDF ausgewählt: '+Object.values(selected).filter(Boolean).length+' Bereiche.';
   report?.classList.toggle('s292-custom-print',!selected.old);
 }
 applySelection();
 for(const id of ['stats25-print','stats25-pdf'])$(id)?.addEventListener('click',event=>{
   if(!Object.values(selected).some(Boolean)){
     event.stopImmediatePropagation();$('stats25-status').textContent='Bitte mindestens einen Druckbereich auswählen.';return;
   }
   if(window.__s292Building){event.stopImmediatePropagation();$('stats25-status').textContent='Diagramme werden noch vorbereitet. Bitte danach erneut drucken.';}
 },true);
 function summary(parent,rows,series){
   const meta=node('div','s292-summary');meta.append(node('strong','',rows.length+' Messung'+(rows.length===1?'':'en')));
   for(const [key,name,unit] of series){const values=rows.map(x=>num(x[key])).filter(x=>x!==null);if(values.length){meta.append(node('span','',name+': Ø '+format(nsum(values),2)+' '+unit+' · Min '+format(Math.min(...values),2)+' · Max '+format(Math.max(...values),2)+' · Letzt '+format(values.at(-1),2)));}}
   parent.append(meta);
 }
 const svgNS='http://www.w3.org/2000/svg';
 function chart(parent,rows,series,refs={},unit=''){
   const values=rows.filter(x=>series.some(([key])=>num(x[key])!==null)).sort((a,b)=>makeDate(a).localeCompare(makeDate(b)));
   if(!values.length){parent.append(node('p','s292-empty','Keine Messwerte für ein Diagramm vorhanden.'));return;}
   const c=node('div','s292-chart-box'),W=690,H=295,L=73,R=35,T=45,B=65;
   const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('role','img');svg.setAttribute('aria-label','Messdiagramm '+series.map(s=>s[1]).join(', '));
   const chartRows=values.length>450?values.filter((x,i)=>i===0||i===values.length-1||i%Math.ceil(values.length/450)===0):values;
   const digits=unit==='l'?2:unit==='kg'?1:unit==='%'?1:0;
   const selectLabels=(pts,maxLabels)=>{
     if(pts.length<=maxLabels)return pts;
     const selected=new Set([0,pts.length-1]);
     for(const index of [1,2,3])selected.add(Math.round(index*(pts.length-1)/4));
     const range=pts.map(item=>num(item[1]));
     selected.add(range.indexOf(Math.min(...range)));
     selected.add(range.indexOf(Math.max(...range)));
     const ordered=[...selected].filter(i=>i>=0&&i<pts.length);
     if(ordered.length>maxLabels){const priority=[pts.length-1,range.indexOf(Math.min(...range)),range.indexOf(Math.max(...range)),0,Math.round((pts.length-1)/2)];return [...new Set(priority)].slice(0,maxLabels).sort((a,b)=>a-b).map(i=>pts[i]);}
     return ordered.sort((a,b)=>a-b).map(i=>pts[i]);
   };
   const nums=values.flatMap(x=>series.map(([k])=>num(x[k])).filter(x=>x!==null));
   const refVals=series.map(([k])=>num(refs[k])).filter(v=>v!==null);
   let min=Math.min(...nums,...refVals),max=Math.max(...nums,...refVals),pad=max===min?Math.max(1,max*.06):(max-min)*.13;
   min=Math.max(0,min-pad);max+=pad;if(min===max)max=min+1;
   const y=v=>T+(H-T-B)*(max-v)/(max-min);
   const start=Date.parse(values[0].date+'T'+(values[0].time||'12:00'))||0;
   const finish=Date.parse(values.at(-1).date+'T'+(values.at(-1).time||'12:00'))||start;
   const x=val=>{const ts=Date.parse(val.date+'T'+(val.time||'12:00'))||start;return L+(W-L-R)*(finish===start?0.5:(ts-start)/(finish-start));};
   function shape(kind,attrs,content){const el=document.createElementNS(svgNS,kind);for(const [key,v] of Object.entries(attrs||{}))el.setAttribute(key,String(v));if(content!==undefined)el.textContent=String(content);svg.append(el);return el;}
   // Show explicit units, numeric scales and (bounded) real measurement labels.
   shape('text',{x:L,y:20,'font-size':14,'font-weight':'700',fill:'#244d61'},'Messwert ('+(unit||'Einheit')+')');
   for(let i=0;i<6;i++){const value=min+(max-min)*(5-i)/5,yy=T+(H-T-B)*i/5;shape('line',{x1:L,x2:W-R,y1:yy,y2:yy,stroke:'#d5e1e8','stroke-width':1});shape('text',{x:L-9,y:yy+4,'text-anchor':'end','font-size':12,fill:'#405967'},format(value,digits));}
   series.forEach(([key,label,color],seriesIndex)=>{
     const refValue=num(refs[key]);if(refValue!==null){shape('line',{x1:L,x2:W-R,y1:y(refValue),y2:y(refValue),stroke:color,'stroke-width':1.7,'stroke-dasharray':'7 5'});}
     const pts=chartRows.filter(item=>num(item[key])!==null);
     if(pts.length>1)shape('polyline',{points:pts.map(item=>x(item)+','+y(num(item[key]))).join(' '),fill:'none',stroke:color,'stroke-width':2.6,'stroke-linejoin':'round','stroke-linecap':'round'});
     if(pts.length>=2&&pts.length<=7){
       for(let i=1;i<pts.length;i++){
         const a=pts[i-1],b=pts[i],old=num(a[key]),now=num(b[key]);
         if(old===null||now===null||x(b)-x(a)<58)continue;
         const diff=now-old,unitLabel=unit==='%'?' pp':unit?' '+unit:'';
         const rel=old===0?'':' ('+(diff>0?'+':'')+format(diff/Math.abs(old)*100,1)+' % relativ)';
         const text=(diff>0?'+':'')+format(diff,digits)+unitLabel;
         const clinical=['fev1','fvc','fev1Liters','fvcLiters'].includes(key);
         const fill=clinical?(diff>0?'#167d50':diff<0?'#b13b35':'#4a5d69'):'#4a5d69';
         const label=shape('text',{x:(x(a)+x(b))/2,y:Math.max(T+12,Math.min(H-B-5,(y(old)+y(now))/2+(seriesIndex%2===0?-13:19))),
           fill,'font-size':11,'font-weight':700,'text-anchor':'middle',stroke:'#fff','stroke-width':3,'paint-order':'stroke'},text);
         const tooltip=document.createElementNS(svgNS,'title');tooltip.textContent=fmt(a.date)+' → '+fmt(b.date)+': '+text+rel;
         label.append(tooltip);
       }
     }

     for(const p of pts){const el=shape('circle',{cx:x(p),cy:y(num(p[key])),r:pts.length>160?1.6:3.3,fill:color});const tip=document.createElementNS(svgNS,'title');tip.textContent=fmt(p.date)+' '+(p.time||'')+' · '+label+': '+format(num(p[key]),digits)+' '+unit;el.append(tip);}
     const chosen=selectLabels(pts.map(p=>[p,num(p[key])]),series.length>1?4:7);
     for(const [p,val] of chosen){
       let yy=y(val)+(seriesIndex%2?21:-12);
       if(yy<T+13)yy=y(val)+21;
       if(yy>T+(H-T-B)-5)yy=y(val)-13;
       const xx=Math.max(L+26,Math.min(W-R-26,x(p)));
       shape('text',{x:xx,y:yy,'text-anchor':'middle','font-size':12,'font-weight':'700',fill:color},format(val,digits));
     }
   });
   // Date ticks from actual measurements, never invented intermediate readings.
   const dateIndices=[0,Math.round((values.length-1)/4),Math.round((values.length-1)/2),Math.round(3*(values.length-1)/4),values.length-1];
   let previousX=-100,seenDates=new Set();
   for(const index of [...new Set(dateIndices)]){
     const row=values[index],xx=x(row),day=fmt(row.date);
     if(seenDates.has(day)||xx-previousX<83)continue;
     seenDates.add(day);previousX=xx;
     shape('line',{x1:xx,x2:xx,y1:H-B,y2:H-B+5,stroke:'#93a9b4','stroke-width':1});
     shape('text',{x:Math.max(L+32,Math.min(W-R-32,xx)),y:H-B+22,'font-size':11,'text-anchor':'middle',fill:'#496270'},day);
   }
   shape('text',{x:(L+W-R)/2,y:H-8,'font-size':12,'text-anchor':'middle',fill:'#244d61'},'Datum der Messung');
   c.append(svg);
   const chartSummary=node('div','s292-summary');chartSummary.setAttribute('aria-label','Zahlen zum Diagramm');
   for(const [key,label] of series){
     const measurements=values.map(item=>({value:num(item[key]),date:item.date})).filter(item=>item.value!==null);
     if(!measurements.length)continue;
     const nn=measurements.map(item=>item.value),last=measurements.at(-1),first=measurements[0],difference=last.value-first.value;
     const change=measurements.length>1?' · Änderung erster/letzter Wert '+(difference>0?'+':'')+format(difference,digits)+' '+unit:'';
     chartSummary.append(node('span','',label+': '+measurements.length+' Messungen · Minimum '+format(Math.min(...nn),digits)+' '+unit+' · Maximum '+format(Math.max(...nn),digits)+' '+unit+' · Durchschnitt '+format(nsum(nn),digits)+' '+unit+' · Letzter Wert '+format(last.value,digits)+' '+unit+' am '+fmt(last.date)+change));
   }
   c.append(chartSummary);
   c.append(node('p','s292-note','Zahlen zwischen Punkten zeigen absolute Messwertänderungen; bei Prozentwerten sind dies Prozentpunkte (pp). Das Vorzeichen bedeutet nicht automatisch eine klinische Verbesserung oder Verschlechterung. Bei vielen Messpunkten werden die Änderungszahlen aus Platzgründen nicht eingeblendet.'));
   c.append(node('p','s292-note','Zahlen an der senkrechten Achse: '+(unit||'Messwert')+'. Beschriftete Messpunkte: konkrete Einzelwerte; aus Platzgründen sind nicht alle Punkte direkt beschriftet. Die waagerechte Achse zeigt echte Messdaten. Durchgezogen: dokumentierte Messwerte. Gestrichelt: nur manuell hinterlegte persönliche Vergleichswerte; keine automatisch festgelegten medizinischen Grenzen. Alle Einzelwerte stehen in der Tabelle.'));
   const legend=node('div','s292-legend');for(const [key,label,color] of series){const cell=node('span');cell.append(node('i','s292-dot'));cell.querySelector('i').style.backgroundColor=color;cell.append(node('span','',label+(num(refs[key])!==null?' (gestrichelt: persönlicher Vergleich)':'')));legend.append(cell);}c.append(legend);
   if(chartRows.length!==values.length)c.append(node('p','s292-note','Die Grafik zeigt eine reduzierte Auswahl von '+chartRows.length+' Punkten; die Messwerttabelle enthält alle '+values.length+' Einträge.'));
   parent.append(c);
 }
 function dataTable(parent,rows,cols){
   if(!rows.length){parent.append(node('p','s292-empty','Keine Werte in diesem Zeitraum vorhanden.'));return;}
   const wrap=node('div','s292-table-wrap'),table=node('table','s292-table');const thead=node('thead'),head=node('tr');for(const [,title] of [['date','Datum'],['time','Uhrzeit'],...cols])head.append(node('th','',title));thead.append(head);table.append(thead);const body=node('tbody');
   for(const r of [...rows].reverse()){const tr=node('tr');tr.append(node('td','',fmt(r.date)),node('td','',r.time||'–'));for(const [key,,digits=1] of cols){const v=r[key];tr.append(node('td','',typeof v==='number'?format(v,digits):v===null||v===undefined||v===''?'–':String(v)));}body.append(tr);}
   table.append(body);wrap.append(table);parent.append(wrap);
 }
 const VALID={spo2:[40,100],bp:[40,300],pulse:[20,250],weight:[15,500]};
 const isValid=(v,kind)=>{const n=num(v),range=VALID[kind];return n!==null&&(!range||(n>=range[0]&&n<=range[1]));};
 function panel(root,id,title,rows,charts,cols,refs={}){
   const el=node('section','s292-category');el.dataset.s292Kind=id;el.dataset.printEnabled=selected[id]?'true':'false';
   el.append(node('h3','',title));const ordered=rows.sort((a,b)=>makeDate(a).localeCompare(makeDate(b)));
   const metricCols=cols.filter(x=>typeof x[2]==='number'&&x[2]>=0).map(x=>[x[0],x[1],x[3]||'']);summary(el,ordered,metricCols);
   for(const graph of charts){el.append(node('h4','',graph.title));chart(el,ordered,graph.series,refs,graph.unit);}
   dataTable(el,ordered,cols);root.append(el);
 }
 let lastKey='',loading=null;
 async function append(report,r){
   if(!SEC?.state?.().unlocked)throw Error('Tresor ist gesperrt');
   if(loading)await loading;
   const job=(async()=>{
     window.__s292Building=true;
     const [suite,epef,diary]=await Promise.all(['suite','epef','diary'].map(name=>SEC.list(name)));
     const within=v=>iso(v?.date)&&v.date>=r.from&&v.date<=r.to;
     const vit=suite.filter(x=>x.type==='vital29').map(x=>x.value).filter(within);
     const weights=suite.filter(x=>x.type==='weight292').map(x=>x.value).filter(within).filter(x=>isValid(x.kg,'weight'));
     const lung=suite.filter(x=>x.type==='measurements').map(x=>x.value).filter(within);
     const hand=epef.filter(x=>x.kind==='measurement'&&within(x));
     const diaryPeaks=diary.filter(within).filter(x=>num(x.peak)!==null).map(x=>({date:x.date,time:x.time||'12:00',pef:num(x.peak),fev1:null,source:'Asthma-Tagebuch'}));
     const pef=[...hand.map(x=>({...x,source:x.source||'ePEF'})),...diaryPeaks];
     const refsRec=suite.find(x=>x.type==='vital29refs')?.value?.values||{};
     const refs={value:num(refsRec.spo2),systolic:num(refsRec.bpSys),diastolic:num(refsRec.bpDia),pulse:num(refsRec.pulse),pef:num(refsRec.pef),fev1:num(refsRec.fev1),fvc:num(refsRec.fvc),fev1Liters:num(refsRec.fev1Liters),fvcLiters:num(refsRec.fvcLiters)};
     report.querySelector('#statsplus292-appendix')?.remove();
     const root=node('section','s292-appendix');root.id='statsplus292-appendix';root.dataset.printEnabled='true';
     root.append(node('h2','', 'Ergänzende Messwerte und Diagramme'));
     root.append(node('p','s292-note','Anhang zu '+(r.mode==='month'?'Monat ':'Jahr ')+r.key+' · Angaben aus dem lokalen, verschlüsselten Tresor. Es erfolgt keine Übertragung an einen Server.'));
     const spo=vit.filter(x=>x.kind==='spo2'&&isValid(x.value,'spo2'));
     panel(root,'spo2','Blutsauerstoff (SpO₂)',spo,[{title:'SpO₂-Verlauf',unit:'%',series:[['value','SpO₂','#108596']]}],[['value','SpO₂ (%)',1],['source','Messquelle',-2]],{value:refs.value});
     const bp=vit.filter(x=>x.kind==='bp'&&isValid(x.value,'bp')&&isValid(x.diastolic,'bp'));
     panel(root,'bp','Blutdruck',bp,[{title:'Systolisch und diastolisch',unit:'mmHg',series:[['value','Systolisch','#ab536e'],['diastolic','Diastolisch','#4165b0']]}],[['value','Systolisch (mmHg)',0],['diastolic','Diastolisch (mmHg)',0],['source','Messort',-2]],{value:refs.systolic,diastolic:refs.diastolic});
     const pulse=vit.filter(x=>x.kind==='pulse'&&isValid(x.value,'pulse'));
     panel(root,'pulse','Puls',pulse,[{title:'Pulsverlauf',unit:'/min',series:[['value','Puls','#9366b8']]}],[['value','Puls (/min)',0],['source','Messquelle',-2]],{value:refs.pulse});
     const weight=weights.map(x=>({...x,value:num(x.kg)}));
     panel(root,'weight','Gewicht',weight,[{title:'Gewichtsverlauf',unit:'kg',series:[['value','Gewicht','#3c8c77']]}],[['value','Gewicht (kg)',1],['note','Notiz',-2]],{});
     if(!weights.length){const x=SEC.profileGet()?.personal?.weightKg;const w=num(x);const target=root.querySelector('[data-s292-kind="weight"]');target?.append(node('p','s292-note',w!==null&&w>0?'Im Profil hinterlegtes aktuelles Gewicht: '+format(w,1)+' kg. Ein zeitlicher Gewichtsverlauf entsteht erst durch datierte Gewichtseinträge.':'Für einen Gewichtsverlauf unter Vitalwerte regelmäßig Messungen speichern.'));}
     const handRows=pef.map(x=>({ ...x, pef:num(x.pef),fev1:num(x.fev1)})).filter(x=>x.pef!==null||x.fev1!==null);
     panel(root,'pef','Peak-Flow und FEV₁ (Heim-/Handmessung)',handRows,[{title:'PEF-Verlauf',unit:'l/min',series:[['pef','PEF','#217f9b']]},{title:'FEV₁-Verlauf (Handmessung)',unit:'l',series:[['fev1','FEV₁','#ce8248']]}],[['pef','PEF (l/min)',0],['fev1','FEV₁ (l)',2],['source','Herkunft',-2]],{pef:refs.pef});
     const lRows=lung.map(x=>({...x,fev1:num(x.fev1),fvc:num(x.fvc),fev1Liters:num(x.fev1Liters),fvcLiters:num(x.fvcLiters)}));
     panel(root,'lung','Ärztliche Lungenfunktion',lRows,[{title:'FEV₁ / FVC in % vom Soll',unit:'%',series:[['fev1','FEV₁ % Soll','#217f9b'],['fvc','FVC % Soll','#a662a1']]},{title:'FEV₁ / FVC in Litern',unit:'l',series:[['fev1Liters','FEV₁ l','#247e76'],['fvcLiters','FVC l','#d48748']]}],[['fev1','FEV₁ (% Soll)',1],['fvc','FVC (% Soll)',1],['fev1Liters','FEV₁ (l)',2],['fvcLiters','FVC (l)',2],['phase','Messphase',-2]],refs);
     root.append(node('p','s292-disclaimer','Gemessene Verläufe sind keine Diagnose. Durchgezogene Linien zeigen Messwerte, gestrichelte Linien ausschließlich manuell hinterlegte persönliche Vergleiche. Bei auffälligen Werten ärztliche Beurteilung einholen. Diese gedruckten Gesundheitsdaten sind unverschlüsselt.'));
     report.append(root);lastKey=r.key;applySelection();
   })();loading=job;
   try{await job}finally{window.__s292Building=false;if(loading===job)loading=null;}
 }
 window.ASTHMA_STATSP292=Object.freeze({append,getLastKey:()=>lastKey});
})();
