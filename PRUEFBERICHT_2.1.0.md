# Asthma 2.1.0 – Prüfbericht (15.10.2026)

**Ausgangspunkt:** GitHub-Version 2.0.0, alle bisherigen Module kopiert und erhalten; keine Änderung des Verschlüsselungsschlüssels oder der Datenbankbezeichnung.

## Bestanden (isolierter Chromium-Test)

- XLSX als lokales komprimiertes ZIP/XML eingelesen, Tabellenblatt und Spalten korrekt automatisch zugeordnet (Beispiel-Datei mit ePEF-ähnlichem Aufbau, **nicht** Originalexport)
- AM/PM-Umrechnung: 07:31, 15:29, 19:18, Zeitfarben korrekt; Test-Grenzen 12:59 grün, 13:00 und 16:59 blau, 17:00 rot
- Vier unterschiedliche Messwerte aus fünf Zeilen verarbeitet, wobei eine exakte Dublette entfernt wurde. Zwei Messungen mit derselben Uhrzeit, aber verschiedenen Werten blieben erhalten
- Reimport: 0 neue Messungen; Referenzwert als zusätzliche Datengruppe brachte keine Fehler beim Duplikatvergleich
- Zwei getrennte PEF-/FEV₁-SVG-Diagramme, 618-l/min-Referenzlinie als gesonderte einstellbare Vergleichslinie
- Monatsfilter und Zeitraumfilter; gefilterte Mittelwerte
- Kein horizontaler Seitenüberlauf bei simulierten 320, 375, 390, 430, 768 und 1024 CSS-Pixeln
- Keine ungefangenen JavaScript-Fehler in den beschriebenen Tests; lokale Bibliothek ohne Netzwerkanfrage geladen
- Quellcode-Prüfung: `secure17.js` hat `epef` in den erlaubten Restore-Gruppen und lädt `jszip.min.js` und `epef21.js`; `sw.js` enthält beide in der Offline-Dateiliste

## Einschränkungen

- Die Browser-Tests nutzen für den Tresor einen **simulierten Speicher**. Deshalb ist die Anzeige „verschlüsselt gespeichert“ im Test kein Beweis für eine produktive Ende-zu-Ende-Verschlüsselung; die tatsächliche Anwendung benutzt weiterhin die vorhandenen AES-GCM-Funktionen des Tresors.
- Es lag **keine echte XLSX-Exportdatei aus ePEF** zur Verfügung. Der Import wurde ausschließlich mit einer eigens erstellten ePEF-ähnlichen Testdatei geprüft.
- Safari auf einem echten iPhone, GitHub-Pages-Veröffentlichung, echte Bestandsspeicher und vollständige Backup-Wiederherstellung mit ePEF-Daten sind noch nicht im Endgerät getestet.
- Kein automatisches Auslesen von ePEF-App-Daten oder Direktzugriff auf Bluetooth-Geräte. Nutzer muss Exportdatei über iOS Dateien-App auswählen.
- Begrenzte XML-/ZIP-Größe zur Risikoreduzierung; keine XLS-/XLSB-Dateien oder verschlüsselten XLSX-Dateien.

**Medizinischer Hinweis:** Uhrzeitfarben stellen keine Atemwegsgefährdung dar; PEF-/FEV₁-Messungen werden nicht medizinisch bewertet. Bei schwerer akuter Atemnot Notruf 112 und den ärztlichen Notfallplan befolgen.
