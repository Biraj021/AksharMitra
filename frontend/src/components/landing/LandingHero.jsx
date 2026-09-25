import React, { useState } from 'react';
import {
  Volume2,
  ArrowRight,
  Trophy,
  Flame,
  Target,
  Sparkles,
  Star,
  Compass,
  CheckCircle2,
  Circle,
  Play,
  Award,
  Crown,
  BookOpen,
  Zap,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { getChildRecommendation } from '@ai/adaptiveLearningStrategy';
import { ADVENTURE_ISLANDS } from '../../games/GamesHub';

export default function LandingHero({ onStartOnboarding, onOpenProfileSelector }) {
  const {
    activeProfile,
    setCurrentView,
    activeLanguage,
    t,
    setShowStreakModal,
    setShowEditProfileModal
  } = useProfile();

  const { playPop, playStarTwinkle, playChime, playSuccessFanfare, speakText } = useAudio();

  const [activeBadgeModal, setActiveBadgeModal] = useState(null);
  const [completedDailyQuests, setCompletedDailyQuests] = useState({
    login: true,
    letterQuest: false,
    spellingQuest: false
  });

  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

  const studentName = activeProfile?.name || (isHindi ? 'खोजी' : (isBengali ? 'অভিযাত্রী' : 'Explorer'));
  const studentEmoji = getAvatarEmoji(activeProfile?.avatarEmoji || activeProfile?.avatar);
  const starsCount = activeProfile?.stars || 55;
  const streakDays = activeProfile?.streak || 2;

  const recommendation = getChildRecommendation(activeProfile, activeLanguage?.id);

  // Daily magic letter configuration
  const magicLetterConfig = {
    english: {
      letter: 'B',
      sound: 'b',
      title: "Today's Magic Letter: B",
      clue: 'B has a straight stick first, then a round belly on the right! (➡️ b)',
      targetGame: 'letter-tracing'
    },
    bengali: {
      letter: 'ব',
      sound: 'ব',
      title: 'আজকের জাদুকরী বর্ণ: ব',
      clue: 'ব এর নিচে কোনো ফোঁটা নেই, আর ব এর পেটে সোজা মাত্রা!',
      targetGame: 'letter-tracing'
    },
    hindi: {
      letter: 'ब',
      sound: 'ब',
      title: 'आज का जादुई अक्षर: ब',
      clue: 'ब के पेट में तिरछी रेखा होती है, भ से अलग पहचानें!',
      targetGame: 'letter-tracing'
    }
  };

  const currentMagicLetter = isHindi
    ? magicLetterConfig.hindi
    : (isBengali ? magicLetterConfig.bengali : magicLetterConfig.english);

  // Trophy Badges showcase configuration
  const BADGES = [
    {
      id: 'crown_letters',
      icon: '👑',
      nameEn: 'Letter Explorer Crown',
      nameBn: 'বর্ণ অভিযাত্রী মুকুট',
      nameHi: 'अक्षर खोजी मुकुट',
      descEn: 'Master of mirror letters & magical handwriting strokes!',
      descBn: 'মিরর বর্ণ ও জাদুকরী হস্তলিপির রাজা!',
      descHi: 'दर्पण अक्षरों और सुंदर लिखावट के विजेता!',
      color: '#6366F1',
      bg: '#EEF2FF',
      islandId: 'island-letters'
    },
    {
      id: 'medal_sounds',
      icon: '🏅',
      nameEn: 'Sound Safari Medal',
      nameBn: 'সুর সাধক পদক',
      nameHi: 'ध्वनि साधक पदक',
      descEn: 'Master of alphabet train tracks and phonics sound blending!',
      descBn: 'বর্ণমালা ট্রেন ও শব্দ জোড়া লাগানোর চ্যাম্পিয়ন!',
      descHi: 'वर्णमाला ट्रेन और ध्वनि मिलान के कुशल खिलाड़ी!',
      color: '#059669',
      bg: '#ECFDF5',
      islandId: 'island-sounds'
    },
    {
      id: 'trophy_words',
      icon: '🏆',
      nameEn: 'Word Wizard Trophy',
      nameBn: 'শব্দ জাদুকর ট্রফি',
      nameHi: 'शब्द जादूगर ट्रॉफी',
      descEn: 'Caught tricky spelling traps and conquered memory sight words!',
      descBn: 'কঠিন বানানের ফাঁদ ধরা ও স্মৃতি বানান বিজয়ী!',
      descHi: 'वर्तनी जालों को मात देने वाले शब्द सम्राट!',
      color: '#D97706',
      bg: '#FFFBEB',
      islandId: 'island-words'
    },
    {
      id: 'flame_streak',
      icon: '🔥',
      nameEn: 'Streak Champion',
      nameBn: 'ধারাবাহিকতা বীর',
      nameHi: 'निरंतरता चैम्पियन',
      descEn: `${streakDays} Days of continuous reading fun without missing a beat!`,
      descBn: `টানা ${streakDays} দিন নিয়মিত পড়ার গৌরবময় অর্জন!`,
      descHi: `लगातार ${streakDays} दिनों से पढ़ने की अद्भुत लगन!`,
      color: '#EA580C',
      bg: '#FFF7ED',
      islandId: 'streak'
    }
  ];

  const handleLaunchRecommended = () => {
    playStarTwinkle();
    if (recommendation.activityId && recommendation.activityId !== 'games') {
      setCurrentView(recommendation.activityId);
    } else {
      setCurrentView('games');
    }
  };

  const handleRecommendedAudio = () => {
    playPop();
    speakText(recommendation.childPrompt, speechLang);
  };

  const handleMascotAudio = () => {
    playPop();
    const greeting = isHindi
      ? `नमस्ते ${studentName}! आपके मस्तिष्क की शक्ति रोज बढ़ रही है। आज कौन सा जादुई द्वीप घूमेंगे?`
      : (isBengali
        ? `নমস্কার ${studentName}! তোমার মেধা প্রতিদিন আরো ধারালো হচ্ছে। আজ কোন দ্বীপে অভিযান চালাবে?`
        : `Hey ${studentName}! Your reading superpowers are growing every single day! Tap any island below to begin!`);
    speakText(greeting, speechLang);
  };

  const handleMagicLetterAudio = () => {
    playPop();
    speakText(`${currentMagicLetter.letter}! ${currentMagicLetter.clue}`, speechLang);
  };

  const handleBadgeClick = (badge) => {
    playSuccessFanfare();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 }
    });
    setActiveBadgeModal(badge);
    const bName = isHindi ? badge.nameHi : (isBengali ? badge.nameBn : badge.nameEn);
    const bDesc = isHindi ? badge.descHi : (isBengali ? badge.descBn : badge.descEn);
    speakText(`${bName}! ${bDesc}`, speechLang);
  };

  const toggleQuest = (questKey, launchGameId) => {
    playChime();
    setCompletedDailyQuests(prev => ({
      ...prev,
      [questKey]: !prev[questKey]
    }));
    if (!completedDailyQuests[questKey]) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    }
    if (launchGameId) {
      setTimeout(() => {
        setCurrentView(launchGameId);
      }, 350);
    }
  };

  const completedCount = Object.values(completedDailyQuests).filter(Boolean).length;

  return (
    <div
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '0.75rem 0.5rem 3rem'
      }}
    >
      {/* ── 1. Hero Clubhouse Banner ──────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4338CA 0%, #312E81 100%)',
          color: 'white',
          borderRadius: '28px',
          padding: '1.4rem 1.6rem',
          boxShadow: '0 12px 28px rgba(49, 46, 129, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top bar: Welcome, Name, Edit, and Star Counter */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div>
            <div style={{ fontSize: '0.82rem', color: '#C7D2FE', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isHindi ? '🏰 आपके सीखने का क्लबहाउस' : (isBengali ? '🏰 তোমার শেখার ক্লাবহাউস' : '🏰 Your Learning Clubhouse')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: 0, color: 'white' }}>
                {studentName}! {studentEmoji}
              </h2>
              <button
                type="button"
                onClick={() => {
                  playPop();
                  if (setShowEditProfileModal) setShowEditProfileModal(true);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.22)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '9999px',
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'white',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backdropFilter: 'blur(4px)'
                }}
                title="Edit Profile"
              >
                <span>✏️</span>
                <span>{isHindi ? 'बदलें' : (isBengali ? 'বদলান' : 'Edit')}</span>
              </button>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#FDE047',
              fontWeight: 900,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            <Star size={18} fill="#FDE047" color="#FDE047" />
            <span>{starsCount} ⭐</span>
          </div>
        </div>

        {/* Streak Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <div
            onClick={() => {
              playPop();
              if (setShowStreakModal) setShowStreakModal(true);
            }}
            title="Attendance & Streak Calendar"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.22)',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: '1.5px solid rgba(255, 255, 255, 0.35)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Flame size={16} fill="#F97316" color="#F97316" className="animate-pulse" />
            <span>{streakDays} {t('readingStreak')}</span>
            <span
              style={{
                fontSize: '0.72rem',
                background: 'rgba(255, 255, 255, 0.3)',
                padding: '2px 7px',
                borderRadius: '9999px',
                fontWeight: 800,
                marginLeft: '0.2rem'
              }}
            >
              📅 {isHindi ? 'कैलेंडर' : (isBengali ? 'ক্যালেন্ডার' : 'Calendar')}
            </span>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: '#C7D2FE',
              fontWeight: 600
            }}
          >
            {isHindi
              ? '✨ हर दिन खेलें, नई शक्तियां जीतें!'
              : (isBengali
                ? '✨ প্রতিদিন পড়ো, নতুন শক্তি জয় করো!'
                : '✨ Play every day to level up your brain!')}
          </div>
        </div>
      </div>

      {/* ── 2. Mascot Mitra's Friendly Interactive Speech Bubble ─────────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '2px solid #E0E7FF',
          borderRadius: '24px',
          padding: '1.1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 6px 18px rgba(79, 70, 229, 0.06)'
        }}
      >
        <div
          onClick={handleMascotAudio}
          title="Tap Mitra to Listen!"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            flexShrink: 0,
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08) rotate(5deg)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
        >
          🦉
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{isHindi ? 'मित्रा आपका साथी' : (isBengali ? 'মিত্রা তোমার বন্ধু' : 'Mitra Your Companion')}</span>
              <span style={{ fontSize: '0.72rem', color: '#4F46E5', background: '#EEF2FF', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontWeight: 800 }}>
                {isHindi ? 'बोलने के लिए टैप करें' : (isBengali ? 'শুনতে ট্যাপ করো' : 'Tap to Listen')}
              </span>
            </div>
            <button
              onClick={handleMascotAudio}
              style={{
                background: '#EEF2FF',
                border: '1px solid #C7D2FE',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4F46E5'
              }}
              title="Hear Mitra Speak"
            >
              <Volume2 size={16} />
            </button>
          </div>

          <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
            {isHindi
              ? `हूट-हूट! आज का दिन सीखने के लिए शानदार है। 3 जादुई द्वीपों पर मिशन आपका इंतज़ार कर रहे हैं!`
              : (isBengali
                ? `হুট-হুট! আজকের দিনটি শেখার জন্য দারুণ। ৩টি জাদুকরী দ্বীপে তোমার নতুন অভিযান অপেক্ষা করছে!`
                : `Hoot-hoot! Your brain is growing stronger today. 3 Magical Islands are waiting for your quest!`)}
          </p>
        </div>
      </div>

      {/* ── 3. Today's Star Mission (Personalized AI or Featured Quest) ──── */}
      <div
        style={{
          background: recommendation.hasPersonalized
            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          borderRadius: '24px',
          padding: '1.25rem 1.4rem',
          boxShadow: '0 10px 24px rgba(5, 150, 105, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.8rem' }}>{recommendation.icon || '🌟'}</span>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', color: '#A7F3D0', letterSpacing: '0.04em' }}>
                {isHindi ? '🌟 आज का खास अभियान' : (isBengali ? '🌟 আজকের বিশেষ মিশন' : "🌟 TODAY'S STAR MISSION")}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0.1rem 0 0', color: 'white' }}>
                {recommendation.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleRecommendedAudio}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
            title="Listen to Mission"
          >
            <Volume2 size={17} />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#ECFDF5', margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
          {recommendation.childPrompt}
        </p>

        <button
          onClick={handleLaunchRecommended}
          style={{
            background: 'white',
            color: '#065F46',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.92rem',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Play size={16} fill="#065F46" color="#065F46" />
          <span>{recommendation.buttonText}</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* ── 4. Daily Mini-Quests (3-Step Checklist with Star Rewards) ─────── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '2px solid #F1F5F9',
          padding: '1.25rem 1.35rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🎯</span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                {isHindi ? 'दैनिक मिनी-क्वेस्ट' : (isBengali ? 'দৈনিক মিনি-কোয়েস্ট' : 'Daily Mini-Quests')}
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.15rem 0 0' }}>
              {isHindi
                ? 'आज के 3 लक्ष्य पूरे करें और बोनस सितारे जीतें!'
                : (isBengali
                  ? 'আজকের ৩টি লক্ষ্য পূরণ করো এবং বোনাস তারা জেতো!'
                  : 'Finish 3 goals today and earn bonus stars!')}
            </p>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: completedCount === 3 ? '#15803D' : '#4338CA',
              background: completedCount === 3 ? '#DCFCE7' : '#EEF2FF',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px'
            }}
          >
            {completedCount}/3 {isHindi ? 'पूर्ण' : (isBengali ? 'সম্পন্ন' : 'Done')}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
          <div
            style={{
              width: `${(completedCount / 3) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
              transition: 'width 0.3s ease',
              borderRadius: '9999px'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {/* Quest 1: Daily Checkin */}
          <div
            onClick={() => toggleQuest('login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '16px',
              background: completedDailyQuests.login ? '#F0FDF4' : '#F8FAFC',
              border: completedDailyQuests.login ? '1.5px solid #86EFAC' : '1.5px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {completedDailyQuests.login ? (
                <CheckCircle2 size={20} color="#16A34A" />
              ) : (
                <Circle size={20} color="#94A3B8" />
              )}
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: completedDailyQuests.login ? '#166534' : '#334155' }}>
                  {isHindi ? 'क्लबहाउस में हाज़िरी' : (isBengali ? 'ক্লাবহাউসে উপস্থিতি' : 'Clubhouse Daily Check-in')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  {isHindi ? 'सिलसिला जारी रखने के लिए' : (isBengali ? 'ধারাবাহিকতা বজায় রাখতে' : 'Keep your streak alive')}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706' }}>+1 ⭐</span>
          </div>

          {/* Quest 2: Letter or Sound Mission */}
          <div
            onClick={() => toggleQuest('letterQuest', 'letter-hunter')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '16px',
              background: completedDailyQuests.letterQuest ? '#F0FDF4' : '#F8FAFC',
              border: completedDailyQuests.letterQuest ? '1.5px solid #86EFAC' : '1.5px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {completedDailyQuests.letterQuest ? (
                <CheckCircle2 size={20} color="#16A34A" />
              ) : (
                <Circle size={20} color="#94A3B8" />
              )}
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: completedDailyQuests.letterQuest ? '#166534' : '#334155' }}>
                  {isHindi ? '1 अक्षर या ध्वनि खेल खेलें' : (isBengali ? '১টি বর্ণ বা সুরের খেলা খেলো' : 'Conquer 1 Letter or Sound Quest')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  {isHindi ? 'बाज की नज़र या अक्षर ट्रेन' : (isBengali ? 'ঈগল চোখ বা বর্ণমালা ট্রেন' : 'Eagle Eye or Alphabet Train')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706' }}>+3 ⭐</span>
              <button
                type="button"
                style={{
                  background: '#4F46E5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isHindi ? 'खेलें' : (isBengali ? 'খেলো' : 'Play')}
              </button>
            </div>
          </div>

          {/* Quest 3: Spelling Trap Buster */}
          <div
            onClick={() => toggleQuest('spellingQuest', 'spelling-traps')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: '16px',
              background: completedDailyQuests.spellingQuest ? '#F0FDF4' : '#F8FAFC',
              border: completedDailyQuests.spellingQuest ? '1.5px solid #86EFAC' : '1.5px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {completedDailyQuests.spellingQuest ? (
                <CheckCircle2 size={20} color="#16A34A" />
              ) : (
                <Circle size={20} color="#94A3B8" />
              )}
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: completedDailyQuests.spellingQuest ? '#166534' : '#334155' }}>
                  {isHindi ? '1 वर्तनी जाल पकड़ें' : (isBengali ? '১টি বানানের ফাঁদ ধরো' : 'Beat 1 Sneaky Spelling Trap')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  {isHindi ? 'FROM vs FORM या जल vs लज' : (isBengali ? 'জল বনাম লজ এর ফাঁদ' : 'Catch letter swaps')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#D97706' }}>+5 ⭐</span>
              <button
                type="button"
                style={{
                  background: '#D97706',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isHindi ? 'खेलें' : (isBengali ? 'খেলো' : 'Play')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. 3 Magical Adventure Islands (Direct Launch Showcase) ──────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
              {isHindi ? '🗺️ 3 जादुई सीखने के द्वीप' : (isBengali ? '🗺️ ৩টি জাদুকরী শেখার দ্বীপ' : '🗺️ 3 Magical Learning Islands')}
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.15rem 0 0' }}>
              {isHindi
                ? 'अपनी पसंद का द्वीप चुनें और साहसिक यात्रा शुरू करें!'
                : (isBengali
                  ? 'পছন্দের দ্বীপ বেছে নিয়ে মজার অভিযান শুরু করো!'
                  : 'Choose an island module and launch right in!')}
            </p>
          </div>

          <button
            onClick={() => {
              playPop();
              setCurrentView('games');
            }}
            style={{
              background: '#EEF2FF',
              color: '#4338CA',
              border: '1px solid #C7D2FE',
              borderRadius: '9999px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <span>{isHindi ? 'पूरा नक्शा' : (isBengali ? 'পুরো মানচিত্র' : 'Full Map')}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
          {ADVENTURE_ISLANDS.map((island) => {
            const islandName = isHindi ? island.nameHi : (isBengali ? island.nameBn : island.nameEn);
            const islandSubtitle = isHindi ? island.subtitleHi : (isBengali ? island.subtitleBn : island.subtitleEn);
            const firstMissionId = island.missions[0]?.id || 'letter-hunter';

            return (
              <div
                key={island.id}
                onClick={() => {
                  playStarTwinkle();
                  setCurrentView(firstMissionId);
                }}
                style={{
                  background: 'white',
                  borderRadius: '22px',
                  border: `2px solid ${island.badgeBorder}`,
                  padding: '1.15rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.18s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>{island.icon}</span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: island.badgeColor,
                        background: island.badgeBg,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px'
                      }}
                    >
                      {isHindi ? `मॉड्यूल ${island.islandNumber}` : (isBengali ? `মডিউল ${island.islandNumber}` : `Module ${island.islandNumber}`)}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#1E293B', margin: '0 0 0.25rem' }}>
                    {islandName}
                  </h4>
                  <p style={{ fontSize: '0.76rem', color: '#64748B', margin: 0, lineHeight: 1.35 }}>
                    {islandSubtitle}
                  </p>
                </div>

                <div
                  style={{
                    background: island.gradient,
                    color: 'white',
                    padding: '0.45rem',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
                  }}
                >
                  <Play size={13} fill="white" color="white" />
                  <span>{isHindi ? 'खोलें' : (isBengali ? 'খেলো' : 'Launch Island')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 6. Interactive "Magic Letter of the Day" Tile ─────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '2px solid #FDE68A',
          borderRadius: '24px',
          padding: '1.15rem 1.3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 14px rgba(217, 119, 6, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            onClick={handleMagicLetterAudio}
            title="Hear Letter Sound"
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '18px',
              background: '#F59E0B',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
              flexShrink: 0
            }}
          >
            {currentMagicLetter.letter}
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase', color: '#B45309', letterSpacing: '0.04em' }}>
              ✨ {currentMagicLetter.title}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#92400E', margin: '0.15rem 0 0', lineHeight: 1.35, fontWeight: 600 }}>
              {currentMagicLetter.clue}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <button
            onClick={handleMagicLetterAudio}
            style={{
              background: 'white',
              border: '1.5px solid #FDE68A',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#D97706'
            }}
            title="Listen to Sound"
          >
            <Volume2 size={18} />
          </button>

          <button
            onClick={() => {
              playStarTwinkle();
              setCurrentView(currentMagicLetter.targetGame);
            }}
            style={{
              background: '#D97706',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.45rem 0.95rem',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)'
            }}
          >
            {isHindi ? 'सुलेख करें ✍️' : (isBengali ? 'আঁকা শিখি ✍️' : 'Trace It ✍️')}
          </button>
        </div>
      </div>

      {/* ── 7. Kid's Trophy & Badges Showcase ────────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          border: '2px solid #F1F5F9',
          padding: '1.25rem 1.35rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🏆</span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                {isHindi ? 'आपकी ट्रॉफियां और पदक' : (isBengali ? 'তোমার ট্রফি ও পদকসমূহ' : 'Your Trophies & Badges')}
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.15rem 0 0' }}>
              {isHindi
                ? 'किसी भी बैज पर टैप करके अपनी उपलब्धि देखें!'
                : (isBengali
                  ? 'যেকোনো ব্যাজে ট্যাপ করে তোমার গৌরবময় অর্জন দেখো!'
                  : 'Tap any badge to celebrate your achievements!')}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {BADGES.map((badge) => {
            const bName = isHindi ? badge.nameHi : (isBengali ? badge.nameBn : badge.nameEn);

            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                style={{
                  background: badge.bg,
                  borderRadius: '18px',
                  border: `1.5px solid ${badge.color}33`,
                  padding: '0.85rem 0.6rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <span style={{ fontSize: '2.1rem' }}>{badge.icon}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: badge.color, lineHeight: 1.2 }}>
                  {bName}
                </span>
                <span style={{ fontSize: '0.66rem', color: '#64748B', background: 'white', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontWeight: 700 }}>
                  ★ {isHindi ? 'अनलॉक' : (isBengali ? 'আনলক' : 'Unlocked')}
                </span>
              </div>
            );
          })}
        </div>

        {/* Modal tooltip alert for badge */}
        {activeBadgeModal && (
          <div
            style={{
              marginTop: '1rem',
              background: activeBadgeModal.bg,
              border: `2px solid ${activeBadgeModal.color}`,
              borderRadius: '18px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '1.8rem' }}>{activeBadgeModal.icon}</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.92rem', color: activeBadgeModal.color }}>
                  {isHindi ? activeBadgeModal.nameHi : (isBengali ? activeBadgeModal.nameBn : activeBadgeModal.nameEn)}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#475569' }}>
                  {isHindi ? activeBadgeModal.descHi : (isBengali ? activeBadgeModal.descBn : activeBadgeModal.descEn)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveBadgeModal(null)}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.2rem 0.6rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ── 8. Quick Discovery / Screening Island Link ────────────────────── */}
      <div
        onClick={() => {
          playStarTwinkle();
          setCurrentView('screening');
        }}
        style={{
          background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
          borderRadius: '22px',
          border: '1.5px solid #C7D2FE',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.05)',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              color: 'white'
            }}
          >
            🎯
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                {t('screeningIslandTitle')}
              </h4>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#4338CA', background: 'white', padding: '0.1rem 0.45rem', borderRadius: '9999px' }}>
                3 Mini-Games
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0.1rem 0 0' }}>
              {t('screeningIslandSubtitle')}
            </p>
          </div>
        </div>

        <ArrowRight size={18} color="#4F46E5" />
      </div>
    </div>
  );
}
