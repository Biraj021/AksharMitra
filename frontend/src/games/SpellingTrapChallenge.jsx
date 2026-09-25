import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

// ── English Trap Challenges ───────────────────────────────────────────────────
const TRAP_CHALLENGES_EN = [
  {
    id: 'tr_en_1',
    targetWord: 'FROM',
    trapWord: 'FORM',
    visualClue: '🎁',
    sentence: 'A special gift came ____ grandma.',
    options: ['FROM', 'FORM'],
    rule: "'FROM' starts with F-R (where something comes from), while 'FORM' is a paper you fill out (F-O-R-M)."
  },
  {
    id: 'tr_en_2',
    targetWord: 'PLAY',
    trapWord: 'PALY',
    visualClue: '🎮',
    sentence: 'The children go outside to ____.',
    options: ['PLAY', 'PALY'],
    rule: "The letter 'L' hugs the letter 'P' right away: P-L-A-Y!"
  },
  {
    id: 'tr_en_3',
    targetWord: 'GIRL',
    trapWord: 'GRIL',
    visualClue: '👧',
    sentence: 'The happy ____ read a story.',
    options: ['GIRL', 'GRIL'],
    rule: "'I' comes right after 'G' in GIRL (G-I-R-L). Don't let the R jump ahead!"
  },
  {
    id: 'tr_en_4',
    targetWord: 'WENT',
    trapWord: 'WNET',
    visualClue: '🚶',
    sentence: 'Mitra ____ to the learning island.',
    options: ['WENT', 'WNET'],
    rule: "'E' must follow 'W' before 'N': W-E-N-T."
  },
  {
    id: 'tr_en_5',
    targetWord: 'SAID',
    trapWord: 'SIAD',
    visualClue: '💬',
    sentence: '"Hello friend!" ____ the smiling owl.',
    options: ['SAID', 'SIAD'],
    rule: "'A' comes first, then 'I': S-A-I-D."
  },
  {
    id: 'tr_en_6',
    targetWord: 'FIRST',
    trapWord: 'FRIST',
    visualClue: '🥇',
    sentence: 'He won the ____ place golden trophy.',
    options: ['FIRST', 'FRIST'],
    rule: "'I' comes right after 'F' in FIRST (F-I-R-S-T)."
  }
];

// ── Bengali Trap Challenges ───────────────────────────────────────────────────
const TRAP_CHALLENGES_BN = [
  {
    id: 'tr_bn_1',
    targetWord: 'জল',
    trapWord: 'লজ',
    visualClue: '💧',
    sentence: 'গ্লাসে ঠান্ডা ____ পান করো।',
    options: ['জল', 'লজ'],
    rule: '"জল" এর প্রথমে "জ", তারপর "ল"। উল্টো করে "লজ" নয়!'
  },
  {
    id: 'tr_bn_2',
    targetWord: 'বই',
    trapWord: 'ইব',
    visualClue: '📚',
    sentence: 'মিতু আনন্দের সাথে ____ পড়ে।',
    options: ['বই', 'ইব'],
    rule: '"বই" বানানে প্রথমে "ব", তারপর "ই"। বর্ণ উল্টানো যাবে না!'
  },
  {
    id: 'tr_bn_3',
    targetWord: 'ফুল',
    trapWord: 'লুফ',
    visualClue: '🌸',
    sentence: 'বাগান জুড়ে ফুটেছে লাল ____।',
    options: ['ফুল', 'লুফ'],
    rule: '"ফুল" লিখতে আগে "ফ-ু", শেষে "ল"।'
  },
  {
    id: 'tr_bn_4',
    targetWord: 'ঘর',
    trapWord: 'রঘ',
    visualClue: '🏠',
    sentence: 'পাখি ফিরে এলো নিজের ____ে।',
    options: ['ঘর', 'রঘ'],
    rule: '"ঘর" বানানে আগে সম্পূর্ণ মাত্রার "ঘ", পরে "র"।'
  }
];

// ── Hindi Trap Challenges ─────────────────────────────────────────────────────
const TRAP_CHALLENGES_HI = [
  {
    id: 'tr_hi_1',
    targetWord: 'जल',
    trapWord: 'लज',
    visualClue: '💧',
    sentence: 'गिलास में ठंडा ____ पियो।',
    options: ['जल', 'लज'],
    rule: '"जल" में पहले "ज", फिर "ल" आता है। वर्णों का क्रम नहीं उलटें!'
  },
  {
    id: 'tr_hi_2',
    targetWord: 'घर',
    trapWord: 'रघ',
    visualClue: '🏠',
    sentence: 'मित्रा अपने सुंदर ____ वापस आया।',
    options: ['घर', 'रघ'],
    rule: '"घर" में पहले पूरी शिरोरेखा वाला "घ", फिर "र" आता है।'
  },
  {
    id: 'tr_hi_3',
    targetWord: 'फल',
    trapWord: 'लफ',
    visualClue: '🍎',
    sentence: 'रोहन ने मीठा और ताजा ____ खाया।',
    options: ['फल', 'लफ'],
    rule: '"फल" में पहले "फ", फिर "ल" आता है।'
  },
  {
    id: 'tr_hi_4',
    targetWord: 'तारा',
    trapWord: 'राता',
    visualClue: '⭐',
    sentence: 'रात में चमकता है सुंदर ____।',
    options: ['तारा', 'राता'],
    rule: '"तारा" में पहले "ता", फिर "रा" आता है।'
  }
];

export default function SpellingTrapChallenge({ onBack, adaptiveConfig }) {
  const { playPop, playChime, playStarTwinkle, speakText } = useAudio();
  const { addStars, activeLanguage } = useProfile();

  const langId = activeLanguage?.id || 'english';
  const isBengali = langId === 'bengali';
  const isHindi = langId === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

  const TRAP_CHALLENGES = isHindi ? TRAP_CHALLENGES_HI : (isBengali ? TRAP_CHALLENGES_BN : TRAP_CHALLENGES_EN);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const challenge = TRAP_CHALLENGES[currentIdx] || TRAP_CHALLENGES[0];

  // Scramble the 2 options so correct isn't always in same position
  const shuffledOptions = React.useMemo(() => {
    return [...challenge.options].sort(() => 0.5 - Math.random());
  }, [challenge.id, langId]);

  useEffect(() => {
    setSelectedOption(null);
    setFeedback(null);
    const audioPrompt = isHindi
      ? `${challenge.sentence.replace('____', 'खाली जगह')}. सही शब्द पहचानें!`
      : (isBengali ? `${challenge.sentence.replace('____', 'শূন্যস্থান')}. সঠিক বানানটি বেছে নাও!` : `${challenge.sentence.replace('____', 'blank')}. Spot the correct spelling!`);
    speakText(audioPrompt, speechLang);
  }, [currentIdx, langId]);

  const handleSelectOption = (word) => {
    if (selectedOption) return;
    setSelectedOption(word);

    if (word === challenge.targetWord) {
      playStarTwinkle();
      addStars(5);
      const successFeedback = isHindi
        ? `🎯 सटीक! "${word}" बिल्कुल सही शब्द है! ${challenge.rule}`
        : (isBengali ? `🎯 দারুণ! "${word}" একদম সঠিক! ${challenge.rule}` : `🎯 Bullseye! "${word}" is correct! ${challenge.rule}`);
      setFeedback({
        type: 'success',
        message: successFeedback
      });
      const speakMsg = isHindi ? `बहुत बढ़िया! ${word} सही शब्द है!` : (isBengali ? `চমৎকার! ${word} সঠিক শব্দ!` : `Spot on! ${word} is the right word!`);
      speakText(speakMsg, speechLang);
      try {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      } catch (e) { }
    } else {
      playChime(300);
      const retryFeedback = isHindi
        ? `⚠️ जाल पकड़ा गया! "${word}" में वर्णों का क्रम उल्टा है। ${challenge.rule}`
        : (isBengali ? `⚠️ ভুল ফাঁদ! "${word}" বর্ণটি উল্টানো। ${challenge.rule}` : `⚠️ Trap spotted! "${word}" is a letter swap. ${challenge.rule}`);
      setFeedback({
        type: 'retry',
        message: retryFeedback
      });
      speakText(challenge.rule, speechLang);
    }
  };

  const handleRetry = () => {
    playPop();
    setSelectedOption(null);
    setFeedback(null);
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
    <div className="game-viewport" style={{ maxWidth: '780px', margin: '0 auto', padding: '1rem' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <button
          onClick={onBack}
          className="btn-secondary btn-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>{isHindi ? 'खेल हब' : (isBengali ? 'গেমস হাব' : 'Games Hub')}</span>
        </button>

        <div className="game-stat-pill" style={{ color: '#C026D3', background: '#FDF4FF', borderColor: '#F5D0FE' }}>
          <AlertTriangle size={16} />
          <span>{isHindi ? `चुनौती ${currentIdx + 1} / ${TRAP_CHALLENGES.length}` : (isBengali ? `চ্যালেঞ্জ ${currentIdx + 1} / ${TRAP_CHALLENGES.length}` : `Trap ${currentIdx + 1} of ${TRAP_CHALLENGES.length}`)}</span>
        </div>
      </div>

      {/* Main Challenge Card */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem 1.75rem',
          borderRadius: '26px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
          background: 'white',
          textAlign: 'center'
        }}
      >
        {/* Visual Clue Badge */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #FDF4FF 0%, #FAE8FF 100%)',
            border: '2px solid #F0ABFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            boxShadow: '0 8px 18px rgba(192, 38, 211, 0.15)'
          }}
        >
          {challenge.visualClue}
        </div>

        {/* Challenge Sentence */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#A21CAF', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            {isHindi ? '🔍 वर्तनी जाल पहचानें और सही शब्द चुनें' : (isBengali ? '🔍 সঠিক বানানটি বেছে বাক্যটি পূর্ণ করো' : '🔍 Spot the Letter-Order Reversal')}
          </div>
          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#1E293B',
              margin: 0,
              lineHeight: 1.4,
              fontFamily: isHindi ? 'var(--font-devanagari)' : (isBengali ? 'var(--font-bengali)' : 'Lexend, sans-serif')
            }}
          >
            {challenge.sentence.split('____').map((part, i, arr) => (
              <React.Fragment key={i}>
                <span>{part}</span>
                {i < arr.length - 1 && (
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: '80px',
                      padding: '0.2rem 0.8rem',
                      borderBottom: '3px solid #C026D3',
                      background: selectedOption ? '#FDF4FF' : '#F1F5F9',
                      borderRadius: '8px',
                      color: '#86198F',
                      fontWeight: 800,
                      margin: '0 0.3rem',
                      textAlign: 'center'
                    }}
                  >
                    {selectedOption || '_______'}
                  </span>
                )}
              </React.Fragment>
            ))}
          </h2>
        </div>

        {/* 2 Big Choice Buttons (Target vs Trap) */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '480px', justifyContent: 'center' }}>
          {shuffledOptions.map((opt) => {
            const isSelected = selectedOption === opt;
            const isTarget = opt === challenge.targetWord;

            let btnBg = 'white';
            let btnBorder = '2px solid #E2E8F0';
            let btnColor = '#1E293B';

            if (selectedOption) {
              if (isSelected && isTarget) {
                btnBg = '#DCFCE7';
                btnBorder = '2px solid #16A34A';
                btnColor = '#15803D';
              } else if (isSelected && !isTarget) {
                btnBg = '#FEF2F2';
                btnBorder = '2px solid #DC2626';
                btnColor = '#991B1B';
              }
            }

            return (
              <button
                key={opt}
                disabled={Boolean(selectedOption)}
                onClick={() => handleSelectOption(opt)}
                style={{
                  flex: 1,
                  padding: '1.25rem 1rem',
                  borderRadius: '20px',
                  background: btnBg,
                  border: btnBorder,
                  color: btnColor,
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  cursor: selectedOption ? 'default' : 'pointer',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
                  transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  fontFamily: isHindi ? 'var(--font-devanagari)' : (isBengali ? 'var(--font-bengali)' : 'Lexend, sans-serif')
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanatory Rule / Feedback Banner */}
        {feedback && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              background: feedback.type === 'success' ? '#F0FDF4' : '#FFFBEB',
              border: feedback.type === 'success' ? '1.5px solid #86EFAC' : '1.5px solid #FDE68A',
              color: feedback.type === 'success' ? '#166534' : '#92400E',
              fontWeight: 700,
              fontSize: '0.95rem',
              maxWidth: '520px',
              textAlign: 'center',
              lineHeight: 1.4
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Action Buttons: Next and/or Try Again */}
        {selectedOption && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {feedback?.type === 'retry' && (
              <button
                onClick={handleRetry}
                className="btn btn-secondary"
                style={{
                  borderRadius: '9999px',
                  padding: '0.85rem 1.75rem',
                  fontSize: '1.05rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '2px solid #E2E8F0',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={18} />
                <span>{isHindi ? 'पुनः प्रयास करें 🔄' : (isBengali ? 'আবার চেষ্টা করো 🔄' : 'Try Again 🔄')}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="btn btn-primary"
              style={{
                borderRadius: '9999px',
                padding: '0.85rem 2rem',
                fontSize: '1.05rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                cursor: 'pointer'
              }}
            >
              <span>{isHindi ? 'अगली चुनौती 🚀' : (isBengali ? 'পরবর্তী চ্যালেঞ্জ 🚀' : 'Next Trap Challenge 🚀')}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
