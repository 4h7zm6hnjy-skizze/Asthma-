# Asthma 2.3.0 – echte Lungenfunktion (Spirometrie) im Zeitverlauf

## Wo steht das neue Diagramm?

**Startseite:** Karte „Lungenfunktion im Verlauf“ direkt nach den Peak-Flow-Diagrammen mit FEV₁/FVC **in Prozent vom Soll** aus bestätigten Lungenfunktionstests.

**Lunge:** „Spirometrie: Langzeitdiagramm“ direkt bei „Verlauf gespeicherter Untersuchungen“; Darstellungen: FEV₁/FVC-Prozente, FEV₁/FVC-Literwerte, **FEV₁/FVC-Quotient** sowie Prozent/Liter in zwei getrennten Grafiken. Zeitfilter, Messphasenfilter, antippbare Werte und Untersuchungsübersicht.

**Sichern:** Werte im Bereich „Aktueller Lungenfunktionstest“ eingeben, Datum prüfen, gegebenenfalls Messphase (vor/nach) wählen, optional Arzt und Notiz eingeben. Danach **„Aktuelle Werte in Verlauf speichern“** drücken. Nur ausdrücklich dauerhaft gespeicherte Untersuchungen werden geplottet. Scanwerte zählen dazu, wenn du sie zuvor in den Verlauf übernommen hast.

Keine neue Datenmigration: Bestehende Messreihen in `ASTHMA_SECURITY` → `suite` → `measurements` bleiben unverändert; ePEF-Handmessungen werden nicht vermischt. Jedes erneute Importieren derselben Datei aus ePEF betrifft nur ePEF und nicht die ärztlichen Lungenfunktionstests.

**Trend:** Vergleicht nur Untersuchungen derselben Messphase. Unterschiede sind Zahlenangaben (Prozentpunkte) und keine automatische Beurteilung des Krankheitsverlaufs.

**FEV₁-Ampel:** Vereinfachte Farbskala (≥80 / 60–79 / <60 % vom Soll) ausschließlich zur Orientierung, kein diagnostisches Normal-/Schweregradkriterium und keine Atemnot- oder Notfallwarnung. Für eine medizinische Interpretation werden Alter, LLN/Referenzbereiche, Messqualität, Symptome, andere Parameter und Ärztin/Arzt benötigt.

## Installation
Vorher vollständiges verschlüsseltes Backup erstellen. Alle Dateien ins GitHub-Hauptverzeichnis hochladen, vorhandene Dateien ersetzen. Version und GitHub-Pages-Status kontrollieren. Keine Verbindung zu Fremdservern über die neue Komponente.
