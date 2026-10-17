'use strict';
/* Versorgung & Antragshilfe – datensparsame Ortssuche, 1–35 km (Luftlinie).
 * Fachstellen in dieser ersten Version: verifizierte, regionale Auswahl in Südwestfalen.
 * Keine vermeintlich vollständige bundesweite Datenbank; kein Geocoding ohne Einwilligung.
 * Standort nur im Arbeitsspeicher, weder gespeichert noch an einen Dienst übertragen.
 */
(()=>{
  const SEC=window.ASTHMA_SECURITY;
  const $=id=>document.getElementById(id);
  const page=$('region');
  if(!page||!SEC?.state?.().unlocked||$('v30-panel'))return;
  const css=document.createElement('link');css.rel='stylesheet';css.href='./versorgung30.css';document.head.append(css);
  const node=(tag,cl,value)=>{const n=document.createElement(tag);if(cl)n.className=cl;if(value!==undefined)n.textContent=String(value);return n};
  const cities=[
    {id:'',label:'Ort auswählen …'},
    {id:'Meinerzhagen',label:'Meinerzhagen',lat:51.1072,lon:7.6383},
    {id:'Kierspe',label:'Kierspe',lat:51.1352,lon:7.5892},
    {id:'Lüdenscheid',label:'Lüdenscheid',lat:51.2186,lon:7.6295},
    {id:'Gummersbach',label:'Gummersbach',lat:51.027,lon:7.568},
    {id:'Iserlohn',label:'Iserlohn',lat:51.3811,lon:7.6955},
    {id:'Hemer',label:'Hemer',lat:51.3853,lon:7.765},
    {id:'Wipperfürth',label:'Wipperfürth',lat:51.1160,lon:7.3943},
    {id:'Olpe',label:'Olpe',lat:51.028,lon:7.847},
  ];
  // Stadtzentrum als Standortnäherung für diese erste regionale Liste; die
  // Entfernung ist NICHT präzise bis zur jeweiligen Straßenadresse.
  const providers=[
    {id:'mzn-mittendrin',name:'MITTENDRIN – Soziales Bürgerzentrum',place:'Meinerzhagen',
      address:'Prumbomweg 3, 58540 Meinerzhagen',lat:51.1073,lon:7.64049,precision:'adresse',
      cost:'free',costText:'Kostenlose Beratungsangebote (konkretes Thema vorab erfragen)',
      areas:['sozial','antrag'],form:'ask',help:'Soziale Beratung und Orientierung für unterschiedliche Lebenslagen. Umfang der persönlichen Formularhilfe vorher abklären.',
      phone:'+492354911660',url:'https://www.mittendrin-meinerzhagen.de/uber-uns/',source:'Anbieter: MITTENDRIN'},
    {id:'eutb-lued',name:'EUTB Märkischer Kreis – Lüdenscheid',place:'Lüdenscheid',
      address:'Friedrichstraße 29, 58507 Lüdenscheid',cost:'free',costText:'Kostenlose unabhängige Teilhabeberatung',
      areas:['gdb','reha','antrag','hilfsmittel'],form:'before',help:'Orientierung zu Schwerbehinderung, Teilhabe am Arbeitsleben, Rehabilitation und Hilfsmitteln – insbesondere vor Antragstellung.',
      phone:'+4923516703914',url:'https://www.eutb-mk.de/kontakt',source:'Anbieter: EUTB Märkischer Kreis'},
    {id:'caritas-lued',name:'Caritas – Allgemeine Sozialberatung',place:'Lüdenscheid',
      address:'Graf-von-Galen-Straße 6, 58509 Lüdenscheid (Kontaktadresse)',cost:'free',costText:'Erstberatung kostenlos, Termin erforderlich',
      areas:['sozial','antrag'],form:'yes',help:'Nach Anbieterangaben ausdrücklich Hilfe beim Ausfüllen von Anträgen und Verstehen von Behördenschreiben. Zuständigkeit für dein konkretes Anliegen vorab klären.',
      phone:'+492351905000',url:'https://caritas-luedenscheid.de/wohnen-und-alltag/allgemeine-sozialberatung/',source:'Anbieter: Caritas'},
    {id:'eutb-iserlohn',name:'EUTB Märkischer Kreis – Iserlohn',place:'Iserlohn',
      address:'Bethanienallee 6, 58644 Iserlohn',cost:'free',costText:'Kostenlose unabhängige Teilhabeberatung',
      areas:['gdb','reha','antrag','hilfsmittel'],form:'before',help:'Teilhabeberatung, Fragen zu Rehabilitation und Beantragung von Leistungen; konkrete Formularausfüllhilfe vorher erfragen.',
      phone:'+4923714782960',url:'https://www.eutb-mk.de/kontakt',source:'Anbieter: EUTB Märkischer Kreis'},
    {id:'vdk-hemer',name:'VdK – Kreisgeschäftsstelle Märkischer Kreis',place:'Hemer',
      address:'Ostenschlahstraße 60, 58675 Hemer',cost:'paid',costText:'Mitgliedschaft NRW: 6,50 €/Monat; weitere Beiträge für Vertretung möglich',
      areas:['gdb','sozial','recht','reha'],form:'no',help:'Sozialrechtliche Beratung und Widerspruchsvertretung für Mitglieder. Laut landesweitem Leistungskatalog ist das Ausfüllen von Leistungsanträgen grundsätzlich NICHT Bestandteil des Angebots.',
      phone:'+4923725592082',url:'https://nrw.vdk.de/vor-ort/kv-maerkischer-kreis/',source:'Anbieter: VdK NRW'},
    {id:'eutb-gum',name:'EUTB Oberbergischer Kreis – Gummersbach',place:'Gummersbach',
      address:'La Roche-sur-Yon-Straße 5, 51643 Gummersbach',cost:'free',costText:'Kostenlose Teilhabeberatung',
      areas:['gdb','reha','antrag','hilfsmittel'],form:'before',help:'Unabhängige Beratung zu Leistungen der Teilhabe und Rehabilitation, insbesondere vor der Antragstellung.',
      phone:'+4922616393776',url:'https://www.paritaetischer-oberbergischer-kreis.de/eutb/kontakt',source:'Anbieter: Der Paritätische Oberberg'},
    {id:'drv-gum',name:'Deutsche Rentenversicherung – Service-Zentrum Gummersbach',place:'Gummersbach',
      address:'Singerbrinkstraße 41, 51643 Gummersbach',cost:'free',costText:'Kostenlose Beratung nach Terminvereinbarung',
      areas:['reha','rente','antrag'],form:'ask',help:'Offizielle Auskunft und Beratung zu medizinischer Rehabilitation, Prävention und Rentenversicherung. Ob Anträge am Termin aufgenommen werden, vorher erfragen.',
      phone:'+49226180501',url:'https://www.deutsche-rentenversicherung.de/SharedDocs/Standorte/AB-Stellen/Traeger/Rheinland/SZ_Gummersbach_Standort',source:'Anbieter: Deutsche Rentenversicherung'},
    {id:'vdk-gum',name:'VdK – Kreisgeschäftsstelle Oberberg',place:'Gummersbach',
      address:'Kleine Bergstraße 5, 51643 Gummersbach',cost:'paid',costText:'Mitgliedschaft NRW: 6,50 €/Monat; zusätzliche Gebühren möglich',
      areas:['gdb','recht','reha','sozial'],form:'no',help:'Sozialrechtsberatung und Vertretung für Mitglieder. Das Ausfüllen von Leistungsanträgen ist grundsätzlich nicht Teil des NRW-Angebots.',
      phone:'+49226126064',url:'https://nrw.vdk.de/vor-ort/kv-oberberg/beratungsangebote/',source:'Anbieter: VdK NRW'},
    {id:'eutb-wipp',name:'EUTB Oberberg – Außensprechstunde Wipperfürth',place:'Wipperfürth',
      address:'Klosterplatz 2, 51688 Wipperfürth',cost:'free',costText:'Kostenlose Teilhabeberatung',
      areas:['gdb','reha','antrag','hilfsmittel'],form:'before',help:'Außensprechstunde im Haus der Familie. Nur an bestimmten Tagen und mit Termin; aktuelle Zeiten beim Anbieter bestätigen.',
      phone:'+4922616393776',url:'https://www.paritaetischer-oberbergischer-kreis.de/eutb/kontakt',source:'Anbieter: Der Paritätische Oberberg'},
    {id:'eutb-olpe',name:'EUTB Siegen-Wittgenstein-Olpe – Olpe',place:'Olpe',
      address:'Martinstraße 29b, 57462 Olpe',cost:'free',costText:'Kostenlose Teilhabeberatung',
      areas:['gdb','reha','antrag','hilfsmittel'],form:'before',help:'Beratung zu Teilhabe, Anträgen und Rehabilitation. Der Anbieter bietet keine Rechtsvertretung.',
      phone:'+4927148536901',url:'https://www.teilhabeberatung.de/beratung/eutb-siegen-wittgenstein-olpe-standort-olpe',source:'Bundesweites EUTB-Verzeichnis'},
  ];
  const lookupCity=new Map(cities.filter(x=>x.id).map(x=>[x.id,x]));
  const dirs=[
    ['EUTB – bundesweite Beratungsstellensuche','https://www.teilhabeberatung.de/beratung/beratungsangebote-der-eutb','Kostenlos; bundesweite Standort- und Umkreissuche beim Anbieter'],
    ['Deutsche Rentenversicherung – Beratung suchen','https://www.deutsche-rentenversicherung.de/DRV/DE/Beratung-und-Kontakt/Beratung-suchen-und-buchen','Kostenlose offizielle Beratung; Standorte deutschlandweit'],
    ['VdK NRW – Kreisverbände','https://nrw.vdk.de/vor-ort/','Mitgliedschaft/ggf. Gebühren; vor Beratung prüfen'],
  ];
  const km=(a,b,c,d)=>{
    const rad=Math.PI/180,dl=(c-a)*rad,dlo=(d-b)*rad;
    const v=Math.sin(dl/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(dlo/2)**2;
    return 12742*Math.asin(Math.min(1,Math.sqrt(v)));
  };
  const safe=(x)=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const pad=(x)=>Math.round(x*10)/10;
  const panel=node('section','v30-panel');panel.id='v30-panel';
  panel.innerHTML=`
    <div class="v30-head"><div><p class="section-kicker">Versorgung · Antragshilfe · Beratungsstellen</p>
      <h3>Hilfe in deiner Nähe finden</h3><p>Geprüfte Anlaufstellen, Hilfe bei Formularen, GdB, Reha, Hilfsmitteln und Widersprüchen. Kostenlos und kostenpflichtig getrennt.</p></div></div>
    <div class="v30-settings">
      <label>Ort für die Suche <select id="v30-city"></select></label>
      <button class="btn btn-outline" type="button" id="v30-gps">Aktuellen Standort einmalig verwenden</button>
      <label class="v30-radius-label" for="v30-radius">Suchradius <strong id="v30-km">35 km</strong></label>
      <input id="v30-radius" type="range" min="1" max="35" step="1" value="35">
      <fieldset class="v30-fieldset"><legend>Kosten</legend>
        <div id="v30-cost-buttons" class="v30-costs" role="group" aria-label="Beratungskosten"></div>
      </fieldset>
      <label>Wobei brauchst du Hilfe? <select id="v30-topic">
        <option value="all">Alle Beratungsbereiche</option><option value="antrag">Anträge & Formulare</option>
        <option value="gdb">GdB & Schwerbehinderung</option><option value="reha">Reha & Teilhabe</option>
        <option value="hilfsmittel">Hilfsmittel</option><option value="sozial">Sozialleistungen & Krankengeld</option>
        <option value="rente">Rentenversicherung</option><option value="recht">Widerspruch & Sozialrecht</option>
      </select></label>
      <label class="v30-check"><input type="checkbox" id="v30-formhelp"> Nur bestätigte Hilfe beim Ausfüllen von Anträgen</label>
    </div>
    <p class="v30-info" id="v30-status" role="status">Bitte Suchort auswählen oder Standortfreigabe erteilen.</p>
    <div class="v30-results"><div class="v30-results-head"><h4>Beratungsstellen</h4><strong id="v30-count">–</strong></div><div id="v30-list"></div></div>
    <details class="v30-checklist"><summary>Welche Unterlagen sollte ich zur Beratung mitnehmen?</summary>
      <ul><li>Bescheide, Schreiben und Antragsformulare zur konkreten Angelegenheit</li>
      <li>Relevante ärztliche Atteste, Befunde und Reha-Unterlagen (nur wenn erforderlich)</li>
      <li>Versicherungsnummer, Ausweis und bestehende Nachweise – je nach Beratungsstelle</li>
      <li>Fragenliste sowie Datum einer eventuell laufenden Widerspruchsfrist</li></ul>
      <p>Keine persönlichen Unterlagen automatisch an Anbieter schicken. Umfang der Hilfe vorher telefonisch klären.</p>
    </details>
    <div class="v30-directories"><h4>Deutschlandweite Suchwege</h4>
      <p>Die aktuell in der App geprüfte Adressliste deckt ausgewählte Standorte in Südwestfalen/Oberberg ab. Die Links führen zu umfassenderen offiziellen Verzeichnissen; diese sind nicht Teil des Radiusfilters.</p>
      <div id="v30-links"></div></div>
    <p class="v30-note">Entfernungen: ungefähre Luftlinie, bei den meisten Einträgen auf Basis der Ortsmitte, nicht tatsächliche Fahrtstrecke. Quellenstand: 17.10.2026. Angebote, Preise und Adressen vor dem Besuch beim Anbieter bestätigen. Standortfreigabe ist freiwillig, Position wird weder gespeichert noch an eine Such-API übertragen. Externe Links/Apple Karten öffnen erst nach deinem Antippen.</p>`;
  const anchor=$('region-current');anchor?.parentElement?.insertBefore(panel,anchor);
  if(!$('v30-city'))return;
  const select=$('v30-city'),radius=$('v30-radius'),status=$('v30-status'),costbox=$('v30-cost-buttons');
  for(const city of cities){const option=node('option','',city.label);option.value=city.id;select.append(option)}
  const costs=[['all','Alle'],['free','Kostenlos'],['paid','Kostenpflichtig'],['unknown','Nicht bestätigt']];
  let cost='all',center=null,geo=false;
  for(const [value,label] of costs){const b=node('button','v30-cost-btn',label);b.type='button';b.dataset.cost=value;b.setAttribute('aria-pressed',String(cost===value));b.addEventListener('click',()=>{cost=value;for(const btn of costbox.children)btn.setAttribute('aria-pressed',String(btn.dataset.cost===cost));render()});costbox.append(b)}
  const info=SEC.profileGet?.()?.region;
  const remembered=cities.find(c=>c.id&&safe(c.id)===safe(info?.city));
  if(remembered){select.value=remembered.id;center={lat:remembered.lat,lon:remembered.lon,label:remembered.label}}
  const maps=(address)=>'https://maps.apple.com/?daddr='+encodeURIComponent(address);
  function render(){
    const max=Number(radius.value);$('v30-km').textContent=max+' km';
    const list=$('v30-list');list.replaceChildren();
    if(!center){status.textContent='Bitte einen Suchort auswählen oder einmalig die GPS-Position freigeben. Die regionale Auswahl wird anschließend nach Entfernung gefiltert.';$('v30-count').textContent='–';return}
    const topic=$('v30-topic').value,onlyForm=$('v30-formhelp').checked;
    const entries=providers.map(p=>{
      const target=('lat'in p)?p:lookupCity.get(p.place);
      return {...p,dist:target?km(center.lat,center.lon,target.lat,target.lon):null};
    }).filter(p=>p.dist!==null&&p.dist<=max&&
      (cost==='all'||p.cost===cost)&&(topic==='all'||p.areas.includes(topic))&&(!onlyForm||p.form==='yes'))
      .sort((a,b)=>a.dist-b.dist||a.name.localeCompare(b.name,'de'));
    status.textContent=`Suchmitte: ${center.label} · Radius ${max} km · ${entries.length} regional geprüfte ${entries.length===1?'Anlaufstelle':'Anlaufstellen'} · ungefährer Luftlinienabstand. ${geo?'GPS-Position nur für diese Sitzung genutzt.':'Manuell gewählte Ortsmitte.'}`;
    $('v30-count').textContent=entries.length+' Treffer';
    if(!entries.length){list.append(node('p','v30-empty','Keine geprüfte Einrichtung in dieser Filterkombination. Radius oder Kostenfilter ändern. Für weitere Regionen die bundesweiten offiziellen Suchwege unten verwenden.'));return}
    for(const p of entries){
      const card=node('article','v30-result');
      const head=node('div','v30-result-head');const strong=node('strong','',p.name);
      const span=node('span','v30-distance',`ca. ${pad(p.dist).toLocaleString('de-DE')} km`);
      head.append(strong,span);card.append(head);
      const costline=node('div','v30-line');costline.append(node('span','v30-cost v30-cost-'+p.cost,p.cost==='free'?'Kostenlos':p.cost==='paid'?'Kostenpflichtig':'Kosten nicht bestätigt'));
      costline.append(node('small','',p.costText));card.append(costline);
      card.append(node('p','v30-help',p.help));
      card.append(node('p','v30-address',p.address));
      const formLabels={yes:'Formularhilfe vom Anbieter ausdrücklich bestätigt',before:'Beratung vor Antragstellung',ask:'Formularhilfe vorher erfragen',no:'Keine allgemeine Ausfüllhilfe laut Angebot'};
      card.append(node('p','v30-form-hint',formLabels[p.form]));
      const actions=node('div','v30-actions');
      const a=node('a','btn btn-outline','Offizielle Quelle ↗');a.href=p.url;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);
      const phone=node('a','btn btn-outline','Anrufen');phone.href='tel:'+p.phone;actions.append(phone);
      const map=node('a','btn btn-outline','Route ↗');map.href=maps(p.address);map.target='_blank';map.rel='noopener noreferrer';actions.append(map);
      card.append(actions);card.append(node('small','v30-source','Quelle: '+p.source+' · Standortentfernung nur näherungsweise'));list.append(card);
    }
  }
  select.addEventListener('change',()=>{const x=lookupCity.get(select.value);center=x?{lat:x.lat,lon:x.lon,label:x.label}:null;geo=false;render()});
  radius.addEventListener('input',render);$('v30-topic').addEventListener('change',render);$('v30-formhelp').addEventListener('change',render);
  $('v30-gps').addEventListener('click',()=>{
    if(!navigator.geolocation){status.textContent='Dieses Gerät bietet keine Standortabfrage. Bitte Ort wählen.';return}
    status.textContent='Warte auf deine einmalige Standortfreigabe …';
    navigator.geolocation.getCurrentPosition(p=>{
      center={lat:p.coords.latitude,lon:p.coords.longitude,label:'Mein Standort (nicht gespeichert)'};geo=true;select.value='';render();
    },()=>{status.textContent='Standort nicht verfügbar oder Freigabe abgelehnt. Bitte einen Ort auswählen.';},
    {enableHighAccuracy:false,maximumAge:60000,timeout:12000});
  });
  const links=$('v30-links');for(const [name,url,details]of dirs){const line=node('div','v30-directory');const a=node('a','',''+name+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';line.append(a,node('small','',details));links.append(line)}
  const home=$('uebersicht');if(home&&!$('v30-home-link')){
    const b=node('button','btn btn-outline','Versorgung & Antragshilfe · bis 35 km ↗');b.id='v30-home-link';b.type='button';b.addEventListener('click',()=>{window.ASTHMA_NAV?.go?.('region');setTimeout(()=>panel.scrollIntoView({block:'start',behavior:'smooth'}),50)});
    const target=home.querySelector('.d26-dashboard')||home;target.append(b);
  }
  window.addEventListener('asthma:region-changed',e=>{if(geo)return;const c=cities.find(x=>safe(x.id)===safe(e.detail?.city));if(c){select.value=c.id;center={lat:c.lat,lon:c.lon,label:c.label};render()}});
  window.ASTHMA_VERSORGUNG30=Object.freeze({km,providerCount:providers.length,cityCount:cities.length-1});
  render();
})();
