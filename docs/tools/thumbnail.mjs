// Dev tool: render the YouTube thumbnail (1280x720) from a real receipt captured in the live app.
// Usage: node docs/tools/thumbnail.mjs [appUrl] [out.png]
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const app = process.argv[2] || 'https://honey-chain-rust.vercel.app/'
const out = process.argv[3] || 'docs/demo/thumbnail.png'
const tmp = path.resolve('docs/demo/.thumb-receipt.png')
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// 1) a real lab-FAIL receipt with its REJECTED stamp, captured at 2x for a crisp image
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 1400, deviceScaleFactor: 2 })
await page.evaluateOnNewDocument(() => {
  localStorage.clear(); localStorage.setItem('honeychain.sound', 'off')
  // motion off: the receipt appears fully printed and already stamped
  localStorage.setItem('honeychain.settings.v2', JSON.stringify({ lang: 'en', theme: 'dark', size: 1, mode: 'simple', role: 'lab', motion: 'off' }))
})
await page.goto(app + '#/lab', { waitUntil: 'networkidle2' })
await page.evaluate(() => document.fonts.ready)
// a seeded batch that is still waiting for its lab test (fresh ledger), else the first one listed
const batch = await page.evaluate(() => { const o = [...document.querySelector('select.input').options].map((x) => x.value).filter(Boolean); return o.find((v) => v.endsWith('0004')) || o[0] })
await page.select('select.input', batch); await sleep(300)
await page.evaluate(() => [...document.querySelectorAll('.chip')].find((e) => e.textContent.includes('fails NMR')).click()); await sleep(300)
await page.click('form button.btn.lg')
const paper = await page.waitForSelector('.rc-scrim .paper', { timeout: 15000 })
await sleep(1200) // QR code + stamp render
await page.evaluate(() => { const f = document.querySelector('.feed'); f.style.maxHeight = 'none'; f.style.overflow = 'visible' })
await paper.screenshot({ path: tmp, omitBackground: true })

// 2) compose the thumbnail
const receipt = 'data:image/png;base64,' + fs.readFileSync(tmp).toString('base64')
const thumb = await browser.newPage()
await thumb.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 })
await thumb.setContent(`<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Inter:wght@800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:1280px;height:720px;overflow:hidden;background:#050403;font-family:Inter,system-ui,sans-serif;position:relative}
  .glow{position:absolute;inset:0;background:radial-gradient(700px 520px at 78% 40%,rgba(214,177,94,.32),transparent 65%),radial-gradient(600px 400px at 0% 100%,rgba(169,40,34,.28),transparent 70%)}
  .hex{position:absolute;inset:0;opacity:.09;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='97'><path d='M28 0 56 16v32L28 64 0 48V16zM28 64v33' fill='none' stroke='%23d6b15e' stroke-width='2'/></svg>")}
  .left{position:absolute;left:64px;top:62px;width:690px}
  .kicker{display:inline-block;font:700 22px 'JetBrains Mono',monospace;letter-spacing:.14em;color:#050403;background:#d6b15e;padding:8px 16px;border-radius:8px}
  h1{margin-top:26px;font-weight:900;font-size:118px;line-height:.92;letter-spacing:-.035em;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.6)}
  h1 .gold{display:block;background:linear-gradient(100deg,#ffe7a3,#e2b552 50%,#b07f2c);-webkit-background-clip:text;background-clip:text;color:transparent}
  .sub{margin-top:26px;font:800 30px Inter,sans-serif;color:#e9dfc8}
  .sub b{color:#e2b552}
  .brand{position:absolute;left:64px;bottom:50px;display:flex;align-items:center;gap:16px}
  .brand span{font:700 48px 'Cormorant Garamond',Georgia,serif;color:#f5eedf}
  .rc{position:absolute;right:58px;top:-30px;width:400px;height:760px;overflow:hidden;transform:rotate(6deg);border-radius:4px;
      filter:drop-shadow(0 30px 40px rgba(0,0,0,.75)) drop-shadow(0 0 60px rgba(214,177,94,.25));
      -webkit-mask-image:linear-gradient(180deg,#000 82%,transparent)}
  .rc img{width:100%;display:block}
</style></head><body>
  <div class="glow"></div><div class="hex"></div>
  <div class="rc"><img src="${receipt}"></div>
  <div class="left">
    <span class="kicker">SIH 2026 · SIH26021</span>
    <h1>FAKE HONEY?<span class="gold">CAUGHT.</span></h1>
    <p class="sub">Blockchain + AI prove every jar &nbsp;·&nbsp; <b>hive to shelf</b></p>
  </div>
  <div class="brand">
    <svg width="64" height="64" viewBox="0 0 48 48"><polygon points="24,2 44,14 44,34 24,46 4,34 4,14" fill="#0c0b09" stroke="#d6b15e" stroke-width="2.5"/><polygon points="24,7 39,16 39,32 24,41 9,32 9,16" fill="none" stroke="#e2b552" stroke-width="1.5" stroke-dasharray="3 2"/><circle cx="24" cy="24" r="5" fill="#d6b15e"/></svg>
    <span>Honey Chain</span>
  </div>
</body></html>`, { waitUntil: 'networkidle0' })
await thumb.evaluate(() => document.fonts.ready)
await thumb.screenshot({ path: out })
await thumb.screenshot({ path: out.replace(/\.png$/, '.jpg'), type: 'jpeg', quality: 92 })
await browser.close()
fs.rmSync(tmp, { force: true })
console.log('saved', out, '(' + (fs.statSync(out).size / 1e6).toFixed(2) + ' MB) and .jpg (' + (fs.statSync(out.replace(/\.png$/, '.jpg')).size / 1e6).toFixed(2) + ' MB)')
