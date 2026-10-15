
'use strict';
/* Asthma 2.0.0: local UI-only viewport lock. No medical data stored or transmitted. */
(()=>{
  const viewport=document.querySelector('meta[name="viewport"]');
  if(!viewport)return;
  const fitBase='width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover';
  const zoomBase='width=device-width, initial-scale=1, viewport-fit=cover';
  const preferenceKey='asthma-page-zoom-allowed';
  const small=()=>window.matchMedia('(max-width: 850px)').matches;
  let allow=false;
  try{allow=window.localStorage.getItem(preferenceKey)==='yes';}catch{}
  function apply(){viewport.setAttribute('content',allow?zoomBase:fitBase);
    const checkbox=document.getElementById('allow-page-zoom');if(checkbox)checkbox.checked=allow;
    document.documentElement.dataset.viewportFit=allow?'optional':'fixed';
  }
  // Safari has a nonstandard gesture event; do not interfere with the document-photo lightbox.
  function photoGesture(event){return Boolean(event.target?.closest?.('#scan-photo-dialog'));}
  for(const name of ['gesturestart','gesturechange']){
    document.addEventListener(name,event=>{if(!allow&&small()&&!photoGesture(event))event.preventDefault()},{passive:false,capture:true});
  }
  document.addEventListener('touchmove',event=>{
    if(!allow&&small()&&event.touches&&event.touches.length>1&&!photoGesture(event))event.preventDefault();
  },{passive:false,capture:true});
  function status(text){const el=document.getElementById('fit-view-message');if(el)el.textContent=text;}
  function resetView(){
    // Force a viewport recalculation to recover from an already magnified iOS Safari page.
    viewport.setAttribute('content',fitBase+', user-scalable=no');
    window.scrollTo({left:0,top:window.scrollY,behavior:'instant'});
    document.documentElement.scrollLeft=0;document.body.scrollLeft=0;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      apply();window.scrollTo({left:0,top:window.scrollY,behavior:'instant'});
      const scale=window.visualViewport?.scale||1;
      status(scale>1.05?'Ansicht weiterhin vergrößert: Bitte diese App einmal neu öffnen.':'Ansicht ist auf die Displaybreite eingestellt.');
    }));
  }
  function bind(){apply();
    document.getElementById('fit-view-scan')?.addEventListener('click',resetView);
    document.getElementById('fit-view-settings')?.addEventListener('click',resetView);
    document.getElementById('allow-page-zoom')?.addEventListener('change',event=>{
      allow=event.target.checked;
      try{window.localStorage.setItem(preferenceKey,allow?'yes':'no')}catch{}
      apply();status(allow?'Seitenvergrößerung erlaubt.':'Seitenansicht auf Displaybreite fixiert.');
    });
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
  window.ASTHMA_VIEWPORT=Object.freeze({reset:resetView,locked:()=>!allow});
})();
