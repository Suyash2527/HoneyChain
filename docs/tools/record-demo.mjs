// Dev tool: record a smooth, lag-free ~3 minute captioned walkthrough (1080p60 MP4) of the real app.
// Usage: node docs/tools/record-demo.mjs [baseUrl] [out.mp4]
//   env SLOW=4      page runs this many times slower while recording (more captured frames = smoother video)
//   env FPS=60      output frame rate
//   env THEME=dark  app theme (dark | light)
//   env TEMPO=0.76  scales pauses/captions to hit the target length (receipt print/tear keep real timing)
//
// How it stays smooth: the page's clock (setTimeout/setInterval, requestAnimationFrame, performance.now, Date.now)
// and every CSS/Web animation are slowed SLOW times. Chrome's screencast frames are then placed on a constant
// FPS grid using Chrome's own frame timestamps divided by SLOW, so the video plays back at normal speed
// with several times more real frames than Chrome could deliver live.
import puppeteer from 'puppeteer-core'
import ffmpegPath from 'ffmpeg-static'
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'

const base = process.argv[2] || 'http://localhost:4173/'
const out = process.argv[3] || 'docs/demo/HoneyChain-demo-3min.mp4'
const SLOW = Number(process.env.SLOW || 4)
const FPS = Number(process.env.FPS || 60)
const THEME = process.env.THEME || 'dark'
const TEMPO = Number(process.env.TEMPO || 0.76)
fs.mkdirSync(path.dirname(out), { recursive: true })

const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p))
const browser = await puppeteer.launch({
  executablePath: exe, headless: 'new',
  args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--hide-scrollbars', '--window-size=1920,1080'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.evaluateOnNewDocument((theme) => {
  localStorage.clear(); localStorage.setItem('honeychain.sound', 'off')
  localStorage.setItem('honeychain.settings.v2', JSON.stringify({ lang: 'en', theme, size: 1, mode: 'simple', role: 'consumer', motion: 'on' }))
}, THEME)
// Slow the page's JS clock. Timestamps stay continuous; only the rate changes.
await page.evaluateOnNewDocument((S) => {
  const rPerf = performance.now.bind(performance), rDate = Date.now, p0 = rPerf(), d0 = rDate()
  performance.now = () => p0 + (rPerf() - p0) / S
  Date.now = () => d0 + (rDate() - d0) / S
  const rST = window.setTimeout, rSI = window.setInterval, rRAF = window.requestAnimationFrame.bind(window)
  window.setTimeout = (f, ms = 0, ...a) => rST(f, ms * S, ...a)
  window.setInterval = (f, ms = 0, ...a) => rSI(f, ms * S, ...a)
  window.requestAnimationFrame = (cb) => rRAF((t) => cb(p0 + (t - p0) / S))
}, SLOW)

// Every wait below is written in *video* ms and stretched by SLOW in real time.
// wait() is also scaled by TEMPO; hold() is not (for the app's own fixed-length animations).
const wait = (ms) => new Promise((r) => setTimeout(r, ms * SLOW * TEMPO))
const hold = (ms) => new Promise((r) => setTimeout(r, ms * SLOW))

// ---- overlays: caption bar, cursor, title/end cards ----
const installOverlays = () => page.evaluate(() => {
  if (document.getElementById('vo-cap')) return
  const st = document.createElement('style')
  st.textContent = `
  #vo-cap{position:fixed;left:50%;bottom:44px;transform:translateX(-50%) translateY(18px);max-width:1480px;z-index:99999;background:rgba(8,7,5,.9);backdrop-filter:blur(8px);color:#f5eedf;border-left:4px solid #d6b15e;border-radius:12px;padding:16px 30px;font:600 30px/1.35 'Source Serif 4',Georgia,serif;opacity:0;transition:opacity .45s ease,transform .45s ease;pointer-events:none;box-shadow:0 18px 50px rgba(0,0,0,.45)}
  #vo-cap.on{opacity:1;transform:translateX(-50%) translateY(0)}
  #vo-cap.side{left:56px;bottom:auto;top:50%;max-width:560px;transform:translateY(-40%)}
  #vo-cap.side.on{transform:translateY(-50%)}
  #vo-cur{position:fixed;z-index:100000;width:28px;height:28px;border-radius:50%;background:rgba(214,177,94,.55);border:3px solid #e2bd66;box-shadow:0 0 18px rgba(214,177,94,.6);pointer-events:none;transform:translate(-50%,-50%);transition:transform .12s ease;left:-60px;top:-60px}
  #vo-cur.down{transform:translate(-50%,-50%) scale(.68)}
  #vo-card{position:fixed;inset:0;z-index:100001;display:grid;place-content:center;text-align:center;gap:14px;background:radial-gradient(900px 520px at 70% 0%,rgba(214,177,94,.2),transparent 60%),#000;color:#f5eedf;opacity:0;pointer-events:none;transition:opacity .8s ease}
  #vo-card.on{opacity:1}
  #vo-card h1{font:700 128px 'Cormorant Garamond',Georgia,serif;margin:0;background:linear-gradient(110deg,#f3dc9b,#d6b15e 55%,#a8823a);-webkit-background-clip:text;background-clip:text;color:transparent}
  #vo-card p{font:500 36px 'Source Serif 4',Georgia,serif;margin:0;color:#bdb39d}
  #vo-card small{font:500 20px 'JetBrains Mono',monospace;letter-spacing:.16em;color:#d6b15e;text-transform:uppercase}`
  document.head.appendChild(st)
  for (const id of ['vo-cap', 'vo-cur', 'vo-card']) { const d = document.createElement('div'); d.id = id; document.body.appendChild(d) }
  const cur = document.getElementById('vo-cur'), capEl = document.getElementById('vo-cap')
  setInterval(() => capEl.classList.toggle('side', !!document.querySelector('.rc-scrim')), 100) // keep captions off the receipt
  addEventListener('mousemove', (e) => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px' }, true)
  addEventListener('mousedown', () => cur.classList.add('down'), true)
  addEventListener('mouseup', () => cur.classList.remove('down'), true)
})
const caption = async (text) => { await installOverlays(); await page.evaluate((t) => { const c = document.getElementById('vo-cap'); if (!t) return c.classList.remove('on'); c.textContent = t; c.classList.toggle('side', !!document.querySelector('.rc-scrim')); c.classList.add('on') }, text) }
const card = async (html) => { await installOverlays(); await page.evaluate((h) => { const c = document.getElementById('vo-card'); if (!h) return c.classList.remove('on'); c.innerHTML = h; c.classList.add('on') }, html) }

// ---- human-like interaction ----
let mx = 960, my = 540
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const moveTo = async (x, y, ms = 650) => {
  const n = Math.max(8, Math.round(ms / 16)), sx = mx, sy = my
  for (let i = 1; i <= n; i++) { const k = ease(i / n); await page.mouse.move(sx + (x - sx) * k, sy + (y - sy) * k); await wait(ms / n) }
  mx = x; my = y
}
const locate = (sel, text, scroll) => page.evaluate((sel, text, scroll) => {
  const el = [...document.querySelectorAll(sel)].filter((e) => !text || e.textContent.includes(text))[0]; if (!el) return null
  if (scroll) el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]
}, sel, text, scroll)
const click = async (sel, text, pause = 300) => {
  if (!(await locate(sel, text, true))) throw new Error('not found: ' + sel + ' ' + (text || ''))
  await wait(600) // let the smooth scroll settle
  const c = await locate(sel, text, false)
  await moveTo(c[0], c[1]); await wait(pause)
  const c2 = (await locate(sel, text, false)) || c
  if (Math.abs(c2[0] - c[0]) + Math.abs(c2[1] - c[1]) > 4) await moveTo(c2[0], c2[1], 150)
  await page.mouse.down(); await wait(90); await page.mouse.up(); await wait(250)
}
const scrollBy = async (total, ms = 4000) => { const n = Math.ceil(ms / 40); for (let i = 0; i < n; i++) { await page.mouse.wheel({ deltaY: total / n }); await wait(40) } }
const toTop = () => page.evaluate(() => (window.__lenis ? window.__lenis.scrollTo(0, { duration: 1.2 }) : scrollTo({ top: 0, behavior: 'smooth' })))
const typeInto = async (sel, text, clear = false) => {
  if (!(await locate(sel, null, true))) throw new Error('not found: ' + sel)
  await wait(600) // re-measure after the smooth scroll, or we type into whatever used to be there
  const c = await locate(sel, null, false); await moveTo(c[0], c[1]); await page.mouse.click(c[0], c[1])
  if (clear) { await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control'); await page.keyboard.press('Backspace') }
  for (const ch of text) { await page.keyboard.type(ch); await wait(70) }
}

await page.goto(base + '#/', { waitUntil: 'networkidle2' })
await page.evaluate(() => document.fonts.ready)
// Slow CSS transitions/animations and the Web Animations timeline too.
const cdp = await page.createCDPSession()
await cdp.send('Animation.enable'); await cdp.send('Animation.setPlaybackRate', { playbackRate: 1 / SLOW })
await installOverlays()
await card('<small>Smart India Hackathon 2026 · SIH26021 · Team CodeVerse</small><h1>Honey Chain</h1><p>Every jar of honey, proven - from hive to shelf.</p>')
await wait(1200)

// ---- recorder: screencast frames -> constant-FPS grid using Chrome's timestamps / SLOW ----
const ff = spawn(ffmpegPath, ['-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(FPS), '-i', '-',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'slow', '-crf', '20', '-tune', 'animation', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'pipe'] })
let ffErr = ''; ff.stderr.on('data', (d) => { ffErr = (ffErr + d).slice(-2000) }); ff.stdin.on('error', () => {})
let tStart = null, lastFrame = null, written = 0, queue = Promise.resolve()
const emitUntil = (videoT) => { // write lastFrame into every output slot before videoT
  while (lastFrame && written < Math.floor(videoT * FPS)) {
    const buf = lastFrame; written++
    queue = queue.then(() => (ff.stdin.write(buf) ? null : new Promise((r) => ff.stdin.once('drain', r))))
  }
}
cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
  cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
  const ts = metadata.timestamp ?? Date.now() / 1000
  if (tStart === null) tStart = ts
  emitUntil((ts - tStart) / SLOW)
  lastFrame = Buffer.from(data, 'base64')
})
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1, maxWidth: 1920, maxHeight: 1080 })
const realStart = Date.now()
const videoNow = () => (Date.now() - realStart) / 1000 / SLOW
const marks = []
const step = async (name, fn) => {
  console.log('>', name, videoNow().toFixed(1) + 's')
  const a = videoNow()
  try { await fn() } catch (e) { console.log('  ! skipped:', String(e.message || e).slice(0, 100)); errors.push(name + ': ' + e.message) }
  marks.push({ name, from: a, to: videoNow() })
}

await wait(4500); await card(''); await wait(900)

// ---------------- scenes (times are video seconds) ----------------
await step('home', async () => {
  await caption('Honey Chain gives every hive, batch and jar a tamper-proof identity on a permissioned blockchain.')
  await moveTo(1100, 480, 1200); await wait(3200)
  await caption('A live ribbon of real ledger blocks - every harvest, lab result and custody handover.')
  await scrollBy(560, 3000); await wait(2200)
  await caption('Six simple steps follow one batch of honey from the hive to the jar...')
  await scrollBy(900, 3600); await wait(1600)
  await scrollBy(750, 3400); await wait(1600)
  await scrollBy(750, 3400); await wait(1400)
  await caption(''); await toTop(); await wait(1600)
})

await step('verify genuine', async () => {
  await caption('A consumer scans the QR on the jar...')
  await click('.btn', 'Scan a genuine jar'); await wait(700)
  if (!(await page.evaluate(() => location.hash.includes('verify')))) await page.evaluate(() => { location.hash = '#/verify/HC-2026-0001' })
  await caption('The app re-checks block hashes, validator signatures and lab results against the ledger.')
  await wait(3800)
  await caption('Genuine: trust score 100, origin village, NMR and rice-syrup lab markers, and the full journey.')
  await wait(2600); await scrollBy(700, 3600); await wait(1800); await scrollBy(700, 3600); await wait(1800)
  await toTop(); await wait(1200)
})

await step('verify fake', async () => {
  await caption('Now a fake batch: 95 kg claimed from ONE hive - and it fails the lab.')
  await click('.chip', '0003'); await wait(3800)
  await caption('Trust score 20 - "Do not buy". Failed tests stay on the ledger forever.'); await wait(3200)
  await caption('Engineered syrup passes basic C4 and HMF tests, but fails NMR + SMR - still rejected.')
  await click('.chip', '0007'); await wait(4200)
  await caption('A forged QR code that was never written to the ledger is caught immediately.')
  await typeInto('#bid', 'HC-9999-0000', true); await page.keyboard.press('Enter'); await wait(4000)
  await caption('')
})

await step('harvest + receipt', async () => {
  await caption('Beekeepers register a harvest in three taps...')
  await click('.navitem', 'New Harvest'); await wait(1000)
  await click('.pick button', 'HV-001'); await click('.pick button', 'HV-002')
  await click('.btn', 'Next'); await wait(600)
  await typeInto('form.form input[type=number]', '46')
  await click('.chip', 'Eucalyptus'); await wait(400)
  await caption('Every ledger write prints a signed receipt - block hash, validator, barcode and QR.')
  await click('form.form button.btn.lg'); await hold(5600)
  await click('.rc-actions button', 'Tear off'); await hold(1700)
  await caption('')
})

await step('lab', async () => {
  await caption('The lab records eight results. Pass or fail is computed from limits and cannot be edited.')
  await click('.navitem', 'Lab Tests'); await wait(1100)
  await page.select('select.input', 'HC-2026-0011'); await wait(700)
  await click('.chip', 'fails NMR'); await wait(2000)
  await caption('Even with clean chemistry, an NMR anomaly makes the batch FAIL - permanently.')
  await click('form button.btn.lg'); await hold(5600)
  await click('.rc-actions button', 'Tear off'); await hold(1700)
  await caption('')
})

await step('hives', async () => {
  await caption('IoT hive nodes stream weight, brood temperature, humidity and colony sound...')
  await click('.navitem', 'My Hives'); await wait(3000)
  await click('.hivecard', 'HV-004'); await wait(900)
  await caption('...and AI flags problems early: pre-swarm at 98% confidence, with advice and a 30-day yield forecast.')
  await wait(3800); await scrollBy(560, 3000); await wait(2000)
  await caption('Foulbrood in another hive is caught before it spreads to the whole apiary.')
  await toTop(); await wait(1500) // let the smooth scroll finish, or the click lands where the button used to be
  await click('button', 'All hives'); await wait(1200)
  await click('.hivecard', 'HV-006'); await wait(3800)
  await caption('The last 14 days of sensor data are sealed on-chain as a Merkle proof.')
  await click('button.btn', 'Save proof on chain'); await hold(5600)
  const rc = await locate('.rc-actions button', 'Tear off', false); if (rc) { await click('.rc-actions button', 'Tear off'); await hold(1700) }
  await caption('')
})

await step('supply chain', async () => {
  await caption('Processors and retailers log every custody handover. Rejected batches cannot move.')
  await click('.navitem', 'Supply Chain'); await wait(1100)
  await page.select('select.input', 'HC-2026-0002'); await wait(800)
  await typeInto('form input[placeholder^="Type or pick"]', 'KVIC Processing Unit - Nagpur')
  await page.keyboard.press('Escape'); await wait(600) // close the datalist popup so it can't swallow the Save click
  await click('form.card button.btn'); await hold(5600)
  await click('.rc-actions button', 'Tear off'); await hold(1700)
  await caption('')
})

await step('ledger tamper', async () => {
  await caption('Try to cheat the ledger: secretly edit an old record...')
  await click('.navitem', 'Ledger'); await wait(1500)
  await click('button', 'Forge an old record'); await wait(900)
  await caption('The chain breaks at that exact block - tampering is detected instantly.')
  await wait(4600)
  await click('button', 'Restore clean ledger'); await wait(1600)
  await caption('')
})

await step('rollout', async () => {
  await caption('Rollout: village sensor nodes on LoRa, offline-first cluster gateways, and a chain run by KVIC, FSSAI and labs.')
  await click('.navitem', 'Rollout Plan'); await wait(2400)
  await scrollBy(800, 4200); await wait(2000)
  await caption('Four phases - from a 100-hive pilot to national scale.')
  await scrollBy(800, 4200); await wait(2400)
  await caption(''); await toTop(); await wait(1000)
})

await step('hindi', async () => {
  await caption('Built for beekeepers: Hindi and English, large text, simple or expert mode.')
  await click('header.top > .iconbtn:last-child'); await wait(900)
  await click('.drawer .seg button', 'हिन्दी'); await wait(1600)
  await click('.drawer .btn:not(.secondary)'); await wait(600)
  await page.evaluate(() => { location.hash = '#/verify/HC-2026-0001' }); await wait(4600)
  await caption('')
})

await card('<small>Open source · MIT</small><h1>Every drop, proven.</h1><p>honey-chain-rust.vercel.app</p><p style="font-size:28px">github.com/Suyash2527/HoneyChain · Team CodeVerse · SIH26021</p>')
await wait(6000)

// ---- finish ----
await cdp.send('Page.stopScreencast').catch(() => {})
emitUntil(videoNow() + 0.2)
await queue; ff.stdin.end(); await new Promise((r) => ff.on('close', r))
await browser.close()
if (!fs.existsSync(out) || fs.statSync(out).size < 1000) console.log('ffmpeg said:', ffErr)
const fmt = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`
console.log(marks.map((m) => `${fmt(m.from)}-${fmt(m.to)}  ${m.name}`).join('\n'))
console.log(`saved ${out} | ${(written / FPS).toFixed(1)}s @ ${FPS}fps | ${(fs.statSync(out).size / 1e6).toFixed(1)} MB | problems:`, errors.length ? errors : 'none')
