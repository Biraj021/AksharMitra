import React, { useState, useEffect } from 'react';
import { Volume2, Sparkles, CheckCircle, ArrowRight, RotateCcw, Compass, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const SAFARI_LEVELS = [
  {
    id: 'safari_1',
    targetSound: '/b/ sound',
    rule: 'starts with B',
    audioPrompt: 'Find the word that does NOT start with the b sound!',
    cards: [
      { id: 'c1', name: 'Bear', emoji: '🐻', sound: '/b/', isOddOne: false },
      { id: 'c2', name: 'Banana', emoji: '🍌', sound: '/b/', isOddOne: false },
      { id: 'c3', name: 'Cat', emoji: '🐱', sound: '/k/', isOddOne: true }
    ]
  },
  {
    id: 'safari_2',
    targetSound: '/s/ sound',
    rule: 'starts with S',
    audioPrompt: 'Find the word that does NOT start with the s sound!',
    cards: [
      { id: 'c1', name: 'Sun', emoji: '☀️', sound: '/s/', isOddOne: false },
      { id: 'c2', name: 'Snake', emoji: '🐍', sound: '/s/', isOddOne: false },
      { id: 'c3', name: 'Tree', emoji: '🌳', sound: '/t/', isOddOne: true }
    ]
  },
  {
    id: 'safari_3',
    targetSound: '/m/ sound',
    rule: 'starts with M',
    audioPrompt: 'Find the word that does NOT start with the /m/ sound!',
    cards: [
      { id: 'c1', name: 'Monkey', emoji: '🐒', sound: '/m/', isOddOne: false },
      { id: 'c2', name: 'Moon', emoji: '🌙', sound: '/m/', isOddOne: false },
      { id: 'c3', name: 'Duck', emoji: '🦆', sound: '/d/', isOddOne: true }
    ]
  },
  {
    id: 'safari_4',
    targetSound: '/d/ sound',
    rule: 'starts with D',
    audioPrompt: 'Find the word that does NOT start with the /d/ sound!',
    cards: [
      { id: 'c1', name: 'Dog', emoji: '🐶', sound: '/d/', isOddOne: false },
      { id: 'c2', name: 'Drum', emoji: '🥁', sound: '/d/', isOddOne: false },
      { id: 'c3', name: 'Apple', emoji: '🍎', sound: '/a/', isOddOne: true }
    ]
  }
];

export default function SoundSafariQuest({ onCompleteQuest }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars } = useProfile();

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'correct' | 'try_again'
  const [correctCount, setCorrectCount] = useState(0);

  const level = SAFARI_LEVELS[currentLevelIdx];

  // Auto-narrate instruction on level start / transition
  useEffect(() => {
    speakText(level.audioPrompt, 'en-US');
  }, [currentLevelIdx]);

  const handleCardClick = (card) => {
    setSelectedCardId(card.id);
    speakText(card.name, 'en-US');

    if (card.isOddOne) {
      playStarTwinkle();
      setStatus('correct');
      setCorrectCount((prev) => prev + 1);
      addStars(5);

      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) { }
    } else {
      playChime(300);
      setStatus('try_again');
      speakText(`${card.name} starts with the ${level.targetSound}! Find the one with a different sound!`, 'en-US');
    }
  };

  const handleNextLevel = () => {
    playPop();
    if (currentLevelIdx < SAFARI_LEVELS.length - 1) {
      setCurrentLevelIdx((prev) => prev + 1);
      setSelectedCardId(null);
      setStatus('idle');
    } else {
      if (onCompleteQuest) {
        onCompleteQuest({
          questId: 'sound_safari',
          score: Math.round(((correctCount + 1) / SAFARI_LEVELS.length) * 100)
        });
      }
    }
  };

  const handleReset = () => {
    playPop();
    setSelectedCardId(null);
    setStatus('idle');
    speakText(level.audioPrompt, 'en-US');
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
      {/* Header with Level Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🧭</span>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#1E293B' }}>Quest 4: Sound Safari</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
              Mission {currentLevelIdx + 1} of {SAFARI_LEVELS.length} • Spot the Odd One Out
            </p>
          </div>
        </div>

        {/* Level Pills */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {SAFARI_LEVELS.map((lvl, idx) => (
            <button
              key={lvl.id}
              onClick={() => {
                playPop();
                setCurrentLevelIdx(idx);
                setSelectedCardId(null);
                setStatus('idle');
              }}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                border: currentLevelIdx === idx ? '2px solid #059669' : '1px solid #E2E8F0',
                background: currentLevelIdx === idx ? '#D1FAE5' : 'white',
                color: currentLevelIdx === idx ? '#065F46' : '#64748B',
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

      {/* Safari Mission Target Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          padding: '1.5rem 1.25rem',
          borderRadius: '24px',
          border: '2px solid #A7F3D0',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.12)',
          position: 'relative'
        }}
      >
        <button
          onClick={() => speakText(level.audioPrompt, 'en-US')}
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
            color: '#059669',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
          title="Hear mission instruction"
        >
          <Volume2 size={18} />
        </button>

        <span style={{ fontSize: '0.85rem', color: '#065F46', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🕵️ Sound Safari Clue:
        </span>
        <h2 style={{ fontSize: '1.6rem', color: '#064E3B', margin: '0.35rem 0 0.2rem', fontFamily: "'Lexend', sans-serif" }}>
          Which one does NOT start with {level.targetSound}?
        </h2>
        <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: '600' }}>
          Two start with {level.targetSound} • Find the odd one!
        </span>
      </div>

      {/* Safari 3-Card Discovery Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {level.cards.map((card) => {
          const isSelected = selectedCardId === card.id;
          const isCorrect = isSelected && card.isOddOne;
          const isWrong = isSelected && !card.isOddOne;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              style={{
                padding: '1.35rem 0.5rem',
                borderRadius: '22px',
                border: isCorrect
                  ? '3px solid #10B981'
                  : isWrong
                    ? '3px solid #F59E0B'
                    : '2px solid #E2E8F0',
                background: isCorrect
                  ? '#D1FAE5'
                  : isWrong
                    ? '#FEF3C7'
                    : 'white',
                cursor: 'pointer',
                boxShadow: isCorrect
                  ? '0 0 18px rgba(16, 185, 129, 0.45)'
                  : isWrong
                    ? '0 0 12px rgba(245, 158, 11, 0.35)'
                    : '0 4px 12px rgba(0,0,0,0.04)',
                transform: isSelected ? 'scale(1.06)' : 'scale(1)',
                transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span style={{ fontSize: '2.4rem' }}>{card.emoji}</span>
              <span
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  fontFamily: "'Lexend', sans-serif",
                  color: isCorrect ? '#065F46' : isWrong ? '#92400E' : '#1E293B'
                }}
              >
                {card.name}
              </span>
              {isCorrect && <span style={{ fontSize: '0.95rem' }}>🎯 Odd One Out!</span>}
              {isWrong && <span style={{ fontSize: '0.8rem', color: '#B45309' }}>Starts with {card.sound}</span>}
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
          <span>Super Detective! You found the odd sound! (+5 ⭐)</span>
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
          <span>👂 Listen to the starting sounds: two start with {level.targetSound}!</span>
        </div>
      )}

      {/* Navigation Controls */}
      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
        <button
          onClick={handleReset}
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
          disabled={status !== 'correct' && selectedCardId === null}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.6rem',
            borderRadius: '999px',
            border: 'none',
            background: '#059669',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            opacity: status === 'correct' || selectedCardId !== null ? 1 : 0.6
          }}
        >
          <span>{currentLevelIdx < SAFARI_LEVELS.length - 1 ? 'Next Safari Clue' : 'Finish All Quests! 🎉'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
