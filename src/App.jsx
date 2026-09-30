import { useEffect, useState } from 'react'
import { useStore } from './lib/store.jsx'
import { useSettings, ROLE_HOME } from './lib/settings.jsx'
import { LANGS } from './lib/i18n'
import { Icon } from './lib/ui.jsx'
import Home from './pages/Home.jsx'
import Beekeeper from './pages/Beekeeper.jsx'
import Lab from './pages/Lab.jsx'
import Supply from './pages/Supply.jsx'
import SmartHive from './pages/SmartHive.jsx'
import Verify from './pages/Verify.jsx'
import Explorer from './pages/Explorer.jsx'
import Deploy from './pages/Deploy.jsx'
import Tour from './Tour.jsx'

// [path, i18n key, icon, group, roles that see it as suggested, page]
export const ROUTES = [
  ['', 'nav.home', 'home', null, [], Home],
  ['verify', 'nav.verify', 'verified_user', 'group.buyers', ['consumer'], Verify],
  ['hives', 'nav.hives', 'hive', 'group.beekeepers', ['beekeeper'], SmartHive],
  ['harvest', 'nav.harvest', 'water_drop', 'group.beekeepers', ['beekeeper'], Beekeeper],
  ['lab', 'nav.lab', 'biotech', 'group.partners', ['lab'], Lab],
  ['supply', 'nav.supply', 'local_shipping', 'group.partners', ['processor'], Supply],
  ['ledger', 'nav.ledger', 'account_tree', 'group.authority', ['officer'], Explorer],
  ['rollout', 'nav.rollout', 'map', 'group.authority', ['officer'], Deploy],
]

function useHashRoute() {
  const parse = () => {
    const [path, ...rest] = (location.hash.replace(/^#\/?/, '') || '').split('/')
    return { path, arg: decodeURIComponent(rest.join('/')) }
  }
  const [r, setR] = useState(parse)
  useEffect(() => {
    const on = () => { setR(parse()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return r
}

export const Emblem = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <polygon points="24,2 44,14 44,34 24,46 4,34 4,14" fill="var(--paper)" stroke="var(--primary)" strokeWidth="2.5" />
    <polygon points="24,7 39,16 39,32 24,41 9,32 9,16" fill="none" stroke="#E9A23B" strokeWidth="1.5" strokeDasharray="3 2" />
    <circle cx="24" cy="24" r="5" fill="var(--primary)" />
    <path d="M19 24 C19 19, 29 19, 29 24 C29 29, 19 29, 19 24 Z" fill="none" stroke="var(--primary)" strokeWidth="1.5" />
    <path d="M14 19 L19 22 M29 22 L34 19" stroke="#E9A23B" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="14" r="2" fill="#E9A23B" />
  </svg>
)

function SettingsDrawer() {
  const s = useSettings()
  const { t, set } = s
  const { reset } = useStore()
  if (!s.open) return null
  const Seg = ({ value, options, onPick }) => (
    <div className="seg" role="group">{options.map(([v, label]) => <button key={v} className={value === v ? 'on' : ''} aria-pressed={value === v} onClick={() => onPick(v)}>{label}</button>)}</div>
  )
  return (
    <>
      <div className="scrim" style={{ zIndex: 75 }} onClick={() => s.setOpen(false)} />
      <aside className="drawer" role="dialog" aria-label={t('set.title')}>
        <div className="row between"><h2>{t('set.title')}</h2><button className="iconbtn" onClick={() => s.setOpen(false)} aria-label={t('common.close')}><Icon n="close" /></button></div>
        <div className="stack sm"><b>{t('set.lang')}</b><Seg value={s.lang} options={LANGS} onPick={(v) => set({ lang: v })} /></div>
        <div className="stack sm"><b>{t('set.theme')}</b><Seg value={s.theme} options={[['auto', t('set.auto')], ['light', t('set.light')], ['dark', t('set.dark')]]} onPick={(v) => set({ theme: v })} /></div>
        <div className="stack sm"><b>{t('set.size')}</b><Seg value={s.size} options={[[0, 'A'], [1, 'A+'], [2, 'A++']]} onPick={(v) => set({ size: v })} /></div>
        <div className="stack sm"><b>{t('set.mode')}</b><Seg value={s.mode} options={[['simple', t('set.simple')], ['expert', t('set.expert')]]} onPick={(v) => set({ mode: v })} /><span className="muted small">{t('set.expert.d')}</span></div>
        <div className="stack sm"><b>{t('set.role')}</b>
          <div className="row">{Object.keys(ROLE_HOME).map((r) => <button key={r} className={'chip' + (s.role === r ? ' on' : '')} onClick={() => set({ role: r })}>{t('role.' + r)}</button>)}</div></div>
        <div className="row"><button className="btn secondary sm" onClick={reset}><Icon n="restart_alt" size="sm" /> {t('set.reset')}</button><button className="btn" onClick={() => s.setOpen(false)}>{t('set.done')}</button></div>
      </aside>
    </>
  )
}

export default function App() {
  const { path, arg } = useHashRoute()
  const { ready, integrity, chain } = useStore()
  const s = useSettings()
  const { t } = s
  const [menu, setMenu] = useState(false)
  const [tour, setTour] = useState(false)
  const [q, setQ] = useState('')
  const route = ROUTES.find((r) => r[0] === path) || ROUTES[0]
  const Page = route[5]
  useEffect(() => setMenu(false), [path])
  useEffect(() => { const on = () => setTour(true); window.addEventListener('hc-tour', on); return () => window.removeEventListener('hc-tour', on) }, [])

  const groups = []
  ROUTES.forEach((r) => { const g = r[3]; const last = groups[groups.length - 1]; if (!last || last.g !== g) groups.push({ g, items: [r] }); else last.items.push(r) })
  const tabs = ROUTES.slice(0, 4)
  const go = (e) => { e.preventDefault(); if (q.trim()) { const m = q.match(/HC-\d{4}-\d{4}/i); location.hash = '#/verify/' + (m ? m[0].toUpperCase() : q.trim()); setQ('') } }

  return (
    <div className="app">
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}
      <aside className={'rail' + (menu ? ' open' : '')}>
        <a className="brand" href="#/"><Emblem /><span><b>Honey Chain</b><small>KVIC Honey Mission</small></span></a>
        {groups.map(({ g, items }, i) => (
          <div key={i}>
            {g && <div className="navlabel">{t(g)}</div>}
            {items.map(([p, key, ico, , roles]) => (
              <a key={p} href={'#/' + p} className={'navitem' + (p === route[0] ? ' active' : '')} aria-current={p === route[0] ? 'page' : undefined}>
                <Icon n={ico} fill={p === route[0]} />{t(key)}{roles.includes(s.role) && p !== route[0] && <span className="dot" title="Suggested for your role" />}
              </a>
            ))}
          </div>
        ))}
        <div className="rail-foot">SIH26021 · Ministry of MSME problem statement.<br />Hackathon prototype - not an official KVIC service.</div>
      </aside>

      <div className="main">
        <header className="top">
          <button className="iconbtn menu-btn" onClick={() => setMenu(true)} aria-label="Menu"><Icon n="menu" /></button>
          <form className="search" onSubmit={go} role="search">
            <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('top.search')} aria-label={t('top.search')} />
            <button className="btn" aria-label={t('v.go')}><Icon n="search" /></button>
          </form>
          <span className="spacer" />
          <span className={'ledger-pill' + (integrity.valid ? '' : ' bad')} title="Live integrity check of every block hash"><span className="pulse" /><span className="t">{integrity.valid ? `${t('chain.ok')} · ${chain.length}` : `${t('chain.bad')} #${integrity.firstBadIndex}`}</span></span>
          <button className="iconbtn" onClick={() => setTour(true)} title={t('top.tour')} aria-label={t('top.tour')}><Icon n="slideshow" /></button>
          <button className="iconbtn" onClick={() => s.setOpen(true)} title={t('top.settings')} aria-label={t('top.settings')}><Icon n="tune" /></button>
        </header>
        <main className="page">{ready ? <Page arg={arg} /> : <p className="muted">Loading ledger…</p>}</main>
      </div>

      <nav className="tabbar" aria-label="Primary">
        {tabs.map(([p, key, ico]) => <a key={p} href={'#/' + p} className={p === route[0] ? 'active' : ''}><Icon n={ico} fill={p === route[0]} />{t(key)}</a>)}
        <button onClick={() => setMenu(true)}><Icon n="menu" />{t('nav.more')}</button>
      </nav>

      <SettingsDrawer />
      {tour && <Tour onClose={() => setTour(false)} />}
    </div>
  )
}
