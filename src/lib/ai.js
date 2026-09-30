// Edge-AI analytics for hive health and yield.
// PROTOTYPE: transparent feature-based scoring so judges can audit every
// decision. The production path swaps these for models trained on labelled
// acoustic + thermal data (e.g. a small CNN on mel-spectrograms) running on-device.

const mean = (a) => a.reduce((s, x) => s + x, 0) / (a.length || 1)
const std = (a) => {
  const m = mean(a)
  return Math.sqrt(mean(a.map((x) => (x - m) ** 2)))
}
const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x))

function slope(ys) {
  const n = ys.length
  const xm = (n - 1) / 2
  const ym = mean(ys)
  let num = 0
  let den = 0
  ys.forEach((y, i) => { num += (i - xm) * (y - ym); den += (i - xm) ** 2 })
  return den ? num / den : 0
}

export function extractFeatures(readings) {
  const recent = readings.slice(-72) // last 3 days
  const base = readings.slice(0, Math.max(24, readings.length - 72)) // earlier baseline
  const daytime = (r) => r.filter((x) => { const h = new Date(x.ts).getHours(); return h >= 10 && h <= 16 })
  return {
    broodTemp: mean(recent.map((r) => r.broodTemp)),
    broodTempStd: std(recent.map((r) => r.broodTemp)),
    humidity: mean(recent.map((r) => r.humidity)),
    soundHz: mean(recent.map((r) => r.soundHz)),
    soundShift: mean(recent.map((r) => r.soundHz)) - mean(base.map((r) => r.soundHz)),
    activityDrop: 1 - mean(daytime(recent).map((r) => r.activity)) / (mean(daytime(base).map((r) => r.activity)) || 1),
    weightSlopeDay: slope(recent.map((r) => r.weight)) * 24, // kg/day
    weightDropMax: Math.max(0, ...recent.slice(1).map((r, i) => recent[i].weight - r.weight)),
    co2: mean(recent.map((r) => r.co2)),
  }
}

export function diagnose(readings) {
  const f = extractFeatures(readings)
  // A sudden step-drop in weight means swarming; a slow steady decline means starvation.
  const gradual = 1 - clamp((f.weightDropMax - 0.1) / 0.2)
  const raw = {
    'Healthy colony': 2.6,
    'Varroa infestation': 4.5 * clamp((f.broodTempStd - 0.2) / 0.3) + 2.0 * clamp((f.activityDrop - 0.05) / 0.15) + 1.5 * clamp((f.soundShift - 5) / 15),
    'Foulbrood suspected': 3.0 * clamp((34.6 - f.broodTemp) / 2.0) + 1.6 * clamp((f.humidity - 60) / 10) + 1.2 * clamp((f.co2 - 700) / 300),
    'Queenless colony': 4.0 * clamp((f.soundShift - 20) / 25) * (1 - clamp(f.weightDropMax / 0.2)) + 0.8 * clamp((34.6 - f.broodTemp) / 1.2),
    'Pre-swarm': 4.0 * clamp((f.soundShift - 60) / 35) + 1.5 * clamp((f.broodTemp - 35) / 0.4) + 1.5 * clamp(f.weightDropMax / 0.25),
    'Food shortage': 3.8 * clamp(-f.weightSlopeDay / 0.5) * gradual + 1.0 * clamp(f.activityDrop / 0.3) * gradual,
  }
  const exp = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Math.exp(v)]))
  const total = Object.values(exp).reduce((s, x) => s + x, 0)
  const probs = Object.entries(exp).map(([label, e]) => ({ label, p: e / total })).sort((a, b) => b.p - a.p)
  const top = probs[0]
  const advice = {
    'Healthy colony': 'No action needed. Continue routine inspection every 10 days.',
    'Varroa infestation': 'Perform sugar-roll or alcohol-wash mite count. If above threshold, treat with organic acid (oxalic/formic) after the honey flow.',
    'Foulbrood suspected': 'Isolate hive, inspect brood comb for ropy/sunken cappings and report to KVIC field officer. Do NOT move frames to other hives.',
    'Queenless colony': 'Check for eggs and young brood. Introduce a mated queen or merge with a strong colony within 7 days.',
    'Pre-swarm': 'Add super space, remove queen cells, and split colony to prevent loss of workforce and yield.',
    'Food shortage': 'Feed 1:1 sugar syrup or move hive to a forage-rich site; avoid harvesting until stores recover.',
  }[top.label]
  const severity = top.label === 'Healthy colony' ? 'ok' : top.p > 0.55 ? 'critical' : 'warn'
  return { features: f, probs, top, advice, severity }
}

// Yield forecast: recent net weight gain trend combined with a forage-availability
// index (regional flowering calendar) and colony strength -> kg for next 30 days.
export function forecastYield(readings, forageIndex = 0.8, horizonDays = 30) {
  const daily = []
  for (let i = 0; i + 24 <= readings.length; i += 24) daily.push(readings[i + 23].weight - readings[i].weight)
  const last7 = daily.slice(-7)
  const avg = mean(last7)
  const trend = slope(daily.slice(-10))
  const expected = Math.max(0, (avg + trend * horizonDays * 0.25) * horizonDays * (0.6 + 0.4 * forageIndex))
  const sd = Math.max(std(last7) * Math.sqrt(horizonDays) * 0.6, 0.12 * expected + 0.4) // model-uncertainty floor
  return {
    dailyAvg: avg,
    kg: +expected.toFixed(1),
    low: +Math.max(0, expected - 1.28 * sd).toFixed(1),
    high: +(expected + 1.28 * sd).toFixed(1),
    dailyHistory: daily,
  }
}
