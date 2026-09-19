import React from 'react';
import { Volume2, ArrowRight, Trophy, Flame, Target, Puzzle, Sparkles } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function LandingHero({ onStartOnboarding, onOpenProfileSelector }) {
  const { activeProfile, setCurrentView } = useProfile();
  const { playPop, playStarTwinkle, speakText } = useAudio();

  const studentName = activeProfile?.name || 'Aarav Sharma';
  const studentEmoji = activeProfile?.avatarEmoji || '🦊';
  const starsCount = activeProfile?.stars || 55;
  const streakDays = activeProfile?.streak || 4;

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
    speakText("Great readers make great learners. Let's explore a new story together!");
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
              Welcome back,
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'white', fontFamily: "'Lexend', sans-serif" }}>
              {studentName}! {studentEmoji}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '2.2rem' }}>🏆</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.85rem', fontWeight: 800, color: '#FDE047' }}>
              <span>{starsCount}</span>
              <span>⭐</span>
            </div>
          </div>
        </div>

        {/* Reading Streak Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.18)',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}
        >
          <Flame size={16} fill="#F97316" color="#F97316" />
          <span>{streakDays} Day Reading Streak</span>
        </div>

        {/* 3 Stat Boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '0.75rem 0.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white' }}>
              {activeProfile?.screeningCompleted ? 1 : 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#C7D2FE', fontWeight: 600 }}>Screenings</div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '0.75rem 0.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white' }}>5m</div>
            <div style={{ fontSize: '0.72rem', color: '#C7D2FE', fontWeight: 600 }}>Today</div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              padding: '0.75rem 0.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white' }}>5</div>
            <div style={{ fontSize: '0.72rem', color: '#C7D2FE', fontWeight: 600 }}>Badges</div>
          </div>
        </div>
      </div>

      {/* 2. Mitra's Daily Tip Card */}
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
              Mitra's Daily Tip
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
              title="Hear Daily Tip"
            >
              <Volume2 size={15} color="#4F46E5" />
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: 1.45 }}>
            Great readers make great learners. Let's explore a new story together!
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
            Try 5-Min Game
          </button>
        </div>
      </div>

      {/* 3. "Your Adventure Quests" Section */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', margin: '0 0 0.85rem' }}>
          Your Adventure Quests
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
                    Screening Island
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
                    5-7 Min Game
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  Play the Mirror Letter maze and Rhyme Clap challenge.
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
                    Adaptive Learning Lab
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
                    Level 1-4
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  Phonics sound matcher, multisensory tracing & gentle rewards.
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
