#!/usr/bin/env python3
"""Create an installable full Asthma 2.7.0 GitHub upload ZIP from the existing 2.6.0 sources.

Run without arguments to download a PUBLIC source archive, or pass a local extracted
repository directory or zip. Does not read or write private browser health records.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

VERSION='2.7.0'
REPO='4h7zm6hnjy-skizze/Asthma-'
ASSETS=Path(__file__).resolve().parent/'assets'
DEFAULT_URL='https://codeload.github.com/4h7zm6hnjy-skizze/Asthma-/zip/refs/heads/main'

class BuildError(Exception):
    pass

def need_once(text: str, old: str, new: str, where: str) -> str:
    n=text.count(old)
    if n!=1:
        raise BuildError(f'{where}: genau eine Fundstelle erwartet, gefunden: {n}: {old[:85]}')
    return text.replace(old,new,1)

def source_files(input_path: str | None, workspace: Path) -> Path:
    if input_path:
        given=Path(input_path).expanduser().resolve()
        if given.is_dir():
            return given
        if not given.is_file() or given.suffix.lower()!='.zip':
            raise BuildError('Eingabe muss ein Repository-Ordner oder eine vollständige Quell-ZIP sein.')
        archive=given
    else:
        archive=workspace/'Asthma_GitHub_main.zip'
        print('Lade öffentlichen GitHub-Quellstand herunter (keine Gesundheitsdaten) …')
        try:
            req=urllib.request.Request(DEFAULT_URL,headers={'User-Agent':'Asthma-2.7.0-Update-Builder'})
            with urllib.request.urlopen(req,timeout=40) as response,archive.open('wb') as out:
                shutil.copyfileobj(response,out)
        except Exception as exc:
            raise BuildError(f'GitHub-Download fehlgeschlagen: {exc}. Alternativ die GitHub-ZIP übergeben.') from exc
    root=workspace/'quellen'
    root.mkdir(exist_ok=True)
    try:
        with zipfile.ZipFile(archive) as z:
            for info in z.infolist():
                path=Path(info.filename)
                if path.is_absolute() or '..' in path.parts:
                    raise BuildError('Quell-ZIP enthält einen ungültigen Pfad.')
                if info.is_dir():continue
                dest=root/path
                dest.parent.mkdir(parents=True,exist_ok=True)
                with z.open(info) as inp,dest.open('wb') as out:
                    shutil.copyfileobj(inp,out)
    except zipfile.BadZipFile as exc:
        raise BuildError('Die Quell-ZIP kann nicht gelesen werden.') from exc
    matches=list(root.rglob('index.html'))
    candidates=[p.parent for p in matches if (p.parent/'secure17.js').exists()]
    if len(candidates)!=1:
        raise BuildError(f'Erwarte genau einen Hauptordner mit index.html und secure17.js (gefunden: {len(candidates)}).')
    return candidates[0]

def patch_project(root: Path)-> dict:
    def get(path):
        file=root/path
        if not file.is_file():raise BuildError(f'Erforderliche Datei fehlt: {path}')
        return file.read_text(encoding='utf-8')
    def put(path,text):
        (root/path).write_text(text,encoding='utf-8')
    meta=json.loads(get('version.json'))
    if meta.get('version')!='2.6.0':
        raise BuildError(f'Dieses Paket erwartet Asthma 2.6.0, gefunden: {meta.get("version")}. Nichts verändert.')

    index=get('index.html')
    index=need_once(index,
      '<section class="epef-panel" id="epef-panel" aria-labelledby="epef-title">',
      '</section>\n<section class="panel new-page peakflow-page" data-nav-page="peakflow" id="peakflow">'+
      '<div class="section-heading"><div><p class="section-kicker">Peak-Flow / ePEF</p><h2>Peak-Flow-Tagebuch</h2>'+
      '<p>Persönliche Peak-Flow-Werte und Gerätemessungen, getrennt von ärztlichen Spirometrie-Untersuchungen.</p>'+
      '</div></div>\n<section class="epef-panel" id="epef-panel" aria-labelledby="epef-title">',
      'index.html ePEF-Container')
    # The two end tags immediately before 'befunde' now close ePEF and its new page;
    # the 'lungenwerte' section is already closed before the new page.
    marker='</section>\n</section><section class="panel new-page" data-nav-page="befunde"'
    if index.count(marker)!=1:
        raise BuildError('Seitenabschluss nach Peak-Flow nicht in der erwarteten Struktur.')
    index=need_once(index,
      '<button class="nav-item" data-goto="lungenwerte" type="button">Lungenwerte</button>',
      '<button class="nav-item" data-goto="lungenwerte" type="button">Lungenfunktion</button>'+
      '<button class="nav-item" data-goto="peakflow" type="button">Peak-Flow</button>',
      'index.html Hauptnavigation')
    index=need_once(index,
      '<a class="btn btn-outline" href="#epef-panel">Peak-Flow-Tagebuch</a>',
      '<button class="btn btn-outline" data-goto="peakflow" type="button">Peak-Flow-Tagebuch</button>',
      'index.html Lungen-Seite')
    index=need_once(index,
      '<button data-goto="lungenwerte"><span>◷</span><strong>Lungenwerte</strong><small>Messungen und Verlauf</small></button>',
      '<button data-goto="lungenwerte"><span>◷</span><strong>Lungenfunktion</strong><small>Ärztliche FEV₁- und FVC-Untersuchungen</small></button>'+
      '<button data-goto="peakflow"><span>∿</span><strong>Peak-Flow</strong><small>ePEF-Tagebuch, Import, Verlauf</small></button>',
      'index.html Schnellstarter')
    index=need_once(index,'<link rel="stylesheet" href="./design26.css"/>',
      '<link rel="stylesheet" href="./design26.css"/>\n<link rel="stylesheet" href="./professional27.css"/>',
      'index.html Professional Stylesheet')
    index=index.replace('2.6.0','2.7.0')
    put('index.html',index)

    suite=get('suite15.js')
    suite=need_once(suite,"'kalender','lungenwerte','befunde'","'kalender','lungenwerte','peakflow','befunde'",'suite15.js Seitenrouter')
    put('suite15.js',suite)

    design=get('design26.js')
    design=need_once(design,"'Peak-Flow','lungenwerte','ePEF-Tagebuch'","'Peak-Flow','peakflow','ePEF-Tagebuch'",'design26.js Schnellwahl')
    design=need_once(design,"version:'2.6.0'","version:'2.7.0'",'design26.js Testversionshinweis')
    put('design26.js',design)

    secure=get('secure17.js')
    secure=need_once(secure,"'hilfsmittel251.js','design26.js'","'hilfsmittel251.js','design26.js','professional27.js'",'secure17.js verschlüsselter Appstart')
    put('secure17.js',secure)

    app=get('app.js')
    app=need_once(app,"const VERSION = '2.6.0';","const VERSION = '2.7.0';",'app.js Version')
    put('app.js',app)
    worker=get('sw.js')
    worker=need_once(worker,"const VERSION='2.6.0'","const VERSION='2.7.0'",'sw.js Versionscache')
    worker=need_once(worker,'"./logo-512.png"]','"./logo-512.png","./professional27.js","./professional27.css"]','sw.js Offlinedateien')
    put('sw.js',worker)

    for file in ASSETS.iterdir():
        if file.is_file():shutil.copy2(file,root/file.name)
    meta.update(version=VERSION,released='2026-10-16',notes='Peak-Flow und Spirometrie auf eigenen Seiten; privates Patientenprofil, Arzt-Aktionsplan, lokale Messübersicht und Navigation. Bestehende verschlüsselte Gesundheitsdaten bleiben unverändert.')
    put('version.json',json.dumps(meta,ensure_ascii=False,indent=2)+'\n')

    readme='''# Asthma 2.7.0 Professional\n\n**Neue Ansichten:** Peak-Flow und Lungenfunktion führen zu unterschiedlichen Seiten. Die ePEF-Aufzeichnungen bleiben im bestehenden verschlüsselten Speicher, genau wie Spirometrie, Labor, Medikamente, AU und Dokumente.\n\n**Persönliches Profil:** Unter „Mein Profil“ können Name, Anschrift, Geburtsdatum, Gewicht, optional behandelnde Praxis und Notfallkontakt sowie ein ausschließlich ärztlich festgelegter Asthma-Aktionsplan gespeichert werden. Diese Werte sind NICHT in den öffentlichen Quellcode aufgenommen. Jeder Benutzer muss sie erst nach dem Entsperren auf seinem Gerät eintragen.\n\n**Schnellübersicht:** 30-Tage-Zähler für Peak-Flow und Tagebucheinträge sowie Gesamtzahl der gespeicherten Lungenuntersuchungen (keine medizinische Bewertung).\n\n**Datenschutz:** Keine neuen externen Tracker oder Netzwerkdienste durch das Professional-Modul; keine geänderten Verschlüsselungsfunktionen, keine automatisch übermittelten Gesundheitsdaten. Persönliche Daten stehen im bestehenden verschlüsselten Profil. Unverschlüsselte PDF-/CSV-Exporte weiterhin vertraulich behandeln.\n\n**Vor dem Update:** Im bisherigen iPhone/Safari-Kontext eine vollständige `.asthma17`-Datensicherung erstellen und extern sicher aufbewahren. Den alten Homescreen-Eintrag NICHT löschen und KEINE Website-Daten löschen. Nach vollständigem GitHub-Upload Updateprüfung starten und die App im selben Browser-Kontext öffnen.\n\n**Grenzen:** Der Builder prüft Dateistruktur und JavaScript-Syntax, aber nicht alle Funktionen auf einem echten iPhone. Scanner/OCR, IndexedDB-Backup/Wiederherstellung und Safari-Offlinestatus sind weiterhin praktisch zu testen. Dieses Update enthält keinen automatischen klinischen Risikowert. Die zehn weitergehenden Verbesserungsziele aus der Roadmap bleiben teilweise offen; siehe PRUEFBERICHT_2.7.0.md.\n\n'''
    put('README_2.7.0.md',readme)
    oldreadme=get('README.md')
    put('README.md',readme+'\n---\n\n'+oldreadme)
    return meta

def verify(root:Path) -> list[str]:
    report=[]
    html=(root/'index.html').read_text(encoding='utf-8')
    script=(root/'secure17.js').read_text(encoding='utf-8')
    router=(root/'suite15.js').read_text(encoding='utf-8')
    worker=(root/'sw.js').read_text(encoding='utf-8')
    design=(root/'design26.js').read_text(encoding='utf-8')
    assert html.count('id="peakflow"')==1
    assert html.count('id="epef-panel"')==1
    assert html.index('id="peakflow"')<html.index('id="epef-panel"')
    assert 'data-nav-page="peakflow"' in html
    assert "'peakflow','befunde'" in router
    assert "'Peak-Flow','peakflow','ePEF-Tagebuch'" in design
    assert 'professional27.js' in script
    assert 'professional27.css' in html
    assert json.loads((root/'version.json').read_text(encoding='utf-8'))['version']==VERSION
    report.append('Navigationsziele, Seitenstruktur, Komponenten, Versionsangaben: statisch überprüft.')
    found=re.search(r'const ASSETS=(\[[^;]+?\]);',worker,re.S)
    if not found:raise BuildError('Offline-Dateiliste nicht gefunden.')
    assets=json.loads(found.group(1))
    missing=[p for a in assets if (p:=a.removeprefix('./')) and not (root/p).is_file()]
    if missing:raise BuildError('Folgende Cache-Dateien fehlen: '+', '.join(missing))
    report.append(f'Alle {len(assets)} Offline-Dateireferenzen im Projekt gefunden.')
    node=shutil.which('node')
    if node:
        jsfiles=list(root.glob('*.js'))
        for p in jsfiles:
            run=subprocess.run([node,'--check',str(p)],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
            if run.returncode:
                raise BuildError(f'JavaScript-Syntaxfehler in {p.name}: {run.stderr[:1000]}')
        report.append(f'node --check für {len(jsfiles)} JavaScript-Dateien bestanden.')
    else:
        report.append('node.js nicht installiert – JavaScript-Syntax der gesamten App konnte hier nicht geprüft werden.')
    report.append('Kein echter iPhone-Safari-Ende-zu-Ende-Test: NICHT als bestanden gekennzeichnet.')
    return report

def build(root:Path,destination:Path) -> Path:
    upload=destination/'Asthma_2.7.0_GitHub_DATEIEN'
    if upload.exists():shutil.rmtree(upload)
    shutil.copytree(root,upload)
    patch_project(upload)
    checks=verify(upload)
    checks+=[
      'Bestehende Datei- und Messgruppenschlüssel nicht absichtlich verändert.',
      'Bestehende medizinische Berechnungen nicht überarbeitet.',
      'Noch offen: vollständige 2.7-Roadmap mit komplexen Kalender-/Dokumenten-/Therapietests und iPhone-E2E-Verifikation.',
    ]
    note='''# Asthma 2.7.0 – Prüfbericht (automatischer Build)\n\n## Ergebnisse\n'''+''.join(f'- {line}\n' for line in checks)+'''
## Wichtige Grenzen\nDer Builder kann nicht den persönlichen, verschlüsselten Tresor auf einem echten iPhone testen und verspricht weder fehlerfreie Backup-Wiederherstellung noch vollständige Sicherheitsprüfung. Vor der Aktualisierung Backup erstellen und die alte Installation nicht löschen.\n\n## Persönliche Daten\nDie App-Version enthält KEINE voreingetragenen echten Namen, Geburtsdaten, Gewichte oder Adressen. Diese werden erst nach dem Entsperren lokal gespeichert.\n'''
    (upload/'PRUEFBERICHT_2.7.0.md').write_text(note,encoding='utf-8')
    target=destination/'Asthma_2.7.0_GitHub_UPLOAD.zip'
    if target.exists():target.unlink()
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=8) as z:
        for p in sorted(upload.rglob('*')):
            if p.is_file():z.write(p,p.relative_to(upload))
    digest=hashlib.sha256(target.read_bytes()).hexdigest()
    print('\nFERTIG: '+str(target))
    print('DATEIEN: '+str(upload))
    print('SHA256: '+digest)
    print('WICHTIG: ZIP VOLLSTÄNDIG ENTPACKEN, dann Dateien INS ROOT deines GitHub-Repositories hochladen.')
    return target

def main():
    parser=argparse.ArgumentParser(description='Asthma 2.7.0 Professional: vollständige GitHub-Upload-ZIP lokal erstellen')
    parser.add_argument('quelle',nargs='?',help='Optional: vollständiges 2.6.0-Quellverzeichnis oder Original-GitHub-ZIP')
    parser.add_argument('--output',default=str(Path.home()/'Downloads'),help='Zielordner; Standard: Downloads')
    args=parser.parse_args()
    try:
        dest=Path(args.output).expanduser().resolve();dest.mkdir(parents=True,exist_ok=True)
        with tempfile.TemporaryDirectory(prefix='asthma27_') as tmp:
            project=source_files(args.quelle,Path(tmp))
            build(project,dest)
        return 0
    except (BuildError,OSError,AssertionError,ValueError) as exc:
        print('FEHLER: '+str(exc),file=sys.stderr)
        return 1

if __name__=='__main__':sys.exit(main())
