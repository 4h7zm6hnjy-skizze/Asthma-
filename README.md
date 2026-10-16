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
