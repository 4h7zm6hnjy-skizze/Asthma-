# Datenschutz und lokale Speicherung – Asthma 1.5.0

**Daten verlassen die Webapp bei normaler Benutzung nicht automatisch über einen eigenen Asthma-Server.** GitHub Pages stellt nur die statische Webapp bereit. Medizinische Eingaben und Dokumente sind personenbezogene sensible Daten.

## Speicherbereiche

- **Bestandsdaten**: ältere Anträge, Dokumente, Asthma-Tagebuch in `asthma-local-1` (IndexedDB); GdB/Lungenprofil in LocalStorage. Diese Daten bleiben derzeit im Klartext in dem jeweiligen Browserprofil. Beim Update auf 1.5.0 werden sie nicht gelöscht, aber auch nicht verschlüsselt.
- **Zusatzdaten 1.5.0**: Messreihen, Medikationsliste, Kontrollen, Aktionsplan und Arbeitsplatzprotokoll in `asthma-suite-1`. Initial auch hier unverschlüsselt; in Einstellungen kannst du sie ausdrücklich mit einer mindestens 12 Zeichen langen Passphrase in der lokalen Datenbank mit AES-256-GCM verschlüsseln. Das Passwort wird nicht gespeichert. Es wird mittels PBKDF2-SHA256 abgeleitet.
- **Zwei getrennte Sicherungen**: Passwortverschlüsseltes bisheriges Backup unter Meine Akte und weiteres verschlüsseltes Zusatzdatenbackup in Einstellungen. Nur beide zusammen umfassen die zwei Teil-Datenbanken. Es erfolgt keine automatische externe Synchronisation.
- **Scanner**: Foto wird im lokalen Browser verarbeitet. Zum Laden von OCR/PDF-Bibliotheken wird externe Software von CDN-Anbietern bezogen. Da sie extern eingebundener JavaScript-Code ist, kann dessen Verhalten ohne eigene Auditierung nicht abschließend verifiziert werden. Bei vertraulichen Arztunterlagen manuelle Eingabe als Alternative verwenden.

Zum Schutz: Gerät und Browserprofil sperren, keine fremden Geräte verwenden, verschlüsselte Backups separat aufbewahren, aktuelle Originalbefunde nicht ausschließlich in der App ablegen. Keine automatisierten Frist- oder Medikamentenalarme im geschlossenen Browser.
