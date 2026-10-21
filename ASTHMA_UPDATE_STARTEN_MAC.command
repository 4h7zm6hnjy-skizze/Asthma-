#!/bin/bash
# Asthma 2.9.0 – Mac-Helfer: aktuelles GitHub-Projekt lesen, nur geaenderte Dateien zusammenstellen.
set -euo pipefail
cd "$(dirname "$0")"
echo 'ASTHMA 2.9.0 – Download des bestehenden Projektstands'
if ! command -v python3 >/dev/null 2>&1; then
  echo 'Python 3 ist erforderlich (z. B. Xcode Command Line Tools). Keine Installation durch dieses Skript.'
  read -r -p 'Enter zum Beenden ...' _
  exit 1
fi
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
if ! curl --fail --location --silent --show-error 'https://github.com/4h7zm6hnjy-skizze/Asthma-/archive/refs/heads/main.zip' -o "$TMP/repo.zip"; then
  echo 'Das GitHub-Projekt konnte nicht heruntergeladen werden. Kein Update wurde erzeugt.'
  read -r -p 'Enter zum Beenden ...' _
  exit 1
fi
unzip -q "$TMP/repo.zip" -d "$TMP"
PROJECT=$(find "$TMP" -maxdepth 2 -type f -name 'secure17.js' -print -quit)
if [ -z "$PROJECT" ]; then
  echo 'Asthma-Projekt konnte nicht erkannt werden.'
  read -r -p 'Enter zum Beenden ...' _
  exit 1
fi
PROJECT=$(dirname "$PROJECT")
if ! python3 apply_update.py "$PROJECT"; then
  echo 'Update nicht erstellt. Der aktuelle GitHub-Code weicht möglicherweise von der geprüften Version ab.'
  read -r -p 'Enter zum Beenden ...' _
  exit 1
fi
printf '\nFERTIG. Die hochzuladenden Dateien liegen im Ordner:\n%s\n' "$(pwd)/Asthma_2.9.0_Zum_Hochladen"
open "$(pwd)/Asthma_2.9.0_Zum_Hochladen"
read -r -p 'Enter zum Beenden ...' _
