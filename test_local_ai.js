// Automated Verification Suite for In-Browser Local AI Engine
import { analyzeParentObservationWithLocalAI } from './src/utils/localAiEngine.js';
import { calculateLearningProfile } from './src/utils/crossSignalIntelligence.js';

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
console.log('AKSHARMITRA — LOCAL AI ENGINE VERIFICATION SUITE');
console.log('====================================================\n');

// Test 1: Reading Cadence & Sight Words Note
{
  const text = "He reads very slowly and frequently skips words when reading a paragraph aloud.";
  const ai = analyzeParentObservationWithLocalAI(text);

  assert(
    ai !== null && ai.isLocalAI === true,
    'TEST 1',
    'Local AI engine processes free-text observation note'
  );
  assert(
    ai.primaryFocus === 'reading',
    'TEST 1',
    'Local AI correctly identifies reading as the primary support category'
  );
  assert(
    ai.affinityScores.reading >= 0.8,
    'TEST 1',
    'Reading affinity score is dominant'
  );
  assert(
    ai.extractedConcepts.some(c => c.includes('Word Skipping') || c.includes('Reading Cadence')),
    'TEST 1',
    'Extracts specific pedagogical friction concepts'
  );
}

// Test 2: Mirror Letter Reversal (b/d)
{
  const text = "She confuses b and d, writing them backward when practicing spelling.";
  const ai = analyzeParentObservationWithLocalAI(text);

  assert(
    ai.primaryFocus === 'tracing',
    'TEST 2',
    'Identifies handwriting/shape confusion as primary focus'
  );
  assert(
    ai.extractedConcepts.some(c => c.includes('Mirror Letter Reversal')),
    'TEST 2',
    'Identifies Mirror Letter Reversal (b/d/p/q) tag'
  );
}

// Test 3: Phonological / Sound Blending
{
  const text = "He struggles to hear the separate letter sounds and cannot blend syllables together.";
  const ai = analyzeParentObservationWithLocalAI(text);

  assert(
    ai.primaryFocus === 'speech',
    'TEST 3',
    'Identifies phonics and sound blending friction'
  );
}

// Test 4: Integration with Cross-Signal Intelligence
{
  const profile = {
    id: 'student_local_ai',
    name: 'Kabir',
    screeningCompleted: true,
    screeningMetrics: { wpm: 40, phonologicalScore: 78, tracingAccuracy: 80 },
    parentFeedback: {
      reading: { comfort: null, wordSkipping: null },
      sounds: { letterSounds: null, blendingSounds: null },
      writing: { tracing: null, letterShapeConfusion: null },
      understanding: { understandsInstructions: null, handlesChallenge: null },
      parentObservation: "Child frequently gets confused with b and d letters when tracing."
    }
  };

  const learningProfile = calculateLearningProfile(profile);

  assert(
    learningProfile.localAiReasoning !== null,
    'TEST 4',
    'Local AI reasoning is attached to the learning profile'
  );
  assert(
    learningProfile.evidence.parentObservation.some(e => e.includes('Local AI Insight')),
    'TEST 4',
    'Local AI synthesized insight is included in parent observation evidence'
  );
}

// Test 5: Empty / Null Note Safety
{
  const aiNull = analyzeParentObservationWithLocalAI(null);
  const aiEmpty = analyzeParentObservationWithLocalAI('   ');

  assert(
    aiNull === null && aiEmpty === null,
    'TEST 5',
    'Gracefully returns null for empty/null notes without throwing exceptions'
  );
}

console.log('\n====================================================');
console.log(`LOCAL AI TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
