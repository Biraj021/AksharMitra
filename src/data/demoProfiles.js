export const DEMO_PROFILES = [
  {
    id: 'demo_aarav',
    name: 'Aarav',
    avatar: 'sheru',
    avatarEmoji: '🦁',
    grade: 'grade2',
    gradeLabel: 'Grade 2',
    language: 'english',
    stars: 85,
    streak: 4,
    screeningCompleted: true,
    riskLevel: 'elevated', // 'typical' | 'mild' | 'elevated'
    riskScore: 78,
    screeningMetrics: {
      reversalIndex: 82, // High reversal on b vs d and p vs q
      fluencyHesitation: 65, // Hesitation on multi-syllable phonemes
      phonologicalScore: 58, // Struggles with rhyme isolation
      tracingAccuracy: 62,
      confusionsDetected: ['b / d (Mirror reversal)', 'p / q (Vertical flip)', 'was / saw (Transposition)'],
      wpm: 24, // Expected: 50+
      dateCompleted: 'Today'
    },
    recommendation: 'Targeted tactile multisensory tracing for b/d discrimination and phonological rhyming games recommended. Follow-up with school reading specialist advised.',
    description: '⚠️ At-Risk Profile (Letter Reversal & Reading Hesitation Flagged)'
  },
  {
    id: 'demo_priya',
    name: 'Priya',
    avatar: 'mayur',
    avatarEmoji: '🦚',
    grade: 'grade3',
    gradeLabel: 'Grade 3',
    language: 'english',
    stars: 160,
    streak: 12,
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
