# Prüfbericht Asthma 2.2.1 – ePEF-Importkorrektur

## Reproduzierter Fehler
Der Originalexport des ePEF-Bildschirmfotos enthält vier Spalten `date`, `pef`, `fev-1`, `note`. In der Spalte `date` stehen **Datum UND Uhrzeit**, z. B. `2026/10/15 7:31 AM`. Version 2.2.0 wählte automatisch `Datum (separate Spalte)` und keine Uhrzeitspalte; dadurch wurden alle 13 Zeilen abgewiesen.

## Behoben
- Die Tabelle wird auf kombinierte Datum-Uhrzeit-Werte in der Spalte `date` geprüft und bei eindeutiger Erkennung automatisch als `Datum + Uhrzeit zusammen` zugeordnet.
- Die Extraktion verwendet selbst bei manueller Zuordnung als separate Datumsspalte ersatzweise die Uhrzeit aus derselben Zelle.
- PEF wie `404 L/min` sowie FEV1 wie `1.8 L` werden durch die vorhandene Einheitenprüfung gelesen.
- Bestehende verschlüsselte Speicherung, Diagramme auf der Startseite, Zeitfarben und Erkennung identischer Doppeleinträge bleiben unverändert.

## Gezielte Testfälle
- 13 Messungen aus dem abgebildeten ePEF-Export reproduziert, einschließlich zwei Messungen am 15.10. um 07:31 mit unterschiedlichen Werten.
- Uhrzeiten mit AM/PM (07:31, 15:29, 19:18), Mittag 12:19 PM und morgendliche Messungen.
- Wiederholter Dateiimport muss 0 neue Zeilen erzeugen; exakte Duplikate bleiben ausgeschlossen, unterschiedliche Werte gleicher Uhrzeit erhalten.
- XLSX-Datei wird lokal eingelesen. Kein Drittanbieter-Upload. Keine Änderungen am AES-GCM-Tresor.

## Grenzen
Originale XLSX-Datei des Nutzers ist nicht hochgeladen, sondern als Screenshot verfügbar. Die Tests nutzen eine entsprechend nachgebildete Excel-Arbeitsmappe. Die echte ePEF-Datei und iPhone-Safari müssen nach dem Hochladen der App-Version verifiziert werden. Vor Update verschlüsseltes Backup erstellen.

## Ergebnisse des reproduzierbaren Excel-Browsertests
- Blatt mit `date | pef | fev-1 | note` und 13 Zeilen aus dem vom Nutzer abgebildeten Format: **13 gültige, 13 neue, 0 unklare Zeilen**.
- Automatische Spaltenwahl `datetime=0`, `pef=1`, `fev1=2` ohne separate Uhrzeitspalte.
- Manuelle Zuordnung `date=0`, `datetime=leer`, `time=leer` erkennt weiterhin **13 gültige Zeilen**.
- Erstimport: genau 13 Datensätze, zwei unterschiedliche Messungen um 07:31 bleiben getrennt.
- Reimport: **0 neue, 13 bereits gespeicherte**, Übernahmebutton deaktiviert.
- Uhrzeiten: 3:29 PM → 15:29, 7:18 PM → 19:18, 12:19 PM → 12:19, 1:22 PM → 13:22.
- Beide Startseiten-Diagramme je 13 Messpunkte; Grün/Blau/Rot vorhanden.
- 320/375/390/430/768 px: kein horizontaler Überlauf. 0 ungefangene JavaScript-Fehler.
- **Testeinschränkung:** isolierter Chromium-Browser mit simuliertem `ASTHMA_SECURITY`-Speicher, nicht die echte iPhone-Tresordatenbank.
