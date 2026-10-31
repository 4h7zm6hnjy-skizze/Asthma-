'use strict';
/* PneumoPro 3.7.5: Gewicht im Patientenprofil synchronisieren, Messlisten einklappen.
   Keine externen Anfragen, keine Aenderung oder Loeschung von Messdaten. */
(() => {
  const S = window.ASTHMA_SECURITY;
  if (!S?.state?.().unlocked || document.getElementById('pp375-style')) return;
  const $ = id => document.getElementById(id);
  const targets = [
    ['v29-history-spo2', 'Blutsauerstoff', 'spo2'],
    ['v29-history-bp', 'Blutdruck', 'bp'],
    ['v29-history-pulse', 'Puls', 'pulse'],
    ['s292-weight-list', 'Gewicht', 'weight'],
    ['epef-history', 'Peak-Flow', 'epef'],
    ['measurement-list', 'Lungenfunktion', 'measurements'],
    ['lufu23-record-list', 'Lungenuntersuchungen', 'measurements'],
    ['report-list', 'Aerztliche Befunde', 'dom']
  ];
  const style = document.createElement('style');
  style.id = 'pp375-style';
  style.textContent = '.pp375-fold{margin:15px 0;min-width:0;border:1px solid #b9d7df;border-radius:12px;background:#f7fbfc;overflow:hidden}.pp375-fold>summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 15px;font-weight:760;font-size:15px;line-height:1.45;color:#15576c;min-height:48px;overflow-wrap:anywhere}.pp375-fold>summary::-webkit-details-marker{display:none}.pp375-fold>summary:focus-visible{outline:3px solid #23879c;outline-offset:-3px}.pp375-fold>summary::after{content:"▾";flex:none;font-size:18px;transition:transform .15s ease}.pp375-fold[open]>summary::after{transform:rotate(180deg)}.pp375-fold[open]>summary{border-bottom:1px solid #d4e5eb;background:#eaf6f8}.pp375-fold>.pp375-inner{padding:10px 12px;min-width:0;overflow-x:auto}.pp375-fold .v29-record{max-width:100%}.pp375-fold table{max-width:100%}@media(max-width:620px){.pp375-fold>summary{font-size:14px;padding:12px}.pp375-fold>.pp375-inner{padding:7px;overflow-x:auto}}@media print{.pp375-fold{display:block!important}.pp375-fold>.pp375-inner{display:block!important}}';
  document.head.append(style);
  const state = new Map();
  let suiteCounts = null, epefCount = null;
  function countDOM(host) {
    if (!host) return 0;
    if (host.querySelector('table')) return Math.max(0, host.querySelectorAll('table tr').length - 1);
    return [...host.children].filter(x => !x.matches('p.input-note,p.suite-msg,p.epef-note')).length;
  }
  function label(id, title, kind) {
    const item = state.get(id);
    if (!item) return;
    let count;
    if (kind === 'weight') count = suiteCounts?.weight;
    else if (kind === 'measurements') count = suiteCounts?.measurements;
    else if (['spo2', 'bp', 'pulse'].includes(kind)) count = suiteCounts?.[kind];
    else if (kind === 'epef') count = epefCount;
    else count = countDOM(item.host);
    item.summary.textContent = title + ' · ' + (count == null ? 'Einzelwerte anzeigen' : count + ' ' + (count === 1 ? 'Eintrag' : 'Eintraege') + ' anzeigen');
  }
  function install() {
    for (const [id, title, kind] of targets) {
      const host = $(id);
      if (!host || state.has(id) || host.closest('.pp375-fold')) continue;
      const details = document.createElement('details');
      details.className = 'pp375-fold';
      details.setAttribute('aria-label', title + ' – einzelne Messwerte');
      const summary = document.createElement('summary');
      const inside = document.createElement('div');
      inside.className = 'pp375-inner';
      host.parentNode.insertBefore(details, host);
      details.append(summary, inside);
      inside.append(host);
      state.set(id, {host, summary, details, kind, title});
      label(id, title, kind);
    }
  }
  const isoDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(s + 'T12:00:00').valueOf());
  const kg = v => v !== null && v !== '' && v !== undefined && Number.isFinite(Number(v)) && Number(v) >= 15 && Number(v) <= 500 ? Number(v) : null;
  const same = (a, b) => a === b || (a == null && b == null);
  let seq = 0;
  async function refresh() {
    if (!S.state().unlocked) return;
    const run = ++seq;
    const [suite, epef] = await Promise.allSettled([S.list('suite'), S.list('epef')]);
    if (run !== seq) return;
    if (suite.status === 'fulfilled') {
      const rows = suite.value;
      suiteCounts = {weight:0, measurements:0, spo2:0, bp:0, pulse:0};
      const weights = [];
      for (const row of rows) {
        if (row.type === 'weight292' && isoDate(row.value?.date) && kg(row.value?.kg) !== null) {
          suiteCounts.weight++;
          weights.push({date:row.value.date, kg:kg(row.value.kg), id:String(row.value.id || row.key || ''), createdAt:String(row.value.createdAt || '')});
        } else if (row.type === 'vital29' && ['spo2','bp','pulse'].includes(row.value?.kind)) suiteCounts[row.value.kind]++;
        else if (row.type === 'measurements') suiteCounts.measurements++;
      }
      weights.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
      const latest = weights.length ? weights[weights.length - 1] : null;
      const profile = S.profileGet() || {}, p = profile.personal || {}, meta = p.weightSync375;
      if (latest) {
        if (!same(kg(p.weightKg), latest.kg) || p.weightDate !== latest.date || !meta) {
          const original = meta && typeof meta === 'object' ? meta : {originalKg:p.weightKg ?? null, originalDate:p.weightDate || ''};
          const updated = {...p, weightKg:latest.kg, weightDate:latest.date, weightSync375:{...original, lastId:latest.id}};
          await S.updateProfile({personal:updated});
          if (run !== seq) return;
          // SEC meldet die Aenderung, bevor sein interner Profilwert aktualisiert wurde.
          window.dispatchEvent(new CustomEvent('asthma:secure-change', {detail:{group:'profile'}}));
          window.dispatchEvent(new Event('asthma:personal-profile-updated'));
        }
      } else if (meta && typeof meta === 'object') {
        const updated = {...p, weightKg:meta.originalKg ?? null, weightDate:meta.originalDate || ''};
        delete updated.weightSync375;
        await S.updateProfile({personal:updated});
        if (run !== seq) return;
        window.dispatchEvent(new CustomEvent('asthma:secure-change', {detail:{group:'profile'}}));
        window.dispatchEvent(new Event('asthma:personal-profile-updated'));
      }
    }
    if (epef.status === 'fulfilled') epefCount = epef.value.filter(x => x.kind === 'measurement').length;
    install();
    for (const [id, title, kind] of targets) label(id, title, kind);
  }
  let timer = 0;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => refresh().catch(err => console.warn('PneumoPro 3.7.5: Messwerte nicht synchronisiert:', err.message)), 190);
  }
  window.addEventListener('asthma:secure-change', e => {
    if (['suite','epef','profile'].includes(e.detail?.group)) schedule();
  });
  window.addEventListener('asthma:profile-reset', schedule);
  window.addEventListener('asthma:personal-profile-updated', schedule);
  let observerTimer = 0;
  const observer = new MutationObserver(() => {
    clearTimeout(observerTimer);
    observerTimer = setTimeout(install, 100);
  });
  observer.observe(document.getElementById('secure-application') || document.body, {childList:true, subtree:true});
  install();
  schedule();
  window.PNEUMOPRO_TIDY375 = Object.freeze({version:'3.7.5', refresh:schedule});
})();
