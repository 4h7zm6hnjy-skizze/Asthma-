# Asthma 2.4.1 – Anmeldung und Tresorschutz

- Neuer Button „Mit Passwort anmelden“ auch bei nicht erkanntem Tresor.
- Ein Anmeldungversuch ohne Tresor erstellt **keine** neue Datenbank-Metadaten oder Gesundheitsdatensätze.
- Neueinrichtung ist bewusst getrennt; vor der Erstellung erfolgt eine ausdrückliche Bestätigung.
- Bei vorhandenem Tresor bleibt die direkte Anmeldung möglich; falsches Passwort verändert keine Daten.
- Wiederherstellung verwendet eigene neue Passwortfelder und das bisherige Backup-Passwort.
- Dokumentierte Grenze: Es ist nicht möglich, den verschlüsselten Tresor einer getrennten Browser-/PWA-Installation ausschließlich durch Eingabe des Passworts zu öffnen.
- Datenschutz: kein Versand von Passwort oder Gesundheitsdaten, bestehende CSP unverändert.
- Der Live-Betrieb auf iPhone-Safari muss anschließend praktisch geprüft werden.

## Durchgeführte Prüfungen
- JavaScript-Syntaxprüfung (`node --check`) für `secure17.js` und `app.js`: bestanden.
- Isolierter Browser-Smoke-Test mit **simuliertem IndexedDB/Crypto** für 320, 390 und 430 px: Anzeige der Anmeldung, fehlender Tresor ohne Neuanlage, expliziter Wechsel zur Ersteinrichtung, ablehnendes Verhalten bei falschem Passwort, erfolgreicher simulierter Login bei vorhandenem Tresor, keine ungefangenen Skriptfehler: bestanden.
- Anmeldemaske bleibt innerhalb der sichtbaren Bildschirmbreite.
- Wegen einer Testumgebungsbeschränkung konnten echte verschlüsselte IndexedDB-Transaktionen und Safari-PWA-Speichertrennung nicht automatisch Ende-zu-Ende geprüft werden. Vor einer echten Wiederherstellung bitte Sicherung aufbewahren; keine Website-Daten löschen.
