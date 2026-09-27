import React, { useState, useEffect } from 'react';
import { Home, ArrowLeft, ArrowRight, Volume2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';

const VOCAB_ITEMS = [
  {
    id: 'elephant',
    emoji: '🐘',
    color: '#E0E7FF',
    borderColor: '#818CF8',
    textColor: '#3730A3',
    names: { english: 'Elephant', bengali: 'হাতি', hindi: 'हाथी' }
  },
  {
    id: 'apple',
    emoji: '🍎',
    color: '#FFE4E6',
    borderColor: '#FB7185',
    textColor: '#9F1239',
    names: { english: 'Apple', bengali: 'আপেল', hindi: 'सेब' }
  },
  {
    id: 'sun',
    emoji: '☀️',
    color: '#FEF3C7',
    borderColor: '#FBBF24',
    textColor: '#92400E',
    names: { english: 'Sun', bengali: 'সূর্য', hindi: 'सूरज' }
  },
  {
    id: 'butterfly',
    emoji: '🦋',
    color: '#EDE9FE',
    borderColor: '#A78BFA',
    textColor: '#5B21B6',
    names: { english: 'Butterfly', bengali: 'প্রজাপতি', hindi: 'तितली' }
  },
  {
    id: 'tree',
    emoji: '🌳',
    color: '#DCFCE7',
    borderColor: '#4ADE80',
    textColor: '#166534',
    names: { english: 'Tree', bengali: 'গাছ', hindi: 'पेड़' }
  },
  {
    id: 'bird',
    emoji: '🐦',
    color: '#E0F2FE',
    borderColor: '#38BDF8',
    textColor: '#075985',
    names: { english: 'Bird', bengali: 'পাখি', hindi: 'चिड़िया' }
  },
  {
    id: 'boat',
    emoji: '⛵',
    color: '#CFFAFE',
    borderColor: '#22D3EE',
    textColor: '#155E75',
    names: { english: 'Boat', bengali: 'নৌকা', hindi: 'नाव' }
  },
  {
    id: 'moon',
    emoji: '🌙',
    color: '#FEF9C3',
    borderColor: '#FACC15',
    textColor: '#854D0E',
    names: { english: 'Moon', bengali: 'চাঁদ', hindi: 'चाँद' }
  },
  {
    id: 'flower',
    emoji: '🌸',
    color: '#FCE7F3',
    borderColor: '#F472B6',
    textColor: '#9D174D',
    names: { english: 'Flower', bengali: 'ফুল', hindi: 'फूल' }
  },
  {
    id: 'fish',
    emoji: '🐟',
    color: '#DBEAFE',
    borderColor: '#60A5FA',
    textColor: '#1E40AF',
    names: { english: 'Fish', bengali: 'মাছ', hindi: 'मछली' }
  }
];

export default function NameThatPicture({ onBack }) {
  const { activeLanguage, t } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();

  const langKey = activeLanguage?.id === 'hindi' ? 'hindi' : (activeLanguage?.id === 'bengali' ? 'bengali' : 'english');
  const speechLang = langKey === 'hindi' ? 'hi-IN' : (langKey === 'bengali' ? 'bn-IN' : 'en-US');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [bounce, setBounce] = useState(false);

  const currentItem = VOCAB_ITEMS[currentIndex] || VOCAB_ITEMS[0];
  const currentWord = currentItem.names[langKey] || currentItem.names.english;

  const speakItem = () => {
    playPop();
    setBounce(true);
    speakText(currentWord, speechLang);
    setTimeout(() => setBounce(false), 400);
  };

  // Speak word when navigating to a new item
  useEffect(() => {
    const timer = setTimeout(() => {
      speakText(currentWord, speechLang);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentIndex, langKey]);

  const handleNext = () => {
    playPop();
    setCurrentIndex((prev) => (prev + 1) % VOCAB_ITEMS.length);
  };

  const handlePrev = () => {
    playPop();
    setCurrentIndex((prev) => (prev - 1 + VOCAB_ITEMS.length) % VOCAB_ITEMS.length);
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

        {/* Audio Listen Button */}
        <button
          type="button"
          onClick={speakItem}
          style={{
            background: '#DCFCE7',
            border: '2px solid #86EFAC',
            borderRadius: '9999px',
            padding: '0.65rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 800,
            color: '#15803D',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)'
          }}
        >
          <Volume2 size={22} color="#15803D" />
          <span>{t('explorerListenAgain')}</span>
        </button>
      </div>

      {/* Big Interactive Center Card */}
      <div
        onClick={speakItem}
        style={{
          background: currentItem.color,
          border: `4px solid ${currentItem.borderColor}`,
          borderRadius: '36px',
          width: '100%',
          maxWidth: '440px',
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          cursor: 'pointer',
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.08)',
          transform: bounce ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          padding: '2rem 1.5rem',
          userSelect: 'none',
          touchAction: 'manipulation'
        }}
      >
        {/* Giant Emoji Graphic */}
        <span
          style={{
            fontSize: '7rem',
            lineHeight: 1,
            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1))'
          }}
        >
          {currentItem.emoji}
        </span>

        {/* Word Label */}
        <h2
          style={{
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: 900,
            color: currentItem.textColor,
            letterSpacing: '-0.02em',
            textAlign: 'center'
          }}
        >
          {currentWord}
        </h2>

        {/* Tap Prompt Badge */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '9999px',
            padding: '0.45rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.95rem',
            fontWeight: 800,
            color: currentItem.textColor,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Volume2 size={18} />
          <span>{t('explorerTapToHear')}</span>
        </div>
      </div>

      {/* Huge Previous / Next Navigation Arrows */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          marginTop: '0.5rem',
          width: '100%',
          maxWidth: '440px'
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          style={{
            flex: 1,
            minHeight: '80px',
            background: '#FFFFFF',
            border: '3px solid #CBD5E1',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#334155',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.15s ease',
            touchAction: 'manipulation'
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <ArrowLeft size={30} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={handleNext}
          style={{
            flex: 1,
            minHeight: '80px',
            background: '#4F46E5',
            border: '3px solid #4338CA',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#FFFFFF',
            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.3)',
            transition: 'transform 0.15s ease',
            touchAction: 'manipulation'
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <ArrowRight size={30} strokeWidth={2.5} />
        </button>
      </div>

      {/* Thumbnail Bar for Quick Direct Jumps */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          maxWidth: '100%',
          padding: '0.5rem 0.25rem',
          marginTop: '0.5rem'
        }}
      >
        {VOCAB_ITEMS.map((item, idx) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                playPop();
                setCurrentIndex(idx);
              }}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                border: isSelected ? `3px solid ${item.borderColor}` : '2px solid #E2E8F0',
                background: isSelected ? item.color : '#FFFFFF',
                fontSize: '1.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              {item.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
