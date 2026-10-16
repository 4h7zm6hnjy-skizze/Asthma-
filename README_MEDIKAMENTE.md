# Asthma 2.8.1 – Erweiterung Medikamentenratgeber

**Installation:** Zwei vorhandene Dateien `medplan24.js` und `sw.js` im Hauptverzeichnis des GitHub-Repositories durch die gleichnamigen Dateien aus dem ZIP ersetzen. Der Code ist für das zuletzt geprüfte Repository auf Stand 2.8.1 vom 16.10.2026 bestimmt. Die Dateien liegen direkt im ZIP-Hauptverzeichnis. `sw.js` aktiviert einen neuen Offline-Cache mit dem neuen Medikamentenratgeber; es werden KEINE anderen Datenbanken/Passwörter geändert.

**Wichtiger Versionshinweis:** Dies ist eine *zusätzliche Modul-Aktualisierung* auf Basis 2.8.1. Die allgemeine App-Versionsanzeige bleibt daher 2.8.1. Die Offline-Cachekennung wurde bewusst geändert, damit GitHub Pages den neuen Medikamentenratgeber laden kann.

**Sicheres Vorgehen:** Vor dem Upload ein verschlüsseltes `.asthma17`-Backup in der bisherigen App anlegen, separat in iOS Dateien speichern und die bisherige Home-Screen-App keinesfalls entfernen. Nach dem GitHub-Commit auf GitHub Pages warten, die bisherige App neu öffnen und unter Therapie → Medikamente unter der Übersicht den neuen Abschnitt „Medikamente verständlich erklärt“ kontrollieren. Beim ersten Öffnen wird gegebenenfalls erst der neue Service Worker installiert. Dann dieselbe App schließen und erneut öffnen. Keine Website-Daten löschen.

**Inhalt:** Standardtexte für Trimbow, Nucala, Citalopram, Ramipril, Berodual und rückblickend Azithromycin und Doxycyclin. Erklärung: Art, Anwendung, Wirkmechanismus, denkbarer Nutzen, häufige und ernste Nebenwirkungen, Gegenanzeigen in roter Schrift, wichtige Vorsicht-Kombinationen in Gelb, mögliche kombinierte Nebenwirkungen sowie Quellenlinks. Bereits verschlüsselt gespeicherte Medikamente werden nur gelesen und lokalen Texten zugeordnet; keine medizinischen Daten werden nach außen geschickt oder automatisch verändert.

**Grenzen und Sicherheit:** Nur diese sieben Wirkstoffe bzw. Markennamen sind hinterlegt, fremde Medikamente erhalten keinen erfundenen Text. Andere Darreichungsformen/Dosierungen können andere Fachinformationen haben. Gegenanzeigen sind nicht vollständig aufgeführt; Arzneimittelinteraktionen sind nicht durch einen zertifizierten Datenbankdienst vollständig geprüft. Eine rote Warnung bedeutet nicht, dass man verordnete Arzneimittel ohne Rücksprache absetzen darf. Auch rezeptfreie Präparate, Nahrungsergänzungsmittel, Herz-/Nieren-/Lebererkrankungen und Laborwerte können das tatsächliche Risiko ändern. Jeder neue Wirkstoff muss von Arzt oder Apotheke anhand des aktuellen vollständigen Plans geprüft werden.

**Prüfung:** Javascript-Syntax statisch mit `node --check` geprüft; vollständiger iPhone-Safari/IndexedDB-Test ist hier nicht möglich. Keine Änderungen am verschlüsselten Datenspeicher, Original-Dosisfeld, Messwerten und Formularlogik.

**Wichtige Quellen:**
- https://www.patienteninfo-service.de/a-z-liste/t/trimbow-87-mikrogramm5-mikrogramm9-mikrogramm-druckgasinhalation
- https://www.patienteninfo-service.de/a-z-liste/n/nucala-100-mg-injektionsloesung-im-fertigpen
- https://www.patienteninfo-service.de/a-z-liste/c/citalopram-1a-pharma-10mg-filmtabletten
- https://www.patienteninfo-service.de/a-z-liste/r/ramipril-puren-5-mg-tabletten
- https://www.patienteninfo-service.de/a-z-liste/b/berodualR-n-dosier-aerosol-20-ug50-ug-druckgasinhalation-loesung
- https://ec.europa.eu/health/documents/community-register/2025/20250908166972/anx_166972_en.pdf
- https://www.patienteninfo-service.de/a-z-liste/d/doxycyclin-100-1a-pharma-tabletten
