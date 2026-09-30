# Honey Chain - Stitch prompt pack

How to use: paste the MASTER PROMPT first and generate the Consumer Verify screen. When you like the look, paste each SCREEN PROMPT one at a time in the same project so Stitch keeps the style. Use the REFINEMENT PROMPTS at the end to fix generic-looking results.

---

## MASTER PROMPT (paste first)

Design a mobile-first responsive web product called **Honey Chain**: a blockchain-backed honey traceability and smart-beekeeping platform for India's KVIC Honey Mission (Ministry of MSME, Government of India). Consumers scan a QR on a honey jar and see whether it is genuine. Beekeepers, labs, packers and KVIC officers use the same platform to record harvests, lab tests, custody and hive health.

### Who it is for
- Rural beekeepers with low-to-medium digital literacy, mostly on Android phones, patchy 2G/4G, often Hindi-first. Need big tap targets, plain language, few steps.
- Urban consumers who scan a jar in a shop and need a trustworthy answer in under 3 seconds.
- Lab officers and KVIC/FSSAI officials who need dense, precise, auditable data.

### Design direction: "Institutional trust, editorial warmth"
The feel of a well-designed government-grade certification service crossed with a premium food-provenance brand. Calm, credible, precise. Think a passport or hallmark seal, a good newspaper's data pages, and a lab report - not a startup landing page.
- **Must NOT look AI-generated or template-like.** No purple/blue gradients, no glassmorphism, no glowing blobs, no emoji as icons, no stock-illustration people, no identical rounded cards in a 3-column grid repeated down the page, no centered hero with two buttons, no "Revolutionizing..." copy.
- Use asymmetric editorial layouts, strong typographic hierarchy, generous whitespace, thin hairline rules and subtle texture instead of heavy shadows. Vary section rhythm: full-bleed band, split layout, data table, timeline.
- Flat, confident surfaces. Depth via 1px borders and tonal steps, not drop shadows.
- A signature motif: a subtle **hexagonal honeycomb line pattern** used sparingly (hero corner, empty states, verification seal), never as wallpaper.
- A **"verification seal"** component: a hexagonal badge with a thick ring showing the trust score, used on the result screen and printable on labels.

### Visual system
- **Colour:** warm paper background `#FAF6EC`; ink `#1B1A17`; primary deep forest green `#1F4D3A` for trust and actions; honey amber `#E9A23B` as a sparing accent (seal, highlights, key numbers only); semantic: verified green `#2E7D4F`, caution amber `#B7791F`, danger red `#B3372F`, info blue `#2F5D8C`. Neutrals are warm greys. Full dark mode with the same hierarchy (deep brown-black `#14120E`, not pure black). WCAG AA contrast minimum, AAA for body text.
- **Type:** a refined serif for display and big numbers (Fraunces or Source Serif) paired with a clean humanist sans for UI (Inter or Noto Sans, with Noto Sans Devanagari for Hindi). Monospace (IBM Plex Mono) only for batch IDs and hashes. Scale: 12 / 14 / 16 / 20 / 28 / 40 / 56. Tabular numerals in all data tables.
- **Shape:** 8px radius on controls, 12px on panels, 0 on data tables; hexagon only for the seal. Icons: one consistent thin-stroke (1.5px) outline set (Lucide style), never emoji.
- **Density:** two modes. "Simple" (default): large type, one primary action per screen, 56px tap targets. "Expert": compact tables, monospace hashes, validator names.
- **Motion notes:** the score ring fills once; hive status dot pulses subtly; nothing bouncy.

### Information architecture
Desktop: slim left rail with grouped navigation (Buyers / Beekeepers / Lab & Supply / Authorities), top bar with batch-ID search, ledger-integrity status pill, language switch (English / हिन्दी), settings. Mobile: bottom tab bar (Home, Verify, Hives, Harvest, More) and a scan-first primary action.

### Screens to design (in this order)
1. Home / role chooser 2. Consumer verification result (hero screen) 3. Verify entry with QR scanner 4. New Harvest 3-step wizard 5. My Hives overview 6. Hive detail with sensor charts and AI diagnosis 7. Lab test entry 8. Supply-chain handover log 9. Ledger explorer with tamper alert 10. Rollout plan / KVIC dashboard 11. Settings drawer.

### Real content to use (no lorem ipsum)
- Batch IDs like `HC-2026-0001`. Genuine batch: mustard honey, 62 kg, beekeeper Sunita Devi, Deeg, Bharatpur, Rajasthan, harvested 21 Aug 2026, hives HV-003 and HV-004, KVIC cluster KVIC-RJ-04, trust score 100, "Verified genuine".
- Fake batch: `HC-2026-0003`, wildflower, 95 kg claimed from ONE hive, Lalita Meena, Bonli, Sawai Madhopur, score 20, "Do not buy - failed lab". Lab table: Moisture 24.6% (limit ≤ 20), HMF 112 mg/kg (≤ 80), Sucrose 9.4% (≤ 5), Reducing sugars 58% (≥ 65), C4 sugar 21% (≤ 7).
- Lab: "NABL Lab - KVIC Jaipur". Validators: KVIC-Node-Nagpur, KVIC-Node-Jaipur, FSSAI-Node-Delhi.
- Hive metrics: brood temperature 34.6 °C, humidity 55%, weight 58.3 kg, colony sound 240 Hz, entrance activity 120 bees / 5 min, CO2 620 ppm. AI states: Healthy colony 73% / Varroa infestation 86% / Pre-swarm 98% / Foulbrood suspected 88%.
- Journey timeline events: hive registered, IoT data anchored, harvest logged, lab certified, custody transfer to "KVIC Processing Unit - Jaipur", retail packed 124 x 500 g for "Khadi Gramodyog Bhawan, Jaipur".
- Bilingual labels shown in English with Hindi equivalents (e.g. "Verified genuine / असली शहद - सत्यापित").

### Accessibility and trust requirements
Colour is never the only signal (icon + text + colour for every status). Focus states visible. Support text-size scaling to 200%. Every verdict states WHY in one plain sentence. Show source of truth ("Read from the ledger, not from the seller") near every result. Include empty, loading, error, offline ("Saved on this device - will sync when connected") and tampered-ledger states.

Deliver a cohesive design system (colours, type, components: seal, score ring, verdict banner, status badge, data table, timeline, stepper, hive card, sensor tile, alert, form field, bottom tab bar) and all screens above in light mode, with the Consumer Verification result also in dark mode and in Hindi.

---

## SCREEN PROMPTS (one at a time, after the master prompt)

**2 - Consumer verification result (most important).** Mobile 390px. Top: batch ID in monospace and "Read from the ledger, not from the seller". Dominant verdict banner containing the hexagonal verification seal with a trust score ring (100) and the headline "Verified genuine" plus one sentence why. Below: "Where it came from" as a definition list with a small map thumbnail of Bharatpur, Rajasthan; "Lab purity test" as a compact table with limit column and a pass/fail mark per row (icon + text); vertical "Journey" timeline with dates and signer; a "Show technical details" expander revealing block hashes; a sticky bottom bar with "Copy link" and "Report this jar". Then design the FAIL variant (score 20, red banner, "Do not buy - failed lab", the 5 out-of-limit rows highlighted, a flag "95 kg from a single hive is implausible") and the "No such batch - possible forged QR" variant.

**3 - Verify entry.** Full-screen camera viewfinder with a hexagonal scan frame, torch toggle, "Enter batch ID instead" field, and three sample chips (Genuine, Fake, Awaiting lab). Include camera-permission-denied state.

**4 - New Harvest wizard.** Three-step progress (Choose hives, Harvest details, Your QR). Step 1: selectable hive tiles showing ID, owner, village, health dot. Step 2: numeric kg field with large stepper, flower-type chips (Mustard, Eucalyptus, Litchi, Ber, Wildflower), extraction method. Step 3: printable QR label preview at 50 x 30 mm with seal, batch ID and "Scan to verify", plus Download / Share to WhatsApp.

**5 - My Hives.** Filterable grid of hive cards: ID, village, status (Healthy / Needs attention / Urgent as icon + text), three key readings, 3-day weight sparkline, latest AI finding. Include a summary strip: 6 hives, 2 healthy, 4 need action, projected 30-day yield.

**6 - Hive detail.** Header with status and LIVE indicator. AI diagnosis panel: primary finding, confidence, plain-language advice, and probability bars for all six conditions. Sensor tiles (brood temp with healthy band 33-36 °C shaded, humidity, weight, sound Hz, activity, CO2) each with a 3-day line. 30-day yield forecast with 80% range band chart. "Save proof on chain" card explaining that 14 days of data get sealed. Demo control to simulate a problem.

**7 - Lab test entry.** Batch selector showing pending count, laboratory name, six parameter inputs each showing limit and live in/out-of-range state, a live PASS/FAIL result strip, and a clear "This result cannot be edited after saving" notice.

**9 - Ledger explorer.** Reverse-chronological block list with type badge, time, validator; expert mode shows hash and previous hash with the link drawn as a chain. Include the TAMPERED state: top bar turns red, the altered block is flagged "Data altered" with a diff of quantity 48 kg to 148 kg, and blocks downstream marked "Link unverifiable".

**10 - KVIC dashboard / rollout.** Officer view: map of India with cluster markers, KPI row (batches certified, adulteration flags per 1,000, colony-loss alerts, scans this month), phased rollout Gantt (Pilot, State, Regional, National), and a table of clusters with beekeeper counts and lab status.

---

## REFINEMENT PROMPTS (use when the output looks generic)

- "This looks like a generic SaaS template. Redesign with an editorial layout: asymmetric grid, larger serif headlines, hairline dividers instead of cards, and remove all card shadows."
- "Replace every emoji with thin-stroke outline icons and remove all gradients. Use flat forest-green and warm-paper surfaces only."
- "Make the verification seal the hero: hexagonal, thick ring, score in a large serif numeral, small caps label 'KVIC HONEY MISSION - VERIFIED'."
- "Increase information density for the Expert mode: 13px tabular numerals, 8px row padding, monospace hashes truncated with copy buttons."
- "Redo this screen in Hindi with Noto Sans Devanagari, ensuring line heights accommodate the script and labels do not truncate."
- "Show the mobile version at 360px with a 56px bottom tab bar and thumb-reachable primary action."
