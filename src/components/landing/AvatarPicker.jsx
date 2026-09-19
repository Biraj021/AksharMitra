import React from 'react';
import { AVATARS } from '../../data/languages';
import { useAudio } from '../../context/AudioContext';

export default function AvatarPicker({ selectedAvatar, onSelectAvatar }) {
  const { playPop } = useAudio();

  return (
    <div>
      <label style={{ display: 'block', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
        Choose Your Magical Avatar ✨
      </label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.6rem'
        }}
      >
        {AVATARS.map((av) => {
          const isSelected = selectedAvatar === av.id;
          return (
            <div
              key={av.id}
              onClick={() => {
                playPop();
                onSelectAvatar(av.id);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.6rem 0.3rem',
                borderRadius: '16px',
                background: isSelected ? av.color : 'white',
                border: isSelected ? `2.5px solid ${av.border}` : '1.5px solid #E2E8F0',
                cursor: 'pointer',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isSelected ? '0 6px 16px rgba(99, 102, 241, 0.2)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <span style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>{av.emoji}</span>
              <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#1E293B', textAlign: 'center' }}>
                {av.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
