'use strict';
/* 2.4: uses existing encrypted suite/meds records. Never suggests or changes doses. */
(()=>{
 const $=id=>document.getElementById(id);
 const SEC=window.ASTHMA_SECURITY;
 const fmt=x=>/^\d{4}-\d{2}-\d{2}$/.test(x||'')?x.split('-').reverse().join('.'):'–';
 const esc=s=>String(s??'');
 let meds=[];
 function render(){const box=$('med24-overview');if(!box)return;box.replaceChildren();
   if(!meds.length){const p=document.createElement('p');p.textContent='Noch keine Medikamente gespeichert. Erfasse ausschließlich deinen ärztlich bestätigten Plan.';box.append(p);return;}
   const sorted=[...meds].sort((a,b)=>a.name.localeCompare(b.name,'de'));
   const table=document.createElement('table');table.className='med24-table';
   const header=document.createElement('thead'),hr=document.createElement('tr');for(const x of ['Medikament','Ärztliche Dosis','Einnahme / Behandlung','Nächster Termin']){const th=document.createElement('th');th.textContent=x;hr.append(th)}header.append(hr);table.append(header);
   const body=document.createElement('tbody');for(const m of sorted){const tr=document.createElement('tr');const values=[m.name,m.dose||'Nicht angegeben',[m.route||m.kind||'',(m.slots||[]).join(' / ')||m.time||'nach ärztlichem Plan',m.interval?'alle '+m.interval+' Tage':''].filter(Boolean).join(' · '),fmt(m.next)];for(const x of values){const td=document.createElement('td');td.textContent=esc(x);tr.append(td)}body.append(tr)}table.append(body);box.append(table);
 }
 async function sync(){try{const records=await SEC.list('suite');meds=records.filter(x=>x.type==='meds').map(x=>x.value);render()}catch(e){const box=$('med24-overview');if(box)box.textContent='Medikamentenplan kann nicht geladen werden: '+e.message;}}
 window.addEventListener('asthma:meds-change',e=>{meds=e.detail?.meds||[];render()});
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='suite')sync()});
 sync();
 $('med24-print')?.addEventListener('click',()=>{if(!meds.length){alert('Bitte zuerst deine ärztlich verordneten Medikamente speichern.');return;}if(!confirm('Der Ausdruck bzw. das PDF enthält unverschlüsselte Gesundheitsdaten. Fortfahren?'))return;document.body.classList.add('med24-print');try{window.print()}finally{setTimeout(()=>document.body.classList.remove('med24-print'),700)}});
 SEC.list('suite').then(rows=>{meds=rows.filter(x=>x.type==='meds').map(x=>x.value);render()}).catch(()=>{});
 $('med-form')?.addEventListener('reset',()=>{setTimeout(()=>{$('med24-edit-id').value='';$('med24-submit').textContent='Medikament speichern'},0)});
})();
