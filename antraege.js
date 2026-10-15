'use strict';
(()=>{
 const catalog=window.ASTHMA_APPLICATIONS||[];
 const $=id=>document.getElementById(id);
 const list=$('apply-list'),editor=$('apply-editor'),preview=$('apply-preview'),pr=$('antrag-print');
 if(!list||!editor)return;
 let selected=null;
 let visibleCount=8;
 const categories=[...new Set(catalog.map(x=>x.cat))];
 const safeUrl=u=>{try{const x=new URL(u);return x.protocol==='https:'?x.href:null}catch{return null}};
 const normalize=s=>String(s||'').normalize('NFKD').toLocaleLowerCase('de-DE');
 const txt=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=text;return el};
 function recommendation(x){
   const g=Number($('gdb')?.value||30);
   const eq=$('equal')?.value==='yes';
   if(x.minGdb && (g<x.minGdb || g>x.maxGdb))return 'Nur bei GdB 30/40 – derzeit nicht passend';
   if(x.cat==='Arbeitsplatz'&&g>=50)return 'Arbeitsplatz – besonders relevant bei Schwerbehinderung';
   if(x.cat==='Arbeitsplatz'&&(g===30||g===40)&&eq)return 'Arbeitsplatz – Gleichstellung ausgewählt';
   if(x.cat==='Hilfsmittel'||x.cat==='Physio & Therapie')return 'GdB-unabhängig: Bedarf entscheidet';
   return 'Individuelle Voraussetzungen prüfen';
 }
 function render(){
   const query=normalize($('apply-search').value.trim()),cat=$('apply-category').value;
   const matches=catalog.filter(x=>(cat==='all'||x.cat===cat)&&normalize([x.title,x.sub,x.need,x.way,x.context,x.who].join(' ')).includes(query));
   const shown=matches.slice(0,visibleCount);
   $('apply-count').textContent=`${shown.length} von ${matches.length} passenden Leistungen angezeigt (${catalog.length} insgesamt)`;
   $('apply-more').hidden=matches.length<=visibleCount;
   $('apply-more').textContent=`Weitere Leistungen anzeigen (${matches.length-visibleCount} übrig)`;
   const frag=document.createDocumentFragment();
   shown.forEach(x=>{
     const card=txt('article','application-item','');card.dataset.application=x.id;
     card.append(txt('span','app-category',x.cat),txt('h3','',x.title),txt('p','',x.sub),txt('p','app-path','Zuständig: '+x.who),txt('p','',recommendation(x)));
     const d=document.createElement('details'),sum=txt('summary','','Voraussetzungen, Unterlagen & Grenzen');d.append(sum);
     const help=txt('div','application-help','');
     help.append(txt('p','','Weg: '+x.way),txt('p','','Vorbereiten: '+x.need),txt('p','','Wichtig: '+x.context));
     d.append(help);card.append(d);
     const actions=txt('div','app-buttons','');
     const a=txt('a','btn btn-outline','Offizielle Stelle öffnen ↗');a.target='_blank';a.rel='noopener noreferrer';a.href=safeUrl(x.url)||'#';a.title='Offizielle Informations-, Formular- oder Antragsseite – nicht immer ein direkter Onlineantrag';actions.append(a);
     const btn=txt('button','btn btn-primary','Eigene Vorlage erstellen');btn.type='button';btn.addEventListener('click',()=>openEditor(x));actions.append(btn);const track=txt('button','btn btn-outline','In meine Antragsakte übernehmen');track.type='button';track.addEventListener('click',()=>{window.ASTHMA_NAV?.go('akte');window.dispatchEvent(new CustomEvent('asthma:create-case',{detail:{title:x.title,authority:x.who,category:x.cat}}));document.getElementById('mein-bereich')?.scrollIntoView({behavior:'smooth'});});actions.append(track);card.append(actions);frag.append(card);
   });list.replaceChildren(frag);
 }
 function letter(){
   if(!selected)return '';
   const name=$('apply-name').value.trim()||'[Vor- und Nachname]';
   const address=$('apply-address').value.trim();
   const recipient=$('apply-recipient').value.trim()||'[zuständige Stelle]';
   const ref=$('apply-ref').value.trim();
   const reason=$('apply-reason').value.trim();
   let subject='Anfrage zur Prüfung: '+selected.title;
   let intro='Hiermit bitte ich um Prüfung, ob die nachfolgende Leistung in meiner persönlichen Situation in Betracht kommt: '+selected.title+'.';
   if(selected.kind==='doctor'){
     subject='Bitte um ärztliche Prüfung / ggf. Verordnung: '+selected.title;
     intro='Ich bitte um ärztliche Prüfung, ob '+selected.title+' für mich medizinisch sinnvoll und verordnungsfähig ist. Dies ist keine ärztliche Verordnung.';
   }else if(selected.kind==='employer'){
     subject='Bitte um Prüfung von Arbeitsplatzmaßnahmen: '+selected.title;
     intro='Ich bitte um ein vertrauliches Gespräch und um Prüfung möglicher arbeitsplatzbezogener Maßnahmen zu folgendem Thema: '+selected.title+'.';
   }else if(selected.kind==='portal'){
     subject='Begleitschreiben zum offiziellen Verfahren: '+selected.title;
     intro='Ich möchte das offizielle Verfahren zu '+selected.title+' einleiten. Dieses Schreiben ersetzt die erforderlichen Originalformulare und Nachweise nicht.';
   }else if(selected.kind==='insurer'){
     subject='Bitte um Informationen und Antragstellung: '+selected.title;
     intro='Bitte teilen Sie mir den zutreffenden Antrags- bzw. Einschreibeweg für '+selected.title+' mit und prüfen Sie, welche Unterlagen im Einzelfall erforderlich sind.';
   }else if(selected.id==='widerspruch'){
     subject='Widerspruch gegen Ihren Bescheid – '+(ref||'[Aktenzeichen ergänzen]');
     intro='Hiermit lege ich gegen Ihren Bescheid Widerspruch ein. Bitte bestätigen Sie den Eingang. Eine ergänzende Begründung und Unterlagen kann ich nachreichen. Bitte beachten Sie die für meinen Bescheid geltende Rechtsbehelfsbelehrung.';
   }
   const parts=[name,address,'',recipient,'',`Datum: ${new Date().toLocaleDateString('de-DE')}`,'',subject,'','Sehr geehrte Damen und Herren,','',intro];
   if(reason)parts.push('','Meine Angaben zum konkreten Bedarf:',reason);
   if(ref)parts.push('','Mein Zeichen / Aktenzeichen: '+ref);
   if(selected.id!=='widerspruch')parts.push('','Bitte informieren Sie mich über erforderliche Nachweise, mögliche Kostenträger und das weitere Verfahren. Soweit ein förmlicher Antrag erforderlich ist, bitte ich um entsprechende Antragsunterlagen bzw. Bestätigung des Eingangs.');
   parts.push('','Mit freundlichen Grüßen',name,'','---','Unverbindliche, selbst erstellte Mustervorlage aus der App Asthma. Kein amtliches Formular und keine automatische Einreichung.');
   return parts.join('\n');
 }
 function updatePreview(){const s=letter();preview.textContent=s;pr.textContent=s}
 function openEditor(x){selected=x;$('apply-edit-title').textContent=x.title;
   $('apply-name').value='';$('apply-address').value='';$('apply-recipient').value=x.who;$('apply-ref').value='';$('apply-reason').value='';
   $('apply-action-msg').textContent='';editor.hidden=false;updatePreview();editor.scrollIntoView({block:'start',behavior:'smooth'});
 }
 $('apply-search').addEventListener('input',()=>{visibleCount=8;render()});$('apply-category').addEventListener('change',()=>{visibleCount=8;render()});
 $('apply-more').addEventListener('click',()=>{visibleCount+=8;render()});
 ['apply-name','apply-address','apply-recipient','apply-ref','apply-reason'].forEach(id=>$(id).addEventListener('input',updatePreview));
 $('apply-close').addEventListener('click',()=>{editor.hidden=true;selected=null;preview.replaceChildren();pr.replaceChildren();$('apply-action-msg').textContent='';});
 $('apply-copy').addEventListener('click',async()=>{const s=letter();if(!s)return;try{await navigator.clipboard.writeText(s);$('apply-action-msg').textContent='Vorlage kopiert. Bitte vor dem Versand prüfen.'}catch{$('apply-action-msg').textContent='Kopieren vom Browser nicht erlaubt. Text oben markieren und manuell kopieren.'}});
 $('apply-print').addEventListener('click',()=>{if(!selected)return;updatePreview();pr.hidden=false;window.print()});
 window.addEventListener('afterprint',()=>{pr.hidden=true});
 $('gdb').addEventListener('change',render);$('equal').addEventListener('change',render);
 render();
 Object.defineProperty(window,'__asthmaApplicationsTest',{value:Object.freeze({count:catalog.length,byCategory:(v)=>catalog.filter(x=>x.cat===v).length}),enumerable:false});
})();
