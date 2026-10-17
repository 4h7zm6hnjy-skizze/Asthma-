# Prüfbericht – Asthma-App Finanzielle Hilfen & Notfallkompass

**Datum:** 17.10.2026. **Basis:** `663d5324bb1b91fc588518b69d1f6c3d7bd05cf6`. **Status:** ZIP zum manuellen GitHub-Upload vorbereitet; nicht im Repository veröffentlicht.

## Umfang

- `leistungen32.js`: 50 Einträge in zwölf Kategorien mit 82 HTTPS-Links und Frist-/Zuständigkeitsangaben.
- `leistungen32.css`: mobile Darstellung für kleine iPhone-Displays und Tablet.
- `secure17.js`: ergänzt das neue Modul am Ende des bestehenden Entsperr-Loaders. Bestehende Module, Passwort- und AES-GCM-Verwaltung bleiben unverändert.
- `sw.js`: Cache-Version erhöht, neues JS und CSS zu vorhandenen 57 Assets hinzugefügt: jetzt 59 Einträge, ohne vorherige Assets zu entfernen.
- `README_LEISTUNGSKOMPASS.md`: Installation, Datenschutz und Grenzen.

## Automatisierte Tests

- `node --check` für alle geänderten JavaScript-Dateien: bestanden.
- Chromium-Browser-Smoketests bei **390, 768 und 1280 Pixel** Bildschirmbreite: bestanden.
- Alle **50 Leistungskarten** werden ohne Filter angezeigt.
- Stichwortsuche, keine Treffer, Reset, Szenariofilter und GdB-Filter getestet; bei GdB 30 wird die spezielle Altersrente für schwerbehinderte Menschen ausgeblendet, im GdB-50-Zukunftsszenario angezeigt.
- Favoritenfilter: ein markierter Eintrag ist einzeln auffindbar.
- Eintragstatus `beantragt` wählen, bewusst auf „Verschlüsselt speichern“ klicken: nur dann Schreibzugriff auf die simulierte `ASTHMA_SECURITY.updateProfile`-Schnittstelle.
- Kein ungewolltes Überschreiben vorheriger Profildaten im Test; nicht gespeicherte Änderungen verursachen keinen Schreibzugriff.
- Keine ungefangenen JavaScript-Fehler im simulierten Browserlauf.
- Kein horizontaler Scrollüberlauf in getesteten Breiten.

## Daten- und Quellenprüfung

- Prüfung der Katalogstruktur: 50 unterschiedliche IDs; 82 Linkziele mit HTTPS-Schema; keine gespeicherten privaten Daten und keine Netzwerkabfragen im Modul.
- Ausgewählte amtliche Quellseiten und kritische Angaben überprüft: Erwerbsminderungsrente/Hinzuverdienst 2026, Krankengeld, Übergangsgeld, Grundsicherungsgeld (ab Juli 2026), Zuzahlungsgrenze 1 % bei schwerwiegender chronischer Erkrankung, LWL-Teilhabe-Arbeitgeberförderung und BK 4301/4302/1315.
- Die individuellen Anspruchsvoraussetzungen sind **nicht** aus einem GdB oder einer Asthma-Diagnose allein ableitbar. Keine automatische Anspruchsentscheidung und keine Leistungsbetrag-Berechnung.

## Grenzen der Prüfung

- Kein Zugriff auf den echten iPhone-Tresor, daher kein realer Restore-/Speichertest in Safari.
- Kein vollständiger HTTP-Status-Check sämtlicher 82 externen Links; offizielle Portale und Unterseiten können sich später ändern.
- Kein vollständiger End-to-End-Test im installierten iPhone-PWA-Kontext, keine amtliche oder juristische Einzelfallprüfung.
- Der Live-GitHub-Pages-Upload wird erst **nach** manueller Veröffentlichung überprüft.

## Vertraulichkeit

Weder GitHub noch das Modul dürfen Diagnose- oder Einkommensdaten aus dem iPhone-Tresor erhalten. Externe Rechts-/Antragslinks öffnen ausschließlich auf Nutzerklick. Vor Update ist ein neues `.asthma17`-Backup empfohlen; die vorhandene PWA darf nicht gelöscht werden.
