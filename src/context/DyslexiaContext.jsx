import React, { createContext, useContext, useState, useEffect } from 'react';

const DyslexiaContext = createContext(null);

const STORAGE_KEY = 'aksharmitra_dyslexia_settings_v1';

const DEFAULT_SETTINGS = {
  fontFamily: 'lexend', // 'lexend' | 'atkinson' | 'fredoka' | 'system'
  colorTint: 'default', // 'default' | 'cream' | 'mint' | 'sky' | 'peach'
  readingRulerEnabled: false,
  rulerHeight: 48,
  rulerOpacity: 0.18,
  letterSpacing: 'wide', // 'normal' | 'wide' | 'extra_wide'
  lineHeight: 'relaxed', // 'normal' | 'relaxed'
  fontSizeScale: 1.0, // 0.95, 1.0, 1.1, 1.2
  reversalHighlighting: true, // Color highlights b, d, p, q
  bionicReading: false,
  soundEffects: true
};

export const COLOR_TINTS = {
  default: { id: 'default', name: 'Original Off-White', bg: '#FFFDF7', border: '#E2E8F0', text: '#1E293B', card: 'rgba(255, 255, 255, 0.94)' },
  cream: { id: 'cream', name: 'Warm Cream (Anti-Glare)', bg: '#FFFBEB', border: '#FDE68A', text: '#292524', card: '#FEF9C3' },
  mint: { id: 'mint', name: 'Calming Mint Green', bg: '#F0FDF4', border: '#BBF7D0', text: '#14532D', card: '#DCFCE7' },
  sky: { id: 'sky', name: 'Serene Cerulean Sky', bg: '#F0F9FF', border: '#BAE6FD', text: '#0C4A6E', card: '#E0F2FE' },
  peach: { id: 'peach', name: 'Gentle Rose Peach', bg: '#FFF1F2', border: '#FECDD3', text: '#881337', card: '#FFE4E6' }
};

export const FONT_OPTIONS = {
  lexend: { id: 'lexend', name: 'Lexend (Dyslexia Tuned)', font: "'Lexend', sans-serif" },
  atkinson: { id: 'atkinson', name: 'Atkinson (Braille Inst.)', font: "'Atkinson Hyperlegible', sans-serif" },
  fredoka: { id: 'fredoka', name: 'Fredoka (Soft Rounded)', font: "'Fredoka', cursive, sans-serif" }
};

export function DyslexiaProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {}

    // Apply global root CSS variables dynamically
    const root = document.documentElement;

    // Font family
    if (settings.fontFamily === 'atkinson') {
      root.style.setProperty('--font-base', "'Atkinson Hyperlegible', sans-serif");
      root.style.setProperty('--font-dyslexic', "'Atkinson Hyperlegible', sans-serif");
    } else if (settings.fontFamily === 'fredoka') {
      root.style.setProperty('--font-base', "'Fredoka', cursive, sans-serif");
      root.style.setProperty('--font-dyslexic', "'Fredoka', cursive, sans-serif");
    } else {
      root.style.setProperty('--font-base', "'Lexend', sans-serif");
      root.style.setProperty('--font-dyslexic', "'Lexend', sans-serif");
    }

    // Color Tint
    const currentTint = COLOR_TINTS[settings.colorTint] || COLOR_TINTS.default;
    root.style.setProperty('--bg-primary', currentTint.bg);
    root.style.setProperty('--bg-card', currentTint.card);
    root.style.setProperty('--text-main', currentTint.text);
    root.style.setProperty('--border-light', currentTint.border);

    // Letter Spacing
    if (settings.letterSpacing === 'extra_wide') {
      root.style.setProperty('--letter-spacing-custom', '0.08em');
      root.style.setProperty('--word-spacing-custom', '0.18em');
    } else if (settings.letterSpacing === 'wide') {
      root.style.setProperty('--letter-spacing-custom', '0.04em');
      root.style.setProperty('--word-spacing-custom', '0.12em');
    } else {
      root.style.setProperty('--letter-spacing-custom', 'normal');
      root.style.setProperty('--word-spacing-custom', 'normal');
    }

    // Line Height
    if (settings.lineHeight === 'relaxed') {
      root.style.setProperty('--line-height-custom', '1.8');
    } else {
      root.style.setProperty('--line-height-custom', '1.5');
    }

    // Font Scale
    root.style.setProperty('--font-scale-custom', `${settings.fontSizeScale}`);
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <DyslexiaContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        isSettingsOpen,
        setIsSettingsOpen
      }}
    >
      {children}
    </DyslexiaContext.Provider>
  );
}

export const useDyslexia = () => {
  const context = useContext(DyslexiaContext);
  if (!context) {
    throw new Error('useDyslexia must be used within a DyslexiaProvider');
  }
  return context;
};
