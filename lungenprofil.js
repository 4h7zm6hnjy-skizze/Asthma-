'use strict';
/* Asthma 1.3.0: Unverbindliche, lokal berechnete Orientierung für Hilfsmittel/Antragswege.
   FEV1 % vom Soll ist NICHT der SpO2-Wert und NICHT FEV1/FVC. */
(()=>{
  const $=id=>document.getElementById(id);
  const bridge=window.ASTHMA_PROFILE_BRIDGE;
  const box=$('lung-recommendation-results');
  if(!bridge||!box)return;
  const catalog=window.ASTHMA_APPLICATIONS||[];
  const byId=new Map(catalog.map(x=>[x.id,x]));
  const percent=x=>x===null||x===undefined||x===''?null:(Number.isInteger(Number(x))&&Number(x)>=0&&Number(x)<=100?Number(x):null);
  const text=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;n.textContent=value;return n;};
  // IDs refer to the independently maintained official application list.
  const recommendations=[
    {id:'inhaletech',group:'Grundversorgung',reason:'Richtige Inhalationstechnik kann unabhängig von gemessenen Prozentwerten überprüft werden.',min:0},
    {id:'notfallplan',group:'Grundversorgung',reason:'Ein individuell ärztlich abgestimmter Asthma-Aktionsplan ist auch bei höheren Werten sinnvoll.',min:0},
    {id:'dmp',group:'Grundversorgung',reason:'Regelmäßige Betreuung, Verlaufskontrollen und strukturierte Schulungen anfragen.',min:0},
    {id:'schulung',group:'Grundversorgung',reason:'Asthmaschulung und Selbstmanagement können helfen, Beschwerden frühzeitig zu erkennen.',min:0},
    {id:'peak',group:'Selbstkontrolle',reason:'Bei Bedarf einen persönlichen Peak-Flow-Messplan mit der Praxis besprechen.',min:0},
    {id:'atemphysio',group:'Physiotherapie',reason:'Atemtherapie bei passender ärztlicher Indikation prüfen.',condition:p=>(p.fev1!==null&&p.fev1<80)||(p.fvc!==null&&p.fvc<80)||p.lungSymptoms.includes('dyspnea')},
    {id:'lungensport',group:'Bewegung & Training',reason:'Belastungsangepassten Lungensport mit Arztpraxis besprechen; Belastbarkeit vorher klären.',condition:p=>(p.fev1!==null&&p.fev1<80)||(p.fvc!==null&&p.fvc<80)||p.lungSymptoms.includes('dyspnea')},
    {id:'pneureha',group:'Rehabilitation',reason:'Bei dauerhaften Einschränkungen oder gefährdeter Erwerbsfähigkeit pneumologische Rehabilitation prüfen.',condition:p=>p.fev1!==null&&p.fev1<60||p.lungSymptoms.includes('dyspnea')&&p.lungSymptoms.includes('work')},
    {id:'nebuliser',group:'Hilfsmittel',reason:'Nur falls eine ärztlich ausgewählte Inhalationstherapie ein Verneblergerät tatsächlich erfordert.',condition:p=>p.fev1!==null&&p.fev1<60},
    {id:'sekret',group:'Physiotherapie',reason:'Bei zähem Schleim oder erschwertem Abhusten gezielte Hustentechniken prüfen.',condition:p=>p.lungSymptoms.includes('mucus')},
    {id:'pep',group:'Hilfsmittel',reason:'Bei ärztlich bestätigtem Sekretproblem ggf. PEP-Gerät zur Sekretmobilisierung prüfen.',condition:p=>p.lungSymptoms.includes('mucus')},
    {id:'luftarbeit',group:'Arbeitsplatz',reason:'Schadstoffe, Hitze und Belastungen am Arbeitsplatz dokumentieren und Schutzmaßnahmen prüfen.',condition:p=>p.lungSymptoms.includes('work')},
    {id:'arbgerät',group:'Arbeitsplatz',reason:'Individuelle technische Hilfen am Arbeitsplatz bei medizinisch nachgewiesenem Bedarf prüfen.',condition:p=>p.lungSymptoms.includes('work')},
    {id:'bem',group:'Arbeitsplatz',reason:'Bei Arbeitsunfähigkeit und Problemen im Beschäftigungsverhältnis kann ein BEM relevant sein.',condition:p=>p.lungSymptoms.includes('work')},
    {id:'teilhabe',group:'Arbeitsplatz',reason:'Bei gefährdeter Beschäftigung Leistungen zur Teilhabe am Arbeitsleben prüfen.',condition:p=>p.lungSymptoms.includes('work')&&p.fev1!==null&&p.fev1<80},
    {id:'gleich',group:'GdB & Arbeit',reason:'Bei GdB 30/40 kann eine Gleichstellung zum Erhalt des Arbeitsplatzes infrage kommen.',condition:p=>[30,40].includes(p.gdb)&&!p.equal},
    {id:'gdbhoch',group:'GdB',reason:'Bei anhaltend geänderten Einschränkungen kann eine Neufeststellung des GdB geprüft werden.',condition:p=>p.fev1!==null&&p.fev1<60},
  ];
  const pick=p=>recommendations.filter(r=>byId.has(r.id)&&(!r.condition||r.condition(p)));
  function summary(p){
    let result='';
    if(p.fev1===null){result='FEV₁ noch nicht eingetragen. Allgemeine Asthma-Hilfen werden angezeigt; mit einem Befundwert lässt sich die Auswahl besser ordnen.';}
    else if(p.fev1===0){result='FEV₁ 0 % vom Soll: Bitte den Wert am Originalbefund überprüfen. Bei akuter schwerer Atemnot gilt: 112. Aus dem Wert allein kann die App keine Diagnose stellen.';}
    else if(p.fev1<60){result=`FEV₁ ${p.fev1} % vom Soll: Laut GINA ist ein Wert unter 60 % ein Risikofaktor für Asthma-Verschlechterungen. Bitte zeitnah mit der behandelnden Lungenfachpraxis besprechen – auch wenn die Beschwerden gering erscheinen.`;}
    else if(p.fev1<80){result=`FEV₁ ${p.fev1} % vom Soll: Verlauf, Symptome und Behandlungsbedarf ärztlich beurteilen lassen. Der Prozentwert allein legt weder den Asthma-Schweregrad noch den Anspruch auf Hilfen fest.`;}
    else{result=`FEV₁ ${p.fev1} % vom Soll: Ein höherer Messwert schließt unkontrolliertes Asthma oder einen Bedarf an Unterstützung nicht aus. Beschwerden und Exazerbationen bleiben wichtig.`;}
    if(p.fvc!==null) result+=` FVC: ${p.fvc} % vom Soll. Die FVC wird nicht als zweiter FEV₁-Wert und nicht als FEV₁/FVC-Verhältnis interpretiert.`+(p.fvc<80?' Den verminderten FVC-Sollwert bitte ärztlich besprechen.':'');
    if(p.lungDate)result+=` Befunddatum: ${p.lungDate.split('-').reverse().join('.')}.`;
    result+=' Ein Sauerstoffgerät lässt sich aus FEV₁ oder FVC allein nicht ableiten.';
    return result;
  }
  function gotoApplication(id){
    const x=byId.get(id);if(!x)return;
    const search=$('apply-search'),category=$('apply-category');
    category.value='all';category.dispatchEvent(new Event('change',{bubbles:true}));
    search.value=x.title;search.dispatchEvent(new Event('input',{bubbles:true}));
    const target=$('antraege');target?.scrollIntoView({behavior:'smooth',block:'start'});
    const match=$('apply-list')?.querySelector('[data-application="'+CSS.escape(id)+'"]');
    if(match){match.classList.add('lung-jump-highlight');match.querySelector('details')?.setAttribute('open','');}
  }
  function render(){
    const p=bridge.get();
    for(const field of ['fev1','fvc']){
      const number=$('lung-'+field+'-number'),range=$('lung-'+field+'-range');
      if(!number||!range)continue;
      if(document.activeElement!==number)number.value=p[field]===null?'':String(p[field]);
      if(document.activeElement!==range)range.value=String(p[field]===null?100:p[field]);
      range.setAttribute('aria-valuetext',p[field]===null?'Nicht eingetragen':p[field]+' Prozent des Sollwerts');
    }
    $('lung-date').value=p.lungDate;
    document.querySelectorAll('input[name="lung-symptom"]').forEach(el=>{el.checked=p.lungSymptoms.includes(el.value)});
    $('lung-profile-status').textContent=summary(p);
    const chosen=pick(p);
    $('lung-match-count').textContent=chosen.length+' Anlaufstellen';
    const frag=document.createDocumentFragment();
    chosen.forEach(item=>{
      const x=byId.get(item.id);
      const card=text('article','lung-reco','');
      card.append(text('span','lung-reco-category',item.group),text('h3','',x.title),text('p','',item.reason));
      const target=text('p','lung-reco-target','Anlaufstelle: '+x.who);card.append(target);
      const buttons=text('div','lung-reco-actions','');
      const open=text('button','btn btn-primary','Antragsweg ansehen');open.type='button';open.addEventListener('click',()=>gotoApplication(x.id));
      const official=text('a','btn btn-outline','Offizielle Quelle ↗');official.href=x.url;official.target='_blank';official.rel='noopener noreferrer';
      buttons.append(open,official);card.append(buttons);frag.append(card);
    });
    box.replaceChildren(frag);
  }
  function change(field,value){
    const p=bridge.get();p[field]=percent(value);
    bridge.setLung(p);render();
  }
  ['fev1','fvc'].forEach(field=>{
    const input=$('lung-'+field+'-number'),slider=$('lung-'+field+'-range'),clear=$('lung-'+field+'-clear');
    input.addEventListener('input',()=>{
      const v=input.value.trim();if(v!==''){
        const n=Number(v);
        if(!Number.isInteger(n)||n<0||n>100){input.setCustomValidity('Bitte einen ganzen Wert zwischen 0 und 100 eingeben.');return;}
      }
      input.setCustomValidity('');change(field,v);
    });
    input.addEventListener('blur',()=>{input.setCustomValidity('');render();});
    slider.addEventListener('input',()=>{change(field,slider.value);input.value=slider.value;});
    clear.addEventListener('click',()=>change(field,null));
  });
  $('lung-date').addEventListener('change',ev=>{const p=bridge.get();p.lungDate=ev.target.value;bridge.setLung(p);render()});
  document.querySelectorAll('input[name="lung-symptom"]').forEach(el=>el.addEventListener('change',()=>{
    const p=bridge.get();p.lungSymptoms=[...document.querySelectorAll('input[name="lung-symptom"]:checked')].map(x=>x.value);
    bridge.setLung(p);render();
  }));
  $('gdb').addEventListener('change',render);$('equal').addEventListener('change',render);
  window.addEventListener('asthma:profile-reset',render);
  render();
  Object.defineProperty(window,'__asthmaLungTest',{value:Object.freeze({percent,pick,summary,catalogMatches:()=>recommendations.filter(x=>byId.has(x.id)).length}),enumerable:false});
})();
