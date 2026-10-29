'use strict';
/* Asthma 2.7.0 Professional – local UI only. Never hard-code personal information. */
(()=>{
  const SEC=window.ASTHMA_SECURITY;
  const $=id=>document.getElementById(id);
  const profile=$('profil'),start=$('uebersicht');
  if(!SEC||!profile||!start||!SEC.state?.().unlocked||$('a27-profile'))return;
  const today=()=>{
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const safeDate=x=>{
    if(!x)return true;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;
    const dt=new Date(`${x}T12:00:00`);
    return !Number.isNaN(dt.getTime())&&
      dt.getFullYear()===+x.slice(0,4)&&dt.getMonth()===+x.slice(5,7)-1&&dt.getDate()===+x.slice(8,10);
  };
  const formFields=[
    {name:'fullName',label:'Vor- und Nachname',type:'text',size:120,wide:true},
    {name:'street',label:'Straße und Hausnummer',type:'text',size:180,wide:true},
    {name:'postalCode',label:'Postleitzahl',type:'text',size:12},
    {name:'city',label:'Wohnort',type:'text',size:120},
    {name:'birthDate',label:'Geburtsdatum',type:'date'},
    {name:'heightCm',label:'Körpergröße (cm)',type:'number',min:90,max:250,step:'0.1'},
    {name:'weightKg',label:'Gewicht in Kilogramm',type:'number',min:1,max:500,step:'0.1'},
    {name:'weightDate',label:'Datum der Gewichtsmessung (optional)',type:'date'},
    {name:'doctor',label:'Behandelnde Praxis (optional)',type:'text',size:120,wide:true},
    {name:'emergencyContact',label:'Notfallkontakt (optional)',type:'text',size:180,wide:true},
    {name:'doctorActionPlan',label:'Ärztlich festgelegter Asthma-Aktionsplan (optional)',type:'textarea',size:2000,wide:true}
  ];
  const section=document.createElement('section');
  section.id='a27-profile';section.className='a27-panel';
  section.setAttribute('aria-labelledby','a27-profile-title');
  const head=document.createElement('div');head.className='a27-header';
  head.innerHTML='<div><p class="section-kicker">Verschlüsselte Gesundheitsakte</p><h3 id="a27-profile-title">Persönliche Daten</h3><p>Privates Patientenprofil, frei bearbeitbar.</p></div><span class="a27-pill">Lokal geschützt</span>';
  section.append(head);
  const form=document.createElement('form');form.id='a27-profile-form';form.autocomplete='off';
  const grid=document.createElement('div');grid.className='a27-formgrid';
  for(const item of formFields){
    const label=document.createElement('label');
    if(item.wide)label.className='a27-wide';
    const id='a27-'+item.name;
    const text=document.createElement('span');text.textContent=item.label;
    const input=document.createElement(item.type==='textarea'?'textarea':'input');
    input.id=id;input.name=item.name;
    if(item.type!=='textarea')input.type=item.type;
    if(item.size)input.maxLength=item.size;
    if(item.min)input.min=item.min;
    if(item.max)input.max=item.max;
    if(item.step)input.step=item.step;
    if(item.type==='number')input.inputMode='decimal';
    if(item.type==='date')input.max=today();
    input.autocomplete='off';
    if(item.type==='textarea')input.rows=5;
    label.append(text,input);grid.append(label);
  }
  form.append(grid);
  const calc=document.createElement('div');calc.id='pp347-profile-body';calc.className='pp347-body';calc.setAttribute('aria-live','polite');form.append(calc);
  const drawBody=()=>{
    const calcAPI=window.PNEUMOPRO_AMPEL347,ref=calcAPI?.body(form.elements.heightCm.value,form.elements.weightKg.value);
    if(!ref){calc.textContent='Für BMI und Körperoberfläche bitte Körpergröße und Gewicht eintragen.';return;}
    const n=(v,d)=>v.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
    calc.replaceChildren();const row=document.createElement('strong');row.textContent='BMI: '+n(ref.bmi,1)+' kg/m² · Körperoberfläche: '+n(ref.bsa,2)+' m²';calc.append(row);
    const p=document.createElement('p');p.textContent='BMI-Orientierungsbereich für Erwachsene: '+n(ref.weightMin,1)+'–'+n(ref.weightMax,1)+' kg (BMI 18,5 bis unter 25). Keine persönliche Therapie- oder Gewichts-Vorgabe.';calc.append(p);
  };
  grid.addEventListener('input',event=>{if(['heightCm','weightKg'].includes(event.target.name))drawBody()});
  const actions=document.createElement('div');actions.className='a27-form-actions';
  const save=document.createElement('button');save.type='submit';save.className='btn btn-primary';save.textContent='Persönliche Daten verschlüsselt speichern';
  const msg=document.createElement('p');msg.id='a27-profile-msg';msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');
  actions.append(save,msg);form.append(actions);
  const note=document.createElement('p');note.className='input-note';
  note.textContent='Deine Angaben erscheinen erst nach dem Entsperren und werden im bestehenden Tresor auf diesem Gerät gespeichert. Keine automatische Übernahme aus dem Chat, keine Cloud-Synchronisierung. Einen Asthma-Aktionsplan nur nach ärztlicher Festlegung eintragen.';
  form.append(note);section.append(form);
  const heading=profile.querySelector('.section-heading');
  if(heading)heading.insertAdjacentElement('afterend',section);else profile.prepend(section);
  const get=k=>form.elements.namedItem(k);
  const value=k=>String(get(k).value||'').trim();
  const readPersonal=()=>{
    const p=SEC.profileGet();
    return p&&p.personal&&typeof p.personal==='object'&&!Array.isArray(p.personal)?p.personal:{};
  };
  const show=()=>{
    const data=readPersonal();
    for(const f of formFields){
      const v=data[f.name];
      get(f.name).value=v===null||v===undefined?'':String(v);
    }
    msg.textContent='';
    document.querySelectorAll('#a27-profile input[type=date]').forEach(el=>el.max=today());
    refreshName();drawBody();
  };
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(save.disabled)return;
    const personal={};
    for(const f of formFields)personal[f.name]=value(f.name);
    const kg=personal.weightKg.replace(',','.');
    if((personal.birthDate&&(!safeDate(personal.birthDate)||personal.birthDate>today()))||
       (personal.weightDate&&(!safeDate(personal.weightDate)||personal.weightDate>today()))){
      msg.textContent='Das eingegebene Datum ist ungültig oder liegt in der Zukunft.';return;
    }
    if(kg!==''&&(!Number.isFinite(Number(kg))||Number(kg)<1||Number(kg)>500)){
      msg.textContent='Bitte ein Gewicht zwischen 1 und 500 kg eintragen.';return;
    }
    personal.weightKg=kg===''?null:Number(kg);
    const h=personal.heightCm.replace(',','.');
    if(h!==''&&(!Number.isFinite(Number(h))||Number(h)<90||Number(h)>250)){
      msg.textContent='Bitte eine Körpergröße zwischen 90 und 250 cm eingeben.';return;
    }
    personal.heightCm=h===''?null:Number(h);
    save.disabled=true;msg.textContent='Daten werden verschlüsselt gespeichert …';
    try{
      await SEC.updateProfile({personal:{...readPersonal(),...personal}});
      msg.textContent='Die persönlichen Angaben sind gespeichert.';
      refreshName();
      window.dispatchEvent(new CustomEvent('asthma:personal-profile-updated'));
    }catch(err){
      msg.textContent='Speichern fehlgeschlagen: '+(err?.message||'Unbekannter Fehler');
    }finally{save.disabled=false;}
  });
  window.addEventListener('asthma:profile-reset',show);
  window.addEventListener('asthma:secure-change',event=>{
    if(event.detail?.group==='profile')show();
  });

  // Single-source dashboard: display only stored personal name, never demo or guessed values.
  const dash=$('a27-personal-summary')||document.createElement('div');
  dash.id='a27-personal-summary';dash.className='a27-identity';
  const overview=document.createElement('div');overview.className='a281-profile-overview';
  const greeting=document.createElement('span');overview.append(greeting);
  const patientDetails=document.createElement('small');overview.append(patientDetails);
  dash.append(overview);
  const link=document.createElement('button');link.type='button';link.className='btn btn-outline';
  link.textContent='Profil bearbeiten';link.dataset.goto='profil';dash.append(link);
  const hero=start.querySelector('.d26-dashboard')||start;
  hero.prepend(dash);
  function refreshName(){
    const p=readPersonal(),name=String(p.fullName||'').trim();
    greeting.textContent=name?`Patientenprofil: ${name}`:'Persönliches Profil noch nicht ausgefüllt';
    const details=[];
    if(/^\d{4}-\d{2}-\d{2}$/.test(p.birthDate||'')&&safeDate(p.birthDate)){
      details.push('Geboren: '+p.birthDate.slice(8)+'.'+p.birthDate.slice(5,7)+'.'+p.birthDate.slice(0,4));
    }
    const kg=p.weightKg===null||p.weightKg===undefined||p.weightKg===''?null:Number(p.weightKg);
    if(kg!==null&&Number.isFinite(kg)&&kg>=1&&kg<=500){
      details.push('Gewicht: '+kg.toLocaleString('de-DE',{maximumFractionDigits:1})+' kg');
    }
    const h=window.PNEUMOPRO_AMPEL347?.heightCm(p.heightCm),result=window.PNEUMOPRO_AMPEL347?.body(h,kg);
    if(h!==null&&h!==undefined)details.push('Größe: '+h.toLocaleString('de-DE',{maximumFractionDigits:1})+' cm');
    if(result)details.push('BMI: '+result.bmi.toLocaleString('de-DE',{maximumFractionDigits:1})+' · KOF: '+result.bsa.toLocaleString('de-DE',{maximumFractionDigits:2})+' m²');
    const city=String(p.city||'').trim();
    if(city)details.push('Wohnort: '+city.slice(0,120));
    patientDetails.textContent=details.join(' · ');
    patientDetails.hidden=details.length===0;
  }

  // Read-only measurement summary; no interpretation of clinical severity.
  const panel=document.createElement('section');panel.className='a27-panel a27-summary';
  panel.id='a27-summary';
  panel.innerHTML='<div class="a27-header"><div><p class="section-kicker">Verlauf · dokumentiert</p><h3>Deine Aufzeichnungen</h3><p>Nur gespeicherte Einträge – keine medizinische Bewertung.</p></div></div><div class="a27-summary-cards">'+
    '<div><strong id="a27-peak-count">–</strong><span>Peak-Flow-Messungen (30 Tage)</span></div>'+
    '<div><strong id="a27-diary-count">–</strong><span>Tagebucheinträge (30 Tage)</span></div>'+
    '<div><strong id="a27-spiro-count">–</strong><span>Bestätigte Lungenuntersuchungen (gesamt)</span></div></div>'+
    '<div class="a27-links"><button class="btn btn-outline" type="button" data-goto="peakflow">Peak-Flow öffnen</button><button class="btn btn-outline" type="button" data-goto="lungenwerte">Lungenfunktion öffnen</button></div>';
  hero.append(panel);
  const fields={'peak-count':'epef','diary-count':'diary','spiro-count':'suite'};
  const cutoff=(()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-29);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');})();
  let busy=false;
  async function refreshSummary(){
    if(busy)return;busy=true;
    try{
      const results=await Promise.allSettled(['epef','diary','suite'].map(group=>SEC.list(group)));
      const usable=results.map(r=>r.status==='fulfilled'&&Array.isArray(r.value)?r.value:null);
      const pef=usable[0],diary=usable[1],suite=usable[2];
      $('a27-peak-count').textContent=pef?String(pef.filter(x=>x.kind==='measurement'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date||'')&&x.date>=cutoff&&x.date<=today()).length):'–';
      $('a27-diary-count').textContent=diary?String(diary.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.date||'')&&x.date>=cutoff&&x.date<=today()).length):'–';
      $('a27-spiro-count').textContent=suite?String(suite.filter(x=>x.type==='measurements').length):'–';
    }catch(_){
      // On a locked or unavailable vault, leave dashes, never generate invented values.
    }finally{busy=false;}
  }
  const listen=event=>{
    if(['epef','diary','suite'].includes(event.detail?.group))refreshSummary();
  };
  window.addEventListener('asthma:secure-change',listen);
  window.addEventListener('asthma:lung-imported',refreshSummary);
  window.addEventListener('asthma:personal-profile-updated',refreshSummary);
  show();refreshSummary();
  window.__ASTHMA_PROFESSIONAL27_TEST=Object.freeze({version:'2.7.0',hasPersonalForm:true,hasSeparatePeakFlow:true});
})();
