import React, { useState } from 'react';
import { Play, Sparkles, Star, Volume2, ArrowRight } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAudio } from '../context/AudioContext';

const LEARNING_MODULES = [
  {
    id: 'word-snapper',
    label: 'Phonics Lab',
    icon: '🧩',
    track: 'both',
    levelLabel: 'LEVEL 1: SOUND LAB',
    categoryBadge: 'Multisensory Phonics',
    recommendedTag: 'Universal Core',
    title: 'Word Snapper',
    sampleImage: '🧶',
    sampleWord: 'RUG',
    instruction: 'Tap each letter to hear its name, then blend R · U · G into RUG!',
    tiles: ['R', 'U', 'G'],
    description: 'Snap letter tiles into slots, hear real phoneme sounds, and master b / d / p / q mirror words!'
  },
  {
    id: 'spelling-clinic',
    label: 'Spelling Clinic',
    icon: '🧠',
    track: 'track_b',
    levelLabel: 'LEVEL 2: TRICKY SIGHT WORDS',
    categoryBadge: 'Look-Cover-Write',
    recommendedTag: 'Track B: Dyslexia Support',
    title: 'Spelling Clinic',
    sampleImage: '🤝',
    sampleWord: 'FRIEND',
    instruction: 'Remember: A FRIend is someone you stay with until the END!',
    tiles: ['F', 'R', 'I', 'E', 'N', 'D'],
    description: 'Mnemonic hooks, Look-Cover-Write training, and a 4-line handwriting canvas for dysgraphia support.'
  },
  {
    id: 'abc-fill-in',
    label: 'ABC Fill-In',
    icon: '🔤',
    track: 'both',
    levelLabel: 'LEVEL 3: ALPHABET TRAIN',
    categoryBadge: 'Visual Dyslexia Keyboard',
    recommendedTag: 'Alphabet Flow',
    title: 'ABC Alphabet Train',
    sampleImage: '🚂',
    sampleWord: 'A B [C] D E',
    instruction: 'Restore the missing alphabet wagons using the color-coded visual keyboard!',
    tiles: ['A', 'B', '?', 'D', 'E'],
    description: 'Repair alphabet train wagons with vowel-highlighted dyslexia keyboard and sound feedback.'
  },
  {
    id: 'spelling-traps',
    label: 'Spelling Traps',
    icon: '⚡',
    track: 'track_a',
    levelLabel: 'LEVEL 4: TRANSPOSITION SPOTTER',
    categoryBadge: 'Letter-Swap Traps',
    recommendedTag: 'Track A: Speed & Precision',
    title: 'Spelling Trap Challenge',
    sampleImage: '🎁',
    sampleWord: 'FROM vs FORM',
    instruction: 'Spot sneaky letter-swap traps in fun contextual story sentences!',
    tiles: ['F', 'R', 'O', 'M'],
    description: 'Spot letter-swap traps like FROM/FORM, PLAY/PALY, and GIRL/GRIL.'
  },
  {
    id: 'letter-hunter',
    label: 'Letter Hunter',
    icon: '🎯',
    track: 'track_b',
    levelLabel: 'LEVEL 5: EAGLE EYE GRID',
    categoryBadge: 'Visual Discrimination',
    recommendedTag: 'Track B: Mirror Clarity',
    title: 'Letter Hunter',
    sampleImage: '🦅',
    sampleWord: 'FIND: b',
    instruction: 'Find target letters hidden among tricky mirror letters with combo streaks!',
    tiles: ['b', 'd', 'b', 'p'],
    description: 'Eagle-eye grid quest for subtle visual orientation distinction.'
  },
  {
    id: 'letter-tracing',
    label: 'Letter Tracing',
    icon: '✍️',
    track: 'track_b',
    levelLabel: 'LEVEL 6: MULTISENSORY TRACING',
    categoryBadge: 'Motor Dysgraphia Lab',
    recommendedTag: 'Track B: Tactile Motor',
    title: 'Magic Letter Tracing',
    sampleImage: '✨',
    sampleWord: 'TRACE: b',
    instruction: 'Trace stroke-by-stroke with magnetic guide dots, audio hints, and instant stars!',
    tiles: ['1', '2', '3', '⭐'],
    description: 'Guided directional handwriting canvas with ghost letters and Mitra demonstrations.'
  }
];

export default function GamesHub({ onSelectGame }) {
  const { activeProfile, setCurrentView } = useProfile();
  const { playPop, playStarTwinkle } = useAudio();
  const [activeModuleId, setActiveModuleId] = useState('word-snapper');
  const [trackFilter, setTrackFilter] = useState('all'); // 'all' | 'track_a' | 'track_b'

  const isAtRisk = activeProfile?.riskLevel && activeProfile.riskLevel !== 'typical';
  const filteredModules = LEARNING_MODULES.filter((m) => {
    if (trackFilter === 'all') return true;
    if (trackFilter === 'track_a') return m.track === 'track_a' || m.track === 'both';
    if (trackFilter === 'track_b') return m.track === 'track_b' || m.track === 'both';
    return true;
  });

  const selectedModule = LEARNING_MODULES.find((m) => m.id === activeModuleId) || filteredModules[0] || LEARNING_MODULES[0];

  const handleLaunch = (gameId) => {
    playStarTwinkle();
    if (onSelectGame) {
      onSelectGame(gameId);
    } else {
      setCurrentView(gameId);
    }
  };

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        padding: '0.5rem 0.25rem 2rem'
      }}
    >
      {/* 1. Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #064E3B 100%)',
          color: 'white',
          borderRadius: '28px',
          padding: '1.5rem',
          boxShadow: '0 12px 28px rgba(6, 78, 59, 0.25)'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.18)',
            padding: '0.3rem 0.8rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#D1FAE5',
            marginBottom: '0.85rem',
            letterSpacing: '0.04em'
          }}
        >
          <span>📖</span>
          <span>ADAPTIVE DUAL-TRACK LEARNING LAB</span>
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'white', margin: '0 0 0.4rem', fontFamily: "'Lexend', sans-serif" }}>
          Learning Adventures
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#A7F3D0', lineHeight: 1.45, margin: 0 }}>
          Universal literacy for all kids, with stealth precision for dyslexia support!
        </p>
      </div>

      {/* 2. Personalized Student Adaptive Pathway Banner */}
      <div
        style={{
          background: isAtRisk ? '#FEF3C7' : '#ECFDF5',
          border: isAtRisk ? '1.5px solid #FDE68A' : '1.5px solid #A7F3D0',
          borderRadius: '20px',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <span style={{ fontSize: '1.8rem' }}>{isAtRisk ? '🦉' : '🌟'}</span>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isAtRisk ? '#92400E' : '#065F46' }}>
            {activeProfile?.name || 'Explorer'}'s Pathway: {isAtRisk ? 'Track B (Multisensory Remediation)' : 'Track A (Fluency & Speed)'}
          </div>
          <div style={{ fontSize: '0.75rem', color: isAtRisk ? '#B45309' : '#047857', marginTop: '0.15rem' }}>
            {isAtRisk
              ? 'Tactile letter tracing and b/d mirror discrimination highlighted.'
              : 'Speed reading, sight-word traps, and advanced blends unlocked.'}
          </div>
        </div>
      </div>

      {/* 3. Dual-Track Pathway Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.35rem', background: '#F1F5F9', padding: '0.3rem', borderRadius: '16px' }}>
        <button
          onClick={() => {
            playPop();
            setTrackFilter('all');
          }}
          style={{
            flex: 1,
            border: 'none',
            background: trackFilter === 'all' ? 'white' : 'transparent',
            color: trackFilter === 'all' ? '#1E293B' : '#64748B',
            fontWeight: '800',
            fontSize: '0.75rem',
            padding: '0.5rem 0.4rem',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: trackFilter === 'all' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          🌟 All Games ({LEARNING_MODULES.length})
        </button>
        <button
          onClick={() => {
            playPop();
            setTrackFilter('track_a');
          }}
          style={{
            flex: 1,
            border: 'none',
            background: trackFilter === 'track_a' ? '#EFF6FF' : 'transparent',
            color: trackFilter === 'track_a' ? '#1D4ED8' : '#64748B',
            fontWeight: '800',
            fontSize: '0.75rem',
            padding: '0.5rem 0.4rem',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: trackFilter === 'track_a' ? '0 2px 6px rgba(59,130,246,0.15)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          🚀 Track A: Fluency
        </button>
        <button
          onClick={() => {
            playPop();
            setTrackFilter('track_b');
          }}
          style={{
            flex: 1,
            border: 'none',
            background: trackFilter === 'track_b' ? '#FEF3C7' : 'transparent',
            color: trackFilter === 'track_b' ? '#B45309' : '#64748B',
            fontWeight: '800',
            fontSize: '0.75rem',
            padding: '0.5rem 0.4rem',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: trackFilter === 'track_b' ? '0 2px 6px rgba(245,158,11,0.2)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          🧠 Track B: Multisensory
        </button>
      </div>

      {/* 4. Top Activity Category Pills Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.5rem'
        }}
      >
        {filteredModules.map((mod) => {
          const isActive = mod.id === activeModuleId;
          const isRecommendedForProfile = (isAtRisk && mod.track === 'track_b') || (!isAtRisk && mod.track === 'track_a');
          return (
            <button
              key={mod.id}
              onClick={() => {
                playPop();
                setActiveModuleId(mod.id);
              }}
              style={{
                background: isActive ? '#ECFDF5' : 'white',
                border: isActive ? '2px solid #10B981' : isRecommendedForProfile ? '1.5px solid #FCD34D' : '1.5px solid #E2E8F0',
                borderRadius: '16px',
                padding: '0.65rem 0.4rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.18)' : '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              {isRecommendedForProfile && (
                <span style={{ position: 'absolute', top: '-6px', right: '-4px', background: '#F59E0B', color: 'white', fontSize: '9px', fontWeight: 900, padding: '1px 5px', borderRadius: '9999px' }}>
                  ★ TOP
                </span>
              )}
              <span style={{ fontSize: '1.4rem' }}>{mod.icon}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: isActive ? '#065F46' : '#475569',
                  textAlign: 'center',
                  lineHeight: 1.2
                }}
              >
                {mod.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Active Learning Activity Preview Card */}
      <div
        className="glass-card"
        style={{
          background: 'white',
          borderRadius: '26px',
          padding: '1.5rem',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1rem'
        }}
      >
        {/* Level & Category Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4338CA', textTransform: 'uppercase' }}>
            {selectedModule.levelLabel}
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#EEF2FF', color: '#4F46E5' }}>
            {selectedModule.categoryBadge}
          </span>
        </div>

        {/* Visual Item Illustration */}
        <div style={{ fontSize: '3.5rem', margin: '0.25rem 0' }}>
          {selectedModule.sampleImage}
        </div>

        {/* Word Display */}
        <div
          style={{
            background: '#F8FAFC',
            border: '2px solid #E2E8F0',
            borderRadius: '16px',
            padding: '0.5rem 1.75rem',
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#1E293B',
            fontFamily: "'Lexend', sans-serif",
            letterSpacing: '0.08em'
          }}
        >
          {selectedModule.sampleWord}
        </div>

        <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.45, maxWidth: '400px' }}>
          {selectedModule.instruction}
        </p>

        {/* Letter Tiles Demonstration */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {selectedModule.tiles.map((char, i) => (
            <div
              key={i}
              style={{
                width: '46px',
                height: '56px',
                borderRadius: '14px',
                background: '#EEF2FF',
                border: '2px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#4338CA',
                fontFamily: "'Lexend', sans-serif"
              }}
            >
              {char}
            </div>
          ))}
        </div>

        {/* Play Now CTA Button */}
        <button
          onClick={() => handleLaunch(selectedModule.id)}
          className="animate-pulse-glow"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '9999px',
            padding: '0.85rem',
            fontSize: '1.05rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
            marginTop: '0.5rem'
          }}
        >
          <Play size={20} fill="white" color="white" />
          <span>Launch {selectedModule.title}</span>
        </button>
      </div>
    </div>
  );
}
