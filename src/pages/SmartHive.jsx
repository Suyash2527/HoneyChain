import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { useSettings } from '../lib/settings.jsx'
import { BLOCK_TYPES as T, computeMerkleRoot, shortHash } from '../lib/chain'
import { SCENARIOS, nextReading } from '../lib/sensors'
import { diagnose, forecastYield } from '../lib/ai.js'
import { Icon, PageHead, Spark, useToast } from '../lib/ui.jsx'
import { CountUp, Reveal } from '../lib/motion.jsx'

const SEV = { ok: ['check_circle', 'ok'], warn: ['error', 'warn'], critical: ['emergency', 'bad'] }

export default function SmartHive() {
  const { hives, getReadings } = useStore()
  const { t } = useSettings()
  const [sel, setSel] = useState(null)
  const hive = hives.find((h) => h.hiveId === sel)
  if (hive) return <Detail hive={hive} onBack={() => setSel(null)} />

  const rows = hives.map((h) => { const r = getReadings(h); return { h, r, dx: diagnose(r), last: r[r.length - 1] } })
  const count = (s) => rows.filter((x) => x.dx.severity === s).length
  return (
    <div className="stack">
      <PageHead kicker="Apiary monitoring" title={t('hv.title')} bilKey="hv.title" sub={t('hv.sub')} />
      <div className="grid g4">
        <div className="metric"><div className="lbl">Hives</div><b><CountUp to={rows.length} /></b></div>
        <div className="metric"><div className="lbl">{t('hv.status.ok')}</div><b style={{ color: 'var(--ok)' }}><CountUp to={count('ok')} /></b></div>
        <div className="metric"><div className="lbl">{t('hv.status.warn')}</div><b style={{ color: 'var(--caution)' }}><CountUp to={count('warn')} /></b></div>
        <div className="metric"><div className="lbl">{t('hv.status.critical')}</div><b style={{ color: 'var(--danger)' }}><CountUp to={count('critical')} /></b></div>
      </div>
      <div className="grid g3">
        {rows.map(({ h, r, dx, last }, idx) => (
          <Reveal key={h.hiveId} delay={idx * 70} variant="scale"><button className={'hivecard ' + dx.severity} style={{ width: '100%' }} onClick={() => setSel(h.hiveId)}>
            <div className="row between"><span className="hash id">{h.hiveId}</span><span className={'pill ' + SEV[dx.severity][1]}><Icon n={SEV[dx.severity][0]} size="sm" fill />{t('hv.status.' + dx.severity)}</span></div>
            <span className="muted small">{h.owner} · {h.village}</span>
            <b style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem' }}>{dx.top.label}</b>
            <div className="row small mono" style={{ gap: 14 }}><span>{last.broodTemp.toFixed(1)}°C</span><span>{last.weight.toFixed(0)} kg</span><span>{last.humidity.toFixed(0)}% RH</span></div>
            <Spark data={r.slice(-72).map((x) => x.weight)} />
          </button></Reveal>
        ))}
      </div>
    </div>
  )
}

function Detail({ hive, onBack }) {
  const { getReadings, setScenario, append, chain } = useStore()
  const { t, expert } = useSettings()
  const [toast, show] = useToast()
  const base = useMemo(() => getReadings(hive), [hive, getReadings])
  const [live, setLive] = useState([])
  const [tick, setTick] = useState(0)
  useEffect(() => { setLive([]); setTick(0) }, [hive.hiveId, hive.sim.scenario])
  useEffect(() => { const id = setInterval(() => setTick((x) => x + 1), 1500); return () => clearInterval(id) }, [])
  useEffect(() => { if (tick) setLive((l) => [...l, nextReading(hive, l[l.length - 1] || base[base.length - 1], tick)].slice(-40)) }, [tick]) // eslint-disable-line

  const series = [...base, ...live]
  const last = series[series.length - 1]
  const dx = diagnose(series)
  const fc = forecastYield(series, 0.85)
  const att = chain.filter((b) => b.type === T.SENSOR_ATTESTATION && b.payload.hiveId === hive.hiveId)
  const recent = (k) => series.slice(-72).map((r) => r[k])
  const anchor = async () => {
    const win = series.slice(-24 * 14)
    await append(T.SENSOR_ATTESTATION, { hiveId: hive.hiveId, windowDays: 14, samples: win.length, merkleRoot: await computeMerkleRoot(win) })
    show(t('hv.anchor'))
  }
  const M = ({ k, unit, color, band }) => <div className="metric"><div className="lbl">{t('m.' + k)}</div><b>{last[k]} <small>{unit}</small></b><Spark data={recent(k)} color={color} band={band} /></div>
  const [ico, tone] = SEV[dx.severity]

  return (
    <div className="stack">
      {toast}
      <button className="btn tertiary" style={{ justifySelf: 'start', padding: 0 }} onClick={onBack}><Icon n="arrow_back" size="sm" /> {t('hv.back')}</button>
      <PageHead kicker={`${hive.village}, ${hive.district}`} title={hive.hiveId} sub={hive.owner}><span className="live"><span className="pulse" /> {t('hv.live')}</span></PageHead>

      <div className={'notice ' + (dx.severity === 'critical' ? 'critical' : dx.severity)}>
        <Icon n={ico} fill className="lg" />
        <div><b style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem' }}>{dx.top.label}</b> <span className="mono">· {Math.round(dx.top.p * 100)}% {t('hv.confidence')}</span>
          <div style={{ color: 'var(--ink)', marginTop: 2 }}>{dx.advice}</div></div>
      </div>

      <div className="grid g4">
        <M k="broodTemp" unit="°C" band={[33, 36]} /><M k="humidity" unit="%" color="var(--info)" /><M k="weight" unit="kg" color="var(--ok)" /><M k="soundHz" unit="Hz" color="var(--amber-ink)" />
        <M k="activity" unit="/5 min" /><M k="co2" unit="ppm" color="var(--danger)" /><M k="ambient" unit="°C" color="var(--caution)" />
      </div>

      <div className="grid g2">
        <div className="card">
          <div className="head"><h3><Icon n="psychology" />{t('hv.diag')}</h3></div>
          <div className="stack sm" style={{ marginTop: 14 }}>
            {(expert ? dx.probs : dx.probs.slice(0, 3)).map((p) => (
              <div key={p.label}><div className="row between small"><span>{p.label}</span><b className="mono">{(p.p * 100).toFixed(0)}%</b></div>
                <div className={'meter' + (p.label === 'Healthy colony' ? ' good' : p.p > 0.5 ? ' crit' : '')}><i style={{ width: p.p * 100 + '%' }} /></div></div>
            ))}
          </div>
          {expert && <p className="muted small" style={{ margin: '12px 0 0' }}>Explainable feature model (prototype). Production path: CNN on hive audio and thermal trends.</p>}
        </div>
        <div className="card">
          <div className="head"><h3><Icon n="trending_up" />{t('hv.forecast')}</h3></div>
          <div style={{ margin: '14px 0 4px' }}><span className="stat-b" style={{ fontFamily: 'var(--serif)', fontSize: '2.4rem', fontWeight: 600 }}>{fc.kg} kg</span></div>
          <span className="muted small">{t('hv.range')}: {fc.low} - {fc.high} kg</span>
          <Spark data={fc.dailyHistory} color="var(--ok)" />
        </div>
      </div>

      <div className="card panel">
        <div className="head"><h3><Icon n="lock" />{t('hv.anchor')}</h3></div>
        <p className="muted" style={{ margin: '12px 0' }}>{t('hv.anchor.d')}</p>
        <div className="row"><button className="btn" onClick={anchor}>{t('hv.anchor')}</button>{att.length > 0 && <span className="pill ok"><Icon n="check" size="sm" />{att.length}{expert && <span className="mono"> · {shortHash(att[att.length - 1].payload.merkleRoot)}</span>}</span>}</div>
      </div>

      <label className="field"><span>{t('hv.demo')}</span>
        <select className="input" value={hive.sim.scenario} onChange={(e) => setScenario(hive.hiveId, e.target.value)}>{Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
    </div>
  )
}
