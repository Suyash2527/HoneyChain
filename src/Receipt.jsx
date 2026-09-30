import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { buildReceipt, receiptText, printerSound, tearSound, soundOn, setSound } from './lib/receipt.js'
import { verifyUrl, Icon } from './lib/ui.jsx'
import { motionOn } from './lib/motion.jsx'

const PRINT_MS = 3700

// A real tear is never regular: random teeth, and the stub's edge is the exact complement of the strip's.
function makeTear() {
  const pts = []
  let x = 0
  while (x < 100) { pts.push([x, 1 + Math.random() * 10]); x += 1.2 + Math.random() * 5 }
  pts.push([100, 1 + Math.random() * 10])
  const f = ([px, py], dy = 0) => `${px.toFixed(1)}% ${(py + dy).toFixed(1)}px`
  return {
    strip: `polygon(${pts.map((p) => f(p)).join(', ')}, 100% calc(100% + 10px), 0 calc(100% + 10px))`,
    stub: `polygon(0 0, 100% 0, ${[...pts].reverse().map((p) => f(p, 14)).join(', ')})`,
  }
}

// Decorative Code-39 style barcode derived from the block hash.
function Barcode({ hash }) {
  const bars = useMemo(() => {
    let x = 0
    const out = []
    for (const ch of hash.slice(0, 26)) {
      const n = parseInt(ch, 16)
      for (let b = 0; b < 4; b++) {
        const w = ((n >> b) & 1) + 1
        if (b % 2 === 0) out.push([x, w])
        x += w + 1
      }
      x += 2
    }
    return { out, width: x }
  }, [hash])
  return (
    <svg className="rc-barcode" viewBox={`0 0 ${bars.width} 30`} preserveAspectRatio="none" aria-hidden="true">
      {bars.out.map(([bx, w], i) => <rect key={i} x={bx} y="0" width={w} height="30" fill="#1b1a17" />)}
    </svg>
  )
}

export default function Receipt() {
  const [block, setBlock] = useState(null)
  const [phase, setPhase] = useState('printing') // printing | done | pull | torn
  const [qr, setQr] = useState('')
  const [sound, setSoundState] = useState(soundOn())
  const closeRef = useRef(null)
  const [tear, setTear] = useState(null)

  useEffect(() => {
    const on = (e) => { setBlock(e.detail); setPhase(motionOn() ? 'printing' : 'done') }
    window.addEventListener('hc-receipt', on)
    return () => window.removeEventListener('hc-receipt', on)
  }, [])

  const r = useMemo(() => (block ? buildReceipt(block) : null), [block])

  useEffect(() => {
    if (!r) return
    window.__lenis?.stop()
    QRCode.toDataURL(r.batchId ? verifyUrl(r.batchId) : location.href, { width: 240, margin: 0, color: { dark: '#1b1a17', light: '#fbf8f0' } }).then(setQr)
    if (motionOn()) printerSound(PRINT_MS - 300)
    const id = setTimeout(() => setPhase('settle'), motionOn() ? PRINT_MS : 0)
    const id2 = motionOn() ? setTimeout(() => setPhase('done'), PRINT_MS + 1300) : 0
    return () => { clearTimeout(id); clearTimeout(id2); window.__lenis?.start() }
  }, [r])

  useEffect(() => { if (phase === 'done') closeRef.current?.focus() }, [phase])

  const close = () => {
    if (!motionOn()) return setBlock(null)
    // 1) pull: paper pivots and the crack runs across the width  2) it comes free: irregular edge, stub stays  3) strip flutters away
    setTear(makeTear()); setPhase('pull'); setTimeout(tearSound, 140)
    setTimeout(() => setPhase('torn'), 560)
    setTimeout(() => setBlock(null), 2500)
  }
  useEffect(() => {
    if (!block) return
    const on = (e) => { if (e.key === 'Escape') close() }
    addEventListener('keydown', on); return () => removeEventListener('keydown', on)
  }, [block]) // eslint-disable-line

  if (!r) return null
  const printing = phase === 'printing'
  const ready = phase === 'settle' || phase === 'done'
  const copy = () => navigator.clipboard?.writeText(receiptText(r))
  const wa = () => window.open('https://wa.me/?text=' + encodeURIComponent(receiptText(r)), '_blank', 'noopener')
  const toggleSound = () => { setSound(!sound); setSoundState(!sound) }

  return (
    <div className={'rc-scrim' + (phase === 'pull' || phase === 'torn' ? ' tearing' : '')} onClick={(e) => e.target === e.currentTarget && close()}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true"><filter id="paper-wave" x="-2%" y="-1%" width="104%" height="102%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.018" numOctaves="2" seed="7" result="w" /><feDisplacementMap in="SourceGraphic" in2="w" scale="3.2" xChannelSelector="R" yChannelSelector="G" /></filter></svg>
      <div className="rc-wrap" role="dialog" aria-modal="true" aria-label={`Receipt ${r.no}`}>
        <div className={'printer' + (printing ? ' on' : '')}>
          <div className="printer-top">
            <span className="led" /><span className="plabel">HONEY CHAIN · LEDGER PRINTER</span>
            <button className="pbtn" onClick={toggleSound} aria-label={sound ? 'Mute printer sound' : 'Unmute printer sound'} title="Printer sound"><Icon n={sound ? 'volume_up' : 'volume_off'} size="sm" /></button>
          </div>
          <div className="slot" />
        </div>

        <div className={'feed' + (ready ? ' done' : '') + (phase === 'torn' || phase === 'pull' ? ' ' + phase : '')}>
          {phase === 'torn' && tear && <div className="stub" aria-hidden="true" style={{ clipPath: tear.stub }} />}
          <article className={'paper' + (printing ? ' printing' : '') + (phase === 'settle' ? ' settle' : '') + (phase === 'pull' ? ' pull' : '') + (phase === 'torn' ? ' torn' : '')} style={phase === 'torn' && tear ? { clipPath: tear.strip } : undefined} aria-live="polite">
            {phase === 'pull' && <span className="crack" aria-hidden="true" />}
            <span className="rc-tex" aria-hidden="true" />
            <header className="rc-head">
              <svg width="34" height="34" viewBox="0 0 48 48" aria-hidden="true"><polygon points="24,2 44,14 44,34 24,46 4,34 4,14" fill="none" stroke="#1b1a17" strokeWidth="2.5" /><circle cx="24" cy="24" r="5" fill="#1b1a17" /></svg>
              <b>HONEY CHAIN</b>
              <span>KVIC HONEY MISSION</span>
              <span className="rc-sub">LEDGER RECEIPT · बहीखाता रसीद</span>
            </header>
            <div className="rc-sep" />
            <div className="rc-title"><Icon n={r.icon} size="sm" /> {r.title}<small>{r.hi}</small></div>
            <div className="rc-meta"><span>No. {r.no}</span><span>{r.when}</span></div>
            <div className="rc-sep" />
            <dl className="rc-rows">
              {r.rows.map(([k, v, tone], i) => (
                <div key={i} className={tone === 'bad' ? 'bad' : ''}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
            <div className="rc-sep" />
            <div className={'rc-result ' + r.result.tone}>{r.result.text}</div>
            <div className="rc-sep" />
            <dl className="rc-rows small">
              <div><dt>Block</dt><dd>#{r.index}</dd></div>
              <div><dt>Signed by</dt><dd>{r.validator}</dd></div>
              <div><dt>Hash</dt><dd className="hash">{r.hash.slice(0, 28)}<br />{r.hash.slice(28, 56)}</dd></div>
              <div><dt>Prev</dt><dd className="hash">{r.prev.slice(0, 16)}…</dd></div>
            </dl>
            <Barcode hash={r.hash} />
            {qr && <img className="rc-qr" src={qr} alt={r.batchId ? `QR to verify ${r.batchId}` : 'QR code'} />}
            <p className="rc-foot">{r.batchId ? 'Scan to verify this batch' : 'Scan to open Honey Chain'}<br />★ Every drop, proven. ★<br /><span>धन्यवाद</span></p>
          </article>
        </div>

        <div className={'rc-actions' + (printing ? ' wait' : '')}>
          <button className="btn sm" onClick={() => window.print()}><Icon n="print" size="sm" /> Print / PDF</button>
          <button className="btn secondary sm" onClick={copy}><Icon n="content_copy" size="sm" /> Copy</button>
          <button className="btn secondary sm" onClick={wa}><Icon n="ios_share" size="sm" /> WhatsApp</button>
          {r.batchId && <a className="btn secondary sm" href={'#/verify/' + r.batchId} onClick={close}><Icon n="verified_user" size="sm" /> Verify</a>}
          <button ref={closeRef} className="btn tertiary sm" onClick={() => (printing ? setPhase('done') : close())}>{printing ? 'Skip' : 'Tear off'} <Icon n="close" size="sm" /></button>
        </div>
      </div>
    </div>
  )
}
