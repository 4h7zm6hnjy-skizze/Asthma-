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
import subprocess
import sys
import time
from html.parser import HTMLParser
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse, urljoin

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
        r'krankenversicher|krankenkass|gesetzliche\s+krankenversicher|\bsgb\s*v\b|\bsgb\s*5\b|arzneimittel[\s-]*(?:preis|verschreib|richtlinie|versorgung)|medizinprodukt|gesundheitsversorgung|patientenversorgung',
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


# Official HTML fallback used only if the federal RSS feed is temporarily unreachable.
# The HTML page displays BGBl links with the document descriptions immediately
# after them. No dates are inferred from the page or the crawl time.
class _FederalHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.records = []
        self.pending = None
        self.in_anchor = False
        self.href = None
        self.anchor_text = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self._finish()
            self.in_anchor = True
            self.href = urljoin('https://www.gesetze-im-internet.de/aktuDienst.html', dict(attrs).get('href', ''))
            self.anchor_text = []

    def handle_data(self, text):
        if self.in_anchor:
            self.anchor_text.append(text)
        elif self.pending:
            self.pending['description'] += ' ' + text[:500]

    def handle_endtag(self, tag):
        if tag == 'a' and self.in_anchor:
            title = readable(''.join(self.anchor_text))
            if title.startswith('BGBl.') and approved(self.href):
                self.pending = {'title': title, 'url': self.href, 'description': ''}
            self.in_anchor = False

    def _finish(self):
        if self.pending and len(readable(self.pending['description'])) >= 12:
            self.records.append(self.pending)
        self.pending = None

    def done(self):
        self._finish()
        return self.records


def extract_federal_html(content, source):
    parser = _FederalHTML()
    parser.feed(content.decode('utf-8', errors='replace'))
    records = []
    for row in parser.done():
        description = readable(row['description'])[:270]
        title = (row['title'] + ' – ' + description)[:230]
        r = relevance(title, description)
        if not r:
            continue
        categories, level, reason = r
        records.append({
            'id': hashlib.sha256((row['url']+'|'+title[:180]).encode()).hexdigest()[:20],
            'title': title, 'url': row['url'], 'source': source,
            'date': None, 'categories': categories, 'relevance': level,
            'reason': reason, 'stage': stage(title, description),
        })
    return records[:80]


def fetch(url):
    # A short retry reduces transient GitHub runner / official website outages.
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (compatible; Asthma-Rechtsmonitor/3.0; official sources)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html',
    })
    last_exc = None
    for attempt in range(2):
        try:
            with urllib.request.urlopen(req, timeout=18) as response:
                if not approved(response.geturl()):
                    raise ValueError('Weiterleitung zu nicht erlaubter Domain')
                data = response.read(2_000_001)
                if len(data) > 2_000_000:
                    raise ValueError('Quelle zu gross')
                return data
        except (OSError, TimeoutError) as exc:
            last_exc = exc
            if attempt == 0:
                time.sleep(1.5)
    raise last_exc or RuntimeError('Abruf fehlgeschlagen')


def _oldest_reliable_snapshot(output):
    """Return usable previous data, excluding entries previously mislabelled.

    GitHub Actions checkout is shallow by default: fetch more *public repository*
    history only if the current JSON has already been overwritten with 0 items.
    Historical records are expressly downgraded to archive/general.
    """
    candidates = []
    try:
        current = json.loads(output.read_text('utf-8'))
        if current.get('items'):
            candidates.append(current)
    except (OSError, ValueError, TypeError):
        pass
    if not candidates:
        try:
            is_shallow = subprocess.run(['git', 'rev-parse', '--is-shallow-repository'],
                capture_output=True, text=True, timeout=5, check=True).stdout.strip() == 'true'
            if is_shallow:
                subprocess.run(['git', 'fetch', '--no-tags', '--unshallow', 'origin'],
                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                    timeout=40, check=True)
            result = subprocess.run(['git', 'log', '-n', '25', '--format=%H', '--', output.name],
                capture_output=True, text=True, timeout=8, check=True)
            for sha in result.stdout.splitlines():
                old = subprocess.run(['git', 'show', f'{sha}:{output.name}'],
                    capture_output=True, text=True, timeout=7)
                if old.returncode == 0:
                    obj = json.loads(old.stdout)
                    if isinstance(obj.get('items'), list) and obj['items']:
                        candidates.append(obj)
                        break
        except (OSError, ValueError, subprocess.SubprocessError) as exc:
            print('INFO: historischer Datenabruf nicht möglich:', type(exc).__name__, file=sys.stderr)
    return candidates[0] if candidates else None


def archive_from(snapshot, failed_names):
    """Old content has a known source, but MUST NOT be considered fresh."""
    if not snapshot:
        return []
    items = []
    for record in snapshot.get('items', []):
        if not isinstance(record, dict) or record.get('source') not in failed_names:
            continue
        title, link = record.get('title', ''), record.get('url', '')
        if not isinstance(title, str) or not isinstance(link, str) or not approved(link):
            continue
        r = relevance(title, '')
        if not r:
            continue
        cats, _, _ = r
        is_old = int(snapshot.get('classifierVersion') or 0) < 2
        old_at = record.get('lastVerifiedAt') or snapshot.get('generatedAt')
        try:
            if (now() - dt.datetime.fromisoformat(old_at.replace('Z', '+00:00'))).days > LOOKBACK_DAYS:
                continue
        except (AttributeError, TypeError, ValueError):
            continue
        item = dict(record)
        item.update(categories=cats, relevance='general', archived=True,
                    lastVerifiedAt=old_at, stage='unbestimmt',
                    reason='Frühere amtliche Meldung; Quelle beim letzten Abruf nicht erreichbar. Aktuellen Rechtsstand selbst prüfen.')
        if is_old:
            # Original v1 feed used refresh time as publication date: don't repeat it.
            item['date'] = None
        items.append(item)
    return items


def build(fetcher=fetch, output=Path('rechtsmonitor-feed.json')):
    merged = {}
    reports = []
    source_failed = set()
    for name, url in FEEDS:
        fallback_used = False
        try:
            try:
                entries = extract(fetcher(url), name)
            except Exception as rss_exc:
                if name != FEEDS[0][0]:
                    raise
                try:
                    entries = extract_federal_html(
                        fetcher('https://www.gesetze-im-internet.de/aktuDienst.html'), name)
                    fallback_used = True
                except Exception:
                    raise rss_exc
            for entry in entries:
                key = entry['url']
                old = merged.get(key)
                if old is None or (entry['relevance'] == 'possible' and old['relevance'] != 'possible'):
                    merged[key] = entry
            reports.append({'name': name, 'ok': True, 'count': len(entries),
                            'fallbackUsed': fallback_used})
        except Exception as exc:
            source_failed.add(name)
            reports.append({'name': name, 'ok': False, 'count': 0,
                            'error': type(exc).__name__})
            print(f'WARN {name}: {type(exc).__name__}: {exc}', file=sys.stderr)
    if not any(r['ok'] for r in reports):
        raise RuntimeError('Keine Quelle erreichbar; bestehende Datei bleibt erhalten')

    archived = []
    if source_failed:
        snapshot = _oldest_reliable_snapshot(output)
        archived = archive_from(snapshot, source_failed)
        for entry in archived:
            merged.setdefault(entry['url'], entry)

    records = sorted(merged.values(), key=lambda x: (
        not x.get('archived', False), x['relevance'] == 'possible',
        x['date'] or '', x['title']), reverse=True)[:80]
    feed = {'schema': 1, 'classifierVersion': 3,
            'generatedAt': now().isoformat(timespec='seconds'),
            'status': 'partial' if source_failed else 'ok',
            'sources': reports, 'archivedCount': sum(bool(x.get('archived')) for x in records),
            'items': records}
    output.write_text(json.dumps(feed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(records)} Meldungen (davon {feed["archivedCount"]} archiviert)'
          f' aus {sum(x["ok"] for x in reports)}/{len(FEEDS)} amtlichen RSS-Diensten')
    return feed


if __name__ == '__main__':
    build()
