PNEUMOPRO – UPDATE 3.4.5
Stand: 29.10.2026 | Quelle: GitHub-Projekt Asthma-, Hauptbranch main, Version 3.4.4

WAS NEU IST
- Neuer App-Name „PneumoPro“ in Titel, Anmeldung, Startseite, Navigation,
  App-Manifest sowie gedrucktem Gesundheitsbericht/PDF-Dateinamen.
- Vorhandenes Lungenlogo bleibt erhalten; keine Bilddatei wird geändert.
- Passwort ändern: Altes Passwort verifizieren, neues Passwort zweimal eingeben.
- Passwort vergessen: Hilfe und schreibgeschützte Prüfung eines vollständigen
  verschlüsselten .asthma17-Backups. KEIN ungesicherter Passwort-Reset.
- Bereits gespeicherte Gesundheitsdaten, IndexedDB, Verschlüsselungsschema,
  alte Backups und der Startpfad der iPhone-App werden nicht geändert.

SO INSTALLIERST DU DAS UPDATE AM IPHONE
1. In der bisherigen App unter EINSTELLUNGEN eine vollständige verschlüsselte
   Datensicherung (.asthma17) anlegen und außerhalb der App speichern.
   Prüfe, ob du das zugehörige Passwort kennst.
2. ZIP in der Dateien-App entpacken.
3. Öffne https://github.com/4h7zm6hnjy-skizze/Asthma- in Safari.
4. Öffne den Ordner .github / workflows. Falls er nicht vorhanden ist,
   muss der Pfad .github/workflows zunächst angelegt werden.
5. Lade NUR die Datei pneumopro-update-v345.yml aus GitHub_Update/.github/workflows
   in diesen GitHub-Ordner hoch und speichere/committe die Datei.
   Die ZIP selbst NICHT ins Repository hochladen.
6. GitHub > Actions > „PneumoPro - Update 3.4.5“ öffnen.
   Auf grünes Häkchen (= erfolgreich) prüfen. Falls nicht automatisch gelaufen,
   „Run workflow“ für main auswählen. Bei Fehler NICHT Daten/Safari löschen.
7. In der bisherigen iPhone-App unter EINSTELLUNGEN „Nach Updates suchen“
   und „Update installieren“ wählen, bis Version 3.4.5 erscheint.
8. Prüfen: Anmelden, vorhandene Daten öffnen, Passwort-vergessen-Hilfe,
   Einstellungen > Passwort ändern, Monats-/Jahresbericht und Offlinebetrieb.

ACHTUNG
- Es wird KEIN neuer Tresor erstellt. Keine Daten oder Website-Daten löschen.
- Das Passwort wird nicht automatisch wiederhergestellt. Ohne bisheriges
  Passwort ODER entschlüsselbare vollständige Sicherung sind verschlüsselte
  Daten nicht rekonstruierbar.
- Vorhandene .asthma17-Sicherungen behalten ihr altes Sicherungspasswort.
- Durch eine Umbenennung kann iOS den alten Namen unter dem Home-Screen-Icon
  noch zwischenspeichern. Die bestehende App deshalb NICHT deinstallieren.
- Der Workflow braucht GitHub Actions mit Schreibrechten für contents. Bei
  gesperrten Repository-Einstellungen wird KEIN Code veröffentlicht.
- Dieser Update-Workflow wurde statisch geprüft; ein echter Test auf deinem
  iPhone oder in deinem Browser ist damit nicht ersetzt.

ENTHALTENE DATEIEN
GitHub_Update/.github/workflows/pneumopro-update-v345.yml – Hochladen
Quellcode/patch_pneumopro_345.py – zur Prüfung, NICHT hochladen
README_IPHONE.txt – diese Anleitung
