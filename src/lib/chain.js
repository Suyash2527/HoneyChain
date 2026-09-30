// Honey Chain - permissioned Proof-of-Authority ledger (browser prototype).
// Every block commits to the previous block's hash, so editing any historical
// record breaks every hash after it. Only hashes/attestations go on-chain;
// bulky telemetry stays off-chain and is anchored via a Merkle root.

export const VALIDATORS = [
  { id: 'KVIC-Node-Nagpur', org: 'KVIC Regional Office' },
  { id: 'KVIC-Node-Jaipur', org: 'KVIC Regional Office' },
  { id: 'FSSAI-Node-Delhi', org: 'FSSAI' },
]

export const BLOCK_TYPES = {
  GENESIS: 'GENESIS',
  HIVE_REGISTERED: 'HIVE_REGISTERED',
  HARVEST_LOGGED: 'HARVEST_LOGGED',
  LAB_CERTIFIED: 'LAB_CERTIFIED',
  CUSTODY_TRANSFER: 'CUSTODY_TRANSFER',
  SENSOR_ATTESTATION: 'SENSOR_ATTESTATION',
  RETAIL_PACKED: 'RETAIL_PACKED',
}

// Indicative acceptance limits for honey purity (aligned with FSSAI / BIS IS 4941
// style parameters). Final thresholds must be confirmed by the notified lab.
export const PURITY_LIMITS = {
  moisture: { max: 20, unit: '%', label: 'Moisture' },
  hmf: { max: 80, unit: 'mg/kg', label: 'HMF' },
  sucrose: { max: 5, unit: '%', label: 'Sucrose' },
  reducingSugar: { min: 65, unit: '%', label: 'Reducing sugars' },
  ash: { max: 0.5, unit: '%', label: 'Ash' },
  c4Sugar: { max: 7, unit: '%', label: 'C4 sugar (adulteration marker)' },
}

// Qualitative markers. Engineered sugar syrups can pass C4/HMF yet fail NMR (CSE, 2020), so labs
// should also anchor NMR-profile and rice-syrup-marker (SMR / 2-AFGP) results when available.
export const PURITY_FLAGS = {
  nmr: { label: 'NMR profile', good: 'Consistent', bad: 'Anomaly' },
  smr: { label: 'Rice-syrup marker (SMR)', good: 'Absent', bad: 'Detected' },
}

export async function sha256(text) {
  const buf = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Deterministic JSON so the same payload always hashes identically.
export function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']'
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}'
  }
  return JSON.stringify(value)
}

export async function hashBlock(b) {
  return sha256(canonical({ index: b.index, timestamp: b.timestamp, type: b.type, payload: b.payload, prevHash: b.prevHash, validator: b.validator }))
}

export async function makeBlock(prev, type, payload, timestamp = Date.now()) {
  const index = prev ? prev.index + 1 : 0
  const validator = VALIDATORS[index % VALIDATORS.length].id // round-robin PoA
  const block = { index, timestamp, type, payload, prevHash: prev ? prev.hash : '0'.repeat(64), validator }
  block.hash = await hashBlock(block)
  block.signature = (await sha256(validator + ':' + block.hash)).slice(0, 32) // stand-in for an ECDSA signature
  return block
}

export async function verifyChain(chain) {
  const results = []
  for (let i = 0; i < chain.length; i++) {
    const b = chain[i]
    const recomputed = await hashBlock(b)
    const linkOk = i === 0 ? b.prevHash === '0'.repeat(64) : b.prevHash === chain[i - 1].hash
    const hashOk = recomputed === b.hash
    const sigOk = (await sha256(b.validator + ':' + b.hash)).slice(0, 32) === b.signature
    results.push({ index: b.index, ok: linkOk && hashOk && sigOk, linkOk, hashOk, sigOk })
  }
  const firstBad = results.find((r) => !r.ok)
  return { valid: !firstBad, firstBadIndex: firstBad ? firstBad.index : null, results }
}

export async function computeMerkleRoot(leaves) {
  if (!leaves.length) return '0'.repeat(64)
  let level = await Promise.all(leaves.map((l) => sha256(typeof l === 'string' ? l : canonical(l))))
  while (level.length > 1) {
    const next = []
    for (let i = 0; i < level.length; i += 2) next.push(await sha256(level[i] + (level[i + 1] || level[i])))
    level = next
  }
  return level[0]
}

export function evaluatePurity(tests) {
  const failures = []
  for (const [key, limit] of Object.entries(PURITY_LIMITS)) {
    const v = Number(tests[key])
    if (Number.isNaN(v)) continue
    if (limit.max !== undefined && v > limit.max) failures.push(`${limit.label} ${v}${limit.unit} exceeds ${limit.max}${limit.unit}`)
    if (limit.min !== undefined && v < limit.min) failures.push(`${limit.label} ${v}${limit.unit} below ${limit.min}${limit.unit}`)
  }
  for (const [key, f] of Object.entries(PURITY_FLAGS)) {
    if (tests[key] === f.bad) failures.push(`${f.label}: ${f.bad}`)
  }
  return { pass: failures.length === 0, failures }
}

// Everything the ledger knows about one batch, plus a consumer-facing trust score.
export function traceBatch(chain, batchId) {
  const id = String(batchId || '').trim().toUpperCase()
  const events = chain.filter((b) => b.payload && String(b.payload.batchId || '').toUpperCase() === id)
  const harvest = events.find((e) => e.type === BLOCK_TYPES.HARVEST_LOGGED)
  if (!harvest) return { found: false, batchId: id }
  const hiveIds = harvest.payload.hiveIds || []
  const hives = chain.filter((b) => b.type === BLOCK_TYPES.HIVE_REGISTERED && hiveIds.includes(b.payload.hiveId))
  const lab = [...events].reverse().find((e) => e.type === BLOCK_TYPES.LAB_CERTIFIED)
  const custody = events.filter((e) => e.type === BLOCK_TYPES.CUSTODY_TRANSFER)
  const packed = events.find((e) => e.type === BLOCK_TYPES.RETAIL_PACKED)
  const attestations = chain.filter((b) => b.type === BLOCK_TYPES.SENSOR_ATTESTATION && hiveIds.includes(b.payload.hiveId))

  const flags = []
  let score = 0
  if (hives.length === hiveIds.length && hiveIds.length) score += 25
  else flags.push('Source hive not registered on the ledger')
  score += 15 // harvest event exists
  if (lab) {
    if (lab.payload.pass) score += 40
    else flags.push('Laboratory test FAILED purity limits')
  } else flags.push('No laboratory certificate yet')
  if (attestations.length) score += 10
  else flags.push('No IoT hive telemetry attested')
  if (custody.length) score += 5
  if (packed) score += 5
  const kgPerHive = hiveIds.length ? harvest.payload.quantityKg / hiveIds.length : 0
  if (kgPerHive > 45) {
    score -= 20
    flags.push(`Implausible yield ${kgPerHive.toFixed(1)} kg/hive - possible blending`)
  }
  score = Math.max(0, Math.min(100, score))
  const verdict = !lab ? 'PENDING' : !lab.payload.pass || score < 50 ? 'REJECT' : score >= 80 ? 'AUTHENTIC' : 'CAUTION'
  return { found: true, batchId: id, harvest, hives, lab, custody, packed, attestations, events, flags, score, verdict }
}

export function shortHash(h, n = 8) {
  return h ? h.slice(0, n) + '…' + h.slice(-4) : ''
}
