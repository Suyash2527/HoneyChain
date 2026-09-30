// Dev tool: drive real headless Edge/Chrome, scroll the app, capture screenshots.
// Usage: node docs/tools/shots.mjs <baseUrl> <outDir> [theme=dark|light] [width=1440] [height=900]
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const [base = 'http://localhost:5173/', out = 'shots', theme = 'dark', W = '1440', H = '900'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--enable-features=ScrollDrivenAnimations'] })
const page = await browser.newPage()
await page.setViewport({ width: +W, height: +H, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.evaluateOnNewDocument((theme) => {
  localStorage.setItem('honeychain.settings.v2', JSON.stringify({ lang: 'en', theme, size: 1, mode: 'simple', role: 'consumer', motion: 'on' }))
}, theme)

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const snap = async (name) => { await page.screenshot({ path: path.join(out, name + '.png') }); console.log('shot', name) }
const scrollTo = async (y) => { await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y)), y); await wait(700) }

await page.goto(base + '#/', { waitUntil: 'networkidle2' })
await wait(2500)
console.log('sda supported:', await page.evaluate(() => CSS.supports('animation-timeline: view()')), '| lenis:', await page.evaluate(() => !!window.__lenis))
for (const y of [0, 450, 1000, 1700, 2500]) { await scrollTo(y); await snap(`home-${y}`) }

await page.goto(base + '#/verify/HC-2026-0001', { waitUntil: 'networkidle2' })
await wait(3800)
await scrollTo(0); await snap('verify-0'); await scrollTo(650); await snap('verify-650'); await scrollTo(1300); await snap('verify-1300')

await page.goto(base + '#/verify/HC-2026-0003', { waitUntil: 'networkidle2' })
await wait(3800); await scrollTo(150); await snap('verify-fail')

await page.goto(base + '#/hives', { waitUntil: 'networkidle2' }); await wait(1800); await snap('hives')
await page.goto(base + '#/ledger', { waitUntil: 'networkidle2' }); await wait(1500); await snap('ledger')
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
