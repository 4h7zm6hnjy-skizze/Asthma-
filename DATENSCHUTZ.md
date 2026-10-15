# Technische Datenschutzinformation – Version 1.4.0

Die App ist eine statische Webseite. Angaben zu GdB und Merkliste werden im Browser-LocalStorage gespeichert; persönliche Vorgänge, Dokumente und Tagebuchwerte in IndexedDB. Sie werden nicht automatisch synchronisiert oder an das GitHub-Repository übertragen. Die App enthält keinen Analysedienst, keine Werbung, kein Nutzerkonto und keine serverseitige Datenannahme für diese Datensätze. Das Öffnen externer Quellen und das Abrufen statischer Dateien/der Versionsdatei erzeugt jedoch normale Netzwerkaufrufe zum jeweiligen Hosting-Anbieter.

**Keine Verschlüsselung der aktiven lokalen Datenbank.** Wer Zugriff auf ein entsperrtes Gerät, ein Browserprofil oder Browser-Daten hat, kann unter Umständen auf die Einträge zugreifen. Browserdaten-Löschung, privater Modus, mangelnder Gerätespeicher oder Browser-Verhalten können lokale Daten verlieren lassen. Bei einem Wechsel des Geräts ist das verschlüsselte Backup erforderlich.

Die **exportierte Sicherungsdatei** wird clientseitig mit WebCrypto verschlüsselt (AES-GCM-256, passwortabhängiger Schlüssel via PBKDF2-HMAC-SHA256 mit 250.000 Iterationen, zufälligem Salz und Initialisierungsvektor). Passwörter werden nicht abgelegt oder an einen Server übermittelt. Ein verlorenes Passwort lässt sich nicht zurücksetzen. Kurze/schwache Passwörter lassen sich eher erraten, daher wird eine längere, einmalige Passphrase empfohlen. Nach dem Import werden die Daten wieder **unverschlüsselt** in IndexedDB gespeichert.

Die Funktionen sind nicht medizinisch validiert. Arztbriefe, Laborberichte und andere personenbezogene Informationen sollten nicht auf gemeinsam genutzten Geräten in der App hinterlegt werden. Die Webapp ersetzt keine professionelle Patientenakte oder sichere medizinische Datenplattform.


## Befundscanner (ab Version 1.4.0)

Eine ausgewählte Bilddatei wird auf dem Endgerät per Canvas verarbeitet. Die App übermittelt das Foto nicht absichtlich an einen Server. Die optische Texterkennung verwendet jedoch eine **von Drittanbieter-CDNs geladene Browserbibliothek (Tesseract.js 5.1.1)** samt WebAssembly-Sprachdaten. Bei deren Abruf erhalten die CDN-Betreiber Netzwerkdaten, z. B. IP-Adresse, Uhrzeit und Browserkennung. Fremdcode läuft im Browser und kann grundsätzlich auf Seiteninhalte zugreifen; ein absoluter Ausschluss einer Datenübertragung durch fremde Bibliotheken lässt sich ohne eigenständig gehostete und verifizierte Bibliothek nicht garantieren. Für besonders sensible Befunde kann daher die manuelle Eingabe statt des Scanners die bessere Wahl sein.

Das Originalfoto und der erkannte Rohtext werden nach der bestätigten Übernahme oder dem Verwerfen **nicht dauerhaft** gespeichert. Ausschließlich bestätigte Messwerte werden im bisherigen unverschlüsselten Browserprofil gespeichert. Die Befundfotos können freiwillig separat im Dokumentenarchiv abgelegt werden. Der OCR-Scanner arbeitet nur, wenn die Erkennungssoftware geladen werden kann; der normale Informations- und Profilbereich funktioniert weiterhin offline.
