#!/usr/bin/env python3
"""Asthma PWA: public, official, *thematically* filtered legal updates.

Only public RSS titles and approved source links are published. Never processes
local patient data, predicts an entitlement, or asserts an enactment date.
This script is run in the repository root by the existing GitHub workflow.
"""
from __future__ import annotations

import datetime as dt
import email.utils
import hashlib
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

FEEDS = (
    ('Gesetze im Internet – Aktualitätendienst', 'https://www.gesetze-im-internet.de/aktuDienst-rss-feed.xml'),
    ('G-BA – Letzte Änderungen', 'https://www.g-ba.de/letzte-aenderungen/rss.xml'),
    ('G-BA – Beschlüsse', 'https://www.g-ba.de/beschluesse/letzte-aenderungen/rss.xml'),
)
OFFICIAL = ('gesetze-im-internet.de', 'recht.bund.de', 'g-ba.de')
LOOKBACK_DAYS = 180

# A title must match a precise or general subject. Mere incidental words in a
# boilerplate description must not turn an unrelated document into a GdB hit.
RULES = {
    'gdb': (
        r'\bgdb\b|grad(?:es)?\s+der\s+behinderung|schwerbehind|versorgungsmedizin|behindertenrecht|behindertengleichstellung|gleichstellung.{0,70}(?:behindert|sgb\s*ix)',
        r'\bsgb\s*ix\b|\bsgb\s*9\b|inklusion(?:s)?(?:gesetz|hilfe|leistungen)|(?:rechte|besch[aä]ftigung)\s+von\s+menschen\s+mit\s+behinderungen',
    ),
    'arbeit': (
        r'arbeitsschutz|arbeitszeit(?:gesetz|verordnung)?|betrieblich(?:es|e|er)?\s+eingliederungsmanagement|\bbem\b|kurzarbeit|berufskrankheit|arbeitsplatzanpassung|arbeitsunf[aä]higkeit|besch[aä]ftigungssicherung',
        r'arbeitsrecht|arbeitnehm|arbeitsplatz|besch[aä]ftigung|arbeitgeber|arbeitsbedingungen|arbeitnehmer[uü]berlassung',
    ),
    'gesundheit': (
        r'\basthma\b|bronchial|lungenfunktion|atemweg|inhalation|krankengeld|krankenkassenleistungen|versorgung\s+chronisch\s+kranker',
        r'krankenversicher|krankenkass|gesetzliche\s+krankenversicher|\bsgb\s*v\b|\bsgb\s*5\b|arzneimittel(?:preis|verschreib|richtlinie|versorgung)|medizinprodukt|gesundheitsversorgung|patientenversorgung',
    ),
    'reha': (
        r'rehabilitation|\breha\b|teilhabe\s+am\s+arbeitsleben|leistungen\s+zur\s+teilhabe|erwerbsminder|berufliche\s+wiedereinglieder|teilhabeberatungsverordnung',
        r'eingliederungshilfe|teilhabeberat|rentenversicher|teilhabe(?:leistungen|gesetz|beratung)',
    ),
    'hilfsmittel': (
        r'hilfsmittel(?:versorgung|richtlinie|verzeichnis)?|heilmittel(?:richtlinie|versorgung)?|inhalationsger[aä]t|\bdmp\b|disease.management.program',
        r'verordnungsf[aä]hig|versorgungshilf|therapie(?:verordnung|richtlinie)|patientenversorgung|physiotherapie',
    ),
}
COMPILED = {k: (re.compile(d, re.I), re.compile(g, re.I)) for k, (d, g) in RULES.items()}
# Prevent linguistic coincidences from producing an asthma/disability alert.
EXCLUDE = re.compile(
    r'gleichstellung\s+von\s+pr[uü]fungszeugnissen|'
    r'gleichstellung\s+von\s+abschlusszeugnissen|'
    r'(?:zeugnissen|abschlusszeugnissen).{0,90}gleichstellung|'
    r'tierarzneimittel|'
    r'meisterpr[uü]fung.{0,80}handwerk|'
    r'luftverkehrs.ordnung', re.I)
CATEGORY_NAMES = {
    'gdb': 'GdB / Schwerbehinderung', 'arbeit': 'Arbeitsrecht / Arbeitsplatz',
    'gesundheit': 'Krankenversicherung / Asthma', 'reha': 'Rehabilitation / Teilhabe',
    'hilfsmittel': 'Hilfsmittel / Therapieleistungen',
}


def now():
    return dt.datetime.now(dt.timezone.utc)


def approved(url):
    try:
        u = urlparse(url)
        return u.scheme == 'https' and bool(u.hostname) and not u.username and not u.password and any(
            u.hostname == host or u.hostname.endswith('.' + host) for host in OFFICIAL)
    except (TypeError, ValueError):
        return False


def readable(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', value or ''))).strip()


def item_value(item, names):
    for child in item:
        name = child.tag.rsplit('}', 1)[-1].lower()
        if name in names:
            if name == 'link' and child.attrib.get('href'):
                return child.attrib['href'].strip()
            return ''.join(child.itertext()).strip()
    return ''


def iso_date(value):
    if not value:
        return None
    try:
        return email.utils.parsedate_to_datetime(value).date().isoformat()
    except (TypeError, ValueError, OverflowError):
        pass
    try:
        return dt.datetime.fromisoformat(value.replace('Z', '+00:00')).date().isoformat()
    except (ValueError, OverflowError):
        return None


def relevance(title, description):
    """Return (categories, class, reason) or no result; never legal advice."""
    if EXCLUDE.search(title):
        return None
    # Don't turn the entire article description into a source of false positives:
    # precise matching on text + limited exact matches from summaries only.
    direct, general = [], []
    for category, (direct_rx, general_rx) in COMPILED.items():
        if direct_rx.search(title):
            direct.append(category)
        elif general_rx.search(title):
            general.append(category)
        elif direct_rx.search(description[:500]):
            general.append(category)  # a summary match is deliberately lower-ranked
    cats = list(dict.fromkeys(direct + general))
    if not cats:
        return None
    level = 'possible' if direct else 'general'
    reason = ('Die Überschrift nennt einen Themenbereich, der für deinen Fall wichtig sein könnte.'
              if direct else 'Allgemeine amtliche Meldung zu einem angrenzenden Themenbereich.')
    return cats, level, reason


def stage(title, description):
    """Indicate wording in the RSS, never determine whether a legal rule applies."""
    # Unlike a proper legal review, this cannot establish all effective dates.
    t = title + ' ' + description[:600]
    if re.search(r'\b(?:einleitung|stellungnahmeverfahren|beratungsverfahren|entwurf)\b', t, re.I):
        return 'verfahren'
    if re.search(r'\b(?:tritt|treten)\s+(?:erst\s+)?nach\b|noch\s+nicht\s+in\s+kraft', t, re.I):
        return 'vorbehalt'
    if re.search(r'\b(?:trat|ist)\s+am\s+.{4,65}?\s+in\s+kraft\s+getreten\b', t, re.I):
        return 'inkrafttreten_erwaehnt'
    if re.search(r'\bbeschluss\b|\bbeschlossen\b', t, re.I):
        return 'beschluss'
    return 'unbestimmt'


def extract(content, source):
    root = ET.fromstring(content)
    items = [e for e in root.iter() if e.tag.rsplit('}', 1)[-1].lower() in ('item', 'entry')]
    records = []
    for item in items[:350]:
        title = readable(item_value(item, ('title',)))
        desc = readable(item_value(item, ('description', 'summary', 'content')))
        url = item_value(item, ('link',))
        if not approved(url) or len(title) < 7:
            continue
        # Bundesgesetzblatt headings often lack subject; add official RSS description.
        if re.fullmatch(r'BGBl\..{0,55}', title, re.I) and len(desc) > 15:
            title += ' – ' + desc[:210]
        result = relevance(title, desc)
        if not result:
            continue
        date = iso_date(item_value(item, ('pubdate', 'published', 'updated', 'date')))
        if date and (date > (now().date() + dt.timedelta(days=2)).isoformat()
                     or date < (now().date() - dt.timedelta(days=LOOKBACK_DAYS)).isoformat()):
            continue
        categories, level, reason = result
        id_ = hashlib.sha256((url + '|' + title[:180]).encode()).hexdigest()[:20]
        records.append({
            'id': id_, 'title': title[:230], 'date': date, 'url': url,
            'source': source, 'categories': categories,
            'relevance': level, 'reason': reason,
            'stage': stage(title, desc),
        })
    return records


def fetch(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Asthma-Rechtsmonitor/2.0 (public official RSS for GitHub Pages)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
    })
    with urllib.request.urlopen(req, timeout=25) as response:
        if not approved(response.geturl()):
            raise ValueError('Weiterleitung zu nicht erlaubter Domain')
        data = response.read(2_000_001)
        if len(data) > 2_000_000:
            raise ValueError('Feed zu groß')
        return data


def build(fetcher=fetch, output=Path('rechtsmonitor-feed.json')):
    merged = {}
    reports = []
    for name, url in FEEDS:
        try:
            entries = extract(fetcher(url), name)
            for entry in entries:
                # A G-BA headline may appear in both G-BA RSS feeds.
                key = entry['url']
                old = merged.get(key)
                if old is None or (entry['relevance'] == 'possible' and old['relevance'] != 'possible'):
                    merged[key] = entry
            reports.append({'name': name, 'ok': True, 'count': len(entries)})
        except Exception as exc:
            reports.append({'name': name, 'ok': False, 'count': 0,
                            'error': type(exc).__name__})
            print(f'WARN {name}: {type(exc).__name__}: {exc}', file=sys.stderr)
    if not any(r['ok'] for r in reports):
        raise RuntimeError('Keine Quelle erreichbar; bereits gespeicherter Stand bleibt erhalten')
    records = sorted(merged.values(), key=lambda x: (
        x['relevance'] == 'possible', x['date'] or '', x['title']), reverse=True)[:80]
    feed = {'schema': 1, 'classifierVersion': 2,
            'generatedAt': now().isoformat(timespec='seconds'),
            'status': 'partial' if not all(r['ok'] for r in reports) else 'ok',
            'sources': reports, 'items': records}
    output.write_text(json.dumps(feed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(records)} thematisch geprüfte Meldungen von {sum(s["ok"] for s in reports)}/{len(FEEDS)} amtlichen RSS-Diensten')
    return feed


if __name__ == '__main__':
    build()
