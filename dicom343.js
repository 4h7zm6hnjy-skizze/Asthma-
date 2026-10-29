'use strict';
/* Read-only, offline DICOM preview. Not a calibrated medical diagnostic viewer. */
(()=>{
 const decoder=new TextDecoder('latin1');
 const known={0x00020010:'syntax',0x00280002:'samples',0x00280004:'photo',0x00280006:'planar',0x00280008:'frames',0x00280010:'rows',0x00280011:'cols',0x00280100:'bits',0x00280101:'stored',0x00280102:'highbit',0x00280103:'signed',0x00281050:'center',0x00281051:'width',0x00281052:'intercept',0x00281053:'slope',0x7fe00010:'pixels',0x00080060:'modality'};
 const longVR=new Set(['OB','OD','OF','OL','OV','OW','SQ','UC','UR','UT','UN']);
 const trim=s=>s.replace(/\0/g,'').trim();
 const decimal=x=>{const n=Number(String(x||'').split('\\')[0]);return Number.isFinite(n)?n:null};
 async function parse(file){
  if(file.size>45*1024*1024)throw Error('DICOM größer als 45 MB. Große Serien bitte in kleinere Teile zerlegen.');
  const buf=await file.arrayBuffer(),v=new DataView(buf),len=buf.byteLength;
  if(len<144)throw Error('Datei ist zu kurz für ein DICOM-Bild.');
  let pos=128;
  if(decoder.decode(new Uint8Array(buf,128,4))!=='DICM')throw Error('Keine DICOM-Datei mit gültigem Dateikopf. DICOMDIR ist nur ein Verzeichnis, kein Bild.');
  pos=132;let syntax='1.2.840.10008.1.2.1',explicit=true,little=true;
  const d={frames:1,samples:1,planar:0,photo:'MONOCHROME2',slope:1,intercept:0,signed:0};
  let pixel=null;
  const number=(off,sz,signed)=>sz===2?(signed?v.getInt16(off,little):v.getUint16(off,little)):(signed?v.getInt32(off,little):v.getUint32(off,little));
  for(let iter=0;pos+8<=len&&iter<100000;iter++){
   let group=v.getUint16(pos,little);if(group!==0x0002&&syntax==='1.2.840.10008.1.2.2')little=false;group=v.getUint16(pos,little);const element=v.getUint16(pos+2,little);const tag=group*65536+element;pos+=4;
   if(group===0x0002){explicit=true;little=true;}
   else if(group!==0x0002){
    if(syntax==='1.2.840.10008.1.2')explicit=false;
    if(syntax==='1.2.840.10008.1.2.2')little=false;
   }
   let vr='',size=0;
   if(explicit){vr=decoder.decode(new Uint8Array(buf,pos,2));pos+=2;if(longVR.has(vr)){pos+=2;size=v.getUint32(pos,little);pos+=4;}else{size=v.getUint16(pos,little);pos+=2;}}
   else{size=v.getUint32(pos,little);pos+=4;}
   if(pos>len||size!==0xffffffff&&pos+size>len)throw Error('DICOM-Datei beschädigt oder unerwartetes Datenende.');
   if(tag===0x7fe00010){pixel={pos,size};break;}
   if(size===0xffffffff){
    // Sequence of undefined length: traverse explicit item delimiters, not arbitrary bytes.
    let guard=0,depth=0;
    while(pos+8<=len&&guard++<100000){const g=v.getUint16(pos,little),e=v.getUint16(pos+2,little),n=v.getUint32(pos+4,little);pos+=8;
     if(g===0xfffe&&e===0xe0dd&&depth===0)break;
     if(g===0xfffe&&e===0xe00d) {if(depth>0)depth--;continue;}
     if(n===0xffffffff){depth++;continue;}
     if(pos+n>len)throw Error('Ungültige DICOM-Sequenz.');pos+=n;
    }
    continue;
   }
   const k=known[tag];if(k){
    const s=(vr==='US'||vr==='SS'||k==='rows'||k==='cols'||k==='bits'||k==='signed'||k==='samples'||k==='planar'||k==='stored'||k==='highbit')&&size===2?number(pos,2,vr==='SS'):
    decoder.decode(new Uint8Array(buf,pos,Math.min(size,128)));
    d[k]=typeof s==='string'?trim(s):s;
    if(k==='syntax')syntax=d.syntax;
   }
   pos+=size;
  }
  if(!pixel)throw Error('DICOM enthält keine auslesbaren Bildpixel.');
  Object.assign(d,{buffer:buf,pixel,syntax,frames:Math.max(1,Math.min(1000,parseInt(d.frames,10)||1)),rows:Number(d.rows),cols:Number(d.cols),bits:Number(d.bits),samples:Number(d.samples),signed:Number(d.signed||0),slope:decimal(d.slope)??1,intercept:decimal(d.intercept)??0,center:decimal(d.center),width:decimal(d.width)});
  if(!d.rows||!d.cols||d.rows>8192||d.cols>8192||d.rows*d.cols>16000000)throw Error('DICOM-Bildabmessungen nicht unterstützt.');
  const allowed=['1.2.840.10008.1.2','1.2.840.10008.1.2.1','1.2.840.10008.1.2.2'];
  if(!allowed.includes(syntax))throw Error('Komprimiertes DICOM ('+syntax+') kann hier nicht als Bild angezeigt werden. Originaldatei bleibt erhalten; bitte DICOM in unkomprimiertes DICOM oder PNG/JPEG exportieren.');
  if(![8,16].includes(d.bits)||![1,3].includes(d.samples)||d.samples===3&&d.bits!==8||Number(d.stored||d.bits)>d.bits||Number(d.stored||d.bits)<1)throw Error('DICOM-Pixeltyp nicht unterstützt. Original bleibt erhalten.');
  const perFrame=d.rows*d.cols*d.samples*(d.bits/8);
  if(perFrame*d.frames>pixel.size)throw Error('Die gespeicherten DICOM-Pixel reichen nicht für alle Bilder.');
  d.perFrame=perFrame;
  return d;
 }
 function render(d,canvas,frame=0,windowLevel=null,windowWidth=null){
  frame=Math.max(0,Math.min(d.frames-1,Math.floor(frame)));
  const {rows,cols,samples,photo,pixel,buffer,bits,signed,perFrame}=d;
  const storedBits=Number(d.stored)||bits,shift=Math.max(0,(Number(d.highbit??(storedBits-1))+1)-storedBits);
  const readRaw=i=>{const base=bits===16?v.getUint16(i*2,d.syntax!=='1.2.840.10008.1.2.2'):v.getUint8(i);let raw=(base>>>shift);if(storedBits<bits)raw=raw&((1<<storedBits)-1);if(signed){const sign=2**(storedBits-1),full=2**storedBits;if(raw>=sign)raw-=full;}return raw;};
  const v=new DataView(buffer,pixel.pos+frame*perFrame,perFrame);
  canvas.width=cols;canvas.height=rows;const context=canvas.getContext('2d',{willReadFrequently:false});const img=context.createImageData(cols,rows),pixels=img.data;
  if(samples===3){if(!/^RGB/i.test(photo))throw Error('DICOM-Farbformat '+photo+' wird nicht unterstützt.');const planar=d.planar===1;for(let i=0;i<rows*cols;i++){const p=i*4;for(let c=0;c<3;c++)pixels[p+c]=v.getUint8(planar?c*rows*cols+i:3*i+c);pixels[p+3]=255;}}
  else{
   let wl=Number(windowLevel??d.center),ww=Number(windowWidth??d.width);
   if(!Number.isFinite(wl)||!Number.isFinite(ww)||ww<=0){
    let lo=Infinity,hi=-Infinity;for(let i=0;i<rows*cols;i++){const raw=readRaw(i);const val=raw*d.slope+d.intercept;if(val<lo)lo=val;if(val>hi)hi=val;}
    wl=(lo+hi)/2;ww=Math.max(1,hi-lo);
   }
   const lower=wl-ww/2,upper=wl+ww/2;
   for(let i=0;i<rows*cols;i++){const raw=readRaw(i);const hu=raw*d.slope+d.intercept;let grey=Math.max(0,Math.min(255,Math.round((hu-lower)*255/(upper-lower))));if(photo==='MONOCHROME1')grey=255-grey;const p=i*4;pixels[p]=pixels[p+1]=pixels[p+2]=grey;pixels[p+3]=255;}
  }
  context.putImageData(img,0,0);
  return {frame:frame+1,count:d.frames,windowCenter:windowLevel??d.center,windowWidth:windowWidth??d.width};
 }
 window.ASTHMA_DICOM343=Object.freeze({parse,render});
})();
