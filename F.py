#!/usr/bin/env python3
"""Asthma 3.0.4 – vorsichtige Reparatur und Prüfung des vorhandenen GitHub-Codes.
Nur Programmdateien; keine Gesundheitsdatensätze. Direkt im GitHub-Codespace ausführen.
"""
from __future__ import annotations
import json
import pathlib
import re
import subprocess
import sys
import tempfile
from datetime import date

ROOT = pathlib.Path.cwd().resolve()
VERSION = '3.0.4'
CHANGES = {}


def abort(message):
    raise RuntimeError(message)


def run(argv, *, cwd=ROOT, check=True, timeout=180):
    r = subprocess.run(argv, cwd=cwd, text=True, capture_output=True, timeout=timeout)
    if check and r.returncode:
        abort('Befehl fehlgeschlagen: '+ ' '.join(map(str,argv)) +'\n'+(r.stderr or r.stdout)[-1800:])
    return r


def replace_exact(text, old, new, label):
    n = text.count(old)
    if n != 1:
        abort(f'Sicherheitsstopp: {label} – erwartete genau 1 Fundstelle, gefunden {n}. Keine Änderungen geschrieben.')
    return text.replace(old,new,1)


def read(name):
    p=ROOT/name
    if not p.is_file():
        abort('Datei fehlt: '+name)
    return p.read_text(encoding='utf-8')


def patch():
    index=read('index.html')
    index=replace_exact(index,
        '<html lang="de">\n<script defer src="./physiosport298.js?v=2.9.8"></script><head>',
        '<html lang="de">\n<head>', 'HTML-Dokumentanfang')
    index=replace_exact(index,
        '</head <script defer src="./physiosport298.js?v=2.9.8"></script>>',
        '<script defer src="./physiosport298.js?v=3.0.4"></script>\n</head>', 'HTML-Dokumentkopf')
    index=index.replace('v=3.0.3','v=3.0.4')
    index=replace_exact(index,'id="footer-version">3.0.3','id="footer-version">3.0.4','sichtbare Versionsnummer')
    # Mehrfach vorkommende althergebrachte Versionsetiketten werden nur aktualisiert,
    # wenn genau die komplette 3.0.3-Version gemeint ist.
    index=index.replace('Version 3.0.3','Version 3.0.4')
    CHANGES['index.html']=index

    app=read('app.js')
    CHANGES['app.js']=replace_exact(app,"const VERSION = '3.0.3';","const VERSION = '3.0.4';",'App-Version')

    secure=read('secure17.js')
    # Es waren fest einprogrammierte Versionen 2.9.1–2.9.7 hinterlegt. Damit kann
    # iOS nach einem Update veraltete Programmdateien laden.
    old="s.src=({ 'vital29.js':'./vital29.js?v=2.9.1', 'design26.js':'./design26.js?v=2.9.4', 'quality28.js':'./quality28.js?v=2.9.5', 'suite15.js':'./suite15.js?v=2.9.4', 'stats25.js':'./stats25.js?v=2.9.4', 'statsprint296.js':'./statsprint296.js?v=2.9.7', 'statsplus292.js':'./statsplus292.js?v=2.9.7', 'statsprint296.js':'./statsprint296.js?v=2.9.7', 'statsplus292.js':'./statsplus292.js?v=2.9.7' })[src]||src;"
    secure=replace_exact(secure,old,"s.src='./'+src+'?v=3.0.4';",'veraltete Skriptversionen')
    CHANGES['secure17.js']=secure

    printer=read('statsprint296.js')
    # Ein SVG <text> darf ein <title> (Tooltip) enthalten. textContent enthält
    # BEIDE Texte: damit wurden im PDF auch unsichtbare Tooltips gedruckt.
    printer=replace_exact(printer,
        "ctx.fillText(el.textContent||'',get('x'),get('y'));",
        "ctx.fillText(Array.from(el.childNodes).filter(n=>n.nodeType===3).map(n=>n.nodeValue).join(''),get('x'),get('y'));",
        'PDF-Diagrammtext ohne Tooltip')
    printer=replace_exact(printer,
        " const changed=$('statsplus292-options');changed?.addEventListener('change',()=>{if(output){reset();status('Druckauswahl geändert. Bitte PDF erneut erstellen.');}});",
        " const changed=$('statsplus292-options');changed?.addEventListener('change',()=>{if(output){reset();status('Druckauswahl geändert. Bitte PDF erneut erstellen.');}});\n $('stats25-build')?.addEventListener('click',()=>{if(output){reset();status('Neue Auswertung angefordert. Bitte anschließend das PDF neu erstellen.');}});",
        'altes PDF nach Neu-Berechnung zurücksetzen')
    CHANGES['statsprint296.js']=printer

    labs=read('labor18.js')
    old="const ref=r=>{const m=str(r.reference,100).replace(/\\s/g,'').replace(/,/g,'.').match(/^(-?\\d+(?:\\.\\d+)?)[–-](-?\\d+(?:\\.\\d+)?)$/);return m&&Number(m[1])<=Number(m[2])?[Number(m[1]),Number(m[2])]:null};"
    new="const ref=r=>{const s=str(r.reference,100).replace(/\\s/g,'').replace(/,/g,'.');const m=s.match(/^(-?\\d+(?:\\.\\d+)?)[–-](-?\\d+(?:\\.\\d+)?)(?:\\/[a-zA-Zµ%][a-zA-Zµ%0-9/^.-]*)?$/);return m&&Number(m[1])<=Number(m[2])?[Number(m[1]),Number(m[2])]:null};"
    labs=replace_exact(labs,old,new,'Laborreferenz mit Einheitenangabe')
    CHANGES['labor18.js']=labs

    comparison=read('laborvergleich303.js')
    # Beim Filter "verändert" müssen Werte auch numerisch und in gleicher Einheit vorliegen.
    before="if(f==='changed'&&(!x.previous||num(r.value)===num(x.previous.value)))return false;"
    after="if(f==='changed'&&(!x.previous||num(r.value)===null||num(x.previous.value)===null||String(r.unit||'')!==String(x.previous.unit||'')||num(r.value)===num(x.previous.value)))return false;"
    comparison=replace_exact(comparison,before,after,'Laborfilter korrekt vergleichen')
    CHANGES['laborvergleich303.js']=comparison

    sw=read('sw.js')
    sw=replace_exact(sw,"const VERSION='3.0.3-offline-laborvergleich';","const VERSION='3.0.4-audit-offline';",'Offline-Cache-Version')
    sw=sw.replace('/* Asthma 3.0.2: neue Lungenfunktionsdatei und Parser bevorzugt vom Server laden. */',
                  '/* Asthma 3.0.4: vorgeprüfter Cache mit Offline-Fallback. */')
    # Aktualisierte HTML- und Script-Dateien werden beim Service-Worker-Update vorgeladen.
    # Alle alten Caches bleiben unangetastet, bis der neue Cache vollständig angelegt ist.
    CHANGES['sw.js']=sw

    offline=read('offline303.js')
    b=re.search(r'const assets=\[(.*?)\];',offline,re.S)
    if not b: abort('Offline-Checkliste fehlt')
    a=re.search(r'const ASSETS=\[(.*?)\];',sw,re.S)
    if not a: abort('Offline-Cache-Liste fehlt')
    asset_names=[n for n in re.findall(r"['\"]\./([^'\"]+)['\"]",a.group(1)) if n!='./']
    asset_names=list(dict.fromkeys(asset_names))
    offline=replace_exact(offline,b.group(0),
        'const assets='+json.dumps(asset_names,ensure_ascii=False,separators=(',',':'))+';',
        'vollständige Offline-Prüfliste')
    offline=replace_exact(offline,
        "if(!('caches' in window)||!('serviceWorker' in navigator)){p.textContent='Offline-Cache wird von diesem Browser nicht vollständig unterstützt.';return;}",
        "if(!('caches' in window)||!('serviceWorker' in navigator)){p.textContent='Offline-Cache wird von diesem Browser nicht vollständig unterstützt.';return;}\n   if(!navigator.serviceWorker.controller){p.textContent='Die App wird noch nicht vom Offline-Dienst gesteuert. Bitte einmal bei bestehender Internetverbindung neu öffnen und erneut prüfen.';return;}\n   const versions=await caches.keys();if(!versions.includes('asthma-static-3.0.4-audit-offline')){p.textContent='Der neue Offline-Cache ist noch nicht aktiv. App online neu öffnen und erneut prüfen.';return;}",
        'Offline-Check: aktiven Dienst verifizieren')
    offline=replace_exact(offline,
        "const results=await Promise.all(assets.map(async a=>({name:a,present:!!(await caches.match(new URL(a,location.href),{ignoreSearch:true}))})));",
        "const appCache=await caches.open('asthma-static-3.0.4-audit-offline');\n   const base=new URL('./',location.href);\n   const results=await Promise.all(assets.map(async a=>({name:a,present:!!(await appCache.match(new URL(a,base),{ignoreSearch:true}))})));",
        'Offline-Check: aktueller Cache statt beliebiger alter Cache')
    offline=replace_exact(offline,
        "p.textContent=missing.length?'Es fehlen '+missing.length+' Offline-Dateien: '+missing.join(', ')+'. Bitte die App online aktualisieren und erneut prüfen.':",
        "p.textContent=missing.length?'Es fehlen '+missing.length+' von '+assets.length+' Offline-Dateien: '+missing.slice(0,8).join(', ')+(missing.length>8?' und weitere.':'.')+' Bitte die App online aktualisieren und erneut prüfen.':",
        'Offline-Hinweis kurz und verständlich')
    CHANGES['offline303.js']=offline

    CHANGES['version.json']=json.dumps({
        'version':VERSION, 'released':'2026-10-23',
        'notes':'Intensivprüfung: HTML-Kopf, Skriptaktualisierung, PDF-Diagrammbeschriftung, Laborfilter, Referenzformate, vollständiger Offline-Cache-Test und statische Codeprüfung. Bestehende verschlüsselte Daten bleiben unverändert.'
    },ensure_ascii=False,indent=2)+'\n'
    return asset_names


def validate(assets):
    checks=[]
    j=json.loads(CHANGES['version.json'])
    assert j['version']==VERSION
    checks.append('Versionsdatei: 3.0.4')
    h=CHANGES['index.html']
    assert h.startswith('<!DOCTYPE html>') and '<html lang="de">\n<head>' in h
    assert h.count('src="./physiosport298.js?v=3.0.4"')==1
    assert '</head <script' not in h
    assert h.count('<head>')==1
    checks.append('HTML: Dokumentkopf gültig angeordnet, PhysioSport nur einmal')
    assert "s.src='./'+src+'?v=3.0.4'" in CHANGES['secure17.js']
    checks.append('Startskripte: einheitliche Version, keine alten Abfragen')
    assert "Array.from(el.childNodes).filter(n=>n.nodeType===3)" in CHANGES['statsprint296.js']
    checks.append('PDF: unsichtbarer SVG-Tooltip wird nicht als Beschriftung gedruckt')
    assert 'num(r.value)===null' in CHANGES['laborvergleich303.js']
    checks.append('Labor: numerisch vergleichbarer Vorwert erforderlich')
    assert 'new URL(a,base)' in CHANGES['offline303.js']
    assert "appCache.match" in CHANGES['offline303.js']
    assert 'navigator.serviceWorker.controller' in CHANGES['offline303.js']
    checks.append('Offline: alle Dateien im aktuellen Versionscache prüfen')
    # Every pre-cache asset must be part of the project. A single 404 otherwise
    # cancels addAll and makes the entire offline update fail.
    missing=[a for a in assets if not (ROOT/a).is_file()]
    if missing: abort('Service Worker würde wegen fehlender Datei scheitern: '+', '.join(missing))
    checks.append(f'Offline: {len(assets)} Dateien vorhanden und vorgemerkt')
    # Every dynamic script must be cached for genuine offline-first behavior.
    m=re.search(r'const scripts=\[(.*?)\];',CHANGES['secure17.js'],re.S)
    if not m: abort('Dynamische Skriptliste fehlt')
    loaded=re.findall(r"['\"]([\w-]+\.js)['\"]",m.group(1))
    uncached=[s for s in loaded if s not in assets]
    if uncached: abort('Offline-Cache enthält nicht alle entsperrten Module: '+', '.join(uncached))
    checks.append(f'Alle {len(loaded)} dynamischen Module offline vorgemerkt')
    # All modified JS must be parsed with Node.js, without executing sensitive data.
    if not shutil_which('node'):abort('Node.js fehlt: Sicherheitscheck kann nicht abgeschlossen werden.')
    with tempfile.TemporaryDirectory(prefix='asthma304-') as d:
        for name,content in CHANGES.items():
            if not name.endswith('.js'):continue
            p=pathlib.Path(d)/name;p.write_text(content,encoding='utf-8')
            run(['node','--check',str(p)])
    checks.append(f'{sum(n.endswith(".js") for n in CHANGES)} geänderte JavaScript-Dateien bestehen die Node-Syntaxprüfung')
    # Test PDF text-node extraction without depending on a browser.
    js="const x={childNodes:[{nodeType:3,nodeValue:'FEV1 +5'},{nodeType:1,textContent:'GEHEIMER TOOLTIP'}]};const actual=Array.from(x.childNodes).filter(n=>n.nodeType===3).map(n=>n.nodeValue).join('');if(actual!=='FEV1 +5')process.exit(1);"
    run(['node','-e',js]);checks.append('PDF-Tooltip-Regressionsfall besteht')
    lab_test=r"const p=/^(-?\d+(?:\.\d+)?)[–-](-?\d+(?:\.\d+)?)(?:\/[a-zA-Zµ%][a-zA-Zµ%0-9/^.-]*)?$/;for(const x of ['0–400/µl','0-400','0–0.4','8-35/mmol/l'])if(!p.test(x))process.exit(1);if(p.test('400')||p.test('>400'))process.exit(2);"
    run(['node','-e',lab_test]);checks.append('Labor-Referenzformate: Zahlenbereich, Dezimalpunkt, Einheiten')
    return checks


def shutil_which(name):
    from shutil import which
    return which(name)


def main():
    print('ASTHMA 3.0.4 – INTENSIVPRÜFUNG UND FEHLERKORREKTUR',flush=True)
    if not (ROOT/'.git').exists() or not (ROOT/'secure17.js').exists():
        abort('Bitte den Befehl im Asthma-GitHub-Codespace starten, nicht in einem anderen Ordner.')
    if not shutil_which('git'):abort('Git fehlt im Codespace')
    # Clean tracked state prevents accidentally mixing unrelated work into an update.
    if run(['git','diff','--quiet'],check=False).returncode or run(['git','diff','--cached','--quiet'],check=False).returncode:
        abort('Es gibt ungespeicherte Änderungen. Zur Sicherheit wurde nichts überschrieben.')
    meta=json.loads(read('version.json'))
    if meta.get('version')==VERSION:
        print('Version 3.0.4 liegt bereits im Codespace. GitHub-Speicherung wird geprüft.')
        res=run(['git','push','origin','HEAD:main'],check=False)
        if res.returncode:
            print('GitHub-Upload noch nicht möglich: '+(res.stderr or '')[-700:]);return 2
        print('FERTIG: Version 3.0.4 ist auf GitHub.');return 0
    if meta.get('version')!='3.0.3':
        abort('Erwartet war Version 3.0.3, gefunden wurde '+str(meta.get('version'))+'. Kein riskantes Überschreiben.')
    assets=patch()
    checks=validate(assets)
    # Self-contained report. Never contain private health data.
    report='ASTHMA 3.0.4 – PRÜFBERICHT\n'+date.today().isoformat()+'\n\nBEHOBENE CODEPROBLEME\n'+\
           '\n'.join('• '+s for s in [
              'Fehlerhafter HTML-Kopf und doppelte PhysioSport-Einbindung',
              'Veraltete Versions-URLs beim Laden der Programmmodule',
              'Tooltip-Text wurde im PDF-Diagramm versehentlich mit ausgegeben',
              'PDF blieb nach erneuter Statistikberechnung eventuell veraltet',
              'Laborvergleiche ohne identische Einheit wurden als Veränderung gefiltert',
              'Laborreferenz mit optionalem Einheitenzusatz wurde nicht erkannt',
              'Offline-Prüfung untersuchte nur einen Bruchteil und konnte alte Caches akzeptieren'])+\
           '\n\nBESTANDENE PRÜFUNGEN\n'+'\n'.join('OK – '+x for x in checks)+\
           '\n\nNICHT ABGEDECKT\nEchter Test auf dem iPhone inklusive verschlüsselter Datensätze, Druckdialog und Flugmodus. Diesen bitte nach Installation durchführen.\n\nDATENSCHUTZ\nNur öffentliche Programmdateien; keine Laborwerte, Passwörter oder persönlichen Befunde übertragen.\n'
    CHANGES['PRUEFBERICHT_3.0.4.txt']=report
    # Test entire existing code tree syntax BEFORE writing the changed files.
    count=0
    for p in sorted(ROOT.glob('*.js')):
        if p.name not in CHANGES:
            run(['node','--check',str(p)])
            count+=1
    print(f'OK: {count} weitere vorhandene JavaScript-Dateien ohne Syntaxfehler.',flush=True)
    for name,data in CHANGES.items():
        (ROOT/name).write_text(data,encoding='utf-8')
    changed=list(CHANGES)
    run(['git','add','--']+changed)
    run(['git','diff','--cached','--check'])
    # Report diff, keep commit small; never add personal records or other untracked files.
    d=run(['git','diff','--cached','--stat']).stdout
    print('GEPRÜFTE ÄNDERUNGEN\n'+d,flush=True)
    run(['git','commit','-m','Asthma 3.0.4: Sicherheits-, PDF-, Labor- und Offline-Reparaturen'])
    pushed=run(['git','push','origin','HEAD:main'],check=False)
    if pushed.returncode:
        print('Der Code ist im Codespace gespeichert, aber GitHub hat den Upload verweigert. '+(pushed.stderr or '')[-900:],flush=True)
        return 2
    print('FERTIG: ASTHMA 3.0.4 AUF GITHUB. Die App auf dem iPhone online neu öffnen und Update suchen.',flush=True)
    print('Prüfbericht: PRUEFBERICHT_3.0.4.txt',flush=True)
    return 0

if __name__=='__main__':
    try:sys.exit(main())
    except Exception as e:
        print('SICHERER ABBRUCH: '+str(e),flush=True)
        sys.exit(1)
