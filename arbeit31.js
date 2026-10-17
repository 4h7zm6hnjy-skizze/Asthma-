'use strict';
/* Asthma-App: Rechte & Pflichten im Arbeitsleben, 30-Fragen-Check, persönliche Orientierung.
   Keine automatische Rechtsentscheidung; Profil nur im vorhandenen AES-GCM-Tresor.
   Amtliche Links wurden am 17.10.2026 geprüft. Keine Übertragung von Antworten. */
(()=>{
 const SEC=window.ASTHMA_SECURITY;
 const page=document.getElementById('arbeit');
 if(!page||!SEC?.state?.().unlocked||!SEC.updateProfile||document.getElementById('a31-panel'))return;
 const css=document.createElement('link');css.rel='stylesheet';css.href='./arbeit31.css';document.head.append(css);
 const el=(tag,cl,txt)=>{const e=document.createElement(tag);if(cl)e.className=cl;if(txt!==undefined)e.textContent=String(txt);return e};
 const $=id=>document.getElementById(id);
 const sources=[
  {id:'s151',name:'§ 151 SGB IX – Gleichstellung',url:'https://www.gesetze-im-internet.de/sgb_9_2018/__151.html'},
  {id:'s164',name:'§ 164 Abs. 2, 4 SGB IX – Arbeitgeberpflichten und Arbeitsgestaltung',url:'https://www.gesetze-im-internet.de/sgb_9_2018/__164.html'},
  {id:'s167',name:'§ 167 Abs. 1, 2 SGB IX – Prävention und BEM',url:'https://www.gesetze-im-internet.de/sgb_9_2018/__167.html'},
  {id:'s178',name:'§ 178 SGB IX – Schwerbehindertenvertretung',url:'https://www.gesetze-im-internet.de/sgb_9_2018/__178.html'},
  {id:'s185',name:'§ 185 SGB IX – begleitende Hilfen, Förderungen',url:'https://www.gesetze-im-internet.de/sgb_9_2018/__185.html'},
  {id:'a3',name:'§ 3 ArbSchG – Arbeitsschutz; Kosten trägt Arbeitgeber',url:'https://www.gesetze-im-internet.de/arbschg/__3.html'},
  {id:'a11',name:'§ 11 ArbSchG – Arbeitsmedizinische Vorsorge',url:'https://www.gesetze-im-internet.de/arbschg/__11.html'},
  {id:'a12',name:'§ 12 ArbSchG – Arbeitsplatzbezogene Unterweisung',url:'https://www.gesetze-im-internet.de/arbschg/__12.html'},
  {id:'a5',name:'§ 5 ArbSchG – Gefährdungsbeurteilung',url:'https://www.gesetze-im-internet.de/arbschg/__5.html'},
  {id:'a15',name:'§ 15 ArbSchG – Pflichten Beschäftigter',url:'https://www.gesetze-im-internet.de/arbschg/__15.html'},
  {id:'a16',name:'§ 16 ArbSchG – Gefahren melden',url:'https://www.gesetze-im-internet.de/arbschg/__16.html'},
  {id:'a17',name:'§ 17 ArbSchG – Beschwerden und Arbeitsschutzvorschläge',url:'https://www.gesetze-im-internet.de/arbschg/__17.html'},
  {id:'gewo',name:'§ 106 GewO – Weisungsrecht unter Rücksicht auf Behinderungen',url:'https://www.gesetze-im-internet.de/gewo/__106.html'},
  {id:'agg7',name:'§ 7 AGG – Benachteiligungsverbot',url:'https://www.gesetze-im-internet.de/agg/__7.html'},
  {id:'agg12',name:'§ 12 AGG – Schutzmaßnahmen Arbeitgeber',url:'https://www.gesetze-im-internet.de/agg/__12.html'},
  {id:'agg15',name:'§ 15 AGG – Entschädigung / Schadensersatz (Fristen prüfen)',url:'https://www.gesetze-im-internet.de/agg/__15.html'},
  {id:'agg13',name:'§ 13 AGG – betriebliches Beschwerderecht',url:'https://www.gesetze-im-internet.de/agg/__13.html'},
  {id:'baua',name:'BAuA – ASR A3.5 und hohe Raumtemperaturen',url:'https://www.baua.de/DE/Themen/Arbeitsgestaltung/Physikalische-Faktoren/Klima-am-Arbeitsplatz/Schutzmassnahmen-hohe-Raumtemperaturen'},
  {id:'lwl',name:'LWL-Inklusionsamt – behinderungsgerechte Arbeitsplatzgestaltung',url:'https://www.lwl-inklusionsamt-arbeit.de/de/beschaeftigung/foerderungen-arbeitgeberinnen-und-arbeitgeber/behinderungsgerechte-arbeitsgestaltung/'},
  {id:'lwlt',name:'LWL – technischer Beratungsdienst',url:'https://www.lwl-inklusionsamt-arbeit.de/de/beratung/technische-beratung/'},
  {id:'drv',name:'DRV – berufliche Rehabilitation und technische Hilfen',url:'https://www.deutsche-rentenversicherung.de/DRV/DE/Reha/Berufliche-Reha/berufliche-reha.html'},
  {id:'drvform',name:'DRV – Antrag Berufshilfsmittel und Arbeitshilfen',url:'https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/Formularpakete/01_versicherte/reha/_DRV_Paket_Rehabilitation_Hilfsmittel_Arbeitshilfe.html'},
  {id:'ba',name:'Bundesagentur – Hilfen im Berufsalltag',url:'https://www.arbeitsagentur.de/menschen-mit-behinderungen/spezielle-hilfe-und-unterstuetzung/hilfen-im-berufsalltag'}
 ];
 const groups=[
   {id:'basis',name:'1. Gleichstellung, Aufgaben & Informationen',intro:'Welche Rechte eröffnet dein Status, was weiß der Arbeitgeber und welche Tätigkeit wird tatsächlich verlangt?'},
   {id:'belastung',name:'2. Hitze, Atemluft & körperliche Belastung',intro:'Dokumentiere die tatsächlichen Arbeitsbedingungen. Ein hoher Wert oder Beschwerden allein beweisen keine Pflichtverletzung.'},
   {id:'schutz',name:'3. Gefährdungsbeurteilung & Arbeitsmedizin',intro:'Wichtig ist, was geprüft, umgesetzt und auf Wirksamkeit kontrolliert wurde.'},
   {id:'anpassung',name:'4. Anpassungen, Pausen & Hilfsmittel',intro:'Berücksichtige sowohl technische Maßnahmen als auch Arbeitsorganisation und alternative Tätigkeiten.'},
   {id:'bem',name:'5. BEM, Beteiligung & Vertraulichkeit',intro:'Ein BEM-Angebot ist nicht dasselbe wie eine erfolgreiche Umsetzung konkreter Maßnahmen.'},
   {id:'umgang',name:'6. Umgang, Benachteiligung & eigene Mitwirkung',intro:'Trenne nachweisbare Einzelereignisse von Vermutungen und dokumentiere deine eigenen Schutzbeiträge.'}
 ];
 const q=[
   {g:'basis',id:'eq',label:'Ist deine Gleichstellung mit schwerbehinderten Menschen durch die Agentur für Arbeit bewilligt?',hint:'Der GdB allein genügt nicht; der Bescheid ist entscheidend.',refs:['s151'],options:[['yes','Ja, bewilligt'],['no','Nein'],['open','Beantragt / ungeklärt']]},
   {g:'basis',id:'known',label:'Kennt dein Arbeitgeber deine arbeitsbezogenen Einschränkungen?',hint:'Funktionelle Grenzen zählen; eine vollständige Diagnoseakte ist grundsätzlich nicht nötig.',refs:['s164','a5'],options:[['yes','Ja'],['partial','Teilweise'],['no','Nein'],['unknown','Unklar']]},
   {g:'basis',id:'restrictions',label:'Liegen aktuelle ärztliche Empfehlungen zu Belastungen wie Hitze, Staub, Gehen oder Schichtarbeit vor?',hint:'Es geht nur um arbeitsbezogene Einschränkungen und Empfehlungen, nicht um eine Veröffentlichung der Krankenakte.',refs:['a11','s164'],options:[['yes','Ja, schriftlich'],['oral','Nur mündlich'],['no','Nein'],['unknown','Weiß ich nicht']]},
   {g:'basis',id:'role',label:'Entsprechen die dir tatsächlich übertragenen Aufgaben deinem Vertrag und deiner gesundheitlichen Belastbarkeit?',hint:'Arbeitsvertrag und Direktionsrecht sind gemeinsam zu betrachten.',refs:['gewo','s164'],options:[['yes','Ja'],['partial','Teilweise / wechselnde Tätigkeiten'],['no','Nein, es gibt konkrete Probleme'],['unknown','Unklar']]},
   {g:'basis',id:'privacy',label:'Wie geht der Betrieb mit deinen Gesundheitsinformationen um?',hint:'Frage nach Zugang, Zweck und Vertraulichkeit; keine unnötigen Diagnosedetails in die Auswertung eintragen.',refs:['s167'],options:[['confidential','Vertraulich und nachvollziehbar'],['unclear','Unklar'],['concern','Ich habe konkrete Datenschutzbedenken'],['na','Nicht einschätzbar']]},
   {g:'belastung',id:'heat',label:'Wie heiß ist es bei deiner Tätigkeit tatsächlich, wenn du dort arbeitest?',hint:'Bitte nur gemessene oder nachvollziehbar beobachtete Werte wählen; diese allein ersetzen keine Gefährdungsbeurteilung.',refs:['baua','a5'],options:[['over35','Zeitweise über 35 °C'],['over30','Über 30 bis 35 °C'],['under30','Bis 30 °C'],['unknown','Nicht sicher / nie gemessen']]},
   {g:'belastung',id:'air',label:'Belasten dich bei der Arbeit Staub, Dämpfe, Gerüche oder schlechte Luft?',hint:'Arbeitsstoffe, Quellen, Absaugung und Symptome getrennt dokumentieren.',refs:['a5'],options:[['often','Regelmäßig'],['sometimes','Gelegentlich'],['no','Nicht wahrnehmbar'],['unknown','Unklar']]},
   {g:'belastung',id:'physical',label:'Wie belastend sind Laufwege, Treppen, Tragen, Stehen oder häufiges Bücken?',hint:'Wenn möglich tägliche Laufstrecken/Treppen und arbeitsbedingte Einschränkungen notieren.',refs:['a5','s164'],options:[['high','Stark'],['moderate','Mittel'],['low','Gering'],['unknown','Nicht einschätzbar']]},
   {g:'belastung',id:'shifts',label:'Verschärfen Schichtzeiten oder die Pausenorganisation deine gesundheitlichen Probleme?',hint:'Der Schichtdienst ist nicht automatisch unzulässig; die individuelle Belastung zählt.',refs:['a5','s164'],options:[['yes','Ja, deutlich'],['partial','Teilweise'],['no','Nein'],['unknown','Unklar']]},
   {g:'belastung',id:'symptoms',label:'Kommt es während der Arbeit zu Atemnot oder anderen Beschwerden, die die Tätigkeit einschränken?',hint:'Bei schwerer akuter Atemnot oder unzureichender Wirkung deines Notfallplans sofort medizinische Hilfe holen.',refs:['a3','a5'],options:[['often','Häufig / deutlich'],['sometimes','Gelegentlich'],['no','Nein'],['unknown','Nicht beantwortbar']]},
   {g:'schutz',id:'risk',label:'Sind Hitze, Atemluft und körperliche Belastung gezielt für deine Tätigkeit beurteilt worden?',hint:'Falls du die Dokumentation nicht kennst, wähle „Weiß ich nicht“ statt „Nein“.',refs:['a3','a5'],options:[['yes','Ja, einschließlich meiner Einschränkungen'],['partial','Nur teilweise'],['no','Nein, nach meiner Kenntnis'],['unknown','Weiß ich nicht']]},
   {g:'schutz',id:'doctor',label:'Wurde deine individuelle Belastbarkeit arbeitsmedizinisch besprochen und beurteilt?',hint:'Arbeitsmedizinische Vorsorge, Eignungsprüfung und Behandlung beim Lungenarzt sind nicht dasselbe.',refs:['a11'],options:[['yes','Ja'],['no','Nein'],['unknown','Weiß ich nicht']]},
   {g:'schutz',id:'protect',label:'Wurden wirksame Schutzmaßnahmen gegen Wärme, Luftbelastung oder körperliche Überforderung umgesetzt?',hint:'Zum Beispiel Absaugung, Abschirmung, Kühlung, geänderte Arbeitsabläufe oder organisatorische Maßnahmen.',refs:['a3','a5','baua'],options:[['yes','Ja, wirksam'],['partial','Teilweise / Wirkung fraglich'],['no','Nein'],['unknown','Weiß ich nicht']]},
   {g:'schutz',id:'report',label:'Hast du gefährliche oder gesundheitlich problematische Arbeitsbedingungen konkret gemeldet?',hint:'Eine E-Mail oder ein Gesprächsprotokoll kann helfen, später die Chronologie zu klären.',refs:['a16','a17'],options:[['written','Ja, schriftlich'],['oral','Ja, mündlich'],['no','Nein'],['unknown','Unklar']]},
   {g:'schutz',id:'instruction',label:'Wurdest du verständlich zu Schutzmaßnahmen, Gefahrstoffen und dem Verhalten bei gesundheitlichen Problemen unterwiesen?',hint:'Die Unterweisung muss zum Arbeitsplatz und den Gefahren passen.',refs:['a12'],options:[['yes','Ja, passend und aktuell'],['partial','Teilweise / veraltet'],['no','Nein'],['unknown','Weiß ich nicht']]},
   {g:'anpassung',id:'aid',label:'Hat der Arbeitgeber konkrete Entlastungen oder Hilfsmittel angeboten?',hint:'Dazu können technische Hilfen, geringere Wege oder angepasstes Arbeiten gehören.',refs:['s164','s185'],options:[['yes','Ja, ausreichend'],['partial','Teilweise / ungeprüft'],['no','Nein'],['unknown','Unklar']]},
   {g:'anpassung',id:'breaks',label:'Gibt es geeignete zusätzliche Entlastungsmöglichkeiten bei akuten oder absehbaren Belastungsspitzen?',hint:'Es geht um die konkrete Schutzwirkung, nicht automatisch um zusätzliche gesetzliche Pausenansprüche.',refs:['a3','s164'],options:[['yes','Ja, ausreichend'],['partial','Teilweise'],['no','Nein'],['unknown','Nicht geklärt']]},
   {g:'anpassung',id:'alternate',label:'Wurden weniger belastende Tätigkeiten oder Änderungen der Aufgabenverteilung ernsthaft geprüft?',hint:'Die Möglichkeiten hängen von Betrieb, Eignung, Vertrag und Zumutbarkeit ab.',refs:['s164','gewo'],options:[['yes','Ja, nachvollziehbar'],['partial','Nur oberflächlich'],['no','Nein'],['unknown','Weiß ich nicht']]},
   {g:'anpassung',id:'solutions',label:'Wie wurde auf deine konkreten Vorschläge für eine Arbeitsplatzanpassung reagiert?',hint:'Zum Beispiel auf Vorschläge zu Transporthilfen, Arbeitsplatzposition, Wegen oder Belüftung.',refs:['s164','a17'],options:[['acted','Geprüft und umgesetzt'],['discussed','Besprochen, noch offen'],['dismissed','Abgelehnt ohne nachvollziehbare Prüfung'],['none','Noch keine konkreten Vorschläge']]},
   {g:'anpassung',id:'funding',label:'Wurde eine mögliche Unterstützung durch LWL-Inklusionsamt, Rentenversicherung oder Agentur für Arbeit geprüft?',hint:'Förderung ist keine automatische Kostenerstattung; gesetzlicher Arbeitsschutz bleibt Aufgabe des Arbeitgebers.',refs:['s185','lwl','drv','ba'],options:[['yes','Ja'],['planned','Wird geprüft'],['no','Nein'],['unknown','Weiß ich nicht']]},
   {g:'bem',id:'bem',label:'Wurde dir bei entsprechend langen Krankheitszeiten ein betriebliches Eingliederungsmanagement (BEM) angeboten?',hint:'Auslöser: mehr als sechs Wochen Arbeitsunfähigkeit innerhalb von zwölf Monaten. Teilnahme freiwillig.',refs:['s167'],options:[['yes','Ja'],['no','Nein'],['unknown','Nicht zutreffend / weiß ich nicht']]},
   {g:'bem',id:'bemResults',label:'Hat das BEM konkrete Maßnahmen, Zuständigkeiten und einen Termin zur Nachprüfung ergeben?',hint:'Ein Gespräch allein ist noch keine dauerhaft wirksame Lösung.',refs:['s167'],options:[['implemented','Ja, umgesetzt und überprüft'],['planned','Vorschläge vereinbart, offen'],['none','Nein, trotz durchgeführtem BEM'],['na','BEM noch nicht durchgeführt']]},
   {g:'bem',id:'bemPrivacy',label:'Wurden dir Ziele, freiwillige Teilnahme und Umgang mit BEM-Gesundheitsdaten erklärt?',hint:'Die Datenverarbeitung im BEM erfordert transparente Informationen.',refs:['s167'],options:[['yes','Ja, verständlich'],['partial','Teilweise'],['no','Nein'],['na','Kein BEM / unklar']]},
   {g:'bem',id:'sbv',label:'Gibt es eine Schwerbehindertenvertretung und konntest du sie einbeziehen?',hint:'Bestehen und Mitwirkungsrechte hängen vom Betrieb ab; bei Gleichstellung sind ihre Aufgaben besonders relevant.',refs:['s178'],options:[['involved','Ja, beteiligt'],['exists','Vorhanden, nicht beteiligt'],['no','Nicht vorhanden'],['unknown','Weiß ich nicht']]},
   {g:'bem',id:'council',label:'Konntest du Betriebsrat, Personalrat oder eine geeignete Vertrauensperson hinzuziehen?',hint:'Bei BEM ist eine Vertrauensperson eigener Wahl zulässig.',refs:['s167','s178'],options:[['yes','Ja'],['notyet','Noch nicht genutzt'],['blocked','Meine Beteiligung wurde behindert'],['unknown','Nicht einschätzbar']]},
   {g:'umgang',id:'pressure',label:'Wie werden deine gesundheitlichen Grenzen von Vorgesetzten behandelt?',hint:'Bitte konkrete Äußerungen, Datum und Zeugen getrennt dokumentieren.',refs:['agg7','agg13'],options:[['respect','Respektvoll'],['mixed','Unterschiedlich'],['pressure','Mit Druck oder Vorwürfen']]},
   {g:'umgang',id:'discrimination',label:'Gab es konkrete Äußerungen oder Benachteiligungen, die auf deine Behinderung Bezug nehmen?',hint:'Nicht jede Kritik ist diskriminierend. Entscheidend sind Anlass, Wortlaut und Zusammenhang.',refs:['agg7','agg12'],options:[['documented','Ja, konkret dokumentiert'],['suspected','Ich vermute es, Details unklar'],['no','Nein'],['unknown','Weiß ich nicht']]},
   {g:'umgang',id:'complaint',label:'Was geschah nach deinen Beschwerden oder Hinweisen auf gesundheitliche Risiken?',hint:'Ein sachliches Protokoll und eine schriftliche Bitte um Antwort helfen bei der Klärung.',refs:['a17','agg13'],options:[['response','Sachlich geprüft und beantwortet'],['pending','Noch ohne Ergebnis'],['dismissed','Abgewiesen oder mit Nachteilen verbunden'],['none','Ich habe noch keine Beschwerde erhoben']]},
   {g:'umgang',id:'own',label:'Hast du selbst Belastungen gemeldet und konstruktive Lösungen vorgeschlagen?',hint:'Deine Mitwirkung ersetzt nicht die Schutzpflicht des Arbeitgebers.',refs:['a15','a16','a17'],options:[['yes','Ja'],['partial','Teilweise'],['no','Bisher nicht']]},
   {g:'umgang',id:'safety',label:'Befolgst du die verständlich mitgeteilten Schutzregeln und meldest akute Gefährdungen?',hint:'Wenn Schutzmaßnahmen bei Asthma ungeeignet sind, dies sachlich und möglichst schriftlich mitteilen.',refs:['a15','a16'],options:[['yes','Ja'],['partial','Teilweise / Probleme'],['no','Nein'],['unknown','Unklar']]},
 ];
 const saved=()=>{const p=SEC.profileGet?.();const x=p?.arbeitgeberCheck31;return x&&(x.version===1||x.version===2)&&x.answers&&typeof x.answers==='object'?x:null};
 let answers={},notes='',storedAt='';
 const previous=saved();if(previous){answers={...previous.answers};notes=String(previous.notes||'');storedAt=previous.updatedAt||'';}
 const panel=el('section','a31-panel');panel.id='a31-panel';
 const workForm=$('work-form');if(workForm?.parentElement)workForm.parentElement.insertBefore(panel,workForm);else page.append(panel);
 panel.innerHTML=`
 <div class="a31-header"><p class="section-kicker">Arbeitsrecht · Gleichstellung · Prävention</p><h3>Meine Rechte & Pflichten im Arbeitsleben</h3>
 <p>Orientierende Auswertung zu Arbeitsschutz, BEM, Arbeitsorganisation, Umgang am Arbeitsplatz und Fördermitteln. Mit amtlichen Quellen. Keine automatische Entscheidung über einen Rechtsverstoß.</p></div>
 <details open class="a31-section"><summary>Arbeitgeber-Check – 30 vertiefende Fragen</summary>
 <p>Sechs Themenbereiche mit je fünf Fragen. Du kannst Fragen offenlassen oder „Weiß ich nicht“ wählen; die Auswertung zeigt Unsicherheiten ausdrücklich an. Bereits gespeicherte Antworten aus dem vorherigen 8-Fragen-Check bleiben erhalten.</p>
 <div class="a31-progress" aria-live="polite"><strong id="a31-progress-count">0 / 30 beantwortet</strong><progress id="a31-progress-bar" max="30" value="0"></progress></div>
 <form id="a31-form"><div id="a31-questions"></div>
 <label class="a31-comment">Freiwillige Notizen – z. B. Datum, Aussagen, angebotene Maßnahmen<textarea id="a31-notes" rows="3" maxlength="2500" placeholder="Nur Tatsachen notieren, die du selbst bestätigen kannst."></textarea></label>
 <div class="a31-actions"><button type="submit" class="btn btn-primary">Verschlüsselt speichern und einschätzen</button><button type="button" class="btn btn-outline" id="a31-evaluate">Ohne Speichern auswerten</button><button type="button" class="btn btn-outline" id="a31-clear">Eingaben zurücksetzen</button></div></form><p class="a31-info" id="a31-save-status" role="status"></p></details>
 <div class="a31-result" id="a31-result" aria-live="polite"><p>Beantworte den Check und tippe auf „Auswerten“.</p></div>
 <div class="a31-actions"><button type="button" class="btn btn-outline" id="a31-print">Einschätzung als PDF drucken</button><button type="button" class="btn btn-outline" id="a31-copy">Statement kopieren</button></div>
 <details class="a31-section" open><summary>Gesetzliche Pflichten: Arbeitgeber & Beschäftigte</summary>
 <div class="a31-fact"><strong>Arbeitgeber – Arbeitsschutz und Gefährdungsbeurteilung</strong><p>Erforderliche Maßnahmen, Wirksamkeitskontrolle, Arbeitsstoffe, Hitze, Arbeitsabläufe und auch psychische Belastungen beurteilen. Gesetzlich notwendiger Arbeitsschutz geht grundsätzlich zu Lasten des Arbeitgebers.</p><span data-src="a3 a5"></span></div>
 <div class="a31-fact"><strong>Arbeitgeber – behinderungsgerechte Beschäftigung</strong><p>Bei bewilligter Gleichstellung können insbesondere § 164 Abs. 4 SGB IX und weitere besondere Rechte greifen. Geeignete Arbeitsorganisation, Arbeitszeit, Arbeitsumfeld und notwendige technische Hilfen sind zu prüfen; Zumutbarkeitsgrenzen bleiben zu beachten.</p><span data-src="s151 s164 gewo"></span></div>
 <div class="a31-fact"><strong>Arbeitgeber – BEM und respektvoller Umgang</strong><p>Bei mehr als sechs Wochen Arbeitsunfähigkeit innerhalb von zwölf Monaten ist ein BEM anzubieten. Das allein ersetzt keine Schutzmaßnahmen. Behinderungsbezogene Benachteiligung ist unzulässig; Druck oder Kritik allein beweisen sie noch nicht.</p><span data-src="s167 agg7 agg12 agg13"></span></div>
 <div class="a31-fact"><strong>Arbeitnehmer – mitwirken und Gefahren melden</strong><p>Rechtmäßige Anweisungen und Schutzausrüstung beachten, unmittelbare erhebliche Gefahren melden, bei Verbesserungen mitwirken. Ein Recht auf Schutz besteht unabhängig davon, ob ein BEM läuft.</p><span data-src="a15 a16 a17"></span></div></details>
 <details class="a31-section" open><summary>Arbeitshilfen: Wer trägt die Kosten?</summary>
 <div class="a31-fact"><strong>1. Pflichtmaßnahmen des Arbeitsschutzes</strong><p>Absaugung, notwendige Schutzausrüstung, wirksame Schutzmaßnahmen gegen Hitze oder Exposition: grundsätzlich Verantwortung und Kosten des Arbeitgebers. Eine Förderzusage ist keine Voraussetzung, um gesetzliche Schutzpflichten zu erfüllen.</p><span data-src="a3 a5 baua"></span></div>
 <div class="a31-fact"><strong>2. Zusätzliche behinderungsbedingte Hilfsmittel</strong><p>Individuelle Sitz-/Stehhilfen, technische Anpassungen, Arbeitsorganisation oder Transporthilfen können je nach Erforderlichkeit und Förderzuständigkeit unterstützt werden. In NRW/Westfalen-Lippe beraten LWL-Inklusionsamt, technischer Beratungsdienst und Reha-Träger.</p><span data-src="s164 s185 lwl lwlt drv ba"></span></div>
 <div class="a31-fact"><strong>3. Keine automatische Kostenerstattung</strong><p>Förderung vor Beschaffung klären, Antragsvoraussetzungen und Zuständigkeit prüfen. Eine Fördermöglichkeit entbindet nicht von gesetzlichen Arbeitgeberpflichten.</p><span data-src="s185 lwl drvform"></span></div></details>
 <details class="a31-section" open><summary>Wo verläuft die Grenze? – Pflichten und mögliche Grenzüberschreitungen</summary>
 <div class="a31-fact"><strong>Normale Arbeitsanforderung oder unzumutbare Gefährdung?</strong><p>Arbeitsaufgaben können im Rahmen des Arbeitsvertrags und billigen Ermessens zugewiesen werden. Bei bekannten Behinderungen müssen gesundheitliche Einschränkungen berücksichtigt werden. Eine konkrete Gefährdung verlangt sachliche Prüfung und angemessene Schutzmaßnahmen – bloßes Durchhalten ersetzt keinen Arbeitsschutz.</p><span data-src="gewo s164 a3 a5"></span></div>
 <div class="a31-fact"><strong>Schutzpflicht statt pauschaler Versprechen</strong><p>Notwendige Arbeitsschutzmaßnahmen sind grundsätzlich nicht von einem Zuschuss abhängig. Nicht jedes gewünschte Hilfsmittel muss bereitgestellt werden; bei gleichgestellten Beschäftigten sind behinderungsbedingter Bedarf, Zumutbarkeit und gegebenenfalls Förderung zu prüfen.</p><span data-src="a3 s164 s185"></span></div>
 <div class="a31-fact"><strong>Umgang mit Vorwürfen oder Benachteiligung</strong><p>Ungerechtfertigter Druck ist ernst zu nehmen. Ob eine unzulässige Benachteiligung wegen Behinderung vorliegt, hängt von konkreten Aussagen, Umständen und Nachweisen ab. Für mögliche AGG-Ansprüche gelten unter Umständen kurze Fristen; insbesondere § 15 Abs. 4 AGG prüfen und frühzeitig Rechtsberatung suchen.</p><span data-src="agg7 agg13 agg15"></span></div></details>
 <details class="a31-section"><summary>Hitze, Grenzen und Beschwerdewege</summary>
 <p>Bei Raumtemperaturen über 26 °C sieht die ASR A3.5 je nach Randbedingungen Maßnahmen vor; über 30 °C sind wirksame Maßnahmen erforderlich. Über 35 °C sind Arbeitsräume ohne besondere Hitzearbeitsmaßnahmen ungeeignet. Gesundheitlich vorbelastete Beschäftigte brauchen eine passende individuelle Prüfung. Ein generelles „Hitzefrei“ entsteht daraus nicht.</p><p data-src="baua"></p>
 <p>Für das weitere Vorgehen: Arbeitgeber schriftlich auf die Belastungen hinweisen und Gefährdungsbeurteilung mit konkreten Maßnahmen erbitten; Betriebsarzt, Fachkraft für Arbeitssicherheit und, falls vorhanden, Schwerbehindertenvertretung/Betriebsrat einbeziehen. Gegebenenfalls LWL-Technische Beratung hinzuziehen. Bei ungelösten Arbeitsschutzbeschwerden kommt die zuständige Aufsichtsbehörde in Betracht; bei möglicher behinderungsbezogener Benachteiligung die betriebliche AGG-Beschwerdestelle oder qualifizierte Rechtsberatung.</p><p data-src="a17 s178 agg13 lwlt"></p>
 <p><strong>Bei akuter starker Atemnot:</strong> Exposition beenden, ärztliche Notfallhilfe holen, bei Lebensgefahr 112. Die App erteilt keine pauschale Berechtigung, jede Arbeit eigenmächtig dauerhaft einzustellen.</p></details>
 <details class="a31-section"><summary>Amtliche Originalquellen (Stand: 17.10.2026)</summary><div id="a31-sources"></div></details>
 <p class="a31-small">Datenschutz: Antworten und Notizen bleiben nach dem Speichern im bestehenden passwortverschlüsselten lokalen Tresor. Dieses Modul kontaktiert keine fremden Dienste. Gedruckte PDFs, Bildschirmfotos und kopierte Statements sind dagegen unverschlüsselt. Links öffnen externe offizielle Seiten erst bei deinem Antippen.</p>`;
 const sourceMap=new Map(sources.map(s=>[s.id,s]));
 panel.querySelectorAll('[data-src]').forEach(parent=>{
  const ids=parent.dataset.src.split(/\s+/);const box=el('span','a31-references');
  for(const id of ids){const s=sourceMap.get(id);if(!s)continue;const link=el('a','',''+s.name.split(' – ')[0]+' ↗');link.href=s.url;link.target='_blank';link.rel='noopener noreferrer';link.title=s.name;box.append(link)}
  parent.replaceChildren(box);
 });
 const allSources=$('a31-sources');for(const s of sources){const link=el('a','a31-source',s.name+' ↗');link.href=s.url;link.target='_blank';link.rel='noopener noreferrer';allSources.append(link)}
 const group=$('a31-questions');
 for(const g of groups){
   const section=el('details','a31-topic');section.open=g.id==='basis';
   const summary=el('summary','',g.name);section.append(summary,el('p','a31-topic-intro',g.intro));
   const count=el('span','a31-group-count');count.dataset.group=g.id;summary.append(count);
   for(const question of q.filter(x=>x.g===g.id)){
     const wrapper=el('fieldset','a31-question');wrapper.append(el('legend','',question.label));
     wrapper.append(el('p','a31-question-hint',question.hint));
     const options=el('div','a31-options');for(const [value,label] of question.options){const lb=el('label','a31-option');const input=el('input');input.type='radio';input.name='a31-'+question.id;input.value=value;input.checked=answers[question.id]===value;lb.append(input,el('span','',label));options.append(lb)}
     wrapper.append(options);
     const cites=el('span','a31-question-refs');for(const ref of question.refs){const source=sourceMap.get(ref);if(!source)continue;const link=el('a','',''+source.name.split(' – ')[0]+' ↗');link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';link.title=source.name;cites.append(link)}wrapper.append(cites);
     section.append(wrapper);
   }
   group.append(section);
 }
 const gather=()=>{const a={};for(const item of q){const input=panel.querySelector(`input[name="a31-${item.id}"]:checked`);if(input)a[item.id]=input.value;}return a};
 function updateProgress(){const a=gather();const count=Object.keys(a).length;
   $('a31-progress-count').textContent=count+' von '+q.length+' Fragen beantwortet';$('a31-progress-bar').value=count;
   for(const g of groups){const n=q.filter(v=>v.g===g.id&&a[v.id]).length;const elCount=panel.querySelector(`[data-group="${g.id}"]`);if(elCount)elCount.textContent=n+'/5';}
 }
 panel.querySelectorAll('#a31-questions input').forEach(e=>e.addEventListener('change',updateProgress));
 updateProgress();
 $('a31-notes').value=notes;
 const pretty=(id,a=answers)=>{const question=q.find(x=>x.id===id),value=a[id];return question?.options.find(x=>x[0]===value)?.[1]||'Nicht beantwortet'};
 let statement='';
 function evaluate(a){
   const answered=q.filter(x=>a[x.id]&&x.options.some(o=>o[0]===a[x.id])).length;
   const issues=[],positives=[],pending=[],steps=[];
   const add=(arr,what,refs=[])=>{if(!arr.some(x=>x.text===what))arr.push({text:what,refs})};
   const complaint=a.pressure==='pressure'||a.discrimination==='documented'||a.complaint==='dismissed';
   if(a.eq==='yes')add(positives,'Bewilligte Gleichstellung: besondere Rechte im SGB IX sind grundsätzlich eröffnet. Eine konkrete Anpassung hängt von Bedarf, Zumutbarkeit und Einzelfall ab.',['s151','s164']);
   else if(a.eq==='open')add(pending,'Gleichstellungsbescheid, Wirksamkeit und Geltungsdauer klären.',['s151']);
   else if(a.eq==='no')add(pending,'Keine bewilligte Gleichstellung angegeben: allgemeine Arbeitsschutzpflichten bestehen trotzdem.',['a3']);
   if(a.known==='yes')add(positives,'Der Arbeitgeber kennt nach deinen Angaben die funktionellen Einschränkungen.',['s164']);
   else if(a.known==='no')add(steps,'Arbeitsbezogene funktionelle Einschränkungen möglichst nachvollziehbar mitteilen – nicht unnötig die komplette Krankenakte offenlegen.',['s164']);
   else add(pending,'Genau klären, welche Einschränkungen dem Arbeitgeber tatsächlich bekannt sind.',['s164']);
   if(a.restrictions==='yes')add(positives,'Es liegen schriftliche ärztliche Empfehlungen für arbeitsbezogene Grenzen vor.',['a11']);
   else if(a.restrictions==='no'||a.restrictions==='oral')add(steps,'Bei der behandelnden Praxis eine auf Tätigkeiten bezogene funktionelle Empfehlung anfragen; keine pauschale Diagnosemitteilung erforderlich.',['a11']);
   if(a.role==='no')add(issues,'Du berichtest von Aufgaben, die mit Arbeitsvertrag oder gesundheitlicher Belastbarkeit nicht vereinbar erscheinen. Weisungsrecht und Zumutbarkeit konkret prüfen.',['gewo','s164']);
   if(a.privacy==='concern')add(pending,'Konkrete Bedenken zur Vertraulichkeit medizinischer Daten gesondert dokumentieren und fachkundig prüfen lassen.',['s167']);
   if(a.heat==='over35')add(issues,'Du berichtest von Temperaturen über 35 °C: Ohne besondere Maßnahmen wie bei Hitzearbeit sind diese Arbeitsräume nach ASR A3.5 in den betroffenen Zeiten ungeeignet. Messungen und Schutzkonzept dringend prüfen.',['baua','a5']);
   else if(a.heat==='over30')add(issues,'Du berichtest von mehr als 30 °C: nach ASR A3.5 sind wirksame Hitzeschutzmaßnahmen zu ergreifen. Gesundheitliche Vorbelastung individuell bewerten.',['baua','a5']);
   else if(a.heat==='unknown')add(pending,'Arbeitsraumtemperaturen und Expositionsdauer nachvollziehbar messen bzw. dokumentieren.',['baua']);
   if(a.air==='often')add(issues,'Regelmäßig wahrgenommene Luftbelastung: eingesetzte Arbeitsstoffe, Absaugung und inhalative Exposition fachlich prüfen. Geruch allein beweist keinen Grenzwertverstoß.',['a5']);
   else if(a.air==='sometimes')add(pending,'Gelegentliche Luftbelastungen einschließlich Quellen und Zeitpunkten dokumentieren.',['a5']);
   if(a.physical==='high')add(issues,'Starke Belastung durch Gehen, Stehen, Treppen oder Tragen: Tätigkeitswechsel, Hilfsmittel und Arbeitsorganisation individuell prüfen.',['a5','s164']);
   else if(a.physical==='moderate')add(pending,'Mittlere körperliche Belastung mit ärztlich beschriebenen Einschränkungen abgleichen.',['s164']);
   if(a.shifts==='yes')add(issues,'Schicht- oder Pausenorganisation verschärft nach deiner Angabe Beschwerden: individuelle Arbeitszeitgestaltung prüfen. Das macht Schichtarbeit nicht pauschal unzulässig.',['a5','s164']);
   if(a.symptoms==='often')add(issues,'Häufige Beschwerden während der Arbeit sind ein Anlass für zeitnahe arbeitsmedizinische und behandelärztliche Abklärung; bei schwerer akuter Atemnot medizinische Notfallhilfe.',['a3','a11']);
   else if(a.symptoms==='sometimes')add(pending,'Beschwerdeepisoden mit Tätigkeit, Uhrzeit und möglichen Auslösern dokumentieren.',['a5']);
   if(a.risk==='no')add(issues,'Nach deinen Angaben fehlt eine gezielte Prüfung von Hitze, Atemluft und körperlicher Belastung. Dokumentierte Gefährdungsbeurteilung und spezifische Schutzmaßnahmen erfragen.',['a5']);
   else if(a.risk==='partial')add(pending,'Klärung verlangen, welche Gefährdungen bisher nicht beurteilt wurden.',['a5']);
   else if(a.risk==='unknown')add(pending,'Ob und in welchem Umfang eine Gefährdungsbeurteilung vorliegt, ist offen – kein Beweis ihres Fehlens.',['a5']);
   else if(a.risk==='yes')add(positives,'Eine gezielte Gefährdungsbeurteilung ist nach deiner Auskunft erfolgt; die Umsetzung ist gesondert zu prüfen.',['a5']);
   if(a.doctor==='no')add(steps,'Individuelle arbeitsmedizinische Beratung zur konkreten Tätigkeit anregen.',['a11']);
   else if(a.doctor==='unknown')add(pending,'Ungeklärt, ob und in welcher Form arbeitsmedizinische Beratung stattgefunden hat.',['a11']);
   else if(a.doctor==='yes')add(positives,'Individuelle arbeitsmedizinische Beurteilung wurde nach eigener Auskunft durchgeführt.',['a11']);
   if(a.protect==='no')add(issues,'Du berichtest, dass gegen die Belastungen keine wirksamen Schutzmaßnahmen umgesetzt wurden. Art und Wirksamkeit der Maßnahmen mit dem Arbeitgeber prüfen.',['a3','a5']);
   else if(a.protect==='partial')add(pending,'Vorhandene Schutzmaßnahmen auf konkrete Wirkung und Nachbesserungen prüfen.',['a3']);
   else if(a.protect==='yes')add(positives,'Wirksame Schutzmaßnahmen sind nach deiner Angabe vorhanden.',['a3']);
   if(a.report==='written')add(positives,'Arbeitsplatzrisiken wurden schriftlich gemeldet; Sachstand und Reaktion können nachvollzogen werden.',['a16']);
   else if(a.report==='oral')add(steps,'Frühere mündliche Gefahrenmeldungen bei Bedarf sachlich schriftlich zusammenfassen.',['a16']);
   if(a.instruction==='no')add(issues,'Eine passende Arbeitsschutzunterweisung wird verneint; Unterweisungsstand überprüfen.',['a12']);
   else if(a.instruction==='partial')add(pending,'Arbeitsschutzunterweisung auf Aktualität und konkreten Arbeitsplatzbezug prüfen.',['a12']);
   if(a.aid==='no')add(issues,'Trotz gemeldeter Belastungen sind nach deiner Auskunft keine Entlastungen oder Hilfsmittel angeboten worden. Bei Gleichstellung ist die Prüfung geeigneter behinderungsgerechter Anpassungen besonders wichtig.',['s164']);
   else if(a.aid==='partial')add(pending,'Bisherige technische und organisatorische Hilfen auf tatsächlichen Nutzen prüfen.',['s164']);
   else if(a.aid==='yes')add(positives,'Konkrete Entlastungen wurden angeboten.',['s164']);
   if(a.breaks==='no')add(issues,'Keine ausreichenden Entlastungsmöglichkeiten bei Belastungsspitzen angegeben; Pausen- und Arbeitsorganisation auf erforderliche Schutzwirkung überprüfen.',['a3','s164']);
   if(a.alternate==='no')add(pending,'Andere geeignete Tätigkeiten oder Aufgabenverteilung wurden nach deiner Kenntnis nicht geprüft; Umsetzbarkeit erfragen.',['s164','gewo']);
   if(a.solutions==='dismissed')add(issues,'Konkrete Anpassungsvorschläge wurden nach deiner Angabe ohne nachvollziehbare Prüfung abgelehnt; Ablehnungsgründe dokumentiert erfragen.',['s164','a17']);
   else if(a.solutions==='acted')add(positives,'Deine Vorschläge wurden umgesetzt.',['a17']);
   if(a.funding==='no'||a.funding==='unknown')add(steps,'Für zusätzliche individuelle Arbeitshilfen mögliche Kostenträger (LWL-Inklusionsamt, DRV, Agentur für Arbeit) VOR Anschaffung klären; gesetzlicher Arbeitsschutz bleibt Arbeitgeberpflicht.',['a3','s185','lwl']);
   else if(a.funding==='yes')add(positives,'Fördermöglichkeiten wurden geprüft; eine Bewilligung ist damit noch nicht bestätigt.',['s185']);
   if(a.bem==='yes')add(positives,'Ein BEM wurde angeboten; das erfüllt noch nicht automatisch alle Präventions- und Arbeitsschutzpflichten.',['s167']);
   else if(a.bem==='no')add(pending,'Bei mehr als sechs Wochen AU innerhalb von zwölf Monaten prüfen, ob ein BEM-Angebot nach § 167 Abs. 2 SGB IX hätte erfolgen müssen.',['s167']);
   if(a.bemResults==='none'&&a.bem==='yes')add(issues,'Nach einem BEM blieben konkrete Maßnahmen aus. Ergebnisse und weitere Lösungsversuche nachvollziehbar besprechen.',['s167']);
   else if(a.bemResults==='implemented')add(positives,'BEM-Maßnahmen wurden umgesetzt und nachgeprüft.',['s167']);
   else if(a.bemResults==='planned')add(pending,'BEM-Maßnahmen sind noch offen; Verantwortliche und Fristen festlegen.',['s167']);
   if(a.bemPrivacy==='no'&&a.bem==='yes')add(pending,'BEM-Informationen zu Zielen und Verwendung persönlicher Daten werden als fehlend angegeben; transparentes Verfahren klären.',['s167']);
   if(a.sbv==='exists'&&a.eq==='yes')add(steps,'Schwerbehindertenvertretung für ein konkretes Anpassungsgespräch einbeziehen.',['s178']);
   if(a.council==='blocked')add(pending,'Berichtete Behinderung der Beteiligung einer Vertrauensperson oder Interessenvertretung: konkreten Vorgang rechtlich prüfen lassen.',['s167']);
   if(a.pressure==='pressure')add(issues,'Du berichtest von Druck/Vorwürfen bei gesundheitlichen Grenzen. Mit Wortlaut, Datum und Beteiligten dokumentieren; ein AGG-Verstoß folgt daraus nicht automatisch.',['agg7','agg13']);
   else if(a.pressure==='respect')add(positives,'Der Umgang wird als respektvoll beschrieben.',['agg7']);
   if(a.discrimination==='documented')add(issues,'Konkrete behinderungsbezogene Vorfälle wurden nach deiner Auskunft dokumentiert; qualifizierte AGG-Beratung und betriebliche Beschwerdestelle erwägen.',['agg7','agg12','agg13']);
   else if(a.discrimination==='suspected')add(pending,'Bei vermuteter Benachteiligung Anlass, Vergleichssituation und Belege genau trennen.',['agg7']);
   if(a.complaint==='dismissed')add(issues,'Beschwerden seien abgewiesen oder mit Nachteilen verbunden worden: Ablauf dokumentieren und fachkundige Rechtsberatung nutzen.',['a17','agg13']);
   if(a.own==='yes')add(positives,'Du gibst an, Gesundheitsrisiken gemeldet und Lösungen vorgeschlagen zu haben.',['a15','a16']);
   else if(a.own==='partial')add(steps,'Eigene Gefahrenmeldungen und Verbesserungsvorschläge möglichst nachvollziehbar dokumentieren.',['a15','a16']);
   else if(a.own==='no')add(steps,'Mitwirkung und Mitteilung bekannter Gefahren nach §§ 15, 16 ArbSchG klären.',['a15','a16']);
   if(a.safety==='no')add(steps,'Eigene Befolgung geeigneter Schutzregeln und Gefahrenmeldungen prüfen; ungeeignete Schutzausrüstung beim Betriebsarzt ansprechen.',['a15','a16']);
   else if(a.safety==='yes')add(positives,'Du gibst an, geeignete Schutzvorgaben zu beachten und akute Gefahren zu melden.',['a15','a16']);
   if(answered<q.length)add(pending,`${q.length-answered} der 30 Fragen sind noch offen. Nicht beantwortete Punkte dürfen nicht als Pflichtverletzungen gewertet werden.`,[]);
   add(steps,'Arbeitgeber schriftlich um tätigkeitsbezogene Gefährdungsbeurteilung, individuelle Schutzmaßnahmen und verbindliche Wirksamkeitskontrolle bitten.',['a3','a5']);
   if(a.heat==='over35'||a.symptoms==='often')add(steps,'Hitzeexposition und ausgeprägte Beschwerden prioritär arbeitsmedizinisch prüfen lassen; bei akuten schweren Beschwerden Notfallversorgung nutzen.',['a11','baua']);
   if(a.eq==='yes')add(steps,'Bei Bedarf Schwerbehindertenvertretung und technischen Beratungsdienst des LWL einbeziehen.',['s178','lwlt']);
   if(a.bem==='yes')add(steps,'BEM-Verlauf auf konkrete Maßnahmen, Verantwortliche und Nachprüfung überprüfen.',['s167']);
   if(complaint)add(steps,'Belastende Aussagen oder Benachteiligungen sachlich mit Zeitpunkt, Zeugen und Schriftstücken dokumentieren; bei rechtlichem Verdacht professionelle Beratung einschalten.',['agg7','agg13']);
   const high=a.eq==='yes'&&a.known==='yes'&&a.risk==='no'&&a.aid==='no';
   const level=answered<6?'Noch keine hinreichende Einschätzung':high||issues.length>=5?'Deutlicher Prüf- und Handlungsbedarf':issues.length>=2?'Erhöhter Klärungsbedarf':answered<16?'Vorläufige Einschätzung – viele Angaben fehlen':'Individuelle Überprüfung sinnvoll';
   const conclusion=answered<6?'Für eine individuelle arbeitsrechtliche Orientierung fehlen noch wesentliche Angaben. Das allein ist weder Entwarnung noch ein Vorwurf.':high?
     'Die Selbstauskünfte deuten auf erheblichen Klärungsbedarf hin: Bei bewilligter Gleichstellung und bekannten Einschränkungen werden eine spezifische Prüfung der Belastungen sowie konkrete Entlastungen verneint. Ein BEM-Angebot ist ein positiver Schritt, ersetzt aber keine erforderlichen Schutzmaßnahmen. Der geschilderte Umgang und mögliche Benachteiligungen sind anhand belegbarer Vorfälle getrennt zu prüfen. Eine rechtswidrige Handlung ist mit dem Fragebogen weder bewiesen noch ausgeschlossen.':
     issues.length>=2?'Die Antworten beschreiben mehrere mögliche Schutz- oder Anpassungslücken. Ob konkrete gesetzliche Pflichten verletzt wurden, hängt unter anderem von Gefährdungsbeurteilung, medizinischen Empfehlungen, betrieblicher Zumutbarkeit und den tatsächlichen Vorgängen ab. Eine rechtliche Einzelfallprüfung ist sinnvoll.':
     'Die Angaben ergeben keine eindeutige Pflichtverletzung. Weitere Nachweise und ein Abgleich von Schutzmaßnahmen, tatsächlicher Belastung und individueller gesundheitlicher Eignung sind sinnvoll; fehlende Beschwerden oder Antworten sind keine pauschale Entwarnung.';
   return {total:answered,level,high,issues,positives,pending,steps,conclusion};
 }
 function show(){
   answers=gather();notes=$('a31-notes').value.trim();updateProgress();const r=evaluate(answers),div=$('a31-result');div.replaceChildren();
   const head=el('div','a31-verdict');head.append(el('strong','',r.level),el('small','',`${r.total} von ${q.length} Fragen beantwortet · Selbstauskunft, keine rechtsverbindliche Prüfung`));div.append(head);
   const appendList=(title,items)=>{if(!items.length)return;div.append(el('h4','',title));const ul=el('ul');for(const item of items){const li=el('li','',item.text);if(item.refs?.length){const box=el('span','a31-references');for(const id of item.refs){const src=sourceMap.get(id);if(!src)continue;const link=el('a','',''+src.name.split(' – ')[0]+' ↗');link.href=src.url;link.target='_blank';link.rel='noopener noreferrer';link.title=src.name;box.append(link)}li.append(box)}ul.append(li)}div.append(ul)};
   appendList('Mögliche Probleme – individuell weiter prüfen',r.issues);
   appendList('Positive oder dokumentierte Aspekte',r.positives);
   appendList('Offene Punkte und Unsicherheiten',r.pending);
   appendList('Priorisierte nächste Schritte',r.steps);
   div.append(el('h4','','Abschließendes Statement'),el('p','a31-conclusion',r.conclusion));
   const details=el('details','a31-answer-summary');details.open=false;details.append(el('summary','','Meine 30 Antworten (für Ausdruck/PDF aufgeführt)'));
   for(const g of groups){details.append(el('h5','',g.name));for(const item of q.filter(v=>v.g===g.id)){const p=el('p','',item.label+' – ' +pretty(item.id,answers));details.append(p)}}div.append(details);
   div.append(el('p','a31-disclaimer','Diese Orientierung stützt sich auf Selbstauskünfte. Keine rechtsverbindliche Feststellung einer Pflichtverletzung, keine ärztliche Eignungsfeststellung. Auch nicht beantwortete Fragen sind keine Entwarnung. Externe Quellen bitte im Original prüfen.'));
   const references=new Set([...r.issues,...r.positives,...r.pending,...r.steps].flatMap(x=>x.refs||[]));
   const refs=el('div','a31-print-refs');refs.append(el('h4','','Für diese Bewertung genutzte Rechtsgrundlagen'));for(const id of references){const src=sourceMap.get(id);if(src)refs.append(el('p','',src.name+': '+src.url))}div.append(refs);
   const flatten=arr=>arr.map((item,i)=>`${i+1}. ${item.text}${item.refs?.length?' [Quellen: '+item.refs.map(id=>sourceMap.get(id)?.url||id).join(', ')+']':''}`);
   statement=['Arbeitsplatz und Gleichstellung – persönliche Orientierung',`Erstellt: ${new Date().toLocaleDateString('de-DE')}`,`Ergebnis: ${r.level} · ${r.total}/${q.length} beantwortet`,'',...groups.flatMap(g=>[g.name,...q.filter(x=>x.g===g.id).map(x=>x.label+' '+pretty(x.id,answers)),'']),
     'Mögliche Probleme:',...flatten(r.issues),'','Positive Aspekte:',...flatten(r.positives),'','Offene Fragen:',...flatten(r.pending),
     '','Empfohlene Schritte:',...flatten(r.steps),'','Abschließende Einschätzung:',r.conclusion,
     '',notes?'Eigene Notizen: '+notes:'',
     '','Rechtsgrundlagen:',...sources.map(s=>s.name+': '+s.url),
     '','Hinweis: orientierende Selbstauskunft, keine amtliche/ärztliche/rechtsverbindliche Feststellung.'].join('\n');
 }
 function loadForm(){for(const question of q){for(const input of panel.querySelectorAll(`input[name="a31-${question.id}"]`))input.checked=answers[question.id]===input.value;}$('a31-notes').value=notes;updateProgress();show();}
 $('a31-form').addEventListener('submit',async event=>{
  event.preventDefault();answers=gather();notes=$('a31-notes').value.trim();show();const updatedAt=new Date().toISOString();
  const button=event.submitter; if(button)button.disabled=true;
  try{await SEC.updateProfile({arbeitgeberCheck31:{version:2,answers:{...answers},notes,updatedAt}});storedAt=updatedAt;$('a31-save-status').textContent='Antworten im verschlüsselten lokalen Tresor gespeichert. Letzte Speicherung: '+new Date(updatedAt).toLocaleString('de-DE');}
  catch(e){$('a31-save-status').textContent='Speichern fehlgeschlagen; Einschätzung nur vorübergehend angezeigt: '+(e.message||e);}
  finally{if(button)button.disabled=false}
 });
 $('a31-evaluate').addEventListener('click',()=>{show();$('a31-save-status').textContent='Nur ausgewertet – zum dauerhaften Speichern auf „Verschlüsselt speichern“ tippen.'});
 $('a31-clear').addEventListener('click',()=>{if(!confirm('Antworten im Formular zurücksetzen? Die letzte verschlüsselte Speicherung bleibt bestehen, bis neu gespeichert wird.'))return;answers={};notes='';loadForm();$('a31-save-status').textContent='Formular zurückgesetzt. Bestehende gespeicherte Antworten bleiben noch erhalten.'});
 $('a31-copy').addEventListener('click',async()=>{show();if(!confirm('Statement mit möglicherweise sensiblen Gesundheits- und Arbeitsangaben UNVERSCHLÜSSELT in die Zwischenablage kopieren?'))return;try{await navigator.clipboard.writeText(statement);$('a31-save-status').textContent='Statement kopiert. Zwischenablage sicher behandeln.'}catch{$('a31-save-status').textContent='Kopieren nicht erlaubt – öffne die App über HTTPS.'}});
 $('a31-print').addEventListener('click',()=>{show();if(!confirm('Der Ausdruck/PDF enthält möglicherweise persönliche Gesundheits- und Arbeitsangaben unverschlüsselt. Drucken?'))return;const a=$('a31-result')?.querySelector('.a31-answer-summary');const wasOpen=a?.open;if(a)a.open=true;document.body.classList.add('a31-print');const restore=()=>{document.body.classList.remove('a31-print');if(a)a.open=Boolean(wasOpen)};window.addEventListener('afterprint',restore,{once:true});try{window.print()}finally{setTimeout(restore,15000)}});
 if(previous)loadForm();else $('a31-result').replaceChildren(el('p','','Der Check ist noch nicht ausgefüllt. Keine persönliche Rechtsbewertung ohne Angaben.'));
 window.ASTHMA_ARBEIT31_TEST=Object.freeze({evaluate,sourceCount:sources.length,questionCount:q.length,groups:groups.map(g=>g.id)});
})();
