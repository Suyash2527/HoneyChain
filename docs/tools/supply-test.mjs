// Dev tool: end-to-end check of the Supply Chain form (typing, validation, receipts) + all seeded verdicts.
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const base = process.argv[2] || 'http://localhost:5173/'
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1300, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e))); page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.evaluateOnNewDocument(() => { localStorage.clear(); localStorage.setItem('honeychain.sound', 'off'); localStorage.setItem('honeychain.settings.v2', JSON.stringify({ lang: 'en', theme: 'dark', size: 1, mode: 'simple', role: 'processor', motion: 'off' })) })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const ok = (name, cond, extra = '') => console.log((cond ? 'PASS' : 'FAIL') + '  ' + name + (extra ? '  -> ' + extra : ''))

// 1. verdicts for every seeded batch
await page.goto(base + '#/', { waitUntil: 'networkidle2' }); await wait(1200)
const chainInfo = await page.evaluate(() => document.querySelector('.ledger-pill').innerText)
console.log('ledger:', chainInfo.replace(/\s+/g, ' '))
for (let n = 1; n <= 10; n++) {
  const id = 'HC-2026-' + String(n).padStart(4, '0')
  await page.goto(base + '#/verify/' + id, { waitUntil: 'networkidle2' }); await wait(500)
  const v = await page.evaluate(() => [document.querySelector('.hero-v h2')?.innerText, document.querySelector('.seal .c b')?.innerText])
  console.log(' ', id, '->', v.join(' | '))
}

// 2. supply chain typing
await page.goto(base + '#/supply', { waitUntil: 'networkidle2' }); await wait(800)
await page.select('select.input', 'HC-2026-0002'); await wait(300)
const from = await page.$eval('input[list="parties"]', (e) => e.value)
ok('"From" auto-fills with current holder', from === 'Nagpur Distributor Co-op', from)
const inputs = await page.$$('input[list="parties"]')
const target = 'KVIC Processing Unit - Nagpur'
await inputs[1].click(); await page.keyboard.type(target, { delay: 12 })
const typed = await page.$eval('form input[placeholder="Type or pick…"]', (e) => e.value)
ok('typing keeps focus for a full sentence (was losing focus per keystroke)', typed === target, typed)
await page.keyboard.press('Tab'); await page.keyboard.type('Filtered and bottled', { delay: 8 })
await page.evaluate(() => document.querySelector('form.card button.btn').click()); await wait(700)
ok('receipt printed for custody transfer', await page.evaluate(() => !!document.querySelector('.rc-scrim .paper')))
await page.evaluate(() => [...document.querySelectorAll('.rc-actions button')].pop().click()); await wait(300)
ok('transfer appears in the activity table', await page.evaluate(() => document.querySelector('table.ledger').innerText.includes('KVIC Processing Unit - Nagpur')))

// 3. rejected batch is blocked
await page.select('select.input', 'HC-2026-0007'); await wait(400)
ok('rejected batch (0007: passes C4/HMF, fails NMR) blocks actions', await page.evaluate(() => !!document.querySelector('.notice.critical') && [...document.querySelectorAll('form.card button.btn')].every((b) => b.disabled)))

// 4. packing more than harvested is refused
await page.select('select.input', 'HC-2026-0008'); await wait(400)
const info = await page.evaluate(() => document.querySelector('.card.panel').innerText.replace(/\s+/g, ' '))
console.log('   batch 0008 panel:', info.slice(0, 140))
const nums = await page.$$('form.card input[type="number"]')
await nums[0].click({ clickCount: 3 }); await nums[0].type('100')
await page.type('form.card:last-of-type input[list="parties"]', 'Organic retail store')
await page.evaluate(() => [...document.querySelectorAll('form.card')].pop().querySelector('button.btn').click()); await wait(600)
ok('over-packing refused (no receipt, error toast)', await page.evaluate(() => !document.querySelector('.rc-scrim') && /left to pack/.test(document.querySelector('.toast')?.innerText || '')))
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
