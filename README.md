# Asthma 1.7.0 – Lokal, verschlüsselt, übersichtlich

**Webapp für den persönlichen Gebrauch – kein Medizinprodukt und keine Rechtsberatung.**

## Neue Funktionen

- **Lokaler Gesundheitsdatentresor** mit Passwortpflicht beim Öffnen: PBKDF2-HMAC-SHA-256 (450.000 Iterationen, zufälliger 16-Byte-Salt) und AES-GCM-256 (zufälliger IV je Datensatz). Das Passwort wird nicht auf den Server übertragen. Die verschlüsselten Daten bleiben in der lokalen IndexedDB-Datenbank des Browsers. Der Browser lädt die App-Dateien von GitHub Pages, nicht die Gesundheitsdaten.
- **Einmalige Migration** der bisherigen Profile, Anträge, Tagebücher, Dokumente und des Gesundheitsmanagers in den Tresor. Nach erfolgreicher Verschlüsselung und Prüfung werden die alten lokalen Datenspeicher logisch gelöscht. Bestehende verschlüsselte Zusatzakten benötigen beim ersten Umzug ihr bisheriges Passwort. Wenn die Bereinigung durch einen offenen alten Tab blockiert ist, erscheint eine Warnung und ein manueller Bereinigungs-Button.
- **Passwort ändern, App sperren**, automatische Sperre nach 10 Minuten Inaktivität und nach Rückkehr von längerer Hintergrundnutzung.
- **Vollständiges verschlüsseltes Backup** mit gesondertem Passwort (.asthma17) und Wiederherstellungsprüfung. Falsche Passwörter verändern vorhandene Daten nicht. Zusätzlich bleiben ältere Teil-Backupformate für ausgewählte Bereiche vorhanden.
- **Feste Schnellwahl unten:** Start, Lungenwerte, Kalender, Anträge, Akte und Mehr. Auf dem Smartphone ersetzen die Buttons die lange obere Navigation.
- **Privater Monatskalender** mit Arzt-/Therapieterminen, Lungenfunktionsprüfungen, Antragsstellung, Bewilligungen, selbst hinterlegten Fristen und Behandlungen. Lungenfunktionsmessungen, relevante Behandlungstermine, Anträge und Tagebucheinträge aus anderen Modulen werden im Kalender angezeigt. Manuell ergänzte Termine sind bearbeitbar und löschbar.
- **ICS-Export** für bewusste Übernahme in andere Kalender. ACHTUNG: Die exportierte ICS-Datei ist unverschlüsselt. Es gibt keine automatische externe Kalendersynchronisierung und keine zuverlässigen Push-Benachrichtigungen bei geschlossener App.
- **Keine extern nachgeladenen OCR-/PDF-Bibliotheken mehr.** Fotoaufnahme und Bildauswahl, Bilddrehung, Zuschnitt und manuelle Datenprüfung bleiben möglich. Bisherige automatische Texterkennung aus Fotos und PDF-Inhaltsauslesung sind aus Datenschutzgründen vorübergehend deaktiviert. Eine Rückkehr wäre erst mit lokal mitgelieferter, getesteter OCR-Software vertretbar.
- **Content-Security-Policy:** Skripte, Bilder und Netzanfragen der App sind auf denselben Host bzw. lokale Blob-/Datenbilder beschränkt. Externe amtliche Links werden nur durch bewusstes Öffnen besucht.

## Installation auf GitHub Pages

1. **Vor dem Update aus der bisherigen App ein vollständiges verschlüsseltes Backup erstellen und sicher aufbewahren.** Unter Umständen enthält es mehrere Teilbestände. Notiere das Passwort separat.
2. ZIP entpacken und **nur die enthaltenen App-Dateien direkt in das Wurzelverzeichnis** des Repositorys `4h7zm6hnjy-skizze/Asthma-` hochladen, vorhandene gleichnamige Dateien ersetzen. Nicht die ZIP selbst hochladen und keinesfalls persönliche Backups/Befundbilder zu GitHub hochladen.
3. Unter GitHub `Settings → Pages` ggf. `main / (root)` verwenden. Auf den erfolgreichen Pages-Workflow warten.
4. App-Link `https://4h7zm6hnjy-skizze.github.io/Asthma-/` öffnen, Version 1.7.0 kontrollieren.
5. Beim ersten Start neues Tresor-Passwort mit **mindestens 12 Zeichen** eingeben, bestätigen. Falls schon eine ältere **verschlüsselte** Zusatzakte eingerichtet wurde, zusätzlich das alte Passwort eingeben.
6. Prüfen, ob bisherige Werte, Befunde, Anträge und Termine vorhanden sind. Auf Warnungen zur Bereinigung alter Daten achten und alte App-Tabs schließen.
7. Ein neues vollständiges `.asthma17`-Backup erstellen, **eigenständig prüfen und extern sicher verwahren**. Das Browser-Storage kann durch Löschen von Websitedaten, Speicherbereinigung, Privatmodus oder einen Gerätewechsel verloren gehen.

## Datenschutzgrenzen

- Die App enthält keine eigenen Analyse-/Trackingdienste und keine automatische Synchronisierung. **Das bedeutet nicht, dass absolute Vertraulichkeit garantiert ist:** GitHub und das Netz können normale Website-Aufrufe sehen, das Betriebssystem oder ein kompromittiertes Gerät können Daten gefährden; ein manipuliertes GitHub-Update könnte theoretisch ebenfalls Daten auslesen. Nur App-Dateien sind öffentlich auf GitHub, keine persönlichen Inhalte (solange niemand selbst Dateien/Backups hochlädt).
- Die Webapp ist kein Ersatz für ein unabhängig geprüftes Medizinprodukte- oder Hochsicherheits-System. Es gibt keine unabhängige Sicherheitszertifizierung und keine Ende-zu-Ende-Verschlüsselung mit einem separaten vertrauenswürdigen Server; die App betreibt bewusst keinen eigenen Datenspeicherserver.
- Die „Löschen“-Funktion entfernt Daten logisch aus dem Browserspeicher, keine forensische Löschgarantie.
- Die AES-GCM-Verschlüsselung schützt gespeicherte Datensätze, solange die App gesperrt ist und Passwort/Browser/Endgerät nicht kompromittiert wurden. Während der Benutzung liegen entschlüsselte Daten und der Schlüssel vorübergehend im RAM.
- Beim Teilen/Exportieren von Arztberichten, CSV oder ICS entstehen **unverschlüsselte Dateien**. Nur der ausdrücklich als verschlüsselt gekennzeichnete Komplett-Backup-Export ist geschützt.
- Für intensive medizinische Nutzung ist es wichtig, original Befundunterlagen zu kontrollieren. Die App erstellt keine Diagnose, keinen automatischen Leistungsanspruch und keine rechtsverbindliche Fristberechnung.

## Wichtige Dateistruktur

`index.html`, `styles.css`, `secure17.js`, `calendar17.js`, `content.js`, `app.js`, `antraege-data.js`, `antraege.js`, `meine-daten.js`, `lungenprofil.js`, `befundscan-parser.js`, `befundscan.js`, `suite15.js`, `region16.js`, `sw.js`, `version.json`, `manifest.webmanifest`, `icon.svg` sowie Dokumentationsdateien.

Informationen zu bestehenden medizinischen und rechtlichen Quellen siehe `QUELLEN.md`, `ANTRAEGE_QUELLEN.md`, `LUNGENFUNKTION_QUELLEN.md`, `REGION_QUELLEN.md` und die weiteren Quellenübersichten.
