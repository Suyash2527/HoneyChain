import { useSettings } from '../lib/settings.jsx'
import { Icon, PageHead } from '../lib/ui.jsx'

const LAYERS = [
  ['cottage', 'Village layer', 'ESP32 hive node (load cell, temperature, humidity, microphone) at an estimated ₹1,500-2,500, solar powered, LoRa link. One gateway serves 20-40 hives within ~5 km. Beekeepers use an Android / regional-language workflow.'],
  ['corporate_fare', 'Cluster layer', 'KVIC cluster coordinator device runs edge AI and batches telemetry into Merkle roots. Works offline and syncs when 2G/4G returns.'],
  ['public', 'National layer', 'Permissioned PoA network (Hyperledger Besu / Fabric class) with validators at KVIC regional offices, FSSAI and accredited labs. Public verification portal and retailer API.'],
]
const PHASES = [
  ['0 · Pilot', 'Months 0-3', '2 clusters, 50 beekeepers, 100 instrumented hives, 1 lab', '100% of pilot batches carry a QR; zero unverifiable batches'],
  ['1 · State', 'Months 4-9', '10 clusters in 3 states, 1,000 beekeepers, 3 labs, QR at Khadi outlets', 'Consumer scans per month; price premium vs unlabelled honey'],
  ['2 · Regional', 'Months 10-18', 'All Honey Mission states, FSSAI dashboard, marketplace integration', 'Adulteration flagged per 1,000 batches; mean yield per hive'],
  ['3 · National', 'Year 2+', 'Open API for e-commerce and export certificates, trained disease model', 'Beekeeper income uplift; colony-loss reduction'],
]

export default function Deploy() {
  const { t } = useSettings()
  return (
    <div className="stack lg">
      <PageHead kicker="Deployment framework" title={t('d.title')} bilKey="d.title" sub="Hub-and-spoke: inexpensive nodes in villages, validators at KVIC offices, one open verification app for consumers." />
      <div className="grid g3">
        {LAYERS.map(([ic, h, b]) => <div className="card" key={h}><div className="head"><h3><Icon n={ic} />{h}</h3></div><p className="muted" style={{ margin: '12px 0 0' }}>{b}</p></div>)}
      </div>
      <section>
        <div className="head" style={{ marginBottom: 12 }}><h3>Phased rollout</h3></div>
        <div className="scroll"><table className="ledger">
          <thead><tr><th>Phase</th><th>Timeline</th><th>Scope</th><th>Success measure</th></tr></thead>
          <tbody>{PHASES.map(([p, tm, s, m]) => <tr key={p}><td><b style={{ fontFamily: 'var(--serif)' }}>{p}</b></td><td className="mono">{tm}</td><td>{s}</td><td>{m}</td></tr>)}</tbody>
        </table></div>
      </section>
      <div className="grid g2">
        <div className="card">
          <div className="head"><h3><Icon n="payments" />Indicative unit economics</h3></div>
          <dl className="spec" style={{ margin: '12px 0' }}>
            <div><dt>Hive node hardware</dt><b>≈ ₹1,500 - 2,500 / hive</b></div>
            <div><dt>LoRa gateway (per cluster)</dt><b>≈ ₹15,000 - 25,000</b></div>
            <div><dt>QR label per jar</dt><b>≈ ₹0.10 - 0.30</b></div>
            <div><dt>Chain write cost</dt><b>Near zero (no gas)</b></div>
          </dl>
          <p className="small faint" style={{ margin: 0 }}>Planning estimates only; validate with vendor quotes during the pilot.</p>
        </div>
        <div className="card">
          <div className="head"><h3><Icon n="shield_question" />Risks and mitigations</h3></div>
          <ul style={{ margin: '12px 0 0', paddingLeft: 20 }} className="stack sm">
            <li><b>Garbage in:</b> a dishonest lab or beekeeper can still enter false data - accredited lab keys, random audits, IoT weight cross-check against claimed yield.</li>
            <li><b>Connectivity:</b> offline-first apps and LoRa gateways.</li>
            <li><b>Literacy:</b> bilingual and voice UI, QR-first flows.</li>
            <li><b>QR cloning:</b> per-jar serials and single-use claim codes (roadmap).</li>
            <li><b>Governance:</b> multi-stakeholder validators; no single owner can rewrite history.</li>
          </ul>
        </div>
      </div>
      <div className="card panel"><div className="head"><h3><Icon n="code" />Technology</h3></div><p className="muted" style={{ margin: '12px 0 0' }}>Prototype: React, Web Crypto SHA-256 hash-chained PoA ledger, simulated IoT, explainable AI. Production path: Solidity contract (<code>contracts/HoneyChain.sol</code>) on Hyperledger Besu, ESP32 firmware over LoRaWAN/MQTT, TensorFlow Lite Micro, Node/Postgres indexer, IPFS for lab PDFs.</p></div>
    </div>
  )
}
