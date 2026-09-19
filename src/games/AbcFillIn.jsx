import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle, RotateCcw, ArrowRight, Train, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const TRAIN_LEVELS = [
  {
    id: 'lvl_1',
    title: 'Beginner Express: Jump into the ABCs',
    wagons: [
      { sequence: ['A', 'B', null, 'D', 'E'], missingIndex: 2, answer: 'C', hint: 'What comes right after B?' },
      { sequence: ['F', 'G', null, 'I', 'J'], missingIndex: 2, answer: 'H', hint: 'H for Hat, right before I!' },
      { sequence: ['K', null, 'M', 'N', 'O'], missingIndex: 1, answer: 'L', hint: 'L for Lion comes after K!' },
      { sequence: ['P', 'Q', null, 'S', 'T'], missingIndex: 2, answer: 'R', hint: 'R for Rainbow comes before S!' },
    ]
  },
  {
    id: 'lvl_2',
    title: 'Mirror Letter Tracks: b, d, p, q',
    wagons: [
      { sequence: ['A', null, 'C', 'D', 'E'], missingIndex: 1, answer: 'B', hint: 'B has a belly on the right! (b)' },
      { sequence: ['B', 'C', null, 'E', 'F'], missingIndex: 2, answer: 'D', hint: 'D has a round back like a door! (d)' },
      { sequence: ['N', 'O', null, 'Q', 'R'], missingIndex: 2, answer: 'P', hint: 'P has its circle at the top right! (p)' },
      { sequence: ['O', 'P', null, 'R', 'S'], missingIndex: 2, answer: 'Q', hint: 'Q has a tail on the right! (q)' },
    ]
  },
  {
    id: 'lvl_3',
    title: 'Speedy Engine: Two Missing Letters',
    wagons: [
      { sequence: ['A', null, 'C', null, 'E', 'F'], missingIndices: [1, 3], answers: { 1: 'B', 3: 'D' }, hint: 'Fill B and D in the alphabet line!' },
      { sequence: ['M', null, 'O', null, 'Q', 'R'], missingIndices: [1, 3], answers: { 1: 'N', 3: 'P' }, hint: 'Fill N and P!' },
      { sequence: ['S', null, 'U', null, 'W', 'X'], missingIndices: [1, 3], answers: { 1: 'T', 3: 'V' }, hint: 'Fill T and V!' },
    ]
  },
  {
    id: 'lvl_4',
    title: 'Grand Master Train: Long Alphabet Trail',
    wagons: [
      { sequence: ['U', 'V', null, 'X', null, 'Z'], missingIndices: [2, 4], answers: { 2: 'W', 4: 'Y' }, hint: 'Almost to the end of the alphabet!' },
      { sequence: ['E', 'F', null, 'H', null, 'J', 'K'], missingIndices: [2, 4], answers: { 2: 'G', 4: 'I' }, hint: 'G for Giraffe and I for Ice cream!' },
    ]
  }
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const CONFUSION_LETTERS = new Set(['B', 'D', 'P', 'Q']);

export default function AbcFillIn({ onBack }) {
  const { addStars, activeLanguage } = useProfile();
  const { playPop, playChime, playSuccessChord, playStarTwinkle, speakText } = useAudio();

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentWagonIdx, setCurrentWagonIdx] = useState(0);
  
  // Wagon slots state: array of letter strings or null
  const [wagonState, setWagonState] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'try_again' | null
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCaseToggle, setShowCaseToggle] = useState('upper'); // 'upper' | 'both'

  const currentLevel = TRAIN_LEVELS[currentLevelIdx];
  const currentWagon = currentLevel.wagons[currentWagonIdx];

  // Initialize wagon slots
  useEffect(() => {
    if (!currentWagon) return;
    const initialSlots = [...currentWagon.sequence];
    setWagonState(initialSlots);
    setFeedback(null);

    // Default select first empty slot
    if (currentWagon.missingIndex !== undefined) {
      setSelectedSlot(currentWagon.missingIndex);
    } else if (currentWagon.missingIndices?.length) {
      setSelectedSlot(currentWagon.missingIndices[0]);
    }
  }, [currentLevelIdx, currentWagonIdx]);

  // Read letter aloud
  const handleHearLetter = (letter) => {
    if (!letter) return;
    speakText(`${letter}, ${letter.toLowerCase()}`);
  };

  // Select letter from visual dyslexia keyboard
  const handleKeyPress = (letter) => {
    playPop();
    if (selectedSlot === null || feedback === 'correct') return;

    // Check if selected slot is indeed a missing slot
    const isSingle = currentWagon.missingIndex !== undefined;
    let isCorrect = false;

    if (isSingle) {
      if (selectedSlot === currentWagon.missingIndex && letter === currentWagon.answer) {
        isCorrect = true;
      }
    } else {
      if (currentWagon.answers[selectedSlot] === letter) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      playChime(659.25);
      const updated = [...wagonState];
      updated[selectedSlot] = letter;
      setWagonState(updated);

      // Check if all missing slots are now filled
      const allFilled = isSingle
        ? true
        : currentWagon.missingIndices.every(idx => updated[idx] === currentWagon.answers[idx]);

      if (allFilled) {
        setFeedback('correct');
        playSuccessChord();
        addStars(5);
        playStarTwinkle();
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.6 }
        });
      } else {
        // Move to the next empty slot
        const nextBlank = currentWagon.missingIndices.find(idx => !updated[idx]);
        if (nextBlank !== undefined) {
          setSelectedSlot(nextBlank);
        }
      }
    } else {
      // Gentle encouragement
      setFeedback('try_again');
      playChime(300);
      setTimeout(() => setFeedback(null), 1400);
    }
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSlot, wagonState, feedback, currentWagon]);

  // Advance to next wagon or next level
  const handleNextWagon = () => {
    setFeedback(null);
    if (currentWagonIdx + 1 < currentLevel.wagons.length) {
      setCurrentWagonIdx(prev => prev + 1);
    } else if (currentLevelIdx + 1 < TRAIN_LEVELS.length) {
      setCurrentLevelIdx(prev => prev + 1);
      setCurrentWagonIdx(0);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 }
      });
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.4 }
      });
    }
  };

  const handleRestart = () => {
    setCurrentLevelIdx(0);
    setCurrentWagonIdx(0);
    setIsCompleted(false);
    setFeedback(null);
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={() => setShowCaseToggle(prev => (prev === 'upper' ? 'both' : 'upper'))}
            className="btn-secondary btn-pill"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            title="Toggle letter casing preview"
          >
            {showCaseToggle === 'upper' ? 'Aa (Show Lowercase)' : 'A (Uppercase Only)'}
          </button>
          <div className="game-stat-pill" style={{ color: '#047857', background: '#D1FAE5', borderColor: '#A7F3D0' }}>
            <Train size={16} />
            <span>Train {currentLevelIdx + 1}.{currentWagonIdx + 1}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className="glass-card"
        style={{
          padding: '2rem 1.5rem',
          borderRadius: '26px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          background: 'white',
          maxWidth: '780px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        {!isCompleted ? (
          <>
            {/* Level & Task Banner */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-emerald">🔡 ABC Alphabet Train</span>
                <span className="badge badge-amber">{currentLevel.title}</span>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
                {currentWagon?.hint || 'Tap on the missing train wagon and pick the correct letter!'}
              </p>
            </div>

            {/* The Train on Tracks */}
            <div
              style={{
                width: '100%',
                padding: '1.5rem 1rem 2rem',
                background: 'linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 100%)',
                borderRadius: '20px',
                border: '2px dashed #86EFAC',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                position: 'relative',
                overflowX: 'auto'
              }}
            >
              {/* Train Cars Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem',
                  minWidth: 'max-content'
                }}
              >
                {/* Engine Car */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    padding: '0.85rem 1rem',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    minWidth: '70px',
                    height: '90px'
                  }}
                >
                  <Train size={30} />
                  <span style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>EXPRESS</span>
                </div>

                {/* Wagons */}
                {wagonState.map((letter, idx) => {
                  const isMissingSlot =
                    currentWagon.missingIndex === idx ||
                    (currentWagon.missingIndices && currentWagon.missingIndices.includes(idx));
                  const isSelected = selectedSlot === idx;
                  const isFilled = letter !== null;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        playPop();
                        if (isMissingSlot) {
                          setSelectedSlot(idx);
                        } else if (letter) {
                          handleHearLetter(letter);
                        }
                      }}
                      style={{
                        width: '74px',
                        height: '90px',
                        borderRadius: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isMissingSlot ? 'pointer' : 'default',
                        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        position: 'relative',
                        boxShadow: isSelected
                          ? '0 0 0 4px #10B981, 0 8px 16px rgba(16, 185, 129, 0.25)'
                          : '0 4px 8px rgba(0, 0, 0, 0.05)',
                        background: isMissingSlot
                          ? isFilled
                            ? '#ECFDF5'
                            : '#FFFFFF'
                          : '#FFFFFF',
                        border: isMissingSlot
                          ? isFilled
                            ? '3px solid #10B981'
                            : '3px dashed #F59E0B'
                          : '2px solid #E2E8F0',
                        transform: isSelected ? 'scale(1.06)' : 'scale(1)'
                      }}
                    >
                      {/* Car Wheels Indicator */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-8px',
                          display: 'flex',
                          gap: '24px'
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#334155' }} />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#334155' }} />
                      </div>

                      {letter ? (
                        <div style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '2rem',
                              fontWeight: 900,
                              color: isMissingSlot ? '#047857' : '#1E293B',
                              fontFamily: 'Lexend, sans-serif'
                            }}
                          >
                            {letter}
                          </span>
                          {showCaseToggle === 'both' && (
                            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                              {letter.toLowerCase()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '1.8rem', color: '#F59E0B', fontWeight: 900 }}>?</span>
                          <div style={{ fontSize: '0.65rem', color: '#B45309', fontWeight: 700 }}>
                            {isSelected ? 'TAP KEY' : 'BLANK'}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Train Track Line */}
              <div
                style={{
                  width: '95%',
                  height: '6px',
                  background: '#64748B',
                  borderRadius: '3px',
                  marginTop: '0.2rem'
                }}
              />
            </div>

            {/* Audio Hear Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  const seq = wagonState.filter(Boolean).join(', ');
                  speakText(`Train wagon sequence: ${seq}`);
                }}
                className="btn-secondary btn-pill"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <Volume2 size={16} color="#059669" />
                <span>Listen to Train Sequence</span>
              </button>
            </div>

            {/* Feedback & Next Wagon Banner */}
            {feedback === 'correct' ? (
              <div
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '16px',
                  background: '#ECFDF5',
                  border: '2px solid #6EE7B7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  animation: 'popIn 0.3s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle size={24} color="#059669" />
                  <span style={{ fontWeight: 700, color: '#065F46', fontSize: '1.05rem' }}>
                    Choo-choo! Great job restoring the train! (+5 Stars 🌟)
                  </span>
                </div>
                <button
                  onClick={handleNextWagon}
                  className="btn btn-emerald"
                  style={{ borderRadius: '9999px', padding: '0.6rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <span>Next Wagon</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : feedback === 'try_again' ? (
              <div
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '14px',
                  background: '#FEF3C7',
                  border: '1.5px solid #FCD34D',
                  textAlign: 'center',
                  color: '#92400E',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                Gently check the alphabet order! Try another letter key below 💡
              </div>
            ) : null}

            {/* Visual Dyslexia-Friendly On-Screen Keyboard */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                background: '#F8FAFC',
                padding: '1.25rem',
                borderRadius: '20px',
                border: '1.5px solid #E2E8F0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
                  ⌨️ Dyslexia Visual Keyboard (Touch or type)
                </span>
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748B' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                    Vowel
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
                    Mirror Pair (b/d/p/q)
                  </span>
                </div>
              </div>

              {KEYBOARD_ROWS.map((row, rIdx) => (
                <div
                  key={rIdx}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  {row.map((char) => {
                    const isVowel = VOWELS.has(char);
                    const isConfusion = CONFUSION_LETTERS.has(char);

                    return (
                      <button
                        key={char}
                        onClick={() => handleKeyPress(char)}
                        style={{
                          flex: 1,
                          maxWidth: '52px',
                          height: '48px',
                          borderRadius: '12px',
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          fontFamily: 'Lexend, sans-serif',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                          border: isVowel
                            ? '2px solid #FDE68A'
                            : isConfusion
                            ? '2px solid #DDD6FE'
                            : '2px solid #CBD5E1',
                          background: isVowel
                            ? 'linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)'
                            : isConfusion
                            ? 'linear-gradient(180deg, #F3E8FF 0%, #E9D5FF 100%)'
                            : 'white',
                          color: isVowel
                            ? '#92400E'
                            : isConfusion
                            ? '#6B21A8'
                            : '#1E293B',
                          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.06)'
                        }}
                      >
                        <span>{char}</span>
                        {showCaseToggle === 'both' && (
                          <span style={{ fontSize: '0.65rem', opacity: 0.75 }}>{char.toLowerCase()}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Victory Completion View */
          <div
            style={{
              padding: '2.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}
            >
              🚂🌟
            </div>
            <div>
              <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: '#065F46' }}>
                Alphabet Train Grand Master!
              </h2>
              <p style={{ color: '#64748B', maxWidth: '440px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.5 }}>
                You repaired every single wagon on the tracks from A to Z! Your sequencing and letter recognition are outstanding!
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleRestart}
                className="btn btn-secondary"
                style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RotateCcw size={18} />
                <span>Play Again</span>
              </button>
              <button
                onClick={onBack}
                className="btn btn-emerald"
                style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Back to Hub</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
