# Prüfbericht – Arbeitgeberpflichten, 30-Fragen-Version

**Stand:** 17.10.2026  
**GitHub-Ausgangsstand:** `main` bei `28e24d9f287cfb1d2b3acd62e1fa7dab757071a7` (Asthma 2.8.1 inkl. Versorgung und Gesundheitsbeurteilung).

## Durchführung

- Ausgangsdateien `secure17.js`, `sw.js` aus diesem Repository abgeglichen und um die Ladeanweisung für `arbeit31.js` und die beiden Offline-Assets ergänzt. Andere vorhandene Module unverändert.
- `node --check` für `arbeit31.js`, `secure17.js`, `sw.js`: **bestanden**.
- Isolierte **Chromium-Funktionstests bei 390 px und 768 px**: **bestanden**.
- 30 Fragen, 6 Themenbereiche, 23 Originalquellen im Modul und Fortschrittszählung: **bestanden**.
- Prüfbeispiel mit Gleichstellung ja, Arbeitgeber informiert ja, Gefährdungsbeurteilung nein, Hilfsmittel nein, BEM ja, Druck und weiteren belastenden Angaben: **„Deutlicher Prüf- und Handlungsbedarf“** ohne Behauptung eines bewiesenen Gesetzesverstoßes.
- Unvollständige Antworten und unbekannte Angaben führen nicht zu einer voreiligen Feststellung. Positives Kontrollszenario löst keine künstliche schwere Einstufung aus: **bestanden**.
- **Ohne Speichern auswerten** führt zu keinem Speicheraufruf. Erst der ausdrückliche Button speichert `arbeitgeberCheck31` mit `version:2` über `ASTHMA_SECURITY.updateProfile`: **bestanden** (Schnittstellen-Simulation).
- Bestehenden verschlüsselten `version:1`-Datensatz mit den alten acht Fragen und Notizen wieder einlesen, ohne Speichern/Migration beim Aufruf: **bestanden** (Schnittstellen-Simulation).
- Mobile Darstellung ohne horizontalen Überlauf, keine ungefangenen JS-Fehler in den isolierten Tests: **bestanden**.
- Neue Abgrenzung „Wo verläuft die Grenze?“ sowie Hitzeschutz, Förderkosten und AGG-Hinweise mit Quellen: **vorhanden**.
- Der Service-Worker hat eine eigene Cacheversion und führt alle bekannten App-Assets einschließlich `arbeit31.js` und `arbeit31.css`.

## Amtliche Quellen, exemplarisch überprüft

- § 164 SGB IX: <https://www.gesetze-im-internet.de/sgb_9_2018/__164.html>
- § 167 SGB IX: <https://www.gesetze-im-internet.de/sgb_9_2018/__167.html>
- BAuA/ASR A3.5: <https://www.baua.de/DE/Themen/Arbeitsgestaltung/Physikalische-Faktoren/Klima-am-Arbeitsplatz/Schutzmassnahmen-hohe-Raumtemperaturen>
- LWL technischer Beratungsdienst: <https://www.lwl-inklusionsamt-arbeit.de/de/beratung/technische-beratung/>
- DRV berufliche Rehabilitation: <https://www.deutsche-rentenversicherung.de/DRV/DE/Reha/Berufliche-Reha/berufliche-reha.html>

## Nicht abschließend prüfbar

- Gesamte App auf dem **echten iPhone**, einschließlich alter iOS-Cache-Einträge und echter verschlüsselter Privatdaten.
- iPhone-Druckfunktion und tatsächliches Ablegen einer PDF-Datei auf dem Gerät.
- Rechtliche Würdigung einzelner betrieblicher Vorgänge ohne Akten, Gespräche, Zeugenaussagen, ärztliche Empfehlungen und betriebliche Gefährdungsbeurteilung.
- Fortlaufende Erreichbarkeit aller 23 externen Quellen; offizielle Informationen können umziehen oder sich ändern.

**Sicherheitshinweis:** Unverschlüsselte Exporte/Statements nicht öffentlich auf GitHub hochladen. Es wird keine Hintergrundübertragung persönlicher Gesundheitsdaten vorgenommen. Alte Home-Screen-App und Browserdaten nach dem Update beibehalten.
