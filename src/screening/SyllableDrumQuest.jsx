import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Sparkles, CheckCircle, ArrowRight, RotateCcw, Play, Music, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const DRUM_WORDS = [
  {
    id: 'drum_1',
    word: 'Cat',
    emoji: '🐱',
    syllables: ['Cat'],
    count: 1,
    audioInstruction: 'Tap the magic drum 1 time for Cat!'
  },
  {
    id: 'drum_2',
    word: 'Mon-key',
    emoji: '🐒',
    syllables: ['Mon', 'key'],
    count: 2,
    audioInstruction: 'Tap the magic drum 2 times for Mon-key!'
  },
  {
    id: 'drum_3',
    word: 'Ba-na-na',
    emoji: '🍌',
    syllables: ['Ba', 'na', 'na'],
    count: 3,
    audioInstruction: 'Tap the magic drum 3 times for Ba-na-na!'
  },
  {
    id: 'drum_4',
    word: 'El-e-phant',
    emoji: '🐘',
    syllables: ['El', 'e', 'phant'],
    count: 3,
    audioInstruction: 'Tap the magic drum 3 times for El-e-phant!'
  },
  {
    id: 'drum_5',
    word: 'Hel-i-cop-ter',
    emoji: '🚁',
    syllables: ['Hel', 'i', 'cop', 'ter'],
    count: 4,
    audioInstruction: 'Tap the magic drum 4 times for Hel-i-cop-ter!'
  }
];

export default function SyllableDrumQuest({ onCompleteQuest }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars } = useProfile();

  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [drumTaps, setDrumTaps] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isDrumPressed, setIsDrumPressed] = useState(false);

  const demoIntervalRef = useRef(null);
  const currentItem = DRUM_WORDS[currentWordIdx];

  useEffect(() => {
    setDrumTaps(0);
    setIsSuccess(false);
    setIsPlayingDemo(false);
    clearInterval(demoIntervalRef.current);
    speakText(currentItem.audioInstruction, 'en-US');

    return () => {
      clearInterval(demoIntervalRef.current);
    };
  }, [currentWordIdx]);

  const handleDrumTap = () => {
    if (isSuccess) return;

    const nextTaps = drumTaps + 1;
    setDrumTaps(nextTaps);
    playPop();
    playChime(440 + nextTaps * 70);

    // Speak current syllable chunk
    if (nextTaps <= currentItem.syllables.length) {
      speakText(currentItem.syllables[nextTaps - 1], 'en-US');
    }

    if (nextTaps === currentItem.count) {
      setIsSuccess(true);
      playStarTwinkle();
      addStars(5);

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }
  };

  // Auto-Beat Demonstration
  const playAutoDemo = () => {
    if (isPlayingDemo) return;
    setDrumTaps(0);
    setIsSuccess(false);
    setIsPlayingDemo(true);

    let tap = 0;
    demoIntervalRef.current = setInterval(() => {
      if (tap < currentItem.count) {
        tap++;
        setDrumTaps(tap);
        playPop();
        playChime(440 + tap * 70);
        speakText(currentItem.syllables[tap - 1], 'en-US');
      } else {
        clearInterval(demoIntervalRef.current);
        setIsPlayingDemo(false);
        setIsSuccess(true);
        playStarTwinkle();
        addStars(5);
      }
    }, 600);
  };

  const handleReset = () => {
    playPop();
    clearInterval(demoIntervalRef.current);
    setDrumTaps(0);
    setIsSuccess(false);
    setIsPlayingDemo(false);
  };

  const handleNextWord = () => {
    playPop();
    if (currentWordIdx < DRUM_WORDS.length - 1) {
      setCurrentWordIdx((prev) => prev + 1);
    } else {
      if (onCompleteQuest) {
        onCompleteQuest({
          questId: 'syllable_drum',
          score: 95
        });
      }
    }
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
      {/* Header with Word Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🥁</span>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#1E293B' }}>Quest 4: Syllable Beat Drum</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
              Word {currentWordIdx + 1} of {DRUM_WORDS.length} • Tap out the beats
            </p>
          </div>
        </div>

        {/* Word Switcher */}
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {DRUM_WORDS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                playPop();
                setCurrentWordIdx(idx);
              }}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '9999px',
                border: currentWordIdx === idx ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                background: currentWordIdx === idx ? '#EEF2FF' : 'white',
                color: currentWordIdx === idx ? '#4338CA' : '#64748B',
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

      {/* Target Word & Syllable Breakdown Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
          padding: '1.5rem 1.25rem',
          borderRadius: '24px',
          border: '2px solid #C7D2FE',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 20px rgba(99, 102, 241, 0.12)',
          position: 'relative'
        }}
      >
        <button
          onClick={() => speakText(currentItem.audioInstruction, 'en-US')}
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
            color: '#4F46E5',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}
          title="Hear instruction"
        >
          <Volume2 size={18} />
        </button>

        <div style={{ fontSize: '3rem', margin: '0 0 0.25rem' }}>{currentItem.emoji}</div>
        <h2 style={{ fontSize: '2.2rem', color: '#312E81', margin: '0 0 0.5rem', fontFamily: "'Lexend', sans-serif" }}>
          {currentItem.word}
        </h2>

        {/* Syllable Tiles */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {currentItem.syllables.map((syl, idx) => {
            const isFilled = drumTaps > idx;
            return (
              <div
                key={idx}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '12px',
                  background: isFilled ? '#10B981' : 'white',
                  color: isFilled ? 'white' : '#4F46E5',
                  border: isFilled ? '2px solid #059669' : '1.5px solid #C7D2FE',
                  fontWeight: '800',
                  fontSize: '1.15rem',
                  fontFamily: "'Lexend', sans-serif",
                  transform: isFilled ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isFilled ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {syl}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Bouncing Drum */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={handleDrumTap}
          onMouseDown={() => setIsDrumPressed(true)}
          onMouseUp={() => setIsDrumPressed(false)}
          onTouchStart={() => setIsDrumPressed(true)}
          onTouchEnd={() => setIsDrumPressed(false)}
          style={{
            width: '135px',
            height: '135px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #F59E0B 0%, #D97706 100%)',
            border: '8px solid white',
            boxShadow: isDrumPressed
              ? '0 4px 12px rgba(245, 158, 11, 0.6), inset 0 4px 12px rgba(0,0,0,0.2)'
              : '0 16px 32px rgba(245, 158, 11, 0.45)',
            transform: isDrumPressed ? 'scale(0.92)' : 'scale(1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.6rem',
            cursor: 'pointer',
            transition: 'all 0.1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            userSelect: 'none'
          }}
          title="Tap the Drum!"
        >
          🥁
        </button>

        <span style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: 'bold' }}>
          Tap {currentItem.count} {currentItem.count === 1 ? 'time' : 'times'} on the drum!
        </span>

        {/* Syllable Beat Progress Beads */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {Array.from({ length: currentItem.count }).map((_, idx) => {
            const isHit = drumTaps > idx;
            return (
              <div
                key={idx}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isHit ? '#10B981' : '#E2E8F0',
                  border: isHit ? '2px solid #059669' : '2px solid #CBD5E1',
                  boxShadow: isHit ? '0 0 10px rgba(16, 185, 129, 0.6)' : 'none',
                  transform: isHit ? 'scale(1.2)' : 'scale(1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  color: 'white',
                  fontWeight: 'bold',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {isHit ? '✓' : idx + 1}
              </div>
            );
          })}
        </div>

        {/* Auto-Beat Demo Button */}
        <button
          onClick={playAutoDemo}
          disabled={isPlayingDemo}
          style={{
            background: '#EEF2FF',
            border: '1.5px solid #C7D2FE',
            color: '#4338CA',
            borderRadius: '9999px',
            padding: '0.35rem 0.9rem',
            fontSize: '0.8rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Play size={13} />
          <span>Listen to Mitra Drum (Auto-Beat)</span>
        </button>
      </div>

      {/* Success Notification */}
      {isSuccess && (
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
          <span>Fantastic Rhythm! {currentItem.count} beats matched! (+5 ⭐)</span>
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
          onClick={handleNextWord}
          disabled={!isSuccess}
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
            opacity: isSuccess ? 1 : 0.6
          }}
        >
          <span>{currentWordIdx < DRUM_WORDS.length - 1 ? 'Next Beat' : 'Finish All Quests! 🎉'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
