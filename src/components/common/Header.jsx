import React from 'react';
import { Volume2, VolumeX, Shield, Sparkles, Star } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { SUPPORTED_LANGUAGES } from '../../data/languages';

export default function Header() {
  const {
    activeLanguage,
    setLanguageById,
    activeProfile,
    setCurrentView,
    setShowParentModal,
    setShowPitchModal
  } = useProfile();

  const { soundEnabled, setSoundEnabled, playPop } = useAudio();

  const toggleSound = () => {
    playPop();
    setSoundEnabled(!soundEnabled);
  };

  const handleParentClick = () => {
    playPop();
    setShowParentModal(true);
  };

  const handlePitchClick = () => {
    playPop();
    setShowPitchModal(true);
  };

  return (
    <header className="header-nav">
      <div className="header-container">
        {/* Brand Logo */}
        <div
          className="brand-badge"
          onClick={() => {
            playPop();
            setCurrentView('landing');
          }}
        >
          <span className="brand-icon">✨</span>
          <div>
            <h1 className="brand-title">AksharMitra</h1>
            <p className="brand-subtitle">Smart Assistive Dyslexia & Phonics Tech</p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Language Selector Dropdown */}
          <select
            value={activeLanguage.id}
            onChange={(e) => {
              playPop();
              setLanguageById(e.target.value);
            }}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '9999px',
              border: '2px solid var(--border-light)',
              background: 'white',
              fontFamily: 'inherit',
              fontWeight: '600',
              color: 'var(--text-main)',
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

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="btn-secondary btn-pill"
            style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center' }}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 size={18} color="#4F46E5" /> : <VolumeX size={18} color="#94A3B8" />}
          </button>

          {/* Active Profile Info (if active) */}
          {activeProfile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--amber-soft)',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                border: '1.5px solid #F59E0B'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{activeProfile.avatarEmoji || '🦁'}</span>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#B45309' }}>
                {activeProfile.name}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#B45309', fontWeight: 'bold' }}>
                <Star size={14} fill="#F59E0B" color="#F59E0B" />
                <span>{activeProfile.stars || 0}</span>
              </div>
            </div>
          )}

          {/* Parent / Educator Portal Button */}
          <button
            onClick={handleParentClick}
            className="btn-secondary btn-pill"
            style={{
              gap: '0.35rem',
              borderColor: '#C7D2FE',
              background: '#EEF2FF',
              color: '#4338CA'
            }}
            title="Parent / Teacher Companion Portal"
          >
            <Shield size={16} />
            <span style={{ fontSize: '0.85rem' }}>Parent Portal</span>
          </button>

          {/* Pitch & Hackathon Info Modal */}
          <button
            onClick={handlePitchClick}
            className="btn-primary btn-pill"
            style={{
              padding: '0.4rem 0.85rem',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
            }}
            title="Why AksharMitra? Judge Pitch Deck"
          >
            <Sparkles size={16} />
            <span style={{ fontSize: '0.85rem' }}>Judge Deck</span>
          </button>
        </div>
      </div>
    </header>
  );
}
