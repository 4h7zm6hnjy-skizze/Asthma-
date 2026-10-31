'use strict';
/* PneumoPro 3.6.3: Papierfotos im ganzen privaten Bereich als Kopie ansehen.
 * Die Originalbilder bleiben im AES-GCM-Tresor und im DOM unveraendert.
 * Kein Upload und keine OCR/Interpolation von medizinischen Kurven. */
(()=>{
 const S=window.ASTHMA_SECURITY;
 const app=document.getElementById('secure-application');
 if(!app||!S?.state?.().unlocked||window.__PNEUMO_DOC_COPY363)return;
 window.__PNEUMO_DOC_COPY363=true;
 const tasks=new WeakMap();
 const io=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;io.unobserve(entry.target);const run=tasks.get(entry.target);if(run){tasks.delete(entry.target);run();}}
 },{rootMargin:'350px 0px'}):null;
 const eligible=(img)=>{
  if(!(img instanceof HTMLImageElement)||!img.isConnected||!app.contains(img))return false;
  if(img.closest('#raw363,.dc363-wrap,.raw363-dialog,button,a,label,.pneumo-footer-brand,.a281-brand,.m340-cards')||img.id==='scan-preview'||img.closest('#crop-workspace'))return false;
  const src=img.currentSrc||img.src||'';
  if(!/^(?:data:image\/(?:jpeg|jpg|png|webp);base64,|blob:)/i.test(src))return false;
  if(/\b(icon|logo|avatar|qr-code|marke)\b/i.test(img.alt||''))return false;
  return true;
 };
 const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
 // Analyse auf nur 96 x 160 Pixel; der eigentliche Zuschnitt erfolgt
 // erst anschliessend aus dem Original mit Sicherheitsrand.
 function pageBox(image){
  const w=96,h=160,probe=document.createElement('canvas');probe.width=w;probe.height=h;
  const ctx=probe.getContext('2d',{willReadFrequently:true});if(!ctx)return null;
  ctx.drawImage(image,0,0,w,h);
  const data=ctx.getImageData(0,0,w,h).data;
  const lights=new Float32Array(w*h),spread=new Float32Array(w*h);
  const border=[],middle=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=(y*w+x)*4,idx=y*w+x,r=data[i],g=data[i+1],b=data[i+2];
   const v=.299*r+.587*g+.114*b;lights[idx]=v;spread[idx]=Math.max(r,g,b)-Math.min(r,g,b);
   if(y<12||y>=h-12||x<6||x>=w-6)border.push(v);
   if(y>36&&y<124&&x>22&&x<74)middle.push(v);
  }
  const quantile=(a,q)=>{const o=a.sort((x,y)=>x-y);return o[Math.min(o.length-1,Math.floor((o.length-1)*q))]};
  const bg=quantile(border,.5),paper=quantile(middle,.8);
  if(paper-bg<25)return null; // dunkle Medizinbilder / flaechige Scans nicht zuschneiden
  const threshold=Math.max(135,bg+clamp((paper-bg)*.52,13,36));
  const ok=(x,y)=>{const k=y*w+x;return lights[k]>threshold&&spread[k]<75};
  const rows=new Array(h).fill(false);
  for(let y=0;y<h;y++){
   let count=0;for(let x=20;x<76;x++)if(ok(x,y))count++;
   rows[y]=count>=39;
  }
  // Die groesste zusammenhaengende Papierzone waehlen, keine Einzelreflexe.
  let bestStart=-1,bestEnd=-1,run=-1;
  for(let y=0;y<=h;y++){
   if(y<h&&rows[y]&&run<0)run=y;
   if((y===h||!rows[y])&&run>=0){
    if(y-run>bestEnd-bestStart){bestStart=run;bestEnd=y-1;}run=-1;
   }
  }
  if(bestStart<0||bestEnd-bestStart<55)return null;
  const top=bestStart,bottom=bestEnd;
  const cols=new Array(w).fill(false);
  const yFrom=top+Math.round((bottom-top)*.2),yTo=bottom-Math.round((bottom-top)*.2);
  for(let x=0;x<w;x++){
   let count=0;for(let y=yFrom;y<=yTo;y++)if(ok(x,y))count++;
   cols[x]=count/Math.max(1,yTo-yFrom+1)>.67;
  }
  let left=-1,right=-1,opened=-1;
  for(let x=0;x<=w;x++){
   if(x<w&&cols[x]&&opened<0)opened=x;
   if((x===w||!cols[x])&&opened>=0){
    if(x-opened>right-left){left=opened;right=x-1;}opened=-1;
   }
  }
  if(left<0||right-left<37)return null;
  // Rund 1,5% Sicherheitsrand, damit kleine Werte, Diagrammlinien und
  // randnahe handschriftliche Notizen nicht versehentlich abgeschnitten werden.
  const rect={left:clamp((left-2)/w,0,1),top:clamp((top-2)/h,0,1),right:clamp((right+3)/w,0,1),bottom:clamp((bottom+3)/h,0,1)};
  const area=(rect.right-rect.left)*(rect.bottom-rect.top);
  if(area<.3||rect.right<=rect.left||rect.bottom<=rect.top)return null;
  return rect;
 }
 function makeCopy(img){
  const width=img.naturalWidth,height=img.naturalHeight;
  if(!width||!height||width*height>45000000)throw Error('Datei zu gross fuer Scanvorschau');
  const box=pageBox(img);
  const sx=Math.floor((box?.left??0)*width),sy=Math.floor((box?.top??0)*height);
  const sw=Math.min(width-sx,Math.ceil(((box?.right??1)-(box?.left??0))*width));
  const sh=Math.min(height-sy,Math.ceil(((box?.bottom??1)-(box?.top??0))*height));
  if(sw<80||sh<80)throw Error('Automatischer Rand nicht sicher erkannt');
  const factor=Math.min(1,2400/Math.max(sw,sh),Math.sqrt(4500000/(sw*sh)));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(sw*factor));canvas.height=Math.max(1,Math.round(sh*factor));
  const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Canvas nicht verfuegbar');
  ctx.drawImage(img,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
  // Schonende Tonwertaufbereitung nur bei erkanntem Papier. Bei Medizin-
  // oder Farbfotos niemals unbekannte Farbwerte automatisch umwandeln.
  if(box){
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);const p=pixels.data;
   for(let i=0;i<p.length;i+=4){
    const r=p[i],g=p[i+1],b=p[i+2],max=Math.max(r,g,b),min=Math.min(r,g,b);
    if(max-min<37&&min>118){
     for(let k=0;k<3;k++)p[i+k]=clamp((p[i+k]-120)*1.13+136,0,255);
    }
   }
   ctx.putImageData(pixels,0,0);
  }
  return {src:canvas.toDataURL('image/jpeg',.93),cropped:Boolean(box)};
 }
 function enhance(img){
  if(!eligible(img)||img.dataset.dc363Ready==='true')return;
  img.dataset.dc363Ready='true';
  const handle=()=>{
   if(!img.isConnected||!eligible(img)||img.closest('.dc363-wrap'))return;
   try{
    const copy=makeCopy(img);
    const wrap=document.createElement('div');wrap.className='dc363-wrap';
    img.parentNode.insertBefore(wrap,img);wrap.appendChild(img);
    img.classList.add('dc363-original');
    const copyImg=document.createElement('img');copyImg.src=copy.src;copyImg.alt='Aufbereitete Dokumentkopie: '+(img.alt||'Bild');copyImg.className='dc363-copy';copyImg.loading='lazy';
    wrap.append(copyImg);
    const tools=document.createElement('div');tools.className='dc363-tools';
    const label=document.createElement('small');label.textContent=copy.cropped?'Kopie · Ränder automatisch erkannt':'Kopie · kein sicherer Blattrand erkannt';
    const switcher=document.createElement('button');switcher.type='button';switcher.textContent='Original anzeigen';
    let scan=copy.cropped;
    switcher.addEventListener('click',()=>{
     scan=!scan;img.hidden=scan;copyImg.hidden=!scan;
     switcher.textContent=scan?'Original anzeigen':'Kopie anzeigen';
    });
    const zoom=document.createElement('button');zoom.type='button';zoom.textContent='Vergrößern';
    zoom.addEventListener('click',()=>openZoom(scan?copyImg.src:img.src,img.alt||'Dokument',scan?'Scanansicht':'Unverändertes Original'));
    tools.append(label,switcher,zoom);wrap.append(tools);
    img.hidden=scan;copyImg.hidden=!scan;switcher.textContent=scan?'Original anzeigen':'Kopie anzeigen';
   }catch(err){
    // Nie das Original verlieren oder dessen Anzeige blockieren.
    img.dataset.dc363Ready='failed';
   }
  };
  tasks.set(img,handle);
  const start=()=>{if(io)io.observe(img);else setTimeout(handle,60)};
  if(img.complete&&img.naturalWidth>0)start();
  else img.addEventListener('load',start,{once:true});
 }
 const viewer=document.createElement('dialog');viewer.className='dc363-dialog';viewer.setAttribute('aria-label','Dokument vergrößern');
 viewer.innerHTML='<div class="dc363-head"><strong>Dokument</strong><button type="button" class="dc363-close">Schließen</button></div><div class="dc363-stage"><img alt="Dokument in Großansicht" draggable="false"></div><div class="dc363-zoom-controls"><button type="button" data-zoom="out">−</button><button type="button" data-zoom="reset">100 %</button><button type="button" data-zoom="in">+</button></div><p class="dc363-caption"></p>';
 app.append(viewer);
 const big=viewer.querySelector('.dc363-stage img'),stage=viewer.querySelector('.dc363-stage'),head=viewer.querySelector('strong'),caption=viewer.querySelector('.dc363-caption');
 let scale=1,panX=0,panY=0,drag=null,lastTap=0;
 const paint=()=>big.style.transform='translate('+panX+'px,'+panY+'px) scale('+scale+')';
 const zoomTo=x=>{scale=clamp(x,1,6);if(scale===1)panX=panY=0;paint()};
 function openZoom(src,title,mode){big.src=src;head.textContent=title;caption.textContent=mode==='Scanansicht'?'Optisch aufbereitete Kopie. Das Original ist unverändert gespeichert.':'Unveränderte Originaldatei';zoomTo(1);viewer.showModal?.();}
 viewer.querySelector('.dc363-close').addEventListener('click',()=>viewer.close());viewer.addEventListener('close',()=>{big.removeAttribute('src');zoomTo(1)});
 viewer.querySelector('[data-zoom="out"]').addEventListener('click',()=>zoomTo(scale/1.5));viewer.querySelector('[data-zoom="reset"]').addEventListener('click',()=>zoomTo(1));viewer.querySelector('[data-zoom="in"]').addEventListener('click',()=>zoomTo(scale*1.5));
 const distance=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 stage.addEventListener('touchstart',e=>{if(e.touches.length===2)drag={mode:'pinch',distance:distance(e.touches),scale};else if(e.touches.length===1)drag={mode:'pan',x:e.touches[0].clientX,y:e.touches[0].clientY,px:panX,py:panY};},{passive:true});
 stage.addEventListener('touchmove',e=>{
  if(!drag)return;
  if(e.touches.length===2){if(drag.mode!=='pinch')drag={mode:'pinch',distance:distance(e.touches),scale};zoomTo(drag.scale*distance(e.touches)/Math.max(1,drag.distance));e.preventDefault();}
  else if(e.touches.length===1&&drag.mode==='pan'&&scale>1){panX=drag.px+e.touches[0].clientX-drag.x;panY=drag.py+e.touches[0].clientY-drag.y;paint();e.preventDefault();}
 },{passive:false});
 stage.addEventListener('touchend',e=>{if(e.touches.length===0){drag=null;if(e.changedTouches.length===1){const now=Date.now();if(now-lastTap<300)zoomTo(scale>1?1:2.5);lastTap=now;}}},{passive:true});
 viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
 // Bestehende Bilder werden beim Oeffnen eines alten Befundes erkannt;
 // zusaetzliche Bilder im laufenden Import werden automatisch nacherfasst.
 let timer=null;
 function scan(){for(const image of app.querySelectorAll('img'))enhance(image)}
 const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(scan,180)});
 observer.observe(app,{childList:true,subtree:true});
 window.addEventListener('asthma:secure-change',()=>{clearTimeout(timer);timer=setTimeout(scan,180)});
 // Galerie fuer bereits vorhandene Bilder, die bisher nur als
 // Download in der Akte verfuegbar waren. Kein Kopieren der gespeicherten Daten.
 const dateien=document.getElementById('dateien');
 if(dateien){
  const archive=document.createElement('section');archive.id='dc363-archive';archive.className='suite-subpanel';
  const title=document.createElement('h3');title.textContent='Alle gespeicherten Bilder als saubere Kopie';
  const explain=document.createElement('p');explain.textContent='Auch aeltere Bilder aus der verschluesselten Akte hier ansehen. Die Scanansicht ist eine Kopie; das Original bleibt unveraendert.';
  const open=document.createElement('button');open.type='button';open.className='btn btn-outline';open.textContent='Vorhandene Bilder anzeigen';
  const gallery=document.createElement('div');gallery.id='dc363-gallery';gallery.hidden=true;
  const more=document.createElement('button');more.className='btn btn-outline';more.type='button';more.textContent='Weitere Bilder anzeigen';more.hidden=true;
  const close=document.createElement('button');close.type='button';close.className='btn btn-text';close.textContent='Galerie schließen';close.hidden=true;
  archive.append(title,explain,open,gallery,more,close);dateien.append(archive);
  let all=[],shown=0,urls=[],generation=0;
  function release(){for(const url of urls)URL.revokeObjectURL(url);urls=[];gallery.replaceChildren();shown=0;more.hidden=true;}
  const dateOf=r=>r.documentDate||r.date||r.value?.date||(r.createdAt||'').slice(0,10)||'';
  const labelOf=(r,group)=>String(r.name||r.attachment?.name||r.value?.attachment?.name||r.kind||r.type||group||'Bild').slice(0,120);
  function gather(group,rows){
   for(const row of rows){
    const stack=[{v:row,depth:0}],seen=new Set();let found=0;
    while(stack.length&&found<6){
     const {v,depth}=stack.pop();if(!v||typeof v!=='object'||seen.has(v)||depth>4)continue;seen.add(v);
     if(v instanceof Blob)continue;
     for(const [key,item] of Object.entries(v)){
      let candidate=null;
      if(item instanceof Blob&&item.type.startsWith('image/'))candidate=item;
      else if(typeof item==='string'&&/^data:image\/(?:jpeg|png|webp);base64,/i.test(item))candidate=item;
      if(candidate){all.push({source:candidate,title:labelOf(row,group),date:dateOf(row),group});found++;}
      else if(item&&typeof item==='object'&&depth<4&&key!=='blob')stack.push({v:item,depth:depth+1});
     }
    }
   }
  }
  function showMore(){const batch=all.slice(shown,shown+24);shown+=batch.length;
   for(const doc of batch){const item=document.createElement('figure');item.className='dc363-archive-item';
    const caption=document.createElement('figcaption');caption.textContent=(doc.date?doc.date+' · ':'')+doc.title;item.append(caption);
    const img=document.createElement('img');
    if(doc.source instanceof Blob){const url=URL.createObjectURL(doc.source);urls.push(url);img.src=url;}
    else img.src=doc.source;
    img.alt='Originalbild '+doc.title;img.loading='lazy';item.append(img);gallery.append(item);
   }
   more.hidden=shown>=all.length;
  }
  open.addEventListener('click',async()=>{
   const myGeneration=++generation;open.disabled=true;open.textContent='Bilder werden lokal geladen …';release();all=[];
   try{
    const groups=['documents','suite','labs','cases','diary'];
    for(const group of groups){const rows=await S.list(group);if(myGeneration!==generation)return;gather(group,rows);}
    // Kein Netzwerkverkehr: alles stammt aus dem lokal entsperrten Tresor.
    all.sort((a,b)=>b.date.localeCompare(a.date));
    gallery.hidden=false;close.hidden=false;
    if(!all.length){gallery.textContent='Keine gespeicherten Bilddateien im privaten Tresor gefunden.';}
    else showMore();
    open.textContent='Bilder neu laden';
   }catch(err){gallery.hidden=false;gallery.textContent='Bilder konnten nicht geladen werden: '+String(err.message||err);}
   finally{open.disabled=false;}
  });
  more.addEventListener('click',showMore);
  close.addEventListener('click',()=>{generation++;release();gallery.hidden=true;close.hidden=true;open.textContent='Vorhandene Bilder anzeigen';});
 }
 scan();
 window.__ASTHMA_DOC_COPY363_TEST=Object.freeze({version:'3.6.3',automatic:true,originalsPreserved:true});
})();
