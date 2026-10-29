'use strict';
/* Asthma 3.4.3 – einheitliche, ausklappbare Navigation; verändert keine Gesundheitsdaten.
   Die ursprüngliche Bereichsnavigation bleibt als technische Rückfallebene im DOM. */
(()=>{
  const NAV=window.ASTHMA_NAV;
  const app=document.getElementById('secure-application');
  const top=document.querySelector('.top-actions');
  const dock=document.querySelector('.bottom-dock');
  if(!NAV||!app||!top||!dock||document.getElementById('n332-sidebar'))return;

  const groups=[
    {id:'werte',name:'1 · MEINE GESUNDHEITSWERTE',open:true,items:[
      ['start','Übersicht','Die wichtigsten Informationen'],
      ['lungenkrankheiten','LUNGENERKRANKUNGEN · COPD / KREBS / WEITERE','Diagnostik, Befunde, Reha und Rechte'],
      ['lungenwerte','Lungenfunktion','FEV₁, FVC und Verlauf'],
      ['vitalwerte','Vitalwerte & Gewicht','SpO₂, Blutdruck, Puls und Gewichtsdiagramm'],
      ['bewertung','BEWERTUNG DER DATEN','Letzte 10 Messungen, Ampel und Neubewertung'],
      ['peakflow','Peak-Flow','Atemwerte und ePEF-Tagebuch'],
      ['schlaflabor','SCHLAFLABOR & SCHLAFWERTE','AHI, Sauerstoff, Schlafphasen und CPAP'],
      ['gehttest','GEHTEST / BELASTUNGSTEST','6-Minuten-Gehtest, Blutgase und Verlaufsdiagramme'],
      ['therapie','Therapie & Medikamente','Medikamentenplan und Behandlung'],
      ['kalender','Kalender','Termine und Klinikaufenthalte']
    ]},
    {id:'akte',name:'2 · BEFUNDE, LABOR & AKTE',open:true,items:[
      ['behandler','ÄRZTE & KRANKENHÄUSER','Alle Termine, Bilder und Befunde je Praxis oder Klinik'],
      ['bildgebung','RÖNTGEN & CT · BILDGEBUNG','Bilder, CT-Serien und Diagnoseprotokolle'],
      ['dateien','Dateien & Scannen','Alle Unterlagen hochladen'],
      ['labor','Labor & Blutwerte','Laborbefunde und Messreihen'],
      ['befunde','Befundscanner','Fototext und Werte prüfen'],
      ['akte','Meine Akte','Dokumente, Anträge und Tagebuch'],
      ['bericht','Arztbericht','Zusammenfassung erstellen'],
      ['statistik','Monats-/Jahresberichte','Diagramme, Druck und PDF']
    ]},
    {id:'organisation',name:'3 · PROFIL, HILFEN & VERWALTUNG',open:false,items:[
      ['profil','Patientenprofil','Persönliche Daten und GdB'],
      ['versicherung','Zusatzversicherung','Verträge und Leistungen'],
      ['hilfen','Hilfsmittel','Unterstützung und Anlaufstellen'],
      ['antraege','Anträge','Leistungen und Bescheide'],
      ['arbeit','Arbeit','Belastung und Schutz'],
      ['region','Region & Suche','Ansprechpartner und Angebote']
    ]},
    {id:'weiteres',name:'4 · WEITERES & EINSTELLUNGEN',open:false,items:[
      ['wissen','Wissen & Rechte','Informationen zu Asthma'],
      ['einstellungen','Einstellungen & Backup','Updates und Datensicherheit'],
      ['mehr','Alle Bereiche','Bestehende Funktionsübersicht']
    ]}
  ];
  const side=document.createElement('aside');side.id='n332-sidebar';side.className='n332-sidebar';
  side.setAttribute('role','dialog');side.setAttribute('aria-modal','true');
  side.setAttribute('aria-label','PneumoPro – seitliches Navigationsmenü');side.setAttribute('aria-hidden','true');side.inert=true;
  const title=document.createElement('div');title.className='n332-side-top';
  title.innerHTML='<div><strong>PNEUMOPRO · MENÜ</strong><small>Wähle den gewünschten Bereich</small></div>';
  const close=document.createElement('button');close.type='button';close.className='n332-close';
  close.setAttribute('aria-label','Seitenmenü schließen');close.textContent='✕';title.append(close);side.append(title);
  const scroll=document.createElement('nav');scroll.className='n332-side-scroll';scroll.setAttribute('aria-label','Alle App-Bereiche');
  for(const group of groups){
    const details=document.createElement('details');details.className='n332-group';details.dataset.n332Group=group.id;
    details.open=group.open;
    const summary=document.createElement('summary');summary.textContent=group.name;details.append(summary);
    const links=document.createElement('div');links.className='n332-group-links';
    for(const [id,name,hint] of group.items){
      const button=document.createElement('button');button.type='button';button.className='n332-link';
      button.dataset.n332Page=id;
      const strong=document.createElement('strong');strong.textContent=name;
      const small=document.createElement('small');small.textContent=hint;
      button.append(strong,small);links.append(button);
      button.addEventListener('click',()=>{
        NAV.go(id);sync();hide();
      });
    }
    details.append(links);scroll.append(details);
  }
  side.append(scroll);
  const note=document.createElement('p');note.className='n332-side-note';
  note.textContent='Alle bisherigen Bereiche bleiben erhalten. Gespeicherte Daten und Berichte werden durch die Navigation nicht verändert.';
  side.append(note);
  const backdrop=document.createElement('button');backdrop.type='button';backdrop.id='n332-backdrop';
  backdrop.setAttribute('aria-label','Menü schließen');backdrop.hidden=true;
  app.append(backdrop,side);

  const topOpen=document.createElement('button');topOpen.id='n332-open-top';topOpen.type='button';
  topOpen.className='n332-open-top';topOpen.setAttribute('aria-controls','n332-sidebar');
  topOpen.setAttribute('aria-expanded','false');
  topOpen.innerHTML='<span class="n332-bars" aria-hidden="true">☰</span><span>Menü</span>';
  top.insertBefore(topOpen,top.firstChild);

  // Bottom bar: nur häufig verwendete Messwertseiten, dazu die Menütaste.
  dock.innerHTML='<button type="button" data-goto="start" aria-label="Übersicht"><span aria-hidden="true">⌂</span><span>Start</span></button>'+
  '<button type="button" data-goto="lungenwerte" aria-label="Lungenfunktion"><span aria-hidden="true">∿</span><span>Lunge</span></button>'+
  '<button type="button" data-goto="vitalwerte" aria-label="Vitalwerte"><span aria-hidden="true">♥</span><span>Vital</span></button>'+
  '<button type="button" data-goto="peakflow" aria-label="Peak-Flow"><span aria-hidden="true">◷</span><span>Peak-Flow</span></button>'+
  '<button type="button" id="n332-open-bottom" aria-controls="n332-sidebar" aria-expanded="false"><span aria-hidden="true">☰</span><span>Menü</span></button>';
  const bottomOpen=document.getElementById('n332-open-bottom');
  let opened=false,formerFocus=null;
  function show(){
    if(opened)return;formerFocus=document.activeElement;opened=true;
    side.inert=false;side.setAttribute('aria-hidden','false');backdrop.hidden=false;
    document.documentElement.classList.add('n332-menu-open');
    topOpen.setAttribute('aria-expanded','true');bottomOpen.setAttribute('aria-expanded','true');
    sync();close.focus({preventScroll:true});
  }
  function hide(){
    if(!opened)return;opened=false;
    document.documentElement.classList.remove('n332-menu-open');
    side.setAttribute('aria-hidden','true');side.inert=true;backdrop.hidden=true;
    topOpen.setAttribute('aria-expanded','false');bottomOpen.setAttribute('aria-expanded','false');
    if(formerFocus?.isConnected)formerFocus.focus({preventScroll:true});
  }
  topOpen.addEventListener('click',show);bottomOpen.addEventListener('click',show);
  close.addEventListener('click',hide);backdrop.addEventListener('click',hide);
  document.addEventListener('keydown',event=>{
    if(!opened)return;
    if(event.key==='Escape'){event.preventDefault();hide();return;}
    if(event.key!=='Tab')return;
    const focusable=[...side.querySelectorAll('button,summary')].filter(x=>x.getClientRects().length>0&&!x.disabled);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });
  function current(){return document.body.dataset.page||location.hash.slice(1)||'start'}
  function sync(){
    const currentPage=current();
    side.querySelectorAll('[data-n332-page]').forEach(el=>{
      const active=el.dataset.n332Page===currentPage;
      el.classList.toggle('n332-current',active);
      if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
      if(active&&opened)el.closest('details').open=true;
    });
    dock.querySelectorAll('[data-goto]').forEach(el=>{
      const active=el.dataset.goto===currentPage;
      el.classList.toggle('dock-active',active);
      if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
    });
    const group=groups.find(g=>g.items.some(item=>item[0]===currentPage));
    document.documentElement.dataset.n332Area=group?.id||'werte';
  }
  // Normal navigation continues via the existing ASTHMA_NAV; this is presentation only.
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-goto]')){
      if(opened&&!side.contains(e.target))hide();
      queueMicrotask(sync);
    }
  });
  window.addEventListener('hashchange',()=>{sync();hide()});

  // Übersicht: direkte Werte statt gemischter Verwaltungs- und Messwertkacheln.
  const dashboard=document.querySelector('.d26-dashboard'),oldActions=dashboard?.querySelector('.d26-actions');
  if(dashboard&&oldActions){
    const heading=oldActions.previousElementSibling;
    if(heading?.classList.contains('d26-section-title')){
      const label=heading.querySelector('h2');if(label)label.textContent='GESUNDHEITSWERTE · DIREKT ÖFFNEN';
      const action=heading.querySelector('button');if(action){action.textContent='Menü öffnen';action.removeAttribute('data-goto');action.addEventListener('click',show)}
    }
    oldActions.replaceChildren();
    for(const [glyph,name,page,hint] of [
      ['∿','LUNGENFUNKTION','lungenwerte','FEV₁, FVC und Diagramme'],
      ['♥','VITALWERTE & GEWICHT','vitalwerte','SpO₂, Blutdruck, Puls, kg'],
      ['◷','PEAK-FLOW','peakflow','Atemwerte im Verlauf'],
      ['✚','THERAPIE','therapie','Medikamente und Behandlung']
    ]){
      const b=document.createElement('button');b.type='button';b.className='d26-action n332-core-tile';b.dataset.goto=page;
      const glyphNode=document.createElement('span');glyphNode.className='d26-symbol';glyphNode.textContent=glyph;
      const strong=document.createElement('strong');strong.textContent=name;
      const small=document.createElement('small');small.textContent=hint;
      b.append(glyphNode,strong,small);oldActions.append(b);
    }
    const docs=document.createElement('div');docs.className='n332-home-admin';
    docs.innerHTML='<div><strong>AKTE · LABOR · DOKUMENTE</strong><p>Arztbriefe, Laborbefunde, Versicherungen und Auswertungen liegen getrennt im Seitenmenü.</p></div>';
    const openDocs=document.createElement('button');openDocs.type='button';openDocs.className='n332-admin-open';
    openDocs.textContent='Akte & Labor im Menü öffnen';openDocs.addEventListener('click',()=>{
      show();side.querySelector('[data-n332-group="akte"]').open=true;
    });
    docs.append(openDocs);oldActions.insertAdjacentElement('afterend',docs);
  }
  sync();
  document.documentElement.classList.add('n332-ready');
  window.__ASTHMA_NAV332_TEST=Object.freeze({version:'3.4.3',groups:groups.map(g=>({name:g.name,ids:g.items.map(i=>i[0])})),open:show,close:hide,sync});
})();
