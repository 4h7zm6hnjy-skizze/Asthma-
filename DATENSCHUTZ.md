# Datenschutz – Version 1.8.0

**Gesundheitsdaten werden standardmäßig lokal und verschlüsselt im bestehenden Tresor `asthma-secure-17` gespeichert.** Dazu gehören jetzt auch die Laborwerte (`labs`) und geprüfte, ausführliche Spirometrie-Tabellen (`suite`). AES-GCM mit schlüsselableitendem PBKDF2 kommt für die Tresordaten und verschlüsselte Exporte zum Einsatz. Die Passwortsicherung erfordert ein vertrauenswürdiges Gerät und authentische App-Dateien. Ein kompromittiertes Gerät bzw. manipulierter Website-Code kann den Schutz umgehen.

Der Befundscanner **sendet keine Fotos an externe OCR-Anbieter**. Bei unterstütztem Browser nutzt er eine geräteeigene Texterkennung. Auf dem iPhone wird Apple Live Text in der Fotos-App zum Kopieren der Zeichen verwendet; die App wertet nur den eingefügten Text lokal aus. Externe OCR-/PDF-Skripte sind deaktiviert. Ausgewählte Bilder werden zur Vorschau im Browser angezeigt und nur nach ausdrücklich angeklicktem „Originalbild archivieren“ in der verschlüsselten Akte gespeichert. Fotos und kopierte Texte sind beim Entsperren im Arbeitsspeicher sichtbar; eine perfekte Verhinderung des Zugriffs Dritter ist nicht garantierbar.

Freiwillig geöffnete amtliche Links können externe Websites laden, die eigene Datenschutzregeln haben. Der Gastgeber von GitHub Pages verarbeitet normale Seitenaufrufe und Metadaten, die App führt jedoch keine Hintergrundübertragung gespeicherter Labor- oder Spirometriedaten an einen Server aus. Die `version.json` wird ausschließlich vom eigenen Hosting-Ursprung abgerufen.

Der vollständige `.asthma17`-Export verschlüsselt ausdrücklich auch die neue Gruppe `labs`. Exportierte ICS-, CSV- und gedruckte PDFs können unverschlüsselt sein. Browserdatenlöschung oder Verlust des Passworts kann ohne funktionierende Sicherung zum Datenverlust führen.

**Achtung:** Keine medizinische Diagnose, kein Medizinprodukt und keine unabhängige Sicherheitszertifizierung. Fehlerhafte OCR-Werte nie ohne Vergleich mit dem Original übernehmen.
