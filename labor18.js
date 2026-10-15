'use strict';
/* Ergänzende Asthma-Laborakte: ausschließlich lokale, verschlüsselte Einträge. */
(()=>{
 const SEC=window.ASTHMA_SECURITY,$=id=>document.getElementById(id);if(!$('labor-form')||!SEC)return;
 const markers=[
  ['eosAbs','Eosinophile absolut','/µl','Entzündungsphänotyp; schwankt u. a. unter Kortison.'],
  ['eosPct','Eosinophile relativ','%','Differenzialblutbild – nicht mit absoluter Zahl verwechseln.'],
  ['igeTotal','Gesamt-IgE','kU/l','Hinweis auf allergische Sensibilisierung, alleine keine Diagnose.'],
  ['igeSpecific','Spezifisches IgE','kU/l','Allergenbezeichnung zwingend ergänzen; Sensibilisierung nicht gleich Allergie.'],
  ['neutAbs','Neutrophile absolut','/µl','Differenzialblutbild; vielfältige Ursachen für Abweichungen.'],
  ['wbc','Leukozyten','G/l','Bei bestimmten Begleitfragen wie Infekten.'],
  ['crp','CRP','mg/l','Unspezifischer Entzündungsmarker; keine Asthma-Diagnose.'],
  ['hb','Hämoglobin','g/dl','Möglicher Einfluss einer Anämie auf Luftnot.'],
  ['hct','Hämatokrit','%','Blutbild, klinisch einzuordnen.'],
  ['vitd','Vitamin D (25-OH)','ng/ml','Nicht routinemäßig zur Asthmadiagnose; Messung nur bei Indikation.'],
  ['a1at','Alpha-1-Antitrypsin','mg/dl','Bei passender Fragestellung zur Differenzialdiagnostik.'],
  ['potassium','Kalium','mmol/l','Falls Begleitbehandlungen eine Elektrolytkontrolle erfordern.'],
  ['glucose','Glukose','mg/dl','Bei systemischen Kortikosteroiden oder anderen Indikationen.'],
  ['hba1c','HbA1c','%','Bei geeigneter Fragestellung im Zusammenhang mit Stoffwechsel.'],
  ['po2','Blutgas: pO₂','mmHg','Blutgasanalyse, nicht mit Pulsoxymeter verwechseln.'],
  ['pco2','Blutgas: pCO₂','mmHg','Blutgasanalyse, klinisch bewerten.'],
  ['ph','Blutgas: pH','','Blutgasanalyse, Probenart beachten.'],
  ['feno','FeNO (Atemtest, KEIN Blutwert)','ppb','Marker aus der Ausatemluft, kein Blutwert.']
 ];
 const catalog=Object.fromEntries(markers.map(x=>[x[0],x]));const unit=$('lab-unit'),desc=$('lab-explain'),select=$('lab-marker'),list=$('lab-history');
 for(const [id,label] of markers){const o=document.createElement('option');o.value=id;o.textContent=label;select.append(o)}
 function description(){const row=catalog[select.value];unit.value=row[2];desc.textContent=row[3];$('lab-specific-wrap').hidden=select.value!=='igeSpecific'}select.addEventListener('change',description);description();
 $('lab-date').value=new Date().toISOString().slice(0,10);
 const status=(msg,bad=false)=>{const p=$('lab-status');p.textContent=msg;p.classList.toggle('scan-error',bad)};
 const div=(tag,className,text)=>{const x=document.createElement(tag);if(className)x.className=className;if(text!==undefined)x.textContent=text;return x};
 const valueOf=id=>$(id).value.trim();
 const validDate=s=>/^\d{4}-\d\d-\d\d$/.test(s)&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
 async function render(){const rows=(await SEC.list('labs')).sort((a,b)=>b.date.localeCompare(a.date));list.replaceChildren();if(!rows.length){list.append(div('p','suite-muted','Noch keine Laborwerte gespeichert.'));return;}
  for(const r of rows){const card=div('article','suite-record');const name=(catalog[r.marker]?.[1]||r.marker)+(r.allergen?' · '+r.allergen:'');card.append(div('strong','',r.date.split('-').reverse().join('.')+' · '+name),div('p','',r.value+' '+r.unit+(r.reference?' · Laborreferenz: '+r.reference:'')));if(r.notes)card.append(div('p','suite-muted',r.notes));
   const del=div('button','btn btn-text','Löschen');del.type='button';del.addEventListener('click',async()=>{if(confirm('Laborwert dauerhaft aus dem Tresor entfernen?')){await SEC.del('labs',r.id);render()}});card.append(del);list.append(card)}
 }
 $('labor-form').addEventListener('submit',async e=>{e.preventDefault();try{
  const date=valueOf('lab-date'),marker=select.value,raw=valueOf('lab-value').replace(',','.');if(!validDate(date))throw Error('Datum bitte prüfen.');if(!/^\d+(?:\.\d+)?$/.test(raw)||Number(raw)>10000000)throw Error('Zahlenwert ungültig.');
  const allergen=valueOf('lab-specific').slice(0,100);if(marker==='igeSpecific'&&!allergen)throw Error('Bei spezifischem IgE bitte das getestete Allergen angeben.');
  const r={id:(crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('')),date,marker,allergen,value:Number(raw),unit:valueOf('lab-unit').slice(0,25),reference:valueOf('lab-ref').slice(0,100),notes:valueOf('lab-notes').slice(0,600),confirmed:true,createdAt:new Date().toISOString()};
  await SEC.put('labs',r);const oldDate=date;$('labor-form').reset();select.value=marker;$('lab-date').value=oldDate;description();await render();status('Laborwert passwortgeschützt und lokal gespeichert. Keine automatische Diagnose.');
 }catch(e){status(e.message,true)}});
 $('lab-file').addEventListener('change',e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/')||f.size>15*1024*1024){status('Bitte ein Bild bis 15 MB auswählen.',true);return}if($('lab-image').src.startsWith('blob:'))URL.revokeObjectURL($('lab-image').src);$('lab-image').src=URL.createObjectURL(f);$('lab-image-area').hidden=false;status('Laborbild nur lokal angezeigt. Zur Texterfassung iPhone-Live-Text verwenden; Werte vor dem Speichern überprüfen.');});
 $('lab-paste').addEventListener('click',async()=>{try{const v=await navigator.clipboard.readText();$('lab-ocr-text').value=v;parseText(v)}catch(e){status('Text manuell in das Feld einfügen. '+e.message,true);$('lab-ocr-text').focus()}});
 function parseText(raw){const candidates=[];const lines=String(raw||'').split(/\n/);
  const patterns=[['eosAbs',/(?:eosinophile|eosinophils?|eos)\s*(?:absolut|abs\.?|#)\s*[:\s]*([\d.,]+)/i],['eosPct',/(?:eosinophile|eosinophils?|eos)\s*(?:relativ|%)\s*[:\s]*([\d.,]+)/i],['igeTotal',/(?:gesamt[- ]?ige|ige\s*(?:gesamt|total))\s*[:\s]*([\d.,]+)/i],['crp',/\bcrp\b\s*[:\s]*([\d.,]+)/i],['hb',/(?:hämoglobin|haemoglobin|hemoglobin)\s*[:\s]*([\d.,]+)/i],['wbc',/(?:leukozyten|leukocytes|wbc)\s*[:\s]*([\d.,]+)/i],['vitd',/(?:25[- ]?oh[- ]?vitamin\s*d|vitamin\s*d)\s*[:\s]*([\d.,]+)/i]];
  for(const line of lines){for(const [key,rx] of patterns){const m=line.match(rx);if(m){let v=m[1].replace(',','.');if(Number.isFinite(Number(v)))candidates.push({key,value:v,source:line})}}}
  const result=$('lab-ocr-result');result.replaceChildren();if(!candidates.length){result.append(div('p','suite-muted','Keine eindeutig zuordenbaren Blutwerte erkannt. Bitte manuell übertragen.'));return;}
  for(const x of candidates){const btn=div('button','btn btn-outline','Übernehmen: '+catalog[x.key][1]+' = '+x.value);btn.type='button';btn.addEventListener('click',()=>{select.value=x.key;description();$('lab-value').value=x.value;status('Vorschlag übernommen – Einheit, Referenzbereich und Originalbild vor Speichern prüfen.');$('lab-value').scrollIntoView({block:'center'})});result.append(btn)}
 }
 $('lab-parse').addEventListener('click',()=>parseText($('lab-ocr-text').value));
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='labs')render().catch(()=>{})});
 render().catch(e=>status(e.message,true));
 window.__asthmaLab18Test=Object.freeze({patterns:markers.map(m=>m[0])});
})();
