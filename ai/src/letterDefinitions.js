/**
 * ai/src/letterDefinitions.js
 * Comprehensive, Data-Driven Letter & Stroke Definition Registry for AksharMitra.
 * Provides mathematically accurate SVG paths (Bezier curves & lines), multi-stroke definitions,
 * starting regions, contextual instructions, and dense internal point sampling for ALL supported letters:
 * - English Uppercase (A-Z)
 * - English Lowercase (a-z)
 * - Bengali Script
 * - Hindi Devanagari Script
 */

// Helper to sample dense (x, y) mathematical points along SVG path command strings
export function sampleSvgPath(pathD, samplesPerSegment = 20) {
  if (!pathD || typeof pathD !== 'string') return [];
  const points = [];

  // Parse SVG path commands (M, L, C, Q, Z)
  const cmdRegex = /([MLCQZ])\s*([^MLCQZ]*)/gi;
  let match;
  let currentPos = { x: 140, y: 140 };

  while ((match = cmdRegex.exec(pathD)) !== null) {
    const type = match[1].toUpperCase();
    const args = match[2].trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));

    if (type === 'M') {
      currentPos = { x: args[0], y: args[1] };
      points.push({ ...currentPos });
    } else if (type === 'L') {
      const targetPos = { x: args[0], y: args[1] };
      for (let i = 1; i <= samplesPerSegment; i++) {
        const t = i / samplesPerSegment;
        points.push({
          x: currentPos.x + t * (targetPos.x - currentPos.x),
          y: currentPos.y + t * (targetPos.y - currentPos.y)
        });
      }
      currentPos = targetPos;
    } else if (type === 'Q') {
      const control = { x: args[0], y: args[1] };
      const targetPos = { x: args[2], y: args[3] };
      for (let i = 1; i <= samplesPerSegment; i++) {
        const t = i / samplesPerSegment;
        const mt = 1 - t;
        points.push({
          x: mt * mt * currentPos.x + 2 * mt * t * control.x + t * t * targetPos.x,
          y: mt * mt * currentPos.y + 2 * mt * t * control.y + t * t * targetPos.y
        });
      }
      currentPos = targetPos;
    } else if (type === 'C') {
      const c1 = { x: args[0], y: args[1] };
      const c2 = { x: args[2], y: args[3] };
      const targetPos = { x: args[4], y: args[5] };
      for (let i = 1; i <= samplesPerSegment; i++) {
        const t = i / samplesPerSegment;
        const mt = 1 - t;
        points.push({
          x: mt * mt * mt * currentPos.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * targetPos.x,
          y: mt * mt * mt * currentPos.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * targetPos.y
        });
      }
      currentPos = targetPos;
    }
  }

  return points;
}

// English Capital (Uppercase) Letter Definitions
const ENGLISH_UPPER = {
  A: {
    char: 'A', case: 'upper', lang: 'english', strokeCount: 3,
    instructions: ["Slant down to the left from top", "Slant down to the right from top", "Bridge the crossbar across"],
    audioText: "Trace capital letter A! Slant left, slant right, then crossbar!",
    svgPath: "M 140 55 L 70 225 M 140 55 L 210 225 M 95 155 L 185 155",
    strokes: [
      { strokeId: 1, name: "Left Slant", path: "M 140 55 L 70 225", startRegion: { x: 140, y: 55, radius: 45 }, direction: "down-left" },
      { strokeId: 2, name: "Right Slant", path: "M 140 55 L 210 225", startRegion: { x: 140, y: 55, radius: 45 }, direction: "down-right" },
      { strokeId: 3, name: "Crossbar", path: "M 95 155 L 185 155", startRegion: { x: 95, y: 155, radius: 40 }, direction: "left-to-right" }
    ]
  },
  B: {
    char: 'B', case: 'upper', lang: 'english', strokeCount: 3,
    instructions: ["Draw straight stem down", "Curve top loop to middle", "Curve bottom loop to floor"],
    audioText: "Trace capital letter B! Straight stem down, top loop, bottom loop!",
    svgPath: "M 80 55 L 80 225 M 80 55 C 175 55 175 140 80 140 M 80 140 C 185 140 185 225 80 225",
    strokes: [
      { strokeId: 1, name: "Vertical Stem", path: "M 80 55 L 80 225", startRegion: { x: 80, y: 55, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Upper Loop", path: "M 80 55 C 175 55 175 140 80 140", startRegion: { x: 80, y: 55, radius: 40 }, direction: "curve" },
      { strokeId: 3, name: "Lower Loop", path: "M 80 140 C 185 140 185 225 80 225", startRegion: { x: 80, y: 140, radius: 40 }, direction: "curve" }
    ]
  },
  C: {
    char: 'C', case: 'upper', lang: 'english', strokeCount: 1,
    instructions: ["Start top right and curve all the way around like a crescent moon!"],
    audioText: "Trace capital letter C! Big curve around like a moon!",
    svgPath: "M 195 75 C 90 45 60 230 195 205",
    strokes: [
      { strokeId: 1, name: "Crescent Curve", path: "M 195 75 C 90 45 60 230 195 205", startRegion: { x: 195, y: 75, radius: 45 }, direction: "ccw-curve" }
    ]
  },
  D: {
    char: 'D', case: 'upper', lang: 'english', strokeCount: 2,
    instructions: ["Draw tall stem straight down", "Curve giant belly from top to bottom"],
    audioText: "Trace capital letter D! Line down, giant belly on right!",
    svgPath: "M 80 55 L 80 225 M 80 55 C 200 55 200 225 80 225",
    strokes: [
      { strokeId: 1, name: "Vertical Stem", path: "M 80 55 L 80 225", startRegion: { x: 80, y: 55, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Belly Curve", path: "M 80 55 C 200 55 200 225 80 225", startRegion: { x: 80, y: 55, radius: 40 }, direction: "curve" }
    ]
  },
  E: {
    char: 'E', case: 'upper', lang: 'english', strokeCount: 4,
    instructions: ["Draw tall stem down", "Draw top horizontal bar", "Draw middle bar", "Draw bottom bar"],
    audioText: "Trace capital letter E! Line down, top bar, middle bar, bottom bar!",
    svgPath: "M 80 55 L 80 225 M 80 55 L 190 55 M 80 140 L 170 140 M 80 225 L 190 225",
    strokes: [
      { strokeId: 1, name: "Vertical Stem", path: "M 80 55 L 80 225", startRegion: { x: 80, y: 55, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Top Bar", path: "M 80 55 L 190 55", startRegion: { x: 80, y: 55, radius: 40 }, direction: "right" },
      { strokeId: 3, name: "Middle Bar", path: "M 80 140 L 170 140", startRegion: { x: 80, y: 140, radius: 40 }, direction: "right" },
      { strokeId: 4, name: "Bottom Bar", path: "M 80 225 L 190 225", startRegion: { x: 80, y: 225, radius: 40 }, direction: "right" }
    ]
  },
  F: {
    char: 'F', case: 'upper', lang: 'english', strokeCount: 3,
    instructions: ["Draw tall stem down", "Draw top roof bar", "Draw middle shelf bar"],
    audioText: "Trace capital letter F! Line down, top bar, middle bar!",
    svgPath: "M 80 55 L 80 225 M 80 55 L 190 55 M 80 140 L 170 140",
    strokes: [
      { strokeId: 1, name: "Vertical Stem", path: "M 80 55 L 80 225", startRegion: { x: 80, y: 55, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Top Bar", path: "M 80 55 L 190 55", startRegion: { x: 80, y: 55, radius: 40 }, direction: "right" },
      { strokeId: 3, name: "Middle Bar", path: "M 80 140 L 170 140", startRegion: { x: 80, y: 140, radius: 40 }, direction: "right" }
    ]
  },
  G: {
    char: 'G', case: 'upper', lang: 'english', strokeCount: 2,
    instructions: ["Curve around like 'C'", "Draw horizontal bar inward"],
    audioText: "Trace capital letter G! Curve around, step inside!",
    svgPath: "M 195 75 C 90 45 60 230 195 205 M 195 160 L 145 160",
    strokes: [
      { strokeId: 1, name: "Outer Arc", path: "M 195 75 C 90 45 60 230 195 205", startRegion: { x: 195, y: 75, radius: 45 }, direction: "ccw-curve" },
      { strokeId: 2, name: "Inner Bar", path: "M 195 160 L 145 160", startRegion: { x: 195, y: 160, radius: 40 }, direction: "left" }
    ]
  },
  H: {
    char: 'H', case: 'upper', lang: 'english', strokeCount: 3,
    instructions: ["Draw left vertical stem", "Draw right vertical stem", "Connect the middle bridge across"],
    audioText: "Trace capital letter H! Left stem, right stem, middle bridge!",
    svgPath: "M 80 55 L 80 225 M 200 55 L 200 225 M 80 140 L 200 140",
    strokes: [
      { strokeId: 1, name: "Left Stem", path: "M 80 55 L 80 225", startRegion: { x: 80, y: 55, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Right Stem", path: "M 200 55 L 200 225", startRegion: { x: 200, y: 55, radius: 40 }, direction: "down" },
      { strokeId: 3, name: "Middle Bridge", path: "M 80 140 L 200 140", startRegion: { x: 80, y: 140, radius: 40 }, direction: "right" }
    ]
  },
  I: {
    char: 'I', case: 'upper', lang: 'english', strokeCount: 3,
    instructions: ["Draw top roof hat", "Draw center vertical stem down", "Draw bottom floor hat"],
    audioText: "Trace capital letter I! Top hat, center stem down, bottom hat!",
    svgPath: "M 90 55 L 190 55 M 140 55 L 140 225 M 90 225 L 190 225",
    strokes: [
      { strokeId: 1, name: "Top Hat", path: "M 90 55 L 190 55", startRegion: { x: 90, y: 55, radius: 40 }, direction: "right" },
      { strokeId: 2, name: "Center Stem", path: "M 140 55 L 140 225", startRegion: { x: 140, y: 55, radius: 40 }, direction: "down" },
      { strokeId: 3, name: "Bottom Hat", path: "M 90 225 L 190 225", startRegion: { x: 90, y: 225, radius: 40 }, direction: "right" }
    ]
  },
  J: {
    char: 'J', case: 'upper', lang: 'english', strokeCount: 2,
    instructions: ["Draw top roof hat", "Draw stem down and hook up to left"],
    audioText: "Trace capital letter J! Roof hat, stem down with a hook!",
    svgPath: "M 90 55 L 200 55 M 165 55 L 165 180 C 165 240 75 240 75 175",
    strokes: [
      { strokeId: 1, name: "Top Hat", path: "M 90 55 L 200 55", startRegion: { x: 90, y: 55, radius: 40 }, direction: "right" },
      { strokeId: 2, name: "Hook Stem", path: "M 165 55 L 165 180 C 165 240 75 240 75 175", startRegion: { x: 165, y: 55, radius: 40 }, direction: "down-hook" }
    ]
  },
  K: {
    char: 'K', case: 'upper', lang: 'english', strokeCount: 3,
    instructions: ["Draw tall stem straight down", "Slant from top right into middle stem", "Kick leg out to bottom right"],
    audioText: "Trace capital letter K! Line down, slant in, slant kick out!",
    svgPath: "M 80 55 L 80 225 M 190 55 L 80 140 M 80 140 L 190 225",
    strokes: [
      { strokeId: 1, name: "Vertical Stem", path: "M 80 55 L 80 225", startRegion: { x: 80, y: 55, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Slant In", path: "M 190 55 L 80 140", startRegion: { x: 190, y: 55, radius: 45 }, direction: "down-left" },
      { strokeId: 3, name: "Kick Out", path: "M 80 140 L 190 225", startRegion: { x: 80, y: 140, radius: 40 }, direction: "down-right" }
    ]
  },
  L: {
    char: 'L', case: 'upper', lang: 'english', strokeCount: 1,
    instructions: ["Go straight down, then turn right across the floor!"],
    audioText: "Trace capital letter L! Straight down, then turn right!",
    svgPath: "M 85 55 L 85 225 L 195 225",
    strokes: [
      { strokeId: 1, name: "L-Stroke", path: "M 85 55 L 85 225 L 195 225", startRegion: { x: 85, y: 55, radius: 40 }, direction: "down-right" }
    ]
  },
  M: {
    char: 'M', case: 'upper', lang: 'english', strokeCount: 4,
    instructions: ["Draw left stem up", "Slant down to center middle", "Climb up to top right", "Draw right stem straight down"],
    audioText: "Trace capital letter M! Up, slide down, climb up, straight down!",
    svgPath: "M 70 225 L 70 55 M 70 55 L 140 160 M 140 160 L 210 55 M 210 55 L 210 225",
    strokes: [
      { strokeId: 1, name: "Left Stem", path: "M 70 225 L 70 55", startRegion: { x: 70, y: 225, radius: 45 }, direction: "up" },
      { strokeId: 2, name: "First Slant", path: "M 70 55 L 140 160", startRegion: { x: 70, y: 55, radius: 40 }, direction: "down-right" },
      { strokeId: 3, name: "Second Slant", path: "M 140 160 L 210 55", startRegion: { x: 140, y: 160, radius: 40 }, direction: "up-right" },
      { strokeId: 4, name: "Right Stem", path: "M 210 55 L 210 225", startRegion: { x: 210, y: 55, radius: 40 }, direction: "down" }
    ]
  },
  N: {
    char: 'N', case: 'upper', lang: 'english', strokeCount: 3,
    instructions: ["Draw left stem straight up", "Slide diagonally down to bottom right", "Draw right stem straight up"],
    audioText: "Trace capital letter N! Up, slide diagonal down, straight up!",
    svgPath: "M 75 225 L 75 55 M 75 55 L 205 225 M 205 225 L 205 55",
    strokes: [
      { strokeId: 1, name: "Left Stem", path: "M 75 225 L 75 55", startRegion: { x: 75, y: 225, radius: 45 }, direction: "up" },
      { strokeId: 2, name: "Diagonal Slide", path: "M 75 55 L 205 225", startRegion: { x: 75, y: 55, radius: 40 }, direction: "down-right" },
      { strokeId: 3, name: "Right Stem", path: "M 205 225 L 205 55", startRegion: { x: 205, y: 225, radius: 45 }, direction: "up" }
    ]
  },
  O: {
    char: 'O', case: 'upper', lang: 'english', strokeCount: 1,
    instructions: ["Start at the top and loop all the way round like a big circle!"],
    audioText: "Trace capital letter O! Giant round circle from top!",
    svgPath: "M 140 55 C 50 55 50 225 140 225 C 230 225 230 55 140 55 Z",
    strokes: [
      { strokeId: 1, name: "Circle Loop", path: "M 140 55 C 50 55 50 225 140 225 C 230 225 230 55 140 55 Z", startRegion: { x: 140, y: 55, radius: 45 }, direction: "ccw-loop" }
    ]
  },
  P: {
    char: 'P', case: 'upper', lang: 'english', strokeCount: 2,
    instructions: ["Draw tall stem down", "Draw top balloon loop on the right"],
    audioText: "Trace capital letter P! Tall stem down, then top balloon loop!",
    svgPath: "M 80 55 L 80 225 M 80 55 C 185 55 185 140 80 140",
    strokes: [
      { strokeId: 1, name: "Vertical Stem", path: "M 80 55 L 80 225", startRegion: { x: 80, y: 55, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Balloon Loop", path: "M 80 55 C 185 55 185 140 80 140", startRegion: { x: 80, y: 55, radius: 40 }, direction: "curve" }
    ]
  },
  Q: {
    char: 'Q', case: 'upper', lang: 'english', strokeCount: 2,
    instructions: ["Draw big 'O' circle loop", "Add a little kick tail at bottom right"],
    audioText: "Trace capital letter Q! Giant circle, then kick tail!",
    svgPath: "M 140 55 C 50 55 50 225 140 225 C 230 225 230 55 140 55 Z M 155 180 L 215 235",
    strokes: [
      { strokeId: 1, name: "Circle Loop", path: "M 140 55 C 50 55 50 225 140 225 C 230 225 230 55 140 55 Z", startRegion: { x: 140, y: 55, radius: 45 }, direction: "ccw-loop" },
      { strokeId: 2, name: "Kick Tail", path: "M 155 180 L 215 235", startRegion: { x: 155, y: 180, radius: 40 }, direction: "down-right" }
    ]
  },
  R: {
    char: 'R', case: 'upper', lang: 'english', strokeCount: 3,
    instructions: ["Draw tall stem down", "Draw top balloon loop", "Slant kick leg down to right"],
    audioText: "Trace capital letter R! Line down, top loop, kick leg down!",
    svgPath: "M 80 55 L 80 225 M 80 55 C 185 55 185 135 80 135 M 80 135 L 185 225",
    strokes: [
      { strokeId: 1, name: "Vertical Stem", path: "M 80 55 L 80 225", startRegion: { x: 80, y: 55, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Balloon Loop", path: "M 80 55 C 185 55 185 135 80 135", startRegion: { x: 80, y: 55, radius: 40 }, direction: "curve" },
      { strokeId: 3, name: "Kick Leg", path: "M 80 135 L 185 225", startRegion: { x: 80, y: 135, radius: 40 }, direction: "down-right" }
    ]
  },
  S: {
    char: 'S', case: 'upper', lang: 'english', strokeCount: 1,
    instructions: ["Curve left like a snake, switch across, and curve right!"],
    audioText: "Trace capital letter S! Slither like a snake!",
    svgPath: "M 185 80 C 140 45 75 75 75 115 C 75 165 200 135 200 185 C 200 235 120 235 85 200",
    strokes: [
      { strokeId: 1, name: "Snake S-Curve", path: "M 185 80 C 140 45 75 75 75 115 C 75 165 200 135 200 185 C 200 235 120 235 85 200", startRegion: { x: 185, y: 80, radius: 45 }, direction: "s-curve" }
    ]
  },
  T: {
    char: 'T', case: 'upper', lang: 'english', strokeCount: 2,
    instructions: ["Draw roof bar all the way across", "Draw stem straight down the center"],
    audioText: "Trace capital letter T! Roof bar across, stem straight down!",
    svgPath: "M 70 55 L 210 55 M 140 55 L 140 225",
    strokes: [
      { strokeId: 1, name: "Roof Bar", path: "M 70 55 L 210 55", startRegion: { x: 70, y: 55, radius: 45 }, direction: "right" },
      { strokeId: 2, name: "Center Stem", path: "M 140 55 L 140 225", startRegion: { x: 140, y: 55, radius: 45 }, direction: "down" }
    ]
  },
  U: {
    char: 'U', case: 'upper', lang: 'english', strokeCount: 1,
    instructions: ["Go down, curve the bottom like a smile, and climb back up!"],
    audioText: "Trace capital letter U! Down, smile bottom, climb back up!",
    svgPath: "M 85 55 L 85 165 C 85 235 195 235 195 165 L 195 55",
    strokes: [
      { strokeId: 1, name: "U-Cup Curve", path: "M 85 55 L 85 165 C 85 235 195 235 195 165 L 195 55", startRegion: { x: 85, y: 55, radius: 45 }, direction: "u-turn" }
    ]
  },
  V: {
    char: 'V', case: 'upper', lang: 'english', strokeCount: 2,
    instructions: ["Slant down to a sharp point at floor", "Slant right back up to top right"],
    audioText: "Trace capital letter V! Slant down to point, slant back up!",
    svgPath: "M 75 55 L 140 225 M 140 225 L 205 55",
    strokes: [
      { strokeId: 1, name: "Down Slant", path: "M 75 55 L 140 225", startRegion: { x: 75, y: 55, radius: 45 }, direction: "down-right" },
      { strokeId: 2, name: "Up Slant", path: "M 140 225 L 205 55", startRegion: { x: 140, y: 225, radius: 40 }, direction: "up-right" }
    ]
  },
  W: {
    char: 'W', case: 'upper', lang: 'english', strokeCount: 4,
    instructions: ["Slant down", "Slant up to middle", "Slant down", "Slant up to top right"],
    audioText: "Trace capital letter W! Down, up, down, up like two V's!",
    svgPath: "M 65 55 L 105 225 M 105 225 L 140 120 M 140 120 L 175 225 M 175 225 L 215 55",
    strokes: [
      { strokeId: 1, name: "Slant 1", path: "M 65 55 L 105 225", startRegion: { x: 65, y: 55, radius: 40 }, direction: "down-right" },
      { strokeId: 2, name: "Slant 2", path: "M 105 225 L 140 120", startRegion: { x: 105, y: 225, radius: 40 }, direction: "up-right" },
      { strokeId: 3, name: "Slant 3", path: "M 140 120 L 175 225", startRegion: { x: 140, y: 120, radius: 40 }, direction: "down-right" },
      { strokeId: 4, name: "Slant 4", path: "M 175 225 L 215 55", startRegion: { x: 175, y: 225, radius: 40 }, direction: "up-right" }
    ]
  },
  X: {
    char: 'X', case: 'upper', lang: 'english', strokeCount: 2,
    instructions: ["Slant top-left to bottom-right", "Cross top-right to bottom-left"],
    audioText: "Trace capital letter X! Slant down right, then cross down left!",
    svgPath: "M 75 55 L 205 225 M 205 55 L 75 225",
    strokes: [
      { strokeId: 1, name: "First Diagonal", path: "M 75 55 L 205 225", startRegion: { x: 75, y: 55, radius: 45 }, direction: "down-right" },
      { strokeId: 2, name: "Cross Diagonal", path: "M 205 55 L 75 225", startRegion: { x: 205, y: 55, radius: 45 }, direction: "down-left" }
    ]
  },
  Y: {
    char: 'Y', case: 'upper', lang: 'english', strokeCount: 3,
    instructions: ["Slant short left into center", "Slant short right into center", "Draw center stem straight down"],
    audioText: "Trace capital letter Y! Little V at top, center stem down!",
    svgPath: "M 75 55 L 140 135 M 205 55 L 140 135 M 140 135 L 140 225",
    strokes: [
      { strokeId: 1, name: "Left Arm", path: "M 75 55 L 140 135", startRegion: { x: 75, y: 55, radius: 40 }, direction: "down-right" },
      { strokeId: 2, name: "Right Arm", path: "M 205 55 L 140 135", startRegion: { x: 205, y: 55, radius: 40 }, direction: "down-left" },
      { strokeId: 3, name: "Stem", path: "M 140 135 L 140 225", startRegion: { x: 140, y: 135, radius: 40 }, direction: "down" }
    ]
  },
  Z: {
    char: 'Z', case: 'upper', lang: 'english', strokeCount: 1,
    instructions: ["Across top right, slide diagonal down left, across bottom floor!"],
    audioText: "Trace capital letter Z! Across, slide down left, across bottom!",
    svgPath: "M 75 55 L 205 55 L 75 225 L 205 225",
    strokes: [
      { strokeId: 1, name: "Z-Path", path: "M 75 55 L 205 55 L 75 225 L 205 225", startRegion: { x: 75, y: 55, radius: 45 }, direction: "z-path" }
    ]
  }
};

// English Lowercase Letter Definitions
const ENGLISH_LOWER = {
  a: {
    char: 'a', case: 'lower', lang: 'english', strokeCount: 2,
    instructions: ["Circle round to the left", "Draw line straight down on right"],
    audioText: "Trace letter a! Circle left, line down!",
    svgPath: "M 175 130 C 100 110 85 220 175 220 M 175 120 L 175 225",
    strokes: [
      { strokeId: 1, name: "Circle Bowl", path: "M 175 130 C 100 110 85 220 175 220", startRegion: { x: 175, y: 130, radius: 40 }, direction: "ccw-curve" },
      { strokeId: 2, name: "Right Stem", path: "M 175 120 L 175 225", startRegion: { x: 175, y: 120, radius: 40 }, direction: "down" }
    ]
  },
  b: {
    char: 'b', case: 'lower', lang: 'english', strokeCount: 2, bellyOrientation: 'right',
    instructions: ["Draw tall stem straight down", "Loop round belly on the right side"],
    audioText: "Trace letter b! Tall stem down, round belly on right!",
    svgPath: "M 90 45 L 90 225 M 90 140 C 180 120 180 225 90 225",
    strokes: [
      { strokeId: 1, name: "Tall Stem", path: "M 90 45 L 90 225", startRegion: { x: 90, y: 45, radius: 45 }, direction: "down" },
      { strokeId: 2, name: "Right Belly", path: "M 90 140 C 180 120 180 225 90 225", startRegion: { x: 90, y: 140, radius: 40 }, direction: "cw-curve" }
    ]
  },
  c: {
    char: 'c', case: 'lower', lang: 'english', strokeCount: 1,
    instructions: ["Start at top right, curve up and all the way around!"],
    audioText: "Trace letter c! Curve around like a moon!",
    svgPath: "M 180 130 C 90 100 90 225 180 215",
    strokes: [
      { strokeId: 1, name: "Curve", path: "M 180 130 C 90 100 90 225 180 215", startRegion: { x: 180, y: 130, radius: 45 }, direction: "ccw-curve" }
    ]
  },
  d: {
    char: 'd', case: 'lower', lang: 'english', strokeCount: 2, bellyOrientation: 'left',
    instructions: ["Loop round belly on the left side first", "Draw tall stem straight down"],
    audioText: "Trace letter d! Round belly on left, tall stem down!",
    svgPath: "M 175 140 C 85 120 85 225 175 225 M 175 45 L 175 225",
    strokes: [
      { strokeId: 1, name: "Left Belly", path: "M 175 140 C 85 120 85 225 175 225", startRegion: { x: 175, y: 140, radius: 40 }, direction: "ccw-curve" },
      { strokeId: 2, name: "Tall Stem", path: "M 175 45 L 175 225", startRegion: { x: 175, y: 45, radius: 45 }, direction: "down" }
    ]
  },
  e: {
    char: 'e', case: 'lower', lang: 'english', strokeCount: 1,
    instructions: ["Go across middle, curve over top, and around bottom!"],
    audioText: "Trace letter e! Across middle, over top and around!",
    svgPath: "M 95 155 L 180 155 C 180 95 95 95 95 160 C 95 225 185 225 185 195",
    strokes: [
      { strokeId: 1, name: "e-Loop", path: "M 95 155 L 180 155 C 180 95 95 95 95 160 C 95 225 185 225 185 195", startRegion: { x: 95, y: 155, radius: 45 }, direction: "e-curve" }
    ]
  },
  f: {
    char: 'f', case: 'lower', lang: 'english', strokeCount: 2,
    instructions: ["Curve candy cane top and draw stem down", "Cross the bar across middle"],
    audioText: "Trace letter f! Candy cane stem, then cross middle bar!",
    svgPath: "M 170 60 C 120 40 120 120 120 235 M 90 135 L 160 135",
    strokes: [
      { strokeId: 1, name: "Hook Stem", path: "M 170 60 C 120 40 120 120 120 235", startRegion: { x: 170, y: 60, radius: 45 }, direction: "candy-hook" },
      { strokeId: 2, name: "Crossbar", path: "M 90 135 L 160 135", startRegion: { x: 90, y: 135, radius: 40 }, direction: "right" }
    ]
  },
  g: {
    char: 'g', case: 'lower', lang: 'english', strokeCount: 2,
    instructions: ["Draw top circle loop", "Draw stem down with hook tail below"],
    audioText: "Trace letter g! Circle loop top, hook tail below!",
    svgPath: "M 165 125 C 95 105 95 190 165 190 M 165 120 L 165 220 C 165 265 100 265 100 220",
    strokes: [
      { strokeId: 1, name: "Top Circle", path: "M 165 125 C 95 105 95 190 165 190", startRegion: { x: 165, y: 125, radius: 40 }, direction: "ccw-curve" },
      { strokeId: 2, name: "Hook Tail", path: "M 165 120 L 165 220 C 165 265 100 265 100 220", startRegion: { x: 165, y: 120, radius: 40 }, direction: "down-hook" }
    ]
  },
  h: {
    char: 'h', case: 'lower', lang: 'english', strokeCount: 2,
    instructions: ["Draw tall stem down", "Arch over to right and down to floor"],
    audioText: "Trace letter h! Tall stem down, arch over!",
    svgPath: "M 85 45 L 85 230 M 85 140 C 135 110 175 140 175 230",
    strokes: [
      { strokeId: 1, name: "Tall Stem", path: "M 85 45 L 85 230", startRegion: { x: 85, y: 45, radius: 45 }, direction: "down" },
      { strokeId: 2, name: "Arch Over", path: "M 85 140 C 135 110 175 140 175 230", startRegion: { x: 85, y: 140, radius: 40 }, direction: "arch" }
    ]
  },
  i: {
    char: 'i', case: 'lower', lang: 'english', strokeCount: 2, isDotSeparated: true,
    instructions: ["Draw short stem straight down", "Lift finger and tap dot on top! 👆"],
    audioText: "Trace letter i! Short stem down, then tap dot on top!",
    svgPath: "M 140 125 L 140 225 M 140 70 L 140 72",
    strokes: [
      { strokeId: 1, name: "Short Stem", path: "M 140 125 L 140 225", startRegion: { x: 140, y: 125, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Top Dot", path: "M 140 70 L 140 72", startRegion: { x: 140, y: 70, radius: 35 }, isDotTap: true }
    ]
  },
  j: {
    char: 'j', case: 'lower', lang: 'english', strokeCount: 2, isDotSeparated: true,
    instructions: ["Draw stem down with hook tail below", "Lift finger and tap dot on top! 👆"],
    audioText: "Trace letter j! Hook tail down, then tap dot on top!",
    svgPath: "M 155 125 L 155 210 C 155 260 95 260 95 220 M 155 70 L 155 72",
    strokes: [
      { strokeId: 1, name: "Hook Tail Stem", path: "M 155 125 L 155 210 C 155 260 95 260 95 220", startRegion: { x: 155, y: 125, radius: 40 }, direction: "down-hook" },
      { strokeId: 2, name: "Top Dot", path: "M 155 70 L 155 72", startRegion: { x: 155, y: 70, radius: 35 }, isDotTap: true }
    ]
  },
  k: {
    char: 'k', case: 'lower', lang: 'english', strokeCount: 3,
    instructions: ["Draw tall stem down", "Slant in to middle", "Kick leg out to bottom right"],
    audioText: "Trace letter k! Tall stem down, slant in, kick out!",
    svgPath: "M 90 45 L 90 230 M 175 120 L 90 175 M 90 175 L 175 230",
    strokes: [
      { strokeId: 1, name: "Tall Stem", path: "M 90 45 L 90 230", startRegion: { x: 90, y: 45, radius: 45 }, direction: "down" },
      { strokeId: 2, name: "Slant In", path: "M 175 120 L 90 175", startRegion: { x: 175, y: 120, radius: 40 }, direction: "down-left" },
      { strokeId: 3, name: "Kick Out", path: "M 90 175 L 175 230", startRegion: { x: 90, y: 175, radius: 40 }, direction: "down-right" }
    ]
  },
  l: {
    char: 'l', case: 'lower', lang: 'english', strokeCount: 1,
    instructions: ["Draw one tall, straight line down!"],
    audioText: "Trace letter l! One tall line straight down!",
    svgPath: "M 140 45 L 140 230",
    strokes: [
      { strokeId: 1, name: "Tall Line", path: "M 140 45 L 140 230", startRegion: { x: 140, y: 45, radius: 45 }, direction: "down" }
    ]
  },
  m: {
    char: 'm', case: 'lower', lang: 'english', strokeCount: 3,
    instructions: ["Draw left stem down", "Arch over to middle stem", "Arch over to right stem"],
    audioText: "Trace letter m! Line down, two rainbow arches!",
    svgPath: "M 60 120 L 60 230 M 60 140 C 90 110 120 140 120 230 M 120 140 C 150 110 180 140 180 230",
    strokes: [
      { strokeId: 1, name: "Left Stem", path: "M 60 120 L 60 230", startRegion: { x: 60, y: 120, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Middle Arch", path: "M 60 140 C 90 110 120 140 120 230", startRegion: { x: 60, y: 140, radius: 40 }, direction: "arch" },
      { strokeId: 3, name: "Right Arch", path: "M 120 140 C 150 110 180 140 180 230", startRegion: { x: 120, y: 140, radius: 40 }, direction: "arch" }
    ]
  },
  n: {
    char: 'n', case: 'lower', lang: 'english', strokeCount: 2,
    instructions: ["Draw short stem down", "Arch over to right stem"],
    audioText: "Trace letter n! Line down, arch over!",
    svgPath: "M 80 120 L 80 230 M 80 140 C 130 110 175 140 175 230",
    strokes: [
      { strokeId: 1, name: "Short Stem", path: "M 80 120 L 80 230", startRegion: { x: 80, y: 120, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Arch Over", path: "M 80 140 C 130 110 175 140 175 230", startRegion: { x: 80, y: 140, radius: 40 }, direction: "arch" }
    ]
  },
  o: {
    char: 'o', case: 'lower', lang: 'english', strokeCount: 1,
    instructions: ["Start at top and loop round like a donut!"],
    audioText: "Trace letter o! Round like a donut!",
    svgPath: "M 140 115 C 65 115 65 235 140 235 C 215 235 215 115 140 115 Z",
    strokes: [
      { strokeId: 1, name: "Circle Loop", path: "M 140 115 C 65 115 65 235 140 235 C 215 235 215 115 140 115 Z", startRegion: { x: 140, y: 115, radius: 40 }, direction: "ccw-loop" }
    ]
  },
  p: {
    char: 'p', case: 'lower', lang: 'english', strokeCount: 2, bellyOrientation: 'right',
    instructions: ["Draw stem down below line", "Loop top belly on right side"],
    audioText: "Trace letter p! Line down below, loop on top right!",
    svgPath: "M 90 110 L 90 260 M 90 120 C 175 100 175 190 90 190",
    strokes: [
      { strokeId: 1, name: "Descending Stem", path: "M 90 110 L 90 260", startRegion: { x: 90, y: 110, radius: 40 }, direction: "down" },
      { strokeId: 2, name: "Top Right Loop", path: "M 90 120 C 175 100 175 190 90 190", startRegion: { x: 90, y: 120, radius: 40 }, direction: "cw-curve" }
    ]
  },
  q: {
    char: 'q', case: 'lower', lang: 'english', strokeCount: 2, bellyOrientation: 'left',
    instructions: ["Loop left circle first", "Draw stem down below line"],
    audioText: "Trace letter q! Left circle loop, stem down below!",
    svgPath: "M 175 125 C 90 105 90 190 175 190 M 175 110 L 175 260",
    strokes: [
      { strokeId: 1, name: "Left Circle", path: "M 175 125 C 90 105 90 190 175 190", startRegion: { x: 175, y: 125, radius: 40 }, direction: "ccw-curve" },
      { strokeId: 2, name: "Descending Stem", path: "M 175 110 L 175 260", startRegion: { x: 175, y: 110, radius: 40 }, direction: "down" }
    ]
  },
  r: {
    char: 'r', case: 'lower', lang: 'english', strokeCount: 1,
    instructions: ["Draw down, go back up, and hook over right!"],
    audioText: "Trace letter r! Draw down, back up, hook over!",
    svgPath: "M 90 120 L 90 230 M 90 150 C 130 115 175 130 175 145",
    strokes: [
      { strokeId: 1, name: "r-Hook", path: "M 90 120 L 90 230 M 90 150 C 130 115 175 130 175 145", startRegion: { x: 90, y: 120, radius: 40 }, direction: "hook" }
    ]
  },
  s: {
    char: 's', case: 'lower', lang: 'english', strokeCount: 1,
    instructions: ["Slither curve left, switch right, curve left!"],
    audioText: "Trace letter s! Slither like a snake!",
    svgPath: "M 170 130 C 130 105 95 125 95 150 C 95 185 175 165 175 205 C 175 240 120 240 90 220",
    strokes: [
      { strokeId: 1, name: "Snake S-Curve", path: "M 170 130 C 130 105 95 125 95 150 C 95 185 175 165 175 205 C 175 240 120 240 90 220", startRegion: { x: 170, y: 130, radius: 45 }, direction: "s-curve" }
    ]
  },
  t: {
    char: 't', case: 'lower', lang: 'english', strokeCount: 2,
    instructions: ["Draw stem down with curl", "Cross middle bar across"],
    audioText: "Trace letter t! Stem down with curl, cross middle bar!",
    svgPath: "M 140 55 L 140 200 C 140 235 180 235 185 220 M 95 120 L 185 120",
    strokes: [
      { strokeId: 1, name: "Stem Curl", path: "M 140 55 L 140 200 C 140 235 180 235 185 220", startRegion: { x: 140, y: 55, radius: 45 }, direction: "down-curl" },
      { strokeId: 2, name: "Crossbar", path: "M 95 120 L 185 120", startRegion: { x: 95, y: 120, radius: 40 }, direction: "right" }
    ]
  },
  u: {
    char: 'u', case: 'lower', lang: 'english', strokeCount: 1,
    instructions: ["Go down, curve smile bottom, climb up, draw down!"],
    audioText: "Trace letter u! Down, smile bottom, climb up, draw down!",
    svgPath: "M 90 120 L 90 190 C 90 240 180 240 180 190 L 180 120 M 180 170 L 180 230",
    strokes: [
      { strokeId: 1, name: "u-Path", path: "M 90 120 L 90 190 C 90 240 180 240 180 190 L 180 120 M 180 170 L 180 230", startRegion: { x: 90, y: 120, radius: 45 }, direction: "u-turn" }
    ]
  },
  v: {
    char: 'v', case: 'lower', lang: 'english', strokeCount: 2,
    instructions: ["Slant down to point", "Slant up to right"],
    audioText: "Trace letter v! Slant down, slant up!",
    svgPath: "M 80 120 L 140 230 M 140 230 L 200 120",
    strokes: [
      { strokeId: 1, name: "Down Slant", path: "M 80 120 L 140 230", startRegion: { x: 80, y: 120, radius: 40 }, direction: "down-right" },
      { strokeId: 2, name: "Up Slant", path: "M 140 230 L 200 120", startRegion: { x: 140, y: 230, radius: 40 }, direction: "up-right" }
    ]
  },
  w: {
    char: 'w', case: 'lower', lang: 'english', strokeCount: 4,
    instructions: ["Slant down", "Slant up", "Slant down", "Slant up"],
    audioText: "Trace letter w! Down, up, down, up!",
    svgPath: "M 60 120 L 95 230 M 95 230 L 130 145 M 130 145 L 165 230 M 165 230 L 200 120",
    strokes: [
      { strokeId: 1, name: "Slant 1", path: "M 60 120 L 95 230", startRegion: { x: 60, y: 120, radius: 40 }, direction: "down-right" },
      { strokeId: 2, name: "Slant 2", path: "M 95 230 L 130 145", startRegion: { x: 95, y: 230, radius: 40 }, direction: "up-right" },
      { strokeId: 3, name: "Slant 3", path: "M 130 145 L 165 230", startRegion: { x: 130, y: 145, radius: 40 }, direction: "down-right" },
      { strokeId: 4, name: "Slant 4", path: "M 165 230 L 200 120", startRegion: { x: 165, y: 230, radius: 40 }, direction: "up-right" }
    ]
  },
  x: {
    char: 'x', case: 'lower', lang: 'english', strokeCount: 2,
    instructions: ["Slant down right", "Cross slant down left"],
    audioText: "Trace letter x! Slant down right, cross down left!",
    svgPath: "M 90 120 L 190 225 M 190 120 L 90 225",
    strokes: [
      { strokeId: 1, name: "First Diagonal", path: "M 90 120 L 190 225", startRegion: { x: 90, y: 120, radius: 40 }, direction: "down-right" },
      { strokeId: 2, name: "Cross Diagonal", path: "M 190 120 L 90 225", startRegion: { x: 190, y: 120, radius: 40 }, direction: "down-left" }
    ]
  },
  y: {
    char: 'y', case: 'lower', lang: 'english', strokeCount: 2,
    instructions: ["Short slant down to middle", "Long slant down below line to left"],
    audioText: "Trace letter y! Short slant, long slant down below!",
    svgPath: "M 85 120 L 140 175 M 195 120 L 105 260",
    strokes: [
      { strokeId: 1, name: "Short Slant", path: "M 85 120 L 140 175", startRegion: { x: 85, y: 120, radius: 40 }, direction: "down-right" },
      { strokeId: 2, name: "Long Slant", path: "M 195 120 L 105 260", startRegion: { x: 195, y: 120, radius: 40 }, direction: "down-left" }
    ]
  },
  z: {
    char: 'z', case: 'lower', lang: 'english', strokeCount: 1,
    instructions: ["Across top, slant down left, across bottom!"],
    audioText: "Trace letter z! Across, slant down, across!",
    svgPath: "M 85 120 L 185 120 L 85 225 L 185 225",
    strokes: [
      { strokeId: 1, name: "Z-Path", path: "M 85 120 L 185 120 L 85 225 L 185 225", startRegion: { x: 85, y: 120, radius: 40 }, direction: "z-path" }
    ]
  }
};

// Bengali Letter Definitions
const BENGALI_LETTERS = {
  'ব': {
    char: 'ব', lang: 'bengali', strokeCount: 2,
    instructions: ["উপরে সোজা মাত্রার দাগ টানো", "নিচে নামিয়ে ডানপাশে জোড়ো"],
    audioText: "ব বর্ণটি আঁকো! মাত্রা দাও, তারপর ত্রিভুজাকৃতি নিচে নামাও!",
    svgPath: "M 80 55 L 190 55 M 190 55 L 80 220 L 190 220",
    strokes: [
      { strokeId: 1, name: "মাত্রা (Headbar)", path: "M 80 55 L 190 55", startRegion: { x: 80, y: 55, radius: 45 }, direction: "right" },
      { strokeId: 2, name: "ব-আকৃতি (Body)", path: "M 190 55 L 80 220 L 190 220", startRegion: { x: 190, y: 55, radius: 45 }, direction: "down-triangle" }
    ]
  },
  'র': {
    char: 'র', lang: 'bengali', strokeCount: 3,
    instructions: ["'ব' বর্ণটি আঁকো", "নিচে একটি ফুটকি বা গোল বিন্দু দাও"],
    audioText: "র বর্ণটি আঁকো! ব এঁকে নিচে একটি বিন্দু দাও!",
    svgPath: "M 80 55 L 190 55 M 190 55 L 80 200 L 190 200 M 135 240 L 135 242",
    strokes: [
      { strokeId: 1, name: "মাত্রা (Headbar)", path: "M 80 55 L 190 55", startRegion: { x: 80, y: 55, radius: 45 }, direction: "right" },
      { strokeId: 2, name: "ব-আকৃতি (Body)", path: "M 190 55 L 80 200 L 190 200", startRegion: { x: 190, y: 55, radius: 45 }, direction: "down-triangle" },
      { strokeId: 3, name: "বিন্দু (Dot)", path: "M 135 240 L 135 242", startRegion: { x: 135, y: 240, radius: 40 }, isDotTap: true }
    ]
  },
  'ক': {
    char: 'ক', lang: 'bengali', strokeCount: 3,
    instructions: ["উপরে সোজা মাত্রা টানো", "খাড়া দাগ নামাও", "ডানপাশে বাঁকা লুপ আঁকো"],
    audioText: "ক বর্ণটি আঁকো! মাত্রা, খাড়া দাগ এবং ডানপাশে লুপ!",
    svgPath: "M 75 60 L 195 60 M 195 60 L 75 225 M 120 150 C 180 140 180 220 140 220",
    strokes: [
      { strokeId: 1, name: "মাত্রা", path: "M 75 60 L 195 60", startRegion: { x: 75, y: 60, radius: 45 }, direction: "right" },
      { strokeId: 2, name: "প্রধান লম্ব রেখা", path: "M 195 60 L 75 225", startRegion: { x: 195, y: 60, radius: 45 }, direction: "down-left" },
      { strokeId: 3, name: "ডান লুপ", path: "M 120 150 C 180 140 180 220 140 220", startRegion: { x: 120, y: 150, radius: 40 }, direction: "loop" }
    ]
  },
  'অ': {
    char: 'অ', lang: 'bengali', strokeCount: 3,
    instructions: ["ছোট গোল ঘুন্ডি থেকে শুরু করে বাঁকাও", "খাড়া রেখা টেনে মাত্রা দাও"],
    audioText: "অ বর্ণটি আঁকো!",
    svgPath: "M 95 110 C 130 90 70 180 140 225 M 185 60 L 185 225 M 140 60 L 195 60",
    strokes: [
      { strokeId: 1, name: "ঘুন্ডি ও বাঁক", path: "M 95 110 C 130 90 70 180 140 225", startRegion: { x: 95, y: 110, radius: 45 }, direction: "curve" },
      { strokeId: 2, name: "খাড়া রেখা", path: "M 185 60 L 185 225", startRegion: { x: 185, y: 60, radius: 45 }, direction: "down" },
      { strokeId: 3, name: "মাত্রা", path: "M 140 60 L 195 60", startRegion: { x: 140, y: 60, radius: 40 }, direction: "right" }
    ]
  },
  'আ': {
    char: 'আ', lang: 'bengali', strokeCount: 4,
    instructions: ["'অ' এঁকে পাশে আকারের টান দাও"],
    audioText: "আ বর্ণটি আঁকো!",
    svgPath: "M 80 110 C 110 90 60 180 120 220 M 160 60 L 160 220 M 200 60 L 200 220 M 140 60 L 210 60",
    strokes: [
      { strokeId: 1, name: "অ-ঘুন্ডি", path: "M 80 110 C 110 90 60 180 120 220", startRegion: { x: 80, y: 110, radius: 45 }, direction: "curve" },
      { strokeId: 2, name: "প্রথম খাড়া দাগ", path: "M 160 60 L 160 220", startRegion: { x: 160, y: 60, radius: 45 }, direction: "down" },
      { strokeId: 3, name: "আ-কার খাড়া দাগ", path: "M 200 60 L 200 220", startRegion: { x: 200, y: 60, radius: 45 }, direction: "down" },
      { strokeId: 4, name: "মাত্রা", path: "M 140 60 L 210 60", startRegion: { x: 140, y: 60, radius: 40 }, direction: "right" }
    ]
  }
};

// Hindi Devanagari Letter Definitions
const HINDI_LETTERS = {
  'ब': {
    char: 'ब', lang: 'hindi', strokeCount: 4,
    instructions: ["शिरोरेखा खींचें", "खड़ी रेखा बनाएं", "पेट का गोल मोड़ बनाएं", "पेट में तिरछी रेखा काटें"],
    audioText: "ब अक्षर बनाएं! शिरोरेखा, खड़ी रेखा, पेट और तिरछी लकीर!",
    svgPath: "M 70 55 L 200 55 M 180 55 L 180 225 M 180 155 C 110 110 110 195 180 155 M 125 130 L 165 175",
    strokes: [
      { strokeId: 1, name: "शिरोरेखा (Headbar)", path: "M 70 55 L 200 55", startRegion: { x: 70, y: 55, radius: 45 }, direction: "right" },
      { strokeId: 2, name: "खड़ी रेखा (Stem)", path: "M 180 55 L 180 225", startRegion: { x: 180, y: 55, radius: 45 }, direction: "down" },
      { strokeId: 3, name: "गोल पेट (Belly)", path: "M 180 155 C 110 110 110 195 180 155", startRegion: { x: 180, y: 155, radius: 40 }, direction: "loop" },
      { strokeId: 4, name: "तिरछी लकीर (Cross-slant)", path: "M 125 130 L 165 175", startRegion: { x: 125, y: 130, radius: 40 }, direction: "down-right" }
    ]
  },
  'भ': {
    char: 'भ', lang: 'hindi', strokeCount: 3,
    instructions: ["आगे छोटी घुंडी बनाएं", "नीचे आकर गाठ देकर बाईं ओर बढ़ें", "खड़ी रेखा बनाएं", "छोटी शिरोरेखा दें"],
    audioText: "भ अक्षर बनाएं! घुंडी, गाठ, खड़ी रेखा और छोटी शिरोरेखा!",
    svgPath: "M 85 95 C 110 75 95 185 145 185 M 185 55 L 185 225 M 145 55 L 195 55",
    strokes: [
      { strokeId: 1, name: "घुंडी व गाठ", path: "M 85 95 C 110 75 95 185 145 185", startRegion: { x: 85, y: 95, radius: 45 }, direction: "loop" },
      { strokeId: 2, name: "खड़ी रेखा", path: "M 185 55 L 185 225", startRegion: { x: 185, y: 55, radius: 45 }, direction: "down" },
      { strokeId: 3, name: "छोटी शिरोरेखा", path: "M 145 55 L 195 55", startRegion: { x: 145, y: 55, radius: 40 }, direction: "right" }
    ]
  },
  'द': {
    char: 'द', lang: 'hindi', strokeCount: 3,
    instructions: ["शिरोरेखा खींचें", "छोटी खड़ी रेखा और सी-आकार मोड़ लें", "नीचे छोटी पूंछ निकालें"],
    audioText: "द अक्षर बनाएं! शिरोरेखा, मोड़ और नीचे पूंछ!",
    svgPath: "M 75 55 L 195 55 M 135 55 C 135 95 90 145 165 185 M 165 185 L 140 245",
    strokes: [
      { strokeId: 1, name: "शिरोरेखा", path: "M 75 55 L 195 55", startRegion: { x: 75, y: 55, radius: 45 }, direction: "right" },
      { strokeId: 2, name: "मोड़", path: "M 135 55 C 135 95 90 145 165 185", startRegion: { x: 135, y: 55, radius: 45 }, direction: "curve" },
      { strokeId: 3, name: "पूंछ", path: "M 165 185 L 140 245", startRegion: { x: 165, y: 185, radius: 40 }, direction: "down-left" }
    ]
  },
  'अ': {
    char: 'अ', lang: 'hindi', strokeCount: 4,
    instructions: ["दो घुमावदार मोड़ बनाएं", "बीच में छोटी रेखा खींचें", "खड़ी रेखा बनाएं", "शिरोरेखा दें"],
    audioText: "अ अक्षर बनाएं!",
    svgPath: "M 90 95 C 135 75 85 140 145 155 C 85 170 90 215 135 215 M 135 155 L 185 155 M 185 55 L 185 225 M 140 55 L 195 55",
    strokes: [
      { strokeId: 1, name: "घुमावदार मोड़", path: "M 90 95 C 135 75 85 140 145 155 C 85 170 90 215 135 215", startRegion: { x: 90, y: 95, radius: 45 }, direction: "3-curve" },
      { strokeId: 2, name: "बीच की रेखा", path: "M 135 155 L 185 155", startRegion: { x: 135, y: 155, radius: 40 }, direction: "right" },
      { strokeId: 3, name: "खड़ी रेखा", path: "M 185 55 L 185 225", startRegion: { x: 185, y: 55, radius: 45 }, direction: "down" },
      { strokeId: 4, name: "शिरोरेखा", path: "M 140 55 L 195 55", startRegion: { x: 140, y: 55, radius: 40 }, direction: "right" }
    ]
  }
};

// Internal registry lookup helper
export function getLetterDefinition(char, lang = 'english', letterCase = 'lower') {
  if (!char) return null;

  let def = null;
  if (lang === 'bengali' && BENGALI_LETTERS[char]) {
    def = BENGALI_LETTERS[char];
  } else if (lang === 'hindi' && HINDI_LETTERS[char]) {
    def = HINDI_LETTERS[char];
  } else if (lang === 'english') {
    if (letterCase === 'upper' || (char === char.toUpperCase() && char !== char.toLowerCase())) {
      def = ENGLISH_UPPER[char] || ENGLISH_UPPER[char.toUpperCase()];
    } else {
      def = ENGLISH_LOWER[char] || ENGLISH_LOWER[char.toLowerCase()];
    }
  }

  // Fallback generator for unconfigured characters to ensure NO letter ever crashes
  if (!def) {
    const isUpper = char === char.toUpperCase();
    const isEng = /[a-zA-Z]/.test(char);
    def = {
      char,
      case: isUpper ? 'upper' : 'lower',
      lang: isEng ? 'english' : lang,
      strokeCount: 1,
      instructions: [`Trace the letter '${char}' following its natural shape!`],
      audioText: `Trace letter ${char}!`,
      svgPath: `M 140 55 C 60 55 60 225 140 225 C 220 225 220 55 140 55 Z`,
      strokes: [
        {
          strokeId: 1,
          name: "Main Stroke",
          path: `M 140 55 C 60 55 60 225 140 225 C 220 225 220 55 140 55 Z`,
          startRegion: { x: 140, y: 55, radius: 50 },
          direction: "curve"
        }
      ]
    };
  }

  // Populate dense internal mathematical sampled points for validation (NEVER visually rendered)
  const populatedStrokes = def.strokes.map(s => {
    return {
      ...s,
      sampledPoints: sampleSvgPath(s.path, 25)
    };
  });

  return {
    ...def,
    strokes: populatedStrokes
  };
}
