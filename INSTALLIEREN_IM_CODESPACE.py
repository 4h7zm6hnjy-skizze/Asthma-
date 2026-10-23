#!/usr/bin/env python3
"""Update Asthma webapp without publishing patient data. Usage: python3 update_asthma.py"""
from __future__ import annotations
import json, os, pathlib, re, subprocess, sys, shutil, tempfile

REPO = 'https://github.com/4h7zm6hnjy-skizze/Asthma-.git'
OWNER = pathlib.Path(__file__).resolve().parent
VERSION = '3.0.3'


def run(args, cwd=None, check=True):
    print('>', ' '.join(map(str,args)), flush=True)
    return subprocess.run(args, cwd=cwd, check=check, text=True)


def replace_one(src, before, after, label):
    count=src.count(before)
    if count != 1:
        raise RuntimeError(f'Codeänderung abgebrochen ({label}): erwartete 1 Fundstelle, gefunden {count}. Keine halbfertigen Dateien werden veröffentlicht.')
    return src.replace(before,after,1)


def modify_sources(repo):
    edits={}
    labs=(repo/'labor18.js').read_text(encoding='utf-8')
    lab_old='function graph(t){const container=$(\'labp-graph\');'
    lab_new='function graph(t){const container=$(\'labp-graph\');'
    # The existing chart shows all measurements. Add short numeric deltas only for a readable number of points.
    lab_anchor="  t.points.forEach((r,i)=>{const dot=svg('circle'"
    lab_delta=r'''  if(values.length<=7)for(let i=1;i<values.length;i++){
   const a=t.points[i-1],b=t.points[i],diff=values[i]-values[i-1];
   if(String(a.unit||'')!==String(b.unit||'')||x(i)-x(i-1)<52)continue;
   const change=(diff>0?'+':'')+nice(diff);
   const pct=values[i-1]===0?'':' ('+(diff>0?'+':'')+nice(diff/Math.abs(values[i-1])*100)+' %)';
   const p=ref(a),q=ref(b);let fill='#425e70';
   if(p&&q&&p[0]===q[0]&&p[1]===q[1]){
    const oldOutside=values[i-1]<p[0]||values[i-1]>p[1];
    const newOutside=values[i]<q[0]||values[i]>q[1];
    if(oldOutside&&!newOutside)fill='#157b4a';else if(!oldOutside&&newOutside)fill='#b43b32';
   }
   const txt=svg('text',{x:(x(i-1)+x(i))/2,y:Math.max(T+12,Math.min(H-B-6,(y(values[i-1])+y(values[i]))/2+(i%2?14:-14))),
    'text-anchor':'middle','font-size':10,'font-weight':700,fill});
   txt.textContent=change+pct;
   txt.append(svg('title',{})).textContent=dstr(a.date)+' → '+dstr(b.date)+': '+change+' '+(b.unit||'')+pct;
   s.append(txt);
  }
'''
    labs=replace_one(labs,lab_anchor,lab_delta+lab_anchor,'Labor-Diagramm-Delta')
    edits['labor18.js']=labs

    lufu=(repo/'lufu23.js').read_text(encoding='utf-8')
    before="        if(last && last.phase===r.phase){svgEl('line',{x1:last.x,y1:last.y,x2:x,y2:y,stroke:colors[field],'stroke-width':3.5,'stroke-linecap':'round'},svg)}"
    after=r'''        if(last && last.phase===r.phase){
          svgEl('line',{x1:last.x,y1:last.y,x2:x,y2:y,stroke:colors[field],'stroke-width':3.5,'stroke-linecap':'round'},svg);
          const diff=v-last.value,relative=last.value===0?null:diff/Math.abs(last.value)*100;
          const decimal=field.includes('Liters')?2:1;
          const display=(diff>0?'+':'')+nr(diff,decimal)+(field.includes('Liters')?' l':' Prozentpunkte');
          const detail=relative===null?'':', '+(relative>0?'+':'')+nr(relative,1)+' % relativ';
          changes.push(names[field]+': '+display+detail+' ('+niceDate(last.date)+' → '+niceDate(r.date)+')');
          if(rows.length<=5&&available.length<=2&&Math.abs(x-last.x)>60){
            const yy=Math.max(top+13,Math.min(H-bottom-5,(y+last.y)/2+(field===available[0]?-14:20)));
            const label=svgEl('text',{x:(last.x+x)/2,y:yy,'text-anchor':'middle','font-size':mobile?11:12,'font-weight':700,
              fill:diff>0?'#178052':diff<0?'#b44336':'#526776'},svg);
            label.textContent=(diff>0?'+':'')+nr(diff,decimal)+(field.includes('Liters')?' l':' pp');
            svgEl('title',{},label).textContent=names[field]+': '+display+detail+' · '+niceDate(last.date)+' → '+niceDate(r.date);
          }
        }'''
    lufu=replace_one(lufu,before,after,'Lungenfunktions-Linie')
    lufu=replace_one(lufu,'    for(const field of available){','    const changes=[];\n    for(const field of available){','Lungenfunktions-Statistikpuffer')
    lufu=replace_one(lufu,'        last={x,y,phase:r.phase};','        last={x,y,phase:r.phase,value:v,date:r.date};','Lungenfunktions-Vorwert')
    lufu=replace_one(lufu,"    const note=el('p','lufu23-muted',rows.length===1?", "    if(changes.length)host.append(el('p','lufu23-muted','Differenzen zwischen Messpunkten derselben Messphase: '+changes.slice(-6).join(' · ')));\n    const note=el('p','lufu23-muted',rows.length===1?",'Lungenfunktions-Textdeltas')
    edits['lufu23.js']=lufu

    stats=(repo/'statsplus292.js').read_text(encoding='utf-8')
    target="     if(pts.length>1)shape('polyline',{points:pts.map(item=>x(item)+','+y(num(item[key]))).join(' '),fill:'none',stroke:color,'stroke-width':2.6,'stroke-linejoin':'round','stroke-linecap':'round'});"
    addition=r'''     if(pts.length>=2&&pts.length<=7){
       for(let i=1;i<pts.length;i++){
         const a=pts[i-1],b=pts[i],old=num(a[key]),now=num(b[key]);
         if(old===null||now===null||x(b)-x(a)<58)continue;
         const diff=now-old,unitLabel=unit==='%'?' pp':unit?' '+unit:'';
         const rel=old===0?'':' ('+(diff>0?'+':'')+format(diff/Math.abs(old)*100,1)+' % relativ)';
         const text=(diff>0?'+':'')+format(diff,digits)+unitLabel;
         const clinical=['fev1','fvc','fev1Liters','fvcLiters'].includes(key);
         const fill=clinical?(diff>0?'#167d50':diff<0?'#b13b35':'#4a5d69'):'#4a5d69';
         const label=shape('text',{x:(x(a)+x(b))/2,y:Math.max(T+12,Math.min(H-B-5,(y(old)+y(now))/2+(seriesIndex%2===0?-13:19))),
           fill,'font-size':11,'font-weight':700,'text-anchor':'middle',stroke:'#fff','stroke-width':3,'paint-order':'stroke'},text);
         const tooltip=document.createElementNS(svgNS,'title');tooltip.textContent=fmt(a.date)+' → '+fmt(b.date)+': '+text+rel;
         label.append(tooltip);
       }
     }
'''
    stats=replace_one(stats,target,target+'\n'+addition,'Statistik-Deltas')
    stats=replace_one(stats,'   c.append(chartSummary);','   c.append(chartSummary);\n   c.append(node(\'p\',\'s292-note\',\'Zahlen zwischen Punkten zeigen absolute Messwertänderungen; bei Prozentwerten sind dies Prozentpunkte (pp). Das Vorzeichen bedeutet nicht automatisch eine klinische Verbesserung oder Verschlechterung. Bei vielen Messpunkten werden die Änderungszahlen aus Platzgründen nicht eingeblendet.\'));','Statistik-Deltalegende')
    edits['statsplus292.js']=stats

    secure=(repo/'secure17.js').read_text(encoding='utf-8')
    secure=replace_one(secure,"'labor18.js','hub20.js'","'labor18.js','laborvergleich303.js','offline303.js','hub20.js'",'Ladeskripte')
    edits['secure17.js']=secure

    index=(repo/'index.html').read_text(encoding='utf-8')
    index=index.replace('2.9.7',VERSION).replace('3.0.2',VERSION)
    if VERSION not in index: raise RuntimeError('Keine Versionsangabe in HTML gefunden')
    edits['index.html']=index
    app=(repo/'app.js').read_text(encoding='utf-8')
    app=replace_one(app,"const VERSION = '2.9.7';",f"const VERSION = '{VERSION}';",'App-Versionskennung')
    edits['app.js']=app

    sw=(repo/'sw.js').read_text(encoding='utf-8')
    sw=re.sub(r"const VERSION='[^']+';",f"const VERSION='{VERSION}-offline-laborvergleich';",sw,count=1)
    sw=replace_one(sw, " './labor18.js','./hub20.js'", " './labor18.js','./laborvergleich303.js','./offline303.js','./hub20.js'",'Offline-Cache-Module')
    # Cache every shipped JS/CSS so the user doesn't need to visit each section while online.
    extra=['./'+p.name for p in repo.iterdir() if p.is_file() and p.suffix in ('.js','.css') and p.name!='sw.js']
    all_paths=set(re.findall(r"['\"](\./[^'\"]+)['\"]",sw))
    extra=[p for p in extra if p not in all_paths and p not in ('./laborvergleich303.js','./offline303.js')]
    if extra: sw=replace_one(sw, '\n];',',\n '+','.join(repr(p) for p in extra)+'\n];','Offline-Cache zusätzliche Dateien')
    sw=replace_one(sw,"if(path.endsWith('/version.json')||path.endsWith('/rechtsmonitor-feed.json')){\n  event.respondWith(fetch(event.request,{cache:'no-store'}));return;\n }",
      "if(path.endsWith('/version.json')||path.endsWith('/rechtsmonitor-feed.json')){\n  event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match(event.request,{ignoreSearch:true})));return;\n }",'Offline-Fallback Update-/Quellen-Dateien')
    sw=replace_one(sw,"'/statsplus292.js','/labor18.js','/befundscan.js'","'/statsplus292.js','/labor18.js','/lufu23.js','/laborvergleich303.js','/offline303.js','/befundscan.js'",'Offline-aktuelle Module')
    # All pre-cache entries must actually exist; avoid a Service Worker installation that fails entirely.
    for asset in set(re.findall(r"['\"](\./[^'\"]+)['\"]",sw)):
        if asset!='./' and not (repo/asset[2:]).exists() and asset not in ('./laborvergleich303.js','./offline303.js'):
            raise RuntimeError('Offline-Caching abgebrochen: Datei nicht gefunden: '+asset)
    edits['sw.js']=sw
    edits['version.json']=json.dumps({'version':VERSION,'released':'2026-10-23',
        'notes':'Laborvergleich mit Vorwerten, Delta-Anzeigen in Lungenfunktion und Statistik, vollständig lokaler Import und Offline-Cache. Vorhandene AES-GCM-Gesundheitsdaten bleiben unverändert.'},ensure_ascii=False,indent=2)+'\n'
    edits['laborvergleich303.js']=(OWNER/'laborvergleich303.js').read_text(encoding='utf-8')
    edits['offline303.js']=(OWNER/'offline303.js').read_text(encoding='utf-8')
    # Test all JS syntax before writing anything to the git work tree.
    for name,body in edits.items():
        if name.endswith('.js'):
            temp=repo/('_check_'+name)
            temp.write_text(body,encoding='utf-8')
            try:run(['node','--check',str(temp)])
            except FileNotFoundError: print('Hinweis: Node.js ist nicht installiert; automatische JS-Syntaxprüfung übersprungen.')
            finally: temp.unlink(missing_ok=True)
    for name,body in edits.items(): (repo/name).write_text(body,encoding='utf-8')
    return sorted(edits)


def main():
    print('Asthma 3.0.3 – Update im iPhone-GitHub-Codespace')
    if not shutil.which('git'):
        print('Git ist in dieser Umgebung nicht installiert.');return 1
    repo=pathlib.Path.cwd().resolve()
    if not (repo/'secure17.js').is_file() or not (repo/'sw.js').is_file():
        print('Bitte zuerst das Terminal im Wurzelverzeichnis des Asthma-GitHub-Repositories oeffnen.');return 1
    if subprocess.run(['git','diff','--quiet'],cwd=repo).returncode != 0 or subprocess.run(['git','diff','--cached','--quiet'],cwd=repo).returncode != 0:
        print('Das Repository enthaelt ungespeicherte Aenderungen. Bitte erst sichern oder committen.');return 1
    try:
        changes=modify_sources(repo)
        print('Gepruefte Dateien:',', '.join(changes))
        run(['git','add','--']+changes,cwd=repo)
        run(['git','diff','--cached','--check'],cwd=repo)
        if subprocess.run(['git','diff','--cached','--quiet'],cwd=repo).returncode==0:
            print('Bereits aktuell.');return 0
        run(['git','commit','-m','Asthma 3.0.3: Labor, Diagramme und Offline'],cwd=repo)
        res=run(['git','push','origin','HEAD:main'],cwd=repo,check=False)
        if res.returncode:
            print('GitHub hat Push verweigert. Die Aenderungen liegen im Codespace und koennen dort wiederholt werden.');return 2
        print('FERTIG: Asthma 3.0.3 wurde in GitHub gespeichert. Nun die iPhone-App online neu oeffnen.')
        return 0
    except Exception as e:
        print('SICHERER ABBRUCH:',e)
        return 1

if __name__=='__main__':
    sys.exit(main())
