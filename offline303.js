'use strict';
/* Asthma 3.0.3 – Anzeige und Prüfung des lokalen App-Caches. Kein Datenupload. */
(()=>{
 const $=id=>document.getElementById(id);
 const settings=$('app-settings'),badge=$('connection');
 if(!settings||$('offline303-panel'))return;
 const panel=document.createElement('section');panel.className='suite-subpanel';panel.id='offline303-panel';
 panel.innerHTML=`<h3>Offline-Nutzung prüfen</h3>
 <p>Die gespeicherten Einträge, Statistiken, Diagramme, Laborwerte, Medikamente, Kalender und die lokale PDF-Erstellung können nach einer vollständigen Online-Installation auch ohne Internet funktionieren. Externe Webseiten, regionale Onlinesuche, Echtzeitdaten und Updateabrufe benötigen Internet.</p>
 <button class="btn btn-outline" id="offline303-check" type="button">Offline-Bereitschaft prüfen</button>
 <p id="offline303-result" role="status">Noch nicht geprüft.</p>
 <p class="input-note">Ein einmaliger Test im Flugmodus ist sinnvoll. Lösche keine Safari-Website-Daten und deinstalliere das Home-Bildschirm-Symbol nicht, ohne zuvor eine verschlüsselte Sicherung erstellt zu haben. iOS kann Browser-Speicher unter Umständen entfernen.</p>`;
 settings.append(panel);
 const onNet=()=>{if(badge){badge.textContent=navigator.onLine?'Lokal nutzbar · online':'Offline · lokale Daten';badge.title='Anzeige nach dem Browser-Netzwerksignal; kein echter Verbindungstest.';}};
 window.addEventListener('online',onNet);window.addEventListener('offline',onNet);onNet();
 // All installable local assets; updated for PneumoPro 3.5.3.
 const assets=["./scans352.js", "./arztvor351.js", "./laborpro349.js", "./bewertung348.js", "./bewertung348.css", "./ampel347.js", "./ampel347.css", "./bpampel344.js", "./bpampel344.css", "./lungenkrankheiten344.js", "./lungenkrankheiten344.css", "./dicom343.js", "./bildgebung343.js", "./bildgebung343.css", "./behandler343.js", "./behandler343.css", "./dateien331.js", "./dateien331.css", "./navigation332.js", "./navigation332.css", "./schlaflabor340.js", "./schlaflabor340.css", "./schlafimport341.js", "./schlafimport341.css", "./gehttest342.js", "./gehttest342.css", "./wertehilfe342.js", "./metrics340.js", "./metrics340.css", "./insurance325.js", "./insurance325.css", "./diffusion324.js", "./diffusion324.css", "./dlco326.js", "./dlco326.css", "./stairs-shortcuts.js", "./stairs-shortcuts.css", "./KURZBEFEHLE_ANLEITUNG.html", "./", "./index.html", "./styles.css", "./content.js", "./app.js", "./antraege-data.js", "./antraege.js", "./meine-daten.js", "./lungenprofil.js", "./befundscan-parser.js", "./befund18-parser.js", "./befundscan.js", "./foto19.js", "./viewport192.js", "./suite15.js", "./region16.js", "./secure17.js", "./calendar17.js", "./nucala282.js", "./assessment29.js", "./assessment29.css", "./versorgung30.js", "./versorgung30.css", "./labor18.js", "./laborvergleich303.js", "./offline303.js", "./hub20.js", "./scanner20.js", "./pdf20.js", "./jszip.min.js", "./vital29.js", "./vital-rescue291.js", "./vital29.css", "./epef21.js", "./lufu23.js", "./medplan24.js", "./gdb24.js", "./au25.js", "./stats25.js", "./statsplus292.js", "./statsprint296.js", "./statsplus292.css", "./weight292.js", "./medpref25.js", "./hilfsmittel251.js", "./version.json", "./manifest.webmanifest", "./icon.svg", "./design26.css", "./design26.js", "./logo-192.png", "./logo-512.png", "./logo-home-v270.png", "./professional27.js", "./professional27.css", "./quality28.js", "./quality28.css", "./branding281.css", "./logo-192-v281.png", "./logo-512-v281.png", "./logo-home-v281.png", "./brand-wordmark-v281.png", "./rechtsmonitor.js", "./rechtsmonitor.css", "./arbeit31.css", "./physiosport298.js", "./leistungen32.css", "./arbeit31.js", "./leistungen32.js"];
 $('offline303-check').addEventListener('click',async()=>{
  const p=$('offline303-result');p.textContent='Lokale App-Dateien werden geprüft …';
  try{
   if(!('caches' in window)||!('serviceWorker' in navigator)){p.textContent='Offline-Cache wird von diesem Browser nicht vollständig unterstützt.';return;}
   if(!navigator.serviceWorker.controller){p.textContent='Die App wird noch nicht vom Offline-Dienst gesteuert. Bitte einmal bei bestehender Internetverbindung neu öffnen und erneut prüfen.';return;}
   // Den Cache der aktuell laufenden App suchen, nicht einen historischen Versionsnamen.
   const versions=await caches.keys();
   const current=String(window.ASTHMA_APP_VERSION||'').trim();
   const active=versions.filter(v=>current&&v.startsWith('asthma-static-'+current+'-'));
   if(!active.length){p.textContent='Für die laufende Version '+(current||'(unbekannt)')+' ist noch kein passender Offline-Cache aktiv. App online aktualisieren und erneut prüfen.';return;}
   const appCache=await caches.open(active[active.length-1]);
   const base=new URL('./',location.href);
   const results=await Promise.all(assets.map(async a=>({name:a,present:!!(await appCache.match(new URL(a,base),{ignoreSearch:true}))})));
   const missing=results.filter(x=>!x.present).map(x=>x.name);
   p.textContent=missing.length?'Es fehlen '+missing.length+' von '+assets.length+' Offline-Dateien: '+missing.slice(0,8).join(', ')+(missing.length>8?' und weitere.':'.')+' Bitte die App online aktualisieren und erneut prüfen.':
    'Alle '+results.length+' geprüften Kern-Dateien liegen im App-Cache. Bitte zusätzlich den Flugmodus-Test machen.';
  }catch(e){p.textContent='Prüfung fehlgeschlagen: '+e.message;}
 });
})();
