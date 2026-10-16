# Asthma – Diagnosehinweise & medizinische Einschätzung (Erweiterung zu 2.8.1)

## Einbau ins bestehende GitHub-Repository

Basis: geprüftes Repository `4h7zm6hnjy-skizze/Asthma-`, Commit `5d1ca9952b0324c445960d7fdaa631b029d1a561` (16.10.2026). Die GitHub-Integration verweigerte direkten Schreibzugriff (403); die folgenden Dateien müssen im Repository-Hauptverzeichnis hochgeladen werden.

1. **Vorher eine verschlüsselte `.asthma17`-Sicherung erstellen** und separat aufbewahren.
2. ZIP entpacken. In GitHub unter **Add file → Upload files** die Dateien `secure17.js`, `sw.js`, `assessment29.js` und `assessment29.css` hochladen. Gleichnamige Dateien ersetzen, alle anderen Dateien unverändert lassen.
3. **Commit changes** bestätigen. Warten, bis **pages build and deployment** erfolgreich abgeschlossen ist.
4. Bisherige iPhone-WebApp im gleichen Browser-/Home-Bildschirm-Kontext öffnen und entsperren. Bei altem Stand einmal vollständig schließen und neu öffnen. **Keine App löschen, keine Safari-Website-Daten löschen, keinen neuen leeren Tresor anlegen.**
5. Auf der Startseite erscheint **Asthma: Diagnosehinweise & Einschätzung**. Mit der Schaltfläche **Vier Kontrollfragen beantworten** den bestehenden vierwöchigen Kontrollfragebogen aufrufen. Danach **Einschätzung aktualisieren** drücken.

## Was die Einschätzung tut

- Wertet die vier bereits vorhandenen Ja-/Nein-Kontrollfragen aus, sofern innerhalb der letzten 28 Tage vollständig beantwortet.
- Zeigt zuletzt dokumentierte FEV₁-Werte (% vom Soll) samt Datum; Veränderungen werden nur zwischen Messungen mit derselben angegebenen Messphase beschrieben. FEV₁ allein beweist keine bestimmte Diagnose oder Schweregradstufe.
- Zeigt dokumentierte PEF-Werte, optional den Unterschied von zwei 7-Tage-Mittelwerten (nur bei ausreichenden Messungen; keine Farbzonen oder vermeintliche Gefahrenstufen ohne ärztlich ermittelten persönlichen Bestwert).
- Zeigt dokumentierte nächtliche Beschwerden und Bedarfsanwendungen, unterscheidet Nicht-Eintrag von `0`.
- Verweist bei deutlichen Auffälligkeiten auf ärztliche Überprüfung, in der Notfallbox auf 112.
- Meldet fehlende oder mehr als 90 Tage alte Messungen ausdrücklich. Die Angaben bleiben vollständig lokal und verschlüsselt in den bestehenden Gruppen; das Modul **liest nur**.

## Medizinische Grenzen

**Das ist eine symptom- und messwertbasierte Orientierung, keine Diagnose, keine Notfalldiagnostik und kein Ersatz für Spirometrie, Anamnese und ärztliche Untersuchung.** Selbst bei 0/4 auffälligen Kontrollfragen kann eine Erkrankung vorliegen. Die vierte Frage der App lautet allgemein „Bedarfsmedikation“; in GINA 2026 gilt die Schwelle für die Anwendung von SABA-Bedarfsmedikamenten (nicht pauschal für alle Bedarfsbehandlungen). Daher ist die Einstufung hier bewusst als **orientierende Einschätzung** formuliert und kein validierter ACT-Score.

FEV₁ kann aus vielen Gründen vermindert sein; ohne FEV₁/FVC, Bronchodilatatorreaktion, Anamnese und Qualitätskontrolle keine diagnostische Zuordnung. Unterschiedliche Messbedingungen können einen scheinbaren Trend erzeugen. Peak-Flow und FEV₁ werden nicht als Dosieranweisung genutzt. Ohne verlässliche kontinuierliche Überwachung kann die App bei geschlossener Anwendung keine akuten Notfälle erkennen.

Bei schwerer Atemnot in Ruhe, kaum möglichem Sprechen, bläulichen Lippen, Verwirrtheit oder zunehmender Erschöpfung **sofort 112 anrufen**; nicht auf diese App warten. Keine Medikamente selbstständig absetzen oder neu dosieren.

## Quellen

- GINA, *2026 Summary Guide for Asthma Management and Prevention*: https://ginasthma.org/2026-gina-summary-guide/
- Nationale VersorgungsLeitlinie Asthma, 5. Auflage, AWMF/NVL: https://www.awmf.org/aktuelles/awmf-aktuell/nationale-versorgungsleitlinie-asthma-1

Keine Inhalte der Leitlinien kopiert oder eingebettet; nur eigenständige, kurze Regel- und Hinweisformulierungen.
