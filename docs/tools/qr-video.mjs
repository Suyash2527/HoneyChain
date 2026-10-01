// Dev tool: render a QR code in the same dotted style as docs/assets/qr-*.png, with a play icon in the centre.
// Usage: node docs/tools/qr-video.mjs <url> [out.png]
import QRCode from 'qrcode'
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const url = process.argv[2] || 'https://youtu.be/-nWbjNHHzBw'
const out = process.argv[3] || 'docs/assets/qr-video.png'
const qr = QRCode.create(url, { errorCorrectionLevel: 'H' }) // H: ~30% can be covered by the centre icon
const n = qr.modules.size, quiet = 4, size = 450, m = size / (n + quiet * 2)
const at = (r, c) => qr.modules.get(r, c)
const inFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)
const hole = Math.ceil(n * 0.22) // clear centre square for the icon
const inHole = (r, c) => Math.abs(r - (n - 1) / 2) <= hole / 2 && Math.abs(c - (n - 1) / 2) <= hole / 2
let dots = ''
for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
  if (!at(r, c) || inFinder(r, c) || inHole(r, c)) continue
  dots += `<circle cx="${(c + quiet + 0.5) * m}" cy="${(r + quiet + 0.5) * m}" r="${m * 0.46}"/>`
}
const finder = (r, c) => {
  const x = (c + quiet) * m, y = (r + quiet) * m
  return `<rect x="${x + m / 2}" y="${y + m / 2}" width="${6 * m}" height="${6 * m}" rx="${1.6 * m}" fill="none" stroke="#000" stroke-width="${m}"/>
          <rect x="${x + 2 * m}" y="${y + 2 * m}" width="${3 * m}" height="${3 * m}" rx="${0.9 * m}"/>`
}
const cx = size / 2, s = hole * m * 0.62
const play = `<rect x="${cx - s / 2}" y="${cx - s / 2}" width="${s}" height="${s}" rx="${s * 0.22}"/>
  <path d="M${cx - s * 0.16} ${cx - s * 0.24} L${cx + s * 0.26} ${cx} L${cx - s * 0.16} ${cx + s * 0.24} Z" fill="#fff"/>`
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" fill="#fff"/><g fill="#000">${dots}${finder(0, 0)}${finder(0, n - 7)}${finder(n - 7, 0)}${play}</g></svg>`

const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p))
const browser = await puppeteer.launch({ executablePath: exe, headless: 'new' })
const page = await browser.newPage()
await page.setViewport({ width: size, height: size })
await page.setContent(`<html><body style="margin:0">${svg}</body></html>`)
await page.screenshot({ path: out, clip: { x: 0, y: 0, width: size, height: size } })
await browser.close()
console.log('saved', out, `(${n}x${n} modules, EC=H)`)
