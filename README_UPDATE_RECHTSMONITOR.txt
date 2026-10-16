ASTHMA – RECHTSMONITOR, Filter-Update 2
Basis-App: Asthma 2.8.1 (GitHub-Stand vom 16.10.2026)

DATEIEN IN DIESEM UPDATE:
  build_rechtsmonitor_feed.py
  rechtsmonitor.js
  rechtsmonitor.css
  sw.js
  README_UPDATE_RECHTSMONITOR.txt

WAS SICH VERBESSERT:
- Drei Ansichten: „Möglicherweise für mich relevant“, „Allgemeine Änderungen“, „Alle Treffer“.
- Fehlzuordnungen wie „Gleichstellung von Prüfungszeugnissen“, Tierarzneimittel und Luftfahrtverordnungen werden ausgeschlossen.
- Enger und allgemeiner Themenbezug werden getrennt: Schlagwort = KEIN individueller Anspruch.
- Hinweise zur Rechtswirkung: Verfahren, Beschluss, vorbehaltliche Wirksamkeit oder Inkrafttreten erwähnt – immer Original prüfen.
- Meldungsdatum wird als RSS-Meldedatum bezeichnet, NICHT als Tag des Inkrafttretens.
- G-BA-RSS-Adressen wurden anhand offizieller RSS-Verlinkungen korrigiert:
  https://www.g-ba.de/letzte-aenderungen/rss.xml
  https://www.g-ba.de/beschluesse/letzte-aenderungen/rss.xml
- Doppelte Einträge aus mehreren Quellen werden zusammengeführt.
- Bei fehlgeschlagenen Quellabrufen bleibt die bisherige JSON-Datei erhalten; Quelle wird mit Fehlstatus angezeigt.
- Nur amtliche öffentliche RSS-Meldungen werden auf GitHub veröffentlicht, keine privaten Daten.
- Vorhandener GitHub-Workflow bleibt erhalten. Die Python-Datei MUSS IM ROOT liegen, weil dein bestehender Workflow dort sucht.

INSTALLATION AUF DEM IPHONE:
1. Wie bei allen Updates zuerst eine vollständige verschlüsselte .asthma17-Sicherung der App erstellen und separat aufbewahren.
2. ZIP in iPhone „Dateien“ entpacken.
3. Auf https://github.com/4h7zm6hnjy-skizze/Asthma- gehen.
4. Über „Add file → Upload files“ die vier Dateien build_rechtsmonitor_feed.py, rechtsmonitor.js, rechtsmonitor.css und sw.js in das HAUPTVERZEICHNIS hochladen. Gleichnamige Dateien ersetzen. Die Anleitung kann zusätzlich mit hochgeladen werden.
5. „Commit changes“ bestätigen.
6. Unter Actions → „Amtliche Rechtsupdates sammeln“ → „Run workflow“ den Branch main wählen und starten.
7. Auf einen grünen Haken warten, dann in rechtsmonitor-feed.json kontrollieren, ob "classifierVersion": 2, generatedAt mit Zeitstempel und die drei Quellen erscheinen.
8. Die bestehende iPhone-WebApp wie gewohnt öffnen, ggf. vollständig schließen und neu öffnen. Weder Homescreen-App noch Safari-Daten löschen.
9. Wissen → Rechtslage aktualisieren: drei Filter prüfen.

WICHTIG:
- Die allgemeine App-Versionsanzeige bleibt 2.8.1. Der Service-Worker-Cache erhält eine neue Kennung, damit die neue Rechtsmonitor-Ansicht installiert werden kann.
- Die bestehende .github/workflows/rechtsmonitor.yml bleibt unverändert.
- Die bestehende rechtsmonitor-feed.json NICHT durch eine leere Datei überschreiben. Sie wird vom Workflow aktualisiert.
- Die Einordnung ist eine konservative Schlüsselwortanalyse. Sie kann Rechtsänderungen übersehen oder zu breit einstufen. Nur offizielle Ursprungsquellen und rechtliche Beratung können die tatsächliche Geltung/Ansprüche klären.
- Keine medizinische oder rechtliche Einzelfallberatung und keine automatische GdB-Neubewertung.
- Der neue Code ist lokal mit Test-Feeds und Chromium getestet. Der Live-GitHub-Workflow und dein privater iPhone-Speicher können erst nach dem Upload geprüft werden.
