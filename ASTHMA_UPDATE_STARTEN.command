#!/bin/bash
cd "$(dirname "$0")" || exit 1
printf '\nASTHMA UPDATE 3.0.3\n\n'
python3 update_asthma.py
status=$?
echo ''
if [ "$status" -eq 0 ]; then
  echo 'Erfolgreich abgeschlossen. Auf dem iPhone: Asthma-App öffnen und "Update suchen" antippen.'
else
  echo 'Bitte die Fehlermeldung oben beachten. Bestehende lokale Gesundheitsdaten wurden nicht verändert.'
fi
echo ''
read -r -p 'Zum Schliessen Enter druecken ...' _
exit "$status"
