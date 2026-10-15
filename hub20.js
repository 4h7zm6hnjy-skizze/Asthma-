'use strict';
/* Asthma 2.0: private full-text search after local unlock; no network. */
(()=>{
 const $=id=>document.getElementById(id), SEC=window.ASTHMA_SECURITY;
 const input=$('private-search20'),result=$('private-search-results20'),status=$('private-search-status20');
 if(!input||!SEC)return;
 const category={cases:['Anträge','akte'],documents:['Dokumente','akte'],diary:['Tagebuch','akte'],suite:['Lungenwerte / Therapie','lungenwerte'],calendar:['Kalender','kalender'],labs:['Blutwerte','labor'],epef:['Peak-Flow / ePEF','lungenwerte']};
 const strings=(v,depth=0)=>{if(depth>3||v==null)return '';if(typeof v==='string')return v.slice(0,1000);if(typeof v==='number')return String(v);if(Array.isArray(v))return v.slice(0,15).map(x=>strings(x,depth+1)).join(' ');if(typeof v==='object'){if(v instanceof Blob||v.$kind==='blob')return '';return Object.entries(v).filter(([k])=>!['data','bytes','blob','cipher','iv','salt','password'].includes(k)).slice(0,30).map(([k,x])=>strings(x,depth+1)).join(' ')}return ''};
 let timer=null,serial=0;
 async function search(){const q=input.value.trim().toLocaleLowerCase('de-DE');const seq=++serial;result.replaceChildren();status.textContent='';if(q.length<2){status.textContent='Mindestens zwei Zeichen eingeben.';return}
 try{status.textContent='Durchsuche verschlüsselte Einträge lokal …';const found=[];for(const [group,[label,page]] of Object.entries(category)){
  const rows=await SEC.list(group);if(seq!==serial)return;
  for(const item of rows){const hay=strings(item).toLocaleLowerCase('de-DE');if(!hay.includes(q))continue;
   const title=[item.title,item.name,item.type,item.key,item.id,item.date].filter(v=>typeof v==='string'&&v.trim()).slice(0,2).join(' – ')||label;
   found.push({title: title.slice(0,130),label,page});if(found.length>=40)break;
  }if(found.length>=40)break;
 }if(seq!==serial)return;status.textContent=found.length?`${found.length}${found.length===40?' oder mehr':''} lokale Treffer`:'Keine passenden Einträge gefunden.';
 for(const hit of found){const b=document.createElement('button');b.type='button';b.className='hub20-result';const strong=document.createElement('strong');strong.textContent=hit.title;const small=document.createElement('small');small.textContent=hit.label+' · Bereich öffnen';b.append(strong,small);b.addEventListener('click',()=>window.ASTHMA_NAV?.go(hit.page));result.append(b);}
 }catch(e){if(seq===serial)status.textContent='Suche nicht verfügbar: '+(e?.message||'unbekannter Fehler')}
 }
 input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(search,220)});
 window.addEventListener('asthma:secure-change',()=>{if(input.value.trim().length>=2)search()});
})();
