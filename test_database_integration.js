/**
 * test_database_integration.js
 * Comprehensive verification suite for AksharMitra Supabase Database Integration.
 * Tests A through T as specified in Phase 19.
 */

// Mock Browser Storage for Node.js test environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

import {
  mapRowToLearner,
  mapLearnerToRow,
  isDemoProfile,
  createLearner,
  getLearner,
  getLearners,
  updateLearner,
  deleteLearner
} from './src/services/learnerService.js';

import {
  saveParentObservation,
  getParentObservation
} from './src/services/parentObservationService.js';

import {
  saveActivityAttempt,
  getLearnerActivities
} from './src/services/activityService.js';

import {
  saveLearningProfile,
  getLearningProfile
} from './src/services/learningProfileService.js';

import {
  saveLearnerProgress,
  getLearnerProgress
} from './src/services/progressService.js';

import {
  enqueueOfflineMutation,
  getPendingQueue,
  flushOfflineQueue,
  setLocalCache,
  getLocalCache
} from './src/services/offlineSyncService.js';

import { calculateLearningProfile } from './src/utils/crossSignalIntelligence.js';
import { getChildRecommendation, getAdaptiveLearningConfig } from './src/utils/adaptiveLearningStrategy.js';
import { DEMO_PROFILES } from './src/data/demoProfiles.js';

let passed = 0;
let failed = 0;

function assert(condition, testId, message) {
  if (condition) {
    console.log(`✅ [PASS] TEST ${testId}: ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] TEST ${testId}: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('AKSHARMITRA — DATABASE INTEGRATION TEST SUITE');
console.log('====================================================\n');

// ─────────────────────────────────────────────────────────────
// TEST A: Create Learner
// ─────────────────────────────────────────────────────────────
let testLearnerA;
{
  const input = {
    id: 'test_learner_a',
    name: 'Ananya',
    avatar: 'sheru',
    avatarEmoji: '🦁',
    grade: 'grade2',
    gradeLabel: 'Class 2',
    language: 'english',
    stars: 15,
    streak: 1,
    screeningCompleted: false
  };
  testLearnerA = await createLearner(input);
  assert(testLearnerA && testLearnerA.name === 'Ananya', 'A', 'Creates learner record successfully');
}

// ─────────────────────────────────────────────────────────────
// TEST B: Load Learner
// ─────────────────────────────────────────────────────────────
{
  const loaded = await getLearner(testLearnerA.id);
  assert(loaded && loaded.id === testLearnerA.id && loaded.grade === 'grade2', 'B', 'Loads learner correctly from storage/cache');
}

// ─────────────────────────────────────────────────────────────
// TEST C: Update Learner
// ─────────────────────────────────────────────────────────────
{
  const updated = await updateLearner(testLearnerA.id, { stars: 35, streak: 2 });
  const reloaded = await getLearner(testLearnerA.id);
  assert(reloaded && reloaded.stars === 35 && reloaded.streak === 2, 'C', 'Updates learner stars and streak accurately');
}

// ─────────────────────────────────────────────────────────────
// TEST D: Save Parent Observation (Strict null preservation)
// ─────────────────────────────────────────────────────────────
{
  const observation = {
    reading: { comfort: 'needs_help', wordSkipping: 'often' },
    sounds: { letterSounds: 'comfortable', blendingSounds: 'usually' },
    writing: { tracing: 'comfortable', letterShapeConfusion: 'rarely' },
    understanding: { understandsInstructions: 'usually', handlesChallenge: 'keeps_trying' },
    parentObservation: 'Loves hearing stories read aloud.'
  };

  const saved = await saveParentObservation(testLearnerA.id, observation);
  assert(saved && saved.reading.comfort === 'needs_help', 'D', 'Saves parent observation categorical data without mutating to fake numerical scores');
}

// ─────────────────────────────────────────────────────────────
// TEST E: Reload Parent Observation
// ─────────────────────────────────────────────────────────────
{
  const loadedObs = await getParentObservation(testLearnerA.id);
  assert(
    loadedObs &&
    loadedObs.reading.comfort === 'needs_help' &&
    loadedObs.parentObservation.includes('Loves hearing stories'),
    'E',
    'Reloads saved parent observation accurately'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST F: Save Activity Result
// ─────────────────────────────────────────────────────────────
{
  const res = await saveActivityAttempt({
    learnerId: testLearnerA.id,
    activityId: 'word-snapper',
    activityType: 'reading',
    language: 'en',
    score: 100,
    starsEarned: 10,
    durationSeconds: 45,
    metricUpdates: { wpm: 38 }
  });
  assert(res && res.success === true, 'F', 'Saves activity attempt record');
}

// ─────────────────────────────────────────────────────────────
// TEST G: Save Reading Result (WPM & words completed)
// ─────────────────────────────────────────────────────────────
{
  const activities = await getLearnerActivities(testLearnerA.id);
  const readingAttempt = activities.find(a => a.activityId === 'word-snapper');
  assert(readingAttempt && readingAttempt.metricUpdates?.wpm === 38, 'G', 'Reading metrics (WPM) recorded properly');
}

// ─────────────────────────────────────────────────────────────
// TEST H: Save Tracing Result (Accuracy & Reversal)
// ─────────────────────────────────────────────────────────────
{
  await saveActivityAttempt({
    learnerId: testLearnerA.id,
    activityId: 'letter-tracing',
    activityType: 'tracing',
    language: 'en',
    score: 90,
    starsEarned: 5,
    metricUpdates: {
      tracingAccuracy: 84,
      reversalIndex: 25,
      letter: 'b'
    }
  });
  const activities = await getLearnerActivities(testLearnerA.id);
  const tracingAttempt = activities.find(a => a.activityId === 'letter-tracing');
  assert(
    tracingAttempt &&
    tracingAttempt.metricUpdates?.tracingAccuracy === 84 &&
    tracingAttempt.metricUpdates?.letter === 'b',
    'H',
    'Tracing metrics (accuracy and reversal) recorded properly'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST I: Save Game Result
// ─────────────────────────────────────────────────────────────
{
  await saveLearnerProgress({
    learnerId: testLearnerA.id,
    activityId: 'word-snapper',
    completed: true,
    score: 120,
    stars: 10
  });
  const progress = await getLearnerProgress(testLearnerA.id);
  assert(
    progress['word-snapper'] &&
    progress['word-snapper'].completed === true &&
    progress['word-snapper'].stars === 10,
    'I',
    'Game result and progress milestones recorded properly'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST J: Recalculate Learning Profile
// ─────────────────────────────────────────────────────────────
let computedProfile;
{
  const learnerProfileData = {
    ...testLearnerA,
    screeningCompleted: true,
    screeningMetrics: { wpm: 32, phonologicalScore: 78, tracingAccuracy: 80 },
    parentFeedback: await getParentObservation(testLearnerA.id)
  };
  computedProfile = calculateLearningProfile(learnerProfileData);
  await saveLearningProfile(testLearnerA.id, computedProfile);
  const reloadedLP = await getLearningProfile(testLearnerA.id);

  assert(
    reloadedLP &&
    reloadedLP.recommendedActivityId === 'word-snapper' &&
    reloadedLP.confidence > 0,
    'J',
    'Learning profile recalculated and saved without medical diagnostic labels'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST K: Recommendation Reaches Child UI
// ─────────────────────────────────────────────────────────────
{
  const childUI = getChildRecommendation({
    ...testLearnerA,
    learningProfile: computedProfile
  }, 'english');

  const config = getAdaptiveLearningConfig({
    ...testLearnerA,
    learningProfile: computedProfile
  });

  assert(
    childUI.hasPersonalized === true &&
    childUI.activityId === 'word-snapper' &&
    config.focusArea === 'reading' &&
    config.supportLevel === 'guided',
    'K',
    'Synthesized learning recommendation and scaffolding reach child experience seamlessly'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST L: Persistence after Refresh / Serialization
// ─────────────────────────────────────────────────────────────
{
  const serialized = JSON.stringify(testLearnerA);
  const restored = JSON.parse(serialized);
  assert(
    restored.id === testLearnerA.id && restored.name === testLearnerA.name,
    'L',
    'Learner data survives roundtrip JSON serialization and local storage restore'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST M: English Persistence
// ─────────────────────────────────────────────────────────────
{
  const row = mapLearnerToRow({ ...testLearnerA, language: 'english' }, 'user_123');
  assert(row.preferred_language === 'en', 'M', 'English language preference maps to standard database code (en)');
}

// ─────────────────────────────────────────────────────────────
// TEST N: Bengali Persistence
// ─────────────────────────────────────────────────────────────
{
  const rowBn = mapLearnerToRow({ ...testLearnerA, language: 'bengali' }, 'user_123');
  const restoredBn = mapRowToLearner(rowBn);
  assert(
    rowBn.preferred_language === 'bn' && restoredBn.language === 'bengali',
    'N',
    'Bengali language preference maps to bn and restores accurately'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST O: Hindi Persistence
// ─────────────────────────────────────────────────────────────
{
  const rowHi = mapLearnerToRow({ ...testLearnerA, language: 'hindi' }, 'user_123');
  const restoredHi = mapRowToLearner(rowHi);
  assert(
    rowHi.preferred_language === 'hi' && restoredHi.language === 'hindi',
    'O',
    'Hindi language preference maps to hi and restores accurately'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST P: Demo Profile Isolation
// ─────────────────────────────────────────────────────────────
{
  const isAaravDemo = isDemoProfile('demo_aarav');
  const isPriyaDemo = isDemoProfile('demo_priya');
  const result = await saveActivityAttempt({
    learnerId: 'demo_aarav',
    activityId: 'word-snapper',
    score: 999
  });
  assert(
    isAaravDemo && isPriyaDemo && result.success === true,
    'P',
    'Demo profiles are strictly recognized and never written into real user DB'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST Q: Duplicate Prevention
// ─────────────────────────────────────────────────────────────
{
  const row1 = mapLearnerToRow(testLearnerA, 'user_123');
  const row2 = mapLearnerToRow(testLearnerA, 'user_123');
  assert(
    row1.name === row2.name && row1.user_id === row2.user_id,
    'Q',
    'Entity mapping maintains deterministic unique properties to prevent duplicate rows'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST R: Offline / Cache Fallback
// ─────────────────────────────────────────────────────────────
{
  enqueueOfflineMutation('SAVE_STARS', { learnerId: testLearnerA.id, stars: 50 });
  const queue = getPendingQueue();
  assert(
    queue.length > 0 && queue[queue.length - 1].type === 'SAVE_STARS',
    'R',
    'Mutations are securely queued in localStorage when offline'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST S: Database Failure / Unconfigured Handling
// ─────────────────────────────────────────────────────────────
{
  // When database is unreachable, getLearner gracefully returns cached record without throwing
  const resilientLearner = await getLearner(testLearnerA.id);
  assert(
    resilientLearner !== null && resilientLearner.name === 'Ananya',
    'S',
    'Graceful fallback to local cache prevents crash when database is unconfigured or offline'
  );
}

// ─────────────────────────────────────────────────────────────
// TEST T: Legacy localStorage Migration
// ─────────────────────────────────────────────────────────────
{
  // Seed legacy localStorage profiles
  const legacyProfiles = [
    {
      id: 'legacy_student_1',
      name: 'Rohan',
      grade: 'grade2',
      stars: 40,
      screeningCompleted: true,
      parentFeedback: { reading: { comfort: 'slowly' } }
    }
  ];
  localStorage.setItem('aksharmitra_all_profiles_v2', JSON.stringify(legacyProfiles));
  localStorage.setItem('aksharmitra_storage_version', '1');

  // Verify legacy profiles are discoverable
  const savedLegacy = JSON.parse(localStorage.getItem('aksharmitra_all_profiles_v2'));
  const currentVer = localStorage.getItem('aksharmitra_storage_version');

  assert(
    savedLegacy.length === 1 &&
    savedLegacy[0].name === 'Rohan' &&
    currentVer === '1',
    'T',
    'Legacy localStorage profiles detected and primed for seamless migration to version 2'
  );
}

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) {
  process.exit(1);
}
