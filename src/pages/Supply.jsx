import { useMemo, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { useSettings } from '../lib/settings.jsx'
import { BLOCK_TYPES as T, shortHash, traceBatch } from '../lib/chain'
import { showReceipt } from '../lib/receipt'
import { fmtDate, Icon, PageHead, useToast } from '../lib/ui.jsx'

// NOTE: these components live at module level on purpose. Defining inputs inside the page
// component makes React remount them on every keystroke, which steals focus after each character.
const Field = ({ label, value, onChange, list, ...rest }) => (
  <label className="field"><span>{label}</span>
    <input className="input" value={value} onChange={(e) => onChange(e.target.value)} list={list} {...rest} /></label>
)

const PARTIES = [
  'KVIC Processing Unit - Jaipur', 'KVIC Processing Unit - Nagpur', 'KVIC Processing Unit - Muzaffarpur', 'Regional Distributor Co-op',
  'Khadi Gramodyog Bhawan, Jaipur', 'Khadi Bhawan, New Delhi', 'Organic retail store', 'Export aggregator', 'Farmers market stall',
]

export default function Supply() {
  const { batches, chain, append } = useStore()
  const { t, expert } = useSettings()
  const [toast, show] = useToast()
  const [batchId, setBatchId] = useState('')
  const [tr, setTr] = useState({ from: '', to: '', note: '' })
  const [pk, setPk] = useState({ bottles: '', sizeGrams: 500, retailer: '' })

  const info = useMemo(() => {
    if (!batchId) return null
    const x = traceBatch(chain, batchId)
    if (!x.found) return null
    const packedKg = x.events.filter((e) => e.type === T.RETAIL_PACKED).reduce((s, e) => s + (e.payload.bottles * e.payload.sizeGrams) / 1000, 0)
    const holder = [...x.custody].pop()?.payload.to || x.harvest.payload.harvestedBy
    return { x, packedKg, remainingKg: Math.max(0, x.harvest.payload.quantityKg - packedKg), holder, rejected: !!x.lab && !x.lab.payload.pass }
  }, [chain, batchId])

  const pick = (id) => { setBatchId(id); const x = id && traceBatch(chain, id); setTr({ from: x?.found ? ([...x.custody].pop()?.payload.to || x.harvest.payload.harvestedBy) : '', to: '', note: '' }) }

  const transfer = async (e) => {
    e.preventDefault()
    if (!info) return show(t('s.choose'))
    if (info.rejected) return show('Rejected batch cannot move')
    if (tr.from.trim().toLowerCase() === tr.to.trim().toLowerCase()) return show('From and To must be different')
    await append(T.CUSTODY_TRANSFER, { batchId, ...tr })
    setTr({ from: tr.to, to: '', note: '' })
  }
  const pack = async (e) => {
    e.preventDefault()
    if (!info) return show(t('s.choose'))
    if (info.rejected) return show('Rejected batch cannot be packed for retail')
    const kg = (Number(pk.bottles) * Number(pk.sizeGrams)) / 1000
    if (kg > info.remainingKg + 1e-9) return show(`Only ${info.remainingKg.toFixed(1)} kg left to pack in this batch`)
    await append(T.RETAIL_PACKED, { batchId, ...pk, bottles: Number(pk.bottles), sizeGrams: Number(pk.sizeGrams) })
    setPk({ ...pk, bottles: '' })
  }

  const events = chain.filter((b) => b.type === T.CUSTODY_TRANSFER || b.type === T.RETAIL_PACKED).slice().reverse()
  const kgNow = (Number(pk.bottles) * Number(pk.sizeGrams)) / 1000
  const blocked = !info || info.rejected

  return (
    <div className="stack">
      {toast}
      <PageHead kicker="Chain of custody" title={t('s.title')} bilKey="s.title" sub={t('s.sub')} />

      <div className="card panel stack sm">
        <label className="field"><span>{t('l.batch')}</span>
          <select className="input" style={{ fontFamily: 'var(--mono)' }} value={batchId} onChange={(e) => pick(e.target.value)}>
            <option value="">{t('s.choose')}…</option>{batches.map((b) => <option key={b}>{b}</option>)}</select></label>
        {info && (
          <div className="row" style={{ gap: 18 }}>
            <span className={'pill ' + (info.rejected ? 'bad' : info.x.verdict === 'AUTHENTIC' ? 'ok' : 'warn')}>{info.rejected ? 'LAB FAIL' : info.x.verdict}</span>
            <span className="small"><b>{info.x.harvest.payload.floral}</b> · {info.x.harvest.payload.quantityKg} kg · {info.x.harvest.payload.harvestedBy}</span>
            <span className="small muted">Current holder: <b>{info.holder}</b></span>
            <span className="small muted">Packed <b>{info.packedKg.toFixed(1)}</b> kg · <b>{info.remainingKg.toFixed(1)}</b> kg left</span>
          </div>
        )}
        {info?.rejected && <div className="notice critical"><Icon n="gpp_bad" />This batch failed its laboratory test. As in the smart contract, a rejected batch cannot be transferred or packed.</div>}
      </div>

      <datalist id="parties">{PARTIES.map((p) => <option key={p} value={p} />)}</datalist>
      <div className="grid g2">
        <form className="card form" onSubmit={transfer}>
          <div className="head"><h3><Icon n="swap_horiz" />{t('s.transfer')}</h3></div>
          <div className="grid g2">
            <Field label={t('s.from')} value={tr.from} onChange={(v) => setTr({ ...tr, from: v })} list="parties" required />
            <Field label={t('s.to')} value={tr.to} onChange={(v) => setTr({ ...tr, to: v })} list="parties" required placeholder="Type or pick…" />
          </div>
          <Field label={t('s.note')} value={tr.note} onChange={(v) => setTr({ ...tr, note: v })} placeholder="Filtered, bottled, cold-chain…" />
          <div className="row">{['Filtered and bottled', 'Bulk drums', 'Cold-chain truck', 'Quality re-check'].map((n) => <button type="button" key={n} className="chip" onClick={() => setTr({ ...tr, note: n })}>{n}</button>)}</div>
          <div><button className="btn" disabled={blocked}>{t('s.save')}</button></div>
        </form>

        <form className="card form" onSubmit={pack}>
          <div className="head"><h3><Icon n="inventory_2" />{t('s.pack')}</h3></div>
          <div className="grid g2">
            <Field label={t('s.bottles')} type="number" min="1" inputMode="numeric" value={pk.bottles} onChange={(v) => setPk({ ...pk, bottles: v })} required />
            <Field label={t('s.size')} type="number" min="50" inputMode="numeric" value={pk.sizeGrams} onChange={(v) => setPk({ ...pk, sizeGrams: v })} required />
          </div>
          <div className="row">{[250, 500, 1000].map((g) => <button type="button" key={g} className={'chip' + (Number(pk.sizeGrams) === g ? ' on' : '')} onClick={() => setPk({ ...pk, sizeGrams: g })}>{g} g</button>)}</div>
          <Field label={t('s.retailer')} value={pk.retailer} onChange={(v) => setPk({ ...pk, retailer: v })} list="parties" required />
          {info && kgNow > 0 && <div className={'notice ' + (kgNow > info.remainingKg ? 'critical' : 'info')}><Icon n="scale" />Packing {kgNow.toFixed(1)} kg of {info.remainingKg.toFixed(1)} kg remaining</div>}
          <div><button className="btn" disabled={blocked}>{t('s.save')}</button></div>
        </form>
      </div>

      <div>
        <div className="head" style={{ marginBottom: 12 }}><h3>{t('s.recent')}</h3></div>
        <div className="scroll"><table className="ledger">
          <thead><tr><th>Date</th><th>Batch</th><th>Event</th>{expert && <th>Block</th>}<th /></tr></thead>
          <tbody>{events.map((b) => (
            <tr key={b.hash}><td>{fmtDate(b.timestamp)}</td><td><a className="mono" href={'#/verify/' + b.payload.batchId}>{b.payload.batchId}</a></td>
              <td>{b.type === T.CUSTODY_TRANSFER ? `${b.payload.from} → ${b.payload.to}${b.payload.note ? ' (' + b.payload.note + ')' : ''}` : `Packed ${b.payload.bottles} × ${b.payload.sizeGrams} g → ${b.payload.retailer}`}</td>
              {expert && <td className="mono">{shortHash(b.hash)}</td>}
              <td><button className="btn tertiary sm" style={{ padding: 0 }} onClick={() => showReceipt(b)}><Icon n="receipt_long" size="sm" /></button></td></tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  )
}
