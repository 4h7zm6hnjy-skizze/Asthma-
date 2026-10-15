# Asthma 1.9.2 – feste Seitenanpassung für das iPhone

Vollständiges Update auf Basis der tatsächlich veröffentlichten Version 1.9.1. **Vor der Installation verschlüsseltes Backup erstellen.**

## Korrekturen
- iPhone: `viewport` hält die Seite auf 100 % Gerätebreite, maximaler Maßstab standardmäßig 1. 
- iOS-Pinch-Gesten außerhalb des Befundfoto-Fensters werden in der Standardkonfiguration begrenzt.
- Der Scanner hat einen Button **Ansicht einpassen**. Unter Einstellungen gibt es denselben Button sowie die Option **Seitenvergrößerung erlauben (Barrierefreiheit)**. Diese Einstellung speichert ausschließlich eine unkritische Anzeigepräferenz.
- Die Foto-Vollbildansicht bleibt separat mit Zoom-/Pan-Funktion nutzbar.
- CSS schützt Seitenbereiche und Scanner vor horizontalem Überlauf; Buttons umbrechen auf schmalen Displays.
- Version 1.9.2 ist in App, Updateprüfung und Offline-Cache konsistent.

## Hinweise
- Das Sperren von Seitenzoom kann die Barrierefreiheit einschränken. Deshalb gibt es unter Einstellungen die Möglichkeit zum Wiedereinschalten.
- Bei bereits vergrößerter Safari-Webapp: **Ansicht einpassen** verwenden; falls Safari die Skalierung nicht sofort zurücksetzt, Webapp vollständig schließen und neu öffnen.
- Weder neue OCR-Funktionen noch externe Dienste wurden hinzugefügt. Die automatische Texterkennung auf iPhone-Safari ist weiterhin eingeschränkt.
- Der verschlüsselte Tresor und alle bestehenden Gesundheitsmodule bleiben unverändert. Das Update löscht keine Nutzerdaten.
- iPhone-Safari in dieser Umgebung nicht verfügbar; Layout und Interaktionen wurden isoliert mit Chromium-Mobilansichten getestet. Ergebnis: PRUEFBERICHT_1.9.2.md.
