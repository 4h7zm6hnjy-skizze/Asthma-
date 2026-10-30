'use strict';
/* PneumoPro 3.5.7 – zentrale Scanablage und Allergieakte verbinden.
 * Keine Bilderkennung und keine automatische medizinische Interpretation.
 * Gespeicherte Originale verbleiben im bestehenden verschlüsselten Tresor.
 */
(()=>{
 const S=window.ASTHMA_SECURITY,NAV=window.ASTHMA_NAV;
 const page=document.getElementById('allergien'),form=document.getElementById('a355-form');
 if(!S||!NAV||!page||!form||document.getElementById('a357-documents'))return;
 const $=id=>document.getElementById(id);
 const el=(tag,cl,txt)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(txt!==undefined)x.textContent=String(txt);return x};
 const format=d=>/^\d{4}-\d\d-\d\d$/.test(d||'')?d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4):'Ohne Datum';
 const section=el('section','suite-subpanel');section.id='a357-documents';
 section.innerHTML='<h3>Allergie-Originalbefunde aus „Scans“</h3><p class="a355-note">Bilder und PDFs aus dem oberen Scanner werden hier angezeigt, sobald du dort „Allergien & Allergietests“ auswählst. Ein Scan ergibt noch keine überprüften Messwerte. Bitte die Zahlen manuell anhand des Originals eintragen.</p><div class="a355-actions"><button type="button" class="btn btn-primary" id="a357-open-scan">Scans oben öffnen</button><button type="button" class="btn btn-outline" id="a357-open-files">Dateien & Scannen</button></div><p id="a357-status" class="a355-note" role="status"></p><div id="a357-list" class="a355-list"></div>';
 const old=form.closest('.suite-subpanel');if(old)old.insertAdjacentElement('beforebegin',section);else page.prepend(section);
 const label=el('label','a355-wide');label.textContent='Bereits gescannten Allergiebefund mit diesem Test verknüpfen';
 const sel=el('select');sel.id='a357-link';sel.name='scanDocumentId';sel.append(new Option('Kein Scan zugeordnet',''));label.append(sel);
 const original=form.querySelector('[name="attachment"]')?.closest('label');
 if(original)original.insertAdjacentElement('beforebegin',label);
 const status=t=>{$('a357-status').textContent=t};
 function openOriginal(r){
  if(!(r.blob instanceof Blob)){status('Original ist nicht mehr lesbar.');return}
  const u=URL.createObjectURL(r.blob),a=document.createElement('a');a.href=u;a.download=r.name||'Allergiebefund';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);
 }
 function chooseDoc(r){
  sel.value=r.id;
  if(!form.elements.namedItem('date').value&&r.documentDate)form.elements.namedItem('date').value=r.documentDate;
  if(!form.elements.namedItem('provider').value){form.elements.namedItem('provider').value=(r.clinic||r.providerName||r.doctor||'').slice(0,160)}
  NAV.go('allergien');form.scrollIntoView({block:'start',behavior:'smooth'});
  status('Original zugeordnet. Die Testwerte bitte überprüfen und anschließend das Allergieformular speichern.');
 }
 async function refresh(){
  if(!S.state().unlocked)return;
  const docs=(await S.list('documents')).filter(d=>d&&d.kind==='Allergiebefund'&&d.id)
    .sort((a,b)=>String(b.documentDate||b.createdAt||'').localeCompare(String(a.documentDate||a.createdAt||'')));
  const keep=sel.value;sel.replaceChildren(new Option('Kein Scan zugeordnet',''));
  for(const r of docs)sel.append(new Option((r.name||'Allergiebefund').slice(0,90)+' · '+format(r.documentDate),r.id));
  if(docs.some(r=>r.id===keep))sel.value=keep;
  const list=$('a357-list');list.replaceChildren();
  if(!docs.length){list.append(el('p','a355-note','Noch keine Allergiebefunde im zentralen Scanner gespeichert. Oben „Scans“ → „Allergien & Allergietests“ auswählen.'));return}
  list.append(el('p','a355-note',docs.length+' gespeicherte Allergie-Originaldatei(en), lokal verschlüsselt.'));
  for(const r of docs){
   const card=el('article','a355-item');card.append(el('strong','',r.name||'Allergiebefund'),el('p','a355-note',format(r.documentDate)+' · '+(r.clinic||r.providerName||r.doctor||'Ohne Praxisangabe')));
   const buttons=el('div','a355-actions');
   const open=el('button','btn btn-outline','Original öffnen'),choose=el('button','btn btn-outline','Zum Allergietest zuordnen');
   open.type=choose.type='button';open.addEventListener('click',()=>openOriginal(r));choose.addEventListener('click',()=>chooseDoc(r));buttons.append(open,choose);card.append(buttons);list.append(card);
  }
 }
 $('a357-open-scan').addEventListener('click',()=>{
  const scanner=$('ps352-open');if(scanner){scanner.click();const allergy=document.querySelector('[data-ps352-area="allergy"]');if(allergy)allergy.click();else status('Im Scanner fehlt die Allergie-Auswahl. Bitte veröffentlichte Version 3.5.7 kontrollieren.');}
  else{NAV.go('dateien');document.querySelector('[data-dh-kind="allergie"]')?.click();status('Zentraler Scanner nicht geladen; stattdessen „Dateien & Scannen“ geöffnet.');}
 });
 $('a357-open-files').addEventListener('click',()=>{NAV.go('dateien');document.querySelector('[data-dh-kind="allergie"]')?.click()});
 window.addEventListener('asthma:secure-change',e=>{if(e.detail?.group==='documents'&&S.state().unlocked)refresh().catch(error=>status('Dokumente konnten nicht gelesen werden: '+error.message))});
 window.addEventListener('pneumopro:scan-saved',e=>{if(e.detail?.area==='allergy')refresh().catch(()=>{})});
 refresh().catch(error=>status('Allergie-Dokumente konnten nicht geladen werden: '+error.message));
 window.PNEUMOPRO_ALLERGIEN_SCAN357=Object.freeze({version:'3.5.7',documentKind:'Allergiebefund'});
})();
