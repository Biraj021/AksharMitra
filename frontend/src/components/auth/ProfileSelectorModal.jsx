import React from 'react';
import { X, UserPlus, Star, ArrowRight, LogOut, CheckCircle } from 'lucide-react';
import { useProfile, getAvatarEmoji } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function ProfileSelectorModal({ isOpen, onClose, onAddNew }) {
  const { activeProfile, profilesList, switchProfile, logoutProfile, setCurrentView, setShowEditProfileModal, t } = useProfile();
  const { playPop, playStarTwinkle } = useAudio();

  if (!isOpen) return null;

  const handleSelectProfile = (profile) => {
    playStarTwinkle();
    switchProfile(profile.id);
    onClose();
  };

  const handleLogout = () => {
    playPop();
    onClose();
    logoutProfile();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{t('chooseProfile')}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {t('chooseProfileDesc')}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', maxHeight: '300px', overflowY: 'auto' }}>
          {profilesList.map((p) => {
            const isCurrent = activeProfile?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleSelectProfile(p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '16px',
                  border: isCurrent ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                  background: isCurrent ? '#EEF2FF' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>{getAvatarEmoji(p.avatarEmoji || p.avatar)}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '1rem', color: '#1E293B' }}>
                        {p.name}
                      </span>
                      {isCurrent && (
                        <span style={{ fontSize: '0.7rem', background: '#4F46E5', color: 'white', padding: '0.15rem 0.45rem', borderRadius: '9999px', fontWeight: 'bold' }}>
                          {t('active')}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {p.ageBand === '2-4'
                        ? '🐣 Little Explorer (2–4)'
                        : `${p.gradeLabel || 'Grade 2'} • ${p.stars || 15} ⭐ • ${p.screeningCompleted ? t('screened') : t('ready')}`}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playPop();
                      switchProfile(p.id);
                      if (setShowEditProfileModal) setShowEditProfileModal(true);
                      onClose();
                    }}
                    style={{
                      background: isCurrent ? '#E0E7FF' : '#F1F5F9',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.35rem 0.55rem',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isCurrent ? '#4338CA' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                    title={t('edit') || 'Edit Profile'}
                  >
                    ✏️
                  </button>
                  <ArrowRight size={18} color={isCurrent ? '#4F46E5' : '#94A3B8'} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dual Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => {
              playPop();
              onClose();
              if (onAddNew) onAddNew();
            }}
            className="btn btn-secondary"
            style={{ width: '100%', borderRadius: '16px', borderColor: '#C7D2FE', color: '#4338CA', background: '#EEF2FF' }}
          >
            <UserPlus size={18} />
            <span>{t('addNewStudent')}</span>
          </button>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.65rem',
              borderRadius: '16px',
              border: '1.5px solid #E2E8F0',
              background: '#F8FAFC',
              color: '#64748B',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            <span>{t('logoutSwitch')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
