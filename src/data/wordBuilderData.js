/**
 * wordBuilderData.js
 * ==================
 * Single source of truth for the Word Builder activity.
 *
 * STRICT RULE: Language content is FULLY ISOLATED per key.
 * The game engine must NEVER fall back to another language.
 * If a language key is missing, show a "not available" state.
 *
 * Supported language ids (must match SUPPORTED_LANGUAGES in languages.js):
 *   'english' | 'bengali'
 *
 * Word object shape:
 * {
 *   id: string          — unique, stable
 *   word: string        — display word
 *   letters: string[]   — ordered characters (grapheme clusters for Bengali)
 *   confusingAlternatives: string[]  — distractors added to tile bank
 *   emoji: string       — picture clue
 *   meaning: string     — short native-language description
 *   difficulty: 'easy' | 'medium' | 'hard'
 *   letterDetails: [{ char, isTarget, mnemonic? }]
 * }
 */

// ─── English ──────────────────────────────────────────────────────────────────

const EN_WORDS = [
  {
    id: 'en_bat',
    word: 'bat',
    letters: ['b', 'a', 't'],
    confusingAlternatives: ['d', 'p'],
    emoji: '🦇',
    meaning: 'A flying bat',
    difficulty: 'easy',
    letterDetails: [
      { char: 'b', isTarget: true,  mnemonic: 'b: stick LEFT, belly RIGHT ➡️' },
      { char: 'a', isTarget: false },
      { char: 't', isTarget: false }
    ]
  },
  {
    id: 'en_dog',
    word: 'dog',
    letters: ['d', 'o', 'g'],
    confusingAlternatives: ['b', 'q'],
    emoji: '🐶',
    meaning: 'A friendly pet dog',
    difficulty: 'easy',
    letterDetails: [
      { char: 'd', isTarget: true,  mnemonic: 'd: belly LEFT, stick RIGHT ⬅️' },
      { char: 'o', isTarget: false },
      { char: 'g', isTarget: false }
    ]
  },
  {
    id: 'en_pig',
    word: 'pig',
    letters: ['p', 'i', 'g'],
    confusingAlternatives: ['q', 'b', 'd'],
    emoji: '🐷',
    meaning: 'A cute pink pig',
    difficulty: 'easy',
    letterDetails: [
      { char: 'p', isTarget: true,  mnemonic: 'p: tail hangs DOWN with bubble top-right ⬇️' },
      { char: 'i', isTarget: false },
      { char: 'g', isTarget: false }
    ]
  },
  {
    id: 'en_bed',
    word: 'bed',
    letters: ['b', 'e', 'd'],
    confusingAlternatives: ['p', 'q'],
    emoji: '🛏️',
    meaning: 'A cozy bed',
    difficulty: 'medium',
    letterDetails: [
      { char: 'b', isTarget: true,  mnemonic: 'b is the HEAD of the bed (left side)' },
      { char: 'e', isTarget: false },
      { char: 'd', isTarget: true,  mnemonic: 'd is the FOOT of the bed (right side)' }
    ]
  },
  {
    id: 'en_pin',
    word: 'pin',
    letters: ['p', 'i', 'n'],
    confusingAlternatives: ['q', 'b'],
    emoji: '📍',
    meaning: 'A shiny pin',
    difficulty: 'easy',
    letterDetails: [
      { char: 'p', isTarget: true,  mnemonic: 'p has a pin that hangs low below the line' },
      { char: 'i', isTarget: false },
      { char: 'n', isTarget: false }
    ]
  },
  {
    id: 'en_duck',
    word: 'duck',
    letters: ['d', 'u', 'c', 'k'],
    confusingAlternatives: ['b', 'p'],
    emoji: '🦆',
    meaning: 'A quacking duck',
    difficulty: 'medium',
    letterDetails: [
      { char: 'd', isTarget: true,  mnemonic: 'd stands tall like a duck ⬅️' },
      { char: 'u', isTarget: false },
      { char: 'c', isTarget: false },
      { char: 'k', isTarget: false }
    ]
  },
  {
    id: 'en_bird',
    word: 'bird',
    letters: ['b', 'i', 'r', 'd'],
    confusingAlternatives: ['p', 'q'],
    emoji: '🐦',
    meaning: 'A singing bird',
    difficulty: 'hard',
    letterDetails: [
      { char: 'b', isTarget: true,  mnemonic: 'b: belly in FRONT' },
      { char: 'i', isTarget: false },
      { char: 'r', isTarget: false },
      { char: 'd', isTarget: true,  mnemonic: 'd: belly in BACK' }
    ]
  },
  {
    id: 'en_queen',
    word: 'queen',
    letters: ['q', 'u', 'e', 'e', 'n'],
    confusingAlternatives: ['p', 'd', 'b'],
    emoji: '👑',
    meaning: 'A royal queen',
    difficulty: 'medium',
    letterDetails: [
      { char: 'q', isTarget: true,  mnemonic: 'q: round head with a ponytail hanging DOWN ⬇️' },
      { char: 'u', isTarget: false },
      { char: 'e', isTarget: false },
      { char: 'e', isTarget: false },
      { char: 'n', isTarget: false }
    ]
  }
];

// ─── Bengali ──────────────────────────────────────────────────────────────────

const BN_WORDS = [
  {
    id: 'bn_boi',
    word: 'বই',
    letters: ['ব', 'ই'],
    confusingAlternatives: ['র', 'ক'],
    emoji: '📖',
    meaning: 'পড়ার বই',
    difficulty: 'easy',
    letterDetails: [
      { char: 'ব', isTarget: true,  mnemonic: 'ব — নিচে কোনো বিন্দু নেই, সোজা ত্রিকোণ গঠন' },
      { char: 'ই', isTarget: false }
    ]
  },
  {
    id: 'bn_jol',
    word: 'জল',
    letters: ['জ', 'ল'],
    confusingAlternatives: ['ড়', 'দ'],
    emoji: '💧',
    meaning: 'পানীয় জল',
    difficulty: 'easy',
    letterDetails: [
      { char: 'জ', isTarget: true,  mnemonic: 'জ — ওপরের মাত্রা ও নিচের বাঁক লক্ষ্য করো' },
      { char: 'ল', isTarget: false }
    ]
  },
  {
    id: 'bn_fol',
    word: 'ফল',
    letters: ['ফ', 'ল'],
    confusingAlternatives: ['ক', 'ধ'],
    emoji: '🍎',
    meaning: 'মিষ্টি পাকা ফল',
    difficulty: 'easy',
    letterDetails: [
      { char: 'ফ', isTarget: true,  mnemonic: 'ফ — ডানদিকের লেজটি লক্ষ্য করো' },
      { char: 'ল', isTarget: false }
    ]
  },
  {
    id: 'bn_kolom',
    word: 'কলম',
    letters: ['ক', 'ল', 'ম'],
    confusingAlternatives: ['ধ', 'ব'],
    emoji: '✒️',
    meaning: 'লেখার কলম',
    difficulty: 'medium',
    letterDetails: [
      { char: 'ক', isTarget: true,  mnemonic: 'ক — বাঁকানো গোলক লুপ' },
      { char: 'ল', isTarget: false },
      { char: 'ম', isTarget: false }
    ]
  },
  {
    id: 'bn_ful',
    word: 'ফুল',
    letters: ['ফ', 'ু', 'ল'],
    confusingAlternatives: ['ক', 'ব'],
    emoji: '🌸',
    meaning: 'সুন্দর রঙিন ফুল',
    difficulty: 'medium',
    letterDetails: [
      { char: 'ফ', isTarget: true,  mnemonic: 'ফ — ডানদিকের লেজ এবং হ্রস্ব-উ কার' },
      { char: 'ু', isTarget: false },
      { char: 'ল', isTarget: false }
    ]
  },
  {
    id: 'bn_pata',
    word: 'পাতা',
    letters: ['প', 'া', 'ত', 'া'],
    confusingAlternatives: ['ব', 'ক'],
    emoji: '🍃',
    meaning: 'সবুজ পাতা',
    difficulty: 'medium',
    letterDetails: [
      { char: 'প', isTarget: true,  mnemonic: 'প — বাঁদিকের লুপ ও নিচের পা' },
      { char: 'া', isTarget: false },
      { char: 'ত', isTarget: false },
      { char: 'া', isTarget: false }
    ]
  }
];

// ─── Session size by grade ────────────────────────────────────────────────────

/**
 * Returns how many words to include in one finite session.
 * kg / grade1 → 2 words (ages 4–6, short attention span)
 * grade2       → 3 words (age 7)
 * grade3+      → 4 words (ages 8+)
 */
export function getSessionWordCount(grade) {
  if (grade === 'kg' || grade === 'grade1') return 2;
  if (grade === 'grade2') return 3;
  return 4; // grade3, grade4
}

// ─── Main content map ─────────────────────────────────────────────────────────

/**
 * WORD_BUILDER_CONTENT
 * Each key is a language id matching SUPPORTED_LANGUAGES.
 * The game engine reads ONLY from the active language key.
 * NO fallback to another language is ever performed.
 */
export const WORD_BUILDER_CONTENT = {
  english: {
    // ── Localised UI strings ───────────────────────────────────────────────
    ui: {
      backBtn:          'Games Hub',
      wordOf:           (curr, total) => `Word ${curr} of ${total}`,
      starsLabel:       'Stars',
      buildPrompt:      (word) => `Can you build the word "${word.toUpperCase()}"? Watch out for tricky letters!`,
      hearSoundBtn:     'Hear Sound',
      hideHintBtn:      'Hide Hint',
      showHintBtn:      'Show Hint',
      tilesInstruction: '🧩 Tap or drag the letters into the slots above:',
      hintLabel:        'Visual Letter Guide:',
      hintFallback:     'Look at the stick and circle position!',
      slotTitle:        (i) => `Slot ${i + 1}: tap to remove`,
      slotEmpty:        (i) => `Slot ${i + 1}`,
      nextWordBtn:      'Next Word 🚀',
      // Success / failure feedback
      successMsg:       (word) => `Superstar! You spelled "${word.toUpperCase()}" perfectly! ⭐`,
      successSpeak:     (word) => `${word}! Great job!`,
      retryMsg:         'Almost there! Check the letter shapes closely. Tap a letter to swap it!',
      retrySpeak:       'Look closely at the letter shapes!',
      initMsg:          (word) => `Can you build the word "${word.toUpperCase()}"? Watch out for tricky letters!`,
      // Help modal
      helpBtn:          'Help Me',
      helpTitle:        'Let\'s look carefully!',
      helpHearBtn:      'Hear Sound',
      helpCloseBtn:     'Got it! Let\'s try again',
      helpHintFallback: 'Watch the direction of the stick and circle!',
      // Completion screen
      completionTitle:   '🎉 Great Job!',
      completionSub:     'You completed today\'s Word Builder!',
      starsEarnedLabel:  'Stars Earned',
      wordsBuiltLabel:   'Words Built',
      practicedTitle:    'You practiced today:',
      practiceItems: [
        '✓ Letter shape recognition',
        '✓ b / d / p / q sound-spelling links',
        '✓ Word building confidence'
      ],
      btnPracticeAgain:     '🌟 Practice Again',
      btnContinueLearning:  '📚 Continue Learning',
      btnBackHome:          '🏠 Back Home',
      // Audio unavailable
      audioUnavailable:  '🔇 Audio unavailable'
    },
    // ── Audio locale ───────────────────────────────────────────────────────
    speechLang: 'en-IN',     // BCP-47; fallback: 'en-US'
    speechLangFallback: 'en-US',
    // ── Word pool ──────────────────────────────────────────────────────────
    words: EN_WORDS
  },

  bengali: {
    // ── Localised UI strings ───────────────────────────────────────────────
    ui: {
      backBtn:          'গেমস হাব',
      wordOf:           (curr, total) => `শব্দ ${curr} / ${total}`,
      starsLabel:       'স্টার',
      buildPrompt:      (word) => `তুমি কি "${word}" শব্দটি তৈরি করতে পারবে? সঠিক বর্ণগুলো সাজাও!`,
      hearSoundBtn:     'উচ্চারণ শুনো',
      hideHintBtn:      'ইঙ্গিত লুকাও',
      showHintBtn:      'ইঙ্গিত দেখো',
      tilesInstruction: '🧩 নিচের বর্ণগুলো উপরের ঘরে সাজাও:',
      hintLabel:        'বর্ণ চেনার সহায়িকা:',
      hintFallback:     'বর্ণের রূপ ভালোভাবে পর্যবেক্ষণ করো!',
      slotTitle:        (i) => `ঘর ${i + 1}: সরাতে ট্যাপ করো`,
      slotEmpty:        (i) => `#${i + 1}`,
      nextWordBtn:      'পরবর্তী শব্দ 🚀',
      // Success / failure feedback
      successMsg:       (word) => `দারুণ! তুমি "${word}" শব্দটি সঠিকভাবে তৈরি করেছ! ⭐`,
      successSpeak:     (word) => `${word}! খুব সুন্দর হয়েছে!`,
      retryMsg:         'খুব কাছাকাছি! বর্ণের আকৃতিগুলি ভালো করে লক্ষ্য করো এবং ঠিক করে সাজাও!',
      retrySpeak:       'বর্ণের আকার ভালো করে দেখো!',
      initMsg:          (word) => `তুমি কি "${word}" শব্দটি তৈরি করতে পারবে? সঠিক বর্ণগুলো সাজাও!`,
      // Help modal
      helpBtn:          'সাহায্য চাই',
      helpTitle:        'চলো ভালোভাবে দেখে নিই!',
      helpHearBtn:      'উচ্চারণ শুনো',
      helpCloseBtn:     'বুঝেছি! আবার চেষ্টা করো',
      helpHintFallback: 'বর্ণের লেজ ও বাঁকের দিকটি খেয়াল করো!',
      // Completion screen
      completionTitle:   '🎉 চমৎকার!',
      completionSub:     'তুমি আজকের শব্দ নির্মাণ সেশন সম্পূর্ণ করেছ!',
      starsEarnedLabel:  'অর্জিত স্টার',
      wordsBuiltLabel:   'তৈরি করা শব্দ',
      practicedTitle:    'তুমি আজ অনুশীলন করেছ:',
      practiceItems: [
        '✓ বর্ণের সঠিক আকৃতি সনাক্তকরণ',
        '✓ কাছাকাছি বর্ণের পার্থক্য (ব / র / ক / ধ)',
        '✓ শব্দ নির্মাণের দক্ষতা'
      ],
      btnPracticeAgain:     '🌟 আবার অনুশীলন করো',
      btnContinueLearning:  '📚 শিক্ষা চালিয়ে যাও',
      btnBackHome:          '🏠 মূল পাতায় ফেরত',
      // Audio unavailable
      audioUnavailable:  '🔇 অডিও এখন পাওয়া যাচ্ছে না'
    },
    // ── Audio locale ───────────────────────────────────────────────────────
    speechLang: 'bn-IN',
    speechLangFallback: null,   // No safe English fallback for Bengali — show text instead
    // ── Word pool ──────────────────────────────────────────────────────────
    words: BN_WORDS
  }
};

// ─── Session builder ──────────────────────────────────────────────────────────

/**
 * Selects a finite, non-repeating set of words for one session.
 * Returns null if the language is not supported (caller must show error state).
 *
 * @param {string} langId   - e.g. 'english' | 'bengali'
 * @param {string} grade    - e.g. 'kg' | 'grade1' | 'grade2' | 'grade3' | 'grade4'
 * @param {string[]} [excludeIds] - word ids practiced in the immediately previous session
 * @returns {{ words: object[], ui: object, speechLang: string, speechLangFallback: string|null } | null}
 */
export function buildWordBuilderSession(langId, grade, excludeIds = []) {
  const content = WORD_BUILDER_CONTENT[langId];

  // STRICT: no cross-language fallback
  if (!content) return null;

  const count = getSessionWordCount(grade);
  const pool  = content.words;

  // Prefer words not done in the last session
  let candidates = pool.filter(w => !excludeIds.includes(w.id));
  if (candidates.length < count) {
    // Pool exhausted — use all words again (full reset is fine between sessions)
    candidates = [...pool];
  }

  // Shuffle and pick
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return {
    words:              selected,
    ui:                 content.ui,
    speechLang:         content.speechLang,
    speechLangFallback: content.speechLangFallback
  };
}
