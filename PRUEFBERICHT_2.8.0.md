# Asthma 2.8.0 – Prüfbericht, 16.10.2026

## Implementiert
- Vorhandene 2.7.0-Dateien übernommen, keine medizinischen Datensätze aus dem iPhone gelesen.
- `quality28.js` und `quality28.css` als neue Module nur nach Entsperren eingebunden.
- Tages-Schnellerfassung schreibt in den vorhandenen verschlüsselten `diary`-Bereich und verwendet die bisherigen Feldnamen.
- 7/30/90/365-Tage-Übersicht liest bestehende Datensätze (`diary`, `epef`, `suite`); kein automatisches Krankheitsrisiko.
- Dokumentensuche lokal im aktuellen Browser, keine zusätzliche Suche im Netzwerk.
- Lesende `.asthma17`-Sicherungsprüfung entschlüsselt im Speicher und prüft Datensatz-IDs auf Konsistenz; sie ruft keinerlei Restore- oder Schreibvorgang auf.
- Diagnostik für Online/Offline, aktive Service-Worker-Registrierung, lokalen Speicher. Keine Telemetrie.
- Bestehendes Profil beim Speichern durch serialisierte Updates gegen konkurrierende Schreibvorgänge abgesichert.
- Fehlleitende Datenschutzbeschreibung der Aktenseite an die bereits vorhandene lokale Verschlüsselung angepasst.

## Tests und Grenzen
- Alle JavaScript-Dateien wurden mit `node --check` syntaktisch geprüft.
- Die JSON-Version, der SW-Cache, die Referenzlisten und HTML-Dateiverweise wurden abgeglichen.
- Mehrere Dateien, darunter Startseite, Profil, Datenspeicherung und SW, wurden statisch geprüft.
- Chromium/Playwright blockiert in dieser Umgebung lokale und Datei-URLs mit `ERR_BLOCKED_BY_ADMINISTRATOR`. Daher **kein erfolgreicher Browser- bzw. iPhone-Ende-zu-Ende-Test** von Anmeldung, Datensicherung, Offline-Cache, Navigation oder Tagebucheinträgen. Diese Funktionen müssen auf dem eigenen Gerät geprüft werden.
- Die Backup-Prüfung bestätigt ausschließlich entschlüsselbare Datei-Inhalte, nicht die dauerhafte Speicherung in iOS „Dateien“ und nicht die tatsächliche Wiederherstellbarkeit in jeder Browserinstallation.
- Noch nicht umgesetzt: lückenlose iOS-Hintergrunderinnerungen, vollständige eigene Arztbrief-Generierung, automatisches ACT-Scoring, Diagnose- oder Ampelautomatik. Vorhandene Arztbericht-/Medikamentenfunktionen bleiben unverändert.
- Persönliche Stammdaten werden nicht öffentlich im Repository vorbelegt. Exportierte PDFs/CSVs sind unverschlüsselt und müssen geschützt werden.

## Vorsicht bei Updates
Vor der Veröffentlichung verschlüsseltes `.asthma17`-Backup extern speichern; bisherige Safari- oder Home-Bildschirm-Installation nicht löschen, Website-Daten nicht zurücksetzen. Versionsstand nach dem GitHub-Commit in `version.json` und Startseite prüfen.
