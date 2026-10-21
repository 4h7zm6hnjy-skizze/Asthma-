ASTHMA WEBAPP – UPDATE 2.9.0
Stand 21.10.2026

So aktualisierst du deine GitHub-App:

1. Vorher: In deiner bisherigen Asthma-Webapp unter Einstellungen eine vollstaendige
   verschluesselte .asthma17-Sicherung anlegen, bevor du etwas aenderst.
2. Das Paket auf einem Mac entpacken.
3. ASTHMA_UPDATE_STARTEN_MAC.command mit einem Doppelklick ausfuehren.
   Bei macOS-Sicherheitssperre: Rechtsklick > Oeffnen (nur wenn du dem Script vertraust).
   Das Skript holt den aktuellen oeffentlichen Hauptbranch deines GitHub-Repositories.
4. Der Ordner Asthma_2.9.0_Zum_Hochladen wird erstellt.
5. Auf GitHub ins Repository 4h7zm6hnjy-skizze/Asthma- gehen.
   Add file > Upload files; ALLE DATEIEN im Ordner
   Asthma_2.9.0_Zum_Hochladen hochladen und bestehende gleichnamige
   Dateien ersetzen. NICHT die ZIP selbst als eine Datei ins Repo legen.
   Zurueck im Repo Commit changes ausloesen.
6. GitHub Pages-App im selben Safari-Profil/Home-Bildschirm-Symbol wie zuvor
   oeffnen. Vorhandene lokale Daten NICHT durch Loeschen von Websitedaten entfernen.
   Unter Einstellungen Update suchen / App erneut laden.

Neue Funktionen:
- Blutsauerstoff SpO2 (Apple Watch / Finger / Ohr), manuelle Eintraege
- Blutdruck systolisch/diastolisch zusammen, getrennte Kurven
- Puls, separates Diagramm
- Datum/Uhrzeit/Geraet/Notiz, Bearbeiten und Loeschen
- Zeitansichten 1, 7, 30, 365 und 3652 Tage (ungefaehr 10 Jahre)
- Durchgezogene Messlinien und gestrichelte persoenliche Referenzlinien
- Zeitfilter/Referenzen auch in bestehender ePEF-, Spirometrie- und Tagebuchansicht
- Erneute begrenzte Offline-Wechselwirkungspruefung bei jeder Medikamentenaenderung
- Blutsauerstoff, Blutdruck und Puls im Monats-/Jahresbericht

MEDIZINISCH WICHTIG:
Individuelle Referenzwerte werden NIEMALS allein aus Gewicht, Alter und Koerpergroesse
als gesichert berechnet. Sie muessen fachlich bestaetigt und eingegeben werden.
Die Medikamentenpruefung deckt nur wenige hinterlegte Kombinationen ab.
Ein fehlender Warnhinweis bedeutet NICHT, dass eine Kombination sicher ist.
Bei einem neuen oder unbekannten Wirkstoff bitte Arzt/Apotheke fragen.
Apple Health kann aus einer reinen Webapp nicht direkt ausgelesen werden.
Die Apple Watch ist kein Ersatz fuer ein medizinisches Pulsoximeter.

TECHNISCH WICHTIG:
Die Daten verbleiben im vorhandenen verschluesselten lokalen Tresor.
Der Mac-Helfer verarbeitet nur oeffentlichen App-Quellcode, KEINE privaten Messwerte.
Im Fall eines nicht passenden App-Codes wird abgebrochen statt geratene Ersetzungen
vorzunehmen. Einmal gestartete Updates sind nicht automatisch online installiert.
