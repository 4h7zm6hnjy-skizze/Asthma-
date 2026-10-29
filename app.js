'use strict';
(() => {
  const VERSION = '3.4.0';
  window.ASTHMA_APP_VERSION = VERSION;
  const STORAGE = 'asthma-v1-preferences';
  const sources = window.ASTHMA_SOURCES || {};
  const articles = window.ASTHMA_ARTICLES || [];
  const categories = {hilfsmittel:'Hilfsmittel',arbeit:'Arbeitsrecht',gdb:'GdB & Anträge',finanzen:'Steuern & Vorteile',wissen:'Asthma-Wissen'};
  const taxes = {20:384,30:620,40:860,50:1140,60:1440,70:1780,80:2120,90:2460,100:2840};
  const $ = (id) => document.getElementById(id);
  const stored = window.ASTHMA_SECURITY.profileGet();
  const validPercentage = value => value!==null && value!==undefined && value!=='' && Number.isFinite(Number(value)) && Number(value)>=0 && Number(value)<=100 ? Number(value) : null;
  const validLiters = value => value!==null && value!==undefined && value!=='' && Number.isFinite(Number(value)) && Number(value)>=0 && Number(value)<=12 ? Number(value) : null;
  const state = {
    gdb: Number.isInteger(stored.gdb) && stored.gdb>=10 && stored.gdb<=100 && stored.gdb%10===0 ? stored.gdb : 30,
    equal: stored.equal === true,
    fev1: validPercentage(stored.fev1),
    fvc: validPercentage(stored.fvc),
    fev1Liters: validLiters(stored.fev1Liters),
    fvcLiters: validLiters(stored.fvcLiters),
    lungDate: typeof stored.lungDate==='string' && /^\d{4}-\d{2}-\d{2}$/.test(stored.lungDate) ? stored.lungDate : '',
    lungSymptoms: Array.isArray(stored.lungSymptoms) ? stored.lungSymptoms.filter(x=>['dyspnea','night','mucus','work'].includes(x)) : [],
    saved: Array.isArray(stored.saved) ? stored.saved.filter(id=>articles.some(a=>a.id===id)).slice(0,200) : [],
    section:'all', query:'', all:false
  };
  function persist(){window.ASTHMA_SECURITY.updateProfile({gdb:state.gdb,equal:state.equal,saved:state.saved,fev1:state.fev1,fvc:state.fvc,fev1Liters:state.fev1Liters,fvcLiters:state.fvcLiters,lungDate:state.lungDate,lungSymptoms:state.lungSymptoms}).catch(e=>alert('Profilspeicherung fehlgeschlagen: '+e.message))}
  function eligibleForProtection(){return state.gdb>=50||((state.gdb===30||state.gdb===40)&&state.equal)}
  function getEligibility(card){
    const g=state.gdb;
    switch(card.condition){
      case 'all': return {ok:true,type:'info',text:'Gilt unabhängig vom GdB'};
      case 'assessment': return {ok:true,type:'check',text:'Individuelle Prüfung nötig'};
      case 'gdb20': return g>=20?{ok:true,type:'eligible',text:'Ab GdB 20 – steuerliche Voraussetzungen prüfen'}:{ok:false,type:'not',text:'Erst ab festgestelltem GdB 20'};
      case 'gdb30_40': return (g===30||g===40)?{ok:true,type:'check',text:state.equal?'Gleichstellung laut Auswahl bewilligt':'Antrag auf Gleichstellung möglich'}:{ok:false,type:'not',text:'Relevant bei GdB 30 oder 40'};
      case 'severe': return g>=50?{ok:true,type:'eligible',text:'Grundsätzlich ab GdB 50'}:{ok:false,type:'not',text:'Nur bei Schwerbehinderung ab GdB 50'};
      case 'severe_or_equal': return eligibleForProtection()?{ok:true,type:'eligible',text:'Grundsätzlich anwendbar – Ausnahmen beachten'}:{ok:false,type:'not',text:'Ab GdB 50 oder mit bewilligter Gleichstellung'};
      case 'gdb80': return g>=80?{ok:true,type:'check',text:'Ab GdB 80 – steuerlich prüfen'}:{ok:false,type:'not',text:'Ab GdB 80; alternativ GdB 70 + Merkzeichen G'};
      case 'gdb70_g': return g===70?{ok:true,type:'check',text:'Nur mit zusätzlich festgestelltem Merkzeichen G'}:{ok:false,type:'not',text:'Zusatzbedingung bei GdB 70'};
      default: return {ok:true,type:'info',text:'Allgemeine Information'};
    }
  }
  function profile(){
    $('gdb').value=String(state.gdb);
    $('equal').value=state.equal?'yes':'no';
    $('equal-field').hidden = !(state.gdb===30||state.gdb===40);
    const g=state.gdb;
    let head='', body='';
    if(g===10){head='GdB 10 – Orientierungswert';body='Eine behördliche GdB-Feststellung erfolgt gesetzlich erst ab GdB 20. Medizinische Hilfen und Arbeitsschutz können dennoch relevant sein.';}
    else if(g===20){head='GdB 20 – feststellbarer GdB';body='Der steuerliche Behinderten-Pauschbetrag kann infrage kommen. Gleichstellung nach § 2 Abs. 3 SGB IX ist damit regelmäßig nicht möglich.';}
    else if(g===30||g===40){head=state.equal?'Gleichstellung ausgewählt':'Gleichstellung kann geprüft werden';body=state.equal?'Mit einer tatsächlich bewilligten Gleichstellung gelten zahlreiche besondere Arbeitsrechte, jedoch kein gesetzlicher Zusatzurlaub nach § 208 SGB IX.':'GdB 30 oder 40 führt nicht automatisch zum besonderen Kündigungsschutz. Bei Gefährdung des Arbeitsplatzes kannst du die Gleichstellung bei der Arbeitsagentur beantragen.';}
    else{head='Schwerbehinderung ab GdB 50';body='Besondere arbeitsrechtliche Schutzregeln und Zusatzurlaub können greifen. Für einzelne Leistungen gelten weitere Voraussetzungen und Ausnahmen.';}
    const box=$('profile-result');box.replaceChildren();
    const h=document.createElement('strong');h.textContent=head;box.append(h);
    const p=document.createElement('p');p.textContent=body;box.append(p);
    if(g>=20){const tax=document.createElement('span');tax.className='tax';tax.textContent='Steuerlicher Jahres-Pauschbetrag nach § 33b EStG: '+taxes[g].toLocaleString('de-DE')+' € (kein Auszahlungsbetrag)';box.append(tax);}
  }
  function searchMatch(card,needle){
    if(!needle)return true;
    const haystack=[card.title,card.short,card.body,categories[card.section],...card.sources.map(s=>sources[s]?.label||'')].join(' ').normalize('NFKD').toLocaleLowerCase('de-DE');
    return haystack.includes(needle);
  }
  function sourceLink(id){
    const s=sources[id];if(!s)return null;
    const a=document.createElement('a');a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=s.label;return a;
  }
  function cardNode(card){
    const node=$('card-template').content.firstElementChild.cloneNode(true);
    node.dataset.id=card.id;
    node.querySelector('.category-tag').textContent=categories[card.section];
    node.querySelector('.card-title').textContent=card.title;
    node.querySelector('.card-summary').textContent=card.short;
    node.querySelector('.card-body').textContent=card.body;
    const info=getEligibility(card),status=node.querySelector('.status');status.className='status '+info.type;status.textContent=info.text;
    const links=node.querySelector('.links');card.sources.map(sourceLink).filter(Boolean).forEach(a=>links.append(a));
    const save=node.querySelector('.save-btn');const isSaved=state.saved.includes(card.id);save.classList.toggle('saved',isSaved);save.textContent=isSaved?'★':'☆';save.title=isSaved?'Aus Merkliste entfernen':'Zur Merkliste hinzufügen';save.setAttribute('aria-label',save.title);save.setAttribute('aria-pressed',String(isSaved));
    save.addEventListener('click',()=>{state.saved=state.saved.includes(card.id)?state.saved.filter(id=>id!==card.id):[...state.saved,card.id];persist();if(state.section==='saved'){render()}else{const now=state.saved.includes(card.id);save.classList.toggle('saved',now);save.textContent=now?'★':'☆';save.title=now?'Aus Merkliste entfernen':'Zur Merkliste hinzufügen';save.setAttribute('aria-label',save.title);save.setAttribute('aria-pressed',String(now));$('saved-count').textContent=state.saved.length;}});
    return node;
  }
  function render(){
    profile();
    document.querySelectorAll('.tab').forEach(tab=>{const active=tab.dataset.section===state.section;tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',String(active))});
    $('show-all').setAttribute('aria-pressed',String(state.all));$('show-all').textContent=state.all?'Nur passende Themen anzeigen':'Alle Themen anzeigen';
    $('clear-search').hidden=!state.query;
    $('saved-count').textContent=String(state.saved.length);
    const term=state.query.trim().normalize('NFKD').toLocaleLowerCase('de-DE');
    const selected=articles.filter(a=>(state.section==='all'||a.section===state.section||(state.section==='saved'&&state.saved.includes(a.id)))&&searchMatch(a,term)&&(state.all||state.section==='saved'||getEligibility(a).ok));
    const list=$('cards');const fragment=document.createDocumentFragment();selected.forEach(a=>fragment.append(cardNode(a)));list.replaceChildren(fragment);
    $('result-count').textContent=`${selected.length} von ${articles.length} Themen ${state.all?'angezeigt':'für deine Auswahl sichtbar'}`;
    $('empty').hidden=selected.length!==0;
  }
  function installSourceList(){const list=$('source-list');const fragment=document.createDocumentFragment();Object.values(sources).forEach(s=>{const a=document.createElement('a');a.className='source-item';a.textContent=s.label;a.href=s.url;a.target='_blank';a.rel='noopener noreferrer';const x=document.createElement('span');x.textContent='↗';x.setAttribute('aria-hidden','true');a.append(x);fragment.append(a)});list.replaceChildren(fragment)}
  function compareVersions(a,b){
    const parse=v=>String(v).replace(/^v/i,'').split('.').slice(0,3).map(x=>Number.parseInt(x,10));
    if(!/^v?\d+\.\d+\.\d+$/.test(a)||!/^v?\d+\.\d+\.\d+$/.test(b))return null;
    const x=parse(a),y=parse(b);for(let i=0;i<3;i++){if(x[i]>y[i])return 1;if(x[i]<y[i])return -1;}return 0;
  }
  // Ermittelt ausschließlich die veröffentlichte Programmversion; keine Nutzerdaten gehen ins Netz.
  async function serverRelease(){
    if(location.protocol==='file:')throw Error('Die App muss als Webseite geöffnet sein.');
    const response=await fetch('./version.json?check='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw Error('Versionsdatei konnte nicht geladen werden (HTTP '+response.status+').');
    const data=await response.json();
    if(compareVersions(data.version,VERSION)===null)throw Error('Die Versionsnummer des Servers ist ungültig.');
    return data;
  }
  async function checkUpdate(){
    const button=$('check-update'),install=$('reload-app'),out=$('update-status');
    if(button.disabled)return;
    button.disabled=true;button.textContent='Prüfe…';
    install.hidden=false;install.textContent='Update installieren';
    out.textContent='Prüfe die aktuelle Version auf dem Server …';
    try{
      const data=await serverRelease(),cmp=compareVersions(data.version,VERSION);
      if(cmp>0)out.textContent='Version '+data.version+' ist verfügbar. Tippe auf „Update installieren“. '+(data.notes||'');
      else if(cmp===0)out.textContent='Version '+VERSION+' ist aktuell. Mit „Update installieren“ kannst du die App-Dateien bei Anzeigeproblemen erneut laden.';
      else out.textContent='Serverversion '+data.version+', geöffnete Version '+VERSION+'. Bitte die veröffentlichte App prüfen.';
    }catch(e){out.textContent='Updateprüfung nicht möglich: '+e.message+' Prüfe deine Internetverbindung.';}
    finally{button.disabled=false;button.textContent='Nach Updates suchen';}
  }
  let installingUpdate=false;
  async function installUpdate(){
    if(installingUpdate)return;
    const button=$('reload-app'),out=$('update-status');
    installingUpdate=true;button.disabled=true;button.textContent='Installiere …';
    try{
      const release=await serverRelease();
      const comparison=compareVersions(release.version,VERSION);
      if(comparison===null)throw Error('Die Serverversion ist ungültig.');
      if(comparison<=0){
        out.textContent='Version '+VERSION+' ist bereits installiert. Kein weiterer Neustart nötig.';
        button.disabled=false;button.textContent='Update installieren';installingUpdate=false;
        return;
      }
      out.textContent='Lade App-Dateien für Version '+release.version+' …';
      if('serviceWorker' in navigator){
        const reg=await navigator.serviceWorker.getRegistration();
        if(reg){
          await reg.update();
          const worker=reg.installing||reg.waiting;
          if(worker){
            if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});
            if(worker.state!=='activated'&&worker.state!=='redundant'){
              await Promise.race([
                new Promise(resolve=>{
                  const handler=()=>{if(worker.state==='installed'){
                    worker.postMessage({type:'SKIP_WAITING'});
                  }else if(worker.state==='activated'||worker.state==='redundant'){
                    worker.removeEventListener('statechange',handler);resolve();}};
                  worker.addEventListener('statechange',handler);handler();
                }),
                new Promise(resolve=>setTimeout(resolve,20000))
              ]);
            }
          }
        }
      }
      // A new URL forces a navigation. No IndexedDB/localStorage/health-record deletion.
      const target=new URL(location.href);
      target.searchParams.set('app_update',release.version);
      target.searchParams.set('app_refresh',String(Date.now()));
      out.textContent='App wird aktualisiert. Bitte nach dem Neustart die Versionsanzeige prüfen.';
      location.replace(target.href);
    }catch(e){
      out.textContent='Update konnte nicht installiert werden: '+e.message+'. Deine Daten bleiben erhalten.';
      button.disabled=false;button.textContent='Update installieren';installingUpdate=false;
    }
  }
  function updateConnection(){const el=$('connection');el.textContent=navigator.onLine?'Online · Offline-Inhalte vorhanden':'Offline · Inhalte verfügbar';}
  function bindEvents(){
    $('gdb').addEventListener('change',e=>{const next=Number(e.target.value);if(next!==state.gdb)state.equal=false;state.gdb=next;persist();render()});
    $('equal').addEventListener('change',e=>{state.equal=e.target.value==='yes';persist();render()});
    $('search').addEventListener('input',e=>{state.query=e.target.value;render()});
    $('clear-search').addEventListener('click',()=>{state.query='';$('search').value='';render();$('search').focus()});
    $('tabs').addEventListener('click',e=>{const b=e.target.closest('button[data-section]');if(!b)return;state.section=b.dataset.section;render()});
    $('show-all').addEventListener('click',()=>{state.all=!state.all;render()});
    $('reset-filters').addEventListener('click',()=>{state.all=true;state.section='all';state.query='';$('search').value='';render()});
    $('check-update').addEventListener('click',checkUpdate);
    $('update-top').addEventListener('click',()=>{window.ASTHMA_NAV?.go('einstellungen');checkUpdate()});
    $('reload-app').addEventListener('click',installUpdate);
    $('forget').addEventListener('click',async()=>{if(!confirm('Achtung: Gesamtes gespeichertes Profil einschließlich persönlicher Angaben (Name, Adresse, Geburtsdatum, Gewicht) sowie GdB und Merkliste löschen? Vorher vollständiges Backup erstellen.'))return;try{await window.ASTHMA_SECURITY.profileClear()}catch(e){$('update-status').textContent='Löschen fehlgeschlagen: '+e.message;return;}state.gdb=30;state.equal=false;state.fev1=null;state.fvc=null;state.fev1Liters=null;state.fvcLiters=null;state.lungDate='';state.lungSymptoms=[];state.saved=[];state.section='all';state.query='';state.all=false;$('search').value='';render();window.dispatchEvent(new Event('asthma:profile-reset'));$('update-status').textContent='Lokale Profildaten wurden gelöscht.'});
    window.addEventListener('online',updateConnection);window.addEventListener('offline',updateConnection);
  }
  function setupOffline(){
    if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{});
  }
  Object.defineProperty(window,'ASTHMA_PROFILE_BRIDGE',{value:Object.freeze({
    get:()=>({gdb:state.gdb,equal:state.equal,fev1:state.fev1,fvc:state.fvc,fev1Liters:state.fev1Liters,fvcLiters:state.fvcLiters,lungDate:state.lungDate,lungSymptoms:[...state.lungSymptoms]}),
    setLung:(data)=>{
      state.fev1=validPercentage(data.fev1);state.fvc=validPercentage(data.fvc);
      state.fev1Liters=validLiters(data.fev1Liters);state.fvcLiters=validLiters(data.fvcLiters);
      state.lungDate=typeof data.lungDate==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(data.lungDate)?data.lungDate:'';
      state.lungSymptoms=Array.isArray(data.lungSymptoms)?[...new Set(data.lungSymptoms.filter(x=>['dyspnea','night','mucus','work'].includes(x)))]:[];
      persist();
    }
  }),enumerable:false});
  $('version-chip').textContent='v'+VERSION;$('footer-version').textContent=VERSION;
  bindEvents();installSourceList();render();updateConnection();setupOffline();
  // Für prüfbare Funktionstests ohne Zugriff auf private Profildaten.
  Object.defineProperty(window,'__asthmaAppTest',{value:Object.freeze({compareVersions,articleCount:articles.length,getEligibility}),enumerable:false});
})();
