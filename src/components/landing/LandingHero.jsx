import React from 'react';
import { Play, Sparkles, User, Star } from 'lucide-react';
import MascotMitra from '../common/MascotMitra';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function LandingHero({ onStartOnboarding, onOpenProfileSelector }) {
  const { activeLanguage, activeProfile, setCurrentView } = useProfile();
  const { playStarTwinkle, playPop, playChime } = useAudio();

  const handlePlayClick = () => {
    playStarTwinkle();
    if (activeProfile) {
      setCurrentView('screening');
    } else {
      onStartOnboarding();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '75vh',
        textAlign: 'center',
        position: 'relative',
        padding: '1rem 0'
      }}
    >
      {/* Playful Floating Sparkles Background */}
      <div style={{ position: 'absolute', top: '5%', left: '10%', fontSize: '2rem', animation: 'float 3s infinite ease-in-out', pointerEvents: 'none', opacity: 0.7 }}>
        ⭐
      </div>
      <div style={{ position: 'absolute', top: '15%', right: '12%', fontSize: '1.8rem', animation: 'float 4s infinite ease-in-out', animationDelay: '1s', pointerEvents: 'none', opacity: 0.7 }}>
        🎈
      </div>
      <div style={{ position: 'absolute', bottom: '15%', left: '12%', fontSize: '2rem', animation: 'gentle-bounce 3.5s infinite ease-in-out', pointerEvents: 'none', opacity: 0.6 }}>
        🎨
      </div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', fontSize: '2.2rem', animation: 'float 3.2s infinite ease-in-out', animationDelay: '0.5s', pointerEvents: 'none', opacity: 0.7 }}>
        ✨
      </div>

      {/* Main Friendly Play Zone */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          maxWidth: '520px',
          width: '100%',
          zIndex: 2
        }}
      >
        {/* Child-Friendly Welcoming Title */}
        <div>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 3.2rem)',
              fontWeight: '700',
              color: '#4F46E5',
              margin: '0 0 0.35rem',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 12px rgba(79, 70, 229, 0.15)'
            }}
          >
            AksharMitra
          </h1>
          <p
            style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#B45309',
              background: '#FEF3C7',
              padding: '0.35rem 1rem',
              borderRadius: '9999px',
              display: 'inline-block',
              margin: 0,
              border: '1.5px solid #FDE68A'
            }}
          >
            {activeProfile ? `Welcome back, ${activeProfile.name}! 👋` : "Let's Play with Words & Sounds! 🎈"}
          </p>
        </div>

        {/* Big Huggable Mitra Mascot */}
        <div style={{ margin: '0.5rem 0' }}>
          <MascotMitra
            state="talking"
            speechText={
              activeProfile
                ? `Ready for more fun quests, ${activeProfile.name}? Click PLAY!`
                : "Hi! I am Mitra! Tap PLAY to start our magical game!"
            }
            size="lg"
            showBubble={true}
          />
        </div>

        {/* Big Tempting PLAY Button */}
        <button
          onClick={handlePlayClick}
          className="btn btn-amber animate-pulse-glow"
          style={{
            fontSize: '1.75rem',
            padding: '1.25rem 3.5rem',
            borderRadius: '9999px',
            border: '4px solid #FFFFFF',
            boxShadow: '0 12px 28px rgba(245, 158, 11, 0.5), 0 4px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            cursor: 'pointer',
            transform: 'scale(1.05)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        >
          <Play size={32} fill="white" color="white" />
          <span style={{ fontWeight: '800', letterSpacing: '0.04em' }}>
            {activeProfile ? 'PLAY NOW 🚀' : "LET'S PLAY! 🚀"}
          </span>
        </button>

        {/* Profile Switcher / Who is Playing? */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          {activeProfile ? (
            <div
              onClick={() => {
                playPop();
                onOpenProfileSelector();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'white',
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                border: '2px solid #E2E8F0',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{activeProfile.avatarEmoji || '🦁'}</span>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1E293B' }}>
                {activeProfile.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6366F1', fontWeight: 'bold' }}>
                (Switch)
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                playPop();
                onOpenProfileSelector();
              }}
              style={{
                background: 'white',
                border: '2px solid #E0E7FF',
                color: '#4338CA',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.08)'
              }}
            >
              <User size={16} />
              <span>Who is Playing? (Profiles)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
