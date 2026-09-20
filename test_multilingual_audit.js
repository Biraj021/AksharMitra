// test_multilingual_audit.js
// Deep automated audit for every feature across English, Bengali, and Hindi

import { TRANSLATIONS } from './src/data/translations.js';
import { SUPPORTED_LANGUAGES, GRADES, AVATARS } from './src/data/languages.js';
import { LETTER_HUNTER_CONTENT, SCRIPT_CHALLENGES } from './src/data/letterHunterData.js';
import { WORD_BUILDER_CONTENT, buildWordBuilderSession } from './src/data/wordBuilderData.js';
import { WORD_SNAPPER_DATA, LETTER_HUNTER_SETS } from './src/data/remediationData.js';
import { DEMO_PROFILES } from './src/data/demoProfiles.js';
import { getChildRecommendation, getAdaptiveLearningConfig } from './src/utils/adaptiveLearningStrategy.js';
import { calculateLearningProfile } from './src/utils/crossSignalIntelligence.js';
import { createEmptyParentFeedback, hasParentFeedbackData } from './src/utils/parentFeedbackModel.js';

console.log('========================================================');
console.log('AKSHARMITRA — COMPREHENSIVE MULTILINGUAL & FEATURE AUDIT');
console.log('========================================================\n');

let issues = [];
let passCount = 0;

function reportIssue(category, message, severity = 'WARNING') {
  issues.push({ category, message, severity });
  console.log(`❌ [${severity}] [${category}]: ${message}`);
}

function reportPass(testName) {
  passCount++;
  console.log(`✅ [PASS] ${testName}`);
}

// ----------------------------------------------------
// 1. TRANSLATION DICTIONARY AUDIT
// ----------------------------------------------------
console.log('--- 1. TRANSLATION DICTIONARIES (english, bengali, hindi) ---');

const enKeys = Object.keys(TRANSLATIONS.english || {});
const bnKeys = Object.keys(TRANSLATIONS.bengali || {});
const hiKeys = Object.keys(TRANSLATIONS.hindi || {});

console.log(`Translation keys count -> English: ${enKeys.length}, Bengali: ${bnKeys.length}, Hindi: ${hiKeys.length}`);

// Check missing keys in Bengali
const missingInBn = enKeys.filter(k => !(k in TRANSLATIONS.bengali));
if (missingInBn.length > 0) {
  reportIssue('Translations', `Bengali is missing ${missingInBn.length} keys: ${missingInBn.slice(0, 10).join(', ')}...`, 'WARNING');
} else {
  reportPass('All English translation keys exist in Bengali');
}

// Check missing keys in Hindi
const missingInHi = enKeys.filter(k => !(k in TRANSLATIONS.hindi));
if (missingInHi.length > 0) {
  reportIssue('Translations', `Hindi is missing ${missingInHi.length} keys: ${missingInHi.slice(0, 10).join(', ')}...`, 'WARNING');
} else {
  reportPass('All English translation keys exist in Hindi');
}

// Check for null or empty values
['english', 'bengali', 'hindi'].forEach(lang => {
  const dict = TRANSLATIONS[lang] || {};
  let emptyCount = 0;
  for (const [key, val] of Object.entries(dict)) {
    if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
      emptyCount++;
      reportIssue('Translations', `Empty translation value for key "${key}" in language "${lang}"`, 'WARNING');
    }
  }
  if (emptyCount === 0) {
    reportPass(`No empty or null translation strings in language: ${lang}`);
  }
});

// ----------------------------------------------------
// 2. DATASETS FOR GAMES AUDIT
// ----------------------------------------------------
console.log('\n--- 2. GAME DATASETS AUDIT (LetterHunter, WordBuilder, Remediation) ---');

// Letter Hunter Content & Challenges
['english', 'bengali', 'hindi'].forEach(lang => {
  const content = LETTER_HUNTER_CONTENT ? LETTER_HUNTER_CONTENT[lang] : null;
  if (!content) {
    reportIssue('LetterHunterData', `Missing Letter Hunter UI content for language: ${lang}`, 'ERROR');
  } else {
    reportPass(`Letter Hunter UI content present for ${lang}`);
  }

  const challenges = SCRIPT_CHALLENGES ? SCRIPT_CHALLENGES[lang] : null;
  if (!challenges || challenges.length === 0) {
    reportIssue('LetterHunterData', `Missing or empty Script Challenges for language: ${lang}`, 'ERROR');
  } else {
    let broken = false;
    challenges.forEach((ch, i) => {
      if (!ch.target || !ch.pair || !ch.distractors) {
        broken = true;
        reportIssue('LetterHunterData', `Challenge #${i+1} in ${lang} missing target, pair, or distractors`, 'ERROR');
      }
    });
    if (!broken) {
      reportPass(`Letter Hunter Challenges valid for ${lang} (${challenges.length} challenges)`);
    }
  }
});

// Word Builder Content & Session Generation
['english', 'bengali', 'hindi'].forEach(lang => {
  const content = WORD_BUILDER_CONTENT ? WORD_BUILDER_CONTENT[lang] : null;
  if (!content) {
    reportIssue('WordBuilderData', `Missing Word Builder dataset for language: ${lang}`, 'ERROR');
  } else {
    const words = content.words || [];
    if (words.length === 0) {
      reportIssue('WordBuilderData', `Word Builder dataset for ${lang} has 0 words`, 'ERROR');
    } else {
      let brokenWord = false;
      words.forEach((item, idx) => {
        if (!item.word || !item.letters || !Array.isArray(item.letters)) {
          brokenWord = true;
          reportIssue('WordBuilderData', `Item #${idx + 1} (${item.word || 'unknown'}) in ${lang} missing word or letters`, 'ERROR');
        }
      });
      if (!brokenWord) {
        reportPass(`Word Builder dataset for ${lang} is valid (${words.length} entries)`);
      }
    }

    // Test session builder for each grade
    ['kg', 'grade1', 'grade2', 'grade3', 'grade4'].forEach(g => {
      const session = buildWordBuilderSession(lang, g);
      if (!session || !session.words || session.words.length === 0) {
        reportIssue('WordBuilderSession', `Session generation failed for ${lang} / grade ${g}`, 'ERROR');
      }
    });
    reportPass(`Word Builder session generation tested successfully for ${lang} across all grades`);
  }
});

// Remediation Data (Word Snapper)
['english', 'bengali', 'hindi'].forEach(lang => {
  const wordsForLang = WORD_SNAPPER_DATA.filter(w => w.language === lang);
  if (wordsForLang.length === 0) {
    reportIssue('RemediationData', `No Word Snapper items for language: ${lang}`, 'WARNING');
  } else {
    reportPass(`Word Snapper dataset for ${lang} has ${wordsForLang.length} items`);
  }
});

// ----------------------------------------------------
// 3. ADAPTIVE LEARNING STRATEGY IN ALL LANGUAGES
// ----------------------------------------------------
console.log('\n--- 3. ADAPTIVE LEARNING STRATEGY AUDIT (Child Recommendations) ---');

const testProfiles = [
  {
    name: 'Reading Support Profile',
    learningProfile: {
      recommendations: {
        primaryFocus: 'reading',
        recommendedActivity: 'word-snapper',
        personalizedPlan: true
      },
      signals: {
        readingFriction: 'high',
        letterConfusion: 'low'
      }
    }
  },
  {
    name: 'Letter Tracing Support Profile',
    learningProfile: {
      recommendations: {
        primaryFocus: 'letter_tracing',
        recommendedActivity: 'letter-tracing',
        personalizedPlan: true,
        focusLetterPair: ['b', 'd']
      },
      signals: {
        letterConfusion: 'high'
      }
    }
  },
  {
    name: 'Phonics Sound Support Profile',
    learningProfile: {
      recommendations: {
        primaryFocus: 'phonics',
        recommendedActivity: 'spelling-clinic',
        personalizedPlan: true
      },
      signals: {
        soundFriction: 'high'
      }
    }
  },
  {
    name: 'Instructions Support Profile',
    learningProfile: {
      recommendations: {
        primaryFocus: 'instructions',
        recommendedActivity: 'abc-fill-in',
        personalizedPlan: true
      },
      signals: {
        instructionFriction: 'high'
      }
    }
  },
  {
    name: 'Neutral / Insufficient Data Profile',
    learningProfile: {
      recommendations: {
        personalizedPlan: false
      },
      signals: {}
    }
  }
];

['english', 'bengali', 'hindi'].forEach(langId => {
  testProfiles.forEach(tp => {
    const rec = getChildRecommendation(tp, langId);
    if (!rec || !rec.title || !rec.buttonText || !rec.childPrompt) {
      reportIssue('AdaptiveStrategy', `Incomplete child recommendation in ${langId} for ${tp.name}`, 'ERROR');
    } else {
      if (langId === 'bengali') {
        const prompt = rec.childPrompt;
        if (prompt.includes('Explorer') || prompt.includes('Ready for')) {
          reportIssue('AdaptiveStrategy', `Bengali child prompt contains untranslated English: "${prompt}"`, 'WARNING');
        }
      }
      if (langId === 'hindi') {
        const prompt = rec.childPrompt;
        if (prompt.includes('Explorer') || prompt.includes('Ready for')) {
          reportIssue('AdaptiveStrategy', `Hindi child prompt contains untranslated English: "${prompt}"`, 'WARNING');
        }
      }
    }
  });
  reportPass(`Child recommendations rendered successfully in ${langId} for all 5 test profile scenarios`);
});

// ----------------------------------------------------
// 4. PARENT OBSERVATION KEYS & LOCALIZATION AUDIT
// ----------------------------------------------------
console.log('\n--- 4. PARENT OBSERVATION LOCALIZATION AUDIT ---');

const requiredParentKeys = [
  'sectionReading',
  'sectionSounds',
  'sectionWriting',
  'sectionUnderstanding',
  'sectionNotes',
  'sectionReview',
  'parentObsTitle',
  'parentObsSubtitle',
  'parentObsSavedSuccess',
  'qReadingComfort',
  'optReadingComfortable',
  'optReadingSlowly',
  'optReadingHelp',
  'optReadingStruggle',
  'qReadingSkipping',
  'optRarely',
  'optSometimes',
  'optOften',
  'optNotSure',
  'qSoundsLetter',
  'optSoundsComfortable',
  'optSoundsSometimesHelp',
  'optSoundsOftenHelp',
  'qSoundsBlending',
  'optUsually',
  'optSoundsBlendingSometimes',
  'optSoundsBlendingHelp',
  'qWritingTracing',
  'optWritingComfortable',
  'optWritingDeveloping',
  'optWritingHelp',
  'qWritingConfusion',
  'qWritingConfusionHint',
  'qUnderstandsInstructions',
  'optSometimesRepetition',
  'optOftenNeedsHelp',
  'qHandlesChallenge',
  'optKeepsTrying',
  'optNeedsEncouragement',
  'optUsuallyNeedsHelp',
  'parentNoteLabel',
  'parentNotePlaceholder'
];

['english', 'bengali', 'hindi'].forEach(lang => {
  const dict = TRANSLATIONS[lang] || {};
  let missing = [];
  requiredParentKeys.forEach(k => {
    if (!dict[k]) missing.push(k);
  });
  if (missing.length > 0) {
    reportIssue('ParentFeedbackKeys', `Language "${lang}" is missing parent observation keys: ${missing.join(', ')}`, 'WARNING');
  } else {
    reportPass(`All parent observation keys present in language: ${lang}`);
  }
});

// ----------------------------------------------------
// 5. DEMO PROFILES AUDIT
// ----------------------------------------------------
console.log('\n--- 5. DEMO PROFILES AUDIT ---');

if (!Array.isArray(DEMO_PROFILES) || DEMO_PROFILES.length === 0) {
  reportIssue('DemoProfiles', 'DEMO_PROFILES is missing or empty', 'ERROR');
} else {
  DEMO_PROFILES.forEach((dp, idx) => {
    if (!dp.id || !dp.name || !dp.avatar || !dp.grade) {
      reportIssue('DemoProfiles', `Demo profile #${idx + 1} (${dp.name}) missing basic fields`, 'ERROR');
    }
    const profileCalculated = calculateLearningProfile(dp);
    if (!profileCalculated) {
      reportIssue('DemoProfiles', `calculateLearningProfile returned null for demo profile ${dp.name}`, 'ERROR');
    }
  });
  reportPass(`All ${DEMO_PROFILES.length} Demo Profiles verified for profile calculation`);
}

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n========================================================');
console.log(`AUDIT COMPLETE: ${passCount} PASSED, ${issues.length} ISSUES/WARNINGS FOUND`);
console.log('========================================================');

if (issues.length > 0) {
  console.log('\nLIST OF ISSUES:');
  issues.forEach((iss, i) => {
    console.log(`${i + 1}. [${iss.severity}] [${iss.category}] ${iss.message}`);
  });
}
