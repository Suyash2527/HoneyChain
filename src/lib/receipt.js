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
export const FEED_BURSTS = [[250, 470], [560, 800], [850, 1050], [1200, 1450], [1490, 1700], [1850, 2080], [2200, 2420], [2480, 2700], [2900, 3100], [3180, 3360], [3360, 3480]] // [startMs, endMs] line-feed bursts; holds between them are the head printing

function noise(ms, gain, freq, q = 1.2, at = 0) {
  const n = Math.max(8, Math.floor(ctx.sampleRate * ms / 1000))
  const buf = ctx.createBuffer(1, n, ctx.sampleRate); const d = buf.getChannelData(0)
  for (let k = 0; k < n; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / n)
  const src = ctx.createBufferSource(); src.buffer = buf
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q
  const g = ctx.createGain(); g.gain.value = gain
  src.connect(bp); bp.connect(g); g.connect(ctx.destination); src.start(ctx.currentTime + at / 1000)
}

// Stepper-motor whir under the whole print, ratchet clicks during each feed burst, soft head buzz during holds.
export function printerSound(ms = 3700) {
  if (!soundOn()) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const t0 = ctx.currentTime
    const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(70, t0)
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t0)
    for (const [a, b] of FEED_BURSTS) {
      g.gain.linearRampToValueAtTime(0.07, t0 + a / 1000); osc.frequency.linearRampToValueAtTime(95, t0 + b / 1000)
      g.gain.linearRampToValueAtTime(0.012, t0 + (b + 20) / 1000); osc.frequency.linearRampToValueAtTime(70, t0 + (b + 60) / 1000)
    }
    g.gain.linearRampToValueAtTime(0.0001, t0 + ms / 1000)
    osc.connect(lp); lp.connect(g); g.connect(ctx.destination); osc.start(t0); osc.stop(t0 + ms / 1000 + 0.1)
    FEED_BURSTS.forEach(([a, b], bi) => {
      for (let t = a; t < b; t += 34) noise(14, 0.17, 2600 + ((t / 34) % 3) * 600, 1.4, t)       // paper feed ratchet
      const next = FEED_BURSTS[bi + 1]
      if (next) for (let t = b + 14; t < next[0] - 10; t += 62) noise(18, 0.05, 6500, 2, t)       // print-head buzz
    })
    noise(70, 0.22, 900, 1, ms - 50) // final clunk as the feed stops
  } catch { /* audio unavailable */ }
}

// Rubber stamp: a low body thump plus a short papery slap.
export function stampSound() {
  if (!soundOn()) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const t0 = ctx.currentTime
    const osc = ctx.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(140, t0); osc.frequency.exponentialRampToValueAtTime(48, t0 + 0.16)
    const g = ctx.createGain(); g.gain.setValueAtTime(0.5, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22)
    osc.connect(g); g.connect(ctx.destination); osc.start(t0); osc.stop(t0 + 0.25)
    noise(45, 0.3, 750, 0.8)
  } catch { /* audio unavailable */ }
}

// Paper rip: a short, gritty noise burst whose pitch falls as the paper tears away.
export function tearSound() {
  if (!soundOn()) return
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    const dur = 0.5 // spans the whole pull: fibres give one by one as the gap runs across
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) {
      const env = Math.sin((i / d.length) * Math.PI) // swell and fade
      const crackle = Math.random() < 0.1 + 0.2 * (i / d.length) ? 1 : 0.3 // uneven fibres snapping, faster near the end
      d[i] = (Math.random() * 2 - 1) * env * crackle
    }
    const src = ctx.createBufferSource(); src.buffer = buf
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9
    bp.frequency.setValueAtTime(5200, ctx.currentTime); bp.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + dur)
    const g = ctx.createGain(); g.gain.value = 0.42
    src.connect(bp); bp.connect(g); g.connect(ctx.destination); src.start()
  } catch { /* audio unavailable */ }
}
