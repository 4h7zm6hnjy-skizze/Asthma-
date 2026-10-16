'use strict';
/* Asthma Rechtsmonitor: no private health data leaves this device. Public same-origin feed only. */
(()=>{
  const $=id=>document.getElementById(id);
  const allowed=['gesetze-im-internet.de','recht.bund.de','g-ba.de','bmas.de','arbeitsagentur.de','deutsche-rentenversicherung.de','recht.nrw.de'];
  const official=url=>{
    try{const u=new URL(url);if(u.protocol!=='https:')return false;
      return allowed.some(d=>u.hostname===d||u.hostname.endsWith('.'+d));
    }catch{return false;}
  };
  const sources=[
    ['Bundesgesetzblatt / Gesetzesänderungen','https://www.gesetze-im-internet.de/aktuDienst.html'],
    ['Geltende Bundesgesetze (SGB IX)','https://www.gesetze-im-internet.de/sgb_9_2018/'],
    ['BMAS – Teilhabe und Inklusion','https://www.bmas.de/DE/Soziales/Teilhabe-und-Inklusion/teilhabe-und-inklusion.html'],
    ['Bundesagentur – Gleichstellung','https://www.arbeitsagentur.de/menschen-mit-behinderungen/spezielle-hilfe-und-unterstuetzung/gleichstellung'],
    ['Gemeinsamer Bundesausschuss','https://www.g-ba.de/letzte-aenderungen/'],
    ['Gesetzliche Rentenversicherung','https://www.deutsche-rentenversicherung.de/DRV/DE/Home/home_node.html'],
    ['NRW-Landesrecht','https://recht.nrw.de/']
  ];
  const make=(tag,className,value)=>{
    const el=document.createElement(tag);if(className)el.className=className;
    if(value!==undefined)el.textContent=value;return el;
  };
  const cleanDate=s=>{
    if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}/.test(s))return 'Datum nicht angegeben';
    const d=s.slice(0,10).split('-');return `${d[2]}.${d[1]}.${d[0]}`;
  };
  const profile=()=>window.ASTHMA_SECURITY?.profileGet?.()||{};
  function categoryWeights(){
    // Thematic ranking only: NEVER an eligibility or legal entitlement assessment.
    const p=profile(),gdb=Number(p.gdb)||0;
    const work=Array.isArray(p.lungSymptoms)&&p.lungSymptoms.includes('work');
    return {gdb:gdb>=30||p.equal===true?6:2,
            arbeit:work?6:(gdb>=30?4:2),
            gesundheit:4,reha:gdb>=30?5:3,hilfsmittel:4};
  }
  let busy=false,feed=null,filterMode='possible',visibleIds=[];
  const categories={gdb:'GdB / Schwerbehinderung',arbeit:'Arbeitsrecht',gesundheit:'Asthma / Krankenkasse',reha:'Reha / Teilhabe',hilfsmittel:'Hilfsmittel / Therapie'};
  const stages={verfahren:'Verfahren eingeleitet – kein geltendes Recht bestätigt',vorbehalt:'Inkrafttreten an Bedingungen geknüpft',inkrafttreten_erwaehnt:'Inkrafttreten in der Quelle erwähnt – prüfen',beschluss:'Beschluss gemeldet – Geltung prüfen',unbestimmt:'Rechtswirkung nicht geprüft'};
  const falsePositive=/gleichstellung\s+von\s+pr[uü]fungszeugnissen|gleichstellung\s+von\s+abschlusszeugnissen|tierarzneimittel/i;
  function setup(){
    if($('rechtsmonitor-app'))return;
    const knowledge=$('wissen'),home=$('uebersicht');
    if(!knowledge||!home||!window.ASTHMA_SECURITY?.state?.().unlocked)return;
    const section=make('section','rechtsmonitor-card');section.id='rechtsmonitor-app';
    section.setAttribute('aria-labelledby','rechtsmonitor-heading');
    section.innerHTML=`
      <div class="rechtsmonitor-heading"><div><p class="section-kicker">Amtliche Informationen · Deutschland</p>
      <h3 id="rechtsmonitor-heading">Änderungen zu deinen Rechten prüfen</h3>
      <p>GdB, Gleichstellung, Arbeitsschutz, Reha, Hilfsmittel und Krankenversicherung.</p></div>
      <span class="rechtsmonitor-official">Nur Behördenquellen</span></div>
      <div class="rechtsmonitor-actions"><button id="rechtsmonitor-refresh" class="btn btn-primary" type="button">↻ Rechtslage aktualisieren</button>
      <button id="rechtsmonitor-seen" class="btn btn-outline" type="button" disabled>Gezeigte Meldungen als gelesen markieren</button></div>
      <p class="rechtsmonitor-status" id="rechtsmonitor-status" role="status" aria-live="polite">Noch keine Prüfung durchgeführt.</p>
      <div class="rechtsmonitor-filters" role="group" aria-label="Meldungen filtern"><button type="button" class="rechtsmonitor-filter" data-rfilter="possible" aria-pressed="true">Möglicherweise für mich relevant</button><button type="button" class="rechtsmonitor-filter" data-rfilter="general" aria-pressed="false">Allgemeine Änderungen</button><button type="button" class="rechtsmonitor-filter" data-rfilter="all" aria-pressed="false">Alle Treffer</button></div><div id="rechtsmonitor-results" aria-live="polite"></div>
      <details class="rechtsmonitor-details"><summary>Amtliche Quellen direkt öffnen</summary><div id="rechtsmonitor-official-links"></div></details>
      <p class="rechtsmonitor-note">Die Meldungen sind eine vorsichtige Themenfilterung auf Basis amtlicher Überschriften, keine individuelle rechtliche Bewertung. „Möglicherweise relevant“ bedeutet <strong>nicht</strong>, dass sich ein Anspruch geändert hat. Maßgeblich sind Rechtsstand, Inkrafttreten und dein konkreter Bescheid. Bei Offline-Betrieb ist keine neue Prüfung möglich. Es werden keine Gesundheitsdaten an Quellen übertragen.</p>`;
    const h=knowledge.querySelector('.section-heading');if(h)h.insertAdjacentElement('afterend',section);else knowledge.prepend(section);
    const linkWrap=$('rechtsmonitor-official-links');
    const state=profile()?.region?.state;
    sources.filter(a=>!a[0].startsWith('NRW')||state==='NW').forEach(([label,url])=>{
      if(!official(url))return;
      const a=make('a','rechtsmonitor-source',label+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';linkWrap.append(a);
    });
    const shortcut=make('div','rechtsmonitor-shortcut');
    shortcut.innerHTML='<div><strong>Gesetze & Ansprüche</strong><small>Amtliche Änderungen zu GdB, Arbeitsrecht und Gesundheit prüfen</small></div><button class="btn btn-outline" type="button" id="rechtsmonitor-go">Jetzt prüfen ↗</button>';
    const dash=home.querySelector('.d26-dashboard')||home;
    dash.append(shortcut);
    $('rechtsmonitor-go').addEventListener('click',()=>{
      if(window.ASTHMA_NAV?.go)window.ASTHMA_NAV.go('wissen');
      else document.querySelector('[data-goto="wissen"]')?.click();
      setTimeout(()=>section.scrollIntoView({behavior:'smooth',block:'start'}),100);
    });
    $('rechtsmonitor-refresh').addEventListener('click',check);
    section.querySelectorAll('[data-rfilter]').forEach(b=>b.addEventListener('click',()=>{filterMode=b.dataset.rfilter;render(feed)}));
    $('rechtsmonitor-seen').addEventListener('click',async()=>{
      if(!feed||!Array.isArray(feed.items))return;
      const items=visibleIds;
      const old=Array.isArray(profile().rechtsmonitorSeen)?profile().rechtsmonitorSeen:[];
      const button=$('rechtsmonitor-seen');button.disabled=true;
      try{await window.ASTHMA_SECURITY.updateProfile({rechtsmonitorSeen:[...new Set([...old,...items])].slice(-350)});render(feed);$('rechtsmonitor-status').textContent+=' · Meldungen als gelesen gespeichert.';}
      catch(e){$('rechtsmonitor-status').textContent='Gelesen-Status konnte nicht gespeichert werden: '+(e.message||e);}
    });
    window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='profile'&&feed)render(feed)});
  }
  function render(data){
    const results=$('rechtsmonitor-results');if(!results)return;
    results.replaceChildren();visibleIds=[];
    const buttons=Array.from(document.querySelectorAll('#rechtsmonitor-app [data-rfilter]'));
    for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.rfilter===filterMode));
    if(!data?.generatedAt){
      results.append(make('p','rechtsmonitor-muted','Noch keine Daten geladen. Tippe auf „Rechtslage aktualisieren“. Bis zum ersten erfolgreichen automatischen Abruf nur die amtlichen Links verwenden.'));
      $('rechtsmonitor-seen').disabled=true;return;
    }
    const p=profile(),seen=Array.isArray(p.rechtsmonitorSeen)?p.rechtsmonitorSeen:[];
    const weights=categoryWeights();
    // Legacy feeds have no reviewed classifier version. Never upgrade a broad
    // legacy keyword hit to a personalised/legal conclusion just for display.
    const modern=Number(data.classifierVersion)>=2;
    const all=(Array.isArray(data.items)?data.items:[]).filter(x=>
      x&&typeof x.id==='string'&&typeof x.title==='string'&&typeof x.url==='string'&&
      official(x.url)&&Array.isArray(x.categories)&&!falsePositive.test(x.title)
    ).map(x=>({...x,relevance:modern&&x.relevance==='possible'?'possible':'general'}));
    all.sort((a,b)=>{
      const sa=a.categories.reduce((sum,c)=>sum+(weights[c]||0),0);
      const sb=b.categories.reduce((sum,c)=>sum+(weights[c]||0),0);
      return Number(b.relevance==='possible')-Number(a.relevance==='possible') ||
        sb-sa || String(b.date||'').localeCompare(String(a.date||''));
    });
    const direct=all.filter(x=>x.relevance==='possible'),general=all.filter(x=>x.relevance==='general');
    const visible=(filterMode==='possible'?direct:filterMode==='general'?general:all).slice(0,45);
    results.append(make('p','rechtsmonitor-count',`${direct.length} mögliche Themenbezüge · ${general.length} allgemeine Treffer. ${modern?'Verbesserter Filter aktiv.':'Ältere Meldungen zunächst nur als allgemein markiert; nach dem nächsten Workflow-Abruf neu bewerten.'}`));
    if(!visible.length){
      results.append(make('p','rechtsmonitor-muted',filterMode==='possible'&&general.length?
        'Noch keine Meldung mit engem Themenbezug. Unter „Allgemeine Änderungen“ findest du weitere amtliche Treffer. Keine Entwarnung bezüglich deiner Ansprüche.':
        'Keine Treffer in dieser Auswahl. Das beweist nicht, dass keine Gesetze oder Richtlinien geändert wurden.'));
    }
    for(const entry of visible){
      visibleIds.push(entry.id);
      const card=make('article','rechtsmonitor-item');
      const heading=make('div','rechtsmonitor-item-header');
      heading.append(make('span','rechtsmonitor-date','RSS-Meldedatum: '+cleanDate(entry.date)));
      const state=entry.relevance==='possible'?'Möglicher Themenbezug':'Allgemeine amtliche Meldung';
      heading.append(make('span',entry.relevance==='possible'?'rechtsmonitor-level possible':'rechtsmonitor-level general',state));
      if(!seen.includes(entry.id))heading.append(make('span','rechtsmonitor-new','Noch nicht gelesen'));
      card.append(heading);
      card.append(make('strong','rechtsmonitor-title',entry.title.slice(0,230)));
      const description=(entry.relevance==='possible'? 'Kann thematisch zu deiner Situation passen. ':'Nur allgemeiner Themenbezug. ')+
        (typeof entry.reason==='string'?entry.reason+' ':'')+
        'Bereiche: '+entry.categories.map(x=>categories[x]||x).join(', ')+'.';
      card.append(make('p','rechtsmonitor-summary',description));
      card.append(make('p','rechtsmonitor-legal-stage',stages[entry.stage]||'Geltung und Inkrafttreten nicht geprüft.'));
      const link=make('a','rechtsmonitor-link','Amtliche Originalmeldung öffnen ↗');
      link.href=entry.url;link.target='_blank';link.rel='noopener noreferrer';card.append(link);
      results.append(card);
    }
    const stat=Array.isArray(data.sources)?data.sources:[];
    if(stat.length){
      const details=make('details','rechtsmonitor-source-health');
      const summary=make('summary','','Quellenstatus anzeigen');details.append(summary);
      for(const source of stat){
        details.append(make('p','',`${source.name||'Quelle'}: ${source.ok?'Abruf erfolgreich, '+(Number(source.count)||0)+' thematisch passende Einträge':'Abruf fehlgeschlagen'}${source.ok?'':'. Ergebnisse unvollständig.'}`));
      }
      results.append(details);
    }
    $('rechtsmonitor-seen').disabled=!visibleIds.length;
  }
  async function check(){
    if(busy)return;busy=true;
    const button=$('rechtsmonitor-refresh'),status=$('rechtsmonitor-status');button.disabled=true;
    status.textContent='Amtlichen Aktualisierungsstand abrufen …';
    try{
      const resp=await fetch('./rechtsmonitor-feed.json?check='+Date.now(),{cache:'no-store',credentials:'same-origin'});
      if(!resp.ok)throw Error('Server antwortet mit HTTP '+resp.status);
      const data=await resp.json();
      if(!data||data.schema!==1||!Array.isArray(data.items))throw Error('Unbekanntes Datenformat');
      feed=data;
      const dt=Date.parse(data.generatedAt||'');
      if(!Number.isFinite(dt)){status.textContent='Der automatische Datenabgleich ist noch nicht eingerichtet. Du kannst die amtlichen Quellen unten direkt öffnen.';render(data);return;}
      const age=Math.round((Date.now()-dt)/86400000);
      const working=Array.isArray(data.sources)?data.sources.filter(x=>x.ok).length:0;
      const all=Array.isArray(data.sources)?data.sources.length:0;
      const date=new Intl.DateTimeFormat('de-DE',{dateStyle:'medium',timeStyle:'short'}).format(new Date(dt));
      let msg=`Letzter Feed-Abruf: ${date} · ${working} von ${all} Quellen erreichbar.`;
      if(age>7)msg+=' ACHTUNG: Abruf ist älter als sieben Tage – nicht als aktuell behandeln.';
      if(working<all)msg+=' Einzelne Quellen waren nicht erreichbar; Ergebnisse sind unvollständig.';
      if(data.items.length===0)msg+=' Keine passenden Treffer – keine Entwarnung.';
      if(!Number.isInteger(data.classifierVersion)||data.classifierVersion<2)msg+=' Der neue Filter greift nach dem nächsten erfolgreichen Workflow-Lauf.';
      status.textContent=msg;render(data);
    }catch(e){
      status.textContent='Live-Prüfung nicht möglich: '+(e?.message||'Netzwerkfehler')+'. Es wird keine Aktualität behauptet. Nutze die offiziellen Quellen unten.';
    }finally{button.disabled=false;busy=false;}
  }
  if(document.documentElement.classList.contains('app-unlocked'))setup();
  else{
    const observer=new MutationObserver(()=>{
      if(document.documentElement.classList.contains('app-unlocked')){observer.disconnect();setup();}
    });observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  }
})();
