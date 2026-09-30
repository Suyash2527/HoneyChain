import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { useSettings } from '../lib/settings.jsx'
import { BLOCK_TYPES as T } from '../lib/chain'
import { Icon, PageHead, QR, useToast } from '../lib/ui.jsx'

const Field = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>

export default function Beekeeper() {
  const { hives, chain, append } = useStore()
  const { t } = useSettings()
  const [toast, show] = useToast()
  const [step, setStep] = useState(1)
  const [issued, setIssued] = useState(null)
  const [harv, setHarv] = useState({ hiveIds: [], quantityKg: '', floral: '', method: 'Cold extraction (KVIC toolkit)' })
  const [hive, setHive] = useState({ owner: '', village: '', district: '', state: 'Maharashtra', cluster: 'KVIC-MH-01', flora: '' })

  const nextHiveId = () => 'HV-' + String(hives.length + 1).padStart(3, '0')
  const nextBatchId = () => `HC-${new Date().getFullYear()}-${String(chain.filter((b) => b.type === T.HARVEST_LOGGED).length + 1).padStart(4, '0')}`
  const toggle = (id) => setHarv((h) => ({ ...h, hiveIds: h.hiveIds.includes(id) ? h.hiveIds.filter((x) => x !== id) : [...h.hiveIds, id] }))

  const create = async (e) => {
    e.preventDefault()
    const owner = hives.find((h) => h.hiveId === harv.hiveIds[0])?.owner || 'Unknown'
    const batchId = nextBatchId()
    await append(T.HARVEST_LOGGED, { batchId, hiveIds: harv.hiveIds, quantityKg: Number(harv.quantityKg), floral: harv.floral, method: harv.method, harvestedBy: owner })
    setIssued(batchId); setStep(3)
  }
  const restart = () => { setIssued(null); setStep(1); setHarv({ ...harv, hiveIds: [], quantityKg: '', floral: '' }) }
  const registerHive = async (e) => {
    e.preventDefault()
    const hiveId = nextHiveId()
    await append(T.HIVE_REGISTERED, { hiveId, ...hive, lat: 0, lng: 0, species: 'Apis mellifera', boxType: 'Langstroth 10-frame', kvicBoxId: 'KVIC-' + hiveId })
    show(`${hiveId} registered`); setHive({ ...hive, flora: '' })
  }

  return (
    <div className="stack">
      {toast}
      <PageHead kicker="Beekeeper" title={t('h.title')} bilKey="h.title" sub={t('h.sub')} />
      <div className="stepper">{[t('h.s1'), t('h.s2'), t('h.s3')].map((s, i) => <div key={i} className={'s' + (step === i + 1 ? ' on' : step > i + 1 ? ' done' : '')}><i>{step > i + 1 ? <Icon n="check" size="sm" /> : i + 1}</i><span>{s}</span></div>)}</div>

      <div className="card">
        {step === 1 && (
          <div className="stack">
            <p className="muted" style={{ margin: 0 }}>{t('h.pick')}</p>
            <div className="pick">{hives.map((h) => (
              <button type="button" key={h.hiveId} className={harv.hiveIds.includes(h.hiveId) ? 'on' : ''} aria-pressed={harv.hiveIds.includes(h.hiveId)} onClick={() => toggle(h.hiveId)}>
                <b>{h.hiveId}</b><small>{h.owner} · {h.village}</small></button>
            ))}</div>
            <div className="row between"><span className="hash">{harv.hiveIds.length} selected</span><button className="btn lg" disabled={!harv.hiveIds.length} onClick={() => setStep(2)}>{t('h.next')} <Icon n="arrow_forward" /></button></div>
          </div>
        )}
        {step === 2 && (
          <form className="form" onSubmit={create}>
            <div className="grid g2">
              <Field label={t('h.qty')}><input className="input" required type="number" min="1" step="0.1" inputMode="decimal" value={harv.quantityKg} onChange={(e) => setHarv({ ...harv, quantityKg: e.target.value })} autoFocus /></Field>
              <Field label={t('h.flora')}><input className="input" required value={harv.floral} onChange={(e) => setHarv({ ...harv, floral: e.target.value })} /></Field>
            </div>
            <div className="row">{['Mustard', 'Eucalyptus', 'Litchi', 'Ber', 'Wildflower'].map((f) => <button key={f} type="button" className={'chip' + (harv.floral === f ? ' on' : '')} onClick={() => setHarv({ ...harv, floral: f })}>{f}</button>)}</div>
            <Field label={t('h.method')}><input className="input" value={harv.method} onChange={(e) => setHarv({ ...harv, method: e.target.value })} /></Field>
            <div className="row between"><button type="button" className="btn secondary" onClick={() => setStep(1)}><Icon n="arrow_back" /> {t('h.back')}</button><button className="btn lg">{t('h.create')}</button></div>
          </form>
        )}
        {step === 3 && issued && (
          <div className="stack" style={{ justifyItems: 'center', textAlign: 'center' }}>
            <span className="kicker">Batch sealed on ledger</span>
            <h2>{t('h.done')}</h2>
            <QR batchId={issued} size={210} />
            <p className="muted" style={{ maxWidth: '48ch' }}>{t('h.done.d')}</p>
            <div className="row" style={{ justifyContent: 'center' }}><a className="btn" href={'#/verify/' + issued}><Icon n="verified_user" /> {t('h.view')}</a><button className="btn secondary" onClick={restart}>{t('h.another')}</button></div>
          </div>
        )}
      </div>

      <details className="acc">
        <summary><Icon n="add_box" />{t('h.addhive')}<span className="hash" style={{ marginLeft: 'auto', marginRight: 34 }}>{nextHiveId()}</span></summary>
        <form className="body form" onSubmit={registerHive}>
          <p className="muted small" style={{ margin: 0 }}>{t('h.addhive.sub')}</p>
          <div className="grid g2">
            <Field label={t('h.owner')}><input className="input" required value={hive.owner} onChange={(e) => setHive({ ...hive, owner: e.target.value })} /></Field>
            <Field label={t('h.village')}><input className="input" required value={hive.village} onChange={(e) => setHive({ ...hive, village: e.target.value })} /></Field>
            <Field label={t('h.district')}><input className="input" required value={hive.district} onChange={(e) => setHive({ ...hive, district: e.target.value })} /></Field>
            <Field label={t('h.state')}><input className="input" required value={hive.state} onChange={(e) => setHive({ ...hive, state: e.target.value })} /></Field>
            <Field label={t('h.clusterf')}><input className="input" required value={hive.cluster} onChange={(e) => setHive({ ...hive, cluster: e.target.value })} /></Field>
            <Field label={t('h.mainflora')}><input className="input" required value={hive.flora} onChange={(e) => setHive({ ...hive, flora: e.target.value })} /></Field>
          </div>
          <div><button className="btn">{t('h.register')}</button></div>
        </form>
      </details>
    </div>
  )
}
