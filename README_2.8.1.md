# Asthma 2.8.1 – Logo und persönliches Profil

Dieses Update baut vollständig auf 2.8.0 auf und behält den bisherigen verschlüsselten Tresor, die Medikamente, Messungen, Tagebuch-, AU- und Dokumentenmodule unverändert.

## Neu / verbessert
- Neues, eigens für die App erstelltes Lungenlogo in 192 px / 512 px, iPhone-Home-Bildschirm-Icon und transparentes Asthma-Schriftlogo.
- Angepasst: Anmeldeseite, App-Kopfzeile, Startseiten-Symbole, Fußzeile, Favicon und PWA-Manifest.
- Unter „Mein Profil“ sind Name, Straße/Hausnummer, PLZ, Wohnort, Geburtsdatum und Gewicht **bereits seit Version 2.7.0 editierbar**. Es werden **keine zweiten Eingabefelder und kein neuer Datenspeicher** angelegt.
- Auf der Startseite werden nach Entsperren die im Tresor vorhandenen Werte für Name, Geburtsdatum, Gewicht und Wohnort angezeigt. Fehlende Felder bleiben leer. Die genaue Straße erscheint dort bewusst nicht.
- Berichte nutzen das neue Schriftlogo. Anschrift und Gewicht können über ein **zunächst deaktiviertes Kontrollkästchen** in die Monats-/Jahres-PDF übernommen werden. Name und Geburtsdatum waren bereits im Bericht möglich.

## Vertraulichkeit
Persönliche Werte werden **nicht in diesem öffentlichen GitHub-Repository voreingetragen**. Sie müssen einmal im entsperrten Profil auf dem iPhone eingegeben und gespeichert werden. Die App liest sie danach aus dem bestehenden lokalen verschlüsselten Tresor. Eine automatische Übernahme aus ChatGPT wäre ohne zusätzliche Freigabe und sichere Kopplung nicht möglich.

## Sichere iPhone-Installation
1. Vorher über die bisherige App ein vollständiges verschlüsseltes `.asthma17`-Backup in iOS Dateien speichern und aufbewahren.
2. ZIP im iPhone-Ordner Dateien entpacken und die **Dateien aus dem ZIP-Hauptverzeichnis** im GitHub-Hauptverzeichnis über „Add file“ → „Upload files“ hochladen (keine ZIP als Einzeldatei hochladen).
3. „Commit changes“ bestätigen und GitHub Pages die Aktualisierung ausliefern lassen.
4. **Im bisherigen Safari-/Home-Bildschirm-Kontext** öffnen, altes Passwort verwenden und gespeicherte Daten prüfen. Browserdaten nicht löschen, App nicht deinstallieren, keinen neuen Tresor anlegen.
5. Unter „Mein Profil“ die persönlichen Daten eingeben; ZIP enthält bewusst keine personenbezogenen Werte.

Ein bestehendes iPhone-Homescreen-Icon kann iOS zwischenspeichern. Die App deshalb nicht nur wegen eines alten Icons löschen.
