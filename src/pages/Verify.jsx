import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { useSettings } from '../lib/settings.jsx'
import { traceBatch, PURITY_LIMITS, shortHash } from '../lib/chain'
import { Bil, CopyHash, fmtDate, fmtTime, HexMark, Icon, PageHead, QR, Seal, VERDICT_ICON, verifyUrl, useToast } from '../lib/ui.jsx'

function Scanner({ onCode, onClose }) {
  const { t } = useSettings()
  const [err, setErr] = useState('')
  const ref = useRef(null)
  useEffect(() => {
    let cancelled = false
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return
      const scanner = new Html5Qrcode('reader')
      ref.current = scanner
      scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 220 }, (text) => onCode(text), () => {})
        .catch((e) => setErr('Camera unavailable: ' + (e?.message || e) + ' - type the batch ID instead.'))
    })
    return () => { cancelled = true; const s = ref.current; if (s) s.stop().then(() => s.clear()).catch(() => {}) }
  }, [onCode])
  return (
    <div className="stack sm" style={{ marginTop: 14 }}>
      <div id="reader" />
      {err && <div className="notice warn"><Icon n="videocam_off" />{err}</div>}
      <button className="btn secondary" onClick={onClose}>{t('v.stopscan')}</button>
    </div>
  )
}

export default function Verify({ arg }) {
  const { chain, batches, integrity } = useStore()
  const { t } = useSettings()
  const [input, setInput] = useState(arg || '')
  const [scanning, setScanning] = useState(false)
  const id = (arg || '').toUpperCase()
  const tr = id ? traceBatch(chain, id) : null
  useEffect(() => { setInput(arg || '') }, [arg])
  const go = (v) => { const m = String(v).match(/HC-\d{4}-\d{4}/i); if (String(v).trim()) location.hash = '#/verify/' + (m ? m[0].toUpperCase() : String(v).trim()) }
  const onCode = (text) => { setScanning(false); go(text) }

  return (
    <div className="stack">
      <PageHead kicker="Public verification" title={t('v.title')} bilKey="v.title" sub={t('v.sub')} />
      <div className="card panel">
        <form className="row" onSubmit={(e) => { e.preventDefault(); go(input) }}>
          <label className="sr" htmlFor="bid">Batch ID</label>
          <input id="bid" className="input" style={{ flex: '1 1 240px', fontFamily: 'var(--mono)' }} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('v.placeholder')} autoCapitalize="characters" />
          <button className="btn lg">{t('v.go')}</button>
          <button type="button" className="btn lg secondary" onClick={() => setScanning((s) => !s)}><Icon n="qr_code_scanner" /> {scanning ? t('v.stopscan') : t('v.scan')}</button>
        </form>
        <div className="samples" style={{ marginTop: 12 }}><span className="kicker">{t('v.samples')}</span>
          {batches.map((b) => {
            const x = traceBatch(chain, b)
            const lbl = { AUTHENTIC: t('v.s.good'), REJECT: t('v.s.fake'), PENDING: t('v.s.wait'), CAUTION: '!' }[x.verdict]
            return <a key={b} className={'chip' + (b === id ? ' on' : '')} href={'#/verify/' + b}><Icon n={VERDICT_ICON[x.verdict]} size="sm" fill />{b.slice(-4)} · {lbl}</a>
          })}
        </div>
        {scanning && <Scanner onCode={onCode} onClose={() => setScanning(false)} />}
      </div>

      {tr && !integrity.valid && <div className="notice critical"><Icon n="gpp_bad" />{t('v.integrity')}</div>}
      {tr && !tr.found && <div className="notice critical"><Icon n="gpp_bad" /><span><b>{t('v.notfound')}</b> <span className="mono">({tr.batchId})</span></span></div>}
      {tr && tr.found && <Result key={tr.batchId} tr={tr} />}
    </div>
  )
}

function Result({ tr }) {
  const { t, tb, expert } = useSettings()
  const [toast, show] = useToast()
  const h = tr.harvest.payload
  const lab = tr.lab && tr.lab.payload
  const hive0 = tr.hives[0]?.payload
  // Real signers of this batch's blocks - the quorum the ledger actually recorded.
  const signers = [...new Set([...tr.events, ...tr.hives, ...tr.attestations].map((b) => b.validator))]
  const lastBlock = [...tr.events].pop()
  const copy = () => { navigator.clipboard?.writeText(verifyUrl(tr.batchId)).then(() => show(t('v.copied'))) }

  return (
    <div className="split">
      {toast}
      <div className="stack">
        {/* Ledger anchor strip */}
        <section className="card flat rise">
          <div className="row between">
            <div className="row" style={{ gap: 8 }}><CopyHash text={tr.batchId} label={tr.batchId} /><span className="pill ok"><Icon n="lock" size="sm" fill /> Immutable</span></div>
            <span className="hash">Block #{lastBlock.index} · {fmtTime(lastBlock.timestamp)}</span>
          </div>
          <p className="small muted" style={{ margin: '8px 0 0', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Read directly from the ledger, not from the seller · लेजर से सीधे पढ़ा गया</p>
        </section>

        {/* Verdict hero */}
        <section className={'hero-v rise ' + tr.verdict} style={{ animationDelay: '.05s' }}>
          <HexMark className="wm" size={230} /><HexMark className="wm2" size={190} />
          <Seal value={tr.score} label={t('v.score')} />
          <span className="mission-tag"><Icon n={VERDICT_ICON[tr.verdict]} size="sm" fill /> KVIC Honey Mission · {t('verdict.' + tr.verdict).split(' - ')[0]}</span>
          <h2>{t('verdict.' + tr.verdict)}</h2>
          <div className="hi" lang="hi">{tb('verdict.' + tr.verdict)}</div>
          <p className="why">{t('verdict.' + tr.verdict + '.d')}</p>
          <div className="quorum">
            <div className="r"><span><Icon n="how_to_vote" size="sm" /> Signed by {signers.length} of 3 network validators</span></div>
            <p>{signers.join(' · ')}</p>
          </div>
        </section>

        {tr.flags.length > 0 && (
          <section className="card flat panel"><div className="head"><h3><Icon n="flag" />{t('v.notes')}</h3></div>
            <ul style={{ margin: '12px 0 0', paddingLeft: 20 }}>{tr.flags.map((f) => <li key={f}>{f}</li>)}</ul></section>
        )}

        {/* Origin dossier */}
        <section className="card">
          <div className="head"><div><h3><Icon n="nest_eco_area" />{t('v.origin')}</h3><Bil k="v.origin" /></div>{hive0 && <span className="hash">{hive0.cluster}</span>}</div>
          <dl className="spec" style={{ margin: '14px 0 0' }}>
            <div><dt>{t('v.beekeeper')}</dt><b>{h.harvestedBy}</b></div>
            {hive0 && <div><dt>{t('v.place')}</dt><b>{hive0.village}, {hive0.district}, {hive0.state}</b></div>}
            {hive0 && hive0.lat > 0 && <div><dt>GPS</dt><b className="mono">{hive0.lat.toFixed(4)}° N, {hive0.lng.toFixed(4)}° E</b></div>}
            <div><dt>{t('v.flora')}</dt><b>{h.floral}</b></div>
            <div><dt>{t('v.hives')}</dt><b className="mono">{h.hiveIds.join(' · ')}</b></div>
            <div><dt>{t('v.qty')}</dt><b className="mono">{h.quantityKg} kg ({(h.quantityKg / h.hiveIds.length).toFixed(1)} kg/hive)</b></div>
            <div><dt>{t('v.harvested')}</dt><b>{fmtDate(tr.harvest.timestamp)}</b></div>
            {expert && <div><dt>{t('v.method')}</dt><b>{h.method}</b></div>}
          </dl>
        </section>

        {/* Lab certificate */}
        <section className="card">
          <div className="head"><div><h3><Icon n="biotech" />{t('v.lab')}</h3><Bil k="v.lab" /></div>
            {lab ? <span className={'pill ' + (lab.pass ? 'ok' : 'bad')}><Icon n={lab.pass ? 'verified' : 'close'} size="sm" fill /> {lab.pass ? t('v.pass') : t('v.fail')}</span> : <span className="pill info">{t('v.nolab')}</span>}</div>
          {lab && (
            <>
              <div className="row between" style={{ margin: '12px 0', fontSize: '.8rem' }}><span><span className="kicker">Laboratory</span><br /><b>{lab.lab}</b></span><span style={{ textAlign: 'right' }}><span className="kicker">Report</span><br /><span className="mono">{lab.reportHash}</span></span></div>
              <div>{Object.entries(PURITY_LIMITS).map(([k, l]) => {
                const v = lab.tests[k]
                const bad = (l.max !== undefined && v > l.max) || (l.min !== undefined && v < l.min)
                return (
                  <div key={k} className={'labrow' + (bad ? ' out' : '')}>
                    <span><b>{l.label}</b><small>Limit {l.max !== undefined ? '≤ ' + l.max : '≥ ' + l.min} {l.unit}</small></span>
                    <span className="row" style={{ gap: 10 }}><span className="num">{v}{l.unit === '%' ? '%' : ' ' + l.unit}</span>
                      <span className={'pill ' + (bad ? 'bad' : 'ok')}><Icon n={bad ? 'close' : 'check'} size="sm" />{bad ? t('v.fail') : t('v.pass')}</span></span>
                  </div>
                )
              })}</div>
              <p className="small faint" style={{ margin: '10px 0 0' }}>{fmtDate(tr.lab.timestamp)}{expert && <> · block <span className="mono">{shortHash(tr.lab.hash)}</span></>}</p>
            </>
          )}
        </section>

        {/* Journey */}
        <section className="card">
          <div className="head"><div><h3><Icon n="route" />{t('v.journey')}</h3><Bil k="v.journey" /></div><span className="pill info">{tr.events.length + tr.hives.length + tr.attestations.length} events</span></div>
          <div className="timeline" style={{ marginTop: 18 }}>
            {tr.hives.map((b) => <Step key={b.hash} icon="hive" when={fmtDate(b.timestamp)} title={`Hive ${b.payload.hiveId} registered`} note={`${b.payload.owner}, ${b.payload.village}`} b={b} expert={expert} />)}
            {tr.attestations.map((b) => <Step key={b.hash} icon="sensors" good when={fmtDate(b.timestamp)} title={`IoT data anchored (${b.payload.hiveId})`} note={`${b.payload.samples} readings sealed into a Merkle root`} b={b} expert={expert} />)}
            {tr.events.map((b) => {
              const p = b.payload
              const m = { HARVEST_LOGGED: ['water_drop', `Harvest logged - ${p.quantityKg} kg ${p.floral}`, `Cold extraction by ${p.harvestedBy}`], LAB_CERTIFIED: [p.pass ? 'biotech' : 'science', `Lab ${p.pass ? 'certified' : 'rejected'}`, p.lab], CUSTODY_TRANSFER: ['swap_horiz', `${p.from} → ${p.to}`, p.note], RETAIL_PACKED: ['inventory_2', `Packed ${p.bottles} × ${p.sizeGrams} g`, p.retailer] }[b.type] || ['circle', b.type, '']
              return <Step key={b.hash} icon={m[0]} good={b.type === 'LAB_CERTIFIED' && p.pass} fail={b.type === 'LAB_CERTIFIED' && !p.pass} when={fmtDate(b.timestamp)} title={m[1]} note={m[2]} b={b} expert={expert} />
            })}
          </div>
        </section>

        <details className="acc">
          <summary><Icon n="key" />{t('v.details')}</summary>
          <div className="body stack sm">
            {[...tr.events].map((b) => <div key={b.hash} className="row between small"><span className="mono">#{b.index} {b.type}</span><span className="mono faint">{shortHash(b.hash, 12)} · {b.validator}</span></div>)}
            <p className="small faint" style={{ margin: 0 }}>Each block stores the hash of the previous block; editing any record breaks the chain from that point. Signatures in this prototype are simulated (production: Ed25519 validator keys).</p>
          </div>
        </details>
      </div>

      <aside className="stack" style={{ position: 'sticky', top: 76 }}>
        <div className="card"><div className="head"><h3><Icon n="qr_code_2" />{t('v.qr')}</h3></div><div style={{ marginTop: 14 }}><QR batchId={tr.batchId} /></div></div>
        <button className="btn lg" onClick={copy}><Icon n="ios_share" />{t('v.share')}</button>
      </aside>
    </div>
  )
}

function Step({ icon, title, note, when, good, fail, b, expert }) {
  return (
    <div className={'tl' + (good ? ' good' : '') + (fail ? ' fail' : '')}>
      <span className="m"><Icon n={icon} size="sm" fill={good} /></span>
      <span className="when">{when}{expert && <> · #{b.index} · {shortHash(b.hash)}</>}</span>
      <b>{title}</b>{note && <p>{note}</p>}
    </div>
  )
}
