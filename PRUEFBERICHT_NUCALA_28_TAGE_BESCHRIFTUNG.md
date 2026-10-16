# Prüfbericht – Nucala-Frequenzbezeichnung

**Stand:** 16.10.2026. GitHub-Basisversion: Asthma 2.8.1, mit Nucala-Kalender-Update und Quellenfix 3. Ausgangsdateien im Root vor Änderung verifiziert.

## Prüfung

- `node --check` für `medpref25.js`, `medplan24.js`, `suite15.js`, `stats25.js`, `sw.js`: erfolgreich.
- JavaScript-Browser-Funktionstest (Chromium, 390px) mit simuliertem verschlüsseltem Speicher: `Nucala 100 mg` und `Mepolizumab` mit altem Text werden aktualisiert. Bestehende Dosis/Intervall und andere Medikamente bleiben unverändert; bei schon korrekter Beschriftung erfolgt kein Schreiben. Keine ungefangenen JavaScript-Fehler.
- Monat-/Jahresbericht greift nur für Nucala/Mepolizumab auf die standardisierte Anzeige zu; bei anderen Präparaten bleibt die ursprüngliche Formulierung erhalten.
- Der bestehende Nucala-Kalender (`nucala282.js`), die Kalendertermine, Apple-ICS-Dateien, der Login, alle Gesundheitswerte und der Rechtsmonitor wurden nicht verändert.
- Service-Worker-Version erhöht, bestehende Datei-/Cacheliste unverändert.

## Nicht geprüft

- Echte lokale iPhone-Tresoreinträge, das iPhone und der spätere GitHub-Pages-Cache; Upload ins Repository nicht erfolgt.
- Andere Formulierungen als „alle 4 Wochen“ beziehungsweise „alle vier Wochen“.
