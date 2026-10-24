#!/usr/bin/env python3
# coding: utf-8
"""Asthma 3.1.8: intensive static audit and safe app update.

Run in a *clean* clone/Codespace of the original GitHub repository.
Does not inspect, export or change any user health records, vaults or uploaded medical JSON.
"""
from pathlib import Path
from html.parser import HTMLParser
import json,re,subprocess,sys,shutil,tempfile

ROOT=Path.cwd(); TARGET='3.1.8'
NEEDED=['app.js','index.html','secure17.js','sw.js','version.json','offline303.js','laborvergleich303.js','hub20.js','vital29.js','stats25.js','statsprint296.js','labor18.js']
CHANGED=['app.js','index.html','secure17.js','sw.js','version.json','offline303.js']

class HtmlIds(HTMLParser):
    def __init__(self):super().__init__();self.ids=[]
    def handle_starttag(self,tag,attrs):
        for k,v in attrs:
            if k=='id':self.ids.append(v)

def command(*a):
    r=subprocess.run(a,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,cwd=ROOT)
    if r.returncode:raise RuntimeError('Befehl fehlgeschlagen: '+' '.join(a)+'\n'+(r.stderr or r.stdout)[-1300:])
    return r.stdout

def replace1(s,a,b,where):
    n=s.count(a)
    if n!=1:raise RuntimeError(f'Falscher Dateistand in {where}: {a[:50]!r} wurde {n}x gefunden. Sicherer Abbruch.')
    return s.replace(a,b,1)

def prepare():
    for f in NEEDED:
        if not (ROOT/f).is_file():raise RuntimeError(f'{f} fehlt. Das Skript im Projekt-Hauptordner von Asthma- ausführen.')
    src={f:(ROOT/f).read_text(encoding='utf-8') for f in NEEDED}
    live=json.loads(src['version.json']).get('version')
    if live==TARGET and f"const VERSION = '{TARGET}';" in src['app.js']:
        return None,src
    if live!='3.1.7':raise RuntimeError('Erwartet Version 3.1.7, gefunden '+str(live)+'. Keine Änderung.')
    if 'ASTHMA_HEADER_SEARCH317' not in src['laborvergleich303.js']:
        raise RuntimeError('Erweiterung 3.1.7 fehlt. Bitte vor dem Update erst den vorhandenen Stand prüfen.')
    app=replace1(src['app.js'],"const VERSION = '3.0.5';",f"const VERSION = '{TARGET}';",'app.js')
    app=replace1(app,"""      const release=await serverRelease();
      out.textContent='Lade App-Dateien für Version '+release.version+' …';""", """      const release=await serverRelease();
      const comparison=compareVersions(release.version,VERSION);
      if(comparison===null)throw Error('Die Serverversion ist ungültig.');
      if(comparison<=0){
        out.textContent='Version '+VERSION+' ist bereits installiert. Kein weiterer Neustart nötig.';
        button.disabled=false;button.textContent='Update installieren';installingUpdate=false;
        return;
      }
      out.textContent='Lade App-Dateien für Version '+release.version+' …';""",'app.js: Neustart-Prüfung')
    app=replace1(app,"out.textContent='Update geladen. Die App wird neu geöffnet …';","out.textContent='App wird aktualisiert. Bitte nach dem Neustart die Versionsanzeige prüfen.';",'app.js: Rückmeldung')
    html=src['index.html'];occ=html.count('3.0.5')
    if not 6<=occ<=30:raise RuntimeError(f'index.html: unerwartete Zahl alter Versionskennungen ({occ})')
    html=html.replace('3.0.5',TARGET)
    sec=replace1(src['secure17.js'],"s.src='./'+src+'?v=3.0.5'",f"s.src='./'+src+'?v={TARGET}'",'secure17.js')
    sw=replace1(src['sw.js'],"const VERSION='3.1.7-header-search';",f"const VERSION='{TARGET}-consistent-cache';",'sw.js')
    sw=sw.replace('/* Asthma 3.1.7:',f'/* Asthma {TARGET}:',1)
    off=src['offline303.js']
    old="""   const versions=await caches.keys();if(!versions.includes('asthma-static-3.0.4-audit-offline')){p.textContent='Der neue Offline-Cache ist noch nicht aktiv. App online neu öffnen und erneut prüfen.';return;}
   const appCache=await caches.open('asthma-static-3.0.4-audit-offline');"""
    new="""   // Den Cache der aktuell laufenden App suchen, nicht einen historischen Versionsnamen.
   const versions=await caches.keys();
   const current=String(window.ASTHMA_APP_VERSION||'').trim();
   const active=versions.filter(v=>current&&v.startsWith('asthma-static-'+current+'-'));
   if(!active.length){p.textContent='Für die laufende Version '+(current||'(unbekannt)')+' ist noch kein passender Offline-Cache aktiv. App online aktualisieren und erneut prüfen.';return;}
   const appCache=await caches.open(active[active.length-1]);"""
    off=replace1(off,old,new,'offline303.js: Offline-Cache')
    release=json.loads(src['version.json']);release.update(version=TARGET,released='2026-10-24',notes='Intensivprüfung: Haupt-App, Startdateien, Tresor-Skriptlader und Offline-Cache synchronisiert. Wiederholtes Neustarten bei aktueller Version behoben; Offline-Prüfung verwendet aktive Version. Keine Gesundheitsdaten geändert.')
    return {'app.js':app,'index.html':html,'secure17.js':sec,'sw.js':sw,'offline303.js':off,'version.json':json.dumps(release,ensure_ascii=False,indent=2)+'\n'},src

def inspect(edits,src):
    candidate=dict(src);candidate.update(edits)
    for f in sorted(ROOT.glob('*.js')):
        content=candidate.get(f.name)
        if content is None:content=f.read_text(encoding='utf-8')
        with tempfile.NamedTemporaryFile('w',suffix='.js',encoding='utf-8',delete=False) as temp:
            temp.write(content);temp_path=Path(temp.name)
        try:
            r=subprocess.run(['node','--check',str(temp_path)],capture_output=True,text=True)
            if r.returncode:raise RuntimeError(f'JavaScript-Syntaxfehler in {f.name}: '+r.stderr[-650:])
        finally:temp_path.unlink(missing_ok=True)
    parser=HtmlIds();parser.feed(candidate['index.html'])
    if len(parser.ids)!=len(set(parser.ids)):raise RuntimeError('Doppelte HTML-IDs: '+', '.join(sorted({i for i in parser.ids if parser.ids.count(i)>1})[:10]))
    rootfiles={f.name for f in ROOT.iterdir() if f.is_file()}
    precache=candidate['sw.js'].split('const ASSETS=[',1)[1].split('];',1)[0]
    assets=[x.removeprefix('./') for x in re.findall(r"'([^']+)'",precache) if x.removeprefix('./')]
    missing=[x for x in assets if x not in rootfiles]
    if missing:raise RuntimeError('Fehlende Service-Worker-Dateien: '+', '.join(missing))
    imports=candidate['secure17.js'].split('const scripts=[',1)[1].split('];',1)[0]
    scripts=re.findall(r"'([^']+)'",imports)
    absent=[x for x in scripts if x not in rootfiles]
    if absent:raise RuntimeError('Fehlende Skriptmodule: '+', '.join(absent))
    if f"const VERSION = '{TARGET}'" not in candidate['app.js']:raise RuntimeError('Hauptversion stimmt nicht')
    if f"?v={TARGET}" not in candidate['secure17.js']:raise RuntimeError('Skript-Cachekennung stimmt nicht')
    if json.loads(candidate['version.json'])['version']!=TARGET:raise RuntimeError('Serverversion stimmt nicht')
    if 'ASTHMA_HEADER_SEARCH317' not in candidate['laborvergleich303.js']:raise RuntimeError('Header-Suche fehlt')
    if 'asthma-static-3.0.4-audit-offline' in candidate['offline303.js']:raise RuntimeError('Veralteter Cache-Fix fehlt')
    if 'if(comparison<=0)' not in candidate['app.js']:raise RuntimeError('Endlos-Neustart-Schutz fehlt')
    if 'AES-GCM' not in candidate['secure17.js'] or 'PBKDF2' not in candidate['secure17.js']:raise RuntimeError('Tresor-Verschlüsselungsmodul unerwartet')
    print(f'BESTANDEN: {len(list(ROOT.glob("*.js")))} JavaScript-Syntaxprüfungen, {len(parser.ids)} eindeutige HTML-IDs, {len(assets)} Cache-Dateien und {len(scripts)} App-Module.')
    return len(assets),len(scripts)

def report(assetcount,scriptcount):
    # No personal JSON data is read; only public filenames are reported.
    return f"""# Asthma-Webapp – Intensivprüfung 3.1.8

Stand: 24.10.2026. Automatisierte statische Prüfungen, keine Live-iPhone-Garantie.

## Belegte reparierte Fehler
- Serverversion und Hauptprogrammversion waren verschieden (3.1.7 / 3.0.5).
- Skriptlader und HTML nutzten alte Cache-Kennungen.
- Der Installationsknopf konnte bei gleicher Version weiterhin neu starten.
- Die Offline-Diagnose suchte starr Cache 3.0.4.

## Prüfumfang
- Syntax aller lokalen JavaScript-Dateien (Node.js).
- Doppelte statische HTML-IDs.
- Vorhandensein von {assetcount} Offline-Cache-Dateien und {scriptcount} geladenen App-Modulen.
- Erhalt des vorhandenen AES-GCM-/PBKDF2-Tresors im Code.
- Vorhandensein der Suche / Navigation aus Version 3.1.7.
- Es werden keine medizinischen Daten geladen, migriert, gelöscht oder veröffentlicht.

## Kritischer offener Datenschutzpunkt
Das GitHub-Repository ist öffentlich; Datenimporte mit Namen wie
`PhysioSport_und_Lungenfunktion_23-10-2026.json` und
`WorksManager_Treppen_13_Eintraege_PRIVAT.json` sind im Projekt vorhanden.
**Die Dateien sollten nicht öffentlich verfügbar sein.** Repo privat stellen und
betroffene Dateien auch aus der Git-Historie entfernen; das erfordert eine gesonderte,
mit dem Eigentümer abgestimmte Aktion.

## Grenzen
Kein vollständiger medizinischer Funktionstest mit realen Patientendaten; kein echter
Apple-iPhone-Test von Safari, verschlüsselten Backup-Rückspielen oder PDF-Druck.
Nicht bestätigte Funktionen werden nicht als fehlerfrei bezeichnet.
"""

def main():
    if not (ROOT/'.git').exists():raise RuntimeError('Bitte im Hauptverzeichnis eines GitHub Codespace von Asthma- ausführen.')
    if not shutil.which('node'):raise RuntimeError('Node.js fehlt. Keine Änderungen.')
    if command('git','status','--porcelain','--untracked-files=no').strip():raise RuntimeError('Nicht gespeicherte Änderungen gefunden. Zuerst committen, keine Dateien verändert.')
    command('git','fetch','origin','main')
    command('git','merge','--ff-only','origin/main')
    edits,original=prepare()
    if edits is None:
        print('Update 3.1.8 ist bereits in der Hauptdatei vorhanden. Keine doppelten Änderungen.')
        return
    assetcount,scriptcount=inspect(edits,original)
    old={p:(ROOT/p).read_text(encoding='utf-8') for p in CHANGED}
    try:
        for p,new in edits.items():(ROOT/p).write_text(new,encoding='utf-8')
        reportname='PRUEFBERICHT_3_1_8.md'
        (ROOT/reportname).write_text(report(assetcount,scriptcount),encoding='utf-8')
        command('git','add','--',*CHANGED,reportname)
        command('git','diff','--cached','--check')
        command('git','commit','-m','Asthma 3.1.8: Intensivpruefung und Updatesystem reparieren')
        command('git','push','origin','HEAD:main')
    except Exception:
        # Never report success if the commit or push failed.
        print('Keine bestätigte GitHub-Veröffentlichung. Bitte die Fehlermeldung ansehen.')
        raise
    print('ERFOLG: Version 3.1.8 veröffentlicht; Prüfbericht im Repository gespeichert.')
    print('Jetzt dieselbe iPhone-App öffnen und einmal „Update installieren“ wählen. Nicht deinstallieren.')

if __name__=='__main__':
    try:main()
    except Exception as e:print('ABBRUCH:',e);sys.exit(1)
