# Asthma 2.8.1 – Nucala überall „alle 28 Tage"

Dieses gezielte Update setzt auf dem im GitHub-Repository verifizierten Stand vom 16.10.2026 auf und verändert **ausschließlich die Formulierung** der bestehenden Nucala-/Mepolizumab-Behandlung von „alle 4 Wochen“ beziehungsweise „alle vier Wochen“ auf „alle 28 Tage“. Vier Wochen entsprechen 28 Tagen. **Die ärztliche Verordnung und die tatsächlichen Injektionstermine sind maßgeblich.**

## Installation

1. **Unbedingt vorher** in der bisherigen Asthma-App ein verschlüsseltes `.asthma17`-Backup erstellen und außerhalb der App sichern.
2. ZIP entpacken. Auf GitHub im Root des bestehenden Repositorys `4h7zm6hnjy-skizze/Asthma-` per **Add file → Upload files** exakt diese **fünf** vorhandenen Dateien ersetzen: `medpref25.js`, `medplan24.js`, `suite15.js`, `stats25.js`, `sw.js`.
3. Commit changes bestätigen und die erfolgreiche GitHub-Pages-Veröffentlichung abwarten. Bestehende Home-Bildschirm-App schließen und wieder öffnen. Die App **nicht deinstallieren** und **keine Safari-Websitedaten löschen**.
4. Die bestehende App entsperren: Nur wenn ein vorhandener verschlüsselter Nucala-/Mepolizumab-Medikamenteneintrag die exakte Formulierung „alle 4 Wochen“/„alle vier Wochen“ enthält, werden diese Textteile im lokalen verschlüsselten Medikamenteneintrag zu „alle 28 Tage“ korrigiert. Alle anderen Medikamente bleiben unverändert; Wirkstärke, Dosis und Behandlungsintervall werden **nicht** verändert. Die Korrektur kann gefahrlos bei erneutem Öffnen erneut geprüft werden (idempotent).
5. Unter **Therapie → Medikamente** die Nucala-Angabe im Medikamentenplan und unter **Statistik** durch **Statistik berechnen** im Monats-/Jahresbericht prüfen. Dort sollte `Nucala 100 mg – 100 mg als Injektion; laut eigener Angabe alle 28 Tage` erscheinen, sofern genau dieser Eintrag gespeichert war.

## Betroffene Bereiche

- Medikamentenvorschlag Nucala beim erstmaligen Übernehmen: `medpref25.js`.
- Verschlüsselter vorhandener Medikamenteneintrag und Medikamentenplan zum Ausdrucken: `medplan24.js`.
- Arzneimittelübersicht, Bearbeiten-Formular und Speichern: `suite15.js`.
- Monats- und Jahresbericht (und daraus erzeugte PDF): `stats25.js`.
- Offline-Updatekennung: `sw.js`.

Der bereits installierte Nucala-28-Tage-Kalender für vier Jahre und der `.ics`-Apple-Kalenderexport werden **nicht** verändert; auch bestehende iPhone-Kalendereinträge brauchen wegen dieser **reinen Textkorrektur** nicht erneut importiert zu werden.

## Datenschutz / Grenzen

Die Korrektur erfolgt auf dem iPhone über den **bestehenden AES-GCM-Tresor**. Es werden weder persönliche Angaben noch Medikamententermine in das öffentliche GitHub-Repository geschrieben. Der Code ist auf den **exakten alten Wortlaut** und Nucala-/Mepolizumab-Einträge beschränkt; andere abweichende Beschreibungen bleiben unverändert und müssen bei Bedarf im Medikamentenformular überprüft werden. Eine echte iPhone-Ausführung und ein neuer GitHub-Upload wurden noch nicht durchgeführt.
