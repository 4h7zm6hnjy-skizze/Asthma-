'use strict';
/* PneumoPro 3.7.7: professionelle Startseite aufraeumen.
   Entfernt die alte Box 'Heute im Blick', setzt die Messwert-Kacheln ganz nach oben,
   entfernt den Zusatz 'ohne Schnickschnack' und fuegt einen Copyright-Hinweis hinzu. */
(()=>{
  const S=window.ASTHMA_SECURITY;
  if(!S?.state?.().unlocked) return;
  if(window.PNEUMOPRO_DASHBOARD377) return;

  function ensureStyle(){
    if(document.getElementById('pp377-style')) return;
    const style=document.createElement('style');
    style.id='pp377-style';
    style.textContent=`
#pp376-dashboard{margin:6px 0 24px}
#pp376-dashboard .pp376-head{margin-bottom:12px}
#pp376-dashboard .pp376-sub{margin-top:8px}
#pp377-copyright{margin-top:14px;color:#6a7f8d;font-size:.9rem;line-height:1.4;text-align:right}
@media (max-width:720px){#pp377-copyright{text-align:left;font-size:.85rem}}
`;
    document.head.append(style);
  }

  function removeLegacyOverview(){
    // Only remove the exact old quick-overview card, never a containing page.
    // All diary entries, measurement data and their dedicated views remain untouched.
    const old=document.getElementById('a28-daily');
    if(!old)return false;
    old.remove();
    return true;
  }

  function tidyDashboard(){
    const host=document.getElementById('uebersicht') || document.getElementById('start');
    const dashboard=document.getElementById('pp376-dashboard');
    if(!host || !dashboard) return false;

    if(host.firstElementChild !== dashboard) host.prepend(dashboard);

    const kicker=dashboard.querySelector('.pp376-kicker');
    if(kicker) kicker.remove();

    let copy=document.getElementById('pp377-copyright');
    if(!copy){
      copy=document.createElement('div');
      copy.id='pp377-copyright';
      copy.textContent='© Marcel Hentschel 2026';
      const footer=document.querySelector('footer .footer-inner')||document.querySelector('footer');
      if(footer)footer.append(copy);
      else dashboard.append(copy);
    }
    return true;
  }

  ensureStyle();
  let observerTimer=0;
  const refresh=()=>{
    removeLegacyOverview();
    tidyDashboard();
  };
  const schedule=()=>{ clearTimeout(observerTimer); observerTimer=setTimeout(refresh,80); };
  schedule();

  const observer=new MutationObserver(schedule);
  observer.observe(document.getElementById('secure-application')||document.body,{childList:true,subtree:true});
  window.addEventListener('asthma:secure-change',schedule);
  window.addEventListener('asthma:profile-reset',schedule);
  window.addEventListener('asthma:personal-profile-updated',schedule);
  window.PNEUMOPRO_DASHBOARD377=Object.freeze({version:'3.7.7',refresh:schedule});
})();
