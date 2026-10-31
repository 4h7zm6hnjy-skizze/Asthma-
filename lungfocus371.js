'use strict';
/* PneumoPro 3.7.1 - gezieltes Offline-Nachlesen einzelner OCR-Tabellenzeilen.
 * Anordnung aus echten Tesseract-Wortkoordinaten, nie aus einem Kliniktemplate.
 * Originale, Diagnosekurven und Gesundheitsdaten werden nicht geaendert.
 */
(function(root){
  const L=[
    [/^RV\s*[%/]\s*TLC\s*(?:SB|single\s*breath)\b/i,'RV_TLC_SB'],
    [/^RV\s*[%/]\s*TLC\b/i,'RV_TLC'],
    [/^FEV\s*[1Il]\s*[%/]\s*FVC\b/i,'FEV1_FVC'],
    [/^(?:MMEF|MFEF)\s*75\s*[-–]\s*25\b/i,'MMEF75_25'],
    [/^FEF\s*75\b/i,'FEF75'],
    [/^sR\s*eff\b/i,'sR_eff'],[/^R\s*eff\b/i,'R_eff'],
    [/^FRC\s*pleth\b/i,'FRCpleth'],[/^VC\s*IN\b/i,'VC_IN'],
    [/^FEV\s*[1Il]\b/i,'FEV1'],[/^FVC\b/i,'FVC'],
    [/^TLC\s*SB\b/i,'TLC_SB'],[/^FRC\s*SB\b/i,'FRC_SB'],
    [/^RV\s*SB\b/i,'RV_SB'],[/^VIN\s*SB\b/i,'VIN_SB'],
    [/^VA\s*(?:SB)?\b/i,'VA_SB'],[/^ERV\s*SB\b/i,'ERV_SB'],
    [/^(?:DLCOc\s*SB|DLCO\s*corrected)\b/i,'DLCOcSB'],
    [/^(?:KCOc\s*SB|KCO\s*corrected)\b/i,'KCOc_SB'],
    [/^DLCO\s*(?:SB)?\b/i,'DLCO_SB'],[/^KCO\s*(?:SB)?\b/i,'KCO_SB'],
    [/^RV\b/i,'RV'],[/^TLC\b/i,'TLC'],[/^PEF\b/i,'PEF'],
    [/^PIF\b/i,'PIF'],[/^Hb\b/i,'Hb'],[/^TA\b/i,'TA']
  ];
  const normalized=s=>String(s||'').replace(/[₁]/g,'1').replace(/[−‐–]/g,'-').replace(/_/g,' ').replace(/\u00a0/g,' ').trim();
  function label(text){
    const line=normalized(text).replace(/^[\s\d.,;:|+*•'"<>-]{0,10}/,'').trim();
    for(const [r,code] of L)if(r.test(line))return code;
    return '';
  }
  function median(list){if(!list.length)return null;const a=[...list].sort((x,y)=>x-y);return a[Math.floor(a.length/2)];}
  function targets(tsv,width,height,existing=[],limit=10,scaleX=1,scaleY=1){
    const geo=root.PNEUMOPRO_PARSER367;
    if(!geo?.readWords||!geo?.visualLines||!width||!height)return {rows:[],percentX:null};
    const lines=geo.visualLines(geo.readWords(tsv));
    const good=new Map();
    for(const line of lines){
      const code=label(line.text);if(!code||!line.words?.length)continue;
      const first=line.words[0],x=(first.x||0)*scaleX;
      if(x>width*.65||line.cy*scaleY<0||line.cy*scaleY>height)continue;
      // Ein Name muss in der linken Haelfte der jeweiligen Tabellenzeile stehen.
      const h=(median(line.words.map(w=>w.h).filter(Number.isFinite))||16)*scaleY;
      const candidate={code,x,cy:line.cy*scaleY,h,page:line.page,words:line.words};
      if(!good.has(code)||good.get(code).words.length<candidate.words.length)good.set(code,candidate);
    }
    // Nur tatsaechlich per OCR gelesene Spaltenkoepfe zum Zuschneiden benutzen.
    const pctHeaders=[];const zHeaders=[];
    for(const line of lines)for(const w of line.words){
      if(/^%|%Soll|%Pred|%Best|Pct$/i.test(w.text))pctHeaders.push(w.x*scaleX);
      if(/^Z[- ]?Score$/i.test(w.text))zHeaders.push(w.x*scaleX);
    }
    let percentX=median(pctHeaders);
    // Kein allgemeiner Festwert: bei fehlender Prozentspaltenposition lieber keine gezielte Prozentspalten-OCR.
    if(percentX===null){
      const observed=[];
      for(const e of existing){
        if(!Number.isFinite(e.percent))continue;
        const r=good.get(e.code);if(!r)continue;
        for(const w of r.words){
          const s=normalized(w.text).replace(',','.');
          if(!/^\d{1,3}(?:\.\d{1,3})?$/.test(s))continue;
          if(Math.abs(Number(s)-e.percent)<=.05&&w.x*scaleX>r.x+width*.12)observed.push(w.x*scaleX);
        }
      }
      if(observed.length>=2)percentX=median(observed);
    }
    const zStart=median(zHeaders);
    const present=new Map(existing.map(r=>[r.code,r]));
    const rows=[];
    for(const r of good.values()){
      const old=present.get(r.code);
      if(old&&Number.isFinite(old.predicted)&&Number.isFinite(old.actual)&&Number.isFinite(old.percent))continue;
      const y0=Math.max(0,Math.floor(r.cy-r.h*.92-3));
      const y1=Math.min(height,Math.ceil(r.cy+r.h*.94+3));
      const x0=Math.max(0,Math.floor(r.x-Math.max(8,width*.015)));
      // Rechts bis mindestens zur Prozentzahl; bei Z-Score-Marke davor stoppen.
      const x1=Math.min(width,Math.max(x0+width*.27,Math.min(zStart??(x0+width*.47),x0+width*.54)));
      if(y1-y0<9||x1-x0<100)continue;
      const bbox={x:x0,y:y0,w:Math.floor(x1-x0),h:y1-y0};
      const pctStart=Math.max(x0,Math.floor((percentX??0)-Math.max(12,width*.018)));
      const pctBox=percentX!==null&&percentX>x0+width*.14&&percentX<x1 ? {
        x:pctStart,y:y0,w:Math.min(width-pctStart,Math.max(20,Math.ceil(width*.06))),h:bbox.h
      }:null;
      rows.push({code:r.code,box:bbox,percentBox:pctBox,part:!!old&&old.percent===null});
    }
    // Fehlende Prozentspalten zuerst, dann voellig fehlende Tabellenzeilen.
    rows.sort((a,b)=>Number(b.part)-Number(a.part));
    return {rows:rows.slice(0,limit),percentX};
  }
  const num=s=>{const v=String(s).replace(',','.');return /^[+-]?\d{1,3}(?:\.\d{1,3})?$/.test(v)?Number(v):null;};
  function percentageFromText(text,old){
    if(!old||!Number.isFinite(old.predicted)||!Number.isFinite(old.actual))return null;
    const tokens=String(text||'').trim().split(/\s+/).filter(Boolean);
    if(tokens.length!==1)return null;
    const val=num(tokens[0].replace('%',''));
    if(val===null||val<0||val>400)return null;
    return Math.abs(old.actual/old.predicted*100-val)<=Math.max(1.2,val*.017)?val:null;
  }
  function validated(code,text,previous){
    const full=root.PNEUMOPRO_PARSER369?.parse(text)?.rows||[];
    const partial=root.PNEUMOPRO_PARSER370?.parse(text)?.rows||[];
    const candidates=[...full,...partial].filter(r=>r.code===code);
    if(!candidates.length){
      // PIF ist bei manchen Klinikformularen nur als Istwert angegeben.
      // Kein Sollwert oder Prozentwert wird dazu erfunden.
      const single=String(text||'').trim().match(/^PIF\s+([1-9]\d?[.,]\d{1,3})\s*$/i);
      if(code==='PIF'&&single){
        const actual=Number(single[1].replace(',','.'));
        if(actual>0&&actual<=25&&!previous)return {row:{code,predicted:null,actual,percent:null,z:null,source:'Gezielte OCR: '+text,confidence:'Einzelner Istwert; Original prüfen'}};
      }
      return null;
    }
    const unique=new Map(candidates.map(r=>[[r.predicted,r.actual,r.percent].join('|'),r]));
    if(unique.size>1)return {conflict:true,code};
    const v=[...unique.values()][0];
    if(previous){
      if(Number.isFinite(previous.predicted)&&Math.abs(previous.predicted-v.predicted)>.025)return {conflict:true,code};
      if(Number.isFinite(previous.actual)&&Math.abs(previous.actual-v.actual)>.025)return {conflict:true,code};
      if(Number.isFinite(previous.percent)&&Number.isFinite(v.percent)&&Math.abs(previous.percent-v.percent)>.05)return {conflict:true,code};
      if(Number.isFinite(previous.percent))return null;
    }
    return {row:{code,predicted:v.predicted,actual:v.actual,percent:v.percent??null,z:null,source:'Gezielte lokale Originalzeilen-OCR: '+String(text).slice(0,150),confidence:'Unbestätigter Vorschlag; Original prüfen'}};
  }
  async function scan(blob,tsv,existing,ocrWorker,status,scaleX=1,scaleY=1){
    const bitmap=await createImageBitmap(blob), result={rows:[],warnings:[],attempts:0,targets:0};
    const saved=new Map(existing.map(r=>[r.code,r]));
    const seen=new Set();
    let worker=null;
    try{
      const t=targets(tsv,bitmap.width,bitmap.height,existing,10,scaleX,scaleY);result.targets=t.rows.length;
      if(!t.rows.length)return result;
      worker=await ocrWorker();
      await worker.setParameters({tessedit_pageseg_mode:'7'});
      for(const target of t.rows){
        if(result.attempts>=15)break;
        const b=target.box;
        const c=document.createElement('canvas');
        const scale=Math.min(4.8,2500/b.w,400/b.h);
        c.width=Math.max(1,Math.round(b.w*scale));c.height=Math.max(1,Math.round(b.h*scale));
        const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)continue;
        ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
        ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
        ctx.drawImage(bitmap,b.x,b.y,b.w,b.h,0,0,c.width,c.height);
        let text='';
        try{
          status?.('Prüfe einzelne Messwertzeile: '+target.code+' ...');
          text=String((await worker.recognize(c)).data?.text||'').trim();result.attempts++;
        }catch(e){result.warnings.push(target.code+': Zeilen-OCR nicht möglich.');}
        finally{c.width=c.height=1;}
        const old=saved.get(target.code);
        const hit=validated(target.code,text,old);
        if(hit?.conflict){result.warnings.push(target.code+': unterschiedliche OCR-Werte; bitte Original prüfen.');continue;}
        let candidate=hit?.row||null;
        // Wenn eine Prozentzahl in der ganzen Zeile fehlt, nur den optisch
        // gesicherten Prozentspaltenausschnitt separat lesen.
        if((old||candidate)&&!Number.isFinite((candidate||old).percent)&&target.percentBox&&result.attempts<15){
          const pc=target.percentBox;
          const cc=document.createElement('canvas');const fac=Math.min(6,440/pc.w,180/pc.h);
          cc.width=Math.max(1,Math.round(pc.w*fac));cc.height=Math.max(1,Math.round(pc.h*fac));
          const context=cc.getContext('2d',{willReadFrequently:true});
          if(context){context.fillStyle='#fff';context.fillRect(0,0,cc.width,cc.height);context.drawImage(bitmap,pc.x,pc.y,pc.w,pc.h,0,0,cc.width,cc.height);
            try{
              status?.('Prüfe Prozentspalte: '+target.code+' ...');
              const raw=String((await worker.recognize(cc)).data?.text||'').trim();result.attempts++;
              const percent=percentageFromText(raw,candidate||old);
              if(percent!==null)candidate={...(candidate||old),percent};
            }catch(e){/* Fehlende Prozentspalte bleibt unbesetzt. */}
          }
          cc.width=cc.height=1;
        }
        if(!candidate||seen.has(target.code))continue;
        seen.add(target.code);result.rows.push(candidate);
      }
    }finally{
      if(worker)try{await worker.setParameters({tessedit_pageseg_mode:'3'});}catch(e){}
      bitmap.close();
    }
    return result;
  }
  const api=Object.freeze({targets,validated,percentageFromText,scan,label});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PNEUMOPRO_FOCUS371=api;
})(typeof window!=='undefined'?window:globalThis);
