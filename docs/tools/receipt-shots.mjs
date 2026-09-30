// Dev tool: trigger a receipt in a real browser and capture the print animation frames.
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
const [base = 'http://localhost:5173/', out = 'rc'] = process.argv.slice(2)
fs.mkdirSync(out, { recursive: true })
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 900, height: 900, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.evaluateOnNewDocument(() => { localStorage.setItem('honeychain.sound', 'off'); localStorage.setItem('honeychain.settings.v2', JSON.stringify({ lang: 'en', theme: 'dark', size: 1, mode: 'simple', role: 'lab', motion: 'on' })) })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const snap = async (n) => { await page.screenshot({ path: path.join(out, n + '.png') }); console.log('shot', n) }

await page.goto(base + '#/lab', { waitUntil: 'networkidle2' }); await wait(1500)
await page.select('select.input', 'HC-2026-0004')
await page.evaluate(() => document.querySelector('form button.btn.lg').click())
const t0 = Date.now()
for (const [ms, name] of [[350, 'rc-1-start'], [1000, 'rc-2-feeding'], [1800, 'rc-3-feeding'], [3400, 'rc-4-done']]) {
  await wait(Math.max(0, ms - (Date.now() - t0))); await snap(name)
  const y = await page.evaluate(() => { const p = document.querySelector('.paper'); return p ? Math.round(p.getBoundingClientRect().top) : null })
  console.log('   paper top y =', y)
}
console.log('has barcode/qr:', await page.evaluate(() => !!document.querySelector('.rc-barcode') && !!document.querySelector('.rc-qr')))
await page.evaluate(() => [...document.querySelectorAll('.rc-actions button')].pop().click()); await wait(250); await snap('rc-5-tearing'); await wait(900)
console.log('closed:', await page.evaluate(() => !document.querySelector('.rc-scrim')))
// harvest flow
await page.goto(base + '#/harvest', { waitUntil: 'networkidle2' }); await wait(1200)
await page.evaluate(() => { document.querySelectorAll('.pick button')[0].click() }); await wait(200)
await page.evaluate(() => [...document.querySelectorAll('.btn')].find((b) => b.textContent.includes('Next')).click()); await wait(300)
await page.type('form.form input[type=number]', '55'); await page.type('form.form .grid input:not([type=number])', 'Mustard')
await page.evaluate(() => document.querySelector('form.form button.btn.lg').click()); await wait(3300); await snap('rc-6-harvest')
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
