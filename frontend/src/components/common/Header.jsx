import React, { useState } from 'react';
import { Volume2, VolumeX, Star, Globe, Eye, LogOut, KeyRound, Copy, Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { useDyslexia } from '../../context/DyslexiaContext';
import { SUPPORTED_LANGUAGES } from '@backend/data/languages';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPlayRoute = location.pathname.startsWith('/play');
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  const {
    currentUser,
    userRole,
    activeLanguage,
    setLanguageById,
    activeProfile,
    setCurrentView,
    logoutUser,
    t
  } = useProfile();

  const { soundEnabled, setSoundEnabled, playPop, playStarTwinkle } = useAudio();
  const { setIsSettingsOpen } = useDyslexia();

  const [showKidPassModal, setShowKidPassModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSound = () => {
    playPop();
    setSoundEnabled(!soundEnabled);
  };

  const openDyslexiaSettings = () => {
    playPop();
    setIsSettingsOpen(true);
  };

  const handleCopyCode = () => {
    if (activeProfile?.kidCode) {
      navigator.clipboard?.writeText(activeProfile.kidCode);
      setCopied(true);
      playStarTwinkle();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExit = () => {
    playPop();
    logoutUser();
    navigate('/auth');
  };

  return (
    <header className="header-nav" style={{ padding: '0.65rem 1rem', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="header-container" style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo & Context Title */}
        <div
          onClick={() => {
            playPop();
            if (isPlayRoute && activeProfile) {
              setCurrentView(activeProfile.ageBand !== '2-4' && !activeProfile.screeningCompleted ? 'screening' : 'landing');
            } else if (isDashboardRoute) {
              navigate('/dashboard');
            }
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '13px',
              background: isPlayRoute
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: isPlayRoute ? '0 4px 10px rgba(16, 185, 129, 0.25)' : '0 4px 10px rgba(79, 70, 229, 0.25)'
            }}
          >
            🦉
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#1E293B', letterSpacing: '-0.01em' }}>
              AksharMitra
            </h1>
            <p style={{ fontSize: '0.72rem', color: isPlayRoute ? '#059669' : '#4F46E5', margin: 0, fontWeight: 700 }}>
              {isPlayRoute ? '🎮 Student Game Zone' : (isDashboardRoute ? '👩‍🏫 Educator Dashboard' : t('appSubtitle'))}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          
          {/* Dyslexia Sensory Comfort Toggle (Child Play Route Only) */}
          {isPlayRoute && (
            <button
              onClick={openDyslexiaSettings}
              style={{
                height: '42px',
                padding: '0 0.85rem',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                border: '2px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                color: '#4338CA',
                fontWeight: 800,
                fontSize: '0.82rem',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.15)';
              }}
              title={t('dyslexiaComfort') || 'Dyslexia Reading Ruler & Comfort Mode'}
            >
              <Eye size={17} color="#4F46E5" />
              <span style={{ display: 'inline' }}>Reading Helper</span>
            </button>
          )}

          {/* Sound Toggle (Child Play Route Only) */}
          {isPlayRoute && (
            <button
              onClick={toggleSound}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: soundEnabled ? '#F0FDF4' : '#F8FAFC',
                border: soundEnabled ? '2px solid #86EFAC' : '2px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: soundEnabled ? '#16A34A' : '#94A3B8',
                boxShadow: soundEnabled ? '0 2px 8px rgba(22, 163, 74, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
              title={soundEnabled ? t('muteSound') : t('enableSound')}
            >
              {soundEnabled ? <Volume2 size={19} color="#16A34A" /> : <VolumeX size={19} color="#94A3B8" />}
            </button>
          )}

          {/* Language Selector */}
          <select
            value={activeLanguage.id}
            onChange={(e) => {
              playPop();
              setLanguageById(e.target.value);
            }}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '9999px',
              border: '2px solid #CBD5E1',
              background: '#FFFFFF',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.flagEmoji} {lang.name}
              </option>
            ))}
          </select>

          {/* ── KID SPECIFIC BADGES (Streak Fire + Stars XP + Avatar Pass) ── */}
          {isPlayRoute && activeProfile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              
              {/* Daily Streak Flame Pill */}
              <div
                onClick={() => {
                  playPop();
                  setShowKidPassModal(true);
                }}
                className="hud-chip hud-chip-streak"
                style={{ cursor: 'pointer' }}
                title="Daily Reading Streak"
              >
                <span className="flame-pulsing" style={{ fontSize: '1.1rem' }}>🔥</span>
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{activeProfile.streak || 1}d</span>
              </div>

              {/* Star XP Glow Pill */}
              <div
                className="hud-chip hud-chip-stars"
                style={{ cursor: 'pointer' }}
                title="Stars Collected in Quests"
              >
                <Star size={15} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
                  {activeProfile.stars ?? 0}
                </span>
              </div>

              {/* Avatar Pass Pill */}
              <div
                onClick={() => {
                  playPop();
                  setShowKidPassModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#FFFFFF',
                  border: '2px solid #86EFAC',
                  padding: '0.25rem 0.75rem 0.25rem 0.35rem',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.15)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                title="Click to view Kid Explorer Pass"
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}
                >
                  {getAvatarEmoji(activeProfile.avatarEmoji || activeProfile.avatar)}
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#14532D' }}>
                  {activeProfile.name}
                </span>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                  {activeProfile.kidCode || 'AM-???'}
                </span>
              </div>
            </div>
          )}

          {/* ── TEACHER SPECIFIC BADGE ── */}
          {isDashboardRoute && currentUser && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#EEF2FF',
                border: '2px solid #C7D2FE',
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#312E81'
              }}
            >
              <span>👩‍🏫</span>
              <span>{currentUser.name || 'Educator'}</span>
            </div>
          )}

          {/* ── EXIT / LOGOUT BUTTON ── */}
          <button
            onClick={handleExit}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              border: '2px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#64748B',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FEE2E2';
              e.currentTarget.style.borderColor = '#FECACA';
              e.currentTarget.style.color = '#DC2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F8FAFC';
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.color = '#64748B';
            }}
            title="Log Out & Switch Portal Role"
          >
            <LogOut size={14} />
            <span>Exit</span>
          </button>
        </div>
      </div>

      {/* Kid ID Pass Card Modal */}
      {showKidPassModal && activeProfile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowKidPassModal(false)}
        >
          <div
            className="glass-card"
            style={{
              background: '#FFFFFF',
              borderRadius: '28px',
              padding: '2rem 1.75rem',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '24px',
                background: '#DCFCE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.8rem',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)'
              }}
            >
              {getAvatarEmoji(activeProfile.avatarEmoji || activeProfile.avatar)}
            </div>

            <div>
              <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 900, color: '#1E293B' }}>
                {activeProfile.name}'s Kid Pass
              </h3>
              <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem' }}>
                Give this Kid ID to your teacher so they can see all your game scores!
              </p>
            </div>

            <div
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                border: '2px dashed #6366F1',
                borderRadius: '18px',
                padding: '1.25rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                YOUR UNIQUE KID ID
              </span>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#312E81', letterSpacing: '0.08em' }}>
                {activeProfile.kidCode || 'AM-???'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                style={{
                  marginTop: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  border: 'none',
                  background: copied ? '#16A34A' : '#4F46E5',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowKidPassModal(false)}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '16px',
                background: '#16A34A',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Back to Game 🚀
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
