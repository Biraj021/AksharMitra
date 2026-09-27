import { getLetterDefinition } from './letterDefinitions.js';
export { getLetterDefinition };

function distToSegmentSquared(p, v, w) {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return (p.x - v.x) ** 2 + (p.y - v.y) ** 2;
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return (p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.y - (v.y + t * (w.y - v.y))) ** 2;
}

function distToSegment(p, v, w) {
  return Math.sqrt(distToSegmentSquared(p, v, w));
}

/**
 * Calculates total path length of a set of strokes.
 */
export function calculateStrokesLength(strokes) {
  let total = 0;
  if (!strokes || !Array.isArray(strokes)) return 0;
  for (const stroke of strokes) {
    if (!Array.isArray(stroke)) continue;
    for (let i = 0; i < stroke.length - 1; i++) {
      total += Math.hypot(stroke[i + 1].x - stroke[i].x, stroke[i + 1].y - stroke[i].y);
    }
  }
  return total;
}

/**
 * Evaluates tracing attempt for ANY letter with letter-specific stroke & geometry validation.
 */
export function validateTracingAttempt({
  drawnStrokes = [],
  letter = 'b',
  language = 'english',
  letterCase = 'lower',
  letterDefinition = null,
  targetConfig = {}
}) {
  const targetChar = letter || targetConfig.char || 'b';
  const def = letterDefinition || getLetterDefinition(targetChar, language, letterCase);

  if (!drawnStrokes || drawnStrokes.length === 0) {
    return {
      isValid: false,
      reason: 'no_strokes',
      score: 0,
      feedback: {
        en: "Start tracing on the canvas!",
        hi: "कैनवास पर ट्रेस करना शुरू करें!",
        bn: "ক্যানভাসে আঁকা শুরু করো!"
      }
    };
  }

  const allDrawnPoints = drawnStrokes.flat();
  if (allDrawnPoints.length < 3) {
    return {
      isValid: false,
      reason: 'too_short',
      score: 0,
      feedback: {
        en: "Keep going! Follow the line further.",
        hi: "आगे बढ़ते रहें! रेखा का पालन करें।",
        bn: "চালিয়ে যাও! রেখা ধরে আরও আঁকো।"
      }
    };
  }

  const expectedStrokes = def.strokeCount || 1;
  const currentDrawnCount = drawnStrokes.length;

  // 1. Check if multi-stroke tracing is currently in progress
  if (currentDrawnCount < expectedStrokes) {
    const activeStrokeDef = def.strokes[Math.min(currentDrawnCount - 1, def.strokes.length - 1)];

    // Check starting point for first stroke
    if (drawnStrokes.length === 1 && activeStrokeDef?.startRegion) {
      const startPt = drawnStrokes[0][0];
      const startDist = Math.hypot(startPt.x - activeStrokeDef.startRegion.x, startPt.y - activeStrokeDef.startRegion.y);
      if (startDist > (activeStrokeDef.startRegion.radius || 50) + 30) {
        return {
          isValid: false,
          isInProgress: false,
          reason: 'wrong_start',
          score: 30,
          feedback: {
            en: `Start near the top of letter '${def.char}'!`,
            hi: `अक्षर '${def.char}' की शुरुआत ऊपर से करें!`,
            bn: `বর্ণ '${def.char}'-এর উপরে থেকে শুরু করো!`
          }
        };
      }
    }

    const nextInstruction = def.instructions[Math.min(currentDrawnCount, def.instructions.length - 1)] || "Draw the next stroke!";
    return {
      isValid: false,
      isInProgress: true,
      reason: 'in_progress',
      currentStroke: currentDrawnCount,
      totalStrokes: expectedStrokes,
      feedback: {
        en: `Stroke ${currentDrawnCount} of ${expectedStrokes} done! ${nextInstruction}`,
        hi: `स्ट्रोक ${currentDrawnCount}/${expectedStrokes} पूरा! ${nextInstruction}`,
        bn: `রেখা ${currentDrawnCount}/${expectedStrokes} শেষ! ${nextInstruction}`
      }
    };
  }

  // 2. Validate Start Region for Stroke #1
  const firstStrokeStart = drawnStrokes[0][0];
  const firstStrokeDef = def.strokes[0];
  if (firstStrokeDef && firstStrokeDef.startRegion) {
    const startDist = Math.hypot(firstStrokeStart.x - firstStrokeDef.startRegion.x, firstStrokeStart.y - firstStrokeDef.startRegion.y);
    if (startDist > (firstStrokeDef.startRegion.radius || 50) + 35) {
      return {
        isValid: false,
        isInProgress: false,
        reason: 'wrong_start',
        score: 35,
        feedback: {
          en: `Start tracing near the top of letter '${def.char}'!`,
          hi: `अक्षर '${def.char}' के ऊपरी हिस्से से शुरू करें!`,
          bn: `বর্ণ '${def.char}'-এর উপরের অংশ থেকে শুরু করো!`
        }
      };
    }
  }

  // 3. Dense Point Path Adherence Check against Internal Sampled Points
  const allTargetPoints = def.strokes.flatMap(s => s.sampledPoints || []);
  if (allTargetPoints.length > 0) {
    let onPathCount = 0;
    for (const pt of allDrawnPoints) {
      let minDist = Infinity;
      for (const tPt of allTargetPoints) {
        const d = Math.hypot(pt.x - tPt.x, pt.y - tPt.y);
        if (d < minDist) minDist = d;
      }
      if (minDist <= 46) {
        onPathCount++;
      }
    }

    const adherenceRatio = onPathCount / allDrawnPoints.length;
    if (adherenceRatio < 0.48) {
      return {
        isValid: false,
        isInProgress: false,
        reason: 'off_path_scribble',
        score: Math.round(adherenceRatio * 100),
        feedback: {
          en: `Follow the shape of letter '${def.char}' closely! Stay along the path.`,
          hi: `अक्षर '${def.char}' के सही आकार का पालन करें!`,
          bn: `বর্ণ '${def.char}'-এর সঠিক আকৃতি ধরে আঁকো!`
        }
      };
    }
  }

  // 4. Belly Reversal Check for Mirror Letters ('b', 'd', 'p', 'q')
  if (def.bellyOrientation) {
    const leftPoints = allDrawnPoints.filter(p => p.x < 130).length;
    const rightPoints = allDrawnPoints.filter(p => p.x > 150).length;

    if (def.bellyOrientation === 'right' && leftPoints > rightPoints * 1.5 && leftPoints > 15) {
      return {
        isValid: false,
        isInProgress: false,
        reason: 'mirror_reversal',
        score: 40,
        feedback: {
          en: `Oops! For '${def.char}', draw the belly on the RIGHT side!`,
          hi: `'${def.char}' के लिए पेट दाईं ओर बनाएं!`,
          bn: `'${def.char}'-এর পেট ডানদিকে আঁকো!`
        }
      };
    } else if (def.bellyOrientation === 'left' && rightPoints > leftPoints * 1.5 && rightPoints > 15) {
      return {
        isValid: false,
        isInProgress: false,
        reason: 'mirror_reversal',
        score: 40,
        feedback: {
          en: `Oops! For '${def.char}', draw the belly on the LEFT side!`,
          hi: `'${def.char}' के लिए पेट बाईं ओर बनाएं!`,
          bn: `'${def.char}'-এর পেট বামদিকে আঁকো!`
        }
      };
    }
  }

  return {
    isValid: true,
    reason: 'success',
    score: 95,
    feedback: {
      en: "Wonderful Tracing! Perfect letter shape!",
      hi: "शानदार ट्रेसिंग! एकदम सही!",
      bn: "চমৎকার আঁকা! একদম নিখুঁত!"
    }
  };
}

