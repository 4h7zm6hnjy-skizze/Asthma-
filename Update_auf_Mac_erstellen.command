#!/bin/bash
cd "$(dirname "$0")" || exit 1
if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 fehlt. Installiere Python 3, oder übergib die ZIP an ChatGPT."
  read -r -p 'Weiter mit Enter …'
  exit 1
fi
python3 erstelle_update.py --output "$HOME/Downloads"
status=$?
echo
echo 'Ergebnis und Hinweise stehen oben.'
read -r -p 'Zum Schließen Enter drücken …'
exit "$status"
