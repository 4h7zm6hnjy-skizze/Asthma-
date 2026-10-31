'use strict';
/* PneumoPro 3.7.8 – kompakte Startseite und datensparsame Bildschirm-Arztansicht.
   Verändert keine vorhandenen Messdaten oder Berichte. */
(()=>{
 const S=window.ASTHMA_SECURITY,N=window.ASTHMA_NAV;
 const home=document.getElementById('uebersicht'),dash=document.getElementById('pp376-dashboard');
 if(!S?.state?.().unlocked||!N?.go||!home||!dash||document.getElementById('pp378-toolbar'))return;
 const $=id=>document.getElementById(id);
 const make=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=String(content);return n};
 const n=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
 const localDay=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 const fmt=(date)=>/^\d{4}-\d{2}-\d{2}$/.test(date||'')?date.slice(8,10)+'.'+date.slice(5,7)+'.'+date.slice(0,4):'nicht erfasst';
 const numeric=(v,precision=0)=>v===null?'–':Number(v).toLocaleString('de-DE',{maximumFractionDigits:precision,minimumFractionDigits:precision});
 const freshest=xs=>xs.filter(Boolean).sort((a,b)=>(String(a.date||'')+' '+String(a.time||'')+' '+String(a.createdAt||'')+' '+String(a.id||'')).localeCompare(String(b.date||'')+' '+String(b.time||'')+' '+String(b.createdAt||'')+' '+String(b.id||''))).at(-1)||null;
 const css=make('style');css.id='pp378-style';
 css.textContent=`
/* Die bisherigen Startseitenbausteine bleiben im DOM für ihre bisherigen Funktionen, aber nicht im Sichtbereich. */
#uebersicht.pp378-compact > :not(#pp376-dashboard){display:none!important}
html.app-unlocked #start.hero{display:none!important}
#uebersicht.pp378-compact #pp376-dashboard{margin:0 0 16px;padding:13px;border:1px solid #cbdfe7;border-radius:18px;max-width:100%}
#uebersicht.pp378-compact .pp376-sub{font-size:.93rem;line-height:1.4;margin:7px 0 0}
#uebersicht.pp378-compact .pp376-head{margin-bottom:8px}
#uebersicht.pp378-compact #pp376-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
#uebersicht.pp378-compact .pp376-card{min-height:0;padding:12px 10px;border-left-width:6px;border-radius:13px;box-shadow:none}
#uebersicht.pp378-compact .pp376-name{font-size:.82rem;line-height:1.25;max-width:95%;overflow-wrap:anywhere}
#uebersicht.pp378-compact .pp376-value{font-size:clamp(1.25rem,4.1vw,1.7rem);margin:9px 0 5px;overflow-wrap:anywhere}
#uebersicht.pp378-compact .pp376-date,#uebersicht.pp378-compact .pp376-note{font-size:.78rem;line-height:1.35}
#uebersicht.pp378-compact .pp376-badge{font-size:.77rem;padding:7px 8px;border-width:2px;margin-top:9px;border-radius:9px;gap:6px;overflow-wrap:anywhere}
#uebersicht.pp378-compact .pp376-dot{width:10px;height:10px}
#uebersicht.pp378-compact .pp376-card::after{font-size:36px}
#uebersicht.pp378-compact .pp376-actions{margin-top:12px;gap:6px}
#uebersicht.pp378-compact .pp376-actions button{padding:9px 10px;font-size:.86rem;min-height:42px}
#pp378-toolbar{display:flex;align-items:stretch;gap:9px;flex-wrap:wrap;margin:8px 0 14px}
#pp378-toolbar button{flex:1 1 150px;background:#0e6379;color:white;border:0;border-radius:12px;min-height:46px;font-weight:700;font-size:.98rem;padding:9px 11px;cursor:pointer}
#pp378-toolbar button.pp378-secondary{background:white;border:1px solid #a7cdd6;color:#17536b}
.pp378-emergency{font-size:.78rem;line-height:1.45;margin:12px 0 2px;color:#476979}.pp378-emergency a{color:#0b5572;font-weight:800}
#uebersicht.pp378-compact .pp378-stairs{--tone:#2779a2}
.pp378-stairs-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.pp378-stairs-row button{border:1px solid #9dc4d1;background:#f1f9fb;color:#15546a;border-radius:9px;padding:9px;font-size:.8rem;font-weight:750;flex:1;min-width:0}
#pp378-modal,#pp378-steps-dialog{border:0;padding:0;border-radius:18px;background:#fff;color:#173c51;box-shadow:0 18px 70px rgba(7,33,45,.25);width:min(94vw,900px);max-height:90dvh;overflow-y:auto;overscroll-behavior:contain}
#pp378-modal::backdrop,#pp378-steps-dialog::backdrop{background:rgba(0,22,35,.6)}
.pp378-modal-inner{padding:clamp(13px,3vw,24px)}
.pp378-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
.pp378-modal-head h2{font-size:clamp(1.25rem,3.4vw,1.9rem);line-height:1.2;color:#123b53;margin:0}
.pp378-modal-head p{margin:6px 0 0;color:#56717e;font-size:.92rem}
.pp378-close{background:white;border:1px solid #b7d4df;border-radius:12px;min-width:47px;min-height:43px;font-weight:700;color:#164a60}
.pp378-explain{border-left:4px solid #80b5c7;background:#eff7fa;padding:10px 12px;margin:10px 0 14px;border-radius:8px;font-size:.88rem;line-height:1.5}
.pp378-profile{font-weight:700;margin:12px 0 16px;line-height:1.5;overflow-wrap:anywhere}
.pp378-doctor-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.pp378-doctor-measure{border:1px solid #d5e4ea;border-radius:10px;padding:10px;min-width:0}
.pp378-doctor-measure strong{display:block;color:#134760;font-size:1.05rem;margin:5px 0}
.pp378-doctor-measure span{display:block;font-size:.83rem;color:#5d7281}
.pp378-modal-inner h3{font-size:1.05rem;margin:18px 0 8px;color:#13445b}
.pp378-medications{margin:0;padding-left:21px;font-size:.91rem;line-height:1.6;overflow-wrap:anywhere}
.pp378-doctor-links{display:flex;gap:6px;flex-wrap:wrap;margin:16px 0}
.pp378-doctor-links button{background:#e9f5f8;border:1px solid #a2c5d2;border-radius:9px;padding:10px 11px;color:#174d64;font-weight:700;min-height:42px}
.pp378-field{display:grid;gap:5px;margin-bottom:12px;font-size:.96rem;font-weight:700}
.pp378-field select,.pp378-field input{width:100%;min-height:46px;font-size:1rem;padding:8px;border:1px solid #9ebec9;border-radius:10px;background:#fff;color:#143b50}
.pp378-status{min-height:20px;color:#245c6e;font-size:.91rem}
@media(min-width:800px){#uebersicht.pp378-compact #pp376-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media(max-width:350px){#uebersicht.pp378-compact #pp376-grid{grid-template-columns:1fr}}
@media print{#pp378-modal,#pp378-steps-dialog{display:none!important}}
`;
 document.head.append(css);
 home.classList.add('pp378-compact');
 // Die alte Startseiten-Diagrammdarstellung bleibt unverändert für bestehende Datenbindung;
 // die tatsächlich sichtbaren Verläufe liegen unter Lunge, Vital und Peak-Flow.
 const toolbar=make('div');toolbar.id='pp378-toolbar';
 const doctorButton=make('button','', 'Arztansicht öffnen');doctorButton.type='button';
 const menuButton=make('button','pp378-secondary','Alle Bereiche');menuButton.type='button';
 menuButton.addEventListener('click',()=>N.go('mehr'));
 toolbar.append(doctorButton,menuButton);
 const head=dash.querySelector('.pp376-head');
 if(head)head.insertAdjacentElement('afterend',toolbar);else dash.prepend(toolbar);
 const grid=$('pp376-grid');
 if(!grid)return;
 // Ein kurzer Notfallhinweis bleibt trotz ausgeblendeter alter Startseitenelemente erhalten.
 const emergency=make('p','pp378-emergency','Bei schwerer akuter Atemnot oder Brustschmerzen: ');
 const call=make('a','','112 anrufen');call.href='tel:112';
 emergency.append(call,document.createTextNode('. Die App ersetzt keine Notfallversorgung.'));
 const actions=dash.querySelector('.pp376-actions');
 if(actions)actions.insertAdjacentElement('afterend',emergency);else dash.append(emergency);

 const stepsCard=make('article','pp376-card pp378-stairs');stepsCard.id='pp378-stairs-card';stepsCard.dataset.bg='↟';
 stepsCard.style.setProperty('--tone','#2779a2');
 stepsCard.append(make('div','pp376-name','Treppenzähler'),make('div','pp376-value','–'),make('span','pp376-date','Heute · '+fmt(localDay())),make('span','pp376-note','Gespeicherte Stufen, keine Schrittzahl'));
 const stepsAction=make('div','pp378-stairs-row');const stepsNew=make('button','','Erfassen');stepsNew.type='button';const stepsWork=make('button','','Arbeit öffnen');stepsWork.type='button';
 stepsWork.addEventListener('click',()=>N.go('arbeit'));
 stepsAction.append(stepsNew,stepsWork);stepsCard.append(stepsAction);
 const attachSteps=()=>{if(stepsCard.parentElement!==grid)grid.append(stepsCard)};
 attachSteps();
 const gridObserver=new MutationObserver(attachSteps);gridObserver.observe(grid,{childList:true});

 const app=$('secure-application')||document.body;
 const doctorDialog=make('dialog');doctorDialog.id='pp378-modal';doctorDialog.setAttribute('aria-label','Ärztlicher Überblick');
 const doctorInner=make('div','pp378-modal-inner');doctorDialog.append(doctorInner);app.append(doctorDialog);
 const stepsDialog=make('dialog');stepsDialog.id='pp378-steps-dialog';stepsDialog.setAttribute('aria-label','Treppen erfassen');
 stepsDialog.innerHTML='<div class="pp378-modal-inner"><div class="pp378-modal-head"><div><h2>Treppen erfassen</h2><p>Manueller Eintrag in deinen verschlüsselten Treppenzähler.</p></div><button type="button" class="pp378-close" id="pp378-steps-close" aria-label="Schließen">✕</button></div><form id="pp378-steps-form"><label class="pp378-field">Anzahl Stufen<select name="steps" required><option value="15">15 Stufen</option><option value="17">17 Stufen</option><option value="30">30 Stufen</option><option value="90">90 Stufen</option></select></label><label class="pp378-field">Grund (optional)<input name="reason" maxlength="120" placeholder="z. B. Kühlanlage, WC oder Material"></label><button class="btn btn-primary" type="submit">Verschlüsselt speichern</button><p class="pp378-status" id="pp378-steps-status" role="status"></p></form></div>';
 app.append(stepsDialog);
 $('pp378-steps-close').addEventListener('click',()=>stepsDialog.close());
 stepsNew.addEventListener('click',()=>{if(!stepsDialog.open)stepsDialog.showModal()});
 let saving=false;
 $('pp378-steps-form').addEventListener('submit',async event=>{
  event.preventDefault();if(saving)return;
  const form=event.currentTarget,steps=n(form.elements.steps.value),reason=String(form.elements.reason.value||'').trim().slice(0,120);
  const status=$('pp378-steps-status');
  if(![15,17,30,90].includes(steps)){status.textContent='Bitte eine der Stufenzahlen wählen.';return;}
  saving=true;status.textContent='Wird verschlüsselt gespeichert …';
  try{
   const now=new Date(),date=localDay(),time=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
   const id=crypto.randomUUID?.() || ("stairs-"+Date.now().toString(36)+"-"+Array.from(crypto.getRandomValues(new Uint32Array(2))).map(x=>x.toString(36)).join("-"));
   const value={id,date,time,steps,reason:reason||'Manuell erfasst',createdAt:now.toISOString(),updatedAt:now.toISOString()};
   await S.put('suite',{key:'stairs/'+id,type:'stairs',value},'stairs/'+id);
   status.textContent=steps+' Stufen gespeichert.';
   form.reset();await refreshSteps();
  }catch(err){status.textContent='Speichern nicht möglich: '+(err?.message||'Unbekannter Fehler');}
  finally{saving=false;}
 });

 const doctorClose=()=>{if(doctorDialog.open)doctorDialog.close()};
 doctorButton.addEventListener('click',async()=>{
  if(!doctorDialog.open)doctorDialog.showModal();
  await renderDoctor();
 });
 function measure(parent,title,value,date,source){
  const tile=make('div','pp378-doctor-measure');
  tile.append(make('span','',title),make('strong','',value),make('span','',fmt(date)+(source?' · '+source:'')));
  parent.append(tile);
 }
 async function renderDoctor(){
  doctorInner.replaceChildren();
  const head=make('div','pp378-modal-head');const title=make('div');title.append(make('h2','','Ärztlicher Überblick'),make('p','','Stand: '+new Date().toLocaleString('de-DE')));
  const close=make('button','pp378-close','✕');close.type='button';close.setAttribute('aria-label','Arztansicht schließen');close.addEventListener('click',doctorClose);
  head.append(title,close);doctorInner.append(head);
  doctorInner.append(make('p','pp378-explain','Bildschirmansicht mit den zuletzt gespeicherten Einträgen. Keine medizinische Diagnose, keine automatische Bewertung und keine Bestätigung der tatsächlichen Medikamenteneinnahme.'));
  if(!S.state().unlocked){doctorInner.append(make('p','','Tresor gesperrt.'));return;}
  const waits=await Promise.allSettled(['suite','epef','calendar','diary'].map(group=>S.list(group)));
  if(!doctorDialog.open)return;
  const rows=waits[0].status==='fulfilled'?waits[0].value:[],epef=waits[1].status==='fulfilled'?waits[1].value:[],events=waits[2].status==='fulfilled'?waits[2].value:[],diary=waits[3].status==='fulfilled'?waits[3].value:[];
  const p=S.profileGet?.()?.personal||{};
  const profile=make('div','pp378-profile');
  const details=[p.fullName||'Patientenprofil'];
  if(p.birthDate)details.push('Geburtsdatum: '+fmt(p.birthDate));
  if(n(p.heightCm)!==null)details.push('Größe: '+numeric(n(p.heightCm),0)+' cm');
  profile.textContent=details.join(' · ');doctorInner.append(profile);
  if(waits.some(w=>w.status==='rejected'))doctorInner.append(make('p','pp378-explain','Einzelne Datenbereiche konnten nicht geladen werden. Bitte im jeweiligen Bereich prüfen.'));
  doctorInner.append(make('h3','','Letzte Messwerte'));
  const list=make('div','pp378-doctor-grid');doctorInner.append(list);
  const vitals=rows.filter(r=>r.type==='vital29').map(r=>r.value).filter(Boolean);
  const oxygen=freshest(vitals.filter(x=>x.kind==='spo2'));
  const bp=freshest(vitals.filter(x=>x.kind==='bp'));
  const pulse=freshest(vitals.filter(x=>x.kind==='pulse'));
  const weight=freshest(rows.filter(r=>r.type==='weight292').map(r=>r.value));
  const lung=freshest(rows.filter(r=>r.type==='measurements').map(r=>r.value));
  const peak=freshest(epef.filter(r=>r.kind==='measurement'));
  const formatValue=(v,unit,dec=0)=>n(v)===null?'–':numeric(n(v),dec)+' '+unit;
  measure(list,'SpO₂',formatValue(oxygen?.value,'%'),oxygen?.date,oxygen?.source||'');
  measure(list,'Blutdruck',n(bp?.value)===null||n(bp?.diastolic)===null?'–':numeric(n(bp.value))+'/'+numeric(n(bp.diastolic))+' mmHg',bp?.date,bp?.source||'');
  measure(list,'Puls',formatValue(pulse?.value,'/min'),pulse?.date,pulse?.source||'');
  measure(list,'Gewicht',formatValue(weight?.kg,'kg',1),weight?.date,'');
  measure(list,'FEV₁',formatValue(lung?.fev1,'% vom Soll'),lung?.date,'ärztlicher Test');
  measure(list,'FVC',formatValue(lung?.fvc,'% vom Soll'),lung?.date,'ärztlicher Test');
  measure(list,'PEF (ePEF)',formatValue(peak?.pef,'l/min'),peak?.date,'Heimmessung');
  // Nur dokumentierte Beschwerden angeben, fehlende Einträge nicht als beschwerdefrei werten.
  const cutDays=count=>{const d=new Date();d.setDate(d.getDate()-(count-1));return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
  const today=localDay(),recent=diary.filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date||'')&&r.date>=cutDays(30)&&r.date<=today);
  doctorInner.append(make('h3','','Dokumentierte Beschwerden'));
  if(recent.length){
   const seven=recent.filter(r=>r.date>=cutDays(7));
   const uses=seven.map(r=>n(r.rescue)).filter(v=>v!==null&&v>=0);
   const nights=recent.filter(r=>r.night===true).length;
   const msg='Bedarfsanwendungen (7 Tage): '+(uses.length?numeric(uses.reduce((a,b)=>a+b,0)):'nicht erfasst')+' · Nächte mit Beschwerden (30 Tage): '+nights+' dokumentiert';
   doctorInner.append(make('p','',msg));
  }else doctorInner.append(make('p','','Keine Tagebucheinträge in den letzten 30 Tagen. Das bedeutet nicht Beschwerdefreiheit.'));
  const meds=rows.filter(r=>r.type==='meds').map(r=>r.value).filter(m=>m?.name).sort((a,b)=>String(a.name).localeCompare(String(b.name),'de'));
  doctorInner.append(make('h3','','Im Medikamentenplan gespeichert ('+meds.length+')'));
  if(meds.length){const ol=make('ul','pp378-medications');for(const m of meds.slice(0,14))ol.append(make('li','',String(m.name)+(m.dose?' · '+String(m.dose):'')+(m.route?' · '+String(m.route):'')));doctorInner.append(ol);if(meds.length>14)doctorInner.append(make('p','','Weitere '+(meds.length-14)+' Medikamente im vollständigen Therapieplan.'))}
  else doctorInner.append(make('p','','Keine Medikamente im verschlüsselten Plan gespeichert.'));
  const upcoming=events.filter(e=>/^\d{4}-\d{2}-\d{2}$/.test(e.date||'')&&e.date>=localDay()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
  doctorInner.append(make('h3','','Nächste dokumentierte Termine'));
  if(upcoming.length){const ul=make('ul','pp378-medications');for(const event of upcoming){ul.append(make('li','',fmt(event.date)+' · '+String(event.title||event.type||'Termin')))}doctorInner.append(ul)}else doctorInner.append(make('p','','Keine künftigen Termine im manuellen Kalender erfasst.'));
  doctorInner.append(make('p','pp378-explain','Messwerte können aus verschiedenen Geräten, Messphasen und Zeitpunkten stammen. Klinische Einschätzung und persönliche Grenzwerte gehören zur ärztlichen Beurteilung.'));
  const links=make('div','pp378-doctor-links');
  for(const [label,page] of [['Lungenfunktion','lungenwerte'],['Vitalwerte','vitalwerte'],['Peak-Flow','peakflow'],['Medikamente','therapie'],['Befunde','befunde'],['Kalender','kalender'],['Arztbericht','bericht']]){
   const b=make('button','',label);b.type='button';b.addEventListener('click',()=>{doctorClose();N.go(page)});links.append(b);
  }
  const reload=make('button','','Werte aktualisieren');reload.type='button';reload.addEventListener('click',renderDoctor);links.append(reload);doctorInner.append(links);
 }
 async function refreshSteps(rows){
  if(!S.state().unlocked)return;
  if(!rows)rows=await S.list('suite');
  const d=localDay();let sum=0;
  for(const r of rows){if(r.type!=='stairs'||r.value?.date!==d)continue;const v=n(r.value.steps);if(v!==null&&v>0&&v<50000)sum+=v;}
  const value=stepsCard.querySelector('.pp376-value');if(value)value.textContent=sum.toLocaleString('de-DE')+' Stufen';
  const date=stepsCard.querySelector('.pp376-date');if(date)date.textContent='Heute · '+fmt(d);
 }
 let scheduled=0;
 function scheduleSteps(){clearTimeout(scheduled);scheduled=setTimeout(()=>refreshSteps().catch(e=>{const val=stepsCard.querySelector('.pp376-value');if(val)val.textContent='Nicht verfügbar';console.warn('Treppenzähler:',e.message)}),130)}
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite')scheduleSteps()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)scheduleSteps()});
 scheduleSteps();
 window.PNEUMOPRO_DASHBOARD378=Object.freeze({version:'3.7.8',refresh:scheduleSteps,openDoctor:()=>doctorButton.click()});
})();
