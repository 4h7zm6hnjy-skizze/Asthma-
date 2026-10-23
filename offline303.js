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
 const assets=['index.html','secure17.js','labor18.js','laborvergleich303.js','offline303.js','statsplus292.js','stats25.js','statsprint296.js','lufu23.js','epef21.js','styles.css','statsplus292.css'];
 $('offline303-check').addEventListener('click',async()=>{
  const p=$('offline303-result');p.textContent='Lokale App-Dateien werden geprüft …';
  try{
   if(!('caches' in window)||!('serviceWorker' in navigator)){p.textContent='Offline-Cache wird von diesem Browser nicht vollständig unterstützt.';return;}
   const results=await Promise.all(assets.map(async a=>({name:a,present:!!(await caches.match(new URL(a,location.href),{ignoreSearch:true}))})));
   const missing=results.filter(x=>!x.present).map(x=>x.name);
   p.textContent=missing.length?'Es fehlen '+missing.length+' Offline-Dateien: '+missing.join(', ')+'. Bitte die App online aktualisieren und erneut prüfen.':
    'Alle '+results.length+' geprüften Kern-Dateien liegen im App-Cache. Bitte zusätzlich den Flugmodus-Test machen.';
  }catch(e){p.textContent='Prüfung fehlgeschlagen: '+e.message;}
 });
})();
