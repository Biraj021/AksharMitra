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
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#EEF2FF',
                border: '1.5px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#4F46E5',
                transition: 'all 0.15s ease'
              }}
              title={t('dyslexiaComfort') || 'Dyslexia Comfort & Ruler'}
            >
              <Eye size={18} color="#4F46E5" />
            </button>
          )}

          {/* Sound Toggle (Child Play Route Only) */}
          {isPlayRoute && (
            <button
              onClick={toggleSound}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: soundEnabled ? '#4F46E5' : '#94A3B8',
                transition: 'all 0.15s ease'
              }}
              title={soundEnabled ? t('muteSound') : t('enableSound')}
            >
              {soundEnabled ? <Volume2 size={18} color="#4F46E5" /> : <VolumeX size={18} color="#94A3B8" />}
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
              padding: '0.35rem 0.65rem',
              borderRadius: '9999px',
              border: '1.5px solid #CBD5E1',
              background: '#FFFFFF',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.flagEmoji} {lang.name}
              </option>
            ))}
          </select>

          {/* ── KID SPECIFIC BADGE (Avatar + Kid ID + Stars) ── */}
          {isPlayRoute && activeProfile && (
            <div
              onClick={() => {
                playPop();
                setShowKidPassModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#ECFDF5',
                border: '1.5px solid #86EFAC',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.12)'
              }}
              title="Click to view Kid ID Pass"
            >
              <span style={{ fontSize: '1.25rem' }}>{getAvatarEmoji(activeProfile.avatarEmoji || activeProfile.avatar)}</span>
              <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#14532D' }}>
                {activeProfile.name}
              </span>
              <span style={{ background: '#DCFCE7', color: '#166534', padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 900 }}>
                {activeProfile.kidCode || 'AM-???'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '2px' }}>
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#B45309' }}>
                  {activeProfile.stars ?? 0}
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
                border: '1.5px solid #C7D2FE',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
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
              padding: '0.4rem 0.75rem',
              borderRadius: '9999px',
              border: '1.5px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#64748B',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
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
