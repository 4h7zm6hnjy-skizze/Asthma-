'use strict';
/* Pure presentation layer: never modifies encrypted records or medical values. */
(()=>{
 const $=id=>document.getElementById(id), SEC=window.ASTHMA_SECURITY;
 const home=$('uebersicht'), lung=$('lungenwerte'), akte=$('mein-bereich');
 if(!SEC||!home||!lung||!akte||document.documentElement.dataset.design26)return;
 document.documentElement.dataset.design26='1';
 const symbols={
 '▣':'<rect x="3" y="6" width="18" height="15" rx="3"/><path d="M8 6l2-3h4l2 3"/><circle cx="12" cy="13.5" r="3.5"/>',
 '∿':'<path d="M2 13h5l3-7 4 12 3-6h5"/>',
 '▦':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
 '✚':'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 12h8M12 8v8"/>',
 '▤':'<path d="M3 6h8l2 2h8v13H3z"/><path d="M3 10h18"/>',
 '♙':'<rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 '♡':'<path d="M12 21s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.2-8 11-8 11z"/>',
 '▥':'<path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h8"/>',
 '⌁':'<path d="M4 7h16M4 12h10M4 17h16"/><circle cx="18" cy="12" r="2"/>',
 };
 const symbol=k=>k==='♧'?'<img src="./logo-192-v281.png" width="31" height="31" alt=""/>':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[k]||symbols['▥']}</svg>`;
 const btn=(icon,title,page,small)=>`<button type="button" class="d26-action" data-goto="${page}"><span class="d26-symbol" aria-hidden="true">${symbol(icon)}</span><strong>${title}</strong><small>${small}</small></button>`;
 const dashboard=document.createElement('div');dashboard.className='d26-dashboard';
 dashboard.innerHTML=`<div class="d26-greeting"><div><p class="d26-kicker">ASTHMA · PRIVATER GESUNDHEITSMANAGER</p><h1>Deine Gesundheit im Blick.</h1><p>Messwerte, Befunde und Termine. Übersichtlich und lokal verwaltet.</p></div><img src="./logo-192-v281.png" alt="Asthma-Lungenlogo" width="72" height="72"></div>
 <div class="d26-hero-card"><img src="./logo-192-v281.png" alt="" width="78" height="78"><div><span>Ärztliche Lungenfunktion</span><strong id="d26-main-fev">Werte werden geladen …</strong><small id="d26-main-date">Nur bestätigte Messungen im Verlauf</small></div><button type="button" data-goto="lungenwerte" aria-label="Lungenfunktion öffnen">›</button></div>
 <div class="d26-section-title"><h2>Schnellzugriff</h2><button type="button" data-goto="mehr">Alle Funktionen ›</button></div>
 <div class="d26-actions">${btn('▤','Dateien & Scannen','dateien','Alles hochladen')}${btn('▣','Befund scannen','befunde','Foto und PDF')}${btn('∿','Peak-Flow','peakflow','ePEF-Tagebuch')}${btn('♧','Lungenfunktion','lungenwerte','FEV₁ und FVC')}${btn('▦','Kalender','kalender','Termine')}</div>
 <div class="d26-metrics"><div class="d26-metric"><span>FEV₁ · % vom Soll</span><strong id="d26-fev-value">–</strong><small id="d26-fev-liter">Noch kein bestätigter Wert</small></div><div class="d26-metric"><span>FVC · % vom Soll</span><strong id="d26-fvc-value">–</strong><small id="d26-fvc-liter">Noch kein bestätigter Wert</small></div><div class="d26-metric"><span>Peak-Flow · zuletzt</span><strong id="d26-peak-value">–</strong><small id="d26-peak-date">Noch keine Messung</small></div></div>
 <div class="d26-section-title"><h2>Deine Verläufe</h2><button type="button" data-goto="lungenwerte">Details ›</button></div>`;
 home.prepend(dashboard);
 // Existing functional diagrams move to new responsive dashboard columns.
 const pef=$('home-epef'), spiro=$('home-lufu23');
 if(pef&&spiro){const grid=document.createElement('div');grid.className='d26-chart-grid';grid.append(pef,spiro);dashboard.append(grid);}
 const bottom=document.createElement('div');bottom.className='d26-more-tiles';bottom.innerHTML=`<button type="button" data-goto="therapie"><span class="d26-symbol">✚</span><span><strong>Medikamentenplan</strong><small id="d26-med-summary">Bestätigte Medikamente anzeigen</small></span><b>›</b></button><button type="button" data-goto="kalender"><span class="d26-symbol">▦</span><span><strong>Nächster Termin</strong><small id="d26-next-event">Kalender öffnen</small></span><b>›</b></button><button type="button" data-goto="profil"><span class="d26-symbol">▥</span><span><strong>GdB & Anträge</strong><small>Informationen und Antragshilfe</small></span><b>›</b></button><p>🔒 Werte aus dem lokalen, entsperrten Tresor. Keine automatische medizinische Bewertung oder Notfallüberwachung.</p></div>`;dashboard.append(bottom);
 // Lung page matches approved cards, but retains existing form and graph behavior.
 const lt=document.createElement('div');lt.className='d26-lung-heading';lt.innerHTML=`<div class="d26-title-row"><div><p class="d26-kicker">LUNGE & STATISTIK</p><h2>Deine Lungenwerte</h2><p>Spirometrie und ePEF bleiben getrennte Messreihen.</p></div><img src="./logo-192-v281.png" alt="" width="56" height="56"></div><div class="d26-lung-rings"><div><h3>FEV₁</h3><div class="d26-ring" id="d26-ring-fev"><strong id="d26-lung-fev">–</strong><small>% vom Soll</small></div><p id="d26-lung-fev-l">Noch kein gespeicherter Test</p></div><div><h3>FVC</h3><div class="d26-ring" id="d26-ring-fvc"><strong id="d26-lung-fvc">–</strong><small>% vom Soll</small></div><p id="d26-lung-fvc-l">Noch kein gespeicherter Test</p></div></div><p class="d26-hint" id="d26-lung-date">Aktuelle Werte müssen zuerst in den Verlauf gespeichert werden.</p></div>`;
 lung.insertBefore(lt,lung.querySelector('.section-heading'));
 const chart=$('lufu23-detail'),form=$('lung-fieldset');if(chart&&form)lung.insertBefore(chart,form);
 // Akte & Mehr teaser before existing tabs; original forms are preserved.
 const ah=document.createElement('div');ah.className='d26-akte-hub';ah.innerHTML=`<div class="d26-title-row"><div><p class="d26-kicker">DEINE PRIVATE AKTE</p><h2>Akte & Mehr</h2><p>Dokumente, Medikamente und weitere Funktionen.</p></div><img src="./logo-192-v281.png" alt="" width="56" height="56"></div><div class="d26-akte-grid"><button type="button" class="d26-action" id="d293-open-documents" aria-label="Dokumentenablage öffnen"><span class="d26-symbol" aria-hidden="true">${symbol('▤')}</span><strong>Dokumente</strong><small>Arztbriefe und Unterlagen</small></button>${btn('▣','Befunde scannen','befunde','Foto, PDF und Tests')}${btn('✚','Medikamentenplan','therapie','Bearbeiten & drucken')}${btn('♙','Sicherer Tresor','einstellungen','Datensicherung')}${btn('♡','Hilfsmittel','hilfen','Gesetzlich / Privatzahlung')}${btn('▥','Statistik & PDF','statistik','Monat und Jahr')}${btn('⌁','GdB & Anträge','profil','Antragshilfe')}</div><p class="d26-hint">Deine bisherigen Dokumente, Asthma-AUs, das Tagebuch und die Datensicherung findest du weiterhin darunter.</p>`;
 akte.insertBefore(ah,akte.querySelector('.section-heading'));
 // 2.9.3: The old combined tile navigated to the already open "Akte" page,
 // but never switched from "Antragsakte" to the hidden documents panel.
 // Open the existing documents tab via its own original click handler;
 // this does not touch or recreate any personal records.
 ah.querySelector('#d293-open-documents')?.addEventListener('click',()=>{
   window.ASTHMA_NAV?.go('akte');
   const tab=akte.querySelector('.my-tab[data-my-tab="documents"]');
   if(!tab){alert('Die Dokumentenablage konnte nicht geöffnet werden.');return;}
   tab.click();
   requestAnimationFrame(()=>{
     const panel=$('my-documents');
     if(panel&&!panel.hidden)panel.scrollIntoView({block:'start',behavior:'instant'});
   });
 });
 // Put the filter legend after the month grid, so the calendar opens first.
 const calendar=document.getElementById('kalender'),legend=calendar?.querySelector('.cal25-legend'),monthGrid=calendar?.querySelector('#calendar-grid');
 if(legend&&monthGrid){legend.open=false;monthGrid.insertAdjacentElement('afterend',legend);}
 const brand=document.querySelector('.brand-icon');if(brand){brand.replaceChildren();const image=document.createElement('img');image.src='./logo-192-v281.png';image.width=46;image.height=46;image.alt='';brand.append(image);}
 const brandSub=document.querySelector('.brand small');if(brandSub)brandSub.textContent='Lunge · Therapie · Kalender · Akte';
 const favicon=document.createElement('link');favicon.rel='icon';favicon.type='image/png';favicon.href='./logo-192-v281.png';document.head.append(favicon);
 const text=(id,v)=>{const el=$(id);if(el)el.textContent=v;};
 const num=x=>x===null||x===undefined||x===''?null:Number.isFinite(Number(x))?Number(x):null;
 const fmt=(x,fraction=0)=>x===null?'–':x.toLocaleString('de-DE',{maximumFractionDigits:fraction});
 const date=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')?x.slice(8)+'.'+x.slice(5,7)+'.'+x.slice(0,4):'–';
 let pending=false,again=false;
 async function refresh(){if(pending){again=true;return;}pending=true;
  try{
   const [suite,epef,events]=await Promise.all(['suite','epef','calendar'].map(name=>SEC.list(name)));
   const matches=suite.filter(r=>r.type==='measurements'&&/^\d{4}-\d{2}-\d{2}$/.test(r.value?.date||'')).map(r=>r.value).sort((a,b)=>b.date.localeCompare(a.date)||(b.createdAt||'').localeCompare(a.createdAt||''));
   const m=matches[0],meds=suite.filter(r=>r.type==='meds');
   const ep=epef.filter(r=>r.kind==='measurement').sort((a,b)=>(b.date+' '+(b.time||'')).localeCompare(a.date+' '+(a.time||'')))[0];
   const percent=v=>num(v)===null?'–':fmt(num(v))+' %',liter=v=>num(v)===null?'Kein Literwert':fmt(num(v),2)+' Liter';
   text('d26-main-fev',m?'FEV₁ '+percent(m.fev1):'Noch kein Test im Verlauf');
   text('d26-main-date',m?'Bestätigter Test vom '+date(m.date):'Eingabefelder allein gelten noch nicht als gespeicherte Untersuchung');
   for(const [p,a,b] of [['fev',m?.fev1,m?.fev1Liters],['fvc',m?.fvc,m?.fvcLiters]]){
     text('d26-'+p+'-value',m?percent(a):'–');text('d26-'+p+'-liter',m?liter(b):'Kein Test gespeichert');
     text('d26-lung-'+p,m?percent(a):'–');text('d26-lung-'+p+'-l',m?liter(b):'Kein Test gespeichert');
     const circle=$('d26-ring-'+p);if(circle)circle.style.setProperty('--progress',num(a)===null?'0':String(Math.max(0,Math.min(100,num(a)))));
   }
   text('d26-lung-date',m?'Letzter bestätigter Test: '+date(m.date)+' · Eingaben erst nach „Aktuelle Werte in Verlauf speichern“ im Bericht.':'Aktuelle Werte erst mit „Aktuelle Werte in Verlauf speichern“ bestätigen.');
   text('d26-peak-value',ep&&num(ep.pef)!==null?fmt(num(ep.pef))+' L/min':'–');text('d26-peak-date',ep?date(ep.date)+(ep.time?' · '+ep.time:''):'Keine ePEF-Messung');
   text('d26-med-summary',meds.length?meds.length+' gespeicherte Medikamente':'Noch keine bestätigten Medikamente');
   const now=new Date(),iso=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
   const future=events.filter(v=>v.date>=iso&&['termin','test','medikament','labor'].includes(v.type)).sort((a,b)=>a.date.localeCompare(b.date))[0];
   text('d26-next-event',future?date(future.date)+' · '+String(future.title||'Termin').slice(0,60):'Kein kommender Termin gespeichert');
  }catch(e){text('d26-main-date','Lokale Daten derzeit nicht lesbar: '+String(e?.message||e));}
  finally{pending=false;if(again){again=false;setTimeout(refresh,80);}}
 }
 window.addEventListener('asthma:secure-change',()=>setTimeout(refresh,100));
 window.addEventListener('asthma:meds-change',()=>setTimeout(refresh,100));
 document.addEventListener('click',e=>{if(e.target.closest('[data-goto="start"],[data-goto="lungenwerte"]'))setTimeout(refresh,140);});
 refresh();
 window.__ASTHMA_DESIGN26_TEST=Object.freeze({refresh,version:'2.7.0'});
})();
