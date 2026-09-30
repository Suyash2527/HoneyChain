import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { useSettings } from '../lib/settings.jsx'
import { BLOCK_TYPES as T, shortHash } from '../lib/chain'
import { fmtTime, Icon, PageHead, useToast } from '../lib/ui.jsx'
import { Reveal } from '../lib/motion.jsx'
import { showReceipt, RECEIPT_META } from '../lib/receipt'

export default function Explorer() {
  const { chain, integrity, tamper, reset } = useStore()
  const { t, expert } = useSettings()
  const [toast, show] = useToast()
  const [open, setOpen] = useState(null)
  const bad = new Map(integrity.results.map((r) => [r.index, r]))
  const first = chain.find((b) => b.type === T.HARVEST_LOGGED)
  const forge = () => { if (!first) return; tamper(first.index, { quantityKg: first.payload.quantityKg + 100 }); show(`Block #${first.index} altered: +100 kg`) }

  return (
    <div className="stack">
      {toast}
      <PageHead kicker="Audit" title={t('x.title')} bilKey="x.title" sub={t('x.sub')} />
      <div className={'notice ' + (integrity.valid ? 'info' : 'critical')} style={{ display: 'block' }}>
        <div className="row"><Icon n={integrity.valid ? 'shield' : 'gpp_bad'} fill className="lg" />
          <div style={{ flex: 1, minWidth: 220 }}><b style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem' }}>{t('x.demo')}</b><div style={{ color: 'var(--ink)' }}>{t('x.demo.d')}</div></div>
          <span className={'pill ' + (integrity.valid ? 'ok' : 'bad')}>{integrity.valid ? t('x.valid') : `${t('chain.bad')} #${integrity.firstBadIndex}`}</span></div>
        <div className="row" style={{ marginTop: 12 }}><button className="btn danger" onClick={forge}>{t('x.forge')}</button><button className="btn secondary" onClick={reset}><Icon n="restart_alt" size="sm" /> {t('x.restore')}</button></div>
      </div>

      <div className="stack sm">
        {chain.slice().reverse().map((b, i) => {
          const r = bad.get(b.index)
          const broken = r && !r.ok
          return (
            <Reveal key={b.index} delay={Math.min(i, 8) * 40} variant="left" className={'block' + (broken ? ' badblk' : '')}>
              <div className="row between"><span className="row" style={{ gap: 8 }}><span className="hash id">#{b.index}</span><span className="pill info">{b.type.replaceAll('_', ' ')}</span>{broken && <span className="pill bad"><Icon n="warning" size="sm" fill />{t('x.altered')}</span>}</span>
                <span className="mono faint">{fmtTime(b.timestamp)}{expert && ' · ' + b.validator}</span></div>
              {expert && <div className="mono faint" style={{ marginTop: 6, wordBreak: 'break-all' }}>{shortHash(b.hash, 16)} ← {shortHash(b.prevHash, 16)}</div>}
              <div className="row" style={{ gap: 14, marginTop: 6 }}><button className="btn tertiary sm" style={{ padding: 0 }} onClick={() => setOpen(open === b.index ? null : b.index)}>{open === b.index ? t('x.hidep') : t('x.showp')}</button>{RECEIPT_META[b.type] && <button className="btn tertiary sm" style={{ padding: 0 }} onClick={() => showReceipt(b)}><Icon n="receipt_long" size="sm" /> Receipt</button>}</div>
              {open === b.index && <pre>{JSON.stringify(b.payload, null, 2)}</pre>}
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
