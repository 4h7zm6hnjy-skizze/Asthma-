# Asthma 1.9.1 – Korrektur der mobilen Scanneransicht

Dieses Paket enthält sämtliche vorhandenen App-Dateien von 1.9.0 einschließlich Scanner, Blutwerten, Kalender, verschlüsseltem Tresor und regionaler Suche.

## Neu in 1.9.1
- iPhone-Safari: Mobile Eingabefelder mindestens 16px Schriftgröße, um automatisches Seitenvergrößern beim Fokussieren zu vermeiden.
- Scanner-Aktionen stehen auf schmalen Bildschirmen untereinander; lange Button-Texte werden umgebrochen.
- Befundbild bleibt im Container und wird vollständig eingepasst; die Vollbild-Zoomfunktion bleibt für die Bildbetrachtung verfügbar.
- Feste untere Navigation auf maximal 100% Bildschirmbreite begrenzt.
- Fehlende Versionsangabe in Einstellungen auf aktuellen Stand gebracht.
- Versions-/Service-Worker-Cache auf 1.9.1 geändert.

**Wichtig:** Bereits manuell vergrößerte Seiten müssen auf dem iPhone einmal wieder auf normale Größe zurückgestellt bzw. neu geöffnet werden. Die App sperrt die Betriebssystem-Vergrößerung nicht aus Gründen der Barrierefreiheit.

**OCR:** iPhone Safari unterstützt bisher keine automatische Fotoerkennung im Browser über TextDetector. Ein auf iPhone nicht unterstützter Foto-OCR-Button wird ausgeblendet. Die lokale Erkennung muss weiterhin über iOS Live Text (Text kopieren und einfügen / Text scannen) erfolgen. Keine externen OCR-Dienste.

**Datenschutz:** Die Verschlüsselungslogik von 1.9.0 ist unverändert. Bitte vor dem Upload ein verschlüsseltes Backup anlegen und erst danach die Dateien in GitHub `main` hochladen. Nach der Veröffentlichung die geänderte Version und Fotoansicht auf dem iPhone prüfen.

## Vorherige Funktionen
# Asthma Webapp – Version 1.9.0

## Neu: Spirometrie-Befunde und Laborwerte

1. **Befunde**: Bild aus Mediathek auswählen oder Kamera benutzen. Für browserbasierte OCR wird nur eine eventuell vorhandene lokale `TextDetector`-Funktion verwendet. Auf dem iPhone in **Fotos** den Text mit **Live Text** markieren und kopieren, dann in der Asthma-App „Kopierten Text einfügen“ antippen oder im Textfeld einfügen und „Text auswerten“ wählen. Es wird nichts an ein fremdes OCR-System übertragen.
2. **Vollständige Tabelle**: Die App trennt Soll, Ist, % Soll und einzelne Parameter, insbesondere FEV1, FVC **exspiratorisch**, FVC **inspiratorisch**, VC, FEV1/FVC, PEF, TLC, RV sowie MEF-Werte, soweit die Texte korrekt und eindeutig vorliegen. Zweifelhafte Zahlen werden gewarnt. Die Werte sind von der Person anhand des Originals zu bestätigen. Die Übernahme speichert die bestätigten Werte und die Messwerttabelle lokal AES-GCM-verschlüsselt im vorhandenen Gesamttresor; Messungen erscheinen in Verlauf und Kalender. Für Originalbilder gibt es weiterhin den Button „Originalbild archivieren“.
3. **Blutwerte**: Neuer, separat aufrufbarer Menübereich für absolute/relative Eosinophile, Gesamt-IgE, spezifisches IgE mit Allergen, Leukozyten, CRP, Hämoglobin, weitere optionale Labore, Blutgasparameter und ausdrücklich als Nicht-Blutwert gekennzeichnetes FeNO. Datum, Einheit und Referenzbereich des Labors sind eingebbar. Kopierte Labor-Zeilen können Prüfvorschläge liefern. Daten werden verschlüsselt und gehen in vollständige Backups, Kalender und Arztbericht ein.
4. **Datenschutz**: Keine externe OCR-Code-Nachladung. Keine automatischen Übertragungen medizinischer Daten an App-Server. Die weiterbestehende App benötigt für Updates und amtliche Verlinkungen gegebenenfalls eine Internetverbindung. Hosting bedeutet übliche Anfrage-Metadaten beim Webseitenbetreiber.

**Wichtig**: Eine fehlerfreie 100-%-Erkennung beliebiger fotografierter Befundtabellen ist nicht realisierbar. Besonders iPhone Safari hat keinen standardmäßig verfügbaren Web-OCR-Motor. Die App nutzt dort den lokalen Umweg über iOS Live Text. Bei neuen Layouts sind manuelle Korrekturen nötig; alle Zahlen vor dem Speichern vergleichen. Keine automatische Diagnose.

## Aktualisieren

- **Vorher unbedingt ein vollständiges `.asthma17`-Backup aus Version 1.7.0 sichern.** Das Tresor-Passwort behalten.
- ZIP entpacken und die Dateien **einzeln ins Wurzelverzeichnis** des Repositories `4h7zm6hnjy-skizze/Asthma-` hochladen. Bestehende gleichnamige Dateien ersetzen. Die ZIP nicht selbst als Datei hochladen.
- **Nach dem Upload** den GitHub-Pages-Workflow unter Actions auf „success“ prüfen und erst dann die App öffnen bzw. über „Nach Updates suchen“ neu laden.
- Bestehendes Tresor-Passwort weiterverwenden; keine erneute Einrichtung bzw. Migration erforderlich.

## Beibehaltene Module

Startseite, untere sechs Schnellbuttons, Bundesländer/Region, FEV1- und FVC-Profil, Verschlüsselung, Kalender, Antragsverwaltung, Hilfsmittel, Medikamente, Arztbericht, Notfallplan, offline gespeicherte Grund-App und Datenmigration. Neue Skripte: `befund18-parser.js`, `labor18.js`, erneuertes `befundscan.js`. Neue Quellendokumente: `LABOR_QUELLEN.md` und `PRUEFBERICHT.md`.

## Grenzen und Prüfstatus

Siehe `PRUEFBERICHT.md` für Syntax-, Browser- und Kryptotests sowie offene Live-iPhone- und OCR-Tests. Die App bietet Gesundheitsdokumentation, **keine eigenständige Diagnose**. Bei akuter schwerer Atemnot 112.

## Neu in 1.9.0 – Lungenfunktion und Bildanzeige

- **Unterer Schnellbutton „Lunge“** öffnet die Lungenfunktionsseite unmittelbar. Dort gibt es einen eigenen Button „Befund fotografieren / scannen“. Die vorhandenen 5 anderen Schnellbuttons und alle Daten bleiben erhalten.
- **Foto automatisch einpassen:** Das gesamte Befundfoto passt ohne Zuschneiden in die verfügbare Breite. Vollbildansicht mit Zoomtasten, Touch-Zoom und Verschieben im vergrößerten Zustand.
- **Benutzer-Zoom bleibt erlaubt:** Keine Sperre für iOS-Pinch-Zoom. Die App selbst verhindert durch responsive Breiten horizontale Überläufe.
- **iPhone OCR:** Der Button „iPhone-Texterkennung nutzen“ öffnet die Text-Eingabe, in der iOS je nach Version die native Aktion „Text scannen“ anbietet. Alternativ in der Fotos-App Apple Live Text kopieren und hier einfügen. Browser mit lokaler TextDetector-Funktion werden weiterhin unterstützt. Eine vollautomatische Texterkennung aus beliebigen Bildern in iPhone-Safari ist **weiterhin nicht implementiert**; es wurde kein lokaler OCR-WASM-Motor mitgeliefert. Die App behauptet nicht, dass Safari diese Funktion besitzt. Bei der Texterkennung findet keine Befundübertragung an einen externen Dienst statt.
- **Dateien:** Neue `foto19.js` und angepasste `index.html`, `styles.css`, `secure17.js`, `sw.js`, `version.json` und Versionshinweise.

### Update wichtig

Vor dem Upload ein vollständiges verschlüsseltes Backup erstellen. ZIP-Datei entpacken, enthaltene Dateien direkt in das Hauptverzeichnis des GitHub-Repositories hochladen und vorhandene ersetzen. Die ZIP-Datei selbst nicht hochladen.
