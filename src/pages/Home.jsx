import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { useSettings, ROLE_HOME } from '../lib/settings.jsx'
import { BLOCK_TYPES as T, shortHash } from '../lib/chain'
import { generateReadings } from '../lib/sensors'
import { CountUp, Reveal, Words } from '../lib/motion.jsx'
import { HexMark, Icon, QR, Seal, Spark } from '../lib/ui.jsx'

const ROLE_ICON = { consumer: 'shopping_basket', beekeeper: 'hive', lab: 'biotech', processor: 'inventory_2', officer: 'account_balance' }
const STEP_ICON = ['hive', 'sensors', 'water_drop', 'biotech', 'local_shipping', 'verified_user']
const DEMO_HIVE = { hiveId: 'HV-001', scenario: 'healthy', baseWeight: 38, nectarFlow: 1.3 }

// The sticky illustration for each step of the story. `key` on the parent restarts its animation.
function StoryVisual({ step }) {
  const spark = useRef(generateReadings(DEMO_HIVE, 72).map((r) => r.weight)).current
  const K = (k) => ({ '--k': k })
  if (step === 1) return (
    <div className="sv">
      <div style={K(0)} className="row"><span className="hash id">HV-003</span><span className="pill info">KVIC-RJ-04</span></div>
      <div style={K(1)}><h3 style={{ fontSize: '1.4rem' }}>Sunita Devi</h3><span className="muted small">Deeg, Bharatpur, Rajasthan</span></div>
      <dl className="spec" style={K(2)}><div><dt>Box type</dt><b>Langstroth 10-frame</b></div><div><dt>Main flora</dt><b>Mustard</b></div></dl>
      <span className="pill ok stamp"><Icon n="verified" size="sm" fill /> REGISTERED ON LEDGER</span>
    </div>
  )
  if (step === 2) return (
    <div className="sv">
      <div style={K(0)} className="row between"><span className="hash id">HV-001</span><span className="live"><span className="pulse" /> LIVE</span></div>
      <div className="grid g2" style={{ gap: 10, ...K(1) }}>
        <div className="metric"><div className="lbl">Brood temp</div><b>34.6 <small>°C</small></b></div>
        <div className="metric"><div className="lbl">Weight</div><b>58.3 <small>kg</small></b></div>
      </div>
      <div className="metric" style={K(2)}><div className="lbl">Hive weight · 3 days</div><Spark data={spark} color="var(--ok)" /></div>
      <div className="notice ok" style={K(3)}><Icon n="check_circle" fill />Healthy colony · 73% confident</div>
    </div>
  )
  if (step === 3) return (
    <div className="sv" style={{ justifyItems: 'center', textAlign: 'center' }}>
      <div style={K(0)}><QR batchId="HC-2026-0001" size={150} /></div>
      <div style={K(1)}><b style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem' }}>62 kg · Mustard honey</b><div className="muted small">Hives HV-003 · HV-004</div></div>
      <span className="pill ok" style={K(2)}><Icon n="lock" size="sm" fill /> BATCH SEALED</span>
    </div>
  )
  if (step === 4) return (
    <div className="sv">
      <div style={K(0)} className="row between"><b style={{ fontFamily: 'var(--serif)' }}>NABL Lab · KVIC Jaipur</b><span className="pill ok">PASS</span></div>
      {[['Moisture', '17.8%', 78], ['HMF', '14 mg/kg', 18], ['C4 sugar', '1.1%', 16]].map(([k, v, w], i) => (
        <div key={k} style={K(i + 1)}><div className="row between small"><span>{k}</span><b className="mono">{v}</b></div><div className="bar-in"><i style={{ width: w + '%', animationDelay: 0.3 + i * 0.15 + 's' }} /></div></div>
      ))}
      <span className="pill ok stamp"><Icon n="verified" size="sm" fill /> CERTIFIED</span>
    </div>
  )
  if (step === 5) return (
    <div className="sv">
      {[['hive', 'Harvest logged', 'Sunita Devi'], ['swap_horiz', 'Custody transfer', 'KVIC Processing Unit, Jaipur'], ['inventory_2', 'Packed 124 × 500 g', 'Khadi Gramodyog Bhawan']].map(([ic, h, n], i) => (
        <div key={h} style={K(i)} className="row" ><span className="ic" style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid var(--primary)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}><Icon n={ic} size="sm" /></span><span><b style={{ fontFamily: 'var(--serif)' }}>{h}</b><div className="muted small">{n}</div></span></div>
      ))}
    </div>
  )
  return (
    <div className="sv" style={{ justifyItems: 'center', textAlign: 'center', background: 'var(--hero-ok)', margin: -22, padding: 26, color: '#f4efe0', minHeight: 380, alignContent: 'center' }}>
      <div style={K(0)}><Seal value={100} label="Trust score" /></div>
      <b style={{ ...K(1), fontFamily: 'var(--serif)', fontSize: '1.4rem', color: '#fffaf0' }}>Genuine honey - verified</b>
      <span style={{ ...K(2), color: '#a9d1bb', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>असली शहद - सत्यापित</span>
    </div>
  )
}

function Story() {
  const { t } = useSettings()
  const [active, setActive] = useState(1)
  const refs = useRef([])
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.n)) }), { rootMargin: '-45% 0px -45% 0px' })
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <div className="story">
      <div className="story-sticky"><div className="story-stage" data-step={String(active).padStart(2, '0')}><StoryVisual key={active} step={active} /></div></div>
      <div>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} ref={(el) => (refs.current[n] = el)} data-n={n} className={'story-step' + (active === n ? ' on' : '')}>
            <span className="n">STEP {String(n).padStart(2, '0')}</span>
            <h3><Icon n={STEP_ICON[n - 1]} className="lg" /> {t('step.' + n)}</h3>
            <p className="muted" style={{ fontSize: '1.08rem', maxWidth: '40ch' }}>{t('step.' + n + 'd')}</p>
            <div className="story-inline"><StoryVisual step={n} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const { chain, hives, batches } = useStore()
  const { t, tb, role, set } = useSettings()
  const passed = chain.filter((b) => b.type === T.LAB_CERTIFIED && b.payload.pass).length
  const failed = chain.filter((b) => b.type === T.LAB_CERTIFIED && !b.payload.pass).length
  const kg = chain.filter((b) => b.type === T.HARVEST_LOGGED).reduce((s, b) => s + b.payload.quantityKg, 0)
  const recent = chain.slice(-14).reverse()
  const spot = (e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', e.clientX - r.left + 'px'); e.currentTarget.style.setProperty('--my', e.clientY - r.top + 'px') }

  return (
    <div className="stack lg">
      <section className="masthead">
        <div className="l">
          <span className="kicker">SIH26021 · KVIC Honey Mission · Ministry of MSME</span>
          <h1><Words text={t('home.hero1')} /> <em><Words text={t('home.hero2')} start={3} /></em></h1>
          <p className="muted" style={{ maxWidth: '52ch', fontSize: '1.05rem' }}>{t('home.sub')}</p>
          <span className="bil" style={{ marginBottom: 18 }}>{tb('home.hero1')} {tb('home.hero2')}</span>
          <div className="row">
            <a className="btn lg" href="#/verify/HC-2026-0001"><Icon n="verified" fill /> {t('home.try.good')} <Icon n="arrow_forward" /></a>
            <a className="btn lg secondary" href="#/verify/HC-2026-0003"><Icon n="gpp_bad" /> {t('home.try.bad')}</a>
            <button className="btn tertiary" onClick={() => window.dispatchEvent(new Event('hc-tour'))}><Icon n="slideshow" size="sm" /> {t('home.try.tour')}</button>
          </div>
        </div>
        <div className="r" onPointerMove={spot}>
          <div className="floaters"><HexMark size={90} /><HexMark size={140} /><HexMark size={60} /><HexMark size={110} /></div>
          <HexMark className="wm" size={280} data-par="-0.05" />
          <span className="kicker">{t('home.live')}</span>
          <div className="stat-b"><CountUp to={chain.length} /></div><div className="stat-l">{t('stat.blocks')}</div>
          <div className="stats-row">
            <div><b><CountUp to={hives.length} /></b><span>{t('stat.hives')}</span></div>
            <div><b><CountUp to={batches.length} /></b><span>{t('stat.batches')}</span></div>
            <div><b><CountUp to={kg} /></b><span>{t('stat.kg')}</span></div>
            <div><b><CountUp to={passed} /></b><span>{t('stat.pass')}</span></div>
            <div><b style={{ color: '#ffb3a9' }}><CountUp to={failed} /></b><span>{t('stat.fail')}</span></div>
          </div>
        </div>
      </section>

      <Reveal variant="fade">
        <div className="marquee" aria-label={t('home.chain')}>
          <div className="marquee-track">
            {[...recent, ...recent].map((b, i) => {
              const bad = b.type === T.LAB_CERTIFIED && !b.payload.pass
              return <span key={i} className={'mchip' + (bad ? ' bad' : '')}><i />#{b.index} <b>{b.type.replaceAll('_', ' ')}</b> {shortHash(b.hash, 6)}</span>
            })}
          </div>
        </div>
      </Reveal>

      <section>
        <Reveal><div className="pagehead" style={{ marginBottom: 16 }}>
          <div><span className="kicker">Start here</span><h2>{t('home.iam')}</h2><span className="bil">{tb('home.iam')}</span></div>
          <p className="muted" style={{ margin: 0 }}>{t('home.iam.sub')}</p>
        </div></Reveal>
        <div className="grid g3">
          {Object.keys(ROLE_HOME).map((r, i) => (
            <Reveal key={r} delay={i * 80} variant="scale">
              <a className={'role' + (role === r ? ' on' : '')} href={'#/' + ROLE_HOME[r]} onClick={() => set({ role: r })}>
                <span className="ic"><Icon n={ROLE_ICON[r]} className="lg" /></span>
                <span><b>{t('role.' + r)}</b><span className="d">{t('role.' + r + '.d')}</span></span>
                <Icon n="arrow_forward" className="faint" />
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <section>
        <Reveal><div className="pagehead" style={{ marginBottom: 8 }}>
          <div><span className="kicker">Process</span><h2>{t('story.title')}</h2><span className="bil">{tb('story.title')}</span></div>
          <p className="muted" style={{ margin: 0 }}>{t('story.sub')}</p>
        </div></Reveal>
        <Story />
      </section>
    </div>
  )
}
