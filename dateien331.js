'use strict';
/* Asthma 3.3.1 – zentrale, lokale Dateiablage und Kameraerfassung.
   Kein HTTP-Upload; Befundbilder werden nicht automatisch als Laborwerte interpretiert. */
(()=>{
  const SEC=window.ASTHMA_SECURITY;
  const NAV=window.ASTHMA_NAV;
  const home=document.getElementById('start');
  if(!SEC||!NAV||!home||document.getElementById('dateien'))return;
  const $=id=>document.getElementById(id);
  const kinds={
    lunge:{title:'Lungenfunktion',docKind:'Lungenfunktionstest',hint:'JSON-Dateien mit Messwerten werden in die bestehende Lungenfunktion übernommen. Fotos und PDFs bleiben als Originalbefund erhalten.'},
    labor:{title:'Labor',docKind:'Bluttest',hint:'Labor-JSON wird in der bestehenden Laborakte zur Kontrolle geöffnet. Fotos und PDFs werden als Originalbefund gespeichert.'},
    arzt:{title:'Arztbriefe',docKind:'Arztbrief',hint:'Arztbrief fotografieren oder PDF auswählen. Der Originalbericht wird verschlüsselt gespeichert.'},
    entlassung:{title:'Entlassungsberichte',docKind:'Entlassungsbericht',hint:'Entlassungsbericht fotografieren oder PDF auswählen. Das Original wird verschlüsselt gespeichert.'},
    sonstiges:{title:'Sonstige Befunde',docKind:'Sonstiges',hint:'Weitere medizinische Dokumente als Foto oder PDF verschlüsselt ablegen.'}
  };
  const page=document.createElement('section');
  page.id='dateien'; page.className='panel new-page';page.dataset.navPage='dateien';page.hidden=true;
  page.innerHTML=`
    <div class="section-heading"><div><p class="section-kicker">Privater Gesundheitsbereich</p><h2>Dateien & Scannen</h2><p>Alle neuen Befunde an einem Ort hochladen.</p></div><span class="shield">Lokal verschlüsselt</span></div>
    <div class="dh331-wrap">
      <h3>Was möchtest du hochladen?</h3>
      <div class="dh331-categories" role="group" aria-label="Art des Dokuments">
        <button type="button" data-dh-kind="lunge" aria-pressed="true"><span aria-hidden="true">◷</span>Lungenfunktion</button>
        <button type="button" data-dh-kind="labor" aria-pressed="false"><span aria-hidden="true">◈</span>Labor</button>
        <button type="button" data-dh-kind="arzt" aria-pressed="false"><span aria-hidden="true">▤</span>Arztbriefe</button>
        <button type="button" data-dh-kind="entlassung" aria-pressed="false"><span aria-hidden="true">▣</span>Entlassungsberichte</button>
        <button type="button" data-dh-kind="sonstiges" aria-pressed="false"><span aria-hidden="true">＋</span>Sonstige Befunde</button>
      </div>
      <div class="dh331-panel">
        <h3>Datei wählen oder mit dem iPhone scannen</h3>
        <p id="dh331-help">${kinds.lunge.hint}</p>
        <div class="dh331-picker">
          <label class="btn btn-primary">Datei auswählen<input type="file" id="dh331-file" accept=".json,application/json,.pdf,application/pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,image/*"></label>
          <label class="btn btn-outline">Kamera öffnen / scannen<input type="file" id="dh331-camera" accept="image/*" capture="environment"></label>
        </div>
        <details class="dh331-date"><summary>Dokumentdatum (optional)</summary><label>Datum auf dem Dokument <input type="date" id="dh331-date"></label></details>
        <p class="dh331-hint">Die Kamerafunktion speichert ein Foto, kein automatisch zugeschnittenes mehrseitiges PDF. Für weitere Seiten die Kamera erneut öffnen. Ein Text wird nicht automatisch ausgelesen.</p>
        <p class="dh331-status" id="dh331-status" role="status" aria-live="polite">Bereit.</p>
        <div id="dh331-follow" class="dh331-follow" hidden></div>
      </div>
      <div class="dh331-panel">
        <h3>Meine Arztbriefe & Entlassungsberichte</h3>
        <p>Hier erscheinen die gespeicherten Originale. Alle anderen Unterlagen bleiben in „Meine Akte → Dokumente“ verfügbar.</p>
        <div id="dh331-archive"></div>
      </div>
      <p class="dh331-hint">Deine Gesundheitsdaten nicht in das öffentliche GitHub-Repository hochladen. Ein verschlüsseltes Backup kannst du unter „Einstellungen“ erstellen.</p>
    </div>`;
  home.insertAdjacentElement('afterend',page);
  const archive=$('dh331-archive'),follow=$('dh331-follow'),status=$('dh331-status');
  let chosen='lunge',busy=false,seq=0,renderTimer;
  const errorWords=/fehler|fehlgeschlagen|nicht möglich|nicht gespeichert|speicherfehler/i;
  function setStatus(text,isError=false){status.textContent=text;status.classList.toggle('dh331-error',isError);}
  function clearFollow(){follow.replaceChildren();follow.hidden=true;}
  function followButton(label,action){const b=document.createElement('button');b.type='button';b.className='btn btn-outline';b.textContent=label;b.addEventListener('click',action);follow.hidden=false;follow.append(b);}
  const uuid=()=>crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
  function choose(category){
    if(busy)return;
    chosen=category;seq++;
    clearFollow();setStatus('Bereit.');
    $('dh331-help').textContent=kinds[category].hint;
    page.querySelectorAll('[data-dh-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dhKind===category)));
    $('dh331-file').value='';$('dh331-camera').value='';$('dh331-date').value='';
  }
  page.querySelectorAll('[data-dh-kind]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.dhKind)));
  function forwardFile(file,targetId){
    const input=$(targetId);
    if(!input)throw Error('Die bisherige Scan- oder Importfunktion fehlt.');
    const transfer=new DataTransfer();transfer.items.add(file);
    input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  async function lungJson(file){
    if(file.size>30*1024*1024)throw Error('Importdatei zu groß (maximal 30 MB).');
    const obj=JSON.parse(await file.text());
    if(obj?.kind!=='Asthma-Lung-Study-v1'||!Array.isArray(obj.records)||!obj.records.length)throw Error('Datei ist keine Lungenfunktions-Importdatei.');
    const field=$('dl324-jsontext'),btn=$('dl324-importtext'),out=$('dl324-status');
    if(!field||!btn||!out)throw Error('Der bestehende Lungenfunktionsimport ist nicht verfügbar.');
    // Der bestehende Import prüft alle Reihen, erkennt Duplikate, verschlüsselt und bestätigt den Schreibvorgang.
    const previous=out.textContent;
    field.value=JSON.stringify(obj);
    btn.click();
    setStatus('Lungenfunktionsdatei wird geprüft und in den verschlüsselten Verlauf übernommen …');
    const current=seq;
    let finished=false;
    function reflect(){
      if(current!==seq)return;
      const text=out.textContent.trim();
      if(text===previous||!text)return;
      setStatus(text,errorWords.test(text));
      if(/Erfolgreich|bereits vorhanden|nicht möglich|Speicherfehler/i.test(text)){
        finished=true;monitor.disconnect();field.value='';
      }
    }
    const monitor=new MutationObserver(reflect);
    monitor.observe(out,{childList:true,subtree:true,characterData:true});
    reflect();
    setTimeout(()=>{if(!finished)monitor.disconnect();},15000);
    followButton('Lungenfunktion / Diagramme öffnen',()=>NAV.go('lungenwerte'));
  }
  async function laborJson(file){
    if(file.size>12*1024*1024)throw Error('Labor-Importdatei zu groß (maximal 12 MB).');
    const obj=JSON.parse(await file.text());
    if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('Keine gültige Labor-JSON-Datei.');
    forwardFile(file,'labp-import');
    setStatus('Labor-Datei zur Prüfung geöffnet. Bitte die Werte im Laborbereich kontrollieren und die Übernahme bestätigen.');
    followButton('Labor-Import kontrollieren',()=>NAV.go('labor'));
  }
  async function original(file,category,day){
    if(!/\.(pdf|jpe?g|png|webp|heic|heif)$/i.test(file.name||'')||!file.size||file.size>12*1024*1024)
      throw Error('Als Original sind Fotos und PDF-Dateien bis 12 MB erlaubt.');
    const candidates=await SEC.list('documents');
    if(candidates.some(d=>d.name===file.name&&d.size===file.size&&d.kind===kinds[category].docKind)){
      if(!confirm('Eine Datei mit gleichem Namen und gleicher Größe ist schon vorhanden. Trotzdem erneut speichern?')){
        setStatus('Keine doppelte Datei gespeichert.');return;
      }
    }
    const id=uuid();
    const row={id,name:file.name.slice(0,180),size:file.size,mime:file.type||'application/octet-stream',blob:file,kind:kinds[category].docKind,caseId:'',documentDate:day,source:'dateien331',createdAt:new Date().toISOString()};
    await SEC.put('documents',row,id);
    const check=await SEC.get('documents',id);
    if(!check||!(check.blob instanceof Blob)||check.blob.size!==file.size)
      throw Error('Speicherprüfung fehlgeschlagen. Bitte Gerätespeicher und App-Datenschutz prüfen.');
    await refreshArchive();
    setStatus(kinds[category].docKind+' verschlüsselt gespeichert: '+file.name);
    if(file.type.startsWith('image/')){
      if(category==='lunge')followButton('Messwerte im Befundscanner prüfen',()=>{try{forwardFile(file,'scan-gallery');NAV.go('befunde')}catch(e){setStatus(e.message,true)}});
      if(category==='labor')followButton('Laborbild zur Werteerfassung öffnen',()=>{try{forwardFile(file,'lab-file');NAV.go('labor')}catch(e){setStatus(e.message,true)}});
    }
    followButton('Gespeicherte Dokumente öffnen',()=>{NAV.go('akte');document.querySelector('.my-tab[data-my-tab="documents"]')?.click()});
  }
  async function handle(file,field){
    if(!file||busy)return;
    busy=true;clearFollow();
    try{
      if(!SEC.state().unlocked)throw Error('Bitte zuerst die Gesundheitsakte entsperren.');
      setStatus('Prüfe Datei '+file.name+' …');
      const category=chosen,day=$('dh331-date').value;
      if((category==='lunge'||category==='labor')&&/\.json$/i.test(file.name||'')){
        if(category==='lunge')await lungJson(file);else await laborJson(file);
      }else await original(file,category,day);
    }catch(err){setStatus('Datei nicht übernommen: '+(err?.message||String(err)),true);}
    finally{field.value='';busy=false;}
  }
  for(const id of ['dh331-file','dh331-camera'])$(id).addEventListener('change',e=>handle(e.target.files?.[0],e.target));
  const formatDate=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):'Unbekannt';
  async function refreshArchive(){
    if(!SEC.state().unlocked){archive.textContent='Gesundheitsakte ist gesperrt.';return;}
    const rows=(await SEC.list('documents')).filter(d=>['Arztbrief','Entlassungsbericht'].includes(d.kind))
      .sort((a,b)=>(b.documentDate||b.createdAt||'').localeCompare(a.documentDate||a.createdAt||''));
    archive.replaceChildren();
    if(!rows.length){archive.textContent='Noch keine Arztbriefe oder Entlassungsberichte gespeichert.';return;}
    const frag=document.createDocumentFragment();
    for(const d of rows.slice(0,100)){
      const article=document.createElement('article');article.className='dh331-document';
      const title=document.createElement('strong');title.textContent=d.name||'Dokument';
      const meta=document.createElement('small');meta.textContent=d.kind+' · '+formatDate(d.documentDate||(d.createdAt||'').slice(0,10))+' · '+(d.size/1048576).toFixed(1)+' MB';
      const actions=document.createElement('div');actions.className='dh331-row-buttons';
      const open=document.createElement('button');open.type='button';open.className='btn btn-outline';open.textContent='Öffnen / speichern';
      open.addEventListener('click',()=>{
        if(!(d.blob instanceof Blob)){setStatus('Datei kann nicht gelesen werden.',true);return;}
        const url=URL.createObjectURL(d.blob),link=document.createElement('a');link.href=url;link.download=d.name||'Dokument';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
      });
      const remove=document.createElement('button');remove.type='button';remove.className='btn btn-text';remove.textContent='Löschen';
      remove.addEventListener('click',async()=>{
        if(!confirm('Dieses Dokument endgültig löschen?'))return;
        try{await SEC.del('documents',d.id);await refreshArchive();setStatus('Dokument gelöscht.');}
        catch(e){setStatus('Löschen fehlgeschlagen: '+e.message,true);}
      });
      actions.append(open,remove);article.append(title,meta,actions);frag.append(article);
    }
    archive.append(frag);
    if(rows.length>100){const p=document.createElement('p');p.textContent='Weitere Dokumente unter „Meine Akte → Dokumente“.';archive.append(p);}
  }
  window.addEventListener('asthma:secure-change',ev=>{
    if(ev.detail?.group==='documents'){
      clearTimeout(renderTimer);renderTimer=setTimeout(()=>refreshArchive().catch(e=>setStatus(e.message,true)),80);
    }
  });
  refreshArchive().catch(e=>setStatus('Dokumentenablage nicht lesbar: '+e.message,true));
  window.__ASTHMA_DATEIEN331_TEST=Object.freeze({version:'3.3.1',kindNames:Object.keys(kinds),maxOriginalBytes:12*1024*1024});
})();
