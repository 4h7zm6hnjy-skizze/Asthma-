'use strict';
/* Scanner 1.8: keine Netzwerkanfragen und keine automatische Übernahme ohne Prüfung. */
(()=>{
 const $=id=>document.getElementById(id),SEC=window.ASTHMA_SECURITY,bridge=window.ASTHMA_PROFILE_BRIDGE,parser=window.ASTHMA_REPORT18;
 if(!$('scan-panel')||!SEC||!bridge||!parser)return;
 const ids={fev1:'scan-fev1-percent',fvc:'scan-fvc-percent',fev1Liters:'scan-fev1-liters',fvcLiters:'scan-fvc-liters',ratio:'scan-ratio'};
 let file=null,objectURL=null,parsed=null,busy=false;
 const format=n=>n===null||n===undefined?'':String(n).replace('.',',');
 const note=(text,err=false)=>{const el=$('scan-progress');el.textContent=text;el.classList.toggle('scan-error',err)};
 const el=(name,cl,text)=>{const n=document.createElement(name);if(cl)n.className=cl;if(text!==undefined)n.textContent=text;return n};
 const num=(s,max)=>{s=String(s??'').trim().replace(',','.');if(!s)return null;if(!/^\d+(?:\.\d+)?$/.test(s))throw Error('Bitte nur Zahlen mit Komma oder Punkt eintragen.');const n=Number(s);if(n<0||n>max||!Number.isFinite(n))throw Error('Zahl außerhalb des zulässigen Bereichs 0–'+max);return n};
 function reset(){parsed=null;$('scan-review').hidden=true;$('scan-raw').value='';$('scan-date').value='';$('scan-review-warnings').textContent='';for(const id of Object.values(ids))$(id).value='';$('scan-extended-rows')?.replaceChildren()}
 function clearFile(){if(objectURL)URL.revokeObjectURL(objectURL);objectURL=null;file=null;$('scan-preview').removeAttribute('src');$('scan-picked').hidden=true;$('scan-gallery').value='';$('scan-camera').value=''}
 function pick(f){if(busy||!f)return;if(!f.type.startsWith('image/')&& !/\.(jpg|jpeg|png|webp|heic|heif)$/i.test(f.name)){note('Bitte ein Bild wählen.',true);return}if(f.size>18*1024*1024){note('Bild zu groß (max. 18 MB).',true);return}reset();clearFile();file=f;objectURL=URL.createObjectURL(f);$('scan-preview').src=objectURL;$('scan-filename').textContent=f.name+' · '+(f.size/1024/1024).toFixed(1)+' MB';$('scan-picked').hidden=false;note('Foto ausgewählt. Lokale Texterkennung versuchen oder iPhone-Live-Text kopieren und unten einfügen.');}
 function table(parsed){const host=$('scan-extended-rows');host.replaceChildren();
  for(const item of parsed.rows){const row=el('article','scan-metric-row'),title=el('strong','',item.label),flag=el('span','scan-confidence '+(item.confidence==='hoch'?'scan-high':'scan-uncertain'),item.confidence==='hoch'?'Spalte plausibel':'Bitte besonders prüfen');
   const check=el('input');check.type='checkbox';check.className='scan-row-enabled';check.dataset.metric=item.key;check.checked=item.confidence==='hoch'||item.key==='ratio';check.setAttribute('aria-label',item.label+' übernehmen');
   const makeField=(label,val,field)=>{const lab=el('label','',label),inp=el('input');inp.type='text';inp.inputMode='decimal';inp.className='scan-table-input';inp.dataset.part=field;inp.value=format(val);inp.placeholder='–';lab.append(inp);return lab};
   const head=el('div','scan-metric-head');const left=el('label','scan-checkline');left.append(check,title);head.append(left,flag);row.append(head);
   const grid=el('div','scan-metric-grid');grid.append(makeField('Soll',item.predicted,'predicted'),makeField('Ist ('+item.unit+')',item.measured,'measured'),makeField('% vom Soll',item.pct,'pct'));row.append(grid,el('small','scan-original-line','Befundzeile: '+item.line));row.dataset.metric=item.key;row.dataset.phase=item.phase;host.append(row);
  }
 }
 function show(text){parsed=parser.parse(text);$('scan-review').hidden=false;const phases=[...new Set(parsed.rows.map(r=>r.phase))];if(phases.length===1&&['vor','nach'].includes(phases[0]))$('scan-phase').value=phases[0];table(parsed);const val=parser.profileValues(parsed,$('scan-phase').value);for(const [key,id] of Object.entries(ids))$(id).value=format(val[key]);$('scan-date').value=val.date||'';let warns=parsed.warnings.join(' ');if(parsed.rows.length)warns+=' Markierte Tabellenwerte werden nur nach deiner Bestätigung übernommen.';$('scan-review-warnings').textContent=warns||'Bitte Befund sorgfältig vergleichen.';note(parsed.rows.length?parsed.rows.length+' Messwertzeilen gefunden. Kontrolliere jede Zahl und die Messphase.':'Keine sichere automatische Zuordnung. Werte anhand des Fotos manuell erfassen.',!parsed.rows.length)}
 async function textFromImage(){if(!file)throw Error('Bitte zuerst ein Foto auswählen.');if(!('TextDetector' in window))throw Error('Dieser Browser bietet keine lokale Foto-Texterkennung. Auf dem iPhone: Foto in „Fotos“ öffnen → Text markieren/kopieren (Live Text) → hier in „Befundtext“ einfügen. Deine Daten werden dabei nicht an einen App-Server geschickt.');const image=await createImageBitmap(file);try{const c=document.createElement('canvas');const scale=Math.min(2,3000/Math.max(image.width,image.height));c.width=Math.round(image.width*scale);c.height=Math.round(image.height*scale);c.getContext('2d').drawImage(image,0,0,c.width,c.height);const results=await new TextDetector().detect(c);return results.sort((a,b)=>(a.boundingBox?.y||0)-(b.boundingBox?.y||0)).map(x=>x.rawValue).join('\n')}finally{image.close()}}
 async function scan(){if(busy)return;busy=true;$('scan-start').disabled=true;try{note('Prüfe, ob eine lokale Texterkennung verfügbar ist …');const raw=await textFromImage();$('scan-raw').value=raw;show(raw)}catch(e){$('scan-review').hidden=false;note(e.message,true)}finally{busy=false;$('scan-start').disabled=false}}
 async function pasteClipboard(){try{const text=await navigator.clipboard.readText();if(!text.trim())throw Error('Zwischenablage enthält keinen Text');$('scan-raw').value=text;show(text)}catch(e){note('Kopierten Text im Textfeld über „Einfügen“ einsetzen und „Text auswerten“ antippen. '+e.message,true);$('scan-review').hidden=false;$('scan-raw').focus()}}
 function extended(){const list=[];for(const row of document.querySelectorAll('#scan-extended-rows .scan-metric-row')){
   if(!row.querySelector('.scan-row-enabled').checked)continue;
   const get=f=>num(row.querySelector('[data-part="'+f+'"]').value,f==='pct'?400:(row.dataset.metric.startsWith('ratio')?120:30));
   const o={key:row.dataset.metric,phase:row.dataset.phase,predicted:get('predicted'),measured:get('measured'),pct:get('pct')};
   if(o.measured===null)throw Error('Bei '+o.key+' fehlt der geprüfte Istwert.');
   if(o.predicted>0&&o.pct!==null&&Math.abs(100*o.measured/o.predicted-o.pct)>5)throw Error('Bei '+o.key+' widersprechen sich Soll, Ist und Prozentwerte. Bitte Zeile erneut prüfen.');
   list.push(o);
  }return list;
 }
 async function apply(){if(busy)return;busy=true;$('scan-apply').disabled=true;try{
  const vals={};for(const [k,id] of Object.entries(ids))vals[k]=num($(id).value,['fev1','fvc','ratio'].includes(k)?100:12);
  const d=$('scan-date').value;if(d&& !/^\d{4}-\d\d-\d\d$/.test(d))throw Error('Untersuchungsdatum fehlt oder ist ungültig.');
  let metrics=extended();if(parsed){for(const r of parsed.rows){if(!metrics.some(m=>m.key===r.key&&m.phase===r.phase)){if(r.key==='fev1'){vals.fev1=null;vals.fev1Liters=null}if(r.key==='fvcEx'){vals.fvc=null;vals.fvcLiters=null}if(r.key==='ratio')vals.ratio=null}}}for(const metric of metrics){if(metric.key==='fev1'){vals.fev1=metric.pct;vals.fev1Liters=metric.measured;}if(metric.key==='fvcEx'){vals.fvc=metric.pct;vals.fvcLiters=metric.measured;}if(metric.key==='ratio')vals.ratio=metric.measured;}
  if([vals.fev1,vals.fvc,vals.fev1Liters,vals.fvcLiters].every(x=>x===null))throw Error('Bitte mindestens FEV₁ oder FVC kontrolliert eingeben.');
  if(vals.fev1Liters!==null&&vals.fvcLiters!==null&&vals.fev1Liters>vals.fvcLiters)throw Error('FEV₁-Literwert darf nicht größer als FVC exspiratorisch sein.');
  if(vals.ratio!==null&&vals.fev1Liters!==null&&vals.fvcLiters>0&&Math.abs(100*vals.fev1Liters/vals.fvcLiters-vals.ratio)>5)throw Error('FEV₁/FVC weicht von den exspiratorischen Literwerten ab. Bitte Originalbefund prüfen.');
  if(!d){if(!confirm('Kein Testdatum eingetragen. Messung trotzdem mit heutigem Datum archivieren?'))return;}
  if(!confirm('Hast du die Messwerte, Messphase und Qualitätshinweise anhand des Originalbildes überprüft? Nur mit „OK“ werden sie verschlüsselt gespeichert.'))return;
  const date=d||new Date().toISOString().slice(0,10),phase=$('scan-phase').value;
  const old=bridge.get(), next={...old};if(vals.fev1!==null)next.fev1=vals.fev1;if(vals.fvc!==null)next.fvc=vals.fvc;
  if(vals.fev1Liters!==null)next.fev1Liters=vals.fev1Liters;if(vals.fvcLiters!==null)next.fvcLiters=vals.fvcLiters;next.lungDate=date;
  const prev=(await SEC.list('suite')).filter(x=>x.type==='measurements').map(x=>x.value);
  if(prev.some(x=>x.date===date&&x.phase===phase&&x.fev1===vals.fev1&&x.fvc===vals.fvc&&x.fev1Liters===vals.fev1Liters&&x.fvcLiters===vals.fvcLiters))throw Error('Diese Messung ist im Verlauf bereits vorhanden.');
  const measurement={id:(crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('')),date,phase,source:'scanner',fev1:vals.fev1,fvc:vals.fvc,fev1Liters:vals.fev1Liters,fvcLiters:vals.fvcLiters,ratio:vals.ratio,metrics,qualityWarnings:parsed?.warnings||[],reviewed:true,createdAt:new Date().toISOString()};
  await SEC.put('suite',{key:'measurements/'+measurement.id,type:'measurements',value:measurement},'measurements/'+measurement.id);
  bridge.setLung(next);window.dispatchEvent(new CustomEvent('asthma:lung-imported',{detail:{saved:true}}));
  note('Befunddatum, geprüfte Werte und gesamte Messwerttabelle verschlüsselt gespeichert. Der Befund erscheint im Verlauf und Kalender.');reset();clearFile();
 }catch(e){$('scan-review-warnings').textContent=e.message;note('Speicherung abgebrochen: '+e.message,true)}finally{busy=false;$('scan-apply').disabled=false}}
 $('scan-gallery').addEventListener('change',e=>pick(e.target.files?.[0]));$('scan-camera').addEventListener('change',e=>pick(e.target.files?.[0]));
 $('scan-start').textContent='Lokale Fotoerkennung versuchen';$('scan-start').addEventListener('click',scan);
 $('scan-paste')?.addEventListener('click',pasteClipboard);
 $('scan-reparse').addEventListener('click',()=>show($('scan-raw').value));
 $('scan-clear').addEventListener('click',()=>{reset();clearFile();note('Foto verworfen.')});$('scan-discard').addEventListener('click',()=>{reset();clearFile();note('Scan verworfen.')});
 $('scan-phase').addEventListener('change',()=>{if(parsed)show($('scan-raw').value)});
 $('scan-apply').addEventListener('click',apply);
 window.addEventListener('pagehide',()=>clearFile());
 window.__asthmaScanner18Test=Object.freeze({parse:parser.parse});
})();
