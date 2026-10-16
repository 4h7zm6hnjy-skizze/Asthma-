'use strict';
/* Asthma 2.8.1 – medizinische Verlaufseinordnung. Keine Diagnosestellung. Alles lokal.
   Maßgeblich: GINA 2026, 4-Fragen-Symptombeurteilung, ergänzt um Datenqualität.
   Keine Dosierungs-/Therapieänderung, kein Server, keine ungefragten Profiländerungen. */
(()=>{
 const SEC=window.ASTHMA_SECURITY;
 const root=document.getElementById('uebersicht');
 if(!root||!SEC?.state?.().unlocked||!SEC.list||document.getElementById('a29-assessment'))return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='./assessment29.css';document.head.append(css);
 const $=id=>document.getElementById(id);
 const node=(tag,cl,value)=>{const el=document.createElement(tag);if(cl)el.className=cl;if(value!==undefined)el.textContent=String(value);return el};
 const isoDate=(date=new Date())=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
 const cutoff=(days)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-days+1);return isoDate(d)};
 const isDay=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00'));
 const dateFrom=x=>String(x?.date||x?.value?.date||'').slice(0,10);
 const number=x=>x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x))?Number(x):null;
 const fmtDate=s=>isDay(s)?s.split('-').reverse().join('.'):'nicht angegeben';
 const daysOld=s=>isDay(s)?Math.floor((new Date(isoDate()+'T12:00:00').getTime()-new Date(s+'T12:00:00').getTime())/86400000):null;
 function controlAssessment(checks,today=isoDate()){
   const eligible=(checks||[]).filter(x=>x&&isDay(x.date)&&x.date<=today&&x.date>=cutoff(28)&&Array.isArray(x.answers)&&x.answers.length===4&&x.answers.every(v=>v==='yes'||v==='no')).sort((a,b)=>b.date.localeCompare(a.date));
   if(!eligible.length)return {valid:false,yes:null,date:null,status:'Nicht beurteilbar',details:'Kein vollständiger aktueller Vier-Fragen-Eintrag aus den letzten 28 Tagen.'};
   const last=eligible[0];const yes=last.answers.filter(v=>v==='yes').length;
   return {valid:true,yes,date:last.date,
     status:yes===0?'Keine Auffälligkeit in den vier Antworten':yes<=2?'Hinweise auf eingeschränkte Symptomkontrolle':'Deutliche Hinweise auf unzureichende Symptomkontrolle',
     details:yes===0?'Alle vier Fragen wurden mit Nein beantwortet. Dies beweist keine gute Kontrolle und schließt Anfälle nicht aus.':
       yes<=2?'Ein bis zwei der vier Fragen waren auffällig. Die Behandlung sollte ärztlich überprüft werden.':
       'Drei oder vier auffällige Antworten. Bitte die Asthmakontrolle zeitnah mit der behandelnden Praxis überprüfen.'};
 }
 function lungAssessment(suite,profile={},today=isoDate()){
   const arr=(suite||[]).filter(x=>x?.type==='measurements')
     .map(x=>x.value||{}).filter(x=>isDay(x.date)&&x.date<=today&&number(x.fev1)!==null&&number(x.fev1)>=0&&number(x.fev1)<=150)
     .sort((a,b)=>b.date.localeCompare(a.date));
   const pd=profile?.lungDate;const pv=number(profile?.fev1);
   if(isDay(pd)&&pd<=today&&pv!==null&&pv>=0&&pv<=150&&(!arr.length||pd>arr[0].date))arr.unshift({date:pd,fev1:pv,phase:'unbekannt',source:'Profil'});
   if(!arr.length)return {valid:false,reason:'Kein datierter FEV₁-Prozentwert in der Lungenfunktion hinterlegt.'};
   const m=arr[0],age=daysOld(m.date),fev=number(m.fev1);
   const same=arr.find((x,i)=>i>0&&String(x.phase||'unbekannt')===String(m.phase||'unbekannt')&&x.date!==m.date);
   const delta=same?+(fev-number(same.fev1)).toFixed(1):null;
   return {valid:true,date:m.date,age,fev,phase:m.phase||'nicht angegeben',delta,comparison:same?.date||null,
     note:age>90?'Messwert ist älter als 90 Tage; keine Aussage über die heutige Lungenfunktion.':
       fev<60?'FEV₁ liegt unter 60 % des Sollwerts. Das ist ein auffälliger Funktionsbefund und gehört zeitnah fachärztlich beurteilt.':
       fev<80?'FEV₁ liegt unter 80 % des Sollwerts. Der Befund muss zusammen mit Symptomen, FEV₁/FVC und Messbedingungen eingeordnet werden.':
       'FEV₁ liegt bei mindestens 80 % des Sollwerts. Daraus allein folgt weder gute Asthmakontrolle noch ein Ausschluss von Asthma.'};
 }
 function diaryAssessment(diary=[],today=isoDate()){
   const recent=(diary||[]).filter(x=>isDay(x?.date)&&x.date<=today&&x.date>=cutoff(28));
   const night=new Set(recent.filter(x=>x.night===true).map(x=>x.date)).size;
   const relief=recent.filter(x=>x.date>=cutoff(7)).map(x=>number(x.rescue)).filter(x=>x!==null&&x>=0);
   const symptomDays=new Set(recent.filter(x=>number(x.symptoms)>0).map(x=>x.date)).size;
   return {records:recent.length,days:new Set(recent.map(x=>x.date)).size,nightDays:night,symptomDays,
     relieverEntries:relief.length,relieverSum:relief.length?relief.reduce((a,b)=>a+b,0):null};
 }
 function pefAssessment(epef=[],today=isoDate()){
   const p=(epef||[]).filter(x=>x?.kind==='measurement'&&isDay(x.date)&&x.date<=today&&number(x.pef)!==null&&number(x.pef)>0&&number(x.pef)<2000)
     .sort((a,b)=>b.date.localeCompare(a.date));
   if(!p.length)return {valid:false};
   const latest=p[0],age=daysOld(latest.date);
   // Two 7-day intervals compared only with at least two measurements each.
   const s1=p.filter(x=>x.date>=cutoff(7)&&x.date<=today);
   const s2=p.filter(x=>x.date>=cutoff(14)&&x.date<cutoff(7));
   const average=a=>a.reduce((sum,x)=>sum+number(x.pef),0)/a.length;
   return {valid:true,date:latest.date,age,value:number(latest.pef),currentCount:s1.length,
     pastCount:s2.length,weeklyComparison:s1.length>=2&&s2.length>=2?Math.round(average(s1)-average(s2)):null};
 }
 function assessment({checks=[],suite=[],diary=[],epef=[],profile={}}){
   const control=controlAssessment(checks),lung=lungAssessment(suite,profile),symptoms=diaryAssessment(diary),pef=pefAssessment(epef);
   const notes=[];let urgency='none';let lead='';
   const freshLung=lung.valid&&lung.age>=0&&lung.age<=90;
   if(control.valid){
      if(control.yes>=3){lead='Die Antworten sprechen für eine deutlich eingeschränkte Asthmakontrolle.';urgency='review';}
      else if(control.yes>=1){lead='Die Antworten weisen auf mögliche Probleme bei der Asthmakontrolle hin.';urgency='review';}
      else lead='Die vier aktuellen Antworten zeigen keine Auffälligkeit – dies ist keine Entwarnung.';
      notes.push(`${control.yes} von 4 Fragen auffällig (Eintrag ${fmtDate(control.date)}). Die Bedarfsfrage in dieser App ist allgemein formuliert; die GINA-SABA-Schwelle gilt speziell für SABA-Bedarfsinhalatoren.`);
   }else {lead='Für eine Einschätzung der aktuellen Symptomkontrolle fehlen noch vollständige Angaben.';notes.push(control.details);}
   if(freshLung){
      notes.push(`FEV₁ ${lung.fev.toLocaleString('de-DE')} % vom Sollwert, gemessen am ${fmtDate(lung.date)}. ${lung.note}`);
      if(lung.fev<60){urgency='review';if(control.valid&&control.yes>=1)lead='Auffälliger FEV₁-Befund zusammen mit Hinweisen auf eingeschränkte Symptomkontrolle.';}
      if(lung.delta!==null)notes.push(`Veränderung zum vorherigen Wert mit gleicher dokumentierter Messphase: ${lung.delta>0?'+':''}${lung.delta} Prozentpunkte (${fmtDate(lung.comparison)}). Nicht als gesicherte klinische Verbesserung/Verschlechterung interpretieren.`);
   }else notes.push(lung.valid?`Letzter FEV₁-Wert: ${fmtDate(lung.date)}, ${lung.fev} % vom Soll. ${lung.note}`:lung.reason);
   if(symptoms.records){
      notes.push(`${symptoms.nightDays} dokumentierte Nächte mit Beschwerden in 28 Tagen; ${symptoms.symptomDays} dokumentierte Beschwerdetage. Nicht erfasste Tage sind unbekannt, nicht symptomfrei.`);
      if(symptoms.nightDays>0){urgency='review';if(control.valid&&control.yes===0)lead='Kontrollfragen und Tagebuch weichen voneinander ab: Nächtliche Asthmabeschwerden wurden dokumentiert.';}
   }else notes.push('Keine aktuellen Tagebucheinträge – aus fehlenden Einträgen lässt sich keine Beschwerdefreiheit ableiten.');
   if(symptoms.relieverSum!==null){
      notes.push(`${symptoms.relieverSum} dokumentierte Bedarfsanwendungen in den letzten sieben Tagen (${symptoms.relieverEntries} Einträge), ohne sichere Aussage zur verwendeten Wirkstoffgruppe.`);
      if(symptoms.relieverSum>=3){urgency='review';if(!control.valid)lead='Mehrere Bedarfsanwendungen dokumentiert; die vollständigen Kontrollfragen fehlen noch.';}
   }
   if(pef.valid){
      notes.push(`Letzter Peak-Flow ${Math.round(pef.value)} l/min am ${fmtDate(pef.date)}.${pef.weeklyComparison!==null?' Unterschied des Wochendurchschnitts zur Vorwoche: '+(pef.weeklyComparison>0?'+':'')+pef.weeklyComparison+' l/min.':''} Ohne persönlichen Bestwert und standardisierte Messung keine Gefahrenzone ableiten.`);
   }else notes.push('Kein dokumentierter Peak-Flow-Wert vorhanden.');
   const action=urgency==='review'?'Zeitnah mit der behandelnden Lungenfacharztpraxis besprechen und ärztlich bestätigten Asthma-Aktionsplan beachten.':'Für eine belastbare Verlaufskontrolle regelmäßig dokumentieren und die Befunde bei Kontrollterminen besprechen.';
   return {lead,urgency,action,control,lung,pef,symptoms,notes};
 }
 const card=node('section','a29-evaluation');card.id='a29-assessment';card.setAttribute('aria-labelledby','a29-heading');
 card.innerHTML=`
 <div class="a29-head"><div><p class="section-kicker">Medizinische Orientierung · Privat</p><h2 id="a29-heading">Asthma: Diagnosehinweise & Einschätzung</h2><p>Orientierende Beurteilung deiner gespeicherten Werte und Beschwerden – <strong>keine ärztliche Diagnosestellung</strong>.</p></div><span class="a29-marker">Lokal auf deinem iPhone</span></div>
 <div id="a29-status" class="a29-status" role="status" aria-live="polite">Gespeicherte Daten werden ausgewertet …</div>
 <p id="a29-lead" class="a29-lead"></p>
 <div id="a29-kpis" class="a29-kpis"></div>
 <details class="a29-details" open><summary>Medizinische Einordnung und Begründung</summary><div id="a29-facts"></div></details>
 <p id="a29-action" class="a29-action"></p>
 <div class="a29-actions"><button type="button" class="btn btn-primary" id="a29-refresh">Einschätzung aktualisieren</button><button type="button" class="btn btn-outline" id="a29-control">Vier Kontrollfragen beantworten</button><button type="button" class="btn btn-outline" id="a29-lung">Lungenwerte ansehen</button></div>
 <div class="a29-emergency"><strong>Notfallsymptome?</strong> Bei schwerer Atemnot in Ruhe, kaum möglichem Sprechen, bläulichen Lippen, Verwirrtheit oder zunehmender Erschöpfung sofort <a href="tel:112">112</a> rufen. Nicht auf diese Auswertung warten.</div>
 <p class="a29-small">Ein niedriger FEV₁-Wert oder Beschwerden können zu Asthma passen, beweisen es aber nicht. Diagnostik erfordert Anamnese, qualitätsgesicherte Spirometrie (u. a. FEV₁/FVC), Variabilität und ggf. Bronchodilatationstest. Keine automatische Einschätzung von Medikamentendosen, Asthmaschweregrad oder Notfallgrenzen.</p>
 <div class="a29-sources">Quellen: <a href="https://ginasthma.org/2026-gina-summary-guide/" rel="noopener noreferrer" target="_blank">GINA 2026</a> · <a href="https://www.awmf.org/aktuelles/awmf-aktuell/nationale-versorgungsleitlinie-asthma-1" rel="noopener noreferrer" target="_blank">NVL Asthma</a>.</div>`;
 const anchor=$('a28-daily');if(anchor)anchor.insertAdjacentElement('afterend',card);else (root.querySelector('.d26-dashboard')||root).prepend(card);
 const metric=(label,value,subtitle)=>{const k=node('div','a29-kpi');k.append(node('small','',label),node('strong','',value),node('span','',subtitle));return k};
 let busy=false,again=false,last=null;
 async function refresh(){
    if(busy){again=true;return}busy=true;
    try{
      const [suite,diary,epef]=await Promise.all(['suite','diary','epef'].map(k=>SEC.list(k)));
      const checks=suite.filter(x=>x.type==='checks').map(x=>x.value||{});
      const r=assessment({checks,suite,diary,epef,profile:SEC.profileGet?.()||{}});last=r;
      const status=$('a29-status');status.className='a29-status '+(r.urgency==='review'?'a29-attention':'a29-neutral');
      status.textContent=r.urgency==='review'?'Auffällige Werte/Beschwerden – ärztliche Rücksprache empfohlen':r.control.valid?'Orientierende Verlaufsbeurteilung':'Daten für eine sichere Einordnung unvollständig';
      $('a29-lead').textContent=r.lead;
      const kpis=$('a29-kpis');kpis.replaceChildren(
        metric('Vier Kontrollfragen',r.control.valid?String(r.control.yes)+' / 4':'–',r.control.valid?'Auffällige Antworten':'Aktuelle Antworten fehlen'),
        metric('FEV₁',r.lung.valid?String(r.lung.fev).replace('.',',')+' %':'–',r.lung.valid?'Vom Soll · '+fmtDate(r.lung.date):'Keine aktuelle Messung'),
        metric('PEF',r.pef.valid?Math.round(r.pef.value)+' l/min':'–',r.pef.valid?fmtDate(r.pef.date):'Keine Messung'),
        metric('Bedarf · 7 Tage',r.symptoms.relieverSum===null?'–':r.symptoms.relieverSum,r.symptoms.relieverSum===null?'Nicht dokumentiert':'Nur erfasste Anwendungen')
      );
      const facts=$('a29-facts');facts.replaceChildren();const ul=node('ul');for(const fact of r.notes)ul.append(node('li','',fact));facts.append(ul);
      $('a29-action').textContent='Empfehlung zur Abklärung: '+r.action;
    }catch(e){const status=$('a29-status');status.className='a29-status a29-attention';status.textContent='Die Beurteilung kann nicht geladen werden. Daten bleiben unverändert: '+(e?.message||e);$('a29-lead').textContent='Keine Einschätzung möglich.';}
    finally{busy=false;if(again){again=false;refresh()}}
 }
 $('a29-refresh').addEventListener('click',refresh);
 $('a29-lung').addEventListener('click',()=>window.ASTHMA_NAV?.go?.('lungenwerte'));
 $('a29-control').addEventListener('click',()=>{
   window.ASTHMA_NAV?.go?.('therapie');
   const b=document.querySelector('[data-subtab="control"]');b?.click();
   document.getElementById('control-form')?.scrollIntoView({block:'start',behavior:'smooth'});
 });
 window.addEventListener('asthma:secure-change',e=>{if(['suite','epef','diary','au'].includes(e.detail?.group))refresh()});
 window.addEventListener('asthma:lung-imported',refresh);
 // Expose pure computations for local tests only; no patient records or results globally shared.
 window.ASTHMA_ASSESSMENT29_TEST=Object.freeze({controlAssessment,lungAssessment,diaryAssessment,pefAssessment,assessment});
 refresh();
})();
