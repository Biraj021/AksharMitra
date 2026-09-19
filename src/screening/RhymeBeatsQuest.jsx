import React, { useState } from 'react';
import { Volume2, CheckCircle, ArrowRight } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const RHYME_BEAT_QUESTIONS = [
  {
    id: 'rb_1',
    type: 'rhyme_match',
    targetWord: 'Cat',
    emoji: '🐱',
    instruction: 'Which word rhymes with Cat?',
    audioPrompt: 'Which word rhymes with Cat? Hat, Dog, or Sun?',
    options: [
      { id: '1', word: 'Hat', emoji: '🎩', isCorrect: true },
      { id: '2', word: 'Dog', emoji: '🐶', isCorrect: false },
      { id: '3', word: 'Sun', emoji: '☀️', isCorrect: false }
    ]
  },
  {
    id: 'rb_2',
    type: 'rhyme_match',
    targetWord: 'Frog',
    emoji: '🐸',
    instruction: 'Which word rhymes with Frog?',
    audioPrompt: 'Which word rhymes with Frog? Star, Dog, or Fish?',
    options: [
      { id: '1', word: 'Star', emoji: '⭐', isCorrect: false },
      { id: '2', word: 'Dog', emoji: '🐶', isCorrect: true },
      { id: '3', word: 'Fish', emoji: '🐟', isCorrect: false }
    ]
  },
  {
    id: 'rb_3',
    type: 'syllable_beat',
    word: 'Elephant',
    emoji: '🐘',
    syllables: 'El - e - phant',
    syllableCount: 3,
    instruction: 'How many claps / beats in El-e-phant?',
    audioPrompt: 'How many syllable beats in Elephant? El e phant.',
    options: [1, 2, 3, 4]
  },
  {
    id: 'rb_4',
    type: 'syllable_beat',
    word: 'Sun',
    emoji: '☀️',
    syllables: 'Sun',
    syllableCount: 1,
    instruction: 'How many claps / beats in Sun?',
    audioPrompt: 'How many syllable beats in Sun?',
    options: [1, 2, 3]
  }
];

export default function RhymeBeatsQuest({ onCompleteQuest }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptId, setSelectedOptId] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [status, setStatus] = useState('active'); // 'active' | 'completed_step'

  const currentQ = RHYME_BEAT_QUESTIONS[currentIdx];

  const handlePickRhyme = (opt) => {
    playPop();
    setSelectedOptId(opt.id);

    if (opt.isCorrect) {
      playChime(650);
      setCorrectCount((prev) => prev + 1);
      setStatus('completed_step');
      playStarTwinkle();
    } else {
      playChime(320);
      speakText(`${opt.word} does not rhyme with ${currentQ.targetWord}. Try another!`);
    }
  };

  const handlePickSyllable = (count) => {
    playPop();
    setSelectedOptId(count);

    if (count === currentQ.syllableCount) {
      playChime(650);
      setCorrectCount((prev) => prev + 1);
      setStatus('completed_step');
      playStarTwinkle();
    } else {
      playChime(320);
      speakText(`Listen to the beats: ${currentQ.syllables}. Try again!`);
    }
  };

  const handleNextStep = () => {
    if (currentIdx + 1 < RHYME_BEAT_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptId(null);
      setStatus('active');
    } else {
      // Finalize Round 2 Metrics
      const totalPossible = RHYME_BEAT_QUESTIONS.length;
      const score = Math.round((correctCount / totalPossible) * 100);

      onCompleteQuest({
        questId: 'rhyme_beats',
        score: Math.min(100, Math.max(0, score)),
        syllableAccuracy: Math.min(100, Math.max(0, score))
      });
    }
  };

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
        gap: '1.25rem',
        textAlign: 'center'
      }}
    >
      {/* Round Header & Audio Prompt */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0284C7', background: '#E0F2FE', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
          Round 2: Rhyme & Beats ({currentIdx + 1}/4)
        </span>
        <button
          onClick={() => speakText(currentQ.audioPrompt)}
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
        >
          <Volume2 size={16} color="#0284C7" />
        </button>
      </div>

      <div style={{ fontSize: '3.5rem', margin: '0.2rem 0' }}>{currentQ.emoji}</div>

      <h3 style={{ fontSize: '1.15rem', color: '#1E293B', margin: 0, fontWeight: 800 }}>
        {currentQ.instruction}
      </h3>

      {/* Mode 1: Rhyme Word Options */}
      {currentQ.type === 'rhyme_match' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', width: '100%' }}>
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptId === opt.id;
            const isCorrect = opt.isCorrect;

            return (
              <button
                key={opt.id}
                onClick={() => handlePickRhyme(opt)}
                style={{
                  padding: '1rem 0.5rem',
                  borderRadius: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: isSelected && isCorrect ? '3px solid #10B981' : '2px solid #E2E8F0',
                  background: isSelected && isCorrect ? '#D1FAE5' : '#F8FAFC',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '1.8rem' }}>{opt.emoji}</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B', fontFamily: "'Lexend', sans-serif" }}>
                  {opt.word}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mode 2: Syllable Clapping Beat Numbers */}
      {currentQ.type === 'syllable_beat' && (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', width: '100%' }}>
          {currentQ.options.map((num) => {
            const isSelected = selectedOptId === num;
            const isCorrect = num === currentQ.syllableCount;

            return (
              <button
                key={num}
                onClick={() => handlePickSyllable(num)}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  fontFamily: "'Lexend', sans-serif",
                  border: isSelected && isCorrect ? '3px solid #10B981' : '2px solid #E2E8F0',
                  background: isSelected && isCorrect ? '#D1FAE5' : '#F8FAFC',
                  color: isSelected && isCorrect ? '#047857' : '#1E293B',
                  cursor: 'pointer',
                  boxShadow: isSelected && isCorrect ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
                }}
              >
                {num}
              </button>
            );
          })}
        </div>
      )}

      {/* Next Step Banner */}
      {status === 'completed_step' && (
        <div style={{ marginTop: '0.5rem' }}>
          <button
            onClick={handleNextStep}
            className="animate-pulse-glow"
            style={{
              width: '100%',
              background: '#0284C7',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.75rem',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}
          >
            <span>Continue to Next</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
