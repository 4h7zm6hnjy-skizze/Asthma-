'use strict';
/* PneumoPro 3.6.7: Spaltenbezogene, vorsichtige OCR-Pruefung.
 * Nutzt echte Wortkoordinaten der lokalen Tesseract-Erkennung.
 * Schreibt keine Gesundheitsdaten und uebertraegt nichts ins Netz.
 * Nur eindeutig mehrfach bestaetigte Tabellenpositionen werden als UNBESTAETIGTE Vorschlaege gezeigt.
 */
(function(root){
 const patterns=[
  [/^RV\s*\/\s*TLC\s*(?:SB|single\s*breath)\b/i,'RV_TLC_SB'],
  [/^(?:DLCOc\s*SB|DLCO\s*corrected)\b/i,'DLCOcSB'],
  [/^(?:KCOc\s*SB|KCO\s*corrected)\b/i,'KCOc_SB'],
  [/^DLCO\s*(?:_?SB)?\b/i,'DLCO_SB'],[/^KCO\s*(?:_?SB)?\b/i,'KCO_SB'],
  [/^VA\s*(?:_?SB)?\b/i,'VA_SB'],[/^TLC\s*SB\b/i,'TLC_SB'],
  [/^FRC\s*SB\b/i,'FRC_SB'],[/^ERV\s*SB\b/i,'ERV_SB'],
  [/^RV\s*SB\b/i,'RV_SB'],[/^VIN\s*SB\b/i,'VIN_SB'],
  [/^RV\s*(?:\/|%)\s*TLC\b/i,'RV_TLC'],
  [/^FEV\s*1\s*(?:\/|%)\s*FVC\b/i,'FEV1_FVC'],
  [/^(?:MMEF|MFEF)\s*75\s*[-–]\s*25\b/i,'MMEF75_25'],
  [/^FEF\s*75\b/i,'FEF75'],[/^sR\s*eff\b/i,'sR_eff'],
  [/^R\s*eff\b/i,'R_eff'],[/^FRC\s*pleth\b/i,'FRCpleth'],
  [/^VC\s*IN\b/i,'VC_IN'],[/^FEV\s*1\b/i,'FEV1'],
  [/^FVC\b/i,'FVC'],[/^TLC\b/i,'TLC'],[/^RV\b/i,'RV'],
  [/^PEF\b/i,'PEF'],[/^PIF\b/i,'PIF'],[/^Hb\b/i,'Hb'],[/^TA\b/i,'TA']
 ];
 const diffusion=new Set(['DLCO_SB','KCO_SB','VA_SB','Hb','DLCOcSB','KCOc_SB','TA','VIN_SB','TLC_SB','FRC_SB','ERV_SB','RV_SB','RV_TLC_SB']);
 const normal=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[₁]/g,'1').replace(/_/g,' ').replace(/[−‐‑]/g,'-').trim();
 function numeric(s){const v=String(s||'').trim().replace('%','').replace(',','.');return /^[+-]?\d{1,4}(?:\.\d{1,4})?$/.test(v)&&Number.isFinite(Number(v))?Number(v):null;}
 function labelOf(s){let val=normal(s).replace(/^[|·•\s-]+/,'');for(const [rx,code] of patterns){const m=val.match(rx);if(m)return {code,label:m[0]};}return null;}
 function plausible(code,pred,act,percent){if(pred<=0||act<0||percent<0||percent>400)return false;
  let max=150;
  if(['FEV1','FVC','VC_IN','TLC','RV','FRCpleth','TLC_SB','FRC_SB','RV_SB','VIN_SB','VA_SB','ERV_SB','PEF','PIF'].includes(code))max=25;
  if(['Hb'].includes(code))max=30;
  if(['sR_eff','R_eff','KCO_SB','KCOc_SB'].includes(code))max=20;
  if(pred>max||act>max)return false;
  return Math.abs(100*act/pred-percent)<=Math.max(2.1,percent*.032);
 }
 function readWords(tsv){const pages=new Map();let count=0;
  for(const line of String(tsv||'').split(/\r?\n/).slice(1)){
   if(count>13000)break;const f=line.split('\t');if(f.length<12||f[0]!=='5')continue;
   const word=normal(f.slice(11).join('\t'));if(!word)continue;
   const page=+f[1]||1,x=+f[6],y=+f[7],w=+f[8],h=+f[9];
   if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)continue;
   const arr=pages.get(page)||[];arr.push({text:word,x,y,w,h,midY:y+h/2,right:x+w,conf:Number(f[10])});pages.set(page,arr);count++;
  }
  return pages;
 }
 function visualLines(pages){let result=[];
  for(const [page,words] of pages){
   const sorted=[...words].sort((a,b)=>a.midY-b.midY||a.x-b.x);
   const hs=sorted.map(x=>x.h).sort((a,b)=>a-b),median=hs[Math.floor(hs.length/2)]||16;
   const tolerance=Math.max(4,Math.min(17,median*.54));
   const groups=[];
   for(const word of sorted){let row=null,best=Infinity;
    for(const g of groups){const diff=Math.abs(g.cy-word.midY);if(diff<=tolerance && diff<best){best=diff;row=g;}}
    if(!row){row={page,cy:word.midY,words:[]};groups.push(row);}row.words.push(word);
    row.cy=row.words.reduce((a,b)=>a+b.midY,0)/row.words.length;
   }
   for(const row of groups){row.words.sort((a,b)=>a.x-b.x);row.text=row.words.map(w=>w.text).join(' ');result.push(row);}
  }
  return result.sort((a,b)=>a.page-b.page||a.cy-b.cy);
 }
 function rowMetrics(row){const L=labelOf(row.text);if(!L)return null;
  // Der Name kann aus mehreren OCR-Woertern bestehen, z.B. "FEV 1 / FVC".
  let prefix='';let cut=0;
  for(let k=0;k<row.words.length;k++){
   prefix+=(k?' ':'')+row.words[k].text;cut=k+1;
   const p=normal(prefix).replace(/^[|·•\s-]+/,'');if(p.length>=L.label.length && (p.toLowerCase()===L.label.toLowerCase()||p.toLowerCase().startsWith(L.label.toLowerCase()+' ')))break;
  }
  const nums=[];
  for(const w of row.words.slice(cut)){
   const n=numeric(w.text);if(n!==null)nums.push({n,right:w.right,x:w.x,word:w.text,conf:w.conf});
  }
  const candidates=[];
  for(let a=0;a<nums.length-2;a++)for(let b=a+1;b<nums.length-1;b++)for(let c=b+1;c<nums.length;c++){
   if(c-a>6)continue;
   const p=nums[a],v=nums[b],pct=nums[c];if(!plausible(L.code,p.n,v.n,pct.n))continue;
   candidates.push({i:a,j:b,k:c,predicted:p.n,actual:v.n,percent:pct.n,
    x:[p.right,v.right,pct.right],err:Math.abs(100*v.n/p.n-pct.n),
    tail:nums.slice(c+1)});
  }
  return {code:L.code,label:L.label,source:row.text,nums,candidates,page:row.page};
 }
 function parseTSV(tsv,fullText=''){
  const lines=visualLines(readWords(tsv));const found=lines.map(rowMetrics).filter(Boolean),warnings=[];
  const pages=new Set(found.map(r=>r.page));
  const codes=new Set(found.map(r=>r.code));
  const all=found.flatMap(r=>r.candidates.map(c=>({row:r,c})));
  const span=visualLines(readWords(tsv)).flatMap(r=>r.words).reduce((a,w)=>Math.max(a,w.right),1);
  const tol=Math.max(15,Math.min(55,span*.022));
  const d=(a,b)=>Math.max(...a.map((v,i)=>Math.abs(v-b[i])));
  const groups=[];
  for(const v of all){
   let group=groups.find(g=>g.page===v.row.page&&d(v.c.x,g.x)<=tol);
   if(!group){group={page:v.row.page,x:[...v.c.x],all:[]};groups.push(group);}group.all.push(v);
  }
  for(const g of groups){g.codes=new Set(g.all.map(v=>v.row.code));g.count=g.codes.size;g.error=g.all.reduce((a,v)=>a+v.c.err,0)/g.all.length;}
  const ranked=groups.sort((a,b)=>b.count-a.count||a.error-b.error);
  let best=ranked[0]||null;
  if(best?.count<2)best=null;
  if(best){
   const similar=ranked.find(g=>g!==best&&g.page===best.page&&g.count>=best.count&&d(g.x,best.x)>tol);
   if(similar)best=null;
  }
  let rows=[];
  if(best){const seen=new Map();
   for(const row of found.filter(r=>r.page===best.page)){
    const candidates=row.candidates.filter(c=>d(c.x,best.x)<=tol).sort((a,b)=>d(a.x,best.x)-d(b.x,best.x)||a.err-b.err);
    if(!candidates.length)continue;
    if(candidates.length>1&&d(candidates[0].x,best.x)+tol*.25>=d(candidates[1].x,best.x))continue;
    if(seen.has(row.code)){seen.set(row.code,null);continue;}
    const c=candidates[0];const after=c.tail;
    const z=after.length===1&&after[0].n>=-9&&after[0].n<=9?after[0].n:null;
    seen.set(row.code,{code:row.code,predicted:c.predicted,actual:c.actual,percent:c.percent,z,source:row.source,confidence:'räumlich und rechnerisch geprüft'});
   }
   rows=[...seen.values()].filter(Boolean);
  }
  let dates=(root.PNEUMOPRO_PARSER366?.parse(fullText)?.date)||'';
  if(!dates){
   const match=String(fullText||'').match(/(?:Messdatum|Untersuchungsdatum|Testdatum)[^\d]{0,45}(\d{1,2})[./](\d{1,2})[./](\d{2}|20\d{2})\b/i);
   if(match){
    const year=match[3].length===2?'20'+match[3]:match[3];
    const proposed=year+'-'+match[2].padStart(2,'0')+'-'+match[1].padStart(2,'0');
    const dt=new Date(proposed+'T12:00:00Z');
    if(!Number.isNaN(dt.getTime())&&dt.toISOString().slice(0,10)===proposed)dates=proposed;
   }
  }
  if(!found.length)warnings.push('Keine beschrifteten Tabellenzeilen in den Bildpositionen erkannt.');
  else if(!best)warnings.push(found.length+' benannte Tabellenzeilen, aber keine eindeutigen wiederholten Spaltenpositionen. Zahlen werden nicht vorausgefüllt.');
  else if(rows.length<codes.size)warnings.push((codes.size-rows.length)+' Tabellenwerte sind räumlich nicht eindeutig und bleiben leer.');
  if(rows.length)warnings.push('Messwerte aus echten Bildpositionen abgeleitet. Alle OCR-Vorschläge unbedingt mit dem Original vergleichen.');
  const kinds=new Set(rows.map(r=>diffusion.has(r.code)?'diffusion':'measurements'));
  if(kinds.size>1)warnings.push('Unterschiedliche Testarten erkannt: einzeln erfassen.');
  return {rows,date:dates,kind:kinds.size===1?[...kinds][0]:'',warnings,sourceLines:lines.length,diagnostics:{recognized:found.length,candidateTriples:all.length,matched:rows.length,pages:[...pages].length}};
 }
 const api=Object.freeze({parseTSV,readWords,visualLines});
 if(typeof module==='object'&&module.exports)module.exports=api;else root.PNEUMOPRO_PARSER367=api;
})(typeof window!=='undefined'?window:globalThis);
