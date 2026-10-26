#!/usr/bin/env python3
"""Apply safe Asthma 3.2.0 code-only changes to a checked out Asthma- repo.
Does not touch or access any patient's browser IndexedDB data.
"""
from __future__ import annotations
import json, pathlib, sys, shutil

ROOT = pathlib.Path(sys.argv[1]).expanduser().resolve() if len(sys.argv) > 1 else None
HERE = pathlib.Path(__file__).resolve().parent
NEW = '3.2.0'
FILES = ('index.html', 'secure17.js', 'app.js', 'sw.js', 'version.json')
OUT = HERE / 'FERTIG_ZUM_HOCHLADEN'


def check(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def once(text: str, find: str, replace: str, label: str) -> str:
    occurrences = text.count(find)
    check(occurrences == 1, f'{label}: erwartet 1 Fundstelle, gefunden {occurrences}. Kein Update ausgeführt.')
    return text.replace(find, replace, 1)


def prepare(root: pathlib.Path) -> dict[str, bytes]:
    check(root and root.is_dir(), 'Der angegebene Repository-Ordner existiert nicht.')
    for fn in FILES:
        check((root / fn).is_file(), f'{fn} fehlt im GitHub-Projektordner.')
    original = {f: (root/f).read_text(encoding='utf-8') for f in FILES}
    current = json.loads(original['version.json']).get('version', '')
    check(current in ('3.1.8','3.2.0'), f'Diese Aktualisierung ist nur für die geprüfte Version 3.1.8 gedacht, gefunden: {current}. Bitte nicht blind überschreiben.')
    if current == NEW:
        check((root / 'ampel320.js').exists() and (root / 'ampel320.css').exists(), '3.2.0 ist gemeldet, aber die Ampel-Dateien fehlen.')
        print('Version 3.2.0 liegt im ausgewählten Projekt bereits vor.')
        return {f: (root/f).read_bytes() for f in (*FILES,'ampel320.js','ampel320.css')}

    html = original['index.html']
    html = once(html, '<link rel="stylesheet" href="./statsplus292.css"/>',
        '<link rel="stylesheet" href="./statsplus292.css"/>\n<link rel="stylesheet" href="./ampel320.css?v=3.2.0"/>', 'Stylesheet')
    check('3.1.8' in html, 'Version im HTML nicht gefunden.')
    html = html.replace('3.1.8', NEW)

    secure = original['secure17.js']
    secure = once(secure, "'offline303.js','hub20.js'", "'offline303.js','ampel320.js','hub20.js'", 'Tresor-Skriptlader')
    secure = once(secure, "'calendar','labs','epef'].includes(group)", "'calendar','labs','epef','ampel'].includes(group)", 'Erlaubte Sicherungsgruppen')
    check('diary|suite|calendar|labs|epef|au' in secure, 'Backup-Prüfungen in der bekannten Struktur fehlen.')
    # Same whitelist is used in validation and restore. Changing it adds a new
    # allowed group without changing existing validation, encryption or schema.
    secure = secure.replace('diary|suite|calendar|labs|epef|au', 'diary|suite|calendar|labs|epef|au|ampel')
    check(secure.count('au|ampel') >= 2, 'Backup- und Wiederherstellungsprüfungen wurden nicht beide angepasst.')
    secure = secure.replace('?v=3.1.8', '?v=3.2.0')
    check("'ampel320.js'" in secure, 'Skriptlader konnte nicht erweitert werden.')

    app = once(original['app.js'], "const VERSION = '3.1.8';", "const VERSION = '3.2.0';", 'App-Versionsnummer')

    sw = original['sw.js']
    sw = once(sw, "3.1.8-consistent-cache", "3.2.0-asthma-ampel", 'Offline-Cache-Version')
    sw = once(sw, "'./labor18.js','./laborvergleich303.js','./offline303.js','./hub20.js'",
        "'./labor18.js','./laborvergleich303.js','./offline303.js','./ampel320.js','./ampel320.css','./hub20.js'", 'Offline-Dateiliste')
    sw = once(sw, "'/laborvergleich303.js','/offline303.js','/befundscan.js'",
        "'/laborvergleich303.js','/offline303.js','/ampel320.js','/ampel320.css','/befundscan.js'", 'Offline-Update-Prüfung')

    version = json.dumps({
        'version':'3.2.0','released':'2026-10-26',
        'notes':'Asthma-Tagesampel mit 5 Lungenstufen, 16 vorgegebenen und eigenen Notizen, Symptomen, weiteren Tagesmessungen und getrennter Statistik für Tag/Woche/Monat/Jahr/10 Jahre. Verschlüsseltes Tagebuch und Sicherungen erweitert; vorhandene Daten unverändert.'
    },ensure_ascii=False,indent=2)+'\n'
    result={'index.html':html,'secure17.js':secure,'app.js':app,'sw.js':sw,
            'version.json':version,'ampel320.js':(HERE/'ampel320.js').read_text(encoding='utf-8'),
            'ampel320.css':(HERE/'ampel320.css').read_text(encoding='utf-8')}
    # Validate all anchors before writing ANY file.
    check('ampel320.js' in result['sw.js'] and 'ampel320.css' in result['index.html'], 'Dateiverknüpfung unvollständig.')
    check('ampel' in result['secure17.js'] and '3.2.0' in result['app.js'], 'Tresor oder Version nicht korrekt.')
    return {k:v.encode('utf-8') for k,v in result.items()}


def main() -> None:
    if ROOT is None:
        raise ValueError('Bitte Projektordner als Argument angeben.')
    contents=prepare(ROOT)
    OUT.mkdir(exist_ok=True)
    for filename,data in contents.items():
        target=OUT/filename
        target.write_bytes(data)
    # Save a private *code-only* copy of replaced program files outside repo.
    backup = ROOT.parent / ('Asthma_Code_Backup_vor_3_2_0')
    backup.mkdir(exist_ok=True)
    for fn in FILES:
        target=backup/fn
        if not target.exists():
            shutil.copy2(ROOT/fn,target)
    for filename,data in contents.items():
        target=ROOT/filename
        target.write_bytes(data)
    print('\nERFOLG: Die folgenden sieben App-Dateien sind fertig:')
    for f in contents: print('  '+f)
    print('Die Dateien liegen ebenfalls hier: '+str(OUT))
    print('Sicherung der bisherigen Programmdateien: '+str(backup))
    print('Persönliche Gesundheitsdaten wurden NICHT angefasst.\n')

if __name__=='__main__':
    try: main()
    except Exception as exc:
        print('\nUPDATE ABGEBROCHEN: '+str(exc),file=sys.stderr)
        sys.exit(1)
