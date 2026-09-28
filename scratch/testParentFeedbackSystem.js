/**
 * Verification Script for Parent Feedback Flow in AksharMitra
 * Tests all required cases:
 * Case 1: No observation → Not observed yet (null signals & screening fallback)
 * Case 2: Writing difficulty → tracing/letter-writing support
 * Case 3: Reading difficulty → reading practice
 * Case 4: Sound difficulty → phonics/speech practice
 * Case 5: Multiple observations → combined recommendation
 * Case 6: Updated observation → recommendation updates dynamically
 */

if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

import { createEmptyParentFeedback, hasParentFeedbackData } from '../ai/src/parentFeedbackModel.js';
import { calculateLearningProfile, calculateParentObservationSignals } from '../ai/src/crossSignalIntelligence.js';
import { getChildRecommendation } from '../ai/src/adaptiveLearningStrategy.js';
import { saveParentObservation, getParentObservation } from '../database/src/services/parentObservationService.js';

let allPassed = true;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASSED: ${message}`);
  } else {
    console.error(`❌ FAILED: ${message}`);
    allPassed = false;
  }
}

console.log('====================================================');
console.log('      AKSHAR MITRA PARENT FEEDBACK SYSTEM AUDIT     ');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST CASE 1: No observation → Not observed yet
// ----------------------------------------------------
console.log('--- TEST CASE 1: No Parent Observation ---');
const emptyFeedback = createEmptyParentFeedback();
assert(!hasParentFeedbackData(emptyFeedback), 'hasParentFeedbackData is false for empty feedback');

const emptySignals = calculateParentObservationSignals(emptyFeedback);
assert(
  emptySignals.reading === null &&
  emptySignals.speech === null &&
  emptySignals.tracing === null &&
  emptySignals.understanding === null,
  'All parent observation signals are null when no observation exists'
);

const profileNoObs = {
  id: 'test_child_no_obs',
  name: 'TestChild1',
  screeningCompleted: false,
  parentFeedback: emptyFeedback
};

const profileNoObsResult = calculateLearningProfile(profileNoObs);
assert(
  profileNoObsResult.observedPattern.includes('No parent observations') || profileNoObsResult.observedPattern.includes('Not enough'),
  'Observed pattern correctly reflects no observation data'
);
assert(
  profileNoObsResult.evidence.parentObservation.length === 0,
  'Evidence parentObservation list is empty (no fake/default support statuses)'
);

// ----------------------------------------------------
// TEST CASE 2: Writing difficulty → tracing/letter-writing support
// ----------------------------------------------------
console.log('\n--- TEST CASE 2: Writing Difficulty ---');
const writingFeedback = {
  ...createEmptyParentFeedback(),
  lastUpdatedAt: new Date().toISOString(),
  writing: { tracing: 'needs_help', letterShapeConfusion: 'often' }
};

assert(hasParentFeedbackData(writingFeedback), 'hasParentFeedbackData is true for writing feedback');
const writingSignals = calculateParentObservationSignals(writingFeedback);
assert(writingSignals.tracing === 'needs_support', 'Derived tracing signal is "needs_support"');

const profileWriting = {
  id: 'test_child_writing',
  name: 'TestChild2',
  parentFeedback: writingFeedback
};

const resultWriting = calculateLearningProfile(profileWriting);
assert(resultWriting.recommendedActivityId === 'letter-tracing', 'Recommended activity is "letter-tracing"');
assert(resultWriting.recommendedActivityTitle.includes('Letter Tracing'), 'Recommended title includes "Letter Tracing"');
assert(resultWriting.evidence.parentObservation.length > 0, 'Parent observation evidence is attached');

const childRecWriting = getChildRecommendation(profileWriting, 'english');
assert(childRecWriting.hasPersonalized === true, 'Child recommendation hasPersonalized is true');
assert(childRecWriting.activityId === 'letter-tracing', 'Child recommendation activity is "letter-tracing"');

// ----------------------------------------------------
// TEST CASE 3: Reading difficulty → reading practice
// ----------------------------------------------------
console.log('\n--- TEST CASE 3: Reading Difficulty ---');
const readingFeedback = {
  ...createEmptyParentFeedback(),
  lastUpdatedAt: new Date().toISOString(),
  reading: { comfort: 'needs_help', wordSkipping: 'often' }
};

const readingSignals = calculateParentObservationSignals(readingFeedback);
assert(readingSignals.reading === 'needs_support', 'Derived reading signal is "needs_support"');

const profileReading = {
  id: 'test_child_reading',
  name: 'TestChild3',
  parentFeedback: readingFeedback
};

const resultReading = calculateLearningProfile(profileReading);
assert(resultReading.recommendedActivityId === 'word-snapper', 'Recommended activity is "word-snapper"');
assert(resultReading.recommendedActivityTitle.includes('Word Snapper') || resultReading.recommendedActivityTitle.includes('Reading'), 'Recommended title includes Reading/Word Snapper');

const childRecReading = getChildRecommendation(profileReading, 'english');
assert(childRecReading.activityId === 'word-snapper', 'Child recommendation activity is "word-snapper"');

// ----------------------------------------------------
// TEST CASE 4: Sound difficulty → phonics/speech practice
// ----------------------------------------------------
console.log('\n--- TEST CASE 4: Sound Difficulty ---');
const soundFeedback = {
  ...createEmptyParentFeedback(),
  lastUpdatedAt: new Date().toISOString(),
  sounds: { letterSounds: 'often_help', blendingSounds: 'needs_help' }
};

const soundSignals = calculateParentObservationSignals(soundFeedback);
assert(soundSignals.speech === 'needs_support', 'Derived speech/sound signal is "needs_support"');

const profileSound = {
  id: 'test_child_sound',
  name: 'TestChild4',
  parentFeedback: soundFeedback
};

const resultSound = calculateLearningProfile(profileSound);
assert(resultSound.recommendedActivityId === 'word-snapper', 'Recommended activity is "word-snapper"');
assert(resultSound.recommendedActivityTitle.includes('Phonics') || resultSound.recommendedActivityTitle.includes('Sound'), 'Recommended title includes Phonics/Sound');

// ----------------------------------------------------
// TEST CASE 5: Multiple observations → combined recommendation
// ----------------------------------------------------
console.log('\n--- TEST CASE 5: Multiple Observations ---');
const multiFeedback = {
  ...createEmptyParentFeedback(),
  lastUpdatedAt: new Date().toISOString(),
  writing: { tracing: 'needs_help', letterShapeConfusion: 'often' },
  reading: { comfort: 'needs_help', wordSkipping: 'often' }
};

const multiSignals = calculateParentObservationSignals(multiFeedback);
assert(multiSignals.tracing === 'needs_support' && multiSignals.reading === 'needs_support', 'Both tracing and reading signals are "needs_support"');

const profileMulti = {
  id: 'test_child_multi',
  name: 'TestChild5',
  parentFeedback: multiFeedback
};

const resultMulti = calculateLearningProfile(profileMulti);
assert(
  resultMulti.observedPattern.includes('both') || resultMulti.observedPattern.includes('multiple'),
  'Observed pattern mentions multiple support areas'
);
assert(
  resultMulti.recommendedPractice.includes('Combined') || resultMulti.recommendedPractice.includes('multisensory'),
  'Recommended practice is a combined practice plan'
);
assert(resultMulti.evidence.parentObservation.length >= 2, 'Evidence includes items for multiple parent observation areas');

async function runAudit() {
  console.log('\n--- TEST CASE 6: Updated Observation & Persistence ---');
  const testLearnerId = 'test_learner_persistence_check';
  // Save initial observation (writing difficulty)
  await saveParentObservation(testLearnerId, writingFeedback);
  const fetchedInitial = await getParentObservation(testLearnerId);
  assert(fetchedInitial !== null, 'getParentObservation retrieves cached observation');
  assert(fetchedInitial?.writing?.tracing === 'needs_help', 'Initial observation writing difficulty is preserved');

  const profileInitial = { id: testLearnerId, name: 'PersistentChild', parentFeedback: fetchedInitial };
  const profileInitialResult = calculateLearningProfile(profileInitial);
  assert(profileInitialResult.recommendedActivityId === 'letter-tracing', 'Initial profile recommends "letter-tracing"');

  // Now update observation to sound difficulty
  await saveParentObservation(testLearnerId, soundFeedback);
  const fetchedUpdated = await getParentObservation(testLearnerId);
  assert(fetchedUpdated?.sounds?.letterSounds === 'often_help', 'Updated observation sound difficulty is preserved');

  const profileUpdated = { id: testLearnerId, name: 'PersistentChild', parentFeedback: fetchedUpdated };
  const profileUpdatedResult = calculateLearningProfile(profileUpdated);
  assert(profileUpdatedResult.recommendedActivityId === 'word-snapper', 'Updated profile recommendation switches to "word-snapper"');
  assert(profileUpdatedResult.recommendedActivityTitle.includes('Phonics'), 'Updated profile title includes "Phonics"');

  console.log('\n====================================================');
  if (allPassed) {
    console.log('🎉 ALL 6 PARENT FEEDBACK AUDIT TESTS PASSED! 🎉');
  } else {
    console.error('⚠️ SOME TESTS FAILED! PLEASE REVIEW LOGS.');
  }
  console.log('====================================================');
}

runAudit();
