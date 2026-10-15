'use strict';
/* Asthma 2.1 – private ePEF import. All XLSX/CSV parsing happens on the device.
   Time colors are NOT medical risk zones. No network or external JavaScript. */
(()=>{
  const $=id=>document.getElementById(id), SEC=window.ASTHMA_SECURITY;
  if(!$('epef-panel')||!SEC)return;
  const $status=$('epef-status'),preview=$('epef-preview'),table=$('epef-history');
  const mcols=['datetime','date','time','pef','fev1','status'];
  const desc={datetime:'Datum und Uhrzeit zusammen',date:'Datum',time:'Uhrzeit',pef:'PEF (l/min)',fev1:'FEV₁ (Liter)',status:'ePEF-Status (optional)'};
  const colors={morning:'#20865a',afternoon:'#276ac9',evening:'#c63e4c',unknown:'#73818c'};
  const maxRows=20000,maxZipSize=12*1024*1024,maxXml=22*1024*1024;
  let workbook=null,currentRows=[],toImport=[],all=[],busy=false,lastFile='',referencePEF=null;
  const node=(tag,cls,value)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(value!=null)el.textContent=String(value);return el};
  function status(msg,bad=false){$status.textContent=msg;$status.classList.toggle('suite-error',bad)}
  const trim=v=>String(v??'').trim();
  const decimal=x=>{
    if(x===null||x===undefined||x==='')return null;
    if(typeof x==='number')return Number.isFinite(x)?x:null;
    let s=trim(x).replace(/[\u00a0\s]/g,'').replace(/(?:l\/min|L\/min|l|L)$/,'');
    // Accept localized decimal commas and a grouped thousands separator.
    if(/^-?\d{1,3}(?:\.\d{3})+,\d+$/.test(s))s=s.replace(/\./g,'').replace(',','.');
    else if(/^-?\d{1,3}(?:,\d{3})+\.\d+$/.test(s))s=s.replace(/,/g,'');
    else if(/^[-+]?\d+,\d+$/.test(s))s=s.replace(',','.');
    return /^[-+]?\d+(?:\.\d+)?$/.test(s)?Number(s):null;
  };
  function validDate(y,m,d){if(y<1900||y>2100||m<1||m>12||d<1||d>31)return null;const a=new Date(Date.UTC(y,m-1,d));return a.getUTCFullYear()===y&&a.getUTCMonth()===m-1&&a.getUTCDate()===d?`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`:null}
  function excelTime(value){if(typeof value!=='number'||!Number.isFinite(value)||value<0)return null;
    const days=Math.floor(value),secs=Math.round((value-days)*86400);let date=null;
    if(days>20000&&days<90000){const epoch=Date.UTC(1899,11,30)+days*86400000;date=new Date(epoch).toISOString().slice(0,10);}
    const minutes=Math.round((secs%86400)/60)%1440;
    return {date,time:`${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`};
  }
  function dateValue(x){if(x==null||x==='')return null;
    if(typeof x==='number')return excelTime(x)?.date||null;
    const s=trim(x);let m;
    if((m=s.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})(?=\D|$)/)))return validDate(+m[1],+m[2],+m[3]);
    if((m=s.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})(?=\D|$)/)))return validDate(+m[3],+m[2],+m[1]);
    return null;
  }
  function timeValue(x){if(x===null||x===undefined||x==='')return null;
    if(typeof x==='number'){
      if(x>=0&&x<1)return excelTime(x)?.time||null;
      if(x>=0&&x<24)return `${String(Math.floor(x)).padStart(2,'0')}:${String(Math.round((x%1)*60)).padStart(2,'0')}`;
      return excelTime(x)?.time||null;
    }
    let s=trim(x),m=s.match(/(?:^|\s)(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|am|pm)?(?:\s|$)/);
    if(!m)m=s.match(/^(\d{1,2})[.](\d{2})\s*(AM|PM)?$/i);
    if(!m)return null;
    let h=+m[1],min=+m[2];const ampm=(m[3]||'').toUpperCase();if(min>59||h>23)return null;
    if(ampm){if(h<1||h>12)return null;h=h%12+(ampm==='PM'?12:0)}
    return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
  }
  const dateTime=x=>{
    if(typeof x==='number')return excelTime(x);
    const s=trim(x).replace(/(\d)T(?=\d{1,2}:)/,'$1 ');const d=dateValue(s),t=timeValue(s);return d?{date:d,time:t}:null;
  };
  function bucket(time){if(!time||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))return 'unknown';return time<'13:00'?'morning':time<'17:00'?'afternoon':'evening';}
  function validRec(r){return r&&typeof r.date==='string'&&/^\d{4}-\d\d-\d\d$/.test(r.date)&&r.time&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(r.time)&&
    (r.pef!==null||r.fev1!==null)&&
    (r.pef===null||Number.isFinite(r.pef)&&r.pef>=50&&r.pef<=1400)&&
    (r.fev1===null||Number.isFinite(r.fev1)&&r.fev1>=0.1&&r.fev1<=12);
  }
  const fp=x=>[x.date,x.time,x.pef==null?'':Number(x.pef).toFixed(2),x.fev1==null?'':Number(x.fev1).toFixed(3)].join('|');
  // Deduplication is intentionally strict: distinct PEF/FEV1 readings at the same minute are NOT merged.
  // Source filename, export format and import timestamp do not affect the canonical identity.
  const measurements=()=>all.filter(x=>x.kind==='measurement');
  const duplicates=()=>{const seen=new Set(),items=[];for(const r of measurements()){const k=fp(r);if(seen.has(k))items.push(r);else seen.add(k)}return items};
  // Spreadsheet input is read as data, never evaluated as markup/code.
  const parseXml=source=>{const xml=new DOMParser().parseFromString(source,'application/xml');if(xml.getElementsByTagName('parsererror').length)throw Error('Die Excel-Datei enthält ungültiges XML.');return xml};
  const tags=(parent,name)=>Array.from(parent.getElementsByTagNameNS('*',name));
  const attr=(el,name)=>el?.getAttribute(name);
  function xlCol(ref){const m=trim(ref).match(/^([A-Za-z]+)/);if(!m)return -1;return [...m[1].toUpperCase()].reduce((n,c)=>n*26+c.charCodeAt(0)-64,0)-1;}
  function zipTarget(target){const parts=[];let t=trim(target).replace(/^\/+/, '');if(!t.startsWith('xl/'))t='xl/'+t;t.split('/').forEach(p=>{if(p==='..')parts.pop();else if(p&&p!=='.')parts.push(p)});return parts.join('/');}
  async function xlText(file){if(!file)return null;if(file._data?.uncompressedSize>maxXml)throw Error('Eine Excel-Tabelle ist zu groß.');return file.async('text');}
  async function xlsx(bytes){
    if(!window.JSZip)throw Error('Lokale Excel-Bibliothek fehlt. Bitte alle Update-Dateien hochladen.');
    const zip=await window.JSZip.loadAsync(bytes,{checkCRC32:true});
    const root=zip.file('xl/workbook.xml');if(!root)throw Error('Keine gültige XLSX-Arbeitsmappe.');
    const wb=parseXml(await xlText(root));const relfile=zip.file('xl/_rels/workbook.xml.rels');
    const relationships=new Map();if(relfile){for(const r of tags(parseXml(await xlText(relfile)),'Relationship'))relationships.set(attr(r,'Id'),zipTarget(attr(r,'Target')))}
    const strfile=zip.file('xl/sharedStrings.xml');let strings=[];
    if(strfile){let xml=parseXml(await xlText(strfile));strings=tags(xml,'si').map(si=>tags(si,'t').map(n=>n.textContent||'').join(''));}
    const sheets=[];
    for(const [i,sheet] of tags(wb,'sheet').entries()){
      if(i>25)break;const name=attr(sheet,'name')||`Tabelle ${i+1}`;
      const rel=attr(sheet,'r:id')||Array.from(sheet.attributes).find(a=>a.localName==='id')?.value;
      const path=relationships.get(rel)||`xl/worksheets/sheet${i+1}.xml`;
      const f=zip.file(path);if(!f)continue;
      const x=parseXml(await xlText(f));const rows=[];
      for(const row of tags(x,'row').slice(0,maxRows)){
        const vals=[];for(const cell of tags(row,'c')){
          const ci=xlCol(attr(cell,'r'));if(ci<0||ci>160)continue;
          const typ=attr(cell,'t');const v=tags(cell,'v')[0]?.textContent||'';
          if(typ==='s')vals[ci]=strings[+v]??'';
          else if(typ==='inlineStr')vals[ci]=tags(cell,'t').map(n=>n.textContent||'').join('');
          else if(typ==='str'||typ==='e')vals[ci]=v;
          else vals[ci]=v!==''&&Number.isFinite(Number(v))?Number(v):v;
        }
        rows.push(vals);
      }
      sheets.push({name,rows});
    }
    if(!sheets.length)throw Error('Keine lesbare Excel-Tabellenblätter gefunden.');
    return sheets;
  }
  function csvRows(input){
    let lines=[],row=[],cell='',quote=false;
    for(let i=0;i<input.length;i++){
      const ch=input[i];if(ch==='"'){if(quote&&input[i+1]==='"'){cell+='"';i++}else quote=!quote}
      else if(!quote&&(ch===';'||ch==='\t'||ch===',')){// actual separator decided below
        cell+=ch;
      }else if(!quote&&(ch==='\r'||ch==='\n')){row.push(cell);lines.push(row);row=[];cell='';if(ch==='\r'&&input[i+1]==='\n')i++;}
      else cell+=ch;
    }
    row.push(cell);lines.push(row);
    const test=lines.slice(0,10).join('\n');const sep=test.includes(';')?';':test.includes('\t')?'\t':',';
    // Reparse with inferred CSV delimiter, honoring quoted separators/newlines.
    const result=[];let cells=[],value='',quoted=false;
    for(let i=0;i<input.length;i++){const ch=input[i];if(ch==='"'){if(quoted&&input[i+1]==='"'){value+='"';i++}else quoted=!quoted;}
      else if(!quoted&&ch===sep){cells.push(value);value=''}
      else if(!quoted&&(ch==='\n'||ch==='\r')){cells.push(value);if(cells.some(x=>x.trim()))result.push(cells);cells=[];value='';if(ch==='\r'&&input[i+1]==='\n')i++}
      else value+=ch;
    }
    cells.push(value);if(cells.some(x=>x.trim()))result.push(cells);return [{name:'CSV',rows:result.slice(0,maxRows)}];
  }
  function normalizeHeader(s){return trim(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/₁/g,'1').replace(/[^a-z0-9]+/g,' ')}
  function scoreHeader(row){let score=0;for(const v of row){const h=normalizeHeader(v);if(/(^| )pef( |$)|peak.?flow/.test(h)&&!/soll|expected|predicted|reference|best/.test(h))score+=7;
      if(/(^| )fev ?1( |$)/.test(h))score+=5;
      if(/date|datum|zeit|time|timestamp|messung/.test(h))score+=3;
    }return score;}
  function guess(sheet){const rows=sheet.rows||[];let best=-1,bscore=-1;
    for(let i=0;i<Math.min(35,rows.length);i++){const score=scoreHeader(rows[i]||[]);if(score>bscore){best=i;bscore=score;}}
    const hdr=bscore>0?best:0,labels=(rows[hdr]||[]).map(normalizeHeader);const map={datetime:null,date:null,time:null,pef:null,fev1:null,status:null};
    labels.forEach((s,i)=>{
      if(!s)return;
      if(map.pef===null&&/(^| )pef( |$)|peak ?flow/.test(s)&&!/soll|expected|predicted|reference|best/.test(s))map.pef=i;
      if(map.fev1===null&&/fev ?1/.test(s)&&!/soll|expected|predicted|reference/.test(s))map.fev1=i;
      if(/date|datum|messdatum|measurement date/.test(s)&&map.date===null)map.date=i;
      if(/(^| )time( |$)|uhrzeit|zeitpunkt|hour/.test(s)&&map.time===null)map.time=i;
      if(/datum.*zeit|date.*time|timestamp|datetime/.test(s))map.datetime=i;
      if(/status|result|ampel|zone|bewertung/.test(s)&&map.status===null)map.status=i;
    });
    if(map.datetime!==null){map.date=null;map.time=null;}
    return {header:hdr, map};
  }
  function getMapping(){const map={};for(const k of mcols){const v=$('epef-col-'+k).value;map[k]=v===''?null:+v;}return map;}
  function rawRows(sheet,header){return sheet.rows.slice(Math.max(0,Math.min(sheet.rows.length,header+1)));}
  function collect(sheet,header,map){
    let parsed=[],errors=0,samples=[];
    const get=(row,k)=>map[k]===null?null:row[map[k]];
    for(const [i,row] of rawRows(sheet,header).entries()){
      const combined=get(row,'datetime');let parsedDT=combined!=null?dateTime(combined):null;
      let date=parsedDT?.date||dateValue(get(row,'date')),
          time=parsedDT?.time||timeValue(get(row,'time'));
      // If date is an Excel timestamp with both date/time, use time from same cell if separate time missing.
      if(!time&&typeof get(row,'date')==='number')time=excelTime(get(row,'date'))?.time;
      if(!date||!time){if(row.some(x=>trim(x)!=='')){errors++;if(samples.length<4)samples.push(`Zeile ${header+i+2}: Datum oder Uhrzeit unklar`)}continue}
      const pef=decimal(get(row,'pef')),fev1=decimal(get(row,'fev1'));
      const rec={date,time,pef,fev1,status:trim(get(row,'status')).slice(0,80),source:'ePEF-Datei'};
      if(!validRec(rec)){errors++;if(samples.length<4)samples.push(`Zeile ${header+i+2}: ungültige oder fehlende Messwerte`);continue}
      parsed.push(rec);
    }
    return {parsed,errors,samples};
  }
  async function getData(file){
    if(file.size>maxZipSize)throw Error('Datei größer als 12 MB. Bitte eine kleinere Exportdatei wählen.');
    if(/\.xlsx$/i.test(file.name))return xlsx(await file.arrayBuffer());
    if(/\.(csv|tsv|txt)$/i.test(file.name)){
      const bytes=new Uint8Array(await file.arrayBuffer());let source=new TextDecoder('utf-8').decode(bytes);
      if((source.match(/�/g)||[]).length>3)source=new TextDecoder('windows-1252').decode(bytes);
      return csvRows(source.replace(/^\uFEFF/,''));
    }
    throw Error('Bitte eine XLSX-, CSV- oder TSV-Datei auswählen.');
  }
  function updateColumns(){
    if(!workbook)return;
    const sheet=workbook[+$('epef-sheet').value],hdr=+$('epef-header').value;
    const row=sheet.rows[hdr]||[];const width=Math.min(100,Math.max(0,...sheet.rows.slice(0,Math.min(150,sheet.rows.length)).map(x=>x.length))); 
    const g=guess(sheet).map;
    for(const key of mcols){const select=$('epef-col-'+key);const prev=select.value;select.replaceChildren(new Option('— nicht vorhanden —',''));
      for(let i=0;i<width;i++)select.add(new Option(`${i+1} · ${trim(row[i]).slice(0,42)||'Spalte '+(i+1)}`,String(i)));
      select.value=(g[key]===null?'':String(g[key]));
    }
    checkImport();
  }
  function chooseSheet(){if(!workbook)return;const sheet=workbook[+$('epef-sheet').value];const sel=$('epef-header');sel.replaceChildren();sel.add(new Option('Keine Kopfzeile (ab erster Datenzeile)', '-1'));const guessed=guess(sheet);
    for(let i=0;i<Math.min(40,sheet.rows.length);i++){const r=sheet.rows[i]||[];sel.add(new Option(`Zeile ${i+1}: ${r.slice(0,5).map(v=>trim(v).slice(0,22)).join(' | ')}`,String(i)))}sel.value=String(Math.min(guessed.header,sheet.rows.length-1));updateColumns();
  }
  function showRows(rows){preview.replaceChildren();if(!rows.length){preview.append(node('p','suite-msg','Keine gültigen Messungen erkannt. Bitte Tabellenblatt, Kopfzeile oder Spaltenzuordnung kontrollieren.'));return}
    const sc=node('div','epef-scroll');const t=node('table','epef-table');const head=node('tr');for(const x of ['Datum','Uhrzeit','PEF (l/min)','FEV₁ (l)','Farbe'])head.append(node('th','',x));t.append(head);
    for(const r of rows.slice(0,12)){const tr=node('tr');const val=[r.date.split('-').reverse().join('.'),r.time,r.pef??'–',r.fev1??'–',bucket(r.time)==='morning'?'Grün':bucket(r.time)==='afternoon'?'Blau':'Rot'];
      val.forEach((x,i)=>{const td=node('td','',x);if(i===4)td.style.color=colors[bucket(r.time)];tr.append(td)});t.append(tr)}sc.append(t);preview.append(sc);
  }
  function checkImport(){if(!workbook)return;const sheet=workbook[+$('epef-sheet').value],header=+$('epef-header').value,map=getMapping();
    if(map.pef===null&&map.fev1===null){toImport=[];showRows([]);status('Bitte mindestens PEF oder FEV₁ einer Spalte zuordnen.',true);$('epef-import-confirm').disabled=true;return;}
    const {parsed,errors,samples}=collect(sheet,header,map);const seen=new Set(),unique=[];let redundant=0;
    for(const r of parsed){const key=fp(r);if(seen.has(key)){redundant++;continue}seen.add(key);unique.push(r)}toImport=unique;
    showRows(unique);
    const existing=new Set(all.filter(x=>x.kind==='measurement').map(fp));const news=unique.filter(x=>!existing.has(fp(x))).length, already=unique.length-news;
    $('epef-import-confirm').disabled=news===0;
    $('epef-import-confirm').textContent=`${news} neue Messungen verschlüsselt übernehmen`;
    status(`${unique.length} gültige Messungen erkannt · ${news} neu · ${already} bereits gespeichert · ${errors} unklare Zeilen · ${redundant} Duplikate innerhalb der Datei. ${samples.join('; ')}`,(unique.length===0));
  }
  async function loadFile(){const f=$('epef-file').files?.[0];if(!f)return;lastFile=f.name;workbook=null;toImport=[];preview.replaceChildren();$('epef-import-options').hidden=true;$('epef-import-confirm').disabled=true;status('Datei wird ausschließlich auf deinem Gerät geöffnet …');
    try{workbook=await getData(f);const s=$('epef-sheet');s.replaceChildren();workbook.forEach((w,i)=>s.add(new Option(`${w.name} (${w.rows.length} Zeilen)`,String(i))));s.value='0';$('epef-import-options').hidden=false;chooseSheet()}catch(e){status('Import nicht möglich: '+e.message,true)}
  }
  async function importApproved(){if(busy||!toImport.length)return;busy=true;$('epef-import-confirm').disabled=true;let done=0,skipped=0;
    try{const existing=new Set((await SEC.list('epef')).filter(x=>x.kind==='measurement').map(fp));
      for(const rec of toImport){if(done>0&&done%100===0)status(`${done} Messungen lokal verschlüsselt gespeichert …`);const fingerprint=fp(rec);if(existing.has(fingerprint)){skipped++;continue}
        const id=crypto.randomUUID?crypto.randomUUID():`m-${Date.now()}-${done}-${Math.floor(Math.random()*100000)}`;
        await SEC.put('epef',{...rec,id,kind:'measurement',originalFile:lastFile,importedAt:new Date().toISOString()});existing.add(fingerprint);done++;
      }
      await refresh();checkImport();
      status(`${done} Messungen verschlüsselt gespeichert, ${skipped} bereits vorhanden. Die Datei blieb auf deinem Gerät.`);
    }catch(e){status(`Speichern unterbrochen (${done} übernommen): ${e.message}`,true);await refresh().catch(()=>{});}finally{busy=false;}
  }
  function fmtDate(date){return /^\d{4}-\d\d-\d\d$/.test(date)?date.slice(8)+'.'+date.slice(5,7)+'.'+date.slice(0,4):date;}
  function selectVisible(){const value=$('epef-range').value;const ordered=all.filter(x=>x.kind==='measurement').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    if(value==='all')return ordered;
    if(value==='month')return ordered.filter(x=>x.date.startsWith($('epef-month').value));
    const days=Number(value),start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-(days-1));const cutoff=start.getFullYear()+'-'+String(start.getMonth()+1).padStart(2,'0')+'-'+String(start.getDate()).padStart(2,'0');return ordered.filter(x=>x.date>=cutoff);
  }
  function chart(data,field,label,units,container,selectedId='epef-selected'){container.replaceChildren();const series=data.filter(x=>Number.isFinite(x[field]));
    if(!series.length){container.append(node('p','suite-msg',`Noch keine ${label}-Messungen für diesen Zeitraum.`));return}
    const val=series.map(x=>x[field]);if(field==='pef'&&referencePEF!==null)val.push(referencePEF);let min=Math.min(...val),max=Math.max(...val);if(max===min){const d=field==='pef'?40:.2;min=Math.max(0,min-d);max+=d;}else{const d=(max-min)*.15;min=Math.max(0,min-d);max+=d}
    const w=760,h=230,xl=58,xr=744,yt=20,yb=194;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('role','img');svg.setAttribute('aria-label',`${label}: ${series.length} Messungen mit Uhrzeit-Farben`);svg.classList.add('epef-chart-svg');
    const item=(tag,attrs={},txt)=>{const e=document.createElementNS(svg.namespaceURI,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));if(txt!=null)e.textContent=txt;svg.append(e);return e};
    for(let i=0;i<5;i++){const y=yt+(yb-yt)*i/4;item('line',{x1:xl,x2:xr,y1:y,y2:y,stroke:'#dfecf0','stroke-width':1});item('text',{x:5,y:y+5,fill:'#637c87','font-size':14},(max-(max-min)*i/4).toFixed(field==='pef'?0:2))}
    if(field==='pef'&&referencePEF!==null){const refy=yb-(referencePEF-min)*(yb-yt)/(max-min);item('line',{x1:xl,x2:xr,y1:refy,y2:refy,stroke:'#8998a6','stroke-width':2,'stroke-dasharray':'6 6'});item('text',{x:xr-4,y:refy-5,fill:'#667681','font-size':12,'text-anchor':'end'},`Referenz ${referencePEF}`)}
    const xy=(r,i)=>[xl+(series.length===1?(xr-xl)/2:i*(xr-xl)/(series.length-1)),yb-(r[field]-min)*(yb-yt)/(max-min)];
    for(let i=1;i<series.length;i++){const [x1,y1]=xy(series[i-1],i-1),[x2,y2]=xy(series[i],i),mx=(x1+x2)/2,my=(y1+y2)/2;item('line',{x1,y1,x2:mx,y2:my,stroke:colors[bucket(series[i-1].time)],'stroke-width':3.2,'stroke-linecap':'round'});item('line',{x1:mx,y1:my,x2,y2,stroke:colors[bucket(series[i].time)],'stroke-width':3.2,'stroke-linecap':'round'});}
    series.forEach((r,i)=>{const [cx,cy]=xy(r,i);const cir=item('circle',{cx,cy,r:series.length>80?3.3:5,fill:colors[bucket(r.time)],stroke:'#fff','stroke-width':1.6});const tip=document.createElementNS(svg.namespaceURI,'title');tip.textContent=`${fmtDate(r.date)} ${r.time}: ${r[field]} ${units}`;cir.append(tip);cir.setAttribute('tabindex','0');cir.setAttribute('aria-label',tip.textContent);const show=()=>{$(selectedId).textContent=`${fmtDate(r.date)} um ${r.time} Uhr · PEF ${r.pef??'–'} l/min · FEV₁ ${r.fev1??'–'} l${r.status?' · '+r.status:''}`};cir.addEventListener('click',show);cir.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}})});
    for(const i of [...new Set([0,Math.floor((series.length-1)/2),series.length-1])]){const [cx]=xy(series[i],i);item('text',{x:cx,y:h-7,'text-anchor':i===0?'start':i===series.length-1?'end':'middle',fill:'#637c87','font-size':13},fmtDate(series[i].date).slice(0,6))}
    container.append(svg);
  }
  function drawList(data){table.replaceChildren();const selected=data.slice().reverse(),count=selected.length;const stats=$('epef-stats');
    const val=k=>data.map(r=>r[k]).filter(Number.isFinite),average=k=>{const v=val(k);return v.length?(v.reduce((s,x)=>s+x,0)/v.length).toFixed(k==='pef'?0:2):'–'};
    stats.textContent=`${all.filter(x=>x.kind==='measurement').length} Messungen gespeichert · ${count} im Zeitraum · Ø PEF ${average('pef')} l/min · Ø FEV₁ ${average('fev1')} l`;
    for(const r of selected.slice(0,100)){
      const line=node('article','epef-row');const mark=node('span','epef-time-mark');mark.style.backgroundColor=colors[bucket(r.time)];const dataBox=node('div','epef-row-info');
      dataBox.append(node('strong','',`${fmtDate(r.date)} · ${r.time} Uhr`),node('span','',`PEF ${r.pef??'–'} l/min  ·  FEV₁ ${r.fev1??'–'} l${r.status?'  ·  '+r.status:''}`));
      const del=node('button','btn btn-text','Löschen');del.type='button';del.addEventListener('click',async()=>{if(!confirm(`Messung vom ${fmtDate(r.date)} um ${r.time} Uhr löschen?`))return;try{await SEC.del('epef',r.id);await refresh()}catch(e){status('Löschen fehlgeschlagen: '+e.message,true)}});
      line.append(mark,dataBox,del);table.append(line);
    }
    if(!count)table.append(node('p','suite-msg','In diesem Zeitraum sind noch keine ePEF-Messungen gespeichert.'));
    if(count>100)table.append(node('p','suite-msg',`Es werden die neuesten 100 von ${count} Einträgen gezeigt. Die Diagramme enthalten alle Messwerte des gewählten Zeitraums (maximal 400 Punkte).`));
  }
  function drawHome(){
    const section=$('home-epef');if(!section)return;
    const ordered=measurements().slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    const mode=$('home-epef-range').value;
    let subset=ordered;
    if(mode==='last30')subset=ordered.slice(-30);
    else if(mode!=='all'){
      const start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-(Number(mode)-1));
      const cutoff=start.getFullYear()+'-'+String(start.getMonth()+1).padStart(2,'0')+'-'+String(start.getDate()).padStart(2,'0');
      subset=ordered.filter(r=>r.date>=cutoff);
    }
    const chosen=subset.length>400?subset.filter((_,i)=>i%Math.ceil(subset.length/400)===0):subset;
    $('home-epef-count').textContent=`${ordered.length} insgesamt · ${subset.length} angezeigt`;
    $('home-epef-empty').hidden=ordered.length!==0;
    for(const [metric,label,unit,id] of [['pef','PEF','l/min','home-epef-chart-pef'],['fev1','FEV₁','l','home-epef-chart-fev1']]){
      chart(chosen,metric,label,unit,$(id),'home-epef-selected');
    }
    if(!ordered.length)$('home-epef-selected').textContent='Kein gespeicherter ePEF-Wert vorhanden. Bitte den Import auf der Lungenseite prüfen.';
  }
  function redraw(){drawHome();const visible=selectVisible();for(const [k,name,units,id] of [['pef','PEF','l/min','epef-chart-pef'],['fev1','FEV₁','l','epef-chart-fev1']]){
      const target=$(id),limit=400,part=visible.length>limit?visible.filter((x,i)=>i%Math.ceil(visible.length/limit)===0):visible;
      chart(part,k,name,units,target);}
    drawList(visible);
  }
  async function refresh(){all=await SEC.list('epef');const oldDuplicates=duplicates();const fix=$('epef-clean-duplicates');if(fix){fix.hidden=oldDuplicates.length===0;fix.textContent=`${oldDuplicates.length} identische Alt-Einträge prüfen und löschen`;}const setting=all.find(x=>x.kind==='setting'&&x.id==='reference');referencePEF=setting&&Number.isFinite(setting.pef)?setting.pef:null;$('epef-ref-value').value=referencePEF===null?'':String(referencePEF);redraw()}
  function today(){const now=new Date();return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`}
  $('epef-month').value=today().slice(0,7);
  $('home-epef-range')?.addEventListener('change',drawHome);
  $('epef-clean-duplicates')?.addEventListener('click',async()=>{
    if(busy)return;
    const remove=duplicates();if(!remove.length){status('Keine identischen Alt-Einträge gefunden.');return;}
    if(!confirm(`${remove.length} vollständig identische Alt-Einträge löschen? Unterschiedliche Messungen in derselben Minute bleiben erhalten.`))return;
    busy=true;let count=0;
    try{for(const item of remove){await SEC.del('epef',item.id);count++}await refresh();status(`${count} alte identische Doppeleinträge entfernt. Andere Messungen bleiben erhalten.`)}
    catch(e){await refresh().catch(()=>{});status(`Bereinigung unvollständig: ${e.message}`,true)}finally{busy=false}
  });
  $('epef-ref-save').addEventListener('click',async()=>{const raw=$('epef-ref-value').value.trim();const val=raw===''?null:decimal(raw);if(val!==null&&(!Number.isInteger(val)||val<50||val>1400)){status('Referenz-PEF muss zwischen 50 und 1400 l/min liegen.',true);return}try{if(val===null)await SEC.del('epef','reference');else await SEC.put('epef',{id:'reference',kind:'setting',pef:val});status(val===null?'Referenz entfernt.':'Referenzwert lokal verschlüsselt gespeichert.');await refresh()}catch(e){status('Referenz konnte nicht gespeichert werden: '+e.message,true)}});
  $('epef-manual-date').value=today();$('epef-manual-time').value=new Date().toTimeString().slice(0,5);
  $('epef-manual').addEventListener('submit',async ev=>{ev.preventDefault();if(busy){status('Bitte laufenden Import abwarten.');return;}
    const r={date:$('epef-manual-date').value,time:$('epef-manual-time').value,pef:decimal($('epef-manual-pef').value),fev1:decimal($('epef-manual-fev1').value),status:'',source:'Manuell'};
    if(!validRec(r)){status('Datum, Uhrzeit und mindestens ein plausibler Wert erforderlich (PEF 50–1400 l/min, FEV₁ 0,1–12 l).',true);return}
    busy=true;try{const latest=await SEC.list('epef');if(latest.some(x=>x.kind==='measurement'&&fp(x)===fp(r))){status('Diese identische Messung ist bereits gespeichert.',true);return;}await SEC.put('epef',{...r,kind:'measurement',id:(crypto.randomUUID?crypto.randomUUID():`manual-${Date.now()}-${Math.floor(Math.random()*100000)}`),createdAt:new Date().toISOString()});status('Messung verschlüsselt gespeichert.');await refresh();$('epef-manual-pef').value='';$('epef-manual-fev1').value='';}catch(e){status('Speichern fehlgeschlagen: '+e.message,true)}finally{busy=false}
  });
  $('epef-file').addEventListener('change',loadFile);$('epef-sheet').addEventListener('change',chooseSheet);$('epef-header').addEventListener('change',updateColumns);
  mcols.forEach(k=>$('epef-col-'+k).addEventListener('change',checkImport));$('epef-import-confirm').addEventListener('click',importApproved);
  $('epef-range').addEventListener('change',()=>{$('epef-month').hidden=$('epef-range').value!=='month';redraw()});$('epef-month').addEventListener('change',redraw);
  let updateTimer=null;window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='epef'&&!busy){clearTimeout(updateTimer);updateTimer=setTimeout(()=>refresh().catch(()=>{}),120);}});
  refresh().catch(e=>status('Verschlüsselte Messwerte konnten nicht geladen werden: '+e.message,true));
  // Unit-test-only read-only helpers; no access to secret keys or stored data.
  Object.defineProperty(window,'__ASTHMA_EPEF_TEST',{value:Object.freeze({dateValue,timeValue,dateTime,decimal,bucket,collect,fp,guess,csvRows,xlsx,validRec}),configurable:false});
})();
