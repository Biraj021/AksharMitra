// Multilingual Data & Configuration for Letter Hunter
// Clean separation of Game Engine and Language Content

export const LETTER_HUNTER_CONTENT = {
  english: {
    gameTitle: "Letter Hunter",
    subtitle: "Visual Discrimination & Letter Shapes",
    targetLabel: "Target Letter",
    findMore: (count, char) => `Find ${count} more "${char}"`,
    allFound: "All Found! 🎉",
    hearBtn: "Hear Sound",
    helpBtn: "Help Me",
    resetBtn: "Reset Grid",
    nextChallengeBtn: "Next Challenge 🚀",
    progressLabel: (curr, total) => `Challenge ${curr} of ${total}`,
    comboLabel: (multiplier) => `${multiplier}x Combo!`,
    mascotStart: (char, count) => `Eagle Eye! Tap all ${count} of the letter "${char}"!`,
    mascotFound: (char, rem) => `Great eye! ${rem} more "${char}" to go! 🎯`,
    mascotWinRound: (char) => `Super! You found all the "${char}" letters! ⭐`,
    mascotDistractor: (tapped, target) => `That is "${tapped}". Look carefully for "${target}"!`,
    helpTitle: "Let's Look Carefully!",
    helpClose: "Got It! Let's Try",
    completion: {
      title: "🎉 Great Job!",
      subtitle: "You completed today's Letter Hunt!",
      starsEarned: "Stars Earned",
      lettersFound: "Letters Found",
      accuracy: "Accuracy",
      practicedTitle: "You practiced today:",
      practiceItems: [
        "✓ Letter shape recognition",
        "✓ Visual discrimination & orientation",
        "✓ Focused, careful looking"
      ],
      btnPracticeAgain: "🌟 Practice Again",
      btnContinueLearning: "📚 Continue Learning",
      btnBackHome: "🏠 Back Home"
    }
  },
  bengali: {
    gameTitle: "বর্ণ শিকারী (Letter Hunter)",
    subtitle: "দৃষ্টিগত বৈষম্য ও বর্ণের আকৃতি চেনার খেলা",
    targetLabel: "লক্ষ্য বর্ণ",
    findMore: (count, char) => `আরও ${count}টি "${char}" খোঁজো`,
    allFound: "সব পাওয়া গেছে! 🎉",
    hearBtn: "উচ্চারণ শুনো",
    helpBtn: "সাহায্য চাই",
    resetBtn: "পুনরায় সাজাও",
    nextChallengeBtn: "পরবর্তী চ্যালেঞ্জ 🚀",
    progressLabel: (curr, total) => `চ্যালেঞ্জ ${curr} / ${total}`,
    comboLabel: (multiplier) => `${multiplier}x কম্বো!`,
    mascotStart: (char, count) => `তীক্ষ্ণ দৃষ্টি! গ্রিড থেকে সব ${count}টি "${char}" বর্ণ খুঁজে নাও!`,
    mascotFound: (char, rem) => `দারুণ! আরও ${rem}টি "${char}" বাকি আছে! 🎯`,
    mascotWinRound: (char) => `অসাধারণ! সব "${char}" বর্ণ সঠিকভাবে খুঁজে পেয়েছ! ⭐`,
    mascotDistractor: (tapped, target) => `এটি হল "${tapped}"। সাবধানে "${target}" বর্ণটি খোঁজো!`,
    helpTitle: "চল ভালোভাবে দেখে নিই!",
    helpClose: "বুঝেছি! চল খেলি",
    completion: {
      title: "🎉 চমৎকার কাজ!",
      subtitle: "তুমি আজকের বর্ণ শিকার সেশন সফলভাবে সম্পন্ন করেছ!",
      starsEarned: "অর্জিত স্টার",
      lettersFound: "চিহ্নিত বর্ণ",
      accuracy: "সঠিকতার হার",
      practicedTitle: "তুমি আজ অনুশীলন করেছ:",
      practiceItems: [
        "✓ বর্ণের সঠিক আকৃতি সনাক্তকরণ",
        "✓ কাছাকাছি বর্ণের দৃষ্টিগত পার্থক্য",
        "✓ মনোযোগী ও সতর্ক দৃষ্টি"
      ],
      btnPracticeAgain: "🌟 আবার খেলো",
      btnContinueLearning: "📚 শিক্ষা চালিয়ে যাও",
      btnBackHome: "🏠 মূল পাতায় ফেরত"
    }
  },
  hindi: {
    gameTitle: "अक्षर खोजी (Letter Hunter)",
    subtitle: "दृश्य पहचान और अक्षर आकृति अभ्यास",
    targetLabel: "लक्ष्य अक्षर",
    findMore: (count, char) => `${count} और "${char}" खोजें`,
    allFound: "सब मिल गए! 🎉",
    hearBtn: "आवाज़ सुनें",
    helpBtn: "मदद चाहिए",
    resetBtn: "रीसेट करें",
    nextChallengeBtn: "अगली चुनौती 🚀",
    progressLabel: (curr, total) => `चुनौती ${curr} / ${total}`,
    comboLabel: (multiplier) => `${multiplier}x कॉम्बो!`,
    mascotStart: (char, count) => `शाबाश! सभी ${count} "${char}" अक्षरों को खोजें!`,
    mascotFound: (char, rem) => `बहुत अच्छे! ${rem} और "${char}" बाकी हैं! 🎯`,
    mascotWinRound: (char) => `शानदार! आपने सभी "${char}" अक्षर ढूंढ लिए! ⭐`,
    mascotDistractor: (tapped, target) => `यह "${tapped}" है। ध्यान से "${target}" खोजें!`,
    helpTitle: "आइए ध्यान से देखें!",
    helpClose: "समझ गया! कोशिश करें",
    completion: {
      title: "🎉 बहुत बढ़िया!",
      subtitle: "आपने आज का अक्षर खोजी सत्र पूरा कर लिया!",
      starsEarned: "अर्जित सितारे",
      lettersFound: "मिले अक्षर",
      accuracy: "सटीकता",
      practicedTitle: "आपने आज अभ्यास किया:",
      practiceItems: [
        "✓ अक्षर की सही आकृति पहचान",
        "✓ मिलते-जुलते अक्षरों में अंतर",
        "✓ ध्यानपूर्वक अवलोकन"
      ],
      btnPracticeAgain: "🌟 दोबारा खेलें",
      btnContinueLearning: "📚 सीखना जारी रखें",
      btnBackHome: "🏠 मुख्य पृष्ठ"
    }
  }
};

export const SCRIPT_CHALLENGES = {
  // ===================== ENGLISH / LATIN =====================
  english: [
    {
      id: "en_b_d",
      name: "b vs d — Look Carefully!",
      target: "b",
      pair: ["b", "d"],
      distractors: ["d", "p", "q"],
      difficulty: 1,
      targetCount: 4,
      gridSize: 16, // 4x4
      ageRange: [4, 7],
      hint: "b has a tall stick with a round belly on the RIGHT (➡️ b)",
      helpDetails: {
        targetRule: "b has a straight stick first, then a belly in front on the RIGHT ➡️",
        contrastRule: "d has a round belly on the LEFT first ⬅️, then a tall stick",
        visualDemo: "b ➡️ vs ⬅️ d"
      }
    },
    {
      id: "en_d_b",
      name: "d vs b — Look Carefully!",
      target: "d",
      pair: ["d", "b"],
      distractors: ["b", "q", "p"],
      difficulty: 1,
      targetCount: 4,
      gridSize: 16,
      ageRange: [4, 7],
      hint: "d has a round diaper on the LEFT followed by a tall stick (⬅️ d)",
      helpDetails: {
        targetRule: "d has a round diaper on the LEFT ⬅️, followed by a tall stick",
        contrastRule: "b has the stick first, and the belly on the RIGHT ➡️",
        visualDemo: "d ⬅️ vs ➡️ b"
      }
    },
    {
      id: "en_p_q",
      name: "p vs q — Downward Shapes!",
      target: "p",
      pair: ["p", "q"],
      distractors: ["q", "b", "d"],
      difficulty: 2,
      targetCount: 4,
      gridSize: 16,
      ageRange: [5, 7],
      hint: "p drops DOWN with a bubble on the top RIGHT (p ⬇️)",
      helpDetails: {
        targetRule: "p hangs low below the line with a round bubble on the RIGHT",
        contrastRule: "q hangs low with its bubble on the LEFT and a tiny hook",
        visualDemo: "p ⬇️ vs ⬇️ q"
      }
    },
    {
      id: "en_q_p",
      name: "q vs p — Downward Shapes!",
      target: "q",
      pair: ["q", "p"],
      distractors: ["p", "d", "b"],
      difficulty: 2,
      targetCount: 4,
      gridSize: 16,
      ageRange: [5, 7],
      hint: "q drops DOWN with a round head on the LEFT (q ⬇️)",
      helpDetails: {
        targetRule: "q has a round circle on the LEFT with a tail dropping down",
        contrastRule: "p has the circle on the RIGHT",
        visualDemo: "q ⬇️ vs ⬇️ p"
      }
    },
    {
      id: "en_m_w",
      name: "m vs w — Up & Down Arches!",
      target: "m",
      pair: ["m", "w"],
      distractors: ["w", "n", "u", "v"],
      difficulty: 1,
      targetCount: 4,
      gridSize: 16,
      ageRange: [4, 7],
      hint: "m stands upright with two hills on TOP 🏔️",
      helpDetails: {
        targetRule: "m has two rounded arches reaching UP towards the sky",
        contrastRule: "w is upside down with sharp points pointing DOWN",
        visualDemo: "m ⛰️ vs 🔻 w"
      }
    },
    {
      id: "en_n_u",
      name: "n vs u — Open & Closed Cups!",
      target: "n",
      pair: ["n", "u"],
      distractors: ["u", "m", "h", "v"],
      difficulty: 1,
      targetCount: 4,
      gridSize: 16,
      ageRange: [4, 7],
      hint: "n is like an umbrella bridge ☂️; u is like a cup holding water 🥛",
      helpDetails: {
        targetRule: "n curves over like an igloo or umbrella bridge",
        contrastRule: "u opens up at the top like a smiling cup",
        visualDemo: "n ☂️ vs 🥛 u"
      }
    }
  ],

  // ===================== BENGALI =====================
  bengali: [
    {
      id: "bn_ba_ra",
      name: "ব এবং র — বিন্দু লক্ষ্য করো!",
      target: "ব",
      pair: ["ব", "র"],
      distractors: ["র", "ক", "ধ"],
      difficulty: 1,
      targetCount: 4,
      gridSize: 16,
      ageRange: [4, 7],
      hint: "ব বর্ণে নিচে কোনো বিন্দু থাকে না; র বর্ণে নিচে বিন্দু থাকে!",
      helpDetails: {
        targetRule: "ব বর্ণটির নিচে কোনো বিন্দু বা ফোঁটা থাকে না (সোজা ত্রিকোণ তল)",
        contrastRule: "র বর্ণটির নিচে একটি সুস্পষ্ট বিন্দু (.) থাকে",
        visualDemo: "ব (বিন্দুহীন) vs র (বিন্দুসহ)"
      }
    },
    {
      id: "bn_ka_dha",
      name: "ক এবং ধ — লুপ ও মাত্রা!",
      target: "ক",
      pair: ["ক", "ধ"],
      distractors: ["ধ", "ঝ", "ব", "র"],
      difficulty: 2,
      targetCount: 4,
      gridSize: 16,
      ageRange: [5, 7],
      hint: "ক বর্ণে পুরো মাত্রা ও গোল বাঁকানো লুপ থাকে!",
      helpDetails: {
        targetRule: "ক বর্ণে সম্পূর্ণ মাত্রা থাকে এবং মাঝখানে গোল বাঁকানো লুপ থাকে",
        contrastRule: "ধ বর্ণে কোনো পূর্ণমাত্রা থাকে না, এটি অর্ধমাত্রার বর্ণ",
        visualDemo: "ক (পূর্ণমাত্রা) vs ধ (অর্ধমাত্রা)"
      }
    },
    {
      id: "bn_da_rra",
      name: "ড এবং ড় — ফ্ল্যাপ চেনা!",
      target: "ড",
      pair: ["ড", "ড়"],
      distractors: ["ড়", "ট", "ঢ়", "দ"],
      difficulty: 1,
      targetCount: 4,
      gridSize: 16,
      ageRange: [4, 7],
      hint: "ড বর্ণে নিচে কোনো বিন্দু থাকে না; ড় বর্ণে নিচে বিন্দু থাকে!",
      helpDetails: {
        targetRule: "ড বর্ণটি পরিষ্কার বাঁকানো থাকে কোনো নিচের বিন্দু ছাড়াই",
        contrastRule: "ড় বর্ণে নিচে একটি বিন্দু (.) বসে ধ্বনি পরিবর্তন করে",
        visualDemo: "ড vs ড়"
      }
    },
    {
      id: "bn_na_nna",
      name: "ন এবং ণ — মাত্রা পার্থক্য!",
      target: "ন",
      pair: ["ন", "ণ"],
      distractors: ["ণ", "ল", "প", "গ"],
      difficulty: 2,
      targetCount: 4,
      gridSize: 16,
      ageRange: [5, 7],
      hint: "দন্ত্য-ন বর্ণে পুরো মাত্রা থাকে; মূর্ধন্য-ণ তে অর্ধমাত্রা থাকে!",
      helpDetails: {
        targetRule: "দন্ত্য 'ন' বর্ণের মাথার ওপর সম্পূর্ণ মাত্রা টানা থাকে",
        contrastRule: "মূর্ধন্য 'ণ' বর্ণের মাথার ওপর কেবল ডানদিকে সামান্য অর্ধমাত্রা থাকে",
        visualDemo: "ন (পূর্ণমাত্রা) vs ণ (অর্ধমাত্রা)"
      }
    }
  ],

  // ===================== HINDI / DEVANAGARI =====================
  hindi: [
    {
      id: "hi_ba_bha",
      name: "ब और भ — ध्यान से देखें!",
      target: "ब",
      pair: ["ब", "भ"],
      distractors: ["भ", "व", "क"],
      difficulty: 1,
      targetCount: 4,
      gridSize: 16,
      ageRange: [4, 7],
      hint: "ब के पेट में एक तिरछी रेखा होती है!",
      helpDetails: {
        targetRule: "ब के गोल पेट के अंदर एक तिरछी काट रेखा (/) होती है",
        contrastRule: "भ ऊपर से घुंडीदार (लूप) होता है और पूरी शिरोरेखा नहीं होती",
        visualDemo: "ब vs भ"
      }
    },
    {
      id: "hi_da_dha",
      name: "द और ध — अंतर पहचानें!",
      target: "द",
      pair: ["द", "ध"],
      distractors: ["ध", "घ", "छ"],
      difficulty: 2,
      targetCount: 4,
      gridSize: 16,
      ageRange: [5, 7],
      hint: "द की नीचे एक छोटी पूंछ निकलती है!",
      helpDetails: {
        targetRule: "द नीचे की तरफ छोटी पूंछ के साथ पूरा शिरोरेखा युक्त होता है",
        contrastRule: "ध ऊपर से घुंडीदार होता है और शिरोरेखा टूटी होती है",
        visualDemo: "द vs ध"
      }
    },
    {
      id: "hi_gh_dh",
      name: "घ और ध — शिरोरेखा और घुंडी!",
      target: "घ",
      pair: ["घ", "ध"],
      distractors: ["ध", "छ", "ख"],
      difficulty: 2,
      targetCount: 4,
      gridSize: 16,
      ageRange: [5, 8],
      hint: "घ पर पूरी शिरोरेखा होती है, ध पर ऊपर घुंडी और कटी रेखा!",
      helpDetails: {
        targetRule: "घ के ऊपर पूरी सीधी शिरोरेखा खींची जाती है",
        contrastRule: "ध ऊपर से गोल घुंडीदार होता है और उसके ऊपर शिरोरेखा कटी होती है",
        visualDemo: "घ (पूरी रेखा) vs ध (कटी रेखा)"
      }
    },
    {
      id: "hi_pa_sha",
      name: "प और ष — पेट में लकीर पहचानें!",
      target: "प",
      pair: ["प", "ष"],
      distractors: ["ष", "य", "फ"],
      difficulty: 1,
      targetCount: 4,
      gridSize: 16,
      ageRange: [4, 7],
      hint: "प का पेट खाली होता है, ष के पेट में तिरछी लकीर होती है!",
      helpDetails: {
        targetRule: "प एकदम सादा और खुला रहता है",
        contrastRule: "ष के पेट के बीच में एक तिरछी रेखा होती है",
        visualDemo: "प vs ष"
      }
    }
  ]
};

/**
 * Selects an age-appropriate, non-repeating set of 3-5 challenges for a finite session
 * @param {string} language - 'english' | 'bengali' | 'hindi'
 * @param {string} grade - 'kg' | 'grade1' | 'grade2' | 'grade3' | 'grade4'
 * @param {Array<string>} excludeChallengeIds - IDs already practiced recently
 * @returns {Array<Object>} List of selected challenge objects (length 3 to 4)
 */
export function buildFiniteSessionChallenges(language = 'english', grade = 'grade2', excludeChallengeIds = []) {
  const pool = SCRIPT_CHALLENGES[language] || SCRIPT_CHALLENGES.english;
  if (!pool || pool.length === 0) return [];

  // Determine session round count based on child age/grade
  let targetRoundCount = 3;
  if (grade === 'grade1' || grade === 'grade2') {
    targetRoundCount = 3; // 3 rounds for optimal child attention span
  } else if (grade === 'grade3' || grade === 'grade4') {
    targetRoundCount = 4;
  } else {
    targetRoundCount = 3; // KG default
  }

  // Filter out recent exclusions if enough alternatives exist
  let candidates = pool.filter(c => !excludeChallengeIds.includes(c.id));
  if (candidates.length < targetRoundCount) {
    candidates = [...pool]; // Fallback to all if pool exhausted
  }

  // Shuffle candidates
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(targetRoundCount, shuffled.length));
}
