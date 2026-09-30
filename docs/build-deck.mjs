import pptxgen from 'pptxgenjs'

const DEMO_URL = process.env.DEMO_URL || 'https://honey-chain-suyashs-projects-0ba1789c.vercel.app'
const C = { honey: 'F5A623', deep: '8A5A00', cream: 'FFFAF0', soft: 'FFF4D6', ink: '2A1F0E', muted: '7A6A4F', ok: '1F9D55', bad: 'D64545', chain: '3B5BDB', white: 'FFFFFF' }
const p = new pptxgen()
p.layout = 'LAYOUT_WIDE' // 13.33 x 7.5
p.title = 'Honey Chain - SIH26021'
const F = 'Segoe UI'

function base(title, kicker) {
  const s = p.addSlide()
  s.background = { color: C.cream }
  s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.18, fill: { color: C.honey } })
  if (kicker) s.addText(kicker.toUpperCase(), { x: 0.6, y: 0.4, w: 9, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: C.deep, charSpacing: 3 })
  s.addText(title, { x: 0.6, y: 0.7, w: 12.1, h: 0.9, fontFace: F, fontSize: 32, bold: true, color: C.ink })
  s.addText('Honey Chain · SIH 2026 · PS SIH26021', { x: 0.6, y: 7.05, w: 8, h: 0.3, fontFace: F, fontSize: 10, color: C.muted })
  return s
}
const card = (s, x, y, w, h, head, body, accent = C.honey) => {
  s.addShape(p.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: C.white }, line: { color: 'EFE2C4', width: 1 } })
  s.addShape(p.ShapeType.rect, { x, y: y + 0.15, w: 0.08, h: h - 0.3, fill: { color: accent } })
  s.addText(head, { x: x + 0.25, y: y + 0.1, w: w - 0.4, h: 0.45, fontFace: F, fontSize: 16, bold: true, color: C.ink })
  s.addText(body, { x: x + 0.25, y: y + 0.55, w: w - 0.4, h: h - 0.65, fontFace: F, fontSize: 12.5, color: C.muted, valign: 'top' })
}

// 1 Title
{
  const s = p.addSlide()
  s.background = { color: C.ink }
  s.addShape(p.ShapeType.hexagon, { x: 9.3, y: 1.3, w: 3.6, h: 3.6, fill: { color: C.honey }, line: { color: C.deep, width: 4 } })
  s.addShape(p.ShapeType.hexagon, { x: 10.05, y: 2.05, w: 2.1, h: 2.1, fill: { color: 'FFF3CF' }, line: { color: C.deep, width: 3 } })
  s.addText('SMART INDIA HACKATHON 2026 · SIH26021', { x: 0.7, y: 1.2, w: 8, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: C.honey, charSpacing: 3 })
  s.addText('Honey Chain', { x: 0.7, y: 1.8, w: 8.5, h: 1.3, fontFace: F, fontSize: 60, bold: true, color: C.white })
  s.addText('Blockchain traceability and smart beekeeping for rural India', { x: 0.7, y: 3.1, w: 8.3, h: 1, fontFace: F, fontSize: 24, color: 'F6ECD6' })
  s.addText('Ministry of MSME · KVIC Honey Mission · Agriculture, FoodTech & Rural Development', { x: 0.7, y: 4.6, w: 8.3, h: 0.5, fontFace: F, fontSize: 14, color: 'B7A684' })
  s.addText('Team: <Your team name> · Live demo: ' + DEMO_URL, { x: 0.7, y: 6.6, w: 12, h: 0.4, fontFace: F, fontSize: 12, color: C.honey })
}

// 2 Problem
{
  const s = base('Honest beekeepers cannot prove their honey is real', 'The problem')
  card(s, 0.6, 1.9, 2.9, 2.2, 'Counterfeit honey', 'Syrup-blended honey looks and tastes close to the real thing and sits on the same shelf.', C.bad)
  card(s, 3.7, 1.9, 2.9, 2.2, 'Low consumer trust', 'Paper labels and logos are easy to copy, so buyers discount every producer.', C.bad)
  card(s, 6.8, 1.9, 2.9, 2.2, 'Weak market linkage', 'Without proof of quality, rural beekeepers sell to middlemen at commodity prices.', C.bad)
  card(s, 9.9, 1.9, 2.9, 2.2, 'No hive intelligence', 'Disease, queen loss and swarming are noticed late - lost colonies, lost yield.', C.bad)
  s.addShape(p.ShapeType.roundRect, { x: 0.6, y: 4.6, w: 12.2, h: 1.7, rectRadius: 0.12, fill: { color: C.soft }, line: { color: 'EFE2C4' } })
  s.addText([
    { text: 'Context: ', options: { bold: true, color: C.deep } },
    { text: 'KVIC\'s Honey Mission supplies bee boxes and extraction toolkits to rural beekeepers for livelihood promotion. Production is growing, but authenticity, traceability and hive-management support have not kept pace. Genuine producers need a way to be believed.', options: { color: C.ink } },
  ], { x: 0.85, y: 4.7, w: 11.7, h: 1.5, fontFace: F, fontSize: 16, valign: 'middle' })
}

// 3 Solution
{
  const s = base('Honey Chain: one ledger from hive to jar', 'Our solution')
  const steps = [['1 Register', 'Hive gets a digital ID'], ['2 Sense', 'IoT + AI watch the colony'], ['3 Harvest', 'Batch + QR minted'], ['4 Certify', 'Lab result anchored'], ['5 Move', 'Custody logged'], ['6 Verify', 'Consumer scans QR']]
  steps.forEach(([h, b], i) => {
    const x = 0.6 + i * 2.05
    s.addShape(p.ShapeType.roundRect, { x, y: 2.0, w: 1.85, h: 1.7, rectRadius: 0.1, fill: { color: i === 5 ? C.honey : C.white }, line: { color: C.honey, width: 1.5 } })
    s.addText(h, { x, y: 2.1, w: 1.85, h: 0.5, align: 'center', fontFace: F, fontSize: 16, bold: true, color: C.ink })
    s.addText(b, { x: x + 0.1, y: 2.6, w: 1.65, h: 1, align: 'center', valign: 'top', fontFace: F, fontSize: 12, color: C.ink })
    if (i < 5) s.addText('›', { x: x + 1.83, y: 2.5, w: 0.25, h: 0.4, fontSize: 22, bold: true, color: C.deep, align: 'center' })
  })
  card(s, 0.6, 4.2, 4.0, 2.4, 'Blockchain traceability', 'Tamper-evident batch records, QR consumer verification, trust score, lab pass/fail permanently on record.')
  card(s, 4.8, 4.2, 4.0, 2.4, 'IoT hive monitoring', 'Weight, brood temperature, humidity, colony sound, CO2 and entrance activity streamed from a low-cost ESP32 node.')
  card(s, 9.0, 4.2, 3.8, 2.4, 'AI analytics', 'Disease and colony-health detection plus 30-day yield forecast, with plain-language advice for the beekeeper.')
}

// 4 Architecture
{
  const s = base('Architecture: cheap at the edge, trusted at the core', 'System design')
  const layer = (y, label, color, items) => {
    s.addShape(p.ShapeType.roundRect, { x: 0.6, y, w: 12.2, h: 1.35, rectRadius: 0.1, fill: { color }, line: { color: 'EFE2C4' } })
    s.addText(label, { x: 0.75, y: y + 0.05, w: 2.3, h: 1.25, fontFace: F, fontSize: 15, bold: true, color: C.ink, valign: 'middle' })
    items.forEach((t, i) => {
      const w = (9.6 - 0.15 * (items.length - 1)) / items.length
      const x = 3.1 + i * (w + 0.15)
      s.addShape(p.ShapeType.roundRect, { x, y: y + 0.2, w, h: 0.95, rectRadius: 0.08, fill: { color: C.white }, line: { color: C.honey } })
      s.addText(t, { x, y: y + 0.2, w, h: 0.95, align: 'center', valign: 'middle', fontFace: F, fontSize: 11.5, color: C.ink })
    })
  }
  layer(1.75, 'Consumer & Regulator', 'FFF9E8', ['QR scan PWA (Hindi/English)', 'Retailer verification API', 'FSSAI / KVIC dashboard'])
  layer(3.2, 'Permissioned PoA blockchain', 'E9EEFF', ['KVIC validator nodes', 'FSSAI node', 'Accredited lab nodes', 'Smart contract: batches, lab result, custody'])
  layer(4.65, 'Cluster edge', 'FFF4D6', ['KVIC cluster gateway (offline-first)', 'Edge AI: disease + yield', 'Merkle root batching of telemetry'])
  layer(6.1, 'Village layer', 'FFFFFF', ['ESP32 hive node (load cell, temp, humidity, mic)', 'LoRa link, solar powered', 'Beekeeper app / QR label printer'])
  s.addText('Only hashes go on-chain; raw sensor data stays local and is anchored as a Merkle root, so a 2G link is enough.', { x: 0.6, y: 1.35, w: 12.2, h: 0.35, fontFace: F, fontSize: 13, italic: true, color: C.muted })
}

// 5 Blockchain
{
  const s = base('Why a permissioned Proof-of-Authority chain', 'Blockchain design')
  card(s, 0.6, 1.9, 3.9, 2.3, 'Tamper-evident', 'Each block hashes its own data and the previous block. Edit a record and its hash breaks; re-hash it and every later block breaks.', C.chain)
  card(s, 4.7, 1.9, 3.9, 2.3, 'Zero fees, low energy', 'Validators are KVIC, FSSAI and labs. No mining, no gas - beekeepers never pay to write.', C.chain)
  card(s, 8.8, 1.9, 4.0, 2.3, 'Role-based & accountable', 'Only registered beekeepers, labs, processors and retailers can write their own event types. Every block is signed by a known validator.', C.chain)
  s.addText('On-chain event types', { x: 0.6, y: 4.45, w: 6, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: C.ink })
  const ev = ['HIVE_REGISTERED', 'HARVEST_LOGGED', 'SENSOR_ATTESTATION', 'LAB_CERTIFIED', 'CUSTODY_TRANSFER', 'RETAIL_PACKED']
  ev.forEach((e, i) => {
    s.addShape(p.ShapeType.roundRect, { x: 0.6 + (i % 3) * 4.1, y: 4.95 + Math.floor(i / 3) * 0.75, w: 3.9, h: 0.6, rectRadius: 0.08, fill: { color: 'E9EEFF' }, line: { color: C.chain } })
    s.addText(e, { x: 0.6 + (i % 3) * 4.1, y: 4.95 + Math.floor(i / 3) * 0.75, w: 3.9, h: 0.6, align: 'center', fontFace: 'Consolas', fontSize: 13, bold: true, color: C.chain })
  })
  s.addText('Solidity contract included (contracts/HoneyChain.sol) · production target: Hyperledger Besu / Fabric class network', { x: 0.6, y: 6.55, w: 12.2, h: 0.35, fontFace: F, fontSize: 12, color: C.muted })
}

// 6 Consumer verification
{
  const s = base('Scan the QR. See the truth in seconds.', 'Consumer verification')
  const rows = [
    ['HC-2026-0001', 'Mustard · Deeg, Rajasthan', '100', 'Verified authentic', C.ok],
    ['HC-2026-0002', 'Eucalyptus · Nagpur', '95', 'Verified authentic', C.ok],
    ['HC-2026-0004', 'Ber · fresh harvest, no lab yet', '40', 'Lab certificate pending', C.chain],
    ['HC-2026-0003', 'Wildflower · 95 kg from 1 hive', '20', 'Do not buy - failed lab', C.bad],
  ]
  rows.forEach(([id, d, sc, v, col], i) => {
    const y = 1.85 + i * 1.05
    s.addShape(p.ShapeType.roundRect, { x: 0.6, y, w: 7.6, h: 0.9, rectRadius: 0.1, fill: { color: C.white }, line: { color: col, width: 2 } })
    s.addText(sc, { x: 0.7, y, w: 0.9, h: 0.9, align: 'center', valign: 'middle', fontFace: F, fontSize: 26, bold: true, color: col })
    s.addText(id, { x: 1.7, y: y + 0.05, w: 3, h: 0.4, fontFace: 'Consolas', fontSize: 14, bold: true, color: C.ink })
    s.addText(d, { x: 1.7, y: y + 0.45, w: 3.4, h: 0.4, fontFace: F, fontSize: 11.5, color: C.muted })
    s.addText(v, { x: 5.0, y, w: 3.1, h: 0.9, align: 'right', valign: 'middle', fontFace: F, fontSize: 14, bold: true, color: col })
  })
  card(s, 8.5, 1.85, 4.3, 4.05, 'Trust score (0-100)', '+25 source hives registered\n+15 harvest logged\n+40 laboratory PASS\n+10 IoT telemetry attested\n+10 custody / retail trail\n-20 implausible yield per hive\n\nLab FAIL or score < 50 = REJECT.\nUnknown / forged QR = "no such batch".')
  s.addText('Results above are live outputs of the prototype\'s seeded ledger.', { x: 0.6, y: 6.15, w: 7.6, h: 0.35, fontFace: F, fontSize: 12, italic: true, color: C.muted })
}

// 7 IoT + AI
{
  const s = base('Smart hive: sensors that tell the beekeeper what to do', 'IoT + AI')
  card(s, 0.6, 1.9, 4.0, 2.6, 'Hive node (~₹1,500-2,500 est.)', 'ESP32, load cell (weight), DS18B20 (brood temp), DHT22 (humidity), MEMS mic (colony sound), CO2, solar + LoRa.')
  card(s, 4.8, 1.9, 4.0, 2.6, 'Disease & health detection', 'Varroa · foulbrood · queenless · pre-swarm · starvation. Every prediction shows confidence and a recommended action.', C.bad)
  card(s, 9.0, 1.9, 3.8, 2.6, 'Yield forecast', 'Weight-gain trend + forage index -> 30-day honey surplus with an 80% range, for harvest and sales planning.', C.ok)
  s.addShape(p.ShapeType.roundRect, { x: 0.6, y: 4.75, w: 12.2, h: 1.9, rectRadius: 0.1, fill: { color: C.soft }, line: { color: 'EFE2C4' } })
  s.addText([
    { text: 'Prototype honesty: ', options: { bold: true, color: C.deep } },
    { text: 'the demo uses simulated sensor streams and an explainable feature-based model - it correctly identifies all six injected conditions in our tests. Production path: a small CNN on hive audio + thermal trends trained on labelled KVIC apiary data, running on-device (TensorFlow Lite Micro). Telemetry is hashed into a Merkle root and anchored on-chain so yield claims can be audited.', options: { color: C.ink } },
  ], { x: 0.85, y: 4.8, w: 11.7, h: 1.8, fontFace: F, fontSize: 14, valign: 'middle' })
}

// 8 Prototype
{
  const s = base('Working prototype - try it now', 'Live demo')
  const items = [['Verify Honey', 'QR / camera scan, trust score, journey timeline'], ['Beekeeper', 'Register hives, log harvest, issue QR'], ['Lab', 'Enter tests, auto pass/fail, anchor on chain'], ['Supply Chain', 'Custody transfers and retail packing'], ['Smart Hive', 'Live sensors, AI diagnosis, yield forecast'], ['Ledger', 'Block explorer + tamper-proof demo'], ['Rollout', 'Cluster deployment framework']]
  items.forEach(([h, b], i) => card(s, 0.6 + (i % 4) * 3.1, 1.9 + Math.floor(i / 4) * 1.75, 2.95, 1.55, h, b))
  s.addShape(p.ShapeType.roundRect, { x: 0.6, y: 5.5, w: 12.2, h: 1.1, rectRadius: 0.1, fill: { color: C.ink } })
  s.addText(DEMO_URL, { x: 0.8, y: 5.55, w: 11.8, h: 0.5, fontFace: 'Consolas', fontSize: 18, bold: true, color: C.honey })
  s.addText('Stack: React · Web Crypto SHA-256 hash-chained PoA ledger · QR generation + camera scan · deployed on Vercel', { x: 0.8, y: 6.05, w: 11.8, h: 0.45, fontFace: F, fontSize: 12, color: 'F6ECD6' })
}

// 9 Rollout
{
  const s = base('Scalable rollout across KVIC beekeeping clusters', 'Deployment framework')
  const ph = [['Phase 0 · Pilot', 'Months 0-3', '2 clusters, 50 beekeepers, 100 instrumented hives, 1 lab'], ['Phase 1 · State', 'Months 4-9', '10 clusters in 3 states, 1,000 beekeepers, QR at Khadi outlets'], ['Phase 2 · Regional', 'Months 10-18', 'All Honey Mission states, FSSAI dashboard, marketplace integration'], ['Phase 3 · National', 'Year 2+', 'Open API for e-commerce and export certificates, trained disease model']]
  ph.forEach(([h, t, b], i) => {
    const x = 0.6 + i * 3.1
    s.addShape(p.ShapeType.chevron, { x, y: 1.9, w: 3.0, h: 0.9, fill: { color: i === 0 ? C.honey : 'F8CB6B' }, line: { color: C.deep } })
    s.addText(h, { x: x + 0.35, y: 1.9, w: 2.4, h: 0.9, fontFace: F, fontSize: 13, bold: true, color: C.ink, valign: 'middle' })
    s.addText(t, { x, y: 2.9, w: 3.0, h: 0.35, align: 'center', fontFace: F, fontSize: 12, bold: true, color: C.deep })
    s.addText(b, { x: x + 0.1, y: 3.25, w: 2.8, h: 1.1, align: 'center', valign: 'top', fontFace: F, fontSize: 12, color: C.ink })
  })
  card(s, 0.6, 4.5, 6.0, 2.2, 'Design for the village', 'Offline-first apps · regional-language and voice UI · QR-first flows · LoRa gateway serves 20-40 hives · near-zero chain write cost (permissioned, no gas).')
  card(s, 6.8, 4.5, 6.0, 2.2, 'Risks we plan for', 'Garbage-in by dishonest actors -> accredited lab keys, random audits, IoT weight cross-check · QR cloning -> per-jar serials and single-use claim codes · governance -> multi-stakeholder validators.', C.bad)
}

// 10 Impact
{
  const s = base('Impact for beekeepers, consumers and KVIC', 'Why it wins')
  card(s, 0.6, 1.9, 4.0, 2.4, 'Beekeepers', 'Proof of quality supports a premium price and direct market access. Early disease alerts protect colonies and yield.', C.ok)
  card(s, 4.8, 1.9, 4.0, 2.4, 'Consumers', 'Scan and know: origin, purity test and journey. Counterfeit batches are flagged before purchase.', C.ok)
  card(s, 9.0, 1.9, 3.8, 2.4, 'KVIC & regulators', 'Cluster-level dashboards: production, adulteration flags and disease hotspots for targeted extension support.', C.ok)
  s.addText('Success metrics for the pilot', { x: 0.6, y: 4.6, w: 8, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: C.ink })
  const k = ['% of batches with QR + lab certificate', 'Consumer scans per month', 'Price premium vs unlabelled honey', 'Colony loss reduction', 'Adulterated batches flagged / 1,000']
  k.forEach((t, i) => {
    s.addShape(p.ShapeType.roundRect, { x: 0.6 + (i % 3) * 4.1, y: 5.1 + Math.floor(i / 3) * 0.8, w: 3.9, h: 0.65, rectRadius: 0.08, fill: { color: C.soft }, line: { color: 'EFE2C4' } })
    s.addText(t, { x: 0.7 + (i % 3) * 4.1, y: 5.1 + Math.floor(i / 3) * 0.8, w: 3.7, h: 0.65, valign: 'middle', fontFace: F, fontSize: 12, color: C.ink })
  })
}

// 11 Thank you
{
  const s = p.addSlide()
  s.background = { color: C.ink }
  s.addText('Every drop, proven.', { x: 0.7, y: 2.0, w: 12, h: 1.2, fontFace: F, fontSize: 54, bold: true, color: C.honey })
  s.addText('Honey Chain · SIH26021 · Ministry of MSME · KVIC', { x: 0.7, y: 3.4, w: 12, h: 0.6, fontFace: F, fontSize: 20, color: C.white })
  s.addText('Live demo: ' + DEMO_URL, { x: 0.7, y: 4.4, w: 12, h: 0.5, fontFace: 'Consolas', fontSize: 16, color: 'F6ECD6' })
  s.addText('Thank you', { x: 0.7, y: 6.4, w: 6, h: 0.5, fontFace: F, fontSize: 16, color: 'B7A684' })
}

await p.writeFile({ fileName: 'docs/HoneyChain-SIH26021.pptx' })
console.log('deck written')
