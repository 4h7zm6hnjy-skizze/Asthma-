'use strict';
/* Asthma 2.9.2 – new dated body-weight readings stored in existing AES-GCM suite vault.
 * Does not alter personal weight profile or prior records. */
(()=>{
 const $=id=>document.getElementById(id),SEC=window.ASTHMA_SECURITY;
 if(!SEC?.state?.().unlocked||!$('vitalwerte')||$('s292-weight'))return;
 const root=document.createElement('section');root.id='s292-weight';root.className='s292-weight';
 root.innerHTML='<h3>Gewichtsverlauf</h3><p class="input-note">Neue Gewichtsmessungen mit Datum dokumentieren. Das neueste gespeicherte Gewicht aktualisiert automatisch das Patientenprofil, den BMI und die Körperoberfläche. Die Einträge erscheinen im Statistik-Anhang und in der Sicherung.</p><form id="s292-weight-form"><label>Datum<input type="date" name="date" required></label><label>Gewicht (kg)<input type="number" name="kg" required min="15" max="500" step="0.1" inputmode="decimal"></label><label>Notiz (optional)<input type="text" name="note" maxlength="160"></label><input type="hidden" name="entry"><div class="s292-actions"><button class="btn btn-primary" type="submit">Gewicht speichern</button><button class="btn btn-outline" id="s292-weight-cancel" type="button" hidden>Abbrechen</button></div></form><p id="s292-weight-status" role="status"></p><div id="s292-weight-list"></div>';
 $('vitalwerte').append(root);
 const form=$('s292-weight-form'),status=$('s292-weight-status'),list=$('s292-weight-list');
 const dateStr=()=>{const x=new Date();return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-')};
 const validDate=v=>{if(!/^\d{4}-\d\d-\d\d$/.test(v||''))return false;const t=new Date(v+'T12:00:00');return !Number.isNaN(t.getTime())&&dateStrFrom(t)===v;};
 const dateStrFrom=t=>[t.getFullYear(),String(t.getMonth()+1).padStart(2,'0'),String(t.getDate()).padStart(2,'0')].join('-');
 const reset=()=>{form.reset();form.elements.date.value=dateStr();form.elements.entry.value='';$('s292-weight-cancel').hidden=true;form.querySelector('button[type=submit]').textContent='Gewicht speichern';};
 reset();
 let entries=[],request=0;
 async function refresh(){const token=++request;const rows=await SEC.list('suite');if(token!==request)return;
   entries=rows.filter(x=>x.type==='weight292').map(x=>x.value).filter(x=>x&&validDate(x.date)&&Number.isFinite(Number(x.kg))&&Number(x.kg)>=15&&Number(x.kg)<=500).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
   list.replaceChildren();if(!entries.length){const p=document.createElement('p');p.className='input-note';p.textContent='Noch keine datierten Gewichtsmessungen gespeichert.';list.append(p);return;}
   const t=document.createElement('table'),head=document.createElement('tr');for(const s of ['Datum','Gewicht','Aktionen']){const th=document.createElement('th');th.textContent=s;head.append(th);}t.append(head);
   for(const entry of entries.slice(0,80)){
     const tr=document.createElement('tr');const d=document.createElement('td');d.textContent=entry.date.split('-').reverse().join('.');const kg=document.createElement('td');kg.textContent=Number(entry.kg).toLocaleString('de-DE',{maximumFractionDigits:1})+' kg';
     const actions=document.createElement('td');const edit=document.createElement('button');edit.className='btn btn-text';edit.textContent='Ändern';edit.type='button';edit.addEventListener('click',()=>{form.elements.date.value=entry.date;form.elements.kg.value=entry.kg;form.elements.note.value=entry.note||'';form.elements.entry.value=entry.id;$('s292-weight-cancel').hidden=false;form.querySelector('button[type=submit]').textContent='Änderung speichern';form.scrollIntoView({block:'nearest'});});
     const del=document.createElement('button');del.className='btn btn-text';del.textContent='Löschen';del.type='button';del.addEventListener('click',async()=>{if(!confirm('Gewichtseintrag vom '+entry.date+' löschen?'))return;try{await SEC.del('suite','weight292/'+entry.id);if(form.elements.entry.value===entry.id)reset();status.textContent='Gewichtseintrag gelöscht.';await refresh()}catch(err){status.textContent='Löschen fehlgeschlagen: '+err.message;}});
     actions.append(edit,del);tr.append(d,kg,actions);t.append(tr);
   }list.append(t);
 }
 form.addEventListener('submit',async event=>{event.preventDefault();const date=form.elements.date.value,kg=Number(form.elements.kg.value),note=form.elements.note.value.trim();
   if(!validDate(date)||!Number.isFinite(kg)||kg<15||kg>500){status.textContent='Datum oder Gewicht ungültig.';return;}
   const editId=form.elements.entry.value;
   if(!editId&&entries.some(x=>x.date===date&&Number(x.kg)===kg)){status.textContent='Identischer Wert am selben Tag bereits vorhanden.';return;}
   const id=editId||crypto.randomUUID?.()||'w'+Date.now()+'-'+Math.random().toString(36).slice(2);
   const value={id,date,kg,note:note.slice(0,160),createdAt:entries.find(x=>x.id===id)?.createdAt||new Date().toISOString()};
   try{await SEC.put('suite',{key:'weight292/'+id,type:'weight292',value},'weight292/'+id);reset();status.textContent='Gewicht verschlüsselt gespeichert.';await refresh();}catch(err){status.textContent='Speichern fehlgeschlagen: '+err.message;}
 });
 $('s292-weight-cancel').addEventListener('click',reset);
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite')refresh().catch(err=>{status.textContent='Gewichtseinträge nicht lesbar: '+err.message;});});
 refresh().catch(err=>{status.textContent='Gewichtseinträge nicht lesbar: '+err.message;});
})();
