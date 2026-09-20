import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Star, Volume2, ArrowRight } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';
import { getChildRecommendation } from '../utils/adaptiveLearningStrategy';

const LEARNING_MODULES_EN = [
  {
    id: 'word-snapper',
    label: 'Word Snapper',
    icon: '🧩',
    track: 'both',
    levelLabel: 'LEVEL 1: SOUND LAB',
    categoryBadge: 'Multisensory Phonics',
    recommendedTag: 'Universal Core',
    title: 'Word Snapper',
    sampleImage: '🧶',
    sampleWord: 'RUG',
    instruction: 'Tap each letter to hear its name, then blend R · U · G into RUG!',
    tiles: ['R', 'U', 'G'],
    description: 'Snap letter tiles into slots, hear real phoneme sounds, and master b / d / p / q mirror words!'
  },
  {
    id: 'spelling-clinic',
    label: 'Spelling Clinic',
    icon: '🧠',
    track: 'track_b',
    levelLabel: 'LEVEL 2: TRICKY SIGHT WORDS',
    categoryBadge: 'Look-Cover-Write',
    recommendedTag: 'Track B: Dyslexia Support',
    title: 'Spelling Clinic',
    sampleImage: '🤝',
    sampleWord: 'FRIEND',
    instruction: 'Remember: A FRIend is someone you stay with until the END!',
    tiles: ['F', 'R', 'I', 'E', 'N', 'D'],
    description: 'Mnemonic hooks, Look-Cover-Write training, and a 4-line handwriting canvas for dysgraphia support.'
  },
  {
    id: 'abc-fill-in',
    label: 'ABC Fill-In',
    icon: '🔤',
    track: 'both',
    levelLabel: 'LEVEL 3: ALPHABET TRAIN',
    categoryBadge: 'Visual Dyslexia Keyboard',
    recommendedTag: 'Alphabet Flow',
    title: 'ABC Alphabet Train',
    sampleImage: '🚂',
    sampleWord: 'A B [C] D E',
    instruction: 'Restore the missing alphabet wagons using the color-coded visual keyboard!',
    tiles: ['A', 'B', '?', 'D', 'E'],
    description: 'Repair alphabet train wagons with vowel-highlighted dyslexia keyboard and sound feedback.'
  },
  {
    id: 'spelling-traps',
    label: 'Spelling Traps',
    icon: '⚡',
    track: 'track_a',
    levelLabel: 'LEVEL 4: TRANSPOSITION SPOTTER',
    categoryBadge: 'Letter-Swap Traps',
    recommendedTag: 'Track A: Speed & Precision',
    title: 'Spelling Trap Challenge',
    sampleImage: '🎁',
    sampleWord: 'FROM vs FORM',
    instruction: 'Spot sneaky letter-swap traps in fun contextual story sentences!',
    tiles: ['F', 'R', 'O', 'M'],
    description: 'Spot letter-swap traps like FROM/FORM, PLAY/PALY, and GIRL/GRIL.'
  },
  {
    id: 'letter-hunter',
    label: 'Letter Hunter',
    icon: '🎯',
    track: 'track_b',
    levelLabel: 'LEVEL 5: EAGLE EYE GRID',
    categoryBadge: 'Visual Discrimination',
    recommendedTag: 'Track B: Mirror Clarity',
    title: 'Letter Hunter',
    sampleImage: '🦅',
    sampleWord: 'FIND: b',
    instruction: 'Find target letters hidden among tricky mirror letters with combo streaks!',
    tiles: ['b', 'd', 'b', 'p'],
    description: 'Eagle-eye grid quest for subtle visual orientation distinction.'
  },
  {
    id: 'letter-tracing',
    label: 'Letter Tracing',
    icon: '✍️',
    track: 'track_b',
    levelLabel: 'LEVEL 6: MULTISENSORY TRACING',
    categoryBadge: 'Motor Dysgraphia Lab',
    recommendedTag: 'Track B: Tactile Motor',
    title: 'Magic Letter Tracing',
    sampleImage: '✨',
    sampleWord: 'TRACE: b',
    instruction: 'Trace stroke-by-stroke with magnetic guide dots, audio hints, and instant stars!',
    tiles: ['1', '2', '3', '⭐'],
    description: 'Guided directional handwriting canvas with ghost letters and Mitra demonstrations.'
  }
];

const LEARNING_MODULES_BN = [
  {
    id: 'word-snapper',
    label: 'শব্দ সংগ্রাহক',
    icon: '🧩',
    track: 'both',
    levelLabel: 'লেভেল ১: ধ্বনি ও শব্দ গঠন',
    categoryBadge: 'মাল্টি-সেন্সরি ধ্বনিবিজ্ঞান',
    recommendedTag: 'মৌলিক শিক্ষা',
    title: 'শব্দ সংগ্রাহক',
    sampleImage: '🌊',
    sampleWord: 'জল',
    instruction: 'প্রতিটি বর্ণের উপর ট্যাপ করে শব্দ শোনো, এবং জ · ল মিলিয়ে "জল" গঠন করো!',
    tiles: ['জ', 'ল'],
    description: 'পড়ন্ত বর্ণ ব্লকে শব্দ গঠন করো এবং বর্ণ-বিভ্রান্তি দূর করো!'
  },
  {
    id: 'spelling-clinic',
    label: 'বানান নিরাময়',
    icon: '🧠',
    track: 'track_b',
    levelLabel: 'লেভেল ২: কঠিন বানান কৌশল',
    categoryBadge: 'স্মৃতি ও বর্ণ সংযোগ',
    recommendedTag: 'ট্র্যাক খ: ডিসলেক্সিয়া সহায়তা',
    title: 'বানান নিরাময় ক্লিনিক',
    sampleImage: '🤝',
    sampleWord: 'বন্ধু',
    instruction: 'মনে রাখো: ব + ন্ধ + ু মিলে তৈরি হয় "বন্ধু"!',
    tiles: ['ব', 'ন', '্ধ', 'ু'],
    description: 'অডিও সংকেত ও যুক্তবর্ণের সহজ কৌশলের মাধ্যমে বানান সংশোধন করো।'
  },
  {
    id: 'abc-fill-in',
    label: 'বর্ণমালা ট্রেন',
    icon: '🔤',
    track: 'both',
    levelLabel: 'লেভেল ৩: বর্ণমালা মেলানো',
    categoryBadge: 'দৃষ্টি সহায়ক কিবোর্ড',
    recommendedTag: 'বর্ণের ক্রমধারা',
    title: 'বর্ণমালা ট্রেন অভিযান',
    sampleImage: '🚂',
    sampleWord: 'অ আ [ই] ঈ',
    instruction: 'রঙিন বর্ণ কিবোর্ড ব্যবহার করে ট্রেনের মিসিং বগি ঠিক করো!',
    tiles: ['অ', 'আ', '?', 'ঈ'],
    description: 'স্বরবর্ণ ও ব্যঞ্জনবর্ণের সঠিক ক্রমধারা অভ্যাস করার খেলা।'
  },
  {
    id: 'spelling-traps',
    label: 'বানান ফাঁদ',
    icon: '⚡',
    track: 'track_a',
    levelLabel: 'লেভেল ৪: বিভ্রান্তিকর বানান',
    categoryBadge: 'বানান ধাঁধা ও গতি',
    recommendedTag: 'ট্র্যাক ক: দ্রুত পঠন',
    title: 'বানান ফাঁদ চ্যালেঞ্জ',
    sampleImage: '🎁',
    sampleWord: 'পাতা vs পাতা',
    instruction: 'বাক্যের সঠিক অর্থ অনুযায়ী সঠিক বানানটি বেছে নাও!',
    tiles: ['প', 'া', 'ত', 'া'],
    description: 'কাছাকাছি বানানের সূক্ষ্ম পার্থক্য চেনার আনন্দদায়ক প্রতিযোগিতা।'
  },
  {
    id: 'letter-hunter',
    label: 'বর্ণ শিকারী',
    icon: '🎯',
    track: 'track_b',
    levelLabel: 'লেভেল ৫: তীক্ষ্ণ দৃষ্টি গ্রিড',
    categoryBadge: 'দৃষ্টিগত পার্থক্য',
    recommendedTag: 'ট্র্যাক খ: ব/র স্পষ্টতা',
    title: 'বর্ণ শিকারী',
    sampleImage: '🦅',
    sampleWord: 'খোঁজো: ব',
    instruction: 'গ্রিডের মধ্যে লুকানো বর্ণগুলো দ্রুত খুঁজে বের করে কম্বো অর্জন করো!',
    tiles: ['ব', 'র', 'ব', 'ক'],
    description: 'ব ও র, ক ও ধ এর মতো কাছাকাছি বর্ণের বিভ্রান্তি দূর করার সেরা খেলা।'
  },
  {
    id: 'letter-tracing',
    label: 'বর্ণাভ্যাস ট্রেসিং',
    icon: '✍️',
    track: 'track_b',
    levelLabel: 'লেভেল ৬: স্পর্শভিত্তিক বর্ণাভ্যাস',
    categoryBadge: 'হাতের কাজ ও মোটর ল্যাব',
    recommendedTag: 'ট্র্যাক খ: স্পর্শভিত্তিক মোটর',
    title: 'ম্যাজিক বর্ণ ট্রেসিং',
    sampleImage: '✨',
    sampleWord: 'আঁকো: ক',
    instruction: 'উজ্জ্বল তারার নির্দেশিত পথ ধরে সুন্দর করে বর্ণ আঁকো!',
    tiles: ['১', '২', '৩', '⭐'],
    description: 'সঠিক বর্ণ অঙ্কন দিক ও নির্ভুল স্ট্রোকের সহায়ক ক্যানভাস।'
  }
];

const LEARNING_MODULES_HI = [
  {
    id: 'word-snapper',
    label: 'शब्द निर्माता',
    icon: '🧩',
    track: 'both',
    levelLabel: 'लेवल 1: ध्वनि प्रयोगशाला',
    categoryBadge: 'बहु-संवेदी ध्वन्यात्मकता',
    recommendedTag: 'सार्वभौमिक मुख्य',
    title: 'शब्द निर्माता (Word Snapper)',
    sampleImage: '🏠',
    sampleWord: 'घर',
    instruction: 'प्रत्येक अक्षर को सुनकर जोड़ें, फिर घ · र को मिलाकर घर बनाएं!',
    tiles: ['घ', 'र'],
    description: 'अक्षर टाइल्स को सही क्रम में जोड़ें, वास्तविक ध्वनियाँ सुनें और ब/भ, द/ध के भ्रम पर विजय पाएं!'
  },
  {
    id: 'spelling-clinic',
    label: 'वर्तनी क्लिनिक',
    icon: '🧠',
    track: 'track_b',
    levelLabel: 'लेवल 2: कठिन दृष्टि शब्द',
    categoryBadge: 'देखो-ढंको-लिखो',
    recommendedTag: 'ट्रैक B: डिस्लेक्सिया सहायता',
    title: 'वर्तनी क्लिनिक (Spelling Clinic)',
    sampleImage: '🤝',
    sampleWord: 'मित्र',
    instruction: 'याद रखें: सच्चा मित्र हमेशा साथ निभाता है!',
    tiles: ['म', 'ि', 'त', '्', 'र'],
    description: 'स्मृति संकेत, देखो-ढंको-लिखो तकनीक और डिस्ग्राफिया सहायता के लिए 4-लाइन लिखावट कैनवास।'
  },
  {
    id: 'abc-fill-in',
    label: 'वर्णमाला एक्सप्रेस',
    icon: '🔤',
    track: 'both',
    levelLabel: 'लेवल 3: वर्णमाला ट्रेन',
    categoryBadge: 'दृश्य वर्णमाला कीबोर्ड',
    recommendedTag: 'वर्णमाला प्रवाह',
    title: 'वर्णमाला ट्रेन (Alphabet Train)',
    sampleImage: '🚂',
    sampleWord: 'क ख [ग] घ ङ',
    instruction: 'वर्णमाला ट्रेन के छूटे हुए डिब्बों को सही क्रम में लगाएं!',
    tiles: ['क', 'ख', '?', 'घ', 'ङ'],
    description: 'वर्णमाला के सही क्रम को पहचानें और ट्रेन के छूटे डिब्बों को पूरा करें।'
  },
  {
    id: 'spelling-traps',
    label: 'वर्तनी जाल',
    icon: '⚡',
    track: 'track_a',
    levelLabel: 'लेवल 4: अक्षर विस्थापन पहचान',
    categoryBadge: 'अक्षर-बदलाव जाल',
    recommendedTag: 'ट्रैक A: गति और सटीकता',
    title: 'वर्तनी जाल चुनौती (Spelling Traps)',
    sampleImage: '💧',
    sampleWord: 'पानी vs पानि',
    instruction: 'कहानियों में छिपी गलत वर्तनी और सही मात्राओं को पहचानें!',
    tiles: ['प', 'ा', 'न', 'ी'],
    description: 'मात्राओं के सही प्रयोग और सूक्ष्म वर्तनी भ्रम को दूर करने का अभ्यास।'
  },
  {
    id: 'letter-hunter',
    label: 'अक्षर खोजी',
    icon: '🎯',
    track: 'track_b',
    levelLabel: 'लेवल 5: दृश्य भेदभाव',
    categoryBadge: 'ऑर्टन-गिलिंघम विज़ुअल',
    recommendedTag: 'ट्रैक B: दृश्य भेदभाव',
    title: 'अक्षर खोजी (Letter Hunter)',
    sampleImage: '🔍',
    sampleWord: 'ब vs भ',
    instruction: 'ग्रिड से लक्ष्य अक्षर ब को खोजें और भ/व के भ्रम से बचें!',
    tiles: ['ब', 'भ', 'द', 'ध'],
    description: 'ब/भ, द/ध और प/ष जैसे मिलते-जुलते अक्षरों में दृश्य अंतर पहचानने का मजेदार खेल।'
  },
  {
    id: 'letter-tracing',
    label: 'अक्षर आलेखन',
    icon: '✍️',
    track: 'track_b',
    levelLabel: 'लेवल 6: स्पर्श-आधारित आलेखन',
    categoryBadge: 'गति और स्पर्श लैब',
    recommendedTag: 'ट्रैक B: स्पर्श-आधारित गति',
    title: 'जादुई अक्षर आलेखन',
    sampleImage: '✨',
    sampleWord: 'बनाएं: क',
    instruction: 'चमकते सितारों का अनुसरण करते हुए सुंदर अक्षर बनाएं!',
    tiles: ['1', '2', '3', '⭐'],
    description: 'सटीक स्ट्रोक और सही आलेखन दिशा के लिए संवेदी कैनवास।'
  }
];

export default function GamesHub({ onSelectGame }) {
  const { activeProfile, setCurrentView, activeLanguage, t } = useProfile();
  const { playPop, playStarTwinkle } = useAudio();

  const recommendedActivityId = activeProfile?.learningProfile?.recommendedActivityId;
  const recommendation = getChildRecommendation(activeProfile, activeLanguage?.id);

  const [activeModuleId, setActiveModuleId] = useState(() => {
    return recommendedActivityId && recommendedActivityId !== 'screening'
      ? recommendedActivityId
      : 'word-snapper';
  });
  const [trackFilter, setTrackFilter] = useState('all'); // 'all' | 'track_a' | 'track_b'

  // Keep activeModuleId synchronized with real-time profile updates
  useEffect(() => {
    if (recommendedActivityId && recommendedActivityId !== 'screening') {
      setActiveModuleId(recommendedActivityId);
    }
  }, [recommendedActivityId]);

  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const LEARNING_MODULES = isHindi ? LEARNING_MODULES_HI : (isBengali ? LEARNING_MODULES_BN : LEARNING_MODULES_EN);
  const isAtRisk = activeProfile?.riskLevel && activeProfile.riskLevel !== 'typical';

  const filteredModules = LEARNING_MODULES.filter((m) => {
    if (trackFilter === 'all') return true;
    if (trackFilter === 'track_a') return m.track === 'track_a' || m.track === 'both';
    if (trackFilter === 'track_b') return m.track === 'track_b' || m.track === 'both';
    return true;
  });

  const selectedModule = LEARNING_MODULES.find((m) => m.id === activeModuleId) || filteredModules[0] || LEARNING_MODULES[0];

  const handleLaunch = (gameId) => {
    playStarTwinkle();
    if (onSelectGame) {
      onSelectGame(gameId);
    } else {
      setCurrentView(gameId);
    }
  };

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '0.5rem 0.25rem 2rem'
      }}
    >
      {/* 1. Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #064E3B 100%)',
          color: 'white',
          borderRadius: '28px',
          padding: '1.5rem',
          boxShadow: '0 12px 28px rgba(6, 78, 59, 0.25)'
        }}
      >
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', margin: '0 0 0.4rem' }}>
          {t('gamesHubTitle')}
        </h2>
        <p style={{ fontSize: '1rem', color: '#A7F3D0', lineHeight: 1.45, margin: 0 }}>
          {t('gamesHubSubtitle')}
        </p>
      </div>

      {/* 2. Personalized Student Adaptive Pathway Banner */}
      <div
        style={{
          background: recommendation.hasPersonalized ? '#ECFDF5' : '#F0FDF4',
          border: recommendation.hasPersonalized ? '1.5px solid #A7F3D0' : '1.5px solid #BBF7D0',
          borderRadius: '20px',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <span style={{ fontSize: '1.8rem' }}>{recommendation.icon || '🌟'}</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#065F46' }}>
            {recommendation.hasPersonalized
              ? (isHindi ? `⭐ आपके लिए अनुशंसित: ${recommendation.title}` : (isBengali ? `⭐ তোমার জন্য নির্দেশিত: ${recommendation.title}` : `⭐ Recommended for You: ${recommendation.title}`))
              : (isHindi ? `🌟 ${activeProfile?.name || 'खोजी'} की सीखने की लैब` : (isBengali ? `🌟 ${activeProfile?.name || 'অভিযাত্রী'}র শিক্ষণ ল্যাব` : `🌟 ${activeProfile?.name || 'Explorer'}'s Learning Lab`))}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.15rem' }}>
            {recommendation.hasPersonalized
              ? recommendation.childPrompt
              : (isHindi ? 'पठन गति, अक्षर अभ्यास और शब्द निर्माण के मजेदार खेलों का आनंद लें!' : (isBengali ? 'পড়ার গতি, বর্ণাভ্যাস ও শব্দ গঠনের মজার খেলাগুলো উপভোগ করো!' : 'Explore fun games for reading fluency, letter tracing, and word building!'))}
          </div>
        </div>
      </div>

      {/* 3. Dual-Track Pathway Filter Tabs (Removed for simplicity) */}

      {/* 4. Top Activity Category Pills Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.5rem'
        }}
      >
        {filteredModules.map((mod) => {
          const isActive = mod.id === activeModuleId;
          const isRecommendedForProfile = Boolean(
            recommendedActivityId &&
            recommendedActivityId !== 'screening' &&
            mod.id === recommendedActivityId
          );
          return (
            <button
              key={mod.id}
              onClick={() => {
                playPop();
                setActiveModuleId(mod.id);
              }}
              style={{
                background: isActive ? '#ECFDF5' : 'white',
                border: isActive ? '2px solid #10B981' : isRecommendedForProfile ? '2px solid #F59E0B' : '1.5px solid #E2E8F0',
                borderRadius: '16px',
                padding: '0.65rem 0.4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.18)' : isRecommendedForProfile ? '0 3px 10px rgba(245, 158, 11, 0.18)' : '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              {isRecommendedForProfile && (
                <span style={{ position: 'absolute', top: '-6px', right: '-4px', background: '#F59E0B', color: 'white', fontSize: '9px', fontWeight: 900, padding: '1px 6px', borderRadius: '9999px', boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)' }}>
                  ★ TOP
                </span>
              )}
              <span style={{ fontSize: '1.4rem' }}>{mod.icon}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: isActive ? '#065F46' : isRecommendedForProfile ? '#92400E' : '#475569',
                  textAlign: 'center',
                  lineHeight: 1.2
                }}
              >
                {mod.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Active Learning Activity Preview Card */}
      <div
        className="glass-card"
        style={{
          background: 'white',
          borderRadius: '26px',
          padding: '1.5rem',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1rem'
        }}
      >
        {/* Clean Activity Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#4338CA', textTransform: 'uppercase' }}>
            {selectedModule.title}
          </span>
        </div>

        {/* Visual Item Illustration */}
        <div style={{ fontSize: '3.5rem', margin: '0.25rem 0' }}>
          {selectedModule.sampleImage}
        </div>

        {/* Word Display */}
        <div
          style={{
            background: '#F8FAFC',
            border: '2px solid #E2E8F0',
            borderRadius: '16px',
            padding: '0.5rem 1.75rem',
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#1E293B',
            fontFamily: "'Lexend', sans-serif",
            letterSpacing: '0.08em'
          }}
        >
          {selectedModule.sampleWord}
        </div>

        <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.45, maxWidth: '400px' }}>
          {selectedModule.instruction}
        </p>

        {/* Letter Tiles Demonstration */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {selectedModule.tiles.map((char, i) => (
            <div
              key={i}
              style={{
                width: '46px',
                height: '56px',
                borderRadius: '14px',
                background: '#EEF2FF',
                border: '2px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#4338CA',
                fontFamily: "'Lexend', sans-serif"
              }}
            >
              {char}
            </div>
          ))}
        </div>

        {/* Play Now CTA Button */}
        <button
          onClick={() => handleLaunch(selectedModule.id)}
          className="animate-pulse-glow"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.85rem',
            fontSize: '1.05rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
            marginTop: '0.5rem'
          }}
        >
          <Play size={20} fill="white" color="white" />
          <span>{isHindi ? `${selectedModule.title} शुरू करें 🚀` : (isBengali ? `${selectedModule.title} শুরু করো 🚀` : `Launch ${selectedModule.title} 🚀`)}</span>
        </button>
      </div>
    </div>
  );
}
