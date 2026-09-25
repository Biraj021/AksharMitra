import React, { useState } from 'react';
import { Volume2, Sparkles, CheckCircle, ArrowRight, Music } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const RHYME_TASKS = [
  {
    id: 'rhyme_1',
    type: 'rhyme_match',
    targetWord: 'Cat 🐱',
    targetPhoneme: '-at',
    audioInstruction: 'Which word rhymes with Cat? Hat, Dog, or Sun?',
    options: [
      { id: 'opt_1', text: 'Hat 🎩', isCorrect: true },
      { id: 'opt_2', text: 'Dog 🐶', isCorrect: false },
      { id: 'opt_3', text: 'Sun ☀️', isCorrect: false }
    ]
  },
  {
    id: 'rhyme_2',
    type: 'syllable_drum',
    targetWord: 'Ba-na-na 🍌',
    syllables: 3,
    audioInstruction: 'Tap the magical drum 3 times for each syllable in Ba-na-na!',
    hint: 'Tap 3 beats: Ba - na - na'
  }
];

export default function RhymeClapQuest({ onCompleteQuest }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars } = useProfile();

  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [drumTaps, setDrumTaps] = useState(0);
  const [taskStatus, setTaskStatus] = useState('idle'); // 'idle' | 'success'

  const task = RHYME_TASKS[currentTaskIdx];

  const handleSelectOption = (opt) => {
    setSelectedOption(opt.id);
    if (opt.isCorrect) {
      playStarTwinkle();
      setTaskStatus('success');
      addStars(5);

      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    } else {
      playChime(320);
      speakText('Almost! Listen carefully to the ending sound!');
    }
  };

  const handleDrumTap = () => {
    const nextTaps = drumTaps + 1;
    setDrumTaps(nextTaps);
    playPop();
    playChime(500 + nextTaps * 60);

    if (nextTaps === task.syllables) {
      playStarTwinkle();
      setTaskStatus('success');
      addStars(5);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }
  };

  const handleNextTask = () => {
    playPop();
    if (currentTaskIdx < RHYME_TASKS.length - 1) {
      setCurrentTaskIdx(currentTaskIdx + 1);
      setSelectedOption(null);
      setDrumTaps(0);
      setTaskStatus('idle');
    } else {
      if (onCompleteQuest) {
        onCompleteQuest({
          questId: 'phonological',
          score: 90
        });
      }
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.75rem',
        maxWidth: '560px',
        margin: '0 auto',
        width: '100%',
        textAlign: 'center',
        borderRadius: '28px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🥁</span>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#1E293B' }}>Quest 3: Sound & Beat Match</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0 }}>
              Puzzle {currentTaskIdx + 1} of {RHYME_TASKS.length}
            </p>
          </div>
        </div>

        <button
          onClick={() => speakText(task.audioInstruction)}
          style={{
            background: '#EEF2FF',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#4F46E5'
          }}
          title="Hear sound prompt"
        >
          <Volume2 size={18} />
        </button>
      </div>

      {/* Target Challenge */}
      {task.type === 'rhyme_match' && (
        <div>
          <div
            style={{
              background: '#FEF3C7',
              padding: '1.25rem',
              borderRadius: '20px',
              border: '1.5px solid #FDE68A',
              marginBottom: '1.5rem'
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#92400E', fontWeight: 'bold' }}>Find the Rhyme for:</span>
            <h2 style={{ fontSize: '2rem', color: '#B45309', margin: '0.25rem 0 0' }}>{task.targetWord}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {task.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: '1rem 0.5rem',
                    borderRadius: '16px',
                    border: isSelected ? (opt.isCorrect ? '3px solid #10B981' : '3px solid #F59E0B') : '2px solid #E2E8F0',
                    background: isSelected ? (opt.isCorrect ? '#D1FAE5' : '#FEF3C7') : 'white',
                    cursor: 'pointer',
                    fontSize: '1.15rem',
                    fontWeight: '700',
                    color: '#1E293B',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Syllable Drum Challenge */}
      {task.type === 'syllable_drum' && (
        <div>
          <div
            style={{
              background: '#EEF2FF',
              padding: '1rem',
              borderRadius: '20px',
              border: '1.5px solid #C7D2FE',
              marginBottom: '1.25rem'
            }}
          >
            <h2 style={{ fontSize: '1.8rem', color: '#4338CA', margin: '0 0 0.25rem' }}>{task.targetWord}</h2>
            <p style={{ fontSize: '0.85rem', color: '#4F46E5', margin: 0, fontWeight: '600' }}>{task.hint}</p>
          </div>

          {/* Interactive Drum */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              onClick={handleDrumTap}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                border: '6px solid white',
                boxShadow: '0 12px 24px rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
                userSelect: 'none'
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              🥁
            </button>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: drumTaps >= num ? '#10B981' : '#CBD5E1',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {taskStatus === 'success' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            color: '#059669',
            fontWeight: '700',
            fontSize: '1rem',
            marginBottom: '1rem'
          }}
        >
          <CheckCircle size={20} color="#10B981" />
          <span>Super ear! You got the beat! (+5 ⭐)</span>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleNextTask}
          className="btn btn-primary btn-pill"
          style={{ gap: '0.4rem' }}
        >
          <span>{currentTaskIdx < RHYME_TASKS.length - 1 ? 'Next Beat' : 'Finish All Quests! 🎉'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
