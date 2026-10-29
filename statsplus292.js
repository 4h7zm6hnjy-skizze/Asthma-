'use strict';
/* Asthma 2.9.2 – purely additive, locally generated printable chart appendix.
 * Never rewrites the original statistics and never makes external requests.
 */
(()=>{
 const SEC=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);
 if(!SEC||!$('stats25-report')||!$('stats25-build'))return;
 const baseKinds=[
  ['overview','Überblick'],['spirometrySummary','Lungenfunktion – Zusammenfassung'],
  ['pefSummary','Peak-Flow – Zusammenfassung'],['auSummary','Arbeitsunfähigkeit'],
  ['laborSummary','Laborwerte'],['medications','Medikamentenplan'],
  ['vitalsSummary','Blutsauerstoff / Blutdruck / Puls – Zusammenfassung'],
  ['administration','Anträge, Termine, Tagebuch und Unterlagen'],
  ['hospital','Krankenhausaufenthalte'],['pulmonologist','Lungenarzttermine']
 ];
 const kinds=[['spo2','Blutsauerstoff – Diagramm'],['bp','Blutdruck – Diagramm'],['pulse','Puls – Diagramm'],
  ['weight','Gewicht – Diagramm'],['pef','Peak-Flow – Diagramm'],['lung','Lungenfunktion – Diagramme'],
  ['lungfull','Lungenfunktion – alle Befundwerte'],['diffusion','Diffusionsmessung – Diagramme'],
  ['difffull','Diffusion – alle Befundwerte'], ['sleep','Schlaflabor – Messwerte und Befunde'], ['sleepimages','Schlaflabor – Originaldiagramme und Befundseiten'], ['walk','Gehtest – Messwerte und Verlauf'], ['walkimages','Gehtest – Originalbefund'], ['imaging','Röntgen & CT – Diagnoseprotokolle'], ['imagingimages','Röntgen & CT – Bildvorschauen'], ['lungdiseases','Lungenerkrankungen – Diagnose- und Testprotokoll'], ['lungrights','Reha, Hilfsmittel & Rechte – Anträge'], ['providers','Ärzte & Krankenhäuser – Termine und Dokumente'], ['stairs','Treppenbelastung – Stufen und Gründe']];
 const allKinds=[...baseKinds,...kinds];
 const num=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
 const iso=s=>/^\d{4}-\d\d-\d\d$/.test(s||'')?s:'';
 const fmt=s=>iso(s)?s.slice(8)+'.'+s.slice(5,7)+'.'+s.slice(0,4):'–';
 const format=(n,d=1)=>n===null?'–':n.toLocaleString('de-DE',{minimumFractionDigits:0,maximumFractionDigits:d});
 const node=(tag,cls,t)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(t!==undefined)el.textContent=String(t);return el;};
 const nsum=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
 const makeDate=row=>String(row.date||'')+'T'+String(row.time||'12:00');
 const selected=Object.fromEntries(allKinds.map(x=>[x[0],true]));
 let sleepImageUrls=[];
 const controls=node('fieldset','s292-controls');controls.id='statsplus292-options';
 controls.append(node('legend','','Monats-/Jahresbericht: Bereiche für Druck und PDF auswählen'));
 controls.append(node('p','s292-note','Jedes Thema einzeln auswählbar. Nur markierte Abschnitte erscheinen im Ausdruck und in der lokal erzeugten PDF-Datei. Die Vorschau selbst enthält weiterhin alle Werte.')); 
 const options=node('div','s292-choices');
 for(const [id,label] of allKinds){
   const holder=node('label','s292-option'),check=document.createElement('input');check.type='checkbox';check.value=id;check.checked=true;check.setAttribute('aria-label',label);
   check.addEventListener('change',()=>{selected[id]=check.checked;applySelection()});holder.append(check,node('span','',label));options.append(holder);
 }
 controls.append(options);
 const selectionActions=node('div','s292-quick-select');
 const allBtn=node('button','','Alle auswählen'),noneBtn=node('button','','Keine auswählen');
 for(const b of [allBtn,noneBtn]){b.type='button';b.className='btn btn-outline';selectionActions.append(b);}
 const setAll=checked=>{for(const c of options.querySelectorAll('input[type=checkbox]')){c.checked=checked;selected[c.value]=checked;}applySelection();controls.dispatchEvent(new Event('change',{bubbles:true}));};
 allBtn.onclick=()=>setAll(true);noneBtn.onclick=()=>setAll(false);controls.append(selectionActions);
 const notice=node('p','s292-note');notice.id='s292-selection-status';controls.append(notice);
 const toolbar=$('stats25-build').closest('.stats25-controls');toolbar?.insertAdjacentElement('afterend',controls);
 // Interactive Inhaltsverzeichnis, generated from the actual report cards and
 // the same current selections used by the PDF/print renderer.
 function updateContents(){
   const report=$('stats25-report'),heading=report?.querySelector(':scope > .stats25-heading');
   report?.querySelector(':scope > #s292-contents')?.remove();
   if(!heading)return;
   const nav=node('nav','s292-contents');nav.id='s292-contents';nav.setAttribute('aria-label','Inhaltsverzeichnis des Gesundheitsberichts');
   const title=node('h3','','Inhaltsverzeichnis');nav.append(title);
   const note=node('p','s292-contents-note','Die Einträge entsprechen deiner aktuellen Druck- und PDF-Auswahl. Tippe auf einen Abschnitt, um dorthin zu springen.');nav.append(note);
   const ol=node('ol','s292-contents-list');
   let count=0;
   for(const [id,label] of allKinds){
     if(!selected[id])continue;
     const target=report.querySelector('[data-s292-base="'+id+'"]')||report.querySelector('[data-s292-kind="'+id+'"]');
     if(!target)continue;
     const anchorId='s292-report-section-'+id;target.id=anchorId;
     const li=node('li',''),link=node('a','',label);link.href='#'+anchorId;
     link.addEventListener('click',event=>{event.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});});
     li.append(link);ol.append(li);count++;
   }
   if(!count){nav.append(node('p','s292-contents-empty','Wähle mindestens einen Berichtsteil aus und berechne den Bericht.'));}
   else nav.append(ol);
   heading.insertAdjacentElement('afterend',nav);
 }
 function applySelection(){
   const report=$('stats25-report'),addon=$('statsplus292-appendix');
   const activeBase=baseKinds.some(([id])=>selected[id]);
   document.body.dataset.s292Old=activeBase?'on':'off';
   for(const [id] of baseKinds){const card=report?.querySelector('[data-s292-base="'+id+'"]');if(card)card.dataset.printEnabled=selected[id]?'true':'false';}
   for(const child of report?.children||[]){if(child.classList.contains('stats25-heading')||child.classList.contains('stats25-footer'))child.dataset.printEnabled=activeBase?'true':'false';}
   for(const [id] of kinds){const card=addon?.querySelector('[data-s292-kind="'+id+'"]');if(card)card.dataset.printEnabled=selected[id]?'true':'false';}
   if(addon){addon.dataset.printEnabled=kinds.some(([id])=>selected[id])?'true':'false';let first=true;for(const [id] of kinds){const card=addon.querySelector('[data-s292-kind="'+id+'"]');if(card){card.dataset.printFirst=selected[id]&&first?'true':'false';if(selected[id])first=false;}}}
   notice.textContent='Für Ausdruck/PDF ausgewählt: '+Object.values(selected).filter(Boolean).length+' von '+allKinds.length+' Bereichen.';
   report?.classList.toggle('s292-custom-print',!activeBase);
   updateContents();
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

     for(const p of pts){const bp=unit==='mmHg'&&series.some(a=>a[0]==='diastolic')?window.ASTHMA_BPA344?.classifyPart(p[key],key==='value'?'systolic':'diastolic'):null;const el=shape('circle',{cx:x(p),cy:y(num(p[key])),r:pts.length>160?2.1:4.7,fill:bp?.color||color,stroke:'#fff','stroke-width':1});const tip=document.createElementNS(svgNS,'title');tip.textContent=fmt(p.date)+' '+(p.time||'')+' · '+label+': '+format(num(p[key]),digits)+' '+unit;if(bp)tip.textContent+=' · '+bp.label;el.append(tip);}
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
     const [suite,epef,diary,providerDocs,providerDates,providerLabs]=await Promise.all(['suite','epef','diary','documents','calendar','labs'].map(name=>SEC.list(name)));
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
     const bpBlock=root.querySelector('[data-s292-kind="bp"]');if(bpBlock&&window.ASTHMA_BPA344){const count={};for(const r of bp){const cat=window.ASTHMA_BPA344.classify(r.value,r.diastolic);count[cat.key]=(count[cat.key]||0)+1;}const legend=node('p','s292-note','Blutdruck-Ampel: '+Object.entries(window.ASTHMA_BPA344.codes).map(([k,v])=>v.label+': '+(count[k]||0)).join(' · ')+'. Einzelwerte sind keine Diagnose; ärztliche Zielwerte gehen vor.');bpBlock.append(legend);}
     const pulse=vit.filter(x=>x.kind==='pulse'&&isValid(x.value,'pulse'));
     panel(root,'pulse','Puls',pulse,[{title:'Pulsverlauf',unit:'/min',series:[['value','Puls','#9366b8']]}],[['value','Puls (/min)',0],['source','Messquelle',-2]],{value:refs.pulse});
     const weight=weights.map(x=>({...x,value:num(x.kg)}));
     panel(root,'weight','Gewicht',weight,[{title:'Gewichtsverlauf',unit:'kg',series:[['value','Gewicht','#3c8c77']]}],[['value','Gewicht (kg)',1],['note','Notiz',-2]],{});
     if(!weights.length){const x=SEC.profileGet()?.personal?.weightKg;const w=num(x);const target=root.querySelector('[data-s292-kind="weight"]');target?.append(node('p','s292-note',w!==null&&w>0?'Im Profil hinterlegtes aktuelles Gewicht: '+format(w,1)+' kg. Ein zeitlicher Gewichtsverlauf entsteht erst durch datierte Gewichtseinträge.':'Für einen Gewichtsverlauf unter Vitalwerte regelmäßig Messungen speichern.'));}
     const handRows=pef.map(x=>({ ...x, pef:num(x.pef),fev1:num(x.fev1)})).filter(x=>x.pef!==null||x.fev1!==null);
     panel(root,'pef','Peak-Flow und FEV₁ (Heim-/Handmessung)',handRows,[{title:'PEF-Verlauf',unit:'l/min',series:[['pef','PEF','#217f9b']]},{title:'FEV₁-Verlauf (Handmessung)',unit:'l',series:[['fev1','FEV₁','#ce8248']]}],[['pef','PEF (l/min)',0],['fev1','FEV₁ (l)',2],['source','Herkunft',-2]],{pef:refs.pef});
     const lRows=lung.map(x=>({...x,fev1:num(x.fev1),fvc:num(x.fvc),fev1Liters:num(x.fev1Liters),fvcLiters:num(x.fvcLiters)}));
     panel(root,'lung','Ärztliche Lungenfunktion',lRows,[{title:'FEV₁ / FVC in % vom Soll',unit:'%',series:[['fev1','FEV₁ % Soll','#217f9b'],['fvc','FVC % Soll','#a662a1']]},{title:'FEV₁ / FVC in Litern',unit:'l',series:[['fev1Liters','FEV₁ l','#247e76'],['fvcLiters','FVC l','#d48748']]}],[['fev1','FEV₁ (% Soll)',1],['fvc','FVC (% Soll)',1],['fev1Liters','FEV₁ (l)',2],['fvcLiters','FVC (l)',2],['phase','Messphase',-2]],refs);

     const allLung=lung.filter(x=>Array.isArray(x.testRows));
     const allDiff=suite.filter(x=>x.type==='diffusion').map(x=>x.value).filter(within);
     const metricCodes=[['DLCO_SB','DLCO'],['KCO_SB','KCO'],['VA_SB','VA']];
     const diffusionRows=allDiff.map(x=>{
       const row={date:x.date,time:x.time||'',phase:x.phase||'unbekannt'};
       for(const [code,label] of metricCodes){const m=x.testRows?.find(r=>r.code===code);row[label+'Percent']=num(m?.percent);row[label+'Actual']=num(m?.actual);}
       return row;
     });
     panel(root,'diffusion','Diffusionsmessung – DLCO, KCO und VA',diffusionRows,
       [{title:'DLCO, KCO und VA – Prozent vom Soll',unit:'%',series:[['DLCOPercent','DLCO % Soll','#216b96'],['KCOPercent','KCO % Soll','#ad607d'],['VAPercent','VA % Soll','#23866b']]}],
       [['DLCOPercent','DLCO % Soll',1],['KCOPercent','KCO % Soll',1],['VAPercent','VA % Soll',1],['DLCOActual','DLCO Ist',2],['KCOActual','KCO Ist',2],['VAActual','VA Ist (l)',2],['phase','Messphase',-2]]);
     const labels={DLCO_SB:'DLCO',KCO_SB:'KCO',VA_SB:'Alveolarvolumen (VA)',Hb:'Hämoglobin',DLCOcSB:'DLCO korrigiert',KCOc_SB:'KCO korrigiert',TLC_SB:'TLC (Single Breath)',VIN_SB:'Einatemvolumen',TLC:'TLC (Body)',FVC:'FVC',FEV1:'FEV₁'};
     function fullTests(id,title,records){const box=node('section','s292-category');box.dataset.s292Kind=id;box.append(node('h3','',title));
       if(!records.length)box.append(node('p','s292-empty','Keine Befunde in diesem Zeitraum.'));
       const ordered=[...records].sort((a,b)=>makeDate(a).localeCompare(makeDate(b)));
       for(const rec of ordered){box.append(node('h4','',fmt(rec.date)+' '+(rec.time||'')+' – '+(rec.doctor||'Praxis nicht angegeben')));
         if(rec.note)box.append(node('p','s292-note',rec.note));
         const table=node('table','s292-table'),thead=node('thead'),head=node('tr');
         for(const title of ['Parameter','Ist','Soll','% Soll','Z-Score'])head.append(node('th','',title));thead.append(head);table.append(thead);
         const body=node('tbody');for(const measure of rec.testRows||[]){const row=node('tr');
           for(const cell of [labels[measure.code]||measure.code,measure.actual,measure.predicted,measure.percent,measure.z])row.append(node('td','',cell===null||cell===undefined?'–':typeof cell==='number'?format(cell,2):String(cell)));
           body.append(row);}table.append(body);const wrap=node('div','s292-table-wrap');wrap.append(table);box.append(wrap);
       }
       root.append(box);
     }
     fullTests('lungfull','Vollständige Lungenfunktionsbefunde',allLung);
     fullTests('difffull','Vollständige Diffusionsmessungen (Single Breath)',allDiff);
     // Schlaflabor: identisches, flaches Feldschema wie in schlaflabor340.js.
     // PSG, Polygraphie und PAP-Gerätewerte nicht künstlich gleichsetzen.
     const documents=(await SEC.list('documents')).filter(x=>x&&x.kind==='Schlaflaborbericht');
     const studies=suite.filter(x=>x.type==='sleep340').map(x=>x.value).filter(within);
     const sleepRows=studies.map(x=>({date:x.date,time:x.time||'12:00',type:x.studyType,
       ahi:x.studyType==='psg'?num(x.ahi):null,polyAhi:x.studyType==='polygraphy'?num(x.ahi):null,
       rei:x.studyType==='polygraphy'?num(x.rei):null,
       odi:num(x.odi),spo2min:num(x.spo2min),efficiency:num(x.efficiency),residualAhi:x.studyType==='pap'?num(x.residualAhi):null}));
     panel(root,'sleep','Schlaflabor – Messwerte und Untersuchungen',sleepRows,
       [{title:'AHI – Polysomnographie',unit:'Ereignisse/h',series:[['ahi','AHI','#1b7c90']]},
        {title:'AHI – ambulante Polygraphie',unit:'Ereignisse/h',series:[['polyAhi','AHI (Polygraphie)','#1b7c90']]},
        {title:'REI – Polygraphie',unit:'Ereignisse/h',series:[['rei','REI','#aa7040']]},
        {title:'ODI – Sauerstoffabfallindex',unit:'Abfälle/h',series:[['odi','ODI','#8b5daa']]},
        {title:'SpO₂ – Tiefstwert im Schlaf',unit:'%',series:[['spo2min','SpO₂ Min','#366fa1']]},
        {title:'Rest-AHI – PAP-Geräteauswertung',unit:'Ereignisse/h',series:[['residualAhi','Rest-AHI','#258578']]}],
       [['ahi','AHI (Ereignisse/h)',1],['polyAhi','AHI Polygraphie (Ereignisse/h)',1],['rei','REI (Ereignisse/h)',1],['odi','ODI (Abfälle/h)',1],
        ['spo2min','SpO₂ Minimum (%)',1],['efficiency','Schlafeffizienz (%)',1],['residualAhi','Rest-AHI PAP (/h)',1],['type','Untersuchungsart',-2]]);
     const sleepBox=root.querySelector('[data-s292-kind="sleep"]');
     const sleepLabels={
       ahi:'AHI (Ereignisse/h)',rdi:'RDI (Ereignisse/h)',rei:'REI (Ereignisse/h)',odi:'ODI (Abfälle/h)',
       spo2mean:'SpO₂ Durchschnitt (%)',spo2min:'SpO₂ Minimum (%)',t90:'T90 – Zeit unter 90 % SpO₂ (%)',
       obstructive:'Obstruktive Apnoen (Anzahl)',central:'Zentrale Apnoen (Anzahl)',mixed:'Gemischte Apnoen (Anzahl)',
       hypopnea:'Hypopnoen (Anzahl)',cai:'CAI (/h)',oai:'OAI (/h)',tst:'Gesamtschlafzeit (Minuten)',
       tib:'Zeit im Bett (Minuten)',efficiency:'Schlafeffizienz (%)',sleepLatency:'Einschlaflatenz (Minuten)',
       remLatency:'REM-Latenz (Minuten)',waso:'Wachzeit nach Einschlafen (Minuten)',
       n1:'Schlaf N1 (%)',n2:'Schlaf N2 (%)',n3:'Tiefschlaf N3 (%)',rem:'REM-Schlaf (%)',
       arousal:'Arousal-Index (/h)',plmi:'PLMI (/h)',snoring:'Schnarchanteil (%)',pressure:'PAP-Druck (cmH₂O)',
       pressureMin:'APAP Mindestdruck (cmH₂O)',pressureMax:'APAP Höchstdruck (cmH₂O)',
       residualAhi:'Rest-AHI unter PAP (/h)',usage:'PAP-Nutzung (Stunden/Nacht)',leak:'Maskenleckage (l/min)',
       usePercent:'Nächte mit PAP-Nutzung (%)',ess:'Epworth-Schläfrigkeitsskala (Punkte)',
       t90min:'Zeit unter 90 % SpO₂ (Minuten)',t88min:'Zeit unter 88 % SpO₂ (Minuten)',
       hrMean:'Puls im Schlaf Durchschnitt (/min)',hrMin:'Puls im Schlaf Minimum (/min)',
       hrMax:'Puls im Schlaf Maximum (/min)',co2max:'CO₂ Höchstwert (mmHg)',
       ahiSupine:'AHI Rückenlage (/h)',ahiOther:'AHI außerhalb Rückenlage (/h)',
       pressureI:'BiPAP Einatemdruck IPAP (cmH₂O)',pressureE:'BiPAP Ausatemdruck EPAP (cmH₂O)'
     };
     if(sleepBox){
       if(!studies.length)sleepBox.append(node('p','s292-note','Keine Schlaflaborbefunde im ausgewählten Zeitraum.'));
       for(const rec of [...studies].sort((a,b)=>a.date.localeCompare(b.date))){
         const types={psg:'Polysomnographie',polygraphy:'Polygraphie',pap:'PAP-Geräteauswertung',other:'Sonstige Schlafuntersuchung'};
         sleepBox.append(node('h4','',fmt(rec.date)+' · '+(types[rec.studyType]||'Schlafuntersuchung')+' · '+(rec.doctor||'Ort nicht angegeben')));
         if(rec.papMode)sleepBox.append(node('p','s292-note','PAP-Modus: '+rec.papMode));
         if(rec.odiRule)sleepBox.append(node('p','s292-note','ODI-Schwelle: '+rec.odiRule+' %'));
         if(rec.diagnosis)sleepBox.append(node('p','s292-note','Ärztliche Beurteilung: '+rec.diagnosis));
         if(rec.recommendation)sleepBox.append(node('p','s292-note','Therapieempfehlung: '+rec.recommendation));
         if(rec.symptoms)sleepBox.append(node('p','s292-note','Beschwerden: '+rec.symptoms));
         if(rec.device)sleepBox.append(node('p','s292-note','Gerät / Maske: '+rec.device));
         if(rec.note)sleepBox.append(node('p','s292-note','Notiz: '+rec.note));
         const tab=node('table','s292-table'),thead=node('thead'),head=node('tr'),body=node('tbody');
         for(const h of ['Befundwert','Messung'])head.append(node('th','',h));thead.append(head);tab.append(thead);
         let count=0;
         for(const [key,label] of Object.entries(sleepLabels)){
           const value=num(rec[key]);if(value===null)continue;
           const tr=node('tr');tr.append(node('td','',label),node('td','',format(value,2)));body.append(tr);count++;
         }
         if(count){tab.append(body);const wrap=node('div','s292-table-wrap');wrap.append(tab);sleepBox.append(wrap)}
         const attachments=documents.filter(d=>d.kind==='Schlaflaborbericht'&&d.studyId===rec.id);
         if(attachments.length)sleepBox.append(node('p','s292-note','Gespeicherte Originale (in der privaten Akte): '+attachments.map(d=>String(d.name||'Dokument').slice(0,160)).join(' · ')));
       }
     }
     // Dokumentenfotos sind NUR aus dem lokalen verschlüsselten Tresor gelesen.
     // Kein Rohbild im öffentlichen JavaScript, kein Serverupload.
     sleepImageUrls.forEach(u=>URL.revokeObjectURL(u));sleepImageUrls=[];
     const imgBox=node('section','s292-category s341-report');imgBox.dataset.s292Kind='sleepimages';
     imgBox.append(node('h3','','Schlaflabor – Originaldiagramme und Befundseiten'));
     const selectedStudyIds=new Set(studies.map(rec=>rec.id));
     const linked=documents.filter(d=>selectedStudyIds.has(d.studyId)&&d.blob instanceof Blob&&String(d.mime||d.blob.type).startsWith('image/'))
       .sort((a,b)=>(a.documentDate||'').localeCompare(b.documentDate||'')||(a.sortIndex||99)-(b.sortIndex||99));
     if(!linked.length)imgBox.append(node('p','s292-note','Keine Originaldiagramme im gewählten Zeitraum im verschlüsselten Tresor gespeichert.'));
     for(const d of linked){
       const figure=node('figure','s341-report-image');
       const caption=node('figcaption','',fmt(d.documentDate||studies.find(s=>s.id===d.studyId)?.date)+' · '+(d.caption||d.name||'Originaldiagramm'));
       const image=document.createElement('img');const url=URL.createObjectURL(d.blob);sleepImageUrls.push(url);
       image.src=url;image.alt=d.caption||d.name||'Schlaflabor Originaldiagramm';image.loading='eager';
       figure.append(caption,image);imgBox.append(figure);
     }
     root.append(imgBox);
     // Neue Gehtests: eigene Messreihe und zeitliche Vor-/Nachbelastungswerte.
     const walks=suite.filter(x=>x.type==='walk342').map(x=>x.value).filter(within);
     const walkRows=walks.map(x=>({date:x.date,time:x.timePost||x.timePre||'',distance:num(x.distance),duration:num(x.duration),
       spo2Pre:num(x.spo2Pre),spo2Post:num(x.spo2Post),sao2Pre:num(x.sao2Pre),sao2Post:num(x.sao2Post),
       po2Pre:num(x.po2Pre),po2Post:num(x.po2Post),pco2Pre:num(x.pco2Pre),pco2Post:num(x.pco2Post),
       phPre:num(x.phPre),phPost:num(x.phPost),bePre:num(x.bePre),bePost:num(x.bePost),hco3Pre:num(x.hco3Pre),hco3Post:num(x.hco3Post),
       clinic:x.doctor||'',testType:x.testType||'six',oxygen:x.oxygen||'unknown'}));
     panel(root,'walk','Gehtest / Belastungstest – 6-Minuten-Gehtest und Blutgase',walkRows,
       [{title:'Gehstrecke',unit:'m',series:[['distance','Gehstrecke','#207e97']]},
        {title:'SaO₂ vor/nach Belastung',unit:'%',series:[['sao2Pre','Vorher','#9c6e45'],['sao2Post','Nachher','#2c807c']]},
        {title:'SpO₂ vor/nach Belastung',unit:'%',series:[['spo2Pre','Vorher','#9c6e45'],['spo2Post','Nachher','#2c807c']]},
        {title:'pH vor/nach Belastung',unit:'pH',series:[['phPre','Vorher','#8b618d'],['phPost','Nachher','#2c807c']]}],
       [['distance','Gehstrecke (m)',1],['duration','Belastung (min)',1],['spo2Pre','SpO₂ vorher (%)',1],['spo2Post','SpO₂ nachher (%)',1],
        ['sao2Pre','SaO₂ vorher (%)',1],['sao2Post','SaO₂ nachher (%)',1],
        ['po2Pre','pO₂ vorher (Einheit prüfen)',1],['po2Post','pO₂ nachher (Einheit prüfen)',1],
        ['pco2Pre','pCO₂ vorher (Einheit prüfen)',1],['pco2Post','pCO₂ nachher (Einheit prüfen)',1],
        ['phPre','pH vorher',2],['phPost','pH nachher',2],['bePre','BE vorher',1],['bePost','BE nachher',1],
        ['hco3Pre','HCO₃ vorher',1],['hco3Post','HCO₃ nachher',1],['clinic','Klinik',-2]]);
     const walkBox=root.querySelector('[data-s292-kind="walk"]');
     if(walkBox)for(const rec of [...walks].sort((a,b)=>a.date.localeCompare(b.date))){
       walkBox.append(node('h4','',fmt(rec.date)+' · '+(rec.doctor||'Ort unbekannt')));
       walkBox.append(node('p','s292-note','Test: '+(rec.testType==='six'?'6-Minuten-Gehtest':'Belastungstest')+'; '+(rec.oxygen==='no'?'ohne zusätzliches O₂':rec.oxygen==='yes'?'mit O₂':'O₂ nicht dokumentiert')+'; BGA-Probenart: '+(rec.sampleType||'unbekannt')+'; Gaswerte: '+(rec.gasUnit==='unknown'?'Einheit im Befund nicht angegeben':rec.gasUnit)+'.'));
       if(rec.comment)walkBox.append(node('p','s292-note',rec.comment));
       if(rec.note)walkBox.append(node('p','s292-note',rec.note));
     }
     const walkAttachments=(await SEC.list('documents')).filter(d=>d.kind==='Gehtestbericht'&&walks.some(w=>w.id===d.studyId)&&d.blob instanceof Blob);
     const walkImageBox=node('section','s292-category s341-report');walkImageBox.dataset.s292Kind='walkimages';
     walkImageBox.append(node('h3','','Gehtest – Originalbefunde'));
     if(!walkAttachments.length)walkImageBox.append(node('p','s292-note','Keine Originalbefunde in diesem Zeitraum gespeichert.'));
     for(const d of walkAttachments){
       const figure=node('figure','s341-report-image');figure.append(node('figcaption','',fmt(d.documentDate||'')+' · '+(d.caption||d.name||'Gehtestbefund')));
       if(String(d.mime||d.blob.type).startsWith('image/')){
         const image=document.createElement('img'),url=URL.createObjectURL(d.blob);sleepImageUrls.push(url);image.src=url;image.alt=d.caption||'Gehtestbefund';image.loading='eager';figure.append(image);
       }else figure.append(node('p','s292-note','Original-PDF in der privaten Akte: '+d.name));
       walkImageBox.append(figure);
     }
     root.append(walkImageBox);
     // Röntgen/CT: nur vom Anwender bestätigte, vorhandene ärztliche Befundtexte.
     const examinations=suite.filter(x=>x.type==='imaging343').map(x=>x.value).filter(within).sort((a,b)=>a.date.localeCompare(b.date));
     const imagingSection=node('section','s292-category');imagingSection.dataset.s292Kind='imaging';
     imagingSection.append(node('h3','','Röntgen & CT – Diagnoseprotokolle'));
     if(!examinations.length)imagingSection.append(node('p','s292-note','Keine Röntgen-/CT-Untersuchungen im gewählten Zeitraum.'));
     for(const rec of examinations){
       imagingSection.append(node('h4','',fmt(rec.date)+' · '+(rec.modality==='ct'?'CT':'Röntgen')+' · '+(rec.region||'Körperregion nicht angegeben')));
       const parts=[['Klinik',rec.clinic],['Arzt',rec.doctor],['Kontrastmittel',rec.contrast==='yes'?'mit':rec.contrast==='no'?'ohne':rec.contrast==='both'?'mit und ohne':'nicht angegeben'],['CTDIvol (mGy)',rec.ctdi],['DLP (mGy·cm)',rec.dlp],['Indikation',rec.indication],['Radiologischer Befund',rec.findings],['Ärztliche Beurteilung / Diagnose',rec.assessment],['Vergleich mit Voruntersuchungen',rec.comparison],['Weiteres Vorgehen',rec.recommendation],['Eigene Notizen',rec.notes]];
       for(const [label,value] of parts)if(value!==undefined&&value!==null&&value!=='')imagingSection.append(node('p','s292-note',label+': '+String(value)));
     }
     imagingSection.append(node('p','s292-note','Protokollierte ärztliche Angaben – keine selbstständige Diagnose aus Bildpixeln.'));
     root.append(imagingSection);
     const imgSection=node('section','s292-category s341-report');imgSection.dataset.s292Kind='imagingimages';
     imgSection.append(node('h3','','Röntgen & CT – Bildvorschauen / Originaldateien'));
     const examIds=new Set(examinations.map(x=>x.id));
     const imgDocs=(await SEC.list('documents')).filter(d=>d.kind==='Bildgebung'&&examIds.has(d.studyId)&&d.blob instanceof Blob);
     if(!imgDocs.length)imgSection.append(node('p','s292-note','Keine Röntgen-/CT-Originaldateien in diesem Zeitraum gespeichert.'));
     let count=0;
     for(const d of imgDocs){
       const figure=node('figure','s341-report-image');figure.append(node('figcaption','',fmt(d.documentDate||'')+' · '+(d.name||'Bildgebung')));
       const isImage=/\.(jpg|jpeg|png|webp)$/i.test(d.name||'');const isDicom=/\.(dcm|dicom|ima)$/i.test(d.name||'');
       if(count<12&&(isImage||isDicom)){
         try{
           let url;
           if(isDicom){
             const parsed=await window.ASTHMA_DICOM343.parse(d.blob);const canvas=document.createElement('canvas');window.ASTHMA_DICOM343.render(parsed,canvas,0);
             const copy=document.createElement('canvas'),scale=Math.min(1,850/Math.max(canvas.width,canvas.height));copy.width=Math.max(1,Math.round(canvas.width*scale));copy.height=Math.max(1,Math.round(canvas.height*scale));copy.getContext('2d').drawImage(canvas,0,0,copy.width,copy.height);
             url=copy.toDataURL('image/jpeg',0.73);
           }else{url=URL.createObjectURL(d.blob);sleepImageUrls.push(url);}
           const pic=document.createElement('img');pic.src=url;pic.alt='Radiologisches Originalbild, keine automatische Diagnose';pic.loading='eager';figure.append(pic);count++;
         }catch(err){figure.append(node('p','s292-note','Keine Vorschau für dieses Bildformat; Originaldatei ist in der Akte vorhanden.'));}
       }else figure.append(node('p','s292-note','Originaldatei in der privaten Akte; Vorschau im Bildgebung-Bereich (oder PDF/komprimiertes DICOM).'));
       imgSection.append(figure);
     }
     root.append(imgSection);

     // Eigenständige Lungenerkrankungen und Sozialrecht, bereits gespeicherte Werte bleiben in ihren Originalmodulen.
     const diseaseNames={asthma:'Asthma',copd:'COPD',cancer:'Lungenkrebs',fibrosis:'Lungenfibrose / ILD',bronchiectasis:'Bronchiektasen',emphysema:'Lungenemphysem',ph:'Pulmonale Hypertonie',pneumonia:'Lungenentzündung',embolism:'Lungenembolie',aat:'Alpha-1-Antitrypsinmangel',other:'Andere Lungenerkrankung'};
     const lungState=suite.filter(x=>x.type==='lung344').map(x=>x.value).filter(x=>x&&x.status!=='none'&&x.date&&within(x));
     const lungTests=suite.filter(x=>x.type==='lung344test').map(x=>x.value).filter(within);
     const illnesses=node('section','s292-category');illnesses.dataset.s292Kind='lungdiseases';illnesses.append(node('h3','','Lungenerkrankungen – dokumentierte Einordnung und Untersuchungen'));
     if(!lungState.length&&!lungTests.length)illnesses.append(node('p','s292-note','Keine zusätzlich dokumentierte ärztliche Einordnung oder Untersuchungen im ausgewählten Zeitraum. Die Krankheitsmodule stellen keine Diagnosen.'));
     for(const d of lungState){const t=node('p','s292-note',(diseaseNames[d.condition]||d.condition)+' · Status: '+({confirmed:'ärztlich bestätigt',suspected:'ärztlich dokumentierter Verdacht',investigation:'Abklärung läuft',excluded:'ärztlich ausgeschlossen'}[d.status]||d.status)+' · '+fmt(d.date)+' · '+(d.doctor||'Arzt nicht angegeben'));illnesses.append(t);if(d.diagnosis)illnesses.append(node('p','s292-note','Ärztlicher Wortlaut: '+d.diagnosis));}
     for(const x of lungTests){illnesses.append(node('p','s292-note',fmt(x.date)+' · '+(diseaseNames[x.condition]||x.condition)+' · '+x.test+': '+x.result+(x.unit?' '+x.unit:'')+(x.reference?' (Referenz '+x.reference+')':'')+(x.doctor?' · '+x.doctor:'')));}
     root.append(illnesses);
     const lungAidTitles={reha:'Lungen-Reha',choice:'Wunsch- und Wahlrecht',tools:'Hilfsmittel',ltot:'Sauerstoff/Beatmung',disability:'GdB/Gleichstellung',bem:'BEM/Arbeitsplatz',dmp:'DMP',cancerreha:'Onkologische Reha',oncology:'Krebsberatung',palliative:'Palliativversorgung',objection:'Widerspruch',care:'Pflegegrad/Pflegehilfsmittel'};
     const aids=suite.filter(x=>x.type==='lung344aid').map(x=>x.value).filter(x=>x&&x.date&&within(x));
     const rights=node('section','s292-category');rights.dataset.s292Kind='lungrights';rights.append(node('h3','','Reha, Hilfsmittel & Rechte – dokumentierte Vorgänge'));
     if(!aids.length)rights.append(node('p','s292-note','Keine neuen Anträge in diesem Zeitraum protokolliert. Vorhandene Anträge können zusätzlich unter „Anträge“ verwaltet werden.'));
     for(const a of aids)rights.append(node('p','s292-note',(diseaseNames[a.condition]||a.condition)+' · '+(lungAidTitles[a.type]||a.type)+' · '+a.status+' · Antrag '+fmt(a.date)+(a.authority?' · '+a.authority:'')+(a.deadline?' · Frist laut Eingabe '+fmt(a.deadline):'')+(a.note?' · '+a.note:'')));
     rights.append(node('p','s292-note','Die Aufstellung ist keine automatische Rechtsprüfung. Fristen immer anhand des Originalbescheids prüfen.'));
     root.append(rights);
     // Consolidated doctor's / hospital chapter: never duplicate clinical records,
     // and only include entries that actually fall within this report period.
     const facilities=suite.filter(x=>x.type==='provider343').map(x=>x.value).filter(x=>x?.id&&x?.name);
     const appointments=providerDates.filter(x=>within(x));
     const medicalDocs=providerDocs.filter(x=>{
       const d=x.documentDate||x.date||x.createdAt?.slice(0,10)||'';
       return iso(d)&&d>=r.from&&d<=r.to;
     });
     const providerLabRows=providerLabs.filter(x=>within(x));
     const providerClinical=suite.filter(x=>['measurements','diffusion','sleep340','walk342','imaging343','lung344test'].includes(x.type)&&within(x.value));
     const manualProviderLinks=new Map(suite.filter(x=>x.type==='providerlink343'&&x.value?.entityKey&&x.value?.providerId).map(x=>[x.value.entityKey,x.value.providerId]));
     const providerSection=node('section','s292-category');providerSection.dataset.s292Kind='providers';
     providerSection.append(node('h3','','Ärzte & Krankenhäuser – Termine, Befunde und Originaldateien'));
     const normalizeName=v=>String(v||'').normalize('NFKC').trim().toLocaleLowerCase('de-DE').replace(/\s+/g,' ');
     const facilityFor=(row,group='')=>{
       const explicit=manualProviderLinks.get(group+'|'+String(row?.id||''));
       if(explicit){const linked=facilities.find(p=>p.id===explicit);if(linked)return linked;}
       if(row?.providerId){const exact=facilities.find(p=>p.id===row.providerId);if(exact)return exact;}
       const sources=[row?.providerName,row?.doctor,row?.clinic,row?.hospitalName,row?.hospital,row?.place,row?.practice].map(normalizeName).filter(Boolean);
       const matches=facilities.filter(p=>{
         const names=[p.name,...String(p.aliases||'').split(';')].map(normalizeName).filter(Boolean);
         return sources.some(s=>names.includes(s));
       });
       return matches.length===1?matches[0]:null;
     };
     const providerItems=[];
     for(const v of appointments)providerItems.push({date:v.date,kind:'Arzttermin',title:v.title||'Termin',row:v,provider:facilityFor(v,'calendar')});
     for(const v of medicalDocs){providerItems.push({date:v.documentDate||v.date||v.createdAt?.slice(0,10),kind:v.kind||'Dokument',title:v.name||'Datei',row:v,provider:facilityFor(v,'documents')});}
     for(const v of providerLabRows){providerItems.push({date:v.date,kind:'Labor',title:(v.marker||v.label||'Laborwert')+': '+(v.value??'–')+(v.unit?' '+v.unit:''),row:v,provider:facilityFor(v,'labs')});}
     for(const item of providerClinical){
       const v=item.value;
       const provider=facilityFor(v,'suite')||facilities.find(p=>manualProviderLinks.get('suite|'+String(item.key||v.id))===p.id)||null;
       const kind={measurements:'Lungenfunktion',diffusion:'Diffusionsmessung',sleep340:'Schlaflabor',walk342:'Gehtest',imaging343:'Röntgen/CT',lung344test:'Lungenerkrankungstest'}[item.type]||item.type;
       if(!provider&&!v.doctor&&!v.clinic&&!v.providerId)continue;
       providerItems.push({date:v.date,kind,title:v.test||v.region||v.studyType||kind,row:v,provider});
     }
     providerItems.sort((a,b)=>(a.date||'').localeCompare(b.date||'')||a.kind.localeCompare(b.kind));
     providerSection.append(node('p','s292-note',facilities.length+' hinterlegte Arzt-/Klinikakten · '+appointments.length+' Termine · '+medicalDocs.length+' Dokumente · '+providerLabRows.length+' Laborwerte · '+providerClinical.length+' klinische Untersuchungen im Berichtszeitraum. Bei fehlenden Einrichtungenamen werden Einträge als nicht zugeordnet angezeigt.'));
     if(!providerItems.length)providerSection.append(node('p','s292-note','Keine dokumentierten Arzttermine, Laborwerte oder Originaldateien in diesem Zeitraum.'));
     for(const provider of facilities){
       const items=providerItems.filter(item=>item.provider?.id===provider.id);
       if(!items.length)continue;
       providerSection.append(node('h4','',provider.name+' · '+({hospital:'Krankenhaus',pulmonologist:'Lungenarzt',gp:'Hausarzt',other:'Behandlungsstelle'}[provider.kind]||'Praxis')));
       for(const item of items)providerSection.append(node('p','s292-note',fmt(item.date)+' · '+item.kind+' · '+item.title));
     }
     for(const item of providerItems.filter(item=>!item.provider))providerSection.append(node('p','s292-note',fmt(item.date)+' · '+item.kind+' · '+item.title+' · '+(item.row?.clinic||item.row?.doctor||item.row?.providerName||item.row?.place||'Nicht zugeordnet')));
     providerSection.append(node('p','s292-note','Nur Metadaten und dokumentierte Angaben werden gelistet; Originaldateien bleiben verschlüsselt im Tresor und werden hier nicht automatisch als unverschlüsselte Kopie eingebettet.'));
     root.append(providerSection);
     // Kurzbefehle/Treppenzähler: original daily counts are retained and dated.
     const stairEntries=suite.filter(x=>x.type==='stairs').map(x=>x.value).filter(within).sort((a,b)=>(a.date+' '+(a.time||'')).localeCompare(b.date+' '+(b.time||'')));
     const stairSection=node('section','s292-category');stairSection.dataset.s292Kind='stairs';stairSection.append(node('h3','','Treppenbelastung – dokumentierte Stufen'));
     const totalSteps=stairEntries.reduce((sum,r)=>sum+(Number.isFinite(Number(r.steps))&&Number(r.steps)>0?Number(r.steps):0),0);
     stairSection.append(node('p','s292-note',stairEntries.length+' erfasste Treppeneinträge · '+totalSteps.toLocaleString('de-DE')+' Stufen im Berichtszeitraum. Einträge sind keine automatische Belastungs- oder Höhenmessung.'));
     if(!stairEntries.length)stairSection.append(node('p','s292-note','Keine Treppenprotokolle im ausgewählten Zeitraum.'));
     const dailyTotals=new Map();for(const r of stairEntries){const n=Number(r.steps);if(Number.isFinite(n)&&n>0)dailyTotals.set(r.date,(dailyTotals.get(r.date)||0)+n);}
     for(const [date,steps] of dailyTotals)stairSection.append(node('p','s292-note',fmt(date)+' · '+steps.toLocaleString('de-DE')+' Stufen'));
     for(const r of stairEntries)stairSection.append(node('p','s292-note',(r.time||'–')+' · '+String(r.steps||'–')+' Stufen'+(r.reason?' · Grund: '+r.reason:'')));
     root.append(stairSection);


     root.append(node('p','s292-disclaimer','Gemessene Verläufe sind keine Diagnose. Durchgezogene Linien zeigen Messwerte, gestrichelte Linien ausschließlich manuell hinterlegte persönliche Vergleiche. Bei auffälligen Werten ärztliche Beurteilung einholen. Diese gedruckten Gesundheitsdaten sind unverschlüsselt.'));
     report.append(root);lastKey=r.key;applySelection();
   })();loading=job;
   try{await job}finally{window.__s292Building=false;if(loading===job)loading=null;}
 }
 window.ASTHMA_STATSP292=Object.freeze({append,getLastKey:()=>lastKey,applySelection,selected:()=>({...selected}),baseKinds,kinds});
})();
