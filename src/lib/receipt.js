import { BLOCK_TYPES as T, PURITY_LIMITS, PURITY_FLAGS } from './chain'

// Any part of the app can print a receipt for a ledger block.
export const showReceipt = (block) => window.dispatchEvent(new CustomEvent('hc-receipt', { detail: block }))

export const RECEIPT_META = {
  [T.HARVEST_LOGGED]: { title: 'HARVEST REGISTERED', hi: 'फसल दर्ज हुई', icon: 'water_drop' },
  [T.LAB_CERTIFIED]: { title: 'LAB CERTIFICATE', hi: 'लैब प्रमाणपत्र', icon: 'biotech' },
  [T.CUSTODY_TRANSFER]: { title: 'CUSTODY TRANSFER', hi: 'हस्तांतरण दर्ज', icon: 'swap_horiz' },
  [T.RETAIL_PACKED]: { title: 'RETAIL PACKING', hi: 'खुदरा पैकिंग दर्ज', icon: 'inventory_2' },
  [T.HIVE_REGISTERED]: { title: 'HIVE REGISTERED', hi: 'छत्ता पंजीकृत', icon: 'hive' },
  [T.SENSOR_ATTESTATION]: { title: 'TELEMETRY ANCHORED', hi: 'सेंसर डेटा सुरक्षित', icon: 'sensors' },
}

const pad = (n, l = 6) => String(n).padStart(l, '0')
const when = (ts) => new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })

// -> { no, title, hi, when, rows: [[k, v, tone?]], result: {text, tone}, batchId, hash, prev, validator }
export function buildReceipt(block) {
  const p = block.payload || {}
  const meta = RECEIPT_META[block.type] || { title: block.type, hi: '', icon: 'receipt_long' }
  let rows = []
  let result = { text: 'SEALED ON LEDGER', tone: 'ok' }
  switch (block.type) {
    case T.HARVEST_LOGGED:
      rows = [['Batch', p.batchId], ['Beekeeper', p.harvestedBy], ['Hives', (p.hiveIds || []).join(', ')], ['Flowers', p.floral], ['Quantity', `${p.quantityKg} kg`], ['Yield', `${(p.quantityKg / Math.max(1, (p.hiveIds || []).length)).toFixed(1)} kg/hive`], ['Method', p.method]]
      break
    case T.LAB_CERTIFIED: {
      rows = [['Batch', p.batchId], ['Laboratory', p.lab], ['Report', p.reportHash]]
      for (const [k, l] of Object.entries(PURITY_LIMITS)) {
        if (p.tests?.[k] === undefined) continue
        const v = p.tests[k]
        const bad = (l.max !== undefined && v > l.max) || (l.min !== undefined && v < l.min)
        rows.push([l.label.split(' (')[0], `${v}${l.unit === '%' ? '%' : ' ' + l.unit}  ${bad ? 'FAIL' : 'ok'}`, bad ? 'bad' : ''])
      }
      for (const [k, f] of Object.entries(PURITY_FLAGS)) {
        if (!p.tests?.[k]) continue
        const bad = p.tests[k] === f.bad
        rows.push([f.label.replace(' (SMR)', ''), `${p.tests[k]}  ${bad ? 'FAIL' : 'ok'}`, bad ? 'bad' : ''])
      }
      result = p.pass ? { text: 'RESULT: PASS', tone: 'ok' } : { text: 'RESULT: FAIL', tone: 'bad' }
      break
    }
    case T.CUSTODY_TRANSFER:
      rows = [['Batch', p.batchId], ['From', p.from], ['To', p.to], ...(p.note ? [['Note', p.note]] : [])]
      break
    case T.RETAIL_PACKED:
      rows = [['Batch', p.batchId], ['Bottles', `${p.bottles} × ${p.sizeGrams} g`], ['Total', `${((p.bottles * p.sizeGrams) / 1000).toFixed(1)} kg`], ['Outlet', p.retailer]]
      break
    case T.HIVE_REGISTERED:
      rows = [['Hive ID', p.hiveId], ['Owner', p.owner], ['Village', `${p.village}, ${p.district}`], ['State', p.state], ['Cluster', p.cluster], ['Flora', p.flora]]
      break
    case T.SENSOR_ATTESTATION:
      rows = [['Hive', p.hiveId], ['Window', `${p.windowDays} days`], ['Readings', String(p.samples)], ['Merkle root', (p.merkleRoot || '').slice(0, 16) + '…']]
      break
    default:
      rows = Object.entries(p).slice(0, 8).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v).slice(0, 28) : String(v)])
  }
  return { no: 'HC-R-' + pad(block.index), title: meta.title, hi: meta.hi, icon: meta.icon, when: when(block.timestamp), rows, result, batchId: p.batchId, hash: block.hash, prev: block.prevHash, validator: block.validator, index: block.index }
}

export function receiptText(r) {
  const line = '-'.repeat(32)
  return [
    'HONEY CHAIN · KVIC HONEY MISSION', 'LEDGER RECEIPT', line, r.title, `No: ${r.no}`, r.when, line,
    ...r.rows.map(([k, v]) => `${k.padEnd(14)} ${v}`), line, r.result.text, line,
    `Block #${r.index}`, `Hash: ${r.hash}`, `Signed: ${r.validator}`, r.batchId ? `Verify: ${location.origin}${location.pathname}#/verify/${r.batchId}` : '', 'Every drop, proven.',
  ].filter(Boolean).join('\n')
}

// --- printer sound (Web Audio, no assets). Off when muted. ---
export const soundOn = () => { try { return localStorage.getItem('honeychain.sound') !== 'off' } catch { return true } }
export const setSound = (on) => { try { localStorage.setItem('honeychain.sound', on ? 'on' : 'off') } catch { /* ignore */ } }

let ctx
export function printerSound(ms = 2400) {
  if (!soundOn()) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const clicks = Math.floor(ms / 85)
    for (let i = 0; i < clicks; i++) {
      const t = ctx.currentTime + i * 0.085
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / d.length)
      const src = ctx.createBufferSource(); src.buffer = buf
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200 + (i % 3) * 500; bp.Q.value = 1.2
      const g = ctx.createGain(); g.gain.value = 0.16
      src.connect(bp); bp.connect(g); g.connect(ctx.destination); src.start(t)
    }
    // final "tear" tick
    const t2 = ctx.currentTime + ms / 1000 + 0.05
    const o = ctx.createOscillator(); const g2 = ctx.createGain(); o.type = 'square'; o.frequency.value = 900
    g2.gain.setValueAtTime(0.05, t2); g2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.09)
    o.connect(g2); g2.connect(ctx.destination); o.start(t2); o.stop(t2 + 0.1)
  } catch { /* audio unavailable */ }
}

// Paper rip: a short, gritty noise burst whose pitch falls as the paper tears away.
export function tearSound() {
  if (!soundOn()) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const dur = 0.34
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) {
      const env = Math.sin((i / d.length) * Math.PI) // swell and fade
      const crackle = Math.random() < 0.18 ? 1 : 0.35   // uneven fibres snapping
      d[i] = (Math.random() * 2 - 1) * env * crackle
    }
    const src = ctx.createBufferSource(); src.buffer = buf
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9
    bp.frequency.setValueAtTime(5200, ctx.currentTime); bp.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + dur)
    const g = ctx.createGain(); g.gain.value = 0.42
    src.connect(bp); bp.connect(g); g.connect(ctx.destination); src.start()
  } catch { /* audio unavailable */ }
}
