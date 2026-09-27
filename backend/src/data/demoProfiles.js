export const DEMO_PROFILES = [
  {
    id: 'demo_aarav',
    kidCode: 'AM-1001',
    name: 'Aarav',
    avatar: 'sheru',
    avatarEmoji: '🦁',
    grade: 'grade2',
    gradeLabel: 'Grade 2',
    language: 'english',
    stars: 85,
    streak: 2,
    attendanceHistory: (() => {
      const dates = [];
      const now = new Date();
      for (let i = 0; i < 2; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }
      return dates.reverse();
    })(),
    screeningCompleted: true,
    riskLevel: 'elevated', // 'typical' | 'mild' | 'elevated'
    riskScore: 78,
    screeningMetrics: {
      reversalIndex: 65, // High reversal on b vs d and p vs q
      fluencyHesitation: 65, // Hesitation on multi-syllable phonemes
      phonologicalScore: 58, // Struggles with rhyme isolation
      tracingAccuracy: 64,
      confusionsDetected: ['b / d (Mirror reversal)', 'p / q (Vertical flip)', 'was / saw (Transposition)'],
      wpm: 24, // Expected: 50+
      dateCompleted: 'Today'
    },
    parentFeedback: {
      reading: { comfort: 'needs_help', wordSkipping: 'often' },
      sounds: { letterSounds: 'often_help', blendingSounds: 'needs_help' },
      writing: { tracing: 'needs_help', letterShapeConfusion: 'often' },
      understanding: { understandsInstructions: 'sometimes', handlesChallenge: 'needs_encouragement' },
      parentObservation: 'Aarav often gets frustrated when writing letters b and d, and skips small words while reading aloud.'
    },
    practiceHistory: [
      {
        activityId: 'letter-tracing',
        timestamp: new Date().toISOString(),
        metrics: {
          tracingAccuracy: 82,
          reversalIndex: 35,
          wpm: 32,
          phonologicalScore: 72
        },
        starsEarned: 5
      }
    ],
    latestImprovementDelta: {
      hasData: true,
      activityId: 'letter-tracing',
      summary: 'Letter Tracing accuracy improved by +18 percentage points (64% → 82%) and spatial reversal confusion dropped by -30 percentage points.',
      deltas: [
        { metric: 'tracingAccuracy', label: 'Letter Tracing Accuracy', before: 64, after: 82, delta: 18, unit: '%', formatted: 'Tracing accuracy: 64% → 82% (+18 percentage points)' },
        { metric: 'reversalIndex', label: 'Spatial Letter Reversal Rate', before: 65, after: 35, delta: -30, unit: '%', formatted: 'Reversal confusion rate: 65% → 35% (-30 percentage points)' },
        { metric: 'wpm', label: 'Reading Speed', before: 24, after: 32, delta: 8, unit: 'WPM', formatted: 'Reading speed: 24 WPM → 32 WPM (+8 WPM)' }
      ]
    },
    recommendation: 'Targeted tactile multisensory tracing for b/d discrimination and phonological rhyming games recommended.',
    description: '⚠️ At-Risk Learning Profile (Letter Reversal & Reading Hesitation Flagged)'
  },
  {
    id: 'demo_priya',
    kidCode: 'AM-1002',
    name: 'Priya',
    avatar: 'mayur',
    avatarEmoji: '🦚',
    grade: 'grade3',
    gradeLabel: 'Grade 3',
    language: 'english',
    stars: 160,
    streak: 12,
    attendanceHistory: (() => {
      const dates = [];
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${day}`);
      }
      return dates.reverse();
    })(),
    screeningCompleted: true,
    riskLevel: 'typical',
    riskScore: 22,
    screeningMetrics: {
      reversalIndex: 15,
      fluencyHesitation: 20,
      phonologicalScore: 92,
      tracingAccuracy: 88,
      confusionsDetected: ['None significant'],
      wpm: 68,
      dateCompleted: 'Yesterday'
    },
    recommendation: 'Age-appropriate milestone progression. Continue standard story reading and vocabulary exploration games.',
    description: '✅ Typical Benchmark Profile (Age-Appropriate Milestones)'
  }
];
