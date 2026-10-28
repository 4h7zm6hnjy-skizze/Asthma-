/* Asthma 3.2.3 — lokale Kurzbefehl-Übergabe, keine Netzwerkübertragung. */
(function () {
 'use strict';
 const COUNTS=[15,17,30,90];
 function parse(input) {
  let raw=String(input||'').trim();
  if(raw.includes('#treppen='))raw=decodeURIComponent(raw.split('#treppen=')[1]);
  if(raw.length>500)throw Error('Der Übergabetext ist zu lang.');
  const parts=raw.split('|');
  if(parts.length!==5||parts[0]!=='AT1')throw Error('Bitte einen vollständigen Treppen-Übergabetext einfügen.');
  const [,stamp,nonce,n,reason]=parts;
  if(!/^20\d{12}$/.test(stamp)||!/^\d{6}$/.test(nonce)||!COUNTS.includes(Number(n))||String(Number(n))!==n)throw Error('Ungültige Treppenanzahl oder Eintragskennung.');
  const date=stamp.slice(0,4)+'-'+stamp.slice(4,6)+'-'+stamp.slice(6,8),time=stamp.slice(8,10)+':'+stamp.slice(10,12);
  const check=new Date(date+'T'+time+':'+stamp.slice(12,14));
  if(!Number.isFinite(+check)||check.getFullYear()!==Number(stamp.slice(0,4))||check.getMonth()+1!==Number(stamp.slice(4,6))||check.getDate()!==Number(stamp.slice(6,8))||check.getHours()!==Number(stamp.slice(8,10))||check.getMinutes()!==Number(stamp.slice(10,12))||check.getSeconds()!==Number(stamp.slice(12,14)))throw Error('Ungültiges Erfassungsdatum.');
  if(!reason.trim()||reason!==reason.trim()||reason.length>120||/[\x00-\x1f<>]/.test(reason))throw Error('Bitte einen gültigen Grund angeben.');
  return {id:'shortcut-'+stamp+'-'+nonce,date,time,steps:Number(n),reason,shift:'',symptoms:'',note:''};
 }
 if(typeof module==='object'&&module.exports){module.exports={parse,COUNTS};return;}
 const $=id=>document.getElementById(id);
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
 let pending='',requested=false,ready=false,dialog,stage,total,status,item=null,busy=false,gateBox;
 function capture(){
  if(location.hash==='#treppen-schnell'){requested=true;if(ready)open();}
  else if(location.hash.startsWith('#treppen=')){
   requested=true;try{pending=decodeURIComponent(location.hash.slice(9));}catch{pending='UNGÜLTIG';}
   if(ready)open();else showGate();
  }
 }
 function showGate(){
  if(!pending||gateBox)return;
  gateBox=el('aside');gateBox.className='tq-gate';
  gateBox.append(el('strong','Treppeneintrag wartet auf Bestätigung'),el('p','Entsperre deinen vorhandenen Tresor. Falls deine Daten nur in der Home-Bildschirm-App liegen: keinen neuen Tresor anlegen. Kopiere den Text und füge ihn dort unter „Treppen-Schnellauswahl“ ein.'));
  const text=el('textarea');text.value=pending;text.readOnly=true;text.setAttribute('aria-label','Treppen-Übergabetext');gateBox.append(text);
  const copy=el('button','Übergabetext kopieren');copy.type='button';copy.onclick=async()=>{try{await navigator.clipboard.writeText(text.value);copy.textContent='Kopiert – bestehende App öffnen';}catch{text.focus();text.select();copy.textContent='Text markieren und kopieren';}};gateBox.append(copy);
  $('secure-gate')?.prepend(gateBox);
 }
 function setStatus(s){status.textContent=s;}
 async function updateTotal(){
  try{const rows=await window.ASTHMA_SECURITY.list('suite');total.textContent=rows.filter(r=>r.type==='stairs'&&r.value?.date===today()).reduce((s,r)=>s+(Number(r.value.steps)||0),0).toLocaleString('de-DE')+' Stufen heute';}
  catch{total.textContent='Tagesgesamtzahl konnte nicht geladen werden.';}
 }
 function button(label,fn){const b=el('button',label);b.type='button';b.onclick=fn;return b;}
 function reset(){item=null;stage.replaceChildren();setStatus('');}
 function chooseCount(){reset();stage.append(el('h3','1 · Treppenanzahl wählen'));
  const row=el('div');row.className='tq-counts';COUNTS.forEach(n=>row.append(button(n+' Stufen',()=>chooseReason(n))));stage.append(row);
  const details=el('details'),summary=el('summary','Eintrag aus Kurzbefehl einfügen');details.append(summary);
  const field=el('textarea');field.id='tq-transfer';field.placeholder='AT1|…';field.setAttribute('aria-label','Übergabetext aus Kurzbefehle');details.append(field,button('Eintrag prüfen',()=>preview(field.value)));stage.append(details);
 }
 function chooseReason(n){reset();stage.append(el('h3','2 · Grund für '+n+' Stufen wählen'));
  const reasons=[...$('sc-reason').options].filter(o=>o.value!=='__custom__').map(o=>o.value);
  const list=el('div');list.className='tq-reasons';
  const select=reason=>{const d=new Date(),stamp=[d.getFullYear(),d.getMonth()+1,d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds()].map((v,i)=>i?String(v).padStart(2,'0'):String(v)).join('');const nums=crypto.getRandomValues(new Uint32Array(1));preview('AT1|'+stamp+'|'+(100000+nums[0]%900000)+'|'+n+'|'+reason);};
  reasons.forEach(r=>list.append(button(r,()=>select(r))));stage.append(list);
  const label=el('label','Anderer Grund');const custom=el('input');custom.maxLength=120;label.append(custom);stage.append(label,button('Eigenen Grund übernehmen',()=>select(custom.value.trim())),button('Zurück zur Anzahl',chooseCount));
 }
 function preview(raw){
  try{item=parse(raw);}catch(e){setStatus(e.message);return;}
  stage.replaceChildren();setStatus('');stage.append(el('h3','Eintrag bestätigen'),el('p',item.steps+' Stufen · '+item.reason),el('p','Erfasst am '+item.date.split('-').reverse().join('.')+' um '+item.time+' Uhr'));
  stage.append(el('p','Datum und Uhrzeit dienen nur der Zuordnung. Es wird keine Dauer gemessen. Beschwerden und Schicht bleiben ohne Angabe.'));
  const save=button('In diesem Tresor speichern',()=>saveItem(save));save.id='tq-save';stage.append(save,button('Andere Auswahl',chooseCount));
 }
 async function saveItem(b){
  if(busy||!item)return;busy=true;b.disabled=true;
  const record={...item};
  try{
   const S=window.ASTHMA_SECURITY;if(!S.state().unlocked)throw Error('Bitte den Tresor erneut entsperren.');
   const key='stairs/'+record.id,existing=await S.get('suite',key);
   if(existing){
    if(existing.value.steps!==record.steps||existing.value.reason!==record.reason)throw Error('Diese Kennung gehört bereits zu einem anderen Eintrag. Bitte den Kurzbefehl neu starten.');
    setStatus('Dieser Eintrag ist bereits gespeichert. Er wurde nicht doppelt gezählt.');
   }else{
    const now=new Date().toISOString();await S.put('suite',{key,type:'stairs',value:{...record,createdAt:now,updatedAt:now}},key);
    setStatus(record.steps+' Stufen · '+record.reason+' gespeichert.');
   }
   pending='';gateBox?.remove();gateBox=null;
   if(location.hash.startsWith('#treppen'))history.replaceState(null,'',location.pathname+location.search);
   stage.replaceChildren(button('Weiteren Eintrag erfassen',chooseCount));item=null;await updateTotal();await window.ASTHMA_STAIRS?.refresh();
  }catch(e){setStatus('Nicht gespeichert: '+e.message);b.disabled=false;}finally{busy=false;}
 }
 function open(){
  if(!ready)return;updateTotal();chooseCount();if(pending)preview(pending);
  if(!dialog.open)dialog.showModal();
 }
 function mount(){
  if(ready||!$('sc-work-panel')||!document.documentElement.classList.contains('app-unlocked'))return;
  ready=true;dialog=el('dialog');dialog.id='tq-dialog';dialog.setAttribute('aria-labelledby','tq-title');
  const title=el('h2','Treppen-Schnellauswahl');title.id='tq-title';total=el('p');total.className='tq-total';stage=el('div');status=el('p');status.id='tq-status';status.setAttribute('role','status');
  dialog.append(title,total,stage,status,button('Schließen',()=>{if(!busy)dialog.close();}));dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});$('secure-application').append(dialog);
  const panel=el('section');panel.className='tq-panel';panel.append(el('h4','Treppen-Schnellauswahl'),button('Anzahl und Grund wählen / Eintrag einfügen',open));
  const help=el('details');help.id='tq-help';const helpTitle=el('summary','Kurzbefehl am iPhone einrichten');const helpBody=el('div');helpBody.className='tq-help-body';helpBody.innerHTML="<h4>Treppen per Kurzbefehl · Asthma 3.2.3</h4>\n<p>15 / 17 / 30 / 90 Stufen und den Grund getrennt wählen. Keine Dauer, kein Timer. Gespeichert wird nach Bestätigung im entsperrten vorhandenen Tresor.</p>\n<h5>1. Zuerst das GitHub-Update installieren</h5>\n<ol><li>Vorher in der bestehenden App eine verschlüsselte Sicherung erstellen.</li><li>Die ZIP-Datei entpacken. Den Inhalt des Ordners <b>GitHub_Update</b> in genau den Repository-Ordner hochladen, in dem bereits index.html liegt. Bestehende gleichnamige Dateien ersetzen. Nicht die ZIP-Datei selbst hochladen und keine zusätzlichen Unterordner anlegen.</li><li>GitHub Pages die Veröffentlichung abschließen lassen. In der App unter Einstellungen „Nach Updates suchen“ und „Update installieren“ wählen. Danach Version 3.2.3 prüfen. Website-Daten nicht löschen.</li><li>Unter Arbeit → Treppenzähler erscheint „Treppen-Schnellauswahl“. Anzahl und Grund ausprobieren. Den Testeintrag danach bei Bedarf über die vorhandene Bearbeiten-/Löschen-Funktion entfernen.</li></ol>\n<h5>2. Einfache Einrichtung – zwei Aktionen</h5>\n<p>Diese Variante öffnet die Auswahl in der App/Webseite. Sie zeigt nicht das native Kurzbefehle-Menü. Gegebenenfalls zuerst iPhone und Tresor entsperren.</p>\n<ol><li>In Arbeit → Treppenzähler → Treppen-Schnellauswahl den Button <b>Kurzbefehl-Link kopieren</b> verwenden. Dieser Link ist für deine Adresse bereits fertig. Alternativ die normale Adresse deiner Asthma-App kopieren (GitHub-Pages-Webseite, nicht die github.com-Codeansicht). Am Ende einen bestehenden #…-Teil entfernen und <code>#treppen-schnell</code> ergänzen. Beispiel: <code>https://DEIN-NAME.github.io/DEIN-REPOSITORY/#treppen-schnell</code>. Die Platzhalter durch deine echte Adresse ersetzen.</li><li>Apple „Kurzbefehle“ öffnen, +, neuer Kurzbefehl. Name: <b>Treppen erfassen</b>.</li><li>Aktion <b>URL</b> hinzufügen und die vollständige Adresse einsetzen.</li><li>Aktion <b>URLs öffnen</b> hinzufügen, als Eingabe die vorherige URL verwenden. Speichern.</li></ol>\n<h5>3. Auswahl direkt in Kurzbefehle – wie in der Vorschau</h5>\n<p>Für zwei native Auswahlmenüs diesen ausführlicheren Kurzbefehl anstelle der einfachen Variante erstellen. Aktionsnamen können je nach iOS-Version leicht abweichen. Eckige Platzhalter unten sind einzusetzende <b>Variablen</b>, kein wörtlich abzutippender Text.</p>\n<ol>\n<li>Aktion <b>Liste</b>: vier einzelne Einträge <code>15</code>, <code>17</code>, <code>30</code>, <code>90</code>.</li>\n<li><b>Aus Liste auswählen</b>, Eingabe: vorige Liste, Titel „Treppenanzahl“, Mehrfachauswahl aus.</li>\n<li><b>Variable festlegen</b>: <code>Stufen</code> = ausgewähltes Element.</li>\n<li>Neue <b>Liste</b> mit je einem Eintrag: <pre>Kühlanlage\nMaterialscheine\nWC\nFertigteile runtergefahren\nVerpackung geholt\nPappe geschnitten\nSpangen</pre>Eigene Gründe dürfen ergänzt werden, höchstens 120 Zeichen, kein senkrechter Strich |.</li>\n<li><b>Aus Liste auswählen</b>, Eingabe: zweite Liste, Titel „Grund“, Mehrfachauswahl aus.</li>\n<li><b>Variable festlegen</b>: <code>Grund</code> = zweite Auswahl.</li>\n<li><b>Aktuelles Datum</b>, danach <b>Datum formatieren</b>: Format „Benutzerdefiniert“, Formatzeichenfolge <code>yyyyMMddHHmmss</code>. Groß-/Kleinschreibung beachten! Variable <code>Zeitstempel</code> auf dieses Ergebnis setzen. Dies dient nur dem Datum und dem Schutz vor doppelten Einträgen; keine Dauer wird gemessen.</li>\n<li><b>Zufallszahl</b> zwischen <code>100000</code> und <code>999999</code>. Variable <code>Kennung</code> auf das Ergebnis setzen.</li>\n<li><b>Text</b> mit exakt einer Zeile: <pre>AT1|[Zeitstempel]|[Kennung]|[Stufen]|[Grund]</pre>Alle vier eckigen Platzhalter durch die entsprechenden Kurzbefehle-Variablen ersetzen. Beispiel eines fertigen Textes (nicht als feste Vorlage verwenden): <code>AT1|20261027143000|654321|30|Kühlanlage</code>.</li>\n<li><b>Variable festlegen</b>: <code>Übergabe</code> = Text aus dem vorherigen Schritt.</li>\n<li><b>In Zwischenablage kopieren</b>: Eingabe ausdrücklich <code>Übergabe</code>. Wenn angeboten „Nur lokal“ einschalten und Ablauf auf einige Minuten begrenzen.</li>\n<li><b>URL codieren</b>: Eingabe ausdrücklich <code>Übergabe</code>, Modus „Codieren“. Variable <code>CodierteÜbergabe</code> auf das Ergebnis setzen.</li>\n<li><b>URL</b>: <code>https://DEINE-ECHTE-APP-ADRESSE/#treppen=[CodierteÜbergabe]</code>. Die echte Basisadresse deiner App einsetzen; [CodierteÜbergabe] als Variable einfügen. Kein Leerzeichen, kein zweites # und kein bestehender URL-Parameter mit persönlichen Daten.</li>\n<li><b>URLs öffnen</b>: die URL aus dem letzten Schritt öffnen. Kurzbefehl speichern.</li>\n</ol>\n<p>Nach den zwei Auswahlen öffnet sich die Webseite. Vorhandenen Tresor entsperren, Anzahl/Grund prüfen und <b>In diesem Tresor speichern</b> tippen. Derselbe Übergabetext wird in diesem Tresor nur einmal gezählt, solange der Eintrag vorhanden ist. Ein neu gestarteter Kurzbefehl erstellt einen neuen Eintrag.</p>\n<h5>4. Auf den Sperrbildschirm legen</h5>\n<ol><li>iPhone entsperren, Sperrbildschirm lange drücken → Anpassen → Sperrbildschirm.</li><li>Unten eine der belegten Steuerelement-Flächen über Minus entfernen, dann Plus.</li><li>„Kurzbefehl“ suchen und als auszuführenden Kurzbefehl „Treppen erfassen“ wählen → Fertig.</li><li>Zum Start das Steuerelement betätigen. Face ID bzw. Entsperren kann erforderlich sein. Alternativ denselben Kurzbefehl im Kontrollzentrum hinterlegen.</li></ol>\n<h5>Wenn Safari statt der bisherigen App öffnet</h5>\n<p>Safari und die installierte Home-Bildschirm-App können getrennte Datenspeicher haben. Wenn die bisherigen Daten fehlen, <b>keinen neuen Tresor anlegen</b>. Die vorhandene App über ihr gewohntes Symbol öffnen, entsperren → Arbeit → Treppen-Schnellauswahl → „Eintrag aus Kurzbefehl einfügen“. Übergabetext aus der Zwischenablage einfügen → Eintrag prüfen → speichern. Der Übergabetext ist auch an der Anmeldeseite sichtbar und kopierbar. Diese Variante funktioniert ohne Zugriff auf Safari-Daten.</p>\n<p>Die Tagesgesamtzahl steht in der App und nach dem Speichern in der Schnellauswahl. Sie wird nicht dauerhaft als Sperrbildschirm-Widget angezeigt. Es gibt keine automatische Hintergrundsynchronisierung.</p>\n<h5>Offline und Datenschutz</h5>\n<p>Die neue App-Version einmal online laden, damit die Dateien im Offline-Cache liegen. Danach funktioniert die Auswahl im bereits eingerichteten Browser/App-Speicher offline. Das Öffnen eines Links durch iOS bei fehlendem Netz muss am Gerät geprüft werden; alternativ die installierte App öffnen und den Übergabetext einfügen.</p>\n<p>Der Übergabetext enthält Anzahl, Grund, Erfassungsdatum und eine Zufallskennung, kein Passwort. Er liegt kurzzeitig unverschlüsselt in der Zwischenablage und gegebenenfalls im URL-Fragment. Fragmente werden nicht als Teil der HTTP-Anfrage an GitHub gesendet, können aber im Browserverlauf oder in Browser-Synchronisierung sichtbar sein. Nach erfolgreicher Übernahme entfernt die App das Fragment aus dem aktuellen Verlaufseintrag. Den Link nicht öffentlich teilen. Die Speicherung erfolgt im vorhandenen AES-GCM-Tresor.</p>\n<h5>Lieferumfang und Grenzen</h5>\n<p>Dies ist ein Update auf Grundlage der bereitgestellten Datei „Asthma--main 5.zip“ (App-Metadaten 3.1.8). Es enthält nur die neuen/geänderten Dateien, keine privaten Importdaten aus dem Ausgangsarchiv. Die Wiederherstellungsreparatur aus 3.2.2 bleibt enthalten.</p>\n<p>Eine fertig signierte .shortcut-Datei oder ein iCloud-Installationslink ist nicht enthalten. Hier steht kein Apple-Signierungsdienst zur Verfügung. Die oben beschriebenen Aktionen müssen einmal in Apple Kurzbefehle angelegt werden. Echte iPhone-Ausführung, Sperrbildschirm-Menü und Safari/PWA-Übergang sind noch am Gerät zu prüfen.</p>\n<p>Apple-Dokumentation: <a href=\"https://support.apple.com/guide/shortcuts/apdd7bf369da/ios\">Auswahlmenüs in Kurzbefehle</a>; <a href=\"https://developer.apple.com/videos/play/wwdc2021/10232/\">Signieren und Teilen von Kurzbefehlen</a>.</p>";help.append(helpTitle,helpBody);panel.append(help);
  const linkLabel=el('label','Dein Link für den einfachen Kurzbefehl');const linkField=el('input');linkField.type='url';linkField.readOnly=true;linkField.value=new URL('./',location.href).href+'#treppen-schnell';linkLabel.append(linkField);panel.append(linkLabel,button('Kurzbefehl-Link kopieren',async()=>{try{await navigator.clipboard.writeText(linkField.value);}catch{linkField.focus();linkField.select();}}));
  $('sc-work-panel').prepend(panel);
  const home=$('sc-home-tile');if(home)home.append(button('Schnellauswahl',open));
  if(requested)open();
 }
 function init(){capture();new MutationObserver(mount).observe(document.documentElement,{attributes:true,attributeFilter:['class']});mount();}
 window.addEventListener('hashchange',capture);
 document.addEventListener('visibilitychange',()=>{if(ready&&dialog.open&&!document.hidden)updateTotal();});
 window.addEventListener('asthma:secure-change',e=>{if(ready&&dialog.open&&e.detail?.group==='suite')updateTotal();});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
