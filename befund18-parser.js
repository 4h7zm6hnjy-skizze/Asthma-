'use strict';
/* Berichtserkennung: spaltenbewusste Prüfangebote, keine Diagnose, kein Netzwerk. */
(function(root){
 const defs={
  fev1:{label:'FEV₁',unit:'l'},fvcEx:{label:'FVC exspiratorisch',unit:'l'},fvcIn:{label:'FVC inspiratorisch',unit:'l'},vc:{label:'VC',unit:'l'},
  ratio:{label:'FEV₁/FVC',unit:'%'},ratioVC:{label:'FEV₁/VC',unit:'%'},pef:{label:'PEF',unit:'l/s'},tLC:{label:'TLC',unit:'l'},rV:{label:'RV',unit:'l'},
  mef25:{label:'MEF25',unit:'l/s'},mef50:{label:'MEF50',unit:'l/s'},mef75:{label:'MEF75',unit:'l/s'},
  raw:{label:'Raw',unit:'kPa/(l/s)'},sRaw:{label:'sRaw',unit:'kPa·s'},tgv:{label:'TGV',unit:'l'},fvcex:{label:'FVC exspiratorisch',unit:'l'}
 };
 const decimal=s=>Number(String(s||'').replace(',','.'));
 const round=(n,d=2)=>Math.round(n*10**d)/10**d;
 const normalize=s=>s.replace(/\bFEVI\b/ig,'FEV1').replace(/\bFEVIFV/ig,'FEV1/FV').replace(/\bPEW\b/ig,'PEF').replace(/[₁]/g,'1').replace(/\u00a0/g,' ');
 function identify(line){let s=normalize(line.trim()).replace(/^[-| \t]+/,'');
  let m=s.match(/^(FEV\s*1\s*[\/]\s*FVC|FEV\s*1\s*FVC|FEV\s*1\s*[\/]\s*VC|FEV\s*1\s*VC)(?=\s|\b)/i);
  if(m)return{key:/FVC/i.test(m[1])?'ratio':'ratioVC',rest:s.slice(m[0].length)};
  m=s.match(/^(FVC\s*(?:ex|exp|ed|e\b|in|insp|i\b)?|FEV\s*1|VC\b|PEF\b|MEF\s*(?:25|50|75)|TLC\b|RV\b|TGV\b|sRaw(?:tot)?\b|Raw(?:tot)?\b)(?=\b|\s|[\d(])/i);
  if(!m)return null;let label=m[1].replace(/\s+/g,'').toLowerCase(),key='';
  if(label.startsWith('fev'))key='fev1';else if(label.startsWith('fvc'))key=/in|insp/.test(label)?'fvcIn':'fvcEx';
  else if(label==='vc')key='vc';else if(label.startsWith('mef'))key=label;else if(label.startsWith('sraw'))key='sRaw';
  else if(label.startsWith('raw'))key='raw';else if(label==='tlc')key='tLC';else if(label==='rv')key='rV';else if(label==='tgv')key='tgv';else if(label==='pef')key='pef';
  if(!defs[key])return null;return {key,rest:s.slice(m[0].length)};
 }
 function datesFrom(text){
  const lines=text.split(/\n/),matches=[];
  for(let i=0;i<lines.length;i++){
   const line=lines[i];if(/geburt|born|birth|geboren/i.test(line))continue;
   for(const m of line.matchAll(/\b(\d{1,2})[./](\d{1,2})[./](20\d{2})\b|\b(20\d{2})-(\d{2})-(\d{2})\b/g)){
    const d=m[4]?`${m[4]}-${m[5]}-${m[6]}`:`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
    const test=new Date(d+'T12:00:00Z');if(Number.isNaN(test.getTime())||test.toISOString().slice(0,10)!==d)continue;
    matches.push({date:d,score:/getestet|testdatum|untersuchung|messung|test date|date of test|test performed/i.test(line)?4:/datum|date/i.test(line)?2:1});
   }
  }
  matches.sort((a,b)=>b.score-a.score);return matches[0]?.date||'';
 }
 function parseRow(key,rest,phase,line){
  const text=normalize(rest).replace(/\b(\d)[oO]\b/g,'$10');
  const pairs=[...text.matchAll(/(\d{1,3}(?:[.,]\d{1,3})?)\s+(\d{1,3})\s*%/g)].map(m=>({measured:decimal(m[1]),percent:decimal(m[2]),start:m.index}));
  const pair=pairs.find(x=>x.percent>=0&&x.percent<=500&&x.measured>=0&&x.measured<=(!['ratio','ratioVC'].includes(key)?30:120));
  let predicted=null,measured=null,pct=null,confidence='niedrig';const warnings=[];
  if(pair){measured=pair.measured;pct=pair.percent;const before=text.slice(0,pair.start);const v=[...before.matchAll(/(?:^|[\s(])([0-9]+[.,][0-9]{1,3})(?=\s|\b)/g)].map(m=>decimal(m[1]));
   predicted=v.length?v.at(-1):null;confidence='mittel';
   if(predicted>0&&!['ratio','ratioVC'].includes(key)&&Math.abs(round(100*measured/predicted,0)-pct)<=3){confidence='hoch';}
   else if(predicted>0&&['ratio','ratioVC'].includes(key)&&Math.abs(round(100*measured/predicted,0)-pct)<=3){confidence='hoch';}
   else {if(predicted!==null)warnings.push('Soll-/Ist-/Prozentwerte nicht sicher rechnerisch konsistent – Original kontrollieren.');predicted=null;}
   if(['ratio','ratioVC'].includes(key)&&predicted===null){const target=text.slice(0,pair.start).match(/(?:^|\s)([5-9]\d|100)(?=\s)/);if(target){predicted=Number(target[1]);if(Math.abs(100*measured/predicted-pct)<=3)confidence='hoch';}}
  }else{
   // Alternative Befundform: FEV1 Ist 2,52 l, Soll 4,66 l, 54% vom Soll
   const ist=text.match(/(?:ist|gemessen|pre|vor|measured|best|actual)\s*[:=]?\s*(\d{1,3}(?:[.,]\d{1,3})?)/i);
   const soll=text.match(/(?:soll|pred(?:icted)?)\s*[:=]?\s*(\d{1,3}(?:[.,]\d{1,3})?)/i);
   const pro=text.match(/(\d{1,3}(?:[.,]\d+)?)\s*%\s*(?:vom\s*)?(?:soll|pred(?:icted)?)?/i);
   if(ist)measured=decimal(ist[1]);if(soll)predicted=decimal(soll[1]);if(pro)pct=decimal(pro[1]);
   if(measured!==null&&pct!==null)confidence='mittel';
   if(measured!==null&&predicted!==null&&pct!==null&&Math.abs(100*measured/predicted-pct)<=3)confidence='hoch';
  }
  const ratio=['ratio','ratioVC'].includes(key);
  if(ratio){if(measured!==null&&measured<=1.05){measured=round(measured*100,1);}if(measured!==null&&measured>100)measured=null;}
  if(measured===null||!Number.isFinite(measured))return null;
  if(!ratio&&measured>12&&key!=='raw'&&key!=='sRaw')return null;
  if(pct!==null&&(pct<0||pct>400))pct=null;
  if(phase==='unbekannt')warnings.push('Messphase im Befund nicht eindeutig angegeben.');
  return {key,label:defs[key].label,unit:defs[key].unit,phase,measured,predicted,pct,confidence,line:line.slice(0,160),warnings};
 }
 function report(text){
  text=normalize(String(text||'').slice(0,35000));const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),records=[],warnings=[];
  let phase='unbekannt';
  for(const line of lines){
   if(/%\s*(?:Soll|pred)/i.test(line)&&/\bPre\b/i.test(line)&&!/\bPost\b/i.test(line))phase='vor';
   if(/%\s*(?:Soll|pred)/i.test(line)&&/\bPre\b/i.test(line)&&/\bPost\b/i.test(line)){warnings.push('Vor- und Nachmessung stehen als getrennte Spalten: bitte jede Phase separat anhand der Originaltabelle erfassen.');phase='unbekannt';}
   if(/^\s*(pre|vor|prae|prä|post|nach)(?:\b|\s*[:])/i.test(line))phase=/post|nach/i.test(line)?'nach':'vor';
   const m=identify(line);if(!m)continue;
   const row=parseRow(m.key,m.rest,phase,line);if(row)records.push(row);
  }
  const preferred={},duplicates=[];
  for(const r of records){const k=r.key+'-'+r.phase,previous=preferred[k];if(!previous||['niedrig','mittel','hoch'].indexOf(r.confidence)>['niedrig','mittel','hoch'].indexOf(previous.confidence))preferred[k]=r;
   else if(previous&&Math.abs(previous.measured-r.measured)>0.03)duplicates.push(r.label+': mehrere verschiedene Messungen.');}
  if(duplicates.length)warnings.push(...duplicates);
  if(/\(A\).*ATS|nicht\s+gem[aä][ßs]\s+ATS|qualit[aä]t.*nicht|messung.*ung[uü]ltig/i.test(text))warnings.push('Qualitätshinweis im Bericht erkannt: mindestens ein Messwert erfüllt möglicherweise nicht die ATS/ERS-Anforderungen.');
  if(!records.length)warnings.push('Keine zuverlässig zuordenbare Messwertzeile. Übernahme nur anhand des Originals.');
  const rows=Object.values(preferred);
  const fev=rows.find(r=>r.key==='fev1'),fvc=rows.find(r=>r.key==='fvcEx'),ratio=rows.find(r=>r.key==='ratio');
  if(fev&&fvc&&ratio&&Math.abs(100*fev.measured/fvc.measured-ratio.measured)>5)warnings.push('FEV₁/FVC weicht von den Literwerten ab: Messphasen, Messungen und OCR prüfen.');
  if(rows.some(r=>r.confidence!=='hoch'))warnings.push('Einzelne Soll-/Istwerte sind nur unvollständig erkennbar – bitte kontrollieren.');
  return {date:datesFrom(text),rows,warnings:[...new Set(warnings)],textLength:text.length};
 }
 function profileValues(parsed,phase='unbekannt'){
  const rows=(parsed.rows||[]).filter(x=>phase==='unbekannt'||x.phase===phase||x.phase==='unbekannt');
  const find=key=>rows.find(r=>r.key===key&&r.pct!==null);
  const l=key=>rows.find(r=>r.key===key&&r.measured!==null);
  return {fev1:find('fev1')?.pct??null,fvc:find('fvcEx')?.pct??null,
    fev1Liters:l('fev1')?.measured??null,fvcLiters:l('fvcEx')?.measured??null,
    ratio:l('ratio')?.measured??null,date:parsed.date||'',qualityWarnings:parsed.warnings||[]};
 }
 root.ASTHMA_REPORT18=Object.freeze({parse:report,profileValues,defs});
})(typeof window!=='undefined'?window:globalThis);
