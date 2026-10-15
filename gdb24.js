'use strict';
/* GdB Orientierung, VersMedV B 8.5, no automated benefits claim. All edits local AES-GCM. */
(()=>{
 const $=id=>document.getElementById(id),SEC=window.ASTHMA_SECURITY;
 const keys=['current','attacks','permanent','participation','other'];let saved=null;
 function extract(){const g={id:'current',current:$('gdb24-current').value,attacks:$('gdb24-attacks').value,permanent:$('gdb24-permanent').value,participation:$('gdb24-participation').value,other:$('gdb24-other').value.trim().slice(0,650)};return g;}
 function read(g){for(const [id,k] of [['gdb24-current','current'],['gdb24-attacks','attacks'],['gdb24-permanent','permanent'],['gdb24-participation','participation'],['gdb24-other','other']])if(g[k]!=null)$(id).value=g[k];}
 const node=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n};
 function assess(g){const p=window.ASTHMA_PROFILE_BRIDGE?.get?.()||{};
 let range='Die vorhandenen Angaben reichen für eine numerische Orientierung nicht aus.';
 if(g.attacks==='rare')range='Bei seltenen/leichten Asthmaanfällen ohne dauerhafte Einschränkung nennt Nr. 8.5 eine Spanne von 0–20.';
 if(g.attacks==='frequent')range='Bei häufigen (mehrmals monatlich) und/oder schweren Anfällen ohne dauerhafte Einschränkung nennt Nr. 8.5 die Spanne 30–40.';
 if(g.attacks==='series')range='Bei Serien schwerer Asthmaanfälle ohne dauerhafte Einschränkung nennt Nr. 8.5 den Wert 50.';
 if(g.permanent==='yes')range+=' Eine ärztlich gesicherte dauerhafte Lungenfunktionseinschränkung ist zusätzlich nach den maßgeblichen Grundsätzen zu berücksichtigen; die App rechnet daraus keinen festen GdB.';
 if(g.permanent==='unknown')range+=' Ob eine dauerhafte Lungenfunktionsstörung vorliegt, muss ärztlich geklärt werden.';
 const cur=g.current||'nicht angegeben';
 const needReview=(g.attacks==='frequent'||g.attacks==='series'||g.permanent==='yes'||g.participation==='marked'||g.participation==='severe');
 const rec=needReview?'Eine ärztlich begründete Neubewertung erscheint prüfenswert. Ob GdB 50 oder mehr anerkannt wird, entscheidet allein die zuständige Behörde auf Grundlage aller Befunde.':'Für eine Neubewertung sind insbesondere Häufigkeit und Schwere der Anfälle, dauerhafte Funktionseinschränkungen sowie Auswirkungen auf die Teilhabe zu dokumentieren.';
 const intro='Unverbindliche Orientierung nach VersMedV, Teil B Nr. 8.5. Bereits festgestellter GdB: '+cur+'.';
 const values=[p.fev1!=null?'FEV₁ zuletzt im eigenen Profil: '+p.fev1+' % vom Soll.':'Kein bestätigter FEV₁-Prozentwert aus dem Profil übernommen.',p.fvc!=null?'FVC im Profil: '+p.fvc+' % vom Soll.':''];
 return {intro,range,rec,values:values.filter(Boolean)};
 }
 function render(g){const x=assess(g),box=$('gdb24-result');box.replaceChildren();for(const paragraph of [x.intro,...x.values,x.range,x.rec,'Ein einzelner FEV₁-Prozentwert belegt weder eine dauerhafte Lungenfunktionseinschränkung noch einen bestimmten GdB. Ein Änderungsantrag führt zur erneuten Prüfung aller relevanten Gesundheitsstörungen.'])box.append(node('p',paragraph));}
 async function init(){try{const rows=await SEC.list('suite');saved=rows.find(x=>x.type==='gdb24'&&x.value?.id==='current')?.value;if(saved)read(saved);else{const g=SEC.profileGet?.()?.gdb;const option=[...$('gdb24-current').options].find(x=>x.value===String(g));if(option)$('gdb24-current').value=String(g);}render(saved||extract())}catch(e){$('gdb24-result').textContent='GdB-Angaben konnten nicht geladen werden: '+e.message}}
 $('gdb24-form')?.addEventListener('submit',async e=>{e.preventDefault();try{const g=extract();await SEC.put('suite',{key:'gdb24/current',type:'gdb24',value:g},'gdb24/current');saved=g;render(g)}catch(err){$('gdb24-result').textContent='Speichern fehlgeschlagen: '+err.message}});
 $('gdb24-copy')?.addEventListener('click',async()=>{const g=saved||extract(),a=assess(g);const p=window.ASTHMA_PROFILE_BRIDGE?.get?.()||{};
 const content=[ 'Betreff: Antrag auf Neufeststellung / Überprüfung des Grades der Behinderung', '', 'Hiermit beantrage ich die Überprüfung meines bisher festgestellten Grades der Behinderung wegen einer möglichen Änderung des Gesundheitszustands.','Mein bisheriger GdB: '+(g.current||'bitte ergänzen')+'.', 'Diagnose: Bronchialasthma (ärztliche Nachweise liegen bei bzw. werden angefordert).',...(p.fev1!=null?['Zuletzt eingetragener FEV₁-Sollwert: '+p.fev1+' % (Befunddatum bitte ergänzen).']:[]),'Dokumentierte Beschwerden und Einschränkungen (bitte anhand ärztlicher Unterlagen konkretisieren):',g.other||'[Beschwerden, Häufigkeit und Auswirkungen ergänzen]','', 'Ich bitte um Anforderung bzw. Berücksichtigung der aktuellen fachärztlichen Befunde und schriftliche Entscheidung.','', 'Mit freundlichen Grüßen','[Name / Anschrift / Datum / Unterschrift]' ].join('\n');
 if(!confirm('Dieser Entwurf enthält Gesundheitsangaben und ist beim Kopieren vorübergehend unverschlüsselt in der Zwischenablage. Fortfahren?'))return;
 try{await navigator.clipboard.writeText(content);alert('Unverbindlichen Text kopiert. Bitte inhaltlich prüfen und persönlich beim zuständigen Träger einreichen.')}catch{alert('Kopieren nicht verfügbar. Verwende stattdessen die offizielle ELSA-Seite und beschreibe deine Befunde dort.')}
 });
 init();
})();
