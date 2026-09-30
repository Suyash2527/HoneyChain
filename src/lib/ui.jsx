import { useCallback, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { useSettings } from './settings.jsx'
import { CountUp } from './motion.jsx'

export const fmtDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
export const fmtTime = (ts) => new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })

export const Icon = ({ n, fill, size, className = '' }) => (
  <span className={`icon ${fill ? 'fill' : ''} ${size || ''} ${className}`} aria-hidden="true">{n}</span>
)

// Second-language caption under a label (English <-> Hindi), as in the design system.
export function Bil({ k }) {
  const { tb } = useSettings()
  return <span className="bil" lang="hi">{tb(k)}</span>
}

export function useToast() {
  const [msg, setMsg] = useState('')
  const t = useRef()
  const show = useCallback((m) => { setMsg(m); clearTimeout(t.current); t.current = setTimeout(() => setMsg(''), 2600) }, [])
  return [msg ? <div className="toast" role="status">{msg}</div> : null, show]
}

export function PageHead({ kicker, title, bilKey, sub, children }) {
  return (
    <header className="pagehead">
      <div>
        {kicker && <span className="kicker">{kicker}</span>}
        <h1>{title}</h1>
        {bilKey && <Bil k={bilKey} />}
        {sub && <p className="lede">{sub}</p>}
      </div>
      {children}
    </header>
  )
}

export function Spark({ data, color = 'var(--primary)', band }) {
  if (!data.length) return null
  const lo = Math.min(...data, band ? band[0] : Infinity)
  const hi = Math.max(...data, band ? band[1] : -Infinity)
  const span = hi - lo || 1
  const y = (v) => 38 - ((v - lo) / span) * 34 - 2
  const pts = data.map((v, i) => `${(i / (data.length - 1 || 1)) * 300},${y(v)}`).join(' ')
  return (
    <svg className="spark draw" viewBox="0 0 300 40" preserveAspectRatio="none" role="img" aria-label="trend">
      {band && <rect x="0" width="300" y={y(band[1])} height={Math.max(2, y(band[0]) - y(band[1]))} fill="currentColor" opacity=".12" style={{ color: 'var(--ok)' }} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}

const HEX = '50 3, 90 25, 90 75, 50 97, 10 75, 10 25'
export const HexMark = ({ size = 200, className }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true"><polygon points={HEX} fill="currentColor" /></svg>
)

// Trust-score seal: ring fills once on mount.
export function Seal({ value, label }) {
  const [v, setV] = useState(0)
  useEffect(() => { const id = requestAnimationFrame(() => setV(value)); return () => cancelAnimationFrame(id) }, [value])
  const C = 314.15
  return (
    <div className="seal" role="img" aria-label={`${label} ${value} of 100`}>
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="7" />
        <circle className="fg" cx="60" cy="60" r="50" fill="none" stroke="var(--amber)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C - (C * v) / 100} />
      </svg>
      <div className="c"><b><CountUp to={value} duration={1300} /></b><small>{label}</small></div>
    </div>
  )
}

export function verifyUrl(batchId) { return `${location.origin}${location.pathname}#/verify/${batchId}` }

export function QR({ batchId, size = 180 }) {
  const [src, setSrc] = useState('')
  useEffect(() => { QRCode.toDataURL(verifyUrl(batchId), { width: size * 2, margin: 1, color: { dark: '#1b1a17', light: '#ffffff' } }).then(setSrc) }, [batchId, size])
  return (
    <div className="qrbox">
      {src && <img src={src} alt={`QR code for ${batchId}`} />}
      <span className="hash id">{batchId}</span>
      {src && <a className="btn secondary sm" href={src} download={`${batchId}-qr.png`}><Icon n="download" size="sm" /> PNG</a>}
    </div>
  )
}

export function CopyHash({ text, label }) {
  const [ok, setOk] = useState(false)
  return (
    <button className="hash" style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard?.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1200) })} aria-label={`Copy ${label || text}`}>
      {label || text} <Icon n={ok ? 'check' : 'content_copy'} size="sm" />
    </button>
  )
}

export const VERDICT_ICON = { AUTHENTIC: 'verified', CAUTION: 'warning', REJECT: 'gpp_bad', PENDING: 'hourglass_top' }
