# Datenschutz – ePEF-Import, Asthma 2.1.0

- Der Import läuft **lokal im iPhone-/Desktop-Browser**. `.xlsx`, `.csv` und `.tsv` werden nicht an einen ePEF- oder anderen Cloud-Server gesendet.
- `jszip.min.js` liegt im eigenen App-Verzeichnis und wird vom selben GitHub-Pages-Ursprung geladen. Die Lizenz der eingebundenen Version ist in `JSZIP_LIZENZ.md` enthalten.
- Die Daten werden erst nach Bestätigung im vorhandenen passwortgeschützten, mit AES-GCM verschlüsselten Datentresor in der Datengruppe `epef` gespeichert. Der vollständige verschlüsselte Datenexport nimmt die neue Datengruppe auf.
- Der Excel-Import speichert nur Messwerte, Datum, Uhrzeit, optionalen Status, den lokalen Dateinamen und den Importzeitpunkt, **nicht** die gesamte Ursprungsdatei.
- Der erwartete PEF-Wert ist eine optionale lokal verschlüsselte Einstellung. Die Diagrammfarben dienen der Darstellung der Uhrzeit, nicht der medizinischen Einstufung.
- Absolute Datensicherheit ist nicht garantiert: Gerät, Browser und gehostete App-Dateien müssen vertrauenswürdig sein. Ein externes Backup ist verschlüsselt, seine lokale Aufbewahrung bleibt Sache der Nutzer.
