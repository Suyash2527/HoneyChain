// Simulated IoT hive node (ESP32 + load cell + DHT22 + DS18B20 + MEMS mic).
// Health "scenarios" inject the physical signatures each condition produces.

export const SCENARIOS = {
  healthy: 'Healthy colony',
  varroa: 'Varroa infestation',
  foulbrood: 'Foulbrood suspected',
  queenless: 'Queenless colony',
  swarm: 'Pre-swarm',
  starving: 'Food shortage',
}

// Small seeded PRNG so the demo is repeatable per hive.
function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function seedFrom(str) {
  let h = 2166136261
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return h >>> 0
}

// One reading per hour for `hours` hours ending at `endTs`.
export function generateReadings(hive, hours = 24 * 14, endTs = Date.now()) {
  const rand = rng(seedFrom(hive.hiveId))
  const out = []
  let weight = hive.baseWeight
  const sc = hive.scenario
  for (let i = hours - 1; i >= 0; i--) {
    const ts = endTs - i * 3600 * 1000
    const hour = new Date(ts).getHours()
    const day = Math.floor((hours - i) / 24)
    const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI)) // 0 at night, 1 at noon
    const ambient = 24 + 9 * Math.sin(((hour - 9) / 24) * 2 * Math.PI) + (rand() - 0.5) * 1.2
    let brood = 34.6 + (rand() - 0.5) * 0.5
    let humidity = 55 + (rand() - 0.5) * 4
    let hz = 240 + (rand() - 0.5) * 14
    let activity = 30 + 170 * daylight + (rand() - 0.5) * 20 // entrance counts / 5 min
    let dW = daylight * 0.16 * hive.nectarFlow - (1 - daylight) * 0.008 // kg / hour

    const progress = (hours - i) / hours // 0..1, condition worsens toward "now"
    if (sc === 'varroa') { brood += (rand() - 0.5) * 1.6 * progress; activity *= 1 - 0.22 * progress; dW *= 1 - 0.5 * progress; hz += 25 * progress }
    if (sc === 'foulbrood') { brood -= 2.4 * progress; humidity += 14 * progress; activity *= 1 - 0.3 * progress; dW *= 1 - 0.7 * progress }
    if (sc === 'queenless') { hz += 90 * progress + (rand() - 0.5) * 30 * progress; activity *= 1 - 0.15 * progress; brood -= 0.8 * progress }
    if (sc === 'swarm') { hz += 190 * progress; brood += 0.9 * progress; activity *= 1 + 0.25 * progress; if (progress > 0.93) dW -= 0.35 }
    if (sc === 'starving') { dW = -0.02 - 0.05 * progress * (0.4 + daylight); activity *= 1 - 0.35 * progress }

    weight = Math.max(8, weight + dW)
    out.push({
      ts,
      day,
      ambient: +ambient.toFixed(1),
      broodTemp: +brood.toFixed(2),
      humidity: +humidity.toFixed(1),
      soundHz: +hz.toFixed(0),
      activity: Math.max(0, Math.round(activity)),
      weight: +weight.toFixed(2),
      co2: Math.round(620 + (rand() - 0.5) * 80 + (sc === 'foulbrood' ? 380 * progress : 0)),
    })
  }
  return out
}

// Next live reading appended to an existing series (used by the live ticker).
export function nextReading(hive, last, tick) {
  const rand = rng(seedFrom(hive.hiveId) + tick * 7919)
  const drift = (v, amp) => +(v + (rand() - 0.5) * amp).toFixed(2)
  return {
    ...last,
    ts: Date.now(),
    ambient: drift(last.ambient, 0.4),
    broodTemp: drift(last.broodTemp, 0.15),
    humidity: drift(last.humidity, 0.8),
    soundHz: Math.round(drift(last.soundHz, 6)),
    activity: Math.max(0, Math.round(drift(last.activity, 8))),
    weight: drift(last.weight, 0.02),
    co2: Math.round(drift(last.co2, 20)),
  }
}
