'use strict';
/* PneumoPro 3.5.6 – eigenständiger lokaler JSON-Export/-Import der Allergieakte.
   Niemals automatischer Netzwerkversand, niemals Kopie in öffentlichen GitHub-Dateien. */
(()=>{
  const SEC=window.ASTHMA_SECURITY;
  const page=document.getElementById('allergien');
  const API=window.PNEUMOPRO_ALLERGIEN355;
  if(!SEC||!page||!API||document.getElementById('a356-exchange'))return;
  const $=id=>document.getElementById(id);
  const FORMAT='PneumoPro-Allergien-JSON';
  const VERSION=1;
  const FIELDS=['id','date','createdAt','type','allergen','method','result','confirmation','severity',
    'value','unit','fevBefore','fevAfter','provider','symptoms','advice','notes','attachmentName'];
  const STRING_LIMITS={id:90,date:10,createdAt:36,type:30,allergen:130,method:35,result:24,
    confirmation:24,severity:20,unit:36,provider:160,symptoms:800,advice:800,notes:800,attachmentName:140};
  const choices={
    result:['unbekannt','ausstehend','negativ','grenzwertig','positiv','reaktion','unklar'],
    confirmation:['offen','verdacht','bestaetigt','ausgeschlossen','ungewiss'],
    severity:['keine','leicht','mittel','stark','anaphylaxie']
  };
  const types=new Set(Object.keys(API.types));
  const methods=new Set(API.methods.map(m=>m[0]));
  const numberFields=new Set(['value','fevBefore','fevAfter']);
  const safeDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(new Date(s+'T12:00:00Z').getTime())&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
  const uid=()=>typeof crypto.randomUUID==='function'?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2);
  const box=document.createElement('section');box.id='a356-exchange';box.className='suite-subpanel';
  box.innerHTML=`<h3>Allergiewerte als JSON-Datei austauschen</h3>
  <p class="a355-note"><strong>Für ChatGPT:</strong> Alle Allergietests in eine <strong>.json-Datei</strong> speichern und diese hier im Chat hochladen. Enthalten sind Messwerte, Testarten, Ergebnisse und Notizen. Originalfotos und PDFs sind <strong>nicht</strong> im Export enthalten.</p>
  <div class="a355-actions"><button class="btn btn-primary" id="a356-export" type="button">Allergiewerte als JSON herunterladen</button></div>
  <p class="a355-note"><strong>Wichtig:</strong> Die heruntergeladene JSON-Datei ist <strong>unverschlüsselt</strong> und kann Gesundheitsdaten enthalten. Nur bewusst teilen, nicht in ein öffentliches GitHub-Repository hochladen. Für eine verschlüsselte Komplettsicherung weiterhin Einstellungen → Backup verwenden.</p>
  <h4>JSON-Datei zurück in PneumoPro einlesen</h4>
  <p class="a355-note">Du kannst eine von PneumoPro exportierte und hier im Chat bearbeitete JSON-Datei wieder einlesen. Bestehende Befunde bleiben standardmäßig unverändert. Doppelte Datensätze werden erkannt.</p>
  <label for="a356-file" class="a355-note"><strong>JSON-Datei auswählen</strong></label>
  <input id="a356-file" type="file" accept=".json,application/json" style="display:block;width:100%;max-width:100%;margin:8px 0 12px;font:inherit"/>
  <label class="a355-note" style="display:flex;align-items:flex-start;gap:9px"><input id="a356-update" type="checkbox" style="margin-top:5px"/> Vorhandene Befunde mit gleicher ID bei abweichenden Werten nach zusätzlicher Bestätigung aktualisieren (Originalanhänge bleiben erhalten)</label>
  <div class="a355-actions"><button class="btn btn-outline" id="a356-preview" type="button">Datei prüfen / Vorschau</button><button class="btn btn-primary" id="a356-import" type="button" disabled>Geprüfte Werte importieren</button></div>
  <p id="a356-status" role="status" aria-live="polite" class="a355-note">Noch keine Datei ausgewählt.</p>`;
  const anchor=page.querySelector('#a355-list')?.closest('.suite-subpanel');
  if(anchor)anchor.insertAdjacentElement('afterend',box);else page.append(box);
  const status=t=>{$('a356-status').textContent=t;};
  const list=async()=>((await SEC.list('suite')).filter(r=>r.type==='allergies355'&&r.value?.id).map(r=>r.value));
  const showError=e=>status('Fehler: '+(e?.message||String(e)));
  const onlyFields=record=>Object.fromEntries(FIELDS.map(k=>[k,record[k]??(numberFields.has(k)?null:'')]));
  const fingerprint=r=>JSON.stringify(FIELDS.filter(f=>f!=='id'&&f!=='createdAt'&&f!=='attachmentName').map(f=>r[f]??null));
  let pending=null;
  function resetPreview(){pending=null;$('a356-import').disabled=true;}
  $('a356-file').addEventListener('change',()=>{resetPreview();status('Datei ausgewählt. Jetzt „Datei prüfen / Vorschau“ tippen.');});
  $('a356-update').addEventListener('change',()=>{resetPreview();status('Import-Modus geändert. Datei bitte erneut prüfen.');});
  $('a356-export').addEventListener('click',async()=>{
    const button=$('a356-export');button.disabled=true;
    try{
      if(!SEC.state().unlocked)throw Error('Die Gesundheitsakte ist gesperrt.');
      const records=(await list()).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
      if(!records.length){status('Noch keine Allergiewerte erfasst. Bitte zuerst Befunde eintragen.');return;}
      if(!confirm('JSON enthält persönliche Allergie- und Gesundheitsdaten ohne Passwortschutz. Datei wirklich exportieren?')){status('Export abgebrochen.');return;}
      const packageData={format:FORMAT,schemaVersion:VERSION,exportedAt:new Date().toISOString(),
        privacyNotice:'Unverschlüsselte Gesundheitsdaten. Nicht öffentlich hochladen.',
        attachments:'Originalfotos/PDFs bewusst nicht enthalten',
        records:records.map(onlyFields)};
      const blob=new Blob([JSON.stringify(packageData,null,2)],{type:'application/json;charset=utf-8'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;
      a.download='PneumoPro_Allergiewerte_'+new Date().toISOString().slice(0,10)+'.json';
      document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
      status(records.length+' Allergieeinträge als JSON vorbereitet. Auf dem iPhone unter „Dateien/Downloads“ nachsehen und die JSON-Datei hier im Chat anhängen.');
    }catch(e){showError(e)}finally{button.disabled=false;}
  });
  function validate(record,i){
    if(!record||typeof record!=='object'||Array.isArray(record))throw Error('Eintrag '+i+' ist kein Objekt.');
    const clean={};
    for(const k of FIELDS){
      const v=record[k];
      if(numberFields.has(k)){
        if(v===null||v===undefined||v===''){clean[k]=null;continue;}
        if(typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>1000000)throw Error('Eintrag '+i+': '+k+' ist kein gültiger Zahlenwert.');
        clean[k]=v;
      }else{
        if(v===null||v===undefined){clean[k]='';continue;}
        if(typeof v!=='string'||v.length>STRING_LIMITS[k])throw Error('Eintrag '+i+': Ungültiger Text in '+k+'.');
        clean[k]=v;
      }
    }
    if(!safeDate(clean.date)||!clean.allergen.trim()||!types.has(clean.type)||!methods.has(clean.method))throw Error('Eintrag '+i+': Datum, Allergiegruppe, Testart oder Auslöser ungültig.');
    for(const [field,allowed] of Object.entries(choices)){
      const fallback={result:'unbekannt',confirmation:'offen',severity:'keine'}[field];
      if(!clean[field])clean[field]=fallback;
      if(!allowed.includes(clean[field]))throw Error('Eintrag '+i+': Ungültiger Wert in '+field+'.');
    }
    if((clean.fevBefore!==null||clean.fevAfter!==null)&&!(clean.fevBefore!==null&&clean.fevBefore>0&&clean.fevAfter!==null&&clean.fevAfter>=0))throw Error('Eintrag '+i+': FEV1 vor/nach nur gemeinsam mit positivem Vorwert.');
    if(!/^[A-Za-z0-9_-]{6,90}$/.test(clean.id))clean.id=uid();
    if(clean.createdAt&&!Number.isFinite(Date.parse(clean.createdAt)))throw Error('Eintrag '+i+': Erstellungsdatum ungültig.');
    if(!clean.createdAt)clean.createdAt=new Date().toISOString();
    clean.allergen=clean.allergen.trim();
    return clean;
  }
  async function makePreview(){
    resetPreview();
    if(!SEC.state().unlocked)throw Error('Die Gesundheitsakte ist gesperrt.');
    const f=$('a356-file').files?.[0];
    if(!f)throw Error('Bitte zunächst eine JSON-Datei auswählen.');
    if(!/\.json$/i.test(f.name))throw Error('Nur Dateien mit der Endung .json sind erlaubt.');
    if(f.size>4*1024*1024)throw Error('Die Datei überschreitet 4 MB. Bitte kleinere JSON-Datei verwenden.');
    let parsed;
    try{parsed=JSON.parse(await f.text());}catch{throw Error('Die Datei enthält kein gültiges JSON.');}
    if(parsed?.format!==FORMAT||parsed?.schemaVersion!==VERSION||!Array.isArray(parsed.records))throw Error('Das ist keine kompatible PneumoPro-Allergien-JSON (Schema 1).');
    if(parsed.records.length>2000)throw Error('Maximal 2000 Befunde pro Importdatei.');
    const records=parsed.records.map((x,i)=>validate(x,i+1));
    const seen=new Set();
    for(const row of records){if(seen.has(row.id))throw Error('Mehrfach vorhandene Datensatz-ID in der Importdatei: '+row.id);seen.add(row.id);}
    const existing=await list(),byId=new Map(existing.map(r=>[r.id,r]));
    const byContent=new Set(existing.map(fingerprint));
    const allowUpdates=$('a356-update').checked;
    const additions=[],updates=[];let duplicates=0,conflicts=0;
    for(const r of records){
      const old=byId.get(r.id);
      if(old){
        if(fingerprint(r)===fingerprint(old)){duplicates++;continue;}
        if(allowUpdates)updates.push({...r,id:old.id,createdAt:old.createdAt||r.createdAt,attachment:old.attachment||null,attachmentName:old.attachmentName||r.attachmentName,scanDocumentId:old.scanDocumentId||''});
        else conflicts++;
      }else if(byContent.has(fingerprint(r))){duplicates++;}
      else{additions.push({...r,attachment:null});byContent.add(fingerprint(r));}
    }
    pending={file:f,additions,updates,duplicates,conflicts,recordCount:records.length};
    $('a356-import').disabled=!additions.length&&!updates.length;
    status('Vorschau: '+records.length+' Datei-Einträge · '+additions.length+' neu · '+updates.length+' zu aktualisieren · '+duplicates+' bereits vorhanden · '+conflicts+' abweichende vorhandene Befunde nicht überschrieben. Originalbilder/PDFs werden nicht aus JSON übertragen.');
  }
  $('a356-preview').addEventListener('click',async()=>{const btn=$('a356-preview');btn.disabled=true;try{await makePreview();}catch(e){resetPreview();showError(e);}finally{btn.disabled=false;}});
  $('a356-import').addEventListener('click',async()=>{
    const btn=$('a356-import');btn.disabled=true;
    let done=0;
    try{
      if(!pending||!SEC.state().unlocked)throw Error('Bitte zuerst eine Datei bei entsperrter App prüfen.');
      if($('a356-file').files?.[0]!==pending.file)throw Error('Die ausgewählte Datei hat sich geändert. Bitte neu prüfen.');
      const count=pending.additions.length+pending.updates.length;
      if(!confirm(count+' Allergiebefunde übernehmen ('+pending.additions.length+' neu, '+pending.updates.length+' aktualisieren)? Bestehende andere Daten bleiben erhalten. Für Sicherheit vorher vollständiges verschlüsseltes Backup erstellen.')){status('Import abgebrochen.');return;}
      for(const record of [...pending.additions,...pending.updates]){
        await SEC.put('suite',{key:'allergies355/'+record.id,type:'allergies355',value:record},'allergies355/'+record.id);
        done++;
      }
      status('Erfolgreich: '+done+' Befunde verschlüsselt übernommen. Doppelte Einträge und nicht ausgewählte Änderungen wurden nicht übernommen.');
      resetPreview();$('a356-file').value='';
    }catch(e){resetPreview();status('Importfehler nach '+done+' gespeicherten Einträgen: '+(e?.message||e)+'. Bereits gespeicherte Einträge bleiben erhalten.');}
    finally{btn.disabled=false;}
  });
  window.PNEUMOPRO_ALLERGIEN_JSON356=Object.freeze({format:FORMAT,schemaVersion:VERSION,validate,onlyFields,fingerprint});
})();
