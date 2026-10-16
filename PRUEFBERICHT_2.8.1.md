# Asthma 2.8.1 – Prüfbericht

## Umsetzung
- Generiertes Asthma-Bildmaterial in lokale PNG-Dateien für 192/512/180 Pixel sowie transparentes Schriftlogo umgesetzt.
- Neue Referenzen in Manifest, Anmeldeansicht, Navbar, Dashboard und Monats-/Jahresbericht hinterlegt.
- Bestehende persönliche Eingabe von 2.7.0 wiederverwendet, keine zweite Speicherung.
- Profil-Kurzansicht erweitert um gespeicherte DOB, Gewicht, Wohnort; Straße und Postleitzahl bleiben im Profil.
- Report-Option für Anschrift/Gewicht ist anfangs deaktiviert, weil ausgedruckte PDFs unverschlüsselt sind.
- Unveränderte API `ASTHMA_SECURITY.updateProfile` und verschlüsselter Datenspeicher; keine eingegebenen Gesundheits- oder Adressdaten in den App-Dateien.
- Versionen in Oberfläche, SW, Manifest, Diagnostik und JSON auf 2.8.1 aktualisiert.

## Prüfumfang
- Statische Prüfung aller vorhandenen JS-Dateien per `node --check`.
- Existenz aller Manifest-, HTML- und Service-Worker-Ressourcen.
- Kontrolle auf versehentliche Veröffentlichung von persönlichen echten Datensätzen in den Änderungen.

## Einschränkung
Kein Zugriff auf tatsächlich gespeicherte iPhone-Daten. Ein vollständiger iPhone-Safari-Test von Anmeldung, Offline-Speicher und echter Wiederherstellung kann nur auf dem Gerät erfolgen. Die GitHub-Pages-Veröffentlichung ist erst nach dem Hochladen abgeschlossen.
