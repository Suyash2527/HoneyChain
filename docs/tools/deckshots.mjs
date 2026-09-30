// Dev tool: capture clean, static screenshots of the app for the pitch deck.
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const [base = 'http://localhost:5173/', out = 'deckshots'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function open(w, h, scale, theme = 'dark') {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: h, deviceScaleFactor: scale })
  await page.evaluateOnNewDocument((theme) => localStorage.setItem('honeychain.settings.v2', JSON.stringify({ lang: 'en', theme, size: 1, mode: 'simple', role: 'consumer', motion: 'off' })), theme)
  return page
}
const shot = async (page, name, clip) => { await page.screenshot({ path: path.join(out, name + '.png'), ...(clip ? { clip } : {}) }); console.log('shot', name) }

// Phone shots (390x844 @2x)
let p = await open(390, 844, 2)
await p.goto(base + '#/verify/HC-2026-0001', { waitUntil: 'networkidle2' }); await wait(1800)
await p.evaluate(() => window.scrollTo(0, 190)); await wait(500); await shot(p, 'phone-genuine')
await p.evaluate(() => { const el = [...document.querySelectorAll('h3')].find((h) => h.textContent.includes('Lab purity')); el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70) }); await wait(600); await shot(p, 'phone-lab')
await p.goto(base + '#/verify/HC-2026-0003', { waitUntil: 'networkidle2' }); await wait(1800)
await p.evaluate(() => window.scrollTo(0, 190)); await wait(500); await shot(p, 'phone-fake')
await p.close()

// Desktop shots (1440x900 @1.5x)
p = await open(1440, 900, 1.5)
await p.goto(base + '#/', { waitUntil: 'networkidle2' }); await wait(1800); await shot(p, 'desk-home')
await p.goto(base + '#/hives', { waitUntil: 'networkidle2' }); await wait(1500); await shot(p, 'desk-hives')
await p.evaluate(() => { [...document.querySelectorAll('.hivecard')].find((c) => c.textContent.includes('HV-004')).click() }); await wait(1800); await shot(p, 'desk-hive-detail')
await p.goto(base + '#/lab', { waitUntil: 'networkidle2' }); await wait(1500)
await p.evaluate(() => { [...document.querySelectorAll('.chip')].find((c) => c.textContent.includes('fails NMR')).click() }); await wait(700); await shot(p, 'desk-lab-nmr')
await p.goto(base + '#/ledger', { waitUntil: 'networkidle2' }); await wait(1500)
await p.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Forge')).click() }); await wait(1600); await shot(p, 'desk-ledger-tamper')
await p.close()
await browser.close()
