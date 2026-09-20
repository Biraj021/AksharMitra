import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, Sparkles, CheckCircle, RotateCcw, ArrowRight, Train, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAudio } from '../context/AudioContext';
import { useProfile } from '../context/ProfileContext';

// ── English Train Levels ──────────────────────────────────────────────────────
const TRAIN_LEVELS_EN = [
  {
    id: 'lvl_en_1',
    title: 'Beginner Express: Jump into the ABCs',
    wagons: [
      { sequence: ['A', 'B', null, 'D', 'E'], missingIndex: 2, answer: 'C', hint: 'What comes right after B?' },
      { sequence: ['F', 'G', null, 'I', 'J'], missingIndex: 2, answer: 'H', hint: 'H for Hat, right before I!' },
      { sequence: ['K', null, 'M', 'N', 'O'], missingIndex: 1, answer: 'L', hint: 'L for Lion comes after K!' },
      { sequence: ['P', 'Q', null, 'S', 'T'], missingIndex: 2, answer: 'R', hint: 'R for Rainbow comes before S!' },
    ]
  },
  {
    id: 'lvl_en_2',
    title: 'Mirror Letter Tracks: b, d, p, q',
    wagons: [
      { sequence: ['A', null, 'C', 'D', 'E'], missingIndex: 1, answer: 'B', hint: 'B has a belly on the right! (b)' },
      { sequence: ['B', 'C', null, 'E', 'F'], missingIndex: 2, answer: 'D', hint: 'D has a round back like a door! (d)' },
      { sequence: ['N', 'O', null, 'Q', 'R'], missingIndex: 2, answer: 'P', hint: 'P has its circle at the top right! (p)' },
      { sequence: ['O', 'P', null, 'R', 'S'], missingIndex: 2, answer: 'Q', hint: 'Q has a tail on the right! (q)' },
    ]
  },
  {
    id: 'lvl_en_3',
    title: 'Speedy Engine: Two Missing Letters',
    wagons: [
      { sequence: ['A', null, 'C', null, 'E', 'F'], missingIndices: [1, 3], answers: { 1: 'B', 3: 'D' }, hint: 'Fill B and D in the alphabet line!' },
      { sequence: ['M', null, 'O', null, 'Q', 'R'], missingIndices: [1, 3], answers: { 1: 'N', 3: 'P' }, hint: 'Fill N and P!' },
      { sequence: ['S', null, 'U', null, 'W', 'X'], missingIndices: [1, 3], answers: { 1: 'T', 3: 'V' }, hint: 'Fill T and V!' },
    ]
  },
  {
    id: 'lvl_en_4',
    title: 'Grand Master Train: Long Alphabet Trail',
    wagons: [
      { sequence: ['U', 'V', null, 'X', null, 'Z'], missingIndices: [2, 4], answers: { 2: 'W', 4: 'Y' }, hint: 'Almost to the end of the alphabet!' },
      { sequence: ['E', 'F', null, 'H', null, 'J', 'K'], missingIndices: [2, 4], answers: { 2: 'G', 4: 'I' }, hint: 'G for Giraffe and I for Ice cream!' },
    ]
  }
];

// ── Bengali Train Levels ──────────────────────────────────────────────────────
const TRAIN_LEVELS_BN = [
  {
    id: 'lvl_bn_1',
    title: 'স্বরবর্ণ এক্সপ্রেস: অ থেকে ঔ',
    wagons: [
      { sequence: ['অ', 'আ', null, 'ঈ', 'উ'], missingIndex: 2, answer: 'ই', hint: 'অ, আ এর পরে কী আসে?' },
      { sequence: ['উ', 'ঊ', null, 'এ', 'ঐ'], missingIndex: 2, answer: 'ঋ', hint: 'ঊ এর পরের স্বরবর্ণটি বসাও!' },
      { sequence: ['ঋ', 'এ', 'ঐ', null, 'ঔ'], missingIndex: 3, answer: 'ও', hint: 'ঐ এর পরে কোনটি বসবে?' },
    ]
  },
  {
    id: 'lvl_bn_2',
    title: 'ব্যঞ্জনবর্ণ ট্রেইল: ক থেকে ঞ',
    wagons: [
      { sequence: ['ক', 'খ', null, 'ঘ', 'ঙ'], missingIndex: 2, answer: 'গ', hint: 'খ এর পরের বর্ণটি বেছে নাও!' },
      { sequence: ['চ', 'ছ', null, 'ঝ', 'ঞ'], missingIndex: 2, answer: 'জ', hint: 'ছ এর পরে বর্গীয় জ!' },
      { sequence: ['ট', 'ঠ', null, 'ঢ', 'ণ'], missingIndex: 2, answer: 'ড', hint: 'ঠ এর পরে কোনটি?' },
    ]
  },
  {
    id: 'lvl_bn_3',
    title: 'বর্ণের বিভ্রান্তি ট্র্যাক: ব, র, ক, ধ',
    wagons: [
      { sequence: ['প', 'ফ', null, 'ভ', 'ম'], missingIndex: 2, answer: 'ব', hint: 'ফ এর পরে "ব" বর্ণটি বসাও!' },
      { sequence: ['য', null, 'ল', 'শ', 'ষ'], missingIndex: 1, answer: 'র', hint: 'য এর পরে ফুটকি দেওয়া "র"!' },
      { sequence: ['ত', 'থ', 'দ', null, 'ন'], missingIndex: 3, answer: 'ধ', hint: 'দ এর পরে ছোট ঘুন্ডি দেওয়া "ধ"!' },
    ]
  },
  {
    id: 'lvl_bn_4',
    title: 'মাস্টার ট্রেইল: দুই বর্ণের শূন্যস্থান',
    wagons: [
      { sequence: ['ক', null, 'গ', null, 'ঙ'], missingIndices: [1, 3], answers: { 1: 'খ', 3: 'ঘ' }, hint: 'খ এবং ঘ বসিয়ে ট্রেন পূরণ করো!' },
      { sequence: ['প', null, 'ব', null, 'ম'], missingIndices: [1, 3], answers: { 1: 'ফ', 3: 'ভ' }, hint: 'ফ এবং ভ বসাও!' },
    ]
  }
];

// ── Hindi Train Levels ────────────────────────────────────────────────────────
const TRAIN_LEVELS_HI = [
  {
    id: 'lvl_hi_1',
    title: 'स्वर एक्सप्रेस: अ से औ',
    wagons: [
      { sequence: ['अ', 'आ', null, 'ई', 'उ'], missingIndex: 2, answer: 'इ', hint: 'अ, आ के बाद क्या आता है?' },
      { sequence: ['उ', 'ऊ', null, 'ए', 'ऐ'], missingIndex: 2, answer: 'ऋ', hint: 'ऊ के बाद आने वाला स्वर चुनें!' },
      { sequence: ['ऋ', 'ए', 'ऐ', null, 'औ'], missingIndex: 3, answer: 'ओ', hint: 'ऐ के बाद क्या आएगा?' },
    ]
  },
  {
    id: 'lvl_hi_2',
    title: 'व्यंजन एक्सप्रेस: क से ङ',
    wagons: [
      { sequence: ['क', 'ख', null, 'घ', 'ङ'], missingIndex: 2, answer: 'ग', hint: 'ख के बाद कौन सा अक्षर आता है?' },
      { sequence: ['च', 'छ', null, 'झ', 'ञ'], missingIndex: 2, answer: 'ज', hint: 'छ के बाद ज चुनें!' },
      { sequence: ['ट', 'ठ', null, 'ढ', 'ण'], missingIndex: 2, answer: 'ड', hint: 'ठ के बाद ड आता है!' },
    ]
  },
  {
    id: 'lvl_hi_3',
    title: 'अक्षर भेद व दर्पण ट्रैक: ब, भ, द, ध',
    wagons: [
      { sequence: ['प', 'फ', null, 'भ', 'म'], missingIndex: 2, answer: 'ब', hint: 'फ के बाद "ब" अक्षर चुनें!' },
      { sequence: ['य', null, 'ल', 'व', 'श'], missingIndex: 1, answer: 'र', hint: 'य के बाद "र" चुनें!' },
      { sequence: ['त', 'थ', 'द', null, 'न'], missingIndex: 3, answer: 'ध', hint: 'द के बाद घुंडी वाला "ध" चुनें!' },
    ]
  },
  {
    id: 'lvl_hi_4',
    title: 'मास्टर ट्रेन: दो छूटे हुए अक्षर',
    wagons: [
      { sequence: ['क', null, 'ग', null, 'ङ'], missingIndices: [1, 3], answers: { 1: 'ख', 3: 'घ' }, hint: 'ख और घ भरकर ट्रेन पूरी करें!' },
      { sequence: ['प', null, 'ब', null, 'म'], missingIndices: [1, 3], answers: { 1: 'फ', 3: 'भ' }, hint: 'फ और भ भरें!' },
    ]
  }
];

// Keyboards
const KEYBOARD_ROWS_EN = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const KEYBOARD_ROWS_BN = [
  ['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ'],
  ['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ', 'ছ', 'জ', 'ঝ', 'ঞ', 'ট', 'ঠ', 'ড', 'ঢ', 'ণ'],
  ['ত', 'থ', 'দ', 'ধ', 'ন', 'প', 'ফ', 'ব', 'ভ', 'ম', 'য', 'র', 'ল', 'শ', 'ষ', 'স', 'হ']
];

const KEYBOARD_ROWS_HI = [
  ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ'],
  ['क', 'ख', 'ग', 'घ', 'ङ', 'च', 'छ', 'ज', 'झ', 'ञ', 'ट', 'ठ', 'ड', 'ढ', 'ण'],
  ['त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह']
];

const VOWELS_EN = new Set(['A', 'E', 'I', 'O', 'U']);
const VOWELS_BN = new Set(['অ', 'আ', 'ই', 'ঈ', 'উ', 'ঊ', 'ঋ', 'এ', 'ঐ', 'ও', 'ঔ']);
const VOWELS_HI = new Set(['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ']);

const CONFUSION_EN = new Set(['B', 'D', 'P', 'Q']);
const CONFUSION_BN = new Set(['ব', 'র', 'ক', 'ধ', 'ড', 'ড়', 'প', 'ফ']);
const CONFUSION_HI = new Set(['ब', 'भ', 'द', 'ध', 'घ', 'प', 'ष']);

export default function AbcFillIn({ onBack, adaptiveConfig }) {
  const { addStars, activeLanguage, t } = useProfile();
  const { playPop, playChime, playSuccessChord, playStarTwinkle, speakText } = useAudio();

  const langId = activeLanguage?.id || 'english';
  const isBengali = langId === 'bengali';
  const isHindi = langId === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

  const TRAIN_LEVELS = isHindi ? TRAIN_LEVELS_HI : (isBengali ? TRAIN_LEVELS_BN : TRAIN_LEVELS_EN);
  const KEYBOARD_ROWS = isHindi ? KEYBOARD_ROWS_HI : (isBengali ? KEYBOARD_ROWS_BN : KEYBOARD_ROWS_EN);
  const VOWELS = isHindi ? VOWELS_HI : (isBengali ? VOWELS_BN : VOWELS_EN);
  const CONFUSION_LETTERS = isHindi ? CONFUSION_HI : (isBengali ? CONFUSION_BN : CONFUSION_EN);

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentWagonIdx, setCurrentWagonIdx] = useState(0);

  // Wagon slots state: array of letter strings or null
  const [wagonState, setWagonState] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'try_again' | null
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCaseToggle, setShowCaseToggle] = useState('upper'); // 'upper' | 'lower' | 'both'

  const formatChar = (c) => {
    if (!c || isBengali || isHindi) return c;
    if (showCaseToggle === 'lower') return c.toLowerCase();
    return c.toUpperCase();
  };

  const currentLevel = TRAIN_LEVELS[currentLevelIdx] || TRAIN_LEVELS[0];
  const currentWagon = currentLevel?.wagons[currentWagonIdx] || currentLevel?.wagons[0];

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
  }, [currentLevelIdx, currentWagonIdx, langId]);

  // Read letter aloud
  const handleHearLetter = (letter) => {
    if (!letter) return;
    speakText(letter, speechLang);
  };

  // Select letter from visual dyslexia keyboard
  const handleKeyPress = (letter) => {
    playPop();
    if (selectedSlot === null || feedback === 'correct') return;

    // Check if selected slot is indeed a missing slot
    const isSingle = currentWagon.missingIndex !== undefined;
    let isCorrect = false;

    if (isSingle) {
      if (selectedSlot === currentWagon.missingIndex && letter.toUpperCase() === currentWagon.answer.toUpperCase()) {
        isCorrect = true;
      }
    } else {
      if (currentWagon.answers[selectedSlot]?.toUpperCase() === letter.toUpperCase()) {
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
        : currentWagon.missingIndices.every(idx => (idx === selectedSlot ? true : updated[idx] !== null));

      if (allFilled) {
        playSuccessChord();
        setFeedback('correct');
        addStars(3);

        try {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.6 }
          });
        } catch (e) { }

        const victoryMsg = isHindi
          ? `शानदार! ${letter} बिल्कुल सही है!`
          : (isBengali ? `চমৎকার! ${letter} একদম সঠিক!` : `Spot on! ${letter} connects the train!`);
        speakText(victoryMsg, speechLang);

        setTimeout(() => {
          advanceToNextWagon();
        }, 1500);
      } else {
        // Find next empty slot
        const nextEmpty = currentWagon.missingIndices.find(idx => updated[idx] === null);
        if (nextEmpty !== undefined) {
          setSelectedSlot(nextEmpty);
        }
      }
    } else {
      playChime(250);
      setFeedback('try_again');
      const retryMsg = isHindi
        ? `दोबारा सोचें! ${currentWagon.hint || 'क्रम ध्यान से देखें।'}`
        : (isBengali ? `আবার চেষ্টা করো! ${currentWagon.hint || 'ক্রমটি ভালো করে দেখো।'}` : `Not quite! Check the train order!`);
      speakText(retryMsg, speechLang);

      setTimeout(() => {
        setFeedback(null);
      }, 1200);
    }
  };

  const advanceToNextWagon = () => {
    if (currentWagonIdx < currentLevel.wagons.length - 1) {
      setCurrentWagonIdx(prev => prev + 1);
    } else if (currentLevelIdx < TRAIN_LEVELS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setCurrentWagonIdx(0);
      playStarTwinkle();
    } else {
      setIsCompleted(true);
      playStarTwinkle();
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch (e) { }
    }
  };

  const handleRestart = () => {
    setCurrentLevelIdx(0);
    setCurrentWagonIdx(0);
    setIsCompleted(false);
  };

  return (
    <div className="game-viewport" style={{ maxWidth: '880px', margin: '0 auto', padding: '1rem' }}>
      {/* Navigation & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          onClick={onBack}
          className="btn-secondary btn-pill"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>{isHindi ? 'खेल हब' : (isBengali ? 'গেমস হাব' : 'Games Hub')}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {!isBengali && !isHindi && (
            <div style={{ display: 'flex', gap: '0.2rem', background: '#FEF3C7', padding: '0.2rem', borderRadius: '9999px', border: '1px solid #FDE68A' }}>
              <button
                type="button"
                onClick={() => { playPop(); setShowCaseToggle('upper'); }}
                style={{
                  border: 'none',
                  background: showCaseToggle === 'upper' ? '#F59E0B' : 'transparent',
                  color: showCaseToggle === 'upper' ? 'white' : '#92400E',
                  fontWeight: '800',
                  fontSize: '0.74rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  cursor: 'pointer'
                }}
                title="Capital Letters Only"
              >
                A-Z
              </button>
              <button
                type="button"
                onClick={() => { playPop(); setShowCaseToggle('lower'); }}
                style={{
                  border: 'none',
                  background: showCaseToggle === 'lower' ? '#F59E0B' : 'transparent',
                  color: showCaseToggle === 'lower' ? 'white' : '#92400E',
                  fontWeight: '800',
                  fontSize: '0.74rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  cursor: 'pointer'
                }}
                title="Small Letters Only"
              >
                a-z
              </button>
              <button
                type="button"
                onClick={() => { playPop(); setShowCaseToggle('both'); }}
                style={{
                  border: 'none',
                  background: showCaseToggle === 'both' ? '#F59E0B' : 'transparent',
                  color: showCaseToggle === 'both' ? 'white' : '#92400E',
                  fontWeight: '800',
                  fontSize: '0.74rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  cursor: 'pointer'
                }}
                title="Show Both Capital & Small"
              >
                Aa
              </button>
            </div>
          )}
          <div className="game-stat-pill" style={{ color: '#047857', background: '#D1FAE5', borderColor: '#A7F3D0' }}>
            <Train size={16} />
            <span>{isHindi ? `ट्रेन ${currentLevelIdx + 1}.${currentWagonIdx + 1}` : (isBengali ? `ট্রেন ${currentLevelIdx + 1}.${currentWagonIdx + 1}` : `Train ${currentLevelIdx + 1}.${currentWagonIdx + 1}`)}</span>
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
                <span className="badge badge-emerald">🔡 {isHindi ? 'अक्षर एक्सप्रेस' : (isBengali ? 'বর্ণমালা এক্সপ্রেস' : 'ABC Alphabet Train')}</span>
                <span className="badge badge-amber">{currentLevel.title}</span>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0 }}>
                {currentWagon?.hint || (isHindi ? 'छूटे हुए डिब्बे पर टैप करें और सही अक्षर चुनें!' : (isBengali ? 'খালি বগিতে স্পর্শ করো এবং সঠিক বর্ণ বেছে নাও!' : 'Tap on the missing train wagon and pick the correct letter!'))}
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
                {wagonState.map((char, slotIdx) => {
                  const isMissingSlot = currentWagon.missingIndex === slotIdx || currentWagon.missingIndices?.includes(slotIdx);
                  const isSelected = selectedSlot === slotIdx;
                  const isFilled = char !== null;

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => {
                        if (isMissingSlot) {
                          playPop();
                          setSelectedSlot(slotIdx);
                        } else if (char) {
                          handleHearLetter(char);
                        }
                      }}
                      style={{
                        width: '70px',
                        height: '90px',
                        borderRadius: '16px',
                        background: isFilled
                          ? (isMissingSlot ? '#FEF08A' : '#FFFFFF')
                          : (isSelected ? '#EEF2FF' : '#F1F5F9'),
                        border: isSelected
                          ? '3px solid #4F46E5'
                          : isFilled
                          ? '2px solid #E2E8F0'
                          : '2px dashed #94A3B8',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isMissingSlot ? 'pointer' : 'default',
                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                        boxShadow: isSelected ? '0 6px 16px rgba(79, 70, 229, 0.25)' : '0 2px 6px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      {isFilled ? (
                        <>
                          <span
                            style={{
                              fontSize: '2rem',
                              fontWeight: 800,
                              color: isMissingSlot ? '#854D0E' : '#1E293B',
                              fontFamily: isHindi ? 'var(--font-devanagari)' : (isBengali ? 'var(--font-bengali)' : 'Lexend, sans-serif')
                            }}
                          >
                            {formatChar(char)}
                          </span>
                          {!isBengali && !isHindi && showCaseToggle === 'both' && (
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                              {char.toLowerCase()}
                            </span>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '1.8rem', color: '#94A3B8', fontWeight: 800 }}>
                          ?
                        </span>
                      )}

                      {/* Small train wheels */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-8px',
                          display: 'flex',
                          gap: '24px'
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#334155', border: '2px solid white' }} />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#334155', border: '2px solid white' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Dyslexia-Optimized Keyboard */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                  {isHindi ? '🟡 स्वर  •  🟣 मुख्य अक्षर' : (isBengali ? '🟡 স্বরবর্ণ  •  🟣 বিশেষ বর্ণ' : '🟡 Vowels  •  🟣 Confusion Pairs')}
                </span>
                {feedback === 'try_again' && (
                  <span style={{ fontSize: '0.82rem', color: '#DC2626', fontWeight: 800 }}>
                    {isHindi ? '⚠️ दोबारा सोचें!' : (isBengali ? '⚠️ আবার চেষ্টা করো!' : '⚠️ Keep looking!')}
                  </span>
                )}
                {feedback === 'correct' && (
                  <span style={{ fontSize: '0.82rem', color: '#16A34A', fontWeight: 800 }}>
                    {isHindi ? '✓ बहुत बढ़िया!' : (isBengali ? '✓ চমৎকার!' : '✓ Perfect connection!')}
                  </span>
                )}
              </div>

              {KEYBOARD_ROWS.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    flexWrap: 'wrap'
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
                          minWidth: '42px',
                          height: '46px',
                          padding: '0 0.35rem',
                          borderRadius: '12px',
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          fontFamily: isHindi ? 'var(--font-devanagari)' : (isBengali ? 'var(--font-bengali)' : 'Lexend, sans-serif'),
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
                        <span>{formatChar(char)}</span>
                        {!isBengali && !isHindi && showCaseToggle === 'both' && (
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
                {isHindi ? 'अक्षर एक्सप्रेस मास्टर!' : (isBengali ? 'বর্ণমালা এক্সপ্রেস গ্র্যান্ড মাস্টার!' : 'Alphabet Train Grand Master!')}
              </h2>
              <p style={{ color: '#64748B', maxWidth: '440px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.5 }}>
                {isHindi
                  ? 'आपने ट्रेन के सभी डिब्बों को सही अक्षरों से जोड़ दिया! आपका वर्णमाला ज्ञान शानदार है!'
                  : (isBengali
                    ? 'তুমি ট্রেনের সমস্ত বগিকে সঠিক বর্ণ দিয়ে পূর্ণ করেছো! তোমার বর্ণ চেনার দক্ষতা দারুণ!'
                    : 'You repaired every single wagon on the tracks from start to finish! Your sequencing and letter recognition are outstanding!')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleRestart}
                className="btn btn-secondary"
                style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RotateCcw size={18} />
                <span>{isHindi ? 'पुनः खेलें' : (isBengali ? 'আবার খেলো' : 'Play Again')}</span>
              </button>
              <button
                onClick={onBack}
                className="btn btn-emerald"
                style={{ borderRadius: '9999px', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>{isHindi ? 'हब पर वापस' : (isBengali ? 'হাবে ফিরে যান' : 'Back to Hub')}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
