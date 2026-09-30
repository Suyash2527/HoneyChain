import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { translate } from './i18n'

const mq = () => window.matchMedia('(prefers-color-scheme: dark)')

export const ROLE_HOME = { consumer: 'verify', beekeeper: 'hives', lab: 'lab', processor: 'supply', officer: 'ledger' }
const KEY = 'honeychain.settings.v2'
const DEFAULTS = { lang: 'en', theme: 'auto', size: 1, mode: 'simple', role: 'consumer', motion: 'auto' }
const Ctx = createContext(null)
export const useSettings = () => useContext(Ctx)

export function SettingsProvider({ children }) {
  const [s, setS] = useState(() => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return DEFAULTS }
  })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
    const root = document.documentElement
    const apply = () => { root.dataset.theme = s.theme; root.dataset.scheme = s.theme === 'auto' ? (mq().matches ? 'dark' : 'light') : s.theme }
    const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const applyMotion = () => { root.dataset.motion = s.motion === 'auto' ? (reduce() ? 'off' : 'on') : s.motion }
    apply(); applyMotion()
    const m = mq(); m.addEventListener('change', apply)
    root.lang = s.lang
    root.style.fontSize = [15, 16.5, 19][s.size] + 'px'
    return () => m.removeEventListener('change', apply)
  }, [s])

  const set = useCallback((patch) => setS((p) => ({ ...p, ...patch })), [])
  const t = useCallback((key) => translate(s.lang, key), [s.lang])
  const tb = useCallback((key) => translate(s.lang === 'en' ? 'hi' : 'en', key), [s.lang]) // the other language, for bilingual labels
  const value = useMemo(() => ({ ...s, set, t, tb, open, setOpen, expert: s.mode === 'expert' }), [s, set, t, tb, open])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
