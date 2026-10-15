# Datenschutz – Asthma 2.0.0

- **Lokale verschlüsselte Speicherung:** Die bestehende Passwort-/AES-GCM-basierte Datenbank aus 1.7 bleibt unverändert. Der neue Suchindex wird nicht serverseitig gespeichert; gesucht wird nur nach dem Entsperren und im Arbeitsspeicher.
- **Keine externen OCR- oder PDF-Aufrufe:** Die neue PDF-Lesefunktion verwendet nur lokale Daten. Gescannte Bild-PDFs benötigen auf dem iPhone weiterhin Live Text oder manuelle Übernahme.
- **Keine Fernübertragung:** App-Code nutzt für Dokumenteninhalte keine Uploadschnittstelle. Veröffentlichungsserver sehen trotzdem übliche technische Seitenzugriffe; aktive Klicks auf offizielle Informationslinks können externe Webseiten öffnen.
- **Grenzen:** Ein Gerät mit Schadsoftware, ein manipuliertes Website-Bundle oder ein unverschlüsselter Export (z. B. CSV/ICS/Druck) kann Daten offenlegen. Für Backups nur die vollständige verschlüsselte Sicherung verwenden.
