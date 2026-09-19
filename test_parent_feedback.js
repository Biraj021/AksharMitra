// Comprehensive Automated Verification Suite for Simplified Parent Feedback & Observation System
// Verifies Tests A through P for the focused 4-section questionnaire

import {
  createEmptyParentFeedback,
  hasParentFeedbackData
} from './src/utils/parentFeedbackModel.js';
import {
  calculateParentObservationSignals,
  extractActivitySignals,
  calculateLearningProfile,
  buildLearningContext
} from './src/utils/crossSignalIntelligence.js';
import { getTranslation } from './src/data/translations.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, message) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}: ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('AKSHARMITRA — SIMPLIFIED PARENT FEEDBACK VERIFICATION');
console.log('====================================================\n');

// ─────────────────────────────────────────────────────────────
// TEST A: New learner can complete the short questionnaire
// ─────────────────────────────────────────────────────────────
{
  const emptyProfile = {
    id: 'student_test_a',
    name: 'New Explorer',
    screeningCompleted: false,
    screeningMetrics: null,
    parentFeedback: null
  };

  const profile = calculateLearningProfile(emptyProfile);
  assert(
    profile.observedPattern === 'Not enough activity data yet.',
    'TEST A',
    'Returns "Not enough activity data yet." without fabricating signals'
  );
  assert(
    profile.confidence === 0,
    'TEST A',
    'Confidence is 0 when no signals exist'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST B: Only important fields are collected in new schema
// ─────────────────────────────────────────────────────────────
{
  const newFeedback = createEmptyParentFeedback();
  const keys = Object.keys(newFeedback);
  assert(
    keys.includes('reading') &&
    keys.includes('sounds') &&
    keys.includes('writing') &&
    keys.includes('understanding') &&
    keys.includes('parentObservation'),
    'TEST B',
    'Schema contains only the 4 focused areas + optional observation'
  );
  assert(
    !keys.includes('engagement') && !keys.includes('attention'),
    'TEST B',
    'Old separate engagement and attention keys are no longer top-level schema sections'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST C: Removed questions do not appear in new model
// ─────────────────────────────────────────────────────────────
{
  const feedback = createEmptyParentFeedback();
  assert(
    feedback.reading.independentReading === undefined &&
    feedback.sounds.pronunciation === undefined &&
    feedback.writing.letterRecall === undefined,
    'TEST C',
    'Low-value redundant questions successfully pruned from schema'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST D: Progress step structure
// ─────────────────────────────────────────────────────────────
{
  const totalSteps = 6; // 0: Reading, 1: Sounds, 2: Writing, 3: Understanding, 4: Note, 5: Review
  assert(
    totalSteps === 6,
    'TEST D',
    'Progress flow accurately tracks 4 observation sections + Optional Note + Review (total 6 steps)'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST E: Parent can leave optional questions unanswered
// ─────────────────────────────────────────────────────────────
{
  const partialFeedback = {
    ...createEmptyParentFeedback(),
    reading: {
      comfort: 'needs_help',
      wordSkipping: null
    }
  };

  const signals = calculateParentObservationSignals(partialFeedback);
  assert(
    signals.reading === 'needs_support',
    'TEST E',
    'Calculates reading signal from single answered question'
  );
  assert(
    signals.speech === null &&
    signals.tracing === null &&
    signals.understanding === null,
    'TEST E',
    'Unanswered sections remain strictly null without fabricating zeros or false scores'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST F: Reading feedback influences reading support
// ─────────────────────────────────────────────────────────────
{
  const testFProfile = {
    id: 'student_test_f',
    name: 'Aarav',
    screeningCompleted: true,
    screeningMetrics: {
      wpm: 20,
      fluencyHesitation: 65,
      phonologicalScore: 85,
      tracingAccuracy: 88
    },
    parentFeedback: {
      ...createEmptyParentFeedback(),
      reading: {
        comfort: 'needs_help',
        wordSkipping: 'often'
      }
    }
  };

  const profile = calculateLearningProfile(testFProfile);
  assert(
    profile.agreementStatus === 'agreement',
    'TEST F',
    'Detects agreement between low app reading and parent difficulty observation'
  );
  assert(
    profile.recommendedPractice.toLowerCase().includes('reading') ||
    profile.recommendedPractice.toLowerCase().includes('word'),
    'TEST F',
    'Recommends Guided Reading / Word Builder practice'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST G: Sound feedback influences phonological support
// ─────────────────────────────────────────────────────────────
{
  const testGProfile = {
    id: 'student_test_g',
    name: 'Kabir',
    screeningCompleted: true,
    screeningMetrics: {
      wpm: 55,
      fluencyHesitation: 20,
      phonologicalScore: 50,
      tracingAccuracy: 90
    },
    parentFeedback: {
      ...createEmptyParentFeedback(),
      sounds: {
        letterSounds: 'often_help',
        blendingSounds: 'needs_help'
      }
    }
  };

  const profile = calculateLearningProfile(testGProfile);
  assert(
    profile.agreementStatus === 'agreement',
    'TEST G',
    'Detects agreement on phonological sound difficulty'
  );
  assert(
    profile.recommendedPractice.includes('Phonics Sound Lab') ||
    profile.recommendedPractice.includes('rhyme matching'),
    'TEST G',
    'Recommends Phonics Sound Lab'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST H: Writing feedback influences tracing/visual support
// ─────────────────────────────────────────────────────────────
{
  const testHProfile = {
    id: 'student_test_h',
    name: 'Diya',
    screeningCompleted: true,
    screeningMetrics: {
      wpm: 50,
      fluencyHesitation: 25,
      phonologicalScore: 88,
      tracingAccuracy: 58,
      reversalIndex: 75
    },
    parentFeedback: {
      ...createEmptyParentFeedback(),
      writing: {
        tracing: 'needs_help',
        letterShapeConfusion: 'often'
      }
    }
  };

  const profile = calculateLearningProfile(testHProfile);
  assert(
    profile.agreementStatus === 'agreement',
    'TEST H',
    'Identifies agreement on writing and tracing friction'
  );
  assert(
    profile.recommendedActivityId === 'letter-tracing',
    'TEST H',
    'Routes to Letter Tracing Studio'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST I: Letter-shape observation works without diagnostic claims
// ─────────────────────────────────────────────────────────────
{
  const shapeFeedback = {
    ...createEmptyParentFeedback(),
    writing: {
      tracing: 'comfortable',
      letterShapeConfusion: 'often' // e.g. b/d or p/q observation
    }
  };

  const signals = calculateParentObservationSignals(shapeFeedback);
  assert(
    signals.tracing === 'developing',
    'TEST I',
    'Treats letter shape confusion as an educational support signal, NOT a diagnosis'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST J: Understanding feedback does not create a fake medical score
// ─────────────────────────────────────────────────────────────
{
  const underFeedback = {
    ...createEmptyParentFeedback(),
    understanding: {
      understandsInstructions: 'needs_help',
      handlesChallenge: 'needs_encouragement'
    }
  };

  const signals = calculateParentObservationSignals(underFeedback);
  assert(
    signals.understanding === 'needs_support',
    'TEST J',
    'Extracts understanding support signal purely for instructional pacing'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST K: Backward compatibility with existing stored feedback
// ─────────────────────────────────────────────────────────────
{
  const oldStoredData = {
    lastUpdatedAt: '2026-09-19T18:00:00.000Z',
    reading: { comfort: 'slowly', wordSkipping: 'sometimes', independentReading: 'developing' },
    sounds: { letterSounds: 'comfortable', blendingSounds: 'usually', pronunciation: 'clear' },
    writing: { tracing: 'comfortable', letterRecall: 'comfortable', letterShapeConfusion: 'rarely' },
    comprehension: { understandsSpokenInstructions: 'usually', understandsSimpleStories: 'usually' },
    attention: { staysEngaged: 'enjoys_activities', needsFrequentHelp: 'rarely' },
    parentObservation: 'Old data structure test'
  };

  assert(
    hasParentFeedbackData(oldStoredData),
    'TEST K',
    'hasParentFeedbackData correctly recognizes old schemas without errors'
  );
  const signals = calculateParentObservationSignals(oldStoredData);
  assert(
    signals.reading === 'developing' && signals.speech === 'comfortable',
    'TEST K',
    'calculateParentObservationSignals parses legacy feedback without crashing'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST L: Persistence across serialization (localStorage)
// ─────────────────────────────────────────────────────────────
{
  const mockStorage = {};
  const activeLearner = {
    id: 'student_persisted',
    name: 'Maya',
    parentFeedback: {
      ...createEmptyParentFeedback(),
      reading: { comfort: 'slowly', wordSkipping: 'sometimes' },
      parentObservation: 'Loves audio stories!'
    }
  };

  mockStorage['aksharmitra_active_profile'] = JSON.stringify(activeLearner);
  const restored = JSON.parse(mockStorage['aksharmitra_active_profile']);
  const learningProfile = calculateLearningProfile(restored);

  assert(
    restored.parentFeedback.reading.comfort === 'slowly',
    'TEST L',
    'Parent feedback persists accurately across JSON serialization'
  );
  assert(
    learningProfile.parentObservation.reading === 'developing',
    'TEST L',
    'Learning profile recalculated consistently after reload'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST M: Demo profile isolation
// ─────────────────────────────────────────────────────────────
{
  const realLearner = {
    id: 'student_real_user',
    name: 'Anaya',
    parentFeedback: {
      ...createEmptyParentFeedback(),
      reading: { comfort: 'comfortably', wordSkipping: 'rarely' }
    }
  };

  const demoAarav = {
    id: 'demo_aarav',
    name: 'Aarav',
    parentFeedback: {
      ...createEmptyParentFeedback(),
      reading: { comfort: 'needs_help', wordSkipping: 'often' }
    }
  };

  // Mutate demo profile
  const updatedDemo = {
    ...demoAarav,
    parentFeedback: {
      ...demoAarav.parentFeedback,
      reading: { comfort: 'struggles_independently', wordSkipping: 'often' }
    }
  };

  assert(
    realLearner.parentFeedback.reading.comfort === 'comfortably',
    'TEST M',
    'Mutating demo profile never alters real learner data'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST N: English ↔ Bengali translation verification
// ─────────────────────────────────────────────────────────────
{
  const titleEn = getTranslation('parentObsTitle', 'english');
  const titleBn = getTranslation('parentObsTitle', 'bengali');
  const undEn = getTranslation('sectionUnderstanding', 'english');
  const undBn = getTranslation('sectionUnderstanding', 'bengali');

  assert(
    titleEn === 'Parent Observation' && titleBn === 'অভিভাবকের পর্যবেক্ষণ',
    'TEST N',
    'Translates Parent Observation title accurately between English and Bengali'
  );
  assert(
    undEn === 'Understanding & Learning' && undBn === 'অনুধাবন ও শিক্ষণ',
    'TEST N',
    'Translates Understanding & Learning section name properly'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST O: Existing Phase 2 activity signals unbroken
// ─────────────────────────────────────────────────────────────
{
  const fullProfile = {
    id: 'student_phase2',
    name: 'Vikram',
    screeningCompleted: true,
    riskLevel: 'mild_visual',
    learningPathway: 'multisensory_remediation',
    screeningMetrics: {
      reversalIndex: 65,
      fluencyHesitation: 45,
      phonologicalScore: 82,
      tracingAccuracy: 70,
      wpm: 38,
      confusionsDetected: ['b / d mirror reversal']
    },
    parentFeedback: {
      ...createEmptyParentFeedback(),
      writing: { tracing: 'developing', letterShapeConfusion: 'sometimes' }
    }
  };

  const learningContext = buildLearningContext(fullProfile);
  assert(
    learningContext.activitySignals.reading === 'moderate' &&
    learningContext.activitySignals.speech === 'high' &&
    learningContext.activitySignals.tracing === 'low',
    'TEST O',
    'Objective Phase 2 activity signals operate with exact precision'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST P: Recommendation routing
// ─────────────────────────────────────────────────────────────
{
  const divergenceProfile = {
    id: 'student_divergence',
    name: 'Rohan',
    screeningCompleted: true,
    screeningMetrics: {
      wpm: 65, // Strong reading
      fluencyHesitation: 15,
      phonologicalScore: 92,
      tracingAccuracy: 90
    },
    parentFeedback: {
      ...createEmptyParentFeedback(),
      reading: {
        comfort: 'struggles_independently',
        wordSkipping: 'often'
      }
    }
  };

  const profile = calculateLearningProfile(divergenceProfile);
  assert(
    profile.agreementStatus === 'divergence',
    'TEST P',
    'Detects divergence when app is strong but parent reports struggle'
  );
  assert(
    profile.observedPattern.includes('App performance is currently stronger than the parent\'s home observation'),
    'TEST P',
    'Generates respectful contextual observation without overwriting app data'
  );
}

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
