# Prüfbericht – Nucala 28-Tage-Termine, Vierjahreskalender

Basis: Asthma 2.8.1, GitHub-Hauptzweig 16.10.2026 nach Rechtsmonitor Quellenfix 3. Die drei ersetzten Dateien `calendar17.js`, `secure17.js` und `sw.js` wurden bytegenau mit ihren existierenden GitHub-Blob-SHAs verglichen, **bevor** sie geändert wurden.

## Abgedeckte Testfälle

- `node --check` für alle vier JavaScript-Dateien erfolgreich.
- Isolierter mobiler Chromium-Test mit simulierter, verschlüsselt speichernder Profil-Schnittstelle auf 390 Pixeln: kein ungefangener JS-Fehler oder horizontaler Überlauf.
- Startdatum 17.10.2026: exakt **53** Termine in 28-Tage-Schritten innerhalb von vier Kalenderjahren; letzter Termin 12.10.2030.
- Neue Kalenderkategorie `nucala` mit Spritzensymbol im Monatskalender und Bearbeiten-Funktion am einzelnen Termin.
- Individuelle Terminverschiebung einschließlich Zurücksetzen; andere Termine bleiben unverändert.
- Serienbeginn änderbar, alle weiteren Termine werden neu berechnet.
- ICS exportiert 53 `VEVENT` und bei aktivierten beiden Optionen **106** `VALARM`-Blöcke, mit Zeitzone `Europe/Berlin` und Sommerzeitdefinition.
- Gespeicherte Konfiguration wird ausschließlich über vorhandenes `ASTHMA_SECURITY.updateProfile` im AES-GCM-verschlüsselten Profil geschrieben; der öffentliche GitHub-Code enthält kein festes persönliches Injektionsdatum.
- Existierende Medikamente, Dosen und Behandlungsdaten werden durch das neue Modul nicht geändert.
- Die vorhandenen Rechtsmonitor-Dateien sowie Workflow und `rechtsmonitor-feed.json` werden nicht verändert.

## Nicht abschließend prüfbar

- Importablauf der heruntergeladenen `.ics`-Datei auf einem konkreten iPhone mit Apple Kalender sowie Auslösung der Gerätemitteilungen.
- Echte iPhone-Safari-/Homescreen-PWA-Entsperrung, lokale Datensicherung, vollständige App-End-to-End-Prüfung.
- GitHub-Pages-Cache-Aktualisierung nach dem Hochladen durch den Nutzer.

Es handelt sich um Terminplanung, nicht um Therapie- oder Einnahmeberatung. Uhrzeitvorschlag 09:00 bitte ändern, falls unpassend. Die App kann beim Schließen keine eigenständigen Hintergrund-Push-Meldungen auslösen.
