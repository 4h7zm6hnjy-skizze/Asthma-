/* Bei jeder inhaltlichen Änderung: CACHE_VERSION ändern. */
const VERSION='2.8.1-medikamentenratgeber-1';
const CACHE=`asthma-static-${VERSION}`;
const ASSETS=["./","./index.html","./styles.css","./content.js","./app.js","./antraege-data.js","./antraege.js","./meine-daten.js","./lungenprofil.js","./befundscan-parser.js","./befund18-parser.js","./befundscan.js","./foto19.js","./viewport192.js","./suite15.js","./region16.js","./secure17.js","./calendar17.js","./labor18.js","./hub20.js","./scanner20.js","./pdf20.js","./jszip.min.js","./epef21.js","./lufu23.js","./medplan24.js","./gdb24.js","./au25.js","./stats25.js","./medpref25.js","./hilfsmittel251.js","./version.json","./manifest.webmanifest","./icon.svg","./design26.css","./design26.js","./logo-192.png","./logo-512.png","./logo-home-v270.png","./professional27.js","./professional27.css","./quality28.js","./quality28.css","./branding281.css","./logo-192-v281.png","./logo-512-v281.png","./logo-home-v281.png","./brand-wordmark-v281.png"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('asthma-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  const path=new URL(event.request.url).pathname;
  if(path.endsWith('/version.json')) {event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
  if(event.request.mode==='navigate') {event.respondWith(fetch(event.request).then(r=>{if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',clone));}return r;}).catch(()=>caches.match('./index.html')));return;}
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(r=>{if(r.ok){const clone=r.clone();caches.open(CACHE).then(c=>c.put(event.request,clone));}return r;})));
});
