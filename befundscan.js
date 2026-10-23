'use strict';
/* Asthma 3.0.2: iPhone Lungenfunktionsscanner mit dateibasiertem Offline-Import.
   Keine Cloud, keine eingebetteten Patientendaten. Schreibt nur in entsperrten Tresor. */
(()=>{
 const $=id=>document.getElementById(id), SEC=window.ASTHMA_SECURITY,
  bridge=window.ASTHMA_PROFILE_BRIDGE, parser=window.ASTHMA_REPORT18;
 if(!$('scan-panel')||!SEC||!bridge||!parser)return;
 const IDS={fev1:'scan-fev1-percent',fvc:'scan-fvc-percent',fev1Liters:'scan-fev1-liters',fvcLiters:'scan-fvc-liters',ratio:'scan-ratio'};
 let parsed=null,file=null,objectURL=null,busy=false,sourceType='scanner';
 const e=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
 const fmt=x=>x===null||x===undefined?'':String(x).replace('.',',');
 const status=(text,bad=false)=>{const el=$('scan-progress');el.textContent=text;el.classList.toggle('scan-error',bad)};
 const num=(value,max=400)=>{const v=String(value??'').trim().replace(',','.');if(v==='')return null;if(!/^\d+(?:\.\d+)?$/.test(v))throw Error('Bitte nur Zahlen eintragen.');const n=Number(v);if(!Number.isFinite(n)||n>max)throw Error('Wert über zulässigem Bereich: '+v);return n;};
 const validDate=x=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(x||''))return false;const d=new Date(x+'T12:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===x};
 const uuid=()=>crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
 function clearFile(){if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;file=null;const p=$('scan-preview');if(p)p.removeAttribute('src');$('scan-picked').hidden=true;$('scan-gallery').value='';$('scan-camera').value='';}
 function reset(){parsed=null;sourceType='scanner';$('scan-review').hidden=true;$('scan-raw').value='';$('scan-date').value='';$('scan-review-warnings').textContent='';$('scan-extended-rows').replaceChildren();for(const id of Object.values(IDS))$(id).value='';}
 function pick(f){if(!f||busy)return;
  if(!f.type.startsWith('image/')&&!/\.(jpg|jpeg|png|webp|heic|heif)$/i.test(f.name)){status('Bitte ein Foto auswählen.',true);return}
  if(f.size>18*1024*1024){status('Bild über 18 MB.',true);return}
  reset();clearFile();file=f;objectURL=URL.createObjectURL(f);$('scan-preview').src=objectURL;
  $('scan-filename').textContent=f.name+' · '+(f.size/1048576).toFixed(1)+' MB';$('scan-picked').hidden=false;
  status('Bild ausgewählt. Bitte iPhone-Texterkennung verwenden oder den kopierten Befundtext auswerten.');
 }
 function drawTable(data){const out=$('scan-extended-rows');out.replaceChildren();
  for(const r of data.rows){
   const card=e('article','scan-metric-row');card.dataset.metric=r.key;card.dataset.phase=r.phase||'unbekannt';
   const head=e('div','scan-metric-head'), lab=e('label','scan-checkline');const check=e('input');
   check.type='checkbox';check.className='scan-row-enabled';check.checked=r.confidence==='hoch'||r.key==='ratio';check.setAttribute('aria-label',r.label+' übernehmen');
   lab.append(check,e('strong','',r.label));head.append(lab,e('span','scan-confidence '+(r.confidence==='hoch'?'scan-high':'scan-uncertain'),r.confidence==='hoch'?'Werte plausibel':'Bitte Original kontrollieren'));
   card.append(head);const grid=e('div','scan-metric-grid');
   for(const [part,title,value] of [['predicted','Soll',r.predicted],['measured','Ist ('+r.unit+')',r.measured],['pct','% vom Soll',r.pct]]){
    const label=e('label','',title),input=e('input');input.type='text';input.inputMode='decimal';input.className='scan-table-input';input.dataset.part=part;input.value=fmt(value);input.placeholder='–';label.append(input);grid.append(label);
   }
   card.append(grid,e('small','scan-original-line','Original: '+String(r.line||'').slice(0,160)));out.append(card);
  }
 }
 function showResult(data,type='scanner'){
  parsed=data;sourceType=type;
  $('scan-review').hidden=false;
  const phases=[...new Set(data.rows.map(x=>x.phase))];if(phases.length===1&&['vor','nach'].includes(phases[0]))$('scan-phase').value=phases[0];else $('scan-phase').value='unbekannt';
  drawTable(data);const values=parser.profileValues(data,$('scan-phase').value);
  for(const [field,id] of Object.entries(IDS))$(id).value=fmt(values[field]);
  $('scan-date').value=validDate(values.date)?values.date:'';
  $('scan-review-warnings').textContent=(data.warnings||[]).join(' ')||'Werte mit dem Original vergleichen.';
  status(data.rows.length+' Tabellenwerte erkannt. Jetzt unten die Kontrollfelder prüfen und „Geprüfte Werte übernehmen“ drücken.',!data.rows.length);
  if(data.rows.length)$('scan-review').scrollIntoView({block:'start',behavior:'smooth'});
 }
 const showText=text=>showResult(parser.parse(text),'scanner');
 async function paste(){try{const s=await navigator.clipboard.readText();if(!s.trim())throw Error('Zwischenablage leer');$('scan-raw').value=s;showText(s)}
 catch(err){status('Text bitte direkt ins Feld einsetzen und „Text auswerten“ drücken. '+err.message,true);$('scan-raw').focus();}}
 async function pictureText(){if(!file)throw Error('Bitte erst Foto auswählen.');
  if(!('TextDetector' in window))throw Error('iPhone-Safari bietet hier keine direkte Foto-Texterkennung: Foto öffnen, Live Text kopieren, im Feld einfügen und auswerten.');
  const bmp=await createImageBitmap(file);try{const canvas=document.createElement('canvas');const scale=Math.min(2,3000/Math.max(bmp.width,bmp.height));canvas.width=Math.round(bmp.width*scale);canvas.height=Math.round(bmp.height*scale);canvas.getContext('2d').drawImage(bmp,0,0,canvas.width,canvas.height);
   return (await new TextDetector().detect(canvas)).sort((a,b)=>(a.boundingBox?.y||0)-(b.boundingBox?.y||0)).map(x=>x.rawValue).join('\n')}
  finally{bmp.close()}
 }
 async function scan(){if(busy)return;busy=true;$('scan-start').disabled=true;try{status('Lokale Texterkennung wird geprüft ...');const text=await pictureText();$('scan-raw').value=text;showText(text)}catch(err){$('scan-review').hidden=false;status(err.message,true)}finally{busy=false;$('scan-start').disabled=false}}
 function extended(){const out=[];
  for(const row of document.querySelectorAll('#scan-extended-rows .scan-metric-row')){
   if(!row.querySelector('.scan-row-enabled').checked)continue;
   const key=row.dataset.metric;
   const get=part=>num(row.querySelector('[data-part="'+part+'"]').value,part==='pct'?400:key.startsWith('ratio')?120:30);
   const r={key,phase:row.dataset.phase,predicted:get('predicted'),measured:get('measured'),pct:get('pct')};
   if(r.measured===null)throw Error('Fehlender Istwert: '+key);
   if(r.predicted>0&&r.pct!==null&&Math.abs(100*r.measured/r.predicted-r.pct)>5)throw Error('Soll/Ist/% bei '+key+' stimmen nicht überein. Bitte Original kontrollieren.');
   out.push(r);
  }return out;
 }
 async function apply(){if(busy)return;busy=true;$('scan-apply').disabled=true;
  try{
   const values={};for(const [k,id] of Object.entries(IDS))values[k]=num($(id).value,['fev1','fvc','ratio'].includes(k)?100:12);
   const date=$('scan-date').value;if(!validDate(date))throw Error('Bitte ein gültiges Untersuchungsdatum eintragen.');
   const metrics=extended();if(parsed){for(const r of parsed.rows){if(!metrics.some(m=>m.key===r.key&&m.phase===r.phase)){
    if(r.key==='fev1'){values.fev1=null;values.fev1Liters=null}if(r.key==='fvcEx'){values.fvc=null;values.fvcLiters=null}if(r.key==='ratio')values.ratio=null;
   }}}
   for(const m of metrics){if(m.key==='fev1'){values.fev1=m.pct;values.fev1Liters=m.measured}
    if(m.key==='fvcEx'){values.fvc=m.pct;values.fvcLiters=m.measured}if(m.key==='ratio')values.ratio=m.measured;
   }
   if([values.fev1,values.fvc,values.fev1Liters,values.fvcLiters].every(v=>v===null))throw Error('FEV₁ oder FVCex fehlt. Bitte Tabellenzeilen aktivieren und überprüfen.');
   if(values.fev1Liters!==null&&values.fvcLiters!==null&&values.fev1Liters>values.fvcLiters)throw Error('FEV₁ darf nicht größer als FVCex in Liter sein.');
   if(values.ratio!==null&&values.fev1Liters!==null&&values.fvcLiters>0&&Math.abs(100*values.fev1Liters/values.fvcLiters-values.ratio)>5)throw Error('FEV₁/FVC ist mit den Literwerten nicht konsistent. Messphase beachten.');
   if(!confirm('Hast du Datum, Messphase und Zahlen mit dem Originalbefund verglichen und möchtest sie verschlüsselt speichern?'))return;
   const phase=$('scan-phase').value;
   const previous=(await SEC.list('suite')).filter(x=>x.type==='measurements').map(x=>x.value).filter(Boolean);
   if(previous.some(x=>x.date===date&&x.phase===phase&&x.fev1===values.fev1&&x.fvc===values.fvc&&x.fev1Liters===values.fev1Liters&&x.fvcLiters===values.fvcLiters)){
    status('Diese Lungenfunktion ist bereits gespeichert. Es wurde keine doppelte Messung angelegt.');return;
   }
   const item={id:uuid(),date,phase,source:sourceType,fev1:values.fev1,fvc:values.fvc,fev1Liters:values.fev1Liters,fvcLiters:values.fvcLiters,ratio:values.ratio,
    metrics,qualityWarnings:parsed?.warnings||[],reviewed:true,createdAt:new Date().toISOString()};
   await SEC.put('suite',{key:'measurements/'+item.id,type:'measurements',value:item},'measurements/'+item.id);
   let warning='';try{const p=bridge.get();bridge.setLung({...p,
    fev1:values.fev1??p.fev1,fvc:values.fvc??p.fvc,fev1Liters:values.fev1Liters??p.fev1Liters,
    fvcLiters:values.fvcLiters??p.fvcLiters,lungDate:date});}
   catch(err){warning=' Profilanzeige konnte nicht aktualisiert werden: '+err.message}
   window.dispatchEvent(new CustomEvent('asthma:lung-imported',{detail:{saved:true}}));
   reset();clearFile();status('Erfolgreich: Lungenfunktionswerte vom '+date.slice(8)+'.'+date.slice(5,7)+'.'+date.slice(0,4)+' verschlüsselt gespeichert. Öffne „Lungenfunktion“ für den Verlauf.'+warning);
  }catch(err){$('scan-review-warnings').textContent=err.message;status('Speichern nicht möglich: '+err.message,true);$('scan-review').hidden=false;}
  finally{busy=false;$('scan-apply').disabled=false}
 }
 function jsonResult(o){
  if(!o||typeof o!=='object'||!validDate(o.date)||!Array.isArray(o.measurements)||o.measurements.length<1||o.measurements.length>100)throw Error('Datei enthält keinen gültigen Lungenfunktionstest.');
  const map={FEV1:'fev1','FEV₁':'fev1',FVCex:'fvcEx',FVCin:'fvcIn',VC:'vc',PEF:'pef',TLC:'tLC',RV:'rV',TGV:'tgv',MEF25:'mef25',MEF50:'mef50',MEF75:'mef75',Rawtot:'raw',sRawtot:'sRaw',FEV1_FVCex:'ratio',FEV1_FVCin:'ratioFVCin',FEV1_VC:'ratioVC',RV_TLC:'ratioRV',Rawin:'rawIn',Rawex:'rawEx'};
  const rows=[],warnings=[],known=new Set();
  for(const m of o.measurements){const marker=String(m.marker||'');const key=map[marker];if(!key){warnings.push('Nicht zugeordnet: '+marker.slice(0,40));continue}
   if(known.has(key)){warnings.push('Doppelt im Dokument: '+marker);continue}
   const measured=num(m.value,key.startsWith('ratio')?120:30),predicted=num(m.predicted,150),pct=num(m.percentPredicted,400);
   if(measured===null)continue;known.add(key);
   const defs=parser.defs[key],confidence=predicted>0&&pct!==null&&Math.abs(100*measured/predicted-pct)<=5?'hoch':'mittel';
   rows.push({key,label:defs?.label||marker,unit:defs?.unit||String(m.unit||'').slice(0,30),phase:['vor','nach'].includes(o.phase)?o.phase:'unbekannt',measured,predicted,pct,confidence,line:marker+' Soll '+(predicted??'–')+' Ist '+measured+' Prozent '+(pct??'–')});
  }
  if(!rows.some(x=>x.key==='fev1'||x.key==='fvcEx'))throw Error('Die Datei enthält keinen eindeutig zugeordneten FEV₁- oder FVCex-Wert.');
  if(!['vor','nach'].includes(o.phase))warnings.push('Messphase vor/nach Bronchodilatator nicht angegeben: Bitte Original kontrollieren.');
  return {date:o.date,rows,warnings};
 }
 function installJSON(){const actions=$('scan-panel').querySelector('.scan-actions');if(!actions)return;
  const block=e('div','scan-actions');const lab=e('label','btn btn-outline','Lungenfunktion (.json) direkt importieren');lab.classList.add('scan-file-button');
  const input=e('input');input.type='file';input.accept='.json,application/json';input.hidden=true;lab.append(input);block.append(lab);
  const guide=e('p','input-note','Für die vorbereitete Lungenfunktionsdatei. Nicht für Blutwerte-JSON. Die Werte werden erst nach Bestätigung gespeichert.');
  actions.insertAdjacentElement('afterend',block);block.insertAdjacentElement('afterend',guide);
  input.addEventListener('change',async()=>{try{const f=input.files?.[0];if(!f)return;if(f.size>1024*1024)throw Error('Datei größer als 1 MB.');const o=JSON.parse(await f.text()),result=jsonResult(o);
    reset();clearFile();showResult(result,'scanner-json');status(result.rows.length+' Lungenfunktionswerte aus der Datei erkannt. Bitte unten prüfen und speichern.');
   }catch(err){status('Lungenfunktion-Datei konnte nicht gelesen werden: '+err.message,true)}finally{input.value=''}});
 }
 $('scan-gallery').addEventListener('change',ev=>pick(ev.target.files?.[0]));$('scan-camera').addEventListener('change',ev=>pick(ev.target.files?.[0]));
 $('scan-start').textContent='Lokale Fotoerkennung versuchen';$('scan-start').addEventListener('click',scan);
 $('scan-paste')?.addEventListener('click',paste);$('scan-reparse').addEventListener('click',()=>showText($('scan-raw').value));
 $('scan-clear').addEventListener('click',()=>{reset();clearFile();status('Foto verworfen.')});
 $('scan-discard').addEventListener('click',()=>{reset();clearFile();status('Befund verworfen.')});
 $('scan-phase').addEventListener('change',()=>{if(!parsed)return;const v=parser.profileValues(parsed,$('scan-phase').value);for(const [field,id] of Object.entries(IDS))$(id).value=fmt(v[field]);status('Messphase gewählt – Werte anhand des Originalbefunds prüfen.');});
 $('scan-apply').addEventListener('click',apply);
 window.addEventListener('pagehide',clearFile);
 window.__asthmaScanner18Test=Object.freeze({parse:parser.parse,jsonResult});
 // Der Scanner darf die globale App-Version nicht verändern.
 installJSON();
})();
