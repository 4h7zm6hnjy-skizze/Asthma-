# Asthma-App – Finanzielle Hilfen & Notfallkompass

**Stand:** 17. Oktober 2026  
**Basis:** öffentliches GitHub-Repository `4h7zm6hnjy-skizze/Asthma-`, Stand Commit `663d5324bb1b91fc588518b69d1f6c3d7bd05cf6`.  
**Anzeigeversion:** 2.8.1; interner Service-Worker-Cache: `2.8.1-leistungskompass-50-1`.

## Was enthält das Update?

Ein neuer, dauerhaft verfügbarer Abschnitt unter **Arbeit → Finanzielle Hilfen & Notfallkompass** mit einem Schnellzugriff auf der Startseite. Er enthält **50 Einträge, 82 behördliche und offizielle Links** zu Informationen, Gesetzen und Antragswegen. Abgedeckt sind:

- Arbeitszeitverringerung und teilweise/volle Erwerbsminderungsrente; Rentenberatung
- Krankengeld, Arbeitsunfähigkeit, stufenweise Wiedereingliederung, Aussteuerung und § 145 SGB III
- Medizinische und berufliche Reha, Übergangsgeld, Reisekosten, Hilfsmittel und Teilhabeleistungen
- Wohngeld, Kinderzuschlag, Grundsicherungsgeld (neue Bezeichnung ab 01.07.2026), Sozialhilfe und Kinderleistungen
- GdB-Änderung, Gleichstellung, Steuerpauschbetrag, spätere Ansprüche ab GdB 50
- Asthma-Medikamente/Biologika wie Nucala, Zuzahlungsbefreiung, DMP, Lungensport, Fahrkosten
- Pflegegrad, Pflegegeld, Pflegehilfsmittel und Wohnungsanpassung bei späterem Hilfebedarf
- Arbeitgeberförderung über LWL/Arbeitsagentur, technische Arbeitshilfen, Kraftfahrzeughilfe
- Verdacht auf Berufskrankheiten BK 4301/4302/1315, Berufsgenossenschaft, Verletztengeld und Unfallrente
- Widerspruchsfristen, EUTB, Integrationsfachdienst, Reha-Beratung, Kurzarbeitergeld und gesetzlichen Arbeitsschutz.

### Filter und Merkliste

Filter nach Lebenslage (heute/Teilzeit/längere AU/Reha/Arbeitsplatzverlust/Notfall/später), Leistungsart, Empfänger (ich/Familie/Arbeitgeber), GdB-Status und Suchwort. Alle Einträge bleiben ohne Vorauswahl erreichbar, auch wenn sie erst später relevant werden. Ein Stern markiert Leistungen. Der Bearbeitungsstand kann „Prüfen“, „Unterlagen sammeln“, „Beantragt“, „Bewilligt“, „Abgelehnt“ oder „Abgeschlossen“ sein. **Nur der ausdrückliche Button „Markierungen verschlüsselt speichern“ schreibt diese Auswahl in den vorhandenen lokalen AES-GCM-Tresor**.

### Wichtige fachliche Grenzen

- Der GdB 30 und eine Gleichstellung ergeben **keinen pauschalen Lohnersatz**. Renten, Krankengeld, Übergangsgeld und Bedürftigkeitsleistungen haben jeweils eigene Voraussetzungen und gegenseitige Anrechnungen.
- Teilweise Erwerbsminderungsrente hängt vom allgemeinen täglichen Restleistungsvermögen (3 bis unter 6 Stunden) und den Versicherungszeiten ab, nicht bloß von schwerer Arbeit am bisherigen Platz.
- Nach § 164 Abs. 5 SGB IX kommt unter Voraussetzungen behinderungsbedingte Teilzeit in Betracht; die staatliche Übernahme des dabei wegfallenden Lohns folgt daraus nicht.
- Arbeitgeberförderung wird **dem Arbeitgeber** gezahlt, nicht als zusätzlicher Lohn an Beschäftigte. Notwendiger gesetzlicher Arbeitsschutz ist grundsätzlich Arbeitgeberpflicht.
- Ein Verdacht auf eine Berufskrankheit verlangt fachliche Prüfung tatsächlicher Exposition gegenüber relevanten Stoffen; Wärme und Asthma allein sind kein Nachweis.
- GdB 50 ist nicht dasselbe wie eine anerkannte volle/teilweise Erwerbsminderung. Ein Anspruch auf die Altersrente für schwerbehinderte Menschen verlangt GdB ≥ 50 und weitere Voraussetzungen; Gleichstellung reicht dafür nicht.
- Stand und Geldbeträge beziehen sich auf **Oktober 2026**. Bei späterer Nutzung bitte den verlinkten offiziellen Antragsweg erneut prüfen.
- Der Kompass stellt keine verbindliche Rechtsberatung dar. Ein Klick auf Links **stellt keinen Antrag**; nur die offiziellen Antragsportale oder zuständigen Träger können das.

## Installation in GitHub

1. **Zuerst ein vollständiges verschlüsseltes Backup `.asthma17` erstellen** und die Datei an einem sicheren Ort ablegen. Die bestehende iPhone-Home-Screen-App **nicht löschen**, Safari-/Websitedaten **nicht löschen**; dort liegen lokale Gesundheitsdaten.
2. ZIP entpacken und genau diese **vier Dateien** ins **Root** des Repositories hochladen bzw. ersetzen: `leistungen32.js` (neu), `leistungen32.css` (neu), `secure17.js` (ersetzt), `sw.js` (ersetzt). Dateien **nicht in einen Unterordner** legen.
3. Optional die beigefügten `README_LEISTUNGSKOMPASS.md` und `PRUEFBERICHT_LEISTUNGSKOMPASS.md` als Dokumentation hochladen.
4. `Commit changes` bestätigen und warten, bis die GitHub-Pages-Action erfolgreich durchgelaufen ist.
5. Dieselbe bestehende PWA entsperren; **Arbeit** öffnen und unter **„Finanzielle Hilfen & Notfallkompass“** die 50 Einträge prüfen. Bei erstmaliger Nutzung **keine Markierungen vorausgefüllt**. Auf der Startseite gibt es einen neuen Schnellzugriff.
6. Eine Leistung markieren, optional Bearbeitungsstand wählen und **erst dann** auf „Markierungen verschlüsselt speichern“ tippen. App schließen/entsperren und prüfen, ob die Auswahl erhalten blieb.

## Datenschutz und Offline

Das Modul hat keinen externen Suchdienst, kein Analytics-SDK und keine externe Übertragung der gespeicherten Notizen; alle 50 Texte und Links sind lokal lesbar. Externe Links werden **nur nach einem Nutzerklick** geöffnet. Zum Online-Ausfüllen der verlinkten Behördenformulare wird Internet benötigt. Persönliche Antworten aus ChatGPT oder den anderen App-Modulen werden **nicht automatisch** in diese neue Übersicht übernommen. Der öffentliche GitHub-Code enthält keine persönlichen Gesundheits-, Arbeitgeber- oder Einkommensdaten.

## Ausgewählte amtliche Ausgangsquellen

- [§ 164 SGB IX – behinderungsgerechte Beschäftigung/Teilzeit](https://www.gesetze-im-internet.de/sgb_9_2018/__164.html)
- [Deutsche Rentenversicherung – Erwerbsminderungsrente](https://www.deutsche-rentenversicherung.de/DRV/DE/Rente/Allgemeine-Informationen/Rentenarten-und-Leistungen/Erwerbsminderungsrente/erwerbsminderungsrente_node.html)
- [DRV R0210 – Anlage Erwerbsminderung](https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/_pdf/R0210.html)
- [DRV LTA-Antragsunterlagen](https://www.deutsche-rentenversicherung.de/SharedDocs/Formulare/DE/Formularpakete/01_versicherte/reha/_DRV_Paket_Rehabilitation_Leistungen_zur_Teilhabe.html)
- [BMG – Krankengeld](https://www.bundesgesundheitsministerium.de/krankengeld)
- [BMG – Zuzahlungsgrenzen bei chronischen Erkrankungen](https://www.bundesgesundheitsministerium.de/service/begriffe-von-a-z/c/chronisch-kranke-menschen/seite)
- [Bundesagentur für Arbeit – Grundsicherungsgeld beantragen](https://www.arbeitsagentur.de/grundsicherung/grundsicherungsgeld-beantragen)
- [LWL – behinderungsgerechte Arbeitsgestaltung](https://www.lwl-inklusionsamt-arbeit.de/de/beschaeftigung/foerderungen-arbeitgeberinnen-und-arbeitgeber/behinderungsgerechte-arbeitsgestaltung/)
- [DGUV – BK Asthma / Arbeitsstoffe](https://www.dguv.de/bk-info/uebersichten/j00-j99/j45_9/index.jsp)

Der vollständige Verweiskatalog befindet sich direkt in den einzelnen Leistungsdetails der App.
