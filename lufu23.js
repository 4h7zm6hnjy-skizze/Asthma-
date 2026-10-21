'use strict';
/* Asthma 2.3: locally decrypted, confirmed spirometry; NOT ePEF meter readings.
 * No HTTP requests, CDN, tracking or automatic changes to any patient's data. */
(()=>{
  const $=id=>document.getElementById(id);
  const SEC=window.ASTHMA_SECURITY;
  if(!SEC || !$('home-lufu23') || !$('lufu23-detail'))return;
  const NS='http://www.w3.org/2000/svg';
  const colors={fev1:'#126b80',fvc:'#a05dba',fev1Liters:'#126b80',fvcLiters:'#a05dba',ratio:'#126b80'};
  const units={fev1:'% Soll',fvc:'% Soll',fev1Liters:'l',fvcLiters:'l',ratio:'%'};
  const names={fev1:'FEV₁',fvc:'FVC',fev1Liters:'FEV₁',fvcLiters:'FVC',ratio:'FEV₁/FVC'};
  const validDate=s=>typeof s==='string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s+'T12:00:00'));
  const niceDate=s=>validDate(s)?s.slice(8,10)+'.'+s.slice(5,7)+'.'+s.slice(0,4):'Datum fehlt';
  const toNum=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
  const nr=(v,p=1)=>v===null?'–':Number(v).toLocaleString('de-DE',{maximumFractionDigits:p,minimumFractionDigits:p===2?2:0});
  function normalize(row){
    if(!row||!validDate(row.date))return null;
    const r={...row};
    for(const k of ['fev1','fvc','fev1Liters','fvcLiters','ratio'])r[k]=toNum(r[k]);
    if(r.fev1Liters!=null&&r.fvcLiters!=null&&r.fvcLiters>0&&r.ratio===null)r.ratio=100*r.fev1Liters/r.fvcLiters;
    if(r.ratio!==null&&(r.ratio<0||r.ratio>120))r.ratio=null;
    r.phase=['vor','nach'].includes(r.phase)?r.phase:'unbekannt';
    return r;
  }
  const phaseName=r=>r.phase==='vor'?'vor Bronchodilatation':r.phase==='nach'?'nach Bronchodilatation':'Messphase nicht angegeben';
  const score=fev=>fev===null||fev<0||fev>200?{label:'Keine FEV₁-Orientierung',tone:'neutral'}:fev<60?{label:'FEV₁-Sollwert <60 %',tone:'red'}:fev<80?{label:'FEV₁-Sollwert 60–79 %',tone:'yellow'}:{label:'FEV₁-Sollwert ≥80 %',tone:'green'};
  const datesort=(a,b)=>a.date.localeCompare(b.date)||String(a.phase).localeCompare(String(b.phase))||String(a.createdAt||'').localeCompare(String(b.createdAt||''))||String(a.id||'').localeCompare(String(b.id||''));
  function filterPeriod(rows,period){if(period==='all')return rows.slice();const n=Number(period);if(!Number.isInteger(n)||n<1)return rows.slice();const now=new Date(),cut=new Date(now.getFullYear(),now.getMonth(),now.getDate());if(n===3652||n===365){cut.setFullYear(cut.getFullYear()-(n===3652?10:1));cut.setDate(cut.getDate()+1)}else cut.setDate(cut.getDate()-(n-1));const bound=[cut.getFullYear(),String(cut.getMonth()+1).padStart(2,'0'),String(cut.getDate()).padStart(2,'0')].join('-');return rows.filter(x=>x.date>=bound)}
  async function readAll(){
    if(!SEC.state().unlocked)throw Error('Gesundheitsakte ist gesperrt');
    const rows=await SEC.list('suite');
    return rows.filter(x=>x.type==='measurements').map(x=>normalize(x.value)).filter(Boolean).sort(datesort);
  }
  function el(tag,className,content){const n=document.createElement(tag);if(className)n.className=className;if(content!==undefined)n.textContent=String(content);return n}
  function svgEl(tag,attributes,parent){const n=document.createElementNS(NS,tag);for(const [key,value] of Object.entries(attributes||{}))n.setAttribute(key,String(value));parent?.append(n);return n}
  function details(r,container){container.replaceChildren();const badge=score(r.fev1);
    const top=el('div','lufu23-selected-top');top.append(el('strong','',niceDate(r.date)+' · '+phaseName(r)),el('span','lufu23-badge '+badge.tone,badge.label));container.append(top);
    container.append(el('p','',`FEV₁: ${nr(r.fev1)} % Soll · ${nr(r.fev1Liters,2)} l    |    FVC: ${nr(r.fvc)} % Soll · ${nr(r.fvcLiters,2)} l    |    FEV₁/FVC: ${nr(r.ratio)} %`));
    if(r.doctor)container.append(el('p','','Ort / Arzt: '+String(r.doctor).slice(0,120)));
    if(r.note)container.append(el('p','','Notiz: '+String(r.note).slice(0,700)));
    container.append(el('small','lufu23-muted','Farbbereich ist ausschließlich eine vereinfachte FEV₁-%-Sollwertanzeige, keine Notfallbeurteilung oder Diagnose.'));
  }
  function trend(rows){
    const records=rows.filter(r=>r.fev1!==null).sort(datesort);if(records.length<2)return null;
    const latest=records[records.length-1]; const previous=records.slice(0,-1).reverse().find(x=>x.phase===latest.phase);
    if(!previous)return null; const delta=latest.fev1-previous.fev1;
    return {delta,latest,previous,label:Math.abs(delta)<=2?'nahezu unverändert':delta>0?'höher':'niedriger'};
  }
  function paintChart(host,selected,rows,fields,title){
    host.replaceChildren();
    const available=fields.filter(f=>rows.some(r=>r[f]!==null));
    if(!available.length){host.append(el('p','lufu23-empty','Für diesen Zeitraum sind keine passenden bestätigten Untersuchungen gespeichert. Erfasse einen Lungenfunktionstest und wähle „Aktuelle Werte in Verlauf speichern“.'));return}
    const mobile=window.innerWidth<600;const W=mobile?420:760,H=270,left=mobile?54:64,right=mobile?12:24,top=18,bottom=43;
    const references=available.map(k=>({field:k,value:window.ASTHMA_VITAL29?.getRef?.(k)})).filter(r=>Number.isFinite(r.value));const values=rows.flatMap(r=>available.map(k=>r[k])).filter(x=>x!==null).concat(references.map(r=>r.value));
    let lo=Math.min(...values),hi=Math.max(...values);
    const spread=Math.max(hi-lo,Math.max(2,hi*.06));
    lo=Math.max(0,lo-spread*.26);hi=hi+spread*.26;
    if(available.length===1&&available[0]==='ratio'){lo=Math.max(0,lo);hi=Math.min(110,Math.max(100,hi))}
    const span=hi-lo||1,stepX=(W-left-right)/Math.max(1,rows.length-1);
    const xy=(v,i)=>[left+(rows.length===1?(W-left-right)/2:i*stepX),top+(hi-v)/span*(H-top-bottom)];
    const svg=svgEl('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':title+' – '+rows.length+' bestätigte Untersuchungen',class:'lufu23-svg'},host);
    for(let j=0;j<=4;j++){
      const y=top+j*(H-top-bottom)/4; svgEl('line',{x1:left,y1:y,x2:W-right,y2:y,stroke:'#dfebed','stroke-width':1},svg);
      const tick=svgEl('text',{x:left-12,y:y+5,'text-anchor':'end',fill:'#55717b','font-size':16},svg);tick.textContent=nr(hi-(hi-lo)*j/4,hi<20?1:0);
    }
    for(const ref of references){const ry=top+(hi-ref.value)/span*(H-top-bottom);svgEl('line',{x1:left,x2:W-right,y1:ry,y2:ry,stroke:colors[ref.field]||'#856a40','stroke-width':2,'stroke-dasharray':'7 6'},svg);svgEl('text',{x:W-right-3,y:Math.max(12,ry-5),'text-anchor':'end',fill:colors[ref.field]||'#856a40','font-size':13},svg).textContent='Referenz '+names[ref.field]+' '+nr(ref.value);}
    const indices=[0,Math.floor((rows.length-1)/2),rows.length-1].filter((x,i,a)=>a.indexOf(x)===i);
    for(const index of indices){const x=xy(0,index)[0];const tick=svgEl('text',{x,y:H-11,'text-anchor':'middle',fill:'#516c76','font-size':16},svg);tick.textContent=rows[index].date.slice(8)+'.'+rows[index].date.slice(5,7)+'.'+rows[index].date.slice(2,4)}
    const fmtUnit=available.length===1?units[available[0]]:units[available[0]];
    svgEl('text',{x:left,y:14,fill:'#4d6671','font-size':14},svg).textContent=fmtUnit;
    for(const field of available){
      // Do not join before/after bronchodilatation into a false longitudinal trend.
      let last=null;
      rows.forEach((r,i)=>{
        const v=r[field];if(v===null){last=null;return}
        const [x,y]=xy(v,i);
        if(last && last.phase===r.phase){svgEl('line',{x1:last.x,y1:last.y,x2:x,y2:y,stroke:colors[field],'stroke-width':3.5,'stroke-linecap':'round'},svg)}
        last={x,y,phase:r.phase};
        const dot=svgEl('circle',{cx:x,cy:y,r:6.5,fill:colors[field],stroke:'#fff','stroke-width':2},svg);
        const hit=svgEl('circle',{cx:x,cy:y,r:15,fill:'transparent',tabindex:0,role:'button','aria-label':niceDate(r.date)+': '+names[field]+' '+nr(v,field.includes('Liters')?2:1)+' '+units[field]},svg);
        svgEl('title',{},hit).textContent=niceDate(r.date)+' – '+names[field]+' '+nr(v,field.includes('Liters')?2:1)+' '+units[field];
        const choose=()=>details(r,selected);
        hit.addEventListener('click',choose);
        hit.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose()}});
      });
    }
    const note=el('p','lufu23-muted',rows.length===1?'Ein Messpunkt vorhanden. Für einen zeitlichen Trend werden mindestens zwei vergleichbare Untersuchungen benötigt.':'Linien verbinden nur benachbarte Werte derselben Messphase. Messpunkte antippen, um die Werte zu prüfen.');host.append(note);
  }
  let data=[],counter=0;
  async function refresh(){const id=++counter;const items=await readAll();if(id!==counter)return;data=items;drawHome();drawDetail()}
  function drawHome(){const panel=$('home-lufu23');if(!panel)return;const subset=filterPeriod(data,$('lufu23-home-period').value),host=$('lufu23-home-graph');
    $('lufu23-home-count').textContent=subset.length+' gespeicherte Untersuchungen';
    paintChart(host,$('lufu23-home-selected'),subset,['fev1','fvc'],'Ärztliche Lungenfunktion: FEV₁ und FVC, Prozent vom Soll');
  }
  function drawDetail(){const period=$('lufu23-period').value,phase=$('lufu23-phase').value;
    const subset=filterPeriod(data,period).filter(r=>phase==='all'||r.phase===phase);
    const mode=$('lufu23-mode').value,legend=$('lufu23-legend');
    const host=$('lufu23-detail-graph'),selected=$('lufu23-detail-selected');
    legend.hidden=mode==='combined';
    if(mode==='combined'){
      host.replaceChildren();
      const t1=el('h4','','FEV₁ und FVC in Prozent vom Soll');host.append(t1);
      const a=el('div','lufu23-inner-chart');host.append(a);
      paintChart(a,selected,subset,['fev1','fvc'],'Spirometrie-Prozentwerte');
      const t2=el('h4','','FEV₁ und FVC in Litern');host.append(t2);
      const b=el('div','lufu23-inner-chart');host.append(b);
      paintChart(b,selected,subset,['fev1Liters','fvcLiters'],'Spirometrie-Literwerte');
    }else{
      const fields=mode==='liter'?['fev1Liters','fvcLiters']:mode==='ratio'?['ratio']:['fev1','fvc'];
      legend.querySelectorAll('span').forEach((e,i)=>{e.hidden=i>=fields.length;e.lastChild.textContent=' '+names[fields[i]||fields[0]]+(mode==='liter'?' (Liter)':mode==='ratio'?' (%)':' (% Soll)')});
      paintChart(host,selected,subset,fields,'Spirometrie-Diagramm '+mode);
    }
    const list=$('lufu23-record-list');list.replaceChildren();
    if(subset.length){list.append(el('h4','','Untersuchung auswählen'));for(const item of subset.slice(-12).reverse()){
      const btn=el('button','lufu23-record-btn',niceDate(item.date)+' · '+phaseName(item)+' · FEV₁ '+nr(item.fev1)+' % · FVC '+nr(item.fvc)+' %');
      btn.type='button';btn.addEventListener('click',()=>details(item,$('lufu23-detail-selected')));list.append(btn);
    }}
    const summary=$('lufu23-stats');summary.replaceChildren();summary.append(el('p','','Untersuchungen im Zeitraum: '+subset.length));
    const t=trend(subset);if(t){summary.append(el('p','',`FEV₁ vom Soll: ${nr(t.previous.fev1)} % (${niceDate(t.previous.date)}) → ${nr(t.latest.fev1)} % (${niceDate(t.latest.date)}). Differenz: ${t.delta>0?'+':''}${nr(t.delta)} Prozentpunkte (${t.label}). Gleiche Messphase: ${phaseName(t.latest)}.`));}
    else summary.append(el('p','','Für einen Vergleich werden zwei Untersuchungen mit FEV₁-%-Wert aus derselben Messphase benötigt.'));
    summary.append(el('p','lufu23-muted','Ein höherer Messwert bedeutet nicht automatisch eine bessere Asthmakontrolle. Nur mit ärztlicher Beurteilung vergleichbar.'));
  }
  for(const id of ['lufu23-home-period'])$(id).addEventListener('change',drawHome);window.addEventListener('asthma:vital29-refs',()=>{drawHome();drawDetail();});window.addEventListener('asthma:vital29-ready',()=>{drawHome();drawDetail();});
  for(const id of ['lufu23-mode','lufu23-period','lufu23-phase'])$(id).addEventListener('change',drawDetail);
  let timer;
  window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite'){clearTimeout(timer);timer=setTimeout(()=>refresh().catch(()=>{}),80)}});
  window.addEventListener('asthma:profile-reset',()=>refresh().catch(()=>{}));
  Object.defineProperty(window,'__ASTHMA_LUFU23_TEST',{value:Object.freeze({normalize,filterPeriod,trend,score}),configurable:false});
  refresh().catch(e=>{const p=$('lufu23-home-count');if(p)p.textContent='Messwerte konnten nicht gelesen werden: '+e.message});
})();
