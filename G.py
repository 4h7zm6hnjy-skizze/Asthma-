#!/usr/bin/env python3
"""Asthma 3.0.5: korrigierte Versionsanzeige + verlässlicher iPhone-Update-Button.
Im bestehenden GitHub-Codespace im Asthma-Projekt ausführen: python3 G.py.
Keine Verarbeitung von Gesundheitsdaten, keine Änderungen der verschlüsselten Datenbank.
"""
from __future__ import annotations
import json
import pathlib
import re
import subprocess
import sys
import tempfile
import shutil

ROOT = pathlib.Path.cwd().resolve()
VERSION = '3.0.5'


def run(*args, check=True):
    p = subprocess.run(args, cwd=ROOT, capture_output=True, text=True)
    if check and p.returncode != 0:
        raise RuntimeError('Befehl fehlgeschlagen: ' + ' '.join(args) + '\n' + (p.stderr or p.stdout)[-1000:])
    return p


def change_once(text, old, new, reason):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'Sicherer Abbruch ({reason}): genau 1 Fundstelle erwartet, {count} gefunden.')
    return text.replace(old, new, 1)


def create_patch():
    required = ['app.js','index.html','secure17.js','sw.js','labor18.js','befundscan.js','version.json']
    for filename in required:
        if not (ROOT / filename).is_file():
            raise RuntimeError('Datei fehlt: ' + filename + '. Terminal im Asthma-Projekt öffnen.')
    original = {name:(ROOT / name).read_text(encoding='utf-8') for name in required}
    old_version = json.loads(original['version.json']).get('version')
    if old_version == VERSION:
        return {}
    if old_version != '3.0.4':
        raise RuntimeError('Erwartet wird 3.0.4, gefunden: ' + str(old_version) + '. Keine Dateien verändert.')
    edits = {}

    # Root cause: these legacy features overwrite the correct app version AFTER app.js has run.
    labs = original['labor18.js']
    labs = change_once(labs,
        " for(const id of ['version-chip','footer-version']){const el=$(id);if(el)el.textContent=id==='version-chip'?'v3.0.1':'3.0.1'}\n const dash=$('uebersicht')?.querySelector('.version-chip');if(dash)dash.textContent='Version 3.0.1';\n",
        " // Die Versionsnummer gehört ausschließlich zu app.js, nicht zum Labormodul.\n",
        'Labor überschreibt die App-Version')
    edits['labor18.js'] = labs

    scan = original['befundscan.js']
    scan = change_once(scan,
        " window.ASTHMA_APP_VERSION='3.0.2';\n if($('version-chip'))$('version-chip').textContent='v3.0.2';\n if($('footer-version'))$('footer-version').textContent='3.0.2';\n if($('update-status'))$('update-status').textContent='Lungenfunktions-Scanner aktualisiert: 3.0.2';\n",
        " // Der Scanner darf die globale App-Version nicht verändern.\n",
        'Befundscanner überschreibt die App-Version')
    edits['befundscan.js'] = scan

    index = original['index.html']
    index = change_once(index,'id="version-chip">v3.0.3','id="version-chip">v3.0.5','Versionsschild im HTML')
    index = change_once(index,'Installierte Version: 3.0.3','Installierte Version: 3.0.5','Update-Ausgangstext')
    index = change_once(index,
        '<button class="btn btn-outline" hidden="" id="reload-app" type="button">Neue Version laden</button>',
        '<button class="btn btn-primary" id="reload-app" type="button">Update installieren</button>',
        'Update-Installieren-Knopf')
    index = change_once(index,
        '<div class="settings-actions"><button class="btn btn-primary" id="reload-app" type="button">Update installieren</button>',
        '<p class="muted" id="update-install-hint">Mit „Update installieren“ werden nur die App-Dateien aktualisiert. Bereits gespeicherte Gesundheitsdaten bleiben lokal verschlüsselt. Offene Eingaben bitte vorher speichern.</p><div class="settings-actions"><button class="btn btn-primary" id="reload-app" type="button">Update installieren</button>',
        'Hinweis unter Update-Knopf')
    index = index.replace('3.0.4','3.0.5')
    edits['index.html'] = index

    app = original['app.js']
    app = change_once(app,"const VERSION = '3.0.4';","const VERSION = '3.0.5';",'App-Version')
    begin = app.index('  async function checkUpdate(){')
    end = app.index('  function updateConnection(){',begin)
    old = app[begin:end]
    new = r'''  // Ermittelt ausschließlich die veröffentlichte Programmversion; keine Nutzerdaten gehen ins Netz.
  async function serverRelease(){
    if(location.protocol==='file:')throw Error('Die App muss als Webseite geöffnet sein.');
    const response=await fetch('./version.json?check='+Date.now(),{cache:'no-store'});
    if(!response.ok)throw Error('Versionsdatei konnte nicht geladen werden (HTTP '+response.status+').');
    const data=await response.json();
    if(compareVersions(data.version,VERSION)===null)throw Error('Die Versionsnummer des Servers ist ungültig.');
    return data;
  }
  async function checkUpdate(){
    const button=$('check-update'),install=$('reload-app'),out=$('update-status');
    if(button.disabled)return;
    button.disabled=true;button.textContent='Prüfe…';
    install.hidden=false;install.textContent='Update installieren';
    out.textContent='Prüfe die aktuelle Version auf dem Server …';
    try{
      const data=await serverRelease(),cmp=compareVersions(data.version,VERSION);
      if(cmp>0)out.textContent='Version '+data.version+' ist verfügbar. Tippe auf „Update installieren“. '+(data.notes||'');
      else if(cmp===0)out.textContent='Version '+VERSION+' ist aktuell. Mit „Update installieren“ kannst du die App-Dateien bei Anzeigeproblemen erneut laden.';
      else out.textContent='Serverversion '+data.version+', geöffnete Version '+VERSION+'. Bitte die veröffentlichte App prüfen.';
    }catch(e){out.textContent='Updateprüfung nicht möglich: '+e.message+' Prüfe deine Internetverbindung.';}
    finally{button.disabled=false;button.textContent='Nach Updates suchen';}
  }
  let installingUpdate=false;
  async function installUpdate(){
    if(installingUpdate)return;
    const button=$('reload-app'),out=$('update-status');
    installingUpdate=true;button.disabled=true;button.textContent='Installiere …';
    try{
      const release=await serverRelease();
      out.textContent='Lade App-Dateien für Version '+release.version+' …';
      if('serviceWorker' in navigator){
        const reg=await navigator.serviceWorker.getRegistration();
        if(reg){
          await reg.update();
          const worker=reg.installing||reg.waiting;
          if(worker){
            if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});
            if(worker.state!=='activated'&&worker.state!=='redundant'){
              await Promise.race([
                new Promise(resolve=>{
                  const handler=()=>{if(worker.state==='installed'){
                    worker.postMessage({type:'SKIP_WAITING'});
                  }else if(worker.state==='activated'||worker.state==='redundant'){
                    worker.removeEventListener('statechange',handler);resolve();}};
                  worker.addEventListener('statechange',handler);handler();
                }),
                new Promise(resolve=>setTimeout(resolve,20000))
              ]);
            }
          }
        }
      }
      // A new URL forces a navigation. No IndexedDB/localStorage/health-record deletion.
      const target=new URL(location.href);
      target.searchParams.set('app_update',release.version);
      target.searchParams.set('app_refresh',String(Date.now()));
      out.textContent='Update geladen. Die App wird neu geöffnet …';
      location.replace(target.href);
    }catch(e){
      out.textContent='Update konnte nicht installiert werden: '+e.message+'. Deine Daten bleiben erhalten.';
      button.disabled=false;button.textContent='Update installieren';installingUpdate=false;
    }
  }
'''
    app=app[:begin]+new+app[end:]
    start=app.index("    $('reload-app').addEventListener('click',async()=>{")
    finish=app.index('location.reload()});',start)+len('location.reload()});')
    app=app[:start]+"    $('reload-app').addEventListener('click',installUpdate);"+app[finish:]
    edits['app.js']=app

    secure=change_once(original['secure17.js'],"s.src='./'+src+'?v=3.0.4'","s.src='./'+src+'?v=3.0.5'",'Skript-Caching')
    edits['secure17.js']=secure

    sw=change_once(original['sw.js'],"const VERSION='3.0.4-audit-offline';","const VERSION='3.0.5-update-installieren';",'Service-Worker-Version')
    sw=sw.replace('/* Asthma 3.0.4: vorgeprüfter Cache mit Offline-Fallback. */','/* Asthma 3.0.5: neuer Cache bei Updates, vorhandene medizinische Daten unangetastet. */')
    edits['sw.js']=sw

    edits['version.json']=json.dumps({
        'version':VERSION,
        'released':'2026-10-24',
        'notes':'Fehlerbehebung Versionsanzeige in Labor und Befundscanner; permanenter Button „Update installieren“ mit iPhone-kompatibler Service-Worker-Aktualisierung. Keine Änderungen an verschlüsselten Gesundheitsdaten.'
    },ensure_ascii=False,indent=2)+'\n'
    return edits


def verify(edits):
    if not edits:return
    with tempfile.TemporaryDirectory(prefix='asthma305_') as tmp:
        for name,body in edits.items():
            dest=pathlib.Path(tmp)/name
            dest.write_text(body,encoding='utf-8')
            if name.endswith('.js'):
                if not shutil.which('node'):raise RuntimeError('Node.js fehlt. Syntaxprüfung zwingend, nichts veröffentlicht.')
                p=subprocess.run(['node','--check',str(dest)],capture_output=True,text=True)
                if p.returncode:raise RuntimeError('Syntaxfehler in '+name+': '+p.stderr[:400])
    html=edits['index.html']
    if html.count('<head>')!=1 or html.count('</head>')!=1 or html.count('id="version-chip"')!=1:
        raise RuntimeError('HTML-Strukturprüfung fehlgeschlagen.')
    if 'id="reload-app"' not in html or 'hidden="" id="reload-app"' in html:
        raise RuntimeError('Update-Button fehlt oder ist versteckt.')
    if "ASTHMA_APP_VERSION='3.0.2'" in edits['befundscan.js'] or "v3.0.1':'3.0.1" in edits['labor18.js']:
        raise RuntimeError('Alte Versionsüberschreibung weiterhin vorhanden.')
    if "const VERSION = '3.0.5';" not in edits['app.js']:
        raise RuntimeError('App-Versionsprüfung fehlgeschlagen.')
    if not all(x in edits['app.js'] for x in ['installUpdate','serverRelease','location.replace(target.href)']):
        raise RuntimeError('Neue Update-Funktion fehlt.')
    json.loads(edits['version.json'])
    assets=re.findall(r"['\"](\./[^'\"]+)['\"]",edits['sw.js'].split('const ASSETS=[')[1].split('];')[0])
    missing=[x for x in assets if x!='./' and not (ROOT/x[2:]).is_file()]
    if missing:raise RuntimeError('Offline-Paket unvollständig: '+', '.join(missing[:10]))
    # Important script modules must still be in the encrypted app's normal load sequence.
    secure=edits['secure17.js']
    for m in ['app.js','labor18.js','befundscan.js','stats25.js','statsplus292.js','statsprint296.js','offline303.js']:
        if "'"+m+"'" not in secure:raise RuntimeError('Skript fehlt im Loader: '+m)
    print('PRÜFUNG OK: Syntax, Version, Update-Button, Offline-Dateien und Modul-Lader.')


def main():
    print('ASTHMA 3.0.5 – Fehlerbehebung und Update installieren')
    if not (ROOT/'.git').exists():raise RuntimeError('Bitte im GitHub-Codespace des Asthma-Projekts starten.')
    if run('git','diff','--quiet',check=False).returncode or run('git','diff','--cached','--quiet',check=False).returncode:
        raise RuntimeError('Ungespeicherte Änderungen im Codespace. Nichts verändert, bitte zuerst sichern.')
    # The Codespace may have been opened before the most recent commit.
    run('git','fetch','origin','main')
    run('git','merge','--ff-only','origin/main')
    changes=create_patch()
    if not changes:
        print('FERTIG: Asthma 3.0.5 ist schon installiert.');return
    verify(changes)
    prior={name:(ROOT/name).read_bytes() for name in changes}
    try:
        for name,body in changes.items():
            (ROOT/name).write_text(body,encoding='utf-8')
        run('git','add','--',*sorted(changes))
        run('git','diff','--cached','--check')
        run('git','commit','-m','Asthma 3.0.5: Versionsanzeige und Update installieren')
        run('git','push','origin','HEAD:main')
    except Exception:
        # Leave the Codespace available to inspect. Do not alter user medical records.
        print('Das Update wurde NICHT bestätigt. Bitte Fehlermeldung prüfen.')
        raise
    print('FERTIG: ASTHMA 3.0.5 AUF GITHUB')
    print('Auf dem iPhone: Asthma öffnen > Einstellungen > Nach Updates suchen > Neue Version laden.')
    print('Ab 3.0.5 bleibt „Update installieren“ immer sichtbar.')


if __name__=='__main__':
    try:main()
    except Exception as e:
        print('SICHERER ABBRUCH:',e)
        sys.exit(1)
