ASTHMA-RECHTSMONITOR – Quellenfix / Filter-Update 3
Basis: Asthma-App 2.8.1, funktionierender Rechtsmonitor Filterversion 2

URSACHE DES PROBLEMS
Ein einzelner ausgefallener Behörden-RSS-Dienst führte bei einem Durchlauf zu 0 Treffern und ersetzte die bisherige Meldungsliste durch eine leere Datei. Der Workflow konnte trotzdem einen grünen Haken anzeigen. Die Quellenstatusanzeige hat den Ausfall korrekt gemeldet.

NEU
- Je fehlerhaftem Abruf zwei Versuche.
- Falls der RSS-Abruf von Gesetze im Internet fehlschlägt, Versuch über die amtliche Aktualitätendienst-HTML-Seite derselben Behörde.
- Falls die Bundesquelle trotzdem ausfällt, werden nach Möglichkeit alte Quellenmeldungen aus der bestehenden JSON-Datei oder der Git-Historie wiederhergestellt. Diese sind AUSDRÜCKLICH ALS ARCHIV und niemals als neu geprüft gekennzeichnet.
- Bereits falsch klassifizierte Meldungen zu Prüfungszeugnissen und Tierarzneimitteln werden aus früheren Datensätzen ausgeschlossen.
- Meldungsdaten aus dem alten Filter werden nicht als verlässliches Publikationsdatum angezeigt.
- G-BA-Titel mit „Arzneimittel-Richtlinie“ und Bindestrich werden nun als allgemeiner Themenbezug erkannt.
- Filterversion wird von 2 auf 3 erhöht, Offline-Cache wird neu aufgebaut.
- Das tägliche GitHub-Action-Workflow bleibt unverändert.

INSTALLATION
1) Bitte zuerst in der vorhandenen iPhone-App ein verschlüsseltes Backup erstellen (.asthma17) und separat sichern.
2) Diese ZIP entpacken.
3) Genau folgende vier Dateien in das HAUPTVERZEICHNIS des bestehenden GitHub-Repositories Asthma- hochladen:
     build_rechtsmonitor_feed.py
     rechtsmonitor.js
     rechtsmonitor.css
     sw.js
   Gleichnamige bestehende Dateien ersetzen, Commit changes bestätigen.
4) Die Datei .github/workflows/rechtsmonitor.yml UNVERÄNDERT LASSEN.
5) Die bestehende rechtsmonitor-feed.json NICHT überschreiben oder löschen! Das neue Skript versucht bei einem Ausfall, ältere bereits amtlich abgerufene Meldungen aus der Git-Historie wiederherzustellen.
6) In GitHub Actions → Amtliche Rechtsupdates sammeln → Run workflow starten, Branch main wählen.
7) Im Repository rechtsmonitor-feed.json prüfen: classifierVersion sollte 3 sein. Quellenstatus zeigt ggf. Fehler oder einen genutzten Ersatzabruf. Ein grüner GitHub-Haken allein beweist nicht die vollständige Erreichbarkeit der Behörden.
8) Die bestehende Home-Screen-App auf dem iPhone NEU ÖFFNEN, aber NICHT deinstallieren und keine Browserdaten löschen; unter Wissen → Rechtslage aktualisieren.

WICHTIGE GRENZEN
- Archivierte Hinweise sind NICHT aktuell bestätigt. Bei Verbindungsfehlern darf die Liste ausdrücklich unvollständig sein. 0 Treffer ist keine Entwarnung.
- HTML-Ersatzabruf und Git-Historien-Rückgriff hängen ebenfalls von erreichbaren Servern und verfügbaren Repository-Git-Daten ab. Ein Wiederherstellungsversuch kann fehlschlagen; das wird nicht als erfolgreicher Quellenabruf dargestellt.
- Die automatische Filterung ist nicht vollständig und nicht rechtsverbindlich. Volltext der amtlichen Originalquelle und Inkrafttreten müssen geprüft werden.
- Private Angaben, GdB und Gesundheitsdaten werden NICHT an die Behörden übermittelt oder im GitHub-Feed veröffentlicht.
- Keine Änderung an Tresor/Passwort, Medikamenten, Messungen oder Gesundheitsdaten.
