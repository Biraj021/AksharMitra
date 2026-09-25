import React from 'react';
import { Home, Compass, BookOpen, BarChart3, Lock } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function BottomNav() {
  const { currentView, setCurrentView, activeProfile, activeLanguage, t } = useProfile();
  const { playPop, speakText } = useAudio();

  const isScreeningDone = Boolean(activeProfile?.screeningCompleted);
  const isBengali = activeLanguage?.id === 'bengali';
  const isHindi = activeLanguage?.id === 'hindi';
  const speechLang = isHindi ? 'hi-IN' : (isBengali ? 'bn-IN' : 'en-US');

  const navItems = [
    { id: 'landing', label: t('home'), icon: Home, matchViews: ['landing'], locked: !isScreeningDone },
    { id: 'screening', label: t('screening'), icon: Compass, matchViews: ['screening'], locked: false },
    { id: 'games', label: t('learning'), icon: BookOpen, matchViews: ['games', 'word-snapper', 'letter-hunter', 'spelling-clinic', 'spelling-traps', 'abc-fill-in'], locked: !isScreeningDone },
    { id: 'dashboard', label: t('insights'), icon: BarChart3, matchViews: ['dashboard'], locked: !isScreeningDone }
  ];

  const handleNav = (item) => {
    playPop();
    if (item.locked) {
      speakText(
        t('screeningLockedAlert'),
        speechLang
      );
      setCurrentView('screening');
      return;
    }
    setCurrentView(item.id);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '68px',
        background: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 999,
        padding: '0 0.5rem',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)'
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.matchViews.includes(currentView);
        const isLocked = item.locked;

        return (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            title={isLocked ? 'Complete 3-step screening quest first' : item.label}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 16px',
              cursor: 'pointer',
              color: isActive ? '#4F46E5' : isLocked ? '#CBD5E1' : '#94A3B8',
              fontWeight: isActive ? '700' : '500',
              fontSize: '0.75rem',
              transition: 'all 0.2s ease',
              position: 'relative',
              borderRadius: '12px',
              opacity: isLocked ? 0.65 : 1
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} color={isActive ? '#4F46E5' : isLocked ? '#CBD5E1' : '#94A3B8'} />
              {isLocked && (
                <Lock
                  size={10}
                  color="#94A3B8"
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-7px',
                    background: 'white',
                    borderRadius: '50%',
                    padding: '1px'
                  }}
                />
              )}
            </div>
            <span>{item.label}</span>
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  width: '20px',
                  height: '3px',
                  borderRadius: '2px',
                  background: '#4F46E5'
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
