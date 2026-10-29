'use strict';
/* Asthma 2.9.0: private vital measurements and strictly limited medication alerts.
 * Records remain in the existing password-encrypted suite vault.
 * No remote requests, no external libraries or drug-database calls.
 */
(()=>{
  const SEC=window.ASTHMA_SECURITY;
  const $=id=>document.getElementById(id);
  if(!SEC?.state?.().unlocked || !$('vitalwerte') || $('v29-root')) return;
  const PERIODS=[['1','Tag'],['7','Woche'],['30','Monat'],['365','Jahr'],['3652','10 Jahre']];
  const TYPES={
    spo2:{title:'Blutsauerstoff (SpO₂)',unit:'%',series:[['value','SpO₂','#0e8594']],min:40,max:100,decimals:1,sources:['Apple Watch','Finger-Pulsoximeter','Ohr-Pulsoximeter','Anderes Gerät']},
    bp:{title:'Blutdruck',unit:'mmHg',series:[['value','Systolisch','#af5268'],['diastolic','Diastolisch','#5372b7']],min:40,max:300,decimals:0,sources:['Oberarm','Handgelenk','Arztpraxis','Anderes Gerät']},
    pulse:{title:'Puls',unit:'Schläge/min',series:[['value','Puls','#a666a6']],min:20,max:250,decimals:0,sources:['Apple Watch','Finger-Pulsoximeter','Ohr-Pulsoximeter','Blutdruckgerät','Manuell']}
  };
  const REF=[
    ['spo2','SpO₂: ärztlich bestätigte Untergrenze (%)',40,100],
    ['bpSys','Systolisch: ärztliches Ziel (mmHg)',40,300],
    ['bpDia','Diastolisch: ärztliches Ziel (mmHg)',20,200],
    ['pulse','Puls: ärztliches Ziel bei Ruhe (/min)',20,250],
    ['pef','Peak-Flow: persönlicher Bestwert (l/min)',50,1400],
    ['epefFev1','ePEF-FEV₁: ärztlicher Vergleich (Liter)',0.1,12],
    ['fev1','Spirometrie FEV₁: ärztlicher Vergleich (% Soll)',1,200],
    ['fvc','Spirometrie FVC: ärztlicher Vergleich (% Soll)',1,200],
    ['fev1Liters','Spirometrie FEV₁: ärztlicher Vergleich (Liter)',0.1,12],
    ['fvcLiters','Spirometrie FVC: ärztlicher Vergleich (Liter)',0.1,15],
    ['ratio','FEV₁/FVC: ärztlicher Vergleich (%)',1,100]
  ];
  const make=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
  const dateISO=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const timeISO=()=>new Date().toTimeString().slice(0,5);
  const validDate=s=>{if(!/^\d{4}-\d\d-\d\d$/.test(s||''))return false;const d=new Date(s+'T12:00:00');return Number.isFinite(d.getTime())&&dateISO(d)===s;};
  const validTime=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s||'');
  const number=x=>x===''||x===null||x===undefined?null:Number.isFinite(Number(x))?Number(x):null;
  const fmtDate=x=>validDate(x)?x.slice(8)+'.'+x.slice(5,7)+'.'+x.slice(0,4):String(x||'');
  const uid=()=>crypto.randomUUID?.()||'v29-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  let all=[],limits={},meds=[],busy=false,requestId=0,updateTimer=0,referencesInitialized=false;
  const refKey=name=>({value:'spo2',diastolic:'bpDia'})[name]||name;
  const clinicalRef=key=>{const v=number(limits[key]);return v!==null&&v>0?v:null;};
  // Other modules can request a reference without direct access to encrypted records.
  window.ASTHMA_VITAL29=Object.freeze({getRef:clinicalRef,periods:PERIODS.map(x=>x.slice())});
  const root=make('section','v29-root');root.id='v29-root';$('vitalwerte').append(root);
  root.innerHTML='<div class="section-heading"><div><p class="section-kicker">Verschlüsselte Messwerte</p><h2>Blutsauerstoff, Blutdruck und Puls</h2><p>Jeder Wert bleibt bearbeitbar. Die drei Messarten werden getrennt gespeichert und als separate Diagramme angezeigt.</p></div></div>'+
    '<div id="v29-tabs" class="v29-tabs" role="group" aria-label="Messbereich wählen"></div><div id="v29-panels"></div>'+
    '<details class="v29-references"><summary>Persönliche Referenzlinien einstellen</summary><p>Bitte nur ärztlich bestätigte Vergleichs- oder Zielwerte eintragen. Die App kann aus Alter, Körpergröße und Gewicht <strong>keine</strong> sicheren individuellen SpO₂-, Blutdruck- oder Pulsgrenzen ableiten. Ohne Eintrag wird keine persönliche Grenze angezeigt.</p><form id="v29-references-form"><div id="v29-ref-fields" class="v29-fields"></div><button class="btn btn-primary" type="submit">Referenzen verschlüsselt speichern</button></form><p id="v29-ref-status" role="status"></p></details>'+
    '<p class="v29-warning">Bei schwerer Atemnot, Brustschmerzen, Verwirrtheit oder bläulichen Lippen sofort 112. Die Apple Watch ersetzt kein medizinisches Pulsoximeter; Einzelwerte immer im Zusammenhang mit Beschwerden beurteilen lassen.</p>';

  function field(form,title,name,type,attrs={}){
    const label=make('label','',title),input=make('input');input.name=name;input.type=type;
    for(const [k,v] of Object.entries(attrs))input.setAttribute(k,String(v));
    label.append(input);form.append(label);return input;
  }
  for(const [kind,meta] of Object.entries(TYPES)){
    const tab=make('button','btn '+(kind==='spo2'?'btn-primary':'btn-outline'),meta.title);
    tab.type='button';tab.dataset.kind=kind;$('v29-tabs').append(tab);
    const panel=make('article','v29-panel');panel.dataset.kind=kind;panel.hidden=kind!=='spo2';
    panel.append(make('h3','',meta.title));
    panel.append(make('p','input-note',kind==='spo2'?'Messmethode: Apple Watch, Finger oder Ohr. Die reine Webapp liest Apple Health nicht automatisch aus; Messwert bitte übertragen.':kind==='bp'?'Oberen und unteren Wert in einer Messung erfassen. Zwei getrennte farbige Kurven erscheinen im Blutdruckdiagramm.':'Ruhe- und Belastungspuls sind unterschiedlich. Messbedingungen bitte notieren.'));
    const form=make('form','v29-fields');form.id='v29-form-'+kind;
    const date=field(form,'Datum','date','date',{required:'required'});date.value=dateISO();
    const time=field(form,'Uhrzeit','time','time',{required:'required'});time.value=timeISO();
    field(form,kind==='spo2'?'Sauerstoffsättigung (%)':kind==='bp'?'Systolisch (mmHg)':'Puls (Schläge/min)','value','number',{required:'required',min:meta.min,max:meta.max,step:kind==='spo2'?'0.1':'1',inputmode:'decimal'});
    if(kind==='bp')field(form,'Diastolisch (mmHg)','diastolic','number',{required:'required',min:20,max:200,step:1,inputmode:'numeric'});
    const lab=make('label','','Messquelle / Messort'),source=make('select');source.name='source';meta.sources.forEach(v=>source.add(new Option(v,v)));lab.append(source);form.append(lab);
    field(form,'Notiz (optional)','note','text',{maxlength:250,placeholder:'z. B. Ruhe, Belastung, Symptome'});
    const id=make('input');id.type='hidden';id.name='editId';form.append(id);
    const actions=make('div','v29-actions'),save=make('button','btn btn-primary','Speichern'),cancel=make('button','btn btn-outline','Bearbeitung abbrechen');
    save.type='submit';cancel.type='reset';cancel.hidden=true;actions.append(save,cancel);form.append(actions);
    panel.append(form);
    const status=make('p','suite-msg');status.id='v29-status-'+kind;status.setAttribute('role','status');panel.append(status);
    const selLabel=make('label','v29-filter','Diagramm-Zeitraum: '),sel=make('select');sel.id='v29-period-'+kind;PERIODS.forEach(([val,title])=>sel.add(new Option(title,val)));sel.value='30';selLabel.append(sel);panel.append(selLabel);
    const plot=make('div','v29-plot');plot.id='v29-plot-'+kind;panel.append(plot);
    const explanation=make('p','input-note');explanation.id='v29-explanation-'+kind;panel.append(explanation);
    const history=make('div','v29-history');history.id='v29-history-'+kind;panel.append(history);
    $('v29-panels').append(panel);
    tab.addEventListener('click',()=>{root.querySelectorAll('.v29-panel').forEach(el=>el.hidden=el!==panel);root.querySelectorAll('#v29-tabs button').forEach(el=>{el.classList.toggle('btn-primary',el===tab);el.classList.toggle('btn-outline',el!==tab);});});
    form.addEventListener('submit',event=>saveMeasurement(event,kind));
    form.addEventListener('reset',()=>setTimeout(()=>resetForm(kind),0));
    sel.addEventListener('change',()=>draw(kind));
  }
  REF.forEach(([key,title,min,max])=>{
    const label=make('label','',title),input=make('input');input.id='v29-ref-'+key;input.type='number';input.step='any';input.min=min;input.max=max;input.inputMode='decimal';input.placeholder='Nur bestätigter Wert';label.append(input);$('v29-ref-fields').append(label);
  });
  $('v29-references-form').addEventListener('submit',saveReferences);
  function resetForm(kind){const form=$('v29-form-'+kind);form.elements.editId.value='';form.elements.date.value=dateISO();form.elements.time.value=timeISO();form.querySelector('button[type=submit]').textContent='Speichern';form.querySelector('button[type=reset]').hidden=true;}
  function flash(kind,message,error=false){const el=$('v29-status-'+kind);el.textContent=message;el.classList.toggle('suite-error',error);}
  async function saveMeasurement(event,kind){
    event.preventDefault();if(busy)return;const form=event.currentTarget,meta=TYPES[kind];
    const date=form.elements.date.value,time=form.elements.time.value,value=number(form.elements.value.value),dia=kind==='bp'?number(form.elements.diastolic.value):null;
    if(!validDate(date)||!validTime(time)||value===null||value<meta.min||value>meta.max||(kind==='bp'&&(dia===null||dia<20||dia>200||dia>=value))){flash(kind,'Bitte gültiges Datum, Uhrzeit und Messwerte eingeben. Beim Blutdruck muss der obere Wert größer sein als der untere.',true);return;}
    const editId=form.elements.editId.value,source=form.elements.source.value,note=form.elements.note.value.trim().slice(0,250);
    if(!editId&&all.some(x=>x.kind===kind&&x.date===date&&x.time===time&&x.value===value&&x.diastolic===dia&&x.source===source)){flash(kind,'Identische Messung ist bereits gespeichert.',true);return;}
    const id=editId||uid(),previous=all.find(x=>x.id===id);const data={id,kind,date,time,value,diastolic:dia,source,note,createdAt:previous?.createdAt||new Date().toISOString()};
    busy=true;try{await SEC.put('suite',{key:'vital29/'+id,type:'vital29',value:data},'vital29/'+id);form.reset();flash(kind,'Wert verschlüsselt gespeichert.');await refresh();}
    catch(e){flash(kind,'Speichern nicht möglich: '+e.message,true);}finally{busy=false;}
  }
  function editMeasurement(kind,data){const form=$('v29-form-'+kind);['date','time','value','source','note'].forEach(k=>form.elements[k].value=data[k]??'');if(kind==='bp')form.elements.diastolic.value=data.diastolic;form.elements.editId.value=data.id;form.querySelector('button[type=submit]').textContent='Änderung speichern';form.querySelector('button[type=reset]').hidden=false;form.scrollIntoView({block:'center',behavior:'smooth'});}
  async function deleteMeasurement(kind,data){if(!confirm('Messung vom '+fmtDate(data.date)+' um '+data.time+' löschen?'))return;try{await SEC.del('suite','vital29/'+data.id);if($('v29-form-'+kind).elements.editId.value===data.id)$('v29-form-'+kind).reset();await refresh();flash(kind,'Messung gelöscht.');}catch(e){flash(kind,'Löschen fehlgeschlagen: '+e.message,true);}}
  function inRange(date,days){const start=new Date();start.setHours(12,0,0,0);if(days===3652){start.setFullYear(start.getFullYear()-10);start.setDate(start.getDate()+1);}else if(days===365){start.setFullYear(start.getFullYear()-1);start.setDate(start.getDate()+1);}else start.setDate(start.getDate()-(days-1));return date>=dateISO(start);}
  const chronological=kind=>all.filter(x=>x.kind===kind).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  const bpStatus=(row)=>window.ASTHMA_BPA344?.classify(row.value,row.diastolic);
  const bpLegend=()=>{const wrap=make('div','bp344-legend');for(const [key,v] of Object.entries(window.ASTHMA_BPA344?.codes||{})){const span=make('span','',v.label);span.style.color=v.color;wrap.append(span)}return wrap;};
  function renderList(kind){const box=$('v29-history-'+kind);box.replaceChildren();const entries=chronological(kind).reverse();if(!entries.length){box.append(make('p','suite-msg','Noch keine Messung gespeichert.'));return;}
    for(const row of entries.slice(0,100)){const item=make('article','v29-record'),text=make('div'),heading=kind==='bp'?row.value+'/'+row.diastolic+' mmHg':row.value+' '+TYPES[kind].unit;
      text.append(make('strong','',fmtDate(row.date)+' · '+row.time+' · '+heading),make('small','',row.source+(row.note?' · '+row.note:'')));
      if(kind==='bp'){const st=bpStatus(row);if(st){item.classList.add('bp344-record');item.style.setProperty('--bp-tone',st.color);text.append(make('span','bp344-status',st.label));text.querySelector('.bp344-status').style.setProperty('--bp-tone',st.color);}}
      const buttons=make('div','v29-actions'),edit=make('button','btn btn-outline','Bearbeiten'),del=make('button','btn btn-text','Löschen');edit.type=del.type='button';edit.addEventListener('click',()=>editMeasurement(kind,row));del.addEventListener('click',()=>deleteMeasurement(kind,row));buttons.append(edit,del);item.append(text,buttons);box.append(item);
    }
    if(entries.length>100)box.append(make('p','input-note','Neueste 100 Einträge angezeigt. Die übrigen Messungen bleiben verschlüsselt gespeichert.'));
  }
  function draw(kind){const cfg=TYPES[kind],host=$('v29-plot-'+kind);host.replaceChildren();const series=chronological(kind).filter(x=>inRange(x.date,Number($('v29-period-'+kind).value)));
    if(!series.length){host.append(make('p','suite-msg','Noch keine Messungen im gewählten Zeitraum.'));$('v29-explanation-'+kind).textContent='';return;}
    const points=series.length<=450?series:series.filter((_,i)=>i===0||i===series.length-1||i%Math.ceil(series.length/450)===0);
    const reference=kind==='bp'?[clinicalRef('bpSys'),clinicalRef('bpDia')]:[clinicalRef(kind)];
    const available=points.flatMap(r=>cfg.series.map(([key])=>number(r[key]))).filter(x=>x!==null).concat(reference.filter(x=>x!==null));
    const extent=Math.max(...available)-Math.min(...available),padding=Math.max(2,extent*.15),lo=Math.max(0,Math.min(...available)-padding),hi=Math.max(...available)+padding;
    const W=760,H=268,L=58,R=22,T=25,B=47,ns='http://www.w3.org/2000/svg',y=v=>T+(hi-v)/(hi-lo)*(H-T-B);
    const tick=r=>new Date(r.date+'T'+r.time+':00').getTime(),first=tick(points[0]),last=tick(points[points.length-1]);const x=r=>first===last?L+(W-L-R)/2:L+(tick(r)-first)/(last-first)*(W-L-R);
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 760 268');svg.setAttribute('role','img');svg.setAttribute('aria-label',cfg.title+': '+series.length+' Messungen');host.append(svg);
    const add=(tag,props,text)=>{const n=document.createElementNS(ns,tag);for(const [key,val] of Object.entries(props))n.setAttribute(key,String(val));if(text!==undefined)n.textContent=text;svg.append(n);return n;};
    for(let i=0;i<=4;i++){const yy=T+i*(H-T-B)/4;add('line',{x1:L,x2:W-R,y1:yy,y2:yy,stroke:'#dae7ea'});add('text',{x:3,y:yy+4,fill:'#56717d','font-size':13},(hi-(hi-lo)*i/4).toFixed(cfg.decimals));}
    reference.forEach((r,i)=>{if(r===null)return;const yy=y(r);add('line',{x1:L,x2:W-R,y1:yy,y2:yy,stroke:cfg.series[i][2],'stroke-width':2,'stroke-dasharray':'7 6'});add('text',{x:W-R-2,y:Math.max(13,yy-5),fill:cfg.series[i][2],'font-size':13,'text-anchor':'end'},'Ziel '+r);});
    for(const [field,title,color] of cfg.series){const valid=points.filter(row=>number(row[field])!==null);if(valid.length>1)add('polyline',{points:valid.map(row=>x(row)+','+y(row[field])).join(' '),fill:'none',stroke:color,'stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'});
      valid.forEach(row=>{const c=add('circle',{cx:x(row),cy:y(row[field]),r:points.length>100?3:5,fill:kind==='bp'?window.ASTHMA_BPA344?.classifyPart(row[field],field==='value'?'systolic':'diastolic').color||color:color,stroke:'#fff','stroke-width':1});const tip=document.createElementNS(ns,'title');tip.textContent=fmtDate(row.date)+' '+row.time+' · '+title+': '+row[field]+' '+cfg.unit+' · '+row.source+(kind==='bp'?' · '+(window.ASTHMA_BPA344?.classifyPart(row[field],field==='value'?'systolic':'diastolic').label||''):'');c.append(tip);});}
    [0,Math.floor((points.length-1)/2),points.length-1].filter((v,i,a)=>a.indexOf(v)===i).forEach(i=>add('text',{x:x(points[i]),y:H-8,'text-anchor':i===0?'start':i===points.length-1?'end':'middle',fill:'#56717d','font-size':13},fmtDate(points[i].date)));
    if(kind==='bp'){host.append(bpLegend());const info=make('p','bp344-note','Die Farben zeigen nur grobe Orientierung für Erwachsene bei Ruhewerten, keine Diagnose oder individuellen Zielbereich. Zu Hause wird Hypertonie häufig ab einem Mittelwert von 135/85 mmHg beurteilt; Einzelmessungen können abweichen. Sehr hohe Werte erneut in Ruhe messen. Bei Beschwerden wie Brustschmerz, starker Luftnot, Lähmung oder Sprachstörung: 112.');host.append(info);}
    $('v29-explanation-'+kind).textContent=series.length+' Messungen · durchgezogene Linien: gemessene Werte; '+(reference.some(x=>x!==null)?'gestrichelte Linien: manuell hinterlegte persönliche Vergleichswerte.':'noch keine ärztlich abgestimmten Vergleichswerte hinterlegt.')+(points.length!==series.length?' Darstellung auf '+points.length+' Punkte reduziert, Daten unverändert.':'');
  }
  async function saveReferences(event){event.preventDefault();const updated={};
    for(const [key,title,min,max] of REF){const v=number($('v29-ref-'+key).value);if(v!==null){if(v<min||v>max){$('v29-ref-status').textContent='Ungültiger Wert für '+title;return;}updated[key]=v;}}
    try{await SEC.put('suite',{key:'vital29refs/values',type:'vital29refs',value:{id:'values',values:updated}},'vital29refs/values');limits=updated;Object.keys(TYPES).forEach(draw);window.dispatchEvent(new Event('asthma:vital29-refs'));$('v29-ref-status').textContent='Persönliche Referenzen verschlüsselt gespeichert.';}
    catch(e){$('v29-ref-status').textContent='Speichern fehlgeschlagen: '+e.message;}
  }
  const normal=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function renderMedicationCheck(){const box=$('v29-drug-results');if(!box)return;box.replaceChildren();if(!meds.length){box.append(make('p','suite-msg','Im aktuellen Medikamentenplan sind keine Präparate gespeichert.'));return;}
    const has=key=>meds.some(m=>normal(m.name).includes(key));const warnings=[];
    const warn=(name,detail)=>warnings.push([name,detail]);
    if(has('citalopram')&&has('azithromycin'))warn('Citalopram + Azithromycin','Mögliches erhöhtes Risiko für QT-Verlängerung und Herzrhythmusstörungen. Vor gemeinsamer Anwendung ärztlich prüfen lassen.');
    if(has('trimbow')&&has('berodual'))warn('Trimbow + Berodual','Überlappende bronchienerweiternde Wirkprinzipien können z. B. Herzrasen, Zittern und Veränderungen des Kaliumspiegels begünstigen. Behandlungsplan nicht eigenständig ändern.');
    if(has('citalopram')&&(has('trimbow')||has('berodual')))warn('Citalopram + Beta-2-Bronchienerweiterer','Abhängig von der Gesamtsituation und Risikofaktoren wie niedrigen Kaliumwerten kann eine EKG-/Elektrolytkontrolle erforderlich sein.');
    if(has('ramipril')&&(has('ibuprofen')||has('naproxen')||has('diclofenac')))warn('Ramipril + NSAR-Schmerzmittel','Nierenfunktion und Blutdruckwirkung können beeinflusst werden. Ärztlich oder pharmazeutisch prüfen.');
    if(has('citalopram')&&(has('ibuprofen')||has('naproxen')||has('diclofenac')))warn('Citalopram + NSAR-Schmerzmittel','Gemeinsame Einnahme kann das Blutungsrisiko erhöhen. Ärztlich oder pharmazeutisch prüfen.');
    warnings.forEach(([title,detail])=>{const item=make('div','v29-drug-risk');item.append(make('strong','',title),make('p','',detail));box.append(item);});
    if(!warnings.length)box.append(make('p','suite-msg','Keine der wenigen lokal hinterlegten Kombinationen erkannt. Dies ist ausdrücklich KEINE Entwarnung.'));
    const known=['citalopram','azithromycin','trimbow','berodual','ramipril','nucala','mepolizumab','doxycyclin','ibuprofen','naproxen','diclofenac'];const unchecked=meds.filter(m=>!known.some(k=>normal(m.name).includes(k)));
    if(unchecked.length)box.append(make('p','v29-unchecked','NICHT verlässlich überprüfbar: '+unchecked.map(m=>m.name).join(', ')+'. Bitte Wirkstoffe und vollständigen Plan in Arztpraxis oder Apotheke kontrollieren lassen.'));
    box.append(make('p','input-note','Automatisch nach jeder Speicherung neu berechnet. Diese lokale Liste umfasst nur ausgewählte Wechselwirkungen, keine vollständige oder laufend aktualisierte Arzneimitteldatenbank. Auch bei bekannten Mitteln können weitere Neben- oder Wechselwirkungen bestehen.'));
  }
  const medsBox=document.querySelector('[data-therapy-tab="meds"]');if(medsBox){const panel=make('section','v29-med-review');panel.append(make('h3','', 'Automatische Prüfung auf kombinierte Risiken'));const desc=make('p','input-note','Bei jedem neuen, geänderten oder gelöschten Medikament erfolgt eine erneute Prüfung der lokal hinterlegten Risiken.');panel.append(desc);const result=make('div');result.id='v29-drug-results';panel.append(result);medsBox.append(panel);}
  async function refresh(){if(!SEC.state().unlocked)return;const id=++requestId,records=await SEC.list('suite');if(id!==requestId)return;
    all=records.filter(r=>r.type==='vital29').map(r=>r.value).filter(r=>r&&TYPES[r.kind]&&validDate(r.date)&&validTime(r.time)&&number(r.value)!==null);
    limits=records.find(r=>r.type==='vital29refs')?.value?.values||{};
    meds=records.filter(r=>r.type==='meds').map(r=>r.value).filter(r=>r?.name);
    if(!referencesInitialized){REF.forEach(([key])=>{$('v29-ref-'+key).value=clinicalRef(key)??'';});referencesInitialized=true;}
    Object.keys(TYPES).forEach(kind=>{draw(kind);renderList(kind);});renderMedicationCheck();
    window.dispatchEvent(new Event('asthma:vital29-ready'));
  }
  function delayed(){clearTimeout(updateTimer);updateTimer=setTimeout(()=>refresh().catch(e=>console.warn('Vitalwerte nicht lesbar:',e.message)),110);}
  window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite')delayed();});
  window.addEventListener('asthma:meds-change',delayed);
  window.addEventListener('asthma:profile-reset',delayed);
  refresh().catch(e=>Object.keys(TYPES).forEach(kind=>flash(kind,'Werte konnten nicht gelesen werden: '+e.message,true)));
})();
