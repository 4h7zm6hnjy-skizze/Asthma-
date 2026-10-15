# Technischer Prüfbericht – AsthmaKompass 1.0.0

Prüfung am 15.10.2026.

## Erfolgreiche Tests

- JavaScript-Syntaxkontrolle für `content.js`, `app.js`, `sw.js` via Node.
- Datenkonsistenz: 30 Themen, 24 Quellen, keine doppelten IDs, keine unbekannten Quellenreferenzen.
- Browser-Bedienung in isolierter Chromium/Playwright-Umgebung (Desktop 1365 px / Mobile 390 px).
- GdB 10, 30, 40 und 50, Gleichstellungsstatus, kein Zusatzurlaub bei alleiniger Gleichstellung, besondere Schutzrechte nach Auswahl.
- Suche, Kategorieauswahl, Merkliste, steuerliche Kennzeichnung, Hauptnavigation.
- Updateprüfung: Offline-/Lokal-Hinweis und angezeigte neuere Version (mit simuliertem Serverantwortwert).
- Keine unbehandelten JavaScript-Laufzeitfehler im Browser-Test. Mobile Breite ohne horizontales Seiten-Scrolling.

## Nicht geprüft

- Tatsächliche GitHub-Pages-Veröffentlichung / HTTPS-Installation auf dem iPhone.
- Aktive Service-Worker-Cache-Erneuerung nach einem veröffentlichten Release: dazu muss die App gehostet sein; im Browser-Test wurde der Inhalt bewusst isoliert geladen.
- Erreichbarkeit jeder einzelnen externen Quellenwebseite zum Zeitpunkt der späteren Verwendung.
- Medizinischer oder juristischer Einzelfallanspruch; dies ist keine behördliche Entscheidung.

Der Test benutzt im Container absichtlich `page.set_content`, da der dortige Chromium-Browser lokale URLs aus Sicherheitsrichtlinien nicht direkt aufrufen durfte. Dies ist keine Einschränkung der fertig heruntergeladenen App.

Test erneut ausführen: `python tests/browser_smoke.py` (Python Playwright und Chromium benötigt).
