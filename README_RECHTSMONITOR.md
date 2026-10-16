# Asthma-Rechtsmonitor – Ergänzung zu 2.8.1

## Funktionen

- Neuer Button **„Rechtslage aktualisieren“** im Bereich **Wissen / Rechte**, mit Schnellzugriff auf der Startseite.
- Geprüfte amtliche Anlaufstellen: **Gesetze im Internet / Bundesgesetzblatt, Gemeinsamer Bundesausschuss, Bundesministerium für Arbeit und Soziales, Bundesagentur für Arbeit, Deutsche Rentenversicherung und RECHT.NRW**. Kein Social-Media- oder Privatblog-Import.
- Technischer Nachrichtenabruf aus **drei** amtlichen RSS-Diensten: Gesetze-im-Internet-Aktualitätendienst, G-BA-Änderungen und G-BA-Beschlüsse. Für BMAS, BA, DRV und NRW enthält die App zunächst direkte offizielle Links, **keinen automatischen Feed**.
- Filterung nach GdB, Gleichstellung, Arbeitsschutz, Reha, Hilfsmitteln und medizinischer Versorgung. Die Kategorien zeigen ausschließlich, dass ein offizieller *Hinweis* ein Thema erwähnt, nicht ob der Inhalt schon in Kraft ist oder für eine Person Rechte schafft.
- Bei der Anzeige können Benutzer Meldungen als gelesen markieren; dieser Status wird im bestehenden verschlüsselten Profil gespeichert. Der öffentliche Feed enthält **keine** persönlichen Daten.
- Die WebApp meldet Datum des letzten Abrufs, fehlgeschlagene Quellen, veraltete Ergebnisse oder einen noch nicht eingerichteten Abruf ausdrücklich.

## Installation im GitHub-Repository

**Zuerst verschlüsselte `.asthma17`-Sicherung auf deinem iPhone erstellen.** Bestehende App nicht löschen oder Safari-Daten entfernen.

1. Die **fünf Dateien im ZIP-Hauptverzeichnis** über GitHub **Add file → Upload files** in das Hauptverzeichnis hochladen: `index.html`, `sw.js`, `rechtsmonitor.js`, `rechtsmonitor.css`, `rechtsmonitor-feed.json`. Gleichnamige Dateien ersetzen.
2. Für **automatische tägliche Aktualisierung** außerdem die Datei `scripts/build_rechtsmonitor_feed.py` nach `scripts/` und `.github/workflows/rechtsmonitor.yml` nach `.github/workflows/` hochladen. Die Ordnerstruktur muss erhalten bleiben. Falls der GitHub-Webupload die Ordner nicht übernimmt: **Add file → Create new file** und als Dateinamen den kompletten relativen Pfad `scripts/build_rechtsmonitor_feed.py` bzw. `.github/workflows/rechtsmonitor.yml` eingeben; den Dateiinhalt jeweils aus dem entpackten Ordner hineinkopieren. GitHub Actions muss für das Repository aktiviert sein.
3. Unter **Repository → Actions → Amtliche Rechtsupdates sammeln → Run workflow** einmal manuell starten. Danach läuft der Workflow planmäßig täglich (GitHub kann verzögern). Die Aktion benötigt Schreibrechte für **Repository contents**. Falls die Aktion mangels Schreibrecht nicht veröffentlichen kann, wird die Prüfung in der App nicht als aktuell ausgegeben. Der Feed sollte nach erfolgreicher Aktion `generatedAt` und den Quellenstatus zeigen.
4. GitHub Pages die Änderung ausliefern lassen. Die bestehende iPhone-App im selben Browser-/Home-Bildschirm-Kontext öffnen, **nicht** löschen. Die neue Taste befindet sich unter **Wissen** sowie über den Schnellzugriff auf der Startseite.

## Einschränkungen – wichtig

- **Keine persönliche Rechtsberatung** und keine automatische Rechtsänderungserkennung sämtlicher relevanter Paragraphen oder Gerichtsentscheidungen. Das System beobachtet drei offizielle RSS-Feeds und verschafft einen schnellen Einstieg zu weiteren Amtsseiten. Behörden-RSS kann Lücken oder Verzögerungen aufweisen.
- Die Schlagwortsuche ist **kein Nachweis für Rechtsrelevanz**, die Veröffentlichung eines Beschlusses ist **nicht gleich dessen Inkrafttreten**. Rechtsänderungen können auch außerhalb der beobachteten Quellen stattfinden. „Keine Treffer“ bedeutet nicht „nichts geändert“.
- Der Stand wird nur bei Internetverbindung aktualisiert. Ein installierter Service Worker umgeht für `rechtsmonitor-feed.json` den Cache, damit kein alter Datensatz irreführend als aktuell erscheint.
- Automatische Live-Aktualisierung erfordert laufende GitHub Actions sowie die korrekte Einstellung des Workflows. Die beigefügte JSON-Datei ist absichtlich **leer**, nicht erfunden. **Das bloße Hochladen der App-Dateien aktiviert die Feeds noch nicht**.
- Die App sendet **keine** Diagnosen, GdB-Werte, Namen, Adressen oder sonstige Profilfelder an offizielle Webseiten oder GitHub Actions. Nur amtliche, öffentliche Titel/Quellen werden in GitHub als `rechtsmonitor-feed.json` gespeichert.

## Technische Prüfung

`node --check rechtsmonitor.js` und `node --check sw.js`, Python-Syntaxprüfung, Test-XML und alle HTML-/Offline-Dateiverweise. Die vollständige Funktion mit iPhone-Safari, GitHub-Actions-Schreibrechten und echten amtlichen Live-Feeds kann erst in der Zielumgebung getestet werden.
