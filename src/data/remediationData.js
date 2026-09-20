// Remediation datasets for Phonics (Word Snapper) and Visual Discrimination (Letter Hunter)
// Strict language segregation: English and Bengali ONLY

export const WORD_SNAPPER_DATA = [
  // ===================== ENGLISH WORDS =====================
  {
    id: 'ws_bat',
    language: 'english',
    word: 'bat',
    targetLetter: 'b',
    confusingAlternatives: ['d', 'p'],
    emoji: '🦇',
    meaning: 'A flying bat or cricket bat',
    phonemes: ['/b/', '/æ/', '/t/'],
    letters: ['b', 'a', 't'],
    letterDetails: [
      { char: 'b', isTarget: true, mnemonic: 'b has a tall stick with a round belly in front (➡️)' },
      { char: 'a', isTarget: false },
      { char: 't', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_dog',
    language: 'english',
    word: 'dog',
    targetLetter: 'd',
    confusingAlternatives: ['b', 'q'],
    emoji: '🐶',
    meaning: 'A friendly pet dog',
    phonemes: ['/d/', '/ɒ/', '/ɡ/'],
    letters: ['d', 'o', 'g'],
    letterDetails: [
      { char: 'd', isTarget: true, mnemonic: 'd has a round diaper behind, then a tall stick (⬅️)' },
      { char: 'o', isTarget: false },
      { char: 'g', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_pig',
    language: 'english',
    word: 'pig',
    targetLetter: 'p',
    confusingAlternatives: ['q', 'b', 'd'],
    emoji: '🐷',
    meaning: 'A cute pink pig',
    phonemes: ['/p/', '/ɪ/', '/ɡ/'],
    letters: ['p', 'i', 'g'],
    letterDetails: [
      { char: 'p', isTarget: true, mnemonic: 'p goes down below the line with a bubble on top-right (⬇️)' },
      { char: 'i', isTarget: false },
      { char: 'g', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_bed',
    language: 'english',
    word: 'bed',
    targetLetter: 'b & d',
    confusingAlternatives: ['p', 'q'],
    emoji: '🛏️',
    meaning: 'A cozy bed (starts with b, ends with d)',
    phonemes: ['/b/', '/e/', '/d/'],
    letters: ['b', 'e', 'd'],
    letterDetails: [
      { char: 'b', isTarget: true, mnemonic: 'b: head of the bed (left)' },
      { char: 'e', isTarget: false },
      { char: 'd', isTarget: true, mnemonic: 'd: foot of the bed (right)' }
    ],
    difficulty: 'medium'
  },
  {
    id: 'ws_queen',
    language: 'english',
    word: 'queen',
    targetLetter: 'q',
    confusingAlternatives: ['p', 'd', 'b'],
    emoji: '👑',
    meaning: 'A royal queen with a crown',
    phonemes: ['/k/', '/w/', '/iː/', '/n/'],
    letters: ['q', 'u', 'e', 'e', 'n'],
    letterDetails: [
      { char: 'q', isTarget: true, mnemonic: 'q has a round face with a curly ponytail hanging down (⬇️)' },
      { char: 'u', isTarget: false },
      { char: 'e', isTarget: false },
      { char: 'e', isTarget: false },
      { char: 'n', isTarget: false }
    ],
    difficulty: 'medium'
  },
  {
    id: 'ws_duck',
    language: 'english',
    word: 'duck',
    targetLetter: 'd',
    confusingAlternatives: ['b', 'p'],
    emoji: '🦆',
    meaning: 'A quacking duck swimming in the pond',
    phonemes: ['/d/', '/ʌ/', '/k/'],
    letters: ['d', 'u', 'c', 'k'],
    letterDetails: [
      { char: 'd', isTarget: true, mnemonic: 'd looks like a duck standing tall (⬅️)' },
      { char: 'u', isTarget: false },
      { char: 'c', isTarget: false },
      { char: 'k', isTarget: false }
    ],
    difficulty: 'medium'
  },
  {
    id: 'ws_pin',
    language: 'english',
    word: 'pin',
    targetLetter: 'p',
    confusingAlternatives: ['q', 'b'],
    emoji: '📍',
    meaning: 'A shiny safety pin',
    phonemes: ['/p/', '/ɪ/', '/n/'],
    letters: ['p', 'i', 'n'],
    letterDetails: [
      { char: 'p', isTarget: true, mnemonic: 'p has a straight pin hanging low' },
      { char: 'i', isTarget: false },
      { char: 'n', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_bird',
    language: 'english',
    word: 'bird',
    targetLetter: 'b & d',
    confusingAlternatives: ['p', 'q'],
    emoji: '🐦',
    meaning: 'A singing blue bird',
    phonemes: ['/b/', '/ɜː/', '/d/'],
    letters: ['b', 'i', 'r', 'd'],
    letterDetails: [
      { char: 'b', isTarget: true, mnemonic: 'b has a belly in front' },
      { char: 'i', isTarget: false },
      { char: 'r', isTarget: false },
      { char: 'd', isTarget: true, mnemonic: 'd has a diaper in back' }
    ],
    difficulty: 'hard'
  },

  // ===================== BENGALI WORDS =====================
  {
    id: 'ws_bn_boi',
    language: 'bengali',
    word: 'বই',
    targetLetter: 'ব',
    confusingAlternatives: ['র', 'ক'],
    emoji: '📖',
    meaning: 'পড়ার বই (Book)',
    phonemes: ['/bɔ/', '/i/'],
    letters: ['ব', 'ই'],
    letterDetails: [
      { char: 'ব', isTarget: true, mnemonic: 'ব বর্ণটি কোনো বিন্দু ছাড়া সোজা ত্রিকোণ গঠন' },
      { char: 'ই', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_bn_jol',
    language: 'bengali',
    word: 'জল',
    targetLetter: 'জ',
    confusingAlternatives: ['ড়', 'দ'],
    emoji: '💧',
    meaning: 'পানীয় জল (Water)',
    phonemes: ['/dʒɔ/', '/l/'],
    letters: ['জ', 'ল'],
    letterDetails: [
      { char: 'জ', isTarget: true, mnemonic: 'জ বর্ণটিতে ওপরের মাত্রা ও নিচের বাঁক লক্ষ্য করো' },
      { char: 'ল', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_bn_fol',
    language: 'bengali',
    word: 'ফল',
    targetLetter: 'ফ',
    confusingAlternatives: ['ক', 'ধ'],
    emoji: '🍎',
    meaning: 'মিষ্টি পাকা ফল (Fruit)',
    phonemes: ['/pʰɔ/', '/l/'],
    letters: ['ফ', 'ল'],
    letterDetails: [
      { char: 'ফ', isTarget: true, mnemonic: 'ফ বর্ণটির ডানদিকের লেজটি লক্ষ্য করো' },
      { char: 'ল', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_bn_kolom',
    language: 'bengali',
    word: 'কলম',
    targetLetter: 'ক',
    confusingAlternatives: ['ধ', 'ব'],
    emoji: '✒️',
    meaning: 'লেখার কলম (Pen)',
    phonemes: ['/kɔ/', '/lɔ/', '/m/'],
    letters: ['ক', 'ল', 'ম'],
    letterDetails: [
      { char: 'ক', isTarget: true, mnemonic: 'ক বর্ণে রয়েছে বাঁকানো গোলক লুপ' },
      { char: 'ল', isTarget: false },
      { char: 'ম', isTarget: false }
    ],
    difficulty: 'medium'
  },
  {
    id: 'ws_bn_ful',
    language: 'bengali',
    word: 'ফুল',
    targetLetter: 'ফ',
    confusingAlternatives: ['ক', 'ব'],
    emoji: '🌸',
    meaning: 'সুন্দর রঙিন ফুল (Flower)',
    phonemes: ['/pʰu/', '/l/'],
    letters: ['ফ', 'ু', 'ল'],
    letterDetails: [
      { char: 'ফ', isTarget: true, mnemonic: 'ফ বর্ণটির সঙ্গে হ্রস্ব-উ কার' },
      { char: 'ু', isTarget: false },
      { char: 'ল', isTarget: false }
    ],
    difficulty: 'medium'
  },

  // ===================== HINDI WORDS =====================
  {
    id: 'ws_hi_ghar',
    language: 'hindi',
    word: 'घर',
    targetLetter: 'घ',
    confusingAlternatives: ['ध', 'ब'],
    emoji: '🏠',
    meaning: 'घर (House)',
    phonemes: ['/ɡʱ/', '/r/'],
    letters: ['घ', 'र'],
    letterDetails: [
      { char: 'घ', isTarget: true, mnemonic: 'घ पर पूरी शिरोरेखा होती है!' },
      { char: 'र', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_hi_fal',
    language: 'hindi',
    word: 'फल',
    targetLetter: 'फ',
    confusingAlternatives: ['क', 'प'],
    emoji: '🍎',
    meaning: 'स्वादिष्ट फल (Fruit)',
    phonemes: ['/pʰ/', '/l/'],
    letters: ['फ', 'ल'],
    letterDetails: [
      { char: 'फ', isTarget: true, mnemonic: 'फ की दाईं ओर पूंछ नीचे लटकती है!' },
      { char: 'ल', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_hi_jal',
    language: 'hindi',
    word: 'जल',
    targetLetter: 'ज',
    confusingAlternatives: ['द', 'ग'],
    emoji: '💧',
    meaning: 'पीने का जल (Water)',
    phonemes: ['/dʒ/', '/l/'],
    letters: ['ज', 'ल'],
    letterDetails: [
      { char: 'ज', isTarget: true, mnemonic: 'ज का गोल घुमाव ऊपर उठता है!' },
      { char: 'ल', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_hi_kamal',
    language: 'hindi',
    word: 'कमल',
    targetLetter: 'क',
    confusingAlternatives: ['ध', 'भ'],
    emoji: '🪷',
    meaning: 'कमल का फूल (Lotus)',
    phonemes: ['/k/', '/m/', '/l/'],
    letters: ['क', 'म', 'ल'],
    letterDetails: [
      { char: 'क', isTarget: true, mnemonic: 'क में पूरा घेरा और लटकी पूंछ होती है!' },
      { char: 'म', isTarget: false },
      { char: 'ल', isTarget: false }
    ],
    difficulty: 'medium'
  },
  {
    id: 'ws_hi_bas',
    language: 'hindi',
    word: 'बस',
    targetLetter: 'ब',
    confusingAlternatives: ['भ', 'व'],
    emoji: '🚌',
    meaning: 'सवारी बस (Bus)',
    phonemes: ['/b/', '/s/'],
    letters: ['ब', 'स'],
    letterDetails: [
      { char: 'ब', isTarget: true, mnemonic: 'ब के पेट में तिरछी लकीर होती है, व में खाली!' },
      { char: 'स', isTarget: false }
    ],
    difficulty: 'easy'
  },
  {
    id: 'ws_hi_dhan',
    language: 'hindi',
    word: 'धन',
    targetLetter: 'ध',
    confusingAlternatives: ['घ', 'म'],
    emoji: '💰',
    meaning: 'धन या संपत्ति (Wealth)',
    phonemes: ['/d̪ʱ/', '/n/'],
    letters: ['ध', 'न'],
    letterDetails: [
      { char: 'ध', isTarget: true, mnemonic: 'ध के शीर्ष पर घुंडी होती है और शिरोरेखा टूटती है!' },
      { char: 'न', isTarget: false }
    ],
    difficulty: 'easy'
  }
];

export const LETTER_HUNTER_SETS = [
  // ===================== ENGLISH SETS =====================
  {
    id: 'set_bd',
    language: 'english',
    name: 'b vs d (Mirror Reversals)',
    target: 'b',
    distractors: ['d', 'p', 'q'],
    description: 'Hunt for letter "b" while avoiding "d", "p", and "q"!',
    targetCount: 5,
    gridSize: 16,
    hint: 'Look for the letter with a straight stick and a belly on the RIGHT (➡️ b)'
  },
  {
    id: 'set_db',
    language: 'english',
    name: 'd vs b (Backpack Reversals)',
    target: 'd',
    distractors: ['b', 'q', 'p'],
    description: 'Hunt for letter "d" among deceptive "b"s and "q"s!',
    targetCount: 6,
    gridSize: 16,
    hint: 'Look for the round diaper on the LEFT followed by a tall stick (⬅️ d)'
  },
  {
    id: 'set_pq',
    language: 'english',
    name: 'p vs q (Downward Inversions)',
    target: 'p',
    distractors: ['q', 'b', 'd'],
    description: 'Hunt for letter "p" among curly "q"s and tall letters!',
    targetCount: 5,
    gridSize: 16,
    hint: 'p drops DOWN with a bubble on top right (p ⬇️)'
  },
  {
    id: 'set_qp',
    language: 'english',
    name: 'q vs p (Queen Curl Inversions)',
    target: 'q',
    distractors: ['p', 'd', 'b'],
    description: 'Hunt for letter "q" with its ponytail hook!',
    targetCount: 5,
    gridSize: 16,
    hint: 'q drops DOWN with a round head on the left (q ⬇️)'
  },
  {
    id: 'set_mw',
    language: 'english',
    name: 'm vs w (Rotational Flips)',
    target: 'm',
    distractors: ['w', 'n', 'u', 'v'],
    description: 'Hunt for letter "m" (two arches standing up)!',
    targetCount: 6,
    gridSize: 16,
    hint: 'm has two hills on top; w is upside down!'
  },

  // ===================== BENGALI SETS =====================
  {
    id: 'set_bengali_ba_ra',
    language: 'bengali',
    name: 'ব vs র (বিন্দু বিভ্রান্তি)',
    target: 'ব',
    distractors: ['র', 'ক', 'ধ'],
    description: 'নিচের বিন্দু ছাড়া "ব" বর্ণটি খুঁজে বের করো!',
    targetCount: 5,
    gridSize: 16,
    hint: 'ব বর্ণে নিচে কোনো বিন্দু থাকে না; র বর্ণে নিচে বিন্দু থাকে!'
  },
  {
    id: 'set_bengali_ka_dha',
    language: 'bengali',
    name: 'ক vs ধ / ঝ (লুপ বিভ্রান্তি)',
    target: 'ক',
    distractors: ['ধ', 'ঝ', 'ব', 'র'],
    description: 'মাত্রা ও বাঁকানো লুপযুক্ত "ক" বর্ণটি খুঁজে বের করো!',
    targetCount: 5,
    gridSize: 16,
    hint: 'ক বর্ণে পুরো মাত্রা ও গোল লুপ থাকে!'
  },
  {
    id: 'set_bengali_da_rra',
    language: 'bengali',
    name: 'ড vs ড় / ট (ফ্ল্যাপ বিভ্রান্তি)',
    target: 'ড',
    distractors: ['ড়', 'ট', 'ঢ়', 'দ'],
    description: 'বিন্দু ছাড়া "ড" বর্ণটি খুঁজে বের করো!',
    targetCount: 6,
    gridSize: 16,
    hint: 'ড বর্ণে নিচে কোনো বিন্দু থাকে না!'
  },
  {
    id: 'set_bengali_na_nna',
    language: 'bengali',
    name: 'ন vs ণ (দন্ত্য-ন বনাম মূর্ধন্য-ণ)',
    target: 'ন',
    distractors: ['ণ', 'ল', 'প', 'গ'],
    description: 'পূর্ণ মাত্রাযুক্ত "ন" বর্ণটি খুঁজে বের করো!',
    targetCount: 5,
    gridSize: 16,
    hint: 'দন্ত্য-ন বর্ণে পুরো মাত্রা থাকে; মূর্ধন্য-ণ তে অর্ধমাত্রা থাকে!'
  },

  // ===================== HINDI SETS =====================
  {
    id: 'set_hindi_ba_bha',
    language: 'hindi',
    name: 'ब vs भ (पेट कटी रेखा vs घुंडी)',
    target: 'ब',
    distractors: ['भ', 'व', 'क'],
    description: 'पेट कटी तिरछी लकीर वाला "ब" अक्षर खोजें!',
    targetCount: 5,
    gridSize: 16,
    hint: 'ब के पेट में तिरछी लकीर होती है, भ ऊपर से घुंडीदार होता है!'
  },
  {
    id: 'set_hindi_da_dha',
    language: 'hindi',
    name: 'द vs ध (पूंछ vs घुंडी)',
    target: 'द',
    distractors: ['ध', 'घ', 'छ'],
    description: 'नीचे छोटी पूंछ वाला "द" अक्षर पहचानें!',
    targetCount: 5,
    gridSize: 16,
    hint: 'द के नीचे छोटी पूंछ निकलती है, ध पर कटी शिरोरेखा और घुंडी होती है!'
  },
  {
    id: 'set_hindi_gh_dh',
    language: 'hindi',
    name: 'घ vs ध (शिरोरेखा भेद)',
    target: 'घ',
    distractors: ['ध', 'छ', 'ख'],
    description: 'पूरी शिरोरेखा वाला "घ" अक्षर खोजें!',
    targetCount: 5,
    gridSize: 16,
    hint: 'घ पर पूरी सीधी शिरोरेखा होती है!'
  },
  {
    id: 'set_hindi_pa_sha',
    language: 'hindi',
    name: 'प vs ष (पेट में लकीर)',
    target: 'प',
    distractors: ['ष', 'य', 'फ'],
    description: 'बिना पेट कटी लकीर वाला सादा "प" खोजें!',
    targetCount: 5,
    gridSize: 16,
    hint: 'प का पेट खुला और सादा होता है!'
  }
];
