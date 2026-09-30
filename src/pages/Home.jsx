import { useStore } from '../lib/store.jsx'
import { useSettings, ROLE_HOME } from '../lib/settings.jsx'
import { BLOCK_TYPES as T } from '../lib/chain'
import { HexMark, Icon } from '../lib/ui.jsx'

const ROLE_ICON = { consumer: 'shopping_basket', beekeeper: 'hive', lab: 'biotech', processor: 'inventory_2', officer: 'account_balance' }

export default function Home() {
  const { chain, hives, batches } = useStore()
  const { t, tb, role, set } = useSettings()
  const passed = chain.filter((b) => b.type === T.LAB_CERTIFIED && b.payload.pass).length
  const failed = chain.filter((b) => b.type === T.LAB_CERTIFIED && !b.payload.pass).length
  const kg = chain.filter((b) => b.type === T.HARVEST_LOGGED).reduce((s, b) => s + b.payload.quantityKg, 0)

  return (
    <div className="stack lg">
      <section className="masthead rise">
        <div className="l">
          <span className="kicker">SIH26021 · KVIC Honey Mission · Ministry of MSME</span>
          <h1>{t('home.hero1')} <em>{t('home.hero2')}</em></h1>
          <p className="muted" style={{ maxWidth: '52ch', fontSize: '1.05rem' }}>{t('home.sub')}</p>
          <span className="bil" style={{ marginBottom: 18 }}>{tb('home.hero1')} {tb('home.hero2')}</span>
          <div className="row">
            <a className="btn lg" href="#/verify/HC-2026-0001"><Icon n="verified" fill /> {t('home.try.good')}</a>
            <a className="btn lg secondary" href="#/verify/HC-2026-0003"><Icon n="gpp_bad" /> {t('home.try.bad')}</a>
            <button className="btn tertiary" onClick={() => window.dispatchEvent(new Event('hc-tour'))}><Icon n="slideshow" size="sm" /> {t('home.try.tour')}</button>
          </div>
        </div>
        <div className="r">
          <HexMark className="wm" size={280} />
          <span className="kicker">{t('home.live')}</span>
          <div className="stat-b">{chain.length}</div><div className="stat-l">{t('stat.blocks')}</div>
          <div className="stats-row">
            <div><b>{hives.length}</b><span>{t('stat.hives')}</span></div>
            <div><b>{batches.length}</b><span>{t('stat.batches')}</span></div>
            <div><b>{kg}</b><span>{t('stat.kg')}</span></div>
            <div><b>{passed}</b><span>{t('stat.pass')}</span></div>
            <div><b style={{ color: '#ffb3a9' }}>{failed}</b><span>{t('stat.fail')}</span></div>
          </div>
        </div>
      </section>

      <section>
        <div className="pagehead" style={{ marginBottom: 16 }}>
          <div><span className="kicker">Start here</span><h2>{t('home.iam')}</h2><span className="bil">{tb('home.iam')}</span></div>
          <p className="muted" style={{ margin: 0 }}>{t('home.iam.sub')}</p>
        </div>
        <div className="grid g3">
          {Object.keys(ROLE_HOME).map((r) => (
            <a key={r} className={'role' + (role === r ? ' on' : '')} href={'#/' + ROLE_HOME[r]} onClick={() => set({ role: r })}>
              <span className="ic"><Icon n={ROLE_ICON[r]} className="lg" /></span>
              <span><b>{t('role.' + r)}</b><span className="d">{t('role.' + r + '.d')}</span></span>
              <Icon n="arrow_forward" className="faint" />
            </a>
          ))}
        </div>
      </section>

      <section>
        <div className="pagehead" style={{ marginBottom: 16 }}>
          <div><span className="kicker">Process</span><h2>{t('home.how')}</h2><span className="bil">{tb('home.how')}</span></div>
          <p className="muted" style={{ margin: 0 }}>{t('home.how.sub')}</p>
        </div>
        <div className="steps">
          {[1, 2, 3, 4, 5, 6].map((n) => <div key={n}><div className="n">{n}</div><b>{t('step.' + n)}</b><span className="muted small">{t('step.' + n + 'd')}</span></div>)}
        </div>
      </section>
    </div>
  )
}
