// Minimal dictionary-based i18n. Missing Hindi keys fall back to English.
export const LANGS = [
  ['en', 'English'],
  ['hi', 'हिन्दी'],
]

const en = {
  'nav.home': 'Home', 'nav.verify': 'Verify Honey', 'nav.harvest': 'New Harvest', 'nav.hives': 'My Hives',
  'nav.lab': 'Lab Tests', 'nav.supply': 'Supply Chain', 'nav.ledger': 'Ledger', 'nav.rollout': 'Rollout Plan', 'nav.more': 'More',
  'group.buyers': 'For buyers', 'group.beekeepers': 'For beekeepers', 'group.partners': 'Lab & supply chain', 'group.authority': 'For authorities',
  'top.search': 'Enter batch ID (e.g. HC-2026-0001)', 'top.tour': 'Guided tour', 'top.settings': 'Settings',
  'chain.ok': 'Ledger safe', 'chk.1': 'Reading batch from the ledger', 'chk.2': 'Verifying block hashes', 'chk.3': 'Checking validator signatures', 'chk.4': 'Matching lab results to limits', 'chk.5': 'Calculating trust score', 'chk.skip': 'Skip', 'home.chain': 'Live from the ledger', 'story.title': 'From hive to jar', 'story.sub': 'Scroll to follow one batch of honey through the system.', 'chain.bad': 'Tampering found',

  'home.hero1': 'Know your honey.', 'home.hero2': 'Trust every drop.',
  'home.sub': 'Scan the QR on the jar to see where the honey came from, whether it passed lab tests, and who handled it.',
  'home.iam': 'What would you like to do?', 'home.iam.sub': 'Pick your role - we will show only what you need.',
  'role.consumer': 'I want to buy honey', 'role.consumer.d': 'Check if a jar is genuine',
  'role.beekeeper': 'I am a beekeeper', 'role.beekeeper.d': 'Watch my hives and register harvests',
  'role.lab': 'I am a lab officer', 'role.lab.d': 'Publish purity test results',
  'role.processor': 'I pack or sell honey', 'role.processor.d': 'Record handovers and packing',
  'role.officer': 'I am KVIC / regulator', 'role.officer.d': 'Audit the ledger and rollout',
  'home.try': 'Try it now', 'home.try.good': 'Scan a genuine jar', 'home.try.bad': 'Scan a fake jar', 'home.try.tour': 'Take the 1-minute tour',
  'home.live': 'Live from the ledger', 'stat.blocks': 'records on chain', 'stat.hives': 'hives registered', 'stat.batches': 'honey batches',
  'stat.kg': 'kg recorded', 'stat.pass': 'passed lab', 'stat.fail': 'fake caught',
  'home.how': 'How it works', 'home.how.sub': 'Six simple steps from hive to jar.',
  'step.1': 'Register', 'step.1d': 'Each bee box gets a digital ID.', 'step.2': 'Sense', 'step.2d': 'Sensors and AI watch colony health.',
  'step.3': 'Harvest', 'step.3d': 'A batch and QR code are created.', 'step.4': 'Certify', 'step.4d': 'A lab records purity results.',
  'step.5': 'Move', 'step.5d': 'Every handover is logged.', 'step.6': 'Verify', 'step.6d': 'Buyers scan and see the truth.',

  'v.title': 'Check a jar of honey', 'v.sub': 'Scan the QR on the label, or type the batch ID.', 'v.placeholder': 'Batch ID, e.g. HC-2026-0001',
  'v.go': 'Check', 'v.scan': 'Scan QR', 'v.stopscan': 'Stop camera', 'v.samples': 'Try a sample', 'v.s.good': 'Genuine', 'v.s.fake': 'Fake', 'v.s.wait': 'Awaiting lab', 'v.s.ok': 'Genuine',
  'v.notfound': 'This batch is not on the ledger. The code may be forged - do not trust this product.',
  'v.integrity': 'The ledger failed its integrity check. Data below may have been tampered with.',
  'verdict.AUTHENTIC': 'Genuine honey - verified', 'verdict.AUTHENTIC.d': 'Origin, lab purity and hive data all check out.',
  'verdict.CAUTION': 'Be careful', 'verdict.CAUTION.d': 'Some proof is missing. See the notes below.',
  'verdict.REJECT': 'Do not buy - failed checks', 'verdict.REJECT.d': 'This batch failed the lab or the trust score is too low.',
  'verdict.PENDING': 'Lab report pending', 'verdict.PENDING.d': 'Harvest is recorded, but no lab result yet.',
  'v.score': 'Trust score', 'v.notes': 'Things to know', 'v.origin': 'Where it came from', 'v.beekeeper': 'Beekeeper', 'v.flora': 'Flowers', 'v.qty': 'Quantity',
  'v.harvested': 'Harvested', 'v.place': 'Place', 'v.hives': 'Hives', 'v.cluster': 'KVIC cluster', 'v.method': 'Method',
  'v.lab': 'Lab purity test', 'v.pass': 'PASS', 'v.fail': 'FAIL', 'v.nolab': 'No lab report yet.', 'v.test': 'Test', 'v.result': 'Result', 'v.limit': 'Limit',
  'v.journey': 'Journey', 'v.details': 'Show technical details', 'v.qr': 'Label QR', 'v.share': 'Copy link', 'v.copied': 'Link copied',

  'h.title': 'New harvest', 'h.sub': 'Create a batch and QR code for your jars in three easy steps.',
  'h.s1': 'Choose hives', 'h.s2': 'Harvest details', 'h.s3': 'Get your QR', 'h.next': 'Next', 'h.back': 'Back', 'h.create': 'Create batch & QR',
  'h.pick': 'Tap the hives this honey came from.', 'h.qty': 'How many kg?', 'h.flora': 'Which flowers? (e.g. Mustard)', 'h.method': 'Extraction method',
  'h.done': 'Batch created!', 'h.done.d': 'Print this QR on every jar. Ask the lab to certify it to unlock a full trust score.', 'h.another': 'Register another harvest', 'h.view': 'See buyer view',
  'h.addhive': 'Add a new hive', 'h.addhive.sub': 'Give a bee box a digital ID.', 'h.register': 'Register hive', 'h.owner': 'Your name', 'h.village': 'Village', 'h.district': 'District', 'h.state': 'State', 'h.clusterf': 'KVIC cluster', 'h.mainflora': 'Main flowers',
  'h.nohive': 'Select at least one hive.',

  'hv.title': 'My hives', 'hv.sub': 'Live health of every bee box. Tap a hive for details.', 'hv.status.ok': 'Healthy', 'hv.status.warn': 'Needs attention', 'hv.status.critical': 'Urgent',
  'hv.back': 'All hives', 'hv.diag': 'What the AI sees', 'hv.confidence': 'confident', 'hv.forecast': '30-day honey forecast', 'hv.expected': 'Expected', 'hv.range': 'Likely range',
  'hv.anchor': 'Save proof on chain', 'hv.anchor.d': 'Locks the last 14 days of sensor data into the ledger so nobody can change it later.', 'hv.probs': 'All possibilities',
  'hv.demo': 'Demo: simulate a problem in this hive', 'hv.live': 'LIVE',
  'm.broodTemp': 'Brood temperature', 'm.humidity': 'Humidity', 'm.weight': 'Hive weight', 'm.soundHz': 'Colony sound', 'm.activity': 'Bees at entrance', 'm.co2': 'CO₂', 'm.ambient': 'Outside temp',

  'l.title': 'Lab tests', 'l.sub': 'Enter results. Pass or fail is decided by the limits and cannot be edited later.', 'l.batch': 'Batch', 'l.lab': 'Laboratory',
  'l.sample': 'Load sample', 'l.genuine': 'Genuine honey', 'l.fake': 'Sugar-adulterated', 'l.submit': 'Save result on chain', 'l.allpass': 'All values within limits - PASS', 'l.select': 'Choose a batch',

  's.title': 'Supply chain', 's.sub': 'Log each handover so buyers can see the full journey.', 's.transfer': 'Hand over to someone', 's.pack': 'Pack for retail',
  's.from': 'From', 's.to': 'To', 's.note': 'Note', 's.bottles': 'Bottles', 's.size': 'Size (g)', 's.retailer': 'Shop / outlet', 's.save': 'Save', 's.recent': 'Recent activity', 's.choose': 'Choose a batch',

  'x.title': 'Ledger', 'x.sub': 'Every record is linked to the one before it and signed by KVIC, FSSAI or a lab node.',
  'x.demo': 'Try to cheat the ledger', 'x.demo.d': 'Secretly change an old record, the way a fraudster would.', 'x.forge': 'Forge an old record', 'x.restore': 'Restore clean ledger',
  'x.valid': 'Chain valid', 'x.showp': 'Show data', 'x.hidep': 'Hide data', 'x.altered': 'DATA ALTERED',

  'd.title': 'Rollout plan',

  'set.title': 'Settings', 'set.lang': 'Language', 'set.theme': 'Theme', 'set.auto': 'Auto', 'set.light': 'Light', 'set.dark': 'Dark', 'set.size': 'Text size',
  'set.motion': 'Animations', 'set.on': 'On', 'set.off': 'Off', 'set.mode': 'Detail level', 'set.simple': 'Simple', 'set.expert': 'Expert', 'set.expert.d': 'Expert shows block hashes and validator details.', 'set.role': 'My role', 'set.reset': 'Reset demo data', 'set.done': 'Done',
  'tour.next': 'Next', 'tour.prev': 'Back', 'tour.skip': 'End tour', 'tour.auto': 'Auto-play',
  'common.close': 'Close',
}

const hi = {
  'nav.home': 'होम', 'nav.verify': 'शहद जाँचें', 'nav.harvest': 'नई फसल', 'nav.hives': 'मेरे छत्ते', 'nav.lab': 'लैब जाँच', 'nav.supply': 'आपूर्ति श्रृंखला', 'nav.ledger': 'बहीखाता', 'nav.rollout': 'विस्तार योजना', 'nav.more': 'और',
  'group.buyers': 'खरीदारों के लिए', 'group.beekeepers': 'मधुमक्खी पालकों के लिए', 'group.partners': 'लैब और आपूर्ति', 'group.authority': 'अधिकारियों के लिए',
  'top.search': 'बैच नंबर लिखें (जैसे HC-2026-0001)', 'top.tour': 'गाइडेड टूर', 'top.settings': 'सेटिंग',
  'chain.ok': 'बहीखाता सुरक्षित', 'chk.1': 'बहीखाते से बैच पढ़ा जा रहा है', 'chk.2': 'ब्लॉक हैश जाँचे जा रहे हैं', 'chk.3': 'वैलिडेटर हस्ताक्षर जाँचे जा रहे हैं', 'chk.4': 'लैब परिणाम सीमाओं से मिलाए जा रहे हैं', 'chk.5': 'भरोसा स्कोर निकाला जा रहा है', 'chk.skip': 'छोड़ें', 'home.chain': 'बहीखाते से सीधा', 'story.title': 'छत्ते से जार तक', 'story.sub': 'शहद के एक बैच का सफ़र देखने के लिए स्क्रॉल करें।', 'chain.bad': 'छेड़छाड़ मिली',

  'home.hero1': 'अपने शहद को जानिए।', 'home.hero2': 'हर बूँद पर भरोसा।',
  'home.sub': 'जार पर लगा QR स्कैन करें और जानें कि शहद कहाँ से आया, लैब जाँच में पास हुआ या नहीं, और किसके हाथों से गुज़रा।',
  'home.iam': 'आप क्या करना चाहते हैं?', 'home.iam.sub': 'अपनी भूमिका चुनें - हम सिर्फ़ ज़रूरी चीज़ें दिखाएँगे।',
  'role.consumer': 'मुझे शहद खरीदना है', 'role.consumer.d': 'जाँचें कि जार असली है',
  'role.beekeeper': 'मैं मधुमक्खी पालक हूँ', 'role.beekeeper.d': 'छत्ते देखें और फसल दर्ज करें',
  'role.lab': 'मैं लैब अधिकारी हूँ', 'role.lab.d': 'शुद्धता जाँच के परिणाम दर्ज करें',
  'role.processor': 'मैं शहद पैक/बेचता हूँ', 'role.processor.d': 'हस्तांतरण और पैकिंग दर्ज करें',
  'role.officer': 'मैं KVIC / नियामक हूँ', 'role.officer.d': 'बहीखाता और विस्तार योजना देखें',
  'home.try': 'अभी आज़माएँ', 'home.try.good': 'असली जार स्कैन करें', 'home.try.bad': 'नकली जार स्कैन करें', 'home.try.tour': '1 मिनट का टूर देखें',
  'home.live': 'बहीखाते से सीधा', 'stat.blocks': 'रिकॉर्ड दर्ज', 'stat.hives': 'छत्ते पंजीकृत', 'stat.batches': 'शहद बैच', 'stat.kg': 'किलो दर्ज', 'stat.pass': 'लैब में पास', 'stat.fail': 'नकली पकड़ा गया',
  'home.how': 'यह कैसे काम करता है', 'home.how.sub': 'छत्ते से जार तक छह आसान चरण।',
  'step.1': 'पंजीकरण', 'step.1d': 'हर बी-बॉक्स को डिजिटल पहचान मिलती है।', 'step.2': 'निगरानी', 'step.2d': 'सेंसर और AI कॉलोनी की सेहत देखते हैं।',
  'step.3': 'कटाई', 'step.3d': 'बैच और QR कोड बनता है।', 'step.4': 'प्रमाणन', 'step.4d': 'लैब शुद्धता परिणाम दर्ज करती है।',
  'step.5': 'आवाजाही', 'step.5d': 'हर हस्तांतरण दर्ज होता है।', 'step.6': 'जाँच', 'step.6d': 'खरीदार स्कैन करके सच्चाई देखते हैं।',

  'v.title': 'शहद के जार की जाँच करें', 'v.sub': 'लेबल पर लगा QR स्कैन करें या बैच नंबर लिखें।', 'v.placeholder': 'बैच नंबर, जैसे HC-2026-0001',
  'v.go': 'जाँचें', 'v.scan': 'QR स्कैन करें', 'v.stopscan': 'कैमरा बंद करें', 'v.samples': 'नमूना आज़माएँ', 'v.s.good': 'असली', 'v.s.fake': 'नकली', 'v.s.wait': 'लैब बाकी', 'v.s.ok': 'असली',
  'v.notfound': 'यह बैच बहीखाते में नहीं है। कोड नकली हो सकता है - इस उत्पाद पर भरोसा न करें।',
  'v.integrity': 'बहीखाते की जाँच फेल हुई। नीचे का डेटा बदला हुआ हो सकता है।',
  'verdict.AUTHENTIC': 'असली शहद - सत्यापित', 'verdict.AUTHENTIC.d': 'स्रोत, लैब शुद्धता और छत्ते का डेटा सब सही है।',
  'verdict.CAUTION': 'सावधानी रखें', 'verdict.CAUTION.d': 'कुछ प्रमाण गायब हैं। नीचे नोट देखें।',
  'verdict.REJECT': 'न खरीदें - जाँच में फेल', 'verdict.REJECT.d': 'यह बैच लैब में फेल हुआ या भरोसा स्कोर बहुत कम है।',
  'verdict.PENDING': 'लैब रिपोर्ट बाकी', 'verdict.PENDING.d': 'फसल दर्ज है, पर लैब परिणाम अभी नहीं आया।',
  'v.score': 'भरोसा स्कोर', 'v.notes': 'ध्यान देने योग्य बातें', 'v.origin': 'कहाँ से आया', 'v.beekeeper': 'मधुमक्खी पालक', 'v.flora': 'फूल', 'v.qty': 'मात्रा',
  'v.harvested': 'कटाई की तारीख', 'v.place': 'स्थान', 'v.hives': 'छत्ते', 'v.cluster': 'KVIC क्लस्टर', 'v.method': 'तरीका',
  'v.lab': 'लैब शुद्धता जाँच', 'v.pass': 'पास', 'v.fail': 'फेल', 'v.nolab': 'अभी लैब रिपोर्ट नहीं है।', 'v.test': 'जाँच', 'v.result': 'परिणाम', 'v.limit': 'सीमा',
  'v.journey': 'सफ़र', 'v.details': 'तकनीकी विवरण दिखाएँ', 'v.qr': 'लेबल QR', 'v.share': 'लिंक कॉपी करें', 'v.copied': 'लिंक कॉपी हुआ',

  'h.title': 'नई फसल', 'h.sub': 'तीन आसान चरणों में अपने जार के लिए बैच और QR बनाएँ।',
  'h.s1': 'छत्ते चुनें', 'h.s2': 'फसल का विवरण', 'h.s3': 'QR पाएँ', 'h.next': 'आगे', 'h.back': 'पीछे', 'h.create': 'बैच और QR बनाएँ',
  'h.pick': 'जिन छत्तों से यह शहद आया, उन्हें छुएँ।', 'h.qty': 'कितने किलो?', 'h.flora': 'कौन से फूल? (जैसे सरसों)', 'h.method': 'शहद निकालने का तरीका',
  'h.done': 'बैच बन गया!', 'h.done.d': 'यह QR हर जार पर छापें। पूरा भरोसा स्कोर पाने के लिए लैब से प्रमाणन करवाएँ।', 'h.another': 'एक और फसल दर्ज करें', 'h.view': 'खरीदार का दृश्य देखें',
  'h.addhive': 'नया छत्ता जोड़ें', 'h.addhive.sub': 'बी-बॉक्स को डिजिटल पहचान दें।', 'h.register': 'छत्ता पंजीकृत करें', 'h.owner': 'आपका नाम', 'h.village': 'गाँव', 'h.district': 'ज़िला', 'h.state': 'राज्य', 'h.clusterf': 'KVIC क्लस्टर', 'h.mainflora': 'मुख्य फूल',
  'h.nohive': 'कम से कम एक छत्ता चुनें।',

  'hv.title': 'मेरे छत्ते', 'hv.sub': 'हर बी-बॉक्स की लाइव सेहत। विवरण के लिए छत्ते को छुएँ।', 'hv.status.ok': 'स्वस्थ', 'hv.status.warn': 'ध्यान दें', 'hv.status.critical': 'तुरंत ध्यान दें',
  'hv.back': 'सभी छत्ते', 'hv.diag': 'AI क्या देख रहा है', 'hv.confidence': 'भरोसा', 'hv.forecast': '30 दिन का शहद अनुमान', 'hv.expected': 'अपेक्षित', 'hv.range': 'संभावित सीमा',
  'hv.anchor': 'प्रमाण चेन पर सहेजें', 'hv.anchor.d': 'पिछले 14 दिनों का सेंसर डेटा बहीखाते में बंद हो जाता है ताकि कोई बदल न सके।', 'hv.probs': 'सभी संभावनाएँ',
  'hv.demo': 'डेमो: इस छत्ते में समस्या दिखाएँ', 'hv.live': 'लाइव',
  'm.broodTemp': 'ब्रूड तापमान', 'm.humidity': 'नमी', 'm.weight': 'छत्ते का वज़न', 'm.soundHz': 'कॉलोनी की आवाज़', 'm.activity': 'प्रवेश द्वार पर मधुमक्खियाँ', 'm.co2': 'CO₂', 'm.ambient': 'बाहर का तापमान',

  'l.title': 'लैब जाँच', 'l.sub': 'परिणाम भरें। पास/फेल सीमाओं से तय होता है और बाद में बदला नहीं जा सकता।', 'l.batch': 'बैच', 'l.lab': 'प्रयोगशाला',
  'l.sample': 'नमूना भरें', 'l.genuine': 'असली शहद', 'l.fake': 'चीनी मिला शहद', 'l.submit': 'परिणाम चेन पर सहेजें', 'l.allpass': 'सभी मान सीमा में - पास', 'l.select': 'बैच चुनें',

  's.title': 'आपूर्ति श्रृंखला', 's.sub': 'हर हस्तांतरण दर्ज करें ताकि खरीदार पूरा सफ़र देख सकें।', 's.transfer': 'किसी को सौंपें', 's.pack': 'खुदरा पैकिंग',
  's.from': 'किससे', 's.to': 'किसको', 's.note': 'टिप्पणी', 's.bottles': 'बोतलें', 's.size': 'आकार (ग्राम)', 's.retailer': 'दुकान / आउटलेट', 's.save': 'सहेजें', 's.recent': 'हाल की गतिविधि', 's.choose': 'बैच चुनें',

  'x.title': 'बहीखाता', 'x.sub': 'हर रिकॉर्ड पिछले से जुड़ा है और KVIC, FSSAI या लैब नोड द्वारा हस्ताक्षरित है।',
  'x.demo': 'बहीखाते को धोखा देकर देखें', 'x.demo.d': 'किसी पुराने रिकॉर्ड को चुपके से बदलें, जैसा धोखेबाज़ करता।', 'x.forge': 'पुराना रिकॉर्ड बदलें', 'x.restore': 'साफ़ बहीखाता बहाल करें',
  'x.valid': 'चेन सही', 'x.showp': 'डेटा दिखाएँ', 'x.hidep': 'डेटा छिपाएँ', 'x.altered': 'डेटा बदला गया',

  'd.title': 'विस्तार योजना',

  'set.title': 'सेटिंग', 'set.lang': 'भाषा', 'set.theme': 'थीम', 'set.auto': 'ऑटो', 'set.light': 'हल्की', 'set.dark': 'गहरी', 'set.size': 'अक्षर का आकार',
  'set.motion': 'एनिमेशन', 'set.on': 'चालू', 'set.off': 'बंद', 'set.mode': 'विवरण का स्तर', 'set.simple': 'सरल', 'set.expert': 'विशेषज्ञ', 'set.expert.d': 'विशेषज्ञ मोड में ब्लॉक हैश और वैलिडेटर विवरण दिखते हैं।', 'set.role': 'मेरी भूमिका', 'set.reset': 'डेमो डेटा रीसेट करें', 'set.done': 'हो गया',
  'tour.next': 'आगे', 'tour.prev': 'पीछे', 'tour.skip': 'टूर बंद करें', 'tour.auto': 'ऑटो-प्ले',
  'common.close': 'बंद करें',
}

export const DICT = { en, hi }
export const translate = (lang, key) => (DICT[lang] && DICT[lang][key]) || en[key] || key
