import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'

// Motion helpers. Everything here degrades to "instantly visible" when
// <html data-motion="off"> (user setting or OS reduce-motion) or IntersectionObserver is missing.
export const motionOn = () => document.documentElement.dataset.motion !== 'off'

export function useInView({ threshold = 0.12, rootMargin = '0px 0px -8% 0px', once = true } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!motionOn() || !('IntersectionObserver' in window)) { setInView(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); if (once) io.disconnect() } else if (!once) setInView(false)
    }, { threshold, rootMargin })
    io.observe(el)
    // Failsafe: if observers are throttled (background tab, embedded webview) never leave content invisible.
    const failsafe = setTimeout(() => {
      const r = el.getBoundingClientRect()
      if (r.top < innerHeight && r.bottom > 0) setInView(true)
    }, 2500)
    return () => { io.disconnect(); clearTimeout(failsafe) }
  }, [threshold, rootMargin, once])
  return [ref, inView]
}

// Fade + slide in when scrolled into view. variant: up | left | right | scale | fade
export function Reveal({ as: Tag = 'div', variant = 'up', delay = 0, className = '', style, children, ...rest }) {
  const [ref, inView] = useInView()
  return <Tag ref={ref} className={`rv rv-${variant}${inView ? ' in' : ''} ${className}`} style={{ '--d': `${delay}ms`, '--i': Math.round(delay / 70), ...style }} {...rest}>{children}</Tag>
}

export function CountUp({ to, duration = 1100, decimals = 0, className }) {
  const [ref, inView] = useInView({ threshold: 0.3 })
  const [v, setV] = useState(motionOn() ? 0 : to)
  useEffect(() => {
    if (!inView) return
    if (!motionOn()) { setV(to); return }
    let raf, t0
    const step = (t) => {
      t0 ??= t
      const p = Math.min(1, (t - t0) / duration)
      setV(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return <span ref={ref} className={className}>{v.toFixed(decimals)}</span>
}

// Words fly in one after another (headlines).
export function Words({ text, className = '', start = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => <span key={i} className="w" aria-hidden="true" style={{ '--i': i + start }}>{w}&nbsp;</span>)}
    </span>
  )
}

// Top progress bar + light parallax for elements marked data-par="0.1".
export function ScrollProgress() {
  const bar = useRef(null)
  useEffect(() => {
    let raf = 0
    const run = () => {
      raf = 0
      const h = document.documentElement
      const y = h.scrollTop
      if (bar.current) bar.current.style.transform = `scaleX(${y / Math.max(1, h.scrollHeight - h.clientHeight)})`
      document.body.classList.toggle('scrolled', y > 8)
      if (motionOn()) document.querySelectorAll('[data-par]').forEach((el) => { el.style.transform = `translate3d(0, ${(y * parseFloat(el.dataset.par)).toFixed(1)}px, 0)` })
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [])
  return <div className="progress" ref={bar} aria-hidden="true" />
}

// Material-style press ripple on buttons and chips.
export function useRipple() {
  useEffect(() => {
    const on = (e) => {
      if (!motionOn()) return
      const el = e.target.closest?.('.btn, .chip, .role, .hivecard, .pick button')
      if (!el || el.disabled) return
      const r = el.getBoundingClientRect()
      const s = document.createElement('span')
      const d = Math.max(r.width, r.height) * 1.6
      s.className = 'ripple'
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`
      el.appendChild(s)
      setTimeout(() => s.remove(), 650)
    }
    document.addEventListener('pointerdown', on)
    return () => document.removeEventListener('pointerdown', on)
  }, [])
}

// Inertia (smooth) wheel scrolling. Off when animations are off / reduced motion.
export function useSmoothScroll(motionSetting) {
  useEffect(() => {
    if (!motionOn()) return
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true, syncTouch: false })
    window.__lenis = lenis
    let raf = 0
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy(); delete window.__lenis }
  }, [motionSetting])
}
