# Asthma 2.5.0 – Prüfbericht

## Getestet mit isoliertem Browser / simuliertem Tresor
- 320, 390, 430 und 768 px: keine ungefangenen JavaScript-Fehler; neue Eingaben und Statistiken ansprechbar.
- AU-Eintrag 09.–13.10.2026: 5 Kalendertage und 3 Mo–Fr-Tage.
- Überlappende AUs 09.–13. und 12.–15.10.: 7 eindeutige Kalendertage, 5 Mo–Fr-Tage; keine Doppelzählung.
- NRW-Feiertagsregel testweise geprüft (u. a. 25.12.). Prüft nur NRW; Feiertage anderer Bundesländer nicht automatisch berücksichtigt.
- Monatsbericht mit Testbefund, ePEF, Labor, AU, Therapie, Anträgen, Kalender und Dokumenten erstellt.
- Medikations-Vorschläge: fünf zuvor genannte Medikamente vorgeschlagen; vorhandener Trimbow-Eintrag nicht überschrieben; zweimaliges Übernehmen erzeugt keine Duplikate.
- Kalender: Kategorienlabor, AU, Dokumente, PEF, Lungenfunktion, Anträge und Termine geladen; ausblendbare Filter.
- JavaScript-Syntaxprüfung für alle JS-Dateien bestanden.
- Druckmedien-Regel: Bericht sichtbar und App-Navigation unsichtbar.
- Neue Dateien sind für Offline-Nutzung im Service Worker registriert.
- Backup-Wiederherstellungs-Whitelist akzeptiert die neue verschlüsselte Gruppe `au` in zwei vollständigen Wiederherstellungswegen.

## Nicht bestätigt
- Vollständige Verschlüsselungs-/Wiederherstellungstransaktionen auf echtem iPhone-Safari-IndexedDB.
- PDF-Speicherung über Safari-Druckdialog auf deinem Gerät. Keine eigenständige serverseitige PDF-Erzeugung.
- Alle Sonderfälle von Feiertagen/Schichtplanung; Tagezähler ersetzt keine Personalabrechnung.
- Vollständige Diagnose-/Messwertinterpretation sowie fremde OCR-Befundlayouts.

Alle persönlichen Angaben bleiben auf dem Gerät, solange die bestehende Webapp nicht durch manipulierte Quelldateien ersetzt und keine unverschlüsselten Exporte weitergegeben werden.
