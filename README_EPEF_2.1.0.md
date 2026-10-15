# Asthma 2.1.0 – ePEF-Import und Peak-Flow-Tagebuch

## Funktion

Neue Ansicht **Mein Peak-Flow-Tagebuch** im Bereich **Lunge**. XLSX-, CSV- und TSV-Dateien werden im Browser eingelesen, mit Blatt-, Kopfzeilen- und Spaltenauswahl. Erforderlich: plausibles Datum, Uhrzeit und wenigstens einer der Messwerte **PEF** in l/min (50–1400) oder **FEV₁** in Litern (0,1–12). Die Grenzen sind Eingabe-Plausibilitätsprüfungen, keine medizinischen Grenzwerte. Die Ergebnisse werden erst nach ausdrücklicher Bestätigung gespeichert.

PEF und FEV₁ haben eigene Diagramme. Die Farben zeigen die Zeit des zugehörigen Messpunkts: **Grün vor 13:00**, **Blau 13:00–16:59**, **Rot ab 17:00 Uhr**. Bei Verbindungslinien gilt die Farbe der jeweils vorhergehenden Messung. Keine medizinische Ampel und keine Warnschwelle.

Der optionale erwartete PEF kann separat als gestrichelte Referenzlinie eingegeben werden; auf dem vom Nutzer gezeigten ePEF-Screenshot stand 618 l/min. Die Referenz wird nicht aus einem ärztlichen Aktionsplan abgeleitet. Bitte den individuellen Referenzwert prüfen.

Die App behält zwei verschiedene Messungen derselben Minute, sofern PEF/FEV₁ verschieden sind. Exakte Duplikate (Datum, Uhrzeit, PEF und FEV₁ identisch) werden bei erneutem Import nicht nochmal eingefügt. Wer zwei exakt gleiche Messungen zur selben Minute machte, kann sie im Export ohne eindeutige Geräte-ID nicht auseinanderhalten.

## Datenschutz und Sicherung

Es werden keine Tabellen an einen OCR-, Cloud- oder Excel-Konvertierungsdienst hochgeladen. Die lokale, mitgelieferte JavaScript-Bibliothek **JSZip 3.10.1** liest das XLSX-Containerformat. Ihr Lizenztext liegt in `JSZIP_LIZENZ.md`. Die ausgewählten Datei-Inhalte werden vor dem Speichern geprüft und als separate **epef**-Einträge im vorhandenen passwortverschlüsselten App-Tresor gespeichert (AES-GCM). Der bestehende Tresor wird nicht umbenannt oder migriert. Vor jedem Update ein verschlüsseltes Backup erstellen. Der Backup-Import wurde um die `epef`-Datengruppe ergänzt.

Eine Webapp ist kein medizinisches Gerät. Die PEF-/FEV₁-Werte aus dem Heimgerät werden absichtlich nicht in ärztliche Spirometrie-Sollprozente übertragen.

## Installation

1. In der laufenden App zuerst **Einstellungen → Vollständiges verschlüsseltes Backup** ausführen.
2. ZIP entpacken und **alle** Dateien in das Wurzelverzeichnis von `4h7zm6hnjy-skizze/Asthma-` hochladen; alte gleichnamige Dateien ersetzen.
3. GitHub Pages-Veröffentlichung abwarten, dann die App neu starten; bei Bedarf unter Einstellungen die Updateprüfung öffnen.
4. Unter **Lunge → Mein Peak-Flow-Tagebuch** die Datei über **Teilen → In Dateien sichern** aus ePEF auswählen. Vor dem Speichern Spaltenzuordnung und Vorschau prüfen.

## Grenzen

Das tatsächliche XLSX-Exportformat der ePEF-App ist ohne eine exportierte Originaldatei noch nicht validiert. Unterstützt werden übliche XLSX-Tabellen mit verarbeitbarer XML-Struktur, CSV und TSV. Makros oder alte XLS-Dateien werden nicht ausgeführt/unterstützt. Nach erfolgreichem Test mit einer vom Nutzer lokal eingespielten Exportdatei können Spaltennamen und Formate bedarfsgerecht ergänzt werden. Auch die tatsächliche iPhone-Safari-Funktion, reale IndexedDB-Verschlüsselung und vollständiger Restore sind noch nicht auf dem Nutzergerät getestet.
