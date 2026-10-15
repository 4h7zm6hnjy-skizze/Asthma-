# Befundscanner – Technik und medizinische Einordnung

- ATS: Standardisierte Lungenfunktions-Berichte: https://doi.org/10.1164/rccm.201710-1981ST – Messwerte, Sollwerte, FEV1, FVC und FEV1/FVC getrennt darstellen.
- ATS/ERS Spirometry Standardization 2019: https://pmc.ncbi.nlm.nih.gov/articles/PMC6794117/ – Prä- und Postbronchodilatator-Werte getrennt angeben und Qualitätsmerkmale berücksichtigen.
- ERS/ATS Interpretation 2022: https://publications.ersnet.org/content/erj/60/1/2101499 – Befundinterpretation gehört in klinischen Kontext; Werte allein liefern keine Diagnose.
- OCR-Bibliothek: https://github.com/naptha/tesseract.js – Open-Source-Projekt (Apache-2.0), per CDN mit fixierter Version 5.1.1 eingebunden.
- API/Technik: https://app.unpkg.com/tesseract.js@5.1.1/files/docs/api.md – `createWorker`, Erkennung clientseitig.

## Funktionsgrenzen

Die automatische Zuordnung ist eine Zeichen- und Tabellenheuristik. Vor allem unscharfe Fotos, falsche Spalten, mehrfache prä-/post-Messungen und ungewöhnliche Messgeräte-Layouts können zu falschen oder fehlenden Zahlen führen. Ein erkannter Wert ist **niemals** ohne Prüfung ein verlässlicher Messwert. Die App schreibt deshalb erst nach einer ausdrücklichen Bestätigung ins Profil und weist widersprüchliche gemessene Literwerte zurück.

Die OCR-Funktion benötigt beim ersten Start Netzwerkkonnektivität; die externe Bibliothek ist nicht im ZIP enthalten. Nicht getestete Aussage: iPhone-Safari-End-to-End mit echter Kamera und tatsächlicher CDN-Ausführung.
