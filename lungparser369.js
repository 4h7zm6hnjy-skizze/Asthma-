'use strict';
/* PneumoPro 3.6.9: OCR text across multiple attempts, no fabricated measurements.
 * Only exact, independently readable decimals with internally consistent
 * Soll/Ist/% are prefills. All rows stay UNCONFIRMED until user approval.
 * Never sends document contents to any service. */
(function(root){
  const D=[
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
    [/^TLC\b/i,'TLC'],[/^RV\b/i,'RV'],
    [/^PEF\b/i,'PEF'],[/^PIF\b/i,'PIF'],[/^Hb\b/i,'Hb'],[/^TA\b/i,'TA']
  ];
  const diffusion=new Set(['DLCO_SB','KCO_SB','VA_SB','Hb','DLCOcSB','KCOc_SB','TA','VIN_SB','TLC_SB','FRC_SB','ERV_SB','RV_SB','RV_TLC_SB']);
  const dec=s=>{const n=Number(String(s).replace(',','.'));return Number.isFinite(n)?n:null;};
  const signedNumber=/[+-]?\d{1,3}(?:[.,]\d{1,4})?/g;
  const isDate=s=>{if(!/^20\d\d-\d\d-\d\d$/.test(s))return false;const v=new Date(s+'T12:00:00Z');return !Number.isNaN(+v)&&v.toISOString().slice(0,10)===s;};
  function datesOf(lines){
    const matched=new Map();
    for(const line of lines){
      if(/(?:geburt|birth|alter|age)/i.test(line))continue;
      const score=/(?:messdatum|untersuchungsdatum|testdatum|messung am|test date)/i.test(line)?5:/(?:datum|date)/i.test(line)?2:1;
      for(const m of line.matchAll(/\b(20\d\d)[.\-/](\d\d)[.\-/](\d\d)\b|\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2}|20\d\d)\b/g)){
        const yy=m[1]?m[1]:(m[6].length===2?'20'+m[6]:m[6]);
        const month=m[1]?m[2]:m[5].padStart(2,'0');
        const day=m[1]?m[3]:m[4].padStart(2,'0');
        const date=yy+'-'+month+'-'+day;
        if(isDate(date))matched.set(date,Math.max(score,matched.get(date)||0));
      }
    }
    const rank=[...matched.entries()].sort((a,b)=>b[1]-a[1]);
    return rank.length&&(!rank[1]||rank[0][1]>rank[1][1])?rank[0][0]:'';
  }
  function strictNumericTokens(tail){
    const tokens=[];
    for(const token of tail.split(/\s+/).slice(0,16)){
      const t=token.replace(/^[\[({|]+|[\])}|;,]+$/g,'').replace(/%$/,'').replace(/\.$/,'');
      if(/^[+-]?\d{1,3}(?:[.,]\d{1,4})?$/.test(t))tokens.push({value:dec(t),raw:t});
      else if(tokens.length>=3)break; // unrelated graph text after complete triplet
    }
    return tokens;
  }
  function plausible(code,p,a,pct){
    if(p<=0||a<0||pct<0||pct>400)return false;
    const ratio=['FEV1_FVC','RV_TLC','RV_TLC_SB'].includes(code);
    let max=ratio?120:150;
    if(['FEV1','FVC','VC_IN','TLC','RV','FRCpleth','TLC_SB','FRC_SB','RV_SB','VIN_SB','VA_SB','ERV_SB','PEF','PIF'].includes(code))max=25;
    if(code==='Hb')max=30;
    if(['sR_eff','R_eff','KCO_SB','KCOc_SB'].includes(code))max=20;
    if(p>max||a>max)return false;
    return Math.abs(100*a/p-pct)<=Math.max(1.5,pct*.022);
  }
  function parse(raw){
    const lines=String(raw||'').replace(/\u00a0/g,' ').replace(/[₁]/g,'1').replace(/[−‐‑]/g,'-').split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,2500);
    const warnings=[];const date=datesOf(lines),hits=new Map();let suspicious=0,recognized=0;
    for(const line of lines){
      // At most two errant single-character columns before the named parameter.
      // Do not match numbers or unrelated text as measurement names.
      const cleaned=line.replace(/^(?:[0-9+*|~<>\-•.,;:!]\s*){0,2}/,'');
      let found=null;for(const [rx,code] of D){const m=cleaned.match(rx);if(m){found={code,tail:cleaned.slice(m[0].length).trim()};break;}}
      if(!found)continue;recognized++;
      const nums=strictNumericTokens(found.tail);
      // The first three well-formed columns are Predicted, Actual, Percent.
      // A missing decimal point is deliberately NOT repaired or computed.
      if(nums.length<3||!nums.slice(0,2).every(x=>x.raw.includes('.')||x.raw.includes(','))){suspicious++;continue;}
      const [pred,actual,percent,z]=nums;
      if(!plausible(found.code,pred.value,actual.value,percent.value)){suspicious++;continue;}
      const row={code:found.code,predicted:pred.value,actual:actual.value,percent:percent.value,z:z&&z.value>=-9&&z.value<=9?z.value:null,source:line.slice(0,180),confidence:'arithmetisch und anhand der OCR-Zeile geprüft'};
      const previous=hits.get(found.code)||[];
      if(!previous.some(x=>x.predicted===row.predicted&&x.actual===row.actual&&x.percent===row.percent))previous.push(row);
      hits.set(found.code,previous);
    }
    const rows=[];
    for(const [code,alternatives] of hits){
      if(alternatives.length===1)rows.push(alternatives[0]);
      else warnings.push(code+': unterschiedliche Zahlen in OCR-Durchgängen; keine Vorausfüllung.');
    }
    if(!date)warnings.push('Untersuchungsdatum nicht eindeutig gelesen. Bitte Datum im Original prüfen.');
    if(suspicious)warnings.push(suspicious+' OCR-Tabellenzeile(n) unvollständig, mit fehlenden Dezimalzeichen oder rechnerisch widersprüchlich. Diese Werte bleiben leer.');
    if(!rows.length)warnings.push('Keine vollständig und rechnerisch sicher lesbare Soll/Ist/%-Zeile. Bitte Original prüfen oder ChatGPT zur manuellen Kontrolle verwenden.');
    if(rows.length)warnings.push('Erkannte Zahlen sind Vorschläge, keine bestätigten Messwerte. Jede Spalte und Einheit anhand des Originalfotos kontrollieren.');
    const kinds=new Set(rows.map(r=>diffusion.has(r.code)?'diffusion':'measurements'));
    if(kinds.size>1)warnings.push('Gemischte Testarten: Lungenfunktion und Diffusion getrennt erfassen.');
    return {rows,date,kind:kinds.size===1?[...kinds][0]:'',warnings,sourceLines:lines.length,diagnostics:{recognized,valid:rows.length,suspicious}};
  }
  const api=Object.freeze({parse});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PNEUMOPRO_PARSER369=api;
})(typeof window!=='undefined'?window:globalThis);
