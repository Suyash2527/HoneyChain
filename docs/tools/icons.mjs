// Dev tool: find Material Symbols icons that failed to render (they show as raw text).
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const base = process.argv[2] || 'http://localhost:5173/'
const exe = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe'].find((p) => fs.existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.evaluateOnNewDocument(() => localStorage.setItem('honeychain.settings.v2', JSON.stringify({ lang: 'en', theme: 'dark', size: 1, mode: 'expert', role: 'consumer', motion: 'off' })))
const routes = ['', 'verify/HC-2026-0001', 'verify/HC-2026-0003', 'verify/HC-2026-0004', 'hives', 'harvest', 'lab', 'supply', 'ledger', 'rollout']
const bad = new Map()
for (const r of routes) {
  await page.goto(base + '#/' + r, { waitUntil: 'networkidle2' })
  await new Promise((s) => setTimeout(s, 1200))
  const found = await page.evaluate(() => [...document.querySelectorAll('.icon')].filter((e) => e.getBoundingClientRect().width > e.getBoundingClientRect().height * 2.2 + 8).map((e) => e.textContent))
  found.forEach((n) => bad.set(n, (bad.get(n) || 0) + 1))
}
console.log(bad.size ? 'BROKEN ICONS: ' + JSON.stringify([...bad.keys()]) : 'all icons render')
await browser.close()
