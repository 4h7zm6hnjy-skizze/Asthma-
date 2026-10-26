#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
clear || true
echo '=================================================='
echo '  ASTHMA - AMPEL UPDATE 3.2.0'
echo '=================================================='
echo '  Das Update ändert nur Programmdateien.'
echo '  Deine privaten Gesundheitsdaten bleiben auf dem iPhone.'
echo
if ! command -v python3 >/dev/null 2>&1; then
  echo 'Python 3 fehlt. Installiere Python 3 auf diesem Mac oder lade'
  echo 'die Dateien mit der manuellen Anleitung hoch.'
  read -r -p 'Eingabetaste zum Schließen ... ' _
  exit 1
fi
if ! command -v git >/dev/null 2>&1; then
  echo 'Git ist nicht installiert. Installiere die Apple Command Line Tools'
  echo 'oder nutze die Browser-Anleitung.'
  read -r -p 'Eingabetaste zum Schließen ... ' _
  exit 1
fi
WORK="$(mktemp -d "${TMPDIR:-/tmp/}asthma-3.2.0-XXXXXX")"
REPO="$WORK/Asthma-"
trap 'echo; echo "Die Dateien befinden sich unter: $WORK"' EXIT
printf '1/3: Lade den aktuellen GitHub-Programmstand ...\n'
if ! git clone --depth=1 --branch=main 'https://github.com/4h7zm6hnjy-skizze/Asthma-.git' "$REPO"; then
 echo 'GitHub nicht erreichbar. Verbindung prüfen.'
 read -r -p 'Eingabetaste zum Schließen ... ' _
 exit 1
fi
printf '2/3: Prüfe und ergänze die neue Asthma-Ampel ...\n'
python3 "$(pwd)/patch_astma.py" "$REPO"
cd "$REPO"
git add index.html secure17.js app.js sw.js version.json ampel320.js ampel320.css
if git diff --cached --quiet; then
 echo 'Im Repository sind diese Änderungen bereits vorhanden.'
else
 git -c user.name='Asthma Update' -c user.email='asthma-update@users.noreply.github.com' commit -m 'Asthma 3.2.0: Ampel, Notizen und Zehnjahres-Statistik'
fi
printf '\n3/3: Übertrage das Update nach GitHub ...\n'
if git push origin main; then
 echo; echo 'FERTIG: Das Update wurde nach GitHub übertragen.'
 echo 'Auf dem iPhone: Asthma > Einstellungen > Nach Updates suchen.'
 open 'https://github.com/4h7zm6hnjy-skizze/Asthma-' || true
else
 echo
 echo 'Das Update ist vorbereitet, aber GitHub hat den Upload blockiert.'
 echo 'Bitte im Browser https://github.com/4h7zm6hnjy-skizze/Asthma-/upload/main öffnen'
 echo 'und die sieben Dateien aus FERTIG_ZUM_HOCHLADEN hochladen.'
 open "$(dirname "$0")/FERTIG_ZUM_HOCHLADEN" || true
 open 'https://github.com/4h7zm6hnjy-skizze/Asthma-/upload/main' || true
fi
echo
read -r -p 'Eingabetaste zum Schließen ... ' _
