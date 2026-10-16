# Asthma 2.6.0 – modernes Gesundheitsdesign

Das bestätigte blau-türkise Design ist in der **echten WebApp** eingebaut, nicht nur eine Designzeichnung. Es enthält die neue Startseite, Lungenwerte-Karten, den weiterhin voll nutzbaren ePEF-/Spirometrie-Verlauf, den farbigen Kalender, die Akten-Schnellwahl sowie das neue Logo und iPhone-App-Symbol.

## Installation
1. Zuerst eine vollständige verschlüsselte `.asthma17`-Datensicherung in der bisherigen App erstellen.
2. Dieses ZIP vollständig entpacken und **alle Dateien aus dem Hauptverzeichnis** in den Root des GitHub-Repositories `4h7zm6hnjy-skizze/Asthma-` hochladen.
3. `Commit changes` bestätigen und die GitHub-Pages-Veröffentlichung abwarten.
4. Im bereits verwendeten Safari-/Homescreen-Kontext öffnen und mit dem alten Passwort entsperren. Website-Daten nicht löschen.
5. Startseite, Lunge, Kalender, Akte und Medikamente prüfen; bei Cacheproblemen die App schließen und erneut öffnen.

Wichtig: Das Design zeigt nur bestätigte Messwerte aus dem verschlüsselten Tresor; manuell ausgefüllte aber nicht gespeicherte Lungenwerte werden als solche nicht in der Startseite oder Statistik gezählt. Das alte Passwort-/Datenformat bleibt unverändert.

## Datenschutz und Grenzen
Die neuen Assets werden lokal geliefert. Der Passwort-Tresor wird weder neu angelegt noch konvertiert. Bei iOS kann das bereits installierte Home-Bildschirm-Icon zwischengespeichert sein. Zum Iconwechsel nicht die bisherige App-Installation löschen, wenn dort Gesundheitsdaten gespeichert sind.

Der lokale Scanner bleibt auf die bisher verfügbaren Safari/iOS-Texterkennungswege beschränkt; keine vollautomatische Bild-OCR in dieser Version. Monats-PDFs sind außerhalb des Tresors nicht verschlüsselt.

Ausführliche technische Nachweise: `PRUEFBERICHT_2.6.0.md`.

---

# Asthma 2.4.1 – WebApp

Privater verschlüsselter Gesundheitsmanager mit PEF-/FEV₁-Diagrammen, ärztlichen Spirometrie-Verläufen, Laborwerten, Befundscanner, Medikamentenplan, Kalender, Anträgen, regionaler Suche und GdB-Orientierung.

**Wichtig:** Wenn „Tresor einrichten“ erscheint, obwohl zuvor ein Passwort bestand, bitte **keinen neuen Tresor anlegen**. Der Browser kann die alte lokale Datenbank in dieser Installation nicht erkennen. Zuerst im bisherigen Safari-/Homescreen-Kontext prüfen; nur mit vollständiger verschlüsselter `.asthma17`-Sicherung eine Wiederherstellung auf dem Anmeldebildschirm durchführen. Kein automatischer Cloud-Speicher.

**Medikamente:** Bereich Therapie. Dosis, Zeitfenster und Termine nur nach ärztlichem Plan. Als PDF gedruckte Pläne sind nicht verschlüsselt.

**GdB:** Profil. Unverbindliche Informationen nach VersMedV; kein automatischer GdB-Bescheid. NRW-Anträge über ELSA, bundesweit die zuständige Stelle im Bundesportal suchen.

**Installation:** Alle entpackten Dateien in das Hauptverzeichnis von GitHub Pages hochladen; `version.json` zeigt 2.4.1. Bestehende Daten vor Aktualisierung sichern.

**Grenzen:** Der lokale Tresor und die Wiederherstellung wurden im Update nicht auf einem echten iPhone-Safari-Endgerät getestet. Neue Software wird per GitHub Pages geladen, was bei kompromittierten App-Dateien den lokalen Datenschutz gefährden kann. Kein Versand von persönlichen Daten durch den Anwendungscode vorgesehen. Aktueller Prüfbericht: `PRUEFBERICHT_2.4.1.md`.


## Anmeldung 2.4.1
Die Anmeldung mit bestehendem Passwort ist ein eigener Einstieg. Wird kein lokaler Tresor gefunden, erfolgt **keine** Tresor-Neuanlage und keine Passwortpruefung. Safari, Home-Bildschirm-App und privates Browserfenster koennen getrennte lokale Daten haben. Bitte dieselbe Installation verwenden oder eine `.asthma17`-Sicherung wiederherstellen. Backup-Passwort und neues Tresor-Passwort werden im Wiederherstellungsformular getrennt eingegeben.


## Version 2.5.0

Siehe `README_2.5.0.md`: Asthma-AU, farbiger Kalender, Monats-/Jahresbericht, PDF-Druckdialog sowie editierbare Vorschlagsliste zuvor genannter Medikamente.

## Version 2.5.1

Hilfsmittel jetzt ausdrücklich nach Krankenkasse prüfen, Privatzahlung/Selbstzahler und möglicher Eigenleistung gekennzeichnet (Such-/Filterfunktion). Siehe `README_2.5.1.md`.
