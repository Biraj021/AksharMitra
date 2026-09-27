import React, { useState, useEffect } from 'react';
import { Home, Volume2, ThumbsUp, ThumbsDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';

const RHYME_DATA = {
  english: [
    { item1: { word: 'Cat', emoji: '🐱' }, item2: { word: 'Hat', emoji: '🎩' }, rhymes: true },
    { item1: { word: 'Dog', emoji: '🐶' }, item2: { word: 'Frog', emoji: '🐸' }, rhymes: true },
    { item1: { word: 'Sun', emoji: '☀️' }, item2: { word: 'Bun', emoji: '🍞' }, rhymes: true },
    { item1: { word: 'Star', emoji: '⭐' }, item2: { word: 'Car', emoji: '🚗' }, rhymes: true },
    { item1: { word: 'Fox', emoji: '🦊' }, item2: { word: 'Box', emoji: '📦' }, rhymes: true },
    { item1: { word: 'Fish', emoji: '🐟' }, item2: { word: 'Tree', emoji: '🌳' }, rhymes: false },
    { item1: { word: 'Moon', emoji: '🌙' }, item2: { word: 'Spoon', emoji: '🥄' }, rhymes: true },
    { item1: { word: 'Duck', emoji: '🦆' }, item2: { word: 'Truck', emoji: '🚚' }, rhymes: true },
    { item1: { word: 'Bear', emoji: '🐻' }, item2: { word: 'Chair', emoji: '🪑' }, rhymes: true },
    { item1: { word: 'Apple', emoji: '🍎' }, item2: { word: 'Shoe', emoji: '👟' }, rhymes: false }
  ],
  bengali: [
    { item1: { word: 'জল', emoji: '💧' }, item2: { word: 'ফল', emoji: '🍎' }, rhymes: true },
    { item1: { word: 'হাঁস', emoji: '🦆' }, item2: { word: 'ঘাস', emoji: '🌿' }, rhymes: true },
    { item1: { word: 'ফুল', emoji: '🌸' }, item2: { word: 'কুল', emoji: '🍓' }, rhymes: true },
    { item1: { word: 'পাখি', emoji: '🐦' }, item2: { word: 'আঁখি', emoji: '👁️' }, rhymes: true },
    { item1: { word: 'গাড়ি', emoji: '🚗' }, item2: { word: 'বাড়ি', emoji: '🏠' }, rhymes: true },
    { item1: { word: 'চাঁদ', emoji: '🌙' }, item2: { word: 'ফুল', emoji: '🌸' }, rhymes: false },
    { item1: { word: 'ছাতা', emoji: '☂️' }, item2: { word: 'পাতা', emoji: '🍃' }, rhymes: true },
    { item1: { word: 'মাছ', emoji: '🐟' }, item2: { word: 'গাছ', emoji: '🌳' }, rhymes: true },
    { item1: { word: 'তালা', emoji: '🔒' }, item2: { word: 'মালা', emoji: '📿' }, rhymes: true },
    { item1: { word: 'হাতি', emoji: '🐘' }, item2: { word: 'বই', emoji: '📚' }, rhymes: false }
  ],
  hindi: [
    { item1: { word: 'कार', emoji: '🚗' }, item2: { word: 'तार', emoji: '⭐' }, rhymes: true },
    { item1: { word: 'जल', emoji: '💧' }, item2: { word: 'फल', emoji: '🍎' }, rhymes: true },
    { item1: { word: 'फूल', emoji: '🌸' }, item2: { word: 'धूल', emoji: '🌪️' }, rhymes: true },
    { item1: { word: 'मोर', emoji: '🦚' }, item2: { word: 'चोर', emoji: '🦊' }, rhymes: true },
    { item1: { word: 'रात', emoji: '🌙' }, item2: { word: 'बात', emoji: '💬' }, rhymes: true },
    { item1: { word: 'मछली', emoji: '🐟' }, item2: { word: 'पेड़', emoji: '🌳' }, rhymes: false },
    { item1: { word: 'हाथी', emoji: '🐘' }, item2: { word: 'साथी', emoji: '🤝' }, rhymes: true },
    { item1: { word: 'ताला', emoji: '🔒' }, item2: { word: 'माला', emoji: '📿' }, rhymes: true },
    { item1: { word: 'शेर', emoji: '🦁' }, item2: { word: 'बेर', emoji: '🍒' }, rhymes: true },
    { item1: { word: 'सेब', emoji: '🍎' }, item2: { word: 'जूता', emoji: '👟' }, rhymes: false }
  ]
};

const STORAGE_RHYME_SEEN_KEY = 'aksharmitra_explorer_rhyme_seen';

export default function RhymeParty({ onBack }) {
  const { activeLanguage, t } = useProfile();
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();

  const langKey = activeLanguage?.id === 'hindi' ? 'hindi' : (activeLanguage?.id === 'bengali' ? 'bengali' : 'english');
  const speechLang = langKey === 'hindi' ? 'hi-IN' : (langKey === 'bengali' ? 'bn-IN' : 'en-US');

  const pairsList = RHYME_DATA[langKey] || RHYME_DATA.english;

  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const seen = JSON.parse(localStorage.getItem(STORAGE_RHYME_SEEN_KEY) || '[]');
      const available = pairsList.map((_, i) => i).filter((i) => !seen.includes(i));
      if (available.length > 0) return available[Math.floor(Math.random() * available.length)];
    } catch (e) {}
    return 0;
  });

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [wobbleAnswer, setWobbleAnswer] = useState(null);

  const currentPair = pairsList[currentIndex] || pairsList[0];

  // Prompt speech
  const playPrompt = () => {
    playChime(494);
    const qText = langKey === 'hindi'
      ? `${currentPair.item1.word}... ${currentPair.item2.word}! क्या इनकी तुक मिलती है?`
      : (langKey === 'bengali'
          ? `${currentPair.item1.word}... ${currentPair.item2.word}! এরা কি ছন্দে মেলে?`
          : `${currentPair.item1.word}... ${currentPair.item2.word}! Do these rhyme?`);
    speakText(qText, speechLang);
  };

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswerCorrect(false);
    setWobbleAnswer(null);

    const timer = setTimeout(() => {
      playPrompt();
    }, 350);

    return () => clearTimeout(timer);
  }, [currentIndex, langKey]);

  const handleCardClick = (item) => {
    playPop();
    speakText(item.word, speechLang);
  };

  const handleAnswer = (userChoice) => {
    playPop();
    setSelectedAnswer(userChoice);

    const isMatch = userChoice === currentPair.rhymes;

    if (isMatch) {
      setIsAnswerCorrect(true);
      playStarTwinkle();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      const praise = currentPair.rhymes
        ? (langKey === 'hindi'
            ? `हाँ! ${currentPair.item1.word} और ${currentPair.item2.word} की तुक मिलती है!`
            : (langKey === 'bengali'
                ? `হ্যাঁ! ${currentPair.item1.word} এবং ${currentPair.item2.word} ছন্দে মেলে!`
                : `Yes! ${currentPair.item1.word} and ${currentPair.item2.word} rhyme!`))
        : (langKey === 'hindi'
            ? `सही! इनकी आवाज़ नहीं मिलती!`
            : (langKey === 'bengali'
                ? `ঠিক! এরা ছন্দে মেলে না!`
                : `Right! They do not sound alike!`));

      speakText(praise, speechLang);

      // Local variety cache
      try {
        const seen = JSON.parse(localStorage.getItem(STORAGE_RHYME_SEEN_KEY) || '[]');
        const updated = [...new Set([...seen, currentIndex])];
        if (updated.length >= pairsList.length) {
          localStorage.setItem(STORAGE_RHYME_SEEN_KEY, JSON.stringify([currentIndex]));
        } else {
          localStorage.setItem(STORAGE_RHYME_SEEN_KEY, JSON.stringify(updated));
        }
      } catch (e) {}

      setTimeout(() => {
        let nextIdx = (currentIndex + 1) % pairsList.length;
        setCurrentIndex(nextIdx);
      }, 1800);
    } else {
      // Gentle Try Again — no score deduction, no counter
      setWobbleAnswer(userChoice);
      playChime(320);
      const hint = langKey === 'hindi'
        ? `फिर से सुनो: ${currentPair.item1.word}... ${currentPair.item2.word}!`
        : (langKey === 'bengali'
            ? `আবার শোনো: ${currentPair.item1.word}... ${currentPair.item2.word}!`
            : `Listen again: ${currentPair.item1.word}... ${currentPair.item2.word}!`);
      speakText(hint, speechLang);
      setTimeout(() => {
        setWobbleAnswer(null);
      }, 700);
    }
  };

  return (
    <div
      className="little-explorer-activity"
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '1rem 1rem 3rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem'
      }}
    >
      {/* Top Bar with Big Home Button */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <button
          type="button"
          onClick={() => {
            playPop();
            if (onBack) onBack();
          }}
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: '9999px',
            padding: '0.65rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 800,
            color: '#475569',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <Home size={22} color="#64748B" />
          <span>{t('explorerBackHome')}</span>
        </button>

        {/* Audio Replay Button */}
        <button
          type="button"
          onClick={playPrompt}
          style={{
            background: '#FCE7F3',
            border: '2px solid #F472B6',
            borderRadius: '9999px',
            padding: '0.65rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 800,
            color: '#BE185D',
            boxShadow: '0 2px 8px rgba(244, 114, 182, 0.2)'
          }}
        >
          <Volume2 size={22} color="#BE185D" />
          <span>{t('explorerListenAgain')}</span>
        </button>
      </div>

      {/* Side-by-side Picture Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.25rem',
          width: '100%',
          maxWidth: '520px',
          marginTop: '0.25rem'
        }}
      >
        {[currentPair.item1, currentPair.item2].map((item, idx) => (
          <div
            key={idx}
            onClick={() => handleCardClick(item)}
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF1F2 100%)',
              border: '3px solid #FDA4AF',
              borderRadius: '32px',
              padding: '1.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(244, 63, 94, 0.1)',
              transition: 'transform 0.18s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={{ fontSize: '4.5rem', lineHeight: 1 }}>{item.emoji}</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#9F1239' }}>
              {item.word}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#BE185D', fontWeight: 700 }}>
              🔊 {t('explorerTapToHear')}
            </span>
          </div>
        ))}
      </div>

      {/* Big Question Prompt */}
      <div
        onClick={playPrompt}
        style={{
          background: '#FFF1F2',
          border: '2px solid #FECDD3',
          borderRadius: '20px',
          padding: '0.85rem 1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(244, 63, 94, 0.08)'
        }}
      >
        <span style={{ fontSize: '1.4rem' }}>🎈</span>
        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#BE185D' }}>
          {t('explorerDoTheyRhyme')}
        </span>
        <Volume2 size={20} color="#BE185D" />
      </div>

      {/* Giant Yes / No Action Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.25rem',
          width: '100%',
          maxWidth: '480px',
          marginTop: '0.5rem'
        }}
      >
        {/* YES BUTTON */}
        <button
          type="button"
          onClick={() => handleAnswer(true)}
          style={{
            background: isAnswerCorrect && selectedAnswer === true ? '#BBF7D0' : '#DCFCE7',
            border: isAnswerCorrect && selectedAnswer === true
              ? '4px solid #16A34A'
              : wobbleAnswer === true
              ? '4px solid #F87171'
              : '3px solid #86EFAC',
            borderRadius: '28px',
            padding: '1.25rem 1rem',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(22, 163, 74, 0.15)',
            transform: isAnswerCorrect && selectedAnswer === true ? 'scale(1.06)' : wobbleAnswer === true ? 'translateX(-6px)' : 'scale(1)',
            transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
            touchAction: 'manipulation'
          }}
        >
          <ThumbsUp size={36} color="#15803D" strokeWidth={2.5} />
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#15803D' }}>
            {t('explorerYes')}
          </span>
        </button>

        {/* NO BUTTON */}
        <button
          type="button"
          onClick={() => handleAnswer(false)}
          style={{
            background: isAnswerCorrect && selectedAnswer === false ? '#DDD6FE' : '#EDE9FE',
            border: isAnswerCorrect && selectedAnswer === false
              ? '4px solid #7C3AED'
              : wobbleAnswer === false
              ? '4px solid #F87171'
              : '3px solid #C4B5FD',
            borderRadius: '28px',
            padding: '1.25rem 1rem',
            minHeight: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(124, 58, 237, 0.15)',
            transform: isAnswerCorrect && selectedAnswer === false ? 'scale(1.06)' : wobbleAnswer === false ? 'translateX(-6px)' : 'scale(1)',
            transition: 'all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
            touchAction: 'manipulation'
          }}
        >
          <ThumbsDown size={36} color="#6D28D9" strokeWidth={2.5} />
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#6D28D9' }}>
            {t('explorerNo')}
          </span>
        </button>
      </div>
    </div>
  );
}
