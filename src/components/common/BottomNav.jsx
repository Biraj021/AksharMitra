import React from 'react';
import { Home, Compass, BookOpen, BarChart3 } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function BottomNav() {
  const { currentView, setCurrentView } = useProfile();
  const { playPop } = useAudio();

  const navItems = [
    { id: 'landing', label: 'Home', icon: Home, matchViews: ['landing'] },
    { id: 'screening', label: 'Screening', icon: Compass, matchViews: ['screening'] },
    { id: 'games', label: 'Learning', icon: BookOpen, matchViews: ['games', 'word-snapper', 'letter-hunter', 'spelling-clinic', 'spelling-traps', 'abc-fill-in'] },
    { id: 'dashboard', label: 'Insights', icon: BarChart3, matchViews: ['dashboard'] }
  ];

  const handleNav = (id) => {
    playPop();
    setCurrentView(id);
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

        return (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
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
              color: isActive ? '#4F46E5' : '#94A3B8',
              fontWeight: isActive ? '700' : '500',
              fontSize: '0.75rem',
              transition: 'all 0.2s ease',
              position: 'relative',
              borderRadius: '12px'
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} color={isActive ? '#4F46E5' : '#94A3B8'} />
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
