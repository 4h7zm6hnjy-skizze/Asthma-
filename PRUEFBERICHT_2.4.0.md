# Prüfbericht – Asthma 2.4.0

## Umgesetzte Funktionen

- Sicherheitsdiagnose, wenn der bestehende verschlüsselte Tresor nicht im aktuellen Browser-Speicher gefunden wird. Explizite Warnung vor einer vorschnellen Neuanlage.
- Wiederherstellung einer vollständigen `.asthma17`-Sicherungsdatei auf dem Anmeldebildschirm mit Backup-Passwort und einem neuen Passwort für die neue Browser-Installation. Ein vorhandener Tresor oder vorhandene Datensätze in dieser Installation werden nicht überschrieben.
- Medikationsplan aus bestehenden verschlüsselten `suite/meds`-Daten, mit Verabreichungsart, Einnahmezeiten, Beginn, Terminen, Bearbeiten und Druckwarnung bei unverschlüsseltem Export.
- GdB-Orientierung anhand der Anfallsschwere und ärztlich bestätigter dauerhafter Lungenfunktionseinschränkung gemäß VersMedV Teil B 8.5 und 8.3. Kein GdB-Automatismus aus FEV₁. Freiwilliger Entwurf für Änderungsantrag und amtliche Links NRW/deutschlandweit.

## Durchführung

- GitHub-Ausgangsstand Version 2.3.0; vorhandene App-Module und Datenspeicherbezeichnungen bleiben unverändert.
- Alle JavaScript-Dateien mit `node --check` syntaktisch geprüft.
- Isolierter Chromium-Browsertest mit simuliertem verschlüsselten Tresor: neue Medikamenteneinträge, Aktualisierung ohne Duplikat, GdB-Speichern, Navigation und Layout bei 320, 375, 390, 430 und 768 px bestanden (0 Seitenfehler, kein seitlicher Überlauf).
- Keine aktive Netzwerkübertragung von Gesundheitsdaten in den neuen Modulen vorgesehen.

## Noch offen / wichtige Einschränkungen

- Aufgrund einer Browser-Testumgebungsbeschränkung (`ERR_BLOCKED_BY_ADMINISTRATOR` auf lokale und simulierte HTTPS-Adressen) **kein vollständiger Ende-zu-Ende-Test** der realen IndexedDB-, WebCrypto- und Backup-Wiederherstellung möglich. Deshalb ist das Update sicherheitsbezogen **nicht vollständig validiert**. Die echte Anmeldung, Sicherung und Wiederherstellung müssen nach Veröffentlichung auf einem Testprofil mit Testdaten überprüft werden, bevor persönliche Daten verändert werden.
- Die originale lokale Datentresor-Datenbank aus einer anderen Browser-Installation kann aus einer Webapp nicht automatisch geöffnet werden. Ohne vollständige Sicherung besteht keine verlässliche Wiederherstellungsoption nach Löschung von Website-Daten.
- Der Dokumentenscanner hat weiterhin keine vollständig gebündelte iPhone-kompatible automatische Foto-OCR.
- Die GdB-Orientierung ist keine medizinische oder behördliche Bewertung; ein Änderungsantrag kann auch einen unveränderten oder niedrigeren GdB zur Folge haben. Medikamenteneinnahme ausschließlich nach ärztlicher Verordnung.
