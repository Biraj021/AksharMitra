import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, CheckCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const RHYME_LEVELS = [
  {
    id: 'rhyme_1',
    targetWord: 'Cat',
    emoji: '🐱',
    targetPhoneme: '-at',
    audioInstruction: 'Which word rhymes with Cat? Hat, Dog, or Sun?',
    options: [
      { id: 'opt_1', text: 'Hat', emoji: '🎩', isCorrect: true },
      { id: 'opt_2', text: 'Dog', emoji: '🐶', isCorrect: false },
      { id: 'opt_3', text: 'Sun', emoji: '☀️', isCorrect: false }
    ]
  },
  {
    id: 'rhyme_2',
    targetWord: 'Frog',
    emoji: '🐸',
    targetPhoneme: '-og',
    audioInstruction: 'Which word rhymes with Frog? Star, Dog, or Fish?',
    options: [
      { id: 'opt_1', text: 'Star', emoji: '⭐', isCorrect: false },
      { id: 'opt_2', text: 'Dog', emoji: '🐶', isCorrect: true },
      { id: 'opt_3', text: 'Fish', emoji: '🐟', isCorrect: false }
    ]
  },
  {
    id: 'rhyme_3',
    targetWord: 'Star',
    emoji: '⭐',
    targetPhoneme: '-ar',
    audioInstruction: 'Which word rhymes with Star? Car, Ball, or Tree?',
    options: [
      { id: 'opt_1', text: 'Car', emoji: '🚗', isCorrect: true },
      { id: 'opt_2', text: 'Ball', emoji: '⚽', isCorrect: false },
      { id: 'opt_3', text: 'Tree', emoji: '🌳', isCorrect: false }
    ]
  },
  {
    id: 'rhyme_4',
    targetWord: 'Bed',
    emoji: '🛏️',
    targetPhoneme: '-ed',
    audioInstruction: 'Which word rhymes with Bed? Red, Moon, or Cup?',
    options: [
      { id: 'opt_1', text: 'Red', emoji: '🔴', isCorrect: true },
      { id: 'opt_2', text: 'Moon', emoji: '🌙', isCorrect: false },
      { id: 'opt_3', text: 'Cup', emoji: '🥤', isCorrect: false }
    ]
  }
];

export default function RhymeMatchQuest({ onCompleteQuest }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars } = useProfile();

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'correct' | 'try_again'

  const currentLevel = RHYME_LEVELS[currentLevelIdx];

  // Automatically narrate instruction whenever starting or switching rhyme levels
  useEffect(() => {
    speakText(currentLevel.audioInstruction, 'en-US');
  }, [currentLevelIdx]);

  const handleSelectOption = (opt) => {
    setSelectedOption(opt.id);
    speakText(opt.text, 'en-US');

    if (opt.isCorrect) {
      playStarTwinkle();
      setStatus('correct');
      setCorrectAnswersCount((prev) => prev + 1);
      addStars(5);

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    } else {
      playChime(320);
      setStatus('try_again');
      speakText('Almost! Listen carefully to the ending sound!', 'en-US');
    }
  };

  const handleNextLevel = () => {
    playPop();
    if (currentLevelIdx < RHYME_LEVELS.length - 1) {
      setCurrentLevelIdx((prev) => prev + 1);
      setSelectedOption(null);
      setStatus('idle');
    } else {
      if (onCompleteQuest) {
        onCompleteQuest({
          questId: 'rhyme_match',
          score: Math.round(((correctAnswersCount + 1) / RHYME_LEVELS.length) * 100)
        });
      }
    }
  };

  const handleResetLevel = () => {
    playPop();
    setSelectedOption(null);
    setStatus('idle');
    speakText(currentLevel.audioInstruction, 'en-US');
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.75rem',
        maxWidth: '580px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        borderRadius: '28px'
      }}
    >
      {/* Header with Level Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎵</span>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#1E293B' }}>Quest 3: Rhyme Magic</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
              Puzzle {currentLevelIdx + 1} of {RHYME_LEVELS.length} • Match the ending sound
            </p>
          </div>
        </div>

        {/* Level Switcher */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {RHYME_LEVELS.map((lvl, idx) => (
            <button
              key={lvl.id}
              onClick={() => {
                playPop();
                setCurrentLevelIdx(idx);
                setSelectedOption(null);
                setStatus('idle');
              }}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                border: currentLevelIdx === idx ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                background: currentLevelIdx === idx ? '#EEF2FF' : 'white',
                color: currentLevelIdx === idx ? '#4338CA' : '#64748B',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              #{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Target Word Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          padding: '1.5rem 1.25rem',
          borderRadius: '24px',
          border: '2px solid #FCD34D',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 20px rgba(245, 158, 11, 0.15)',
          position: 'relative'
        }}
      >
        <button
          onClick={() => speakText(`Which word rhymes with ${currentLevel.targetWord}?`, 'en-US')}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#B45309',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
          title="Hear instruction"
        >
          <Volume2 size={18} />
        </button>

        <span style={{ fontSize: '0.85rem', color: '#92400E', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Find the rhyme for:
        </span>
        <div style={{ fontSize: '3rem', margin: '0.35rem 0 0.1rem' }}>{currentLevel.emoji}</div>
        <h2 style={{ fontSize: '2.2rem', color: '#78350F', margin: 0, fontFamily: "'Lexend', sans-serif" }}>
          {currentLevel.targetWord}
        </h2>
        <span style={{ fontSize: '0.82rem', color: '#92400E', fontWeight: '600', opacity: 0.85 }}>
          Sounds like "...{currentLevel.targetPhoneme}"
        </span>
      </div>

      {/* Rhyme Options Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {currentLevel.options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const isCorrectChoice = isSelected && opt.isCorrect;
          const isWrongChoice = isSelected && !opt.isCorrect;

          return (
            <button
              key={opt.id}
              onClick={() => handleSelectOption(opt)}
              style={{
                padding: '1.25rem 0.5rem',
                borderRadius: '20px',
                border: isCorrectChoice
                  ? '3px solid #10B981'
                  : isWrongChoice
                  ? '3px solid #EF4444'
                  : '2px solid #E2E8F0',
                background: isCorrectChoice
                  ? '#D1FAE5'
                  : isWrongChoice
                  ? '#FEE2E2'
                  : 'white',
                cursor: 'pointer',
                boxShadow: isCorrectChoice
                  ? '0 0 16px rgba(16, 185, 129, 0.4)'
                  : isWrongChoice
                  ? '0 0 12px rgba(239, 68, 68, 0.3)'
                  : '0 4px 12px rgba(0,0,0,0.04)',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span style={{ fontSize: '2.2rem' }}>{opt.emoji}</span>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  fontFamily: "'Lexend', sans-serif",
                  color: isCorrectChoice ? '#065F46' : isWrongChoice ? '#991B1B' : '#1E293B'
                }}
              >
                {opt.text}
              </span>
              {isCorrectChoice && <span style={{ fontSize: '1rem' }}>✅</span>}
              {isWrongChoice && <span style={{ fontSize: '1rem' }}>❌</span>}
            </button>
          );
        })}
      </div>

      {/* Result Status Banner */}
      {status === 'correct' && (
        <div
          style={{
            background: '#D1FAE5',
            color: '#065F46',
            padding: '0.75rem 1rem',
            borderRadius: '16px',
            border: '2px solid #10B981',
            fontWeight: '700',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem'
          }}
        >
          <CheckCircle size={20} color="#059669" />
          <span>Brilliant! {currentLevel.targetWord} rhymes with {currentLevel.options.find(o => o.isCorrect)?.text}! (+5 ⭐)</span>
        </div>
      )}

      {status === 'try_again' && (
        <div
          style={{
            background: '#FEF3C7',
            color: '#92400E',
            padding: '0.75rem 1rem',
            borderRadius: '16px',
            border: '1.5px solid #F59E0B',
            fontWeight: '600',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            marginBottom: '1.25rem'
          }}
        >
          <span>👂 Listen closely to the ending sound and try another!</span>
        </div>
      )}

      {/* Navigation Controls */}
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
        <button
          onClick={handleResetLevel}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            border: '1px solid #E2E8F0',
            background: 'white',
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          <RotateCcw size={15} />
          <span>Reset</span>
        </button>

        <button
          onClick={handleNextLevel}
          disabled={status !== 'correct' && selectedOption === null}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.6rem',
            borderRadius: '999px',
            border: 'none',
            background: '#4F46E5',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            opacity: status === 'correct' || selectedOption !== null ? 1 : 0.6
          }}
        >
          <span>{currentLevelIdx < RHYME_LEVELS.length - 1 ? 'Next Rhyme' : 'Go to Syllable Drum 🥁'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
