'use strict';
/* 2.9.1 – iPhone recovery for a mixed-version Service Worker cache.
   Only downloads application code from this origin. Never reads or sends health data. */
(()=>{
  const $=id=>document.getElementById(id);
  const section=$('vitalwerte');
  if(!section)return;
  const status=$('v29-loader-status'),retry=$('v29-retry');
  let loading=false,attempted=false;
  const running=()=>!!(window.ASTHMA_VITAL29&&$('v29-form-spo2')&&$('v29-form-bp')&&$('v29-form-pulse'));
  function update(message='',failure=false){
    if(!status)return;
    status.textContent=message;
    status.hidden=!message;
    status.classList.toggle('suite-error',failure);
    if(retry)retry.hidden=!failure;
  }
  function unlocked(){try{return window.ASTHMA_SECURITY?.state?.().unlocked===true;}catch{return false;}}
  function ensure(){
    if(running()){update();return;}
    if(!unlocked()||loading)return;
    // Do not create a second module while the normal post-login loader is still starting.
    if($('v29-root')){
      if(!running())update('Vitalwerte wurden nur teilweise geladen. Bitte die Seite erneut öffnen oder „Erneut laden“ wählen.',true);
      return;
    }
    loading=true;attempted=true;
    update('Vitalwerte werden geladen …');
    const js=document.createElement('script');
    // The query avoids an older cached vital29.js from v2.8.x/2.9.0.
    js.src='./vital29.js?v=2.9.1';
    js.async=true;
    js.onload=()=>{
      loading=false;
      if(running())update();
      else update('Eingabemasken konnten nicht gestartet werden. Bitte „Erneut laden“ wählen.',true);
    };
    js.onerror=()=>{loading=false;update('Vitalwerte konnten nicht geladen werden. Internetverbindung prüfen und „Erneut laden“ wählen.',true);};
    document.body.append(js);
  }
  if(retry)retry.addEventListener('click',()=>{
    if($('v29-root')&&!running()){
      // Incomplete initialization: reload application code without deleting any local data.
      location.reload();
      return;
    }
    attempted=false;ensure();
  });
  const app=$('secure-application'),gate=$('secure-gate');
  // The password vault stays unchanged. Observe only login visibility, not personal records.
  const observe=target=>{
    if(!target)return;
    new MutationObserver(()=>{if(unlocked())setTimeout(ensure,80);}).observe(target,{attributes:true,attributeFilter:['hidden']});
  };
  observe(app);observe(gate);
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-goto="vitalwerte"]'))setTimeout(ensure,80);
  });
  window.addEventListener('hashchange',()=>{if(location.hash==='#vitalwerte')setTimeout(ensure,80);});
  // Works when the user re-opens the PWA directly on the vitalwerte route.
  setTimeout(ensure,250);
})();
