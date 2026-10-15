# Asthma 2.2.0 – Peak-Flow-Diagramme auf der Startseite

Die Startseite zeigt unter den Gesundheitskennzahlen zwei Diagramme für PEF (l/min) und FEV₁ (Liter). Sie verwenden die bereits in `ASTHMA_SECURITY` lokal verschlüsselt gespeicherten ePEF-Messungen. Ein erneuter Import ist nicht nötig. Auf dem iPhone müssen die Daten im selben Browser/App-Speicher und mit demselben Passwort geöffnet werden.

**Farbregel:** Vor 13:00 Grün, 13:00–16:59 Blau, ab 17:00 Rot. Die Linienfarben bedeuten ausschließlich Uhrzeiten und keinerlei medizinische Risiko-Einstufung.

Der Startseitenfilter zeigt standardmäßig die letzten 30 vorhandenen Messungen (unabhängig von deren Alter), daneben 7, 30, 90 Tage oder alle. Diagrammpunkte zeigen beim Antippen die Datums-/Uhrzeit-/Wertekombination. Ein Link führt direkt zum Import-Tagebuch.

**Doppelte Messungen:** Datum, Uhrzeit, PEF und FEV₁ werden zum eindeutigen Vergleich normalisiert. Exakt identische Einträge werden beim Vorschauen, Speichern und erneuten Import nicht neu eingefügt. Mehrere Messungen in derselben Minute mit unterschiedlichen PEF/FEV₁ bleiben bestehen. Wenn von früheren Versionen bereits identische Duplikate vorhanden sind, kann man diese nach gesonderter Bestätigung gezielt entfernen. Das Löschen ist niemals automatisch und betrifft nur exakte Duplikate.

**Sicherung:** Vor dem Update mit bestehender App ein verschlüsseltes Backup erstellen. Alle bestehenden Datenbanken und ihre Passwörter bleiben erhalten; die neue Version verschiebt oder löscht die gespeicherten Messungen nicht automatisch.

**Datenschutz:** Excel wird im Browser ohne Netzübertragung verarbeitet. Daten werden aus der verschlüsselten lokalen Akte gelesen. Andere iPhones/Browserspeicher haben diese Daten nicht automatisch.

**Einrichten:** Entpackte Dateien (nicht die ZIP selbst) ins GitHub-Repository-Hauptverzeichnis laden; alte Dateien ersetzen und die GitHub-Pages-Veröffentlichung abwarten.

Die Dokumentation der bisherigen Funktionen ist weiterhin in den älteren README- und Quellen-Dateien sowie im Code enthalten.
