# Asthma-Webapp – Intensivprüfung 3.1.8

Stand: 24.10.2026. Automatisierte statische Prüfungen, keine Live-iPhone-Garantie.

## Belegte reparierte Fehler
- Serverversion und Hauptprogrammversion waren verschieden (3.1.7 / 3.0.5).
- Skriptlader und HTML nutzten alte Cache-Kennungen.
- Der Installationsknopf konnte bei gleicher Version weiterhin neu starten.
- Die Offline-Diagnose suchte starr Cache 3.0.4.

## Prüfumfang
- Syntax aller lokalen JavaScript-Dateien (Node.js).
- Doppelte statische HTML-IDs.
- Vorhandensein von 68 Offline-Cache-Dateien und 38 geladenen App-Modulen.
- Erhalt des vorhandenen AES-GCM-/PBKDF2-Tresors im Code.
- Vorhandensein der Suche / Navigation aus Version 3.1.7.
- Es werden keine medizinischen Daten geladen, migriert, gelöscht oder veröffentlicht.

## Kritischer offener Datenschutzpunkt
Das GitHub-Repository ist öffentlich; Datenimporte mit Namen wie
`PhysioSport_und_Lungenfunktion_23-10-2026.json` und
`WorksManager_Treppen_13_Eintraege_PRIVAT.json` sind im Projekt vorhanden.
**Die Dateien sollten nicht öffentlich verfügbar sein.** Repo privat stellen und
betroffene Dateien auch aus der Git-Historie entfernen; das erfordert eine gesonderte,
mit dem Eigentümer abgestimmte Aktion.

## Grenzen
Kein vollständiger medizinischer Funktionstest mit realen Patientendaten; kein echter
Apple-iPhone-Test von Safari, verschlüsselten Backup-Rückspielen oder PDF-Druck.
Nicht bestätigte Funktionen werden nicht als fehlerfrei bezeichnet.
