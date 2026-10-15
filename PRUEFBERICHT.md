# Prüfbericht Asthma 1.2.0 – Stand 15.10.2026

## Ergebnis

- **Bestanden (lokaler UI-Smoketest mit simuliertem Speicher):** 29 Hilfsmittel-/Antragswege, vorhandene Fachartikel, GdB-Ansichten, Version 1.2.0, Übernahme aus Antragskatalog, Vorgänge anlegen/suchen, Formularvalidierung, Dokumentauswahl, Dokumentliste, zwei Tagebucheinträge, Peak-Flow-Diagramm, CSV-Download, Aufbau eines verschlüsselten Backup-Containers, falsches Passwort wird zurückgewiesen, mobile Ansicht bei 390 Pixel, kein horizontaler Überlauf und keine JavaScript-Ausnahme.
- **Bestanden (statische Prüfung):** JavaScript-Syntaxprüfung, alle benötigten Dateien für den Service Worker vorhanden, Versionsnummer konsistent, Dateipfade in HTML, Service Worker und Manifest geprüft.
- **Offen / nicht vollständig getestet:** Echte IndexedDB-Lebensdauer und AES-GCM-Backup-Restore in einem echten Hosting-Ursprung (Netzwerkzugriff des automatisierten Chromium-Tests wurde durch lokale Sicherheitsrichtlinien blockiert). Eine UI-Simulation ersetzt keinen vollständigen Integrationstest. iPhone-Safari, Größenlimits und Verhalten bei iCloud/Smartphone-Speicherdruck sind nicht praktisch getestet.
- **GitHub-Veröffentlichung:** Diese ZIP wurde lokal erzeugt. Das bestehende Repository wurde in diesem Schritt nicht geändert. Ein abschließender Online-Test ist erst nach dem Upload und der Pages-Bereitstellung möglich.

## Besonders zu beachten

- Keine automatische Fristberechnung: Nutzer tragen ihr geprüftes Datum ein. Der Friststatus wird nur beim Öffnen der App und im laufenden Browser angezeigt; keine Push-Benachrichtigung.
- Anträge werden nicht automatisch versendet; der „übernehmen“-Knopf eröffnet nur eine lokale Erfassungsmaske.
- Lokale Dokumente sind **nicht verschlüsselt**, ausschließlich das exportierte Backup.
- Fehlgeschlagene, abgebrochene Backup-Importe werden vor einem Ersetzen geprüft; die Datenbank-Transaktion löscht/ersetzt die Stores gemeinsam.
- Es wird kein 100-prozentiger Sicherheitsnachweis behauptet; ein unabhängiger Sicherheitstest und reale Browser-/Gerätetests wären vor produktivem Einsatz mit besonders sensiblen Unterlagen sinnvoll.
