# Prüfbericht Asthma 2.6.0 – Neues Design

## Änderungen
- Neues, lokal gespeichertes Asthma-Logo als 192- und 512-Pixel-PNG; PWA-Manifest, Favicon und Anmeldeansicht aktualisiert.
- Vollständig überarbeitete, mobil optimierte Startseite mit Schnellzugriff, letzten bestätigten FEV₁-/FVC-Werten, Peak-Flow-Wert, Medikamentenzahl und kommendem Kalendereintrag.
- Bestehende ePEF- und ärztliche Spirometrie-Diagramme weiterhin direkt auf der Startseite; Grafiken und Messreihen bleiben getrennt.
- Neu angeordnete Lungenfunktionsseite: FEV₁-/FVC-Ringkarten und anschließende Zeitverläufe vor dem Eingabeformular; alte Funktionen bleiben vorhanden.
- Kalenderoberfläche optimiert: Monat steht vorne, Farbfilter/Legende sind darunter aufklappbar, bestehende Kalendereinträge und Farbcodes unverändert.
- Neue Akte-&-Mehr-Schnellwahl vor der vorhandenen persönlichen Dokumentenablage; AU-Tage, verschlüsselte Sicherung und alle bisherigen Module bleiben zugänglich.
- Original-Speicher-/Datenbankschemata und AES-GCM-Kryptografie nicht geändert. Keine neuen externen Anfragen oder Tracker.
- Keine automatische medizinische Aussage „stabil“ oder „kritisch“ aus Einzelmesswerten; nur bestätigte Untersuchungswerte werden angezeigt.

## Prüfungen (automatisiert)
- `node --check` für alle JavaScript-Dateien: bestanden.
- Browser-Test mit Chromium bei 320, 375, 390, 430, 768 und 1200 Pixel Bildschirmbreite: keine horizontalen Überläufe, keine ungefangenen JavaScript-Fehler.
- 54 % FEV₁, 51 % FVC, 2,52 und 2,95 Liter sowie PEF 404 l/min aus einem **simulierten** bestehenden, bestätigten Datensatz korrekt angezeigt.
- Leerer Tresor / noch nicht bestätigte Untersuchung zeigt keine erfundenen Werte.
- Auf DOM-Ebene bleiben Scanner, AU, Dokumentenablage, Kalender und Spirometrie-Funktionen vorhanden; Daten wurden nicht dupliziert.
- Echte bereits vorhandene Module `epef21.js`, `lufu23.js` und `calendar17.js` mit simuliertem Tresor getestet: beide ePEF-SVGs, ein Spirometrie-SVG und 42 Kalendertag-Zellen wurden ohne Skriptfehler gerendert.
- Neues Logo, Style und Design-Skript in Offline-Cache-Liste, Manifest-Icons auf lokale Dateien gesetzt.

## Grenzen
- Browserprüfungen nutzten simulierte Tresorinhalte. Original-iPhone-Daten, Safari/WebKit, wirkliche verschlüsselte IndexedDB-/Backup-Wiederherstellung, OCR/Kamera und eine Live-GitHub-Pages-Seite konnten hier **nicht** vollständig Ende-zu-Ende getestet werden.
- Die generierten mobilen Vorschauen enthalten ausschließlich Testwerte, keine auf deinem Gerät abgefragten Gesundheitsdaten.
- Ein vorhandenes iOS-Homescreen-Symbol kann das alte App-Icon noch zwischenspeichern. Die App nicht nur deswegen löschen: lokale Daten könnten sonst verloren gehen.
- Bestehende scannerbedingte Safari-OCR-Grenzen bleiben unverändert; das Update ist eine Layoutmodernisierung, keine Behebung der Foto-OCR-Engine.
- Vor dem Upload vollständige verschlüsselte Sicherung erstellen. Nichts im Browser löschen und keinen neuen Tresor anlegen.
