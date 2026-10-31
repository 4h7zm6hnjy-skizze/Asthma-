'use strict';
/* PneumoPro 3.7.3: sichere manuelle Nachpruefung im selben Befund, ohne Datenversand.
   Die Originalaufnahme wird ausschliesslich angezeigt, nie veraendert. */
(function(root){
  let url='', section=null, rowCodes=[], currentCode='', zoom=1.5;
  const $=id=>document.getElementById(id);
  const make=(tag,cl,txt)=>{const x=document.createElement(tag);if(cl)x.className=cl;if(txt!==undefined)x.textContent=txt;return x;};
  const fieldKeys=['predicted','actual','percent','z'];
  const fieldNames=['Soll','Ist','% vom Soll','Z-Score'];
  const numeric=s=>{const v=String(s||'').trim();if(!v)return null;const norm=v.replace(',','.');return /^[+-]?\d{1,4}(?:\.\d{1,4})?$/.test(norm)?Number(norm):NaN;};
  function rows(){return [...document.querySelectorAll('#li365-table tr[data-code]')];}
  const hasValue=(row,key)=>{const v=numeric(row.querySelector('input[data-field="'+key+'"]')?.value);return v!==null&&Number.isFinite(v);};
  function statusOf(row){if(row.dataset.status==='manual')return 'manual';return hasValue(row,'actual')&&hasValue(row,'predicted')&&hasValue(row,'percent')?'complete':hasValue(row,'actual')||hasValue(row,'predicted')?'partial':'missing';}
  function count(){const rs=rows();const result={complete:0,partial:0,missing:0,manual:0};for(const r of rs)result[statusOf(r)]++;return result;}
  function caption(row){const label=row.querySelector('th')?.childNodes?.[0]?.textContent?.trim()||row.dataset.code;const status=statusOf(row);const desc={complete:'OCR: vollstaendig, noch pruefen',partial:'Teilweise erkannt',missing:'Nicht erkannt',manual:'Manuell abgeglichen'};return label+' — '+desc[status];}
  function updateSummary(){if(!section)return;const n=count();$('rv373-summary').textContent=`Direkt am Original nachpruefen: ${n.partial+n.missing} offene Zeilen · ${n.manual} manuell bestaetigt`;
    const list=$('rv373-select');const old=list.value;list.replaceChildren();const rs=rows();for(const row of [...rs.filter(r=>['missing','partial'].includes(statusOf(r))),...rs.filter(r=>!['missing','partial'].includes(statusOf(r)))]){const opt=new Option(caption(row),row.dataset.code);list.append(opt);}list.value=rs.some(r=>r.dataset.code===old)?old:(list.options[0]?.value||'');
  }
  function loadRow(code){const row=rows().find(r=>r.dataset.code===code);if(!row)return;currentCode=code;const title=row.querySelector('th')?.childNodes?.[0]?.textContent?.trim()||code;$('rv373-current').textContent=title;
    const inputs=$('rv373-fields').querySelectorAll('input[data-field]');for(const inp of inputs){inp.value=row.querySelector('input[data-field="'+inp.dataset.field+'"]')?.value||'';}
    $('rv373-verified').checked=false;$('rv373-result').textContent='Zahlen zuerst mit dem Originalfoto vergleichen.';
  }
  function apply(){const row=rows().find(r=>r.dataset.code===currentCode);if(!row)return;
    const output=$('rv373-result');if(!$('rv373-verified').checked){output.textContent='Bitte bestaetigen, dass du alle angegebenen Werte am Original verglichen hast.';return;}
    const inputs=[...$('rv373-fields').querySelectorAll('input[data-field]')],values={};for(const inp of inputs){const n=numeric(inp.value);if(Number.isNaN(n)){output.textContent='Ungueltige Zahl: '+inp.getAttribute('aria-label');return;}values[inp.dataset.field]=n;}
    if(!Object.values(values).some(v=>v!==null)){output.textContent='Mindestens einen abgelesenen Wert angeben.';return;}
    if(values.predicted!==null&&values.predicted<=0||values.actual!==null&&values.actual<0||values.percent!==null&&(values.percent<0||values.percent>400)||values.z!==null&&Math.abs(values.z)>15){output.textContent='Der eingetragene Wert ist nicht plausibel. Bitte Original und Dezimalzeichen pruefen.';return;}
    if(values.predicted!==null&&values.actual!==null&&values.percent!==null){const expected=100*values.actual/values.predicted;if(Math.abs(expected-values.percent)>Math.max(3,values.percent*.04)){output.textContent='Soll/Ist/% widersprechen sich rechnerisch. Nicht uebernommen.';return;}}
    for(const inp of inputs){const target=row.querySelector('input[data-field="'+inp.dataset.field+'"]');if(target)target.value=inp.value.trim();}
    row.dataset.status='manual';let note=row.querySelector('.li371-status');if(note)note.textContent='Manuell am Original abgeglichen';
    output.textContent='Diese Zeile wurde in die Prueftabelle uebertragen. Endgueltiges Speichern erfolgt erst mit der bestehenden Bestaetigung weiter unten.';
    $('rv373-verified').checked=false;updateSummary();$('rv373-select').value=currentCode;
  }
  function next(){const all=rows().filter(r=>['missing','partial'].includes(statusOf(r)));if(!all.length){$('rv373-result').textContent='Alle Zeilen besitzen Werte oder wurden manuell geprueft. Vor dem Speichern auch Datum und Messphase kontrollieren.';return;}const nextRow=all.find(r=>r.dataset.code!==currentCode)||all[0];$('rv373-select').value=nextRow.dataset.code;loadRow(nextRow.dataset.code);}
  function setZoom(z){zoom=Math.min(3.5,Math.max(1,z));const img=$('rv373-photo');if(img)img.style.width=Math.round(zoom*100)+'%';$('rv373-level').textContent=Math.round(zoom*100)+' %';}
  function makeUI(){if(section)return;const review=$('li365-review'),table=$('li365-table');if(!review||!table)return;
    section=make('details','rv373');section.id='rv373';const summary=make('summary');summary.id='rv373-summary';section.append(summary);
    const main=make('div','rv373-body');const info=make('p','','Schritt 1: Wähle eine noch offene Zeile. Schritt 2: Vergleiche die Zahlen mit dem unveraenderten Originalfoto. Schritt 3: Bestaetige nur Werte, die du wirklich ablesen kannst.');main.append(info);
    const controls=make('div','rv373-toolbar');for(const [label,fn] of [['Verkleinern',()=>setZoom(zoom-.4)],['Vergroessern',()=>setZoom(zoom+.4)],['Zur Tabelle',()=>{const v=$('rv373-view'),img=$('rv373-photo');v.scrollTop=Math.max(0,img.clientHeight*.49);}]]){const b=make('button','',label);b.type='button';b.onclick=fn;controls.append(b);}const level=make('span','','150 %');level.id='rv373-level';controls.append(level);main.append(controls);
    const viewport=make('div','rv373-viewport');viewport.id='rv373-view';const img=make('img');img.id='rv373-photo';img.alt='Unveraendertes Foto des Lungenfunktionstests zum Vergleich';img.onload=()=>{setZoom(1.5);viewport.scrollTop=Math.max(0,img.clientHeight*.49);};viewport.append(img);main.append(viewport);
    const selectLabel=make('label','','Messwertzeile auswaehlen');const select=make('select');select.id='rv373-select';select.onchange=v=>loadRow(select.value);selectLabel.append(select);main.append(selectLabel);
    const h=make('h4');h.id='rv373-current';main.append(h);const fields=make('div','rv373-fields');fields.id='rv373-fields';for(let i=0;i<fieldKeys.length;i++){const label=make('label','',fieldNames[i]);const input=make('input');input.type='text';input.inputMode='decimal';input.autocomplete='off';input.dataset.field=fieldKeys[i];input.setAttribute('aria-label',fieldNames[i]);label.append(input);fields.append(label);}main.append(fields);
    const confirm=make('label','rv373-check');const check=make('input');check.type='checkbox';check.id='rv373-verified';confirm.append(check,document.createTextNode('Ich habe die eingetragenen Zahlen mit dem Originalfoto verglichen.'));main.append(confirm);
    const buttons=make('div','rv373-toolbar');const applyBtn=make('button','','Pruefte Werte uebernehmen');applyBtn.type='button';applyBtn.onclick=apply;const nextBtn=make('button','','Naechster offener Wert');nextBtn.type='button';nextBtn.onclick=next;buttons.append(applyBtn,nextBtn);main.append(buttons);
    const output=make('p');output.id='rv373-result';output.setAttribute('role','status');main.append(output);
    main.append(make('p','rv373-muted','Werte werden erst mit „Geprueften Test verschluesselt speichern“ am Ende des Imports gespeichert. Fehlende Angaben bleiben leer; keine automatischen Schaetzungen.'));section.append(main);review.insertBefore(section,table);
    const style=make('style');style.textContent=`#rv373{margin:14px 0;border:1px solid #a9cdd9;border-radius:12px;padding:10px;background:#eaf6f9}#rv373 summary{cursor:pointer;font-weight:750;color:#125368;padding:5px;line-height:1.4}#rv373 .rv373-body{min-width:0}#rv373 .rv373-viewport{height:min(63vh,550px);overflow:auto;background:#e0e7ea;border:1px solid #aec9d4;border-radius:9px;overscroll-behavior:contain;touch-action:pan-x pan-y}#rv373-photo{display:block;width:150%;height:auto;max-width:none}#rv373 .rv373-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin:9px 0}#rv373 button{font-size:14px;min-height:42px}#rv373 .rv373-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#rv373 .rv373-fields label{font-weight:650;min-width:0}#rv373 .rv373-fields input{width:100%;min-width:0;box-sizing:border-box}#rv373 .rv373-check{display:flex;gap:8px;align-items:flex-start;padding:10px;background:#fff;border:1px solid #9ec6d0;border-radius:7px}#rv373 .rv373-check input{width:20px;height:20px;flex-shrink:0}#rv373 .rv373-muted{font-size:.85rem;color:#536e7b}#rv373-result{min-height:2.2em}#li365 tr[data-status=manual]>th:first-child{border-left:4px solid #6b63a4}#li365 tr[data-status=manual] .li371-status{color:#554c8e}`;document.head.append(style);
  }
  function attach(blob){if(!(blob instanceof Blob))return;makeUI();if(!section)return;reset();url=URL.createObjectURL(blob);$('rv373-photo').src=url;updateSummary();const sel=$('rv373-select');if(sel.value)loadRow(sel.value);}
  function reset(){if(url){URL.revokeObjectURL(url);url='';}if(section){section.open=false;const img=$('rv373-photo');img.removeAttribute('src');$('rv373-result').textContent='';}currentCode='';}
  root.PNEUMOPRO_REVIEW373=Object.freeze({attach,reset});
})(typeof window!=='undefined'?window:globalThis);
