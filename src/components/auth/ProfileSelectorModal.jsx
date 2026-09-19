import React from 'react';
import { X, UserPlus, Star, ArrowRight, Check } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { DEMO_PROFILES } from '../../data/demoProfiles';

export default function ProfileSelectorModal({ isOpen, onClose, onAddNew }) {
  const { activeProfile, setActiveProfile, setCurrentView, loadDemoProfile } = useProfile();
  const { playPop, playStarTwinkle } = useAudio();

  if (!isOpen) return null;

  const handleSelectProfile = (profile) => {
    playStarTwinkle();
    setActiveProfile(profile);
    onClose();
    setCurrentView(profile.screeningCompleted ? 'dashboard' : 'screening');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Choose Profile</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Select an existing explorer or add a new learner
            </p>
          </div>
          <button
            onClick={() => {
              playPop();
              onClose();
            }}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {/* Active Profile if present */}
          {activeProfile && (
            <div
              onClick={() => handleSelectProfile(activeProfile)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '16px',
                border: '2px solid #4F46E5',
                background: '#EEF2FF',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{activeProfile.avatarEmoji || '🦁'}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1E293B' }}>
                      {activeProfile.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: '#4F46E5', color: 'white', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 'bold' }}>
                      Current
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {activeProfile.gradeLabel || 'Grade 2'} • {activeProfile.stars || 0} ⭐
                  </span>
                </div>
              </div>
              <ArrowRight size={18} color="#4F46E5" />
            </div>
          )}

          {/* Demo Profiles */}
          {DEMO_PROFILES.filter(p => p.id !== activeProfile?.id).map((demo) => (
            <div
              key={demo.id}
              onClick={() => handleSelectProfile(demo)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#94A3B8')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E2E8F0')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{demo.avatarEmoji}</span>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1E293B', display: 'block' }}>
                    {demo.name}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {demo.gradeLabel} • {demo.stars} ⭐ • {demo.riskLevel === 'elevated' ? 'Flagged' : 'Typical'}
                  </span>
                </div>
              </div>
              <ArrowRight size={18} color="#94A3B8" />
            </div>
          ))}
        </div>

        {/* Add New Profile Button */}
        <button
          onClick={() => {
            playPop();
            onAddNew();
          }}
          className="btn btn-secondary"
          style={{ width: '100%', borderRadius: '16px', borderColor: '#C7D2FE', color: '#4338CA', background: '#EEF2FF' }}
        >
          <UserPlus size={18} />
          <span>Add New Explorer Profile</span>
        </button>
      </div>
    </div>
  );
}
