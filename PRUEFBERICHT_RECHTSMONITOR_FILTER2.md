# Prüfbericht – Rechtsmonitor Filter-Update 2

**Geprüft:** 16.10.2026. Grundlage: bereits funktionierender GitHub-Workflow, App 2.8.1.

## Änderungen
- Engere Muster für GdB, Gleichstellung, Asthma, Reha, Hilfsmittel und Arbeitsrecht.
- Ausschluss offensichtlicher Falschzuordnungen (Prüfungszeugnisse, Tierarzneimittel, Luftverkehrsverordnungen).
- Zweistufige Themenklassifizierung (`possible`, `general`) statt pauschaler „persönlich relevanter“ Treffer.
- RSS-Meldedatum getrennt von rechtlicher Wirksamkeit und Inkrafttreten.
- G-BA-Adressen auf offiziell verlinkte RSS-Endpoints korrigiert.
- Quellenstatus und Fehlermeldungen bleiben sichtbar; Filter arbeitet lokal.
- Keine Änderung an Login, Verschlüsselung, Datenbank, bestehenden Gesundheitsdaten oder Workflowdatei.
- Keine leere JSON-Datei im Update enthalten.

## Bestanden
- `python -m py_compile build_rechtsmonitor_feed.py`.
- `node --check rechtsmonitor.js`, `node --check sw.js`.
- 13 Klassifizierungsbeispiele sowie Ausschlussregeln, erlaubte Domains, 3 Quell-URLs, RSS-XML-Verarbeitung, Dublettenabgleich und Fehlerfall ohne Datenverlust.
- Lokaler Chromium-Test (390 px) mit simulierten öffentlichen Meldungen: Button, Datenabruf, drei Filter, Ausschluss von Zeugnis-Meldungen, „Als gelesen“-Funktion, kein horizontaler Überlauf.

## Grenzen
- Kein tatsächlicher Live-Aufruf der drei RSS-Dienste aus der lokalen Testumgebung.
- Keine reale Prüfung des iPhone-Passworttresors, des veröffentlichten GitHub-Pages-Builds oder GitHub-Actions-Laufs nach diesem Update.
- Eine Themenklassifizierung ist kein belastbarer Nachweis, ob ein Gesetz bereits gilt oder ein individueller Anspruch besteht.
- Auch offizielle RSS-Feeds können unvollständig sein oder nur ausgewählte Änderungen melden.
