import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle, Eye, EyeOff, RotateCcw, PenTool, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const TRICKY_WORDS = [
  {
    id: 'sp_1',
    word: 'FRIEND',
    icon: '🤝',
    trapLetters: ['IE'],
    mnemonic: 'A FRIend is someone you stay with until the END!',
    explanation: "'I' comes before 'E' in FRIEND — remember the word END at the back!",
    phoneticTip: 'Starts with /fr/, has silent tricky /i/, ends with /end/.'
  },
  {
    id: 'sp_2',
    word: 'BECAUSE',
    icon: '💡',
    trapLetters: ['AU'],
    mnemonic: 'Big Elephants Can Always Understand Small Elephants!',
    explanation: "Remember the vowel team 'AU' in the middle of BECAUSE.",
    phoneticTip: 'BE + CAUSE = BECAUSE'
  },
  {
    id: 'sp_3',
    word: 'SAID',
    icon: '🗣️',
    trapLetters: ['AI'],
    mnemonic: 'Sally Ann Is Dancing!',
    explanation: "Even though it sounds like /sed/, it is spelled with 'AI' in the middle!",
    phoneticTip: "'AI' makes the short /e/ sound in SAID."
  },
  {
    id: 'sp_4',
    word: 'PEOPLE',
    icon: '👥',
    trapLetters: ['EO'],
    mnemonic: 'People Eat Omelettes, Please Listen Everyone!',
    explanation: "Look at the middle: 'EO' — the O follows the E!",
    phoneticTip: 'PEO + PLE = PEOPLE'
  },
  {
    id: 'sp_5',
    word: 'NIGHT',
    icon: '🌙',
    trapLetters: ['IGH'],
    mnemonic: 'The Ghost Hides in the Night (IGH)!',
    explanation: "'IGH' is a 3-letter team that makes the long /eye/ sound with silent G-H!",
    phoneticTip: 'N + IGH + T = NIGHT'
  },
  {
    id: 'sp_6',
    word: 'COULD',
    icon: '🤔',
    trapLetters: ['OUL'],
    mnemonic: 'Oh You Lucky Duck (O-U-L-D)!',
    explanation: "Silent 'L' with 'OU' — O-U-L-D makes /kood/!",
    phoneticTip: 'C + OULD = COULD'
  }
];

const DYSGRAPHIA_WORDS = [
  { word: 'cat', tip: "'c' and 'a' stay between midline & baseline. 't' reaches up to the skyline!" },
  { word: 'dog', tip: "'d' reaches high to the sky, 'o' stays in middle, 'g' dips underground to the worm line!" },
  { word: 'boy', tip: "'b' is a tall skyline letter, 'o' is middle, 'y' drops its tail to the worm line!" },
  { word: 'bed', tip: "'b' and 'd' are tall skyline letters! 'e' stays snug in the middle grass." }
];

export default function SpellingClinic({ onBack, adaptiveConfig }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars } = useProfile();

  const [activeTab, setActiveTab] = useState('look_cover'); // 'look_cover' | 'dysgraphia_lines'
  const [wordIdx, setWordIdx] = useState(0);
  const [mode, setMode] = useState('look'); // 'look' | 'cover' | 'checked'
  const [spelledLetters, setSpelledLetters] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const currentWord = TRICKY_WORDS[wordIdx];

  // Scrambled letter pool for current word
  const letterPool = React.useMemo(() => {
    const letters = currentWord.word.split('');
    const distractors = ['A', 'E', 'I', 'O', 'U', 'R', 'S', 'T'].filter(c => !letters.includes(c)).slice(0, 2);
    return [...letters, ...distractors].sort(() => 0.5 - Math.random());
  }, [currentWord.id]);

  useEffect(() => {
    setMode('look');
    setSpelledLetters([]);
    setFeedback(null);
    speakText(`${currentWord.word}. Mnemonic trick: ${currentWord.mnemonic}`, 'en-US');
  }, [wordIdx]);

  const handleCover = () => {
    playPop();
    setMode('cover');
    setSpelledLetters([]);
    setFeedback(null);
    speakText(`Now spell ${currentWord.word} from your memory!`, 'en-US');
  };

  const handleTileClick = (letter) => {
    if (spelledLetters.length >= currentWord.word.length) return;
    playPop();
    speakText(letter, 'en-US');
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
      setFeedback({ type: 'success', message: `🌟 Perfect! You spelled "${currentWord.word}" correctly!` });
      speakText(`Outstanding! You spelled ${currentWord.word} perfectly!`, 'en-US');
      try {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      playChime(300);
      setFeedback({
        type: 'retry',
        message: `Almost! You wrote "${spelled}". Watch the tricky part: "${currentWord.trapLetters.join(', ')}".`
      });
      speakText(`Nice try! Look at ${currentWord.word} again: ${currentWord.explanation}`, 'en-US');
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
  const currentDysWord = DYSGRAPHIA_WORDS[dysgraphiaIdx];

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
      { y: h * 0.18, color: '#38BDF8', dash: [4, 4], width: 1.5, label: '🌤️ Skyline (Ascenders: b, d, t, l, h)' },
      { y: h * 0.44, color: '#FB923C', dash: [6, 4], width: 1.5, label: '✈️ Midline (Middle: a, c, e, o, s)' },
      { y: h * 0.70, color: '#22C55E', dash: [], width: 2.5, label: '🌱 Baseline (Ground Line)' },
      { y: h * 0.92, color: '#EF4444', dash: [4, 4], width: 1.5, label: '🪱 Wormline (Descenders: g, j, p, q, y)' }
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

    // Ghost letters
    ctx.save();
    ctx.font = "bold 92px 'Lexend', sans-serif";
    ctx.fillStyle = 'rgba(79, 70, 229, 0.12)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(currentDysWord.word, w / 2, h * 0.70);
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeText(currentDysWord.word, w / 2, h * 0.70);
    ctx.restore();
  }, [currentDysWord]);

  useEffect(() => {
    if (activeTab === 'dysgraphia_lines') {
      drawLinesAndGhost();
    }
  }, [activeTab, dysgraphiaIdx, drawLinesAndGhost]);

  // Touch & Mouse Drawing on Canvas
  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const doDraw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#4F46E5';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
  };

  return (
    <div className="game-viewport">
      {/* Top Bar */}
      <div className="game-top-bar">
        <button
          onClick={() => {
            playPop();
            onBack();
          }}
          className="btn-secondary btn-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Games Hub</span>
        </button>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => {
              playPop();
              setActiveTab('look_cover');
            }}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              border: activeTab === 'look_cover' ? '2px solid #7C3AED' : '1px solid #E2E8F0',
              background: activeTab === 'look_cover' ? '#F5F3FF' : 'white',
              color: activeTab === 'look_cover' ? '#6D28D9' : '#64748B',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🧠 Look-Cover-Write
          </button>

          <button
            onClick={() => {
              playPop();
              setActiveTab('dysgraphia_lines');
            }}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '9999px',
              border: activeTab === 'dysgraphia_lines' ? '2px solid #059669' : '1px solid #E2E8F0',
              background: activeTab === 'dysgraphia_lines' ? '#ECFDF5' : 'white',
              color: activeTab === 'dysgraphia_lines' ? '#065F46' : '#64748B',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📏 4-Line Handwriting
          </button>
        </div>
      </div>

      {/* Mode 1: Look-Cover-Write Clinic */}
      {activeTab === 'look_cover' && (
        <div
          className="glass-card"
          style={{
            padding: '2rem 1.5rem',
            borderRadius: '28px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
            maxWidth: '620px',
            margin: '0 auto',
            width: '100%',
            background: 'white'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '0.85rem', color: '#6D28D9', fontWeight: '800' }}>
              Word {wordIdx + 1} of {TRICKY_WORDS.length} • Look-Cover-Write
            </span>
            <button
              onClick={() => speakText(`${currentWord.word}! ${currentWord.explanation}`, 'en-US')}
              style={{
                background: '#F5F3FF',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#7C3AED'
              }}
              title="Hear word & tip"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* Word Display Card */}
          <div
            style={{
              width: '100%',
              padding: '1.75rem 1rem',
              borderRadius: '24px',
              background: mode === 'cover' ? '#1E1B4B' : 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
              border: '2px solid #DDD6FE',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            {mode === 'look' && (
              <div>
                <div style={{ fontSize: '2.8rem', marginBottom: '0.35rem' }}>{currentWord.icon}</div>
                <h2
                  style={{
                    fontSize: '3rem',
                    color: '#4C1D95',
                    margin: '0 0 0.5rem',
                    fontFamily: "'Lexend', sans-serif",
                    letterSpacing: '0.08em'
                  }}
                >
                  {currentWord.word}
                </h2>
                <div
                  style={{
                    background: '#FAF5FF',
                    border: '1.5px solid #DDD6FE',
                    borderRadius: '16px',
                    padding: '0.75rem 1rem',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#7C3AED', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    <Lightbulb size={16} />
                    <span>Memory Hook / Rhyme:</span>
                  </div>
                  <p style={{ color: '#4C1D95', fontWeight: '600', margin: '0.25rem 0', fontSize: '0.95rem' }}>
                    "{currentWord.mnemonic}"
                  </p>
                  <span style={{ fontSize: '0.8rem', color: '#6D28D9' }}>💡 {currentWord.explanation}</span>
                </div>
              </div>
            )}

            {mode === 'cover' && (
              <div style={{ padding: '2rem 1rem', color: '#C7D2FE' }}>
                <EyeOff size={48} style={{ margin: '0 auto 0.75rem', opacity: 0.8 }} />
                <h3 style={{ color: 'white', margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Word is Covered!</h3>
                <p style={{ color: '#A5B4FC', margin: 0, fontSize: '0.9rem' }}>
                  Tap the letter tiles below in the right order from memory!
                </p>
              </div>
            )}

            {mode === 'checked' && (
              <div>
                <div style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>{currentWord.icon}</div>
                <h2 style={{ fontSize: '2.6rem', color: '#4C1D95', margin: '0 0 0.5rem', fontFamily: "'Lexend', sans-serif" }}>
                  {currentWord.word}
                </h2>
                {feedback && (
                  <div
                    style={{
                      background: feedback.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                      color: feedback.type === 'success' ? '#065F46' : '#991B1B',
                      border: feedback.type === 'success' ? '2px solid #10B981' : '2px solid #EF4444',
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      fontWeight: '700',
                      fontSize: '0.95rem'
                    }}
                  >
                    {feedback.message}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Child Spell Input Slots */}
          {mode !== 'look' && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Array.from({ length: currentWord.word.length }).map((_, idx) => {
                const char = spelledLetters[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      width: '46px',
                      height: '56px',
                      borderRadius: '12px',
                      border: char ? '2.5px solid #7C3AED' : '2px dashed #CBD5E1',
                      background: char ? '#EDE9FE' : '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      fontWeight: '800',
                      color: '#4C1D95',
                      fontFamily: "'Lexend', sans-serif"
                    }}
                  >
                    {char || ''}
                  </div>
                );
              })}
            </div>
          )}

          {/* Scrambled Tile Bank (During Cover/Spell) */}
          {mode === 'cover' && (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {letterPool.map((letter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTileClick(letter)}
                    style={{
                      width: '48px',
                      height: '54px',
                      borderRadius: '12px',
                      background: 'white',
                      border: '2px solid #DDD6FE',
                      fontSize: '1.6rem',
                      fontWeight: '800',
                      color: '#4C1D95',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.06)',
                      fontFamily: "'Lexend', sans-serif",
                      transition: 'transform 0.1s'
                    }}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                <button
                  onClick={handleBackspace}
                  className="btn btn-secondary"
                  style={{ borderRadius: '9999px', padding: '0.6rem 1.2rem' }}
                >
                  ⌫ Delete
                </button>
                <button
                  onClick={handleCheck}
                  disabled={spelledLetters.length === 0}
                  className="btn btn-primary"
                  style={{
                    borderRadius: '9999px',
                    padding: '0.6rem 1.75rem',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                    border: 'none',
                    opacity: spelledLetters.length > 0 ? 1 : 0.6
                  }}
                >
                  Check Spelling (+5 ⭐)
                </button>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          {mode === 'look' && (
            <button
              onClick={handleCover}
              className="btn btn-primary"
              style={{
                width: '100%',
                borderRadius: '9999px',
                padding: '0.9rem',
                fontSize: '1.15rem',
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                border: 'none',
                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.35)'
              }}
            >
              <EyeOff size={20} />
              <span>Cover Word & Spell from Memory!</span>
            </button>
          )}

          {mode === 'checked' && (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', width: '100%' }}>
              <button
                onClick={() => {
                  playPop();
                  setMode('look');
                  setSpelledLetters([]);
                  setFeedback(null);
                }}
                className="btn btn-secondary"
                style={{ borderRadius: '9999px', padding: '0.6rem 1.25rem' }}
              >
                <Eye size={16} />
                <span>Look Again</span>
              </button>

              <button
                onClick={handleNextWord}
                className="btn btn-primary"
                style={{
                  borderRadius: '9999px',
                  padding: '0.6rem 1.75rem',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  border: 'none'
                }}
              >
                <span>Next Tricky Word ➔</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Dysgraphia 4-Line Handwriting Canvas */}
      {activeTab === 'dysgraphia_lines' && (
        <div
          className="glass-card"
          style={{
            padding: '1.75rem',
            borderRadius: '28px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            maxWidth: '620px',
            margin: '0 auto',
            width: '100%',
            background: 'white'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '0.85rem', color: '#065F46', fontWeight: '800' }}>
              Practice Word {dysgraphiaIdx + 1} of {DYSGRAPHIA_WORDS.length} • 4-Line Handwriting
            </span>
            <button
              onClick={() => drawLinesAndGhost()}
              className="btn-secondary btn-pill"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
            >
              <RotateCcw size={14} /> Clear Canvas
            </button>
          </div>

          {/* Interactive 4-Line Canvas */}
          <div
            style={{
              width: '100%',
              borderRadius: '20px',
              border: '2.5px solid #A7F3D0',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(5, 150, 105, 0.1)',
              background: '#FFFDF7',
              touchAction: 'none'
            }}
          >
            <canvas
              ref={canvasRef}
              width={560}
              height={260}
              style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
              onMouseDown={startDraw}
              onMouseMove={doDraw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={doDraw}
              onTouchEnd={endDraw}
            />
          </div>

          <p style={{ color: '#065F46', fontSize: '0.9rem', margin: 0, fontWeight: '600' }}>
            💡 {currentDysWord.tip}
          </p>

          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
            <button
              onClick={() => {
                playPop();
                setDysgraphiaIdx((prev) => (prev < DYSGRAPHIA_WORDS.length - 1 ? prev + 1 : 0));
              }}
              className="btn btn-primary"
              style={{
                borderRadius: '9999px',
                padding: '0.65rem 1.75rem',
                background: '#059669',
                border: 'none'
              }}
            >
              <span>Next Practice Word ➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
