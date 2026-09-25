import React, { useState } from 'react';
import { Rocket, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import AvatarPicker from './AvatarPicker';
import { GRADES, SUPPORTED_LANGUAGES } from '@backend/data/languages';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function StudentForm() {
  const { activeLanguage, setLanguageById, createStudentProfile } = useProfile();
  const { playStarTwinkle, speakText } = useAudio();

  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('sheru');
  const [selectedGrade, setSelectedGrade] = useState('grade2');

  const handleSubmit = (e) => {
    e.preventDefault();
    playStarTwinkle();

    // Trigger joyful confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {}

    const profile = createStudentProfile({
      name: name.trim() || 'Young Explorer',
      avatar: selectedAvatar,
      grade: selectedGrade,
      languageId: activeLanguage.id
    });

    // Voice welcome in English, Bengali, or Hindi
    const speechLang = activeLanguage.id === 'hindi' ? 'hi-IN' : (activeLanguage.id === 'bengali' ? 'bn-IN' : 'en-US');
    const welcomeMsg = activeLanguage.id === 'hindi'
      ? `नमस्ते ${profile.name}! आइए साथ मिलकर खेलें और सीखें!`
      : (activeLanguage.id === 'bengali'
        ? `স্বাগতম ${profile.name}! চলো একসাথে খেলি আর শিখি!`
        : `Welcome ${profile.name}! Let's play and learn together!`);
    speakText(welcomeMsg, speechLang);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem 1.75rem', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: 0 }}>
            Student Profile Setup
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Choose your avatar and begin the adventure
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#FEF3C7', padding: '0.3rem 0.6rem', borderRadius: '9999px', border: '1px solid #FDE68A' }}>
          <Star size={16} fill="#F59E0B" color="#F59E0B" />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#B45309' }}>+10 Welcome Stars</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Child Name Input */}
        <div>
          <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            What is your name?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Leo, Alex, Maya, Aarav"
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              border: '2px solid var(--border-light)',
              background: '#FFFFFF',
              fontSize: '1.1rem',
              fontFamily: 'inherit',
              fontWeight: '600',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary-500)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
          />
        </div>

        {/* Avatar Picker */}
        <AvatarPicker selectedAvatar={selectedAvatar} onSelectAvatar={setSelectedAvatar} />

        {/* Grade Selection Pills */}
        <div>
          <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            Select Class / Grade
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
            {GRADES.map((g) => {
              const isSelected = selectedGrade === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGrade(g.id)}
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                    background: isSelected ? '#EEF2FF' : 'white',
                    color: isSelected ? '#4338CA' : '#334155',
                    fontWeight: isSelected ? '700' : '500',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center'
                  }}
                >
                  <div>{g.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{g.age}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
            Learning Language
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {SUPPORTED_LANGUAGES.map((l) => {
              const isSelected = activeLanguage.id === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLanguageById(l.id)}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '9999px',
                    border: isSelected ? '2px solid #F59E0B' : '1.5px solid #E2E8F0',
                    background: isSelected ? '#FEF3C7' : 'white',
                    color: isSelected ? '#B45309' : '#334155',
                    fontWeight: isSelected ? '700' : '500',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>{l.flagEmoji}</span>
                  <span>{l.name}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({l.script})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Big CTA Button */}
        <button
          type="submit"
          className="btn btn-primary animate-pulse-glow"
          style={{
            marginTop: '0.5rem',
            fontSize: '1.25rem',
            padding: '1rem',
            width: '100%',
            borderRadius: '20px'
          }}
        >
          <Rocket size={22} />
          <span>{activeLanguage.startAdventure || 'Start Adventure 🚀'}</span>
        </button>
      </form>
    </div>
  );
}
