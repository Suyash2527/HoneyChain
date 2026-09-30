// Dev tool: capture the receipt tear-off sequence frame by frame.
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
const [base = 'http://localhost:5173/', out = 'tear'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage(); await page.setViewport({ width: 900, height: 900 })
const errors = []; page.on('pageerror', (e) => errors.push(String(e)))
await page.evaluateOnNewDocument(() => { localStorage.clear(); localStorage.setItem('honeychain.sound', 'off'); localStorage.setItem('honeychain.settings.v2', JSON.stringify({ lang: 'en', theme: 'light', size: 1, mode: 'simple', role: 'lab', motion: 'on' })) })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
await page.goto(base + '#/ledger', { waitUntil: 'networkidle2' }); await wait(1200)
await page.evaluate(() => { [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Receipt')).click() })
await wait(3400) // printing finished
console.log('done printing; paper class =', await page.evaluate(() => document.querySelector('.paper').className))
await page.evaluate(() => [...document.querySelectorAll('.rc-actions button')].pop().click())
const t0 = Date.now()
for (const ms of [200, 380, 560, 700, 950, 1300, 1700]) {
  await wait(Math.max(0, ms - (Date.now() - t0)))
  const info = await page.evaluate(() => { const p = document.querySelector('.paper'); return p ? `${p.className.replace('paper', '').trim() || 'intact'} top=${Math.round(p.getBoundingClientRect().top)} stub=${!!document.querySelector('.stub')}` : 'gone' })
  await page.screenshot({ path: path.join(out, `tear-${ms}.png`) }); console.log(String(ms).padStart(5), 'ms', info)
}
await wait(1600)
console.log('closed:', await page.evaluate(() => !document.querySelector('.rc-scrim')), '| errors:', errors.length ? errors : 'none')
await browser.close()
