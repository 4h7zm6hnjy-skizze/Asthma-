# Asthma – Version 1.3.0

Webapp für Asthma, Hilfsmittel, Antragswege, GdB und Arbeitsrecht, ergänzt um einen privaten, lokalen Bereich für Anträge, Unterlagen und einen Symptomverlauf.

## Neu in 1.3.0

- **Meine Antragsakte:** Vorgänge aus dem Antragszentrum übernehmen oder selbst erstellen; Status (geplant, eingereicht, Nachforderung, bewilligt, abgelehnt, Widerspruch, abgeschlossen), zuständige Stelle, Aktenzeichen, Einreichdatum, Bescheid-Datum, Notizen und selbst geprüftes Fristdatum. Filter und Fristübersicht beim Öffnen der App.
- **Dokumente:** Lokal PDF, Bilder und einige Office-/Textformate bis 12 MB je Datei hinterlegen und einem Antrag zuordnen; Einzeldateien öffnen/exportieren oder löschen. Kein OCR, kein Upload an einen Cloud-Server.
- **Asthma-Tagebuch:** Datum/Uhrzeit, Peak-Flow (L/min), subjektive Beschwerden, Anzahl Bedarfsanwendungen, nächtliche Beschwerden und Auslöser. Lokales Trenddiagramm, Bearbeiten/Löschen und CSV-Export. Keine Diagnose oder medikamentöse Therapieanweisung.
- **Passwortgeschützte Sicherung:** Export/Wiederherstellung sämtlicher persönlicher Akten, Dokumente, Tagebuchwerte und der gespeicherten GdB-Einstellungen. Die exportierte Datei wird mit PBKDF2-SHA256 (250.000 Durchläufe) und AES-GCM-256 verschlüsselt. Passwort selbst sicher verwahren, es gibt keine Wiederherstellung des Passworts.
- Direktzugriff **„Meine Antragsakte öffnen“** und **„In meine Antragsakte übernehmen“** bei Hilfsmitteln und Anträgen.

## Erhaltene Funktionen

- GdB-Auswahl 10 bis 100 in Zehnerschritten (GdB 10 als reiner Vergleichswert), gesonderte Auswahl für bewilligte Gleichstellung bei GdB 30/40.
- 29 Antrags- und Informationswege zu Hilfsmitteln, Atemphysiotherapie, Lungensport, Reha, Arbeitsrecht, Finanzen und GdB sowie zugehörige Mustervorlagen.
- Fachartikel zu Rechten und Leistungen mit Quellen, Suchfunktion, Merkliste, Versionsanzeige und Updateprüfung.
- Service Worker für statische App-Dateien und Offline-Nutzung nach der ersten erfolgreichen Einrichtung.

## Datenschutz und Grenzen

**Lokale Datensätze in IndexedDB und LocalStorage sind standardmäßig NICHT verschlüsselt.** Andere Personen mit Zugriff auf das Gerät oder Browserprofil können sie gegebenenfalls lesen. Die Webseite sendet diese Datensätze nicht an einen Server und verwendet keine Trackingdienste. Ein verschlüsseltes Backup schützt **nur die exportierte Datei**, nicht automatisch den Browserspeicher.

Nur der offizielle Quellenlink führt zu einem externen Anbieter. **Weder Mustervorlagen noch Anträge werden automatisch versendet.** Das Speichern von Einträgen ist kein Nachweis für die Einreichung bei einer Behörde. Die Fristanzeige zeigt ausschließlich selbst hinterlegte Daten und kann keine Rechtsbehelfsbelehrung prüfen. Keine automatische Benachrichtigung bei geschlossener App. Die 12-MB-Grenze gilt pro einzelner Datei; für verschlüsselte Backups liegt die Dokument-Gesamtgrenze aus Speichergründen bei 32 MB. Darüber hinaus begrenzt der Browser die Gesamtkapazität.

Die App ist kein Medizinprodukt, erhebt keinen Anspruch auf medizinische Diagnose oder individuelle Rechtsberatung. Bei schwerer Atemnot Notruf 112 und den ärztlichen Notfallplan befolgen.

## Installation in GitHub Pages

1. Alle Dateien aus der ZIP **direkt ins Wurzelverzeichnis** des Repositorys `4h7zm6hnjy-skizze/Asthma-` hochladen und vorhandene gleichnamige Dateien ersetzen. Keine ZIP als einzelne Datei hochladen.
2. In GitHub unter **Settings > Pages** `Deploy from a branch`, Branch `main`, Ordner `/ (root)` wählen.
3. Veröffentlichungsstatus unter **Actions** kontrollieren. Danach `https://4h7zm6hnjy-skizze.github.io/Asthma-/` öffnen.
4. Auf iPhone in Safari `Teilen` → `Zum Home-Bildschirm` (erst nachdem die Seite erfolgreich geladen wurde).
5. Bei Update den Button **Nach Updates suchen** verwenden. Bei Bedarf Webseite neu öffnen/Cache aktualisieren.

**Vor dem Update persönliche Daten sichern**, sobald die Antragsakte benutzt wird. Ältere Profildaten werden weiterhin unter demselben LocalStorage-Schlüssel gelesen. Der neue private Bereich verwendet eine eigene IndexedDB-Datenbank und löscht keine vorher vorhandene Anwendungsspeicherung. 

## Dateien

`index.html`, `styles.css`, `content.js`, `app.js`, `antraege-data.js`, `antraege.js`, `meine-daten.js`, `sw.js`, `version.json`, `manifest.webmanifest`, `icon.svg`, `QUELLEN.md`, `ANTRAEGE_QUELLEN.md`, `NEUE_QUELLEN.md`, `DATENSCHUTZ.md`, `PRUEFBERICHT.md`, `browser_smoke.py` (älterer Beispieltest).


## Neue Funktionen 1.3.0: Lungenfunktions-Profil
- GdB-Auswahl (10–100), FEV1 (0–100 % vom Soll) und optionale FVC (0–100 % vom Soll) getrennt veränderbar.
- Sowohl Zahleneingabe als auch Schieberegler, jeweils mit Zurücksetzen; auch der Wert **0 %** ist technisch erlaubt, wird aber mit Verifikationshinweis ausgegeben.
- Optionales Befunddatum und vier freiwillige Angaben zur Alltagsbelastung.
- Automatisch aktualisierte Hilfsangebote aus dem vorhandenen Katalog mit passenden offiziellen Quellen und Weiterleitung zu Antragsvorlagen.
- Automatische Einstufung in einen Bewilligungsanspruch erfolgt **nicht**; insbesondere kein Rückschluss auf Sauerstoffbedarf, GdB, Asthma-Schweregrad oder Therapie aus FEV1/FVC-Sollprozenten allein.
- Speicherung im bestehenden lokalen Profil: enthalten im passwortverschlüsselten Export der Version 1.2.0; bisherige Profildaten bleiben beim Update erhalten.
- GINA 2026 stuft FEV1 < 60 % vom Soll als Risikofaktor für Exazerbationen ein. Kein eigenständiges Akut-Notfallkriterium.
