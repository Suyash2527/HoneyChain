// Honey Chain - SIH26021 pitch deck, styled with the app's "Provenance Standard" design system.
// Usage: DEMO_URL=https://your-public-url node docs/build-deck.mjs
import pptxgen from 'pptxgenjs'

const REPO = 'github.com/Suyash2527/HoneyChain'
const DEMO_URL = process.env.DEMO_URL || ''
const TEAM = process.env.TEAM || 'Team name'

const C = { paper: 'FAF6EC', panel: 'F4EEDA', line: 'E2DAC5', ink: '1B1A17', ink2: '58554E', ink3: '8A857B', green: '1F4D3A', deep: '02281C', amber: 'E9A23B', amberInk: '845400', ok: '2E7D4F', bad: 'B3372F', info: '2F5D8C', white: 'FFFFFF', cream: 'F4EFE0' }
const SERIF = 'Georgia', SANS = 'Segoe UI', MONO = 'Consolas'
const p = new pptxgen()
p.layout = 'LAYOUT_WIDE'
p.title = 'Honey Chain - SIH26021'
let n = 0

const hex = (s, x, y, w, fill, line, lw = 1.5) => s.addShape(p.ShapeType.hexagon, { x, y, w, h: w * 0.9, fill: fill ? { color: fill } : { type: 'none' }, line: line ? { color: line, width: lw } : { type: 'none' } })

function slide(kicker, title, bil) {
  const s = p.addSlide(); n++
  s.background = { color: C.paper }
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 0.22, h: 7.5, fill: { color: C.green } })
  s.addText(kicker.toUpperCase(), { x: 0.75, y: 0.42, w: 9, h: 0.3, fontFace: MONO, fontSize: 11, color: C.amberInk, charSpacing: 4, bold: true })
  s.addText(title, { x: 0.75, y: 0.72, w: 11.8, h: 0.95, fontFace: SERIF, fontSize: 30, bold: true, color: C.ink, valign: 'top' })
  if (bil) s.addText(bil, { x: 0.75, y: 1.55, w: 11.8, h: 0.3, fontFace: SANS, fontSize: 11, color: C.ink2 })
  s.addShape(p.ShapeType.line, { x: 0.75, y: 1.95, w: 11.85, h: 0, line: { color: C.line, width: 1 } })
  s.addShape(p.ShapeType.line, { x: 0.75, y: 7.0, w: 11.85, h: 0, line: { color: C.line, width: 0.75 } })
  s.addText('HONEY CHAIN · SIH26021 · KVIC HONEY MISSION', { x: 0.75, y: 7.05, w: 8, h: 0.3, fontFace: MONO, fontSize: 9, color: C.ink3, charSpacing: 2 })
  s.addText(String(n).padStart(2, '0'), { x: 11.6, y: 7.05, w: 1, h: 0.3, fontFace: MONO, fontSize: 10, color: C.ink3, align: 'right' })
  return s
}

// Hairline-framed block with serif heading (no shadows, per the design system)
function block(s, x, y, w, h, head, body, accent = C.green, fill = C.white) {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: C.line, width: 1 } })
  s.addShape(p.ShapeType.rect, { x, y: y + 0.18, w: 0.06, h: 0.42, fill: { color: accent } })
  s.addText(head, { x: x + 0.22, y: y + 0.12, w: w - 0.4, h: 0.5, fontFace: SERIF, fontSize: 15, bold: true, color: C.ink, valign: 'middle' })
  s.addText(body, { x: x + 0.22, y: y + 0.68, w: w - 0.4, h: h - 0.8, fontFace: SANS, fontSize: 12, color: C.ink2, valign: 'top', paraSpaceAfter: 3 })
}

// ---------- 1 Title ----------
{
  const s = p.addSlide(); n++
  s.background = { color: C.deep }
  hex(s, 8.6, 0.6, 5.4, null, C.amber, 1); hex(s, 9.5, 1.5, 3.6, null, C.amber, 1.5)
  hex(s, 10.3, 2.3, 2.0, C.green, C.amber, 2.5)
  s.addText('100', { x: 10.3, y: 2.75, w: 2.0, h: 0.8, align: 'center', fontFace: SERIF, fontSize: 40, bold: true, color: C.amber })
  s.addText('TRUST SCORE', { x: 10.3, y: 3.5, w: 2.0, h: 0.3, align: 'center', fontFace: MONO, fontSize: 8, color: 'BFE0CF', charSpacing: 3 })
  s.addText('SMART INDIA HACKATHON 2026 · PS SIH26021', { x: 0.8, y: 1.2, w: 8, h: 0.4, fontFace: MONO, fontSize: 12, color: C.amber, charSpacing: 4, bold: true })
  s.addText('Honey Chain', { x: 0.8, y: 1.75, w: 8, h: 1.3, fontFace: SERIF, fontSize: 66, bold: true, color: C.cream })
  s.addText('Every jar of honey, proven from hive to shelf.', { x: 0.8, y: 3.05, w: 7.6, h: 0.9, fontFace: SERIF, italic: true, fontSize: 24, color: 'A9D1BB' })
  s.addText('Blockchain traceability + IoT and AI smart beekeeping for rural India', { x: 0.8, y: 4.15, w: 7.6, h: 0.5, fontFace: SANS, fontSize: 15, color: C.cream })
  s.addText('Ministry of MSME · KVIC Honey Mission · Agriculture, FoodTech & Rural Development', { x: 0.8, y: 4.75, w: 7.6, h: 0.4, fontFace: SANS, fontSize: 12, color: 'A5C3B4' })
  s.addShape(p.ShapeType.line, { x: 0.8, y: 6.3, w: 11.8, h: 0, line: { color: '3A5F4E', width: 1 } })
  s.addText(`${TEAM}   ·   ${DEMO_URL || REPO}`, { x: 0.8, y: 6.45, w: 11.8, h: 0.4, fontFace: MONO, fontSize: 12, color: C.amber })
}

// ---------- 2 Problem ----------
{
  const s = slide('The problem', 'Honest beekeepers cannot prove their honey is real', 'ईमानदार मधुमक्खी पालक अपने शहद की शुद्धता साबित नहीं कर पाते')
  const items = [['Counterfeit honey', 'Syrup-blended honey looks and tastes close to the real thing and sits on the same shelf.'], ['Low consumer trust', 'Paper labels and logos are easy to copy, so buyers discount every producer.'], ['Weak market linkage', 'With no proof of quality, rural beekeepers sell to middlemen at commodity prices.'], ['No hive intelligence', 'Disease, queen loss and swarming are noticed late - lost colonies, lost yield.']]
  items.forEach(([h, b], i) => block(s, 0.75 + (i % 2) * 6.0, 2.25 + Math.floor(i / 2) * 1.75, 5.85, 1.55, h, b, C.bad))
  s.addShape(p.ShapeType.roundRect, { x: 0.75, y: 5.85, w: 11.85, h: 0.95, rectRadius: 0.08, fill: { color: C.panel }, line: { color: C.line } })
  s.addText([{ text: 'Context  ', options: { bold: true, color: C.amberInk, fontFace: MONO } }, { text: 'KVIC\'s Honey Mission gives rural beekeepers bee boxes and extraction toolkits. Production is growing; authenticity, traceability and hive-management support have not kept pace.', options: { color: C.ink } }], { x: 0.95, y: 5.88, w: 11.5, h: 0.9, fontFace: SANS, fontSize: 13, valign: 'middle' })
}

// ---------- 3 Solution ----------
{
  const s = slide('Our solution', 'One ledger from hive to jar', 'छत्ते से जार तक एक बहीखाता')
  const steps = [['01', 'Register', 'Each bee box gets a digital ID'], ['02', 'Sense', 'IoT and AI watch colony health'], ['03', 'Harvest', 'Batch and QR code created'], ['04', 'Certify', 'Lab result sealed on chain'], ['05', 'Move', 'Every handover logged'], ['06', 'Verify', 'Buyer scans and sees the truth']]
  steps.forEach(([k, h, b], i) => {
    const x = 0.75 + i * 1.98
    s.addShape(p.ShapeType.rect, { x, y: 2.3, w: 1.9, h: 1.85, fill: { color: i === 5 ? C.green : C.white }, line: { color: i === 5 ? C.green : C.line, width: 1 } })
    s.addText(k, { x: x + 0.15, y: 2.38, w: 1.6, h: 0.5, fontFace: SERIF, fontSize: 26, color: C.amber, bold: true })
    s.addText(h, { x: x + 0.15, y: 2.88, w: 1.6, h: 0.35, fontFace: SERIF, fontSize: 15, bold: true, color: i === 5 ? C.cream : C.ink })
    s.addText(b, { x: x + 0.15, y: 3.25, w: 1.65, h: 0.85, fontFace: SANS, fontSize: 10.5, color: i === 5 ? 'CFE6DA' : C.ink2, valign: 'top' })
  })
  block(s, 0.75, 4.45, 3.85, 2.3, 'Blockchain traceability', 'Tamper-evident batch records, QR verification, a 0-100 trust score, and lab failures that stay on record permanently.')
  block(s, 4.75, 4.45, 3.85, 2.3, 'IoT hive monitoring', 'Weight, brood temperature, humidity, colony sound, CO2 and entrance activity from a low-cost ESP32 node.', C.amber)
  block(s, 8.75, 4.45, 3.85, 2.3, 'AI analytics', 'Detects varroa, foulbrood, queen loss, swarming and starvation, and forecasts 30-day yield with plain-language advice.', C.info)
}

// ---------- 4 Architecture ----------
{
  const s = slide('System design', 'Inexpensive at the edge, trusted at the core', 'गाँव में सस्ता, केंद्र में भरोसेमंद')
  const layer = (y, label, sub, fill, items, tone) => {
    s.addShape(p.ShapeType.rect, { x: 0.75, y, w: 11.85, h: 0.98, fill: { color: fill }, line: { color: C.line } })
    s.addText(label, { x: 0.9, y: y + 0.08, w: 2.6, h: 0.5, fontFace: SERIF, fontSize: 14, bold: true, color: tone || C.ink })
    s.addText(sub, { x: 0.9, y: y + 0.55, w: 2.6, h: 0.4, fontFace: MONO, fontSize: 8.5, color: C.ink3 })
    const w = (8.7 - 0.12 * (items.length - 1)) / items.length
    items.forEach((t, i) => {
      s.addShape(p.ShapeType.rect, { x: 3.7 + i * (w + 0.12), y: y + 0.16, w, h: 0.7, fill: { color: C.white }, line: { color: C.line } })
      s.addText(t, { x: 3.7 + i * (w + 0.12), y: y + 0.16, w, h: 0.7, align: 'center', valign: 'middle', fontFace: SANS, fontSize: 10.5, color: C.ink })
    })
  }
  layer(2.15, 'Consumer & regulator', 'PUBLIC LAYER', 'FFFFFF', ['QR verification PWA (EN / हिन्दी)', 'Retailer verification API', 'FSSAI / KVIC dashboard'])
  layer(3.25, 'PoA blockchain', 'TRUST LAYER', 'E8EEF6', ['KVIC validator nodes', 'FSSAI node', 'Accredited lab nodes', 'Smart contract: batch, lab, custody'], C.info)
  layer(4.35, 'Cluster edge', 'KVIC CLUSTER', C.panel, ['Offline-first gateway', 'Edge AI: disease + yield', 'Merkle-root batching'])
  layer(5.45, 'Village layer', 'HIVE + BEEKEEPER', 'FFFFFF', ['ESP32 node: load cell, temp, humidity, mic', 'LoRa link, solar powered', 'Beekeeper app + QR labels'])
  s.addText('Only hashes go on-chain; raw sensor data stays local and is anchored as a Merkle root, so a 2G link is enough.', { x: 0.75, y: 6.52, w: 11.85, h: 0.3, fontFace: SERIF, italic: true, fontSize: 11, color: C.ink2 })
}

// ---------- 5 Blockchain ----------
{
  const s = slide('Blockchain design', 'Why a permissioned Proof-of-Authority chain', 'अनुमति-आधारित PoA ब्लॉकचेन क्यों')
  block(s, 0.75, 2.25, 3.85, 2.05, 'Tamper-evident', 'Each block hashes its own data and the previous block. Edit a record and its hash breaks; re-hash it and every later block breaks.', C.info)
  block(s, 4.75, 2.25, 3.85, 2.05, 'No fees, low energy', 'Validators are KVIC, FSSAI and labs. No mining and no gas - beekeepers never pay to write.', C.info)
  block(s, 8.75, 2.25, 3.85, 2.05, 'Role-based, accountable', 'Only registered beekeepers, labs, processors and retailers can write their own event types. Every block is signed by a known validator.', C.info)
  s.addText('ON-CHAIN EVENT TYPES', { x: 0.75, y: 4.55, w: 6, h: 0.3, fontFace: MONO, fontSize: 10, color: C.amberInk, charSpacing: 3, bold: true })
  const ev = ['HIVE_REGISTERED', 'HARVEST_LOGGED', 'SENSOR_ATTESTATION', 'LAB_CERTIFIED', 'CUSTODY_TRANSFER', 'RETAIL_PACKED']
  ev.forEach((e, i) => {
    const x = 0.75 + (i % 3) * 3.98, y = 4.95 + Math.floor(i / 3) * 0.75
    s.addShape(p.ShapeType.rect, { x, y, w: 3.85, h: 0.6, fill: { color: C.panel }, line: { color: C.line } })
    s.addText(e, { x, y, w: 3.85, h: 0.6, align: 'center', valign: 'middle', fontFace: MONO, fontSize: 12, bold: true, color: C.green })
  })
  s.addText('Solidity contract included in the repo · production target: Hyperledger Besu / Fabric-class network', { x: 0.75, y: 6.55, w: 11.85, h: 0.3, fontFace: SANS, fontSize: 11, color: C.ink2 })
}

// ---------- 6 Consumer verification (with phone mockup) ----------
{
  const s = slide('Consumer verification', 'Scan the QR. See the truth in seconds.', 'QR स्कैन करें, सच्चाई तुरंत जानें')
  // phone
  const px = 0.9, py = 2.15
  s.addShape(p.ShapeType.roundRect, { x: px, y: py, w: 3.0, h: 4.7, rectRadius: 0.28, fill: { color: C.ink }, line: { color: C.ink } })
  s.addShape(p.ShapeType.roundRect, { x: px + 0.09, y: py + 0.09, w: 2.82, h: 4.52, rectRadius: 0.22, fill: { color: C.paper }, line: { color: C.paper } })
  s.addText('HC-2026-0001', { x: px + 0.22, y: py + 0.2, w: 1.8, h: 0.25, fontFace: MONO, fontSize: 8, bold: true, color: C.green })
  s.addText('IMMUTABLE', { x: px + 1.9, y: py + 0.2, w: 0.9, h: 0.25, fontFace: MONO, fontSize: 6.5, color: C.ok, align: 'right', bold: true })
  s.addShape(p.ShapeType.roundRect, { x: px + 0.2, y: py + 0.55, w: 2.6, h: 2.15, rectRadius: 0.1, fill: { color: C.deep }, line: { color: C.deep } })
  s.addShape(p.ShapeType.ellipse, { x: px + 0.95, y: py + 0.7, w: 1.1, h: 1.1, fill: { type: 'none' }, line: { color: C.amber, width: 5 } })
  s.addText('100', { x: px + 0.95, y: py + 0.95, w: 1.1, h: 0.6, align: 'center', fontFace: SERIF, fontSize: 24, bold: true, color: C.amber })
  s.addText('Genuine honey - verified', { x: px + 0.2, y: py + 1.9, w: 2.6, h: 0.35, align: 'center', fontFace: SERIF, fontSize: 12, bold: true, color: C.cream })
  s.addText('असली शहद - सत्यापित', { x: px + 0.2, y: py + 2.2, w: 2.6, h: 0.3, align: 'center', fontFace: SANS, fontSize: 8.5, italic: true, color: 'A9D1BB' })
  ;[['Moisture', '17.8%', 'PASS'], ['HMF', '14 mg/kg', 'PASS'], ['C4 sugar', '1.1%', 'PASS']].forEach(([k, v, r], i) => {
    const y = py + 2.85 + i * 0.5
    s.addShape(p.ShapeType.rect, { x: px + 0.2, y, w: 2.6, h: 0.46, fill: { color: C.panel }, line: { color: C.line } })
    s.addText(k, { x: px + 0.3, y, w: 1.1, h: 0.46, fontFace: SANS, fontSize: 8.5, bold: true, color: C.ink, valign: 'middle' })
    s.addText(v, { x: px + 1.3, y, w: 0.9, h: 0.46, fontFace: MONO, fontSize: 8, color: C.ink, valign: 'middle' })
    s.addText(r, { x: px + 2.15, y: y + 0.11, w: 0.6, h: 0.24, align: 'center', fontFace: MONO, fontSize: 6.5, bold: true, color: C.ok, fill: { color: 'E3F1E8' } })
  })
  // outcomes
  const rows = [['HC-2026-0001', 'Mustard · Deeg, Rajasthan', '100', 'Genuine - verified', C.ok], ['HC-2026-0002', 'Eucalyptus · Nagpur', '95', 'Genuine - verified', C.ok], ['HC-2026-0004', 'Ber · fresh harvest, no lab yet', '40', 'Lab report pending', C.info], ['HC-2026-0003', 'Wildflower · 95 kg from one hive', '20', 'Do not buy - failed lab', C.bad]]
  rows.forEach(([id, d, sc, v, col], i) => {
    const y = 2.2 + i * 0.95
    s.addShape(p.ShapeType.rect, { x: 4.4, y, w: 5.0, h: 0.82, fill: { color: C.white }, line: { color: C.line } })
    s.addShape(p.ShapeType.rect, { x: 4.4, y, w: 0.07, h: 0.82, fill: { color: col } })
    s.addText(sc, { x: 4.55, y, w: 0.85, h: 0.82, align: 'center', valign: 'middle', fontFace: SERIF, fontSize: 24, bold: true, color: col })
    s.addText(id, { x: 5.4, y: y + 0.08, w: 2.2, h: 0.3, fontFace: MONO, fontSize: 11, bold: true, color: C.green })
    s.addText(d, { x: 5.4, y: y + 0.4, w: 2.4, h: 0.3, fontFace: SANS, fontSize: 9.5, color: C.ink2 })
    s.addText(v, { x: 7.4, y, w: 1.9, h: 0.82, align: 'right', valign: 'middle', fontFace: SANS, fontSize: 10.5, bold: true, color: col })
  })
  block(s, 9.65, 2.2, 2.95, 3.65, 'Trust score', '+25 source hives registered\n+15 harvest logged\n+40 lab PASS\n+10 IoT data anchored\n+10 custody trail\n-20 implausible yield / hive\n\nLab FAIL or score < 50 = reject. A QR not on the ledger = "no such batch".', C.green, C.panel)
  s.addText('Live outputs of the prototype\'s seeded ledger.', { x: 4.4, y: 6.05, w: 5, h: 0.3, fontFace: SERIF, italic: true, fontSize: 10.5, color: C.ink2 })
}

// ---------- 7 IoT + AI ----------
{
  const s = slide('IoT + AI', 'Smart hive: sensors that tell the beekeeper what to do', 'स्मार्ट छत्ता: सेंसर बताते हैं क्या करना है')
  block(s, 0.75, 2.25, 3.85, 2.55, 'Hive node · est. ₹1,500-2,500', 'ESP32, load cell (weight), DS18B20 (brood temperature), DHT22 (humidity), MEMS microphone (colony sound), CO2, solar + LoRa.')
  block(s, 4.75, 2.25, 3.85, 2.55, 'Health detection', 'Varroa · foulbrood · queenless · pre-swarm · starvation. Every prediction shows confidence and a recommended action.', C.bad)
  block(s, 8.75, 2.25, 3.85, 2.55, 'Yield forecast', 'Weight-gain trend + forage index gives a 30-day honey surplus with an 80% range, for harvest and sales planning.', C.ok)
  s.addShape(p.ShapeType.roundRect, { x: 0.75, y: 5.05, w: 11.85, h: 1.75, rectRadius: 0.08, fill: { color: C.panel }, line: { color: C.line } })
  s.addText([{ text: 'Prototype note  ', options: { bold: true, color: C.amberInk, fontFace: MONO } }, { text: 'The demo uses simulated sensor streams and an explainable feature-based model; it identified all six injected conditions correctly in our tests (24 of 24). Production: a small CNN on hive audio and thermal trends trained on labelled KVIC apiary data, running on-device. Telemetry is hashed into a Merkle root and anchored on-chain so yield claims can be audited.', options: { color: C.ink } }], { x: 0.95, y: 5.1, w: 11.5, h: 1.65, fontFace: SANS, fontSize: 12.5, valign: 'middle' })
}

// ---------- 8 Real vs simulated ----------
{
  const s = slide('Transparency', 'What is real in the prototype, and what is simulated', 'प्रोटोटाइप में क्या असली है और क्या सिम्युलेटेड')
  const col = (x, head, tone, rows) => {
    s.addShape(p.ShapeType.rect, { x, y: 2.25, w: 5.85, h: 0.5, fill: { color: tone } })
    s.addText(head, { x: x + 0.15, y: 2.25, w: 5.5, h: 0.5, fontFace: SERIF, fontSize: 14, bold: true, color: C.white, valign: 'middle' })
    rows.forEach((r, i) => {
      s.addShape(p.ShapeType.rect, { x, y: 2.75 + i * 0.68, w: 5.85, h: 0.68, fill: { color: i % 2 ? C.panel : C.white }, line: { color: C.line } })
      s.addText(r, { x: x + 0.15, y: 2.75 + i * 0.68, w: 5.55, h: 0.68, fontFace: SANS, fontSize: 11.5, color: C.ink, valign: 'middle' })
    })
  }
  col(0.75, 'Working now', C.ok, ['SHA-256 hash-chained ledger with tamper detection', 'QR generation, camera scan and batch verification', 'Trust-score engine and lab pass/fail against limits', 'Role portals: beekeeper, lab, supply chain', 'AI diagnosis + forecast on the sensor stream', 'Bilingual UI (English / हिन्दी), dark mode, accessibility options'])
  col(6.75, 'Simulated / next step', C.amberInk, ['Ledger runs in the browser - production uses a shared Besu / Fabric network (contract included)', 'Sensor data is generated - production uses ESP32 nodes over LoRa', 'AI is explainable rules - production uses a trained CNN', 'Validator signatures are simulated - production uses Ed25519 keys', 'Per-jar unique QR serials (roadmap)', 'Lab thresholds are indicative - set by notified labs'])
}

// ---------- 9 Rollout ----------
{
  const s = slide('Deployment framework', 'Scalable rollout across KVIC beekeeping clusters', 'KVIC क्लस्टरों में चरणबद्ध विस्तार')
  const ph = [['Phase 0 · Pilot', 'Months 0-3', '2 clusters, 50 beekeepers, 100 instrumented hives, 1 lab'], ['Phase 1 · State', 'Months 4-9', '10 clusters in 3 states, 1,000 beekeepers, QR at Khadi outlets'], ['Phase 2 · Regional', 'Months 10-18', 'All Honey Mission states, FSSAI dashboard, marketplace integration'], ['Phase 3 · National', 'Year 2+', 'Open API for e-commerce and export certificates, trained disease model']]
  ph.forEach(([h, t, b], i) => {
    const x = 0.75 + i * 2.98
    s.addShape(p.ShapeType.chevron, { x, y: 2.2, w: 2.9, h: 0.85, fill: { color: [C.green, '2F6B52', C.ok, C.amber][i] }, line: { type: 'none' } })
    s.addText(h, { x: x + 0.4, y: 2.2, w: 2.2, h: 0.85, fontFace: SERIF, fontSize: 12.5, bold: true, color: i === 3 ? C.ink : C.white, valign: 'middle' })
    s.addText(t, { x, y: 3.15, w: 2.9, h: 0.3, align: 'center', fontFace: MONO, fontSize: 10, bold: true, color: C.amberInk })
    s.addText(b, { x: x + 0.1, y: 3.5, w: 2.7, h: 1.05, align: 'center', valign: 'top', fontFace: SANS, fontSize: 11, color: C.ink })
  })
  block(s, 0.75, 4.75, 5.85, 2.05, 'Built for the village', 'Offline-first apps · bilingual and voice UI · QR-first flows · one LoRa gateway serves 20-40 hives · near-zero chain write cost (permissioned, no gas).')
  block(s, 6.75, 4.75, 5.85, 2.05, 'Risks we plan for', 'Garbage-in from dishonest actors: accredited lab keys, random audits, IoT weight cross-check · QR cloning: per-jar serials and single-use claim codes · Governance: multi-stakeholder validators.', C.bad)
}

// ---------- 10 Impact ----------
{
  const s = slide('Why it wins', 'Impact for beekeepers, consumers and KVIC', 'मधुमक्खी पालकों, उपभोक्ताओं और KVIC के लिए प्रभाव')
  block(s, 0.75, 2.25, 3.85, 2.2, 'Beekeepers', 'Proof of quality supports a premium price and direct market access. Early disease alerts protect colonies and yield.', C.ok)
  block(s, 4.75, 2.25, 3.85, 2.2, 'Consumers', 'Scan and know: origin, purity test and journey. Counterfeit batches are flagged before purchase.', C.ok)
  block(s, 8.75, 2.25, 3.85, 2.2, 'KVIC & regulators', 'Cluster dashboards for production, adulteration flags and disease hotspots to target extension support.', C.ok)
  s.addText('PILOT SUCCESS METRICS', { x: 0.75, y: 4.75, w: 6, h: 0.3, fontFace: MONO, fontSize: 10, color: C.amberInk, charSpacing: 3, bold: true })
  ;['% of batches with QR + lab certificate', 'Consumer scans per month', 'Price premium vs unlabelled honey', 'Colony-loss reduction', 'Adulterated batches flagged / 1,000'].forEach((t, i) => {
    const x = 0.75 + (i % 3) * 3.98, y = 5.15 + Math.floor(i / 3) * 0.78
    s.addShape(p.ShapeType.rect, { x, y, w: 3.85, h: 0.64, fill: { color: C.panel }, line: { color: C.line } })
    s.addText(t, { x: x + 0.12, y, w: 3.6, h: 0.64, fontFace: SANS, fontSize: 11.5, color: C.ink, valign: 'middle' })
  })
}

// ---------- 11 Live demo ----------
{
  const s = slide('Working prototype', 'Try it now', 'अभी आज़माएँ')
  const items = [['Verify Honey', 'QR / camera scan, trust score, journey'], ['New Harvest', 'Pick hives, enter harvest, get QR'], ['Lab Tests', 'Enter results, auto pass / fail'], ['My Hives', 'Live sensors, AI diagnosis, forecast'], ['Supply Chain', 'Custody handovers and packing'], ['Ledger', 'Block explorer + tamper demo'], ['Rollout Plan', 'Cluster deployment framework'], ['Guided tour', 'One-click walkthrough (EN / हिन्दी)']]
  items.forEach(([h, b], i) => block(s, 0.75 + (i % 4) * 2.98, 2.2 + Math.floor(i / 4) * 1.6, 2.85, 1.45, h, b))
  s.addShape(p.ShapeType.rect, { x: 0.75, y: 5.5, w: 11.85, h: 1.35, fill: { color: C.deep } })
  s.addText('SOURCE CODE', { x: 1.0, y: 5.58, w: 3, h: 0.3, fontFace: MONO, fontSize: 9, color: C.amber, charSpacing: 3 })
  s.addText(REPO, { x: 1.0, y: 5.85, w: 11, h: 0.4, fontFace: MONO, fontSize: 17, bold: true, color: C.cream })
  s.addText(DEMO_URL ? `LIVE DEMO   ${DEMO_URL}` : 'RUN LOCALLY   npm install && npm run dev', { x: 1.0, y: 6.32, w: 11.4, h: 0.4, fontFace: MONO, fontSize: 12, color: C.amber })
}

// ---------- 12 Close ----------
{
  const s = p.addSlide(); n++
  s.background = { color: C.deep }
  hex(s, 8.9, 1.2, 4.2, null, C.amber, 1); hex(s, 9.6, 1.9, 2.8, C.green, C.amber, 2)
  s.addText('Every drop, proven.', { x: 0.8, y: 2.2, w: 8, h: 1.2, fontFace: SERIF, fontSize: 50, bold: true, color: C.amber })
  s.addText('हर बूँद पर भरोसा।', { x: 0.8, y: 3.35, w: 8, h: 0.6, fontFace: SANS, fontSize: 22, italic: true, color: 'A9D1BB' })
  s.addText('Honey Chain · SIH26021 · Ministry of MSME · KVIC Honey Mission', { x: 0.8, y: 4.4, w: 9, h: 0.5, fontFace: SANS, fontSize: 15, color: C.cream })
  s.addText(REPO, { x: 0.8, y: 5.0, w: 9, h: 0.4, fontFace: MONO, fontSize: 13, color: 'A5C3B4' })
  s.addText('Thank you', { x: 0.8, y: 6.5, w: 6, h: 0.4, fontFace: SERIF, fontSize: 16, italic: true, color: 'A5C3B4' })
}

await p.writeFile({ fileName: 'docs/HoneyChain-SIH26021.pptx' })
console.log('deck written:', n, 'slides')
