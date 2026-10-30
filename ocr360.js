'use strict';
/* PneumoPro 3.6.0: lokale Texterkennung fuer Bilder und PDF-Dokumente.
 * Keine OCR-Daten ins Netz; nur vom Nutzer freigegebener Text wird verschluesselt
 * im bestehenden Dokumentobjekt gespeichert. Keine medizinische Messwertuebernahme.
 */
(()=>{
 const S=window.ASTHMA_SECURITY, NAV=window.ASTHMA_NAV, $=id=>document.getElementById(id);
 if(!S?.state?.().unlocked||!NAV||$('ocr360-panel'))return;
 const MAX_IMAGE=12*1024*1024,MAX_PDF=25*1024*1024,MAX_PAGES=5;
 const supported=d=>d?.blob instanceof Blob&&/\.(pdf|png|jpe?g|webp|heic|heif)$/i.test(d.name||'');
 const structure=window.PNEUMOPRO_OCRSTRUCT360;
 const host=$('ps352-dialog')?.querySelector('.ps352-body');
 if(!host){
  if(!window.__PNEUMOPRO_OCR360_RETRY){
   window.__PNEUMOPRO_OCR360_RETRY=true;let attempts=0;
   const timer=setInterval(()=>{
    if($('ps352-dialog')?.querySelector('.ps352-body')){
     clearInterval(timer);window.__PNEUMOPRO_OCR360_RETRY=false;
     const script=document.createElement('script');script.src='./ocr360.js?v=3.6.0';document.body.append(script);
    }else if(++attempts>=100){clearInterval(timer);window.__PNEUMOPRO_OCR360_RETRY=false;}
   },200);
  }
  return;
 }
 const style=document.createElement('style');style.id='ocr360-styles';style.textContent=`
 #ocr360-panel{margin:12px 0 15px;padding:14px;border:2px solid #b6d8e1;background:#f1f9fb;color:#173f51;border-radius:14px;min-width:0}
 #ocr360-panel h3{font-size:18px;margin:0 0 6px;color:#13536a}
 #ocr360-panel p{font-size:13px;line-height:1.48}
 #ocr360-panel .ocr360-row{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin:10px 0}
 #ocr360-panel select,#ocr360-panel textarea{width:100%;min-width:0;max-width:100%;font:inherit;font-size:16px;padding:10px;border:1px solid #9bbdc9;border-radius:9px;background:white;color:#173f51}
 #ocr360-panel textarea{min-height:140px;resize:vertical;line-height:1.45}
 #ocr360-panel button{font:inherit;font-weight:800;border-radius:9px;padding:10px 13px;min-height:45px;border:1px solid #0b6981;background:#08687e;color:white;cursor:pointer}
 #ocr360-panel button.ocr360-subtle{background:#fff;color:#155b70;border-color:#aacbd6}
 #ocr360-panel button:disabled{opacity:.5;cursor:not-allowed}
 #ocr360-panel #ocr360-message{padding:9px;border-left:4px solid #1a8193;background:#fff;white-space:pre-wrap;overflow-wrap:anywhere}
 #ocr360-panel #ocr360-check{display:flex;align-items:flex-start;gap:8px;font-size:13px}
 #ocr360-structure{background:#fff;border:1px solid #bfdbe4;border-radius:11px;padding:10px;overflow-x:auto;max-height:360px;overflow-y:auto}
 #ocr360-structure table{border-collapse:collapse;min-width:380px;font-size:12px;margin-bottom:13px}
 #ocr360-structure td{border:1px solid #cddfe4;padding:6px;white-space:normal;min-width:60px}
 #ocr360-structure h4{margin:8px 0;color:#12495f}
 #ocr360-panel label{font-size:13px;font-weight:750}
 @media print{#ocr360-panel{display:none!important}}
 `;document.head.append(style);
 const box=document.createElement('section');box.id='ocr360-panel';
 box.innerHTML=`<h3>Texterkennung – Fotos und PDF</h3>
 <p>1. Original oben unter <strong>Scans</strong> verschlüsselt speichern. 2. Gespeicherte Datei hier wählen und <strong>Text erkennen</strong> antippen. 3. Den erkannten Text kontrollieren und speichern. Danach ist er über <strong>Suchen</strong> auffindbar.</p>
 <label for="ocr360-select">Gespeicherte Datei</label><select id="ocr360-select"><option value="">Bitte Datei auswählen</option></select>
 <label for="ocr360-start">Bei mehrseitigen PDFs: ab Seite (je Durchgang höchstens 5 Seiten)</label><input type="number" id="ocr360-start" min="1" max="999" value="1" style="width:110px;max-width:100%;font:inherit;font-size:16px;border:1px solid #9bbdc9;border-radius:9px;padding:9px;color:#173f51"/>
 <div class="ocr360-row"><button type="button" class="ocr360-subtle" id="ocr360-refresh">Liste aktualisieren</button><button type="button" id="ocr360-run">Text erkennen</button></div>
 <label id="ocr360-auto-label" style="display:flex;align-items:flex-start;gap:8px"><input id="ocr360-auto" type="checkbox" checked style="width:auto;margin-top:5px"/> Nach dem Speichern eines Fotos oder PDFs die Texterkennung automatisch für die neueste Datei starten</label>
 <p id="ocr360-message" role="status" aria-live="polite">Bereit. Deutsche und englische Texterkennung – lokal auf dem Gerät.</p>
 <h4>Erkannte Tabellen, Spalten und Diagramme</h4>
 <div id="ocr360-structure" aria-live="polite">Nach der Texterkennung werden hier erkannte Spalten und Diagrammbeschriftungen angezeigt.</div>
 <label for="ocr360-text">Erkannter Text (vor dem Speichern prüfen und bei Bedarf korrigieren)</label>
 <textarea id="ocr360-text" maxlength="40000" placeholder="Hier erscheint erkannter Text. Bei medizinischen Zahlen bitte jede Zahl und Einheit am Original prüfen."></textarea>
 <p id="ocr360-check"><input type="checkbox" id="ocr360-verified"/> <span>Ich habe den Text mit dem Original verglichen. Es werden daraus keine Messwerte oder Diagnosen automatisch übernommen.</span></p>
 <div class="ocr360-row"><button id="ocr360-save" type="button" disabled>Geprüften Text verschlüsselt speichern</button><button id="ocr360-export" class="ocr360-subtle" type="button">Tabellen/Diagramme als JSON exportieren</button><button id="ocr360-open-search" class="ocr360-subtle" type="button">In der Akte suchen</button></div>
 <p>PDF: jeweils bis zu ${MAX_PAGES} Seiten pro Durchgang; danach eine neue Startseite wählen. Bereits erkannter Text wird beim weiteren Durchgang angehängt. Bereits vorhandener PDF-Text wird ohne Bilderkennung ausgelesen. Eingescannte Seiten werden lokal mit OCR verarbeitet. Fehlerhafte, handschriftliche oder unscharfe Vorlagen können falsch erkannt werden.</p>`;
 const intro=host.querySelector('.ps352-intro');if(intro)intro.insertAdjacentElement('afterend',box);else host.prepend(box);
 const choose=$('ocr360-select'),output=$('ocr360-text'),msg=$('ocr360-message'),save=$('ocr360-save'),verified=$('ocr360-verified');
 let selected=null,busy=false,currentText='',worker=null,structured=null;
 const say=(t,bad=false)=>{msg.textContent=t;msg.style.borderLeftColor=bad?'#c1353a':'#1a8193';};
 const filename=s=>String(s||'Befund').slice(0,100);
 const isPdf=d=>/\.pdf$/i.test(d.name||'')||d.mime==='application/pdf';
 const cleanText=t=>String(t||'').replace(/\r/g,'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,' ').slice(0,40000);
 function showStructure(data){
  const host=$('ocr360-structure');if(!host)return;host.replaceChildren();
  const node=(tag,content)=>{const x=document.createElement(tag);if(content!==undefined)x.textContent=String(content);return x;};
  if(!data?.tables?.length&&!data?.charts?.length){host.append(node('p','Noch keine verlässlich zusammenhängenden Tabellen oder Diagrammbeschriftungen erkannt. Der Volltext ist trotzdem prüfbar.'));return;}
  for(const table of data.tables||[]){host.append(node('h4','Tabelle auf Seite '+table.page+' – Vorschau'));const t=node('table');for(const cells of table.rows||[]){const tr=node('tr');for(const cell of cells.slice(0,15))tr.append(node('td',cell));t.append(tr);}host.append(t);}
  for(const chart of data.charts||[]){host.append(node('h4','Diagrammhinweise – Seite '+chart.page));
   if(chart.headings?.length)host.append(node('p','Titel / Legende: '+chart.headings.join(' · ')));
   if(chart.axisOrLegend?.length)host.append(node('p','Achsen / Beschriftung: '+chart.axisOrLegend.join(' · ')));
   if(chart.ticks?.length)host.append(node('p','Gelesene Skalenwerte: '+chart.ticks.join(' · ')));
   host.append(node('p','Keine automatische Rekonstruktion der Kurve oder medizinische Zuordnung.'));}
  host.append(node('p',data.note||'Jede Spalte und Zahl am Original vergleichen.'));
 }
 async function refresh(wanted){
  if(!S.state().unlocked)return;
  const docs=(await S.list('documents')).filter(supported).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  const previous=wanted||choose.value;choose.replaceChildren(new Option('Bitte Dokument auswählen',''));
  for(const d of docs)choose.append(new Option(filename(d.name)+' · '+(d.documentDate||'ohne Datum')+(d.ocrText?' · Text gespeichert':''),d.id));
  if(docs.some(x=>x.id===previous))choose.value=previous;
  else if(docs.length)choose.value=docs[0].id;
  return docs;
 }
 async function loadSaved(){
  const id=choose.value;currentText='';structured=null;showStructure(null);verified.checked=false;save.disabled=true;selected=null;output.value='';
  if(!id)return;
  const d=await S.get('documents',id);if(!supported(d))return say('Datei nicht gefunden oder kein unterstütztes Format.',true);
  selected=d;output.value=String(d.ocrText||'').slice(0,40000);structured=d.ocrStructured||null;showStructure(structured);
  if(d.ocrText)say('Dieser Befund hat bereits gespeicherten Suchtext. Du kannst ihn erneut erkennen oder korrigieren.');
  else say('Datei bereit: '+filename(d.name));
 }
 async function lib(){
  if(!window.Tesseract){
   await new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.src='./ocr-vendor/tesseract.min.js';s.async=true;
    s.onload=resolve;s.onerror=()=>reject(Error('OCR-Bibliothek fehlt. Bitte App-Version und Offline-Dateien prüfen.'));
    document.head.append(s);
   });
  }
  if(!window.Tesseract?.createWorker)throw Error('Texterkennung konnte nicht initialisiert werden.');
  if(!worker){
   const base=new URL('./ocr-vendor/',location.href).href;
   worker=await window.Tesseract.createWorker(['deu','eng'],1,{
    workerPath:base+'worker.min.js',corePath:base+'core',langPath:base+'lang',workerBlobURL:false,
    logger:m=>{if(busy&&m?.status)say('Texterkennung: '+m.status+(Number.isFinite(m.progress)?' · '+Math.round(m.progress*100)+' %':''));}
   });
  }
  return worker;
 }
 async function imageCanvas(blob){
  const url=URL.createObjectURL(blob);
  try{
   const img=new Image();img.decoding='async';img.src=url;
   await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Bildformat konnte nicht gelesen werden. Bitte als JPEG oder PNG speichern.'));});
   const w=img.naturalWidth,h=img.naturalHeight;if(!w||!h)throw Error('Bild besitzt keine lesbare Auflösung.');
   const scale=Math.min(1,2300/Math.max(w,h),Math.sqrt(3800000/(w*h)));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(w*scale));canvas.height=Math.max(1,Math.round(h*scale));
   const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Bildverarbeitung nicht verfügbar.');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
   return canvas;
  }finally{URL.revokeObjectURL(url);}
 }
 async function recognizeImage(blob){const canvas=await imageCanvas(blob);const w=await lib();try{const res=await w.recognize(canvas,{}, {tsv:true});return {text:cleanText(res.data?.text),rows:structure?.tsvRows(res.data?.tsv||'',1)||[]};}finally{canvas.width=canvas.height=1}}
 async function recognizePdf(blob,startPage=1){
  let pdfjs;try{pdfjs=await import('./ocr-vendor/pdf.min.mjs');}
  catch(e){throw Error('PDF-Erkennung nicht verfügbar: '+(e?.message||e));}
  pdfjs.GlobalWorkerOptions.workerSrc=new URL('./ocr-vendor/pdf.worker.min.mjs',location.href).href;
  const task=pdfjs.getDocument({data:new Uint8Array(await blob.arrayBuffer()),useSystemFonts:true});
  const pdf=await task.promise,parts=[],allRows=[];try{
   const end=Math.min(pdf.numPages,startPage+MAX_PAGES-1);const count=end-startPage+1;
   if(startPage>pdf.numPages)throw Error('Das PDF hat nur '+pdf.numPages+' Seite(n). Startseite bitte anpassen.');
   say('PDF: '+pdf.numPages+' Seiten. Bearbeite '+startPage+' bis '+end+'.');
   for(let i=startPage;i<=end;i++){
    say('PDF-Seite '+i+' von '+pdf.numPages+' wird gelesen.');const page=await pdf.getPage(i);
    const content=await page.getTextContent();const raw=cleanText((content.items||[]).map(x=>x.str||'').join(' '));
    if(raw.replace(/\s/g,'').length>=35){parts.push('[Seite '+i+' – PDF-Text]\n'+raw);allRows.push(...(structure?.pdfRows(content.items,i,page.view[3]-page.view[1])||[]));page.cleanup();continue;}
    const view=page.getViewport({scale:1});const scale=Math.min(1.7,1800/view.width,2200/view.height,Math.sqrt(3500000/(view.width*view.height)));
    const vp=page.getViewport({scale:Math.max(0.7,scale)});const canvas=document.createElement('canvas');canvas.width=Math.round(vp.width);canvas.height=Math.round(vp.height);
    const context=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
    if(!context)throw Error('PDF-Seite kann nicht dargestellt werden.');
    await page.render({canvasContext:context,viewport:vp}).promise;
    const w=await lib();const o=await w.recognize(canvas,{}, {tsv:true});parts.push('[Seite '+i+' – OCR]\n'+cleanText(o.data?.text));allRows.push(...(structure?.tsvRows(o.data?.tsv||'',i)||[]));
    canvas.width=canvas.height=1;page.cleanup();
   }
   if(pdf.numPages>end)parts.push('HINWEIS: Seite '+(end+1)+' bis '+pdf.numPages+' noch nicht verarbeitet. Neue Startseite wählen.');
  }finally{await task.destroy().catch(()=>{});}
  return {text:cleanText(parts.join('\n\n')),rows:allRows};
 }
 async function run(){
  if(busy)return;const id=choose.value;if(!id)return say('Bitte zuerst einen gespeicherten Befund wählen.',true);
  busy=true;const btn=$('ocr360-run');btn.disabled=true;save.disabled=true;verified.checked=false;
  try{
   if(!S.state().unlocked)throw Error('Die Gesundheitsakte ist gesperrt.');
   const d=await S.get('documents',id);if(!supported(d))throw Error('Die Datei ist nicht mehr vorhanden.');
   if(d.blob.size>(isPdf(d)?MAX_PDF:MAX_IMAGE))throw Error('Datei zu groß für das iPhone (Foto max. 12 MB, PDF max. 25 MB).');
   say('Texterkennung gestartet – Verarbeitung erfolgt lokal auf deinem iPhone.');
   const start=Number($('ocr360-start').value);if(!Number.isInteger(start)||start<1||start>999)throw Error('PDF-Startseite muss zwischen 1 und 999 liegen.');
   const extracted=isPdf(d)?await recognizePdf(d.blob,start):await recognizeImage(d.blob);
   if(choose.value!==id)throw Error('Dokument wurde während der Erkennung gewechselt.');
   currentText=extracted.text;output.value=extracted.text;structured=structure?.analyze(extracted.rows)||null;showStructure(structured);
   say(extracted.text.trim()?'Text erkannt. Bitte den Text prüfen und das Häkchen setzen, bevor du speicherst.':'Kein lesbarer Text erkannt. Schärferes Foto oder besser belichteten Scan verwenden.',!extracted.text.trim());
  }catch(e){say('Texterkennung fehlgeschlagen: '+(e.message||e),true);}
  finally{busy=false;btn.disabled=false;save.disabled=!(verified.checked&&output.value.trim());}
 }
 choose.addEventListener('change',()=>{if(!busy)loadSaved().catch(e=>say(e.message,true))});
 $('ocr360-refresh').addEventListener('click',()=>refresh().then(loadSaved).catch(e=>say(e.message,true)));
 $('ocr360-run').addEventListener('click',run);
 const updateSave=()=>{save.disabled=busy||!verified.checked||!output.value.trim()||!selected;};
 output.addEventListener('input',updateSave);verified.addEventListener('change',updateSave);
 save.addEventListener('click',async()=>{
  if(save.disabled||busy||!selected||!verified.checked)return;
  const id=selected.id,text=cleanText(output.value).trim();if(!text)return say('Es wurde kein Text eingegeben.',true);
  if(!confirm('Geprüften Text zu diesem Dokument verschlüsselt speichern und für die Akten-Suche verfügbar machen?'))return;
  save.disabled=true;try{
   const doc=await S.get('documents',id);if(!doc?.blob)throw Error('Dokument wurde nicht gefunden.');
   const result={...doc,ocrText:text,ocrStructured:structured,ocrVerified:true,ocrUpdatedAt:new Date().toISOString(),ocrSource:'local-device'};
   await S.put('documents',result,id);
   const stored=await S.get('documents',id);if(stored?.ocrText!==text)throw Error('Speicherprüfung ist fehlgeschlagen.');
   selected=stored;say('Geprüfter Dokumenttext verschlüsselt gespeichert. Jetzt über Suchen auffindbar.');
   await refresh(id);
  }catch(e){say('Speichern fehlgeschlagen: '+(e.message||e),true)}finally{updateSave();}
 });
 $('ocr360-export').addEventListener('click',()=>{
  if(!selected||!structured){say('Zuerst einen Befund erkennen und die Tabellenvorschau prüfen.',true);return;}
  if(!verified.checked){say('Bitte vor dem Export Original, Text, Tabellen und Diagrammbeschriftungen prüfen und die Bestätigung setzen.',true);return;}
  if(!confirm('Die JSON-Datei enthält unverschlüsselte medizinische Texte und Tabellen. Nur privat auf dem iPhone speichern, nicht im öffentlichen GitHub-Repository. Fortfahren?'))return;
  const payload={format:'PneumoPro-OCR-Struktur-v1',sourceFile:selected.name||'',reviewedByUser:true,exportedAt:new Date().toISOString(),text:cleanText(output.value),tables:structured.tables||[],charts:structured.charts||[],notice:'Nur Dokumentstruktur, KEIN Messwertimport; Zahlen/Spalten muessen bei medizinischer Nutzung erneut geprueft werden.'};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='PneumoPro_OCR_Tabellen_'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  say('Strukturierte JSON-Datei exportiert. Die Datei kann hier im Chat zur weiteren Prüfung hochgeladen werden.');
 });
 $('ocr360-open-search').addEventListener('click',()=>{ $('ps352-close')?.click();$('nav317-search-action')?.click(); });
 window.addEventListener('pneumopro:scan-saved',async()=>{
  try{
   if(busy)return;
   const docs=await refresh();
   if(!docs?.length)return;
   choose.value=docs[0].id;
   await loadSaved();
   if($('ocr360-auto')?.checked&&docs[0].source==='scans352')await run();
  }catch(e){say('Datei gespeichert. OCR konnte nicht gestartet werden: '+(e.message||e),true)}
 });
 window.addEventListener('asthma:secure-change',e=>{if(!S.state().unlocked){output.value='';selected=null;save.disabled=true;return;}if(e.detail?.group==='documents'&&!busy)refresh(choose.value).catch(()=>{});});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&worker&&!busy){worker.terminate().catch(()=>{});worker=null;}});
 refresh().then(loadSaved).catch(e=>say(e.message,true));
 window.PNEUMOPRO_OCR360=Object.freeze({version:'3.6.0',offline:true,maxPdfPages:MAX_PAGES,source:'Tesseract.js 7 + PDF.js 5'});
})();
