import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, Sparkles, ArrowRight, Volume2, PlayCircle, Star, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const DYSLEXIA_FOCUS_PAIRS = ['b', 'd', 'p', 'q', 'm', 'w', 's', 'z', 'n', 'u', 'i', 'j', 't', 'x'];

// Precise Guide Paths for Letters with Multi-Stroke Support (Normalized to 280x280)
const ACCURATE_LETTER_PATHS = {
  a: {
    instruction: "Trace 'a'! Circle around to the left, then draw straight down!",
    audioText: "Trace letter a! Circle to the left, then line down!",
    guideDots: [
      { id: 1, x: 180, y: 120, label: '1' },
      { id: 2, x: 120, y: 130 },
      { id: 3, x: 95, y: 175 },
      { id: 4, x: 130, y: 220 },
      { id: 5, x: 180, y: 190, label: '2' },
      { id: 6, x: 180, y: 225, label: '3' }
    ]
  },
  b: {
    instruction: "Trace 'b'! Start tall at the top, go straight down, then loop the belly on the right!",
    audioText: "Trace letter b! Tall line down, then round belly on the right!",
    bellyOrientation: 'right',
    guideDots: [
      { id: 1, x: 90, y: 45, label: '1' },
      { id: 2, x: 90, y: 135 },
      { id: 3, x: 90, y: 225, label: '2' },
      { id: 4, x: 135, y: 135 },
      { id: 5, x: 175, y: 180 },
      { id: 6, x: 135, y: 225 },
      { id: 7, x: 90, y: 225 }
    ]
  },
  c: {
    instruction: "Trace 'c'! Start at the top right, curve up and all the way around like a moon!",
    audioText: "Trace letter c! Curve around like a moon!",
    guideDots: [
      { id: 1, x: 180, y: 130, label: '1' },
      { id: 2, x: 130, y: 115 },
      { id: 3, x: 90, y: 175 },
      { id: 4, x: 130, y: 230 },
      { id: 5, x: 180, y: 215, label: '2' }
    ]
  },
  d: {
    instruction: "Trace 'd'! Make the round belly on the left first, then go to the top and draw down!",
    audioText: "Trace letter d! Round belly on the left, then tall line down!",
    bellyOrientation: 'left',
    guideDots: [
      { id: 1, x: 155, y: 135, label: '1' },
      { id: 2, x: 110, y: 140 },
      { id: 3, x: 85, y: 180 },
      { id: 4, x: 120, y: 225 },
      { id: 5, x: 175, y: 225, label: '2' },
      { id: 6, x: 175, y: 45, label: '3' },
      { id: 7, x: 175, y: 135 }
    ]
  },
  e: {
    instruction: "Trace 'e'! Go across the middle, curve over the top, and around!",
    audioText: "Trace letter e! Across the middle, over and around!",
    guideDots: [
      { id: 1, x: 100, y: 175, label: '1' },
      { id: 2, x: 175, y: 175 },
      { id: 3, x: 140, y: 120, label: '2' },
      { id: 4, x: 90, y: 170 },
      { id: 5, x: 140, y: 225 },
      { id: 6, x: 175, y: 210, label: '3' }
    ]
  },
  f: {
    instruction: "Trace 'f'! Curve over like a candy cane, draw down, then lift and cross the middle!",
    audioText: "Trace letter f! Candy cane top, then cross the middle!",
    multiStroke: true,
    requiredDots: [4, 6], // Candy cane bottom & Crossbar
    guideDots: [
      { id: 1, x: 170, y: 60, label: '1' },
      { id: 2, x: 130, y: 45 },
      { id: 3, x: 120, y: 135 },
      { id: 4, x: 120, y: 235, label: '2' },
      { id: 5, x: 90, y: 135, label: 'Cross ➔' },
      { id: 6, x: 155, y: 135 }
    ]
  },
  g: {
    instruction: "Trace 'g'! Make the circle on top, then draw down with a hook tail below!",
    audioText: "Trace letter g! Circle on top and hook tail below!",
    guideDots: [
      { id: 1, x: 165, y: 125, label: '1' },
      { id: 2, x: 105, y: 135 },
      { id: 3, x: 105, y: 190 },
      { id: 4, x: 165, y: 190, label: '2' },
      { id: 5, x: 165, y: 245 },
      { id: 6, x: 110, y: 255, label: '3' }
    ]
  },
  h: {
    instruction: "Trace 'h'! Start tall, draw straight down, then arch over to the right!",
    audioText: "Trace letter h! Tall line down and arch over!",
    guideDots: [
      { id: 1, x: 85, y: 45, label: '1' },
      { id: 2, x: 85, y: 140 },
      { id: 3, x: 85, y: 230, label: '2' },
      { id: 4, x: 135, y: 135 },
      { id: 5, x: 175, y: 175 },
      { id: 6, x: 175, y: 230, label: '3' }
    ]
  },
  i: {
    instruction: "Trace 'i'! 1) Draw the line down, then 2) tap the dot on top!",
    audioText: "Trace letter i! Draw the line down, then tap the dot on top!",
    multiStroke: true,
    dotId: 4,
    stemDotIds: [1, 2, 3],
    guideDots: [
      { id: 1, x: 140, y: 125, label: '1' },
      { id: 2, x: 140, y: 175 },
      { id: 3, x: 140, y: 225, label: '2' },
      { id: 4, x: 140, y: 70, label: 'Dot 👆' }
    ]
  },
  j: {
    instruction: "Trace 'j'! 1) Draw down with a hook tail below, then 2) tap the dot on top!",
    audioText: "Trace letter j! Draw the hook tail down, then tap the dot on top!",
    multiStroke: true,
    dotId: 5,
    stemDotIds: [1, 2, 3, 4],
    guideDots: [
      { id: 1, x: 155, y: 125, label: '1' },
      { id: 2, x: 155, y: 185 },
      { id: 3, x: 155, y: 240, label: '2' },
      { id: 4, x: 105, y: 255, label: '3' },
      { id: 5, x: 155, y: 70, label: 'Dot 👆' }
    ]
  },
  k: {
    instruction: "Trace 'k'! 1) Tall line down, 2) slant in, and 3) kick out!",
    audioText: "Trace letter k! Tall line down, slant in, and kick out!",
    multiStroke: true,
    guideDots: [
      { id: 1, x: 90, y: 45, label: '1' },
      { id: 2, x: 90, y: 230, label: '2' },
      { id: 3, x: 175, y: 120, label: 'In 3' },
      { id: 4, x: 90, y: 175 },
      { id: 5, x: 175, y: 230, label: 'Out 4' }
    ]
  },
  l: {
    instruction: "Trace 'l'! Start at the very top and draw one tall, straight line down!",
    audioText: "Trace letter l! One tall line straight down!",
    guideDots: [
      { id: 1, x: 140, y: 45, label: '1' },
      { id: 2, x: 140, y: 140 },
      { id: 3, x: 140, y: 230, label: '2' }
    ]
  },
  m: {
    instruction: "Trace 'm'! Draw down, then make two rainbow arches to the right!",
    audioText: "Trace letter m! Draw down, then two arches!",
    guideDots: [
      { id: 1, x: 60, y: 120, label: '1' },
      { id: 2, x: 60, y: 230, label: '2' },
      { id: 3, x: 115, y: 120, label: '3' },
      { id: 4, x: 115, y: 230 },
      { id: 5, x: 175, y: 120, label: '4' },
      { id: 6, x: 175, y: 230 }
    ]
  },
  n: {
    instruction: "Trace 'n'! Draw straight down, then arch over to the right!",
    audioText: "Trace letter n! Straight down, then arch over!",
    guideDots: [
      { id: 1, x: 80, y: 120, label: '1' },
      { id: 2, x: 80, y: 230, label: '2' },
      { id: 3, x: 135, y: 120, label: '3' },
      { id: 4, x: 175, y: 170 },
      { id: 5, x: 175, y: 230, label: '4' }
    ]
  },
  o: {
    instruction: "Trace 'o'! Start at the top, curve around all the way like a big donut!",
    audioText: "Trace letter o! Round and round like a donut!",
    guideDots: [
      { id: 1, x: 140, y: 115, label: '1' },
      { id: 2, x: 85, y: 175 },
      { id: 3, x: 140, y: 235, label: '2' },
      { id: 4, x: 195, y: 175 },
      { id: 5, x: 140, y: 115, label: '3' }
    ]
  },
  p: {
    instruction: "Trace 'p'! Start at the top, go down below the line, then loop on the right!",
    audioText: "Trace letter p! Straight down below, then loop on the top right!",
    bellyOrientation: 'right',
    guideDots: [
      { id: 1, x: 90, y: 110, label: '1' },
      { id: 2, x: 90, y: 180 },
      { id: 3, x: 90, y: 255, label: '2' },
      { id: 4, x: 135, y: 110 },
      { id: 5, x: 175, y: 145 },
      { id: 6, x: 135, y: 185 },
      { id: 7, x: 90, y: 185 }
    ]
  },
  q: {
    instruction: "Trace 'q'! Make the round loop on the left first, then go down below with a flick!",
    audioText: "Trace letter q! Circle on the left, then straight down below!",
    bellyOrientation: 'left',
    guideDots: [
      { id: 1, x: 155, y: 120, label: '1' },
      { id: 2, x: 105, y: 125 },
      { id: 3, x: 85, y: 155 },
      { id: 4, x: 120, y: 185 },
      { id: 5, x: 175, y: 185, label: '2' },
      { id: 6, x: 175, y: 255, label: '3' }
    ]
  },
  r: {
    instruction: "Trace 'r'! Draw down, go back up, and hook over to the right!",
    audioText: "Trace letter r! Draw down, back up, and hook over!",
    guideDots: [
      { id: 1, x: 90, y: 120, label: '1' },
      { id: 2, x: 90, y: 230, label: '2' },
      { id: 3, x: 135, y: 120, label: '3' },
      { id: 4, x: 175, y: 140 }
    ]
  },
  s: {
    instruction: "Trace 's'! Slither like a friendly snake! Curve left, switch across, and curve right!",
    audioText: "Trace letter s! Slither like a snake, curve left and curve right!",
    guideDots: [
      { id: 1, x: 170, y: 130, label: '1' },
      { id: 2, x: 130, y: 115 },
      { id: 3, x: 95, y: 150 },
      { id: 4, x: 140, y: 175, label: '2' },
      { id: 5, x: 175, y: 205 },
      { id: 6, x: 130, y: 235 },
      { id: 7, x: 90, y: 220, label: '3' }
    ]
  },
  t: {
    instruction: "Trace 't'! 1) Tall line down with a curl, then 2) lift and draw the crossbar across!",
    audioText: "Trace letter t! Tall line down, then cross the bar across!",
    multiStroke: true,
    requiredDots: [3, 5],
    guideDots: [
      { id: 1, x: 140, y: 55, label: '1' },
      { id: 2, x: 140, y: 160 },
      { id: 3, x: 140, y: 230, label: '2' },
      { id: 4, x: 95, y: 120, label: 'Cross ➔' },
      { id: 5, x: 185, y: 120 }
    ]
  },
  u: {
    instruction: "Trace 'u'! Go down, curve up like a smile, and draw straight down!",
    audioText: "Trace letter u! Down, smile up, and straight down!",
    guideDots: [
      { id: 1, x: 90, y: 120, label: '1' },
      { id: 2, x: 90, y: 200 },
      { id: 3, x: 140, y: 235, label: '2' },
      { id: 4, x: 180, y: 200 },
      { id: 5, x: 180, y: 120, label: '3' },
      { id: 6, x: 180, y: 230 }
    ]
  },
  v: {
    instruction: "Trace 'v'! Slant down to the point, then slant up to the top!",
    audioText: "Trace letter v! Slant down, slant up!",
    guideDots: [
      { id: 1, x: 80, y: 120, label: '1' },
      { id: 2, x: 140, y: 230, label: '2' },
      { id: 3, x: 200, y: 120, label: '3' }
    ]
  },
  w: {
    instruction: "Trace 'w'! Slant down, slant up, slant down, and slant up again!",
    audioText: "Trace letter w! Down, up, down, up like two valleys!",
    guideDots: [
      { id: 1, x: 60, y: 120, label: '1' },
      { id: 2, x: 95, y: 230 },
      { id: 3, x: 130, y: 145, label: '2' },
      { id: 4, x: 165, y: 230 },
      { id: 5, x: 200, y: 120, label: '3' }
    ]
  },
  x: {
    instruction: "Trace 'x'! 1) Slant down right, then 2) lift and slant down left across!",
    audioText: "Trace letter x! Slant down right, then cross down left!",
    multiStroke: true,
    requiredDots: [2, 4],
    guideDots: [
      { id: 1, x: 90, y: 120, label: '1' },
      { id: 2, x: 190, y: 225, label: '2' },
      { id: 3, x: 190, y: 120, label: 'Cross ➔' },
      { id: 4, x: 90, y: 225, label: '4' }
    ]
  },
  y: {
    instruction: "Trace 'y'! 1) Slant short to the middle, then 2) slant long down below!",
    audioText: "Trace letter y! Short slant, then long slant down below!",
    multiStroke: true,
    requiredDots: [2, 4],
    guideDots: [
      { id: 1, x: 85, y: 120, label: '1' },
      { id: 2, x: 140, y: 175, label: '2' },
      { id: 3, x: 195, y: 120, label: '3' },
      { id: 4, x: 105, y: 260, label: '4' }
    ]
  },
  z: {
    instruction: "Trace 'z'! Go across to the right, slant down left, and across the bottom!",
    audioText: "Trace letter z! Across, slant down, and across!",
    guideDots: [
      { id: 1, x: 85, y: 120, label: '1' },
      { id: 2, x: 185, y: 120, label: '2' },
      { id: 3, x: 85, y: 225, label: '3' },
      { id: 4, x: 185, y: 225, label: '4' }
    ]
  }
};

const getLetterConfig = (char) => {
  if (ACCURATE_LETTER_PATHS[char]) {
    return { char, ...ACCURATE_LETTER_PATHS[char] };
  }
  return {
    char,
    instruction: `Trace the letter '${char}'! Follow the golden guide dots!`,
    audioText: `Trace letter ${char}!`,
    guideDots: [
      { id: 1, x: 90, y: 90, label: '1' },
      { id: 2, x: 140, y: 160, label: '2' },
      { id: 3, x: 190, y: 230, label: '3' }
    ]
  };
};

export default function LetterTracingQuest({ onCompleteQuest, onBack }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars } = useProfile();

  const canvasRef = useRef(null);
  const [selectedLetter, setSelectedLetter] = useState('i');
  const [viewFilter, setViewFilter] = useState('focus');
  const [isDrawing, setIsDrawing] = useState(false);
  const [collectedDotIds, setCollectedDotIds] = useState(new Set());
  const [tracingStatus, setTracingStatus] = useState('idle'); // 'idle' | 'need_dot' | 'need_cross' | 'success'
  const [isDemonstrating, setIsDemonstrating] = useState(false);

  const currentTarget = getLetterConfig(selectedLetter);

  useEffect(() => {
    speakText(currentTarget.audioText);
    resetCanvas();
  }, [selectedLetter]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    if (isDemonstrating) return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    
    // Check dot collisions
    checkDotCollisions(coords);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#4F46E5';
    ctx.shadowColor = '#818CF8';
    ctx.shadowBlur = 4;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    // Draw smooth tiny cap for single taps without blob distortion
    ctx.lineTo(coords.x + 0.1, coords.y + 0.1);
    ctx.stroke();
  };

  const draw = (e) => {
    if (!isDrawing || isDemonstrating) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    checkDotCollisions(coords);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#4F46E5';
    ctx.shadowColor = '#818CF8';
    ctx.shadowBlur = 4;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  // Generous magnetic touch hit radius (38px)
  const checkDotCollisions = (coords) => {
    currentTarget.guideDots.forEach((dot) => {
      const dist = Math.hypot(coords.x - dot.x, coords.y - dot.y);
      if (dist < 38 && !collectedDotIds.has(dot.id)) {
        setCollectedDotIds((prev) => {
          const next = new Set(prev);
          next.add(dot.id);
          evaluateProgress(next);
          return next;
        });
        playPop();
      }
    });
  };

  // Accurate multi-stroke evaluation
  const evaluateProgress = (currentCollected) => {
    // 1. For 'i' & 'j':
    if (currentTarget.char === 'i' || currentTarget.char === 'j') {
      const hasDot = currentCollected.has(currentTarget.dotId);
      const hasStem = currentTarget.stemDotIds.some((id) => currentCollected.has(id));

      if (hasStem && !hasDot) {
        setTracingStatus('need_dot');
      } else if (hasStem && hasDot) {
        triggerSuccess();
      }
      return;
    }

    // 2. For multi-stroke letters with required segments (e.g. 't', 'f', 'x', 'y'):
    if (currentTarget.requiredDots) {
      const allRequired = currentTarget.requiredDots.every((id) => currentCollected.has(id));
      if (allRequired) {
        triggerSuccess();
      } else if (currentCollected.size >= 2) {
        setTracingStatus('need_cross');
      }
      return;
    }

    // 3. For all standard single-stroke letters:
    const totalDots = currentTarget.guideDots.length;
    const ratio = currentCollected.size / totalDots;
    if (ratio >= 0.75 && tracingStatus !== 'success') {
      triggerSuccess();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const triggerSuccess = () => {
    if (tracingStatus === 'success') return;
    setTracingStatus('success');
    playStarTwinkle();
    addStars(5);

    try {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.6 }
      });
    } catch (err) {}
  };

  // Show Me Auto Demonstration Animation
  const handleDemonstration = () => {
    if (isDemonstrating) return;
    resetCanvas();
    setIsDemonstrating(true);
    speakText(`Watch Mitra draw letter ${selectedLetter}!`);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dots = currentTarget.guideDots;
    let index = 0;

    const interval = setInterval(() => {
      if (index < dots.length) {
        const dot = dots[index];
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#F59E0B';
        ctx.shadowColor = '#FDE68A';
        ctx.shadowBlur = 8;

        if (index === 0 || (currentTarget.multiStroke && (dot.label?.includes('Cross') || dot.label?.includes('Dot') || dot.label?.includes('In')))) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#F59E0B';
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(dot.x, dot.y);
        } else {
          ctx.lineTo(dot.x, dot.y);
          ctx.stroke();
        }
        playChime(450 + index * 35);
        index++;
      } else {
        clearInterval(interval);
        setIsDemonstrating(false);
        speakText('Your turn now! Give it a try!');
      }
    }, 400);
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCollectedDotIds(new Set());
    setTracingStatus('idle');
  };

  const letterList = viewFilter === 'focus' ? DYSLEXIA_FOCUS_PAIRS : ALL_LETTERS;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        maxWidth: '620px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        borderRadius: '28px'
      }}
    >
      {onBack && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
          <button
            onClick={() => {
              playPop();
              onBack();
            }}
            className="btn btn-secondary btn-pill"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            ← Back to Games
          </button>
        </div>
      )}

      {/* Alphabet Selector */}
      <div style={{ marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🎨</span>
            <span style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1E293B' }}>
              Choose Any Letter to Trace
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.3rem', background: '#F1F5F9', padding: '0.2rem', borderRadius: '9999px' }}>
            <button
              onClick={() => {
                playPop();
                setViewFilter('focus');
              }}
              style={{
                border: 'none',
                background: viewFilter === 'focus' ? 'white' : 'transparent',
                color: viewFilter === 'focus' ? '#4F46E5' : '#64748B',
                fontWeight: '700',
                fontSize: '0.75rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: viewFilter === 'focus' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🌟 Dyslexia Focus
            </button>
            <button
              onClick={() => {
                playPop();
                setViewFilter('all');
              }}
              style={{
                border: 'none',
                background: viewFilter === 'all' ? 'white' : 'transparent',
                color: viewFilter === 'all' ? '#4F46E5' : '#64748B',
                fontWeight: '700',
                fontSize: '0.75rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: viewFilter === 'all' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🔤 All A-Z
            </button>
          </div>
        </div>

        {/* Carousel Bar */}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            overflowX: 'auto',
            padding: '0.3rem 0.2rem',
            scrollBehavior: 'smooth'
          }}
        >
          {letterList.map((ch) => {
            const isSelected = selectedLetter === ch;
            return (
              <button
                key={ch}
                onClick={() => {
                  playPop();
                  setSelectedLetter(ch);
                }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  border: isSelected ? '2.5px solid #4F46E5' : '1.5px solid #E2E8F0',
                  background: isSelected ? '#EEF2FF' : 'white',
                  color: isSelected ? '#4338CA' : '#1E293B',
                  fontWeight: '800',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 4px 10px rgba(79, 70, 229, 0.25)' : 'none',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s ease'
                }}
              >
                {ch}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instruction & Demo Button */}
      <div
        style={{
          background: '#FEF3C7',
          padding: '0.6rem 1rem',
          borderRadius: '16px',
          border: '1.5px solid #FDE68A',
          marginBottom: '1rem',
          fontSize: '0.88rem',
          fontWeight: '600',
          color: '#92400E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}
      >
        <span>{currentTarget.instruction}</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={handleDemonstration}
            disabled={isDemonstrating}
            style={{
              background: '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)'
            }}
            title="Watch Mitra Demonstrate"
          >
            <PlayCircle size={14} />
            <span>Show Me</span>
          </button>

          <button
            onClick={() => speakText(currentTarget.audioText)}
            style={{
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#B45309',
              flexShrink: 0
            }}
            title="Hear Audio"
          >
            <Volume2 size={15} />
          </button>
        </div>
      </div>

      {/* Canvas Tracing Arena */}
      <div
        style={{
          position: 'relative',
          width: '280px',
          height: '280px',
          margin: '0 auto 1rem',
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '3px dashed #CBD5E1',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)',
          touchAction: 'none'
        }}
      >
        {/* Letter Watermark */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          <span
            style={{
              fontSize: '175px',
              fontFamily: "'Lexend', sans-serif",
              fontWeight: '700',
              color: 'rgba(226, 232, 240, 0.75)',
              lineHeight: 1
            }}
          >
            {currentTarget.char}
          </span>
        </div>

        {/* Magnetic Guide Dots */}
        {currentTarget.guideDots.map((dot) => {
          const isCollected = collectedDotIds.has(dot.id);
          const isPulsing = (tracingStatus === 'need_dot' && dot.label?.includes('Dot')) ||
                            (tracingStatus === 'need_cross' && dot.label?.includes('Cross'));
          return (
            <div
              key={dot.id}
              style={{
                position: 'absolute',
                left: `${dot.x}px`,
                top: `${dot.y}px`,
                transform: 'translate(-50%, -50%)',
                width: dot.label ? (dot.label.length > 3 ? '44px' : '26px') : '14px',
                height: dot.label ? '24px' : '14px',
                borderRadius: '9999px',
                background: isCollected ? '#10B981' : isPulsing ? '#F59E0B' : dot.label ? '#F59E0B' : '#94A3B8',
                border: isCollected ? '2.5px solid #D1FAE5' : isPulsing ? '2.5px solid #FEF3C7' : '2px solid white',
                boxShadow: isCollected ? '0 0 12px #10B981' : isPulsing ? '0 0 14px #F59E0B' : '0 2px 6px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                animation: isPulsing ? 'gentle-bounce 1.5s infinite' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isCollected ? '⭐' : dot.label || ''}
            </div>
          );
        })}

        {/* Active Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            position: 'absolute',
            inset: 0,
            cursor: 'crosshair',
            zIndex: 10
          }}
        />
      </div>

      {/* Guided Helper / Success Feedback */}
      {tracingStatus === 'need_dot' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#B45309', background: '#FEF3C7', padding: '0.45rem 0.75rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={18} color="#D97706" />
          <span>Almost done! Now tap the dot on top! 👆</span>
        </div>
      )}

      {tracingStatus === 'need_cross' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#4338CA', background: '#EEF2FF', padding: '0.45rem 0.75rem', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={18} color="#4F46E5" />
          <span>Great line! Now draw the crossbar across! ➔</span>
        </div>
      )}

      {tracingStatus === 'success' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#059669', fontWeight: '700', fontSize: '1rem', marginBottom: '0.75rem' }}>
          <CheckCircle size={20} color="#10B981" />
          <span>Wonderful Tracing! +5 Stars ⭐</span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
        <button
          onClick={resetCanvas}
          className="btn btn-secondary btn-pill"
          style={{ gap: '0.35rem', padding: '0.4rem 1rem' }}
        >
          <RotateCcw size={15} />
          <span>Clear Canvas</span>
        </button>

        <button
          onClick={() => {
            playPop();
            const currentIdx = letterList.indexOf(selectedLetter);
            const nextIdx = (currentIdx + 1) % letterList.length;
            setSelectedLetter(letterList[nextIdx]);
          }}
          className="btn btn-primary btn-pill"
          style={{ gap: '0.35rem', padding: '0.4rem 1.25rem' }}
        >
          <span>Next Letter</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
