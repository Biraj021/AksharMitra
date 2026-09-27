import React from 'react';
import { Home, Compass, BookOpen, Lock } from 'lucide-react';
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
    { id: 'games', label: t('learning'), icon: BookOpen, matchViews: ['games', 'word-snapper', 'letter-hunter', 'spelling-clinic', 'spelling-traps', 'abc-fill-in'], locked: !isScreeningDone }
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
    <nav className="floating-dock-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.matchViews.includes(currentView);
        const isLocked = item.locked;

        return (
          <button
            key={item.id}
            onClick={() => handleNav(item)}
            title={isLocked ? 'Complete 3-step screening quest first' : item.label}
            className={`dock-item ${isActive ? 'active' : ''}`}
            style={{
              opacity: isLocked ? 0.6 : 1,
              cursor: 'pointer'
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2px' }}>
              <Icon size={20} strokeWidth={isActive ? 2.6 : 2} color={isActive ? '#FFFFFF' : isLocked ? '#94A3B8' : '#64748B'} />
              {isLocked && (
                <Lock
                  size={11}
                  color="#EF4444"
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-8px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '50%',
                    padding: '1px'
                  }}
                />
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
