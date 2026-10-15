# Asthma · Version 1.0.2

Responsives, deutschsprachiges Informationsangebot zu Asthma, Hilfsmitteln, Schwerbehinderung und Arbeitsrecht in Deutschland. Veröffentlicht am 15. Oktober 2026.

## Inhalt

- GdB-Auswahl 10, 20, 30 … 100 und ausdrücklich getrennte Angabe einer *bewilligten* Gleichstellung bei GdB 30 oder 40.
- Personenbezogene Filterung – die App zeigt nur die für diese GdB-Konstellation relevanten Themen; mit „Alle Themen anzeigen“ lassen sich weitere Rechte vergleichen.
- 30 redaktionell zusammengestellte Wissensbeiträge aus fünf Themenbereichen, Suchfunktion und lokal gespeicherte Merkliste.
- 24 direkt verlinkte Primär-/Fachquellen, jeweils direkt im betreffenden Beitrag, sowie Gesamtübersicht.
- Steuerlicher Behinderten-Pauschbetrag nach § 33b EStG, ausdrücklich **kein Auszahlungsbetrag**.
- Aktuelle App-Version, manuelle serverseitige Updateprüfung und Offline-Unterstützung über einen Service Worker.
- Keine Benutzerkonten, Werbung, Analytik oder Übertragung von GdB-Profildaten an einen Server.

## Schnellstart

**GitHub Pages** (empfohlen):

1. Im vorhandenen Repository **Add file → Upload files** öffnen und **alle Dateien dieser ZIP** direkt ins Hauptverzeichnis hochladen. Gleichnamige Dateien ersetzen. `icon.svg` muss im Hauptverzeichnis neben `index.html` liegen.
2. Unter **Settings → Pages → Build and deployment** `Deploy from a branch`, anschließend `main` und `/ (root)` einstellen und speichern.
3. GitHub erzeugt die Adresse `https://4h7zm6hnjy-skizze.github.io/Asthma-/` (je nach Repository und Pages-Konfiguration kann die Adresse anders sein). Die echte Adresse unter Settings → Pages ablesen.
4. Auf dem iPhone in Safari öffnen → Teilen → **Zum Home-Bildschirm**.

**Lokal:** `index.html` im Browser öffnen; Filter, Suche und Texte funktionieren auch ohne Server. Eine PWA-Installation und die Updateprüfung erfordern eine HTTPS-Webadresse oder geeigneten localhost-Testserver. Alternativ liegt die separat angebotene `Asthma_Standalone.html` für die lokale Lesefassung vor.

## So funktioniert „Update suchen“

Der Button lädt bei Internetzugang `version.json` **von derselben Adresse**, unter der die App läuft, ohne Browsercache. Er zeigt an, ob dort eine höhere App-Version veröffentlicht wurde. Dazu ist **kein Zugriff auf andere GitHub-Repositories** nötig.

Für das nächste Release müssen alle folgenden Versionsangaben erhöht werden:

- `version.json` – `version`, `released`, `notes`
- `app.js` – `const VERSION = '1.0.2'`
- `sw.js` – `const VERSION='1.0.2'` (WICHTIG: wechselt den Offline-Cache)

Anschließend aktualisierte Dateien hochladen. Beim Drücken von **Neue Version laden** wird eine Service-Worker-Aktualisierung angestoßen und die Seite neu geladen. Einmaliges weiteres Laden kann je nach Browser-Cache erforderlich sein. Das ist **keine automatische Recherche zu neuem Recht**, und der Button kann ohne bereits veröffentlichtes Update **keine neue Version erzeugen**.

## Rechtliche Hinweise

Gesetzliche Vergünstigungen hängen von gesetzlichen Voraussetzungen und teils gesonderten behördlichen Entscheidungen ab. Ein GdB 10 kann nach VersMedV als Zehnergrad auftreten; ein Feststellungsbescheid nach § 152 SGB IX erfolgt erst ab GdB 20. Ein festgestellter GdB 30 oder 40 bewirkt **keine automatische Gleichstellung**. Eine Schwerbehinderung ab GdB 50 bedeutet **keinen automatischen Anspruch auf jedes Hilfsmittel**.

Die medizinischen und rechtlichen Inhalte ersetzen keine ärztliche Beratung, keinen Bewilligungsbescheid und keine anwaltliche Beratung. Die Quelle innerhalb der einzelnen Karte verlinkt den jeweiligen Originaltext. Recherche-/Inhaltsstand: 15.10.2026. Rechtslage kann sich ändern.

## Datenschutz

Die Auswahl des GdB, ein ggf. bewilligter Gleichstellungsstatus und die Merkliste werden nur über `localStorage` im jeweiligen Browser gespeichert. Das Zurücksetzen ist in den Einstellungen möglich. Die App erhebt keine Messwerte oder Gesundheitsakten. Erst beim Öffnen einer externen Quelle verlässt du die App.

## Technik und Tests

Keine Bibliotheken, Frameworks, CDNs oder API-Schlüssel benötigt. HTML, CSS und JavaScript funktionieren statisch. `sw.js` speichert die App-Dateien lokal und versucht bei Seitenaufrufen zuerst das Netz; die Update-Versionsabfrage ist bewusst **nicht offline zwischengespeichert**, damit sie keine alte Version als „aktuell“ ausgibt.

Der Funktionstest liegt unter `browser_smoke.py` (lokal geprüfte Testdatei, nicht zum Upload erforderlich); er läuft mit Python Playwright und Chromium. Er testet die isolierte Oberfläche (ohne Netz-/Service-Worker-Zugriff) auf Desktop und Mobilgeräten, alle wichtigen GdB-Berechtigungsfälle, Gleichstellung, Suche, Favoriten und die simulierte Updateanzeige. Der Live-Betrieb nach GitHub-Pages-Veröffentlichung und die Service-Worker-Aktualisierung auf einem echten iPhone müssen gesondert geprüft werden.
