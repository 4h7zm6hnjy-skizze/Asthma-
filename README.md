# Asthma 1.6.0 – Webapp für Asthma, Lungenwerte und Hilfen

Installierbare, responsive Webapp für iPhone, Android und Desktop. Quelle: bestehendes Repository `4h7zm6hnjy-skizze/Asthma-`; alle bereits vorhandenen Module aus 1.4.0 bleiben im Paket.

## NEU: aufgeräumte Navigation

Die bisherige sehr lange Startseite ist in einzelne Ansichten aufgeteilt: Übersicht, Mein Profil, Lungenwerte, Befunde, Therapie, Hilfsmittel, Anträge, Meine Akte, Arbeit, Arztbericht, Wissen und Einstellungen. Die Startseite zeigt wenige Kennzahlen und sechs Schnellzugriffe. Auf schmalen Bildschirmen kann die Navigationsleiste horizontal gewischt werden. Frühere interne `#`-Links führen weiterhin in den passenden Bereich.

## Die zwölf Weiterentwicklungen

1. **Befunde**: Fotos per Kamera/Bibliothek wie bisher; zusätzlich PDF-Seite (Auswahl), Bild um 90° drehen, per Ziehen zuschneiden, Originalbild separat in die ältere Dokumentenablage übernehmen. OCR erfolgt weiterhin erst nach explizitem Start und mit manueller Überprüfung.
2. **Lungenverlauf**: persönlich bestätigte FEV₁- und FVC-Sollwertprozente sowie Literwerte mit Datum, Bronchodilatationsphase und Diagramm speichern, ohne frühere Untersuchungen zu überschreiben. Berechnetes FEV₁/FVC-Verhältnis nur aus Litern.
3. **Arztbericht**: ausgewählte bestätigte Untersuchungen, Medikamente, altes Tagebuch, Selbstbeobachtung und Arbeitsplatzprotokoll zusammenstellen und über den Browser drucken oder als PDF speichern.
4. **Therapie**: persönliche Liste von Medikamenten, ärztlicher Dosisangabe, Behandlungsterminen, Rezeptterminen und Notizen. ICS-Kalenderexport. Keine Vorschläge für Dosierungen.
5. **Hilfen**: verbesserter Einstieg nach Atemnot, Sekretproblemen, Arbeitsplatz und Rehabilitation, direkt verbunden mit den bestehenden 29 Antrags-/Informationswegen und amtlichen Quellen.
6. **Selbstbeobachtung**: vier einfache Fragen zu Tag-/Nachtsymptomen, Aktivitäten und Bedarfsmedikation mit Verlauf. **Kein** lizenzierter ACT und keine Diagnose.
7. **Ärztlicher Aktionsplan**: Felder für ausschließlich ärztlich vorgegebene Maßnahmen und persönlichen PEF-Bestwert. Keine automatisch erzeugten Notfall-Schwellen oder Dosierungen.
8. **Arbeitsbelastungen**: Schicht, Hitze, Staub, Dämpfe, Beschwerden und Notizen dokumentieren und als CSV exportieren.
9. **Anträge**: persönliche Profildaten nach ausdrücklicher Bestätigung in einen Entwurf übernehmen; Einreichung ist weiterhin manuell und erfolgt nicht automatisch.
10. **Datenschutz**: optionale AES-GCM-Verschlüsselung mit abgeleitetem Schlüssel für die **neue Zusatzdatenbank**; passwortgeschützte getrennte Exporte für neue und ältere Datensätze.
11. **Plausibilitätsprüfung**: Zahlen, Einheiten und Lungenvolumen vor Übernahme prüfen, identische Messungen nicht doppelt speichern, bei großen Änderungen Rückfrage. Medizinische Interpretation bleibt ärztliche Aufgabe.
12. **Wartung**: v1.5.0 auf Versionsanzeige, Update-Datei, Service Worker und Diagnosefunktion abgestimmt. Auf Updates prüfen und Cache aktualisieren bleibt vorhanden.

## Datenschutz – vor Verwendung lesen

- Alte Einträge (`asthma-local-1`, `localStorage`) werden **nicht** migriert oder nachträglich verschlüsselt. Das alte Dokumentenarchiv bleibt lokal unverschlüsselt. Die zusätzliche Verschlüsselung umfasst nur neue Messreihen, Medikamente, Selbstkontrollen, Aktionspläne und Arbeitsbeobachtungen im Speicher `asthma-suite-1`.
- Bei aktivierter Verschlüsselung wird ein Passwort von mindestens 12 Zeichen benötigt; der App-Anbieter kennt es nicht. Ohne Passwort können diese Daten nicht wiederhergestellt werden. Die exportierten Backup-Dateien sind verschlüsselt, **nicht** die ursprüngliche Download-Ordnerablage.
- **Zwei getrennte Backups nötig**: Das bisherige unter „Meine Akte“ (inkl. vorhandener Unterlagen/Profile) und zusätzlich das neue unter „Einstellungen“. Keines der Backups darf als vollständige Gesamtsicherung aller Daten missverstanden werden.
- Der Scanner lädt Tesseract.js und beim PDF-Einlesen PDF.js von einem externen CDN. Die App sendet Bilder nicht absichtlich an einen Bildserver; durch Drittanbieter-Code und die Internetabhängigkeit kann nicht garantiert werden, dass der Scanner offline oder für streng vertrauliche Dokumente geeignet ist.
- Ohne ausdrücklich gespeicherten Termin können keine verlässlichen Erinnerungen erfolgen; bei geschlossener Webapp funktionieren keine Push-Benachrichtigungen. Der Kalenderexport benötigt die eigene Kalender-App.
- Browser-Speicher, Private-Browsing, Geräteverlust oder das Entfernen der Website-Daten können persönliche Einträge löschen. Sicherungen regelmäßig extern verwahren und Wiederherstellung testen.

## Hinweise zur Gesundheit und zum Recht

Diese App gibt keine Diagnosen, Therapieänderungen oder garantierte Leistungszusagen. Ein FEV₁-Prozentwert allein reicht weder zur Diagnose noch zur Zuerkennung eines bestimmten GdB oder eines Hilfsmittels. Asthma-Aktionspläne müssen individuell ärztlich festgelegt werden. Bei schwerer akuter Atemnot 112 wählen.

Relevante Originalquellen und Antragswege: `QUELLEN.md`, `ANTRAEGE_QUELLEN.md`, `LUNGENFUNKTION_QUELLEN.md`, `BEFUNDSCANNER_QUELLEN.md`, `QUELLEN_RECHT_1.2.0.md`, `NEUE_QUELLEN.md`.

## Installation / Aktualisierung

1. In der bestehenden App vor dem Upgrade **beide angebotenen Backups sichern**, sofern bereits Daten erfasst sind. Das zweite Backup für die neuen Funktionen gibt es erst nach 1.5.0; ältere Daten müssen weiterhin über „Meine Akte“ gesichert werden.
2. Inhalt dieser ZIP-Datei **entpackt direkt in das Wurzelverzeichnis** des GitHub-Repositories `https://github.com/4h7zm6hnjy-skizze/Asthma-` laden und gleichnamige Dateien ersetzen.
3. GitHub Pages in Einstellungen → Pages auf `main` und `/ (root)` belassen; erfolgreichen Build bei Actions kontrollieren.
4. App öffnen unter `https://4h7zm6hnjy-skizze.github.io/Asthma-/`. Bei alter Anzeige einmal über „Update suchen“ oder neues Laden aktualisieren.
5. In Safari mit „Teilen“ → „Zum Home-Bildschirm“ installieren.

## Grenzen der Prüfung

Statische JavaScript-Syntax, referenzierte HTML-Elemente und Navigation der zwölf Ansichten sind geprüft. Die lokale Chromium-Testumgebung sperrt alle URL-Navigationen und gibt im isolierten `about:blank`-Modus keinen Zugriff auf IndexedDB oder WebCrypto frei. Deshalb sind **Kamera-/PDF-OCR, reale Speicherung, AES-Verschlüsselung/Restore sowie der neue Service-Worker auf einem echten iPhone und GitHub Pages nicht end-to-end getestet**. Sie dürfen nicht als vollständig verifiziert gelten. Siehe `PRUEFBERICHT.md`.


## Neu 1.6.0: Region & Suche (Deutschland)
- Separate Seite **Region & Suche** in der Hauptnavigation. Alle 16 Bundesländer auswählbar.
- Landkreis/kreisfreie Stadt, PLZ und Ort frei eintragbar. Landkreis-Eingabe ist deutschlandweit offen; **keine vollständige oder amtlich geprüfte Kreis-/PLZ-Liste** und keine automatische geografische Plausibilitätsprüfung.
- Suchbegriffe und Kategorien für offizielle, deutschlandweite Suchwege: Schwerbehindertenrecht (Bundesportal), EUTB, Lungensportregister, DRV-Beratungsstellen und Informationen zu Hilfsmitteln. Für NRW zusätzlich ELSA und für **Märkischer Kreis** die verifizierte offizielle Kreis-Seite.
- Die Links führen zu echten amtlichen Stellen und Suchportalen. Dort muss ggf. der Wohnort erneut eingegeben werden; es werden keine fiktiven Kontaktstellen oder freien Termine ausgegeben.
- Region nur lokal im bestehenden `asthma-v1-preferences`-Profil gespeichert. Auch die bestehende verschlüsselte Backupfunktion des Altbereichs enthält diese Profileinstellungen; das **aktive Browserprofil ist nicht verschlüsselt**.
- Mit "Region zurücksetzen" wird nur die Region entfernt; GdB- und Lungenwerte bleiben bestehen.
- Neue Datei `region16.js` wird vom Offline-Cache aufgenommen.
- Vor einem Update bitte die persönliche Akte / lokalen App-Daten sichern.
- Quellen siehe `REGION_QUELLEN.md`.
