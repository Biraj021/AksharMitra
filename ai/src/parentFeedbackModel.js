// Parent Feedback Data Model for AksharMitra (Simplified 4-Section Design)
// Strict rule: Null for unanswered questions. Never invent parent data or treat null as zero.

export const createEmptyParentFeedback = () => ({
  lastUpdatedAt: null,
  reading: {
    comfort: null, // 'comfortably' | 'slowly' | 'needs_help' | 'struggles_independently' | null
    wordSkipping: null // 'rarely' | 'sometimes' | 'often' | 'not_sure' | null
  },
  sounds: {
    letterSounds: null, // 'comfortable' | 'sometimes_help' | 'often_help' | 'not_sure' | null
    blendingSounds: null // 'usually' | 'sometimes' | 'needs_help' | 'not_sure' | null
  },
  writing: {
    tracing: null, // 'comfortable' | 'developing' | 'needs_help' | 'not_sure' | null
    letterShapeConfusion: null // 'rarely' | 'sometimes' | 'often' | 'not_sure' | null
  },
  understanding: {
    understandsInstructions: null, // 'usually' | 'sometimes' | 'needs_help' | 'not_sure' | null
    handlesChallenge: null // 'keeps_trying' | 'needs_encouragement' | 'needs_help' | 'not_sure' | null
  },
  parentObservation: ''
});

/**
 * Checks if the parent feedback object has at least one recorded observation.
 * Backward-compatible with older schemas that may include comprehension or attention.
 */
export const hasParentFeedbackData = (feedback) => {
  if (!feedback) return false;
  if (feedback.parentObservation && feedback.parentObservation.trim().length > 0) return true;

  const sections = ['reading', 'sounds', 'writing', 'understanding', 'comprehension', 'attention'];
  for (const sec of sections) {
    if (feedback[sec] && typeof feedback[sec] === 'object') {
      for (const key of Object.keys(feedback[sec])) {
        if (feedback[sec][key] !== null && feedback[sec][key] !== undefined) {
          return true;
        }
      }
    }
  }
  return false;
};
