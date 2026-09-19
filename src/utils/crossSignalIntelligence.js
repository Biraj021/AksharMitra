// Cross-Signal Intelligence Engine for AksharMitra (Simplified 4-Section Design)
// Combines objective in-app activity signals with subjective parent home observations
// Strictly educational support & personalized practice — ZERO medical/diagnostic claims

import { hasParentFeedbackData } from './parentFeedbackModel.js';
import { analyzeParentObservationWithLocalAI } from './localAiEngine.js';

/**
 * Converts raw parent feedback answers into structured observation signals.
 * Unanswered questions remain null. Never fabricates values or treats null as zero.
 */
export function calculateParentObservationSignals(parentFeedback) {
  if (!parentFeedback || !hasParentFeedbackData(parentFeedback)) {
    return {
      reading: null,
      speech: null,
      tracing: null,
      understanding: null,
      comprehension: null,
      engagement: null
    };
  }

  // 1. Reading Observation Signal
  let readingSignal = null;
  const r = parentFeedback.reading || {};
  const readingItems = [];

  if (r.comfort) {
    if (r.comfort === 'struggles_independently' || r.comfort === 'needs_help') readingItems.push(1);
    else if (r.comfort === 'slowly') readingItems.push(2);
    else if (r.comfort === 'comfortably') readingItems.push(3);
  }
  if (r.wordSkipping) {
    if (r.wordSkipping === 'often') readingItems.push(1);
    else if (r.wordSkipping === 'sometimes') readingItems.push(2);
    else if (r.wordSkipping === 'rarely') readingItems.push(3);
  }
  // Backward compatibility check
  if (r.independentReading) {
    if (r.independentReading === 'needs_help') readingItems.push(1);
    else if (r.independentReading === 'developing') readingItems.push(2);
    else if (r.independentReading === 'comfortably') readingItems.push(3);
  }

  if (readingItems.length > 0) {
    const avg = readingItems.reduce((a, b) => a + b, 0) / readingItems.length;
    if (avg <= 1.5) readingSignal = 'needs_support';
    else if (avg <= 2.4) readingSignal = 'developing';
    else readingSignal = 'comfortable';
  }

  // 2. Sounds & Phonics (Speech) Observation Signal
  let speechSignal = null;
  const s = parentFeedback.sounds || {};
  const speechItems = [];

  if (s.letterSounds) {
    if (s.letterSounds === 'often_help') speechItems.push(1);
    else if (s.letterSounds === 'sometimes_help') speechItems.push(2);
    else if (s.letterSounds === 'comfortable') speechItems.push(3);
  }
  if (s.blendingSounds) {
    if (s.blendingSounds === 'needs_help') speechItems.push(1);
    else if (s.blendingSounds === 'sometimes') speechItems.push(2);
    else if (s.blendingSounds === 'usually') speechItems.push(3);
  }
  // Backward compatibility check
  if (s.pronunciation) {
    if (s.pronunciation === 'needs_help') speechItems.push(1);
    else if (s.pronunciation === 'sometimes_unclear') speechItems.push(2);
    else if (s.pronunciation === 'clear') speechItems.push(3);
  }

  if (speechItems.length > 0) {
    const avg = speechItems.reduce((a, b) => a + b, 0) / speechItems.length;
    if (avg <= 1.5) speechSignal = 'needs_support';
    else if (avg <= 2.4) speechSignal = 'developing';
    else speechSignal = 'comfortable';
  }

  // 3. Writing & Letters (Tracing / Visual) Observation Signal
  let tracingSignal = null;
  const w = parentFeedback.writing || {};
  const writingItems = [];

  if (w.tracing) {
    if (w.tracing === 'needs_help') writingItems.push(1);
    else if (w.tracing === 'developing') writingItems.push(2);
    else if (w.tracing === 'comfortable') writingItems.push(3);
  }
  if (w.letterShapeConfusion) {
    if (w.letterShapeConfusion === 'often') writingItems.push(1);
    else if (w.letterShapeConfusion === 'sometimes') writingItems.push(2);
    else if (w.letterShapeConfusion === 'rarely') writingItems.push(3);
  }
  // Backward compatibility check
  if (w.letterRecall) {
    if (w.letterRecall === 'often_confused') writingItems.push(1);
    else if (w.letterRecall === 'sometimes_confused') writingItems.push(2);
    else if (w.letterRecall === 'comfortable') writingItems.push(3);
  }

  if (writingItems.length > 0) {
    const avg = writingItems.reduce((a, b) => a + b, 0) / writingItems.length;
    if (avg <= 1.5) tracingSignal = 'needs_support';
    else if (avg <= 2.4) tracingSignal = 'developing';
    else tracingSignal = 'comfortable';
  }

  // 4. Understanding & Learning Support Observation Signal
  let understandingSignal = null;
  const u = parentFeedback.understanding || {};
  const underItems = [];

  if (u.understandsInstructions) {
    if (u.understandsInstructions === 'needs_help') underItems.push(1);
    else if (u.understandsInstructions === 'sometimes') underItems.push(2);
    else if (u.understandsInstructions === 'usually') underItems.push(3);
  }
  if (u.handlesChallenge) {
    if (u.handlesChallenge === 'needs_help') underItems.push(1);
    else if (u.handlesChallenge === 'needs_encouragement') underItems.push(2);
    else if (u.handlesChallenge === 'keeps_trying') underItems.push(3);
  }

  // Backward compatibility for old comprehension & attention fields
  const oldComp = parentFeedback.comprehension || {};
  if (oldComp.understandsSpokenInstructions) {
    if (oldComp.understandsSpokenInstructions === 'needs_repetition') underItems.push(1);
    else if (oldComp.understandsSpokenInstructions === 'sometimes') underItems.push(2);
    else if (oldComp.understandsSpokenInstructions === 'usually') underItems.push(3);
  }
  const oldAttn = parentFeedback.attention || {};
  if (oldAttn.staysEngaged) {
    if (oldAttn.staysEngaged === 'often_needs_encouragement') underItems.push(1);
    else if (oldAttn.staysEngaged === 'sometimes_distracted') underItems.push(2);
    else if (oldAttn.staysEngaged === 'enjoys_activities') underItems.push(3);
  }

  if (underItems.length > 0) {
    const avg = underItems.reduce((a, b) => a + b, 0) / underItems.length;
    if (avg <= 1.5) understandingSignal = 'needs_support';
    else if (avg <= 2.4) understandingSignal = 'developing';
    else understandingSignal = 'comfortable';
  }

  return {
    reading: readingSignal,
    speech: speechSignal,
    tracing: tracingSignal,
    understanding: understandingSignal,
    comprehension: understandingSignal,
    engagement: understandingSignal
  };
}

/**
 * Extracts objective child activity signals from screeningMetrics or completed activities.
 * Returns null for unmeasured areas.
 */
export function extractActivitySignals(profile) {
  if (!profile || !profile.screeningCompleted || !profile.screeningMetrics) {
    return {
      reading: null,
      speech: null,
      tracing: null,
      gamePerformance: null
    };
  }

  const metrics = profile.screeningMetrics;

  // Reading signal
  let reading = null;
  if (metrics.wpm !== undefined || metrics.fluencyHesitation !== undefined) {
    const wpm = metrics.wpm ?? 30;
    const hesitation = metrics.fluencyHesitation ?? 50;
    if (wpm <= 30 || hesitation >= 55) reading = 'low';
    else if (wpm < 45 || hesitation >= 35) reading = 'moderate';
    else reading = 'high';
  }

  // Speech / Phonological signal
  let speech = null;
  if (metrics.phonologicalScore !== undefined) {
    const score = metrics.phonologicalScore;
    if (score <= 65) speech = 'low';
    else if (score < 80) speech = 'moderate';
    else speech = 'high';
  }

  // Tracing / Visual-motor signal
  let tracing = null;
  if (metrics.tracingAccuracy !== undefined || metrics.reversalIndex !== undefined) {
    const acc = metrics.tracingAccuracy ?? 75;
    const rev = metrics.reversalIndex ?? 20;
    if (acc < 70 || rev > 55) tracing = 'low';
    else if (acc < 85 || rev > 30) tracing = 'moderate';
    else tracing = 'high';
  }

  return {
    reading,
    speech,
    tracing,
    gamePerformance: null
  };
}

/**
 * Combines objective child activity signals with parent observations to generate
 * an adaptive Learning Profile, structured evidence, and targeted practice recommendations.
 */
export function calculateLearningProfile(profile) {
  if (!profile) {
    return null;
  }

  const activitySignals = extractActivitySignals(profile);
  const parentFeedback = profile.parentFeedback || null;
  const parentObservationSignals = calculateParentObservationSignals(parentFeedback);

  const hasAppActivity = Boolean(
    profile.screeningCompleted &&
    (activitySignals.reading !== null || activitySignals.speech !== null || activitySignals.tracing !== null)
  );
  const hasParentFeedback = hasParentFeedbackData(parentFeedback);

  // Evidence builder
  const evidence = {
    appActivity: [],
    parentObservation: []
  };

  // Compile app evidence
  if (hasAppActivity) {
    const m = profile.screeningMetrics || {};
    if (activitySignals.reading === 'low') {
      evidence.appActivity.push(
        m.wpm
          ? `Read-Aloud activity recorded slower reading cadence (${m.wpm} WPM).`
          : 'Read-Aloud screening indicates independent reading hesitation.'
      );
    } else if (activitySignals.reading === 'high') {
      evidence.appActivity.push(
        m.wpm
          ? `Read-Aloud activity demonstrated fluent cadence (${m.wpm} WPM).`
          : 'App reading activity shows strong reading pace.'
      );
    }

    if (activitySignals.speech === 'low') {
      evidence.appActivity.push(
        m.phonologicalScore !== undefined
          ? `Rhyme Beats quest showed syllable segmentation lag (${m.phonologicalScore}%).`
          : 'Auditory rhyme activity showed hesitation with phonological sounds.'
      );
    } else if (activitySignals.speech === 'high') {
      evidence.appActivity.push(
        m.phonologicalScore !== undefined
          ? `Strong phonological and rhyme recognition recorded (${m.phonologicalScore}%).`
          : 'Rhyme and phonics activities show solid mastery.'
      );
    }

    if (activitySignals.tracing === 'low') {
      evidence.appActivity.push(
        m.reversalIndex && m.reversalIndex > 50
          ? `Mirror Letters quest flagged spatial orientation confusion (${m.reversalIndex}%).`
          : 'Letter tracing quest showed fine motor or letter-stroke hesitation.'
      );
    } else if (activitySignals.tracing === 'high') {
      evidence.appActivity.push('Motor tracing and visual discrimination showed high precision.');
    }
  }

  // Compile parent evidence
  if (hasParentFeedback) {
    const pf = parentFeedback;
    if (parentObservationSignals.reading === 'needs_support') {
      if (pf.reading?.comfort === 'struggles_independently' || pf.reading?.comfort === 'needs_help') {
        evidence.parentObservation.push('Parent observes child often needs help reading simple words at home.');
      } else if (pf.reading?.wordSkipping === 'often') {
        evidence.parentObservation.push('Parent observes child frequently skips or misses words while reading.');
      } else {
        evidence.parentObservation.push('Parent indicates reading practice currently requires additional support.');
      }
    } else if (parentObservationSignals.reading === 'comfortable') {
      evidence.parentObservation.push('Parent reports child reads comfortably at home.');
    }

    if (parentObservationSignals.speech === 'needs_support') {
      if (pf.sounds?.letterSounds === 'often_help' || pf.sounds?.blendingSounds === 'needs_help') {
        evidence.parentObservation.push('Parent observes child needs assistance combining letter sounds into words.');
      } else {
        evidence.parentObservation.push('Parent observes difficulty with letter sounds at home.');
      }
    } else if (parentObservationSignals.speech === 'comfortable') {
      evidence.parentObservation.push('Parent notes solid comfort with phonics and letter sounds.');
    }

    if (parentObservationSignals.tracing === 'needs_support') {
      if (pf.writing?.letterShapeConfusion === 'often') {
        evidence.parentObservation.push('Parent notes child sometimes confuses similar letter shapes (such as b/d or p/q).');
      } else if (pf.writing?.tracing === 'needs_help') {
        evidence.parentObservation.push('Parent observes child needs help with handwriting and tracing strokes.');
      } else {
        evidence.parentObservation.push('Parent notes handwriting and letter formation need additional practice.');
      }
    } else if (parentObservationSignals.tracing === 'comfortable') {
      evidence.parentObservation.push('Parent observes confident letter tracing and shape recognition at home.');
    }

    if (parentObservationSignals.understanding === 'needs_support') {
      evidence.parentObservation.push('Parent observes child benefits from step-by-step repetition when learning activities are challenging.');
    }

    if (pf.parentObservation && pf.parentObservation.trim().length > 0) {
      evidence.parentObservation.push(`Parent note: "${pf.parentObservation.trim()}"`);
      const localAi = analyzeParentObservationWithLocalAI(pf.parentObservation);
      if (localAi && localAi.hasSignals) {
        evidence.parentObservation.push(`🤖 Local AI Insight: ${localAi.aiSummary}`);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Cross-Signal Synthesis & Conflict Resolution
  // ─────────────────────────────────────────────────────────────
  let observedPattern = '';
  let recommendedPractice = '';
  let recommendedActivityId = 'word-snapper';
  let recommendedActivityTitle = 'Word Snapper';
  let agreementStatus = 'insufficient_data';
  let confidence = 0;

  if (!hasAppActivity && !hasParentFeedback) {
    // TEST A: No data yet
    return {
      observedPattern: 'Not enough activity data yet.',
      recommendedPractice: 'Complete the discovery screening quest to unlock personalized practice recommendations.',
      recommendedActivityId: 'screening',
      recommendedActivityTitle: 'Screening Island Quest',
      signalScores: {
        reading: null,
        speech: null,
        tracing: null,
        gamePerformance: null
      },
      parentObservation: parentObservationSignals,
      evidence: { appActivity: [], parentObservation: [] },
      agreementStatus: 'insufficient_data',
      confidence: 0,
      updatedAt: new Date().toISOString()
    };
  }

  // Scenario 1: Both App Data and Parent Feedback present
  if (hasAppActivity && hasParentFeedback) {
    const isReadingLowApp = activitySignals.reading === 'low';
    const isReadingLowParent = parentObservationSignals.reading === 'needs_support';
    const isSpeechLowApp = activitySignals.speech === 'low';
    const isSpeechLowParent = parentObservationSignals.speech === 'needs_support';
    const isTracingLowApp = activitySignals.tracing === 'low';
    const isTracingLowParent = parentObservationSignals.tracing === 'needs_support';

    // Check for direct agreement on primary support areas
    if (isReadingLowApp && isReadingLowParent) {
      // TEST B: Agreement on Reading
      observedPattern = 'Both app activity and parent observation suggest that independent reading may need additional practice.';
      recommendedPractice = 'Guided reading and word-building practice.';
      recommendedActivityId = 'word-snapper';
      recommendedActivityTitle = 'Word Snapper & Guided Reading';
      agreementStatus = 'agreement';
      confidence = 90;
    } else if (isSpeechLowApp && isSpeechLowParent) {
      // TEST C: Agreement on Speech/Phonological
      observedPattern = 'Letter-sound and phonological practice may be helpful across home and learning activities.';
      recommendedPractice = 'Phonics Sound Lab and acoustic rhyme matching.';
      recommendedActivityId = 'word-snapper';
      recommendedActivityTitle = 'Phonics Sound Lab';
      agreementStatus = 'agreement';
      confidence = 90;
    } else if (isTracingLowApp && isTracingLowParent) {
      // TEST D: Agreement on Tracing/Writing
      observedPattern = 'Letter formation and fine-motor tracing practice may be helpful.';
      recommendedPractice = 'Tactile stroke-by-stroke letter tracing and visual orientation exercises.';
      recommendedActivityId = 'letter-tracing';
      recommendedActivityTitle = 'Letter Tracing Studio';
      agreementStatus = 'agreement';
      confidence = 90;
    } else if (activitySignals.reading === 'high' && isReadingLowParent) {
      // TEST E: Divergence — App strong vs Parent reports struggle at home
      observedPattern = "App performance is currently stronger than the parent's home observation. More reading practice may help confirm the child's consistency across settings.";
      recommendedPractice = 'Low-stress guided reading with visual aids and sight-word fluency challenges.';
      recommendedActivityId = 'spelling-traps';
      recommendedActivityTitle = 'Spelling Traps & Fluency Practice';
      agreementStatus = 'divergence';
      confidence = 70;
    } else if (activitySignals.reading === 'low' && parentObservationSignals.reading === 'comfortable') {
      // Divergence — App low vs Parent reports comfortable
      observedPattern = 'Child demonstrates strong reading confidence at home, while in-app activities show slight hesitation. Continued supportive exploration is encouraged.';
      recommendedPractice = 'Confidence-building story reader and interactive word puzzles.';
      recommendedActivityId = 'word-snapper';
      recommendedActivityTitle = 'Interactive Word Builder';
      agreementStatus = 'divergence';
      confidence = 70;
    } else if (isReadingLowParent) {
      observedPattern = 'Home observations highlight independent reading support as a key opportunity.';
      recommendedPractice = 'Guided reading and sight-word recognition practice.';
      recommendedActivityId = 'word-snapper';
      recommendedActivityTitle = 'Word Snapper';
      agreementStatus = 'parent_focused';
      confidence = 75;
    } else if (isSpeechLowParent) {
      observedPattern = 'Home observations suggest phonological sound reinforcement would be beneficial.';
      recommendedPractice = 'Phoneme blending and sound-isolation activities.';
      recommendedActivityId = 'word-snapper';
      recommendedActivityTitle = 'Sound Lab';
      agreementStatus = 'parent_focused';
      confidence = 75;
    } else if (isTracingLowParent) {
      observedPattern = 'Home observations indicate handwriting and letter formation practice may be helpful.';
      recommendedPractice = 'Magnetic guide-dot letter tracing and tactile practice.';
      recommendedActivityId = 'letter-tracing';
      recommendedActivityTitle = 'Letter Tracing Studio';
      agreementStatus = 'parent_focused';
      confidence = 75;
    } else {
      observedPattern = 'Progress markers indicate positive developmental momentum across home and app environments.';
      recommendedPractice = 'Continued foundational literacy games and speed-word challenges.';
      recommendedActivityId = 'abc-fill-in';
      recommendedActivityTitle = 'Alphabet Train & Word Snapper';
      agreementStatus = 'agreement';
      confidence = 85;
    }
  } else if (hasAppActivity && !hasParentFeedback) {
    // Only App Activity present
    agreementStatus = 'app_only';
    confidence = 65;

    if (activitySignals.reading === 'low') {
      observedPattern = 'Recent app activities show independent reading cadence may benefit from guided practice.';
      recommendedPractice = 'Guided reading and sight-word reinforcement.';
      recommendedActivityId = 'word-snapper';
      recommendedActivityTitle = 'Word Snapper';
    } else if (activitySignals.speech === 'low') {
      observedPattern = 'Recent app activities show phonological sound recognition can be strengthened.';
      recommendedPractice = 'Acoustic rhyme games and phoneme isolation.';
      recommendedActivityId = 'word-snapper';
      recommendedActivityTitle = 'Sound Lab';
    } else if (activitySignals.tracing === 'low') {
      observedPattern = 'Letter orientation and tracing precision have room for guided practice.';
      recommendedPractice = 'Tactile stroke tracing and visual discrimination games.';
      recommendedActivityId = 'letter-tracing';
      recommendedActivityTitle = 'Letter Tracing Studio';
    } else {
      observedPattern = 'Core developmental markers reflect steady age-appropriate progress.';
      recommendedPractice = 'Advanced word-building and speed reading challenges.';
      recommendedActivityId = 'spelling-clinic';
      recommendedActivityTitle = 'Spelling Clinic & Word Snapper';
    }
  } else if (!hasAppActivity && hasParentFeedback) {
    // Only Parent Feedback present
    agreementStatus = 'parent_only';
    confidence = 60;

    if (parentObservationSignals.reading === 'needs_support') {
      observedPattern = 'Parent observations indicate independent reading needs additional home support.';
      recommendedPractice = 'Guided reading and vocabulary exploration.';
      recommendedActivityId = 'word-snapper';
      recommendedActivityTitle = 'Word Snapper';
    } else if (parentObservationSignals.speech === 'needs_support') {
      observedPattern = 'Parent observations suggest phonological sound reinforcement would be helpful.';
      recommendedPractice = 'Phonics Sound Lab and letter-sound exercises.';
      recommendedActivityId = 'word-snapper';
      recommendedActivityTitle = 'Phonics Sound Lab';
    } else if (parentObservationSignals.tracing === 'needs_support') {
      observedPattern = 'Parent observations suggest letter formation and handwriting practice may be helpful.';
      recommendedPractice = 'Guided letter tracing and fine-motor activities.';
      recommendedActivityId = 'letter-tracing';
      recommendedActivityTitle = 'Letter Tracing Studio';
    } else {
      observedPattern = 'Parent observations reflect solid learning comfort at home.';
      recommendedPractice = 'Take the discovery screening quest to benchmark learning milestones.';
      recommendedActivityId = 'screening';
      recommendedActivityTitle = 'Screening Island Quest';
    }
  }

  const rawMetrics = profile.screeningMetrics || {};
  const localAiReasoning = analyzeParentObservationWithLocalAI(parentFeedback?.parentObservation);

  return {
    observedPattern,
    recommendedPractice,
    recommendedActivityId,
    recommendedActivityTitle,
    signalScores: {
      reading: rawMetrics.wpm ?? null,
      speech: rawMetrics.phonologicalScore ?? null,
      tracing: rawMetrics.tracingAccuracy ?? null,
      gamePerformance: null
    },
    parentObservation: parentObservationSignals,
    localAiReasoning,
    evidence,
    agreementStatus,
    confidence,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Builds a clean, structured AI-ready learningContext object.
 * Prepared for a future AI learning agent without calling any external APIs.
 */
export function buildLearningContext(profile) {
  if (!profile) return null;

  const activitySignals = extractActivitySignals(profile);
  const parentObservationSignals = calculateParentObservationSignals(profile.parentFeedback);
  const learningProfile = profile.learningProfile || calculateLearningProfile(profile);

  return {
    learner: {
      id: profile.id,
      name: profile.name,
      grade: profile.grade,
      gradeLabel: profile.gradeLabel,
      language: profile.language
    },
    activitySignals,
    parentObservationSignals,
    learningProfile,
    evidence: learningProfile?.evidence || { appActivity: [], parentObservation: [] },
    recentProgress: {
      stars: profile.stars || 0,
      streak: profile.streak || 1,
      screeningCompleted: Boolean(profile.screeningCompleted)
    },
    recommendedPractice: {
      activityId: learningProfile?.recommendedActivityId,
      activityTitle: learningProfile?.recommendedActivityTitle,
      description: learningProfile?.recommendedPractice
    }
  };
}
