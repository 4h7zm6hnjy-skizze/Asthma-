# Prüfbericht Asthma 3.2.1

## Grundlage und Änderungen
Basis: Asthma--main 5.zip (Archiv-Kommentar / Commit: 0715e9a0124593e32b58f7f3a9377e936730142a).
Die Metadaten der Basis nennen 3.1.8; einzelne ergänzende Module tragen bereits andere Versionsbezeichnungen.
Das Update führt App-Anzeige, Skript-Versionierung und Offline-Cache auf 3.2.1.
Es enthält nur neun neue/geänderte App-Dateien. Private JSON-Importdateien und sonstige Inhalte des Ausgangsarchivs sind nicht im Update enthalten.
Keine neue Bibliothek oder Netzwerk-API zur Laufzeit. Keine Änderung des Verschlüsselungs-/Passwortverfahrens.

## Erfolgreich ausgeführt
- JavaScript-Syntaxprüfung aller fünf neuen/geänderten JS-Dateien.
- Alle im Offline-Cache aufgeführten lokalen Dateien existieren im zusammengesetzten Projekt.
- Parser: 15/17/30/90, Umlaute, codierte URL, Datumsvalidierung, ungültige Zahlen, fehlende Gründe, zusätzliche Felder und beschädigte URL-Codierung.
- Gezielte DOM-Integration mit JSDOM, Fake IndexedDB und tatsächlichem secure17.js/AES-GCM über Node WebCrypto: neue Tresoreinrichtung, getrennte Auswahl, Schreiben/Lesen und Tagesgesamtzahl.
- Vergangener Erfassungstag zählt nicht zur heutigen Summe.
- Wiederholter identischer Übergabetext erzeugt keinen zweiten Datensatz.
- Ungültige Eingaben und Abbruch erzeugen keinen Eintrag.
- Simulierter Speicherfehler: keine Erfolgsmeldung, Auswahl bleibt erhalten, erneutes Speichern funktioniert.
- Datenbankprüfung: gespeicherte Datensätze sind verschlüsselt; ausgewählter Grund erscheint nicht als Klartext im Rohdatensatz.
- Übergabe bei gesperrter App bleibt ausstehend und ist kopierbar; kein Klartext-Eintrag in localStorage.
- Bestehende Sicherheitsdatei unterscheidet sich ausschließlich durch Versionskennungen der geladenen Skripte.

## Testumfang / offen
Die gezielte DOM-Prüfung lädt andere, unveränderte App-Module nicht. Sie ist kein vollständiger Browser- oder Regressionstest der gesamten Gesundheits-App.
Ein zusätzlich vorbereiteter Chromium-Test konnte nicht ausgeführt werden: kein Browser installiert; Browser-Download lieferte kein gültiges Archiv. Keine visuelle Browserprüfung und kein echter Service-Worker-Offlinetest durchgeführt.
Nicht am realen iPhone geprüft: Apple Kurzbefehle-Aktionen, Sperrbildschirm, Face ID, Safari/PWA-Speichertrennung, Clipboard-Zugriff und Offline-Linköffnung.
Die Anleitung enthält daher den manuellen Einfügeweg in die bestehende installierte App. Für eine native Kurzbefehle-Installation ist einmalige Einrichtung auf dem Gerät nötig; eine signierte .shortcut-Datei wird nicht vorgetäuscht.

## Verhalten
Einträge werden erst nach sichtbarer Bestätigung im entsperrten Tresor gespeichert. Schicht und Beschwerden werden nicht erfunden (leer / nicht angegeben). Datum/Uhrzeit sind Erfassungsmetadaten; es gibt keine Dauer-/Zeitmessung.
Tagesgesamtzahl bezieht sich auf das lokale Kalenderdatum des gespeicherten Eintrags, wie beim vorhandenen Treppenzähler. Bei Nachtschichten erfolgt keine automatische Zuordnung zum Vortag.
Gleiche Übergabe wird anhand ihrer stabilen Kennung erkannt; nach bewusstem Löschen des Eintrags kann sie erneut übernommen werden. Ein neuer Kurzbefehl-Aufruf erhält eine neue Kennung.

## Übertragung / Datenschutz
Anzahl und Grund stehen vor dem Import unverschlüsselt in Zwischenablage und optional URL-Fragment; nicht öffentlich teilen. Das Fragment wird nach erfolgreichem Import aus dem aktuellen Verlaufseintrag entfernt, aber externe Verlaufs-/Clipboard-Synchronisierung wird dadurch nicht rückwirkend gelöscht. Keine automatische Cloud-Synchronisierung.
