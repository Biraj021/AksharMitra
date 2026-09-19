import React from 'react';
import { Volume2, VolumeX, Star, Globe, Eye } from 'lucide-react';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { useDyslexia } from '../../context/DyslexiaContext';
import { SUPPORTED_LANGUAGES } from '../../data/languages';

export default function Header({ onOpenProfileSelector }) {
  const {
    activeLanguage,
    setLanguageById,
    activeProfile,
    setCurrentView
  } = useProfile();

  const { soundEnabled, setSoundEnabled, playPop } = useAudio();
  const { setIsSettingsOpen } = useDyslexia();

  const toggleSound = () => {
    playPop();
    setSoundEnabled(!soundEnabled);
  };

  const openDyslexiaSettings = () => {
    playPop();
    setIsSettingsOpen(true);
  };

  return (
    <header className="header-nav" style={{ padding: '0.6rem 1rem', background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
      <div className="header-container" style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo with Owl Squircle */}
        <div
          onClick={() => {
            playPop();
            setCurrentView(activeProfile && !activeProfile.screeningCompleted ? 'screening' : 'landing');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
            }}
          >
            🦉
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#1E293B', fontFamily: "'Lexend', sans-serif", letterSpacing: '-0.01em' }}>
              AksharMitra
            </h1>
            <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0, fontWeight: 600 }}>
              Assistive Tech for Dyslexia
            </p>
          </div>
        </div>

        {/* Header Right Actions: Dyslexia Comfort, Sound Toggle, Language, Avatar/Stars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Dyslexia Sensory / Accessibility Toggle */}
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
            title="Dyslexia & Sensory Comfort Settings"
          >
            <Eye size={18} color="#4F46E5" />
          </button>

          {/* Sound Toggle Circle Button */}
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
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 size={18} color="#4F46E5" /> : <VolumeX size={18} color="#94A3B8" />}
          </button>

          {/* Language Selector Dropdown */}
          <select
            value={activeLanguage.id}
            onChange={(e) => {
              playPop();
              setLanguageById(e.target.value);
            }}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '9999px',
              border: '1.5px solid #E2E8F0',
              background: '#F8FAFC',
              fontFamily: 'inherit',
              fontWeight: '600',
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

          {/* Star & Avatar Pill or Login Prompt */}
          {activeProfile ? (
            <div
              onClick={() => {
                playPop();
                if (onOpenProfileSelector) onOpenProfileSelector();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#FEF3C7',
                border: '1.5px solid #FDE68A',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(245, 158, 11, 0.12)'
              }}
              title="Switch profile or view stats"
            >
              <span style={{ fontSize: '1.15rem' }}>{getAvatarEmoji(activeProfile.avatarEmoji || activeProfile.avatar)}</span>
              <Star size={16} fill="#F59E0B" color="#F59E0B" />
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#B45309' }}>
                {activeProfile.stars || 15}
              </span>
            </div>
          ) : (
            <button
              onClick={() => {
                playPop();
                setCurrentView('login');
              }}
              className="btn btn-primary"
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 800
              }}
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
