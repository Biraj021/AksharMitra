import React from 'react';
import { PlayCircle, ShieldCheck, Sparkles, ArrowRight, Activity, Users } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';
import { DEMO_PROFILES } from '../../data/demoProfiles';

export default function JudgeSandbox() {
  const { loadDemoProfile, setShowPitchModal, setShowParentModal, setCurrentView } = useProfile();
  const { playStarTwinkle, playPop } = useAudio();

  const handleLaunchAarav = () => {
    playStarTwinkle();
    loadDemoProfile('demo_aarav');
  };

  const handleLaunchPriya = () => {
    playStarTwinkle();
    loadDemoProfile('demo_priya');
  };

  const handleDirectScreening = () => {
    playPop();
    setCurrentView('screening');
  };

  return (
    <div
      style={{
        marginTop: '2rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
        color: 'white',
        boxShadow: '0 12px 30px rgba(30, 27, 75, 0.35)',
        border: '2px solid #4338CA'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#FEF08A', margin: 0 }}>
              Judge & Evaluator 1-Click Fast Pass
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#C7D2FE', margin: 0 }}>
              Instant pre-populated sessions to evaluate clinical indicators in &lt; 30 seconds
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            playPop();
            setShowPitchModal(true);
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '9999px',
            padding: '0.35rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
        >
          <Sparkles size={14} color="#FDE047" />
          <span>Why AksharMitra?</span>
        </button>
      </div>

      {/* Preset Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        {/* Aarav Preset */}
        <div
          onClick={handleLaunchAarav}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '16px',
            padding: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🦁 आरव (Aarav)</span>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#DC2626', borderRadius: '9999px', fontWeight: 'bold' }}>
                At-Risk Flagged
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#E0E7FF', margin: 0 }}>
              Devanagari reversal on <strong>ब vs भ</strong> + reading hesitation.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#FDE047', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.75rem' }}>
            <span>View Aarav's Report</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Priya Preset */}
        <div
          onClick={handleLaunchPriya}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            padding: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🦚 प्रिया (Priya)</span>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#059669', borderRadius: '9999px', fontWeight: 'bold' }}>
                Typical Bench
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#E0E7FF', margin: 0 }}>
              Age-appropriate fluency, zero motor reversal, high phonics.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6EE7B7', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.75rem' }}>
            <span>View Priya's Report</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Live Screening Quests */}
        <div
          onClick={handleDirectScreening}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(99, 102, 241, 0.5)',
            borderRadius: '16px',
            padding: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🎮 Live Quests</span>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#4F46E5', borderRadius: '9999px', fontWeight: 'bold' }}>
                Play Mode
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#E0E7FF', margin: 0 }}>
              Test Canvas Tracing, Read-Aloud Speech & Rhyme Clapping.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#A5B4FC', fontSize: '0.8rem', fontWeight: 'bold', marginTop: '0.75rem' }}>
            <span>Start Fresh Screening</span>
            <PlayCircle size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
