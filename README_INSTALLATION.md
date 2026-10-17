# Asthma – Arbeitgeberpflichten, Gleichstellung und 30-Fragen-Check

**Stand:** 17. Oktober 2026  
**Basis:** GitHub `4h7zm6hnjy-skizze/Asthma-`, `main` bei Commit `28e24d9f287cfb1d2b3acd62e1fa7dab757071a7`.  
**Art:** Zusatzupdate zur bestehenden App 2.8.1 (keine Änderung von `version.json`).

## Installation – bestehenden iPhone-Tresor erhalten

1. In der **bisherigen** Asthma-App eine passwortverschlüsselte `.asthma17`-Gesamtsicherung erstellen und separat aufbewahren.
2. ZIP auf dem iPhone entpacken.
3. Im **Hauptverzeichnis** des Repositories <https://github.com/4h7zm6hnjy-skizze/Asthma-> genau diese vier App-Dateien hochladen bzw. ersetzen:
   - `arbeit31.js` – NEU, Arbeitsrechte und 30-Fragen-Auswertung;
   - `arbeit31.css` – NEU, Darstellung und Drucklayout;
   - `secure17.js` – ERSETZEN, lädt das neue Modul nach dem Entsperren;
   - `sw.js` – ERSETZEN, erhöht den Offline-Cache und nimmt beide neuen Dateien auf.
4. Die mitgelieferte Anleitung/den Prüfbericht kannst du optional ebenfalls hochladen; sie sind **nicht** zum Betrieb nötig.
5. `Commit changes` bestätigen und GitHub Pages erfolgreich veröffentlichen lassen.
6. Die **bestehende** Home-Screen-App öffnen und mit dem bisherigen Passwort entsperren. **Nicht deinstallieren; nicht Safari-Website-Daten löschen; keinen leeren Tresor anlegen.**
7. Menü **Arbeit / Arbeitsplatz und Belastungen → Meine Rechte & Pflichten im Arbeitsleben** öffnen.

## Neu: sechs Themenbereiche mit jeweils fünf Fragen (30 insgesamt)

1. Gleichstellung, Aufgaben und Informationen;
2. Hitze, Atemluft und körperliche Belastung;
3. Gefährdungsbeurteilung und Arbeitsmedizin;
4. Anpassungen, Pausen und Hilfsmittel;
5. BEM, Beteiligung und Vertraulichkeit;
6. Umgang, Benachteiligung und eigene Mitwirkung.

Die Auswertung zeigt den **Fortschritt (x/30)**, trennt **mögliche Probleme, positive Aspekte, offene Punkte und nächste Schritte**, erzeugt ein ausführliches **Statement** und listet **für jede Einzelbegründung Original-Rechtsquellen** auf. Zusätzlich gibt es Themenblöcke zu gesetzlichen Pflichten, Kostenträgern/Förderung, ASR-Hitzegrenzen und der Frage, wann die Grenze zwischen normaler Arbeit und Schutzpflicht erreicht sein kann.

Die Fragen sind freiwillig; unklare oder unbeantwortete Felder führen **nicht automatisch** zu einer negativen Beurteilung. Die Stellungnahme ist eine **orientierende Selbstauskunft, keine verbindliche Rechtsberatung oder Feststellung eines Verstoßes**.

### Speichern / bestehende Antworten

- Button **„Ohne Speichern auswerten“**: Auswertung ausschließlich im Arbeitsspeicher.
- Button **„Verschlüsselt speichern und einschätzen“**: Speichert erst dann Antworten/Notizen unter `arbeitgeberCheck31` im bisherigen AES-GCM-geschützten lokalen Profil (Datenschema `version:2`).
- Falls die frühere Acht-Fragen-Version auf **diesem Gerät** bereits Antworten verschlüsselt gespeichert hat, lädt das neue Modul diese inklusive Notizen. Die 22 neuen Fragen bleiben frei.
- Antworten, die nur in einem früheren Chat gegeben wurden, sind aus Datenschutzgründen **nicht in öffentlichen GitHub-Dateien voreingetragen**.
- **„Statement kopieren“** und **„Einschätzung als PDF drucken“** warnen vorher: Die Ausgabe ist UNVERSCHLÜSSELT und kann Gesundheits- und Arbeitsangaben enthalten.

## Quellen und Grenzen

Das Modul verlinkt 23 amtliche beziehungsweise öffentlich-rechtliche Originalquellen, u. a.:
- <https://www.gesetze-im-internet.de/sgb_9_2018/__151.html> (Gleichstellung)
- <https://www.gesetze-im-internet.de/sgb_9_2018/__164.html> (Arbeitgeberpflichten, behinderungsgerechte Beschäftigung)
- <https://www.gesetze-im-internet.de/sgb_9_2018/__167.html> (Prävention/BEM)
- <https://www.gesetze-im-internet.de/arbschg/__3.html> und <https://www.gesetze-im-internet.de/arbschg/__5.html> (Arbeitsschutz/Gefährdungsbeurteilung)
- <https://www.baua.de/DE/Themen/Arbeitsgestaltung/Physikalische-Faktoren/Klima-am-Arbeitsplatz/Schutzmassnahmen-hohe-Raumtemperaturen> (ASR A3.5)
- <https://www.lwl-inklusionsamt-arbeit.de/de/beratung/technische-beratung/> (Technischer Beratungsdienst)
- <https://www.deutsche-rentenversicherung.de/DRV/DE/Reha/Berufliche-Reha/berufliche-reha.html> (Reha und Hilfen)

Notwendige Arbeitsschutzmaßnahmen sind grundsätzlich Arbeitgeberpflichten. Zusätzliche individuelle technische Hilfen können unter Voraussetzungen gefördert werden; **keine automatische Kostenerstattung** und in der Regel vor Kauf mit dem Träger abklären.

Das Modul nutzt keine externe Such-/KI-API, gibt keine persönlichen Angaben an GitHub weiter und verändert keine anderen Gesundheitsdaten, Kalendereinträge oder Medikationen. Externe Quellen werden erst auf Klick geöffnet. Für echten Rechtsrat zählen die vollständigen Unterlagen, Vorgänge und eine qualifizierte Beratung.

## Nach dem Upload kontrollieren

- App entsperren und **Arbeit** öffnen. Erscheinen 30 Fragen in sechs Klappgruppen?
- 2–3 Fragen probeweise auswählen → **„Ohne Speichern auswerten“** (keine Datenspeicherung).
- Antworten speichern, App sperren/entsperren und prüfen, ob sie wieder geladen werden.
- Eine Quelle anklicken und Druckvorschau öffnen, ohne eine vertrauliche PDF versehentlich weiterzuleiten.
- Bei unerwartetem Fehler **keine Website-Daten löschen**; den Backup aufbewahren und den Fehler melden.
