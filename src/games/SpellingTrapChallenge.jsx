import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const TRAP_CHALLENGES = [
  {
    id: 'tr_1',
    targetWord: 'FROM',
    trapWord: 'FORM',
    visualClue: '🎁',
    sentence: 'A special gift came ____ grandma.',
    options: ['FROM', 'FORM'],
    rule: "'FROM' starts with F-R (where something comes from), while 'FORM' is a paper you fill out (F-O-R-M)."
  },
  {
    id: 'tr_2',
    targetWord: 'PLAY',
    trapWord: 'PALY',
    visualClue: '🎮',
    sentence: 'The children go outside to ____.',
    options: ['PLAY', 'PALY'],
    rule: "The letter 'L' hugs the letter 'P' right away: P-L-A-Y!"
  },
  {
    id: 'tr_3',
    targetWord: 'GIRL',
    trapWord: 'GRIL',
    visualClue: '👧',
    sentence: 'The happy ____ read a story.',
    options: ['GIRL', 'GRIL'],
    rule: "'I' comes right after 'G' in GIRL (G-I-R-L). Don't let the R jump ahead!"
  },
  {
    id: 'tr_4',
    targetWord: 'WENT',
    trapWord: 'WNET',
    visualClue: '🚶',
    sentence: 'Mitra ____ to the learning island.',
    options: ['WENT', 'WNET'],
    rule: "'E' must follow 'W' before 'N': W-E-N-T."
  },
  {
    id: 'tr_5',
    targetWord: 'SAID',
    trapWord: 'SIAD',
    visualClue: '💬',
    sentence: '"Hello friend!" ____ the smiling owl.',
    options: ['SAID', 'SIAD'],
    rule: "'A' comes first, then 'I': S-A-I-D."
  },
  {
    id: 'tr_6',
    targetWord: 'FIRST',
    trapWord: 'FRIST',
    visualClue: '🥇',
    sentence: 'He won the ____ place golden trophy.',
    options: ['FIRST', 'FRIST'],
    rule: "'I' comes right after 'F' in FIRST (F-I-R-S-T)."
  }
];

export default function SpellingTrapChallenge({ onBack, adaptiveConfig }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars } = useProfile();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const challenge = TRAP_CHALLENGES[currentIdx];

  // Scramble the 2 options so correct isn't always in same position
  const shuffledOptions = React.useMemo(() => {
    return [...challenge.options].sort(() => 0.5 - Math.random());
  }, [challenge.id]);

  useEffect(() => {
    setSelectedOption(null);
    setFeedback(null);
    speakText(`${challenge.sentence.replace('____', 'blank')}. Spot the correct spelling!`, 'en-US');
  }, [currentIdx]);

  const handleSelectOption = (word) => {
    if (selectedOption) return;
    setSelectedOption(word);

    if (word === challenge.targetWord) {
      playStarTwinkle();
      addStars(5);
      setFeedback({
        type: 'success',
        message: `🎯 Bullseye! "${word}" is correct! ${challenge.rule}`
      });
      speakText(`Spot on! ${word} is the right word!`, 'en-US');
      try {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } else {
      playChime(300);
      setFeedback({
        type: 'retry',
        message: `⚠️ Trap spotted! "${word}" is a letter swap. ${challenge.rule}`
      });
      speakText(`Look closely at the letter order! ${challenge.rule}`, 'en-US');
    }
  };

  const handleNext = () => {
    playPop();
    if (currentIdx < TRAP_CHALLENGES.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(0);
    }
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

        <span style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: '800' }}>
          Trap Challenge {currentIdx + 1} of {TRAP_CHALLENGES.length} • Fix the Letter Swap
        </span>
      </div>

      {/* Main Challenge Card */}
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
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%',
          background: 'white'
        }}
      >
        <div style={{ fontSize: '3.6rem', animation: 'gentle-bounce 3s infinite ease-in-out' }}>
          {challenge.visualClue}
        </div>

        {/* Sentence Prompt */}
        <div
          style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '2px solid #FDE68A',
            borderRadius: '22px',
            padding: '1.5rem 1.25rem',
            width: '100%',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Fill in the missing word:
            </span>
            <button
              onClick={() => speakText(challenge.sentence.replace('____', 'blank'), 'en-US')}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#B45309'
              }}
              title="Hear sentence"
            >
              <Volume2 size={16} />
            </button>
          </div>

          <h2 style={{ fontSize: '1.55rem', color: '#78350F', margin: 0, fontFamily: "'Lexend', sans-serif", lineHeight: 1.4 }}>
            {challenge.sentence.split('____')[0]}
            <span
              style={{
                display: 'inline-block',
                minWidth: '90px',
                borderBottom: '3px dashed #B45309',
                color: selectedOption ? (selectedOption === challenge.targetWord ? '#065F46' : '#DC2626') : '#B45309',
                fontWeight: '800',
                padding: '0 0.4rem'
              }}
            >
              {selectedOption || '____'}
            </span>
            {challenge.sentence.split('____')[1]}
          </h2>
        </div>

        {/* 2 Choice Cards (One Correct, One Letter Swap Trap) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
          {shuffledOptions.map((opt) => {
            const isSelected = selectedOption === opt;
            const isCorrect = isSelected && opt === challenge.targetWord;
            const isWrong = isSelected && opt !== challenge.targetWord;

            return (
              <button
                key={opt}
                onClick={() => handleSelectOption(opt)}
                disabled={selectedOption !== null}
                style={{
                  padding: '1.5rem 1rem',
                  borderRadius: '20px',
                  border: isCorrect
                    ? '3px solid #10B981'
                    : isWrong
                    ? '3px solid #EF4444'
                    : '2px solid #E2E8F0',
                  background: isCorrect
                    ? '#D1FAE5'
                    : isWrong
                    ? '#FEE2E2'
                    : 'white',
                  cursor: selectedOption ? 'default' : 'pointer',
                  fontSize: '2rem',
                  fontWeight: '800',
                  fontFamily: "'Lexend', sans-serif",
                  color: isCorrect ? '#065F46' : isWrong ? '#991B1B' : '#1E293B',
                  boxShadow: isCorrect
                    ? '0 0 16px rgba(16, 185, 129, 0.4)'
                    : isWrong
                    ? '0 0 12px rgba(239, 68, 68, 0.3)'
                    : '0 4px 12px rgba(0,0,0,0.05)',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              background: feedback.type === 'success' ? '#D1FAE5' : '#FEF3C7',
              color: feedback.type === 'success' ? '#065F46' : '#92400E',
              border: feedback.type === 'success' ? '2px solid #10B981' : '2px solid #F59E0B',
              fontSize: '0.95rem',
              fontWeight: '700',
              textAlign: 'left'
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Next Button */}
        {selectedOption && (
          <button
            onClick={handleNext}
            className="btn btn-primary"
            style={{
              borderRadius: '9999px',
              padding: '0.75rem 2rem',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#4F46E5'
            }}
          >
            <span>Next Trap Challenge ➔</span>
          </button>
        )}
      </div>
    </div>
  );
}
