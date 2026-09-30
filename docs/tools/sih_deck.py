"""Build the SIH 2026 idea presentation inside the official template (6 slides max, PDF for upload).
Usage: TEAM_NAME="..." TEAM_ID="..." python docs/tools/sih_deck.py <template.pptx> <shots_dir> <out.pptx>
"""
import os, sys, copy
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
from lxml import etree

TEMPLATE, SHOTS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
TEAM = os.environ.get('TEAM_NAME', 'Your Team Name')
TEAM_ID = os.environ.get('TEAM_ID', '<Team ID>')

NAVY, BLUE = RGBColor(0x1F, 0x49, 0x7D), RGBColor(0x00, 0x70, 0xC0)
HONEY, GREEN, RED = RGBColor(0xE9, 0xA2, 0x3B), RGBColor(0x2E, 0x7D, 0x4F), RGBColor(0xB3, 0x37, 0x2F)
INK, GREY, LIGHT, LINE = RGBColor(0x1B, 0x1A, 0x17), RGBColor(0x59, 0x59, 0x59), RGBColor(0xF3, 0xF6, 0xFB), RGBColor(0xD5, 0xDE, 0xEB)
WHITE = RGBColor(255, 255, 255)
FONT = 'Arial'

prs = Presentation(TEMPLATE)

# ---------- helpers ----------
def drop_shape(shape):
    shape._element.getparent().remove(shape._element)

def add_runs(par, runs, size, color, bold=False, underline=False):
    for r in runs:
        text, opts = (r, {}) if isinstance(r, str) else r
        run = par.add_run(); run.text = text
        f = run.font; f.name = FONT; f.size = Pt(opts.get('size', size)); f.bold = opts.get('bold', bold)
        f.underline = opts.get('underline', underline); f.color.rgb = opts.get('color', color)

def set_bullet(par, char='•', indent=0.17, color=None):
    pPr = par._p.get_or_add_pPr()
    pPr.set('marL', str(int(Inches(indent)))); pPr.set('indent', str(-int(Inches(indent))))
    for tag in ('a:buNone', 'a:buChar', 'a:buAutoNum'):
        for e in pPr.findall(qn(tag)): pPr.remove(e)
    if color is not None:
        bc = etree.SubElement(pPr, qn('a:buClr')); c = etree.SubElement(bc, qn('a:srgbClr')); c.set('val', str(color))
    bu = etree.SubElement(pPr, qn('a:buChar')); bu.set('char', char)

def tb(slide, x, y, w, h, items, anchor=MSO_ANCHOR.TOP, fill=None, line=None, margin=0.05):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = Inches(margin); tf.margin_top = tf.margin_bottom = Inches(0.03)
    if fill is not None: box.fill.solid(); box.fill.fore_color.rgb = fill
    if line is not None: box.line.color.rgb = line; box.line.width = Pt(0.75)
    first = True
    for it in items:
        par = tf.paragraphs[0] if first else tf.add_paragraph(); first = False
        runs = it['runs'] if 'runs' in it else [it['text']]
        add_runs(par, runs, it.get('size', 12), it.get('color', INK), it.get('bold', False), it.get('underline', False))
        par.alignment = it.get('align', PP_ALIGN.LEFT)
        par.space_after = Pt(it.get('after', 3)); par.space_before = Pt(it.get('before', 0))
        if it.get('bullet'): set_bullet(par, color=it.get('bcolor'))
    return box

def rect(slide, x, y, w, h, fill=None, line=None, shape=MSO_SHAPE.RECTANGLE, lw=0.75):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None: s.fill.background()
    else: s.fill.solid(); s.fill.fore_color.rgb = fill
    if line is None: s.line.fill.background()
    else: s.line.color.rgb = line; s.line.width = Pt(lw)
    s.shadow.inherit = False
    return s

def label_shape(shape, text, size=11, bold=True, color=WHITE, align=PP_ALIGN.CENTER):
    tf = shape.text_frame; tf.word_wrap = True; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = Inches(0.06); tf.margin_top = tf.margin_bottom = Inches(0.02)
    par = tf.paragraphs[0]; par.alignment = align
    add_runs(par, [text], size, color, bold)

def pic(slide, name, x, y, w=None, h=None, border=True):
    p = slide.shapes.add_picture(os.path.join(SHOTS, name), Inches(x), Inches(y), Inches(w) if w else None, Inches(h) if h else None)
    if border: p.line.color.rgb = LINE; p.line.width = Pt(1)
    return p

def heading(slide, y, text, x=0.4, w=12.5, size=15):
    return tb(slide, x, y, w, 0.42, [{'runs': [('❖ ', {'color': NAVY}), (text, {'color': NAVY, 'underline': True})], 'size': size, 'bold': True}])

def find(slide, name):
    return next(s for s in slide.shapes if s.name == name)

def set_oval(slide):
    for s in slide.shapes:
        if s.name.startswith('Oval'):
            par = s.text_frame.paragraphs[0]
            for r in par.runs[1:]: r._r.getparent().remove(r._r)
            par.runs[0].text = TEAM; par.runs[0].font.size = Pt(9 if len(TEAM) > 14 else 11)

slides = list(prs.slides)

# ---------- 1. TITLE ----------
s1 = slides[0]
box = find(s1, 'TextBox 9')
vals = {
    'Problem Statement ID': ('Problem Statement ID – ', 'SIH26021'),
    'Problem Statement Title': ('Problem Statement Title- ', 'Honey Chain: A block chain-based system for honey traceability and smart beekeeping management.'),
    'Theme': ('Theme- ', 'Agriculture, FoodTech & Rural Development'),
    'PS Category': ('PS Category- ', 'Software'),
    'Team ID': ('Team ID- ', TEAM_ID),
    'Team Name': ('Team Name (Registered on portal)- ', TEAM),
}
for par in box.text_frame.paragraphs:
    if not par.runs: continue
    key = next((k for k in vals if par.runs[0].text.startswith(k)), None)
    if not key: continue
    label, value = vals[key]
    for r in par.runs[1:]: r._r.getparent().remove(r._r)
    par.runs[0].text = label; par.runs[0].font.size = Pt(18)
    v = par.add_run(); v.text = value; v.font.size = Pt(18); v.font.bold = True; v.font.color.rgb = NAVY; v.font.name = par.runs[0].font.name
    par.space_after = Pt(5); par.line_spacing = 1.0; par.alignment = PP_ALIGN.LEFT
    par.runs[0].font.size = Pt(17); v.font.size = Pt(17)
    if key == 'Problem Statement Title': v.font.size = Pt(14)

# ---------- 2. IDEA TITLE ----------
s = slides[1]
for r in find(s, 'Title 1').text_frame.paragraphs[0].runs: r.text = ''
find(s, 'Title 1').text_frame.paragraphs[0].runs[-1].text = 'HONEY CHAIN – Blockchain-verified honey, hive to shelf'
find(s, 'Title 1').text_frame.paragraphs[0].runs[-1].font.size = Pt(21)
drop_shape(find(s, 'TextBox 8')); set_oval(s)
heading(s, 1.3, 'Proposed Solution (Describe your Idea/Solution/Prototype)', w=7.6)

def block(slide, y, label, bullets, color=NAVY, w=7.5, x=0.4, size=11.5):
    items = [{'text': label, 'size': 13, 'bold': True, 'color': color, 'after': 2}]
    items += [{'text': b, 'size': size, 'bullet': True, 'bcolor': HONEY, 'after': 2} for b in bullets]
    return tb(slide, x, y, w, 0.3 + 0.27 * len(bullets), items)

block(s, 1.78, 'Detailed explanation of the proposed solution', [
    'Every hive gets a digital ID; every harvest becomes a QR-coded batch',
    'Labs seal purity results (incl. NMR + rice-syrup marker) on the ledger',
    'Buyer scans the QR → origin, lab report, journey, 0-100 trust score',
    'IoT + AI monitor hive health and forecast yield; data anchored on-chain'])
block(s, 3.62, 'How it addresses the problem', [
    'No lab certificate on the ledger = no trust score, so fakes cannot pass',
    'Yield is cross-checked with hive data: "95 kg from 1 hive" gets flagged',
    'Provable quality earns beekeepers premium prices and direct buyers'])
block(s, 5.05, 'Innovation and uniqueness of the solution', [
    'Lab-agnostic trust layer: works with NMR, SMR, C4 and HMF results',
    'Sensor-anchored yield check catches blending that chemistry can miss',
    'Offline-first bilingual PWA + zero-fee permissioned chain for villages'])
pic(s, 'phone-genuine.png', 8.3, 1.35, h=4.75); pic(s, 'phone-fake.png', 10.7, 1.35, h=4.75)
tb(s, 8.2, 6.14, 2.4, 0.6, [{'text': 'Genuine batch', 'size': 10.5, 'bold': True, 'color': GREEN, 'align': PP_ALIGN.CENTER, 'after': 0}, {'text': 'Trust score 100', 'size': 10, 'color': GREY, 'align': PP_ALIGN.CENTER}])
tb(s, 10.6, 6.14, 2.4, 0.6, [{'text': 'Fake batch', 'size': 10.5, 'bold': True, 'color': RED, 'align': PP_ALIGN.CENTER, 'after': 0}, {'text': 'Trust score 20 - do not buy', 'size': 10, 'color': GREY, 'align': PP_ALIGN.CENTER}])

# ---------- 3. TECHNICAL APPROACH ----------
s = slides[2]
drop_shape(find(s, 'TextBox 8')); set_oval(s)
heading(s, 1.3, 'Technologies to be used (e.g. programming languages, frameworks, hardware)', w=7.9, size=13)
rows = [
    ('Frontend', 'React 18 · Vite · offline-first installable PWA · QR camera scan · Web Crypto', BLUE),
    ('Ledger', 'SHA-256 hash-chain · Proof-of-Authority validators · Merkle roots · Solidity → Hyperledger Besu', NAVY),
    ('IoT', 'ESP32 · load cell · DS18B20 · DHT22 · MEMS mic · CO₂ · LoRa · solar', GREEN),
    ('AI', 'Explainable feature model (prototype) → CNN on hive audio via TensorFlow Lite Micro', HONEY),
    ('DevOps', 'GitHub Actions CI · GitHub Pages / Vercel / Docker (nginx) · service-worker caching', GREY),
]
for i, (k, v, c) in enumerate(rows):
    y = 1.78 + i * 0.56
    r = rect(s, 0.4, y, 1.15, 0.48, fill=c); label_shape(r, k, 11)
    tb(s, 1.6, y, 6.6, 0.48, [{'text': v, 'size': 11, 'color': INK}], anchor=MSO_ANCHOR.MIDDLE, fill=LIGHT)
pic(s, 'desk-hive-detail.png', 8.45, 1.32, w=4.45)
tb(s, 8.45, 4.08, 4.45, 0.5, [{'runs': [('Working prototype: ', {'bold': True, 'color': NAVY}), 'live hive dashboard - AI flags "Pre-swarm 98%" with advice and yield forecast'], 'size': 10, 'color': GREY}])
heading(s, 4.72, 'Methodology and process for implementation (Flow Charts/Images/ working prototype)', size=13)
steps = [('1 Register', 'Hive gets a digital ID'), ('2 Sense', 'IoT + AI watch colony health'), ('3 Harvest', 'Batch + QR code created'), ('4 Certify', 'Lab result (NMR/SMR/C4/HMF) sealed'), ('5 Move', 'Every custody handover logged'), ('6 Verify', 'Buyer scans QR: trust score')]
for i, (h, d) in enumerate(steps):
    x = 0.4 + i * 2.09
    sh = rect(s, x, 5.2, 2.0, 0.6, fill=NAVY if i < 5 else GREEN, shape=MSO_SHAPE.PENTAGON); label_shape(sh, h, 12)
    tb(s, x, 5.85, 2.0, 0.85, [{'text': d, 'size': 10.5, 'color': INK, 'align': PP_ALIGN.CENTER}])
tb(s, 0.4, 6.55, 12.5, 0.32, [{'text': 'Only hashes go on-chain; raw sensor data stays local and is anchored as a Merkle root, so a 2G link is enough.', 'size': 10, 'color': GREY, 'align': PP_ALIGN.CENTER}])

# ---------- 4. FEASIBILITY ----------
s = slides[3]
drop_shape(find(s, 'TextBox 8')); set_oval(s)
cols = [
    ('Analysis of the feasibility of the idea', GREEN, [
        'Working prototype already live: ledger, QR verify, lab portal, hive AI',
        'Estimated hardware ₹1.5-2.5k per hive; one LoRa gateway serves 20-40 hives*',
        'Permissioned PoA: no mining, no gas; validators are KVIC, FSSAI and labs',
        'Fits existing NBHM / KVIC clusters and NABL-accredited labs']),
    ('Potential challenges and risks', RED, [
        'Garbage-in: a dishonest lab or beekeeper can enter false data',
        'Engineered syrups can pass basic tests (CSE 2020: NMR failures)',
        'Patchy connectivity and low digital literacy',
        'QR cloning and jar refilling']),
    ('Strategies for overcoming these challenges', NAVY, [
        'Accredited-lab keys, random audits, IoT weight vs claimed-yield check',
        'Anchor NMR + rice-syrup marker results; design stays lab-agnostic',
        'Offline-first bilingual PWA, QR-first flows, LoRa gateways',
        'Per-jar serials and single-use claim codes (roadmap)']),
]
for i, (h, c, bl) in enumerate(cols):
    x = 0.4 + i * 4.2
    hd = rect(s, x, 1.4, 4.05, 0.5, fill=c); label_shape(hd, h, 12.5)
    tb(s, x, 1.9, 4.05, 2.75, [{'text': b, 'size': 11.5, 'bullet': True, 'bcolor': c, 'after': 5} for b in bl], fill=LIGHT, margin=0.12)
band = rect(s, 0.4, 4.85, 12.5, 0.36, fill=NAVY); label_shape(band, 'Validation and rollout plan', 12, True, WHITE, PP_ALIGN.LEFT)
tb(s, 0.5, 5.24, 12.4, 0.36, [{'text': 'Validate first: 10-minute interviews with 5 beekeepers, 2 NABL labs and 1 KVIC field officer (script prepared), then run the pilot.', 'size': 11, 'color': INK}])
ph = [('Pilot', '0-3 months', '2 clusters · 50 beekeepers · 100 hives · 1 lab'), ('State', '4-9 months', '10 clusters · 3 states · QR at Khadi outlets'), ('Regional', '10-18 months', 'All Honey Mission states · FSSAI dashboard'), ('National', 'Year 2+', 'Open API · export certificates · trained AI')]
for i, (n, t, d) in enumerate(ph):
    x = 0.4 + i * 3.14
    ch = rect(s, x, 5.7, 3.05, 0.5, fill=[BLUE, RGBColor(0x2F, 0x6B, 0x92), GREEN, HONEY][i], shape=MSO_SHAPE.PENTAGON)
    label_shape(ch, f'{n} · {t}', 10.5, True, WHITE if i < 3 else INK)
for i, (_, _, d) in enumerate(ph):
    tb(s, 0.4 + i * 3.14, 6.24, 3.05, 0.5, [{'text': d, 'size': 10, 'color': INK, 'align': PP_ALIGN.CENTER}])
tb(s, 0.4, 6.68, 12.5, 0.25, [{'text': '*Planning estimates, to be validated during the pilot.', 'size': 9, 'color': GREY}])

# ---------- 5. IMPACT ----------
s = slides[4]
drop_shape(find(s, 'TextBox 8')); set_oval(s)
heading(s, 1.3, 'Potential impact on the target audience', w=8, size=14)
aud = [('Beekeepers', ['Proof of quality → premium price, direct buyers', 'Early disease alerts cut colony loss']),
       ('Consumers', ['Scan-to-verify in seconds', 'Fake batches flagged before purchase']),
       ('KVIC & regulators', ['Cluster dashboards: output, adulteration flags', 'Targeted extension support']),
       ('Processors & retailers', ['Trusted supply chain, lower recall risk', 'Verified, premium-ready listings'])]
for i, (h, bl) in enumerate(aud):
    x = 0.4 + (i % 2) * 3.95; y = 1.75 + (i // 2) * 1.5
    hd = rect(s, x, y, 3.85, 0.36, fill=NAVY); label_shape(hd, h, 11.5, True, WHITE, PP_ALIGN.LEFT)
    tb(s, x, y + 0.36, 3.85, 1.05, [{'text': b, 'size': 11, 'bullet': True, 'bcolor': HONEY, 'after': 3} for b in bl], fill=LIGHT, margin=0.1)
heading(s, 4.82, 'Benefits of the solution (social, economic, environmental, etc.)', w=8, size=14)
ben = [('Social', GREEN, ['Trust in rural produce', 'Livelihood security incl. SHGs', 'Bilingual, low-literacy UX']),
       ('Economic', HONEY, ['Higher realisation per kg', 'Fewer fraud losses for buyers', 'Export-ready traceability']),
       ('Environmental', BLUE, ['Healthier colonies → pollination', 'Targeted treatment, less chemical', 'Low-energy ledger (no mining)'])]
for i, (h, c, bl) in enumerate(ben):
    x = 0.4 + i * 2.65
    hd = rect(s, x, 5.25, 2.55, 0.34, fill=c); label_shape(hd, h, 11.5, True, WHITE if c != HONEY else INK)
    tb(s, x, 5.59, 2.55, 1.25, [{'text': b, 'size': 10.5, 'bullet': True, 'bcolor': c, 'after': 2} for b in bl], fill=LIGHT, margin=0.08)
# right: cited callouts
tb(s, 8.6, 1.3, 4.3, 0.4, [{'text': 'WHY NOW - from public sources', 'size': 11, 'bold': True, 'color': NAVY}])
call = [('17 of 22', 'honey samples tested were adulterated with sugar syrup (77%)', 'CSE investigation, Dec 2020', RED),
        ('1.4 lakh MT', 'natural honey produced in India in 2024', 'PIB - National Beekeeping & Honey Mission', GREEN),
        ('₹500 crore', 'NBHM outlay, FY 2020-21 to 2025-26 - production is growing, trust must keep pace', 'PIB', BLUE)]
for i, (n, d, src, c) in enumerate(call):
    y = 1.75 + i * 1.7
    rect(s, 8.6, y, 0.09, 1.5, fill=c)
    tb(s, 8.78, y - 0.02, 4.15, 1.55, [{'text': n, 'size': 26, 'bold': True, 'color': c, 'after': 0}, {'text': d, 'size': 11, 'color': INK, 'after': 2}, {'text': src, 'size': 9, 'color': GREY}])

# ---------- 6. RESEARCH & REFERENCES ----------
s = slides[5]
drop_shape(find(s, 'TextBox 8')); set_oval(s)
heading(s, 1.3, 'Details / Links of the reference and research work', w=8.4, size=14)
refs = [
    ('CSE, "Laboratory results of honey testing" (Dec 2020) - NMR tests on branded honey', 'cdn.downtoearth.org.in/report_laboratory_results_of_honey_testing_20201201.pdf'),
    ('FSSAI press release reviewing the CSE honey-sample issue (3 Dec 2020)', 'fssai.gov.in/upload/press_release/2020/12/5fc8eb6d70965Press_Release_Honey_Sample_03_12_2020.pdf'),
    ('PIB, "National Beekeeping & Honey Mission" - budget, production and export data', 'pib.gov.in/PressReleasePage.aspx?PRID=2185400'),
    ('National Bee Board - NBHM portal', 'nbb.gov.in'),
    ('The Tribune, "Honeytrap" - syrups designed to bypass purity tests', 'tribuneindia.com/news/nation/honeytrap-cse-investigations-claim-nefarious-adulteration-business-of-honey-designed-to-bypass-purity-tests-178930'),
    ('Business Standard - FSSAI on the SMR (rice-syrup marker) test', 'business-standard.com/article/companies/fssai-questions-cse-for-not-conducting-smr-test-on-honey-brands-120120301199_1.html'),
]
items = []
for i, (t, u) in enumerate(refs):
    items.append({'runs': [(f'{i + 1}. ', {'bold': True, 'color': NAVY}), (t, {'bold': True})], 'size': 11.5, 'after': 0})
    items.append({'text': u, 'size': 8.5, 'color': BLUE, 'after': 7})
tb(s, 0.4, 1.75, 8.4, 3.9, items)
tb(s, 0.4, 5.6, 8.4, 1.25, [
    {'text': 'Research takeaways applied in the design', 'size': 12, 'bold': True, 'color': NAVY, 'after': 2},
    {'text': 'Engineered syrups can pass C4/HMF but fail NMR → the ledger is lab-agnostic and also anchors NMR + SMR results', 'size': 10.5, 'bullet': True, 'bcolor': HONEY, 'after': 2},
    {'text': 'Domestic honey testing lacks a single verifiable trail → tamper-evident batch records and a public trust score', 'size': 10.5, 'bullet': True, 'bcolor': HONEY, 'after': 2},
    {'text': 'Lab limits in the prototype are indicative (FSSAI/BIS-style); final limits come from the notified lab', 'size': 10.5, 'bullet': True, 'bcolor': HONEY}], fill=LIGHT, margin=0.1)
rect(s, 9.1, 1.35, 3.8, 5.45, fill=None, line=LINE)
tb(s, 9.2, 1.42, 3.6, 0.35, [{'text': 'TRY THE PROTOTYPE', 'size': 11, 'bold': True, 'color': NAVY, 'align': PP_ALIGN.CENTER}])
pic(s, 'qr-demo.png', 9.45, 1.85, w=1.5, border=False); pic(s, 'qr-repo.png', 11.05, 1.85, w=1.5, border=False)
tb(s, 9.2, 3.4, 1.9, 0.7, [{'text': 'Live demo', 'size': 10.5, 'bold': True, 'align': PP_ALIGN.CENTER, 'after': 0}, {'text': 'suyash2527.github.io/HoneyChain', 'size': 7.5, 'color': BLUE, 'align': PP_ALIGN.CENTER}])
tb(s, 10.9, 3.4, 1.9, 0.7, [{'text': 'Source code', 'size': 10.5, 'bold': True, 'align': PP_ALIGN.CENTER, 'after': 0}, {'text': 'github.com/Suyash2527/HoneyChain', 'size': 7.5, 'color': BLUE, 'align': PP_ALIGN.CENTER}])
pic(s, 'qr-verify.png', 10.3, 4.2, w=1.2, border=False)
tb(s, 9.2, 5.45, 3.6, 1.3, [{'text': 'Scan to verify a genuine sample batch', 'size': 10.5, 'bold': True, 'align': PP_ALIGN.CENTER, 'after': 2},
                            {'text': 'React · PWA · SHA-256 PoA ledger · IoT + AI simulation. MIT licensed, open source.', 'size': 9, 'color': GREY, 'align': PP_ALIGN.CENTER}])

# ---------- drop "Important instructions" slide, set team on remaining slides ----------
for sl in slides[1:6]: pass
sldIdLst = prs.slides._sldIdLst
last = sldIdLst[-1]
prs.part.drop_rel(last.rId); sldIdLst.remove(last)
prs.save(OUT)
print('saved', OUT, 'slides:', len(prs.slides))
