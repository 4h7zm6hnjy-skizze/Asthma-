'use strict';
/* Best-effort self-contained offline reader for PDFs with an accessible text layer.
   Not a replacement for PDF.js, not a scanner for image-only PDFs. No fetch or uploads. */
(()=>{
 const $=id=>document.getElementById(id),fileInput=$('pdf20-file'),btn=$('pdf20-extract'),msg=$('pdf20-status'),open=$('pdf20-open'),preview=$('pdf20-preview');
 if(!fileInput||!btn)return;
 let file=null,url=null;
 const latin1 = data => {if(typeof TextDecoder==='function')return new TextDecoder('iso-8859-1').decode(data);return Array.from(data,x=>String.fromCharCode(x)).join('')};
 const bytes = s => Uint8Array.from(s,c=>c.charCodeAt(0)&255);
 const decodeLiteral=s=>s.replace(/\\([0-7]{1,3}|[nrtbf()\\])/g,(_,code)=>{
   if(/^[0-7]+$/.test(code))return String.fromCharCode(parseInt(code,8));return {'n':'\n','r':'\r','t':'\t','b':'\b','f':'\f','(':'(',')':')','\\':'\\'}[code]||code
 });
 function ascii85(data){
  const src=data.replace(/\s+/g,'').replace(/^<~/,'').replace(/~>.*$/s,'');const output=[];let part=[];
  function emit(){const size=part.length;if(size<2)return;const chars=part.concat(Array(5-size).fill('u'));let value=0;
   for(const ch of chars)value=value*85+(ch.charCodeAt(0)-33);
   if(!Number.isSafeInteger(value)||value<0||value>0xffffffff)throw Error('Ungültige ASCII85-Zeichen');
   const b=[(value/16777216)&255,(value/65536)&255,(value/256)&255,value&255];output.push(...b.slice(0,size===5?4:size-1));part=[];
  }
  for(const ch of src){if(ch==='z'&&part.length===0){output.push(0,0,0,0);continue}if(ch<'!'||ch>'u')continue;part.push(ch);if(part.length===5)emit();}if(part.length)emit();
  let result='';for(let i=0;i<output.length;i+=8192)result+=String.fromCharCode(...output.slice(i,i+8192));return result;
 }
 async function inflate(data){if(!('DecompressionStream' in window))throw Error('Der Browser unterstützt keine lokale PDF-Dekomprimierung.');
  const ds=new DecompressionStream('deflate'),writer=ds.writable.getWriter();const p=new Response(ds.readable).arrayBuffer();await writer.write(bytes(data));await writer.close();return latin1(new Uint8Array(await p));}
 async function getText(src){if(src.byteLength>20*1024*1024)throw Error('PDF über 20 MB.');let pdf=latin1(new Uint8Array(src));if(!pdf.startsWith('%PDF-'))throw Error('Keine gültige PDF-Datei.');const chunks=[];
  // Parser handles basic unencrypted content streams, including FlateDecode. Scanned/image PDFs have no text layer.
  const objects=[...pdf.matchAll(/\d+\s+\d+\s+obj\b([\s\S]*?)endobj/g)].slice(0,1500);
  for(const ob of objects){const obj=ob[1];if(/\/Encrypt\b/.test(obj))throw Error('Verschlüsselte PDF bitte zuerst entsperren.');const match=obj.match(/\bstream\r?\n([\s\S]*?)\r?\n?endstream/);if(!match)continue;
   let content=match[1];try{const dict=obj.slice(0,match.index);if(/\/ASCII85Decode\b/.test(dict))content=ascii85(content);
    if(/\/FlateDecode\b/.test(dict))content=await inflate(content);
    else if(/\/Filter\b/.test(dict)&&!/\/ASCII85Decode\b/.test(dict))continue;}catch{continue}
   // Match BT ... ET blocks and PDF show-text operations. Convert only elementary PDF strings.
   for(const t of content.matchAll(/\bBT\b([\s\S]*?)\bET\b/g)){
    const words=[];for(const m of t[1].matchAll(/(\((?:\\.|[^\\)])*\))\s*Tj\b|\[([\s\S]*?)\]\s*TJ\b/g)){
      if(m[1])words.push(decodeLiteral(m[1].slice(1,-1)));
      else {const parts=[...m[2].matchAll(/\((?:\\.|[^\\)])*\)/g)].map(z=>decodeLiteral(z[0].slice(1,-1)));words.push(parts.join(''))}
    }if(words.length)chunks.push(words.join(' '));
   }
  }
  const result=chunks.join('\n').replace(/[^\S\r\n]+/g,' ').trim();return result.slice(0,30000);
 }
 function release(){if(url){URL.revokeObjectURL(url);url=null}};
 fileInput.addEventListener('change',()=>{const selected=fileInput.files?.[0];if(!selected)return;if(!/\.pdf$/i.test(selected.name)&&selected.type!=='application/pdf'){msg.textContent='Bitte eine PDF-Datei auswählen.';return;}file=selected;release();url=URL.createObjectURL(file);preview.hidden=false;btn.disabled=false;msg.textContent='PDF ausgewählt: '+file.name+'. Nur digitale Text-PDFs lassen sich ohne zusätzlichen OCR-Motor lokal auslesen.';});
 open.addEventListener('click',()=>{if(url)window.open(url,'_blank','noopener,noreferrer')});
 btn.addEventListener('click',async()=>{if(!file)return;btn.disabled=true;msg.textContent='Suche lokal lesbaren PDF-Text …';try{const text=await getText(await file.arrayBuffer());
   if(text.length<12)throw Error('Diese PDF hat keine lesbare Textebene. Bei gescannten PDFs einen Screenshot erstellen und mit iPhone Live Text erfassen.');
   const field=$('scan-raw');field.closest('details').open=true;field.value=text;msg.textContent='Text gefunden ('+text.length+' Zeichen). Bitte Zeilen und Einheiten mit dem Original vergleichen.';
   $('scan-reparse').click();
  }catch(e){msg.textContent='Lokales PDF-Auslesen: '+e.message}finally{btn.disabled=false}});
 window.addEventListener('pagehide',release);
 window.__asthmaPDF20Test=Object.freeze({getText,decodeLiteral});
})();
