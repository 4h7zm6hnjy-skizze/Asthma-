# Prüfung Version 1.9.2

Automatisierte Browserprüfungen siehe Tests dieser Build-Sitzung. Prüfung erfolgt ohne Zugriff auf die persönlichen Nutzerdaten.

**Nicht nachgewiesen:** reales iOS Safari Verhalten beim Zurücksetzen einer bereits bestehenden Browser-Vergrößerung sowie auf dem persönlichen Gerät gespeicherte Daten. Allgemeine iOS- und Browser-Barrierefreiheitsfunktionen können Zoomsperren übersteuern.

## Durchgeführte Tests
- JavaScript-Syntax: alle JS-Dateien mit `node --check` ohne Fehler.
- Mobil-Layout mit geladenem Befundfoto: Breiten 320, 360, 375, 390, 402, 430, 600, 768 CSS-Pixel.
- Alle 15 App-Bereiche separat auf horizontalen Überlauf geprüft bei 320, 375, 390, 430 und 768 CSS-Pixeln.
- Seitengesten werden in Standardkonfiguration verhindert; im separaten Bilddialog nicht.
- Fotozoom öffnen, zweimal vergrößern, schließen: erfolgreich.
- Resetbutton und Umschalten des Seitenzooms: erfolgreich.
- Alle im Service Worker gelisteten App-Dateien sind im Paket vorhanden.

**Grenzen:** Tests mit emulierten Mobilansichten auf Chromium; kein tatsächliches iOS Safari auf dem Nutzgerät. Die Android/iPhone-Systemvergrößerung sowie Browser-Barrierefreiheit können Einstellungen übersteuern.
