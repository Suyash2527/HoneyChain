# Honey Chain (SIH26021)

Blockchain-based honey traceability and smart beekeeping for the KVIC Honey Mission.

- **Consumer QR verification** with trust score and journey timeline (`#/verify/<batchId>`)
- **Permissioned PoA hash-chained ledger** (SHA-256, round-robin KVIC/FSSAI validators, tamper detection)
- **Beekeeper, Lab, Supply-chain portals** writing typed blocks
- **Smart Hive**: simulated IoT telemetry, explainable AI disease detection, 30-day yield forecast, Merkle-root anchoring
- `contracts/HoneyChain.sol`: production smart-contract design (not wired to the UI)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
node docs/build-deck.mjs   # regenerates docs/HoneyChain-SIH26021.pptx
```

Prototype notes: the ledger runs in the browser and persists to localStorage; sensor data and the AI model are simulated/heuristic. See `docs/VIDEO_SCRIPT.md` for the demo walkthrough.
