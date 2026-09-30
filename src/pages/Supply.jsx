import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { useSettings } from '../lib/settings.jsx'
import { BLOCK_TYPES as T, shortHash } from '../lib/chain'
import { fmtDate, Icon, PageHead, useToast } from '../lib/ui.jsx'

export default function Supply() {
  const { batches, chain, append } = useStore()
  const { t, expert } = useSettings()
  const [toast, show] = useToast()
  const [tr, setTr] = useState({ batchId: '', from: '', to: '', note: '' })
  const [pk, setPk] = useState({ batchId: '', bottles: '', sizeGrams: 500, retailer: '' })
  const events = chain.filter((b) => b.type === T.CUSTODY_TRANSFER || b.type === T.RETAIL_PACKED).slice().reverse()

  const transfer = async (e) => { e.preventDefault(); await append(T.CUSTODY_TRANSFER, tr); show(t('s.save')); setTr({ ...tr, from: tr.to, to: '', note: '' }) }
  const pack = async (e) => { e.preventDefault(); await append(T.RETAIL_PACKED, { ...pk, bottles: Number(pk.bottles), sizeGrams: Number(pk.sizeGrams) }); show(t('s.save')) }
  const Sel = ({ v, set }) => (
    <label className="field"><span>{t('l.batch')}</span>
      <select className="input" style={{ fontFamily: 'var(--mono)' }} value={v} onChange={(e) => set(e.target.value)} required><option value="">{t('s.choose')}…</option>{batches.map((b) => <option key={b}>{b}</option>)}</select></label>
  )
  const F = ({ label, value, onChange, ...p }) => <label className="field"><span>{label}</span><input className="input" value={value} onChange={(e) => onChange(e.target.value)} {...p} /></label>

  return (
    <div className="stack">
      {toast}
      <PageHead kicker="Chain of custody" title={t('s.title')} bilKey="s.title" sub={t('s.sub')} />
      <div className="grid g2">
        <form className="card form" onSubmit={transfer}>
          <div className="head"><h3><Icon n="swap_horiz" />{t('s.transfer')}</h3></div>
          <Sel v={tr.batchId} set={(v) => setTr({ ...tr, batchId: v })} />
          <div className="grid g2"><F label={t('s.from')} value={tr.from} onChange={(v) => setTr({ ...tr, from: v })} required /><F label={t('s.to')} value={tr.to} onChange={(v) => setTr({ ...tr, to: v })} required /></div>
          <F label={t('s.note')} value={tr.note} onChange={(v) => setTr({ ...tr, note: v })} />
          <div><button className="btn">{t('s.save')}</button></div>
        </form>
        <form className="card form" onSubmit={pack}>
          <div className="head"><h3><Icon n="inventory_2" />{t('s.pack')}</h3></div>
          <Sel v={pk.batchId} set={(v) => setPk({ ...pk, batchId: v })} />
          <div className="grid g2"><F label={t('s.bottles')} type="number" min="1" inputMode="numeric" value={pk.bottles} onChange={(v) => setPk({ ...pk, bottles: v })} required /><F label={t('s.size')} type="number" min="50" inputMode="numeric" value={pk.sizeGrams} onChange={(v) => setPk({ ...pk, sizeGrams: v })} required /></div>
          <F label={t('s.retailer')} value={pk.retailer} onChange={(v) => setPk({ ...pk, retailer: v })} required />
          <div><button className="btn">{t('s.save')}</button></div>
        </form>
      </div>
      <div>
        <div className="head" style={{ marginBottom: 12 }}><h3>{t('s.recent')}</h3></div>
        <div className="scroll"><table className="ledger">
          <thead><tr><th>Date</th><th>Batch</th><th>Event</th>{expert && <th>Block</th>}</tr></thead>
          <tbody>{events.map((b) => (
            <tr key={b.hash}><td>{fmtDate(b.timestamp)}</td><td><a className="mono" href={'#/verify/' + b.payload.batchId}>{b.payload.batchId}</a></td>
              <td>{b.type === T.CUSTODY_TRANSFER ? `${b.payload.from} → ${b.payload.to}${b.payload.note ? ' (' + b.payload.note + ')' : ''}` : `Packed ${b.payload.bottles} × ${b.payload.sizeGrams} g → ${b.payload.retailer}`}</td>
              {expert && <td className="mono">{shortHash(b.hash)}</td>}</tr>
          ))}</tbody>
        </table></div>
      </div>
    </div>
  )
}
