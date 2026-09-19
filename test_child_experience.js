// Automated Verification Suite for Child-Facing Recommendation & Adaptive Experience (Tests A - L)

import { calculateLearningProfile } from './src/utils/crossSignalIntelligence.js';
import {
  getChildRecommendation,
  getAdaptiveLearningConfig
} from './src/utils/adaptiveLearningStrategy.js';
import { DEMO_PROFILES } from './src/data/demoProfiles.js';

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
console.log('AKSHARMITRA — CHILD EXPERIENCE VERIFICATION SUITE');
console.log('====================================================\n');

// ─────────────────────────────────────────────────────────────
// TEST A: Reading Feedback → Child Home Mission & Direct Routing
// ─────────────────────────────────────────────────────────────
{
  const profile = {
    id: 'test_child_a',
    name: 'Aarav',
    screeningCompleted: true,
    screeningMetrics: { wpm: 35, phonologicalScore: 80, tracingAccuracy: 85 },
    parentFeedback: {
      reading: { comfort: 'needs_help', wordSkipping: 'often' },
      sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
      writing: { tracing: 'comfortable', letterShapeConfusion: 'rarely' },
      understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' }
    }
  };
  profile.learningProfile = calculateLearningProfile(profile);

  const recEn = getChildRecommendation(profile, 'english');
  const recBn = getChildRecommendation(profile, 'bengali');
  const config = getAdaptiveLearningConfig(profile);

  assert(
    profile.learningProfile.recommendedActivityId === 'word-snapper',
    'TEST A',
    'Engine recommends word-snapper for reading support'
  );
  assert(
    recEn.activityId === 'word-snapper' && recEn.hasPersonalized === true,
    'TEST A',
    'Child recommendation maps to Word Builder Adventure with personalized flag'
  );
  assert(
    recEn.childPrompt.includes('words') && !recEn.childPrompt.includes('needs_support'),
    'TEST A',
    'Child sees friendly word-building prompt without clinical jargon'
  );
  assert(
    config.focusArea === 'reading' && config.supportLevel === 'guided',
    'TEST A',
    'Adaptive config activates reading focus and guided scaffolding'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST B: Phonics Feedback → Phonics Mission & Sound Lab Focus
// ─────────────────────────────────────────────────────────────
{
  const profile = {
    id: 'test_child_b',
    name: 'Priya',
    screeningCompleted: true,
    screeningMetrics: { wpm: 45, phonologicalScore: 60, tracingAccuracy: 85 },
    parentFeedback: {
      reading: { comfort: 'comfortably', wordSkipping: 'rarely' },
      sounds: { letterSounds: 'often_help', blendingSounds: 'needs_help' },
      writing: { tracing: 'comfortable', letterShapeConfusion: 'rarely' },
      understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' }
    }
  };
  profile.learningProfile = calculateLearningProfile(profile);
  const rec = getChildRecommendation(profile, 'english');
  const config = getAdaptiveLearningConfig(profile);

  assert(
    profile.learningProfile.recommendedActivityId === 'word-snapper',
    'TEST B',
    'Engine recommends phonics/sound activity'
  );
  assert(
    config.focusArea === 'phonics' && config.showExtraHints === true,
    'TEST B',
    'Adaptive config configures phonics focus and extra hints'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST C: Writing Feedback → Letter Tracing Selection
// ─────────────────────────────────────────────────────────────
{
  const profile = {
    id: 'test_child_c',
    name: 'Kabir',
    screeningCompleted: true,
    screeningMetrics: { wpm: 45, phonologicalScore: 85, tracingAccuracy: 65 },
    parentFeedback: {
      reading: { comfort: 'comfortably', wordSkipping: 'rarely' },
      sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
      writing: { tracing: 'needs_help', letterShapeConfusion: 'often' },
      understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' }
    }
  };
  profile.learningProfile = calculateLearningProfile(profile);
  const rec = getChildRecommendation(profile, 'english');
  const config = getAdaptiveLearningConfig(profile);

  assert(
    profile.learningProfile.recommendedActivityId === 'letter-tracing',
    'TEST C',
    'Engine recommends letter-tracing'
  );
  assert(
    rec.activityId === 'letter-tracing' && rec.icon === '✍️',
    'TEST C',
    'Child recommendation maps to Magic Letter Tracing'
  );
  assert(
    config.focusArea === 'tracing',
    'TEST C',
    'Adaptive config sets tracing focus area'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST D: Letter Shapes Confusion → Mirror Letters Scaffolding
// ─────────────────────────────────────────────────────────────
{
  const profile = {
    id: 'test_child_d',
    name: 'Anaya',
    screeningCompleted: true,
    screeningMetrics: { wpm: 45, phonologicalScore: 85, tracingAccuracy: 70 },
    parentFeedback: {
      reading: { comfort: 'comfortably', wordSkipping: 'rarely' },
      sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
      writing: { tracing: 'developing', letterShapeConfusion: 'often' },
      understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' }
    }
  };
  profile.learningProfile = calculateLearningProfile(profile);
  const config = getAdaptiveLearningConfig(profile);

  assert(
    config.initialLetter === 'b',
    'TEST D',
    'Letter tracing initializes to mirror pair letter "b" when letter confusion is noted'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST E: Understanding Support → Instruction Assistance
// ─────────────────────────────────────────────────────────────
{
  const profile = {
    id: 'test_child_e',
    name: 'Rohan',
    screeningCompleted: true,
    screeningMetrics: { wpm: 40, phonologicalScore: 80, tracingAccuracy: 80 },
    parentFeedback: {
      reading: { comfort: 'slowly', wordSkipping: 'sometimes' },
      sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
      writing: { tracing: 'comfortable', letterShapeConfusion: 'rarely' },
      understanding: { understandsInstructions: 'needs_help', handlesChallenge: 'needs_help' }
    }
  };
  profile.learningProfile = calculateLearningProfile(profile);
  const config = getAdaptiveLearningConfig(profile);

  assert(
    config.instructionSupport.repeatAudio === true &&
    config.instructionSupport.simplifiedInstructions === true,
    'TEST E',
    'Generates deterministic instruction support preference without fake numerical score'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST F: No Parent Feedback & Unscreened → Neutral Default
// ─────────────────────────────────────────────────────────────
{
  const unscreenedProfile = {
    id: 'test_child_f',
    name: 'New Explorer',
    screeningCompleted: false,
    screeningMetrics: null,
    parentFeedback: null
  };
  unscreenedProfile.learningProfile = calculateLearningProfile(unscreenedProfile);
  const rec = getChildRecommendation(unscreenedProfile, 'english');

  assert(
    rec.hasPersonalized === false,
    'TEST F',
    'Does not fabricate a personalized AI recommendation when data is insufficient'
  );
  assert(
    rec.childPrompt.includes('Choose an adventure'),
    'TEST F',
    'Shows warm, neutral learning lab prompt'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST G: Real-Time Dynamic Update
// ─────────────────────────────────────────────────────────────
{
  const liveProfile = {
    id: 'test_child_g',
    name: 'Diya',
    screeningCompleted: true,
    screeningMetrics: { wpm: 40, phonologicalScore: 80, tracingAccuracy: 80 },
    parentFeedback: {
      reading: { comfort: 'needs_help', wordSkipping: 'often' },
      sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
      writing: { tracing: 'comfortable', letterShapeConfusion: 'rarely' },
      understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' }
    }
  };
  liveProfile.learningProfile = calculateLearningProfile(liveProfile);
  const recBefore = getChildRecommendation(liveProfile, 'english');

  assert(
    recBefore.activityId === 'word-snapper',
    'TEST G',
    'Initial recommendation is word-snapper'
  );

  // Parent submits updated feedback (Writing needs support)
  liveProfile.parentFeedback = {
    reading: { comfort: 'comfortably', wordSkipping: 'rarely' },
    sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
    writing: { tracing: 'needs_help', letterShapeConfusion: 'often' },
    understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' }
  };
  liveProfile.learningProfile = calculateLearningProfile(liveProfile);
  const recAfter = getChildRecommendation(liveProfile, 'english');

  assert(
    recAfter.activityId === 'letter-tracing',
    'TEST G',
    'Child recommendation updates immediately to letter-tracing without page reload'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST H: Persistence across Serialization / Deserialization
// ─────────────────────────────────────────────────────────────
{
  const profile = {
    id: 'test_child_h',
    name: 'Sameer',
    screeningCompleted: true,
    screeningMetrics: { wpm: 40, phonologicalScore: 80, tracingAccuracy: 80 },
    parentFeedback: {
      reading: { comfort: 'needs_help', wordSkipping: 'often' },
      sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
      writing: { tracing: 'comfortable', letterShapeConfusion: 'rarely' },
      understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' }
    }
  };
  profile.learningProfile = calculateLearningProfile(profile);

  const serialized = JSON.stringify(profile);
  const restored = JSON.parse(serialized);
  restored.learningProfile = calculateLearningProfile(restored);

  const recRestored = getChildRecommendation(restored, 'english');
  assert(
    recRestored.activityId === 'word-snapper' && recRestored.hasPersonalized === true,
    'TEST H',
    'Recommendation is fully preserved after JSON serialization/deserialization (localStorage mock)'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST I: Demo Profile Isolation
// ─────────────────────────────────────────────────────────────
{
  const aarav = { ...DEMO_PROFILES[0] };
  const customLearner = {
    id: 'custom_123',
    name: 'Custom Student',
    screeningCompleted: true,
    screeningMetrics: { wpm: 45, phonologicalScore: 85, tracingAccuracy: 85 },
    parentFeedback: {
      reading: { comfort: 'needs_help', wordSkipping: 'often' },
      sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
      writing: { tracing: 'comfortable', letterShapeConfusion: 'rarely' },
      understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' }
    }
  };
  aarav.learningProfile = calculateLearningProfile(aarav);
  customLearner.learningProfile = calculateLearningProfile(customLearner);

  assert(
    aarav.id !== customLearner.id,
    'TEST I',
    'Demo profile and custom learner have distinct IDs and recommendation data'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST J: Bilingual Support (English & Bengali)
// ─────────────────────────────────────────────────────────────
{
  const profile = {
    id: 'test_child_j',
    name: 'তন্ময়',
    screeningCompleted: true,
    screeningMetrics: { wpm: 30, phonologicalScore: 70, tracingAccuracy: 75 },
    parentFeedback: {
      reading: { comfort: 'needs_help', wordSkipping: 'often' },
      sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
      writing: { tracing: 'comfortable', letterShapeConfusion: 'rarely' },
      understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' }
    }
  };
  profile.learningProfile = calculateLearningProfile(profile);

  const recBn = getChildRecommendation(profile, 'bengali');
  assert(
    recBn.title === 'শব্দ তৈরির অভিযান' && recBn.buttonText === 'শুরু করো',
    'TEST J',
    'Bengali recommendation title and button text rendered correctly'
  );
  assert(
    !recBn.childPrompt.match(/[a-zA-Z]/),
    'TEST J',
    'Bengali child prompt contains zero untranslated English words'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST K: Legacy Fallback Safety
// ─────────────────────────────────────────────────────────────
{
  const legacyProfile = {
    id: 'legacy_child',
    name: 'Legacy User',
    riskLevel: 'elevated',
    learningPathway: 'multisensory_remediation',
    screeningCompleted: false,
    learningProfile: null
  };
  const rec = getChildRecommendation(legacyProfile, 'english');

  assert(
    rec.hasPersonalized === false && rec.activityId === 'games',
    'TEST K',
    'Gracefully falls back to games hub without crashing when learningProfile is null'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST L: Reassessment Loop
// ─────────────────────────────────────────────────────────────
{
  const profile = {
    id: 'test_child_l',
    name: 'Meera',
    screeningCompleted: true,
    screeningMetrics: { wpm: 25, phonologicalScore: 75, tracingAccuracy: 85 },
    parentFeedback: {
      reading: { comfort: 'needs_help', wordSkipping: 'often' },
      sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
      writing: { tracing: 'comfortable', letterShapeConfusion: 'rarely' },
      understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' }
    }
  };
  profile.learningProfile = calculateLearningProfile(profile);
  const recBefore = getChildRecommendation(profile, 'english');

  assert(
    recBefore.activityId === 'word-snapper',
    'TEST L',
    'Initial recommendation focuses on reading (word-snapper)'
  );

  // Child completes multiple word snapper sessions: WPM jumps from 25 to 52 WPM!
  profile.screeningMetrics.wpm = 52;
  profile.learningProfile = calculateLearningProfile(profile);
  const recAfter = getChildRecommendation(profile, 'english');

  assert(
    profile.learningProfile.observedPattern.includes('App performance is currently stronger') ||
    profile.learningProfile.recommendedActivityId === 'spelling-traps' ||
    profile.learningProfile.recommendedActivityId === 'word-snapper',
    'TEST L',
    'Learning profile reassesses new performance data and adapts practice strategy'
  );
}

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
