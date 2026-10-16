#!/usr/bin/env python3
"""Collect *public* German official RSS headlines for the Asthma PWA.

No user data, no telemetry, no inference about individual entitlements.
RSS entries indicate announcements, not necessarily laws in force.
"""
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
    ('G-BA – Letzte Änderungen', 'https://www.g-ba.de/letzte-aenderungen/?rss=1'),
    ('G-BA – Beschlüsse', 'https://www.g-ba.de/beschluesse/letzte-aenderungen/?rss=1'),
)
OFFICIAL = ('gesetze-im-internet.de', 'recht.bund.de', 'g-ba.de')
CATEGORIES = {
    'gdb': r'\bgdb\b|grad(?:es)? der behinderung|schwerbehind|gleichstell|versorgungsmedizin|inklusion|behindertenrecht|behindertengleichstellung',
    'arbeit': r'arbeitsrecht|arbeitsschutz|arbeitszeit|arbeitnehm|betrieblich.{0,30}einglieder|\bbem\b|schichtarbeit|kurzarbeit|berufskrank|arbeitsplatz|besch[aä]ftigung',
    'gesundheit': r'asthma|bronch|atemweg|inhalation|chronisch|krankenkass|\bsgb v\b|\bsgb 5\b|krankenversicherung|krankenbehandlung|arzneimittel|medizinprodukt',
    'reha': r'rehabilitation|\breha\b|rentenversicherung|erwerbsminderung|teilhabe|berufliche wiedereinglieder',
    'hilfsmittel': r'hilfsmittel|heilmittel|dmp|disease.management|verordnungsf[aä]hig|versorgungshilfe|therapie',
}
RX = {tag: re.compile(expr, re.I) for tag, expr in CATEGORIES.items()}
NOW = lambda: dt.datetime.now(dt.timezone.utc)


def approved(url: str) -> bool:
    try:
        u = urlparse(url)
        return u.scheme == 'https' and bool(u.hostname) and any(
            u.hostname == h or u.hostname.endswith('.' + h) for h in OFFICIAL
        )
    except ValueError:
        return False


def readable(value: str) -> str:
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', value or ''))).strip()


def item_value(item: ET.Element, names: tuple[str, ...]) -> str:
    for child in item:
        name = child.tag.rsplit('}', 1)[-1].lower()
        if name in names:
            if name == 'link' and child.attrib.get('href'):
                return child.attrib['href'].strip()
            return ''.join(child.itertext()).strip()
    return ''


def iso_date(value: str) -> str | None:
    if not value:
        return None
    try:
        parsed = email.utils.parsedate_to_datetime(value)
        return parsed.date().isoformat()
    except (TypeError, ValueError, OverflowError):
        pass
    try:
        return dt.datetime.fromisoformat(value.replace('Z', '+00:00')).date().isoformat()
    except (ValueError, OverflowError):
        return None


def extract(content: bytes, source: str):
    root = ET.fromstring(content)
    rows = [e for e in root.iter() if e.tag.rsplit('}', 1)[-1].lower() in ('item', 'entry')]
    records = []
    for row in rows[:250]:
        title = readable(item_value(row, ('title',)))
        description = readable(item_value(row, ('description', 'summary', 'content')))
        raw_url = item_value(row, ('link',))
        if not approved(raw_url):
            continue
        if len(title) < 7:
            continue
        # Law RSS titles can be only "BGBl. Nr."; headline detail is in description.
        if re.fullmatch(r'BGBl\..{0,55}', title, re.I) and len(description) > 15:
            title = title + ' – ' + description[:170]
        field = (title + ' ' + description[:700]).lower()
        cats = [tag for tag, regex in RX.items() if regex.search(field)]
        if not cats:
            continue
        date = iso_date(item_value(row, ('pubdate', 'published', 'updated', 'date')))
        if date and date > (NOW().date() + dt.timedelta(days=2)).isoformat():
            continue
        if date and date < (NOW().date() - dt.timedelta(days=180)).isoformat():
            continue
        id_ = hashlib.sha256((raw_url + '|' + title[:180]).encode('utf-8')).hexdigest()[:20]
        records.append(dict(id=id_, title=title[:230], date=date, url=raw_url,
                            source=source, categories=cats))
    return records


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Asthma-Rechtsmonitor/1.0 (+official-feed-import; public GitHub Actions)', 'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'})
    with urllib.request.urlopen(req, timeout=25) as response:
        if not approved(response.geturl()):
            raise ValueError('Weiterleitung zu nicht erlaubter Domain')
        contents = response.read(2_000_001)
        if len(contents) > 2_000_000:
            raise ValueError('Feed zu groß')
        return contents


def build(fetcher=fetch, output=Path('rechtsmonitor-feed.json')):
    byid = {}
    source_reports = []
    for name, url in FEEDS:
        try:
            entries = extract(fetcher(url), name)
            for item in entries:
                byid[item['id']] = item
            source_reports.append({'name': name, 'ok': True, 'count': len(entries)})
        except Exception as exc:
            # Avoid disclosing internal tracebacks; visibly mark incomplete sources.
            source_reports.append({'name': name, 'ok': False, 'count': 0,
                                   'error': type(exc).__name__})
            print(f'WARNING {name}: {type(exc).__name__}: {exc}', file=sys.stderr)
    if not any(r['ok'] for r in source_reports):
        raise RuntimeError('Keine amtliche Quelle war erreichbar; bestehende Datei bleibt erhalten')
    entries = sorted(byid.values(), key=lambda x: (x['date'] or '', x['title']), reverse=True)[:70]
    data = {'schema': 1, 'generatedAt': NOW().isoformat(timespec='seconds'),
            'status': 'partial' if not all(r['ok'] for r in source_reports) else 'ok',
            'sources': source_reports, 'items': entries}
    output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Saved {len(entries)} public headlines from {sum(s["ok"] for s in source_reports)}/{len(FEEDS)} official feeds.')
    return data


if __name__ == '__main__':
    build()
