'use strict';
/* Asthma 2.9.7 – numeric chart annotations, no-dependency, entirely offline, iPhone-friendly PDF export.
 * No window.print() is required from a standalone PWA. Does not read raw vault data:
 * uses only the existing, already calculated local statistics DOM after user confirmation.
 * Output is a local unencrypted PDF and can be shared via the native iOS share sheet.
 */
(()=>{
 const $=id=>document.getElementById(id);
 const source=$('stats25-report'),generateButton=$('stats25-print'),pdfButton=$('stats25-pdf');
 if(!source||!generateButton||!pdfButton)return;
 const labels=Object.fromEntries([...(window.ASTHMA_STATSP292?.baseKinds||[]),...(window.ASTHMA_STATSP292?.kinds||[])]);
 const IDs=Object.keys(labels), PAGE_W=595.28,PAGE_H=841.89,MARGIN=43,LEFT=MARGIN,RIGHT=PAGE_W-MARGIN,TOP=PAGE_H-55,BOTTOM=53,WIDTH=RIGHT-LEFT;
 const $status=$('stats25-status');let output=null,outputName='',working=false,signature='';
 const ui=document.createElement('div');ui.id='as297-pdf-actions';ui.style.cssText='display:flex;flex-direction:column;gap:10px;margin:12px 0;padding:14px;border:1px solid #9bcbd4;background:#edf8fa;border-radius:12px';
 const share=document.createElement('button');share.type='button';share.id='as297-share';share.className='btn btn-primary';share.textContent='PDF teilen / In Dateien sichern';share.hidden=true;
 const fallback=document.createElement('a');fallback.id='as297-download';fallback.className='btn btn-outline';fallback.textContent='PDF herunterladen';fallback.hidden=true;fallback.download='Asthma_Statistik.pdf';fallback.style.textAlign='center';
 const info=document.createElement('p');info.id='as297-info';info.style.cssText='font-size:13px;margin:0;line-height:1.5';info.textContent='PDF wird auf diesem iPhone erstellt. Zum Speichern die Datei teilen und „In Dateien sichern“ wählen. Zum Drucken die PDF-Datei im Teilen-Menü an „Drucken“ übergeben.';
 ui.append(info,share,fallback);pdfButton.closest('.stats25-actions')?.insertAdjacentElement('afterend',ui);
 let objectUrl=null;
 function reset(){if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}output=null;share.hidden=true;fallback.hidden=true;}
 function status(message,problem=false){if($status)$status.textContent=message;info.textContent=message;info.style.color=problem?'#a02b20':'#225969';}
 function picks(){const options=$('statsplus292-options');return Object.fromEntries(IDs.map(id=>{const box=[...(options?.querySelectorAll('input[type="checkbox"]')||[])].find(x=>x.value===id);return [id,box?box.checked:false];}));}
 function key(){return [window.ASTHMA_STATSP292?.getLastKey?.()||'',...Object.entries(picks()).filter(x=>x[1]).map(x=>x[0])].join('_');}
 function sections(p){const children=[];
   const showBase=(window.ASTHMA_STATSP292?.baseKinds||[]).some(([id])=>p[id]);
   for(const child of source.children){
     if(child.id==='statsplus292-appendix')continue;
     if(child.classList.contains('stats25-heading')||child.classList.contains('stats25-footer')){if(showBase)children.push({type:'old',node:child});}
     else if(child.dataset.s292Base&&p[child.dataset.s292Base])children.push({type:'old',node:child});
   }
   const appendix=source.querySelector('#statsplus292-appendix');
   if(appendix){for(const cat of appendix.querySelectorAll('.s292-category[data-s292-kind]'))if(p[cat.dataset.s292Kind])children.push({type:'category',node:cat,kind:cat.dataset.s292Kind});}
   return children;
 }
 function sanitize(s){return String(s||'').replace(/\s+/g,' ').trim().replace(/₁/g,'1').replace(/₂/g,'2').replace(/₃/g,'3').replace(/₄/g,'4').replace(/⁻/g,'-').replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/→/g,'->').replace(/↗/g,'->').replace(/↔/g,'<->').replace(/∅/g,'Durchschnitt').replace(/⌀/g,'Durchschnitt');}
 const cp1252={'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159};
 function pdfLiteral(text){let r='';for(const ch of sanitize(text)){const v=cp1252[ch]||ch.codePointAt(0);if(v===40||v===41||v===92)r+='\\'+String.fromCharCode(v);else if(v<32&&v!==9)r+=' ';else if(v>126&&v<256)r+='\\'+v.toString(8).padStart(3,'0');else if(v>=32&&v<127)r+=ch;else r+='?';}return '('+r+')';}
 const measure=document.createElement('canvas').getContext('2d');
 function wrap(text,size,maxWidth,bold=false){const words=sanitize(text).split(/\s+/).filter(Boolean);const out=[];let line='';measure.font=`${bold?'700 ':'400 '}${size}px Arial`;
   for(let word of words){const split=[];if(measure.measureText(word).width>maxWidth){let sub='';for(const ch of word){if(sub&&measure.measureText(sub+ch).width>maxWidth){split.push(sub);sub=ch;}else sub+=ch;}if(sub)split.push(sub);}else split.push(word);
     for(const part of split){const next=line?line+' '+part:part;if(line&&measure.measureText(next).width>maxWidth){out.push(line);line=part;}else line=next;}
   }if(line)out.push(line);return out.length?out:[''];}
 const pdfNumber=x=>Number(x.toFixed(2)).toString();
 function canvasJpeg(svg){const vb=(svg.getAttribute('viewBox')||'0 0 690 235').split(/\s+/).map(Number);const w=vb[2]||690,h=vb[3]||235;const canvas=document.createElement('canvas');canvas.width=Math.min(1400,Math.round(w*1.6));canvas.height=Math.round(canvas.width*h/w);const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas-Grafik ist auf diesem Gerät nicht verfügbar.');
   ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.scale(canvas.width/w,canvas.height/h);
   for(const el of svg.children){const tag=el.tagName.toLowerCase(),get=(name,defaultValue=0)=>Number(el.getAttribute(name)||defaultValue),paint=el.getAttribute('stroke')||'#367a91';
     if(tag==='line'){ctx.beginPath();ctx.moveTo(get('x1'),get('y1'));ctx.lineTo(get('x2'),get('y2'));ctx.strokeStyle=paint;ctx.lineWidth=get('stroke-width',1);ctx.setLineDash((el.getAttribute('stroke-dasharray')||'').split(/[ ,]+/).filter(Boolean).map(Number));ctx.stroke();ctx.setLineDash([]);}
     else if(tag==='polyline'){const points=(el.getAttribute('points')||'').trim().split(/\s+/).map(p=>p.split(',').map(Number)).filter(a=>a.length===2&&a.every(Number.isFinite));if(points.length){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=paint;ctx.lineWidth=get('stroke-width',2);ctx.stroke();}}
     else if(tag==='circle'){ctx.beginPath();ctx.arc(get('cx'),get('cy'),get('r',2),0,Math.PI*2);ctx.fillStyle=el.getAttribute('fill')||'#247e76';ctx.fill();}
     else if(tag==='text'){ctx.fillStyle=el.getAttribute('fill')||'#526779';ctx.font=`${get('font-size',11)}px Arial`;ctx.textAlign=({end:'right',middle:'center'}[el.getAttribute('text-anchor')]||'left');ctx.fillText(Array.from(el.childNodes).filter(n=>n.nodeType===3).map(n=>n.nodeValue).join(''),get('x'),get('y'));}
   }
   const data=canvas.toDataURL('image/jpeg',0.89).split(',')[1];const raw=atob(data),buf=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)buf[i]=raw.charCodeAt(i);return {data:buf,width:canvas.width,height:canvas.height};
 }
 function pdfRaster(img){
   const canvas=document.createElement('canvas'),width=Math.min(1200,img.naturalWidth||img.width||864);
   canvas.width=Math.max(1,width);canvas.height=Math.max(1,Math.round(width*(img.naturalHeight||img.height||1536)/(img.naturalWidth||img.width||864)));
   const ctx=canvas.getContext('2d');if(!ctx)throw Error('Originaldiagramm konnte nicht gerendert werden.');
   ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
   const raw=atob(canvas.toDataURL('image/jpeg',0.78).split(',')[1]),buffer=new Uint8Array(raw.length);
   for(let i=0;i<raw.length;i++)buffer[i]=raw.charCodeAt(i);
   return {data:buffer,width:canvas.width,height:canvas.height};
 }
 class Layout{
   constructor(){this.pages=[];this.page();}
   page(){this.current={ops:[],images:[]};this.pages.push(this.current);this.y=TOP;this.line([LEFT,BOTTOM-18,WIDTH,0],0.5,'#d6e3e7');this.textRaw('Asthma · privater Gesundheitsbericht',LEFT,BOTTOM-29,8,'#5f7d88');}
   reserve(n){if(this.y-n<BOTTOM+14)this.page();}
   textRaw(text,x,y,size=11,color='#203949',bold=false){const hex=color.replace('#','');const rgb=[0,2,4].map(n=>parseInt(hex.slice(n,n+2),16)/255).map(pdfNumber).join(' ');this.current.ops.push(`BT ${rgb} rg /${bold?'F2':'F1'} ${pdfNumber(size)} Tf 1 0 0 1 ${pdfNumber(x)} ${pdfNumber(y)} Tm ${pdfLiteral(text)} Tj ET`);}
   para(text,size=10,gap=5,color='#203949',bold=false,indent=0){const lines=wrap(text,size,WIDTH-indent-3,bold),step=size*1.4;for(const l of lines){this.reserve(step);this.textRaw(l,LEFT+indent,this.y,size,color,bold);this.y-=step;}this.y-=gap;}
   heading(text,level=2){const size=level===1?18:level===2?14:12;this.reserve(size*2.8);this.para(text,size,7,level===1?'#14536b':'#164b61',true);this.y-=3;}
   line(arr,width=1,color='#d9e6e8'){const rgb=[0,2,4].map(n=>parseInt(color.slice(n+1,n+3),16)/255).map(pdfNumber).join(' ');this.current.ops.push(`${rgb} RG ${pdfNumber(width)} w ${arr.map(pdfNumber).join(' ')} re S`);}
   rule(){this.reserve(10);this.line([LEFT,this.y-1,WIDTH,0],.7,'#b9d6da');this.y-=12;}
   row(name,value){const first=wrap(name,10,WIDTH*.57),second=wrap(value,10,WIDTH*.38,true),count=Math.max(first.length,second.length);this.reserve(count*14+8);first.forEach((line,i)=>this.textRaw(line,LEFT,this.y-i*14,10,'#385f71'));second.forEach((line,i)=>this.textRaw(line,LEFT+WIDTH*.61,this.y-i*14,10,'#183e52',true));this.y-=count*14+7;this.rule();}
   kpiGrid(cells){const width=(WIDTH-20)/3,height=71;for(let i=0;i<cells.length;i++){if(i%3===0){this.reserve(height+8);}const x=LEFT+(i%3)*(width+10);const y=this.y;this.current.ops.push('0.88 0.93 0.94 RG 0.65 w '+[x,y-height+12,width,height-8].map(pdfNumber).join(' ')+' re S');const title=wrap(cells[i].title,9,width-14).slice(0,2),value=wrap(cells[i].value,17,width-12,true);title.forEach((t,j)=>this.textRaw(t,x+8,y-8-j*11,9,'#4c6c7d'));this.textRaw(value[0]||'-',x+8,y-42,17,'#123e52',true);if(i%3===2||i===cells.length-1)this.y-=height+8;}this.y-=6;}
   image(svg){const img=canvasJpeg(svg);const targetW=WIDTH-8,targetH=targetW*img.height/img.width;this.reserve(targetH+12);const idx=this.current.images.length+1;this.current.images.push({name:'Im'+idx,...img});this.current.ops.push(`q ${pdfNumber(targetW)} 0 0 ${pdfNumber(targetH)} ${pdfNumber(LEFT+4)} ${pdfNumber(this.y-targetH+4)} cm /Im${idx} Do Q`);this.y-=targetH+13;}
   photo(img){
     const j=img.__asthmaPdfJpeg;if(!j){this.para('Originaldiagramm nicht lesbar.',9,8);return;}
     const w=Math.min(WIDTH-8,((TOP-BOTTOM)-112)*j.width/j.height),h=w*j.height/j.width;
     this.reserve(h+20);const i=this.current.images.length+1;
     this.current.images.push({name:'Im'+i,...j});
     this.current.ops.push(`q ${pdfNumber(w)} 0 0 ${pdfNumber(h)} ${pdfNumber(LEFT+4)} ${pdfNumber(this.y-h+4)} cm /Im${i} Do Q`);this.y-=h+18;
   }
   table(table){const heads=[...table.querySelectorAll('thead th')].map(x=>sanitize(x.textContent)),rows=[...table.querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>sanitize(td.textContent)));if(!heads.length)return;
     const colWidth=WIDTH/heads.length;const render=(cells,heading=false)=>{const font=heading?9:8,lines=cells.map(t=>wrap(t,font,colWidth-8,heading)),count=Math.max(1,...lines.map(x=>x.length)),height=count*11+6;this.reserve(height+8);if(heading){this.current.ops.push('0.91 0.96 0.97 rg '+[LEFT,this.y-height+7,WIDTH,height].map(pdfNumber).join(' ')+' re f');}for(let i=0;i<cells.length;i++){lines[i].forEach((s,j)=>this.textRaw(s,LEFT+5+i*colWidth,this.y-j*11,font,heading?'#174c61':'#233f50',heading));}this.y-=height;this.line([LEFT,this.y+3,WIDTH,0],0.4,'#e0e9eb');};
     render(heads,true);for(const cells of rows){if(this.y< BOTTOM+55){this.page();render(heads,true);}render(cells,false);}this.y-=12;
   }
   old(node){if(node.classList?.contains('stats25-tiles')){const cells=[...node.querySelectorAll('.stats25-kpi')].map(c=>({title:c.querySelector('.stats25-label')?.textContent||'',value:c.querySelector('.stats25-figure')?.textContent||''}));this.kpiGrid(cells);return;}
     if(node.classList?.contains('stats25-line')){this.row(node.querySelector('span')?.textContent||'',node.querySelector('strong')?.textContent||'');return;}
     if(node.classList?.contains('stats25-kpi'))return;
     const tag=node.tagName?.toLowerCase();if(tag==='h1'||tag==='h2'||tag==='h3'||tag==='h4'){this.heading(node.textContent,tag==='h2'?1:tag==='h3'?2:3);return;}
     if(tag==='img'){return;}
     if(tag==='table'){this.table(node);return;}
     if(tag==='p'||tag==='small'||tag==='footer'){this.para(node.textContent,tag==='footer'?8:10,8,tag==='footer'?'#536a73':'#293f4a');return;}
     if(tag==='li'){this.para('• '+node.textContent,9,5);return;}
     const kids=[...node.children];if(kids.length){for(const child of kids)this.old(child);}else if(node.textContent?.trim())this.para(node.textContent,10,8);
   }
   category(node){if(this.y<TOP-1)this.page();if(['sleepimages','walkimages','imagingimages'].includes(node.dataset.s292Kind)){const first=node.querySelector('.s341-report-image img'),j=first?.__asthmaPdfJpeg;if(j){const w=Math.min(WIDTH-8,((TOP-BOTTOM)-112)*j.width/j.height),h=w*j.height/j.width;this.reserve(h+83);}}const h=node.querySelector(':scope > h3');this.heading(h?.textContent||'Messwerte',1);for(const child of node.children){if(child===h)continue;if(child.classList.contains('s292-summary')){for(const item of child.children)this.para(item.textContent,9,5,'#2a5a6b',true);this.y-=4;}
       else if(child.classList.contains('s292-chart-box')){const svg=child.querySelector('svg');if(svg)this.image(svg);const legends=[...child.querySelectorAll('.s292-legend span>span')].map(e=>e.textContent);if(legends.length)this.para(legends.join(' · '),8,8,'#526b75');for(const x of child.querySelectorAll('.s292-summary>span'))this.para(x.textContent,8.2,4,'#285568',true);const explanation=child.querySelector('p.s292-note');if(explanation)this.para(explanation.textContent,8,9,'#526b75');}
       else if(child.classList.contains('s292-table-wrap')){const tab=child.querySelector('table');if(tab)this.table(tab);}
       else if(child.classList.contains('s341-report-image')){const cap=child.querySelector('figcaption'),pic=child.querySelector('img'),j=pic?.__asthmaPdfJpeg;if(j){const w=Math.min(WIDTH-8,((TOP-BOTTOM)-112)*j.width/j.height);const h=w*j.height/j.width;const lines=cap?wrap(cap.textContent,10,WIDTH,true).length:0;this.reserve(h+lines*14+29);}if(cap)this.para(cap.textContent,10,8,'#194d67',true);if(pic)this.photo(pic);}
       else if(child.tagName==='H4'){this.heading(child.textContent,3);}else if(child.matches('p'))this.para(child.textContent,9,8,'#556d76');
     }}
 }
 function createPDF(layout){const objects=[null],add=v=>{objects.push(v);return objects.length-1;},font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),bold=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'),pages=add(''),kids=[];
   for(const [index,page] of layout.pages.entries()){const xrefs=[];for(const img of page.images){const no=add({dictionary:`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.data.length} >>`,stream:img.data});xrefs.push(`/${img.name} ${no} 0 R`);}
     const ops=page.ops.concat([`BT 0.35 0.47 0.52 rg /F1 8 Tf 1 0 0 1 ${pdfNumber(RIGHT-58)} ${pdfNumber(BOTTOM-29)} Tm ${pdfLiteral(`${index+1} / ${layout.pages.length}`)} Tj ET`]).join('\n');const stream=new TextEncoder().encode(ops+'\n');const content=add({dictionary:`<< /Length ${stream.length} >>`,stream});const pageObj=add(`<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${font} 0 R /F2 ${bold} 0 R >> /XObject << ${xrefs.join(' ')} >> >> /Contents ${content} 0 R >>`);kids.push(pageObj);}
   objects[pages]=`<< /Type /Pages /Count ${kids.length} /Kids [${kids.map(x=>`${x} 0 R`).join(' ')}] >>`;const catalog=add(`<< /Type /Catalog /Pages ${pages} 0 R >>`);
   const parts=[],offsets=[0];let total=0;const write=chunk=>{const a=typeof chunk==='string'?new TextEncoder().encode(chunk):chunk;parts.push(a);total+=a.length;};write('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
   for(let i=1;i<objects.length;i++){offsets.push(total);write(i+' 0 obj\n');const obj=objects[i];if(typeof obj==='string')write(obj+'\n');else{write(obj.dictionary+'\nstream\n');write(obj.stream);write('\nendstream\n');}write('endobj\n');}
   const xref=total;write(`xref\n0 ${objects.length}\n0000000000 65535 f \n`);for(let i=1;i<objects.length;i++)write(String(offsets[i]).padStart(10,'0')+' 00000 n \n');write(`trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
   return new Blob(parts,{type:'application/pdf'});
 }
 async function make(){if(working)return;const selected=picks(),requested=Object.entries(selected).filter(([id,yes])=>yes).map(([id])=>id);
   if(!requested.length){status('Bitte mindestens einen Bereich auswählen.',true);return;}
   if(!source.querySelector('.stats25-heading')){status('Bitte zuerst auf „Statistik berechnen“ tippen.',true);return;}
   if(window.__s292Building){status('Diagramme werden noch berechnet. Bitte danach erneut versuchen.',true);return;}
   if(requested.some(id=>(window.ASTHMA_STATSP292?.kinds||[]).some(([key])=>key===id))&&!source.querySelector('#statsplus292-appendix')){status('Zusätzliche Diagramme fehlen. Bitte Statistik neu berechnen.',true);return;}
   const cur=window.ASTHMA_STATS25?.range?.()?.key,reportKey=window.ASTHMA_STATSP292?.getLastKey?.();if(cur&&reportKey&&cur!==reportKey){status('Zeitraum geändert: Bitte die Statistik neu berechnen.',true);return;}
   if(!confirm('Das PDF enthält unverschlüsselte Gesundheitsdaten. Lokal erstellen und danach sicher speichern?'))return;
   working=true;generateButton.disabled=true;pdfButton.disabled=true;reset();status('PDF wird vollständig auf deinem iPhone erstellt …');
   try{
     let unreadableImages=0;
     for(const kind of ['sleepimages','walkimages','imagingimages']){
       if(!selected[kind])continue;
       for(const img of source.querySelectorAll('[data-s292-kind="'+kind+'"] img')){
         delete img.__asthmaPdfJpeg;
         try{
           if(!img.complete||img.naturalWidth===0){if(typeof img.decode==='function')await img.decode();}
           if(!img.naturalWidth)throw Error('Bild nicht dekodierbar');
           img.__asthmaPdfJpeg=pdfRaster(img);
         }catch(error){unreadableImages++;}
       }
     }
     // First layout the actual report to obtain REAL start pages for all selected
     // sections (including automatic page breaks inside tables / charts).
     const bodyLayout=new Layout(),entries=[];
     for(const part of sections(selected)){
       const id=part.type==='category'?part.kind:part.node.dataset.s292Base;
       const originalHeading=bodyLayout.heading;
       let startPage=null;
       if(id&&labels[id])bodyLayout.heading=function(...args){originalHeading.apply(this,args);if(startPage===null)startPage=this.pages.length;};
       try{if(part.type==='category')bodyLayout.category(part.node);else bodyLayout.old(part.node);}
       finally{bodyLayout.heading=originalHeading;}
       if(id&&labels[id])entries.push({label:labels[id],page:startPage||bodyLayout.pages.length});
     }
     // A short front matter section with accurate page numbers. Drawing the
     // contents separately prevents it from changing body layout / diagrams.
     function contents(offset){
       const toc=new Layout();toc.heading('Inhaltsverzeichnis',1);
       const reportTitle=source.querySelector('.stats25-heading h2')?.textContent?.trim()||'Gesundheitsbericht';
       toc.para(reportTitle,11,15,'#3d6475');
       for(const [i,entry] of entries.entries()){
         const number=String(i+1).padStart(2,'0');
         const lines=wrap(number+'  '+entry.label,10,WIDTH-68);
         const height=lines.length*15+8;toc.reserve(height);
         lines.forEach((line,k)=>toc.textRaw(line,LEFT+4,toc.y-k*15,10,'#244b5e',false));
         toc.textRaw(String(entry.page+offset),RIGHT-30,toc.y,10,'#194f68',true);
         toc.y-=height;
         toc.line([LEFT,toc.y+5,WIDTH,0],0.35,'#dbe7eb');
       }
       toc.para('Aufgeführt sind ausschließlich die für Druck und PDF ausgewählten Berichtsteile.',9,7,'#526e7a');
       return toc;
     }
     let count=0,toc;
     for(let i=0;i<4;i++){toc=contents(count);if(toc.pages.length===count)break;count=toc.pages.length;}
     const layout={pages:[...toc.pages,...bodyLayout.pages]};
     const result=createPDF(layout);if(result.size<450||result.size>50*1024*1024)throw Error('PDF-Datei ist leer oder ungewöhnlich groß.');
     const period=String(reportKey||cur||new Date().toISOString().slice(0,10)).replace(/[^0-9-]/g,'_');outputName='PneumoPro_Statistik_'+period+'.pdf';output=result;signature=key();objectUrl=URL.createObjectURL(result);
     fallback.href=objectUrl;fallback.download=outputName;fallback.hidden=false;share.hidden=false;
     status('PDF erstellt ('+Math.round(result.size/1024)+' KB, '+layout.pages.length+' Seiten). '+(unreadableImages?unreadableImages+' Originalbild(er) konnten nicht eingebettet werden; bitte im Tresor prüfen. ':'')+'Jetzt „PDF teilen / In Dateien sichern“ wählen. Auch Drucken ist über das Teilen-Menü möglich.');
   }catch(error){reset();status('PDF konnte nicht erstellt werden: '+(error?.message||String(error)),true);}
   finally{working=false;generateButton.disabled=false;pdfButton.disabled=false;}
 }
 async function sharePDF(){if(!output){status('Bitte zuerst das PDF erstellen.',true);return;}if(signature!==key()){status('Auswahl verändert. Bitte das PDF erneut erstellen.',true);return;}
   const file=new File([output],outputName,{type:'application/pdf'});
   if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({files:[file],title:'PneumoPro-Statistik'});status('PDF an das iPhone-Teilen-Menü übergeben. Bei „In Dateien sichern“ den Speicherort auswählen.');}catch(err){if(err?.name!=='AbortError')status('Teilen konnte nicht geöffnet werden. Nutze „PDF herunterladen“ darunter.',true);}}
   else{status('Das iPhone bietet hier kein Teilen von PDF-Dateien an. Nutze „PDF herunterladen“.');fallback.click();}
 }
 share.addEventListener('click',sharePDF);
 const changed=$('statsplus292-options');changed?.addEventListener('change',()=>{if(output){reset();status('Druckauswahl geändert. Bitte PDF erneut erstellen.');}});
 $('stats25-build')?.addEventListener('click',()=>{if(output){reset();status('Neue Auswertung angefordert. Bitte anschließend das PDF neu erstellen.');}});
 document.addEventListener('click',e=>{const b=e.target.closest?.('#stats25-print,#stats25-pdf');if(!b)return;e.preventDefault();e.stopImmediatePropagation();make();},true);
 window.addEventListener('pagehide',()=>{if(objectUrl)URL.revokeObjectURL(objectUrl);});
 window.ASTHMA_PRINT297_TEST=Object.freeze({makePDF:make,getStatus:()=>info.textContent,hasPDF:()=>Boolean(output),getPDF:()=>output,selected:picks});
})();
