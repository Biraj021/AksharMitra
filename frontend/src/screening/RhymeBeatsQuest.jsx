import React, { useState } from 'react';
import { Volume2, CheckCircle, ArrowRight, Music, Sparkles } from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

const RHYME_BEAT_QUESTIONS_EN = [
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

const RHYME_BEAT_QUESTIONS_BN = [
  {
    id: 'rb_bn_1',
    type: 'rhyme_match',
    targetWord: 'জল',
    emoji: '💧',
    instruction: '"জল" শব্দের সাথে কোন শব্দের ছন্দ মেলে?',
    audioPrompt: 'জল শব্দের সাথে কোন শব্দের মিল আছে? ফল, গাছ, নাকি চাঁদ?',
    options: [
      { id: '1', word: 'ফল', emoji: '🍎', isCorrect: true },
      { id: '2', word: 'গাছ', emoji: '🌳', isCorrect: false },
      { id: '3', word: 'চাঁদ', emoji: '🌙', isCorrect: false }
    ]
  },
  {
    id: 'rb_bn_2',
    type: 'rhyme_match',
    targetWord: 'বই',
    emoji: '📖',
    instruction: '"বই" শব্দের সাথে কোন শব্দের ছন্দ মেলে?',
    audioPrompt: 'বই শব্দের সাথে কোন শব্দের মিল আছে? দই, পাখি, নাকি নদী?',
    options: [
      { id: '1', word: 'দই', emoji: '🥣', isCorrect: true },
      { id: '2', word: 'পাখি', emoji: '🦜', isCorrect: false },
      { id: '3', word: 'নদী', emoji: '🌊', isCorrect: false }
    ]
  },
  {
    id: 'rb_bn_3',
    type: 'syllable_beat',
    word: 'প্রজাপতি',
    emoji: '🦋',
    syllables: 'প্র - জা - প - তি',
    syllableCount: 4,
    instruction: '"প্র-জা-প-তি" শব্দে কয়টি তালের শব্দাংশ আছে?',
    audioPrompt: 'প্রজাপতি শব্দে কয়টি শব্দাংশের তাল আছে? প্র জা প তি।',
    options: [1, 2, 3, 4]
  },
  {
    id: 'rb_bn_4',
    type: 'syllable_beat',
    word: 'আম',
    emoji: '🥭',
    syllables: 'আম',
    syllableCount: 1,
    instruction: '"আম" শব্দে কয়টি তালের শব্দাংশ আছে?',
    audioPrompt: 'আম শব্দে কয়টি তালের শব্দাংশ আছে?',
    options: [1, 2, 3]
  }
];

const RHYME_BEAT_QUESTIONS_HI = [
  {
    id: 'rb_hi_1',
    type: 'rhyme_match',
    targetWord: 'जल',
    emoji: '💧',
    instruction: '"जल" शब्द से किस शब्द की तुकबंदी मिलती है?',
    audioPrompt: 'जल शब्द से किस शब्द की तुकबंदी मिलती है? फल, पेड़, या चाँद?',
    options: [
      { id: '1', word: 'फल', emoji: '🍎', isCorrect: true },
      { id: '2', word: 'पेड़', emoji: '🌳', isCorrect: false },
      { id: '3', word: 'चाँद', emoji: '🌙', isCorrect: false }
    ]
  },
  {
    id: 'rb_hi_2',
    type: 'rhyme_match',
    targetWord: 'रात',
    emoji: '🌙',
    instruction: '"रात" शब्द से किस शब्द की तुकबंदी मिलती है?',
    audioPrompt: 'रात शब्द से किस शब्द की तुकबंदी मिलती है? बात, चिड़िया, या नदी?',
    options: [
      { id: '1', word: 'बात', emoji: '🗣️', isCorrect: true },
      { id: '2', word: 'चिड़िया', emoji: '🦜', isCorrect: false },
      { id: '3', word: 'नदी', emoji: '🌊', isCorrect: false }
    ]
  },
  {
    id: 'rb_hi_3',
    type: 'syllable_beat',
    word: 'तितली',
    emoji: '🦋',
    syllables: 'ति - त - ली',
    syllableCount: 3,
    instruction: '"ति-त-ली" शब्द में ताल की कितनी ध्वनियाँ हैं?',
    audioPrompt: 'तितली शब्द में ताल की कितनी ध्वनियाँ हैं? ति त ली।',
    options: [1, 2, 3, 4]
  },
  {
    id: 'rb_hi_4',
    type: 'syllable_beat',
    word: 'आम',
    emoji: '🥭',
    syllables: 'आम',
    syllableCount: 1,
    instruction: '"आम" शब्द में ताल की कितनी ध्वनियाँ हैं?',
    audioPrompt: 'आम शब्द में ताल की कितनी ध्वनियाँ हैं?',
    options: [1, 2, 3]
  }
];

export default function RhymeBeatsQuest({ onCompleteQuest }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { activeLanguage } = useProfile();
  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');
  const questions = isHindi ? RHYME_BEAT_QUESTIONS_HI : (isBengali ? RHYME_BEAT_QUESTIONS_BN : RHYME_BEAT_QUESTIONS_EN);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptId, setSelectedOptId] = useState(null);
  const [answers, setAnswers] = useState({}); // { [questionIdx]: boolean }
  const [status, setStatus] = useState('active'); // 'active' | 'completed_step'

  const currentQ = questions[currentIdx] || questions[0];

  const handlePickRhyme = (opt) => {
    playPop();
    setSelectedOptId(opt.id);
    setStatus('completed_step');

    if (opt.isCorrect) {
      playChime(650);
      playStarTwinkle();
      setAnswers((prev) => ({ ...prev, [currentIdx]: true }));
    } else {
      playChime(320);
      setAnswers((prev) => ({ ...prev, [currentIdx]: false }));
    }
  };

  const handlePickSyllable = (count) => {
    playPop();
    setSelectedOptId(count);
    setStatus('completed_step');

    if (count === currentQ.syllableCount) {
      playChime(650);
      playStarTwinkle();
      setAnswers((prev) => ({ ...prev, [currentIdx]: true }));
    } else {
      playChime(320);
      setAnswers((prev) => ({ ...prev, [currentIdx]: false }));
    }
  };

  const handleNextStep = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptId(null);
      setStatus('active');
    } else {
      const totalPossible = questions.length;
      const correctTotal = Object.values(answers).filter(Boolean).length;
      const score = Math.round((correctTotal / totalPossible) * 100);

      onCompleteQuest({
        questId: 'rhyme_beats',
        score: Math.min(100, Math.max(0, score)),
        syllableAccuracy: Math.min(100, Math.max(0, score))
      });
    }
  };

  return (
    <div
      className="holo-explorer-card"
      style={{
        padding: '2rem 1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.4rem',
        textAlign: 'center'
      }}
    >
      {/* Round Header & Audio Prompt */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="hud-chip hud-chip-mint" style={{ fontSize: '0.85rem' }}>
          {isHindi ? `राउंड 2: तुकबंदी और ताल (${currentIdx + 1}/${questions.length})` : (isBengali ? `পর্ব ২: ছন্দ ও সুরের তাল (${currentIdx + 1}/${questions.length})` : `Round 2: Rhyme & Beats (${currentIdx + 1}/${questions.length})`)}
        </span>
        <button
          onClick={() => speakText(currentQ.audioPrompt, speechLang)}
          style={{
            background: '#F0F9FF',
            border: '1.5px solid #BAE6FD',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0284C7'
          }}
          title={isHindi ? 'सुनें' : (isBengali ? 'শুনুন' : 'Listen')}
        >
          <Volume2 size={18} />
        </button>
      </div>

      <div style={{ fontSize: '3.8rem', margin: '0.2rem 0', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>
        {currentQ.emoji}
      </div>

      <h3 style={{ fontSize: '1.25rem', color: '#1E293B', margin: 0, fontWeight: 900, lineHeight: 1.4 }}>
        {currentQ.instruction}
      </h3>

      {/* Mode 1: Rhyme Word Options with 3D tactile buttons */}
      {currentQ.type === 'rhyme_match' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', width: '100%' }}>
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptId === opt.id;
            const isCorrect = opt.isCorrect;

            return (
              <button
                key={opt.id}
                onClick={() => handlePickRhyme(opt)}
                className="quest-island-card"
                style={{
                  padding: '1.25rem 0.6rem',
                  borderRadius: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.45rem',
                  border: isSelected
                    ? isCorrect
                      ? '3px solid #10B981'
                      : '3px solid #F59E0B'
                    : '2px solid #E2E8F0',
                  background: isSelected
                    ? isCorrect
                      ? '#D1FAE5'
                      : '#FEF3C7'
                    : '#F8FAFC',
                  color: isSelected
                    ? isCorrect
                      ? '#047857'
                      : '#92400E'
                    : '#1E293B',
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isSelected
                    ? isCorrect
                      ? '0 6px 16px rgba(16, 185, 129, 0.3)'
                      : '0 6px 16px rgba(245, 158, 11, 0.3)'
                    : '0 4px 10px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '2.2rem' }}>{opt.emoji}</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1E293B', fontFamily: isBengali ? 'var(--font-bengali)' : "'Lexend', sans-serif" }}>
                  {opt.word}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Mode 2: Syllable Clapping Beat Numbers with 3D tactile candy pads */}
      {currentQ.type === 'syllable_beat' && (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', width: '100%' }}>
          {currentQ.options.map((num) => {
            const isSelected = selectedOptId === num;
            const isCorrect = num === currentQ.syllableCount;

            let stateClass = '';
            if (isSelected) {
              stateClass = isCorrect ? 'is-hint-target' : 'incorrect';
            }

            return (
              <button
                key={num}
                onClick={() => handlePickSyllable(num)}
                className={`candy-tile-3d ${stateClass}`}
                style={{
                  width: '74px',
                  height: '74px',
                  fontSize: '2rem'
                }}
              >
                {num}
              </button>
            );
          })}
        </div>
      )}

      {/* Next Step 3D Button */}
      {status === 'completed_step' && (
        <div style={{ marginTop: '0.75rem' }}>
          <button
            onClick={handleNextStep}
            className="btn-3d-mint"
            style={{
              width: '100%',
              padding: '0.9rem',
              fontSize: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{isBengali ? 'পরবর্তী ধাপে এগিয়ে যাও' : 'Continue to Next'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
