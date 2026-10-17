# Asthma – Versorgung & Antragshilfe, regionaler Kosten- und Entfernungsfilter

Basis: GitHub-Hauptzweig Asthma 2.8.1 mit dem Diagnose-/Einschätzungsmodul, Stand 17.10.2026.

## Installation

Bitte VORHER im bestehenden entsperrten App-Kontext eine verschlüsselte `.asthma17`-Sicherung anfertigen. Alte iPhone-Homescreen-App und Website-Daten NICHT löschen.

ZIP entpacken und diese vier Dateien in das Hauptverzeichnis (`/`, Root) von https://github.com/4h7zm6hnjy-skizze/Asthma- hochladen:

1. `versorgung30.js` – neue regionale Beratungsstellensuche
2. `versorgung30.css` – mobile Darstellung
3. `secure17.js` – lädt das neue Modul nach dem Entsperren
4. `sw.js` – lädt beide Dateien offline und erneuert den statischen Cache

README und Prüfbericht nur optional hochladen. GitHub: **Add file → Upload files → Commit changes**. Anschließend GitHub Pages abwarten und die bestehende App öffnen.

## Nutzung

Unter **Mehr → Regionale Hilfen / Region** ist der Bereich **Versorgung & Antragshilfe** sichtbar. Auf Start gibt es einen Schnellzugriff. Wähle den Suchort im Dropdown oder erlaube einmalig GPS. Nach dem Standortgebrauch bleiben die Koordinaten im laufenden Speicher der WebApp und werden nicht gespeichert oder übertragen.

- Suchradius 1 bis **35 km**.
- Kosten: **Alle**, **Kostenlos**, **Kostenpflichtig**, **Nicht bestätigt**.
- Thema: Antrag & Formulare, GdB, Reha, Hilfsmittel, Sozialleistungen, Rente, Sozialrecht.
- Optional: **nur ausdrücklich bestätigte Hilfe beim Ausfüllen von Anträgen**.
- Anbieterkarte zeigt Quelle, Kontakt/Telefon, Kostenhinweis, geschätzte Entfernung und Apple-Karten-Routenlink.
- Praktische Dokumenten-Checkliste.

**Genauigkeit**: Die Datenbank enthält 10 recherchierte regionale Anbieter/Standorte in Südwestfalen/Oberberg/Olpe (Stand: 17.10.2026). Sie ist keine bundesweite Vollerhebung; für andere Regionen gibt es verlinkte EUTB-/DRV-/VdK-Verzeichnisse. Bis auf MITTENDRIN basieren die Abstände auf Ortsmitten; der Filter zeigt Luftlinien-Näherungen, **keine genaue Anfahrt** und keine garantierte Entfernung zur Bürotür. Beim Anbieter aktuelle Öffnungszeiten, Zuständigkeit und Kosten prüfen.

**Kosten**: Die EUTB- und DRV-Beratungen sind nach offiziellen Quellen kostenlos; die allgemeine Caritas-Sozialberatung Lüdenscheid bestätigt kostenlose Formularhilfe. VdK NRW bietet Sozialrechtsberatung für Mitglieder (öffentlich genannter Beitrag 6,50 €/Monat, ggf. weitere Gebühren), aber i. d. R. keine allgemeine Leistungsantrags-Ausfüllhilfe. Angebote ohne nachweisbare Kostenbedingungen niemals fälschlich kostenlos nennen.

**Datenschutz**: Alle Einträge liegen als statische öffentliche Adressen im Code, nie als persönliche Nutzerdaten. Das Modul liest nur auf dem Gerät die **Ortsbezeichnung** aus dem verschlüsselten Regionprofil, nicht Befunde/Medikamente. Koordinaten werden nicht aufbewahrt. Kein Dienst wird bei der Suche angerufen. Beim Öffnen von Anbieterwebseiten oder Apple Maps gelten deren externe Datenschutzregeln.

**Bestehende Module**: Keine Änderungen an Login, AES-GCM-Tresor, Nucala-Terminen, Medikation, PDF/CSV, Einschätzung oder Rechtsmonitor. App-Versionsanzeige bleibt 2.8.1; nur die Service-Worker-Cacherevision wird geändert.
