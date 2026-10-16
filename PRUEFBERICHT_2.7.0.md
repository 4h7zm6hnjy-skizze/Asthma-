# Asthma 2.7.0 – Prüfbericht (automatischer Build)

## Ergebnisse
- Neues App-Symbol in 192, 512 und Apple-Touch-180 Pixeln als echte PNG-Dateien geprüft.
- Navigationsziele, Seitenstruktur, Komponenten, Versionsangaben: statisch überprüft.
- Alle 41 Offline-Dateireferenzen im Projekt gefunden.
- node --check für 31 JavaScript-Dateien bestanden.
- Kein echter iPhone-Safari-Ende-zu-Ende-Test: NICHT als bestanden gekennzeichnet.
- Vorhandene Datensätze werden vom ZIP-Build nicht gelesen oder verändert.
- Alle App-Dateien liegen für GitHub-Upload im ZIP-Root; neue iPhone-Icons sind enthalten.
- Bestehende Datei- und Messgruppenschlüssel nicht absichtlich verändert.
- Bestehende medizinische Berechnungen nicht überarbeitet.
- Noch offen: vollständige 2.7-Roadmap mit komplexen Kalender-/Dokumenten-/Therapietests und iPhone-E2E-Verifikation.

## Wichtige Grenzen
Der Builder kann nicht den persönlichen, verschlüsselten Tresor auf einem echten iPhone testen und verspricht weder fehlerfreie Backup-Wiederherstellung noch vollständige Sicherheitsprüfung. Vor der Aktualisierung Backup erstellen und die alte Installation nicht löschen.

## Persönliche Daten
Die App-Version enthält KEINE voreingetragenen echten Namen, Geburtsdaten, Gewichte oder Adressen. Diese werden erst nach dem Entsperren lokal gespeichert.

## Zusätzliche Kontrolle der iPhone-Vollversion
- 75 Ursprungsdateien und neue Assets aus der vollständigen 2.6.0-Gesamtdatei zu einer 2.7.0-Vollversion zusammengeführt.
- Statische DOM-Prüfung: `#peakflow` und `#lungenwerte` sind getrennte Bereiche; ePEF ist Kind des Peak-Flow-Bereichs.
- JavaScript-Syntax aller Module mit Node.js geprüft.
- Chromium/Playwright-Aufrufe auf lokale Prüfseiten werden in dieser Arbeitsumgebung mit `ERR_BLOCKED_BY_ADMINISTRATOR` abgewiesen. **Deshalb kein erfolgreicher Live-Browser- oder iPhone-Ende-zu-Ende-Test behauptet.**
- Persönliche Patientendaten werden nicht als Klartext ins Repository übernommen. Die Felder bleiben leer, bis sie in der entsperrten App ausgefüllt werden.
