'use strict';
/* PneumoPro 3.7.0 - vorsichtige Teilwertvorschlaege aus OCR.
 * Nur tatsaechlich gelesene Dezimalzahlen werden vorgeschlagen. Fehlende
 * Soll-/Ist-/Prozentwerte bleiben leer. Keine medizinischen Daten im Code.
 */
(function(root){
 const names=[
  [/^RV\s*[%/]\s*TLC\s*(?:SB|single\s*breath)\b/i,'RV_TLC_SB'],
  [/^RV\s*[%/]\s*TLC\b/i,'RV_TLC'],
  [/^FEV\s*[1Il]\s*[%/]\s*FVC\b/i,'FEV1_FVC'],
  [/^(?:DLCOc\s*SB|DLCO\s*corrected)\b/i,'DLCOcSB'],
  [/^(?:KCOc\s*SB|KCO\s*corrected)\b/i,'KCOc_SB'],
  [/^DLCO\s*(?:SB)?\b/i,'DLCO_SB'],[/^KCO\s*(?:SB)?\b/i,'KCO_SB'],
  [/^VA\s*(?:SB)?\b/i,'VA_SB'],[/^TLC\s*SB\b/i,'TLC_SB'],
  [/^FRC\s*SB\b/i,'FRC_SB'],[/^ERV\s*SB\b/i,'ERV_SB'],
  [/^RV\s*SB\b/i,'RV_SB'],[/^VIN\s*SB\b/i,'VIN_SB'],
  [/^(?:MMEF|MFEF)\s*75\s*[-–]\s*25\b/i,'MMEF75_25'],
  [/^FEF\s*75\b/i,'FEF75'],
  [/^sR\s*eff\b/i,'sR_eff'],[/^R\s*eff\b/i,'R_eff'],
  [/^FRC\s*pleth\b/i,'FRCpleth'],[/^VC\s*IN\b/i,'VC_IN'],
  [/^FEV\s*[1Il]\b/i,'FEV1'],[/^FVC\b/i,'FVC'],
  [/^TLC\b/i,'TLC'],[/^RV\b/i,'RV'],[/^PEF\b/i,'PEF'],[/^PIF\b/i,'PIF'],[/^Hb\b/i,'Hb'],[/^TA\b/i,'TA']
 ];
 const volume=new Set(['FVC','FEV1','TLC','RV','FRCpleth','VC_IN','TLC_SB','RV_SB','VA_SB','VIN_SB','FRC_SB','ERV_SB','PEF','PIF']);
 const ratio=new Set(['RV_TLC','RV_TLC_SB','FEV1_FVC']);
 const normal=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[₁]/g,'1').replace(/[−‐‑]/g,'-').replace(/_/g,' ').trim();
 const numeric=s=>Number(s.replace(',','.'));
 const decimal=/^([+-]?\d{1,3}[.,]\d{1,4})(?=\s|$)/;
 function identify(line){
  // Fuehrende OCR-Dekoration entfernen, keine beliebigen Worte ueberspringen.
  let t=normal(line).replace(/^(?:[+*|~<>\-•.,;:!]|\d)\s+/,'').replace(/^[’'"`]+\s*/,'');
  for(const [pattern,code] of names){const m=t.match(pattern);if(m)return {code,tail:t.slice(m[0].length).trim()};}
  return null;
 }
 function parse(text){
  const candidates=new Map(),warnings=[],completeCodes=new Set();
  const lines=normal(text).split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,3000);
  for(const line of lines){
   const row=identify(line);if(!row)continue;
   // Beide ersten Spalten muessen direkt nach dem Parameternamen stehen.
   const m1=row.tail.match(decimal);if(!m1)continue;
   const rest=row.tail.slice(m1[0].length).trim();const m2=rest.match(decimal);if(!m2)continue;
   const predicted=numeric(m1[1]),actual=numeric(m2[1]);
   if(!Number.isFinite(predicted)||!Number.isFinite(actual)||predicted<=0||actual<0)continue;
   const limit=ratio.has(row.code)?120:volume.has(row.code)?25:row.code==='Hb'?30:row.code==='sR_eff'||row.code==='R_eff'||row.code==='KCO_SB'||row.code==='KCOc_SB'?20:150;
   if(predicted>limit||actual>limit)continue;
   // Nur dann Teilvorschlag, wenn die Prozentangabe fehlt oder unleserlich ist.
   const third=rest.slice(m2[0].length).trim().match(/^([+-]?\d{1,4}(?:[.,]\d{1,4})?)(?=\s|$)/);
   const percentage=third?numeric(third[1]):null;
   const complete=percentage!==null&&percentage>=0&&percentage<=400&&Math.abs(actual/predicted*100-percentage)<=Math.max(1.5,percentage*.022);
   if(complete){completeCodes.add(row.code);continue;} // Vollstaendige Zeile hat Vorrang.
   const entry={code:row.code,predicted,actual,percent:null,z:null,source:line.slice(0,180),confidence:'Teilwerte, Prozent unklar; Original pruefen'};
   const key=predicted+'|'+actual;
   const group=candidates.get(row.code)||new Map();group.set(key,entry);candidates.set(row.code,group);
  }
  const rows=[];
  for(const [code,choices] of candidates){
   if(completeCodes.has(code))continue;
   if(choices.size!==1){warnings.push(code+': widerspruechliche Soll/Ist-Lesungen. Keine Vorausfuellung.');continue;}
   rows.push([...choices.values()][0]);
  }
  if(rows.length)warnings.push(rows.length+' Messwertzeile(n) nur teilweise ausgelesen: Prozentwerte fehlen oder sind unzuverlaessig. Ausschliesslich lesbare Soll-/Ist-Zahlen wurden als UNBESTAETIGTE Vorschlaege eingesetzt.');
  return {rows,warnings};
 }
 const api=Object.freeze({parse});
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.PNEUMOPRO_PARSER370=api;
})(typeof window!=='undefined'?window:globalThis);
