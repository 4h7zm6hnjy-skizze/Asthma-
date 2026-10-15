# Prüfbericht – Asthma 1.7.0

Datum: 15. Oktober 2026. Stand: fertiges ZIP für GitHub Pages, **noch nicht live hochgeladen**.

| Test | Ergebnis | Einschränkung |
| --- | --- | --- |
| Versionsdatei, Script-Einbindungen, Service Worker | bestanden | Live-Cache muss nach Veröffentlichung geprüft werden |
| JavaScript-Syntax der gelieferten Module | bestanden | Keine vollständige medizinische Fachprüfung |
| 6 Schnellwahl-Buttons, Navigationswechsel, Kalenderanzeige auf 390px | bestanden | Isolierter Chromium-Browsertest, nicht iOS Safari |
| Kalendertermin erstellen, verschlüsselte Daten-API verwenden | bestanden | UI-Test mit gemocktem Tresor; reale Browserpersistenz nicht auf iPhone geprüft |
| Migration alter Profildaten, Anträge, Dokumente und Messwerte | bestanden | Isolierter kryptografischer Test mit künstlichen Daten |
| Verschlüsselung neuer Einträge AES-GCM / keine Klartextdatensätze | bestanden | Simulierter IndexedDB-Test, keine externe Sicherheitsprüfung |
| Passwortgeschützter Gesamtexport und Restore | bestanden | Simulierter DB-Test; große echte Backups nicht getestet |
| Falsches Backup-Passwort verändert keine Daten | bestanden | Simulierter Test |
| Mobile Darstellung ohne horizontales Scrollen | bestanden | Chromium 390px breit |
| OCR-/PDF-Drittanbieter-Code | automatische Nachladung entfernt | OCR und PDF-Textauslesen vorübergehend **nicht verfügbar** |
| Netzwerk-Datenschutz | statische Prüfung der App-Dateien und CSP | Keine Garantie gegen kompromittierten Host/Browsersystem |
| iPhone/Safari, GitHub-Pages-Live-Deployment | offen | Nutzertest nach Upload erforderlich |

**Tests:** `node --check` der JS-Dateien, `node test17_crypto.cjs`, `python test17_ui.py`. Einige End-to-End-Live-Tests in dieser Umgebung schlugen schon beim Navigationszugriff mit `ERR_BLOCKED_BY_ADMINISTRATOR` fehl. Dies ist kein Nachweis eines Fehlers der Webapp, aber beschränkt die Testabdeckung.

**Sicherheitsrelevante Einschränkungen:** Verschlüsselung schützt bei verschlossenem Tresor die lokalen gespeicherten Inhalte, nicht gegen kompromittierte Geräte oder vom Benutzer bewusst exportierte unverschlüsselte Dateien. Browserpersistenz, die Datenmigration einer tatsächlich genutzten älteren Version und die Wiederherstellung großer Dokumente müssen vor alleiniger Nutzung mit einem iPhone überprüft werden. Frühere Daten vor dem Update separat sichern.
