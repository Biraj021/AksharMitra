import React from 'react';
import { ArrowLeft, Sparkles, Play } from 'lucide-react';
import MascotMitra from '../common/MascotMitra';
import { useProfile } from '../../context/ProfileContext';
import { useAudio } from '../../context/AudioContext';

export default function ScreeningContainer() {
  const { activeProfile, setCurrentView, activeLanguage } = useProfile();
  const { playPop, playStarTwinkle } = useAudio();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <button
        onClick={() => {
          playPop();
          setCurrentView('landing');
        }}
        className="btn-secondary btn-pill"
        style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
      >
        <ArrowLeft size={16} />
        <span>मुख्य पृष्ठ (Back)</span>
      </button>

      <div className="glass-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', borderRadius: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <MascotMitra
            state="celebrating"
            speechText={`शाबाश ${activeProfile?.name || 'दोस्त'}! चलो 3 जादुई पहेलियां सुलझाते हैं!`}
            size="md"
            showBubble={true}
          />
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          ✨ अक्षरों की जादुई यात्रा (Magic Letter Quest)
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
          We are preparing 3 playful mini-games for <strong>{activeLanguage.name}</strong>: Canvas Tracing (Akshar Rekha), Read-Aloud Fluency (Bol Mitra Bol), and Rhythm Clapping (Dhwani Shikaar).
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              playStarTwinkle();
              setCurrentView('dashboard');
            }}
            className="btn btn-primary"
            style={{ borderRadius: '9999px' }}
          >
            <Sparkles size={18} />
            <span>View Sample Screening Results (Aarav)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
