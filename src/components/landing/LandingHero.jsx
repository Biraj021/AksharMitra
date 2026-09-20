import React from 'react';
import { Volume2, ArrowRight, Trophy, Flame, Target, Puzzle, Sparkles, Star, Compass } from 'lucide-react';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { getChildRecommendation } from '../../utils/adaptiveLearningStrategy';

export default function LandingHero({ onStartOnboarding, onOpenProfileSelector }) {
  const { activeProfile, setCurrentView, activeLanguage, t, setShowStreakModal, setShowEditProfileModal } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();

  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');
  const studentName = activeProfile?.name || (isHindi ? 'खोजी' : (isBengali ? 'অভিযাত্রী' : 'Explorer'));
  const studentEmoji = getAvatarEmoji(activeProfile?.avatarEmoji || activeProfile?.avatar);
  const starsCount = activeProfile?.stars || 55;
  const streakDays = activeProfile?.streak || 2;

  const recommendation = getChildRecommendation(activeProfile, activeLanguage?.id);

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
    speakText(
      recommendation.childPrompt,
      speechLang
    );
  };

  const handleLaunchScreening = () => {
    playStarTwinkle();
    if (activeProfile) {
      setCurrentView('screening');
    } else {
      onStartOnboarding();
    }
  };

  const handleLaunchGames = () => {
    playStarTwinkle();
    setCurrentView('games');
  };

  const handleDailyTipAudio = () => {
    playPop();
    speakText(
      t('dailyTipDesc'),
      speechLang
    );
  };

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '0.75rem 0.25rem 2rem'
      }}
    >
      {/* 1. Purple Learner Hero Banner Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
          color: 'white',
          borderRadius: '28px',
          padding: '1.5rem',
          boxShadow: '0 12px 28px rgba(79, 70, 229, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top Header inside card: Welcome & Trophy/Stars */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#C7D2FE', fontWeight: 500, marginBottom: '0.2rem' }}>
              {t('welcomeBack')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'white' }}>
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
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: 'white',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.15s ease',
                  backdropFilter: 'blur(4px)'
                }}
                title={isHindi ? 'प्रोफ़ाइल संपादित करें' : (isBengali ? 'প্রোফাইল সম্পাদনা করুন' : 'Edit Profile')}
              >
                <span>✏️</span>
                <span>{isHindi ? 'बदलें' : (isBengali ? 'বদলান' : 'Edit')}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '2.2rem' }}>🏆</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.85rem', fontWeight: 800, color: '#FDE047' }}>
              <span>{starsCount}</span>
              <span>⭐</span>
            </div>
          </div>
        </div>

        {/* Reading Streak Pill with Interactive Attendance Tracker */}
        <div
          onClick={() => {
            playPop();
            if (setShowStreakModal) setShowStreakModal(true);
          }}
          title={isHindi ? 'दैनिक उपस्थिति व सिलसिला कैलेंडर देखें' : (isBengali ? 'উপস্থিতি ও ধারার ক্যালেন্ডার দেখো' : 'View Daily Attendance & Streak Calendar')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(255, 255, 255, 0.22)',
            padding: '0.4rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.84rem',
            fontWeight: 800,
            marginBottom: '1.25rem',
            border: '1.5px solid rgba(255, 255, 255, 0.38)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.32)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
          }}
        >
          <Flame size={18} fill="#F97316" color="#F97316" className="animate-pulse" />
          <span>{streakDays} {t('readingStreak')}</span>
          <span
            style={{
              fontSize: '0.75rem',
              background: 'rgba(255, 255, 255, 0.3)',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: 800,
              marginLeft: '0.2rem'
            }}
          >
            📅 {isHindi ? 'कैलेंडर' : (isBengali ? 'ক্যালেন্ডার' : 'Calendar')}
          </span>
        </div>

        {/* 3 Stat Boxes (Removed for simplicity) */}
      </div>

      {/* 2. Personalized Child Next Adventure Mission Card */}
      <div
        style={{
          background: recommendation.hasPersonalized
            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            : 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)',
          color: 'white',
          borderRadius: '24px',
          padding: '1.25rem 1.35rem',
          boxShadow: '0 10px 24px rgba(5, 150, 105, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{recommendation.icon}</span>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#A7F3D0', letterSpacing: '0.04em' }}>
                {isHindi ? '🌟 आपका अगला अभियान' : (isBengali ? '🌟 তোমার পরবর্তী অভিযান' : '🌟 YOUR NEXT ADVENTURE')}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.1rem 0 0', color: 'white' }}>
                {recommendation.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleRecommendedAudio}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
            title={t('listen')}
          >
            <Volume2 size={16} />
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
            padding: '0.65rem 1.4rem',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span>{recommendation.buttonText}</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* 3. Mitra's Daily Tip Card */}
      <div
        style={{
          background: '#F0F4FF',
          border: '1.5px solid #DBEAFE',
          borderRadius: '24px',
          padding: '1.25rem 1.25rem 1.1rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.04)'
        }}
      >
        <div
          style={{
            fontSize: '2.5rem',
            lineHeight: 1,
            paddingTop: '0.2rem',
            userSelect: 'none'
          }}
        >
          🦉
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
              {t('dailyTipTitle')}
            </h4>
            <button
              onClick={handleDailyTipAudio}
              style={{
                background: 'white',
                border: '1px solid #CBD5E1',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={t('listen')}
            >
              <Volume2 size={15} color="#4F46E5" />
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: 1.45 }}>
            {t('dailyTipDesc')}
          </p>

          <button
            onClick={handleLaunchGames}
            style={{
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.45rem 1.15rem',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            {t('playNow')}
          </button>
        </div>
      </div>

      {/* 3. "Your Adventure Quests" Section */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.85rem' }}>
          {t('screeningIslandTitle')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Card 1: Screening Island */}
          <div
            onClick={handleLaunchScreening}
            style={{
              background: 'white',
              borderRadius: '22px',
              border: '1.5px solid #E2E8F0',
              borderLeft: '5px solid #4F46E5',
              padding: '1.15rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}
              >
                🎯
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    {t('screeningIslandTitle')}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#4338CA',
                      background: '#EEF2FF',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px'
                    }}
                  >
                    3 Rounds
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  {t('screeningIslandSubtitle')}
                </p>
              </div>
            </div>

            <ArrowRight size={20} color="#94A3B8" />
          </div>

          {/* Card 2: Adaptive Learning Lab */}
          <div
            onClick={handleLaunchGames}
            style={{
              background: 'white',
              borderRadius: '22px',
              border: '1.5px solid #E2E8F0',
              borderLeft: '5px solid #10B981',
              padding: '1.15rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  background: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}
              >
                🧩
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    {t('exploreGamesTitle')}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#047857',
                      background: '#D1FAE5',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px'
                    }}
                  >
                    Games Hub
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  {t('exploreGamesSubtitle')}
                </p>
              </div>
            </div>

            <ArrowRight size={20} color="#94A3B8" />
          </div>
        </div>
      </div>
    </div>
  );
}
