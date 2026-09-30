// Dev tool: measure the receipt print animation (paper position per frame) and grab frames.
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
const [base = 'http://localhost:5173/', out = 'print'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 900 })
const errors = []; page.on('pageerror', (e) => errors.push(String(e)))
await page.evaluateOnNewDocument(() => { localStorage.clear(); localStorage.setItem('honeychain.sound', 'off'); localStorage.setItem('honeychain.settings.v2', JSON.stringify({ lang: 'en', theme: 'light', size: 1, mode: 'simple', role: 'lab', motion: 'on' })) })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
await page.goto(base + '#/ledger', { waitUntil: 'networkidle2' }); await wait(1200)
// record paper top every animation frame for 5.5 s
await page.evaluate(() => { window.__s = []; const t0 = performance.now(); const tick = () => { const p = document.querySelector('.paper'); if (p) window.__s.push([Math.round(performance.now() - t0), Math.round(p.getBoundingClientRect().top), p.className.replace('paper', '').trim()]); if (performance.now() - t0 < 5600) requestAnimationFrame(tick) }; window.__t0 = t0; requestAnimationFrame(tick) })
await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Receipt')).click() })
await wait(1900); await page.screenshot({ path: path.join(out, 'print-mid.png') })
await wait(3900)
const series = await page.evaluate(() => window.__s)
// analyse: moving vs holding intervals
let bursts = 0, holds = 0, state = 'hold', moved = 0
for (let i = 1; i < series.length; i++) {
  const d = series[i][1] - series[i - 1][1]; const now = Math.abs(d) >= 1 ? 'move' : 'hold'
  if (now !== state) { if (now === 'move') bursts++; else holds++; state = now }
  moved += Math.abs(d)
}
const start = series.find((s) => s[2].includes('printing')), end = [...series].reverse().find((s) => s[2].includes('printing'))
console.log('frames recorded:', series.length, '| printing window ms:', start?.[0], '->', end?.[0])
console.log('distinct feed bursts:', bursts, '| pauses between:', holds, '| total paper travel px:', moved)
const samples = series.filter((s) => s[2].includes('printing')).filter((_, i) => i % 9 === 0).map((s) => `${s[0]}ms:${s[1]}`).join('  ')
console.log('paper top over time ->', samples)
console.log('phases seen:', [...new Set(series.map((s) => s[2] || 'idle'))].join(' > '))
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
