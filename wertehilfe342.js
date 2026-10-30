'use strict';
/* Asthma 3.4.2 – verständliche, lokale Erläuterungen direkt bei den Werten.
 * Keine Diagnosen, keine erfundenen Referenzbereiche, keine automatische Bild-OCR. */
(()=>{
 const S=window.ASTHMA_SECURITY;if(!S?.state?.().unlocked)return;
 const catalogs={
  lungenwerte:{title:'Lungenfunktion · Werte verstehen',intro:'FEV₁: in einer Sekunde ausgeatmetes Volumen; FVC: forcierte Vitalkapazität; Prozent vom Soll hängt von Referenzdaten ab. FEV₁/FVC ist ein Verhältnis und nicht mit % Soll gleichzusetzen. Die Qualität und Messphase gehören zur Befundbewertung.'},
  vitalwerte:{title:'Vitalwerte und Gewicht · Werte verstehen',intro:'SpO₂: per Pulsoxymeter geschätzte Sauerstoffsättigung. Blutdruck: oberer/unterer Druck in mmHg. Puls: Herzschläge pro Minute. Gewicht: kg; einzelne Werte sind noch kein Verlauf. Zeitpunkt, Messgerät und Beschwerden beeinflussen die Einordnung.'},
  labor:{title:'Labor · Werte verstehen',intro:'Laborwerte immer mit der Originaleinheit, dem Referenzbereich des jeweiligen Labors, dem Untersuchungsdatum und der aktuellen Medikation beurteilen. Ohne diese Angaben keine zuverlässige Kennzeichnung als normal oder auffällig.'},
  schlaflabor:{title:'Schlaflabor · Werte verstehen',intro:'AHI: erfasste Atemereignisse pro Stunde (je nach Messverfahren). ODI: Sauerstoffentsättigungen pro Stunde. T90: Anteil unter 90 % SpO₂. Polygraphie erfasst ohne EEG keine verlässlichen Schlafphasen; Geräteangaben sind nicht automatisch mit Polysomnographie vergleichbar.'},
  peakflow:{title:'Peak-Flow · Werte verstehen',intro:'Peak-Flow/PEF ist der maximale Ausatemfluss. Technik, Gerät und persönlicher Bestwert sind für Veränderungen wichtig; nicht direkt mit der ärztlichen FEV₁-Spirometrie gleichsetzen.'},
  befunde:{title:'Befundscanner · richtig übernehmen',intro:'Fotos und PDFs bleiben Originale. Zahlen werden nur nach Überprüfung in passende Messreihen übernommen. Aus Bilddateien können nicht in allen Browsern automatisch verlässliche Werte extrahiert werden.'},
  gehttest:{title:'Gehtest · Werte verstehen',intro:'Gehstrecke beschreibt die dokumentierte Leistung an diesem Untersuchungstag. Sauerstoffsättigung per Fingerclip (SpO₂) und Blutprobe (SaO₂) getrennt betrachten. pO₂, pCO₂, pH, BE und HCO₃ nur gemeinsam mit Probenart und Messbedingungen interpretieren.'}
 };
 const els=[];for(const [id,def] of Object.entries(catalogs)){
  const page=document.getElementById(id);if(!page)continue;
  const details=document.createElement('details');details.className='wh342-info';details.id='wh342-'+id;
  const summary=document.createElement('summary');summary.textContent='MESSWERTE VERSTEHEN · '+def.title;
  const text=document.createElement('p');text.textContent=def.intro;
  const latest=document.createElement('div');latest.className='wh342-latest';latest.setAttribute('aria-live','polite');
  const warn=document.createElement('p');warn.className='wh342-disclaimer';warn.textContent='Nur Erläuterung, keine Diagnose. Änderungen können unter anderem durch Messmethode, Medikamente und klinische Bedingungen entstehen. Fehlende Werte werden nicht ergänzt.';
  details.append(summary,text,latest,warn);
  const heading=page.querySelector('.section-heading');if(heading)heading.insertAdjacentElement('afterend',details);else page.prepend(details);
  els.push({id,latest});
 }
 const style=document.createElement('style');style.textContent='.wh342-info{margin:12px 0 21px;background:#f0f8fa;border:2px solid #b4d6df;border-radius:12px;padding:12px}.wh342-info summary{font-size:.98rem;font-weight:900;color:#17516a;cursor:pointer;line-height:1.45}.wh342-info p{color:#3b6070;font-size:.88rem;line-height:1.5}.wh342-info .wh342-latest{display:grid;gap:7px}.wh342-info .wh342-latest>div{padding:9px;background:white;border:1px solid #d8e7ed;border-radius:9px;font-size:.9rem}.wh342-info .wh342-latest strong{color:#1e4f64}.wh342-info .wh342-disclaimer{font-size:.77rem;color:#617785}';document.head.append(style);
 const number=v=>typeof v==='number'&&Number.isFinite(v)?v:null;
 const show=v=>number(v)===null?'nicht angegeben':v.toLocaleString('de-DE',{maximumFractionDigits:2});
 const fmt=s=>/^\d{4}-\d{2}-\d{2}$/.test(s||'')?s.slice(8)+'.'+s.slice(5,7)+'.'+s.slice(0,4):'ohne Datum';
 const rows=(data,type)=>data.filter(r=>r.type===type&&r.value?.date).map(r=>r.value).sort((a,b)=>(b.date+' '+(b.time||'')).localeCompare(a.date+' '+(a.time||'')));
 let ticket=0;
 async function refresh(){const local=++ticket;const [suite,labs,epef]=await Promise.all([S.list('suite'),S.list('labs'),S.list('epef')]);if(ticket!==local)return;
  for(const {id,latest} of els){latest.replaceChildren();const items=[];
   if(id==='lungenwerte'){
    const rec=rows(suite,'measurements')[0];if(rec)items.push(['Letzte Lungenfunktion · '+fmt(rec.date),'FEV₁ '+show(number(rec.fev1))+' % vom Soll; FVC '+show(number(rec.fvc))+' % vom Soll. Die Messphase und der Originalbefund bleiben maßgeblich.']);
    const diff=rows(suite,'diffusion')[0];if(diff)items.push(['Letzte Diffusionsmessung · '+fmt(diff.date),'DLCO und KCO zeigen den Gasaustausch; zur Bewertung werden % vom Soll und Messqualität benötigt.']);
   }
   if(id==='vitalwerte'){
    const vital=rows(suite,'vital29');for(const kind of ['spo2','bp','pulse']){const x=vital.find(r=>r.kind===kind);if(!x)continue;
      const description=kind==='spo2'?'SpO₂ '+show(number(x.value))+' %':kind==='pulse'?'Puls '+show(number(x.value))+' /min':'Blutdruck '+show(number(x.value))+'/'+show(number(x.diastolic))+' mmHg';
      items.push(['Letzte '+({spo2:'Sauerstoffmessung',bp:'Blutdruckmessung',pulse:'Pulsmessung'}[kind])+' · '+fmt(x.date),description+'. Zur Beurteilung sind Messumstände und Beschwerden wichtig.']);}
    const w=rows(suite,'weight292')[0];if(w)items.push(['Letztes Gewicht · '+fmt(w.date),show(number(w.kg))+' kg. Mehrere Messungen bei vergleichbaren Bedingungen bilden den Verlauf.']);
   }
   if(id==='schlaflabor'){const x=rows(suite,'sleep340')[0];if(x)items.push(['Letzte Schlafmessung · '+fmt(x.date),'AHI '+show(number(x.ahi))+'/h; ODI '+show(number(x.odi))+'/h. PSG, Polygraphie und PAP-Werte bitte unterscheiden.']);}
   if(id==='labor'){const recent=[...labs].filter(x=>x?.date).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);for(const x of recent)items.push(['Labor · '+fmt(x.date)+' · '+String(x.label||x.marker||'Messwert'),String(x.value??'–')+' '+String(x.unit||'')+'. '+(x.reference?'Labor-Referenz: '+String(x.reference).slice(0,80)+'. ':'')+'Verlauf und Einordnung anhand des Originalbefunds prüfen.']);}
   if(id==='peakflow'){const recent=epef.filter(x=>x.kind==='measurement'&&x.date).sort((a,b)=>b.date.localeCompare(a.date))[0];if(recent)items.push(['Letzte ePEF-Messung · '+fmt(recent.date),'Peak-Flow '+show(number(recent.pef))+' l/min. Persönlicher Bestwert, Gerät und Messtechnik berücksichtigen.']);}
   if(id==='gehttest'){const x=rows(suite,'walk342')[0];if(x)items.push(['Letzter Gehtest · '+fmt(x.date),show(number(x.distance))+' m in '+show(number(x.duration))+' Minuten; Blutgase und SaO₂/SpO₂ nur getrennt interpretieren.']);}
   if(!items.length){const p=document.createElement('p');p.textContent='Zu diesem Bereich sind noch keine passend strukturierten Messwerte hinterlegt. Neue Werte werden nach dem Speichern hier ergänzt.';latest.append(p);continue;}
   for(const [label,description] of items){const r=document.createElement('div'),title=document.createElement('strong');title.textContent=label;const p=document.createElement('p');p.textContent=description;r.append(title,p);latest.append(r);}
  }
 }
 let delay;window.addEventListener('asthma:secure-change',e=>{if(['suite','labs','epef'].includes(e.detail?.group)){clearTimeout(delay);delay=setTimeout(()=>refresh().catch(()=>{}),180)}});
 refresh().catch(()=>{});
 window.__ASTHMA_WERTEHILFE342_TEST=Object.freeze({version:'3.4.2',areas:Object.keys(catalogs)});
 // PneumoPro 3.5.0: private, modular lab extension. Keep existing 3.4.8 features intact.
 if(!document.getElementById('lp349-loader')){
  const extension=document.createElement('script');extension.id='lp349-loader';extension.src='./laborpro349.js?v=3.5.0';
  extension.onerror=()=>{const note=document.createElement('p');note.style.cssText='color:#a52737;font-weight:bold;padding:12px';note.textContent='Labor-Probenmodul konnte nicht geladen werden. Bitte online aktualisieren und die Offline-Bereitschaft prüfen.';document.getElementById('labor')?.prepend(note);};
  document.body.append(extension);
 }
 // Arztvorbereitung loads after the existing pages, keeping all historical reports intact.
 if(!document.getElementById('av351-loader')){
  const sheet=document.createElement('script');sheet.id='av351-loader';sheet.src='./arztvor351.js?v=3.5.1';
  sheet.onerror=()=>{const warning=document.createElement('p');warning.style.cssText='color:#b12233;font-weight:bold;padding:12px';warning.textContent='Arztvorbereitung konnte nicht geladen werden. Bitte Aktualisierung und Offline-Cache prüfen.';document.getElementById('bericht')?.prepend(warning)};
  document.body.append(sheet);
 }
 // PneumoPro 3.5.2: accessible top-bar Scans and private upload dialog.
 if(!document.getElementById('ps352-loader')){
  const scan=document.createElement('script');scan.id='ps352-loader';scan.src='./scans352.js?v=3.5.2';
  scan.onerror=()=>console.error('Scans 3.5.2 konnten nicht geladen werden. Offline-Cache prüfen.');
  document.body.append(scan);
 }
})();
