'use strict';
/* PneumoPro 3.7.6: einfache Startseite mit letzten Werten als Kacheln.
   Liest nur lokal verschlüsselte Daten, verändert keine Messreihen. */
(()=>{
  const S=window.ASTHMA_SECURITY;
  const NAV=window.ASTHMA_NAV;
  if(!S?.state?.().unlocked || document.getElementById('pp376-dashboard')) return;
  const $=id=>document.getElementById(id);
  const host=$('uebersicht') || $('start');
  if(!host) return;

  const el=(tag,cls,txt)=>{ const x=document.createElement(tag); if(cls) x.className=cls; if(txt!==undefined) x.textContent=txt; return x; };
  const num=v=>v===null||v===undefined||v===''||Number.isNaN(Number(v))?null:Number(v);
  const fmtDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')) ? `${s.slice(8,10)}.${s.slice(5,7)}.${s.slice(0,4)}` : '—';
  const fmtNum=(v,d=0)=>v===null?'—':Number(v).toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
  const pickLatest=(rows, sortExtra='')=>rows.sort((a,b)=>(`${a.date||''} ${a.time||''} ${a.createdAt||''} ${a.id||''}`).localeCompare(`${b.date||''} ${b.time||''} ${b.createdAt||''} ${b.id||''}`)).at(-1)||null;
  const bodyApi=window.PNEUMOPRO_AMPEL347;
  const bpApi=window.ASTHMA_BPA344;

  function classifySpo2(v){
    if(bodyApi?.classify){
      const out=bodyApi.classify('spo2',v);
      if(out?.label) return out;
    }
    if(v===null) return {label:'Kein Wert', color:'#90a4ae', tone:'neutral'};
    if(v>=95) return {label:'Üblicher SpO₂-Bereich', color:'#18864b', tone:'ok'};
    if(v>=92) return {label:'Leicht erniedrigt', color:'#d17a00', tone:'warn'};
    return {label:'Deutlich erniedrigt', color:'#bf3b2b', tone:'alert'};
  }
  function classifyPulse(v){
    if(v===null) return {label:'Kein Wert', color:'#90a4ae', tone:'neutral'};
    if(v<50) return {label:'Puls eher niedrig', color:'#2f7ca8', tone:'info'};
    if(v<=100) return {label:'Im Orientierungsbereich', color:'#18864b', tone:'ok'};
    if(v<=120) return {label:'Puls erhöht', color:'#d17a00', tone:'warn'};
    return {label:'Puls deutlich erhöht', color:'#c96712', tone:'alert'};
  }
  function classifyWeight(kg){
    const profile=S.profileGet?.()||{};
    const h=num(profile.personal?.heightCm);
    if(kg===null || !h) return {label:'Gewicht erfasst', color:'#607d8b', tone:'neutral', sub:''};
    const bmi=kg/Math.pow(h/100,2);
    let label='BMI im Orientierungsbereich', color='#18864b', tone='ok';
    if(bmi<18.5){ label='BMI erniedrigt'; color='#2f7ca8'; tone='info'; }
    else if(bmi<25){ label='BMI im Orientierungsbereich'; color='#18864b'; tone='ok'; }
    else if(bmi<30){ label='BMI erhöht'; color='#d17a00'; tone='warn'; }
    else { label='BMI deutlich erhöht'; color='#c96712'; tone='alert'; }
    return {label, color, tone, sub:'BMI '+fmtNum(bmi,1)};
  }
  function classifyLungPercent(v){
    if(v===null) return {label:'Kein Wert', color:'#90a4ae', tone:'neutral'};
    if(v>=80) return {label:'Im Orientierungsbereich', color:'#18864b', tone:'ok'};
    if(v>=60) return {label:'Leicht bis mäßig vermindert', color:'#d17a00', tone:'warn'};
    return {label:'Deutlich vermindert', color:'#bf3b2b', tone:'alert'};
  }
  function classifyPEF(v, ref){
    if(v===null) return {label:'Kein Wert', color:'#90a4ae', tone:'neutral'};
    if(ref && ref>0){
      const p=v/ref*100;
      if(p>=80) return {label:'PEF im grünen Bereich', color:'#18864b', tone:'ok'};
      if(p>=60) return {label:'PEF gelber Bereich', color:'#d17a00', tone:'warn'};
      return {label:'PEF roter Bereich', color:'#bf3b2b', tone:'alert'};
    }
    return {label:'Letzter PEF-Wert', color:'#18864b', tone:'ok'};
  }
  function classifyBP(sys,dia,part){
    if(bpApi?.classifyPart){
      const out=bpApi.classifyPart(part==='sys'?sys:dia, part==='sys'?'systolic':'diastolic');
      if(out?.label) return out;
    }
    const value=part==='sys'?sys:dia;
    if(value===null) return {label:'Kein Wert', color:'#90a4ae', tone:'neutral'};
    if(part==='sys'){
      if(value<100) return {label:'Eher niedrig', color:'#2f7ca8', tone:'info'};
      if(value<135) return {label:'Im Orientierungsbereich', color:'#18864b', tone:'ok'};
      if(value<150) return {label:'Leicht erhöht', color:'#d17a00', tone:'warn'};
      return {label:'Erhöht', color:'#bf3b2b', tone:'alert'};
    }
    if(value<60) return {label:'Eher niedrig', color:'#2f7ca8', tone:'info'};
    if(value<85) return {label:'Im Orientierungsbereich', color:'#18864b', tone:'ok'};
    if(value<95) return {label:'Leicht erhöht', color:'#d17a00', tone:'warn'};
    return {label:'Erhöht', color:'#bf3b2b', tone:'alert'};
  }

  const style=el('style');
  style.id='pp376-style';
  style.textContent=`
#pp376-dashboard{margin:16px 0 24px;border:2px solid #c7dde4;border-radius:22px;background:#eef7fa;padding:16px}
#pp376-dashboard .pp376-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px}
#pp376-dashboard h3{margin:0;font-size:2rem;line-height:1.08;color:#0f2e57}
#pp376-dashboard .pp376-kicker{margin:0 0 8px;color:#197791;font-size:.92rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
#pp376-dashboard .pp376-sub{margin:10px 0 0;color:#5f7685;font-size:1rem}
#pp376-dashboard .pp376-logo{width:84px;height:84px;border-radius:22px;flex:none;object-fit:cover;box-shadow:0 8px 22px rgba(11,42,78,.12)}
#pp376-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
.pp376-card{position:relative;overflow:hidden;background:#fff;border-radius:18px;border-left:8px solid var(--tone,#18864b);padding:16px 14px 14px;min-height:180px;box-shadow:0 2px 8px rgba(12,60,78,.05)}
.pp376-card::after{content:attr(data-bg);position:absolute;right:10px;top:8px;font-size:54px;font-weight:800;line-height:1;color:rgba(11,59,82,.06);pointer-events:none}
.pp376-name{font-size:1rem;font-weight:800;color:#18435c;text-transform:uppercase;letter-spacing:.02em;max-width:85%}
.pp376-value{margin:16px 0 4px;font-size:2rem;font-weight:800;color:#134363;line-height:1.05}
.pp376-date,.pp376-note{display:block;color:#5b7482;font-size:.94rem;line-height:1.45}
.pp376-badge{display:inline-flex;align-items:center;gap:10px;margin-top:14px;padding:10px 12px;border-radius:14px;border:3px solid var(--tone,#18864b);color:var(--tone,#18864b);background:#fff;font-size:.95rem;font-weight:800;line-height:1.25;max-width:100%}
.pp376-dot{width:16px;height:16px;border-radius:999px;background:var(--tone,#18864b);flex:none}
.pp376-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.pp376-actions button{appearance:none;border:2px solid #9fc3cd;background:#fff;color:#18435c;border-radius:14px;padding:10px 14px;font-weight:700}
@media (max-width:720px){#pp376-dashboard{padding:14px}#pp376-dashboard h3{font-size:1.45rem}#pp376-dashboard .pp376-logo{width:56px;height:56px;border-radius:16px}.pp376-card{min-height:166px}.pp376-card::after{font-size:48px}}
@media print{#pp376-dashboard{break-inside:avoid}}
`;
  document.head.append(style);

  const section=el('section');
  section.id='pp376-dashboard';
  section.innerHTML=`<div class="pp376-head"><div><p class="pp376-kicker">Startseite · ohne Schnickschnack</p><h3>Meine Messwerte auf einen Blick</h3><p class="pp376-sub">Die letzten gespeicherten Werte mit Datum. Für den gesamten Verlauf die Bereiche darunter öffnen.</p></div><img class="pp376-logo" src="./logo-192-v281.png" alt="PneumoPro Logo"></div><div id="pp376-grid" aria-live="polite"></div><div class="pp376-actions"><button type="button" data-goto="vitalwerte">Vitalwerte öffnen</button><button type="button" data-goto="lungenwerte">Lungenfunktion öffnen</button><button type="button" data-goto="peakflow">Peak-Flow öffnen</button></div>`;
  const anchor=host.querySelector('.a27-identity,.home20-heading,.section-heading,.d26-dashboard') || host.firstElementChild;
  if(anchor) anchor.insertAdjacentElement('afterend',section); else host.prepend(section);
  section.querySelectorAll('[data-goto]').forEach(btn=>btn.addEventListener('click',()=>NAV?.go?.(btn.dataset.goto)));
  const grid=section.querySelector('#pp376-grid');

  function card({title,value,unit,date,note,badge,bg='•',color='#18864b'}){
    const c=el('article','pp376-card');
    c.dataset.bg=bg;
    c.style.setProperty('--tone',color);
    c.append(el('div','pp376-name',title));
    c.append(el('div','pp376-value',value+(unit?` ${unit}`:'')));
    c.append(el('span','pp376-date',`Messung: ${fmtDate(date)}`));
    if(note) c.append(el('span','pp376-note',note));
    if(badge?.label){
      const b=el('div','pp376-badge');
      b.style.setProperty('--tone',badge.color||color);
      b.append(el('span','pp376-dot'),el('span','',badge.label+(badge.sub?` · ${badge.sub}`:'')));
      c.append(b);
    }
    return c;
  }

  let run=0;
  async function refresh(){
    if(!S.state().unlocked) return;
    const id=++run;
    const [suite,epef]=await Promise.allSettled([S.list('suite'),S.list('epef')]);
    if(id!==run) return;
    const suiteRows=suite.status==='fulfilled'?suite.value:[];
    const epefRows=epef.status==='fulfilled'?epef.value:[];

    const vitals=suiteRows.filter(r=>r.type==='vital29').map(r=>r.value).filter(Boolean);
    const weights=suiteRows.filter(r=>r.type==='weight292').map(r=>r.value).filter(x=>x?.date && num(x.kg)!==null);
    const lungs=suiteRows.filter(r=>r.type==='measurements').map(r=>r.value).filter(x=>x?.date);
    const spo=pickLatest(vitals.filter(x=>x.kind==='spo2'));
    const bp=pickLatest(vitals.filter(x=>x.kind==='bp'));
    const pulse=pickLatest(vitals.filter(x=>x.kind==='pulse'));
    const weight=pickLatest(weights.map(x=>({date:x.date,createdAt:x.createdAt,id:x.id,kg:num(x.kg)})));
    const lung=pickLatest(lungs.map(x=>({date:x.date,createdAt:x.createdAt,id:x.id,fev1:num(x.fev1),fvc:num(x.fvc),fev1Liters:num(x.fev1Liters),fvcLiters:num(x.fvcLiters)})));
    const pef=pickLatest(epefRows.filter(x=>x.kind==='measurement').map(x=>({date:x.date,time:x.time,id:x.id,pef:num(x.pef),fev1:num(x.fev1)})));
    const refRow=epefRows.find(x=>x.kind==='setting'&&x.id==='reference');
    const pefRef=num(refRow?.value);

    const cards=[];
    const spoBadge=classifySpo2(num(spo?.value));
    cards.push(card({title:'Blutsauerstoff · SpO₂',value:fmtNum(num(spo?.value),0),unit:'%',date:spo?.date,note:'Messmethode beachten',badge:spoBadge,bg:'O₂',color:spoBadge.color}));

    const sysBadge=classifyBP(num(bp?.value),num(bp?.diastolic),'sys');
    cards.push(card({title:'Blutdruck · systolisch',value:fmtNum(num(bp?.value),0),unit:'mmHg',date:bp?.date,note:'Oberer Blutdruckwert',badge:sysBadge,bg:'SYS',color:sysBadge.color}));
    const diaBadge=classifyBP(num(bp?.value),num(bp?.diastolic),'dia');
    cards.push(card({title:'Blutdruck · diastolisch',value:fmtNum(num(bp?.diastolic),0),unit:'mmHg',date:bp?.date,note:'Unterer Blutdruckwert',badge:diaBadge,bg:'DIA',color:diaBadge.color}));

    const pulseBadge=classifyPulse(num(pulse?.value));
    cards.push(card({title:'Puls',value:fmtNum(num(pulse?.value),0),unit:'/min',date:pulse?.date,note:'Schläge pro Minute',badge:pulseBadge,bg:'♥',color:pulseBadge.color}));

    const weightBadge=classifyWeight(num(weight?.kg));
    cards.push(card({title:'Gewicht',value:fmtNum(num(weight?.kg),1),unit:'kg',date:weight?.date,note:'Diagramm und Eingabe weiter unten',badge:weightBadge,bg:'kg',color:weightBadge.color}));

    const fev1Badge=classifyLungPercent(num(lung?.fev1));
    cards.push(card({title:'FEV₁',value:fmtNum(num(lung?.fev1),0),unit:'%',date:lung?.date,note:lung?.fev1Liters!==null?fmtNum(num(lung?.fev1Liters),2)+' Liter':'% vom Soll',badge:fev1Badge,bg:'∿',color:fev1Badge.color}));
    const fvcBadge=classifyLungPercent(num(lung?.fvc));
    cards.push(card({title:'FVC',value:fmtNum(num(lung?.fvc),0),unit:'%',date:lung?.date,note:lung?.fvcLiters!==null?fmtNum(num(lung?.fvcLiters),2)+' Liter':'% vom Soll',badge:fvcBadge,bg:'◔',color:fvcBadge.color}));

    const pefBadge=classifyPEF(num(pef?.pef),pefRef);
    cards.push(card({title:'Peak-Flow · PEF',value:fmtNum(num(pef?.pef),0),unit:'l/min',date:pef?.date,note:pef?.fev1!==null?`FEV₁ ${fmtNum(num(pef?.fev1),2)} l`:'Letzte ePEF-Messung',badge:pefBadge,bg:'PEF',color:pefBadge.color}));

    grid.replaceChildren(...cards);
  }

  let timer=0;
  const schedule=()=>{ clearTimeout(timer); timer=setTimeout(()=>refresh().catch(err=>console.warn('PneumoPro 3.7.6 Dashboard:',err.message)),120); };
  window.addEventListener('asthma:secure-change',e=>{ if(['suite','epef','profile'].includes(e.detail?.group)) schedule(); });
  window.addEventListener('asthma:profile-reset',schedule);
  window.addEventListener('asthma:personal-profile-updated',schedule);
  schedule();
  window.PNEUMOPRO_DASHBOARD376=Object.freeze({version:'3.7.6',refresh:schedule});
})();
