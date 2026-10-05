from pathlib import Path
import reportlab
from html import escape
import json
from reportlab.platypus import SimpleDocTemplate, Paragraph, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / 'public'
d = json.loads((BASE / 'lib/resume-data.json').read_text())
contributions = json.loads((BASE / 'lib/contributions.json').read_text())
FONTS = Path(reportlab.__file__).parent / 'fonts'
for face, filename in [('Resume', 'Vera.ttf'), ('ResumeBold', 'VeraBd.ttf')]:
    pdfmetrics.registerFont(TTFont(face, str(FONTS / filename)))
pdfmetrics.registerFontFamily('Resume', normal='Resume', bold='ResumeBold')
body = ParagraphStyle('body', fontName='Resume', fontSize=9.7, leading=11.6, textColor=HexColor('#20262c'), spaceAfter=2)
section = ParagraphStyle('section', parent=body, fontName='ResumeBold', fontSize=10, textColor=HexColor('#233d56'), spaceBefore=5, spaceAfter=3)
role = ParagraphStyle('role', parent=body, fontName='ResumeBold', spaceAfter=2)
bullet = ParagraphStyle('bullet', parent=body, leftIndent=8, firstLineIndent=-8, spaceAfter=2)
name = ParagraphStyle('name', parent=body, fontName='ResumeBold', fontSize=24, leading=28, spaceAfter=4)
headline = ParagraphStyle('headline', parent=body, fontName='ResumeBold', fontSize=11, leading=14, spaceAfter=5)
contact = ParagraphStyle('contact', parent=body, fontSize=9.6, leading=12.5, spaceAfter=2)
story = []
def p(s, style=body): return Paragraph(s, style)
def heading(s): story.append(p(s.upper(), section))
def link(label, url): return f'<link href="{escape(url, quote=True)}">{escape(label)}</link>'
story += [p(d['name'], name), p(escape(d['headline']), headline),
          p(f'{d["location"]} | {link(d["email"], "mailto:" + d["email"])}', contact),
          p(' | '.join([link('whiteye.in/resume', 'https://whiteye.in/resume'), link('github.com/maskjelly', 'https://github.com/maskjelly'), link('x.com/aaryantwt', 'https://x.com/aaryantwt')]), contact)]
story.append(p('<b>Waterloo dropout. Hacked rice.edu at 17</b> (responsibly disclosed SQL injection) and Waterloo’s GPU cluster. Early engineer at ' + link('Extraordinary', 'https://extraordinary.com') + '; founding engineer at ReferRush. Built a Rust service benchmarked at <b>1.34M req/s</b> (four-vCPU loopback, pipeline 512).'))
heading('Experience')
for e in d['experience']:
    title = ' | '.join([e['role'], e['company'], e['period']] + ([e['location']] if 'location' in e else []))
    story.append(KeepTogether([p(escape(title), role), p('- ' + escape(e['bullets'][0]), bullet)]))
    story += [p('- ' + escape(b), bullet) for b in e['bullets'][1:]]
heading('Selected projects')
for project in d['projects']:
    description = project['description']
    if project.get('pdfExtra'):
        description += ' ' + project['pdfExtra']
    story.append(p(f'<b>{link(project["name"], project["url"])} | {escape(project["stack"])}.</b> {escape(description)}'))
heading('Open source')
display_names = {'atuin': 'Atuin', 'podman-desktop': 'Podman Desktop', 'webtui': 'WebTUI'}
credits = ', '.join(link(display_names.get(r['name'], r['name']), r['url']) + f' ({r["stars"]:,} stars)' for r in contributions['repositories'][:5])
story.append(p('<b>Contributor: 47 merged PRs across 13 repositories.</b> ' + credits + '; 27 PRs in termlens. Star counts: Oct 2, 2026.'))
heading('Technical skills')
for skill in d['skills']: story.append(p(f'<b>{escape(skill["label"])}:</b> {escape(skill["value"])}'))
heading('Education & recognition')
story += [p(escape(d['education'])), p(escape(d['honors'][d['honors'].index('National Math'):]))]
pdf = OUT / 'Aaryan-Singh-Resume.pdf'
SimpleDocTemplate(str(pdf), pagesize=(612, 792), leftMargin=35, rightMargin=35, topMargin=29, bottomMargin=29,
                  title='Aaryan Singh | Software Engineer', author=d['name']).build(story)
reader = PdfReader(pdf)
assert len(reader.pages) == 1, f'Expected one page, got {len(reader.pages)}'
text = ' '.join(reader.pages[0].extract_text().split())
for term in ['instantKV', '95.13%', '14.34 MiB', '85.20%', 'OpenCode', '47 merged', 'MailTime', 'ReferRush', '1.34M', 'EDUCATION', 'GPU cluster', '31,876', 'Extraordinary', 'Waterloo dropout']:
    assert term in text, term
links = [a.get_object().get('/A', {}).get('/URI') for a in reader.pages[0].get('/Annots', [])]
assert all(project['url'] in links for project in d['projects'])
print(f'{len(reader.pages)} page; {len(text.split())} words; {len(links)} clickable links')
