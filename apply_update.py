#!/usr/bin/env python3
"""Safe source patcher for Asthma v2.8.1 -> v2.9.0. No network or health-data access."""
from __future__ import annotations
import json, re, sys, shutil, pathlib, subprocess, zipfile, datetime

HERE = pathlib.Path(__file__).resolve().parent
VERSION = '2.9.0'
MODIFIED=[]


def replace_one(data,old,new,file):
    if new in data:
        return data
    hits=data.count(old)
    if hits!=1:
        raise RuntimeError(f'{file}: Erwarteter Abschnitt nicht eindeutig ({hits} Treffer): {old[:95]!r}')
    return data.replace(old,new,1)

def replace_regex(data,pat,repl,file):
    revised,count=re.subn(pat,repl,data,count=1,flags=re.S)
    if count!=1: raise RuntimeError(f'{file}: Suchmuster nicht gefunden: {pat[:95]}')
    return revised

def modify(root,name,fn):
    p=root/name
    if not p.is_file(): raise RuntimeError('Datei fehlt: '+str(p))
    original=p.read_text(encoding='utf-8')
    revised=fn(original,name)
    if revised!=original:
        p.write_text(revised,encoding='utf-8')
        MODIFIED.append(name)

def patch_index(s,name):
    s=replace_one(s,'</head>','<link href="./vital29.css" rel="stylesheet"/>\n</head>',name)
    s=replace_regex(s,r'(<button class="nav-item" data-goto="lungenwerte"[^>]*>.*?</button>)',r'\1<button class="nav-item" data-goto="vitalwerte" type="button">Vitalwerte</button>',name)
    page='''<section class="panel new-page" id="vitalwerte" data-nav-page="vitalwerte">
 <div class="section-heading"><div><p class="section-kicker">Neue Gesundheitsmessungen</p><h2>Persönliche Vitalwerte</h2><p>Sauerstoff, Blutdruck und Puls – vollständig lokal und verschlüsselt.</p></div></div>
</section>
'''
    marker='<section class="panel new-page peakflow-page" data-nav-page="peakflow" id="peakflow">'
    s=replace_one(s,marker,page+marker,name)
    # Existing graph selectors retain their previous choices and gain five standardized views.
    changes={
     'lufu23-home-period': [('1','Täglich'),('7','Wöchentlich'),('30','Monatlich'),('365','Jährlich'),('3652','10 Jahre')],
     'lufu23-period': [('1','Täglich'),('7','Wöchentlich'),('30','Monatlich'),('365','Jährlich'),('3652','10 Jahre')],
     'home-epef-range': [('1','Täglich'),('7','Wöchentlich'),('30','Monatlich'),('365','Jährlich'),('3652','10 Jahre')],
     'epef-range': [('1','Täglich'),('7','Wöchentlich'),('30','Monatlich'),('365','Jährlich'),('3652','10 Jahre')],
    }
    for key,opts in changes.items():
        pat=r'(<select\s+id="'+re.escape(key)+r'"[^>]*>)(.*?)(</select>)'
        m=re.search(pat,s,re.S)
        if not m: raise RuntimeError(name+': Diagramm-Filter fehlt: '+key)
        existing=m.group(2)
        for val,label in opts:
            if not re.search(r'<option\s+value="'+val+r'"',existing):
                existing+='<option value="'+val+'">'+label+'</option>'
            else:
                existing=re.sub(r'(<option\s+value="'+val+'"[^>]*>).*?(</option>)',lambda x: x.group(1)+label+x.group(2),existing,count=1)
        s=s[:m.start()]+m.group(1)+existing+m.group(3)+s[m.end():]
    s=replace_one(s,'<div aria-live="polite" class="suite-chart" id="measurement-chart"></div>',
       '<label class="v29-inline-filter">Zeitraum <select id="measurement-range">'+''.join('<option value="'+v+'">'+t+'</option>' for v,t in [('1','Täglich'),('7','Wöchentlich'),('30','Monatlich'),('365','Jährlich'),('3652','10 Jahre')])+'</select></label><div aria-live="polite" class="suite-chart" id="measurement-chart"></div>',name)
    marker=re.search(r'<div\b[^>]*\bid="diary-chart"[^>]*>',s,re.S)
    if marker is None:raise RuntimeError(name+': diary-chart fehlt')
    diaryselect='<label class="v29-inline-filter">Zeitraum im Tagebuch <select id="diary-chart-range">'+''.join('<option value="'+v+'">'+t+'</option>' for v,t in [('1','Täglich'),('7','Wöchentlich'),('30','Monatlich'),('365','Jährlich'),('3652','10 Jahre')])+'</select></label>'
    s=s[:marker.start()]+diaryselect+s[marker.start():]
    return s

def patch_secure(s,name):
    s=replace_one(s,"'leistungen32.js'];", "'leistungen32.js','vital29.js'];",name)
    return s

def patch_suite(s,name):
    s=replace_one(s,"'lungenwerte','peakflow'","'lungenwerte','vitalwerte','peakflow'",name)
    s=replace_one(s,"const series=records.filter(r=>Number.isFinite(r[field])).sort((a,b)=>a.date.localeCompare(b.date));if(series.length<2)return null;",
       "const days=Number($('measurement-range')?.value||30);const cutoff=new Date();cutoff.setHours(12,0,0,0);cutoff.setDate(cutoff.getDate()-days+1);const dateLimit=today.call(null);const isoCut=[cutoff.getFullYear(),String(cutoff.getMonth()+1).padStart(2,'0'),String(cutoff.getDate()).padStart(2,'0')].join('-');const series=records.filter(r=>Number.isFinite(r[field])&&r.date>=isoCut).sort((a,b)=>a.date.localeCompare(b.date));if(series.length<1)return null;",name)
    # ref in plotted extent; avoid forged thresholds
    s=replace_one(s,"const vals=series.map(r=>r[field]),min=", "const personalRef=window.ASTHMA_VITAL29?.getRef?.(field);const vals=series.map(r=>r[field]);if(Number.isFinite(personalRef))vals.push(personalRef);const min=",name)
    s=replace_one(s,"for(let i=0;i<4;i++){let y=22+i*65;", "if(Number.isFinite(personalRef)){const yy=214-(personalRef-min)/rng*192;node('line',{x1:52,x2:750,y1:yy,y2:yy,stroke:'#a6783c','stroke-width':2,'stroke-dasharray':'7 6'});}for(let i=0;i<4;i++){let y=22+i*65;",name)
    s=replace_one(s,"$('measurement-metric').addEventListener('change',()=>renderMeasurements().catch(()=>{}));",
       "$('measurement-metric').addEventListener('change',()=>renderMeasurements().catch(()=>{}));$('measurement-range')?.addEventListener('change',()=>renderMeasurements().catch(()=>{}));window.addEventListener('asthma:vital29-ready',()=>renderMeasurements().catch(()=>{}));window.addEventListener('asthma:vital29-refs',()=>renderMeasurements().catch(()=>{}));",name)
    s=replace_one(s,"out.push('Version der Oberfläche: 2.8.0')", "out.push('Version der Oberfläche: 2.9.0')",name)
    return s

def patch_lufu(s,name):
    s=replace_one(s,"const values=rows.flatMap(r=>available.map(k=>r[k])).filter(x=>x!==null);",
       "const refValues=available.map(k=>window.ASTHMA_VITAL29?.getRef?.(k)).filter(x=>Number.isFinite(x));const values=rows.flatMap(r=>available.map(k=>r[k])).filter(x=>x!==null).concat(refValues);",name)
    marker="const indices=[0,Math.floor((rows.length-1)/2),rows.length-1].filter((x,i,a)=>a.indexOf(x)===i);"
    ref="for(const k of available){const ref=window.ASTHMA_VITAL29?.getRef?.(k);if(!Number.isFinite(ref))continue;const yy=top+(hi-ref)/span*(H-top-bottom);svgEl('line',{x1:left,x2:W-right,y1:yy,y2:yy,stroke:colors[k],'stroke-width':2,'stroke-dasharray':'7 6'},svg);const label=svgEl('text',{x:W-right,y:Math.max(14,yy-5),fill:colors[k],'text-anchor':'end','font-size':13},svg);label.textContent=names[k]+' Ziel '+nr(ref);}\n    "
    s=replace_one(s,marker,ref+marker,name)
    marker="refresh().catch(e=>{const p=$('lufu23-home-count');"
    s=replace_one(s,marker,"window.addEventListener('asthma:vital29-refs',()=>{drawHome();drawDetail()});window.addEventListener('asthma:vital29-ready',()=>{drawHome();drawDetail()});\n   "+marker,name)
    return s

def patch_epef(s,name):
    # Don't double count existing expected PEF as a personal best.
    s=replace_one(s,"const val=series.map(x=>x[field]);if(field==='pef'&&referencePEF!==null)val.push(referencePEF);",
       "const ownRef=window.ASTHMA_VITAL29?.getRef?.(field==='pef'?'pef':'epefFev1');const val=series.map(x=>x[field]);if(field==='pef'&&referencePEF!==null)val.push(referencePEF);if(Number.isFinite(ownRef))val.push(ownRef);",name)
    marker="const xy=(r,i)=>[xl+(series.length===1?"
    lines="if(Number.isFinite(ownRef)){const ry=yb-(ownRef-min)*(yb-yt)/(max-min);item('line',{x1:xl,x2:xr,y1:ry,y2:ry,stroke:'#995d9a','stroke-width':2,'stroke-dasharray':'7 6'});item('text',{x:xr-3,y:Math.max(13,ry-6),'text-anchor':'end',fill:'#995d9a','font-size':12},'Persönliche Referenz '+ownRef);}\n     "
    s=replace_one(s,marker,lines+marker,name)
    marker="refresh().catch(e=>status('Verschlüsselte Messwerte konnten nicht geladen werden: '+e.message,true));"
    s=replace_one(s,marker,"window.addEventListener('asthma:vital29-refs',redraw);window.addEventListener('asthma:vital29-ready',redraw);\n   "+marker,name)
    return s

def patch_diary(s,name):
    old="const records=diary.filter(x=>Number.isFinite(x.peak)).slice(0,14).reverse();const title=make('h4','','Peak-Flow: letzte 14 Messungen');"
    new="const days=Number($('diary-chart-range')?.value||30),cut=new Date();cut.setHours(12,0,0,0);cut.setDate(cut.getDate()-(days-1));const since=todayDate29(cut);const data=diary.filter(x=>Number.isFinite(x.peak)&&x.date>=since).slice().reverse();const records=data.length<=400?data:data.filter((_,i)=>i===0||i===data.length-1||i%Math.ceil(data.length/400)===0);const title=make('h4','','Peak-Flow – '+days+' Tage ('+data.length+' Messungen)');"
    if old not in s:raise RuntimeError(name+': Diary-Chart Abschnitt nicht gefunden')
    s=s.replace(old,new,1)
    # Local date formatter independent of timezone, no anonymous date string coerced to UTC.
    s=replace_one(s,"const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};",
       "const todayDate29=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const today=()=>todayDate29(new Date());",name)
    s=replace_one(s,"const vals=records.map(r=>r.peak),lo=Math.min(...vals),hi=Math.max(...vals)",
       "const personalRef=window.ASTHMA_VITAL29?.getRef?.('pef');const vals=records.map(r=>r.peak);if(Number.isFinite(personalRef))vals.push(personalRef);const lo=Math.min(...vals),hi=Math.max(...vals)",name)
    s=replace_one(s,"const poly=document.createElementNS(svg.namespaceURI,'polyline');",
       "if(Number.isFinite(personalRef)){const yy=168-(personalRef-min)/(max-min)*125;const baseline=document.createElementNS(svg.namespaceURI,'line');for(const [k,v] of Object.entries({x1:35,x2:625,y1:yy,y2:yy,stroke:'#ad7b38','stroke-width':2,'stroke-dasharray':'7 6'}))baseline.setAttribute(k,v);svg.append(baseline)}\n    const poly=document.createElementNS(svg.namespaceURI,'polyline');",name)
    # Newly appended control listens within the original module; no shared plaintext storage.
    s=replace_one(s,"function renderPeakChart(){", "function renderPeakChart(){",name) if False else s
    marker="function bind(){"
    if marker not in s:raise RuntimeError(name+': Bind not found')
    s=s.replace(marker,marker+"$('diary-chart-range')?.addEventListener('change',renderPeakChart);window.addEventListener('asthma:vital29-refs',renderPeakChart);window.addEventListener('asthma:vital29-ready',renderPeakChart);",1)
    return s

def patch_stats(s,name):
    marker="const aux=section(report,'Asthma-Arbeitsunfähigkeit');"
    insert="""const additional=suite.filter(x=>x.type==='vital29'&&within(x.value?.date||'',r)).map(x=>x.value);
  const newSection=section(report,'Blutsauerstoff, Blutdruck und Puls');
  for(const [kind,title,unit,fields] of [['spo2','SpO₂','%',['value']],['bp','Blutdruck','mmHg',['value','diastolic']],['pulse','Puls','/min',['value']]]){
    const set=additional.filter(x=>x.kind===kind);line(newSection,title+' – Messungen',String(set.length));
    for(const [idx,field] of fields.entries()){const nums=set.map(x=>num(x[field])).filter(x=>x!==null);const label=kind==='bp'?(idx===0?'systolisch':'diastolisch'):title;line(newSection,label+' – Durchschnitt',val(avg(nums),unit,kind==='spo2'?1:0));}
  }
  """
    s=replace_one(s,marker,insert+marker,name)
    return s

def patch_sw(s,name):
    s=re.sub(r"const VERSION='[^']+';","const VERSION='2.9.0-vitals-charts-medreview';",s,count=1)
    s=replace_one(s,'"./rechtsmonitor.css"];','"./rechtsmonitor.css","./vital29.css","./vital29.js"];',name)
    return s

def patch_ver(s,name):
    doc=json.loads(s);doc['version']=VERSION;doc['released']='2026-10-21';doc['notes']='SpO2 aus Apple Watch/Finger/Ohr manuell, Blutdruck und Puls getrennt; Zeiträume von einem Tag bis zehn Jahre; gestrichelte ärztlich bestätigte Referenzen; erneute lokale, begrenzte Medikamentenprüfung bei Planänderungen.'
    return json.dumps(doc,ensure_ascii=False,indent=2)+'\n'

PATCHES=[('index.html',patch_index),('secure17.js',patch_secure),('suite15.js',patch_suite),('lufu23.js',patch_lufu),('epef21.js',patch_epef),('meine-daten.js',patch_diary),('stats25.js',patch_stats),('sw.js',patch_sw),('version.json',patch_ver)]

def main():
 if len(sys.argv)<2:print('Aufruf: python3 apply_update.py /pfad/zum/Asthma-Projekt [Ausgabeordner]');sys.exit(2)
 source=pathlib.Path(sys.argv[1]).expanduser().resolve()
 if not (source/'secure17.js').is_file():raise RuntimeError('Kein gültiges Asthma-Projekt: '+str(source))
 output=pathlib.Path(sys.argv[2]).expanduser().resolve() if len(sys.argv)>2 else (HERE/'Asthma_2.9.0_Zum_Hochladen')
 if output==source or source in output.parents:raise RuntimeError('Ausgabeordner darf nicht im Quellordner liegen')
 output.mkdir(parents=True,exist_ok=True)
 # Source is never changed: build working copy of just the touched files.
 for filename,_ in PATCHES:shutil.copy2(source/filename,output/filename)
 for f in ['vital29.js','vital29.css']:shutil.copy2(HERE/f,output/f)
 for filename,fn in PATCHES:modify(output,filename,fn)
 # Validate every changed JS and patch scope; fail before packaging on incompatible app.
 for file in ['secure17.js','suite15.js','lufu23.js','epef21.js','meine-daten.js','stats25.js','vital29.js','sw.js']:
  r=subprocess.run(['node','--check',str(output/file)],capture_output=True,text=True) if shutil.which('node') else None
  if r and r.returncode:raise RuntimeError(file+' Javascript-Syntaxfehler: '+r.stderr)
 if '<section class="panel new-page" id="vitalwerte"' not in (output/'index.html').read_text():raise RuntimeError('Vitalwerte-Navigation fehlt')
 doc=output/'ANLEITUNG_2.9.0.txt'
 doc.write_text('ASTHMA 2.9.0 – DATEIEN FUER GITHUB\n\nDiese Dateien ersetzen die gleichnamigen Dateien im Hauptordner des GitHub-Repositories Asthma-.\nAlle 11 Dateien zusammen hochladen; nicht nur die ZIP-Datei hochladen.\nVorher im alten Asthma eine verschlüsselte Gesamtsicherung (.asthma17) erstellen.\nDanach GitHub Pages aktualisieren, die Webapp neu laden und in der App Update suchen.\nAlte lokale Gesundheitsdaten bleiben erhalten, sofern du dasselbe Safari-Profil/Home-Bildschirm-Symbol verwendest.\nWichtig: automatische Wechselwirkungspruefung ist nur eine begrenzte, nicht aktuelle Offline-Regelliste.\nApple-Health-Messungen koennen nicht unmittelbar per Webapp gelesen werden.\n',encoding='utf-8')
 zip_path=output.parent/'Asthma_2.9.0_GitHub_Update.zip'
 with zipfile.ZipFile(zip_path,'w',compression=zipfile.ZIP_DEFLATED) as z:
  for p in sorted(output.iterdir()):
   if p.is_file():z.write(p,arcname=p.name)
 print('ERFOLG: '+str(zip_path));print('Dateien: '+', '.join(sorted(x.name for x in output.iterdir())))

if __name__=='__main__':
 try:main()
 except Exception as e:print('UPDATE ABGEBROCHEN – Quelldateien wurden nicht verändert. Grund: '+str(e),file=sys.stderr);sys.exit(1)
