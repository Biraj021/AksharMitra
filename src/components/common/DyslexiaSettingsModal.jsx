import React from 'react';
import { X, Eye, Type, Palette, MoveHorizontal, Volume2, Sparkles, Check, RotateCcw } from 'lucide-react';
import { useDyslexia, COLOR_TINTS, FONT_OPTIONS } from '../../context/DyslexiaContext';
import { useAudio } from '../../context/AudioContext';

export default function DyslexiaSettingsModal() {
  const { settings, updateSetting, resetSettings, isSettingsOpen, setIsSettingsOpen } = useDyslexia();
  const { playPop, playStarTwinkle } = useAudio();

  if (!isSettingsOpen) return null;

  const handleClose = () => {
    playPop();
    setIsSettingsOpen(false);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '520px',
          padding: '1.5rem',
          borderRadius: '28px',
          background: 'white',
          border: '2px solid #E0E7FF',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4F46E5'
              }}
            >
              <Eye size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Dyslexia & Sensory Comfort
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
                Customize fonts, anti-glare tints, and reading guides
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} color="#64748B" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {/* 1. Color Tint Overlay (Anti-Glare / Scotopic Relief) */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Palette size={16} color="#6366F1" />
              <span>Anti-Glare Visual Tint Overlay</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.5rem' }}>
              {Object.values(COLOR_TINTS).map((tint) => {
                const isSelected = settings.colorTint === tint.id;
                return (
                  <button
                    key={tint.id}
                    onClick={() => {
                      playPop();
                      updateSetting('colorTint', tint.id);
                    }}
                    style={{
                      padding: '0.6rem 0.4rem',
                      borderRadius: '14px',
                      border: isSelected ? '2.5px solid #4F46E5' : '1.5px solid #E2E8F0',
                      background: tint.bg,
                      color: tint.text,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: tint.bg,
                        border: `2px solid ${tint.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isSelected && <Check size={12} color={tint.text} />}
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{tint.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Dyslexia-Optimized Typography */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Type size={16} color="#6366F1" />
              <span>High-Legibility Typeface</span>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {Object.values(FONT_OPTIONS).map((fontOpt) => {
                const isSelected = settings.fontFamily === fontOpt.id;
                return (
                  <button
                    key={fontOpt.id}
                    onClick={() => {
                      playPop();
                      updateSetting('fontFamily', fontOpt.id);
                    }}
                    style={{
                      padding: '0.65rem 0.9rem',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                      background: isSelected ? '#EEF2FF' : '#F8FAFC',
                      color: isSelected ? '#4338CA' : '#1E293B',
                      fontFamily: fontOpt.font,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                      fontWeight: 700
                    }}
                  >
                    <span>{fontOpt.name}</span>
                    {isSelected && <Check size={16} color="#4F46E5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Interactive Reading Ruler Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              background: settings.readingRulerEnabled ? '#FEF3C7' : '#F8FAFC',
              border: settings.readingRulerEnabled ? '1.5px solid #FDE68A' : '1.5px solid #E2E8F0',
              transition: 'all 0.15s ease'
            }}
          >
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E293B' }}>
                📖 Interactive Reading Ruler Focus
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                Highlights active reading lines to prevent line skipping
              </div>
            </div>
            <button
              onClick={() => {
                playPop();
                updateSetting('readingRulerEnabled', !settings.readingRulerEnabled);
              }}
              style={{
                background: settings.readingRulerEnabled ? '#F59E0B' : '#E2E8F0',
                color: settings.readingRulerEnabled ? 'white' : '#64748B',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {settings.readingRulerEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* 4. Letter & Word Spacing */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <MoveHorizontal size={16} color="#6366F1" />
              <span>Crowding Reduction (Letter Spacing)</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'normal', label: 'Standard' },
                { id: 'wide', label: 'Wide (Recommended)' },
                { id: 'extra_wide', label: 'Extra Wide' }
              ].map((spacing) => {
                const isSelected = settings.letterSpacing === spacing.id;
                return (
                  <button
                    key={spacing.id}
                    onClick={() => {
                      playPop();
                      updateSetting('letterSpacing', spacing.id);
                    }}
                    style={{
                      padding: '0.55rem 0.4rem',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #4F46E5' : '1.5px solid #E2E8F0',
                      background: isSelected ? '#EEF2FF' : '#F8FAFC',
                      color: isSelected ? '#4338CA' : '#475569',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {spacing.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Letter-Reversal Mnemonic Badges */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '16px',
              background: '#EEF2FF',
              border: '1.5px solid #C7D2FE'
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3730A3', marginBottom: '0.35rem' }}>
              💡 Letter Reversal Color Anchors
            </div>
            <p style={{ fontSize: '0.75rem', color: '#4338CA', margin: '0 0 0.5rem' }}>
              Distinct sensory colors help children immediately distinguish directional mirror letters:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '8px', background: '#DBEAFE', color: '#1E40AF', fontWeight: 900, fontSize: '1.1rem' }}>b (Blue)</span>
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '8px', background: '#D1FAE5', color: '#065F46', fontWeight: 900, fontSize: '1.1rem' }}>d (Green)</span>
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '8px', background: '#F3E8FF', color: '#6B21A8', fontWeight: 900, fontSize: '1.1rem' }}>p (Purple)</span>
              <span style={{ padding: '0.25rem 0.6rem', borderRadius: '8px', background: '#FEF3C7', color: '#92400E', fontWeight: 900, fontSize: '1.1rem' }}>q (Amber)</span>
            </div>
          </div>
        </div>

        {/* Footer with Reset & Done */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
          <button
            onClick={() => {
              playPop();
              resetSettings();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleClose}
            className="animate-pulse-glow"
            style={{
              background: '#4F46E5',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              padding: '0.5rem 1.4rem',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
            }}
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
