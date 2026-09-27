import React, { useState, useEffect, useMemo } from 'react';
import { Home, Volume2, Sparkles, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';

const SOUND_ITEMS = [
  {
    id: 'cat',
    emoji: '🐱',
    sound: 'Meow meow',
    names: { english: 'Cat', bengali: 'বিড়াল', hindi: 'बिल्ली' },
    prompts: {
      english: "Who says 'Meow meow'? Find the cat!",
      bengali: "কে বলে 'মিউ মিউ'? বিড়াল কোথায়?",
      hindi: "कौन बोलता है 'म्याऊँ म्याऊँ'? बिल्ली को खोजो!"
    },
    praise: {
      english: "Yay! That's the Cat! Meow!",
      bengali: "দারুণ! ওটা বিড়াল!",
      hindi: "शाबाश! वह बिल्ली है!"
    },
    distractors: ['dog', 'cow', 'duck']
  },
  {
    id: 'dog',
    emoji: '🐶',
    sound: 'Woof woof',
    names: { english: 'Dog', bengali: 'কুকুর', hindi: 'कुत्ता' },
    prompts: {
      english: "Who says 'Woof woof'? Find the dog!",
      bengali: "কে বলে 'ভউ ভউ'? কুকুর কোথায়?",
      hindi: "कौन बोलता है 'भौ भौ'? कुत्ते को खोजो!"
    },
    praise: {
      english: "Super! That's the Dog! Woof!",
      bengali: "অসাধারণ! ওটা কুকুর!",
      hindi: "बहुत बढ़िया! वह कुत्ता है!"
    },
    distractors: ['cat', 'lion', 'car']
  },
  {
    id: 'cow',
    emoji: '🐮',
    sound: 'Moo moo',
    names: { english: 'Cow', bengali: 'গরু', hindi: 'गाय' },
    prompts: {
      english: "Who says 'Moo moo'? Find the cow!",
      bengali: "কে বলে 'হাম্বা হাম্বা'? গরু কোথায়?",
      hindi: "कौन बोलती है 'माँबा माँबा'? गाय को खोजो!"
    },
    praise: {
      english: "Hooray! That's the Cow! Moo!",
      bengali: "দারুণ! ওটা গরু!",
      hindi: "शाबाश! वह गाय है!"
    },
    distractors: ['bird', 'duck', 'drum']
  },
  {
    id: 'duck',
    emoji: '🦆',
    sound: 'Quack quack',
    names: { english: 'Duck', bengali: 'হাঁস', hindi: 'बत्तख' },
    prompts: {
      english: "Who says 'Quack quack'? Find the duck!",
      bengali: "কে বলে 'প্যাক প্যাক'? হাঁস কোথায়?",
      hindi: "कौन बोलता है 'क्वेक क्वेक'? बत्तख को खोजो!"
    },
    praise: {
      english: "Splendid! That's the Duck! Quack!",
      bengali: "চমৎকার! ওটা হাঁস!",
      hindi: "सुंदर! वह बत्तख है!"
    },
    distractors: ['cat', 'bell', 'train']
  },
  {
    id: 'bird',
    emoji: '🐦',
    sound: 'Tweet tweet',
    names: { english: 'Bird', bengali: 'পাখি', hindi: 'चिड़िया' },
    prompts: {
      english: "Who says 'Tweet tweet'? Find the bird!",
      bengali: "কে বলে 'কূজন কূজন'? পাখি কোথায়?",
      hindi: "कौन बोलती है 'चीं चीं'? चिड़िया को खोजो!"
    },
    praise: {
      english: "Sweet! That's the Bird! Tweet!",
      bengali: "দারুণ! ওটা পাখি!",
      hindi: "बहुत अच्छा! वह चिड़िया है!"
    },
    distractors: ['cow', 'dog', 'lion']
  },
  {
    id: 'lion',
    emoji: '🦁',
    sound: 'Roar roar',
    names: { english: 'Lion', bengali: 'সিংহ', hindi: 'शेर' },
    prompts: {
      english: "Who roars loud? Find the lion!",
      bengali: "কে গর্জন করে? সিংহ কোথায়?",
      hindi: "कौन दहाड़ता है? शेर को खोजो!"
    },
    praise: {
      english: "Roar! That's the King Lion!",
      bengali: "সাব্বাশ! ওটা সিংহ!",
      hindi: "शाबाश! वह शेर है!"
    },
    distractors: ['bird', 'car', 'bell']
  },
  {
    id: 'train',
    emoji: '🚂',
    sound: 'Choo choo',
    names: { english: 'Train', bengali: 'ট্রেন', hindi: 'रेलगाड़ी' },
    prompts: {
      english: "Who goes 'Choo choo'? Find the train!",
      bengali: "কে চলে 'ছুক ছুক'? ট্রেন কোথায়?",
      hindi: "कौन चलती है 'छुक छुक'? रेलगाड़ी को खोजो!"
    },
    praise: {
      english: "All aboard! That's the Train!",
      bengali: "দারুণ! ওটা ট্রেন!",
      hindi: "वाह! वह रेलगाड़ी है!"
    },
    distractors: ['drum', 'duck', 'cow']
  },
  {
    id: 'car',
    emoji: '🚗',
    sound: 'Beep beep',
    names: { english: 'Car', bengali: 'গাড়ি', hindi: 'गाड़ी' },
    prompts: {
      english: "Who honks 'Beep beep'? Find the car!",
      bengali: "কে হর্ন দেয় 'পিপ পিপ'? গাড়ি কোথায়?",
      hindi: "कौन हॉर्न बजाती है 'पीं पीं'? गाड़ी को खोजो!"
    },
    praise: {
      english: "Beep beep! That's the Car!",
      bengali: "সুন্দর! ওটা গাড়ি!",
      hindi: "बहुत खूब! वह गाड़ी है!"
    },
    distractors: ['train', 'dog', 'cat']
  },
  {
    id: 'bell',
    emoji: '🔔',
    sound: 'Ding dong',
    names: { english: 'Bell', bengali: 'ঘণ্টা', hindi: 'घंटी' },
    prompts: {
      english: "Who rings 'Ding dong'? Find the bell!",
      bengali: "কে বাজে 'ঢং ঢং'? ঘণ্টা কোথায়?",
      hindi: "कौन बजती है 'टन टन'? घंटी को खोजो!"
    },
    praise: {
      english: "Ding dong! That's the Bell!",
      bengali: "দারুণ! ওটা ঘণ্টা!",
      hindi: "शाबाश! वह घंटी है!"
    },
    distractors: ['bird', 'cow', 'lion']
  },
  {
    id: 'drum',
    emoji: '🥁',
    sound: 'Boom boom',
    names: { english: 'Drum', bengali: 'ঢোল', hindi: 'ढोल' },
    prompts: {
      english: "Who plays 'Boom boom'? Find the drum!",
      bengali: "কে বাজে 'ডুম ডুম'? ঢোল কোথায়?",
      hindi: "कौन बजता है 'धम धम'? ढोल को खोजो!"
    },
    praise: {
      english: "Boom boom! That's the Drum!",
      bengali: "দারুণ! ওটা ঢোল!",
      hindi: "शानदार! वह ढोल है!"
    },
    distractors: ['car', 'duck', 'train']
  }
];

const STORAGE_SEEN_KEY = 'aksharmitra_explorer_sound_seen';

export default function SoundMatchPlay({ onBack }) {
  const { activeLanguage, t } = useProfile();
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();

  const langKey = activeLanguage?.id === 'hindi' ? 'hindi' : (activeLanguage?.id === 'bengali' ? 'bengali' : 'english');
  const speechLang = langKey === 'hindi' ? 'hi-IN' : (langKey === 'bengali' ? 'bn-IN' : 'en-US');

  const [currentIndex, setCurrentIndex] = useState(() => {
    try {
      const seen = JSON.parse(localStorage.getItem(STORAGE_SEEN_KEY) || '[]');
      const available = SOUND_ITEMS.map((_, i) => i).filter((i) => !seen.includes(i));
      if (available.length > 0) return available[Math.floor(Math.random() * available.length)];
    } catch (e) {}
    return 0;
  });

  const [selectedId, setSelectedId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wobbleId, setWobbleId] = useState(null);

  const currentItem = SOUND_ITEMS[currentIndex] || SOUND_ITEMS[0];

  // Prepare 3 options (correct + 2 distractors)
  const options = useMemo(() => {
    const distractors = SOUND_ITEMS.filter((item) => item.id !== currentItem.id);
    // Shuffle distractors and pick 2
    const shuffled = [...distractors].sort(() => Math.random() - 0.5).slice(0, 2);
    const combined = [currentItem, ...shuffled];
    return combined.sort(() => Math.random() - 0.5);
  }, [currentIndex]);

  // Audio prompt on question load
  const playPrompt = () => {
    playChime(440);
    const promptText = currentItem.prompts[langKey] || currentItem.prompts.english;
    speakText(promptText, speechLang);
  };

  useEffect(() => {
    setSelectedId(null);
    setIsCorrect(false);
    setWobbleId(null);

    const timer = setTimeout(() => {
      playPrompt();
    }, 350);

    return () => clearTimeout(timer);
  }, [currentIndex, langKey]);

  const handleSelect = (item) => {
    playPop();
    setSelectedId(item.id);

    if (item.id === currentItem.id) {
      // Correct!
      setIsCorrect(true);
      playStarTwinkle();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      const praiseText = currentItem.praise[langKey] || currentItem.praise.english;
      speakText(praiseText, speechLang);

      // Record variety in localStorage
      try {
        const seen = JSON.parse(localStorage.getItem(STORAGE_SEEN_KEY) || '[]');
        const updated = [...new Set([...seen, currentIndex])];
        if (updated.length >= SOUND_ITEMS.length) {
          localStorage.setItem(STORAGE_SEEN_KEY, JSON.stringify([currentIndex]));
        } else {
          localStorage.setItem(STORAGE_SEEN_KEY, JSON.stringify(updated));
        }
      } catch (e) {}

      // Advance after gentle celebration
      setTimeout(() => {
        let nextIdx = (currentIndex + 1) % SOUND_ITEMS.length;
        setCurrentIndex(nextIdx);
      }, 1600);
    } else {
      // Gentle Try Again — zero penalty, zero score counter
      setWobbleId(item.id);
      playChime(320);
      const retryText = t('explorerTryAgainGentle');
      speakText(retryText, speechLang);
      setTimeout(() => {
        setWobbleId(null);
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
            background: '#E0F2FE',
            border: '2px solid #7DD3FC',
            borderRadius: '9999px',
            padding: '0.65rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 800,
            color: '#0284C7',
            boxShadow: '0 2px 8px rgba(56, 189, 248, 0.15)'
          }}
        >
          <Volume2 size={22} color="#0284C7" />
          <span>{t('explorerListenAgain')}</span>
        </button>
      </div>

      {/* Central Audio / Picture Card */}
      <div
        onClick={playPrompt}
        style={{
          background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
          border: '3px solid #7DD3FC',
          borderRadius: '32px',
          padding: '1.75rem 2rem',
          width: '100%',
          maxWidth: '520px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          boxShadow: '0 12px 28px rgba(14, 165, 233, 0.1)'
        }}
      >
        <div
          style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.2rem',
            boxShadow: '0 4px 14px rgba(14, 165, 233, 0.15)'
          }}
        >
          🎵
        </div>

        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0369A1' }}>
          "{currentItem.sound}!"
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#0284C7',
            lineHeight: 1.3
          }}
        >
          {currentItem.prompts[langKey] || currentItem.prompts.english}
        </p>
      </div>

      {/* 3 Giant Picture Choice Tiles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          width: '100%',
          maxWidth: '560px',
          marginTop: '0.5rem'
        }}
      >
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isWinning = isCorrect && isSelected;
          const isWobbling = wobbleId === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              style={{
                background: isWinning ? '#DCFCE7' : '#FFFFFF',
                border: isWinning
                  ? '4px solid #22C55E'
                  : isWobbling
                  ? '3px solid #F87171'
                  : '3px solid #E2E8F0',
                borderRadius: '26px',
                padding: '1.25rem 0.5rem',
                minHeight: '130px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: isWinning
                  ? '0 12px 24px rgba(34, 197, 94, 0.25)'
                  : '0 6px 16px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isWinning ? 'scale(1.08)' : isWobbling ? 'translateX(-6px)' : 'scale(1)',
                touchAction: 'manipulation'
              }}
            >
              <span style={{ fontSize: '3.6rem', lineHeight: 1 }}>{opt.emoji}</span>
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: isWinning ? '#15803D' : '#1E293B'
                }}
              >
                {opt.names[langKey] || opt.names.english}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
