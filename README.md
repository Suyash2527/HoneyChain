# Honey Chain

**Blockchain honey traceability and smart beekeeping for the KVIC Honey Mission** - Smart India Hackathon 2026, problem statement **SIH26021** (Ministry of MSME).

Consumers scan a QR code on a jar and see where the honey came from, whether it passed laboratory purity tests, and who handled it. Beekeepers get IoT hive monitoring with AI health diagnosis and yield forecasting. Every record is written to a tamper-evident ledger.

> **Status: working prototype.** The ledger runs in the browser and sensor data is simulated. See [What is real vs simulated](#what-is-real-vs-simulated).

## Features

| Area | What it does |
|---|---|
| **Consumer verification** | Scan a QR (camera) or enter a batch ID. Shows a 0-100 trust score, origin, lab result vs limits, full journey, and flags. Unknown/forged codes return "no such batch". |
| **Beekeeper** | Register hives, create a harvest batch in three steps, get a printable QR label. |
| **Lab** | Enter purity results (moisture, HMF, sucrose, reducing sugars, ash, C4 sugar). Pass/fail is computed from limits and sealed on the ledger; failures cannot be edited. |
| **Supply chain** | Log custody handovers and retail packing. |
| **Smart hive** | Live simulated telemetry (weight, brood temperature, humidity, colony sound, CO2, activity). AI diagnoses varroa, foulbrood, queenless, pre-swarm and starvation with advice, forecasts 30-day yield, and anchors a Merkle root of telemetry on the ledger. |
| **Ledger explorer** | Block list with a live integrity check and a **tamper demo**: forge an old record and watch the chain break at that block. |
| **Rollout plan** | Phased KVIC cluster deployment framework, unit economics, risks. |
| **Accessibility & options** | English / हिन्दी, light / dark / auto, three text sizes, Simple vs Expert detail, role-based navigation, guided tour. |

## How the ledger works

- Permissioned **Proof-of-Authority** design: validators are KVIC, FSSAI and lab nodes (round-robin), so there is no mining and no gas cost for beekeepers.
- Each block stores `hash(index, timestamp, type, payload, prevHash, validator)` and a validator signature. Editing a record breaks its hash; re-hashing it breaks every later block.
- Only hashes and attestations go on-chain. Sensor readings stay off-chain and are anchored as a **Merkle root**, so a low-bandwidth rural link is enough.
- Event types: `HIVE_REGISTERED`, `HARVEST_LOGGED`, `SENSOR_ATTESTATION`, `LAB_CERTIFIED`, `CUSTODY_TRANSFER`, `RETAIL_PACKED`.

### Trust score

| Points | Condition |
|---|---|
| +25 | Source hives registered on the ledger |
| +15 | Harvest logged |
| +40 | Laboratory PASS |
| +10 | IoT telemetry attested |
| +10 | Custody / retail trail |
| -20 | Implausible yield per hive (possible blending) |

A lab FAIL or a score below 50 is rejected.

## What is real vs simulated

| Working now | Simulated / production path |
|---|---|
| SHA-256 hash-chained ledger with tamper detection | Ledger runs in the browser (localStorage). Production: shared Besu / Fabric network - see [`contracts/HoneyChain.sol`](contracts/HoneyChain.sol) |
| QR generation, camera scan, verification, trust score | Sensor data is generated. Production: ESP32 nodes over LoRa |
| Lab pass/fail against limits | Limits are indicative (FSSAI / BIS-style); production limits come from the notified lab |
| Explainable AI diagnosis + yield forecast | Rule-based features. Production: CNN on hive audio and thermal trends |
| Bilingual, accessible UI | Validator signatures are simulated. Production: Ed25519 keys |

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Try `#/verify/HC-2026-0001` (genuine), `#/verify/HC-2026-0003` (fake, failed lab), `#/verify/HC-2026-0004` (awaiting lab). The 🎬 button in the top bar plays a guided tour.

## Project structure

```
src/lib/chain.js      ledger, hashing, Merkle root, purity limits, trust score
src/lib/sensors.js    simulated hive telemetry
src/lib/ai.js         diagnosis + yield forecast
src/lib/store.jsx     ledger state, seed data, tamper helper
src/pages/            Home, Verify, Beekeeper, Lab, Supply, SmartHive, Explorer, Deploy
contracts/            Solidity reference contract
docs/                 pitch deck (generated), demo video script, design prompts
```

Regenerate the deck: `node docs/build-deck.mjs` (optionally `DEMO_URL=... TEAM="..."`).

## Design

Styled with a "Provenance Standard" design system (warm paper, forest green, honey amber, Source Serif 4 / Noto Sans / JetBrains Mono, hairline borders, no shadows) designed in Google Stitch. See [`docs/STITCH_PROMPT.md`](docs/STITCH_PROMPT.md).

## Disclaimer

Hackathon prototype for SIH26021. It is not an official KVIC, FSSAI or Government of India service.

## License

MIT - see [LICENSE](LICENSE).
