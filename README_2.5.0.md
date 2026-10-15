# Asthma 2.5.0 – AU, Kalender, Statistik und Medikamente

- **Akte → Asthma-AU:** bestätigte Asthma-bedingte Arbeitsunfähigkeitszeiträume dokumentieren, inklusive optionalem Dokumentlink, Arzt, Anlass, ICD, Kalender- und vereinfachtem Arbeitstagszähler. Keine automatische Diagnosezuordnung; gezählte Mo–Fr-Tage sind keine Schicht-/Lohnberechnung. NRW-Feiertage optional.
- **Akte → Dokumente:** Dokumentarten Lungenfunktionstest und Bluttest sowie Asthma-Krankschreibung.
- **Kalender:** Filterbare, farbige Kategorien für Arzttermine, Spirometrie, Labor, AU, Anträge, Bewilligungen, Fristen, Therapie, Dokumente, ePEF. Bestehende Daten nur zur Laufzeit eingeblendet, nicht als Duplikate gespeichert. Gleiche tägliche AU erscheint für jeden eingeschlossenen Kalendertag.
- **Mehr → Statistik:** Monats- und Jahresbericht mit bestätigten Lungenwerten, ePEF, Labor, Asthma-AU, Medikamente, Dokumenten und Anträgen. Daten ausschließlich im Browser, PDF mittels Druckdialog; exportierte PDF unverschlüsselt.
- **Therapie → Medikamente:** Zuletzt genannte Medikamente Trimbow, Nucala, Citalopram, Ramipril, Berodual als **Vorschläge**. Vor der Übernahme ärztliche Verordnung prüfen; kein automatisches Speichern, keine Überschreibung vorhandener Medikamente. Antibiotikakuren nicht als aktuell übernommen. Einträge danach weiterhin einzeln bearbeitbar.
- **Backup:** Kategorie `au` in beide vollständigen Wiederherstellungspfade übernommen. Bestehende verschlüsselte Datenbank bleibt erhalten.

Grenzen: Tests im isolierten Browser mit simuliertem Datenspeicher; keine bestätigte Safari-iPhone-Ende-zu-Ende-Prüfung der verschlüsselten IndexedDB, Wiederherstellung oder Druckdialoge. Auch eine 100%ige Erkennung beliebiger OCR-Befunde ist nicht behauptet.
