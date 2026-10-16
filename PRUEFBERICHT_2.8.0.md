# PRÜFBERICHT: Asthma 2.8.0 Professional

Datum: 16.10.2026

## Lieferumfang
- Vollständige WebApp mit **83 Dateien** inklusive Dokumentation und bisherigen Modulen, neues Modul `quality28.js`, Stylesheet `quality28.css`.
- Weiterhin das blau-türkise 180/192/512-Pixel-Logo. PWA-Manifest und HTML-Verknüpfungen unverändert kompatibel.
- Version 2.8.0 in Oberfläche (`index.html`), `app.js`, Service Worker, `version.json` und dem neuen Modul.

## Umgesetzte Funktionen
1. Tagesübersicht mit letztem dokumentierten PEF, Bedarfsanwendungen in sieben Tagen und dokumentierten Beschwerde-Nächten in 30 Tagen.
2. Schnelleintrag ins bestehende **verschlüsselte** Asthma-Tagebuch, ohne Änderung der Datensatzfelder. Nutzer entscheidet selbst, wann gespeichert wird.
3. Separate Trendanzeige über 7/30/90/365 Tage mit Tagebuch-PEF-Mittelwert, dokumentierten Tagen und Anzahl ärztlicher Untersuchungen; keine klinische Bewertung.
4. Lesende Prüfung einer vollständigen `.asthma17`-Sicherungsdatei mit Passwort (Formintegrität + AES-GCM-Entschlüsselung + Duplikat-Prüfung), **ohne Datenbank-Zurücksetzung oder Import**.
5. Dokumentenablage nach Dateiname, Dokumentart und Datum lokal filtern.
6. Name/Geburtsdatum aus dem verschlüsselten Profil optional im bereits vorhandenen Monats-/Jahres-PDF-Bericht; unverschlüsselten Druck ausdrücklich kennzeichnen.
7. Lokale Online-/Offline-, Service-Worker- und Speicher-Diagnose, Zurück-zur-Übersicht-Schaltflächen.
8. Sicherere Profilbearbeitung und Löschbestätigung. Vorherige persönliche Daten bleiben bis zu erfolgreicher Speichertransaktion bestehen.

## Durchgeführte Prüfungen
- `node --check`: **32 JavaScript-Dateien ohne Syntaxfehler**.
- Service-Worker-Vollständigkeit: **43 Cache-Ressourcen** referenziert; **0 fehlend**.
- HTML-Verknüpfungen: **10 eindeutige lokale Verweise**, **0 fehlend**.
- Logos: 180×180, 192×192, 512×512 Pixel geprüft.
- Simulierter DOM-/Formulartest in Headless Chromium auf **320, 390, 430, 768 px**: Tages-Schnelleintrag mit 3 Bedarfsanwendungen und Beschwerdegrad 2 schreibt kompatiblen Tagebuchdatensatz, keine ungefangenen Fehler und kein horizontaler Überlauf.
- AES-GCM-Backupprüfung mit generierter Testdatei: lesbares Archiv und zwei Gruppen erkannt; falsches Passwort wurde abgelehnt.
- Die bisherigen Datenbank-Gruppen und das Passwortformat (Asthma-v17-Vault) wurden nicht absichtlich verändert.

## Nicht als bestanden bestätigt
- Vollständiger **Live-Start** der App in Chromium: Lokale Navigation wurde mit `ERR_BLOCKED_BY_ADMINISTRATOR` durch die Testumgebung blockiert. Kein Ende-zu-Ende-Test möglich.
- Safari auf echtem iPhone: Anmeldung, tatsächliches Archiv-Downloadverhalten, Backup-Import/Wiederherstellung, Offline-Start nach Netzverlust, PDF-Speicherung und Kamera/OCR nicht geprüft.
- Keine vollständige unabhängige Sicherheitsanalyse, keine medizinische Bewertung von Messwerten und keine Garantie gegen Datenverlust.
- Keine automatische Erinnerung im Hintergrund: iPhone-WebApps unterliegen Browser-/iOS-Grenzen.

## Sicherheit & Installation
- Erst vollständige Sicherung erstellen, dann alle ZIP-Dateien **direkt** in das GitHub-Repository-Hauptverzeichnis laden und committen.
- Bereits installierte iPhone-WebApp **nicht löschen** und **keine Safari-Website-Daten löschen**.
- Namen, Adressen und Gesundheitswerte werden **nicht** im öffentlichen GitHub-Quellcode gespeichert.
