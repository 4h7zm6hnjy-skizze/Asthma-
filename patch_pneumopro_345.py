#!/usr/bin/env python3
"""PneumoPro 3.4.5: Umbenennung und Passwort-Hilfe, ohne Änderungen an Datenbank oder Logos.
Nur für den geprüften Stand 3.4.4. Bricht bei Abweichungen sicher ab.
"""
from pathlib import Path
import json

ROOT = Path('.')

def once(text, old, new, filename):
    hits = text.count(old)
    if hits != 1:
        raise RuntimeError(f'{filename}: erwartete Fundstelle nicht eindeutig (gefunden {hits}): {old[:75]!r}')
    return text.replace(old, new, 1)

files = ['index.html', 'secure17.js', 'suite15.js', 'styles.css', 'sw.js', 'version.json', 'app.js', 'manifest.webmanifest', 'stats25.js', 'statsprint296.js', 'navigation332.js']
before = {name: (ROOT/name).read_text(encoding='utf-8') for name in files}
if json.loads(before['version.json']).get('version') == '3.4.5':
    print('3.4.5 ist bereits installiert; keine erneute Änderung.')
    raise SystemExit(0)
if json.loads(before['version.json']).get('version') != '3.4.4':
    raise RuntimeError('Unbekannte App-Version. Update nicht angewendet; bitte zuerst vergleichen.')
changed = before.copy()

html=changed['index.html']
html=once(html, '</button></form>\n<aside class="secure-recovery-note"', '''</button></form>
<button type="button" class="btn btn-text secure-forgot-toggle" id="secure-forgot-toggle" aria-controls="secure-forgot-panel" aria-expanded="false">Passwort vergessen?</button>
<section class="secure-forgot-panel" id="secure-forgot-panel" hidden aria-label="Hilfe bei vergessenem Passwort">
<h2>Passwort vergessen – was nun?</h2>
<p>Deine Gesundheitsdaten sind auf diesem Gerät verschlüsselt. Ohne das bisherige Passwort können sie nicht direkt entschlüsselt oder durch ein neues Passwort entsperrt werden. Wir löschen oder überschreiben hier keine Daten.</p>
<p><strong>Wenn du eine vollständige verschlüsselte Sicherung (.asthma17) hast:</strong> Du kannst sie hier mit ihrem Backup-Passwort unverändernd prüfen. Zur Wiederherstellung verwende eine frische Browser-/App-Installation ohne vorhandenen Tresor. Dort kannst du auch ein neues Anmeldepasswort auswählen.</p>
<form id="secure-backup-check-form"><label for="secure-backup-check-file">Vollständige Sicherung auswählen</label><input id="secure-backup-check-file" type="file" accept=".asthma17,.json" required>
<label for="secure-backup-check-pass">Passwort der Sicherungsdatei</label><input id="secure-backup-check-pass" type="password" autocomplete="off" required><button class="btn btn-outline" type="submit" id="secure-backup-check-submit">Sicherung prüfen (nichts überschreiben)</button></form>
<p id="secure-backup-check-status" role="status" aria-live="polite"></p>
<p><strong>Keine Sicherung?</strong> Prüfe gespeicherte Passwörter auf deinem iPhone. Öffne die bisherige Safari- oder Home-Bildschirm-Installation und lösche keine App-Daten. Ohne bekanntes Passwort oder eine entschlüsselbare Sicherung ist keine Wiederherstellung möglich.</p>
</section>
<aside class="secure-recovery-note"''', 'index.html')
html=once(html, '<form class="suite-form" id="vault-form"><label>Neues Tresor-Passwort (mindestens 12 Zeichen)<input autocomplete="new-password" id="vault-pass" minlength="12" type="password"/></label><button class="btn btn-primary" id="vault-open" type="submit">Passwort ändern</button></form>',
'''<form class="suite-form" id="vault-form"><label>Aktuelles Passwort<input autocomplete="current-password" id="vault-current-pass" required type="password"/></label><label>Neues Passwort (mindestens 12 Zeichen)<input autocomplete="new-password" id="vault-pass" minlength="12" required type="password"/></label><label>Neues Passwort wiederholen<input autocomplete="new-password" id="vault-confirm" minlength="12" required type="password"/></label><button class="btn btn-primary" id="vault-open" type="submit">Passwort sicher ändern</button></form>''', 'index.html')
html=html.replace('v=3.4.4','v=3.4.5')
html=html.replace('id="version-chip">v3.3.0','id="version-chip">v3.4.5')
html=html.replace('Installierte Version: 3.3.0','Installierte Version: 3.4.5')
html=html.replace('Datenschutz in Version 3.3.0','Datenschutz in Version 3.4.5')
html=html.replace('id="footer-version">3.4.3','id="footer-version">3.4.5')
changed['index.html']=html

secure=changed['secure17.js']
secure=once(secure, '  async function changePassword(next){', '''  async function verifyCurrentPassword(pass){
    requireUnlock();
    if(typeof pass!=='string'||!pass)throw Error('Aktuelles Passwort fehlt.');
    const meta=await getMeta();
    if(!meta)throw Error('Tresor nicht gefunden.');
    const candidate=await derive(pass,un64(meta.salt));
    let verifier;
    try{verifier=await unseal(meta.verify,candidate)}catch{throw Error('Aktuelles Passwort ist falsch.');}
    if(verifier?.ok!=='asthma-v17')throw Error('Aktuelles Passwort ist falsch.');
    return true;
  }
  async function changePassword(next){''', 'secure17.js')
secure=once(secure, '  // 2.8.0: backup integrity check only. No IndexedDB transactions with write access.', '''  // Prüft eine alte Sicherung selbst im gesperrten Zustand, ohne den Tresor zu öffnen.
  // Keine Schreibtransaktion und kein automatischer Passwort-Reset.
  async function verifyRecoveryBackup(archive,pass){
    if(typeof pass!=='string'||!pass)throw Error('Backup-Passwort fehlt.');
    if(archive?.kind!=='Asthma-v17-Vault'||typeof archive.salt!=='string'||!archive.data||archive.data.id!=='archive')throw Error('Keine vollständige Asthma-Sicherung (.asthma17).');
    const backupKey=await derive(pass,un64(archive.salt));
    let data;
    try{data=await unseal(archive.data,backupKey)}catch{throw Error('Backup-Passwort falsch oder Sicherung beschädigt.');}
    if(data?.app!=='Asthma'||data?.schema!==17||!Array.isArray(data.rows)||data.rows.length>100000)throw Error('Sicherungsinhalt nicht kompatibel.');
    validateBackupRows(data.rows);
    return {count:data.rows.length};
  }
  // 2.8.0: backup integrity check only. No IndexedDB transactions with write access.''','secure17.js')
secure=once(secure,'lock,changePassword,exportVault,importVault,verifyVaultBackup','lock,changePassword,verifyCurrentPassword,exportVault,importVault,verifyVaultBackup','secure17.js')
secure=once(secure,"      $('secure-login-choice').addEventListener('click',()=>setGateMode('login',Boolean(existing)));",'''       $('secure-forgot-toggle').addEventListener('click',()=>{
         const panel=$('secure-forgot-panel');panel.hidden=!panel.hidden;
         $('secure-forgot-toggle').setAttribute('aria-expanded',String(!panel.hidden));
       });
       $('secure-backup-check-form').addEventListener('submit',async e=>{
         e.preventDefault();if(busy)return;
         const btn=$('secure-backup-check-submit'),status=$('secure-backup-check-status');
         busy=true;btn.disabled=true;status.textContent='Sicherung wird ausschließlich gelesen und geprüft …';
         try{
           const file=$('secure-backup-check-file').files?.[0];
           if(!file||file.size>80*1024*1024)throw Error('Datei fehlt oder ist größer als 80 MB.');
           let archive;try{archive=JSON.parse(await file.text())}catch{throw Error('Ungültige Datei.');}
           const check=await verifyRecoveryBackup(archive,$('secure-backup-check-pass').value);
           status.textContent='Sicherung erfolgreich geprüft ('+check.count+' Datensätze). Der Tresor dieses Geräts wurde nicht verändert. Zum Wiederherstellen eine neue Browser-/App-Installation ohne vorhandenen Tresor verwenden.';
         }catch(err){status.textContent='Sicherung nicht verifiziert: '+(err.message||err);}
         finally{busy=false;btn.disabled=false;$('secure-backup-check-pass').value='';}
       });
      $('secure-login-choice').addEventListener('click',()=>setGateMode('login',Boolean(existing)));''','secure17.js')
secure=secure.replace('?v=3.4.4','?v=3.4.5')
changed['secure17.js']=secure

suite=changed['suite15.js']
old="    $('vault-form').addEventListener('submit',async e=>{e.preventDefault();try{if(!confirm('Gesamtes Tresor-Passwort ändern? Das bisherige Passwort funktioniert anschließend nicht mehr.'))return;await SEC.changePassword($('vault-pass').value);$('vault-pass').value='';setVaultMessage();flash('vault-state','Passwort erfolgreich geändert. Alte Backups behalten ihr jeweiliges Backup-Passwort.')}catch(e){flash('vault-state','Passwortwechsel fehlgeschlagen: '+e.message,true)}});"
new="""    let passwordChangeRunning=false;
    $('vault-form').addEventListener('submit',async e=>{
      e.preventDefault();if(passwordChangeRunning)return;
      const button=$('vault-open');passwordChangeRunning=true;button.disabled=true;
      try{
        const current=$('vault-current-pass').value,next=$('vault-pass').value,repeat=$('vault-confirm').value;
        if(next.length<12)throw Error('Neues Passwort muss mindestens 12 Zeichen enthalten.');
        if(next!==repeat)throw Error('Die neuen Passwörter stimmen nicht überein.');
        if(current===next)throw Error('Das neue Passwort muss sich vom bisherigen unterscheiden.');
        await SEC.verifyCurrentPassword(current);
        if(!confirm('Gesamtes Tresor-Passwort jetzt ändern? Alle lokalen Gesundheitsdaten werden neu verschlüsselt. Die bisherigen Backup-Passwörter bleiben erhalten.'))return;
        await SEC.changePassword(next);
        $('vault-form').reset();
        flash('vault-state','Passwort erfolgreich geändert. Für die nächste Anmeldung gilt nur das neue Passwort. Alte Backups behalten ihr jeweiliges Backup-Passwort.');
      }catch(err){flash('vault-state','Passwortwechsel fehlgeschlagen: '+(err.message||err),true)}
      finally{passwordChangeRunning=false;button.disabled=false;}
    });"""
suite=once(suite,old,new,'suite15.js')
changed['suite15.js']=suite

style=changed['styles.css']
style += '''\n/* 3.4.5: Passwort-Hilfe; kein Einfluss auf Logo oder Aktenlayout. */\n.secure-forgot-toggle{display:block;margin:.75rem auto 0;text-decoration:underline;text-underline-offset:3px}\n.secure-forgot-panel{margin:1rem 0;padding:1rem;border:1px solid #bbd4dc;border-radius:14px;background:#f4fafc;overflow-wrap:anywhere}\n.secure-forgot-panel h2{font-size:1.12rem;margin:0 0 .6rem;color:#123b52}\n.secure-forgot-panel p{font-size:.91rem;line-height:1.55}\n.secure-forgot-panel form{display:grid;gap:.6rem;margin:1rem 0}\n.secure-forgot-panel form button{white-space:normal}\n#secure-backup-check-status{font-weight:650;color:#244d5d;white-space:normal;overflow-wrap:anywhere}\n'''
changed['styles.css']=style

sw=changed['sw.js']
sw=once(sw,"const VERSION='3.4.4-lungdisease-bp-legal';","const VERSION='3.4.5-pneumopro-password';",'sw.js')
changed['sw.js']=sw
app=changed['app.js']
app=once(app,"const VERSION = '3.4.4';","const VERSION = '3.4.5';",'app.js')
changed['app.js']=app
ver=json.loads(changed['version.json'])
ver['version']='3.4.5'
ver['released']='2026-10-29'
ver['notes']='Umbenennung in PneumoPro bei unverändertem Logo, gleicher verschlüsselter Datenbank und bestehender Installation. Sicherer Passwortwechsel mit aktuellem Passwort und Bestätigung; Passwort-vergessen-Hilfe mit schreibgeschützter Backup-Prüfung.'
changed['version.json']=json.dumps(ver,ensure_ascii=False,indent=2)+'\n'


# Nur sichtbare Produktbezeichnungen ändern. Medizinisch korrekte Asthma-Begriffe,
# Datensatz-IDs, Sicherungsformate, Importkompatibilität und Bilddateien bleiben gleich.
html=changed['index.html']
brand_replacements=[
 ('<title>Asthma – Wissen, Rechte &amp; Hilfsmittel</title>', '<title>PneumoPro – Lungen- und Gesundheitsmanager</title>'),
 ('Asthma: verständliche Informationen zu Asthma, GdB, Arbeitsrecht und Hilfsmitteln mit amtlichen Quellen.', 'PneumoPro: privater Lungen- und Gesundheitsmanager mit Befunden, Messwerten, Anträgen und medizinischen Informationen.'),
 ('alt="Asthma-Lungenlogo"', 'alt="PneumoPro-Lungenlogo"'),
 ('<img class="a281-auth-wordmark" src="./brand-wordmark-v281.png" alt="Asthma" width="174" height="58"/>', '<strong class="pneumo-wordmark pneumo-login-wordmark">PneumoPro</strong>'),
 ('<p class="section-kicker">Asthma · Sicherer Gesundheitsbereich</p>', '<p class="section-kicker">PneumoPro · Sicherer Gesundheitsbereich</p>'),
 ('<a aria-label="Asthma Startseite" class="brand a281-brand" href="#start">', '<a aria-label="PneumoPro Startseite" class="brand a281-brand" href="#start">'),
 ('<img class="a281-brand-wordmark" src="./brand-wordmark-v281.png" alt="Asthma" width="166" height="55"/>', '<img class="pneumo-brand-icon" src="./logo-192-v281.png" alt="" width="42" height="42"/><strong class="pneumo-wordmark pneumo-header-wordmark">PneumoPro</strong>'),
 ('<h1>Asthma. Deine Gesundheit im Blick.</h1>', '<h1>PneumoPro. Deine Lungengesundheit im Blick.</h1>'),
 ('<h2 id="my-title">Anträge, Dokumente &amp; Asthma-Verlauf</h2>', '<h2 id="my-title">Anträge, Dokumente &amp; Krankheitsverlauf</h2>'),
 ('<h2>Meine Asthma-Statistik</h2>', '<h2>Meine Gesundheitsstatistik – PneumoPro</h2>'),
 ('<div class="settings-row"><div><strong>Asthma</strong>', '<div class="settings-row"><div><strong>PneumoPro</strong>'),
 ('<img class="a281-footer-wordmark" src="./brand-wordmark-v281.png" alt="Asthma" width="135" height="45"/>', '<div class="pneumo-footer-brand"><img class="pneumo-brand-icon" src="./logo-192-v281.png" alt="" width="36" height="36"/><strong class="pneumo-wordmark">PneumoPro</strong></div>'),
]
for old,new in brand_replacements:
    html=once(html,old,new,'index.html')
changed['index.html']=html
# Manifest: Nur Name und Beschreibung ändern; Start-URL, Scope und Icon-Dateien bleiben bytegleich.
manifest=json.loads(changed['manifest.webmanifest'])
original_manifest=json.loads(before['manifest.webmanifest'])
manifest['name']='PneumoPro – Lungen- und Gesundheitsmanager'
manifest['short_name']='PneumoPro'
manifest['description']='Privater Lungen- und Gesundheitsmanager für Lungenfunktion, Labor, Befunde, Medikamente, Kalender, Gesundheitsakte und verschlüsselte Daten.'
assert manifest['icons']==original_manifest['icons']
assert manifest['start_url']==original_manifest['start_url'] and manifest['scope']==original_manifest['scope']
changed['manifest.webmanifest']=json.dumps(manifest,ensure_ascii=False,indent=2)+'\n'
changed['styles.css']+='''\n/* 3.4.5: PneumoPro-Schriftzug; alle Logo-Dateien bleiben unverändert. */
.pneumo-wordmark{font-weight:800;color:#15475c;letter-spacing:-.045em;line-height:1.12}
.pneumo-brand-icon{width:42px;height:42px;object-fit:contain;flex-shrink:0}
.pneumo-header-wordmark{font-size:clamp(1.28rem,3.4vw,1.85rem);white-space:nowrap}
.pneumo-login-wordmark{display:block;text-align:center;margin:8px auto 12px;font-size:clamp(1.65rem,5vw,2.1rem)}
.pneumo-footer-brand{display:flex;align-items:center;gap:9px;margin-bottom:8px}
.pneumo-footer-brand .pneumo-wordmark{font-size:1.36rem}
@media(max-width:375px){.pneumo-header-wordmark{font-size:1.2rem}.pneumo-brand-icon{width:34px;height:34px}}
@media print{.pneumo-footer-brand .pneumo-brand-icon{display:none}}
'''
# Keine Umbenennung des alten Tresorschlüssels. Sonst wären Gesundheitsdaten unerreichbar.
assert "dbName='asthma-secure-17'" in changed['secure17.js']
assert changed['manifest.webmanifest'].count('logo-192-v281.png')==1
assert 'brand-wordmark-v281.png' not in changed['index.html']
assert 'PneumoPro' in changed['index.html']
assert 'Asthma-v17-Vault' in changed['secure17.js']


# Druckberichte und navigationsbezogene Produktnamen aktualisieren.
stats=changed['stats25.js']
stats=once(stats, "'ASTHMA · GESUNDHEITSBERICHT · PRIVAT'", "'PNEUMOPRO · GESUNDHEITSBERICHT · PRIVAT'", 'stats25.js')
stats=once(stats, "const printLogo=node('img','a281-report-logo');printLogo.src='./brand-wordmark-v281.png';printLogo.alt='Asthma';", "const printLogo=node('img','a281-report-logo');printLogo.src='./logo-192-v281.png';printLogo.alt='PneumoPro-Lungenlogo';const printBrand=node('strong','pneumo-report-brand','PneumoPro');",'stats25.js')
stats=once(stats,' heading.prepend(printLogo);',' heading.prepend(printLogo,printBrand);','stats25.js')
changed['stats25.js']=stats
printcode=changed['statsprint296.js']
printcode=once(printcode,"outputName='Asthma_Statistik_'+period+'.pdf'","outputName='PneumoPro_Statistik_'+period+'.pdf'",'statsprint296.js')
printcode=once(printcode,"title:'Asthma-Statistik'","title:'PneumoPro-Statistik'",'statsprint296.js')
changed['statsprint296.js']=printcode
nav=changed['navigation332.js']
nav=once(nav, "'Asthma – seitliches Navigationsmenü'", "'PneumoPro – seitliches Navigationsmenü'",'navigation332.js')
nav=once(nav, '<strong>ASTHMA · MENÜ</strong>', '<strong>PNEUMOPRO · MENÜ</strong>','navigation332.js')
changed['navigation332.js']=nav
changed['styles.css']+='''\n/* PneumoPro im druckbaren Gesundheitsbericht. */
.pneumo-report-brand{display:block;font-size:1.4rem;font-weight:800;color:#15475c;margin:0 0 7px}
.stats25-heading .a281-report-logo{width:46px;height:46px;max-height:46px;object-fit:contain;margin-bottom:6px}
'''

# Sicherheits- und Integritätsprüfungen vor jedem Schreibvorgang.
assert all(changed[k]!=before[k] for k in files)
assert '<img src="./logo-192-v281.png"' in changed['index.html']
assert 'pneumo-header-wordmark' in changed['index.html']
assert 'id="vault-current-pass"' in changed['index.html']
assert 'id="vault-confirm"' in changed['index.html']
assert json.loads(changed['manifest.webmanifest'])['short_name']=='PneumoPro'
assert "dbName='asthma-secure-17'" in changed['secure17.js']
assert "await SEC.verifyCurrentPassword(current);" in changed['suite15.js']
assert 'verifyRecoveryBackup' in changed['secure17.js']
assert 'id="secure-forgot-toggle"' in changed['index.html']
assert 'id="vault-confirm"' in changed['index.html']
assert "const CACHE=`asthma-static-${VERSION}`;" in changed['sw.js']
assert json.loads(changed['version.json'])['version']=='3.4.5'
for name in files:
    (ROOT/name).write_text(changed[name],encoding='utf-8')
print('PneumoPro 3.4.5: 11 Textdateien geändert. Bilder, Tresor und Gesundheitsdaten unverändert.')
