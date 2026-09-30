// Dev tool: record a captioned product walkthrough (MP4) by driving the real app in headless Edge/Chrome.
// Usage: node docs/tools/make-video.mjs [baseUrl] [out.mp4]
import puppeteer from 'puppeteer-core'
import ffmpegPath from 'ffmpeg-static'
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'

const base = process.argv[2] || 'http://localhost:5173/'
const out = process.argv[3] || 'docs/demo/HoneyChain-demo.mp4'
fs.mkdirSync(path.dirname(out), { recursive: true })
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] })
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.evaluateOnNewDocument(() => {
  localStorage.clear(); localStorage.setItem('honeychain.sound', 'off')
  localStorage.setItem('honeychain.settings.v2', JSON.stringify({ lang: 'en', theme: 'light', size: 1, mode: 'simple', role: 'consumer', motion: 'on' }))
})
let t0v = 0
const CAPTIONS = process.env.CAPTIONS !== '0'
const PACE = Number(process.env.PACE || 1)
const wait = (ms) => new Promise((r) => setTimeout(r, ms * PACE))

// ---- overlays: caption bar, fake cursor, title/end cards ----
const installOverlays = () => page.evaluate(() => {
  if (document.getElementById('vo-cap')) return
  const st = document.createElement('style')
  st.textContent = `
  #vo-cap{position:fixed;left:50%;bottom:40px;transform:translateX(-50%) translateY(20px);max-width:1500px;z-index:99999;background:rgba(10,9,7,.92);color:#f5eedf;border-left:4px solid #d6b15e;border-radius:10px;padding:16px 30px;font:600 30px/1.35 'Source Serif 4',Georgia,serif;opacity:0;transition:opacity .35s,transform .35s;pointer-events:none;text-align:left}
  #vo-cap.on{opacity:1;transform:translateX(-50%) translateY(0)}
  #vo-cur{position:fixed;z-index:100000;width:30px;height:30px;border-radius:50%;background:rgba(214,177,94,.6);border:3px solid #b8892f;pointer-events:none;transform:translate(-50%,-50%);transition:transform .08s;left:-50px;top:-50px}
  #vo-cur.down{transform:translate(-50%,-50%) scale(.7)}
  #vo-card{position:fixed;inset:0;z-index:100001;display:grid;place-content:center;text-align:center;gap:12px;background:radial-gradient(900px 500px at 70% 0%,rgba(214,177,94,.18),transparent 60%),#0c0b09;color:#f5eedf;opacity:0;pointer-events:none;transition:opacity .6s}
  #vo-card.on{opacity:1}
  #vo-card h1{font:700 120px 'Cormorant Garamond',Georgia,serif;margin:0;background:linear-gradient(110deg,#f3dc9b,#d6b15e 55%,#a8823a);-webkit-background-clip:text;background-clip:text;color:transparent}
  #vo-card p{font:500 36px 'Source Serif 4',Georgia,serif;margin:0;color:#bdb39d} #vo-card small{font:500 20px 'JetBrains Mono',monospace;letter-spacing:.16em;color:#d6b15e;text-transform:uppercase}`
  document.head.appendChild(st)
  const cap = document.createElement('div'); cap.id = 'vo-cap'; document.body.appendChild(cap)
  const cur = document.createElement('div'); cur.id = 'vo-cur'; document.body.appendChild(cur)
  const card = document.createElement('div'); card.id = 'vo-card'; document.body.appendChild(card)
  addEventListener('mousemove', (e) => { cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px' }, true)
  addEventListener('mousedown', () => cur.classList.add('down'), true); addEventListener('mouseup', () => cur.classList.remove('down'), true)
})
const caption = async (text) => { if (!CAPTIONS) return; await installOverlays(); await page.evaluate((t) => { const c = document.getElementById('vo-cap'); if (!t) return c.classList.remove('on'); c.textContent = t; c.classList.add('on') }, text) }
const card = async (html) => { await installOverlays(); await page.evaluate((h) => { const c = document.getElementById('vo-card'); if (!h) return c.classList.remove('on'); c.innerHTML = h; c.classList.add('on') }, html) }

// ---- human-like interaction ----
let mx = 640, my = 360
const moveTo = async (x, y, steps = 22) => { await page.mouse.move(x, y, { steps }); mx = x; my = y }
const center = (sel, text) => page.evaluate((sel, text) => {
  const els = [...document.querySelectorAll(sel)].filter((e) => !text || e.textContent.includes(text))
  const el = els[0]; if (!el) return null
  el.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = el.getBoundingClientRect()
  return [r.left + r.width / 2, r.top + r.height / 2]
}, sel, text)
const centerNoScroll = (sel, text) => page.evaluate((sel, text) => {
  const el = [...document.querySelectorAll(sel)].filter((e) => !text || e.textContent.includes(text))[0]; if (!el) return null
  const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]
}, sel, text)
const click = async (sel, text, pause = 350) => {
  let c = await center(sel, text); if (!c) throw new Error('not found: ' + sel + ' ' + (text || ''))
  await wait(450) // let smooth scrolling settle
  c = (await centerNoScroll(sel, text)) || c
  await moveTo(c[0], c[1]); await wait(pause)
  const c2 = (await centerNoScroll(sel, text)) || c
  if (Math.abs(c2[0] - c[0]) + Math.abs(c2[1] - c[1]) > 4) await moveTo(c2[0], c2[1], 6)
  await page.mouse.click(c2[0], c2[1]); await wait(250)
}
const scrollBy = async (total, ms = 4000) => { const n = Math.ceil(ms / 50); for (let i = 0; i < n; i++) { await page.mouse.wheel({ deltaY: total / n }); await wait(50) } }
const go = async (hash) => { await page.evaluate((h) => { location.hash = h }, hash); await wait(900) }
const typeInto = async (sel, text) => { const c = await center(sel); await moveTo(c[0], c[1]); await page.mouse.click(c[0], c[1]); await page.keyboard.type(text, { delay: 55 }) }

await page.goto(base + '#/', { waitUntil: 'networkidle2' }); await wait(1200)
await installOverlays()
await card('<small>Smart India Hackathon 2026 · SIH26021 · Team CodeVerse</small><h1>Honey Chain</h1><p>Every jar of honey, proven - from hive to shelf.</p>')

// Custom recorder: CDP screencast frames -> ffmpeg at a constant 25 fps (robust across ffmpeg builds).
const cdp = await page.createCDPSession()
const ff = spawn(ffmpegPath, ['-y', '-use_wallclock_as_timestamps', '1', '-f', 'image2pipe', '-c:v', 'mjpeg', '-i', '-', '-vf', 'fps=25', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'veryfast', '-crf', '24', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'pipe'] })
let ffErr = ''; ff.stderr.on('data', (d) => { ffErr += d }); ff.stdin.on('error', () => {})
let last = null
cdp.on('Page.screencastFrame', ({ data, sessionId }) => { last = Buffer.from(data, 'base64'); cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {}) })
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, everyNthFrame: 1, maxWidth: 1920, maxHeight: 1080 })
t0v = Date.now()
const ticker = setInterval(() => { if (last && ff.stdin.writable) ff.stdin.write(last) }, 40)
const recorder = { stop: async () => { clearInterval(ticker); await cdp.send('Page.stopScreencast').catch(() => {}); ff.stdin.end(); await new Promise((r) => ff.on('close', r)); if (!fs.existsSync(out) || fs.statSync(out).size < 1000) console.log('ffmpeg said:', ffErr.slice(-400)) } }
const step = async (name, fn) => { console.log('>', name); const a = (Date.now() - t0v) / 1000; try { await fn() } catch (e) { console.log('  ! skipped:', String(e.message || e).slice(0, 90)); errors.push(name + ': ' + e.message) } marks.push({ name, from: a, to: (Date.now() - t0v) / 1000 }) }

const marks = []
await wait(3200); await card(''); await wait(800)

await step('home', async () => {
  await caption('Honey Chain gives every hive, batch and jar a tamper-proof identity on a permissioned blockchain.')
  await wait(3800)
  await caption('A live ribbon of real ledger blocks - every harvest, lab result and handover.')
  await scrollBy(560, 2600); await wait(1800)
  await caption('Six simple steps follow one batch from hive to jar...')
  await scrollBy(900, 3200); await wait(1200)
  await scrollBy(700, 3000); await wait(1400)
  await scrollBy(700, 3000); await wait(1000)
  await caption(''); await page.evaluate(() => (window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0))); await wait(600)
})

await step('verify genuine', async () => {
  await caption('Consumers scan the QR on the jar...')
  await click('.btn', 'Scan a genuine jar'); await wait(600)
  if (!(await page.evaluate(() => location.hash.includes('verify')))) await go('#/verify/HC-2026-0001')
  await caption('The app re-checks hashes, validator signatures and lab results against the ledger.')
  await wait(3300)
  await caption('Genuine honey: trust score 100, origin, lab table with NMR and rice-syrup marker, full journey.')
  await wait(2800); await scrollBy(700, 3200); await wait(1500); await scrollBy(700, 3200); await wait(1500)
  await page.evaluate(() => (window.__lenis ? window.__lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0)))
})

await step('verify fake', async () => {
  await caption('Now a fake batch: 95 kg claimed from ONE hive, and it fails the lab.')
  await click('.chip', '0003'); await wait(3600)
  await caption('Trust score 20 - "Do not buy". Failures stay on the ledger forever.'); await wait(2800)
  await caption('Engineered syrup passes the basic C4/HMF tests but fails NMR + SMR - still rejected.')
  await click('.chip', '0007'); await wait(3800)
  await caption('')
})

await step('harvest + receipt', async () => {
  await caption('Beekeepers register a harvest in three taps...')
  await click('.navitem', 'New Harvest'); await wait(900)
  await click('.pick button', 'HV-001'); await click('.pick button', 'HV-002')
  await click('.btn', 'Next'); await wait(500)
  await typeInto('form.form input[type=number]', '46')
  await click('.chip', 'Eucalyptus'); await wait(300)
  await caption('Every ledger write prints a signed receipt - with block hash, validator, barcode and QR.')
  await click('form.form button.btn.lg'); await wait(4200)
  await wait(2200)
  await click('.rc-actions button', 'Tear off'); await wait(1200)
  await caption('')
})

await step('lab', async () => {
  await caption('The lab records eight results. Pass or fail is computed from limits and cannot be edited.')
  await click('.navitem', 'Lab Tests'); await wait(1000)
  await page.select('select.input', 'HC-2026-0011'); await wait(500)
  await click('.chip', 'fails NMR'); await wait(1800)
  await caption('Even with clean chemistry, an NMR anomaly makes the batch FAIL.')
  await click('form button.btn.lg'); await wait(4300); await wait(1500)
  await click('.rc-actions button', 'Tear off'); await wait(900)
  await caption('')
})

await step('hives', async () => {
  await caption('IoT hive nodes stream weight, temperature, humidity and colony sound...')
  await click('.navitem', 'My Hives'); await wait(2500)
  await click('.hivecard', 'HV-004'); await wait(800)
  await caption('...and AI flags problems early: Pre-swarm 98% confident, with advice and a 30-day yield forecast.')
  await wait(3500); await scrollBy(520, 2500); await wait(1600)
  await caption('')
})

await step('supply chain', async () => {
  await caption('Processors and retailers log every custody handover. Rejected batches cannot move.')
  await click('.navitem', 'Supply Chain'); await wait(1000)
  await page.select('select.input', 'HC-2026-0002'); await wait(700)
  await typeInto('form input[placeholder="Type or pick…"]', 'KVIC Processing Unit - Nagpur'); await wait(500)
  await click('form.card button.btn'); await wait(4200); await wait(1000)
  await click('.rc-actions button', 'Tear off'); await wait(900)
  await caption('')
})

await step('ledger tamper', async () => {
  await caption('Try to cheat the ledger: secretly edit an old record...')
  await click('.navitem', 'Ledger'); await wait(1200)
  await click('button', 'Forge an old record'); await wait(800)
  await caption('The chain breaks at that exact block - tampering is detected instantly.')
  await wait(3800)
  await click('button', 'Restore clean ledger'); await wait(1200)
  await caption('')
})

await card('<small>Open source · MIT</small><h1>Every drop, proven.</h1><p>suyash2527.github.io/HoneyChain</p><p style="font-size:28px">github.com/Suyash2527/HoneyChain · Team CodeVerse · SIH26021</p>')
await wait(4200)
await recorder.stop()
await browser.close()
const NARRATION = {
  home: 'Honey Chain gives every hive, every harvest batch and every jar of honey a tamper-proof identity on a permissioned blockchain. On the home page you can see a live ribbon of real ledger blocks, and a scroll-driven story that follows one batch of honey, in six steps, from the hive to the jar.',
  'verify genuine': 'A consumer scans the QR code on the jar. The app re-checks the block hashes, the validator signatures and the lab results, then shows a trust score out of one hundred, where the honey came from, the full laboratory table including the NMR and rice-syrup marker, and the complete journey of the batch.',
  'verify fake': 'Now a fake batch. It claims ninety-five kilograms from a single hive, and it fails the laboratory tests, so the trust score is twenty and the verdict is: do not buy. And this sunflower batch is the tricky case: it passes the basic C4 and HMF chemistry, but fails the NMR and rice-syrup tests, so it is still rejected.',
  'harvest + receipt': 'Beekeepers register a harvest in three taps: choose the hives, enter the quantity and flowers, and the batch and QR code are created. Every write to the ledger prints a signed receipt, with the block number, the validator signature, a barcode and a QR to verify.',
  lab: 'The laboratory records eight results. Pass or fail is computed from the limits and can never be edited. Even when the chemistry looks clean, an NMR anomaly makes the batch fail, and that failure is permanent.',
  hives: 'IoT hive nodes stream weight, temperature, humidity and colony sound. Our AI flags problems early. Here it detects a pre-swarm condition with ninety-eight percent confidence, gives advice in plain language, and forecasts the next thirty days of honey yield.',
  'supply chain': 'Processors and retailers log every custody handover. The current holder is filled in automatically, packing cannot exceed what was harvested, and a rejected batch cannot be moved at all.',
  'ledger tamper': 'Finally, try to cheat the ledger. If someone secretly edits an old record, the chain breaks at that exact block and the integrity alarm goes off instantly. Honey Chain: every drop, proven.',
}
const fmt = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`
const md = ['# Voice-over script (timed to `HoneyChain-demo-clean.mp4`)', '',
  `Total length ≈ ${fmt((Date.now() - t0v) / 1000)}. Speak each block while its scene plays; leave small pauses. ~140 words per minute fits.`, '',
  '| Time | Scene | Say this |', '|---|---|---|',
  `| 00:00-${fmt(marks[0]?.from ?? 4)} | Title card | "Hello, this is Honey Chain by Team CodeVerse for Smart India Hackathon problem statement SIH26021: blockchain honey traceability and smart beekeeping for the KVIC Honey Mission." |`,
  ...marks.map((m) => `| ${fmt(m.from)}-${fmt(m.to)} | ${m.name} | ${NARRATION[m.name] || ''} |`),
  `| ${fmt(marks[marks.length - 1]?.to ?? 0)}-end | End card | "The prototype is live and open source. Scan or visit the link on screen. Thank you." |`].join('\n')
if (!CAPTIONS) fs.writeFileSync('docs/demo/VOICEOVER_SCRIPT.md', md + '\n')
console.log('saved', out, '| problems:', errors.length ? errors : 'none')
