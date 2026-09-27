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
  ChevronRight,
  Sparkle
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
  const starsCount = activeProfile?.stars || 85;
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
      gradient: 'linear-gradient(135deg, #818CF8 0%, #4F46E5 100%)',
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
      gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
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
      gradient: 'linear-gradient(135deg, #FBBF24 0%, #D97706 100%)',
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
      gradient: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)',
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
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}
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
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      } catch (e) {}
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
        maxWidth: '780px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.4rem',
        padding: '0.5rem 0.75rem 4rem'
      }}
    >
      {/* ── 1. 3D Holographic Hero Clubhouse Banner ────────────────────────── */}
      <div
        className="holo-explorer-card"
        style={{
          borderRadius: '30px',
          padding: '1.6rem 1.8rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #FDE047 0%, #F59E0B 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3.2rem',
                boxShadow: '0 10px 24px rgba(245, 158, 11, 0.45)',
                border: '3px solid rgba(255, 255, 255, 0.8)',
                flexShrink: 0
              }}
            >
              {studentEmoji}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.76rem', color: '#FDE047', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  🏰 {isHindi ? 'क्लबहाउस' : (isBengali ? 'ক্লাবহাউস' : 'Clubhouse')} • {activeProfile?.gradeLabel || 'Grade 2'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0.1rem 0 0.2rem', color: '#FFFFFF', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                {studentName}!
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    if (setShowEditProfileModal) setShowEditProfileModal(true);
                  }}
                  className="btn-3d"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1.5px solid rgba(255, 255, 255, 0.45)',
                    borderRadius: '9999px',
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: 'white',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <span>✏️</span>
                  <span>{isHindi ? 'प्रोफ़ाइल बदलें' : (isBengali ? 'প্রোফাইল' : 'Edit Profile')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Star & Streak HUD Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div
              className="hud-chip-stars"
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#78350F',
                fontWeight: 900,
                fontSize: '1.15rem'
              }}
            >
              <Star size={22} fill="#F59E0B" color="#F59E0B" />
              <span>{starsCount} ⭐</span>
            </div>

            <div
              onClick={() => {
                playPop();
                if (setShowStreakModal) setShowStreakModal(true);
              }}
              className="hud-chip-streak"
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: '#7C2D12',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
              title="Attendance & Streak Calendar"
            >
              <Flame size={20} fill="#EA580C" color="#EA580C" className="animate-pulse" />
              <span>{streakDays}d Streak 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Mascot Mitra's Friendly Interactive Speech Bubble ─────────── */}
      <div
        className="glass-telemetry-panel"
        style={{
          borderRadius: '26px',
          padding: '1.25rem 1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.15rem',
          background: 'rgba(255, 255, 255, 0.92)'
        }}
      >
        <div
          onClick={handleMascotAudio}
          title="Tap Mitra to Listen!"
          className="btn-3d"
          style={{
            width: '62px',
            height: '62px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.3rem',
            cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(79, 70, 229, 0.35)',
            flexShrink: 0
          }}
        >
          🦉
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <div style={{ fontWeight: 900, fontSize: '0.98rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span>{isHindi ? 'मित्रा आपका साथी' : (isBengali ? 'মিত্রা তোমার বন্ধু' : 'Mitra Your Companion')}</span>
              <span style={{ fontSize: '0.72rem', color: '#4F46E5', background: '#EEF2FF', border: '1px solid #C7D2FE', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontWeight: 800 }}>
                {isHindi ? 'बोलने के लिए टैप करें 🔊' : (isBengali ? 'শুনতে ট্যাপ করো 🔊' : 'Tap to Listen 🔊')}
              </span>
            </div>
            <button
              onClick={handleMascotAudio}
              className="btn-3d"
              style={{
                background: '#EEF2FF',
                border: '1.5px solid #C7D2FE',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4F46E5'
              }}
              title="Hear Mitra Speak"
            >
              <Volume2 size={17} />
            </button>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.45, fontWeight: 700 }}>
            {isHindi
              ? `हूट-हूट! आज का दिन सीखने के लिए शानदार है। 3 जादुई द्वीपों पर मिशन आपका इंतज़ार कर रहे हैं!`
              : (isBengali
                ? `হুট-হুট! আজকের দিনটি শেখার জন্য দারুণ। ৩টি জাদুকরী দ্বীপে তোমার নতুন অভিযান অপেক্ষা করছে!`
                : `Hoot-hoot! Your reading brain is getting stronger! 3 Adventure Islands and daily missions are waiting for you!`)}
          </p>
        </div>
      </div>

      {/* ── 3. Today's Star Mission (Personalized AI Quest) ───────────────── */}
      <div
        className="biome-realm-card"
        style={{
          background: recommendation.hasPersonalized
            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          borderRadius: '26px',
          padding: '1.4rem 1.6rem',
          boxShadow: '0 12px 28px rgba(5, 150, 105, 0.28)',
          border: '2px solid rgba(255, 255, 255, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}>{recommendation.icon || '🌟'}</span>
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', color: '#A7F3D0', letterSpacing: '0.06em' }}>
                {isHindi ? '🌟 आज का खास अभियान' : (isBengali ? '🌟 আজকের বিশেষ মিশন' : "🌟 TODAY'S STAR MISSION")}
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0.1rem 0 0', color: 'white' }}>
                {recommendation.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleRecommendedAudio}
            className="btn-3d"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              border: '1.5px solid rgba(255, 255, 255, 0.45)',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
            title="Listen to Mission"
          >
            <Volume2 size={18} />
          </button>
        </div>

        <p style={{ fontSize: '0.94rem', color: '#ECFDF5', margin: 0, lineHeight: 1.5, fontWeight: 700 }}>
          {recommendation.childPrompt}
        </p>

        <button
          onClick={handleLaunchRecommended}
          className="btn-3d btn-3d-amber"
          style={{
            borderRadius: '9999px',
            padding: '0.85rem 1.8rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            width: '100%'
          }}
        >
          <Play size={18} fill="#78350F" color="#78350F" />
          <span>{recommendation.buttonText}</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* ── 4. Daily Mini-Quests (3-Step Interactive Checklist) ─────────── */}
      <div
        className="glass-telemetry-panel"
        style={{
          borderRadius: '26px',
          padding: '1.35rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🎯</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                {isHindi ? 'दैनिक मिनी-क्वेस्ट' : (isBengali ? 'দৈনিক মিনি-কোয়েস্ট' : 'Daily Mini-Quests')}
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.15rem 0 0', fontWeight: 700 }}>
              {isHindi
                ? 'आज के 3 लक्ष्य पूरे करें और बोनस सितारे जीतें!'
                : (isBengali
                  ? 'আজকের ৩টি লক্ষ্য পূরণ করো এবং বোনাস তারা জেতো!'
                  : 'Finish 3 daily goals and claim bonus reward stars!')}
            </p>
          </div>

          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 900,
              color: completedCount === 3 ? '#15803D' : '#4338CA',
              background: completedCount === 3 ? '#DCFCE7' : '#EEF2FF',
              border: completedCount === 3 ? '1.5px solid #86EFAC' : '1.5px solid #C7D2FE',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px'
            }}
          >
            {completedCount}/3 {isHindi ? 'पूर्ण' : (isBengali ? 'সম্পন্ন' : 'Done')}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '10px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.15rem', border: '1px solid #E2E8F0' }}>
          <div
            style={{
              width: `${(completedCount / 3) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
              transition: 'width 0.4s ease',
              borderRadius: '9999px'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Quest 1: Daily Checkin */}
          <div
            onClick={() => toggleQuest('login')}
            className="btn-3d"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.8rem 1rem',
              borderRadius: '18px',
              background: completedDailyQuests.login ? '#F0FDF4' : '#F8FAFC',
              border: completedDailyQuests.login ? '2px solid #86EFAC' : '2px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {completedDailyQuests.login ? (
                <CheckCircle2 size={22} color="#16A34A" />
              ) : (
                <Circle size={22} color="#94A3B8" />
              )}
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: completedDailyQuests.login ? '#166534' : '#1E293B' }}>
                  {isHindi ? 'क्लबहाउस में हाज़िरी' : (isBengali ? 'ক্লাবহাউসে উপস্থিতি' : 'Clubhouse Daily Check-in')}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>
                  {isHindi ? 'सिलसिला जारी रखने के लिए' : (isBengali ? 'ধারাবাহিকতা বজায় রাখতে' : 'Keep your streak alive')}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#D97706', background: '#FEF3C7', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>+1 ⭐</span>
          </div>

          {/* Quest 2: Letter or Sound Mission */}
          <div
            onClick={() => toggleQuest('letterQuest', 'letter-hunter')}
            className="btn-3d"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.8rem 1rem',
              borderRadius: '18px',
              background: completedDailyQuests.letterQuest ? '#F0FDF4' : '#F8FAFC',
              border: completedDailyQuests.letterQuest ? '2px solid #86EFAC' : '2px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {completedDailyQuests.letterQuest ? (
                <CheckCircle2 size={22} color="#16A34A" />
              ) : (
                <Circle size={22} color="#94A3B8" />
              )}
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: completedDailyQuests.letterQuest ? '#166534' : '#1E293B' }}>
                  {isHindi ? '1 अक्षर या ध्वनि खेल खेलें' : (isBengali ? '১টি বর্ণ বা সুরের খেলা খেলো' : 'Conquer 1 Letter or Sound Quest')}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>
                  {isHindi ? 'बाज की नज़र या अक्षर ट्रेन' : (isBengali ? 'ঈগল চোখ বা বর্ণমালা ট্রেন' : 'Eagle Eye or Word Snapper')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#D97706', background: '#FEF3C7', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>+3 ⭐</span>
              <button
                type="button"
                className="btn-3d btn-3d-indigo"
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.76rem'
                }}
              >
                {isHindi ? 'खेलें' : (isBengali ? 'খেলো' : 'Play')}
              </button>
            </div>
          </div>

          {/* Quest 3: Spelling Trap Buster */}
          <div
            onClick={() => toggleQuest('spellingQuest', 'spelling-traps')}
            className="btn-3d"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.8rem 1rem',
              borderRadius: '18px',
              background: completedDailyQuests.spellingQuest ? '#F0FDF4' : '#F8FAFC',
              border: completedDailyQuests.spellingQuest ? '2px solid #86EFAC' : '2px solid #E2E8F0',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {completedDailyQuests.spellingQuest ? (
                <CheckCircle2 size={22} color="#16A34A" />
              ) : (
                <Circle size={22} color="#94A3B8" />
              )}
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: completedDailyQuests.spellingQuest ? '#166534' : '#1E293B' }}>
                  {isHindi ? '1 वर्तनी जाल पकड़ें' : (isBengali ? '১টি বানানের ফাঁদ ধরো' : 'Beat 1 Sneaky Spelling Trap')}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700 }}>
                  {isHindi ? 'FROM vs FORM या जल vs लज' : (isBengali ? 'জল বনাম লজ এর ফাঁদ' : 'Catch tricky letter reversals')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#D97706', background: '#FEF3C7', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>+5 ⭐</span>
              <button
                type="button"
                className="btn-3d btn-3d-amber"
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.76rem'
                }}
              >
                {isHindi ? 'खेलें' : (isBengali ? 'খেলো' : 'Play')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. 3 Magical Adventure Islands (Direct Biome Launch) ───────────── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
              {isHindi ? '🗺️ 3 जादुई सीखने के द्वीप' : (isBengali ? '🗺️ ৩টি জাদুকরী শেখার দ্বীপ' : '🗺️ 3 Magical Learning Islands')}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.15rem 0 0', fontWeight: 700 }}>
              {isHindi
                ? 'अपनी पसंद का द्वीप चुनें और साहसिक यात्रा शुरू करें!'
                : (isBengali
                  ? 'পছন্দের দ্বীপ বেছে নিয়ে মজার অভিযান শুরু করো!'
                  : 'Choose an island kingdom or jump straight into the full map!')}
            </p>
          </div>

          <button
            onClick={() => {
              playPop();
              setCurrentView('games');
            }}
            className="btn-3d btn-3d-indigo"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>{isHindi ? '3D नक्शा खोलें' : (isBengali ? '৩ডি মানচিত্র' : '3D Trail Map')}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.95rem' }}>
          {(ADVENTURE_ISLANDS || []).map((island) => {
            const islandName = isHindi ? island.nameHi : (isBengali ? island.nameBn : island.nameEn);
            const islandSubtitle = isHindi ? island.subtitleHi : (isBengali ? island.subtitleBn : island.subtitleEn);
            const firstMissionId = island.nodes?.[0]?.id || 'letter-hunter';
            const realmNum = island.realmNumber || 1;
            const accentColor = island.accentColor || '#4F46E5';

            return (
              <div
                key={island.id}
                onClick={() => {
                  playStarTwinkle();
                  setCurrentView(firstMissionId);
                }}
                className="biome-realm-card btn-3d"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  border: `2.5px solid ${accentColor}44`,
                  padding: '1.25rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>{island.icon}</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        color: accentColor,
                        background: `${accentColor}18`,
                        border: `1.5px solid ${accentColor}44`,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px'
                      }}
                    >
                      {isHindi ? `मॉड्यूल ${realmNum}` : (isBengali ? `মডিউল ${realmNum}` : `Module ${realmNum}`)}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#1E293B', margin: '0 0 0.3rem' }}>
                    {islandName}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.4, fontWeight: 700 }}>
                    {islandSubtitle}
                  </p>
                </div>

                <div
                  style={{
                    background: `linear-gradient(135deg, ${accentColor} 0%, #312E81 100%)`,
                    color: 'white',
                    padding: '0.6rem',
                    borderRadius: '16px',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <Play size={15} fill="white" color="white" />
                  <span>{isHindi ? 'द्वीप खोलें' : (isBengali ? 'দ্বীপ খোলো' : 'Launch Island')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 6. Interactive "Magic Letter of the Day" Tile ─────────────────── */}
      <div
        className="glass-telemetry-panel"
        style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          border: '2.5px solid #FDE68A',
          borderRadius: '26px',
          padding: '1.3rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem' }}>
          <div
            onClick={handleMagicLetterAudio}
            title="Hear Letter Sound"
            className="candy-tile-3d"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#F59E0B',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.4rem',
              fontWeight: 900,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {currentMagicLetter.letter}
          </div>

          <div>
            <div style={{ fontSize: '0.76rem', fontWeight: 900, textTransform: 'uppercase', color: '#B45309', letterSpacing: '0.06em' }}>
              ✨ {currentMagicLetter.title}
            </div>
            <p style={{ fontSize: '0.88rem', color: '#92400E', margin: '0.2rem 0 0', lineHeight: 1.4, fontWeight: 700 }}>
              {currentMagicLetter.clue}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          <button
            onClick={handleMagicLetterAudio}
            className="btn-3d"
            style={{
              background: 'white',
              border: '2px solid #FDE68A',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#D97706'
            }}
            title="Listen to Sound"
          >
            <Volume2 size={20} />
          </button>

          <button
            onClick={() => {
              playStarTwinkle();
              setCurrentView(currentMagicLetter.targetGame);
            }}
            className="btn-3d btn-3d-amber"
            style={{
              borderRadius: '9999px',
              padding: '0.6rem 1.25rem',
              fontSize: '0.88rem'
            }}
          >
            {isHindi ? 'सुलेख करें ✍️' : (isBengali ? 'আঁকা শিখি ✍️' : 'Trace It ✍️')}
          </button>
        </div>
      </div>

      {/* ── 7. Kid's Trophy & Badges Showcase ────────────────────────────── */}
      <div
        className="glass-telemetry-panel"
        style={{
          borderRadius: '26px',
          padding: '1.35rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.95rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🏆</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1E293B', margin: 0 }}>
                {isHindi ? 'आपकी ट्रॉफियां और पदक' : (isBengali ? 'তোমার ট্রফি ও পদকসমূহ' : 'Your Trophies & Badges')}
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0.15rem 0 0', fontWeight: 700 }}>
              {isHindi
                ? 'किसी भी बैज पर टैप करके अपनी उपलब्धि देखें!'
                : (isBengali
                  ? 'যেকোনো ব্যাজে ট্যাপ করে তোমার গৌরবময় অর্জন দেখো!'
                  : 'Tap any badge to celebrate your reading achievements!')}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
          {BADGES.map((badge) => {
            const bName = isHindi ? badge.nameHi : (isBengali ? badge.nameBn : badge.nameEn);

            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className="btn-3d"
                style={{
                  background: badge.bg,
                  borderRadius: '20px',
                  border: `2px solid ${badge.color}44`,
                  padding: '1rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '2.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>{badge.icon}</span>
                <span style={{ fontSize: '0.84rem', fontWeight: 900, color: badge.color, lineHeight: 1.25 }}>
                  {bName}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#475569', background: 'white', border: `1px solid ${badge.color}33`, padding: '0.15rem 0.55rem', borderRadius: '9999px', fontWeight: 800 }}>
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
              marginTop: '1.15rem',
              background: activeBadgeModal.bg,
              border: `2.5px solid ${activeBadgeModal.color}`,
              borderRadius: '20px',
              padding: '1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '2.2rem' }}>{activeBadgeModal.icon}</span>
              <div>
                <div style={{ fontWeight: 900, fontSize: '0.98rem', color: activeBadgeModal.color }}>
                  {isHindi ? activeBadgeModal.nameHi : (isBengali ? activeBadgeModal.nameBn : activeBadgeModal.nameEn)}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 700 }}>
                  {isHindi ? activeBadgeModal.descHi : (isBengali ? activeBadgeModal.descBn : activeBadgeModal.descEn)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveBadgeModal(null)}
              className="btn-3d"
              style={{
                background: 'white',
                border: '1.5px solid #CBD5E1',
                borderRadius: '9999px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 900,
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
