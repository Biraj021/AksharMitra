import React from 'react';
import { Play, Sparkles, User, Star, Gamepad2 } from 'lucide-react';
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

  const handleGamesClick = () => {
    playStarTwinkle();
    setCurrentView('games');
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
          maxWidth: '680px',
          width: '100%',
          zIndex: 2
        }}
      >
        {/* Child-Friendly Welcoming Title */}
        <div>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 6vw, 3.4rem)',
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
              fontSize: '1.15rem',
              fontWeight: '600',
              color: '#B45309',
              background: '#FEF3C7',
              padding: '0.35rem 1.25rem',
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
        <div style={{ margin: '0.25rem 0' }}>
          <MascotMitra
            state="talking"
            speechText={
              activeProfile
                ? `Ready for fun, ${activeProfile.name}? Pick a Quest or play in the Games Zone!`
                : "Hi! I am Mitra! Pick a Quest or explore fun Games with me!"
            }
            size="lg"
            showBubble={true}
          />
        </div>

        {/* Dual High-Energy Action Cards: Start Quest & Remediation Games */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            width: '100%',
            maxWidth: '620px'
          }}
        >
          {/* Action 1: Screening Quest */}
          <button
            onClick={handlePlayClick}
            className="animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
              color: 'white',
              borderRadius: '24px',
              border: '3px solid #FFFFFF',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(234, 88, 12, 0.35)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={26} fill="white" color="white" />
              <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '0.02em' }}>
                {activeProfile ? 'START QUEST 🚀' : "LET'S PLAY! 🚀"}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', opacity: 0.95, fontWeight: '600' }}>
              4-Step Phonics & Tracing Adventure
            </span>
          </button>

          {/* Action 2: Remediation Games Hub */}
          <button
            onClick={handleGamesClick}
            className="animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '24px',
              border: '3px solid #FFFFFF',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(5, 150, 105, 0.35)',
              transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gamepad2 size={26} color="white" />
              <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '0.02em' }}>
                GAMES ZONE 🎮
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', opacity: 0.95, fontWeight: '600' }}>
              5 Fun Phonics & Letter Games
            </span>
          </button>
        </div>

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
