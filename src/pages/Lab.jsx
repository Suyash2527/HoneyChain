import { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { useSettings } from '../lib/settings.jsx'
import { BLOCK_TYPES as T, PURITY_LIMITS, PURITY_FLAGS, evaluatePurity, sha256, canonical } from '../lib/chain'
import { Icon, PageHead, useToast } from '../lib/ui.jsx'

const PRESETS = {
  genuine: { moisture: 18.2, hmf: 18, sucrose: 2.1, reducingSugar: 70, ash: 0.2, c4Sugar: 1.8, nmr: 'Consistent', smr: 'Absent' },
  engineered: { moisture: 18.5, hmf: 20, sucrose: 2.4, reducingSugar: 69, ash: 0.2, c4Sugar: 2.1, nmr: 'Anomaly', smr: 'Detected' },
  adulterated: { moisture: 23.5, hmf: 105, sucrose: 8.8, reducingSugar: 59, ash: 0.1, c4Sugar: 19, nmr: 'Anomaly', smr: 'Detected' },
}

export default function Lab() {
  const { batches, chain, append } = useStore()
  const { t } = useSettings()
  const [toast, show] = useToast()
  const [batchId, setBatchId] = useState('')
  const [lab, setLab] = useState('NABL Lab - KVIC Nagpur')
  const [tests, setTests] = useState(PRESETS.genuine)
  const verdict = useMemo(() => evaluatePurity(tests), [tests])
  const pending = batches.filter((b) => !chain.some((x) => x.type === T.LAB_CERTIFIED && x.payload.batchId === b))

  const submit = async (e) => {
    e.preventDefault()
    if (!batchId) return show(t('l.select'))
    const reportHash = (await sha256(canonical({ batchId, lab, tests }))).slice(0, 16)
    await append(T.LAB_CERTIFIED, { batchId, lab, tests: Object.fromEntries(Object.entries(tests).map(([k, v]) => [k, k in PURITY_FLAGS ? v : Number(v)])), ...verdict, reportHash })
    show(`${batchId}: ${verdict.pass ? 'PASS' : 'FAIL'} sealed`)
  }

  return (
    <div className="stack">
      {toast}
      <PageHead kicker="Laboratory" title={t('l.title')} bilKey="l.title" sub={t('l.sub')} />
      <form className="card form" onSubmit={submit}>
        <div className="grid g2">
          <label className="field"><span>{t('l.batch')} <span className="pill warn">{pending.length} pending</span></span>
            <select className="input" value={batchId} onChange={(e) => setBatchId(e.target.value)} style={{ fontFamily: 'var(--mono)' }}>
              <option value="">{t('l.select')}…</option>
              {batches.map((b) => <option key={b} value={b}>{b}{pending.includes(b) ? '  (pending)' : ''}</option>)}
            </select></label>
          <label className="field"><span>{t('l.lab')}</span><input className="input" value={lab} onChange={(e) => setLab(e.target.value)} /></label>
        </div>
        <div className="row"><span className="kicker">{t('l.sample')}</span>
          <button type="button" className="chip" onClick={() => setTests(PRESETS.genuine)}><Icon n="verified" size="sm" fill />{t('l.genuine')}</button>
          <button type="button" className="chip" onClick={() => setTests(PRESETS.adulterated)}><Icon n="gpp_bad" size="sm" />{t('l.fake')}</button>
          <button type="button" className="chip" onClick={() => setTests(PRESETS.engineered)}><Icon n="science" size="sm" />Passes C4/HMF, fails NMR</button></div>
        <div className="grid g3">
          {Object.entries(PURITY_LIMITS).map(([k, l]) => {
            const v = Number(tests[k])
            const bad = (l.max !== undefined && v > l.max) || (l.min !== undefined && v < l.min)
            return (
              <label className="field" key={k}><span>{l.label} <span className="faint mono">{l.unit} · {l.max !== undefined ? '≤ ' + l.max : '≥ ' + l.min}</span></span>
                <input className="input" type="number" step="0.01" inputMode="decimal" value={tests[k]} onChange={(e) => setTests({ ...tests, [k]: e.target.value })} style={bad ? { borderColor: 'var(--danger)', background: 'var(--danger-bg)' } : undefined} /></label>
            )
          })}
        </div>
        <div className="grid g2">
          {Object.entries(PURITY_FLAGS).map(([k, f]) => (
            <label className="field" key={k}><span>{f.label} <span className="faint mono">expected: {f.good}</span></span>
              <select className="input" value={tests[k]} onChange={(e) => setTests({ ...tests, [k]: e.target.value })} style={tests[k] === f.bad ? { borderColor: 'var(--danger)', background: 'var(--danger-bg)' } : undefined}>
                <option>{f.good}</option><option>{f.bad}</option></select></label>
          ))}
        </div>
        <div className={'notice ' + (verdict.pass ? 'ok' : 'critical')}><Icon n={verdict.pass ? 'verified' : 'gpp_bad'} fill />{verdict.pass ? t('l.allpass') : 'FAIL: ' + verdict.failures.join('; ')}</div>
        <div className="row between"><span className="small faint"><Icon n="lock" size="sm" /> Results cannot be edited after saving.</span><button className="btn lg">{t('l.submit')}</button></div>
      </form>
      <p className="muted small">Thresholds are indicative (modelled on FSSAI / BIS honey parameters); production limits are set by the notified lab and regulator.</p>
    </div>
  )
}
