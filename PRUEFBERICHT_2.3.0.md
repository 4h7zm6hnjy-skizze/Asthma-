# Asthma 2.3.0 – Prüfbericht

## Änderungen
- Neues **Spirometrie-Verlaufsdiagramm auf der Startseite** für bestätigte ärztliche FEV₁- und FVC-Untersuchungen (% vom Soll).
- Separate ausführliche Ansicht unter **Lunge** mit Messphasenfilter (vor / nach Bronchodilatator / nicht angegeben), Zeitfiltern (30, 90, 365 Tage, alle) und umschaltbaren Darstellungen: Prozente vom Soll, absolute Literwerte, FEV₁/FVC-Quotient sowie Prozent/Liter nebeneinander in getrennten Grafiken.
- Berührbare/mit Tastatur auswählbare Datenpunkte plus separate Liste der jüngsten Untersuchungen; zeigt Untersuchungstag, Messphase, beide Prozent- und Literwerte, ggf. Quotient, Praxis und Bemerkung.
- Neue optionale Felder für Untersuchungsort/Arzt und Befundnotiz beim bestehenden Knopf „Aktuelle Werte in Verlauf speichern“.
- Doppelter Speicherversuch mit identischem Datum, Messphase und gleichen FEV₁/FVC-Prozent- und Literwerten bleibt abgefangen (bestehender Mechanismus wurde geprüft).
- Bestehende verschlüsselte `suite`-Einträge des Typs `measurements` werden unverändert weitergenutzt. Kein neues Datenschema, kein Löschen und kein Umschreiben alter Befunde. ePEF-Werte bleiben separat in `epef`.

## Test
- Chromium-Browsertests mit simuliertem `ASTHMA_SECURITY`-Speicher bei Viewport-Breiten **320, 375, 390, 430 und 768 px**: bestanden; kein horizontaler Seitenüberlauf und keine ungefangenen JavaScript-Fehler.
- Speichern über die vorhandene App-Schaltfläche einschließlich Arzt/Notiz: bestanden. Identische erneute Speicherung: kein zweiter Datensatz.
- Erzeugen der Kurve bei einer einzigen Untersuchung sowie bei mehreren Untersuchungen: bestanden. FEV₁ und FVC, % vom Soll, Liter, Ratio, Vor-/Nachfilter, Punkt- und Listenauswahl, Startseiten-Verknüpfung: bestanden.
- Mathematisch richtige Relation aus echten Literwerten geprüft: 2,52 / 2,95 × 100 ≈ **85,42 %**. Prozent vom Soll werden nicht geteilt.
- Einzelne ePEF-Messung in `epef` angelegt: Anzahl und Werte der ärztlichen Lungenfunktionstests unverändert.
- Dateisyntax mit `node --check` überprüft.

## Grenzen
- Echte HTTPS-Navigation zur Testwebseite wurde im isolierten Testcontainer durch Browseradministration blockiert. Daher ist **kein vollständiger End-to-End-Test mit der realen verschlüsselten IndexedDB-Datenbank** oder iPhone-Safari erfolgt.
- Vorhandene AES-GCM-Tresorfunktionen selbst wurden nicht verändert; dies ist dennoch **keine Sicherheitszertifizierung**.
- Manuell im Profil eingetippte, aber noch **nicht in den Untersuchungsverlauf gespeicherte** Zahlen erscheinen nicht rückwirkend im Diagramm. Hierzu „Aktuelle Werte in Verlauf speichern“ wählen.
- Datenpunkte mehrerer Messphasen werden nicht als durchgehende Trendlinie miteinander verbunden. Trendvergleiche erfolgen nur zwischen zwei Untersuchungen derselben Messphase.
- Ein fehlender Quotient wird nur aus vorhandenen echten Literwerten berechnet. Keine Berechnung aus FEV₁-% und FVC-% vom Soll.
- Die FEV₁-Ampel (≥80 % grün, 60–79 % gelb, <60 % rot) ist **nur eine vereinfachte Messwertorientierung**, keine klinische Normalbereichs-/Schweregradbestimmung, kein Notfallindikator und kein ärztlicher Behandlungsplan. Der Befund kann Qualitäts- und Referenzbesonderheiten haben.
- Die automatische Foto-OCR auf iPhone-Safari ist weiterhin nicht vollständig gelöst und wird mit diesem Update nicht als behoben behauptet.

## Sicherheitshinweise für die Installation
1. Bestehendes verschlüsseltes Backup in der alten App anlegen und das Passwort separat verwahren.
2. Alle Dateien der ZIP ins Repository-Hauptverzeichnis laden (ZIP nicht als einzelne Datei hochladen).
3. GitHub-Pages-Veröffentlichung abwarten, App auf iPhone neu öffnen und 2.3.0 prüfen.
4. Bereits gespeicherte Untersuchungen auf Startseite und unter **Lunge** prüfen; Backup und Entsperren separat testen.
