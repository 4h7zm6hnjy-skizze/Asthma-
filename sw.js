/* Asthma 3.3.0: neuer Offline-Cache bei Navigation-Update, Gesundheitsdaten unangetastet. */
const VERSION='3.4.6-pneumopro-cumulative';
const CACHE=`asthma-static-${VERSION}`;
const ASSETS=[
 './bpampel344.js','./bpampel344.css','./lungenkrankheiten344.js','./lungenkrankheiten344.css',
 './dicom343.js','./bildgebung343.js','./bildgebung343.css','./behandler343.js','./behandler343.css','./dateien331.js','./dateien331.css','./navigation332.js','./navigation332.css','./schlaflabor340.js','./schlaflabor340.css','./schlafimport341.js','./schlafimport341.css','./gehttest342.js','./gehttest342.css','./wertehilfe342.js','./metrics340.js','./metrics340.css',
 './insurance325.js','./insurance325.css',
 './diffusion324.js','./diffusion324.css','./dlco326.js','./dlco326.css',
 './stairs-shortcuts.js','./stairs-shortcuts.css','./KURZBEFEHLE_ANLEITUNG.html',
 './','./index.html','./styles.css','./content.js','./app.js','./antraege-data.js','./antraege.js',
 './meine-daten.js','./lungenprofil.js','./befundscan-parser.js','./befund18-parser.js','./befundscan.js',
 './foto19.js','./viewport192.js','./suite15.js','./region16.js','./secure17.js','./calendar17.js',
 './nucala282.js','./assessment29.js','./assessment29.css','./versorgung30.js','./versorgung30.css',
 './labor18.js','./laborvergleich303.js','./offline303.js','./hub20.js','./scanner20.js','./pdf20.js','./jszip.min.js','./vital29.js',
 './vital-rescue291.js','./vital29.css','./epef21.js','./lufu23.js','./medplan24.js','./gdb24.js',
 './au25.js','./stats25.js','./statsplus292.js','./statsprint296.js','./statsplus292.css',
 './weight292.js','./medpref25.js','./hilfsmittel251.js','./version.json','./manifest.webmanifest',
 './icon.svg','./design26.css','./design26.js','./logo-192.png','./logo-512.png',
 './logo-home-v270.png','./professional27.js','./professional27.css','./quality28.js',
 './quality28.css','./branding281.css','./logo-192-v281.png','./logo-512-v281.png',
 './logo-home-v281.png','./brand-wordmark-v281.png','./rechtsmonitor.js','./rechtsmonitor.css',
 './arbeit31.css','./physiosport298.js','./leistungen32.css','./arbeit31.js','./leistungen32.js'
];
self.addEventListener('install',ev=>ev.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',ev=>ev.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('asthma-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 const path=new URL(event.request.url).pathname;
 if(path.endsWith('/version.json')||path.endsWith('/rechtsmonitor-feed.json')){
  event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match(event.request,{ignoreSearch:true})));return;
 }
 const important=['/bpampel344.js','/bpampel344.css','/lungenkrankheiten344.js','/lungenkrankheiten344.css','/vital29.js','/metrics340.js','/statsplus292.js','/dicom343.js','/bildgebung343.js','/bildgebung343.css','/behandler343.js','/behandler343.css','/gehttest342.js','/gehttest342.css','/schlaflabor340.js','/schlaflabor340.css','/schlafimport341.js','/schlafimport341.css','/wertehilfe342.js','/metrics340.js','/metrics340.css','/navigation332.js','/navigation332.css','/dateien331.js','/dateien331.css','/insurance325.js','/insurance325.css','/diffusion324.js','/diffusion324.css','/dlco326.js','/dlco326.css','/stairs-shortcuts.js','/stairs-shortcuts.css','/secure17.js','/vital29.js','/vital-rescue291.js','/app.js','/design26.js',
  '/quality28.js','/quality28.css','/suite15.js','/calendar17.js','/styles.css','/stats25.js','/statsprint296.js',
  '/statsplus292.js','/labor18.js','/lufu23.js','/laborvergleich303.js','/offline303.js','/befundscan.js','/befund18-parser.js'];
 if(important.some(s=>path.endsWith(s))){
  event.respondWith(fetch(event.request,{cache:'no-store'}).then(r=>{
   if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(event.request,clone)).catch(()=>{})}
   return r;
  }).catch(()=>caches.match(event.request).then(r=>r||caches.match(event.request,{ignoreSearch:true}))));return;
 }
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(r=>{
   if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',clone)).catch(()=>{})}
   return r;
  }).catch(()=>caches.match('./index.html')));return;
 }
 // Dynamic modules are requested with ?v=VERSION, while install precaches them
 // without a query. When offline, retry the already installed, same-version asset
 // ignoring ONLY the query string. The installed cache remains version-scoped.
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(r=>{
  if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(event.request,clone)).catch(()=>{})}return r;
 }).catch(()=>caches.open(CACHE).then(c=>c.match(event.request,{ignoreSearch:true})))));
});
