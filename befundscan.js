'use strict';
/* Kamera-/Bildimport für Spirometrie. Bildinhalte bleiben im Canvas/Arbeitsspeicher.
 * Vor der expliziten Übernahme werden keinerlei Profilwerte geändert. */
(()=>{
  const $=id=>document.getElementById(id);
  if(!$('scan-panel'))return;
  const parser=window.ASTHMA_OCR_PARSER,profile=window.ASTHMA_PROFILE_BRIDGE;
  if(!parser||!profile){$('scan-progress').textContent='Scanner konnte nicht initialisiert werden.';return;}
  // Keine externen OCR-Abhängigkeiten.
  const fieldIDs=['fev1Percent','fvcPercent','fev1Liters','fvcLiters','ratio'];
  const fields={fev1Percent:'scan-fev1-percent',fvcPercent:'scan-fvc-percent',fev1Liters:'scan-fev1-liters',fvcLiters:'scan-fvc-liters',ratio:'scan-ratio'};
  let file=null,objectURL=null,parsed=null,busy=false,worker=null;
  const note=(msg,error=false)=>{const node=$('scan-progress');node.textContent=msg;node.classList.toggle('scan-error',error);};
  function releaseImage(){if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null;}file=null;$('scan-preview').removeAttribute('src');$('scan-gallery').value='';$('scan-camera').value='';$('scan-picked').hidden=true;}
  function resetReview(){parsed=null;$('scan-review').hidden=true;$('scan-raw').value='';for(const id of Object.values(fields))$(id).value='';$('scan-date').value='';$('scan-review-warnings').textContent='';}
  function validateFile(f){if(!f)return 'Keine Datei ausgewählt.';if(!(f.type.startsWith('image/')||/\.(jpe?g|png|webp|heic|heif)$/i.test(f.name)))return 'Bitte ein Bild wählen (JPG, PNG, HEIC oder WebP).';if(f.size>15*1024*1024)return 'Bilddatei ist größer als 15 MB. Bitte verkleinern.';return '';}
  function chosen(f){if(busy)return;const error=validateFile(f);if(error){note(error,true);return;}resetReview();releaseImage();file=f;objectURL=URL.createObjectURL(f);$('scan-preview').src=objectURL;$('scan-filename').textContent=f.name+' · '+(f.size/1024/1024).toFixed(1)+' MB';$('scan-picked').hidden=false;note('Bild ausgewählt. Die Kontrollfelder lassen sich zur manuellen Übernahme öffnen.');}
  async function loadOCR(){throw Error('Lokale OCR-Bibliothek fehlt. Keine Drittanbieter-Aufrufe erlaubt.')}
  async function canvasFromImage(f){
    const u=URL.createObjectURL(f);
    try{
      const image=new Image();image.src=u;
      await (image.decode?image.decode():new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;}));
      const originalWidth=image.naturalWidth,originalHeight=image.naturalHeight;
      if(originalWidth<80||originalHeight<80)throw Error('Auflösung des Bildes ist zu gering');
      const scale=Math.min(1,2400/Math.max(originalWidth,originalHeight));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(originalWidth*scale));canvas.height=Math.max(1,Math.round(originalHeight*scale));
      const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Canvas nicht verfügbar');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
      return canvas;
    }finally{URL.revokeObjectURL(u);}
  }
  function phases(data){return new Set(data.candidates.map(x=>x.phase).filter(x=>x!=='unbekannt'));}
  function fillFromParsed(){
    if(!parsed)return;const selected=parser.pickByPhase(parsed,$('scan-phase').value);
    fieldIDs.forEach(f=>{$(fields[f]).value=selected.values[f]===undefined?'':String(selected.values[f]).replace('.',',');});
    $('scan-date').value=selected.date||'';
    const warnings=[...selected.warnings];
    const c=parsed.candidates.filter(x=>x.phase==='nach'||x.phase==='vor');
    if(new Set(c.map(x=>x.phase)).size>1&&$('scan-phase').value==='unbekannt')warnings.unshift('Die Messung enthält prä- und postbronchodilatatorische Werte: Bitte eine Phase wählen.');
    if(!Object.keys(selected.values).length)warnings.push('Werte konnten nicht sicher ausgewählt werden – anhand des Befundbildes manuell eintragen.');
    $('scan-review-warnings').textContent=warnings.join(' ');
  }
  function parseText(raw){parsed=parser.extractReportValues(raw);const ph=phases(parsed);
    $('scan-phase').value=ph.size===1?[...ph][0]:'unbekannt';fillFromParsed();$('scan-review').hidden=false;
  }
  async function run(){parsed=parser.extractReportValues('');$('scan-review').hidden=false;fillFromParsed();note('Bitte alle FEV₁-/FVC-Werte manuell anhand des Fotos eingeben und anschließend bestätigen. Automatische Texterkennung ohne sichere lokale Bibliothek derzeit deaktiviert.');}
  function numeric(id,max){const value=$(id).value.trim().replace(',','.');if(value==='')return null;const n=Number(value);
    if(!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)||!Number.isFinite(n)||n<0||n>max)throw Error('Ungültiger Wert im Feld '+id.replace('scan-','')+' (0 bis '+max+').' );
    return n;
  }
  function apply(){
    const vals={};try{
      vals.fev1=numeric('scan-fev1-percent',100);vals.fvc=numeric('scan-fvc-percent',100);
      vals.fev1Liters=numeric('scan-fev1-liters',12);vals.fvcLiters=numeric('scan-fvc-liters',12);
      vals.ratio=numeric('scan-ratio',100);
      const d=$('scan-date').value;
      if(d&&!/^\d{4}-\d{2}-\d{2}$/.test(d))throw Error('Untersuchungsdatum ist ungültig.');
      if(Object.values(vals).every(x=>x===null))throw Error('Bitte mindestens einen geprüften FEV₁- oder FVC-Wert eingeben.');
      if(vals.fev1===null&&vals.fvc===null&&vals.fev1Liters===null&&vals.fvcLiters===null)throw Error('Nur der Quotient kann nicht ins FEV₁-/FVC-Profil übernommen werden.');
      const old=profile.get(),next={...old};
      for(const f of ['fev1','fvc']){const v=vals[f];if(v!==null)next[f]=v;}
      if(vals.fev1Liters!==null)next.fev1Liters=vals.fev1Liters;
      if(vals.fvcLiters!==null)next.fvcLiters=vals.fvcLiters;
      if(d)next.lungDate=d;
      if(next.fev1Liters!==null&&next.fvcLiters!==null&&next.fvcLiters>0&&next.fev1Liters>next.fvcLiters){
        throw Error('FEV₁ in Litern kann nicht größer als FVC in Litern sein. Bitte Istwerte, Messphase und Einheiten prüfen.');
      }
      if(vals.ratio!==null&&vals.fev1Liters!==null&&vals.fvcLiters!==null&&vals.fvcLiters>0){
        if(Math.abs(100*vals.fev1Liters/vals.fvcLiters-vals.ratio)>5)throw Error('Der erkannte FEV₁/FVC-Quotient weicht deutlich von den Literwerten ab. Bitte Messphase prüfen oder falsch erkannte Zahlen korrigieren.');
      }
      profile.setLung(next);window.dispatchEvent(new Event('asthma:lung-imported'));
      resetReview();releaseImage();note('Geprüfte Werte in dein Lungenfunktionsprofil übernommen. Vorschläge und Hinweise wurden aktualisiert.');
      $('lung-fieldset').scrollIntoView({behavior:'smooth',block:'start'});
    }catch(e){$('scan-review-warnings').textContent=e.message;note('Bitte die markierten Angaben kontrollieren.',true);}
  }
  $('scan-gallery').addEventListener('change',e=>chosen(e.target.files?.[0]));
  $('scan-camera').addEventListener('change',e=>chosen(e.target.files?.[0]));
  $('scan-start').textContent='Werte aus Foto übernehmen';$('scan-start').addEventListener('click',run);
  $('scan-clear').addEventListener('click',()=>{resetReview();releaseImage();note('Bild verworfen, nichts gespeichert.');});
  $('scan-discard').addEventListener('click',()=>{resetReview();releaseImage();note('Scan abgebrochen, keine Profilwerte verändert.');});
  $('scan-phase').addEventListener('change',fillFromParsed);
  $('scan-reparse').addEventListener('click',()=>{parseText($('scan-raw').value);note('Korrigierter Text ausgewertet. Werte bitte überprüfen.');});
  $('scan-apply').addEventListener('click',apply);
  window.addEventListener('pagehide',()=>{if(worker)worker.terminate().catch(()=>{});releaseImage();});
  Object.defineProperty(window,'__asthmaScannerTest',{value:Object.freeze({parse:parser.extractReportValues,pick:parser.pickByPhase}),enumerable:false});
})();
