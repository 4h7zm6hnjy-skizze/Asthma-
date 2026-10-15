'use strict';
/* Asthma 1.9.0 – lokale Bildanzeige und iOS-Eingabehilfe. Keine Datenübertragung. */
(()=>{
  const $=id=>document.getElementById(id);
  const preview=$('scan-preview'),picker=$('scan-picked'),dialog=$('scan-photo-dialog');
  const stage=$('scan-photo-stage'),large=$('scan-photo-large');
  if(!preview||!picker||!dialog||!stage||!large)return;
  let zoom=1,x=0,y=0,gesture=null;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  function paint(){large.style.transform=`translate3d(${x}px,${y}px,0) scale(${zoom})`;
    $('scan-zoom-out').disabled=zoom<=1; $('scan-zoom-in').disabled=zoom>=6;}
  function reset(){zoom=1;x=0;y=0;paint()}
  function open(){if(!preview.getAttribute('src')||picker.hidden)return;
    large.src=preview.src;reset();if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');}
  function close(){if(dialog.open)dialog.close();else dialog.removeAttribute('open');large.removeAttribute('src');reset()}
  $('scan-photo-open').addEventListener('click',open);
  preview.addEventListener('click',open);
  preview.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});
  preview.tabIndex=0;preview.setAttribute('role','button');preview.setAttribute('aria-label','Befundfoto groß öffnen');
  $('scan-photo-close').addEventListener('click',close);
  $('scan-zoom-reset').addEventListener('click',reset);
  const setZoom=z=>{zoom=clamp(z,1,6);if(zoom===1){x=0;y=0}paint()};
  $('scan-zoom-in').addEventListener('click',()=>setZoom(zoom*1.4));
  $('scan-zoom-out').addEventListener('click',()=>setZoom(zoom/1.4));
  dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
  dialog.addEventListener('close',()=>{large.removeAttribute('src');reset()});
  dialog.addEventListener('keydown',e=>{if(['+','='].includes(e.key)){e.preventDefault();setZoom(zoom*1.3)}else if(e.key==='-'){e.preventDefault();setZoom(zoom/1.3)}});
  // Restrict gesture to image: browsing page still permits native accessible pinch zoom.
  const dist=(a,b)=>Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
  let pointers=new Map();
  stage.addEventListener('pointerdown',e=>{
    pointers.set(e.pointerId,{clientX:e.clientX,clientY:e.clientY});
    if(zoom>1||pointers.size>1)stage.setPointerCapture?.(e.pointerId);
    if(pointers.size===1)gesture={mode:'pan',at:[e.clientX,e.clientY],ox:x,oy:y};
    if(pointers.size===2)gesture={mode:'pinch',distance:dist(...pointers.values()),base:zoom};
  });
  stage.addEventListener('pointermove',e=>{
    if(!pointers.has(e.pointerId)||!gesture)return;
    pointers.set(e.pointerId,{clientX:e.clientX,clientY:e.clientY});
    if(pointers.size>=2){const pts=[...pointers.values()];if(gesture.mode!=='pinch')gesture={mode:'pinch',distance:dist(pts[0],pts[1]),base:zoom};setZoom(gesture.base*dist(pts[0],pts[1])/Math.max(1,gesture.distance));}
    else if(zoom>1&&gesture.mode==='pan'){x=clamp(gesture.ox+e.clientX-gesture.at[0],-stage.clientWidth*zoom,stage.clientWidth*zoom);y=clamp(gesture.oy+e.clientY-gesture.at[1],-stage.clientHeight*zoom,stage.clientHeight*zoom);paint()}
  });
  const end=e=>{pointers.delete(e.pointerId);gesture=null;
    if(pointers.size===1){const p=[...pointers.values()][0];gesture={mode:'pan',at:[p.clientX,p.clientY],ox:x,oy:y}}};
  ['pointerup','pointercancel','lostpointercapture'].forEach(ev=>stage.addEventListener(ev,end));
  stage.addEventListener('wheel',e=>{if(!dialog.open)return;e.preventDefault();setZoom(zoom*(e.deltaY>0?0.85:1.15))},{passive:false});
  // Safari has no TextDetector: do not show a button that will inevitably fail.
  const ocrButton=$('scan-start');if(ocrButton&&!('TextDetector' in window)){ocrButton.hidden=true;}
  // Progressive enhancement: iOS can offer its own camera-based 'Scan Text' text input action.
  const focusNative=()=>{
    document.querySelector('.scan-text')?.setAttribute('open','');
    const input=$('scan-raw');input.focus();input.scrollIntoView({behavior:'smooth',block:'center'});
    const progress=$('scan-progress');if(progress)progress.textContent='Textfeld geöffnet. iPhone: Finger im Textfeld halten → „Text scannen“ oder „Einfügen“. Anschließend „Text auswerten“ wählen.';
  };
  $('scan-native-text')?.addEventListener('click',focusNative);
  $('scan-photo-to-text')?.addEventListener('click',focusNative);
  // Avoid blank dialog on file delete/replacement.
  const observer=new MutationObserver(()=>{if(dialog.open&&(!preview.hasAttribute('src')||picker.hidden))close()});
  observer.observe(preview,{attributes:true,attributeFilter:['src']});observer.observe(picker,{attributes:true,attributeFilter:['hidden']});
  window.__asthmaPhoto19Test=Object.freeze({getZoom:()=>zoom,reset});
})();
