'use strict';
/* Regeln für gesichtete OCR-Vorschläge. Diagnose und automatische Freigabe ausgeschlossen. */
(function(root){
  const FIELDS=['fev1Percent','fvcPercent','fev1Liters','fvcLiters','ratio'];
  const decimal=s=>Number(String(s).replace(/\s/g,'').replace(',','.').replace(/%$/,''));
  const plausible=(key,n)=>Number.isFinite(n)&&n>=0&&(
    ['fev1Percent','fvcPercent','ratio'].includes(key)?n<=100:n<=12);
  function metric(line){
    const t=line.replace(/[₁₀]/g,x=>x==='₁'?'1':'0').replace(/[|]/g,'I');
    let m=t.match(/^\s*(FEV\s*[1Il]\s*\/\s*FVC|FEV\s*[1Il]\s*%\s*FVC|FEV\s*[1Il]\s*\/\s*VC)\b\s*[:=]?\s*(.*)$/i);
    if(m)return {key:'ratio',tail:m[2]};
    m=t.match(/^\s*(FEV\s*[1Il]|FEV1\.0)\b\s*[:=]?\s*(.*)$/i);
    if(m)return {key:'fev1',tail:m[2]};
    m=t.match(/^\s*(FVC)\b\s*[:=]?\s*(.*)$/i);
    if(m)return {key:'fvc',tail:m[2]};
    return null;
  }
  function header(line){
    return /(?:%\s*(?:soll|pred)|(?:soll|predicted|pred)\b)/i.test(line)&&/(?:\b(?:ist|messwert|meas|actual|best|pre|prae|post)\b|%)/i.test(line)
      && !/^\s*(?:FEV\s*[1Il]|FVC)\b/i.test(line);
  }
  function phase(line){
    if(/\b(?:post|nach|danach|nach\s+bd|after)\b/i.test(line))return 'nach';
    if(/\b(?:pre|prae|pr[aä]|vor|before)\b/i.test(line))return 'vor';
    return null;
  }
  function fieldsFromRow(key,tail,head){
    const result=[];
    // Tabellen können mehrere prä/post-Spalten enthalten. Nicht automatisch zuordnen.
    if(/\b(?:pre|prae|vor)\b/i.test(head)&&/\b(?:post|nach)\b/i.test(head))return {result,ambiguous:true};
    const tokens=[...tail.matchAll(/(^|[\s(])([-+]?\d+(?:[.,]\d+)?)(\s*%)?/g)].map(x=>({raw:x[2],n:decimal(x[2]),percent:!!(x[3]&&x[3].includes('%'))}));
    const push=(field,value,strength,reason)=>{if(plausible(field,value))result.push({field,value,reason,strength});};
    if(key==='ratio'){
      let match=tail.match(/(\d{1,3}(?:[.,]\d+)?)\s*%/);
      if(match)push('ratio',decimal(match[1]),3,'FEV₁/FVC ausdrücklich in Prozent');
      else if(tokens.length===1){const n=tokens[0].n;push('ratio',n<=1?n*100:n,1,'Quotient: Einheit vor Übernahme prüfen');}
      return {result,ambiguous:false};
    }
    const pf=key==='fev1'?'fev1Percent':'fvcPercent';
    const lf=key==='fev1'?'fev1Liters':'fvcLiters';
    let match=tail.match(/(?:%\s*(?:soll|pred)|(?:soll|pred)\s*%?|percent\s*pred(?:icted)?)[^\d]{0,12}(\d{1,3}(?:[.,]\d+)?)/i);
    if(match)push(pf,decimal(match[1]),3,'Explizite Sollwert-Prozentangabe');
    match=tail.match(/(\d{1,3}(?:[.,]\d+)?)\s*%\s*(?:v(?:om)?\.?\s*)?(?:soll|pred(?:icted)?)/i);
    if(match)push(pf,decimal(match[1]),3,'Explizite Sollwert-Prozentangabe');
    const pct=tokens.filter(t=>t.percent);
    if(pct.length===1)push(pf,pct[0].n,3,'Prozentzeichen in der betreffenden Zeile');
    match=tail.match(/(?:ist|gemessen|messwert|measured)\s*[:=]?\s*(\d{1,2}(?:[.,]\d{1,3})?)\s*(?:l|liter)\b/i);
    if(match)push(lf,decimal(match[1]),3,'Explizit gemessene Liter');
    match=tail.match(/(\d{1,2}(?:[.,]\d{1,3})?)\s*(?:l|liter)\b/i);
    if(match)push(lf,decimal(match[1]),2,'Liter-Einheit in der Messzeile');
    const hasPred=/%\s*(?:soll|pred)|(?:soll|pred)\s*%|predicted\b/i.test(head);
    const hasMeasured=/\b(?:ist|actual|meas(?:ured)?|messwert|best)\b/i.test(head);
    if(hasPred&&tokens.length>=3){
      const possible=tokens[2].n;
      // Standardformat: Soll | Ist | %Soll oder Ist | Soll | %Soll
      push(pf,possible,2,'Wert aus der Spalte %Soll vermutet');
      if(hasMeasured){const h=head.toLowerCase(),istIndex=h.indexOf('ist')>=0?h.indexOf('ist'):h.indexOf('meas')>=0?h.indexOf('meas'):h.indexOf('actual');const predIndex=h.indexOf('soll')>=0?h.indexOf('soll'):h.indexOf('pred');
        const measuredPosition=istIndex>=0&&predIndex>=0&&istIndex<predIndex?0:1;
        push(lf,tokens[measuredPosition].n,2,'Wert aus der vermuteten Ist-Spalte');
      }
    }
    // Headings "Ist | Soll | %Soll" ohne exakte Spaltenposition nur als Prüfangebot.
    return {result,ambiguous:false};
  }
  function parseDate(lines){
    const dates=[];
    lines.forEach((l,i)=>{
      if(/geburt|birth|geboren/i.test(l))return;
      const dateRegex=/(\b(?:20\d{2})[-./](?:0?[1-9]|1[0-2])[-./](?:[0-2]?\d|3[01])\b|\b(?:[0-2]?\d|3[01])[.\/](?:0?[1-9]|1[0-2])[.\/](?:20\d{2})\b)/g;
      for(const m of l.matchAll(dateRegex)){
        let date='';const p=m[0].split(/[./-]/).map(Number);
        if(p[0]>1900)date=[p[0],p[1],p[2]].map((v,j)=>j===0?String(v):String(v).padStart(2,'0')).join('-');
        else date=[p[2],p[1],p[0]].map((v,j)=>j===0?String(v):String(v).padStart(2,'0')).join('-');
        const d=new Date(date+'T12:00:00Z');if(Number.isNaN(+d)||d.toISOString().slice(0,10)!==date)continue;
        const nearby=lines.slice(Math.max(0,i-1),i+1).join(' ');
        const priority=/untersuchung|messung|spirometrie|testdatum|date of test|test date|datum\b/i.test(nearby)?2:1;
        dates.push({date,priority});
      }
    });
    const firsts=dates.filter(x=>x.priority===2),selected=firsts.length?firsts:dates;
    return new Set(selected.map(x=>x.date)).size===1?selected[0]?.date||'':'';
  }
  function extractReportValues(raw){
    const lines=String(raw||'').slice(0,25000).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    const candidates=[];const warnings=[];
    let prevHead='',currentPhase='unbekannt';
    for(let i=0;i<lines.length;i++){
      const line=lines[i],met=metric(line),ph=phase(line);
      if(header(line))prevHead=line;
      if(!met){if(ph)currentPhase=ph;continue;}
      const activePhase=ph||currentPhase;
      const {result,ambiguous}=fieldsFromRow(met.key,met.tail,prevHead);
      if(ambiguous)warnings.push('Prä- und Post-Spalten erkannt: Zahlen bitte anhand des Originals eintragen.');
      for(const x of result)candidates.push({...x,phase:activePhase,line,index:i});
      if(result.length===0&&met.key!=='ratio')warnings.push('Keine eindeutige Spaltenzuordnung für '+met.key.toUpperCase()+' in einer Zeile.');
    }
    const dates=parseDate(lines);
    if(!candidates.length)warnings.push('Keine sicher zuordenbaren FEV₁-/FVC-Werte erkannt.');
    return {candidates,warnings:[...new Set(warnings)],date:dates,lines:lines.length};
  }
  function pickByPhase(data,phaseName){
    const selected={};const warnings=[...(data.warnings||[])];const phase=phaseName||'unbekannt';
    for(const field of FIELDS){
      const c=(data.candidates||[]).filter(x=>x.field===field&&(phase==='unbekannt'?x.phase==='unbekannt':x.phase===phase||x.phase==='unbekannt'));
      if(!c.length)continue;
      const values=[...new Set(c.map(x=>x.value))];
      if(values.length>1){warnings.push(field+': mehrere unterschiedliche Werte erkannt – bitte selbst nachtragen.');continue;}
      selected[field]=values[0];
    }
    // Solange das Stadium nicht gewählt ist, keine Phasen mischen.
    if(phase==='unbekannt'&&new Set((data.candidates||[]).map(x=>x.phase)).size>1){warnings.push('Vor-/Nach-Werte vorhanden: Bitte Messphase auswählen.');}
    return {values:selected,date:data.date||'',warnings:[...new Set(warnings)]};
  }
  root.ASTHMA_OCR_PARSER=Object.freeze({extractReportValues,pickByPhase});
})(typeof window!=='undefined'?window:globalThis);
