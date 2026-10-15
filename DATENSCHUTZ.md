# Datenschutz – Asthma 1.7.0

Stand: 15.10.2026. Technische Beschreibung, keine externe Sicherheitszertifizierung.

## Speicherung

Nach Aktivierung des Passwortschutzes sind persönliche Datensätze (Profil, GdB, Lungenfunktion, Anträge, Dokumente, Tagebuch, Therapie und weitere Zusatzeinträge, Kalender) in der lokalen IndexedDB `asthma-secure-17` einzeln per AES-GCM-256 verschlüsselt. Schlüsselableitung PBKDF2-SHA256, 450.000 Durchläufe, zufälliger Salt. Kein Klartext-Passwort wird in LocalStorage, Cookies oder auf einem App-Server gespeichert. Profile und Dokumente aus älteren Versionen werden beim Einrichten migriert und danach logisch aus ihren alten Browserspeichern entfernt, soweit die Browser-Löschoperation gelingt. Schlägt die Bereinigung fehl, muss sie erneut ausgeführt werden; bis dahin können alte Klartextbestände auf dem Gerät vorhanden sein.

## Netzwerk

Die App lädt Code und statische Inhalte vom eigenen GitHub-Pages-Host. Sicherheitsrichtlinie (CSP) beschränkt aktive Skripte, automatische Netzwerkverbindungen und eingebettete Ressourcen auf denselben Host. Weder Gesundheitsdokumente noch persönliche Formulare werden vom Anwendungscode zu einer API übertragen. Automatische Texterkennung per externer CDN-Bibliothek und PDF-Lese-Nachladen sind deaktiviert. Externe fachliche Quellen und amtliche Seiten werden beim aktiven Öffnen als eigenständige Websites besucht. Ein Host/Netzanbieter erfährt normale Website-Verbindungsmetadaten (u. a. IP), aber keine lokal gespeicherten Gesundheitsdatensätze aus der App.

## Grenzen

- Keine absolute Zusicherung, dass kein Dritter Zugriff erlangen kann: kompromittiertes Gerät, Browser-Erweiterung, manipulierte App-Datei, Betriebssystem-Backups oder Gerätezustand können Schutz aushebeln.
- Der Entschlüsselungsschlüssel liegt während einer entsperrten Sitzung im RAM. Automatische Sperre bietet zusätzlichen, aber keinen vollständigen Schutz.
- Das Löschen von Daten ist keine forensisch garantierte Löschung auf Flash-Speichern.
- CSV-, ICS- und andere manuell exportierte Arzt- und Kalenderdateien sind in der Regel unverschlüsselt. Komplettbackups im Format `.asthma17` sind mit einem **eigenen Passwort** verschlüsselt. Ein vergessenes Passwort kann nicht rekonstruiert werden.
- Websitedaten können vom Browser auf dem Gerät entfernt werden. Darum regelmäßige externe **verschlüsselte Backups** auf sicher verwahrte Datenträger erstellen.

**Wichtig:** Keine eigenen vertraulichen Dateien, Patientenbefunde, Passwörter oder Backups in das öffentliche GitHub-Repository laden.
