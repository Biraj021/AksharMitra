import React, { useState, useRef, useEffect } from 'react';
import { Volume2, CheckCircle, ArrowRight, RotateCcw, Sparkles, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const MIRROR_QUESTIONS_EN = [
  {
    id: 'mq_1',
    type: 'pick_target',
    target: 'b',
    instruction: 'Tap all the letter "b"s! Watch out for tricky "d" and "p"!',
    audioPrompt: 'Tap all the letter b! Watch out for tricky d and p!',
    options: [
      { id: '1', char: 'b', isTarget: true },
      { id: '2', char: 'd', isTarget: false, errorType: 'horizontal_mirror' },
      { id: '3', char: 'b', isTarget: true },
      { id: '4', char: 'p', isTarget: false, errorType: 'vertical_inversion' },
      { id: '5', char: 'd', isTarget: false, errorType: 'horizontal_mirror' },
      { id: '6', char: 'b', isTarget: true }
    ],
    targetCount: 3
  },
  {
    id: 'mq_2',
    type: 'pick_target',
    target: 'p',
    instruction: 'Find the letter "p"! Look where the stick hangs down.',
    audioPrompt: 'Find the letter p! Look where the stick hangs down.',
    options: [
      { id: '1', char: 'q', isTarget: false, errorType: 'horizontal_mirror' },
      { id: '2', char: 'p', isTarget: true },
      { id: '3', char: 'd', isTarget: false, errorType: 'rotational_flip' },
      { id: '4', char: 'p', isTarget: true },
      { id: '5', char: 'b', isTarget: false, errorType: 'vertical_inversion' },
      { id: '6', char: 'p', isTarget: true }
    ],
    targetCount: 3
  },
  {
    id: 'mq_3',
    type: 'word_orientation',
    instruction: 'Look at the picture: 🐈. Which word says "was"?',
    audioPrompt: 'Look at the word. Which word says was?',
    targetWord: 'was',
    options: [
      { id: 'w1', word: 'saw', isTarget: false, errorType: 'letter_order_reversal' },
      { id: 'w2', word: 'was', isTarget: true }
    ]
  },
  {
    id: 'mq_4',
    type: 'direction_trace',
    targetLetter: 'b',
    ruleText: 'Tall line DOWN first ⬇️, then belly on the RIGHT ➡️',
    instruction: 'Trace "b": Draw straight DOWN, then loop the belly on the RIGHT!',
    audioPrompt: 'Trace letter b! Start at dot 1, draw straight down, then loop the belly on the right!',
    ghostChar: 'b',
    dots: [
      { id: 1, x: 80, y: 40, label: '1 ⬇️' },
      { id: 2, x: 80, y: 120, label: '2' },
      { id: 3, x: 80, y: 200, label: '3 ↷' },
      { id: 4, x: 135, y: 125, label: '4' },
      { id: 5, x: 180, y: 162, label: '5' },
      { id: 6, x: 135, y: 200, label: '6 ↶' },
      { id: 7, x: 80, y: 200, label: '7' }
    ]
  },
  {
    id: 'mq_5',
    type: 'direction_trace',
    targetLetter: 'd',
    ruleText: 'Round belly on the LEFT ⬅️, then tall line DOWN ⬇️',
    instruction: 'Trace "d": Make the round belly on the LEFT first, then line down!',
    audioPrompt: 'Trace letter d! Round belly on the left first, then tall line down!',
    ghostChar: 'd',
    dots: [
      { id: 1, x: 140, y: 125, label: '1 ↶' },
      { id: 2, x: 85, y: 162, label: '2' },
      { id: 3, x: 140, y: 200, label: '3 ↷' },
      { id: 4, x: 165, y: 40, label: '4 ⬇️' },
      { id: 5, x: 165, y: 120, label: '5' },
      { id: 6, x: 165, y: 200, label: '6' }
    ]
  }
];

const MIRROR_QUESTIONS_BN = [
  {
    id: 'mq_bn_1',
    type: 'pick_target',
    target: 'ব',
    instruction: 'সবগুলো "ব" বর্ণে ট্যাপ করো! "র" এবং "ক" থেকে সাবধান!',
    audioPrompt: 'সবগুলো ব বর্ণে স্পর্শ করো! র এবং ক থেকে সাবধান!',
    options: [
      { id: '1', char: 'ব', isTarget: true },
      { id: '2', char: 'র', isTarget: false, errorType: 'horizontal_mirror' },
      { id: '3', char: 'ব', isTarget: true },
      { id: '4', char: 'ক', isTarget: false, errorType: 'vertical_inversion' },
      { id: '5', char: 'র', isTarget: false, errorType: 'horizontal_mirror' },
      { id: '6', char: 'ব', isTarget: true }
    ],
    targetCount: 3
  },
  {
    id: 'mq_bn_2',
    type: 'pick_target',
    target: 'ক',
    instruction: 'সঠিক "ক" বর্ণটি খুঁজে বের করো!',
    audioPrompt: 'সঠিক ক বর্ণটি খুঁজে বের করো!',
    options: [
      { id: '1', char: 'ধ', isTarget: false, errorType: 'horizontal_mirror' },
      { id: '2', char: 'ক', isTarget: true },
      { id: '3', char: 'ব', isTarget: false, errorType: 'rotational_flip' },
      { id: '4', char: 'ক', isTarget: true },
      { id: '5', char: 'ফ', isTarget: false, errorType: 'vertical_inversion' },
      { id: '6', char: 'ক', isTarget: true }
    ],
    targetCount: 3
  },
  {
    id: 'mq_bn_3',
    type: 'word_orientation',
    instruction: 'ছবিটি দেখো: 💧। কোন শব্দটি "জল"?',
    audioPrompt: 'ছবিটি দেখো। কোন শব্দটি জল?',
    targetWord: 'জল',
    options: [
      { id: 'w1', word: 'লজ', isTarget: false, errorType: 'letter_order_reversal' },
      { id: 'w2', word: 'জল', isTarget: true }
    ]
  },
  {
    id: 'mq_bn_4',
    type: 'direction_trace',
    targetLetter: 'ব',
    ruleText: 'উপর থেকে সোজা নিচে নামাও, তারপর ডানপাশে বাঁকাও ➡️',
    instruction: '"ব" বর্ণটি আঙুল দিয়ে নিখুঁতভাবে আঁকো!',
    audioPrompt: 'ব বর্ণটি নিখুঁতভাবে আঁকো! ১ নম্বর বিন্দু থেকে শুরু করো!',
    ghostChar: 'ব',
    dots: [
      { id: 1, x: 80, y: 40, label: '1 ⬇️' },
      { id: 2, x: 80, y: 120, label: '2' },
      { id: 3, x: 80, y: 200, label: '3 ↷' },
      { id: 4, x: 135, y: 125, label: '4' },
      { id: 5, x: 180, y: 162, label: '5' },
      { id: 6, x: 135, y: 200, label: '6 ↶' },
      { id: 7, x: 80, y: 200, label: '7' }
    ]
  },
  {
    id: 'mq_bn_5',
    type: 'direction_trace',
    targetLetter: 'র',
    ruleText: '"ব" এঁকে নিচে একটি সুন্দর গোল বিন্দু দাও ⬇️',
    instruction: '"র" বর্ণটি আঙুল দিয়ে নিখুঁতভাবে আঁকো!',
    audioPrompt: 'র বর্ণটি নিখুঁতভাবে আঁকো!',
    ghostChar: 'র',
    dots: [
      { id: 1, x: 140, y: 125, label: '1 ↶' },
      { id: 2, x: 85, y: 162, label: '2' },
      { id: 3, x: 140, y: 200, label: '3 ↷' },
      { id: 4, x: 165, y: 40, label: '4 ⬇️' },
      { id: 5, x: 165, y: 120, label: '5' },
      { id: 6, x: 165, y: 200, label: '6' }
    ]
  }
];

const MIRROR_QUESTIONS_HI = [
  {
    id: 'mq_hi_1',
    type: 'pick_target',
    target: 'ब',
    instruction: 'सभी "ब" अक्षरों पर टैप करें! "भ" और "क" से सावधान रहें!',
    audioPrompt: 'सभी ब अक्षरों को स्पर्श करें! भ और क से सावधान रहें!',
    options: [
      { id: '1', char: 'ब', isTarget: true },
      { id: '2', char: 'भ', isTarget: false, errorType: 'horizontal_mirror' },
      { id: '3', char: 'ब', isTarget: true },
      { id: '4', char: 'क', isTarget: false, errorType: 'vertical_inversion' },
      { id: '5', char: 'भ', isTarget: false, errorType: 'horizontal_mirror' },
      { id: '6', char: 'ब', isTarget: true }
    ],
    targetCount: 3
  },
  {
    id: 'mq_hi_2',
    type: 'pick_target',
    target: 'द',
    instruction: 'सही "द" अक्षर पहचानें! ध्यान से देखें।',
    audioPrompt: 'सही द अक्षर पहचानें! ध्यान से देखें।',
    options: [
      { id: '1', char: 'ध', isTarget: false, errorType: 'horizontal_mirror' },
      { id: '2', char: 'द', isTarget: true },
      { id: '3', char: 'घ', isTarget: false, errorType: 'rotational_flip' },
      { id: '4', char: 'द', isTarget: true },
      { id: '5', char: 'छ', isTarget: false, errorType: 'vertical_inversion' },
      { id: '6', char: 'द', isTarget: true }
    ],
    targetCount: 3
  },
  {
    id: 'mq_hi_3',
    type: 'word_orientation',
    instruction: 'चित्र देखें: 💧। कौन सा शब्द "जल" है?',
    audioPrompt: 'चित्र देखें। कौन सा शब्द जल है?',
    targetWord: 'जल',
    options: [
      { id: 'w1', word: 'लज', isTarget: false, errorType: 'letter_order_reversal' },
      { id: 'w2', word: 'जल', isTarget: true }
    ]
  },
  {
    id: 'mq_hi_4',
    type: 'direction_trace',
    targetLetter: 'ब',
    ruleText: 'शिरोरेखा खींचे, खड़ी रेखा बनाएं, फिर पेट में तिरछी लकीर काटें ➡️',
    instruction: '"ब" अक्षर को उंगली से सही दिशा में बनाएं!',
    audioPrompt: 'ब अक्षर को बनाएं! बिंदु 1 से शुरू करें!',
    ghostChar: 'ब',
    dots: [
      { id: 1, x: 80, y: 40, label: '1 ⬇️' },
      { id: 2, x: 80, y: 120, label: '2' },
      { id: 3, x: 80, y: 200, label: '3 ↷' },
      { id: 4, x: 135, y: 125, label: '4' },
      { id: 5, x: 180, y: 162, label: '5' },
      { id: 6, x: 135, y: 200, label: '6 ↶' },
      { id: 7, x: 80, y: 200, label: '7' }
    ]
  },
  {
    id: 'mq_hi_5',
    type: 'direction_trace',
    targetLetter: 'द',
    ruleText: 'शिरोरेखा से नीचे छोटी रेखा, फिर घुमाव और नीचे पूंछ ⬇️',
    instruction: '"द" अक्षर को उंगली से सही दिशा में बनाएं!',
    audioPrompt: 'द अक्षर को उंगली से बनाएं!',
    ghostChar: 'द',
    dots: [
      { id: 1, x: 140, y: 125, label: '1 ↶' },
      { id: 2, x: 85, y: 162, label: '2' },
      { id: 3, x: 140, y: 200, label: '3 ↷' },
      { id: 4, x: 165, y: 40, label: '4 ⬇️' },
      { id: 5, x: 165, y: 120, label: '5' },
      { id: 6, x: 165, y: 200, label: '6' }
    ]
  }
];

export default function MirrorLetterQuest({ onCompleteQuest }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { activeLanguage } = useProfile();
  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');
  const questions = isHindi ? MIRROR_QUESTIONS_HI : (isBengali ? MIRROR_QUESTIONS_BN : MIRROR_QUESTIONS_EN);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [mistakesCount, setMistakesCount] = useState(0);
  const [tracingCollected, setTracingCollected] = useState(new Set());
  const [isTracingDrawing, setIsTracingDrawing] = useState(false);
  const [isDemonstrating, setIsDemonstrating] = useState(false);
  const [status, setStatus] = useState('active'); // 'active' | 'completed_step'

  const canvasRef = useRef(null);
  const cumulativeTracingHitsRef = useRef(0);
  const currentQ = questions[currentIdx] || questions[0];

  // Auto-speak instructions on question change
  useEffect(() => {
    if (currentQ?.audioPrompt) {
      speakText(currentQ.audioPrompt, speechLang);
    }
    clearCanvas();
  }, [currentIdx, activeLanguage?.id]);

  const handlePickOption = (option) => {
    playPop();
    if (selectedIds.has(option.id)) return;

    if (option.isTarget) {
      playChime(650);
      const nextSet = new Set(selectedIds);
      nextSet.add(option.id);
      setSelectedIds(nextSet);

      const neededCount = currentQ.targetCount || 1;
      if (nextSet.size >= neededCount) {
        setStatus('completed_step');
        playStarTwinkle();
      }
    } else {
      playChime(320);
      setMistakesCount((prev) => prev + 1);
      const errVoice = isHindi
        ? `यह ${option.char || option.word} है। ध्यान से ${currentQ.target || currentQ.targetWord} खोजें!`
        : isBengali
        ? `এটি হলো ${option.char || option.word}। সাবধানে ${currentQ.target || currentQ.targetWord} খুঁজে নাও!`
        : `That is ${option.char || option.word}. Look closely for ${currentQ.target || currentQ.targetWord}!`;
      speakText(errVoice, speechLang);
    }
  };

  // Helper for responsive coordinate scaling
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

  // Check collision with waypoints
  const checkDotHit = (coords) => {
    if (!currentQ.dots) return;

    currentQ.dots.forEach((dot) => {
      const dist = Math.hypot(coords.x - dot.x, coords.y - dot.y);
      if (dist < 36 && !tracingCollected.has(dot.id)) {
        setTracingCollected((prev) => {
          const next = new Set(prev);
          next.add(dot.id);

          playPop();

          if (next.size >= Math.ceil(currentQ.dots.length * 0.75)) {
            setStatus('completed_step');
            playStarTwinkle();
            try {
              confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
            } catch (err) {}
          }
          return next;
        });
      }
    });
  };

  // Tracing handlers for Questions 4 & 5
  const startTracing = (e) => {
    e.preventDefault();
    if (isDemonstrating) return;

    const coords = getCanvasCoords(e);
    setIsTracingDrawing(true);
    checkDotHit(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#4F46E5';
    ctx.shadowColor = 'rgba(79, 70, 229, 0.4)';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineTo(coords.x + 0.1, coords.y + 0.1);
    ctx.stroke();
  };

  const drawTracing = (e) => {
    if (!isTracingDrawing || isDemonstrating) return;
    e.preventDefault();

    const coords = getCanvasCoords(e);
    checkDotHit(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#4F46E5';
    ctx.shadowColor = 'rgba(79, 70, 229, 0.4)';
    ctx.shadowBlur = 6;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopTracing = () => {
    setIsTracingDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setTracingCollected(new Set());
    if (currentQ?.type === 'direction_trace') {
      setStatus('active');
    }
  };

  // Animated Mitra Demonstration
  const handleDemonstration = () => {
    if (isDemonstrating || !currentQ.dots) return;
    clearCanvas();
    setIsDemonstrating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#10B981';
    ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
    ctx.shadowBlur = 8;

    let dotIndex = 0;
    const dots = currentQ.dots;

    ctx.beginPath();
    ctx.moveTo(dots[0].x, dots[0].y);

    const interval = setInterval(() => {
      dotIndex++;
      if (dotIndex < dots.length) {
        ctx.lineTo(dots[dotIndex].x, dots[dotIndex].y);
        ctx.stroke();
        playPop();
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsDemonstrating(false);
          clearCanvas();
          speakText(
            isHindi ? "अब आपकी बारी! उसी रेखा पर उंगली चलाएं।" : (isBengali ? "এবার তোমার পালা! একই পথ ধরে আঁকো।" : "Now your turn! Follow the same path."),
            speechLang
          );
        }, 1200);
      }
    }, 280);
  };

  const handleNextStep = () => {
    if (currentQ.type === 'direction_trace') {
      cumulativeTracingHitsRef.current += tracingCollected.size;
    }

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedIds(new Set());
      setTracingCollected(new Set());
      setStatus('active');
    } else {
      // Finalize Round 1 Metrics
      const totalPossible = 10;
      const errorScore = Math.min(100, Math.round((mistakesCount / totalPossible) * 100));
      const accuracy = Math.max(25, 100 - errorScore);

      const totalTracingDots = questions
        .filter((q) => q.type === 'direction_trace')
        .reduce((acc, q) => acc + (q.dots?.length || 0), 0);
      const adherence = Math.min(100, Math.round((cumulativeTracingHitsRef.current / Math.max(1, totalTracingDots)) * 100));

      onCompleteQuest({
        questId: 'mirror_letters',
        metrics: {
          totalQuestions: questions.length,
          reversalErrors: mistakesCount,
          visualReversalScore: errorScore,
          accuracy: accuracy,
          tracingAdherence: adherence
        }
      });
    }
  };

  const isTracing = currentQ.type === 'direction_trace';
  const progressRatio = isTracing && currentQ.dots ? Math.min(100, Math.round((tracingCollected.size / currentQ.dots.length) * 100)) : 0;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        borderRadius: '24px',
        background: 'white',
        border: '1.5px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.15rem',
        textAlign: 'center'
      }}
    >
      {/* Question Header & Audio Prompt */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
          {isHindi ? `राउंड 1: अक्षर और दृष्टि दिशा (${currentIdx + 1}/${questions.length})` : (isBengali ? `পর্ব ১: বর্ণ ও দৃষ্টিগত দিক (${currentIdx + 1}/${questions.length})` : `Round 1: Visual Orientation (${currentIdx + 1}/${questions.length})`)}
        </span>
        <button
          onClick={() => speakText(currentQ.audioPrompt, speechLang)}
          style={{
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title="Hear instruction"
        >
          <Volume2 size={16} color="#4F46E5" />
        </button>
      </div>

      <div>
        <h3 style={{ fontSize: '1.15rem', color: '#1E293B', margin: '0 0 0.25rem', fontWeight: 800 }}>
          {currentQ.instruction}
        </h3>
        {currentQ.ruleText && (
          <p style={{ fontSize: '0.82rem', color: '#4338CA', background: '#EEF2FF', padding: '0.3rem 0.8rem', borderRadius: '8px', display: 'inline-block', margin: '0.25rem 0 0', fontWeight: 700 }}>
            💡 {currentQ.ruleText}
          </p>
        )}
      </div>

      {/* Mode 1 & 2: Letter Grid Selection */}
      {currentQ.type === 'pick_target' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', maxWidth: '340px', margin: '0 auto', width: '100%' }}>
          {currentQ.options.map((opt) => {
            const isPicked = selectedIds.has(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => handlePickOption(opt)}
                style={{
                  height: '74px',
                  borderRadius: '18px',
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  fontFamily: "'Lexend', sans-serif",
                  border: isPicked ? '3px solid #10B981' : '2px solid #E2E8F0',
                  background: isPicked ? '#D1FAE5' : '#F8FAFC',
                  color: isPicked ? '#047857' : '#1E293B',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isPicked ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
                }}
              >
                {opt.char}
              </button>
            );
          })}
        </div>
      )}

      {/* Mode 3: Word Orientation Choice (was vs saw) */}
      {currentQ.type === 'word_orientation' && (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%' }}>
          {currentQ.options.map((opt) => {
            const isPicked = selectedIds.has(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => handlePickOption(opt)}
                style={{
                  flex: 1,
                  maxWidth: '160px',
                  padding: '1.25rem 1rem',
                  borderRadius: '18px',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  fontFamily: "'Lexend', sans-serif",
                  border: isPicked ? '3px solid #10B981' : '2px solid #E2E8F0',
                  background: isPicked ? '#D1FAE5' : '#F8FAFC',
                  color: isPicked ? '#047857' : '#1E293B',
                  cursor: 'pointer',
                  boxShadow: isPicked ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
                }}
              >
                {opt.word}
              </button>
            );
          })}
        </div>
      )}

      {/* Mode 4 & 5: High-Precision Guided Direction Tracing */}
      {isTracing && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          {/* Tracing Controls Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '260px', justifyContent: 'space-between' }}>
            <button
              onClick={handleDemonstration}
              disabled={isDemonstrating}
              style={{
                background: '#EEF2FF',
                color: '#4F46E5',
                border: '1px solid #C7D2FE',
                borderRadius: '12px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: isDemonstrating ? 'not-allowed' : 'pointer'
              }}
            >
              <Sparkles size={14} />
              <span>{isDemonstrating ? 'Showing...' : 'Show Me'}</span>
            </button>

            <button
              onClick={clearCanvas}
              disabled={isDemonstrating}
              style={{
                background: '#F8FAFC',
                color: '#64748B',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              <span>Clear</span>
            </button>
          </div>

          {/* Canvas Wrapper with Ghost Letter & Waypoints */}
          <div
            style={{
              position: 'relative',
              width: '260px',
              height: '250px',
              background: '#F8FAFC',
              borderRadius: '24px',
              border: '2.5px dashed #CBD5E1',
              touchAction: 'none',
              overflow: 'hidden',
              userSelect: 'none',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            {/* Ghost Letter Template Underneath */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '180px',
                fontWeight: 900,
                color: 'rgba(203, 213, 225, 0.45)',
                fontFamily: "'Lexend', sans-serif",
                lineHeight: 1,
                pointerEvents: 'none',
                zIndex: 0
              }}
            >
              {currentQ.ghostChar}
            </div>

            {/* Guide Waypoints Over Ghost Letter */}
            {currentQ.dots?.map((dot) => {
              const isHit = tracingCollected.has(dot.id);
              return (
                <div
                  key={dot.id}
                  style={{
                    position: 'absolute',
                    left: `${dot.x}px`,
                    top: `${dot.y}px`,
                    transform: 'translate(-50%, -50%)',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: isHit ? '#10B981' : '#F59E0B',
                    border: '2px solid white',
                    boxShadow: isHit ? '0 0 10px rgba(16, 185, 129, 0.6)' : '0 2px 6px rgba(0,0,0,0.15)',
                    fontSize: '0.7rem',
                    color: 'white',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    pointerEvents: 'none',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    scale: isHit ? '1.15' : '1'
                  }}
                >
                  {isHit ? '✓' : dot.label || dot.id}
                </div>
              );
            })}

            {/* Live Interactive Tracing Canvas */}
            <canvas
              ref={canvasRef}
              width={260}
              height={250}
              onMouseDown={startTracing}
              onMouseMove={drawTracing}
              onMouseUp={stopTracing}
              onMouseLeave={stopTracing}
              onTouchStart={startTracing}
              onTouchMove={drawTracing}
              onTouchEnd={stopTracing}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
                cursor: 'crosshair'
              }}
            />
          </div>

          {/* Adherence Progress Bar */}
          <div style={{ width: '100%', maxWidth: '260px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '8px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressRatio}%`,
                  background: status === 'completed_step' ? '#10B981' : '#4F46E5',
                  transition: 'width 0.2s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B' }}>
              {tracingCollected.size}/{currentQ.dots?.length} dots
            </span>
          </div>
        </div>
      )}

      {/* Next Step / Complete Banner */}
      {status === 'completed_step' && (
        <div style={{ marginTop: '0.25rem' }}>
          <button
            onClick={handleNextStep}
            className="animate-pulse-glow"
            style={{
              width: '100%',
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.8rem',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
            }}
          >
            <span>{isBengali ? 'পরবর্তী ধাপে যাও' : 'Continue'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
