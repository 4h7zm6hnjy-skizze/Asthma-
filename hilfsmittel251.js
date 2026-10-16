/* Asthma 2.5.1: Einordnung Hilfsmittel – gesetzliche Kasse, mögliche Mehrkosten, Privatzahlung.
   Nur statische Orientierung. Keine Datenübertragung, keine Preise oder Leistungszusagen. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const host=$('hilfe251-catalog');if(!host)return;
 const items=Object.freeze([
  {id:'spacer',title:'Inhalierhilfe (Spacer)',group:'gkv',topic:'Inhalation',desc:'Für bestimmte Dosieraerosole; muss zum Inhalator passen. Nicht für Pulverinhalatoren pauschal geeignet.',way:'Arzt/Apotheke nach geeignetem Modell fragen; Kasse und Verordnung vorab klären.',apply:'spacer'},
  {id:'vernebler',title:'Elektrischer Inhalationsvernebler',group:'gkv',topic:'Inhalation',desc:'Nur für individuell ärztlich erforderliche Inhalationstherapie, kein Standardgerät für jedes Asthma.',way:'Bei medizinischer Notwendigkeit Verordnung und vorherige Kassenklärung.',apply:'nebuliser'},
  {id:'peak',title:'Einfaches Peak-Flow-Messgerät',group:'gkv',topic:'Selbstkontrolle',desc:'Zur eigenständigen Verlaufsmessung, wenn ein ärztlicher Messplan besteht.',way:'Kostenübernahme des konkreten Modells vor Kauf mit der Kasse klären.',apply:'peak'},
  {id:'pep',title:'PEP-Gerät zur Sekretmobilisation',group:'gkv',topic:'Atemtherapie',desc:'Bei ärztlich festgestelltem Sekretproblem; nicht für jede Asthmasituation geeignet.',way:'Eignung und Hilfsmittelverordnung mit Arztpraxis besprechen.',apply:'pep'},
  {id:'oxim',title:'Finger-Pulsoximeter',group:'fall',topic:'Kontrolle',desc:'Eine routinemäßige Selbstmessung ist nicht für alle Menschen mit Asthma nötig. Einzelwerte können ungenau sein.',way:'Bei medizinisch begründetem Bedarf Kostenträger vor Kauf fragen; keine Therapieentscheidung aus Einzelwerten.',apply:'oxim'},
  {id:'bluetooth',title:'Digitales Peak-Flow-Gerät mit Bluetooth',group:'fall',topic:'Selbstkontrolle',desc:'Digitale Auswertung oder App-Anbindung kann komfortabel sein, ist aber nicht automatisch medizinisch notwendig.',way:'Basisversorgung und etwaige selbst zu tragende Aufpreise getrennt erfragen.',apply:'peak'},
  {id:'encasing',title:'Allergendichte Matratzen- und Kissenbezüge',group:'fall',topic:'Allergene',desc:'Bei nachgewiesener Hausstaubmilbenallergie können spezielle Bezüge infrage kommen; nicht für jedes Asthma erforderlich.',way:'Ärztliche Indikation und mögliche Kassenleistung vor dem Kauf abklären.'},
  {id:'hygrometer',title:'Hygrometer für Raumluftfeuchtigkeit',group:'privat',topic:'Raumklima',desc:'Kleines Alltagsgerät zur Beobachtung des Raumklimas; kein medizinisches Asthma-Hilfsmittel.',way:'In der Regel selbst zu bezahlen; keine garantierte Wirkung auf Asthma.'},
  {id:'hepa',title:'Raumluftreiniger mit HEPA-Filter',group:'privat',topic:'Raumklima',desc:'Kann je nach Gerät Partikel aus der Raumluft filtern; ersetzt weder Auslöservermeidung noch Medikamente. Geräte mit Ozonemission vermeiden.',way:'Meist private Anschaffung. Nutzen im konkreten Raum und laufende Filterkosten prüfen.'},
  {id:'pollenschutz',title:'Pollenschutzgitter für Fenster',group:'privat',topic:'Allergene',desc:'Kann den Polleneintrag je nach Anwendung reduzieren; ersetzt keine allergologische Behandlung.',way:'Gewöhnlich selbst finanzierte Ausstattung der Wohnung.'},
  {id:'etui',title:'Inhalator-Etui und Reise-Organizer',group:'privat',topic:'Alltag',desc:'Zur geordneten Aufbewahrung und Mitnahme; Lagerung nach Herstellerangaben beachten.',way:'Üblicherweise privat bezahlte Komfortausstattung.'},
  {id:'staubsauger',title:'Staubsauger mit geeignetem Partikelfilter',group:'privat',topic:'Allergene',desc:'Allgemeines Haushaltsgerät; bei allergischer Belastung können geeignete Filter nützlich sein.',way:'In der Regel private Haushaltsanschaffung, nicht automatisch ein Kassenhilfsmittel.'},
  {id:'raumluft',title:'Raumluftmessgerät für CO₂ oder Feinstaub',group:'privat',topic:'Raumklima',desc:'Zeigt bestimmte Umweltwerte an, misst aber weder persönliche Asthmakontrolle noch Lungenfunktion.',way:'Typischerweise Privatzahlung; Messwerte sind keine medizinischen Grenzwerte.'}
 ]);
 const label={gkv:'Gesetzliche Krankenkasse prüfen',fall:'Einzelfall / mögliche Eigenkosten',privat:'Privatzahlung / Selbstzahler'};
 let filter='all',query='';
 const text=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;n.textContent=value;return n};
 function gotoApplication(appId){const found=(window.ASTHMA_APPLICATIONS||[]).find(x=>x.id===appId);if(!found)return;window.ASTHMA_NAV?.go('antraege');const search=$('apply-search'),category=$('apply-category');if(search&&category){category.value='all';category.dispatchEvent(new Event('change',{bubbles:true}));search.value=found.title;search.dispatchEvent(new Event('input',{bubbles:true}));} }
 function render(){
   const matches=items.filter(item=>(filter==='all'||filter===item.group)&&[item.title,item.topic,item.desc,item.way].join(' ').toLocaleLowerCase('de-DE').includes(query));
   const frag=document.createDocumentFragment();
   for(const item of matches){const card=text('article','hilfe251-item','');card.dataset.payment=item.group;card.dataset.aid=item.id;
     card.append(text('span','hilfe251-type',label[item.group]),text('h4','',item.title),text('p','hilfe251-topic',item.topic),text('p','',item.desc),text('p','hilfe251-way',item.way));
     if(item.apply){const btn=text('button','btn btn-outline','Kassen-Antragsweg prüfen');btn.type='button';btn.addEventListener('click',()=>gotoApplication(item.apply));card.append(btn)}
     frag.append(card);
   }
   host.replaceChildren(frag);
   $('hilfe251-count').textContent=matches.length+' Möglichkeiten angezeigt';
   $('hilfe251-empty').hidden=matches.length!==0;
   document.querySelectorAll('[data-hilfe251-filter]').forEach(b=>{const active=b.dataset.hilfe251Filter===filter;b.classList.toggle('hilfe251-active',active);b.setAttribute('aria-pressed',String(active))});
 }
 $('hilfe251-filters').addEventListener('click',e=>{const b=e.target.closest('button[data-hilfe251-filter]');if(!b)return;filter=b.dataset.hilfe251Filter;render()});
 $('hilfe251-search').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('de-DE');render()});
 render();
 Object.defineProperty(window,'__ASTHMA_HILFSMITTEL_251_TEST',{value:Object.freeze({items,groupCounts:()=>Object.fromEntries(['gkv','fall','privat'].map(k=>[k,items.filter(x=>x.group===k).length]))}),configurable:false});
})();
