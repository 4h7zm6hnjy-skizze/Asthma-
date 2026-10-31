'use strict';
/* PneumoPro 3.6.6 — lokale, vorsichtige OCR-Tabellenzuordnung.
 * Kein Raten unvollstaendiger Zahlen, kein automatischer medizinischer Import.
 * Das uebereinstimmende Soll/Ist/%-Spaltenmuster muss durch mehrere benannte
 * Parameter bestaetigt sein. Original und Nutzerfreigabe bleiben erforderlich. */
(function(root){
 const patterns=[
  [/^RV\s*[\/]\s*TLC\s*(?:SB|single\s*breath)\b/i,'RV_TLC_SB'],
  [/^(?:DLCOc\s*SB|DLCO\s*corrected)\b/i,'DLCOcSB'],
  [/^(?:KCOc\s*SB|KCO\s*corrected)\b/i,'KCOc_SB'],
  [/^DLCO\s*(?:SB)?\b/i,'DLCO_SB'],[/^KCO\s*(?:SB)?\b/i,'KCO_SB'],
  [/^VA\s*(?:SB)?\b/i,'VA_SB'],[/^TLC\s*SB\b/i,'TLC_SB'],
  [/^FRC\s*SB\b/i,'FRC_SB'],[/^ERV\s*SB\b/i,'ERV_SB'],
  [/^RV\s*SB\b/i,'RV_SB'],[/^VIN\s*SB\b/i,'VIN_SB'],
  [/^RV\s*(?:[\/]|%)\s*TLC\b/i,'RV_TLC'],
  [/^FEV\s*1\s*(?:[\/]|%)\s*FVC\b/i,'FEV1_FVC'],
  [/^(?:MMEF|MFEF)\s*75\s*[-–]\s*25\b/i,'MMEF75_25'],
  [/^FEF\s*75\b/i,'FEF75'],[/^sR\s*eff\b/i,'sR_eff'],
  [/^R\s*eff\b/i,'R_eff'],[/^FRC\s*pleth\b/i,'FRCpleth'],
  [/^VC\s*IN\b/i,'VC_IN'],[/^FEV\s*1\b/i,'FEV1'],
  [/^FVC\b/i,'FVC'],[/^TLC\b/i,'TLC'],[/^RV\b/i,'RV'],
  [/^PEF\b/i,'PEF'],[/^PIF\b/i,'PIF'],[/^Hb\b/i,'Hb'],[/^TA\b/i,'TA']
 ];
 const diffusion=new Set(['DLCO_SB','KCO_SB','VA_SB','Hb','DLCOcSB','KCOc_SB','TA','VIN_SB','TLC_SB','FRC_SB','ERV_SB','RV_SB','RV_TLC_SB']);
 function norm(s){return String(s||'').replace(/\u00a0/g,' ').replace(/[₁]/g,'1').replace(/_/g,' ').replace(/[‐‑−]/g,'-').trim();}
 function numeric(s){let v=String(s).replace(',','.');return /^[+-]?\d{1,4}(?:\.\d{1,4})?$/.test(v)&&Number.isFinite(+v)?+v:null;}
 const validDate=s=>{if(!/^20\d{2}-\d\d-\d\d$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return !Number.isNaN(+d)&&d.toISOString().slice(0,10)===s;};
 function values(text){const found=[];for(const m of text.matchAll(/(^|[\s\t(\[|;:])([+-]?\d{1,4}(?:[.,]\d{1,4})?)(?=\s|[%)]|$|[|;\]])/g)){const value=numeric(m[2]);if(value!==null)found.push(value);}return found.slice(0,14);}
 function candidates(code,nums){let out=[];if(nums.length<3||nums.length>12)return out;
  for(let i=0;i<nums.length-2;i++)for(let j=i+1;j<Math.min(nums.length-1,i+4);j++)for(let k=j+1;k<Math.min(nums.length,i+6);k++){
   if(k-i>5)continue;const predicted=nums[i],actual=nums[j],percent=nums[k];
   if(predicted<=0||predicted>150||actual<0||actual>150||percent<0||percent>400)continue;
   if(!['FEV1_FVC','RV_TLC','RV_TLC_SB'].includes(code)&&actual>40)continue;
   if(code==='Hb'&&(predicted>30||actual>30))continue;
   if(['TLC','RV','FVC','FEV1','TLC_SB','RV_SB','FRCpleth','FRC_SB','VIN_SB','VC_IN'].includes(code)&&(predicted>20||actual>20))continue;
   const err=Math.abs(actual/predicted*100-percent),limit=Math.max(1.75,percent*.032);
   if(err>limit)continue;
   out.push({i,j,k,predicted,actual,percent,err});
  }
  return out;
 }
 function rowOf(line){const l=norm(line).replace(/^[|·•\s-]+/,'');for(const [pat,code] of patterns){const m=l.match(pat);if(m)return {code,source:line,nums:values(l.slice(m[0].length))};}return null;}
 function parse(raw){const lines=norm(raw).split(/\r?\n/).map(v=>v.trim()).filter(Boolean),warnings=[],dates=new Set();
  const labels=[];let problems=0;const hasHeaders=lines.some(l=>/(?:soll|pred|ref|predicted)/i.test(l))&&lines.some(l=>/(?:ist|actual|meas|best|mess)/i.test(l));
  for(const l of lines){
   if(!/(?:geburtsdatum|geboren|birth|birthday|born)/i.test(l))for(const m of l.matchAll(/\b(20\d\d)[./-](\d\d)[./-](\d\d)\b|\b(\d{1,2})[./](\d{1,2})[./](20\d\d)\b/g)){
    const d=m[1]?`${m[1]}-${m[2]}-${m[3]}`:`${m[6]}-${m[5].padStart(2,'0')}-${m[4].padStart(2,'0')}`;
    if(validDate(d))dates.add(d);
   }
   const row=rowOf(l);if(row){row.options=candidates(row.code,row.nums);labels.push(row);if(!row.options.length)problems++;}
  }
  if(dates.size!==1)warnings.push('Untersuchungsdatum nicht eindeutig erkannt. Bitte am Original kontrollieren.');
  if(!labels.length)warnings.push('Keine benannte Messwertzeile erkannt. Fotoauflösung und Tabellenlayout prüfen.');
  // Gleiche relative Spaltenpositionen ueber mindestens zwei unterschiedliche
  // Befundparameter belegen; mathematisch passende Zufallstripel reichen nicht.
  const counts=new Map();for(const row of labels){for(const c of row.options){const key=`${c.i}:${c.j}:${c.k}`;const members=counts.get(key)||new Set();members.add(row.code);counts.set(key,members);}}
  const ranked=[...counts.entries()].map(([key,members])=>({key,count:members.size})).sort((a,b)=>b.count-a.count);
  const primary=ranked[0]&&ranked[0].count>=2&&(!ranked[1]||ranked[0].count>ranked[1].count)?ranked[0].key:null;
  const picked=[],duplicateCodes=new Set();const seen=new Set();
  for(const row of labels){let option=null;
   // Bei drei OCR-Zahlen gibt es nur einen moeglichen Dreierblock. Wenn er
   // mathematisch konsistent ist, darf er auch ohne gesonderte Kopfzeile in
   // die *ungepruefte* Vorschau, weil kein Spaltenversatz moeglich ist.
   if(row.nums.length===3&&row.options.length===1)option=row.options[0];
   else if(primary)option=row.options.find(c=>`${c.i}:${c.j}:${c.k}`===primary)||null;
   if(!option){problems++;continue;}
   if(seen.has(row.code)){duplicateCodes.add(row.code);continue;}seen.add(row.code);
   let z=null;let tail=row.nums.slice(option.k+1);if(tail.length===1&&tail[0]>=-9&&tail[0]<=9)z=tail[0];
   picked.push({code:row.code,predicted:option.predicted,actual:option.actual,percent:option.percent,z,source:row.source,confidence:primary?'spaltengeprüft':'arithmetisch geprüft'});
  }
  const rows=picked.filter(r=>!duplicateCodes.has(r.code));
  if(duplicateCodes.size)warnings.push('Doppelte Messwertnamen: '+[...duplicateCodes].join(', ')+'. Keine automatische Zuordnung dieser Zeilen.');
  if(problems)warnings.push(problems+' Tabellenzeile(n) nicht eindeutig erkannt; diese Felder bleiben leer.');
  if(!primary&&labels.some(r=>r.nums.length>3))warnings.push('Mehrspaltige Tabelle ohne eindeutig wiederholbares Spaltenmuster. Bitte Soll, Ist und Prozent manuell prüfen.');
  if(!rows.length)warnings.push('Keine Messwertzeile sicher auslesbar. Bitte Original in ChatGPT prüfen lassen oder Werte manuell eintragen.');
  const kinds=new Set(rows.map(r=>diffusion.has(r.code)?'diffusion':'measurements'));
  const kind=kinds.size===1?[...kinds][0]:'';
  if(kinds.size>1)warnings.push('Lungenfunktion und Diffusion vermischt: bitte jeden Test getrennt zuordnen.');
  if(rows.length&&(!hasHeaders||!primary))warnings.push('Werte sind nur OCR-Vorschläge anhand benannter Zeilen und rechnerischer Plausibilität. Spalten und Einheiten unbedingt am Original prüfen.');
  return {rows,date:dates.size===1?[...dates][0]:'',kind,warnings,sourceLines:lines.length};
 }
 // Rekonstruiert Wortreihenfolge je optischer Tabellenzeile aus Tesseract-TSV;
 // nur lokale Zweitansicht, kein Bild- oder Kurvenersatz.
 function tsvText(tsv){const grouped=new Map();for(const l of String(tsv||'').split(/\r?\n/).slice(1)){
  const f=l.split('\t');if(f.length<12||f[0]!=='5')continue;const word=f.slice(11).join(' ').trim();if(!word)continue;
  const key=f.slice(1,5).join('-'),left=+f[6]||0,top=+f[7]||0;
  if(!grouped.has(key))grouped.set(key,{left,top,words:[]});
  const row=grouped.get(key);row.top=Math.min(row.top,top);row.words.push({left,word});
 }
 return [...grouped.values()].sort((a,b)=>a.top-b.top||a.left-b.left).map(r=>r.words.sort((a,b)=>a.left-b.left).map(w=>w.word).join(' ')).join('\n').slice(0,60000);
 }
 const api=Object.freeze({parse,tsvText});if(typeof module==='object'&&module.exports)module.exports=api;else root.PNEUMOPRO_PARSER366=api;
})(typeof window!=='undefined'?window:globalThis);
