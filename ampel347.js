'use strict';
/* PneumoPro 3.4.7: erklärende Orientierung statt medizinischer Grenzwert-Festlegung. */
(()=>{
 const valid=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
 const num=v=>valid(v)?Number(v):null;
 const tone={low:{key:'low',label:'Niedrig – prüfen',color:'#2563a4'},good:{key:'good',label:'Orientierungsbereich',color:'#19764d'},mild:{key:'mild',label:'Grenzbereich',color:'#946700'},high:{key:'high',label:'Auffällig – prüfen',color:'#bc5b13'},veryhigh:{key:'veryhigh',label:'Deutlich auffällig',color:'#b22c3b'},unknown:{key:'unknown',label:'Ohne Einstufung',color:'#596b76'}};
 const choose=(code,more)=>({...tone[code],...(more||{})});
 function heightCm(value){const v=num(value);return v!==null&&v>=90&&v<=250?v:null;}
 function kg(value){const v=num(value);return v!==null&&v>=1&&v<=500?v:null;}
 function body(height,weight){const h=heightCm(height),w=kg(weight);if(h===null||w===null)return null;const m=h/100,bmi=w/(m*m),bsa=Math.sqrt(h*w/3600),low=18.5*m*m,high=25*m*m;
  return {heightCm:h,weightKg:w,bmi,bsa,weightMin:low,weightMax:high};}
 function bmiStatus(value){const v=num(value);if(v===null||v<=0)return choose('unknown');if(v<18.5)return choose('low',{label:'Unter BMI-Orientierungsbereich'});if(v<25)return choose('good',{label:'BMI-Orientierungsbereich'});if(v<30)return choose('mild',{label:'BMI erhöht'});return choose('high',{label:'BMI deutlich erhöht'});}
 function classify(kind,value){const v=num(value);if(v===null)return choose('unknown');
  if(kind==='spo2')return v<70||v>100?choose('unknown'):v<90?choose('veryhigh',{label:'Sehr niedrige SpO₂ – dringend abklären'}):v<93?choose('high',{label:'Niedrige SpO₂ – ärztlich abklären'}):v<95?choose('mild',{label:'SpO₂ unter üblichem Bereich'}):choose('good',{label:'Üblicher SpO₂-Bereich'});
  if(kind==='pulse')return v<20||v>250?choose('unknown'):v<50?choose('low',{label:'Langsamer Puls – Kontext prüfen'}):v<60?choose('mild',{label:'Puls unter üblichem Ruhebereich'}):v<=100?choose('good',{label:'Üblicher Ruhepulsbereich'}):v<=120?choose('mild',{label:'Puls erhöht bei Ruhe'}):choose('high',{label:'Puls deutlich erhöht bei Ruhe'});
  if(kind==='fev1'||kind==='fvc')return v<0||v>200?choose('unknown'):v<60?choose('veryhigh',{label:'Deutlich unter 80 % Soll'}):v<80?choose('mild',{label:'Unter 80 % Soll'}):choose('good',{label:'≥80 % Soll – Orientierung'});
  if(kind==='bmi')return bmiStatus(v);
  return choose('unknown',{label:'Ohne individuelle Referenz nicht einstufbar'});
 }
 window.PNEUMOPRO_AMPEL347=Object.freeze({body,classify,bmiStatus,heightCm,kg,tone});
})();
