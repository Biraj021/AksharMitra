/**
 * src/utils/tracingValidation.js
 * Generic, high-precision Tracing Validation Engine for AksharMitra.
 * Validates stroke direction, start point, path adherence, stroke separation, and shape for ALL letters (A-Z, a-z, Indic).
 * Prevents random scribbles, wrong shapes (e.g. 'Z' on 'i'), or incorrect strokes from passing.
 */

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
 * Calculates minimum distance from a point P to any guide dot or segment connecting consecutive guide dots.
 */
export function minDistanceToTargetSegments(p, guideDots) {
  if (!guideDots || guideDots.length === 0) return 0;
  let minDist = Infinity;

  // 1. Distance to individual guide dots
  for (let i = 0; i < guideDots.length; i++) {
    const d = Math.hypot(p.x - guideDots[i].x, p.y - guideDots[i].y);
    if (d < minDist) minDist = d;
  }

  // 2. Distance to line segments connecting consecutive guide dots
  for (let i = 0; i < guideDots.length - 1; i++) {
    const d = distToSegment(p, guideDots[i], guideDots[i + 1]);
    if (d < minDist) minDist = d;
  }

  return minDist;
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
 * Calculates total target path length between consecutive guide dots.
 */
export function calculateTargetPathLength(guideDots) {
  if (!guideDots || guideDots.length < 2) return 100;
  let total = 0;
  for (let i = 0; i < guideDots.length - 1; i++) {
    total += Math.hypot(guideDots[i + 1].x - guideDots[i].x, guideDots[i + 1].y - guideDots[i].y);
  }
  return total;
}

/**
 * Evaluates tracing attempt for ANY letter with strict geometric & directional validation.
 */
export function validateTracingAttempt({
  drawnStrokes = [],
  guideDots = [],
  collectedDotIds = new Set(),
  visitedDotSequence = [],
  targetConfig = {}
}) {
  if (!drawnStrokes || drawnStrokes.length === 0 || !guideDots || guideDots.length === 0) {
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
  if (allDrawnPoints.length < 4) {
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

  const totalDots = guideDots.length;

  // 1. Checkpoint & Stroke Separation Requirements for 'i' and 'j'
  if (targetConfig.char === 'i' || targetConfig.char === 'j') {
    const hasDot = collectedDotIds.has(targetConfig.dotId);
    const hasStem = (targetConfig.stemDotIds || []).some(id => collectedDotIds.has(id));

    if (!hasStem) {
      return {
        isValid: false,
        isInProgress: true,
        reason: 'missing_stem',
        score: 30,
        feedback: {
          en: `Draw the straight stem of '${targetConfig.char}' down first!`,
          hi: `पहले '${targetConfig.char}' की सीधी रेखा नीचे ट्रेस करें!`,
          bn: `আগে '${targetConfig.char}'-এর সোজা রেখাটি আঁকো!`
        }
      };
    }

    if (!hasDot) {
      return {
        isValid: false,
        isInProgress: true,
        reason: 'need_dot',
        score: 60,
        feedback: {
          en: "Almost done! Now lift your finger and tap the dot on top! 👆",
          hi: "लगभग पूरा! अब उंगली उठाकर ऊपर के बिंदु पर टैप करें! 👆",
          bn: "প্রায় শেষ! এবার আঙুল তুলে উপরে বিন্দু দাও! 👆"
        }
      };
    }

    // Check if the top dot was connected directly to the stem in a single continuous stroke or connected line
    const dotObj = guideDots.find(d => d.id === targetConfig.dotId);
    if (dotObj) {
      let connectedInSingleStroke = false;
      for (const stroke of drawnStrokes) {
        const hasPointNearDot = stroke.some(p => Math.hypot(p.x - dotObj.x, p.y - dotObj.y) < 35);
        const hasPointNearStem = stroke.some(p => p.y > 130 && Math.abs(p.x - dotObj.x) < 40);
        if (hasPointNearDot && hasPointNearStem) {
          connectedInSingleStroke = true;
          break;
        }
      }

      // Check if any drawn points bridge the gap between top dot (y: ~70) and stem top (y: ~125)
      const hasGapDrawings = allDrawnPoints.some(p => p.y >= 82 && p.y <= 112 && Math.abs(p.x - dotObj.x) < 35);

      if (connectedInSingleStroke || hasGapDrawings) {
        return {
          isValid: false,
          isInProgress: false,
          reason: 'connected_dot_stem',
          score: 40,
          feedback: {
            en: `For '${targetConfig.char}', draw the stem line down, lift your finger, then tap the top dot separately! Do not connect them.`,
            hi: `'${targetConfig.char}' के लिए रेखा खींचें, उंगली उठाएं, फिर अलग से बिंदु पर टैप करें! उन्हें आपस में न जोड़ें।`,
            bn: `'${targetConfig.char}'-এর জন্য সোজা রেখা টেনে আঙুল তোলো, তারপর বিন্দু দাও! দুটো জোড়া যাবে না।`
          }
        };
      }
    }
  } else if (targetConfig.requiredDots && targetConfig.requiredDots.length > 0) {
    const missingReq = targetConfig.requiredDots.filter(id => !collectedDotIds.has(id));
    if (missingReq.length > 0) {
      return {
        isValid: false,
        isInProgress: true,
        reason: 'need_cross',
        score: 50,
        feedback: {
          en: "Great progress! Now complete the remaining lines (crossbar/dots)!",
          hi: "शानदार प्रयास! अब बाकी बची रेखाएं पूरी करें!",
          bn: "চমৎকার কাজ! এবার বাকি রেখাগুলো টেনে নাও!"
        }
      };
    }
  } else {
    const collectedRatio = collectedDotIds.size / totalDots;
    if (collectedRatio < 0.70) {
      let onPathPoints = 0;
      for (const pt of allDrawnPoints) {
        if (minDistanceToTargetSegments(pt, guideDots) <= 30) {
          onPathPoints++;
        }
      }
      const partialAdherence = onPathPoints / allDrawnPoints.length;
      const isPartialValid = partialAdherence >= 0.65;

      return {
        isValid: false,
        isInProgress: isPartialValid,
        reason: isPartialValid ? 'in_progress' : 'low_coverage',
        score: Math.round(collectedRatio * 100),
        feedback: {
          en: isPartialValid ? "Keep going! Continue tracing the guide line." : "Touch all the guide dots from start to end!",
          hi: isPartialValid ? "आगे बढ़ते रहें! रेखा का पालन करते रहें।" : "शुरुआत से अंत तक सभी बिंदुओं को छुएं!",
          bn: isPartialValid ? "চালিয়ে যাও! রেখা ধরে বাকিটা আঁকো।" : "শুরু থেকে শেষ পর্যন্ত সব বিন্দু স্পর্শ করো!"
        }
      };
    }
  }

  // 2. Bounding Box & Aspect Ratio Constraints (Prevents 'Z' on 'i'/'l')
  const mainDots = (targetConfig.char === 'i' || targetConfig.char === 'j')
    ? guideDots.filter(d => d.id !== targetConfig.dotId)
    : guideDots;

  let targetMinX = Infinity, targetMaxX = -Infinity;
  let targetMinY = Infinity, targetMaxY = -Infinity;
  for (const d of mainDots) {
    if (d.x < targetMinX) targetMinX = d.x;
    if (d.x > targetMaxX) targetMaxX = d.x;
    if (d.y < targetMinY) targetMinY = d.y;
    if (d.y > targetMaxY) targetMaxY = d.y;
  }
  const targetWidth = targetMaxX - targetMinX;
  const targetHeight = targetMaxY - targetMinY;

  const mainDrawnPoints = (targetConfig.char === 'i' || targetConfig.char === 'j')
    ? allDrawnPoints.filter(p => p.y >= 100)
    : allDrawnPoints;

  if (mainDrawnPoints.length > 3) {
    let drawnMinX = Infinity, drawnMaxX = -Infinity;
    let drawnMinY = Infinity, drawnMaxY = -Infinity;
    for (const p of mainDrawnPoints) {
      if (p.x < drawnMinX) drawnMinX = p.x;
      if (p.x > drawnMaxX) drawnMaxX = p.x;
      if (p.y < drawnMinY) drawnMinY = p.y;
      if (p.y > drawnMaxY) drawnMaxY = p.y;
    }
    const drawnWidth = drawnMaxX - drawnMinX;
    const drawnHeight = drawnMaxY - drawnMinY;

    // For vertical letters ('i', 'j', 'l', '1', stem of 't'), targetWidth is <= 25px
    if (targetWidth <= 25 && targetHeight >= 60) {
      if (drawnWidth > 45) {
        return {
          isValid: false,
          reason: 'wrong_shape_width',
          score: 30,
          feedback: {
            en: `Draw a straight vertical line for '${targetConfig.char}', not a zigzag or 'Z' shape!`,
            hi: `'${targetConfig.char}' के लिए एक सीधी खड़ी रेखा खींचें, टेढ़ी-मेढ़ी नहीं!`,
            bn: `'${targetConfig.char}'-এর জন্য একটি সোজা খাড়া রেখা আঁকো, আঁকাবাঁকা নয়!`
          }
        };
      }
    }

    // For horizontal lines, targetHeight is <= 25px
    if (targetHeight <= 25 && targetWidth >= 60) {
      if (drawnHeight > 45) {
        return {
          isValid: false,
          reason: 'wrong_shape_height',
          score: 30,
          feedback: {
            en: "Draw a straight horizontal line across!",
            hi: "एक सीधी क्षैतिज रेखा खींचें!",
            bn: "একটি সোজা অনুভূমিক রেখা আঁকো!"
          }
        };
      }
    }
  }

  // 3. Directional Trajectory Analysis (Vertical vs Horizontal Movement)
  if (targetWidth <= 25 && targetHeight >= 60 && mainDrawnPoints.length >= 5) {
    let totalDx = 0;
    let totalDy = 0;
    for (let i = 1; i < mainDrawnPoints.length; i++) {
      totalDx += Math.abs(mainDrawnPoints[i].x - mainDrawnPoints[i - 1].x);
      totalDy += Math.abs(mainDrawnPoints[i].y - mainDrawnPoints[i - 1].y);
    }
    if (totalDx > totalDy * 0.95) {
      return {
        isValid: false,
        reason: 'directional_error',
        score: 35,
        feedback: {
          en: `Follow the straight line straight down for '${targetConfig.char}'!`,
          hi: `'${targetConfig.char}' के लिए सीधे नीचे की ओर रेखा खींचें!`,
          bn: `'${targetConfig.char}'-এর জন্য সোজাসুজি নিচে নামো!`
        }
      };
    }
  }

  // 4. Start Point Correctness Check (Tolerance: 40px)
  const firstStroke = drawnStrokes[0];
  const firstStrokeStart = firstStroke[0];
  const allowedStartDots = mainDots.slice(0, Math.min(2, mainDots.length));
  let minStartDist = Infinity;
  for (const d of allowedStartDots) {
    const dist = Math.hypot(firstStrokeStart.x - d.x, firstStrokeStart.y - d.y);
    if (dist < minStartDist) minStartDist = dist;
  }

  if (minStartDist > 35) {
    return {
      isValid: false,
      reason: 'wrong_start',
      score: 40,
      feedback: {
        en: "Start tracing near dot #1 at the top!",
        hi: "ऊपर बिंदु #1 से ट्रेस करना शुरू करें!",
        bn: "উপরে বিন্দু #১ থেকে শুরু করো!"
      }
    };
  }

  // 5. Strict Path Adherence (Max Off-Path Distance: 18px)
  let onPathCount = 0;
  for (const pt of allDrawnPoints) {
    const dist = minDistanceToTargetSegments(pt, guideDots);
    if (dist <= 18) {
      onPathCount++;
    }
  }
  const adherenceRatio = onPathCount / allDrawnPoints.length;

  if (adherenceRatio < 0.75) {
    return {
      isValid: false,
      reason: 'off_path_scribble',
      score: Math.round(adherenceRatio * 100),
      feedback: {
        en: "Follow the exact letter shape! Stay directly on the letter path.",
        hi: "अक्षर के सही आकार का पालन करें! रेखा के ठीक ऊपर रहें।",
        bn: "বর্ণের সঠিক আকৃতি ধরে আঁকো! রেখার ওপর দিয়ে আঁকো।"
      }
    };
  }

  // 6. Minimum & Maximum Path Length Ratio (Requires actual line tracing over letter shape)
  const totalDrawnLength = calculateStrokesLength(drawnStrokes);
  const targetLength = calculateTargetPathLength(mainDots);
  const minRequiredLength = Math.min(80, targetLength * 0.40);

  if (totalDrawnLength < minRequiredLength) {
    return {
      isValid: false,
      reason: 'must_trace_lines',
      score: 30,
      feedback: {
        en: "Trace lines over the letter to overlap its shape! Don't just tap the dots.",
        hi: "अक्षर के आकार को कवर करने के लिए रेखाएं खींचें! केवल बिंदुओं पर टैप न करें।",
        bn: "বর্ণের আকৃতি ঢাকতে রেখা আঁকো! শুধু বিন্দুতে ট্যাপ করো না।"
      }
    };
  }

  const lengthRatio = totalDrawnLength / Math.max(1, targetLength);

  if (lengthRatio > 1.65) {
    return {
      isValid: false,
      reason: 'excessive_scribble',
      score: 35,
      feedback: {
        en: "Too many scribbles! Draw one clean line along the dots.",
        hi: "बहुत अधिक उलझी हुई रेखाएं! बिंदुओं के साथ एक साफ़ रेखा खींचें।",
        bn: "অতিরিক্ত দাগ টেনেছো! বিন্দুগুলো ধরে একটি পরিষ্কার রেখা আঁকো।"
      }
    };
  }

  // 7. Visited Checkpoint Order Check
  if (visitedDotSequence.length >= 3) {
    let reversals = 0;
    for (let i = 1; i < visitedDotSequence.length; i++) {
      const prevId = Number(visitedDotSequence[i - 1]);
      const currId = Number(visitedDotSequence[i]);
      if (!isNaN(prevId) && !isNaN(currId)) {
        if (currId < prevId - 1) {
          reversals++;
        }
      }
    }
    if (reversals >= 2) {
      return {
        isValid: false,
        reason: 'wrong_order',
        score: 50,
        feedback: {
          en: "Follow the numbered dots in order (1 ➔ 2 ➔ 3)!",
          hi: "नंबर वाले बिंदुओं का क्रम से पालन करें (1 ➔ 2 ➔ 3)!",
          bn: "সংখ্যা অনুযায়ী ক্রমানুসারে বিন্দুগুলো আঁকো (১ ➔ ২ ➔ ৩)!"
        }
      };
    }
  }

  // 8. Specific Direction Checks (e.g. 'b' vs 'd' belly orientation)
  if (targetConfig.bellyOrientation) {
    const stemDot = guideDots.find(d => d.label === '1' || d.id === 1) || guideDots[0];
    if (stemDot) {
      const stemX = stemDot.x;
      const rightPoints = allDrawnPoints.filter(pt => pt.x > stemX + 15).length;
      const leftPoints = allDrawnPoints.filter(pt => pt.x < stemX - 15).length;

      if (targetConfig.bellyOrientation === 'right' && leftPoints > rightPoints * 1.5 && leftPoints > 15) {
        return {
          isValid: false,
          reason: 'mirror_reversal',
          score: 40,
          feedback: {
            en: `Oops! For '${targetConfig.char}', draw the belly on the RIGHT side!`,
            hi: `'${targetConfig.char}' के लिए पेट दाईं ओर बनाएं!`,
            bn: `'${targetConfig.char}'-এর পেট ডানদিকে আঁকো!`
          }
        };
      } else if (targetConfig.bellyOrientation === 'left' && rightPoints > leftPoints * 1.5 && rightPoints > 15) {
        return {
          isValid: false,
          reason: 'mirror_reversal',
          score: 40,
          feedback: {
            en: `Oops! For '${targetConfig.char}', draw the belly on the LEFT side!`,
            hi: `'${targetConfig.char}' के लिए पेट बाईं ओर बनाएं!`,
            bn: `'${targetConfig.char}'-এর पेट बमদিকে আঁকো!`
          }
        };
      }
    }
  }

  const finalScore = Math.min(100, Math.round(adherenceRatio * 100));

  return {
    isValid: true,
    reason: 'success',
    score: finalScore,
    feedback: {
      en: "Wonderful Tracing! Perfect path!",
      hi: "शानदार ट्रेसिंग! एकदम सही!",
      bn: "চমৎকার আঁকা! একদম নিখুঁত!"
    }
  };
}
