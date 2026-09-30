import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BLOCK_TYPES as T, evaluatePurity, makeBlock, verifyChain, computeMerkleRoot, sha256, canonical } from './chain'
import { generateReadings } from './sensors'
import { showReceipt } from './receipt'

const STORAGE_KEY = 'honeychain.v2'
const DAY = 24 * 3600 * 1000

// Simulation parameters for the physical hive nodes (not stored on-chain).
export const SEED_HIVE_SIM = {
  'HV-001': { scenario: 'healthy', baseWeight: 38, nectarFlow: 1.3 },
  'HV-002': { scenario: 'healthy', baseWeight: 34, nectarFlow: 1.1 },
  'HV-003': { scenario: 'varroa', baseWeight: 33, nectarFlow: 0.9 },
  'HV-004': { scenario: 'swarm', baseWeight: 41, nectarFlow: 1.2 },
  'HV-005': { scenario: 'queenless', baseWeight: 30, nectarFlow: 0.8 },
  'HV-006': { scenario: 'foulbrood', baseWeight: 29, nectarFlow: 0.7 },
  'HV-007': { scenario: 'healthy', baseWeight: 36, nectarFlow: 1.2 },
  'HV-008': { scenario: 'healthy', baseWeight: 33, nectarFlow: 1.0 },
  'HV-009': { scenario: 'healthy', baseWeight: 37, nectarFlow: 1.1 },
  'HV-010': { scenario: 'varroa', baseWeight: 34, nectarFlow: 0.9 },
  'HV-011': { scenario: 'healthy', baseWeight: 31, nectarFlow: 1.0 },
  'HV-012': { scenario: 'starving', baseWeight: 28, nectarFlow: 0.6 },
  'HV-013': { scenario: 'healthy', baseWeight: 35, nectarFlow: 1.2 },
  'HV-014': { scenario: 'healthy', baseWeight: 32, nectarFlow: 1.1 },
  'HV-015': { scenario: 'queenless', baseWeight: 30, nectarFlow: 0.8 },
}

// Seed dataset: SYNTHETIC records (names, hive IDs, sensor streams) modelled on real public context -
// real districts and states, real flowering regions and seasons, FSSAI/BIS/Codex-style parameters.
// Real pilot data replaces this in Phase 0.
const KEEPERS = [
  ['HV-001', 'Ramesh Patil', 'Kalmeshwar', 'Nagpur', 'Maharashtra', 21.23, 78.91, 'KVIC-MH-01', 'Eucalyptus / Jamun'],
  ['HV-002', 'Ramesh Patil', 'Kalmeshwar', 'Nagpur', 'Maharashtra', 21.24, 78.92, 'KVIC-MH-01', 'Eucalyptus / Jamun'],
  ['HV-003', 'Sunita Devi', 'Deeg', 'Bharatpur', 'Rajasthan', 27.47, 77.33, 'KVIC-RJ-04', 'Mustard'],
  ['HV-004', 'Sunita Devi', 'Deeg', 'Bharatpur', 'Rajasthan', 27.48, 77.34, 'KVIC-RJ-04', 'Mustard'],
  ['HV-005', 'Lalita Meena', 'Bonli', 'Sawai Madhopur', 'Rajasthan', 26.02, 76.35, 'KVIC-RJ-07', 'Ber / Wildflower'],
  ['HV-006', 'Lalita Meena', 'Bonli', 'Sawai Madhopur', 'Rajasthan', 26.03, 76.36, 'KVIC-RJ-07', 'Ber / Wildflower'],
  ['HV-007', 'Manoj Kumar', 'Bochaha', 'Muzaffarpur', 'Bihar', 26.12, 85.39, 'KVIC-BR-02', 'Litchi'],
  ['HV-008', 'Manoj Kumar', 'Bochaha', 'Muzaffarpur', 'Bihar', 26.13, 85.4, 'KVIC-BR-02', 'Litchi'],
  ['HV-009', 'Gurpreet Singh', 'Samrala', 'Ludhiana', 'Punjab', 30.84, 76.19, 'KVIC-PB-03', 'Sunflower / Eucalyptus'],
  ['HV-010', 'Gurpreet Singh', 'Samrala', 'Ludhiana', 'Punjab', 30.85, 76.2, 'KVIC-PB-03', 'Sunflower / Eucalyptus'],
  ['HV-011', 'Anita Mondal', 'Gosaba', 'South 24 Parganas', 'West Bengal', 22.16, 88.8, 'KVIC-WB-05', 'Mangrove (Sundarbans)'],
  ['HV-012', 'Anita Mondal', 'Gosaba', 'South 24 Parganas', 'West Bengal', 22.17, 88.81, 'KVIC-WB-05', 'Mangrove (Sundarbans)'],
  ['HV-013', 'Rakesh Yadav', 'Nakur', 'Saharanpur', 'Uttar Pradesh', 29.95, 77.31, 'KVIC-UP-06', 'Eucalyptus / Multiflora'],
  ['HV-014', 'Rakesh Yadav', 'Nakur', 'Saharanpur', 'Uttar Pradesh', 29.96, 77.32, 'KVIC-UP-06', 'Eucalyptus / Multiflora'],
  ['HV-015', 'Kavita Bhoi', 'Sinnar', 'Nashik', 'Maharashtra', 19.85, 74.0, 'KVIC-MH-08', 'Jamun / Multiflora'],
]
const M = 'Cold extraction (KVIC toolkit)'

export async function buildSeedChain() {
  const now = Date.now()
  const ev = [] // [daysAgo, type, payload]
  const push = (d, type, payload) => ev.push([d, type, payload])
  const lab = async (d, batchId, labName, tests) => push(d, T.LAB_CERTIFIED, { batchId, lab: labName, tests, ...evaluatePurity(tests), reportHash: (await sha256(canonical({ batchId, labName, tests }))).slice(0, 16) })
  const attest = async (d, hiveId, tag) => push(d, T.SENSOR_ATTESTATION, { hiveId, windowDays: 14, samples: 336, merkleRoot: await computeMerkleRoot([tag + '-a', tag + '-b', tag + '-c']) })

  KEEPERS.forEach(([hiveId, owner, village, district, state, lat, lng, cluster, flora], i) =>
    push(88 - i * 1.5, T.HIVE_REGISTERED, { hiveId, owner, village, district, state, lat, lng, cluster, flora, species: 'Apis mellifera', boxType: 'Langstroth 10-frame', kvicBoxId: 'KVIC-' + hiveId }))

  // 0001 mustard - fully verified
  push(40, T.HARVEST_LOGGED, { batchId: 'HC-2026-0001', hiveIds: ['HV-003', 'HV-004'], quantityKg: 62, floral: 'Mustard', harvestedBy: 'Sunita Devi', method: M })
  await lab(36, 'HC-2026-0001', 'NABL Lab - KVIC Jaipur', { moisture: 17.8, hmf: 14, sucrose: 1.9, reducingSugar: 71, ash: 0.18, c4Sugar: 1.1, nmr: 'Consistent', smr: 'Absent' })
  await attest(32, 'HV-003', 'm1')
  push(33, T.CUSTODY_TRANSFER, { batchId: 'HC-2026-0001', from: 'Sunita Devi', to: 'KVIC Processing Unit - Jaipur', note: 'Filtered and bottled' })
  push(30, T.RETAIL_PACKED, { batchId: 'HC-2026-0001', bottles: 124, sizeGrams: 500, retailer: 'Khadi Gramodyog Bhawan, Jaipur' })

  // 0002 eucalyptus - certified, in distribution
  push(25, T.HARVEST_LOGGED, { batchId: 'HC-2026-0002', hiveIds: ['HV-001', 'HV-002'], quantityKg: 48, floral: 'Eucalyptus', harvestedBy: 'Ramesh Patil', method: M })
  await lab(21, 'HC-2026-0002', 'NABL Lab - KVIC Nagpur', { moisture: 18.9, hmf: 22, sucrose: 2.6, reducingSugar: 69, ash: 0.22, c4Sugar: 2.3, nmr: 'Consistent', smr: 'Absent' })
  await attest(22, 'HV-001', 'm2')
  push(18, T.CUSTODY_TRANSFER, { batchId: 'HC-2026-0002', from: 'Ramesh Patil', to: 'Nagpur Distributor Co-op', note: 'Bulk 48 kg drums' })

  // 0003 counterfeit - one hive claiming 95 kg, fails everything
  push(15, T.HARVEST_LOGGED, { batchId: 'HC-2026-0003', hiveIds: ['HV-005'], quantityKg: 95, floral: 'Wildflower', harvestedBy: 'Lalita Meena', method: 'Unknown' })
  await lab(12, 'HC-2026-0003', 'NABL Lab - KVIC Jaipur', { moisture: 24.6, hmf: 112, sucrose: 9.4, reducingSugar: 58, ash: 0.09, c4Sugar: 21, nmr: 'Anomaly', smr: 'Detected' })

  // 0004 fresh harvest awaiting lab
  push(3, T.HARVEST_LOGGED, { batchId: 'HC-2026-0004', hiveIds: ['HV-006'], quantityKg: 21, floral: 'Ber', harvestedBy: 'Lalita Meena', method: M })

  // 0005 litchi (Muzaffarpur) - verified and packed
  push(52, T.HARVEST_LOGGED, { batchId: 'HC-2026-0005', hiveIds: ['HV-007', 'HV-008'], quantityKg: 44, floral: 'Litchi', harvestedBy: 'Manoj Kumar', method: M })
  await lab(48, 'HC-2026-0005', 'NABL Lab - KVIC Patna', { moisture: 18.1, hmf: 12, sucrose: 2.0, reducingSugar: 70, ash: 0.14, c4Sugar: 1.4, nmr: 'Consistent', smr: 'Absent' })
  await attest(49, 'HV-007', 'm5')
  push(45, T.CUSTODY_TRANSFER, { batchId: 'HC-2026-0005', from: 'Manoj Kumar', to: 'KVIC Processing Unit - Muzaffarpur', note: 'Filtered and bottled' })
  push(41, T.RETAIL_PACKED, { batchId: 'HC-2026-0005', bottles: 80, sizeGrams: 500, retailer: 'Khadi Bhawan, Patna' })

  // 0006 mangrove (Sundarbans) - verified, in distribution
  push(34, T.HARVEST_LOGGED, { batchId: 'HC-2026-0006', hiveIds: ['HV-011', 'HV-012'], quantityKg: 36, floral: 'Mangrove', harvestedBy: 'Anita Mondal', method: M })
  await lab(30, 'HC-2026-0006', 'NABL Lab - KVIC Kolkata', { moisture: 19.4, hmf: 26, sucrose: 3.1, reducingSugar: 67, ash: 0.31, c4Sugar: 2.8, nmr: 'Consistent', smr: 'Absent' })
  await attest(31, 'HV-011', 'm6')
  push(27, T.CUSTODY_TRANSFER, { batchId: 'HC-2026-0006', from: 'Anita Mondal', to: 'Regional Distributor Co-op', note: 'Cold-chain truck' })
  push(24, T.RETAIL_PACKED, { batchId: 'HC-2026-0006', bottles: 60, sizeGrams: 500, retailer: 'Khadi Bhawan, Kolkata' })

  // 0007 sunflower (Ludhiana) - PASSES C4/HMF but FAILS NMR + SMR (engineered syrup)
  push(20, T.HARVEST_LOGGED, { batchId: 'HC-2026-0007', hiveIds: ['HV-009', 'HV-010'], quantityKg: 70, floral: 'Sunflower', harvestedBy: 'Gurpreet Singh', method: M })
  await lab(16, 'HC-2026-0007', 'NABL Lab - KVIC Chandigarh', { moisture: 18.7, hmf: 19, sucrose: 2.7, reducingSugar: 68, ash: 0.19, c4Sugar: 3.1, nmr: 'Anomaly', smr: 'Detected' })

  // 0008 eucalyptus / multiflora (Saharanpur) - verified, partly packed
  push(27, T.HARVEST_LOGGED, { batchId: 'HC-2026-0008', hiveIds: ['HV-013', 'HV-014'], quantityKg: 51, floral: 'Multiflora', harvestedBy: 'Rakesh Yadav', method: M })
  await lab(23, 'HC-2026-0008', 'NABL Lab - KVIC Lucknow', { moisture: 18.6, hmf: 17, sucrose: 2.3, reducingSugar: 69, ash: 0.2, c4Sugar: 1.9, nmr: 'Consistent', smr: 'Absent' })
  await attest(24, 'HV-013', 'm8')
  push(19, T.CUSTODY_TRANSFER, { batchId: 'HC-2026-0008', from: 'Rakesh Yadav', to: 'Regional Distributor Co-op', note: 'Filtered and bottled' })
  push(14, T.RETAIL_PACKED, { batchId: 'HC-2026-0008', bottles: 60, sizeGrams: 500, retailer: 'Organic retail store' })

  // 0009 jamun (Nashik) - awaiting lab
  push(5, T.HARVEST_LOGGED, { batchId: 'HC-2026-0009', hiveIds: ['HV-015'], quantityKg: 27, floral: 'Jamun', harvestedBy: 'Kavita Bhoi', method: M })

  // 0010 mustard, second flow (Bharatpur) - verified, packed for Delhi
  push(10, T.HARVEST_LOGGED, { batchId: 'HC-2026-0010', hiveIds: ['HV-003', 'HV-004'], quantityKg: 58, floral: 'Mustard', harvestedBy: 'Sunita Devi', method: M })
  await lab(7, 'HC-2026-0010', 'NABL Lab - KVIC Jaipur', { moisture: 17.6, hmf: 15, sucrose: 1.8, reducingSugar: 72, ash: 0.17, c4Sugar: 1.0, nmr: 'Consistent', smr: 'Absent' })
  await attest(8, 'HV-004', 'm10')
  push(6, T.CUSTODY_TRANSFER, { batchId: 'HC-2026-0010', from: 'Sunita Devi', to: 'KVIC Processing Unit - Jaipur', note: 'Filtered and bottled' })
  push(4, T.RETAIL_PACKED, { batchId: 'HC-2026-0010', bottles: 100, sizeGrams: 500, retailer: 'Khadi Bhawan, New Delhi' })

  ev.sort((x, y) => y[0] - x[0]) // oldest first, so the chain is chronological
  const chain = [await makeBlock(null, T.GENESIS, { note: 'Honey Chain genesis - KVIC Honey Mission ledger', network: 'honeychain-poa-1' }, now - 90 * DAY)]
  for (const [d, type, payload] of ev) chain.push(await makeBlock(chain[chain.length - 1], type, payload, now - d * DAY))
  return chain
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [chain, setChain] = useState([])
  const [hiveSim, setHiveSim] = useState(SEED_HIVE_SIM)
  const [ready, setReady] = useState(false)
  const [integrity, setIntegrity] = useState({ valid: true, firstBadIndex: null, results: [] })
  const chainRef = useRef([])
  chainRef.current = chain

  useEffect(() => {
    ;(async () => {
      let saved = null
      try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { /* ignore */ }
      if (saved && saved.chain && saved.chain.length) {
        setChain(saved.chain)
        setHiveSim({ ...SEED_HIVE_SIM, ...(saved.hiveSim || {}) })
      } else {
        setChain(await buildSeedChain())
      }
      setReady(true)
    })()
  }, [])

  useEffect(() => {
    if (!ready) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ chain, hiveSim })) } catch { /* ignore */ }
    verifyChain(chain).then(setIntegrity)
  }, [chain, hiveSim, ready])

  const append = useCallback(async (type, payload) => {
    const block = await makeBlock(chainRef.current[chainRef.current.length - 1] || null, type, payload)
    chainRef.current = [...chainRef.current, block]
    setChain(chainRef.current)
    showReceipt(block) // print a receipt for every ledger write
    return block
  }, [])

  // Demo helper: silently edit an old record WITHOUT recomputing its hash - what a forger would do.
  const tamper = useCallback((index, patch) => {
    setChain((c) => c.map((b) => (b.index === index ? { ...b, payload: { ...b.payload, ...patch } } : b)))
  }, [])

  const reset = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY)
    setHiveSim(SEED_HIVE_SIM)
    setChain(await buildSeedChain())
  }, [])

  const hives = useMemo(
    () => chain.filter((b) => b.type === T.HIVE_REGISTERED).map((b) => ({ ...b.payload, sim: hiveSim[b.payload.hiveId] || { scenario: 'healthy', baseWeight: 32, nectarFlow: 1 }, registeredAt: b.timestamp })),
    [chain, hiveSim]
  )
  const batches = useMemo(
    () => chain.filter((b) => b.type === T.HARVEST_LOGGED).map((b) => b.payload.batchId).sort(),
    [chain]
  )
  const readingsCache = useRef({})
  const getReadings = useCallback((hive) => {
    const key = hive.hiveId + hive.sim.scenario
    if (!readingsCache.current[key]) readingsCache.current[key] = generateReadings({ hiveId: hive.hiveId, ...hive.sim })
    return readingsCache.current[key]
  }, [])
  const setScenario = useCallback((hiveId, scenario) => setHiveSim((s) => ({ ...s, [hiveId]: { ...(s[hiveId] || { baseWeight: 32, nectarFlow: 1 }), scenario } })), [])

  const value = { chain, ready, integrity, append, tamper, reset, hives, batches, getReadings, setScenario }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
