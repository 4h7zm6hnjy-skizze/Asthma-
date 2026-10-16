'use strict';
/* Asthma 1.7.0 – Passwortgeschützter lokaler Tresor. Keine Netzwerkanfragen.
   Keine Klartext-Synchronisation. Sicherheit setzt vertrauenswürdiges Gerät und
   unveränderte App-Dateien voraus. */
(()=>{
  const dbName='asthma-secure-17';
  const encoder=new TextEncoder(),decoder=new TextDecoder();
  const $=id=>document.getElementById(id);
  let db,key=null,profile={},busy=false,unlocked=false;const pendingWrites=new Map();
  const b64=bytes=>{let str='';for(let i=0;i<bytes.length;i+=8192)str+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(str)};
  const un64=str=>Uint8Array.from(atob(str),c=>c.charCodeAt(0));
  const req=p=>new Promise((resolve,reject)=>{p.onsuccess=()=>resolve(p.result);p.onerror=()=>reject(p.error)});
  const txComplete=t=>new Promise((resolve,reject)=>{t.oncomplete=resolve;t.onerror=()=>reject(t.error||Error('Datenbankfehler'));t.onabort=()=>reject(t.error||Error('Speichern abgebrochen'))});
  function dbOpen(){return new Promise((resolve,reject)=>{const r=indexedDB.open(dbName,1);r.onupgradeneeded=()=>{const d=r.result;d.createObjectStore('items',{keyPath:'id'});d.createObjectStore('meta',{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Bitte andere Tabs mit Asthma schließen'))})}
  async function getMeta(){return req(db.transaction('meta').objectStore('meta').get('main'))}
  async function orphanRows(){const rows=await req(db.transaction('items').objectStore('items').count());return rows>0&&!await getMeta()}
  async function derive(pass,salt){const material=await crypto.subtle.importKey('raw',encoder.encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:450000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
  async function sealed(id,obj,withKey=key){const iv=crypto.getRandomValues(new Uint8Array(12));const plain=encoder.encode(JSON.stringify(obj));const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(id)},withKey,plain);return {id,iv:b64(iv),cipher:b64(new Uint8Array(cipher))};}
  async function unseal(row,withKey=key){const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(row.iv),additionalData:encoder.encode(row.id)},withKey,un64(row.cipher));return JSON.parse(decoder.decode(data))}
  const requireUnlock=()=>{if(!unlocked||!key)throw Error('Die Gesundheitsakte ist gesperrt.')};
  async function rawAll(){requireUnlock();return req(db.transaction('items').objectStore('items').getAll())}
  async function find(group){requireUnlock();const rows=(await rawAll()).filter(r=>r.id.startsWith(group+'/'));const output=[];for(const row of rows)output.push(await decodeRecord(await unseal(row)));return output}
  async function findOne(group,id){requireUnlock();const row=await req(db.transaction('items').objectStore('items').get(group+'/'+id));return row?await decodeRecord(await unseal(row)):null}
  async function toStorage(v){if(v instanceof Blob){return {$kind:'blob',mime:v.type,data:b64(new Uint8Array(await v.arrayBuffer()))}}if(Array.isArray(v))return Promise.all(v.map(toStorage));if(v&&typeof v==='object'){const entries=await Promise.all(Object.entries(v).map(async([k,value])=>[k,await toStorage(value)]));return Object.fromEntries(entries)}return v}
  async function decodeRecord(v){if(Array.isArray(v))return Promise.all(v.map(decodeRecord));if(v&&typeof v==='object'){if(v.$kind==='blob')return new Blob([un64(v.data)],{type:v.mime||'application/octet-stream'});const entries=await Promise.all(Object.entries(v).map(async([k,value])=>[k,await decodeRecord(value)]));return Object.fromEntries(entries)}return v}
  async function queued(name,job){const preceding=pendingWrites.get(name)||Promise.resolve();const task=preceding.catch(()=>{}).then(job);pendingWrites.set(name,task);try{return await task}finally{if(pendingWrites.get(name)===task)pendingWrites.delete(name)}}
  async function pending(){await Promise.all([...pendingWrites.values()])}
  async function put(group,obj,id=obj?.id||obj?.key){requireUnlock();if(typeof id!=='string'||!id)throw Error('Datensatz-ID fehlt');return queued(group+'/'+id,async()=>{const row=await sealed(group+'/'+id,await toStorage(obj));const t=db.transaction('items','readwrite'),done=txComplete(t);t.objectStore('items').put(row);await done;window.dispatchEvent(new CustomEvent('asthma:secure-change',{detail:{group}}));return obj})}
  async function remove(group,id){requireUnlock();return queued(group+'/'+id,async()=>{const t=db.transaction('items','readwrite'),done=txComplete(t);t.objectStore('items').delete(group+'/'+id);await done;window.dispatchEvent(new CustomEvent('asthma:secure-change',{detail:{group}}))})}
  async function batchReplace(groups){requireUnlock();await pending();const prepared=[],selected=Object.keys(groups);for(const [group,objs] of Object.entries(groups)){if(!['profile','cases','documents','diary','suite','calendar','labs','epef'].includes(group)||!Array.isArray(objs))throw Error('Unbekannte Datengruppe');for(const o of objs){const id=o.id||o.key;if(!id||typeof id!=='string')throw Error('Ungültige Daten-ID');prepared.push(await sealed(group+'/'+id,await toStorage(o)))}}
    const existing=(await rawAll()).filter(x=>selected.some(g=>x.id.startsWith(g+'/')));
    const t=db.transaction('items','readwrite'),done=txComplete(t),store=t.objectStore('items');existing.forEach(x=>store.delete(x.id));prepared.forEach(r=>store.put(r));await done;
    if(selected.includes('profile'))await initProfile();for(const group of selected)window.dispatchEvent(new CustomEvent('asthma:secure-change',{detail:{group}}));
  }
  async function replace(group,objs){return batchReplace({[group]:objs})}
  async function profileSave(p){profile={...p};await put('profile',{id:'current',value:profile})}
  const profileGet=()=>({...profile});
  async function initProfile(){const value=await findOne('profile','current');profile=value?.value||{};}
  const updateProfile=async patch=>profileSave({...profile,...patch});
  const profileClear=async()=>{profile={};await remove('profile','current')};
  async function getLegacyDB(name,stores){return new Promise(resolve=>{let created=false;const r=indexedDB.open(name);r.onupgradeneeded=()=>{created=true};r.onerror=()=>resolve({});r.onsuccess=async()=>{const old=r.result;const result={};try{if(!created){for(const name of stores){if(old.objectStoreNames.contains(name)){const t=old.transaction(name,'readonly');result[name]=await req(t.objectStore(name).getAll());}}}}catch(e){result._error=e.message}old.close();resolve(result)}})}
  async function decipherSuite(row,meta,oldPass){if(!row.cipher)return row.value;if(!meta||!oldPass)throw Error('Für die alte verschlüsselte Zusatzakte wird das bisherige Tresor-Passwort benötigt.');const oldKey=await crypto.subtle.importKey('raw',encoder.encode(oldPass),'PBKDF2',false,['deriveKey']);const derived=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',iterations:310000,salt:un64(meta.salt)},oldKey,{name:'AES-GCM',length:256},false,['decrypt']);try{const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(row.iv)},derived,un64(row.cipher));return JSON.parse(decoder.decode(clear))}catch{throw Error('Altes Tresor-Passwort falsch oder alter Datensatz beschädigt.')}}
  async function migrationBundle(oldPass){const legacyProfile=localStorage.getItem('asthma-v1-preferences')||localStorage.getItem('asthmakompass-v1-preferences');let profileObj={};if(legacyProfile){try{profileObj=JSON.parse(legacyProfile)}catch{throw Error('Das alte Profil ist beschädigt. Keine Daten wurden gelöscht.')}}
    const local=await getLegacyDB('asthma-local-1',['cases','documents','diary']);if(local._error)throw Error(local._error);
    const suite=await getLegacyDB('asthma-suite-1',['rows','meta']);if(suite._error)throw Error(suite._error);
    const suiteMeta=(suite.meta||[]).find(x=>x.key==='vault');const converted=[];
    for(const row of suite.rows||[]){const value=await decipherSuite(row,suiteMeta,oldPass);converted.push({key:row.key,type:row.type,value});}
    const records=[{group:'profile',o:{id:'current',value:profileObj}},...['cases','documents','diary'].flatMap(g=>(local[g]||[]).map(o=>({group:g,o}))),...converted.map(o=>({group:'suite',o}))];
    return {records,stats:{profile:Boolean(legacyProfile),cases:(local.cases||[]).length,documents:(local.documents||[]).length,diary:(local.diary||[]).length,suite:converted.length}};
  }
  async function eraseLegacy(){for(const name of ['asthma-v1-preferences','asthmakompass-v1-preferences'])localStorage.removeItem(name);
    for(const name of ['asthma-local-1','asthma-suite-1']){
      await new Promise((resolve,reject)=>{const r=indexedDB.deleteDatabase(name);r.onsuccess=resolve;r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Alte Datenbank wird von einem anderen Tab verwendet. Andere Tabs schließen.'))});
    }
  }
  async function restoreFresh(pass,backupFile,backupPass){
    if(await getMeta())throw Error('Ein Tresor ist hier bereits vorhanden. Bitte regulär entsperren.');
    const oldRowCount=await req(db.transaction('items').objectStore('items').count());if(oldRowCount)throw Error('Es wurden bereits verschlüsselte Daten gefunden. Zum Schutz dieser Daten ist eine neue Wiederherstellung hier gesperrt.');
    if(await orphanRows())throw Error('Verschlüsselte Datensätze ohne Tresor-Metadaten gefunden. Es wird nichts überschrieben. Bitte Datensicherung und Browserinstallation prüfen.');
    if(pass.length<12)throw Error('Neues Tresor-Passwort mindestens 12 Zeichen');
    if(!backupFile||backupFile.size>80*1024*1024)throw Error('Backup-Datei fehlt oder ist zu groß (max. 80 MB)');
    let archive;try{archive=JSON.parse(await backupFile.text())}catch{throw Error('Backup-Datei ist kein gültiges JSON')}
    if(archive?.kind!=='Asthma-v17-Vault'||!archive.salt||!archive.data)throw Error('Nur vollständige .asthma17-Sicherungen werden unterstützt');
    const oldKey=await derive(backupPass,un64(archive.salt));let original;
    try{original=await unseal(archive.data,oldKey)}catch{throw Error('Backup-Passwort falsch oder Sicherung beschädigt')}
    if(original?.app!=='Asthma'||original?.schema!==17||!Array.isArray(original.rows)||original.rows.length>100000)throw Error('Ungültiger Backup-Inhalt');
    const seen=new Set(),items=[];
    for(const r of original.rows){if(!r||typeof r.id!=='string'||!/^(profile|cases|documents|diary|suite|calendar|labs|epef|au)\/[\w.\-\/]+$/.test(r.id)||seen.has(r.id))throw Error('Ungültige oder doppelte Datensatz-ID');seen.add(r.id);items.push(r)}
    const salt=crypto.getRandomValues(new Uint8Array(16)),newKey=await derive(pass,salt),rows=[];
    for(const item of items)rows.push(await sealed(item.id,item.value,newKey));
    const verify=await sealed('verifier',{ok:'asthma-v17'},newKey);
    if(await getMeta())throw Error('Tresor wurde während der Wiederherstellung eingerichtet. Abbruch.');
    const t=db.transaction(['items','meta'],'readwrite'),done=txComplete(t);for(const row of rows)t.objectStore('items').put(row);t.objectStore('meta').put({id:'main',salt:b64(salt),verify,version:17});await done;
    key=newKey;unlocked=true;await initProfile();const restored=await rawAll();if(restored.length!==rows.length)throw Error('Wiederherstellung prüfen: Anzahl der Datensätze stimmt nicht');for(const r of restored)await unseal(r);
    return rows.length;
  }
  async function create(pass,oldPass){if(pass.length<12)throw Error('Passwort mindestens 12 Zeichen');const old=await getMeta();if(old)throw Error('Tresor existiert bereits');if(await orphanRows())throw Error('Vorhandene verschlüsselte Datensätze ohne Tresor-Metadaten gefunden. Keine neue Einrichtung möglich; Datensicherung und Originalinstallation prüfen.');const bundle=await migrationBundle(oldPass);const salt=crypto.getRandomValues(new Uint8Array(16)),newKey=await derive(pass,salt);
    const rows=[];for(const {group,o} of bundle.records){const id=o.id||o.key;rows.push(await sealed(group+'/'+id,await toStorage(o),newKey))}
    const verify=await sealed('verifier', {ok:'asthma-v17'},newKey);
    const t=db.transaction(['items','meta'],'readwrite'),done=txComplete(t);for(const row of rows)t.objectStore('items').put(row);t.objectStore('meta').put({id:'main',salt:b64(salt),verify,version:17});await done;
    key=newKey;unlocked=true;await initProfile();
    const verified=await rawAll();if(verified.length!==rows.length)throw Error('Migration unvollständig: Datensatzanzahl stimmt nicht. Alte Daten bleiben erhalten.');for(const row of verified)await unseal(row);
    // Best effort: browser guarantees logical removal, not forensic media erasure.
    try{await eraseLegacy();return{...bundle.stats,cleanup:true}}catch(e){return{...bundle.stats,cleanup:false,cleanupError:e.message}}
  }
  async function unlock(pass){const meta=await getMeta();if(!meta)throw Error('Tresor noch nicht eingerichtet');const candidate=await derive(pass,un64(meta.salt));let verify;try{verify=await unseal(meta.verify,candidate)}catch{throw Error('Passwort falsch oder Tresor beschädigt')}if(verify.ok!=='asthma-v17')throw Error('Tresor-Daten fehlerhaft');key=candidate;unlocked=true;await initProfile();return true;}
  async function changePassword(next){requireUnlock();await pending();if(next.length<12)throw Error('Mindestens 12 Zeichen');const salt=crypto.getRandomValues(new Uint8Array(16)),newKey=await derive(next,salt);const original=await rawAll(),result=[];for(const row of original)result.push(await sealed(row.id,await unseal(row),newKey));const verify=await sealed('verifier',{ok:'asthma-v17'},newKey);const t=db.transaction(['items','meta'],'readwrite'),done=txComplete(t);result.forEach(r=>t.objectStore('items').put(r));t.objectStore('meta').put({id:'main',salt:b64(salt),verify,version:17});await done;key=newKey;return true;}
  function lock(){const app=$('secure-application');if(app){app.hidden=true;app.inert=true}pending().catch(()=>{}).finally(()=>{unlocked=false;key=null;profile={};location.reload()})}
  const state=()=>({unlocked,encrypted:unlocked,local:true});
  // Backups are encrypted with same account password by re-encrypting the whole vault archive.
  async function exportVault(pass){requireUnlock();await pending();if(pass.length<12)throw Error('Backup-Passwort mindestens 12 Zeichen');const rows=await rawAll(),salt=crypto.getRandomValues(new Uint8Array(16)),backupKey=await derive(pass,salt),plain=[];for(const row of rows)plain.push({id:row.id,value:await unseal(row)});const envelope=await sealed('archive',{app:'Asthma',schema:17,rows:plain},backupKey);return {kind:'Asthma-v17-Vault',salt:b64(salt),data:envelope};}
  async function importVault(archive,pass){requireUnlock();await pending();if(archive?.kind!=='Asthma-v17-Vault'||!archive.salt||!archive.data)throw Error('Unbekanntes Sicherungsformat');const temp=await derive(pass,un64(archive.salt));let data;try{data=await unseal(archive.data,temp)}catch{throw Error('Passwort falsch / Backup beschädigt')}if(data?.app!=='Asthma'||data?.schema!==17||!Array.isArray(data.rows)||data.rows.length>100000)throw Error('Ungültiger Sicherungsinhalt');const ids=new Set();const prepared=[];for(const v of data.rows){if(!v||typeof v.id!=='string'||!/^(profile|cases|documents|diary|suite|calendar|labs|epef|au)\/[\w.\-\/]+$/.test(v.id)||ids.has(v.id))throw Error('Ungültiger oder doppelter Eintrag');ids.add(v.id);prepared.push(await sealed(v.id,v.value));}const existing=await rawAll();const t=db.transaction('items','readwrite'),done=txComplete(t);const s=t.objectStore('items');existing.forEach(r=>s.delete(r.id));prepared.forEach(r=>s.put(r));await done;await initProfile();location.reload();}
  const API={list:find,get:findOne,put,del:remove,replace,batchReplace,profileGet,profileSave,updateProfile,profileClear,state,lock,changePassword,exportVault,importVault};
  window.ASTHMA_SECURITY=API;
  const scripts=['content.js','app.js','antraege-data.js','antraege.js','meine-daten.js','lungenprofil.js','befundscan-parser.js','befund18-parser.js','befundscan.js','foto19.js','suite15.js','region16.js','calendar17.js','labor18.js','hub20.js','scanner20.js','pdf20.js','jszip.min.js','epef21.js','lufu23.js','medplan24.js','gdb24.js','au25.js','stats25.js','medpref25.js','hilfsmittel251.js','design26.js','professional27.js'];
  async function startApp(){const app=$('secure-application');app.hidden=false;app.inert=false;$('secure-gate').hidden=true;for(const src of scripts){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error(src+' konnte nicht geladen werden'));document.body.append(s)})}document.documentElement.classList.add('app-unlocked');bindBackupAndLock();if(window.__asthmaCleanupWarning){alert(window.__asthmaCleanupWarning+' Bitte unter Einstellungen → Alte Speicherreste bereinigen.');window.ASTHMA_NAV?.go('einstellungen')}let last=Date.now();const touch=()=>{last=Date.now()};['pointerdown','keydown','touchstart','scroll'].forEach(ev=>document.addEventListener(ev,touch,{passive:true}));window.setInterval(()=>{if(unlocked&&Date.now()-last>10*60*1000)lock()},60*1000);let hiddenAt=null;document.addEventListener('visibilitychange',()=>{if(document.hidden){hiddenAt=Date.now()}else if(hiddenAt!==null){const elapsed=Date.now()-hiddenAt;hiddenAt=null;if(elapsed>2*60*1000&&unlocked)lock()}});}
  function bindBackupAndLock(){
    const status=$('secure-backup-status');if(window.__asthmaCleanupWarning){status.textContent=window.__asthmaCleanupWarning;status.classList.add('suite-error')}const cleanup=$('secure-cleanup');if(cleanup)cleanup.addEventListener('click',async()=>{if(!confirm('Alte lokale Datenbankreste nach Prüfung der neuen Tresor-Daten löschen?'))return;try{await eraseLegacy();status.textContent='Alte Speicherbereiche logisch gelöscht.'}catch(e){status.textContent='Bereinigung fehlgeschlagen: '+e.message}});
    $('secure-export-form').addEventListener('submit',async e=>{e.preventDefault();try{status.textContent='Verschlüsselte Sicherung wird erstellt …';const pass=$('secure-export-pass').value;const packageData=await exportVault(pass);const blob=new Blob([JSON.stringify(packageData)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Asthma_AlleDaten_'+new Date().toISOString().slice(0,10)+'.asthma17';a.click();setTimeout(()=>URL.revokeObjectURL(url),20000);$('secure-export-form').reset();status.textContent='Vollständige, passwortverschlüsselte Datei erstellt. Sicher aufbewahren.';}catch(err){status.textContent='Sicherung fehlgeschlagen: '+err.message}});
    $('secure-import-form').addEventListener('submit',async e=>{e.preventDefault();try{const f=$('secure-import-file').files?.[0];if(!f||f.size>80*1024*1024)throw Error('Datei fehlt oder über 80 MB');const pack=JSON.parse(await f.text());if(!confirm('Vollständige Wiederherstellung: Alle jetzigen Tresor-Daten werden ersetzt. Vorher Backup erstellen?'))return;status.textContent='Sicherung wird validiert …';await importVault(pack,$('secure-import-pass').value)}catch(err){status.textContent='Wiederherstellung fehlgeschlagen: '+err.message}});
  }

  // 2.4.1: Authentication and new-vault creation are separate, explicit actions.
  // A password is never interpreted as permission to create a replacement vault.
  let gateMode='login';
  function setGateMode(mode,hasVault){
    gateMode=mode;
    const login=mode==='login',create=!login;
    $('secure-login-choice').classList.toggle('active',login);
    $('secure-create-choice').classList.toggle('active',create);
    $('secure-login-choice').setAttribute('aria-pressed',String(login));
    $('secure-create-choice').setAttribute('aria-pressed',String(create));
    $('secure-login-info').hidden=!login;
    $('secure-repeat-wrap').hidden=login;
    $('secure-old-wrap').hidden=login;
    $('secure-create-warning').hidden=login;
    $('secure-password-label').textContent=login?'Dein vorhandenes Passwort':'Neues Passwort (mindestens 12 Zeichen)';
    $('secure-password').minLength=login?1:12;
    $('secure-password').setAttribute('autocomplete',login?'current-password':'new-password');
    $('secure-repeat').required=create;
    $('secure-submit').textContent=login?'Mit Passwort anmelden':'Neuen Tresor einrichten';
    $('secure-intro').textContent=login?
      (hasVault?'Bitte dein vorhandenes Passwort eingeben.':'Melde dich mit deinem vorhandenen Passwort an. Falls dieser Browser deinen alten Tresor nicht findet, erhältst du sichere Wiederherstellungshinweise.'):
      'Neuen Tresor nur einrichten, wenn du noch keinen hast. Alte Tresore in anderen Safari-/App-Installationen sind dadurch nicht zugänglich.';
    $('secure-error').textContent='';
    $('secure-password').value='';
    $('secure-repeat').value='';
    $('secure-old').value='';
  }
  async function ready(){
    try{
      if(!crypto?.subtle)throw Error('Verschlüsselung wird in diesem Browser nicht unterstützt');
      db=await dbOpen();
      const existing=await getMeta(),orphaned=!existing&&await orphanRows();
      $('secure-gate').hidden=false;
      $('secure-recovery-note').hidden=Boolean(existing);
      $('secure-create-choice').disabled=Boolean(existing)||orphaned;
      $('secure-entry-choice').hidden=Boolean(existing);
      setGateMode('login',Boolean(existing));
      if(orphaned){
        $('secure-error').textContent='Verschlüsselte Datensätze ohne Entsperrmetadaten gefunden. Kein neuer Tresor möglich. Bitte Browserinstallation oder Sicherung prüfen.';
        $('secure-restore-submit').disabled=true;
      }
      $('secure-login-choice').addEventListener('click',()=>setGateMode('login',Boolean(existing)));
      $('secure-create-choice').addEventListener('click',()=>{
        if(existing||orphaned)return;
        setGateMode('create',false);
      });
      $('secure-restore-form').addEventListener('submit',async e=>{
        e.preventDefault();if(busy)return;busy=true;
        const button=$('secure-restore-submit');button.disabled=true;
        $('secure-error').textContent='Verschlüsseltes Backup wird geprüft …';
        try{
          if(await getMeta())throw Error('Hier ist bereits ein Tresor vorhanden; bitte regulär anmelden.');
          const pass=$('secure-restore-new-password').value;
          if(pass!==$('secure-restore-new-repeat').value)throw Error('Die beiden neuen Passwörter stimmen nicht überein.');
          const count=await restoreFresh(pass,$('secure-restore-file').files?.[0],$('secure-restore-pass').value);
          $('secure-error').textContent=count+' Datensätze aus Backup wiederhergestellt.';
          await startApp();
        }catch(err){$('secure-error').textContent='Wiederherstellung fehlgeschlagen: '+(err.message||err)}
        finally{busy=false;button.disabled=false;}
      });
      $('secure-form').addEventListener('submit',async e=>{
        e.preventDefault();if(busy)return;busy=true;
        const button=$('secure-submit');button.disabled=true;
        $('secure-error').textContent='Lokalen Tresor wird geprüft …';
        try{
          const pass=$('secure-password').value;
          const meta=await getMeta(); // never rely on a stale detection from first page load
          if(gateMode==='login'){
            if(!meta){
              $('secure-recovery-note').hidden=false;
              throw Error('Dein bisheriger Tresor ist in dieser Browser-Installation nicht vorhanden. Dein Passwort ist nicht falsch – es kann hier nicht überprüft werden. Bitte die zuvor verwendete Safari-/Home-Bildschirm-App öffnen oder unten eine verschlüsselte Sicherung wiederherstellen. Es wurde nichts verändert.');
            }
            await unlock(pass);
          }else{
            if(meta)throw Error('Hier existiert bereits ein Tresor. Bitte mit dem bestehenden Passwort anmelden.');
            if(await orphanRows())throw Error('Verschlüsselte Datensätze gefunden. Aus Sicherheitsgründen wird kein neuer Tresor erstellt.');
            if(pass!==$('secure-repeat').value)throw Error('Passwörter stimmen nicht überein');
            if(!confirm('Neuen Tresor einrichten? Falls du früher Daten in einer anderen Safari-/Home-Bildschirm-Installation hattest, werden diese NICHT automatisch übernommen. Nur fortfahren, wenn du das geprüft hast.'))return;
            const outcome=await create(pass,$('secure-old').value);
            if(!outcome.cleanup){window.__asthmaCleanupWarning='Alte unverschlüsselte Speicherreste konnten nicht vollständig entfernt werden: '+outcome.cleanupError+'. Bitte alle älteren App-Tabs schließen.';}
          }
          $('secure-form').reset();await startApp();
        }catch(err){$('secure-error').textContent=err.message||'Anmeldung nicht möglich';}
        finally{busy=false;button.disabled=false;}
      });
    }catch(e){$('secure-gate').hidden=false;$('secure-error').textContent='Sicherer Speicher nicht verfügbar: '+e.message;$('secure-submit').disabled=true;}
  }
  ready();
})();
