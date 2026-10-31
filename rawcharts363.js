'use strict';
/* PneumoPro 3.6.3 – Nur echte Klinikdiagramme, aus den lokal verschlüsselten
 * Originalfotos zugeschnitten. Grayscale/Scan ist reine Bildaufbereitung,
 * keine Kurvenrekonstruktion und keine Aenderung gespeicherter Daten. */
(()=>{
 const S=window.ASTHMA_SECURITY;
 const heading=document.querySelector('#lungenwerte .d26-lung-heading');
 if(!S?.state?.().unlocked||!heading||document.getElementById('raw363'))return;
 const specs=[
  {type:'measurements',name:'IMG_6127(2).jpeg',title:'Atemwegswiderstand',box:[120,397,493,651]},
  {type:'measurements',name:'IMG_6127(2).jpeg',title:'Fluss-Volumen · Body',box:[513,388,810,679]},
  {type:'measurements',name:'IMG_6127(2).jpeg',title:'Fluss-Volumen · Spirometrie',box:[578,693,812,985]},
  {type:'diffusion',name:'IMG_6125(2).jpeg',title:'Diffusion · Volumen-Zeit',box:[85,501,417,716]},
  {type:'diffusion',name:'IMG_6125(2).jpeg',title:'Diffusion · CH₄/CO',box:[415,499,760,716]}
 ];
 const make=(tag,className,label)=>{const e=document.createElement(tag);if(className)e.className=className;if(label!==undefined)e.textContent=label;return e;};
 const box=make('section','raw363');box.id='raw363';box.setAttribute('aria-label','Originaldiagramme des letzten Kliniktests');
 box.append(make('h3','','Originaldiagramme als Scanansicht'));
 const info=make('p','raw363-note','Nur die echten Klinikdiagramme vom 28.10.2026, als ausgeschnittene und optisch aufgehellte Scanansichten. Keine nachgezeichneten Kurven. Die Originalfotos bleiben unverändert im Befund.');box.append(info);
 const grid=make('div','raw363-grid');box.append(grid);
 heading.append(box);
 const dialog=make('dialog','raw363-dialog');dialog.setAttribute('aria-label','Originaldiagramm vergrößert');
 const bar=make('div','raw363-bar'),name=make('strong','','Originaldiagramm'),close=make('button','','Schließen');close.type='button';close.setAttribute('aria-label','Vergrößerung schließen');bar.append(name,close);
 const viewport=make('div','raw363-viewport'),full=make('img','','');full.alt='Vergrößerter Originaldiagrammausschnitt mit Scanaufbereitung';full.draggable=false;viewport.append(full);
 const actions=make('div','raw363-actions'),minus=make('button','','−'),plus=make('button','','+'),reset=make('button','','100 %');[minus,plus,reset].forEach(b=>{b.type='button';actions.append(b)});
 dialog.append(bar,viewport,actions,make('p','raw363-dialog-note','Scanaufbereitung nur für die Ansicht: Kurvengeometrie aus dem Originalfoto unverändert.'));document.body.append(dialog);
 let scale=1,panX=0,panY=0,gesture=null,epoch=0;
 const redraw=()=>{full.style.transform='translate('+panX+'px,'+panY+'px) scale('+scale+')';};
 const zoom=n=>{scale=Math.min(7,Math.max(1,n));if(scale===1){panX=0;panY=0;}redraw();};
 minus.addEventListener('click',()=>zoom(scale/1.4));plus.addEventListener('click',()=>zoom(scale*1.4));reset.addEventListener('click',()=>zoom(1));
 close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{full.removeAttribute('src');zoom(1);});
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 const dist=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 viewport.addEventListener('touchstart',e=>{if(e.touches.length===2){gesture={kind:'pinch',distance:dist(e.touches),startScale:scale};}else if(e.touches.length===1){gesture={kind:'pan',x:e.touches[0].clientX,y:e.touches[0].clientY,px:panX,py:panY};}},{passive:true});
 viewport.addEventListener('touchmove',e=>{if(!gesture)return;if(e.touches.length===2){if(gesture.kind!=='pinch')gesture={kind:'pinch',distance:dist(e.touches),startScale:scale};zoom(gesture.startScale*dist(e.touches)/Math.max(1,gesture.distance));e.preventDefault();}else if(e.touches.length===1&&gesture.kind==='pan'&&scale>1){panX=gesture.px+e.touches[0].clientX-gesture.x;panY=gesture.py+e.touches[0].clientY-gesture.y;redraw();e.preventDefault();}},{passive:false});
 viewport.addEventListener('touchend',()=>{gesture=null},{passive:true});
 full.addEventListener('dblclick',()=>zoom(scale>1?1:2.5));
 let lastTouch=0;full.addEventListener('touchend',e=>{if(e.changedTouches.length!==1)return;const now=Date.now();if(now-lastTouch<280)zoom(scale>1?1:2.5);lastTouch=now;},{passive:true});
 const imgFromData=data=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Das Originalfoto kann nicht gelesen werden.'));img.src=data;});
 function scanCrop(img,rect){const [x0,y0,x1,y1]=rect;const w=x1-x0,h=y1-y0;
  if(w<20||h<20||x0<0||y0<0||x1>img.naturalWidth||y1>img.naturalHeight)throw Error('Der Diagrammausschnitt passt nicht zum Originalfoto.');
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Scanansicht wird von diesem Browser nicht unterstützt.');
  ctx.drawImage(img,x0,y0,w,h,0,0,w,h);
  const data=ctx.getImageData(0,0,w,h),pixels=data.data;
  // Nur Tonwertkorrektur pro Originalpixel, nie Linien nachzeichnen oder Messwerte erfinden.
  // Der dokumenteigene helle Grauwert wird als Hintergrund ermittelt, damit auch
  // feine, auf den Klinikfotos helle Linien nicht wie bisher weiß abgeschnitten werden.
  const histogram=new Uint32Array(256),count=pixels.length/4;
  for(let i=0;i<pixels.length;i+=4){const g=Math.round(.299*pixels[i]+.587*pixels[i+1]+.114*pixels[i+2]);histogram[g]++;}
  let cumulative=0,background=230;
  for(let g=0;g<256;g++){cumulative+=histogram[g];if(cumulative>=count*.90){background=g;break;}}
  for(let i=0;i<pixels.length;i+=4){
   const gray=.299*pixels[i]+.587*pixels[i+1]+.114*pixels[i+2];
   const shade=Math.max(0,Math.min(253,Math.round(253-Math.max(0,background-gray)*3.1)));
   pixels[i]=shade;pixels[i+1]=shade;pixels[i+2]=shade;
  }
  ctx.putImageData(data,0,0);return canvas.toDataURL('image/png');
 }
 function openZoom(src,title){full.src=src;name.textContent=title;zoom(1);if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');}
 const isValidImage=(r,s)=>r?.value?.date==='2026-10-28'&&r.type===s.type&&r.value?.attachment?.name===s.name&&/^data:image\/(jpeg|png);base64,/.test(r.value.attachment.data||'');
 async function refresh(){const call=++epoch;const rows=await S.list('suite');if(call!==epoch)return;grid.replaceChildren();const decoded=new Map();let count=0;
  for(const spec of specs){const found=rows.filter(r=>isValidImage(r,spec)).sort((a,b)=>(b.value?.createdAt||'').localeCompare(a.value?.createdAt||''))[0];if(!found)continue;
   try{const id=spec.type;let img=decoded.get(id);if(!img){img=await imgFromData(found.value.attachment.data);if(call!==epoch)return;decoded.set(id,img);}if(img.naturalWidth!==864||img.naturalHeight!==1536)continue;
    const src=scanCrop(img,spec.box),card=make('button','raw363-card');card.type='button';card.setAttribute('aria-label',spec.title+' als Scan vergrößern');
    const thumb=make('img','raw363-thumb');thumb.src=src;thumb.alt=spec.title+' – echter Diagrammausschnitt des Kliniktests';thumb.loading='lazy';
    card.append(thumb,make('span','',spec.title));card.addEventListener('click',()=>openZoom(src,spec.title));grid.append(card);count++;
   }catch(e){const warning=make('p','raw363-warning',spec.title+': Scanansicht momentan nicht verfügbar. Originaltest bleibt erhalten.');grid.append(warning);}
  }
  if(call!==epoch)return;
  box.dataset.count=String(count);
  if(!count)grid.append(make('p','raw363-empty','Die originalen Klinikfotos vom 28.10.2026 wurden hier noch nicht im privaten Tresor gefunden. Bitte die Befunde unter Lungenfunktion importieren.'));}
 let handle;const schedule=()=>{clearTimeout(handle);handle=setTimeout(()=>refresh().catch(()=>{grid.replaceChildren(make('p','raw363-warning','Originaldiagramme konnten nicht geladen werden. Bitte Tresor prüfen.'));}),180);};
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite')schedule();});
 window.addEventListener('asthma:lung-study-imported',schedule);
 refresh().catch(()=>{grid.replaceChildren(make('p','raw363-warning','Originaldiagramme konnten nicht geladen werden. Bitte Tresor prüfen.'));});
 window.__ASTHMA_RAW363_TEST=Object.freeze({version:'3.6.3',source:'lokal verschlüsselte Originalbilder',diagrams:5});
})();
