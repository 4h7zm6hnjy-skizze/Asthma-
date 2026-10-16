ASTHMA 2.8.1 – NUCALA-KALENDER, 28-TAGE-ERINNERUNG (4 JAHRE)
==========================================================

BASIS: Geprüfter GitHub-Stand 16.10.2026, inklusive Rechtsmonitor Quellenfix 3.
Dieses Update ergänzt die vorhandene App. Keine Anmeldung, kein neues Passwort,
keine Änderung bestehender Medikamente oder medizinischer Dosierungen.

HIER HOCHLADEN: https://github.com/4h7zm6hnjy-skizze/Asthma-
Add file → Upload files → vier gleichnamige Dateien im ROOT ersetzen:
1) secure17.js       (lädt das neue Modul nach dem Entsperren)
2) calendar17.js     (zeigt die Termine mit eigenem Spritzensymbol im App-Kalender)
3) sw.js             (Offline-Cache wird mit neuer Kennung aktualisiert)
4) nucala282.js      (neues Planungsmodul, Terminänderung und Apple-ICS-Export)
README_NUCALA_28_TAGE.txt darf optional mit hochgeladen werden.
WICHTIG: KEINE anderen Dateien löschen. GitHub-Commit bestätigen.

BENUTZUNG
- Die bestehende Asthma-App weiter benutzen (NIEMALS wegen eines Updates löschen).
- Vorher die verschlüsselte .asthma17-Sicherung erstellen und extern aufbewahren.
- Unter KALENDER erscheint „💉 Nucala – Erinnerung alle 28 Tage“.
- Unter THERAPIE → MEDIKAMENTE erscheint ein direkter Link zur Terminplanung.
- Beim ERSTEN Öffnen ist als Vorschlag der MORGEN DES GERÄTS eingestellt.
  Wenn die App erst am 17.10.2026 oder später geöffnet wird, muss das Datum
  ausdrücklich auf 17.10.2026 angepasst werden, sofern dies ärztlich so
  vorgesehen ist. Hier werden keine individuellen Gesundheitsdaten in den
  öffentlichen GitHub-Code geschrieben.
- Gewünschte Erinnerung-UHRZEIT prüfen (Vorschlag 09:00 Uhr; keine Dosisvorgabe),
  Vortag/Termintag auswählen, „28-Tage-Serie speichern“ antippen.
- Danach erscheinen die Nucala-Termine im verschlüsselten App-Kalender.
- Bei Start 17.10.2026: 53 Termine bis 12.10.2030; Ende des Vierjahresfensters
  17.10.2030. Die Folge-Termine: 14.11.2026, 12.12.2026, 09.01.2027, ...
- Das Startdatum lässt sich ändern: dadurch wird die ganze Serie neu berechnet.
- Einzeltermine über den Kalender antippen → „Datum ändern“. Die übrigen
  Termine bleiben im Abstand von 28 Tagen, solange nicht die Basis geändert wird.
- Die individuellen Einstellungen bleiben im BESTEHENDEN AES-GCM-Tresor der App.

APPLE KALENDER
- „Apple-Kalender (.ics)“ erzeugt eine iCalendar-Datei mit höchstens 53
  individuellen Terminen sowie optionalen VALARM-Erinnerungen am Vortag
  und/oder zum ausgewählten Zeitpunkt. Zeitzone Europe/Berlin, DST beachtet.
- Die WebApp selbst kann nicht direkt in die private Kalenderdatenbank schreiben:
  auf iOS muss die ICS-Datei über Teilen/Dateien/Mail bewusst importiert werden.
  Apple dokumentiert insbesondere ICS-Import aus der App Mail:
  https://support.apple.com/de-de/guide/iphone/ipha0d932e96/ios
- Wenn die Datei im iOS-Teilen-Menü nicht in „Kalender“ importiert werden kann,
  die ICS-Datei als Mail-Anhang an ein EIGENES Postfach schicken und den Anhang
  in Mail öffnen (Achtung: E-Mail und Kalender enthalten private Gesundheitsdaten).
- Falls du die Termine später änderst, werden schon importierte iPhone-Einträge
  nicht automatisch verschoben! Alte Apple-Kalender-Einträge gegebenenfalls
  manuell löschen und die neu erzeugte ICS-Datei importieren. Ein eigener
  Apple-Kalender mit Namen „Nucala“ erleichtert dies.
- Im Apple-Kalender die Mitteilungen für den Kalender aktivieren.
- Keine unverschlüsselten Kalenderdateien öffentlich auf GitHub hochladen.

SICHERHEIT UND MEDIZIN
- Termine sind Erinnerungen, KEINE Bestätigung, dass eine Injektion erfolgte.
- 28 Tage entsprechen der Angabe des Nutzers, nicht einer neuen ärztlichen
  Anweisung. Bitte mit dem tatsächlichen ärztlichen Plan abgleichen.
- Bei versäumten Terminen keine eigenständige Veränderung der Behandlung.
- In der geschlossenen WebApp sind keine verlässlichen Hintergrund-Push-Alarme
  möglich. Für Benachrichtigungen den Apple-Kalenderexport nutzen.
- Bestehende Verschlüsselung, lokale Datenbank, Medikamentenlisten, Rechte-
  Monitor, GitHub-Actions-Workflow und sonstige App-Daten bleiben unverändert.

BEKANNTE GRENZEN
- Apple Kalender bietet bei einer gewöhnlichen WebApp keine native EventKit-
  Freigabe. ICS-Import muss vom Nutzer bestätigt werden. Je nach iOS-Version
  ist der Weg über Mail oder einen Mac nötig.
- Die Uhrzeit 09:00 ist nur ein editierbarer Vorschlag.
- Die vollständige Funktion mit der ursprünglichen lokalen iPhone-Datenbank
  kann von außen nicht getestet werden. Auf dem iPhone selbst prüfen.
- Allgemeine App-Version bleibt 2.8.1, neue Offline-Cache-Kennung.
