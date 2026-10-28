/* Asthma 3.2.6 – independent DLCO/VA/KCO long-term chart.
  Source: encrypted local suite records only, no external calls. */
(()=>{'use strict';
 const S=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);
 const anchor=$('dl324-diff');if(!S||!anchor)return;
 const panel=document.createElement('div');panel.id='dlco326';panel.className='dlco326-panel';
 panel.innerHTML='<h4>Diffusionsmessung: Zeitverlauf</h4><p>Messpunkte aus gespeicherten Befunden. Nur echte Messungen – keine geschätzten Werte. Die SpO₂ wird hier nicht dargestellt.</p><div class="dlco326-controls"><label>Zeitraum<select id="dlco326-period"><option value="1">Tag</option><option value="7">Woche</option><option value="30">Monat</option><option value="365">Jahr</option><option value="3652" selected>10 Jahre</option><option value="all">Alle</option></select></label><label>Messwert<select id="dlco326-metric"><option value="DLCO_SB">DLCO (% Soll)</option><option value="DLCOcSB">DLCO korrigiert (% Soll)</option><option value="KCO_SB">KCO (% Soll)</option><option value="KCOc_SB">KCO korrigiert (% Soll)</option><option value="VA_SB">VA (% Soll)</option><option value="DLCO_SB-actual">DLCO (Istwert)</option><option value="KCO_SB-actual">KCO (Istwert)</option><option value="VA_SB-actual">VA (Istwert)</option></select></label></div><div id="dlco326-summary" role="status" aria-live="polite"></div><div id="dlco326-graph"></div><p class="dlco326-muted">DLCO, KCO und VA sind unterschiedliche Messgrößen. Vergleich nur bei ähnlichen Untersuchungsbedingungen, Messqualität und Hämoglobinwert sinnvoll.</p>';
 anchor.insertAdjacentElement('afterend',panel);
 const periods=$('dlco326-period'),metric=$('dlco326-metric'),out=$('dlco326-graph'),summary=$('dlco326-summary');
 const ns='http://www.w3.org/2000/svg';
 function dateValid(d){return typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(new Date(d+'T12:00:00').valueOf())}
 function n(x){return typeof x==='number'&&Number.isFinite(x)?x:null}
 function fmt(v){return new Intl.NumberFormat('de-DE',{maximumFractionDigits:2}).format(v)}
 function formatDate(d){return d.slice(8,10)+'.'+d.slice(5,7)+'.'+d.slice(0,4)}
 function startDate(period){if(period==='all')return '0000-00-00';const x=new Date();x.setHours(12,0,0,0);if(period==='3652')x.setFullYear(x.getFullYear()-10);else if(period==='365')x.setFullYear(x.getFullYear()-1);else x.setDate(x.getDate()-Number(period)+1);return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-')}
 function toPoints(rows,selected,period){const [code,kind]=selected.split('-');const cut=startDate(period);return rows.filter(r=>r.type==='diffusion'&&r.value&&dateValid(r.value.date)&&r.value.date>=cut).map(r=>{
  const m=(r.value.testRows||[]).find(x=>x.code===code);const v=n(m?.[kind==='actual'?'actual':'percent']);if(v===null)return null;
  return {date:r.value.date,time:r.value.time||'00:00',id:r.value.id||'',phase:r.value.phase||'unbekannt',value:v};
 }).filter(Boolean).sort((a,b)=>(a.date+' '+a.time).localeCompare(b.date+' '+b.time)||a.id.localeCompare(b.id));}
 function e(tag,attributes,parent){const t=document.createElementNS(ns,tag);Object.entries(attributes||{}).forEach(([k,v])=>t.setAttribute(k,String(v)));parent?.append(t);return t}
 function draw(points,selected){out.replaceChildren();const actual=selected.endsWith('-actual'),code=selected.replace('-actual','');const unit=actual?(code==='DLCO_SB'?'mmol/(min·kPa)':code==='KCO_SB'?'mmol/(min·kPa·l)':'Liter'):'% Soll';
  if(!points.length){const msg=document.createElement('p');msg.textContent='Keine gespeicherte Diffusionsmessung mit diesem Wert in diesem Zeitraum. Bitte zuerst die private Befunddatei im Abschnitt Lungenfunktion importieren.';out.append(msg);summary.textContent='0 gespeicherte Messpunkte';return;}
  summary.textContent=points.length+' Messpunkt'+(points.length!==1?'e':'')+' · letzter: '+formatDate(points.at(-1).date)+' – '+fmt(points.at(-1).value)+' '+unit;
  const W=540,H=260,L=65,R=20,T=24,B=49;
  const vals=points.map(p=>p.value);let lo=Math.min(...vals),hi=Math.max(...vals);const margin=Math.max(hi-lo,Math.abs(hi)*.09,1);lo=Math.max(0,lo-margin);hi+=margin;const span=hi-lo||1;
  const svg=e('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':code+' '+unit+': '+points.length+' Werte',class:'dlco326-svg'},out);
  for(let i=0;i<=4;i++){const y=T+(H-T-B)*i/4;e('line',{x1:L,y1:y,x2:W-R,y2:y,stroke:'#dce7ee','stroke-width':1},svg);const label=e('text',{x:L-9,y:y+5,'font-size':14,'text-anchor':'end',fill:'#526976'},svg);label.textContent=fmt(hi-(hi-lo)*i/4)}
  const pos=(v,i)=>({x:L+(points.length===1?(W-L-R)/2:i*(W-L-R)/(points.length-1)),y:T+(hi-v)/span*(H-T-B)});
  const maxLabels=points.length<=7?points.map((_,i)=>i):[0,Math.floor((points.length-1)/2),points.length-1];
  for(const i of [...new Set(maxLabels)]){const x=pos(points[i].value,i).x;const text=e('text',{x,y:H-16,fill:'#536b75','text-anchor':'middle','font-size':12},svg);text.textContent=points[i].date.slice(8)+'.'+points[i].date.slice(5,7)+'.'+points[i].date.slice(2,4)}
  let prev=null;points.forEach((p,i)=>{const xy=pos(p.value,i);if(prev&&prev.phase===p.phase)e('line',{x1:prev.xy.x,y1:prev.xy.y,x2:xy.x,y2:xy.y,stroke:'#1d7992','stroke-width':3},svg);const c=e('circle',{cx:xy.x,cy:xy.y,r:6.5,fill:'#1d7992',stroke:'white','stroke-width':2},svg);const title=e('title',{},c);title.textContent=formatDate(p.date)+' '+p.time+': '+fmt(p.value)+' '+unit;prev={xy,phase:p.phase}});
  const x=e('text',{x:L,y:15,'font-size':14,fill:'#466477'},svg);x.textContent=unit;
  const tip=document.createElement('p');tip.className='dlco326-muted';tip.textContent=points.length===1?'Ein einzelner Befund ist als Messpunkt dargestellt. Für einen Trend sind mindestens zwei Untersuchungen erforderlich.':'Linien verbinden nur Messpunkte mit gleicher dokumentierter Messphase; für Details die Tabelle im Bereich Diffusionsmessung öffnen.';out.append(tip);
 }
 let run=0;
 async function refresh(){const id=++run;try{if(!S.state().unlocked){summary.textContent='Gesundheitsakte zuerst entsperren.';return}const rows=await S.list('suite');if(id!==run)return;draw(toPoints(rows,metric.value,periods.value),metric.value);}catch(ex){summary.textContent='Messwerte konnten nicht gelesen werden: '+ex.message}}
 periods.onchange=metric.onchange=refresh;
 let timer;window.addEventListener('asthma:secure-change',ev=>{if(ev.detail?.group==='suite'){clearTimeout(timer);timer=setTimeout(refresh,120)}});
 window.addEventListener('asthma:lung-study-imported',refresh);
 window.addEventListener('asthma:profile-reset',refresh);
 window.__ASTHMA_DLCO326_TEST=Object.freeze({toPoints,startDate});
 refresh();
})();
