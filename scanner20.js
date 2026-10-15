'use strict';
/* Asthma 2.0 iPhone scanner helper: native Live Text only, no remote OCR. */
(()=>{
 const $=id=>document.getElementById(id),btn=$('scan20-native'),raw=$('scan-raw'),help=$('scan20-help');
 if(!btn||!raw)return;
 const showDetails=()=>{const box=raw.closest('details');if(box)box.open=true;};
 function focus(){window.ASTHMA_NAV?.go('befunde', {scroll:false});showDetails();
  // iOS allows focusing a textarea in direct user gestures; the OS controls its Live Text menu.
  raw.scrollIntoView({behavior:'smooth',block:'center'});raw.focus({preventScroll:true});
  if(help)help.textContent='Im Textfeld länger drücken und „Text scannen“ auswählen. Alternativ in Fotos mit Live Text kopieren und hier einfügen. Dann „Text auswerten“ antippen.';
 }
 btn.addEventListener('click',focus);
 $('scan20-selftest')?.addEventListener('click',()=>{
   window.ASTHMA_NAV?.go('befunde',{scroll:false});showDetails();
   const example=['Getestet: 17.09.2026','FEV1 l 4,66 2,52 54%','FVCex l 5,73 2,95 51%','FVCin l 5,73 3,06 53%','FEV1/FVC % 80 85 106%'].join('\n');
   raw.value=example;$('scan-reparse').click();
   const v1=$('scan-fev1-percent').value,v2=$('scan-fvc-percent').value;
   help.textContent=v1==='54'&&v2==='51'?'Selbsttest erfolgreich: Die Tabellenzuordnung funktioniert. Das Testbeispiel NICHT als eigenen Befund speichern. Falls dein Foto scheitert, liegt es an der Texterfassung.':'Selbsttest fehlgeschlagen: Die Tabellenzuordnung ist fehlerhaft.';
 });
 // This is deliberately not an auto-OCR claim: camera API cannot trigger Apple Vision from a PWA.
 const gallery=$('scan-gallery'),cam=$('scan-camera');
 [gallery,cam].forEach(f=>f?.addEventListener('change',()=>{
   if(!f.files?.length)return;
   help.textContent='Bild geladen. iPhone-Safari erkennt daraus nicht automatisch den Text. Nutze die iPhone-Texterkennung über den Button oben oder kopiere den Text aus „Fotos“. Die Zahlen werden danach kontrollierbar zugeordnet.';
 }));
 // Allow documented supported native TextDetector to remain usable; hide misleading fallback entirely if not present.
 const manual=$('scan-start');if(manual&&!('TextDetector' in window)){manual.hidden=true;manual.disabled=true;}
 // Keyboard UX: recognized text is never automatically saved.
 raw.addEventListener('paste',()=>{if(help)help.textContent='Text eingefügt. Bitte „Text auswerten“ drücken und jede Zahl am Original prüfen.'});
})();
