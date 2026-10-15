# Prüfbericht: Asthma 1.5.0 (15. Oktober 2026)

## Automatisch geprüft

- Alle JavaScript-Dateien mit `node --check`: Syntax ohne Fehler.
- Alle per `$("id")` fest referenzierten UI-Elemente gegen HTML-IDs geprüft: keine fehlenden Referenzen.
- Isolierter Chromium-DOM-Test mit 390 px Breite: 12 Navigationsbereiche nacheinander geöffnet. Pro Klick sind nur die zugehörigen Hauptabschnitte sichtbar, Start/Unterseiten haben keine horizontale Gesamtseiten-Überläufe. Keine ungefangenen JavaScript-Fehler.
- Versionsnummer `1.5.0` in `app.js`, `sw.js` und `version.json` übereinstimmend; `suite15.js` befindet sich in den statischen Service-Worker-Dateien.
- Alte Komponenten und Datenbanknamen unverändert; die Zusatzdatenbank ist separat.

## Noch nicht auf dem Endgerät verifiziert

- Echte Bild- und PDF-Texterkennung (Tesseract.js / PDF.js über Drittanbieter-CDNs), iPhone-Kamera, PDF-Seitenauswahl auf Safari.
- Echte IndexedDB-Transaktionen, datensichere AES-GCM-Verschlüsselung und Sicherungs-Wiederherstellung in einem Webbrowser mit sicherem Origin.
- Service-Worker-Installation, Offline-Erststart und Update-Verhalten nach Bereitstellung über GitHub Pages.
- Drucken/als PDF speichern und Kalenderimport auf iOS.
- Barrierefreiheit mit Screen Reader und vollständige manuelle Fachprüfung aller externen Quellen.

**Grund**: Die automatisierte Browserumgebung blockiert URL-Navigation; der erlaubte isolierte DOM-Modus unterstützt weder IndexedDB noch WebCrypto. Bei Aussagen zu diesen Funktionen daher nur 'implementiert, nicht vollständig verifiziert' angeben.

## Datenerhalt

Bestands-Datenbanken `asthma-local-1` und `asthma-v1-preferences` werden nicht gelöscht. Die App migriert/verschlüsselt Bestandsdaten nicht; sichere diese vorher. Neue Datensätze liegen im zusätzlichen Speicher `asthma-suite-1`. Bei Import eines 1.5.0-Backups wird die entsprechende Zusatzdatenbank nach Bestätigung ersetzt; die alte Antragsakte nicht.

## Risiko / Hinweis

Asthma 1.5.0 ist ein Informations- und Dokumentationswerkzeug. Keine Diagnose-Software oder automatische Behandlungsanweisung. Medizinische Angaben vor Übernahme prüfen; medikamentöse Pläne ausschließlich ärztlich vorgeben. Bei schwerer Atemnot 112.
