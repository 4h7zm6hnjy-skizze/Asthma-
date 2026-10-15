# Prüfbericht Asthma 2.2.0

- ePEF-Diagramme in `#uebersicht` auf der Startseite; dieselben Daten wie im Tagebuch.
- Vorzugsansicht letzte 30 Messungen, alternative Zeitbereiche; getrennte PEF-/FEV₁-Charts.
- Vorhandene Messungen werden aus `ASTHMA_SECURITY.list('epef')` gelesen, nicht kopiert oder nochmals importiert.
- Exakte Fingerabdrücke (Datum/Uhrzeit/PEF/FEV₁) verhindern Duplikate; ungleiche Messungen derselben Minute bleiben.
- Alt-Duplikate werden ausschließlich nach ausdrücklicher Bestätigung entfernt.
- Keine Änderungen am Verschlüsselungsformat oder vorhandenen Tresor-Keys.

**Grenzen:** Es ist keine echte ePEF-Exportdatei des Nutzers verfügbar; zuvor synthetisch getestete XLSX-Formate können sich unterscheiden. Der tatsächliche lokale Datenspeicher des iPhones ist von außen nicht sichtbar, daher wird das Erscheinen importierter Werte auf seinem Gerät erst beim Öffnen testbar.

## Durchgeführte Prüfungen (lokale Browser-Simulation)
- XLSX-Testdatei mit doppelter Messung und zwei verschiedenen Messungen in derselben Minute importiert: 4 unterschiedliche Werte gespeichert.
- Dieselbe XLSX-Datei erneut eingelesen: 0 neue Datensätze, 4 bereits gespeicherte, Übernahmebutton deaktiviert.
- Identischen Alt-Eintrag hinzugefügt: Bereinigungsbutton wird angezeigt; erst nach bestätigtem Dialog wird genau ein identischer Eintrag entfernt.
- Beide Startseitendiagramme zeigen die gespeicherten PEF-/FEV1-Einträge, inklusive Grün/Blau/Rot nach Uhrzeit; Antippen zeigt Details.
- Darstellung bei 320, 375, 390, 430, 768 und 1024 CSS-Pixeln ohne horizontales Überlaufen und ohne JavaScript-Fehler.
- ZIP-Dateien, Version 2.2.0 und JavaScript-Syntax geprüft.

**Nicht live verifiziert:** Passwort-Tresor, IndexedDB, GitHub-Pages-Livebetrieb oder der reale iPhone-Datenbestand. HTTPS-/localhost-Browsernavigation ist in dieser Testumgebung mit `ERR_BLOCKED_BY_ADMINISTRATOR` gesperrt. Für diese Prüfungen wurde ein simulierter Tresor verwendet; die bestehende Verschlüsselungsimplementierung und ihr Datenformat wurden nicht verändert.
## Abschlussprüfung 15.10.2026

In isoliertem Chromium-Browsertest wurden folgende Abläufe bei 320, 390 und 430 px Bildschirmbreite geprüft:
- XLSX-Testdatei: 5 Zeilen mit 1 internem Duplikat, 4 unabhängige Messungen übernommen.
- Die zwei unterschiedlichen Messungen am 15.10.2026 um 07:31 Uhr wurden erhalten.
- Beide Startseiten-Diagramme wurden aus denselben 4 gespeicherten Testmessungen gezeichnet und zeigen ihren Wert beim Antippen.
- Erneuter Import der identischen XLSX erzeugt 0 neue Einträge, Importbutton bleibt deaktiviert.
- Bei einem künstlich hinzugefügten exakten Alt-Duplikat verlangt die App eine Bestätigung und entfernt ausschließlich den Duplikateintrag.
- Bei allen drei Breiten: 0 px horizontaler Überlauf, keine ungefangenen JavaScript-Fehler.
- Farben kennzeichnen ausschließlich Zeitfenster, kein Gefahrenniveau. Segmentwechsel werden in der Linienmitte dargestellt.

**Nicht getestet:** die tatsächliche verschlüsselte IndexedDB auf dem iPhone oder die originale ePEF-Exportdatei des Nutzers. Der Browser-Stresstest nutzte einen simulierten Speicher; Passwörter und Verschlüsselung wurden nicht erneut auditiert. Das vollständige Paket enthält unverändert den bisherigen verschlüsselten Datentresor. Nutzer sollten vor dem Update ein vollständiges verschlüsseltes Backup erstellen.
