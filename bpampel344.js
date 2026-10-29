'use strict';
/* Asthma 3.4.4: Nichtdiagnostische Farbzuordnung der einzelnen Blutdruckwerte. */
(()=>{
 const codes={
  low:{label:'Niedrig / Beschwerden beachten',color:'#2563a4'},
  good:{label:'Im Orientierungsbereich',color:'#19764d'},
  mild:{label:'Leicht erhöht',color:'#9a7000'},
  high:{label:'Erhöht',color:'#ba5716'},
  veryhigh:{label:'Deutlich erhöht',color:'#b22c3b'},
  urgent:{label:'Sehr hoch – dringend ärztlich prüfen',color:'#8a2144'},
  unknown:{label:'Nicht bewertet',color:'#657681'}
 };
 const valid=v=>v!==''&&v!==null&&v!==undefined&&Number.isFinite(Number(v))&&Number(v)>0;
 const levels=['low','good','mild','high','veryhigh','urgent'];
 function classifyPart(value,part){
  if(!valid(value))return {key:'unknown',...codes.unknown};
  const v=Number(value),s=part==='systolic';
  const key=v>=(s?180:120)?'urgent':v>=(s?160:100)?'veryhigh':v>=(s?140:90)?'high':v>=(s?130:85)?'mild':v<(s?100:60)?'low':'good';
  return {key,...codes[key]};
 }
 function classify(sys,dia){
  if(!valid(sys)||!valid(dia))return {key:'unknown',...codes.unknown};
  const parts=[classifyPart(sys,'systolic'),classifyPart(dia,'diastolic')];
  let key=parts.some(p=>p.key==='urgent')?'urgent':parts.some(p=>p.key==='veryhigh')?'veryhigh':parts.some(p=>p.key==='high')?'high':parts.some(p=>p.key==='mild')?'mild':parts.some(p=>p.key==='low')?'low':'good';
  return {key,...codes[key]};
 }
 window.ASTHMA_BPA344=Object.freeze({classify,classifyPart,codes,version:'3.4.4'});
})();
