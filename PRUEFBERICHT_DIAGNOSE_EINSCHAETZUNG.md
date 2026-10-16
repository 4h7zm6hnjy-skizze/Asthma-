# Prüfbericht – Diagnosehinweise & medizinische Einschätzung

**Datum:** 16.10.2026. **Basis:** geprüfter GitHub-Stand `5d1ca9952b0324c445960d7fdaa631b029d1a561`.

## Bestehende Funktionalität

`secure17.js` wurde ausschließlich um `assessment29.js` als letztes geladenes Anwendungsmodul erweitert; der bestehende Login und die Verschlüsselungsroutinen sind nicht geändert. In `sw.js` wurden nur Cache-Version und die beiden neuen lokalen Assets ergänzt. Nucala-Kalender, Medikamentenplan, persönliche Angaben, Rechtsmonitor, Statistik und andere Module bleiben unverändert.

## Bestanden (lokal)

- `node --check` für `assessment29.js`, `secure17.js` und `sw.js`.
- Browser-Test mit simulierten verschlüsselten Daten und 390px-Ansicht: keine ungefangenen JavaScript-Fehler, keine horizontale Überbreite.
- Vollständiger Test mit 3/4 auffälligen Kontrollfragen, FEV₁ 49 %, Peak-Flow 280 l/min, und drei Bedarfsanwendungen.
- Vier-Fragen-Logik getestet für 0, 2 und 4 auffällige Antworten.
- FEV₁ <60 % löst fachärztlichen Abklärungshinweis aus.
- Ohne Kontrolldaten, FEV₁, PEF oder Tagebuch entsteht **keine irreführende Entwarnung**.
- Navigation zu Therapie/Kontrollfragen und Lungenwerten getestet.
- Der Algorithmus schreibt nicht in den lokalen Tresor und sendet keine medizinischen Daten an externe Server.

## Grenzen

- Die Browserprüfung nutzte Testdatensätze und nicht den echten privaten iPhone-Tresor.
- Offline-Aktualisierung und vollständiger Betrieb auf GitHub Pages/iOS erst nach Upload praktisch prüfbar.
- Klinische Angemessenheit und individuelle Diagnose müssen von einer Ärztin bzw. einem Arzt bestätigt werden. Es handelt sich ausdrücklich nicht um ein validiertes Medizinprodukt oder einen ärztlichen Befund.
- Es werden keine tatsächlich gemessenen Vitaldaten in Echtzeit überwacht und keine Diagnosecodes automatisch festgelegt.
