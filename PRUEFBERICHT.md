# Prüfbericht Asthma 1.4.0 – 15.10.2026

## Neu
- Befundscanner mit Bildauswahl und iPhone-Kamera-Eingabe (HTML `capture="environment"`).
- OCR-Textverarbeitung per Tesseract.js 5.1.1 (erst beim Scan von externer CDN-Quelle geladen; kein OCR-Modell in der ZIP).
- Tabellenauswertung: FEV1 und FVC (Prozent vom Soll, Liter als Istwert), optional Verhältnis und eindeutiges Untersuchungsdatum.
- Erkannte Werte mit manueller Kontrolle vor der Speicherung; Plausibilitätsprüfungen sowie Unterscheidung Vor-/Nach-Bronchodilatator.
- Literwerte ergänzen das bestehende Profil und werden beim verschlüsselten Profilexport mitgesichert.

## Automatisiert geprüft
- JavaScript-Syntax der gesamten App; vorhandene Module und GdB-Profil weiter ansprechbar.
- Browser-Smoke-Test (Chromium): Bildauswahl, vorgeschlagene OCR-Werte (simulierte Tesseract-Rückgabe), kein Speichern vor der ausdrücklichen Bestätigung, danach Änderung von FEV1/FVC und Ist-Literwerten, Aktualisierung des Profils, unveränderter GdB. Abbrechen ohne Änderung, fehlerhafte Literwerte zurückgewiesen.
- Regex-Parser: sieben Testfälle für Soll/Ist/%-Tabellen, FEV1/FVC-Abgrenzung, zweideutige Prä-/Post-Messung, unbekannte Spalten, Datumsprüfung.
- Eine synthetische Spirometrie-Testgrafik wurde von lokal installiertem Tesseract (nicht vom Online-Browser-Tesseract) ausgelesen; der Textparser erkannte Werte und Datum richtig.
- Responsives Layout bei 320, 375, 390, 768 und 1366 Pixeln ohne horizontalen Seitenüberlauf.

## Nicht bestätigt
- Eine echte OCR-Ausführung mit dem nachgeladenen Tesseract.js im Webbrowser über CDN konnte in der isolierten Testumgebung nicht geprüft werden (Netzwerkzugriff blockiert).
- Safari auf einem realen iPhone, Kamera-Berechtigungen, HEIC-Dekodierung und Offline-Verhalten der OCR-Bibliothek sind nicht end-to-end getestet.
- OCR-Treffsicherheit mit unterschiedlichen echten medizinischen Befunden, insbesondere bei unscharfen Bildern und komplexen Spaltenlayouts, ist nicht klinisch validiert.
- Die lokal gespeicherten Daten sind weiterhin nicht verschlüsselt; nur die separate exportierte Backupdatei ist geschützt.

## Wichtig
Arztbefunde vor der Übernahme immer im Original gegenprüfen. Eine Messzahl ist keine Diagnose, keine GdB-Einstufung und kein automatischer Leistungsanspruch. Vor dem Ersetzen der bisherigen Version ein passwortgeschütztes Backup der bestehenden persönlichen Daten erstellen und den Export extern aufbewahren.
