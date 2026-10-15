'use strict';
/* Asthma 1.6.0 – Bundeslandwahl und bundesweite freie Regionensuche.
   Keine automatisierte Behördenermittlung und keine Übermittlung der Eingaben. */
(() => {
  const $=id=>document.getElementById(id);
  if (!$('region-form') || !$('region-state')) return;
  const KEY='asthma-v1-preferences';
  const states=[
    ['BW','Baden-Württemberg'],['BY','Bayern'],['BE','Berlin'],['BB','Brandenburg'],
    ['HB','Bremen'],['HH','Hamburg'],['HE','Hessen'],['MV','Mecklenburg-Vorpommern'],
    ['NI','Niedersachsen'],['NW','Nordrhein-Westfalen'],['RP','Rheinland-Pfalz'],
    ['SL','Saarland'],['SN','Sachsen'],['ST','Sachsen-Anhalt'],['SH','Schleswig-Holstein'],['TH','Thüringen']
  ];
  const stateNames=new Map(states);
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').toLowerCase().trim();
  const validCode=s=>stateNames.has(s)?s:'';
  const clean=s=>String(s||'').trim().slice(0,90);
  const safeStore=()=>{try {return JSON.parse(localStorage.getItem(KEY)||localStorage.getItem('asthmakompass-v1-preferences')||'{}')||{};}catch{return {};}};
  const read=()=>{
    const x=safeStore().region||{};
    return {state:validCode(x.state),district:clean(x.district),zip:/^\d{5}$/.test(x.zip||'')?x.zip:'',city:clean(x.city)};
  };
  let current=read();
  const items=[
    {id:'bundesportal',category:'gdb',title:'Bundesportal – Schwerbehindertenausweis und zuständige Stelle',type:'Amtliche Suche für alle Bundesländer',body:'Die Zuständigkeit hängt vom Bundesland und Wohnort ab. Im Bundesportal kann die Region für die jeweilige Leistung ausgewählt werden.',url:'https://verwaltung.bund.de/leistungsverzeichnis/DE/leistung/99015007012000',tags:'grad behinderung gdb versorgungsamt schwerbehinderung antrag behorde amt ausweis bundesweit'},
    {id:'gesund',category:'gdb',title:'Gesund.bund.de – Schwerbehinderung und Antrag',type:'Amtliche Information',body:'Erläutert Verfahren und abweichende Zuständigkeiten in den Bundesländern. Für die genaue Stelle die offizielle Regionensuche benutzen.',url:'https://gesund.bund.de/schwerbehinderung',tags:'gdb schwerbehinderung amt ausweis behinderung antrag'},
    {id:'eutb',category:'beratung',title:'Ergänzende unabhängige Teilhabeberatung (EUTB)',type:'Deutschlandweite Beratungsstellensuche',body:'Auf der offiziellen Beratungsseite nach Bundesland, PLZ oder Ort suchen. Die Angebote beraten zu Teilhabe und Unterstützungsleistungen.',url:'https://www.teilhabeberatung.de/beratung/beratungsangebote-der-eutb',tags:'beratung teilhabe beratungstelle hilfsmittel anspruch behinderung'},
    {id:'lungensport',category:'therapie',title:'AG Lungensport – Gruppenregister',type:'Deutschlandweite Lungensport-Suche',body:'Angebote nach Bundesland oder Postleitzahl suchen. Das Register ist freiwillig und deshalb nicht vollständig.',url:'https://www.lungensport.org/lungensport-register.html',tags:'lungensport asthma rehasport atmung trainer bewegung gruppe'},
    {id:'rente',category:'rehabilitation',title:'Deutsche Rentenversicherung – Beratungsstellen',type:'Bundesweite PLZ-/Umkreissuche',body:'Mit PLZ oder Ort eine Beratungsstelle zu medizinischer oder beruflicher Rehabilitation suchen; die individuelle Zuständigkeit ist gesondert zu klären.',url:'https://www.deutsche-rentenversicherung.de/DRV/DE/Beratung-und-Kontakt/Beratung-suchen-und-buchen',tags:'reha rehabilitation rentenversicherung arbeit berufliche teilhabe beratung'},
    {id:'hilfsmittel',category:'beratung',title:'Gesund.bund.de – Medizinische Hilfsmittel',type:'Amtliche Information – bundesweit',body:'Erklärt die Versorgung über Krankenkassen. Welcher Anbieter tatsächlich zuständig ist, richtet sich nach Versicherung und Einzelfall.',url:'https://gesund.bund.de/hilfsmittel',tags:'hilfsmittel inhalator vernebler spacer kosten krankenkasse atemtherapie'},
    {id:'elsa',category:'gdb',title:'NRW – Schwerbehindertenrecht Online (ELSA)',type:'Offizieller NRW-Onlineantrag',body:'Erst- und Änderungsantrag zur Feststellung des GdB und von Merkzeichen. Die erforderlichen Hinweise und Unterschriftsanforderungen im Portal beachten.',url:'https://www.sgbix-online.nrw.de/sgbix/index.html',tags:'nrw nordrhein westfalen gdb grad behinderung schwerbehinderung antrag online',state:'NW'},
    {id:'mk',category:'gdb',title:'Märkischer Kreis – Schwerbehindertenausweis',type:'Verifizierter Kontakt für Märkischer Kreis',body:'Die Kreisverwaltung beschreibt das Feststellungsverfahren, die zuständige Organisationseinheit und den offiziellen NRW-Antragsweg.',url:'https://www.maerkischer-kreis.de/service/dienstleistungen-a-z/detailseite/dienstleistung/show/schwerbehindertenausweis',tags:'markischer maerkischer kreis altena ludenscheid meinerzhagen kierspe schwerbehindertenrecht',state:'NW',districtMatch:/(^|\b)(markischer\s+kreis|maerkischer\s+kreis|markisch(?:e|er)?\s+kreis)(\b|$)/}
  ];
  const node=(tag,cls,str)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(str!==undefined)e.textContent=str;return e;};
  const label=info=>[stateNames.get(info.state)||'',info.district,info.zip,info.city].filter(Boolean).join(' · ')||'Noch keine Region gespeichert';
  const message=(s,error=false)=>{$('region-message').textContent=s;$('region-message').classList.toggle('region-error',error);};
  function render(){
    const display=label(current);
    $('region-current').replaceChildren(node('strong','','Deine gespeicherte Region: '),document.createTextNode(display));
    document.querySelectorAll('[data-region-summary]').forEach(el=>el.textContent=display);
    const textQuery=normalize($('region-query').value);
    const cat=$('region-category').value;
    const subset=items.filter(x=>{
      if(x.state && current.state!==x.state)return false;
      if(x.districtMatch && !x.districtMatch.test(normalize(current.district)))return false;
      if(cat!=='all' && cat!==x.category)return false;
      return !textQuery || normalize([x.title,x.type,x.body,x.tags].join(' ')).includes(textQuery);
    });
    $('region-match-count').textContent=subset.length+' Suchwege';
    const frag=document.createDocumentFragment();
    if(!subset.length){frag.append(node('p','region-empty','Keine passenden Suchwege in dieser Kategorie. Anderen Suchbegriff versuchen oder alle Bereiche anzeigen.'));}
    subset.forEach(x=>{
      const article=node('article','region-result');
      article.append(node('span','region-type',x.type),node('h4','',x.title),node('p','',x.body));
      const actions=node('div','region-actions');
      const link=node('a','btn btn-outline','Offizielle Seite öffnen ↗');
      link.href=x.url;link.target='_blank';link.rel='noopener noreferrer';
      actions.append(link);article.append(actions);frag.append(article);
    });
    $('region-results').replaceChildren(frag);
  }
  function fill(){
    $('region-state').value=current.state;$('region-district').value=current.district;
    $('region-zip').value=current.zip;$('region-city').value=current.city;
  }
  function save(info){
    const data=safeStore();data.region=info;
    localStorage.setItem(KEY,JSON.stringify(data));current=info;
    window.dispatchEvent(new CustomEvent('asthma:region-changed',{detail:{...info}}));
  }
  states.forEach(([code,title])=>{const option=node('option','',title);option.value=code;$('region-state').append(option);});
  // Only a verified local suggestion is offered; every other German district remains freely enterable.
  const mkOption=node('option','','Märkischer Kreis');mkOption.value='Märkischer Kreis';$('region-districts').append(mkOption);
  fill();render();
  $('region-form').addEventListener('submit',ev=>{
    ev.preventDefault();
    const state=validCode($('region-state').value),zip=$('region-zip').value.trim();
    if(!state){message('Bitte wähle zuerst ein Bundesland.',true);$('region-state').focus();return;}
    if(zip && !/^\d{5}$/.test(zip)){message('Die PLZ muss aus genau fünf Ziffern bestehen.',true);$('region-zip').focus();return;}
    const info={state,district:clean($('region-district').value),zip,city:clean($('region-city').value)};
    try{save(info);message('Region lokal gespeichert. Die offiziellen Suchwege wurden angepasst.');render();}
    catch(e){message('Speichern im Browser ist nicht möglich. Bitte Browserspeicher-Einstellungen prüfen.',true);}
  });
  $('region-clear').addEventListener('click',()=>{
    try{const data=safeStore();delete data.region;localStorage.setItem(KEY,JSON.stringify(data));current={state:'',district:'',zip:'',city:''};fill();message('Region zurückgesetzt.');render();}
    catch{message('Die Region konnte nicht gelöscht werden.',true);}
  });
  $('region-category').addEventListener('change',render);
  $('region-query').addEventListener('input',render);
  $('region-state').addEventListener('change',()=>{
    // Search suggestions are intentionally incomplete; never force a county from a different state.
    $('region-districts').replaceChildren();
    if($('region-state').value==='NW')$('region-districts').append(mkOption.cloneNode(true));
  });
  window.addEventListener('asthma:profile-reset',()=>{current=read();fill();render();});
  window.addEventListener('storage',e=>{if(e.key===KEY){current=read();fill();render();}});
  Object.defineProperty(window,'__asthmaRegionTest',{value:Object.freeze({normalize,validCode,itemsCount:items.length,selected:()=>({...current})}),enumerable:false});
})();
