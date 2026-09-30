# Honey Chain - 3-minute SIH demo video script

Record with OBS / Windows Game Bar (Win+G) / Loom at 1080p, browser zoom 100%, light mode.
Open the app once first so the seeded ledger loads. Click **Ledger → Restore clean ledger** before recording.

| Time | Screen (click path) | Narration |
|---|---|---|
| 0:00-0:15 | Home page hero | "Indian beekeepers produce genuine honey, but buyers can't tell it from syrup-blended fakes, so honest producers lose out. We built Honey Chain for KVIC's Honey Mission." |
| 0:15-0:35 | Scroll Home: problem cards → "How Honey Chain works" | "Every hive gets a digital ID. IoT sensors watch the colony, AI flags disease, every harvest becomes a QR-coded batch, labs anchor purity results, and consumers verify in seconds." |
| 0:35-1:05 | **Verify Honey** → click `HC-2026-0001` → scroll timeline | "Scan a jar: trust score 100, verified authentic. Origin village, floral source, the lab's purity table against limits, and every step of the journey, each tied to a signed block." |
| 1:05-1:25 | Click `HC-2026-0003` | "This batch claims 95 kg from a single hive and fails the lab: moisture, HMF, sucrose and C4-sugar are out of limits. Trust score 20 - do not buy. Failed tests can't be deleted." |
| 1:25-1:45 | Type `HC-9999-0000` | "A forged QR that isn't on the ledger simply returns no such batch." |
| 1:45-2:15 | **New Harvest** → tap HV-001 + HV-002 → Next → 40 kg, Eucalyptus → Create batch & QR → **Lab Tests** → pick the new batch → "Genuine honey" → Anchor | "A beekeeper registers hives and logs a harvest to mint a batch and QR. The lab enters results; pass or fail is computed from the limits and written to the chain." Then open **Verify** on the new batch to show the score jump. |
| 2:15-2:45 | **My Hives** → open HV-001 (healthy) → back → open HV-004 (pre-swarm) and HV-006 (foulbrood) → show advice + forecast → **Save proof on chain** | "A low-cost ESP32 node streams weight, brood temperature, humidity and colony sound. Our model diagnoses swarming, foulbrood, varroa, queenless and starvation with advice in plain language, forecasts 30-day yield, and anchors a Merkle root of the telemetry on-chain." |
| 2:45-3:05 | **Ledger** → **Forge an old record** → badge turns red → **Restore** | "Watch what happens when a fraudster secretly edits an old record: the chain breaks at that exact block, instantly." |
| 3:05-3:25 | **Rollout Plan** page | "Rollout is hub-and-spoke across KVIC clusters: village sensor nodes on LoRa, a cluster edge gateway that works offline, and a permissioned chain run by KVIC, FSSAI and labs. Four phases from a 100-hive pilot to national scale." |
| 3:25-3:35 | Home / title slide | "Honey Chain: every drop, proven." |

## Shortcut
The 🎬 button in the top bar (or **Take the 1-minute tour** on Home) plays a guided tour through the key screens with captions in English or Hindi. Turn on **Auto-play** and screen-record it as a ready-made video, then add voice-over.

## Options to show
Settings (⚙️): language (English / हिन्दी), theme, text size, Simple/Expert detail, role.

## Tips
- Narrate live while clicking; keep each section under its time budget. Trim the camera-scan demo unless you can show a phone scanning the QR on screen.
- Good extra shot: open the app on your phone (same URL), scan the QR shown on your laptop screen.
- Upload as YouTube "Unlisted" and paste the link into the SIH submission form.
