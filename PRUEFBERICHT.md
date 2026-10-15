# Prüfbericht: Asthma 1.8.0 – Befundtabellen und Laborakte

Stand: 15.10.2026

## Durchgeführt
- Basis: vollständige Quelldateien von Version 1.7.0, bestehende Passwort- und Dateistrukturen beibehalten.
- Syntaxprüfung aller ausgelieferten JavaScript-Dateien mit Node.js ohne Fehler.
- Isolierter Chromium-Test bei 390 px Breite: Navigation, neue Laboransicht, 18 wählbare Labor-/Atemtest-Parameter, Speichern eines Laborwerts (Testdatum), Auswertung der synthetisch transkribierten Geratherm-Messwerttabelle, manuelle Freigabe, Speicherung einer Verlaufsmessung, Kalender, Arztbericht, kein horizontaler Überlauf, keine ungefangenen JavaScript-Fehler.
- Testfall aus dem Tabellenmuster des Nutzers: FEV1 2,52 l/54 % Soll, FVCex 2,95 l/51 % Soll, FVCin 3,06 l/53 % Soll, VC 3,06 l/51 % Soll, PEF 4,93 l/s/48 % Soll, TLC 4,19 l/51 % Soll, FEV1/FVC 85 %, Untersuchung 17.09.2026, Qualitätswarnung (A). Die **Transkription** wurde getestet, nicht eine stets korrekte automatische Erkennung des Originalfotos im iPhone-Browser.
- Echter WebCrypto-AES-GCM-Modultest gegen simulierte IndexedDB: verschlüsselte Migration vorhandener Fälle, Dokumente und Messungen, neuer Labor-Datensatz, verschlüsselte Backupdatei, Ablehnung falscher Backupkennwörter, vollständige Wiederherstellung inklusive neuer Laborwerte.
- Datenschutz: kein externer OCR-/PDF-Dienst eingebunden. Neue persönliche Werte gehen ausschließlich über das bestehende verschlüsselte Datenspeichermodul. Originalfoto ist **nicht** in der GitHub-ZIP enthalten.

## Nicht vollständig geprüft / bekannte Grenzen
- **Keine allgemeine 100-%-Foto-OCR:** Ein vollwertiger lokal gebündelter OCR-Motor konnte hier nicht bereitgestellt werden. Native Browsererkennung über `TextDetector` funktioniert nur in Browsern, die diese API anbieten. iPhone Safari unterstützt diese Schnittstelle typischerweise nicht; daher iPhone Live Text -> lokal kopierter Text -> Parser -> manuelle Kontrolle. Kein stilles Hochladen an fremde OCR-Server.
- Fehler in Fotoqualität, OCR-Ziffern, Zeilen, Layout oder Messphasen sind auch bei sichtbaren Zahlen möglich. Vor Speicherung immer anhand des Originalberichts vergleichen. Bei unklaren oder widersprüchlichen Angaben wird gewarnt. Andere Arztsoftware und exakte prä/post-Spalten sind nicht vollständig abgedeckt.
- Die Beibehaltung der originalen Befunddatei benötigt wie bisher den separaten Button „Originalbild archivieren“; die Analyse speichert die bestätigten Zahlen/Qualitätshinweise verschlüsselt.
- Live-Safari/iPhone-Kamera, iOS Live Text, Live-PWA-GitHub-Pages-Aktualisierung und echte vorhandene lokale Patientendaten konnten nicht getestet werden.
- Ein vollständiges unabhängiges Sicherheits-Audit und eine forensische Prüfung der Datenträger finden nicht statt. Der Hosting-Anbieter sieht übliche HTTP-Aufrufe, jedoch keine durch die App absichtlich übertragenen Gesundheitsdaten.
- Verschlüsselter Browser-Speicher bleibt bei Browserdatenlöschung oder Gerätewechsel ohne Backup nicht erhalten. Das Passwort selbst kann nicht rekonstruiert werden.
