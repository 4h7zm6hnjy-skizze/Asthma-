# Prüfbericht Asthma 1.6.0 · 15.10.2026

## Basis
- Entwicklung auf Grundlage des bereits veröffentlichten Versionsstandes 1.5.0; Bestandsmodule erhalten.
- Versionsnummer in `app.js`, `version.json`, `sw.js` und sichtbarer Oberfläche auf 1.6.0 aktualisiert.

## Regionalmodul
- Alle 16 Bundesländer auswählbar; Eingabe von Landkreis/kreisfreier Stadt, PLZ, Ort.
- Offizielle allgemeine bundesweite Suchwege und gesonderte NRW-/Märkischer-Kreis-Seiten.
- Gespeicherter Eintrag bleibt bei Änderung des GdB erhalten (Test mit simuliertem `localStorage`).
- Wechsel von NRW/Märkischer Kreis nach Bayern blendet NRW- und Märkischer-Kreis-spezifische Einträge aus.
- Stichwortsuche, Kategoriefilter, fünfstellige PLZ-Validierung, Löschfunktion und getrennte Seitennavigation im isolierten Chromium-Browsertest erfolgreich.
- Bei 390 px Browserbreite keine horizontale Seitenüberlaufbreite.
- Keine ungefangenen JavaScript-Fehler im isolierten Test.

## Grenzen
- Region wird vom Benutzer eingegeben, aber nicht extern geokodiert; **keine validierte deutschlandweite Liste aller Kreise**. Deutschlandweite lokale Dienste werden über geprüfte offizielle Suchportale erreicht, die PLZ/Ort bei Bedarf erneut abfragen.
- Eine vollständige automatische Zuordnung jeder deutschen Kommune zur zuständigen Behörde ist nicht implementiert und wird nicht behauptet.
- Live-Veröffentlichung auf GitHub Pages und iPhone-Safari wurden nicht geprüft.
- `localStorage` enthält weiterhin unverschlüsselte aktive Profildaten.
- Andere Bestandsspeicher- und Backupfunktionen wurden mit dieser Änderung nicht vollständig neu getestet.
