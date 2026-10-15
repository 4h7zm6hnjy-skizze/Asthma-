"""Lokaler, reproduzierbarer Smoke-Test. Ausführen: python tests/browser_smoke.py"""
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+(root/'styles.css').read_text()+'</style>')
html=html.replace('<script defer src="content.js"></script>','').replace('<script defer src="app.js"></script>','')
html=html.replace('</body>','<script>'+(root/'content.js').read_text()+'</script><script>'+(root/'app.js').read_text()+'</script></body>')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1365,'height':980},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='load')
    assert page.locator('h1').inner_text().startswith('Dein Wegweiser')
    assert page.locator('.card').count()>=15, page.locator('.card').count()
    assert page.locator('#equal-field').is_visible()
    assert not page.locator('#reload-app').is_visible(), 'Versteckter Updatebutton sichtbar'
    assert page.locator('#profile-result').inner_text().find('620 €')>=0
    assert not page.locator('.card[data-id="zusatzurlaub"]').count(), 'Urlaubsrecht bei GdB 30 ohne Gleichstellung sichtbar'
    page.locator('#equal').select_option('yes')
    assert page.locator('.card[data-id="kuendigung"]').count()==1
    assert page.locator('.card[data-id="zusatzurlaub"]').count()==0
    page.locator('#gdb').select_option('50')
    assert page.locator('.card[data-id="zusatzurlaub"]').count()==1
    assert not page.locator('#equal-field').is_visible()
    assert page.locator('#profile-result').inner_text().find('1.140 €')>=0
    page.locator('#gdb').select_option('10')
    assert page.locator('.card[data-id="steuer"]').count()==0
    page.locator('#show-all').click()
    assert page.locator('.card[data-id="steuer"]').count()==1
    page.locator('#show-all').click()
    page.locator('#gdb').select_option('40')
    page.locator('#search').fill('Kurzarbeit')
    assert page.locator('.card').count()==1, page.locator('.card').count()
    assert 'Versetzung' in page.locator('.card h3').inner_text()
    page.locator('#clear-search').click()
    page.locator('button[data-section="hilfsmittel"]').click()
    assert all(x.inner_text().casefold()=='hilfsmittel' for x in page.locator('.category-tag').all())
    page.locator('button[data-section="all"]').click()
    saved=page.locator('.card').first
    card_id=saved.get_attribute('data-id')
    saved.locator('.save-btn').click()
    assert page.locator('#saved-count').inner_text()=='1'
    page.locator('button[data-section="saved"]').click()
    assert page.locator('.card').count()==1
    assert page.locator('.card').first.get_attribute('data-id')==card_id
    page.locator('#check-update').click()
    page.wait_for_function("document.querySelector('#update-status').textContent.includes('nicht möglich')")
    page.evaluate("window.fetch = async () => ({ok:true,json:async()=>({version:'1.1.0',notes:'Testveröffentlichung'})})")
    page.locator('#check-update').click()
    page.wait_for_function("document.querySelector('#update-status').textContent.includes('1.1.0')")
    assert page.locator('#reload-app').is_visible()
    assert page.locator('#source-list a').count()>=20
    assert page.locator('a[target="_blank"]').count()>10
    assert not errors,errors
    page.screenshot(path='/mnt/data/AsthmaKompass_desktop.png',full_page=True)
    mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
    mobile.on('pageerror',lambda e:errors.append(str(e)))
    mobile.set_content(html,wait_until='load')
    assert mobile.locator('#gdb').is_visible()
    assert mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1'), 'Horizontales Scrollen'
    mobile.screenshot(path='/mnt/data/AsthmaKompass_mobil.png',full_page=True)
    assert not errors,errors
    print(f'OK: Browser-UI im isolierten HTML-Test, Desktop, Mobil, {len(page.locator("#source-list a").all())} Quellen, GdB 10/30/40/50, Gleichstellung, Suche, Merkliste, Update, JS-Fehlerfreiheit')
    browser.close()
