# Asthma 2.1.0 – Gesamtupdate

**Neu:** ePEF-Peak-Flow-Tagebuch mit lokalem XLSX-/CSV-Import, PEF/FEV₁-Zeitdiagrammen und unveränderter verschlüsselter Datenbank. Weitere Details und Installationsschritte: [`README_EPEF_2.1.0.md`](README_EPEF_2.1.0.md).

# Vorherige Funktionen aus Version 2.0.0

Private, lokal gespeicherte Asthma-Webapp für iPhone/Android/Desktop. **Die bisherigen Daten bleiben in derselben verschlüsselten Datenbank `asthma-secure-17`.** Keine Migration oder Umbenennung des Tresors in diesem Update. **Vor jedem Update ein vollständiges, verschlüsseltes Backup der bisherigen App erstellen.**

## Neu: professionellere Navigation

- Startseite mit vier klaren Schnellaktionen.
- Feste untere Navigation: Start, Lunge, Kalender, Anträge, Akte, Mehr.
- Neues Menü „Mehr“ mit Zugang zu allen bisherigen Fachbereichen, eigener lokaler Suche in den entschlüsselten, aber nur im Arbeitsspeicher verarbeiteten Datensätzen nach Entsperren der App. Suchbegriffe werden nicht übertragen.
- FEV₁ und FVC in je einer Karte. Der Prozentwert vom Soll steht neben dem gemessenen Literwert. Schieberegler und Hilfetexte sind in aufklappbare „Weitere Einstellungen“ verschoben; die bisherigen Daten-IDs sind unverändert.
- Die untere Navigation und Scanneransichten sind für unterschiedliche Mobilbreiten optimiert.

## Befundscanner: Was tatsächlich funktioniert

1. **Foto per Kamera oder Foto-Mediathek auswählen:** Die originale Bilddatei bleibt lokal. Sie kann wie bisher in der geschützten Akte separat archiviert werden.
2. **iPhone-Live-Text:** Die Schaltfläche „iPhone: Befundtext mit Kamera scannen“ öffnet das Texterfassungsfeld. Je nach iOS-Version in der Textfeld-Menüleiste „Text scannen“ auswählen. Alternativ den Text aus der Fotos-App kopieren. Safari bietet der Webapp **keine frei verfügbare native Foto-OCR-API**; sie kann das iOS-Scan-Menü nicht selbständig erzwingen.
3. **Lokaler Parser:** Erkannter oder kopierter Text wird in Soll-, Ist- und %-Sollwerte und FEV₁-/FVC-Varianten (inkl. inspiratorisch/exspiratorisch) aufgeteilt; die Einträge werden vor dem Speichern durch den Nutzer kontrolliert. Der vorhandene Parser bleibt erhalten.
4. **PDF-Berichte mit Textschicht:** Ein neuer rein lokaler PDF-Textleser versucht, unkomprimierte sowie Flate- und ASCII85-komprimierte einfache PDF-Inhaltsströme auszulesen. Er ist nicht universell und kann komplex kodierte Texte oder gescannte PDFs nicht vollständig erkennen. Keine Übertragung an PDF-/OCR-Dienste.
5. **Selbsttest:** Ein künstlicher Befund mit vorgegebenen Werten kann eingespeist werden, um zwischen einem Texterkennungs- und einem Parserproblem zu unterscheiden. Das Ergebnis **nicht als echten Befund speichern**.

### Noch nicht erfüllt

Eine vollständig automatische, robuste Bild-OCR aus der bereits gewählten Fotodatei auf iPhone-Safari ist **weiterhin nicht Bestandteil dieses Updates**. Dafür müssten ein vollständiger OCR-JavaScript-/WebAssembly-Motor und passende Sprachmodelle lokal in der App liegen; sie konnten in dieser Entwicklungsumgebung nicht beschafft und auf iPhone-Safari getestet werden. Nicht den Eindruck erwecken, dass der neue Button diesen fehlenden OCR-Motor ersetzt.

## Weitere Korrekturen

- Der Passwortwechsel in den Einstellungen ruft nun die tatsächlich vorhandene Funktion `ASTHMA_SECURITY.changePassword()` auf. Früher war dieser Bereich falsch verdrahtet.
- Der bestehende verschlüsselte Export und die Wiederherstellung bleiben unverändert; alte Backups benötigen weiterhin ihr ursprüngliches Passwort.
- Kein externer OCR-Dienst, kein Tracking-Skript; offizielle Links werden nur durch aktive Bedienung geöffnet.

## Installation

1. Vorher in der laufenden App unter Einstellungen ein **vollständiges verschlüsseltes Backup** erstellen und dessen Wiederauffindbarkeit kontrollieren.
2. ZIP-Datei entpacken, **alle Dateien** direkt in das Hauptverzeichnis des Repositorys `4h7zm6hnjy-skizze/Asthma-` hochladen, vorhandene Dateien ersetzen und Commit abschließen. **Nicht die ZIP als eine einzelne Datei hochladen.**
3. GitHub Pages-Build abwarten. Danach `https://4h7zm6hnjy-skizze.github.io/Asthma-/` neu öffnen und die Versionsanzeige 2.0.0 prüfen.
4. Einmal vorhandene Werte, Kalender, Labor, Akte und Passwort-Entsperrung auf dem tatsächlichen Gerät prüfen. Im Zweifel Backup wiederherstellen; keine alten Daten löschen.

## Grenzen der Prüfung

Siehe `PRUEFBERICHT_2.0.0.md`. Auf dem iPhone selbst wurden weder Foto-OCR noch Datenmigration mit echten Nutzerdaten getestet. Die App ersetzt keine ärztliche Diagnostik oder Beratung. Bei schwerer akuter Atemnot 112.
