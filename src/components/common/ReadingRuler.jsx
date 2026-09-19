import React, { useState, useEffect } from 'react';
import { useDyslexia } from '../../context/DyslexiaContext';

export default function ReadingRuler() {
  const { settings } = useDyslexia();
  const [mouseY, setMouseY] = useState(250);

  useEffect(() => {
    if (!settings.readingRulerEnabled) return;

    const handleMouseMove = (e) => {
      setMouseY(e.clientY);
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        setMouseY(e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [settings.readingRulerEnabled]);

  if (!settings.readingRulerEnabled) return null;

  const height = settings.rulerHeight || 52;
  const top = mouseY - height / 2;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        overflow: 'hidden'
      }}
    >
      {/* Top Dimmed Mask */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${Math.max(0, top)}px`,
          backgroundColor: 'rgba(15, 23, 42, 0.22)',
          backdropFilter: 'blur(0.5px)',
          transition: 'height 0.05s ease-out'
        }}
      />

      {/* Focus Highlight Band */}
      <div
        style={{
          position: 'absolute',
          top: `${Math.max(0, top)}px`,
          left: 0,
          right: 0,
          height: `${height}px`,
          backgroundColor: 'rgba(254, 240, 138, 0.25)',
          borderTop: '2px solid rgba(245, 158, 11, 0.7)',
          borderBottom: '2px solid rgba(245, 158, 11, 0.7)',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
          transition: 'top 0.05s ease-out'
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#F59E0B',
            color: 'white',
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '9999px',
            letterSpacing: '0.04em'
          }}
        >
          📖 Reading Ruler Focus
        </div>
      </div>

      {/* Bottom Dimmed Mask */}
      <div
        style={{
          position: 'absolute',
          top: `${Math.max(0, top + height)}px`,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.22)',
          backdropFilter: 'blur(0.5px)'
        }}
      />
    </div>
  );
}
