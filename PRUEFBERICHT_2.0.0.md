# Prüfbericht – Asthma 2.0.0 (15.10.2026)

## Tests und Resultat

Testumgebung: Chromium, isoliertes HTML, lokal injizierte App-Skripte, **simulierter Sicherheitsspeicher** und synthetische Testdaten. Keine Live-GitHub-Pages- oder iPhone-Safari-Tests. Automatisiertes Testskript intern: `test_asthma_v200_isolated.py`.

- **56 von 56 im isolierten Browser geprüfte Fälle bestanden.**
- Alle 16 Navigationsbereiche auf 390 px, dazu 7 Kernansichten bei 320, 375, 430 und 768 px ohne horizontales Überlaufen.
- Alle alten Eingabe-IDs für Lungenwerte vorhanden; Prozent/Liter editierbar.
- iPhone-Schaltfläche fokussiert das lokale Textfeld (der echte iOS-Kamera-Dialog ist nicht simuliert).
- Geratherm-artige Tabelle (FEV1 2,52 L / 54 % Soll, FVCex 2,95 L / 51 % Soll, FVCin 3,06 L / 53 % Soll, FEV1/FVC 85 %) inklusive Datum wird aus bereitgestelltem **Text** zugeordnet.
- Erfasste Messwerte werden im simulierten Datenspeicher erst nach Nutzerbestätigung gespeichert.
- Scanner-Selbsttest prüft die Zuordnung und kennzeichnet den künstlichen Datensatz.
- Lokal lesbare einfache und komprimierte Text-PDFs aus Testdaten werden ohne externe Abfragen ausgelesen. PDF-Tests umfassen ASCII85 + FlateDecode, nicht aber komplexe CMaps/Bild-PDFs.
- Private Suche und Navigation getestet. Keine ungefangenen JS-Fehler in diesem isolierten Test.
- `node --check` für alle JavaScript-Dateien; HTML-IDs und Service-Worker-Dateiliste statisch geprüft.

## Nicht als vollständig geprüft zu betrachten

- **Automatische OCR direkt aus dem iPhone-Foto:** Weiterhin nicht vorhanden, weil WebKit kein generisches Web-OCR bereitstellt und keine lokal gebündelte WebAssembly-Tesseract-Engine zum Paket gehört. iPhone Live Text ist die native, ohne Upload nutzbare Alternative.
- Echte verschlüsselte IndexedDB und Backup-Migration: Diese Testreihe verwendete einen **Mock**, daher kein positiver Testnachweis mit persönlichen Daten oder echtem Browser-Tresor.
- Passwortwechsel: Falschen Methodenaufruf korrigiert; keine Ende-zu-Ende-Prüfung mit dem realen Tresor auf iPhone.
- PDF: Die vereinfachte lokale Analyse ist keine allgemeine PDF-Engine. Für komplexe Textkodierung und reine Scan-PDFs keine Erkennungsgarantie.
- Kamera-Zugriff, tatsächliches iOS-„Text scannen“-Menü, Update über Service Worker und `file://`-Betrieb nicht live getestet.
- Keine formale Sicherheitsanalyse und kein Nachweis eines absolut ausgeschlossenen Drittzugriffs.

## Datensicherheit

Die Website sendet beim vorgesehenen lokalen Scannerablauf keine Befundbilder an externe Texterkennungsdienste. Der Code kann nicht den Schutz vor manipulierten Hosting-Dateien, kompromittierten Endgeräten oder freiwillig geöffneten externen Seiten garantieren. Verschlüsselte Backups selbst getrennt verwahren. Für den produktiven Einsatz echte Geräteprüfung erforderlich.
