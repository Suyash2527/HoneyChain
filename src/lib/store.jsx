import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { BLOCK_TYPES as T, evaluatePurity, makeBlock, verifyChain, computeMerkleRoot } from './chain'
import { generateReadings } from './sensors'

const STORAGE_KEY = 'honeychain.v1'
const DAY = 24 * 3600 * 1000

// Simulation parameters for the physical hive nodes (not stored on-chain).
export const SEED_HIVE_SIM = {
  'HV-001': { scenario: 'healthy', baseWeight: 38, nectarFlow: 1.3 },
  'HV-002': { scenario: 'healthy', baseWeight: 34, nectarFlow: 1.1 },
  'HV-003': { scenario: 'varroa', baseWeight: 33, nectarFlow: 0.9 },
  'HV-004': { scenario: 'swarm', baseWeight: 41, nectarFlow: 1.2 },
  'HV-005': { scenario: 'queenless', baseWeight: 30, nectarFlow: 0.8 },
  'HV-006': { scenario: 'foulbrood', baseWeight: 29, nectarFlow: 0.7 },
}

export async function buildSeedChain() {
  const now = Date.now()
  const chain = []
  const add = async (type, payload, daysAgo) => {
    chain.push(await makeBlock(chain[chain.length - 1] || null, type, payload, now - daysAgo * DAY))
  }
  await add(T.GENESIS, { note: 'Honey Chain genesis - KVIC Honey Mission ledger', network: 'honeychain-poa-1' }, 90)

  const keepers = [
    { hiveId: 'HV-001', owner: 'Ramesh Patil', village: 'Kalmeshwar', district: 'Nagpur', state: 'Maharashtra', lat: 21.23, lng: 78.91, cluster: 'KVIC-MH-01', flora: 'Eucalyptus / Jamun' },
    { hiveId: 'HV-002', owner: 'Ramesh Patil', village: 'Kalmeshwar', district: 'Nagpur', state: 'Maharashtra', lat: 21.24, lng: 78.92, cluster: 'KVIC-MH-01', flora: 'Eucalyptus / Jamun' },
    { hiveId: 'HV-003', owner: 'Sunita Devi', village: 'Deeg', district: 'Bharatpur', state: 'Rajasthan', lat: 27.47, lng: 77.33, cluster: 'KVIC-RJ-04', flora: 'Mustard' },
    { hiveId: 'HV-004', owner: 'Sunita Devi', village: 'Deeg', district: 'Bharatpur', state: 'Rajasthan', lat: 27.48, lng: 77.34, cluster: 'KVIC-RJ-04', flora: 'Mustard' },
    { hiveId: 'HV-005', owner: 'Lalita Meena', village: 'Bonli', district: 'Sawai Madhopur', state: 'Rajasthan', lat: 26.02, lng: 76.35, cluster: 'KVIC-RJ-07', flora: 'Ber / Wildflower' },
    { hiveId: 'HV-006', owner: 'Lalita Meena', village: 'Bonli', district: 'Sawai Madhopur', state: 'Rajasthan', lat: 26.03, lng: 76.36, cluster: 'KVIC-RJ-07', flora: 'Ber / Wildflower' },
  ]
  for (const k of keepers) await add(T.HIVE_REGISTERED, { ...k, species: 'Apis mellifera', boxType: 'Langstroth 10-frame', kvicBoxId: 'KVIC-' + k.hiveId }, 75)

  // Batch 1: fully verified premium mustard honey
  await add(T.HARVEST_LOGGED, { batchId: 'HC-2026-0001', hiveIds: ['HV-003', 'HV-004'], quantityKg: 62, floral: 'Mustard', harvestedBy: 'Sunita Devi', method: 'Cold extraction (KVIC toolkit)' }, 40)
  const t1 = { moisture: 17.8, hmf: 14, sucrose: 1.9, reducingSugar: 71, ash: 0.18, c4Sugar: 1.1 }
  await add(T.LAB_CERTIFIED, { batchId: 'HC-2026-0001', lab: 'NABL Lab - KVIC Jaipur', tests: t1, ...evaluatePurity(t1), reportHash: 'a9c2…seed' }, 36)
  await add(T.CUSTODY_TRANSFER, { batchId: 'HC-2026-0001', from: 'Sunita Devi', to: 'KVIC Processing Unit - Jaipur', note: 'Filtered and bottled' }, 33)
  await add(T.RETAIL_PACKED, { batchId: 'HC-2026-0001', bottles: 124, sizeGrams: 500, retailer: 'Khadi Gramodyog Bhawan, Jaipur' }, 30)
  await add(T.SENSOR_ATTESTATION, { hiveId: 'HV-003', windowDays: 14, samples: 336, merkleRoot: await computeMerkleRoot(['seed-a', 'seed-b', 'seed-c']) }, 32)

  // Batch 2: eucalyptus, certified
  await add(T.HARVEST_LOGGED, { batchId: 'HC-2026-0002', hiveIds: ['HV-001', 'HV-002'], quantityKg: 48, floral: 'Eucalyptus', harvestedBy: 'Ramesh Patil', method: 'Cold extraction (KVIC toolkit)' }, 25)
  const t2 = { moisture: 18.9, hmf: 22, sucrose: 2.6, reducingSugar: 69, ash: 0.22, c4Sugar: 2.3 }
  await add(T.LAB_CERTIFIED, { batchId: 'HC-2026-0002', lab: 'NABL Lab - KVIC Nagpur', tests: t2, ...evaluatePurity(t2), reportHash: 'b7d1…seed' }, 21)
  await add(T.SENSOR_ATTESTATION, { hiveId: 'HV-001', windowDays: 14, samples: 336, merkleRoot: await computeMerkleRoot(['seed-d', 'seed-e']) }, 22)
  await add(T.CUSTODY_TRANSFER, { batchId: 'HC-2026-0002', from: 'Ramesh Patil', to: 'Nagpur Distributor Co-op', note: 'Bulk 48 kg drums' }, 18)

  // Batch 3: counterfeit / adulterated - lab fails
  await add(T.HARVEST_LOGGED, { batchId: 'HC-2026-0003', hiveIds: ['HV-005'], quantityKg: 95, floral: 'Wildflower', harvestedBy: 'Lalita Meena', method: 'Unknown' }, 15)
  const t3 = { moisture: 24.6, hmf: 112, sucrose: 9.4, reducingSugar: 58, ash: 0.09, c4Sugar: 21 }
  await add(T.LAB_CERTIFIED, { batchId: 'HC-2026-0003', lab: 'NABL Lab - KVIC Jaipur', tests: t3, ...evaluatePurity(t3), reportHash: 'c3e8…seed' }, 12)

  // Batch 4: fresh harvest awaiting lab
  await add(T.HARVEST_LOGGED, { batchId: 'HC-2026-0004', hiveIds: ['HV-006'], quantityKg: 21, floral: 'Ber', harvestedBy: 'Lalita Meena', method: 'Cold extraction (KVIC toolkit)' }, 3)
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
    () => chain.filter((b) => b.type === T.HARVEST_LOGGED).map((b) => b.payload.batchId),
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
