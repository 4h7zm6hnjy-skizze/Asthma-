"""Offline build regression test with synthetic source; no private real records."""
import json
import sys
import tempfile
import zipfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from erstelle_update import build, BuildError, ASSETS

def test_synthetic_full_update():
    with tempfile.TemporaryDirectory() as wd:
        src=Path(wd)/'original'; src.mkdir()
        (src/'index.html').write_text('''<!doctype html><html lang="de"><head>
<link rel="stylesheet" href="./design26.css"/>
<link rel="apple-touch-icon" href="./logo-192.png"/>
</head><body>
<button class="nav-item" data-goto="lungenwerte" type="button">Lungenwerte</button>
<button data-goto="lungenwerte"><span>◷</span><strong>Lungenwerte</strong><small>Messungen und Verlauf</small></button>
<a class="btn btn-outline" href="#epef-panel">Peak-Flow-Tagebuch</a>
<section id="lungenwerte">
<section class="epef-panel" id="epef-panel" aria-labelledby="epef-title">
</section>
</section><section class="panel new-page" data-nav-page="befunde" id="befunde"></section>
<p>2.6.0</p></body></html>''',encoding='utf-8')
        (src/'secure17.js').write_text("const scripts=['hilfsmittel251.js','design26.js'];\n",encoding='utf-8')
        (src/'suite15.js').write_text("const pages=['kalender','lungenwerte','befunde'];\n",encoding='utf-8')
        (src/'design26.js').write_text("const x=['Peak-Flow','lungenwerte','ePEF-Tagebuch'];const t={version:'2.6.0'};\n",encoding='utf-8')
        (src/'app.js').write_text("const VERSION = '2.6.0';\n",encoding='utf-8')
        (src/'sw.js').write_text('const VERSION=\'2.6.0\'; const ASSETS=["./index.html","./sw.js","./manifest.webmanifest","./logo-192.png","./logo-512.png"];\n',encoding='utf-8')
        (src/'version.json').write_text(json.dumps({'version':'2.6.0','notes':'existing'}),encoding='utf-8')
        (src/'manifest.webmanifest').write_text(json.dumps({'icons':[{'src':'logo-192.png'},{'src':'logo-512.png'}]}),encoding='utf-8')
        (src/'README.md').write_text('old readme',encoding='utf-8')
        (src/'logo-192.png').write_bytes(b'old icon 192')
        (src/'logo-512.png').write_bytes(b'old icon 512')
        out=Path(wd)/'out';out.mkdir()
        zipped=build(src,out)
        with zipfile.ZipFile(zipped) as z:
            names=set(z.namelist())
            assert len(names)>15, names
            assert all(not name.startswith('Asthma_2.7.0_') for name in names)
            for item in ['index.html','professional27.js','professional27.css','logo-192.png','logo-512.png','logo-home-v270.png','version.json','PRUEFBERICHT_2.7.0.md']:
                assert item in names, item
            assert json.loads(z.read('version.json'))['version']=='2.7.0'
            assert b'logo-home-v270.png' in z.read('index.html')
            assert b'logo-home-v270.png' in z.read('sw.js')
            assert b'Not a real person' not in z.read('professional27.js')
        print('PASS: build without Internet, full-root ZIP, offline assets, logos, JS syntax')
if __name__=='__main__':
    test_synthetic_full_update()
