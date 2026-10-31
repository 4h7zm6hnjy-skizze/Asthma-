'use strict';
/* PneumoPro 3.6.5: Offline-Erkennung aus Bild/PDF; Nutzerfreigabe erforderlich.
 * Keine medizinische Rekonstruktion, keine automatischen Diagnosen oder Netz-Uploads.
 * Eingeschränkte OCR wird als Fehler ausgewiesen. */
(()=>{
 const S=window.ASTHMA_SECURITY,NAV=window.ASTHMA_NAV;
 const root=document.getElementById('lungenwerte');
 if(!S?.state?.().unlocked||!root||document.getElementById('li365'))return;
 const defs={
  measurements:[['sR_eff','sR eff','kPa·s'],['R_eff','R eff','kPa·s/l'],['TLC','TLC','l'],['FRCpleth','FRCpleth','l'],['RV','RV','l'],['RV_TLC','RV/TLC','%'],['VC_IN','VC IN','l'],['FVC','FVC','l'],['FEV1','FEV₁','l'],['FEV1_FVC','FEV₁/FVC','%'],['MMEF75_25','MMEF 75–25','l/s'],['FEF75','FEF 75','l/s'],['PEF','PEF','l/s'],['PIF','PIF','l/s']],
  diffusion:[['DLCO_SB','DLCO SB','mmol/(min·kPa)'],['KCO_SB','KCO SB','mmol/(min·kPa·l)'],['VA_SB','VA SB','l'],['Hb','Hb','g/dl'],['DLCOcSB','DLCOcSB','mmol/(min·kPa)'],['KCOc_SB','KCOc SB','mmol/(min·kPa·l)'],['TA','TA','s'],['VIN_SB','VIN SB','l'],['TLC_SB','TLC SB','l'],['FRC_SB','FRC SB','l'],['ERV_SB','ERV SB','l'],['RV_SB','RV SB','l'],['RV_TLC_SB','RV/TLC SB','%']]
 };
 const patterns=[
 [/^RV\s*\/\s*TLC\s*(?:SB|single\s*breath)\b/i,'RV_TLC_SB'],[/^(?:DLCOc\s*SB|DLCO\s*corrected)\b/i,'DLCOcSB'],[/^(?:KCOc\s*SB|KCO\s*corrected)\b/i,'KCOc_SB'],[/^DLCO\s*(?:_?SB)?\b/i,'DLCO_SB'],[/^KCO\s*(?:_?SB)?\b/i,'KCO_SB'],[/^VA\s*(?:_?SB)?\b/i,'VA_SB'],[/^TLC\s*SB\b/i,'TLC_SB'],[/^FRC\s*SB\b/i,'FRC_SB'],[/^ERV\s*SB\b/i,'ERV_SB'],[/^RV\s*SB\b/i,'RV_SB'],[/^VIN\s*SB\b/i,'VIN_SB'],[/^RV\s*\/\s*TLC\b/i,'RV_TLC'],[/^FEV\s*1\s*\/\s*FVC\b/i,'FEV1_FVC'],[/^(?:MMEF|MFEF)\s*75\s*[-–]\s*25\b/i,'MMEF75_25'],[/^FEF\s*75\b/i,'FEF75'],[/^sR\s*eff\b/i,'sR_eff'],[/^R\s*eff\b/i,'R_eff'],[/^FRC\s*pleth\b/i,'FRCpleth'],[/^VC\s*IN\b/i,'VC_IN'],[/^FEV\s*1\b/i,'FEV1'],[/^FVC\b/i,'FVC'],[/^TLC\b/i,'TLC'],[/^RV\b/i,'RV'],[/^PEF\b/i,'PEF'],[/^PIF\b/i,'PIF'],[/^Hb\b/i,'Hb'],[/^TA\b/i,'TA']];
 const codes=new Set([...defs.measurements,...defs.diffusion].map(x=>x[0]));
 const norm=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[₁]/g,'1').replace(/[_]/g,' ').trim();
 const number=s=>{s=String(s??'').trim().replace(',','.');return /^[-+]?\d{1,4}(?:\.\d{1,4})?$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;};
 function parse(raw){
  const lines=norm(raw).split(/\r?\n/).map(s=>s.trim()).filter(Boolean),rows=[],warnings=[];
  const header=lines.some(s=>/(?:soll|pred|ref)/i.test(s)&&/(?:ist|best|actual|meas|mess)/i.test(s)&&/(?:%|prozent|pct)/i.test(s));
  let dates=[];for(const l of lines){if(/geboren|geburtsdatum|birthday|born|birth/i.test(l))continue;for(const match of l.matchAll(/\b(20\d{2})[-/.](\d\d)[-/.](\d\d)\b|\b(\d{1,2})[./](\d{1,2})[./](20\d{2})\b/g)){
   const v=match[1]?`${match[1]}-${match[2]}-${match[3]}`:`${match[6]}-${match[5].padStart(2,'0')}-${match[4].padStart(2,'0')}`;
   if(Number.isFinite(Date.parse(v+'T12:00:00Z'))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v)dates.push(v);
  }}
  const distinct=[...new Set(dates)];const date=distinct.length===1?distinct[0]:'';
  if(distinct.length!==1)warnings.push('Untersuchungsdatum nicht eindeutig erkannt. Bitte am Original nachtragen.');
  if(!header)warnings.push('Tabellenspalten Soll/Ist/% nicht eindeutig: Messzahlen wurden vorsichtshalber nicht vorausgefüllt.');
  let bad=0;
  for(const l of lines){let cleaned=norm(l).replace(/^[-|·•\s]+/,'');let hit=null;
   for(const [regex,code] of patterns){const m=cleaned.match(regex);if(m){hit={code,tail:cleaned.slice(m[0].length).trim()};break;}}
   if(!hit||!codes.has(hit.code))continue;
   const tokens=[...hit.tail.matchAll(/(?:^|\s|\()([-+]?\d{1,3}(?:[.,]\d{1,4})?)(?=\s|%|\)|$)/g)].map(x=>number(x[1])).filter(x=>x!==null);
   // Strictly require exactly 3 or 4 columns; otherwise numbers might be LLN/Pre/Post, etc.
   if(!header||tokens.length<3||tokens.length>4){bad++;continue;}
   const [predicted,actual,percent,z]=tokens;
   if(predicted===null||predicted<=0||actual===null||actual<0||percent<0||percent>400||Math.abs(actual/predicted*100-percent)>3||(z!==undefined&&(z< -9||z>9))){bad++;continue;}
   if(rows.some(r=>r.code===hit.code)){bad++;warnings.push('Mehrere Zeilen für '+hit.code+': Messphase und Werte bitte manuell prüfen.');rows.splice(rows.findIndex(x=>x.code===hit.code),1);continue;}
   rows.push({code:hit.code,predicted,actual,percent,z:z??null,source:l});
  }
  if(bad)warnings.push(bad+' Zeile(n) nicht eindeutig erkannt oder rechnerisch nicht plausibel.');
  if(!rows.length)warnings.push('Keine Messwertzeile sicher auslesbar. Bitte über ChatGPT prüfen lassen oder die Werte manuell eintragen.');
  let kinds=new Set(rows.map(r=>defs.diffusion.some(x=>x[0]===r.code)?'diffusion':'measurements'));
  const kind=kinds.size===1?[...kinds][0]:'';
  if(kinds.size>1)warnings.push('Mehrere Testarten auf dem Befund: Bitte für jede Testart einen eigenen Eintrag erstellen.');
  return {rows,date,kind,warnings,sourceLines:lines.length};
 }
 if(typeof module==='object'&&module.exports){module.exports={parse,defs,number};return;}
 const el=(tag,cl,txt)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(txt!==undefined)x.textContent=String(txt);return x;};
 const section=el('section','li365');section.id='li365';
 section.innerHTML=`<h3>Neuen Lungenfunktionstest direkt einlesen</h3>
 <p>Foto oder PDF hochladen: PneumoPro liest den Text lokal auf dem iPhone. Alle Werte, Diagramme und die Zuordnung vor dem Speichern prüfen. Eine automatische 100-%-Erkennung gibt es nicht.</p>
 <label>Neuer Test (Foto/PDF)<input type="file" id="li365-file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif,.pdf,application/pdf" /></label>
 <label>Oder bereits gespeicherten Test auswählen<select id="li365-doc"><option value="">Gespeicherten Befund auswählen</option></select></label>
 <div class="li365-buttons"><button type="button" id="li365-analyze">Befund automatisch auslesen</button><button type="button" id="li365-reload">Liste aktualisieren</button></div>
 <p id="li365-status" role="status" aria-live="polite">Bereit. Das Original bleibt lokal verschlüsselt.</p>
 <div id="li365-warnings" role="alert" aria-live="assertive" hidden></div>
 <div id="li365-review" hidden><h4>Erkannte Messwerte prüfen</h4><p>Vorausgefüllte Zahlen sind OCR-Vorschläge, nicht bestätigt. Nicht eindeutig erkennbare Felder bleiben leer.</p>
 <div class="li365-fields"><label>Testart<select id="li365-type"><option value="">Bitte Testart wählen</option><option value="measurements">Spirometrie / Bodyplethysmographie</option><option value="diffusion">Diffusionsmessung</option></select></label>
 <label>Datum des Tests<input type="date" id="li365-date" /></label><label>Uhrzeit des Tests<input type="time" id="li365-time" /></label><label>Praxis/Klinik<input type="text" id="li365-clinic" maxlength="180" /></label>
 <label>Messphase<select id="li365-phase"><option value="unbekannt">Nicht angegeben</option><option value="vor">Vor Bronchodilatator</option><option value="nach">Nach Bronchodilatator</option></select></label></div>
 <div id="li365-table" class="li365-table"></div>
 <details><summary>Ausgelesener Originaltext zum Vergleich</summary><pre id="li365-text"></pre></details>
 <h4>Echte Diagramme zuordnen</h4><p>Bei unbekannten Befundlayouts bitte den Diagrammausschnitt im Originalfoto mit dem Finger markieren. Erkennungsvorschläge sind nur Vorschläge, keine bestätigten Diagramme. Es werden keine Kurven nachgezeichnet.</p>
 <div id="li365-suggestions"></div>
 <div class="li365-crops"><label>Diagrammtyp<select id="li365-chartkind"><option value="Fluss-Volumen">Fluss-Volumen</option><option value="Atemwegswiderstand">Atemwegswiderstand</option><option value="Volumen-Zeit">Volumen-Zeit</option><option value="Diffusion (CO/CH4)">Diffusion (CO/CH4)</option><option value="Anderes Originaldiagramm">Anderes Originaldiagramm</option></select></label>
 <div id="li365-canvasarea"><canvas id="li365-canvas" aria-label="Originalfoto: mit dem Finger den Diagrammausschnitt markieren"></canvas></div>
 <div class="li365-buttons"><button type="button" id="li365-crop">Markierten Ausschnitt als Diagramm hinzufügen</button><button type="button" id="li365-cropreset">Auswahl zurücksetzen</button></div><div id="li365-chartlist"></div></div>
 <label class="li365-check"><input id="li365-verified" type="checkbox"/> Ich habe Datum, Testart, Messphase, alle übernommenen Zahlen und Diagramme mit dem Original verglichen.</label>
 <button id="li365-save" type="button">Geprüften Test verschlüsselt speichern</button></div>
 <div id="li365-latest" aria-live="polite"></div>`;
 const anchor=document.getElementById('dl324');if(anchor)anchor.insertAdjacentElement('afterend',section);else root.append(section);
 const landing=document.querySelector('#lungenwerte .d26-lung-heading');const home=el('section','li365-home');home.id='li365-home';if(landing){const old=document.getElementById('raw363');if(old)landing.insertBefore(home,old);else landing.append(home);}
 const $=id=>document.getElementById(id), warn=$('li365-warnings'),status=$('li365-status');
 const setStatus=(msg,error=false)=>{status.textContent=msg;status.dataset.error=error?'yes':'no';};
 function warnings(messages){let a=[...new Set(messages.filter(Boolean))];warn.hidden=!a.length;warn.replaceChildren();if(a.length){warn.append(el('strong','','Automatische Übernahme nicht vollständig möglich.'));for(let v of a)warn.append(el('p','',v));warn.append(el('p','','Bei unleserlichen oder uneindeutigen Befunden kannst du das Original selbst in ChatGPT hochladen und die Daten dort auswerten lassen. Prüfe auch dann alle Ergebnisse am Original. Es wird nichts automatisch an ChatGPT übertragen.'));}}
 let currentDoc=null,parsed=null,image=null,canvasBase=null,selection=null,drag=null,crops=[],busy=false,activeRequest=0,worker=null,ocrHints=[],ocrRows366='',ocrPosition367='',ocrFullTSV371='',ocrFullScale371={x:1,y:1},ocrRegions372=[];
 const format=n=>n===null||n===undefined?'':String(n).replace('.',',');
 const validDate=s=>/^\d{4}-\d\d-\d\d$/.test(s)&&Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
 const eligible=d=>d?.blob instanceof Blob&&(/^(?:Lungenfunktionstest|Diffusionsmessung)$/i.test(d.kind||'')||['lufu','diff'].includes(d.scanArea))&&/\.(?:jpe?g|png|webp|heic|heif|pdf)$/i.test(d.name||'');
 const checkMime=file=>/\.(?:jpe?g|png|webp|heic|heif|pdf)$/i.test(file?.name||'')&&file.size>0&&file.size<=12*1048576;
 async function refreshDocs(selectId){let ds=(await S.list('documents')).filter(eligible).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));const select=$('li365-doc');select.replaceChildren(new Option('Gespeicherten Befund auswählen',''));for(let d of ds)select.append(new Option(String(d.name||'Befund').slice(0,100)+' · '+(d.documentDate||'Datum prüfen'),d.id));if(selectId&&ds.some(d=>d.id===selectId))select.value=selectId;return ds;}
 async function recognizeImage(blob){
  ocrRows366='';ocrPosition367='';ocrFullTSV371='';ocrFullScale371={x:1,y:1};ocrRegions372=[];
  const bitmap=await createImageBitmap(blob);
  try{
   const fac=Math.min(1.65,2900/Math.max(bitmap.width,bitmap.height),Math.sqrt(5200000/(bitmap.width*bitmap.height)));
   const c=document.createElement('canvas');c.width=Math.max(1,Math.round(bitmap.width*fac));c.height=Math.max(1,Math.round(bitmap.height*fac));
   const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Bildverarbeitung nicht verfügbar.');
   ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(bitmap,0,0,c.width,c.height);
   const w=await ocrWorker(),engine=window.PNEUMOPRO_PARSER366;
   const first=await w.recognize(c,{}, {tsv:true});
   ocrFullTSV371=String(first.data?.tsv||'');ocrFullScale371={x:bitmap.width/c.width,y:bitmap.height/c.height};
   function resultOf(data){
     const text=String(data?.text||'').slice(0,60000),tsv=String(data?.tsv||''),rowsText=engine?.tsvText(tsv)||'';
     const normal=engine?.parse(text),byRows=engine?.parse(rowsText);
     const best=byRows?.rows?.length>normal?.rows?.length?byRows:normal;
     const spatial=window.PNEUMOPRO_PARSER367?.parseTSV(tsv,text);
     return {text,tsv,rowsText,score:Math.max(best?.rows?.length||0,spatial?.rows?.length||0)};
   }
   let best=resultOf(first.data);
   // Nur wenn die erste Erkennung scheitert: eine zweite lokale Layoutstrategie.
   if(best.score<2){
     try{
       setStatus('Wenig Tabellenwerte erkannt. Zweiter lokaler Leseversuch ...');
       await w.setParameters({tessedit_pageseg_mode:'6'});
       const second=resultOf((await w.recognize(c,{}, {tsv:true})).data);
       if(second.score>best.score)best=second;
     }catch(e){ /* Originalerkennung bleibt erhalten; keine Daten erfinden. */ }
     finally{try{await w.setParameters({tessedit_pageseg_mode:'3'});}catch(e){ /* Bei erneutem Scan wird neuer Versuch gestartet. */ }}
   }
   // Diagrammhinweise immer aus dem vollstaendigen Original behalten.
   ocrHints=tsvHints(best.tsv,bitmap.width/c.width,bitmap.height/c.height);
   const fullPageText=best.text;
   // Eine ganze fotografierte Klinikseite kann kleine Tabellen in einer
   // anderen OCR-Lesereihenfolge liefern. Bei weniger als zwei brauchbaren
   // Messzeilen deshalb begrenzte vergroesserte Bildbereiche lokal pruefen.
   // Keine feste Klinik, kein fixer Patient und keine ausgedachten Zahlen.
   let cropName='';
   if(best.score<10){
     const regions=[
       {name:'linke untere Tabelle',x:.065,y:.435,w:.55,h:.285},
       {name:'rechte untere Tabelle',x:.425,y:.435,w:.53,h:.36},
       {name:'linke mittlere Tabelle',x:.065,y:.235,w:.56,h:.37},
       {name:'untere breite Tabelle',x:.055,y:.595,w:.88,h:.31}
     ];
     try{
       await w.setParameters({tessedit_pageseg_mode:'6'});
       for(const region of regions){
         if(best.score>=10)break;
         const sx=Math.floor(bitmap.width*region.x),sy=Math.floor(bitmap.height*region.y);
         const sw=Math.max(1,Math.floor(bitmap.width*region.w)),sh=Math.max(1,Math.floor(bitmap.height*region.h));
         const scale=Math.min(4.7,2450/sw,2700/sh,Math.sqrt(5400000/(sw*sh)));
         const tile=document.createElement('canvas');
         tile.width=Math.max(1,Math.floor(sw*scale));tile.height=Math.max(1,Math.floor(sh*scale));
         try{
           const tc=tile.getContext('2d',{willReadFrequently:true});
           if(!tc)continue;
           tc.fillStyle='#fff';tc.fillRect(0,0,tile.width,tile.height);
           tc.imageSmoothingEnabled=true;tc.imageSmoothingQuality='high';
           tc.drawImage(bitmap,sx,sy,sw,sh,0,0,tile.width,tile.height);
           setStatus('Kleine Messwerttabelle gezielt lesen: '+region.name+' ...');
           const candidate=resultOf((await w.recognize(tile,{}, {tsv:true})).data);
           if(candidate.tsv&&ocrRegions372.length<5)ocrRegions372.push({name:region.name,tsv:candidate.tsv,x:sx,y:sy,sw,sh,cw:tile.width,ch:tile.height});
           if(candidate.score>best.score){best=candidate;cropName=region.name;}
         }catch(error){ /* Diesen Teilbereich nicht uebernehmen; anderen pruefen. */ }
         finally{tile.width=tile.height=1;}
       }
     }catch(error){ /* Misslingt der Tabellenfokus, bleibt die Vollseiten-OCR erhalten. */ }
     finally{try{await w.setParameters({tessedit_pageseg_mode:'3'});}catch(error){}}
   }
   ocrRows366=best.rowsText;ocrPosition367=best.tsv;
   c.width=c.height=1;
   return cropName?fullPageText+'\n\n[Vergrößerte Tabellenansicht: '+cropName+']\n'+best.text:fullPageText;
  }finally{bitmap.close();}
 }
 async function ocrWorker(){if(!window.Tesseract){await new Promise((resolve,reject)=>{let s=document.createElement('script');s.src='./ocr-vendor/tesseract.min.js';s.onload=resolve;s.onerror=()=>reject(Error('Lokales OCR-Modul nicht verfügbar.'));document.head.append(s);});}if(!window.Tesseract?.createWorker)throw Error('OCR-Modul nicht verfügbar.');if(!worker){const base=new URL('./ocr-vendor/',location.href).href;worker=await window.Tesseract.createWorker(['deu','eng'],1,{workerPath:base+'worker.min.js',corePath:base+'core',langPath:base+'lang',workerBlobURL:false});}return worker;}
 function tsvHints(tsv,fx,fy){const matches=[];const groups=new Map();for(const line of tsv.split(/\r?\n/).slice(1)){const f=line.split('\t');if(f.length<12||f[0]!=='5')continue;let word=f.slice(11).join(' ').trim();if(!word)continue;const key=f.slice(1,5).join('-');let list=groups.get(key)||[];list.push({word,x:Number(f[6]),y:Number(f[7]),w:Number(f[8]),h:Number(f[9])});groups.set(key,list);}for(const words of groups.values()){let title=words.map(x=>x.word).join(' ');if(!/(?:fluss.{0,8}volumen|flow.{0,8}volume|volumen.{0,8}zeit|volume.{0,8}time|ch\s*4.{0,8}co|atemwegswiderstand|bodypleth|diffusionskurve)/i.test(title))continue;let x=Math.min(...words.map(w=>w.x)),y=Math.min(...words.map(w=>w.y));let label=/ch\s*4|diffusion/i.test(title)?'Diffusion (CO/CH4)':/widerstand|pleth/i.test(title)?'Atemwegswiderstand':/zeit|time/i.test(title)?'Volumen-Zeit':'Fluss-Volumen';matches.push({label,x:Math.round(x*fx),y:Math.round(y*fy),title:title.slice(0,90)});}return matches.slice(0,8);}
 async function recognizePdf(blob){const pdfjs=await import('./ocr-vendor/pdf.min.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('./ocr-vendor/pdf.worker.min.mjs',location.href).href;const job=pdfjs.getDocument({data:new Uint8Array(await blob.arrayBuffer()),useSystemFonts:true}),pdf=await job.promise;let pages=[],count=Math.min(pdf.numPages,5);try{for(let pageNum=1;pageNum<=count;pageNum++){setStatus('PDF-Seite '+pageNum+' von '+count+' wird lokal gelesen.');let p=await pdf.getPage(pageNum),data=await p.getTextContent();let items=(data.items||[]).filter(i=>i.str&&i.transform);let out='';if(items.length){const lines=[];for(let item of items){const y=item.transform[5];let group=lines.find(l=>Math.abs(l.y-y)<3);if(!group){group={y,items:[]};lines.push(group);}group.items.push(item);}out=lines.sort((a,b)=>b.y-a.y).map(l=>l.items.sort((a,b)=>a.transform[4]-b.transform[4]).map(x=>x.str).join(' ')).join('\n');}
 if(out.replace(/\s/g,'').length<40){const vp=p.getViewport({scale:1}),fac=Math.min(1.7,2200/vp.height,1800/vp.width);const view=p.getViewport({scale:fac});const c=document.createElement('canvas');c.width=Math.round(view.width);c.height=Math.round(view.height);await p.render({canvasContext:c.getContext('2d'),viewport:view}).promise;let w=await ocrWorker();out=(await w.recognize(c)).data?.text||'';c.width=c.height=1;}pages.push('[Seite '+pageNum+']\n'+out);p.cleanup();}if(pdf.numPages>5)pages.push('WARNUNG: PDF hat '+pdf.numPages+' Seiten. Nur die ersten 5 wurden ausgelesen; keine vollständige Übernahme.');}finally{await job.destroy().catch(()=>{});}return pages.join('\n\n');}
 function drawRows(){const kind=$('li365-type').value,host=$('li365-table');host.replaceChildren();if(!defs[kind])return;let t=el('table');let head=el('tr');for(const h of ['Wert','Soll','Ist','% Soll','Z-Score'])head.append(el('th','',h));t.append(head);
 for(const [code,label,unit] of defs[kind]){let tr=el('tr');tr.dataset.code=code;let cand=parsed?.rows?.find(x=>x.code===code);
  const state371=cand&&Number.isFinite(cand.actual)?(Number.isFinite(cand.percent)?'complete':'partial'):'missing';
  tr.dataset.status=state371;
  let heading371=el('th','',label+' ('+unit+')');
  heading371.append(el('small','li371-status',state371==='complete'?'Vollständig erkannt – prüfen':state371==='partial'?'Teilweise erkannt – prüfen':'Nicht erkannt'));
  tr.append(heading371);for(const key of ['predicted','actual','percent','z']){let td=el('td');let input=el('input');input.type='text';input.inputMode='decimal';input.autocomplete='off';input.dataset.field=key;input.value=format(cand?.[key]);input.setAttribute('aria-label',label+' '+key);td.append(input);tr.append(td);}t.append(tr);}host.append(t);}
 async function setCurrentDoc(d){window.PNEUMOPRO_REVIEW373?.reset?.();currentDoc=d;parsed=null;crops=[];image=null;selection=null;ocrHints=[];$('li365-review').hidden=true;$('li365-chartlist').replaceChildren();$('li365-canvas').width=$('li365-canvas').height=0;setStatus('Ausgewählt: '+d.name+'. Analyse starten.');warnings([]);}
 async function analyze(d){if(busy||!d)return;busy=true;let request=++activeRequest;warnings([]);setStatus('Lese '+d.name+' lokal ein. Es werden keine Daten an einen Server geschickt.');$('li365-analyze').disabled=true;
 try{if(!S.state().unlocked)throw Error('Gesundheitsakte gesperrt.');let isPdf=/\.pdf$/i.test(d.name);ocrHints=[];if(isPdf){ocrRows366='';ocrPosition367='';ocrFullTSV371='';ocrRegions372=[];}let text=isPdf?await recognizePdf(d.blob):await recognizeImage(d.blob);if(request!==activeRequest)return;currentDoc=d;
  const scanner366=window.PNEUMOPRO_PARSER366;
  const fromText=scanner366?.parse(text)||parse(text);
  const fromLines=ocrRows366&&scanner366?scanner366.parse(ocrRows366):null;
  const useLines=fromLines&&fromLines.rows.length>fromText.rows.length;
  parsed=useLines?{...fromLines,date:fromLines.date||fromText.date,warnings:[...new Set([...fromLines.warnings,...fromText.warnings])]}:fromText;
  const geo=!isPdf&&ocrPosition367?window.PNEUMOPRO_PARSER367?.parseTSV(ocrPosition367,text):null;
  const useGeo=geo&&geo.rows.length>parsed.rows.length;
  if(useGeo)parsed={...geo,date:geo.date||parsed.date||fromText.date,warnings:geo.warnings};
  else if(geo?.diagnostics?.recognized&&!parsed.rows.length)parsed.warnings=[...new Set([...parsed.warnings,...geo.warnings])];
  // Ein weiterer Lesepfad verbindet getrennte Vollseiten- und Tabellen-OCR.
  // Die App fuellt nur arithmetisch konsistente, ohne Punktkorrektur lesbare
  // Zahlen aus benannten Zeilen vor; niemals fehlende Werte erraten.
  const clean369=window.PNEUMOPRO_PARSER369?.parse(text);
  const useClean369=!!clean369&&clean369.rows.length>parsed.rows.length;
  if(useClean369)parsed={...clean369,date:clean369.date||parsed.date};
  else if(clean369?.date&&!parsed.date)parsed={...parsed,date:clean369.date};
  // Teilweise lesbare Zahlen getrennt von vollstaendigen Werten behandeln.
  // Niemals Prozentwerte aus der Rechnung als gemessene Angaben erfinden.
  const supplement370=window.PNEUMOPRO_PARSER370?.parse(text);
  const supplement370Rows=[],supplement370Conflicts=[];
  if(supplement370?.rows){
    const present=new Map(parsed.rows.map(r=>[r.code,r]));
    for(const row of supplement370.rows){
      const existing=present.get(row.code);
      if(existing){
        if(Number.isFinite(existing.actual)&&Math.abs(existing.actual-row.actual)>.03) supplement370Conflicts.push(row.code);
      }else{supplement370Rows.push(row);present.set(row.code,row);}
    }
    if(supplement370Rows.length)parsed={...parsed,rows:[...parsed.rows,...supplement370Rows]};
  }
  // Aus dem unveraenderten Original nur noch unsichere Zeilen/Prozentspalten
  // mit echten Vollseiten-Wortkoordinaten fokussiert nachlesen.
  let focus371Found=0,focus371Warnings=[];
  if(!isPdf&&ocrFullTSV371&&window.PNEUMOPRO_FOCUS371){
    try{
      const study371=await window.PNEUMOPRO_FOCUS371.scan(d.blob,ocrFullTSV371,parsed.rows,ocrWorker,msg=>setStatus(msg),ocrFullScale371.x,ocrFullScale371.y);
      const source371=new Map(parsed.rows.map(r=>[r.code,r]));
      for(const r of study371.rows){
        const old=source371.get(r.code);
        if(old){
          if(Number.isFinite(old.predicted)&&Number.isFinite(r.predicted)&&Math.abs(old.predicted-r.predicted)>.025){focus371Warnings.push(r.code+': Sollwert-Widerspruch; Original prüfen.');continue;}
          if(Number.isFinite(old.actual)&&Number.isFinite(r.actual)&&Math.abs(old.actual-r.actual)>.025){focus371Warnings.push(r.code+': Istwert-Widerspruch; Original prüfen.');continue;}
          if(!Number.isFinite(old.percent)&&Number.isFinite(r.percent)){
            source371.set(r.code,{...old,percent:r.percent});focus371Found++;
          }
        }else if(Number.isFinite(r.actual)){
          source371.set(r.code,r);focus371Found++;
        }
      }
      if(focus371Found)parsed={...parsed,rows:[...source371.values()]};
      focus371Warnings.push(...study371.warnings);
      if(!study371.targets)focus371Warnings.push('Fuer fehlende Zeilen wurden keine verlaesslichen Textpositionen erkannt. Diese Angaben bleiben leer.');
    }catch(error){focus371Warnings.push('Einzelzeilen-Nachpruefung technisch nicht moeglich: '+(error?.message||String(error))+'. Bisherige sichere Vorschlaege bleiben erhalten.');}
  }
  // 3.7.2: Verknuepft echte OCR-Koordinaten vergroesserter Tabellenausschnitte
  // mit dem Originalbild. Auslese-Vorschlaege erfordern weiterhin Kontrolle.
  let found372=0,warnings372=[];
  if(!isPdf&&ocrRegions372.length&&window.PNEUMOPRO_FOCUS372&&window.PNEUMOPRO_FOCUS371){
    try{
      const extra=await window.PNEUMOPRO_FOCUS372.scan(d.blob,ocrRegions372,parsed.rows,window.PNEUMOPRO_FOCUS371,ocrWorker,msg=>setStatus(msg));
      const current=new Map(parsed.rows.map(row=>[row.code,row]));
      for(const row of extra.rows){
        const before=current.get(row.code);
        if(before){
          if(Number.isFinite(before.predicted)&&Number.isFinite(row.predicted)&&Math.abs(before.predicted-row.predicted)>.025){warnings372.push(row.code+': Unterschied bei Sollwert; keine automatische Aenderung.');continue;}
          if(Number.isFinite(before.actual)&&Number.isFinite(row.actual)&&Math.abs(before.actual-row.actual)>.025){warnings372.push(row.code+': Unterschied bei Istwert; keine automatische Aenderung.');continue;}
          if(!Number.isFinite(before.percent)&&Number.isFinite(row.percent)){current.set(row.code,{...before,percent:row.percent});found372++;}
        }else if(Number.isFinite(row.actual)){current.set(row.code,row);found372++;}
      }
      if(found372)parsed={...parsed,rows:[...current.values()]};
      warnings372.push(...extra.warnings);
      if(!found372&&extra.targets)warnings372.push('Zeilen-Nachlesen ergab keine eindeutig zusaetzlichen Zahlen; fehlende Felder bleiben leer.');
    }catch(error){warnings372.push('Erweiterte Tabellenkoordinaten konnten nicht verwendet werden; bisherige Vorschlaege bleiben erhalten.');}
  }
  if(useLines)text+='\n\n[Zusätzliche Tabellenzeilen aus OCR-Positionsdaten]\n'+ocrRows366;
  let notices=[...parsed.warnings,...focus371Warnings,...warnings372];
  if(focus371Found)notices.push(focus371Found+' zusätzliche Angaben aus gezielt vergrößerten Tabellenzeilen als UNBESTÄTIGTE Vorschläge erkannt. Alle Werte am Original prüfen.');
  if(found372)notices.push(found372+' weitere Werte aus zugeordneten Tabellenfoto-Zeilen als UNBESTAETIGTE Vorschlaege: Original pruefen.');
  if(supplement370Rows.length)notices.push(supplement370Rows.length+' Parameter mit lesbaren Soll-/Istwerten, aber ohne sichere Prozentangabe. Die Prozentfelder bleiben leer. Alle Vorschlaege am Original kontrollieren.');
  if(supplement370Conflicts.length)notices.push('OCR widerspricht vorhandenen Werten bei: '+supplement370Conflicts.join(', ')+'. Bitte mit dem Original vergleichen; die bestaetigtere vollstaendige Zeile bleibt unveraendert.');
  if(useClean369)notices.push('Weitere Werte aus getrennten OCR-Tabellenteilen als ungepruefte Vorschlaege erkannt. Alle Zahlen und die Messphase am Original kontrollieren.');
  if(useLines&&!useGeo)notices.push('Tabellenzeilen anhand ihrer Bildposition rekonstruiert. Bitte Zuordnung der Zahlen am Original besonders sorgfältig prüfen.');
  if(useGeo)notices.push('Soll/Ist/% anhand wiederkehrender echter Spaltenpositionen als UNBESTAETIGTE Vorschlaege erkannt. Jede Zahl, Einheit und Messphase am Original pruefen.');if(isPdf&&text.includes('WARNUNG: PDF hat'))notices.push('Mehrseitiges PDF nicht vollständig ausgelesen. Bitte Original prüfen.');
 $('li365-type').value=parsed.kind||(['diff','lufu'].includes(d.scanArea)?(d.scanArea==='diff'?'diffusion':'measurements'):'');$('li365-date').value=parsed.date||d.documentDate||'';const matchTime370=text.match(/\b(?:Messzeit|Untersuchungszeit|Uhrzeit)\s*[:\-]?\s*([01]?\d|2[0-3])[:.]([0-5]\d)\b/i);$('li365-time').value=matchTime370?matchTime370[1].padStart(2,'0')+':'+matchTime370[2]:'';$('li365-clinic').value=d.clinic||d.providerName||'';$('li365-phase').value='unbekannt';$('li365-text').textContent=text;$('li365-verified').checked=false;drawRows();$('li365-review').hidden=false;window.PNEUMOPRO_REVIEW373?.attach(d.blob);
 const activeCodes=(defs[$('li365-type').value]||[]).map(x=>x[0]);
 const countFull371=activeCodes.filter(code=>parsed.rows.some(r=>r.code===code&&Number.isFinite(r.actual)&&Number.isFinite(r.percent))).length;
 const countPart371=activeCodes.filter(code=>parsed.rows.some(r=>r.code===code&&Number.isFinite(r.actual)&&!Number.isFinite(r.percent))).length;
 const countMissing371=activeCodes.length-countFull371-countPart371;
 if(countPart371)notices.push(countPart371+' Messwertzeile(n) TEILWEISE erkannt. Nicht lesbare Prozentwerte bleiben leer.');
 if(countMissing371)notices.push(countMissing371+' Messwertzeile(n) NICHT erkannt. Hier werden keine Zahlen ergänzt.');

 if(!isPdf){await prepareCanvas(d.blob);showSuggestions();}else{canvasBase=null;$('li365-suggestions').replaceChildren();$('li365-canvas').width=$('li365-canvas').height=0;notices.push('PDF-Diagramme können in dieser Ansicht noch nicht automatisch ausgeschnitten werden. Original bleibt erhalten; für einen Ausschnitt eine JPEG-/PNG-Seite auswählen.');}
 warnings(notices);setStatus(countFull371+' vollständig erkannt · '+countPart371+' teilweise erkannt · '+countMissing371+' nicht erkannt. Alle Angaben mit dem Original vergleichen; Diagramme manuell markieren.');$('li365-review').scrollIntoView({block:'start',behavior:'smooth'});
 }catch(e){warnings(['Keine sichere automatische Übernahme möglich: '+(e?.message||String(e))]);setStatus('Auslesen nicht möglich. Original bleibt gespeichert.',true);}finally{busy=false;$('li365-analyze').disabled=false;}}
 async function prepareCanvas(blob){let bitmap=await createImageBitmap(blob);try{const factor=Math.min(1,850/Math.max(bitmap.width,bitmap.height));let c=$('li365-canvas');c.width=Math.max(1,Math.round(bitmap.width*factor));c.height=Math.max(1,Math.round(bitmap.height*factor));c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);canvasBase=document.createElement('canvas');canvasBase.width=bitmap.width;canvasBase.height=bitmap.height;canvasBase.getContext('2d').drawImage(bitmap,0,0);selection=null;}finally{bitmap.close();}}
 function showSuggestions(){const host=$('li365-suggestions');host.replaceChildren();if(!ocrHints.length){host.append(el('p','li365-muted','Keine ausreichend beschrifteten Diagrammbereiche sicher erkannt. Bitte die Kurve im Original manuell markieren.'));return;}
 host.append(el('p','li365-muted','Mögliche Diagramm-Überschriften erkannt. Die Positionen sind nur Orientierungshilfen und müssen vor dem Speichern durch einen vollständigen manuellen Ausschnitt bestätigt werden.'));
 for(const [index,h] of ocrHints.entries()){let button=el('button','','Vorschlag '+(index+1)+': '+h.title);button.type='button';button.addEventListener('click',()=>{if(!canvasBase)return;const sx=$('li365-canvas').width/canvasBase.width,sy=$('li365-canvas').height/canvasBase.height;const c=$('li365-canvas');selection={x:Math.max(0,(h.x-50)*sx),y:Math.max(0,(h.y-35)*sy),w:Math.min(c.width*.55,c.width-(h.x-50)*sx),h:Math.min(c.height*.28,c.height-(h.y-35)*sy)};selection.w=Math.max(0,selection.w);selection.h=Math.max(0,selection.h);$('li365-chartkind').value=h.label;drawSelection();warnings(['Dies ist nur ein automatisch vorgeschlagener Bereich. Bitte den vollständigen Diagrammausschnitt mit dem Finger selbst korrigieren und vor dem Hinzufügen kontrollieren.']);});host.append(button);}}
 function drawSelection(){let c=$('li365-canvas');if(!canvasBase)return;let ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.drawImage(canvasBase,0,0,c.width,c.height);if(selection){ctx.lineWidth=3;ctx.strokeStyle='#0064b8';ctx.setLineDash([7,4]);ctx.strokeRect(selection.x,selection.y,selection.w,selection.h);ctx.setLineDash([]);}}
 const canvas=$('li365-canvas');const pointer=e=>{let r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(canvas.width,(e.clientX-r.left)/r.width*canvas.width)),y:Math.max(0,Math.min(canvas.height,(e.clientY-r.top)/r.height*canvas.height))};};
 canvas.addEventListener('pointerdown',e=>{if(!canvasBase)return;drag=pointer(e);selection=null;canvas.setPointerCapture?.(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag)return;const p=pointer(e);selection={x:Math.min(drag.x,p.x),y:Math.min(drag.y,p.y),w:Math.abs(p.x-drag.x),h:Math.abs(p.y-drag.y)};drawSelection();});
 canvas.addEventListener('pointerup',e=>{if(drag){const p=pointer(e);selection={x:Math.min(drag.x,p.x),y:Math.min(drag.y,p.y),w:Math.abs(p.x-drag.x),h:Math.abs(p.y-drag.y)};drag=null;drawSelection();}});
 $('li365-cropreset').addEventListener('click',()=>{selection=null;drawSelection();});
 $('li365-crop').addEventListener('click',()=>{if(!canvasBase||!selection||selection.w<35||selection.h<30)return warnings(['Bitte im Originalfoto einen deutlich sichtbaren, ausreichend großen Diagrammausschnitt mit dem Finger markieren.']);if(crops.length>=8)return warnings(['Maximal 8 Diagramme pro Befund.']);const rx=canvasBase.width/canvas.width,ry=canvasBase.height/canvas.height;const sx=Math.floor(selection.x*rx),sy=Math.floor(selection.y*ry),sw=Math.round(selection.w*rx),sh=Math.round(selection.h*ry);const factor=Math.min(1,1400/Math.max(sw,sh));let dst=document.createElement('canvas');dst.width=Math.max(1,Math.round(sw*factor));dst.height=Math.max(1,Math.round(sh*factor));dst.getContext('2d').drawImage(canvasBase,sx,sy,sw,sh,0,0,dst.width,dst.height);let crop={label:$('li365-chartkind').value,src:dst.toDataURL('image/jpeg',.88),bounds:{x:sx,y:sy,w:sw,h:sh}};if(crop.src.length>3000000)return warnings(['Ausschnitt ist zu groß. Bitte einen kleineren Bereich markieren.']);crops.push(crop);showCrops();selection=null;drawSelection();});
 function showCrops(){let host=$('li365-chartlist');host.replaceChildren();for(let [i,c] of crops.entries()){let row=el('div','li365-cropitem');let img=el('img');img.src=c.src;img.alt=c.label+' – echter Ausschnitt aus dem Original';let caption=el('span','',c.label);let remove=el('button','','Entfernen');remove.type='button';remove.onclick=()=>{crops.splice(i,1);showCrops();};row.append(img,caption,remove);host.append(row);}}
 $('li365-type').addEventListener('change',()=>{drawRows();$('li365-verified').checked=false;warnings(['Testart gewechselt: Bitte die Zahlen und die Zuordnung jeder Spalte am Original erneut prüfen.']);});
 $('li365-save').addEventListener('click',async()=>{if(busy)return;busy=true;try{if(!currentDoc?.blob)throw Error('Kein Originaldokument ausgewählt.');if(!$('li365-verified').checked)throw Error('Bitte vor dem Speichern die Bestätigung aktivieren.');let kind=$('li365-type').value;if(!defs[kind])throw Error('Testart muss ausgewählt werden.');let date=$('li365-date').value,time=$('li365-time').value;if(!validDate(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Datum und Uhrzeit vom Original überprüfen und eingeben.');let rows=[];for(let tr of $('li365-table').querySelectorAll('tr[data-code]')){let data={code:tr.dataset.code};for(const inp of tr.querySelectorAll('input[data-field]')){let raw=inp.value.trim();let val=raw===''?null:number(raw);if(raw!==''&&val===null)throw Error('Ungültige Zahl bei '+data.code+' / '+inp.dataset.field);if(val!==null&&inp.dataset.field!=='z'&&val<0)throw Error('Negativer Messwert bei '+data.code);data[inp.dataset.field]=val;}
 if(data.actual!==null){if(data.predicted!==null&&data.predicted>0&&data.percent!==null&&Math.abs(data.actual/data.predicted*100-data.percent)>5)throw Error('Soll/Ist/%-Werte bei '+data.code+' sind rechnerisch unplausibel.');if(data.z!==null&&Math.abs(data.z)>15)throw Error('Unplausibler Z-Score: '+data.code);}data.sourceStatus=tr.dataset.status||'unknown';rows.push(data);}
 if(!rows.some(x=>x.actual!==null))throw Error('Kein bestätigter Ist-Messwert vorhanden.');const existing=(await S.list('suite')).filter(x=>x.type===kind&&x.value?.date===date&&x.value?.time===time);if(existing.length){warnings(['Für dieselbe Testart, Datum und Uhrzeit existiert bereits eine Untersuchung. Kein Doppel-Eintrag angelegt.']);throw Error('Doppelter Test – bestehende Untersuchung bitte öffnen.');}
 const id=crypto.randomUUID(),value={id,date,time,doctor:$('li365-clinic').value.slice(0,180),note:'Lokal aus Originaldokument uebernommen und vom Nutzer am Original geprueft; nicht erkannte Felder bleiben leer.',phase:$('li365-phase').value,source:'direct-ocr-review',createdAt:new Date().toISOString(),sourceDocumentId:currentDoc.id,diagramCrops:crops.map(c=>({label:c.label,src:c.src,bounds:c.bounds})),testRows:rows};
 if(kind==='measurements'){const at=code=>rows.find(x=>x.code===code);Object.assign(value,{fev1:at('FEV1').percent,fvc:at('FVC').percent,fev1Liters:at('FEV1').actual,fvcLiters:at('FVC').actual,ratio:at('FEV1_FVC').actual});}
 const key=kind+'/'+id;await S.put('suite',{key,type:kind,value},key);const saved=await S.get('suite',key);if(!saved||saved.value?.sourceDocumentId!==currentDoc.id)throw Error('Speichern konnte nicht bestätigt werden.');const doc={...currentDoc,linkedStudyId:id,linkedStudyKind:kind,studyDate:date,studyTime:time};await S.put('documents',doc,doc.id);setStatus('Geprüfter Test gespeichert, mit Originaldatei verknüpft. '+crops.length+' Diagrammausschnitt(e) zugeordnet.');warnings(rows.filter(r=>r.actual===null).length?['Unvollständiger Test: '+rows.filter(r=>r.actual===null).length+' Parameter ohne bestätigten Istwert. Bei Bedarf Original über ChatGPT prüfen lassen.']:[]);await latest();window.dispatchEvent(new CustomEvent('asthma:lung-study-imported',{detail:{saved:1}}));
 }catch(e){setStatus('Nicht gespeichert: '+(e?.message||String(e)),true);warnings(['Automatische Übernahme beziehungsweise Zuordnung nicht sicher möglich. Bitte Original prüfen; alternativ Original in ChatGPT hochladen und geprüfte Daten nachtragen.']);}finally{busy=false;}});
 async function latest(){let host=$('li365-latest'),home=document.getElementById('li365-home');let rows=(await S.list('suite')).filter(r=>['diffusion','measurements'].includes(r.type)&&r.value?.diagramCrops?.length).sort((a,b)=>(b.value.date+' '+b.value.time).localeCompare(a.value.date+' '+a.value.time));host.replaceChildren();if(home)home.replaceChildren();if(!rows.length)return;
 const build=(target,limit)=>{target.append(el('h4','','Echte Diagramme neuer Untersuchungen'));for(let r of rows.slice(0,limit)){let card=el('details','li365-study'),title=el('summary','',r.value.date+' · '+r.value.time+' · '+(r.type==='diffusion'?'Diffusion':'Lungenfunktion'));card.append(title);let grid=el('div','li365-preview');for(let c of r.value.diagramCrops){let fig=el('figure');let img=el('img');img.src=c.src;img.alt=c.label+' (Originalausschnitt)';img.addEventListener('click',()=>{let dialog=document.createElement('dialog');dialog.className='li365-lightbox';let close=el('button','','Schließen');close.onclick=()=>dialog.close();let full=el('img');full.src=c.src;full.alt=c.label;dialog.append(close,full);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();});fig.append(img,el('figcaption','',c.label));grid.append(fig);}card.append(grid);target.append(card);}}
 build(host,8);if(home)build(home,2);
 }
 $('li365-file').addEventListener('change',async e=>{let f=e.target.files?.[0];e.target.value='';if(!f)return;try{if(!checkMime(f))throw Error('Nur JPEG, PNG, WebP oder PDF bis 12 MB sind zulässig.');const docs=await S.list('documents');let d=docs.find(x=>x.name===f.name&&x.size===f.size&&eligible(x));if(!d){const id=crypto.randomUUID();d={id,kind:'Lungenfunktionstest',scanArea:'lufu',name:f.name,size:f.size,mime:f.type,blob:f,documentDate:'',source:'lungimport365',createdAt:new Date().toISOString()};await S.put('documents',d,id);}await refreshDocs(d.id);await analyze(d);}catch(err){warnings(['Keine sichere Übernahme möglich: '+err.message]);setStatus('Die Datei wurde nicht ausgewertet.',true);}});
 $('li365-analyze').addEventListener('click',async()=>{try{let d=await S.get('documents',$('li365-doc').value);if(!eligible(d))throw Error('Bitte zuerst einen Lungenfunktions- oder Diffusionsbefund auswählen.');await analyze(d);}catch(e){warnings([e.message]);}});
 $('li365-reload').addEventListener('click',()=>refreshDocs().catch(e=>setStatus(e.message,true)));
 let recent=new Set();(async()=>{for(let d of await refreshDocs())recent.add(d.id);await latest();})().catch(e=>setStatus(e.message,true));
 let timer=0;window.addEventListener('asthma:secure-change',event=>{if(event.detail?.group==='suite')latest().catch(()=>{});if(event.detail?.group==='documents'){clearTimeout(timer);timer=setTimeout(async()=>{try{const docs=await refreshDocs();const newcomers=docs.filter(d=>!recent.has(d.id));for(const d of newcomers)recent.add(d.id);const d=newcomers.find(d=>['scans352','dateien331'].includes(d.source));if(d&&!busy&&document.visibilityState==='visible'){await analyze(d);}}catch(e){warnings(['Neuer Befund konnte nicht automatisch verarbeitet werden: '+e.message]);}},500);}});
 window.__PNEUMOPRO_LUNG365_TEST=Object.freeze({version:'3.6.5',offline:true,requiresReview:true,source:'originals and user-confirmed values'});
})();
