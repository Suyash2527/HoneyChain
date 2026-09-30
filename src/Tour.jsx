import { useEffect, useState } from 'react'
import { useSettings } from './lib/settings.jsx'

// Guided tour: navigates the real app and narrates each screen. Great for recording the demo video.
const STEPS = [
  ['#/', 'Honey Chain gives every jar of honey a tamper-proof identity - from hive to shelf.', 'हनी चेन हर जार को छत्ते से दुकान तक एक छेड़छाड़-रहित पहचान देता है।'],
  ['#/verify/HC-2026-0001', 'Scan a genuine jar: trust score 100, origin, lab table and the full journey.', 'असली जार स्कैन करें: भरोसा स्कोर 100, स्रोत, लैब तालिका और पूरा सफ़र।'],
  ['#/verify/HC-2026-0003', 'A fake batch fails the lab - moisture, sugar and C4 markers are out of limits. Do not buy.', 'नकली बैच लैब में फेल - नमी, चीनी और C4 मार्कर सीमा से बाहर। न खरीदें।'],
  ['#/verify/HC-9999-0000', 'A forged QR that is not on the ledger is caught immediately.', 'जो नकली QR बहीखाते में नहीं है, वह तुरंत पकड़ा जाता है।'],
  ['#/harvest', 'Beekeepers pick hives, enter the harvest and get a QR to print on every jar.', 'मधुमक्खी पालक छत्ते चुनते हैं, फसल दर्ज करते हैं और हर जार के लिए QR पाते हैं।'],
  ['#/lab', 'Accredited labs record purity results. Pass or fail is computed from limits and cannot be edited.', 'मान्यता प्राप्त लैब शुद्धता परिणाम दर्ज करती हैं। पास/फेल सीमाओं से तय होता है।'],
  ['#/hives', 'Every hive shows live health. AI flags disease, swarming or queen loss early.', 'हर छत्ते की लाइव सेहत दिखती है। AI बीमारी, झुंड बनने या रानी खोने की जल्दी चेतावनी देता है।'],
  ['#/ledger', 'Try to forge an old record - the chain breaks at that exact block.', 'पुराना रिकॉर्ड बदलकर देखें - चेन ठीक उसी ब्लॉक पर टूट जाती है।'],
  ['#/rollout', 'A phased plan takes it from a 100-hive pilot to every KVIC cluster.', 'चरणबद्ध योजना 100 छत्तों के पायलट से हर KVIC क्लस्टर तक ले जाती है।'],
]

export default function Tour({ onClose }) {
  const { t, lang } = useSettings()
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(false)
  const step = STEPS[i]

  useEffect(() => { location.hash = step[0] }, [i]) // eslint-disable-line
  useEffect(() => {
    if (!auto) return
    const id = setTimeout(() => (i < STEPS.length - 1 ? setI(i + 1) : onClose()), 6500)
    return () => clearTimeout(id)
  }, [auto, i, onClose])

  return (
    <div className="tour" role="dialog" aria-label="Guided tour">
      <div className="row between"><b className="mono">{i + 1} / {STEPS.length}</b><button className="btn secondary sm" onClick={onClose}>{t('tour.skip')}</button></div>
      <p>{lang === 'hi' ? step[2] : step[1]}</p>
      <div className="row">
        <button className="btn secondary sm" disabled={i === 0} onClick={() => setI(i - 1)}>{t('tour.prev')}</button>
        <button className="btn sm" onClick={() => (i < STEPS.length - 1 ? setI(i + 1) : onClose())}>{t('tour.next')}</button>
        <button className={'btn sm ' + (auto ? '' : 'secondary')} onClick={() => setAuto(!auto)}>{auto ? 'Pause' : 'Play'} · {t('tour.auto')}</button>
      </div>
      <div className="bar"><i style={{ width: ((i + 1) / STEPS.length) * 100 + '%' }} /></div>
    </div>
  )
}
