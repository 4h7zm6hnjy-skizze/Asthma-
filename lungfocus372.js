'use strict';
/* PneumoPro 3.7.2: OCR-Positionsdaten vergroesserter Tabellenbereiche
 * in Originalbild-Koordinaten umrechnen und gezielt erneut lesen.
 * Keine Dokumentdaten im Code, keine Uebertragung oder Schaetzung.
 */
(function(root){
  function toOriginalTSV(tsv,region){
    if(!region||!region.cw||!region.ch||!region.sw||!region.sh)return '';
    const sx=region.sw/region.cw,sy=region.sh/region.ch;
    const out=['level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext'];
    for(const line of String(tsv||'').split(/\r?\n/).slice(1)){
      const f=line.split('\t');if(f.length<12||f[0]!=='5')continue;
      const nums=[6,7,8,9].map(i=>Number(f[i]));
      if(!nums.every(Number.isFinite))continue;
      f[6]=String(Math.round(region.x+nums[0]*sx));
      f[7]=String(Math.round(region.y+nums[1]*sy));
      f[8]=String(Math.max(1,Math.round(nums[2]*sx)));
      f[9]=String(Math.max(1,Math.round(nums[3]*sy)));
      out.push(f.join('\t'));
    }
    return out.length>1?out.join('\n'):'';
  }
  function choose(regions,width,height,existing,focus){
    const tested=[];
    if(!focus?.targets)return tested;
    const known=new Set(existing.filter(x=>Number.isFinite(x.actual)&&Number.isFinite(x.percent)).map(x=>x.code));
    for(const region of (regions||[]).slice(0,5)){
      const tsv=toOriginalTSV(region.tsv,region);
      if(!tsv)continue;
      const found=focus.targets(tsv,width,height,existing,12,1,1);
      const codes=[...new Set(found.rows.map(x=>x.code).filter(code=>!known.has(code)))];
      if(!codes.length)continue;
      tested.push({tsv,codes,score:codes.length,region:region.name||'Tabellenbereich'});
    }
    return tested.sort((a,b)=>b.score-a.score);
  }
  async function scan(blob,regions,existing,focus,ocrWorker,status){
    const result={rows:[],warnings:[],candidates:0,targets:0,attempts:0,region:''};
    if(!focus?.scan||!blob||!regions?.length)return result;
    const bitmap=await createImageBitmap(blob);let ranked;
    try{ranked=choose(regions,bitmap.width,bitmap.height,existing,focus);}finally{bitmap.close();}
    result.candidates=ranked.length;
    if(!ranked.length){result.warnings.push('Keine verlaesslichen Zeilenkoordinaten in vergroesserten Tabellen erkannt. Fehlende Werte bleiben leer.');return result;}
    const all=new Map(existing.map(r=>[r.code,r]));
    // Nur der am besten beschriftete Tabellenbereich; ein zweiter nur,
    // wenn der erste keine neue Zahl liefert. Verhindert endlose iPhone-OCR.
    for(let index=0;index<Math.min(2,ranked.length);index++){
      const choice=ranked[index];
      status?.('Lese Tabellenzeilen aus '+choice.region+' ...');
      const run=await focus.scan(blob,choice.tsv,[...all.values()],ocrWorker,status,1,1);
      result.targets+=run.targets||0;result.attempts+=run.attempts||0;
      result.warnings.push(...(run.warnings||[]));
      const before=result.rows.length;
      for(const next of run.rows||[]){
        const old=all.get(next.code);
        if(old){
          if(Number.isFinite(old.predicted)&&Number.isFinite(next.predicted)&&Math.abs(old.predicted-next.predicted)>.025){result.warnings.push(next.code+': Sollwert aus Zoom widerspricht dem Originalvorschlag; bitte manuell pruefen.');continue;}
          if(Number.isFinite(old.actual)&&Number.isFinite(next.actual)&&Math.abs(old.actual-next.actual)>.025){result.warnings.push(next.code+': Istwert aus Zoom widerspricht dem Originalvorschlag; bitte manuell pruefen.');continue;}
          if(Number.isFinite(old.percent)&&Number.isFinite(next.percent)&&Math.abs(old.percent-next.percent)>.05){result.warnings.push(next.code+': Prozentwert-Widerspruch; bisheriger Vorschlag bleibt erhalten.');continue;}
          if(Number.isFinite(old.percent))continue;
          if(!Number.isFinite(next.percent))continue;
          const updated={...old,percent:next.percent};all.set(next.code,updated);result.rows.push(updated);
        }else if(Number.isFinite(next.actual)){
          all.set(next.code,next);result.rows.push(next);
        }
      }
      if(result.rows.length>before){result.region=choice.region;break;}
    }
    return result;
  }
  const api=Object.freeze({toOriginalTSV,choose,scan});
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.PNEUMOPRO_FOCUS372=api;
})(typeof window!=='undefined'?window:globalThis);
