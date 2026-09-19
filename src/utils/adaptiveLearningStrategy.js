/**
 * adaptiveLearningStrategy.js
 * Bridges Cross-Signal Learning Profile to child-friendly experiences,
 * direct routing, and deterministic teaching configurations.
 */

export const CHILD_ACTIVITY_METADATA = {
  'word-snapper': {
    icon: '🧩',
    titleEn: 'Word Builder Adventure',
    titleBn: 'শব্দ তৈরির অভিযান',
    childPromptEn: "Let's build some simple words together!",
    childPromptBn: 'চলো একসাথে সহজ শব্দ গঠন করি!',
    defaultTrack: 'both'
  },
  'letter-tracing': {
    icon: '✍️',
    titleEn: 'Magic Letter Tracing',
    titleBn: 'ম্যাজিক বর্ণ আঁকা',
    childPromptEn: "Let's practice drawing letters with star dots!",
    childPromptBn: 'চলো তারার পথ ধরে বর্ণ আঁকা শিখি!',
    defaultTrack: 'track_b'
  },
  'spelling-clinic': {
    icon: '🧠',
    titleEn: 'Spelling Hero Quest',
    titleBn: 'বানান বীরের অভিযান',
    childPromptEn: "Let's solve tricky sight-word puzzles!",
    childPromptBn: 'চলো মজার ধাঁধা দিয়ে কঠিন বানান শিখি!',
    defaultTrack: 'track_b'
  },
  'spelling-traps': {
    icon: '⚡',
    titleEn: 'Spelling Trap Spotter',
    titleBn: 'বানান ফাঁদ শনাক্তকরণ',
    childPromptEn: "Let's spot sneaky letter swaps in fun stories!",
    childPromptBn: 'চলো গল্পের ভেতর লুকিয়ে থাকা বর্ণ বিভ্রাট খুঁজে বের করি!',
    defaultTrack: 'track_a'
  },
  'abc-fill-in': {
    icon: '🔤',
    titleEn: 'Alphabet Train Express',
    titleBn: 'বর্ণমালা ট্রেন অভিযান',
    childPromptEn: "Let's fix the missing wagons in the alphabet train!",
    childPromptBn: 'চলো ট্রেনের হারিয়ে যাওয়া বর্ণের বগি খুঁজে বের করি!',
    defaultTrack: 'both'
  },
  'letter-hunter': {
    icon: '🎯',
    titleEn: 'Eagle Eye Letter Detective',
    titleBn: 'দৃষ্টিমান বর্ণ শিকারী',
    childPromptEn: "Let's find tricky mirror letters in the eagle grid!",
    childPromptBn: 'চলো গ্রিডের ভেতর থেকে বিভ্রান্তিকর বর্ণগুলো খুঁজে বের করি!',
    defaultTrack: 'track_b'
  },
  'screening': {
    icon: '🎯',
    titleEn: 'Screening Island Quest',
    titleBn: 'অভিযান দ্বীপ স্ক্রিনিং',
    childPromptEn: "Let's play 3 quick discovery games on the island!",
    childPromptBn: 'চলো দ্বীপে ৩টি সহজ ও মজার খেলা শুরু করি!',
    defaultTrack: 'both'
  }
};

/**
 * Returns a child-friendly recommendation object.
 * Safe for direct UI rendering to children (no clinical or diagnostic jargon).
 */
export function getChildRecommendation(profile, languageId = 'english') {
  const isBengali = languageId === 'bengali';
  const learningProfile = profile?.learningProfile;

  const hasPersonalized = Boolean(
    learningProfile &&
    learningProfile.recommendedActivityId &&
    learningProfile.recommendedActivityId !== 'screening' &&
    learningProfile.observedPattern &&
    learningProfile.observedPattern !== 'Not enough activity data yet.'
  );

  if (!hasPersonalized) {
    // Insufficient or non-personalized data: return a warm, non-diagnostic default
    return {
      hasPersonalized: false,
      activityId: 'games',
      icon: '🌟',
      title: isBengali ? 'তোমার অ্যাডভেঞ্চার ল্যাব' : 'Your Learning Lab',
      childPrompt: isBengali
        ? 'চলো একসাথে একটি মজার খেলা বেছে নিয়ে শুরু করি!'
        : "Choose an adventure and let's have fun playing!",
      buttonText: isBengali ? 'গেমস দেখো' : 'EXPLORE GAMES'
    };
  }

  const activityId = learningProfile.recommendedActivityId;
  const meta = CHILD_ACTIVITY_METADATA[activityId] || CHILD_ACTIVITY_METADATA['word-snapper'];

  return {
    hasPersonalized: true,
    activityId,
    icon: meta.icon,
    title: isBengali ? meta.titleBn : meta.titleEn,
    childPrompt: isBengali ? meta.childPromptBn : meta.childPromptEn,
    buttonText: isBengali ? 'শুরু করো' : 'START ADVENTURE'
  };
}

/**
 * Generates deterministic teaching & scaffolding parameters based on profile signals.
 * Does NOT generate synthetic scores.
 */
export function getAdaptiveLearningConfig(profile) {
  if (!profile) {
    return {
      focusArea: 'general',
      supportLevel: 'standard',
      showExtraHints: false,
      useAudio: true,
      initialLetter: 'i',
      instructionSupport: { repeatAudio: false, simplifiedInstructions: false, extraExample: false }
    };
  }

  const parentSignals = profile?.learningProfile?.parentObservation || {};
  const parentFeedback = profile?.parentFeedback || {};

  // Check parent observation signals
  const isReadingNeed = parentSignals.reading === 'needs_support';
  const isPhonicsNeed = parentSignals.speech === 'needs_support';
  const isTracingNeed = parentSignals.tracing === 'needs_support';
  const isUnderstandingNeed = parentSignals.understanding === 'needs_support';

  // Check letter confusion specific observation
  const confusions = parentFeedback?.writing?.letterShapeConfusion || parentFeedback?.writing?.letterConfusion || parentFeedback?.writingLetters?.letterConfusion;
  const hasMirrorConfusion = confusions === 'often' || confusions === 'sometimes';

  let focusArea = 'general';
  if (isTracingNeed || hasMirrorConfusion) focusArea = 'tracing';
  else if (isPhonicsNeed) focusArea = 'phonics';
  else if (isReadingNeed) focusArea = 'reading';
  else if (isPhonicsNeed) focusArea = 'phonics';

  const supportLevel = (isReadingNeed || isPhonicsNeed || isTracingNeed || isUnderstandingNeed)
    ? 'guided'
    : 'standard';

  return {
    focusArea,
    supportLevel,
    showExtraHints: supportLevel === 'guided',
    useAudio: true,
    initialLetter: hasMirrorConfusion ? 'b' : 'i',
    instructionSupport: {
      repeatAudio: isUnderstandingNeed,
      simplifiedInstructions: isUnderstandingNeed,
      extraExample: isUnderstandingNeed || supportLevel === 'guided'
    }
  };
}
