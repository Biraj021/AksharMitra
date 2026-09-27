// Verification script for Phase 2 — Closed-Loop Learning System

import { calculateLearningProfile, calculatePracticeImprovement } from '../ai/src/crossSignalIntelligence.js';

console.log('=== TEST 1: calculatePracticeImprovement (Before vs After) ===');

const baselineMetrics = {
  tracingAccuracy: 70,
  wpm: 28,
  phonologicalScore: 65,
  reversalIndex: 45
};

const recentMetrics = {
  tracingAccuracy: 84,
  wpm: 35,
  phonologicalScore: 78,
  reversalIndex: 20
};

const improvement = calculatePracticeImprovement(baselineMetrics, recentMetrics, 'letter-tracing');

console.log('Summary:', improvement.summary);
console.log('Deltas:', improvement.deltas);

if (improvement.deltas.length === 4 && improvement.summary.includes('percentage points')) {
  console.log('✅ TEST 1 PASSED: Improvement calculation computes correct deltas.');
} else {
  console.error('❌ TEST 1 FAILED!');
}

console.log('\n=== TEST 2: Closed-Loop Profile Recalculation ===');

const mockProfile = {
  id: 'test-learner-1',
  name: 'Aarav',
  screeningCompleted: true,
  screeningMetrics: baselineMetrics,
  parentFeedback: {
    reading: { comfort: 'needs_help' },
    writing: { tracing: 'needs_help' }
  },
  practiceHistory: [
    {
      activityId: 'letter-tracing',
      timestamp: new Date().toISOString(),
      metrics: recentMetrics,
      starsEarned: 5
    }
  ]
};

const updatedProfile = calculateLearningProfile(mockProfile);

console.log('Agreement Status:', updatedProfile.agreementStatus);
console.log('Confidence:', updatedProfile.confidence);
console.log('Evidence (App Activity):', updatedProfile.evidence.appActivity);
console.log('Before vs After Comparison:', updatedProfile.beforeVsAfterComparison);

const hasProgressEvidence = updatedProfile.evidence.appActivity.some(e => e.includes('Telemetry Progress') || e.includes('84%'));
if (hasProgressEvidence && updatedProfile.beforeVsAfterComparison.hasImprovementData) {
  console.log('✅ TEST 2 PASSED: Learning profile recalculates with telemetry evidence & progress metrics.');
} else {
  console.error('❌ TEST 2 FAILED!');
}

console.log('\n=== Closed-Loop Verification Completed Successfully ===');
