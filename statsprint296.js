'use strict';
/* Asthma 2.9.6 – isolated print view for iOS Safari / Home Screen PWA.
 * Uses the already calculated DOM report; never reads, sends, or stores health data.
 * Existing statistics calculation and encrypted storage remain untouched.
 */
(()=>{
  // This script is loaded once inside the health app and once in the print-only page.
  if(document.getElementById('as296-print-document')){
    const printButton=document.getElementById('as296-print-now');
    printButton?.addEventListener('click',()=>{
      document.getElementById('as296-print-help').textContent='Falls der iPhone-Druckdialog nicht erscheint: In Safari „Teilen“ → „Drucken“ wählen und anschließend als PDF in „Dateien“ sichern.';
      try{window.print()}catch(e){document.getElementById('as296-print-help').textContent='Druckdialog nicht verfügbar: In Safari „Teilen“ → „Drucken“ wählen.';}
    });
    document.getElementById('as296-close')?.addEventListener('click',()=>window.close());
    return;
  }
  const $=id=>document.getElementById(id);
  if(!$('stats25-report')||!$('stats25-print')||!$('stats25-pdf'))return;
  const labels={old:'Bisherige Statistik',spo2:'Blutsauerstoff',bp:'Blutdruck',pulse:'Puls',weight:'Gewicht',pef:'Peak-Flow',lung:'Lungenfunktion'};
  const ids=Object.keys(labels);
  const style=`
    :root{font-family:-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif;color:#203949;background:#edf4f6}
    *{box-sizing:border-box}body{margin:0}button{font:inherit;cursor:pointer}
    #as296-toolbar{padding:16px 20px;background:#103f55;color:white;position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;align-items:center;gap:12px}
    #as296-toolbar h1{font-size:18px;margin:0;flex:1 1 190px}#as296-toolbar button{min-height:44px;padding:10px 17px;border:0;border-radius:9px;background:#f7ffff;color:#123f51;font-weight:750}
    #as296-print-help{font-size:13px;line-height:1.6;padding:13px 18px;margin:0 auto;max-width:210mm;background:#e3f0f3;border-radius:8px}
    #as296-print-document{padding:8px 0 40px}#as296-report{max-width:210mm;margin:14px auto 0;padding:16mm 14mm;background:white;color:#142e40;box-shadow:0 6px 25px #24475d25;overflow-wrap:anywhere}
    #as296-report h2{font-size:21px}#as296-report h3{font-size:17px}#as296-report h4{font-size:14px}
    .stats25-heading{border-bottom:2px solid #176f83;padding-bottom:12px}.stats25-heading h2{margin:6px 0;color:#123b52}.stats25-meta{font-size:11px;letter-spacing:.025em;color:#176f83}
    .stats25-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:14px 0 20px}
    .stats25-kpi{border:1px solid #d5e5e6;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:5px;min-width:0}
    .stats25-label,.stats25-kpi small{font-size:11px;color:#627d89}.stats25-figure{font-size:22px;color:#123b52}
    .stats25-section{padding:10px 0;border-bottom:1px solid #d9e4e9;break-inside:avoid-page}.stats25-section h3{margin:6px 0 10px;color:#123b52}
    .stats25-line{display:flex;justify-content:space-between;gap:12px;border-bottom:1px dotted #dce6e8;padding:5px 0;font-size:12px}.stats25-line strong{text-align:right;max-width:62%;overflow-wrap:anywhere}
    .stats25-small-list{font-size:12px;line-height:1.5}.stats25-muted,.stats25-footer{font-size:11px;color:#667e89}
    .a281-report-logo{max-width:170px;height:auto}.s292-appendix{border-top:3px solid #176f83;padding-top:15px;margin-top:24px}
    .s292-appendix h2{font-size:21px}.s292-note{color:#56737e;font-size:12px;line-height:1.5}
    .s292-category{padding:12px 0;margin:12px 0 22px}.s292-category h3{font-size:18px;color:#123b52}.s292-category h4{font-size:14px;color:#245d72}
    .s292-summary{display:flex;flex-wrap:wrap;gap:5px 14px;border-radius:8px;background:#eef6f7;padding:10px;font-size:12px}
    .s292-summary>*{flex:1 1 170px;min-width:0}.s292-chart-box{border:1px solid #d5e5e9;border-radius:9px;padding:6px;margin:9px 0 14px;break-inside:avoid-page}
    .s292-chart-box svg{display:block;width:100%;height:auto;max-height:240px}.s292-legend{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:11px;color:#3d5d6d}
    .s292-legend>span{display:flex;align-items:center;gap:5px}.s292-dot{height:8px;width:8px;display:inline-block;border-radius:50%}
    .s292-table{border-collapse:collapse;width:100%;font-size:10px}.s292-table th,.s292-table td{padding:4px 6px;text-align:left;border-bottom:1px solid #d9e7eb;overflow-wrap:anywhere}
    .s292-table thead{background:#eaf5f6}.s292-empty{background:#f5f9fa;padding:10px;font-size:12px}.s292-disclaimer{font-size:11px;border-top:1px solid #d4e0e3;padding-top:12px}
    @media(max-width:550px){#as296-report{padding:15px;box-shadow:none;margin:0}.stats25-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}.stats25-line{flex-direction:column;gap:2px}.stats25-line strong{text-align:left;max-width:100%}}
    @media print{@page{size:A4 portrait;margin:12mm}html,body{background:white!important}#as296-toolbar,#as296-print-help{display:none!important}#as296-print-document{padding:0!important}
      #as296-report{max-width:none!important;box-shadow:none!important;padding:0!important;margin:0!important}
      .stats25-tiles{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      .stats25-line{flex-direction:row!important}.stats25-line strong{text-align:right!important;max-width:62%!important}
      .s292-appendix{break-before:page;page-break-before:always}
      .s292-category{break-before:page;page-break-before:always}
      .s292-appendix .s292-category:first-of-type{break-before:auto;page-break-before:auto}
      .s292-appendix h2{break-after:avoid}.s292-chart-box, .s292-table tr{break-inside:avoid}
      .s292-table thead{display:table-header-group}
    }
  `;
  function selection(){
    const options=$('statsplus292-options');
    const result={};
    for(const id of ids){const cb=[...(options?.querySelectorAll('input[type="checkbox"]')||[])].find(x=>x.value===id);result[id]=cb?cb.checked:(id==='old');}
    return result;
  }
  function cleanClone(picks){
    const source=$('stats25-report');
    if(!source.querySelector('.stats25-heading'))throw Error('Bitte zuerst auf „Statistik berechnen“ tippen.');
    if(window.__s292Building)throw Error('Die Diagramme werden noch erstellt. Bitte erneut versuchen.');
    const currentKey=window.ASTHMA_STATS25?.range?.()?.key;
    const reportKey=window.ASTHMA_STATSP292?.getLastKey?.();
    if(currentKey&&reportKey&&currentKey!==reportKey)throw Error('Der Zeitraum wurde geändert. Bitte die Statistik neu berechnen.');
    if(ids.some(id=>id!=='old'&&picks[id])&&!source.querySelector('#statsplus292-appendix'))throw Error('Die zusätzlichen Diagramme fehlen noch. Bitte die Statistik neu berechnen.');
    const cloned=source.cloneNode(true);
    // Remove all categories not selected from DOM itself (not just visually hide).
    const appendix=cloned.querySelector('#statsplus292-appendix');
    if(!Object.entries(picks).some(([id,yes])=>id!=='old'&&yes))appendix?.remove();
    else if(appendix){
      for(const item of [...appendix.querySelectorAll('[data-s292-kind]')])if(!picks[item.dataset.s292Kind])item.remove();
    }
    if(!picks.old){for(const child of [...cloned.children])if(child.id!=='statsplus292-appendix')child.remove();}
    // Ensure brand images resolve even when the preview is a new about:blank document.
    for(const img of cloned.querySelectorAll('img[src]'))img.src=new URL(img.getAttribute('src'),document.baseURI).href;
    cloned.removeAttribute('id');cloned.id='as296-report';
    cloned.classList.remove('s292-custom-print');
    cloned.querySelectorAll('[hidden]').forEach(el=>el.remove()); // These elements should not appear in selected print content.
    return cloned;
  }
  function setStatus(s){const status=$('stats25-status');if(status)status.textContent=s;}
  function renderView(picks){
    const popup=window.open('','_blank');
    if(!popup){setStatus('Die Druckansicht wurde vom iPhone blockiert. In Safari das Pop-up-Blockieren für diese Website deaktivieren und erneut antippen. Keine Daten wurden verändert.');return;}
    try{
      const clone=cleanClone(picks);
      const doc=popup.document;
      doc.open();doc.write('<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Asthma – Druckansicht</title></head><body></body></html>');doc.close();
      const st=doc.createElement('style');st.textContent=style;doc.head.append(st);
      const wrapper=doc.createElement('div');wrapper.id='as296-print-document';
      const bar=doc.createElement('header');bar.id='as296-toolbar';
      const heading=doc.createElement('h1');heading.textContent='Asthma · Druckansicht';
      const print=doc.createElement('button');print.id='as296-print-now';print.type='button';print.textContent='Drucken / PDF';
      const close=doc.createElement('button');close.id='as296-close';close.type='button';close.textContent='Schließen';
      bar.append(heading,print,close);
      const hint=doc.createElement('p');hint.id='as296-print-help';hint.textContent='Nur die ausgewählten Bereiche sind in dieser Druckansicht enthalten. Auf dem iPhone „Drucken / PDF“ antippen; zum PDF-Sichern im Druckdialog die Vorschau öffnen und über „Teilen“ in „Dateien“ sichern. Gesundheitsdaten im PDF sind unverschlüsselt.';
      const reportContainer=doc.createElement('main');reportContainer.append(doc.importNode(clone,true));
      wrapper.append(bar,hint,reportContainer);doc.body.append(wrapper);
      const js=doc.createElement('script');js.src=new URL('statsprint296.js',document.baseURI).href;doc.body.append(js);
      setStatus('Druckansicht geöffnet. Nur ausgewählte Bereiche werden übernommen.');
      popup.focus();
    }catch(e){try{popup.close()}catch{}setStatus('Druckansicht konnte nicht vorbereitet werden: '+(e?.message||e));}
  }
  // Capture BEFORE the old print handlers so that no legacy print CSS can hide the report.
  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('#stats25-print,#stats25-pdf');if(!btn)return;
    event.preventDefault();event.stopImmediatePropagation();
    const picks=selection();
    if(!Object.values(picks).some(Boolean)){setStatus('Bitte mindestens einen Druckbereich auswählen.');return;}
    if(!$('stats25-report')?.querySelector('.stats25-heading')){setStatus('Bitte zuerst „Statistik berechnen“ antippen.');return;}
    if(window.__s292Building){setStatus('Bericht wird noch berechnet. Bitte danach erneut drucken.');return;}
    if(!confirm('Der Ausdruck bzw. die PDF-Druckansicht enthält unverschlüsselte Gesundheitsdaten. Nur auf dem eigenen Gerät öffnen?'))return;
    renderView(picks);
  },true);
})();
