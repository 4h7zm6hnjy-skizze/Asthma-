# Asthma 2.7.0 Professional

**Home-Bildschirm:** Das freigegebene blau-türkise Lungenlogo wurde als neue PNG-Datei für 180, 192 und 512 Pixel integriert. Bestehende iOS-Home-Screen-Icons können trotz neuer Dateien zwischengespeichert bleiben. Deshalb die alte Installation mit gespeicherten Gesundheitsdaten nicht allein für den Iconwechsel löschen.

**Neue Ansichten:** Peak-Flow und Lungenfunktion führen zu unterschiedlichen Seiten. Die ePEF-Aufzeichnungen bleiben im bestehenden verschlüsselten Speicher, genau wie Spirometrie, Labor, Medikamente, AU und Dokumente.

**Persönliches Profil:** Unter „Mein Profil“ können Name, Anschrift, Geburtsdatum, Gewicht, optional behandelnde Praxis und Notfallkontakt sowie ein ausschließlich ärztlich festgelegter Asthma-Aktionsplan gespeichert werden. Diese Werte sind NICHT in den öffentlichen Quellcode aufgenommen. Jeder Benutzer muss sie erst nach dem Entsperren auf seinem Gerät eintragen.

**Schnellübersicht:** 30-Tage-Zähler für Peak-Flow und Tagebucheinträge sowie Gesamtzahl der gespeicherten Lungenuntersuchungen (keine medizinische Bewertung).

**Datenschutz:** Keine neuen externen Tracker oder Netzwerkdienste durch das Professional-Modul; keine geänderten Verschlüsselungsfunktionen, keine automatisch übermittelten Gesundheitsdaten. Persönliche Daten stehen im bestehenden verschlüsselten Profil. Unverschlüsselte PDF-/CSV-Exporte weiterhin vertraulich behandeln.

**Vor dem Update:** Im bisherigen iPhone/Safari-Kontext eine vollständige `.asthma17`-Datensicherung erstellen und extern sicher aufbewahren. Den alten Homescreen-Eintrag NICHT löschen und KEINE Website-Daten löschen. Nach vollständigem GitHub-Upload Updateprüfung starten und die App im selben Browser-Kontext öffnen.

**Grenzen:** Der Builder prüft Dateistruktur und JavaScript-Syntax, aber nicht alle Funktionen auf einem echten iPhone. Scanner/OCR, IndexedDB-Backup/Wiederherstellung und Safari-Offlinestatus sind weiterhin praktisch zu testen. Dieses Update enthält keinen automatischen klinischen Risikowert. Die zehn weitergehenden Verbesserungsziele aus der Roadmap bleiben teilweise offen; siehe PRUEFBERICHT_2.7.0.md.

