import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle, Eye, EyeOff, RotateCcw, PenTool, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

// ── English Tricky Words ──────────────────────────────────────────────────────
const TRICKY_WORDS_EN = [
  {
    id: 'sp_en_1',
    word: 'FRIEND',
    icon: '🤝',
    trapLetters: ['IE'],
    mnemonic: 'A FRIend is someone you stay with until the END!',
    explanation: "'I' comes before 'E' in FRIEND — remember the word END at the back!",
    phoneticTip: 'Starts with /fr/, has silent tricky /i/, ends with /end/.'
  },
  {
    id: 'sp_en_2',
    word: 'BECAUSE',
    icon: '💡',
    trapLetters: ['AU'],
    mnemonic: 'Big Elephants Can Always Understand Small Elephants!',
    explanation: "Remember the vowel team 'AU' in the middle of BECAUSE.",
    phoneticTip: 'BE + CAUSE = BECAUSE'
  },
  {
    id: 'sp_en_3',
    word: 'SAID',
    icon: '🗣️',
    trapLetters: ['AI'],
    mnemonic: 'Sally Ann Is Dancing!',
    explanation: "Even though it sounds like /sed/, it is spelled with 'AI' in the middle!",
    phoneticTip: "'AI' makes the short /e/ sound in SAID."
  },
  {
    id: 'sp_en_4',
    word: 'PEOPLE',
    icon: '👥',
    trapLetters: ['EO'],
    mnemonic: 'People Eat Omelettes, Please Listen Everyone!',
    explanation: "Look at the middle: 'EO' — the O follows the E!",
    phoneticTip: 'PEO + PLE = PEOPLE'
  },
  {
    id: 'sp_en_5',
    word: 'NIGHT',
    icon: '🌙',
    trapLetters: ['IGH'],
    mnemonic: 'The Ghost Hides in the Night (IGH)!',
    explanation: "'IGH' is a 3-letter team that makes the long /eye/ sound with silent G-H!",
    phoneticTip: 'N + IGH + T = NIGHT'
  },
  {
    id: 'sp_en_6',
    word: 'COULD',
    icon: '🤔',
    trapLetters: ['OUL'],
    mnemonic: 'Oh You Lucky Duck (O-U-L-D)!',
    explanation: "Silent 'L' with 'OU' — O-U-L-D makes /kood/!",
    phoneticTip: 'C + OULD = COULD'
  }
];

// ── Bengali Tricky Words ──────────────────────────────────────────────────────
const TRICKY_WORDS_BN = [
  {
    id: 'sp_bn_1',
    word: 'বই',
    icon: '📚',
    trapLetters: ['ব', 'ই'],
    mnemonic: 'ব দিয়ে বই, পড়ো তবেই শিখবে সই!',
    explanation: 'প্রথমে "ব", তারপর "ই": বই।',
    phoneticTip: 'ব + ই = বই'
  },
  {
    id: 'sp_bn_2',
    word: 'জল',
    icon: '💧',
    trapLetters: ['জ', 'ল'],
    mnemonic: 'জল পড়ে পাতা নড়ে!',
    explanation: 'প্রথমে "জ", তারপর "ল": জল।',
    phoneticTip: 'জ + ল = জল'
  },
  {
    id: 'sp_bn_3',
    word: 'ফুল',
    icon: '🌸',
    trapLetters: ['ফ', 'ল'],
    mnemonic: 'ফ এ ফুল, লাল গোলাপে সুন্দর দুল!',
    explanation: 'ফ এর সাথে হ্রস্ব-উ কার ও ল: ফুল।',
    phoneticTip: 'ফ + ু + ল = ফুল'
  },
  {
    id: 'sp_bn_4',
    word: 'কলম',
    icon: '✒️',
    trapLetters: ['ক', 'ল', 'ম'],
    mnemonic: 'কলম দিয়ে সুন্দর লেখা!',
    explanation: 'ক এর পর ল, শেষে ম: কলম।',
    phoneticTip: 'ক + ল + ম = কলম'
  },
  {
    id: 'sp_bn_5',
    word: 'আকাশ',
    icon: '☁️',
    trapLetters: ['আ', 'শ'],
    mnemonic: 'নীল আকাশ উড়ে যায় পাখি!',
    explanation: 'আ + ক-আ-কার + তালব্য-শ: আকাশ।',
    phoneticTip: 'আ + ক + া + শ = আকাশ'
  }
];

// ── Hindi Tricky Words ────────────────────────────────────────────────────────
const TRICKY_WORDS_HI = [
  {
    id: 'sp_hi_1',
    word: 'जल',
    icon: '💧',
    trapLetters: ['ज', 'ल'],
    mnemonic: 'जल ही जीवन की अनमोल धारा है!',
    explanation: 'पहले "ज", फिर "ल": जल।',
    phoneticTip: 'ज + ल = जल'
  },
  {
    id: 'sp_hi_2',
    word: 'घर',
    icon: '🏠',
    trapLetters: ['घ', 'र'],
    mnemonic: 'पूरी शिरोरेखा वाला घ और र = घर!',
    explanation: 'शिरोरेखा पूरी खींचे घ और र: घर।',
    phoneticTip: 'घ + र = घर'
  },
  {
    id: 'sp_hi_3',
    word: 'फल',
    icon: '🍎',
    trapLetters: ['फ', 'ल'],
    mnemonic: 'ताजे और मीठे रसीले फल!',
    explanation: 'पहले "फ", फिर "ल": फल।',
    phoneticTip: 'फ + ल = फल'
  },
  {
    id: 'sp_hi_4',
    word: 'कमल',
    icon: '🪷',
    trapLetters: ['क', 'म', 'ल'],
    mnemonic: 'हमारा राष्ट्रीय सुंदर फूल कमल!',
    explanation: 'क के बाद म, अंत में ल: कमल।',
    phoneticTip: 'क + म + ल = कमल'
  },
  {
    id: 'sp_hi_5',
    word: 'तारा',
    icon: '⭐',
    trapLetters: ['त', 'र'],
    mnemonic: 'आसमान में चमचमाता तारा!',
    explanation: 'त-आ-की-मात्रा और र-आ-की-मात्रा: तारा।',
    phoneticTip: 'त + ा + र + ा = तारा'
  }
];

const DYSGRAPHIA_WORDS_EN = [
  { word: 'cat', tip: "'c' and 'a' stay between midline & baseline. 't' reaches up to the skyline!" },
  { word: 'dog', tip: "'d' reaches high to the sky, 'o' stays in middle, 'g' dips underground to the worm line!" },
  { word: 'boy', tip: "'b' is a tall skyline letter, 'o' is middle, 'y' drops its tail to the worm line!" },
  { word: 'bed', tip: "'b' and 'd' are tall skyline letters! 'e' stays snug in the middle grass." }
];

const DYSGRAPHIA_WORDS_BN = [
  { word: 'বই', tip: 'ব এবং ই মাত্রা বরাবর সোজা লাইনে সুন্দরভাবে বসবে।' },
  { word: 'জল', tip: 'জ এবং ল সমান উচ্চতায় রেখার মাঝে থাকবে।' },
  { word: 'গাছ', tip: 'গ এর অর্ধমাত্রা এবং ছ এর গোল অংশ সমানভাবে আঁকো।' }
];

const DYSGRAPHIA_WORDS_HI = [
  { word: 'जल', tip: 'ज और ल दोनों शिरोरेखा के नीचे समान अनुपात में रहेंगे।' },
  { word: 'घर', tip: 'घ की शिरोरेखा पूरी खींचें और र को संतुलित रखें।' },
  { word: 'कमल', tip: 'क, म और ल तीनों अक्षर समान ऊंचाई पर शिरोरेखा से लटकेंगे।' }
];

export default function SpellingClinic({ onBack, adaptiveConfig }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars, activeLanguage } = useProfile();

  const langId = activeLanguage?.id || 'english';
  const isBengali = langId === 'bengali';
  const isHindi = langId === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

  const TRICKY_WORDS = isHindi ? TRICKY_WORDS_HI : (isBengali ? TRICKY_WORDS_BN : TRICKY_WORDS_EN);
  const DYSGRAPHIA_WORDS = isHindi ? DYSGRAPHIA_WORDS_HI : (isBengali ? DYSGRAPHIA_WORDS_BN : DYSGRAPHIA_WORDS_EN);

  const [activeTab, setActiveTab] = useState('look_cover'); // 'look_cover' | 'dysgraphia_lines'
  const [wordIdx, setWordIdx] = useState(0);
  const [mode, setMode] = useState('look'); // 'look' | 'cover' | 'checked'
  const [spelledLetters, setSpelledLetters] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const currentWord = TRICKY_WORDS[wordIdx] || TRICKY_WORDS[0];

  // Scrambled letter pool for current word
  const letterPool = React.useMemo(() => {
    const letters = currentWord.word.split('');
    const extraDistractors = isHindi
      ? ['क', 'म', 'न', 'र', 'स']
      : (isBengali ? ['ক', 'ম', 'ন', 'র', 'ল'] : ['A', 'E', 'I', 'O', 'U', 'R', 'S', 'T']);
    const distractors = extraDistractors.filter(c => !letters.includes(c)).slice(0, 2);
    return [...letters, ...distractors].sort(() => 0.5 - Math.random());
  }, [currentWord.id, langId]);

  useEffect(() => {
    setMode('look');
    setSpelledLetters([]);
    setFeedback(null);
    speakText(`${currentWord.word}. ${currentWord.mnemonic}`, speechLang);
  }, [wordIdx, langId]);

  const handleCover = () => {
    playPop();
    setMode('cover');
    setSpelledLetters([]);
    setFeedback(null);
    const coverMsg = isHindi
      ? `अब बिना देखे ${currentWord.word} की स्पेलिंग बनाएं!`
      : (isBengali ? `এবার স্মৃতি থেকে ${currentWord.word} বানানটি লেখো!` : `Now spell ${currentWord.word} from your memory!`);
    speakText(coverMsg, speechLang);
  };

  const handleTileClick = (letter) => {
    if (spelledLetters.length >= currentWord.word.length) return;
    playPop();
    speakText(letter, speechLang);
    setSpelledLetters((prev) => [...prev, letter]);
  };

  const handleBackspace = () => {
    playPop();
    setSpelledLetters((prev) => prev.slice(0, -1));
  };

  const handleCheck = () => {
    const spelled = spelledLetters.join('');
    const isMatch = spelled === currentWord.word;
    setMode('checked');

    if (isMatch) {
      playStarTwinkle();
      addStars(5);
      const successMsg = isHindi
        ? `🌟 बहुत बढ़िया! आपने "${currentWord.word}" बिल्कुल सही लिखा!`
        : (isBengali ? `🌟 দারুণ! তুমি "${currentWord.word}" একদম সঠিক লিখেছো!` : `🌟 Perfect! You spelled "${currentWord.word}" correctly!`);
      setFeedback({ type: 'success', message: successMsg });
      speakText(successMsg, speechLang);
      try {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      } catch (e) { }
    } else {
      playChime(300);
      const retryMsg = isHindi
        ? `लगभग! आपने "${spelled}" लिखा। ध्यान से देखें: "${currentWord.explanation}"`
        : (isBengali ? `খুব কাছাকাছি! তুমি লিখেছো "${spelled}"। মনে রাখো: "${currentWord.explanation}"` : `Almost! You wrote "${spelled}". Watch the tricky part: "${currentWord.trapLetters.join(', ')}".`);
      setFeedback({
        type: 'retry',
        message: retryMsg
      });
      speakText(retryMsg, speechLang);
    }
  };

  const handleNextWord = () => {
    playPop();
    if (wordIdx < TRICKY_WORDS.length - 1) {
      setWordIdx((prev) => prev + 1);
    } else {
      setWordIdx(0);
    }
  };

  // Canvas 4-Line Dysgraphia State
  const canvasRef = useRef(null);
  const [dysgraphiaIdx, setDysgraphiaIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentDysWord = DYSGRAPHIA_WORDS[dysgraphiaIdx] || DYSGRAPHIA_WORDS[0];

  const drawLinesAndGhost = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(0, 0, w, h);

    // 4 Clinical Dysgraphia Lines
    const lines = [
      { y: h * 0.18, color: '#38BDF8', dash: [4, 4], width: 1.5, label: isHindi ? '🌤️ शिरोरेखा (Top)' : (isBengali ? '🌤️ শীর্ষরেখা' : '🌤️ Skyline') },
      { y: h * 0.44, color: '#FB923C', dash: [6, 4], width: 1.5, label: isHindi ? '✈️ मध्यरेखा (Middle)' : (isBengali ? '✈️ মধ্যরেখা' : '✈️ Midline') },
      { y: h * 0.70, color: '#22C55E', dash: [], width: 2.5, label: isHindi ? '🌱 आधार रेखा (Base)' : (isBengali ? '🌱 মূলরেখা' : '🌱 Baseline') },
      { y: h * 0.92, color: '#EF4444', dash: [4, 4], width: 1.5, label: isHindi ? '🪱 निचली रेखा (Bottom)' : (isBengali ? '🪱 নিম্নরেখা' : '🪱 Bottom line') }
    ];

    lines.forEach(({ y, color, dash, width }) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(15, y);
      ctx.lineTo(w - 15, y);
      ctx.stroke();
      ctx.restore();
    });

    // Ghost letters for tracing alignment
    ctx.save();
    ctx.font = isHindi ? 'bold 64px Noto Sans Devanagari, sans-serif' : (isBengali ? 'bold 64px Noto Sans Bengali, sans-serif' : 'bold 72px Lexend, sans-serif');
    ctx.fillStyle = 'rgba(203, 213, 225, 0.45)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(currentDysWord.word, w / 2, h * 0.70);
    ctx.restore();
  }, [currentDysWord, isHindi, isBengali]);

  useEffect(() => {
    if (activeTab === 'dysgraphia_lines') {
      drawLinesAndGhost();
    }
  }, [activeTab, dysgraphiaIdx, drawLinesAndGhost, langId]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const drawMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playPop();
    drawLinesAndGhost();
  };

  return (
    <div className="game-viewport" style={{ maxWidth: '840px', margin: '0 auto', padding: '1rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          onClick={onBack}
          className="btn-secondary btn-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>{isHindi ? 'खेल हब' : (isBengali ? 'গেমস হাব' : 'Games Hub')}</span>
        </button>

        {/* Tab Toggle: Look-Cover-Write vs Dysgraphia Lines */}
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.25rem', borderRadius: '9999px', gap: '0.3rem' }}>
          <button
            onClick={() => {
              playPop();
              setActiveTab('look_cover');
            }}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'look_cover' ? 'white' : 'transparent',
              color: activeTab === 'look_cover' ? '#4F46E5' : '#64748B',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'look_cover' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            🧠 {isHindi ? 'देखें-ढकें-लिखें' : (isBengali ? 'দেখো-ঢাকো-লেখো' : 'Look-Cover-Write')}
          </button>
          <button
            onClick={() => {
              playPop();
              setActiveTab('dysgraphia_lines');
            }}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'dysgraphia_lines' ? 'white' : 'transparent',
              color: activeTab === 'dysgraphia_lines' ? '#4F46E5' : '#64748B',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'dysgraphia_lines' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            ✍️ {isHindi ? '4-रेखा सुलेख अभ्यास' : (isBengali ? '৪-রেখা হস্তলিপি' : '4-Line Alignment')}
          </button>
        </div>
      </div>

      {/* Mode 1: Look Cover Write */}
      {activeTab === 'look_cover' ? (
        <div
          className="glass-card"
          style={{
            padding: '2rem 1.5rem',
            borderRadius: '26px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            background: 'white'
          }}
        >
          {/* Top Word Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span className="badge badge-purple">
              {isHindi ? `शब्द ${wordIdx + 1} / ${TRICKY_WORDS.length}` : (isBengali ? `শব্দ ${wordIdx + 1} / ${TRICKY_WORDS.length}` : `Word ${wordIdx + 1} of ${TRICKY_WORDS.length}`)}
            </span>
            <button
              onClick={() => speakText(`${currentWord.word}. ${currentWord.mnemonic}`, speechLang)}
              className="btn-secondary btn-pill"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
            >
              <Volume2 size={16} />
              <span>{isHindi ? 'सुनें' : (isBengali ? 'শুনুন' : 'Hear Word')}</span>
            </button>
          </div>

          {/* LOOK Mode View */}
          {mode === 'look' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>{currentWord.icon}</span>

              {/* Target Word Display */}
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#1E293B',
                  background: '#F8FAFC',
                  padding: '0.75rem 2rem',
                  borderRadius: '20px',
                  border: '2px solid #E2E8F0',
                  fontFamily: isHindi ? 'var(--font-devanagari)' : (isBengali ? 'var(--font-bengali)' : 'Lexend, sans-serif')
                }}
              >
                {currentWord.word}
              </div>

              {/* Mnemonic Trick Card */}
              <div
                style={{
                  background: '#FEF3C7',
                  border: '1.5px solid #FDE68A',
                  borderRadius: '16px',
                  padding: '1rem',
                  maxWidth: '460px',
                  color: '#92400E'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, marginBottom: '0.3rem' }}>
                  <Lightbulb size={18} />
                  <span>{isHindi ? 'जादुई याददाश्त सूत्र:' : (isBengali ? 'মনে রাখার কৌশল:' : 'Memory Trick:')}</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>
                  "{currentWord.mnemonic}"
                </div>
              </div>

              <button
                onClick={handleCover}
                className="btn btn-primary"
                style={{ borderRadius: '9999px', padding: '0.85rem 2rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
              >
                <EyeOff size={18} />
                <span>{isHindi ? 'अब ढकें और लिखें!' : (isBengali ? 'এবার ঢাকো এবং লেখো!' : 'Cover & Spell!')}</span>
              </button>
            </div>
          )}

          {/* COVER & CHECKED Mode View */}
          {(mode === 'cover' || mode === 'checked') && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
              <span style={{ fontSize: '2.5rem' }}>{currentWord.icon}</span>

              {/* Spelling Slots */}
              <div style={{ display: 'flex', gap: '0.5rem', minHeight: '65px', alignItems: 'center' }}>
                {Array.from({ length: currentWord.word.length }).map((_, i) => {
                  const letter = spelledLetters[i];
                  return (
                    <div
                      key={i}
                      style={{
                        width: '52px',
                        height: '62px',
                        borderRadius: '14px',
                        border: letter ? '2px solid #4F46E5' : '2px dashed #94A3B8',
                        background: letter ? '#EEF2FF' : '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem',
                        fontWeight: 800,
                        color: '#312E81',
                        fontFamily: isHindi ? 'var(--font-devanagari)' : (isBengali ? 'var(--font-bengali)' : 'Lexend, sans-serif')
                      }}
                    >
                      {letter || ''}
                    </div>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '14px',
                    background: feedback.type === 'success' ? '#DCFCE7' : '#FEF2F2',
                    color: feedback.type === 'success' ? '#15803D' : '#B91C1C',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textAlign: 'center',
                    maxWidth: '460px'
                  }}
                >
                  {feedback.message}
                </div>
              )}

              {/* Scrambled Letter Bank */}
              {mode === 'cover' && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {letterPool.map((char, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTileClick(char)}
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        border: '2px solid #E2E8F0',
                        background: 'white',
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        color: '#1E293B',
                        cursor: 'pointer',
                        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.06)',
                        fontFamily: isHindi ? 'var(--font-devanagari)' : (isBengali ? 'var(--font-bengali)' : 'Lexend, sans-serif')
                      }}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                {mode === 'cover' && (
                  <>
                    <button
                      onClick={handleBackspace}
                      disabled={spelledLetters.length === 0}
                      className="btn btn-secondary"
                      style={{ borderRadius: '9999px', padding: '0.65rem 1.25rem' }}
                    >
                      {isHindi ? '⌫ मिटाएं' : (isBengali ? '⌫ মুছুন' : '⌫ Backspace')}
                    </button>
                    <button
                      onClick={handleCheck}
                      disabled={spelledLetters.length === 0}
                      className="btn btn-primary"
                      style={{ borderRadius: '9999px', padding: '0.65rem 1.5rem' }}
                    >
                      <CheckCircle size={18} />
                      <span>{isHindi ? 'जाँचें' : (isBengali ? 'যাচাই করুন' : 'Check')}</span>
                    </button>
                  </>
                )}

                {mode === 'checked' && (
                  <button
                    onClick={handleNextWord}
                    className="btn btn-primary"
                    style={{ borderRadius: '9999px', padding: '0.75rem 1.75rem' }}
                  >
                    <span>{isHindi ? 'अगला शब्द 🚀' : (isBengali ? 'পরবর্তী শব্দ 🚀' : 'Next Tricky Word 🚀')}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mode 2: Dysgraphia 4-Line Writing Canvas */
        <div
          className="glass-card"
          style={{
            padding: '1.5rem',
            borderRadius: '26px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            background: 'white'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span className="badge badge-emerald">
              {isHindi ? '4-रेखा सुलेख मार्गदर्शिका' : (isBengali ? '৪-রেখা রেখাঙ্কন পদ্ধতি' : 'Clinical Dysgraphia 4-Line Guide')}
            </span>
            <button
              onClick={clearCanvas}
              className="btn-secondary btn-pill"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
            >
              <RotateCcw size={14} />
              <span>{isHindi ? 'साफ़ करें' : (isBengali ? 'মুছে ফেলুন' : 'Clear')}</span>
            </button>
          </div>

          <div style={{ fontSize: '0.88rem', color: '#64748B', textAlign: 'center', maxWidth: '480px' }}>
            💡 {currentDysWord.tip}
          </div>

          <canvas
            ref={canvasRef}
            width={580}
            height={220}
            onMouseDown={startDraw}
            onMouseMove={drawMove}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={drawMove}
            onTouchEnd={endDraw}
            style={{
              width: '100%',
              maxWidth: '580px',
              height: '220px',
              borderRadius: '16px',
              border: '2px solid #E2E8F0',
              cursor: 'crosshair',
              touchAction: 'none',
              boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.04)'
            }}
          />

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {DYSGRAPHIA_WORDS.map((w, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playPop();
                  setDysgraphiaIdx(idx);
                }}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '12px',
                  border: dysgraphiaIdx === idx ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                  background: dysgraphiaIdx === idx ? '#EEF2FF' : '#F8FAFC',
                  color: dysgraphiaIdx === idx ? '#4338CA' : '#1E293B',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                {w.word}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
