# Prüfbericht: Versorgung, Hilfe beim Ausfüllen, Radius- und Kostenfilter

## Status

- Vergleichsbasis: `secure17.js` / `sw.js` aus dem unmittelbar vorangegangenen Einschätzungsupdate (GitHub-Hauptzweig 16.10.2026). Vor dem Upload den GitHub-Stand erneut prüfen.
- `node --check` von `versorgung30.js`, `secure17.js`, `sw.js`: erfolgreich.
- Browser-Tests mit Chromium auf simulierten Viewports **390 px** und **1280 px**: erfolgreich.
- Simulierter Standort `Meinerzhagen`: Radius 35 km = 10 Treffer (davon 8 als kostenlos, 2 als kostenpflichtig/membership klassifiziert). Radius 1 km = 1 Treffer. Dynamische Trefferzahl und Kostenfilter korrekt.
- Kostenfilter „Kostenpflichtig“ zeigt ausschließlich die VdK-Geschäftsstellen der geprüften Auswahl; „Kostenlos“ zeigt nur überprüfte kostenlose Angebote. „Nicht bestätigt“ bleibt verfügbar, ohne falsche kostenpflichtige/kostenlose Zuordnung zu erfinden.
- Filter „bestätigte Ausfüllhilfe“ zeigt die ausdrücklich bestätigte Caritas-Sozialberatung; EUTB/DRV/VdK werden dadurch nicht irrtümlich als garantierte Ausfüllhilfe ausgegeben.
- Keine ungefangenen JavaScript-Ausnahmen in den isolierten Browser-Tests, kein horizontaler Überlauf bei 390 px.
- `sw.js` statische Ressourcen um neue JS/CSS erweitert und CACHE-Version aktualisiert; keine Änderung an Patientendaten, AES-GCM oder bestehenden Funktionen.

## Grenzen

- Der Radius beruht überwiegend auf **Ortszentren**, nicht punktgenau auf jeder Anschrift; keine tatsächliche Straßennavigation/Ankunftszeit.
- Der Anbieterbestand ist **regional kuratiert** und **nicht vollständig** oder deutschlandweit integriert; bundesweite Links führen zur Anbieter-Suche.
- Preise, Verfügbarkeit und Standorte werden nicht bei jedem App-Aufruf live verifiziert. Stand der hier eingearbeiteten Quellen: 17.10.2026.
- Keine Prüfung an einem echten entsperrten iPhone-Tresor oder GPS-Hardware. Die finale iPhone-Anzeige sowie GitHub-Pages-Deployment müssen nach Nutzerupload überprüft werden.
- Die WebApp überträgt Standortkoordinaten bei der Suche nicht an Drittanbieter. Ein bewusster Klick auf Apple Maps oder externe Anbieterwebseiten ist von dieser Aussage ausgenommen.
