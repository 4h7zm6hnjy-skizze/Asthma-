# Prüfbericht – Asthma 2.5.1: gesetzliche Hilfsmittel und Privatzahlung

## Umfang
- 13 Hilfsmittel-Beispiele: 4 „Krankenkasse prüfen“, 3 „Einzelfall / mögliche Mehrkosten“, 6 „Privatzahlung / Selbstzahler“.
- Suchfeld, filterbare Kategorien, mobile Karten und ausgewählte bestehende GKV-Antragswege.
- Keine Erstattungszusagen, keine automatischen Preise, keine Shop-Anbindung. Alle Angaben lokal im JavaScript.
- Bestehender verschlüsselter Gesundheitstresor, Antragsakte, ePEF, Lungenfunktion, Statistik und Medikamente unverändert.

## Durchgeführte technische Prüfungen
- `node --check` für alle JavaScript-Dateien: bestanden.
- Browser-Isolattest Chromium: 320, 375, 390, 430, 768 und 1200 px: kein horizontaler Überlauf, keine ungefangenen JS-Fehler.
- Die 13 Karten, 3 Kostenart-Filter, Suche mit und ohne Treffer und GKV-Navigation wurden getestet.
- Offline-ServiceWorker-Dateiliste enthält das neue Hilfsmittel-Modul; Versionen in `index.html`, `app.js`, `sw.js` und `version.json` aktualisiert.
- Vorhandene JS-/Datendateien unverändert (außer erforderlicher Version/Modulladung); kein Datenbank-Schema-Wechsel, keine Migration.

## Grenzen
- Der Browsertest nutzte für das neue Hilfsmittel-Modul einen isolierten DOM-Ausschnitt, nicht den vollständigen iPhone-Safari-PWA-Lauf mit deinem privaten Datenbestand.
- Erstattungsentscheidungen sind individuelle Verwaltungsentscheidungen. Selbstzahler-Produkte sind Beispiele, keine ärztlichen Empfehlungen.
- Die Gesundheitsakte wurde nicht mit echten Daten entschlüsselt, geändert oder gesichert.

## Fachliche Grundlagen (amtliche Quellen)
- https://gesund.bund.de/hilfsmittel
- https://www.g-ba.de/themen/veranlasste-leistungen/hilfsmittel/
- https://www.gesetze-im-internet.de/sgb_5/__33.html
